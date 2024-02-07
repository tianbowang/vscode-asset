/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/language", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions", "vs/workbench/contrib/snippets/browser/snippetPicker", "vs/workbench/contrib/snippets/browser/snippets", "vs/workbench/contrib/snippets/browser/snippetsFile"], function (require, exports, editorContextKeys_1, language_1, snippetController2_1, nls, clipboardService_1, instantiation_1, abstractSnippetsActions_1, snippetPicker_1, snippets_1, snippetsFile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InsertSnippetAction = void 0;
    class Args {
        static fromUser(arg) {
            if (!arg || typeof arg !== 'object') {
                return Args._empty;
            }
            let { snippet, name, langId } = arg;
            if (typeof snippet !== 'string') {
                snippet = undefined;
            }
            if (typeof name !== 'string') {
                name = undefined;
            }
            if (typeof langId !== 'string') {
                langId = undefined;
            }
            return new Args(snippet, name, langId);
        }
        static { this._empty = new Args(undefined, undefined, undefined); }
        constructor(snippet, name, langId) {
            this.snippet = snippet;
            this.name = name;
            this.langId = langId;
        }
    }
    class InsertSnippetAction extends abstractSnippetsActions_1.SnippetEditorAction {
        constructor() {
            super({
                id: 'editor.action.insertSnippet',
                title: {
                    value: nls.localize('snippet.suggestions.label', "Insert Snippet"),
                    original: 'Insert Snippet'
                },
                f1: true,
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                metadata: {
                    description: `Insert Snippet`,
                    args: [{
                            name: 'args',
                            schema: {
                                'type': 'object',
                                'properties': {
                                    'snippet': {
                                        'type': 'string'
                                    },
                                    'langId': {
                                        'type': 'string',
                                    },
                                    'name': {
                                        'type': 'string'
                                    }
                                },
                            }
                        }]
                }
            });
        }
        async runEditorCommand(accessor, editor, arg) {
            const languageService = accessor.get(language_1.ILanguageService);
            const snippetService = accessor.get(snippets_1.ISnippetsService);
            if (!editor.hasModel()) {
                return;
            }
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const snippet = await new Promise((resolve, reject) => {
                const { lineNumber, column } = editor.getPosition();
                const { snippet, name, langId } = Args.fromUser(arg);
                if (snippet) {
                    return resolve(new snippetsFile_1.Snippet(false, [], '', '', '', snippet, '', 1 /* SnippetSource.User */, `random/${Math.random()}`));
                }
                let languageId;
                if (langId) {
                    if (!languageService.isRegisteredLanguageId(langId)) {
                        return resolve(undefined);
                    }
                    languageId = langId;
                }
                else {
                    editor.getModel().tokenization.tokenizeIfCheap(lineNumber);
                    languageId = editor.getModel().getLanguageIdAtPosition(lineNumber, column);
                    // validate the `languageId` to ensure this is a user
                    // facing language with a name and the chance to have
                    // snippets, else fall back to the outer language
                    if (!languageService.getLanguageName(languageId)) {
                        languageId = editor.getModel().getLanguageId();
                    }
                }
                if (name) {
                    // take selected snippet
                    snippetService.getSnippets(languageId, { includeNoPrefixSnippets: true })
                        .then(snippets => snippets.find(snippet => snippet.name === name))
                        .then(resolve, reject);
                }
                else {
                    // let user pick a snippet
                    resolve(instaService.invokeFunction(snippetPicker_1.pickSnippet, languageId));
                }
            });
            if (!snippet) {
                return;
            }
            let clipboardText;
            if (snippet.needsClipboard) {
                clipboardText = await clipboardService.readText();
            }
            editor.focus();
            snippetController2_1.SnippetController2.get(editor)?.insert(snippet.codeSnippet, { clipboardText });
            snippetService.updateUsageTimestamp(snippet);
        }
    }
    exports.InsertSnippetAction = InsertSnippetAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zZXJ0U25pcHBldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc25pcHBldHMvYnJvd3Nlci9jb21tYW5kcy9pbnNlcnRTbmlwcGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyxNQUFNLElBQUk7UUFFVCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQVE7WUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDckMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3BCLENBQUM7WUFDRCxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDcEMsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDakMsT0FBTyxHQUFHLFNBQVMsQ0FBQztZQUNyQixDQUFDO1lBQ0QsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxHQUFHLFNBQVMsQ0FBQztZQUNsQixDQUFDO1lBQ0QsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDaEMsTUFBTSxHQUFHLFNBQVMsQ0FBQztZQUNwQixDQUFDO1lBQ0QsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLENBQUM7aUJBRXVCLFdBQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTNFLFlBQ2lCLE9BQTJCLEVBQzNCLElBQXdCLEVBQ3hCLE1BQTBCO1lBRjFCLFlBQU8sR0FBUCxPQUFPLENBQW9CO1lBQzNCLFNBQUksR0FBSixJQUFJLENBQW9CO1lBQ3hCLFdBQU0s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