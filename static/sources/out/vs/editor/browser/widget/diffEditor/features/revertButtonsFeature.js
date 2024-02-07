/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/lineRange", "vs/editor/common/core/range", "vs/editor/common/model", "vs/nls"], function (require, exports, dom_1, iconLabels_1, codicons_1, lifecycle_1, observable_1, lineRange_1, range_1, model_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RevertButton = exports.RevertButtonsFeature = void 0;
    class RevertButtonsFeature extends lifecycle_1.Disposable {
        constructor(_editors, _diffModel, _options, _widget) {
            super();
            this._editors = _editors;
            this._diffModel = _diffModel;
            this._options = _options;
            this._widget = _widget;
            const emptyArr = [];
            const selectedDiffs = (0, observable_1.derived)(this, (reader) => {
                /** @description selectedDiffs */
                const model = this._diffModel.read(reader);
                const diff = model?.diff.read(reader);
                if (!diff) {
                    return emptyArr;
                }
                const selections = this._editors.modifiedSelections.read(reader);
                if (selections.every(s => s.isEmpty())) {
                    return emptyArr;
                }
                const lineRanges = new lineRange_1.LineRangeSet(selections.map(s => lineRange_1.LineRange.fromRangeInclusive(s)));
                const mappings = diff.mappings.filter(m => m.lineRangeMapping.innerChanges && lineRanges.intersects(m.lineRangeMapping.modified));
                const result = mappings.map(mapping => ({
                    mapping,
                    rangeMappings: mapping.lineRangeMapping.innerChanges.filter(c => selections.some(s => range_1.Range.areIntersecting(c.modifiedRange, s)))
                }));
                if (result.length === 0 || result.every(r => r.rangeMappings.length === 0)) {
                    return emptyArr;
                }
                return result;
            });
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                const model = this._diffModel.read(reader);
                const diff = model?.diff.read(reader);
                if (!model || !diff) {
                    return;
                }
                const movedTextToCompare = this._diffModel.read(reader).movedTextToCompare.read(reader);
                if (movedTextToCompare) {
                    return;
                }
                if (!this._options.shouldRenderRevertArrows.read(reader)) {
                    return;
                }
                const glyphWidgetsModified = [];
                const selectedDiffs_ = selectedDiffs.read(reader);
                const diffsSet = new Set(selectedDiffs_.map(d => d.mapping));
                if (selectedDiffs_.length > 0) {
                    const selections = this._editors.modifiedSelections.read(reader);
                    const btn = store.add(new RevertButton(selections[selections.length - 1].positionLineNumber, this._widget, selectedDiffs_.flatMap(d => d.rangeMappings), true));
                    this._editors.modified.addGlyphMarginWidget(btn);
                    glyphWidgetsModified.push(btn);
                }
                for (const m of diff.mappings) {
                    if (diffsSet.has(m)) {
                        continue;
                    }
                    if (!m.lineRangeMapping.modified.isEmpty && m.lineRangeMapping.innerChanges) {
                        const btn = store.add(new RevertButton(m.lineRangeMapping.modified.startLineNumber, this._widget, m.lineRangeMapping.innerChanges, false));
                        this._editors.modified.addGlyphMarginWidget(btn);
                        glyphWidgetsModified.push(btn);
                    }
                }
                store.add((0, lifecycle_1.toDisposable)(() => {
                    for (const w of glyphWidgetsModified) {
                        this._editors.modified.removeGlyphMarginWidget(w);
                    }
                }));
            }));
        }
    }
    exports.RevertButtonsFeature = RevertButtonsFeature;
    class RevertButton extends lifecycle_1.Disposable {
        static { this.counter = 0; }
        getId() { return this._id; }
        constructor(_lineNumber, _widget, _diffs, _selection) {
            super();
            this._lineNumber = _lineNumber;
            this._widget = _widget;
            this._diffs = _diffs;
            this._selection = _selection;
            this._id = `revertButton${RevertButton.counter++}`;
            this._domNode = (0, dom_1.h)('div.revertButton', {
                title: this._selection
                    ? (0, nls_1.localize)('revertSelectedChanges', 'Revert Selected Changes')
                    : (0, nls_1.localize)('revertChange', 'Revert Change')
            }, [(0, iconLabels_1.renderIcon)(codicons_1.Codicon.arrowRight)]).root;
            this._register((0, dom_1.addDisposableListener)(this._domNode, dom_1.EventType.MOUSE_DOWN, e => {
                // don't prevent context menu from showing up
                if (e.button !== 2) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this._domNode, dom_1.EventType.MOUSE_UP, e => {
                e.stopPropagation();
                e.preventDefault();
            }));
            this._register((0, dom_1.addDisposableListener)(this._domNode, dom_1.EventType.CLICK, (e) => {
                this._widget.revertRangeMappings(this._diffs);
                e.stopPropagation();
                e.preventDefault();
            }));
        }
        /**
         * Get the dom node of the glyph widget.
         */
        getDomNode() {
            return this._domNode;
        }
        /**
         * Get the placement of the glyph widget.
         */
        getPosition() {
            return {
                lane: model_1.GlyphMarginLane.Right,
                range: {
                    startColumn: 1,
                    startLineNumber: this._lineNumber,
                    endColumn: 1,
                    endLineNumber: this._lineNumber,
                },
                zIndex: 10001,
            };
        }
    }
    exports.RevertButton = RevertButton;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV2ZXJ0QnV0dG9uc0ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL2ZlYXR1cmVzL3JldmVydEJ1dHRvbnNGZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsTUFBYSxvQkFBcUIsU0FBUSxzQkFBVTtRQUNuRCxZQUNrQixRQUEyQixFQUMzQixVQUF3RCxFQUN4RCxRQUEyQixFQUMzQixPQUF5QjtZQUUxQyxLQUFLLEVBQUUsQ0FBQztZQUxTLGFBQVEsR0FBUixRQUFRLENBQW1CO1lBQzNCLGVBQVUsR0FBVixVQUFVLENBQThDO1lBQ3hELGFBQVEsR0FBUixRQUFRLENBQW1CO1lBQzNCLFlBQU8sR0FBUCxPQUFPLENBQWtCO1lBSTFDLE1BQU0sUUFBUSxHQUFZLEVBQUUsQ0FBQztZQUM3QixNQUFNLGFBQWEsR0FBRyxJQUFBLG9CQUFPLEVBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQzlDLGlDQUFpQztnQkFDakMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQUMsT0FBTyxRQUFRLENBQUM7Z0JBQUMsQ0FBQztnQkFFL0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWpFLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUs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