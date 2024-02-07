(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects"], function (require, exports, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shouldSynchronizeModel = exports.ApplyEditsResult = exports.SearchData = exports.ValidAnnotatedEditOperation = exports.ModelConstants = exports.PositionAffinity = exports.isITextSnapshot = exports.TrackedRangeStickiness = exports.FindMatch = exports.TextModelResolvedOptions = exports.EndOfLineSequence = exports.DefaultEndOfLine = exports.EndOfLinePreference = exports.InjectedTextCursorStops = exports.MinimapPosition = exports.GlyphMarginLane = exports.OverviewRulerLane = void 0;
    /**
     * Vertical Lane in the overview ruler of the editor.
     */
    var OverviewRulerLane;
    (function (OverviewRulerLane) {
        OverviewRulerLane[OverviewRulerLane["Left"] = 1] = "Left";
        OverviewRulerLane[OverviewRulerLane["Center"] = 2] = "Center";
        OverviewRulerLane[OverviewRulerLane["Right"] = 4] = "Right";
        OverviewRulerLane[OverviewRulerLane["Full"] = 7] = "Full";
    })(OverviewRulerLane || (exports.OverviewRulerLane = OverviewRulerLane = {}));
    /**
     * Vertical Lane in the glyph margin of the editor.
     */
    var GlyphMarginLane;
    (function (GlyphMarginLane) {
        GlyphMarginLane[GlyphMarginLane["Left"] = 1] = "Left";
        GlyphMarginLane[GlyphMarginLane["Center"] = 2] = "Center";
        GlyphMarginLane[GlyphMarginLane["Right"] = 3] = "Right";
    })(GlyphMarginLane || (exports.GlyphMarginLane = GlyphMarginLane = {}));
    /**
     * Position in the minimap to render the decoration.
     */
    var MinimapPosition;
    (function (MinimapPosition) {
        MinimapPosition[MinimapPosition["Inline"] = 1] = "Inline";
        MinimapPosition[MinimapPosition["Gutter"] = 2] = "Gutter";
    })(MinimapPosition || (exports.MinimapPosition = MinimapPosition = {}));
    var InjectedTextCursorStops;
    (function (InjectedTextCursorStops) {
        InjectedTextCursorStops[InjectedTextCursorStops["Both"] = 0] = "Both";
        InjectedTextCursorStops[InjectedTextCursorStops["Right"] = 1] = "Right";
        InjectedTextCursorStops[InjectedTextCursorStops["Left"] = 2] = "Left";
        InjectedTextCursorStops[InjectedTextCursorStops["None"] = 3] = "None";
    })(InjectedTextCursorStops || (exports.InjectedTextCursorStops = InjectedTextCursorStops = {}));
    /**
     * End of line character preference.
     */
    var EndOfLinePreference;
    (function (EndOfLinePreference) {
        /**
         * Use the end of line character identified in the text buffer.
         */
        EndOfLinePreference[EndOfLinePreference["TextDefined"] = 0] = "TextDefined";
        /**
         * Use line feed (\n) as the end of line character.
         */
        EndOfLinePreference[EndOfLinePreference["LF"] = 1] = "LF";
        /**
         * Use carriage return and line feed (\r\n) as the end of line character.
         */
        EndOfLinePreference[EndOfLinePreference["CRLF"] = 2] = "CRLF";
    })(EndOfLinePreference || (exports.EndOfLinePreference = EndOfLinePreference = {}));
    /**
     * The default end of line to use when instantiating models.
     */
    var DefaultEndOfLine;
    (function (DefaultEndOfLine) {
        /**
         * Use line feed (\n) as the end of line character.
         */
        DefaultEndOfLine[DefaultEndOfLine["LF"] = 1] = "LF";
        /**
         * Use carriage return and line feed (\r\n) as the end of line character.
         */
        DefaultEndOfLine[DefaultEndOfLine["CRLF"] = 2] = "CRLF";
    })(DefaultEndOfLine || (exports.DefaultEndOfLine = DefaultEndOfLine = {}));
    /**
     * End of line character preference.
     */
    var EndOfLineSequence;
    (function (EndOfLineSequence) {
        /**
         * Use line feed (\n) as the end of line character.
         */
        EndOfLineSequence[EndOfLineSequence["LF"] = 0] = "LF";
        /**
         * Use carriage return and line feed (\r\n) as the end of line character.
         */
        EndOfLineSequence[EndOfLineSequence["CRLF"] = 1] = "CRLF";
    })(EndOfLineSequence || (exports.EndOfLineSequence = EndOfLineSequence = {}));
    class TextModelResolvedOptions {
        get originalIndentSize() {
            return this._indentSizeIsTabSize ? 'tabSize' : this.indentSize;
        }
        /**
         * @internal
         */
        constructor(src) {
            this._textModelResolvedOptionsBrand = undefined;
            this.tabSize = Math.max(1, src.tabSize | 0);
            if (src.indentSize === 'tabSize') {
                this.indentSize = this.tabSize;
                this._indentSizeIsTabSize = true;
            }
            else {
                this.indentSize = Math.max(1, src.indentSize | 0);
                this._indentSizeIsTabSize = false;
            }
            this.insertSpaces = Boolean(src.insertSpaces);
            this.defaultEOL = src.defaultEOL | 0;
            this.trimAutoWhitespace = Boolean(src.trimAutoWhitespace);
            this.bracketPairColorizationOptions = src.bracketPairColorizationOptions;
        }
        /**
         * @internal
         */
        equals(other) {
            return (this.tabSize === other.tabSize
                && this._indentSizeIsTabSize === other._indentSizeIsTabSize
                && this.indentSize === other.indentSize
                && this.insertSpaces === other.insertSpaces
                && this.defaultEOL === other.defaultEOL
                && this.trimAutoWhitespace === other.trimAutoWhitespace
                && (0, objects_1.equals)(this.bracketPairColorizationOptions, other.bracketPairColorizationOptions));
        }
        /**
         * @internal
         */
        createChangeEvent(newOpts) {
            return {
                tabSize: this.tabSize !== newOpts.tabSize,
                indentSize: this.indentSize !== newOpts.indentSize,
                insertSpaces: this.insertSpaces !== newOpts.insertSpaces,
                trimAutoWhitespace: this.trimAutoWhitespace !== newOpts.trimAutoWhitespace,
            };
        }
    }
    exports.TextModelResolvedOptions = TextModelResolvedOptions;
    class FindMatch {
        /**
         * @internal
         */
        constructor(range, matches) {
            this._findMatchBrand = undefined;
            this.range = range;
            this.matches = matches;
        }
    }
    exports.FindMatch = FindMatch;
    /**
     * Describes the behavior of decorations when typing/editing near their edges.
     * Note: Please do not edit the values, as they very carefully match `DecorationRangeBehavior`
     */
    var TrackedRangeStickiness;
    (function (TrackedRangeStickiness) {
        TrackedRangeStickiness[TrackedRangeStickiness["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
        TrackedRangeStickiness[TrackedRangeStickiness["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
        TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
        TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
    })(TrackedRangeStickiness || (exports.TrackedRangeStickiness = TrackedRangeStickiness = {}));
    /**
     * @internal
     */
    function isITextSnapshot(obj) {
        return (obj && typeof obj.read === 'function');
    }
    exports.isITextSnapshot = isITextSnapshot;
    var PositionAffinity;
    (function (PositionAffinity) {
        /**
         * Prefers the left most position.
        */
        PositionAffinity[PositionAffinity["Left"] = 0] = "Left";
        /**
         * Prefers the right most position.
        */
        PositionAffinity[PositionAffinity["Right"] = 1] = "Right";
        /**
         * No preference.
        */
        PositionAffinity[PositionAffinity["None"] = 2] = "None";
        /**
         * If the given position is on injected text, prefers the position left of it.
        */
        PositionAffinity[PositionAffinity["LeftOfInjectedText"] = 3] = "LeftOfInjectedText";
        /**
         * If the given position is on injected text, prefers the position right of it.
        */
        PositionAffinity[PositionAffinity["RightOfInjectedText"] = 4] = "RightOfInjectedText";
    })(PositionAffinity || (exports.PositionAffinity = PositionAffinity = {}));
    /**
     * @internal
     */
    var ModelConstants;
    (function (ModelConstants) {
        ModelConstants[ModelConstants["FIRST_LINE_DETECTION_LENGTH_LIMIT"] = 1000] = "FIRST_LINE_DETECTION_LENGTH_LIMIT";
    })(ModelConstants || (exports.ModelConstants = ModelConstants = {}));
    /**
     * @internal
     */
    class ValidAnnotatedEditOperation {
        constructor(identifier, range, text, forceMoveMarkers, isAutoWhitespaceEdit, _isTracked) {
            this.identifier = identifier;
            this.range = range;
            this.text = text;
            this.forceMoveMarkers = forceMoveMarkers;
            this.isAutoWhitespaceEdit = isAutoWhitespaceEdit;
            this._isTracked = _isTracked;
        }
    }
    exports.ValidAnnotatedEditOperation = ValidAnnotatedEditOperation;
    /**
     * @internal
     */
    class SearchData {
        constructor(regex, wordSeparators, simpleSearch) {
            this.regex = regex;
            this.wordSeparators = wordSeparators;
            this.simpleSearch = simpleSearch;
        }
    }
    exports.SearchData = SearchData;
    /**
     * @internal
     */
    class ApplyEditsResult {
        constructor(reverseEdits, changes, trimAutoWhitespaceLineNumbers) {
            this.reverseEdits = reverseEdits;
            this.changes = changes;
            this.trimAutoWhitespaceLineNumbers = trimAutoWhitespaceLineNumbers;
        }
    }
    exports.ApplyEditsResult = ApplyEditsResult;
    /**
     * @internal
     */
    function shouldSynchronizeModel(model) {
        return (!model.isTooLargeForSyncing() && !model.isForSimpleWidget);
    }
    exports.shouldSynchronizeModel = shouldSynchronizeModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUJoRzs7T0FFRztJQUNILElBQVksaUJBS1g7SUFMRCxXQUFZLGlCQUFpQjtRQUM1Qix5REFBUSxDQUFBO1FBQ1IsNkRBQVUsQ0FBQTtRQUNWLDJEQUFTLENBQUE7UUFDVCx5REFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUxXLGlCQUFpQixpQ0FBakIsaUJBQWlCLFFBSzVCO0lBRUQ7O09BRUc7SUFDSCxJQUFZLGVBSVg7SUFKRCxXQUFZLGVBQWU7UUFDMUIscURBQVEsQ0FBQTtRQUNSLHlEQUFVLENBQUE7UUFDVix1REFBUyxDQUFBO0lBQ1YsQ0FBQyxFQUpXLGVBQWUsK0JBQWYsZUFBZSxRQUkxQjtJQTBCRDs7T0FFRztJQUNILElBQVksZUFHWDtJQUhELFdBQVksZUFBZTtRQUMxQix5REFBVSxDQUFBO1FBQ1YseURBQVUsQ0FBQTtJQUNYLENBQUMsRUFIVyxlQUFlLCtCQUFmLGVBQWUsUUFHMUI7SUE0TkQsSUFBWSx1QkFLWDtJQUxELFdBQVksdUJBQXVCO1FBQ2xDLHFFQUFJLENBQUE7UUFDSix1RUFBSyxDQUFBO1FBQ0wscUVBQUksQ0FBQTtRQUNKLHFFQUFJLENBQUE7SUFDTCxDQUFDLEVBTFcsdUJBQXVCLHVDQUF2Qix1QkFBdUIsUUFLbEM7SUErRUQ7O09BRUc7SUFDSCxJQUFrQixtQkFhakI7SUFiRCxXQUFrQixtQkFBbUI7UUFDcEM7O1dBRUc7UUFDSCwyRUFBZSxDQUFBO1FBQ2Y7O1dBRUc7UUFDSCx5REFBTSxDQUFBO1FBQ047O1dBRUc7UUFDSCw2REFBUSxDQUFBO0lBQ1QsQ0FBQyxFQWJpQixtQkFBbUIsbUNBQW5CLG1CQUFtQixRQWFwQztJQUVEOztPQUVHO0lBQ0gsSUFBa0IsZ0JB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
//# sourceURL=../../../vs/editor/common/model.js
})