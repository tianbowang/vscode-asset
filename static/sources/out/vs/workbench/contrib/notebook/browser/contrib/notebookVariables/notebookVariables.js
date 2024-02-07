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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/workbench/common/views", "vs/workbench/contrib/debug/common/debug", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesView", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls, lifecycle_1, platform_1, views_1, debug_1, contextkey_1, descriptors_1, notebookVariablesView_1, notebookContextKeys_1, notebookIcons_1, editorService_1, configuration_1, notebookExecutionStateService_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookVariables = void 0;
    let NotebookVariables = class NotebookVariables extends lifecycle_1.Disposable {
        constructor(editorService, configurationService, notebookExecutionStateService) {
            super();
            this.editorService = editorService;
            this.notebookExecutionStateService = notebookExecutionStateService;
            this.listeners = [];
            this.listeners.push(this.editorService.onDidEditorsChange(() => this.handleInitEvent(configurationService)));
            this.listeners.push(this.notebookExecutionStateService.onDidChangeExecution(() => this.handleInitEvent(configurationService)));
        }
        handleInitEvent(configurationService) {
            if (configurationService.getValue(notebookCommon_1.NotebookSetting.notebookVariablesView)
                && this.editorService.activeEditorPane?.getId() === 'workbench.editor.notebook') {
                if (this.initializeView()) {
                    this.listeners.forEach(listener => listener.dispose());
                }
            }
        }
        initializeView() {
            const debugViewContainer = platform_1.Registry.as('workbench.registry.view.containers').get(debug_1.VIEWLET_ID);
            if (debugViewContainer) {
                const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
                const viewDescriptor = {
                    id: 'NOTEBOOK_VARIABLES', name: nls.localize2('notebookVariables', "Notebook Variables"),
                    containerIcon: notebookIcons_1.variablesViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(notebookVariablesView_1.NotebookVariablesView),
                    order: 50, weight: 5, canToggleVisibility: true, canMoveView: true, collapsed: true, when: contextkey_1.ContextKeyExpr.notEquals(notebookContextKeys_1.NOTEBOOK_KERNEL.key, ''),
                };
                viewsRegistry.registerViews([viewDescriptor], debugViewContainer);
                return true;
            }
            return false;
        }
    };
    exports.NotebookVariables = NotebookVariables;
    exports.NotebookVariables = NotebookVariables = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], NotebookVariables);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tWYXJpYWJsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJpYi9ub3RlYm9va1ZhcmlhYmxlcy9ub3RlYm9va1ZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQnpGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsc0JBQVU7UUFHaEQsWUFDaUIsYUFBOEMsRUFDdkMsb0JBQTJDLEVBQ2xDLDZCQUE4RTtZQUU5RyxLQUFLLEVBQUUsQ0FBQztZQUp5QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFFYixrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBTHZHLGNBQVMsR0FBa0IsRUFBRSxDQUFDO1lBU3JDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoSSxDQUFDO1FBRU8sZUFBZSxDQUFDLG9CQUEyQztZQUNsRSxJQUFJLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxnQ0FBZSxDQUFDLHFCQUFxQixDQUFDO21CQUNwRSxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBRSxLQUFLLDJCQUEyQixFQUFFLENBQUM7Z0JBQ2xGLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUM7b0JBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3hELENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVPLGNBQWM7WUFDckIsTUFBTSxrQkFBa0IsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBMEIsb0NBQW9DLENBQUMsQ0FBQyxHQUFHLENBQUMsa0JBQWdCLENBQUMsQ0FBQztZQUU1SCxJQUFJLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3hCLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLGNBQWMsR0FBRztvQkFDdEIsRUFBRSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLG9CQUFvQixDQUFDO29CQUN4RixhQUFhLEVBQUUsaUNBQWlCLEVBQUUsY0FBYyxFQUFFLElBQUksNEJBQWMsQ0FBQyw2Q0FBcUIsQ0FBQztvQkFDM0YsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDJCQUFjLENBQUMsU0FBUyxDQUFDLHFDQUFlLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztpQkFDNUksQ0FBQztnQkFFRixhQUFhLENBQUMsYUFBYSxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDbEUsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO0tBRUQsQ0FBQTtJQXpDWSw4Q0FBaUI7Z0NBQWpCLGlCQUFpQjtRQUkzQixXQUFBLDhCQUFjLENBQUE7UUFDZCxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsOERBQThCLENBQUE7T0FOcEIsaUJBQWlCLENBeUM3QiJ9