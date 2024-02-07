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
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/types", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/inlineCompletions/browser/ghostText", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsSource", "vs/editor/contrib/inlineCompletions/browser/utils", "vs/editor/contrib/snippet/browser/snippetController2", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation"], function (require, exports, arraysFind_1, errors_1, lifecycle_1, observable_1, types_1, editOperation_1, position_1, range_1, languages_1, languageConfigurationRegistry_1, ghostText_1, inlineCompletionsSource_1, utils_1, snippetController2_1, commands_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionsModel = exports.VersionIdChangeReason = void 0;
    var VersionIdChangeReason;
    (function (VersionIdChangeReason) {
        VersionIdChangeReason[VersionIdChangeReason["Undo"] = 0] = "Undo";
        VersionIdChangeReason[VersionIdChangeReason["Redo"] = 1] = "Redo";
        VersionIdChangeReason[VersionIdChangeReason["AcceptWord"] = 2] = "AcceptWord";
        VersionIdChangeReason[VersionIdChangeReason["Other"] = 3] = "Other";
    })(VersionIdChangeReason || (exports.VersionIdChangeReason = VersionIdChangeReason = {}));
    let InlineCompletionsModel = class InlineCompletionsModel extends lifecycle_1.Disposable {
        get isAcceptingPartially() { return this._isAcceptingPartially; }
        constructor(textModel, selectedSuggestItem, cursorPosition, textModelVersionId, _debounceValue, _suggestPreviewEnabled, _suggestPreviewMode, _inlineSuggestMode, _enabled, _instantiationService, _commandService, _languageConfigurationService) {
            super();
            this.textModel = textModel;
            this.selectedSuggestItem = selectedSuggestItem;
            this.cursorPosition = cursorPosition;
            this.textModelVersionId = textModelVersionId;
            this._debounceValue = _debounceValue;
            this._suggestPreviewEnabled = _suggestPreviewEnabled;
            this._suggestPreviewMode = _suggestPreviewMode;
            this._inlineSuggestMode = _inlineSuggestMode;
            this._enabled = _enabled;
            this._instantiationService = _instantiationService;
            this._commandService = _commandService;
            this._languageConfigurationService = _languageConfigurationService;
            this._source = this._register(this._instantiationService.createInstance(inlineCompletionsSource_1.InlineCompletionsSource, this.textModel, this.textModelVersionId, this._debounceValue));
            this._isActive = (0, observable_1.observableValue)(this, false);
            this._forceUpdateSignal = (0, observable_1.observableSignal)('forceUpdate');
            // We use a semantic id to keep the same inline completion selected even if the provider reorders the completions.
            this._selectedInlineCompletionId = (0, observable_1.observableValue)(this, undefined);
            this._isAcceptingPartially = false;
            this._preserveCurrentCompletionReasons = new Set([
                VersionIdChangeReason.Redo,
                VersionIdChangeReason.Undo,
                VersionIdChangeReason.AcceptWord,
            ]);
            this._fetchInlineCompletions = (0, observable_1.derivedHandleChanges)({
                owner: this,
                createEmptyChangeSummary: () => ({
                    preserveCurrentCompletion: false,
                    inlineCompletionTriggerKind: languages_1.InlineCompletionTriggerKind.Automatic
                }),
                handleChange: (ctx, changeSummary) => {
                    /** @description fetch inline completions */
                    if (ctx.didChange(this.textModelVersionId) && this._preserveCurrentCompletionReasons.has(ctx.change)) {
                        changeSummary.preserveCurrentCompletion = true;
                    }
                    else if (ctx.didChange(this._forceUpdateSignal)) {
                        changeSummary.inlineCompletionTriggerKind = ctx.change;
                    }
                    return true;
                },
            }, (reader, changeSummary) => {
                this._forceUpdateSignal.read(reader);
                const shouldUpdate = (this._enabled.read(reader) && this.selectedSuggestItem.read(reader)) || this._isActive.read(reader);
                if (!shouldUpdate) {
                    this._source.cancelUpdate();
                    return undefined;
                }
                this.textModelVersionId.read(reader); // Refetch on text change
                const itemToPreserveCandidate = this.selectedInlineCompletion.get();
                const itemToPreserve = changeSummary.preserveCurrentCompletion || itemToPreserveCandidate?.forwardStable
                    ? itemToPreserveCandidate : undefined;
                const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.get();
                const suggestItem = this.selectedSuggestItem.read(reader);
                if (suggestWidgetInlineCompletions && !suggestItem) {
                    const inlineCompletions = this._source.inlineCompletions.get();
                    (0, observable_1.transaction)(tx => {
                        /** @description Seed inline completions with (newer) suggest widget inline completions */
                        if (!inlineCompletions || suggestWidgetInlineCompletions.request.versionId > inlineCompletions.request.versionId) {
                            this._source.inlineCompletions.set(suggestWidgetInlineCompletions.clone(), tx);
                        }
                        this._source.clearSuggestWidgetInlineCompletions(tx);
                    });
                }
                const cursorPosition = this.cursorPosition.read(reader);
                const context = {
                    triggerKind: changeSummary.inlineCompletionTriggerKind,
                    selectedSuggestionInfo: suggestItem?.toSelectedSuggestionInfo(),
                };
                return this._source.fetch(cursorPosition, context, itemToPreserve);
            });
            this._filteredInlineCompletionItems = (0, observable_1.derived)(this, reader => {
                const c = this._source.inlineCompletions.read(reader);
                if (!c) {
                    return [];
                }
                const cursorPosition = this.cursorPosition.read(reader);
                const filteredCompletions = c.inlineCompletions.filter(c => c.isVisible(this.textModel, cursorPosition, reader));
                return filteredCompletions;
            });
            this.selectedInlineCompletionIndex = (0, observable_1.derived)(this, (reader) => {
                const selectedInlineCompletionId = this._selectedInlineCompletionId.read(reader);
                const filteredCompletions = this._filteredInlineCompletionItems.read(reader);
                const idx = this._selectedInlineCompletionId === undefined ? -1
                    : filteredCompletions.findIndex(v => v.semanticId === selectedInlineCompletionId);
                if (idx === -1) {
                    // Reset the selection so that the selection does not jump back when it appears again
                    this._selectedInlineCompletionId.set(undefined, undefined);
                    return 0;
                }
                return idx;
            });
            this.selectedInlineCompletion = (0, observable_1.derived)(this, (reader) => {
                const filteredCompletions = this._filteredInlineCompletionItems.read(reader);
                const idx = this.selectedInlineCompletionIndex.read(reader);
                return filteredCompletions[idx];
            });
            this.lastTriggerKind = this._source.inlineCompletions.map(this, v => v?.request.context.triggerKind);
            this.inlineCompletionsCount = (0, observable_1.derived)(this, reader => {
                if (this.lastTriggerKind.read(reader) === languages_1.InlineCompletionTriggerKind.Explicit) {
                    return this._filteredInlineCompletionItems.read(reader).length;
                }
                else {
                    return undefined;
                }
            });
            this.state = (0, observable_1.derivedOpts)({
                owner: this,
                equalityComparer: (a, b) => {
                    if (!a || !b) {
                        return a === b;
                    }
                    return (0, ghostText_1.ghostTextOrReplacementEquals)(a.ghostText, b.ghostText)
                        && a.inlineCompletion === b.inlineCompletion
                        && a.suggestItem === b.suggestItem;
                }
            }, (reader) => {
                const model = this.textModel;
                const suggestItem = this.selectedSuggestItem.read(reader);
                if (suggestItem) {
                    const suggestCompletion = suggestItem.toSingleTextEdit().removeCommonPrefix(model);
                    const augmentedCompletion = this._computeAugmentedCompletion(suggestCompletion, reader);
                    const isSuggestionPreviewEnabled = this._suggestPreviewEnabled.read(reader);
                    if (!isSuggestionPreviewEnabled && !augmentedCompletion) {
                        return undefined;
                    }
                    const edit = augmentedCompletion?.edit ?? suggestCompletion;
                    const editPreviewLength = augmentedCompletion ? augmentedCompletion.edit.text.length - suggestCompletion.text.length : 0;
                    const mode = this._suggestPreviewMode.read(reader);
                    const cursor = this.cursorPosition.read(reader);
                    const newGhostText = edit.computeGhostText(model, mode, cursor, editPreviewLength);
                    // Show an invisible ghost text to reserve space
                    const ghostText = newGhostText ?? new ghostText_1.GhostText(edit.range.endLineNumber, []);
                    return { ghostText, inlineCompletion: augmentedCompletion?.completion, suggestItem };
                }
                else {
                    if (!this._isActive.read(reader)) {
                        return undefined;
                    }
                    const item = this.selectedInlineCompletion.read(reader);
                    if (!item) {
                        return undefined;
                    }
                    const replacement = item.toSingleTextEdit(reader);
                    const mode = this._inlineSuggestMode.read(reader);
                    const cursor = this.cursorPosition.read(reader);
                    const ghostText = replacement.computeGhostText(model, mode, cursor);
                    return ghostText ? { ghostText, inlineCompletion: item, suggestItem: undefined } : undefined;
                }
            });
            this.ghostText = (0, observable_1.derivedOpts)({
                owner: this,
                equalityComparer: ghostText_1.ghostTextOrReplacementEquals
            }, reader => {
                const v = this.state.read(reader);
                if (!v) {
                    return undefined;
                }
                return v.ghostText;
            });
            this._register((0, observable_1.recomputeInitiallyAndOnChange)(this._fetchInlineCompletions));
            let lastItem = undefined;
            this._register((0, observable_1.autorun)(reader => {
                /** @description call handleItemDidShow */
                const item = this.state.read(reader);
                const completion = item?.inlineCompletion;
                if (completion?.semanticId !== lastItem?.semanticId) {
                    lastItem = completion;
                    if (completion) {
                        const i = completion.inlineCompletion;
                        const src = i.source;
                        src.provider.handleItemDidShow?.(src.inlineCompletions, i.sourceInlineCompletion, i.insertText);
                    }
                }
            }));
        }
        async trigger(tx) {
            this._isActive.set(true, tx);
            await this._fetchInlineCompletions.get();
        }
        async triggerExplicitly(tx) {
            (0, observable_1.subtransaction)(tx, tx => {
                this._isActive.set(true, tx);
                this._forceUpdateSignal.trigger(tx, languages_1.InlineCompletionTriggerKind.Explicit);
            });
            await this._fetchInlineCompletions.get();
        }
        stop(tx) {
            (0, observable_1.subtransaction)(tx, tx => {
                this._isActive.set(false, tx);
                this._source.clear(tx);
            });
        }
        _computeAugmentedCompletion(suggestCompletion, reader) {
            const model = this.textModel;
            const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.read(reader);
            const candidateInlineCompletions = suggestWidgetInlineCompletions
                ? suggestWidgetInlineCompletions.inlineCompletions
                : [this.selectedInlineCompletion.read(reader)].filter(types_1.isDefined);
            const augmentedCompletion = (0, arraysFind_1.mapFindFirst)(candidateInlineCompletions, completion => {
                let r = completion.toSingleTextEdit(reader);
                r = r.removeCommonPrefix(model, range_1.Range.fromPositions(r.range.getStartPosition(), suggestCompletion.range.getEndPosition()));
                return r.augments(suggestCompletion) ? { edit: r, completion } : undefined;
            });
            return augmentedCompletion;
        }
        async _deltaSelectedInlineCompletionIndex(delta) {
            await this.triggerExplicitly();
            const completions = this._filteredInlineCompletionItems.get() || [];
            if (completions.length > 0) {
                const newIdx = (this.selectedInlineCompletionIndex.get() + delta + completions.length) % completions.length;
                this._selectedInlineCompletionId.set(completions[newIdx].semanticId, undefined);
            }
            else {
                this._selectedInlineCompletionId.set(undefined, undefined);
            }
        }
        async next() {
            await this._deltaSelectedInlineCompletionIndex(1);
        }
        async previous() {
            await this._deltaSelectedInlineCompletionIndex(-1);
        }
        async accept(editor) {
            if (editor.getModel() !== this.textModel) {
                throw new errors_1.BugIndicatingError();
            }
            const state = this.state.get();
            if (!state || state.ghostText.isEmpty() || !state.inlineCompletion) {
                return;
            }
            const completion = state.inlineCompletion.toInlineCompletion(undefined);
            editor.pushUndoStop();
            if (completion.snippetInfo) {
                editor.executeEdits('inlineSuggestion.accept', [
                    editOperation_1.EditOperation.replaceMove(completion.range, ''),
                    ...completion.additionalTextEdits
                ]);
                editor.setPosition(completion.snippetInfo.range.getStartPosition(), 'inlineCompletionAccept');
                snippetController2_1.SnippetController2.get(editor)?.insert(completion.snippetInfo.snippet, { undoStopBefore: false });
            }
            else {
                editor.executeEdits('inlineSuggestion.accept', [
                    editOperation_1.EditOperation.replaceMove(completion.range, completion.insertText),
                    ...completion.additionalTextEdits
                ]);
            }
            if (completion.command) {
                // Make sure the completion list will not be disposed.
                completion.source.addRef();
            }
            // Reset before invoking the command, since the command might cause a follow up trigger.
            (0, observable_1.transaction)(tx => {
                this._source.clear(tx);
                // Potentially, isActive will get set back to true by the typing or accept inline suggest event
                // if automatic inline suggestions are enabled.
                this._isActive.set(false, tx);
            });
            if (completion.command) {
                await this._commandService
                    .executeCommand(completion.command.id, ...(completion.command.arguments || []))
                    .then(undefined, errors_1.onUnexpectedExternalError);
                completion.source.removeRef();
            }
        }
        async acceptNextWord(editor) {
            await this._acceptNext(editor, (pos, text) => {
                const langId = this.textModel.getLanguageIdAtPosition(pos.lineNumber, pos.column);
                const config = this._languageConfigurationService.getLanguageConfiguration(langId);
                const wordRegExp = new RegExp(config.wordDefinition.source, config.wordDefinition.flags.replace('g', ''));
                const m1 = text.match(wordRegExp);
                let acceptUntilIndexExclusive = 0;
                if (m1 && m1.index !== undefined) {
                    if (m1.index === 0) {
                        acceptUntilIndexExclusive = m1[0].length;
                    }
                    else {
                        acceptUntilIndexExclusive = m1.index;
                    }
                }
                else {
                    acceptUntilIndexExclusive = text.length;
                }
                const wsRegExp = /\s+/g;
                const m2 = wsRegExp.exec(text);
                if (m2 && m2.index !== undefined) {
                    if (m2.index + m2[0].length < acceptUntilIndexExclusive) {
                        acceptUntilIndexExclusive = m2.index + m2[0].length;
                    }
                }
                return acceptUntilIndexExclusive;
            });
        }
        async acceptNextLine(editor) {
            await this._acceptNext(editor, (pos, text) => {
                const m = text.match(/\n/);
                if (m && m.index !== undefined) {
                    return m.index + 1;
                }
                return text.length;
            });
        }
        async _acceptNext(editor, getAcceptUntilIndex) {
            if (editor.getModel() !== this.textModel) {
                throw new errors_1.BugIndicatingError();
            }
            const state = this.state.get();
            if (!state || state.ghostText.isEmpty() || !state.inlineCompletion) {
                return;
            }
            const ghostText = state.ghostText;
            const completion = state.inlineCompletion.toInlineCompletion(undefined);
            if (completion.snippetInfo || completion.filterText !== completion.insertText) {
                // not in WYSIWYG mode, partial commit might change completion, thus it is not supported
                await this.accept(editor);
                return;
            }
            const firstPart = ghostText.parts[0];
            const position = new position_1.Position(ghostText.lineNumber, firstPart.column);
            const line = firstPart.lines.join('\n');
            const acceptUntilIndexExclusive = getAcceptUntilIndex(position, line);
            if (acceptUntilIndexExclusive === line.length && ghostText.parts.length === 1) {
                this.accept(editor);
                return;
            }
            const partialText = line.substring(0, acceptUntilIndexExclusive);
            // Executing the edit might free the completion, so we have to hold a reference on it.
            completion.source.addRef();
            try {
                this._isAcceptingPartially = true;
                try {
                    editor.pushUndoStop();
                    editor.executeEdits('inlineSuggestion.accept', [
                        editOperation_1.EditOperation.replace(range_1.Range.fromPositions(position), partialText),
                    ]);
                    const length = (0, utils_1.lengthOfText)(partialText);
                    editor.setPosition((0, utils_1.addPositions)(position, length), 'inlineCompletionPartialAccept');
                }
                finally {
                    this._isAcceptingPartially = false;
                }
                if (completion.source.provider.handlePartialAccept) {
                    const acceptedRange = range_1.Range.fromPositions(completion.range.getStartPosition(), (0, utils_1.addPositions)(position, (0, utils_1.lengthOfText)(partialText)));
                    // This assumes that the inline completion and the model use the same EOL style.
                    const text = editor.getModel().getValueInRange(acceptedRange, 1 /* EndOfLinePreference.LF */);
                    completion.source.provider.handlePartialAccept(completion.source.inlineCompletions, completion.sourceInlineCompletion, text.length);
                }
            }
            finally {
                completion.source.removeRef();
            }
        }
        handleSuggestAccepted(item) {
            const itemEdit = item.toSingleTextEdit().removeCommonPrefix(this.textModel);
            const augmentedCompletion = this._computeAugmentedCompletion(itemEdit, undefined);
            if (!augmentedCompletion) {
                return;
            }
            const inlineCompletion = augmentedCompletion.completion.inlineCompletion;
            inlineCompletion.source.provider.handlePartialAccept?.(inlineCompletion.source.inlineCompletions, inlineCompletion.sourceInlineCompletion, itemEdit.text.length);
        }
    };
    exports.InlineCompletionsModel = InlineCompletionsModel;
    exports.InlineCompletionsModel = InlineCompletionsModel = __decorate([
        __param(9, instantiation_1.IInstantiationService),
        __param(10, commands_1.ICommandService),
        __param(11, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], InlineCompletionsModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbnNNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5saW5lQ29tcGxldGlvbnMvYnJvd3Nlci9pbmxpbmVDb21wbGV0aW9uc01vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdCaEcsSUFBWSxxQkFLWDtJQUxELFdBQVkscUJBQXFCO1FBQ2hDLGlFQUFJLENBQUE7UUFDSixpRUFBSSxDQUFBO1FBQ0osNkVBQVUsQ0FBQTtRQUNWLG1FQUFLLENBQUE7SUFDTixDQUFDLEVBTFcscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFLaEM7SUFFTSxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHNCQUFVO1FBU3JELElBQVcsb0JBQW9CLEtBQUssT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1FBRXhFLFlBQ2lCLFNBQXFCLEVBQ3JCLG1CQUE2RCxFQUM3RCxjQUFxQyxFQUNyQyxrQkFBOEQsRUFDN0QsY0FBMkMsRUFDM0Msc0JBQTRDLEVBQzVDLG1CQUF1RSxFQUN2RSxrQkFBc0UsRUFDdEUsUUFBOEIsRUFDeEIscUJBQTZELEVBQ25FLGVBQWlELEVBQ25DLDZCQUE2RTtZQUU1RyxLQUFLLEVBQUUsQ0FBQztZQWJRLGNBQVMsR0FBVCxTQUFTLENBQVk7WUFDckIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUEwQztZQUM3RCxtQkFBYyxHQUFkLGNBQWMsQ0FBdUI7WUFDckMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE0QztZQUM3RCxtQkFBYyxHQUFkLGNBQWMsQ0FBNkI7WUFDM0MsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUFzQjtZQUM1Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQW9EO1lBQ3ZFLHVCQUFrQixHQUFsQixrQkFBa0Is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