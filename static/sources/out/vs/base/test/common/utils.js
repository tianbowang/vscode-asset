/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri"], function (require, exports, lifecycle_1, path_1, platform_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.throwIfDisposablesAreLeakedAsync = exports.throwIfDisposablesAreLeaked = exports.ensureNoDisposablesAreLeakedInTestSuite = exports.assertThrowsAsync = exports.testRepeat = exports.suiteRepeat = exports.toResource = void 0;
    function toResource(path) {
        if (platform_1.isWindows) {
            return uri_1.URI.file((0, path_1.join)('C:\\', btoa(this.test.fullTitle()), path));
        }
        return uri_1.URI.file((0, path_1.join)('/', btoa(this.test.fullTitle()), path));
    }
    exports.toResource = toResource;
    function suiteRepeat(n, description, callback) {
        for (let i = 0; i < n; i++) {
            suite(`${description} (iteration ${i})`, callback);
        }
    }
    exports.suiteRepeat = suiteRepeat;
    function testRepeat(n, description, callback) {
        for (let i = 0; i < n; i++) {
            test(`${description} (iteration ${i})`, callback);
        }
    }
    exports.testRepeat = testRepeat;
    async function assertThrowsAsync(block, message = 'Missing expected exception') {
        try {
            await block();
        }
        catch {
            return;
        }
        const err = message instanceof Error ? message : new Error(message);
        throw err;
    }
    exports.assertThrowsAsync = assertThrowsAsync;
    /**
     * Use this function to ensure that all disposables are cleaned up at the end of each test in the current suite.
     *
     * Use `markAsSingleton` if disposable singletons are created lazily that are allowed to outlive the test.
     * Make sure that the singleton properly registers all child disposables so that they are excluded too.
     *
     * @returns A {@link DisposableStore} that can optionally be used to track disposables in the test.
     * This will be automatically disposed on test teardown.
    */
    function ensureNoDisposablesAreLeakedInTestSuite() {
        let tracker;
        let store;
        setup(() => {
            store = new lifecycle_1.DisposableStore();
            tracker = new lifecycle_1.DisposableTracker();
            (0, lifecycle_1.setDisposableTracker)(tracker);
        });
        teardown(function () {
            store.dispose();
            (0, lifecycle_1.setDisposableTracker)(null);
            if (this.currentTest?.state !== 'failed') {
                const result = tracker.computeLeakingDisposables();
                if (result) {
                    console.error(result.details);
                    throw new Error(`There are ${result.leaks.length} undisposed disposables!${result.details}`);
                }
            }
        });
        // Wrap store as the suite function is called before it's initialized
        const testContext = {
            add(o) {
                return store.add(o);
            }
        };
        return testContext;
    }
    exports.ensureNoDisposablesAreLeakedInTestSuite = ensureNoDisposablesAreLeakedInTestSuite;
    function throwIfDisposablesAreLeaked(body, logToConsole = true) {
        const tracker = new lifecycle_1.DisposableTracker();
        (0, lifecycle_1.setDisposableTracker)(tracker);
        body();
        (0, lifecycle_1.setDisposableTracker)(null);
        computeLeakingDisposables(tracker, logToConsole);
    }
    exports.throwIfDisposablesAreLeaked = throwIfDisposablesAreLeaked;
    async function throwIfDisposablesAreLeakedAsync(body) {
        const tracker = new lifecycle_1.DisposableTracker();
        (0, lifecycle_1.setDisposableTracker)(tracker);
        await body();
        (0, lifecycle_1.setDisposableTracker)(null);
        computeLeakingDisposables(tracker);
    }
    exports.throwIfDisposablesAreLeakedAsync = throwIfDisposablesAreLeakedAsync;
    function computeLeakingDisposables(tracker, logToConsole = true) {
        const result = tracker.computeLeakingDisposables();
        if (result) {
            if (logToConsole) {
                console.error(result.details);
            }
            throw new Error(`There are ${result.leaks.length} undisposed disposables!${result.details}`);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9jb21tb24vdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLFNBQWdCLFVBQVUsQ0FBWSxJQUFZO1FBQ2pELElBQUksb0JBQVMsRUFBRSxDQUFDO1lBQ2YsT0FBTyxTQUFHLENBQUMsSUFBSSxDQUFDLElBQUEsV0FBSSxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVELE9BQU8sU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFBLFdBQUksRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFORCxnQ0FNQztJQUVELFNBQWdCLFdBQVcsQ0FBQyxDQUFTLEVBQUUsV0FBbUIsRUFBRSxRQUE2QjtRQUN4RixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDNUIsS0FBSyxDQUFDLEdBQUcsV0FBVyxlQUFlLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDRixDQUFDO0lBSkQsa0NBSUM7SUFFRCxTQUFnQixVQUFVLENBQUMsQ0FBUyxFQUFFLFdBQW1CLEVBQUUsUUFBNEI7UUFDdEYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxHQUFHLFdBQVcsZUFBZSxDQUFDLEdBQUcsRUFBRSxRQUFR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