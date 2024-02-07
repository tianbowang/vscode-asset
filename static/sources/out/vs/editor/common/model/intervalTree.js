/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.intervalCompare = exports.recomputeMaxEnd = exports.nodeAcceptEdit = exports.IntervalTree = exports.SENTINEL = exports.IntervalNode = exports.setNodeStickiness = exports.getNodeColor = exports.NodeColor = exports.ClassName = void 0;
    //
    // The red-black tree is based on the "Introduction to Algorithms" by Cormen, Leiserson and Rivest.
    //
    var ClassName;
    (function (ClassName) {
        ClassName["EditorHintDecoration"] = "squiggly-hint";
        ClassName["EditorInfoDecoration"] = "squiggly-info";
        ClassName["EditorWarningDecoration"] = "squiggly-warning";
        ClassName["EditorErrorDecoration"] = "squiggly-error";
        ClassName["EditorUnnecessaryDecoration"] = "squiggly-unnecessary";
        ClassName["EditorUnnecessaryInlineDecoration"] = "squiggly-inline-unnecessary";
        ClassName["EditorDeprecatedInlineDecoration"] = "squiggly-inline-deprecated";
    })(ClassName || (exports.ClassName = ClassName = {}));
    var NodeColor;
    (function (NodeColor) {
        NodeColor[NodeColor["Black"] = 0] = "Black";
        NodeColor[NodeColor["Red"] = 1] = "Red";
    })(NodeColor || (exports.NodeColor = NodeColor = {}));
    var Constants;
    (function (Constants) {
        Constants[Constants["ColorMask"] = 1] = "ColorMask";
        Constants[Constants["ColorMaskInverse"] = 254] = "ColorMaskInverse";
        Constants[Constants["ColorOffset"] = 0] = "ColorOffset";
        Constants[Constants["IsVisitedMask"] = 2] = "IsVisitedMask";
        Constants[Constants["IsVisitedMaskInverse"] = 253] = "IsVisitedMaskInverse";
        Constants[Constants["IsVisitedOffset"] = 1] = "IsVisitedOffset";
        Constants[Constants["IsForValidationMask"] = 4] = "IsForValidationMask";
        Constants[Constants["IsForValidationMaskInverse"] = 251] = "IsForValidationMaskInverse";
        Constants[Constants["IsForValidationOffset"] = 2] = "IsForValidationOffset";
        Constants[Constants["StickinessMask"] = 24] = "StickinessMask";
        Constants[Constants["StickinessMaskInverse"] = 231] = "StickinessMaskInverse";
        Constants[Constants["StickinessOffset"] = 3] = "StickinessOffset";
        Constants[Constants["CollapseOnReplaceEditMask"] = 32] = "CollapseOnReplaceEditMask";
        Constants[Constants["CollapseOnReplaceEditMaskInverse"] = 223] = "CollapseOnReplaceEditMaskInverse";
        Constants[Constants["CollapseOnReplaceEditOffset"] = 5] = "CollapseOnReplaceEditOffset";
        Constants[Constants["IsMarginMask"] = 64] = "IsMarginMask";
        Constants[Constants["IsMarginMaskInverse"] = 191] = "IsMarginMaskInverse";
        Constants[Constants["IsMarginOffset"] = 6] = "IsMarginOffset";
        /**
         * Due to how deletion works (in order to avoid always walking the right subtree of the deleted node),
         * the deltas for nodes can grow and shrink dramatically. It has been observed, in practice, that unless
         * the deltas are corrected, integer overflow will occur.
         *
         * The integer overflow occurs when 53 bits are used in the numbers, but we will try to avoid it as
         * a node's delta gets below a negative 30 bits number.
         *
         * MIN SMI (SMall Integer) as defined in v8.
         * one bit is lost for boxing/unboxing flag.
         * one bit is lost for sign flag.
         * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
         */
        Constants[Constants["MIN_SAFE_DELTA"] = -1073741824] = "MIN_SAFE_DELTA";
        /**
         * MAX SMI (SMall Integer) as defined in v8.
         * one bit is lost for boxing/unboxing flag.
         * one bit is lost for sign flag.
         * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
         */
        Constants[Constants["MAX_SAFE_DELTA"] = 1073741824] = "MAX_SAFE_DELTA";
    })(Constants || (Constants = {}));
    function getNodeColor(node) {
        return ((node.metadata & 1 /* Constants.ColorMask */) >>> 0 /* Constants.ColorOffset */);
    }
    exports.getNodeColor = getNodeColor;
    function setNodeColor(node, color) {
        node.metadata = ((node.metadata & 254 /* Constants.ColorMaskInverse */) | (color << 0 /* Constants.ColorOffset */));
    }
    function getNodeIsVisited(node) {
        return ((node.metadata & 2 /* Constants.IsVisitedMask */) >>> 1 /* Constants.IsVisitedOffset */) === 1;
    }
    function setNodeIsVisited(node, value) {
        node.metadata = ((node.metadata & 253 /* Constants.IsVisitedMaskInverse */) | ((value ? 1 : 0) << 1 /* Constants.IsVisitedOffset */));
    }
    function getNodeIsForValidation(node) {
        return ((node.metadata & 4 /* Constants.IsForValidationMask */) >>> 2 /* Constants.IsForValidationOffset */) === 1;
    }
    function setNodeIsForValidation(node, value) {
        node.metadata = ((node.metadata & 251 /* Constants.IsForValidationMaskInverse */) | ((value ? 1 : 0) << 2 /* Constants.IsForValidationOffset */));
    }
    function getNodeIsInGlyphMargin(node) {
        return ((node.metadata & 64 /* Constants.IsMarginMask */) >>> 6 /* Constants.IsMarginOffset */) === 1;
    }
    function setNodeIsInGlyphMargin(node, value) {
        node.metadata = ((node.metadata & 191 /* Constants.IsMarginMaskInverse */) | ((value ? 1 : 0) << 6 /* Constants.IsMarginOffset */));
    }
    function getNodeStickiness(node) {
        return ((node.metadata & 24 /* Constants.StickinessMask */) >>> 3 /* Constants.StickinessOffset */);
    }
    function _setNodeStickiness(node, stickiness) {
        node.metadata = ((node.metadata & 231 /* Constants.StickinessMaskInverse */) | (stickiness << 3 /* Constants.StickinessOffset */));
    }
    function getCollapseOnReplaceEdit(node) {
        return ((node.metadata & 32 /* Constants.CollapseOnReplaceEditMask */) >>> 5 /* Constants.CollapseOnReplaceEditOffset */) === 1;
    }
    function setCollapseOnReplaceEdit(node, value) {
        node.metadata = ((node.metadata & 223 /* Constants.CollapseOnReplaceEditMaskInverse */) | ((value ? 1 : 0) << 5 /* Constants.CollapseOnReplaceEditOffset */));
    }
    function setNodeStickiness(node, stickiness) {
        _setNodeStickiness(node, stickiness);
    }
    exports.setNodeStickiness = setNodeStickiness;
    class IntervalNode {
        constructor(id, start, end) {
            this.metadata = 0;
            this.parent = this;
            this.left = this;
            this.right = this;
            setNodeColor(this, 1 /* NodeColor.Red */);
            this.start = start;
            this.end = end;
            // FORCE_OVERFLOWING_TEST: this.delta = start;
            this.delta = 0;
            this.maxEnd = end;
            this.id = id;
            this.ownerId = 0;
            this.options = null;
            setNodeIsForValidation(this, false);
            setNodeIsInGlyphMargin(this, false);
            _setNodeStickiness(this, 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */);
            setCollapseOnReplaceEdit(this, false);
            this.cachedVersionId = 0;
            this.cachedAbsoluteStart = start;
            this.cachedAbsoluteEnd = end;
            this.range = null;
            setNodeIsVisited(this, false);
        }
        reset(versionId, start, end, range) {
            this.start = start;
            this.end = end;
            this.maxEnd = end;
            this.cachedVersionId = versionId;
            this.cachedAbsoluteStart = start;
            this.cachedAbsoluteEnd = end;
            this.range = range;
        }
        setOptions(options) {
            this.options = options;
            const className = this.options.className;
            setNodeIsForValidation(this, (className === "squiggly-error" /* ClassName.EditorErrorDecoration */
                || className === "squiggly-warning" /* ClassName.EditorWarningDecoration */
                || className === "squiggly-info" /* ClassName.EditorInfoDecoration */));
            setNodeIsInGlyphMargin(this, this.options.glyphMarginClassName !== null);
            _setNodeStickiness(this, this.options.stickiness);
            setCollapseOnReplaceEdit(this, this.options.collapseOnReplaceEdit);
        }
        setCachedOffsets(absoluteStart, absoluteEnd, cachedVersionId) {
            if (this.cachedVersionId !== cachedVersionId) {
                this.range = null;
            }
            this.cachedVersionId = cachedVersionId;
            this.cachedAbsoluteStart = absoluteStart;
            this.cachedAbsoluteEnd = absoluteEnd;
        }
        detach() {
            this.parent = null;
            this.left = null;
            this.right = null;
        }
    }
    exports.IntervalNode = IntervalNode;
    exports.SENTINEL = new IntervalNode(null, 0, 0);
    exports.SENTINEL.parent = exports.SENTINEL;
    exports.SENTINEL.left = exports.SENTINEL;
    exports.SENTINEL.right = exports.SENTINEL;
    setNodeColor(exports.SENTINEL, 0 /* NodeColor.Black */);
    class IntervalTree {
        constructor() {
            this.root = exports.SENTINEL;
            this.requestNormalizeDelta = false;
        }
        intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
            if (this.root === exports.SENTINEL) {
                return [];
            }
            return intervalSearch(this, start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
        }
        search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
            if (this.root === exports.SENTINEL) {
                return [];
            }
            return search(this, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
        }
        /**
         * Will not set `cachedAbsoluteStart` nor `cachedAbsoluteEnd` on the returned nodes!
         */
        collectNodesFromOwner(ownerId) {
            return collectNodesFromOwner(this, ownerId);
        }
        /**
         * Will not set `cachedAbsoluteStart` nor `cachedAbsoluteEnd` on the returned nodes!
         */
        collectNodesPostOrder() {
            return collectNodesPostOrder(this);
        }
        insert(node) {
            rbTreeInsert(this, node);
            this._normalizeDeltaIfNecessary();
        }
        delete(node) {
            rbTreeDelete(this, node);
            this._normalizeDeltaIfNecessary();
        }
        resolveNode(node, cachedVersionId) {
            const initialNode = node;
            let delta = 0;
            while (node !== this.root) {
                if (node === node.parent.right) {
                    delta += node.parent.delta;
                }
                node = node.parent;
            }
            const nodeStart = initialNode.start + delta;
            const nodeEnd = initialNode.end + delta;
            initialNode.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
        }
        acceptReplace(offset, length, textLength, forceMoveMarkers) {
            // Our strategy is to remove all directly impacted nodes, and then add them back to the tree.
            // (1) collect all nodes that are intersecting this edit as nodes of interest
            const nodesOfInterest = searchForEditing(this, offset, offset + length);
            // (2) remove all nodes that are intersecting this edit
            for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
                const node = nodesOfInterest[i];
                rbTreeDelete(this, node);
            }
            this._normalizeDeltaIfNecessary();
            // (3) edit all tree nodes except the nodes of interest
            noOverlapReplace(this, offset, offset + length, textLength);
            this._normalizeDeltaIfNecessary();
            // (4) edit the nodes of interest and insert them back in the tree
            for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
                const node = nodesOfInterest[i];
                node.start = node.cachedAbsoluteStart;
                node.end = node.cachedAbsoluteEnd;
                nodeAcceptEdit(node, offset, (offset + length), textLength, forceMoveMarkers);
                node.maxEnd = node.end;
                rbTreeInsert(this, node);
            }
            this._normalizeDeltaIfNecessary();
        }
        getAllInOrder() {
            return search(this, 0, false, 0, false);
        }
        _normalizeDeltaIfNecessary() {
            if (!this.requestNormalizeDelta) {
                return;
            }
            this.requestNormalizeDelta = false;
            normalizeDelta(this);
        }
    }
    exports.IntervalTree = IntervalTree;
    //#region Delta Normalization
    function normalizeDelta(T) {
        let node = T.root;
        let delta = 0;
        while (node !== exports.SENTINEL) {
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
            // handle current node
            node.start = delta + node.start;
            node.end = delta + node.end;
            node.delta = 0;
            recomputeMaxEnd(node);
            setNodeIsVisited(node, true);
            // going up from this node
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
        }
        setNodeIsVisited(T.root, false);
    }
    //#endregion
    //#region Editing
    var MarkerMoveSemantics;
    (function (MarkerMoveSemantics) {
        MarkerMoveSemantics[MarkerMoveSemantics["MarkerDefined"] = 0] = "MarkerDefined";
        MarkerMoveSemantics[MarkerMoveSemantics["ForceMove"] = 1] = "ForceMove";
        MarkerMoveSemantics[MarkerMoveSemantics["ForceStay"] = 2] = "ForceStay";
    })(MarkerMoveSemantics || (MarkerMoveSemantics = {}));
    function adjustMarkerBeforeColumn(markerOffset, markerStickToPreviousCharacter, checkOffset, moveSemantics) {
        if (markerOffset < checkOffset) {
            return true;
        }
        if (markerOffset > checkOffset) {
            return false;
        }
        if (moveSemantics === 1 /* MarkerMoveSemantics.ForceMove */) {
            return false;
        }
        if (moveSemantics === 2 /* MarkerMoveSemantics.ForceStay */) {
            return true;
        }
        return markerStickToPreviousCharacter;
    }
    /**
     * This is a lot more complicated than strictly necessary to maintain the same behaviour
     * as when decorations were implemented using two markers.
     */
    function nodeAcceptEdit(node, start, end, textLength, forceMoveMarkers) {
        const nodeStickiness = getNodeStickiness(node);
        const startStickToPreviousCharacter = (nodeStickiness === 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */
            || nodeStickiness === 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */);
        const endStickToPreviousCharacter = (nodeStickiness === 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
            || nodeStickiness === 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */);
        const deletingCnt = (end - start);
        const insertingCnt = textLength;
        const commonLength = Math.min(deletingCnt, insertingCnt);
        const nodeStart = node.start;
        let startDone = false;
        const nodeEnd = node.end;
        let endDone = false;
        if (start <= nodeStart && nodeEnd <= end && getCollapseOnReplaceEdit(node)) {
            // This edit encompasses the entire decoration range
            // and the decoration has asked to become collapsed
            node.start = start;
            startDone = true;
            node.end = start;
            endDone = true;
        }
        {
            const moveSemantics = forceMoveMarkers ? 1 /* MarkerMoveSemantics.ForceMove */ : (deletingCnt > 0 ? 2 /* MarkerMoveSemantics.ForceStay */ : 0 /* MarkerMoveSemantics.MarkerDefined */);
            if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start, moveSemantics)) {
                startDone = true;
            }
            if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start, moveSemantics)) {
                endDone = true;
            }
        }
        if (commonLength > 0 && !forceMoveMarkers) {
            const moveSemantics = (deletingCnt > insertingCnt ? 2 /* MarkerMoveSemantics.ForceStay */ : 0 /* MarkerMoveSemantics.MarkerDefined */);
            if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start + commonLength, moveSemantics)) {
                startDone = true;
            }
            if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start + commonLength, moveSemantics)) {
                endDone = true;
            }
        }
        {
            const moveSemantics = forceMoveMarkers ? 1 /* MarkerMoveSemantics.ForceMove */ : 0 /* MarkerMoveSemantics.MarkerDefined */;
            if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, end, moveSemantics)) {
                node.start = start + insertingCnt;
                startDone = true;
            }
            if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, end, moveSemantics)) {
                node.end = start + insertingCnt;
                endDone = true;
            }
        }
        // Finish
        const deltaColumn = (insertingCnt - deletingCnt);
        if (!startDone) {
            node.start = Math.max(0, nodeStart + deltaColumn);
        }
        if (!endDone) {
            node.end = Math.max(0, nodeEnd + deltaColumn);
        }
        if (node.start > node.end) {
            node.end = node.start;
        }
    }
    exports.nodeAcceptEdit = nodeAcceptEdit;
    function searchForEditing(T, start, end) {
        // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
        // Now, it is known that two intervals A and B overlap only when both
        // A.low <= B.high and A.high >= B.low. When searching the trees for
        // nodes overlapping with a given interval, you can immediately skip:
        //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
        //  b) all nodes that have their maximum 'high' value below the start of the given interval.
        let node = T.root;
        let delta = 0;
        let nodeMaxEnd = 0;
        let nodeStart = 0;
        let nodeEnd = 0;
        const result = [];
        let resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                node = node.parent;
                continue;
            }
            if (!getNodeIsVisited(node.left)) {
                // first time seeing this node
                nodeMaxEnd = delta + node.maxEnd;
                if (nodeMaxEnd < start) {
                    // cover case b) from above
                    // there is no need to search this node or its children
                    setNodeIsVisited(node, true);
                    continue;
                }
                if (node.left !== exports.SENTINEL) {
                    // go left
                    node = node.left;
                    continue;
                }
            }
            // handle current node
            nodeStart = delta + node.start;
            if (nodeStart > end) {
                // cover case a) from above
                // there is no need to search this node or its right subtree
                setNodeIsVisited(node, true);
                continue;
            }
            nodeEnd = delta + node.end;
            if (nodeEnd >= start) {
                node.setCachedOffsets(nodeStart, nodeEnd, 0);
                result[resultLen++] = node;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function noOverlapReplace(T, start, end, textLength) {
        // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
        // Now, it is known that two intervals A and B overlap only when both
        // A.low <= B.high and A.high >= B.low. When searching the trees for
        // nodes overlapping with a given interval, you can immediately skip:
        //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
        //  b) all nodes that have their maximum 'high' value below the start of the given interval.
        let node = T.root;
        let delta = 0;
        let nodeMaxEnd = 0;
        let nodeStart = 0;
        const editDelta = (textLength - (end - start));
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                recomputeMaxEnd(node);
                node = node.parent;
                continue;
            }
            if (!getNodeIsVisited(node.left)) {
                // first time seeing this node
                nodeMaxEnd = delta + node.maxEnd;
                if (nodeMaxEnd < start) {
                    // cover case b) from above
                    // there is no need to search this node or its children
                    setNodeIsVisited(node, true);
                    continue;
                }
                if (node.left !== exports.SENTINEL) {
                    // go left
                    node = node.left;
                    continue;
                }
            }
            // handle current node
            nodeStart = delta + node.start;
            if (nodeStart > end) {
                node.start += editDelta;
                node.end += editDelta;
                node.delta += editDelta;
                if (node.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || node.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
                    T.requestNormalizeDelta = true;
                }
                // cover case a) from above
                // there is no need to search this node or its right subtree
                setNodeIsVisited(node, true);
                continue;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
    }
    //#endregion
    //#region Searching
    function collectNodesFromOwner(T, ownerId) {
        let node = T.root;
        const result = [];
        let resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                node = node.parent;
                continue;
            }
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            // handle current node
            if (node.ownerId === ownerId) {
                result[resultLen++] = node;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function collectNodesPostOrder(T) {
        let node = T.root;
        const result = [];
        let resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                node = node.parent;
                continue;
            }
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                node = node.right;
                continue;
            }
            // handle current node
            result[resultLen++] = node;
            setNodeIsVisited(node, true);
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function search(T, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
        let node = T.root;
        let delta = 0;
        let nodeStart = 0;
        let nodeEnd = 0;
        const result = [];
        let resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                node = node.parent;
                continue;
            }
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            // handle current node
            nodeStart = delta + node.start;
            nodeEnd = delta + node.end;
            node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
            let include = true;
            if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
                include = false;
            }
            if (filterOutValidation && getNodeIsForValidation(node)) {
                include = false;
            }
            if (onlyMarginDecorations && !getNodeIsInGlyphMargin(node)) {
                include = false;
            }
            if (include) {
                result[resultLen++] = node;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function intervalSearch(T, intervalStart, intervalEnd, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
        // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
        // Now, it is known that two intervals A and B overlap only when both
        // A.low <= B.high and A.high >= B.low. When searching the trees for
        // nodes overlapping with a given interval, you can immediately skip:
        //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
        //  b) all nodes that have their maximum 'high' value below the start of the given interval.
        let node = T.root;
        let delta = 0;
        let nodeMaxEnd = 0;
        let nodeStart = 0;
        let nodeEnd = 0;
        const result = [];
        let resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                node = node.parent;
                continue;
            }
            if (!getNodeIsVisited(node.left)) {
                // first time seeing this node
                nodeMaxEnd = delta + node.maxEnd;
                if (nodeMaxEnd < intervalStart) {
                    // cover case b) from above
                    // there is no need to search this node or its children
                    setNodeIsVisited(node, true);
                    continue;
                }
                if (node.left !== exports.SENTINEL) {
                    // go left
                    node = node.left;
                    continue;
                }
            }
            // handle current node
            nodeStart = delta + node.start;
            if (nodeStart > intervalEnd) {
                // cover case a) from above
                // there is no need to search this node or its right subtree
                setNodeIsVisited(node, true);
                continue;
            }
            nodeEnd = delta + node.end;
            if (nodeEnd >= intervalStart) {
                // There is overlap
                node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
                let include = true;
                if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
                    include = false;
                }
                if (filterOutValidation && getNodeIsForValidation(node)) {
                    include = false;
                }
                if (onlyMarginDecorations && !getNodeIsInGlyphMargin(node)) {
                    include = false;
                }
                if (include) {
                    result[resultLen++] = node;
                }
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    //#endregion
    //#region Insertion
    function rbTreeInsert(T, newNode) {
        if (T.root === exports.SENTINEL) {
            newNode.parent = exports.SENTINEL;
            newNode.left = exports.SENTINEL;
            newNode.right = exports.SENTINEL;
            setNodeColor(newNode, 0 /* NodeColor.Black */);
            T.root = newNode;
            return T.root;
        }
        treeInsert(T, newNode);
        recomputeMaxEndWalkToRoot(newNode.parent);
        // repair tree
        let x = newNode;
        while (x !== T.root && getNodeColor(x.parent) === 1 /* NodeColor.Red */) {
            if (x.parent === x.parent.parent.left) {
                const y = x.parent.parent.right;
                if (getNodeColor(y) === 1 /* NodeColor.Red */) {
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(y, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent.parent, 1 /* NodeColor.Red */);
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.right) {
                        x = x.parent;
                        leftRotate(T, x);
                    }
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent.parent, 1 /* NodeColor.Red */);
                    rightRotate(T, x.parent.parent);
                }
            }
            else {
                const y = x.parent.parent.left;
                if (getNodeColor(y) === 1 /* NodeColor.Red */) {
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(y, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent.parent, 1 /* NodeColor.Red */);
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.left) {
                        x = x.parent;
                        rightRotate(T, x);
                    }
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent.parent, 1 /* NodeColor.Red */);
                    leftRotate(T, x.parent.parent);
                }
            }
        }
        setNodeColor(T.root, 0 /* NodeColor.Black */);
        return newNode;
    }
    function treeInsert(T, z) {
        let delta = 0;
        let x = T.root;
        const zAbsoluteStart = z.start;
        const zAbsoluteEnd = z.end;
        while (true) {
            const cmp = intervalCompare(zAbsoluteStart, zAbsoluteEnd, x.start + delta, x.end + delta);
            if (cmp < 0) {
                // this node should be inserted to the left
                // => it is not affected by the node's delta
                if (x.left === exports.SENTINEL) {
                    z.start -= delta;
                    z.end -= delta;
                    z.maxEnd -= delta;
                    x.left = z;
                    break;
                }
                else {
                    x = x.left;
                }
            }
            else {
                // this node should be inserted to the right
                // => it is not affected by the node's delta
                if (x.right === exports.SENTINEL) {
                    z.start -= (delta + x.delta);
                    z.end -= (delta + x.delta);
                    z.maxEnd -= (delta + x.delta);
                    x.right = z;
                    break;
                }
                else {
                    delta += x.delta;
                    x = x.right;
                }
            }
        }
        z.parent = x;
        z.left = exports.SENTINEL;
        z.right = exports.SENTINEL;
        setNodeColor(z, 1 /* NodeColor.Red */);
    }
    //#endregion
    //#region Deletion
    function rbTreeDelete(T, z) {
        let x;
        let y;
        // RB-DELETE except we don't swap z and y in case c)
        // i.e. we always delete what's pointed at by z.
        if (z.left === exports.SENTINEL) {
            x = z.right;
            y = z;
            // x's delta is no longer influenced by z's delta
            x.delta += z.delta;
            if (x.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || x.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
                T.requestNormalizeDelta = true;
            }
            x.start += z.delta;
            x.end += z.delta;
        }
        else if (z.right === exports.SENTINEL) {
            x = z.left;
            y = z;
        }
        else {
            y = leftest(z.right);
            x = y.right;
            // y's delta is no longer influenced by z's delta,
            // but we don't want to walk the entire right-hand-side subtree of x.
            // we therefore maintain z's delta in y, and adjust only x
            x.start += y.delta;
            x.end += y.delta;
            x.delta += y.delta;
            if (x.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || x.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
                T.requestNormalizeDelta = true;
            }
            y.start += z.delta;
            y.end += z.delta;
            y.delta = z.delta;
            if (y.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || y.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
                T.requestNormalizeDelta = true;
            }
        }
        if (y === T.root) {
            T.root = x;
            setNodeColor(x, 0 /* NodeColor.Black */);
            z.detach();
            resetSentinel();
            recomputeMaxEnd(x);
            T.root.parent = exports.SENTINEL;
            return;
        }
        const yWasRed = (getNodeColor(y) === 1 /* NodeColor.Red */);
        if (y === y.parent.left) {
            y.parent.left = x;
        }
        else {
            y.parent.right = x;
        }
        if (y === z) {
            x.parent = y.parent;
        }
        else {
            if (y.parent === z) {
                x.parent = y;
            }
            else {
                x.parent = y.parent;
            }
            y.left = z.left;
            y.right = z.right;
            y.parent = z.parent;
            setNodeColor(y, getNodeColor(z));
            if (z === T.root) {
                T.root = y;
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
        }
        z.detach();
        if (yWasRed) {
            recomputeMaxEndWalkToRoot(x.parent);
            if (y !== z) {
                recomputeMaxEndWalkToRoot(y);
                recomputeMaxEndWalkToRoot(y.parent);
            }
            resetSentinel();
            return;
        }
        recomputeMaxEndWalkToRoot(x);
        recomputeMaxEndWalkToRoot(x.parent);
        if (y !== z) {
            recomputeMaxEndWalkToRoot(y);
            recomputeMaxEndWalkToRoot(y.parent);
        }
        // RB-DELETE-FIXUP
        let w;
        while (x !== T.root && getNodeColor(x) === 0 /* NodeColor.Black */) {
            if (x === x.parent.left) {
                w = x.parent.right;
                if (getNodeColor(w) === 1 /* NodeColor.Red */) {
                    setNodeColor(w, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent, 1 /* NodeColor.Red */);
                    leftRotate(T, x.parent);
                    w = x.parent.right;
                }
                if (getNodeColor(w.left) === 0 /* NodeColor.Black */ && getNodeColor(w.right) === 0 /* NodeColor.Black */) {
                    setNodeColor(w, 1 /* NodeColor.Red */);
                    x = x.parent;
                }
                else {
                    if (getNodeColor(w.right) === 0 /* NodeColor.Black */) {
                        setNodeColor(w.left, 0 /* NodeColor.Black */);
                        setNodeColor(w, 1 /* NodeColor.Red */);
                        rightRotate(T, w);
                        w = x.parent.right;
                    }
                    setNodeColor(w, getNodeColor(x.parent));
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(w.right, 0 /* NodeColor.Black */);
                    leftRotate(T, x.parent);
                    x = T.root;
                }
            }
            else {
                w = x.parent.left;
                if (getNodeColor(w) === 1 /* NodeColor.Red */) {
                    setNodeColor(w, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent, 1 /* NodeColor.Red */);
                    rightRotate(T, x.parent);
                    w = x.parent.left;
                }
                if (getNodeColor(w.left) === 0 /* NodeColor.Black */ && getNodeColor(w.right) === 0 /* NodeColor.Black */) {
                    setNodeColor(w, 1 /* NodeColor.Red */);
                    x = x.parent;
                }
                else {
                    if (getNodeColor(w.left) === 0 /* NodeColor.Black */) {
                        setNodeColor(w.right, 0 /* NodeColor.Black */);
                        setNodeColor(w, 1 /* NodeColor.Red */);
                        leftRotate(T, w);
                        w = x.parent.left;
                    }
                    setNodeColor(w, getNodeColor(x.parent));
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(w.left, 0 /* NodeColor.Black */);
                    rightRotate(T, x.parent);
                    x = T.root;
                }
            }
        }
        setNodeColor(x, 0 /* NodeColor.Black */);
        resetSentinel();
    }
    function leftest(node) {
        while (node.left !== exports.SENTINEL) {
            node = node.left;
        }
        return node;
    }
    function resetSentinel() {
        exports.SENTINEL.parent = exports.SENTINEL;
        exports.SENTINEL.delta = 0; // optional
        exports.SENTINEL.start = 0; // optional
        exports.SENTINEL.end = 0; // optional
    }
    //#endregion
    //#region Rotations
    function leftRotate(T, x) {
        const y = x.right; // set y.
        y.delta += x.delta; // y's delta is no longer influenced by x's delta
        if (y.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || y.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
            T.requestNormalizeDelta = true;
        }
        y.start += x.delta;
        y.end += x.delta;
        x.right = y.left; // turn y's left subtree into x's right subtree.
        if (y.left !== exports.SENTINEL) {
            y.left.parent = x;
        }
        y.parent = x.parent; // link x's parent to y.
        if (x.parent === exports.SENTINEL) {
            T.root = y;
        }
        else if (x === x.parent.left) {
            x.parent.left = y;
        }
        else {
            x.parent.right = y;
        }
        y.left = x; // put x on y's left.
        x.parent = y;
        recomputeMaxEnd(x);
        recomputeMaxEnd(y);
    }
    function rightRotate(T, y) {
        const x = y.left;
        y.delta -= x.delta;
        if (y.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || y.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
            T.requestNormalizeDelta = true;
        }
        y.start -= x.delta;
        y.end -= x.delta;
        y.left = x.right;
        if (x.right !== exports.SENTINEL) {
            x.right.parent = y;
        }
        x.parent = y.parent;
        if (y.parent === exports.SENTINEL) {
            T.root = x;
        }
        else if (y === y.parent.right) {
            y.parent.right = x;
        }
        else {
            y.parent.left = x;
        }
        x.right = y;
        y.parent = x;
        recomputeMaxEnd(y);
        recomputeMaxEnd(x);
    }
    //#endregion
    //#region max end computation
    function computeMaxEnd(node) {
        let maxEnd = node.end;
        if (node.left !== exports.SENTINEL) {
            const leftMaxEnd = node.left.maxEnd;
            if (leftMaxEnd > maxEnd) {
                maxEnd = leftMaxEnd;
            }
        }
        if (node.right !== exports.SENTINEL) {
            const rightMaxEnd = node.right.maxEnd + node.delta;
            if (rightMaxEnd > maxEnd) {
                maxEnd = rightMaxEnd;
            }
        }
        return maxEnd;
    }
    function recomputeMaxEnd(node) {
        node.maxEnd = computeMaxEnd(node);
    }
    exports.recomputeMaxEnd = recomputeMaxEnd;
    function recomputeMaxEndWalkToRoot(node) {
        while (node !== exports.SENTINEL) {
            const maxEnd = computeMaxEnd(node);
            if (node.maxEnd === maxEnd) {
                // no need to go further
                return;
            }
            node.maxEnd = maxEnd;
            node = node.parent;
        }
    }
    //#endregion
    //#region utils
    function intervalCompare(aStart, aEnd, bStart, bEnd) {
        if (aStart === bStart) {
            return aEnd - bEnd;
        }
        return aStart - bStart;
    }
    exports.intervalCompare = intervalCompare;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJ2YWxUcmVlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsL2ludGVydmFsVHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsRUFBRTtJQUNGLG1HQUFtRztJQUNuRyxFQUFFO0lBRUYsSUFBa0IsU0FRakI7SUFSRCxXQUFrQixTQUFTO1FBQzFCLG1EQUFzQyxDQUFBO1FBQ3RDLG1EQUFzQyxDQUFBO1FBQ3RDLHlEQUE0QyxDQUFBO1FBQzVDLHFEQUF3QyxDQUFBO1FBQ3hDLGlFQUFvRCxDQUFBO1FBQ3BELDhFQUFpRSxDQUFBO1FBQ2pFLDRFQUErRCxDQUFBO0lBQ2hFLENBQUMsRUFSaUIsU0FBUyx5QkFBVCxTQUFTLFFBUTFCO0lBRUQsSUFBa0IsU0FHakI7SUFIRCxXQUFrQixTQUFTO1FBQzFCLDJDQUFTLENBQUE7UUFDVCx1Q0FBTyxDQUFBO0lBQ1IsQ0FBQyxFQUhpQixTQUFTLHlCQUFULFNBQVMsUUFHMUI7SUFFRCxJQUFXLFNBOENWO0lBOUNELFdBQVcsU0FBUztRQUNuQixtREFBc0IsQ0FBQTtRQUN0QixtRUFBNkIsQ0FBQTtRQUM3Qix1REFBZSxDQUFBO1FBRWYsMkRBQTBCLENBQUE7UUFDMUIsMkVBQWlDLENBQUE7UUFDakMsK0RBQW1CLENBQUE7UUFFbkIsdUVBQWdDLENBQUE7UUFDaEMsdUZBQXVDLENBQUE7UUFDdkMsMkVBQXlCLENBQUE7UUFFekIsOERBQTJCLENBQUE7UUFDM0IsNkVBQWtDLENBQUE7UUFDbEMsaUVBQW9CLENBQUE7UUFFcEIsb0ZBQXNDLENBQUE7UUFDdEMsbUdBQTZDLENBQUE7UUFDN0MsdUZBQStCLENBQUE7UUFFL0IsMERBQXlCLENBQUE7UUFDekIseUVBQWdDLENBQUE7UUFDaEMsNkRBQWtCLENBQUE7UUFFbEI7Ozs7Ozs7Ozs7OztXQVlH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