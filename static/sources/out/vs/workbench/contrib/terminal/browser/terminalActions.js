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
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/keyCodes", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalQuickAccess", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/terminal/common/terminalProfiles", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/history/common/history", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/editor/common/editorService", "vs/base/common/path", "vs/workbench/services/configurationResolver/common/variableResolver", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/common/history", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/base/common/cancellation", "vs/base/common/resources", "vs/editor/common/services/getIconClasses", "vs/platform/files/common/files", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/iterator", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/base/browser/dom", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/contrib/terminal/browser/terminalContextMenu", "vs/workbench/contrib/terminal/browser/terminalVoice", "vs/workbench/contrib/speech/common/speechService"], function (require, exports, canIUse_1, actions_1, codicons_1, keyCodes_1, network_1, platform_1, types_1, uri_1, codeEditorService_1, nls_1, accessibility_1, actions_2, commands_1, configuration_1, contextkey_1, instantiation_1, label_1, listService_1, notification_1, opener_1, quickInput_1, terminal_1, workspace_1, workspaceCommands_1, editorCommands_1, terminal_2, terminalQuickAccess_1, terminal_3, terminalContextKey_1, terminalProfiles_1, terminalStrings_1, configurationResolver_1, environmentService_1, history_1, preferences_1, remoteAgentService_1, editorService_1, path_1, variableResolver_1, themeService_1, terminalIcon_1, history_2, model_1, language_1, cancellation_1, resources_1, getIconClasses_1, files_1, clipboardService_1, terminalIcons_1, editorGroupsService_1, iterator_1, accessibilityConfiguration_1, dom_1, editorGroupColumn_1, terminalContextMenu_1, terminalVoice_1, speechService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shrinkWorkspaceFolderCwdPairs = exports.refreshTerminalActions = exports.validateTerminalName = exports.registerTerminalActions = exports.registerActiveXtermAction = exports.registerActiveInstanceAction = exports.registerContextualInstanceAction = exports.registerTerminalAction = exports.TerminalLaunchHelpAction = exports.terminalSendSequenceCommand = exports.getCwdForSplit = exports.switchTerminalShowTabsTitle = exports.switchTerminalActionViewItemSeparator = void 0;
    exports.switchTerminalActionViewItemSeparator = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';
    exports.switchTerminalShowTabsTitle = (0, nls_1.localize)('showTerminalTabs', "Show Tabs");
    const category = terminalStrings_1.terminalStrings.actionCategory;
    // Some terminal context keys get complicated. Since normalizing and/or context keys can be
    // expensive this is done once per context key and shared.
    const sharedWhenClause = (() => {
        const terminalAvailable = contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated);
        return {
            terminalAvailable,
            terminalAvailable_and_opened: contextkey_1.ContextKeyExpr.and(terminalAvailable, terminalContextKey_1.TerminalContextKeys.isOpen),
            terminalAvailable_and_editorActive: contextkey_1.ContextKeyExpr.and(terminalAvailable, terminalContextKey_1.TerminalContextKeys.terminalEditorActive),
            terminalAvailable_and_singularSelection: contextkey_1.ContextKeyExpr.and(terminalAvailable, terminalContextKey_1.TerminalContextKeys.tabsSingularSelection),
            focusInAny_and_normalBuffer: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.altBufferActive.negate())
        };
    })();
    async function getCwdForSplit(configHelper, instance, folders, commandService) {
        switch (configHelper.config.splitCwd) {
            case 'workspaceRoot':
                if (folders !== undefined && commandService !== undefined) {
                    if (folders.length === 1) {
                        return folders[0].uri;
                    }
                    else if (folders.length > 1) {
                        // Only choose a path when there's more than 1 folder
                        const options = {
                            placeHolder: (0, nls_1.localize)('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal")
                        };
                        const workspace = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                        if (!workspace) {
                            // Don't split the instance if the workspace picker was canceled
                            return undefined;
                        }
                        return Promise.resolve(workspace.uri);
                    }
                }
                return '';
            case 'initial':
                return instance.getInitialCwd();
            case 'inherited':
                return instance.getCwd();
        }
    }
    exports.getCwdForSplit = getCwdForSplit;
    const terminalSendSequenceCommand = async (accessor, args) => {
        const instance = accessor.get(terminal_2.ITerminalService).activeInstance;
        if (instance) {
            const text = (0, types_1.isObject)(args) && 'text' in args ? toOptionalString(args.text) : undefined;
            if (!text) {
                return;
            }
            const configurationResolverService = accessor.get(configurationResolver_1.IConfigurationResolverService);
            const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
            const historyService = accessor.get(history_1.IHistoryService);
            const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(instance.isRemote ? network_1.Schemas.vscodeRemote : network_1.Schemas.file);
            const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
            const resolvedText = await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, text);
            instance.sendText(resolvedText, false);
        }
    };
    exports.terminalSendSequenceCommand = terminalSendSequenceCommand;
    let TerminalLaunchHelpAction = class TerminalLaunchHelpAction extends actions_1.Action {
        constructor(_openerService) {
            super('workbench.action.terminal.launchHelp', (0, nls_1.localize)('terminalLaunchHelp', "Open Help"));
            this._openerService = _openerService;
        }
        async run() {
            this._openerService.open('https://aka.ms/vscode-troubleshoot-terminal-launch');
        }
    };
    exports.TerminalLaunchHelpAction = TerminalLaunchHelpAction;
    exports.TerminalLaunchHelpAction = TerminalLaunchHelpAction = __decorate([
        __param(0, opener_1.IOpenerService)
    ], TerminalLaunchHelpAction);
    /**
     * A wrapper function around registerAction2 to help make registering terminal actions more concise.
     * The following default options are used if undefined:
     *
     * - `f1`: true
     * - `category`: Terminal
     * - `precondition`: TerminalContextKeys.processSupported
     */
    function registerTerminalAction(options) {
        // Set defaults
        options.f1 = options.f1 ?? true;
        options.category = options.category ?? category;
        options.precondition = options.precondition ?? terminalContextKey_1.TerminalContextKeys.processSupported;
        // Remove run function from options so it's not passed through to registerAction2
        const runFunc = options.run;
        const strictOptions = options;
        delete strictOptions['run'];
        // Register
        return (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super(strictOptions);
            }
            run(accessor, args, args2) {
                return runFunc(getTerminalServices(accessor), accessor, args, args2);
            }
        });
    }
    exports.registerTerminalAction = registerTerminalAction;
    function parseActionArgs(args) {
        if (Array.isArray(args)) {
            if (args.every(e => e instanceof terminalContextMenu_1.InstanceContext)) {
                return args;
            }
        }
        else if (args instanceof terminalContextMenu_1.InstanceContext) {
            return [args];
        }
        return undefined;
    }
    /**
     * A wrapper around {@link registerTerminalAction} that runs a callback for all currently selected
     * instances provided in the action context. This falls back to the active instance if there are no
     * contextual instances provided.
     */
    function registerContextualInstanceAction(options) {
        const originalRun = options.run;
        return registerTerminalAction({
            ...options,
            run: async (c, accessor, focusedInstanceArgs, allInstanceArgs) => {
                let instances = getSelectedInstances2(accessor, allInstanceArgs);
                if (!instances) {
                    const activeInstance = (options.activeInstanceType === 'view'
                        ? c.groupService
                        : options.activeInstanceType === 'editor' ?
                            c.editorService
                            : c.service).activeInstance;
                    if (!activeInstance) {
                        return;
                    }
                    instances = [activeInstance];
                }
                const results = [];
                for (const instance of instances) {
                    results.push(originalRun(instance, c, accessor, focusedInstanceArgs));
                }
                await Promise.all(results);
                if (options.runAfter) {
                    options.runAfter(instances, c, accessor, focusedInstanceArgs);
                }
            }
        });
    }
    exports.registerContextualInstanceAction = registerContextualInstanceAction;
    /**
     * A wrapper around {@link registerTerminalAction} that ensures an active instance exists and
     * provides it to the run function.
     */
    function registerActiveInstanceAction(options) {
        const originalRun = options.run;
        return registerTerminalAction({
            ...options,
            run: (c, accessor, args) => {
                const activeInstance = c.service.activeInstance;
                if (activeInstance) {
                    return originalRun(activeInstance, c, accessor, args);
                }
            }
        });
    }
    exports.registerActiveInstanceAction = registerActiveInstanceAction;
    /**
     * A wrapper around {@link registerTerminalAction} that ensures an active terminal
     * exists and provides it to the run function.
     *
     * This includes detached xterm terminals that are not managed by an {@link ITerminalInstance}.
     */
    function registerActiveXtermAction(options) {
        const originalRun = options.run;
        return registerTerminalAction({
            ...options,
            run: (c, accessor, args) => {
                const activeDetached = iterator_1.Iterable.find(c.service.detachedInstances, d => d.xterm.isFocused);
                if (activeDetached) {
                    return originalRun(activeDetached.xterm, accessor, activeDetached, args);
                }
                const activeInstance = c.service.activeInstance;
                if (activeInstance?.xterm) {
                    return originalRun(activeInstance.xterm, accessor, activeInstance, args);
                }
            }
        });
    }
    exports.registerActiveXtermAction = registerActiveXtermAction;
    function getTerminalServices(accessor) {
        return {
            service: accessor.get(terminal_2.ITerminalService),
            groupService: accessor.get(terminal_2.ITerminalGroupService),
            instanceService: accessor.get(terminal_2.ITerminalInstanceService),
            editorService: accessor.get(terminal_2.ITerminalEditorService),
            profileService: accessor.get(terminal_3.ITerminalProfileService),
            profileResolverService: accessor.get(terminal_3.ITerminalProfileResolverService)
        };
    }
    function registerTerminalActions() {
        registerTerminalAction({
            id: "workbench.action.terminal.newInActiveWorkspace" /* TerminalCommandId.NewInActiveWorkspace */,
            title: (0, nls_1.localize2)('workbench.action.terminal.newInActiveWorkspace', 'Create New Terminal (In Active Workspace)'),
            run: async (c) => {
                if (c.service.isProcessSupportRegistered) {
                    const instance = await c.service.createTerminal({ location: c.service.defaultLocation });
                    if (!instance) {
                        return;
                    }
                    c.service.setActiveInstance(instance);
                }
                await c.groupService.showPanel(true);
            }
        });
        // Register new with profile command
        refreshTerminalActions([]);
        registerTerminalAction({
            id: "workbench.action.createTerminalEditor" /* TerminalCommandId.CreateTerminalEditor */,
            title: (0, nls_1.localize2)('workbench.action.terminal.createTerminalEditor', 'Create New Terminal in Editor Area'),
            run: async (c, _, args) => {
                const options = ((0, types_1.isObject)(args) && 'location' in args) ? args : { location: terminal_1.TerminalLocation.Editor };
                const instance = await c.service.createTerminal(options);
                await instance.focusWhenReady();
            }
        });
        registerTerminalAction({
            id: "workbench.action.createTerminalEditorSameGroup" /* TerminalCommandId.CreateTerminalEditorSameGroup */,
            title: (0, nls_1.localize2)('workbench.action.terminal.createTerminalEditor', 'Create New Terminal in Editor Area'),
            f1: false,
            run: async (c, accessor, args) => {
                // Force the editor into the same editor group if it's locked. This command is only ever
                // called when a terminal is the active editor
                const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const instance = await c.service.createTerminal({
                    location: { viewColumn: (0, editorGroupColumn_1.editorGroupToColumn)(editorGroupsService, editorGroupsService.activeGroup) }
                });
                await instance.focusWhenReady();
            }
        });
        registerTerminalAction({
            id: "workbench.action.createTerminalEditorSide" /* TerminalCommandId.CreateTerminalEditorSide */,
            title: (0, nls_1.localize2)('workbench.action.terminal.createTerminalEditorSide', 'Create New Terminal in Editor Area to the Side'),
            run: async (c) => {
                const instance = await c.service.createTerminal({
                    location: { viewColumn: editorService_1.SIDE_GROUP }
                });
                await instance.focusWhenReady();
            }
        });
        registerContextualInstanceAction({
            id: "workbench.action.terminal.moveToEditor" /* TerminalCommandId.MoveToEditor */,
            title: terminalStrings_1.terminalStrings.moveToEditor,
            precondition: sharedWhenClause.terminalAvailable_and_opened,
            activeInstanceType: 'view',
            run: (instance, c) => c.service.moveToEditor(instance),
            runAfter: (instances) => instances.at(-1)?.focus()
        });
        registerContextualInstanceAction({
            id: "workbench.action.terminal.moveIntoNewWindow" /* TerminalCommandId.MoveIntoNewWindow */,
            title: terminalStrings_1.terminalStrings.moveIntoNewWindow,
            precondition: sharedWhenClause.terminalAvailable_and_opened,
            run: (instance, c) => c.service.moveIntoNewEditor(instance),
            runAfter: (instances) => instances.at(-1)?.focus()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.moveToTerminalPanel" /* TerminalCommandId.MoveToTerminalPanel */,
            title: terminalStrings_1.terminalStrings.moveToTerminalPanel,
            precondition: sharedWhenClause.terminalAvailable_and_editorActive,
            run: (c, _, args) => {
                const source = toOptionalUri(args) ?? c.editorService.activeInstance;
                if (source) {
                    c.service.moveToTerminalView(source);
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusPreviousPane" /* TerminalCommandId.FocusPreviousPane */,
            title: (0, nls_1.localize2)('workbench.action.terminal.focusPreviousPane', 'Focus Previous Terminal in Terminal Group'),
            keybinding: {
                primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
                secondary: [512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */],
                mac: {
                    primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
                    secondary: [512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */]
                },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: async (c) => {
                c.groupService.activeGroup?.focusPreviousPane();
                await c.groupService.showPanel(true);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusNextPane" /* TerminalCommandId.FocusNextPane */,
            title: (0, nls_1.localize2)('workbench.action.terminal.focusNextPane', 'Focus Next Terminal in Terminal Group'),
            keybinding: {
                primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
                secondary: [512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */],
                mac: {
                    primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */,
                    secondary: [512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
                },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: async (c) => {
                c.groupService.activeGroup?.focusNextPane();
                await c.groupService.showPanel(true);
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */,
            title: (0, nls_1.localize2)('workbench.action.terminal.runRecentCommand', 'Run Recent Command...'),
            precondition: sharedWhenClause.terminalAvailable,
            keybinding: [
                {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */,
                    when: contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, accessibilityConfiguration_1.accessibleViewCurrentProviderId.isEqualTo("terminal" /* AccessibleViewProviderId.Terminal */)))),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */ },
                    when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            ],
            run: async (activeInstance, c) => {
                await activeInstance.runRecent('command');
                if (activeInstance?.target === terminal_1.TerminalLocation.Editor) {
                    await c.editorService.revealActiveEditor();
                }
                else {
                    await c.groupService.showPanel(false);
                }
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.copyLastCommand" /* TerminalCommandId.CopyLastCommand */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.copyLastCommand', 'Copy Last Command'), original: 'Copy Last Command' },
            precondition: sharedWhenClause.terminalAvailable,
            run: async (instance, c, accessor) => {
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const commands = instance.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.commands;
                if (!commands || commands.length === 0) {
                    return;
                }
                const command = commands[commands.length - 1];
                if (!command.command) {
                    return;
                }
                await clipboardService.writeText(command.command);
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.copyLastCommandOutput" /* TerminalCommandId.CopyLastCommandOutput */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.copyLastCommandOutput', 'Copy Last Command Output'), original: 'Copy Last Command Output' },
            precondition: sharedWhenClause.terminalAvailable,
            run: async (instance, c, accessor) => {
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const commands = instance.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.commands;
                if (!commands || commands.length === 0) {
                    return;
                }
                const command = commands[commands.length - 1];
                if (!command?.hasOutput()) {
                    return;
                }
                const output = command.getOutput();
                if ((0, types_1.isString)(output)) {
                    await clipboardService.writeText(output);
                }
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.copyLastCommandAndLastCommandOutput" /* TerminalCommandId.CopyLastCommandAndLastCommandOutput */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.copyLastCommandAndOutput', 'Copy Last Command and Output'), original: 'Copy Last Command and Output' },
            precondition: sharedWhenClause.terminalAvailable,
            run: async (instance, c, accessor) => {
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const commands = instance.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.commands;
                if (!commands || commands.length === 0) {
                    return;
                }
                const command = commands[commands.length - 1];
                if (!command?.hasOutput()) {
                    return;
                }
                const output = command.getOutput();
                if ((0, types_1.isString)(output)) {
                    await clipboardService.writeText(`${command.command !== '' ? command.command + '\n' : ''}${output}`);
                }
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.goToRecentDirectory" /* TerminalCommandId.GoToRecentDirectory */,
            title: (0, nls_1.localize2)('workbench.action.terminal.goToRecentDirectory', 'Go to Recent Directory...'),
            precondition: sharedWhenClause.terminalAvailable,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */,
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (activeInstance, c) => {
                await activeInstance.runRecent('cwd');
                if (activeInstance?.target === terminal_1.TerminalLocation.Editor) {
                    await c.editorService.revealActiveEditor();
                }
                else {
                    await c.groupService.showPanel(false);
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.resizePaneLeft" /* TerminalCommandId.ResizePaneLeft */,
            title: (0, nls_1.localize2)('workbench.action.terminal.resizePaneLeft', 'Resize Terminal Left'),
            keybinding: {
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */ },
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 15 /* KeyCode.LeftArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (c) => c.groupService.activeGroup?.resizePane(0 /* Direction.Left */)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.resizePaneRight" /* TerminalCommandId.ResizePaneRight */,
            title: (0, nls_1.localize2)('workbench.action.terminal.resizePaneRight', 'Resize Terminal Right'),
            keybinding: {
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */ },
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 17 /* KeyCode.RightArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (c) => c.groupService.activeGroup?.resizePane(1 /* Direction.Right */)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.resizePaneUp" /* TerminalCommandId.ResizePaneUp */,
            title: (0, nls_1.localize2)('workbench.action.terminal.resizePaneUp', 'Resize Terminal Up'),
            keybinding: {
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 16 /* KeyCode.UpArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (c) => c.groupService.activeGroup?.resizePane(2 /* Direction.Up */)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.resizePaneDown" /* TerminalCommandId.ResizePaneDown */,
            title: (0, nls_1.localize2)('workbench.action.terminal.resizePaneDown', 'Resize Terminal Down'),
            keybinding: {
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 18 /* KeyCode.DownArrow */ },
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (c) => c.groupService.activeGroup?.resizePane(3 /* Direction.Down */)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focus" /* TerminalCommandId.Focus */,
            title: terminalStrings_1.terminalStrings.focus,
            keybinding: {
                when: contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibilityConfiguration_1.accessibleViewOnLastLine, accessibilityConfiguration_1.accessibleViewCurrentProviderId.isEqualTo("terminal" /* AccessibleViewProviderId.Terminal */)),
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: async (c) => {
                const instance = c.service.activeInstance || await c.service.createTerminal({ location: terminal_1.TerminalLocation.Panel });
                if (!instance) {
                    return;
                }
                c.service.setActiveInstance(instance);
                focusActiveTerminal(instance, c);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusTabs" /* TerminalCommandId.FocusTabs */,
            title: (0, nls_1.localize2)('workbench.action.terminal.focus.tabsView', 'Focus Terminal Tabs View'),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 93 /* KeyCode.Backslash */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.tabsFocus, terminalContextKey_1.TerminalContextKeys.focus),
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (c) => c.groupService.focusTabs()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusNext" /* TerminalCommandId.FocusNext */,
            title: (0, nls_1.localize2)('workbench.action.terminal.focusNext', 'Focus Next Terminal Group'),
            precondition: sharedWhenClause.terminalAvailable,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */
                },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.editorFocus.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (c) => {
                c.groupService.setActiveGroupToNext();
                await c.groupService.showPanel(true);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusPrevious" /* TerminalCommandId.FocusPrevious */,
            title: (0, nls_1.localize2)('workbench.action.terminal.focusPrevious', 'Focus Previous Terminal Group'),
            precondition: sharedWhenClause.terminalAvailable,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 92 /* KeyCode.BracketLeft */
                },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.editorFocus.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (c) => {
                c.groupService.setActiveGroupToPrevious();
                await c.groupService.showPanel(true);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
            title: (0, nls_1.localize2)('workbench.action.terminal.runSelectedText', 'Run Selected Text In Active Terminal'),
            run: async (c, accessor) => {
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const editor = codeEditorService.getActiveCodeEditor();
                if (!editor || !editor.hasModel()) {
                    return;
                }
                const instance = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
                const selection = editor.getSelection();
                let text;
                if (selection.isEmpty()) {
                    text = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
                }
                else {
                    const endOfLinePreference = platform_1.isWindows ? 1 /* EndOfLinePreference.LF */ : 2 /* EndOfLinePreference.CRLF */;
                    text = editor.getModel().getValueInRange(selection, endOfLinePreference);
                }
                instance.sendText(text, true, true);
                await c.service.revealActiveTerminal(true);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
            title: (0, nls_1.localize2)('workbench.action.terminal.runActiveFile', 'Run Active File In Active Terminal'),
            precondition: sharedWhenClause.terminalAvailable,
            run: async (c, accessor) => {
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const workbenchEnvironmentService = accessor.get(environmentService_1.IWorkbenchEnvironmentService);
                const editor = codeEditorService.getActiveCodeEditor();
                if (!editor || !editor.hasModel()) {
                    return;
                }
                const instance = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
                const isRemote = instance ? instance.isRemote : (workbenchEnvironmentService.remoteAuthority ? true : false);
                const uri = editor.getModel().uri;
                if ((!isRemote && uri.scheme !== network_1.Schemas.file && uri.scheme !== network_1.Schemas.vscodeUserData) || (isRemote && uri.scheme !== network_1.Schemas.vscodeRemote)) {
                    notificationService.warn((0, nls_1.localize)('workbench.action.terminal.runActiveFile.noFile', 'Only files on disk can be run in the terminal'));
                    return;
                }
                // TODO: Convert this to ctrl+c, ctrl+v for pwsh?
                await instance.sendPath(uri, true);
                return c.groupService.showPanel();
            }
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollDown" /* TerminalCommandId.ScrollDownLine */,
            title: (0, nls_1.localize2)('workbench.action.terminal.scrollDown', 'Scroll Down (Line)'),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 12 /* KeyCode.PageDown */,
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */ },
                when: sharedWhenClause.focusInAny_and_normalBuffer,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (xterm) => xterm.scrollDownLine()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollDownPage" /* TerminalCommandId.ScrollDownPage */,
            title: (0, nls_1.localize2)('workbench.action.terminal.scrollDownPage', 'Scroll Down (Page)'),
            keybinding: {
                primary: 1024 /* KeyMod.Shift */ | 12 /* KeyCode.PageDown */,
                mac: { primary: 12 /* KeyCode.PageDown */ },
                when: sharedWhenClause.focusInAny_and_normalBuffer,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (xterm) => xterm.scrollDownPage()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollToBottom" /* TerminalCommandId.ScrollToBottom */,
            title: (0, nls_1.localize2)('workbench.action.terminal.scrollToBottom', 'Scroll to Bottom'),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 13 /* KeyCode.End */,
                linux: { primary: 1024 /* KeyMod.Shift */ | 13 /* KeyCode.End */ },
                when: sharedWhenClause.focusInAny_and_normalBuffer,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (xterm) => xterm.scrollToBottom()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollUp" /* TerminalCommandId.ScrollUpLine */,
            title: (0, nls_1.localize2)('workbench.action.terminal.scrollUp', 'Scroll Up (Line)'),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 11 /* KeyCode.PageUp */,
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */ },
                when: sharedWhenClause.focusInAny_and_normalBuffer,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (xterm) => xterm.scrollUpLine()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollUpPage" /* TerminalCommandId.ScrollUpPage */,
            title: (0, nls_1.localize2)('workbench.action.terminal.scrollUpPage', 'Scroll Up (Page)'),
            f1: true,
            category,
            keybinding: {
                primary: 1024 /* KeyMod.Shift */ | 11 /* KeyCode.PageUp */,
                mac: { primary: 11 /* KeyCode.PageUp */ },
                when: sharedWhenClause.focusInAny_and_normalBuffer,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (xterm) => xterm.scrollUpPage()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.scrollToTop" /* TerminalCommandId.ScrollToTop */,
            title: (0, nls_1.localize2)('workbench.action.terminal.scrollToTop', 'Scroll to Top'),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */,
                linux: { primary: 1024 /* KeyMod.Shift */ | 14 /* KeyCode.Home */ },
                when: sharedWhenClause.focusInAny_and_normalBuffer,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (xterm) => xterm.scrollToTop()
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.clearSelection" /* TerminalCommandId.ClearSelection */,
            title: (0, nls_1.localize2)('workbench.action.terminal.clearSelection', 'Clear Selection'),
            keybinding: {
                primary: 9 /* KeyCode.Escape */,
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focusInAny, terminalContextKey_1.TerminalContextKeys.textSelected, terminalContextKey_1.TerminalContextKeys.notFindVisible),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (xterm) => {
                if (xterm.hasSelection()) {
                    xterm.clearSelection();
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.changeIcon" /* TerminalCommandId.ChangeIcon */,
            title: terminalStrings_1.terminalStrings.changeIcon,
            precondition: sharedWhenClause.terminalAvailable,
            run: (c, _, args) => getResourceOrActiveInstance(c, args)?.changeIcon()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.changeIconActiveTab" /* TerminalCommandId.ChangeIconActiveTab */,
            title: terminalStrings_1.terminalStrings.changeIcon,
            f1: false,
            precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
            run: async (c, accessor) => {
                let icon;
                for (const terminal of getSelectedInstances(accessor) ?? []) {
                    icon = await terminal.changeIcon(icon);
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.changeColor" /* TerminalCommandId.ChangeColor */,
            title: terminalStrings_1.terminalStrings.changeColor,
            precondition: sharedWhenClause.terminalAvailable,
            run: (c, _, args) => getResourceOrActiveInstance(c, args)?.changeColor()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.changeColorActiveTab" /* TerminalCommandId.ChangeColorActiveTab */,
            title: terminalStrings_1.terminalStrings.changeColor,
            f1: false,
            precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
            run: async (c, accessor) => {
                let color;
                let i = 0;
                for (const terminal of getSelectedInstances(accessor) ?? []) {
                    const skipQuickPick = i !== 0;
                    // Always show the quickpick on the first iteration
                    color = await terminal.changeColor(color, skipQuickPick);
                    i++;
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.rename" /* TerminalCommandId.Rename */,
            title: terminalStrings_1.terminalStrings.rename,
            precondition: sharedWhenClause.terminalAvailable,
            run: (c, accessor, args) => renameWithQuickPick(c, accessor, args)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.renameActiveTab" /* TerminalCommandId.RenameActiveTab */,
            title: terminalStrings_1.terminalStrings.rename,
            f1: false,
            keybinding: {
                primary: 60 /* KeyCode.F2 */,
                mac: {
                    primary: 3 /* KeyCode.Enter */
                },
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.tabsFocus),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
            run: async (c, accessor) => {
                const terminalGroupService = accessor.get(terminal_2.ITerminalGroupService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const instances = getSelectedInstances(accessor);
                const firstInstance = instances?.[0];
                if (!firstInstance) {
                    return;
                }
                if (terminalGroupService.lastAccessedMenu === 'inline-tab') {
                    return renameWithQuickPick(c, accessor, firstInstance);
                }
                c.service.setEditingTerminal(firstInstance);
                c.service.setEditable(firstInstance, {
                    validationMessage: value => validateTerminalName(value),
                    onFinish: async (value, success) => {
                        // Cancel editing first as instance.rename will trigger a rerender automatically
                        c.service.setEditable(firstInstance, null);
                        c.service.setEditingTerminal(undefined);
                        if (success) {
                            const promises = [];
                            for (const instance of instances) {
                                promises.push((async () => {
                                    await instance.rename(value);
                                })());
                            }
                            try {
                                await Promise.all(promises);
                            }
                            catch (e) {
                                notificationService.error(e);
                            }
                        }
                    }
                });
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.detachSession" /* TerminalCommandId.DetachSession */,
            title: (0, nls_1.localize2)('workbench.action.terminal.detachSession', 'Detach Session'),
            run: (activeInstance) => activeInstance.detachProcessAndDispose(terminal_1.TerminalExitReason.User)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.attachToSession" /* TerminalCommandId.AttachToSession */,
            title: (0, nls_1.localize2)('workbench.action.terminal.attachToSession', 'Attach to Session'),
            run: async (c, accessor) => {
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const labelService = accessor.get(label_1.ILabelService);
                const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const remoteAuthority = remoteAgentService.getConnection()?.remoteAuthority ?? undefined;
                const backend = await accessor.get(terminal_2.ITerminalInstanceService).getBackend(remoteAuthority);
                if (!backend) {
                    throw new Error(`No backend registered for remote authority '${remoteAuthority}'`);
                }
                const terms = await backend.listProcesses();
                backend.reduceConnectionGraceTime();
                const unattachedTerms = terms.filter(term => !c.service.isAttachedToTerminal(term));
                const items = unattachedTerms.map(term => {
                    const cwdLabel = labelService.getUriLabel(uri_1.URI.file(term.cwd));
                    return {
                        label: term.title,
                        detail: term.workspaceName ? `${term.workspaceName} \u2E31 ${cwdLabel}` : cwdLabel,
                        description: term.pid ? String(term.pid) : '',
                        term
                    };
                });
                if (items.length === 0) {
                    notificationService.info((0, nls_1.localize)('noUnattachedTerminals', 'There are no unattached terminals to attach to'));
                    return;
                }
                const selected = await quickInputService.pick(items, { canPickMany: false });
                if (selected) {
                    const instance = await c.service.createTerminal({
                        config: { attachPersistentProcess: selected.term }
                    });
                    c.service.setActiveInstance(instance);
                    await focusActiveTerminal(instance, c);
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.quickOpenTerm" /* TerminalCommandId.QuickOpenTerm */,
            title: (0, nls_1.localize2)('quickAccessTerminal', 'Switch Active Terminal'),
            precondition: sharedWhenClause.terminalAvailable,
            run: (c, accessor) => accessor.get(quickInput_1.IQuickInputService).quickAccess.show(terminalQuickAccess_1.TerminalQuickAccessProvider.PREFIX)
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.scrollToPreviousCommand" /* TerminalCommandId.ScrollToPreviousCommand */,
            title: terminalStrings_1.terminalStrings.scrollToPreviousCommand,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            icon: codicons_1.Codicon.arrowUp,
            menu: [
                {
                    id: actions_2.MenuId.ViewTitle,
                    group: 'navigation',
                    order: 4,
                    when: contextkey_1.ContextKeyExpr.equals('view', terminal_3.TERMINAL_VIEW_ID),
                    isHiddenByDefault: true
                }
            ],
            run: (activeInstance) => activeInstance.xterm?.markTracker.scrollToPreviousMark(undefined, undefined, activeInstance.capabilities.has(2 /* TerminalCapability.CommandDetection */))
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.scrollToNextCommand" /* TerminalCommandId.ScrollToNextCommand */,
            title: terminalStrings_1.terminalStrings.scrollToNextCommand,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            icon: codicons_1.Codicon.arrowDown,
            menu: [
                {
                    id: actions_2.MenuId.ViewTitle,
                    group: 'navigation',
                    order: 4,
                    when: contextkey_1.ContextKeyExpr.equals('view', terminal_3.TERMINAL_VIEW_ID),
                    isHiddenByDefault: true
                }
            ],
            run: (activeInstance) => {
                activeInstance.xterm?.markTracker.scrollToNextMark();
                activeInstance.focus();
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.selectToPreviousCommand" /* TerminalCommandId.SelectToPreviousCommand */,
            title: (0, nls_1.localize2)('workbench.action.terminal.selectToPreviousCommand', 'Select To Previous Command'),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (activeInstance) => {
                activeInstance.xterm?.markTracker.selectToPreviousMark();
                activeInstance.focus();
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.selectToNextCommand" /* TerminalCommandId.SelectToNextCommand */,
            title: (0, nls_1.localize2)('workbench.action.terminal.selectToNextCommand', 'Select To Next Command'),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
                when: terminalContextKey_1.TerminalContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: (activeInstance) => {
                activeInstance.xterm?.markTracker.selectToNextMark();
                activeInstance.focus();
            }
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.selectToPreviousLine" /* TerminalCommandId.SelectToPreviousLine */,
            title: (0, nls_1.localize2)('workbench.action.terminal.selectToPreviousLine', 'Select To Previous Line'),
            precondition: sharedWhenClause.terminalAvailable,
            run: async (xterm, _, instance) => {
                xterm.markTracker.selectToPreviousLine();
                // prefer to call focus on the TerminalInstance for additional accessibility triggers
                (instance || xterm).focus();
            }
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.selectToNextLine" /* TerminalCommandId.SelectToNextLine */,
            title: (0, nls_1.localize2)('workbench.action.terminal.selectToNextLine', 'Select To Next Line'),
            precondition: sharedWhenClause.terminalAvailable,
            run: async (xterm, _, instance) => {
                xterm.markTracker.selectToNextLine();
                // prefer to call focus on the TerminalInstance for additional accessibility triggers
                (instance || xterm).focus();
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.sendSequence" /* TerminalCommandId.SendSequence */,
            title: terminalStrings_1.terminalStrings.sendSequence,
            f1: false,
            metadata: {
                description: terminalStrings_1.terminalStrings.sendSequence.value,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            required: ['text'],
                            properties: {
                                text: {
                                    description: (0, nls_1.localize)('sendSequence', "The sequence of text to send to the terminal"),
                                    type: 'string'
                                }
                            },
                        }
                    }]
            },
            run: (c, accessor, args) => (0, exports.terminalSendSequenceCommand)(accessor, args)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.newWithCwd" /* TerminalCommandId.NewWithCwd */,
            title: terminalStrings_1.terminalStrings.newWithCwd,
            metadata: {
                description: terminalStrings_1.terminalStrings.newWithCwd.value,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            required: ['cwd'],
                            properties: {
                                cwd: {
                                    description: (0, nls_1.localize)('workbench.action.terminal.newWithCwd.cwd', "The directory to start the terminal at"),
                                    type: 'string'
                                }
                            },
                        }
                    }]
            },
            run: async (c, _, args) => {
                const cwd = (0, types_1.isObject)(args) && 'cwd' in args ? toOptionalString(args.cwd) : undefined;
                const instance = await c.service.createTerminal({ cwd });
                if (!instance) {
                    return;
                }
                c.service.setActiveInstance(instance);
                await focusActiveTerminal(instance, c);
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.renameWithArg" /* TerminalCommandId.RenameWithArgs */,
            title: terminalStrings_1.terminalStrings.renameWithArgs,
            metadata: {
                description: terminalStrings_1.terminalStrings.renameWithArgs.value,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            required: ['name'],
                            properties: {
                                name: {
                                    description: (0, nls_1.localize)('workbench.action.terminal.renameWithArg.name', "The new name for the terminal"),
                                    type: 'string',
                                    minLength: 1
                                }
                            }
                        }
                    }]
            },
            precondition: sharedWhenClause.terminalAvailable,
            run: async (activeInstance, c, accessor, args) => {
                const notificationService = accessor.get(notification_1.INotificationService);
                const name = (0, types_1.isObject)(args) && 'name' in args ? toOptionalString(args.name) : undefined;
                if (!name) {
                    notificationService.warn((0, nls_1.localize)('workbench.action.terminal.renameWithArg.noName', "No name argument provided"));
                    return;
                }
                activeInstance.rename(name);
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.relaunch" /* TerminalCommandId.Relaunch */,
            title: (0, nls_1.localize2)('workbench.action.terminal.relaunch', 'Relaunch Active Terminal'),
            run: (activeInstance) => activeInstance.relaunch()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
            title: terminalStrings_1.terminalStrings.split,
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */,
                    secondary: [256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */]
                },
                when: terminalContextKey_1.TerminalContextKeys.focus
            },
            icon: codicons_1.Codicon.splitHorizontal,
            run: async (c, accessor, args) => {
                const optionsOrProfile = (0, types_1.isObject)(args) ? args : undefined;
                const commandService = accessor.get(commands_1.ICommandService);
                const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
                const options = convertOptionsOrProfileToOptions(optionsOrProfile);
                const activeInstance = (await c.service.getInstanceHost(options?.location)).activeInstance;
                if (!activeInstance) {
                    return;
                }
                const cwd = await getCwdForSplit(c.service.configHelper, activeInstance, workspaceContextService.getWorkspace().folders, commandService);
                if (cwd === undefined) {
                    return;
                }
                const instance = await c.service.createTerminal({ location: { parentTerminal: activeInstance }, config: options?.config, cwd });
                await focusActiveTerminal(instance, c);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.splitActiveTab" /* TerminalCommandId.SplitActiveTab */,
            title: terminalStrings_1.terminalStrings.split,
            f1: false,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */,
                    secondary: [256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */]
                },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: terminalContextKey_1.TerminalContextKeys.tabsFocus
            },
            run: async (c, accessor) => {
                const instances = getSelectedInstances(accessor);
                if (instances) {
                    const promises = [];
                    for (const t of instances) {
                        promises.push((async () => {
                            await c.service.createTerminal({ location: { parentTerminal: t } });
                            await c.groupService.showPanel(true);
                        })());
                    }
                    await Promise.all(promises);
                }
            }
        });
        registerContextualInstanceAction({
            id: "workbench.action.terminal.unsplit" /* TerminalCommandId.Unsplit */,
            title: terminalStrings_1.terminalStrings.unsplit,
            precondition: sharedWhenClause.terminalAvailable,
            run: async (instance, c) => {
                const group = c.groupService.getGroupForInstance(instance);
                if (group && group?.terminalInstances.length > 1) {
                    c.groupService.unsplitInstance(instance);
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.joinActiveTab" /* TerminalCommandId.JoinActiveTab */,
            title: (0, nls_1.localize2)('workbench.action.terminal.joinInstance', 'Join Terminals'),
            precondition: contextkey_1.ContextKeyExpr.and(sharedWhenClause.terminalAvailable, terminalContextKey_1.TerminalContextKeys.tabsSingularSelection.toNegated()),
            run: async (c, accessor) => {
                const instances = getSelectedInstances(accessor);
                if (instances && instances.length > 1) {
                    c.groupService.joinInstances(instances);
                }
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.join" /* TerminalCommandId.Join */,
            title: (0, nls_1.localize2)('workbench.action.terminal.join', 'Join Terminals'),
            precondition: sharedWhenClause.terminalAvailable,
            run: async (c, accessor) => {
                const themeService = accessor.get(themeService_1.IThemeService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const picks = [];
                if (c.groupService.instances.length <= 1) {
                    notificationService.warn((0, nls_1.localize)('workbench.action.terminal.join.insufficientTerminals', 'Insufficient terminals for the join action'));
                    return;
                }
                const otherInstances = c.groupService.instances.filter(i => i.instanceId !== c.groupService.activeInstance?.instanceId);
                for (const terminal of otherInstances) {
                    const group = c.groupService.getGroupForInstance(terminal);
                    if (group?.terminalInstances.length === 1) {
                        const iconId = (0, terminalIcon_1.getIconId)(accessor, terminal);
                        const label = `$(${iconId}): ${terminal.title}`;
                        const iconClasses = [];
                        const colorClass = (0, terminalIcon_1.getColorClass)(terminal);
                        if (colorClass) {
                            iconClasses.push(colorClass);
                        }
                        const uriClasses = (0, terminalIcon_1.getUriClasses)(terminal, themeService.getColorTheme().type);
                        if (uriClasses) {
                            iconClasses.push(...uriClasses);
                        }
                        picks.push({
                            terminal,
                            label,
                            iconClasses
                        });
                    }
                }
                if (picks.length === 0) {
                    notificationService.warn((0, nls_1.localize)('workbench.action.terminal.join.onlySplits', 'All terminals are joined already'));
                    return;
                }
                const result = await quickInputService.pick(picks, {});
                if (result) {
                    c.groupService.joinInstances([result.terminal, c.groupService.activeInstance]);
                }
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.splitInActiveWorkspace" /* TerminalCommandId.SplitInActiveWorkspace */,
            title: (0, nls_1.localize2)('workbench.action.terminal.splitInActiveWorkspace', 'Split Terminal (In Active Workspace)'),
            run: async (instance, c) => {
                const newInstance = await c.service.createTerminal({ location: { parentTerminal: instance } });
                if (newInstance?.target !== terminal_1.TerminalLocation.Editor) {
                    await c.groupService.showPanel(true);
                }
            }
        });
        registerActiveXtermAction({
            id: "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
            title: (0, nls_1.localize2)('workbench.action.terminal.selectAll', 'Select All'),
            precondition: sharedWhenClause.terminalAvailable,
            keybinding: [{
                    // Don't use ctrl+a by default as that would override the common go to start
                    // of prompt shell binding
                    primary: 0,
                    // Technically this doesn't need to be here as it will fall back to this
                    // behavior anyway when handed to xterm.js, having this handled by VS Code
                    // makes it easier for users to see how it works though.
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: terminalContextKey_1.TerminalContextKeys.focusInAny
                }],
            run: (xterm) => xterm.selectAll()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
            title: (0, nls_1.localize2)('workbench.action.terminal.new', 'Create New Terminal'),
            precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile),
            icon: terminalIcons_1.newTerminalIcon,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 91 /* KeyCode.Backquote */,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 91 /* KeyCode.Backquote */ },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            run: async (c, accessor, args) => {
                let eventOrOptions = (0, types_1.isObject)(args) ? args : undefined;
                const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
                const commandService = accessor.get(commands_1.ICommandService);
                const folders = workspaceContextService.getWorkspace().folders;
                if (eventOrOptions && (0, dom_1.isMouseEvent)(eventOrOptions) && (eventOrOptions.altKey || eventOrOptions.ctrlKey)) {
                    await c.service.createTerminal({ location: { splitActiveTerminal: true } });
                    return;
                }
                if (c.service.isProcessSupportRegistered) {
                    eventOrOptions = !eventOrOptions || (0, dom_1.isMouseEvent)(eventOrOptions) ? {} : eventOrOptions;
                    let instance;
                    if (folders.length <= 1) {
                        // Allow terminal service to handle the path when there is only a
                        // single root
                        instance = await c.service.createTerminal(eventOrOptions);
                    }
                    else {
                        const cwd = (await pickTerminalCwd(accessor))?.cwd;
                        if (!cwd) {
                            // Don't create the instance if the workspace picker was canceled
                            return;
                        }
                        eventOrOptions.cwd = cwd;
                        instance = await c.service.createTerminal(eventOrOptions);
                    }
                    c.service.setActiveInstance(instance);
                    await focusActiveTerminal(instance, c);
                }
                else {
                    if (c.profileService.contributedProfiles.length > 0) {
                        commandService.executeCommand("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */);
                    }
                    else {
                        commandService.executeCommand("workbench.action.terminal.toggleTerminal" /* TerminalCommandId.Toggle */);
                    }
                }
            }
        });
        async function killInstance(c, instance) {
            if (!instance) {
                return;
            }
            await c.service.safeDisposeTerminal(instance);
            if (c.groupService.instances.length > 0) {
                await c.groupService.showPanel(true);
            }
        }
        registerTerminalAction({
            id: "workbench.action.terminal.kill" /* TerminalCommandId.Kill */,
            title: (0, nls_1.localize2)('workbench.action.terminal.kill', 'Kill the Active Terminal Instance'),
            precondition: contextkey_1.ContextKeyExpr.or(sharedWhenClause.terminalAvailable, terminalContextKey_1.TerminalContextKeys.isOpen),
            icon: terminalIcons_1.killTerminalIcon,
            run: async (c) => killInstance(c, c.groupService.activeInstance)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.killViewOrEditor" /* TerminalCommandId.KillViewOrEditor */,
            title: terminalStrings_1.terminalStrings.kill,
            f1: false, // This is an internal command used for context menus
            precondition: contextkey_1.ContextKeyExpr.or(sharedWhenClause.terminalAvailable, terminalContextKey_1.TerminalContextKeys.isOpen),
            run: async (c) => killInstance(c, c.service.activeInstance)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.killAll" /* TerminalCommandId.KillAll */,
            title: (0, nls_1.localize2)('workbench.action.terminal.killAll', 'Kill All Terminals'),
            precondition: contextkey_1.ContextKeyExpr.or(sharedWhenClause.terminalAvailable, terminalContextKey_1.TerminalContextKeys.isOpen),
            icon: codicons_1.Codicon.trash,
            run: async (c) => {
                const disposePromises = [];
                for (const instance of c.service.instances) {
                    disposePromises.push(c.service.safeDisposeTerminal(instance));
                }
                await Promise.all(disposePromises);
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.killEditor" /* TerminalCommandId.KillEditor */,
            title: (0, nls_1.localize2)('workbench.action.terminal.killEditor', 'Kill the Active Terminal in Editor Area'),
            precondition: sharedWhenClause.terminalAvailable,
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */,
                win: { primary: 2048 /* KeyMod.CtrlCmd */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */] },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.editorFocus)
            },
            run: (c, accessor) => accessor.get(commands_1.ICommandService).executeCommand(editorCommands_1.CLOSE_EDITOR_COMMAND_ID)
        });
        registerTerminalAction({
            id: "workbench.action.terminal.killActiveTab" /* TerminalCommandId.KillActiveTab */,
            title: terminalStrings_1.terminalStrings.kill,
            f1: false,
            precondition: contextkey_1.ContextKeyExpr.or(sharedWhenClause.terminalAvailable, terminalContextKey_1.TerminalContextKeys.isOpen),
            keybinding: {
                primary: 20 /* KeyCode.Delete */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                    secondary: [20 /* KeyCode.Delete */]
                },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: terminalContextKey_1.TerminalContextKeys.tabsFocus
            },
            run: async (c, accessor) => {
                const disposePromises = [];
                for (const terminal of getSelectedInstances(accessor, true) ?? []) {
                    disposePromises.push(c.service.safeDisposeTerminal(terminal));
                }
                await Promise.all(disposePromises);
                c.groupService.focusTabs();
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.focusHover" /* TerminalCommandId.FocusHover */,
            title: terminalStrings_1.terminalStrings.focusHover,
            precondition: contextkey_1.ContextKeyExpr.or(sharedWhenClause.terminalAvailable, terminalContextKey_1.TerminalContextKeys.isOpen),
            keybinding: {
                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.tabsFocus, terminalContextKey_1.TerminalContextKeys.focus)
            },
            run: (c) => c.groupService.focusHover()
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
            title: (0, nls_1.localize2)('workbench.action.terminal.clear', 'Clear'),
            precondition: sharedWhenClause.terminalAvailable,
            keybinding: [{
                    primary: 0,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */ },
                    // Weight is higher than work workbench contributions so the keybinding remains
                    // highest priority when chords are registered afterwards
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    // Disable the keybinding when accessibility mode is enabled as chords include
                    // important screen reader keybindings such as cmd+k, cmd+i to show the hover
                    when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()), contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibilityConfiguration_1.accessibleViewIsShown, accessibilityConfiguration_1.accessibleViewCurrentProviderId.isEqualTo("terminal" /* AccessibleViewProviderId.Terminal */))),
                }],
            run: (activeInstance) => activeInstance.clearBuffer()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.selectDefaultShell" /* TerminalCommandId.SelectDefaultProfile */,
            title: (0, nls_1.localize2)('workbench.action.terminal.selectDefaultShell', 'Select Default Profile'),
            run: (c) => c.service.showProfileQuickPick('setDefault')
        });
        registerTerminalAction({
            id: "workbench.action.terminal.openSettings" /* TerminalCommandId.ConfigureTerminalSettings */,
            title: (0, nls_1.localize2)('workbench.action.terminal.openSettings', 'Configure Terminal Settings'),
            precondition: sharedWhenClause.terminalAvailable,
            run: (c, accessor) => accessor.get(preferences_1.IPreferencesService).openSettings({ jsonEditor: false, query: '@feature:terminal' })
        });
        registerActiveInstanceAction({
            id: "workbench.action.terminal.setDimensions" /* TerminalCommandId.SetDimensions */,
            title: (0, nls_1.localize2)('workbench.action.terminal.setFixedDimensions', 'Set Fixed Dimensions'),
            precondition: sharedWhenClause.terminalAvailable_and_opened,
            run: (activeInstance) => activeInstance.setFixedDimensions()
        });
        registerContextualInstanceAction({
            id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
            title: terminalStrings_1.terminalStrings.toggleSizeToContentWidth,
            precondition: sharedWhenClause.terminalAvailable_and_opened,
            keybinding: {
                primary: 512 /* KeyMod.Alt */ | 56 /* KeyCode.KeyZ */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: terminalContextKey_1.TerminalContextKeys.focus
            },
            run: (instance) => instance.toggleSizeToContentWidth()
        });
        registerTerminalAction({
            id: "workbench.action.terminal.clearPreviousSessionHistory" /* TerminalCommandId.ClearPreviousSessionHistory */,
            title: (0, nls_1.localize2)('workbench.action.terminal.clearPreviousSessionHistory', 'Clear Previous Session History'),
            precondition: sharedWhenClause.terminalAvailable,
            run: async (c, accessor) => {
                (0, history_2.getCommandHistory)(accessor).clear();
                (0, history_2.clearShellFileHistory)();
            }
        });
        registerTerminalAction({
            id: "workbench.action.terminal.toggleStickyScroll" /* TerminalCommandId.ToggleStickyScroll */,
            title: (0, nls_1.localize2)('workbench.action.terminal.toggleStickyScroll', 'Toggle Sticky Scroll'),
            toggled: {
                condition: contextkey_1.ContextKeyExpr.equals('config.terminal.integrated.stickyScroll.enabled', true),
                title: (0, nls_1.localize)('stickyScroll', "Sticky Scroll"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Sticky Scroll"),
            },
            run: (c, accessor) => {
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                const newValue = !configurationService.getValue("terminal.integrated.stickyScroll.enabled" /* TerminalSettingId.StickyScrollEnabled */);
                return configurationService.updateValue("terminal.integrated.stickyScroll.enabled" /* TerminalSettingId.StickyScrollEnabled */, newValue);
            },
            menu: [
                { id: actions_2.MenuId.TerminalStickyScrollContext }
            ]
        });
        // Some commands depend on platform features
        if (canIUse_1.BrowserFeatures.clipboard.writeText) {
            registerActiveXtermAction({
                id: "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
                title: (0, nls_1.localize2)('workbench.action.terminal.copySelection', 'Copy Selection'),
                // TODO: Why is copy still showing up when text isn't selected?
                precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.textSelectedInFocused, contextkey_1.ContextKeyExpr.and(sharedWhenClause.terminalAvailable, terminalContextKey_1.TerminalContextKeys.textSelected)),
                keybinding: [{
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.textSelected, terminalContextKey_1.TerminalContextKeys.focus), terminalContextKey_1.TerminalContextKeys.textSelectedInFocused)
                    }],
                run: (activeInstance) => activeInstance.copySelection()
            });
            registerActiveXtermAction({
                id: "workbench.action.terminal.copyAndClearSelection" /* TerminalCommandId.CopyAndClearSelection */,
                title: (0, nls_1.localize2)('workbench.action.terminal.copyAndClearSelection', 'Copy and Clear Selection'),
                precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.textSelectedInFocused, contextkey_1.ContextKeyExpr.and(sharedWhenClause.terminalAvailable, terminalContextKey_1.TerminalContextKeys.textSelected)),
                keybinding: [{
                        win: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.textSelected, terminalContextKey_1.TerminalContextKeys.focus), terminalContextKey_1.TerminalContextKeys.textSelectedInFocused)
                    }],
                run: async (xterm) => {
                    await xterm.copySelection();
                    xterm.clearSelection();
                }
            });
            registerActiveXtermAction({
                id: "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
                title: (0, nls_1.localize2)('workbench.action.terminal.copySelectionAsHtml', 'Copy Selection as HTML'),
                f1: true,
                category,
                precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.textSelectedInFocused, contextkey_1.ContextKeyExpr.and(sharedWhenClause.terminalAvailable, terminalContextKey_1.TerminalContextKeys.textSelected)),
                run: (xterm) => xterm.copySelection(true)
            });
        }
        if (canIUse_1.BrowserFeatures.clipboard.readText) {
            registerActiveInstanceAction({
                id: "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
                title: (0, nls_1.localize2)('workbench.action.terminal.paste', 'Paste into Active Terminal'),
                precondition: sharedWhenClause.terminalAvailable,
                keybinding: [{
                        primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */,
                        win: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 52 /* KeyCode.KeyV */] },
                        linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 52 /* KeyCode.KeyV */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: terminalContextKey_1.TerminalContextKeys.focus
                    }],
                run: (activeInstance) => activeInstance.paste()
            });
        }
        if (canIUse_1.BrowserFeatures.clipboard.readText && platform_1.isLinux) {
            registerActiveInstanceAction({
                id: "workbench.action.terminal.pasteSelection" /* TerminalCommandId.PasteSelection */,
                title: (0, nls_1.localize2)('workbench.action.terminal.pasteSelection', 'Paste Selection into Active Terminal'),
                precondition: sharedWhenClause.terminalAvailable,
                keybinding: [{
                        linux: { primary: 1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: terminalContextKey_1.TerminalContextKeys.focus
                    }],
                run: (activeInstance) => activeInstance.pasteSelection()
            });
        }
        registerTerminalAction({
            id: "workbench.action.terminal.switchTerminal" /* TerminalCommandId.SwitchTerminal */,
            title: (0, nls_1.localize2)('workbench.action.terminal.switchTerminal', 'Switch Terminal'),
            precondition: sharedWhenClause.terminalAvailable,
            run: async (c, accessor, args) => {
                const item = toOptionalString(args);
                if (!item) {
                    return;
                }
                if (item === exports.switchTerminalActionViewItemSeparator) {
                    c.service.refreshActiveGroup();
                    return;
                }
                if (item === exports.switchTerminalShowTabsTitle) {
                    accessor.get(configuration_1.IConfigurationService).updateValue("terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */, true);
                    return;
                }
                const terminalIndexRe = /^([0-9]+): /;
                const indexMatches = terminalIndexRe.exec(item);
                if (indexMatches) {
                    c.groupService.setActiveGroupByIndex(Number(indexMatches[1]) - 1);
                    return c.groupService.showPanel(true);
                }
                const quickSelectProfiles = c.profileService.availableProfiles;
                // Remove 'New ' from the selected item to get the profile name
                const profileSelection = item.substring(4);
                if (quickSelectProfiles) {
                    const profile = quickSelectProfiles.find(profile => profile.profileName === profileSelection);
                    if (profile) {
                        const instance = await c.service.createTerminal({
                            config: profile
                        });
                        c.service.setActiveInstance(instance);
                    }
                    else {
                        console.warn(`No profile with name "${profileSelection}"`);
                    }
                }
                else {
                    console.warn(`Unmatched terminal item: "${item}"`);
                }
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.startTerminalVoice" /* TerminalCommandId.StartVoice */,
            title: {
                value: (0, nls_1.localize)('workbench.action.startTerminalVoice', "Start Terminal Voice"),
                original: 'Start Terminal Voice'
            },
            precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, sharedWhenClause.terminalAvailable),
            f1: true,
            run: (activeInstance, c, accessor) => {
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                terminalVoice_1.TerminalVoiceSession.getInstance(instantiationService).start();
            }
        });
        registerActiveInstanceAction({
            id: "workbench.action.stopTerminalVoice" /* TerminalCommandId.StopVoice */,
            title: {
                value: (0, nls_1.localize)('workbench.action.stopTerminalVoice', "Stop Terminal Voice"),
                original: 'Stop Terminal Voice'
            },
            precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, sharedWhenClause.terminalAvailable),
            f1: true,
            run: (activeInstance, c, accessor) => {
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                terminalVoice_1.TerminalVoiceSession.getInstance(instantiationService).stop(true);
            }
        });
    }
    exports.registerTerminalActions = registerTerminalActions;
    function getSelectedInstances2(accessor, args) {
        const terminalService = accessor.get(terminal_2.ITerminalService);
        const result = [];
        const context = parseActionArgs(args);
        if (context && context.length > 0) {
            for (const instanceContext of context) {
                const instance = terminalService.getInstanceFromId(instanceContext.instanceId);
                if (instance) {
                    result.push(instance);
                }
            }
            if (result.length > 0) {
                return result;
            }
        }
        return undefined;
    }
    function getSelectedInstances(accessor, args, args2) {
        const listService = accessor.get(listService_1.IListService);
        const terminalService = accessor.get(terminal_2.ITerminalService);
        const terminalGroupService = accessor.get(terminal_2.ITerminalGroupService);
        const result = [];
        const list = listService.lastFocusedList;
        // Get selected tab list instance(s)
        const selections = list?.getSelection();
        // Get inline tab instance if there are not tab list selections #196578
        if (terminalGroupService.lastAccessedMenu === 'inline-tab' && !selections?.length) {
            const instance = terminalGroupService.activeInstance;
            return instance ? [terminalGroupService.activeInstance] : undefined;
        }
        if (!list || !selections) {
            return undefined;
        }
        const focused = list.getFocus();
        if (focused.length === 1 && !selections.includes(focused[0])) {
            // focused length is always a max of 1
            // if the focused one is not in the selected list, return that item
            result.push(terminalService.getInstanceFromIndex(focused[0]));
            return result;
        }
        // multi-select
        for (const selection of selections) {
            result.push(terminalService.getInstanceFromIndex(selection));
        }
        return result;
    }
    function validateTerminalName(name) {
        if (!name || name.trim().length === 0) {
            return {
                content: (0, nls_1.localize)('emptyTerminalNameInfo', "Providing no name will reset it to the default value"),
                severity: notification_1.Severity.Info
            };
        }
        return null;
    }
    exports.validateTerminalName = validateTerminalName;
    function convertOptionsOrProfileToOptions(optionsOrProfile) {
        if ((0, types_1.isObject)(optionsOrProfile) && 'profileName' in optionsOrProfile) {
            return { config: optionsOrProfile, location: optionsOrProfile.location };
        }
        return optionsOrProfile;
    }
    let newWithProfileAction;
    function refreshTerminalActions(detectedProfiles) {
        const profileEnum = (0, terminalProfiles_1.createProfileSchemaEnums)(detectedProfiles);
        newWithProfileAction?.dispose();
        // TODO: Use new register function
        newWithProfileAction = (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */,
                    title: (0, nls_1.localize2)('workbench.action.terminal.newWithProfile', 'Create New Terminal (With Profile)'),
                    f1: true,
                    category,
                    precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile),
                    metadata: {
                        description: "workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */,
                        args: [{
                                name: 'args',
                                schema: {
                                    type: 'object',
                                    required: ['profileName'],
                                    properties: {
                                        profileName: {
                                            description: (0, nls_1.localize)('workbench.action.terminal.newWithProfile.profileName', "The name of the profile to create"),
                                            type: 'string',
                                            enum: profileEnum.values,
                                            markdownEnumDescriptions: profileEnum.markdownDescriptions
                                        }
                                    }
                                }
                            }]
                    },
                });
            }
            async run(accessor, eventOrOptionsOrProfile, profile) {
                const c = getTerminalServices(accessor);
                const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
                const commandService = accessor.get(commands_1.ICommandService);
                let event;
                let options;
                let instance;
                let cwd;
                if ((0, types_1.isObject)(eventOrOptionsOrProfile) && eventOrOptionsOrProfile && 'profileName' in eventOrOptionsOrProfile) {
                    const config = c.profileService.availableProfiles.find(profile => profile.profileName === eventOrOptionsOrProfile.profileName);
                    if (!config) {
                        throw new Error(`Could not find terminal profile "${eventOrOptionsOrProfile.profileName}"`);
                    }
                    options = { config };
                }
                else if ((0, dom_1.isMouseEvent)(eventOrOptionsOrProfile) || (0, dom_1.isPointerEvent)(eventOrOptionsOrProfile) || (0, dom_1.isKeyboardEvent)(eventOrOptionsOrProfile)) {
                    event = eventOrOptionsOrProfile;
                    options = profile ? { config: profile } : undefined;
                }
                else {
                    options = convertOptionsOrProfileToOptions(eventOrOptionsOrProfile);
                }
                // split terminal
                if (event && (event.altKey || event.ctrlKey)) {
                    const parentTerminal = c.service.activeInstance;
                    if (parentTerminal) {
                        await c.service.createTerminal({ location: { parentTerminal }, config: options?.config });
                        return;
                    }
                }
                const folders = workspaceContextService.getWorkspace().folders;
                if (folders.length > 1) {
                    // multi-root workspace, create root picker
                    const options = {
                        placeHolder: (0, nls_1.localize)('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal")
                    };
                    const workspace = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                    if (!workspace) {
                        // Don't create the instance if the workspace picker was canceled
                        return;
                    }
                    cwd = workspace.uri;
                }
                if (options) {
                    options.cwd = cwd;
                    instance = await c.service.createTerminal(options);
                }
                else {
                    instance = await c.service.showProfileQuickPick('createInstance', cwd);
                }
                if (instance) {
                    c.service.setActiveInstance(instance);
                    await focusActiveTerminal(instance, c);
                }
            }
        });
    }
    exports.refreshTerminalActions = refreshTerminalActions;
    function getResourceOrActiveInstance(c, resource) {
        return c.service.getInstanceFromResource(toOptionalUri(resource)) || c.service.activeInstance;
    }
    async function pickTerminalCwd(accessor, cancel) {
        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
        const labelService = accessor.get(label_1.ILabelService);
        const contextService = accessor.get(workspace_1.IWorkspaceContextService);
        const modelService = accessor.get(model_1.IModelService);
        const languageService = accessor.get(language_1.ILanguageService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const configurationResolverService = accessor.get(configurationResolver_1.IConfigurationResolverService);
        const folders = contextService.getWorkspace().folders;
        if (!folders.length) {
            return;
        }
        const folderCwdPairs = await Promise.all(folders.map(x => resolveWorkspaceFolderCwd(x, configurationService, configurationResolverService)));
        const shrinkedPairs = shrinkWorkspaceFolderCwdPairs(folderCwdPairs);
        if (shrinkedPairs.length === 1) {
            return shrinkedPairs[0];
        }
        const folderPicks = shrinkedPairs.map(pair => {
            const label = pair.folder.name;
            const description = pair.isOverridden
                ? (0, nls_1.localize)('workbench.action.terminal.overriddenCwdDescription', "(Overriden) {0}", labelService.getUriLabel(pair.cwd, { relative: !pair.isAbsolute }))
                : labelService.getUriLabel((0, resources_1.dirname)(pair.cwd), { relative: true });
            return {
                label,
                description: description !== label ? description : undefined,
                pair: pair,
                iconClasses: (0, getIconClasses_1.getIconClasses)(modelService, languageService, pair.cwd, files_1.FileKind.ROOT_FOLDER)
            };
        });
        const options = {
            placeHolder: (0, nls_1.localize)('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal"),
            matchOnDescription: true,
            canPickMany: false,
        };
        const token = cancel || cancellation_1.CancellationToken.None;
        const pick = await quickInputService.pick(folderPicks, options, token);
        return pick?.pair;
    }
    async function resolveWorkspaceFolderCwd(folder, configurationService, configurationResolverService) {
        const cwdConfig = configurationService.getValue("terminal.integrated.cwd" /* TerminalSettingId.Cwd */, { resource: folder.uri });
        if (!(0, types_1.isString)(cwdConfig) || cwdConfig.length === 0) {
            return { folder, cwd: folder.uri, isAbsolute: false, isOverridden: false };
        }
        const resolvedCwdConfig = await configurationResolverService.resolveAsync(folder, cwdConfig);
        return (0, path_1.isAbsolute)(resolvedCwdConfig) || resolvedCwdConfig.startsWith(variableResolver_1.AbstractVariableResolverService.VARIABLE_LHS)
            ? { folder, isAbsolute: true, isOverridden: true, cwd: uri_1.URI.from({ scheme: folder.uri.scheme, path: resolvedCwdConfig }) }
            : { folder, isAbsolute: false, isOverridden: true, cwd: uri_1.URI.joinPath(folder.uri, resolvedCwdConfig) };
    }
    /**
     * Drops repeated CWDs, if any, by keeping the one which best matches the workspace folder. It also preserves the original order.
     */
    function shrinkWorkspaceFolderCwdPairs(pairs) {
        const map = new Map();
        for (const pair of pairs) {
            const key = pair.cwd.toString();
            const value = map.get(key);
            if (!value || key === pair.folder.uri.toString()) {
                map.set(key, pair);
            }
        }
        const selectedPairs = new Set(map.values());
        const selectedPairsInOrder = pairs.filter(x => selectedPairs.has(x));
        return selectedPairsInOrder;
    }
    exports.shrinkWorkspaceFolderCwdPairs = shrinkWorkspaceFolderCwdPairs;
    async function focusActiveTerminal(instance, c) {
        if (instance.target === terminal_1.TerminalLocation.Editor) {
            await c.editorService.revealActiveEditor();
            await instance.focusWhenReady(true);
        }
        else {
            await c.groupService.showPanel(true);
        }
    }
    async function renameWithQuickPick(c, accessor, resource) {
        let instance = resource;
        // Check if the 'instance' does not exist or if 'instance.rename' is not defined
        if (!instance || !instance?.rename) {
            // If not, obtain the resource instance using 'getResourceOrActiveInstance'
            instance = getResourceOrActiveInstance(c, resource);
        }
        if (instance) {
            const title = await accessor.get(quickInput_1.IQuickInputService).input({
                value: instance.title,
                prompt: (0, nls_1.localize)('workbench.action.terminal.rename.prompt', "Enter terminal name"),
            });
            instance.rename(title);
        }
    }
    function toOptionalUri(obj) {
        return uri_1.URI.isUri(obj) ? obj : undefined;
    }
    function toOptionalString(obj) {
        return (0, types_1.isString)(obj) ? obj : undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrRW5GLFFBQUEscUNBQXFDLEdBQUcsd0RBQXdELENBQUM7SUFDakcsUUFBQSwyQkFBMkIsR0FBRyxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUVyRixNQUFNLFFBQVEsR0FBRyxpQ0FBZSxDQUFDLGNBQWMsQ0FBQztJQUVoRCwyRkFBMkY7SUFDM0YsMERBQTBEO0lBQzFELE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDOUIsTUFBTSxpQkFBaUIsR0FBRywyQkFBYyxDQUFDLEVBQUUsQ0FBQyx3Q0FBbUIsQ0FBQyxnQkFBZ0IsRUFBRSx3Q0FBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzlILE9BQU87WUFDTixpQkFBaUI7WUFDakIsNEJBQTRCLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsd0NBQW1CLENBQUMsTUFBTSxDQUFDO1lBQy9GLGtDQUFrQyxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLHdDQUFtQixDQUFDLG9CQUFvQixDQUFDO1lBQ25ILHVDQUF1QyxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLHdDQUFtQixDQUFDLHFCQUFxQixDQUFDO1lBQ3pILDJCQUEyQixFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLHdDQUFtQixDQUFDLFVBQVUsRUFBRSx3Q0FBbUIsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDN0gsQ0FBQztJQUNILENBQUMsQ0FBQyxFQUFFLENB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