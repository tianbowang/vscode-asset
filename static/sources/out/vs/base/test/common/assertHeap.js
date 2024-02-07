/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertHeap = void 0;
    let currentTest;
    const snapshotsToAssert = [];
    setup(function () {
        currentTest = this.currentTest;
    });
    suiteTeardown(async () => {
        await Promise.all(snapshotsToAssert.map(async (snap) => {
            const counts = await snap.counts;
            const asserts = Object.entries(snap.opts.classes);
            if (asserts.length !== counts.length) {
                throw new Error(`expected class counts to equal assertions length for ${snap.test}`);
            }
            for (const [i, [name, doAssert]] of asserts.entries()) {
                try {
                    doAssert(counts[i]);
                }
                catch (e) {
                    throw new Error(`Unexpected number of ${name} instances (${counts[i]}) after "${snap.test}":\n\n${e.message}\n\nSnapshot saved at: ${snap.file}`);
                }
            }
        }));
        snapshotsToAssert.length = 0;
    });
    const snapshotMinTime = 20000;
    /**
     * Takes a heap snapshot, and asserts the state of classes in memory. This
     * works in Node and the Electron sandbox, but is a no-op in the browser.
     * Snapshots are process asynchronously and will report failures at the end of
     * the suite.
     *
     * This method should be used sparingly (e.g. once at the end of a suite to
     * ensure nothing leaked before), as gathering a heap snapshot is fairly
     * slow, at least until V8 11.5.130 (https://v8.dev/blog/speeding-up-v8-heap-snapshots).
     *
     * Takes options containing a mapping of class names, and assertion functions
     * to run on the number of retained instances of that class. For example:
     *
     * ```ts
     * assertSnapshot({
     *	classes: {
     *		ShouldNeverLeak: count => assert.strictEqual(count, 0),
     *		SomeSingleton: count => assert(count <= 1),
     *	}
     *});
     * ```
     */
    async function assertHeap(opts) {
        if (!currentTest) {
            throw new Error('assertSnapshot can only be used when a test is running');
        }
        // snapshotting can take a moment, ensure the test timeout is decently long
        // so it doesn't immediately fail.
        if (currentTest.timeout() < snapshotMinTime) {
            currentTest.timeout(snapshotMinTime);
        }
        if (typeof __analyzeSnapshotInTests === 'undefined') {
            return; // running in browser, no-op
        }
        const { done, file } = await __analyzeSnapshotInTests(currentTest.fullTitle(), Object.keys(opts.classes));
        snapshotsToAssert.push({ counts: done, file, test: currentTest.fullTitle(), opts });
    }
    exports.assertHeap = assertHeap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0SGVhcC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9hc3NlcnRIZWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxJQUFJLFdBQW1DLENBQUM7SUFFeEMsTUFBTSxpQkFBaUIsR0FBZ0csRUFBRSxDQUFDO0lBRTFILEtBQUssQ0FBQztRQUNMLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxDQUFDO0lBRUgsYUFBYSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ3hCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLElBQUksRUFBQyxFQUFFO1lBQ3BELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUVqQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEQsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDdEYsQ0FBQztZQUVELEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO2dCQUN2RCxJQUFJLENBQUM7b0JBQ0osUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixDQUFDO2dCQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsSUFBSSxlQUFlLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxPQUFPLDBCQUEwQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDbkosQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUMsQ0FBQztJQU1ILE1BQU0sZUFBZSxHQUFHLEtBQU0sQ0FBQztJQUUvQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BcUJHO0lBQ0ksS0FBSyxVQUFVLFVBQVUsQ0FBQyxJQUE0QjtRQUM1RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFRCwyRUFBMkU7UUFDM0Usa0NBQWtDO1FBQ2xDLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRSxHQUFHLGVBQWUsRUFBRSxDQUFDO1lBQzdDLFdBQVcsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELElBQUksT0FBTyx3QkFBd0IsS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUNyRCxPQUFPLENBQUMsNEJBQTRCO1FBQ3JDLENBQUM7UUFFRCxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sd0JBQXdCLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDMUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFqQkQsZ0NBaUJDIn0=