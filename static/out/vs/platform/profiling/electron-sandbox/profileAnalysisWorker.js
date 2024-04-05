/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function() {
var __m = ["require","exports","vs/base/common/ternarySearchTree","vs/platform/instantiation/common/instantiation","vs/platform/profiling/common/profiling","vs/base/common/path","vs/platform/profiling/common/profilingModel","vs/base/common/arrays","vs/base/common/strings","vs/platform/profiling/electron-sandbox/profileAnalysisWorker","vs/base/common/uri"];
var __M = function(deps) {
  var result = [];
  for (var i = 0, len = deps.length; i < len; i++) {
    result[i] = __m[deps[i]];
  }
  return result;
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[2/*vs/base/common/ternarySearchTree*/], __M([0/*require*/,1/*exports*/,7/*vs/base/common/arrays*/,8/*vs/base/common/strings*/]), function (require, exports, arrays_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TernarySearchTree = exports.UriIterator = exports.PathIterator = exports.ConfigKeysIterator = exports.StringIterator = void 0;
    class StringIterator {
        constructor() {
            this._value = '';
            this._pos = 0;
        }
        reset(key) {
            this._value = key;
            this._pos = 0;
            return this;
        }
        next() {
            this._pos += 1;
            return this;
        }
        hasNext() {
            return this._pos < this._value.length - 1;
        }
        cmp(a) {
            const aCode = a.charCodeAt(0);
            const thisCode = this._value.charCodeAt(this._pos);
            return aCode - thisCode;
        }
        value() {
            return this._value[this._pos];
        }
    }
    exports.StringIterator = StringIterator;
    class ConfigKeysIterator {
        constructor(_caseSensitive = true) {
            this._caseSensitive = _caseSensitive;
        }
        reset(key) {
            this._value = key;
            this._from = 0;
            this._to = 0;
            return this.next();
        }
        hasNext() {
            return this._to < this._value.length;
        }
        next() {
            // this._data = key.split(/[\\/]/).filter(s => !!s);
            this._from = this._to;
            let justSeps = true;
            for (; this._to < this._value.length; this._to++) {
                const ch = this._value.charCodeAt(this._to);
                if (ch === 46 /* CharCode.Period */) {
                    if (justSeps) {
                        this._from++;
                    }
                    else {
                        break;
                    }
                }
                else {
                    justSeps = false;
                }
            }
            return this;
        }
        cmp(a) {
            return this._caseSensitive
                ? (0, strings_1.compareSubstring)(a, this._value, 0, a.length, this._from, this._to)
                : (0, strings_1.compareSubstringIgnoreCase)(a, this._value, 0, a.length, this._from, this._to);
        }
        value() {
            return this._value.substring(this._from, this._to);
        }
    }
    exports.ConfigKeysIterator = ConfigKeysIterator;
    class PathIterator {
        constructor(_splitOnBackslash = true, _caseSensitive = true) {
            this._splitOnBackslash = _splitOnBackslash;
            this._caseSensitive = _caseSensitive;
        }
        reset(key) {
            this._from = 0;
            this._to = 0;
            this._value = key;
            this._valueLen = key.length;
            for (let pos = key.length - 1; pos >= 0; pos--, this._valueLen--) {
                const ch = this._value.charCodeAt(pos);
                if (!(ch === 47 /* CharCode.Slash */ || this._splitOnBackslash && ch === 92 /* CharCode.Backslash */)) {
                    break;
                }
            }
            return this.next();
        }
        hasNext() {
            return this._to < this._valueLen;
        }
        next() {
            // this._data = key.split(/[\\/]/).filter(s => !!s);
            this._from = this._to;
            let justSeps = true;
            for (; this._to < this._valueLen; this._to++) {
                const ch = this._value.charCodeAt(this._to);
                if (ch === 47 /* CharCode.Slash */ || this._splitOnBackslash && ch === 92 /* CharCode.Backslash */) {
                    if (justSeps) {
                        this._from++;
                    }
                    else {
                        break;
                    }
                }
                else {
                    justSeps = false;
                }
            }
            return this;
        }
        cmp(a) {
            return this._caseSensitive
                ? (0, strings_1.compareSubstring)(a, this._value, 0, a.length, this._from, this._to)
                : (0, strings_1.compareSubstringIgnoreCase)(a, this._value, 0, a.length, this._from, this._to);
        }
        value() {
            return this._value.substring(this._from, this._to);
        }
    }
    exports.PathIterator = PathIterator;
    var UriIteratorState;
    (function (UriIteratorState) {
        UriIteratorState[UriIteratorState["Scheme"] = 1] = "Scheme";
        UriIteratorState[UriIteratorState["Authority"] = 2] = "Authority";
        UriIteratorState[UriIteratorState["Path"] = 3] = "Path";
        UriIteratorState[UriIteratorState["Query"] = 4] = "Query";
        UriIteratorState[UriIteratorState["Fragment"] = 5] = "Fragment";
    })(UriIteratorState || (UriIteratorState = {}));
    class UriIterator {
        constructor(_ignorePathCasing, _ignoreQueryAndFragment) {
            this._ignorePathCasing = _ignorePathCasing;
            this._ignoreQueryAndFragment = _ignoreQueryAndFragment;
            this._states = [];
            this._stateIdx = 0;
        }
        reset(key) {
            this._value = key;
            this._states = [];
            if (this._value.scheme) {
                this._states.push(1 /* UriIteratorState.Scheme */);
            }
            if (this._value.authority) {
                this._states.push(2 /* UriIteratorState.Authority */);
            }
            if (this._value.path) {
                this._pathIterator = new PathIterator(false, !this._ignorePathCasing(key));
                this._pathIterator.reset(key.path);
                if (this._pathIterator.value()) {
                    this._states.push(3 /* UriIteratorState.Path */);
                }
            }
            if (!this._ignoreQueryAndFragment(key)) {
                if (this._value.query) {
                    this._states.push(4 /* UriIteratorState.Query */);
                }
                if (this._value.fragment) {
                    this._states.push(5 /* UriIteratorState.Fragment */);
                }
            }
            this._stateIdx = 0;
            return this;
        }
        next() {
            if (this._states[this._stateIdx] === 3 /* UriIteratorState.Path */ && this._pathIterator.hasNext()) {
                this._pathIterator.next();
            }
            else {
                this._stateIdx += 1;
            }
            return this;
        }
        hasNext() {
            return (this._states[this._stateIdx] === 3 /* UriIteratorState.Path */ && this._pathIterator.hasNext())
                || this._stateIdx < this._states.length - 1;
        }
        cmp(a) {
            if (this._states[this._stateIdx] === 1 /* UriIteratorState.Scheme */) {
                return (0, strings_1.compareIgnoreCase)(a, this._value.scheme);
            }
            else if (this._states[this._stateIdx] === 2 /* UriIteratorState.Authority */) {
                return (0, strings_1.compareIgnoreCase)(a, this._value.authority);
            }
            else if (this._states[this._stateIdx] === 3 /* UriIteratorState.Path */) {
                return this._pathIterator.cmp(a);
            }
            else if (this._states[this._stateIdx] === 4 /* UriIteratorState.Query */) {
                return (0, strings_1.compare)(a, this._value.query);
            }
            else if (this._states[this._stateIdx] === 5 /* UriIteratorState.Fragment */) {
                return (0, strings_1.compare)(a, this._value.fragment);
            }
            throw new Error();
        }
        value() {
            if (this._states[this._stateIdx] === 1 /* UriIteratorState.Scheme */) {
                return this._value.scheme;
            }
            else if (this._states[this._stateIdx] === 2 /* UriIteratorState.Authority */) {
                return this._value.authority;
            }
            else if (this._states[this._stateIdx] === 3 /* UriIteratorState.Path */) {
                return this._pathIterator.value();
            }
            else if (this._states[this._stateIdx] === 4 /* UriIteratorState.Query */) {
                return this._value.query;
            }
            else if (this._states[this._stateIdx] === 5 /* UriIteratorState.Fragment */) {
                return this._value.fragment;
            }
            throw new Error();
        }
    }
    exports.UriIterator = UriIterator;
    class TernarySearchTreeNode {
        constructor() {
            this.height = 1;
        }
        isEmpty() {
            return !this.left && !this.mid && !this.right && !this.value;
        }
        rotateLeft() {
            const tmp = this.right;
            this.right = tmp.left;
            tmp.left = this;
            this.updateHeight();
            tmp.updateHeight();
            return tmp;
        }
        rotateRight() {
            const tmp = this.left;
            this.left = tmp.right;
            tmp.right = this;
            this.updateHeight();
            tmp.updateHeight();
            return tmp;
        }
        updateHeight() {
            this.height = 1 + Math.max(this.heightLeft, this.heightRight);
        }
        balanceFactor() {
            return this.heightRight - this.heightLeft;
        }
        get heightLeft() {
            return this.left?.height ?? 0;
        }
        get heightRight() {
            return this.right?.height ?? 0;
        }
    }
    var Dir;
    (function (Dir) {
        Dir[Dir["Left"] = -1] = "Left";
        Dir[Dir["Mid"] = 0] = "Mid";
        Dir[Dir["Right"] = 1] = "Right";
    })(Dir || (Dir = {}));
    class TernarySearchTree {
        static forUris(ignorePathCasing = () => false, ignoreQueryAndFragment = () => false) {
            return new TernarySearchTree(new UriIterator(ignorePathCasing, ignoreQueryAndFragment));
        }
        static forPaths(ignorePathCasing = false) {
            return new TernarySearchTree(new PathIterator(undefined, !ignorePathCasing));
        }
        static forStrings() {
            return new TernarySearchTree(new StringIterator());
        }
        static forConfigKeys() {
            return new TernarySearchTree(new ConfigKeysIterator());
        }
        constructor(segments) {
            this._iter = segments;
        }
        clear() {
            this._root = undefined;
        }
        fill(values, keys) {
            if (keys) {
                const arr = keys.slice(0);
                (0, arrays_1.shuffle)(arr);
                for (const k of arr) {
                    this.set(k, values);
                }
            }
            else {
                const arr = values.slice(0);
                (0, arrays_1.shuffle)(arr);
                for (const entry of arr) {
                    this.set(entry[0], entry[1]);
                }
            }
        }
        set(key, element) {
            const iter = this._iter.reset(key);
            let node;
            if (!this._root) {
                this._root = new TernarySearchTreeNode();
                this._root.segment = iter.value();
            }
            const stack = [];
            // find insert_node
            node = this._root;
            while (true) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    if (!node.left) {
                        node.left = new TernarySearchTreeNode();
                        node.left.segment = iter.value();
                    }
                    stack.push([-1 /* Dir.Left */, node]);
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    if (!node.right) {
                        node.right = new TernarySearchTreeNode();
                        node.right.segment = iter.value();
                    }
                    stack.push([1 /* Dir.Right */, node]);
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    if (!node.mid) {
                        node.mid = new TernarySearchTreeNode();
                        node.mid.segment = iter.value();
                    }
                    stack.push([0 /* Dir.Mid */, node]);
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            // set value
            const oldElement = node.value;
            node.value = element;
            node.key = key;
            // balance
            for (let i = stack.length - 1; i >= 0; i--) {
                const node = stack[i][1];
                node.updateHeight();
                const bf = node.balanceFactor();
                if (bf < -1 || bf > 1) {
                    // needs rotate
                    const d1 = stack[i][0];
                    const d2 = stack[i + 1][0];
                    if (d1 === 1 /* Dir.Right */ && d2 === 1 /* Dir.Right */) {
                        //right, right -> rotate left
                        stack[i][1] = node.rotateLeft();
                    }
                    else if (d1 === -1 /* Dir.Left */ && d2 === -1 /* Dir.Left */) {
                        // left, left -> rotate right
                        stack[i][1] = node.rotateRight();
                    }
                    else if (d1 === 1 /* Dir.Right */ && d2 === -1 /* Dir.Left */) {
                        // right, left -> double rotate right, left
                        node.right = stack[i + 1][1] = stack[i + 1][1].rotateRight();
                        stack[i][1] = node.rotateLeft();
                    }
                    else if (d1 === -1 /* Dir.Left */ && d2 === 1 /* Dir.Right */) {
                        // left, right -> double rotate left, right
                        node.left = stack[i + 1][1] = stack[i + 1][1].rotateLeft();
                        stack[i][1] = node.rotateRight();
                    }
                    else {
                        throw new Error();
                    }
                    // patch path to parent
                    if (i > 0) {
                        switch (stack[i - 1][0]) {
                            case -1 /* Dir.Left */:
                                stack[i - 1][1].left = stack[i][1];
                                break;
                            case 1 /* Dir.Right */:
                                stack[i - 1][1].right = stack[i][1];
                                break;
                            case 0 /* Dir.Mid */:
                                stack[i - 1][1].mid = stack[i][1];
                                break;
                        }
                    }
                    else {
                        this._root = stack[0][1];
                    }
                }
            }
            return oldElement;
        }
        get(key) {
            return this._getNode(key)?.value;
        }
        _getNode(key) {
            const iter = this._iter.reset(key);
            let node = this._root;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            return node;
        }
        has(key) {
            const node = this._getNode(key);
            return !(node?.value === undefined && node?.mid === undefined);
        }
        delete(key) {
            return this._delete(key, false);
        }
        deleteSuperstr(key) {
            return this._delete(key, true);
        }
        _delete(key, superStr) {
            const iter = this._iter.reset(key);
            const stack = [];
            let node = this._root;
            // find node
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    stack.push([-1 /* Dir.Left */, node]);
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    stack.push([1 /* Dir.Right */, node]);
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    stack.push([0 /* Dir.Mid */, node]);
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            if (!node) {
                // node not found
                return;
            }
            if (superStr) {
                // removing children, reset height
                node.left = undefined;
                node.mid = undefined;
                node.right = undefined;
                node.height = 1;
            }
            else {
                // removing element
                node.key = undefined;
                node.value = undefined;
            }
            // BST node removal
            if (!node.mid && !node.value) {
                if (node.left && node.right) {
                    // full node
                    // replace deleted-node with the min-node of the right branch.
                    // If there is no true min-node leave things as they are
                    const min = this._min(node.right);
                    if (min.key) {
                        const { key, value, segment } = min;
                        this._delete(min.key, false);
                        node.key = key;
                        node.value = value;
                        node.segment = segment;
                    }
                }
                else {
                    // empty or half empty
                    const newChild = node.left ?? node.right;
                    if (stack.length > 0) {
                        const [dir, parent] = stack[stack.length - 1];
                        switch (dir) {
                            case -1 /* Dir.Left */:
                                parent.left = newChild;
                                break;
                            case 0 /* Dir.Mid */:
                                parent.mid = newChild;
                                break;
                            case 1 /* Dir.Right */:
                                parent.right = newChild;
                                break;
                        }
                    }
                    else {
                        this._root = newChild;
                    }
                }
            }
            // AVL balance
            for (let i = stack.length - 1; i >= 0; i--) {
                const node = stack[i][1];
                node.updateHeight();
                const bf = node.balanceFactor();
                if (bf > 1) {
                    // right heavy
                    if (node.right.balanceFactor() >= 0) {
                        // right, right -> rotate left
                        stack[i][1] = node.rotateLeft();
                    }
                    else {
                        // right, left -> double rotate
                        node.right = node.right.rotateRight();
                        stack[i][1] = node.rotateLeft();
                    }
                }
                else if (bf < -1) {
                    // left heavy
                    if (node.left.balanceFactor() <= 0) {
                        // left, left -> rotate right
                        stack[i][1] = node.rotateRight();
                    }
                    else {
                        // left, right -> double rotate
                        node.left = node.left.rotateLeft();
                        stack[i][1] = node.rotateRight();
                    }
                }
                // patch path to parent
                if (i > 0) {
                    switch (stack[i - 1][0]) {
                        case -1 /* Dir.Left */:
                            stack[i - 1][1].left = stack[i][1];
                            break;
                        case 1 /* Dir.Right */:
                            stack[i - 1][1].right = stack[i][1];
                            break;
                        case 0 /* Dir.Mid */:
                            stack[i - 1][1].mid = stack[i][1];
                            break;
                    }
                }
                else {
                    this._root = stack[0][1];
                }
            }
        }
        _min(node) {
            while (node.left) {
                node = node.left;
            }
            return node;
        }
        findSubstr(key) {
            const iter = this._iter.reset(key);
            let node = this._root;
            let candidate = undefined;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    candidate = node.value || candidate;
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            return node && node.value || candidate;
        }
        findSuperstr(key) {
            return this._findSuperstrOrElement(key, false);
        }
        _findSuperstrOrElement(key, allowValue) {
            const iter = this._iter.reset(key);
            let node = this._root;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    node = node.mid;
                }
                else {
                    // collect
                    if (!node.mid) {
                        if (allowValue) {
                            return node.value;
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        return this._entries(node.mid);
                    }
                }
            }
            return undefined;
        }
        hasElementOrSubtree(key) {
            return this._findSuperstrOrElement(key, true) !== undefined;
        }
        forEach(callback) {
            for (const [key, value] of this) {
                callback(value, key);
            }
        }
        *[Symbol.iterator]() {
            yield* this._entries(this._root);
        }
        _entries(node) {
            const result = [];
            this._dfsEntries(node, result);
            return result[Symbol.iterator]();
        }
        _dfsEntries(node, bucket) {
            // DFS
            if (!node) {
                return;
            }
            if (node.left) {
                this._dfsEntries(node.left, bucket);
            }
            if (node.value) {
                bucket.push([node.key, node.value]);
            }
            if (node.mid) {
                this._dfsEntries(node.mid, bucket);
            }
            if (node.right) {
                this._dfsEntries(node.right, bucket);
            }
        }
        // for debug/testing
        _isBalanced() {
            const nodeIsBalanced = (node) => {
                if (!node) {
                    return true;
                }
                const bf = node.balanceFactor();
                if (bf < -1 || bf > 1) {
                    return false;
                }
                return nodeIsBalanced(node.left) && nodeIsBalanced(node.right);
            };
            return nodeIsBalanced(this._root);
        }
    }
    exports.TernarySearchTree = TernarySearchTree;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[3/*vs/platform/instantiation/common/instantiation*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.refineServiceDecorator = exports.createDecorator = exports.IInstantiationService = exports._util = void 0;
    // ------ internal util
    var _util;
    (function (_util) {
        _util.serviceIds = new Map();
        _util.DI_TARGET = '$di$target';
        _util.DI_DEPENDENCIES = '$di$dependencies';
        function getServiceDependencies(ctor) {
            return ctor[_util.DI_DEPENDENCIES] || [];
        }
        _util.getServiceDependencies = getServiceDependencies;
    })(_util || (exports._util = _util = {}));
    exports.IInstantiationService = createDecorator('instantiationService');
    function storeServiceDependency(id, target, index) {
        if (target[_util.DI_TARGET] === target) {
            target[_util.DI_DEPENDENCIES].push({ id, index });
        }
        else {
            target[_util.DI_DEPENDENCIES] = [{ id, index }];
            target[_util.DI_TARGET] = target;
        }
    }
    /**
     * The *only* valid way to create a {{ServiceIdentifier}}.
     */
    function createDecorator(serviceId) {
        if (_util.serviceIds.has(serviceId)) {
            return _util.serviceIds.get(serviceId);
        }
        const id = function (target, key, index) {
            if (arguments.length !== 3) {
                throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
            }
            storeServiceDependency(id, target, index);
        };
        id.toString = () => serviceId;
        _util.serviceIds.set(serviceId, id);
        return id;
    }
    exports.createDecorator = createDecorator;
    function refineServiceDecorator(serviceIdentifier) {
        return serviceIdentifier;
    }
    exports.refineServiceDecorator = refineServiceDecorator;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[4/*vs/platform/profiling/common/profiling*/], __M([0/*require*/,1/*exports*/,5/*vs/base/common/path*/,3/*vs/platform/instantiation/common/instantiation*/]), function (require, exports, path_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Utils = exports.IV8InspectProfilingService = void 0;
    exports.IV8InspectProfilingService = (0, instantiation_1.createDecorator)('IV8InspectProfilingService');
    var Utils;
    (function (Utils) {
        function isValidProfile(profile) {
            return Boolean(profile.samples && profile.timeDeltas);
        }
        Utils.isValidProfile = isValidProfile;
        function rewriteAbsolutePaths(profile, replace = 'noAbsolutePaths') {
            for (const node of profile.nodes) {
                if (node.callFrame && node.callFrame.url) {
                    if ((0, path_1.isAbsolute)(node.callFrame.url) || /^\w[\w\d+.-]*:\/\/\/?/.test(node.callFrame.url)) {
                        node.callFrame.url = (0, path_1.join)(replace, (0, path_1.basename)(node.callFrame.url));
                    }
                }
            }
            return profile;
        }
        Utils.rewriteAbsolutePaths = rewriteAbsolutePaths;
    })(Utils || (exports.Utils = Utils = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[6/*vs/platform/profiling/common/profilingModel*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.processNode = exports.BottomUpNode = exports.buildModel = void 0;
    /**
     * Recursive function that computes and caches the aggregate time for the
     * children of the computed now.
     */
    const computeAggregateTime = (index, nodes) => {
        const row = nodes[index];
        if (row.aggregateTime) {
            return row.aggregateTime;
        }
        let total = row.selfTime;
        for (const child of row.children) {
            total += computeAggregateTime(child, nodes);
        }
        return (row.aggregateTime = total);
    };
    const ensureSourceLocations = (profile) => {
        let locationIdCounter = 0;
        const locationsByRef = new Map();
        const getLocationIdFor = (callFrame) => {
            const ref = [
                callFrame.functionName,
                callFrame.url,
                callFrame.scriptId,
                callFrame.lineNumber,
                callFrame.columnNumber,
            ].join(':');
            const existing = locationsByRef.get(ref);
            if (existing) {
                return existing.id;
            }
            const id = locationIdCounter++;
            locationsByRef.set(ref, {
                id,
                callFrame,
                location: {
                    lineNumber: callFrame.lineNumber + 1,
                    columnNumber: callFrame.columnNumber + 1,
                    // source: {
                    // 	name: maybeFileUrlToPath(callFrame.url),
                    // 	path: maybeFileUrlToPath(callFrame.url),
                    // 	sourceReference: 0,
                    // },
                },
            });
            return id;
        };
        for (const node of profile.nodes) {
            node.locationId = getLocationIdFor(node.callFrame);
            node.positionTicks = node.positionTicks?.map(tick => ({
                ...tick,
                // weirdly, line numbers here are 1-based, not 0-based. The position tick
                // only gives line-level granularity, so 'mark' the entire range of source
                // code the tick refers to
                startLocationId: getLocationIdFor({
                    ...node.callFrame,
                    lineNumber: tick.line - 1,
                    columnNumber: 0,
                }),
                endLocationId: getLocationIdFor({
                    ...node.callFrame,
                    lineNumber: tick.line,
                    columnNumber: 0,
                }),
            }));
        }
        return [...locationsByRef.values()]
            .sort((a, b) => a.id - b.id)
            .map(l => ({ locations: [l.location], callFrame: l.callFrame }));
    };
    /**
     * Computes the model for the given profile.
     */
    const buildModel = (profile) => {
        if (!profile.timeDeltas || !profile.samples) {
            return {
                nodes: [],
                locations: [],
                samples: profile.samples || [],
                timeDeltas: profile.timeDeltas || [],
                // rootPath: profile.$vscode?.rootPath,
                duration: profile.endTime - profile.startTime,
            };
        }
        const { samples, timeDeltas } = profile;
        const sourceLocations = ensureSourceLocations(profile);
        const locations = sourceLocations.map((l, id) => {
            const src = l.locations[0]; //getBestLocation(profile, l.locations);
            return {
                id,
                selfTime: 0,
                aggregateTime: 0,
                ticks: 0,
                // category: categorize(l.callFrame, src),
                callFrame: l.callFrame,
                src,
            };
        });
        const idMap = new Map();
        const mapId = (nodeId) => {
            let id = idMap.get(nodeId);
            if (id === undefined) {
                id = idMap.size;
                idMap.set(nodeId, id);
            }
            return id;
        };
        // 1. Created a sorted list of nodes. It seems that the profile always has
        // incrementing IDs, although they are just not initially sorted.
        const nodes = new Array(profile.nodes.length);
        for (let i = 0; i < profile.nodes.length; i++) {
            const node = profile.nodes[i];
            // make them 0-based:
            const id = mapId(node.id);
            nodes[id] = {
                id,
                selfTime: 0,
                aggregateTime: 0,
                locationId: node.locationId,
                children: node.children?.map(mapId) || [],
            };
            for (const child of node.positionTicks || []) {
                if (child.startLocationId) {
                    locations[child.startLocationId].ticks += child.ticks;
                }
            }
        }
        for (const node of nodes) {
            for (const child of node.children) {
                nodes[child].parent = node.id;
            }
        }
        // 2. The profile samples are the 'bottom-most' node, the currently running
        // code. Sum of these in the self time.
        const duration = profile.endTime - profile.startTime;
        let lastNodeTime = duration - timeDeltas[0];
        for (let i = 0; i < timeDeltas.length - 1; i++) {
            const d = timeDeltas[i + 1];
            nodes[mapId(samples[i])].selfTime += d;
            lastNodeTime -= d;
        }
        // Add in an extra time delta for the last sample. `timeDeltas[0]` is the
        // time before the first sample, and the time of the last sample is only
        // derived (approximately) by the missing time in the sum of deltas. Save
        // some work by calculating it here.
        if (nodes.length) {
            nodes[mapId(samples[timeDeltas.length - 1])].selfTime += lastNodeTime;
            timeDeltas.push(lastNodeTime);
        }
        // 3. Add the aggregate times for all node children and locations
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const location = locations[node.locationId];
            location.aggregateTime += computeAggregateTime(i, nodes);
            location.selfTime += node.selfTime;
        }
        return {
            nodes,
            locations,
            samples: samples.map(mapId),
            timeDeltas,
            // rootPath: profile.$vscode?.rootPath,
            duration,
        };
    };
    exports.buildModel = buildModel;
    class BottomUpNode {
        static root() {
            return new BottomUpNode({
                id: -1,
                selfTime: 0,
                aggregateTime: 0,
                ticks: 0,
                callFrame: {
                    functionName: '(root)',
                    lineNumber: -1,
                    columnNumber: -1,
                    scriptId: '0',
                    url: '',
                },
            });
        }
        get id() {
            return this.location.id;
        }
        get callFrame() {
            return this.location.callFrame;
        }
        get src() {
            return this.location.src;
        }
        constructor(location, parent) {
            this.location = location;
            this.parent = parent;
            this.children = {};
            this.aggregateTime = 0;
            this.selfTime = 0;
            this.ticks = 0;
            this.childrenSize = 0;
        }
        addNode(node) {
            this.selfTime += node.selfTime;
            this.aggregateTime += node.aggregateTime;
        }
    }
    exports.BottomUpNode = BottomUpNode;
    const processNode = (aggregate, node, model, initialNode = node) => {
        let child = aggregate.children[node.locationId];
        if (!child) {
            child = new BottomUpNode(model.locations[node.locationId], aggregate);
            aggregate.childrenSize++;
            aggregate.children[node.locationId] = child;
        }
        child.addNode(initialNode);
        if (node.parent) {
            (0, exports.processNode)(child, model.nodes[node.parent], model, initialNode);
        }
    };
    exports.processNode = processNode;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[9/*vs/platform/profiling/electron-sandbox/profileAnalysisWorker*/], __M([0/*require*/,1/*exports*/,5/*vs/base/common/path*/,2/*vs/base/common/ternarySearchTree*/,10/*vs/base/common/uri*/,4/*vs/platform/profiling/common/profiling*/,6/*vs/platform/profiling/common/profilingModel*/]), function (require, exports, path_1, ternarySearchTree_1, uri_1, profiling_1, profilingModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = void 0;
    function create() {
        return new ProfileAnalysisWorker();
    }
    exports.create = create;
    class ProfileAnalysisWorker {
        analyseBottomUp(profile) {
            if (!profiling_1.Utils.isValidProfile(profile)) {
                return { kind: 1 /* ProfilingOutput.Irrelevant */, samples: [] };
            }
            const model = (0, profilingModel_1.buildModel)(profile);
            const samples = bottomUp(model, 5)
                .filter(s => !s.isSpecial);
            if (samples.length === 0 || samples[0].percentage < 10) {
                // ignore this profile because 90% of the time is spent inside "special" frames
                // like idle, GC, or program
                return { kind: 1 /* ProfilingOutput.Irrelevant */, samples: [] };
            }
            return { kind: 2 /* ProfilingOutput.Interesting */, samples };
        }
        analyseByUrlCategory(profile, categories) {
            // build search tree
            const searchTree = ternarySearchTree_1.TernarySearchTree.forUris();
            searchTree.fill(categories);
            // cost by categories
            const model = (0, profilingModel_1.buildModel)(profile);
            const aggegrateByCategory = new Map();
            for (const node of model.nodes) {
                const loc = model.locations[node.locationId];
                let category;
                try {
                    category = searchTree.findSubstr(uri_1.URI.parse(loc.callFrame.url));
                }
                catch {
                    // ignore
                }
                if (!category) {
                    category = printCallFrameShort(loc.callFrame);
                }
                const value = aggegrateByCategory.get(category) ?? 0;
                const newValue = value + node.selfTime;
                aggegrateByCategory.set(category, newValue);
            }
            const result = [];
            for (const [key, value] of aggegrateByCategory) {
                result.push([key, value]);
            }
            return result;
        }
    }
    function isSpecial(call) {
        return call.functionName.startsWith('(') && call.functionName.endsWith(')');
    }
    function printCallFrameShort(frame) {
        let result = frame.functionName || '(anonymous)';
        if (frame.url) {
            result += '#';
            result += (0, path_1.basename)(frame.url);
            if (frame.lineNumber >= 0) {
                result += ':';
                result += frame.lineNumber + 1;
            }
            if (frame.columnNumber >= 0) {
                result += ':';
                result += frame.columnNumber + 1;
            }
        }
        return result;
    }
    function printCallFrameStackLike(frame) {
        let result = frame.functionName || '(anonymous)';
        if (frame.url) {
            result += ' (';
            result += frame.url;
            if (frame.lineNumber >= 0) {
                result += ':';
                result += frame.lineNumber + 1;
            }
            if (frame.columnNumber >= 0) {
                result += ':';
                result += frame.columnNumber + 1;
            }
            result += ')';
        }
        return result;
    }
    function getHeaviestLocationIds(model, topN) {
        const stackSelfTime = {};
        for (const node of model.nodes) {
            stackSelfTime[node.locationId] = (stackSelfTime[node.locationId] || 0) + node.selfTime;
        }
        const locationIds = Object.entries(stackSelfTime)
            .sort(([, a], [, b]) => b - a)
            .slice(0, topN)
            .map(([locationId]) => Number(locationId));
        return new Set(locationIds);
    }
    function bottomUp(model, topN) {
        const root = profilingModel_1.BottomUpNode.root();
        const locationIds = getHeaviestLocationIds(model, topN);
        for (const node of model.nodes) {
            if (locationIds.has(node.locationId)) {
                (0, profilingModel_1.processNode)(root, node, model);
                root.addNode(node);
            }
        }
        const result = Object.values(root.children)
            .sort((a, b) => b.selfTime - a.selfTime)
            .slice(0, topN);
        const samples = [];
        for (const node of result) {
            const sample = {
                selfTime: Math.round(node.selfTime / 1000),
                totalTime: Math.round(node.aggregateTime / 1000),
                location: printCallFrameShort(node.callFrame),
                absLocation: printCallFrameStackLike(node.callFrame),
                url: node.callFrame.url,
                caller: [],
                percentage: Math.round(node.selfTime / (model.duration / 100)),
                isSpecial: isSpecial(node.callFrame)
            };
            // follow the heaviest caller paths
            const stack = [node];
            while (stack.length) {
                const node = stack.pop();
                let top;
                for (const candidate of Object.values(node.children)) {
                    if (!top || top.selfTime < candidate.selfTime) {
                        top = candidate;
                    }
                }
                if (top) {
                    const percentage = Math.round(top.selfTime / (node.selfTime / 100));
                    sample.caller.push({
                        percentage,
                        location: printCallFrameShort(top.callFrame),
                        absLocation: printCallFrameStackLike(top.callFrame),
                    });
                    stack.push(top);
                }
            }
            samples.push(sample);
        }
        return samples;
    }
});

}).call(this);
//# sourceMappingURL=profileAnalysisWorker.js.map
