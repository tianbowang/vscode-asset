/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator"], function (require, exports, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WellDefinedPrefixTree = void 0;
    const unset = Symbol('unset');
    /**
     * A simple prefix tree implementation where a value is stored based on
     * well-defined prefix segments.
     */
    class WellDefinedPrefixTree {
        constructor() {
            this.root = new Node();
            this._size = 0;
        }
        get size() {
            return this._size;
        }
        /** Gets the top-level nodes of the tree */
        get nodes() {
            return this.root.children?.values() || iterator_1.Iterable.empty();
        }
        /**
         * Inserts a new value in the prefix tree.
         * @param onNode - called for each node as we descend to the insertion point,
         * including the insertion point itself.
         */
        insert(key, value, onNode) {
            this.opNode(key, n => n._value = value, onNode);
        }
        /** Mutates a value in the prefix tree. */
        mutate(key, mutate) {
            this.opNode(key, n => n._value = mutate(n._value === unset ? undefined : n._value));
        }
        /** Deletes a node from the prefix tree, returning the value it contained. */
        delete(key) {
            const path = [{ part: '', node: this.root }];
            let i = 0;
            for (const part of key) {
                const node = path[i].node.children?.get(part);
                if (!node) {
                    return undefined; // node not in tree
                }
                path.push({ part, node });
                i++;
            }
            const value = path[i].node._value;
            if (value === unset) {
                return; // not actually a real node
            }
            this._size--;
            for (; i > 0; i--) {
                const parent = path[i - 1];
                parent.node.children.delete(path[i].part);
                if (parent.node.children.size > 0 || parent.node._value !== unset) {
                    break;
                }
            }
            return value;
        }
        /** Gets a value from the tree. */
        find(key) {
            let node = this.root;
            for (const segment of key) {
                const next = node.children?.get(segment);
                if (!next) {
                    return undefined;
                }
                node = next;
            }
            return node._value === unset ? undefined : node._value;
        }
        /** Gets whether the tree has the key, or a parent of the key, already inserted. */
        hasKeyOrParent(key) {
            let node = this.root;
            for (const segment of key) {
                const next = node.children?.get(segment);
                if (!next) {
                    return false;
                }
                if (next._value !== unset) {
                    return true;
                }
                node = next;
            }
            return false;
        }
        /** Gets whether the tree has the given key or any children. */
        hasKeyOrChildren(key) {
            let node = this.root;
            for (const segment of key) {
                const next = node.children?.get(segment);
                if (!next) {
                    return false;
                }
                node = next;
            }
            return true;
        }
        /** Gets whether the tree has the given key. */
        hasKey(key) {
            let node = this.root;
            for (const segment of key) {
                const next = node.children?.get(segment);
                if (!next) {
                    return false;
                }
                node = next;
            }
            return node._value !== unset;
        }
        opNode(key, fn, onDescend) {
            let node = this.root;
            for (const part of key) {
                if (!node.children) {
                    const next = new Node();
                    node.children = new Map([[part, next]]);
                    node = next;
                }
                else if (!node.children.has(part)) {
                    const next = new Node();
                    node.children.set(part, next);
                    node = next;
                }
                else {
                    node = node.children.get(part);
                }
                onDescend?.(node);
            }
            if (node._value === unset) {
                this._size++;
            }
            fn(node);
        }
        /** Returns an iterable of the tree values in no defined order. */
        *values() {
            const stack = [this.root];
            while (stack.length > 0) {
                const node = stack.pop();
                if (node._value !== unset) {
                    yield node._value;
                }
                if (node.children) {
                    for (const child of node.children.values()) {
                        stack.push(child);
                    }
                }
            }
        }
    }
    exports.WellDefinedPrefixTree = WellDefinedPrefixTree;
    class Node {
        constructor() {
            this._value = unset;
        }
        get value() {
            return this._value === unset ? undefined : this._value;
        }
        set value(value) {
            this._value = value === undefined ? unset : value;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4VHJlZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vcHJlZml4VHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBVTlCOzs7T0FHRztJQUNILE1BQWEscUJBQXFCO1FBQWxDO1lBQ2tCLFNBQUksR0FBRyxJQUFJLElBQUksRUFBSyxDQUFDO1lBQzlCLFVBQUssR0FBRyxDQUFDLENBQUM7UUErSm5CLENBQUM7UUE3SkEsSUFBVyxJQUFJO1lBQ2QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFRCwyQ0FBMkM7UUFDM0MsSUFBVyxLQUFLO1lBQ2YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxtQkFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3pELENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsTUFBTSxDQUFDLEdBQXFCLEVBQUUsS0FBUSxFQUFFLE1BQXdDO1lBQy9FLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVELDBDQUEwQztRQUMxQyxNQUFNLENBQUMsR0FBcUIsRUFBRSxNQUF3QjtZQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FB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