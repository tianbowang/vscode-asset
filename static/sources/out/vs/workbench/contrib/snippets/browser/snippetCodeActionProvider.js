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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/selection", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/codeAction/common/types", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets", "vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet", "./snippets"], function (require, exports, lifecycle_1, selection_1, languageFeatures_1, types_1, nls_1, configuration_1, instantiation_1, fileTemplateSnippets_1, surroundWithSnippet_1, snippets_1) {
    "use strict";
    var SurroundWithSnippetCodeActionProvider_1, FileTemplateCodeActionProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnippetCodeActions = void 0;
    let SurroundWithSnippetCodeActionProvider = class SurroundWithSnippetCodeActionProvider {
        static { SurroundWithSnippetCodeActionProvider_1 = this; }
        static { this._MAX_CODE_ACTIONS = 4; }
        static { this._overflowCommandCodeAction = {
            kind: types_1.CodeActionKind.SurroundWith.value,
            title: surroundWithSnippet_1.SurroundWithSnippetEditorAction.options.title.value,
            command: {
                id: surroundWithSnippet_1.SurroundWithSnippetEditorAction.options.id,
                title: surroundWithSnippet_1.SurroundWithSnippetEditorAction.options.title.value,
            },
        }; }
        constructor(_snippetService) {
            this._snippetService = _snippetService;
        }
        async provideCodeActions(model, range) {
            if (range.isEmpty()) {
                return undefined;
            }
            const position = selection_1.Selection.isISelection(range) ? range.getPosition() : range.getStartPosition();
            const snippets = await (0, surroundWithSnippet_1.getSurroundableSnippets)(this._snippetService, model, position, false);
            if (!snippets.length) {
                return undefined;
            }
            const actions = [];
            for (const snippet of snippets) {
                if (actions.length >= SurroundWithSnippetCodeActionProvider_1._MAX_CODE_ACTIONS) {
                    actions.push(SurroundWithSnippetCodeActionProvider_1._overflowCommandCodeAction);
                    break;
                }
                actions.push({
                    title: (0, nls_1.localize)('codeAction', "{0}", snippet.name),
                    kind: types_1.CodeActionKind.SurroundWith.value,
                    edit: asWorkspaceEdit(model, range, snippet)
                });
            }
            return {
                actions,
                dispose() { }
            };
        }
    };
    SurroundWithSnippetCodeActionProvider = SurroundWithSnippetCodeActionProvider_1 = __decorate([
        __param(0, snippets_1.ISnippetsService)
    ], SurroundWithSnippetCodeActionProvider);
    let FileTemplateCodeActionProvider = class FileTemplateCodeActionProvider {
        static { FileTemplateCodeActionProvider_1 = this; }
        static { this._MAX_CODE_ACTIONS = 4; }
        static { this._overflowCommandCodeAction = {
            title: (0, nls_1.localize)('overflow.start.title', 'Start with Snippet'),
            kind: types_1.CodeActionKind.SurroundWith.value,
            command: {
                id: fileTemplateSnippets_1.ApplyFileSnippetAction.Id,
                title: ''
            }
        }; }
        constructor(_snippetService) {
            this._snippetService = _snippetService;
            this.providedCodeActionKinds = [types_1.CodeActionKind.SurroundWith.value];
        }
        async provideCodeActions(model) {
            if (model.getValueLength() !== 0) {
                return undefined;
            }
            const snippets = await this._snippetService.getSnippets(model.getLanguageId(), { fileTemplateSnippets: true, includeNoPrefixSnippets: true });
            const actions = [];
            for (const snippet of snippets) {
                if (actions.length >= FileTemplateCodeActionProvider_1._MAX_CODE_ACTIONS) {
                    actions.push(FileTemplateCodeActionProvider_1._overflowCommandCodeAction);
                    break;
                }
                actions.push({
                    title: (0, nls_1.localize)('title', 'Start with: {0}', snippet.name),
                    kind: types_1.CodeActionKind.SurroundWith.value,
                    edit: asWorkspaceEdit(model, model.getFullModelRange(), snippet)
                });
            }
            return {
                actions,
                dispose() { }
            };
        }
    };
    FileTemplateCodeActionProvider = FileTemplateCodeActionProvider_1 = __decorate([
        __param(0, snippets_1.ISnippetsService)
    ], FileTemplateCodeActionProvider);
    function asWorkspaceEdit(model, range, snippet) {
        return {
            edits: [{
                    versionId: model.getVersionId(),
                    resource: model.uri,
                    textEdit: {
                        range,
                        text: snippet.body,
                        insertAsSnippet: true,
                    }
                }]
        };
    }
    let SnippetCodeActions = class SnippetCodeActions {
        constructor(instantiationService, languageFeaturesService, configService) {
            this._store = new lifecycle_1.DisposableStore();
            const setting = 'editor.snippets.codeActions.enabled';
            const sessionStore = new lifecycle_1.DisposableStore();
            const update = () => {
                sessionStore.clear();
                if (configService.getValue(setting)) {
                    sessionStore.add(languageFeaturesService.codeActionProvider.register('*', instantiationService.createInstance(SurroundWithSnippetCodeActionProvider)));
                    sessionStore.add(languageFeaturesService.codeActionProvider.register('*', instantiationService.createInstance(FileTemplateCodeActionProvider)));
                }
            };
            update();
            this._store.add(configService.onDidChangeConfiguration(e => e.affectsConfiguration(setting) && update()));
            this._store.add(sessionStore);
        }
        dispose() {
            this._store.dispose();
        }
    };
    exports.SnippetCodeActions = SnippetCodeActions;
    exports.SnippetCodeActions = SnippetCodeActions = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, configuration_1.IConfigurationService)
    ], SnippetCodeActions);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldENvZGVBY3Rpb25Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc25pcHBldHMvYnJvd3Nlci9zbmlwcGV0Q29kZUFjdGlvblByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFrQmhHLElBQU0scUNBQXFDLEdBQTNDLE1BQU0scUNBQXFDOztpQkFFbEIsc0JBQWlCLEdBQUcsQ0FBQyxBQUFKLENBQUs7aUJBRXRCLCtCQUEwQixHQUFlO1lBQ2hFLElBQUksRUFBRSxzQkFBYyxDQUFDLFlBQVksQ0FBQyxLQUFLO1lBQ3ZDLEtBQUssRUFBRSxxREFBK0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUs7WUFDMUQsT0FBTyxFQUFFO2dCQUNSLEVBQUUsRUFBRSxxREFBK0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDOUMsS0FBSyxFQUFFLHFEQUErQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSzthQUMxRDtTQUNELEFBUGlELENBT2hEO1FBRUYsWUFBK0MsZUFBaUM7WUFBakMsb0JBQWUsR0FBZixlQUFlLENBQWtCO1FBQUksQ0FBQztRQUVyRixLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBaUIsRUFBRSxLQUF3QjtZQUVuRSxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO2dCQUNyQixPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDO1lBRUQsTUFBTSxRQUFRLEdBQUcscUJBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDaEcsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDZDQUF1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