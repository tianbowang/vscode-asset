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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPane", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/workbench/common/contextkeys", "vs/nls", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/platform/list/browser/listService", "vs/platform/instantiation/common/descriptors", "vs/platform/actions/common/actions", "vs/workbench/common/editor", "vs/base/common/cancellation", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, platform_1, contributions_1, bulkEditService_1, bulkEditPane_1, views_1, viewsService_1, contextkeys_1, nls_1, viewPaneContainer_1, contextkey_1, editorGroupsService_1, bulkEditPreview_1, listService_1, descriptors_1, actions_1, editor_1, cancellation_1, dialogs_1, severity_1, codicons_1, iconRegistry_1, panecomposite_1) {
    "use strict";
    var BulkEditPreviewContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    async function getBulkEditPane(viewsService) {
        const view = await viewsService.openView(bulkEditPane_1.BulkEditPane.ID, true);
        if (view instanceof bulkEditPane_1.BulkEditPane) {
            return view;
        }
        return undefined;
    }
    let UXState = class UXState {
        constructor(_paneCompositeService, _editorGroupsService) {
            this._paneCompositeService = _paneCompositeService;
            this._editorGroupsService = _editorGroupsService;
            this._activePanel = _paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)?.getId();
        }
        async restore(panels, editors) {
            // (1) restore previous panel
            if (panels) {
                if (typeof this._activePanel === 'string') {
                    await this._paneCompositeService.openPaneComposite(this._activePanel, 1 /* ViewContainerLocation.Panel */);
                }
                else {
                    this._paneCompositeService.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                }
            }
            // (2) close preview editors
            if (editors) {
                for (const group of this._editorGroupsService.groups) {
                    const previewEditors = [];
                    for (const input of group.editors) {
                        const resource = editor_1.EditorResourceAccessor.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                        if (resource?.scheme === bulkEditPreview_1.BulkEditPreviewProvider.Schema) {
                            previewEditors.push(input);
                        }
                    }
                    if (previewEditors.length) {
                        group.closeEditors(previewEditors, { preserveFocus: true });
                    }
                }
            }
        }
    };
    UXState = __decorate([
        __param(0, panecomposite_1.IPaneCompositePartService),
        __param(1, editorGroupsService_1.IEditorGroupsService)
    ], UXState);
    class PreviewSession {
        constructor(uxState, cts = new cancellation_1.CancellationTokenSource()) {
            this.uxState = uxState;
            this.cts = cts;
        }
    }
    let BulkEditPreviewContribution = class BulkEditPreviewContribution {
        static { BulkEditPreviewContribution_1 = this; }
        static { this.ctxEnabled = new contextkey_1.RawContextKey('refactorPreview.enabled', false); }
        constructor(_paneCompositeService, _viewsService, _editorGroupsService, _dialogService, bulkEditService, contextKeyService) {
            this._paneCompositeService = _paneCompositeService;
            this._viewsService = _viewsService;
            this._editorGroupsService = _editorGroupsService;
            this._dialogService = _dialogService;
            bulkEditService.setPreviewHandler(edits => this._previewEdit(edits));
            this._ctxEnabled = BulkEditPreviewContribution_1.ctxEnabled.bindTo(contextKeyService);
        }
        async _previewEdit(edits) {
            this._ctxEnabled.set(true);
            const uxState = this._activeSession?.uxState ?? new UXState(this._paneCompositeService, this._editorGroupsService);
            const view = await getBulkEditPane(this._viewsService);
            if (!view) {
                this._ctxEnabled.set(false);
                return edits;
            }
            // check for active preview session and let the user decide
            if (view.hasInput()) {
                const { confirmed } = await this._dialogService.confirm({
                    type: severity_1.default.Info,
                    message: (0, nls_1.localize)('overlap', "Another refactoring is being previewed."),
                    detail: (0, nls_1.localize)('detail', "Press 'Continue' to discard the previous refactoring and continue with the current refactoring."),
                    primaryButton: (0, nls_1.localize)({ key: 'continue', comment: ['&& denotes a mnemonic'] }, "&&Continue")
                });
                if (!confirmed) {
                    return [];
                }
            }
            // session
            let session;
            if (this._activeSession) {
                await this._activeSession.uxState.restore(false, true);
                this._activeSession.cts.dispose(true);
                session = new PreviewSession(uxState);
            }
            else {
                session = new PreviewSession(uxState);
            }
            this._activeSession = session;
            // the actual work...
            try {
                return await view.setInput(edits, session.cts.token) ?? [];
            }
            finally {
                // restore UX state
                if (this._activeSession === session) {
                    await this._activeSession.uxState.restore(true, true);
                    this._activeSession.cts.dispose();
                    this._ctxEnabled.set(false);
                    this._activeSession = undefined;
                }
            }
        }
    };
    BulkEditPreviewContribution = BulkEditPreviewContribution_1 = __decorate([
        __param(0, panecomposite_1.IPaneCompositePartService),
        __param(1, viewsService_1.IViewsService),
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, dialogs_1.IDialogService),
        __param(4, bulkEditService_1.IBulkEditService),
        __param(5, contextkey_1.IContextKeyService)
    ], BulkEditPreviewContribution);
    // CMD: accept
    (0, actions_1.registerAction2)(class ApplyAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.apply',
                title: (0, nls_1.localize2)('apply', "Apply Refactoring"),
                category: (0, nls_1.localize2)('cat', "Refactor Preview"),
                icon: codicons_1.Codicon.check,
                precondition: contextkey_1.ContextKeyExpr.and(BulkEditPreviewContribution.ctxEnabled, bulkEditPane_1.BulkEditPane.ctxHasCheckedChanges),
                menu: [{
                        id: actions_1.MenuId.BulkEditContext,
                        order: 1
                    }],
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 10,
                    when: contextkey_1.ContextKeyExpr.and(BulkEditPreviewContribution.ctxEnabled, contextkeys_1.FocusedViewContext.isEqualTo(bulkEditPane_1.BulkEditPane.ID)),
                    primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */,
                }
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.accept();
        }
    });
    // CMD: discard
    (0, actions_1.registerAction2)(class DiscardAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.discard',
                title: (0, nls_1.localize2)('Discard', "Discard Refactoring"),
                category: (0, nls_1.localize2)('cat', "Refactor Preview"),
                icon: codicons_1.Codicon.clearAll,
                precondition: BulkEditPreviewContribution.ctxEnabled,
                menu: [{
                        id: actions_1.MenuId.BulkEditContext,
                        order: 2
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.discard();
        }
    });
    // CMD: toggle change
    (0, actions_1.registerAction2)(class ToggleAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.toggleCheckedState',
                title: (0, nls_1.localize2)('toogleSelection', "Toggle Change"),
                category: (0, nls_1.localize2)('cat', "Refactor Preview"),
                precondition: BulkEditPreviewContribution.ctxEnabled,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: listService_1.WorkbenchListFocusContextKey,
                    primary: 10 /* KeyCode.Space */,
                },
                menu: {
                    id: actions_1.MenuId.BulkEditContext,
                    group: 'navigation'
                }
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.toggleChecked();
        }
    });
    // CMD: toggle category
    (0, actions_1.registerAction2)(class GroupByFile extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.groupByFile',
                title: (0, nls_1.localize2)('groupByFile', "Group Changes By File"),
                category: (0, nls_1.localize2)('cat', "Refactor Preview"),
                icon: codicons_1.Codicon.ungroupByRefType,
                precondition: contextkey_1.ContextKeyExpr.and(bulkEditPane_1.BulkEditPane.ctxHasCategories, bulkEditPane_1.BulkEditPane.ctxGroupByFile.negate(), BulkEditPreviewContribution.ctxEnabled),
                menu: [{
                        id: actions_1.MenuId.BulkEditTitle,
                        when: contextkey_1.ContextKeyExpr.and(bulkEditPane_1.BulkEditPane.ctxHasCategories, bulkEditPane_1.BulkEditPane.ctxGroupByFile.negate()),
                        group: 'navigation',
                        order: 3,
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.groupByFile();
        }
    });
    (0, actions_1.registerAction2)(class GroupByType extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.groupByType',
                title: (0, nls_1.localize2)('groupByType', "Group Changes By Type"),
                category: (0, nls_1.localize2)('cat', "Refactor Preview"),
                icon: codicons_1.Codicon.groupByRefType,
                precondition: contextkey_1.ContextKeyExpr.and(bulkEditPane_1.BulkEditPane.ctxHasCategories, bulkEditPane_1.BulkEditPane.ctxGroupByFile, BulkEditPreviewContribution.ctxEnabled),
                menu: [{
                        id: actions_1.MenuId.BulkEditTitle,
                        when: contextkey_1.ContextKeyExpr.and(bulkEditPane_1.BulkEditPane.ctxHasCategories, bulkEditPane_1.BulkEditPane.ctxGroupByFile),
                        group: 'navigation',
                        order: 3
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.groupByType();
        }
    });
    (0, actions_1.registerAction2)(class ToggleGrouping extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.toggleGrouping',
                title: (0, nls_1.localize2)('groupByType', "Group Changes By Type"),
                category: (0, nls_1.localize2)('cat', "Refactor Preview"),
                icon: codicons_1.Codicon.listTree,
                toggled: bulkEditPane_1.BulkEditPane.ctxGroupByFile.negate(),
                precondition: contextkey_1.ContextKeyExpr.and(bulkEditPane_1.BulkEditPane.ctxHasCategories, BulkEditPreviewContribution.ctxEnabled),
                menu: [{
                        id: actions_1.MenuId.BulkEditContext,
                        order: 3
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.toggleGrouping();
        }
    });
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(BulkEditPreviewContribution, 2 /* LifecyclePhase.Ready */);
    const refactorPreviewViewIcon = (0, iconRegistry_1.registerIcon)('refactor-preview-view-icon', codicons_1.Codicon.lightbulb, (0, nls_1.localize)('refactorPreviewViewIcon', 'View icon of the refactor preview view.'));
    const container = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: bulkEditPane_1.BulkEditPane.ID,
        title: (0, nls_1.localize2)('panel', "Refactor Preview"),
        hideIfEmpty: true,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [bulkEditPane_1.BulkEditPane.ID, { mergeViewWithContainerWhenSingleView: true }]),
        icon: refactorPreviewViewIcon,
        storageId: bulkEditPane_1.BulkEditPane.ID
    }, 1 /* ViewContainerLocation.Panel */);
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: bulkEditPane_1.BulkEditPane.ID,
            name: (0, nls_1.localize2)('panel', "Refactor Preview"),
            when: BulkEditPreviewContribution.ctxEnabled,
            ctorDescriptor: new descriptors_1.SyncDescriptor(bulkEditPane_1.BulkEditPane),
            containerIcon: refactorPreviewViewIcon,
        }], container);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0VkaXQuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9idWxrRWRpdC9icm93c2VyL3ByZXZpZXcvYnVsa0VkaXQuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQThCaEcsS0FBSyxVQUFVLGVBQWUsQ0FBQyxZQUEyQjtRQUN6RCxNQUFNLElBQUksR0FBRyxNQUFNLFlBQVksQ0FBQyxRQUFRLENBQUMsMkJBQVksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEUsSUFBSSxJQUFJLFlBQVksMkJBQVksRUFBRSxDQUFDO1lBQ2xDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxJQUFNLE9BQU8sR0FBYixNQUFNLE9BQU87UUFJWixZQUM2QyxxQkFBZ0QsRUFDckQsb0JBQTBDO1lBRHJDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBMkI7WUFDckQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUVqRixJQUFJLENBQUMsWUFBWSxHQUFHLHFCQUFxQixDQUFDLHNCQUFzQixxQ0FBNkIsRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUN4RyxDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFlLEVBQUUsT0FBZ0I7WUFFOUMsNkJBQTZCO1lBQzdCLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1osSUFBSSxPQUFPLElBQUksQ0FBQyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQzNDLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLHNDQUE4QixDQUFDO2dCQUNwRyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHVCQUF1QixxQ0FBNkIsQ0FBQztnQkFDakYsQ0FBQztZQUNGLENBQUM7WUFFRCw0QkFBNEI7WUFDNUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDYixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDdEQsTUFBTSxjQUFjLEdBQWtCLEVBQUUsQ0FBQztvQkFDekMsS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBRW5DLE1BQU0sUUFBUSxHQUFHLCtCQUFzQixDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSx5QkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO3dCQUNoSCxJQUFJLFFBQVEsRUFBRSxNQUFNLEtBQUsseUNBQXVCLENBQUMsTUFBTSxFQUFFLENBQUM7NEJBQ3pELGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzVCLENBQUM7b0JBQ0YsQ0FBQztvQkFFRCxJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDM0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDN0QsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7S0FDRCxDQUFBO0lBeENLLE9BQU87UUFLVixXQUFBLHlDQUF5QixDQUFBO1FBQ3pCLFdBQUEsMENBQW9CLENBQUE7T0FOakIsT0FBTyxDQXdDWjtJQUVELE1BQU0sY0FBYztRQUNuQixZQUNVLE9BQWdCLEVBQ2hCLE1BQStCLElBQUksc0NBQXVCLEVBQUU7WUFENUQsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQUNoQixRQUFHLEdBQUgsR0FBRyxDQUF5RDtRQUNsRSxDQUFDO0tBQ0w7SUFFRCxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUEyQjs7aUJBRWhCLGVBQVUsR0FBRyxJQUFJLDBCQUFhLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLEFBQXRELENBQXVEO1FBTWpGLFlBQzZDLHFCQUFnRCxFQUM1RCxhQUE0QixFQUNyQixvQkFBMEMsRUFDaEQsY0FBOEIsRUFDN0MsZUFBaUMsRUFDL0IsaUJBQXFDO1lBTGIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUEyQjtZQUM1RCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUNyQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ2hELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUkvRCxlQUFlLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLFdBQVcsR0FBRyw2QkFBMkIsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVPLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBcUI7WUFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFM0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ25ILE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBZSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzVCLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELDJEQUEyRDtZQUMzRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO2dCQUNyQixNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQztvQkFDdkQsSUFBSSxFQUFFLGtCQUFRLENBQUMsSUFBSTtvQkFDbkIsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSx5Q0FBeUMsQ0FBQztvQkFDdkUsTUFBTSxFQUFFLElBQUEsY0FBUSxFQUFDLFFBQVEsRUFBRSxpR0FBaUcsQ0FBQztvQkFDN0gsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDO2lCQUM5RixDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNoQixPQUFPLEVBQUUsQ0FBQztnQkFDWCxDQUFDO1lBQ0YsQ0FBQztZQUVELFVBQVU7WUFDVixJQUFJLE9BQXVCLENBQUM7WUFDNUIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3pCLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLEdBQUcsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE9BQU8sR0FBRyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7WUFFOUIscUJBQXFCO1lBQ3JCLElBQUksQ0FBQztnQkFFSixPQUFPLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFNUQsQ0FBQztvQkFBUyxDQUFDO2dCQUNWLG1CQUFtQjtnQkFDbkIsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLE9BQU8sRUFBRSxDQUFDO29CQUNyQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3RELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUM7Z0JBQ2pDLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQzs7SUFyRUksMkJBQTJCO1FBUzlCLFdBQUEseUNBQXlCLENBQUE7UUFDekIsV0FBQSw0QkFBYSxDQUFBO1FBQ2IsV0FBQSwwQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLHdCQUFjLENBQUE7UUFDZCxXQUFBLGtDQUFnQixDQUFBO1FBQ2hCLFdBQUEsK0JBQWtCLENBQUE7T0FkZiwyQkFBMkIsQ0FzRWhDO0lBR0QsY0FBYztJQUNkLElBQUEseUJBQWUsRUFBQyxNQUFNLFdBQVksU0FBUSxpQkFBTztRQUVoRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsdUJBQXVCO2dCQUMzQixLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDO2dCQUM5QyxRQUFRLEVBQUUsSUFBQSxlQUFTLEVBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDO2dCQUM5QyxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxLQUFLO2dCQUNuQixZQUFZLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsVUFBVSxFQUFFLDJCQUFZLENBQUMsb0JBQW9CLENBQUM7Z0JBQzNHLElBQUksRUFBRSxDQUFDO3dCQUNOLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGVBQWU7d0JBQzFCLEtBQUssRUFBRSxDQUFDO3FCQUNSLENBQUM7Z0JBQ0YsVUFBVSxFQUFFO29CQUNYLE1BQU0sRUFBRSwyQ0FBaUMsRUFBRTtvQkFDM0MsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLFVBQVUsRUFBRSxnQ0FBa0IsQ0FBQyxTQUFTLENBQUMsMkJBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDL0csT0FBTyxFQUFFLCtDQUE0QjtpQkFDckM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDRCQUFhLENBQUMsQ0FBQztZQUNqRCxNQUFNLElBQUksR0FBRyxNQUFNLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqRCxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDaEIsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILGVBQWU7SUFDZixJQUFBLHlCQUFlLEVBQUMsTUFBTSxhQUFjLFNBQVEsaUJBQU87UUFFbEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHlCQUF5QjtnQkFDN0IsS0FBSyxFQUFFLElBQUEsZUFBUyxFQUFDLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQztnQkFDbEQsUUFBUSxFQUFFLElBQUEsZUFBUyxFQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQztnQkFDOUMsSUFBSSxFQUFFLGtCQUFPLENBQUMsUUFBUTtnQkFDdEIsWUFBWSxFQUFFLDJCQUEyQixDQUFDLFVBQVU7Z0JBQ3BELElBQUksRUFBRSxDQUFDO3dCQUNOLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGVBQWU7d0JBQzFCLEtBQUssRUFBRSxDQUFDO3FCQUNSLENBQUM7YUFDRixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDRCQUFhLENBQUMsQ0FBQztZQUNqRCxNQUFNLElBQUksR0FBRyxNQUFNLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqRCxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztLQUNELENBQUMsQ0FBQztJQUdILHFCQUFxQjtJQUNyQixJQUFBLHlCQUFlLEVBQUMsTUFBTSxZQUFhLFNBQVEsaUJBQU87UUFFakQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLG9DQUFvQztnQkFDeEMsS0FBSyxFQUFFLElBQUEsZUFBUyxFQUFDLGlCQUFpQixFQUFFLGVBQWUsQ0FBQztnQkFDcEQsUUFBUSxFQUFFLElBQUEsZUFBUyxFQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQztnQkFDOUMsWUFBWSxFQUFFLDJCQUEyQixDQUFDLFVBQVU7Z0JBQ3BELFVBQVUsRUFBRTtvQkFDWCxNQUFNLDZDQUFtQztvQkFDekMsSUFBSSxFQUFFLDBDQUE0QjtvQkFDbEMsT0FBTyx3QkFBZTtpQkFDdEI7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGVBQWU7b0JBQzFCLEtBQUssRUFBRSxZQUFZO2lCQUNuQjthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNEJBQWEsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2pELElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBR0gsdUJBQXVCO0lBQ3ZCLElBQUEseUJBQWUsRUFBQyxNQUFNLFdBQVksU0FBUSxpQkFBTztRQUVoRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNkJBQTZCO2dCQUNqQyxLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsYUFBYSxFQUFFLHVCQUF1QixDQUFDO2dCQUN4RCxRQUFRLEVBQUUsSUFBQSxlQUFTLEVBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDO2dCQUM5QyxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxnQkFBZ0I7Z0JBQzlCLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQywyQkFBWSxDQUFDLGdCQUFnQixFQUFFLDJCQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFLDJCQUEyQixDQUFDLFVBQVUsQ0FBQztnQkFDN0ksSUFBSSxFQUFFLENBQUM7d0JBQ04sRUFBRSxFQUFFLGdCQUFNLENBQUMsYUFBYTt3QkFDeEIsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUUsMkJBQVksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQzdGLEtBQUssRUFBRSxZQUFZO3dCQUNuQixLQUFLLEVBQUUsQ0FBQztxQkFDUixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0QkFBYSxDQUFDLENBQUM7WUFDakQsTUFBTSxJQUFJLEdBQUcsTUFBTSxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDakQsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQ3JCLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxXQUFZLFNBQVEsaUJBQU87UUFFaEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDZCQUE2QjtnQkFDakMsS0FBSyxFQUFFLElBQUEsZUFBUyxFQUFDLGFBQWEsRUFBRSx1QkFBdUIsQ0FBQztnQkFDeEQsUUFBUSxFQUFFLElBQUEsZUFBUyxFQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQztnQkFDOUMsSUFBSSxFQUFFLGtCQUFPLENBQUMsY0FBYztnQkFDNUIsWUFBWSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUUsMkJBQVksQ0FBQyxjQUFjLEVBQUUsMkJBQTJCLENBQUMsVUFBVSxDQUFDO2dCQUNwSSxJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhO3dCQUN4QixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQVksQ0FBQyxnQkFBZ0IsRUFBRSwyQkFBWSxDQUFDLGNBQWMsQ0FBQzt3QkFDcEYsS0FBSyxFQUFFLFlBQVk7d0JBQ25CLEtBQUssRUFBRSxDQUFDO3FCQUNSLENBQUM7YUFDRixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDRCQUFhLENBQUMsQ0FBQztZQUNqRCxNQUFNLElBQUksR0FBRyxNQUFNLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqRCxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLGNBQWUsU0FBUSxpQkFBTztRQUVuRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsZ0NBQWdDO2dCQUNwQyxLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsYUFBYSxFQUFFLHVCQUF1QixDQUFDO2dCQUN4RCxRQUFRLEVBQUUsSUFBQSxlQUFTLEVBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDO2dCQUM5QyxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxRQUFRO2dCQUN0QixPQUFPLEVBQUUsMkJBQVksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFO2dCQUM3QyxZQUFZLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQVksQ0FBQyxnQkFBZ0IsRUFBRSwyQkFBMkIsQ0FBQyxVQUFVLENBQUM7Z0JBQ3ZHLElBQUksRUFBRSxDQUFDO3dCQUNOLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGVBQWU7d0JBQzFCLEtBQUssRUFBRSxDQUFDO3FCQUNSLENBQUM7YUFDRixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDRCQUFhLENBQUMsQ0FBQztZQUNqRCxNQUFNLElBQUksR0FBRyxNQUFNLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqRCxJQUFJLEVBQUUsY0FBYyxFQUFFLENBQUM7UUFDeEIsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FDeEcsMkJBQTJCLCtCQUMzQixDQUFDO0lBRUYsTUFBTSx1QkFBdUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsNEJBQTRCLEVBQUUsa0JBQU8sQ0FBQyxTQUFTLEVBQUUsSUFBQSxjQUFRLEVBQUMseUJBQXlCLEVBQUUseUNBQXlDLENBQUMsQ0FBQyxDQUFDO0lBRTlLLE1BQU0sU0FBUyxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUEwQixrQkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQzVILEVBQUUsRUFBRSwyQkFBWSxDQUFDLEVBQUU7UUFDbkIsS0FBSyxFQUFFLElBQUEsZUFBUyxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQztRQUM3QyxXQUFXLEVBQUUsSUFBSTtRQUNqQixjQUFjLEVBQUUsSUFBSSw0QkFBYyxDQUNqQyxxQ0FBaUIsRUFDakIsQ0FBQywyQkFBWSxDQUFDLEVBQUUsRUFBRSxFQUFFLG9DQUFvQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQ2pFO1FBQ0QsSUFBSSxFQUFFLHVCQUF1QjtRQUM3QixTQUFTLEVBQUUsMkJBQVksQ0FBQyxFQUFFO0tBQzFCLHNDQUE4QixDQUFDO0lBRWhDLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNqRixFQUFFLEVBQUUsMkJBQVksQ0FBQyxFQUFFO1lBQ25CLElBQUksRUFBRSxJQUFBLGVBQVMsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUM7WUFDNUMsSUFBSSxFQUFFLDJCQUEyQixDQUFDLFVBQVU7WUFDNUMsY0FBYyxFQUFFLElBQUksNEJBQWMsQ0FBQywyQkFBWSxDQUFDO1lBQ2hELGFBQWEsRUFBRSx1QkFBdUI7U0FDdEMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDIn0=