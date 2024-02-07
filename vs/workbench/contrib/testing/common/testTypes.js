(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/workbench/contrib/testing/common/testId"], function (require, exports, uri_1, position_1, range_1, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractIncrementalTestCollection = exports.TestsDiffOp = exports.TestDiffOpType = exports.IStatementCoverage = exports.IFunctionCoverage = exports.IBranchCoverage = exports.CoverageDetails = exports.DetailType = exports.KEEP_N_LAST_COVERAGE_REPORTS = exports.IFileCoverage = exports.ICoveredCount = exports.TestResultItem = exports.applyTestItemUpdate = exports.ITestItemUpdate = exports.InternalTestItem = exports.TestItemExpandState = exports.ITestItem = exports.denamespaceTestTag = exports.namespaceTestTag = exports.ITestTaskState = exports.ITestMessage = exports.ITestOutputMessage = exports.getMarkId = exports.ITestErrorMessage = exports.TestMessageType = exports.IRichLocation = exports.isStartControllerTests = exports.testRunProfileBitsetList = exports.TestRunProfileBitset = exports.ExtTestRunProfileKind = exports.TestResultState = void 0;
    var TestResultState;
    (function (TestResultState) {
        TestResultState[TestResultState["Unset"] = 0] = "Unset";
        TestResultState[TestResultState["Queued"] = 1] = "Queued";
        TestResultState[TestResultState["Running"] = 2] = "Running";
        TestResultState[TestResultState["Passed"] = 3] = "Passed";
        TestResultState[TestResultState["Failed"] = 4] = "Failed";
        TestResultState[TestResultState["Skipped"] = 5] = "Skipped";
        TestResultState[TestResultState["Errored"] = 6] = "Errored";
    })(TestResultState || (exports.TestResultState = TestResultState = {}));
    /** note: keep in sync with TestRunProfileKind in vscode.d.ts */
    var ExtTestRunProfileKind;
    (function (ExtTestRunProfileKind) {
        ExtTestRunProfileKind[ExtTestRunProfileKind["Run"] = 1] = "Run";
        ExtTestRunProfileKind[ExtTestRunProfileKind["Debug"] = 2] = "Debug";
        ExtTestRunProfileKind[ExtTestRunProfileKind["Coverage"] = 3] = "Coverage";
    })(ExtTestRunProfileKind || (exports.ExtTestRunProfileKind = ExtTestRunProfileKind = {}));
    var TestRunProfileBitset;
    (function (TestRunProfileBitset) {
        TestRunProfileBitset[TestRunProfileBitset["Run"] = 2] = "Run";
        TestRunProfileBitset[TestRunProfileBitset["Debug"] = 4] = "Debug";
        TestRunProfileBitset[TestRunProfileBitset["Coverage"] = 8] = "Coverage";
        TestRunProfileBitset[TestRunProfileBitset["HasNonDefaultProfile"] = 16] = "HasNonDefaultProfile";
        TestRunProfileBitset[TestRunProfileBitset["HasConfigurable"] = 32] = "HasConfigurable";
        TestRunProfileBitset[TestRunProfileBitset["SupportsContinuousRun"] = 64] = "SupportsContinuousRun";
    })(TestRunProfileBitset || (exports.TestRunProfileBitset = TestRunProfileBitset = {}));
    /**
     * List of all test run profile bitset values.
     */
    exports.testRunProfileBitsetList = [
        2 /* TestRunProfileBitset.Run */,
        4 /* TestRunProfileBitset.Debug */,
        8 /* TestRunProfileBitset.Coverage */,
        16 /* TestRunProfileBitset.HasNonDefaultProfile */,
        32 /* TestRunProfileBitset.HasConfigurable */,
        64 /* TestRunProfileBitset.SupportsContinuousRun */,
    ];
    const isStartControllerTests = (t) => 'runId' in t;
    exports.isStartControllerTests = isStartControllerTests;
    var IRichLocation;
    (function (IRichLocation) {
        IRichLocation.serialize = (location) => ({
            range: location.range.toJSON(),
            uri: location.uri.toJSON(),
        });
        IRichLocation.deserialize = (uriIdentity, location) => ({
            range: range_1.Range.lift(location.range),
            uri: uriIdentity.asCanonicalUri(uri_1.URI.revive(location.uri)),
        });
    })(IRichLocation || (exports.IRichLocation = IRichLocation = {}));
    var TestMessageType;
    (function (TestMessageType) {
        TestMessageType[TestMessageType["Error"] = 0] = "Error";
        TestMessageType[TestMessageType["Output"] = 1] = "Output";
    })(TestMessageType || (exports.TestMessageType = TestMessageType = {}));
    var ITestErrorMessage;
    (function (ITestErrorMessage) {
        ITestErrorMessage.serialize = (message) => ({
            message: message.message,
            type: 0 /* TestMessageType.Error */,
            expected: message.expected,
            actual: message.actual,
            contextValue: message.contextValue,
            location: message.location && IRichLocation.serialize(message.location),
        });
        ITestErrorMessage.deserialize = (uriIdentity, message) => ({
            message: message.message,
            type: 0 /* TestMessageType.Error */,
            expected: message.expected,
            actual: message.actual,
            contextValue: message.contextValue,
            location: message.location && IRichLocation.deserialize(uriIdentity, message.location),
        });
    })(ITestErrorMessage || (exports.ITestErrorMessage = ITestErrorMessage = {}));
    /**
     * Gets the TTY marker ID for either starting or ending
     * an ITestOutputMessage.marker of the given ID.
     */
    const getMarkId = (marker, start) => `${start ? 's' : 'e'}${marker}`;
    exports.getMarkId = getMarkId;
    var ITestOutputMessage;
    (function (ITestOutputMessage) {
        ITestOutputMessage.serialize = (message) => ({
            message: message.message,
            type: 1 /* TestMessageType.Output */,
            offset: message.offset,
            length: message.length,
            location: message.location && IRichLocation.serialize(message.location),
        });
        ITestOutputMessage.deserialize = (uriIdentity, message) => ({
            message: message.message,
            type: 1 /* TestMessageType.Output */,
            offset: message.offset,
            length: message.length,
            location: message.location && IRichLocation.deserialize(uriIdentity, message.location),
        });
    })(ITestOutputMessage || (exports.ITestOutputMessage = ITestOutputMessage = {}));
    var ITestMessage;
    (function (ITestMessage) {
        ITestMessage.serialize = (message) => message.type === 0 /* TestMessageType.Error */ ? ITestErrorMessage.serialize(message) : ITestOutputMessage.serialize(message);
        ITestMessage.deserialize = (uriIdentity, message) => message.type === 0 /* TestMessageType.Error */ ? ITestErrorMessage.deserialize(uriIdentity, message) : ITestOutputMessage.deserialize(uriIdentity, message);
    })(ITestMessage || (exports.ITestMessage = ITestMessage = {}));
    var ITestTaskState;
    (function (ITestTaskState) {
        ITestTaskState.serializeWithoutMessages = (state) => ({
            state: state.state,
            duration: state.duration,
            messages: [],
        });
        ITestTaskState.serialize = (state) => ({
            state: state.state,
            duration: state.duration,
            messages: state.messages.map(ITestMessage.serialize),
        });
        ITestTaskState.deserialize = (uriIdentity, state) => ({
            state: state.state,
            duration: state.duration,
            messages: state.messages.map(m => ITestMessage.deserialize(uriIdentity, m)),
        });
    })(ITestTaskState || (exports.ITestTaskState = ITestTaskState = {}));
    const testTagDelimiter = '\0';
    const namespaceTestTag = (ctrlId, tagId) => ctrlId + testTagDelimiter + tagId;
    exports.namespaceTestTag = namespaceTestTag;
    const denamespaceTestTag = (namespaced) => {
        const index = namespaced.indexOf(testTagDelimiter);
        return { ctrlId: namespaced.slice(0, index), tagId: namespaced.slice(index + 1) };
    };
    exports.denamespaceTestTag = denamespaceTestTag;
    var ITestItem;
    (function (ITestItem) {
        ITestItem.serialize = (item) => ({
            extId: item.extId,
            label: item.label,
            tags: item.tags,
            busy: item.busy,
            children: undefined,
            uri: item.uri?.toJSON(),
            range: item.range?.toJSON() || null,
            description: item.description,
            error: item.error,
            sortText: item.sortText
        });
        ITestItem.deserialize = (uriIdentity, serialized) => ({
            extId: serialized.extId,
            label: serialized.label,
            tags: serialized.tags,
            busy: serialized.busy,
            children: undefined,
            uri: serialized.uri ? uriIdentity.asCanonicalUri(uri_1.URI.revive(serialized.uri)) : undefined,
            range: serialized.range ? range_1.Range.lift(serialized.range) : null,
            description: serialized.description,
            error: serialized.error,
            sortText: serialized.sortText
        });
    })(ITestItem || (exports.ITestItem = ITestItem = {}));
    var TestItemExpandState;
    (function (TestItemExpandState) {
        TestItemExpandState[TestItemExpandState["NotExpandable"] = 0] = "NotExpandable";
        TestItemExpandState[TestItemExpandState["Expandable"] = 1] = "Expandable";
        TestItemExpandState[TestItemExpandState["BusyExpanding"] = 2] = "BusyExpanding";
        TestItemExpandState[TestItemExpandState["Expanded"] = 3] = "Expanded";
    })(TestItemExpandState || (exports.TestItemExpandState = TestItemExpandState = {}));
    var InternalTestItem;
    (function (InternalTestItem) {
        InternalTestItem.serialize = (item) => ({
            expand: item.expand,
            item: ITestItem.serialize(item.item)
        });
        InternalTestItem.deserialize = (uriIdentity, serialized) => ({
            // the `controllerId` is derived from the test.item.extId. It's redundant
            // in the non-serialized InternalTestItem too, but there just because it's
            // checked against in many hot paths.
            controllerId: testId_1.TestId.root(serialized.item.extId),
            expand: serialized.expand,
            item: ITestItem.deserialize(uriIdentity, serialized.item)
        });
    })(InternalTestItem || (exports.InternalTestItem = InternalTestItem = {}));
    var ITestItemUpdate;
    (function (ITestItemUpdate) {
        ITestItemUpdate.serialize = (u) => {
            let item;
            if (u.item) {
                item = {};
                if (u.item.label !== undefined) {
                    item.label = u.item.label;
                }
                if (u.item.tags !== undefined) {
                    item.tags = u.item.tags;
                }
                if (u.item.busy !== undefined) {
                    item.busy = u.item.busy;
                }
                if (u.item.uri !== undefined) {
                    item.uri = u.item.uri?.toJSON();
                }
                if (u.item.range !== undefined) {
                    item.range = u.item.range?.toJSON();
                }
                if (u.item.description !== undefined) {
                    item.description = u.item.description;
                }
                if (u.item.error !== undefined) {
                    item.error = u.item.error;
                }
                if (u.item.sortText !== undefined) {
                    item.sortText = u.item.sortText;
                }
            }
            return { extId: u.extId, expand: u.expand, item };
        };
        ITestItemUpdate.deserialize = (u) => {
            let item;
            if (u.item) {
                item = {};
                if (u.item.label !== undefined) {
                    item.label = u.item.label;
                }
                if (u.item.tags !== undefined) {
                    item.tags = u.item.tags;
                }
                if (u.item.busy !== undefined) {
                    item.busy = u.item.busy;
                }
                if (u.item.range !== undefined) {
                    item.range = u.item.range ? range_1.Range.lift(u.item.range) : null;
                }
                if (u.item.description !== undefined) {
                    item.description = u.item.description;
                }
                if (u.item.error !== undefined) {
                    item.error = u.item.error;
                }
                if (u.item.sortText !== undefined) {
                    item.sortText = u.item.sortText;
                }
            }
            return { extId: u.extId, expand: u.expand, item };
        };
    })(ITestItemUpdate || (exports.ITestItemUpdate = ITestItemUpdate = {}));
    const applyTestItemUpdate = (internal, patch) => {
        if (patch.expand !== undefined) {
            internal.expand = patch.expand;
        }
        if (patch.item !== undefined) {
            internal.item = internal.item ? Object.assign(internal.item, patch.item) : patch.item;
        }
    };
    exports.applyTestItemUpdate = applyTestItemUpdate;
    var TestResultItem;
    (function (TestResultItem) {
        TestResultItem.serializeWithoutMessages = (original) => ({
            ...InternalTestItem.serialize(original),
            ownComputedState: original.ownComputedState,
            computedState: original.computedState,
            tasks: original.tasks.map(ITestTaskState.serializeWithoutMessages),
        });
        TestResultItem.serialize = (original) => ({
            ...InternalTestItem.serialize(original),
            ownComputedState: original.ownComputedState,
            computedState: original.computedState,
            tasks: original.tasks.map(ITestTaskState.serialize),
        });
        TestResultItem.deserialize = (uriIdentity, serialized) => ({
            ...InternalTestItem.deserialize(uriIdentity, serialized),
            ownComputedState: serialized.ownComputedState,
            computedState: serialized.computedState,
            tasks: serialized.tasks.map(m => ITestTaskState.deserialize(uriIdentity, m)),
            retired: true,
        });
    })(TestResultItem || (exports.TestResultItem = TestResultItem = {}));
    var ICoveredCount;
    (function (ICoveredCount) {
        ICoveredCount.empty = () => ({ covered: 0, total: 0 });
        ICoveredCount.sum = (target, src) => {
            target.covered += src.covered;
            target.total += src.total;
        };
    })(ICoveredCount || (exports.ICoveredCount = ICoveredCount = {}));
    var IFileCoverage;
    (function (IFileCoverage) {
        IFileCoverage.serialize = (original) => ({
            statement: original.statement,
            branch: original.branch,
            function: original.function,
            details: original.details?.map(CoverageDetails.serialize),
            uri: original.uri.toJSON(),
        });
        IFileCoverage.deserialize = (uriIdentity, serialized) => ({
            statement: serialized.statement,
            branch: serialized.branch,
            function: serialized.function,
            details: serialized.details?.map(CoverageDetails.deserialize),
            uri: uriIdentity.asCanonicalUri(uri_1.URI.revive(serialized.uri)),
        });
    })(IFileCoverage || (exports.IFileCoverage = IFileCoverage = {}));
    function serializeThingWithLocation(serialized) {
        return {
            ...serialized,
            location: serialized.location?.toJSON(),
        };
    }
    function deserializeThingWithLocation(serialized) {
        serialized.location = serialized.location ? (position_1.Position.isIPosition(serialized.location) ? position_1.Position.lift(serialized.location) : range_1.Range.lift(serialized.location)) : undefined;
        return serialized;
    }
    /** Number of recent runs in which coverage reports should be retained. */
    exports.KEEP_N_LAST_COVERAGE_REPORTS = 3;
    var DetailType;
    (function (DetailType) {
        DetailType[DetailType["Function"] = 0] = "Function";
        DetailType[DetailType["Statement"] = 1] = "Statement";
        DetailType[DetailType["Branch"] = 2] = "Branch";
    })(DetailType || (exports.DetailType = DetailType = {}));
    var CoverageDetails;
    (function (CoverageDetails) {
        CoverageDetails.serialize = (original) => original.type === 0 /* DetailType.Function */ ? IFunctionCoverage.serialize(original) : IStatementCoverage.serialize(original);
        CoverageDetails.deserialize = (serialized) => serialized.type === 0 /* DetailType.Function */ ? IFunctionCoverage.deserialize(serialized) : IStatementCoverage.deserialize(serialized);
    })(CoverageDetails || (exports.CoverageDetails = CoverageDetails = {}));
    var IBranchCoverage;
    (function (IBranchCoverage) {
        IBranchCoverage.serialize = serializeThingWithLocation;
        IBranchCoverage.deserialize = deserializeThingWithLocation;
    })(IBranchCoverage || (exports.IBranchCoverage = IBranchCoverage = {}));
    var IFunctionCoverage;
    (function (IFunctionCoverage) {
        IFunctionCoverage.serialize = serializeThingWithLocation;
        IFunctionCoverage.deserialize = deserializeThingWithLocation;
    })(IFunctionCoverage || (exports.IFunctionCoverage = IFunctionCoverage = {}));
    var IStatementCoverage;
    (function (IStatementCoverage) {
        IStatementCoverage.serialize = (original) => ({
            ...serializeThingWithLocation(original),
            branches: original.branches?.map(IBranchCoverage.serialize),
        });
        IStatementCoverage.deserialize = (serialized) => ({
            ...deserializeThingWithLocation(serialized),
            branches: serialized.branches?.map(IBranchCoverage.deserialize),
        });
    })(IStatementCoverage || (exports.IStatementCoverage = IStatementCoverage = {}));
    var TestDiffOpType;
    (function (TestDiffOpType) {
        /** Adds a new test (with children) */
        TestDiffOpType[TestDiffOpType["Add"] = 0] = "Add";
        /** Shallow-updates an existing test */
        TestDiffOpType[TestDiffOpType["Update"] = 1] = "Update";
        /** Ranges of some tests in a document were synced, so it should be considered up-to-date */
        TestDiffOpType[TestDiffOpType["DocumentSynced"] = 2] = "DocumentSynced";
        /** Removes a test (and all its children) */
        TestDiffOpType[TestDiffOpType["Remove"] = 3] = "Remove";
        /** Changes the number of controllers who are yet to publish their collection roots. */
        TestDiffOpType[TestDiffOpType["IncrementPendingExtHosts"] = 4] = "IncrementPendingExtHosts";
        /** Retires a test/result */
        TestDiffOpType[TestDiffOpType["Retire"] = 5] = "Retire";
        /** Add a new test tag */
        TestDiffOpType[TestDiffOpType["AddTag"] = 6] = "AddTag";
        /** Remove a test tag */
        TestDiffOpType[TestDiffOpType["RemoveTag"] = 7] = "RemoveTag";
    })(TestDiffOpType || (exports.TestDiffOpType = TestDiffOpType = {}));
    var TestsDiffOp;
    (function (TestsDiffOp) {
        TestsDiffOp.deserialize = (uriIdentity, u) => {
            if (u.op === 0 /* TestDiffOpType.Add */) {
                return { op: u.op, item: InternalTestItem.deserialize(uriIdentity, u.item) };
            }
            else if (u.op === 1 /* TestDiffOpType.Update */) {
                return { op: u.op, item: ITestItemUpdate.deserialize(u.item) };
            }
            else if (u.op === 2 /* TestDiffOpType.DocumentSynced */) {
                return { op: u.op, uri: uriIdentity.asCanonicalUri(uri_1.URI.revive(u.uri)), docv: u.docv };
            }
            else {
                return u;
            }
        };
        TestsDiffOp.serialize = (u) => {
            if (u.op === 0 /* TestDiffOpType.Add */) {
                return { op: u.op, item: InternalTestItem.serialize(u.item) };
            }
            else if (u.op === 1 /* TestDiffOpType.Update */) {
                return { op: u.op, item: ITestItemUpdate.serialize(u.item) };
            }
            else {
                return u;
            }
        };
    })(TestsDiffOp || (exports.TestsDiffOp = TestsDiffOp = {}));
    /**
     * Maintains tests in this extension host sent from the main thread.
     */
    class AbstractIncrementalTestCollection {
        constructor(uriIdentity) {
            this.uriIdentity = uriIdentity;
            this._tags = new Map();
            /**
             * Map of item IDs to test item objects.
             */
            this.items = new Map();
            /**
             * ID of test root items.
             */
            this.roots = new Set();
            /**
             * Number of 'busy' controllers.
             */
            this.busyControllerCount = 0;
            /**
             * Number of pending roots.
             */
            this.pendingRootCount = 0;
            /**
             * Known test tags.
             */
            this.tags = this._tags;
        }
        /**
         * Applies the diff to the collection.
         */
        apply(diff) {
            const changes = this.createChangeCollector();
            for (const op of diff) {
                switch (op.op) {
                    case 0 /* TestDiffOpType.Add */:
                        this.add(InternalTestItem.deserialize(this.uriIdentity, op.item), changes);
                        break;
                    case 1 /* TestDiffOpType.Update */:
                        this.update(ITestItemUpdate.deserialize(op.item), changes);
                        break;
                    case 3 /* TestDiffOpType.Remove */:
                        this.remove(op.itemId, changes);
                        break;
                    case 5 /* TestDiffOpType.Retire */:
                        this.retireTest(op.itemId);
                        break;
                    case 4 /* TestDiffOpType.IncrementPendingExtHosts */:
                        this.updatePendingRoots(op.amount);
                        break;
                    case 6 /* TestDiffOpType.AddTag */:
                        this._tags.set(op.tag.id, op.tag);
                        break;
                    case 7 /* TestDiffOpType.RemoveTag */:
                        this._tags.delete(op.id);
                        break;
                }
            }
            changes.complete?.();
        }
        add(item, changes) {
            const parentId = testId_1.TestId.parentId(item.item.extId)?.toString();
            let created;
            if (!parentId) {
                created = this.createItem(item);
                this.roots.add(created);
                this.items.set(item.item.extId, created);
            }
            else if (this.items.has(parentId)) {
                const parent = this.items.get(parentId);
                parent.children.add(item.item.extId);
                created = this.createItem(item, parent);
                this.items.set(item.item.extId, created);
            }
            else {
                console.error(`Test with unknown parent ID: ${JSON.stringify(item)}`);
                return;
            }
            changes.add?.(created);
            if (item.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                this.busyControllerCount++;
            }
            return created;
        }
        update(patch, changes) {
            const existing = this.items.get(patch.extId);
            if (!existing) {
                return;
            }
            if (patch.expand !== undefined) {
                if (existing.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                    this.busyControllerCount--;
                }
                if (patch.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                    this.busyControllerCount++;
                }
            }
            (0, exports.applyTestItemUpdate)(existing, patch);
            changes.update?.(existing);
            return existing;
        }
        remove(itemId, changes) {
            const toRemove = this.items.get(itemId);
            if (!toRemove) {
                return;
            }
            const parentId = testId_1.TestId.parentId(toRemove.item.extId)?.toString();
            if (parentId) {
                const parent = this.items.get(parentId);
                parent.children.delete(toRemove.item.extId);
            }
            else {
                this.roots.delete(toRemove);
            }
            const queue = [[itemId]];
            while (queue.length) {
                for (const itemId of queue.pop()) {
                    const existing = this.items.get(itemId);
                    if (existing) {
                        queue.push(existing.children);
                        this.items.delete(itemId);
                        changes.remove?.(existing, existing !== toRemove);
                        if (existing.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                            this.busyControllerCount--;
                        }
                    }
                }
            }
        }
        /**
         * Called when the extension signals a test result should be retired.
         */
        retireTest(testId) {
            // no-op
        }
        /**
         * Updates the number of test root sources who are yet to report. When
         * the total pending test roots reaches 0, the roots for all controllers
         * will exist in the collection.
         */
        updatePendingRoots(delta) {
            this.pendingRootCount += delta;
        }
        /**
         * Called before a diff is applied to create a new change collector.
         */
        createChangeCollector() {
            return {};
        }
    }
    exports.AbstractIncrementalTestCollection = AbstractIncrementalTestCollection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFR5cGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2NvbW1vbi90ZXN0VHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLElBQWtCLGVBUWpCO0lBUkQsV0FBa0IsZUFBZTtRQUNoQyx1REFBUyxDQUFBO1FBQ1QseURBQVUsQ0FBQTtRQUNWLDJEQUFXLENBQUE7UUFDWCx5REFBVSxDQUFBO1FBQ1YseURBQVUsQ0FBQTtRQUNWLDJEQUFXLENBQUE7UUFDWCwyREFBVyxDQUFBO0lBQ1osQ0FBQyxFQVJpQixlQUFlLCtCQUFmLGVBQWUsUUFRaEM7SUFFRCxnRUFBZ0U7SUFDaEUsSUFBa0IscUJBSWpCO0lBSkQsV0FBa0IscUJBQXFCO1FBQ3RDLCtEQUFPLENBQUE7UUFDUCxtRUFBUyxDQUFBO1FBQ1QseUVBQVksQ0FBQTtJQUNiLENBQUMsRUFKaUIscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFJdEM7SUFFRCxJQUFrQixvQkFPakI7SUFQRCxXQUFrQixvQkFBb0I7UUFDckMsNkRBQVksQ0FBQTtRQUNaLGlFQUFjLENBQUE7UUFDZCx1RUFBaUIsQ0FBQTtRQUNqQixnR0FBNkIsQ0FBQTtRQUM3QixzRkFBd0IsQ0FBQTtRQUN4QixrR0FBOEIsQ0FBQTtJQUMvQixDQUFDLEVBUGlCLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBT3JDO0lBRUQ7O09BRUc7SUFDVSxRQUFBLHdCQUF3QixHQUFHOzs7Ozs7O0tBT3ZDLENBQUM7SUE4REssTUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQWlELEVBQThCLEVBQUUsQ0FBRSxPQUF1QyxJQUFJLENBQUMsQ0FBQztJQUExSixRQUFBLHNCQUFzQiwwQkFBb0k7SUEyQnZLLElBQWlCLGFBQWEsQ0FlN0I7SUFmRCxXQUFpQixhQUFhO1FBTWhCLHVC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
//# sourceURL=../../../vs/workbench/contrib/testing/common/testTypes.js
})