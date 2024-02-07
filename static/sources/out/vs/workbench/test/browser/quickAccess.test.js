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
define(["require", "exports", "assert", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/platform/quickinput/common/quickInput", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/quickinput/browser/pickerQuickAccess"], function (require, exports, assert, platform_1, quickAccess_1, quickInput_1, workbenchTestServices_1, lifecycle_1, async_1, pickerQuickAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('QuickAccess', () => {
        let disposables;
        let instantiationService;
        let accessor;
        let providerDefaultCalled = false;
        let providerDefaultCanceled = false;
        let providerDefaultDisposed = false;
        let provider1Called = false;
        let provider1Canceled = false;
        let provider1Disposed = false;
        let provider2Called = false;
        let provider2Canceled = false;
        let provider2Disposed = false;
        let provider3Called = false;
        let provider3Canceled = false;
        let provider3Disposed = false;
        let TestProviderDefault = class TestProviderDefault {
            constructor(quickInputService, disposables) {
                this.quickInputService = quickInputService;
            }
            provide(picker, token) {
                assert.ok(picker);
                providerDefaultCalled = true;
                token.onCancellationRequested(() => providerDefaultCanceled = true);
                // bring up provider #3
                setTimeout(() => this.quickInputService.quickAccess.show(providerDescriptor3.prefix));
                return (0, lifecycle_1.toDisposable)(() => providerDefaultDisposed = true);
            }
        };
        TestProviderDefault = __decorate([
            __param(0, quickInput_1.IQuickInputService)
        ], TestProviderDefault);
        class TestProvider1 {
            provide(picker, token) {
                assert.ok(picker);
                provider1Called = true;
                token.onCancellationRequested(() => provider1Canceled = true);
                return (0, lifecycle_1.toDisposable)(() => provider1Disposed = true);
            }
        }
        class TestProvider2 {
            provide(picker, token) {
                assert.ok(picker);
                provider2Called = true;
                token.onCancellationRequested(() => provider2Canceled = true);
                return (0, lifecycle_1.toDisposable)(() => provider2Disposed = true);
            }
        }
        class TestProvider3 {
            provide(picker, token) {
                assert.ok(picker);
                provider3Called = true;
                token.onCancellationRequested(() => provider3Canceled = true);
                // hide without picking
                setTimeout(() => picker.hide());
                return (0, lifecycle_1.toDisposable)(() => provider3Disposed = true);
            }
        }
        const providerDescriptorDefault = { ctor: TestProviderDefault, prefix: '', helpEntries: [] };
        const providerDescriptor1 = { ctor: TestProvider1, prefix: 'test', helpEntries: [] };
        const providerDescriptor2 = { ctor: TestProvider2, prefix: 'test something', helpEntries: [] };
        const providerDescriptor3 = { ctor: TestProvider3, prefix: 'changed', helpEntries: [] };
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
        });
        teardown(() => {
            disposables.dispose();
        });
        test('registry', () => {
            const registry = (platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
            const restore = registry.clear();
            assert.ok(!registry.getQuickAccessProvider('test'));
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(registry.registerQuickAccessProvider(providerDescriptorDefault));
            assert(registry.getQuickAccessProvider('') === providerDescriptorDefault);
            assert(registry.getQuickAccessProvider('test') === providerDescriptorDefault);
            const disposable = disposables.add(registry.registerQuickAccessProvider(providerDescriptor1));
            assert(registry.getQuickAccessProvider('test') === providerDescriptor1);
            const providers = registry.getQuickAccessProviders();
            assert(providers.some(provider => provider.prefix === 'test'));
            disposable.dispose();
            assert(registry.getQuickAccessProvider('test') === providerDescriptorDefault);
            disposables.dispose();
            assert.ok(!registry.getQuickAccessProvider('test'));
            restore();
        });
        test('provider', async () => {
            const registry = (platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
            const restore = registry.clear();
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(registry.registerQuickAccessProvider(providerDescriptorDefault));
            disposables.add(registry.registerQuickAccessProvider(providerDescriptor1));
            disposables.add(registry.registerQuickAccessProvider(providerDescriptor2));
            disposables.add(registry.registerQuickAccessProvider(providerDescriptor3));
            accessor.quickInputService.quickAccess.show('test');
            assert.strictEqual(providerDefaultCalled, false);
            assert.strictEqual(provider1Called, true);
            assert.strictEqual(provider2Called, false);
            assert.strictEqual(provider3Called, false);
            assert.strictEqual(providerDefaultCanceled, false);
            assert.strictEqual(provider1Canceled, false);
            assert.strictEqual(provider2Canceled, false);
            assert.strictEqual(provider3Canceled, false);
            assert.strictEqual(providerDefaultDisposed, false);
            assert.strictEqual(provider1Disposed, false);
            assert.strictEqual(provider2Disposed, false);
            assert.strictEqual(provider3Disposed, false);
            provider1Called = false;
            accessor.quickInputService.quickAccess.show('test something');
            assert.strictEqual(providerDefaultCalled, false);
            assert.strictEqual(provider1Called, false);
            assert.strictEqual(provider2Called, true);
            assert.strictEqual(provider3Called, false);
            assert.strictEqual(providerDefaultCanceled, false);
            assert.strictEqual(provider1Canceled, true);
            assert.strictEqual(provider2Canceled, false);
            assert.strictEqual(provider3Canceled, false);
            assert.strictEqual(providerDefaultDisposed, false);
            assert.strictEqual(provider1Disposed, true);
            assert.strictEqual(provider2Disposed, false);
            assert.strictEqual(provider3Disposed, false);
            provider2Called = false;
            provider1Canceled = false;
            provider1Disposed = false;
            accessor.quickInputService.quickAccess.show('usedefault');
            assert.strictEqual(providerDefaultCalled, true);
            assert.strictEqual(provider1Called, false);
            assert.strictEqual(provider2Called, false);
            assert.strictEqual(provider3Called, false);
            assert.strictEqual(providerDefaultCanceled, false);
            assert.strictEqual(provider1Canceled, false);
            assert.strictEqual(provider2Canceled, true);
            assert.strictEqual(provider3Canceled, false);
            assert.strictEqual(providerDefaultDisposed, false);
            assert.strictEqual(provider1Disposed, false);
            assert.strictEqual(provider2Disposed, true);
            assert.strictEqual(provider3Disposed, false);
            await (0, async_1.timeout)(1);
            assert.strictEqual(providerDefaultCanceled, true);
            assert.strictEqual(providerDefaultDisposed, true);
            assert.strictEqual(provider3Called, true);
            await (0, async_1.timeout)(1);
            assert.strictEqual(provider3Canceled, true);
            assert.strictEqual(provider3Disposed, true);
            disposables.dispose();
            restore();
        });
        let fastProviderCalled = false;
        let slowProviderCalled = false;
        let fastAndSlowProviderCalled = false;
        let slowProviderCanceled = false;
        let fastAndSlowProviderCanceled = false;
        class FastTestQuickPickProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
            constructor() {
                super('fast');
            }
            _getPicks(filter, disposables, token) {
                fastProviderCalled = true;
                return [{ label: 'Fast Pick' }];
            }
        }
        class SlowTestQuickPickProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
            constructor() {
                super('slow');
            }
            async _getPicks(filter, disposables, token) {
                slowProviderCalled = true;
                await (0, async_1.timeout)(1);
                if (token.isCancellationRequested) {
                    slowProviderCanceled = true;
                }
                return [{ label: 'Slow Pick' }];
            }
        }
        class FastAndSlowTestQuickPickProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
            constructor() {
                super('bothFastAndSlow');
            }
            _getPicks(filter, disposables, token) {
                fastAndSlowProviderCalled = true;
                return {
                    picks: [{ label: 'Fast Pick' }],
                    additionalPicks: (async () => {
                        await (0, async_1.timeout)(1);
                        if (token.isCancellationRequested) {
                            fastAndSlowProviderCanceled = true;
                        }
                        return [{ label: 'Slow Pick' }];
                    })()
                };
            }
        }
        const fastProviderDescriptor = { ctor: FastTestQuickPickProvider, prefix: 'fast', helpEntries: [] };
        const slowProviderDescriptor = { ctor: SlowTestQuickPickProvider, prefix: 'slow', helpEntries: [] };
        const fastAndSlowProviderDescriptor = { ctor: FastAndSlowTestQuickPickProvider, prefix: 'bothFastAndSlow', helpEntries: [] };
        test('quick pick access - show()', async () => {
            const registry = (platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
            const restore = registry.clear();
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(registry.registerQuickAccessProvider(fastProviderDescriptor));
            disposables.add(registry.registerQuickAccessProvider(slowProviderDescriptor));
            disposables.add(registry.registerQuickAccessProvider(fastAndSlowProviderDescriptor));
            accessor.quickInputService.quickAccess.show('fast');
            assert.strictEqual(fastProviderCalled, true);
            assert.strictEqual(slowProviderCalled, false);
            assert.strictEqual(fastAndSlowProviderCalled, false);
            fastProviderCalled = false;
            accessor.quickInputService.quickAccess.show('slow');
            await (0, async_1.timeout)(2);
            assert.strictEqual(fastProviderCalled, false);
            assert.strictEqual(slowProviderCalled, true);
            assert.strictEqual(slowProviderCanceled, false);
            assert.strictEqual(fastAndSlowProviderCalled, false);
            slowProviderCalled = false;
            accessor.quickInputService.quickAccess.show('bothFastAndSlow');
            await (0, async_1.timeout)(2);
            assert.strictEqual(fastProviderCalled, false);
            assert.strictEqual(slowProviderCalled, false);
            assert.strictEqual(fastAndSlowProviderCalled, true);
            assert.strictEqual(fastAndSlowProviderCanceled, false);
            fastAndSlowProviderCalled = false;
            accessor.quickInputService.quickAccess.show('slow');
            accessor.quickInputService.quickAccess.show('bothFastAndSlow');
            accessor.quickInputService.quickAccess.show('fast');
            assert.strictEqual(fastProviderCalled, true);
            assert.strictEqual(slowProviderCalled, true);
            assert.strictEqual(fastAndSlowProviderCalled, true);
            await (0, async_1.timeout)(2);
            assert.strictEqual(slowProviderCanceled, true);
            assert.strictEqual(fastAndSlowProviderCanceled, true);
            disposables.dispose();
            restore();
        });
        test('quick pick access - pick()', async () => {
            const registry = (platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
            const restore = registry.clear();
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(registry.registerQuickAccessProvider(fastProviderDescriptor));
            const result = accessor.quickInputService.quickAccess.pick('fast');
            assert.strictEqual(fastProviderCalled, true);
            assert.ok(result instanceof Promise);
            disposables.dispose();
            restore();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tBY2Nlc3MudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3Rlc3QvYnJvd3Nlci9xdWlja0FjY2Vzcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBYWhHLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1FBRXpCLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLG9CQUEyQyxDQUFDO1FBQ2hELElBQUksUUFBNkIsQ0FBQztRQUVsQyxJQUFJLHFCQUFxQixHQUFHLEtBQUssQ0FBQztRQUNsQyxJQUFJLHVCQUF1QixHQUFHLEtBQUssQ0FBQztRQUNwQyxJQUFJLHVCQUF1QixHQUFHLEtBQUssQ0FBQztRQUVwQyxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDNUIsSUFBSSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFDOUIsSUFBSSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFFOUIsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDO1FBQzVCLElBQUksaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQzlCLElBQUksaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBRTlCLElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztRQUM1QixJQUFJLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUM5QixJQUFJLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUU5QixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtZQUV4QixZQUFpRCxpQkFBcUMsRUFBRSxXQUE0QjtnQkFBbkUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUFrQyxDQUFDO1lBRXpILE9BQU8sQ0FBQyxNQUFrQyxFQUFFLEtBQXdCO2dCQUNuRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNsQixxQkFBcUIs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