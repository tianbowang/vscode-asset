/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/viewModel", "vs/editor/common/config/editorOptions"], function (require, exports, position_1, range_1, viewModel_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isModelDecorationInString = exports.isModelDecorationInComment = exports.isModelDecorationVisible = exports.ViewModelDecorations = void 0;
    class ViewModelDecorations {
        constructor(editorId, model, configuration, linesCollection, coordinatesConverter) {
            this.editorId = editorId;
            this.model = model;
            this.configuration = configuration;
            this._linesCollection = linesCollection;
            this._coordinatesConverter = coordinatesConverter;
            this._decorationsCache = Object.create(null);
            this._cachedModelDecorationsResolver = null;
            this._cachedModelDecorationsResolverViewRange = null;
        }
        _clearCachedModelDecorationsResolver() {
            this._cachedModelDecorationsResolver = null;
            this._cachedModelDecorationsResolverViewRange = null;
        }
        dispose() {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        }
        reset() {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        }
        onModelDecorationsChanged() {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        }
        onLineMappingChanged() {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        }
        _getOrCreateViewModelDecoration(modelDecoration) {
            const id = modelDecoration.id;
            let r = this._decorationsCache[id];
            if (!r) {
                const modelRange = modelDecoration.range;
                const options = modelDecoration.options;
                let viewRange;
                if (options.isWholeLine) {
                    const start = this._coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelRange.startLineNumber, 1), 0 /* PositionAffinity.Left */, false, true);
                    const end = this._coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelRange.endLineNumber, this.model.getLineMaxColumn(modelRange.endLineNumber)), 1 /* PositionAffinity.Right */);
                    viewRange = new range_1.Range(start.lineNumber, start.column, end.lineNumber, end.column);
                }
                else {
                    // For backwards compatibility reasons, we want injected text before any decoration.
                    // Thus, move decorations to the right.
                    viewRange = this._coordinatesConverter.convertModelRangeToViewRange(modelRange, 1 /* PositionAffinity.Right */);
                }
                r = new viewModel_1.ViewModelDecoration(viewRange, options);
                this._decorationsCache[id] = r;
            }
            return r;
        }
        getMinimapDecorationsInRange(range) {
            return this._getDecorationsInRange(range, true, false).decorations;
        }
        getDecorationsViewportData(viewRange) {
            let cacheIsValid = (this._cachedModelDecorationsResolver !== null);
            cacheIsValid = cacheIsValid && (viewRange.equalsRange(this._cachedModelDecorationsResolverViewRange));
            if (!cacheIsValid) {
                this._cachedModelDecorationsResolver = this._getDecorationsInRange(viewRange, false, false);
                this._cachedModelDecorationsResolverViewRange = viewRange;
            }
            return this._cachedModelDecorationsResolver;
        }
        getInlineDecorationsOnLine(lineNumber, onlyMinimapDecorations = false, onlyMarginDecorations = false) {
            const range = new range_1.Range(lineNumber, this._linesCollection.getViewLineMinColumn(lineNumber), lineNumber, this._linesCollection.getViewLineMaxColumn(lineNumber));
            return this._getDecorationsInRange(range, onlyMinimapDecorations, onlyMarginDecorations).inlineDecorations[0];
        }
        _getDecorationsInRange(viewRange, onlyMinimapDecorations, onlyMarginDecorations) {
            const modelDecorations = this._linesCollection.getDecorationsInRange(viewRange, this.editorId, (0, editorOptions_1.filterValidationDecorations)(this.configuration.options), onlyMinimapDecorations, onlyMarginDecorations);
            const startLineNumber = viewRange.startLineNumber;
            const endLineNumber = viewRange.endLineNumber;
            const decorationsInViewport = [];
            let decorationsInViewportLen = 0;
            const inlineDecorations = [];
            for (let j = startLineNumber; j <= endLineNumber; j++) {
                inlineDecorations[j - startLineNumber] = [];
            }
            for (let i = 0, len = modelDecorations.length; i < len; i++) {
                const modelDecoration = modelDecorations[i];
                const decorationOptions = modelDecoration.options;
                if (!isModelDecorationVisible(this.model, modelDecoration)) {
                    continue;
                }
                const viewModelDecoration = this._getOrCreateViewModelDecoration(modelDecoration);
                const viewRange = viewModelDecoration.range;
                decorationsInViewport[decorationsInViewportLen++] = viewModelDecoration;
                if (decorationOptions.inlineClassName) {
                    const inlineDecoration = new viewModel_1.InlineDecoration(viewRange, decorationOptions.inlineClassName, decorationOptions.inlineClassNameAffectsLetterSpacing ? 3 /* InlineDecorationType.RegularAffectingLetterSpacing */ : 0 /* InlineDecorationType.Regular */);
                    const intersectedStartLineNumber = Math.max(startLineNumber, viewRange.startLineNumber);
                    const intersectedEndLineNumber = Math.min(endLineNumber, viewRange.endLineNumber);
                    for (let j = intersectedStartLineNumber; j <= intersectedEndLineNumber; j++) {
                        inlineDecorations[j - startLineNumber].push(inlineDecoration);
                    }
                }
                if (decorationOptions.beforeContentClassName) {
                    if (startLineNumber <= viewRange.startLineNumber && viewRange.startLineNumber <= endLineNumber) {
                        const inlineDecoration = new viewModel_1.InlineDecoration(new range_1.Range(viewRange.startLineNumber, viewRange.startColumn, viewRange.startLineNumber, viewRange.startColumn), decorationOptions.beforeContentClassName, 1 /* InlineDecorationType.Before */);
                        inlineDecorations[viewRange.startLineNumber - startLineNumber].push(inlineDecoration);
                    }
                }
                if (decorationOptions.afterContentClassName) {
                    if (startLineNumber <= viewRange.endLineNumber && viewRange.endLineNumber <= endLineNumber) {
                        const inlineDecoration = new viewModel_1.InlineDecoration(new range_1.Range(viewRange.endLineNumber, viewRange.endColumn, viewRange.endLineNumber, viewRange.endColumn), decorationOptions.afterContentClassName, 2 /* InlineDecorationType.After */);
                        inlineDecorations[viewRange.endLineNumber - startLineNumber].push(inlineDecoration);
                    }
                }
            }
            return {
                decorations: decorationsInViewport,
                inlineDecorations: inlineDecorations
            };
        }
    }
    exports.ViewModelDecorations = ViewModelDecorations;
    function isModelDecorationVisible(model, decoration) {
        if (decoration.options.hideInCommentTokens && isModelDecorationInComment(model, decoration)) {
            return false;
        }
        if (decoration.options.hideInStringTokens && isModelDecorationInString(model, decoration)) {
            return false;
        }
        return true;
    }
    exports.isModelDecorationVisible = isModelDecorationVisible;
    function isModelDecorationInComment(model, decoration) {
        return testTokensInRange(model, decoration.range, (tokenType) => tokenType === 1 /* StandardTokenType.Comment */);
    }
    exports.isModelDecorationInComment = isModelDecorationInComment;
    function isModelDecorationInString(model, decoration) {
        return testTokensInRange(model, decoration.range, (tokenType) => tokenType === 2 /* StandardTokenType.String */);
    }
    exports.isModelDecorationInString = isModelDecorationInString;
    /**
     * Calls the callback for every token that intersects the range.
     * If the callback returns `false`, iteration stops and `false` is returned.
     * Otherwise, `true` is returned.
     */
    function testTokensInRange(model, range, callback) {
        for (let lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
            const lineTokens = model.tokenization.getLineTokens(lineNumber);
            const isFirstLine = lineNumber === range.startLineNumber;
            const isEndLine = lineNumber === range.endLineNumber;
            let tokenIdx = isFirstLine ? lineTokens.findTokenIndexAtOffset(range.startColumn - 1) : 0;
            while (tokenIdx < lineTokens.getCount()) {
                if (isEndLine) {
                    const startOffset = lineTokens.getStartOffset(tokenIdx);
                    if (startOffset > range.endColumn - 1) {
                        break;
                    }
                }
                const callbackResult = callback(lineTokens.getStandardTokenType(tokenIdx));
                if (!callbackResult) {
                    return false;
                }
                tokenIdx++;
            }
        }
        return true;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld01vZGVsRGVjb3JhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vdmlld01vZGVsL3ZpZXdNb2RlbERlY29yYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXVCaEcsTUFBYSxvQkFBb0I7UUFhaEMsWUFBWSxRQUFnQixFQUFFLEtBQWlCLEVBQUUsYUFBbUMsRUFBRSxlQUFnQyxFQUFFLG9CQUEyQztZQUNsSyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztZQUNuQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQztZQUNsRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsK0JBQStCLEdBQUcsSUFBSSxDQUFDO1lBQzVDLElBQUksQ0FBQyx3Q0FBd0MsR0FBRyxJQUFJLENBQUM7UUFDdEQsQ0FBQztRQUVPLG9DQUFvQztZQUMzQyxJQUFJLENBQUMsK0JBQStCLEdBQUcsSUFBSSxDQUFDO1lBQzVDLElBQUksQ0FBQyx3Q0FBd0MsR0FBRyxJQUFJLENBQUM7UUFDdEQsQ0FBQztRQUVNLE9BQU87WUFDYixJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRU0sS0FBSztZQUNYLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElB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