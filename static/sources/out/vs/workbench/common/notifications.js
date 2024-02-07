/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/notification/common/notification", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/linkedText", "vs/base/common/map"], function (require, exports, notification_1, errorMessage_1, event_1, lifecycle_1, errors_1, actions_1, arrays_1, linkedText_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChoiceAction = exports.NotificationViewItem = exports.NotificationViewItemProgress = exports.NotificationViewItemContentChangeKind = exports.isNotificationViewItem = exports.NotificationsModel = exports.NotificationHandle = exports.StatusMessageChangeType = exports.NotificationChangeType = void 0;
    var NotificationChangeType;
    (function (NotificationChangeType) {
        /**
         * A notification was added.
         */
        NotificationChangeType[NotificationChangeType["ADD"] = 0] = "ADD";
        /**
         * A notification changed. Check `detail` property
         * on the event for additional information.
         */
        NotificationChangeType[NotificationChangeType["CHANGE"] = 1] = "CHANGE";
        /**
         * A notification expanded or collapsed.
         */
        NotificationChangeType[NotificationChangeType["EXPAND_COLLAPSE"] = 2] = "EXPAND_COLLAPSE";
        /**
         * A notification was removed.
         */
        NotificationChangeType[NotificationChangeType["REMOVE"] = 3] = "REMOVE";
    })(NotificationChangeType || (exports.NotificationChangeType = NotificationChangeType = {}));
    var StatusMessageChangeType;
    (function (StatusMessageChangeType) {
        StatusMessageChangeType[StatusMessageChangeType["ADD"] = 0] = "ADD";
        StatusMessageChangeType[StatusMessageChangeType["REMOVE"] = 1] = "REMOVE";
    })(StatusMessageChangeType || (exports.StatusMessageChangeType = StatusMessageChangeType = {}));
    class NotificationHandle extends lifecycle_1.Disposable {
        constructor(item, onClose) {
            super();
            this.item = item;
            this.onClose = onClose;
            this._onDidClose = this._register(new event_1.Emitter());
            this.onDidClose = this._onDidClose.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this.registerListeners();
        }
        registerListeners() {
            // Visibility
            this._register(this.item.onDidChangeVisibility(visible => this._onDidChangeVisibility.fire(visible)));
            // Closing
            event_1.Event.once(this.item.onDidClose)(() => {
                this._onDidClose.fire();
                this.dispose();
            });
        }
        get progress() {
            return this.item.progress;
        }
        updateSeverity(severity) {
            this.item.updateSeverity(severity);
        }
        updateMessage(message) {
            this.item.updateMessage(message);
        }
        updateActions(actions) {
            this.item.updateActions(actions);
        }
        close() {
            this.onClose(this.item);
            this.dispose();
        }
    }
    exports.NotificationHandle = NotificationHandle;
    class NotificationsModel extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeNotification = this._register(new event_1.Emitter());
            this.onDidChangeNotification = this._onDidChangeNotification.event;
            this._onDidChangeStatusMessage = this._register(new event_1.Emitter());
            this.onDidChangeStatusMessage = this._onDidChangeStatusMessage.event;
            this._onDidChangeFilter = this._register(new event_1.Emitter());
            this.onDidChangeFilter = this._onDidChangeFilter.event;
            this._notifications = [];
            this.filter = {
                global: notification_1.NotificationsFilter.OFF,
                sources: new Map()
            };
        }
        static { this.NO_OP_NOTIFICATION = new notification_1.NoOpNotification(); }
        get notifications() { return this._notifications; }
        get statusMessage() { return this._statusMessage; }
        setFilter(filter) {
            let globalChanged = false;
            if (typeof filter.global === 'number') {
                globalChanged = this.filter.global !== filter.global;
                this.filter.global = filter.global;
            }
            let sourcesChanged = false;
            if (filter.sources) {
                sourcesChanged = !(0, map_1.mapsStrictEqualIgnoreOrder)(this.filter.sources, filter.sources);
                this.filter.sources = filter.sources;
            }
            if (globalChanged || sourcesChanged) {
                this._onDidChangeFilter.fire({
                    global: globalChanged ? filter.global : undefined,
                    sources: sourcesChanged ? filter.sources : undefined
                });
            }
        }
        addNotification(notification) {
            const item = this.createViewItem(notification);
            if (!item) {
                return NotificationsModel.NO_OP_NOTIFICATION; // return early if this is a no-op
            }
            // Deduplicate
            const duplicate = this.findNotification(item);
            duplicate?.close();
            // Add to list as first entry
            this._notifications.splice(0, 0, item);
            // Events
            this._onDidChangeNotification.fire({ item, index: 0, kind: 0 /* NotificationChangeType.ADD */ });
            // Wrap into handle
            return new NotificationHandle(item, item => this.onClose(item));
        }
        onClose(item) {
            const liveItem = this.findNotification(item);
            if (liveItem && liveItem !== item) {
                liveItem.close(); // item could have been replaced with another one, make sure to close the live item
            }
            else {
                item.close(); // otherwise just close the item that was passed in
            }
        }
        findNotification(item) {
            return this._notifications.find(notification => notification.equals(item));
        }
        createViewItem(notification) {
            const item = NotificationViewItem.create(notification, this.filter);
            if (!item) {
                return undefined;
            }
            // Item Events
            const fireNotificationChangeEvent = (kind, detail) => {
                const index = this._notifications.indexOf(item);
                if (index >= 0) {
                    this._onDidChangeNotification.fire({ item, index, kind, detail });
                }
            };
            const itemExpansionChangeListener = item.onDidChangeExpansion(() => fireNotificationChangeEvent(2 /* NotificationChangeType.EXPAND_COLLAPSE */));
            const itemContentChangeListener = item.onDidChangeContent(e => fireNotificationChangeEvent(1 /* NotificationChangeType.CHANGE */, e.kind));
            event_1.Event.once(item.onDidClose)(() => {
                itemExpansionChangeListener.dispose();
                itemContentChangeListener.dispose();
                const index = this._notifications.indexOf(item);
                if (index >= 0) {
                    this._notifications.splice(index, 1);
                    this._onDidChangeNotification.fire({ item, index, kind: 3 /* NotificationChangeType.REMOVE */ });
                }
            });
            return item;
        }
        showStatusMessage(message, options) {
            const item = StatusMessageViewItem.create(message, options);
            if (!item) {
                return lifecycle_1.Disposable.None;
            }
            // Remember as current status message and fire events
            this._statusMessage = item;
            this._onDidChangeStatusMessage.fire({ kind: 0 /* StatusMessageChangeType.ADD */, item });
            return (0, lifecycle_1.toDisposable)(() => {
                // Only reset status message if the item is still the one we had remembered
                if (this._statusMessage === item) {
                    this._statusMessage = undefined;
                    this._onDidChangeStatusMessage.fire({ kind: 1 /* StatusMessageChangeType.REMOVE */, item });
                }
            });
        }
    }
    exports.NotificationsModel = NotificationsModel;
    function isNotificationViewItem(obj) {
        return obj instanceof NotificationViewItem;
    }
    exports.isNotificationViewItem = isNotificationViewItem;
    var NotificationViewItemContentChangeKind;
    (function (NotificationViewItemContentChangeKind) {
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["SEVERITY"] = 0] = "SEVERITY";
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["MESSAGE"] = 1] = "MESSAGE";
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["ACTIONS"] = 2] = "ACTIONS";
        NotificationViewItemContentChangeKind[NotificationViewItemContentChangeKind["PROGRESS"] = 3] = "PROGRESS";
    })(NotificationViewItemContentChangeKind || (exports.NotificationViewItemContentChangeKind = NotificationViewItemContentChangeKind = {}));
    class NotificationViewItemProgress extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._state = Object.create(null);
        }
        get state() {
            return this._state;
        }
        infinite() {
            if (this._state.infinite) {
                return;
            }
            this._state.infinite = true;
            this._state.total = undefined;
            this._state.worked = undefined;
            this._state.done = undefined;
            this._onDidChange.fire();
        }
        done() {
            if (this._state.done) {
                return;
            }
            this._state.done = true;
            this._state.infinite = undefined;
            this._state.total = undefined;
            this._state.worked = undefined;
            this._onDidChange.fire();
        }
        total(value) {
            if (this._state.total === value) {
                return;
            }
            this._state.total = value;
            this._state.infinite = undefined;
            this._state.done = undefined;
            this._onDidChange.fire();
        }
        worked(value) {
            if (typeof this._state.worked === 'number') {
                this._state.worked += value;
            }
            else {
                this._state.worked = value;
            }
            this._state.infinite = undefined;
            this._state.done = undefined;
            this._onDidChange.fire();
        }
    }
    exports.NotificationViewItemProgress = NotificationViewItemProgress;
    class NotificationViewItem extends lifecycle_1.Disposable {
        static { this.MAX_MESSAGE_LENGTH = 1000; }
        static create(notification, filter) {
            if (!notification || !notification.message || (0, errors_1.isCancellationError)(notification.message)) {
                return undefined; // we need a message to show
            }
            let severity;
            if (typeof notification.severity === 'number') {
                severity = notification.severity;
            }
            else {
                severity = notification_1.Severity.Info;
            }
            const message = NotificationViewItem.parseNotificationMessage(notification.message);
            if (!message) {
                return undefined; // we need a message to show
            }
            let actions;
            if (notification.actions) {
                actions = notification.actions;
            }
            else if ((0, errorMessage_1.isErrorWithActions)(notification.message)) {
                actions = { primary: notification.message.actions };
            }
            let priority = notification.priority ?? notification_1.NotificationPriority.DEFAULT;
            if (priority === notification_1.NotificationPriority.DEFAULT && severity !== notification_1.Severity.Error) {
                if (filter.global === notification_1.NotificationsFilter.ERROR) {
                    priority = notification_1.NotificationPriority.SILENT; // filtered globally
                }
                else if ((0, notification_1.isNotificationSource)(notification.source) && filter.sources.get(notification.source.id) === notification_1.NotificationsFilter.ERROR) {
                    priority = notification_1.NotificationPriority.SILENT; // filtered by source
                }
            }
            return new NotificationViewItem(notification.id, severity, notification.sticky, priority, message, notification.source, notification.progress, actions);
        }
        static parseNotificationMessage(input) {
            let message;
            if (input instanceof Error) {
                message = (0, errorMessage_1.toErrorMessage)(input, false);
            }
            else if (typeof input === 'string') {
                message = input;
            }
            if (!message) {
                return undefined; // we need a message to show
            }
            const raw = message;
            // Make sure message is in the limits
            if (message.length > NotificationViewItem.MAX_MESSAGE_LENGTH) {
                message = `${message.substr(0, NotificationViewItem.MAX_MESSAGE_LENGTH)}...`;
            }
            // Remove newlines from messages as we do not support that and it makes link parsing hard
            message = message.replace(/(\r\n|\n|\r)/gm, ' ').trim();
            // Parse Links
            const linkedText = (0, linkedText_1.parseLinkedText)(message);
            return { raw, linkedText, original: input };
        }
        constructor(id, _severity, _sticky, _priority, _message, _source, progress, actions) {
            super();
            this.id = id;
            this._severity = _severity;
            this._sticky = _sticky;
            this._priority = _priority;
            this._message = _message;
            this._source = _source;
            this._visible = false;
            this._onDidChangeExpansion = this._register(new event_1.Emitter());
            this.onDidChangeExpansion = this._onDidChangeExpansion.event;
            this._onDidClose = this._register(new event_1.Emitter());
            this.onDidClose = this._onDidClose.event;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            if (progress) {
                this.setProgress(progress);
            }
            this.setActions(actions);
        }
        setProgress(progress) {
            if (progress.infinite) {
                this.progress.infinite();
            }
            else if (progress.total) {
                this.progress.total(progress.total);
                if (progress.worked) {
                    this.progress.worked(progress.worked);
                }
            }
        }
        setActions(actions = { primary: [], secondary: [] }) {
            this._actions = {
                primary: Array.isArray(actions.primary) ? actions.primary : [],
                secondary: Array.isArray(actions.secondary) ? actions.secondary : []
            };
            this._expanded = actions.primary && actions.primary.length > 0;
        }
        get canCollapse() {
            return !this.hasActions;
        }
        get expanded() {
            return !!this._expanded;
        }
        get severity() {
            return this._severity;
        }
        get sticky() {
            if (this._sticky) {
                return true; // explicitly sticky
            }
            const hasActions = this.hasActions;
            if ((hasActions && this._severity === notification_1.Severity.Error) || // notification errors with actions are sticky
                (!hasActions && this._expanded) || // notifications that got expanded are sticky
                (this._progress && !this._progress.state.done) // notifications with running progress are sticky
            ) {
                return true;
            }
            return false; // not sticky
        }
        get priority() {
            return this._priority;
        }
        get hasActions() {
            if (!this._actions) {
                return false;
            }
            if (!this._actions.primary) {
                return false;
            }
            return this._actions.primary.length > 0;
        }
        get hasProgress() {
            return !!this._progress;
        }
        get progress() {
            if (!this._progress) {
                this._progress = this._register(new NotificationViewItemProgress());
                this._register(this._progress.onDidChange(() => this._onDidChangeContent.fire({ kind: 3 /* NotificationViewItemContentChangeKind.PROGRESS */ })));
            }
            return this._progress;
        }
        get message() {
            return this._message;
        }
        get source() {
            return typeof this._source === 'string' ? this._source : (this._source ? this._source.label : undefined);
        }
        get sourceId() {
            return (this._source && typeof this._source !== 'string' && 'id' in this._source) ? this._source.id : undefined;
        }
        get actions() {
            return this._actions;
        }
        get visible() {
            return this._visible;
        }
        updateSeverity(severity) {
            if (severity === this._severity) {
                return;
            }
            this._severity = severity;
            this._onDidChangeContent.fire({ kind: 0 /* NotificationViewItemContentChangeKind.SEVERITY */ });
        }
        updateMessage(input) {
            const message = NotificationViewItem.parseNotificationMessage(input);
            if (!message || message.raw === this._message.raw) {
                return;
            }
            this._message = message;
            this._onDidChangeContent.fire({ kind: 1 /* NotificationViewItemContentChangeKind.MESSAGE */ });
        }
        updateActions(actions) {
            this.setActions(actions);
            this._onDidChangeContent.fire({ kind: 2 /* NotificationViewItemContentChangeKind.ACTIONS */ });
        }
        updateVisibility(visible) {
            if (this._visible !== visible) {
                this._visible = visible;
                this._onDidChangeVisibility.fire(visible);
            }
        }
        expand() {
            if (this._expanded || !this.canCollapse) {
                return;
            }
            this._expanded = true;
            this._onDidChangeExpansion.fire();
        }
        collapse(skipEvents) {
            if (!this._expanded || !this.canCollapse) {
                return;
            }
            this._expanded = false;
            if (!skipEvents) {
                this._onDidChangeExpansion.fire();
            }
        }
        toggle() {
            if (this._expanded) {
                this.collapse();
            }
            else {
                this.expand();
            }
        }
        close() {
            this._onDidClose.fire();
            this.dispose();
        }
        equals(other) {
            if (this.hasProgress || other.hasProgress) {
                return false;
            }
            if (typeof this.id === 'string' || typeof other.id === 'string') {
                return this.id === other.id;
            }
            if (typeof this._source === 'object') {
                if (this._source.label !== other.source || this._source.id !== other.sourceId) {
                    return false;
                }
            }
            else if (this._source !== other.source) {
                return false;
            }
            if (this._message.raw !== other.message.raw) {
                return false;
            }
            const primaryActions = (this._actions && this._actions.primary) || [];
            const otherPrimaryActions = (other.actions && other.actions.primary) || [];
            return (0, arrays_1.equals)(primaryActions, otherPrimaryActions, (action, otherAction) => (action.id + action.label) === (otherAction.id + otherAction.label));
        }
    }
    exports.NotificationViewItem = NotificationViewItem;
    class ChoiceAction extends actions_1.Action {
        constructor(id, choice) {
            super(id, choice.label, undefined, true, async () => {
                // Pass to runner
                choice.run();
                // Emit Event
                this._onDidRun.fire();
            });
            this._onDidRun = this._register(new event_1.Emitter());
            this.onDidRun = this._onDidRun.event;
            this._keepOpen = !!choice.keepOpen;
            this._menu = !choice.isSecondary && choice.menu ? choice.menu.map((c, index) => new ChoiceAction(`${id}.${index}`, c)) : undefined;
        }
        get menu() {
            return this._menu;
        }
        get keepOpen() {
            return this._keepOpen;
        }
    }
    exports.ChoiceAction = ChoiceAction;
    class StatusMessageViewItem {
        static create(notification, options) {
            if (!notification || (0, errors_1.isCancellationError)(notification)) {
                return undefined; // we need a message to show
            }
            let message;
            if (notification instanceof Error) {
                message = (0, errorMessage_1.toErrorMessage)(notification, false);
            }
            else if (typeof notification === 'string') {
                message = notification;
            }
            if (!message) {
                return undefined; // we need a message to show
            }
            return { message, options };
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9ub3RpZmljYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXVDaEcsSUFBa0Isc0JBc0JqQjtJQXRCRCxXQUFrQixzQkFBc0I7UUFFdkM7O1dBRUc7UUFDSCxpRUFBRyxDQUFBO1FBRUg7OztXQUdHO1FBQ0gsdUVBQU0sQ0FBQTtRQUVOOztXQUVHO1FBQ0gseUZBQWUsQ0FBQTtRQUVmOztXQUVHO1FBQ0gsdUVBQU0sQ0FBQTtJQUNQLENBQUMsRUF0QmlCLHNCQUFzQixzQ0FBdEIsc0JBQXNCLFFBc0J2QztJQTBCRCxJQUFrQix1QkFHakI7SUFIRCxXQUFrQix1QkFBdUI7UUFDeEMsbUVBQUcsQ0FBQTtRQUNILHlFQUFNLENBQUE7SUFDUCxDQUFDLEVBSGlCLHVCQUF1Qix1Q0FBdkIsdUJBQXVCLFFBR3hDO0lBb0JELE1BQWEsa0JBQW1CLFNBQVEsc0JBQVU7UUFRakQsWUFBNkIsSUFBMkIsRUFBbUIsT0FBOEM7WUFDeEgsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBdUI7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBdUM7WUFOeEcsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUMxRCxlQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFFNUIsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVyxDQUFDLENBQUM7WUFDeEUsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQUtsRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8s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