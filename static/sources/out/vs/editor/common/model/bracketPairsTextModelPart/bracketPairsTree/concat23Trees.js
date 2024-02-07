/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./ast"], function (require, exports, ast_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.concat23TreesOfSameHeight = exports.concat23Trees = void 0;
    /**
     * Concatenates a list of (2,3) AstNode's into a single (2,3) AstNode.
     * This mutates the items of the input array!
     * If all items have the same height, this method has runtime O(items.length).
     * Otherwise, it has runtime O(items.length * max(log(items.length), items.max(i => i.height))).
    */
    function concat23Trees(items) {
        if (items.length === 0) {
            return null;
        }
        if (items.length === 1) {
            return items[0];
        }
        let i = 0;
        /**
         * Reads nodes of same height and concatenates them to a single node.
        */
        function readNode() {
            if (i >= items.length) {
                return null;
            }
            const start = i;
            const height = items[start].listHeight;
            i++;
            while (i < items.length && items[i].listHeight === height) {
                i++;
            }
            if (i - start >= 2) {
                return concat23TreesOfSameHeight(start === 0 && i === items.length ? items : items.slice(start, i), false);
            }
            else {
                return items[start];
            }
        }
        // The items might not have the same height.
        // We merge all items by using a binary concat operator.
        let first = readNode(); // There must be a first item
        let second = readNode();
        if (!second) {
            return first;
        }
        for (let item = readNode(); item; item = readNode()) {
            // Prefer concatenating smaller trees, as the runtime of concat depends on the tree height.
            if (heightDiff(first, second) <= heightDiff(second, item)) {
                first = concat(first, second);
                second = item;
            }
            else {
                second = concat(second, item);
            }
        }
        const result = concat(first, second);
        return result;
    }
    exports.concat23Trees = concat23Trees;
    function concat23TreesOfSameHeight(items, createImmutableLists = false) {
        if (items.length === 0) {
            return null;
        }
        if (items.length === 1) {
            return items[0];
        }
        let length = items.length;
        // All trees have same height, just create parent nodes.
        while (length > 3) {
            const newLength = length >> 1;
            for (let i = 0; i < newLength; i++) {
                const j = i << 1;
                items[i] = ast_1.ListAstNode.create23(items[j], items[j + 1], j + 3 === length ? items[j + 2] : null, createImmutableLists);
            }
            length = newLength;
        }
        return ast_1.ListAstNode.create23(items[0], items[1], length >= 3 ? items[2] : null, createImmutableLists);
    }
    exports.concat23TreesOfSameHeight = concat23TreesOfSameHeight;
    function heightDiff(node1, node2) {
        return Math.abs(node1.listHeight - node2.listHeight);
    }
    function concat(node1, node2) {
        if (node1.listHeight === node2.listHeight) {
            return ast_1.ListAstNode.create23(node1, node2, null, false);
        }
        else if (node1.listHeight > node2.listHeight) {
            // node1 is the tree we want to insert into
            return append(node1, node2);
        }
        else {
            return prepend(node2, node1);
        }
    }
    /**
     * Appends the given node to the end of this (2,3) tree.
     * Returns the new root.
    */
    function append(list, nodeToAppend) {
        list = list.toMutable();
        let curNode = list;
        const parents = [];
        let nodeToAppendOfCorrectHeight;
        while (true) {
            // assert nodeToInsert.listHeight <= curNode.listHeight
            if (nodeToAppend.listHeight === curNode.listHeight) {
                nodeToAppendOfCorrectHeight = nodeToAppend;
                break;
            }
            // assert 0 <= nodeToInsert.listHeight < curNode.listHeight
            if (curNode.kind !== 4 /* AstNodeKind.List */) {
                throw new Error('unexpected');
            }
            parents.push(curNode);
            // assert 2 <= curNode.childrenLength <= 3
            curNode = curNode.makeLastElementMutable();
        }
        // assert nodeToAppendOfCorrectHeight!.listHeight === curNode.listHeight
        for (let i = parents.length - 1; i >= 0; i--) {
            const parent = parents[i];
            if (nodeToAppendOfCorrectHeight) {
                // Can we take the element?
                if (parent.childrenLength >= 3) {
                    // assert parent.childrenLength === 3 && parent.listHeight === nodeToAppendOfCorrectHeight.listHeight + 1
                    // we need to split to maintain (2,3)-tree property.
                    // Send the third element + the new element to the parent.
                    nodeToAppendOfCorrectHeight = ast_1.ListAstNode.create23(parent.unappendChild(), nodeToAppendOfCorrectHeight, null, false);
                }
                else {
                    parent.appendChildOfSameHeight(nodeToAppendOfCorrectHeight);
                    nodeToAppendOfCorrectHeight = undefined;
                }
            }
            else {
                parent.handleChildrenChanged();
            }
        }
        if (nodeToAppendOfCorrectHeight) {
            return ast_1.ListAstNode.create23(list, nodeToAppendOfCorrectHeight, null, false);
        }
        else {
            return list;
        }
    }
    /**
     * Prepends the given node to the end of this (2,3) tree.
     * Returns the new root.
    */
    function prepend(list, nodeToAppend) {
        list = list.toMutable();
        let curNode = list;
        const parents = [];
        // assert nodeToInsert.listHeight <= curNode.listHeight
        while (nodeToAppend.listHeight !== curNode.listHeight) {
            // assert 0 <= nodeToInsert.listHeight < curNode.listHeight
            if (curNode.kind !== 4 /* AstNodeKind.List */) {
                throw new Error('unexpected');
            }
            parents.push(curNode);
            // assert 2 <= curNode.childrenFast.length <= 3
            curNode = curNode.makeFirstElementMutable();
        }
        let nodeToPrependOfCorrectHeight = nodeToAppend;
        // assert nodeToAppendOfCorrectHeight!.listHeight === curNode.listHeight
        for (let i = parents.length - 1; i >= 0; i--) {
            const parent = parents[i];
            if (nodeToPrependOfCorrectHeight) {
                // Can we take the element?
                if (parent.childrenLength >= 3) {
                    // assert parent.childrenLength === 3 && parent.listHeight === nodeToAppendOfCorrectHeight.listHeight + 1
                    // we need to split to maintain (2,3)-tree property.
                    // Send the third element + the new element to the parent.
                    nodeToPrependOfCorrectHeight = ast_1.ListAstNode.create23(nodeToPrependOfCorrectHeight, parent.unprependChild(), null, false);
                }
                else {
                    parent.prependChildOfSameHeight(nodeToPrependOfCorrectHeight);
                    nodeToPrependOfCorrectHeight = undefined;
                }
            }
            else {
                parent.handleChildrenChanged();
            }
        }
        if (nodeToPrependOfCorrectHeight) {
            return ast_1.ListAstNode.create23(nodeToPrependOfCorrectHeight, list, null, false);
        }
        else {
            return list;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uY2F0MjNUcmVlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC9icmFja2V0UGFpcnNUZXh0TW9kZWxQYXJ0L2JyYWNrZXRQYWlyc1RyZWUvY29uY2F0MjNUcmVlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEc7Ozs7O01BS0U7SUFDRixTQUFnQixhQUFhLENBQUMsS0FBZ0I7UUFDN0MsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNELElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN4QixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDO1FBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1Y7O1VBRUU7UUFDRixTQUFTLFFBQVE7WUFDaEIsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN2QixPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDaEIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUV2QyxDQUFDLEVBQUUsQ0FBQztZQUNKLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxNQUFNLEVBQUUsQ0FBQztnQkFDM0QsQ0FBQyxFQUFFLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNwQixPQUFPLHlCQUF5QixDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksQ0FB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