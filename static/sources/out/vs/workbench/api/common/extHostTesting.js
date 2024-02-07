/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/functional", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uuid", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTestItem", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testItemCollection", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/services/extensions/common/extensions"], function (require, exports, async_1, buffer_1, cancellation_1, event_1, functional_1, hash_1, lifecycle_1, objects_1, types_1, uuid_1, log_1, extHost_protocol_1, extHostRpcService_1, extHostTestItem_1, Convert, extHostTypes_1, testId_1, testItemCollection_1, testTypes_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestRunProfileImpl = exports.TestRunDto = exports.TestRunCoordinator = exports.ExtHostTesting = void 0;
    let ExtHostTesting = class ExtHostTesting extends lifecycle_1.Disposable {
        constructor(rpc, logService, commands, editors) {
            super();
            this.editors = editors;
            this.resultsChangedEmitter = this._register(new event_1.Emitter());
            this.controllers = new Map();
            this.defaultProfilesChangedEmitter = this._register(new event_1.Emitter());
            this.onResultsChanged = this.resultsChangedEmitter.event;
            this.results = [];
            this.proxy = rpc.getProxy(extHost_protocol_1.MainContext.MainThreadTesting);
            this.observer = new TestObservers(this.proxy);
            this.runTracker = new TestRunCoordinator(this.proxy, logService);
            commands.registerArgumentProcessor({
                processArgument: arg => {
                    switch (arg?.$mid) {
                        case 16 /* MarshalledId.TestItemContext */: {
                            const cast = arg;
                            const targetTest = cast.tests[cast.tests.length - 1].item.extId;
                            const controller = this.controllers.get(testId_1.TestId.root(targetTest));
                            return controller?.collection.tree.get(targetTest)?.actual ?? (0, extHostTestItem_1.toItemFromContext)(arg);
                        }
                        case 18 /* MarshalledId.TestMessageMenuArgs */: {
                            const { extId, message } = arg;
                            return {
                                test: this.controllers.get(testId_1.TestId.root(extId))?.collection.tree.get(extId)?.actual,
                                message: Convert.TestMessage.to(message),
                            };
                        }
                        default: return arg;
                    }
                }
            });
            commands.registerCommand(false, 'testing.getExplorerSelection', async () => {
                const inner = await commands.executeCommand("_testing.getExplorerSelection" /* TestCommandId.GetExplorerSelection */);
                const lookup = (i) => {
                    const controller = this.controllers.get(testId_1.TestId.root(i));
                    if (!controller) {
                        return undefined;
                    }
                    return testId_1.TestId.isRoot(i) ? controller.controller : controller.collection.tree.get(i)?.actual;
                };
                return {
                    include: inner?.include.map(lookup).filter(types_1.isDefined) || [],
                    exclude: inner?.exclude.map(lookup).filter(types_1.isDefined) || [],
                };
            });
        }
        /**
         * Implements vscode.test.registerTestProvider
         */
        createTestController(extension, controllerId, label, refreshHandler) {
            if (this.controllers.has(controllerId)) {
                throw new Error(`Attempt to insert a duplicate controller with ID "${controllerId}"`);
            }
            const disposable = new lifecycle_1.DisposableStore();
            const collection = disposable.add(new extHostTestItem_1.ExtHostTestItemCollection(controllerId, label, this.editors));
            collection.root.label = label;
            const profiles = new Map();
            const activeProfiles = new Set();
            const proxy = this.proxy;
            const controller = {
                items: collection.root.children,
                get label() {
                    return label;
                },
                set label(value) {
                    label = value;
                    collection.root.label = value;
                    proxy.$updateController(controllerId, { label });
                },
                get refreshHandler() {
                    return refreshHandler;
                },
                set refreshHandler(value) {
                    refreshHandler = value;
                    proxy.$updateController(controllerId, { canRefresh: !!value });
                },
                get id() {
                    return controllerId;
                },
                createRunProfile: (label, group, runHandler, isDefault, tag, supportsContinuousRun) => {
                    // Derive the profile ID from a hash so that the same profile will tend
                    // to have the same hashes, allowing re-run requests to work across reloads.
                    let profileId = (0, hash_1.hash)(label);
                    while (profiles.has(profileId)) {
                        profileId++;
                    }
                    return new TestRunProfileImpl(this.proxy, profiles, activeProfiles, this.defaultProfilesChangedEmitter.event, controllerId, profileId, label, group, runHandler, isDefault, tag, supportsContinuousRun);
                },
                createTestItem(id, label, uri) {
                    return new extHostTestItem_1.TestItemImpl(controllerId, id, label, uri);
                },
                createTestRun: (request, name, persist = true) => {
                    return this.runTracker.createTestRun(extension, controllerId, collection, request, name, persist);
                },
                invalidateTestResults: items => {
                    if (items === undefined) {
                        this.proxy.$markTestRetired(undefined);
                    }
                    else {
                        const itemsArr = items instanceof Array ? items : [items];
                        this.proxy.$markTestRetired(itemsArr.map(i => testId_1.TestId.fromExtHostTestItem(i, controllerId).toString()));
                    }
                },
                set resolveHandler(fn) {
                    collection.resolveHandler = fn;
                },
                get resolveHandler() {
                    return collection.resolveHandler;
                },
                dispose: () => {
                    disposable.dispose();
                },
            };
            proxy.$registerTestController(controllerId, label, !!refreshHandler);
            disposable.add((0, lifecycle_1.toDisposable)(() => proxy.$unregisterTestController(controllerId)));
            const info = { controller, collection, profiles, extension, activeProfiles };
            this.controllers.set(controllerId, info);
            disposable.add((0, lifecycle_1.toDisposable)(() => this.controllers.delete(controllerId)));
            disposable.add(collection.onDidGenerateDiff(diff => proxy.$publishDiff(controllerId, diff.map(testTypes_1.TestsDiffOp.serialize))));
            return controller;
        }
        /**
         * Implements vscode.test.createTestObserver
         */
        createTestObserver() {
            return this.observer.checkout();
        }
        /**
         * Implements vscode.test.runTests
         */
        async runTests(req, token = cancellation_1.CancellationToken.None) {
            const profile = tryGetProfileFromTestRunReq(req);
            if (!profile) {
                throw new Error('The request passed to `vscode.test.runTests` must include a profile');
            }
            const controller = this.controllers.get(profile.controllerId);
            if (!controller) {
                throw new Error('Controller not found');
            }
            await this.proxy.$runTests({
                isUiTriggered: false,
                targets: [{
                        testIds: req.include?.map(t => testId_1.TestId.fromExtHostTestItem(t, controller.collection.root.id).toString()) ?? [controller.collection.root.id],
                        profileGroup: profileGroupToBitset[profile.kind],
                        profileId: profile.profileId,
                        controllerId: profile.controllerId,
                    }],
                exclude: req.exclude?.map(t => t.id),
            }, token);
        }
        /**
         * @inheritdoc
         */
        $syncTests() {
            for (const { collection } of this.controllers.values()) {
                collection.flushDiff();
            }
            return Promise.resolve();
        }
        /**
         * @inheritdoc
         */
        async $provideFileCoverage(runId, taskId, token) {
            const coverage = this.runTracker.getCoverageReport(runId, taskId);
            const fileCoverage = await coverage?.provideFileCoverage(token);
            return fileCoverage ?? [];
        }
        /**
         * @inheritdoc
         */
        async $resolveFileCoverage(runId, taskId, fileIndex, token) {
            const coverage = this.runTracker.getCoverageReport(runId, taskId);
            const details = await coverage?.resolveFileCoverage(fileIndex, token);
            return details ?? [];
        }
        /** @inheritdoc */
        $configureRunProfile(controllerId, profileId) {
            this.controllers.get(controllerId)?.profiles.get(profileId)?.configureHandler?.();
        }
        /** @inheritdoc */
        $setDefaultRunProfiles(profiles) {
            const evt = new Map();
            for (const [controllerId, profileIds] of Object.entries(profiles)) {
                const ctrl = this.controllers.get(controllerId);
                if (!ctrl) {
                    continue;
                }
                const changes = new Map();
                const added = profileIds.filter(id => !ctrl.activeProfiles.has(id));
                const removed = [...ctrl.activeProfiles].filter(id => !profileIds.includes(id));
                for (const id of added) {
                    changes.set(id, true);
                    ctrl.activeProfiles.add(id);
                }
                for (const id of removed) {
                    changes.set(id, false);
                    ctrl.activeProfiles.delete(id);
                }
                if (changes.size) {
                    evt.set(controllerId, changes);
                }
            }
            this.defaultProfilesChangedEmitter.fire(evt);
        }
        /** @inheritdoc */
        async $refreshTests(controllerId, token) {
            await this.controllers.get(controllerId)?.controller.refreshHandler?.(token);
        }
        /**
         * Updates test results shown to extensions.
         * @override
         */
        $publishTestResults(results) {
            this.results = Object.freeze(results
                .map(r => (0, objects_1.deepFreeze)(Convert.TestResults.to(r)))
                .concat(this.results)
                .sort((a, b) => b.completedAt - a.completedAt)
                .slice(0, 32));
            this.resultsChangedEmitter.fire();
        }
        /**
         * Expands the nodes in the test tree. If levels is less than zero, it will
         * be treated as infinite.
         */
        async $expandTest(testId, levels) {
            const collection = this.controllers.get(testId_1.TestId.fromString(testId).controllerId)?.collection;
            if (collection) {
                await collection.expand(testId, levels < 0 ? Infinity : levels);
                collection.flushDiff();
            }
        }
        /**
         * Receives a test update from the main thread. Called (eventually) whenever
         * tests change.
         */
        $acceptDiff(diff) {
            this.observer.applyDiff(diff.map(d => testTypes_1.TestsDiffOp.deserialize({ asCanonicalUri: u => u }, d)));
        }
        /**
         * Runs tests with the given set of IDs. Allows for test from multiple
         * providers to be run.
         * @inheritdoc
         */
        async $runControllerTests(reqs, token) {
            return Promise.all(reqs.map(req => this.runControllerTestRequest(req, false, token)));
        }
        /**
         * Starts continuous test runs with the given set of IDs. Allows for test from
         * multiple providers to be run.
         * @inheritdoc
         */
        async $startContinuousRun(reqs, token) {
            const cts = new cancellation_1.CancellationTokenSource(token);
            const res = await Promise.all(reqs.map(req => this.runControllerTestRequest(req, true, cts.token)));
            // avoid returning until cancellation is requested, otherwise ipc disposes of the token
            if (!token.isCancellationRequested && !res.some(r => r.error)) {
                await new Promise(r => token.onCancellationRequested(r));
            }
            cts.dispose(true);
            return res;
        }
        async runControllerTestRequest(req, isContinuous, token) {
            const lookup = this.controllers.get(req.controllerId);
            if (!lookup) {
                return {};
            }
            const { collection, profiles, extension } = lookup;
            const profile = profiles.get(req.profileId);
            if (!profile) {
                return {};
            }
            const includeTests = req.testIds
                .map((testId) => collection.tree.get(testId))
                .filter(types_1.isDefined);
            const excludeTests = req.excludeExtIds
                .map(id => lookup.collection.tree.get(id))
                .filter(types_1.isDefined)
                .filter(exclude => includeTests.some(include => include.fullId.compare(exclude.fullId) === 2 /* TestPosition.IsChild */));
            if (!includeTests.length) {
                return {};
            }
            const publicReq = new extHostTypes_1.TestRunRequest(includeTests.some(i => i.actual instanceof extHostTestItem_1.TestItemRootImpl) ? undefined : includeTests.map(t => t.actual), excludeTests.map(t => t.actual), profile, isContinuous);
            const tracker = (0, testTypes_1.isStartControllerTests)(req) && this.runTracker.prepareForMainThreadTestRun(publicReq, TestRunDto.fromInternal(req, lookup.collection), extension, token);
            try {
                await profile.runHandler(publicReq, token);
                return {};
            }
            catch (e) {
                return { error: String(e) };
            }
            finally {
                if (tracker) {
                    if (tracker.hasRunningTasks && !token.isCancellationRequested) {
                        await event_1.Event.toPromise(tracker.onEnd);
                    }
                    tracker.dispose();
                }
            }
        }
        /**
         * Cancels an ongoing test run.
         */
        $cancelExtensionTestRun(runId) {
            if (runId === undefined) {
                this.runTracker.cancelAllRuns();
            }
            else {
                this.runTracker.cancelRunById(runId);
            }
        }
    };
    exports.ExtHostTesting = ExtHostTesting;
    exports.ExtHostTesting = ExtHostTesting = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, log_1.ILogService)
    ], ExtHostTesting);
    // Deadline after being requested by a user that a test run is forcibly cancelled.
    const RUN_CANCEL_DEADLINE = 10000;
    var TestRunTrackerState;
    (function (TestRunTrackerState) {
        // Default state
        TestRunTrackerState[TestRunTrackerState["Running"] = 0] = "Running";
        // Cancellation is requested, but the run is still going.
        TestRunTrackerState[TestRunTrackerState["Cancelling"] = 1] = "Cancelling";
        // All tasks have ended
        TestRunTrackerState[TestRunTrackerState["Ended"] = 2] = "Ended";
    })(TestRunTrackerState || (TestRunTrackerState = {}));
    class TestRunTracker extends lifecycle_1.Disposable {
        /**
         * Gets whether there are any tests running.
         */
        get hasRunningTasks() {
            return this.tasks.size > 0;
        }
        /**
         * Gets the run ID.
         */
        get id() {
            return this.dto.id;
        }
        constructor(dto, proxy, extension, logService, parentToken) {
            super();
            this.dto = dto;
            this.proxy = proxy;
            this.extension = extension;
            this.logService = logService;
            this.state = 0 /* TestRunTrackerState.Running */;
            this.tasks = new Map();
            this.sharedTestIds = new Set();
            this.endEmitter = this._register(new event_1.Emitter());
            this.coverageEmitter = this._register(new event_1.Emitter());
            /**
             * Fired when a coverage provider is added or removed from a task.
             */
            this.onDidCoverage = this.coverageEmitter.event;
            /**
             * Fires when a test ends, and no more tests are left running.
             */
            this.onEnd = this.endEmitter.event;
            this.cts = this._register(new cancellation_1.CancellationTokenSource(parentToken));
            const forciblyEnd = this._register(new async_1.RunOnceScheduler(() => this.forciblyEndTasks(), RUN_CANCEL_DEADLINE));
            this._register(this.cts.token.onCancellationRequested(() => forciblyEnd.schedule()));
        }
        /** Requests cancellation of the run. On the second call, forces cancellation. */
        cancel() {
            if (this.state === 0 /* TestRunTrackerState.Running */) {
                this.cts.cancel();
                this.state = 1 /* TestRunTrackerState.Cancelling */;
            }
            else if (this.state === 1 /* TestRunTrackerState.Cancelling */) {
                this.forciblyEndTasks();
            }
        }
        /** Creates the public test run interface to give to extensions. */
        createRun(name) {
            const runId = this.dto.id;
            const ctrlId = this.dto.controllerId;
            const taskId = (0, uuid_1.generateUuid)();
            const extension = this.extension;
            const coverageEmitter = this.coverageEmitter;
            let coverage;
            const guardTestMutation = (fn) => (test, ...args) => {
                if (ended) {
                    this.logService.warn(`Setting the state of test "${test.id}" is a no-op after the run ends.`);
                    return;
                }
                if (!this.dto.isIncluded(test)) {
                    return;
                }
                this.ensureTestIsKnown(test);
                fn(test, ...args);
            };
            const appendMessages = (test, messages) => {
                const converted = messages instanceof Array
                    ? messages.map(Convert.TestMessage.from)
                    : [Convert.TestMessage.from(messages)];
                if (test.uri && test.range) {
                    const defaultLocation = { range: Convert.Range.from(test.range), uri: test.uri };
                    for (const message of converted) {
                        message.location = message.location || defaultLocation;
                    }
                }
                this.proxy.$appendTestMessagesInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), converted);
            };
            let ended = false;
            const run = {
                isPersisted: this.dto.isPersisted,
                token: this.cts.token,
                name,
                get coverageProvider() {
                    return coverage?.provider;
                },
                set coverageProvider(provider) {
                    (0, extensions_1.checkProposedApiEnabled)(extension, 'testCoverage');
                    coverage = provider && new TestRunCoverageBearer(provider);
                    coverageEmitter.fire({ taskId, runId, coverage });
                },
                //#region state mutation
                enqueued: guardTestMutation(test => {
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), 1 /* TestResultState.Queued */);
                }),
                skipped: guardTestMutation(test => {
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), 5 /* TestResultState.Skipped */);
                }),
                started: guardTestMutation(test => {
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), 2 /* TestResultState.Running */);
                }),
                errored: guardTestMutation((test, messages, duration) => {
                    appendMessages(test, messages);
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), 6 /* TestResultState.Errored */, duration);
                }),
                failed: guardTestMutation((test, messages, duration) => {
                    appendMessages(test, messages);
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), 4 /* TestResultState.Failed */, duration);
                }),
                passed: guardTestMutation((test, duration) => {
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, this.dto.controllerId).toString(), 3 /* TestResultState.Passed */, duration);
                }),
                //#endregion
                appendOutput: (output, location, test) => {
                    if (ended) {
                        return;
                    }
                    if (test) {
                        if (this.dto.isIncluded(test)) {
                            this.ensureTestIsKnown(test);
                        }
                        else {
                            test = undefined;
                        }
                    }
                    this.proxy.$appendOutputToRun(runId, taskId, buffer_1.VSBuffer.fromString(output), location && Convert.location.from(location), test && testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString());
                },
                end: () => {
                    if (ended) {
                        return;
                    }
                    ended = true;
                    this.proxy.$finishedTestRunTask(runId, taskId);
                    this.tasks.delete(taskId);
                    if (!this.tasks.size) {
                        this.markEnded();
                    }
                }
            };
            this.tasks.set(taskId, { run });
            this.proxy.$startedTestRunTask(runId, { id: taskId, name, running: true });
            return run;
        }
        forciblyEndTasks() {
            for (const { run } of this.tasks.values()) {
                run.end();
            }
        }
        markEnded() {
            if (this.state !== 2 /* TestRunTrackerState.Ended */) {
                this.state = 2 /* TestRunTrackerState.Ended */;
                this.endEmitter.fire();
            }
        }
        ensureTestIsKnown(test) {
            if (!(test instanceof extHostTestItem_1.TestItemImpl)) {
                throw new testItemCollection_1.InvalidTestItemError(test.id);
            }
            if (this.sharedTestIds.has(testId_1.TestId.fromExtHostTestItem(test, this.dto.controllerId).toString())) {
                return;
            }
            const chain = [];
            const root = this.dto.colllection.root;
            while (true) {
                const converted = Convert.TestItem.from(test);
                chain.unshift(converted);
                if (this.sharedTestIds.has(converted.extId)) {
                    break;
                }
                this.sharedTestIds.add(converted.extId);
                if (test === root) {
                    break;
                }
                test = test.parent || root;
            }
            this.proxy.$addTestsToRun(this.dto.controllerId, this.dto.id, chain);
        }
        dispose() {
            this.markEnded();
            super.dispose();
        }
    }
    /**
     * Queues runs for a single extension and provides the currently-executing
     * run so that `createTestRun` can be properly correlated.
     */
    class TestRunCoordinator {
        get trackers() {
            return this.tracked.values();
        }
        constructor(proxy, logService) {
            this.proxy = proxy;
            this.logService = logService;
            this.tracked = new Map();
            this.coverageReports = [];
        }
        /**
         * Gets a coverage report for a given run and task ID.
         */
        getCoverageReport(runId, taskId) {
            return this.coverageReports
                .find(r => r.runId === runId)
                ?.coverage.get(taskId);
        }
        /**
         * Registers a request as being invoked by the main thread, so
         * `$startedExtensionTestRun` is not invoked. The run must eventually
         * be cancelled manually.
         */
        prepareForMainThreadTestRun(req, dto, extension, token) {
            return this.getTracker(req, dto, extension, token);
        }
        /**
         * Cancels an existing test run via its cancellation token.
         */
        cancelRunById(runId) {
            for (const tracker of this.tracked.values()) {
                if (tracker.id === runId) {
                    tracker.cancel();
                    return;
                }
            }
        }
        /**
         * Cancels an existing test run via its cancellation token.
         */
        cancelAllRuns() {
            for (const tracker of this.tracked.values()) {
                tracker.cancel();
            }
        }
        /**
         * Implements the public `createTestRun` API.
         */
        createTestRun(extension, controllerId, collection, request, name, persist) {
            const existing = this.tracked.get(request);
            if (existing) {
                return existing.createRun(name);
            }
            // If there is not an existing tracked extension for the request, start
            // a new, detached session.
            const dto = TestRunDto.fromPublic(controllerId, collection, request, persist);
            const profile = tryGetProfileFromTestRunReq(request);
            this.proxy.$startedExtensionTestRun({
                controllerId,
                continuous: !!request.continuous,
                profile: profile && { group: profileGroupToBitset[profile.kind], id: profile.profileId },
                exclude: request.exclude?.map(t => testId_1.TestId.fromExtHostTestItem(t, collection.root.id).toString()) ?? [],
                id: dto.id,
                include: request.include?.map(t => testId_1.TestId.fromExtHostTestItem(t, collection.root.id).toString()) ?? [collection.root.id],
                persist
            });
            const tracker = this.getTracker(request, dto, extension);
            event_1.Event.once(tracker.onEnd)(() => {
                this.proxy.$finishedExtensionTestRun(dto.id);
                tracker.dispose();
            });
            return tracker.createRun(name);
        }
        getTracker(req, dto, extension, token) {
            const tracker = new TestRunTracker(dto, this.proxy, extension, this.logService, token);
            this.tracked.set(req, tracker);
            let coverageReports;
            const coverageListener = tracker.onDidCoverage(({ runId, taskId, coverage }) => {
                if (!coverageReports) {
                    coverageReports = { runId, coverage: new Map() };
                    this.coverageReports.unshift(coverageReports);
                    if (this.coverageReports.length > testTypes_1.KEEP_N_LAST_COVERAGE_REPORTS) {
                        this.coverageReports.pop();
                    }
                }
                coverageReports.coverage.set(taskId, coverage);
                this.proxy.$signalCoverageAvailable(runId, taskId, !!coverage);
            });
            event_1.Event.once(tracker.onEnd)(() => {
                this.tracked.delete(req);
                coverageListener.dispose();
            });
            return tracker;
        }
    }
    exports.TestRunCoordinator = TestRunCoordinator;
    const tryGetProfileFromTestRunReq = (request) => {
        if (!request.profile) {
            return undefined;
        }
        if (!(request.profile instanceof TestRunProfileImpl)) {
            throw new Error(`TestRunRequest.profile is not an instance created from TestController.createRunProfile`);
        }
        return request.profile;
    };
    class TestRunDto {
        static fromPublic(controllerId, collection, request, persist) {
            return new TestRunDto(controllerId, (0, uuid_1.generateUuid)(), request.include?.map(t => testId_1.TestId.fromExtHostTestItem(t, controllerId).toString()) ?? [controllerId], request.exclude?.map(t => testId_1.TestId.fromExtHostTestItem(t, controllerId).toString()) ?? [], persist, collection);
        }
        static fromInternal(request, collection) {
            return new TestRunDto(request.controllerId, request.runId, request.testIds, request.excludeExtIds, true, collection);
        }
        constructor(controllerId, id, include, exclude, isPersisted, colllection) {
            this.controllerId = controllerId;
            this.id = id;
            this.isPersisted = isPersisted;
            this.colllection = colllection;
            this.includePrefix = include.map(id => id + "\0" /* TestIdPathParts.Delimiter */);
            this.excludePrefix = exclude.map(id => id + "\0" /* TestIdPathParts.Delimiter */);
        }
        isIncluded(test) {
            const id = testId_1.TestId.fromExtHostTestItem(test, this.controllerId).toString() + "\0" /* TestIdPathParts.Delimiter */;
            for (const prefix of this.excludePrefix) {
                if (id === prefix || id.startsWith(prefix)) {
                    return false;
                }
            }
            for (const prefix of this.includePrefix) {
                if (id === prefix || id.startsWith(prefix)) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.TestRunDto = TestRunDto;
    class TestRunCoverageBearer {
        constructor(provider) {
            this.provider = provider;
        }
        async provideFileCoverage(token) {
            if (!this.fileCoverage) {
                this.fileCoverage = (async () => this.provider.provideFileCoverage(token))();
            }
            try {
                const coverage = await this.fileCoverage;
                return coverage?.map(Convert.TestCoverage.fromFile) ?? [];
            }
            catch (e) {
                this.fileCoverage = undefined;
                throw e;
            }
        }
        async resolveFileCoverage(index, token) {
            const fileCoverage = await this.fileCoverage;
            let file = fileCoverage?.[index];
            if (!this.provider || !fileCoverage || !file) {
                return [];
            }
            if (!file.detailedCoverage) {
                file = fileCoverage[index] = await this.provider.resolveFileCoverage?.(file, token) ?? file;
            }
            return file.detailedCoverage?.map(Convert.TestCoverage.fromDetailed) ?? [];
        }
    }
    class MirroredChangeCollector {
        get isEmpty() {
            return this.added.size === 0 && this.removed.size === 0 && this.updated.size === 0;
        }
        constructor(emitter) {
            this.emitter = emitter;
            this.added = new Set();
            this.updated = new Set();
            this.removed = new Set();
            this.alreadyRemoved = new Set();
        }
        /**
         * @inheritdoc
         */
        add(node) {
            this.added.add(node);
        }
        /**
         * @inheritdoc
         */
        update(node) {
            Object.assign(node.revived, Convert.TestItem.toPlain(node.item));
            if (!this.added.has(node)) {
                this.updated.add(node);
            }
        }
        /**
         * @inheritdoc
         */
        remove(node) {
            if (this.added.has(node)) {
                this.added.delete(node);
                return;
            }
            this.updated.delete(node);
            const parentId = testId_1.TestId.parentId(node.item.extId);
            if (parentId && this.alreadyRemoved.has(parentId.toString())) {
                this.alreadyRemoved.add(node.item.extId);
                return;
            }
            this.removed.add(node);
        }
        /**
         * @inheritdoc
         */
        getChangeEvent() {
            const { added, updated, removed } = this;
            return {
                get added() { return [...added].map(n => n.revived); },
                get updated() { return [...updated].map(n => n.revived); },
                get removed() { return [...removed].map(n => n.revived); },
            };
        }
        complete() {
            if (!this.isEmpty) {
                this.emitter.fire(this.getChangeEvent());
            }
        }
    }
    /**
     * Maintains tests in this extension host sent from the main thread.
     * @private
     */
    class MirroredTestCollection extends testTypes_1.AbstractIncrementalTestCollection {
        constructor() {
            super(...arguments);
            this.changeEmitter = new event_1.Emitter();
            /**
             * Change emitter that fires with the same semantics as `TestObserver.onDidChangeTests`.
             */
            this.onDidChangeTests = this.changeEmitter.event;
        }
        /**
         * Gets a list of root test items.
         */
        get rootTests() {
            return this.roots;
        }
        /**
         *
         * If the test ID exists, returns its underlying ID.
         */
        getMirroredTestDataById(itemId) {
            return this.items.get(itemId);
        }
        /**
         * If the test item is a mirrored test item, returns its underlying ID.
         */
        getMirroredTestDataByReference(item) {
            return this.items.get(item.id);
        }
        /**
         * @override
         */
        createItem(item, parent) {
            return {
                ...item,
                // todo@connor4312: make this work well again with children
                revived: Convert.TestItem.toPlain(item.item),
                depth: parent ? parent.depth + 1 : 0,
                children: new Set(),
            };
        }
        /**
         * @override
         */
        createChangeCollector() {
            return new MirroredChangeCollector(this.changeEmitter);
        }
    }
    class TestObservers {
        constructor(proxy) {
            this.proxy = proxy;
        }
        checkout() {
            if (!this.current) {
                this.current = this.createObserverData();
            }
            const current = this.current;
            current.observers++;
            return {
                onDidChangeTest: current.tests.onDidChangeTests,
                get tests() { return [...current.tests.rootTests].map(t => t.revived); },
                dispose: (0, functional_1.createSingleCallFunction)(() => {
                    if (--current.observers === 0) {
                        this.proxy.$unsubscribeFromDiffs();
                        this.current = undefined;
                    }
                }),
            };
        }
        /**
         * Gets the internal test data by its reference.
         */
        getMirroredTestDataByReference(ref) {
            return this.current?.tests.getMirroredTestDataByReference(ref);
        }
        /**
         * Applies test diffs to the current set of observed tests.
         */
        applyDiff(diff) {
            this.current?.tests.apply(diff);
        }
        createObserverData() {
            const tests = new MirroredTestCollection({ asCanonicalUri: u => u });
            this.proxy.$subscribeToDiffs();
            return { observers: 0, tests, };
        }
    }
    const updateProfile = (impl, proxy, initial, update) => {
        if (initial) {
            Object.assign(initial, update);
        }
        else {
            proxy.$updateTestRunConfig(impl.controllerId, impl.profileId, update);
        }
    };
    class TestRunProfileImpl {
        #proxy;
        #activeProfiles;
        #onDidChangeDefaultProfiles;
        #initialPublish;
        #profiles;
        get label() {
            return this._label;
        }
        set label(label) {
            if (label !== this._label) {
                this._label = label;
                updateProfile(this, this.#proxy, this.#initialPublish, { label });
            }
        }
        get supportsContinuousRun() {
            return this._supportsContinuousRun;
        }
        set supportsContinuousRun(supports) {
            if (supports !== this._supportsContinuousRun) {
                this._supportsContinuousRun = supports;
                updateProfile(this, this.#proxy, this.#initialPublish, { supportsContinuousRun: supports });
            }
        }
        get isDefault() {
            return this.#activeProfiles.has(this.profileId);
        }
        set isDefault(isDefault) {
            if (isDefault !== this.isDefault) {
                // #activeProfiles is synced from the main thread, so we can make
                // provisional changes here that will get confirmed momentarily
                if (isDefault) {
                    this.#activeProfiles.add(this.profileId);
                }
                else {
                    this.#activeProfiles.delete(this.profileId);
                }
                updateProfile(this, this.#proxy, this.#initialPublish, { isDefault });
            }
        }
        get tag() {
            return this._tag;
        }
        set tag(tag) {
            if (tag?.id !== this._tag?.id) {
                this._tag = tag;
                updateProfile(this, this.#proxy, this.#initialPublish, {
                    tag: tag ? Convert.TestTag.namespace(this.controllerId, tag.id) : null,
                });
            }
        }
        get configureHandler() {
            return this._configureHandler;
        }
        set configureHandler(handler) {
            if (handler !== this._configureHandler) {
                this._configureHandler = handler;
                updateProfile(this, this.#proxy, this.#initialPublish, { hasConfigurationHandler: !!handler });
            }
        }
        get onDidChangeDefault() {
            return event_1.Event.chain(this.#onDidChangeDefaultProfiles, $ => $
                .map(ev => ev.get(this.controllerId)?.get(this.profileId))
                .filter(types_1.isDefined));
        }
        constructor(proxy, profiles, activeProfiles, onDidChangeActiveProfiles, controllerId, profileId, _label, kind, runHandler, _isDefault = false, _tag = undefined, _supportsContinuousRun = false) {
            this.controllerId = controllerId;
            this.profileId = profileId;
            this._label = _label;
            this.kind = kind;
            this.runHandler = runHandler;
            this._tag = _tag;
            this._supportsContinuousRun = _supportsContinuousRun;
            this.#proxy = proxy;
            this.#profiles = profiles;
            this.#activeProfiles = activeProfiles;
            this.#onDidChangeDefaultProfiles = onDidChangeActiveProfiles;
            profiles.set(profileId, this);
            const groupBitset = profileGroupToBitset[kind];
            if (typeof groupBitset !== 'number') {
                throw new Error(`Unknown TestRunProfile.group ${kind}`);
            }
            if (_isDefault) {
                activeProfiles.add(profileId);
            }
            this.#initialPublish = {
                profileId: profileId,
                controllerId,
                tag: _tag ? Convert.TestTag.namespace(this.controllerId, _tag.id) : null,
                label: _label,
                group: groupBitset,
                isDefault: _isDefault,
                hasConfigurationHandler: false,
                supportsContinuousRun: _supportsContinuousRun,
            };
            // we send the initial profile publish out on the next microtask so that
            // initially setting the isDefault value doesn't overwrite a user-configured value
            queueMicrotask(() => {
                if (this.#initialPublish) {
                    this.#proxy.$publishTestRunProfile(this.#initialPublish);
                    this.#initialPublish = undefined;
                }
            });
        }
        dispose() {
            if (this.#profiles?.delete(this.profileId)) {
                this.#profiles = undefined;
                this.#proxy.$removeTestProfile(this.controllerId, this.profileId);
            }
            this.#initialPublish = undefined;
        }
    }
    exports.TestRunProfileImpl = TestRunProfileImpl;
    const profileGroupToBitset = {
        [extHostTypes_1.TestRunProfileKind.Coverage]: 8 /* TestRunProfileBitset.Coverage */,
        [extHostTypes_1.TestRunProfileKind.Debug]: 4 /* TestRunProfileBitset.Debug */,
        [extHostTypes_1.TestRunProfileKind.Run]: 2 /* TestRunProfileBitset.Run */,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRlc3RpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RUZXN0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlDekYsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHNCQUFVO1FBVzdDLFlBQ3FCLEdBQXVCLEVBQzlCLFVBQXVCLEVBQ3BDLFFBQXlCLEVBQ1IsT0FBbUM7WUFFcEQsS0FBSyxFQUFFLENBQUM7WUFGUyxZQUFPLEdBQVAsT0FBTyxDQUE0QjtZQWRwQywwQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUMxRCxnQkFBVyxHQUFHLElBQUksR0FBRyxFQUE4QyxDQUFDO1lBSXRFLGtDQUE2QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTZCLENBQUMsQ0FBQztZQUVuRyxxQkFBZ0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDO1lBQ3BELFlBQU8sR0FBd0MsRUFBRSxDQUFDO1lBU3hELElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFakUsUUFBUSxDQUFDLHlCQUF5QixDQUFDO2dCQUNsQyxlQUFlLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ3RCLFFBQVEsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO3dCQUNuQiwwQ0FBaUMsQ0FBQyxDQUFDLENBQUM7NEJBQ25DLE1BQU0sSUFBSSxHQUFHLEdBQXVCLENBQUM7NEJBQ3JDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzs0QkFDaEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDOzRCQUNqRSxPQUFPLFVBQVUsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxNQUFNLElBQUksSUFBQSxtQ0FBaUIsRUFBQyxHQUFHLENBQUMsQ0FBQzt3QkFDdEYsQ0FBQzt3QkFDRCw4Q0FBcUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZDLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsR0FBMkIsQ0FBQzs0QkFDdkQsT0FBTztnQ0FDTixJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU07Z0NBQ2xGLE9BQU8sRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxPQUF1QyxDQUFDOzZCQUN4RSxDQUFDO3dCQUNILENBQUM7d0JBQ0QsT0FBTyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUM7b0JBQ3JCLENBQUM7Z0JBQ0YsQ0FBQzthQUNELENBQUMsQ0FBQztZQUVILFFBQVEsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLDhCQUE4QixFQUFFLEtBQUssSUFBa0IsRUFBRTtnQkFDeEYsTUFBTSxLQUFLLEdBQUcsTUFBTSxRQUFRLENBQUMsY0FBYywwRUFHTCxDQUFDO2dCQUV2QyxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFO29CQUM1QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzt3QkFBQyxPQUFPLFNBQVMsQ0FBQztvQkFBQyxDQUFDO29CQUN0QyxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7Z0JBQzdGLENBQUMsQ0FBQztnQkFFRixPQUFPO29CQUNOLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsaUJBQVMsQ0FBQyxJQUFJLEVBQUU7b0JBQzNELE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsaUJBQVMsQ0FBQyxJQUFJLEVBQUU7aUJBQzNELENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRDs7V0FFRztRQUNJLG9CQUFvQixDQUFDLFNBQWdDLEVBQUUsWUFBb0IsRUFBRSxLQUFhLEVBQUUsY0FBb0U7WUFDdEssSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO2dCQUN4QyxNQUFNLElBQUksS0FBSyxDQUFDLHFEQUFxRCxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZGLENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUN6QyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksMkNBQXlCLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNwRyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7WUFDMUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUN6QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBRXpCLE1BQU0sVUFBVSxHQUEwQjtnQkFDekMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUTtnQkFDL0IsSUFBSSxLQUFLO29CQUNSLE9BQU8sS0FBSyxDQUFDO2dCQUNkLENBQUM7Z0JBQ0QsSUFBSSxLQUFLLENBQUMsS0FBYTtvQkFDdEIsS0FBSyxHQUFHLEtBQUssQ0FBQztvQkFDZCxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7b0JBQzlCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDO2dCQUNELElBQUksY0FBYztvQkFDakIsT0FBTyxjQUFjLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBQ0QsSUFBSSxjQUFjLENBQUMsS0FBd0U7b0JBQzFGLGNBQWMsR0FBRyxLQUFLLENBQUM7b0JBQ3ZCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ2hFLENBQUM7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLE9BQU8sWUFBWSxDQUFDO2dCQUNyQixDQUFDO2dCQUNELGdCQUFnQixFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQWdDLEVBQUUscUJBQStCLEVBQUUsRUFBRTtvQkFDNUgsdUVBQXVFO29CQUN2RSw0RUFBNEU7b0JBQzVFLElBQUksU0FBUyxHQUFHLElBQUEsV0FBSSxFQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM1QixPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQzt3QkFDaEMsU0FBUyxFQUFFLENBQUM7b0JBQ2IsQ0FBQztvQkFFRCxPQUFPLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLHFCQUFxQixDQUFDLENBQUM7Z0JBQ3pNLENBQUM7Z0JBQ0QsY0FBYyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRztvQkFDNUIsT0FBTyxJQUFJLDhCQUFZLENBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZELENBQUM7Z0JBQ0QsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEdBQUcsSUFBSSxFQUFFLEVBQUU7b0JBQ2hELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDbkcsQ0FBQztnQkFDRCxxQkFBcUIsRUFBRSxLQUFLLENBQUMsRUFBRTtvQkFDOUIsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3hDLENBQUM7eUJBQU0sQ0FBQzt3QkFDUCxNQUFNLFFBQVEsR0FBRyxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzFELElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN6RyxDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsSUFBSSxjQUFjLENBQUMsRUFBRTtvQkFDcEIsVUFBVSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7Z0JBQ2hDLENBQUM7Z0JBQ0QsSUFBSSxjQUFjO29CQUNqQixPQUFPLFVBQVUsQ0FBQyxjQUFnRSxDQUFDO2dCQUNwRixDQUFDO2dCQUNELE9BQU8sRUFBRSxHQUFHLEVBQUU7b0JBQ2IsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN0QixDQUFDO2FBQ0QsQ0FBQztZQUVGLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNyRSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxGLE1BQU0sSUFBSSxHQUFtQixFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsQ0FBQztZQUM3RixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhILE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFFRDs7V0FFRztRQUNJLGtCQUFrQjtZQUN4QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUdEOztXQUVHO1FBQ0ksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUEwQixFQUFFLEtBQUssR0FBRyxnQ0FBaUIsQ0FBQyxJQUFJO1lBQy9FLE1BQU0sT0FBTyxHQUFHLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZCxNQUFNLElBQUksS0FBSyxDQUFDLHFFQUFxRSxDQUFDLENBQUM7WUFDeEYsQ0FBQztZQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUN6QyxDQUFDO1lBRUQsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDMUIsYUFBYSxFQUFFLEtBQUs7Z0JBQ3BCLE9BQU8sRUFBRSxDQUFDO3dCQUNULE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDMUksWUFBWSxFQUFFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7d0JBQ2hELFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUzt3QkFDNUIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO3FCQUNsQyxDQUFDO2dCQUNGLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDcEMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNYLENBQUM7UUFFRDs7V0FFRztRQUNILFVBQVU7WUFDVCxLQUFLLE1BQU0sRUFBRSxVQUFVLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ3hELFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN4QixDQUFDO1lBRUQsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVEOztXQUVHO1FBQ0gsS0FBSyxDQUFDLG9CQUFvQixDQUFDLEtBQWEsRUFBRSxNQUFjLEVBQUUsS0FBd0I7WUFDakYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEUsTUFBTSxZQUFZLEdBQUcsTUFBTSxRQUFRLEVBQUUsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEUsT0FBTyxZQUFZLElBQUksRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFRDs7V0FFRztRQUNILEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFhLEVBQUUsTUFBYyxFQUFFLFNBQWlCLEVBQUUsS0FBd0I7WUFDcEcsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxRQUFRLEVBQUUsbUJBQW1CLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRUQsa0JBQWtCO1FBQ2xCLG9CQUFvQixDQUFDLFlBQW9CLEVBQUUsU0FBaUI7WUFDM0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7UUFDbkYsQ0FBQztRQUVELGtCQUFrQjtRQUNsQixzQkFBc0IsQ0FBQyxRQUFzRTtZQUM1RixNQUFNLEdBQUcsR0FBOEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNqRCxLQUFLLE1BQU0sQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNuRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNYLFNBQVM7Z0JBQ1YsQ0FBQztnQkFDRCxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztnQkFDM0MsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDcEUsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEYsS0FBSyxNQUFNLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQztvQkFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3RCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QixDQUFDO2dCQUNELEtBQUssTUFBTSxFQUFFLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDaEMsQ0FBQztnQkFDRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDbEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQsa0JBQWtCO1FBQ2xCLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBb0IsRUFBRSxLQUF3QjtZQUNqRSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksbUJBQW1CLENBQUMsT0FBaUM7WUFDM0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUMzQixPQUFPO2lCQUNMLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsb0JBQVUsRUFBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMvQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztpQkFDcEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDO2lCQUM3QyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNkLENBQUM7WUFFRixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVEOzs7V0FHRztRQUNJLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBYyxFQUFFLE1BQWM7WUFDdEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsZUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxVQUFVLENBQUM7WUFDNUYsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNoRSxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDeEIsQ0FBQztRQUNGLENBQUM7UUFFRDs7O1dBR0c7UUFDSSxXQUFXLENBQUMsSUFBOEI7WUFDaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLHVCQUFXLENBQUMsV0FBVyxDQUFDLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFRDs7OztXQUlHO1FBQ0ksS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQTZCLEVBQUUsS0FBd0I7WUFDdkYsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBNkIsRUFBRSxLQUF3QjtZQUN2RixNQUFNLEdBQUcsR0FBRyxJQUFJLHNDQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLE1BQU0sR0FBRyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVwRyx1RkFBdUY7WUFDdkYsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDL0QsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELENBQUM7WUFFRCxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVPLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxHQUFvRCxFQUFFLFlBQXFCLEVBQUUsS0FBd0I7WUFDM0ksTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDYixPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFFRCxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLENBQUM7WUFDbkQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNkLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUVELE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxPQUFPO2lCQUM5QixHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUM1QyxNQUFNLENBQUMsaUJBQVMsQ0FBQyxDQUFDO1lBRXBCLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxhQUFhO2lCQUNwQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pDLE1BQU0sQ0FBQyxpQkFBUyxDQUFDO2lCQUNqQixNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUNuQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUNBQXlCLENBQzFFLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzFCLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksNkJBQWMsQ0FDbkMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLFlBQVksa0NBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUMxRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUMvQixPQUFPLEVBQ1AsWUFBWSxDQUNaLENBQUM7WUFFRixNQUFNLE9BQU8sR0FBRyxJQUFBLGtDQUFzQixFQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsMkJBQTJCLENBQ3pGLFNBQVMsRUFDVCxVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQy9DLFNBQVMsRUFDVCxLQUFLLENBQ0wsQ0FBQztZQUVGLElBQUksQ0FBQztnQkFDSixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMzQyxPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNaLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDN0IsQ0FBQztvQkFBUyxDQUFDO2dCQUNWLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQ2IsSUFBSSxPQUFPLENBQUMsZUFBZSxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7d0JBQy9ELE1BQU0sYUFBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3RDLENBQUM7b0JBRUQsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuQixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFRDs7V0FFRztRQUNJLHVCQUF1QixDQUFDLEtBQXlCO1lBQ3ZELElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUN6QixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2pDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxDQUFDO1FBQ0YsQ0FBQztLQUNELENBQUE7SUF2WFksd0NBQWM7NkJBQWQsY0FBYztRQVl4QixXQUFBLHNDQUFrQixDQUFBO1FBQ2xCLFdBQUEsaUJBQVcsQ0FBQTtPQWJELGNBQWMsQ0F1WDFCO0lBRUQsa0ZBQWtGO0lBQ2xGLE1BQU0sbUJBQW1CLEdBQUcsS0FBTSxDQUFDO0lBRW5DLElBQVcsbUJBT1Y7SUFQRCxXQUFXLG1CQUFtQjtRQUM3QixnQkFBZ0I7UUFDaEIsbUVBQU8sQ0FBQTtRQUNQLHlEQUF5RDtRQUN6RCx5RUFBVSxDQUFBO1FBQ1YsdUJBQXVCO1FBQ3ZCLCtEQUFLLENBQUE7SUFDTixDQUFDLEVBUFUsbUJBQW1CLEtBQW5CLG1CQUFtQixRQU83QjtJQUVELE1BQU0sY0FBZSxTQUFRLHNCQUFVO1FBa0J0Qzs7V0FFRztRQUNILElBQVcsZUFBZTtZQUN6QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxJQUFXLEVBQUU7WUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxZQUNrQixHQUFlLEVBQ2YsS0FBNkIsRUFDN0IsU0FBdUMsRUFDdkMsVUFBdUIsRUFDeEMsV0FBK0I7WUFFL0IsS0FBSyxFQUFFLENBQUM7WUFOUyxRQUFHLEdBQUgsR0FBRyxDQUFZO1lBQ2YsVUFBSyxHQUFMLEtBQUssQ0FBd0I7WUFDN0IsY0FBUyxHQUFULFNBQVMsQ0FBOEI7WUFDdkMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQW5DakMsVUFBSyx1Q0FBK0I7WUFDM0IsVUFBSyxHQUFHLElBQUksR0FBRyxFQUFnRCxDQUFDO1lBQ2hFLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUVsQyxlQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDakQsb0JBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFrRixDQUFDLENBQUM7WUFFako7O2VBRUc7WUFDYSxrQkFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBRTNEOztlQUVHO1lBQ2EsVUFBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBd0I3QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxzQ0FBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBRXBFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDN0csSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFRCxpRkFBaUY7UUFDMUUsTUFBTTtZQUNaLElBQUksSUFBSSxDQUFDLEtBQUssd0NBQWdDLEVBQUUsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLEtBQUsseUNBQWlDLENBQUM7WUFDN0MsQ0FBQztpQkFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLDJDQUFtQyxFQUFFLENBQUM7Z0JBQzFELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3pCLENBQUM7UUFDRixDQUFDO1FBRUQsbUVBQW1FO1FBQzVELFNBQVMsQ0FBQyxJQUF3QjtZQUN4QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUMxQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztZQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFBLG1CQUFZLEdBQUUsQ0FBQztZQUM5QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ2pDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDN0MsSUFBSSxRQUEyQyxDQUFDO1lBRWhELE1BQU0saUJBQWlCLEdBQUcsQ0FBeUIsRUFBa0QsRUFBRSxFQUFFLENBQ3hHLENBQUMsSUFBcUIsRUFBRSxHQUFHLElBQVUsRUFBRSxFQUFFO2dCQUN4QyxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNYLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLDhCQUE4QixJQUFJLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO29CQUM5RixPQUFPO2dCQUNSLENBQUM7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ2hDLE9BQU87Z0JBQ1IsQ0FBQztnQkFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUNuQixDQUFDLENBQUM7WUFFSCxNQUFNLGNBQWMsR0FBRyxDQUFDLElBQXFCLEVBQUUsUUFBNEQsRUFBRSxFQUFFO2dCQUM5RyxNQUFNLFNBQVMsR0FBRyxRQUFRLFlBQVksS0FBSztvQkFDMUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ3hDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBRXhDLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQzVCLE1BQU0sZUFBZSxHQUFpQixFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDL0YsS0FBSyxNQUFNLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQzt3QkFDakMsT0FBTyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLGVBQWUsQ0FBQztvQkFDeEQsQ0FBQztnQkFDRixDQUFDO2dCQUVELElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxlQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3BILENBQUMsQ0FBQztZQUVGLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNsQixNQUFNLEdBQUcsR0FBbUI7Z0JBQzNCLFdBQVcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVc7Z0JBQ2pDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUs7Z0JBQ3JCLElBQUk7Z0JBQ0osSUFBSSxnQkFBZ0I7b0JBQ25CLE9BQU8sUUFBUSxFQUFFLFFBQVEsQ0FBQztnQkFDM0IsQ0FBQztnQkFDRCxJQUFJLGdCQUFnQixDQUFDLFFBQVE7b0JBQzVCLElBQUEsb0NBQXVCLEVBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUNuRCxRQUFRLEdBQUcsUUFBUSxJQUFJLElBQUkscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzNELGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ25ELENBQUM7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixRQUFRLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxlQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxpQ0FBeUIsQ0FBQztnQkFDOUgsQ0FBQyxDQUFDO2dCQUNGLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLGVBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLGtDQUEwQixDQUFDO2dCQUMvSCxDQUFDLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsZUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsa0NBQTBCLENBQUM7Z0JBQy9ILENBQUMsQ0FBQztnQkFDRixPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFO29CQUN2RCxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsZUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsbUNBQTJCLFFBQVEsQ0FBQyxDQUFDO2dCQUN6SSxDQUFDLENBQUM7Z0JBQ0YsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRTtvQkFDdEQsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLGVBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLGtDQUEwQixRQUFRLENBQUMsQ0FBQztnQkFDeEksQ0FBQyxDQUFDO2dCQUNGLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRTtvQkFDNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLGVBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsa0NBQTBCLFFBQVEsQ0FBQyxDQUFDO2dCQUN2SixDQUFDLENBQUM7Z0JBQ0YsWUFBWTtnQkFDWixZQUFZLEVBQUUsQ0FBQyxNQUFNLEVBQUUsUUFBMEIsRUFBRSxJQUFzQixFQUFFLEVBQUU7b0JBQzVFLElBQUksS0FBSyxFQUFFLENBQUM7d0JBQ1gsT0FBTztvQkFDUixDQUFDO29CQUVELElBQUksSUFBSSxFQUFFLENBQUM7d0JBQ1YsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDOzRCQUMvQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzlCLENBQUM7NkJBQU0sQ0FBQzs0QkFDUCxJQUFJLEdBQUcsU0FBUyxDQUFDO3dCQUNsQixDQUFDO29CQUNGLENBQUM7b0JBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FDNUIsS0FBSyxFQUNMLE1BQU0sRUFDTixpQkFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFDM0IsUUFBUSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUMzQyxJQUFJLElBQUksZUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDM0QsQ0FBQztnQkFDSCxDQUFDO2dCQUNELEdBQUcsRUFBRSxHQUFHLEVBQUU7b0JBQ1QsSUFBSSxLQUFLLEVBQUUsQ0FBQzt3QkFDWCxPQUFPO29CQUNSLENBQUM7b0JBRUQsS0FBSyxHQUFHLElBQUksQ0FBQztvQkFDYixJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUN0QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2xCLENBQUM7Z0JBQ0YsQ0FBQzthQUNELENBQUM7WUFFRixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFFM0UsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDO1FBRU8sZ0JBQWdCO1lBQ3ZCLEtBQUssTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDM0MsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1gsQ0FBQztRQUNGLENBQUM7UUFFTyxTQUFTO1lBQ2hCLElBQUksSUFBSSxDQUFDLEtBQUssc0NBQThCLEVBQUUsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLEtBQUssb0NBQTRCLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEIsQ0FBQztRQUNGLENBQUM7UUFFTyxpQkFBaUIsQ0FBQyxJQUFxQjtZQUM5QyxJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksOEJBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sSUFBSSx5Q0FBb0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekMsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsZUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDaEcsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLEtBQUssR0FBMkIsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztZQUN2QyxPQUFPLElBQUksRUFBRSxDQUFDO2dCQUNiLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQW9CLENBQUMsQ0FBQztnQkFDOUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFekIsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDN0MsTUFBTTtnQkFDUCxDQUFDO2dCQUVELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ25CLE1BQU07Z0JBQ1AsQ0FBQztnQkFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7WUFDNUIsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFZSxPQUFPO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNqQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztLQUNEO0lBT0Q7OztPQUdHO0lBQ0gsTUFBYSxrQkFBa0I7UUFJOUIsSUFBVyxRQUFRO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRUQsWUFDa0IsS0FBNkIsRUFDN0IsVUFBdUI7WUFEdkIsVUFBSyxHQUFMLEtBQUssQ0FBd0I7WUFDN0IsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQVR4QixZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQXlDLENBQUM7WUFDM0Qsb0JBQWUsR0FBMkIsRUFBRSxDQUFDO1FBUzFELENBQUM7UUFFTDs7V0FFRztRQUNJLGlCQUFpQixDQUFDLEtBQWEsRUFBRSxNQUFjO1lBQ3JELE9BQU8sSUFBSSxDQUFDLGVBQWU7aUJBQ3pCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDO2dCQUM3QixFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSwyQkFBMkIsQ0FBQyxHQUEwQixFQUFFLEdBQWUsRUFBRSxTQUFpRCxFQUFFLEtBQXdCO1lBQzFKLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxhQUFhLENBQUMsS0FBYTtZQUNqQyxLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDN0MsSUFBSSxPQUFPLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRSxDQUFDO29CQUMxQixPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2pCLE9BQU87Z0JBQ1IsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxhQUFhO1lBQ25CLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUM3QyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsQ0FBQztRQUNGLENBQUM7UUFHRDs7V0FFRztRQUNJLGFBQWEsQ0FBQyxTQUF1QyxFQUFFLFlBQW9CLEVBQUUsVUFBcUMsRUFBRSxPQUE4QixFQUFFLElBQXdCLEVBQUUsT0FBZ0I7WUFDcE0sTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0MsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDZCxPQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUVELHVFQUF1RTtZQUN2RSwyQkFBMkI7WUFDM0IsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM5RSxNQUFNLE9BQU8sR0FBRywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDO2dCQUNuQyxZQUFZO2dCQUNaLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVU7Z0JBQ2hDLE9BQU8sRUFBRSxPQUFPLElBQUksRUFBRSxLQUFLLEVBQUUsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFO2dCQUN4RixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFO2dCQUN0RyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDeEgsT0FBTzthQUNQLENBQUMsQ0FBQztZQUVILE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN6RCxhQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUVPLFVBQVUsQ0FBQyxHQUEwQixFQUFFLEdBQWUsRUFBRSxTQUF1QyxFQUFFLEtBQXlCO1lBQ2pJLE1BQU0sT0FBTyxHQUFHLElBQUksY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZGLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUUvQixJQUFJLGVBQWlELENBQUM7WUFDdEQsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUU7Z0JBQzlFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDdEIsZUFBZSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7b0JBQ2pELElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUM5QyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLHdDQUE0QixFQUFFLENBQUM7d0JBQ2hFLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQzVCLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEUsQ0FBQyxDQUFDLENBQUM7WUFFSCxhQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QixnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7S0FDRDtJQTdHRCxnREE2R0M7SUFFRCxNQUFNLDJCQUEyQixHQUFHLENBQUMsT0FBOEIsRUFBRSxFQUFFO1FBQ3RFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdEIsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLFlBQVksa0JBQWtCLENBQUMsRUFBRSxDQUFDO1lBQ3RELE1BQU0sSUFBSSxLQUFLLENBQUMsd0ZBQXdGLENBQUMsQ0FBQztRQUMzRyxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUMsQ0FBQztJQUVGLE1BQWEsVUFBVTtRQUlmLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBb0IsRUFBRSxVQUFxQyxFQUFFLE9BQThCLEVBQUUsT0FBZ0I7WUFDckksT0FBTyxJQUFJLFVBQVUsQ0FDcEIsWUFBWSxFQUNaLElBQUEsbUJBQVksR0FBRSxFQUNkLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQ25HLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFDdkYsT0FBTyxFQUNQLFVBQVUsQ0FDVixDQUFDO1FBQ0gsQ0FBQztRQUVNLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBOEIsRUFBRSxVQUFxQztZQUMvRixPQUFPLElBQUksVUFBVSxDQUNwQixPQUFPLENBQUMsWUFBWSxFQUNwQixPQUFPLENBQUMsS0FBSyxFQUNiLE9BQU8sQ0FBQyxPQUFPLEVBQ2YsT0FBTyxDQUFDLGFBQWEsRUFDckIsSUFBSSxFQUNKLFVBQVUsQ0FDVixDQUFDO1FBQ0gsQ0FBQztRQUVELFlBQ2lCLFlBQW9CLEVBQ3BCLEVBQVUsRUFDMUIsT0FBaUIsRUFDakIsT0FBaUIsRUFDRCxXQUFvQixFQUNwQixXQUFzQztZQUx0QyxpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUNwQixPQUFFLEdBQUYsRUFBRSxDQUFRO1lBR1YsZ0JBQVcsR0FBWCxXQUFXLENBQVM7WUFDcEIsZ0JBQVcsR0FBWCxXQUFXLENBQTJCO1lBRXRELElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsdUNBQTRCLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLHVDQUE0QixDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVNLFVBQVUsQ0FBQyxJQUFxQjtZQUN0QyxNQUFNLEVBQUUsR0FBRyxlQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsdUNBQTRCLENBQUM7WUFDdEcsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3pDLElBQUksRUFBRSxLQUFLLE1BQU0sSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQzVDLE9BQU8sS0FBSyxDQUFDO2dCQUNkLENBQUM7WUFDRixDQUFDO1lBRUQsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3pDLElBQUksRUFBRSxLQUFLLE1BQU0sSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQzVDLE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7WUFDRixDQUFDO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO0tBQ0Q7SUF0REQsZ0NBc0RDO0lBRUQsTUFBTSxxQkFBcUI7UUFHMUIsWUFBNEIsUUFBcUM7WUFBckMsYUFBUSxHQUFSLFFBQVEsQ0FBNkI7UUFBSSxDQUFDO1FBRS9ELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxLQUF3QjtZQUN4RCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM5RSxDQUFDO1lBRUQsSUFBSSxDQUFDO2dCQUNKLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQztnQkFDekMsT0FBTyxRQUFRLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNELENBQUM7WUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNaLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO2dCQUM5QixNQUFNLENBQUMsQ0FBQztZQUNULENBQUM7UUFDRixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLEtBQWEsRUFBRSxLQUF3QjtZQUN2RSxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDN0MsSUFBSSxJQUFJLEdBQUcsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDOUMsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUM1QixJQUFJLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDN0YsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1RSxDQUFDO0tBQ0Q7SUFVRCxNQUFNLHVCQUF1QjtRQU81QixJQUFXLE9BQU87WUFDakIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBRUQsWUFBNkIsT0FBeUM7WUFBekMsWUFBTyxHQUFQLE9BQU8sQ0FBa0M7WUFWckQsVUFBSyxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1lBQzlDLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztZQUNoRCxZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7WUFFaEQsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBT3BELENBQUM7UUFFRDs7V0FFRztRQUNJLEdBQUcsQ0FBQyxJQUFnQztZQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENBQUMsSUFBZ0M7WUFDN0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QixDQUFDO1FBQ0YsQ0FBQztRQUVEOztXQUVHO1FBQ0ksTUFBTSxDQUFDLElBQWdDO1lBQzdDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFMUIsTUFBTSxRQUFRLEdBQUcsZUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQzlELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pDLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksY0FBYztZQUNwQixNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDekMsT0FBTztnQkFDTixJQUFJLEtBQUssS0FBSyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLE9BQU8sS0FBSyxPQUFPLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLE9BQU8sS0FBSyxPQUFPLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzFELENBQUM7UUFDSCxDQUFDO1FBRU0sUUFBUTtZQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQzFDLENBQUM7UUFDRixDQUFDO0tBQ0Q7SUFFRDs7O09BR0c7SUFDSCxNQUFNLHNCQUF1QixTQUFRLDZDQUE2RDtRQUFsRzs7WUFDUyxrQkFBYSxHQUFHLElBQUksZUFBTyxFQUEyQixDQUFDO1lBRS9EOztlQUVHO1lBQ2EscUJBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUEyQzdELENBQUM7UUF6Q0E7O1dBRUc7UUFDSCxJQUFXLFNBQVM7WUFDbkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFRDs7O1dBR0c7UUFDSSx1QkFBdUIsQ0FBQyxNQUFjO1lBQzVDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVEOztXQUVHO1FBQ0ksOEJBQThCLENBQUMsSUFBcUI7WUFDMUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUVEOztXQUVHO1FBQ08sVUFBVSxDQUFDLElBQXNCLEVBQUUsTUFBbUM7WUFDL0UsT0FBTztnQkFDTixHQUFHLElBQUk7Z0JBQ1AsMkRBQTJEO2dCQUMzRCxPQUFPLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBb0I7Z0JBQy9ELEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxRQUFRLEVBQUUsSUFBSSxHQUFHLEVBQUU7YUFDbkIsQ0FBQztRQUNILENBQUM7UUFFRDs7V0FFRztRQUNnQixxQkFBcUI7WUFDdkMsT0FBTyxJQUFJLHVCQUF1QixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN4RCxDQUFDO0tBQ0Q7SUFFRCxNQUFNLGFBQWE7UUFNbEIsWUFDa0IsS0FBNkI7WUFBN0IsVUFBSyxHQUFMLEtBQUssQ0FBd0I7UUFFL0MsQ0FBQztRQUVNLFFBQVE7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzFDLENBQUM7WUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUVwQixPQUFPO2dCQUNOLGVBQWUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQjtnQkFDL0MsSUFBSSxLQUFLLEtBQUssT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4RSxPQUFPLEVBQUUsSUFBQSxxQ0FBd0IsRUFBQyxHQUFHLEVBQUU7b0JBQ3RDLElBQUksRUFBRSxPQUFPLENBQUMsU0FBUyxLQUFLLENBQUMsRUFBRSxDQUFDO3dCQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixFQUFFLENBQUM7d0JBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO29CQUMxQixDQUFDO2dCQUNGLENBQUMsQ0FBQzthQUNGLENBQUM7UUFDSCxDQUFDO1FBRUQ7O1dBRUc7UUFDSSw4QkFBOEIsQ0FBQyxHQUFvQjtZQUN6RCxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLDhCQUE4QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRDs7V0FFRztRQUNJLFNBQVMsQ0FBQyxJQUFlO1lBQy9CLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRU8sa0JBQWtCO1lBQ3pCLE1BQU0sS0FBSyxHQUFHLElBQUksc0JBQXNCLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMvQixPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQztRQUNqQyxDQUFDO0tBQ0Q7SUFFRCxNQUFNLGFBQWEsR0FBRyxDQUFDLElBQXdCLEVBQUUsS0FBNkIsRUFBRSxPQUFvQyxFQUFFLE1BQWdDLEVBQUUsRUFBRTtRQUN6SixJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ2IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEMsQ0FBQzthQUFNLENBQUM7WUFDUCxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7SUFDRixDQUFDLENBQUM7SUFFRixNQUFhLGtCQUFrQjtRQUNyQixNQUFNLENBQXlCO1FBQy9CLGVBQWUsQ0FBYztRQUM3QiwyQkFBMkIsQ0FBbUM7UUFDdkUsZUFBZSxDQUFtQjtRQUNsQyxTQUFTLENBQXNDO1FBRy9DLElBQVcsS0FBSztZQUNmLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBRUQsSUFBVyxLQUFLLENBQUMsS0FBYTtZQUM3QixJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2dCQUNwQixhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDbkUsQ0FBQztRQUNGLENBQUM7UUFFRCxJQUFXLHFCQUFxQjtZQUMvQixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztRQUNwQyxDQUFDO1FBRUQsSUFBVyxxQkFBcUIsQ0FBQyxRQUFpQjtZQUNqRCxJQUFJLFFBQVEsS0FBSyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLFFBQVEsQ0FBQztnQkFDdkMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQzdGLENBQUM7UUFDRixDQUFDO1FBRUQsSUFBVyxTQUFTO1lBQ25CLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCxJQUFXLFNBQVMsQ0FBQyxTQUFrQjtZQUN0QyxJQUFJLFNBQVMsS0FBSyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2xDLGlFQUFpRTtnQkFDakUsK0RBQStEO2dCQUMvRCxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNmLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDMUMsQ0FBQztxQkFBTSxDQUFDO29CQUNQLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDN0MsQ0FBQztnQkFFRCxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDdkUsQ0FBQztRQUNGLENBQUM7UUFFRCxJQUFXLEdBQUc7WUFDYixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQztRQUVELElBQVcsR0FBRyxDQUFDLEdBQStCO1lBQzdDLElBQUksR0FBRyxFQUFFLEVBQUUsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztnQkFDaEIsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQ3RELEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO2lCQUN0RSxDQUFDLENBQUM7WUFDSixDQUFDO1FBQ0YsQ0FBQztRQUVELElBQVcsZ0JBQWdCO1lBQzFCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFXLGdCQUFnQixDQUFDLE9BQWlDO1lBQzVELElBQUksT0FBTyxLQUFLLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN4QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsT0FBTyxDQUFDO2dCQUNqQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2hHLENBQUM7UUFDRixDQUFDO1FBRUQsSUFBVyxrQkFBa0I7WUFDNUIsT0FBTyxhQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pELEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ3pELE1BQU0sQ0FBQyxpQkFBUyxDQUFDLENBQ2xCLENBQUM7UUFDSCxDQUFDO1FBRUQsWUFDQyxLQUE2QixFQUM3QixRQUE0QyxFQUM1QyxjQUEyQixFQUMzQix5QkFBMkQsRUFDM0MsWUFBb0IsRUFDcEIsU0FBaUIsRUFDekIsTUFBYyxFQUNOLElBQStCLEVBQ3hDLFVBQXNHLEVBQzdHLFVBQVUsR0FBRyxLQUFLLEVBQ1gsT0FBbUMsU0FBUyxFQUMzQyx5QkFBeUIsS0FBSztZQVB0QixpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUNwQixjQUFTLEdBQVQsU0FBUyxDQUFRO1lBQ3pCLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDTixTQUFJLEdBQUosSUFBSSxDQUEyQjtZQUN4QyxlQUFVLEdBQVYsVUFBVSxDQUE0RjtZQUV0RyxTQUFJLEdBQUosSUFBSSxDQUF3QztZQUMzQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQVE7WUFFdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7WUFDdEMsSUFBSSxDQUFDLDJCQUEyQixHQUFHLHlCQUF5QixDQUFDO1lBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTlCLE1BQU0sV0FBVyxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDekQsQ0FBQztZQUVELElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2hCLGNBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0IsQ0FBQztZQUVELElBQUksQ0FBQyxlQUFlLEdBQUc7Z0JBQ3RCLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixZQUFZO2dCQUNaLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN4RSxLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsV0FBVztnQkFDbEIsU0FBUyxFQUFFLFVBQVU7Z0JBQ3JCLHVCQUF1QixFQUFFLEtBQUs7Z0JBQzlCLHFCQUFxQixFQUFFLHNCQUFzQjthQUM3QyxDQUFDO1lBRUYsd0VBQXdFO1lBQ3hFLGtGQUFrRjtZQUNsRixjQUFjLENBQUMsR0FBRyxFQUFFO2dCQUNuQixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ3pELElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO2dCQUNsQyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2dCQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25FLENBQUM7WUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztRQUNsQyxDQUFDO0tBQ0Q7SUF4SUQsZ0RBd0lDO0lBRUQsTUFBTSxvQkFBb0IsR0FBd0Q7UUFDakYsQ0FBQyxpQ0FBa0IsQ0FBQyxRQUFRLENBQUMsdUNBQStCO1FBQzVELENBQUMsaUNBQWtCLENBQUMsS0FBSyxDQUFDLG9DQUE0QjtRQUN0RCxDQUFDLGlDQUFrQixDQUFDLEdBQUcsQ0FBQyxrQ0FBMEI7S0FDbEQsQ0FBQyJ9