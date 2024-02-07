/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languageFeatureRegistry", "vs/editor/common/services/languageFeatures", "vs/platform/instantiation/common/extensions"], function (require, exports, languageFeatureRegistry_1, languageFeatures_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageFeaturesService = void 0;
    class LanguageFeaturesService {
        constructor() {
            this.referenceProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.renameProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.codeActionProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.definitionProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.typeDefinitionProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.declarationProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.implementationProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentSymbolProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.inlayHintsProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.colorProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.codeLensProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentFormattingEditProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentRangeFormattingEditProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.onTypeFormattingEditProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.signatureHelpProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.hoverProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentHighlightProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.multiDocumentHighlightProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.selectionRangeProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.foldingRangeProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.linkProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.inlineCompletionsProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.completionProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.linkedEditingRangeProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.inlineValuesProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.evaluatableExpressionProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentRangeSemanticTokensProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentSemanticTokensProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentOnDropEditProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentPasteEditProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.mappedEditsProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
        }
        setNotebookTypeResolver(resolver) {
            this._notebookTypeResolver = resolver;
        }
        _score(uri) {
            return this._notebookTypeResolver?.(uri);
        }
    }
    exports.LanguageFeaturesService = LanguageFeaturesService;
    (0, extensions_1.registerSingleton)(languageFeatures_1.ILanguageFeaturesService, LanguageFeaturesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VGZWF0dXJlc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vc2VydmljZXMvbGFuZ3VhZ2VGZWF0dXJlc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsdUJBQXVCO1FBQXBDO1lBSVUsc0JBQWlCLEdBQUcsSUFBSSxpREFBdUIsQ0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRixtQkFBYyxHQUFHLElBQUksaURBQXVCLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckYsdUJBQWtCLEdBQUcsSUFBSSxpREFBdUIsQ0FBcUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3Rix1QkFBa0IsR0FBRyxJQUFJLGlEQUF1QixDQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdGLDJCQUFzQixHQUFHLElBQUksaURBQXVCLENBQXlCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckcsd0JBQW1CLEdBQUcsSUFBSSxpREFBdUIsQ0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMvRiwyQkFBc0IsR0FBRyxJQUFJLGlEQUF1QixDQUF5QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JHLDJCQUFzQixHQUFHLElBQUksaURBQXVCLENBQXlCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxD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