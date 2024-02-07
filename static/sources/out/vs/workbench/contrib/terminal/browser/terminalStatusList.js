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
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/base/browser/window"], function (require, exports, codicons_1, event_1, lifecycle_1, severity_1, configuration_1, colorRegistry_1, iconRegistry_1, themables_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getColorForSeverity = exports.TerminalStatusList = exports.TerminalStatus = void 0;
    /**
     * The set of _internal_ terminal statuses, other components building on the terminal should put
     * their statuses within their component.
     */
    var TerminalStatus;
    (function (TerminalStatus) {
        TerminalStatus["Bell"] = "bell";
        TerminalStatus["Disconnected"] = "disconnected";
        TerminalStatus["RelaunchNeeded"] = "relaunch-needed";
        TerminalStatus["EnvironmentVariableInfoChangesActive"] = "env-var-info-changes-active";
        TerminalStatus["ShellIntegrationAttentionNeeded"] = "shell-integration-attention-needed";
    })(TerminalStatus || (exports.TerminalStatus = TerminalStatus = {}));
    let TerminalStatusList = class TerminalStatusList extends lifecycle_1.Disposable {
        get onDidAddStatus() { return this._onDidAddStatus.event; }
        get onDidRemoveStatus() { return this._onDidRemoveStatus.event; }
        get onDidChangePrimaryStatus() { return this._onDidChangePrimaryStatus.event; }
        constructor(_configurationService) {
            super();
            this._configurationService = _configurationService;
            this._statuses = new Map();
            this._statusTimeouts = new Map();
            this._onDidAddStatus = this._register(new event_1.Emitter());
            this._onDidRemoveStatus = this._register(new event_1.Emitter());
            this._onDidChangePrimaryStatus = this._register(new event_1.Emitter());
        }
        get primary() {
            let result;
            for (const s of this._statuses.values()) {
                if (!result || s.severity >= result.severity) {
                    if (s.icon || !result?.icon) {
                        result = s;
                    }
                }
            }
            return result;
        }
        get statuses() { return Array.from(this._statuses.values()); }
        add(status, duration) {
            status = this._applyAnimationSetting(status);
            const outTimeout = this._statusTimeouts.get(status.id);
            if (outTimeout) {
                window_1.mainWindow.clearTimeout(outTimeout);
                this._statusTimeouts.delete(status.id);
            }
            if (duration && duration > 0) {
                const timeout = window_1.mainWindow.setTimeout(() => this.remove(status), duration);
                this._statusTimeouts.set(status.id, timeout);
            }
            const existingStatus = this._statuses.get(status.id);
            if (existingStatus && existingStatus !== status) {
                this._onDidRemoveStatus.fire(existingStatus);
                this._statuses.delete(existingStatus.id);
            }
            if (!this._statuses.has(status.id)) {
                const oldPrimary = this.primary;
                this._statuses.set(status.id, status);
                this._onDidAddStatus.fire(status);
                const newPrimary = this.primary;
                if (oldPrimary !== newPrimary) {
                    this._onDidChangePrimaryStatus.fire(newPrimary);
                }
            }
        }
        remove(statusOrId) {
            const status = typeof statusOrId === 'string' ? this._statuses.get(statusOrId) : statusOrId;
            // Verify the status is the same as the one passed in
            if (status && this._statuses.get(status.id)) {
                const wasPrimary = this.primary?.id === status.id;
                this._statuses.delete(status.id);
                this._onDidRemoveStatus.fire(status);
                if (wasPrimary) {
                    this._onDidChangePrimaryStatus.fire(this.primary);
                }
            }
        }
        toggle(status, value) {
            if (value) {
                this.add(status);
            }
            else {
                this.remove(status);
            }
        }
        _applyAnimationSetting(status) {
            if (!status.icon || themables_1.ThemeIcon.getModifier(status.icon) !== 'spin' || this._configurationService.getValue("terminal.integrated.tabs.enableAnimation" /* TerminalSettingId.TabsEnableAnimation */)) {
                return status;
            }
            let icon;
            // Loading without animation is just a curved line that doesn't mean anything
            if (status.icon.id === iconRegistry_1.spinningLoading.id) {
                icon = codicons_1.Codicon.play;
            }
            else {
                icon = themables_1.ThemeIcon.modify(status.icon, undefined);
            }
            // Clone the status when changing the icon so that setting changes are applied without a
            // reload being needed
            return {
                ...status,
                icon
            };
        }
    };
    exports.TerminalStatusList = TerminalStatusList;
    exports.TerminalStatusList = TerminalStatusList = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], TerminalStatusList);
    function getColorForSeverity(severity) {
        switch (severity) {
            case severity_1.default.Error:
                return colorRegistry_1.listErrorForeground;
            case severity_1.default.Warning:
                return colorRegistry_1.listWarningForeground;
            default:
                return '';
        }
    }
    exports.getColorForSeverity = getColorForSeverity;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxTdGF0dXNMaXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsU3RhdHVzTGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjaEc7OztPQUdHO0lBQ0gsSUFBa0IsY0FNakI7SUFORCxXQUFrQixjQUFjO1FBQy9CLCtCQUFhLENBQUE7UUFDYiwrQ0FBNkIsQ0FBQTtRQUM3QixvREFBa0MsQ0FBQTtRQUNsQyxzRkFBb0UsQ0FBQTtRQUNwRSx3RkFBc0UsQ0FBQTtJQUN2RSxDQUFDLEVBTmlCLGNBQWMsOEJBQWQsY0FBYyxRQU0vQjtJQXlCTSxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLHNCQUFVO1FBS2pELElBQUksY0FBYyxLQUE2QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUVuRixJQUFJLGlCQUFpQixLQUE2QixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRXpGLElBQUksd0JBQXdCLEtBQXlDLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFbkgsWUFDd0IscUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBRmdDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFYcEUsY0FBUyxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ3BELG9CQUFlLEdBQXdCLElBQUksR0FBRyxFQUFFLENBQUM7WUFFakQsb0JBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFtQixDQUFDLENBQUM7WUFFakUsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FB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