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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/trustedTypes", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/themables", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/config/editorOptions", "vs/editor/common/core/lineRange", "vs/editor/common/core/offsetRange", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/diff/rangeMapping", "vs/editor/common/languages/language", "vs/editor/common/tokens/lineTokens", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/common/viewModel", "vs/nls", "vs/platform/audioCues/browser/audioCueService", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/iconRegistry", "vs/css!./accessibleDiffViewer"], function (require, exports, dom_1, trustedTypes_1, actionbar_1, scrollableElement_1, actions_1, arrays_1, codicons_1, lifecycle_1, observable_1, themables_1, domFontInfo_1, utils_1, editorOptions_1, lineRange_1, offsetRange_1, position_1, range_1, rangeMapping_1, language_1, lineTokens_1, viewLineRenderer_1, viewModel_1, nls_1, audioCueService_1, instantiation_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibleDiffViewer = void 0;
    const accessibleDiffViewerInsertIcon = (0, iconRegistry_1.registerIcon)('diff-review-insert', codicons_1.Codicon.add, (0, nls_1.localize)('accessibleDiffViewerInsertIcon', 'Icon for \'Insert\' in accessible diff viewer.'));
    const accessibleDiffViewerRemoveIcon = (0, iconRegistry_1.registerIcon)('diff-review-remove', codicons_1.Codicon.remove, (0, nls_1.localize)('accessibleDiffViewerRemoveIcon', 'Icon for \'Remove\' in accessible diff viewer.'));
    const accessibleDiffViewerCloseIcon = (0, iconRegistry_1.registerIcon)('diff-review-close', codicons_1.Codicon.close, (0, nls_1.localize)('accessibleDiffViewerCloseIcon', 'Icon for \'Close\' in accessible diff viewer.'));
    let AccessibleDiffViewer = class AccessibleDiffViewer extends lifecycle_1.Disposable {
        static { this._ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('diffReview', { createHTML: value => value }); }
        constructor(_parentNode, _visible, _setVisible, _canClose, _width, _height, _diffs, _editors, _instantiationService) {
            super();
            this._parentNode = _parentNode;
            this._visible = _visible;
            this._setVisible = _setVisible;
            this._canClose = _canClose;
            this._width = _width;
            this._height = _height;
            this._diffs = _diffs;
            this._editors = _editors;
            this._instantiationService = _instantiationService;
            this._state = (0, observable_1.derivedWithStore)(this, (reader, store) => {
                const visible = this._visible.read(reader);
                this._parentNode.style.visibility = visible ? 'visible' : 'hidden';
                if (!visible) {
                    return null;
                }
                const model = store.add(this._instantiationService.createInstance(ViewModel, this._diffs, this._editors, this._setVisible, this._canClose));
                const view = store.add(this._instantiationService.createInstance(View, this._parentNode, model, this._width, this._height, this._editors));
                return { model, view, };
            }).recomputeInitiallyAndOnChange(this._store);
        }
        next() {
            (0, observable_1.transaction)(tx => {
                const isVisible = this._visible.get();
                this._setVisible(true, tx);
                if (isVisible) {
                    this._state.get().model.nextGroup(tx);
                }
            });
        }
        prev() {
            (0, observable_1.transaction)(tx => {
                this._setVisible(true, tx);
                this._state.get().model.previousGroup(tx);
            });
        }
        close() {
            (0, observable_1.transaction)(tx => {
                this._setVisible(false, tx);
            });
        }
    };
    exports.AccessibleDiffViewer = AccessibleDiffViewer;
    exports.AccessibleDiffViewer = AccessibleDiffViewer = __decorate([
        __param(8, instantiation_1.IInstantiationService)
    ], AccessibleDiffViewer);
    let ViewModel = class ViewModel extends lifecycle_1.Disposable {
        constructor(_diffs, _editors, _setVisible, canClose, _audioCueService) {
            super();
            this._diffs = _diffs;
            this._editors = _editors;
            this._setVisible = _setVisible;
            this.canClose = canClose;
            this._audioCueService = _audioCueService;
            this._groups = (0, observable_1.observableValue)(this, []);
            this._currentGroupIdx = (0, observable_1.observableValue)(this, 0);
            this._currentElementIdx = (0, observable_1.observableValue)(this, 0);
            this.groups = this._groups;
            this.currentGroup = this._currentGroupIdx.map((idx, r) => this._groups.read(r)[idx]);
            this.currentGroupIndex = this._currentGroupIdx;
            this.currentElement = this._currentElementIdx.map((idx, r) => this.currentGroup.read(r)?.lines[idx]);
            this._register((0, observable_1.autorun)(reader => {
                /** @description update groups */
                const diffs = this._diffs.read(reader);
                if (!diffs) {
                    this._groups.set([], undefined);
                    return;
                }
                const groups = computeViewElementGroups(diffs, this._editors.original.getModel().getLineCount(), this._editors.modified.getModel().getLineCount());
                (0, observable_1.transaction)(tx => {
                    const p = this._editors.modified.getPosition();
                    if (p) {
                        const nextGroup = groups.findIndex(g => p?.lineNumber < g.range.modified.endLineNumberExclusive);
                        if (nextGroup !== -1) {
                            this._currentGroupIdx.set(nextGroup, tx);
                        }
                    }
                    this._groups.set(groups, tx);
                });
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description play audio-cue for diff */
                const currentViewItem = this.currentElement.read(reader);
                if (currentViewItem?.type === LineType.Deleted) {
                    this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineDeleted, { source: 'accessibleDiffViewer.currentElementChanged' });
                }
                else if (currentViewItem?.type === LineType.Added) {
                    this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineInserted, { source: 'accessibleDiffViewer.currentElementChanged' });
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description select lines in editor */
                // This ensures editor commands (like revert/stage) work
                const currentViewItem = this.currentElement.read(reader);
                if (currentViewItem && currentViewItem.type !== LineType.Header) {
                    const lineNumber = currentViewItem.modifiedLineNumber ?? currentViewItem.diff.modified.startLineNumber;
                    this._editors.modified.setSelection(range_1.Range.fromPositions(new position_1.Position(lineNumber, 1)));
                }
            }));
        }
        _goToGroupDelta(delta, tx) {
            const groups = this.groups.get();
            if (!groups || groups.length <= 1) {
                return;
            }
            (0, observable_1.subtransaction)(tx, tx => {
                this._currentGroupIdx.set(offsetRange_1.OffsetRange.ofLength(groups.length).clipCyclic(this._currentGroupIdx.get() + delta), tx);
                this._currentElementIdx.set(0, tx);
            });
        }
        nextGroup(tx) { this._goToGroupDelta(1, tx); }
        previousGroup(tx) { this._goToGroupDelta(-1, tx); }
        _goToLineDelta(delta) {
            const group = this.currentGroup.get();
            if (!group || group.lines.length <= 1) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                this._currentElementIdx.set(offsetRange_1.OffsetRange.ofLength(group.lines.length).clip(this._currentElementIdx.get() + delta), tx);
            });
        }
        goToNextLine() { this._goToLineDelta(1); }
        goToPreviousLine() { this._goToLineDelta(-1); }
        goToLine(line) {
            const group = this.currentGroup.get();
            if (!group) {
                return;
            }
            const idx = group.lines.indexOf(line);
            if (idx === -1) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                this._currentElementIdx.set(idx, tx);
            });
        }
        revealCurrentElementInEditor() {
            this._setVisible(false, undefined);
            const curElem = this.currentElement.get();
            if (curElem) {
                if (curElem.type === LineType.Deleted) {
                    this._editors.original.setSelection(range_1.Range.fromPositions(new position_1.Position(curElem.originalLineNumber, 1)));
                    this._editors.original.revealLine(curElem.originalLineNumber);
                    this._editors.original.focus();
                }
                else {
                    if (curElem.type !== LineType.Header) {
                        this._editors.modified.setSelection(range_1.Range.fromPositions(new position_1.Position(curElem.modifiedLineNumber, 1)));
                        this._editors.modified.revealLine(curElem.modifiedLineNumber);
                    }
                    this._editors.modified.focus();
                }
            }
        }
        close() {
            this._setVisible(false, undefined);
            this._editors.modified.focus();
        }
    };
    ViewModel = __decorate([
        __param(4, audioCueService_1.IAudioCueService)
    ], ViewModel);
    const viewElementGroupLineMargin = 3;
    function computeViewElementGroups(diffs, originalLineCount, modifiedLineCount) {
        const result = [];
        for (const g of (0, arrays_1.groupAdjacentBy)(diffs, (a, b) => (b.modified.startLineNumber - a.modified.endLineNumberExclusive < 2 * viewElementGroupLineMargin))) {
            const viewElements = [];
            viewElements.push(new HeaderViewElement());
            const origFullRange = new lineRange_1.LineRange(Math.max(1, g[0].original.startLineNumber - viewElementGroupLineMargin), Math.min(g[g.length - 1].original.endLineNumberExclusive + viewElementGroupLineMargin, originalLineCount + 1));
            const modifiedFullRange = new lineRange_1.LineRange(Math.max(1, g[0].modified.startLineNumber - viewElementGroupLineMargin), Math.min(g[g.length - 1].modified.endLineNumberExclusive + viewElementGroupLineMargin, modifiedLineCount + 1));
            (0, arrays_1.forEachAdjacent)(g, (a, b) => {
                const origRange = new lineRange_1.LineRange(a ? a.original.endLineNumberExclusive : origFullRange.startLineNumber, b ? b.original.startLineNumber : origFullRange.endLineNumberExclusive);
                const modifiedRange = new lineRange_1.LineRange(a ? a.modified.endLineNumberExclusive : modifiedFullRange.startLineNumber, b ? b.modified.startLineNumber : modifiedFullRange.endLineNumberExclusive);
                origRange.forEach(origLineNumber => {
                    viewElements.push(new UnchangedLineViewElement(origLineNumber, modifiedRange.startLineNumber + (origLineNumber - origRange.startLineNumber)));
                });
                if (b) {
                    b.original.forEach(origLineNumber => {
                        viewElements.push(new DeletedLineViewElement(b, origLineNumber));
                    });
                    b.modified.forEach(modifiedLineNumber => {
                        viewElements.push(new AddedLineViewElement(b, modifiedLineNumber));
                    });
                }
            });
            const modifiedRange = g[0].modified.join(g[g.length - 1].modified);
            const originalRange = g[0].original.join(g[g.length - 1].original);
            result.push(new ViewElementGroup(new rangeMapping_1.LineRangeMapping(modifiedRange, originalRange), viewElements));
        }
        return result;
    }
    var LineType;
    (function (LineType) {
        LineType[LineType["Header"] = 0] = "Header";
        LineType[LineType["Unchanged"] = 1] = "Unchanged";
        LineType[LineType["Deleted"] = 2] = "Deleted";
        LineType[LineType["Added"] = 3] = "Added";
    })(LineType || (LineType = {}));
    class ViewElementGroup {
        constructor(range, lines) {
            this.range = range;
            this.lines = lines;
        }
    }
    class HeaderViewElement {
        constructor() {
            this.type = LineType.Header;
        }
    }
    class DeletedLineViewElement {
        constructor(diff, originalLineNumber) {
            this.diff = diff;
            this.originalLineNumber = originalLineNumber;
            this.type = LineType.Deleted;
            this.modifiedLineNumber = undefined;
        }
    }
    class AddedLineViewElement {
        constructor(diff, modifiedLineNumber) {
            this.diff = diff;
            this.modifiedLineNumber = modifiedLineNumber;
            this.type = LineType.Added;
            this.originalLineNumber = undefined;
        }
    }
    class UnchangedLineViewElement {
        constructor(originalLineNumber, modifiedLineNumber) {
            this.originalLineNumber = originalLineNumber;
            this.modifiedLineNumber = modifiedLineNumber;
            this.type = LineType.Unchanged;
        }
    }
    let View = class View extends lifecycle_1.Disposable {
        constructor(_element, _model, _width, _height, _editors, _languageService) {
            super();
            this._element = _element;
            this._model = _model;
            this._width = _width;
            this._height = _height;
            this._editors = _editors;
            this._languageService = _languageService;
            this.domNode = this._element;
            this.domNode.className = 'diff-review monaco-editor-background';
            const actionBarContainer = document.createElement('div');
            actionBarContainer.className = 'diff-review-actions';
            this._actionBar = this._register(new actionbar_1.ActionBar(actionBarContainer));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update actions */
                this._actionBar.clear();
                if (this._model.canClose.read(reader)) {
                    this._actionBar.push(new actions_1.Action('diffreview.close', (0, nls_1.localize)('label.close', "Close"), 'close-diff-review ' + themables_1.ThemeIcon.asClassName(accessibleDiffViewerCloseIcon), true, async () => _model.close()), { label: false, icon: true });
                }
            }));
            this._content = document.createElement('div');
            this._content.className = 'diff-review-content';
            this._content.setAttribute('role', 'code');
            this._scrollbar = this._register(new scrollableElement_1.DomScrollableElement(this._content, {}));
            (0, dom_1.reset)(this.domNode, this._scrollbar.getDomNode(), actionBarContainer);
            this._register((0, lifecycle_1.toDisposable)(() => { (0, dom_1.reset)(this.domNode); }));
            this._register((0, utils_1.applyStyle)(this.domNode, { width: this._width, height: this._height }));
            this._register((0, utils_1.applyStyle)(this._content, { width: this._width, height: this._height }));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description render */
                this._model.currentGroup.read(reader);
                this._render(store);
            }));
            // TODO@hediet use commands
            this._register((0, dom_1.addStandardDisposableListener)(this.domNode, 'keydown', (e) => {
                if (e.equals(18 /* KeyCode.DownArrow */)
                    || e.equals(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */)
                    || e.equals(512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */)) {
                    e.preventDefault();
                    this._model.goToNextLine();
                }
                if (e.equals(16 /* KeyCode.UpArrow */)
                    || e.equals(2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */)
                    || e.equals(512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */)) {
                    e.preventDefault();
                    this._model.goToPreviousLine();
                }
                if (e.equals(9 /* KeyCode.Escape */)
                    || e.equals(2048 /* KeyMod.CtrlCmd */ | 9 /* KeyCode.Escape */)
                    || e.equals(512 /* KeyMod.Alt */ | 9 /* KeyCode.Escape */)
                    || e.equals(1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */)) {
                    e.preventDefault();
                    this._model.close();
                }
                if (e.equals(10 /* KeyCode.Space */)
                    || e.equals(3 /* KeyCode.Enter */)) {
                    e.preventDefault();
                    this._model.revealCurrentElementInEditor();
                }
            }));
        }
        _render(store) {
            const originalOptions = this._editors.original.getOptions();
            const modifiedOptions = this._editors.modified.getOptions();
            const container = document.createElement('div');
            container.className = 'diff-review-table';
            container.setAttribute('role', 'list');
            container.setAttribute('aria-label', (0, nls_1.localize)('ariaLabel', 'Accessible Diff Viewer. Use arrow up and down to navigate.'));
            (0, domFontInfo_1.applyFontInfo)(container, modifiedOptions.get(50 /* EditorOption.fontInfo */));
            (0, dom_1.reset)(this._content, container);
            const originalModel = this._editors.original.getModel();
            const modifiedModel = this._editors.modified.getModel();
            if (!originalModel || !modifiedModel) {
                return;
            }
            const originalModelOpts = originalModel.getOptions();
            const modifiedModelOpts = modifiedModel.getOptions();
            const lineHeight = modifiedOptions.get(66 /* EditorOption.lineHeight */);
            const group = this._model.currentGroup.get();
            for (const viewItem of group?.lines || []) {
                if (!group) {
                    break;
                }
                let row;
                if (viewItem.type === LineType.Header) {
                    const header = document.createElement('div');
                    header.className = 'diff-review-row';
                    header.setAttribute('role', 'listitem');
                    const r = group.range;
                    const diffIndex = this._model.currentGroupIndex.get();
                    const diffsLength = this._model.groups.get().length;
                    const getAriaLines = (lines) => lines === 0 ? (0, nls_1.localize)('no_lines_changed', "no lines changed")
                        : lines === 1 ? (0, nls_1.localize)('one_line_changed', "1 line changed")
                            : (0, nls_1.localize)('more_lines_changed', "{0} lines changed", lines);
                    const originalChangedLinesCntAria = getAriaLines(r.original.length);
                    const modifiedChangedLinesCntAria = getAriaLines(r.modified.length);
                    header.setAttribute('aria-label', (0, nls_1.localize)({
                        key: 'header',
                        comment: [
                            'This is the ARIA label for a git diff header.',
                            'A git diff header looks like this: @@ -154,12 +159,39 @@.',
                            'That encodes that at original line 154 (which is now line 159), 12 lines were removed/changed with 39 lines.',
                            'Variables 0 and 1 refer to the diff index out of total number of diffs.',
                            'Variables 2 and 4 will be numbers (a line number).',
                            'Variables 3 and 5 will be "no lines changed", "1 line changed" or "X lines changed", localized separately.'
                        ]
                    }, "Difference {0} of {1}: original line {2}, {3}, modified line {4}, {5}", (diffIndex + 1), diffsLength, r.original.startLineNumber, originalChangedLinesCntAria, r.modified.startLineNumber, modifiedChangedLinesCntAria));
                    const cell = document.createElement('div');
                    cell.className = 'diff-review-cell diff-review-summary';
                    // e.g.: `1/10: @@ -504,7 +517,7 @@`
                    cell.appendChild(document.createTextNode(`${diffIndex + 1}/${diffsLength}: @@ -${r.original.startLineNumber},${r.original.length} +${r.modified.startLineNumber},${r.modified.length} @@`));
                    header.appendChild(cell);
                    row = header;
                }
                else {
                    row = this._createRow(viewItem, lineHeight, this._width.get(), originalOptions, originalModel, originalModelOpts, modifiedOptions, modifiedModel, modifiedModelOpts);
                }
                container.appendChild(row);
                const isSelectedObs = (0, observable_1.derived)(reader => /** @description isSelected */ this._model.currentElement.read(reader) === viewItem);
                store.add((0, observable_1.autorun)(reader => {
                    /** @description update tab index */
                    const isSelected = isSelectedObs.read(reader);
                    row.tabIndex = isSelected ? 0 : -1;
                    if (isSelected) {
                        row.focus();
                    }
                }));
                store.add((0, dom_1.addDisposableListener)(row, 'focus', () => {
                    this._model.goToLine(viewItem);
                }));
            }
            this._scrollbar.scanDomNode();
        }
        _createRow(item, lineHeight, width, originalOptions, originalModel, originalModelOpts, modifiedOptions, modifiedModel, modifiedModelOpts) {
            const originalLayoutInfo = originalOptions.get(143 /* EditorOption.layoutInfo */);
            const originalLineNumbersWidth = originalLayoutInfo.glyphMarginWidth + originalLayoutInfo.lineNumbersWidth;
            const modifiedLayoutInfo = modifiedOptions.get(143 /* EditorOption.layoutInfo */);
            const modifiedLineNumbersWidth = 10 + modifiedLayoutInfo.glyphMarginWidth + modifiedLayoutInfo.lineNumbersWidth;
            let rowClassName = 'diff-review-row';
            let lineNumbersExtraClassName = '';
            const spacerClassName = 'diff-review-spacer';
            let spacerIcon = null;
            switch (item.type) {
                case LineType.Added:
                    rowClassName = 'diff-review-row line-insert';
                    lineNumbersExtraClassName = ' char-insert';
                    spacerIcon = accessibleDiffViewerInsertIcon;
                    break;
                case LineType.Deleted:
                    rowClassName = 'diff-review-row line-delete';
                    lineNumbersExtraClassName = ' char-delete';
                    spacerIcon = accessibleDiffViewerRemoveIcon;
                    break;
            }
            const row = document.createElement('div');
            row.style.minWidth = width + 'px';
            row.className = rowClassName;
            row.setAttribute('role', 'listitem');
            row.ariaLevel = '';
            const cell = document.createElement('div');
            cell.className = 'diff-review-cell';
            cell.style.height = `${lineHeight}px`;
            row.appendChild(cell);
            const originalLineNumber = document.createElement('span');
            originalLineNumber.style.width = (originalLineNumbersWidth + 'px');
            originalLineNumber.style.minWidth = (originalLineNumbersWidth + 'px');
            originalLineNumber.className = 'diff-review-line-number' + lineNumbersExtraClassName;
            if (item.originalLineNumber !== undefined) {
                originalLineNumber.appendChild(document.createTextNode(String(item.originalLineNumber)));
            }
            else {
                originalLineNumber.innerText = '\u00a0';
            }
            cell.appendChild(originalLineNumber);
            const modifiedLineNumber = document.createElement('span');
            modifiedLineNumber.style.width = (modifiedLineNumbersWidth + 'px');
            modifiedLineNumber.style.minWidth = (modifiedLineNumbersWidth + 'px');
            modifiedLineNumber.style.paddingRight = '10px';
            modifiedLineNumber.className = 'diff-review-line-number' + lineNumbersExtraClassName;
            if (item.modifiedLineNumber !== undefined) {
                modifiedLineNumber.appendChild(document.createTextNode(String(item.modifiedLineNumber)));
            }
            else {
                modifiedLineNumber.innerText = '\u00a0';
            }
            cell.appendChild(modifiedLineNumber);
            const spacer = document.createElement('span');
            spacer.className = spacerClassName;
            if (spacerIcon) {
                const spacerCodicon = document.createElement('span');
                spacerCodicon.className = themables_1.ThemeIcon.asClassName(spacerIcon);
                spacerCodicon.innerText = '\u00a0\u00a0';
                spacer.appendChild(spacerCodicon);
            }
            else {
                spacer.innerText = '\u00a0\u00a0';
            }
            cell.appendChild(spacer);
            let lineContent;
            if (item.modifiedLineNumber !== undefined) {
                let html = this._getLineHtml(modifiedModel, modifiedOptions, modifiedModelOpts.tabSize, item.modifiedLineNumber, this._languageService.languageIdCodec);
                if (AccessibleDiffViewer._ttPolicy) {
                    html = AccessibleDiffViewer._ttPolicy.createHTML(html);
                }
                cell.insertAdjacentHTML('beforeend', html);
                lineContent = modifiedModel.getLineContent(item.modifiedLineNumber);
            }
            else {
                let html = this._getLineHtml(originalModel, originalOptions, originalModelOpts.tabSize, item.originalLineNumber, this._languageService.languageIdCodec);
                if (AccessibleDiffViewer._ttPolicy) {
                    html = AccessibleDiffViewer._ttPolicy.createHTML(html);
                }
                cell.insertAdjacentHTML('beforeend', html);
                lineContent = originalModel.getLineContent(item.originalLineNumber);
            }
            if (lineContent.length === 0) {
                lineContent = (0, nls_1.localize)('blankLine', "blank");
            }
            let ariaLabel = '';
            switch (item.type) {
                case LineType.Unchanged:
                    if (item.originalLineNumber === item.modifiedLineNumber) {
                        ariaLabel = (0, nls_1.localize)({ key: 'unchangedLine', comment: ['The placeholders are contents of the line and should not be translated.'] }, "{0} unchanged line {1}", lineContent, item.originalLineNumber);
                    }
                    else {
                        ariaLabel = (0, nls_1.localize)('equalLine', "{0} original line {1} modified line {2}", lineContent, item.originalLineNumber, item.modifiedLineNumber);
                    }
                    break;
                case LineType.Added:
                    ariaLabel = (0, nls_1.localize)('insertLine', "+ {0} modified line {1}", lineContent, item.modifiedLineNumber);
                    break;
                case LineType.Deleted:
                    ariaLabel = (0, nls_1.localize)('deleteLine', "- {0} original line {1}", lineContent, item.originalLineNumber);
                    break;
            }
            row.setAttribute('aria-label', ariaLabel);
            return row;
        }
        _getLineHtml(model, options, tabSize, lineNumber, languageIdCodec) {
            const lineContent = model.getLineContent(lineNumber);
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const lineTokens = lineTokens_1.LineTokens.createEmpty(lineContent, languageIdCodec);
            const isBasicASCII = viewModel_1.ViewLineRenderingData.isBasicASCII(lineContent, model.mightContainNonBasicASCII());
            const containsRTL = viewModel_1.ViewLineRenderingData.containsRTL(lineContent, isBasicASCII, model.mightContainRTL());
            const r = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput((fontInfo.isMonospace && !options.get(33 /* EditorOption.disableMonospaceOptimizations */)), fontInfo.canUseHalfwidthRightwardsArrow, lineContent, false, isBasicASCII, containsRTL, 0, lineTokens, [], tabSize, 0, fontInfo.spaceWidth, fontInfo.middotWidth, fontInfo.wsmiddotWidth, options.get(116 /* EditorOption.stopRenderingLineAfter */), options.get(98 /* EditorOption.renderWhitespace */), options.get(93 /* EditorOption.renderControlCharacters */), options.get(51 /* EditorOption.fontLigatures */) !== editorOptions_1.EditorFontLigatures.OFF, null));
            return r.html;
        }
    };
    View = __decorate([
        __param(5, language_1.ILanguageService)
    ], View);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJsZURpZmZWaWV3ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL2NvbXBvbmVudHMvYWNjZXNzaWJsZURpZmZWaWV3ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0NoRyxNQUFNLDhCQUE4QixHQUFHLElBQUEsMkJBQVksRUFBQyxvQkFBb0IsRUFBRSxrQkFBTyxDQUFDLEdBQUcsRUFBRSxJQUFBLGNBQVEsRUFBQyxnQ0FBZ0MsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDLENBQUM7SUFDckwsTUFBTSw4QkFBOEIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsb0JBQW9CLEVBQUUsa0JBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0NBQWdDLEVBQUUsZ0RBQWdELENBQUMsQ0FBQyxDQUFDO0lBQ3hMLE1BQU0sNkJBQTZCLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG1CQUFtQixFQUFFLGtCQUFPLENBQUMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLCtCQUErQixFQUFFLCtDQUErQyxDQUFDLENBQUMsQ0FBQztJQUU1SyxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLHNCQUFVO2lCQUNyQyxjQUFTLEdBQUcsSUFBQSx1Q0FBd0IsRUFBQyxZQUFZLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxBQUF6RSxDQUEwRTtRQUVqRyxZQUNrQixXQUF3QixFQUN4QixRQUE4QixFQUM5QixXQUFxRSxFQUNyRSxTQUErQixFQUMvQixNQUEyQixFQUMzQixPQUE0QixFQUM1QixNQUEyRCxFQUMzRCxRQUEyQixFQUNyQixxQkFBNkQ7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFWUyxnQkFB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