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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listPaging", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/table/tableWidget", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/asyncDataTree", "vs/base/browser/ui/tree/dataTree", "vs/base/browser/ui/tree/objectTree", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/product/common/product", "vs/platform/registry/common/platform", "vs/platform/theme/browser/defaultStyles"], function (require, exports, dom_1, listPaging_1, listWidget_1, tableWidget_1, abstractTree_1, asyncDataTree_1, dataTree_1, objectTree_1, event_1, lifecycle_1, nls_1, configuration_1, configurationRegistry_1, contextkey_1, contextkeys_1, contextView_1, instantiation_1, keybinding_1, product_1, platform_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchCompressibleAsyncDataTree = exports.WorkbenchAsyncDataTree = exports.WorkbenchDataTree = exports.WorkbenchCompressibleObjectTree = exports.WorkbenchObjectTree = exports.getSelectionKeyboardEvent = exports.WorkbenchTable = exports.WorkbenchPagedList = exports.WorkbenchList = exports.WorkbenchTreeFindOpen = exports.WorkbenchTreeElementHasChild = exports.WorkbenchTreeElementCanExpand = exports.WorkbenchTreeElementHasParent = exports.WorkbenchTreeElementCanCollapse = exports.WorkbenchListSupportsFind = exports.WorkbenchListSelectionNavigation = exports.WorkbenchListMultiSelection = exports.WorkbenchListDoubleSelection = exports.WorkbenchListHasSelectionOrFocus = exports.WorkbenchListFocusContextKey = exports.WorkbenchListSupportsMultiSelectContextKey = exports.WorkbenchTreeStickyScrollFocused = exports.RawWorkbenchListFocusContextKey = exports.WorkbenchListScrollAtBottomContextKey = exports.WorkbenchListScrollAtTopContextKey = exports.RawWorkbenchListScrollAtBoundaryContextKey = exports.ListService = exports.IListService = void 0;
    exports.IListService = (0, instantiation_1.createDecorator)('listService');
    class ListService {
        get lastFocusedList() {
            return this._lastFocusedWidget;
        }
        constructor() {
            this.disposables = new lifecycle_1.DisposableStore();
            this.lists = [];
            this._lastFocusedWidget = undefined;
            this._hasCreatedStyleController = false;
        }
        setLastFocusedList(widget) {
            if (widget === this._lastFocusedWidget) {
                return;
            }
            this._lastFocusedWidget?.getHTMLElement().classList.remove('last-focused');
            this._lastFocusedWidget = widget;
            this._lastFocusedWidget?.getHTMLElement().classList.add('last-focused');
        }
        register(widget, extraContextKeys) {
            if (!this._hasCreatedStyleController) {
                this._hasCreatedStyleController = true;
                // create a shared default tree style sheet for performance reasons
                const styleController = new listWidget_1.DefaultStyleController((0, dom_1.createStyleSheet)(), '');
                styleController.style(defaultStyles_1.defaultListStyles);
            }
            if (this.lists.some(l => l.widget === widget)) {
                throw new Error('Cannot register the same widget multiple times');
            }
            // Keep in our lists list
            const registeredList = { widget, extraContextKeys };
            this.lists.push(registeredList);
            // Check for currently being focused
            if ((0, dom_1.isActiveElement)(widget.getHTMLElement())) {
                this.setLastFocusedList(widget);
            }
            return (0, lifecycle_1.combinedDisposable)(widget.onDidFocus(() => this.setLastFocusedList(widget)), (0, lifecycle_1.toDisposable)(() => this.lists.splice(this.lists.indexOf(registeredList), 1)), widget.onDidDispose(() => {
                this.lists = this.lists.filter(l => l !== registeredList);
                if (this._lastFocusedWidget === widget) {
                    this.setLastFocusedList(undefined);
                }
            }));
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    exports.ListService = ListService;
    exports.RawWorkbenchListScrollAtBoundaryContextKey = new contextkey_1.RawContextKey('listScrollAtBoundary', 'none');
    exports.WorkbenchListScrollAtTopContextKey = contextkey_1.ContextKeyExpr.or(exports.RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo('top'), exports.RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo('both'));
    exports.WorkbenchListScrollAtBottomContextKey = contextkey_1.ContextKeyExpr.or(exports.RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo('bottom'), exports.RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo('both'));
    exports.RawWorkbenchListFocusContextKey = new contextkey_1.RawContextKey('listFocus', true);
    exports.WorkbenchTreeStickyScrollFocused = new contextkey_1.RawContextKey('treestickyScrollFocused', false);
    exports.WorkbenchListSupportsMultiSelectContextKey = new contextkey_1.RawContextKey('listSupportsMultiselect', true);
    exports.WorkbenchListFocusContextKey = contextkey_1.ContextKeyExpr.and(exports.RawWorkbenchListFocusContextKey, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey), exports.WorkbenchTreeStickyScrollFocused.negate());
    exports.WorkbenchListHasSelectionOrFocus = new contextkey_1.RawContextKey('listHasSelectionOrFocus', false);
    exports.WorkbenchListDoubleSelection = new contextkey_1.RawContextKey('listDoubleSelection', false);
    exports.WorkbenchListMultiSelection = new contextkey_1.RawContextKey('listMultiSelection', false);
    exports.WorkbenchListSelectionNavigation = new contextkey_1.RawContextKey('listSelectionNavigation', false);
    exports.WorkbenchListSupportsFind = new contextkey_1.RawContextKey('listSupportsFind', true);
    exports.WorkbenchTreeElementCanCollapse = new contextkey_1.RawContextKey('treeElementCanCollapse', false);
    exports.WorkbenchTreeElementHasParent = new contextkey_1.RawContextKey('treeElementHasParent', false);
    exports.WorkbenchTreeElementCanExpand = new contextkey_1.RawContextKey('treeElementCanExpand', false);
    exports.WorkbenchTreeElementHasChild = new contextkey_1.RawContextKey('treeElementHasChild', false);
    exports.WorkbenchTreeFindOpen = new contextkey_1.RawContextKey('treeFindOpen', false);
    const WorkbenchListTypeNavigationModeKey = 'listTypeNavigationMode';
    /**
     * @deprecated in favor of WorkbenchListTypeNavigationModeKey
     */
    const WorkbenchListAutomaticKeyboardNavigationLegacyKey = 'listAutomaticKeyboardNavigation';
    function createScopedContextKeyService(contextKeyService, widget) {
        const result = contextKeyService.createScoped(widget.getHTMLElement());
        exports.RawWorkbenchListFocusContextKey.bindTo(result);
        return result;
    }
    function createScrollObserver(contextKeyService, widget) {
        const listScrollAt = exports.RawWorkbenchListScrollAtBoundaryContextKey.bindTo(contextKeyService);
        const update = () => {
            const atTop = widget.scrollTop === 0;
            // We need a threshold `1` since scrollHeight is rounded.
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled
            const atBottom = widget.scrollHeight - widget.renderHeight - widget.scrollTop < 1;
            if (atTop && atBottom) {
                listScrollAt.set('both');
            }
            else if (atTop) {
                listScrollAt.set('top');
            }
            else if (atBottom) {
                listScrollAt.set('bottom');
            }
            else {
                listScrollAt.set('none');
            }
        };
        update();
        return widget.onDidScroll(update);
    }
    const multiSelectModifierSettingKey = 'workbench.list.multiSelectModifier';
    const openModeSettingKey = 'workbench.list.openMode';
    const horizontalScrollingKey = 'workbench.list.horizontalScrolling';
    const defaultFindModeSettingKey = 'workbench.list.defaultFindMode';
    const typeNavigationModeSettingKey = 'workbench.list.typeNavigationMode';
    /** @deprecated in favor of `workbench.list.defaultFindMode` and `workbench.list.typeNavigationMode` */
    const keyboardNavigationSettingKey = 'workbench.list.keyboardNavigation';
    const scrollByPageKey = 'workbench.list.scrollByPage';
    const defaultFindMatchTypeSettingKey = 'workbench.list.defaultFindMatchType';
    const treeIndentKey = 'workbench.tree.indent';
    const treeRenderIndentGuidesKey = 'workbench.tree.renderIndentGuides';
    const listSmoothScrolling = 'workbench.list.smoothScrolling';
    const mouseWheelScrollSensitivityKey = 'workbench.list.mouseWheelScrollSensitivity';
    const fastScrollSensitivityKey = 'workbench.list.fastScrollSensitivity';
    const treeExpandMode = 'workbench.tree.expandMode';
    const treeStickyScroll = 'workbench.tree.enableStickyScroll';
    const treeStickyScrollMaxElements = 'workbench.tree.stickyScrollMaxItemCount';
    function useAltAsMultipleSelectionModifier(configurationService) {
        return configurationService.getValue(multiSelectModifierSettingKey) === 'alt';
    }
    class MultipleSelectionController extends lifecycle_1.Disposable {
        constructor(configurationService) {
            super();
            this.configurationService = configurationService;
            this.useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this.useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(this.configurationService);
                }
            }));
        }
        isSelectionSingleChangeEvent(event) {
            if (this.useAltAsMultipleSelectionModifier) {
                return event.browserEvent.altKey;
            }
            return (0, listWidget_1.isSelectionSingleChangeEvent)(event);
        }
        isSelectionRangeChangeEvent(event) {
            return (0, listWidget_1.isSelectionRangeChangeEvent)(event);
        }
    }
    function toWorkbenchListOptions(accessor, options) {
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const keybindingService = accessor.get(keybinding_1.IKeybindingService);
        const disposables = new lifecycle_1.DisposableStore();
        const result = {
            ...options,
            keyboardNavigationDelegate: { mightProducePrintableCharacter(e) { return keybindingService.mightProducePrintableCharacter(e); } },
            smoothScrolling: Boolean(configurationService.getValue(listSmoothScrolling)),
            mouseWheelScrollSensitivity: configurationService.getValue(mouseWheelScrollSensitivityKey),
            fastScrollSensitivity: configurationService.getValue(fastScrollSensitivityKey),
            multipleSelectionController: options.multipleSelectionController ?? disposables.add(new MultipleSelectionController(configurationService)),
            keyboardNavigationEventFilter: createKeyboardNavigationEventFilter(keybindingService),
            scrollByPage: Boolean(configurationService.getValue(scrollByPageKey))
        };
        return [result, disposables];
    }
    let WorkbenchList = class WorkbenchList extends listWidget_1.List {
        get onDidOpen() { return this.navigator.onDidOpen; }
        constructor(user, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
            const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
            super(user, container, delegate, renderers, {
                keyboardSupport: false,
                ...workbenchListOptions,
                horizontalScrolling,
            });
            this.disposables.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.disposables.add(createScrollObserver(this.contextKeyService, this));
            this.listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            this.listSupportsMultiSelect.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.listHasSelectionOrFocus = exports.WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
            this.listDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
            this.listMultiSelection = exports.WorkbenchListMultiSelection.bindTo(this.contextKeyService);
            this.horizontalScrolling = options.horizontalScrolling;
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.disposables.add(this.contextKeyService);
            this.disposables.add(listService.register(this));
            this.updateStyles(options.overrideStyles);
            this.disposables.add(this.onDidChangeSelection(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                    this.listMultiSelection.set(selection.length > 1);
                    this.listDoubleSelection.set(selection.length === 2);
                });
            }));
            this.disposables.add(this.onDidChangeFocus(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
            }));
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === undefined) {
                    const horizontalScrolling = Boolean(configurationService.getValue(horizontalScrollingKey));
                    options = { ...options, horizontalScrolling };
                }
                if (e.affectsConfiguration(scrollByPageKey)) {
                    const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
                    options = { ...options, scrollByPage };
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
                    options = { ...options, smoothScrolling };
                }
                if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
                    const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
                    options = { ...options, mouseWheelScrollSensitivity };
                }
                if (e.affectsConfiguration(fastScrollSensitivityKey)) {
                    const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
                    options = { ...options, fastScrollSensitivity };
                }
                if (Object.keys(options).length > 0) {
                    this.updateOptions(options);
                }
            }));
            this.navigator = new ListResourceNavigator(this, { configurationService, ...options });
            this.disposables.add(this.navigator);
        }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.updateStyles(options.overrideStyles);
            }
            if (options.multipleSelectionSupport !== undefined) {
                this.listSupportsMultiSelect.set(!!options.multipleSelectionSupport);
            }
        }
        updateStyles(styles) {
            this.style(styles ? (0, defaultStyles_1.getListStyles)(styles) : defaultStyles_1.defaultListStyles);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
    };
    exports.WorkbenchList = WorkbenchList;
    exports.WorkbenchList = WorkbenchList = __decorate([
        __param(5, contextkey_1.IContextKeyService),
        __param(6, exports.IListService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, instantiation_1.IInstantiationService)
    ], WorkbenchList);
    let WorkbenchPagedList = class WorkbenchPagedList extends listPaging_1.PagedList {
        get onDidOpen() { return this.navigator.onDidOpen; }
        constructor(user, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
            const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
            super(user, container, delegate, renderers, {
                keyboardSupport: false,
                ...workbenchListOptions,
                horizontalScrolling,
            });
            this.disposables = new lifecycle_1.DisposableStore();
            this.disposables.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.disposables.add(createScrollObserver(this.contextKeyService, this.widget));
            this.horizontalScrolling = options.horizontalScrolling;
            this.listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            this.listSupportsMultiSelect.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.disposables.add(this.contextKeyService);
            this.disposables.add(listService.register(this));
            this.updateStyles(options.overrideStyles);
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === undefined) {
                    const horizontalScrolling = Boolean(configurationService.getValue(horizontalScrollingKey));
                    options = { ...options, horizontalScrolling };
                }
                if (e.affectsConfiguration(scrollByPageKey)) {
                    const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
                    options = { ...options, scrollByPage };
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
                    options = { ...options, smoothScrolling };
                }
                if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
                    const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
                    options = { ...options, mouseWheelScrollSensitivity };
                }
                if (e.affectsConfiguration(fastScrollSensitivityKey)) {
                    const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
                    options = { ...options, fastScrollSensitivity };
                }
                if (Object.keys(options).length > 0) {
                    this.updateOptions(options);
                }
            }));
            this.navigator = new ListResourceNavigator(this, { configurationService, ...options });
            this.disposables.add(this.navigator);
        }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.updateStyles(options.overrideStyles);
            }
            if (options.multipleSelectionSupport !== undefined) {
                this.listSupportsMultiSelect.set(!!options.multipleSelectionSupport);
            }
        }
        updateStyles(styles) {
            this.style(styles ? (0, defaultStyles_1.getListStyles)(styles) : defaultStyles_1.defaultListStyles);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
        dispose() {
            this.disposables.dispose();
            super.dispose();
        }
    };
    exports.WorkbenchPagedList = WorkbenchPagedList;
    exports.WorkbenchPagedList = WorkbenchPagedList = __decorate([
        __param(5, contextkey_1.IContextKeyService),
        __param(6, exports.IListService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, instantiation_1.IInstantiationService)
    ], WorkbenchPagedList);
    let WorkbenchTable = class WorkbenchTable extends tableWidget_1.Table {
        get onDidOpen() { return this.navigator.onDidOpen; }
        constructor(user, container, delegate, columns, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
            const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
            super(user, container, delegate, columns, renderers, {
                keyboardSupport: false,
                ...workbenchListOptions,
                horizontalScrolling,
            });
            this.disposables.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.disposables.add(createScrollObserver(this.contextKeyService, this));
            this.listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            this.listSupportsMultiSelect.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.listHasSelectionOrFocus = exports.WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
            this.listDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
            this.listMultiSelection = exports.WorkbenchListMultiSelection.bindTo(this.contextKeyService);
            this.horizontalScrolling = options.horizontalScrolling;
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.disposables.add(this.contextKeyService);
            this.disposables.add(listService.register(this));
            this.updateStyles(options.overrideStyles);
            this.disposables.add(this.onDidChangeSelection(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                    this.listMultiSelection.set(selection.length > 1);
                    this.listDoubleSelection.set(selection.length === 2);
                });
            }));
            this.disposables.add(this.onDidChangeFocus(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
            }));
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === undefined) {
                    const horizontalScrolling = Boolean(configurationService.getValue(horizontalScrollingKey));
                    options = { ...options, horizontalScrolling };
                }
                if (e.affectsConfiguration(scrollByPageKey)) {
                    const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
                    options = { ...options, scrollByPage };
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
                    options = { ...options, smoothScrolling };
                }
                if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
                    const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
                    options = { ...options, mouseWheelScrollSensitivity };
                }
                if (e.affectsConfiguration(fastScrollSensitivityKey)) {
                    const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
                    options = { ...options, fastScrollSensitivity };
                }
                if (Object.keys(options).length > 0) {
                    this.updateOptions(options);
                }
            }));
            this.navigator = new TableResourceNavigator(this, { configurationService, ...options });
            this.disposables.add(this.navigator);
        }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.updateStyles(options.overrideStyles);
            }
            if (options.multipleSelectionSupport !== undefined) {
                this.listSupportsMultiSelect.set(!!options.multipleSelectionSupport);
            }
        }
        updateStyles(styles) {
            this.style(styles ? (0, defaultStyles_1.getListStyles)(styles) : defaultStyles_1.defaultListStyles);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
        dispose() {
            this.disposables.dispose();
            super.dispose();
        }
    };
    exports.WorkbenchTable = WorkbenchTable;
    exports.WorkbenchTable = WorkbenchTable = __decorate([
        __param(6, contextkey_1.IContextKeyService),
        __param(7, exports.IListService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, instantiation_1.IInstantiationService)
    ], WorkbenchTable);
    function getSelectionKeyboardEvent(typeArg = 'keydown', preserveFocus, pinned) {
        const e = new KeyboardEvent(typeArg);
        e.preserveFocus = preserveFocus;
        e.pinned = pinned;
        e.__forceEvent = true;
        return e;
    }
    exports.getSelectionKeyboardEvent = getSelectionKeyboardEvent;
    class ResourceNavigator extends lifecycle_1.Disposable {
        constructor(widget, options) {
            super();
            this.widget = widget;
            this._onDidOpen = this._register(new event_1.Emitter());
            this.onDidOpen = this._onDidOpen.event;
            this._register(event_1.Event.filter(this.widget.onDidChangeSelection, e => (0, dom_1.isKeyboardEvent)(e.browserEvent))(e => this.onSelectionFromKeyboard(e)));
            this._register(this.widget.onPointer((e) => this.onPointer(e.element, e.browserEvent)));
            this._register(this.widget.onMouseDblClick((e) => this.onMouseDblClick(e.element, e.browserEvent)));
            if (typeof options?.openOnSingleClick !== 'boolean' && options?.configurationService) {
                this.openOnSingleClick = options?.configurationService.getValue(openModeSettingKey) !== 'doubleClick';
                this._register(options?.configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(openModeSettingKey)) {
                        this.openOnSingleClick = options?.configurationService.getValue(openModeSettingKey) !== 'doubleClick';
                    }
                }));
            }
            else {
                this.openOnSingleClick = options?.openOnSingleClick ?? true;
            }
        }
        onSelectionFromKeyboard(event) {
            if (event.elements.length !== 1) {
                return;
            }
            const selectionKeyboardEvent = event.browserEvent;
            const preserveFocus = typeof selectionKeyboardEvent.preserveFocus === 'boolean' ? selectionKeyboardEvent.preserveFocus : true;
            const pinned = typeof selectionKeyboardEvent.pinned === 'boolean' ? selectionKeyboardEvent.pinned : !preserveFocus;
            const sideBySide = false;
            this._open(this.getSelectedElement(), preserveFocus, pinned, sideBySide, event.browserEvent);
        }
        onPointer(element, browserEvent) {
            if (!this.openOnSingleClick) {
                return;
            }
            const isDoubleClick = browserEvent.detail === 2;
            if (isDoubleClick) {
                return;
            }
            const isMiddleClick = browserEvent.button === 1;
            const preserveFocus = true;
            const pinned = isMiddleClick;
            const sideBySide = browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey;
            this._open(element, preserveFocus, pinned, sideBySide, browserEvent);
        }
        onMouseDblClick(element, browserEvent) {
            if (!browserEvent) {
                return;
            }
            // copied from AbstractTree
            const target = browserEvent.target;
            const onTwistie = target.classList.contains('monaco-tl-twistie')
                || (target.classList.contains('monaco-icon-label') && target.classList.contains('folder-icon') && browserEvent.offsetX < 16);
            if (onTwistie) {
                return;
            }
            const preserveFocus = false;
            const pinned = true;
            const sideBySide = (browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey);
            this._open(element, preserveFocus, pinned, sideBySide, browserEvent);
        }
        _open(element, preserveFocus, pinned, sideBySide, browserEvent) {
            if (!element) {
                return;
            }
            this._onDidOpen.fire({
                editorOptions: {
                    preserveFocus,
                    pinned,
                    revealIfVisible: true
                },
                sideBySide,
                element,
                browserEvent
            });
        }
    }
    class ListResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
            this.widget = widget;
        }
        getSelectedElement() {
            return this.widget.getSelectedElements()[0];
        }
    }
    class TableResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
        }
        getSelectedElement() {
            return this.widget.getSelectedElements()[0];
        }
    }
    class TreeResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
        }
        getSelectedElement() {
            return this.widget.getSelection()[0] ?? undefined;
        }
    }
    function createKeyboardNavigationEventFilter(keybindingService) {
        let inMultiChord = false;
        return event => {
            if (event.toKeyCodeChord().isModifierKey()) {
                return false;
            }
            if (inMultiChord) {
                inMultiChord = false;
                return false;
            }
            const result = keybindingService.softDispatch(event, event.target);
            if (result.kind === 1 /* ResultKind.MoreChordsNeeded */) {
                inMultiChord = true;
                return false;
            }
            inMultiChord = false;
            return result.kind === 0 /* ResultKind.NoMatchingKb */;
        };
    }
    let WorkbenchObjectTree = class WorkbenchObjectTree extends objectTree_1.ObjectTree {
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        constructor(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.disposables.add(this.internals);
        }
        updateOptions(options) {
            super.updateOptions(options);
            this.internals.updateOptions(options);
        }
    };
    exports.WorkbenchObjectTree = WorkbenchObjectTree;
    exports.WorkbenchObjectTree = WorkbenchObjectTree = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, exports.IListService),
        __param(8, configuration_1.IConfigurationService)
    ], WorkbenchObjectTree);
    let WorkbenchCompressibleObjectTree = class WorkbenchCompressibleObjectTree extends objectTree_1.CompressibleObjectTree {
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        constructor(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.disposables.add(this.internals);
        }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.internals.updateStyleOverrides(options.overrideStyles);
            }
            this.internals.updateOptions(options);
        }
    };
    exports.WorkbenchCompressibleObjectTree = WorkbenchCompressibleObjectTree;
    exports.WorkbenchCompressibleObjectTree = WorkbenchCompressibleObjectTree = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, exports.IListService),
        __param(8, configuration_1.IConfigurationService)
    ], WorkbenchCompressibleObjectTree);
    let WorkbenchDataTree = class WorkbenchDataTree extends dataTree_1.DataTree {
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        constructor(user, container, delegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, dataSource, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.disposables.add(this.internals);
        }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles !== undefined) {
                this.internals.updateStyleOverrides(options.overrideStyles);
            }
            this.internals.updateOptions(options);
        }
    };
    exports.WorkbenchDataTree = WorkbenchDataTree;
    exports.WorkbenchDataTree = WorkbenchDataTree = __decorate([
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, exports.IListService),
        __param(9, configuration_1.IConfigurationService)
    ], WorkbenchDataTree);
    let WorkbenchAsyncDataTree = class WorkbenchAsyncDataTree extends asyncDataTree_1.AsyncDataTree {
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        constructor(user, container, delegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, delegate, renderers, dataSource, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.disposables.add(this.internals);
        }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.internals.updateStyleOverrides(options.overrideStyles);
            }
            this.internals.updateOptions(options);
        }
    };
    exports.WorkbenchAsyncDataTree = WorkbenchAsyncDataTree;
    exports.WorkbenchAsyncDataTree = WorkbenchAsyncDataTree = __decorate([
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, exports.IListService),
        __param(9, configuration_1.IConfigurationService)
    ], WorkbenchAsyncDataTree);
    let WorkbenchCompressibleAsyncDataTree = class WorkbenchCompressibleAsyncDataTree extends asyncDataTree_1.CompressibleAsyncDataTree {
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        constructor(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
            const { options: treeOptions, getTypeNavigationMode, disposable } = instantiationService.invokeFunction(workbenchTreeDataPreamble, options);
            super(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getTypeNavigationMode, options.overrideStyles, contextKeyService, listService, configurationService);
            this.disposables.add(this.internals);
        }
        updateOptions(options) {
            super.updateOptions(options);
            this.internals.updateOptions(options);
        }
    };
    exports.WorkbenchCompressibleAsyncDataTree = WorkbenchCompressibleAsyncDataTree;
    exports.WorkbenchCompressibleAsyncDataTree = WorkbenchCompressibleAsyncDataTree = __decorate([
        __param(7, instantiation_1.IInstantiationService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, exports.IListService),
        __param(10, configuration_1.IConfigurationService)
    ], WorkbenchCompressibleAsyncDataTree);
    function getDefaultTreeFindMode(configurationService) {
        const value = configurationService.getValue(defaultFindModeSettingKey);
        if (value === 'highlight') {
            return abstractTree_1.TreeFindMode.Highlight;
        }
        else if (value === 'filter') {
            return abstractTree_1.TreeFindMode.Filter;
        }
        const deprecatedValue = configurationService.getValue(keyboardNavigationSettingKey);
        if (deprecatedValue === 'simple' || deprecatedValue === 'highlight') {
            return abstractTree_1.TreeFindMode.Highlight;
        }
        else if (deprecatedValue === 'filter') {
            return abstractTree_1.TreeFindMode.Filter;
        }
        return undefined;
    }
    function getDefaultTreeFindMatchType(configurationService) {
        const value = configurationService.getValue(defaultFindMatchTypeSettingKey);
        if (value === 'fuzzy') {
            return abstractTree_1.TreeFindMatchType.Fuzzy;
        }
        else if (value === 'contiguous') {
            return abstractTree_1.TreeFindMatchType.Contiguous;
        }
        return undefined;
    }
    function workbenchTreeDataPreamble(accessor, options) {
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const contextViewService = accessor.get(contextView_1.IContextViewService);
        const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const getTypeNavigationMode = () => {
            // give priority to the context key value to specify a value
            const modeString = contextKeyService.getContextKeyValue(WorkbenchListTypeNavigationModeKey);
            if (modeString === 'automatic') {
                return listWidget_1.TypeNavigationMode.Automatic;
            }
            else if (modeString === 'trigger') {
                return listWidget_1.TypeNavigationMode.Trigger;
            }
            // also check the deprecated context key to set the mode to 'trigger'
            const modeBoolean = contextKeyService.getContextKeyValue(WorkbenchListAutomaticKeyboardNavigationLegacyKey);
            if (modeBoolean === false) {
                return listWidget_1.TypeNavigationMode.Trigger;
            }
            // finally, check the setting
            const configString = configurationService.getValue(typeNavigationModeSettingKey);
            if (configString === 'automatic') {
                return listWidget_1.TypeNavigationMode.Automatic;
            }
            else if (configString === 'trigger') {
                return listWidget_1.TypeNavigationMode.Trigger;
            }
            return undefined;
        };
        const horizontalScrolling = options.horizontalScrolling !== undefined ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
        const [workbenchListOptions, disposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
        const paddingBottom = options.paddingBottom;
        const renderIndentGuides = options.renderIndentGuides !== undefined ? options.renderIndentGuides : configurationService.getValue(treeRenderIndentGuidesKey);
        return {
            getTypeNavigationMode,
            disposable,
            options: {
                // ...options, // TODO@Joao why is this not splatted here?
                keyboardSupport: false,
                ...workbenchListOptions,
                indent: typeof configurationService.getValue(treeIndentKey) === 'number' ? configurationService.getValue(treeIndentKey) : undefined,
                renderIndentGuides,
                smoothScrolling: Boolean(configurationService.getValue(listSmoothScrolling)),
                defaultFindMode: getDefaultTreeFindMode(configurationService),
                defaultFindMatchType: getDefaultTreeFindMatchType(configurationService),
                horizontalScrolling,
                scrollByPage: Boolean(configurationService.getValue(scrollByPageKey)),
                paddingBottom: paddingBottom,
                hideTwistiesOfChildlessElements: options.hideTwistiesOfChildlessElements,
                expandOnlyOnTwistieClick: options.expandOnlyOnTwistieClick ?? (configurationService.getValue(treeExpandMode) === 'doubleClick'),
                contextViewProvider: contextViewService,
                findWidgetStyles: defaultStyles_1.defaultFindWidgetStyles,
                enableStickyScroll: Boolean(configurationService.getValue(treeStickyScroll)),
                stickyScrollMaxItemCount: Number(configurationService.getValue(treeStickyScrollMaxElements)),
            }
        };
    }
    let WorkbenchTreeInternals = class WorkbenchTreeInternals {
        get onDidOpen() { return this.navigator.onDidOpen; }
        constructor(tree, options, getTypeNavigationMode, overrideStyles, contextKeyService, listService, configurationService) {
            this.tree = tree;
            this.disposables = [];
            this.contextKeyService = createScopedContextKeyService(contextKeyService, tree);
            this.disposables.push(createScrollObserver(this.contextKeyService, tree));
            this.listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            this.listSupportsMultiSelect.set(options.multipleSelectionSupport !== false);
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.listSupportFindWidget = exports.WorkbenchListSupportsFind.bindTo(this.contextKeyService);
            this.listSupportFindWidget.set(options.findWidgetEnabled ?? true);
            this.hasSelectionOrFocus = exports.WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
            this.hasDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
            this.hasMultiSelection = exports.WorkbenchListMultiSelection.bindTo(this.contextKeyService);
            this.treeElementCanCollapse = exports.WorkbenchTreeElementCanCollapse.bindTo(this.contextKeyService);
            this.treeElementHasParent = exports.WorkbenchTreeElementHasParent.bindTo(this.contextKeyService);
            this.treeElementCanExpand = exports.WorkbenchTreeElementCanExpand.bindTo(this.contextKeyService);
            this.treeElementHasChild = exports.WorkbenchTreeElementHasChild.bindTo(this.contextKeyService);
            this.treeFindOpen = exports.WorkbenchTreeFindOpen.bindTo(this.contextKeyService);
            this.treeStickyScrollFocused = exports.WorkbenchTreeStickyScrollFocused.bindTo(this.contextKeyService);
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.updateStyleOverrides(overrideStyles);
            const updateCollapseContextKeys = () => {
                const focus = tree.getFocus()[0];
                if (!focus) {
                    return;
                }
                const node = tree.getNode(focus);
                this.treeElementCanCollapse.set(node.collapsible && !node.collapsed);
                this.treeElementHasParent.set(!!tree.getParentElement(focus));
                this.treeElementCanExpand.set(node.collapsible && node.collapsed);
                this.treeElementHasChild.set(!!tree.getFirstElementChild(focus));
            };
            const interestingContextKeys = new Set();
            interestingContextKeys.add(WorkbenchListTypeNavigationModeKey);
            interestingContextKeys.add(WorkbenchListAutomaticKeyboardNavigationLegacyKey);
            this.disposables.push(this.contextKeyService, listService.register(tree), tree.onDidChangeSelection(() => {
                const selection = tree.getSelection();
                const focus = tree.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.hasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                    this.hasMultiSelection.set(selection.length > 1);
                    this.hasDoubleSelection.set(selection.length === 2);
                });
            }), tree.onDidChangeFocus(() => {
                const selection = tree.getSelection();
                const focus = tree.getFocus();
                this.hasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                updateCollapseContextKeys();
            }), tree.onDidChangeCollapseState(updateCollapseContextKeys), tree.onDidChangeModel(updateCollapseContextKeys), tree.onDidChangeFindOpenState(enabled => this.treeFindOpen.set(enabled)), tree.onDidChangeStickyScrollFocused(focused => this.treeStickyScrollFocused.set(focused)), configurationService.onDidChangeConfiguration(e => {
                let newOptions = {};
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                if (e.affectsConfiguration(treeIndentKey)) {
                    const indent = configurationService.getValue(treeIndentKey);
                    newOptions = { ...newOptions, indent };
                }
                if (e.affectsConfiguration(treeRenderIndentGuidesKey) && options.renderIndentGuides === undefined) {
                    const renderIndentGuides = configurationService.getValue(treeRenderIndentGuidesKey);
                    newOptions = { ...newOptions, renderIndentGuides };
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = Boolean(configurationService.getValue(listSmoothScrolling));
                    newOptions = { ...newOptions, smoothScrolling };
                }
                if (e.affectsConfiguration(defaultFindModeSettingKey) || e.affectsConfiguration(keyboardNavigationSettingKey)) {
                    const defaultFindMode = getDefaultTreeFindMode(configurationService);
                    newOptions = { ...newOptions, defaultFindMode };
                }
                if (e.affectsConfiguration(typeNavigationModeSettingKey) || e.affectsConfiguration(keyboardNavigationSettingKey)) {
                    const typeNavigationMode = getTypeNavigationMode();
                    newOptions = { ...newOptions, typeNavigationMode };
                }
                if (e.affectsConfiguration(defaultFindMatchTypeSettingKey)) {
                    const defaultFindMatchType = getDefaultTreeFindMatchType(configurationService);
                    newOptions = { ...newOptions, defaultFindMatchType };
                }
                if (e.affectsConfiguration(horizontalScrollingKey) && options.horizontalScrolling === undefined) {
                    const horizontalScrolling = Boolean(configurationService.getValue(horizontalScrollingKey));
                    newOptions = { ...newOptions, horizontalScrolling };
                }
                if (e.affectsConfiguration(scrollByPageKey)) {
                    const scrollByPage = Boolean(configurationService.getValue(scrollByPageKey));
                    newOptions = { ...newOptions, scrollByPage };
                }
                if (e.affectsConfiguration(treeExpandMode) && options.expandOnlyOnTwistieClick === undefined) {
                    newOptions = { ...newOptions, expandOnlyOnTwistieClick: configurationService.getValue(treeExpandMode) === 'doubleClick' };
                }
                if (e.affectsConfiguration(treeStickyScroll)) {
                    const enableStickyScroll = configurationService.getValue(treeStickyScroll);
                    newOptions = { ...newOptions, enableStickyScroll };
                }
                if (e.affectsConfiguration(treeStickyScrollMaxElements)) {
                    const stickyScrollMaxItemCount = Math.max(1, configurationService.getValue(treeStickyScrollMaxElements));
                    newOptions = { ...newOptions, stickyScrollMaxItemCount };
                }
                if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
                    const mouseWheelScrollSensitivity = configurationService.getValue(mouseWheelScrollSensitivityKey);
                    newOptions = { ...newOptions, mouseWheelScrollSensitivity };
                }
                if (e.affectsConfiguration(fastScrollSensitivityKey)) {
                    const fastScrollSensitivity = configurationService.getValue(fastScrollSensitivityKey);
                    newOptions = { ...newOptions, fastScrollSensitivity };
                }
                if (Object.keys(newOptions).length > 0) {
                    tree.updateOptions(newOptions);
                }
            }), this.contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(interestingContextKeys)) {
                    tree.updateOptions({ typeNavigationMode: getTypeNavigationMode() });
                }
            }));
            this.navigator = new TreeResourceNavigator(tree, { configurationService, ...options });
            this.disposables.push(this.navigator);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
        updateOptions(options) {
            if (options.multipleSelectionSupport !== undefined) {
                this.listSupportsMultiSelect.set(!!options.multipleSelectionSupport);
            }
        }
        updateStyleOverrides(overrideStyles) {
            this.tree.style(overrideStyles ? (0, defaultStyles_1.getListStyles)(overrideStyles) : defaultStyles_1.defaultListStyles);
        }
        dispose() {
            this.disposables = (0, lifecycle_1.dispose)(this.disposables);
        }
    };
    WorkbenchTreeInternals = __decorate([
        __param(4, contextkey_1.IContextKeyService),
        __param(5, exports.IListService),
        __param(6, configuration_1.IConfigurationService)
    ], WorkbenchTreeInternals);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'workbench',
        order: 7,
        title: (0, nls_1.localize)('workbenchConfigurationTitle', "Workbench"),
        type: 'object',
        properties: {
            [multiSelectModifierSettingKey]: {
                type: 'string',
                enum: ['ctrlCmd', 'alt'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)('multiSelectModifier.ctrlCmd', "Maps to `Control` on Windows and Linux and to `Command` on macOS."),
                    (0, nls_1.localize)('multiSelectModifier.alt', "Maps to `Alt` on Windows and Linux and to `Option` on macOS.")
                ],
                default: 'ctrlCmd',
                description: (0, nls_1.localize)({
                    key: 'multiSelectModifier',
                    comment: [
                        '- `ctrlCmd` refers to a value the setting can take and should not be localized.',
                        '- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized.'
                    ]
                }, "The modifier to be used to add an item in trees and lists to a multi-selection with the mouse (for example in the explorer, open editors and scm view). The 'Open to Side' mouse gestures - if supported - will adapt such that they do not conflict with the multiselect modifier.")
            },
            [openModeSettingKey]: {
                type: 'string',
                enum: ['singleClick', 'doubleClick'],
                default: 'singleClick',
                description: (0, nls_1.localize)({
                    key: 'openModeModifier',
                    comment: ['`singleClick` and `doubleClick` refers to a value the setting can take and should not be localized.']
                }, "Controls how to open items in trees and lists using the mouse (if supported). Note that some trees and lists might choose to ignore this setting if it is not applicable.")
            },
            [horizontalScrollingKey]: {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)('horizontalScrolling setting', "Controls whether lists and trees support horizontal scrolling in the workbench. Warning: turning on this setting has a performance implication.")
            },
            [scrollByPageKey]: {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)('list.scrollByPage', "Controls whether clicks in the scrollbar scroll page by page.")
            },
            [treeIndentKey]: {
                type: 'number',
                default: 8,
                minimum: 4,
                maximum: 40,
                description: (0, nls_1.localize)('tree indent setting', "Controls tree indentation in pixels.")
            },
            [treeRenderIndentGuidesKey]: {
                type: 'string',
                enum: ['none', 'onHover', 'always'],
                default: 'onHover',
                description: (0, nls_1.localize)('render tree indent guides', "Controls whether the tree should render indent guides.")
            },
            [listSmoothScrolling]: {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)('list smoothScrolling setting', "Controls whether lists and trees have smooth scrolling."),
            },
            [mouseWheelScrollSensitivityKey]: {
                type: 'number',
                default: 1,
                markdownDescription: (0, nls_1.localize)('Mouse Wheel Scroll Sensitivity', "A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events.")
            },
            [fastScrollSensitivityKey]: {
                type: 'number',
                default: 5,
                markdownDescription: (0, nls_1.localize)('Fast Scroll Sensitivity', "Scrolling speed multiplier when pressing `Alt`.")
            },
            [defaultFindModeSettingKey]: {
                type: 'string',
                enum: ['highlight', 'filter'],
                enumDescriptions: [
                    (0, nls_1.localize)('defaultFindModeSettingKey.highlight', "Highlight elements when searching. Further up and down navigation will traverse only the highlighted elements."),
                    (0, nls_1.localize)('defaultFindModeSettingKey.filter', "Filter elements when searching.")
                ],
                default: 'highlight',
                description: (0, nls_1.localize)('defaultFindModeSettingKey', "Controls the default find mode for lists and trees in the workbench.")
            },
            [keyboardNavigationSettingKey]: {
                type: 'string',
                enum: ['simple', 'highlight', 'filter'],
                enumDescriptions: [
                    (0, nls_1.localize)('keyboardNavigationSettingKey.simple', "Simple keyboard navigation focuses elements which match the keyboard input. Matching is done only on prefixes."),
                    (0, nls_1.localize)('keyboardNavigationSettingKey.highlight', "Highlight keyboard navigation highlights elements which match the keyboard input. Further up and down navigation will traverse only the highlighted elements."),
                    (0, nls_1.localize)('keyboardNavigationSettingKey.filter', "Filter keyboard navigation will filter out and hide all the elements which do not match the keyboard input.")
                ],
                default: 'highlight',
                description: (0, nls_1.localize)('keyboardNavigationSettingKey', "Controls the keyboard navigation style for lists and trees in the workbench. Can be simple, highlight and filter."),
                deprecated: true,
                deprecationMessage: (0, nls_1.localize)('keyboardNavigationSettingKeyDeprecated', "Please use 'workbench.list.defaultFindMode' and	'workbench.list.typeNavigationMode' instead.")
            },
            [defaultFindMatchTypeSettingKey]: {
                type: 'string',
                enum: ['fuzzy', 'contiguous'],
                enumDescriptions: [
                    (0, nls_1.localize)('defaultFindMatchTypeSettingKey.fuzzy', "Use fuzzy matching when searching."),
                    (0, nls_1.localize)('defaultFindMatchTypeSettingKey.contiguous', "Use contiguous matching when searching.")
                ],
                default: 'fuzzy',
                description: (0, nls_1.localize)('defaultFindMatchTypeSettingKey', "Controls the type of matching used when searching lists and trees in the workbench.")
            },
            [treeExpandMode]: {
                type: 'string',
                enum: ['singleClick', 'doubleClick'],
                default: 'singleClick',
                description: (0, nls_1.localize)('expand mode', "Controls how tree folders are expanded when clicking the folder names. Note that some trees and lists might choose to ignore this setting if it is not applicable."),
            },
            [treeStickyScroll]: {
                type: 'boolean',
                default: typeof product_1.default.quality === 'string' && product_1.default.quality !== 'stable', // only enable as default in insiders
                description: (0, nls_1.localize)('sticky scroll', "Controls whether sticky scrolling is enabled in trees."),
            },
            [treeStickyScrollMaxElements]: {
                type: 'number',
                minimum: 1,
                default: 7,
                markdownDescription: (0, nls_1.localize)('sticky scroll maximum items', "Controls the number of sticky elements displayed in the tree when `#workbench.tree.enableStickyScroll#` is enabled."),
            },
            [typeNavigationModeSettingKey]: {
                type: 'string',
                enum: ['automatic', 'trigger'],
                default: 'automatic',
                markdownDescription: (0, nls_1.localize)('typeNavigationMode2', "Controls how type navigation works in lists and trees in the workbench. When set to `trigger`, type navigation begins once the `list.triggerTypeNavigation` command is run."),
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2xpc3QvYnJvd3Nlci9saXN0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQ25GLFFBQUEsWUFBWSxHQUFHLElBQUEsK0JBQWUsRUFBZSxhQUFhLENBQUMsQ0FBQztJQWlCekUsTUFBYSxXQUFXO1FBU3ZCLElBQUksZUFBZTtZQUNsQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNoQyxDQUFDO1FBRUQ7WUFUaUIsZ0JBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUM3QyxVQUFLLEdBQXNCLEVBQUUsQ0FBQztZQUM5Qix1QkFBa0IsR0FBb0MsU0FBUyxDQUFDO1lBQ2hFLCtCQUEwQixHQUFZLEtBQUssQ0FBQztRQU1wQyxDQUFDO1FBRVQsa0JBQWtCLENBQUMsTUFBdUM7WUFDakUsSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3hDLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQztZQUNqQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsUUFBUSxDQUFDLE1BQTJCLEVBQUUsZ0JBQTJDO1lBQ2hGLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQztnQkFDdkMsbUVBQW1FO2dCQUNuRSxN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