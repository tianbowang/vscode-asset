(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/severity", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, severity_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoOpProgress = exports.NoOpNotification = exports.NotificationsFilter = exports.isNotificationSource = exports.NeverShowAgainScope = exports.NotificationPriority = exports.INotificationService = exports.Severity = void 0;
    exports.Severity = severity_1.default;
    exports.INotificationService = (0, instantiation_1.createDecorator)('notificationService');
    var NotificationPriority;
    (function (NotificationPriority) {
        /**
         * Default priority: notification will be visible unless do not disturb mode is enabled.
         */
        NotificationPriority[NotificationPriority["DEFAULT"] = 0] = "DEFAULT";
        /**
         * Silent priority: notification will only be visible from the notifications center.
         */
        NotificationPriority[NotificationPriority["SILENT"] = 1] = "SILENT";
        /**
         * Urgent priority: notification will be visible even when do not disturb mode is enabled.
         */
        NotificationPriority[NotificationPriority["URGENT"] = 2] = "URGENT";
    })(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
    var NeverShowAgainScope;
    (function (NeverShowAgainScope) {
        /**
         * Will never show this notification on the current workspace again.
         */
        NeverShowAgainScope[NeverShowAgainScope["WORKSPACE"] = 0] = "WORKSPACE";
        /**
         * Will never show this notification on any workspace of the same
         * profile again.
         */
        NeverShowAgainScope[NeverShowAgainScope["PROFILE"] = 1] = "PROFILE";
        /**
         * Will never show this notification on any workspace across all
         * profiles again.
         */
        NeverShowAgainScope[NeverShowAgainScope["APPLICATION"] = 2] = "APPLICATION";
    })(NeverShowAgainScope || (exports.NeverShowAgainScope = NeverShowAgainScope = {}));
    function isNotificationSource(thing) {
        if (thing) {
            const candidate = thing;
            return typeof candidate.id === 'string' && typeof candidate.label === 'string';
        }
        return false;
    }
    exports.isNotificationSource = isNotificationSource;
    var NotificationsFilter;
    (function (NotificationsFilter) {
        /**
         * No filter is enabled.
         */
        NotificationsFilter[NotificationsFilter["OFF"] = 0] = "OFF";
        /**
         * All notifications are silent except error notifications.
        */
        NotificationsFilter[NotificationsFilter["ERROR"] = 1] = "ERROR";
    })(NotificationsFilter || (exports.NotificationsFilter = NotificationsFilter = {}));
    class NoOpNotification {
        constructor() {
            this.progress = new NoOpProgress();
            this.onDidClose = event_1.Event.None;
            this.onDidChangeVisibility = event_1.Event.None;
        }
        updateSeverity(severity) { }
        updateMessage(message) { }
        updateActions(actions) { }
        close() { }
    }
    exports.NoOpNotification = NoOpNotification;
    class NoOpProgress {
        infinite() { }
        done() { }
        total(value) { }
        worked(value) { }
    }
    exports.NoOpProgress = NoOpProgress;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9ub3RpZmljYXRpb24vY29tbW9uL25vdGlmaWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRbEYsUUFBQSxRQUFRLEdBQUcsa0JBQVksQ0FBQztJQUV6QixRQUFBLG9CQUFvQixHQUFHLElBQUEsK0JBQWUsRUFBdUIscUJBQXFCLENBQUMsQ0FBQztJQUlqRyxJQUFZLG9CQWdCWDtJQWhCRCxXQUFZLG9CQUFvQjtRQUUvQjs7V0FFRztRQUNILHFFQUFPLENBQUE7UUFFUDs7V0FFRztRQUNILG1FQUFNLENBQUE7UUFFTjs7V0FFRztRQUNILG1FQUFNLENBQUE7SUFDUCxDQUFDLEVBaEJXLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBZ0IvQjtJQXlCRCxJQUFZLG1CQWtCWDtJQWxCRCxXQUFZLG1CQUFtQjtRQUU5Qjs7V0FFRztRQUNILHVFQUFTLENBQUE7UUFFVDs7O1dBR0c7UUFDSCxtRUFBTyxDQUFBO1FBRVA7OztXQUdHO1FBQ0gsMkVBQVcsQ0FBQTtJQUNaLENBQUMsRUFsQlcsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFrQjlCO0lBb0NELFNBQWdCLG9CQUFvQixDQUFDLEtBQWM7UUFDbEQsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNYLE1BQU0sU0FBUyxHQUFHLEtBQTRCLENBQUM7WUFFL0MsT0FBTyxPQUFPLFNBQVMsQ0FBQyxFQUFFLEtBQUssUUFBUSxJQUFJLE9BQU8sU0FBUyxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUM7UUFDaEYsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQVJELG9EQVFDO0lBdU5ELElBQVksbUJBV1g7SUFYRCxXQUFZLG1CQUFtQjtRQUU5Qjs7V0FFRztRQUNILDJEQUFHLENBQUE7UUFFSDs7VUFFRTtRQUNGLCtEQUFLLENBQUE7SUFDTixDQUFDLEVBWFcsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFXOUI7SUEwR0QsTUFBYSxnQkFBZ0I7UUFBN0I7WUFFVSxhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUU5QixlQUFVLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUN4QiwwQkFBcUIsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1FBTzdDLENBQUM7UUFMQSxjQUFjLENBQUMsUUFBa0IsSUFBVSxDQUFDO1FBQzVDLGFBQWEsQ0FBQyxPQUE0QixJQUFVLENBQUM7UUFDckQsYUFBYSxDQUFDLE9BQThCLElBQVUsQ0FBQztRQUV2RCxLQUFLLEtBQVcsQ0FBQztLQUNqQjtJQVpELDRDQVlDO0lBRUQsTUFBYSxZQUFZO1FBQ3hCLFFBQVEsS0FBVyxDQUFDO1FBQ3BCLElBQUksS0FBVyxDQUFDO1FBQ2hCLEtBQUssQ0FBQyxLQUFhLElBQVUsQ0FBQztRQUM5QixNQUFNLENBQUMsS0FBYSxJQUFVLENBQUM7S0FDL0I7SUFMRCxvQ0FLQyJ9
//# sourceURL=../../../vs/platform/notification/common/notification.js
})