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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminalContrib/suggest/browser/terminalSuggestAddon", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/nls"], function (require, exports, dom, lifecycle_1, instantiation_1, terminalExtensions_1, terminalSuggestAddon_1, contextkey_1, terminalContextKey_1, terminalActions_1, nls_1) {
    "use strict";
    var TerminalSuggestContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let TerminalSuggestContribution = class TerminalSuggestContribution extends lifecycle_1.DisposableStore {
        static { TerminalSuggestContribution_1 = this; }
        static { this.ID = 'terminal.suggest'; }
        static get(instance) {
            return instance.getContribution(TerminalSuggestContribution_1.ID);
        }
        get addon() { return this._addon; }
        constructor(_instance, _processManager, widgetManager, _contextKeyService, _instantiationService) {
            super();
            this._instance = _instance;
            this._contextKeyService = _contextKeyService;
            this._instantiationService = _instantiationService;
            this._terminalSuggestWidgetContextKeys = new Set(terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible.key);
            this.add((0, lifecycle_1.toDisposable)(() => this._addon?.dispose()));
            this._terminalSuggestWidgetVisibleContextKey = terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible.bindTo(this._contextKeyService);
        }
        xtermOpen(xterm) {
            this._loadSuggestAddon(xterm.raw);
            this.add(this._contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(this._terminalSuggestWidgetContextKeys)) {
                    this._loadSuggestAddon(xterm.raw);
                }
            }));
        }
        _loadSuggestAddon(xterm) {
            if (this._terminalSuggestWidgetVisibleContextKey) {
                this._addon = this._instantiationService.createInstance(terminalSuggestAddon_1.SuggestAddon, this._terminalSuggestWidgetVisibleContextKey);
                xterm.loadAddon(this._addon);
                this._addon?.setPanel(dom.findParentWithClass(xterm.element, 'panel'));
                this._addon?.setScreen(xterm.element.querySelector('.xterm-screen'));
                this.add(this._instance.onDidBlur(() => this._addon?.hideSuggestWidget()));
                this.add(this._addon.onAcceptedCompletion(async (text) => {
                    this._instance.focus();
                    this._instance.sendText(text, false);
                }));
                this.add(this._instance.onDidSendText((text) => {
                    this._addon?.handleNonXtermData(text);
                }));
            }
        }
    };
    TerminalSuggestContribution = TerminalSuggestContribution_1 = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, instantiation_1.IInstantiationService)
    ], TerminalSuggestContribution);
    (0, terminalExtensions_1.registerTerminalContribution)(TerminalSuggestContribution.ID, TerminalSuggestContribution);
    // Actions
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.selectPrevSuggestion" /* TerminalCommandId.SelectPrevSuggestion */,
        title: (0, nls_1.localize2)('workbench.action.terminal.selectPrevSuggestion', 'Select the Previous Suggestion'),
        f1: false,
        precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
        keybinding: {
            // Up is bound to other workbench keybindings that this needs to beat
            primary: 16 /* KeyCode.UpArrow */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
        },
        run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousSuggestion()
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.selectPrevPageSuggestion" /* TerminalCommandId.SelectPrevPageSuggestion */,
        title: (0, nls_1.localize2)('workbench.action.terminal.selectPrevPageSuggestion', 'Select the Previous Page Suggestion'),
        f1: false,
        precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
        keybinding: {
            // Up is bound to other workbench keybindings that this needs to beat
            primary: 11 /* KeyCode.PageUp */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
        },
        run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousPageSuggestion()
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.selectNextSuggestion" /* TerminalCommandId.SelectNextSuggestion */,
        title: (0, nls_1.localize2)('workbench.action.terminal.selectNextSuggestion', 'Select the Next Suggestion'),
        f1: false,
        precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
        keybinding: {
            // Down is bound to other workbench keybindings that this needs to beat
            primary: 18 /* KeyCode.DownArrow */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
        },
        run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextSuggestion()
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.selectNextPageSuggestion" /* TerminalCommandId.SelectNextPageSuggestion */,
        title: (0, nls_1.localize2)('workbench.action.terminal.selectNextPageSuggestion', 'Select the Next Page Suggestion'),
        f1: false,
        precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
        keybinding: {
            // Down is bound to other workbench keybindings that this needs to beat
            primary: 12 /* KeyCode.PageDown */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
        },
        run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextPageSuggestion()
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.acceptSelectedSuggestion" /* TerminalCommandId.AcceptSelectedSuggestion */,
        title: (0, nls_1.localize2)('workbench.action.terminal.acceptSelectedSuggestion', 'Accept Selected Suggestion'),
        f1: false,
        precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
        keybinding: {
            primary: 3 /* KeyCode.Enter */,
            secondary: [2 /* KeyCode.Tab */],
            // Enter is bound to other workbench keybindings that this needs to beat
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
        },
        run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion()
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.hideSuggestWidget" /* TerminalCommandId.HideSuggestWidget */,
        title: (0, nls_1.localize2)('workbench.action.terminal.hideSuggestWidget', 'Hide Suggest Widget'),
        f1: false,
        precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated), terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.isOpen, terminalContextKey_1.TerminalContextKeys.suggestWidgetVisible),
        keybinding: {
            primary: 9 /* KeyCode.Escape */,
            // Escape is bound to other workbench keybindings that this needs to beat
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
        },
        run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.hideSuggestWidget()
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuc3VnZ2VzdC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9zdWdnZXN0L2Jyb3dzZXIvdGVybWluYWwuc3VnZ2VzdC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0JoRyxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLDJCQUFlOztpQkFDeEMsT0FBRSxHQUFHLGtCQUFrQixBQUFyQixDQUFzQjtRQUV4QyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQTJCO1lBQ3JDLE9BQU8sUUFBUSxDQUFDLGVBQWUsQ0FBOEIsNkJBQTJCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUYsQ0FBQztRQU1ELElBQUksS0FBSyxLQUErQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRTdELFlBQ2tCLFNBQTRCLEVBQzdDLGVBQXdDLEVBQ3hDLGFBQW9DLEVBQ2hCLGtCQUF1RCxFQUNwRCxxQkFBNkQ7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFOUyxjQUFTLEdBQVQsU0FBUyxDQUFtQjtZQUdSLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDbkMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQVY3RSxzQ0FBaUMsR0FBeUIsSUFBSSxHQUFHLENBQUMsd0NBQW1CLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7WUFhdkgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLHVDQUF1QyxHQUFHLHdDQUFtQixDQUFDLG9C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