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
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/workbench/contrib/files/common/files", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/platform/quickinput/common/quickInput", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/host/browser/host", "vs/workbench/contrib/files/browser/fileConstants", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/clipboard/common/clipboardService", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/base/common/network", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/arrays", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/errors", "vs/base/browser/dom", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/async", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/services/views/common/viewsService", "vs/base/common/strings", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/browser/fileImportExport", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/path/common/pathService", "vs/platform/actions/common/actions", "vs/workbench/common/contextkeys", "vs/base/common/keyCodes", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls, platform_1, path_1, resources, uri_1, errorMessage_1, actions_1, lifecycle_1, files_1, files_2, editor_1, quickInput_1, instantiation_1, host_1, fileConstants_1, resolverService_1, configuration_1, clipboardService_1, language_1, model_1, commands_1, contextkey_1, network_1, dialogs_1, notification_1, editorService_1, editorCommands_1, arrays_1, explorerModel_1, errors_1, dom_1, filesConfigurationService_1, workingCopyService_1, async_1, workingCopyFileService_1, codicons_1, themables_1, viewsService_1, strings_1, uriIdentity_1, bulkEditService_1, files_3, fileImportExport_1, panecomposite_1, remoteAgentService_1, pathService_1, actions_2, contextkeys_1, keyCodes_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResetActiveEditorReadonlyInSession = exports.ToggleActiveEditorReadonlyInSession = exports.SetActiveEditorWriteableInSession = exports.SetActiveEditorReadonlyInSession = exports.openFilePreserveFocusHandler = exports.pasteFileHandler = exports.cutFileHandler = exports.copyFileHandler = exports.deleteFileHandler = exports.moveFileToTrashHandler = exports.renameHandler = exports.CompareWithClipboardAction = exports.CompareNewUntitledTextFilesAction = exports.validateFileName = exports.OpenActiveFileInEmptyWorkspace = exports.ShowActiveFileInExplorer = exports.FocusFilesExplorer = exports.CloseGroupAction = exports.SaveAllInGroupAction = exports.ToggleAutoSaveAction = exports.GlobalCompareResourcesAction = exports.incrementFileName = exports.findValidPasteFileTarget = exports.UPLOAD_LABEL = exports.UPLOAD_COMMAND_ID = exports.DOWNLOAD_LABEL = exports.DOWNLOAD_COMMAND_ID = exports.FileCopiedContext = exports.PASTE_FILE_LABEL = exports.COPY_FILE_LABEL = exports.MOVE_FILE_TO_TRASH_LABEL = exports.TRIGGER_RENAME_LABEL = exports.NEW_FOLDER_LABEL = exports.NEW_FOLDER_COMMAND_ID = exports.NEW_FILE_LABEL = exports.NEW_FILE_COMMAND_ID = void 0;
    exports.NEW_FILE_COMMAND_ID = 'explorer.newFile';
    exports.NEW_FILE_LABEL = nls.localize('newFile', "New File...");
    exports.NEW_FOLDER_COMMAND_ID = 'explorer.newFolder';
    exports.NEW_FOLDER_LABEL = nls.localize('newFolder', "New Folder...");
    exports.TRIGGER_RENAME_LABEL = nls.localize('rename', "Rename...");
    exports.MOVE_FILE_TO_TRASH_LABEL = nls.localize('delete', "Delete");
    exports.COPY_FILE_LABEL = nls.localize('copyFile', "Copy");
    exports.PASTE_FILE_LABEL = nls.localize('pasteFile', "Paste");
    exports.FileCopiedContext = new contextkey_1.RawContextKey('fileCopied', false);
    exports.DOWNLOAD_COMMAND_ID = 'explorer.download';
    exports.DOWNLOAD_LABEL = nls.localize('download', "Download...");
    exports.UPLOAD_COMMAND_ID = 'explorer.upload';
    exports.UPLOAD_LABEL = nls.localize('upload', "Upload...");
    const CONFIRM_DELETE_SETTING_KEY = 'explorer.confirmDelete';
    const MAX_UNDO_FILE_SIZE = 5000000; // 5mb
    function onError(notificationService, error) {
        if (error.message === 'string') {
            error = error.message;
        }
        notificationService.error((0, errorMessage_1.toErrorMessage)(error, false));
    }
    async function refreshIfSeparator(value, explorerService) {
        if (value && ((value.indexOf('/') >= 0) || (value.indexOf('\\') >= 0))) {
            // New input contains separator, multiple resources will get created workaround for #68204
            await explorerService.refresh();
        }
    }
    async function deleteFiles(explorerService, workingCopyFileService, dialogService, configurationService, elements, useTrash, skipConfirm = false, ignoreIfNotExists = false) {
        let primaryButton;
        if (useTrash) {
            primaryButton = platform_1.isWindows ? nls.localize('deleteButtonLabelRecycleBin', "&&Move to Recycle Bin") : nls.localize({ key: 'deleteButtonLabelTrash', comment: ['&& denotes a mnemonic'] }, "&&Move to Trash");
        }
        else {
            primaryButton = nls.localize({ key: 'deleteButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Delete");
        }
        // Handle dirty
        const distinctElements = resources.distinctParents(elements, e => e.resource);
        const dirtyWorkingCopies = new Set();
        for (const distinctElement of distinctElements) {
            for (const dirtyWorkingCopy of workingCopyFileService.getDirty(distinctElement.resource)) {
                dirtyWorkingCopies.add(dirtyWorkingCopy);
            }
        }
        let confirmed = true;
        if (dirtyWorkingCopies.size) {
            let message;
            if (distinctElements.length > 1) {
                message = nls.localize('dirtyMessageFilesDelete', "You are deleting files with unsaved changes. Do you want to continue?");
            }
            else if (distinctElements[0].isDirectory) {
                if (dirtyWorkingCopies.size === 1) {
                    message = nls.localize('dirtyMessageFolderOneDelete', "You are deleting a folder {0} with unsaved changes in 1 file. Do you want to continue?", distinctElements[0].name);
                }
                else {
                    message = nls.localize('dirtyMessageFolderDelete', "You are deleting a folder {0} with unsaved changes in {1} files. Do you want to continue?", distinctElements[0].name, dirtyWorkingCopies.size);
                }
            }
            else {
                message = nls.localize('dirtyMessageFileDelete', "You are deleting {0} with unsaved changes. Do you want to continue?", distinctElements[0].name);
            }
            const response = await dialogService.confirm({
                type: 'warning',
                message,
                detail: nls.localize('dirtyWarning', "Your changes will be lost if you don't save them."),
                primaryButton
            });
            if (!response.confirmed) {
                confirmed = false;
            }
            else {
                skipConfirm = true;
            }
        }
        // Check if file is dirty in editor and save it to avoid data loss
        if (!confirmed) {
            return;
        }
        let confirmation;
        // We do not support undo of folders, so in that case the delete action is irreversible
        const deleteDetail = distinctElements.some(e => e.isDirectory) ? nls.localize('irreversible', "This action is irreversible!") :
            distinctElements.length > 1 ? nls.localize('restorePlural', "You can restore these files using the Undo command") : nls.localize('restore', "You can restore this file using the Undo command");
        // Check if we need to ask for confirmation at all
        if (skipConfirm || (useTrash && configurationService.getValue(CONFIRM_DELETE_SETTING_KEY) === false)) {
            confirmation = { confirmed: true };
        }
        // Confirm for moving to trash
        else if (useTrash) {
            let { message, detail } = getMoveToTrashMessage(distinctElements);
            detail += detail ? '\n' : '';
            if (platform_1.isWindows) {
                detail += distinctElements.length > 1 ? nls.localize('undoBinFiles', "You can restore these files from the Recycle Bin.") : nls.localize('undoBin', "You can restore this file from the Recycle Bin.");
            }
            else {
                detail += distinctElements.length > 1 ? nls.localize('undoTrashFiles', "You can restore these files from the Trash.") : nls.localize('undoTrash', "You can restore this file from the Trash.");
            }
            confirmation = await dialogService.confirm({
                message,
                detail,
                primaryButton,
                checkbox: {
                    label: nls.localize('doNotAskAgain', "Do not ask me again")
                }
            });
        }
        // Confirm for deleting permanently
        else {
            let { message, detail } = getDeleteMessage(distinctElements);
            detail += detail ? '\n' : '';
            detail += deleteDetail;
            confirmation = await dialogService.confirm({
                type: 'warning',
                message,
                detail,
                primaryButton
            });
        }
        // Check for confirmation checkbox
        if (confirmation.confirmed && confirmation.checkboxChecked === true) {
            await configurationService.updateValue(CONFIRM_DELETE_SETTING_KEY, false);
        }
        // Check for confirmation
        if (!confirmation.confirmed) {
            return;
        }
        // Call function
        try {
            const resourceFileEdits = distinctElements.map(e => new bulkEditService_1.ResourceFileEdit(e.resource, undefined, { recursive: true, folder: e.isDirectory, ignoreIfNotExists, skipTrashBin: !useTrash, maxSize: MAX_UNDO_FILE_SIZE }));
            const options = {
                undoLabel: distinctElements.length > 1 ? nls.localize({ key: 'deleteBulkEdit', comment: ['Placeholder will be replaced by the number of files deleted'] }, "Delete {0} files", distinctElements.length) : nls.localize({ key: 'deleteFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file deleted'] }, "Delete {0}", distinctElements[0].name),
                progressLabel: distinctElements.length > 1 ? nls.localize({ key: 'deletingBulkEdit', comment: ['Placeholder will be replaced by the number of files deleted'] }, "Deleting {0} files", distinctElements.length) : nls.localize({ key: 'deletingFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file deleted'] }, "Deleting {0}", distinctElements[0].name),
            };
            await explorerService.applyBulkEdit(resourceFileEdits, options);
        }
        catch (error) {
            // Handle error to delete file(s) from a modal confirmation dialog
            let errorMessage;
            let detailMessage;
            let primaryButton;
            if (useTrash) {
                errorMessage = platform_1.isWindows ? nls.localize('binFailed', "Failed to delete using the Recycle Bin. Do you want to permanently delete instead?") : nls.localize('trashFailed', "Failed to delete using the Trash. Do you want to permanently delete instead?");
                detailMessage = deleteDetail;
                primaryButton = nls.localize({ key: 'deletePermanentlyButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Delete Permanently");
            }
            else {
                errorMessage = (0, errorMessage_1.toErrorMessage)(error, false);
                primaryButton = nls.localize({ key: 'retryButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Retry");
            }
            const res = await dialogService.confirm({
                type: 'warning',
                message: errorMessage,
                detail: detailMessage,
                primaryButton
            });
            if (res.confirmed) {
                if (useTrash) {
                    useTrash = false; // Delete Permanently
                }
                skipConfirm = true;
                ignoreIfNotExists = true;
                return deleteFiles(explorerService, workingCopyFileService, dialogService, configurationService, elements, useTrash, skipConfirm, ignoreIfNotExists);
            }
        }
    }
    function getMoveToTrashMessage(distinctElements) {
        if (containsBothDirectoryAndFile(distinctElements)) {
            return {
                message: nls.localize('confirmMoveTrashMessageFilesAndDirectories', "Are you sure you want to delete the following {0} files/directories and their contents?", distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements.length > 1) {
            if (distinctElements[0].isDirectory) {
                return {
                    message: nls.localize('confirmMoveTrashMessageMultipleDirectories', "Are you sure you want to delete the following {0} directories and their contents?", distinctElements.length),
                    detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
                };
            }
            return {
                message: nls.localize('confirmMoveTrashMessageMultiple', "Are you sure you want to delete the following {0} files?", distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements[0].isDirectory && !distinctElements[0].isSymbolicLink) {
            return { message: nls.localize('confirmMoveTrashMessageFolder', "Are you sure you want to delete '{0}' and its contents?", distinctElements[0].name), detail: '' };
        }
        return { message: nls.localize('confirmMoveTrashMessageFile', "Are you sure you want to delete '{0}'?", distinctElements[0].name), detail: '' };
    }
    function getDeleteMessage(distinctElements) {
        if (containsBothDirectoryAndFile(distinctElements)) {
            return {
                message: nls.localize('confirmDeleteMessageFilesAndDirectories', "Are you sure you want to permanently delete the following {0} files/directories and their contents?", distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements.length > 1) {
            if (distinctElements[0].isDirectory) {
                return {
                    message: nls.localize('confirmDeleteMessageMultipleDirectories', "Are you sure you want to permanently delete the following {0} directories and their contents?", distinctElements.length),
                    detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
                };
            }
            return {
                message: nls.localize('confirmDeleteMessageMultiple', "Are you sure you want to permanently delete the following {0} files?", distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements[0].isDirectory) {
            return { message: nls.localize('confirmDeleteMessageFolder', "Are you sure you want to permanently delete '{0}' and its contents?", distinctElements[0].name), detail: '' };
        }
        return { message: nls.localize('confirmDeleteMessageFile', "Are you sure you want to permanently delete '{0}'?", distinctElements[0].name), detail: '' };
    }
    function containsBothDirectoryAndFile(distinctElements) {
        const directory = distinctElements.find(element => element.isDirectory);
        const file = distinctElements.find(element => !element.isDirectory);
        return !!directory && !!file;
    }
    async function findValidPasteFileTarget(explorerService, fileService, dialogService, targetFolder, fileToPaste, incrementalNaming) {
        let name = resources.basenameOrAuthority(fileToPaste.resource);
        let candidate = resources.joinPath(targetFolder.resource, name);
        // In the disabled case we must ask if it's ok to overwrite the file if it exists
        if (incrementalNaming === 'disabled') {
            const canOverwrite = await askForOverwrite(fileService, dialogService, candidate);
            if (!canOverwrite) {
                return;
            }
        }
        while (true && !fileToPaste.allowOverwrite) {
            if (!explorerService.findClosest(candidate)) {
                break;
            }
            if (incrementalNaming !== 'disabled') {
                name = incrementFileName(name, !!fileToPaste.isDirectory, incrementalNaming);
            }
            candidate = resources.joinPath(targetFolder.resource, name);
        }
        return candidate;
    }
    exports.findValidPasteFileTarget = findValidPasteFileTarget;
    function incrementFileName(name, isFolder, incrementalNaming) {
        if (incrementalNaming === 'simple') {
            let namePrefix = name;
            let extSuffix = '';
            if (!isFolder) {
                extSuffix = (0, path_1.extname)(name);
                namePrefix = (0, path_1.basename)(name, extSuffix);
            }
            // name copy 5(.txt) => name copy 6(.txt)
            // name copy(.txt) => name copy 2(.txt)
            const suffixRegex = /^(.+ copy)( \d+)?$/;
            if (suffixRegex.test(namePrefix)) {
                return namePrefix.replace(suffixRegex, (match, g1, g2) => {
                    const number = (g2 ? parseInt(g2) : 1);
                    return number === 0
                        ? `${g1}`
                        : (number < 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */
                            ? `${g1} ${number + 1}`
                            : `${g1}${g2} copy`);
                }) + extSuffix;
            }
            // name(.txt) => name copy(.txt)
            return `${namePrefix} copy${extSuffix}`;
        }
        const separators = '[\\.\\-_]';
        const maxNumber = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
        // file.1.txt=>file.2.txt
        const suffixFileRegex = RegExp('(.*' + separators + ')(\\d+)(\\..*)$');
        if (!isFolder && name.match(suffixFileRegex)) {
            return name.replace(suffixFileRegex, (match, g1, g2, g3) => {
                const number = parseInt(g2);
                return number < maxNumber
                    ? g1 + String(number + 1).padStart(g2.length, '0') + g3
                    : `${g1}${g2}.1${g3}`;
            });
        }
        // 1.file.txt=>2.file.txt
        const prefixFileRegex = RegExp('(\\d+)(' + separators + '.*)(\\..*)$');
        if (!isFolder && name.match(prefixFileRegex)) {
            return name.replace(prefixFileRegex, (match, g1, g2, g3) => {
                const number = parseInt(g1);
                return number < maxNumber
                    ? String(number + 1).padStart(g1.length, '0') + g2 + g3
                    : `${g1}${g2}.1${g3}`;
            });
        }
        // 1.txt=>2.txt
        const prefixFileNoNameRegex = RegExp('(\\d+)(\\..*)$');
        if (!isFolder && name.match(prefixFileNoNameRegex)) {
            return name.replace(prefixFileNoNameRegex, (match, g1, g2) => {
                const number = parseInt(g1);
                return number < maxNumber
                    ? String(number + 1).padStart(g1.length, '0') + g2
                    : `${g1}.1${g2}`;
            });
        }
        // file.txt=>file.1.txt
        const lastIndexOfDot = name.lastIndexOf('.');
        if (!isFolder && lastIndexOfDot >= 0) {
            return `${name.substr(0, lastIndexOfDot)}.1${name.substr(lastIndexOfDot)}`;
        }
        // 123 => 124
        const noNameNoExtensionRegex = RegExp('(\\d+)$');
        if (!isFolder && lastIndexOfDot === -1 && name.match(noNameNoExtensionRegex)) {
            return name.replace(noNameNoExtensionRegex, (match, g1) => {
                const number = parseInt(g1);
                return number < maxNumber
                    ? String(number + 1).padStart(g1.length, '0')
                    : `${g1}.1`;
            });
        }
        // file => file1
        // file1 => file2
        const noExtensionRegex = RegExp('(.*)(\\d*)$');
        if (!isFolder && lastIndexOfDot === -1 && name.match(noExtensionRegex)) {
            return name.replace(noExtensionRegex, (match, g1, g2) => {
                let number = parseInt(g2);
                if (isNaN(number)) {
                    number = 0;
                }
                return number < maxNumber
                    ? g1 + String(number + 1).padStart(g2.length, '0')
                    : `${g1}${g2}.1`;
            });
        }
        // folder.1=>folder.2
        if (isFolder && name.match(/(\d+)$/)) {
            return name.replace(/(\d+)$/, (match, ...groups) => {
                const number = parseInt(groups[0]);
                return number < maxNumber
                    ? String(number + 1).padStart(groups[0].length, '0')
                    : `${groups[0]}.1`;
            });
        }
        // 1.folder=>2.folder
        if (isFolder && name.match(/^(\d+)/)) {
            return name.replace(/^(\d+)(.*)$/, (match, ...groups) => {
                const number = parseInt(groups[0]);
                return number < maxNumber
                    ? String(number + 1).padStart(groups[0].length, '0') + groups[1]
                    : `${groups[0]}${groups[1]}.1`;
            });
        }
        // file/folder=>file.1/folder.1
        return `${name}.1`;
    }
    exports.incrementFileName = incrementFileName;
    /**
     * Checks to see if the resource already exists, if so prompts the user if they would be ok with it being overwritten
     * @param fileService The file service
     * @param dialogService The dialog service
     * @param targetResource The resource to be overwritten
     * @return A boolean indicating if the user is ok with resource being overwritten, if the resource does not exist it returns true.
     */
    async function askForOverwrite(fileService, dialogService, targetResource) {
        const exists = await fileService.exists(targetResource);
        if (!exists) {
            return true;
        }
        // Ask for overwrite confirmation
        const { confirmed } = await dialogService.confirm({
            type: notification_1.Severity.Warning,
            message: nls.localize('confirmOverwrite', "A file or folder with the name '{0}' already exists in the destination folder. Do you want to replace it?", (0, path_1.basename)(targetResource.path)),
            primaryButton: nls.localize('replaceButtonLabel', "&&Replace")
        });
        return confirmed;
    }
    // Global Compare with
    class GlobalCompareResourcesAction extends actions_2.Action2 {
        static { this.ID = 'workbench.files.action.compareFileWith'; }
        static { this.LABEL = nls.localize('globalCompareFile', "Compare Active File With..."); }
        constructor() {
            super({
                id: GlobalCompareResourcesAction.ID,
                title: { value: GlobalCompareResourcesAction.LABEL, original: 'Compare Active File With...' },
                f1: true,
                category: actionCommonCategories_1.Categories.File,
                precondition: contextkeys_1.ActiveEditorContext
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const textModelService = accessor.get(resolverService_1.ITextModelService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const activeInput = editorService.activeEditor;
            const activeResource = editor_1.EditorResourceAccessor.getOriginalUri(activeInput);
            if (activeResource && textModelService.canHandleResource(activeResource)) {
                const picks = await quickInputService.quickAccess.pick('', { itemActivation: quickInput_1.ItemActivation.SECOND });
                if (picks?.length === 1) {
                    const resource = picks[0].resource;
                    if (uri_1.URI.isUri(resource) && textModelService.canHandleResource(resource)) {
                        editorService.openEditor({
                            original: { resource: activeResource },
                            modified: { resource: resource },
                            options: { pinned: true }
                        });
                    }
                }
            }
        }
    }
    exports.GlobalCompareResourcesAction = GlobalCompareResourcesAction;
    class ToggleAutoSaveAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.toggleAutoSave'; }
        constructor() {
            super({
                id: ToggleAutoSaveAction.ID,
                title: nls.localize2('toggleAutoSave', "Toggle Auto Save"),
                f1: true,
                category: actionCommonCategories_1.Categories.File,
                metadata: { description: nls.localize2('toggleAutoSaveDescription', "Toggle the ability to save files automatically after typing") }
            });
        }
        run(accessor) {
            const filesConfigurationService = accessor.get(filesConfigurationService_1.IFilesConfigurationService);
            return filesConfigurationService.toggleAutoSave();
        }
    }
    exports.ToggleAutoSaveAction = ToggleAutoSaveAction;
    let BaseSaveAllAction = class BaseSaveAllAction extends actions_1.Action {
        constructor(id, label, commandService, notificationService, workingCopyService) {
            super(id, label);
            this.commandService = commandService;
            this.notificationService = notificationService;
            this.workingCopyService = workingCopyService;
            this.lastDirtyState = this.workingCopyService.hasDirty;
            this.enabled = this.lastDirtyState;
            this.registerListeners();
        }
        registerListeners() {
            // update enablement based on working copy changes
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.updateEnablement(workingCopy)));
        }
        updateEnablement(workingCopy) {
            const hasDirty = workingCopy.isDirty() || this.workingCopyService.hasDirty;
            if (this.lastDirtyState !== hasDirty) {
                this.enabled = hasDirty;
                this.lastDirtyState = this.enabled;
            }
        }
        async run(context) {
            try {
                await this.doRun(context);
            }
            catch (error) {
                onError(this.notificationService, error);
            }
        }
    };
    BaseSaveAllAction = __decorate([
        __param(2, commands_1.ICommandService),
        __param(3, notification_1.INotificationService),
        __param(4, workingCopyService_1.IWorkingCopyService)
    ], BaseSaveAllAction);
    class SaveAllInGroupAction extends BaseSaveAllAction {
        static { this.ID = 'workbench.files.action.saveAllInGroup'; }
        static { this.LABEL = nls.localize('saveAllInGroup', "Save All in Group"); }
        get class() {
            return 'explorer-action ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.saveAll);
        }
        doRun(context) {
            return this.commandService.executeCommand(fileConstants_1.SAVE_ALL_IN_GROUP_COMMAND_ID, {}, context);
        }
    }
    exports.SaveAllInGroupAction = SaveAllInGroupAction;
    let CloseGroupAction = class CloseGroupAction extends actions_1.Action {
        static { this.ID = 'workbench.files.action.closeGroup'; }
        static { this.LABEL = nls.localize('closeGroup', "Close Group"); }
        constructor(id, label, commandService) {
            super(id, label, themables_1.ThemeIcon.asClassName(codicons_1.Codicon.closeAll));
            this.commandService = commandService;
        }
        run(context) {
            return this.commandService.executeCommand(editorCommands_1.CLOSE_EDITORS_AND_GROUP_COMMAND_ID, {}, context);
        }
    };
    exports.CloseGroupAction = CloseGroupAction;
    exports.CloseGroupAction = CloseGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], CloseGroupAction);
    class FocusFilesExplorer extends actions_2.Action2 {
        static { this.ID = 'workbench.files.action.focusFilesExplorer'; }
        static { this.LABEL = nls.localize('focusFilesExplorer', "Focus on Files Explorer"); }
        constructor() {
            super({
                id: FocusFilesExplorer.ID,
                title: { value: FocusFilesExplorer.LABEL, original: 'Focus on Files Explorer' },
                f1: true,
                category: actionCommonCategories_1.Categories.File
            });
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            await paneCompositeService.openPaneComposite(files_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
        }
    }
    exports.FocusFilesExplorer = FocusFilesExplorer;
    class ShowActiveFileInExplorer extends actions_2.Action2 {
        static { this.ID = 'workbench.files.action.showActiveFileInExplorer'; }
        static { this.LABEL = nls.localize('showInExplorer', "Reveal Active File in Explorer View"); }
        constructor() {
            super({
                id: ShowActiveFileInExplorer.ID,
                title: { value: ShowActiveFileInExplorer.LABEL, original: 'Reveal Active File in Explorer View' },
                f1: true,
                category: actionCommonCategories_1.Categories.File
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (resource) {
                commandService.executeCommand(fileConstants_1.REVEAL_IN_EXPLORER_COMMAND_ID, resource);
            }
        }
    }
    exports.ShowActiveFileInExplorer = ShowActiveFileInExplorer;
    class OpenActiveFileInEmptyWorkspace extends actions_2.Action2 {
        static { this.ID = 'workbench.action.files.showOpenedFileInNewWindow'; }
        static { this.LABEL = nls.localize('openFileInEmptyWorkspace', "Open Active File in New Empty Workspace"); }
        constructor() {
            super({
                id: OpenActiveFileInEmptyWorkspace.ID,
                title: { value: OpenActiveFileInEmptyWorkspace.LABEL, original: 'Open Active File in New Empty Workspace' },
                f1: true,
                category: actionCommonCategories_1.Categories.File,
                precondition: contextkeys_1.EmptyWorkspaceSupportContext
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const hostService = accessor.get(host_1.IHostService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const fileService = accessor.get(files_2.IFileService);
            const fileResource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (fileResource) {
                if (fileService.hasProvider(fileResource)) {
                    hostService.openWindow([{ fileUri: fileResource }], { forceNewWindow: true });
                }
                else {
                    dialogService.error(nls.localize('openFileToShowInNewWindow.unsupportedschema', "The active editor must contain an openable resource."));
                }
            }
        }
    }
    exports.OpenActiveFileInEmptyWorkspace = OpenActiveFileInEmptyWorkspace;
    function validateFileName(pathService, item, name, os) {
        // Produce a well formed file name
        name = getWellFormedFileName(name);
        // Name not provided
        if (!name || name.length === 0 || /^\s+$/.test(name)) {
            return {
                content: nls.localize('emptyFileNameError', "A file or folder name must be provided."),
                severity: notification_1.Severity.Error
            };
        }
        // Relative paths only
        if (name[0] === '/' || name[0] === '\\') {
            return {
                content: nls.localize('fileNameStartsWithSlashError', "A file or folder name cannot start with a slash."),
                severity: notification_1.Severity.Error
            };
        }
        const names = (0, arrays_1.coalesce)(name.split(/[\\/]/));
        const parent = item.parent;
        if (name !== item.name) {
            // Do not allow to overwrite existing file
            const child = parent?.getChild(name);
            if (child && child !== item) {
                return {
                    content: nls.localize('fileNameExistsError', "A file or folder **{0}** already exists at this location. Please choose a different name.", name),
                    severity: notification_1.Severity.Error
                };
            }
        }
        // Check for invalid file name.
        if (names.some(folderName => !pathService.hasValidBasename(item.resource, os, folderName))) {
            // Escape * characters
            const escapedName = name.replace(/\*/g, '\\*'); // CodeQL [SM02383] This only processes filenames which are enforced against having backslashes in them farther up in the stack.
            return {
                content: nls.localize('invalidFileNameError', "The name **{0}** is not valid as a file or folder name. Please choose a different name.", trimLongName(escapedName)),
                severity: notification_1.Severity.Error
            };
        }
        if (names.some(name => /^\s|\s$/.test(name))) {
            return {
                content: nls.localize('fileNameWhitespaceWarning', "Leading or trailing whitespace detected in file or folder name."),
                severity: notification_1.Severity.Warning
            };
        }
        return null;
    }
    exports.validateFileName = validateFileName;
    function trimLongName(name) {
        if (name?.length > 255) {
            return `${name.substr(0, 255)}...`;
        }
        return name;
    }
    function getWellFormedFileName(filename) {
        if (!filename) {
            return filename;
        }
        // Trim tabs
        filename = (0, strings_1.trim)(filename, '\t');
        // Remove trailing slashes
        filename = (0, strings_1.rtrim)(filename, '/');
        filename = (0, strings_1.rtrim)(filename, '\\');
        return filename;
    }
    class CompareNewUntitledTextFilesAction extends actions_2.Action2 {
        static { this.ID = 'workbench.files.action.compareNewUntitledTextFiles'; }
        static { this.LABEL = nls.localize('compareNewUntitledTextFiles', "Compare New Untitled Text Files"); }
        constructor() {
            super({
                id: CompareNewUntitledTextFilesAction.ID,
                title: { value: CompareNewUntitledTextFilesAction.LABEL, original: 'Compare New Untitled Text Files' },
                f1: true,
                category: actionCommonCategories_1.Categories.File
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            await editorService.openEditor({
                original: { resource: undefined },
                modified: { resource: undefined },
                options: { pinned: true }
            });
        }
    }
    exports.CompareNewUntitledTextFilesAction = CompareNewUntitledTextFilesAction;
    class CompareWithClipboardAction extends actions_2.Action2 {
        static { this.ID = 'workbench.files.action.compareWithClipboard'; }
        static { this.LABEL = nls.localize('compareWithClipboard', "Compare Active File with Clipboard"); }
        static { this.SCHEME_COUNTER = 0; }
        constructor() {
            super({
                id: CompareWithClipboardAction.ID,
                title: { value: CompareWithClipboardAction.LABEL, original: 'Compare Active File with Clipboard' },
                f1: true,
                category: actionCommonCategories_1.Categories.File,
                keybinding: { primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 33 /* KeyCode.KeyC */), weight: 200 /* KeybindingWeight.WorkbenchContrib */ }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const textModelService = accessor.get(resolverService_1.ITextModelService);
            const fileService = accessor.get(files_2.IFileService);
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const scheme = `clipboardCompare${CompareWithClipboardAction.SCHEME_COUNTER++}`;
            if (resource && (fileService.hasProvider(resource) || resource.scheme === network_1.Schemas.untitled)) {
                if (!this.registrationDisposal) {
                    const provider = instantiationService.createInstance(ClipboardContentProvider);
                    this.registrationDisposal = textModelService.registerTextModelContentProvider(scheme, provider);
                }
                const name = resources.basename(resource);
                const editorLabel = nls.localize('clipboardComparisonLabel', "Clipboard ↔ {0}", name);
                await editorService.openEditor({
                    original: { resource: resource.with({ scheme }) },
                    modified: { resource: resource },
                    label: editorLabel,
                    options: { pinned: true }
                }).finally(() => {
                    (0, lifecycle_1.dispose)(this.registrationDisposal);
                    this.registrationDisposal = undefined;
                });
            }
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.registrationDisposal);
            this.registrationDisposal = undefined;
        }
    }
    exports.CompareWithClipboardAction = CompareWithClipboardAction;
    let ClipboardContentProvider = class ClipboardContentProvider {
        constructor(clipboardService, languageService, modelService) {
            this.clipboardService = clipboardService;
            this.languageService = languageService;
            this.modelService = modelService;
        }
        async provideTextContent(resource) {
            const text = await this.clipboardService.readText();
            const model = this.modelService.createModel(text, this.languageService.createByFilepathOrFirstLine(resource), resource);
            return model;
        }
    };
    ClipboardContentProvider = __decorate([
        __param(0, clipboardService_1.IClipboardService),
        __param(1, language_1.ILanguageService),
        __param(2, model_1.IModelService)
    ], ClipboardContentProvider);
    function onErrorWithRetry(notificationService, error, retry) {
        notificationService.prompt(notification_1.Severity.Error, (0, errorMessage_1.toErrorMessage)(error, false), [{
                label: nls.localize('retry', "Retry"),
                run: () => retry()
            }]);
    }
    async function openExplorerAndCreate(accessor, isFolder) {
        const explorerService = accessor.get(files_3.IExplorerService);
        const fileService = accessor.get(files_2.IFileService);
        const configService = accessor.get(configuration_1.IConfigurationService);
        const filesConfigService = accessor.get(filesConfigurationService_1.IFilesConfigurationService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        const commandService = accessor.get(commands_1.ICommandService);
        const pathService = accessor.get(pathService_1.IPathService);
        const wasHidden = !viewsService.isViewVisible(files_1.VIEW_ID);
        const view = await viewsService.openView(files_1.VIEW_ID, true);
        if (wasHidden) {
            // Give explorer some time to resolve itself #111218
            await (0, async_1.timeout)(500);
        }
        if (!view) {
            // Can happen in empty workspace case (https://github.com/microsoft/vscode/issues/100604)
            if (isFolder) {
                throw new Error('Open a folder or workspace first.');
            }
            return commandService.executeCommand(fileConstants_1.NEW_UNTITLED_FILE_COMMAND_ID);
        }
        const stats = explorerService.getContext(false);
        const stat = stats.length > 0 ? stats[0] : undefined;
        let folder;
        if (stat) {
            folder = stat.isDirectory ? stat : (stat.parent || explorerService.roots[0]);
        }
        else {
            folder = explorerService.roots[0];
        }
        if (folder.isReadonly) {
            throw new Error('Parent folder is readonly.');
        }
        const newStat = new explorerModel_1.NewExplorerItem(fileService, configService, filesConfigService, folder, isFolder);
        folder.addChild(newStat);
        const onSuccess = async (value) => {
            try {
                const resourceToCreate = resources.joinPath(folder.resource, value);
                if (value.endsWith('/')) {
                    isFolder = true;
                }
                await explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit(undefined, resourceToCreate, { folder: isFolder })], {
                    undoLabel: nls.localize('createBulkEdit', "Create {0}", value),
                    progressLabel: nls.localize('creatingBulkEdit', "Creating {0}", value),
                    confirmBeforeUndo: true
                });
                await refreshIfSeparator(value, explorerService);
                if (isFolder) {
                    await explorerService.select(resourceToCreate, true);
                }
                else {
                    await editorService.openEditor({ resource: resourceToCreate, options: { pinned: true } });
                }
            }
            catch (error) {
                onErrorWithRetry(notificationService, error, () => onSuccess(value));
            }
        };
        const os = (await remoteAgentService.getEnvironment())?.os ?? platform_1.OS;
        await explorerService.setEditable(newStat, {
            validationMessage: value => validateFileName(pathService, newStat, value, os),
            onFinish: async (value, success) => {
                folder.removeChild(newStat);
                await explorerService.setEditable(newStat, null);
                if (success) {
                    onSuccess(value);
                }
            }
        });
    }
    commands_1.CommandsRegistry.registerCommand({
        id: exports.NEW_FILE_COMMAND_ID,
        handler: async (accessor) => {
            await openExplorerAndCreate(accessor, false);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.NEW_FOLDER_COMMAND_ID,
        handler: async (accessor) => {
            await openExplorerAndCreate(accessor, true);
        }
    });
    const renameHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        const pathService = accessor.get(pathService_1.IPathService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const stats = explorerService.getContext(false);
        const stat = stats.length > 0 ? stats[0] : undefined;
        if (!stat) {
            return;
        }
        const os = (await remoteAgentService.getEnvironment())?.os ?? platform_1.OS;
        await explorerService.setEditable(stat, {
            validationMessage: value => validateFileName(pathService, stat, value, os),
            onFinish: async (value, success) => {
                if (success) {
                    const parentResource = stat.parent.resource;
                    const targetResource = resources.joinPath(parentResource, value);
                    if (stat.resource.toString() !== targetResource.toString()) {
                        try {
                            await explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit(stat.resource, targetResource)], {
                                confirmBeforeUndo: configurationService.getValue().explorer.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
                                undoLabel: nls.localize('renameBulkEdit', "Rename {0} to {1}", stat.name, value),
                                progressLabel: nls.localize('renamingBulkEdit', "Renaming {0} to {1}", stat.name, value),
                            });
                            await refreshIfSeparator(value, explorerService);
                        }
                        catch (e) {
                            notificationService.error(e);
                        }
                    }
                }
                await explorerService.setEditable(stat, null);
            }
        });
    };
    exports.renameHandler = renameHandler;
    const moveFileToTrashHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true).filter(s => !s.isRoot);
        if (stats.length) {
            await deleteFiles(accessor.get(files_3.IExplorerService), accessor.get(workingCopyFileService_1.IWorkingCopyFileService), accessor.get(dialogs_1.IDialogService), accessor.get(configuration_1.IConfigurationService), stats, true);
        }
    };
    exports.moveFileToTrashHandler = moveFileToTrashHandler;
    const deleteFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true).filter(s => !s.isRoot);
        if (stats.length) {
            await deleteFiles(accessor.get(files_3.IExplorerService), accessor.get(workingCopyFileService_1.IWorkingCopyFileService), accessor.get(dialogs_1.IDialogService), accessor.get(configuration_1.IConfigurationService), stats, false);
        }
    };
    exports.deleteFileHandler = deleteFileHandler;
    let pasteShouldMove = false;
    const copyFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true);
        if (stats.length > 0) {
            await explorerService.setToCopy(stats, false);
            pasteShouldMove = false;
        }
    };
    exports.copyFileHandler = copyFileHandler;
    const cutFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true);
        if (stats.length > 0) {
            await explorerService.setToCopy(stats, true);
            pasteShouldMove = true;
        }
    };
    exports.cutFileHandler = cutFileHandler;
    const downloadFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const context = explorerService.getContext(true);
        const explorerItems = context.length ? context : explorerService.roots;
        const downloadHandler = instantiationService.createInstance(fileImportExport_1.FileDownload);
        try {
            await downloadHandler.download(explorerItems);
        }
        catch (error) {
            notificationService.error(error);
            throw error;
        }
    };
    commands_1.CommandsRegistry.registerCommand({
        id: exports.DOWNLOAD_COMMAND_ID,
        handler: downloadFileHandler
    });
    const uploadFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const context = explorerService.getContext(true);
        const element = context.length ? context[0] : explorerService.roots[0];
        try {
            const files = await (0, dom_1.triggerUpload)();
            if (files) {
                const browserUpload = instantiationService.createInstance(fileImportExport_1.BrowserFileUpload);
                await browserUpload.upload(element, files);
            }
        }
        catch (error) {
            notificationService.error(error);
            throw error;
        }
    };
    commands_1.CommandsRegistry.registerCommand({
        id: exports.UPLOAD_COMMAND_ID,
        handler: uploadFileHandler
    });
    const pasteFileHandler = async (accessor, fileList) => {
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const explorerService = accessor.get(files_3.IExplorerService);
        const fileService = accessor.get(files_2.IFileService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
        const dialogService = accessor.get(dialogs_1.IDialogService);
        const context = explorerService.getContext(true);
        const hasNativeFilesToPaste = fileList && fileList.length > 0;
        const confirmPasteNative = hasNativeFilesToPaste && configurationService.getValue('explorer.confirmPasteNative');
        const toPaste = await getFilesToPaste(fileList, clipboardService);
        if (confirmPasteNative && toPaste?.length >= 1) {
            const message = toPaste.length > 1 ?
                nls.localize('confirmMultiPasteNative', "Are you sure you want to paste the following {0} items?", toPaste.length) :
                nls.localize('confirmPasteNative', "Are you sure you want to paste '{0}'?", (0, path_1.basename)(toPaste[0].fsPath));
            const detail = toPaste.length > 1 ? (0, dialogs_1.getFileNamesMessage)(toPaste) : undefined;
            const confirmation = await dialogService.confirm({
                message,
                detail,
                checkbox: {
                    label: nls.localize('doNotAskAgain', "Do not ask me again")
                },
                primaryButton: nls.localize({ key: 'pasteButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Paste")
            });
            if (!confirmation.confirmed) {
                return;
            }
            // Check for confirmation checkbox
            if (confirmation.checkboxChecked === true) {
                await configurationService.updateValue('explorer.confirmPasteNative', false);
            }
        }
        const element = context.length ? context[0] : explorerService.roots[0];
        const incrementalNaming = configurationService.getValue().explorer.incrementalNaming;
        const editableItem = explorerService.getEditable();
        // If it's an editable item, just do nothing
        if (editableItem) {
            return;
        }
        try {
            // Check if target is ancestor of pasted folder
            const sourceTargetPairs = (0, arrays_1.coalesce)(await Promise.all(toPaste.map(async (fileToPaste) => {
                if (element.resource.toString() !== fileToPaste.toString() && resources.isEqualOrParent(element.resource, fileToPaste)) {
                    throw new Error(nls.localize('fileIsAncestor', "File to paste is an ancestor of the destination folder"));
                }
                const fileToPasteStat = await fileService.stat(fileToPaste);
                // Find target
                let target;
                if (uriIdentityService.extUri.isEqual(element.resource, fileToPaste)) {
                    target = element.parent;
                }
                else {
                    target = element.isDirectory ? element : element.parent;
                }
                const targetFile = await findValidPasteFileTarget(explorerService, fileService, dialogService, target, { resource: fileToPaste, isDirectory: fileToPasteStat.isDirectory, allowOverwrite: pasteShouldMove || incrementalNaming === 'disabled' }, incrementalNaming);
                if (!targetFile) {
                    return undefined;
                }
                return { source: fileToPaste, target: targetFile };
            })));
            if (sourceTargetPairs.length >= 1) {
                // Move/Copy File
                if (pasteShouldMove) {
                    const resourceFileEdits = sourceTargetPairs.map(pair => new bulkEditService_1.ResourceFileEdit(pair.source, pair.target, { overwrite: incrementalNaming === 'disabled' }));
                    const options = {
                        confirmBeforeUndo: configurationService.getValue().explorer.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
                        progressLabel: sourceTargetPairs.length > 1 ? nls.localize({ key: 'movingBulkEdit', comment: ['Placeholder will be replaced by the number of files being moved'] }, "Moving {0} files", sourceTargetPairs.length)
                            : nls.localize({ key: 'movingFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file moved.'] }, "Moving {0}", resources.basenameOrAuthority(sourceTargetPairs[0].target)),
                        undoLabel: sourceTargetPairs.length > 1 ? nls.localize({ key: 'moveBulkEdit', comment: ['Placeholder will be replaced by the number of files being moved'] }, "Move {0} files", sourceTargetPairs.length)
                            : nls.localize({ key: 'moveFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file moved.'] }, "Move {0}", resources.basenameOrAuthority(sourceTargetPairs[0].target))
                    };
                    await explorerService.applyBulkEdit(resourceFileEdits, options);
                }
                else {
                    const resourceFileEdits = sourceTargetPairs.map(pair => new bulkEditService_1.ResourceFileEdit(pair.source, pair.target, { copy: true, overwrite: incrementalNaming === 'disabled' }));
                    const undoLevel = configurationService.getValue().explorer.confirmUndo;
                    const options = {
                        confirmBeforeUndo: undoLevel === "default" /* UndoConfirmLevel.Default */ || undoLevel === "verbose" /* UndoConfirmLevel.Verbose */,
                        progressLabel: sourceTargetPairs.length > 1 ? nls.localize({ key: 'copyingBulkEdit', comment: ['Placeholder will be replaced by the number of files being copied'] }, "Copying {0} files", sourceTargetPairs.length)
                            : nls.localize({ key: 'copyingFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file copied.'] }, "Copying {0}", resources.basenameOrAuthority(sourceTargetPairs[0].target)),
                        undoLabel: sourceTargetPairs.length > 1 ? nls.localize({ key: 'copyBulkEdit', comment: ['Placeholder will be replaced by the number of files being copied'] }, "Paste {0} files", sourceTargetPairs.length)
                            : nls.localize({ key: 'copyFileBulkEdit', comment: ['Placeholder will be replaced by the name of the file copied.'] }, "Paste {0}", resources.basenameOrAuthority(sourceTargetPairs[0].target))
                    };
                    await explorerService.applyBulkEdit(resourceFileEdits, options);
                }
                const pair = sourceTargetPairs[0];
                await explorerService.select(pair.target);
                if (sourceTargetPairs.length === 1) {
                    const item = explorerService.findClosest(pair.target);
                    if (item && !item.isDirectory) {
                        await editorService.openEditor({ resource: item.resource, options: { pinned: true, preserveFocus: true } });
                    }
                }
            }
        }
        catch (e) {
            onError(notificationService, new Error(nls.localize('fileDeleted', "The file(s) to paste have been deleted or moved since you copied them. {0}", (0, errors_1.getErrorMessage)(e))));
        }
        finally {
            if (pasteShouldMove) {
                // Cut is done. Make sure to clear cut state.
                await explorerService.setToCopy([], false);
                pasteShouldMove = false;
            }
        }
    };
    exports.pasteFileHandler = pasteFileHandler;
    async function getFilesToPaste(fileList, clipboardService) {
        if (fileList && fileList.length > 0) {
            // with a `fileList` we support natively pasting files from clipboard
            return [...fileList].filter(file => !!file.path && (0, path_1.isAbsolute)(file.path)).map(file => uri_1.URI.file(file.path));
        }
        else {
            // otherwise we fallback to reading resources from our clipboard service
            return resources.distinctParents(await clipboardService.readResources(), resource => resource);
        }
    }
    const openFilePreserveFocusHandler = async (accessor) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true);
        await editorService.openEditors(stats.filter(s => !s.isDirectory).map(s => ({
            resource: s.resource,
            options: { preserveFocus: true }
        })));
    };
    exports.openFilePreserveFocusHandler = openFilePreserveFocusHandler;
    class BaseSetActiveEditorReadonlyInSession extends actions_2.Action2 {
        constructor(id, title, newReadonlyState) {
            super({
                id,
                title,
                f1: true,
                category: actionCommonCategories_1.Categories.File,
                precondition: contextkeys_1.ActiveEditorCanToggleReadonlyContext
            });
            this.newReadonlyState = newReadonlyState;
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const filesConfigurationService = accessor.get(filesConfigurationService_1.IFilesConfigurationService);
            const fileResource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (!fileResource) {
                return;
            }
            await filesConfigurationService.updateReadonly(fileResource, this.newReadonlyState);
        }
    }
    class SetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.setActiveEditorReadonlyInSession'; }
        static { this.LABEL = nls.localize('setActiveEditorReadonlyInSession', "Set Active Editor Read-only in Session"); }
        constructor() {
            super(SetActiveEditorReadonlyInSession.ID, { value: SetActiveEditorReadonlyInSession.LABEL, original: 'Set Active Editor Readonly in Session' }, true);
        }
    }
    exports.SetActiveEditorReadonlyInSession = SetActiveEditorReadonlyInSession;
    class SetActiveEditorWriteableInSession extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.setActiveEditorWriteableInSession'; }
        static { this.LABEL = nls.localize('setActiveEditorWriteableInSession', "Set Active Editor Writeable in Session"); }
        constructor() {
            super(SetActiveEditorWriteableInSession.ID, { value: SetActiveEditorWriteableInSession.LABEL, original: 'Set Active Editor Writeable in Session' }, false);
        }
    }
    exports.SetActiveEditorWriteableInSession = SetActiveEditorWriteableInSession;
    class ToggleActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.toggleActiveEditorReadonlyInSession'; }
        static { this.LABEL = nls.localize('toggleActiveEditorReadonlyInSession', "Toggle Active Editor Read-only in Session"); }
        constructor() {
            super(ToggleActiveEditorReadonlyInSession.ID, { value: ToggleActiveEditorReadonlyInSession.LABEL, original: 'Toggle Active Editor Readonly in Session' }, 'toggle');
        }
    }
    exports.ToggleActiveEditorReadonlyInSession = ToggleActiveEditorReadonlyInSession;
    class ResetActiveEditorReadonlyInSession extends BaseSetActiveEditorReadonlyInSession {
        static { this.ID = 'workbench.action.files.resetActiveEditorReadonlyInSession'; }
        static { this.LABEL = nls.localize('resetActiveEditorReadonlyInSession', "Reset Active Editor Read-only in Session"); }
        constructor() {
            super(ResetActiveEditorReadonlyInSession.ID, { value: ResetActiveEditorReadonlyInSession.LABEL, original: 'Reset Active Editor Readonly in Session' }, 'reset');
        }
    }
    exports.ResetActiveEditorReadonlyInSession = ResetActiveEditorReadonlyInSession;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ZpbGVzL2Jyb3dzZXIvZmlsZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMkRuRixRQUFBLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO0lBQ3pDLFFBQUEsY0FBYyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3hELFFBQUEscUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7SUFDN0MsUUFBQSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUM5RCxRQUFBLG9CQUFvQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzNELFFBQUEsd0JBQXdCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUQsUUFBQSxlQUFlLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbkQsUUFBQSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0RCxRQUFBLGlCQUFpQixHQUFHLElBQUksMEJBQWEsQ0FBVSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEUsUUFBQSxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztJQUMxQyxRQUFBLGNBQWMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUN6RCxRQUFBLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO0lBQ3RDLFFBQUEsWUFBWSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sMEJBQTBCLEdBQUcsd0JBQXdCLENBQUM7SUFDNUQsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsQ0FBQyxNQUFNO0lBRTFDLFNBQVMsT0FBTyxDQUFDLG1CQUF5QyxFQUFFLEtBQVU7UUFDckUsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBQSw2QkFBYyxFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxLQUFLLFVBQVUsa0JBQWtCLENBQUMsS0FBYSxFQUFFLGVBQWlDO1FBQ2pGLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDeEUsMEZBQTBGO1lBQzFGLE1BQU0sZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pDLENBQUM7SUFDRixDQUFDO0lBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxlQUFpQyxFQUFFLHNCQUErQyxFQUFFLGFBQTZCLEVBQUUsb0JBQTJDLEVBQUUsUUFBd0IsRUFBRSxRQUFpQixFQUFFLFdBQVcsR0FBRyxLQUFLLEVBQUUsaUJBQWlCLEdBQUcsS0FBSztRQUNyUixJQUFJLGFBQXFCLENBQUM7UUFDMUIsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNkLGFBQWEsR0FBRyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsd0JBQXdCLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDM00sQ0FBQzthQUFNLENBQUM7WUFDUCxhQUFhLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDNUcsQ0FBQztRQUVELGVBQWU7UUFDZixNQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQWdCLENBQUM7UUFDbkQsS0FBSyxNQUFNLGVBQWUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2hELEtBQUssTUFBTSxnQkFBZ0IsSUFBSSxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQzFGLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzFDLENBQUM7UUFDRixDQUFDO1FBQ0QsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDN0IsSUFBSSxPQUFlLENBQUM7WUFDcEIsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pDLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLHVFQUF1RSxDQUFDLENBQUM7WUFDNUgsQ0FBQztpQkFBTSxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM1QyxJQUFJLGtCQUFrQixDQUFDLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDbkMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkJBQTZCLEVBQUUsd0ZBQXdGLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNLLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxPQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSwyRkFBMkYsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BNLENBQUM7WUFDRixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUscUVBQXFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkosQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sYUFBYSxDQUFDLE9BQU8sQ0FBQztnQkFDNUMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTztnQkFDUCxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsbURBQW1ELENBQUM7Z0JBQ3pGLGFBQWE7YUFDYixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUN6QixTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ25CLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLENBQUM7UUFDRixDQUFDO1FBRUQsa0VBQWtFO1FBQ2xFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNoQixPQUFPO1FBQ1IsQ0FBQztRQUVELElBQUksWUFBaUMsQ0FBQztRQUN0Qyx1RkFBdUY7UUFDdkYsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDOUgsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsb0RBQW9ELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsa0RBQWtELENBQUMsQ0FBQztRQUVqTSxrREFBa0Q7UUFDbEQsSUFBSSxXQUFXLElBQUksQ0FBQyxRQUFRLElBQUksb0JBQW9CLENBQUMsUUFBUSxDQUFVLDBCQUEwQixDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMvRyxZQUFZLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVELDhCQUE4QjthQUN6QixJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ25CLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNsRSxNQUFNLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM3QixJQUFJLG9CQUFTLEVBQUUsQ0FBQztnQkFDZixNQUFNLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsbURBQW1ELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsaURBQWlELENBQUMsQ0FBQztZQUN4TSxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsNkNBQTZDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztZQUNoTSxDQUFDO1lBRUQsWUFBWSxHQUFHLE1BQU0sYUFBYSxDQUFDLE9BQU8sQ0FBQztnQkFDMUMsT0FBTztnQkFDUCxNQUFNO2dCQUNOLGFBQWE7Z0JBQ2IsUUFBUSxFQUFFO29CQUNULEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQztpQkFDM0Q7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsbUNBQW1DO2FBQzlCLENBQUM7WUFDTCxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDN0QsTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDN0IsTUFBTSxJQUFJLFlBQVksQ0FBQztZQUN2QixZQUFZLEdBQUcsTUFBTSxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUMxQyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPO2dCQUNQLE1BQU07Z0JBQ04sYUFBYTthQUNiLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxrQ0FBa0M7UUFDbEMsSUFBSSxZQUFZLENBQUMsU0FBUyxJQUFJLFlBQVksQ0FBQyxlQUFlLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDckUsTUFBTSxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVELHlCQUF5QjtRQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzdCLE9BQU87UUFDUixDQUFDO1FBRUQsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQztZQUNKLE1BQU0saUJBQWlCLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxrQ0FBZ0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0TixNQUFNLE9BQU8sR0FBRztnQkFDZixTQUFTLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyw2REFBNkQsQ0FBQyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsb0JBQW9CLEVBQUUsT0FBTyxFQUFFLENBQUMsOERBQThELENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3hXLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxDQUFDLDZEQUE2RCxDQUFDLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyw4REFBOEQsQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzthQUNwWCxDQUFDO1lBQ0YsTUFBTSxlQUFlLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBRWhCLGtFQUFrRTtZQUNsRSxJQUFJLFlBQW9CLENBQUM7WUFDekIsSUFBSSxhQUFpQyxDQUFDO1lBQ3RDLElBQUksYUFBcUIsQ0FBQztZQUMxQixJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNkLFlBQVksR0FBRyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxvRkFBb0YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSw4RUFBOEUsQ0FBQyxDQUFDO2dCQUN6UCxhQUFhLEdBQUcsWUFBWSxDQUFDO2dCQUM3QixhQUFhLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSw4QkFBOEIsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztZQUNuSSxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsWUFBWSxHQUFHLElBQUEsNkJBQWMsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzVDLGFBQWEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMxRyxDQUFDO1lBRUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUN2QyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsWUFBWTtnQkFDckIsTUFBTSxFQUFFLGFBQWE7Z0JBQ3JCLGFBQWE7YUFDYixDQUFDLENBQUM7WUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDZCxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMscUJBQXFCO2dCQUN4QyxDQUFDO2dCQUVELFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQ25CLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFFekIsT0FBTyxXQUFXLENBQUMsZUFBZSxFQUFFLHNCQUFzQixFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3RKLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVELFNBQVMscUJBQXFCLENBQUMsZ0JBQWdDO1FBQzlELElBQUksNEJBQTRCLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1lBQ3BELE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNENBQTRDLEVBQUUseUZBQXlGLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO2dCQUN2TCxNQUFNLEVBQUUsSUFBQSw2QkFBbUIsRUFBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbEUsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNqQyxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNyQyxPQUFPO29CQUNOLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDRDQUE0QyxFQUFFLG1GQUFtRixFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztvQkFDakwsTUFBTSxFQUFFLElBQUEsNkJBQW1CLEVBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNsRSxDQUFDO1lBQ0gsQ0FBQztZQUVELE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEVBQUUsMERBQTBELEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO2dCQUM3SSxNQUFNLEVBQUUsSUFBQSw2QkFBbUIsRUFBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbEUsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzVFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSx5REFBeUQsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDcEssQ0FBQztRQUVELE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSx3Q0FBd0MsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDakosQ0FBQztJQUVELFNBQVMsZ0JBQWdCLENBQUMsZ0JBQWdDO1FBQ3pELElBQUksNEJBQTRCLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1lBQ3BELE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMseUNBQXlDLEVBQUUscUdBQXFHLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO2dCQUNoTSxNQUFNLEVBQUUsSUFBQSw2QkFBbUIsRUFBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbEUsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNqQyxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNyQyxPQUFPO29CQUNOLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHlDQUF5QyxFQUFFLCtGQUErRixFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztvQkFDMUwsTUFBTSxFQUFFLElBQUEsNkJBQW1CLEVBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNsRSxDQUFDO1lBQ0gsQ0FBQztZQUVELE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsOEJBQThCLEVBQUUsc0VBQXNFLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO2dCQUN0SixNQUFNLEVBQUUsSUFBQSw2QkFBbUIsRUFBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbEUsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3JDLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxxRUFBcUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDN0ssQ0FBQztRQUVELE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxvREFBb0QsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDMUosQ0FBQztJQUVELFNBQVMsNEJBQTRCLENBQUMsZ0JBQWdDO1FBQ3JFLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4RSxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVwRSxPQUFPLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM5QixDQUFDO0lBR00sS0FBSyxVQUFVLHdCQUF3QixDQUM3QyxlQUFpQyxFQUNqQyxXQUF5QixFQUN6QixhQUE2QixFQUM3QixZQUEwQixFQUMxQixXQUE4RSxFQUM5RSxpQkFBa0Q7UUFHbEQsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvRCxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFaEUsaUZBQWlGO1FBQ2pGLElBQUksaUJBQWlCLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDdEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxlQUFlLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ25CLE9BQU87WUFDUixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQzdDLE1BQU07WUFDUCxDQUFDO1lBRUQsSUFBSSxpQkFBaUIsS0FBSyxVQUFVLEVBQUUsQ0FBQztnQkFDdEMsSUFBSSxHQUFHLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzlFLENBQUM7WUFDRCxTQUFTLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBaENELDREQWdDQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLElBQVksRUFBRSxRQUFpQixFQUFFLGlCQUFxQztRQUN2RyxJQUFJLGlCQUFpQixLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3BDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNmLFNBQVMsR0FBRyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUIsVUFBVSxHQUFHLElBQUEsZUFBUSxFQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBRUQseUNBQXlDO1lBQ3pDLHVDQUF1QztZQUN2QyxNQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQztZQUN6QyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDbEMsT0FBTyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUU7b0JBQzFELE1BQU0sTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLE1BQU0sS0FBSyxDQUFDO3dCQUNsQixDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7d0JBQ1QsQ0FBQyxDQUFDLENBQUMsTUFBTSxvREFBbUM7NEJBQzNDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFOzRCQUN2QixDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO1lBQ2hCLENBQUM7WUFFRCxnQ0FBZ0M7WUFDaEMsT0FBTyxHQUFHLFVBQVUsUUFBUSxTQUFTLEVBQUUsQ0FBQztRQUN6QyxDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDO1FBQy9CLE1BQU0sU0FBUyxvREFBbUMsQ0FBQztRQUVuRCx5QkFBeUI7UUFDekIsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsaUJBQWlCLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztZQUM5QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUcsRUFBRSxFQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUU7Z0JBQzdELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsT0FBTyxNQUFNLEdBQUcsU0FBUztvQkFDeEIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7b0JBQ3ZELENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQseUJBQXlCO1FBQ3pCLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEdBQUcsVUFBVSxHQUFHLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1lBQzlDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRyxFQUFFLEVBQUcsRUFBRSxFQUFHLEVBQUUsRUFBRTtnQkFDN0QsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QixPQUFPLE1BQU0sR0FBRyxTQUFTO29CQUN4QixDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtvQkFDdkQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxlQUFlO1FBQ2YsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDO1lBQ3BELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUU7Z0JBQzlELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsT0FBTyxNQUFNLEdBQUcsU0FBUztvQkFDeEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRTtvQkFDbEQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELHVCQUF1QjtRQUN2QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxRQUFRLElBQUksY0FBYyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7UUFDNUUsQ0FBQztRQUVELGFBQWE7UUFDYixNQUFNLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsUUFBUSxJQUFJLGNBQWMsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQztZQUM5RSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRyxFQUFFLEVBQUU7Z0JBQzFELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsT0FBTyxNQUFNLEdBQUcsU0FBUztvQkFDeEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO29CQUM3QyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELGdCQUFnQjtRQUNoQixpQkFBaUI7UUFDakIsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFFBQVEsSUFBSSxjQUFjLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7WUFDeEUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUcsRUFBRSxFQUFHLEVBQUUsRUFBRTtnQkFDekQsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO29CQUNuQixNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNaLENBQUM7Z0JBQ0QsT0FBTyxNQUFNLEdBQUcsU0FBUztvQkFDeEIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztvQkFDbEQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELHFCQUFxQjtRQUNyQixJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLE1BQU0sRUFBRSxFQUFFO2dCQUNsRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sTUFBTSxHQUFHLFNBQVM7b0JBQ3hCLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztvQkFDcEQsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQscUJBQXFCO1FBQ3JCLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN0QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsTUFBTSxFQUFFLEVBQUU7Z0JBQ3ZELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkMsT0FBTyxNQUFNLEdBQUcsU0FBUztvQkFDeEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDaEUsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELCtCQUErQjtRQUMvQixPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQXJIRCw4Q0FxSEM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLFVBQVUsZUFBZSxDQUFDLFdBQXlCLEVBQUUsYUFBNkIsRUFBRSxjQUFtQjtRQUMzRyxNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsaUNBQWlDO1FBQ2pDLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDakQsSUFBSSxFQUFFLHVCQUFRLENBQUMsT0FBTztZQUN0QixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSwyR0FBMkcsRUFBRSxJQUFBLGVBQVEsRUFBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckwsYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsV0FBVyxDQUFDO1NBQzlELENBQUMsQ0FBQztRQUNILE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxzQkFBc0I7SUFDdEIsTUFBYSw0QkFBNkIsU0FBUSxpQkFBTztpQkFFeEMsT0FBRSxHQUFHLHdDQUF3QyxDQUFDO2lCQUM5QyxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1FBRXpGO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw0QkFBNEIsQ0FBQyxFQUFFO2dCQUNuQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsNEJBQTRCLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSw2QkFBNkIsRUFBRTtnQkFDN0YsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsWUFBWSxFQUFFLGlDQUFtQjthQUNqQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUNBQWlCLENBQUMsQ0FBQztZQUN6RCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUUzRCxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDO1lBQy9DLE1BQU0sY0FBYyxHQUFHLCtCQUFzQixDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxRSxJQUFJLGNBQWMsSUFBSSxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO2dCQUMxRSxNQUFNLEtBQUssR0FBRyxNQUFNLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLDJCQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDdEcsSUFBSSxLQUFLLEVBQUUsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUN6QixNQUFNLFFBQVEsR0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFzQyxDQUFDLFFBQVEsQ0FBQztvQkFDekUsSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7d0JBQ3pFLGFBQWEsQ0FBQyxVQUFVLENBQUM7NEJBQ3hCLFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUU7NEJBQ3RDLFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7NEJBQ2hDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7eUJBQ3pCLENBQUMsQ0FBQztvQkFDSixDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQzs7SUFuQ0Ysb0VBb0NDO0lBRUQsTUFBYSxvQkFBcUIsU0FBUSxpQkFBTztpQkFDaEMsT0FBRSxHQUFHLGlDQUFpQyxDQUFDO1FBRXZEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFO2dCQUMzQixLQUFLLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQztnQkFDMUQsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsUUFBUSxFQUFFLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsMkJBQTJCLEVBQUUsNkRBQTZELENBQUMsRUFBRTthQUNwSSxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVEsR0FBRyxDQUFDLFFBQTBCO1lBQ3RDLE1BQU0seUJBQXlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzREFBMEIsQ0FBQyxDQUFDO1lBQzNFLE9BQU8seUJBQXlCLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbkQsQ0FBQzs7SUFoQkYsb0RBaUJDO0lBRUQsSUFBZSxpQkFBaUIsR0FBaEMsTUFBZSxpQkFBa0IsU0FBUSxnQkFBTTtRQUc5QyxZQUNDLEVBQVUsRUFDVixLQUFhLEVBQ2MsY0FBK0IsRUFDNUIsbUJBQXlDLEVBQ2pDLGtCQUF1QztZQUU3RSxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBSlUsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzVCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDakMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUk3RSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUM7WUFDdkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBRW5DLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFJTyxpQkFBaUI7WUFFeEIsa0RBQWtEO1lBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RyxDQUFDO1FBRU8sZ0JBQWdCLENBQUMsV0FBeUI7WUFDakQsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUM7WUFDM0UsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3BDLENBQUM7UUFDRixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFpQjtZQUNuQyxJQUFJLENBQUM7Z0JBQ0osTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNCLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFDLENBQUM7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQXpDYyxpQkFBaUI7UUFNN0IsV0FBQSwwQkFBZSxDQUFBO1FBQ2YsV0FBQSxtQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLHdDQUFtQixDQUFBO09BUlAsaUJBQWlCLENBeUMvQjtJQUVELE1BQWEsb0JBQXFCLFNBQVEsaUJBQWlCO2lCQUUxQyxPQUFFLEdBQUcsdUNBQXVDLENBQUM7aUJBQzdDLFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFFNUUsSUFBYSxLQUFLO1lBQ2pCLE9BQU8sa0JBQWtCLEdBQUcscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRVMsS0FBSyxDQUFDLE9BQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsNENBQTRCLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RGLENBQUM7O0lBWEYsb0RBWUM7SUFFTSxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLGdCQUFNO2lCQUUzQixPQUFFLEdBQUcsbUNBQW1DLEFBQXRDLENBQXVDO2lCQUN6QyxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLEFBQTVDLENBQTZDO1FBRWxFLFlBQVksRUFBVSxFQUFFLEtBQWEsRUFBb0MsY0FBK0I7WUFDdkcsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRGMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1FBRXhHLENBQUM7UUFFUSxHQUFHLENBQUMsT0FBaUI7WUFDN0IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxtREFBa0MsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUYsQ0FBQzs7SUFYVyw0Q0FBZ0I7K0JBQWhCLGdCQUFnQjtRQUtZLFdBQUEsMEJBQWUsQ0FBQTtPQUwzQyxnQkFBZ0IsQ0FZNUI7SUFFRCxNQUFhLGtCQUFtQixTQUFRLGlCQUFPO2lCQUU5QixPQUFFLEdBQUcsMkNBQTJDLENBQUM7aUJBQ2pELFVBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLHlCQUF5QixDQUFDLENBQUM7UUFFdEY7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ3pCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLHlCQUF5QixFQUFFO2dCQUMvRSxFQUFFLEVBQUUsSUFBSTtnQkFDUixRQUFRLEVBQUUsbUNBQVUsQ0FBQyxJQUFJO2FBQ3pCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQzVDLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUIsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsa0JBQVUseUNBQWlDLElBQUksQ0FBQyxDQUFDO1FBQy9GLENBQUM7O0lBakJGLGdEQWtCQztJQUVELE1BQWEsd0JBQXlCLFNBQVEsaUJBQU87aUJBRXBDLE9BQUUsR0FBRyxpREFBaUQsQ0FBQztpQkFDdkQsVUFBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUscUNBQXFDLENBQUMsQ0FBQztRQUU5RjtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsd0JBQXdCLENBQUMsRUFBRTtnQkFDL0IsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLHdCQUF3QixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUscUNBQXFDLEVBQUU7Z0JBQ2pHLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7YUFDekIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDNUMsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBZSxDQUFDLENBQUM7WUFDckQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxRQUFRLEdBQUcsK0JBQXNCLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSx5QkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3BJLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2QsY0FBYyxDQUFDLGNBQWMsQ0FBQyw2Q0FBNkIsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN4RSxDQUFDO1FBQ0YsQ0FBQzs7SUFyQkYsNERBc0JDO0lBRUQsTUFBYSw4QkFBK0IsU0FBUSxpQkFBTztpQkFFMUMsT0FBRSxHQUFHLGtEQUFrRCxDQUFDO2lCQUN4RCxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO1FBRTVHO1lBRUMsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw4QkFBOEIsQ0FBQyxFQUFFO2dCQUNyQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsOEJBQThCLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSx5Q0FBeUMsRUFBRTtnQkFDM0csRUFBRSxFQUFFLElBQUk7Z0JBQ1IsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsWUFBWSxFQUFFLDBDQUE0QjthQUMxQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1CQUFZLENBQUMsQ0FBQztZQUMvQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsQ0FBQztZQUUvQyxNQUFNLFlBQVksR0FBRywrQkFBc0IsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLGlCQUFpQixFQUFFLHlCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDeEksSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7b0JBQzNDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQy9FLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkNBQTZDLEVBQUUsc0RBQXNELENBQUMsQ0FBQyxDQUFDO2dCQUMxSSxDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7O0lBOUJGLHdFQStCQztJQUVELFNBQWdCLGdCQUFnQixDQUFDLFdBQXlCLEVBQUUsSUFBa0IsRUFBRSxJQUFZLEVBQUUsRUFBbUI7UUFDaEgsa0NBQWtDO1FBQ2xDLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuQyxvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDdEQsT0FBTztnQkFDTixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSx5Q0FBeUMsQ0FBQztnQkFDdEYsUUFBUSxFQUFFLHVCQUFRLENBQUMsS0FBSzthQUN4QixDQUFDO1FBQ0gsQ0FBQztRQUVELHNCQUFzQjtRQUN0QixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3pDLE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsOEJBQThCLEVBQUUsa0RBQWtELENBQUM7Z0JBQ3pHLFFBQVEsRUFBRSx1QkFBUSxDQUFDLEtBQUs7YUFDeEIsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFBLGlCQUFRLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFM0IsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hCLDBDQUEwQztZQUMxQyxNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDN0IsT0FBTztvQkFDTixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSwyRkFBMkYsRUFBRSxJQUFJLENBQUM7b0JBQy9JLFFBQVEsRUFBRSx1QkFBUSxDQUFDLEtBQUs7aUJBQ3hCLENBQUM7WUFDSCxDQUFDO1FBQ0YsQ0FBQztRQUVELCtCQUErQjtRQUMvQixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDNUYsc0JBQXNCO1lBQ3RCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0lBQWdJO1lBQ2hMLE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUseUZBQXlGLEVBQUUsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNuSyxRQUFRLEVBQUUsdUJBQVEsQ0FBQyxLQUFLO2FBQ3hCLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDOUMsT0FBTztnQkFDTixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxpRUFBaUUsQ0FBQztnQkFDckgsUUFBUSxFQUFFLHVCQUFRLENBQUMsT0FBTzthQUMxQixDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQXBERCw0Q0FvREM7SUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFZO1FBQ2pDLElBQUksSUFBSSxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUN4QixPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUNwQyxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsU0FBUyxxQkFBcUIsQ0FBQyxRQUFnQjtRQUM5QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDZixPQUFPLFFBQVEsQ0FBQztRQUNqQixDQUFDO1FBRUQsWUFBWTtRQUNaLFFBQVEsR0FBRyxJQUFBLGNBQUksRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFaEMsMEJBQTBCO1FBQzFCLFFBQVEsR0FBRyxJQUFBLGVBQUssRUFBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEMsUUFBUSxHQUFHLElBQUEsZUFBSyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVqQyxPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDO0lBRUQsTUFBYSxpQ0FBa0MsU0FBUSxpQkFBTztpQkFFN0MsT0FBRSxHQUFHLG9EQUFvRCxDQUFDO2lCQUMxRCxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO1FBRXZHO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxpQ0FBaUMsQ0FBQyxFQUFFO2dCQUN4QyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsaUNBQWlDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxpQ0FBaUMsRUFBRTtnQkFDdEcsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTthQUN6QixDQUFDLENBQUM7UUFDSixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUVuRCxNQUFNLGFBQWEsQ0FBQyxVQUFVLENBQUM7Z0JBQzlCLFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7Z0JBQ2pDLFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7Z0JBQ2pDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7YUFDekIsQ0FBQyxDQUFDO1FBQ0osQ0FBQzs7SUF0QkYsOEVBdUJDO0lBRUQsTUFBYSwwQkFBMkIsU0FBUSxpQkFBTztpQkFFdEMsT0FBRSxHQUFHLDZDQUE2QyxDQUFDO2lCQUNuRCxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO2lCQUdwRixtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUVsQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsMEJBQTBCLENBQUMsRUFBRTtnQkFDakMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLDBCQUEwQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsb0NBQW9DLEVBQUU7Z0JBQ2xHLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7Z0JBQ3pCLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFBLG1CQUFRLEVBQUMsaURBQTZCLHdCQUFlLEVBQUUsTUFBTSw2Q0FBbUMsRUFBRTthQUN6SCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztZQUNqRSxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUNBQWlCLENBQUMsQ0FBQztZQUN6RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsQ0FBQztZQUUvQyxNQUFNLFFBQVEsR0FBRywrQkFBc0IsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLGlCQUFpQixFQUFFLHlCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDcEksTUFBTSxNQUFNLEdBQUcsbUJBQW1CLDBCQUEwQixDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUM7WUFDaEYsSUFBSSxRQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUM3RixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7b0JBQ2hDLE1BQU0sUUFBUSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO29CQUMvRSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNqRyxDQUFDO2dCQUVELE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzFDLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRXRGLE1BQU0sYUFBYSxDQUFDLFVBQVUsQ0FBQztvQkFDOUIsUUFBUSxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO29CQUNqRCxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO29CQUNoQyxLQUFLLEVBQUUsV0FBVztvQkFDbEIsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtpQkFDekIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7b0JBQ2YsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUNuQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDO2dCQUN2QyxDQUFDLENBQUMsQ0FBQztZQUNKLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDO1FBQ3ZDLENBQUM7O0lBbERGLGdFQW1EQztJQUVELElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXdCO1FBQzdCLFlBQ3FDLGdCQUFtQyxFQUNwQyxlQUFpQyxFQUNwQyxZQUEyQjtZQUZ2QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3BDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNwQyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtRQUN4RCxDQUFDO1FBRUwsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQWE7WUFDckMsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsMkJBQTJCLENBQUMsUUFBUSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFeEgsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO0tBQ0QsQ0FBQTtJQWJLLHdCQUF3QjtRQUUzQixXQUFBLG9DQUFpQixDQUFBO1FBQ2pCLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSxxQkFBYSxDQUFBO09BSlYsd0JBQXdCLENBYTdCO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxtQkFBeUMsRUFBRSxLQUFjLEVBQUUsS0FBNkI7UUFDakgsbUJBQW1CLENBQUMsTUFBTSxDQUFDLHVCQUFRLENBQUMsS0FBSyxFQUFFLElBQUEsNkJBQWMsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQ3RFLENBQUM7Z0JBQ0EsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztnQkFDckMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRTthQUNsQixDQUFDLENBQ0YsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLFVBQVUscUJBQXFCLENBQUMsUUFBMEIsRUFBRSxRQUFpQjtRQUNqRixNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxDQUFDLENBQUM7UUFDL0MsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1FBQzFELE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzREFBMEIsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNEJBQWEsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBb0IsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3Q0FBbUIsQ0FBQyxDQUFDO1FBQzdELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQWUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO1FBRS9DLE1BQU0sU0FBUyxHQUFHLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxlQUFPLENBQUMsQ0FBQztRQUN2RCxNQUFNLElBQUksR0FBRyxNQUFNLFlBQVksQ0FBQyxRQUFRLENBQUMsZUFBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hELElBQUksU0FBUyxFQUFFLENBQUM7WUFDZixvREFBb0Q7WUFDcEQsTUFBTSxJQUFBLGVBQU8sRUFBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1gseUZBQXlGO1lBRXpGLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1lBQ3RELENBQUM7WUFFRCxPQUFPLGNBQWMsQ0FBQyxjQUFjLENBQUMsNENBQTRCLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRUQsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDckQsSUFBSSxNQUFvQixDQUFDO1FBQ3pCLElBQUksSUFBSSxFQUFFLENBQUM7WUFDVixNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlFLENBQUM7YUFBTSxDQUFDO1lBQ1AsTUFBTSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSwrQkFBZSxDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFekIsTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLEtBQWEsRUFBaUIsRUFBRTtZQUN4RCxJQUFJLENBQUM7Z0JBQ0osTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3BFLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUN6QixRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixDQUFDO2dCQUNELE1BQU0sZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksa0NBQWdCLENBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDOUcsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQztvQkFDOUQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQztvQkFDdEUsaUJBQWlCLEVBQUUsSUFBSTtpQkFDdkIsQ0FBQyxDQUFDO2dCQUNILE1BQU0sa0JBQWtCLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUVqRCxJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUNkLE1BQU0sZUFBZSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE1BQU0sYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRixDQUFDO1lBQ0YsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2hCLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN0RSxDQUFDO1FBQ0YsQ0FBQyxDQUFDO1FBRUYsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLGFBQUUsQ0FBQztRQUVqRSxNQUFNLGVBQWUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFO1lBQzFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzdFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNsQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM1QixNQUFNLGVBQWUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUNiLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbEIsQ0FBQztZQUNGLENBQUM7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsMkJBQWdCLENBQUMsZUFBZSxDQUFDO1FBQ2hDLEVBQUUsRUFBRSwyQkFBbUI7UUFDdkIsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRTtZQUMzQixNQUFNLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5QyxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsMkJBQWdCLENBQUMsZUFBZSxDQUFDO1FBQ2hDLEVBQUUsRUFBRSw2QkFBcUI7UUFDekIsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRTtZQUMzQixNQUFNLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUksTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUFFLFFBQTBCLEVBQUUsRUFBRTtRQUNqRSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1DQUFvQixDQUFDLENBQUM7UUFDL0QsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdDQUFtQixDQUFDLENBQUM7UUFDN0QsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBWSxDQUFDLENBQUM7UUFDL0MsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7UUFFakUsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDckQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1gsT0FBTztRQUNSLENBQUM7UUFFRCxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sa0JBQWtCLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksYUFBRSxDQUFDO1FBRWpFLE1BQU0sZUFBZSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7WUFDdkMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDMUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQ2xDLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQ2IsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU8sQ0FBQyxRQUFRLENBQUM7b0JBQzdDLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNqRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7d0JBQzVELElBQUksQ0FBQzs0QkFDSixNQUFNLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLGtDQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRTtnQ0FDMUYsaUJBQWlCLEVBQUUsb0JBQW9CLENBQUMsUUFBUSxFQUF1QixDQUFDLFFBQVEsQ0FBQyxXQUFXLDZDQUE2QjtnQ0FDekgsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUM7Z0NBQ2hGLGFBQWEsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDOzZCQUN4RixDQUFDLENBQUM7NEJBQ0gsTUFBTSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLENBQUM7d0JBQ2xELENBQUM7d0JBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQzs0QkFDWixtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzlCLENBQUM7b0JBQ0YsQ0FBQztnQkFDRixDQUFDO2dCQUNELE1BQU0sZUFBZSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0MsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQXJDVyxRQUFBLGFBQWEsaUJBcUN4QjtJQUVLLE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLFFBQTBCLEVBQUUsRUFBRTtRQUMxRSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RSxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsQixNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnREFBdUIsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUssQ0FBQztJQUNGLENBQUMsQ0FBQztJQU5XLFFBQUEsc0JBQXNCLDBCQU1qQztJQUVLLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLFFBQTBCLEVBQUUsRUFBRTtRQUNyRSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV0RSxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsQixNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnREFBdUIsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0ssQ0FBQztJQUNGLENBQUMsQ0FBQztJQVBXLFFBQUEsaUJBQWlCLHFCQU81QjtJQUVGLElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztJQUNyQixNQUFNLGVBQWUsR0FBRyxLQUFLLEVBQUUsUUFBMEIsRUFBRSxFQUFFO1FBQ25FLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN0QixNQUFNLGVBQWUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlDLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDekIsQ0FBQztJQUNGLENBQUMsQ0FBQztJQVBXLFFBQUEsZUFBZSxtQkFPMUI7SUFFSyxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsUUFBMEIsRUFBRSxFQUFFO1FBQ2xFLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN0QixNQUFNLGVBQWUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDeEIsQ0FBQztJQUNGLENBQUMsQ0FBQztJQVBXLFFBQUEsY0FBYyxrQkFPekI7SUFFRixNQUFNLG1CQUFtQixHQUFHLEtBQUssRUFBRSxRQUEwQixFQUFFLEVBQUU7UUFDaEUsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBb0IsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1FBRWpFLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1FBRXZFLE1BQU0sZUFBZSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywrQkFBWSxDQUFDLENBQUM7UUFFMUUsSUFBSSxDQUFDO1lBQ0osTUFBTSxlQUFlLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2hCLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVqQyxNQUFNLEtBQUssQ0FBQztRQUNiLENBQUM7SUFDRixDQUFDLENBQUM7SUFFRiwyQkFBZ0IsQ0FBQyxlQUFlLENBQUM7UUFDaEMsRUFBRSxFQUFFLDJCQUFtQjtRQUN2QixPQUFPLEVBQUUsbUJBQW1CO0tBQzVCLENBQUMsQ0FBQztJQUVILE1BQU0saUJBQWlCLEdBQUcsS0FBSyxFQUFFLFFBQTBCLEVBQUUsRUFBRTtRQUM5RCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1DQUFvQixDQUFDLENBQUM7UUFDL0QsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7UUFFakUsTUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdkUsSUFBSSxDQUFDO1lBQ0osTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLG1CQUFhLEdBQUUsQ0FBQztZQUNwQyxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUNYLE1BQU0sYUFBYSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxvQ0FBaUIsQ0FBQyxDQUFDO2dCQUM3RSxNQUFNLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVDLENBQUM7UUFDRixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNoQixtQkFBbUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFakMsTUFBTSxLQUFLLENBQUM7UUFDYixDQUFDO0lBQ0YsQ0FBQyxDQUFDO0lBRUYsMkJBQWdCLENBQUMsZUFBZSxDQUFDO1FBQ2hDLEVBQUUsRUFBRSx5QkFBaUI7UUFDckIsT0FBTyxFQUFFLGlCQUFpQjtLQUMxQixDQUFDLENBQUM7SUFFSSxNQUFNLGdCQUFnQixHQUFHLEtBQUssRUFBRSxRQUEwQixFQUFFLFFBQW1CLEVBQUUsRUFBRTtRQUN6RixNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0NBQWlCLENBQUMsQ0FBQztRQUN6RCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxDQUFDLENBQUM7UUFDL0MsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1DQUFvQixDQUFDLENBQUM7UUFDL0QsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7UUFDbkQsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7UUFDakUsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGlDQUFtQixDQUFDLENBQUM7UUFDN0QsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBYyxDQUFDLENBQUM7UUFFbkQsTUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxNQUFNLHFCQUFxQixHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUM5RCxNQUFNLGtCQUFrQixHQUFHLHFCQUFxQixJQUFJLG9CQUFvQixDQUFDLFFBQVEsQ0FBVSw2QkFBNkIsQ0FBQyxDQUFDO1FBRTFILE1BQU0sT0FBTyxHQUFHLE1BQU0sZUFBZSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRWxFLElBQUksa0JBQWtCLElBQUksT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNoRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLHlEQUF5RCxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNwSCxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLHVDQUF1QyxFQUFFLElBQUEsZUFBUSxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzFHLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLDZCQUFtQixFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDN0UsTUFBTSxZQUFZLEdBQUcsTUFBTSxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUNoRCxPQUFPO2dCQUNQLE1BQU07Z0JBQ04sUUFBUSxFQUFFO29CQUNULEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQztpQkFDM0Q7Z0JBQ0QsYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQzthQUN2RyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1IsQ0FBQztZQUVELGtDQUFrQztZQUNsQyxJQUFJLFlBQVksQ0FBQyxlQUFlLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzNDLE1BQU0sb0JBQW9CLENBQUMsV0FBVyxDQUFDLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlFLENBQUM7UUFDRixDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0saUJBQWlCLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxFQUF1QixDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztRQUUxRyxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkQsNENBQTRDO1FBQzVDLElBQUksWUFBWSxFQUFFLENBQUM7WUFDbEIsT0FBTztRQUNSLENBQUM7UUFFRCxJQUFJLENBQUM7WUFDSiwrQ0FBK0M7WUFDL0MsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLGlCQUFRLEVBQUMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLFdBQVcsRUFBQyxFQUFFO2dCQUVwRixJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDO29CQUN4SCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsd0RBQXdELENBQUMsQ0FBQyxDQUFDO2dCQUMzRyxDQUFDO2dCQUNELE1BQU0sZUFBZSxHQUFHLE1BQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFNUQsY0FBYztnQkFDZCxJQUFJLE1BQW9CLENBQUM7Z0JBQ3pCLElBQUksa0JBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUM7b0JBQ3RFLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTyxDQUFDO2dCQUMxQixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU8sQ0FBQztnQkFDMUQsQ0FBQztnQkFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLHdCQUF3QixDQUNoRCxlQUFlLEVBQ2YsV0FBVyxFQUNYLGFBQWEsRUFDYixNQUFNLEVBQ04sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxlQUFlLENBQUMsV0FBVyxFQUFFLGNBQWMsRUFBRSxlQUFlLElBQUksaUJBQWlCLEtBQUssVUFBVSxFQUFFLEVBQ3hJLGlCQUFpQixDQUNqQixDQUFDO2dCQUVGLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDakIsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUM7Z0JBRUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDO1lBQ3BELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVMLElBQUksaUJBQWlCLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNuQyxpQkFBaUI7Z0JBQ2pCLElBQUksZUFBZSxFQUFFLENBQUM7b0JBQ3JCLE1BQU0saUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxrQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEtBQUssVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN6SixNQUFNLE9BQU8sR0FBRzt3QkFDZixpQkFBaUIsRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLEVBQXVCLENBQUMsUUFBUSxDQUFDLFdBQVcsNkNBQTZCO3dCQUN6SCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyxpRUFBaUUsQ0FBQyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxDQUFDOzRCQUNoTixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxvQkFBb0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyw2REFBNkQsQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDbE0sU0FBUyxFQUFFLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLGlFQUFpRSxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7NEJBQ3hNLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxDQUFDLDZEQUE2RCxDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUM5TCxDQUFDO29CQUNGLE1BQU0sZUFBZSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDakUsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE1BQU0saUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxrQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsS0FBSyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3JLLE1BQU0sU0FBUyxHQUFHLG9CQUFvQixDQUFDLFFBQVEsRUFBdUIsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO29CQUM1RixNQUFNLE9BQU8sR0FBRzt3QkFDZixpQkFBaUIsRUFBRSxTQUFTLDZDQUE2QixJQUFJLFNBQVMsNkNBQTZCO3dCQUNuRyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsQ0FBQyxrRUFBa0UsQ0FBQyxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxDQUFDOzRCQUNuTixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxPQUFPLEVBQUUsQ0FBQyw4REFBOEQsQ0FBQyxFQUFFLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDck0sU0FBUyxFQUFFLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLGtFQUFrRSxDQUFDLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7NEJBQzFNLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxDQUFDLDhEQUE4RCxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUNoTSxDQUFDO29CQUNGLE1BQU0sZUFBZSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDakUsQ0FBQztnQkFFRCxNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ3BDLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN0RCxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDL0IsTUFBTSxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUM3RyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDWixPQUFPLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsNEVBQTRFLEVBQUUsSUFBQSx3QkFBZSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hLLENBQUM7Z0JBQVMsQ0FBQztZQUNWLElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQ3JCLDZDQUE2QztnQkFDN0MsTUFBTSxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0MsZUFBZSxHQUFHLEtBQUssQ0FBQztZQUN6QixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUMsQ0FBQztJQTVIVyxRQUFBLGdCQUFnQixvQkE0SDNCO0lBRUYsS0FBSyxVQUFVLGVBQWUsQ0FBQyxRQUE4QixFQUFFLGdCQUFtQztRQUNqRyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3JDLHFFQUFxRTtZQUNyRSxPQUFPLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFBLGlCQUFVLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM1RyxDQUFDO2FBQU0sQ0FBQztZQUNQLHdFQUF3RTtZQUN4RSxPQUFPLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7SUFDRixDQUFDO0lBRU0sTUFBTSw0QkFBNEIsR0FBRyxLQUFLLEVBQUUsUUFBMEIsRUFBRSxFQUFFO1FBQ2hGLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9DLE1BQU0sYUFBYSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMzRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7WUFDcEIsT0FBTyxFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRTtTQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQyxDQUFDO0lBVFcsUUFBQSw0QkFBNEIsZ0NBU3ZDO0lBRUYsTUFBTSxvQ0FBcUMsU0FBUSxpQkFBTztRQUV6RCxZQUNDLEVBQVUsRUFDVixLQUF1QixFQUNOLGdCQUFtRDtZQUVwRSxLQUFLLENBQUM7Z0JBQ0wsRUFBRTtnQkFDRixLQUFLO2dCQUNMLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7Z0JBQ3pCLFlBQVksRUFBRSxrREFBb0M7YUFDbEQsQ0FBQyxDQUFDO1lBUmMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQztRQVNyRSxDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLHlCQUF5QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0RBQTBCLENBQUMsQ0FBQztZQUUzRSxNQUFNLFlBQVksR0FBRywrQkFBc0IsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLGlCQUFpQixFQUFFLHlCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDeEksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNuQixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0seUJBQXlCLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNyRixDQUFDO0tBQ0Q7SUFFRCxNQUFhLGdDQUFpQyxTQUFRLG9DQUFvQztpQkFFekUsT0FBRSxHQUFHLHlEQUF5RCxDQUFDO2lCQUMvRCxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO1FBRW5IO1lBQ0MsS0FBSyxDQUNKLGdDQUFnQyxDQUFDLEVBQUUsRUFDbkMsRUFBRSxLQUFLLEVBQUUsZ0NBQWdDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSx1Q0FBdUMsRUFBRSxFQUNwRyxJQUFJLENBQ0osQ0FBQztRQUNILENBQUM7O0lBWEYsNEVBWUM7SUFFRCxNQUFhLGlDQUFrQyxTQUFRLG9DQUFvQztpQkFFMUUsT0FBRSxHQUFHLDBEQUEwRCxDQUFDO2lCQUNoRSxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQ0FBbUMsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO1FBRXBIO1lBQ0MsS0FBSyxDQUNKLGlDQUFpQyxDQUFDLEVBQUUsRUFDcEMsRUFBRSxLQUFLLEVBQUUsaUNBQWlDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSx3Q0FBd0MsRUFBRSxFQUN0RyxLQUFLLENBQ0wsQ0FBQztRQUNILENBQUM7O0lBWEYsOEVBWUM7SUFFRCxNQUFhLG1DQUFvQyxTQUFRLG9DQUFvQztpQkFFNUUsT0FBRSxHQUFHLDREQUE0RCxDQUFDO2lCQUNsRSxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSwyQ0FBMkMsQ0FBQyxDQUFDO1FBRXpIO1lBQ0MsS0FBSyxDQUNKLG1DQUFtQyxDQUFDLEVBQUUsRUFDdEMsRUFBRSxLQUFLLEVBQUUsbUNBQW1DLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSwwQ0FBMEMsRUFBRSxFQUMxRyxRQUFRLENBQ1IsQ0FBQztRQUNILENBQUM7O0lBWEYsa0ZBWUM7SUFFRCxNQUFhLGtDQUFtQyxTQUFRLG9DQUFvQztpQkFFM0UsT0FBRSxHQUFHLDJEQUEyRCxDQUFDO2lCQUNqRSxVQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRSwwQ0FBMEMsQ0FBQyxDQUFDO1FBRXZIO1lBQ0MsS0FBSyxDQUNKLGtDQUFrQyxDQUFDLEVBQUUsRUFDckMsRUFBRSxLQUFLLEVBQUUsa0NBQWtDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSx5Q0FBeUMsRUFBRSxFQUN4RyxPQUFPLENBQ1AsQ0FBQztRQUNILENBQUM7O0lBWEYsZ0ZBWUMifQ==