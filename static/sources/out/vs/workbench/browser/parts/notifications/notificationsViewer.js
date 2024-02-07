/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/nls", "vs/base/browser/ui/button/button", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/platform/contextview/browser/contextView", "vs/workbench/common/notifications", "vs/workbench/browser/parts/notifications/notificationsActions", "vs/platform/keybinding/common/keybinding", "vs/base/browser/ui/progressbar/progressbar", "vs/platform/notification/common/notification", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/browser/event", "vs/base/browser/touch", "vs/base/common/event", "vs/platform/theme/browser/defaultStyles", "vs/base/browser/keyboardEvent"], function (require, exports, dom_1, opener_1, uri_1, nls_1, button_1, actionbar_1, actions_1, instantiation_1, lifecycle_1, contextView_1, notifications_1, notificationsActions_1, keybinding_1, progressbar_1, notification_1, arrays_1, codicons_1, themables_1, dropdownActionViewItem_1, event_1, touch_1, event_2, defaultStyles_1, keyboardEvent_1) {
    "use strict";
    var NotificationRenderer_1, NotificationTemplateRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationTemplateRenderer = exports.NotificationRenderer = exports.NotificationsListDelegate = void 0;
    class NotificationsListDelegate {
        static { this.ROW_HEIGHT = 42; }
        static { this.LINE_HEIGHT = 22; }
        constructor(container) {
            this.offsetHelper = this.createOffsetHelper(container);
        }
        createOffsetHelper(container) {
            const offsetHelper = document.createElement('div');
            offsetHelper.classList.add('notification-offset-helper');
            container.appendChild(offsetHelper);
            return offsetHelper;
        }
        getHeight(notification) {
            if (!notification.expanded) {
                return NotificationsListDelegate.ROW_HEIGHT; // return early if there are no more rows to show
            }
            // First row: message and actions
            let expandedHeight = NotificationsListDelegate.ROW_HEIGHT;
            // Dynamic height: if message overflows
            const preferredMessageHeight = this.computePreferredHeight(notification);
            const messageOverflows = NotificationsListDelegate.LINE_HEIGHT < preferredMessageHeight;
            if (messageOverflows) {
                const overflow = preferredMessageHeight - NotificationsListDelegate.LINE_HEIGHT;
                expandedHeight += overflow;
            }
            // Last row: source and buttons if we have any
            if (notification.source || (0, arrays_1.isNonEmptyArray)(notification.actions && notification.actions.primary)) {
                expandedHeight += NotificationsListDelegate.ROW_HEIGHT;
            }
            // If the expanded height is same as collapsed, unset the expanded state
            // but skip events because there is no change that has visual impact
            if (expandedHeight === NotificationsListDelegate.ROW_HEIGHT) {
                notification.collapse(true /* skip events, no change in height */);
            }
            return expandedHeight;
        }
        computePreferredHeight(notification) {
            // Prepare offset helper depending on toolbar actions count
            let actions = 0;
            if (!notification.hasProgress) {
                actions++; // close
            }
            if (notification.canCollapse) {
                actions++; // expand/collapse
            }
            if ((0, arrays_1.isNonEmptyArray)(notification.actions && notification.actions.secondary)) {
                actions++; // secondary actions
            }
            this.offsetHelper.style.width = `${450 /* notifications container width */ - (10 /* padding */ + 30 /* severity icon */ + (actions * 30) /* actions */ - (Math.max(actions - 1, 0) * 4) /* less padding for actions > 1 */)}px`;
            // Render message into offset helper
            const renderedMessage = NotificationMessageRenderer.render(notification.message);
            this.offsetHelper.appendChild(renderedMessage);
            // Compute height
            const preferredHeight = Math.max(this.offsetHelper.offsetHeight, this.offsetHelper.scrollHeight);
            // Always clear offset helper after use
            (0, dom_1.clearNode)(this.offsetHelper);
            return preferredHeight;
        }
        getTemplateId(element) {
            if (element instanceof notifications_1.NotificationViewItem) {
                return NotificationRenderer.TEMPLATE_ID;
            }
            throw new Error('unknown element type: ' + element);
        }
    }
    exports.NotificationsListDelegate = NotificationsListDelegate;
    class NotificationMessageRenderer {
        static render(message, actionHandler) {
            const messageContainer = document.createElement('span');
            for (const node of message.linkedText.nodes) {
                if (typeof node === 'string') {
                    messageContainer.appendChild(document.createTextNode(node));
                }
                else {
                    let title = node.title;
                    if (!title && node.href.startsWith('command:')) {
                        title = (0, nls_1.localize)('executeCommand', "Click to execute command '{0}'", node.href.substr('command:'.length));
                    }
                    else if (!title) {
                        title = node.href;
                    }
                    const anchor = (0, dom_1.$)('a', { href: node.href, title, tabIndex: 0 }, node.label);
                    if (actionHandler) {
                        const handleOpen = (e) => {
                            if ((0, dom_1.isEventLike)(e)) {
                                dom_1.EventHelper.stop(e, true);
                            }
                            actionHandler.callback(node.href);
                        };
                        const onClick = actionHandler.toDispose.add(new event_1.DomEmitter(anchor, dom_1.EventType.CLICK)).event;
                        const onKeydown = actionHandler.toDispose.add(new event_1.DomEmitter(anchor, dom_1.EventType.KEY_DOWN)).event;
                        const onSpaceOrEnter = event_2.Event.chain(onKeydown, $ => $.filter(e => {
                            const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                            return event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */);
                        }));
                        actionHandler.toDispose.add(touch_1.Gesture.addTarget(anchor));
                        const onTap = actionHandler.toDispose.add(new event_1.DomEmitter(anchor, touch_1.EventType.Tap)).event;
                        event_2.Event.any(onClick, onTap, onSpaceOrEnter)(handleOpen, null, actionHandler.toDispose);
                    }
                    messageContainer.appendChild(anchor);
                }
            }
            return messageContainer;
        }
    }
    let NotificationRenderer = class NotificationRenderer {
        static { NotificationRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'notification'; }
        constructor(actionRunner, contextMenuService, instantiationService, notificationService) {
            this.actionRunner = actionRunner;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.notificationService = notificationService;
        }
        get templateId() {
            return NotificationRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = new lifecycle_1.DisposableStore();
            // Container
            data.container = document.createElement('div');
            data.container.classList.add('notification-list-item');
            // Main Row
            data.mainRow = document.createElement('div');
            data.mainRow.classList.add('notification-list-item-main-row');
            // Icon
            data.icon = document.createElement('div');
            data.icon.classList.add('notification-list-item-icon', 'codicon');
            // Message
            data.message = document.createElement('div');
            data.message.classList.add('notification-list-item-message');
            // Toolbar
            const that = this;
            const toolbarContainer = document.createElement('div');
            toolbarContainer.classList.add('notification-list-item-toolbar-container');
            data.toolbar = new actionbar_1.ActionBar(toolbarContainer, {
                ariaLabel: (0, nls_1.localize)('notificationActions', "Notification Actions"),
                actionViewItemProvider: action => {
                    if (action instanceof notificationsActions_1.ConfigureNotificationAction) {
                        return data.toDispose.add(new dropdownActionViewItem_1.DropdownMenuActionViewItem(action, {
                            getActions() {
                                const actions = [];
                                const source = { id: action.notification.sourceId, label: action.notification.source };
                                if ((0, notification_1.isNotificationSource)(source)) {
                                    const isSourceFiltered = that.notificationService.getFilter(source) === notification_1.NotificationsFilter.ERROR;
                                    actions.push((0, actions_1.toAction)({
                                        id: source.id,
                                        label: isSourceFiltered ? (0, nls_1.localize)('turnOnNotifications', "Turn On Notifications from '{0}'", source.label) : (0, nls_1.localize)('turnOffNotifications', "Turn Off Notifications from '{0}'", source.label),
                                        run: () => that.notificationService.setFilter({ ...source, filter: isSourceFiltered ? notification_1.NotificationsFilter.OFF : notification_1.NotificationsFilter.ERROR })
                                    }));
                                    if (action.notification.actions?.secondary?.length) {
                                        actions.push(new actions_1.Separator());
                                    }
                                }
                                if (Array.isArray(action.notification.actions?.secondary)) {
                                    actions.push(...action.notification.actions.secondary);
                                }
                                return actions;
                            },
                        }, this.contextMenuService, {
                            actionRunner: this.actionRunner,
                            classNames: action.class
                        }));
                    }
                    return undefined;
                },
                actionRunner: this.actionRunner
            });
            data.toDispose.add(data.toolbar);
            // Details Row
            data.detailsRow = document.createElement('div');
            data.detailsRow.classList.add('notification-list-item-details-row');
            // Source
            data.source = document.createElement('div');
            data.source.classList.add('notification-list-item-source');
            // Buttons Container
            data.buttonsContainer = document.createElement('div');
            data.buttonsContainer.classList.add('notification-list-item-buttons-container');
            container.appendChild(data.container);
            // the details row appears first in order for better keyboard access to notification buttons
            data.container.appendChild(data.detailsRow);
            data.detailsRow.appendChild(data.source);
            data.detailsRow.appendChild(data.buttonsContainer);
            // main row
            data.container.appendChild(data.mainRow);
            data.mainRow.appendChild(data.icon);
            data.mainRow.appendChild(data.message);
            data.mainRow.appendChild(toolbarContainer);
            // Progress: below the rows to span the entire width of the item
            data.progress = new progressbar_1.ProgressBar(container, defaultStyles_1.defaultProgressBarStyles);
            data.toDispose.add(data.progress);
            // Renderer
            data.renderer = this.instantiationService.createInstance(NotificationTemplateRenderer, data, this.actionRunner);
            data.toDispose.add(data.renderer);
            return data;
        }
        renderElement(notification, index, data) {
            data.renderer.setInput(notification);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    exports.NotificationRenderer = NotificationRenderer;
    exports.NotificationRenderer = NotificationRenderer = NotificationRenderer_1 = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, notification_1.INotificationService)
    ], NotificationRenderer);
    let NotificationTemplateRenderer = class NotificationTemplateRenderer extends lifecycle_1.Disposable {
        static { NotificationTemplateRenderer_1 = this; }
        static { this.SEVERITIES = [notification_1.Severity.Info, notification_1.Severity.Warning, notification_1.Severity.Error]; }
        constructor(template, actionRunner, openerService, instantiationService, keybindingService, contextMenuService) {
            super();
            this.template = template;
            this.actionRunner = actionRunner;
            this.openerService = openerService;
            this.instantiationService = instantiationService;
            this.keybindingService = keybindingService;
            this.contextMenuService = contextMenuService;
            this.inputDisposables = this._register(new lifecycle_1.DisposableStore());
            if (!NotificationTemplateRenderer_1.closeNotificationAction) {
                NotificationTemplateRenderer_1.closeNotificationAction = instantiationService.createInstance(notificationsActions_1.ClearNotificationAction, notificationsActions_1.ClearNotificationAction.ID, notificationsActions_1.ClearNotificationAction.LABEL);
                NotificationTemplateRenderer_1.expandNotificationAction = instantiationService.createInstance(notificationsActions_1.ExpandNotificationAction, notificationsActions_1.ExpandNotificationAction.ID, notificationsActions_1.ExpandNotificationAction.LABEL);
                NotificationTemplateRenderer_1.collapseNotificationAction = instantiationService.createInstance(notificationsActions_1.CollapseNotificationAction, notificationsActions_1.CollapseNotificationAction.ID, notificationsActions_1.CollapseNotificationAction.LABEL);
            }
        }
        setInput(notification) {
            this.inputDisposables.clear();
            this.render(notification);
        }
        render(notification) {
            // Container
            this.template.container.classList.toggle('expanded', notification.expanded);
            this.inputDisposables.add((0, dom_1.addDisposableListener)(this.template.container, dom_1.EventType.MOUSE_UP, e => {
                if (e.button === 1 /* Middle Button */) {
                    // Prevent firing the 'paste' event in the editor textarea - #109322
                    dom_1.EventHelper.stop(e, true);
                }
            }));
            this.inputDisposables.add((0, dom_1.addDisposableListener)(this.template.container, dom_1.EventType.AUXCLICK, e => {
                if (!notification.hasProgress && e.button === 1 /* Middle Button */) {
                    dom_1.EventHelper.stop(e, true);
                    notification.close();
                }
            }));
            // Severity Icon
            this.renderSeverity(notification);
            // Message
            const messageOverflows = this.renderMessage(notification);
            // Secondary Actions
            this.renderSecondaryActions(notification, messageOverflows);
            // Source
            this.renderSource(notification);
            // Buttons
            this.renderButtons(notification);
            // Progress
            this.renderProgress(notification);
            // Label Change Events that we can handle directly
            // (changes to actions require an entire redraw of
            // the notification because it has an impact on
            // epxansion state)
            this.inputDisposables.add(notification.onDidChangeContent(event => {
                switch (event.kind) {
                    case 0 /* NotificationViewItemContentChangeKind.SEVERITY */:
                        this.renderSeverity(notification);
                        break;
                    case 3 /* NotificationViewItemContentChangeKind.PROGRESS */:
                        this.renderProgress(notification);
                        break;
                    case 1 /* NotificationViewItemContentChangeKind.MESSAGE */:
                        this.renderMessage(notification);
                        break;
                }
            }));
        }
        renderSeverity(notification) {
            // first remove, then set as the codicon class names overlap
            NotificationTemplateRenderer_1.SEVERITIES.forEach(severity => {
                if (notification.severity !== severity) {
                    this.template.icon.classList.remove(...themables_1.ThemeIcon.asClassNameArray(this.toSeverityIcon(severity)));
                }
            });
            this.template.icon.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.toSeverityIcon(notification.severity)));
        }
        renderMessage(notification) {
            (0, dom_1.clearNode)(this.template.message);
            this.template.message.appendChild(NotificationMessageRenderer.render(notification.message, {
                callback: link => this.openerService.open(uri_1.URI.parse(link), { allowCommands: true }),
                toDispose: this.inputDisposables
            }));
            const messageOverflows = notification.canCollapse && !notification.expanded && this.template.message.scrollWidth > this.template.message.clientWidth;
            if (messageOverflows) {
                this.template.message.title = this.template.message.textContent + '';
            }
            else {
                this.template.message.removeAttribute('title');
            }
            return messageOverflows;
        }
        renderSecondaryActions(notification, messageOverflows) {
            const actions = [];
            // Secondary Actions
            if ((0, arrays_1.isNonEmptyArray)(notification.actions?.secondary)) {
                const configureNotificationAction = this.instantiationService.createInstance(notificationsActions_1.ConfigureNotificationAction, notificationsActions_1.ConfigureNotificationAction.ID, notificationsActions_1.ConfigureNotificationAction.LABEL, notification);
                actions.push(configureNotificationAction);
                this.inputDisposables.add(configureNotificationAction);
            }
            // Expand / Collapse
            let showExpandCollapseAction = false;
            if (notification.canCollapse) {
                if (notification.expanded) {
                    showExpandCollapseAction = true; // allow to collapse an expanded message
                }
                else if (notification.source) {
                    showExpandCollapseAction = true; // allow to expand to details row
                }
                else if (messageOverflows) {
                    showExpandCollapseAction = true; // allow to expand if message overflows
                }
            }
            if (showExpandCollapseAction) {
                actions.push(notification.expanded ? NotificationTemplateRenderer_1.collapseNotificationAction : NotificationTemplateRenderer_1.expandNotificationAction);
            }
            // Close (unless progress is showing)
            if (!notification.hasProgress) {
                actions.push(NotificationTemplateRenderer_1.closeNotificationAction);
            }
            this.template.toolbar.clear();
            this.template.toolbar.context = notification;
            actions.forEach(action => this.template.toolbar.push(action, { icon: true, label: false, keybinding: this.getKeybindingLabel(action) }));
        }
        renderSource(notification) {
            if (notification.expanded && notification.source) {
                this.template.source.textContent = (0, nls_1.localize)('notificationSource', "Source: {0}", notification.source);
                this.template.source.title = notification.source;
            }
            else {
                this.template.source.textContent = '';
                this.template.source.removeAttribute('title');
            }
        }
        renderButtons(notification) {
            (0, dom_1.clearNode)(this.template.buttonsContainer);
            const primaryActions = notification.actions ? notification.actions.primary : undefined;
            if (notification.expanded && (0, arrays_1.isNonEmptyArray)(primaryActions)) {
                const that = this;
                const actionRunner = new class extends actions_1.ActionRunner {
                    async runAction(action) {
                        // Run action
                        that.actionRunner.run(action, notification);
                        // Hide notification (unless explicitly prevented)
                        if (!(action instanceof notifications_1.ChoiceAction) || !action.keepOpen) {
                            notification.close();
                        }
                    }
                }();
                const buttonToolbar = this.inputDisposables.add(new button_1.ButtonBar(this.template.buttonsContainer));
                for (let i = 0; i < primaryActions.length; i++) {
                    const action = primaryActions[i];
                    const options = {
                        title: true, // assign titles to buttons in case they overflow
                        secondary: i > 0,
                        ...defaultStyles_1.defaultButtonStyles
                    };
                    const dropdownActions = action instanceof notifications_1.ChoiceAction ? action.menu : undefined;
                    const button = this.inputDisposables.add(dropdownActions ?
                        buttonToolbar.addButtonWithDropdown({
                            ...options,
                            contextMenuProvider: this.contextMenuService,
                            actions: dropdownActions,
                            actionRunner
                        }) :
                        buttonToolbar.addButton(options));
                    button.label = action.label;
                    this.inputDisposables.add(button.onDidClick(e => {
                        if (e) {
                            dom_1.EventHelper.stop(e, true);
                        }
                        actionRunner.run(action);
                    }));
                }
            }
        }
        renderProgress(notification) {
            // Return early if the item has no progress
            if (!notification.hasProgress) {
                this.template.progress.stop().hide();
                return;
            }
            // Infinite
            const state = notification.progress.state;
            if (state.infinite) {
                this.template.progress.infinite().show();
            }
            // Total / Worked
            else if (typeof state.total === 'number' || typeof state.worked === 'number') {
                if (typeof state.total === 'number' && !this.template.progress.hasTotal()) {
                    this.template.progress.total(state.total);
                }
                if (typeof state.worked === 'number') {
                    this.template.progress.setWorked(state.worked).show();
                }
            }
            // Done
            else {
                this.template.progress.done().hide();
            }
        }
        toSeverityIcon(severity) {
            switch (severity) {
                case notification_1.Severity.Warning:
                    return codicons_1.Codicon.warning;
                case notification_1.Severity.Error:
                    return codicons_1.Codicon.error;
            }
            return codicons_1.Codicon.info;
        }
        getKeybindingLabel(action) {
            const keybinding = this.keybindingService.lookupKeybinding(action.id);
            return keybinding ? keybinding.getLabel() : null;
        }
    };
    exports.NotificationTemplateRenderer = NotificationTemplateRenderer;
    exports.NotificationTemplateRenderer = NotificationTemplateRenderer = NotificationTemplateRenderer_1 = __decorate([
        __param(2, opener_1.IOpenerService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, contextView_1.IContextMenuService)
    ], NotificationTemplateRenderer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc1ZpZXdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvbm90aWZpY2F0aW9ucy9ub3RpZmljYXRpb25zVmlld2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE2QmhHLE1BQWEseUJBQXlCO2lCQUViLGVBQVUsR0FBRyxFQUFFLENBQUM7aUJBQ2hCLGdCQUFXLEdBQUcsRUFBRSxDQUFDO1FBSXpDLFlBQVksU0FBc0I7WUFDakMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVPLGtCQUFrQixDQUFDLFNBQXNCO1lBQ2hELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUV6RCxTQUFTLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXBDLE9BQU8sWUFBWSxDQUFDO1FBQ3JCLENBQUM7UUFFRCxTQUFTLENBQUMsWUFBbUM7WUFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxpREFBaUQ7WUFDL0YsQ0FBQztZQUVELGlDQUFpQztZQUNqQyxJQUFJLGNBQWMsR0FBRyx5QkFBeUIsQ0FBQyxVQUFVLENBQUM7WUFFMUQsdUNBQXVDO1lBQ3ZDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sZ0JBQWdCLEdBQUcseUJBQXlCLENBQUMsV0FBVyxHQUFHLHNCQUFzQixD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