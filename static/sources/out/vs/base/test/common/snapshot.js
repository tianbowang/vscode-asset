/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, lazy_1, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertSnapshot = exports.SnapshotContext = void 0;
    // setup on import so assertSnapshot has the current context without explicit passing
    let context;
    const sanitizeName = (name) => name.replace(/[^a-z0-9_-]/gi, '_');
    const normalizeCrlf = (str) => str.replace(/\r\n/g, '\n');
    /**
     * This is exported only for tests against the snapshotting itself! Use
     * {@link assertSnapshot} as a consumer!
     */
    class SnapshotContext {
        constructor(test) {
            this.test = test;
            this.nextIndex = 0;
            this.usedNames = new Set();
            if (!test) {
                throw new Error('assertSnapshot can only be used in a test');
            }
            if (!test.file) {
                throw new Error('currentTest.file is not set, please open an issue with the test you\'re trying to run');
            }
            const src = network_1.FileAccess.asFileUri('');
            const parts = test.file.split(/[/\\]/g);
            this.namePrefix = sanitizeName(test.fullTitle()) + '.';
            this.snapshotsDir = uri_1.URI.joinPath(src, ...[...parts.slice(0, -1), '__snapshots__']);
        }
        async assert(value, options) {
            const originalStack = new Error().stack; // save to make the stack nicer on failure
            const nameOrIndex = (options?.name ? sanitizeName(options.name) : this.nextIndex++);
            const fileName = this.namePrefix + nameOrIndex + '.' + (options?.extension || 'snap');
            this.usedNames.add(fileName);
            const fpath = uri_1.URI.joinPath(this.snapshotsDir, fileName).fsPath;
            const actual = formatValue(value);
            let expected;
            try {
                expected = await __readFileInTests(fpath);
            }
            catch {
                console.info(`Creating new snapshot in: ${fpath}`);
                await __mkdirPInTests(this.snapshotsDir.fsPath);
                await __writeFileInTests(fpath, actual);
                return;
            }
            if (normalizeCrlf(expected) !== normalizeCrlf(actual)) {
                await __writeFileInTests(fpath + '.actual', actual);
                const err = new Error(`Snapshot #${nameOrIndex} does not match expected output`);
                err.expected = expected;
                err.actual = actual;
                err.snapshotPath = fpath;
                err.stack = err.stack
                    .split('\n')
                    // remove all frames from the async stack and keep the original caller's frame
                    .slice(0, 1)
                    .concat(originalStack.split('\n').slice(3))
                    .join('\n');
                throw err;
            }
        }
        async removeOldSnapshots() {
            const contents = await __readDirInTests(this.snapshotsDir.fsPath);
            const toDelete = contents.filter(f => f.startsWith(this.namePrefix) && !this.usedNames.has(f));
            if (toDelete.length) {
                console.info(`Deleting ${toDelete.length} old snapshots for ${this.test?.fullTitle()}`);
            }
            await Promise.all(toDelete.map(f => __unlinkInTests(uri_1.URI.joinPath(this.snapshotsDir, f).fsPath)));
        }
    }
    exports.SnapshotContext = SnapshotContext;
    const debugDescriptionSymbol = Symbol.for('debug.description');
    function formatValue(value, level = 0, seen = []) {
        switch (typeof value) {
            case 'bigint':
            case 'boolean':
            case 'number':
            case 'symbol':
            case 'undefined':
                return String(value);
            case 'string':
                return level === 0 ? value : JSON.stringify(value);
            case 'function':
                return `[Function ${value.name}]`;
            case 'object': {
                if (value === null) {
                    return 'null';
                }
                if (value instanceof RegExp) {
                    return String(value);
                }
                if (seen.includes(value)) {
                    return '[Circular]';
                }
                if (debugDescriptionSymbol in value && typeof value[debugDescriptionSymbol] === 'function') {
                    return value[debugDescriptionSymbol]();
                }
                const oi = '  '.repeat(level);
                const ci = '  '.repeat(level + 1);
                if (Array.isArray(value)) {
                    const children = value.map(v => formatValue(v, level + 1, [...seen, value]));
                    const multiline = children.some(c => c.includes('\n')) || children.join(', ').length > 80;
                    return multiline ? `[\n${ci}${children.join(`,\n${ci}`)}\n${oi}]` : `[ ${children.join(', ')} ]`;
                }
                let entries;
                let prefix = '';
                if (value instanceof Map) {
                    prefix = 'Map ';
                    entries = [...value.entries()];
                }
                else if (value instanceof Set) {
                    prefix = 'Set ';
                    entries = [...value.entries()];
                }
                else {
                    entries = Object.entries(value);
                }
                const lines = entries.map(([k, v]) => `${k}: ${formatValue(v, level + 1, [...seen, value])}`);
                return prefix + (lines.length > 1
                    ? `{\n${ci}${lines.join(`,\n${ci}`)}\n${oi}}`
                    : `{ ${lines.join(',\n')} }`);
            }
            default:
                throw new Error(`Unknown type ${value}`);
        }
    }
    setup(function () {
        const currentTest = this.currentTest;
        context = new lazy_1.Lazy(() => new SnapshotContext(currentTest));
    });
    teardown(async function () {
        if (this.currentTest?.state === 'passed') {
            await context?.rawValue?.removeOldSnapshots();
        }
        context = undefined;
    });
    /**
     * Implements a snapshot testing utility. ⚠️ This is async! ⚠️
     *
     * The first time a snapshot test is run, it'll record the value it's called
     * with as the expected value. Subsequent runs will fail if the value differs,
     * but the snapshot can be regenerated by hand or using the Selfhost Test
     * Provider Extension which'll offer to update it.
     *
     * The snapshot will be associated with the currently running test and stored
     * in a `__snapshots__` directory next to the test file, which is expected to
     * be the first `.test.js` file in the callstack.
     */
    function assertSnapshot(value, options) {
        if (!context) {
            throw new Error('assertSnapshot can only be used in a test');
        }
        return context.value.assert(value, options);
    }
    exports.assertSnapshot = assertSnapshot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hcHNob3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9jb21tb24vc25hcHNob3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLHFGQUFxRjtJQUNyRixJQUFJLE9BQTBDLENBQUM7SUFDL0MsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFFLE1BQU0sYUFBYSxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQVNsRTs7O09BR0c7SUFDSCxNQUFhLGVBQWU7UUFNM0IsWUFBNkIsSUFBNEI7WUFBNUIsU0FBSSxHQUFKLElBQUksQ0FBd0I7WUFMakQsY0FBUyxHQUFHLENBQUMsQ0FBQztZQUdMLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBR3RDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7WUFDOUQsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUZBQXVGLENBQUMsQ0FBQztZQUMxRyxDQUFDO1lBRUQsTUFBTSxHQUFHLEdBQUcsb0JBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFeEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsR0FB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