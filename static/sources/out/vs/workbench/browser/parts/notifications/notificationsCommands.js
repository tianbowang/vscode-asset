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
define(["require", "exports", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/keyCodes", "vs/workbench/common/notifications", "vs/platform/actions/common/actions", "vs/nls", "vs/platform/list/browser/listService", "vs/platform/telemetry/common/telemetry", "vs/workbench/browser/parts/notifications/notificationsTelemetry", "vs/workbench/common/contextkeys", "vs/platform/notification/common/notification", "vs/platform/instantiation/common/instantiation", "vs/base/common/actions", "vs/base/common/hash", "vs/base/common/arrays", "vs/platform/quickinput/common/quickInput", "vs/base/common/lifecycle", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, commands_1, contextkey_1, keybindingsRegistry_1, keyCodes_1, notifications_1, actions_1, nls_1, listService_1, telemetry_1, notificationsTelemetry_1, contextkeys_1, notification_1, instantiation_1, actions_2, hash_1, arrays_1, quickInput_1, lifecycle_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationActionRunner = exports.registerNotificationCommands = exports.getNotificationFromContext = exports.TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE = exports.TOGGLE_DO_NOT_DISTURB_MODE = exports.CLEAR_ALL_NOTIFICATIONS = exports.CLEAR_NOTIFICATION = exports.ACCEPT_PRIMARY_ACTION_NOTIFICATION = exports.EXPAND_NOTIFICATION = exports.COLLAPSE_NOTIFICATION = exports.HIDE_NOTIFICATION_TOAST = exports.HIDE_NOTIFICATIONS_CENTER = exports.SHOW_NOTIFICATIONS_CENTER = void 0;
    // Center
    exports.SHOW_NOTIFICATIONS_CENTER = 'notifications.showList';
    exports.HIDE_NOTIFICATIONS_CENTER = 'notifications.hideList';
    const TOGGLE_NOTIFICATIONS_CENTER = 'notifications.toggleList';
    // Toasts
    exports.HIDE_NOTIFICATION_TOAST = 'notifications.hideToasts';
    const FOCUS_NOTIFICATION_TOAST = 'notifications.focusToasts';
    const FOCUS_NEXT_NOTIFICATION_TOAST = 'notifications.focusNextToast';
    const FOCUS_PREVIOUS_NOTIFICATION_TOAST = 'notifications.focusPreviousToast';
    const FOCUS_FIRST_NOTIFICATION_TOAST = 'notifications.focusFirstToast';
    const FOCUS_LAST_NOTIFICATION_TOAST = 'notifications.focusLastToast';
    // Notification
    exports.COLLAPSE_NOTIFICATION = 'notification.collapse';
    exports.EXPAND_NOTIFICATION = 'notification.expand';
    exports.ACCEPT_PRIMARY_ACTION_NOTIFICATION = 'notification.acceptPrimaryAction';
    const TOGGLE_NOTIFICATION = 'notification.toggle';
    exports.CLEAR_NOTIFICATION = 'notification.clear';
    exports.CLEAR_ALL_NOTIFICATIONS = 'notifications.clearAll';
    exports.TOGGLE_DO_NOT_DISTURB_MODE = 'notifications.toggleDoNotDisturbMode';
    exports.TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE = 'notifications.toggleDoNotDisturbModeBySource';
    function getNotificationFromContext(listService, context) {
        if ((0, notifications_1.isNotificationViewItem)(context)) {
            return context;
        }
        const list = listService.lastFocusedList;
        if (list instanceof listService_1.WorkbenchList) {
            let element = list.getFocusedElements()[0];
            if (!(0, notifications_1.isNotificationViewItem)(element)) {
                if (list.isDOMFocused()) {
                    // the notification list might have received focus
                    // via keyboard and might not have a focused element.
                    // in that case just return the first element
                    // https://github.com/microsoft/vscode/issues/191705
                    element = list.element(0);
                }
            }
            if ((0, notifications_1.isNotificationViewItem)(element)) {
                return element;
            }
        }
        return undefined;
    }
    exports.getNotificationFromContext = getNotificationFromContext;
    function registerNotificationCommands(center, toasts, model) {
        // Show Notifications Cneter
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.SHOW_NOTIFICATIONS_CENTER,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */),
            handler: () => {
                toasts.hide();
                center.show();
            }
        });
        // Hide Notifications Center
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.HIDE_NOTIFICATIONS_CENTER,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
            when: contextkeys_1.NotificationsCenterVisibleContext,
            primary: 9 /* KeyCode.Escape */,
            handler: accessor => {
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                for (const notification of model.notifications) {
                    if (notification.visible) {
                        telemetryService.publicLog2('notification:hide', (0, notificationsTelemetry_1.notificationToMetrics)(notification.message.original, notification.sourceId, notification.priority === notification_1.NotificationPriority.SILENT));
                    }
                }
                center.hide();
            }
        });
        // Toggle Notifications Center
        commands_1.CommandsRegistry.registerCommand(TOGGLE_NOTIFICATIONS_CENTER, () => {
            if (center.isVisible) {
                center.hide();
            }
            else {
                toasts.hide();
                center.show();
            }
        });
        // Clear Notification
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLEAR_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.NotificationFocusedContext,
            primary: 20 /* KeyCode.Delete */,
            mac: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
            },
            handler: (accessor, args) => {
                const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
                const notification = getNotificationFromContext(accessor.get(listService_1.IListService), args);
                if (notification && !notification.hasProgress) {
                    notification.close();
                    audioCueService.playAudioCue(audioCueService_1.AudioCue.clear);
                }
            }
        });
        // Expand Notification
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.EXPAND_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.NotificationFocusedContext,
            primary: 17 /* KeyCode.RightArrow */,
            handler: (accessor, args) => {
                const notification = getNotificationFromContext(accessor.get(listService_1.IListService), args);
                notification?.expand();
            }
        });
        // Accept Primary Action
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.ACCEPT_PRIMARY_ACTION_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.or(contextkeys_1.NotificationFocusedContext, contextkeys_1.NotificationsToastsVisibleContext),
            primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */,
            handler: (accessor) => {
                const actionRunner = accessor.get(instantiation_1.IInstantiationService).createInstance(NotificationActionRunner);
                const notification = getNotificationFromContext(accessor.get(listService_1.IListService)) || (0, arrays_1.firstOrDefault)(model.notifications);
                if (!notification) {
                    return;
                }
                const primaryAction = notification.actions?.primary ? (0, arrays_1.firstOrDefault)(notification.actions.primary) : undefined;
                if (!primaryAction) {
                    return;
                }
                actionRunner.run(primaryAction, notification);
                notification.close();
            }
        });
        // Collapse Notification
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.COLLAPSE_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.NotificationFocusedContext,
            primary: 15 /* KeyCode.LeftArrow */,
            handler: (accessor, args) => {
                const notification = getNotificationFromContext(accessor.get(listService_1.IListService), args);
                notification?.collapse();
            }
        });
        // Toggle Notification
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: TOGGLE_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.NotificationFocusedContext,
            primary: 10 /* KeyCode.Space */,
            secondary: [3 /* KeyCode.Enter */],
            handler: accessor => {
                const notification = getNotificationFromContext(accessor.get(listService_1.IListService));
                notification?.toggle();
            }
        });
        // Hide Toasts
        commands_1.CommandsRegistry.registerCommand(exports.HIDE_NOTIFICATION_TOAST, accessor => {
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            for (const notification of model.notifications) {
                if (notification.visible) {
                    telemetryService.publicLog2('notification:hide', (0, notificationsTelemetry_1.notificationToMetrics)(notification.message.original, notification.sourceId, notification.priority === notification_1.NotificationPriority.SILENT));
                }
            }
            toasts.hide();
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
            id: exports.HIDE_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ - 50, // lower when not focused (e.g. let editor suggest win over this command)
            when: contextkeys_1.NotificationsToastsVisibleContext,
            primary: 9 /* KeyCode.Escape */
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
            id: exports.HIDE_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100, // higher when focused
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationsToastsVisibleContext, contextkeys_1.NotificationFocusedContext),
            primary: 9 /* KeyCode.Escape */
        });
        // Focus Toasts
        commands_1.CommandsRegistry.registerCommand(FOCUS_NOTIFICATION_TOAST, () => toasts.focus());
        // Focus Next Toast
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: FOCUS_NEXT_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationFocusedContext, contextkeys_1.NotificationsToastsVisibleContext),
            primary: 18 /* KeyCode.DownArrow */,
            handler: () => {
                toasts.focusNext();
            }
        });
        // Focus Previous Toast
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: FOCUS_PREVIOUS_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationFocusedContext, contextkeys_1.NotificationsToastsVisibleContext),
            primary: 16 /* KeyCode.UpArrow */,
            handler: () => {
                toasts.focusPrevious();
            }
        });
        // Focus First Toast
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: FOCUS_FIRST_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationFocusedContext, contextkeys_1.NotificationsToastsVisibleContext),
            primary: 11 /* KeyCode.PageUp */,
            secondary: [14 /* KeyCode.Home */],
            handler: () => {
                toasts.focusFirst();
            }
        });
        // Focus Last Toast
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: FOCUS_LAST_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationFocusedContext, contextkeys_1.NotificationsToastsVisibleContext),
            primary: 12 /* KeyCode.PageDown */,
            secondary: [13 /* KeyCode.End */],
            handler: () => {
                toasts.focusLast();
            }
        });
        // Clear All Notifications
        commands_1.CommandsRegistry.registerCommand(exports.CLEAR_ALL_NOTIFICATIONS, () => center.clearAll());
        // Toggle Do Not Disturb Mode
        commands_1.CommandsRegistry.registerCommand(exports.TOGGLE_DO_NOT_DISTURB_MODE, accessor => {
            const notificationService = accessor.get(notification_1.INotificationService);
            notificationService.setFilter(notificationService.getFilter() === notification_1.NotificationsFilter.ERROR ? notification_1.NotificationsFilter.OFF : notification_1.NotificationsFilter.ERROR);
        });
        // Configure Do Not Disturb by Source
        commands_1.CommandsRegistry.registerCommand(exports.TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE, accessor => {
            const notificationService = accessor.get(notification_1.INotificationService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const sortedFilters = notificationService.getFilters().sort((a, b) => a.label.localeCompare(b.label));
            const disposables = new lifecycle_1.DisposableStore();
            const picker = disposables.add(quickInputService.createQuickPick());
            picker.items = sortedFilters.map(source => ({
                id: source.id,
                label: source.label,
                tooltip: `${source.label} (${source.id})`,
                filter: source.filter
            }));
            picker.canSelectMany = true;
            picker.placeholder = (0, nls_1.localize)('selectSources', "Select sources to enable notifications for");
            picker.selectedItems = picker.items.filter(item => item.filter === notification_1.NotificationsFilter.OFF);
            picker.show();
            disposables.add(picker.onDidAccept(async () => {
                for (const item of picker.items) {
                    notificationService.setFilter({
                        id: item.id,
                        label: item.label,
                        filter: picker.selectedItems.includes(item) ? notification_1.NotificationsFilter.OFF : notification_1.NotificationsFilter.ERROR
                    });
                }
                picker.hide();
            }));
            disposables.add(picker.onDidHide(() => disposables.dispose()));
        });
        // Commands for Command Palette
        const category = (0, nls_1.localize2)('notifications', 'Notifications');
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.SHOW_NOTIFICATIONS_CENTER, title: (0, nls_1.localize2)('showNotifications', 'Show Notifications'), category } });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.HIDE_NOTIFICATIONS_CENTER, title: (0, nls_1.localize2)('hideNotifications', 'Hide Notifications'), category }, when: contextkeys_1.NotificationsCenterVisibleContext });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.CLEAR_ALL_NOTIFICATIONS, title: (0, nls_1.localize2)('clearAllNotifications', 'Clear All Notifications'), category } });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.ACCEPT_PRIMARY_ACTION_NOTIFICATION, title: (0, nls_1.localize2)('acceptNotificationPrimaryAction', 'Accept Notification Primary Action'), category } });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.TOGGLE_DO_NOT_DISTURB_MODE, title: (0, nls_1.localize2)('toggleDoNotDisturbMode', 'Toggle Do Not Disturb Mode'), category } });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE, title: (0, nls_1.localize2)('toggleDoNotDisturbModeBySource', 'Toggle Do Not Disturb Mode By Source...'), category } });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: FOCUS_NOTIFICATION_TOAST, title: (0, nls_1.localize2)('focusNotificationToasts', 'Focus Notification Toast'), category }, when: contextkeys_1.NotificationsToastsVisibleContext });
    }
    exports.registerNotificationCommands = registerNotificationCommands;
    let NotificationActionRunner = class NotificationActionRunner extends actions_2.ActionRunner {
        constructor(telemetryService, notificationService) {
            super();
            this.telemetryService = telemetryService;
            this.notificationService = notificationService;
        }
        async runAction(action, context) {
            this.telemetryService.publicLog2('workbenchActionExecuted', { id: action.id, from: 'message' });
            if ((0, notifications_1.isNotificationViewItem)(context)) {
                // Log some additional telemetry specifically for actions
                // that are triggered from within notifications.
                this.telemetryService.publicLog2('notification:actionExecuted', {
                    id: (0, hash_1.hash)(context.message.original.toString()).toString(),
                    actionLabel: action.label,
                    source: context.sourceId || 'core',
                    silent: context.priority === notification_1.NotificationPriority.SILENT
                });
            }
            // Run and make sure to notify on any error again
            try {
                await super.runAction(action, context);
            }
            catch (error) {
                this.notificationService.error(error);
            }
        }
    };
    exports.NotificationActionRunner = NotificationActionRunner;
    exports.NotificationActionRunner = NotificationActionRunner = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, notification_1.INotificationService)
    ], NotificationActionRunner);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc0NvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9ub3RpZmljYXRpb25zL25vdGlmaWNhdGlvbnNDb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLFNBQVM7SUFDSSxRQUFBLHlCQUF5QixHQUFHLHdCQUF3QixDQUFDO0lBQ3JELFFBQUEseUJBQXlCLEdBQUcsd0JBQXdCLENBQUM7SUFDbEUsTUFBTSwyQkFBMkIsR0FBRywwQkFBMEIsQ0FBQztJQUUvRCxTQUFTO0lBQ0ksUUFBQSx1QkFBdUIsR0FBRywwQkFBMEIsQ0FBQztJQUNsRSxNQUFNLHdCQUF3QixHQUFHLDJCQUEyQixDQUFDO0lBQzdELE1BQU0sNkJBQTZCLEdBQUcsOEJBQThCLENBQUM7SUFDckUsTUFBTSxpQ0FBaUMsR0FBRyxrQ0FBa0MsQ0FBQztJQUM3RSxNQUFNLDhCQUE4QixHQUFHLCtCQUErQixDQUFDO0lBQ3ZFLE1BQU0sNkJBQTZCLEdBQUcsOEJBQThCLENBQUM7SUFFckUsZUFBZTtJQUNGLFFBQUEscUJBQXFCLEdBQUcsdUJBQXVCLENBQUM7SUFDaEQsUUFBQSxtQkFBbUIsR0FBRyxxQkFBcUIsQ0FBQztJQUM1QyxRQUFBLGtDQUFrQyxHQUFHLGtDQUFrQyxDQUFDO0lBQ3JGLE1BQU0sbUJBQW1CLEdBQUcscUJBQXFCLENBQUM7SUFDckMsUUFBQSxrQkFBa0IsR0FBRyxvQkFBb0IsQ0FBQztJQUMxQyxRQUFBLHVCQUF1QixHQUFHLHdCQUF3QixDQUFDO0lBQ25ELFFBQUEsMEJBQTBCLEdBQUcsc0NBQXNDLENBQUM7SUFDcEUsUUFBQSxvQ0FBb0MsR0FBRyw4Q0FBOEMsQ0FBQztJQXFCbkcsU0FBZ0IsMEJBQTBCLENBQUMsV0FBeUIsRUFBRSxPQUFp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