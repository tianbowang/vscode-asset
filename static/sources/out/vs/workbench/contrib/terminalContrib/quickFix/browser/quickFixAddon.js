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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/common/arrays", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/workbench/contrib/terminal/browser/xterm/decorationStyles", "vs/platform/telemetry/common/telemetry", "vs/base/common/cancellation", "vs/workbench/services/extensions/common/extensions", "vs/platform/audioCues/browser/audioCueService", "vs/platform/actionWidget/browser/actionWidget", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/platform/label/common/label", "vs/base/common/network", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix", "vs/editor/contrib/codeAction/common/types", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/commands/common/commands"], function (require, exports, event_1, lifecycle_1, dom, arrays_1, nls_1, configuration_1, opener_1, decorationStyles_1, telemetry_1, cancellation_1, extensions_1, audioCueService_1, actionWidget_1, commandDetectionCapability_1, label_1, network_1, quickFix_1, types_1, codicons_1, themables_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getQuickFixesForCommand = exports.TerminalQuickFixAddon = void 0;
    const quickFixClasses = [
        "quick-fix" /* DecorationSelector.QuickFix */,
        "codicon" /* DecorationSelector.Codicon */,
        "terminal-command-decoration" /* DecorationSelector.CommandDecoration */,
        "xterm-decoration" /* DecorationSelector.XtermDecoration */
    ];
    let TerminalQuickFixAddon = class TerminalQuickFixAddon extends lifecycle_1.Disposable {
        constructor(_aliases, _capabilities, _quickFixService, _commandService, _configurationService, _audioCueService, _openerService, _telemetryService, _extensionService, _actionWidgetService, _labelService) {
            super();
            this._aliases = _aliases;
            this._capabilities = _capabilities;
            this._quickFixService = _quickFixService;
            this._commandService = _commandService;
            this._configurationService = _configurationService;
            this._audioCueService = _audioCueService;
            this._openerService = _openerService;
            this._telemetryService = _telemetryService;
            this._extensionService = _extensionService;
            this._actionWidgetService = _actionWidgetService;
            this._labelService = _labelService;
            this._onDidRequestRerunCommand = new event_1.Emitter();
            this.onDidRequestRerunCommand = this._onDidRequestRerunCommand.event;
            this._commandListeners = new Map();
            this._registeredSelectors = new Set();
            const commandDetectionCapability = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
            if (commandDetectionCapability) {
                this._registerCommandHandlers();
            }
            else {
                this._register(this._capabilities.onDidAddCapabilityType(c => {
                    if (c === 2 /* TerminalCapability.CommandDetection */) {
                        this._registerCommandHandlers();
                    }
                }));
            }
            this._register(this._quickFixService.onDidRegisterProvider(result => this.registerCommandFinishedListener(convertToQuickFixOptions(result))));
            this._quickFixService.extensionQuickFixes.then(quickFixSelectors => {
                for (const selector of quickFixSelectors) {
                    this.registerCommandSelector(selector);
                }
            });
            this._register(this._quickFixService.onDidRegisterCommandSelector(selector => this.registerCommandSelector(selector)));
            this._register(this._quickFixService.onDidUnregisterProvider(id => this._commandListeners.delete(id)));
        }
        activate(terminal) {
            this._terminal = terminal;
        }
        showMenu() {
            if (!this._currentRenderContext) {
                return;
            }
            // TODO: What's documentation do? Need a vscode command?
            const actions = this._currentRenderContext.quickFixes.map(f => new TerminalQuickFixItem(f, f.type, f.source, f.label, f.kind));
            const documentation = this._currentRenderContext.quickFixes.map(f => { return { id: f.source, title: f.label, tooltip: f.source }; });
            const actionSet = {
                // TODO: Documentation and actions are separate?
                documentation,
                allActions: actions,
                hasAutoFix: false,
                hasAIFix: false,
                allAIFixes: false,
                validActions: actions,
                dispose: () => { }
            };
            const delegate = {
                onSelect: async (fix) => {
                    fix.action?.run();
                    this._actionWidgetService.hide();
                    this._disposeQuickFix(fix.action.id, true);
                },
                onHide: () => {
                    this._terminal?.focus();
                },
            };
            this._actionWidgetService.show('quickFixWidget', false, toActionWidgetItems(actionSet.validActions, true), delegate, this._currentRenderContext.anchor, this._currentRenderContext.parentElement);
        }
        registerCommandSelector(selector) {
            if (this._registeredSelectors.has(selector.id)) {
                return;
            }
            const matcherKey = selector.commandLineMatcher.toString();
            const currentOptions = this._commandListeners.get(matcherKey) || [];
            currentOptions.push({
                id: selector.id,
                type: 'unresolved',
                commandLineMatcher: selector.commandLineMatcher,
                outputMatcher: selector.outputMatcher,
                commandExitResult: selector.commandExitResult,
                kind: selector.kind
            });
            this._registeredSelectors.add(selector.id);
            this._commandListeners.set(matcherKey, currentOptions);
        }
        registerCommandFinishedListener(options) {
            const matcherKey = options.commandLineMatcher.toString();
            let currentOptions = this._commandListeners.get(matcherKey) || [];
            // removes the unresolved options
            currentOptions = currentOptions.filter(o => o.id !== options.id);
            currentOptions.push(options);
            this._commandListeners.set(matcherKey, currentOptions);
        }
        _registerCommandHandlers() {
            const terminal = this._terminal;
            const commandDetection = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
            if (!terminal || !commandDetection) {
                return;
            }
            this._register(commandDetection.onCommandFinished(async (command) => await this._resolveQuickFixes(command, this._aliases)));
        }
        /**
         * Resolves quick fixes, if any, based on the
         * @param command & its output
         */
        async _resolveQuickFixes(command, aliases) {
            const terminal = this._terminal;
            if (!terminal || command.wasReplayed) {
                return;
            }
            if (command.command !== '' && this._lastQuickFixId) {
                this._disposeQuickFix(this._lastQuickFixId, false);
            }
            const resolver = async (selector, lines) => {
                if (lines === undefined) {
                    return undefined;
                }
                const id = selector.id;
                await this._extensionService.activateByEvent(`onTerminalQuickFixRequest:${id}`);
                return this._quickFixService.providers.get(id)?.provideTerminalQuickFixes(command, lines, {
                    type: 'resolved',
                    commandLineMatcher: selector.commandLineMatcher,
                    outputMatcher: selector.outputMatcher,
                    commandExitResult: selector.commandExitResult,
                    kind: selector.kind,
                    id: selector.id
                }, new cancellation_1.CancellationTokenSource().token);
            };
            const result = await getQuickFixesForCommand(aliases, terminal, command, this._commandListeners, this._commandService, this._openerService, this._labelService, this._onDidRequestRerunCommand, resolver);
            if (!result) {
                return;
            }
            this._quickFixes = result;
            this._lastQuickFixId = this._quickFixes[0].id;
            this._registerQuickFixDecoration();
        }
        _disposeQuickFix(id, ranQuickFix) {
            this._telemetryService?.publicLog2('terminal/quick-fix', {
                quickFixId: id,
                ranQuickFix
            });
            this._decoration?.dispose();
            this._decoration = undefined;
            this._quickFixes = undefined;
            this._lastQuickFixId = undefined;
        }
        /**
         * Registers a decoration with the quick fixes
         */
        _registerQuickFixDecoration() {
            if (!this._terminal) {
                return;
            }
            if (!this._quickFixes) {
                return;
            }
            const marker = this._terminal.registerMarker();
            if (!marker) {
                return;
            }
            const decoration = this._terminal.registerDecoration({ marker, layer: 'top' });
            if (!decoration) {
                return;
            }
            this._decoration = decoration;
            const fixes = this._quickFixes;
            if (!fixes) {
                decoration.dispose();
                return;
            }
            decoration?.onRender((e) => {
                const rect = e.getBoundingClientRect();
                const anchor = {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                };
                if (e.classList.contains("quick-fix" /* DecorationSelector.QuickFix */)) {
                    if (this._currentRenderContext) {
                        this._currentRenderContext.anchor = anchor;
                    }
                    return;
                }
                e.classList.add(...quickFixClasses);
                const isExplainOnly = fixes.every(e => e.kind === 'explain');
                if (isExplainOnly) {
                    e.classList.add('explainOnly');
                }
                e.classList.add(...themables_1.ThemeIcon.asClassNameArray(isExplainOnly ? codicons_1.Codicon.sparkle : codicons_1.Codicon.lightBulb));
                (0, decorationStyles_1.updateLayout)(this._configurationService, e);
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.terminalQuickFix);
                const parentElement = e.closest('.xterm').parentElement;
                if (!parentElement) {
                    return;
                }
                this._currentRenderContext = { quickFixes: fixes, anchor, parentElement };
                this._register(dom.addDisposableListener(e, dom.EventType.CLICK, () => this.showMenu()));
            });
            decoration.onDispose(() => this._currentRenderContext = undefined);
            this._quickFixes = undefined;
        }
    };
    exports.TerminalQuickFixAddon = TerminalQuickFixAddon;
    exports.TerminalQuickFixAddon = TerminalQuickFixAddon = __decorate([
        __param(2, quickFix_1.ITerminalQuickFixService),
        __param(3, commands_1.ICommandService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, audioCueService_1.IAudioCueService),
        __param(6, opener_1.IOpenerService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, extensions_1.IExtensionService),
        __param(9, actionWidget_1.IActionWidgetService),
        __param(10, label_1.ILabelService)
    ], TerminalQuickFixAddon);
    async function getQuickFixesForCommand(aliases, terminal, terminalCommand, quickFixOptions, commandService, openerService, labelService, onDidRequestRerunCommand, getResolvedFixes) {
        // Prevent duplicates by tracking added entries
        const commandQuickFixSet = new Set();
        const openQuickFixSet = new Set();
        const fixes = [];
        const newCommand = terminalCommand.command;
        for (const options of quickFixOptions.values()) {
            for (const option of options) {
                if ((option.commandExitResult === 'success' && terminalCommand.exitCode !== 0) || (option.commandExitResult === 'error' && terminalCommand.exitCode === 0)) {
                    continue;
                }
                let quickFixes;
                if (option.type === 'resolved') {
                    quickFixes = await option.getQuickFixes(terminalCommand, (0, commandDetectionCapability_1.getLinesForCommand)(terminal.buffer.active, terminalCommand, terminal.cols, option.outputMatcher), option, new cancellation_1.CancellationTokenSource().token);
                }
                else if (option.type === 'unresolved') {
                    if (!getResolvedFixes) {
                        throw new Error('No resolved fix provider');
                    }
                    quickFixes = await getResolvedFixes(option, option.outputMatcher ? (0, commandDetectionCapability_1.getLinesForCommand)(terminal.buffer.active, terminalCommand, terminal.cols, option.outputMatcher) : undefined);
                }
                else if (option.type === 'internal') {
                    const commandLineMatch = newCommand.match(option.commandLineMatcher);
                    if (!commandLineMatch) {
                        continue;
                    }
                    const outputMatcher = option.outputMatcher;
                    let outputMatch;
                    if (outputMatcher) {
                        outputMatch = terminalCommand.getOutputMatch(outputMatcher);
                    }
                    if (!outputMatch) {
                        continue;
                    }
                    const matchResult = { commandLineMatch, outputMatch, commandLine: terminalCommand.command };
                    quickFixes = option.getQuickFixes(matchResult);
                }
                if (quickFixes) {
                    for (const quickFix of (0, arrays_1.asArray)(quickFixes)) {
                        let action;
                        if ('type' in quickFix) {
                            switch (quickFix.type) {
                                case quickFix_1.TerminalQuickFixType.TerminalCommand: {
                                    const fix = quickFix;
                                    if (commandQuickFixSet.has(fix.terminalCommand)) {
                                        continue;
                                    }
                                    commandQuickFixSet.add(fix.terminalCommand);
                                    const label = (0, nls_1.localize)('quickFix.command', 'Run: {0}', fix.terminalCommand);
                                    action = {
                                        type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                                        kind: option.kind,
                                        class: undefined,
                                        source: quickFix.source,
                                        id: quickFix.id,
                                        label,
                                        enabled: true,
                                        run: () => {
                                            onDidRequestRerunCommand?.fire({
                                                command: fix.terminalCommand,
                                                shouldExecute: fix.shouldExecute ?? true
                                            });
                                        },
                                        tooltip: label,
                                        command: fix.terminalCommand,
                                        shouldExecute: fix.shouldExecute
                                    };
                                    break;
                                }
                                case quickFix_1.TerminalQuickFixType.Opener: {
                                    const fix = quickFix;
                                    if (!fix.uri) {
                                        return;
                                    }
                                    if (openQuickFixSet.has(fix.uri.toString())) {
                                        continue;
                                    }
                                    openQuickFixSet.add(fix.uri.toString());
                                    const isUrl = (fix.uri.scheme === network_1.Schemas.http || fix.uri.scheme === network_1.Schemas.https);
                                    const uriLabel = isUrl ? encodeURI(fix.uri.toString(true)) : labelService.getUriLabel(fix.uri);
                                    const label = (0, nls_1.localize)('quickFix.opener', 'Open: {0}', uriLabel);
                                    action = {
                                        source: quickFix.source,
                                        id: quickFix.id,
                                        label,
                                        type: quickFix_1.TerminalQuickFixType.Opener,
                                        kind: option.kind,
                                        class: undefined,
                                        enabled: true,
                                        run: () => openerService.open(fix.uri),
                                        tooltip: label,
                                        uri: fix.uri
                                    };
                                    break;
                                }
                                case quickFix_1.TerminalQuickFixType.Port: {
                                    const fix = quickFix;
                                    action = {
                                        source: 'builtin',
                                        type: fix.type,
                                        kind: option.kind,
                                        id: fix.id,
                                        label: fix.label,
                                        class: fix.class,
                                        enabled: fix.enabled,
                                        run: () => {
                                            fix.run();
                                        },
                                        tooltip: fix.tooltip
                                    };
                                    break;
                                }
                                case quickFix_1.TerminalQuickFixType.VscodeCommand: {
                                    const fix = quickFix;
                                    action = {
                                        source: quickFix.source,
                                        type: fix.type,
                                        kind: option.kind,
                                        id: fix.id,
                                        label: fix.title,
                                        class: undefined,
                                        enabled: true,
                                        run: () => commandService.executeCommand(fix.id),
                                        tooltip: fix.title
                                    };
                                    break;
                                }
                            }
                            if (action) {
                                fixes.push(action);
                            }
                        }
                    }
                }
            }
        }
        return fixes.length > 0 ? fixes : undefined;
    }
    exports.getQuickFixesForCommand = getQuickFixesForCommand;
    function convertToQuickFixOptions(selectorProvider) {
        return {
            id: selectorProvider.selector.id,
            type: 'resolved',
            commandLineMatcher: selectorProvider.selector.commandLineMatcher,
            outputMatcher: selectorProvider.selector.outputMatcher,
            commandExitResult: selectorProvider.selector.commandExitResult,
            kind: selectorProvider.selector.kind,
            getQuickFixes: selectorProvider.provider.provideTerminalQuickFixes
        };
    }
    class TerminalQuickFixItem {
        constructor(action, type, source, title, kind = 'fix') {
            this.action = action;
            this.type = type;
            this.source = source;
            this.title = title;
            this.kind = kind;
            this.disabled = false;
        }
    }
    function toActionWidgetItems(inputQuickFixes, showHeaders) {
        const menuItems = [];
        menuItems.push({
            kind: "header" /* ActionListItemKind.Header */,
            group: {
                kind: types_1.CodeActionKind.QuickFix,
                title: (0, nls_1.localize)('codeAction.widget.id.quickfix', 'Quick Fix')
            }
        });
        for (const quickFix of showHeaders ? inputQuickFixes : inputQuickFixes.filter(i => !!i.action)) {
            if (!quickFix.disabled && quickFix.action) {
                menuItems.push({
                    kind: "action" /* ActionListItemKind.Action */,
                    item: quickFix,
                    group: {
                        kind: types_1.CodeActionKind.QuickFix,
                        icon: getQuickFixIcon(quickFix),
                        title: quickFix.action.label
                    },
                    disabled: false,
                    label: quickFix.title
                });
            }
        }
        return menuItems;
    }
    function getQuickFixIcon(quickFix) {
        if (quickFix.kind === 'explain') {
            return codicons_1.Codicon.sparkle;
        }
        switch (quickFix.type) {
            case quickFix_1.TerminalQuickFixType.Opener:
                if ('uri' in quickFix.action && quickFix.action.uri) {
                    const isUrl = (quickFix.action.uri.scheme === network_1.Schemas.http || quickFix.action.uri.scheme === network_1.Schemas.https);
                    return isUrl ? codicons_1.Codicon.linkExternal : codicons_1.Codicon.goToFile;
                }
            case quickFix_1.TerminalQuickFixType.TerminalCommand:
                return codicons_1.Codicon.run;
            case quickFix_1.TerminalQuickFixType.Port:
                return codicons_1.Codicon.debugDisconnect;
            case quickFix_1.TerminalQuickFixType.VscodeCommand:
                return codicons_1.Codicon.lightbulb;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tGaXhBZGRvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL3F1aWNrRml4L2Jyb3dzZXIvcXVpY2tGaXhBZGRvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQ2hHLE1BQU0sZUFBZSxHQUFHOzs7OztLQUt2QixDQUFDO0lBWUssSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxzQkFBVTtRQWtCcEQsWUFDa0IsUUFBZ0MsRUFDaEMsYUFBdUMsRUFDOUIsZ0JBQTJELEVBQ3BFLGVBQWlELEVBQzNDLHFCQUE2RCxFQUNsRSxnQkFBbUQsRUFDckQsY0FBK0MsRUFDNUMsaUJBQXFELEVBQ3JELGlCQUFxRCxFQUNsRCxvQkFBMkQsRUFDbEUsYUFBNkM7WUFFNUQsS0FBSyxFQUFFLENBQUM7WUFaUyxhQUFRLEdBQVIsUUFBUSxDQUF3QjtZQUNoQyxrQkFBYSxHQUFiLGFBQWEsQ0FBMEI7WUFDYixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTBCO1lBQ25ELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUMxQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ2pELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDcEMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzNCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDcEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNqQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ2pELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBNUI1Qyw4QkFBeUIsR0FBRyxJQUFJLGVBQU8sRUFBZ0QsQ0FBQztZQUNoRyw2QkFBd0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDO1lB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