/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/splitview/splitview", "vs/base/common/event", "vs/base/common/lifecycle", "vs/css!./table"], function (require, exports, dom_1, listWidget_1, splitview_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Table = void 0;
    class TableListRenderer {
        static { this.TemplateId = 'row'; }
        constructor(columns, renderers, getColumnSize) {
            this.columns = columns;
            this.getColumnSize = getColumnSize;
            this.templateId = TableListRenderer.TemplateId;
            this.renderedTemplates = new Set();
            const rendererMap = new Map(renderers.map(r => [r.templateId, r]));
            this.renderers = [];
            for (const column of columns) {
                const renderer = rendererMap.get(column.templateId);
                if (!renderer) {
                    throw new Error(`Table cell renderer for template id ${column.templateId} not found.`);
                }
                this.renderers.push(renderer);
            }
        }
        renderTemplate(container) {
            const rowContainer = (0, dom_1.append)(container, (0, dom_1.$)('.monaco-table-tr'));
            const cellContainers = [];
            const cellTemplateData = [];
            for (let i = 0; i < this.columns.length; i++) {
                const renderer = this.renderers[i];
                const cellContainer = (0, dom_1.append)(rowContainer, (0, dom_1.$)('.monaco-table-td', { 'data-col-index': i }));
                cellContainer.style.width = `${this.getColumnSize(i)}px`;
                cellContainers.push(cellContainer);
                cellTemplateData.push(renderer.renderTemplate(cellContainer));
            }
            const result = { container, cellContainers, cellTemplateData };
            this.renderedTemplates.add(result);
            return result;
        }
        renderElement(element, index, templateData, height) {
            for (let i = 0; i < this.columns.length; i++) {
                const column = this.columns[i];
                const cell = column.project(element);
                const renderer = this.renderers[i];
                renderer.renderElement(cell, index, templateData.cellTemplateData[i], height);
            }
        }
        disposeElement(element, index, templateData, height) {
            for (let i = 0; i < this.columns.length; i++) {
                const renderer = this.renderers[i];
                if (renderer.disposeElement) {
                    const column = this.columns[i];
                    const cell = column.project(element);
                    renderer.disposeElement(cell, index, templateData.cellTemplateData[i], height);
                }
            }
        }
        disposeTemplate(templateData) {
            for (let i = 0; i < this.columns.length; i++) {
                const renderer = this.renderers[i];
                renderer.disposeTemplate(templateData.cellTemplateData[i]);
            }
            (0, dom_1.clearNode)(templateData.container);
            this.renderedTemplates.delete(templateData);
        }
        layoutColumn(index, size) {
            for (const { cellContainers } of this.renderedTemplates) {
                cellContainers[index].style.width = `${size}px`;
            }
        }
    }
    function asListVirtualDelegate(delegate) {
        return {
            getHeight(row) { return delegate.getHeight(row); },
            getTemplateId() { return TableListRenderer.TemplateId; },
        };
    }
    class ColumnHeader {
        get minimumSize() { return this.column.minimumWidth ?? 120; }
        get maximumSize() { return this.column.maximumWidth ?? Number.POSITIVE_INFINITY; }
        get onDidChange() { return this.column.onDidChangeWidthConstraints ?? event_1.Event.None; }
        constructor(column, index) {
            this.column = column;
            this.index = index;
            this._onDidLayout = new event_1.Emitter();
            this.onDidLayout = this._onDidLayout.event;
            this.element = (0, dom_1.$)('.monaco-table-th', { 'data-col-index': index, title: column.tooltip }, column.label);
        }
        layout(size) {
            this._onDidLayout.fire([this.index, size]);
        }
    }
    class Table {
        static { this.InstanceCount = 0; }
        get onDidChangeFocus() { return this.list.onDidChangeFocus; }
        get onDidChangeSelection() { return this.list.onDidChangeSelection; }
        get onDidScroll() { return this.list.onDidScroll; }
        get onMouseClick() { return this.list.onMouseClick; }
        get onMouseDblClick() { return this.list.onMouseDblClick; }
        get onMouseMiddleClick() { return this.list.onMouseMiddleClick; }
        get onPointer() { return this.list.onPointer; }
        get onMouseUp() { return this.list.onMouseUp; }
        get onMouseDown() { return this.list.onMouseDown; }
        get onMouseOver() { return this.list.onMouseOver; }
        get onMouseMove() { return this.list.onMouseMove; }
        get onMouseOut() { return this.list.onMouseOut; }
        get onTouchStart() { return this.list.onTouchStart; }
        get onTap() { return this.list.onTap; }
        get onContextMenu() { return this.list.onContextMenu; }
        get onDidFocus() { return this.list.onDidFocus; }
        get onDidBlur() { return this.list.onDidBlur; }
        get scrollTop() { return this.list.scrollTop; }
        set scrollTop(scrollTop) { this.list.scrollTop = scrollTop; }
        get scrollLeft() { return this.list.scrollLeft; }
        set scrollLeft(scrollLeft) { this.list.scrollLeft = scrollLeft; }
        get scrollHeight() { return this.list.scrollHeight; }
        get renderHeight() { return this.list.renderHeight; }
        get onDidDispose() { return this.list.onDidDispose; }
        constructor(user, container, virtualDelegate, columns, renderers, _options) {
            this.virtualDelegate = virtualDelegate;
            this.domId = `table_id_${++Table.InstanceCount}`;
            this.disposables = new lifecycle_1.DisposableStore();
            this.cachedWidth = 0;
            this.cachedHeight = 0;
            this.domNode = (0, dom_1.append)(container, (0, dom_1.$)(`.monaco-table.${this.domId}`));
            const headers = columns.map((c, i) => new ColumnHeader(c, i));
            const descriptor = {
                size: headers.reduce((a, b) => a + b.column.weight, 0),
                views: headers.map(view => ({ size: view.column.weight, view }))
            };
            this.splitview = this.disposables.add(new splitview_1.SplitView(this.domNode, {
                orientation: 1 /* Orientation.HORIZONTAL */,
                scrollbarVisibility: 2 /* ScrollbarVisibility.Hidden */,
                getSashOrthogonalSize: () => this.cachedHeight,
                descriptor
            }));
            this.splitview.el.style.height = `${virtualDelegate.headerRowHeight}px`;
            this.splitview.el.style.lineHeight = `${virtualDelegate.headerRowHeight}px`;
            const renderer = new TableListRenderer(columns, renderers, i => this.splitview.getViewSize(i));
            this.list = this.disposables.add(new listWidget_1.List(user, this.domNode, asListVirtualDelegate(virtualDelegate), [renderer], _options));
            event_1.Event.any(...headers.map(h => h.onDidLayout))(([index, size]) => renderer.layoutColumn(index, size), null, this.disposables);
            this.splitview.onDidSashReset(index => {
                const totalWeight = columns.reduce((r, c) => r + c.weight, 0);
                const size = columns[index].weight / totalWeight * this.cachedWidth;
                this.splitview.resizeView(index, size);
            }, null, this.disposables);
            this.styleElement = (0, dom_1.createStyleSheet)(this.domNode);
            this.style(listWidget_1.unthemedListStyles);
        }
        updateOptions(options) {
            this.list.updateOptions(options);
        }
        splice(start, deleteCount, elements = []) {
            this.list.splice(start, deleteCount, elements);
        }
        rerender() {
            this.list.rerender();
        }
        row(index) {
            return this.list.element(index);
        }
        indexOf(element) {
            return this.list.indexOf(element);
        }
        get length() {
            return this.list.length;
        }
        getHTMLElement() {
            return this.domNode;
        }
        layout(height, width) {
            height = height ?? (0, dom_1.getContentHeight)(this.domNode);
            width = width ?? (0, dom_1.getContentWidth)(this.domNode);
            this.cachedWidth = width;
            this.cachedHeight = height;
            this.splitview.layout(width);
            const listHeight = height - this.virtualDelegate.headerRowHeight;
            this.list.getHTMLElement().style.height = `${listHeight}px`;
            this.list.layout(listHeight, width);
        }
        triggerTypeNavigation() {
            this.list.triggerTypeNavigation();
        }
        style(styles) {
            const content = [];
            content.push(`.monaco-table.${this.domId} > .monaco-split-view2 .monaco-sash.vertical::before {
			top: ${this.virtualDelegate.headerRowHeight + 1}px;
			height: calc(100% - ${this.virtualDelegate.headerRowHeight}px);
		}`);
            this.styleElement.textContent = content.join('\n');
            this.list.style(styles);
        }
        domFocus() {
            this.list.domFocus();
        }
        setAnchor(index) {
            this.list.setAnchor(index);
        }
        getAnchor() {
            return this.list.getAnchor();
        }
        getSelectedElements() {
            return this.list.getSelectedElements();
        }
        setSelection(indexes, browserEvent) {
            this.list.setSelection(indexes, browserEvent);
        }
        getSelection() {
            return this.list.getSelection();
        }
        setFocus(indexes, browserEvent) {
            this.list.setFocus(indexes, browserEvent);
        }
        focusNext(n = 1, loop = false, browserEvent) {
            this.list.focusNext(n, loop, browserEvent);
        }
        focusPrevious(n = 1, loop = false, browserEvent) {
            this.list.focusPrevious(n, loop, browserEvent);
        }
        focusNextPage(browserEvent) {
            return this.list.focusNextPage(browserEvent);
        }
        focusPreviousPage(browserEvent) {
            return this.list.focusPreviousPage(browserEvent);
        }
        focusFirst(browserEvent) {
            this.list.focusFirst(browserEvent);
        }
        focusLast(browserEvent) {
            this.list.focusLast(browserEvent);
        }
        getFocus() {
            return this.list.getFocus();
        }
        getFocusedElements() {
            return this.list.getFocusedElements();
        }
        getRelativeTop(index) {
            return this.list.getRelativeTop(index);
        }
        reveal(index, relativeTop) {
            this.list.reveal(index, relativeTop);
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    exports.Table = Table;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGVXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS90YWJsZS90YWJsZVdpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFzQmhHLE1BQU0saUJBQWlCO2lCQUVmLGVBQVUsR0FBRyxLQUFLLEFBQVIsQ0FBUztRQUsxQixZQUNTLE9BQW9DLEVBQzVDLFNBQTJDLEVBQ25DLGFBQXdDO1lBRnhDLFlBQU8sR0FBUCxPQUFPLENBQTZCO1lBRXBDLGtCQUFhLEdBQWIsYUFBYSxDQUEyQjtZQVB4QyxlQUFVLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDO1lBRTNDLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO1lBT3RELE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBRXBCLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQzlCLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUVwRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsTUFBTSxDQUFDLFVBQVUsYUFBYSxDQUFDLENBQUM7Z0JBQ3hGLENBQUM7Z0JBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0IsQ0FBQztRQUNGLENBQUM7UUFFRCxjQUFjLENBQUMsU0FBc0I7WUFDcEMsTUFBTSxZQUFZLEdB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