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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/network", "vs/base/common/path", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/platform/markers/common/markers", "vs/workbench/contrib/markers/browser/markersModel", "vs/workbench/contrib/markers/browser/messages", "vs/platform/instantiation/common/instantiation", "vs/base/common/themables", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/contrib/markers/browser/markersViewActions", "vs/platform/label/common/label", "vs/base/common/resources", "vs/workbench/contrib/markers/browser/markersFilterOptions", "vs/base/common/event", "vs/base/common/types", "vs/base/common/actions", "vs/nls", "vs/base/common/async", "vs/editor/common/services/model", "vs/editor/common/core/range", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/workbench/services/editor/common/editorService", "vs/platform/severityIcon/browser/severityIcon", "vs/platform/opener/common/opener", "vs/platform/files/common/files", "vs/platform/progress/common/progress", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/platform/opener/browser/link", "vs/editor/common/services/languageFeatures", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/markers/common/markers", "vs/platform/markers/common/markerService", "vs/platform/theme/browser/defaultStyles", "vs/base/common/severity"], function (require, exports, dom, network, paths, countBadge_1, highlightedLabel_1, markers_1, markersModel_1, messages_1, instantiation_1, themables_1, lifecycle_1, actionbar_1, markersViewActions_1, label_1, resources_1, markersFilterOptions_1, event_1, types_1, actions_1, nls_1, async_1, model_1, range_1, codeAction_1, types_2, editorService_1, severityIcon_1, opener_1, files_1, progress_1, actionViewItems_1, codicons_1, iconRegistry_1, link_1, languageFeatures_1, contextkey_1, markers_2, markerService_1, defaultStyles_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkersViewModel = exports.MarkerViewModel = exports.Filter = exports.RelatedInformationRenderer = exports.MarkerRenderer = exports.FileResourceMarkersRenderer = exports.ResourceMarkersRenderer = exports.VirtualDelegate = exports.MarkersWidgetAccessibilityProvider = void 0;
    let MarkersWidgetAccessibilityProvider = class MarkersWidgetAccessibilityProvider {
        constructor(labelService) {
            this.labelService = labelService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('problemsView', "Problems View");
        }
        getAriaLabel(element) {
            if (element instanceof markersModel_1.ResourceMarkers) {
                const path = this.labelService.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
                return messages_1.default.MARKERS_TREE_ARIA_LABEL_RESOURCE(element.markers.length, element.name, paths.dirname(path));
            }
            if (element instanceof markersModel_1.Marker || element instanceof markersModel_1.MarkerTableItem) {
                return messages_1.default.MARKERS_TREE_ARIA_LABEL_MARKER(element);
            }
            if (element instanceof markersModel_1.RelatedInformation) {
                return messages_1.default.MARKERS_TREE_ARIA_LABEL_RELATED_INFORMATION(element.raw);
            }
            return null;
        }
    };
    exports.MarkersWidgetAccessibilityProvider = MarkersWidgetAccessibilityProvider;
    exports.MarkersWidgetAccessibilityProvider = MarkersWidgetAccessibilityProvider = __decorate([
        __param(0, label_1.ILabelService)
    ], MarkersWidgetAccessibilityProvider);
    var TemplateId;
    (function (TemplateId) {
        TemplateId["ResourceMarkers"] = "rm";
        TemplateId["Marker"] = "m";
        TemplateId["RelatedInformation"] = "ri";
    })(TemplateId || (TemplateId = {}));
    class VirtualDelegate {
        static { this.LINE_HEIGHT = 22; }
        constructor(markersViewState) {
            this.markersViewState = markersViewState;
        }
        getHeight(element) {
            if (element instanceof markersModel_1.Marker) {
                const viewModel = this.markersViewState.getViewModel(element);
                const noOfLines = !viewModel || viewModel.multiline ? element.lines.length : 1;
                return noOfLines * VirtualDelegate.LINE_HEIGHT;
            }
            return VirtualDelegate.LINE_HEIGHT;
        }
        getTemplateId(element) {
            if (element instanceof markersModel_1.ResourceMarkers) {
                return "rm" /* TemplateId.ResourceMarkers */;
            }
            else if (element instanceof markersModel_1.Marker) {
                return "m" /* TemplateId.Marker */;
            }
            else {
                return "ri" /* TemplateId.RelatedInformation */;
            }
        }
    }
    exports.VirtualDelegate = VirtualDelegate;
    var FilterDataType;
    (function (FilterDataType) {
        FilterDataType[FilterDataType["ResourceMarkers"] = 0] = "ResourceMarkers";
        FilterDataType[FilterDataType["Marker"] = 1] = "Marker";
        FilterDataType[FilterDataType["RelatedInformation"] = 2] = "RelatedInformation";
    })(FilterDataType || (FilterDataType = {}));
    let ResourceMarkersRenderer = class ResourceMarkersRenderer {
        constructor(labels, onDidChangeRenderNodeCount, labelService, fileService) {
            this.labels = labels;
            this.labelService = labelService;
            this.fileService = fileService;
            this.renderedNodes = new Map();
            this.disposables = new lifecycle_1.DisposableStore();
            this.templateId = "rm" /* TemplateId.ResourceMarkers */;
            onDidChangeRenderNodeCount(this.onDidChangeRenderNodeCount, this, this.disposables);
        }
        renderTemplate(container) {
            const resourceLabelContainer = dom.append(container, dom.$('.resource-label-container'));
            const resourceLabel = this.labels.create(resourceLabelContainer, { supportHighlights: true });
            const badgeWrapper = dom.append(container, dom.$('.count-badge-wrapper'));
            const count = new countBadge_1.CountBadge(badgeWrapper, {}, defaultStyles_1.defaultCountBadgeStyles);
            return { count, resourceLabel };
        }
        renderElement(node, _, templateData) {
            const resourceMarkers = node.element;
            const uriMatches = node.filterData && node.filterData.uriMatches || [];
            if (this.fileService.hasProvider(resourceMarkers.resource) || resourceMarkers.resource.scheme === network.Schemas.untitled) {
                templateData.resourceLabel.setFile(resourceMarkers.resource, { matches: uriMatches });
            }
            else {
                templateData.resourceLabel.setResource({ name: resourceMarkers.name, description: this.labelService.getUriLabel((0, resources_1.dirname)(resourceMarkers.resource), { relative: true }), resource: resourceMarkers.resource }, { matches: uriMatches });
            }
            this.updateCount(node, templateData);
            const nodeRenders = this.renderedNodes.get(resourceMarkers) ?? [];
            this.renderedNodes.set(resourceMarkers, [...nodeRenders, templateData]);
        }
        disposeElement(node, index, templateData) {
            const nodeRenders = this.renderedNodes.get(node.element) ?? [];
            const nodeRenderIndex = nodeRenders.findIndex(nodeRender => templateData === nodeRender);
            if (nodeRenderIndex < 0) {
                throw new Error('Disposing unknown resource marker');
            }
            if (nodeRenders.length === 1) {
                this.renderedNodes.delete(node.element);
            }
            else {
                nodeRenders.splice(nodeRenderIndex, 1);
            }
        }
        disposeTemplate(templateData) {
            templateData.resourceLabel.dispose();
        }
        onDidChangeRenderNodeCount(node) {
            const nodeRenders = this.renderedNodes.get(node.element);
            if (!nodeRenders) {
                return;
            }
            nodeRenders.forEach(nodeRender => this.updateCount(node, nodeRender));
        }
        updateCount(node, templateData) {
            templateData.count.setCount(node.children.reduce((r, n) => r + (n.visible ? 1 : 0), 0));
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.ResourceMarkersRenderer = ResourceMarkersRenderer;
    exports.ResourceMarkersRenderer = ResourceMarkersRenderer = __decorate([
        __param(2, label_1.ILabelService),
        __param(3, files_1.IFileService)
    ], ResourceMarkersRenderer);
    class FileResourceMarkersRenderer extends ResourceMarkersRenderer {
    }
    exports.FileResourceMarkersRenderer = FileResourceMarkersRenderer;
    let MarkerRenderer = class MarkerRenderer {
        constructor(markersViewState, instantiationService, openerService) {
            this.markersViewState = markersViewState;
            this.instantiationService = instantiationService;
            this.openerService = openerService;
            this.templateId = "m" /* TemplateId.Marker */;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.markerWidget = new MarkerWidget(container, this.markersViewState, this.openerService, this.instantiationService);
            return data;
        }
        renderElement(node, _, templateData) {
            templateData.markerWidget.render(node.element, node.filterData);
        }
        disposeTemplate(templateData) {
            templateData.markerWidget.dispose();
        }
    };
    exports.MarkerRenderer = MarkerRenderer;
    exports.MarkerRenderer = MarkerRenderer = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, opener_1.IOpenerService)
    ], MarkerRenderer);
    const expandedIcon = (0, iconRegistry_1.registerIcon)('markers-view-multi-line-expanded', codicons_1.Codicon.chevronUp, (0, nls_1.localize)('expandedIcon', 'Icon indicating that multiple lines are shown in the markers view.'));
    const collapsedIcon = (0, iconRegistry_1.registerIcon)('markers-view-multi-line-collapsed', codicons_1.Codicon.chevronDown, (0, nls_1.localize)('collapsedIcon', 'Icon indicating that multiple lines are collapsed in the markers view.'));
    const toggleMultilineAction = 'problems.action.toggleMultiline';
    class ToggleMultilineActionViewItem extends actionViewItems_1.ActionViewItem {
        render(container) {
            super.render(container);
            this.updateExpandedAttribute();
        }
        updateClass() {
            super.updateClass();
            this.updateExpandedAttribute();
        }
        updateExpandedAttribute() {
            this.element?.setAttribute('aria-expanded', `${this._action.class === themables_1.ThemeIcon.asClassName(expandedIcon)}`);
        }
    }
    class MarkerWidget extends lifecycle_1.Disposable {
        constructor(parent, markersViewModel, _openerService, _instantiationService) {
            super();
            this.parent = parent;
            this.markersViewModel = markersViewModel;
            this._openerService = _openerService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.actionBar = this._register(new actionbar_1.ActionBar(dom.append(parent, dom.$('.actions')), {
                actionViewItemProvider: (action) => action.id === markersViewActions_1.QuickFixAction.ID ? _instantiationService.createInstance(markersViewActions_1.QuickFixActionViewItem, action) : undefined
            }));
            // wrap the icon in a container that get the icon color as foreground color. That way, if the
            // list view does not have a specific color for the icon (=the color variable is invalid) it
            // falls back to the foreground color of container (inherit)
            this.iconContainer = dom.append(parent, dom.$(''));
            this.icon = dom.append(this.iconContainer, dom.$(''));
            this.messageAndDetailsContainer = dom.append(parent, dom.$('.marker-message-details-container'));
        }
        render(element, filterData) {
            this.actionBar.clear();
            this.disposables.clear();
            dom.clearNode(this.messageAndDetailsContainer);
            this.iconContainer.className = `marker-icon ${severity_1.default.toString(markers_1.MarkerSeverity.toSeverity(element.marker.severity))}`;
            this.icon.className = `codicon ${severityIcon_1.SeverityIcon.className(markers_1.MarkerSeverity.toSeverity(element.marker.severity))}`;
            this.renderQuickfixActionbar(element);
            this.renderMessageAndDetails(element, filterData);
            this.disposables.add(dom.addDisposableListener(this.parent, dom.EventType.MOUSE_OVER, () => this.markersViewModel.onMarkerMouseHover(element)));
            this.disposables.add(dom.addDisposableListener(this.parent, dom.EventType.MOUSE_LEAVE, () => this.markersViewModel.onMarkerMouseLeave(element)));
        }
        renderQuickfixActionbar(marker) {
            const viewModel = this.markersViewModel.getViewModel(marker);
            if (viewModel) {
                const quickFixAction = viewModel.quickFixAction;
                this.actionBar.push([quickFixAction], { icon: true, label: false });
                this.iconContainer.classList.toggle('quickFix', quickFixAction.enabled);
                quickFixAction.onDidChange(({ enabled }) => {
                    if (!(0, types_1.isUndefinedOrNull)(enabled)) {
                        this.iconContainer.classList.toggle('quickFix', enabled);
                    }
                }, this, this.disposables);
                quickFixAction.onShowQuickFixes(() => {
                    const quickFixActionViewItem = this.actionBar.viewItems[0];
                    if (quickFixActionViewItem) {
                        quickFixActionViewItem.showQuickFixes();
                    }
                }, this, this.disposables);
            }
        }
        renderMultilineActionbar(marker, parent) {
            const multilineActionbar = this.disposables.add(new actionbar_1.ActionBar(dom.append(parent, dom.$('.multiline-actions')), {
                actionViewItemProvider: (action) => {
                    if (action.id === toggleMultilineAction) {
                        return new ToggleMultilineActionViewItem(undefined, action, { icon: true });
                    }
                    return undefined;
                }
            }));
            this.disposables.add((0, lifecycle_1.toDisposable)(() => multilineActionbar.dispose()));
            const viewModel = this.markersViewModel.getViewModel(marker);
            const multiline = viewModel && viewModel.multiline;
            const action = new actions_1.Action(toggleMultilineAction);
            action.enabled = !!viewModel && marker.lines.length > 1;
            action.tooltip = multiline ? (0, nls_1.localize)('single line', "Show message in single line") : (0, nls_1.localize)('multi line', "Show message in multiple lines");
            action.class = themables_1.ThemeIcon.asClassName(multiline ? expandedIcon : collapsedIcon);
            action.run = () => { if (viewModel) {
                viewModel.multiline = !viewModel.multiline;
            } return Promise.resolve(); };
            multilineActionbar.push([action], { icon: true, label: false });
        }
        renderMessageAndDetails(element, filterData) {
            const { marker, lines } = element;
            const viewState = this.markersViewModel.getViewModel(element);
            const multiline = !viewState || viewState.multiline;
            const lineMatches = filterData && filterData.lineMatches || [];
            this.messageAndDetailsContainer.title = element.marker.message;
            const lineElements = [];
            for (let index = 0; index < (multiline ? lines.length : 1); index++) {
                const lineElement = dom.append(this.messageAndDetailsContainer, dom.$('.marker-message-line'));
                const messageElement = dom.append(lineElement, dom.$('.marker-message'));
                const highlightedLabel = new highlightedLabel_1.HighlightedLabel(messageElement);
                highlightedLabel.set(lines[index].length > 1000 ? `${lines[index].substring(0, 1000)}...` : lines[index], lineMatches[index]);
                if (lines[index] === '') {
                    lineElement.style.height = `${VirtualDelegate.LINE_HEIGHT}px`;
                }
                lineElements.push(lineElement);
            }
            this.renderDetails(marker, filterData, lineElements[0]);
            this.renderMultilineActionbar(element, lineElements[0]);
        }
        renderDetails(marker, filterData, parent) {
            parent.classList.add('details-container');
            if (marker.source || marker.code) {
                const source = new highlightedLabel_1.HighlightedLabel(dom.append(parent, dom.$('.marker-source')));
                const sourceMatches = filterData && filterData.sourceMatches || [];
                source.set(marker.source, sourceMatches);
                if (marker.code) {
                    if (typeof marker.code === 'string') {
                        const code = new highlightedLabel_1.HighlightedLabel(dom.append(parent, dom.$('.marker-code')));
                        const codeMatches = filterData && filterData.codeMatches || [];
                        code.set(marker.code, codeMatches);
                    }
                    else {
                        const container = dom.$('.marker-code');
                        const code = new highlightedLabel_1.HighlightedLabel(container);
                        const link = marker.code.target.toString(true);
                        this.disposables.add(new link_1.Link(parent, { href: link, label: container, title: link }, undefined, this._openerService));
                        const codeMatches = filterData && filterData.codeMatches || [];
                        code.set(marker.code.value, codeMatches);
                    }
                }
            }
            const lnCol = dom.append(parent, dom.$('span.marker-line'));
            lnCol.textContent = messages_1.default.MARKERS_PANEL_AT_LINE_COL_NUMBER(marker.startLineNumber, marker.startColumn);
        }
    }
    let RelatedInformationRenderer = class RelatedInformationRenderer {
        constructor(labelService) {
            this.labelService = labelService;
            this.templateId = "ri" /* TemplateId.RelatedInformation */;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            dom.append(container, dom.$('.actions'));
            dom.append(container, dom.$('.icon'));
            data.resourceLabel = new highlightedLabel_1.HighlightedLabel(dom.append(container, dom.$('.related-info-resource')));
            data.lnCol = dom.append(container, dom.$('span.marker-line'));
            const separator = dom.append(container, dom.$('span.related-info-resource-separator'));
            separator.textContent = ':';
            separator.style.paddingRight = '4px';
            data.description = new highlightedLabel_1.HighlightedLabel(dom.append(container, dom.$('.marker-description')));
            return data;
        }
        renderElement(node, _, templateData) {
            const relatedInformation = node.element.raw;
            const uriMatches = node.filterData && node.filterData.uriMatches || [];
            const messageMatches = node.filterData && node.filterData.messageMatches || [];
            templateData.resourceLabel.set((0, resources_1.basename)(relatedInformation.resource), uriMatches);
            templateData.resourceLabel.element.title = this.labelService.getUriLabel(relatedInformation.resource, { relative: true });
            templateData.lnCol.textContent = messages_1.default.MARKERS_PANEL_AT_LINE_COL_NUMBER(relatedInformation.startLineNumber, relatedInformation.startColumn);
            templateData.description.set(relatedInformation.message, messageMatches);
            templateData.description.element.title = relatedInformation.message;
        }
        disposeTemplate(templateData) {
            // noop
        }
    };
    exports.RelatedInformationRenderer = RelatedInformationRenderer;
    exports.RelatedInformationRenderer = RelatedInformationRenderer = __decorate([
        __param(0, label_1.ILabelService)
    ], RelatedInformationRenderer);
    class Filter {
        constructor(options) {
            this.options = options;
        }
        filter(element, parentVisibility) {
            if (element instanceof markersModel_1.ResourceMarkers) {
                return this.filterResourceMarkers(element);
            }
            else if (element instanceof markersModel_1.Marker) {
                return this.filterMarker(element, parentVisibility);
            }
            else {
                return this.filterRelatedInformation(element, parentVisibility);
            }
        }
        filterResourceMarkers(resourceMarkers) {
            if (markerService_1.unsupportedSchemas.has(resourceMarkers.resource.scheme)) {
                return false;
            }
            // Filter resource by pattern first (globs)
            // Excludes pattern
            if (this.options.excludesMatcher.matches(resourceMarkers.resource)) {
                return false;
            }
            // Includes pattern
            if (this.options.includesMatcher.matches(resourceMarkers.resource)) {
                return true;
            }
            // Fiter by text. Do not apply negated filters on resources instead use exclude patterns
            if (this.options.textFilter.text && !this.options.textFilter.negate) {
                const uriMatches = markersFilterOptions_1.FilterOptions._filter(this.options.textFilter.text, (0, resources_1.basename)(resourceMarkers.resource));
                if (uriMatches) {
                    return { visibility: true, data: { type: 0 /* FilterDataType.ResourceMarkers */, uriMatches: uriMatches || [] } };
                }
            }
            return 2 /* TreeVisibility.Recurse */;
        }
        filterMarker(marker, parentVisibility) {
            const matchesSeverity = this.options.showErrors && markers_1.MarkerSeverity.Error === marker.marker.severity ||
                this.options.showWarnings && markers_1.MarkerSeverity.Warning === marker.marker.severity ||
                this.options.showInfos && markers_1.MarkerSeverity.Info === marker.marker.severity;
            if (!matchesSeverity) {
                return false;
            }
            if (!this.options.textFilter.text) {
                return true;
            }
            const lineMatches = [];
            for (const line of marker.lines) {
                const lineMatch = markersFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, line);
                lineMatches.push(lineMatch || []);
            }
            const sourceMatches = marker.marker.source ? markersFilterOptions_1.FilterOptions._filter(this.options.textFilter.text, marker.marker.source) : undefined;
            const codeMatches = marker.marker.code ? markersFilterOptions_1.FilterOptions._filter(this.options.textFilter.text, typeof marker.marker.code === 'string' ? marker.marker.code : marker.marker.code.value) : undefined;
            const matched = sourceMatches || codeMatches || lineMatches.some(lineMatch => lineMatch.length > 0);
            // Matched and not negated
            if (matched && !this.options.textFilter.negate) {
                return { visibility: true, data: { type: 1 /* FilterDataType.Marker */, lineMatches, sourceMatches: sourceMatches || [], codeMatches: codeMatches || [] } };
            }
            // Matched and negated - exclude it only if parent visibility is not set
            if (matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return false;
            }
            // Not matched and negated - include it only if parent visibility is not set
            if (!matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return true;
            }
            return parentVisibility;
        }
        filterRelatedInformation(relatedInformation, parentVisibility) {
            if (!this.options.textFilter.text) {
                return true;
            }
            const uriMatches = markersFilterOptions_1.FilterOptions._filter(this.options.textFilter.text, (0, resources_1.basename)(relatedInformation.raw.resource));
            const messageMatches = markersFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, paths.basename(relatedInformation.raw.message));
            const matched = uriMatches || messageMatches;
            // Matched and not negated
            if (matched && !this.options.textFilter.negate) {
                return { visibility: true, data: { type: 2 /* FilterDataType.RelatedInformation */, uriMatches: uriMatches || [], messageMatches: messageMatches || [] } };
            }
            // Matched and negated - exclude it only if parent visibility is not set
            if (matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return false;
            }
            // Not matched and negated - include it only if parent visibility is not set
            if (!matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return true;
            }
            return parentVisibility;
        }
    }
    exports.Filter = Filter;
    let MarkerViewModel = class MarkerViewModel extends lifecycle_1.Disposable {
        constructor(marker, modelService, instantiationService, editorService, languageFeaturesService) {
            super();
            this.marker = marker;
            this.modelService = modelService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.languageFeaturesService = languageFeaturesService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.modelPromise = null;
            this.codeActionsPromise = null;
            this._multiline = true;
            this._quickFixAction = null;
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (this.modelPromise) {
                    this.modelPromise.cancel();
                }
                if (this.codeActionsPromise) {
                    this.codeActionsPromise.cancel();
                }
            }));
        }
        get multiline() {
            return this._multiline;
        }
        set multiline(value) {
            if (this._multiline !== value) {
                this._multiline = value;
                this._onDidChange.fire();
            }
        }
        get quickFixAction() {
            if (!this._quickFixAction) {
                this._quickFixAction = this._register(this.instantiationService.createInstance(markersViewActions_1.QuickFixAction, this.marker));
            }
            return this._quickFixAction;
        }
        showLightBulb() {
            this.setQuickFixes(true);
        }
        async setQuickFixes(waitForModel) {
            const codeActions = await this.getCodeActions(waitForModel);
            this.quickFixAction.quickFixes = codeActions ? this.toActions(codeActions) : [];
            this.quickFixAction.autoFixable(!!codeActions && codeActions.hasAutoFix);
        }
        getCodeActions(waitForModel) {
            if (this.codeActionsPromise !== null) {
                return this.codeActionsPromise;
            }
            return this.getModel(waitForModel)
                .then(model => {
                if (model) {
                    if (!this.codeActionsPromise) {
                        this.codeActionsPromise = (0, async_1.createCancelablePromise)(cancellationToken => {
                            return (0, codeAction_1.getCodeActions)(this.languageFeaturesService.codeActionProvider, model, new range_1.Range(this.marker.range.startLineNumber, this.marker.range.startColumn, this.marker.range.endLineNumber, this.marker.range.endColumn), {
                                type: 1 /* CodeActionTriggerType.Invoke */, triggerAction: types_2.CodeActionTriggerSource.ProblemsView, filter: { include: types_2.CodeActionKind.QuickFix }
                            }, progress_1.Progress.None, cancellationToken).then(actions => {
                                return this._register(actions);
                            });
                        });
                    }
                    return this.codeActionsPromise;
                }
                return null;
            });
        }
        toActions(codeActions) {
            return codeActions.validActions.map(item => new actions_1.Action(item.action.command ? item.action.command.id : item.action.title, item.action.title, undefined, true, () => {
                return this.openFileAtMarker(this.marker)
                    .then(() => this.instantiationService.invokeFunction(codeAction_1.applyCodeAction, item, codeAction_1.ApplyCodeActionReason.FromProblemsView));
            }));
        }
        openFileAtMarker(element) {
            const { resource, selection } = { resource: element.resource, selection: element.range };
            return this.editorService.openEditor({
                resource,
                options: {
                    selection,
                    preserveFocus: true,
                    pinned: false,
                    revealIfVisible: true
                },
            }, editorService_1.ACTIVE_GROUP).then(() => undefined);
        }
        getModel(waitForModel) {
            const model = this.modelService.getModel(this.marker.resource);
            if (model) {
                return Promise.resolve(model);
            }
            if (waitForModel) {
                if (!this.modelPromise) {
                    this.modelPromise = (0, async_1.createCancelablePromise)(cancellationToken => {
                        return new Promise((c) => {
                            this._register(this.modelService.onModelAdded(model => {
                                if ((0, resources_1.isEqual)(model.uri, this.marker.resource)) {
                                    c(model);
                                }
                            }));
                        });
                    });
                }
                return this.modelPromise;
            }
            return Promise.resolve(null);
        }
    };
    exports.MarkerViewModel = MarkerViewModel;
    exports.MarkerViewModel = MarkerViewModel = __decorate([
        __param(1, model_1.IModelService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, editorService_1.IEditorService),
        __param(4, languageFeatures_1.ILanguageFeaturesService)
    ], MarkerViewModel);
    let MarkersViewModel = class MarkersViewModel extends lifecycle_1.Disposable {
        constructor(multiline = true, viewMode = "tree" /* MarkersViewMode.Tree */, contextKeyService, instantiationService) {
            super();
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onDidChangeViewMode = this._register(new event_1.Emitter());
            this.onDidChangeViewMode = this._onDidChangeViewMode.event;
            this.markersViewStates = new Map();
            this.markersPerResource = new Map();
            this.bulkUpdate = false;
            this.hoveredMarker = null;
            this.hoverDelayer = new async_1.Delayer(300);
            this._multiline = true;
            this._viewMode = "tree" /* MarkersViewMode.Tree */;
            this._multiline = multiline;
            this._viewMode = viewMode;
            this.viewModeContextKey = markers_2.MarkersContextKeys.MarkersViewModeContextKey.bindTo(this.contextKeyService);
            this.viewModeContextKey.set(viewMode);
        }
        add(marker) {
            if (!this.markersViewStates.has(marker.id)) {
                const viewModel = this.instantiationService.createInstance(MarkerViewModel, marker);
                const disposables = [viewModel];
                viewModel.multiline = this.multiline;
                viewModel.onDidChange(() => {
                    if (!this.bulkUpdate) {
                        this._onDidChange.fire(marker);
                    }
                }, this, disposables);
                this.markersViewStates.set(marker.id, { viewModel, disposables });
                const markers = this.markersPerResource.get(marker.resource.toString()) || [];
                markers.push(marker);
                this.markersPerResource.set(marker.resource.toString(), markers);
            }
        }
        remove(resource) {
            const markers = this.markersPerResource.get(resource.toString()) || [];
            for (const marker of markers) {
                const value = this.markersViewStates.get(marker.id);
                if (value) {
                    (0, lifecycle_1.dispose)(value.disposables);
                }
                this.markersViewStates.delete(marker.id);
                if (this.hoveredMarker === marker) {
                    this.hoveredMarker = null;
                }
            }
            this.markersPerResource.delete(resource.toString());
        }
        getViewModel(marker) {
            const value = this.markersViewStates.get(marker.id);
            return value ? value.viewModel : null;
        }
        onMarkerMouseHover(marker) {
            this.hoveredMarker = marker;
            this.hoverDelayer.trigger(() => {
                if (this.hoveredMarker) {
                    const model = this.getViewModel(this.hoveredMarker);
                    if (model) {
                        model.showLightBulb();
                    }
                }
            });
        }
        onMarkerMouseLeave(marker) {
            if (this.hoveredMarker === marker) {
                this.hoveredMarker = null;
            }
        }
        get multiline() {
            return this._multiline;
        }
        set multiline(value) {
            let changed = false;
            if (this._multiline !== value) {
                this._multiline = value;
                changed = true;
            }
            this.bulkUpdate = true;
            this.markersViewStates.forEach(({ viewModel }) => {
                if (viewModel.multiline !== value) {
                    viewModel.multiline = value;
                    changed = true;
                }
            });
            this.bulkUpdate = false;
            if (changed) {
                this._onDidChange.fire(undefined);
            }
        }
        get viewMode() {
            return this._viewMode;
        }
        set viewMode(value) {
            if (this._viewMode === value) {
                return;
            }
            this._viewMode = value;
            this._onDidChangeViewMode.fire(value);
            this.viewModeContextKey.set(value);
        }
        dispose() {
            this.markersViewStates.forEach(({ disposables }) => (0, lifecycle_1.dispose)(disposables));
            this.markersViewStates.clear();
            this.markersPerResource.clear();
            super.dispose();
        }
    };
    exports.MarkersViewModel = MarkersViewModel;
    exports.MarkersViewModel = MarkersViewModel = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, instantiation_1.IInstantiationService)
    ], MarkersViewModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vyc1RyZWVWaWV3ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21hcmtlcnMvYnJvd3Nlci9tYXJrZXJzVHJlZVZpZXdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrRXpGLElBQU0sa0NBQWtDLEdBQXhDLE1BQU0sa0NBQWtDO1FBRTlDLFlBQTRDLFlBQTJCO1lBQTNCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1FBQUksQ0FBQztRQUU1RSxrQkFBa0I7WUFDakIsT0FBTyxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVNLFlBQVksQ0FBQyxPQUF3QztZQUMzRCxJQUFJLE9BQU8sWUFBWSw4QkFBZSxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDNUcsT0FBTyxrQkFBUSxDQUFDLGdDQUFnQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdHLENBQUM7WUFDRCxJQUFJLE9BQU8sWUFBWSxxQkFBTSxJQUFJLE9BQU8sWUFBWSw4QkFBZSxFQUFFLENBQUM7Z0JBQ3JFLE9BQU8sa0JBQVEsQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6RCxDQUFDO1lBQ0QsSUFBSSxPQUFPLFlBQVksaUNBQWtCLEVBQUUsQ0FBQztnQkFDM0MsT0FBTyxrQkFBUSxDQUFDLDJD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