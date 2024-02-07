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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls", "vs/platform/audioCues/browser/audioCueService", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/contrib/terminal/browser/xterm/decorationStyles", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/services/lifecycle/common/lifecycle"], function (require, exports, dom, actions_1, event_1, lifecycle_1, themables_1, nls_1, audioCueService_1, clipboardService_1, commands_1, configuration_1, contextView_1, instantiation_1, notification_1, opener_1, quickInput_1, themeService_1, terminalIcons_1, decorationStyles_1, terminalColorRegistry_1, lifecycle_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecorationAddon = void 0;
    let DecorationAddon = class DecorationAddon extends lifecycle_1.Disposable {
        constructor(_capabilities, _clipboardService, _contextMenuService, _configurationService, _themeService, _openerService, _quickInputService, lifecycleService, _commandService, instantiationService, _audioCueService, _notificationService) {
            super();
            this._capabilities = _capabilities;
            this._clipboardService = _clipboardService;
            this._contextMenuService = _contextMenuService;
            this._configurationService = _configurationService;
            this._themeService = _themeService;
            this._openerService = _openerService;
            this._quickInputService = _quickInputService;
            this._commandService = _commandService;
            this._audioCueService = _audioCueService;
            this._notificationService = _notificationService;
            this._capabilityDisposables = new Map();
            this._decorations = new Map();
            this._onDidRequestRunCommand = this._register(new event_1.Emitter());
            this.onDidRequestRunCommand = this._onDidRequestRunCommand.event;
            this._register((0, lifecycle_1.toDisposable)(() => this._dispose()));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */) || e.affectsConfiguration("terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */)) {
                    this.refreshLayouts();
                }
                else if (e.affectsConfiguration('workbench.colorCustomizations')) {
                    this._refreshStyles(true);
                }
                else if (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */)) {
                    this._removeCapabilityDisposables(2 /* TerminalCapability.CommandDetection */);
                    this._updateDecorationVisibility();
                }
            }));
            this._register(this._themeService.onDidColorThemeChange(() => this._refreshStyles(true)));
            this._updateDecorationVisibility();
            this._register(this._capabilities.onDidAddCapabilityType(c => this._createCapabilityDisposables(c)));
            this._register(this._capabilities.onDidRemoveCapabilityType(c => this._removeCapabilityDisposables(c)));
            this._register(lifecycleService.onWillShutdown(() => this._disposeAllDecorations()));
            this._terminalDecorationHoverService = instantiationService.createInstance(decorationStyles_1.TerminalDecorationHoverManager);
        }
        _removeCapabilityDisposables(c) {
            const disposables = this._capabilityDisposables.get(c);
            if (disposables) {
                (0, lifecycle_1.dispose)(disposables);
            }
            this._capabilityDisposables.delete(c);
        }
        _createCapabilityDisposables(c) {
            let disposables = [];
            const capability = this._capabilities.get(c);
            if (!capability || this._capabilityDisposables.has(c)) {
                return;
            }
            switch (capability.type) {
                case 4 /* TerminalCapability.BufferMarkDetection */:
                    disposables = [capability.onMarkAdded(mark => this.registerMarkDecoration(mark))];
                    break;
                case 2 /* TerminalCapability.CommandDetection */:
                    disposables = this._getCommandDetectionListeners(capability);
                    break;
            }
            this._capabilityDisposables.set(c, disposables);
        }
        registerMarkDecoration(mark) {
            if (!this._terminal || (!this._showGutterDecorations && !this._showOverviewRulerDecorations)) {
                return undefined;
            }
            if (mark.hidden) {
                return undefined;
            }
            return this.registerCommandDecoration(undefined, undefined, mark);
        }
        _updateDecorationVisibility() {
            const showDecorations = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
            this._showGutterDecorations = (showDecorations === 'both' || showDecorations === 'gutter');
            this._showOverviewRulerDecorations = (showDecorations === 'both' || showDecorations === 'overviewRuler');
            this._disposeAllDecorations();
            if (this._showGutterDecorations || this._showOverviewRulerDecorations) {
                this._attachToCommandCapability();
                this._updateGutterDecorationVisibility();
            }
            const currentCommand = this._capabilities.get(2 /* TerminalCapability.CommandDetection */)?.executingCommandObject;
            if (currentCommand) {
                this.registerCommandDecoration(currentCommand, true);
            }
        }
        _disposeAllDecorations() {
            this._placeholderDecoration?.dispose();
            for (const value of this._decorations.values()) {
                value.decoration.dispose();
                (0, lifecycle_1.dispose)(value.disposables);
            }
        }
        _updateGutterDecorationVisibility() {
            const commandDecorationElements = this._terminal?.element?.querySelectorAll("terminal-command-decoration" /* DecorationSelector.CommandDecoration */);
            if (commandDecorationElements) {
                for (const commandDecorationElement of commandDecorationElements) {
                    this._updateCommandDecorationVisibility(commandDecorationElement);
                }
            }
        }
        _updateCommandDecorationVisibility(commandDecorationElement) {
            if (this._showGutterDecorations) {
                commandDecorationElement.classList.remove("hide" /* DecorationSelector.Hide */);
            }
            else {
                commandDecorationElement.classList.add("hide" /* DecorationSelector.Hide */);
            }
        }
        refreshLayouts() {
            (0, decorationStyles_1.updateLayout)(this._configurationService, this._placeholderDecoration?.element);
            for (const decoration of this._decorations) {
                (0, decorationStyles_1.updateLayout)(this._configurationService, decoration[1].decoration.element);
            }
        }
        _refreshStyles(refreshOverviewRulerColors) {
            if (refreshOverviewRulerColors) {
                for (const decoration of this._decorations.values()) {
                    const color = this._getDecorationCssColor(decoration)?.toString() ?? '';
                    if (decoration.decoration.options?.overviewRulerOptions) {
                        decoration.decoration.options.overviewRulerOptions.color = color;
                    }
                    else if (decoration.decoration.options) {
                        decoration.decoration.options.overviewRulerOptions = { color };
                    }
                }
            }
            this._updateClasses(this._placeholderDecoration?.element);
            for (const decoration of this._decorations.values()) {
                this._updateClasses(decoration.decoration.element, decoration.exitCode, decoration.markProperties);
            }
        }
        _dispose() {
            this._terminalDecorationHoverService.dispose();
            for (const disposable of this._capabilityDisposables.values()) {
                (0, lifecycle_1.dispose)(disposable);
            }
            this.clearDecorations();
        }
        _clearPlaceholder() {
            this._placeholderDecoration?.dispose();
            this._placeholderDecoration = undefined;
        }
        clearDecorations() {
            this._placeholderDecoration?.marker.dispose();
            this._clearPlaceholder();
            this._disposeAllDecorations();
            this._decorations.clear();
        }
        _attachToCommandCapability() {
            if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                this._getCommandDetectionListeners(this._capabilities.get(2 /* TerminalCapability.CommandDetection */));
            }
        }
        _getCommandDetectionListeners(capability) {
            if (this._capabilityDisposables.has(2 /* TerminalCapability.CommandDetection */)) {
                const disposables = this._capabilityDisposables.get(2 /* TerminalCapability.CommandDetection */);
                (0, lifecycle_1.dispose)(disposables);
                this._capabilityDisposables.delete(capability.type);
            }
            const commandDetectionListeners = [];
            // Command started
            if (capability.executingCommandObject?.marker) {
                this.registerCommandDecoration(capability.executingCommandObject, true);
            }
            commandDetectionListeners.push(capability.onCommandStarted(command => this.registerCommandDecoration(command, true)));
            // Command finished
            for (const command of capability.commands) {
                this.registerCommandDecoration(command);
            }
            commandDetectionListeners.push(capability.onCommandFinished(command => {
                this.registerCommandDecoration(command);
                if (command.exitCode) {
                    this._audioCueService.playAudioCue(audioCueService_1.AudioCue.terminalCommandFailed);
                }
            }));
            // Command invalidated
            commandDetectionListeners.push(capability.onCommandInvalidated(commands => {
                for (const command of commands) {
                    const id = command.marker?.id;
                    if (id) {
                        const match = this._decorations.get(id);
                        if (match) {
                            match.decoration.dispose();
                            (0, lifecycle_1.dispose)(match.disposables);
                        }
                    }
                }
            }));
            // Current command invalidated
            commandDetectionListeners.push(capability.onCurrentCommandInvalidated((request) => {
                if (request.reason === "noProblemsReported" /* CommandInvalidationReason.NoProblemsReported */) {
                    const lastDecoration = Array.from(this._decorations.entries())[this._decorations.size - 1];
                    lastDecoration?.[1].decoration.dispose();
                }
                else if (request.reason === "windows" /* CommandInvalidationReason.Windows */) {
                    this._clearPlaceholder();
                }
            }));
            return commandDetectionListeners;
        }
        activate(terminal) {
            this._terminal = terminal;
            this._attachToCommandCapability();
        }
        registerCommandDecoration(command, beforeCommandExecution, markProperties) {
            if (!this._terminal || (beforeCommandExecution && !command) || (!this._showGutterDecorations && !this._showOverviewRulerDecorations)) {
                return undefined;
            }
            const marker = command?.marker || markProperties?.marker;
            if (!marker) {
                throw new Error(`cannot add a decoration for a command ${JSON.stringify(command)} with no marker`);
            }
            this._clearPlaceholder();
            const color = this._getDecorationCssColor(command)?.toString() ?? '';
            const decoration = this._terminal.registerDecoration({
                marker,
                overviewRulerOptions: this._showOverviewRulerDecorations ? (beforeCommandExecution
                    ? { color, position: 'left' }
                    : { color, position: command?.exitCode ? 'right' : 'left' }) : undefined
            });
            if (!decoration) {
                return undefined;
            }
            if (beforeCommandExecution) {
                this._placeholderDecoration = decoration;
            }
            decoration.onRender(element => {
                if (element.classList.contains(".xterm-decoration-overview-ruler" /* DecorationSelector.OverviewRuler */)) {
                    return;
                }
                if (!this._decorations.get(decoration.marker.id)) {
                    decoration.onDispose(() => this._decorations.delete(decoration.marker.id));
                    this._decorations.set(decoration.marker.id, {
                        decoration,
                        disposables: this._createDisposables(element, command, markProperties),
                        exitCode: command?.exitCode,
                        markProperties: command?.markProperties
                    });
                }
                if (!element.classList.contains("codicon" /* DecorationSelector.Codicon */) || command?.marker?.line === 0) {
                    // first render or buffer was cleared
                    (0, decorationStyles_1.updateLayout)(this._configurationService, element);
                    this._updateClasses(element, command?.exitCode, command?.markProperties || markProperties);
                }
            });
            return decoration;
        }
        _createDisposables(element, command, markProperties) {
            if (command?.exitCode === undefined && !command?.markProperties) {
                return [];
            }
            else if (command?.markProperties || markProperties) {
                return [this._terminalDecorationHoverService.createHover(element, command || markProperties, markProperties?.hoverMessage)];
            }
            return [...this._createContextMenu(element, command), this._terminalDecorationHoverService.createHover(element, command)];
        }
        _updateClasses(element, exitCode, markProperties) {
            if (!element) {
                return;
            }
            for (const classes of element.classList) {
                element.classList.remove(classes);
            }
            element.classList.add("terminal-command-decoration" /* DecorationSelector.CommandDecoration */, "codicon" /* DecorationSelector.Codicon */, "xterm-decoration" /* DecorationSelector.XtermDecoration */);
            if (markProperties) {
                element.classList.add("default-color" /* DecorationSelector.DefaultColor */, ...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.terminalDecorationMark));
                if (!markProperties.hoverMessage) {
                    //disable the mouse pointer
                    element.classList.add("default" /* DecorationSelector.Default */);
                }
            }
            else {
                // command decoration
                this._updateCommandDecorationVisibility(element);
                if (exitCode === undefined) {
                    element.classList.add("default-color" /* DecorationSelector.DefaultColor */, "default" /* DecorationSelector.Default */);
                    element.classList.add(...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.terminalDecorationIncomplete));
                }
                else if (exitCode) {
                    element.classList.add("error" /* DecorationSelector.ErrorColor */);
                    element.classList.add(...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.terminalDecorationError));
                }
                else {
                    element.classList.add(...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.terminalDecorationSuccess));
                }
            }
        }
        _createContextMenu(element, command) {
            // When the xterm Decoration gets disposed of, its element gets removed from the dom
            // along with its listeners
            return [
                dom.addDisposableListener(element, dom.EventType.MOUSE_DOWN, async (e) => {
                    e.stopImmediatePropagation();
                }),
                dom.addDisposableListener(element, dom.EventType.CLICK, async (e) => {
                    e.stopImmediatePropagation();
                    this._terminalDecorationHoverService.hideHover();
                    const actions = await this._getCommandActions(command);
                    this._contextMenuService.showContextMenu({ getAnchor: () => element, getActions: () => actions });
                }),
                dom.addDisposableListener(element, dom.EventType.CONTEXT_MENU, async (e) => {
                    e.stopImmediatePropagation();
                    this._terminalDecorationHoverService.hideHover();
                    const actions = this._getContextMenuActions();
                    this._contextMenuService.showContextMenu({ getAnchor: () => element, getActions: () => actions });
                }),
            ];
        }
        _getContextMenuActions() {
            const label = (0, nls_1.localize)('workbench.action.terminal.toggleVisibility', "Toggle Visibility");
            return [
                {
                    class: undefined, tooltip: label, id: 'terminal.toggleVisibility', label, enabled: true,
                    run: async () => {
                        this._showToggleVisibilityQuickPick();
                    }
                }
            ];
        }
        async _getCommandActions(command) {
            const actions = [];
            if (command.command !== '') {
                const labelRun = (0, nls_1.localize)("terminal.rerunCommand", 'Rerun Command');
                actions.push({
                    class: undefined, tooltip: labelRun, id: 'terminal.rerunCommand', label: labelRun, enabled: true,
                    run: async () => {
                        if (command.command === '') {
                            return;
                        }
                        if (!command.isTrusted) {
                            const shouldRun = await new Promise(r => {
                                this._notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('rerun', 'Do you want to run the command: {0}', command.command), [{
                                        label: (0, nls_1.localize)('yes', 'Yes'),
                                        run: () => r(true)
                                    }, {
                                        label: (0, nls_1.localize)('no', 'No'),
                                        run: () => r(false)
                                    }]);
                            });
                            if (!shouldRun) {
                                return;
                            }
                        }
                        this._onDidRequestRunCommand.fire({ command });
                    }
                });
                // The second section is the clipboard section
                actions.push(new actions_1.Separator());
                const labelCopy = (0, nls_1.localize)("terminal.copyCommand", 'Copy Command');
                actions.push({
                    class: undefined, tooltip: labelCopy, id: 'terminal.copyCommand', label: labelCopy, enabled: true,
                    run: () => this._clipboardService.writeText(command.command)
                });
            }
            if (command.hasOutput()) {
                const labelCopyCommandAndOutput = (0, nls_1.localize)("terminal.copyCommandAndOutput", 'Copy Command and Output');
                actions.push({
                    class: undefined, tooltip: labelCopyCommandAndOutput, id: 'terminal.copyCommandAndOutput', label: labelCopyCommandAndOutput, enabled: true,
                    run: () => {
                        const output = command.getOutput();
                        if (typeof output === 'string') {
                            this._clipboardService.writeText(`${command.command !== '' ? command.command + '\n' : ''}${output}`);
                        }
                    }
                });
                const labelText = (0, nls_1.localize)("terminal.copyOutput", 'Copy Output');
                actions.push({
                    class: undefined, tooltip: labelText, id: 'terminal.copyOutput', label: labelText, enabled: true,
                    run: () => {
                        const text = command.getOutput();
                        if (typeof text === 'string') {
                            this._clipboardService.writeText(text);
                        }
                    }
                });
                const labelHtml = (0, nls_1.localize)("terminal.copyOutputAsHtml", 'Copy Output as HTML');
                actions.push({
                    class: undefined, tooltip: labelHtml, id: 'terminal.copyOutputAsHtml', label: labelHtml, enabled: true,
                    run: () => this._onDidRequestRunCommand.fire({ command, copyAsHtml: true })
                });
            }
            if (actions.length > 0) {
                actions.push(new actions_1.Separator());
            }
            const labelRunRecent = (0, nls_1.localize)('workbench.action.terminal.runRecentCommand', "Run Recent Command");
            actions.push({
                class: undefined, tooltip: labelRunRecent, id: 'workbench.action.terminal.runRecentCommand', label: labelRunRecent, enabled: true,
                run: () => this._commandService.executeCommand('workbench.action.terminal.runRecentCommand')
            });
            const labelGoToRecent = (0, nls_1.localize)('workbench.action.terminal.goToRecentDirectory', "Go To Recent Directory");
            actions.push({
                class: undefined, tooltip: labelRunRecent, id: 'workbench.action.terminal.goToRecentDirectory', label: labelGoToRecent, enabled: true,
                run: () => this._commandService.executeCommand('workbench.action.terminal.goToRecentDirectory')
            });
            actions.push(new actions_1.Separator());
            const labelAbout = (0, nls_1.localize)("terminal.learnShellIntegration", 'Learn About Shell Integration');
            actions.push({
                class: undefined, tooltip: labelAbout, id: 'terminal.learnShellIntegration', label: labelAbout, enabled: true,
                run: () => this._openerService.open('https://code.visualstudio.com/docs/terminal/shell-integration')
            });
            return actions;
        }
        _showToggleVisibilityQuickPick() {
            const quickPick = this._quickInputService.createQuickPick();
            quickPick.hideInput = true;
            quickPick.hideCheckAll = true;
            quickPick.canSelectMany = true;
            quickPick.title = (0, nls_1.localize)('toggleVisibility', 'Toggle visibility');
            const configValue = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
            const gutterIcon = {
                label: (0, nls_1.localize)('gutter', 'Gutter command decorations'),
                picked: configValue !== 'never' && configValue !== 'overviewRuler'
            };
            const overviewRulerIcon = {
                label: (0, nls_1.localize)('overviewRuler', 'Overview ruler command decorations'),
                picked: configValue !== 'never' && configValue !== 'gutter'
            };
            quickPick.items = [gutterIcon, overviewRulerIcon];
            const selectedItems = [];
            if (configValue !== 'never') {
                if (configValue !== 'gutter') {
                    selectedItems.push(gutterIcon);
                }
                if (configValue !== 'overviewRuler') {
                    selectedItems.push(overviewRulerIcon);
                }
            }
            quickPick.selectedItems = selectedItems;
            quickPick.onDidChangeSelection(async (e) => {
                let newValue = 'never';
                if (e.includes(gutterIcon)) {
                    if (e.includes(overviewRulerIcon)) {
                        newValue = 'both';
                    }
                    else {
                        newValue = 'gutter';
                    }
                }
                else if (e.includes(overviewRulerIcon)) {
                    newValue = 'overviewRuler';
                }
                await this._configurationService.updateValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */, newValue);
            });
            quickPick.ok = false;
            quickPick.show();
        }
        _getDecorationCssColor(decorationOrCommand) {
            let colorId;
            if (decorationOrCommand?.exitCode === undefined) {
                colorId = terminalColorRegistry_1.TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR;
            }
            else {
                colorId = decorationOrCommand.exitCode ? terminalColorRegistry_1.TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR : terminalColorRegistry_1.TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR;
            }
            return this._themeService.getColorTheme().getColor(colorId)?.toString();
        }
    };
    exports.DecorationAddon = DecorationAddon;
    exports.DecorationAddon = DecorationAddon = __decorate([
        __param(1, clipboardService_1.IClipboardService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, themeService_1.IThemeService),
        __param(5, opener_1.IOpenerService),
        __param(6, quickInput_1.IQuickInputService),
        __param(7, lifecycle_2.ILifecycleService),
        __param(8, commands_1.ICommandService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, audioCueService_1.IAudioCueService),
        __param(11, notification_1.INotificationService)
    ], DecorationAddon);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvbkFkZG9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3h0ZXJtL2RlY29yYXRpb25BZGRvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE0QnpGLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsc0JBQVU7UUFZOUMsWUFDa0IsYUFBdUMsRUFDckMsaUJBQXFELEVBQ25ELG1CQUF5RCxFQUN2RCxxQkFBNkQsRUFDckUsYUFBNkMsRUFDNUMsY0FBK0MsRUFDM0Msa0JBQXVELEVBQ3hELGdCQUFtQyxFQUNyQyxlQUFpRCxFQUMzQyxvQkFBMkMsRUFDaEQsZ0JBQW1ELEVBQy9DLG9CQUEyRDtZQUVqRixLQUFLLEVBQUUsQ0FBQztZQWJTLGtCQUFhLEdBQWIsYUFBYSxDQUEwQjtZQUNwQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ2xDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDdEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNwRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUMzQixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDMUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUV6QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFFL0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUM5Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBdEIxRSwyQkFBc0IsR0FBMkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMzRSxpQkFBWSxHQUF1QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBTXBELDRCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXVELENBQUMsQ0FBQztZQUNySCwy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