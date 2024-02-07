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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/codicons", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/observableInternal/derived", "vs/base/common/themables", "vs/base/common/types", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/lineRange", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/nls", "vs/platform/instantiation/common/instantiation"], function (require, exports, dom_1, iconLabels_1, codicons_1, htmlContent_1, lifecycle_1, observable_1, derived_1, themables_1, types_1, utils_1, lineRange_1, position_1, range_1, languages_1, nls_1, instantiation_1) {
    "use strict";
    var HideUnchangedRegionsFeature_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HideUnchangedRegionsFeature = void 0;
    /**
     * Make sure to add the view zones to the editor!
     */
    let HideUnchangedRegionsFeature = class HideUnchangedRegionsFeature extends lifecycle_1.Disposable {
        static { HideUnchangedRegionsFeature_1 = this; }
        static { this._breadcrumbsSourceFactory = (0, observable_1.observableValue)('breadcrumbsSourceFactory', undefined); }
        static setBreadcrumbsSourceFactory(factory) {
            this._breadcrumbsSourceFactory.set(factory, undefined);
        }
        get isUpdatingHiddenAreas() { return this._isUpdatingHiddenAreas; }
        constructor(_editors, _diffModel, _options, _instantiationService) {
            super();
            this._editors = _editors;
            this._diffModel = _diffModel;
            this._options = _options;
            this._instantiationService = _instantiationService;
            this._modifiedOutlineSource = (0, derived_1.derivedDisposable)(this, (reader) => {
                const m = this._editors.modifiedModel.read(reader);
                const factory = HideUnchangedRegionsFeature_1._breadcrumbsSourceFactory.read(reader);
                return (!m || !factory) ? undefined : factory(m, this._instantiationService);
            });
            this._isUpdatingHiddenAreas = false;
            this._register(this._editors.original.onDidChangeCursorPosition(e => {
                if (e.reason === 3 /* CursorChangeReason.Explicit */) {
                    const m = this._diffModel.get();
                    (0, observable_1.transaction)(tx => {
                        for (const s of this._editors.original.getSelections() || []) {
                            m?.ensureOriginalLineIsVisible(s.getStartPosition().lineNumber, 0 /* RevealPreference.FromCloserSide */, tx);
                            m?.ensureOriginalLineIsVisible(s.getEndPosition().lineNumber, 0 /* RevealPreference.FromCloserSide */, tx);
                        }
                    });
                }
            }));
            this._register(this._editors.modified.onDidChangeCursorPosition(e => {
                if (e.reason === 3 /* CursorChangeReason.Explicit */) {
                    const m = this._diffModel.get();
                    (0, observable_1.transaction)(tx => {
                        for (const s of this._editors.modified.getSelections() || []) {
                            m?.ensureModifiedLineIsVisible(s.getStartPosition().lineNumber, 0 /* RevealPreference.FromCloserSide */, tx);
                            m?.ensureModifiedLineIsVisible(s.getEndPosition().lineNumber, 0 /* RevealPreference.FromCloserSide */, tx);
                        }
                    });
                }
            }));
            const unchangedRegions = this._diffModel.map((m, reader) => {
                const regions = m?.unchangedRegions.read(reader) ?? [];
                if (regions.length === 1 && regions[0].modifiedLineNumber === 1 && regions[0].lineCount === this._editors.modifiedModel.read(reader)?.getLineCount()) {
                    return [];
                }
                return regions;
            });
            this.viewZones = (0, observable_1.derivedWithStore)(this, (reader, store) => {
                /** @description view Zones */
                const modifiedOutlineSource = this._modifiedOutlineSource.read(reader);
                if (!modifiedOutlineSource) {
                    return { origViewZones: [], modViewZones: [] };
                }
                const origViewZones = [];
                const modViewZones = [];
                const sideBySide = this._options.renderSideBySide.read(reader);
                const curUnchangedRegions = unchangedRegions.read(reader);
                for (const r of curUnchangedRegions) {
                    if (r.shouldHideControls(reader)) {
                        continue;
                    }
                    {
                        const d = (0, observable_1.derived)(this, reader => /** @description hiddenOriginalRangeStart */ r.getHiddenOriginalRange(reader).startLineNumber - 1);
                        const origVz = new utils_1.PlaceholderViewZone(d, 24);
                        origViewZones.push(origVz);
                        store.add(new CollapsedCodeOverlayWidget(this._editors.original, origVz, r, r.originalUnchangedRange, !sideBySide, modifiedOutlineSource, l => this._diffModel.get().ensureModifiedLineIsVisible(l, 2 /* RevealPreference.FromBottom */, undefined), this._options));
                    }
                    {
                        const d = (0, observable_1.derived)(this, reader => /** @description hiddenModifiedRangeStart */ r.getHiddenModifiedRange(reader).startLineNumber - 1);
                        const modViewZone = new utils_1.PlaceholderViewZone(d, 24);
                        modViewZones.push(modViewZone);
                        store.add(new CollapsedCodeOverlayWidget(this._editors.modified, modViewZone, r, r.modifiedUnchangedRange, false, modifiedOutlineSource, l => this._diffModel.get().ensureModifiedLineIsVisible(l, 2 /* RevealPreference.FromBottom */, undefined), this._options));
                    }
                }
                return { origViewZones, modViewZones, };
            });
            const unchangedLinesDecoration = {
                description: 'unchanged lines',
                className: 'diff-unchanged-lines',
                isWholeLine: true,
            };
            const unchangedLinesDecorationShow = {
                description: 'Fold Unchanged',
                glyphMarginHoverMessage: new htmlContent_1.MarkdownString(undefined, { isTrusted: true, supportThemeIcons: true })
                    .appendMarkdown((0, nls_1.localize)('foldUnchanged', 'Fold Unchanged Region')),
                glyphMarginClassName: 'fold-unchanged ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.fold),
                zIndex: 10001,
            };
            this._register((0, utils_1.applyObservableDecorations)(this._editors.original, (0, observable_1.derived)(this, reader => {
                /** @description decorations */
                const curUnchangedRegions = unchangedRegions.read(reader);
                const result = curUnchangedRegions.map(r => ({
                    range: r.originalUnchangedRange.toInclusiveRange(),
                    options: unchangedLinesDecoration,
                }));
                for (const r of curUnchangedRegions) {
                    if (r.shouldHideControls(reader)) {
                        result.push({
                            range: range_1.Range.fromPositions(new position_1.Position(r.originalLineNumber, 1)),
                            options: unchangedLinesDecorationShow,
                        });
                    }
                }
                return result;
            })));
            this._register((0, utils_1.applyObservableDecorations)(this._editors.modified, (0, observable_1.derived)(this, reader => {
                /** @description decorations */
                const curUnchangedRegions = unchangedRegions.read(reader);
                const result = curUnchangedRegions.map(r => ({
                    range: r.modifiedUnchangedRange.toInclusiveRange(),
                    options: unchangedLinesDecoration,
                }));
                for (const r of curUnchangedRegions) {
                    if (r.shouldHideControls(reader)) {
                        result.push({
                            range: lineRange_1.LineRange.ofLength(r.modifiedLineNumber, 1).toInclusiveRange(),
                            options: unchangedLinesDecorationShow,
                        });
                    }
                }
                return result;
            })));
            this._register((0, observable_1.autorun)((reader) => {
                /** @description update folded unchanged regions */
                const curUnchangedRegions = unchangedRegions.read(reader);
                this._isUpdatingHiddenAreas = true;
                try {
                    this._editors.original.setHiddenAreas(curUnchangedRegions.map(r => r.getHiddenOriginalRange(reader).toInclusiveRange()).filter(types_1.isDefined));
                    this._editors.modified.setHiddenAreas(curUnchangedRegions.map(r => r.getHiddenModifiedRange(reader).toInclusiveRange()).filter(types_1.isDefined));
                }
                finally {
                    this._isUpdatingHiddenAreas = false;
                }
            }));
            this._register(this._editors.modified.onMouseUp(event => {
                if (!event.event.rightButton && event.target.position && event.target.element?.className.includes('fold-unchanged')) {
                    const lineNumber = event.target.position.lineNumber;
                    const model = this._diffModel.get();
                    if (!model) {
                        return;
                    }
                    const region = model.unchangedRegions.get().find(r => r.modifiedUnchangedRange.includes(lineNumber));
                    if (!region) {
                        return;
                    }
                    region.collapseAll(undefined);
                    event.event.stopPropagation();
                    event.event.preventDefault();
                }
            }));
            this._register(this._editors.original.onMouseUp(event => {
                if (!event.event.rightButton && event.target.position && event.target.element?.className.includes('fold-unchanged')) {
                    const lineNumber = event.target.position.lineNumber;
                    const model = this._diffModel.get();
                    if (!model) {
                        return;
                    }
                    const region = model.unchangedRegions.get().find(r => r.originalUnchangedRange.includes(lineNumber));
                    if (!region) {
                        return;
                    }
                    region.collapseAll(undefined);
                    event.event.stopPropagation();
                    event.event.preventDefault();
                }
            }));
        }
    };
    exports.HideUnchangedRegionsFeature = HideUnchangedRegionsFeature;
    exports.HideUnchangedRegionsFeature = HideUnchangedRegionsFeature = HideUnchangedRegionsFeature_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService)
    ], HideUnchangedRegionsFeature);
    class CollapsedCodeOverlayWidget extends utils_1.ViewZoneOverlayWidget {
        constructor(_editor, _viewZone, _unchangedRegion, _unchangedRegionRange, _hide, _modifiedOutlineSource, _revealModifiedHiddenLine, _options) {
            const root = (0, dom_1.h)('div.diff-hidden-lines-widget');
            super(_editor, _viewZone, root.root);
            this._editor = _editor;
            this._unchangedRegion = _unchangedRegion;
            this._unchangedRegionRange = _unchangedRegionRange;
            this._hide = _hide;
            this._modifiedOutlineSource = _modifiedOutlineSource;
            this._revealModifiedHiddenLine = _revealModifiedHiddenLine;
            this._options = _options;
            this._nodes = (0, dom_1.h)('div.diff-hidden-lines', [
                (0, dom_1.h)('div.top@top', { title: (0, nls_1.localize)('diff.hiddenLines.top', 'Click or drag to show more above') }),
                (0, dom_1.h)('div.center@content', { style: { display: 'flex' } }, [
                    (0, dom_1.h)('div@first', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: '0' } }, [(0, dom_1.$)('a', { title: (0, nls_1.localize)('showUnchangedRegion', 'Show Unchanged Region'), role: 'button', onclick: () => { this._unchangedRegion.showAll(undefined); } }, ...(0, iconLabels_1.renderLabelWithIcons)('$(unfold)'))]),
                    (0, dom_1.h)('div@others', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center' } }),
                ]),
                (0, dom_1.h)('div.bottom@bottom', { title: (0, nls_1.localize)('diff.bottom', 'Click or drag to show more below'), role: 'button' }),
            ]);
            root.root.appendChild(this._nodes.root);
            const layoutInfo = (0, observable_1.observableFromEvent)(this._editor.onDidLayoutChange, () => this._editor.getLayoutInfo());
            if (!this._hide) {
                this._register((0, utils_1.applyStyle)(this._nodes.first, { width: layoutInfo.map((l) => l.contentLeft) }));
            }
            else {
                (0, dom_1.reset)(this._nodes.first);
            }
            this._register((0, observable_1.autorun)(reader => {
                const isFullyRevealed = this._unchangedRegion.visibleLineCountTop.read(reader) + this._unchangedRegion.visibleLineCountBottom.read(reader) === this._unchangedRegion.lineCount;
                this._nodes.bottom.classList.toggle('canMoveTop', !isFullyRevealed);
                this._nodes.bottom.classList.toggle('canMoveBottom', this._unchangedRegion.visibleLineCountBottom.read(reader) > 0);
                this._nodes.top.classList.toggle('canMoveTop', this._unchangedRegion.visibleLineCountTop.read(reader) > 0);
                this._nodes.top.classList.toggle('canMoveBottom', !isFullyRevealed);
                const isDragged = this._unchangedRegion.isDragged.read(reader);
                const domNode = this._editor.getDomNode();
                if (domNode) {
                    domNode.classList.toggle('draggingUnchangedRegion', !!isDragged);
                    if (isDragged === 'top') {
                        domNode.classList.toggle('canMoveTop', this._unchangedRegion.visibleLineCountTop.read(reader) > 0);
                        domNode.classList.toggle('canMoveBottom', !isFullyRevealed);
                    }
                    else if (isDragged === 'bottom') {
                        domNode.classList.toggle('canMoveTop', !isFullyRevealed);
                        domNode.classList.toggle('canMoveBottom', this._unchangedRegion.visibleLineCountBottom.read(reader) > 0);
                    }
                    else {
                        domNode.classList.toggle('canMoveTop', false);
                        domNode.classList.toggle('canMoveBottom', false);
                    }
                }
            }));
            const editor = this._editor;
            this._register((0, dom_1.addDisposableListener)(this._nodes.top, 'mousedown', e => {
                if (e.button !== 0) {
                    return;
                }
                this._nodes.top.classList.toggle('dragging', true);
                this._nodes.root.classList.toggle('dragging', true);
                e.preventDefault();
                const startTop = e.clientY;
                let didMove = false;
                const cur = this._unchangedRegion.visibleLineCountTop.get();
                this._unchangedRegion.isDragged.set('top', undefined);
                const window = (0, dom_1.getWindow)(this._nodes.top);
                const mouseMoveListener = (0, dom_1.addDisposableListener)(window, 'mousemove', e => {
                    const currentTop = e.clientY;
                    const delta = currentTop - startTop;
                    didMove = didMove || Math.abs(delta) > 2;
                    const lineDelta = Math.round(delta / editor.getOption(66 /* EditorOption.lineHeight */));
                    const newVal = Math.max(0, Math.min(cur + lineDelta, this._unchangedRegion.getMaxVisibleLineCountTop()));
                    this._unchangedRegion.visibleLineCountTop.set(newVal, undefined);
                });
                const mouseUpListener = (0, dom_1.addDisposableListener)(window, 'mouseup', e => {
                    if (!didMove) {
                        this._unchangedRegion.showMoreAbove(this._options.hideUnchangedRegionsRevealLineCount.get(), undefined);
                    }
                    this._nodes.top.classList.toggle('dragging', false);
                    this._nodes.root.classList.toggle('dragging', false);
                    this._unchangedRegion.isDragged.set(undefined, undefined);
                    mouseMoveListener.dispose();
                    mouseUpListener.dispose();
                });
            }));
            this._register((0, dom_1.addDisposableListener)(this._nodes.bottom, 'mousedown', e => {
                if (e.button !== 0) {
                    return;
                }
                this._nodes.bottom.classList.toggle('dragging', true);
                this._nodes.root.classList.toggle('dragging', true);
                e.preventDefault();
                const startTop = e.clientY;
                let didMove = false;
                const cur = this._unchangedRegion.visibleLineCountBottom.get();
                this._unchangedRegion.isDragged.set('bottom', undefined);
                const window = (0, dom_1.getWindow)(this._nodes.bottom);
                const mouseMoveListener = (0, dom_1.addDisposableListener)(window, 'mousemove', e => {
                    const currentTop = e.clientY;
                    const delta = currentTop - startTop;
                    didMove = didMove || Math.abs(delta) > 2;
                    const lineDelta = Math.round(delta / editor.getOption(66 /* EditorOption.lineHeight */));
                    const newVal = Math.max(0, Math.min(cur - lineDelta, this._unchangedRegion.getMaxVisibleLineCountBottom()));
                    const top = editor.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);
                    this._unchangedRegion.visibleLineCountBottom.set(newVal, undefined);
                    const top2 = editor.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);
                    editor.setScrollTop(editor.getScrollTop() + (top2 - top));
                });
                const mouseUpListener = (0, dom_1.addDisposableListener)(window, 'mouseup', e => {
                    this._unchangedRegion.isDragged.set(undefined, undefined);
                    if (!didMove) {
                        const top = editor.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);
                        this._unchangedRegion.showMoreBelow(this._options.hideUnchangedRegionsRevealLineCount.get(), undefined);
                        const top2 = editor.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);
                        editor.setScrollTop(editor.getScrollTop() + (top2 - top));
                    }
                    this._nodes.bottom.classList.toggle('dragging', false);
                    this._nodes.root.classList.toggle('dragging', false);
                    mouseMoveListener.dispose();
                    mouseUpListener.dispose();
                });
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update labels */
                const children = [];
                if (!this._hide) {
                    const lineCount = _unchangedRegion.getHiddenModifiedRange(reader).length;
                    const linesHiddenText = (0, nls_1.localize)('hiddenLines', '{0} hidden lines', lineCount);
                    const span = (0, dom_1.$)('span', { title: (0, nls_1.localize)('diff.hiddenLines.expandAll', 'Double click to unfold') }, linesHiddenText);
                    span.addEventListener('dblclick', e => {
                        if (e.button !== 0) {
                            return;
                        }
                        e.preventDefault();
                        this._unchangedRegion.showAll(undefined);
                    });
                    children.push(span);
                    const range = this._unchangedRegion.getHiddenModifiedRange(reader);
                    const items = this._modifiedOutlineSource.getBreadcrumbItems(range, reader);
                    if (items.length > 0) {
                        children.push((0, dom_1.$)('span', undefined, '\u00a0\u00a0|\u00a0\u00a0'));
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            const icon = languages_1.SymbolKinds.toIcon(item.kind);
                            const divItem = (0, dom_1.h)('div.breadcrumb-item', {
                                style: { display: 'flex', alignItems: 'center' },
                            }, [
                                (0, iconLabels_1.renderIcon)(icon),
                                '\u00a0',
                                item.name,
                                ...(i === items.length - 1
                                    ? []
                                    : [(0, iconLabels_1.renderIcon)(codicons_1.Codicon.chevronRight)])
                            ]).root;
                            children.push(divItem);
                            divItem.onclick = () => {
                                this._revealModifiedHiddenLine(item.startLineNumber);
                            };
                        }
                    }
                }
                (0, dom_1.reset)(this._nodes.others, ...children);
            }));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlkZVVuY2hhbmdlZFJlZ2lvbnNGZWF0dXJlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9mZWF0dXJlcy9oaWRlVW5jaGFuZ2VkUmVnaW9uc0ZlYXR1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBCaEc7O09BRUc7SUFDSSxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVOztpQkFDbEMsOEJBQXlCLEdBQUcsSUFBQSw0QkFBZSxFQUFxSCwwQkFBMEIsRUFBRSxTQUFTLENBQUMsQUFBN0ssQ0FBOEs7UUFDeE4sTUFBTSxDQUFDLDJCQUEyQixDQUFDLE9BQTZHO1lBQ3RKLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFjRCxJQUFXLHFCQUFxQixLQUFLLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztRQUUxRSxZQUNrQixRQUEyQixFQUMzQixVQUF3RCxFQUN4RCxRQUEyQixFQUNyQixxQkFBNkQ7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFMUyxhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUMzQixlQUFVLEdBQVYsVUFBVSxDQUE4QztZQUN4RCxhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUNKLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFsQnBFLDJCQUFzQixHQUFHLElBQUEsMkJBQWlCLEVBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQzVFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxPQUFPLEdBQUcs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