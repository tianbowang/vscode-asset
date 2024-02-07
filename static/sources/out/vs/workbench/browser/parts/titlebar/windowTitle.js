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
define(["require", "exports", "vs/nls", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/workbench/services/editor/common/editorService", "vs/base/common/lifecycle", "vs/workbench/common/editor", "vs/workbench/services/environment/browser/environmentService", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/labels", "vs/platform/label/common/label", "vs/base/common/event", "vs/base/common/async", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/workspace/common/virtualWorkspace", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/views/common/viewsService", "vs/editor/browser/editorBrowser"], function (require, exports, nls_1, resources_1, configuration_1, editorService_1, lifecycle_1, editor_1, environmentService_1, workspace_1, platform_1, strings_1, labels_1, label_1, event_1, async_1, productService_1, network_1, virtualWorkspace_1, userDataProfile_1, viewsService_1, editorBrowser_1) {
    "use strict";
    var WindowTitle_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowTitle = void 0;
    var WindowSettingNames;
    (function (WindowSettingNames) {
        WindowSettingNames["titleSeparator"] = "window.titleSeparator";
        WindowSettingNames["title"] = "window.title";
    })(WindowSettingNames || (WindowSettingNames = {}));
    let WindowTitle = class WindowTitle extends lifecycle_1.Disposable {
        static { WindowTitle_1 = this; }
        static { this.NLS_USER_IS_ADMIN = platform_1.isWindows ? (0, nls_1.localize)('userIsAdmin', "[Administrator]") : (0, nls_1.localize)('userIsSudo', "[Superuser]"); }
        static { this.NLS_EXTENSION_HOST = (0, nls_1.localize)('devExtensionWindowTitlePrefix', "[Extension Development Host]"); }
        static { this.TITLE_DIRTY = '\u25cf '; }
        get value() { return this.title ?? ''; }
        get workspaceName() { return this.labelService.getWorkspaceLabel(this.contextService.getWorkspace()); }
        get fileName() {
            const activeEditor = this.editorService.activeEditor;
            if (!activeEditor) {
                return undefined;
            }
            const fileName = activeEditor.getTitle(0 /* Verbosity.SHORT */);
            const dirty = activeEditor?.isDirty() && !activeEditor.isSaving() ? WindowTitle_1.TITLE_DIRTY : '';
            return `${dirty}${fileName}`;
        }
        constructor(targetWindow, editorGroupsContainer, configurationService, editorService, environmentService, contextService, labelService, userDataProfileService, productService, viewsService) {
            super();
            this.targetWindow = targetWindow;
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.contextService = contextService;
            this.labelService = labelService;
            this.userDataProfileService = userDataProfileService;
            this.productService = productService;
            this.viewsService = viewsService;
            this.properties = { isPure: true, isAdmin: false, prefix: undefined };
            this.activeEditorListeners = this._register(new lifecycle_1.DisposableStore());
            this.titleUpdater = this._register(new async_1.RunOnceScheduler(() => this.doUpdateTitle(), 0));
            this.onDidChangeEmitter = new event_1.Emitter();
            this.onDidChange = this.onDidChangeEmitter.event;
            this.titleIncludesFocusedView = false;
            this.editorService = editorService.createScoped(editorGroupsContainer, this._store);
            this.updateTitleIncludesFocusedView();
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
            this._register(this.editorService.onDidActiveEditorChange(() => this.onActiveEditorChange()));
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.titleUpdater.schedule()));
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.titleUpdater.schedule()));
            this._register(this.contextService.onDidChangeWorkspaceName(() => this.titleUpdater.schedule()));
            this._register(this.labelService.onDidChangeFormatters(() => this.titleUpdater.schedule()));
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => this.titleUpdater.schedule()));
            this._register(this.viewsService.onDidChangeFocusedView(() => {
                if (this.titleIncludesFocusedView) {
                    this.titleUpdater.schedule();
                }
            }));
        }
        onConfigurationChanged(event) {
            if (event.affectsConfiguration("window.title" /* WindowSettingNames.title */)) {
                this.updateTitleIncludesFocusedView();
            }
            if (event.affectsConfiguration("window.title" /* WindowSettingNames.title */) || event.affectsConfiguration("window.titleSeparator" /* WindowSettingNames.titleSeparator */)) {
                this.titleUpdater.schedule();
            }
        }
        updateTitleIncludesFocusedView() {
            const titleTemplate = this.configurationService.getValue("window.title" /* WindowSettingNames.title */);
            this.titleIncludesFocusedView = typeof titleTemplate === 'string' && titleTemplate.includes('${focusedView}');
        }
        onActiveEditorChange() {
            // Dispose old listeners
            this.activeEditorListeners.clear();
            // Calculate New Window Title
            this.titleUpdater.schedule();
            // Apply listener for dirty and label changes
            const activeEditor = this.editorService.activeEditor;
            if (activeEditor) {
                this.activeEditorListeners.add(activeEditor.onDidChangeDirty(() => this.titleUpdater.schedule()));
                this.activeEditorListeners.add(activeEditor.onDidChangeLabel(() => this.titleUpdater.schedule()));
            }
            // Apply listeners for tracking focused code editor
            if (this.titleIncludesFocusedView) {
                const activeTextEditorControl = this.editorService.activeTextEditorControl;
                const textEditorControls = [];
                if ((0, editorBrowser_1.isCodeEditor)(activeTextEditorControl)) {
                    textEditorControls.push(activeTextEditorControl);
                }
                else if ((0, editorBrowser_1.isDiffEditor)(activeTextEditorControl)) {
                    textEditorControls.push(activeTextEditorControl.getOriginalEditor(), activeTextEditorControl.getModifiedEditor());
                }
                for (const textEditorControl of textEditorControls) {
                    this.activeEditorListeners.add(textEditorControl.onDidBlurEditorText(() => this.titleUpdater.schedule()));
                    this.activeEditorListeners.add(textEditorControl.onDidFocusEditorText(() => this.titleUpdater.schedule()));
                }
            }
        }
        doUpdateTitle() {
            const title = this.getFullWindowTitle();
            if (title !== this.title) {
                // Always set the native window title to identify us properly to the OS
                let nativeTitle = title;
                if (!(0, strings_1.trim)(nativeTitle)) {
                    nativeTitle = this.productService.nameLong;
                }
                if (!this.targetWindow.document.title && platform_1.isMacintosh && nativeTitle === this.productService.nameLong) {
                    // TODO@electron macOS: if we set a window title for
                    // the first time and it matches the one we set in
                    // `windowImpl.ts` somehow the window does not appear
                    // in the "Windows" menu. As such, we set the title
                    // briefly to something different to ensure macOS
                    // recognizes we have a window.
                    // See: https://github.com/microsoft/vscode/issues/191288
                    this.targetWindow.document.title = `${this.productService.nameLong} ${WindowTitle_1.TITLE_DIRTY}`;
                }
                this.targetWindow.document.title = nativeTitle;
                this.title = title;
                this.onDidChangeEmitter.fire();
            }
        }
        getFullWindowTitle() {
            const { prefix, suffix } = this.getTitleDecorations();
            let title = this.getWindowTitle() || this.productService.nameLong;
            if (prefix) {
                title = `${prefix} ${title}`;
            }
            if (suffix) {
                title = `${title} ${suffix}`;
            }
            // Replace non-space whitespace
            return title.replace(/[^\S ]/g, ' ');
        }
        getTitleDecorations() {
            let prefix;
            let suffix;
            if (this.properties.prefix) {
                prefix = this.properties.prefix;
            }
            if (this.environmentService.isExtensionDevelopment) {
                prefix = !prefix
                    ? WindowTitle_1.NLS_EXTENSION_HOST
                    : `${WindowTitle_1.NLS_EXTENSION_HOST} - ${prefix}`;
            }
            if (this.properties.isAdmin) {
                suffix = WindowTitle_1.NLS_USER_IS_ADMIN;
            }
            return { prefix, suffix };
        }
        updateProperties(properties) {
            const isAdmin = typeof properties.isAdmin === 'boolean' ? properties.isAdmin : this.properties.isAdmin;
            const isPure = typeof properties.isPure === 'boolean' ? properties.isPure : this.properties.isPure;
            const prefix = typeof properties.prefix === 'string' ? properties.prefix : this.properties.prefix;
            if (isAdmin !== this.properties.isAdmin || isPure !== this.properties.isPure || prefix !== this.properties.prefix) {
                this.properties.isAdmin = isAdmin;
                this.properties.isPure = isPure;
                this.properties.prefix = prefix;
                this.titleUpdater.schedule();
            }
        }
        /**
         * Possible template values:
         *
         * {activeEditorLong}: e.g. /Users/Development/myFolder/myFileFolder/myFile.txt
         * {activeEditorMedium}: e.g. myFolder/myFileFolder/myFile.txt
         * {activeEditorShort}: e.g. myFile.txt
         * {activeFolderLong}: e.g. /Users/Development/myFolder/myFileFolder
         * {activeFolderMedium}: e.g. myFolder/myFileFolder
         * {activeFolderShort}: e.g. myFileFolder
         * {rootName}: e.g. myFolder1, myFolder2, myFolder3
         * {rootPath}: e.g. /Users/Development
         * {folderName}: e.g. myFolder
         * {folderPath}: e.g. /Users/Development/myFolder
         * {appName}: e.g. VS Code
         * {remoteName}: e.g. SSH
         * {dirty}: indicator
         * {focusedView}: e.g. Terminal
         * {separator}: conditional separator
         */
        getWindowTitle() {
            const editor = this.editorService.activeEditor;
            const workspace = this.contextService.getWorkspace();
            // Compute root
            let root;
            if (workspace.configuration) {
                root = workspace.configuration;
            }
            else if (workspace.folders.length) {
                root = workspace.folders[0].uri;
            }
            // Compute active editor folder
            const editorResource = editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            let editorFolderResource = editorResource ? (0, resources_1.dirname)(editorResource) : undefined;
            if (editorFolderResource?.path === '.') {
                editorFolderResource = undefined;
            }
            // Compute folder resource
            // Single Root Workspace: always the root single workspace in this case
            // Otherwise: root folder of the currently active file if any
            let folder = undefined;
            if (this.contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                folder = workspace.folders[0];
            }
            else if (editorResource) {
                folder = this.contextService.getWorkspaceFolder(editorResource) ?? undefined;
            }
            // Compute remote
            // vscode-remtoe: use as is
            // otherwise figure out if we have a virtual folder opened
            let remoteName = undefined;
            if (this.environmentService.remoteAuthority && !platform_1.isWeb) {
                remoteName = this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, this.environmentService.remoteAuthority);
            }
            else {
                const virtualWorkspaceLocation = (0, virtualWorkspace_1.getVirtualWorkspaceLocation)(workspace);
                if (virtualWorkspaceLocation) {
                    remoteName = this.labelService.getHostLabel(virtualWorkspaceLocation.scheme, virtualWorkspaceLocation.authority);
                }
            }
            // Variables
            const activeEditorShort = editor ? editor.getTitle(0 /* Verbosity.SHORT */) : '';
            const activeEditorMedium = editor ? editor.getTitle(1 /* Verbosity.MEDIUM */) : activeEditorShort;
            const activeEditorLong = editor ? editor.getTitle(2 /* Verbosity.LONG */) : activeEditorMedium;
            const activeFolderShort = editorFolderResource ? (0, resources_1.basename)(editorFolderResource) : '';
            const activeFolderMedium = editorFolderResource ? this.labelService.getUriLabel(editorFolderResource, { relative: true }) : '';
            const activeFolderLong = editorFolderResource ? this.labelService.getUriLabel(editorFolderResource) : '';
            const rootName = this.labelService.getWorkspaceLabel(workspace);
            const rootNameShort = this.labelService.getWorkspaceLabel(workspace, { verbose: 0 /* LabelVerbosity.SHORT */ });
            const rootPath = root ? this.labelService.getUriLabel(root) : '';
            const folderName = folder ? folder.name : '';
            const folderPath = folder ? this.labelService.getUriLabel(folder.uri) : '';
            const dirty = editor?.isDirty() && !editor.isSaving() ? WindowTitle_1.TITLE_DIRTY : '';
            const appName = this.productService.nameLong;
            const profileName = this.userDataProfileService.currentProfile.isDefault ? '' : this.userDataProfileService.currentProfile.name;
            const separator = this.configurationService.getValue("window.titleSeparator" /* WindowSettingNames.titleSeparator */);
            const titleTemplate = this.configurationService.getValue("window.title" /* WindowSettingNames.title */);
            const focusedView = this.viewsService.getFocusedViewName();
            return (0, labels_1.template)(titleTemplate, {
                activeEditorShort,
                activeEditorLong,
                activeEditorMedium,
                activeFolderShort,
                activeFolderMedium,
                activeFolderLong,
                rootName,
                rootPath,
                rootNameShort,
                folderName,
                folderPath,
                dirty,
                appName,
                remoteName,
                profileName,
                focusedView,
                separator: { label: separator }
            });
        }
        isCustomTitleFormat() {
            const title = this.configurationService.inspect("window.title" /* WindowSettingNames.title */);
            const titleSeparator = this.configurationService.inspect("window.titleSeparator" /* WindowSettingNames.titleSeparator */);
            return title.value !== title.defaultValue || titleSeparator.value !== titleSeparator.defaultValue;
        }
    };
    exports.WindowTitle = WindowTitle;
    exports.WindowTitle = WindowTitle = WindowTitle_1 = __decorate([
        __param(2, configuration_1.IConfigurationService),
        __param(3, editorService_1.IEditorService),
        __param(4, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, label_1.ILabelService),
        __param(7, userDataProfile_1.IUserDataProfileService),
        __param(8, productService_1.IProductService),
        __param(9, viewsService_1.IViewsService)
    ], WindowTitle);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93VGl0bGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3RpdGxlYmFyL3dpbmRvd1RpdGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLElBQVcsa0JBR1Y7SUFIRCxXQUFXLGtCQUFrQjtRQUM1Qiw4REFBd0MsQ0FBQTtRQUN4Qyw0Q0FBc0IsQ0FBQTtJQUN2QixDQUFDLEVBSFUsa0JBQWtCLEtBQWxCLGtCQUFrQixRQUc1QjtJQUVNLElBQU0sV0FBVyxHQUFqQixNQUFNLFdBQVksU0FBUSxzQkFBVTs7aUJBRWxCLHNCQUFpQixHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLEFBQWpHLENBQWtHO2lCQUNuSCx1QkFBa0IsR0FBRyxJQUFBLGNBQVEsRUFBQywrQkFBK0IsRUFBRSw4QkFBOEIsQ0FBQyxBQUE1RSxDQUE2RTtpQkFDL0YsZ0JBQVcsR0FBRyxTQUFTLEFBQVosQ0FBYTtRQVNoRCxJQUFJLEtBQUssS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4QyxJQUFJLGFBQWEsS0FBSyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RyxJQUFJLFFBQVE7WUFDWCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQztZQUNyRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ25CLE9BQU8sU0FBUyxDQUFD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