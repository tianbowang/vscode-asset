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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/assert", "vs/base/common/codicons", "vs/base/common/decorators", "vs/base/common/filters", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/resources", "vs/base/common/themables", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/editor/common/editor", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/labels", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/testCoverageBars", "vs/workbench/contrib/testing/common/testCoverage", "vs/workbench/contrib/testing/common/testCoverageService", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom, assert_1, codicons_1, decorators_1, filters_1, iterator_1, lifecycle_1, observable_1, resources_1, themables_1, position_1, range_1, nls_1, actions_1, configuration_1, contextkey_1, contextView_1, editor_1, files_1, instantiation_1, keybinding_1, label_1, listService_1, opener_1, quickInput_1, telemetry_1, themeService_1, labels_1, viewPane_1, views_1, icons_1, testCoverageBars_1, testCoverage_1, testCoverageService_1, editorService_1) {
    "use strict";
    var FileCoverageRenderer_1, FunctionCoverageRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestCoverageView = void 0;
    var CoverageSortOrder;
    (function (CoverageSortOrder) {
        CoverageSortOrder[CoverageSortOrder["Coverage"] = 0] = "Coverage";
        CoverageSortOrder[CoverageSortOrder["Location"] = 1] = "Location";
        CoverageSortOrder[CoverageSortOrder["Name"] = 2] = "Name";
    })(CoverageSortOrder || (CoverageSortOrder = {}));
    let TestCoverageView = class TestCoverageView extends viewPane_1.ViewPane {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, coverageService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.coverageService = coverageService;
            this.tree = new lifecycle_1.MutableDisposable();
            this.sortOrder = (0, observable_1.observableValue)('sortOrder', 1 /* CoverageSortOrder.Location */);
        }
        renderBody(container) {
            super.renderBody(container);
            const labels = this._register(this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility }));
            this._register((0, observable_1.autorun)(reader => {
                const coverage = this.coverageService.selected.read(reader);
                if (coverage) {
                    const t = (this.tree.value ??= this.instantiationService.createInstance(TestCoverageTree, container, labels, this.sortOrder));
                    t.setInput(coverage);
                }
                else {
                    this.tree.clear();
                }
            }));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.tree.value?.layout(height, width);
        }
    };
    exports.TestCoverageView = TestCoverageView;
    exports.TestCoverageView = TestCoverageView = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, testCoverageService_1.ITestCoverageService)
    ], TestCoverageView);
    let fnNodeId = 0;
    class FunctionCoverageNode {
        get hits() {
            return this.data.count;
        }
        get label() {
            return this.data.name;
        }
        get location() {
            return this.data.location;
        }
        get tpc() {
            const attr = this.attributableCoverage();
            return attr && (0, testCoverage_1.getTotalCoveragePercent)(attr.statement, attr.branch, undefined);
        }
        constructor(uri, data, details) {
            this.uri = uri;
            this.data = data;
            this.id = String(fnNodeId++);
            this.containedDetails = new Set();
            this.children = [];
            if (data.location instanceof range_1.Range) {
                for (const detail of details) {
                    if (this.contains(detail.location)) {
                        this.containedDetails.add(detail);
                    }
                }
            }
        }
        /** Gets whether this function has a defined range and contains the given range. */
        contains(location) {
            const own = this.data.location;
            return own instanceof range_1.Range && (location instanceof range_1.Range ? own.containsRange(location) : own.containsPosition(location));
        }
        /**
         * If the function defines a range, we can look at statements within the
         * function to get total coverage for the function, rather than a boolean
         * yes/no.
         */
        attributableCoverage() {
            const { location, count } = this.data;
            if (!(location instanceof range_1.Range) || !count) {
                return;
            }
            const statement = { covered: 0, total: 0 };
            const branch = { covered: 0, total: 0 };
            for (const detail of this.containedDetails) {
                if (detail.type !== 1 /* DetailType.Statement */) {
                    continue;
                }
                statement.covered += detail.count > 0 ? 1 : 0;
                statement.total++;
                if (detail.branches) {
                    for (const { count } of detail.branches) {
                        branch.covered += count > 0 ? 1 : 0;
                        branch.total++;
                    }
                }
            }
            return { statement, branch };
        }
    }
    __decorate([
        decorators_1.memoize
    ], FunctionCoverageNode.prototype, "attributableCoverage", null);
    class RevealUncoveredFunctions {
        get label() {
            return (0, nls_1.localize)('functionsWithoutCoverage', "{0} functions without coverage...", this.n);
        }
        constructor(n) {
            this.n = n;
            this.id = String(fnNodeId++);
        }
    }
    class LoadingDetails {
        constructor() {
            this.id = String(fnNodeId++);
            this.label = (0, nls_1.localize)('loadingCoverageDetails', "Loading Coverage Details...");
        }
    }
    const isFileCoverage = (c) => typeof c === 'object' && 'value' in c;
    const isFunctionCoverage = (c) => c instanceof FunctionCoverageNode;
    const shouldShowFunctionDetailsOnExpand = (c) => isFileCoverage(c) && c.value instanceof testCoverage_1.FileCoverage && !!c.value.function?.total;
    let TestCoverageTree = class TestCoverageTree extends lifecycle_1.Disposable {
        constructor(container, labels, sortOrder, instantiationService, editorService) {
            super();
            this.tree = instantiationService.createInstance(listService_1.WorkbenchCompressibleObjectTree, 'TestCoverageView', container, new TestCoverageTreeListDelegate(), [
                instantiationService.createInstance(FileCoverageRenderer, labels),
                instantiationService.createInstance(FunctionCoverageRenderer),
                instantiationService.createInstance(BasicRenderer),
            ], {
                expandOnlyOnTwistieClick: true,
                sorter: new Sorter(sortOrder),
                keyboardNavigationLabelProvider: {
                    getCompressedNodeKeyboardNavigationLabel(elements) {
                        return elements.map(e => this.getKeyboardNavigationLabel(e)).join('/');
                    },
                    getKeyboardNavigationLabel(e) {
                        return isFileCoverage(e)
                            ? (0, resources_1.basenameOrAuthority)(e.value.uri)
                            : e.label;
                    },
                },
                accessibilityProvider: {
                    getAriaLabel(element) {
                        if (isFileCoverage(element)) {
                            const name = (0, resources_1.basenameOrAuthority)(element.value.uri);
                            return (0, nls_1.localize)('testCoverageItemLabel', "{0} coverage: {0}%", name, (element.value.tpc * 100).toFixed(2));
                        }
                        else {
                            return element.label;
                        }
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)('testCoverageTreeLabel', "Test Coverage Explorer");
                    }
                },
                identityProvider: new TestCoverageIdentityProvider(),
            });
            this._register((0, observable_1.autorun)(reader => {
                sortOrder.read(reader);
                this.tree.resort(null, true);
            }));
            this._register(this.tree);
            this._register(this.tree.onDidChangeCollapseState(e => {
                const el = e.node.element;
                if (!e.node.collapsed && !e.node.children.length && el && shouldShowFunctionDetailsOnExpand(el)) {
                    if (el.value.hasSynchronousDetails) {
                        this.tree.setChildren(el, [{ element: new LoadingDetails(), incompressible: true }]);
                    }
                    el.value.details().then(details => this.updateWithDetails(el, details));
                }
            }));
            this._register(this.tree.onDidOpen(e => {
                let resource;
                let selection;
                if (e.element) {
                    if (isFileCoverage(e.element) && !e.element.children?.size) {
                        resource = e.element.value.uri;
                    }
                    else if (isFunctionCoverage(e.element)) {
                        resource = e.element.uri;
                        selection = e.element.location;
                    }
                }
                if (!resource) {
                    return;
                }
                editorService.openEditor({
                    resource,
                    options: {
                        selection: selection instanceof position_1.Position ? range_1.Range.fromPositions(selection, selection) : selection,
                        revealIfOpened: true,
                        selectionRevealType: 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */,
                        preserveFocus: e.editorOptions.preserveFocus,
                        pinned: e.editorOptions.pinned,
                        source: editor_1.EditorOpenSource.USER,
                    },
                }, e.sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
            }));
        }
        setInput(coverage) {
            const files = [];
            for (let node of coverage.tree.nodes) {
                // when showing initial children, only show from the first file or tee
                while (!(node.value instanceof testCoverage_1.FileCoverage) && node.children?.size === 1) {
                    node = iterator_1.Iterable.first(node.children.values());
                }
                files.push(node);
            }
            const toChild = (file) => {
                const isFile = !file.children?.size;
                return {
                    element: file,
                    incompressible: isFile,
                    collapsed: isFile,
                    // directories can be expanded, and items with function info can be expanded
                    collapsible: !isFile || !!file.value?.function?.total,
                    children: file.children && iterator_1.Iterable.map(file.children?.values(), toChild)
                };
            };
            this.tree.setChildren(null, iterator_1.Iterable.map(files, toChild));
        }
        layout(height, width) {
            this.tree.layout(height, width);
        }
        updateWithDetails(el, details) {
            if (!this.tree.hasElement(el)) {
                return; // avoid any issues if the tree changes in the meanwhile
            }
            const functions = [];
            for (const fn of details) {
                if (fn.type !== 0 /* DetailType.Function */) {
                    continue;
                }
                let arr = functions;
                while (true) {
                    const parent = arr.find(p => p.containedDetails.has(fn));
                    if (parent) {
                        arr = parent.children;
                    }
                    else {
                        break;
                    }
                }
                arr.push(new FunctionCoverageNode(el.value.uri, fn, details));
            }
            const makeChild = (fn) => ({
                element: fn,
                incompressible: true,
                collapsed: true,
                collapsible: fn.children.length > 0,
                children: fn.children.map(makeChild)
            });
            this.tree.setChildren(el, functions.map(makeChild));
        }
    };
    TestCoverageTree = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, editorService_1.IEditorService)
    ], TestCoverageTree);
    class TestCoverageTreeListDelegate {
        getHeight(element) {
            return 22;
        }
        getTemplateId(element) {
            if (isFileCoverage(element)) {
                return FileCoverageRenderer.ID;
            }
            if (isFunctionCoverage(element)) {
                return FunctionCoverageRenderer.ID;
            }
            if (element instanceof LoadingDetails || element instanceof RevealUncoveredFunctions) {
                return BasicRenderer.ID;
            }
            (0, assert_1.assertNever)(element);
        }
    }
    class Sorter {
        constructor(order) {
            this.order = order;
        }
        compare(a, b) {
            const order = this.order.get();
            if (isFileCoverage(a) && isFileCoverage(b)) {
                switch (order) {
                    case 1 /* CoverageSortOrder.Location */:
                    case 2 /* CoverageSortOrder.Name */:
                        return a.value.uri.toString().localeCompare(b.value.uri.toString());
                    case 0 /* CoverageSortOrder.Coverage */:
                        return b.value.tpc - a.value.tpc;
                }
            }
            else if (isFunctionCoverage(a) && isFunctionCoverage(b)) {
                switch (order) {
                    case 1 /* CoverageSortOrder.Location */:
                        return position_1.Position.compare(a.location instanceof range_1.Range ? a.location.getStartPosition() : a.location, b.location instanceof range_1.Range ? b.location.getStartPosition() : b.location);
                    case 2 /* CoverageSortOrder.Name */:
                        return a.label.localeCompare(b.label);
                    case 0 /* CoverageSortOrder.Coverage */: {
                        const attrA = a.tpc;
                        const attrB = b.tpc;
                        return (attrA !== undefined && attrB !== undefined && attrB - attrA)
                            || (b.hits - a.hits)
                            || a.label.localeCompare(b.label);
                    }
                }
            }
            else {
                return 0;
            }
        }
    }
    let FileCoverageRenderer = class FileCoverageRenderer {
        static { FileCoverageRenderer_1 = this; }
        static { this.ID = 'F'; }
        constructor(labels, labelService, instantiationService) {
            this.labels = labels;
            this.labelService = labelService;
            this.instantiationService = instantiationService;
            this.templateId = FileCoverageRenderer_1.ID;
        }
        /** @inheritdoc */
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.DisposableStore();
            container.classList.add('test-coverage-list-item');
            return {
                container,
                bars: templateDisposables.add(this.instantiationService.createInstance(testCoverageBars_1.ManagedTestCoverageBars, { compact: false, container })),
                label: templateDisposables.add(this.labels.create(container, {
                    supportHighlights: true,
                })),
                templateDisposables,
            };
        }
        /** @inheritdoc */
        renderElement(node, _index, templateData) {
            this.doRender(node.element, templateData, node.filterData);
        }
        /** @inheritdoc */
        renderCompressedElements(node, _index, templateData) {
            this.doRender(node.element.elements, templateData, node.filterData);
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.dispose();
        }
        /** @inheritdoc */
        doRender(element, templateData, filterData) {
            const stat = (element instanceof Array ? element[element.length - 1] : element);
            const file = stat.value;
            const name = element instanceof Array ? element.map(e => (0, resources_1.basenameOrAuthority)(e.value.uri)) : (0, resources_1.basenameOrAuthority)(file.uri);
            templateData.bars.setCoverageInfo(file);
            templateData.label.setResource({ resource: file.uri, name }, {
                fileKind: stat.children?.size ? files_1.FileKind.FOLDER : files_1.FileKind.FILE,
                matches: (0, filters_1.createMatches)(filterData),
                separator: this.labelService.getSeparator(file.uri.scheme, file.uri.authority),
                extraClasses: ['test-coverage-list-item-label'],
            });
        }
    };
    FileCoverageRenderer = FileCoverageRenderer_1 = __decorate([
        __param(1, label_1.ILabelService),
        __param(2, instantiation_1.IInstantiationService)
    ], FileCoverageRenderer);
    let FunctionCoverageRenderer = class FunctionCoverageRenderer {
        static { FunctionCoverageRenderer_1 = this; }
        static { this.ID = 'N'; }
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
            this.templateId = FunctionCoverageRenderer_1.ID;
        }
        /** @inheritdoc */
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.DisposableStore();
            container.classList.add('test-coverage-list-item');
            const icon = dom.append(container, dom.$('.state'));
            const label = dom.append(container, dom.$('.name'));
            return {
                container,
                bars: templateDisposables.add(this.instantiationService.createInstance(testCoverageBars_1.ManagedTestCoverageBars, { compact: false, container })),
                templateDisposables,
                icon,
                label,
            };
        }
        /** @inheritdoc */
        renderElement(node, _index, templateData) {
            this.doRender(node.element, templateData, node.filterData);
        }
        /** @inheritdoc */
        renderCompressedElements(node, _index, templateData) {
            this.doRender(node.element.elements[node.element.elements.length - 1], templateData, node.filterData);
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.dispose();
        }
        /** @inheritdoc */
        doRender(element, templateData, _filterData) {
            const covered = element.hits > 0;
            const icon = covered ? icons_1.testingWasCovered : icons_1.testingStatesToIcons.get(0 /* TestResultState.Unset */);
            templateData.container.classList.toggle('not-covered', !covered);
            templateData.icon.className = `computed-state ${themables_1.ThemeIcon.asClassName(icon)}`;
            templateData.label.innerText = element.label;
            templateData.bars.setCoverageInfo(element.attributableCoverage());
        }
    };
    FunctionCoverageRenderer = FunctionCoverageRenderer_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], FunctionCoverageRenderer);
    class BasicRenderer {
        constructor() {
            this.templateId = BasicRenderer.ID;
        }
        static { this.ID = 'B'; }
        renderCompressedElements(node, _index, container) {
            this.renderInner(node.element.elements[node.element.elements.length - 1], container);
        }
        renderTemplate(container) {
            return container;
        }
        renderElement(node, index, container) {
            this.renderInner(node.element, container);
        }
        disposeTemplate() {
            // no-op
        }
        renderInner(element, container) {
            container.innerText = element.label;
        }
    }
    class TestCoverageIdentityProvider {
        getId(element) {
            return isFileCoverage(element)
                ? element.value.uri.toString()
                : element.id;
        }
    }
    (0, actions_1.registerAction2)(class TestCoverageChangeSortingAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: "testing.coverageViewChangeSorting" /* TestCommandId.CoverageViewChangeSorting */,
                viewId: "workbench.view.testCoverage" /* Testing.CoverageViewId */,
                title: (0, nls_1.localize2)('testing.changeCoverageSort', 'Change Sort Order'),
                icon: codicons_1.Codicon.sortPrecedence,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testCoverage" /* Testing.CoverageViewId */),
                    group: 'navigation',
                }
            });
        }
        runInView(accessor, view) {
            const disposables = new lifecycle_1.DisposableStore();
            const quickInput = disposables.add(accessor.get(quickInput_1.IQuickInputService).createQuickPick());
            const items = [
                { label: (0, nls_1.localize)('testing.coverageSortByLocation', 'Sort by Location'), value: 1 /* CoverageSortOrder.Location */, description: (0, nls_1.localize)('testing.coverageSortByLocationDescription', 'Files are sorted alphabetically, functions are sorted by position') },
                { label: (0, nls_1.localize)('testing.coverageSortByCoverage', 'Sort by Coverage'), value: 0 /* CoverageSortOrder.Coverage */, description: (0, nls_1.localize)('testing.coverageSortByCoverageDescription', 'Files and functions are sorted by total coverage') },
                { label: (0, nls_1.localize)('testing.coverageSortByName', 'Sort by Name'), value: 2 /* CoverageSortOrder.Name */, description: (0, nls_1.localize)('testing.coverageSortByNameDescription', 'Files and functions are sorted alphabetically') },
            ];
            quickInput.placeholder = (0, nls_1.localize)('testing.coverageSortPlaceholder', 'Sort the Test Coverage view...');
            quickInput.items = items;
            quickInput.show();
            quickInput.onDidHide(() => quickInput.dispose());
            quickInput.onDidAccept(() => {
                const picked = quickInput.selectedItems[0]?.value;
                if (picked !== undefined) {
                    view.sortOrder.set(picked, undefined);
                    quickInput.dispose();
                }
            });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvdmVyYWdlVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9icm93c2VyL3Rlc3RDb3ZlcmFnZVZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThDaEcsSUFBVyxpQkFJVjtJQUpELFdBQVcsaUJBQWlCO1FBQzNCLGlFQUFRLENBQUE7UUFDUixpRUFBUSxDQUFBO1FBQ1IseURBQUksQ0FBQTtJQUNMLENBQUMsRUFKVSxpQkFBaUIsS0FBakIsaUJBQWlCLFFBSTNCO0lBRU0sSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSxtQkFBUTtRQUk3QyxZQUNDLE9BQXlCLEVBQ0wsaUJBQXFDLEVBQ3BDLGtCQUF1QyxFQUNyQyxvQkFBMkMsRUFDOUMsaUJBQXFDLEVBQ2pDLHFCQUE2QyxFQUM5QyxvQkFBMkMsRUFDbEQsYUFBNkIsRUFDOUIsWUFBMkIsRUFDdkIsZ0JBQW1DLEVBQ2hDLGVBQXNEO1lBRTVFLEtBQUssQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBRnBKLG9CQUFlLEdBQWYsZUFBZSxDQUFzQjtZQWQ1RCxTQUFJLEdBQUcsSUFBSSw2QkFBaUIsRUFBb0IsQ0FBQztZQUNsRCxjQUFTLEdBQUcsSUFBQSw0QkFBZSxFQUFDLFdBQVcscUNBQTZCLENBQUM7UUFnQnJGLENBQUM7UUFFa0IsVUFBVSxDQUFDLFNBQXNCO1lBQ25ELEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FB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