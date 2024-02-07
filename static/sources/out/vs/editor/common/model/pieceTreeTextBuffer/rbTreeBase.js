/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.recomputeTreeMetadata = exports.updateTreeMetadata = exports.fixInsert = exports.rbDelete = exports.rightRotate = exports.leftRotate = exports.righttest = exports.leftest = exports.SENTINEL = exports.NodeColor = exports.TreeNode = void 0;
    class TreeNode {
        constructor(piece, color) {
            this.piece = piece;
            this.color = color;
            this.size_left = 0;
            this.lf_left = 0;
            this.parent = this;
            this.left = this;
            this.right = this;
        }
        next() {
            if (this.right !== exports.SENTINEL) {
                return leftest(this.right);
            }
            let node = this;
            while (node.parent !== exports.SENTINEL) {
                if (node.parent.left === node) {
                    break;
                }
                node = node.parent;
            }
            if (node.parent === exports.SENTINEL) {
                return exports.SENTINEL;
            }
            else {
                return node.parent;
            }
        }
        prev() {
            if (this.left !== exports.SENTINEL) {
                return righttest(this.left);
            }
            let node = this;
            while (node.parent !== exports.SENTINEL) {
                if (node.parent.right === node) {
                    break;
                }
                node = node.parent;
            }
            if (node.parent === exports.SENTINEL) {
                return exports.SENTINEL;
            }
            else {
                return node.parent;
            }
        }
        detach() {
            this.parent = null;
            this.left = null;
            this.right = null;
        }
    }
    exports.TreeNode = TreeNode;
    var NodeColor;
    (function (NodeColor) {
        NodeColor[NodeColor["Black"] = 0] = "Black";
        NodeColor[NodeColor["Red"] = 1] = "Red";
    })(NodeColor || (exports.NodeColor = NodeColor = {}));
    exports.SENTINEL = new TreeNode(null, 0 /* NodeColor.Black */);
    exports.SENTINEL.parent = exports.SENTINEL;
    exports.SENTINEL.left = exports.SENTINEL;
    exports.SENTINEL.right = exports.SENTINEL;
    exports.SENTINEL.color = 0 /* NodeColor.Black */;
    function leftest(node) {
        while (node.left !== exports.SENTINEL) {
            node = node.left;
        }
        return node;
    }
    exports.leftest = leftest;
    function righttest(node) {
        while (node.right !== exports.SENTINEL) {
            node = node.right;
        }
        return node;
    }
    exports.righttest = righttest;
    function calculateSize(node) {
        if (node === exports.SENTINEL) {
            return 0;
        }
        return node.size_left + node.piece.length + calculateSize(node.right);
    }
    function calculateLF(node) {
        if (node === exports.SENTINEL) {
            return 0;
        }
        return node.lf_left + node.piece.lineFeedCnt + calculateLF(node.right);
    }
    function resetSentinel() {
        exports.SENTINEL.parent = exports.SENTINEL;
    }
    function leftRotate(tree, x) {
        const y = x.right;
        // fix size_left
        y.size_left += x.size_left + (x.piece ? x.piece.length : 0);
        y.lf_left += x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
        x.right = y.left;
        if (y.left !== exports.SENTINEL) {
            y.left.parent = x;
        }
        y.parent = x.parent;
        if (x.parent === exports.SENTINEL) {
            tree.root = y;
        }
        else if (x.parent.left === x) {
            x.parent.left = y;
        }
        else {
            x.parent.right = y;
        }
        y.left = x;
        x.parent = y;
    }
    exports.leftRotate = leftRotate;
    function rightRotate(tree, y) {
        const x = y.left;
        y.left = x.right;
        if (x.right !== exports.SENTINEL) {
            x.right.parent = y;
        }
        x.parent = y.parent;
        // fix size_left
        y.size_left -= x.size_left + (x.piece ? x.piece.length : 0);
        y.lf_left -= x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
        if (y.parent === exports.SENTINEL) {
            tree.root = x;
        }
        else if (y === y.parent.right) {
            y.parent.right = x;
        }
        else {
            y.parent.left = x;
        }
        x.right = y;
        y.parent = x;
    }
    exports.rightRotate = rightRotate;
    function rbDelete(tree, z) {
        let x;
        let y;
        if (z.left === exports.SENTINEL) {
            y = z;
            x = y.right;
        }
        else if (z.right === exports.SENTINEL) {
            y = z;
            x = y.left;
        }
        else {
            y = leftest(z.right);
            x = y.right;
        }
        if (y === tree.root) {
            tree.root = x;
            // if x is null, we are removing the only node
            x.color = 0 /* NodeColor.Black */;
            z.detach();
            resetSentinel();
            tree.root.parent = exports.SENTINEL;
            return;
        }
        const yWasRed = (y.color === 1 /* NodeColor.Red */);
        if (y === y.parent.left) {
            y.parent.left = x;
        }
        else {
            y.parent.right = x;
        }
        if (y === z) {
            x.parent = y.parent;
            recomputeTreeMetadata(tree, x);
        }
        else {
            if (y.parent === z) {
                x.parent = y;
            }
            else {
                x.parent = y.parent;
            }
            // as we make changes to x's hierarchy, update size_left of subtree first
            recomputeTreeMetadata(tree, x);
            y.left = z.left;
            y.right = z.right;
            y.parent = z.parent;
            y.color = z.color;
            if (z === tree.root) {
                tree.root = y;
            }
            else {
                if (z === z.parent.left) {
                    z.parent.left = y;
                }
                else {
                    z.parent.right = y;
                }
            }
            if (y.left !== exports.SENTINEL) {
                y.left.parent = y;
            }
            if (y.right !== exports.SENTINEL) {
                y.right.parent = y;
            }
            // update metadata
            // we replace z with y, so in this sub tree, the length change is z.item.length
            y.size_left = z.size_left;
            y.lf_left = z.lf_left;
            recomputeTreeMetadata(tree, y);
        }
        z.detach();
        if (x.parent.left === x) {
            const newSizeLeft = calculateSize(x);
            const newLFLeft = calculateLF(x);
            if (newSizeLeft !== x.parent.size_left || newLFLeft !== x.parent.lf_left) {
                const delta = newSizeLeft - x.parent.size_left;
                const lf_delta = newLFLeft - x.parent.lf_left;
                x.parent.size_left = newSizeLeft;
                x.parent.lf_left = newLFLeft;
                updateTreeMetadata(tree, x.parent, delta, lf_delta);
            }
        }
        recomputeTreeMetadata(tree, x.parent);
        if (yWasRed) {
            resetSentinel();
            return;
        }
        // RB-DELETE-FIXUP
        let w;
        while (x !== tree.root && x.color === 0 /* NodeColor.Black */) {
            if (x === x.parent.left) {
                w = x.parent.right;
                if (w.color === 1 /* NodeColor.Red */) {
                    w.color = 0 /* NodeColor.Black */;
                    x.parent.color = 1 /* NodeColor.Red */;
                    leftRotate(tree, x.parent);
                    w = x.parent.right;
                }
                if (w.left.color === 0 /* NodeColor.Black */ && w.right.color === 0 /* NodeColor.Black */) {
                    w.color = 1 /* NodeColor.Red */;
                    x = x.parent;
                }
                else {
                    if (w.right.color === 0 /* NodeColor.Black */) {
                        w.left.color = 0 /* NodeColor.Black */;
                        w.color = 1 /* NodeColor.Red */;
                        rightRotate(tree, w);
                        w = x.parent.right;
                    }
                    w.color = x.parent.color;
                    x.parent.color = 0 /* NodeColor.Black */;
                    w.right.color = 0 /* NodeColor.Black */;
                    leftRotate(tree, x.parent);
                    x = tree.root;
                }
            }
            else {
                w = x.parent.left;
                if (w.color === 1 /* NodeColor.Red */) {
                    w.color = 0 /* NodeColor.Black */;
                    x.parent.color = 1 /* NodeColor.Red */;
                    rightRotate(tree, x.parent);
                    w = x.parent.left;
                }
                if (w.left.color === 0 /* NodeColor.Black */ && w.right.color === 0 /* NodeColor.Black */) {
                    w.color = 1 /* NodeColor.Red */;
                    x = x.parent;
                }
                else {
                    if (w.left.color === 0 /* NodeColor.Black */) {
                        w.right.color = 0 /* NodeColor.Black */;
                        w.color = 1 /* NodeColor.Red */;
                        leftRotate(tree, w);
                        w = x.parent.left;
                    }
                    w.color = x.parent.color;
                    x.parent.color = 0 /* NodeColor.Black */;
                    w.left.color = 0 /* NodeColor.Black */;
                    rightRotate(tree, x.parent);
                    x = tree.root;
                }
            }
        }
        x.color = 0 /* NodeColor.Black */;
        resetSentinel();
    }
    exports.rbDelete = rbDelete;
    function fixInsert(tree, x) {
        recomputeTreeMetadata(tree, x);
        while (x !== tree.root && x.parent.color === 1 /* NodeColor.Red */) {
            if (x.parent === x.parent.parent.left) {
                const y = x.parent.parent.right;
                if (y.color === 1 /* NodeColor.Red */) {
                    x.parent.color = 0 /* NodeColor.Black */;
                    y.color = 0 /* NodeColor.Black */;
                    x.parent.parent.color = 1 /* NodeColor.Red */;
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.right) {
                        x = x.parent;
                        leftRotate(tree, x);
                    }
                    x.parent.color = 0 /* NodeColor.Black */;
                    x.parent.parent.color = 1 /* NodeColor.Red */;
                    rightRotate(tree, x.parent.parent);
                }
            }
            else {
                const y = x.parent.parent.left;
                if (y.color === 1 /* NodeColor.Red */) {
                    x.parent.color = 0 /* NodeColor.Black */;
                    y.color = 0 /* NodeColor.Black */;
                    x.parent.parent.color = 1 /* NodeColor.Red */;
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.left) {
                        x = x.parent;
                        rightRotate(tree, x);
                    }
                    x.parent.color = 0 /* NodeColor.Black */;
                    x.parent.parent.color = 1 /* NodeColor.Red */;
                    leftRotate(tree, x.parent.parent);
                }
            }
        }
        tree.root.color = 0 /* NodeColor.Black */;
    }
    exports.fixInsert = fixInsert;
    function updateTreeMetadata(tree, x, delta, lineFeedCntDelta) {
        // node length change or line feed count change
        while (x !== tree.root && x !== exports.SENTINEL) {
            if (x.parent.left === x) {
                x.parent.size_left += delta;
                x.parent.lf_left += lineFeedCntDelta;
            }
            x = x.parent;
        }
    }
    exports.updateTreeMetadata = updateTreeMetadata;
    function recomputeTreeMetadata(tree, x) {
        let delta = 0;
        let lf_delta = 0;
        if (x === tree.root) {
            return;
        }
        // go upwards till the node whose left subtree is changed.
        while (x !== tree.root && x === x.parent.right) {
            x = x.parent;
        }
        if (x === tree.root) {
            // well, it means we add a node to the end (inorder)
            return;
        }
        // x is the node whose right subtree is changed.
        x = x.parent;
        delta = calculateSize(x.left) - x.size_left;
        lf_delta = calculateLF(x.left) - x.lf_left;
        x.size_left += delta;
        x.lf_left += lf_delta;
        // go upwards till root. O(logN)
        while (x !== tree.root && (delta !== 0 || lf_delta !== 0)) {
            if (x.parent.left === x) {
                x.parent.size_left += delta;
                x.parent.lf_left += lf_delta;
            }
            x = x.parent;
        }
    }
    exports.recomputeTreeMetadata = recomputeTreeMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmJUcmVlQmFzZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC9waWVjZVRyZWVUZXh0QnVmZmVyL3JiVHJlZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLE1BQWEsUUFBUTtRQVdwQixZQUFZLEtBQVksRUFBRSxLQUFnQjtZQUN6QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNuQixDQUFDO1FBRU0sSUFBSTtZQUNWLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxnQkFBUSxFQUFFLENBQUM7Z0JBQzdCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QixDQUFDO1lBRUQsSUFBSSxJQUFJLEdBQWEsSUFBSSxDQUFDO1lBRTFCLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxnQkFBUSxFQUFFLENBQUM7Z0JBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQy9CLE1BQU07Z0JBQ1AsQ0FBQztnQkFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNwQixDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLGdCQUFRLEVBQUUsQ0FBQztnQkFDOUIsT0FBTyxnQkFBUSxDQUFDO1lB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