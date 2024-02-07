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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/contrib/terminalContrib/links/browser/links", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkManager", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkProviderService", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkQuickpick", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver"], function (require, exports, lifecycle_1, nls_1, contextkey_1, extensions_1, instantiation_1, accessibilityConfiguration_1, terminal_1, terminalActions_1, terminalExtensions_1, terminal_2, terminalContextKey_1, terminalStrings_1, links_1, terminalLinkManager_1, terminalLinkProviderService_1, terminalLinkQuickpick_1, terminalLinkResolver_1) {
    "use strict";
    var TerminalLinkContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(links_1.ITerminalLinkProviderService, terminalLinkProviderService_1.TerminalLinkProviderService, 1 /* InstantiationType.Delayed */);
    let TerminalLinkContribution = class TerminalLinkContribution extends lifecycle_1.DisposableStore {
        static { TerminalLinkContribution_1 = this; }
        static { this.ID = 'terminal.link'; }
        static get(instance) {
            return instance.getContribution(TerminalLinkContribution_1.ID);
        }
        constructor(_instance, _processManager, _widgetManager, _instantiationService, _terminalLinkProviderService) {
            super();
            this._instance = _instance;
            this._processManager = _processManager;
            this._widgetManager = _widgetManager;
            this._instantiationService = _instantiationService;
            this._terminalLinkProviderService = _terminalLinkProviderService;
            this._linkResolver = this._instantiationService.createInstance(terminalLinkResolver_1.TerminalLinkResolver);
        }
        xtermReady(xterm) {
            const linkManager = this._instantiationService.createInstance(terminalLinkManager_1.TerminalLinkManager, xterm.raw, this._processManager, this._instance.capabilities, this._linkResolver);
            if ((0, terminal_2.isTerminalProcessManager)(this._processManager)) {
                this._processManager.onProcessReady(() => {
                    linkManager.setWidgetManager(this._widgetManager);
                });
            }
            else {
                linkManager.setWidgetManager(this._widgetManager);
            }
            this._linkManager = this.add(linkManager);
            // Attach the link provider(s) to the instance and listen for changes
            if (!(0, terminal_1.isDetachedTerminalInstance)(this._instance)) {
                for (const linkProvider of this._terminalLinkProviderService.linkProviders) {
                    this._linkManager.registerExternalLinkProvider(linkProvider.provideLinks.bind(linkProvider, this._instance));
                }
                this.add(this._terminalLinkProviderService.onDidAddLinkProvider(e => {
                    linkManager.registerExternalLinkProvider(e.provideLinks.bind(e, this._instance));
                }));
            }
            // TODO: Currently only a single link provider is supported; the one registered by the ext host
            this.add(this._terminalLinkProviderService.onDidRemoveLinkProvider(e => {
                linkManager.dispose();
                this.xtermReady(xterm);
            }));
        }
        async showLinkQuickpick(extended) {
            if (!this._terminalLinkQuickpick) {
                this._terminalLinkQuickpick = this.add(this._instantiationService.createInstance(terminalLinkQuickpick_1.TerminalLinkQuickpick));
                this._terminalLinkQuickpick.onDidRequestMoreLinks(() => {
                    this.showLinkQuickpick(true);
                });
            }
            const links = await this._getLinks();
            return await this._terminalLinkQuickpick.show(links);
        }
        async _getLinks() {
            if (!this._linkManager) {
                throw new Error('terminal links are not ready, cannot generate link quick pick');
            }
            return this._linkManager.getLinks();
        }
        async openRecentLink(type) {
            if (!this._linkManager) {
                throw new Error('terminal links are not ready, cannot open a link');
            }
            this._linkManager.openRecentLink(type);
        }
    };
    TerminalLinkContribution = TerminalLinkContribution_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, links_1.ITerminalLinkProviderService)
    ], TerminalLinkContribution);
    (0, terminalExtensions_1.registerTerminalContribution)(TerminalLinkContribution.ID, TerminalLinkContribution, true);
    const category = terminalStrings_1.terminalStrings.actionCategory;
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.openDetectedLink" /* TerminalCommandId.OpenDetectedLink */,
        title: (0, nls_1.localize2)('workbench.action.terminal.openDetectedLink', 'Open Detected Link...'),
        f1: true,
        category,
        precondition: terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated,
        keybinding: [{
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                when: terminalContextKey_1.TerminalContextKeys.focus
            }, {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                when: contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, contextkey_1.ContextKeyExpr.equals(accessibilityConfiguration_1.accessibleViewCurrentProviderId.key, "terminal" /* AccessibleViewProviderId.Terminal */))
            },
        ],
        run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.showLinkQuickpick()
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.openUrlLink" /* TerminalCommandId.OpenWebLink */,
        title: (0, nls_1.localize2)('workbench.action.terminal.openLastUrlLink', 'Open Last URL Link'),
        f1: true,
        category,
        precondition: terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated,
        run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.openRecentLink('url')
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.openFileLink" /* TerminalCommandId.OpenFileLink */,
        title: (0, nls_1.localize2)('workbench.action.terminal.openLastLocalFileLink', 'Open Last Local File Link'),
        f1: true,
        category,
        precondition: terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated,
        run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.openRecentLink('localFile')
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwubGlua3MuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvbGlua3MvYnJvd3Nlci90ZXJtaW5hbC5saW5rcy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0JoRyxJQUFBLDhCQUFpQixFQUFDLG9DQUE0QixFQUFFLHlEQUEyQixvQ0FBNEIsQ0FBQztJQUV4RyxJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLDJCQUFlOztpQkFDckMsT0FBRSxHQUFHLGVBQWUsQUFBbEIsQ0FBbUI7UUFFckMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUEyQjtZQUNyQyxPQUFPLFFBQVEsQ0FBQyxlQUFlLENBQTJCLDBCQUF3QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFNRCxZQUNrQixTQUF3RCxFQUN4RCxlQUErRCxFQUMvRCxjQUFxQyxFQUNkLHFCQUE0QyxFQUNyQyw0QkFBMEQ7WUFFekcsS0FBSyxFQUFFLENBQUM7WUFOUyxjQUFTLEdBQVQsU0FBUyxDQUErQztZQUN4RCxvQkFBZSxHQUFmLGVBQWUsQ0FBZ0Q7WUFDL0QsbUJBQWMsR0FBZCxjQUFjLENBQXVCO1lBQ2QsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNyQyxpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQThCO1lBR3pHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQywyQ0FBb0IsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFRCxVQUFVLENBQUMsS0FBaUQ7WUFDM0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyx5Q0FBbUIsRUFBRSxL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