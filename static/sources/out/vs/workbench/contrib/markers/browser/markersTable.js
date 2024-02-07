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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/workbench/contrib/markers/browser/markersModel", "vs/platform/markers/common/markers", "vs/platform/severityIcon/browser/severityIcon", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/label/common/label", "vs/workbench/contrib/markers/browser/markersFilterOptions", "vs/platform/opener/browser/link", "vs/platform/opener/common/opener", "vs/workbench/contrib/markers/browser/markersViewActions", "vs/base/browser/event", "vs/workbench/contrib/markers/browser/messages", "vs/base/common/types", "vs/editor/common/core/range", "vs/platform/markers/common/markerService", "vs/base/common/severity"], function (require, exports, nls_1, DOM, event_1, lifecycle_1, instantiation_1, listService_1, highlightedLabel_1, markersModel_1, markers_1, severityIcon_1, actionbar_1, label_1, markersFilterOptions_1, link_1, opener_1, markersViewActions_1, event_2, messages_1, types_1, range_1, markerService_1, severity_1) {
    "use strict";
    var MarkerSeverityColumnRenderer_1, MarkerCodeColumnRenderer_1, MarkerFileColumnRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkersTable = void 0;
    const $ = DOM.$;
    let MarkerSeverityColumnRenderer = class MarkerSeverityColumnRenderer {
        static { MarkerSeverityColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'severity'; }
        constructor(markersViewModel, instantiationService) {
            this.markersViewModel = markersViewModel;
            this.instantiationService = instantiationService;
            this.templateId = MarkerSeverityColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const severityColumn = DOM.append(container, $('.severity'));
            const icon = DOM.append(severityColumn, $(''));
            const actionBarColumn = DOM.append(container, $('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionBarColumn, {
                actionViewItemProvider: (action) => action.id === markersViewActions_1.QuickFixAction.ID ? this.instantiationService.createInstance(markersViewActions_1.QuickFixActionViewItem, action) : undefined,
                animated: false
            });
            return { actionBar, icon };
        }
        renderElement(element, index, templateData, height) {
            const toggleQuickFix = (enabled) => {
                if (!(0, types_1.isUndefinedOrNull)(enabled)) {
                    const container = DOM.findParentWithClass(templateData.icon, 'monaco-table-td');
                    container.classList.toggle('quickFix', enabled);
                }
            };
            templateData.icon.title = markers_1.MarkerSeverity.toString(element.marker.severity);
            templateData.icon.className = `marker-icon ${severity_1.default.toString(markers_1.MarkerSeverity.toSeverity(element.marker.severity))} codicon ${severityIcon_1.SeverityIcon.className(markers_1.MarkerSeverity.toSeverity(element.marker.severity))}`;
            templateData.actionBar.clear();
            const viewModel = this.markersViewModel.getViewModel(element);
            if (viewModel) {
                const quickFixAction = viewModel.quickFixAction;
                templateData.actionBar.push([quickFixAction], { icon: true, label: false });
                toggleQuickFix(viewModel.quickFixAction.enabled);
                quickFixAction.onDidChange(({ enabled }) => toggleQuickFix(enabled));
                quickFixAction.onShowQuickFixes(() => {
                    const quickFixActionViewItem = templateData.actionBar.viewItems[0];
                    if (quickFixActionViewItem) {
                        quickFixActionViewItem.showQuickFixes();
                    }
                });
            }
        }
        disposeTemplate(templateData) { }
    };
    MarkerSeverityColumnRenderer = MarkerSeverityColumnRenderer_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], MarkerSeverityColumnRenderer);
    let MarkerCodeColumnRenderer = class MarkerCodeColumnRenderer {
        static { MarkerCodeColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'code'; }
        constructor(openerService) {
            this.openerService = openerService;
            this.templateId = MarkerCodeColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const codeColumn = DOM.append(container, $('.code'));
            const sourceLabel = new highlightedLabel_1.HighlightedLabel(codeColumn);
            sourceLabel.element.classList.add('source-label');
            const codeLabel = new highlightedLabel_1.HighlightedLabel(codeColumn);
            codeLabel.element.classList.add('code-label');
            const codeLink = new link_1.Link(codeColumn, { href: '', label: '' }, {}, this.openerService);
            return { codeColumn, sourceLabel, codeLabel, codeLink };
        }
        renderElement(element, index, templateData, height) {
            templateData.codeColumn.classList.remove('code-label');
            templateData.codeColumn.classList.remove('code-link');
            if (element.marker.source && element.marker.code) {
                if (typeof element.marker.code === 'string') {
                    templateData.codeColumn.classList.add('code-label');
                    templateData.codeColumn.title = `${element.marker.source} (${element.marker.code})`;
                    templateData.sourceLabel.set(element.marker.source, element.sourceMatches);
                    templateData.codeLabel.set(element.marker.code, element.codeMatches);
                }
                else {
                    templateData.codeColumn.classList.add('code-link');
                    templateData.codeColumn.title = `${element.marker.source} (${element.marker.code.value})`;
                    templateData.sourceLabel.set(element.marker.source, element.sourceMatches);
                    const codeLinkLabel = new highlightedLabel_1.HighlightedLabel($('.code-link-label'));
                    codeLinkLabel.set(element.marker.code.value, element.codeMatches);
                    templateData.codeLink.link = {
                        href: element.marker.code.target.toString(),
                        title: element.marker.code.target.toString(),
                        label: codeLinkLabel.element,
                    };
                }
            }
            else {
                templateData.codeColumn.title = '';
                templateData.sourceLabel.set('-');
            }
        }
        disposeTemplate(templateData) { }
    };
    MarkerCodeColumnRenderer = MarkerCodeColumnRenderer_1 = __decorate([
        __param(0, opener_1.IOpenerService)
    ], MarkerCodeColumnRenderer);
    class MarkerMessageColumnRenderer {
        constructor() {
            this.templateId = MarkerMessageColumnRenderer.TEMPLATE_ID;
        }
        static { this.TEMPLATE_ID = 'message'; }
        renderTemplate(container) {
            const columnElement = DOM.append(container, $('.message'));
            const highlightedLabel = new highlightedLabel_1.HighlightedLabel(columnElement);
            return { columnElement, highlightedLabel };
        }
        renderElement(element, index, templateData, height) {
            templateData.columnElement.title = element.marker.message;
            templateData.highlightedLabel.set(element.marker.message, element.messageMatches);
        }
        disposeTemplate(templateData) { }
    }
    let MarkerFileColumnRenderer = class MarkerFileColumnRenderer {
        static { MarkerFileColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'file'; }
        constructor(labelService) {
            this.labelService = labelService;
            this.templateId = MarkerFileColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const columnElement = DOM.append(container, $('.file'));
            const fileLabel = new highlightedLabel_1.HighlightedLabel(columnElement);
            fileLabel.element.classList.add('file-label');
            const positionLabel = new highlightedLabel_1.HighlightedLabel(columnElement);
            positionLabel.element.classList.add('file-position');
            return { columnElement, fileLabel, positionLabel };
        }
        renderElement(element, index, templateData, height) {
            const positionLabel = messages_1.default.MARKERS_PANEL_AT_LINE_COL_NUMBER(element.marker.startLineNumber, element.marker.startColumn);
            templateData.columnElement.title = `${this.labelService.getUriLabel(element.marker.resource, { relative: false })} ${positionLabel}`;
            templateData.fileLabel.set(this.labelService.getUriLabel(element.marker.resource, { relative: true }), element.fileMatches);
            templateData.positionLabel.set(positionLabel, undefined);
        }
        disposeTemplate(templateData) { }
    };
    MarkerFileColumnRenderer = MarkerFileColumnRenderer_1 = __decorate([
        __param(0, label_1.ILabelService)
    ], MarkerFileColumnRenderer);
    class MarkerOwnerColumnRenderer {
        constructor() {
            this.templateId = MarkerOwnerColumnRenderer.TEMPLATE_ID;
        }
        static { this.TEMPLATE_ID = 'owner'; }
        renderTemplate(container) {
            const columnElement = DOM.append(container, $('.owner'));
            const highlightedLabel = new highlightedLabel_1.HighlightedLabel(columnElement);
            return { columnElement, highlightedLabel };
        }
        renderElement(element, index, templateData, height) {
            templateData.columnElement.title = element.marker.owner;
            templateData.highlightedLabel.set(element.marker.owner, element.ownerMatches);
        }
        disposeTemplate(templateData) { }
    }
    class MarkersTableVirtualDelegate {
        constructor() {
            this.headerRowHeight = MarkersTableVirtualDelegate.HEADER_ROW_HEIGHT;
        }
        static { this.HEADER_ROW_HEIGHT = 24; }
        static { this.ROW_HEIGHT = 24; }
        getHeight(item) {
            return MarkersTableVirtualDelegate.ROW_HEIGHT;
        }
    }
    let MarkersTable = class MarkersTable extends lifecycle_1.Disposable {
        constructor(container, markersViewModel, resourceMarkers, filterOptions, options, instantiationService, labelService) {
            super();
            this.container = container;
            this.markersViewModel = markersViewModel;
            this.resourceMarkers = resourceMarkers;
            this.filterOptions = filterOptions;
            this.instantiationService = instantiationService;
            this.labelService = labelService;
            this._itemCount = 0;
            this.table = this.instantiationService.createInstance(listService_1.WorkbenchTable, 'Markers', this.container, new MarkersTableVirtualDelegate(), [
                {
                    label: '',
                    tooltip: '',
                    weight: 0,
                    minimumWidth: 36,
                    maximumWidth: 36,
                    templateId: MarkerSeverityColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('codeColumnLabel', "Code"),
                    tooltip: '',
                    weight: 1,
                    minimumWidth: 100,
                    maximumWidth: 300,
                    templateId: MarkerCodeColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('messageColumnLabel', "Message"),
                    tooltip: '',
                    weight: 4,
                    templateId: MarkerMessageColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('fileColumnLabel', "File"),
                    tooltip: '',
                    weight: 2,
                    templateId: MarkerFileColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('sourceColumnLabel', "Source"),
                    tooltip: '',
                    weight: 1,
                    minimumWidth: 100,
                    maximumWidth: 300,
                    templateId: MarkerOwnerColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                }
            ], [
                this.instantiationService.createInstance(MarkerSeverityColumnRenderer, this.markersViewModel),
                this.instantiationService.createInstance(MarkerCodeColumnRenderer),
                this.instantiationService.createInstance(MarkerMessageColumnRenderer),
                this.instantiationService.createInstance(MarkerFileColumnRenderer),
                this.instantiationService.createInstance(MarkerOwnerColumnRenderer),
            ], options);
            const list = this.table.domNode.querySelector('.monaco-list-rows');
            // mouseover/mouseleave event handlers
            const onRowHover = event_1.Event.chain(this._register(new event_2.DomEmitter(list, 'mouseover')).event, $ => $.map(e => DOM.findParentWithClass(e.target, 'monaco-list-row', 'monaco-list-rows'))
                .filter(((e) => !!e))
                .map(e => parseInt(e.getAttribute('data-index'))));
            const onListLeave = event_1.Event.map(this._register(new event_2.DomEmitter(list, 'mouseleave')).event, () => -1);
            const onRowHoverOrLeave = event_1.Event.latch(event_1.Event.any(onRowHover, onListLeave));
            const onRowPermanentHover = event_1.Event.debounce(onRowHoverOrLeave, (_, e) => e, 500);
            this._register(onRowPermanentHover(e => {
                if (e !== -1 && this.table.row(e)) {
                    this.markersViewModel.onMarkerMouseHover(this.table.row(e));
                }
            }));
        }
        get contextKeyService() {
            return this.table.contextKeyService;
        }
        get onContextMenu() {
            return this.table.onContextMenu;
        }
        get onDidOpen() {
            return this.table.onDidOpen;
        }
        get onDidChangeFocus() {
            return this.table.onDidChangeFocus;
        }
        get onDidChangeSelection() {
            return this.table.onDidChangeSelection;
        }
        collapseMarkers() { }
        domFocus() {
            this.table.domFocus();
        }
        filterMarkers(resourceMarkers, filterOptions) {
            this.filterOptions = filterOptions;
            this.reset(resourceMarkers);
        }
        getFocus() {
            const focus = this.table.getFocus();
            return focus.length > 0 ? [...focus.map(f => this.table.row(f))] : [];
        }
        getHTMLElement() {
            return this.table.getHTMLElement();
        }
        getRelativeTop(marker) {
            return marker ? this.table.getRelativeTop(this.table.indexOf(marker)) : null;
        }
        getSelection() {
            const selection = this.table.getSelection();
            return selection.length > 0 ? [...selection.map(i => this.table.row(i))] : [];
        }
        getVisibleItemCount() {
            return this._itemCount;
        }
        isVisible() {
            return !this.container.classList.contains('hidden');
        }
        layout(height, width) {
            this.container.style.height = `${height}px`;
            this.table.layout(height, width);
        }
        reset(resourceMarkers) {
            this.resourceMarkers = resourceMarkers;
            const items = [];
            for (const resourceMarker of this.resourceMarkers) {
                for (const marker of resourceMarker.markers) {
                    if (markerService_1.unsupportedSchemas.has(marker.resource.scheme)) {
                        continue;
                    }
                    // Exclude pattern
                    if (this.filterOptions.excludesMatcher.matches(marker.resource)) {
                        continue;
                    }
                    // Include pattern
                    if (this.filterOptions.includesMatcher.matches(marker.resource)) {
                        items.push(new markersModel_1.MarkerTableItem(marker));
                        continue;
                    }
                    // Severity filter
                    const matchesSeverity = this.filterOptions.showErrors && markers_1.MarkerSeverity.Error === marker.marker.severity ||
                        this.filterOptions.showWarnings && markers_1.MarkerSeverity.Warning === marker.marker.severity ||
                        this.filterOptions.showInfos && markers_1.MarkerSeverity.Info === marker.marker.severity;
                    if (!matchesSeverity) {
                        continue;
                    }
                    // Text filter
                    if (this.filterOptions.textFilter.text) {
                        const sourceMatches = marker.marker.source ? markersFilterOptions_1.FilterOptions._filter(this.filterOptions.textFilter.text, marker.marker.source) ?? undefined : undefined;
                        const codeMatches = marker.marker.code ? markersFilterOptions_1.FilterOptions._filter(this.filterOptions.textFilter.text, typeof marker.marker.code === 'string' ? marker.marker.code : marker.marker.code.value) ?? undefined : undefined;
                        const messageMatches = markersFilterOptions_1.FilterOptions._messageFilter(this.filterOptions.textFilter.text, marker.marker.message) ?? undefined;
                        const fileMatches = markersFilterOptions_1.FilterOptions._messageFilter(this.filterOptions.textFilter.text, this.labelService.getUriLabel(marker.resource, { relative: true })) ?? undefined;
                        const ownerMatches = markersFilterOptions_1.FilterOptions._messageFilter(this.filterOptions.textFilter.text, marker.marker.owner) ?? undefined;
                        const matched = sourceMatches || codeMatches || messageMatches || fileMatches || ownerMatches;
                        if ((matched && !this.filterOptions.textFilter.negate) || (!matched && this.filterOptions.textFilter.negate)) {
                            items.push(new markersModel_1.MarkerTableItem(marker, sourceMatches, codeMatches, messageMatches, fileMatches, ownerMatches));
                        }
                        continue;
                    }
                    items.push(new markersModel_1.MarkerTableItem(marker));
                }
            }
            this._itemCount = items.length;
            this.table.splice(0, Number.POSITIVE_INFINITY, items.sort((a, b) => {
                let result = markers_1.MarkerSeverity.compare(a.marker.severity, b.marker.severity);
                if (result === 0) {
                    result = (0, markersModel_1.compareMarkersByUri)(a.marker, b.marker);
                }
                if (result === 0) {
                    result = range_1.Range.compareRangesUsingStarts(a.marker, b.marker);
                }
                return result;
            }));
        }
        revealMarkers(activeResource, focus, lastSelectedRelativeTop) {
            if (activeResource) {
                const activeResourceIndex = this.resourceMarkers.indexOf(activeResource);
                if (activeResourceIndex !== -1) {
                    if (this.hasSelectedMarkerFor(activeResource)) {
                        const tableSelection = this.table.getSelection();
                        this.table.reveal(tableSelection[0], lastSelectedRelativeTop);
                        if (focus) {
                            this.table.setFocus(tableSelection);
                        }
                    }
                    else {
                        this.table.reveal(activeResourceIndex, 0);
                        if (focus) {
                            this.table.setFocus([activeResourceIndex]);
                            this.table.setSelection([activeResourceIndex]);
                        }
                    }
                }
            }
            else if (focus) {
                this.table.setSelection([]);
                this.table.focusFirst();
            }
        }
        setAriaLabel(label) {
            this.table.domNode.ariaLabel = label;
        }
        setMarkerSelection(selection, focus) {
            if (this.isVisible()) {
                if (selection && selection.length > 0) {
                    this.table.setSelection(selection.map(m => this.findMarkerIndex(m)));
                    if (focus && focus.length > 0) {
                        this.table.setFocus(focus.map(f => this.findMarkerIndex(f)));
                    }
                    else {
                        this.table.setFocus([this.findMarkerIndex(selection[0])]);
                    }
                    this.table.reveal(this.findMarkerIndex(selection[0]));
                }
                else if (this.getSelection().length === 0 && this.getVisibleItemCount() > 0) {
                    this.table.setSelection([0]);
                    this.table.setFocus([0]);
                    this.table.reveal(0);
                }
            }
        }
        toggleVisibility(hide) {
            this.container.classList.toggle('hidden', hide);
        }
        update(resourceMarkers) {
            for (const resourceMarker of resourceMarkers) {
                const index = this.resourceMarkers.indexOf(resourceMarker);
                this.resourceMarkers.splice(index, 1, resourceMarker);
            }
            this.reset(this.resourceMarkers);
        }
        updateMarker(marker) {
            this.table.rerender();
        }
        findMarkerIndex(marker) {
            for (let index = 0; index < this.table.length; index++) {
                if (this.table.row(index).marker === marker.marker) {
                    return index;
                }
            }
            return -1;
        }
        hasSelectedMarkerFor(resource) {
            const selectedElement = this.getSelection();
            if (selectedElement && selectedElement.length > 0) {
                if (selectedElement[0] instanceof markersModel_1.Marker) {
                    if (resource.has(selectedElement[0].marker.resource)) {
                        return true;
                    }
                }
            }
            return false;
        }
    };
    exports.MarkersTable = MarkersTable;
    exports.MarkersTable = MarkersTable = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, label_1.ILabelService)
    ], MarkersTable);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vyc1RhYmxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tYXJrZXJzL2Jyb3dzZXIvbWFya2Vyc1RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE4QmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUEwQmhCLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTRCOztpQkFFakIsZ0JBQVcsR0FBRyxVQUFVLEFBQWIsQ0FBYztRQUl6QyxZQUNrQixnQkFBa0MsRUFDNUIsb0JBQTREO1lBRGxFLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDWCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBSjNFLGVBQVUsR0FBVyw4QkFBNEIsQ0FBQyxXQUFXLENBQUM7UUFLbkUsQ0FBQztRQUVMLGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUvQyxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQUMsZUFBZSxFQUFFO2dCQUNoRCxzQkFBc0IsRUFBRSxDQUFDLE1BQWUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxtQ0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNB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