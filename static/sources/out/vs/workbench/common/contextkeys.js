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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/base/common/resources", "vs/editor/common/languages/language", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/base/common/network", "vs/workbench/common/editor", "vs/base/common/platform"], function (require, exports, lifecycle_1, nls_1, contextkey_1, resources_1, language_1, files_1, model_1, network_1, editor_1, platform_1) {
    "use strict";
    var ResourceContextKey_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyAvailableEditorIds = exports.ResourceContextKey = exports.getVisbileViewContextKey = exports.FocusedViewContext = exports.PanelMaximizedContext = exports.PanelVisibleContext = exports.PanelAlignmentContext = exports.PanelPositionContext = exports.PanelFocusContext = exports.ActivePanelContext = exports.AuxiliaryBarVisibleContext = exports.AuxiliaryBarFocusContext = exports.ActiveAuxiliaryContext = exports.NotificationsToastsVisibleContext = exports.NotificationsCenterVisibleContext = exports.NotificationFocusedContext = exports.BannerFocused = exports.TitleBarVisibleContext = exports.TitleBarStyleContext = exports.StatusBarFocused = exports.ActiveViewletContext = exports.SidebarFocusContext = exports.SideBarVisibleContext = exports.EditorTabsVisibleContext = exports.MainEditorAreaVisibleContext = exports.SplitEditorsVertically = exports.IsCenteredLayoutContext = exports.InEditorZenModeContext = exports.EditorsVisibleContext = exports.IsAuxiliaryEditorPartContext = exports.EditorPartMaximizedEditorGroupContext = exports.EditorPartSingleEditorGroupsContext = exports.EditorPartMultipleEditorGroupsContext = exports.SingleEditorGroupsContext = exports.MultipleEditorGroupsContext = exports.ActiveEditorGroupLockedContext = exports.ActiveEditorGroupLastContext = exports.ActiveEditorGroupIndexContext = exports.ActiveEditorGroupEmptyContext = exports.EditorGroupEditorsCountContext = exports.SideBySideEditorActiveContext = exports.TextCompareEditorActiveContext = exports.TextCompareEditorVisibleContext = exports.ActiveEditorAvailableEditorIdsContext = exports.ActiveEditorContext = exports.ActiveEditorCanSplitInGroupContext = exports.ActiveEditorCanRevertContext = exports.ActiveEditorCanToggleReadonlyContext = exports.ActiveCompareEditorOriginalWriteableContext = exports.ActiveEditorReadonlyContext = exports.ActiveEditorStickyContext = exports.ActiveEditorLastInGroupContext = exports.ActiveEditorFirstInGroupContext = exports.ActiveEditorPinnedContext = exports.ActiveEditorDirtyContext = exports.EmbedderIdentifierContext = exports.HasWebFileSystemAccess = exports.IsAuxiliaryWindowFocusedContext = exports.IsMainWindowFullscreenContext = exports.TemporaryWorkspaceContext = exports.VirtualWorkspaceContext = exports.RemoteNameContext = exports.DirtyWorkingCopiesContext = exports.EmptyWorkspaceSupportContext = exports.EnterMultiRootWorkspaceSupportContext = exports.OpenFolderWorkspaceSupportContext = exports.WorkspaceFolderCountContext = exports.WorkbenchStateContext = void 0;
    //#region < --- Workbench --- >
    exports.WorkbenchStateContext = new contextkey_1.RawContextKey('workbenchState', undefined, { type: 'string', description: (0, nls_1.localize)('workbenchState', "The kind of workspace opened in the window, either 'empty' (no workspace), 'folder' (single folder) or 'workspace' (multi-root workspace)") });
    exports.WorkspaceFolderCountContext = new contextkey_1.RawContextKey('workspaceFolderCount', 0, (0, nls_1.localize)('workspaceFolderCount', "The number of root folders in the workspace"));
    exports.OpenFolderWorkspaceSupportContext = new contextkey_1.RawContextKey('openFolderWorkspaceSupport', true, true);
    exports.EnterMultiRootWorkspaceSupportContext = new contextkey_1.RawContextKey('enterMultiRootWorkspaceSupport', true, true);
    exports.EmptyWorkspaceSupportContext = new contextkey_1.RawContextKey('emptyWorkspaceSupport', true, true);
    exports.DirtyWorkingCopiesContext = new contextkey_1.RawContextKey('dirtyWorkingCopies', false, (0, nls_1.localize)('dirtyWorkingCopies', "Whether there are any working copies with unsaved changes"));
    exports.RemoteNameContext = new contextkey_1.RawContextKey('remoteName', '', (0, nls_1.localize)('remoteName', "The name of the remote the window is connected to or an empty string if not connected to any remote"));
    exports.VirtualWorkspaceContext = new contextkey_1.RawContextKey('virtualWorkspace', '', (0, nls_1.localize)('virtualWorkspace', "The scheme of the current workspace is from a virtual file system or an empty string."));
    exports.TemporaryWorkspaceContext = new contextkey_1.RawContextKey('temporaryWorkspace', false, (0, nls_1.localize)('temporaryWorkspace', "The scheme of the current workspace is from a temporary file system."));
    exports.IsMainWindowFullscreenContext = new contextkey_1.RawContextKey('isFullscreen', false, (0, nls_1.localize)('isFullscreen', "Whether the main window is in fullscreen mode"));
    exports.IsAuxiliaryWindowFocusedContext = new contextkey_1.RawContextKey('isAuxiliaryWindowFocusedContext', false, (0, nls_1.localize)('isAuxiliaryWindowFocusedContext', "Whether an auxiliary window is focused"));
    exports.HasWebFileSystemAccess = new contextkey_1.RawContextKey('hasWebFileSystemAccess', false, true); // Support for FileSystemAccess web APIs (https://wicg.github.io/file-system-access)
    exports.EmbedderIdentifierContext = new contextkey_1.RawContextKey('embedderIdentifier', undefined, (0, nls_1.localize)('embedderIdentifier', 'The identifier of the embedder according to the product service, if one is defined'));
    //#endregion
    //#region < --- Editor --- >
    // Editor State Context Keys
    exports.ActiveEditorDirtyContext = new contextkey_1.RawContextKey('activeEditorIsDirty', false, (0, nls_1.localize)('activeEditorIsDirty', "Whether the active editor has unsaved changes"));
    exports.ActiveEditorPinnedContext = new contextkey_1.RawContextKey('activeEditorIsNotPreview', false, (0, nls_1.localize)('activeEditorIsNotPreview', "Whether the active editor is not in preview mode"));
    exports.ActiveEditorFirstInGroupContext = new contextkey_1.RawContextKey('activeEditorIsFirstInGroup', false, (0, nls_1.localize)('activeEditorIsFirstInGroup', "Whether the active editor is the first one in its group"));
    exports.ActiveEditorLastInGroupContext = new contextkey_1.RawContextKey('activeEditorIsLastInGroup', false, (0, nls_1.localize)('activeEditorIsLastInGroup', "Whether the active editor is the last one in its group"));
    exports.ActiveEditorStickyContext = new contextkey_1.RawContextKey('activeEditorIsPinned', false, (0, nls_1.localize)('activeEditorIsPinned', "Whether the active editor is pinned"));
    exports.ActiveEditorReadonlyContext = new contextkey_1.RawContextKey('activeEditorIsReadonly', false, (0, nls_1.localize)('activeEditorIsReadonly', "Whether the active editor is read-only"));
    exports.ActiveCompareEditorOriginalWriteableContext = new contextkey_1.RawContextKey('activeCompareEditorOriginalWritable', false, (0, nls_1.localize)('activeCompareEditorOriginalWritable', "Whether the active compare editor has a writable original side"));
    exports.ActiveEditorCanToggleReadonlyContext = new contextkey_1.RawContextKey('activeEditorCanToggleReadonly', true, (0, nls_1.localize)('activeEditorCanToggleReadonly', "Whether the active editor can toggle between being read-only or writeable"));
    exports.ActiveEditorCanRevertContext = new contextkey_1.RawContextKey('activeEditorCanRevert', false, (0, nls_1.localize)('activeEditorCanRevert', "Whether the active editor can revert"));
    exports.ActiveEditorCanSplitInGroupContext = new contextkey_1.RawContextKey('activeEditorCanSplitInGroup', true);
    // Editor Kind Context Keys
    exports.ActiveEditorContext = new contextkey_1.RawContextKey('activeEditor', null, { type: 'string', description: (0, nls_1.localize)('activeEditor', "The identifier of the active editor") });
    exports.ActiveEditorAvailableEditorIdsContext = new contextkey_1.RawContextKey('activeEditorAvailableEditorIds', '', (0, nls_1.localize)('activeEditorAvailableEditorIds', "The available editor identifiers that are usable for the active editor"));
    exports.TextCompareEditorVisibleContext = new contextkey_1.RawContextKey('textCompareEditorVisible', false, (0, nls_1.localize)('textCompareEditorVisible', "Whether a text compare editor is visible"));
    exports.TextCompareEditorActiveContext = new contextkey_1.RawContextKey('textCompareEditorActive', false, (0, nls_1.localize)('textCompareEditorActive', "Whether a text compare editor is active"));
    exports.SideBySideEditorActiveContext = new contextkey_1.RawContextKey('sideBySideEditorActive', false, (0, nls_1.localize)('sideBySideEditorActive', "Whether a side by side editor is active"));
    // Editor Group Context Keys
    exports.EditorGroupEditorsCountContext = new contextkey_1.RawContextKey('groupEditorsCount', 0, (0, nls_1.localize)('groupEditorsCount', "The number of opened editor groups"));
    exports.ActiveEditorGroupEmptyContext = new contextkey_1.RawContextKey('activeEditorGroupEmpty', false, (0, nls_1.localize)('activeEditorGroupEmpty', "Whether the active editor group is empty"));
    exports.ActiveEditorGroupIndexContext = new contextkey_1.RawContextKey('activeEditorGroupIndex', 0, (0, nls_1.localize)('activeEditorGroupIndex', "The index of the active editor group"));
    exports.ActiveEditorGroupLastContext = new contextkey_1.RawContextKey('activeEditorGroupLast', false, (0, nls_1.localize)('activeEditorGroupLast', "Whether the active editor group is the last group"));
    exports.ActiveEditorGroupLockedContext = new contextkey_1.RawContextKey('activeEditorGroupLocked', false, (0, nls_1.localize)('activeEditorGroupLocked', "Whether the active editor group is locked"));
    exports.MultipleEditorGroupsContext = new contextkey_1.RawContextKey('multipleEditorGroups', false, (0, nls_1.localize)('multipleEditorGroups', "Whether there are multiple editor groups opened"));
    exports.SingleEditorGroupsContext = exports.MultipleEditorGroupsContext.toNegated();
    // Editor Part Context Keys
    exports.EditorPartMultipleEditorGroupsContext = new contextkey_1.RawContextKey('editorPartMultipleEditorGroups', false, (0, nls_1.localize)('editorPartMultipleEditorGroups', "Whether there are multiple editor groups opened in an editor part"));
    exports.EditorPartSingleEditorGroupsContext = exports.EditorPartMultipleEditorGroupsContext.toNegated();
    exports.EditorPartMaximizedEditorGroupContext = new contextkey_1.RawContextKey('editorPartMaximizedEditorGroup', false, (0, nls_1.localize)('editorPartEditorGroupMaximized', "Editor Part has a maximized group"));
    exports.IsAuxiliaryEditorPartContext = new contextkey_1.RawContextKey('isAuxiliaryEditorPart', false, (0, nls_1.localize)('isAuxiliaryEditorPart', "Editor Part is in an auxiliary window"));
    // Editor Layout Context Keys
    exports.EditorsVisibleContext = new contextkey_1.RawContextKey('editorIsOpen', false, (0, nls_1.localize)('editorIsOpen', "Whether an editor is open"));
    exports.InEditorZenModeContext = new contextkey_1.RawContextKey('inZenMode', false, (0, nls_1.localize)('inZenMode', "Whether Zen mode is enabled"));
    exports.IsCenteredLayoutContext = new contextkey_1.RawContextKey('isCenteredLayout', false, (0, nls_1.localize)('isCenteredLayout', "Whether centered layout is enabled"));
    exports.SplitEditorsVertically = new contextkey_1.RawContextKey('splitEditorsVertically', false, (0, nls_1.localize)('splitEditorsVertically', "Whether editors split vertically"));
    exports.MainEditorAreaVisibleContext = new contextkey_1.RawContextKey('mainEditorAreaVisible', true, (0, nls_1.localize)('mainEditorAreaVisible', "Whether the editor area in the main window is visible"));
    exports.EditorTabsVisibleContext = new contextkey_1.RawContextKey('editorTabsVisible', true, (0, nls_1.localize)('editorTabsVisible', "Whether editor tabs are visible"));
    //#endregion
    //#region < --- Side Bar --- >
    exports.SideBarVisibleContext = new contextkey_1.RawContextKey('sideBarVisible', false, (0, nls_1.localize)('sideBarVisible', "Whether the sidebar is visible"));
    exports.SidebarFocusContext = new contextkey_1.RawContextKey('sideBarFocus', false, (0, nls_1.localize)('sideBarFocus', "Whether the sidebar has keyboard focus"));
    exports.ActiveViewletContext = new contextkey_1.RawContextKey('activeViewlet', '', (0, nls_1.localize)('activeViewlet', "The identifier of the active viewlet"));
    //#endregion
    //#region < --- Status Bar --- >
    exports.StatusBarFocused = new contextkey_1.RawContextKey('statusBarFocused', false, (0, nls_1.localize)('statusBarFocused', "Whether the status bar has keyboard focus"));
    //#endregion
    //#region < --- Title Bar --- >
    exports.TitleBarStyleContext = new contextkey_1.RawContextKey('titleBarStyle', platform_1.isLinux ? 'native' : 'custom', (0, nls_1.localize)('titleBarStyle', "Style of the window title bar"));
    exports.TitleBarVisibleContext = new contextkey_1.RawContextKey('titleBarVisible', false, (0, nls_1.localize)('titleBarVisible', "Whether the title bar is visible"));
    //#endregion
    //#region < --- Banner --- >
    exports.BannerFocused = new contextkey_1.RawContextKey('bannerFocused', false, (0, nls_1.localize)('bannerFocused', "Whether the banner has keyboard focus"));
    //#endregion
    //#region < --- Notifications --- >
    exports.NotificationFocusedContext = new contextkey_1.RawContextKey('notificationFocus', true, (0, nls_1.localize)('notificationFocus', "Whether a notification has keyboard focus"));
    exports.NotificationsCenterVisibleContext = new contextkey_1.RawContextKey('notificationCenterVisible', false, (0, nls_1.localize)('notificationCenterVisible', "Whether the notifications center is visible"));
    exports.NotificationsToastsVisibleContext = new contextkey_1.RawContextKey('notificationToastsVisible', false, (0, nls_1.localize)('notificationToastsVisible', "Whether a notification toast is visible"));
    //#endregion
    //#region < --- Auxiliary Bar --- >
    exports.ActiveAuxiliaryContext = new contextkey_1.RawContextKey('activeAuxiliary', '', (0, nls_1.localize)('activeAuxiliary', "The identifier of the active auxiliary panel"));
    exports.AuxiliaryBarFocusContext = new contextkey_1.RawContextKey('auxiliaryBarFocus', false, (0, nls_1.localize)('auxiliaryBarFocus', "Whether the auxiliary bar has keyboard focus"));
    exports.AuxiliaryBarVisibleContext = new contextkey_1.RawContextKey('auxiliaryBarVisible', false, (0, nls_1.localize)('auxiliaryBarVisible', "Whether the auxiliary bar is visible"));
    //#endregion
    //#region < --- Panel --- >
    exports.ActivePanelContext = new contextkey_1.RawContextKey('activePanel', '', (0, nls_1.localize)('activePanel', "The identifier of the active panel"));
    exports.PanelFocusContext = new contextkey_1.RawContextKey('panelFocus', false, (0, nls_1.localize)('panelFocus', "Whether the panel has keyboard focus"));
    exports.PanelPositionContext = new contextkey_1.RawContextKey('panelPosition', 'bottom', (0, nls_1.localize)('panelPosition', "The position of the panel, always 'bottom'"));
    exports.PanelAlignmentContext = new contextkey_1.RawContextKey('panelAlignment', 'center', (0, nls_1.localize)('panelAlignment', "The alignment of the panel, either 'center', 'left', 'right' or 'justify'"));
    exports.PanelVisibleContext = new contextkey_1.RawContextKey('panelVisible', false, (0, nls_1.localize)('panelVisible', "Whether the panel is visible"));
    exports.PanelMaximizedContext = new contextkey_1.RawContextKey('panelMaximized', false, (0, nls_1.localize)('panelMaximized', "Whether the panel is maximized"));
    //#endregion
    //#region < --- Views --- >
    exports.FocusedViewContext = new contextkey_1.RawContextKey('focusedView', '', (0, nls_1.localize)('focusedView', "The identifier of the view that has keyboard focus"));
    function getVisbileViewContextKey(viewId) { return `view.${viewId}.visible`; }
    exports.getVisbileViewContextKey = getVisbileViewContextKey;
    //#endregion
    //#region < --- Resources --- >
    let ResourceContextKey = class ResourceContextKey {
        static { ResourceContextKey_1 = this; }
        // NOTE: DO NOT CHANGE THE DEFAULT VALUE TO ANYTHING BUT
        // UNDEFINED! IT IS IMPORTANT THAT DEFAULTS ARE INHERITED
        // FROM THE PARENT CONTEXT AND ONLY UNDEFINED DOES THIS
        static { this.Scheme = new contextkey_1.RawContextKey('resourceScheme', undefined, { type: 'string', description: (0, nls_1.localize)('resourceScheme', "The scheme of the resource") }); }
        static { this.Filename = new contextkey_1.RawContextKey('resourceFilename', undefined, { type: 'string', description: (0, nls_1.localize)('resourceFilename', "The file name of the resource") }); }
        static { this.Dirname = new contextkey_1.RawContextKey('resourceDirname', undefined, { type: 'string', description: (0, nls_1.localize)('resourceDirname', "The folder name the resource is contained in") }); }
        static { this.Path = new contextkey_1.RawContextKey('resourcePath', undefined, { type: 'string', description: (0, nls_1.localize)('resourcePath', "The full path of the resource") }); }
        static { this.LangId = new contextkey_1.RawContextKey('resourceLangId', undefined, { type: 'string', description: (0, nls_1.localize)('resourceLangId', "The language identifier of the resource") }); }
        static { this.Resource = new contextkey_1.RawContextKey('resource', undefined, { type: 'URI', description: (0, nls_1.localize)('resource', "The full value of the resource including scheme and path") }); }
        static { this.Extension = new contextkey_1.RawContextKey('resourceExtname', undefined, { type: 'string', description: (0, nls_1.localize)('resourceExtname', "The extension name of the resource") }); }
        static { this.HasResource = new contextkey_1.RawContextKey('resourceSet', undefined, { type: 'boolean', description: (0, nls_1.localize)('resourceSet', "Whether a resource is present or not") }); }
        static { this.IsFileSystemResource = new contextkey_1.RawContextKey('isFileSystemResource', undefined, { type: 'boolean', description: (0, nls_1.localize)('isFileSystemResource', "Whether the resource is backed by a file system provider") }); }
        constructor(_contextKeyService, _fileService, _languageService, _modelService) {
            this._contextKeyService = _contextKeyService;
            this._fileService = _fileService;
            this._languageService = _languageService;
            this._modelService = _modelService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._schemeKey = ResourceContextKey_1.Scheme.bindTo(this._contextKeyService);
            this._filenameKey = ResourceContextKey_1.Filename.bindTo(this._contextKeyService);
            this._dirnameKey = ResourceContextKey_1.Dirname.bindTo(this._contextKeyService);
            this._pathKey = ResourceContextKey_1.Path.bindTo(this._contextKeyService);
            this._langIdKey = ResourceContextKey_1.LangId.bindTo(this._contextKeyService);
            this._resourceKey = ResourceContextKey_1.Resource.bindTo(this._contextKeyService);
            this._extensionKey = ResourceContextKey_1.Extension.bindTo(this._contextKeyService);
            this._hasResource = ResourceContextKey_1.HasResource.bindTo(this._contextKeyService);
            this._isFileSystemResource = ResourceContextKey_1.IsFileSystemResource.bindTo(this._contextKeyService);
            this._disposables.add(_fileService.onDidChangeFileSystemProviderRegistrations(() => {
                const resource = this.get();
                this._isFileSystemResource.set(Boolean(resource && _fileService.hasProvider(resource)));
            }));
            this._disposables.add(_modelService.onModelAdded(model => {
                if ((0, resources_1.isEqual)(model.uri, this.get())) {
                    this._setLangId();
                }
            }));
            this._disposables.add(_modelService.onModelLanguageChanged(e => {
                if ((0, resources_1.isEqual)(e.model.uri, this.get())) {
                    this._setLangId();
                }
            }));
        }
        dispose() {
            this._disposables.dispose();
        }
        _setLangId() {
            const value = this.get();
            if (!value) {
                this._langIdKey.set(null);
                return;
            }
            const langId = this._modelService.getModel(value)?.getLanguageId() ?? this._languageService.guessLanguageIdByFilepathOrFirstLine(value);
            this._langIdKey.set(langId);
        }
        set(value) {
            value = value ?? undefined;
            if ((0, resources_1.isEqual)(this._value, value)) {
                return;
            }
            this._value = value;
            this._contextKeyService.bufferChangeEvents(() => {
                this._resourceKey.set(value ? value.toString() : null);
                this._schemeKey.set(value ? value.scheme : null);
                this._filenameKey.set(value ? (0, resources_1.basename)(value) : null);
                this._dirnameKey.set(value ? this.uriToPath((0, resources_1.dirname)(value)) : null);
                this._pathKey.set(value ? this.uriToPath(value) : null);
                this._setLangId();
                this._extensionKey.set(value ? (0, resources_1.extname)(value) : null);
                this._hasResource.set(Boolean(value));
                this._isFileSystemResource.set(value ? this._fileService.hasProvider(value) : false);
            });
        }
        uriToPath(uri) {
            if (uri.scheme === network_1.Schemas.file) {
                return uri.fsPath;
            }
            return uri.path;
        }
        reset() {
            this._value = undefined;
            this._contextKeyService.bufferChangeEvents(() => {
                this._resourceKey.reset();
                this._schemeKey.reset();
                this._filenameKey.reset();
                this._dirnameKey.reset();
                this._pathKey.reset();
                this._langIdKey.reset();
                this._extensionKey.reset();
                this._hasResource.reset();
                this._isFileSystemResource.reset();
            });
        }
        get() {
            return this._value;
        }
    };
    exports.ResourceContextKey = ResourceContextKey;
    exports.ResourceContextKey = ResourceContextKey = ResourceContextKey_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, files_1.IFileService),
        __param(2, language_1.ILanguageService),
        __param(3, model_1.IModelService)
    ], ResourceContextKey);
    //#endregion
    function applyAvailableEditorIds(contextKey, editor, editorResolverService) {
        if (!editor) {
            contextKey.set('');
            return;
        }
        const editorResource = editor.resource;
        const editors = editorResource ? editorResolverService.getEditors(editorResource).map(editor => editor.id) : [];
        if (editorResource?.scheme === network_1.Schemas.untitled && editor.editorId !== editor_1.DEFAULT_EDITOR_ASSOCIATION.id) {
            // Non text editor untitled files cannot be easily serialized between extensions
            // so instead we disable this context key to prevent common commands that act on the active editor
            contextKey.set('');
        }
        else {
            contextKey.set(editors.join(','));
        }
    }
    exports.applyAvailableEditorIds = applyAvailableEditorIds;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dGtleXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vY29udGV4dGtleXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWdCaEcsK0JBQStCO0lBRWxCLFFBQUEscUJBQXFCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLDJJQUEySSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pSLFFBQUEsMkJBQTJCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLHNCQUFzQixFQUFFLENBQUMsRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSw2Q0FBNkMsQ0FBQyxDQUFDLENBQUM7SUFFcEssUUFBQSxpQ0FBaUMsR0FBRyxJQUFJLDBCQUFhLENBQVUsNEJBQTRCLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3pHLFFBQUEscUNBQXFDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGdDQUFnQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqSCxRQUFBLDRCQUE0QixHQUFHLElBQUksMEJBQWEsQ0FBVSx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFL0YsUUFBQSx5QkFBeUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLG9CQUFvQixFQUFFLDJEQUEyRCxDQUFDLENBQUMsQ0FBQztJQUVqTCxRQUFBLGlCQUFpQixHQUFHLElBQUksMEJBQWEsQ0FBUyxZQUFZLEVBQUUsRUFBRSxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxxR0FBcUcsQ0FB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