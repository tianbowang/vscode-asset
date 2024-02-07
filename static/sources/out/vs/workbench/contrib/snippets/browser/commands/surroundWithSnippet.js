/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorContextKeys", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/workbench/contrib/snippets/browser/snippetPicker", "../snippets"], function (require, exports, editorContextKeys_1, snippetController2_1, nls_1, clipboardService_1, contextkey_1, instantiation_1, abstractSnippetsActions_1, snippetPicker_1, snippets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SurroundWithSnippetEditorAction = exports.getSurroundableSnippets = void 0;
    async function getSurroundableSnippets(snippetsService, model, position, includeDisabledSnippets) {
        const { lineNumber, column } = position;
        model.tokenization.tokenizeIfCheap(lineNumber);
        const languageId = model.getLanguageIdAtPosition(lineNumber, column);
        const allSnippets = await snippetsService.getSnippets(languageId, { includeNoPrefixSnippets: true, includeDisabledSnippets });
        return allSnippets.filter(snippet => snippet.usesSelection);
    }
    exports.getSurroundableSnippets = getSurroundableSnippets;
    class SurroundWithSnippetEditorAction extends abstractSnippetsActions_1.SnippetEditorAction {
        static { this.options = {
            id: 'editor.action.surroundWithSnippet',
            title: {
                value: (0, nls_1.localize)('label', 'More...'),
                original: 'More...'
            }
        }; }
        constructor() {
            super({
                ...SurroundWithSnippetEditorAction.options,
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasNonEmptySelection),
                f1: true,
            });
        }
        async runEditorCommand(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const snippetsService = accessor.get(snippets_1.ISnippetsService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const snippets = await getSurroundableSnippets(snippetsService, editor.getModel(), editor.getPosition(), true);
            if (!snippets.length) {
                return;
            }
            const snippet = await instaService.invokeFunction(snippetPicker_1.pickSnippet, snippets);
            if (!snippet) {
                return;
            }
            let clipboardText;
            if (snippet.needsClipboard) {
                clipboardText = await clipboardService.readText();
            }
            editor.focus();
            snippetController2_1.SnippetController2.get(editor)?.insert(snippet.codeSnippet, { clipboardText });
            snippetsService.updateUsageTimestamp(snippet);
        }
    }
    exports.SurroundWithSnippetEditorAction = SurroundWithSnippetEditorAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vycm91bmRXaXRoU25pcHBldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc25pcHBldHMvYnJvd3Nlci9jb21tYW5kcy9zdXJyb3VuZFdpdGhTbmlwcGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdCekYsS0FBSyxVQUFVLHVCQUF1QixDQUFDLGVBQWlDLEVBQUUsS0FBaUIsRUFBRSxRQUFrQixFQUFFLHVCQUFnQztRQUV2SixNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQztRQUN4QyxLQUFLLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvQyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXJFLE1BQU0sV0FBVyxHQUFHLE1BQU0sZUFBZSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO1FBQzlILE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBUkQsMERBUUM7SUFFRCxNQUFhLCtCQUFnQyxTQUFRLDZDQUFtQjtpQkFFdkQsWUFBTyxHQUFHO1lBQ3pCLEVBQUUsRUFBRSxtQ0FBbUM7WUFDdkMsS0FBSyxFQUFFO2dCQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO2dCQUNuQyxRQUFRLEVBQUUsU0FBUzthQUNuQjtTQUNELENBQUM7UUFFRjtZQUNDLEtBQUssQ0FBQztnQkFDTCxHQUFHLCtCQUErQixDQUFDLE9BQU87Z0JBQzFDLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FDL0IscUNBQWlCLENBQUMsUUFBUSxFQUMxQixxQ0FBaUIsQ0FBQyxvQkFBb0IsQ0FDdEM7Z0JBQ0QsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQTBCLEVBQUUsTUFBbUI7WUFDckUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO2dCQUN4QixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztZQUN6RCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7WUFDdkQsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7WUFFekQsTUFBTSxRQUFRLEdBQUcsTUFBTSx1QkFBdUIsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN0QixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLGNBQWMsQ0FBQywyQkFBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZCxPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUksYUFBaUMsQ0FBQztZQUN0QyxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDNUIsYUFBYSxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkQsQ0FBQztZQUVELE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNmLHVDQUFrQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFDL0UsZUFBZSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLENBQUM7O0lBaERGLDBFQWlEQyJ9