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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testService", "vs/base/common/event", "vs/workbench/contrib/testing/common/testId", "vs/base/common/prefixTree"], function (require, exports, cancellation_1, lifecycle_1, contextkey_1, instantiation_1, storage_1, storedValue_1, testingContextKeys_1, testService_1, event_1, testId_1, prefixTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingContinuousRunService = exports.ITestingContinuousRunService = void 0;
    exports.ITestingContinuousRunService = (0, instantiation_1.createDecorator)('testingContinuousRunService');
    let TestingContinuousRunService = class TestingContinuousRunService extends lifecycle_1.Disposable {
        get lastRunProfileIds() {
            return this.lastRun.get(new Set());
        }
        constructor(testService, storageService, contextKeyService) {
            super();
            this.testService = testService;
            this.changeEmitter = new event_1.Emitter();
            this.running = new prefixTree_1.WellDefinedPrefixTree();
            this.onDidChange = this.changeEmitter.event;
            this.isGloballyOn = testingContextKeys_1.TestingContextKeys.isContinuousModeOn.bindTo(contextKeyService);
            this.lastRun = this._register(new storedValue_1.StoredValue({
                key: 'lastContinuousRunProfileIds',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */,
                serialization: {
                    deserialize: v => new Set(JSON.parse(v)),
                    serialize: v => JSON.stringify([...v])
                },
            }, storageService));
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.globallyRunning?.dispose();
                for (const cts of this.running.values()) {
                    cts.dispose();
                }
            }));
        }
        /** @inheritdoc */
        isSpecificallyEnabledFor(testId) {
            return this.running.size > 0 && this.running.hasKey(testId_1.TestId.fromString(testId).path);
        }
        /** @inheritdoc */
        isEnabledForAParentOf(testId) {
            if (this.globallyRunning) {
                return true;
            }
            return this.running.size > 0 && this.running.hasKeyOrParent(testId_1.TestId.fromString(testId).path);
        }
        /** @inheritdoc */
        isEnabledForAChildOf(testId) {
            return this.running.size > 0 && this.running.hasKeyOrChildren(testId_1.TestId.fromString(testId).path);
        }
        /** @inheritdoc */
        isEnabled() {
            return !!this.globallyRunning || this.running.size > 0;
        }
        /** @inheritdoc */
        start(profile, testId) {
            const cts = new cancellation_1.CancellationTokenSource();
            if (testId === undefined) {
                this.isGloballyOn.set(true);
            }
            if (!testId) {
                this.globallyRunning?.dispose(true);
                this.globallyRunning = cts;
            }
            else {
                this.running.mutate(testId_1.TestId.fromString(testId).path, c => {
                    c?.dispose(true);
                    return cts;
                });
            }
            this.lastRun.store(new Set(profile.map(p => p.profileId)));
            this.testService.startContinuousRun({
                continuous: true,
                targets: profile.map(p => ({
                    testIds: [testId ?? p.controllerId],
                    controllerId: p.controllerId,
                    profileGroup: p.group,
                    profileId: p.profileId
                })),
            }, cts.token);
            this.changeEmitter.fire(testId);
        }
        /** @inheritdoc */
        stop(testId) {
            if (!testId) {
                this.globallyRunning?.dispose(true);
                this.globallyRunning = undefined;
            }
            else {
                this.running.delete(testId_1.TestId.fromString(testId).path)?.dispose(true);
            }
            if (testId === undefined) {
                this.isGloballyOn.set(false);
            }
            this.changeEmitter.fire(testId);
        }
    };
    exports.TestingContinuousRunService = TestingContinuousRunService;
    exports.TestingContinuousRunService = TestingContinuousRunService = __decorate([
        __param(0, testService_1.ITestService),
        __param(1, storage_1.IStorageService),
        __param(2, contextkey_1.IContextKeyService)
    ], TestingContinuousRunService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0NvbnRpbnVvdXNSdW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2NvbW1vbi90ZXN0aW5nQ29udGludW91c1J1blNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0JuRixRQUFBLDRCQUE0QixHQUFHLElBQUEsK0JBQWUsRUFBK0IsNkJBQTZCLENBQUMsQ0FBQztJQW1EbEgsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTtRQVcxRCxJQUFXLGlCQUFpQjtZQUMzQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQsWUFDZSxXQUF5QyxFQUN0QyxjQUErQixFQUM1QixpQkFBcUM7WUFFekQsS0FBSyxFQUFFLENBQUM7WUFKdUIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFidkMsa0JBQWEsR0FBRyxJQUFJLGVBQU8sRUFBc0IsQ0FBQztZQUVsRCxZQUFPLEdBQUcsSUFBSSxrQ0FBcUIsRUFBMkIsQ0FBQztZQUloRSxnQkFBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBWXRELElBQUksQ0FBQyxZQUFZLEdBQUcsdUNBQWtCLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQVcsQ0FBYztnQkFDMUQsR0FBRyxFQUFFLDZCQUE2QjtnQkFDbEMsS0FBSyxnQ0FBd0I7Z0JBQzdCLE1BQU0sK0JBQXVCO2dCQUM3QixhQUFhLEVBQUU7b0JBQ2QsV0FBVyxFQUFFLENBQUMsQ0FBQyxF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