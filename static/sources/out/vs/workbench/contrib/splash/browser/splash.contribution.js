/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/splash/browser/splash", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/splash/browser/partsSplash"], function (require, exports, platform_1, contributions_1, splash_1, extensions_1, partsSplash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(splash_1.ISplashStorageService, class SplashStorageService {
        async saveWindowSplash(splash) {
            const raw = JSON.stringify(splash);
            localStorage.setItem('monaco-parts-splash', raw);
        }
    }, 1 /* InstantiationType.Delayed */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(partsSplash_1.PartsSplash, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BsYXNoLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc3BsYXNoL2Jyb3dzZXIvc3BsYXNoLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxJQUFBLDhCQUFpQixFQUFDLDhCQUFxQixFQUFFLE1BQU0sb0JBQW9CO1FBR2xFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFvQjtZQUMxQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLFlBQVksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEQsQ0FBQztLQUNELG9DQUE0QixDQUFDO0lBRTlCLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUMvRix5QkFBVyxrQ0FFWCxDQUFDIn0=