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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/browser/mouseEvent", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/async", "vs/base/common/themables", "vs/editor/contrib/folding/browser/foldingDecorations", "vs/workbench/contrib/notebook/browser/controller/foldingController"], function (require, exports, nls_1, DOM, touch_1, mouseEvent_1, event_1, lifecycle_1, actionCommonCategories_1, actions_1, configuration_1, contextkey_1, contextView_1, notebookCommon_1, async_1, themables_1, foldingDecorations_1, foldingController_1) {
    "use strict";
    var NotebookStickyScroll_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeContent = exports.NotebookStickyScroll = exports.NotebookStickyLine = exports.ToggleNotebookStickyScroll = void 0;
    class ToggleNotebookStickyScroll extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.action.toggleNotebookStickyScroll',
                title: {
                    value: (0, nls_1.localize)('toggleStickyScroll', "Toggle Notebook Sticky Scroll"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'mitoggleStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Toggle Notebook Sticky Scroll"),
                    original: 'Toggle Notebook Sticky Scroll',
                },
                category: actionCommonCategories_1.Categories.View,
                toggled: {
                    condition: contextkey_1.ContextKeyExpr.equals('config.notebook.stickyScroll.enabled', true),
                    title: (0, nls_1.localize)('notebookStickyScroll', "Notebook Sticky Scroll"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miNotebookStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Notebook Sticky Scroll"),
                },
                menu: [
                    { id: actions_1.MenuId.CommandPalette },
                    { id: actions_1.MenuId.NotebookStickyScrollContext }
                ]
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('notebook.stickyScroll.enabled');
            return configurationService.updateValue('notebook.stickyScroll.enabled', newValue);
        }
    }
    exports.ToggleNotebookStickyScroll = ToggleNotebookStickyScroll;
    class NotebookStickyLine extends lifecycle_1.Disposable {
        constructor(element, foldingIcon, header, entry, notebookEditor) {
            super();
            this.element = element;
            this.foldingIcon = foldingIcon;
            this.header = header;
            this.entry = entry;
            this.notebookEditor = notebookEditor;
            // click the header to focus the cell
            this._register(DOM.addDisposableListener(this.header, DOM.EventType.CLICK || touch_1.EventType.Tap, () => {
                this.focusCell();
            }));
            // click the folding icon to fold the range covered by the header
            this._register(DOM.addDisposableListener(this.foldingIcon.domNode, DOM.EventType.CLICK || touch_1.EventType.Tap, () => {
                if (this.entry.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                    const currentFoldingState = this.entry.cell.foldingState;
                    this.toggleFoldRange(currentFoldingState);
                }
            }));
            // folding icon hovers
            // this._register(DOM.addDisposableListener(this.element, DOM.EventType.MOUSE_OVER, () => {
            // 	this.foldingIcon.setVisible(true);
            // }));
            // this._register(DOM.addDisposableListener(this.element, DOM.EventType.MOUSE_OUT, () => {
            // 	this.foldingIcon.setVisible(false);
            // }));
        }
        toggleFoldRange(currentState) {
            const foldingController = this.notebookEditor.getContribution(foldingController_1.FoldingController.id);
            const index = this.entry.index;
            const headerLevel = this.entry.level;
            const newFoldingState = (currentState === 2 /* CellFoldingState.Collapsed */) ? 1 /* CellFoldingState.Expanded */ : 2 /* CellFoldingState.Collapsed */;
            foldingController.setFoldingStateUp(index, newFoldingState, headerLevel);
            this.focusCell();
        }
        focusCell() {
            this.notebookEditor.focusNotebookCell(this.entry.cell, 'container');
            const cellScrollTop = this.notebookEditor.getAbsoluteTopOfElement(this.entry.cell);
            const parentCount = NotebookStickyLine.getParentCount(this.entry);
            // 1.1 addresses visible cell padding, to make sure we don't focus md cell and also render its sticky line
            this.notebookEditor.setScrollTop(cellScrollTop - (parentCount + 1.1) * 22);
        }
        static getParentCount(entry) {
            let count = 0;
            while (entry.parent) {
                count++;
                entry = entry.parent;
            }
            return count;
        }
    }
    exports.NotebookStickyLine = NotebookStickyLine;
    class StickyFoldingIcon {
        constructor(isCollapsed, dimension) {
            this.isCollapsed = isCollapsed;
            this.dimension = dimension;
            this.domNode = document.createElement('div');
            this.domNode.style.width = `${dimension}px`;
            this.domNode.style.height = `${dimension}px`;
            this.domNode.className = themables_1.ThemeIcon.asClassName(isCollapsed ? foldingDecorations_1.foldingCollapsedIcon : foldingDecorations_1.foldingExpandedIcon);
        }
        setVisible(visible) {
            this.domNode.style.cursor = visible ? 'pointer' : 'default';
            this.domNode.style.opacity = visible ? '1' : '0';
        }
    }
    let NotebookStickyScroll = NotebookStickyScroll_1 = class NotebookStickyScroll extends lifecycle_1.Disposable {
        getDomNode() {
            return this.domNode;
        }
        getCurrentStickyHeight() {
            let height = 0;
            this.currentStickyLines.forEach((value) => {
                if (value.rendered) {
                    height += 22;
                }
            });
            return height;
        }
        setCurrentStickyLines(newStickyLines) {
            this.currentStickyLines = newStickyLines;
        }
        compareStickyLineMaps(mapA, mapB) {
            if (mapA.size !== mapB.size) {
                return false;
            }
            for (const [key, value] of mapA) {
                const otherValue = mapB.get(key);
                if (!otherValue || value.rendered !== otherValue.rendered) {
                    return false;
                }
            }
            return true;
        }
        constructor(domNode, notebookEditor, notebookOutline, notebookCellList, _contextMenuService) {
            super();
            this.domNode = domNode;
            this.notebookEditor = notebookEditor;
            this.notebookOutline = notebookOutline;
            this.notebookCellList = notebookCellList;
            this._contextMenuService = _contextMenuService;
            this._disposables = new lifecycle_1.DisposableStore();
            this.currentStickyLines = new Map();
            this.filteredOutlineEntries = [];
            this._onDidChangeNotebookStickyScroll = this._register(new event_1.Emitter());
            this.onDidChangeNotebookStickyScroll = this._onDidChangeNotebookStickyScroll.event;
            if (this.notebookEditor.notebookOptions.getDisplayOptions().stickyScrollEnabled) {
                this.init();
            }
            this._register(this.notebookEditor.notebookOptions.onDidChangeOptions((e) => {
                if (e.stickyScrollEnabled || e.stickyScrollMode) {
                    this.updateConfig(e);
                }
            }));
            this._register(DOM.addDisposableListener(this.domNode, DOM.EventType.CONTEXT_MENU, async (event) => {
                this.onContextMenu(event);
            }));
        }
        onContextMenu(e) {
            const event = new mouseEvent_1.StandardMouseEvent(DOM.getWindow(this.domNode), e);
            this._contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.NotebookStickyScrollContext,
                getAnchor: () => event,
            });
        }
        updateConfig(e) {
            if (e.stickyScrollEnabled) {
                if (this.notebookEditor.notebookOptions.getDisplayOptions().stickyScrollEnabled) {
                    this.init();
                }
                else {
                    this._disposables.clear();
                    this.notebookOutline.dispose();
                    this.disposeCurrentStickyLines();
                    DOM.clearNode(this.domNode);
                    this.updateDisplay();
                }
            }
            else if (e.stickyScrollMode && this.notebookEditor.notebookOptions.getDisplayOptions().stickyScrollEnabled) {
                this.updateContent(computeContent(this.notebookEditor, this.notebookCellList, this.filteredOutlineEntries, this.getCurrentStickyHeight()));
            }
        }
        init() {
            this.notebookOutline.init();
            this.filteredOutlineEntries = this.notebookOutline.entries.filter(entry => entry.level !== 7);
            this.updateContent(computeContent(this.notebookEditor, this.notebookCellList, this.filteredOutlineEntries, this.getCurrentStickyHeight()));
            this._disposables.add(this.notebookOutline.onDidChange(() => {
                this.filteredOutlineEntries = this.notebookOutline.entries.filter(entry => entry.level !== 7);
                const recompute = computeContent(this.notebookEditor, this.notebookCellList, this.filteredOutlineEntries, this.getCurrentStickyHeight());
                if (!this.compareStickyLineMaps(recompute, this.currentStickyLines)) {
                    this.updateContent(recompute);
                }
            }));
            this._disposables.add(this.notebookEditor.onDidAttachViewModel(() => {
                this.notebookOutline.init();
                this.updateContent(computeContent(this.notebookEditor, this.notebookCellList, this.filteredOutlineEntries, this.getCurrentStickyHeight()));
            }));
            this._disposables.add(this.notebookEditor.onDidScroll(() => {
                const d = new async_1.Delayer(100);
                d.trigger(() => {
                    d.dispose();
                    const recompute = computeContent(this.notebookEditor, this.notebookCellList, this.filteredOutlineEntries, this.getCurrentStickyHeight());
                    if (!this.compareStickyLineMaps(recompute, this.currentStickyLines)) {
                        this.updateContent(recompute);
                    }
                });
            }));
        }
        // take in an cell index, and get the corresponding outline entry
        static getVisibleOutlineEntry(visibleIndex, notebookOutlineEntries) {
            let left = 0;
            let right = notebookOutlineEntries.length - 1;
            let bucket = -1;
            while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                if (notebookOutlineEntries[mid].index === visibleIndex) {
                    bucket = mid;
                    break;
                }
                else if (notebookOutlineEntries[mid].index < visibleIndex) {
                    bucket = mid;
                    left = mid + 1;
                }
                else {
                    right = mid - 1;
                }
            }
            if (bucket !== -1) {
                const rootEntry = notebookOutlineEntries[bucket];
                const flatList = [];
                rootEntry.asFlatList(flatList);
                return flatList.find(entry => entry.index === visibleIndex);
            }
            return undefined;
        }
        updateContent(newMap) {
            DOM.clearNode(this.domNode);
            this.disposeCurrentStickyLines();
            this.renderStickyLines(newMap, this.domNode);
            const oldStickyHeight = this.getCurrentStickyHeight();
            this.setCurrentStickyLines(newMap);
            // (+) = sticky height increased
            // (-) = sticky height decreased
            const sizeDelta = this.getCurrentStickyHeight() - oldStickyHeight;
            if (sizeDelta !== 0) {
                this._onDidChangeNotebookStickyScroll.fire(sizeDelta);
            }
            this.updateDisplay();
        }
        updateDisplay() {
            const hasSticky = this.getCurrentStickyHeight() > 0;
            if (!hasSticky) {
                this.domNode.style.display = 'none';
            }
            else {
                this.domNode.style.display = 'block';
            }
        }
        static computeStickyHeight(entry) {
            let height = 0;
            if (entry.cell.cellKind === notebookCommon_1.CellKind.Markup && entry.level !== 7) {
                height += 22;
            }
            while (entry.parent) {
                height += 22;
                entry = entry.parent;
            }
            return height;
        }
        static checkCollapsedStickyLines(entry, numLinesToRender, notebookEditor) {
            let currentEntry = entry;
            const newMap = new Map();
            const elementsToRender = [];
            while (currentEntry) {
                if (currentEntry.level === 7) {
                    // level 7 represents a non-header entry, which we don't want to render
                    currentEntry = currentEntry.parent;
                    continue;
                }
                const lineToRender = NotebookStickyScroll_1.createStickyElement(currentEntry, notebookEditor);
                newMap.set(currentEntry, { line: lineToRender, rendered: false });
                elementsToRender.unshift(lineToRender);
                currentEntry = currentEntry.parent;
            }
            // iterate over elements to render, and append to container
            // break when we reach numLinesToRender
            for (let i = 0; i < elementsToRender.length; i++) {
                if (i >= numLinesToRender) {
                    break;
                }
                newMap.set(elementsToRender[i].entry, { line: elementsToRender[i], rendered: true });
            }
            return newMap;
        }
        renderStickyLines(stickyMap, containerElement) {
            const reversedEntries = Array.from(stickyMap.entries()).reverse();
            for (const [, value] of reversedEntries) {
                if (!value.rendered) {
                    continue;
                }
                containerElement.append(value.line.element);
            }
        }
        static createStickyElement(entry, notebookEditor) {
            const stickyElement = document.createElement('div');
            stickyElement.classList.add('notebook-sticky-scroll-element');
            const indentMode = notebookEditor.notebookOptions.getLayoutConfiguration().stickyScrollMode;
            if (indentMode === 'indented') {
                stickyElement.style.paddingLeft = NotebookStickyLine.getParentCount(entry) * 10 + 'px';
            }
            let isCollapsed = false;
            if (entry.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                isCollapsed = entry.cell.foldingState === 2 /* CellFoldingState.Collapsed */;
            }
            const stickyFoldingIcon = new StickyFoldingIcon(isCollapsed, 16);
            stickyFoldingIcon.domNode.classList.add('notebook-sticky-scroll-folding-icon');
            stickyFoldingIcon.setVisible(true);
            const stickyHeader = document.createElement('div');
            stickyHeader.classList.add('notebook-sticky-scroll-header');
            stickyHeader.innerText = entry.label;
            stickyElement.append(stickyFoldingIcon.domNode, stickyHeader);
            return new NotebookStickyLine(stickyElement, stickyFoldingIcon, stickyHeader, entry, notebookEditor);
        }
        disposeCurrentStickyLines() {
            this.currentStickyLines.forEach((value) => {
                value.line.dispose();
            });
        }
        dispose() {
            this._disposables.dispose();
            this.disposeCurrentStickyLines();
            this.notebookOutline.dispose();
            super.dispose();
        }
    };
    exports.NotebookStickyScroll = NotebookStickyScroll;
    exports.NotebookStickyScroll = NotebookStickyScroll = NotebookStickyScroll_1 = __decorate([
        __param(4, contextView_1.IContextMenuService)
    ], NotebookStickyScroll);
    function computeContent(notebookEditor, notebookCellList, notebookOutlineEntries, renderedStickyHeight) {
        // get data about the cell list within viewport ----------------------------------------------------------------------------------------
        const editorScrollTop = notebookEditor.scrollTop - renderedStickyHeight;
        const visibleRange = notebookEditor.visibleRanges[0];
        if (!visibleRange) {
            return new Map();
        }
        // edge case for cell 0 in the notebook is a header ------------------------------------------------------------------------------------
        if (visibleRange.start === 0) {
            const firstCell = notebookEditor.cellAt(0);
            const firstCellEntry = NotebookStickyScroll.getVisibleOutlineEntry(0, notebookOutlineEntries);
            if (firstCell && firstCellEntry && firstCell.cellKind === notebookCommon_1.CellKind.Markup && firstCellEntry.level !== 7) {
                if (notebookEditor.scrollTop > 22) {
                    const newMap = NotebookStickyScroll.checkCollapsedStickyLines(firstCellEntry, 100, notebookEditor);
                    return newMap;
                }
            }
        }
        // iterate over cells in viewport ------------------------------------------------------------------------------------------------------
        let cell;
        let cellEntry;
        const startIndex = visibleRange.start - 1; // -1 to account for cells hidden "under" sticky lines.
        for (let currentIndex = startIndex; currentIndex < visibleRange.end; currentIndex++) {
            // store data for current cell, and next cell
            cell = notebookEditor.cellAt(currentIndex);
            if (!cell) {
                return new Map();
            }
            cellEntry = NotebookStickyScroll.getVisibleOutlineEntry(currentIndex, notebookOutlineEntries);
            if (!cellEntry) {
                return new Map();
            }
            const nextCell = notebookEditor.cellAt(currentIndex + 1);
            if (!nextCell) {
                const sectionBottom = notebookEditor.getLayoutInfo().scrollHeight;
                const linesToRender = Math.floor((sectionBottom) / 22);
                const newMap = NotebookStickyScroll.checkCollapsedStickyLines(cellEntry, linesToRender, notebookEditor);
                return newMap;
            }
            const nextCellEntry = NotebookStickyScroll.getVisibleOutlineEntry(currentIndex + 1, notebookOutlineEntries);
            if (!nextCellEntry) {
                return new Map();
            }
            // check next cell, if markdown with non level 7 entry, that means this is the end of the section (new header) ---------------------
            if (nextCell.cellKind === notebookCommon_1.CellKind.Markup && nextCellEntry.level !== 7) {
                const sectionBottom = notebookCellList.getCellViewScrollTop(nextCell);
                const currentSectionStickyHeight = NotebookStickyScroll.computeStickyHeight(cellEntry);
                const nextSectionStickyHeight = NotebookStickyScroll.computeStickyHeight(nextCellEntry);
                // case: we can render the all sticky lines for the current section ------------------------------------------------------------
                if (editorScrollTop + currentSectionStickyHeight < sectionBottom) {
                    const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22);
                    const newMap = NotebookStickyScroll.checkCollapsedStickyLines(cellEntry, linesToRender, notebookEditor);
                    return newMap;
                }
                // case: next section is the same size or bigger, render next entry -----------------------------------------------------------
                else if (nextSectionStickyHeight >= currentSectionStickyHeight) {
                    const newMap = NotebookStickyScroll.checkCollapsedStickyLines(nextCellEntry, 100, notebookEditor);
                    return newMap;
                }
                // case: next section is the smaller, shrink until next section height is greater than the available space ---------------------
                else if (nextSectionStickyHeight < currentSectionStickyHeight) {
                    const availableSpace = sectionBottom - editorScrollTop;
                    if (availableSpace >= nextSectionStickyHeight) {
                        const linesToRender = Math.floor((availableSpace) / 22);
                        const newMap = NotebookStickyScroll.checkCollapsedStickyLines(cellEntry, linesToRender, notebookEditor);
                        return newMap;
                    }
                    else {
                        const newMap = NotebookStickyScroll.checkCollapsedStickyLines(nextCellEntry, 100, notebookEditor);
                        return newMap;
                    }
                }
            }
        } // visible range loop close
        // case: all visible cells were non-header cells, so render any headers relevant to their section --------------------------------------
        const sectionBottom = notebookEditor.getLayoutInfo().scrollHeight;
        const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22);
        const newMap = NotebookStickyScroll.checkCollapsedStickyLines(cellEntry, linesToRender, notebookEditor);
        return newMap;
    }
    exports.computeContent = computeContent;
    (0, actions_1.registerAction2)(ToggleNotebookStickyScroll);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JTdGlja3lTY3JvbGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlld1BhcnRzL25vdGVib29rRWRpdG9yU3RpY2t5U2Nyb2xsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLE1BQWEsMEJBQTJCLFNBQVEsaUJBQU87UUFFdEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDRDQUE0QztnQkFDaEQsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSwrQkFBK0IsQ0FBQztvQkFDdEUsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxpQ0FBaUMsQ0FBQztvQkFDL0gsUUFBUSxFQUFFLCtCQUErQjtpQkFDekM7Z0JBQ0QsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsT0FBTyxFQUFFO29CQUNSLFNBQVMsRUFBRSwyQkFBYyxDQUFDLE1BQU0sQ0FBQyxzQ0FBc0MsRUFBRSxJQUFJLENBQUM7b0JBQzlFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSx3QkFBd0IsQ0FBQztvQkFDakUsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLHdCQUF3QixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQztpQkFDMUg7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxFQUFFLGdCQUFNLENBQUMsY0FBYyxFQUFFO29CQUM3QixFQUFFLEVBQUUsRUFBRSxnQkFB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