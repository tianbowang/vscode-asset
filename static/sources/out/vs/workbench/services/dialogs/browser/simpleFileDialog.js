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
define(["require", "exports", "vs/nls", "vs/base/common/resources", "vs/base/common/objects", "vs/platform/files/common/files", "vs/platform/quickinput/common/quickInput", "vs/base/common/uri", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/platform/label/common/label", "vs/platform/workspace/common/workspace", "vs/platform/notification/common/notification", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/getIconClasses", "vs/base/common/network", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/contextkey/common/contextkey", "vs/base/common/strings", "vs/platform/keybinding/common/keybinding", "vs/base/common/extpath", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/async", "vs/workbench/services/editor/common/editorService", "vs/base/common/labels", "vs/workbench/services/path/common/pathService", "vs/platform/accessibility/common/accessibility", "vs/base/browser/dom"], function (require, exports, nls, resources, objects, files_1, quickInput_1, uri_1, platform_1, dialogs_1, label_1, workspace_1, notification_1, model_1, language_1, getIconClasses_1, network_1, environmentService_1, remoteAgentService_1, contextkey_1, strings_1, keybinding_1, extpath_1, event_1, lifecycle_1, async_1, editorService_1, labels_1, pathService_1, accessibility_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleFileDialog = exports.RemoteFileDialogContext = exports.OpenLocalFileFolderCommand = exports.OpenLocalFolderCommand = exports.SaveLocalFileCommand = exports.OpenLocalFileCommand = void 0;
    var OpenLocalFileCommand;
    (function (OpenLocalFileCommand) {
        OpenLocalFileCommand.ID = 'workbench.action.files.openLocalFile';
        OpenLocalFileCommand.LABEL = nls.localize('openLocalFile', "Open Local File...");
        function handler() {
            return accessor => {
                const dialogService = accessor.get(dialogs_1.IFileDialogService);
                return dialogService.pickFileAndOpen({ forceNewWindow: false, availableFileSystems: [network_1.Schemas.file] });
            };
        }
        OpenLocalFileCommand.handler = handler;
    })(OpenLocalFileCommand || (exports.OpenLocalFileCommand = OpenLocalFileCommand = {}));
    var SaveLocalFileCommand;
    (function (SaveLocalFileCommand) {
        SaveLocalFileCommand.ID = 'workbench.action.files.saveLocalFile';
        SaveLocalFileCommand.LABEL = nls.localize('saveLocalFile', "Save Local File...");
        function handler() {
            return accessor => {
                const editorService = accessor.get(editorService_1.IEditorService);
                const activeEditorPane = editorService.activeEditorPane;
                if (activeEditorPane) {
                    return editorService.save({ groupId: activeEditorPane.group.id, editor: activeEditorPane.input }, { saveAs: true, availableFileSystems: [network_1.Schemas.file], reason: 1 /* SaveReason.EXPLICIT */ });
                }
                return Promise.resolve(undefined);
            };
        }
        SaveLocalFileCommand.handler = handler;
    })(SaveLocalFileCommand || (exports.SaveLocalFileCommand = SaveLocalFileCommand = {}));
    var OpenLocalFolderCommand;
    (function (OpenLocalFolderCommand) {
        OpenLocalFolderCommand.ID = 'workbench.action.files.openLocalFolder';
        OpenLocalFolderCommand.LABEL = nls.localize('openLocalFolder', "Open Local Folder...");
        function handler() {
            return accessor => {
                const dialogService = accessor.get(dialogs_1.IFileDialogService);
                return dialogService.pickFolderAndOpen({ forceNewWindow: false, availableFileSystems: [network_1.Schemas.file] });
            };
        }
        OpenLocalFolderCommand.handler = handler;
    })(OpenLocalFolderCommand || (exports.OpenLocalFolderCommand = OpenLocalFolderCommand = {}));
    var OpenLocalFileFolderCommand;
    (function (OpenLocalFileFolderCommand) {
        OpenLocalFileFolderCommand.ID = 'workbench.action.files.openLocalFileFolder';
        OpenLocalFileFolderCommand.LABEL = nls.localize('openLocalFileFolder', "Open Local...");
        function handler() {
            return accessor => {
                const dialogService = accessor.get(dialogs_1.IFileDialogService);
                return dialogService.pickFileFolderAndOpen({ forceNewWindow: false, availableFileSystems: [network_1.Schemas.file] });
            };
        }
        OpenLocalFileFolderCommand.handler = handler;
    })(OpenLocalFileFolderCommand || (exports.OpenLocalFileFolderCommand = OpenLocalFileFolderCommand = {}));
    var UpdateResult;
    (function (UpdateResult) {
        UpdateResult[UpdateResult["Updated"] = 0] = "Updated";
        UpdateResult[UpdateResult["UpdatedWithTrailing"] = 1] = "UpdatedWithTrailing";
        UpdateResult[UpdateResult["Updating"] = 2] = "Updating";
        UpdateResult[UpdateResult["NotUpdated"] = 3] = "NotUpdated";
        UpdateResult[UpdateResult["InvalidPath"] = 4] = "InvalidPath";
    })(UpdateResult || (UpdateResult = {}));
    exports.RemoteFileDialogContext = new contextkey_1.RawContextKey('remoteFileDialogVisible', false);
    let SimpleFileDialog = class SimpleFileDialog {
        constructor(fileService, quickInputService, labelService, workspaceContextService, notificationService, fileDialogService, modelService, languageService, environmentService, remoteAgentService, pathService, keybindingService, contextKeyService, accessibilityService) {
            this.fileService = fileService;
            this.quickInputService = quickInputService;
            this.labelService = labelService;
            this.workspaceContextService = workspaceContextService;
            this.notificationService = notificationService;
            this.fileDialogService = fileDialogService;
            this.modelService = modelService;
            this.languageService = languageService;
            this.environmentService = environmentService;
            this.remoteAgentService = remoteAgentService;
            this.pathService = pathService;
            this.keybindingService = keybindingService;
            this.accessibilityService = accessibilityService;
            this.hidden = false;
            this.allowFileSelection = true;
            this.allowFolderSelection = false;
            this.requiresTrailing = false;
            this.userEnteredPathSegment = '';
            this.autoCompletePathSegment = '';
            this.isWindows = false;
            this.separator = '/';
            this.onBusyChangeEmitter = new event_1.Emitter();
            this.disposables = [
                this.onBusyChangeEmitter
            ];
            this.remoteAuthority = this.environmentService.remoteAuthority;
            this.contextKey = exports.RemoteFileDialogContext.bindTo(contextKeyService);
            this.scheme = this.pathService.defaultUriScheme;
        }
        set busy(busy) {
            if (this.filePickBox.busy !== busy) {
                this.filePickBox.busy = busy;
                this.onBusyChangeEmitter.fire(busy);
            }
        }
        get busy() {
            return this.filePickBox.busy;
        }
        async showOpenDialog(options = {}) {
            this.scheme = this.getScheme(options.availableFileSystems, options.defaultUri);
            this.userHome = await this.getUserHome();
            this.trueHome = await this.getUserHome(true);
            const newOptions = this.getOptions(options);
            if (!newOptions) {
                return Promise.resolve(undefined);
            }
            this.options = newOptions;
            return this.pickResource();
        }
        async showSaveDialog(options) {
            this.scheme = this.getScheme(options.availableFileSystems, options.defaultUri);
            this.userHome = await this.getUserHome();
            this.trueHome = await this.getUserHome(true);
            this.requiresTrailing = true;
            const newOptions = this.getOptions(options, true);
            if (!newOptions) {
                return Promise.resolve(undefined);
            }
            this.options = newOptions;
            this.options.canSelectFolders = true;
            this.options.canSelectFiles = true;
            return new Promise((resolve) => {
                this.pickResource(true).then(folderUri => {
                    resolve(folderUri);
                });
            });
        }
        getOptions(options, isSave = false) {
            let defaultUri = undefined;
            let filename = undefined;
            if (options.defaultUri) {
                defaultUri = (this.scheme === options.defaultUri.scheme) ? options.defaultUri : undefined;
                filename = isSave ? resources.basename(options.defaultUri) : undefined;
            }
            if (!defaultUri) {
                defaultUri = this.userHome;
                if (filename) {
                    defaultUri = resources.joinPath(defaultUri, filename);
                }
            }
            if ((this.scheme !== network_1.Schemas.file) && !this.fileService.hasProvider(defaultUri)) {
                this.notificationService.info(nls.localize('remoteFileDialog.notConnectedToRemote', 'File system provider for {0} is not available.', defaultUri.toString()));
                return undefined;
            }
            const newOptions = objects.deepClone(options);
            newOptions.defaultUri = defaultUri;
            return newOptions;
        }
        remoteUriFrom(path, hintUri) {
            if (!path.startsWith('\\\\')) {
                path = path.replace(/\\/g, '/');
            }
            const uri = this.scheme === network_1.Schemas.file ? uri_1.URI.file(path) : uri_1.URI.from({ scheme: this.scheme, path, query: hintUri?.query, fragment: hintUri?.fragment });
            // If the default scheme is file, then we don't care about the remote authority or the hint authority
            const authority = (uri.scheme === network_1.Schemas.file) ? undefined : (this.remoteAuthority ?? hintUri?.authority);
            return resources.toLocalResource(uri, authority, 
            // If there is a remote authority, then we should use the system's default URI as the local scheme.
            // If there is *no* remote authority, then we should use the default scheme for this dialog as that is already local.
            authority ? this.pathService.defaultUriScheme : uri.scheme);
        }
        getScheme(available, defaultUri) {
            if (available && available.length > 0) {
                if (defaultUri && (available.indexOf(defaultUri.scheme) >= 0)) {
                    return defaultUri.scheme;
                }
                return available[0];
            }
            else if (defaultUri) {
                return defaultUri.scheme;
            }
            return network_1.Schemas.file;
        }
        async getRemoteAgentEnvironment() {
            if (this.remoteAgentEnvironment === undefined) {
                this.remoteAgentEnvironment = await this.remoteAgentService.getEnvironment();
            }
            return this.remoteAgentEnvironment;
        }
        getUserHome(trueHome = false) {
            return trueHome
                ? this.pathService.userHome({ preferLocal: this.scheme === network_1.Schemas.file })
                : this.fileDialogService.preferredHome(this.scheme);
        }
        async pickResource(isSave = false) {
            this.allowFolderSelection = !!this.options.canSelectFolders;
            this.allowFileSelection = !!this.options.canSelectFiles;
            this.separator = this.labelService.getSeparator(this.scheme, this.remoteAuthority);
            this.hidden = false;
            this.isWindows = await this.checkIsWindowsOS();
            let homedir = this.options.defaultUri ? this.options.defaultUri : this.workspaceContextService.getWorkspace().folders[0].uri;
            let stat;
            const ext = resources.extname(homedir);
            if (this.options.defaultUri) {
                try {
                    stat = await this.fileService.stat(this.options.defaultUri);
                }
                catch (e) {
                    // The file or folder doesn't exist
                }
                if (!stat || !stat.isDirectory) {
                    homedir = resources.dirname(this.options.defaultUri);
                    this.trailing = resources.basename(this.options.defaultUri);
                }
            }
            return new Promise((resolve) => {
                this.filePickBox = this.quickInputService.createQuickPick();
                this.busy = true;
                this.filePickBox.matchOnLabel = false;
                this.filePickBox.sortByLabel = false;
                this.filePickBox.ignoreFocusOut = true;
                this.filePickBox.ok = true;
                if ((this.scheme !== network_1.Schemas.file) && this.options && this.options.availableFileSystems && (this.options.availableFileSystems.length > 1) && (this.options.availableFileSystems.indexOf(network_1.Schemas.file) > -1)) {
                    this.filePickBox.customButton = true;
                    this.filePickBox.customLabel = nls.localize('remoteFileDialog.local', 'Show Local');
                    let action;
                    if (isSave) {
                        action = SaveLocalFileCommand;
                    }
                    else {
                        action = this.allowFileSelection ? (this.allowFolderSelection ? OpenLocalFileFolderCommand : OpenLocalFileCommand) : OpenLocalFolderCommand;
                    }
                    const keybinding = this.keybindingService.lookupKeybinding(action.ID);
                    if (keybinding) {
                        const label = keybinding.getLabel();
                        if (label) {
                            this.filePickBox.customHover = (0, strings_1.format)('{0} ({1})', action.LABEL, label);
                        }
                    }
                }
                let isResolving = 0;
                let isAcceptHandled = false;
                this.currentFolder = resources.dirname(homedir);
                this.userEnteredPathSegment = '';
                this.autoCompletePathSegment = '';
                this.filePickBox.title = this.options.title;
                this.filePickBox.value = this.pathFromUri(this.currentFolder, true);
                this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
                function doResolve(dialog, uri) {
                    if (uri) {
                        uri = resources.addTrailingPathSeparator(uri, dialog.separator); // Ensures that c: is c:/ since this comes from user input and can be incorrect.
                        // To be consistent, we should never have a trailing path separator on directories (or anything else). Will not remove from c:/.
                        uri = resources.removeTrailingPathSeparator(uri);
                    }
                    resolve(uri);
                    dialog.contextKey.set(false);
                    dialog.filePickBox.dispose();
                    (0, lifecycle_1.dispose)(dialog.disposables);
                }
                this.filePickBox.onDidCustom(() => {
                    if (isAcceptHandled || this.busy) {
                        return;
                    }
                    isAcceptHandled = true;
                    isResolving++;
                    if (this.options.availableFileSystems && (this.options.availableFileSystems.length > 1)) {
                        this.options.availableFileSystems = this.options.availableFileSystems.slice(1);
                    }
                    this.filePickBox.hide();
                    if (isSave) {
                        return this.fileDialogService.showSaveDialog(this.options).then(result => {
                            doResolve(this, result);
                        });
                    }
                    else {
                        return this.fileDialogService.showOpenDialog(this.options).then(result => {
                            doResolve(this, result ? result[0] : undefined);
                        });
                    }
                });
                function handleAccept(dialog) {
                    if (dialog.busy) {
                        // Save the accept until the file picker is not busy.
                        dialog.onBusyChangeEmitter.event((busy) => {
                            if (!busy) {
                                handleAccept(dialog);
                            }
                        });
                        return;
                    }
                    else if (isAcceptHandled) {
                        return;
                    }
                    isAcceptHandled = true;
                    isResolving++;
                    dialog.onDidAccept().then(resolveValue => {
                        if (resolveValue) {
                            dialog.filePickBox.hide();
                            doResolve(dialog, resolveValue);
                        }
                        else if (dialog.hidden) {
                            doResolve(dialog, undefined);
                        }
                        else {
                            isResolving--;
                            isAcceptHandled = false;
                        }
                    });
                }
                this.filePickBox.onDidAccept(_ => {
                    handleAccept(this);
                });
                this.filePickBox.onDidChangeActive(i => {
                    isAcceptHandled = false;
                    // update input box to match the first selected item
                    if ((i.length === 1) && this.isSelectionChangeFromUser()) {
                        this.filePickBox.validationMessage = undefined;
                        const userPath = this.constructFullUserPath();
                        if (!(0, strings_1.equalsIgnoreCase)(this.filePickBox.value.substring(0, userPath.length), userPath)) {
                            this.filePickBox.valueSelection = [0, this.filePickBox.value.length];
                            this.insertText(userPath, userPath);
                        }
                        this.setAutoComplete(userPath, this.userEnteredPathSegment, i[0], true);
                    }
                });
                this.filePickBox.onDidChangeValue(async (value) => {
                    return this.handleValueChange(value);
                });
                this.filePickBox.onDidHide(() => {
                    this.hidden = true;
                    if (isResolving === 0) {
                        doResolve(this, undefined);
                    }
                });
                this.filePickBox.show();
                this.contextKey.set(true);
                this.updateItems(homedir, true, this.trailing).then(() => {
                    if (this.trailing) {
                        this.filePickBox.valueSelection = [this.filePickBox.value.length - this.trailing.length, this.filePickBox.value.length - ext.length];
                    }
                    else {
                        this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
                    }
                    this.busy = false;
                });
            });
        }
        async handleValueChange(value) {
            try {
                // onDidChangeValue can also be triggered by the auto complete, so if it looks like the auto complete, don't do anything
                if (this.isValueChangeFromUser()) {
                    // If the user has just entered more bad path, don't change anything
                    if (!(0, strings_1.equalsIgnoreCase)(value, this.constructFullUserPath()) && !this.isBadSubpath(value)) {
                        this.filePickBox.validationMessage = undefined;
                        const filePickBoxUri = this.filePickBoxValue();
                        let updated = UpdateResult.NotUpdated;
                        if (!resources.extUriIgnorePathCase.isEqual(this.currentFolder, filePickBoxUri)) {
                            updated = await this.tryUpdateItems(value, filePickBoxUri);
                        }
                        if ((updated === UpdateResult.NotUpdated) || (updated === UpdateResult.UpdatedWithTrailing)) {
                            this.setActiveItems(value);
                        }
                    }
                    else {
                        this.filePickBox.activeItems = [];
                        this.userEnteredPathSegment = '';
                    }
                }
            }
            catch {
                // Since any text can be entered in the input box, there is potential for error causing input. If this happens, do nothing.
            }
        }
        isBadSubpath(value) {
            return this.badPath && (value.length > this.badPath.length) && (0, strings_1.equalsIgnoreCase)(value.substring(0, this.badPath.length), this.badPath);
        }
        isValueChangeFromUser() {
            if ((0, strings_1.equalsIgnoreCase)(this.filePickBox.value, this.pathAppend(this.currentFolder, this.userEnteredPathSegment + this.autoCompletePathSegment))) {
                return false;
            }
            return true;
        }
        isSelectionChangeFromUser() {
            if (this.activeItem === (this.filePickBox.activeItems ? this.filePickBox.activeItems[0] : undefined)) {
                return false;
            }
            return true;
        }
        constructFullUserPath() {
            const currentFolderPath = this.pathFromUri(this.currentFolder);
            if ((0, strings_1.equalsIgnoreCase)(this.filePickBox.value.substr(0, this.userEnteredPathSegment.length), this.userEnteredPathSegment)) {
                if ((0, strings_1.equalsIgnoreCase)(this.filePickBox.value.substr(0, currentFolderPath.length), currentFolderPath)) {
                    return currentFolderPath;
                }
                else {
                    return this.userEnteredPathSegment;
                }
            }
            else {
                return this.pathAppend(this.currentFolder, this.userEnteredPathSegment);
            }
        }
        filePickBoxValue() {
            // The file pick box can't render everything, so we use the current folder to create the uri so that it is an existing path.
            const directUri = this.remoteUriFrom(this.filePickBox.value.trimRight(), this.currentFolder);
            const currentPath = this.pathFromUri(this.currentFolder);
            if ((0, strings_1.equalsIgnoreCase)(this.filePickBox.value, currentPath)) {
                return this.currentFolder;
            }
            const currentDisplayUri = this.remoteUriFrom(currentPath, this.currentFolder);
            const relativePath = resources.relativePath(currentDisplayUri, directUri);
            const isSameRoot = (this.filePickBox.value.length > 1 && currentPath.length > 1) ? (0, strings_1.equalsIgnoreCase)(this.filePickBox.value.substr(0, 2), currentPath.substr(0, 2)) : false;
            if (relativePath && isSameRoot) {
                let path = resources.joinPath(this.currentFolder, relativePath);
                const directBasename = resources.basename(directUri);
                if ((directBasename === '.') || (directBasename === '..')) {
                    path = this.remoteUriFrom(this.pathAppend(path, directBasename), this.currentFolder);
                }
                return resources.hasTrailingPathSeparator(directUri) ? resources.addTrailingPathSeparator(path) : path;
            }
            else {
                return directUri;
            }
        }
        async onDidAccept() {
            this.busy = true;
            if (this.filePickBox.activeItems.length === 1) {
                const item = this.filePickBox.selectedItems[0];
                if (item.isFolder) {
                    if (this.trailing) {
                        await this.updateItems(item.uri, true, this.trailing);
                    }
                    else {
                        // When possible, cause the update to happen by modifying the input box.
                        // This allows all input box updates to happen first, and uses the same code path as the user typing.
                        const newPath = this.pathFromUri(item.uri);
                        if ((0, strings_1.startsWithIgnoreCase)(newPath, this.filePickBox.value) && ((0, strings_1.equalsIgnoreCase)(item.label, resources.basename(item.uri)))) {
                            this.filePickBox.valueSelection = [this.pathFromUri(this.currentFolder).length, this.filePickBox.value.length];
                            this.insertText(newPath, this.basenameWithTrailingSlash(item.uri));
                        }
                        else if ((item.label === '..') && (0, strings_1.startsWithIgnoreCase)(this.filePickBox.value, newPath)) {
                            this.filePickBox.valueSelection = [newPath.length, this.filePickBox.value.length];
                            this.insertText(newPath, '');
                        }
                        else {
                            await this.updateItems(item.uri, true);
                        }
                    }
                    this.filePickBox.busy = false;
                    return;
                }
            }
            else {
                // If the items have updated, don't try to resolve
                if ((await this.tryUpdateItems(this.filePickBox.value, this.filePickBoxValue())) !== UpdateResult.NotUpdated) {
                    this.filePickBox.busy = false;
                    return;
                }
            }
            let resolveValue;
            // Find resolve value
            if (this.filePickBox.activeItems.length === 0) {
                resolveValue = this.filePickBoxValue();
            }
            else if (this.filePickBox.activeItems.length === 1) {
                resolveValue = this.filePickBox.selectedItems[0].uri;
            }
            if (resolveValue) {
                resolveValue = this.addPostfix(resolveValue);
            }
            if (await this.validate(resolveValue)) {
                this.busy = false;
                return resolveValue;
            }
            this.busy = false;
            return undefined;
        }
        root(value) {
            let lastDir = value;
            let dir = resources.dirname(value);
            while (!resources.isEqual(lastDir, dir)) {
                lastDir = dir;
                dir = resources.dirname(dir);
            }
            return dir;
        }
        tildaReplace(value) {
            const home = this.trueHome;
            if ((value.length > 0) && (value[0] === '~')) {
                return resources.joinPath(home, value.substring(1));
            }
            return this.remoteUriFrom(value);
        }
        tryAddTrailingSeparatorToDirectory(uri, stat) {
            if (stat.isDirectory) {
                // At this point we know it's a directory and can add the trailing path separator
                if (!this.endsWithSlash(uri.path)) {
                    return resources.addTrailingPathSeparator(uri);
                }
            }
            return uri;
        }
        async tryUpdateItems(value, valueUri) {
            if ((value.length > 0) && (value[0] === '~')) {
                const newDir = this.tildaReplace(value);
                return await this.updateItems(newDir, true) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
            }
            else if (value === '\\') {
                valueUri = this.root(this.currentFolder);
                value = this.pathFromUri(valueUri);
                return await this.updateItems(valueUri, true) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
            }
            else if (!resources.extUriIgnorePathCase.isEqual(this.currentFolder, valueUri) && (this.endsWithSlash(value) || (!resources.extUriIgnorePathCase.isEqual(this.currentFolder, resources.dirname(valueUri)) && resources.extUriIgnorePathCase.isEqualOrParent(this.currentFolder, resources.dirname(valueUri))))) {
                let stat;
                try {
                    stat = await this.fileService.stat(valueUri);
                }
                catch (e) {
                    // do nothing
                }
                if (stat && stat.isDirectory && (resources.basename(valueUri) !== '.') && this.endsWithSlash(value)) {
                    valueUri = this.tryAddTrailingSeparatorToDirectory(valueUri, stat);
                    return await this.updateItems(valueUri) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
                }
                else if (this.endsWithSlash(value)) {
                    // The input box contains a path that doesn't exist on the system.
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.badPath', 'The path does not exist.');
                    // Save this bad path. It can take too long to a stat on every user entered character, but once a user enters a bad path they are likely
                    // to keep typing more bad path. We can compare against this bad path and see if the user entered path starts with it.
                    this.badPath = value;
                    return UpdateResult.InvalidPath;
                }
                else {
                    let inputUriDirname = resources.dirname(valueUri);
                    const currentFolderWithoutSep = resources.removeTrailingPathSeparator(resources.addTrailingPathSeparator(this.currentFolder));
                    const inputUriDirnameWithoutSep = resources.removeTrailingPathSeparator(resources.addTrailingPathSeparator(inputUriDirname));
                    if (!resources.extUriIgnorePathCase.isEqual(currentFolderWithoutSep, inputUriDirnameWithoutSep)
                        && (!/^[a-zA-Z]:$/.test(this.filePickBox.value)
                            || !(0, strings_1.equalsIgnoreCase)(this.pathFromUri(this.currentFolder).substring(0, this.filePickBox.value.length), this.filePickBox.value))) {
                        let statWithoutTrailing;
                        try {
                            statWithoutTrailing = await this.fileService.stat(inputUriDirname);
                        }
                        catch (e) {
                            // do nothing
                        }
                        if (statWithoutTrailing && statWithoutTrailing.isDirectory) {
                            this.badPath = undefined;
                            inputUriDirname = this.tryAddTrailingSeparatorToDirectory(inputUriDirname, statWithoutTrailing);
                            return await this.updateItems(inputUriDirname, false, resources.basename(valueUri)) ? UpdateResult.UpdatedWithTrailing : UpdateResult.Updated;
                        }
                    }
                }
            }
            this.badPath = undefined;
            return UpdateResult.NotUpdated;
        }
        tryUpdateTrailing(value) {
            const ext = resources.extname(value);
            if (this.trailing && ext) {
                this.trailing = resources.basename(value);
            }
        }
        setActiveItems(value) {
            value = this.pathFromUri(this.tildaReplace(value));
            const asUri = this.remoteUriFrom(value);
            const inputBasename = resources.basename(asUri);
            const userPath = this.constructFullUserPath();
            // Make sure that the folder whose children we are currently viewing matches the path in the input
            const pathsEqual = (0, strings_1.equalsIgnoreCase)(userPath, value.substring(0, userPath.length)) ||
                (0, strings_1.equalsIgnoreCase)(value, userPath.substring(0, value.length));
            if (pathsEqual) {
                let hasMatch = false;
                for (let i = 0; i < this.filePickBox.items.length; i++) {
                    const item = this.filePickBox.items[i];
                    if (this.setAutoComplete(value, inputBasename, item)) {
                        hasMatch = true;
                        break;
                    }
                }
                if (!hasMatch) {
                    const userBasename = inputBasename.length >= 2 ? userPath.substring(userPath.length - inputBasename.length + 2) : '';
                    this.userEnteredPathSegment = (userBasename === inputBasename) ? inputBasename : '';
                    this.autoCompletePathSegment = '';
                    this.filePickBox.activeItems = [];
                    this.tryUpdateTrailing(asUri);
                }
            }
            else {
                this.userEnteredPathSegment = inputBasename;
                this.autoCompletePathSegment = '';
                this.filePickBox.activeItems = [];
                this.tryUpdateTrailing(asUri);
            }
        }
        setAutoComplete(startingValue, startingBasename, quickPickItem, force = false) {
            if (this.busy) {
                // We're in the middle of something else. Doing an auto complete now can result jumbled or incorrect autocompletes.
                this.userEnteredPathSegment = startingBasename;
                this.autoCompletePathSegment = '';
                return false;
            }
            const itemBasename = quickPickItem.label;
            // Either force the autocomplete, or the old value should be one smaller than the new value and match the new value.
            if (itemBasename === '..') {
                // Don't match on the up directory item ever.
                this.userEnteredPathSegment = '';
                this.autoCompletePathSegment = '';
                this.activeItem = quickPickItem;
                if (force) {
                    // clear any selected text
                    (0, dom_1.getActiveDocument)().execCommand('insertText', false, '');
                }
                return false;
            }
            else if (!force && (itemBasename.length >= startingBasename.length) && (0, strings_1.equalsIgnoreCase)(itemBasename.substr(0, startingBasename.length), startingBasename)) {
                this.userEnteredPathSegment = startingBasename;
                this.activeItem = quickPickItem;
                // Changing the active items will trigger the onDidActiveItemsChanged. Clear the autocomplete first, then set it after.
                this.autoCompletePathSegment = '';
                if (quickPickItem.isFolder || !this.trailing) {
                    this.filePickBox.activeItems = [quickPickItem];
                }
                else {
                    this.filePickBox.activeItems = [];
                }
                return true;
            }
            else if (force && (!(0, strings_1.equalsIgnoreCase)(this.basenameWithTrailingSlash(quickPickItem.uri), (this.userEnteredPathSegment + this.autoCompletePathSegment)))) {
                this.userEnteredPathSegment = '';
                if (!this.accessibilityService.isScreenReaderOptimized()) {
                    this.autoCompletePathSegment = this.trimTrailingSlash(itemBasename);
                }
                this.activeItem = quickPickItem;
                if (!this.accessibilityService.isScreenReaderOptimized()) {
                    this.filePickBox.valueSelection = [this.pathFromUri(this.currentFolder, true).length, this.filePickBox.value.length];
                    // use insert text to preserve undo buffer
                    this.insertText(this.pathAppend(this.currentFolder, this.autoCompletePathSegment), this.autoCompletePathSegment);
                    this.filePickBox.valueSelection = [this.filePickBox.value.length - this.autoCompletePathSegment.length, this.filePickBox.value.length];
                }
                return true;
            }
            else {
                this.userEnteredPathSegment = startingBasename;
                this.autoCompletePathSegment = '';
                return false;
            }
        }
        insertText(wholeValue, insertText) {
            if (this.filePickBox.inputHasFocus()) {
                (0, dom_1.getActiveDocument)().execCommand('insertText', false, insertText);
                if (this.filePickBox.value !== wholeValue) {
                    this.filePickBox.value = wholeValue;
                    this.handleValueChange(wholeValue);
                }
            }
            else {
                this.filePickBox.value = wholeValue;
                this.handleValueChange(wholeValue);
            }
        }
        addPostfix(uri) {
            let result = uri;
            if (this.requiresTrailing && this.options.filters && this.options.filters.length > 0 && !resources.hasTrailingPathSeparator(uri)) {
                // Make sure that the suffix is added. If the user deleted it, we automatically add it here
                let hasExt = false;
                const currentExt = resources.extname(uri).substr(1);
                for (let i = 0; i < this.options.filters.length; i++) {
                    for (let j = 0; j < this.options.filters[i].extensions.length; j++) {
                        if ((this.options.filters[i].extensions[j] === '*') || (this.options.filters[i].extensions[j] === currentExt)) {
                            hasExt = true;
                            break;
                        }
                    }
                    if (hasExt) {
                        break;
                    }
                }
                if (!hasExt) {
                    result = resources.joinPath(resources.dirname(uri), resources.basename(uri) + '.' + this.options.filters[0].extensions[0]);
                }
            }
            return result;
        }
        trimTrailingSlash(path) {
            return ((path.length > 1) && this.endsWithSlash(path)) ? path.substr(0, path.length - 1) : path;
        }
        yesNoPrompt(uri, message) {
            const prompt = this.quickInputService.createQuickPick();
            prompt.title = message;
            prompt.ignoreFocusOut = true;
            prompt.ok = true;
            prompt.customButton = true;
            prompt.customLabel = nls.localize('remoteFileDialog.cancel', 'Cancel');
            prompt.value = this.pathFromUri(uri);
            let isResolving = false;
            return new Promise(resolve => {
                prompt.onDidAccept(() => {
                    isResolving = true;
                    prompt.hide();
                    resolve(true);
                });
                prompt.onDidHide(() => {
                    if (!isResolving) {
                        resolve(false);
                    }
                    this.filePickBox.show();
                    this.hidden = false;
                    prompt.dispose();
                });
                prompt.onDidChangeValue(() => {
                    prompt.hide();
                });
                prompt.onDidCustom(() => {
                    prompt.hide();
                });
                prompt.show();
            });
        }
        async validate(uri) {
            if (uri === undefined) {
                this.filePickBox.validationMessage = nls.localize('remoteFileDialog.invalidPath', 'Please enter a valid path.');
                return Promise.resolve(false);
            }
            let stat;
            let statDirname;
            try {
                statDirname = await this.fileService.stat(resources.dirname(uri));
                stat = await this.fileService.stat(uri);
            }
            catch (e) {
                // do nothing
            }
            if (this.requiresTrailing) { // save
                if (stat && stat.isDirectory) {
                    // Can't do this
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateFolder', 'The folder already exists. Please use a new file name.');
                    return Promise.resolve(false);
                }
                else if (stat) {
                    // Replacing a file.
                    // Show a yes/no prompt
                    const message = nls.localize('remoteFileDialog.validateExisting', '{0} already exists. Are you sure you want to overwrite it?', resources.basename(uri));
                    return this.yesNoPrompt(uri, message);
                }
                else if (!((0, extpath_1.isValidBasename)(resources.basename(uri), this.isWindows))) {
                    // Filename not allowed
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateBadFilename', 'Please enter a valid file name.');
                    return Promise.resolve(false);
                }
                else if (!statDirname) {
                    // Folder to save in doesn't exist
                    const message = nls.localize('remoteFileDialog.validateCreateDirectory', 'The folder {0} does not exist. Would you like to create it?', resources.basename(resources.dirname(uri)));
                    return this.yesNoPrompt(uri, message);
                }
                else if (!statDirname.isDirectory) {
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateNonexistentDir', 'Please enter a path that exists.');
                    return Promise.resolve(false);
                }
                else if (statDirname.readonly || statDirname.locked) {
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateReadonlyFolder', 'This folder cannot be used as a save destination. Please choose another folder');
                    return Promise.resolve(false);
                }
            }
            else { // open
                if (!stat) {
                    // File or folder doesn't exist
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateNonexistentDir', 'Please enter a path that exists.');
                    return Promise.resolve(false);
                }
                else if (uri.path === '/' && this.isWindows) {
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.windowsDriveLetter', 'Please start the path with a drive letter.');
                    return Promise.resolve(false);
                }
                else if (stat.isDirectory && !this.allowFolderSelection) {
                    // Folder selected when folder selection not permitted
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateFileOnly', 'Please select a file.');
                    return Promise.resolve(false);
                }
                else if (!stat.isDirectory && !this.allowFileSelection) {
                    // File selected when file selection not permitted
                    this.filePickBox.validationMessage = nls.localize('remoteFileDialog.validateFolderOnly', 'Please select a folder.');
                    return Promise.resolve(false);
                }
            }
            return Promise.resolve(true);
        }
        // Returns true if there is a file at the end of the URI.
        async updateItems(newFolder, force = false, trailing) {
            this.busy = true;
            this.autoCompletePathSegment = '';
            const isSave = !!trailing;
            let result = false;
            const updatingPromise = (0, async_1.createCancelablePromise)(async (token) => {
                let folderStat;
                try {
                    folderStat = await this.fileService.resolve(newFolder);
                    if (!folderStat.isDirectory) {
                        trailing = resources.basename(newFolder);
                        newFolder = resources.dirname(newFolder);
                        folderStat = undefined;
                        result = true;
                    }
                }
                catch (e) {
                    // The file/directory doesn't exist
                }
                const newValue = trailing ? this.pathAppend(newFolder, trailing) : this.pathFromUri(newFolder, true);
                this.currentFolder = this.endsWithSlash(newFolder.path) ? newFolder : resources.addTrailingPathSeparator(newFolder, this.separator);
                this.userEnteredPathSegment = trailing ? trailing : '';
                return this.createItems(folderStat, this.currentFolder, token).then(items => {
                    if (token.isCancellationRequested) {
                        this.busy = false;
                        return false;
                    }
                    this.filePickBox.itemActivation = quickInput_1.ItemActivation.NONE;
                    this.filePickBox.items = items;
                    // the user might have continued typing while we were updating. Only update the input box if it doesn't match the directory.
                    if (!(0, strings_1.equalsIgnoreCase)(this.filePickBox.value, newValue) && force) {
                        this.filePickBox.valueSelection = [0, this.filePickBox.value.length];
                        this.insertText(newValue, newValue);
                    }
                    if (force && trailing && isSave) {
                        // Keep the cursor position in front of the save as name.
                        this.filePickBox.valueSelection = [this.filePickBox.value.length - trailing.length, this.filePickBox.value.length - trailing.length];
                    }
                    else if (!trailing) {
                        // If there is trailing, we don't move the cursor. If there is no trailing, cursor goes at the end.
                        this.filePickBox.valueSelection = [this.filePickBox.value.length, this.filePickBox.value.length];
                    }
                    this.busy = false;
                    this.updatingPromise = undefined;
                    return result;
                });
            });
            if (this.updatingPromise !== undefined) {
                this.updatingPromise.cancel();
            }
            this.updatingPromise = updatingPromise;
            return updatingPromise;
        }
        pathFromUri(uri, endWithSeparator = false) {
            let result = (0, labels_1.normalizeDriveLetter)(uri.fsPath, this.isWindows).replace(/\n/g, '');
            if (this.separator === '/') {
                result = result.replace(/\\/g, this.separator);
            }
            else {
                result = result.replace(/\//g, this.separator);
            }
            if (endWithSeparator && !this.endsWithSlash(result)) {
                result = result + this.separator;
            }
            return result;
        }
        pathAppend(uri, additional) {
            if ((additional === '..') || (additional === '.')) {
                const basePath = this.pathFromUri(uri, true);
                return basePath + additional;
            }
            else {
                return this.pathFromUri(resources.joinPath(uri, additional));
            }
        }
        async checkIsWindowsOS() {
            let isWindowsOS = platform_1.isWindows;
            const env = await this.getRemoteAgentEnvironment();
            if (env) {
                isWindowsOS = env.os === 1 /* OperatingSystem.Windows */;
            }
            return isWindowsOS;
        }
        endsWithSlash(s) {
            return /[\/\\]$/.test(s);
        }
        basenameWithTrailingSlash(fullPath) {
            const child = this.pathFromUri(fullPath, true);
            const parent = this.pathFromUri(resources.dirname(fullPath), true);
            return child.substring(parent.length);
        }
        async createBackItem(currFolder) {
            const fileRepresentationCurr = this.currentFolder.with({ scheme: network_1.Schemas.file, authority: '' });
            const fileRepresentationParent = resources.dirname(fileRepresentationCurr);
            if (!resources.isEqual(fileRepresentationCurr, fileRepresentationParent)) {
                const parentFolder = resources.dirname(currFolder);
                if (await this.fileService.exists(parentFolder)) {
                    return { label: '..', uri: resources.addTrailingPathSeparator(parentFolder, this.separator), isFolder: true };
                }
            }
            return undefined;
        }
        async createItems(folder, currentFolder, token) {
            const result = [];
            const backDir = await this.createBackItem(currentFolder);
            try {
                if (!folder) {
                    folder = await this.fileService.resolve(currentFolder);
                }
                const items = folder.children ? await Promise.all(folder.children.map(child => this.createItem(child, currentFolder, token))) : [];
                for (const item of items) {
                    if (item) {
                        result.push(item);
                    }
                }
            }
            catch (e) {
                // ignore
                console.log(e);
            }
            if (token.isCancellationRequested) {
                return [];
            }
            const sorted = result.sort((i1, i2) => {
                if (i1.isFolder !== i2.isFolder) {
                    return i1.isFolder ? -1 : 1;
                }
                const trimmed1 = this.endsWithSlash(i1.label) ? i1.label.substr(0, i1.label.length - 1) : i1.label;
                const trimmed2 = this.endsWithSlash(i2.label) ? i2.label.substr(0, i2.label.length - 1) : i2.label;
                return trimmed1.localeCompare(trimmed2);
            });
            if (backDir) {
                sorted.unshift(backDir);
            }
            return sorted;
        }
        filterFile(file) {
            if (this.options.filters) {
                for (let i = 0; i < this.options.filters.length; i++) {
                    for (let j = 0; j < this.options.filters[i].extensions.length; j++) {
                        const testExt = this.options.filters[i].extensions[j];
                        if ((testExt === '*') || (file.path.endsWith('.' + testExt))) {
                            return true;
                        }
                    }
                }
                return false;
            }
            return true;
        }
        async createItem(stat, parent, token) {
            if (token.isCancellationRequested) {
                return undefined;
            }
            let fullPath = resources.joinPath(parent, stat.name);
            if (stat.isDirectory) {
                const filename = resources.basename(fullPath);
                fullPath = resources.addTrailingPathSeparator(fullPath, this.separator);
                return { label: filename, uri: fullPath, isFolder: true, iconClasses: (0, getIconClasses_1.getIconClasses)(this.modelService, this.languageService, fullPath || undefined, files_1.FileKind.FOLDER) };
            }
            else if (!stat.isDirectory && this.allowFileSelection && this.filterFile(fullPath)) {
                return { label: stat.name, uri: fullPath, isFolder: false, iconClasses: (0, getIconClasses_1.getIconClasses)(this.modelService, this.languageService, fullPath || undefined) };
            }
            return undefined;
        }
    };
    exports.SimpleFileDialog = SimpleFileDialog;
    exports.SimpleFileDialog = SimpleFileDialog = __decorate([
        __param(0, files_1.IFileService),
        __param(1, quickInput_1.IQuickInputService),
        __param(2, label_1.ILabelService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, notification_1.INotificationService),
        __param(5, dialogs_1.IFileDialogService),
        __param(6, model_1.IModelService),
        __param(7, language_1.ILanguageService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, remoteAgentService_1.IRemoteAgentService),
        __param(10, pathService_1.IPathService),
        __param(11, keybinding_1.IKeybindingService),
        __param(12, contextkey_1.IContextKeyService),
        __param(13, accessibility_1.IAccessibilityService)
    ], SimpleFileDialog);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlRmlsZURpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2RpYWxvZ3MvYnJvd3Nlci9zaW1wbGVGaWxlRGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9DaEcsSUFBaUIsb0JBQW9CLENBU3BDO0lBVEQsV0FBaUIsb0JBQW9CO1FBQ3ZCLHVCQUFFLEdBQUcsc0NBQXNDLENBQUM7UUFDNUMsMEJBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3pFLFNBQWdCLE9BQU87WUFDdEIsT0FBTyxRQUFRLENBQUMsRUFBRTtnQkFDakIsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0QkFBa0IsQ0FBQyxDQUFDO2dCQUN2RCxPQUFPLGFBQWEsQ0FBQyxlQUFlLENBQUMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLENBQUMsaUJBQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkcsQ0FBQyxDQUFDO1FBQ0gsQ0FBQztRQUxlLDRCQUFPLFVBS3RCLENBQUE7SUFDRixDQUFDLEVBVGdCLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBU3BDO0lBRUQsSUFBaUIsb0JBQW9CLENBY3BDO0lBZEQsV0FBaUIsb0JBQW9CO1FBQ3ZCLHVCQUFFLEdBQUcsc0NBQXNDLENBQUM7UUFDNUMsMEJBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3pFLFNBQWdCLE9BQU87WUFDdEIsT0FBTyxRQUFRLENBQUMsRUFBRTtnQkFDakIsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7Z0JB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