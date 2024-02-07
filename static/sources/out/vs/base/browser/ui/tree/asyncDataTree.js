/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/list/listView", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/indexTreeModel", "vs/base/browser/ui/tree/objectTree", "vs/base/browser/ui/tree/tree", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/types"], function (require, exports, listView_1, abstractTree_1, indexTreeModel_1, objectTree_1, tree_1, async_1, codicons_1, themables_1, errors_1, event_1, iterator_1, lifecycle_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompressibleAsyncDataTree = exports.AsyncDataTree = void 0;
    function createAsyncDataTreeNode(props) {
        return {
            ...props,
            children: [],
            refreshPromise: undefined,
            stale: true,
            slow: false,
            forceExpanded: false
        };
    }
    function isAncestor(ancestor, descendant) {
        if (!descendant.parent) {
            return false;
        }
        else if (descendant.parent === ancestor) {
            return true;
        }
        else {
            return isAncestor(ancestor, descendant.parent);
        }
    }
    function intersects(node, other) {
        return node === other || isAncestor(node, other) || isAncestor(other, node);
    }
    class AsyncDataTreeNodeWrapper {
        get element() { return this.node.element.element; }
        get children() { return this.node.children.map(node => new AsyncDataTreeNodeWrapper(node)); }
        get depth() { return this.node.depth; }
        get visibleChildrenCount() { return this.node.visibleChildrenCount; }
        get visibleChildIndex() { return this.node.visibleChildIndex; }
        get collapsible() { return this.node.collapsible; }
        get collapsed() { return this.node.collapsed; }
        get visible() { return this.node.visible; }
        get filterData() { return this.node.filterData; }
        constructor(node) {
            this.node = node;
        }
    }
    class AsyncDataTreeRenderer {
        constructor(renderer, nodeMapper, onDidChangeTwistieState) {
            this.renderer = renderer;
            this.nodeMapper = nodeMapper;
            this.onDidChangeTwistieState = onDidChangeTwistieState;
            this.renderedNodes = new Map();
            this.templateId = renderer.templateId;
        }
        renderTemplate(container) {
            const templateData = this.renderer.renderTemplate(container);
            return { templateData };
        }
        renderElement(node, index, templateData, height) {
            this.renderer.renderElement(this.nodeMapper.map(node), index, templateData.templateData, height);
        }
        renderTwistie(element, twistieElement) {
            if (element.slow) {
                twistieElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.treeItemLoading));
                return true;
            }
            else {
                twistieElement.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.treeItemLoading));
                return false;
            }
        }
        disposeElement(node, index, templateData, height) {
            this.renderer.disposeElement?.(this.nodeMapper.map(node), index, templateData.templateData, height);
        }
        disposeTemplate(templateData) {
            this.renderer.disposeTemplate(templateData.templateData);
        }
        dispose() {
            this.renderedNodes.clear();
        }
    }
    function asTreeEvent(e) {
        return {
            browserEvent: e.browserEvent,
            elements: e.elements.map(e => e.element)
        };
    }
    function asTreeMouseEvent(e) {
        return {
            browserEvent: e.browserEvent,
            element: e.element && e.element.element,
            target: e.target
        };
    }
    function asTreeContextMenuEvent(e) {
        return {
            browserEvent: e.browserEvent,
            element: e.element && e.element.element,
            anchor: e.anchor,
            isStickyScroll: e.isStickyScroll
        };
    }
    class AsyncDataTreeElementsDragAndDropData extends listView_1.ElementsDragAndDropData {
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
    function asAsyncDataTreeDragAndDropData(data) {
        if (data instanceof listView_1.ElementsDragAndDropData) {
            return new AsyncDataTreeElementsDragAndDropData(data);
        }
        return data;
    }
    class AsyncDataTreeNodeListDragAndDrop {
        constructor(dnd) {
            this.dnd = dnd;
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
            this.dnd.onDragStart?.(asAsyncDataTreeDragAndDropData(data), originalEvent);
        }
        onDragOver(data, targetNode, targetIndex, targetSector, originalEvent, raw = true) {
            return this.dnd.onDragOver(asAsyncDataTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, targetSector, originalEvent);
        }
        drop(data, targetNode, targetIndex, targetSector, originalEvent) {
            this.dnd.drop(asAsyncDataTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, targetSector, originalEvent);
        }
        onDragEnd(originalEvent) {
            this.dnd.onDragEnd?.(originalEvent);
        }
        dispose() {
            this.dnd.dispose();
        }
    }
    function asObjectTreeOptions(options) {
        return options && {
            ...options,
            collapseByDefault: true,
            identityProvider: options.identityProvider && {
                getId(el) {
                    return options.identityProvider.getId(el.element);
                }
            },
            dnd: options.dnd && new AsyncDataTreeNodeListDragAndDrop(options.dnd),
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
                getPosInSet: undefined,
                getSetSize: undefined,
                getRole: options.accessibilityProvider.getRole ? (el) => {
                    return options.accessibilityProvider.getRole(el.element);
                } : () => 'treeitem',
                isChecked: options.accessibilityProvider.isChecked ? (e) => {
                    return !!(options.accessibilityProvider?.isChecked(e.element));
                } : undefined,
                getAriaLabel(e) {
                    return options.accessibilityProvider.getAriaLabel(e.element);
                },
                getWidgetAriaLabel() {
                    return options.accessibilityProvider.getWidgetAriaLabel();
                },
                getWidgetRole: options.accessibilityProvider.getWidgetRole ? () => options.accessibilityProvider.getWidgetRole() : () => 'tree',
                getAriaLevel: options.accessibilityProvider.getAriaLevel && (node => {
                    return options.accessibilityProvider.getAriaLevel(node.element);
                }),
                getActiveDescendantId: options.accessibilityProvider.getActiveDescendantId && (node => {
                    return options.accessibilityProvider.getActiveDescendantId(node.element);
                })
            },
            filter: options.filter && {
                filter(e, parentVisibility) {
                    return options.filter.filter(e.element, parentVisibility);
                }
            },
            keyboardNavigationLabelProvider: options.keyboardNavigationLabelProvider && {
                ...options.keyboardNavigationLabelProvider,
                getKeyboardNavigationLabel(e) {
                    return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e.element);
                }
            },
            sorter: undefined,
            expandOnlyOnTwistieClick: typeof options.expandOnlyOnTwistieClick === 'undefined' ? undefined : (typeof options.expandOnlyOnTwistieClick !== 'function' ? options.expandOnlyOnTwistieClick : (e => options.expandOnlyOnTwistieClick(e.element))),
            defaultFindVisibility: e => {
                if (e.hasChildren && e.stale) {
                    return 1 /* TreeVisibility.Visible */;
                }
                else if (typeof options.defaultFindVisibility === 'number') {
                    return options.defaultFindVisibility;
                }
                else if (typeof options.defaultFindVisibility === 'undefined') {
                    return 2 /* TreeVisibility.Recurse */;
                }
                else {
                    return options.defaultFindVisibility(e.element);
                }
            }
        };
    }
    function dfs(node, fn) {
        fn(node);
        node.children.forEach(child => dfs(child, fn));
    }
    class AsyncDataTree {
        get onDidScroll() { return this.tree.onDidScroll; }
        get onDidChangeFocus() { return event_1.Event.map(this.tree.onDidChangeFocus, asTreeEvent); }
        get onDidChangeSelection() { return event_1.Event.map(this.tree.onDidChangeSelection, asTreeEvent); }
        get onKeyDown() { return this.tree.onKeyDown; }
        get onMouseClick() { return event_1.Event.map(this.tree.onMouseClick, asTreeMouseEvent); }
        get onMouseDblClick() { return event_1.Event.map(this.tree.onMouseDblClick, asTreeMouseEvent); }
        get onContextMenu() { return event_1.Event.map(this.tree.onContextMenu, asTreeContextMenuEvent); }
        get onTap() { return event_1.Event.map(this.tree.onTap, asTreeMouseEvent); }
        get onPointer() { return event_1.Event.map(this.tree.onPointer, asTreeMouseEvent); }
        get onDidFocus() { return this.tree.onDidFocus; }
        get onDidBlur() { return this.tree.onDidBlur; }
        /**
         * To be used internally only!
         * @deprecated
         */
        get onDidChangeModel() { return this.tree.onDidChangeModel; }
        get onDidChangeCollapseState() { return this.tree.onDidChangeCollapseState; }
        get onDidUpdateOptions() { return this.tree.onDidUpdateOptions; }
        get onDidChangeFindOpenState() { return this.tree.onDidChangeFindOpenState; }
        get onDidChangeStickyScrollFocused() { return this.tree.onDidChangeStickyScrollFocused; }
        get findMode() { return this.tree.findMode; }
        set findMode(mode) { this.tree.findMode = mode; }
        get findMatchType() { return this.tree.findMatchType; }
        set findMatchType(matchType) { this.tree.findMatchType = matchType; }
        get expandOnlyOnTwistieClick() {
            if (typeof this.tree.expandOnlyOnTwistieClick === 'boolean') {
                return this.tree.expandOnlyOnTwistieClick;
            }
            const fn = this.tree.expandOnlyOnTwistieClick;
            return element => fn(this.nodes.get((element === this.root.element ? null : element)) || null);
        }
        get onDidDispose() { return this.tree.onDidDispose; }
        constructor(user, container, delegate, renderers, dataSource, options = {}) {
            this.user = user;
            this.dataSource = dataSource;
            this.nodes = new Map();
            this.subTreeRefreshPromises = new Map();
            this.refreshPromises = new Map();
            this._onDidRender = new event_1.Emitter();
            this._onDidChangeNodeSlowState = new event_1.Emitter();
            this.nodeMapper = new tree_1.WeakMapper(node => new AsyncDataTreeNodeWrapper(node));
            this.disposables = new lifecycle_1.DisposableStore();
            this.identityProvider = options.identityProvider;
            this.autoExpandSingleChildren = typeof options.autoExpandSingleChildren === 'undefined' ? false : options.autoExpandSingleChildren;
            this.sorter = options.sorter;
            this.getDefaultCollapseState = e => options.collapseByDefault ? (options.collapseByDefault(e) ? tree_1.ObjectTreeElementCollapseState.PreserveOrCollapsed : tree_1.ObjectTreeElementCollapseState.PreserveOrExpanded) : undefined;
            this.tree = this.createTree(user, container, delegate, renderers, options);
            this.onDidChangeFindMode = this.tree.onDidChangeFindMode;
            this.onDidChangeFindMatchType = this.tree.onDidChangeFindMatchType;
            this.root = createAsyncDataTreeNode({
                element: undefined,
                parent: null,
                hasChildren: true,
                defaultCollapseState: undefined
            });
            if (this.identityProvider) {
                this.root = {
                    ...this.root,
                    id: null
                };
            }
            this.nodes.set(null, this.root);
            this.tree.onDidChangeCollapseState(this._onDidChangeCollapseState, this, this.disposables);
        }
        createTree(user, container, delegate, renderers, options) {
            const objectTreeDelegate = new abstractTree_1.ComposedTreeDelegate(delegate);
            const objectTreeRenderers = renderers.map(r => new AsyncDataTreeRenderer(r, this.nodeMapper, this._onDidChangeNodeSlowState.event));
            const objectTreeOptions = asObjectTreeOptions(options) || {};
            return new objectTree_1.ObjectTree(user, container, objectTreeDelegate, objectTreeRenderers, objectTreeOptions);
        }
        updateOptions(options = {}) {
            this.tree.updateOptions(options);
        }
        get options() {
            return this.tree.options;
        }
        // Widget
        getHTMLElement() {
            return this.tree.getHTMLElement();
        }
        get contentHeight() {
            return this.tree.contentHeight;
        }
        get contentWidth() {
            return this.tree.contentWidth;
        }
        get onDidChangeContentHeight() {
            return this.tree.onDidChangeContentHeight;
        }
        get onDidChangeContentWidth() {
            return this.tree.onDidChangeContentWidth;
        }
        get scrollTop() {
            return this.tree.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.tree.scrollTop = scrollTop;
        }
        get scrollLeft() {
            return this.tree.scrollLeft;
        }
        set scrollLeft(scrollLeft) {
            this.tree.scrollLeft = scrollLeft;
        }
        get scrollHeight() {
            return this.tree.scrollHeight;
        }
        get renderHeight() {
            return this.tree.renderHeight;
        }
        get lastVisibleElement() {
            return this.tree.lastVisibleElement.element;
        }
        get ariaLabel() {
            return this.tree.ariaLabel;
        }
        set ariaLabel(value) {
            this.tree.ariaLabel = value;
        }
        domFocus() {
            this.tree.domFocus();
        }
        layout(height, width) {
            this.tree.layout(height, width);
        }
        style(styles) {
            this.tree.style(styles);
        }
        // Model
        getInput() {
            return this.root.element;
        }
        async setInput(input, viewState) {
            this.refreshPromises.forEach(promise => promise.cancel());
            this.refreshPromises.clear();
            this.root.element = input;
            const viewStateContext = viewState && { viewState, focus: [], selection: [] };
            await this._updateChildren(input, true, false, viewStateContext);
            if (viewStateContext) {
                this.tree.setFocus(viewStateContext.focus);
                this.tree.setSelection(viewStateContext.selection);
            }
            if (viewState && typeof viewState.scrollTop === 'number') {
                this.scrollTop = viewState.scrollTop;
            }
        }
        async updateChildren(element = this.root.element, recursive = true, rerender = false, options) {
            await this._updateChildren(element, recursive, rerender, undefined, options);
        }
        async _updateChildren(element = this.root.element, recursive = true, rerender = false, viewStateContext, options) {
            if (typeof this.root.element === 'undefined') {
                throw new tree_1.TreeError(this.user, 'Tree input not set');
            }
            if (this.root.refreshPromise) {
                await this.root.refreshPromise;
                await event_1.Event.toPromise(this._onDidRender.event);
            }
            const node = this.getDataNode(element);
            await this.refreshAndRenderNode(node, recursive, viewStateContext, options);
            if (rerender) {
                try {
                    this.tree.rerender(node);
                }
                catch {
                    // missing nodes are fine, this could've resulted from
                    // parallel refresh calls, removing `node` altogether
                }
            }
        }
        resort(element = this.root.element, recursive = true) {
            this.tree.resort(this.getDataNode(element), recursive);
        }
        hasElement(element) {
            return this.tree.hasElement(this.getDataNode(element));
        }
        hasNode(element) {
            return element === this.root.element || this.nodes.has(element);
        }
        // View
        rerender(element) {
            if (element === undefined || element === this.root.element) {
                this.tree.rerender();
                return;
            }
            const node = this.getDataNode(element);
            this.tree.rerender(node);
        }
        updateElementHeight(element, height) {
            const node = this.getDataNode(element);
            this.tree.updateElementHeight(node, height);
        }
        updateWidth(element) {
            const node = this.getDataNode(element);
            this.tree.updateWidth(node);
        }
        // Tree
        getNode(element = this.root.element) {
            const dataNode = this.getDataNode(element);
            const node = this.tree.getNode(dataNode === this.root ? null : dataNode);
            return this.nodeMapper.map(node);
        }
        collapse(element, recursive = false) {
            const node = this.getDataNode(element);
            return this.tree.collapse(node === this.root ? null : node, recursive);
        }
        async expand(element, recursive = false) {
            if (typeof this.root.element === 'undefined') {
                throw new tree_1.TreeError(this.user, 'Tree input not set');
            }
            if (this.root.refreshPromise) {
                await this.root.refreshPromise;
                await event_1.Event.toPromise(this._onDidRender.event);
            }
            const node = this.getDataNode(element);
            if (this.tree.hasElement(node) && !this.tree.isCollapsible(node)) {
                return false;
            }
            if (node.refreshPromise) {
                await this.root.refreshPromise;
                await event_1.Event.toPromise(this._onDidRender.event);
            }
            if (node !== this.root && !node.refreshPromise && !this.tree.isCollapsed(node)) {
                return false;
            }
            const result = this.tree.expand(node === this.root ? null : node, recursive);
            if (node.refreshPromise) {
                await this.root.refreshPromise;
                await event_1.Event.toPromise(this._onDidRender.event);
            }
            return result;
        }
        toggleCollapsed(element, recursive = false) {
            return this.tree.toggleCollapsed(this.getDataNode(element), recursive);
        }
        expandAll() {
            this.tree.expandAll();
        }
        async expandTo(element) {
            if (!this.dataSource.getParent) {
                throw new Error('Can\'t expand to element without getParent method');
            }
            const elements = [];
            while (!this.hasNode(element)) {
                element = this.dataSource.getParent(element);
                if (element !== this.root.element) {
                    elements.push(element);
                }
            }
            for (const element of iterator_1.Iterable.reverse(elements)) {
                await this.expand(element);
            }
            this.tree.expandTo(this.getDataNode(element));
        }
        collapseAll() {
            this.tree.collapseAll();
        }
        isCollapsible(element) {
            return this.tree.isCollapsible(this.getDataNode(element));
        }
        isCollapsed(element) {
            return this.tree.isCollapsed(this.getDataNode(element));
        }
        triggerTypeNavigation() {
            this.tree.triggerTypeNavigation();
        }
        openFind() {
            this.tree.openFind();
        }
        closeFind() {
            this.tree.closeFind();
        }
        refilter() {
            this.tree.refilter();
        }
        setAnchor(element) {
            this.tree.setAnchor(typeof element === 'undefined' ? undefined : this.getDataNode(element));
        }
        getAnchor() {
            const node = this.tree.getAnchor();
            return node?.element;
        }
        setSelection(elements, browserEvent) {
            const nodes = elements.map(e => this.getDataNode(e));
            this.tree.setSelection(nodes, browserEvent);
        }
        getSelection() {
            const nodes = this.tree.getSelection();
            return nodes.map(n => n.element);
        }
        setFocus(elements, browserEvent) {
            const nodes = elements.map(e => this.getDataNode(e));
            this.tree.setFocus(nodes, browserEvent);
        }
        focusNext(n = 1, loop = false, browserEvent) {
            this.tree.focusNext(n, loop, browserEvent);
        }
        focusPrevious(n = 1, loop = false, browserEvent) {
            this.tree.focusPrevious(n, loop, browserEvent);
        }
        focusNextPage(browserEvent) {
            return this.tree.focusNextPage(browserEvent);
        }
        focusPreviousPage(browserEvent) {
            return this.tree.focusPreviousPage(browserEvent);
        }
        focusLast(browserEvent) {
            this.tree.focusLast(browserEvent);
        }
        focusFirst(browserEvent) {
            this.tree.focusFirst(browserEvent);
        }
        getFocus() {
            const nodes = this.tree.getFocus();
            return nodes.map(n => n.element);
        }
        getStickyScrollFocus() {
            const nodes = this.tree.getStickyScrollFocus();
            return nodes.map(n => n.element);
        }
        getFocusedPart() {
            return this.tree.getFocusedPart();
        }
        reveal(element, relativeTop) {
            this.tree.reveal(this.getDataNode(element), relativeTop);
        }
        getRelativeTop(element) {
            return this.tree.getRelativeTop(this.getDataNode(element));
        }
        // Tree navigation
        getParentElement(element) {
            const node = this.tree.getParentElement(this.getDataNode(element));
            return (node && node.element);
        }
        getFirstElementChild(element = this.root.element) {
            const dataNode = this.getDataNode(element);
            const node = this.tree.getFirstElementChild(dataNode === this.root ? null : dataNode);
            return (node && node.element);
        }
        // Implementation
        getDataNode(element) {
            const node = this.nodes.get((element === this.root.element ? null : element));
            if (!node) {
                throw new tree_1.TreeError(this.user, `Data tree node not found: ${element}`);
            }
            return node;
        }
        async refreshAndRenderNode(node, recursive, viewStateContext, options) {
            await this.refreshNode(node, recursive, viewStateContext);
            if (this.disposables.isDisposed) {
                return; // tree disposed during refresh (#199264)
            }
            this.render(node, viewStateContext, options);
        }
        async refreshNode(node, recursive, viewStateContext) {
            let result;
            this.subTreeRefreshPromises.forEach((refreshPromise, refreshNode) => {
                if (!result && intersects(refreshNode, node)) {
                    result = refreshPromise.then(() => this.refreshNode(node, recursive, viewStateContext));
                }
            });
            if (result) {
                return result;
            }
            if (node !== this.root) {
                const treeNode = this.tree.getNode(node);
                if (treeNode.collapsed) {
                    node.hasChildren = !!this.dataSource.hasChildren(node.element);
                    node.stale = true;
                    return;
                }
            }
            return this.doRefreshSubTree(node, recursive, viewStateContext);
        }
        async doRefreshSubTree(node, recursive, viewStateContext) {
            let done;
            node.refreshPromise = new Promise(c => done = c);
            this.subTreeRefreshPromises.set(node, node.refreshPromise);
            node.refreshPromise.finally(() => {
                node.refreshPromise = undefined;
                this.subTreeRefreshPromises.delete(node);
            });
            try {
                const childrenToRefresh = await this.doRefreshNode(node, recursive, viewStateContext);
                node.stale = false;
                await async_1.Promises.settled(childrenToRefresh.map(child => this.doRefreshSubTree(child, recursive, viewStateContext)));
            }
            finally {
                done();
            }
        }
        async doRefreshNode(node, recursive, viewStateContext) {
            node.hasChildren = !!this.dataSource.hasChildren(node.element);
            let childrenPromise;
            if (!node.hasChildren) {
                childrenPromise = Promise.resolve(iterator_1.Iterable.empty());
            }
            else {
                const children = this.doGetChildren(node);
                if ((0, types_1.isIterable)(children)) {
                    childrenPromise = Promise.resolve(children);
                }
                else {
                    const slowTimeout = (0, async_1.timeout)(800);
                    slowTimeout.then(() => {
                        node.slow = true;
                        this._onDidChangeNodeSlowState.fire(node);
                    }, _ => null);
                    childrenPromise = children.finally(() => slowTimeout.cancel());
                }
            }
            try {
                const children = await childrenPromise;
                return this.setChildren(node, children, recursive, viewStateContext);
            }
            catch (err) {
                if (node !== this.root && this.tree.hasElement(node)) {
                    this.tree.collapse(node);
                }
                if ((0, errors_1.isCancellationError)(err)) {
                    return [];
                }
                throw err;
            }
            finally {
                if (node.slow) {
                    node.slow = false;
                    this._onDidChangeNodeSlowState.fire(node);
                }
            }
        }
        doGetChildren(node) {
            let result = this.refreshPromises.get(node);
            if (result) {
                return result;
            }
            const children = this.dataSource.getChildren(node.element);
            if ((0, types_1.isIterable)(children)) {
                return this.processChildren(children);
            }
            else {
                result = (0, async_1.createCancelablePromise)(async () => this.processChildren(await children));
                this.refreshPromises.set(node, result);
                return result.finally(() => { this.refreshPromises.delete(node); });
            }
        }
        _onDidChangeCollapseState({ node, deep }) {
            if (node.element === null) {
                return;
            }
            if (!node.collapsed && node.element.stale) {
                if (deep) {
                    this.collapse(node.element.element);
                }
                else {
                    this.refreshAndRenderNode(node.element, false)
                        .catch(errors_1.onUnexpectedError);
                }
            }
        }
        setChildren(node, childrenElementsIterable, recursive, viewStateContext) {
            const childrenElements = [...childrenElementsIterable];
            // perf: if the node was and still is a leaf, avoid all this hassle
            if (node.children.length === 0 && childrenElements.length === 0) {
                return [];
            }
            const nodesToForget = new Map();
            const childrenTreeNodesById = new Map();
            for (const child of node.children) {
                nodesToForget.set(child.element, child);
                if (this.identityProvider) {
                    childrenTreeNodesById.set(child.id, { node: child, collapsed: this.tree.hasElement(child) && this.tree.isCollapsed(child) });
                }
            }
            const childrenToRefresh = [];
            const children = childrenElements.map(element => {
                const hasChildren = !!this.dataSource.hasChildren(element);
                if (!this.identityProvider) {
                    const asyncDataTreeNode = createAsyncDataTreeNode({ element, parent: node, hasChildren, defaultCollapseState: this.getDefaultCollapseState(element) });
                    if (hasChildren && asyncDataTreeNode.defaultCollapseState === tree_1.ObjectTreeElementCollapseState.PreserveOrExpanded) {
                        childrenToRefresh.push(asyncDataTreeNode);
                    }
                    return asyncDataTreeNode;
                }
                const id = this.identityProvider.getId(element).toString();
                const result = childrenTreeNodesById.get(id);
                if (result) {
                    const asyncDataTreeNode = result.node;
                    nodesToForget.delete(asyncDataTreeNode.element);
                    this.nodes.delete(asyncDataTreeNode.element);
                    this.nodes.set(element, asyncDataTreeNode);
                    asyncDataTreeNode.element = element;
                    asyncDataTreeNode.hasChildren = hasChildren;
                    if (recursive) {
                        if (result.collapsed) {
                            asyncDataTreeNode.children.forEach(node => dfs(node, node => this.nodes.delete(node.element)));
                            asyncDataTreeNode.children.splice(0, asyncDataTreeNode.children.length);
                            asyncDataTreeNode.stale = true;
                        }
                        else {
                            childrenToRefresh.push(asyncDataTreeNode);
                        }
                    }
                    else if (hasChildren && !result.collapsed) {
                        childrenToRefresh.push(asyncDataTreeNode);
                    }
                    return asyncDataTreeNode;
                }
                const childAsyncDataTreeNode = createAsyncDataTreeNode({ element, parent: node, id, hasChildren, defaultCollapseState: this.getDefaultCollapseState(element) });
                if (viewStateContext && viewStateContext.viewState.focus && viewStateContext.viewState.focus.indexOf(id) > -1) {
                    viewStateContext.focus.push(childAsyncDataTreeNode);
                }
                if (viewStateContext && viewStateContext.viewState.selection && viewStateContext.viewState.selection.indexOf(id) > -1) {
                    viewStateContext.selection.push(childAsyncDataTreeNode);
                }
                if (viewStateContext && viewStateContext.viewState.expanded && viewStateContext.viewState.expanded.indexOf(id) > -1) {
                    childrenToRefresh.push(childAsyncDataTreeNode);
                }
                else if (hasChildren && childAsyncDataTreeNode.defaultCollapseState === tree_1.ObjectTreeElementCollapseState.PreserveOrExpanded) {
                    childrenToRefresh.push(childAsyncDataTreeNode);
                }
                return childAsyncDataTreeNode;
            });
            for (const node of nodesToForget.values()) {
                dfs(node, node => this.nodes.delete(node.element));
            }
            for (const child of children) {
                this.nodes.set(child.element, child);
            }
            node.children.splice(0, node.children.length, ...children);
            // TODO@joao this doesn't take filter into account
            if (node !== this.root && this.autoExpandSingleChildren && children.length === 1 && childrenToRefresh.length === 0) {
                children[0].forceExpanded = true;
                childrenToRefresh.push(children[0]);
            }
            return childrenToRefresh;
        }
        render(node, viewStateContext, options) {
            const children = node.children.map(node => this.asTreeElement(node, viewStateContext));
            const objectTreeOptions = options && {
                ...options,
                diffIdentityProvider: options.diffIdentityProvider && {
                    getId(node) {
                        return options.diffIdentityProvider.getId(node.element);
                    }
                }
            };
            this.tree.setChildren(node === this.root ? null : node, children, objectTreeOptions);
            if (node !== this.root) {
                this.tree.setCollapsible(node, node.hasChildren);
            }
            this._onDidRender.fire();
        }
        asTreeElement(node, viewStateContext) {
            if (node.stale) {
                return {
                    element: node,
                    collapsible: node.hasChildren,
                    collapsed: true
                };
            }
            let collapsed;
            if (viewStateContext && viewStateContext.viewState.expanded && node.id && viewStateContext.viewState.expanded.indexOf(node.id) > -1) {
                collapsed = false;
            }
            else if (node.forceExpanded) {
                collapsed = false;
                node.forceExpanded = false;
            }
            else {
                collapsed = node.defaultCollapseState;
            }
            return {
                element: node,
                children: node.hasChildren ? iterator_1.Iterable.map(node.children, child => this.asTreeElement(child, viewStateContext)) : [],
                collapsible: node.hasChildren,
                collapsed
            };
        }
        processChildren(children) {
            if (this.sorter) {
                children = [...children].sort(this.sorter.compare.bind(this.sorter));
            }
            return children;
        }
        // view state
        getViewState() {
            if (!this.identityProvider) {
                throw new tree_1.TreeError(this.user, 'Can\'t get tree view state without an identity provider');
            }
            const getId = (element) => this.identityProvider.getId(element).toString();
            const focus = this.getFocus().map(getId);
            const selection = this.getSelection().map(getId);
            const expanded = [];
            const root = this.tree.getNode();
            const stack = [root];
            while (stack.length > 0) {
                const node = stack.pop();
                if (node !== root && node.collapsible && !node.collapsed) {
                    expanded.push(getId(node.element.element));
                }
                stack.push(...node.children);
            }
            return { focus, selection, expanded, scrollTop: this.scrollTop };
        }
        dispose() {
            this.disposables.dispose();
            this.tree.dispose();
        }
    }
    exports.AsyncDataTree = AsyncDataTree;
    class CompressibleAsyncDataTreeNodeWrapper {
        get element() {
            return {
                elements: this.node.element.elements.map(e => e.element),
                incompressible: this.node.element.incompressible
            };
        }
        get children() { return this.node.children.map(node => new CompressibleAsyncDataTreeNodeWrapper(node)); }
        get depth() { return this.node.depth; }
        get visibleChildrenCount() { return this.node.visibleChildrenCount; }
        get visibleChildIndex() { return this.node.visibleChildIndex; }
        get collapsible() { return this.node.collapsible; }
        get collapsed() { return this.node.collapsed; }
        get visible() { return this.node.visible; }
        get filterData() { return this.node.filterData; }
        constructor(node) {
            this.node = node;
        }
    }
    class CompressibleAsyncDataTreeRenderer {
        constructor(renderer, nodeMapper, compressibleNodeMapperProvider, onDidChangeTwistieState) {
            this.renderer = renderer;
            this.nodeMapper = nodeMapper;
            this.compressibleNodeMapperProvider = compressibleNodeMapperProvider;
            this.onDidChangeTwistieState = onDidChangeTwistieState;
            this.renderedNodes = new Map();
            this.disposables = [];
            this.templateId = renderer.templateId;
        }
        renderTemplate(container) {
            const templateData = this.renderer.renderTemplate(container);
            return { templateData };
        }
        renderElement(node, index, templateData, height) {
            this.renderer.renderElement(this.nodeMapper.map(node), index, templateData.templateData, height);
        }
        renderCompressedElements(node, index, templateData, height) {
            this.renderer.renderCompressedElements(this.compressibleNodeMapperProvider().map(node), index, templateData.templateData, height);
        }
        renderTwistie(element, twistieElement) {
            if (element.slow) {
                twistieElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.treeItemLoading));
                return true;
            }
            else {
                twistieElement.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.treeItemLoading));
                return false;
            }
        }
        disposeElement(node, index, templateData, height) {
            this.renderer.disposeElement?.(this.nodeMapper.map(node), index, templateData.templateData, height);
        }
        disposeCompressedElements(node, index, templateData, height) {
            this.renderer.disposeCompressedElements?.(this.compressibleNodeMapperProvider().map(node), index, templateData.templateData, height);
        }
        disposeTemplate(templateData) {
            this.renderer.disposeTemplate(templateData.templateData);
        }
        dispose() {
            this.renderedNodes.clear();
            this.disposables = (0, lifecycle_1.dispose)(this.disposables);
        }
    }
    function asCompressibleObjectTreeOptions(options) {
        const objectTreeOptions = options && asObjectTreeOptions(options);
        return objectTreeOptions && {
            ...objectTreeOptions,
            keyboardNavigationLabelProvider: objectTreeOptions.keyboardNavigationLabelProvider && {
                ...objectTreeOptions.keyboardNavigationLabelProvider,
                getCompressedNodeKeyboardNavigationLabel(els) {
                    return options.keyboardNavigationLabelProvider.getCompressedNodeKeyboardNavigationLabel(els.map(e => e.element));
                }
            }
        };
    }
    class CompressibleAsyncDataTree extends AsyncDataTree {
        constructor(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, options = {}) {
            super(user, container, virtualDelegate, renderers, dataSource, options);
            this.compressionDelegate = compressionDelegate;
            this.compressibleNodeMapper = new tree_1.WeakMapper(node => new CompressibleAsyncDataTreeNodeWrapper(node));
            this.filter = options.filter;
        }
        createTree(user, container, delegate, renderers, options) {
            const objectTreeDelegate = new abstractTree_1.ComposedTreeDelegate(delegate);
            const objectTreeRenderers = renderers.map(r => new CompressibleAsyncDataTreeRenderer(r, this.nodeMapper, () => this.compressibleNodeMapper, this._onDidChangeNodeSlowState.event));
            const objectTreeOptions = asCompressibleObjectTreeOptions(options) || {};
            return new objectTree_1.CompressibleObjectTree(user, container, objectTreeDelegate, objectTreeRenderers, objectTreeOptions);
        }
        asTreeElement(node, viewStateContext) {
            return {
                incompressible: this.compressionDelegate.isIncompressible(node.element),
                ...super.asTreeElement(node, viewStateContext)
            };
        }
        updateOptions(options = {}) {
            this.tree.updateOptions(options);
        }
        getViewState() {
            if (!this.identityProvider) {
                throw new tree_1.TreeError(this.user, 'Can\'t get tree view state without an identity provider');
            }
            const getId = (element) => this.identityProvider.getId(element).toString();
            const focus = this.getFocus().map(getId);
            const selection = this.getSelection().map(getId);
            const expanded = [];
            const root = this.tree.getCompressedTreeNode();
            const stack = [root];
            while (stack.length > 0) {
                const node = stack.pop();
                if (node !== root && node.collapsible && !node.collapsed) {
                    for (const asyncNode of node.element.elements) {
                        expanded.push(getId(asyncNode.element));
                    }
                }
                stack.push(...node.children);
            }
            return { focus, selection, expanded, scrollTop: this.scrollTop };
        }
        render(node, viewStateContext, options) {
            if (!this.identityProvider) {
                return super.render(node, viewStateContext);
            }
            // Preserve traits across compressions. Hacky but does the trick.
            // This is hard to fix properly since it requires rewriting the traits
            // across trees and lists. Let's just keep it this way for now.
            const getId = (element) => this.identityProvider.getId(element).toString();
            const getUncompressedIds = (nodes) => {
                const result = new Set();
                for (const node of nodes) {
                    const compressedNode = this.tree.getCompressedTreeNode(node === this.root ? null : node);
                    if (!compressedNode.element) {
                        continue;
                    }
                    for (const node of compressedNode.element.elements) {
                        result.add(getId(node.element));
                    }
                }
                return result;
            };
            const oldSelection = getUncompressedIds(this.tree.getSelection());
            const oldFocus = getUncompressedIds(this.tree.getFocus());
            super.render(node, viewStateContext, options);
            const selection = this.getSelection();
            let didChangeSelection = false;
            const focus = this.getFocus();
            let didChangeFocus = false;
            const visit = (node) => {
                const compressedNode = node.element;
                if (compressedNode) {
                    for (let i = 0; i < compressedNode.elements.length; i++) {
                        const id = getId(compressedNode.elements[i].element);
                        const element = compressedNode.elements[compressedNode.elements.length - 1].element;
                        // github.com/microsoft/vscode/issues/85938
                        if (oldSelection.has(id) && selection.indexOf(element) === -1) {
                            selection.push(element);
                            didChangeSelection = true;
                        }
                        if (oldFocus.has(id) && focus.indexOf(element) === -1) {
                            focus.push(element);
                            didChangeFocus = true;
                        }
                    }
                }
                node.children.forEach(visit);
            };
            visit(this.tree.getCompressedTreeNode(node === this.root ? null : node));
            if (didChangeSelection) {
                this.setSelection(selection);
            }
            if (didChangeFocus) {
                this.setFocus(focus);
            }
        }
        // For compressed async data trees, `TreeVisibility.Recurse` doesn't currently work
        // and we have to filter everything beforehand
        // Related to #85193 and #85835
        processChildren(children) {
            if (this.filter) {
                children = iterator_1.Iterable.filter(children, e => {
                    const result = this.filter.filter(e, 1 /* TreeVisibility.Visible */);
                    const visibility = getVisibility(result);
                    if (visibility === 2 /* TreeVisibility.Recurse */) {
                        throw new Error('Recursive tree visibility not supported in async data compressed trees');
                    }
                    return visibility === 1 /* TreeVisibility.Visible */;
                });
            }
            return super.processChildren(children);
        }
    }
    exports.CompressibleAsyncDataTree = CompressibleAsyncDataTree;
    function getVisibility(filterResult) {
        if (typeof filterResult === 'boolean') {
            return filterResult ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */;
        }
        else if ((0, indexTreeModel_1.isFilterResult)(filterResult)) {
            return (0, indexTreeModel_1.getVisibleState)(filterResult.visibility);
        }
        else {
            return (0, indexTreeModel_1.getVisibleState)(filterResult);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNEYXRhVHJlZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3RyZWUvYXN5bmNEYXRhVHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF5Q2hHLFNBQVMsdUJBQXVCLENBQVksS0FBaUQ7UUFDNUYsT0FBTztZQUNOLEdBQUcsS0FBSztZQUNSLFFBQVEsRUFBRSxFQUFFO1lBQ1osY0FBYyxFQUFFLFNBQVM7WUFDekIsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsS0FBSztZQUNYLGFBQWEsRUFBRSxLQUFLO1NBQ3BCLENBQUM7SUFDSCxDQUFDO0lBRUQsU0FBUyxVQUFVLENBQVksUUFBdUMsRUFBRSxVQUF5QztRQUNoSCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3hCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQzthQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMzQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7YUFBTSxDQUFDO1lBQ1AsT0FBTyxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxDQUFDO0lBQ0YsQ0FBQztJQUVELFNBQVMsVUFBVSxDQUFZLElBQW1DLEVBQUUsS0FBb0M7UUFDdkcsT0FBTyxJQUFJLEtBQUssS0FBSyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBUUQsTUFBTSx3QkFBd0I7UUFFN0IsSUFBSSxPQUFPLEtBQVEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxPQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzVELElBQUksUUFBUSxL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