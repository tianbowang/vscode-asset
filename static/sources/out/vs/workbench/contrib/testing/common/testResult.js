/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/platform", "vs/base/common/strings", "vs/nls", "vs/workbench/contrib/testing/common/getComputedState", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testTypes"], function (require, exports, async_1, buffer_1, event_1, lazy_1, lifecycle_1, observable_1, platform_1, strings_1, nls_1, getComputedState_1, testId_1, testingStates_1, testTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HydratedTestResult = exports.LiveTestResult = exports.TestResultItemChangeReason = exports.maxCountPriority = exports.resultItemParents = exports.TaskRawOutput = void 0;
    const emptyRawOutput = {
        buffers: [],
        length: 0,
        onDidWriteData: event_1.Event.None,
        endPromise: Promise.resolve(),
        getRange: () => buffer_1.VSBuffer.alloc(0),
        getRangeIter: () => [],
    };
    class TaskRawOutput {
        constructor() {
            this.writeDataEmitter = new event_1.Emitter();
            this.endDeferred = new async_1.DeferredPromise();
            this.offset = 0;
            /** @inheritdoc */
            this.onDidWriteData = this.writeDataEmitter.event;
            /** @inheritdoc */
            this.endPromise = this.endDeferred.p;
            /** @inheritdoc */
            this.buffers = [];
        }
        /** @inheritdoc */
        get length() {
            return this.offset;
        }
        /** @inheritdoc */
        getRange(start, length) {
            const buf = buffer_1.VSBuffer.alloc(length);
            let bufLastWrite = 0;
            for (const chunk of this.getRangeIter(start, length)) {
                buf.buffer.set(chunk.buffer, bufLastWrite);
                bufLastWrite += chunk.byteLength;
            }
            return bufLastWrite < length ? buf.slice(0, bufLastWrite) : buf;
        }
        /** @inheritdoc */
        *getRangeIter(start, length) {
            let soFar = 0;
            let internalLastRead = 0;
            for (const b of this.buffers) {
                if (internalLastRead + b.byteLength <= start) {
                    internalLastRead += b.byteLength;
                    continue;
                }
                const bstart = Math.max(0, start - internalLastRead);
                const bend = Math.min(b.byteLength, bstart + length - soFar);
                yield b.slice(bstart, bend);
                soFar += bend - bstart;
                internalLastRead += b.byteLength;
                if (soFar === length) {
                    break;
                }
            }
        }
        /**
         * Appends data to the output, returning the byte range where the data can be found.
         */
        append(data, marker) {
            const offset = this.offset;
            let length = data.byteLength;
            if (marker === undefined) {
                this.push(data);
                return { offset, length };
            }
            // Bytes that should be 'trimmed' off the end of data. This is done because
            // selections in the terminal are based on the entire line, and commonly
            // the interesting marked range has a trailing new line. We don't want to
            // select the trailing line (which might have other data)
            // so we place the marker before all trailing trimbytes.
            let TrimBytes;
            (function (TrimBytes) {
                TrimBytes[TrimBytes["CR"] = 13] = "CR";
                TrimBytes[TrimBytes["LF"] = 10] = "LF";
            })(TrimBytes || (TrimBytes = {}));
            const start = buffer_1.VSBuffer.fromString(getMarkCode(marker, true));
            const end = buffer_1.VSBuffer.fromString(getMarkCode(marker, false));
            length += start.byteLength + end.byteLength;
            this.push(start);
            let trimLen = data.byteLength;
            for (; trimLen > 0; trimLen--) {
                const last = data.buffer[trimLen - 1];
                if (last !== 13 /* TrimBytes.CR */ && last !== 10 /* TrimBytes.LF */) {
                    break;
                }
            }
            this.push(data.slice(0, trimLen));
            this.push(end);
            this.push(data.slice(trimLen));
            return { offset, length };
        }
        push(data) {
            if (data.byteLength === 0) {
                return;
            }
            this.buffers.push(data);
            this.writeDataEmitter.fire(data);
            this.offset += data.byteLength;
        }
        /** Signals the output has ended. */
        end() {
            this.endDeferred.complete();
        }
    }
    exports.TaskRawOutput = TaskRawOutput;
    const resultItemParents = function* (results, item) {
        for (const id of testId_1.TestId.fromString(item.item.extId).idsToRoot()) {
            yield results.getStateById(id.toString());
        }
    };
    exports.resultItemParents = resultItemParents;
    const maxCountPriority = (counts) => {
        for (const state of testingStates_1.statesInOrder) {
            if (counts[state] > 0) {
                return state;
            }
        }
        return 0 /* TestResultState.Unset */;
    };
    exports.maxCountPriority = maxCountPriority;
    const getMarkCode = (marker, start) => `\x1b]633;SetMark;Id=${(0, testTypes_1.getMarkId)(marker, start)};Hidden\x07`;
    const itemToNode = (controllerId, item, parent) => ({
        controllerId,
        expand: 0 /* TestItemExpandState.NotExpandable */,
        item: { ...item },
        children: [],
        tasks: [],
        ownComputedState: 0 /* TestResultState.Unset */,
        computedState: 0 /* TestResultState.Unset */,
    });
    var TestResultItemChangeReason;
    (function (TestResultItemChangeReason) {
        TestResultItemChangeReason[TestResultItemChangeReason["ComputedStateChange"] = 0] = "ComputedStateChange";
        TestResultItemChangeReason[TestResultItemChangeReason["OwnStateChange"] = 1] = "OwnStateChange";
        TestResultItemChangeReason[TestResultItemChangeReason["NewMessage"] = 2] = "NewMessage";
    })(TestResultItemChangeReason || (exports.TestResultItemChangeReason = TestResultItemChangeReason = {}));
    /**
     * Results of a test. These are created when the test initially started running
     * and marked as "complete" when the run finishes.
     */
    class LiveTestResult extends lifecycle_1.Disposable {
        /**
         * @inheritdoc
         */
        get completedAt() {
            return this._completedAt;
        }
        /**
         * @inheritdoc
         */
        get tests() {
            return this.testById.values();
        }
        constructor(id, persist, request) {
            super();
            this.id = id;
            this.persist = persist;
            this.request = request;
            this.completeEmitter = this._register(new event_1.Emitter());
            this.newTaskEmitter = this._register(new event_1.Emitter());
            this.endTaskEmitter = this._register(new event_1.Emitter());
            this.changeEmitter = this._register(new event_1.Emitter());
            /** todo@connor4312: convert to a WellDefinedPrefixTree */
            this.testById = new Map();
            this.testMarkerCounter = 0;
            this.startedAt = Date.now();
            this.onChange = this.changeEmitter.event;
            this.onComplete = this.completeEmitter.event;
            this.onNewTask = this.newTaskEmitter.event;
            this.onEndTask = this.endTaskEmitter.event;
            this.tasks = [];
            this.name = (0, nls_1.localize)('runFinished', 'Test run at {0}', new Date().toLocaleString(platform_1.language));
            /**
             * @inheritdoc
             */
            this.counts = (0, testingStates_1.makeEmptyCounts)();
            this.computedStateAccessor = {
                getOwnState: i => i.ownComputedState,
                getCurrentComputedState: i => i.computedState,
                setComputedState: (i, s) => i.computedState = s,
                getChildren: i => i.children,
                getParents: i => {
                    const { testById: testByExtId } = this;
                    return (function* () {
                        const parentId = testId_1.TestId.fromString(i.item.extId).parentId;
                        if (parentId) {
                            for (const id of parentId.idsToRoot()) {
                                yield testByExtId.get(id.toString());
                            }
                        }
                    })();
                },
            };
            this.doSerialize = new lazy_1.Lazy(() => ({
                id: this.id,
                completedAt: this.completedAt,
                tasks: this.tasks.map(t => ({ id: t.id, name: t.name })),
                name: this.name,
                request: this.request,
                items: [...this.testById.values()].map(testTypes_1.TestResultItem.serializeWithoutMessages),
            }));
            this.doSerializeWithMessages = new lazy_1.Lazy(() => ({
                id: this.id,
                completedAt: this.completedAt,
                tasks: this.tasks.map(t => ({ id: t.id, name: t.name })),
                name: this.name,
                request: this.request,
                items: [...this.testById.values()].map(testTypes_1.TestResultItem.serialize),
            }));
        }
        /**
         * @inheritdoc
         */
        getStateById(extTestId) {
            return this.testById.get(extTestId);
        }
        /**
         * Appends output that occurred during the test run.
         */
        appendOutput(output, taskId, location, testId) {
            const preview = output.byteLength > 100 ? output.slice(0, 100).toString() + '…' : output.toString();
            let marker;
            // currently, the UI only exposes jump-to-message from tests or locations,
            // so no need to mark outputs that don't come from either of those.
            if (testId || location) {
                marker = this.testMarkerCounter++;
            }
            const index = this.mustGetTaskIndex(taskId);
            const task = this.tasks[index];
            const { offset, length } = task.output.append(output, marker);
            const message = {
                location,
                message: (0, strings_1.removeAnsiEscapeCodes)(preview),
                offset,
                length,
                marker,
                type: 1 /* TestMessageType.Output */,
            };
            const test = testId && this.testById.get(testId);
            if (test) {
                test.tasks[index].messages.push(message);
                this.changeEmitter.fire({ item: test, result: this, reason: 2 /* TestResultItemChangeReason.NewMessage */, message });
            }
            else {
                task.otherMessages.push(message);
            }
        }
        /**
         * Adds a new run task to the results.
         */
        addTask(task) {
            this.tasks.push({ ...task, coverage: (0, observable_1.observableValue)(this, undefined), otherMessages: [], output: new TaskRawOutput() });
            for (const test of this.tests) {
                test.tasks.push({ duration: undefined, messages: [], state: 0 /* TestResultState.Unset */ });
            }
            this.newTaskEmitter.fire(this.tasks.length - 1);
        }
        /**
         * Add the chain of tests to the run. The first test in the chain should
         * be either a test root, or a previously-known test.
         */
        addTestChainToRun(controllerId, chain) {
            let parent = this.testById.get(chain[0].extId);
            if (!parent) { // must be a test root
                parent = this.addTestToRun(controllerId, chain[0], null);
            }
            for (let i = 1; i < chain.length; i++) {
                parent = this.addTestToRun(controllerId, chain[i], parent.item.extId);
            }
            return undefined;
        }
        /**
         * Updates the state of the test by its internal ID.
         */
        updateState(testId, taskId, state, duration) {
            const entry = this.testById.get(testId);
            if (!entry) {
                return;
            }
            const index = this.mustGetTaskIndex(taskId);
            const oldTerminalStatePrio = testingStates_1.terminalStatePriorities[entry.tasks[index].state];
            const newTerminalStatePrio = testingStates_1.terminalStatePriorities[state];
            // Ignore requests to set the state from one terminal state back to a
            // "lower" one, e.g. from failed back to passed:
            if (oldTerminalStatePrio !== undefined &&
                (newTerminalStatePrio === undefined || newTerminalStatePrio < oldTerminalStatePrio)) {
                return;
            }
            this.fireUpdateAndRefresh(entry, index, state, duration);
        }
        /**
         * Appends a message for the test in the run.
         */
        appendMessage(testId, taskId, message) {
            const entry = this.testById.get(testId);
            if (!entry) {
                return;
            }
            entry.tasks[this.mustGetTaskIndex(taskId)].messages.push(message);
            this.changeEmitter.fire({ item: entry, result: this, reason: 2 /* TestResultItemChangeReason.NewMessage */, message });
        }
        /**
         * Marks the task in the test run complete.
         */
        markTaskComplete(taskId) {
            const index = this.mustGetTaskIndex(taskId);
            const task = this.tasks[index];
            task.running = false;
            task.output.end();
            this.setAllToState(0 /* TestResultState.Unset */, taskId, t => t.state === 1 /* TestResultState.Queued */ || t.state === 2 /* TestResultState.Running */);
            this.endTaskEmitter.fire(index);
        }
        /**
         * Notifies the service that all tests are complete.
         */
        markComplete() {
            if (this._completedAt !== undefined) {
                throw new Error('cannot complete a test result multiple times');
            }
            for (const task of this.tasks) {
                if (task.running) {
                    this.markTaskComplete(task.id);
                }
            }
            this._completedAt = Date.now();
            this.completeEmitter.fire();
        }
        /**
         * Marks the test and all of its children in the run as retired.
         */
        markRetired(testIds) {
            for (const [id, test] of this.testById) {
                if (!test.retired && (!testIds || testIds.hasKeyOrParent(testId_1.TestId.fromString(id).path))) {
                    test.retired = true;
                    this.changeEmitter.fire({ reason: 0 /* TestResultItemChangeReason.ComputedStateChange */, item: test, result: this });
                }
            }
        }
        /**
         * @inheritdoc
         */
        toJSON() {
            return this.completedAt && this.persist ? this.doSerialize.value : undefined;
        }
        toJSONWithMessages() {
            return this.completedAt && this.persist ? this.doSerializeWithMessages.value : undefined;
        }
        /**
         * Updates all tests in the collection to the given state.
         */
        setAllToState(state, taskId, when) {
            const index = this.mustGetTaskIndex(taskId);
            for (const test of this.testById.values()) {
                if (when(test.tasks[index], test)) {
                    this.fireUpdateAndRefresh(test, index, state);
                }
            }
        }
        fireUpdateAndRefresh(entry, taskIndex, newState, newOwnDuration) {
            const previousOwnComputed = entry.ownComputedState;
            const previousOwnDuration = entry.ownDuration;
            const changeEvent = {
                item: entry,
                result: this,
                reason: 1 /* TestResultItemChangeReason.OwnStateChange */,
                previousState: previousOwnComputed,
                previousOwnDuration: previousOwnDuration,
            };
            entry.tasks[taskIndex].state = newState;
            if (newOwnDuration !== undefined) {
                entry.tasks[taskIndex].duration = newOwnDuration;
                entry.ownDuration = Math.max(entry.ownDuration || 0, newOwnDuration);
            }
            const newOwnComputed = (0, testingStates_1.maxPriority)(...entry.tasks.map(t => t.state));
            if (newOwnComputed === previousOwnComputed) {
                if (newOwnDuration !== previousOwnDuration) {
                    this.changeEmitter.fire(changeEvent); // fire manually since state change won't do it
                }
                return;
            }
            entry.ownComputedState = newOwnComputed;
            this.counts[previousOwnComputed]--;
            this.counts[newOwnComputed]++;
            (0, getComputedState_1.refreshComputedState)(this.computedStateAccessor, entry).forEach(t => this.changeEmitter.fire(t === entry ? changeEvent : {
                item: t,
                result: this,
                reason: 0 /* TestResultItemChangeReason.ComputedStateChange */,
            }));
        }
        addTestToRun(controllerId, item, parent) {
            const node = itemToNode(controllerId, item, parent);
            this.testById.set(item.extId, node);
            this.counts[0 /* TestResultState.Unset */]++;
            if (parent) {
                this.testById.get(parent)?.children.push(node);
            }
            if (this.tasks.length) {
                for (let i = 0; i < this.tasks.length; i++) {
                    node.tasks.push({ duration: undefined, messages: [], state: 0 /* TestResultState.Unset */ });
                }
            }
            return node;
        }
        mustGetTaskIndex(taskId) {
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index === -1) {
                throw new Error(`Unknown task ${taskId} in updateState`);
            }
            return index;
        }
    }
    exports.LiveTestResult = LiveTestResult;
    /**
     * Test results hydrated from a previously-serialized test run.
     */
    class HydratedTestResult {
        /**
         * @inheritdoc
         */
        get tests() {
            return this.testById.values();
        }
        constructor(identity, serialized, persist = true) {
            this.serialized = serialized;
            this.persist = persist;
            /**
             * @inheritdoc
             */
            this.counts = (0, testingStates_1.makeEmptyCounts)();
            this.testById = new Map();
            this.id = serialized.id;
            this.completedAt = serialized.completedAt;
            this.tasks = serialized.tasks.map((task, i) => ({
                id: task.id,
                name: task.name,
                running: false,
                coverage: (0, observable_1.observableValue)(this, undefined),
                output: emptyRawOutput,
                otherMessages: []
            }));
            this.name = serialized.name;
            this.request = serialized.request;
            for (const item of serialized.items) {
                const de = testTypes_1.TestResultItem.deserialize(identity, item);
                this.counts[de.ownComputedState]++;
                this.testById.set(item.item.extId, de);
            }
        }
        /**
         * @inheritdoc
         */
        getStateById(extTestId) {
            return this.testById.get(extTestId);
        }
        /**
         * @inheritdoc
         */
        toJSON() {
            return this.persist ? this.serialized : undefined;
        }
        /**
         * @inheritdoc
         */
        toJSONWithMessages() {
            return this.toJSON();
        }
    }
    exports.HydratedTestResult = HydratedTestResult;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFJlc3VsdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9jb21tb24vdGVzdFJlc3VsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEwR2hHLE1BQU0sY0FBYyxHQUFtQjtRQUN0QyxPQUFPLEVBQUUsRUFBRTtRQUNYLE1BQU0sRUFBRSxDQUFDO1FBQ1QsY0FBYyxFQUFFLGFBQUssQ0FBQyxJQUFJO1FBQzFCLFVBQVUsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQzdCLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDakMsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7S0FDdEIsQ0FBQztJQUVGLE1BQWEsYUFBYTtRQUExQjtZQUNrQixxQkFBZ0IsR0FBRyxJQUFJLGVBQU8sRUFBWSxDQUFDO1lBQzNDLGdCQUFXLEdBQUcsSUFBSSx1QkFBZSxFQUFRLENBQUM7WUFDbkQsV0FBTSxHQUFHLENBQUMsQ0FBQztZQUVuQixrQkFBa0I7WUFDRixtQkFBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7WUFFN0Qsa0JBQWtCO1lBQ0YsZUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBRWhELGtCQUFrQjtZQUNGLFlBQU8sR0FBZSxFQUFFLENBQUM7UUFrRzFDLENBQUM7UUFoR0Esa0JBQWtCO1FBQ2xCLElBQVcsTUFBTTtZQUNoQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVELGtCQUFrQjtRQUNsQixRQUFRLENBQUMsS0FBYSxFQUFFLE1BQWM7WUFDckMsTUFBTSxHQUFHLEdBQUcsaUJBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7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