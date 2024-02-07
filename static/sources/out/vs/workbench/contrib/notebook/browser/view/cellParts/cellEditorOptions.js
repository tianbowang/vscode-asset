/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/workbench/common/contextkeys", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, event_1, nls_1, actions_1, configuration_1, configurationRegistry_1, contextkey_1, platform_1, contextkeys_1, coreActions_1, notebookContextKeys_1, cellPart_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellEditorOptions = void 0;
    class CellEditorOptions extends cellPart_1.CellContentPart {
        constructor(base, notebookOptions, configurationService) {
            super();
            this.base = base;
            this.notebookOptions = notebookOptions;
            this.configurationService = configurationService;
            this._lineNumbers = 'inherit';
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(base.onDidChange(() => {
                this._recomputeOptions();
            }));
            this._value = this._computeEditorOptions();
        }
        updateState(element, e) {
            if (e.cellLineNumberChanged) {
                this.setLineNumbers(element.lineNumbers);
            }
        }
        _recomputeOptions() {
            this._value = this._computeEditorOptions();
            this._onDidChange.fire();
        }
        _computeEditorOptions() {
            const value = this.base.value;
            let cellRenderLineNumber = value.lineNumbers;
            switch (this._lineNumbers) {
                case 'inherit':
                    // inherit from the notebook setting
                    if (this.configurationService.getValue('notebook.lineNumbers') === 'on') {
                        if (value.lineNumbers === 'off') {
                            cellRenderLineNumber = 'on';
                        } // otherwise just use the editor setting
                    }
                    else {
                        cellRenderLineNumber = 'off';
                    }
                    break;
                case 'on':
                    // should turn on, ignore the editor line numbers off options
                    if (value.lineNumbers === 'off') {
                        cellRenderLineNumber = 'on';
                    } // otherwise just use the editor setting
                    break;
                case 'off':
                    cellRenderLineNumber = 'off';
                    break;
            }
            if (value.lineNumbers !== cellRenderLineNumber) {
                return {
                    ...value,
                    ...{ lineNumbers: cellRenderLineNumber }
                };
            }
            else {
                return Object.assign({}, value);
            }
        }
        getUpdatedValue(internalMetadata, cellUri) {
            const options = this.getValue(internalMetadata, cellUri);
            delete options.hover; // This is toggled by a debug editor contribution
            return options;
        }
        getValue(internalMetadata, cellUri) {
            return {
                ...this._value,
                ...{
                    padding: this.notebookOptions.computeEditorPadding(internalMetadata, cellUri)
                }
            };
        }
        getDefaultValue() {
            return {
                ...this._value,
                ...{
                    padding: { top: 12, bottom: 12 }
                }
            };
        }
        setLineNumbers(lineNumbers) {
            this._lineNumbers = lineNumbers;
            this._recomputeOptions();
        }
    }
    exports.CellEditorOptions = CellEditorOptions;
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.lineNumbers': {
                type: 'string',
                enum: ['off', 'on'],
                default: 'off',
                markdownDescription: (0, nls_1.localize)('notebook.lineNumbers', "Controls the display of line numbers in the cell editor.")
            }
        }
    });
    (0, actions_1.registerAction2)(class ToggleLineNumberAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.toggleLineNumbers',
                title: (0, nls_1.localize2)('notebook.toggleLineNumbers', 'Toggle Notebook Line Numbers'),
                precondition: notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED,
                menu: [
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        group: 'notebookLayout',
                        order: 2,
                        when: contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true)
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
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const renderLiNumbers = configurationService.getValue('notebook.lineNumbers') === 'on';
            if (renderLiNumbers) {
                configurationService.updateValue('notebook.lineNumbers', 'off');
            }
            else {
                configurationService.updateValue('notebook.lineNumbers', 'on');
            }
        }
    });
    (0, actions_1.registerAction2)(class ToggleActiveLineNumberAction extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: 'notebook.cell.toggleLineNumbers',
                title: (0, nls_1.localize)('notebook.cell.toggleLineNumbers.title', "Show Cell Line Numbers"),
                precondition: contextkeys_1.ActiveEditorContext.isEqualTo(notebookCommon_1.NOTEBOOK_EDITOR_ID),
                menu: [{
                        id: actions_1.MenuId.NotebookCellTitle,
                        group: 'View',
                        order: 1
                    }],
                toggled: contextkey_1.ContextKeyExpr.or(notebookContextKeys_1.NOTEBOOK_CELL_LINE_NUMBERS.isEqualTo('on'), contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LINE_NUMBERS.isEqualTo('inherit'), contextkey_1.ContextKeyExpr.equals('config.notebook.lineNumbers', 'on')))
            });
        }
        async runWithContext(accessor, context) {
            if (context.ui) {
                this.updateCell(accessor.get(configuration_1.IConfigurationService), context.cell);
            }
            else {
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                context.selectedCells.forEach(cell => {
                    this.updateCell(configurationService, cell);
                });
            }
        }
        updateCell(configurationService, cell) {
            const renderLineNumbers = configurationService.getValue('notebook.lineNumbers') === 'on';
            const cellLineNumbers = cell.lineNumbers;
            // 'on', 'inherit' 	-> 'on'
            // 'on', 'off'		-> 'off'
            // 'on', 'on'		-> 'on'
            // 'off', 'inherit'	-> 'off'
            // 'off', 'off'		-> 'off'
            // 'off', 'on'		-> 'on'
            const currentLineNumberIsOn = cellLineNumbers === 'on' || (cellLineNumbers === 'inherit' && renderLineNumbers);
            if (currentLineNumberIsOn) {
                cell.lineNumbers = 'off';
            }
            else {
                cell.lineNumbers = 'on';
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEVkaXRvck9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9jZWxsUGFydHMvY2VsbEVkaXRvck9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxNQUFhLGlCQUFrQixTQUFRLDBCQUFlO1FBTXJELFlBQTZCLElBQTRCLEVBQVcsZUFBZ0MsRUFBVyxvQkFBMkM7WUFDekosS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBd0I7WUFBVyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFBVyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBTGxKLGlCQUFZLEdBQTZCLFNBQVMsQ0FBQztZQUMxQyxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzNELGdCQUFXLEdBQWdCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBTTNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzVDLENBQUM7UUFFUSxXQUFXLENBQUMsT0FBdUIsRUFBRSxDQUFnQztZQUM3RSxJQUFJLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxQyxDQUFDO1FBQ0YsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsTUFBTSxH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