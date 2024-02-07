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
define(["require", "exports", "vs/nls", "vs/base/common/keyCodes", "vs/editor/common/languages/modesRegistry", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/output/browser/outputServices", "vs/workbench/services/output/common/output", "vs/workbench/contrib/output/browser/outputView", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/configuration/common/configurationRegistry", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/platform/action/common/actionCommonCategories", "vs/base/common/lifecycle", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, nls, keyCodes_1, modesRegistry_1, platform_1, actions_1, extensions_1, outputServices_1, output_1, outputView_1, descriptors_1, contributions_1, views_1, viewsService_1, viewPaneContainer_1, configurationRegistry_1, quickInput_1, editorService_1, types_1, contextkey_1, codicons_1, iconRegistry_1, actionCommonCategories_1, lifecycle_1, filesConfigurationService_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register Service
    (0, extensions_1.registerSingleton)(output_1.IOutputService, outputServices_1.OutputService, 1 /* InstantiationType.Delayed */);
    // Register Output Mode
    modesRegistry_1.ModesRegistry.registerLanguage({
        id: output_1.OUTPUT_MODE_ID,
        extensions: [],
        mimetypes: [output_1.OUTPUT_MIME]
    });
    // Register Log Output Mode
    modesRegistry_1.ModesRegistry.registerLanguage({
        id: output_1.LOG_MODE_ID,
        extensions: [],
        mimetypes: [output_1.LOG_MIME]
    });
    // register output container
    const outputViewIcon = (0, iconRegistry_1.registerIcon)('output-view-icon', codicons_1.Codicon.output, nls.localize('outputViewIcon', 'View icon of the output view.'));
    const VIEW_CONTAINER = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: output_1.OUTPUT_VIEW_ID,
        title: nls.localize2('output', "Output"),
        icon: outputViewIcon,
        order: 1,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [output_1.OUTPUT_VIEW_ID, { mergeViewWithContainerWhenSingleView: true }]),
        storageId: output_1.OUTPUT_VIEW_ID,
        hideIfEmpty: true,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true });
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: output_1.OUTPUT_VIEW_ID,
            name: nls.localize2('output', "Output"),
            containerIcon: outputViewIcon,
            canMoveView: true,
            canToggleVisibility: false,
            ctorDescriptor: new descriptors_1.SyncDescriptor(outputView_1.OutputViewPane),
            openCommandActionDescriptor: {
                id: 'workbench.action.output.toggleOutput',
                mnemonicTitle: nls.localize({ key: 'miToggleOutput', comment: ['&& denotes a mnemonic'] }, "&&Output"),
                keybindings: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 51 /* KeyCode.KeyU */,
                    linux: {
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 38 /* KeyCode.KeyH */) // On Ubuntu Ctrl+Shift+U is taken by some global OS command
                    }
                },
                order: 1,
            }
        }], VIEW_CONTAINER);
    let OutputContribution = class OutputContribution extends lifecycle_1.Disposable {
        constructor(outputService, editorService, fileConfigurationService) {
            super();
            this.outputService = outputService;
            this.editorService = editorService;
            this.fileConfigurationService = fileConfigurationService;
            this.registerActions();
        }
        registerActions() {
            this.registerSwitchOutputAction();
            this.registerShowOutputChannelsAction();
            this.registerClearOutputAction();
            this.registerToggleAutoScrollAction();
            this.registerOpenActiveOutputFileAction();
            this.registerOpenActiveOutputFileInAuxWindowAction();
            this.registerShowLogsAction();
            this.registerOpenLogFileAction();
        }
        registerSwitchOutputAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.output.action.switchBetweenOutputs`,
                        title: nls.localize('switchBetweenOutputs.label', "Switch Output"),
                    });
                }
                async run(accessor, channelId) {
                    if (channelId) {
                        accessor.get(output_1.IOutputService).showChannel(channelId, true);
                    }
                }
            }));
            const switchOutputMenu = new actions_1.MenuId('workbench.output.menu.switchOutput');
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ViewTitle, {
                submenu: switchOutputMenu,
                title: nls.localize('switchToOutput.label', "Switch Output"),
                group: 'navigation',
                when: contextkey_1.ContextKeyExpr.equals('view', output_1.OUTPUT_VIEW_ID),
                order: 1,
                isSelection: true
            }));
            const registeredChannels = new Map();
            this._register((0, lifecycle_1.toDisposable)(() => (0, lifecycle_1.dispose)(registeredChannels.values())));
            const registerOutputChannels = (channels) => {
                for (const channel of channels) {
                    const title = channel.label;
                    const group = channel.extensionId ? '0_ext_outputchannels' : '1_core_outputchannels';
                    registeredChannels.set(channel.id, (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                        constructor() {
                            super({
                                id: `workbench.action.output.show.${channel.id}`,
                                title,
                                toggled: output_1.ACTIVE_OUTPUT_CHANNEL_CONTEXT.isEqualTo(channel.id),
                                menu: {
                                    id: switchOutputMenu,
                                    group,
                                }
                            });
                        }
                        async run(accessor) {
                            return accessor.get(output_1.IOutputService).showChannel(channel.id, true);
                        }
                    }));
                }
            };
            registerOutputChannels(this.outputService.getChannelDescriptors());
            const outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
            this._register(outputChannelRegistry.onDidRegisterChannel(e => {
                const channel = this.outputService.getChannelDescriptor(e);
                if (channel) {
                    registerOutputChannels([channel]);
                }
            }));
            this._register(outputChannelRegistry.onDidRemoveChannel(e => {
                registeredChannels.get(e)?.dispose();
                registeredChannels.delete(e);
            }));
        }
        registerShowOutputChannelsAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.showOutputChannels',
                        title: nls.localize2('showOutputChannels', "Show Output Channels..."),
                        category: nls.localize2('output', "Output"),
                        f1: true
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.IOutputService);
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const extensionChannels = [], coreChannels = [];
                    for (const channel of outputService.getChannelDescriptors()) {
                        if (channel.extensionId) {
                            extensionChannels.push(channel);
                        }
                        else {
                            coreChannels.push(channel);
                        }
                    }
                    const entries = [];
                    for (const { id, label } of extensionChannels) {
                        entries.push({ id, label });
                    }
                    if (extensionChannels.length && coreChannels.length) {
                        entries.push({ type: 'separator' });
                    }
                    for (const { id, label } of coreChannels) {
                        entries.push({ id, label });
                    }
                    const entry = await quickInputService.pick(entries, { placeHolder: nls.localize('selectOutput', "Select Output Channel") });
                    if (entry) {
                        return outputService.showChannel(entry.id);
                    }
                }
            }));
        }
        registerClearOutputAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.output.action.clearOutput`,
                        title: nls.localize2('clearOutput.label', "Clear Output"),
                        category: actionCommonCategories_1.Categories.View,
                        menu: [{
                                id: actions_1.MenuId.ViewTitle,
                                when: contextkey_1.ContextKeyExpr.equals('view', output_1.OUTPUT_VIEW_ID),
                                group: 'navigation',
                                order: 2
                            }, {
                                id: actions_1.MenuId.CommandPalette
                            }, {
                                id: actions_1.MenuId.EditorContext,
                                when: output_1.CONTEXT_IN_OUTPUT
                            }],
                        icon: codicons_1.Codicon.clearAll
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.IOutputService);
                    const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
                    const activeChannel = outputService.getActiveChannel();
                    if (activeChannel) {
                        activeChannel.clear();
                        audioCueService.playAudioCue(audioCueService_1.AudioCue.clear);
                    }
                }
            }));
        }
        registerToggleAutoScrollAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.output.action.toggleAutoScroll`,
                        title: nls.localize2('toggleAutoScroll', "Toggle Auto Scrolling"),
                        tooltip: nls.localize('outputScrollOff', "Turn Auto Scrolling Off"),
                        menu: {
                            id: actions_1.MenuId.ViewTitle,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', output_1.OUTPUT_VIEW_ID)),
                            group: 'navigation',
                            order: 3,
                        },
                        icon: codicons_1.Codicon.lock,
                        toggled: {
                            condition: output_1.CONTEXT_OUTPUT_SCROLL_LOCK,
                            icon: codicons_1.Codicon.unlock,
                            tooltip: nls.localize('outputScrollOn', "Turn Auto Scrolling On")
                        }
                    });
                }
                async run(accessor) {
                    const outputView = accessor.get(viewsService_1.IViewsService).getActiveViewWithId(output_1.OUTPUT_VIEW_ID);
                    outputView.scrollLock = !outputView.scrollLock;
                }
            }));
        }
        registerOpenActiveOutputFileAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.action.openActiveLogOutputFile`,
                        title: nls.localize2('openActiveOutputFile', "Open Output in Editor"),
                        menu: [{
                                id: actions_1.MenuId.ViewTitle,
                                when: contextkey_1.ContextKeyExpr.equals('view', output_1.OUTPUT_VIEW_ID),
                                group: 'navigation',
                                order: 4,
                                isHiddenByDefault: true
                            }],
                        icon: codicons_1.Codicon.goToFile,
                        precondition: output_1.CONTEXT_ACTIVE_FILE_OUTPUT
                    });
                }
                async run() {
                    that.openActiveOutoutFile();
                }
            }));
        }
        registerOpenActiveOutputFileInAuxWindowAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.action.openActiveLogOutputFileInNewWindow`,
                        title: nls.localize2('openActiveOutputFileInNewWindow', "Open Output in New Window"),
                        menu: [{
                                id: actions_1.MenuId.ViewTitle,
                                when: contextkey_1.ContextKeyExpr.equals('view', output_1.OUTPUT_VIEW_ID),
                                group: 'navigation',
                                order: 5,
                                isHiddenByDefault: true
                            }],
                        icon: codicons_1.Codicon.emptyWindow,
                        precondition: output_1.CONTEXT_ACTIVE_FILE_OUTPUT
                    });
                }
                async run() {
                    that.openActiveOutoutFile(editorService_1.AUX_WINDOW_GROUP);
                }
            }));
        }
        async openActiveOutoutFile(group) {
            const fileOutputChannelDescriptor = this.getFileOutputChannelDescriptor();
            if (fileOutputChannelDescriptor) {
                await this.fileConfigurationService.updateReadonly(fileOutputChannelDescriptor.file, true);
                await this.editorService.openEditor({
                    resource: fileOutputChannelDescriptor.file,
                    options: {
                        pinned: true,
                    },
                }, group);
            }
        }
        getFileOutputChannelDescriptor() {
            const channel = this.outputService.getActiveChannel();
            if (channel) {
                const descriptor = this.outputService.getChannelDescriptors().filter(c => c.id === channel.id)[0];
                if (descriptor?.file) {
                    return descriptor;
                }
            }
            return null;
        }
        registerShowLogsAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.showLogs',
                        title: nls.localize2('showLogs', "Show Logs..."),
                        category: actionCommonCategories_1.Categories.Developer,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                        },
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.IOutputService);
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const extensionLogs = [], logs = [];
                    for (const channel of outputService.getChannelDescriptors()) {
                        if (channel.log) {
                            if (channel.extensionId) {
                                extensionLogs.push(channel);
                            }
                            else {
                                logs.push(channel);
                            }
                        }
                    }
                    const entries = [];
                    for (const { id, label } of logs) {
                        entries.push({ id, label });
                    }
                    if (extensionLogs.length && logs.length) {
                        entries.push({ type: 'separator', label: nls.localize('extensionLogs', "Extension Logs") });
                    }
                    for (const { id, label } of extensionLogs) {
                        entries.push({ id, label });
                    }
                    const entry = await quickInputService.pick(entries, { placeHolder: nls.localize('selectlog', "Select Log") });
                    if (entry) {
                        return outputService.showChannel(entry.id);
                    }
                }
            }));
        }
        registerOpenLogFileAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openLogFile',
                        title: nls.localize2('openLogFile', "Open Log File..."),
                        category: actionCommonCategories_1.Categories.Developer,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                        },
                        metadata: {
                            description: 'workbench.action.openLogFile',
                            args: [{
                                    name: 'logFile',
                                    schema: {
                                        markdownDescription: nls.localize('logFile', "The id of the log file to open, for example `\"window\"`. Currently the best way to get this is to get the ID by checking the `workbench.action.output.show.<id>` commands"),
                                        type: 'string'
                                    }
                                }]
                        },
                    });
                }
                async run(accessor, args) {
                    const outputService = accessor.get(output_1.IOutputService);
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const editorService = accessor.get(editorService_1.IEditorService);
                    const fileConfigurationService = accessor.get(filesConfigurationService_1.IFilesConfigurationService);
                    const entries = outputService.getChannelDescriptors().filter(c => c.file && c.log)
                        .map(channel => ({ id: channel.id, label: channel.label, channel }));
                    const argName = args && typeof args === 'string' ? args : undefined;
                    let entry;
                    if (argName) {
                        entry = entries.find(e => e.id === argName);
                    }
                    if (!entry) {
                        entry = await quickInputService.pick(entries, { placeHolder: nls.localize('selectlogFile', "Select Log File") });
                    }
                    if (entry) {
                        const resource = (0, types_1.assertIsDefined)(entry.channel.file);
                        await fileConfigurationService.updateReadonly(resource, true);
                        await editorService.openEditor({
                            resource,
                            options: {
                                pinned: true,
                            }
                        });
                    }
                }
            }));
        }
    };
    OutputContribution = __decorate([
        __param(0, output_1.IOutputService),
        __param(1, editorService_1.IEditorService),
        __param(2, filesConfigurationService_1.IFilesConfigurationService)
    ], OutputContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(OutputContribution, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'output',
        order: 30,
        title: nls.localize('output', "Output"),
        type: 'object',
        properties: {
            'output.smartScroll.enabled': {
                type: 'boolean',
                description: nls.localize('output.smartScroll.enabled', "Enable/disable the ability of smart scrolling in the output view. Smart scrolling allows you to lock scrolling automatically when you click in the output view and unlocks when you click in the last line."),
                default: true,
                scope: 3 /* ConfigurationScope.WINDOW */,
                tags: ['output']
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvb3V0cHV0L2Jyb3dzZXIvb3V0cHV0LmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQThCaEcsbUJBQW1CO0lBQ25CLElBQUEsOEJBQWlCLEVBQUMsdUJBQWMsRUFBRSw4QkFBYSxvQ0FBNEIsQ0FBQztJQUU1RSx1QkFBdUI7SUFDdkIsNkJBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QixFQUFFLEVBQUUsdUJBQWM7UUFDbEIsVUFBVSxFQUFFLEVBQUU7UUFDZCxTQUFTLEVBQUUsQ0FBQyxvQkFBVyxDQUFDO0tBQ3hCLENBQUMsQ0FBQztJQUVILDJCQUEyQjtJQUMzQiw2QkFBYSxDQUFDLGdCQUFnQixDQUFDO1FBQzlCLEVBQUUsRUFBRSxvQkFBVztRQUNmLFVBQVUsRUFBRSxFQUFFO1FBQ2QsU0FBUyxFQUFFLENBQUMsaUJBQVEsQ0FBQztLQUNyQixDQUFDLENBQUM7SUFFSCw0QkFBNEI7SUFDNUIsTUFBTSxjQUFjLEdBQUcsSUFBQSwyQkFBWSxFQUFDLGtCQUFrQixFQUFFLGtCQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsK0JBQStCLENBQUMsQ0FBQyxDQUFDO0lBQ3pJLE1BQU0sY0FBYyxHQUFrQixtQkFBUSxDQUFDLEVBQUUsQ0FBMEIsa0JBQXVCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztRQUNoSixFQUFFLEVBQUUsdUJBQWM7UUFDbEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQztRQUN4QyxJQUFJLEVBQUUsY0FBYztRQUNwQixLQUFLLEVBQUUsQ0FBQztRQUNSLGNB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