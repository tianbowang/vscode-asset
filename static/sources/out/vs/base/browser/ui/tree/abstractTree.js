/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/findinput/findInput", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/list/listView", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/tree/indexTreeModel", "vs/base/browser/ui/tree/tree", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/map", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/types", "vs/nls", "vs/css!./media/tree"], function (require, exports, dom_1, event_1, keyboardEvent_1, actionbar_1, findInput_1, inputBox_1, listView_1, listWidget_1, toggle_1, indexTreeModel_1, tree_1, actions_1, arrays_1, async_1, codicons_1, themables_1, map_1, event_2, filters_1, lifecycle_1, numbers_1, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractTree = exports.AbstractTreePart = exports.TreeFindMatchType = exports.TreeFindMode = exports.FuzzyToggle = exports.ModeToggle = exports.TreeRenderer = exports.RenderIndentGuides = exports.AbstractTreeViewState = exports.ComposedTreeDelegate = void 0;
    class TreeElementsDragAndDropData extends listView_1.ElementsDragAndDropData {
        set context(context) {
            this.data.context = context;
        }
        get context() {
            return this.data.context;
        }
        constructor(data) {
            super(data.elements.map(node => node.element));
            this.data = data;
        }
    }
    function asTreeDragAndDropData(data) {
        if (data instanceof listView_1.ElementsDragAndDropData) {
            return new TreeElementsDragAndDropData(data);
        }
        return data;
    }
    class TreeNodeListDragAndDrop {
        constructor(modelProvider, dnd) {
            this.modelProvider = modelProvider;
            this.dnd = dnd;
            this.autoExpandDisposable = lifecycle_1.Disposable.None;
            this.disposables = new lifecycle_1.DisposableStore();
        }
        getDragURI(node) {
            return this.dnd.getDragURI(node.element);
        }
        getDragLabel(nodes, originalEvent) {
            if (this.dnd.getDragLabel) {
                return this.dnd.getDragLabel(nodes.map(node => node.element), originalEvent);
            }
            return undefined;
        }
        onDragStart(data, originalEvent) {
            this.dnd.onDragStart?.(asTreeDragAndDropData(data), originalEvent);
        }
        onDragOver(data, targetNode, targetIndex, targetSector, originalEvent, raw = true) {
            const result = this.dnd.onDragOver(asTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, targetSector, originalEvent);
            const didChangeAutoExpandNode = this.autoExpandNode !== targetNode;
            if (didChangeAutoExpandNode) {
                this.autoExpandDisposable.dispose();
                this.autoExpandNode = targetNode;
            }
            if (typeof targetNode === 'undefined') {
                return result;
            }
            if (didChangeAutoExpandNode && typeof result !== 'boolean' && result.autoExpand) {
                this.autoExpandDisposable = (0, async_1.disposableTimeout)(() => {
                    const model = this.modelProvider();
                    const ref = model.getNodeLocation(targetNode);
                    if (model.isCollapsed(ref)) {
                        model.setCollapsed(ref, false);
                    }
                    this.autoExpandNode = undefined;
                }, 500, this.disposables);
            }
            if (typeof result === 'boolean' || !result.accept || typeof result.bubble === 'undefined' || result.feedback) {
                if (!raw) {
                    const accept = typeof result === 'boolean' ? result : result.accept;
                    const effect = typeof result === 'boolean' ? undefined : result.effect;
                    return { accept, effect, feedback: [targetIndex] };
                }
                return result;
            }
            if (result.bubble === 1 /* TreeDragOverBubble.Up */) {
                const model = this.modelProvider();
                const ref = model.getNodeLocation(targetNode);
                const parentRef = model.getParentNodeLocation(ref);
                const parentNode = model.getNode(parentRef);
                const parentIndex = parentRef && model.getListIndex(parentRef);
                return this.onDragOver(data, parentNode, parentIndex, targetSector, originalEvent, false);
            }
            const model = this.modelProvider();
            const ref = model.getNodeLocation(targetNode);
            const start = model.getListIndex(ref);
            const length = model.getListRenderCount(ref);
            return { ...result, feedback: (0, arrays_1.range)(start, start + length) };
        }
        drop(data, targetNode, targetIndex, targetSector, originalEvent) {
            this.autoExpandDisposable.dispose();
            this.autoExpandNode = undefined;
            this.dnd.drop(asTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, targetSector, originalEvent);
        }
        onDragEnd(originalEvent) {
            this.dnd.onDragEnd?.(originalEvent);
        }
        dispose() {
            this.disposables.dispose();
            this.dnd.dispose();
        }
    }
    function asListOptions(modelProvider, options) {
        return options && {
            ...options,
            identityProvider: options.identityProvider && {
                getId(el) {
                    return options.identityProvider.getId(el.element);
                }
            },
            dnd: options.dnd && new TreeNodeListDragAndDrop(modelProvider, options.dnd),
            multipleSelectionController: options.multipleSelectionController && {
                isSelectionSingleChangeEvent(e) {
                    return options.multipleSelectionController.isSelectionSingleChangeEvent({ ...e, element: e.element });
                },
                isSelectionRangeChangeEvent(e) {
                    return options.multipleSelectionController.isSelectionRangeChangeEvent({ ...e, element: e.element });
                }
            },
            accessibilityProvider: options.accessibilityProvider && {
                ...options.accessibilityProvider,
                getSetSize(node) {
                    const model = modelProvider();
                    const ref = model.getNodeLocation(node);
                    const parentRef = model.getParentNodeLocation(ref);
                    const parentNode = model.getNode(parentRef);
                    return parentNode.visibleChildrenCount;
                },
                getPosInSet(node) {
                    return node.visibleChildIndex + 1;
                },
                isChecked: options.accessibilityProvider && options.accessibilityProvider.isChecked ? (node) => {
                    return options.accessibilityProvider.isChecked(node.element);
                } : undefined,
                getRole: options.accessibilityProvider && options.accessibilityProvider.getRole ? (node) => {
                    return options.accessibilityProvider.getRole(node.element);
                } : () => 'treeitem',
                getAriaLabel(e) {
                    return options.accessibilityProvider.getAriaLabel(e.element);
                },
                getWidgetAriaLabel() {
                    return options.accessibilityProvider.getWidgetAriaLabel();
                },
                getWidgetRole: options.accessibilityProvider && options.accessibilityProvider.getWidgetRole ? () => options.accessibilityProvider.getWidgetRole() : () => 'tree',
                getAriaLevel: options.accessibilityProvider && options.accessibilityProvider.getAriaLevel ? (node) => options.accessibilityProvider.getAriaLevel(node.element) : (node) => {
                    return node.depth;
                },
                getActiveDescendantId: options.accessibilityProvider.getActiveDescendantId && (node => {
                    return options.accessibilityProvider.getActiveDescendantId(node.element);
                })
            },
            keyboardNavigationLabelProvider: options.keyboardNavigationLabelProvider && {
                ...options.keyboardNavigationLabelProvider,
                getKeyboardNavigationLabel(node) {
                    return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(node.element);
                }
            }
        };
    }
    class ComposedTreeDelegate {
        constructor(delegate) {
            this.delegate = delegate;
        }
        getHeight(element) {
            return this.delegate.getHeight(element.element);
        }
        getTemplateId(element) {
            return this.delegate.getTemplateId(element.element);
        }
        hasDynamicHeight(element) {
            return !!this.delegate.hasDynamicHeight && this.delegate.hasDynamicHeight(element.element);
        }
        setDynamicHeight(element, height) {
            this.delegate.setDynamicHeight?.(element.element, height);
        }
    }
    exports.ComposedTreeDelegate = ComposedTreeDelegate;
    class AbstractTreeViewState {
        static lift(state) {
            return state instanceof AbstractTreeViewState ? state : new AbstractTreeViewState(state);
        }
        static empty(scrollTop = 0) {
            return new AbstractTreeViewState({
                focus: [],
                selection: [],
                expanded: Object.create(null),
                scrollTop,
            });
        }
        constructor(state) {
            this.focus = new Set(state.focus);
            this.selection = new Set(state.selection);
            if (state.expanded instanceof Array) { // old format
                this.expanded = Object.create(null);
                for (const id of state.expanded) {
                    this.expanded[id] = 1;
                }
            }
            else {
                this.expanded = state.expanded;
            }
            this.expanded = state.expanded;
            this.scrollTop = state.scrollTop;
        }
        toJSON() {
            return {
                focus: Array.from(this.focus),
                selection: Array.from(this.selection),
                expanded: this.expanded,
                scrollTop: this.scrollTop,
            };
        }
    }
    exports.AbstractTreeViewState = AbstractTreeViewState;
    var RenderIndentGuides;
    (function (RenderIndentGuides) {
        RenderIndentGuides["None"] = "none";
        RenderIndentGuides["OnHover"] = "onHover";
        RenderIndentGuides["Always"] = "always";
    })(RenderIndentGuides || (exports.RenderIndentGuides = RenderIndentGuides = {}));
    class EventCollection {
        get elements() {
            return this._elements;
        }
        constructor(onDidChange, _elements = []) {
            this._elements = _elements;
            this.disposables = new lifecycle_1.DisposableStore();
            this.onDidChange = event_2.Event.forEach(onDidChange, elements => this._elements = elements, this.disposables);
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    class TreeRenderer {
        static { this.DefaultIndent = 8; }
        constructor(renderer, modelProvider, onDidChangeCollapseState, activeNodes, renderedIndentGuides, options = {}) {
            this.renderer = renderer;
            this.modelProvider = modelProvider;
            this.activeNodes = activeNodes;
            this.renderedIndentGuides = renderedIndentGuides;
            this.renderedElements = new Map();
            this.renderedNodes = new Map();
            this.indent = TreeRenderer.DefaultIndent;
            this.hideTwistiesOfChildlessElements = false;
            this.shouldRenderIndentGuides = false;
            this.activeIndentNodes = new Set();
            this.indentGuidesDisposable = lifecycle_1.Disposable.None;
            this.disposables = new lifecycle_1.DisposableStore();
            this.templateId = renderer.templateId;
            this.updateOptions(options);
            event_2.Event.map(onDidChangeCollapseState, e => e.node)(this.onDidChangeNodeTwistieState, this, this.disposables);
            renderer.onDidChangeTwistieState?.(this.onDidChangeTwistieState, this, this.disposables);
        }
        updateOptions(options = {}) {
            if (typeof options.indent !== 'undefined') {
                const indent = (0, numbers_1.clamp)(options.indent, 0, 40);
                if (indent !== this.indent) {
                    this.indent = indent;
                    for (const [node, templateData] of this.renderedNodes) {
                        this.renderTreeElement(node, templateData);
                    }
                }
            }
            if (typeof options.renderIndentGuides !== 'undefined') {
                const shouldRenderIndentGuides = options.renderIndentGuides !== RenderIndentGuides.None;
                if (shouldRenderIndentGuides !== this.shouldRenderIndentGuides) {
                    this.shouldRenderIndentGuides = shouldRenderIndentGuides;
                    for (const [node, templateData] of this.renderedNodes) {
                        this._renderIndentGuides(node, templateData);
                    }
                    this.indentGuidesDisposable.dispose();
                    if (shouldRenderIndentGuides) {
                        const disposables = new lifecycle_1.DisposableStore();
                        this.activeNodes.onDidChange(this._onDidChangeActiveNodes, this, disposables);
                        this.indentGuidesDisposable = disposables;
                        this._onDidChangeActiveNodes(this.activeNodes.elements);
                    }
                }
            }
            if (typeof options.hideTwistiesOfChildlessElements !== 'undefined') {
                this.hideTwistiesOfChildlessElements = options.hideTwistiesOfChildlessElements;
            }
        }
        renderTemplate(container) {
            const el = (0, dom_1.append)(container, (0, dom_1.$)('.monaco-tl-row'));
            const indent = (0, dom_1.append)(el, (0, dom_1.$)('.monaco-tl-indent'));
            const twistie = (0, dom_1.append)(el, (0, dom_1.$)('.monaco-tl-twistie'));
            const contents = (0, dom_1.append)(el, (0, dom_1.$)('.monaco-tl-contents'));
            const templateData = this.renderer.renderTemplate(contents);
            return { container, indent, twistie, indentGuidesDisposable: lifecycle_1.Disposable.None, templateData };
        }
        renderElement(node, index, templateData, height) {
            this.renderedNodes.set(node, templateData);
            this.renderedElements.set(node.element, node);
            this.renderTreeElement(node, templateData);
            this.renderer.renderElement(node, index, templateData.templateData, height);
        }
        disposeElement(node, index, templateData, height) {
            templateData.indentGuidesDisposable.dispose();
            this.renderer.disposeElement?.(node, index, templateData.templateData, height);
            if (typeof height === 'number') {
                this.renderedNodes.delete(node);
                this.renderedElements.delete(node.element);
            }
        }
        disposeTemplate(templateData) {
            this.renderer.disposeTemplate(templateData.templateData);
        }
        onDidChangeTwistieState(element) {
            const node = this.renderedElements.get(element);
            if (!node) {
                return;
            }
            this.onDidChangeNodeTwistieState(node);
        }
        onDidChangeNodeTwistieState(node) {
            const templateData = this.renderedNodes.get(node);
            if (!templateData) {
                return;
            }
            this._onDidChangeActiveNodes(this.activeNodes.elements);
            this.renderTreeElement(node, templateData);
        }
        renderTreeElement(node, templateData) {
            const indent = TreeRenderer.DefaultIndent + (node.depth - 1) * this.indent;
            templateData.twistie.style.paddingLeft = `${indent}px`;
            templateData.indent.style.width = `${indent + this.indent - 16}px`;
            if (node.collapsible) {
                templateData.container.setAttribute('aria-expanded', String(!node.collapsed));
            }
            else {
                templateData.container.removeAttribute('aria-expanded');
            }
            templateData.twistie.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.treeItemExpanded));
            let twistieRendered = false;
            if (this.renderer.renderTwistie) {
                twistieRendered = this.renderer.renderTwistie(node.element, templateData.twistie);
            }
            if (node.collapsible && (!this.hideTwistiesOfChildlessElements || node.visibleChildrenCount > 0)) {
                if (!twistieRendered) {
                    templateData.twistie.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.treeItemExpanded));
                }
                templateData.twistie.classList.add('collapsible');
                templateData.twistie.classList.toggle('collapsed', node.collapsed);
            }
            else {
                templateData.twistie.classList.remove('collapsible', 'collapsed');
            }
            this._renderIndentGuides(node, templateData);
        }
        _renderIndentGuides(node, templateData) {
            (0, dom_1.clearNode)(templateData.indent);
            templateData.indentGuidesDisposable.dispose();
            if (!this.shouldRenderIndentGuides) {
                return;
            }
            const disposableStore = new lifecycle_1.DisposableStore();
            const model = this.modelProvider();
            while (true) {
                const ref = model.getNodeLocation(node);
                const parentRef = model.getParentNodeLocation(ref);
                if (!parentRef) {
                    break;
                }
                const parent = model.getNode(parentRef);
                const guide = (0, dom_1.$)('.indent-guide', { style: `width: ${this.indent}px` });
                if (this.activeIndentNodes.has(parent)) {
                    guide.classList.add('active');
                }
                if (templateData.indent.childElementCount === 0) {
                    templateData.indent.appendChild(guide);
                }
                else {
                    templateData.indent.insertBefore(guide, templateData.indent.firstElementChild);
                }
                this.renderedIndentGuides.add(parent, guide);
                disposableStore.add((0, lifecycle_1.toDisposable)(() => this.renderedIndentGuides.delete(parent, guide)));
                node = parent;
            }
            templateData.indentGuidesDisposable = disposableStore;
        }
        _onDidChangeActiveNodes(nodes) {
            if (!this.shouldRenderIndentGuides) {
                return;
            }
            const set = new Set();
            const model = this.modelProvider();
            nodes.forEach(node => {
                const ref = model.getNodeLocation(node);
                try {
                    const parentRef = model.getParentNodeLocation(ref);
                    if (node.collapsible && node.children.length > 0 && !node.collapsed) {
                        set.add(node);
                    }
                    else if (parentRef) {
                        set.add(model.getNode(parentRef));
                    }
                }
                catch {
                    // noop
                }
            });
            this.activeIndentNodes.forEach(node => {
                if (!set.has(node)) {
                    this.renderedIndentGuides.forEach(node, line => line.classList.remove('active'));
                }
            });
            set.forEach(node => {
                if (!this.activeIndentNodes.has(node)) {
                    this.renderedIndentGuides.forEach(node, line => line.classList.add('active'));
                }
            });
            this.activeIndentNodes = set;
        }
        dispose() {
            this.renderedNodes.clear();
            this.renderedElements.clear();
            this.indentGuidesDisposable.dispose();
            (0, lifecycle_1.dispose)(this.disposables);
        }
    }
    exports.TreeRenderer = TreeRenderer;
    class FindFilter {
        get totalCount() { return this._totalCount; }
        get matchCount() { return this._matchCount; }
        set pattern(pattern) {
            this._pattern = pattern;
            this._lowercasePattern = pattern.toLowerCase();
        }
        constructor(tree, keyboardNavigationLabelProvider, _filter) {
            this.tree = tree;
            this.keyboardNavigationLabelProvider = keyboardNavigationLabelProvider;
            this._filter = _filter;
            this._totalCount = 0;
            this._matchCount = 0;
            this._pattern = '';
            this._lowercasePattern = '';
            this.disposables = new lifecycle_1.DisposableStore();
            tree.onWillRefilter(this.reset, this, this.disposables);
        }
        filter(element, parentVisibility) {
            let visibility = 1 /* TreeVisibility.Visible */;
            if (this._filter) {
                const result = this._filter.filter(element, parentVisibility);
                if (typeof result === 'boolean') {
                    visibility = result ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */;
                }
                else if ((0, indexTreeModel_1.isFilterResult)(result)) {
                    visibility = (0, indexTreeModel_1.getVisibleState)(result.visibility);
                }
                else {
                    visibility = result;
                }
                if (visibility === 0 /* TreeVisibility.Hidden */) {
                    return false;
                }
            }
            this._totalCount++;
            if (!this._pattern) {
                this._matchCount++;
                return { data: filters_1.FuzzyScore.Default, visibility };
            }
            const label = this.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(element);
            const labels = Array.isArray(label) ? label : [label];
            for (const l of labels) {
                const labelStr = l && l.toString();
                if (typeof labelStr === 'undefined') {
                    return { data: filters_1.FuzzyScore.Default, visibility };
                }
                let score;
                if (this.tree.findMatchType === TreeFindMatchType.Contiguous) {
                    const index = labelStr.toLowerCase().indexOf(this._lowercasePattern);
                    if (index > -1) {
                        score = [Number.MAX_SAFE_INTEGER, 0];
                        for (let i = this._lowercasePattern.length; i > 0; i--) {
                            score.push(index + i - 1);
                        }
                    }
                }
                else {
                    score = (0, filters_1.fuzzyScore)(this._pattern, this._lowercasePattern, 0, labelStr, labelStr.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
                }
                if (score) {
                    this._matchCount++;
                    return labels.length === 1 ?
                        { data: score, visibility } :
                        { data: { label: labelStr, score: score }, visibility };
                }
            }
            if (this.tree.findMode === TreeFindMode.Filter) {
                if (typeof this.tree.options.defaultFindVisibility === 'number') {
                    return this.tree.options.defaultFindVisibility;
                }
                else if (this.tree.options.defaultFindVisibility) {
                    return this.tree.options.defaultFindVisibility(element);
                }
                else {
                    return 2 /* TreeVisibility.Recurse */;
                }
            }
            else {
                return { data: filters_1.FuzzyScore.Default, visibility };
            }
        }
        reset() {
            this._totalCount = 0;
            this._matchCount = 0;
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.disposables);
        }
    }
    class ModeToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                icon: codicons_1.Codicon.listFilter,
                title: (0, nls_1.localize)('filter', "Filter"),
                isChecked: opts.isChecked ?? false,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.ModeToggle = ModeToggle;
    class FuzzyToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                icon: codicons_1.Codicon.searchFuzzy,
                title: (0, nls_1.localize)('fuzzySearch', "Fuzzy Match"),
                isChecked: opts.isChecked ?? false,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.FuzzyToggle = FuzzyToggle;
    const unthemedFindWidgetStyles = {
        inputBoxStyles: inputBox_1.unthemedInboxStyles,
        toggleStyles: toggle_1.unthemedToggleStyles,
        listFilterWidgetBackground: undefined,
        listFilterWidgetNoMatchesOutline: undefined,
        listFilterWidgetOutline: undefined,
        listFilterWidgetShadow: undefined
    };
    var TreeFindMode;
    (function (TreeFindMode) {
        TreeFindMode[TreeFindMode["Highlight"] = 0] = "Highlight";
        TreeFindMode[TreeFindMode["Filter"] = 1] = "Filter";
    })(TreeFindMode || (exports.TreeFindMode = TreeFindMode = {}));
    var TreeFindMatchType;
    (function (TreeFindMatchType) {
        TreeFindMatchType[TreeFindMatchType["Fuzzy"] = 0] = "Fuzzy";
        TreeFindMatchType[TreeFindMatchType["Contiguous"] = 1] = "Contiguous";
    })(TreeFindMatchType || (exports.TreeFindMatchType = TreeFindMatchType = {}));
    class FindWidget extends lifecycle_1.Disposable {
        set mode(mode) {
            this.modeToggle.checked = mode === TreeFindMode.Filter;
            this.findInput.inputBox.setPlaceHolder(mode === TreeFindMode.Filter ? (0, nls_1.localize)('type to filter', "Type to filter") : (0, nls_1.localize)('type to search', "Type to search"));
        }
        set matchType(matchType) {
            this.matchTypeToggle.checked = matchType === TreeFindMatchType.Fuzzy;
        }
        get value() {
            return this.findInput.inputBox.value;
        }
        set value(value) {
            this.findInput.inputBox.value = value;
        }
        constructor(container, tree, contextViewProvider, mode, matchType, options) {
            super();
            this.tree = tree;
            this.elements = (0, dom_1.h)('.monaco-tree-type-filter', [
                (0, dom_1.h)('.monaco-tree-type-filter-grab.codicon.codicon-debug-gripper@grab', { tabIndex: 0 }),
                (0, dom_1.h)('.monaco-tree-type-filter-input@findInput'),
                (0, dom_1.h)('.monaco-tree-type-filter-actionbar@actionbar'),
            ]);
            this.width = 0;
            this.right = 0;
            this.top = 0;
            this._onDidDisable = new event_2.Emitter();
            this.onDidDisable = this._onDidDisable.event;
            container.appendChild(this.elements.root);
            this._register((0, lifecycle_1.toDisposable)(() => container.removeChild(this.elements.root)));
            const styles = options?.styles ?? unthemedFindWidgetStyles;
            if (styles.listFilterWidgetBackground) {
                this.elements.root.style.backgroundColor = styles.listFilterWidgetBackground;
            }
            if (styles.listFilterWidgetShadow) {
                this.elements.root.style.boxShadow = `0 0 8px 2px ${styles.listFilterWidgetShadow}`;
            }
            this.modeToggle = this._register(new ModeToggle({ ...styles.toggleStyles, isChecked: mode === TreeFindMode.Filter }));
            this.matchTypeToggle = this._register(new FuzzyToggle({ ...styles.toggleStyles, isChecked: matchType === TreeFindMatchType.Fuzzy }));
            this.onDidChangeMode = event_2.Event.map(this.modeToggle.onChange, () => this.modeToggle.checked ? TreeFindMode.Filter : TreeFindMode.Highlight, this._store);
            this.onDidChangeMatchType = event_2.Event.map(this.matchTypeToggle.onChange, () => this.matchTypeToggle.checked ? TreeFindMatchType.Fuzzy : TreeFindMatchType.Contiguous, this._store);
            this.findInput = this._register(new findInput_1.FindInput(this.elements.findInput, contextViewProvider, {
                label: (0, nls_1.localize)('type to search', "Type to search"),
                additionalToggles: [this.modeToggle, this.matchTypeToggle],
                showCommonFindToggles: false,
                inputBoxStyles: styles.inputBoxStyles,
                toggleStyles: styles.toggleStyles,
                history: options?.history
            }));
            this.actionbar = this._register(new actionbar_1.ActionBar(this.elements.actionbar));
            this.mode = mode;
            const emitter = this._register(new event_1.DomEmitter(this.findInput.inputBox.inputElement, 'keydown'));
            const onKeyDown = event_2.Event.chain(emitter.event, $ => $.map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
            this._register(onKeyDown((e) => {
                // Using equals() so we reserve modified keys for future use
                if (e.equals(3 /* KeyCode.Enter */)) {
                    // This is the only keyboard way to return to the tree from a history item that isn't the last one
                    e.preventDefault();
                    e.stopPropagation();
                    this.findInput.inputBox.addToHistory();
                    this.tree.domFocus();
                    return;
                }
                if (e.equals(18 /* KeyCode.DownArrow */)) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.findInput.inputBox.isAtLastInHistory() || this.findInput.inputBox.isNowhereInHistory()) {
                        // Retain original pre-history DownArrow behavior
                        this.findInput.inputBox.addToHistory();
                        this.tree.domFocus();
                    }
                    else {
                        // Downward through history
                        this.findInput.inputBox.showNextValue();
                    }
                    return;
                }
                if (e.equals(16 /* KeyCode.UpArrow */)) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Upward through history
                    this.findInput.inputBox.showPreviousValue();
                    return;
                }
            }));
            const closeAction = this._register(new actions_1.Action('close', (0, nls_1.localize)('close', "Close"), 'codicon codicon-close', true, () => this.dispose()));
            this.actionbar.push(closeAction, { icon: true, label: false });
            const onGrabMouseDown = this._register(new event_1.DomEmitter(this.elements.grab, 'mousedown'));
            this._register(onGrabMouseDown.event(e => {
                const disposables = new lifecycle_1.DisposableStore();
                const onWindowMouseMove = disposables.add(new event_1.DomEmitter((0, dom_1.getWindow)(e), 'mousemove'));
                const onWindowMouseUp = disposables.add(new event_1.DomEmitter((0, dom_1.getWindow)(e), 'mouseup'));
                const startRight = this.right;
                const startX = e.pageX;
                const startTop = this.top;
                const startY = e.pageY;
                this.elements.grab.classList.add('grabbing');
                const transition = this.elements.root.style.transition;
                this.elements.root.style.transition = 'unset';
                const update = (e) => {
                    const deltaX = e.pageX - startX;
                    this.right = startRight - deltaX;
                    const deltaY = e.pageY - startY;
                    this.top = startTop + deltaY;
                    this.layout();
                };
                disposables.add(onWindowMouseMove.event(update));
                disposables.add(onWindowMouseUp.event(e => {
                    update(e);
                    this.elements.grab.classList.remove('grabbing');
                    this.elements.root.style.transition = transition;
                    disposables.dispose();
                }));
            }));
            const onGrabKeyDown = event_2.Event.chain(this._register(new event_1.DomEmitter(this.elements.grab, 'keydown')).event, $ => $.map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
            this._register(onGrabKeyDown((e) => {
                let right;
                let top;
                if (e.keyCode === 15 /* KeyCode.LeftArrow */) {
                    right = Number.POSITIVE_INFINITY;
                }
                else if (e.keyCode === 17 /* KeyCode.RightArrow */) {
                    right = 0;
                }
                else if (e.keyCode === 10 /* KeyCode.Space */) {
                    right = this.right === 0 ? Number.POSITIVE_INFINITY : 0;
                }
                if (e.keyCode === 16 /* KeyCode.UpArrow */) {
                    top = 0;
                }
                else if (e.keyCode === 18 /* KeyCode.DownArrow */) {
                    top = Number.POSITIVE_INFINITY;
                }
                if (right !== undefined) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.right = right;
                    this.layout();
                }
                if (top !== undefined) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.top = top;
                    const transition = this.elements.root.style.transition;
                    this.elements.root.style.transition = 'unset';
                    this.layout();
                    setTimeout(() => {
                        this.elements.root.style.transition = transition;
                    }, 0);
                }
            }));
            this.onDidChangeValue = this.findInput.onDidChange;
        }
        getHistory() {
            return this.findInput.inputBox.getHistory();
        }
        focus() {
            this.findInput.focus();
        }
        select() {
            this.findInput.select();
            // Reposition to last in history
            this.findInput.inputBox.addToHistory(true);
        }
        layout(width = this.width) {
            this.width = width;
            this.right = (0, numbers_1.clamp)(this.right, 0, Math.max(0, width - 212));
            this.elements.root.style.right = `${this.right}px`;
            this.top = (0, numbers_1.clamp)(this.top, 0, 24);
            this.elements.root.style.top = `${this.top}px`;
        }
        showMessage(message) {
            this.findInput.showMessage(message);
        }
        clearMessage() {
            this.findInput.clearMessage();
        }
        async dispose() {
            this._onDidDisable.fire();
            this.elements.root.classList.add('disabled');
            await (0, async_1.timeout)(300);
            super.dispose();
        }
    }
    class FindController {
        get pattern() { return this._pattern; }
        get mode() { return this._mode; }
        set mode(mode) {
            if (mode === this._mode) {
                return;
            }
            this._mode = mode;
            if (this.widget) {
                this.widget.mode = this._mode;
            }
            this.tree.refilter();
            this.render();
            this._onDidChangeMode.fire(mode);
        }
        get matchType() { return this._matchType; }
        set matchType(matchType) {
            if (matchType === this._matchType) {
                return;
            }
            this._matchType = matchType;
            if (this.widget) {
                this.widget.matchType = this._matchType;
            }
            this.tree.refilter();
            this.render();
            this._onDidChangeMatchType.fire(matchType);
        }
        constructor(tree, model, view, filter, contextViewProvider, options = {}) {
            this.tree = tree;
            this.view = view;
            this.filter = filter;
            this.contextViewProvider = contextViewProvider;
            this.options = options;
            this._pattern = '';
            this.previousPattern = '';
            this.width = 0;
            this._onDidChangeMode = new event_2.Emitter();
            this.onDidChangeMode = this._onDidChangeMode.event;
            this._onDidChangeMatchType = new event_2.Emitter();
            this.onDidChangeMatchType = this._onDidChangeMatchType.event;
            this._onDidChangePattern = new event_2.Emitter();
            this.onDidChangePattern = this._onDidChangePattern.event;
            this._onDidChangeOpenState = new event_2.Emitter();
            this.onDidChangeOpenState = this._onDidChangeOpenState.event;
            this.enabledDisposables = new lifecycle_1.DisposableStore();
            this.disposables = new lifecycle_1.DisposableStore();
            this._mode = tree.options.defaultFindMode ?? TreeFindMode.Highlight;
            this._matchType = tree.options.defaultFindMatchType ?? TreeFindMatchType.Fuzzy;
            model.onDidSplice(this.onDidSpliceModel, this, this.disposables);
        }
        updateOptions(optionsUpdate = {}) {
            if (optionsUpdate.defaultFindMode !== undefined) {
                this.mode = optionsUpdate.defaultFindMode;
            }
            if (optionsUpdate.defaultFindMatchType !== undefined) {
                this.matchType = optionsUpdate.defaultFindMatchType;
            }
        }
        open() {
            if (this.widget) {
                this.widget.focus();
                this.widget.select();
                return;
            }
            this.widget = new FindWidget(this.view.getHTMLElement(), this.tree, this.contextViewProvider, this.mode, this.matchType, { ...this.options, history: this._history });
            this.enabledDisposables.add(this.widget);
            this.widget.onDidChangeValue(this.onDidChangeValue, this, this.enabledDisposables);
            this.widget.onDidChangeMode(mode => this.mode = mode, undefined, this.enabledDisposables);
            this.widget.onDidChangeMatchType(matchType => this.matchType = matchType, undefined, this.enabledDisposables);
            this.widget.onDidDisable(this.close, this, this.enabledDisposables);
            this.widget.layout(this.width);
            this.widget.focus();
            this.widget.value = this.previousPattern;
            this.widget.select();
            this._onDidChangeOpenState.fire(true);
        }
        close() {
            if (!this.widget) {
                return;
            }
            this._history = this.widget.getHistory();
            this.widget = undefined;
            this.enabledDisposables.clear();
            this.previousPattern = this.pattern;
            this.onDidChangeValue('');
            this.tree.domFocus();
            this._onDidChangeOpenState.fire(false);
        }
        onDidChangeValue(pattern) {
            this._pattern = pattern;
            this._onDidChangePattern.fire(pattern);
            this.filter.pattern = pattern;
            this.tree.refilter();
            if (pattern) {
                this.tree.focusNext(0, true, undefined, node => !filters_1.FuzzyScore.isDefault(node.filterData));
            }
            const focus = this.tree.getFocus();
            if (focus.length > 0) {
                const element = focus[0];
                if (this.tree.getRelativeTop(element) === null) {
                    this.tree.reveal(element, 0.5);
                }
            }
            this.render();
        }
        onDidSpliceModel() {
            if (!this.widget || this.pattern.length === 0) {
                return;
            }
            this.tree.refilter();
            this.render();
        }
        render() {
            const noMatches = this.filter.totalCount > 0 && this.filter.matchCount === 0;
            if (this.pattern && noMatches) {
                if (this.tree.options.showNotFoundMessage ?? true) {
                    this.widget?.showMessage({ type: 2 /* MessageType.WARNING */, content: (0, nls_1.localize)('not found', "No elements found.") });
                }
                else {
                    this.widget?.showMessage({ type: 2 /* MessageType.WARNING */ });
                }
            }
            else {
                this.widget?.clearMessage();
            }
        }
        shouldAllowFocus(node) {
            if (!this.widget || !this.pattern) {
                return true;
            }
            if (this.filter.totalCount > 0 && this.filter.matchCount <= 1) {
                return true;
            }
            return !filters_1.FuzzyScore.isDefault(node.filterData);
        }
        layout(width) {
            this.width = width;
            this.widget?.layout(width);
        }
        dispose() {
            this._history = undefined;
            this._onDidChangePattern.dispose();
            this.enabledDisposables.dispose();
            this.disposables.dispose();
        }
    }
    function stickyScrollNodeStateEquals(node1, node2) {
        return node1.position === node2.position && stickyScrollNodeEquals(node1, node2);
    }
    function stickyScrollNodeEquals(node1, node2) {
        return node1.node.element === node2.node.element &&
            node1.startIndex === node2.startIndex &&
            node1.height === node2.height &&
            node1.endIndex === node2.endIndex;
    }
    class StickyScrollState {
        constructor(stickyNodes = []) {
            this.stickyNodes = stickyNodes;
        }
        get count() { return this.stickyNodes.length; }
        equal(state) {
            return (0, arrays_1.equals)(this.stickyNodes, state.stickyNodes, stickyScrollNodeStateEquals);
        }
        lastNodePartiallyVisible() {
            if (this.count === 0) {
                return false;
            }
            const lastStickyNode = this.stickyNodes[this.count - 1];
            if (this.count === 1) {
                return lastStickyNode.position !== 0;
            }
            const secondLastStickyNode = this.stickyNodes[this.count - 2];
            return secondLastStickyNode.position + secondLastStickyNode.height !== lastStickyNode.position;
        }
        animationStateChanged(previousState) {
            if (!(0, arrays_1.equals)(this.stickyNodes, previousState.stickyNodes, stickyScrollNodeEquals)) {
                return false;
            }
            if (this.count === 0) {
                return false;
            }
            const lastStickyNode = this.stickyNodes[this.count - 1];
            const previousLastStickyNode = previousState.stickyNodes[previousState.count - 1];
            return lastStickyNode.position !== previousLastStickyNode.position;
        }
    }
    class DefaultStickyScrollDelegate {
        constrainStickyScrollNodes(stickyNodes, stickyScrollMaxItemCount, maxWidgetHeight) {
            for (let i = 0; i < stickyNodes.length; i++) {
                const stickyNode = stickyNodes[i];
                const stickyNodeBottom = stickyNode.position + stickyNode.height;
                if (stickyNodeBottom > maxWidgetHeight || i >= stickyScrollMaxItemCount) {
                    return stickyNodes.slice(0, i);
                }
            }
            return stickyNodes;
        }
    }
    class StickyScrollController extends lifecycle_1.Disposable {
        constructor(tree, model, view, renderers, treeDelegate, options = {}) {
            super();
            this.tree = tree;
            this.model = model;
            this.view = view;
            this.treeDelegate = treeDelegate;
            this.maxWidgetViewRatio = 0.4;
            const stickyScrollOptions = this.validateStickySettings(options);
            this.stickyScrollMaxItemCount = stickyScrollOptions.stickyScrollMaxItemCount;
            this.stickyScrollDelegate = options.stickyScrollDelegate ?? new DefaultStickyScrollDelegate();
            this._widget = this._register(new StickyScrollWidget(view.getScrollableElement(), view, tree, renderers, treeDelegate, options.accessibilityProvider));
            this.onDidChangeHasFocus = this._widget.onDidChangeHasFocus;
            this.onContextMenu = this._widget.onContextMenu;
            this._register(view.onDidScroll(() => this.update()));
            this._register(view.onDidChangeContentHeight(() => this.update()));
            this._register(tree.onDidChangeCollapseState(() => this.update()));
            this.update();
        }
        get height() {
            return this._widget.height;
        }
        get count() {
            return this._widget.count;
        }
        getNode(node) {
            return this._widget.getNode(node);
        }
        getNodeAtHeight(height) {
            let index;
            if (height === 0) {
                index = this.view.firstVisibleIndex;
            }
            else {
                index = this.view.indexAt(height + this.view.scrollTop);
            }
            if (index < 0 || index >= this.view.length) {
                return undefined;
            }
            return this.view.element(index);
        }
        update() {
            const firstVisibleNode = this.getNodeAtHeight(0);
            // Don't render anything if there are no elements
            if (!firstVisibleNode || this.tree.scrollTop === 0) {
                this._widget.setState(undefined);
                return;
            }
            const stickyState = this.findStickyState(firstVisibleNode);
            this._widget.setState(stickyState);
        }
        findStickyState(firstVisibleNode) {
            const stickyNodes = [];
            let firstVisibleNodeUnderWidget = firstVisibleNode;
            let stickyNodesHeight = 0;
            let nextStickyNode = this.getNextStickyNode(firstVisibleNodeUnderWidget, undefined, stickyNodesHeight);
            while (nextStickyNode) {
                stickyNodes.push(nextStickyNode);
                stickyNodesHeight += nextStickyNode.height;
                if (stickyNodes.length <= this.stickyScrollMaxItemCount) {
                    firstVisibleNodeUnderWidget = this.getNextVisibleNode(nextStickyNode);
                    if (!firstVisibleNodeUnderWidget) {
                        break;
                    }
                }
                nextStickyNode = this.getNextStickyNode(firstVisibleNodeUnderWidget, nextStickyNode.node, stickyNodesHeight);
            }
            const contrainedStickyNodes = this.constrainStickyNodes(stickyNodes);
            return contrainedStickyNodes.length ? new StickyScrollState(contrainedStickyNodes) : undefined;
        }
        getNextVisibleNode(previousStickyNode) {
            return this.getNodeAtHeight(previousStickyNode.position + previousStickyNode.height);
        }
        getNextStickyNode(firstVisibleNodeUnderWidget, previousStickyNode, stickyNodesHeight) {
            const nextStickyNode = this.getAncestorUnderPrevious(firstVisibleNodeUnderWidget, previousStickyNode);
            if (!nextStickyNode) {
                return undefined;
            }
            if (nextStickyNode === firstVisibleNodeUnderWidget) {
                if (!this.nodeIsUncollapsedParent(firstVisibleNodeUnderWidget)) {
                    return undefined;
                }
                if (this.nodeTopAlignsWithStickyNodesBottom(firstVisibleNodeUnderWidget, stickyNodesHeight)) {
                    return undefined;
                }
            }
            return this.createStickyScrollNode(nextStickyNode, stickyNodesHeight);
        }
        nodeTopAlignsWithStickyNodesBottom(node, stickyNodesHeight) {
            const nodeIndex = this.getNodeIndex(node);
            const elementTop = this.view.getElementTop(nodeIndex);
            const stickyPosition = stickyNodesHeight;
            return this.view.scrollTop === elementTop - stickyPosition;
        }
        createStickyScrollNode(node, currentStickyNodesHeight) {
            const height = this.treeDelegate.getHeight(node);
            const { startIndex, endIndex } = this.getNodeRange(node);
            const position = this.calculateStickyNodePosition(endIndex, currentStickyNodesHeight, height);
            return { node, position, height, startIndex, endIndex };
        }
        getAncestorUnderPrevious(node, previousAncestor = undefined) {
            let currentAncestor = node;
            let parentOfcurrentAncestor = this.getParentNode(currentAncestor);
            while (parentOfcurrentAncestor) {
                if (parentOfcurrentAncestor === previousAncestor) {
                    return currentAncestor;
                }
                currentAncestor = parentOfcurrentAncestor;
                parentOfcurrentAncestor = this.getParentNode(currentAncestor);
            }
            if (previousAncestor === undefined) {
                return currentAncestor;
            }
            return undefined;
        }
        calculateStickyNodePosition(lastDescendantIndex, stickyRowPositionTop, stickyNodeHeight) {
            let lastChildRelativeTop = this.view.getRelativeTop(lastDescendantIndex);
            // If the last descendant is only partially visible at the top of the view, getRelativeTop() returns null
            // In that case, utilize the next node's relative top to calculate the sticky node's position
            if (lastChildRelativeTop === null && this.view.firstVisibleIndex === lastDescendantIndex && lastDescendantIndex + 1 < this.view.length) {
                const nodeHeight = this.treeDelegate.getHeight(this.view.element(lastDescendantIndex));
                const nextNodeRelativeTop = this.view.getRelativeTop(lastDescendantIndex + 1);
                lastChildRelativeTop = nextNodeRelativeTop ? nextNodeRelativeTop - nodeHeight / this.view.renderHeight : null;
            }
            if (lastChildRelativeTop === null) {
                return stickyRowPositionTop;
            }
            const lastChildNode = this.view.element(lastDescendantIndex);
            const lastChildHeight = this.treeDelegate.getHeight(lastChildNode);
            const topOfLastChild = lastChildRelativeTop * this.view.renderHeight;
            const bottomOfLastChild = topOfLastChild + lastChildHeight;
            if (stickyRowPositionTop + stickyNodeHeight > bottomOfLastChild && stickyRowPositionTop <= bottomOfLastChild) {
                return bottomOfLastChild - stickyNodeHeight;
            }
            return stickyRowPositionTop;
        }
        constrainStickyNodes(stickyNodes) {
            if (stickyNodes.length === 0) {
                return [];
            }
            // Check if sticky nodes need to be constrained
            const maximumStickyWidgetHeight = this.view.renderHeight * this.maxWidgetViewRatio;
            const lastStickyNode = stickyNodes[stickyNodes.length - 1];
            if (stickyNodes.length <= this.stickyScrollMaxItemCount && lastStickyNode.position + lastStickyNode.height <= maximumStickyWidgetHeight) {
                return stickyNodes;
            }
            // constrain sticky nodes
            const constrainedStickyNodes = this.stickyScrollDelegate.constrainStickyScrollNodes(stickyNodes, this.stickyScrollMaxItemCount, maximumStickyWidgetHeight);
            if (!constrainedStickyNodes.length) {
                return [];
            }
            // Validate constraints
            const lastConstrainedStickyNode = constrainedStickyNodes[constrainedStickyNodes.length - 1];
            if (constrainedStickyNodes.length > this.stickyScrollMaxItemCount || lastConstrainedStickyNode.position + lastConstrainedStickyNode.height > maximumStickyWidgetHeight) {
                throw new Error('stickyScrollDelegate violates constraints');
            }
            return constrainedStickyNodes;
        }
        getParentNode(node) {
            const nodeLocation = this.model.getNodeLocation(node);
            const parentLocation = this.model.getParentNodeLocation(nodeLocation);
            return parentLocation ? this.model.getNode(parentLocation) : undefined;
        }
        nodeIsUncollapsedParent(node) {
            const nodeLocation = this.model.getNodeLocation(node);
            return this.model.getListRenderCount(nodeLocation) > 1;
        }
        getNodeIndex(node) {
            const nodeLocation = this.model.getNodeLocation(node);
            const nodeIndex = this.model.getListIndex(nodeLocation);
            return nodeIndex;
        }
        getNodeRange(node) {
            const nodeLocation = this.model.getNodeLocation(node);
            const startIndex = this.model.getListIndex(nodeLocation);
            if (startIndex < 0) {
                throw new Error('Node not found in tree');
            }
            const renderCount = this.model.getListRenderCount(nodeLocation);
            const endIndex = startIndex + renderCount - 1;
            return { startIndex, endIndex };
        }
        nodePositionTopBelowWidget(node) {
            const ancestors = [];
            let currentAncestor = this.getParentNode(node);
            while (currentAncestor) {
                ancestors.push(currentAncestor);
                currentAncestor = this.getParentNode(currentAncestor);
            }
            let widgetHeight = 0;
            for (let i = 0; i < ancestors.length && i < this.stickyScrollMaxItemCount; i++) {
                widgetHeight += this.treeDelegate.getHeight(ancestors[i]);
            }
            return widgetHeight;
        }
        getFocus() {
            return this._widget.getFocus();
        }
        domFocus() {
            this._widget.domFocus();
        }
        // Whether sticky scroll was the last focused part in the tree or not
        focusedLast() {
            return this._widget.focusedLast();
        }
        updateOptions(optionsUpdate = {}) {
            if (!optionsUpdate.stickyScrollMaxItemCount) {
                return;
            }
            const validatedOptions = this.validateStickySettings(optionsUpdate);
            if (this.stickyScrollMaxItemCount !== validatedOptions.stickyScrollMaxItemCount) {
                this.stickyScrollMaxItemCount = validatedOptions.stickyScrollMaxItemCount;
                this.update();
            }
        }
        validateStickySettings(options) {
            let stickyScrollMaxItemCount = 7;
            if (typeof options.stickyScrollMaxItemCount === 'number') {
                stickyScrollMaxItemCount = Math.max(options.stickyScrollMaxItemCount, 1);
            }
            return { stickyScrollMaxItemCount };
        }
    }
    class StickyScrollWidget {
        constructor(container, view, tree, treeRenderers, treeDelegate, accessibilityProvider) {
            this.view = view;
            this.tree = tree;
            this.treeRenderers = treeRenderers;
            this.treeDelegate = treeDelegate;
            this.accessibilityProvider = accessibilityProvider;
            this._previousElements = [];
            this._previousStateDisposables = new lifecycle_1.DisposableStore();
            this._rootDomNode = (0, dom_1.$)('.monaco-tree-sticky-container.empty');
            container.appendChild(this._rootDomNode);
            const shadow = (0, dom_1.$)('.monaco-tree-sticky-container-shadow');
            this._rootDomNode.appendChild(shadow);
            this.stickyScrollFocus = new StickyScrollFocus(this._rootDomNode, view);
            this.onDidChangeHasFocus = this.stickyScrollFocus.onDidChangeHasFocus;
            this.onContextMenu = this.stickyScrollFocus.onContextMenu;
        }
        get height() {
            if (!this._previousState) {
                return 0;
            }
            const lastElement = this._previousState.stickyNodes[this._previousState.count - 1];
            return lastElement.position + lastElement.height;
        }
        get count() {
            return this._previousState?.count ?? 0;
        }
        getNode(node) {
            return this._previousState?.stickyNodes.find(stickyNode => stickyNode.node === node);
        }
        setState(state) {
            const wasVisible = !!this._previousState && this._previousState.count > 0;
            const isVisible = !!state && state.count > 0;
            // If state has not changed, do nothing
            if ((!wasVisible && !isVisible) || (wasVisible && isVisible && this._previousState.equal(state))) {
                return;
            }
            // Update visibility of the widget if changed
            if (wasVisible !== isVisible) {
                this.setVisible(isVisible);
            }
            if (!isVisible) {
                this._previousState = undefined;
                this._previousElements = [];
                this._previousStateDisposables.clear();
                return;
            }
            const lastStickyNode = state.stickyNodes[state.count - 1];
            // If the new state is only a change in the last node's position, update the position of the last element
            if (this._previousState && state.animationStateChanged(this._previousState)) {
                this._previousElements[this._previousState.count - 1].style.top = `${lastStickyNode.position}px`;
            }
            // create new dom elements
            else {
                this._previousStateDisposables.clear();
                const elements = Array(state.count);
                for (let stickyIndex = state.count - 1; stickyIndex >= 0; stickyIndex--) {
                    const stickyNode = state.stickyNodes[stickyIndex];
                    const { element, disposable } = this.createElement(stickyNode, stickyIndex, state.count);
                    elements[stickyIndex] = element;
                    this._rootDomNode.appendChild(element);
                    this._previousStateDisposables.add(disposable);
                }
                this.stickyScrollFocus.updateElements(elements, state);
                this._previousElements = elements;
            }
            this._previousState = state;
            // Set the height of the widget to the bottom of the last sticky node
            this._rootDomNode.style.height = `${lastStickyNode.position + lastStickyNode.height}px`;
        }
        createElement(stickyNode, stickyIndex, stickyNodesTotal) {
            const nodeIndex = stickyNode.startIndex;
            // Sticky element container
            const stickyElement = document.createElement('div');
            stickyElement.style.top = `${stickyNode.position}px`;
            stickyElement.style.height = `${stickyNode.height}px`;
            stickyElement.style.lineHeight = `${stickyNode.height}px`;
            stickyElement.classList.add('monaco-tree-sticky-row');
            stickyElement.classList.add('monaco-list-row');
            stickyElement.setAttribute('data-index', `${nodeIndex}`);
            stickyElement.setAttribute('data-parity', nodeIndex % 2 === 0 ? 'even' : 'odd');
            stickyElement.setAttribute('id', this.view.getElementID(nodeIndex));
            this.setAccessibilityAttributes(stickyElement, stickyNode.node.element, stickyIndex, stickyNodesTotal);
            // Get the renderer for the node
            const nodeTemplateId = this.treeDelegate.getTemplateId(stickyNode.node);
            const renderer = this.treeRenderers.find((renderer) => renderer.templateId === nodeTemplateId);
            if (!renderer) {
                throw new Error(`No renderer found for template id ${nodeTemplateId}`);
            }
            // To make sure we do not influence the original node, we create a copy of the node
            // We need to check if it is already a unique instance of the node by the delegate
            let nodeCopy = stickyNode.node;
            if (nodeCopy === this.tree.getNode(this.tree.getNodeLocation(stickyNode.node))) {
                nodeCopy = new Proxy(stickyNode.node, {});
            }
            // Render the element
            const templateData = renderer.renderTemplate(stickyElement);
            renderer.renderElement(nodeCopy, stickyNode.startIndex, templateData, stickyNode.height);
            // Remove the element from the DOM when state is disposed
            const disposable = (0, lifecycle_1.toDisposable)(() => {
                renderer.disposeElement(nodeCopy, stickyNode.startIndex, templateData, stickyNode.height);
                renderer.disposeTemplate(templateData);
                stickyElement.remove();
            });
            return { element: stickyElement, disposable };
        }
        setAccessibilityAttributes(container, element, stickyIndex, stickyNodesTotal) {
            if (!this.accessibilityProvider) {
                return;
            }
            if (this.accessibilityProvider.getSetSize) {
                container.setAttribute('aria-setsize', String(this.accessibilityProvider.getSetSize(element, stickyIndex, stickyNodesTotal)));
            }
            if (this.accessibilityProvider.getPosInSet) {
                container.setAttribute('aria-posinset', String(this.accessibilityProvider.getPosInSet(element, stickyIndex)));
            }
            if (this.accessibilityProvider.getRole) {
                container.setAttribute('role', this.accessibilityProvider.getRole(element) ?? 'treeitem');
            }
            const ariaLabel = this.accessibilityProvider.getAriaLabel(element);
            if (ariaLabel) {
                container.setAttribute('aria-label', ariaLabel);
            }
            const ariaLevel = this.accessibilityProvider.getAriaLevel && this.accessibilityProvider.getAriaLevel(element);
            if (typeof ariaLevel === 'number') {
                container.setAttribute('aria-level', `${ariaLevel}`);
            }
            // Sticky Scroll elements can not be selected
            container.setAttribute('aria-selected', String(false));
        }
        setVisible(visible) {
            this._rootDomNode.classList.toggle('empty', !visible);
            if (!visible) {
                this.stickyScrollFocus.updateElements([], undefined);
            }
        }
        getFocus() {
            return this.stickyScrollFocus.getFocus();
        }
        domFocus() {
            this.stickyScrollFocus.domFocus();
        }
        focusedLast() {
            return this.stickyScrollFocus.focusedLast();
        }
        dispose() {
            this.stickyScrollFocus.dispose();
            this._previousStateDisposables.dispose();
            this._rootDomNode.remove();
        }
    }
    class StickyScrollFocus extends lifecycle_1.Disposable {
        get domHasFocus() { return this._domHasFocus; }
        set domHasFocus(hasFocus) {
            if (hasFocus !== this._domHasFocus) {
                this._onDidChangeHasFocus.fire(hasFocus);
                this._domHasFocus = hasFocus;
            }
        }
        constructor(container, view) {
            super();
            this.container = container;
            this.view = view;
            this.focusedIndex = -1;
            this.elements = [];
            this._onDidChangeHasFocus = new event_2.Emitter();
            this.onDidChangeHasFocus = this._onDidChangeHasFocus.event;
            this._onContextMenu = new event_2.Emitter();
            this.onContextMenu = this._onContextMenu.event;
            this._domHasFocus = false;
            this.container.addEventListener('focus', () => this.onFocus());
            this.container.addEventListener('blur', () => this.onBlur());
            this._register(this.view.onDidFocus(() => this.toggleStickyScrollFocused(false)));
            this._register(this.view.onKeyDown((e) => this.onKeyDown(e)));
            this._register(this.view.onMouseDown((e) => this.onMouseDown(e)));
            this._register(this.view.onContextMenu((e) => this.handleContextMenu(e)));
        }
        handleContextMenu(e) {
            const target = e.browserEvent.target;
            if (!(0, listWidget_1.isStickyScrollContainer)(target) && !(0, listWidget_1.isStickyScrollElement)(target)) {
                if (this.focusedLast()) {
                    this.view.domFocus();
                }
                return;
            }
            // The list handles the context menu triggered by a mouse event
            // In that case only set the focus of the element clicked and leave the rest to the list to handle
            if (!(0, dom_1.isKeyboardEvent)(e.browserEvent)) {
                if (!this.state) {
                    throw new Error('Context menu should not be triggered when state is undefined');
                }
                const stickyIndex = this.state.stickyNodes.findIndex(stickyNode => stickyNode.node.element === e.element?.element);
                if (stickyIndex === -1) {
                    throw new Error('Context menu should not be triggered when element is not in sticky scroll widget');
                }
                this.container.focus();
                this.setFocus(stickyIndex);
                return;
            }
            if (!this.state || this.focusedIndex < 0) {
                throw new Error('Context menu key should not be triggered when focus is not in sticky scroll widget');
            }
            const stickyNode = this.state.stickyNodes[this.focusedIndex];
            const element = stickyNode.node.element;
            const anchor = this.elements[this.focusedIndex];
            this._onContextMenu.fire({ element, anchor, browserEvent: e.browserEvent, isStickyScroll: true });
        }
        onKeyDown(e) {
            // Sticky Scroll Navigation
            if (this.domHasFocus && this.state) {
                // Move up
                if (e.key === 'ArrowUp') {
                    this.setFocusedElement(Math.max(0, this.focusedIndex - 1));
                    e.preventDefault();
                    e.stopPropagation();
                }
                // Move down, if last sticky node is focused, move focus into first child of last sticky node
                else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    if (this.focusedIndex >= this.state.count - 1) {
                        const nodeIndexToFocus = this.state.stickyNodes[this.state.count - 1].startIndex + 1;
                        this.view.domFocus();
                        this.view.setFocus([nodeIndexToFocus]);
                        this.scrollNodeUnderWidget(nodeIndexToFocus, this.state);
                    }
                    else {
                        this.setFocusedElement(this.focusedIndex + 1);
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
        onMouseDown(e) {
            const target = e.browserEvent.target;
            if (!(0, listWidget_1.isStickyScrollContainer)(target) && !(0, listWidget_1.isStickyScrollElement)(target)) {
                return;
            }
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
        }
        updateElements(elements, state) {
            if (state && state.count === 0) {
                throw new Error('Sticky scroll state must be undefined when there are no sticky nodes');
            }
            if (state && state.count !== elements.length) {
                throw new Error('Sticky scroll focus received illigel state');
            }
            const previousIndex = this.focusedIndex;
            this.removeFocus();
            this.elements = elements;
            this.state = state;
            if (state) {
                const newFocusedIndex = (0, numbers_1.clamp)(previousIndex, 0, state.count - 1);
                this.setFocus(newFocusedIndex);
            }
            else {
                if (this.domHasFocus) {
                    this.view.domFocus();
                }
            }
            // must come last as it calls blur()
            this.container.tabIndex = state ? 0 : -1;
        }
        setFocusedElement(stickyIndex) {
            // doesn't imply that the widget has (or will have) focus
            const state = this.state;
            if (!state) {
                throw new Error('Cannot set focus when state is undefined');
            }
            this.setFocus(stickyIndex);
            if (stickyIndex < state.count - 1) {
                return;
            }
            // If the last sticky node is not fully visible, scroll it into view
            if (state.lastNodePartiallyVisible()) {
                const lastStickyNode = state.stickyNodes[stickyIndex];
                this.scrollNodeUnderWidget(lastStickyNode.endIndex + 1, state);
            }
        }
        scrollNodeUnderWidget(nodeIndex, state) {
            const lastStickyNode = state.stickyNodes[state.count - 1];
            const secondLastStickyNode = state.count > 1 ? state.stickyNodes[state.count - 2] : undefined;
            const elementScrollTop = this.view.getElementTop(nodeIndex);
            const elementTargetViewTop = secondLastStickyNode ? secondLastStickyNode.position + secondLastStickyNode.height + lastStickyNode.height : lastStickyNode.height;
            this.view.scrollTop = elementScrollTop - elementTargetViewTop;
        }
        getFocus() {
            if (!this.state || this.focusedIndex === -1) {
                return undefined;
            }
            return this.state.stickyNodes[this.focusedIndex].node.element;
        }
        domFocus() {
            if (!this.state) {
                throw new Error('Cannot focus when state is undefined');
            }
            this.container.focus();
        }
        focusedLast() {
            if (!this.state) {
                return false;
            }
            return this.view.getHTMLElement().classList.contains('sticky-scroll-focused');
        }
        removeFocus() {
            if (this.focusedIndex === -1) {
                return;
            }
            this.toggleElementFocus(this.elements[this.focusedIndex], false);
            this.focusedIndex = -1;
        }
        setFocus(newFocusIndex) {
            if (0 > newFocusIndex) {
                throw new Error('addFocus() can not remove focus');
            }
            if (!this.state && newFocusIndex >= 0) {
                throw new Error('Cannot set focus index when state is undefined');
            }
            if (this.state && newFocusIndex >= this.state.count) {
                throw new Error('Cannot set focus index to an index that does not exist');
            }
            const oldIndex = this.focusedIndex;
            if (oldIndex >= 0) {
                this.toggleElementFocus(this.elements[oldIndex], false);
            }
            if (newFocusIndex >= 0) {
                this.toggleElementFocus(this.elements[newFocusIndex], true);
            }
            this.focusedIndex = newFocusIndex;
        }
        toggleElementFocus(element, focused) {
            element.classList.toggle('focused', focused);
        }
        toggleStickyScrollFocused(focused) {
            // Weather the last focus in the view was sticky scroll and not the list
            this.view.getHTMLElement().classList.toggle('sticky-scroll-focused', focused);
        }
        onFocus() {
            if (!this.state || this.elements.length === 0) {
                throw new Error('Cannot focus when state is undefined or elements are empty');
            }
            this.domHasFocus = true;
            this.toggleStickyScrollFocused(true);
            if (this.focusedIndex === -1) {
                this.setFocus(0);
            }
        }
        onBlur() {
            this.domHasFocus = false;
        }
        dispose() {
            this.toggleStickyScrollFocused(false);
            this._onDidChangeHasFocus.fire(false);
            super.dispose();
        }
    }
    function asTreeMouseEvent(event) {
        let target = tree_1.TreeMouseEventTarget.Unknown;
        if ((0, dom_1.hasParentWithClass)(event.browserEvent.target, 'monaco-tl-twistie', 'monaco-tl-row')) {
            target = tree_1.TreeMouseEventTarget.Twistie;
        }
        else if ((0, dom_1.hasParentWithClass)(event.browserEvent.target, 'monaco-tl-contents', 'monaco-tl-row')) {
            target = tree_1.TreeMouseEventTarget.Element;
        }
        else if ((0, dom_1.hasParentWithClass)(event.browserEvent.target, 'monaco-tree-type-filter', 'monaco-list')) {
            target = tree_1.TreeMouseEventTarget.Filter;
        }
        return {
            browserEvent: event.browserEvent,
            element: event.element ? event.element.element : null,
            target
        };
    }
    function asTreeContextMenuEvent(event) {
        const isStickyScroll = (0, listWidget_1.isStickyScrollContainer)(event.browserEvent.target);
        return {
            element: event.element ? event.element.element : null,
            browserEvent: event.browserEvent,
            anchor: event.anchor,
            isStickyScroll
        };
    }
    function dfs(node, fn) {
        fn(node);
        node.children.forEach(child => dfs(child, fn));
    }
    /**
     * The trait concept needs to exist at the tree level, because collapsed
     * tree nodes will not be known by the list.
     */
    class Trait {
        get nodeSet() {
            if (!this._nodeSet) {
                this._nodeSet = this.createNodeSet();
            }
            return this._nodeSet;
        }
        constructor(getFirstViewElementWithTrait, identityProvider) {
            this.getFirstViewElementWithTrait = getFirstViewElementWithTrait;
            this.identityProvider = identityProvider;
            this.nodes = [];
            this._onDidChange = new event_2.Emitter();
            this.onDidChange = this._onDidChange.event;
        }
        set(nodes, browserEvent) {
            if (!browserEvent?.__forceEvent && (0, arrays_1.equals)(this.nodes, nodes)) {
                return;
            }
            this._set(nodes, false, browserEvent);
        }
        _set(nodes, silent, browserEvent) {
            this.nodes = [...nodes];
            this.elements = undefined;
            this._nodeSet = undefined;
            if (!silent) {
                const that = this;
                this._onDidChange.fire({ get elements() { return that.get(); }, browserEvent });
            }
        }
        get() {
            if (!this.elements) {
                this.elements = this.nodes.map(node => node.element);
            }
            return [...this.elements];
        }
        getNodes() {
            return this.nodes;
        }
        has(node) {
            return this.nodeSet.has(node);
        }
        onDidModelSplice({ insertedNodes, deletedNodes }) {
            if (!this.identityProvider) {
                const set = this.createNodeSet();
                const visit = (node) => set.delete(node);
                deletedNodes.forEach(node => dfs(node, visit));
                this.set([...set.values()]);
                return;
            }
            const deletedNodesIdSet = new Set();
            const deletedNodesVisitor = (node) => deletedNodesIdSet.add(this.identityProvider.getId(node.element).toString());
            deletedNodes.forEach(node => dfs(node, deletedNodesVisitor));
            const insertedNodesMap = new Map();
            const insertedNodesVisitor = (node) => insertedNodesMap.set(this.identityProvider.getId(node.element).toString(), node);
            insertedNodes.forEach(node => dfs(node, insertedNodesVisitor));
            const nodes = [];
            for (const node of this.nodes) {
                const id = this.identityProvider.getId(node.element).toString();
                const wasDeleted = deletedNodesIdSet.has(id);
                if (!wasDeleted) {
                    nodes.push(node);
                }
                else {
                    const insertedNode = insertedNodesMap.get(id);
                    if (insertedNode && insertedNode.visible) {
                        nodes.push(insertedNode);
                    }
                }
            }
            if (this.nodes.length > 0 && nodes.length === 0) {
                const node = this.getFirstViewElementWithTrait();
                if (node) {
                    nodes.push(node);
                }
            }
            this._set(nodes, true);
        }
        createNodeSet() {
            const set = new Set();
            for (const node of this.nodes) {
                set.add(node);
            }
            return set;
        }
    }
    class TreeNodeListMouseController extends listWidget_1.MouseController {
        constructor(list, tree, stickyScrollProvider) {
            super(list);
            this.tree = tree;
            this.stickyScrollProvider = stickyScrollProvider;
        }
        onViewPointer(e) {
            if ((0, listWidget_1.isButton)(e.browserEvent.target) ||
                (0, listWidget_1.isInputElement)(e.browserEvent.target) ||
                (0, listWidget_1.isMonacoEditor)(e.browserEvent.target)) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            const node = e.element;
            if (!node) {
                return super.onViewPointer(e);
            }
            if (this.isSelectionRangeChangeEvent(e) || this.isSelectionSingleChangeEvent(e)) {
                return super.onViewPointer(e);
            }
            const target = e.browserEvent.target;
            const onTwistie = target.classList.contains('monaco-tl-twistie')
                || (target.classList.contains('monaco-icon-label') && target.classList.contains('folder-icon') && e.browserEvent.offsetX < 16);
            const isStickyElement = (0, listWidget_1.isStickyScrollElement)(e.browserEvent.target);
            let expandOnlyOnTwistieClick = false;
            if (isStickyElement) {
                expandOnlyOnTwistieClick = true;
            }
            else if (typeof this.tree.expandOnlyOnTwistieClick === 'function') {
                expandOnlyOnTwistieClick = this.tree.expandOnlyOnTwistieClick(node.element);
            }
            else {
                expandOnlyOnTwistieClick = !!this.tree.expandOnlyOnTwistieClick;
            }
            if (!isStickyElement) {
                if (expandOnlyOnTwistieClick && !onTwistie && e.browserEvent.detail !== 2) {
                    return super.onViewPointer(e);
                }
                if (!this.tree.expandOnDoubleClick && e.browserEvent.detail === 2) {
                    return super.onViewPointer(e);
                }
            }
            else {
                this.handleStickyScrollMouseEvent(e, node);
            }
            if (node.collapsible && (!isStickyElement || onTwistie)) {
                const location = this.tree.getNodeLocation(node);
                const recursive = e.browserEvent.altKey;
                this.tree.setFocus([location]);
                this.tree.toggleCollapsed(location, recursive);
                if (expandOnlyOnTwistieClick && onTwistie) {
                    // Do not set this before calling a handler on the super class, because it will reject it as handled
                    e.browserEvent.isHandledByList = true;
                    return;
                }
            }
            if (!isStickyElement) {
                super.onViewPointer(e);
            }
        }
        handleStickyScrollMouseEvent(e, node) {
            if ((0, listWidget_1.isMonacoCustomToggle)(e.browserEvent.target) || (0, listWidget_1.isActionItem)(e.browserEvent.target)) {
                return;
            }
            const stickyScrollController = this.stickyScrollProvider();
            if (!stickyScrollController) {
                throw new Error('Sticky scroll controller not found');
            }
            const nodeIndex = this.list.indexOf(node);
            const elementScrollTop = this.list.getElementTop(nodeIndex);
            const elementTargetViewTop = stickyScrollController.nodePositionTopBelowWidget(node);
            this.tree.scrollTop = elementScrollTop - elementTargetViewTop;
            this.list.domFocus();
            this.list.setFocus([nodeIndex]);
            this.list.setSelection([nodeIndex]);
        }
        onDoubleClick(e) {
            const onTwistie = e.browserEvent.target.classList.contains('monaco-tl-twistie');
            if (onTwistie || !this.tree.expandOnDoubleClick) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            super.onDoubleClick(e);
        }
        // to make sure dom focus is not stolen (for example with context menu)
        onMouseDown(e) {
            const target = e.browserEvent.target;
            if (!(0, listWidget_1.isStickyScrollContainer)(target) && !(0, listWidget_1.isStickyScrollElement)(target)) {
                super.onMouseDown(e);
                return;
            }
        }
        onContextMenu(e) {
            const target = e.browserEvent.target;
            if (!(0, listWidget_1.isStickyScrollContainer)(target) && !(0, listWidget_1.isStickyScrollElement)(target)) {
                super.onContextMenu(e);
                return;
            }
        }
    }
    /**
     * We use this List subclass to restore selection and focus as nodes
     * get rendered in the list, possibly due to a node expand() call.
     */
    class TreeNodeList extends listWidget_1.List {
        constructor(user, container, virtualDelegate, renderers, focusTrait, selectionTrait, anchorTrait, options) {
            super(user, container, virtualDelegate, renderers, options);
            this.focusTrait = focusTrait;
            this.selectionTrait = selectionTrait;
            this.anchorTrait = anchorTrait;
        }
        createMouseController(options) {
            return new TreeNodeListMouseController(this, options.tree, options.stickyScrollProvider);
        }
        splice(start, deleteCount, elements = []) {
            super.splice(start, deleteCount, elements);
            if (elements.length === 0) {
                return;
            }
            const additionalFocus = [];
            const additionalSelection = [];
            let anchor;
            elements.forEach((node, index) => {
                if (this.focusTrait.has(node)) {
                    additionalFocus.push(start + index);
                }
                if (this.selectionTrait.has(node)) {
                    additionalSelection.push(start + index);
                }
                if (this.anchorTrait.has(node)) {
                    anchor = start + index;
                }
            });
            if (additionalFocus.length > 0) {
                super.setFocus((0, arrays_1.distinct)([...super.getFocus(), ...additionalFocus]));
            }
            if (additionalSelection.length > 0) {
                super.setSelection((0, arrays_1.distinct)([...super.getSelection(), ...additionalSelection]));
            }
            if (typeof anchor === 'number') {
                super.setAnchor(anchor);
            }
        }
        setFocus(indexes, browserEvent, fromAPI = false) {
            super.setFocus(indexes, browserEvent);
            if (!fromAPI) {
                this.focusTrait.set(indexes.map(i => this.element(i)), browserEvent);
            }
        }
        setSelection(indexes, browserEvent, fromAPI = false) {
            super.setSelection(indexes, browserEvent);
            if (!fromAPI) {
                this.selectionTrait.set(indexes.map(i => this.element(i)), browserEvent);
            }
        }
        setAnchor(index, fromAPI = false) {
            super.setAnchor(index);
            if (!fromAPI) {
                if (typeof index === 'undefined') {
                    this.anchorTrait.set([]);
                }
                else {
                    this.anchorTrait.set([this.element(index)]);
                }
            }
        }
    }
    var AbstractTreePart;
    (function (AbstractTreePart) {
        AbstractTreePart[AbstractTreePart["Tree"] = 0] = "Tree";
        AbstractTreePart[AbstractTreePart["StickyScroll"] = 1] = "StickyScroll";
    })(AbstractTreePart || (exports.AbstractTreePart = AbstractTreePart = {}));
    class AbstractTree {
        get onDidScroll() { return this.view.onDidScroll; }
        get onDidChangeFocus() { return this.eventBufferer.wrapEvent(this.focus.onDidChange); }
        get onDidChangeSelection() { return this.eventBufferer.wrapEvent(this.selection.onDidChange); }
        get onMouseClick() { return event_2.Event.map(this.view.onMouseClick, asTreeMouseEvent); }
        get onMouseDblClick() { return event_2.Event.filter(event_2.Event.map(this.view.onMouseDblClick, asTreeMouseEvent), e => e.target !== tree_1.TreeMouseEventTarget.Filter); }
        get onContextMenu() { return event_2.Event.any(event_2.Event.filter(event_2.Event.map(this.view.onContextMenu, asTreeContextMenuEvent), e => !e.isStickyScroll), this.stickyScrollController?.onContextMenu ?? event_2.Event.None); }
        get onTap() { return event_2.Event.map(this.view.onTap, asTreeMouseEvent); }
        get onPointer() { return event_2.Event.map(this.view.onPointer, asTreeMouseEvent); }
        get onKeyDown() { return this.view.onKeyDown; }
        get onKeyUp() { return this.view.onKeyUp; }
        get onKeyPress() { return this.view.onKeyPress; }
        get onDidFocus() { return this.view.onDidFocus; }
        get onDidBlur() { return this.view.onDidBlur; }
        get onDidChangeModel() { return event_2.Event.signal(this.model.onDidSplice); }
        get onDidChangeCollapseState() { return this.model.onDidChangeCollapseState; }
        get onDidChangeRenderNodeCount() { return this.model.onDidChangeRenderNodeCount; }
        get findMode() { return this.findController?.mode ?? TreeFindMode.Highlight; }
        set findMode(findMode) { if (this.findController) {
            this.findController.mode = findMode;
        } }
        get findMatchType() { return this.findController?.matchType ?? TreeFindMatchType.Fuzzy; }
        set findMatchType(findFuzzy) { if (this.findController) {
            this.findController.matchType = findFuzzy;
        } }
        get onDidChangeFindPattern() { return this.findController ? this.findController.onDidChangePattern : event_2.Event.None; }
        get expandOnDoubleClick() { return typeof this._options.expandOnDoubleClick === 'undefined' ? true : this._options.expandOnDoubleClick; }
        get expandOnlyOnTwistieClick() { return typeof this._options.expandOnlyOnTwistieClick === 'undefined' ? true : this._options.expandOnlyOnTwistieClick; }
        get onDidDispose() { return this.view.onDidDispose; }
        constructor(_user, container, delegate, renderers, _options = {}) {
            this._user = _user;
            this._options = _options;
            this.eventBufferer = new event_2.EventBufferer();
            this.onDidChangeFindOpenState = event_2.Event.None;
            this.onDidChangeStickyScrollFocused = event_2.Event.None;
            this.disposables = new lifecycle_1.DisposableStore();
            this._onWillRefilter = new event_2.Emitter();
            this.onWillRefilter = this._onWillRefilter.event;
            this._onDidUpdateOptions = new event_2.Emitter();
            this.onDidUpdateOptions = this._onDidUpdateOptions.event;
            this.treeDelegate = new ComposedTreeDelegate(delegate);
            const onDidChangeCollapseStateRelay = new event_2.Relay();
            const onDidChangeActiveNodes = new event_2.Relay();
            const activeNodes = this.disposables.add(new EventCollection(onDidChangeActiveNodes.event));
            const renderedIndentGuides = new map_1.SetMap();
            this.renderers = renderers.map(r => new TreeRenderer(r, () => this.model, onDidChangeCollapseStateRelay.event, activeNodes, renderedIndentGuides, _options));
            for (const r of this.renderers) {
                this.disposables.add(r);
            }
            let filter;
            if (_options.keyboardNavigationLabelProvider) {
                filter = new FindFilter(this, _options.keyboardNavigationLabelProvider, _options.filter);
                _options = { ..._options, filter: filter }; // TODO need typescript help here
                this.disposables.add(filter);
            }
            this.focus = new Trait(() => this.view.getFocusedElements()[0], _options.identityProvider);
            this.selection = new Trait(() => this.view.getSelectedElements()[0], _options.identityProvider);
            this.anchor = new Trait(() => this.view.getAnchorElement(), _options.identityProvider);
            this.view = new TreeNodeList(_user, container, this.treeDelegate, this.renderers, this.focus, this.selection, this.anchor, { ...asListOptions(() => this.model, _options), tree: this, stickyScrollProvider: () => this.stickyScrollController });
            this.model = this.createModel(_user, this.view, _options);
            onDidChangeCollapseStateRelay.input = this.model.onDidChangeCollapseState;
            const onDidModelSplice = event_2.Event.forEach(this.model.onDidSplice, e => {
                this.eventBufferer.bufferEvents(() => {
                    this.focus.onDidModelSplice(e);
                    this.selection.onDidModelSplice(e);
                });
            }, this.disposables);
            // Make sure the `forEach` always runs
            onDidModelSplice(() => null, null, this.disposables);
            // Active nodes can change when the model changes or when focus or selection change.
            // We debounce it with 0 delay since these events may fire in the same stack and we only
            // want to run this once. It also doesn't matter if it runs on the next tick since it's only
            // a nice to have UI feature.
            const activeNodesEmitter = this.disposables.add(new event_2.Emitter());
            const activeNodesDebounce = this.disposables.add(new async_1.Delayer(0));
            this.disposables.add(event_2.Event.any(onDidModelSplice, this.focus.onDidChange, this.selection.onDidChange)(() => {
                activeNodesDebounce.trigger(() => {
                    const set = new Set();
                    for (const node of this.focus.getNodes()) {
                        set.add(node);
                    }
                    for (const node of this.selection.getNodes()) {
                        set.add(node);
                    }
                    activeNodesEmitter.fire([...set.values()]);
                });
            }));
            onDidChangeActiveNodes.input = activeNodesEmitter.event;
            if (_options.keyboardSupport !== false) {
                const onKeyDown = event_2.Event.chain(this.view.onKeyDown, $ => $.filter(e => !(0, listWidget_1.isInputElement)(e.target))
                    .map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
                event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 15 /* KeyCode.LeftArrow */))(this.onLeftArrow, this, this.disposables);
                event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 17 /* KeyCode.RightArrow */))(this.onRightArrow, this, this.disposables);
                event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 10 /* KeyCode.Space */))(this.onSpace, this, this.disposables);
            }
            if ((_options.findWidgetEnabled ?? true) && _options.keyboardNavigationLabelProvider && _options.contextViewProvider) {
                const opts = this.options.findWidgetStyles ? { styles: this.options.findWidgetStyles } : undefined;
                this.findController = new FindController(this, this.model, this.view, filter, _options.contextViewProvider, opts);
                this.focusNavigationFilter = node => this.findController.shouldAllowFocus(node);
                this.onDidChangeFindOpenState = this.findController.onDidChangeOpenState;
                this.disposables.add(this.findController);
                this.onDidChangeFindMode = this.findController.onDidChangeMode;
                this.onDidChangeFindMatchType = this.findController.onDidChangeMatchType;
            }
            else {
                this.onDidChangeFindMode = event_2.Event.None;
                this.onDidChangeFindMatchType = event_2.Event.None;
            }
            if (_options.enableStickyScroll) {
                this.stickyScrollController = new StickyScrollController(this, this.model, this.view, this.renderers, this.treeDelegate, _options);
                this.onDidChangeStickyScrollFocused = this.stickyScrollController.onDidChangeHasFocus;
            }
            this.styleElement = (0, dom_1.createStyleSheet)(this.view.getHTMLElement());
            this.getHTMLElement().classList.toggle('always', this._options.renderIndentGuides === RenderIndentGuides.Always);
        }
        updateOptions(optionsUpdate = {}) {
            this._options = { ...this._options, ...optionsUpdate };
            for (const renderer of this.renderers) {
                renderer.updateOptions(optionsUpdate);
            }
            this.view.updateOptions(this._options);
            this.findController?.updateOptions(optionsUpdate);
            this.updateStickyScroll(optionsUpdate);
            this._onDidUpdateOptions.fire(this._options);
            this.getHTMLElement().classList.toggle('always', this._options.renderIndentGuides === RenderIndentGuides.Always);
        }
        get options() {
            return this._options;
        }
        updateStickyScroll(optionsUpdate) {
            if (!this.stickyScrollController && this._options.enableStickyScroll) {
                this.stickyScrollController = new StickyScrollController(this, this.model, this.view, this.renderers, this.treeDelegate, this._options);
                this.onDidChangeStickyScrollFocused = this.stickyScrollController.onDidChangeHasFocus;
            }
            else if (this.stickyScrollController && !this._options.enableStickyScroll) {
                this.onDidChangeStickyScrollFocused = event_2.Event.None;
                this.stickyScrollController.dispose();
                this.stickyScrollController = undefined;
            }
            this.stickyScrollController?.updateOptions(optionsUpdate);
        }
        updateWidth(element) {
            const index = this.model.getListIndex(element);
            if (index === -1) {
                return;
            }
            this.view.updateWidth(index);
        }
        // Widget
        getHTMLElement() {
            return this.view.getHTMLElement();
        }
        get contentHeight() {
            return this.view.contentHeight;
        }
        get contentWidth() {
            return this.view.contentWidth;
        }
        get onDidChangeContentHeight() {
            return this.view.onDidChangeContentHeight;
        }
        get onDidChangeContentWidth() {
            return this.view.onDidChangeContentWidth;
        }
        get scrollTop() {
            return this.view.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.view.scrollTop = scrollTop;
        }
        get scrollLeft() {
            return this.view.scrollLeft;
        }
        set scrollLeft(scrollLeft) {
            this.view.scrollLeft = scrollLeft;
        }
        get scrollHeight() {
            return this.view.scrollHeight;
        }
        get renderHeight() {
            return this.view.renderHeight;
        }
        get firstVisibleElement() {
            let index = this.view.firstVisibleIndex;
            if (this.stickyScrollController) {
                index += this.stickyScrollController.count;
            }
            if (index < 0 || index >= this.view.length) {
                return undefined;
            }
            const node = this.view.element(index);
            return node.element;
        }
        get lastVisibleElement() {
            const index = this.view.lastVisibleIndex;
            const node = this.view.element(index);
            return node.element;
        }
        get ariaLabel() {
            return this.view.ariaLabel;
        }
        set ariaLabel(value) {
            this.view.ariaLabel = value;
        }
        get selectionSize() {
            return this.selection.getNodes().length;
        }
        domFocus() {
            if (this.stickyScrollController?.focusedLast()) {
                this.stickyScrollController.domFocus();
            }
            else {
                this.view.domFocus();
            }
        }
        isDOMFocused() {
            return (0, dom_1.isActiveElement)(this.getHTMLElement());
        }
        layout(height, width) {
            this.view.layout(height, width);
            if ((0, types_1.isNumber)(width)) {
                this.findController?.layout(width);
            }
        }
        style(styles) {
            const suffix = `.${this.view.domId}`;
            const content = [];
            if (styles.treeIndentGuidesStroke) {
                content.push(`.monaco-list${suffix}:hover .monaco-tl-indent > .indent-guide, .monaco-list${suffix}.always .monaco-tl-indent > .indent-guide  { border-color: ${styles.treeInactiveIndentGuidesStroke}; }`);
                content.push(`.monaco-list${suffix} .monaco-tl-indent > .indent-guide.active { border-color: ${styles.treeIndentGuidesStroke}; }`);
            }
            // Sticky Scroll Background
            if (styles.listBackground) {
                content.push(`.monaco-list${suffix} .monaco-scrollable-element .monaco-tree-sticky-container { background-color: ${styles.listBackground}; }`);
                content.push(`.monaco-list${suffix} .monaco-scrollable-element .monaco-tree-sticky-container .monaco-tree-sticky-row { background-color: ${styles.listBackground}; }`);
            }
            // Sticky Scroll Focus
            if (styles.listFocusForeground) {
                content.push(`.monaco-list${suffix}.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
                content.push(`.monaco-list${suffix}:not(.sticky-scroll-focused) .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.focused { color: inherit; }`);
            }
            // Sticky Scroll Focus Outlines
            const focusAndSelectionOutline = (0, dom_1.asCssValueWithDefault)(styles.listFocusAndSelectionOutline, (0, dom_1.asCssValueWithDefault)(styles.listSelectionOutline, styles.listFocusOutline ?? ''));
            if (focusAndSelectionOutline) { // default: listFocusOutline
                content.push(`.monaco-list${suffix}.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container:focus .monaco-list-row.focused.selected { outline: 1px solid ${focusAndSelectionOutline}; outline-offset: -1px;}`);
                content.push(`.monaco-list${suffix}:not(.sticky-scroll-focused) .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.focused.selected { outline: inherit;}`);
            }
            if (styles.listFocusOutline) { // default: set
                content.push(`.monaco-list${suffix}.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container:focus .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }`);
                content.push(`.monaco-list${suffix}:not(.sticky-scroll-focused) .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.focused { outline: inherit; }`);
                content.push(`.monaco-workbench.context-menu-visible .monaco-list${suffix}.last-focused.sticky-scroll-focused .monaco-list-rows .monaco-list-row.focused { outline: inherit; }`);
                content.push(`.monaco-workbench.context-menu-visible .monaco-list${suffix}.last-focused:not(.sticky-scroll-focused) .monaco-tree-sticky-container .monaco-list-rows .monaco-list-row.focused { outline: inherit; }`);
            }
            this.styleElement.textContent = content.join('\n');
            this.view.style(styles);
        }
        // Tree navigation
        getParentElement(location) {
            const parentRef = this.model.getParentNodeLocation(location);
            const parentNode = this.model.getNode(parentRef);
            return parentNode.element;
        }
        getFirstElementChild(location) {
            return this.model.getFirstElementChild(location);
        }
        // Tree
        getNode(location) {
            return this.model.getNode(location);
        }
        getNodeLocation(node) {
            return this.model.getNodeLocation(node);
        }
        collapse(location, recursive = false) {
            return this.model.setCollapsed(location, true, recursive);
        }
        expand(location, recursive = false) {
            return this.model.setCollapsed(location, false, recursive);
        }
        toggleCollapsed(location, recursive = false) {
            return this.model.setCollapsed(location, undefined, recursive);
        }
        expandAll() {
            this.model.setCollapsed(this.model.rootRef, false, true);
        }
        collapseAll() {
            this.model.setCollapsed(this.model.rootRef, true, true);
        }
        isCollapsible(location) {
            return this.model.isCollapsible(location);
        }
        setCollapsible(location, collapsible) {
            return this.model.setCollapsible(location, collapsible);
        }
        isCollapsed(location) {
            return this.model.isCollapsed(location);
        }
        expandTo(location) {
            this.model.expandTo(location);
        }
        triggerTypeNavigation() {
            this.view.triggerTypeNavigation();
        }
        openFind() {
            this.findController?.open();
        }
        closeFind() {
            this.findController?.close();
        }
        refilter() {
            this._onWillRefilter.fire(undefined);
            this.model.refilter();
        }
        setAnchor(element) {
            if (typeof element === 'undefined') {
                return this.view.setAnchor(undefined);
            }
            this.eventBufferer.bufferEvents(() => {
                const node = this.model.getNode(element);
                this.anchor.set([node]);
                const index = this.model.getListIndex(element);
                if (index > -1) {
                    this.view.setAnchor(index, true);
                }
            });
        }
        getAnchor() {
            return (0, arrays_1.firstOrDefault)(this.anchor.get(), undefined);
        }
        setSelection(elements, browserEvent) {
            this.eventBufferer.bufferEvents(() => {
                const nodes = elements.map(e => this.model.getNode(e));
                this.selection.set(nodes, browserEvent);
                const indexes = elements.map(e => this.model.getListIndex(e)).filter(i => i > -1);
                this.view.setSelection(indexes, browserEvent, true);
            });
        }
        getSelection() {
            return this.selection.get();
        }
        setFocus(elements, browserEvent) {
            this.eventBufferer.bufferEvents(() => {
                const nodes = elements.map(e => this.model.getNode(e));
                this.focus.set(nodes, browserEvent);
                const indexes = elements.map(e => this.model.getListIndex(e)).filter(i => i > -1);
                this.view.setFocus(indexes, browserEvent, true);
            });
        }
        focusNext(n = 1, loop = false, browserEvent, filter = ((0, dom_1.isKeyboardEvent)(browserEvent) && browserEvent.altKey) ? undefined : this.focusNavigationFilter) {
            this.view.focusNext(n, loop, browserEvent, filter);
        }
        focusPrevious(n = 1, loop = false, browserEvent, filter = ((0, dom_1.isKeyboardEvent)(browserEvent) && browserEvent.altKey) ? undefined : this.focusNavigationFilter) {
            this.view.focusPrevious(n, loop, browserEvent, filter);
        }
        focusNextPage(browserEvent, filter = ((0, dom_1.isKeyboardEvent)(browserEvent) && browserEvent.altKey) ? undefined : this.focusNavigationFilter) {
            return this.view.focusNextPage(browserEvent, filter);
        }
        focusPreviousPage(browserEvent, filter = ((0, dom_1.isKeyboardEvent)(browserEvent) && browserEvent.altKey) ? undefined : this.focusNavigationFilter) {
            return this.view.focusPreviousPage(browserEvent, filter, () => this.stickyScrollController?.height ?? 0);
        }
        focusLast(browserEvent, filter = ((0, dom_1.isKeyboardEvent)(browserEvent) && browserEvent.altKey) ? undefined : this.focusNavigationFilter) {
            this.view.focusLast(browserEvent, filter);
        }
        focusFirst(browserEvent, filter = ((0, dom_1.isKeyboardEvent)(browserEvent) && browserEvent.altKey) ? undefined : this.focusNavigationFilter) {
            this.view.focusFirst(browserEvent, filter);
        }
        getFocus() {
            return this.focus.get();
        }
        getStickyScrollFocus() {
            const focus = this.stickyScrollController?.getFocus();
            return focus !== undefined ? [focus] : [];
        }
        getFocusedPart() {
            return this.stickyScrollController?.focusedLast() ? 1 /* AbstractTreePart.StickyScroll */ : 0 /* AbstractTreePart.Tree */;
        }
        reveal(location, relativeTop) {
            this.model.expandTo(location);
            const index = this.model.getListIndex(location);
            if (index === -1) {
                return;
            }
            if (!this.stickyScrollController) {
                this.view.reveal(index, relativeTop);
            }
            else {
                const paddingTop = this.stickyScrollController.nodePositionTopBelowWidget(this.getNode(location));
                this.view.reveal(index, relativeTop, paddingTop);
            }
        }
        /**
         * Returns the relative position of an element rendered in the list.
         * Returns `null` if the element isn't *entirely* in the visible viewport.
         */
        getRelativeTop(location) {
            const index = this.model.getListIndex(location);
            if (index === -1) {
                return null;
            }
            const stickyScrollNode = this.stickyScrollController?.getNode(this.getNode(location));
            return this.view.getRelativeTop(index, stickyScrollNode?.position ?? this.stickyScrollController?.height);
        }
        getViewState(identityProvider = this.options.identityProvider) {
            if (!identityProvider) {
                throw new tree_1.TreeError(this._user, 'Can\'t get tree view state without an identity provider');
            }
            const getId = (element) => identityProvider.getId(element).toString();
            const state = AbstractTreeViewState.empty(this.scrollTop);
            for (const focus of this.getFocus()) {
                state.focus.add(getId(focus));
            }
            for (const selection of this.getSelection()) {
                state.selection.add(getId(selection));
            }
            const root = this.model.getNode();
            const queue = [root];
            while (queue.length > 0) {
                const node = queue.shift();
                if (node !== root && node.collapsible) {
                    state.expanded[getId(node.element)] = node.collapsed ? 0 : 1;
                }
                queue.push(...node.children);
            }
            return state;
        }
        // List
        onLeftArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodes = this.view.getFocusedElements();
            if (nodes.length === 0) {
                return;
            }
            const node = nodes[0];
            const location = this.model.getNodeLocation(node);
            const didChange = this.model.setCollapsed(location, true);
            if (!didChange) {
                const parentLocation = this.model.getParentNodeLocation(location);
                if (!parentLocation) {
                    return;
                }
                const parentListIndex = this.model.getListIndex(parentLocation);
                this.view.reveal(parentListIndex);
                this.view.setFocus([parentListIndex]);
            }
        }
        onRightArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodes = this.view.getFocusedElements();
            if (nodes.length === 0) {
                return;
            }
            const node = nodes[0];
            const location = this.model.getNodeLocation(node);
            const didChange = this.model.setCollapsed(location, false);
            if (!didChange) {
                if (!node.children.some(child => child.visible)) {
                    return;
                }
                const [focusedIndex] = this.view.getFocus();
                const firstChildIndex = focusedIndex + 1;
                this.view.reveal(firstChildIndex);
                this.view.setFocus([firstChildIndex]);
            }
        }
        onSpace(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodes = this.view.getFocusedElements();
            if (nodes.length === 0) {
                return;
            }
            const node = nodes[0];
            const location = this.model.getNodeLocation(node);
            const recursive = e.browserEvent.altKey;
            this.model.setCollapsed(location, undefined, recursive);
        }
        navigate(start) {
            return new TreeNavigator(this.view, this.model, start);
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.disposables);
            this.stickyScrollController?.dispose();
            this.view.dispose();
        }
    }
    exports.AbstractTree = AbstractTree;
    class TreeNavigator {
        constructor(view, model, start) {
            this.view = view;
            this.model = model;
            if (start) {
                this.index = this.model.getListIndex(start);
            }
            else {
                this.index = -1;
            }
        }
        current() {
            if (this.index < 0 || this.index >= this.view.length) {
                return null;
            }
            return this.view.element(this.index).element;
        }
        previous() {
            this.index--;
            return this.current();
        }
        next() {
            this.index++;
            return this.current();
        }
        first() {
            this.index = 0;
            return this.current();
        }
        last() {
            this.index = this.view.length - 1;
            return this.current();
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RUcmVlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvdHJlZS9hYnN0cmFjdFRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUNoRyxNQUFNLDJCQUFzRCxTQUFRLGtDQUFvQztRQUV2RyxJQUFhLE9BQU8sQ0FBQyxPQUE2QjtZQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQWEsT0FBTztZQUNuQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFFRCxZQUFvQixJQUFrRTtZQUNyRixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUQ1QixTQUFJLEdBQUosSUFBSSxDQUE4RDtRQUV0RixDQUFDO0tBQ0Q7SUFFRCxTQUFTLHFCQUFxQixDQUFpQixJQUFzQjtRQUNwRSxJQUFJLElBQUksWUFBWSxrQ0FBdUIsRUFBRSxDQUFDO1lBQzdDLE9BQU8sSUFBSSwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsTUFBTSx1QkFBdUI7UUFNNUIsWUFBb0IsYUFBcUQsRUFBVSxHQUF3QjtZQUF2RixrQkFBYSxHQUFiLGFBQWEsQ0FBd0M7WUFBVSxRQUFHLEdBQUgsR0FBRyxDQUFxQjtZQUhuRyx5QkFBb0IsR0FBZ0Isc0JBQVUsQ0FBQyxJQUFJLENBQUM7WUFDcEQsZ0JBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUVtRSxDQUFDO1FBRWhILFVBQVUsQ0FBQyxJQUErQjtZQUN6QyxPQUFP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