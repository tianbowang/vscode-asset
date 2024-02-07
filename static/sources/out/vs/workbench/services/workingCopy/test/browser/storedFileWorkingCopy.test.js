/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/uri", "vs/workbench/services/workingCopy/common/storedFileWorkingCopy", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/resources", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/base/common/async", "vs/base/common/stream", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, event_1, uri_1, storedFileWorkingCopy_1, buffer_1, cancellation_1, lifecycle_1, workbenchTestServices_1, resources_1, files_1, editor_1, async_1, stream_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestStoredFileWorkingCopyModelWithCustomSaveFactory = exports.TestStoredFileWorkingCopyModelFactory = exports.TestStoredFileWorkingCopyModelWithCustomSave = exports.TestStoredFileWorkingCopyModel = void 0;
    class TestStoredFileWorkingCopyModel extends lifecycle_1.Disposable {
        constructor(resource, contents) {
            super();
            this.resource = resource;
            this.contents = contents;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.throwOnSnapshot = false;
            this.versionId = 0;
            this.pushedStackElement = false;
        }
        fireContentChangeEvent(event) {
            this._onDidChangeContent.fire(event);
        }
        updateContents(newContents) {
            this.doUpdate(newContents);
        }
        setThrowOnSnapshot() {
            this.throwOnSnapshot = true;
        }
        async snapshot(token) {
            if (this.throwOnSnapshot) {
                throw new Error('Fail');
            }
            const stream = (0, buffer_1.newWriteableBufferStream)();
            stream.end(buffer_1.VSBuffer.fromString(this.contents));
            return stream;
        }
        async update(contents, token) {
            this.doUpdate((await (0, buffer_1.streamToBuffer)(contents)).toString());
        }
        doUpdate(newContents) {
            this.contents = newContents;
            this.versionId++;
            this._onDidChangeContent.fire({ isRedoing: false, isUndoing: false });
        }
        pushStackElement() {
            this.pushedStackElement = true;
        }
        dispose() {
            this._onWillDispose.fire();
            super.dispose();
        }
    }
    exports.TestStoredFileWorkingCopyModel = TestStoredFileWorkingCopyModel;
    class TestStoredFileWorkingCopyModelWithCustomSave extends TestStoredFileWorkingCopyModel {
        constructor() {
            super(...arguments);
            this.saveCounter = 0;
            this.throwOnSave = false;
        }
        async save(options, token) {
            if (this.throwOnSave) {
                throw new Error('Fail');
            }
            this.saveCounter++;
            return {
                resource: this.resource,
                ctime: 0,
                etag: '',
                isDirectory: false,
                isFile: true,
                mtime: 0,
                name: 'resource2',
                size: 0,
                isSymbolicLink: false,
                readonly: false,
                locked: false,
                children: undefined
            };
        }
    }
    exports.TestStoredFileWorkingCopyModelWithCustomSave = TestStoredFileWorkingCopyModelWithCustomSave;
    class TestStoredFileWorkingCopyModelFactory {
        async createModel(resource, contents, token) {
            return new TestStoredFileWorkingCopyModel(resource, (await (0, buffer_1.streamToBuffer)(contents)).toString());
        }
    }
    exports.TestStoredFileWorkingCopyModelFactory = TestStoredFileWorkingCopyModelFactory;
    class TestStoredFileWorkingCopyModelWithCustomSaveFactory {
        async createModel(resource, contents, token) {
            return new TestStoredFileWorkingCopyModelWithCustomSave(resource, (await (0, buffer_1.streamToBuffer)(contents)).toString());
        }
    }
    exports.TestStoredFileWorkingCopyModelWithCustomSaveFactory = TestStoredFileWorkingCopyModelWithCustomSaveFactory;
    suite('StoredFileWorkingCopy (with custom save)', function () {
        const factory = new TestStoredFileWorkingCopyModelWithCustomSaveFactory();
        const disposables = new lifecycle_1.DisposableStore();
        let instantiationService;
        let accessor;
        let workingCopy;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            const resource = uri_1.URI.file('test/resource');
            workingCopy = disposables.add(new storedFileWorkingCopy_1.StoredFileWorkingCopy('testStoredFileWorkingCopyType', resource, (0, resources_1.basename)(resource), factory, options => workingCopy.resolve(options), accessor.fileService, accessor.logService, accessor.workingCopyFileService, accessor.filesConfigurationService, accessor.workingCopyBackupService, accessor.workingCopyService, accessor.notificationService, accessor.workingCopyEditorService, accessor.editorService, accessor.elevatedFileService));
        });
        teardown(() => {
            disposables.clear();
        });
        test('save (custom implemented)', async () => {
            let savedCounter = 0;
            let lastSaveEvent = undefined;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
                lastSaveEvent = e;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // unresolved
            await workingCopy.save();
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 0);
            // simple
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello save');
            await workingCopy.save();
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(lastSaveEvent.reason, 1 /* SaveReason.EXPLICIT */);
            assert.ok(lastSaveEvent.stat);
            assert.ok((0, storedFileWorkingCopy_1.isStoredFileWorkingCopySaveEvent)(lastSaveEvent));
            assert.strictEqual(workingCopy.model?.pushedStackElement, true);
            assert.strictEqual(workingCopy.model.saveCounter, 1);
            // error
            workingCopy.model?.updateContents('hello save error');
            workingCopy.model.throwOnSave = true;
            await workingCopy.save();
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), true);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
    suite('StoredFileWorkingCopy', function () {
        const factory = new TestStoredFileWorkingCopyModelFactory();
        const disposables = new lifecycle_1.DisposableStore();
        const resource = uri_1.URI.file('test/resource');
        let instantiationService;
        let accessor;
        let workingCopy;
        function createWorkingCopy(uri = resource) {
            const workingCopy = new storedFileWorkingCopy_1.StoredFileWorkingCopy('testStoredFileWorkingCopyType', uri, (0, resources_1.basename)(uri), factory, options => workingCopy.resolve(options), accessor.fileService, accessor.logService, accessor.workingCopyFileService, accessor.filesConfigurationService, accessor.workingCopyBackupService, accessor.workingCopyService, accessor.notificationService, accessor.workingCopyEditorService, accessor.editorService, accessor.elevatedFileService);
            return workingCopy;
        }
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            workingCopy = disposables.add(createWorkingCopy());
        });
        teardown(() => {
            workingCopy.dispose();
            for (const workingCopy of accessor.workingCopyService.workingCopies) {
                workingCopy.dispose();
            }
            disposables.clear();
        });
        test('registers with working copy service', async () => {
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 1);
            workingCopy.dispose();
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
        });
        test('orphaned tracking', async () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), false);
                let onDidChangeOrphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.set(resource, true);
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
                await onDidChangeOrphanedPromise;
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                onDidChangeOrphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.delete(resource);
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 1 /* FileChangeType.ADDED */ }], false));
                await onDidChangeOrphanedPromise;
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), false);
            });
        });
        test('dirty / modified', async () => {
            assert.strictEqual(workingCopy.isModified(), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isResolved(), true);
            let changeDirtyCounter = 0;
            disposables.add(workingCopy.onDidChangeDirty(() => {
                changeDirtyCounter++;
            }));
            let contentChangeCounter = 0;
            disposables.add(workingCopy.onDidChangeContent(() => {
                contentChangeCounter++;
            }));
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(() => {
                savedCounter++;
            }));
            // Dirty from: Model content change
            workingCopy.model?.updateContents('hello dirty');
            assert.strictEqual(contentChangeCounter, 1);
            assert.strictEqual(workingCopy.isModified(), true);
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), true);
            assert.strictEqual(changeDirtyCounter, 1);
            await workingCopy.save();
            assert.strictEqual(workingCopy.isModified(), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            assert.strictEqual(changeDirtyCounter, 2);
            assert.strictEqual(savedCounter, 1);
            // Dirty from: Initial contents
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello dirty stream')) });
            assert.strictEqual(contentChangeCounter, 2); // content of model did not change
            assert.strictEqual(workingCopy.isModified(), true);
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), true);
            assert.strictEqual(changeDirtyCounter, 3);
            await workingCopy.revert({ soft: true });
            assert.strictEqual(workingCopy.isModified(), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            assert.strictEqual(changeDirtyCounter, 4);
            // Modified from: API
            workingCopy.markModified();
            assert.strictEqual(workingCopy.isModified(), true);
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), true);
            assert.strictEqual(changeDirtyCounter, 5);
            await workingCopy.revert();
            assert.strictEqual(workingCopy.isModified(), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            assert.strictEqual(changeDirtyCounter, 6);
        });
        test('dirty - working copy marks non-dirty when undo reaches saved version ID', async () => {
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello saved state');
            await workingCopy.save();
            assert.strictEqual(workingCopy.isDirty(), false);
            workingCopy.model?.updateContents('changing content once');
            assert.strictEqual(workingCopy.isDirty(), true);
            // Simulate an undo that goes back to the last (saved) version ID
            workingCopy.model.versionId--;
            workingCopy.model?.fireContentChangeEvent({ isRedoing: false, isUndoing: true });
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('resolve (without backup)', async () => {
            let onDidResolveCounter = 0;
            disposables.add(workingCopy.onDidResolve(() => {
                onDidResolveCounter++;
            }));
            // resolve from file
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isResolved(), true);
            assert.strictEqual(onDidResolveCounter, 1);
            assert.strictEqual(workingCopy.model?.contents, 'Hello Html');
            // dirty resolve returns early
            workingCopy.model?.updateContents('hello resolve');
            assert.strictEqual(workingCopy.isDirty(), true);
            await workingCopy.resolve();
            assert.strictEqual(onDidResolveCounter, 1);
            assert.strictEqual(workingCopy.model?.contents, 'hello resolve');
            // dirty resolve with contents updates contents
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello initial contents')) });
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.model?.contents, 'hello initial contents');
            assert.strictEqual(onDidResolveCounter, 2);
            // resolve with pending save returns directly
            const pendingSave = workingCopy.save();
            await workingCopy.resolve();
            await pendingSave;
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.model?.contents, 'hello initial contents');
            assert.strictEqual(onDidResolveCounter, 2);
            // disposed resolve is not throwing an error
            workingCopy.dispose();
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDisposed(), true);
            assert.strictEqual(onDidResolveCounter, 2);
        });
        test('resolve (with backup)', async () => {
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello backup')) });
            const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
            await accessor.workingCopyBackupService.backup(workingCopy, backup.content, undefined, backup.meta);
            assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(workingCopy), true);
            workingCopy.dispose();
            // first resolve loads from backup
            workingCopy = createWorkingCopy();
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(workingCopy.model?.contents, 'hello backup');
            workingCopy.model.updateContents('hello updated');
            await workingCopy.save();
            // subsequent resolve ignores any backups
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.model?.contents, 'Hello Html');
        });
        test('resolve (with backup, preserves metadata and orphaned state)', async () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello backup')) });
                const orphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.set(resource, true);
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
                await orphanedPromise;
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
                await accessor.workingCopyBackupService.backup(workingCopy, backup.content, undefined, backup.meta);
                assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(workingCopy), true);
                workingCopy.dispose();
                workingCopy = createWorkingCopy();
                await workingCopy.resolve();
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                const backup2 = await workingCopy.backup(cancellation_1.CancellationToken.None);
                assert.deepStrictEqual(backup.meta, backup2.meta);
            });
        });
        test('resolve (updates orphaned state accordingly)', async () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                await workingCopy.resolve();
                const orphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.set(resource, true);
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
                await orphanedPromise;
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                // resolving clears orphaned state when successful
                accessor.fileService.notExistsSet.delete(resource);
                await workingCopy.resolve({ forceReadFromFile: true });
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), false);
                // resolving adds orphaned state when fail to read
                try {
                    accessor.fileService.readShouldThrowError = new files_1.FileOperationError('file not found', 1 /* FileOperationResult.FILE_NOT_FOUND */);
                    await workingCopy.resolve();
                    assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                }
                finally {
                    accessor.fileService.readShouldThrowError = undefined;
                }
            });
        });
        test('resolve (FILE_NOT_MODIFIED_SINCE can be handled for resolved working copies)', async () => {
            await workingCopy.resolve();
            try {
                accessor.fileService.readShouldThrowError = new files_1.FileOperationError('file not modified since', 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */);
                await workingCopy.resolve();
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(workingCopy.model?.contents, 'Hello Html');
        });
        test('resolve (FILE_NOT_MODIFIED_SINCE still updates readonly state)', async () => {
            let readonlyChangeCounter = 0;
            disposables.add(workingCopy.onDidChangeReadonly(() => readonlyChangeCounter++));
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isReadonly(), false);
            const stat = await accessor.fileService.resolve(workingCopy.resource, { resolveMetadata: true });
            try {
                accessor.fileService.readShouldThrowError = new files_1.NotModifiedSinceFileOperationError('file not modified since', { ...stat, readonly: true });
                await workingCopy.resolve();
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(!!workingCopy.isReadonly(), true);
            assert.strictEqual(readonlyChangeCounter, 1);
            try {
                accessor.fileService.readShouldThrowError = new files_1.NotModifiedSinceFileOperationError('file not modified since', { ...stat, readonly: false });
                await workingCopy.resolve();
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(readonlyChangeCounter, 2);
        });
        test('resolve does not alter content when model content changed in parallel', async () => {
            await workingCopy.resolve();
            const resolvePromise = workingCopy.resolve();
            workingCopy.model?.updateContents('changed content');
            await resolvePromise;
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.model?.contents, 'changed content');
        });
        test('backup', async () => {
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello backup');
            const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
            assert.ok(backup.meta);
            let backupContents = undefined;
            if (backup.content instanceof buffer_1.VSBuffer) {
                backupContents = backup.content.toString();
            }
            else if ((0, stream_1.isReadableStream)(backup.content)) {
                backupContents = (await (0, stream_1.consumeStream)(backup.content, chunks => buffer_1.VSBuffer.concat(chunks))).toString();
            }
            else if (backup.content) {
                backupContents = (0, stream_1.consumeReadable)(backup.content, chunks => buffer_1.VSBuffer.concat(chunks)).toString();
            }
            assert.strictEqual(backupContents, 'hello backup');
        });
        test('save (no errors) - simple', async () => {
            let savedCounter = 0;
            let lastSaveEvent = undefined;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
                lastSaveEvent = e;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // unresolved
            await workingCopy.save();
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 0);
            // simple
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello save');
            await workingCopy.save();
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(lastSaveEvent.reason, 1 /* SaveReason.EXPLICIT */);
            assert.ok(lastSaveEvent.stat);
            assert.ok((0, storedFileWorkingCopy_1.isStoredFileWorkingCopySaveEvent)(lastSaveEvent));
            assert.strictEqual(workingCopy.model?.pushedStackElement, true);
        });
        test('save (no errors) - save reason', async () => {
            let savedCounter = 0;
            let lastSaveEvent = undefined;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
                lastSaveEvent = e;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // save reason
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello save');
            const source = editor_1.SaveSourceRegistry.registerSource('testSource', 'Hello Save');
            await workingCopy.save({ reason: 2 /* SaveReason.AUTO */, source });
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(lastSaveEvent.reason, 2 /* SaveReason.AUTO */);
            assert.strictEqual(lastSaveEvent.source, source);
        });
        test('save (no errors) - multiple', async () => {
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // multiple saves in parallel are fine and result
            // in a single save when content does not change
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello save');
            await async_1.Promises.settled([
                workingCopy.save({ reason: 2 /* SaveReason.AUTO */ }),
                workingCopy.save({ reason: 1 /* SaveReason.EXPLICIT */ }),
                workingCopy.save({ reason: 4 /* SaveReason.WINDOW_CHANGE */ })
            ]);
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('save (no errors) - multiple, cancellation', async () => {
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // multiple saves in parallel are fine and result
            // in just one save operation (the second one
            // cancels the first)
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello save');
            const firstSave = workingCopy.save();
            workingCopy.model?.updateContents('hello save more');
            const secondSave = workingCopy.save();
            await async_1.Promises.settled([firstSave, secondSave]);
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('save (no errors) - not forced but not dirty', async () => {
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // no save when not forced and not dirty
            await workingCopy.resolve();
            await workingCopy.save();
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('save (no errors) - forced but not dirty', async () => {
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // save when forced even when not dirty
            await workingCopy.resolve();
            await workingCopy.save({ force: true });
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('save (no errors) - save clears orphaned', async () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                let savedCounter = 0;
                disposables.add(workingCopy.onDidSave(e => {
                    savedCounter++;
                }));
                let saveErrorCounter = 0;
                disposables.add(workingCopy.onDidSaveError(() => {
                    saveErrorCounter++;
                }));
                await workingCopy.resolve();
                // save clears orphaned
                const orphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.set(resource, true);
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
                await orphanedPromise;
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                await workingCopy.save({ force: true });
                assert.strictEqual(savedCounter, 1);
                assert.strictEqual(saveErrorCounter, 0);
                assert.strictEqual(workingCopy.isDirty(), false);
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), false);
            });
        });
        test('save (errors)', async () => {
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(reason => {
                savedCounter++;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            await workingCopy.resolve();
            // save error: any error marks working copy dirty
            try {
                accessor.fileService.writeShouldThrowError = new files_1.FileOperationError('write error', 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
                await workingCopy.save({ force: true });
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), true);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), true);
            // save is a no-op unless forced when in error case
            await workingCopy.save({ reason: 2 /* SaveReason.AUTO */ });
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), true);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), true);
            // save clears error flags when successful
            await workingCopy.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), false);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            // save error: conflict
            try {
                accessor.fileService.writeShouldThrowError = new files_1.FileOperationError('write error conflict', 3 /* FileOperationResult.FILE_MODIFIED_SINCE */);
                await workingCopy.save({ force: true });
            }
            catch (error) {
                // error is expected
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 2);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), true);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */), true);
            assert.strictEqual(workingCopy.isDirty(), true);
            // save clears error flags when successful
            await workingCopy.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual(savedCounter, 2);
            assert.strictEqual(saveErrorCounter, 2);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), false);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('save (errors, bubbles up with `ignoreErrorHandler`)', async () => {
            await workingCopy.resolve();
            let error = undefined;
            try {
                accessor.fileService.writeShouldThrowError = new files_1.FileOperationError('write error', 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
                await workingCopy.save({ force: true, ignoreErrorHandler: true });
            }
            catch (e) {
                error = e;
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            assert.ok(error);
        });
        test('save - returns false when save fails', async function () {
            await workingCopy.resolve();
            try {
                accessor.fileService.writeShouldThrowError = new files_1.FileOperationError('write error', 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
                const res = await workingCopy.save({ force: true });
                assert.strictEqual(res, false);
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            const res = await workingCopy.save({ force: true });
            assert.strictEqual(res, true);
        });
        test('save participant', async () => {
            await workingCopy.resolve();
            assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, false);
            let participationCounter = 0;
            const disposable = accessor.workingCopyFileService.addSaveParticipant({
                participate: async (wc) => {
                    if (workingCopy === wc) {
                        participationCounter++;
                    }
                }
            });
            assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, true);
            await workingCopy.save({ force: true });
            assert.strictEqual(participationCounter, 1);
            await workingCopy.save({ force: true, skipSaveParticipants: true });
            assert.strictEqual(participationCounter, 1);
            disposable.dispose();
            assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, false);
            await workingCopy.save({ force: true });
            assert.strictEqual(participationCounter, 1);
        });
        test('Save Participant, calling save from within is unsupported but does not explode (sync save)', async function () {
            await workingCopy.resolve();
            await testSaveFromSaveParticipant(workingCopy, false);
        });
        test('Save Participant, calling save from within is unsupported but does not explode (async save)', async function () {
            await workingCopy.resolve();
            await testSaveFromSaveParticipant(workingCopy, true);
        });
        async function testSaveFromSaveParticipant(workingCopy, async) {
            assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, false);
            const disposable = accessor.workingCopyFileService.addSaveParticipant({
                participate: async () => {
                    if (async) {
                        await (0, async_1.timeout)(10);
                    }
                    await workingCopy.save({ force: true });
                }
            });
            assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, true);
            await workingCopy.save({ force: true });
            disposable.dispose();
        }
        test('revert', async () => {
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello revert');
            let revertedCounter = 0;
            disposables.add(workingCopy.onDidRevert(() => {
                revertedCounter++;
            }));
            // revert: soft
            await workingCopy.revert({ soft: true });
            assert.strictEqual(revertedCounter, 1);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.model?.contents, 'hello revert');
            // revert: not forced
            await workingCopy.revert();
            assert.strictEqual(revertedCounter, 1);
            assert.strictEqual(workingCopy.model?.contents, 'hello revert');
            // revert: forced
            await workingCopy.revert({ force: true });
            assert.strictEqual(revertedCounter, 2);
            assert.strictEqual(workingCopy.model?.contents, 'Hello Html');
            // revert: forced, error
            try {
                workingCopy.model?.updateContents('hello revert');
                accessor.fileService.readShouldThrowError = new files_1.FileOperationError('error', 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
                await workingCopy.revert({ force: true });
            }
            catch (error) {
                // expected (our error)
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(revertedCounter, 2);
            assert.strictEqual(workingCopy.isDirty(), true);
            // revert: forced, file not found error is ignored
            try {
                workingCopy.model?.updateContents('hello revert');
                accessor.fileService.readShouldThrowError = new files_1.FileOperationError('error', 1 /* FileOperationResult.FILE_NOT_FOUND */);
                await workingCopy.revert({ force: true });
            }
            catch (error) {
                // expected (our error)
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(revertedCounter, 3);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('state', async () => {
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), true);
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello state')) });
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), true);
            const savePromise = workingCopy.save();
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), true);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), true);
            await savePromise;
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
        });
        test('joinState', async () => {
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello state')) });
            workingCopy.save();
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), true);
            await workingCopy.joinState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
        });
        test('isReadonly, isResolved, dispose, isDisposed', async () => {
            assert.strictEqual(workingCopy.isResolved(), false);
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(workingCopy.isDisposed(), false);
            await workingCopy.resolve();
            assert.ok(workingCopy.model);
            assert.strictEqual(workingCopy.isResolved(), true);
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(workingCopy.isDisposed(), false);
            let disposedEvent = false;
            disposables.add(workingCopy.onWillDispose(() => {
                disposedEvent = true;
            }));
            let disposedModelEvent = false;
            disposables.add(workingCopy.model.onWillDispose(() => {
                disposedModelEvent = true;
            }));
            workingCopy.dispose();
            assert.strictEqual(workingCopy.isDisposed(), true);
            assert.strictEqual(disposedEvent, true);
            assert.strictEqual(disposedModelEvent, true);
        });
        test('readonly change event', async () => {
            accessor.fileService.readonly = true;
            await workingCopy.resolve();
            assert.strictEqual(!!workingCopy.isReadonly(), true);
            accessor.fileService.readonly = false;
            let readonlyEvent = false;
            disposables.add(workingCopy.onDidChangeReadonly(() => {
                readonlyEvent = true;
            }));
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(readonlyEvent, true);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVkRmlsZVdvcmtpbmdDb3B5LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3JraW5nQ29weS90ZXN0L2Jyb3dzZXIvc3RvcmVkRmlsZVdvcmtpbmdDb3B5LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJoRyxNQUFhLDhCQUErQixTQUFRLHNCQUFVO1FBUTdELFlBQXFCLFFBQWEsRUFBUyxRQUFnQjtZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQURZLGFBQVEsR0FBUixRQUFRLENBQUs7WUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBTjFDLHdCQUFtQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWtELENBQUMsQ0FBQztZQUM1Ryx1QkFBa0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBRTVDLG1CQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDN0Qsa0JBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztZQWMzQyxvQkFBZSxHQUFHLEtBQUssQ0FBQztZQTRCaEMsY0FBUyxHQUFHLENBQUMsQ0FBQztZQUVkLHVCQUFrQixHQUFHLEtBQUssQ0FBQztRQXhDM0IsQ0FBQztRQUVELHNCQUFzQixDQUFDLEtBQXFEO1lBQzNFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELGNBQWMsQ0FBQyxXQUFtQjtZQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFHRCxrQkFBa0I7WUFDakIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDN0Is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