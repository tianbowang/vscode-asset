/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/map", "vs/base/common/prefixTree", "vs/base/common/uri", "vs/workbench/contrib/testing/common/testTypes"], function (require, exports, cancellation_1, map_1, prefixTree_1, uri_1, testTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileCoverage = exports.ComputedFileCoverage = exports.AbstractFileCoverage = exports.getTotalCoveragePercent = exports.TestCoverage = void 0;
    /**
     * Class that exposese coverage information for a run.
     */
    class TestCoverage {
        static async load(taskId, accessor, uriIdentityService, token) {
            const files = await accessor.provideFileCoverage(token);
            const map = new map_1.ResourceMap();
            for (const [i, file] of files.entries()) {
                map.set(file.uri, new FileCoverage(file, i, accessor));
            }
            return new TestCoverage(taskId, map, uriIdentityService);
        }
        get tree() {
            return this._tree ??= this.buildCoverageTree();
        }
        constructor(fromTaskId, fileCoverage, uriIdentityService) {
            this.fromTaskId = fromTaskId;
            this.fileCoverage = fileCoverage;
            this.uriIdentityService = uriIdentityService;
            this.associatedData = new Map();
        }
        /**
         * Gets coverage information for all files.
         */
        getAllFiles() {
            return this.fileCoverage;
        }
        /**
         * Gets coverage information for a specific file.
         */
        getUri(uri) {
            return this.fileCoverage.get(uri);
        }
        /**
         * Gets computed information for a file, including DFS-computed information
         * from child tests.
         */
        getComputedForUri(uri) {
            return this.tree.find(this.treePathForUri(uri, /* canonical = */ false));
        }
        buildCoverageTree() {
            const tree = new prefixTree_1.WellDefinedPrefixTree();
            const nodeCanonicalSegments = new Map();
            // 1. Initial iteration. We insert based on the case-erased file path, and
            // then tag the nodes with their 'canonical' path segment preserving the
            // original casing we were given, to avoid #200604
            for (const file of this.fileCoverage.values()) {
                const keyPath = this.treePathForUri(file.uri, /* canonical = */ false);
                const canonicalPath = this.treePathForUri(file.uri, /* canonical = */ true);
                tree.insert(keyPath, file, node => {
                    nodeCanonicalSegments.set(node, canonicalPath.next().value);
                });
            }
            // 2. Depth-first iteration to create computed nodes
            const calculateComputed = (path, node) => {
                if (node.value) {
                    return node.value;
                }
                const fileCoverage = {
                    uri: this.treePathToUri(path),
                    statement: testTypes_1.ICoveredCount.empty(),
                };
                if (node.children) {
                    for (const [prefix, child] of node.children) {
                        path.push(nodeCanonicalSegments.get(child) || prefix);
                        const v = calculateComputed(path, child);
                        path.pop();
                        testTypes_1.ICoveredCount.sum(fileCoverage.statement, v.statement);
                        if (v.branch) {
                            testTypes_1.ICoveredCount.sum(fileCoverage.branch ??= testTypes_1.ICoveredCount.empty(), v.branch);
                        }
                        if (v.function) {
                            testTypes_1.ICoveredCount.sum(fileCoverage.function ??= testTypes_1.ICoveredCount.empty(), v.function);
                        }
                    }
                }
                return node.value = new ComputedFileCoverage(fileCoverage);
            };
            for (const node of tree.nodes) {
                calculateComputed([], node);
            }
            return tree;
        }
        *treePathForUri(uri, canconicalPath) {
            yield uri.scheme;
            yield uri.authority;
            const path = !canconicalPath && this.uriIdentityService.extUri.ignorePathCasing(uri) ? uri.path.toLowerCase() : uri.path;
            yield* path.split('/');
        }
        treePathToUri(path) {
            return uri_1.URI.from({ scheme: path[0], authority: path[1], path: path.slice(2).join('/') });
        }
    }
    exports.TestCoverage = TestCoverage;
    const getTotalCoveragePercent = (statement, branch, function_) => {
        let numerator = statement.covered;
        let denominator = statement.total;
        if (branch) {
            numerator += branch.covered;
            denominator += branch.total;
        }
        if (function_) {
            numerator += function_.covered;
            denominator += function_.total;
        }
        return denominator === 0 ? 1 : numerator / denominator;
    };
    exports.getTotalCoveragePercent = getTotalCoveragePercent;
    class AbstractFileCoverage {
        /**
         * Gets the total coverage percent based on information provided.
         * This is based on the Clover total coverage formula
         */
        get tpc() {
            return (0, exports.getTotalCoveragePercent)(this.statement, this.branch, this.function);
        }
        constructor(coverage) {
            this.uri = coverage.uri;
            this.statement = coverage.statement;
            this.branch = coverage.branch;
            this.function = coverage.function;
        }
    }
    exports.AbstractFileCoverage = AbstractFileCoverage;
    /**
     * File coverage info computed from children in the tree, not provided by the
     * extension.
     */
    class ComputedFileCoverage extends AbstractFileCoverage {
    }
    exports.ComputedFileCoverage = ComputedFileCoverage;
    class FileCoverage extends AbstractFileCoverage {
        /** Gets whether details are synchronously available */
        get hasSynchronousDetails() {
            return this._details instanceof Array || this.resolved;
        }
        constructor(coverage, index, accessor) {
            super(coverage);
            this.index = index;
            this.accessor = accessor;
            this._details = coverage.details;
        }
        /**
         * Gets per-line coverage details.
         */
        async details(token = cancellation_1.CancellationToken.None) {
            this._details ??= this.accessor.resolveFileCoverage(this.index, token);
            try {
                const d = await this._details;
                this.resolved = true;
                return d;
            }
            catch (e) {
                this._details = undefined;
                throw e;
            }
        }
    }
    exports.FileCoverage = FileCoverage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvdmVyYWdlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2NvbW1vbi90ZXN0Q292ZXJhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHOztPQUVHO0lBQ0gsTUFBYSxZQUFZO1FBR2pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQWMsRUFBRSxRQUEyQixFQUFFLGtCQUF1QyxFQUFFLEtBQXdCO1lBQ3RJLE1BQU0sS0FBSyxHQUFHLE1BQU0sUUFBUSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hELE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQVcsRUFBZ0IsQ0FBQztZQUM1QyxLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7Z0JBQ3pDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDeEQsQ0FBQztZQUNELE9BQU8sSUFBSSxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxJQUFXLElBQUk7WUFDZCxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUlELFlBQ2lCLFVBQWtCLEVBQ2pCLFlBQXVDLEVBQ3ZDLGtCQUF1QztZQUZ4QyxlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQ2pCLGlCQUFZLEdBQVosWUFBWSxDQUEyQjtZQUN2Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBTHpDLG1CQUFjLEdBQUcs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