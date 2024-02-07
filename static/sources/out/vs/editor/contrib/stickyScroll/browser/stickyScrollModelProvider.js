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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/base/common/async", "vs/editor/contrib/folding/browser/folding", "vs/editor/contrib/folding/browser/syntaxRangeProvider", "vs/editor/contrib/folding/browser/indentRangeProvider", "vs/editor/common/languages/languageConfigurationRegistry", "vs/base/common/errors", "vs/editor/contrib/stickyScroll/browser/stickyScrollElement", "vs/base/common/iterator"], function (require, exports, lifecycle_1, languageFeatures_1, outlineModel_1, async_1, folding_1, syntaxRangeProvider_1, indentRangeProvider_1, languageConfigurationRegistry_1, errors_1, stickyScrollElement_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StickyModelProvider = void 0;
    var ModelProvider;
    (function (ModelProvider) {
        ModelProvider["OUTLINE_MODEL"] = "outlineModel";
        ModelProvider["FOLDING_PROVIDER_MODEL"] = "foldingProviderModel";
        ModelProvider["INDENTATION_MODEL"] = "indentationModel";
    })(ModelProvider || (ModelProvider = {}));
    var Status;
    (function (Status) {
        Status[Status["VALID"] = 0] = "VALID";
        Status[Status["INVALID"] = 1] = "INVALID";
        Status[Status["CANCELED"] = 2] = "CANCELED";
    })(Status || (Status = {}));
    let StickyModelProvider = class StickyModelProvider extends lifecycle_1.Disposable {
        constructor(_editor, _languageConfigurationService, _languageFeaturesService, defaultModel) {
            super();
            this._editor = _editor;
            this._languageConfigurationService = _languageConfigurationService;
            this._languageFeaturesService = _languageFeaturesService;
            this._modelProviders = [];
            this._modelPromise = null;
            this._updateScheduler = this._register(new async_1.Delayer(300));
            this._updateOperation = this._register(new lifecycle_1.DisposableStore());
            const stickyModelFromCandidateOutlineProvider = new StickyModelFromCandidateOutlineProvider(_languageFeaturesService);
            const stickyModelFromSyntaxFoldingProvider = new StickyModelFromCandidateSyntaxFoldingProvider(this._editor, _languageFeaturesService);
            const stickyModelFromIndentationFoldingProvider = new StickyModelFromCandidateIndentationFoldingProvider(this._editor, _languageConfigurationService);
            switch (defaultModel) {
                case ModelProvider.OUTLINE_MODEL:
                    this._modelProviders.push(stickyModelFromCandidateOutlineProvider);
                    this._modelProviders.push(stickyModelFromSyntaxFoldingProvider);
                    this._modelProviders.push(stickyModelFromIndentationFoldingProvider);
                    break;
                case ModelProvider.FOLDING_PROVIDER_MODEL:
                    this._modelProviders.push(stickyModelFromSyntaxFoldingProvider);
                    this._modelProviders.push(stickyModelFromIndentationFoldingProvider);
                    break;
                case ModelProvider.INDENTATION_MODEL:
                    this._modelProviders.push(stickyModelFromIndentationFoldingProvider);
                    break;
            }
        }
        _cancelModelPromise() {
            if (this._modelPromise) {
                this._modelPromise.cancel();
                this._modelPromise = null;
            }
        }
        async update(textModel, textModelVersionId, token) {
            this._updateOperation.clear();
            this._updateOperation.add({
                dispose: () => {
                    this._cancelModelPromise();
                    this._updateScheduler.cancel();
                }
            });
            this._cancelModelPromise();
            return await this._updateScheduler.trigger(async () => {
                for (const modelProvider of this._modelProviders) {
                    const { statusPromise, modelPromise } = modelProvider.computeStickyModel(textModel, textModelVersionId, token);
                    this._modelPromise = modelPromise;
                    const status = await statusPromise;
                    if (this._modelPromise !== modelPromise) {
                        return null;
                    }
                    switch (status) {
                        case Status.CANCELED:
                            this._updateOperation.clear();
                            return null;
                        case Status.VALID:
                            return modelProvider.stickyModel;
                    }
                }
                return null;
            }).catch((error) => {
                (0, errors_1.onUnexpectedError)(error);
                return null;
            });
        }
    };
    exports.StickyModelProvider = StickyModelProvider;
    exports.StickyModelProvider = StickyModelProvider = __decorate([
        __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(2, languageFeatures_1.ILanguageFeaturesService)
    ], StickyModelProvider);
    class StickyModelCandidateProvider {
        constructor() {
            this._stickyModel = null;
        }
        get stickyModel() {
            return this._stickyModel;
        }
        _invalid() {
            this._stickyModel = null;
            return Status.INVALID;
        }
        computeStickyModel(textModel, modelVersionId, token) {
            if (token.isCancellationRequested || !this.isProviderValid(textModel)) {
                return { statusPromise: this._invalid(), modelPromise: null };
            }
            const providerModelPromise = (0, async_1.createCancelablePromise)(token => this.createModelFromProvider(textModel, modelVersionId, token));
            return {
                statusPromise: providerModelPromise.then(providerModel => {
                    if (!this.isModelValid(providerModel)) {
                        return this._invalid();
                    }
                    if (token.isCancellationRequested) {
                        return Status.CANCELED;
                    }
                    this._stickyModel = this.createStickyModel(textModel, modelVersionId, token, providerModel);
                    return Status.VALID;
                }).then(undefined, (err) => {
                    (0, errors_1.onUnexpectedError)(err);
                    return Status.CANCELED;
                }),
                modelPromise: providerModelPromise
            };
        }
        /**
         * Method which checks whether the model returned by the provider is valid and can be used to compute a sticky model.
         * This method by default returns true.
         * @param model model returned by the provider
         * @returns boolean indicating whether the model is valid
         */
        isModelValid(model) {
            return true;
        }
        /**
         * Method which checks whether the provider is valid before applying it to find the provider model.
         * This method by default returns true.
         * @param textModel text-model of the editor
         * @returns boolean indicating whether the provider is valid
         */
        isProviderValid(textModel) {
            return true;
        }
    }
    let StickyModelFromCandidateOutlineProvider = class StickyModelFromCandidateOutlineProvider extends StickyModelCandidateProvider {
        constructor(_languageFeaturesService) {
            super();
            this._languageFeaturesService = _languageFeaturesService;
        }
        get provider() {
            return this._languageFeaturesService.documentSymbolProvider;
        }
        createModelFromProvider(textModel, modelVersionId, token) {
            return outlineModel_1.OutlineModel.create(this._languageFeaturesService.documentSymbolProvider, textModel, token);
        }
        createStickyModel(textModel, modelVersionId, token, model) {
            const { stickyOutlineElement, providerID } = this._stickyModelFromOutlineModel(model, this._stickyModel?.outlineProviderId);
            return new stickyScrollElement_1.StickyModel(textModel.uri, modelVersionId, stickyOutlineElement, providerID);
        }
        isModelValid(model) {
            return model && model.children.size > 0;
        }
        _stickyModelFromOutlineModel(outlineModel, preferredProvider) {
            let outlineElements;
            // When several possible outline providers
            if (iterator_1.Iterable.first(outlineModel.children.values()) instanceof outlineModel_1.OutlineGroup) {
                const provider = iterator_1.Iterable.find(outlineModel.children.values(), outlineGroupOfModel => outlineGroupOfModel.id === preferredProvider);
                if (provider) {
                    outlineElements = provider.children;
                }
                else {
                    let tempID = '';
                    let maxTotalSumOfRanges = -1;
                    let optimalOutlineGroup = undefined;
                    for (const [_key, outlineGroup] of outlineModel.children.entries()) {
                        const totalSumRanges = this._findSumOfRangesOfGroup(outlineGroup);
                        if (totalSumRanges > maxTotalSumOfRanges) {
                            optimalOutlineGroup = outlineGroup;
                            maxTotalSumOfRanges = totalSumRanges;
                            tempID = outlineGroup.id;
                        }
                    }
                    preferredProvider = tempID;
                    outlineElements = optimalOutlineGroup.children;
                }
            }
            else {
                outlineElements = outlineModel.children;
            }
            const stickyChildren = [];
            const outlineElementsArray = Array.from(outlineElements.values()).sort((element1, element2) => {
                const range1 = new stickyScrollElement_1.StickyRange(element1.symbol.range.startLineNumber, element1.symbol.range.endLineNumber);
                const range2 = new stickyScrollElement_1.StickyRange(element2.symbol.range.startLineNumber, element2.symbol.range.endLineNumber);
                return this._comparator(range1, range2);
            });
            for (const outlineElement of outlineElementsArray) {
                stickyChildren.push(this._stickyModelFromOutlineElement(outlineElement, outlineElement.symbol.selectionRange.startLineNumber));
            }
            const stickyOutlineElement = new stickyScrollElement_1.StickyElement(undefined, stickyChildren, undefined);
            return {
                stickyOutlineElement: stickyOutlineElement,
                providerID: preferredProvider
            };
        }
        _stickyModelFromOutlineElement(outlineElement, previousStartLine) {
            const children = [];
            for (const child of outlineElement.children.values()) {
                if (child.symbol.selectionRange.startLineNumber !== child.symbol.range.endLineNumber) {
                    if (child.symbol.selectionRange.startLineNumber !== previousStartLine) {
                        children.push(this._stickyModelFromOutlineElement(child, child.symbol.selectionRange.startLineNumber));
                    }
                    else {
                        for (const subchild of child.children.values()) {
                            children.push(this._stickyModelFromOutlineElement(subchild, child.symbol.selectionRange.startLineNumber));
                        }
                    }
                }
            }
            children.sort((child1, child2) => this._comparator(child1.range, child2.range));
            const range = new stickyScrollElement_1.StickyRange(outlineElement.symbol.selectionRange.startLineNumber, outlineElement.symbol.range.endLineNumber);
            return new stickyScrollElement_1.StickyElement(range, children, undefined);
        }
        _comparator(range1, range2) {
            if (range1.startLineNumber !== range2.startLineNumber) {
                return range1.startLineNumber - range2.startLineNumber;
            }
            else {
                return range2.endLineNumber - range1.endLineNumber;
            }
        }
        _findSumOfRangesOfGroup(outline) {
            let res = 0;
            for (const child of outline.children.values()) {
                res += this._findSumOfRangesOfGroup(child);
            }
            if (outline instanceof outlineModel_1.OutlineElement) {
                return res + outline.symbol.range.endLineNumber - outline.symbol.selectionRange.startLineNumber;
            }
            else {
                return res;
            }
        }
    };
    StickyModelFromCandidateOutlineProvider = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService)
    ], StickyModelFromCandidateOutlineProvider);
    class StickyModelFromCandidateFoldingProvider extends StickyModelCandidateProvider {
        constructor(editor) {
            super();
            this._foldingLimitReporter = new folding_1.RangesLimitReporter(editor);
        }
        createStickyModel(textModel, modelVersionId, token, model) {
            const foldingElement = this._fromFoldingRegions(model);
            return new stickyScrollElement_1.StickyModel(textModel.uri, modelVersionId, foldingElement, undefined);
        }
        isModelValid(model) {
            return model !== null;
        }
        _fromFoldingRegions(foldingRegions) {
            const length = foldingRegions.length;
            const orderedStickyElements = [];
            // The root sticky outline element
            const stickyOutlineElement = new stickyScrollElement_1.StickyElement(undefined, [], undefined);
            for (let i = 0; i < length; i++) {
                // Finding the parent index of the current range
                const parentIndex = foldingRegions.getParentIndex(i);
                let parentNode;
                if (parentIndex !== -1) {
                    // Access the reference of the parent node
                    parentNode = orderedStickyElements[parentIndex];
                }
                else {
                    // In that case the parent node is the root node
                    parentNode = stickyOutlineElement;
                }
                const child = new stickyScrollElement_1.StickyElement(new stickyScrollElement_1.StickyRange(foldingRegions.getStartLineNumber(i), foldingRegions.getEndLineNumber(i) + 1), [], parentNode);
                parentNode.children.push(child);
                orderedStickyElements.push(child);
            }
            return stickyOutlineElement;
        }
    }
    let StickyModelFromCandidateIndentationFoldingProvider = class StickyModelFromCandidateIndentationFoldingProvider extends StickyModelFromCandidateFoldingProvider {
        constructor(editor, _languageConfigurationService) {
            super(editor);
            this._languageConfigurationService = _languageConfigurationService;
        }
        get provider() {
            return null;
        }
        createModelFromProvider(textModel, modelVersionId, token) {
            const provider = new indentRangeProvider_1.IndentRangeProvider(textModel, this._languageConfigurationService, this._foldingLimitReporter);
            return provider.compute(token);
        }
    };
    StickyModelFromCandidateIndentationFoldingProvider = __decorate([
        __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], StickyModelFromCandidateIndentationFoldingProvider);
    let StickyModelFromCandidateSyntaxFoldingProvider = class StickyModelFromCandidateSyntaxFoldingProvider extends StickyModelFromCandidateFoldingProvider {
        constructor(editor, _languageFeaturesService) {
            super(editor);
            this._languageFeaturesService = _languageFeaturesService;
        }
        get provider() {
            return this._languageFeaturesService.foldingRangeProvider;
        }
        isProviderValid(textModel) {
            const selectedProviders = folding_1.FoldingController.getFoldingRangeProviders(this._languageFeaturesService, textModel);
            return selectedProviders.length > 0;
        }
        createModelFromProvider(textModel, modelVersionId, token) {
            const selectedProviders = folding_1.FoldingController.getFoldingRangeProviders(this._languageFeaturesService, textModel);
            const provider = new syntaxRangeProvider_1.SyntaxRangeProvider(textModel, selectedProviders, () => this.createModelFromProvider(textModel, modelVersionId, token), this._foldingLimitReporter, undefined);
            return provider.compute(token);
        }
    };
    StickyModelFromCandidateSyntaxFoldingProvider = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService)
    ], StickyModelFromCandidateSyntaxFoldingProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsTW9kZWxQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3RpY2t5U2Nyb2xsL2Jyb3dzZXIvc3RpY2t5U2Nyb2xsTW9kZWxQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQmhHLElBQUssYUFJSjtJQUpELFdBQUssYUFBYTtRQUNqQiwrQ0FBOEIsQ0FBQTtRQUM5QixnRUFBK0MsQ0FBQTtRQUMvQyx1REFBc0MsQ0FBQTtJQUN2QyxDQUFDLEVBSkksYUFBYSxLQUFiLGFBQWEsUUFJakI7SUFFRCxJQUFLLE1BSUo7SUFKRCxXQUFLLE1BQU07UUFDVixxQ0FBSyxDQUFBO1FBQ0wseUNBQU8sQ0FBQTtRQUNQLDJDQUFRLENBQUE7SUFDVCxDQUFDLEVBSkksTUFBTSxLQUFOLE1BQU0sUUFJVjtJQWNNLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7UUFPbEQsWUFDa0IsT0FBb0IsRUFDTiw2QkFBcUUsRUFDMUUsd0JBQTJELEVBQ3JGLFlBQW9CO1lBRXBCLEtBQUssRUFBRSxDQUFDO1lBTFMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNHLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7WUFDakUsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQVI5RSxvQkFBZSxHQUF5QyxFQUFFLENBQUM7WUFDM0Qsa0JBQWEsR0FBeUMsSUFBSSxDQUFDO1lBQzNELHFCQUFnQixHQUFnQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxDQUFxQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVGLHFCQUFnQixHQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFVMUYsTUFBTSx1Q0FBdUMs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