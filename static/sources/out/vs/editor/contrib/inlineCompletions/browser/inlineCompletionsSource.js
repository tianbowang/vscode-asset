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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/position", "vs/editor/common/languages", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/inlineCompletions/browser/provideInlineCompletions", "vs/editor/contrib/inlineCompletions/browser/singleTextEdit"], function (require, exports, cancellation_1, filters_1, lifecycle_1, observable_1, position_1, languages_1, languageConfigurationRegistry_1, languageFeatures_1, provideInlineCompletions_1, singleTextEdit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionWithUpdatedRange = exports.UpToDateInlineCompletions = exports.InlineCompletionsSource = void 0;
    /* hot-reload:patch-prototype-methods */
    let InlineCompletionsSource = class InlineCompletionsSource extends lifecycle_1.Disposable {
        constructor(textModel, versionId, _debounceValue, languageFeaturesService, languageConfigurationService) {
            super();
            this.textModel = textModel;
            this.versionId = versionId;
            this._debounceValue = _debounceValue;
            this.languageFeaturesService = languageFeaturesService;
            this.languageConfigurationService = languageConfigurationService;
            this._updateOperation = this._register(new lifecycle_1.MutableDisposable());
            this.inlineCompletions = (0, observable_1.disposableObservableValue)('inlineCompletions', undefined);
            this.suggestWidgetInlineCompletions = (0, observable_1.disposableObservableValue)('suggestWidgetInlineCompletions', undefined);
            this._register(this.textModel.onDidChangeContent(() => {
                this._updateOperation.clear();
            }));
        }
        fetch(position, context, activeInlineCompletion) {
            const request = new UpdateRequest(position, context, this.textModel.getVersionId());
            const target = context.selectedSuggestionInfo ? this.suggestWidgetInlineCompletions : this.inlineCompletions;
            if (this._updateOperation.value?.request.satisfies(request)) {
                return this._updateOperation.value.promise;
            }
            else if (target.get()?.request.satisfies(request)) {
                return Promise.resolve(true);
            }
            const updateOngoing = !!this._updateOperation.value;
            this._updateOperation.clear();
            const source = new cancellation_1.CancellationTokenSource();
            const promise = (async () => {
                const shouldDebounce = updateOngoing || context.triggerKind === languages_1.InlineCompletionTriggerKind.Automatic;
                if (shouldDebounce) {
                    // This debounces the operation
                    await wait(this._debounceValue.get(this.textModel));
                }
                if (source.token.isCancellationRequested || this.textModel.getVersionId() !== request.versionId) {
                    return false;
                }
                const startTime = new Date();
                const updatedCompletions = await (0, provideInlineCompletions_1.provideInlineCompletions)(this.languageFeaturesService.inlineCompletionsProvider, position, this.textModel, context, source.token, this.languageConfigurationService);
                if (source.token.isCancellationRequested || this.textModel.getVersionId() !== request.versionId) {
                    return false;
                }
                const endTime = new Date();
                this._debounceValue.update(this.textModel, endTime.getTime() - startTime.getTime());
                const completions = new UpToDateInlineCompletions(updatedCompletions, request, this.textModel, this.versionId);
                if (activeInlineCompletion) {
                    const asInlineCompletion = activeInlineCompletion.toInlineCompletion(undefined);
                    if (activeInlineCompletion.canBeReused(this.textModel, position) && !updatedCompletions.has(asInlineCompletion)) {
                        completions.prepend(activeInlineCompletion.inlineCompletion, asInlineCompletion.range, true);
                    }
                }
                this._updateOperation.clear();
                (0, observable_1.transaction)(tx => {
                    /** @description Update completions with provider result */
                    target.set(completions, tx);
                });
                return true;
            })();
            const updateOperation = new UpdateOperation(request, source, promise);
            this._updateOperation.value = updateOperation;
            return promise;
        }
        clear(tx) {
            this._updateOperation.clear();
            this.inlineCompletions.set(undefined, tx);
            this.suggestWidgetInlineCompletions.set(undefined, tx);
        }
        clearSuggestWidgetInlineCompletions(tx) {
            if (this._updateOperation.value?.request.context.selectedSuggestionInfo) {
                this._updateOperation.clear();
            }
            this.suggestWidgetInlineCompletions.set(undefined, tx);
        }
        cancelUpdate() {
            this._updateOperation.clear();
        }
    };
    exports.InlineCompletionsSource = InlineCompletionsSource;
    exports.InlineCompletionsSource = InlineCompletionsSource = __decorate([
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], InlineCompletionsSource);
    function wait(ms, cancellationToken) {
        return new Promise(resolve => {
            let d = undefined;
            const handle = setTimeout(() => {
                if (d) {
                    d.dispose();
                }
                resolve();
            }, ms);
            if (cancellationToken) {
                d = cancellationToken.onCancellationRequested(() => {
                    clearTimeout(handle);
                    if (d) {
                        d.dispose();
                    }
                    resolve();
                });
            }
        });
    }
    class UpdateRequest {
        constructor(position, context, versionId) {
            this.position = position;
            this.context = context;
            this.versionId = versionId;
        }
        satisfies(other) {
            return this.position.equals(other.position)
                && equals(this.context.selectedSuggestionInfo, other.context.selectedSuggestionInfo, (v1, v2) => v1.equals(v2))
                && (other.context.triggerKind === languages_1.InlineCompletionTriggerKind.Automatic
                    || this.context.triggerKind === languages_1.InlineCompletionTriggerKind.Explicit)
                && this.versionId === other.versionId;
        }
    }
    function equals(v1, v2, equals) {
        if (!v1 || !v2) {
            return v1 === v2;
        }
        return equals(v1, v2);
    }
    class UpdateOperation {
        constructor(request, cancellationTokenSource, promise) {
            this.request = request;
            this.cancellationTokenSource = cancellationTokenSource;
            this.promise = promise;
        }
        dispose() {
            this.cancellationTokenSource.cancel();
        }
    }
    class UpToDateInlineCompletions {
        get inlineCompletions() { return this._inlineCompletions; }
        constructor(inlineCompletionProviderResult, request, textModel, versionId) {
            this.inlineCompletionProviderResult = inlineCompletionProviderResult;
            this.request = request;
            this.textModel = textModel;
            this.versionId = versionId;
            this._refCount = 1;
            this._prependedInlineCompletionItems = [];
            this._rangeVersionIdValue = 0;
            this._rangeVersionId = (0, observable_1.derived)(this, reader => {
                this.versionId.read(reader);
                let changed = false;
                for (const i of this._inlineCompletions) {
                    changed = changed || i._updateRange(this.textModel);
                }
                if (changed) {
                    this._rangeVersionIdValue++;
                }
                return this._rangeVersionIdValue;
            });
            const ids = textModel.deltaDecorations([], inlineCompletionProviderResult.completions.map(i => ({
                range: i.range,
                options: {
                    description: 'inline-completion-tracking-range'
                },
            })));
            this._inlineCompletions = inlineCompletionProviderResult.completions.map((i, index) => new InlineCompletionWithUpdatedRange(i, ids[index], this._rangeVersionId));
        }
        clone() {
            this._refCount++;
            return this;
        }
        dispose() {
            this._refCount--;
            if (this._refCount === 0) {
                setTimeout(() => {
                    // To fix https://github.com/microsoft/vscode/issues/188348
                    if (!this.textModel.isDisposed()) {
                        // This is just cleanup. It's ok if it happens with a delay.
                        this.textModel.deltaDecorations(this._inlineCompletions.map(i => i.decorationId), []);
                    }
                }, 0);
                this.inlineCompletionProviderResult.dispose();
                for (const i of this._prependedInlineCompletionItems) {
                    i.source.removeRef();
                }
            }
        }
        prepend(inlineCompletion, range, addRefToSource) {
            if (addRefToSource) {
                inlineCompletion.source.addRef();
            }
            const id = this.textModel.deltaDecorations([], [{
                    range,
                    options: {
                        description: 'inline-completion-tracking-range'
                    },
                }])[0];
            this._inlineCompletions.unshift(new InlineCompletionWithUpdatedRange(inlineCompletion, id, this._rangeVersionId, range));
            this._prependedInlineCompletionItems.push(inlineCompletion);
        }
    }
    exports.UpToDateInlineCompletions = UpToDateInlineCompletions;
    class InlineCompletionWithUpdatedRange {
        get forwardStable() {
            return this.inlineCompletion.source.inlineCompletions.enableForwardStability ?? false;
        }
        constructor(inlineCompletion, decorationId, rangeVersion, initialRange) {
            this.inlineCompletion = inlineCompletion;
            this.decorationId = decorationId;
            this.rangeVersion = rangeVersion;
            this.semanticId = JSON.stringify([
                this.inlineCompletion.filterText,
                this.inlineCompletion.insertText,
                this.inlineCompletion.range.getStartPosition().toString()
            ]);
            this._isValid = true;
            this._updatedRange = initialRange ?? inlineCompletion.range;
        }
        toInlineCompletion(reader) {
            return this.inlineCompletion.withRange(this._getUpdatedRange(reader));
        }
        toSingleTextEdit(reader) {
            return new singleTextEdit_1.SingleTextEdit(this._getUpdatedRange(reader), this.inlineCompletion.insertText);
        }
        isVisible(model, cursorPosition, reader) {
            const minimizedReplacement = this._toFilterTextReplacement(reader).removeCommonPrefix(model);
            if (!this._isValid
                || !this.inlineCompletion.range.getStartPosition().equals(this._getUpdatedRange(reader).getStartPosition())
                || cursorPosition.lineNumber !== minimizedReplacement.range.startLineNumber) {
                return false;
            }
            // We might consider comparing by .toLowerText, but this requires GhostTextReplacement
            const originalValue = model.getValueInRange(minimizedReplacement.range, 1 /* EndOfLinePreference.LF */);
            const filterText = minimizedReplacement.text;
            const cursorPosIndex = Math.max(0, cursorPosition.column - minimizedReplacement.range.startColumn);
            let filterTextBefore = filterText.substring(0, cursorPosIndex);
            let filterTextAfter = filterText.substring(cursorPosIndex);
            let originalValueBefore = originalValue.substring(0, cursorPosIndex);
            let originalValueAfter = originalValue.substring(cursorPosIndex);
            const originalValueIndent = model.getLineIndentColumn(minimizedReplacement.range.startLineNumber);
            if (minimizedReplacement.range.startColumn <= originalValueIndent) {
                // Remove indentation
                originalValueBefore = originalValueBefore.trimStart();
                if (originalValueBefore.length === 0) {
                    originalValueAfter = originalValueAfter.trimStart();
                }
                filterTextBefore = filterTextBefore.trimStart();
                if (filterTextBefore.length === 0) {
                    filterTextAfter = filterTextAfter.trimStart();
                }
            }
            return filterTextBefore.startsWith(originalValueBefore)
                && !!(0, filters_1.matchesSubString)(originalValueAfter, filterTextAfter);
        }
        canBeReused(model, position) {
            const result = this._isValid
                && this._getUpdatedRange(undefined).containsPosition(position)
                && this.isVisible(model, position, undefined)
                && !this._isSmallerThanOriginal(undefined);
            return result;
        }
        _toFilterTextReplacement(reader) {
            return new singleTextEdit_1.SingleTextEdit(this._getUpdatedRange(reader), this.inlineCompletion.filterText);
        }
        _isSmallerThanOriginal(reader) {
            return length(this._getUpdatedRange(reader)).isBefore(length(this.inlineCompletion.range));
        }
        _getUpdatedRange(reader) {
            this.rangeVersion.read(reader); // This makes sure all the ranges are updated.
            return this._updatedRange;
        }
        _updateRange(textModel) {
            const range = textModel.getDecorationRange(this.decorationId);
            if (!range) {
                // A setValue call might flush all decorations.
                this._isValid = false;
                return true;
            }
            if (!this._updatedRange.equalsRange(range)) {
                this._updatedRange = range;
                return true;
            }
            return false;
        }
    }
    exports.InlineCompletionWithUpdatedRange = InlineCompletionWithUpdatedRange;
    function length(range) {
        if (range.startLineNumber === range.endLineNumber) {
            return new position_1.Position(1, 1 + range.endColumn - range.startColumn);
        }
        else {
            return new position_1.Position(1 + range.endLineNumber - range.startLineNumber, range.endColumn);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbnNTb3VyY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGluZUNvbXBsZXRpb25zL2Jyb3dzZXIvaW5saW5lQ29tcGxldGlvbnNTb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0JoRyx3Q0FBd0M7SUFFakMsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSxzQkFBVTtRQUt0RCxZQUNrQixTQUFxQixFQUNyQixTQUE4QixFQUM5QixjQUEyQyxFQUNsQyx1QkFBa0UsRUFDN0QsNEJBQTRFO1lBRTNHLEtBQUssRUFBRSxDQUFDO1lBTlMsY0FBUyxHQUFULFNBQVMsQ0FBWTtZQUNyQixjQUFTLEdBQVQsU0FBUyxDQUFxQjtZQUM5QixtQkFBYyxHQUFkLGNBQWMsQ0FBNkI7WUFDakIsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUM1QyxpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQStCO1lBVDNGLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBbUIsQ0FBQyxDQUFDO1lBQzdFLHNCQUFpQixHQUFHLElBQUEsc0NBQXlCLEVBQXdDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3JILG1DQUE4QixHQUFHLElBQUEsc0NBQXlCLEVBQXdDLGdDQUFnQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBVzlKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3JELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVNLEtBQUssQ0FBQyxRQUFrQixFQUFF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