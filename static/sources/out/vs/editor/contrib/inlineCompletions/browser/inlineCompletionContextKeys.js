/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observable", "vs/base/common/strings", "vs/editor/common/core/cursorColumns", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/nls"], function (require, exports, observable_1, strings_1, cursorColumns_1, contextkey_1, lifecycle_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionContextKeys = void 0;
    class InlineCompletionContextKeys extends lifecycle_1.Disposable {
        static { this.inlineSuggestionVisible = new contextkey_1.RawContextKey('inlineSuggestionVisible', false, (0, nls_1.localize)('inlineSuggestionVisible', "Whether an inline suggestion is visible")); }
        static { this.inlineSuggestionHasIndentation = new contextkey_1.RawContextKey('inlineSuggestionHasIndentation', false, (0, nls_1.localize)('inlineSuggestionHasIndentation', "Whether the inline suggestion starts with whitespace")); }
        static { this.inlineSuggestionHasIndentationLessThanTabSize = new contextkey_1.RawContextKey('inlineSuggestionHasIndentationLessThanTabSize', true, (0, nls_1.localize)('inlineSuggestionHasIndentationLessThanTabSize', "Whether the inline suggestion starts with whitespace that is less than what would be inserted by tab")); }
        static { this.suppressSuggestions = new contextkey_1.RawContextKey('inlineSuggestionSuppressSuggestions', undefined, (0, nls_1.localize)('suppressSuggestions', "Whether suggestions should be suppressed for the current suggestion")); }
        constructor(contextKeyService, model) {
            super();
            this.contextKeyService = contextKeyService;
            this.model = model;
            this.inlineCompletionVisible = InlineCompletionContextKeys.inlineSuggestionVisible.bindTo(this.contextKeyService);
            this.inlineCompletionSuggestsIndentation = InlineCompletionContextKeys.inlineSuggestionHasIndentation.bindTo(this.contextKeyService);
            this.inlineCompletionSuggestsIndentationLessThanTabSize = InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize.bindTo(this.contextKeyService);
            this.suppressSuggestions = InlineCompletionContextKeys.suppressSuggestions.bindTo(this.contextKeyService);
            this._register((0, observable_1.autorun)(reader => {
                /** @description update context key: inlineCompletionVisible, suppressSuggestions */
                const model = this.model.read(reader);
                const state = model?.state.read(reader);
                const isInlineCompletionVisible = !!state?.inlineCompletion && state?.ghostText !== undefined && !state?.ghostText.isEmpty();
                this.inlineCompletionVisible.set(isInlineCompletionVisible);
                if (state?.ghostText && state?.inlineCompletion) {
                    this.suppressSuggestions.set(state.inlineCompletion.inlineCompletion.source.inlineCompletions.suppressSuggestions);
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update context key: inlineCompletionSuggestsIndentation, inlineCompletionSuggestsIndentationLessThanTabSize */
                const model = this.model.read(reader);
                let startsWithIndentation = false;
                let startsWithIndentationLessThanTabSize = true;
                const ghostText = model?.ghostText.read(reader);
                if (!!model?.selectedSuggestItem && ghostText && ghostText.parts.length > 0) {
                    const { column, lines } = ghostText.parts[0];
                    const firstLine = lines[0];
                    const indentationEndColumn = model.textModel.getLineIndentColumn(ghostText.lineNumber);
                    const inIndentation = column <= indentationEndColumn;
                    if (inIndentation) {
                        let firstNonWsIdx = (0, strings_1.firstNonWhitespaceIndex)(firstLine);
                        if (firstNonWsIdx === -1) {
                            firstNonWsIdx = firstLine.length - 1;
                        }
                        startsWithIndentation = firstNonWsIdx > 0;
                        const tabSize = model.textModel.getOptions().tabSize;
                        const visibleColumnIndentation = cursorColumns_1.CursorColumns.visibleColumnFromColumn(firstLine, firstNonWsIdx + 1, tabSize);
                        startsWithIndentationLessThanTabSize = visibleColumnIndentation < tabSize;
                    }
                }
                this.inlineCompletionSuggestsIndentation.set(startsWithIndentation);
                this.inlineCompletionSuggestsIndentationLessThanTabSize.set(startsWithIndentationLessThanTabSize);
            }));
        }
    }
    exports.InlineCompletionContextKeys = InlineCompletionContextKeys;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbkNvbnRleHRLZXlzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy9icm93c2VyL2lubGluZUNvbXBsZXRpb25Db250ZXh0S2V5cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsTUFBYSwyQkFBNEIsU0FBUSxzQkFBVTtpQkFDbkMsNEJBQXVCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHlCQUF5QixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDLEFBQS9JLENBQWdKO2lCQUN2SyxtQ0FBOEIsR0FBRyxJQUFJLDBCQUFhLENBQVUsZ0NBQWdDLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdDQUFnQyxFQUFFLHNEQUFzRCxDQUFDLENBQUMsQUFBMUssQ0FBMks7aUJBQ3pNLGtEQUE2QyxHQUFHLElBQUksMEJBQWEsQ0FBVSwrQ0FBK0MsRUFBRSxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMsK0NBQStDLEVBQUUsc0dBQXNHLENBQUMsQ0FBQyxBQUF2UCxDQUF3UDtpQkFDclMsd0JBQW1CLEdBQUcsSUFBSSwwQkFBYSxDQUFzQixxQ0FBcUMsRUFBRSxTQUFTLEVBQUUsSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUscUVBQXFFLENBQUMsQ0FBQyxBQUFuTSxDQUFvTTtRQU85TyxZQUNrQixpQkFBcUMsRUFDckMsS0FBc0Q7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFIUyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ3JDLFVBQUssR0FBTCxLQUFLLENBQWlEO1lBUHhELDRCQUF1QixHQUFHLDJCQUEyQixDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlC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