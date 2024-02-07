"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerResourceDropOrPasteSupport = void 0;
const vscode = require("vscode");
const arrays_1 = require("../../util/arrays");
const document_1 = require("../../util/document");
const mimes_1 = require("../../util/mimes");
const schemes_1 = require("../../util/schemes");
const newFilePathGenerator_1 = require("./newFilePathGenerator");
const shared_1 = require("./shared");
/**
 * Provides support for pasting or dropping resources into markdown documents.
 *
 * This includes:
 *
 * - `text/uri-list` data in the data transfer.
 * - File object in the data transfer.
 * - Media data in the data transfer, such as `image/png`.
 */
class ResourcePasteOrDropProvider {
    constructor() {
        this._yieldTo = [
            { mimeType: 'text/plain' },
            { extensionId: 'vscode.ipynb', providerId: 'insertAttachment' },
        ];
    }
    async provideDocumentDropEdits(document, position, dataTransfer, token) {
        const enabled = vscode.workspace.getConfiguration('markdown', document).get('editor.drop.enabled', true);
        if (!enabled) {
            return;
        }
        const filesEdit = await this._getMediaFilesDropEdit(document, dataTransfer, token);
        if (filesEdit) {
            return filesEdit;
        }
        if (token.isCancellationRequested) {
            return;
        }
        return this._createEditFromUriListData(document, [new vscode.Range(position, position)], dataTransfer, token);
    }
    async provideDocumentPasteEdits(document, ranges, dataTransfer, token) {
        const enabled = vscode.workspace.getConfiguration('markdown', document).get('editor.filePaste.enabled', true);
        if (!enabled) {
            return;
        }
        const createEdit = await this._getMediaFilesPasteEdit(document, dataTransfer, token);
        if (createEdit) {
            return createEdit;
        }
        if (token.isCancellationRequested) {
            return;
        }
        return this._createEditFromUriListData(document, ranges, dataTransfer, token);
    }
    async _createEditFromUriListData(document, ranges, dataTransfer, token) {
        const uriList = await dataTransfer.get(mimes_1.Mime.textUriList)?.asString();
        if (!uriList || token.isCancellationRequested) {
            return;
        }
        const pasteEdit = (0, shared_1.createInsertUriListEdit)(document, ranges, uriList);
        if (!pasteEdit) {
            return;
        }
        const uriEdit = new vscode.DocumentPasteEdit('', pasteEdit.label);
        const edit = new vscode.WorkspaceEdit();
        edit.set(document.uri, pasteEdit.edits);
        uriEdit.additionalEdit = edit;
        uriEdit.yieldTo = this._yieldTo;
        return uriEdit;
    }
    async _getMediaFilesPasteEdit(document, dataTransfer, token) {
        if ((0, document_1.getParentDocumentUri)(document.uri).scheme === schemes_1.Schemes.untitled) {
            return;
        }
        const copyFilesIntoWorkspace = vscode.workspace.getConfiguration('markdown', document).get('editor.filePaste.copyIntoWorkspace', 'mediaFiles');
        if (copyFilesIntoWorkspace !== 'mediaFiles') {
            return;
        }
        const edit = await this._createEditForMediaFiles(document, dataTransfer, token);
        if (!edit) {
            return;
        }
        const pasteEdit = new vscode.DocumentPasteEdit(edit.snippet, edit.label);
        pasteEdit.additionalEdit = edit.additionalEdits;
        pasteEdit.yieldTo = this._yieldTo;
        return pasteEdit;
    }
    async _getMediaFilesDropEdit(document, dataTransfer, token) {
        if ((0, document_1.getParentDocumentUri)(document.uri).scheme === schemes_1.Schemes.untitled) {
            return;
        }
        const copyIntoWorkspace = vscode.workspace.getConfiguration('markdown', document).get('editor.drop.copyIntoWorkspace', 'mediaFiles');
        if (copyIntoWorkspace !== 'mediaFiles') {
            return;
        }
        const edit = await this._createEditForMediaFiles(document, dataTransfer, token);
        if (!edit) {
            return;
        }
        const dropEdit = new vscode.DocumentDropEdit(edit.snippet);
        dropEdit.label = edit.label;
        dropEdit.additionalEdit = edit.additionalEdits;
        dropEdit.yieldTo = this._yieldTo;
        return dropEdit;
    }
    /**
     * Create a new edit for media files in a data transfer.
     *
     * This tries copying files outside of the workspace into the workspace.
     */
    async _createEditForMediaFiles(document, dataTransfer, token) {
        const pathGenerator = new newFilePathGenerator_1.NewFilePathGenerator();
        const fileEntries = (0, arrays_1.coalesce)(await Promise.all(Array.from(dataTransfer, async ([mime, item]) => {
            if (!mimes_1.mediaMimes.has(mime)) {
                return;
            }
            const file = item?.asFile();
            if (!file) {
                return;
            }
            if (file.uri) {
                // If the file is already in a workspace, we don't want to create a copy of it
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(file.uri);
                if (workspaceFolder) {
                    return { uri: file.uri };
                }
            }
            const newFile = await pathGenerator.getNewFilePath(document, file, token);
            if (!newFile) {
                return;
            }
            return { uri: newFile.uri, newFile: { contents: file, overwrite: newFile.overwrite } };
        })));
        if (!fileEntries.length) {
            return;
        }
        const workspaceEdit = new vscode.WorkspaceEdit();
        for (const entry of fileEntries) {
            if (entry.newFile) {
                workspaceEdit.createFile(entry.uri, {
                    contents: entry.newFile.contents,
                    overwrite: entry.newFile.overwrite,
                });
            }
        }
        const snippet = (0, shared_1.createUriListSnippet)(document.uri, fileEntries);
        if (!snippet) {
            return;
        }
        return {
            snippet: snippet.snippet,
            label: (0, shared_1.getSnippetLabel)(snippet),
            additionalEdits: workspaceEdit,
        };
    }
}
ResourcePasteOrDropProvider.id = 'insertResource';
ResourcePasteOrDropProvider.mimeTypes = [
    mimes_1.Mime.textUriList,
    'files',
    ...mimes_1.mediaMimes,
];
function registerResourceDropOrPasteSupport(selector) {
    return vscode.Disposable.from(vscode.languages.registerDocumentPasteEditProvider(selector, new ResourcePasteOrDropProvider(), {
        id: ResourcePasteOrDropProvider.id,
        pasteMimeTypes: ResourcePasteOrDropProvider.mimeTypes,
    }), vscode.languages.registerDocumentDropEditProvider(selector, new ResourcePasteOrDropProvider(), {
        id: ResourcePasteOrDropProvider.id,
        dropMimeTypes: ResourcePasteOrDropProvider.mimeTypes,
    }));
}
exports.registerResourceDropOrPasteSupport = registerResourceDropOrPasteSupport;
//# sourceMappingURL=dropOrPasteResource.js.map