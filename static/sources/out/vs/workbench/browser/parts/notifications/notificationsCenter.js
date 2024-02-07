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
define(["require", "exports", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/workbench/browser/parts/notifications/notificationsList", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dom", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/nls", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/notifications/notificationsActions", "vs/base/common/actions", "vs/platform/keybinding/common/keybinding", "vs/base/common/types", "vs/workbench/common/contextkeys", "vs/platform/notification/common/notification", "vs/base/browser/window", "vs/platform/contextview/browser/contextView", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/platform/audioCues/browser/audioCueService", "vs/css!./media/notificationsCenter", "vs/css!./media/notificationsActions"], function (require, exports, theme_1, themeService_1, layoutService_1, event_1, contextkey_1, notificationsCommands_1, notificationsList_1, instantiation_1, dom_1, colorRegistry_1, editorGroupsService_1, nls_1, actionbar_1, notificationsActions_1, actions_1, keybinding_1, types_1, contextkeys_1, notification_1, window_1, contextView_1, dropdownActionViewItem_1, audioCueService_1) {
    "use strict";
    var NotificationsCenter_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationsCenter = void 0;
    let NotificationsCenter = class NotificationsCenter extends themeService_1.Themable {
        static { NotificationsCenter_1 = this; }
        static { this.MAX_DIMENSIONS = new dom_1.Dimension(450, 400); }
        static { this.MAX_NOTIFICATION_SOURCES = 10; } // maximum number of notification sources to show in configure dropdown
        constructor(container, model, themeService, instantiationService, layoutService, contextKeyService, editorGroupService, keybindingService, notificationService, audioCueService, contextMenuService) {
            super(themeService);
            this.container = container;
            this.model = model;
            this.instantiationService = instantiationService;
            this.layoutService = layoutService;
            this.contextKeyService = contextKeyService;
            this.editorGroupService = editorGroupService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.audioCueService = audioCueService;
            this.contextMenuService = contextMenuService;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this.notificationsCenterVisibleContextKey = contextkeys_1.NotificationsCenterVisibleContext.bindTo(this.contextKeyService);
            this.notificationsCenterVisibleContextKey = contextkeys_1.NotificationsCenterVisibleContext.bindTo(contextKeyService);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.model.onDidChangeNotification(e => this.onDidChangeNotification(e)));
            this._register(this.layoutService.onDidLayoutMainContainer(dimension => this.layout(dom_1.Dimension.lift(dimension))));
            this._register(this.notificationService.onDidChangeFilter(() => this.onDidChangeFilter()));
        }
        onDidChangeFilter() {
            if (this.notificationService.getFilter() === notification_1.NotificationsFilter.ERROR) {
                this.hide(); // hide the notification center when we have a error filter enabled
            }
        }
        get isVisible() {
            return !!this._isVisible;
        }
        show() {
            if (this._isVisible) {
                const notificationsList = (0, types_1.assertIsDefined)(this.notificationsList);
                // Make visible
                notificationsList.show();
                // Focus first
                notificationsList.focusFirst();
                return; // already visible
            }
            // Lazily create if showing for the first time
            if (!this.notificationsCenterContainer) {
                this.create();
            }
            // Title
            this.updateTitle();
            // Make visible
            const [notificationsList, notificationsCenterContainer] = (0, types_1.assertAllDefined)(this.notificationsList, this.notificationsCenterContainer);
            this._isVisible = true;
            notificationsCenterContainer.classList.add('visible');
            notificationsList.show();
            // Layout
            this.layout(this.workbenchDimensions);
            // Show all notifications that are present now
            notificationsList.updateNotificationsList(0, 0, this.model.notifications);
            // Focus first
            notificationsList.focusFirst();
            // Theming
            this.updateStyles();
            // Mark as visible
            this.model.notifications.forEach(notification => notification.updateVisibility(true));
            // Context Key
            this.notificationsCenterVisibleContextKey.set(true);
            // Event
            this._onDidChangeVisibility.fire();
        }
        updateTitle() {
            const [notificationsCenterTitle, clearAllAction] = (0, types_1.assertAllDefined)(this.notificationsCenterTitle, this.clearAllAction);
            if (this.model.notifications.length === 0) {
                notificationsCenterTitle.textContent = (0, nls_1.localize)('notificationsEmpty', "No new notifications");
                clearAllAction.enabled = false;
            }
            else {
                notificationsCenterTitle.textContent = (0, nls_1.localize)('notifications', "Notifications");
                clearAllAction.enabled = this.model.notifications.some(notification => !notification.hasProgress);
            }
        }
        create() {
            // Container
            this.notificationsCenterContainer = document.createElement('div');
            this.notificationsCenterContainer.classList.add('notifications-center');
            // Header
            this.notificationsCenterHeader = document.createElement('div');
            this.notificationsCenterHeader.classList.add('notifications-center-header');
            this.notificationsCenterContainer.appendChild(this.notificationsCenterHeader);
            // Header Title
            this.notificationsCenterTitle = document.createElement('span');
            this.notificationsCenterTitle.classList.add('notifications-center-header-title');
            this.notificationsCenterHeader.appendChild(this.notificationsCenterTitle);
            // Header Toolbar
            const toolbarContainer = document.createElement('div');
            toolbarContainer.classList.add('notifications-center-header-toolbar');
            this.notificationsCenterHeader.appendChild(toolbarContainer);
            const actionRunner = this._register(this.instantiationService.createInstance(notificationsCommands_1.NotificationActionRunner));
            const that = this;
            const notificationsToolBar = this._register(new actionbar_1.ActionBar(toolbarContainer, {
                ariaLabel: (0, nls_1.localize)('notificationsToolbar', "Notification Center Actions"),
                actionRunner,
                actionViewItemProvider: action => {
                    if (action.id === notificationsActions_1.ConfigureDoNotDisturbAction.ID) {
                        return this._register(this.instantiationService.createInstance(dropdownActionViewItem_1.DropdownMenuActionViewItem, action, {
                            getActions() {
                                const actions = [(0, actions_1.toAction)({
                                        id: notificationsActions_1.ToggleDoNotDisturbAction.ID,
                                        label: that.notificationService.getFilter() === notification_1.NotificationsFilter.OFF ? (0, nls_1.localize)('turnOnNotifications', "Enable Do Not Disturb Mode") : (0, nls_1.localize)('turnOffNotifications', "Disable Do Not Disturb Mode"),
                                        run: () => that.notificationService.setFilter(that.notificationService.getFilter() === notification_1.NotificationsFilter.OFF ? notification_1.NotificationsFilter.ERROR : notification_1.NotificationsFilter.OFF)
                                    })];
                                const sortedFilters = that.notificationService.getFilters().sort((a, b) => a.label.localeCompare(b.label));
                                for (const source of sortedFilters.slice(0, NotificationsCenter_1.MAX_NOTIFICATION_SOURCES)) {
                                    if (actions.length === 1) {
                                        actions.push(new actions_1.Separator());
                                    }
                                    actions.push((0, actions_1.toAction)({
                                        id: `${notificationsActions_1.ToggleDoNotDisturbAction.ID}.${source.id}`,
                                        label: source.label,
                                        checked: source.filter !== notification_1.NotificationsFilter.ERROR,
                                        run: () => that.notificationService.setFilter({
                                            ...source,
                                            filter: source.filter === notification_1.NotificationsFilter.ERROR ? notification_1.NotificationsFilter.OFF : notification_1.NotificationsFilter.ERROR
                                        })
                                    }));
                                }
                                if (sortedFilters.length > NotificationsCenter_1.MAX_NOTIFICATION_SOURCES) {
                                    actions.push(new actions_1.Separator());
                                    actions.push(that._register(that.instantiationService.createInstance(notificationsActions_1.ToggleDoNotDisturbBySourceAction, notificationsActions_1.ToggleDoNotDisturbBySourceAction.ID, (0, nls_1.localize)('moreSources', "More…"))));
                                }
                                return actions;
                            },
                        }, this.contextMenuService, {
                            actionRunner,
                            classNames: action.class,
                            keybindingProvider: action => this.keybindingService.lookupKeybinding(action.id)
                        }));
                    }
                    return undefined;
                }
            }));
            this.clearAllAction = this._register(this.instantiationService.createInstance(notificationsActions_1.ClearAllNotificationsAction, notificationsActions_1.ClearAllNotificationsAction.ID, notificationsActions_1.ClearAllNotificationsAction.LABEL));
            notificationsToolBar.push(this.clearAllAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(this.clearAllAction) });
            this.configureDoNotDisturbAction = this._register(this.instantiationService.createInstance(notificationsActions_1.ConfigureDoNotDisturbAction, notificationsActions_1.ConfigureDoNotDisturbAction.ID, notificationsActions_1.ConfigureDoNotDisturbAction.LABEL));
            notificationsToolBar.push(this.configureDoNotDisturbAction, { icon: true, label: false });
            const hideAllAction = this._register(this.instantiationService.createInstance(notificationsActions_1.HideNotificationsCenterAction, notificationsActions_1.HideNotificationsCenterAction.ID, notificationsActions_1.HideNotificationsCenterAction.LABEL));
            notificationsToolBar.push(hideAllAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(hideAllAction) });
            // Notifications List
            this.notificationsList = this.instantiationService.createInstance(notificationsList_1.NotificationsList, this.notificationsCenterContainer, {
                widgetAriaLabel: (0, nls_1.localize)('notificationsCenterWidgetAriaLabel', "Notifications Center")
            });
            this.container.appendChild(this.notificationsCenterContainer);
        }
        getKeybindingLabel(action) {
            const keybinding = this.keybindingService.lookupKeybinding(action.id);
            return keybinding ? keybinding.getLabel() : null;
        }
        onDidChangeNotification(e) {
            if (!this._isVisible) {
                return; // only if visible
            }
            let focusEditor = false;
            // Update notifications list based on event kind
            const [notificationsList, notificationsCenterContainer] = (0, types_1.assertAllDefined)(this.notificationsList, this.notificationsCenterContainer);
            switch (e.kind) {
                case 0 /* NotificationChangeType.ADD */:
                    notificationsList.updateNotificationsList(e.index, 0, [e.item]);
                    e.item.updateVisibility(true);
                    break;
                case 1 /* NotificationChangeType.CHANGE */:
                    // Handle content changes
                    // - actions: re-draw to properly show them
                    // - message: update notification height unless collapsed
                    switch (e.detail) {
                        case 2 /* NotificationViewItemContentChangeKind.ACTIONS */:
                            notificationsList.updateNotificationsList(e.index, 1, [e.item]);
                            break;
                        case 1 /* NotificationViewItemContentChangeKind.MESSAGE */:
                            if (e.item.expanded) {
                                notificationsList.updateNotificationHeight(e.item);
                            }
                            break;
                    }
                    break;
                case 2 /* NotificationChangeType.EXPAND_COLLAPSE */:
                    // Re-draw entire item when expansion changes to reveal or hide details
                    notificationsList.updateNotificationsList(e.index, 1, [e.item]);
                    break;
                case 3 /* NotificationChangeType.REMOVE */:
                    focusEditor = (0, dom_1.isAncestorOfActiveElement)(notificationsCenterContainer);
                    notificationsList.updateNotificationsList(e.index, 1);
                    e.item.updateVisibility(false);
                    break;
            }
            // Update title
            this.updateTitle();
            // Hide if no more notifications to show
            if (this.model.notifications.length === 0) {
                this.hide();
                // Restore focus to editor group if we had focus
                if (focusEditor) {
                    this.editorGroupService.activeGroup.focus();
                }
            }
        }
        hide() {
            if (!this._isVisible || !this.notificationsCenterContainer || !this.notificationsList) {
                return; // already hidden
            }
            const focusEditor = (0, dom_1.isAncestorOfActiveElement)(this.notificationsCenterContainer);
            // Hide
            this._isVisible = false;
            this.notificationsCenterContainer.classList.remove('visible');
            this.notificationsList.hide();
            // Mark as hidden
            this.model.notifications.forEach(notification => notification.updateVisibility(false));
            // Context Key
            this.notificationsCenterVisibleContextKey.set(false);
            // Event
            this._onDidChangeVisibility.fire();
            // Restore focus to editor group if we had focus
            if (focusEditor) {
                this.editorGroupService.activeGroup.focus();
            }
        }
        updateStyles() {
            if (this.notificationsCenterContainer && this.notificationsCenterHeader) {
                const widgetShadowColor = this.getColor(colorRegistry_1.widgetShadow);
                this.notificationsCenterContainer.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
                const borderColor = this.getColor(theme_1.NOTIFICATIONS_CENTER_BORDER);
                this.notificationsCenterContainer.style.border = borderColor ? `1px solid ${borderColor}` : '';
                const headerForeground = this.getColor(theme_1.NOTIFICATIONS_CENTER_HEADER_FOREGROUND);
                this.notificationsCenterHeader.style.color = headerForeground ?? '';
                const headerBackground = this.getColor(theme_1.NOTIFICATIONS_CENTER_HEADER_BACKGROUND);
                this.notificationsCenterHeader.style.background = headerBackground ?? '';
            }
        }
        layout(dimension) {
            this.workbenchDimensions = dimension;
            if (this._isVisible && this.notificationsCenterContainer) {
                const maxWidth = NotificationsCenter_1.MAX_DIMENSIONS.width;
                const maxHeight = NotificationsCenter_1.MAX_DIMENSIONS.height;
                let availableWidth = maxWidth;
                let availableHeight = maxHeight;
                if (this.workbenchDimensions) {
                    // Make sure notifications are not exceding available width
                    availableWidth = this.workbenchDimensions.width;
                    availableWidth -= (2 * 8); // adjust for paddings left and right
                    // Make sure notifications are not exceeding available height
                    availableHeight = this.workbenchDimensions.height - 35 /* header */;
                    if (this.layoutService.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, window_1.mainWindow)) {
                        availableHeight -= 22; // adjust for status bar
                    }
                    if (this.layoutService.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, window_1.mainWindow)) {
                        availableHeight -= 22; // adjust for title bar
                    }
                    availableHeight -= (2 * 12); // adjust for paddings top and bottom
                }
                // Apply to list
                const notificationsList = (0, types_1.assertIsDefined)(this.notificationsList);
                notificationsList.layout(Math.min(maxWidth, availableWidth), Math.min(maxHeight, availableHeight));
            }
        }
        clearAll() {
            // Hide notifications center first
            this.hide();
            // Close all
            for (const notification of [...this.model.notifications] /* copy array since we modify it from closing */) {
                if (!notification.hasProgress) {
                    notification.close();
                }
                this.audioCueService.playAudioCue(audioCueService_1.AudioCue.clear);
            }
        }
    };
    exports.NotificationsCenter = NotificationsCenter;
    exports.NotificationsCenter = NotificationsCenter = NotificationsCenter_1 = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, notification_1.INotificationService),
        __param(9, audioCueService_1.IAudioCueService),
        __param(10, contextView_1.IContextMenuService)
    ], NotificationsCenter);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc0NlbnRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvbm90aWZpY2F0aW9ucy9ub3RpZmljYXRpb25zQ2VudGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE2QnpGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsdUJBQVE7O2lCQUV4QixtQkFBYyxHQUFHLElBQUksZUFBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQUFBMUIsQ0FBMkI7aUJBRXpDLDZCQUF3QixHQUFHLEVBQUUsQUFBTCxDQUFNLEdBQUMsdUVBQXVFO1FBZTlILFlBQ2tCLFNBQXNCLEVBQ3RCLEtBQTBCLEVBQzVCLFlBQTJCLEVBQ25CLG9CQUE0RCxFQUMxRCxhQUF1RCxFQUM1RCxpQkFBc0QsRUFDcEQsa0JBQXlELEVBQzNELGlCQUFzRCxFQUNwRCxtQkFBMEQsRUFDOUQsZUFBa0QsRUFDL0Msa0JBQXdEO1lBRTdFLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQVpILGNBQVMsR0FBVCxTQUFTLENBQWE7WUFDdEIsVUFBSyxHQUFMLEtBQUssQ0FBcUI7WUFFSCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3pDLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUMzQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ25DLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBc0I7WUFDMUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNuQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQzdDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUM5Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBeEI3RCwyQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxD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