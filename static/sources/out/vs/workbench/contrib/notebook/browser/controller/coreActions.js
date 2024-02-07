/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/platform/telemetry/common/telemetry", "vs/base/common/resources"], function (require, exports, uri_1, nls_1, actions_1, contextkey_1, notebookBrowser_1, notebookContextKeys_1, notebookRange_1, editorService_1, notebookEditorService_1, telemetry_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cellExecutionArgs = exports.parseMultiCellExecutionArgs = exports.getEditorFromArgsOrActivePane = exports.executeNotebookCondition = exports.NotebookCellAction = exports.NotebookMultiCellAction = exports.NotebookAction = exports.findTargetCellEditor = exports.getContextFromUri = exports.getContextFromActiveEditor = exports.CellOverflowToolbarGroups = exports.CellToolbarOrder = exports.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = exports.CELL_TITLE_OUTPUT_GROUP_ID = exports.CELL_TITLE_CELL_GROUP_ID = exports.NOTEBOOK_ACTIONS_CATEGORY = exports.SELECT_KERNEL_ID = void 0;
    // Kernel Command
    exports.SELECT_KERNEL_ID = '_notebook.selectKernel';
    exports.NOTEBOOK_ACTIONS_CATEGORY = (0, nls_1.localize2)('notebookActions.category', 'Notebook');
    exports.CELL_TITLE_CELL_GROUP_ID = 'inline/cell';
    exports.CELL_TITLE_OUTPUT_GROUP_ID = 'inline/output';
    exports.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = 100 /* KeybindingWeight.EditorContrib */; // smaller than Suggest Widget, etc
    var CellToolbarOrder;
    (function (CellToolbarOrder) {
        CellToolbarOrder[CellToolbarOrder["EditCell"] = 0] = "EditCell";
        CellToolbarOrder[CellToolbarOrder["ExecuteAboveCells"] = 1] = "ExecuteAboveCells";
        CellToolbarOrder[CellToolbarOrder["ExecuteCellAndBelow"] = 2] = "ExecuteCellAndBelow";
        CellToolbarOrder[CellToolbarOrder["SaveCell"] = 3] = "SaveCell";
        CellToolbarOrder[CellToolbarOrder["SplitCell"] = 4] = "SplitCell";
        CellToolbarOrder[CellToolbarOrder["ClearCellOutput"] = 5] = "ClearCellOutput";
    })(CellToolbarOrder || (exports.CellToolbarOrder = CellToolbarOrder = {}));
    var CellOverflowToolbarGroups;
    (function (CellOverflowToolbarGroups) {
        CellOverflowToolbarGroups["Copy"] = "1_copy";
        CellOverflowToolbarGroups["Insert"] = "2_insert";
        CellOverflowToolbarGroups["Edit"] = "3_edit";
        CellOverflowToolbarGroups["Share"] = "4_share";
    })(CellOverflowToolbarGroups || (exports.CellOverflowToolbarGroups = CellOverflowToolbarGroups = {}));
    function getContextFromActiveEditor(editorService) {
        const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
        if (!editor || !editor.hasModel()) {
            return;
        }
        const activeCell = editor.getActiveCell();
        const selectedCells = editor.getSelectionViewModels();
        return {
            cell: activeCell,
            selectedCells,
            notebookEditor: editor
        };
    }
    exports.getContextFromActiveEditor = getContextFromActiveEditor;
    function getWidgetFromUri(accessor, uri) {
        const notebookEditorService = accessor.get(notebookEditorService_1.INotebookEditorService);
        const widget = notebookEditorService.listNotebookEditors().find(widget => widget.hasModel() && widget.textModel.uri.toString() === uri.toString());
        if (widget && widget.hasModel()) {
            return widget;
        }
        return undefined;
    }
    function getContextFromUri(accessor, context) {
        const uri = uri_1.URI.revive(context);
        if (uri) {
            const widget = getWidgetFromUri(accessor, uri);
            if (widget) {
                return {
                    notebookEditor: widget,
                };
            }
        }
        return undefined;
    }
    exports.getContextFromUri = getContextFromUri;
    function findTargetCellEditor(context, targetCell) {
        let foundEditor = undefined;
        for (const [, codeEditor] of context.notebookEditor.codeEditors) {
            if ((0, resources_1.isEqual)(codeEditor.getModel()?.uri, targetCell.uri)) {
                foundEditor = codeEditor;
                break;
            }
        }
        return foundEditor;
    }
    exports.findTargetCellEditor = findTargetCellEditor;
    class NotebookAction extends actions_1.Action2 {
        constructor(desc) {
            if (desc.f1 !== false) {
                desc.f1 = false;
                const f1Menu = {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.or(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR)
                };
                if (!desc.menu) {
                    desc.menu = [];
                }
                else if (!Array.isArray(desc.menu)) {
                    desc.menu = [desc.menu];
                }
                desc.menu = [
                    ...desc.menu,
                    f1Menu
                ];
            }
            desc.category = exports.NOTEBOOK_ACTIONS_CATEGORY;
            super(desc);
        }
        async run(accessor, context, ...additionalArgs) {
            const isFromUI = !!context;
            const from = isFromUI ? (this.isNotebookActionContext(context) ? 'notebookToolbar' : 'editorToolbar') : undefined;
            if (!this.isNotebookActionContext(context)) {
                context = this.getEditorContextFromArgsOrActive(accessor, context, ...additionalArgs);
                if (!context) {
                    return;
                }
            }
            if (from !== undefined) {
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
            }
            return this.runWithContext(accessor, context);
        }
        isNotebookActionContext(context) {
            return !!context && !!context.notebookEditor;
        }
        getEditorContextFromArgsOrActive(accessor, context, ...additionalArgs) {
            return getContextFromActiveEditor(accessor.get(editorService_1.IEditorService));
        }
    }
    exports.NotebookAction = NotebookAction;
    // todo@rebornix, replace NotebookAction with this
    class NotebookMultiCellAction extends actions_1.Action2 {
        constructor(desc) {
            if (desc.f1 !== false) {
                desc.f1 = false;
                const f1Menu = {
                    id: actions_1.MenuId.CommandPalette,
                    when: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR
                };
                if (!desc.menu) {
                    desc.menu = [];
                }
                else if (!Array.isArray(desc.menu)) {
                    desc.menu = [desc.menu];
                }
                desc.menu = [
                    ...desc.menu,
                    f1Menu
                ];
            }
            desc.category = exports.NOTEBOOK_ACTIONS_CATEGORY;
            super(desc);
        }
        parseArgs(accessor, ...args) {
            return undefined;
        }
        isCellToolbarContext(context) {
            return !!context && !!context.notebookEditor && context.$mid === 13 /* MarshalledId.NotebookCellActionContext */;
        }
        isEditorContext(context) {
            return !!context && context.groupId !== undefined;
        }
        /**
         * The action/command args are resolved in following order
         * `run(accessor, cellToolbarContext)` from cell toolbar
         * `run(accessor, ...args)` from command service with arguments
         * `run(accessor, undefined)` from keyboard shortcuts, command palatte, etc
         */
        async run(accessor, ...additionalArgs) {
            const context = additionalArgs[0];
            const isFromCellToolbar = this.isCellToolbarContext(context);
            const isFromEditorToolbar = this.isEditorContext(context);
            const from = isFromCellToolbar ? 'cellToolbar' : (isFromEditorToolbar ? 'editorToolbar' : 'other');
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            if (isFromCellToolbar) {
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
                return this.runWithContext(accessor, context);
            }
            // handle parsed args
            const parsedArgs = this.parseArgs(accessor, ...additionalArgs);
            if (parsedArgs) {
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
                return this.runWithContext(accessor, parsedArgs);
            }
            // no parsed args, try handle active editor
            const editor = getEditorFromArgsOrActivePane(accessor);
            if (editor) {
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
                return this.runWithContext(accessor, {
                    ui: false,
                    notebookEditor: editor,
                    selectedCells: (0, notebookBrowser_1.cellRangeToViewCells)(editor, editor.getSelections())
                });
            }
        }
    }
    exports.NotebookMultiCellAction = NotebookMultiCellAction;
    class NotebookCellAction extends NotebookAction {
        isCellActionContext(context) {
            return !!context && !!context.notebookEditor && !!context.cell;
        }
        getCellContextFromArgs(accessor, context, ...additionalArgs) {
            return undefined;
        }
        async run(accessor, context, ...additionalArgs) {
            if (this.isCellActionContext(context)) {
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: 'cellToolbar' });
                return this.runWithContext(accessor, context);
            }
            const contextFromArgs = this.getCellContextFromArgs(accessor, context, ...additionalArgs);
            if (contextFromArgs) {
                return this.runWithContext(accessor, contextFromArgs);
            }
            const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
            if (this.isCellActionContext(activeEditorContext)) {
                return this.runWithContext(accessor, activeEditorContext);
            }
        }
    }
    exports.NotebookCellAction = NotebookCellAction;
    exports.executeNotebookCondition = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.greater(notebookContextKeys_1.NOTEBOOK_KERNEL_COUNT.key, 0), contextkey_1.ContextKeyExpr.greater(notebookContextKeys_1.NOTEBOOK_KERNEL_SOURCE_COUNT.key, 0));
    function isMultiCellArgs(arg) {
        if (arg === undefined) {
            return false;
        }
        const ranges = arg.ranges;
        if (!ranges) {
            return false;
        }
        if (!Array.isArray(ranges) || ranges.some(range => !(0, notebookRange_1.isICellRange)(range))) {
            return false;
        }
        if (arg.document) {
            const uri = uri_1.URI.revive(arg.document);
            if (!uri) {
                return false;
            }
        }
        return true;
    }
    function getEditorFromArgsOrActivePane(accessor, context) {
        const editorFromUri = getContextFromUri(accessor, context)?.notebookEditor;
        if (editorFromUri) {
            return editorFromUri;
        }
        const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(accessor.get(editorService_1.IEditorService).activeEditorPane);
        if (!editor || !editor.hasModel()) {
            return;
        }
        return editor;
    }
    exports.getEditorFromArgsOrActivePane = getEditorFromArgsOrActivePane;
    function parseMultiCellExecutionArgs(accessor, ...args) {
        const firstArg = args[0];
        if (isMultiCellArgs(firstArg)) {
            const editor = getEditorFromArgsOrActivePane(accessor, firstArg.document);
            if (!editor) {
                return;
            }
            const ranges = firstArg.ranges;
            const selectedCells = ranges.map(range => editor.getCellsInRange(range).slice(0)).flat();
            const autoReveal = firstArg.autoReveal;
            return {
                ui: false,
                notebookEditor: editor,
                selectedCells,
                autoReveal
            };
        }
        // handle legacy arguments
        if ((0, notebookRange_1.isICellRange)(firstArg)) {
            // cellRange, document
            const secondArg = args[1];
            const editor = getEditorFromArgsOrActivePane(accessor, secondArg);
            if (!editor) {
                return;
            }
            return {
                ui: false,
                notebookEditor: editor,
                selectedCells: editor.getCellsInRange(firstArg)
            };
        }
        // let's just execute the active cell
        const context = getContextFromActiveEditor(accessor.get(editorService_1.IEditorService));
        return context ? {
            ui: false,
            notebookEditor: context.notebookEditor,
            selectedCells: context.selectedCells ?? [],
            cell: context.cell
        } : undefined;
    }
    exports.parseMultiCellExecutionArgs = parseMultiCellExecutionArgs;
    exports.cellExecutionArgs = [
        {
            isOptional: true,
            name: 'options',
            description: 'The cell range options',
            schema: {
                'type': 'object',
                'required': ['ranges'],
                'properties': {
                    'ranges': {
                        'type': 'array',
                        items: [
                            {
                                'type': 'object',
                                'required': ['start', 'end'],
                                'properties': {
                                    'start': {
                                        'type': 'number'
                                    },
                                    'end': {
                                        'type': 'number'
                                    }
                                }
                            }
                        ]
                    },
                    'document': {
                        'type': 'object',
                        'description': 'The document uri',
                    },
                    'autoReveal': {
                        'type': 'boolean',
                        'description': 'Whether the cell should be revealed into view automatically'
                    }
                }
            }
        }
    ];
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellTitle, {
        submenu: actions_1.MenuId.NotebookCellInsert,
        title: (0, nls_1.localize)('notebookMenu.insertCell', "Insert Cell"),
        group: "2_insert" /* CellOverflowToolbarGroups.Insert */,
        when: notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        submenu: actions_1.MenuId.NotebookCellTitle,
        title: (0, nls_1.localize)('notebookMenu.cellTitle', "Notebook Cell"),
        group: "2_insert" /* CellOverflowToolbarGroups.Insert */,
        when: notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellTitle, {
        title: (0, nls_1.localize)('miShare', "Share"),
        submenu: actions_1.MenuId.EditorContextShare,
        group: "4_share" /* CellOverflowToolbarGroups.Share */
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZUFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJvbGxlci9jb3JlQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFzQmhHLGlCQUFpQjtJQUNKLFFBQUEsZ0JBQWdCLEdBQUcsd0JBQXdCLENBQUM7SUFDNUMsUUFBQSx5QkFBeUIsR0FBRyxJQUFBLGVBQVMsRUFBQywwQkFBMEIsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUU5RSxRQUFBLHdCQUF3QixHQUFHLGFBQWEsQ0FBQztJQUN6QyxRQUFBLDBCQUEwQixHQUFHLGVBQWUsQ0FBQztJQUU3QyxRQUFBLG9DQUFvQyw0Q0FBa0MsQ0FBQyxtQ0FBbUM7SUFFdkgsSUFBa0IsZ0JBT2pCO0lBUEQsV0FBa0IsZ0JBQWdCO1FBQ2pDLCtEQUFRLENBQUE7UUFDUixpRkFBaUIsQ0FBQTtRQUNqQixxRkFBbUIsQ0FBQTtRQUNuQiwrREFBUSxDQUFBO1FBQ1IsaUVBQVMsQ0FBQTtRQUNULDZFQUFlLENBQUE7SUFDaEIsQ0FBQyxFQVBpQixnQkFBZ0IsZ0NBQWhCLGdCQUFnQixRQU9qQztJQUVELElBQWtCLHlCQUtqQjtJQUxELFdBQWtCLHlCQUF5QjtRQUMxQyw0Q0FBZSxDQUFBO1FBQ2YsZ0RBQW1CLENBQUE7UUFDbkIsNENBQWUsQ0FBQTtRQUNmLDhDQUFpQixDQUFBO0lBQ2xCLENBQUMsRUFMaUIseUJBQXlCLHlDQUF6Qix5QkFBeUIsUUFLMUM7SUE0QkQsU0FBZ0IsMEJBQTBCLENBQUMsYUFBNkI7UUFDdkUsTUFBTSxNQUFNLEdBQUcsSUFBQSxpREFBK0IsRUFBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7WUFDbkMsT0FBTztRQUNSLENBQUM7UUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDMUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDdEQsT0FBTztZQUNOLElBQUksRUFBRSxVQUFVO1lBQ2hCLGFBQWE7WUFDYixjQUFjLEVBQUUsTUFBTTtTQUN0QixDQUFDO0lBQ0gsQ0FBQztJQWJELGdFQWFDO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxRQUEwQixFQUFFLEdBQVE7UUFDN0QsTUFBTSxxQkFBcUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhDQUFzQixDQUFDLENBQUM7UUFDbkUsTUFBTSxNQUFNLEdBQUcscUJBQXFCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFbkosSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7WUFDakMsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLFFBQTBCLEVBQUUsT0FBYTtRQUMxRSxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWhDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDVCxNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFL0MsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDWixPQUFPO29CQUNOLGNBQWMsRUFBRSxNQUFNO2lCQUN0QixDQUFDO1lBQ0gsQ0FBQztRQUNGLENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBZEQsOENBY0M7SUFFRCxTQUFnQixvQkFBb0IsQ0FBQyxPQUFtQyxFQUFFLFVBQTBCO1FBQ25HLElBQUksV0FBVyxHQUE0QixTQUFTLENBQUM7UUFDckQsS0FBSyxNQUFNLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2pFLElBQUksSUFBQSxtQkFBTyxFQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pELFdBQVcsR0FBRyxVQUFVLENBQUM7Z0JBQ3pCLE1BQU07WUFDUCxDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3BCLENBQUM7SUFWRCxvREFVQztJQUVELE1BQXNCLGNBQWUsU0FBUSxpQkFBTztRQUNuRCxZQUFZLElBQXFCO1lBQ2hDLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLE1BQU0sTUFBTSxHQUFHO29CQUNkLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGNBQWM7b0JBQ3pCLElBQUksRUFBRSwyQkFBYyxDQUFDLEVBQUUsQ0FBQywrQ0FBeUIsRUFBRSx5REFBbUMsQ0FBQztpQkFDdkYsQ0FBQztnQkFFRixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDaEIsQ0FBQztxQkFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekIsQ0FBQztnQkFFRCxJQUFJLENBQUMsSUFBSSxHQUFHO29CQUNYLEdBQUcsSUFBSSxDQUFDLElBQUk7b0JBQ1osTUFBTTtpQkFDTixDQUFDO1lBQ0gsQ0FBQztZQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsaUNBQXlCLENBQUM7WUFFMUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxPQUFhLEVBQUUsR0FBRyxjQUFxQjtZQUM1RSxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQzNCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ2xILElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDNUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUM7Z0JBQ3RGLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDZCxPQUFPO2dCQUNSLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3hCLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw2QkFBaUIsQ0FBQyxDQUFDO2dCQUN6RCxnQkFBZ0IsQ0FBQyxVQUFVLENBQXNFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQy9KLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFJTyx1QkFBdUIsQ0FBQyxPQUFpQjtZQUNoRCxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFFLE9BQWtDLENBQUMsY0FBYyxDQUFDO1FBQzFFLENBQUM7UUFFRCxnQ0FBZ0MsQ0FBQyxRQUEwQixFQUFFLE9BQWEsRUFBRSxHQUFHLGNBQXFCO1lBQ25HLE9BQU8sMEJBQTBCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUMsQ0FBQztRQUNqRSxDQUFDO0tBQ0Q7SUFyREQsd0NBcURDO0lBRUQsa0RBQWtEO0lBQ2xELE1BQXNCLHVCQUF3QixTQUFRLGlCQUFPO1FBQzVELFlBQVksSUFBcUI7WUFDaEMsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztnQkFDaEIsTUFBTSxNQUFNLEdBQUc7b0JBQ2QsRUFBRSxFQUFFLGdCQUFNLENBQUMsY0FBYztvQkFDekIsSUFBSSxFQUFFLCtDQUF5QjtpQkFDL0IsQ0FBQztnQkFFRixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDaEIsQ0FBQztxQkFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekIsQ0FBQztnQkFFRCxJQUFJLENBQUMsSUFBSSxHQUFHO29CQUNYLEdBQUcsSUFBSSxDQUFDLElBQUk7b0JBQ1osTUFBTTtpQkFDTixDQUFDO1lBQ0gsQ0FBQztZQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsaUNBQXlCLENBQUM7WUFFMUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVELFNBQVMsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztZQUNuRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBSU8sb0JBQW9CLENBQUMsT0FBaUI7WUFDN0MsT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBRSxPQUFrQyxDQUFDLGNBQWMsSUFBSyxPQUFlLENBQUMsSUFBSSxvREFBMkMsQ0FBQztRQUM5SSxDQUFDO1FBQ08sZUFBZSxDQUFDLE9BQWlCO1lBQ3hDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sSUFBSyxPQUFrQyxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUM7UUFDL0UsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsY0FBcUI7WUFDN0QsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxRCxNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25HLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw2QkFBaUIsQ0FBQyxDQUFDO1lBRXpELElBQUksaUJBQWlCLEVBQUUsQ0FBQztnQkFDdkIsZ0JBQWdCLENBQUMsVUFBVSxDQUFzRSx5QkFBeUIsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDOUosT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvQyxDQUFDO1lBRUQscUJBQXFCO1lBRXJCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUM7WUFDL0QsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDaEIsZ0JBQWdCLENBQUMsVUFBVSxDQUFzRSx5QkFBeUIsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDOUosT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNsRCxDQUFDO1lBRUQsMkNBQTJDO1lBQzNDLE1BQU0sTUFBTSxHQUFHLDZCQUE2QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZELElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1osZ0JBQWdCLENBQUMsVUFBVSxDQUFzRSx5QkFBeUIsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFFOUosT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRTtvQkFDcEMsRUFBRSxFQUFFLEtBQUs7b0JBQ1QsY0FBYyxFQUFFLE1BQU07b0JBQ3RCLGFBQWEsRUFBRSxJQUFBLHNDQUFvQixFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7aUJBQ25FLENBQUMsQ0FBQztZQUNKLENBQUM7UUFDRixDQUFDO0tBQ0Q7SUE3RUQsMERBNkVDO0lBRUQsTUFBc0Isa0JBQW1ELFNBQVEsY0FBYztRQUNwRixtQkFBbUIsQ0FBQyxPQUFpQjtZQUM5QyxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFFLE9BQXNDLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBRSxPQUFzQyxDQUFDLElBQUksQ0FBQztRQUNoSSxDQUFDO1FBRVMsc0JBQXNCLENBQUMsUUFBMEIsRUFBRSxPQUFXLEVBQUUsR0FBRyxjQUFxQjtZQUNqRyxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLE9BQW9DLEVBQUUsR0FBRyxjQUFxQjtZQUM1RyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNkJBQWlCLENBQUMsQ0FBQztnQkFDekQsZ0JBQWdCLENBQUMsVUFBVSxDQUFzRSx5QkFBeUIsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFFdkssT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvQyxDQUFDO1lBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztZQUUxRixJQUFJLGVBQWUsRUFBRSxDQUFDO2dCQUNyQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZELENBQUM7WUFFRCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1RSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7Z0JBQ25ELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUMzRCxDQUFDO1FBQ0YsQ0FBQztLQUdEO0lBOUJELGdEQThCQztJQUVZLFFBQUEsd0JBQXdCLEdBQUcsMkJBQWMsQ0FBQyxFQUFFLENBQUMsMkJBQWMsQ0FBQyxPQUFPLENBQUMsMkNBQXFCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLDJCQUFjLENBQUMsT0FBTyxDQUFDLGtEQUE0QixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBUTdLLFNBQVMsZUFBZSxDQUFDLEdBQVk7UUFDcEMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdkIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUksR0FBc0IsQ0FBQyxNQUFNLENBQUM7UUFDOUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2IsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBQSw0QkFBWSxFQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUMxRSxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFLLEdBQXNCLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEMsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLE1BQU0sQ0FBRSxHQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXpELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDVixPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsU0FBZ0IsNkJBQTZCLENBQUMsUUFBMEIsRUFBRSxPQUF1QjtRQUNoRyxNQUFNLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUUsY0FBYyxDQUFDO1FBRTNFLElBQUksYUFBYSxFQUFFLENBQUM7WUFDbkIsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLElBQUEsaURBQStCLEVBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5RixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7WUFDbkMsT0FBTztRQUNSLENBQUM7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFiRCxzRUFhQztJQUVELFNBQWdCLDJCQUEyQixDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO1FBQ3JGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV6QixJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQy9CLE1BQU0sTUFBTSxHQUFHLDZCQUE2QixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNiLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMvQixNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6RixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQ3ZDLE9BQU87Z0JBQ04sRUFBRSxFQUFFLEtBQUs7Z0JBQ1QsY0FBYyxFQUFFLE1BQU07Z0JBQ3RCLGFBQWE7Z0JBQ2IsVUFBVTthQUNWLENBQUM7UUFDSCxDQUFDO1FBRUQsMEJBQTBCO1FBQzFCLElBQUksSUFBQSw0QkFBWSxFQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDNUIsc0JBQXNCO1lBQ3RCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLE1BQU0sR0FBRyw2QkFBNkIsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNiLE9BQU87WUFDUixDQUFDO1lBRUQsT0FBTztnQkFDTixFQUFFLEVBQUUsS0FBSztnQkFDVCxjQUFjLEVBQUUsTUFBTTtnQkFDdEIsYUFBYSxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDO2FBQy9DLENBQUM7UUFDSCxDQUFDO1FBRUQscUNBQXFDO1FBQ3JDLE1BQU0sT0FBTyxHQUFHLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDLENBQUM7UUFDekUsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLEVBQUUsRUFBRSxLQUFLO1lBQ1QsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO1lBQ3RDLGFBQWEsRUFBRSxPQUFPLENBQUMsYUFBYSxJQUFJLEVBQUU7WUFDMUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1NBQ2xCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUNmLENBQUM7SUE1Q0Qsa0VBNENDO0lBRVksUUFBQSxpQkFBaUIsR0FNekI7UUFDSDtZQUNDLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLElBQUksRUFBRSxTQUFTO1lBQ2YsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxNQUFNLEVBQUU7Z0JBQ1AsTUFBTSxFQUFFLFFBQVE7Z0JBQ2hCLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQztnQkFDdEIsWUFBWSxFQUFFO29CQUNiLFFBQVEsRUFBRTt3QkFDVCxNQUFNLEVBQUUsT0FBTzt3QkFDZixLQUFLLEVBQUU7NEJBQ047Z0NBQ0MsTUFBTSxFQUFFLFFBQVE7Z0NBQ2hCLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUM7Z0NBQzVCLFlBQVksRUFBRTtvQ0FDYixPQUFPLEVBQUU7d0NBQ1IsTUFBTSxFQUFFLFFBQVE7cUNBQ2hCO29DQUNELEtBQUssRUFBRTt3Q0FDTixNQUFNLEVBQUUsUUFBUTtxQ0FDaEI7aUNBQ0Q7NkJBQ0Q7eUJBQ0Q7cUJBQ0Q7b0JBQ0QsVUFBVSxFQUFFO3dCQUNYLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixhQUFhLEVBQUUsa0JBQWtCO3FCQUNqQztvQkFDRCxZQUFZLEVBQUU7d0JBQ2IsTUFBTSxFQUFFLFNBQVM7d0JBQ2pCLGFBQWEsRUFBRSw2REFBNkQ7cUJBQzVFO2lCQUNEO2FBQ0Q7U0FDRDtLQUNELENBQUM7SUFHSCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGlCQUFpQixFQUFFO1FBQ3JELE9BQU8sRUFBRSxnQkFBTSxDQUFDLGtCQUFrQjtRQUNsQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMseUJBQXlCLEVBQUUsYUFBYSxDQUFDO1FBQ3pELEtBQUssbURBQWtDO1FBQ3ZDLElBQUksRUFBRSw4Q0FBd0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0tBQzlDLENBQUMsQ0FBQztJQUVILHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsYUFBYSxFQUFFO1FBQ2pELE9BQU8sRUFBRSxnQkFBTSxDQUFDLGlCQUFpQjtRQUNqQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsZUFBZSxDQUFDO1FBQzFELEtBQUssbURBQWtDO1FBQ3ZDLElBQUksRUFBRSw2Q0FBdUI7S0FDN0IsQ0FBQyxDQUFDO0lBRUgsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxpQkFBaUIsRUFBRTtRQUNyRCxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQztRQUNuQyxPQUFPLEVBQUUsZ0JBQU0sQ0FBQyxrQkFBa0I7UUFDbEMsS0FBSyxpREFBaUM7S0FDdEMsQ0FBQyxDQUFDIn0=