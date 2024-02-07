/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/workbench/contrib/snippets/browser/tabCompletion", "vs/editor/browser/editorExtensions"], function (require, exports, contextmenu_1, snippetController2_1, suggestController_1, menuPreventer_1, selectionClipboard_1, tabCompletion_1, editorExtensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSimpleCodeEditorWidgetOptions = exports.getSimpleEditorOptions = void 0;
    function getSimpleEditorOptions(configurationService) {
        return {
            wordWrap: 'on',
            overviewRulerLanes: 0,
            glyphMargin: false,
            lineNumbers: 'off',
            folding: false,
            selectOnLineNumbers: false,
            hideCursorInOverviewRuler: true,
            selectionHighlight: false,
            scrollbar: {
                horizontal: 'hidden'
            },
            lineDecorationsWidth: 0,
            overviewRulerBorder: false,
            scrollBeyondLastLine: false,
            renderLineHighlight: 'none',
            fixedOverflowWidgets: true,
            acceptSuggestionOnEnter: 'smart',
            dragAndDrop: false,
            revealHorizontalRightPadding: 5,
            minimap: {
                enabled: false
            },
            guides: {
                indentation: false
            },
            accessibilitySupport: configurationService.getValue('editor.accessibilitySupport'),
            cursorBlinking: configurationService.getValue('editor.cursorBlinking')
        };
    }
    exports.getSimpleEditorOptions = getSimpleEditorOptions;
    function getSimpleCodeEditorWidgetOptions() {
        return {
            isSimpleWidget: true,
            contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                menuPreventer_1.MenuPreventer.ID,
                selectionClipboard_1.SelectionClipboardContributionID,
                contextmenu_1.ContextMenuController.ID,
                suggestController_1.SuggestController.ID,
                snippetController2_1.SnippetController2.ID,
                tabCompletion_1.TabCompletionController.ID,
            ])
        };
    }
    exports.getSimpleCodeEditorWidgetOptions = getSimpleCodeEditorWidgetOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlRWRpdG9yT3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL3NpbXBsZUVkaXRvck9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLFNBQWdCLHNCQUFzQixDQUFDLG9CQUEyQztRQUNqRixPQUFPO1lBQ04sUUFBUSxFQUFFLElBQUk7WUFDZCxrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsbUJBQW1CLEVBQUUsS0FBSztZQUMxQix5QkFBeUIsRUFBRSxJQUFJO1lBQy9CLGtCQUFrQixFQUFFLEtBQUs7WUFDekIsU0FBUyxFQUFFO2dCQUNWLFVBQVUsRUFBRSxRQUFRO2FBQ3BCO1lBQ0Qsb0JBQW9CLEVBQUUsQ0FBQztZQUN2QixtQkFBbUIsRUFBRSxLQUFLO1lBQzFCLG9CQUFvQixFQUFFLEtBQUs7WUFDM0IsbUJBQW1CLEVBQUUsTUFBTTtZQUMzQixvQkFBb0IsRUFBRSxJQUFJO1lBQzFCLHVCQUF1QixFQUFFLE9BQU87WUFDaEMsV0FBVyxFQUFFLEtBQUs7WUFDbEIsNEJBQTRCLEVBQUUsQ0FBQztZQUMvQixPQUFPLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLEtBQUs7YUFDZDtZQUNELE1BQU0sRUFBRTtnQkFDUCxXQUFXLEVBQUUsS0FBSzthQUNsQjtZQUNELG9CQUFvQixFQUFFLG9CQUFvQixDQUFDLFFBQVEsQ0FBd0IsNkJBQTZCLENBQUM7WUFDekcsY0FBYyxFQUFFLG9CQUFvQixDQUFDLFFBQVEsQ0FBb0QsdUJBQXVCLENBQUM7U0FDekgsQ0FBQztJQUNILENBQUM7SUE5QkQsd0RBOEJDO0lBRUQsU0FBZ0IsZ0NBQWdDO1FBQy9DLE9BQU87WUFDTixjQUFjLEVBQUUsSUFBSTtZQUNwQixhQUFhLEVBQUUsMkNBQXdCLENBQUMsMEJBQTBCLENBQUM7Z0JBQ2xFLDZCQUFhLENBQUMsRUFBRTtnQkFDaEIscURBQWdDO2dCQUNoQyxtQ0FBcUIsQ0FBQyxFQUFFO2dCQUN4QixxQ0FBaUIsQ0FBQyxFQUFFO2dCQUNwQix1Q0FBa0IsQ0FBQyxFQUFFO2dCQUNyQix1Q0FBdUIsQ0FBQyxFQUFFO2FBQzFCLENBQUM7U0FDRixDQUFDO0lBQ0gsQ0FBQztJQVpELDRFQVlDIn0=