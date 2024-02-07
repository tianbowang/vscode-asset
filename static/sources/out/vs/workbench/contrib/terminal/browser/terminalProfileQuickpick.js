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
define(["require", "exports", "vs/base/common/codicons", "vs/platform/configuration/common/configuration", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/nls", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/theme/common/iconRegistry", "vs/base/common/path", "vs/platform/notification/common/notification"], function (require, exports, codicons_1, configuration_1, quickInput_1, terminalIcon_1, terminalIcons_1, nls, themeService_1, themables_1, terminal_1, iconRegistry_1, path_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalProfileQuickpick = void 0;
    let TerminalProfileQuickpick = class TerminalProfileQuickpick {
        constructor(_terminalProfileService, _terminalProfileResolverService, _configurationService, _quickInputService, _themeService, _notificationService) {
            this._terminalProfileService = _terminalProfileService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._configurationService = _configurationService;
            this._quickInputService = _quickInputService;
            this._themeService = _themeService;
            this._notificationService = _notificationService;
        }
        async showAndGetResult(type) {
            const platformKey = await this._terminalProfileService.getPlatformKey();
            const profilesKey = "terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey;
            const result = await this._createAndShow(type);
            const defaultProfileKey = `${"terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */}${platformKey}`;
            if (!result) {
                return;
            }
            if (type === 'setDefault') {
                if ('command' in result.profile) {
                    return; // Should never happen
                }
                else if ('id' in result.profile) {
                    // extension contributed profile
                    await this._configurationService.updateValue(defaultProfileKey, result.profile.title, 2 /* ConfigurationTarget.USER */);
                    return {
                        config: {
                            extensionIdentifier: result.profile.extensionIdentifier,
                            id: result.profile.id,
                            title: result.profile.title,
                            options: {
                                color: result.profile.color,
                                icon: result.profile.icon
                            }
                        },
                        keyMods: result.keyMods
                    };
                }
                // Add the profile to settings if necessary
                if ('isAutoDetected' in result.profile) {
                    const profilesConfig = await this._configurationService.getValue(profilesKey);
                    if (typeof profilesConfig === 'object') {
                        const newProfile = {
                            path: result.profile.path
                        };
                        if (result.profile.args) {
                            newProfile.args = result.profile.args;
                        }
                        profilesConfig[result.profile.profileName] = newProfile;
                    }
                    await this._configurationService.updateValue(profilesKey, profilesConfig, 2 /* ConfigurationTarget.USER */);
                }
                // Set the default profile
                await this._configurationService.updateValue(defaultProfileKey, result.profileName, 2 /* ConfigurationTarget.USER */);
            }
            else if (type === 'createInstance') {
                if ('id' in result.profile) {
                    return {
                        config: {
                            extensionIdentifier: result.profile.extensionIdentifier,
                            id: result.profile.id,
                            title: result.profile.title,
                            options: {
                                icon: result.profile.icon,
                                color: result.profile.color,
                            }
                        },
                        keyMods: result.keyMods
                    };
                }
                else {
                    return { config: result.profile, keyMods: result.keyMods };
                }
            }
            // for tests
            return 'profileName' in result.profile ? result.profile.profileName : result.profile.title;
        }
        async _createAndShow(type) {
            const platformKey = await this._terminalProfileService.getPlatformKey();
            const profiles = this._terminalProfileService.availableProfiles;
            const profilesKey = "terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey;
            const defaultProfileName = this._terminalProfileService.getDefaultProfileName();
            let keyMods;
            const options = {
                placeHolder: type === 'createInstance' ? nls.localize('terminal.integrated.selectProfileToCreate', "Select the terminal profile to create") : nls.localize('terminal.integrated.chooseDefaultProfile', "Select your default terminal profile"),
                onDidTriggerItemButton: async (context) => {
                    // Get the user's explicit permission to use a potentially unsafe path
                    if (!await this._isProfileSafe(context.item.profile)) {
                        return;
                    }
                    if ('command' in context.item.profile) {
                        return;
                    }
                    if ('id' in context.item.profile) {
                        return;
                    }
                    const configProfiles = this._configurationService.getValue("terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey);
                    const existingProfiles = !!configProfiles ? Object.keys(configProfiles) : [];
                    const name = await this._quickInputService.input({
                        prompt: nls.localize('enterTerminalProfileName', "Enter terminal profile name"),
                        value: context.item.profile.profileName,
                        validateInput: async (input) => {
                            if (existingProfiles.includes(input)) {
                                return nls.localize('terminalProfileAlreadyExists', "A terminal profile already exists with that name");
                            }
                            return undefined;
                        }
                    });
                    if (!name) {
                        return;
                    }
                    const newConfigValue = { ...configProfiles };
                    newConfigValue[name] = {
                        path: context.item.profile.path,
                        args: context.item.profile.args
                    };
                    await this._configurationService.updateValue(profilesKey, newConfigValue, 2 /* ConfigurationTarget.USER */);
                },
                onKeyMods: mods => keyMods = mods
            };
            // Build quick pick items
            const quickPickItems = [];
            const configProfiles = profiles.filter(e => !e.isAutoDetected);
            const autoDetectedProfiles = profiles.filter(e => e.isAutoDetected);
            if (configProfiles.length > 0) {
                quickPickItems.push({ type: 'separator', label: nls.localize('terminalProfiles', "profiles") });
                quickPickItems.push(...this._sortProfileQuickPickItems(configProfiles.map(e => this._createProfileQuickPickItem(e)), defaultProfileName));
            }
            quickPickItems.push({ type: 'separator', label: nls.localize('ICreateContributedTerminalProfileOptions', "contributed") });
            const contributedProfiles = [];
            for (const contributed of this._terminalProfileService.contributedProfiles) {
                let icon;
                if (typeof contributed.icon === 'string') {
                    if (contributed.icon.startsWith('$(')) {
                        icon = themables_1.ThemeIcon.fromString(contributed.icon);
                    }
                    else {
                        icon = themables_1.ThemeIcon.fromId(contributed.icon);
                    }
                }
                if (!icon || !(0, iconRegistry_1.getIconRegistry)().getIcon(icon.id)) {
                    icon = this._terminalProfileResolverService.getDefaultIcon();
                }
                const uriClasses = (0, terminalIcon_1.getUriClasses)(contributed, this._themeService.getColorTheme().type, true);
                const colorClass = (0, terminalIcon_1.getColorClass)(contributed);
                const iconClasses = [];
                if (uriClasses) {
                    iconClasses.push(...uriClasses);
                }
                if (colorClass) {
                    iconClasses.push(colorClass);
                }
                contributedProfiles.push({
                    label: `$(${icon.id}) ${contributed.title}`,
                    profile: {
                        extensionIdentifier: contributed.extensionIdentifier,
                        title: contributed.title,
                        icon: contributed.icon,
                        id: contributed.id,
                        color: contributed.color
                    },
                    profileName: contributed.title,
                    iconClasses
                });
            }
            if (contributedProfiles.length > 0) {
                quickPickItems.push(...this._sortProfileQuickPickItems(contributedProfiles, defaultProfileName));
            }
            if (autoDetectedProfiles.length > 0) {
                quickPickItems.push({ type: 'separator', label: nls.localize('terminalProfiles.detected', "detected") });
                quickPickItems.push(...this._sortProfileQuickPickItems(autoDetectedProfiles.map(e => this._createProfileQuickPickItem(e)), defaultProfileName));
            }
            const colorStyleDisposable = (0, terminalIcon_1.createColorStyleElement)(this._themeService.getColorTheme());
            const result = await this._quickInputService.pick(quickPickItems, options);
            colorStyleDisposable.dispose();
            if (!result) {
                return undefined;
            }
            if (!await this._isProfileSafe(result.profile)) {
                return undefined;
            }
            if (keyMods) {
                result.keyMods = keyMods;
            }
            return result;
        }
        async _isProfileSafe(profile) {
            const isUnsafePath = 'isUnsafePath' in profile && profile.isUnsafePath;
            const requiresUnsafePath = 'requiresUnsafePath' in profile && profile.requiresUnsafePath;
            if (!isUnsafePath && !requiresUnsafePath) {
                return true;
            }
            // Get the user's explicit permission to use a potentially unsafe path
            return await new Promise(r => {
                const unsafePaths = [];
                if (isUnsafePath) {
                    unsafePaths.push(profile.path);
                }
                if (requiresUnsafePath) {
                    unsafePaths.push(requiresUnsafePath);
                }
                // Notify about unsafe path(s). At the time of writing, multiple unsafe paths isn't
                // possible so the message is optimized for a single path.
                const handle = this._notificationService.prompt(notification_1.Severity.Warning, nls.localize('unsafePathWarning', 'This terminal profile uses a potentially unsafe path that can be modified by another user: {0}. Are you sure you want to use it?', `"${unsafePaths.join(',')}"`), [{
                        label: nls.localize('yes', 'Yes'),
                        run: () => r(true)
                    }, {
                        label: nls.localize('cancel', 'Cancel'),
                        run: () => r(false)
                    }]);
                handle.onDidClose(() => r(false));
            });
        }
        _createProfileQuickPickItem(profile) {
            const buttons = [{
                    iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.configureTerminalProfileIcon),
                    tooltip: nls.localize('createQuickLaunchProfile', "Configure Terminal Profile")
                }];
            const icon = (profile.icon && themables_1.ThemeIcon.isThemeIcon(profile.icon)) ? profile.icon : codicons_1.Codicon.terminal;
            const label = `$(${icon.id}) ${profile.profileName}`;
            const friendlyPath = profile.isFromPath ? (0, path_1.basename)(profile.path) : profile.path;
            const colorClass = (0, terminalIcon_1.getColorClass)(profile);
            const iconClasses = [];
            if (colorClass) {
                iconClasses.push(colorClass);
            }
            if (profile.args) {
                if (typeof profile.args === 'string') {
                    return { label, description: `${profile.path} ${profile.args}`, profile, profileName: profile.profileName, buttons, iconClasses };
                }
                const argsString = profile.args.map(e => {
                    if (e.includes(' ')) {
                        return `"${e.replace(/"/g, '\\"')}"`; // CodeQL [SM02383] js/incomplete-sanitization This is only used as a label on the UI so this isn't a problem
                    }
                    return e;
                }).join(' ');
                return { label, description: `${friendlyPath} ${argsString}`, profile, profileName: profile.profileName, buttons, iconClasses };
            }
            return { label, description: friendlyPath, profile, profileName: profile.profileName, buttons, iconClasses };
        }
        _sortProfileQuickPickItems(items, defaultProfileName) {
            return items.sort((a, b) => {
                if (b.profileName === defaultProfileName) {
                    return 1;
                }
                if (a.profileName === defaultProfileName) {
                    return -1;
                }
                return a.profileName.localeCompare(b.profileName);
            });
        }
    };
    exports.TerminalProfileQuickpick = TerminalProfileQuickpick;
    exports.TerminalProfileQuickpick = TerminalProfileQuickpick = __decorate([
        __param(0, terminal_1.ITerminalProfileService),
        __param(1, terminal_1.ITerminalProfileResolverService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, themeService_1.IThemeService),
        __param(5, notification_1.INotificationService)
    ], TerminalProfileQuickpick);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlUXVpY2twaWNrLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsUHJvZmlsZVF1aWNrcGljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQnpGLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXdCO1FBQ3BDLFlBQzJDLHVCQUFnRCxFQUN4QywrQkFBZ0UsRUFDMUUscUJBQTRDLEVBQy9DLGtCQUFzQyxFQUMzQyxhQUE0QixFQUNyQixvQkFBMEM7WUFMdkMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtZQUN4QyxvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWlDO1lBQzFFLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDL0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUMzQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUNyQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzlFLENBQUM7UUFFTCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBcUM7WUFDM0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDeEUsTUFBTSxXQUFXLEdBQUcsdUVBQWlDLFdBQVcsQ0FBQztZQUNqRSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLGdGQUFvQyxHQUFHLFdBQVcsRUFBRSxDQUFDO1lBQ2xGLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDYixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksSUFBSSxLQUFLLFlBQVksRUFBRSxDQUFDO2dCQUMzQixJ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