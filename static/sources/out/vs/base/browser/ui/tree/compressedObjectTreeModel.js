/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/objectTreeModel", "vs/base/browser/ui/tree/tree", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/iterator"], function (require, exports, objectTreeModel_1, tree_1, arrays_1, event_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompressibleObjectTreeModel = exports.DefaultElementMapper = exports.CompressedObjectTreeModel = exports.decompress = exports.compress = void 0;
    function noCompress(element) {
        const elements = [element.element];
        const incompressible = element.incompressible || false;
        return {
            element: { elements, incompressible },
            children: iterator_1.Iterable.map(iterator_1.Iterable.from(element.children), noCompress),
            collapsible: element.collapsible,
            collapsed: element.collapsed
        };
    }
    // Exported only for test reasons, do not use directly
    function compress(element) {
        const elements = [element.element];
        const incompressible = element.incompressible || false;
        let childrenIterator;
        let children;
        while (true) {
            [children, childrenIterator] = iterator_1.Iterable.consume(iterator_1.Iterable.from(element.children), 2);
            if (children.length !== 1) {
                break;
            }
            if (children[0].incompressible) {
                break;
            }
            element = children[0];
            elements.push(element.element);
        }
        return {
            element: { elements, incompressible },
            children: iterator_1.Iterable.map(iterator_1.Iterable.concat(children, childrenIterator), compress),
            collapsible: element.collapsible,
            collapsed: element.collapsed
        };
    }
    exports.compress = compress;
    function _decompress(element, index = 0) {
        let children;
        if (index < element.element.elements.length - 1) {
            children = [_decompress(element, index + 1)];
        }
        else {
            children = iterator_1.Iterable.map(iterator_1.Iterable.from(element.children), el => _decompress(el, 0));
        }
        if (index === 0 && element.element.incompressible) {
            return {
                element: element.element.elements[index],
                children,
                incompressible: true,
                collapsible: element.collapsible,
                collapsed: element.collapsed
            };
        }
        return {
            element: element.element.elements[index],
            children,
            collapsible: element.collapsible,
            collapsed: element.collapsed
        };
    }
    // Exported only for test reasons, do not use directly
    function decompress(element) {
        return _decompress(element, 0);
    }
    exports.decompress = decompress;
    function splice(treeElement, element, children) {
        if (treeElement.element === element) {
            return { ...treeElement, children };
        }
        return { ...treeElement, children: iterator_1.Iterable.map(iterator_1.Iterable.from(treeElement.children), e => splice(e, element, children)) };
    }
    const wrapIdentityProvider = (base) => ({
        getId(node) {
            return node.elements.map(e => base.getId(e).toString()).join('\0');
        }
    });
    // Exported only for test reasons, do not use directly
    class CompressedObjectTreeModel {
        get onDidSplice() { return this.model.onDidSplice; }
        get onDidChangeCollapseState() { return this.model.onDidChangeCollapseState; }
        get onDidChangeRenderNodeCount() { return this.model.onDidChangeRenderNodeCount; }
        get size() { return this.nodes.size; }
        constructor(user, list, options = {}) {
            this.user = user;
            this.rootRef = null;
            this.nodes = new Map();
            this.model = new objectTreeModel_1.ObjectTreeModel(user, list, options);
            this.enabled = typeof options.compressionEnabled === 'undefined' ? true : options.compressionEnabled;
            this.identityProvider = options.identityProvider;
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options) {
            // Diffs must be deep, since the compression can affect nested elements.
            // @see https://github.com/microsoft/vscode/pull/114237#issuecomment-759425034
            const diffIdentityProvider = options.diffIdentityProvider && wrapIdentityProvider(options.diffIdentityProvider);
            if (element === null) {
                const compressedChildren = iterator_1.Iterable.map(children, this.enabled ? compress : noCompress);
                this._setChildren(null, compressedChildren, { diffIdentityProvider, diffDepth: Infinity });
                return;
            }
            const compressedNode = this.nodes.get(element);
            if (!compressedNode) {
                throw new tree_1.TreeError(this.user, 'Unknown compressed tree node');
            }
            const node = this.model.getNode(compressedNode);
            const compressedParentNode = this.model.getParentNodeLocation(compressedNode);
            const parent = this.model.getNode(compressedParentNode);
            const decompressedElement = decompress(node);
            const splicedElement = splice(decompressedElement, element, children);
            const recompressedElement = (this.enabled ? compress : noCompress)(splicedElement);
            // If the recompressed node is identical to the original, just set its children.
            // Saves work and churn diffing the parent element.
            const elementComparator = options.diffIdentityProvider
                ? ((a, b) => options.diffIdentityProvider.getId(a) === options.diffIdentityProvider.getId(b))
                : undefined;
            if ((0, arrays_1.equals)(recompressedElement.element.elements, node.element.elements, elementComparator)) {
                this._setChildren(compressedNode, recompressedElement.children || iterator_1.Iterable.empty(), { diffIdentityProvider, diffDepth: 1 });
                return;
            }
            const parentChildren = parent.children
                .map(child => child === node ? recompressedElement : child);
            this._setChildren(parent.element, parentChildren, {
                diffIdentityProvider,
                diffDepth: node.depth - parent.depth,
            });
        }
        isCompressionEnabled() {
            return this.enabled;
        }
        setCompressionEnabled(enabled) {
            if (enabled === this.enabled) {
                return;
            }
            this.enabled = enabled;
            const root = this.model.getNode();
            const rootChildren = root.children;
            const decompressedRootChildren = iterator_1.Iterable.map(rootChildren, decompress);
            const recompressedRootChildren = iterator_1.Iterable.map(decompressedRootChildren, enabled ? compress : noCompress);
            // it should be safe to always use deep diff mode here if an identity
            // provider is available, since we know the raw nodes are unchanged.
            this._setChildren(null, recompressedRootChildren, {
                diffIdentityProvider: this.identityProvider,
                diffDepth: Infinity,
            });
        }
        _setChildren(node, children, options) {
            const insertedElements = new Set();
            const onDidCreateNode = (node) => {
                for (const element of node.element.elements) {
                    insertedElements.add(element);
                    this.nodes.set(element, node.element);
                }
            };
            const onDidDeleteNode = (node) => {
                for (const element of node.element.elements) {
                    if (!insertedElements.has(element)) {
                        this.nodes.delete(element);
                    }
                }
            };
            this.model.setChildren(node, children, { ...options, onDidCreateNode, onDidDeleteNode });
        }
        has(element) {
            return this.nodes.has(element);
        }
        getListIndex(location) {
            const node = this.getCompressedNode(location);
            return this.model.getListIndex(node);
        }
        getListRenderCount(location) {
            const node = this.getCompressedNode(location);
            return this.model.getListRenderCount(node);
        }
        getNode(location) {
            if (typeof location === 'undefined') {
                return this.model.getNode();
            }
            const node = this.getCompressedNode(location);
            return this.model.getNode(node);
        }
        // TODO: review this
        getNodeLocation(node) {
            const compressedNode = this.model.getNodeLocation(node);
            if (compressedNode === null) {
                return null;
            }
            return compressedNode.elements[compressedNode.elements.length - 1];
        }
        // TODO: review this
        getParentNodeLocation(location) {
            const compressedNode = this.getCompressedNode(location);
            const parentNode = this.model.getParentNodeLocation(compressedNode);
            if (parentNode === null) {
                return null;
            }
            return parentNode.elements[parentNode.elements.length - 1];
        }
        getFirstElementChild(location) {
            const compressedNode = this.getCompressedNode(location);
            return this.model.getFirstElementChild(compressedNode);
        }
        getLastElementAncestor(location) {
            const compressedNode = typeof location === 'undefined' ? undefined : this.getCompressedNode(location);
            return this.model.getLastElementAncestor(compressedNode);
        }
        isCollapsible(location) {
            const compressedNode = this.getCompressedNode(location);
            return this.model.isCollapsible(compressedNode);
        }
        setCollapsible(location, collapsible) {
            const compressedNode = this.getCompressedNode(location);
            return this.model.setCollapsible(compressedNode, collapsible);
        }
        isCollapsed(location) {
            const compressedNode = this.getCompressedNode(location);
            return this.model.isCollapsed(compressedNode);
        }
        setCollapsed(location, collapsed, recursive) {
            const compressedNode = this.getCompressedNode(location);
            return this.model.setCollapsed(compressedNode, collapsed, recursive);
        }
        expandTo(location) {
            const compressedNode = this.getCompressedNode(location);
            this.model.expandTo(compressedNode);
        }
        rerender(location) {
            const compressedNode = this.getCompressedNode(location);
            this.model.rerender(compressedNode);
        }
        updateElementHeight(element, height) {
            const compressedNode = this.getCompressedNode(element);
            if (!compressedNode) {
                return;
            }
            this.model.updateElementHeight(compressedNode, height);
        }
        refilter() {
            this.model.refilter();
        }
        resort(location = null, recursive = true) {
            const compressedNode = this.getCompressedNode(location);
            this.model.resort(compressedNode, recursive);
        }
        getCompressedNode(element) {
            if (element === null) {
                return null;
            }
            const node = this.nodes.get(element);
            if (!node) {
                throw new tree_1.TreeError(this.user, `Tree element not found: ${element}`);
            }
            return node;
        }
    }
    exports.CompressedObjectTreeModel = CompressedObjectTreeModel;
    const DefaultElementMapper = elements => elements[elements.length - 1];
    exports.DefaultElementMapper = DefaultElementMapper;
    class CompressedTreeNodeWrapper {
        get element() { return this.node.element === null ? null : this.unwrapper(this.node.element); }
        get children() { return this.node.children.map(node => new CompressedTreeNodeWrapper(this.unwrapper, node)); }
        get depth() { return this.node.depth; }
        get visibleChildrenCount() { return this.node.visibleChildrenCount; }
        get visibleChildIndex() { return this.node.visibleChildIndex; }
        get collapsible() { return this.node.collapsible; }
        get collapsed() { return this.node.collapsed; }
        get visible() { return this.node.visible; }
        get filterData() { return this.node.filterData; }
        constructor(unwrapper, node) {
            this.unwrapper = unwrapper;
            this.node = node;
        }
    }
    function mapList(nodeMapper, list) {
        return {
            splice(start, deleteCount, toInsert) {
                list.splice(start, deleteCount, toInsert.map(node => nodeMapper.map(node)));
            },
            updateElementHeight(index, height) {
                list.updateElementHeight(index, height);
            }
        };
    }
    function mapOptions(compressedNodeUnwrapper, options) {
        return {
            ...options,
            identityProvider: options.identityProvider && {
                getId(node) {
                    return options.identityProvider.getId(compressedNodeUnwrapper(node));
                }
            },
            sorter: options.sorter && {
                compare(node, otherNode) {
                    return options.sorter.compare(node.elements[0], otherNode.elements[0]);
                }
            },
            filter: options.filter && {
                filter(node, parentVisibility) {
                    return options.filter.filter(compressedNodeUnwrapper(node), parentVisibility);
                }
            }
        };
    }
    class CompressibleObjectTreeModel {
        get onDidSplice() {
            return event_1.Event.map(this.model.onDidSplice, ({ insertedNodes, deletedNodes }) => ({
                insertedNodes: insertedNodes.map(node => this.nodeMapper.map(node)),
                deletedNodes: deletedNodes.map(node => this.nodeMapper.map(node)),
            }));
        }
        get onDidChangeCollapseState() {
            return event_1.Event.map(this.model.onDidChangeCollapseState, ({ node, deep }) => ({
                node: this.nodeMapper.map(node),
                deep
            }));
        }
        get onDidChangeRenderNodeCount() {
            return event_1.Event.map(this.model.onDidChangeRenderNodeCount, node => this.nodeMapper.map(node));
        }
        constructor(user, list, options = {}) {
            this.rootRef = null;
            this.elementMapper = options.elementMapper || exports.DefaultElementMapper;
            const compressedNodeUnwrapper = node => this.elementMapper(node.elements);
            this.nodeMapper = new tree_1.WeakMapper(node => new CompressedTreeNodeWrapper(compressedNodeUnwrapper, node));
            this.model = new CompressedObjectTreeModel(user, mapList(this.nodeMapper, list), mapOptions(compressedNodeUnwrapper, options));
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options = {}) {
            this.model.setChildren(element, children, options);
        }
        isCompressionEnabled() {
            return this.model.isCompressionEnabled();
        }
        setCompressionEnabled(enabled) {
            this.model.setCompressionEnabled(enabled);
        }
        has(location) {
            return this.model.has(location);
        }
        getListIndex(location) {
            return this.model.getListIndex(location);
        }
        getListRenderCount(location) {
            return this.model.getListRenderCount(location);
        }
        getNode(location) {
            return this.nodeMapper.map(this.model.getNode(location));
        }
        getNodeLocation(node) {
            return node.element;
        }
        getParentNodeLocation(location) {
            return this.model.getParentNodeLocation(location);
        }
        getFirstElementChild(location) {
            const result = this.model.getFirstElementChild(location);
            if (result === null || typeof result === 'undefined') {
                return result;
            }
            return this.elementMapper(result.elements);
        }
        getLastElementAncestor(location) {
            const result = this.model.getLastElementAncestor(location);
            if (result === null || typeof result === 'undefined') {
                return result;
            }
            return this.elementMapper(result.elements);
        }
        isCollapsible(location) {
            return this.model.isCollapsible(location);
        }
        setCollapsible(location, collapsed) {
            return this.model.setCollapsible(location, collapsed);
        }
        isCollapsed(location) {
            return this.model.isCollapsed(location);
        }
        setCollapsed(location, collapsed, recursive) {
            return this.model.setCollapsed(location, collapsed, recursive);
        }
        expandTo(location) {
            return this.model.expandTo(location);
        }
        rerender(location) {
            return this.model.rerender(location);
        }
        updateElementHeight(element, height) {
            this.model.updateElementHeight(element, height);
        }
        refilter() {
            return this.model.refilter();
        }
        resort(element = null, recursive = true) {
            return this.model.resort(element, recursive);
        }
        getCompressedTreeNode(location = null) {
            return this.model.getNode(location);
        }
    }
    exports.CompressibleObjectTreeModel = CompressibleObjectTreeModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHJlc3NlZE9iamVjdFRyZWVNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3RyZWUvY29tcHJlc3NlZE9iamVjdFRyZWVNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFzQmhHLFNBQVMsVUFBVSxDQUFJLE9BQWtDO1FBQ3hELE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLElBQUksS0FBSyxDQUFDO1FBRXZELE9BQU87WUFDTixPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFO1lBQ3JDLFFBQVEsRUFBRSxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxtQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsVUFBVSxDQUFDO1lBQ25FLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztZQUNoQyxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7U0FDNUIsQ0FBQztJQUNILENBQUM7SUFFRCxzREFBc0Q7SUFDdEQsU0FBZ0IsUUFBUSxDQUFJLE9BQWtDO1FBQzdELE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLElBQUksS0FBSyxDQUFDO1FBRXZELElBQUksZ0JBQXFELENBQUM7UUFDMUQsSUFBSSxRQUFxQyxDQUFDO1FBRTFDLE9BQU8sSUFBSSxFQUFFLENBQUM7WUFDYixDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLG1CQUFRLENBQUMsT0FBTyxDQUFDLG1CQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMs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