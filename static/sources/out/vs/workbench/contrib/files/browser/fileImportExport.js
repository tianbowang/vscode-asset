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
define(["require", "exports", "vs/nls", "vs/base/common/cancellation", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/common/files", "vs/workbench/services/editor/common/editorService", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/resources", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/uri", "vs/workbench/services/host/browser/host", "vs/platform/workspace/common/workspace", "vs/platform/dnd/browser/dnd", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/base/common/platform", "vs/base/browser/dom", "vs/platform/log/common/log", "vs/base/common/network", "vs/base/common/labels", "vs/base/common/stream", "vs/base/common/lifecycle", "vs/base/common/functional", "vs/base/common/arrays", "vs/base/common/errors", "vs/platform/configuration/common/configuration", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage"], function (require, exports, nls_1, cancellation_1, dialogs_1, files_1, notification_1, progress_1, files_2, files_3, editorService_1, async_1, buffer_1, resources_1, bulkEditService_1, explorerModel_1, uri_1, host_1, workspace_1, dnd_1, workspaceEditing_1, platform_1, dom_1, log_1, network_1, labels_1, stream_1, lifecycle_1, functional_1, arrays_1, errors_1, configuration_1, webFileSystemAccess_1, instantiation_1, storage_1) {
    "use strict";
    var BrowserFileUpload_1, FileDownload_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMultipleFilesOverwriteConfirm = exports.getFileOverwriteConfirm = exports.FileDownload = exports.ExternalFileImport = exports.BrowserFileUpload = void 0;
    let BrowserFileUpload = class BrowserFileUpload {
        static { BrowserFileUpload_1 = this; }
        static { this.MAX_PARALLEL_UPLOADS = 20; }
        constructor(progressService, dialogService, explorerService, editorService, fileService) {
            this.progressService = progressService;
            this.dialogService = dialogService;
            this.explorerService = explorerService;
            this.editorService = editorService;
            this.fileService = fileService;
        }
        upload(target, source) {
            const cts = new cancellation_1.CancellationTokenSource();
            // Indicate progress globally
            const uploadPromise = this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                cancellable: true,
                title: (0, nls_1.localize)('uploadingFiles', "Uploading")
            }, async (progress) => this.doUpload(target, this.toTransfer(source), progress, cts.token), () => cts.dispose(true));
            // Also indicate progress in the files view
            this.progressService.withProgress({ location: files_3.VIEW_ID, delay: 500 }, () => uploadPromise);
            return uploadPromise;
        }
        toTransfer(source) {
            if ((0, dom_1.isDragEvent)(source)) {
                return source.dataTransfer;
            }
            const transfer = { items: [] };
            // We want to reuse the same code for uploading from
            // Drag & Drop as well as input element based upload
            // so we convert into webkit data transfer when the
            // input element approach is used (simplified).
            for (const file of source) {
                transfer.items.push({
                    webkitGetAsEntry: () => {
                        return {
                            name: file.name,
                            isDirectory: false,
                            isFile: true,
                            createReader: () => { throw new Error('Unsupported for files'); },
                            file: resolve => resolve(file)
                        };
                    }
                });
            }
            return transfer;
        }
        async doUpload(target, source, progress, token) {
            const items = source.items;
            // Somehow the items thing is being modified at random, maybe as a security
            // measure since this is a DND operation. As such, we copy the items into
            // an array we own as early as possible before using it.
            const entries = [];
            for (const item of items) {
                entries.push(item.webkitGetAsEntry());
            }
            const results = [];
            const operation = {
                startTime: Date.now(),
                progressScheduler: new async_1.RunOnceWorker(steps => { progress.report(steps[steps.length - 1]); }, 1000),
                filesTotal: entries.length,
                filesUploaded: 0,
                totalBytesUploaded: 0
            };
            // Upload all entries in parallel up to a
            // certain maximum leveraging the `Limiter`
            const uploadLimiter = new async_1.Limiter(BrowserFileUpload_1.MAX_PARALLEL_UPLOADS);
            await async_1.Promises.settled(entries.map(entry => {
                return uploadLimiter.queue(async () => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    // Confirm overwrite as needed
                    if (target && entry.name && target.getChild(entry.name)) {
                        const { confirmed } = await this.dialogService.confirm(getFileOverwriteConfirm(entry.name));
                        if (!confirmed) {
                            return;
                        }
                        await this.explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit((0, resources_1.joinPath)(target.resource, entry.name), undefined, { recursive: true, folder: target.getChild(entry.name)?.isDirectory })], {
                            undoLabel: (0, nls_1.localize)('overwrite', "Overwrite {0}", entry.name),
                            progressLabel: (0, nls_1.localize)('overwriting', "Overwriting {0}", entry.name),
                        });
                        if (token.isCancellationRequested) {
                            return;
                        }
                    }
                    // Upload entry
                    const result = await this.doUploadEntry(entry, target.resource, target, progress, operation, token);
                    if (result) {
                        results.push(result);
                    }
                });
            }));
            operation.progressScheduler.dispose();
            // Open uploaded file in editor only if we upload just one
            const firstUploadedFile = results[0];
            if (!token.isCancellationRequested && firstUploadedFile?.isFile) {
                await this.editorService.openEditor({ resource: firstUploadedFile.resource, options: { pinned: true } });
            }
        }
        async doUploadEntry(entry, parentResource, target, progress, operation, token) {
            if (token.isCancellationRequested || !entry.name || (!entry.isFile && !entry.isDirectory)) {
                return undefined;
            }
            // Report progress
            let fileBytesUploaded = 0;
            const reportProgress = (fileSize, bytesUploaded) => {
                fileBytesUploaded += bytesUploaded;
                operation.totalBytesUploaded += bytesUploaded;
                const bytesUploadedPerSecond = operation.totalBytesUploaded / ((Date.now() - operation.startTime) / 1000);
                // Small file
                let message;
                if (fileSize < files_1.ByteSize.MB) {
                    if (operation.filesTotal === 1) {
                        message = `${entry.name}`;
                    }
                    else {
                        message = (0, nls_1.localize)('uploadProgressSmallMany', "{0} of {1} files ({2}/s)", operation.filesUploaded, operation.filesTotal, files_1.ByteSize.formatSize(bytesUploadedPerSecond));
                    }
                }
                // Large file
                else {
                    message = (0, nls_1.localize)('uploadProgressLarge', "{0} ({1} of {2}, {3}/s)", entry.name, files_1.ByteSize.formatSize(fileBytesUploaded), files_1.ByteSize.formatSize(fileSize), files_1.ByteSize.formatSize(bytesUploadedPerSecond));
                }
                // Report progress but limit to update only once per second
                operation.progressScheduler.work({ message });
            };
            operation.filesUploaded++;
            reportProgress(0, 0);
            // Handle file upload
            const resource = (0, resources_1.joinPath)(parentResource, entry.name);
            if (entry.isFile) {
                const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // Chrome/Edge/Firefox support stream method, but only use it for
                // larger files to reduce the overhead of the streaming approach
                if (typeof file.stream === 'function' && file.size > files_1.ByteSize.MB) {
                    await this.doUploadFileBuffered(resource, file, reportProgress, token);
                }
                // Fallback to unbuffered upload for other browsers or small files
                else {
                    await this.doUploadFileUnbuffered(resource, file, reportProgress);
                }
                return { isFile: true, resource };
            }
            // Handle folder upload
            else {
                // Create target folder
                await this.fileService.createFolder(resource);
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // Recursive upload files in this directory
                const dirReader = entry.createReader();
                const childEntries = [];
                let done = false;
                do {
                    const childEntriesChunk = await new Promise((resolve, reject) => dirReader.readEntries(resolve, reject));
                    if (childEntriesChunk.length > 0) {
                        childEntries.push(...childEntriesChunk);
                    }
                    else {
                        done = true; // an empty array is a signal that all entries have been read
                    }
                } while (!done && !token.isCancellationRequested);
                // Update operation total based on new counts
                operation.filesTotal += childEntries.length;
                // Split up files from folders to upload
                const folderTarget = target && target.getChild(entry.name) || undefined;
                const fileChildEntries = [];
                const folderChildEntries = [];
                for (const childEntry of childEntries) {
                    if (childEntry.isFile) {
                        fileChildEntries.push(childEntry);
                    }
                    else if (childEntry.isDirectory) {
                        folderChildEntries.push(childEntry);
                    }
                }
                // Upload files (up to `MAX_PARALLEL_UPLOADS` in parallel)
                const fileUploadQueue = new async_1.Limiter(BrowserFileUpload_1.MAX_PARALLEL_UPLOADS);
                await async_1.Promises.settled(fileChildEntries.map(fileChildEntry => {
                    return fileUploadQueue.queue(() => this.doUploadEntry(fileChildEntry, resource, folderTarget, progress, operation, token));
                }));
                // Upload folders (sequentially give we don't know their sizes)
                for (const folderChildEntry of folderChildEntries) {
                    await this.doUploadEntry(folderChildEntry, resource, folderTarget, progress, operation, token);
                }
                return { isFile: false, resource };
            }
        }
        async doUploadFileBuffered(resource, file, progressReporter, token) {
            const writeableStream = (0, buffer_1.newWriteableBufferStream)({
                // Set a highWaterMark to prevent the stream
                // for file upload to produce large buffers
                // in-memory
                highWaterMark: 10
            });
            const writeFilePromise = this.fileService.writeFile(resource, writeableStream);
            // Read the file in chunks using File.stream() web APIs
            try {
                const reader = file.stream().getReader();
                let res = await reader.read();
                while (!res.done) {
                    if (token.isCancellationRequested) {
                        break;
                    }
                    // Write buffer into stream but make sure to wait
                    // in case the `highWaterMark` is reached
                    const buffer = buffer_1.VSBuffer.wrap(res.value);
                    await writeableStream.write(buffer);
                    if (token.isCancellationRequested) {
                        break;
                    }
                    // Report progress
                    progressReporter(file.size, buffer.byteLength);
                    res = await reader.read();
                }
                writeableStream.end(undefined);
            }
            catch (error) {
                writeableStream.error(error);
                writeableStream.end();
            }
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Wait for file being written to target
            await writeFilePromise;
        }
        doUploadFileUnbuffered(resource, file, progressReporter) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        if (event.target?.result instanceof ArrayBuffer) {
                            const buffer = buffer_1.VSBuffer.wrap(new Uint8Array(event.target.result));
                            await this.fileService.writeFile(resource, buffer);
                            // Report progress
                            progressReporter(file.size, buffer.byteLength);
                        }
                        else {
                            throw new Error('Could not read from dropped file.');
                        }
                        resolve();
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                // Start reading the file to trigger `onload`
                reader.readAsArrayBuffer(file);
            });
        }
    };
    exports.BrowserFileUpload = BrowserFileUpload;
    exports.BrowserFileUpload = BrowserFileUpload = BrowserFileUpload_1 = __decorate([
        __param(0, progress_1.IProgressService),
        __param(1, dialogs_1.IDialogService),
        __param(2, files_2.IExplorerService),
        __param(3, editorService_1.IEditorService),
        __param(4, files_1.IFileService)
    ], BrowserFileUpload);
    //#endregion
    //#region External File Import (drag and drop)
    let ExternalFileImport = class ExternalFileImport {
        constructor(fileService, hostService, contextService, configurationService, dialogService, workspaceEditingService, explorerService, editorService, progressService, notificationService, instantiationService) {
            this.fileService = fileService;
            this.hostService = hostService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.dialogService = dialogService;
            this.workspaceEditingService = workspaceEditingService;
            this.explorerService = explorerService;
            this.editorService = editorService;
            this.progressService = progressService;
            this.notificationService = notificationService;
            this.instantiationService = instantiationService;
        }
        async import(target, source, targetWindow) {
            const cts = new cancellation_1.CancellationTokenSource();
            // Indicate progress globally
            const importPromise = this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                cancellable: true,
                title: (0, nls_1.localize)('copyingFiles', "Copying...")
            }, async () => await this.doImport(target, source, targetWindow, cts.token), () => cts.dispose(true));
            // Also indicate progress in the files view
            this.progressService.withProgress({ location: files_3.VIEW_ID, delay: 500 }, () => importPromise);
            return importPromise;
        }
        async doImport(target, source, targetWindow, token) {
            // Activate all providers for the resources dropped
            const candidateFiles = (0, arrays_1.coalesce)((await this.instantiationService.invokeFunction(accessor => (0, dnd_1.extractEditorsAndFilesDropData)(accessor, source))).map(editor => editor.resource));
            await Promise.all(candidateFiles.map(resource => this.fileService.activateProvider(resource.scheme)));
            // Check for dropped external files to be folders
            const files = (0, arrays_1.coalesce)(candidateFiles.filter(resource => this.fileService.hasProvider(resource)));
            const resolvedFiles = await this.fileService.resolveAll(files.map(file => ({ resource: file })));
            if (token.isCancellationRequested) {
                return;
            }
            // Pass focus to window
            this.hostService.focus(targetWindow);
            // Handle folders by adding to workspace if we are in workspace context and if dropped on top
            const folders = resolvedFiles.filter(resolvedFile => resolvedFile.success && resolvedFile.stat?.isDirectory).map(resolvedFile => ({ uri: resolvedFile.stat.resource }));
            if (folders.length > 0 && target.isRoot) {
                let ImportChoice;
                (function (ImportChoice) {
                    ImportChoice[ImportChoice["Copy"] = 1] = "Copy";
                    ImportChoice[ImportChoice["Add"] = 2] = "Add";
                })(ImportChoice || (ImportChoice = {}));
                const buttons = [
                    {
                        label: folders.length > 1 ?
                            (0, nls_1.localize)('copyFolders', "&&Copy Folders") :
                            (0, nls_1.localize)('copyFolder', "&&Copy Folder"),
                        run: () => ImportChoice.Copy
                    }
                ];
                let message;
                // We only allow to add a folder to the workspace if there is already a workspace folder with that scheme
                const workspaceFolderSchemas = this.contextService.getWorkspace().folders.map(folder => folder.uri.scheme);
                if (folders.some(folder => workspaceFolderSchemas.indexOf(folder.uri.scheme) >= 0)) {
                    buttons.unshift({
                        label: folders.length > 1 ?
                            (0, nls_1.localize)('addFolders', "&&Add Folders to Workspace") :
                            (0, nls_1.localize)('addFolder', "&&Add Folder to Workspace"),
                        run: () => ImportChoice.Add
                    });
                    message = folders.length > 1 ?
                        (0, nls_1.localize)('dropFolders', "Do you want to copy the folders or add the folders to the workspace?") :
                        (0, nls_1.localize)('dropFolder', "Do you want to copy '{0}' or add '{0}' as a folder to the workspace?", (0, resources_1.basename)(folders[0].uri));
                }
                else {
                    message = folders.length > 1 ?
                        (0, nls_1.localize)('copyfolders', "Are you sure to want to copy folders?") :
                        (0, nls_1.localize)('copyfolder', "Are you sure to want to copy '{0}'?", (0, resources_1.basename)(folders[0].uri));
                }
                const { result } = await this.dialogService.prompt({
                    type: notification_1.Severity.Info,
                    message,
                    buttons,
                    cancelButton: true
                });
                // Add folders
                if (result === ImportChoice.Add) {
                    return this.workspaceEditingService.addFolders(folders);
                }
                // Copy resources
                if (result === ImportChoice.Copy) {
                    return this.importResources(target, files, token);
                }
            }
            // Handle dropped files (only support FileStat as target)
            else if (target instanceof explorerModel_1.ExplorerItem) {
                return this.importResources(target, files, token);
            }
        }
        async importResources(target, resources, token) {
            if (resources && resources.length > 0) {
                // Resolve target to check for name collisions and ask user
                const targetStat = await this.fileService.resolve(target.resource);
                if (token.isCancellationRequested) {
                    return;
                }
                // Check for name collisions
                const targetNames = new Set();
                const caseSensitive = this.fileService.hasCapability(target.resource, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
                if (targetStat.children) {
                    targetStat.children.forEach(child => {
                        targetNames.add(caseSensitive ? child.name : child.name.toLowerCase());
                    });
                }
                let inaccessibleFileCount = 0;
                const resourcesFiltered = (0, arrays_1.coalesce)((await async_1.Promises.settled(resources.map(async (resource) => {
                    const fileDoesNotExist = !(await this.fileService.exists(resource));
                    if (fileDoesNotExist) {
                        inaccessibleFileCount++;
                        return undefined;
                    }
                    if (targetNames.has(caseSensitive ? (0, resources_1.basename)(resource) : (0, resources_1.basename)(resource).toLowerCase())) {
                        const confirmationResult = await this.dialogService.confirm(getFileOverwriteConfirm((0, resources_1.basename)(resource)));
                        if (!confirmationResult.confirmed) {
                            return undefined;
                        }
                    }
                    return resource;
                }))));
                if (inaccessibleFileCount > 0) {
                    this.notificationService.error(inaccessibleFileCount > 1 ? (0, nls_1.localize)('filesInaccessible', "Some or all of the dropped files could not be accessed for import.") : (0, nls_1.localize)('fileInaccessible', "The dropped file could not be accessed for import."));
                }
                // Copy resources through bulk edit API
                const resourceFileEdits = resourcesFiltered.map(resource => {
                    const sourceFileName = (0, resources_1.basename)(resource);
                    const targetFile = (0, resources_1.joinPath)(target.resource, sourceFileName);
                    return new bulkEditService_1.ResourceFileEdit(resource, targetFile, { overwrite: true, copy: true });
                });
                const undoLevel = this.configurationService.getValue().explorer.confirmUndo;
                await this.explorerService.applyBulkEdit(resourceFileEdits, {
                    undoLabel: resourcesFiltered.length === 1 ?
                        (0, nls_1.localize)({ comment: ['substitution will be the name of the file that was imported'], key: 'importFile' }, "Import {0}", (0, resources_1.basename)(resourcesFiltered[0])) :
                        (0, nls_1.localize)({ comment: ['substitution will be the number of files that were imported'], key: 'importnFile' }, "Import {0} resources", resourcesFiltered.length),
                    progressLabel: resourcesFiltered.length === 1 ?
                        (0, nls_1.localize)({ comment: ['substitution will be the name of the file that was copied'], key: 'copyingFile' }, "Copying {0}", (0, resources_1.basename)(resourcesFiltered[0])) :
                        (0, nls_1.localize)({ comment: ['substitution will be the number of files that were copied'], key: 'copyingnFile' }, "Copying {0} resources", resourcesFiltered.length),
                    progressLocation: 10 /* ProgressLocation.Window */,
                    confirmBeforeUndo: undoLevel === "verbose" /* UndoConfirmLevel.Verbose */ || undoLevel === "default" /* UndoConfirmLevel.Default */,
                });
                // if we only add one file, just open it directly
                if (resourceFileEdits.length === 1) {
                    const item = this.explorerService.findClosest(resourceFileEdits[0].newResource);
                    if (item && !item.isDirectory) {
                        this.editorService.openEditor({ resource: item.resource, options: { pinned: true } });
                    }
                }
            }
        }
    };
    exports.ExternalFileImport = ExternalFileImport;
    exports.ExternalFileImport = ExternalFileImport = __decorate([
        __param(0, files_1.IFileService),
        __param(1, host_1.IHostService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, dialogs_1.IDialogService),
        __param(5, workspaceEditing_1.IWorkspaceEditingService),
        __param(6, files_2.IExplorerService),
        __param(7, editorService_1.IEditorService),
        __param(8, progress_1.IProgressService),
        __param(9, notification_1.INotificationService),
        __param(10, instantiation_1.IInstantiationService)
    ], ExternalFileImport);
    let FileDownload = class FileDownload {
        static { FileDownload_1 = this; }
        static { this.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY = 'workbench.explorer.downloadPath'; }
        constructor(fileService, explorerService, progressService, logService, fileDialogService, storageService) {
            this.fileService = fileService;
            this.explorerService = explorerService;
            this.progressService = progressService;
            this.logService = logService;
            this.fileDialogService = fileDialogService;
            this.storageService = storageService;
        }
        download(source) {
            const cts = new cancellation_1.CancellationTokenSource();
            // Indicate progress globally
            const downloadPromise = this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                delay: 800,
                cancellable: platform_1.isWeb,
                title: (0, nls_1.localize)('downloadingFiles', "Downloading")
            }, async (progress) => this.doDownload(source, progress, cts), () => cts.dispose(true));
            // Also indicate progress in the files view
            this.progressService.withProgress({ location: files_3.VIEW_ID, delay: 500 }, () => downloadPromise);
            return downloadPromise;
        }
        async doDownload(sources, progress, cts) {
            for (const source of sources) {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Web: use DOM APIs to download files with optional support
                // for folders and large files
                if (platform_1.isWeb) {
                    await this.doDownloadBrowser(source.resource, progress, cts);
                }
                // Native: use working copy file service to get at the contents
                else {
                    await this.doDownloadNative(source, progress, cts);
                }
            }
        }
        async doDownloadBrowser(resource, progress, cts) {
            const stat = await this.fileService.resolve(resource, { resolveMetadata: true });
            if (cts.token.isCancellationRequested) {
                return;
            }
            const maxBlobDownloadSize = 32 * files_1.ByteSize.MB; // avoid to download via blob-trick >32MB to avoid memory pressure
            const preferFileSystemAccessWebApis = stat.isDirectory || stat.size > maxBlobDownloadSize;
            // Folder: use FS APIs to download files and folders if available and preferred
            const activeWindow = (0, dom_1.getActiveWindow)();
            if (preferFileSystemAccessWebApis && webFileSystemAccess_1.WebFileSystemAccess.supported(activeWindow)) {
                try {
                    const parentFolder = await activeWindow.showDirectoryPicker();
                    const operation = {
                        startTime: Date.now(),
                        progressScheduler: new async_1.RunOnceWorker(steps => { progress.report(steps[steps.length - 1]); }, 1000),
                        filesTotal: stat.isDirectory ? 0 : 1, // folders increment filesTotal within downloadFolder method
                        filesDownloaded: 0,
                        totalBytesDownloaded: 0,
                        fileBytesDownloaded: 0
                    };
                    if (stat.isDirectory) {
                        const targetFolder = await parentFolder.getDirectoryHandle(stat.name, { create: true });
                        await this.downloadFolderBrowser(stat, targetFolder, operation, cts.token);
                    }
                    else {
                        await this.downloadFileBrowser(parentFolder, stat, operation, cts.token);
                    }
                    operation.progressScheduler.dispose();
                }
                catch (error) {
                    this.logService.warn(error);
                    cts.cancel(); // `showDirectoryPicker` will throw an error when the user cancels
                }
            }
            // File: use traditional download to circumvent browser limitations
            else if (stat.isFile) {
                let bufferOrUri;
                try {
                    bufferOrUri = (await this.fileService.readFile(stat.resource, { limits: { size: maxBlobDownloadSize } }, cts.token)).value.buffer;
                }
                catch (error) {
                    bufferOrUri = network_1.FileAccess.uriToBrowserUri(stat.resource);
                }
                if (!cts.token.isCancellationRequested) {
                    (0, dom_1.triggerDownload)(bufferOrUri, stat.name);
                }
            }
        }
        async downloadFileBufferedBrowser(resource, target, operation, token) {
            const contents = await this.fileService.readFileStream(resource, undefined, token);
            if (token.isCancellationRequested) {
                target.close();
                return;
            }
            return new Promise((resolve, reject) => {
                const sourceStream = contents.value;
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add((0, lifecycle_1.toDisposable)(() => target.close()));
                disposables.add((0, functional_1.createSingleCallFunction)(token.onCancellationRequested)(() => {
                    disposables.dispose();
                    reject((0, errors_1.canceled)());
                }));
                (0, stream_1.listenStream)(sourceStream, {
                    onData: data => {
                        target.write(data.buffer);
                        this.reportProgress(contents.name, contents.size, data.byteLength, operation);
                    },
                    onError: error => {
                        disposables.dispose();
                        reject(error);
                    },
                    onEnd: () => {
                        disposables.dispose();
                        resolve();
                    }
                }, token);
            });
        }
        async downloadFileUnbufferedBrowser(resource, target, operation, token) {
            const contents = await this.fileService.readFile(resource, undefined, token);
            if (!token.isCancellationRequested) {
                target.write(contents.value.buffer);
                this.reportProgress(contents.name, contents.size, contents.value.byteLength, operation);
            }
            target.close();
        }
        async downloadFileBrowser(targetFolder, file, operation, token) {
            // Report progress
            operation.filesDownloaded++;
            operation.fileBytesDownloaded = 0; // reset for this file
            this.reportProgress(file.name, 0, 0, operation);
            // Start to download
            const targetFile = await targetFolder.getFileHandle(file.name, { create: true });
            const targetFileWriter = await targetFile.createWritable();
            // For large files, write buffered using streams
            if (file.size > files_1.ByteSize.MB) {
                return this.downloadFileBufferedBrowser(file.resource, targetFileWriter, operation, token);
            }
            // For small files prefer to write unbuffered to reduce overhead
            return this.downloadFileUnbufferedBrowser(file.resource, targetFileWriter, operation, token);
        }
        async downloadFolderBrowser(folder, targetFolder, operation, token) {
            if (folder.children) {
                operation.filesTotal += (folder.children.map(child => child.isFile)).length;
                for (const child of folder.children) {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    if (child.isFile) {
                        await this.downloadFileBrowser(targetFolder, child, operation, token);
                    }
                    else {
                        const childFolder = await targetFolder.getDirectoryHandle(child.name, { create: true });
                        const resolvedChildFolder = await this.fileService.resolve(child.resource, { resolveMetadata: true });
                        await this.downloadFolderBrowser(resolvedChildFolder, childFolder, operation, token);
                    }
                }
            }
        }
        reportProgress(name, fileSize, bytesDownloaded, operation) {
            operation.fileBytesDownloaded += bytesDownloaded;
            operation.totalBytesDownloaded += bytesDownloaded;
            const bytesDownloadedPerSecond = operation.totalBytesDownloaded / ((Date.now() - operation.startTime) / 1000);
            // Small file
            let message;
            if (fileSize < files_1.ByteSize.MB) {
                if (operation.filesTotal === 1) {
                    message = name;
                }
                else {
                    message = (0, nls_1.localize)('downloadProgressSmallMany', "{0} of {1} files ({2}/s)", operation.filesDownloaded, operation.filesTotal, files_1.ByteSize.formatSize(bytesDownloadedPerSecond));
                }
            }
            // Large file
            else {
                message = (0, nls_1.localize)('downloadProgressLarge', "{0} ({1} of {2}, {3}/s)", name, files_1.ByteSize.formatSize(operation.fileBytesDownloaded), files_1.ByteSize.formatSize(fileSize), files_1.ByteSize.formatSize(bytesDownloadedPerSecond));
            }
            // Report progress but limit to update only once per second
            operation.progressScheduler.work({ message });
        }
        async doDownloadNative(explorerItem, progress, cts) {
            progress.report({ message: explorerItem.name });
            let defaultUri;
            const lastUsedDownloadPath = this.storageService.get(FileDownload_1.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
            if (lastUsedDownloadPath) {
                defaultUri = (0, resources_1.joinPath)(uri_1.URI.file(lastUsedDownloadPath), explorerItem.name);
            }
            else {
                defaultUri = (0, resources_1.joinPath)(explorerItem.isDirectory ?
                    await this.fileDialogService.defaultFolderPath(network_1.Schemas.file) :
                    await this.fileDialogService.defaultFilePath(network_1.Schemas.file), explorerItem.name);
            }
            const destination = await this.fileDialogService.showSaveDialog({
                availableFileSystems: [network_1.Schemas.file],
                saveLabel: (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)('downloadButton', "Download")),
                title: (0, nls_1.localize)('chooseWhereToDownload', "Choose Where to Download"),
                defaultUri
            });
            if (destination) {
                // Remember as last used download folder
                this.storageService.store(FileDownload_1.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY, (0, resources_1.dirname)(destination).fsPath, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                // Perform download
                await this.explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit(explorerItem.resource, destination, { overwrite: true, copy: true })], {
                    undoLabel: (0, nls_1.localize)('downloadBulkEdit', "Download {0}", explorerItem.name),
                    progressLabel: (0, nls_1.localize)('downloadingBulkEdit', "Downloading {0}", explorerItem.name),
                    progressLocation: 10 /* ProgressLocation.Window */
                });
            }
            else {
                cts.cancel(); // User canceled a download. In case there were multiple files selected we should cancel the remainder of the prompts #86100
            }
        }
    };
    exports.FileDownload = FileDownload;
    exports.FileDownload = FileDownload = FileDownload_1 = __decorate([
        __param(0, files_1.IFileService),
        __param(1, files_2.IExplorerService),
        __param(2, progress_1.IProgressService),
        __param(3, log_1.ILogService),
        __param(4, dialogs_1.IFileDialogService),
        __param(5, storage_1.IStorageService)
    ], FileDownload);
    //#endregion
    //#region Helpers
    function getFileOverwriteConfirm(name) {
        return {
            message: (0, nls_1.localize)('confirmOverwrite', "A file or folder with the name '{0}' already exists in the destination folder. Do you want to replace it?", name),
            detail: (0, nls_1.localize)('irreversible', "This action is irreversible!"),
            primaryButton: (0, nls_1.localize)({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
            type: 'warning'
        };
    }
    exports.getFileOverwriteConfirm = getFileOverwriteConfirm;
    function getMultipleFilesOverwriteConfirm(files) {
        if (files.length > 1) {
            return {
                message: (0, nls_1.localize)('confirmManyOverwrites', "The following {0} files and/or folders already exist in the destination folder. Do you want to replace them?", files.length),
                detail: (0, dialogs_1.getFileNamesMessage)(files) + '\n' + (0, nls_1.localize)('irreversible', "This action is irreversible!"),
                primaryButton: (0, nls_1.localize)({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
                type: 'warning'
            };
        }
        return getFileOverwriteConfirm((0, resources_1.basename)(files[0]));
    }
    exports.getMultipleFilesOverwriteConfirm = getMultipleFilesOverwriteConfirm;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUltcG9ydEV4cG9ydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci9maWxlSW1wb3J0RXhwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFxRXpGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWlCOztpQkFFTCx5QkFBb0IsR0FBRyxFQUFFLEFBQUwsQ0FBTTtRQUVsRCxZQUNvQyxlQUFpQyxFQUNuQyxhQUE2QixFQUMzQixlQUFpQyxFQUNuQyxhQUE2QixFQUMvQixXQUF5QjtZQUpyQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDbkMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzNCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNuQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDL0IsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUFFekQsQ0FBQztRQUVELE1BQU0sQ0FBQyxNQUFvQixFQUFFLE1BQTRCO1lBQ3hELE1BQU0sR0FBRyxHQUFHLElBQUksc0NBQXVCLEVBQUUsQ0FBQztZQUUxQyw2QkFBNkI7WUFDN0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQ3REO2dCQUNDLFFBQVEsa0NBQXlCO2dCQUNqQyxLQUFLLEVBQUUsR0FBRztnQkFDVixXQUFXLEVBQUUsSUFBSTtnQkFDakIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQzthQUM5QyxFQUNELEtBQUssRUFBQyxRQUFRLEVBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFD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