/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/nls", "vs/editor/contrib/colorPicker/browser/standaloneColorPickerWidget", "vs/editor/common/editorContextKeys", "vs/platform/actions/common/actions", "vs/css!./colorPicker"], function (require, exports, editorExtensions_1, nls_1, standaloneColorPickerWidget_1, editorContextKeys_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowOrFocusStandaloneColorPicker = void 0;
    class ShowOrFocusStandaloneColorPicker extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.showOrFocusStandaloneColorPicker',
                title: {
                    value: (0, nls_1.localize)('showOrFocusStandaloneColorPicker', "Show or Focus Standalone Color Picker"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'mishowOrFocusStandaloneColorPicker', comment: ['&& denotes a mnemonic'] }, "&&Show or Focus Standalone Color Picker"),
                    original: 'Show or Focus Standalone Color Picker',
                },
                precondition: undefined,
                menu: [
                    { id: actions_1.MenuId.CommandPalette },
                ]
            });
        }
        runEditorCommand(_accessor, editor) {
            standaloneColorPickerWidget_1.StandaloneColorPickerController.get(editor)?.showOrFocus();
        }
    }
    exports.ShowOrFocusStandaloneColorPicker = ShowOrFocusStandaloneColorPicker;
    class HideStandaloneColorPicker extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.hideColorPicker',
                label: (0, nls_1.localize)({
                    key: 'hideColorPicker',
                    comment: [
                        'Action that hides the color picker'
                    ]
                }, "Hide the Color Picker"),
                alias: 'Hide the Color Picker',
                precondition: editorContextKeys_1.EditorContextKeys.standaloneColorPickerVisible.isEqualTo(true),
                kbOpts: {
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            standaloneColorPickerWidget_1.StandaloneColorPickerController.get(editor)?.hide();
        }
    }
    class InsertColorWithStandaloneColorPicker extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.insertColorWithStandaloneColorPicker',
                label: (0, nls_1.localize)({
                    key: 'insertColorWithStandaloneColorPicker',
                    comment: [
                        'Action that inserts color with standalone color picker'
                    ]
                }, "Insert Color with Standalone Color Picker"),
                alias: 'Insert Color with Standalone Color Picker',
                precondition: editorContextKeys_1.EditorContextKeys.standaloneColorPickerFocused.isEqualTo(true),
                kbOpts: {
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            standaloneColorPickerWidget_1.StandaloneColorPickerController.get(editor)?.insertColor();
        }
    }
    (0, editorExtensions_1.registerEditorAction)(HideStandaloneColorPicker);
    (0, editorExtensions_1.registerEditorAction)(InsertColorWithStandaloneColorPicker);
    (0, actions_1.registerAction2)(ShowOrFocusStandaloneColorPicker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUNvbG9yUGlja2VyQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29sb3JQaWNrZXIvYnJvd3Nlci9zdGFuZGFsb25lQ29sb3JQaWNrZXJBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFhLGdDQUFpQyxTQUFRLGdDQUFhO1FBQ2xFO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxnREFBZ0Q7Z0JBQ3BELEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0NBQWtDLEVBQUUsdUNBQXVDLENBQUM7b0JBQzVGLGFBQWEsRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxvQ0FBb0MsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUseUNBQXlDLENBQUM7b0JBQ3JKLFFBQVEsRUFBRSx1Q0FBdUM7aUJBQ2pEO2dCQUNELFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxjQUFjLEVBQUU7aUJBQzdCO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNELGdCQUFnQixDQUFDLFNBQTJCLEVBQUUsTUFBbUI7WUFDaEUsNkRBQStCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQzVELENBQUM7S0FDRDtJQWxCRCw0RUFrQkM7SUFFRCxNQUFNLHlCQUEwQixTQUFRLCtCQUFZO1FBQ25EO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSwrQkFBK0I7Z0JBQ25DLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQztvQkFDZixHQUFHLEVBQUUsaUJBQWlCO29CQUN0QixPQUFPLEVBQUU7d0JBQ1Isb0NBQW9DO3FCQUNwQztpQkFDRCxFQUFFLHVCQUF1QixDQUFDO2dCQUMzQixLQUFLLEVBQUUsdUJBQXVCO2dCQUM5QixZQUFZLEVBQUUscUNBQWlCLENBQUMsNEJBQTRCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDNUUsTUFBTSxFQUFFO29CQUNQLE9BQU8sd0JBQWdCO29CQUN2QixNQUFNLDBDQUFnQztpQkFDdEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBQ00sR0FBRyxDQUFDLFNBQTJCLEVBQUUsTUFBbUI7WUFDMUQsNkRBQStCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO1FBQ3JELENBQUM7S0FDRDtJQUVELE1BQU0sb0NBQXFDLFNBQVEsK0JBQVk7UUFDOUQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLG9EQUFvRDtnQkFDeEQsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDO29CQUNmLEdBQUcsRUFBRSxzQ0FBc0M7b0JBQzNDLE9BQU8sRUFBRTt3QkFDUix3REFBd0Q7cUJBQ3hEO2lCQUNELEVBQUUsMkNBQTJDLENBQUM7Z0JBQy9DLEtBQUssRUFBRSwyQ0FBMkM7Z0JBQ2xELFlBQVksRUFBRSxxQ0FBaUIsQ0FBQyw0QkFBNEIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO2dCQUM1RSxNQUFNLEVBQUU7b0JBQ1AsT0FBTyx1QkFBZTtvQkFDdEIsTUFBTSwwQ0FBZ0M7aUJBQ3RDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNNLEdBQUcsQ0FBQyxTQUEyQixFQUFFLE1BQW1CO1lBQzFELDZEQUErQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUM1RCxDQUFDO0tBQ0Q7SUFFRCxJQUFBLHVDQUFvQixFQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDaEQsSUFBQSx1Q0FBb0IsRUFBQyxvQ0FBb0MsQ0FBQyxDQUFDO0lBQzNELElBQUEseUJBQWUsRUFBQyxnQ0FBZ0MsQ0FBQyxDQUFDIn0=