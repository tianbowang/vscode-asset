/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dnd", "vs/base/browser/window", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/map", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/files/browser/htmlFileSystemProvider", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/registry/common/platform"], function (require, exports, dnd_1, window_1, arrays_1, async_1, buffer_1, map_1, marshalling_1, network_1, platform_1, uri_1, nls_1, dialogs_1, htmlFileSystemProvider_1, webFileSystemAccess_1, files_1, instantiation_1, opener_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalSelectionTransfer = exports.Extensions = exports.containsDragType = exports.extractFileListData = exports.createDraggedEditorInputFromRawResourcesData = exports.extractEditorsAndFilesDropData = exports.extractEditorsDropData = exports.CodeDataTransfers = void 0;
    //#region Editor / Resources DND
    exports.CodeDataTransfers = {
        EDITORS: 'CodeEditors',
        FILES: 'CodeFiles'
    };
    function extractEditorsDropData(e) {
        const editors = [];
        if (e.dataTransfer && e.dataTransfer.types.length > 0) {
            // Data Transfer: Code Editors
            const rawEditorsData = e.dataTransfer.getData(exports.CodeDataTransfers.EDITORS);
            if (rawEditorsData) {
                try {
                    editors.push(...(0, marshalling_1.parse)(rawEditorsData));
                }
                catch (error) {
                    // Invalid transfer
                }
            }
            // Data Transfer: Resources
            else {
                try {
                    const rawResourcesData = e.dataTransfer.getData(dnd_1.DataTransfers.RESOURCES);
                    editors.push(...createDraggedEditorInputFromRawResourcesData(rawResourcesData));
                }
                catch (error) {
                    // Invalid transfer
                }
            }
            // Check for native file transfer
            if (e.dataTransfer?.files) {
                for (let i = 0; i < e.dataTransfer.files.length; i++) {
                    const file = e.dataTransfer.files[i];
                    if (file && file.path /* Electron only */) {
                        try {
                            editors.push({ resource: uri_1.URI.file(file.path), isExternal: true, allowWorkspaceOpen: true });
                        }
                        catch (error) {
                            // Invalid URI
                        }
                    }
                }
            }
            // Check for CodeFiles transfer
            const rawCodeFiles = e.dataTransfer.getData(exports.CodeDataTransfers.FILES);
            if (rawCodeFiles) {
                try {
                    const codeFiles = JSON.parse(rawCodeFiles);
                    for (const codeFile of codeFiles) {
                        editors.push({ resource: uri_1.URI.file(codeFile), isExternal: true, allowWorkspaceOpen: true });
                    }
                }
                catch (error) {
                    // Invalid transfer
                }
            }
            // Workbench contributions
            const contributions = platform_2.Registry.as(exports.Extensions.DragAndDropContribution).getAll();
            for (const contribution of contributions) {
                const data = e.dataTransfer.getData(contribution.dataFormatKey);
                if (data) {
                    try {
                        editors.push(...contribution.getEditorInputs(data));
                    }
                    catch (error) {
                        // Invalid transfer
                    }
                }
            }
        }
        // Prevent duplicates: it is possible that we end up with the same
        // dragged editor multiple times because multiple data transfers
        // are being used (https://github.com/microsoft/vscode/issues/128925)
        const coalescedEditors = [];
        const seen = new map_1.ResourceMap();
        for (const editor of editors) {
            if (!editor.resource) {
                coalescedEditors.push(editor);
            }
            else if (!seen.has(editor.resource)) {
                coalescedEditors.push(editor);
                seen.set(editor.resource, true);
            }
        }
        return coalescedEditors;
    }
    exports.extractEditorsDropData = extractEditorsDropData;
    async function extractEditorsAndFilesDropData(accessor, e) {
        const editors = extractEditorsDropData(e);
        // Web: Check for file transfer
        if (e.dataTransfer && platform_1.isWeb && containsDragType(e, dnd_1.DataTransfers.FILES)) {
            const files = e.dataTransfer.items;
            if (files) {
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                const filesData = await instantiationService.invokeFunction(accessor => extractFilesDropData(accessor, e));
                for (const fileData of filesData) {
                    editors.push({ resource: fileData.resource, contents: fileData.contents?.toString(), isExternal: true, allowWorkspaceOpen: fileData.isDirectory });
                }
            }
        }
        return editors;
    }
    exports.extractEditorsAndFilesDropData = extractEditorsAndFilesDropData;
    function createDraggedEditorInputFromRawResourcesData(rawResourcesData) {
        const editors = [];
        if (rawResourcesData) {
            const resourcesRaw = JSON.parse(rawResourcesData);
            for (const resourceRaw of resourcesRaw) {
                if (resourceRaw.indexOf(':') > 0) { // mitigate https://github.com/microsoft/vscode/issues/124946
                    const { selection, uri } = (0, opener_1.extractSelection)(uri_1.URI.parse(resourceRaw));
                    editors.push({ resource: uri, options: { selection } });
                }
            }
        }
        return editors;
    }
    exports.createDraggedEditorInputFromRawResourcesData = createDraggedEditorInputFromRawResourcesData;
    async function extractFilesDropData(accessor, event) {
        // Try to extract via `FileSystemHandle`
        if (webFileSystemAccess_1.WebFileSystemAccess.supported(window_1.mainWindow)) {
            const items = event.dataTransfer?.items;
            if (items) {
                return extractFileTransferData(accessor, items);
            }
        }
        // Try to extract via `FileList`
        const files = event.dataTransfer?.files;
        if (!files) {
            return [];
        }
        return extractFileListData(accessor, files);
    }
    async function extractFileTransferData(accessor, items) {
        const fileSystemProvider = accessor.get(files_1.IFileService).getProvider(network_1.Schemas.file);
        if (!(fileSystemProvider instanceof htmlFileSystemProvider_1.HTMLFileSystemProvider)) {
            return []; // only supported when running in web
        }
        const results = [];
        for (let i = 0; i < items.length; i++) {
            const file = items[i];
            if (file) {
                const result = new async_1.DeferredPromise();
                results.push(result);
                (async () => {
                    try {
                        const handle = await file.getAsFileSystemHandle();
                        if (!handle) {
                            result.complete(undefined);
                            return;
                        }
                        if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(handle)) {
                            result.complete({
                                resource: await fileSystemProvider.registerFileHandle(handle),
                                isDirectory: false
                            });
                        }
                        else if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
                            result.complete({
                                resource: await fileSystemProvider.registerDirectoryHandle(handle),
                                isDirectory: true
                            });
                        }
                        else {
                            result.complete(undefined);
                        }
                    }
                    catch (error) {
                        result.complete(undefined);
                    }
                })();
            }
        }
        return (0, arrays_1.coalesce)(await Promise.all(results.map(result => result.p)));
    }
    async function extractFileListData(accessor, files) {
        const dialogService = accessor.get(dialogs_1.IDialogService);
        const results = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (file) {
                // Skip for very large files because this operation is unbuffered
                if (file.size > 100 * files_1.ByteSize.MB) {
                    dialogService.warn((0, nls_1.localize)('fileTooLarge', "File is too large to open as untitled editor. Please upload it first into the file explorer and then try again."));
                    continue;
                }
                const result = new async_1.DeferredPromise();
                results.push(result);
                const reader = new FileReader();
                reader.onerror = () => result.complete(undefined);
                reader.onabort = () => result.complete(undefined);
                reader.onload = async (event) => {
                    const name = file.name;
                    const loadResult = event.target?.result ?? undefined;
                    if (typeof name !== 'string' || typeof loadResult === 'undefined') {
                        result.complete(undefined);
                        return;
                    }
                    result.complete({
                        resource: uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: name }),
                        contents: typeof loadResult === 'string' ? buffer_1.VSBuffer.fromString(loadResult) : buffer_1.VSBuffer.wrap(new Uint8Array(loadResult))
                    });
                };
                // Start reading
                reader.readAsArrayBuffer(file);
            }
        }
        return (0, arrays_1.coalesce)(await Promise.all(results.map(result => result.p)));
    }
    exports.extractFileListData = extractFileListData;
    //#endregion
    function containsDragType(event, ...dragTypesToFind) {
        if (!event.dataTransfer) {
            return false;
        }
        const dragTypes = event.dataTransfer.types;
        const lowercaseDragTypes = [];
        for (let i = 0; i < dragTypes.length; i++) {
            lowercaseDragTypes.push(dragTypes[i].toLowerCase()); // somehow the types are lowercase
        }
        for (const dragType of dragTypesToFind) {
            if (lowercaseDragTypes.indexOf(dragType.toLowerCase()) >= 0) {
                return true;
            }
        }
        return false;
    }
    exports.containsDragType = containsDragType;
    class DragAndDropContributionRegistry {
        constructor() {
            this._contributions = new Map();
        }
        register(contribution) {
            if (this._contributions.has(contribution.dataFormatKey)) {
                throw new Error(`A drag and drop contributiont with key '${contribution.dataFormatKey}' was already registered.`);
            }
            this._contributions.set(contribution.dataFormatKey, contribution);
        }
        getAll() {
            return this._contributions.values();
        }
    }
    exports.Extensions = {
        DragAndDropContribution: 'workbench.contributions.dragAndDrop'
    };
    platform_2.Registry.add(exports.Extensions.DragAndDropContribution, new DragAndDropContributionRegistry());
    //#endregion
    //#region DND Utilities
    /**
     * A singleton to store transfer data during drag & drop operations that are only valid within the application.
     */
    class LocalSelectionTransfer {
        static { this.INSTANCE = new LocalSelectionTransfer(); }
        constructor() {
            // protect against external instantiation
        }
        static getInstance() {
            return LocalSelectionTransfer.INSTANCE;
        }
        hasData(proto) {
            return proto && proto === this.proto;
        }
        clearData(proto) {
            if (this.hasData(proto)) {
                this.proto = undefined;
                this.data = undefined;
            }
        }
        getData(proto) {
            if (this.hasData(proto)) {
                return this.data;
            }
            return undefined;
        }
        setData(data, proto) {
            if (proto) {
                this.data = data;
                this.proto = proto;
            }
        }
    }
    exports.LocalSelectionTransfer = LocalSelectionTransfer;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9kbmQvYnJvd3Nlci9kbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBK0JoRyxnQ0FBZ0M7SUFFbkIsUUFBQSxpQkFBaUIsR0FBRztRQUNoQyxPQUFPLEVBQUUsYUFBYTtRQUN0QixLQUFLLEVBQUUsV0FBVztLQUNsQixDQUFDO0lBbUJGLFNBQWdCLHNCQUFzQixDQUFDLENBQVk7UUFDbEQsTUFBTSxPQUFPLEdBQWtDLEVBQUUsQ0FBQztRQUNsRCxJQUFJLENBQUMsQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBRXZELDhCQUE4QjtZQUM5QixNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyx5QkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6RSxJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUNwQixJQUFJLENBQUM7b0JBQ0osT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUEsbUJBQUssRUFBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxDQUFDO2dCQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7b0JBQ2hCLG1CQUFtQjtnQkFDcEIsQ0FBQztZQUNGLENBQUM7WUFFRCwyQkFBMkI7aUJBQ3RCLENBQUM7Z0JBQ0wsSUFBSSxDQUFDO29CQUNKLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsbUJBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDekUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLDRDQUE0QyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFDakYsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFB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