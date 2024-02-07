/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/preferences/common/preferences"], function (require, exports, codicons_1, uri_1, nls_1, actions_1, commands_1, contextkey_1, quickInput_1, coreActions_1, notebookBrowser_1, notebookEditorService_1, notebookCommon_1, notebookContextKeys_1, notebookService_1, editorService_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.registerAction2)(class NotebookConfigureLayoutAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.notebook.layout.select',
                title: {
                    value: (0, nls_1.localize)('workbench.notebook.layout.select.label', "Select between Notebook Layouts"),
                    original: 'Select between Notebook Layouts'
                },
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.openGettingStarted}`, true),
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        group: 'notebookLayout',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true), contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.openGettingStarted}`, true)),
                        order: 0
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        group: 'notebookLayout',
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true), contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.openGettingStarted}`, true)),
                        order: 0
                    }
                ]
            });
        }
        run(accessor) {
            accessor.get(commands_1.ICommandService).executeCommand('workbench.action.openWalkthrough', { category: 'notebooks', step: 'notebookProfile' }, true);
        }
    });
    (0, actions_1.registerAction2)(class NotebookConfigureLayoutAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.notebook.layout.configure',
                title: {
                    value: (0, nls_1.localize)('workbench.notebook.layout.configure.label', "Customize Notebook Layout"),
                    original: 'Customize Notebook Layout'
                },
                f1: true,
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                menu: [
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        group: 'notebookLayout',
                        when: contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true),
                        order: 1
                    }
                ]
            });
        }
        run(accessor) {
            accessor.get(preferences_1.IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:notebookLayout' });
        }
    });
    (0, actions_1.registerAction2)(class NotebookConfigureLayoutFromEditorTitle extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.notebook.layout.configure.editorTitle',
                title: {
                    value: (0, nls_1.localize)('workbench.notebook.layout.configure.label', "Customize Notebook Layout"),
                    original: 'Customize Notebook Layout'
                },
                f1: false,
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                menu: [
                    {
                        id: actions_1.MenuId.NotebookEditorLayoutConfigure,
                        group: 'notebookLayout',
                        when: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR,
                        order: 1
                    }
                ]
            });
        }
        run(accessor) {
            accessor.get(preferences_1.IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:notebookLayout' });
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        submenu: actions_1.MenuId.NotebookEditorLayoutConfigure,
        rememberDefaultAction: false,
        title: { value: (0, nls_1.localize)('customizeNotebook', "Customize Notebook..."), original: 'Customize Notebook...', },
        icon: codicons_1.Codicon.gear,
        group: 'navigation',
        order: -1,
        when: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR
    });
    (0, actions_1.registerAction2)(class ToggleLineNumberFromEditorTitle extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.toggleLineNumbersFromEditorTitle',
                title: (0, nls_1.localize2)('notebook.toggleLineNumbers', 'Toggle Notebook Line Numbers'),
                precondition: notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED,
                menu: [
                    {
                        id: actions_1.MenuId.NotebookEditorLayoutConfigure,
                        group: 'notebookLayoutDetails',
                        order: 1,
                        when: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR
                    }
                ],
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                f1: true,
                toggled: {
                    condition: contextkey_1.ContextKeyExpr.notEquals('config.notebook.lineNumbers', 'off'),
                    title: (0, nls_1.localize)('notebook.showLineNumbers', "Notebook Line Numbers"),
                }
            });
        }
        async run(accessor) {
            return accessor.get(commands_1.ICommandService).executeCommand('notebook.toggleLineNumbers');
        }
    });
    (0, actions_1.registerAction2)(class ToggleCellToolbarPositionFromEditorTitle extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.toggleCellToolbarPositionFromEditorTitle',
                title: (0, nls_1.localize2)('notebook.toggleCellToolbarPosition', 'Toggle Cell Toolbar Position'),
                menu: [{
                        id: actions_1.MenuId.NotebookEditorLayoutConfigure,
                        group: 'notebookLayoutDetails',
                        order: 3
                    }],
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                f1: false
            });
        }
        async run(accessor, ...args) {
            return accessor.get(commands_1.ICommandService).executeCommand('notebook.toggleCellToolbarPosition', ...args);
        }
    });
    (0, actions_1.registerAction2)(class ToggleBreadcrumbFromEditorTitle extends actions_1.Action2 {
        constructor() {
            super({
                id: 'breadcrumbs.toggleFromEditorTitle',
                title: (0, nls_1.localize2)('notebook.toggleBreadcrumb', 'Toggle Breadcrumbs'),
                menu: [{
                        id: actions_1.MenuId.NotebookEditorLayoutConfigure,
                        group: 'notebookLayoutDetails',
                        order: 2
                    }],
                f1: false
            });
        }
        async run(accessor) {
            return accessor.get(commands_1.ICommandService).executeCommand('breadcrumbs.toggle');
        }
    });
    (0, actions_1.registerAction2)(class SaveMimeTypeDisplayOrder extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.saveMimeTypeOrder',
                title: {
                    value: (0, nls_1.localize)('notebook.saveMimeTypeOrder', 'Save Mimetype Display Order'),
                    original: 'Save Mimetype Display Order'
                },
                f1: true,
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                precondition: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR,
            });
        }
        run(accessor) {
            const service = accessor.get(notebookService_1.INotebookService);
            const qp = accessor.get(quickInput_1.IQuickInputService).createQuickPick();
            qp.placeholder = (0, nls_1.localize)('notebook.placeholder', 'Settings file to save in');
            qp.items = [
                { target: 2 /* ConfigurationTarget.USER */, label: (0, nls_1.localize)('saveTarget.machine', 'User Settings') },
                { target: 5 /* ConfigurationTarget.WORKSPACE */, label: (0, nls_1.localize)('saveTarget.workspace', 'Workspace Settings') },
            ];
            qp.onDidAccept(() => {
                const target = qp.selectedItems[0]?.target;
                if (target !== undefined) {
                    service.saveMimeDisplayOrder(target);
                }
                qp.dispose();
            });
            qp.onDidHide(() => qp.dispose());
            qp.show();
        }
    });
    (0, actions_1.registerAction2)(class NotebookWebviewResetAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.notebook.layout.webview.reset',
                title: {
                    value: (0, nls_1.localize)('workbench.notebook.layout.webview.reset.label', "Reset Notebook Webview"),
                    original: 'Reset Notebook Webview'
                },
                f1: false,
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY
            });
        }
        run(accessor, args) {
            const editorService = accessor.get(editorService_1.IEditorService);
            if (args) {
                const uri = uri_1.URI.revive(args);
                const notebookEditorService = accessor.get(notebookEditorService_1.INotebookEditorService);
                const widgets = notebookEditorService.listNotebookEditors().filter(widget => widget.hasModel() && widget.textModel.uri.toString() === uri.toString());
                for (const widget of widgets) {
                    if (widget.hasModel()) {
                        widget.getInnerWebview()?.reload();
                    }
                }
            }
            else {
                const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
                if (!editor) {
                    return;
                }
                editor.getInnerWebview()?.reload();
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cm9sbGVyL2xheW91dEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFvQmhHLElBQUEseUJBQWUsRUFBQyxNQUFNLDZCQUE4QixTQUFRLGlCQUFPO1FBQ2xFO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxrQ0FBa0M7Z0JBQ3RDLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0NBQXdDLEVBQUUsaUNBQWlDLENBQUM7b0JBQzVGLFFBQVEsRUFBRSxpQ0FBaUM7aUJBQzNDO2dCQUNELEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSwyQkFBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLGdDQUFlLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxJQUFJLENBQUM7Z0JBQ3pGLFFBQVEsRUFBRSx1Q0FBeUI7Z0JBQ25DLElBQUksRUFBRTtvQkFDTDt3QkFDQyxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXO3dCQUN0QixLQUFLLEVBQUUsZ0JBQWdCO3dCQUN2QixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQ3ZCLCtDQUF5QixFQUN6QiwyQkFBYyxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsRUFBRSxJQUFJLENBQUMsRUFDL0QsMkJBQWMsQ0FBQyxNQUFNLENBQUMsVUFBVSxnQ0FBZSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsSUFBSSxDQUFDLENBQzNFO3dCQUNELEtBQUssRUFBRSxDQUFDO3FCQUNSO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGVBQWU7d0JBQzFCLEtBQUssRUFBRSxnQkFBZ0I7d0JBQ3ZCLElBQUksRUFBRSwyQkFBYyxDQUFD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