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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/keybinding/common/keybinding", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/base/browser/dom", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry"], function (require, exports, nls_1, lifecycle_1, platform_1, keybinding_1, workspace_1, configuration_1, dom_1, keybindingLabel_1, commands_1, contextkey_1, defaultStyles_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorGroupWatermark = void 0;
    (0, colorRegistry_1.registerColor)('editorWatermark.foreground', { dark: (0, colorRegistry_1.transparent)(colorRegistry_1.editorForeground, 0.6), light: (0, colorRegistry_1.transparent)(colorRegistry_1.editorForeground, 0.68), hcDark: colorRegistry_1.editorForeground, hcLight: colorRegistry_1.editorForeground }, (0, nls_1.localize)('editorLineHighlight', 'Foreground color for the labels in the editor watermark.'));
    const showCommands = { text: (0, nls_1.localize)('watermark.showCommands', "Show All Commands"), id: 'workbench.action.showCommands' };
    const quickAccess = { text: (0, nls_1.localize)('watermark.quickAccess', "Go to File"), id: 'workbench.action.quickOpen' };
    const openFileNonMacOnly = { text: (0, nls_1.localize)('watermark.openFile', "Open File"), id: 'workbench.action.files.openFile', mac: false };
    const openFolderNonMacOnly = { text: (0, nls_1.localize)('watermark.openFolder', "Open Folder"), id: 'workbench.action.files.openFolder', mac: false };
    const openFileOrFolderMacOnly = { text: (0, nls_1.localize)('watermark.openFileFolder', "Open File or Folder"), id: 'workbench.action.files.openFileFolder', mac: true };
    const openRecent = { text: (0, nls_1.localize)('watermark.openRecent', "Open Recent"), id: 'workbench.action.openRecent' };
    const newUntitledFileMacOnly = { text: (0, nls_1.localize)('watermark.newUntitledFile', "New Untitled Text File"), id: 'workbench.action.files.newUntitledFile', mac: true };
    const findInFiles = { text: (0, nls_1.localize)('watermark.findInFiles', "Find in Files"), id: 'workbench.action.findInFiles' };
    const toggleTerminal = { text: (0, nls_1.localize)({ key: 'watermark.toggleTerminal', comment: ['toggle is a verb here'] }, "Toggle Terminal"), id: 'workbench.action.terminal.toggleTerminal', when: contextkey_1.ContextKeyExpr.equals('terminalProcessSupported', true) };
    const startDebugging = { text: (0, nls_1.localize)('watermark.startDebugging', "Start Debugging"), id: 'workbench.action.debug.start', when: contextkey_1.ContextKeyExpr.equals('terminalProcessSupported', true) };
    const toggleFullscreen = { text: (0, nls_1.localize)({ key: 'watermark.toggleFullscreen', comment: ['toggle is a verb here'] }, "Toggle Full Screen"), id: 'workbench.action.toggleFullScreen', when: contextkey_1.ContextKeyExpr.equals('terminalProcessSupported', true).negate() };
    const showSettings = { text: (0, nls_1.localize)('watermark.showSettings', "Show Settings"), id: 'workbench.action.openSettings', when: contextkey_1.ContextKeyExpr.equals('terminalProcessSupported', true).negate() };
    const noFolderEntries = [
        showCommands,
        openFileNonMacOnly,
        openFolderNonMacOnly,
        openFileOrFolderMacOnly,
        openRecent,
        newUntitledFileMacOnly
    ];
    const folderEntries = [
        showCommands,
        quickAccess,
        findInFiles,
        startDebugging,
        toggleTerminal,
        toggleFullscreen,
        showSettings
    ];
    let EditorGroupWatermark = class EditorGroupWatermark extends lifecycle_1.Disposable {
        constructor(container, keybindingService, contextService, contextKeyService, configurationService) {
            super();
            this.keybindingService = keybindingService;
            this.contextService = contextService;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this.transientDisposables = this._register(new lifecycle_1.DisposableStore());
            this.enabled = false;
            const elements = (0, dom_1.h)('.editor-group-watermark', [
                (0, dom_1.h)('.letterpress'),
                (0, dom_1.h)('.shortcuts@shortcuts'),
            ]);
            (0, dom_1.append)(container, elements.root);
            this.shortcuts = elements.shortcuts;
            this.registerListeners();
            this.workbenchState = contextService.getWorkbenchState();
            this.render();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.tips.enabled')) {
                    this.render();
                }
            }));
            this._register(this.contextService.onDidChangeWorkbenchState(workbenchState => {
                if (this.workbenchState === workbenchState) {
                    return;
                }
                this.workbenchState = workbenchState;
                this.render();
            }));
            const allEntriesWhenClauses = [...noFolderEntries, ...folderEntries].filter(entry => entry.when !== undefined).map(entry => entry.when);
            const allKeys = new Set();
            allEntriesWhenClauses.forEach(when => when.keys().forEach(key => allKeys.add(key)));
            this._register(this.contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(allKeys)) {
                    this.render();
                }
            }));
        }
        render() {
            const enabled = this.configurationService.getValue('workbench.tips.enabled');
            if (enabled === this.enabled) {
                return;
            }
            this.enabled = enabled;
            this.clear();
            if (!enabled) {
                return;
            }
            const box = (0, dom_1.append)(this.shortcuts, (0, dom_1.$)('.watermark-box'));
            const folder = this.workbenchState !== 1 /* WorkbenchState.EMPTY */;
            const selected = (folder ? folderEntries : noFolderEntries)
                .filter(entry => !('when' in entry) || this.contextKeyService.contextMatchesRules(entry.when))
                .filter(entry => !('mac' in entry) || entry.mac === (platform_1.isMacintosh && !platform_1.isWeb))
                .filter(entry => !!commands_1.CommandsRegistry.getCommand(entry.id));
            const update = () => {
                (0, dom_1.clearNode)(box);
                selected.map(entry => {
                    const keys = this.keybindingService.lookupKeybinding(entry.id);
                    if (!keys) {
                        return;
                    }
                    const dl = (0, dom_1.append)(box, (0, dom_1.$)('dl'));
                    const dt = (0, dom_1.append)(dl, (0, dom_1.$)('dt'));
                    dt.textContent = entry.text;
                    const dd = (0, dom_1.append)(dl, (0, dom_1.$)('dd'));
                    const keybinding = new keybindingLabel_1.KeybindingLabel(dd, platform_1.OS, { renderUnboundKeybindings: true, ...defaultStyles_1.defaultKeybindingLabelStyles });
                    keybinding.set(keys);
                });
            };
            update();
            this.transientDisposables.add(this.keybindingService.onDidUpdateKeybindings(update));
        }
        clear() {
            (0, dom_1.clearNode)(this.shortcuts);
            this.transientDisposables.clear();
        }
        dispose() {
            super.dispose();
            this.clear();
        }
    };
    exports.EditorGroupWatermark = EditorGroupWatermark;
    exports.EditorGroupWatermark = EditorGroupWatermark = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, configuration_1.IConfigurationService)
    ], EditorGroupWatermark);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3JvdXBXYXRlcm1hcmsuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3JHcm91cFdhdGVybWFyay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFlaEcsSUFBQSw2QkFBYSxFQUFDLDRCQUE0QixFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUEsMkJBQVcsRUFBQyxnQ0FBZ0IsRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBQSwyQkFBVyxFQUFDLGdDQUFnQixFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxnQ0FBZ0IsRUFBRSxPQUFPLEVBQUUsZ0NBQWdCLEVBQUUsRUFBRSxJQUFBLGNBQVEsRUFBQyxxQkFBcUIsRUFBRSwwREFBMEQsQ0FBQyxDQUFDLENBQUM7SUFTeFIsTUFBTSxZQUFZLEdBQW1CLEVBQUUsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLHdCQUF3QixFQUFFLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxFQUFFLCtCQUErQixFQUFFLENBQUM7SUFDNUksTUFBTSxXQUFXLEdBQW1CLEVBQUUsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLHVCQUF1QixFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSw0QkFBNEIsRUFBRSxDQUFDO0lBQ2hJLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLG9CQUFvQixFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxpQ0FBaUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDcEosTUFBTSxvQkFBb0IsR0FBbUIsRUFBRSxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxFQUFF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