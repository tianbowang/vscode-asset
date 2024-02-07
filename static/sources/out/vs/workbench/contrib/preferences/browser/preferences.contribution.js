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
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/types", "vs/editor/browser/editorExtensions", "vs/editor/contrib/suggest/browser/suggest", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/label/common/label", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/preferences/browser/keybindingsEditor", "vs/workbench/contrib/preferences/browser/preferencesActions", "vs/workbench/contrib/preferences/browser/preferencesEditor", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/preferences/browser/settingsEditor2", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/preferences/common/preferencesContribution", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/preferences/browser/keybindingsEditorInput", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesEditorInput", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/editor/browser/editorBrowser", "vs/css!./media/preferences"], function (require, exports, keyCodes_1, lifecycle_1, network_1, types_1, editorExtensions_1, suggest_1, nls, actions_1, commands_1, contextkey_1, contextkeys_1, descriptors_1, instantiation_1, keybindingsRegistry_1, label_1, platform_1, workspace_1, workspaceCommands_1, editor_1, contributions_1, editor_2, contextkeys_2, files_1, keybindingsEditor_1, preferencesActions_1, preferencesEditor_1, preferencesIcons_1, settingsEditor2_1, preferences_1, preferencesContribution_1, editorService_1, environmentService_1, extensions_1, keybindingsEditorInput_1, preferences_2, preferencesEditorInput_1, userDataProfile_1, userDataProfile_2, editorBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const SETTINGS_EDITOR_COMMAND_SEARCH = 'settings.action.search';
    const SETTINGS_EDITOR_COMMAND_FOCUS_FILE = 'settings.action.focusSettingsFile';
    const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH = 'settings.action.focusSettingsFromSearch';
    const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST = 'settings.action.focusSettingsList';
    const SETTINGS_EDITOR_COMMAND_FOCUS_TOC = 'settings.action.focusTOC';
    const SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL = 'settings.action.focusSettingControl';
    const SETTINGS_EDITOR_COMMAND_FOCUS_UP = 'settings.action.focusLevelUp';
    const SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON = 'settings.switchToJSON';
    const SETTINGS_EDITOR_COMMAND_FILTER_ONLINE = 'settings.filterByOnline';
    const SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED = 'settings.filterUntrusted';
    const SETTINGS_COMMAND_OPEN_SETTINGS = 'workbench.action.openSettings';
    const SETTINGS_COMMAND_FILTER_TELEMETRY = 'settings.filterByTelemetry';
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(settingsEditor2_1.SettingsEditor2, settingsEditor2_1.SettingsEditor2.ID, nls.localize('settingsEditor2', "Settings Editor 2")), [
        new descriptors_1.SyncDescriptor(preferencesEditorInput_1.SettingsEditor2Input)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(keybindingsEditor_1.KeybindingsEditor, keybindingsEditor_1.KeybindingsEditor.ID, nls.localize('keybindingsEditor', "Keybindings Editor")), [
        new descriptors_1.SyncDescriptor(keybindingsEditorInput_1.KeybindingsEditorInput)
    ]);
    class KeybindingsEditorInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(keybindingsEditorInput_1.KeybindingsEditorInput);
        }
    }
    class SettingsEditor2InputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(input) {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(preferencesEditorInput_1.SettingsEditor2Input);
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(keybindingsEditorInput_1.KeybindingsEditorInput.ID, KeybindingsEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(preferencesEditorInput_1.SettingsEditor2Input.ID, SettingsEditor2InputSerializer);
    const OPEN_USER_SETTINGS_UI_TITLE = { value: nls.localize('openSettings2', "Open Settings (UI)"), original: 'Open Settings (UI)' };
    const OPEN_USER_SETTINGS_JSON_TITLE = { value: nls.localize('openUserSettingsJson', "Open User Settings (JSON)"), original: 'Open User Settings (JSON)' };
    const OPEN_APPLICATION_SETTINGS_JSON_TITLE = { value: nls.localize('openApplicationSettingsJson', "Open Application Settings (JSON)"), original: 'Open Application Settings (JSON)' };
    const category = { value: nls.localize('preferences', "Preferences"), original: 'Preferences' };
    function sanitizeBoolean(arg) {
        return (0, types_1.isBoolean)(arg) ? arg : undefined;
    }
    function sanitizeString(arg) {
        return (0, types_1.isString)(arg) ? arg : undefined;
    }
    function sanitizeOpenSettingsArgs(args) {
        if (!(0, types_1.isObject)(args)) {
            args = {};
        }
        let sanitizedObject = {
            focusSearch: sanitizeBoolean(args?.focusSearch),
            openToSide: sanitizeBoolean(args?.openToSide),
            query: sanitizeString(args?.query)
        };
        if ((0, types_1.isString)(args?.revealSetting?.key)) {
            sanitizedObject = {
                ...sanitizedObject,
                revealSetting: {
                    key: args.revealSetting.key,
                    edit: sanitizeBoolean(args.revealSetting?.edit)
                }
            };
        }
        return sanitizedObject;
    }
    let PreferencesActionsContribution = class PreferencesActionsContribution extends lifecycle_1.Disposable {
        constructor(environmentService, userDataProfileService, preferencesService, workspaceContextService, labelService, extensionService, userDataProfilesService) {
            super();
            this.environmentService = environmentService;
            this.userDataProfileService = userDataProfileService;
            this.preferencesService = preferencesService;
            this.workspaceContextService = workspaceContextService;
            this.labelService = labelService;
            this.extensionService = extensionService;
            this.userDataProfilesService = userDataProfilesService;
            this.registerSettingsActions();
            this.registerKeybindingsActions();
            this.updatePreferencesEditorMenuItem();
            this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.updatePreferencesEditorMenuItem()));
            this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.updatePreferencesEditorMenuItemForWorkspaceFolders()));
        }
        registerSettingsActions() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_COMMAND_OPEN_SETTINGS,
                        title: {
                            value: nls.localize('settings', "Settings"),
                            mnemonicTitle: nls.localize({ key: 'miOpenSettings', comment: ['&& denotes a mnemonic'] }, "&&Settings"),
                            original: 'Settings'
                        },
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null,
                            primary: 2048 /* KeyMod.CtrlCmd */ | 87 /* KeyCode.Comma */,
                        },
                        menu: [{
                                id: actions_1.MenuId.GlobalActivity,
                                group: '2_configuration',
                                order: 2
                            }, {
                                id: actions_1.MenuId.MenubarPreferencesMenu,
                                group: '2_configuration',
                                order: 2
                            }],
                    });
                }
                run(accessor, args) {
                    // args takes a string for backcompat
                    const opts = typeof args === 'string' ? { query: args } : sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openSettings(opts);
                }
            }));
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openSettings2',
                        title: { value: nls.localize('openSettings2', "Open Settings (UI)"), original: 'Open Settings (UI)' },
                        category,
                        f1: true,
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openSettings({ jsonEditor: false, ...args });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openSettingsJson',
                        title: OPEN_USER_SETTINGS_JSON_TITLE,
                        category,
                        f1: true,
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openSettings({ jsonEditor: true, ...args });
                }
            });
            const that = this;
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openApplicationSettingsJson',
                        title: OPEN_APPLICATION_SETTINGS_JSON_TITLE,
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkey_1.ContextKeyExpr.notEquals(userDataProfile_1.CURRENT_PROFILE_CONTEXT.key, that.userDataProfilesService.defaultProfile.id)
                        }
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openApplicationSettings({ jsonEditor: true, ...args });
                }
            });
            // Opens the User tab of the Settings editor
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openGlobalSettings',
                        title: { value: nls.localize('openGlobalSettings', "Open User Settings"), original: 'Open User Settings' },
                        category,
                        f1: true,
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openUserSettings(args);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openRawDefaultSettings',
                        title: { value: nls.localize('openRawDefaultSettings', "Open Default Settings (JSON)"), original: 'Open Default Settings (JSON)' },
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openRawDefaultSettings();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferencesActions_1.ConfigureLanguageBasedSettingsAction.ID,
                        title: preferencesActions_1.ConfigureLanguageBasedSettingsAction.LABEL,
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(instantiation_1.IInstantiationService).createInstance(preferencesActions_1.ConfigureLanguageBasedSettingsAction, preferencesActions_1.ConfigureLanguageBasedSettingsAction.ID, preferencesActions_1.ConfigureLanguageBasedSettingsAction.LABEL.value).run();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openWorkspaceSettings',
                        title: { value: nls.localize('openWorkspaceSettings', "Open Workspace Settings"), original: 'Open Workspace Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.notEqualsTo('empty')
                        }
                    });
                }
                run(accessor, args) {
                    // Match the behaviour of workbench.action.openSettings
                    args = typeof args === 'string' ? { query: args } : sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openWorkspaceSettings(args);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openAccessibilitySettings',
                        title: { value: nls.localize('openAccessibilitySettings', "Open Accessibility Settings"), original: 'Open Accessibility Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.notEqualsTo('empty')
                        }
                    });
                }
                async run(accessor) {
                    await accessor.get(preferences_2.IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:accessibility' });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openWorkspaceSettingsFile',
                        title: { value: nls.localize('openWorkspaceSettingsFile', "Open Workspace Settings (JSON)"), original: 'Open Workspace Settings (JSON)' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.notEqualsTo('empty')
                        }
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(preferences_2.IPreferencesService).openWorkspaceSettings({ jsonEditor: true, ...args });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openFolderSettings',
                        title: { value: nls.localize('openFolderSettings', "Open Folder Settings"), original: 'Open Folder Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.isEqualTo('workspace')
                        }
                    });
                }
                async run(accessor, args) {
                    const commandService = accessor.get(commands_1.ICommandService);
                    const preferencesService = accessor.get(preferences_2.IPreferencesService);
                    const workspaceFolder = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
                    if (workspaceFolder) {
                        args = sanitizeOpenSettingsArgs(args);
                        await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, ...args });
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openFolderSettingsFile',
                        title: { value: nls.localize('openFolderSettingsFile', "Open Folder Settings (JSON)"), original: 'Open Folder Settings (JSON)' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.isEqualTo('workspace')
                        }
                    });
                }
                async run(accessor, args) {
                    const commandService = accessor.get(commands_1.ICommandService);
                    const preferencesService = accessor.get(preferences_2.IPreferencesService);
                    const workspaceFolder = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
                    if (workspaceFolder) {
                        args = sanitizeOpenSettingsArgs(args);
                        await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true, ...args });
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: '_workbench.action.openFolderSettings',
                        title: { value: nls.localize('openFolderSettings', "Open Folder Settings"), original: 'Open Folder Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.ExplorerContext,
                            group: '2_workspace',
                            order: 20,
                            when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext, files_1.ExplorerFolderContext)
                        }
                    });
                }
                run(accessor, resource) {
                    return accessor.get(preferences_2.IPreferencesService).openFolderSettings({ folderUri: resource });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
                        title: nls.localize({ key: 'miOpenOnlineSettings', comment: ['&& denotes a mnemonic'] }, "&&Online Services Settings"),
                        menu: {
                            id: actions_1.MenuId.MenubarPreferencesMenu,
                            group: '3_settings',
                            order: 1,
                        }
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.SettingsEditor2) {
                        editorPane.focusSearch(`@tag:usesOnlineServices`);
                    }
                    else {
                        accessor.get(preferences_2.IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:usesOnlineServices' });
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED,
                        title: { value: nls.localize('filterUntrusted', "Show untrusted workspace settings"), original: 'Show untrusted workspace settings' },
                    });
                }
                run(accessor) {
                    accessor.get(preferences_2.IPreferencesService).openWorkspaceSettings({ jsonEditor: false, query: `@tag:${preferences_1.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}` });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_COMMAND_FILTER_TELEMETRY,
                        title: nls.localize({ key: 'miOpenTelemetrySettings', comment: ['&& denotes a mnemonic'] }, "&&Telemetry Settings")
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.SettingsEditor2) {
                        editorPane.focusSearch(`@tag:telemetry`);
                    }
                    else {
                        accessor.get(preferences_2.IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:telemetry' });
                    }
                }
            });
            this.registerSettingsEditorActions();
            this.extensionService.whenInstalledExtensionsRegistered()
                .then(() => {
                const remoteAuthority = this.environmentService.remoteAuthority;
                const hostLabel = this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority) || remoteAuthority;
                const label = nls.localize('openRemoteSettings', "Open Remote Settings ({0})", hostLabel);
                (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: 'workbench.action.openRemoteSettings',
                            title: { value: label, original: `Open Remote Settings (${hostLabel})` },
                            category,
                            menu: {
                                id: actions_1.MenuId.CommandPalette,
                                when: contextkeys_2.RemoteNameContext.notEqualsTo('')
                            }
                        });
                    }
                    run(accessor, args) {
                        args = sanitizeOpenSettingsArgs(args);
                        return accessor.get(preferences_2.IPreferencesService).openRemoteSettings(args);
                    }
                });
                const jsonLabel = nls.localize('openRemoteSettingsJSON', "Open Remote Settings (JSON) ({0})", hostLabel);
                (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: 'workbench.action.openRemoteSettingsFile',
                            title: { value: jsonLabel, original: `Open Remote Settings (JSON) (${hostLabel})` },
                            category,
                            menu: {
                                id: actions_1.MenuId.CommandPalette,
                                when: contextkeys_2.RemoteNameContext.notEqualsTo('')
                            }
                        });
                    }
                    run(accessor, args) {
                        args = sanitizeOpenSettingsArgs(args);
                        return accessor.get(preferences_2.IPreferencesService).openRemoteSettings({ jsonEditor: true, ...args });
                    }
                });
            });
        }
        registerSettingsEditorActions() {
            function getPreferencesEditor(accessor) {
                const activeEditorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                if (activeEditorPane instanceof settingsEditor2_1.SettingsEditor2) {
                    return activeEditorPane;
                }
                return null;
            }
            function settingsEditorFocusSearch(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                preferencesEditor?.focusSearch();
            }
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_SEARCH,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        keybinding: {
                            primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                            weight: 100 /* KeybindingWeight.EditorContrib */,
                            when: null
                        },
                        category,
                        f1: true,
                        title: { value: nls.localize('settings.focusSearch', "Focus Settings Search"), original: 'Focus Settings Search' }
                    });
                }
                run(accessor) { settingsEditorFocusSearch(accessor); }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        keybinding: {
                            primary: 9 /* KeyCode.Escape */,
                            weight: 100 /* KeybindingWeight.EditorContrib */,
                            when: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS
                        },
                        category,
                        f1: true,
                        title: { value: nls.localize('settings.clearResults', "Clear Settings Search Results"), original: 'Clear Settings Search Results' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    preferencesEditor?.clearSearchResults();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_FILE,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS, suggest_1.Context.Visible.toNegated()),
                        keybinding: {
                            primary: 18 /* KeyCode.DownArrow */,
                            weight: 100 /* KeybindingWeight.EditorContrib */,
                            when: null
                        },
                        title: nls.localize('settings.focusFile', "Focus settings file")
                    });
                }
                run(accessor, args) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    preferencesEditor?.focusSettings();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS, suggest_1.Context.Visible.toNegated()),
                        keybinding: {
                            primary: 18 /* KeyCode.DownArrow */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        title: nls.localize('settings.focusFile', "Focus settings file")
                    });
                }
                run(accessor, args) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    preferencesEditor?.focusSettings();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_TOC_ROW_FOCUS),
                        keybinding: {
                            primary: 3 /* KeyCode.Enter */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        title: nls.localize('settings.focusSettingsList', "Focus settings list")
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof settingsEditor2_1.SettingsEditor2) {
                        preferencesEditor.focusSettings();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_TOC,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        f1: true,
                        keybinding: [
                            {
                                primary: 15 /* KeyCode.LeftArrow */,
                                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                                when: preferences_1.CONTEXT_SETTINGS_ROW_FOCUS
                            }
                        ],
                        category,
                        title: { value: nls.localize('settings.focusSettingsTOC', "Focus Settings Table of Contents"), original: 'Focus Settings Table of Contents' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.SettingsEditor2)) {
                        return;
                    }
                    preferencesEditor.focusTOC();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_SETTINGS_ROW_FOCUS),
                        keybinding: {
                            primary: 3 /* KeyCode.Enter */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        },
                        title: nls.localize('settings.focusSettingControl', "Focus Setting Control")
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.SettingsEditor2)) {
                        return;
                    }
                    const activeElement = preferencesEditor.getContainer()?.ownerDocument.activeElement;
                    if (activeElement?.classList.contains('monaco-list')) {
                        preferencesEditor.focusSettings(true);
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        keybinding: {
                            primary: 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        f1: true,
                        category,
                        title: { value: nls.localize('settings.showContextMenu', "Show Setting Context Menu"), original: 'Show Setting Context Menu' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof settingsEditor2_1.SettingsEditor2) {
                        preferencesEditor.showContextMenu();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_UP,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS.toNegated(), preferences_1.CONTEXT_SETTINGS_JSON_EDITOR.toNegated()),
                        keybinding: {
                            primary: 9 /* KeyCode.Escape */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: null
                        },
                        f1: true,
                        category,
                        title: { value: nls.localize('settings.focusLevelUp', "Move Focus Up One Level"), original: 'Move Focus Up One Level' }
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.SettingsEditor2)) {
                        return;
                    }
                    if (preferencesEditor.currentFocusContext === 3 /* SettingsFocusContext.SettingControl */) {
                        preferencesEditor.focusSettings();
                    }
                    else if (preferencesEditor.currentFocusContext === 2 /* SettingsFocusContext.SettingTree */) {
                        preferencesEditor.focusTOC();
                    }
                    else if (preferencesEditor.currentFocusContext === 1 /* SettingsFocusContext.TableOfContents */) {
                        preferencesEditor.focusSearch();
                    }
                }
            });
        }
        registerKeybindingsActions() {
            const that = this;
            const category = { value: nls.localize('preferences', "Preferences"), original: 'Preferences' };
            const id = 'workbench.action.openGlobalKeybindings';
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id,
                        title: { value: nls.localize('openGlobalKeybindings', "Open Keyboard Shortcuts"), original: 'Open Keyboard Shortcuts' },
                        shortTitle: nls.localize('keyboardShortcuts', "Keyboard Shortcuts"),
                        category,
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                        keybinding: {
                            when: null,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */)
                        },
                        menu: [
                            { id: actions_1.MenuId.CommandPalette },
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkeys_2.ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString()),
                                group: 'navigation',
                                order: 1,
                            },
                            {
                                id: actions_1.MenuId.GlobalActivity,
                                group: '2_configuration',
                                order: 4
                            }
                        ]
                    });
                }
                run(accessor, args) {
                    const query = typeof args === 'string' ? args : undefined;
                    return accessor.get(preferences_2.IPreferencesService).openGlobalKeybindingSettings(false, { query });
                }
            }));
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                command: {
                    id,
                    title: nls.localize('keyboardShortcuts', "Keyboard Shortcuts"),
                },
                group: '2_configuration',
                order: 4
            }));
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openDefaultKeybindingsFile',
                        title: { value: nls.localize('openDefaultKeybindingsFile', "Open Default Keyboard Shortcuts (JSON)"), original: 'Open Default Keyboard Shortcuts (JSON)' },
                        category,
                        menu: { id: actions_1.MenuId.CommandPalette }
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openDefaultKeybindingsFile();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openGlobalKeybindingsFile',
                        title: { value: nls.localize('openGlobalKeybindingsFile', "Open Keyboard Shortcuts (JSON)"), original: 'Open Keyboard Shortcuts (JSON)' },
                        category,
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                        menu: [
                            { id: actions_1.MenuId.CommandPalette },
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: 'navigation',
                            }
                        ]
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openGlobalKeybindingSettings(true);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS,
                        title: { value: nls.localize('showDefaultKeybindings', "Show System Keybindings"), original: 'Show System Keyboard Shortcuts' },
                        menu: [
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.search('@source:system');
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS,
                        title: { value: nls.localize('showExtensionKeybindings', "Show Extension Keybindings"), original: 'Show Extension Keyboard Shortcuts' },
                        menu: [
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.search('@source:extension');
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS,
                        title: { value: nls.localize('showUserKeybindings', "Show User Keybindings"), original: 'Show User Keyboard Shortcuts' },
                        menu: [
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.search('@source:user');
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
                        title: nls.localize('clear', "Clear Search Results"),
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                            primary: 9 /* KeyCode.Escape */,
                        }
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.clearSearchResults();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY,
                        title: nls.localize('clearHistory', "Clear Keyboard Shortcuts Search History"),
                        category,
                        menu: [
                            {
                                id: actions_1.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.clearKeyboardShortcutSearchHistory();
                    }
                }
            });
            this.registerKeybindingEditorActions();
        }
        registerKeybindingEditorActions() {
            const that = this;
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS, preferences_1.CONTEXT_WHEN_FOCUS.toNegated()),
                primary: 3 /* KeyCode.Enter */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.defineKeybinding(editorPane.activeKeybindingEntry, false);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_ADD,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */),
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.defineKeybinding(editorPane.activeKeybindingEntry, true);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */),
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor && editorPane.activeKeybindingEntry.keybindingItem.keybinding) {
                        editorPane.defineWhenExpression(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_REMOVE,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS, contextkeys_1.InputFocusedContext.toNegated()),
                primary: 20 /* KeyCode.Delete */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
                },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.removeKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_RESET,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.resetKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SEARCH,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.focusSearch();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                primary: 512 /* KeyMod.Alt */ | 41 /* KeyCode.KeyK */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 41 /* KeyCode.KeyK */ },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.recordSearchKeys();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                primary: 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */ },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.toggleSortByPrecedence();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.showSimilarKeybindings(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS, preferences_1.CONTEXT_WHEN_FOCUS.negate()),
                primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        await editorPane.copyKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        await editorPane.copyKeybindingCommand(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        await editorPane.copyKeybindingCommandTitle(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.focusKeybindings();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_WHEN_FOCUS, suggest_1.Context.Visible.toNegated()),
                primary: 9 /* KeyCode.Escape */,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.rejectWhenExpression(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_WHEN_FOCUS, suggest_1.Context.Visible.toNegated()),
                primary: 3 /* KeyCode.Enter */,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.acceptWhenExpression(editorPane.activeKeybindingEntry);
                    }
                }
            });
            const profileScopedActionDisposables = this._register(new lifecycle_1.DisposableStore());
            const registerProfileScopedActions = () => {
                profileScopedActionDisposables.clear();
                profileScopedActionDisposables.add((0, actions_1.registerAction2)(class DefineKeybindingAction extends actions_1.Action2 {
                    constructor() {
                        const when = contextkeys_2.ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString());
                        super({
                            id: 'editor.action.defineKeybinding',
                            title: { value: nls.localize('defineKeybinding.start', "Define Keybinding"), original: 'Define Keybinding' },
                            f1: true,
                            precondition: when,
                            keybinding: {
                                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                                when,
                                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)
                            },
                            menu: {
                                id: actions_1.MenuId.EditorContent,
                                when,
                            }
                        });
                    }
                    async run(accessor) {
                        const codeEditor = accessor.get(editorService_1.IEditorService).activeTextEditorControl;
                        if ((0, editorBrowser_1.isCodeEditor)(codeEditor)) {
                            codeEditor.getContribution(preferences_2.DEFINE_KEYBINDING_EDITOR_CONTRIB_ID)?.showDefineKeybindingWidget();
                        }
                    }
                }));
            };
            registerProfileScopedActions();
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => registerProfileScopedActions()));
        }
        updatePreferencesEditorMenuItem() {
            const commandId = '_workbench.openWorkspaceSettingsEditor';
            if (this.workspaceContextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && !commands_1.CommandsRegistry.getCommand(commandId)) {
                commands_1.CommandsRegistry.registerCommand(commandId, () => this.preferencesService.openWorkspaceSettings({ jsonEditor: false }));
                actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
                    command: {
                        id: commandId,
                        title: OPEN_USER_SETTINGS_UI_TITLE,
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon
                    },
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_2.ResourceContextKey.Resource.isEqualTo(this.preferencesService.workspaceSettingsResource.toString()), contextkeys_2.WorkbenchStateContext.isEqualTo('workspace'), contextkey_1.ContextKeyExpr.not('isInDiffEditor')),
                    group: 'navigation',
                    order: 1
                });
            }
            this.updatePreferencesEditorMenuItemForWorkspaceFolders();
        }
        updatePreferencesEditorMenuItemForWorkspaceFolders() {
            for (const folder of this.workspaceContextService.getWorkspace().folders) {
                const commandId = `_workbench.openFolderSettings.${folder.uri.toString()}`;
                if (!commands_1.CommandsRegistry.getCommand(commandId)) {
                    commands_1.CommandsRegistry.registerCommand(commandId, () => {
                        if (this.workspaceContextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                            return this.preferencesService.openWorkspaceSettings({ jsonEditor: false });
                        }
                        else {
                            return this.preferencesService.openFolderSettings({ folderUri: folder.uri, jsonEditor: false });
                        }
                    });
                    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
                        command: {
                            id: commandId,
                            title: OPEN_USER_SETTINGS_UI_TITLE,
                            icon: preferencesIcons_1.preferencesOpenSettingsIcon
                        },
                        when: contextkey_1.ContextKeyExpr.and(contextkeys_2.ResourceContextKey.Resource.isEqualTo(this.preferencesService.getFolderSettingsResource(folder.uri).toString()), contextkey_1.ContextKeyExpr.not('isInDiffEditor')),
                        group: 'navigation',
                        order: 1
                    });
                }
            }
        }
    };
    PreferencesActionsContribution = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, userDataProfile_1.IUserDataProfileService),
        __param(2, preferences_2.IPreferencesService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, label_1.ILabelService),
        __param(5, extensions_1.IExtensionService),
        __param(6, userDataProfile_2.IUserDataProfilesService)
    ], PreferencesActionsContribution);
    let SettingsEditorTitleContribution = class SettingsEditorTitleContribution extends lifecycle_1.Disposable {
        constructor(userDataProfileService, userDataProfilesService) {
            super();
            this.userDataProfileService = userDataProfileService;
            this.userDataProfilesService = userDataProfilesService;
            this.registerSettingsEditorTitleActions();
        }
        registerSettingsEditorTitleActions() {
            const registerOpenUserSettingsEditorFromJsonActionDisposables = this._register(new lifecycle_1.MutableDisposable());
            const openUserSettingsEditorWhen = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkeys_2.ResourceContextKey.Resource.isEqualTo(this.userDataProfileService.currentProfile.settingsResource.toString()), contextkeys_2.ResourceContextKey.Resource.isEqualTo(this.userDataProfilesService.defaultProfile.settingsResource.toString())), contextkey_1.ContextKeyExpr.not('isInDiffEditor'));
            const registerOpenUserSettingsEditorFromJsonAction = () => {
                registerOpenUserSettingsEditorFromJsonActionDisposables.value = (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: '_workbench.openUserSettingsEditor',
                            title: OPEN_USER_SETTINGS_UI_TITLE,
                            icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                            menu: [{
                                    id: actions_1.MenuId.EditorTitle,
                                    when: openUserSettingsEditorWhen,
                                    group: 'navigation',
                                    order: 1
                                }]
                        });
                    }
                    run(accessor, args) {
                        args = sanitizeOpenSettingsArgs(args);
                        return accessor.get(preferences_2.IPreferencesService).openUserSettings({ jsonEditor: false, ...args });
                    }
                });
            };
            registerOpenUserSettingsEditorFromJsonAction();
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => {
                // Force the action to check the context again.
                registerOpenUserSettingsEditorFromJsonAction();
            }));
            const openSettingsJsonWhen = contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_SETTINGS_JSON_EDITOR.toNegated());
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON,
                        title: { value: nls.localize('openSettingsJson', "Open Settings (JSON)"), original: 'Open Settings (JSON)' },
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                        menu: [{
                                id: actions_1.MenuId.EditorTitle,
                                when: openSettingsJsonWhen,
                                group: 'navigation',
                                order: 1
                            }]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.SettingsEditor2) {
                        return editorPane.switchToSettingsFile();
                    }
                    return null;
                }
            });
        }
    };
    SettingsEditorTitleContribution = __decorate([
        __param(0, userDataProfile_1.IUserDataProfileService),
        __param(1, userDataProfile_2.IUserDataProfilesService)
    ], SettingsEditorTitleContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(PreferencesActionsContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(preferencesContribution_1.PreferencesContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(SettingsEditorTitleContribution, 3 /* LifecyclePhase.Restored */);
    (0, editorExtensions_1.registerEditorContribution)(preferencesEditor_1.SettingsEditorContribution.ID, preferencesEditor_1.SettingsEditorContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    // Preferences menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        title: nls.localize({ key: 'miPreferences', comment: ['&& denotes a mnemonic'] }, "&&Preferences"),
        submenu: actions_1.MenuId.MenubarPreferencesMenu,
        group: '5_autosave',
        order: 2,
        when: contextkeys_1.IsMacNativeContext.toNegated() // on macOS native the preferences menu is separate under the application menu
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL3ByZWZlcmVuY2VzLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQThDaEcsTUFBTSw4QkFBOEIsR0FBRyx3QkFBd0IsQ0FBQztJQUVoRSxNQUFNLGtDQUFrQyxHQUFHLG1DQUFtQyxDQUFDO0lBQy9FLE1BQU0sa0RBQWtELEdBQUcseUNBQXlDLENBQUM7SUFDckcsTUFBTSwyQ0FBMkMsR0FBRyxtQ0FBbUMsQ0FBQztJQUN4RixNQUFNLGlDQUFpQyxHQUFHLDBCQUEwQixDQUFDO0lBQ3JFLE1BQU0scUNBQXFDLEdBQUcscUNBQXFDLENBQUM7SUFDcEYsTUFBTSxnQ0FBZ0MsR0FBRyw4QkFBOEIsQ0FBQztJQUV4RSxNQUFNLHNDQUFzQyxHQUFHLHVCQUF1QixDQUFDO0lBQ3ZFLE1BQU0scUNBQXFDLEdBQUcseUJBQXlCLENBQUM7SUFDeEUsTUFBTSx3Q0FBd0MsR0FBRywwQkFBMEIsQ0FBQztJQUU1RSxNQUFNLDhCQUE4QixHQUFHLCtCQUErQixDQUFDO0lBQ3ZFLE1BQU0saUNBQWlDLEdBQUcsNEJBQTRCLENBQUM7SUFFdkUsbUJBQVEsQ0FBQyxFQUFFLENBQXNCLHlCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGtCQUFrQixDQUMvRSw2QkFBb0IsQ0FBQyxNQUFNLENBQzFCLGlDQUFlLEVBQ2YsaUNBQWUsQ0FBQyxFQUFFLEVBQ2xCLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUMsQ0FDcEQsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyw2Q0FBb0IsQ0FBQztLQUN4QyxDQUNELENBQUM7SUFFRixtQkFBUSxD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