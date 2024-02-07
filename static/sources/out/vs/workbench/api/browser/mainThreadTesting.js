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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/prefixTree", "vs/base/common/uri", "vs/editor/common/core/range", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/testCoverage", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol"], function (require, exports, event_1, lifecycle_1, prefixTree_1, uri_1, range_1, uriIdentity_1, observableValue_1, testCoverage_1, testId_1, testProfileService_1, testResult_1, testResultService_1, testService_1, testTypes_1, extHostCustomers_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTesting = void 0;
    let MainThreadTesting = class MainThreadTesting extends lifecycle_1.Disposable {
        constructor(extHostContext, uriIdentityService, testService, testProfiles, resultService) {
            super();
            this.uriIdentityService = uriIdentityService;
            this.testService = testService;
            this.testProfiles = testProfiles;
            this.resultService = resultService;
            this.diffListener = this._register(new lifecycle_1.MutableDisposable());
            this.testProviderRegistrations = new Map();
            this.proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostTesting);
            this._register(this.testService.onDidCancelTestRun(({ runId }) => {
                this.proxy.$cancelExtensionTestRun(runId);
            }));
            this._register(event_1.Event.debounce(testProfiles.onDidChange, (_last, e) => e)(() => {
                const obj = {};
                for (const { controller, profiles } of this.testProfiles.all()) {
                    obj[controller.id] = profiles.filter(p => p.isDefault).map(p => p.profileId);
                }
                this.proxy.$setDefaultRunProfiles(obj);
            }));
            this._register(resultService.onResultsChanged(evt => {
                const results = 'completed' in evt ? evt.completed : ('inserted' in evt ? evt.inserted : undefined);
                const serialized = results?.toJSONWithMessages();
                if (serialized) {
                    this.proxy.$publishTestResults([serialized]);
                }
            }));
        }
        /**
         * @inheritdoc
         */
        $markTestRetired(testIds) {
            let tree;
            if (testIds) {
                tree = new prefixTree_1.WellDefinedPrefixTree();
                for (const id of testIds) {
                    tree.insert(testId_1.TestId.fromString(id).path, undefined);
                }
            }
            for (const result of this.resultService.results) {
                // all non-live results are already entirely outdated
                if (result instanceof testResult_1.LiveTestResult) {
                    result.markRetired(tree);
                }
            }
        }
        /**
         * @inheritdoc
         */
        $publishTestRunProfile(profile) {
            const controller = this.testProviderRegistrations.get(profile.controllerId);
            if (controller) {
                this.testProfiles.addProfile(controller.instance, profile);
            }
        }
        /**
         * @inheritdoc
         */
        $updateTestRunConfig(controllerId, profileId, update) {
            this.testProfiles.updateProfile(controllerId, profileId, update);
        }
        /**
         * @inheritdoc
         */
        $removeTestProfile(controllerId, profileId) {
            this.testProfiles.removeProfile(controllerId, profileId);
        }
        /**
         * @inheritdoc
         */
        $addTestsToRun(controllerId, runId, tests) {
            this.withLiveRun(runId, r => r.addTestChainToRun(controllerId, tests.map(t => testTypes_1.ITestItem.deserialize(this.uriIdentityService, t))));
        }
        /**
         * @inheritdoc
         */
        $signalCoverageAvailable(runId, taskId, available) {
            this.withLiveRun(runId, run => {
                const task = run.tasks.find(t => t.id === taskId);
                if (!task) {
                    return;
                }
                const fn = available ? ((token) => testCoverage_1.TestCoverage.load(taskId, {
                    provideFileCoverage: async (token) => await this.proxy.$provideFileCoverage(runId, taskId, token)
                        .then(c => c.map(u => testTypes_1.IFileCoverage.deserialize(this.uriIdentityService, u))),
                    resolveFileCoverage: (i, token) => this.proxy.$resolveFileCoverage(runId, taskId, i, token)
                        .then(d => d.map(testTypes_1.CoverageDetails.deserialize)),
                }, this.uriIdentityService, token)) : undefined;
                task.coverage.set(fn, undefined);
            });
        }
        /**
         * @inheritdoc
         */
        $startedExtensionTestRun(req) {
            this.resultService.createLiveResult(req);
        }
        /**
         * @inheritdoc
         */
        $startedTestRunTask(runId, task) {
            this.withLiveRun(runId, r => r.addTask(task));
        }
        /**
         * @inheritdoc
         */
        $finishedTestRunTask(runId, taskId) {
            this.withLiveRun(runId, r => r.markTaskComplete(taskId));
        }
        /**
         * @inheritdoc
         */
        $finishedExtensionTestRun(runId) {
            this.withLiveRun(runId, r => r.markComplete());
        }
        /**
         * @inheritdoc
         */
        $updateTestStateInRun(runId, taskId, testId, state, duration) {
            this.withLiveRun(runId, r => r.updateState(testId, taskId, state, duration));
        }
        /**
         * @inheritdoc
         */
        $appendOutputToRun(runId, taskId, output, locationDto, testId) {
            const location = locationDto && {
                uri: uri_1.URI.revive(locationDto.uri),
                range: range_1.Range.lift(locationDto.range)
            };
            this.withLiveRun(runId, r => r.appendOutput(output, taskId, location, testId));
        }
        /**
         * @inheritdoc
         */
        $appendTestMessagesInRun(runId, taskId, testId, messages) {
            const r = this.resultService.getResult(runId);
            if (r && r instanceof testResult_1.LiveTestResult) {
                for (const message of messages) {
                    r.appendMessage(testId, taskId, testTypes_1.ITestMessage.deserialize(this.uriIdentityService, message));
                }
            }
        }
        /**
         * @inheritdoc
         */
        $registerTestController(controllerId, labelStr, canRefreshValue) {
            const disposable = new lifecycle_1.DisposableStore();
            const label = disposable.add(new observableValue_1.MutableObservableValue(labelStr));
            const canRefresh = disposable.add(new observableValue_1.MutableObservableValue(canRefreshValue));
            const controller = {
                id: controllerId,
                label,
                canRefresh,
                syncTests: () => this.proxy.$syncTests(),
                refreshTests: token => this.proxy.$refreshTests(controllerId, token),
                configureRunProfile: id => this.proxy.$configureRunProfile(controllerId, id),
                runTests: (reqs, token) => this.proxy.$runControllerTests(reqs, token),
                startContinuousRun: (reqs, token) => this.proxy.$startContinuousRun(reqs, token),
                expandTest: (testId, levels) => this.proxy.$expandTest(testId, isFinite(levels) ? levels : -1),
            };
            disposable.add((0, lifecycle_1.toDisposable)(() => this.testProfiles.removeProfile(controllerId)));
            disposable.add(this.testService.registerTestController(controllerId, controller));
            this.testProviderRegistrations.set(controllerId, {
                instance: controller,
                label,
                canRefresh,
                disposable
            });
        }
        /**
         * @inheritdoc
         */
        $updateController(controllerId, patch) {
            const controller = this.testProviderRegistrations.get(controllerId);
            if (!controller) {
                return;
            }
            if (patch.label !== undefined) {
                controller.label.value = patch.label;
            }
            if (patch.canRefresh !== undefined) {
                controller.canRefresh.value = patch.canRefresh;
            }
        }
        /**
         * @inheritdoc
         */
        $unregisterTestController(controllerId) {
            this.testProviderRegistrations.get(controllerId)?.disposable.dispose();
            this.testProviderRegistrations.delete(controllerId);
        }
        /**
         * @inheritdoc
         */
        $subscribeToDiffs() {
            this.proxy.$acceptDiff(this.testService.collection.getReviverDiff().map(testTypes_1.TestsDiffOp.serialize));
            this.diffListener.value = this.testService.onDidProcessDiff(this.proxy.$acceptDiff, this.proxy);
        }
        /**
         * @inheritdoc
         */
        $unsubscribeFromDiffs() {
            this.diffListener.clear();
        }
        /**
         * @inheritdoc
         */
        $publishDiff(controllerId, diff) {
            this.testService.publishDiff(controllerId, diff.map(d => testTypes_1.TestsDiffOp.deserialize(this.uriIdentityService, d)));
        }
        async $runTests(req, token) {
            const result = await this.testService.runResolvedTests(req, token);
            return result.id;
        }
        dispose() {
            super.dispose();
            for (const subscription of this.testProviderRegistrations.values()) {
                subscription.disposable.dispose();
            }
            this.testProviderRegistrations.clear();
        }
        withLiveRun(runId, fn) {
            const r = this.resultService.getResult(runId);
            return r && r instanceof testResult_1.LiveTestResult ? fn(r) : undefined;
        }
    };
    exports.MainThreadTesting = MainThreadTesting;
    exports.MainThreadTesting = MainThreadTesting = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadTesting),
        __param(1, uriIdentity_1.IUriIdentityService),
        __param(2, testService_1.ITestService),
        __param(3, testProfileService_1.ITestProfileService),
        __param(4, testResultService_1.ITestResultService)
    ], MainThreadTesting);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFRlc3RpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkVGVzdGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1QnpGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsc0JBQVU7UUFVaEQsWUFDQyxjQUErQixFQUNWLGtCQUF3RCxFQUMvRCxXQUEwQyxFQUNuQyxZQUFrRCxFQUNuRCxhQUFrRDtZQUV0RSxLQUFLLEVBQUUsQ0FBQztZQUw4Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQzlDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2xCLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtZQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBb0I7WUFidEQsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELDhCQUF5QixHQUFHLElBQUksR0FBRyxFQUtoRCxDQUFDO1lBVUosSUFBSSxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO2dCQUNoRSxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtnQkFDN0UsTUFBTSxHQUFHLEdBQWlFLEVBQUUsQ0FBQztnQkFDN0UsS0FBSyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztvQkFDaEUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDOUUsQ0FBQztnQkFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbkQsTUFBTSxPQUFPLEdBQUcsV0FBVyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDcEcsTUFBTSxVQUFVLEdBQUcsT0FBTyxFQUFFLGtCQUFrQixFQUFFLENBQUM7Z0JBQ2pELElBQUksVUFBVSxFQUFFLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRDs7V0FFRztRQUNILGdCQUFnQixDQUFDLE9BQTZCO1lBQzdDLElBQUksSUFBa0QsQ0FBQztZQUN2RCxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNiLElBQUksR0FBRyxJQUFJLGtDQUFxQixFQUFFLENBQUM7Z0JBQ25DLEtBQUssTUFBTSxFQUFFLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3BELENBQUM7WUFDRixDQUFDO1lBRUQsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqRCxxREFBcUQ7Z0JBQ3JELElBQUksTUFBTSxZQUFZLDJCQUFjLEVBQUUsQ0FBQztvQkFDdEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUIsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxzQkFBc0IsQ0FBQyxPQUF3QjtZQUM5QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM1RSxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNoQixJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzVELENBQUM7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxvQkFBb0IsQ0FBQyxZQUFvQixFQUFFLFNBQWlCLEVBQUUsTUFBZ0M7WUFDN0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxrQkFBa0IsQ0FBQyxZQUFvQixFQUFFLFNBQWlCO1lBQ3pELElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxjQUFjLENBQUMsWUFBb0IsRUFBRSxLQUFhLEVBQUUsS0FBNkI7WUFDaEYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUM1RCxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRDs7V0FFRztRQUNILHdCQUF3QixDQUFDLEtBQWEsRUFBRSxNQUFjLEVBQUUsU0FBa0I7WUFDekUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQzdCLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNYLE9BQU87Z0JBQ1IsQ0FBQztnQkFFRCxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUF3QixFQUFFLEVBQUUsQ0FBQywyQkFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQy9FLG1CQUFtQixFQUFFLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQzt5QkFDN0YsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLHlCQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5RSxtQkFBbUIsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDO3lCQUN6RixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLDJCQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQy9DLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFFL0MsSUFBSSxDQUFDLFFBQWlHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM1SCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRDs7V0FFRztRQUNILHdCQUF3QixDQUFDLEdBQTZCO1lBQ3JELElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVEOztXQUVHO1FBQ0gsbUJBQW1CLENBQUMsS0FBYSxFQUFFLElBQWtCO1lBQ3BELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRDs7V0FFRztRQUNILG9CQUFvQixDQUFDLEtBQWEsRUFBRSxNQUFjO1lBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVEOztXQUVHO1FBQ0gseUJBQXlCLENBQUMsS0FBYTtZQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRDs7V0FFRztRQUNJLHFCQUFxQixDQUFDLEtBQWEsRUFBRSxNQUFjLEVBQUUsTUFBYyxFQUFFLEtBQXNCLEVBQUUsUUFBaUI7WUFDcEgsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVEOztXQUVHO1FBQ0ksa0JBQWtCLENBQUMsS0FBYSxFQUFFLE1BQWMsRUFBRSxNQUFnQixFQUFFLFdBQTBCLEVBQUUsTUFBZTtZQUNySCxNQUFNLFFBQVEsR0FBRyxXQUFXLElBQUk7Z0JBQy9CLEdBQUcsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7Z0JBQ2hDLEtBQUssRUFBRSxhQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7YUFDcEMsQ0FBQztZQUVGLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFHRDs7V0FFRztRQUNJLHdCQUF3QixDQUFDLEtBQWEsRUFBRSxNQUFjLEVBQUUsTUFBYyxFQUFFLFFBQW1DO1lBQ2pILE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSwyQkFBYyxFQUFFLENBQUM7Z0JBQ3RDLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7b0JBQ2hDLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSx3QkFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDN0YsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSSx1QkFBdUIsQ0FBQyxZQUFvQixFQUFFLFFBQWdCLEVBQUUsZUFBd0I7WUFDOUYsTUFBTSxVQUFVLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDekMsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLHdDQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLHdDQUFzQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDL0UsTUFBTSxVQUFVLEdBQThCO2dCQUM3QyxFQUFFLEVBQUUsWUFBWTtnQkFDaEIsS0FBSztnQkFDTCxVQUFVO2dCQUNWLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRTtnQkFDeEMsWUFBWSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQztnQkFDcEUsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7Z0JBQzVFLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztnQkFDdEUsa0JBQWtCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUM7Z0JBQ2hGLFVBQVUsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDOUYsQ0FBQztZQUVGLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRixVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFFbEYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7Z0JBQ2hELFFBQVEsRUFBRSxVQUFVO2dCQUNwQixLQUFLO2dCQUNMLFVBQVU7Z0JBQ1YsVUFBVTthQUNWLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRDs7V0FFRztRQUNJLGlCQUFpQixDQUFDLFlBQW9CLEVBQUUsS0FBMkI7WUFDekUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2pCLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUMvQixVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ3RDLENBQUM7WUFFRCxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3BDLFVBQVUsQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFDaEQsQ0FBQztRQUNGLENBQUM7UUFFRDs7V0FFRztRQUNJLHlCQUF5QixDQUFDLFlBQW9CO1lBQ3BELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVEOztXQUVHO1FBQ0ksaUJBQWlCO1lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyx1QkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDaEcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakcsQ0FBQztRQUVEOztXQUVHO1FBQ0kscUJBQXFCO1lBQzNCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVEOztXQUVHO1FBQ0ksWUFBWSxDQUFDLFlBQW9CLEVBQUUsSUFBOEI7WUFDdkUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsdUJBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUEyQixFQUFFLEtBQXdCO1lBQzNFLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkUsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFZSxPQUFPO1lBQ3RCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQixLQUFLLE1BQU0sWUFBWSxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUNwRSxZQUFZLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25DLENBQUM7WUFDRCxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDeEMsQ0FBQztRQUVPLFdBQVcsQ0FBSSxLQUFhLEVBQUUsRUFBOEI7WUFDbkUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLDJCQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzdELENBQUM7S0FDRCxDQUFBO0lBL1FZLDhDQUFpQjtnQ0FBakIsaUJBQWlCO1FBRDdCLElBQUEsdUNBQW9CLEVBQUMsOEJBQVcsQ0FBQyxpQkFBaUIsQ0FBQztRQWFqRCxXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsMEJBQVksQ0FBQTtRQUNaLFdBQUEsd0NBQW1CLENBQUE7UUFDbkIsV0FBQSxzQ0FBa0IsQ0FBQTtPQWZSLGlCQUFpQixDQStRN0IifQ==