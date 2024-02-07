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
define(["require", "exports", "vs/base/common/async", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesDataSource", "vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesTree", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/services/editor/common/editorService"], function (require, exports, async_1, nls, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, opener_1, quickInput_1, telemetry_1, themeService_1, viewPane_1, views_1, notebookVariablesDataSource_1, notebookVariablesTree_1, notebookBrowser_1, notebookExecutionStateService_1, notebookKernelService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookVariablesView = void 0;
    let NotebookVariablesView = class NotebookVariablesView extends viewPane_1.ViewPane {
        static { this.ID = 'notebookVariablesView'; }
        static { this.TITLE = nls.localize2('notebook.notebookVariables', "Notebook Variables"); }
        constructor(options, editorService, notebookKernelService, notebookExecutionStateService, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.editorService = editorService;
            this.notebookKernelService = notebookKernelService;
            this.notebookExecutionStateService = notebookExecutionStateService;
            this.quickInputService = quickInputService;
            this.commandService = commandService;
            this._register(this.editorService.onDidActiveEditorChange(this.handleActiveEditorChange.bind(this)));
            this._register(this.notebookKernelService.onDidNotebookVariablesUpdate(this.handleVariablesChanged.bind(this)));
            this._register(this.notebookExecutionStateService.onDidChangeExecution(this.handleExecutionStateChange.bind(this)));
            this.setActiveNotebook();
            this.dataSource = new notebookVariablesDataSource_1.NotebookVariableDataSource(this.notebookKernelService);
            this.updateScheduler = new async_1.RunOnceScheduler(() => this.tree?.updateChildren(), 100);
        }
        renderBody(container) {
            super.renderBody(container);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'notebookVariablesTree', container, new notebookVariablesTree_1.NotebookVariablesDelegate(), [new notebookVariablesTree_1.NotebookVariableRenderer()], this.dataSource, {
                accessibilityProvider: new notebookVariablesTree_1.NotebookVariableAccessibilityProvider(),
                identityProvider: { getId: (e) => e.id },
            });
            this.tree.layout();
            if (this.activeNotebook) {
                this.tree.setInput({ kind: 'root', notebook: this.activeNotebook });
            }
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.tree?.layout(height, width);
        }
        setActiveNotebook() {
            const current = this.activeNotebook;
            const activeEditorPane = this.editorService.activeEditorPane;
            if (activeEditorPane && activeEditorPane.getId() === 'workbench.editor.notebook') {
                const notebookDocument = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(activeEditorPane)?.getViewModel()?.notebookDocument;
                this.activeNotebook = notebookDocument;
            }
            return current !== this.activeNotebook;
        }
        handleActiveEditorChange() {
            if (this.setActiveNotebook() && this.activeNotebook) {
                this.tree?.setInput({ kind: 'root', notebook: this.activeNotebook });
                this.updateScheduler.schedule();
            }
        }
        handleExecutionStateChange(event) {
            if (this.activeNotebook) {
                if (event.affectsNotebook(this.activeNotebook.uri)) {
                    // new execution state means either new variables or the kernel is busy so we shouldn't ask
                    this.dataSource.cancel();
                    // changed === undefined -> excecution ended
                    if (event.changed === undefined) {
                        this.updateScheduler.schedule();
                    }
                    else {
                        this.updateScheduler.cancel();
                    }
                }
            }
        }
        handleVariablesChanged(notebookUri) {
            if (this.activeNotebook && notebookUri.toString() === this.activeNotebook.uri.toString()) {
                this.tree?.setInput({ kind: 'root', notebook: this.activeNotebook });
                this.updateScheduler.schedule();
            }
        }
    };
    exports.NotebookVariablesView = NotebookVariablesView;
    exports.NotebookVariablesView = NotebookVariablesView = __decorate([
        __param(1, editorService_1.IEditorService),
        __param(2, notebookKernelService_1.INotebookKernelService),
        __param(3, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, views_1.IViewDescriptorService),
        __param(10, opener_1.IOpenerService),
        __param(11, quickInput_1.IQuickInputService),
        __param(12, commands_1.ICommandService),
        __param(13, themeService_1.IThemeService),
        __param(14, telemetry_1.ITelemetryService)
    ], NotebookVariablesView);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tWYXJpYWJsZXNWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyaWIvbm90ZWJvb2tWYXJpYWJsZXMvbm90ZWJvb2tWYXJpYWJsZXNWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTJCekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxtQkFBUTtpQkFFbEMsT0FBRSxHQUFHLHVCQUF1QixBQUExQixDQUEyQjtpQkFDN0IsVUFBSyxHQUFxQixHQUFHLENBQUMsU0FBUyxDQUFDLDRCQUE0QixFQUFFLG9CQUFvQixDQUFDLEFBQXRGLENBQXVGO1FBUTVHLFlBQ0MsT0FBeUIsRUFDUSxhQUE2QixFQUNyQixxQkFBNkMsRUFDckMsNkJBQTZELEVBQzFGLGlCQUFxQyxFQUNwQyxrQkFBdUMsRUFDeEMsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUMzQyxvQkFBMkMsRUFDMUMscUJBQTZDLEVBQ3JELGFBQTZCLEVBQ2YsaUJBQXFDLEVBQ3hDLGNBQStCLEVBQzNDLFlBQTJCLEVBQ3ZCLGdCQUFtQztZQUV0RCxLQUFLLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQWYxSixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDckIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUNyQyxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBUWhGLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDeEMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBTTFE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