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
define(["require", "exports", "vs/nls", "vs/base/common/performance", "vs/base/common/decorators", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/files/browser/fileActions", "vs/base/browser/dom", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/contrib/files/browser/views/explorerDecorationsProvider", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/contextkeys", "vs/workbench/services/decorations/common/decorations", "vs/platform/list/browser/listService", "vs/base/browser/dnd", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/label/common/label", "vs/workbench/contrib/files/browser/views/explorerViewer", "vs/platform/theme/common/themeService", "vs/platform/actions/common/actions", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/files/common/explorerModel", "vs/workbench/browser/labels", "vs/platform/storage/common/storage", "vs/platform/clipboard/common/clipboardService", "vs/platform/files/common/files", "vs/base/common/event", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/platform/opener/common/opener", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/contrib/files/browser/files", "vs/base/common/codicons", "vs/platform/commands/common/commands", "vs/workbench/services/editor/common/editorResolverService", "vs/platform/editor/common/editor", "vs/base/common/map", "vs/base/browser/ui/list/listWidget"], function (require, exports, nls, perf, decorators_1, files_1, fileActions_1, DOM, layoutService_1, explorerDecorationsProvider_1, workspace_1, configuration_1, keybinding_1, instantiation_1, progress_1, contextView_1, contextkey_1, contextkeys_1, decorations_1, listService_1, dnd_1, editorService_1, viewPane_1, label_1, explorerViewer_1, themeService_1, actions_1, telemetry_1, explorerModel_1, labels_1, storage_1, clipboardService_1, files_2, event_1, theme_1, views_1, viewsService_1, opener_1, uriIdentity_1, editor_1, files_3, codicons_1, commands_1, editorResolverService_1, editor_2, map_1, listWidget_1) {
    "use strict";
    var ExplorerView_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createFileIconThemableTreeContainerScope = exports.ExplorerView = exports.getContext = void 0;
    function hasExpandedRootChild(tree, treeInput) {
        for (const folder of treeInput) {
            if (tree.hasNode(folder) && !tree.isCollapsed(folder)) {
                for (const [, child] of folder.children.entries()) {
                    if (tree.hasNode(child) && tree.isCollapsible(child) && !tree.isCollapsed(child)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
     * Whether or not any of the nodes in the tree are expanded
     */
    function hasExpandedNode(tree, treeInput) {
        for (const folder of treeInput) {
            if (tree.hasNode(folder) && !tree.isCollapsed(folder)) {
                return true;
            }
        }
        return false;
    }
    const identityProvider = {
        getId: (stat) => {
            if (stat instanceof explorerModel_1.NewExplorerItem) {
                return `new:${stat.getId()}`;
            }
            return stat.getId();
        }
    };
    function getContext(focus, selection, respectMultiSelection, compressedNavigationControllerProvider) {
        let focusedStat;
        focusedStat = focus.length ? focus[0] : undefined;
        // If we are respecting multi-select and we have a multi-selection we ignore focus as we want to act on the selection
        if (respectMultiSelection && selection.length > 1) {
            focusedStat = undefined;
        }
        const compressedNavigationControllers = focusedStat && compressedNavigationControllerProvider.getCompressedNavigationController(focusedStat);
        const compressedNavigationController = compressedNavigationControllers && compressedNavigationControllers.length ? compressedNavigationControllers[0] : undefined;
        focusedStat = compressedNavigationController ? compressedNavigationController.current : focusedStat;
        const selectedStats = [];
        for (const stat of selection) {
            const controllers = compressedNavigationControllerProvider.getCompressedNavigationController(stat);
            const controller = controllers && controllers.length ? controllers[0] : undefined;
            if (controller && focusedStat && controller === compressedNavigationController) {
                if (stat === focusedStat) {
                    selectedStats.push(stat);
                }
                // Ignore stats which are selected but are part of the same compact node as the focused stat
                continue;
            }
            if (controller) {
                selectedStats.push(...controller.items);
            }
            else {
                selectedStats.push(stat);
            }
        }
        if (!focusedStat) {
            if (respectMultiSelection) {
                return selectedStats;
            }
            else {
                return [];
            }
        }
        if (respectMultiSelection && selectedStats.indexOf(focusedStat) >= 0) {
            return selectedStats;
        }
        return [focusedStat];
    }
    exports.getContext = getContext;
    let ExplorerView = class ExplorerView extends viewPane_1.ViewPane {
        static { ExplorerView_1 = this; }
        static { this.TREE_VIEW_STATE_STORAGE_KEY = 'workbench.explorer.treeViewState'; }
        constructor(options, contextMenuService, viewDescriptorService, instantiationService, contextService, progressService, editorService, editorResolverService, layoutService, keybindingService, contextKeyService, configurationService, decorationService, labelService, themeService, telemetryService, explorerService, storageService, clipboardService, fileService, uriIdentityService, commandService, openerService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.contextService = contextService;
            this.progressService = progressService;
            this.editorService = editorService;
            this.editorResolverService = editorResolverService;
            this.layoutService = layoutService;
            this.decorationService = decorationService;
            this.labelService = labelService;
            this.explorerService = explorerService;
            this.storageService = storageService;
            this.clipboardService = clipboardService;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.commandService = commandService;
            this._autoReveal = false;
            this.delegate = options.delegate;
            this.resourceContext = instantiationService.createInstance(contextkeys_1.ResourceContextKey);
            this._register(this.resourceContext);
            this.folderContext = files_1.ExplorerFolderContext.bindTo(contextKeyService);
            this.readonlyContext = files_1.ExplorerResourceReadonlyContext.bindTo(contextKeyService);
            this.availableEditorIdsContext = files_1.ExplorerResourceAvailableEditorIdsContext.bindTo(contextKeyService);
            this.rootContext = files_1.ExplorerRootContext.bindTo(contextKeyService);
            this.resourceMoveableToTrash = files_1.ExplorerResourceMoveableToTrash.bindTo(contextKeyService);
            this.compressedFocusContext = files_1.ExplorerCompressedFocusContext.bindTo(contextKeyService);
            this.compressedFocusFirstContext = files_1.ExplorerCompressedFirstFocusContext.bindTo(contextKeyService);
            this.compressedFocusLastContext = files_1.ExplorerCompressedLastFocusContext.bindTo(contextKeyService);
            this.viewHasSomeCollapsibleRootItem = files_1.ViewHasSomeCollapsibleRootItemContext.bindTo(contextKeyService);
            this.viewVisibleContextKey = files_1.FoldersViewVisibleContext.bindTo(contextKeyService);
            this.explorerService.registerView(this);
        }
        get autoReveal() {
            return this._autoReveal;
        }
        set autoReveal(autoReveal) {
            this._autoReveal = autoReveal;
        }
        get name() {
            return this.labelService.getWorkspaceLabel(this.contextService.getWorkspace());
        }
        get title() {
            return this.name;
        }
        set title(_) {
            // noop
        }
        setVisible(visible) {
            this.viewVisibleContextKey.set(visible);
            super.setVisible(visible);
        }
        get fileCopiedContextKey() {
            return fileActions_1.FileCopiedContext.bindTo(this.contextKeyService);
        }
        get resourceCutContextKey() {
            return files_1.ExplorerResourceCut.bindTo(this.contextKeyService);
        }
        // Split view methods
        renderHeader(container) {
            super.renderHeader(container);
            // Expand on drag over
            this.dragHandler = new dnd_1.DelayedDragHandler(container, () => this.setExpanded(true));
            const titleElement = container.querySelector('.title');
            const setHeader = () => {
                const workspace = this.contextService.getWorkspace();
                const title = workspace.folders.map(folder => folder.name).join();
                titleElement.textContent = this.name;
                titleElement.title = title;
                this.ariaHeaderLabel = nls.localize('explorerSection', "Explorer Section: {0}", this.name);
                titleElement.setAttribute('aria-label', this.ariaHeaderLabel);
            };
            this._register(this.contextService.onDidChangeWorkspaceName(setHeader));
            this._register(this.labelService.onDidChangeFormatters(setHeader));
            setHeader();
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.tree.layout(height, width);
        }
        renderBody(container) {
            super.renderBody(container);
            this.container = container;
            this.treeContainer = DOM.append(container, DOM.$('.explorer-folders-view'));
            this.createTree(this.treeContainer);
            this._register(this.labelService.onDidChangeFormatters(() => {
                this._onDidChangeTitleArea.fire();
            }));
            // Update configuration
            this.onConfigurationUpdated(undefined);
            // When the explorer viewer is loaded, listen to changes to the editor input
            this._register(this.editorService.onDidActiveEditorChange(() => {
                this.selectActiveFile();
            }));
            // Also handle configuration updates
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
            this._register(this.onDidChangeBodyVisibility(async (visible) => {
                if (visible) {
                    // Always refresh explorer when it becomes visible to compensate for missing file events #126817
                    await this.setTreeInput();
                    // Update the collapse / expand  button state
                    this.updateAnyCollapsedContext();
                    // Find resource to focus from active editor input if set
                    this.selectActiveFile(true);
                }
            }));
            // Support for paste of files into explorer
            this._register(DOM.addDisposableListener(DOM.getWindow(this.container), DOM.EventType.PASTE, async (event) => {
                if (!this.hasFocus() || this.readonlyContext.get()) {
                    return;
                }
                if (event.clipboardData?.files?.length) {
                    await this.commandService.executeCommand('filesExplorer.paste', event.clipboardData?.files);
                }
            }));
        }
        focus() {
            super.focus();
            this.tree.domFocus();
            if (this.tree.getFocusedPart() === 0 /* AbstractTreePart.Tree */) {
                const focused = this.tree.getFocus();
                if (focused.length === 1 && this._autoReveal) {
                    this.tree.reveal(focused[0], 0.5);
                }
            }
        }
        hasFocus() {
            return DOM.isAncestorOfActiveElement(this.container);
        }
        getFocus() {
            return this.tree.getFocus();
        }
        focusNext() {
            this.tree.focusNext();
        }
        focusLast() {
            this.tree.focusLast();
        }
        getContext(respectMultiSelection) {
            const focusedItems = this.tree.getFocusedPart() === 1 /* AbstractTreePart.StickyScroll */ ?
                this.tree.getStickyScrollFocus() :
                this.tree.getFocus();
            return getContext(focusedItems, this.tree.getSelection(), respectMultiSelection, this.renderer);
        }
        isItemVisible(item) {
            // If filter is undefined it means the tree hasn't been rendered yet, so nothing is visible
            if (!this.filter) {
                return false;
            }
            return this.filter.filter(item, 1 /* TreeVisibility.Visible */);
        }
        isItemCollapsed(item) {
            return this.tree.isCollapsed(item);
        }
        async setEditable(stat, isEditing) {
            if (isEditing) {
                this.horizontalScrolling = this.tree.options.horizontalScrolling;
                if (this.horizontalScrolling) {
                    this.tree.updateOptions({ horizontalScrolling: false });
                }
                await this.tree.expand(stat.parent);
            }
            else {
                if (this.horizontalScrolling !== undefined) {
                    this.tree.updateOptions({ horizontalScrolling: this.horizontalScrolling });
                }
                this.horizontalScrolling = undefined;
                this.treeContainer.classList.remove('highlight');
            }
            await this.refresh(false, stat.parent, false);
            if (isEditing) {
                this.treeContainer.classList.add('highlight');
                this.tree.reveal(stat);
            }
            else {
                this.tree.domFocus();
            }
        }
        async selectActiveFile(reveal = this._autoReveal) {
            if (this._autoReveal) {
                const activeFile = editor_1.EditorResourceAccessor.getCanonicalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                if (activeFile) {
                    const focus = this.tree.getFocus();
                    const selection = this.tree.getSelection();
                    if (focus.length === 1 && this.uriIdentityService.extUri.isEqual(focus[0].resource, activeFile) && selection.length === 1 && this.uriIdentityService.extUri.isEqual(selection[0].resource, activeFile)) {
                        // No action needed, active file is already focused and selected
                        return;
                    }
                    return this.explorerService.select(activeFile, reveal);
                }
            }
        }
        createTree(container) {
            this.filter = this.instantiationService.createInstance(explorerViewer_1.FilesFilter);
            this._register(this.filter);
            this._register(this.filter.onDidChange(() => this.refresh(true)));
            const explorerLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this._register(explorerLabels);
            const updateWidth = (stat) => this.tree.updateWidth(stat);
            this.renderer = this.instantiationService.createInstance(explorerViewer_1.FilesRenderer, container, explorerLabels, updateWidth);
            this._register(this.renderer);
            this._register(createFileIconThemableTreeContainerScope(container, this.themeService));
            const isCompressionEnabled = () => this.configurationService.getValue('explorer.compactFolders');
            const getFileNestingSettings = (item) => this.configurationService.getValue({ resource: item?.root.resource }).explorer.fileNesting;
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchCompressibleAsyncDataTree, 'FileExplorer', container, new explorerViewer_1.ExplorerDelegate(), new explorerViewer_1.ExplorerCompressionDelegate(), [this.renderer], this.instantiationService.createInstance(explorerViewer_1.ExplorerDataSource, this.filter), {
                compressionEnabled: isCompressionEnabled(),
                accessibilityProvider: this.renderer,
                identityProvider,
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (stat) => {
                        if (this.explorerService.isEditable(stat)) {
                            return undefined;
                        }
                        return stat.name;
                    },
                    getCompressedNodeKeyboardNavigationLabel: (stats) => {
                        if (stats.some(stat => this.explorerService.isEditable(stat))) {
                            return undefined;
                        }
                        return stats.map(stat => stat.name).join('/');
                    }
                },
                multipleSelectionSupport: true,
                filter: this.filter,
                sorter: this.instantiationService.createInstance(explorerViewer_1.FileSorter),
                dnd: this.instantiationService.createInstance(explorerViewer_1.FileDragAndDrop, (item) => this.isItemCollapsed(item)),
                collapseByDefault: (e) => {
                    if (e instanceof explorerModel_1.ExplorerItem) {
                        if (e.hasNests && getFileNestingSettings(e).expand) {
                            return false;
                        }
                    }
                    return true;
                },
                autoExpandSingleChildren: true,
                expandOnlyOnTwistieClick: (e) => {
                    if (e instanceof explorerModel_1.ExplorerItem) {
                        if (e.hasNests) {
                            return true;
                        }
                        else if (this.configurationService.getValue('workbench.tree.expandMode') === 'doubleClick') {
                            return true;
                        }
                    }
                    return false;
                },
                paddingBottom: explorerViewer_1.ExplorerDelegate.ITEM_HEIGHT,
                overrideStyles: {
                    listBackground: theme_1.SIDE_BAR_BACKGROUND
                }
            });
            this._register(this.tree);
            this._register(this.themeService.onDidColorThemeChange(() => this.tree.rerender()));
            // Bind configuration
            const onDidChangeCompressionConfiguration = event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('explorer.compactFolders'));
            this._register(onDidChangeCompressionConfiguration(_ => this.tree.updateOptions({ compressionEnabled: isCompressionEnabled() })));
            // Bind context keys
            files_1.FilesExplorerFocusedContext.bindTo(this.tree.contextKeyService);
            files_1.ExplorerFocusedContext.bindTo(this.tree.contextKeyService);
            // Update resource context based on focused element
            this._register(this.tree.onDidChangeFocus(e => this.onFocusChanged(e.elements)));
            this.onFocusChanged([]);
            // Open when selecting via keyboard
            this._register(this.tree.onDidOpen(async (e) => {
                const element = e.element;
                if (!element) {
                    return;
                }
                // Do not react if the user is expanding selection via keyboard.
                // Check if the item was previously also selected, if yes the user is simply expanding / collapsing current selection #66589.
                const shiftDown = DOM.isKeyboardEvent(e.browserEvent) && e.browserEvent.shiftKey;
                if (!shiftDown) {
                    if (element.isDirectory || this.explorerService.isEditable(undefined)) {
                        // Do not react if user is clicking on explorer items while some are being edited #70276
                        // Do not react if clicking on directories
                        return;
                    }
                    this.telemetryService.publicLog2('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'explorer' });
                    try {
                        this.delegate?.willOpenElement(e.browserEvent);
                        await this.editorService.openEditor({ resource: element.resource, options: { preserveFocus: e.editorOptions.preserveFocus, pinned: e.editorOptions.pinned, source: editor_2.EditorOpenSource.USER } }, e.sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
                    }
                    finally {
                        this.delegate?.didOpenElement();
                    }
                }
            }));
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            this._register(this.tree.onDidScroll(async (e) => {
                const editable = this.explorerService.getEditable();
                if (e.scrollTopChanged && editable && this.tree.getRelativeTop(editable.stat) === null) {
                    await editable.data.onFinish('', false);
                }
            }));
            this._register(this.tree.onDidChangeCollapseState(e => {
                const element = e.node.element?.element;
                if (element) {
                    const navigationControllers = this.renderer.getCompressedNavigationController(element instanceof Array ? element[0] : element);
                    navigationControllers?.forEach(controller => controller.updateCollapsed(e.node.collapsed));
                }
                // Update showing expand / collapse button
                this.updateAnyCollapsedContext();
            }));
            this.updateAnyCollapsedContext();
            this._register(this.tree.onMouseDblClick(e => {
                // If empty space is clicked, and not scrolling by page enabled #173261
                const scrollingByPage = this.configurationService.getValue('workbench.list.scrollByPage');
                if (e.element === null && !scrollingByPage) {
                    // click in empty area -> create a new file #116676
                    this.commandService.executeCommand(fileActions_1.NEW_FILE_COMMAND_ID);
                }
            }));
            // save view state
            this._register(this.storageService.onWillSaveState(() => {
                this.storeTreeViewState();
            }));
        }
        // React on events
        onConfigurationUpdated(event) {
            if (!event || event.affectsConfiguration('explorer.autoReveal')) {
                const configuration = this.configurationService.getValue();
                this._autoReveal = configuration?.explorer?.autoReveal;
            }
            // Push down config updates to components of viewer
            if (event && (event.affectsConfiguration('explorer.decorations.colors') || event.affectsConfiguration('explorer.decorations.badges'))) {
                this.refresh(true);
            }
        }
        storeTreeViewState() {
            this.storageService.store(ExplorerView_1.TREE_VIEW_STATE_STORAGE_KEY, JSON.stringify(this.tree.getViewState()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        setContextKeys(stat) {
            const folders = this.contextService.getWorkspace().folders;
            const resource = stat ? stat.resource : folders[folders.length - 1].uri;
            stat = stat || this.explorerService.findClosest(resource);
            this.resourceContext.set(resource);
            this.folderContext.set(!!stat && stat.isDirectory);
            this.readonlyContext.set(!!stat && !!stat.isReadonly);
            this.rootContext.set(!!stat && stat.isRoot);
            if (resource) {
                const overrides = resource ? this.editorResolverService.getEditors(resource).map(editor => editor.id) : [];
                this.availableEditorIdsContext.set(overrides.join(','));
            }
            else {
                this.availableEditorIdsContext.reset();
            }
        }
        async onContextMenu(e) {
            if ((0, listWidget_1.isInputElement)(e.browserEvent.target)) {
                return;
            }
            const stat = e.element;
            let anchor = e.anchor;
            // Adjust for compressed folders (except when mouse is used)
            if (anchor instanceof HTMLElement) {
                if (stat) {
                    const controllers = this.renderer.getCompressedNavigationController(stat);
                    if (controllers && controllers.length > 0) {
                        if (DOM.isKeyboardEvent(e.browserEvent) || (0, explorerViewer_1.isCompressedFolderName)(e.browserEvent.target)) {
                            anchor = controllers[0].labels[controllers[0].index];
                        }
                        else {
                            controllers.forEach(controller => controller.last());
                        }
                    }
                }
            }
            // update dynamic contexts
            this.fileCopiedContextKey.set(await this.clipboardService.hasResources());
            this.setContextKeys(stat);
            const selection = this.tree.getSelection();
            const roots = this.explorerService.roots; // If the click is outside of the elements pass the root resource if there is only one root. If there are multiple roots pass empty object.
            let arg;
            if (stat instanceof explorerModel_1.ExplorerItem) {
                const compressedControllers = this.renderer.getCompressedNavigationController(stat);
                arg = compressedControllers && compressedControllers.length ? compressedControllers[0].current.resource : stat.resource;
            }
            else {
                arg = roots.length === 1 ? roots[0].resource : {};
            }
            this.contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.ExplorerContext,
                menuActionOptions: { arg, shouldForwardArgs: true },
                contextKeyService: this.tree.contextKeyService,
                getAnchor: () => anchor,
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.tree.domFocus();
                    }
                },
                getActionsContext: () => stat && selection && selection.indexOf(stat) >= 0
                    ? selection.map((fs) => fs.resource)
                    : stat instanceof explorerModel_1.ExplorerItem ? [stat.resource] : []
            });
        }
        onFocusChanged(elements) {
            const stat = elements && elements.length ? elements[0] : undefined;
            this.setContextKeys(stat);
            if (stat) {
                const enableTrash = this.configurationService.getValue().files.enableTrash;
                const hasCapability = this.fileService.hasCapability(stat.resource, 4096 /* FileSystemProviderCapabilities.Trash */);
                this.resourceMoveableToTrash.set(enableTrash && hasCapability);
            }
            else {
                this.resourceMoveableToTrash.reset();
            }
            const compressedNavigationControllers = stat && this.renderer.getCompressedNavigationController(stat);
            if (!compressedNavigationControllers) {
                this.compressedFocusContext.set(false);
                return;
            }
            this.compressedFocusContext.set(true);
            compressedNavigationControllers.forEach(controller => {
                this.updateCompressedNavigationContextKeys(controller);
            });
        }
        // General methods
        /**
         * Refresh the contents of the explorer to get up to date data from the disk about the file structure.
         * If the item is passed we refresh only that level of the tree, otherwise we do a full refresh.
         */
        refresh(recursive, item, cancelEditing = true) {
            if (!this.tree || !this.isBodyVisible() || (item && !this.tree.hasNode(item))) {
                // Tree node doesn't exist yet, when it becomes visible we will refresh
                return Promise.resolve(undefined);
            }
            if (cancelEditing && this.explorerService.isEditable(undefined)) {
                this.tree.domFocus();
            }
            const toRefresh = item || this.tree.getInput();
            return this.tree.updateChildren(toRefresh, recursive, !!item);
        }
        getOptimalWidth() {
            const parentNode = this.tree.getHTMLElement();
            const childNodes = [].slice.call(parentNode.querySelectorAll('.explorer-item .label-name')); // select all file labels
            return DOM.getLargestChildWidth(parentNode, childNodes);
        }
        async setTreeInput() {
            if (!this.isBodyVisible()) {
                return Promise.resolve(undefined);
            }
            // Wait for the last execution to complete before executing
            if (this.setTreeInputPromise) {
                await this.setTreeInputPromise;
            }
            const initialInputSetup = !this.tree.getInput();
            if (initialInputSetup) {
                perf.mark('code/willResolveExplorer');
            }
            const roots = this.explorerService.roots;
            let input = roots[0];
            if (this.contextService.getWorkbenchState() !== 2 /* WorkbenchState.FOLDER */ || roots[0].error) {
                // Display roots only when multi folder workspace
                input = roots;
            }
            let viewState;
            if (this.tree && this.tree.getInput()) {
                viewState = this.tree.getViewState();
            }
            else {
                const rawViewState = this.storageService.get(ExplorerView_1.TREE_VIEW_STATE_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
                if (rawViewState) {
                    viewState = JSON.parse(rawViewState);
                }
            }
            const previousInput = this.tree.getInput();
            const promise = this.setTreeInputPromise = this.tree.setInput(input, viewState).then(async () => {
                if (Array.isArray(input)) {
                    if (!viewState || previousInput instanceof explorerModel_1.ExplorerItem) {
                        // There is no view state for this workspace (we transitioned from a folder workspace?), expand up to five roots.
                        // If there are many roots in a workspace, expanding them all would can cause performance issues #176226
                        for (let i = 0; i < Math.min(input.length, 5); i++) {
                            try {
                                await this.tree.expand(input[i]);
                            }
                            catch (e) { }
                        }
                    }
                    // Reloaded or transitioned from an empty workspace, but only have a single folder in the workspace.
                    if (!previousInput && input.length === 1 && this.configurationService.getValue().explorer.expandSingleFolderWorkspaces) {
                        await this.tree.expand(input[0]).catch(() => { });
                    }
                    if (Array.isArray(previousInput)) {
                        const previousRoots = new map_1.ResourceMap();
                        previousInput.forEach(previousRoot => previousRoots.set(previousRoot.resource, true));
                        // Roots added to the explorer -> expand them.
                        await Promise.all(input.map(async (item) => {
                            if (!previousRoots.has(item.resource)) {
                                try {
                                    await this.tree.expand(item);
                                }
                                catch (e) { }
                            }
                        }));
                    }
                }
                if (initialInputSetup) {
                    perf.mark('code/didResolveExplorer');
                }
            });
            this.progressService.withProgress({
                location: 1 /* ProgressLocation.Explorer */,
                delay: this.layoutService.isRestored() ? 800 : 1500 // reduce progress visibility when still restoring
            }, _progress => promise);
            await promise;
            if (!this.decorationsProvider) {
                this.decorationsProvider = new explorerDecorationsProvider_1.ExplorerDecorationsProvider(this.explorerService, this.contextService);
                this._register(this.decorationService.registerDecorationsProvider(this.decorationsProvider));
            }
        }
        async selectResource(resource, reveal = this._autoReveal, retry = 0) {
            // do no retry more than once to prevent infinite loops in cases of inconsistent model
            if (retry === 2) {
                return;
            }
            if (!resource || !this.isBodyVisible()) {
                return;
            }
            // If something is refreshing the explorer, we must await it or else a selection race condition can occur
            if (this.setTreeInputPromise) {
                await this.setTreeInputPromise;
            }
            // Expand all stats in the parent chain.
            let item = this.explorerService.findClosestRoot(resource);
            while (item && item.resource.toString() !== resource.toString()) {
                try {
                    await this.tree.expand(item);
                }
                catch (e) {
                    return this.selectResource(resource, reveal, retry + 1);
                }
                if (!item.children.size) {
                    item = null;
                }
                else {
                    for (const child of item.children.values()) {
                        if (this.uriIdentityService.extUri.isEqualOrParent(resource, child.resource)) {
                            item = child;
                            break;
                        }
                        item = null;
                    }
                }
            }
            if (item) {
                if (item === this.tree.getInput()) {
                    this.tree.setFocus([]);
                    this.tree.setSelection([]);
                    return;
                }
                try {
                    // We must expand the nest to have it be populated in the tree
                    if (item.nestedParent) {
                        await this.tree.expand(item.nestedParent);
                    }
                    if ((reveal === true || reveal === 'force') && this.tree.getRelativeTop(item) === null) {
                        // Don't scroll to the item if it's already visible, or if set not to.
                        this.tree.reveal(item, 0.5);
                    }
                    this.tree.setFocus([item]);
                    this.tree.setSelection([item]);
                }
                catch (e) {
                    // Element might not be in the tree, try again and silently fail
                    return this.selectResource(resource, reveal, retry + 1);
                }
            }
        }
        itemsCopied(stats, cut, previousCut) {
            this.fileCopiedContextKey.set(stats.length > 0);
            this.resourceCutContextKey.set(cut && stats.length > 0);
            previousCut?.forEach(item => this.tree.rerender(item));
            if (cut) {
                stats.forEach(s => this.tree.rerender(s));
            }
        }
        expandAll() {
            if (this.explorerService.isEditable(undefined)) {
                this.tree.domFocus();
            }
            this.tree.expandAll();
        }
        collapseAll() {
            if (this.explorerService.isEditable(undefined)) {
                this.tree.domFocus();
            }
            const treeInput = this.tree.getInput();
            if (Array.isArray(treeInput)) {
                if (hasExpandedRootChild(this.tree, treeInput)) {
                    treeInput.forEach(folder => {
                        folder.children.forEach(child => this.tree.hasNode(child) && this.tree.collapse(child, true));
                    });
                    return;
                }
            }
            this.tree.collapseAll();
        }
        previousCompressedStat() {
            const focused = this.tree.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
            compressedNavigationControllers.forEach(controller => {
                controller.previous();
                this.updateCompressedNavigationContextKeys(controller);
            });
        }
        nextCompressedStat() {
            const focused = this.tree.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
            compressedNavigationControllers.forEach(controller => {
                controller.next();
                this.updateCompressedNavigationContextKeys(controller);
            });
        }
        firstCompressedStat() {
            const focused = this.tree.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
            compressedNavigationControllers.forEach(controller => {
                controller.first();
                this.updateCompressedNavigationContextKeys(controller);
            });
        }
        lastCompressedStat() {
            const focused = this.tree.getFocus();
            if (!focused.length) {
                return;
            }
            const compressedNavigationControllers = this.renderer.getCompressedNavigationController(focused[0]);
            compressedNavigationControllers.forEach(controller => {
                controller.last();
                this.updateCompressedNavigationContextKeys(controller);
            });
        }
        updateCompressedNavigationContextKeys(controller) {
            this.compressedFocusFirstContext.set(controller.index === 0);
            this.compressedFocusLastContext.set(controller.index === controller.count - 1);
        }
        updateAnyCollapsedContext() {
            const treeInput = this.tree.getInput();
            if (treeInput === undefined) {
                return;
            }
            const treeInputArray = Array.isArray(treeInput) ? treeInput : Array.from(treeInput.children.values());
            // Has collapsible root when anything is expanded
            this.viewHasSomeCollapsibleRootItem.set(hasExpandedNode(this.tree, treeInputArray));
            // synchronize state to cache
            this.storeTreeViewState();
        }
        dispose() {
            this.dragHandler?.dispose();
            super.dispose();
        }
    };
    exports.ExplorerView = ExplorerView;
    __decorate([
        decorators_1.memoize
    ], ExplorerView.prototype, "fileCopiedContextKey", null);
    __decorate([
        decorators_1.memoize
    ], ExplorerView.prototype, "resourceCutContextKey", null);
    exports.ExplorerView = ExplorerView = ExplorerView_1 = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, views_1.IViewDescriptorService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, progress_1.IProgressService),
        __param(6, editorService_1.IEditorService),
        __param(7, editorResolverService_1.IEditorResolverService),
        __param(8, layoutService_1.IWorkbenchLayoutService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, decorations_1.IDecorationsService),
        __param(13, label_1.ILabelService),
        __param(14, themeService_1.IThemeService),
        __param(15, telemetry_1.ITelemetryService),
        __param(16, files_3.IExplorerService),
        __param(17, storage_1.IStorageService),
        __param(18, clipboardService_1.IClipboardService),
        __param(19, files_2.IFileService),
        __param(20, uriIdentity_1.IUriIdentityService),
        __param(21, commands_1.ICommandService),
        __param(22, opener_1.IOpenerService)
    ], ExplorerView);
    function createFileIconThemableTreeContainerScope(container, themeService) {
        container.classList.add('file-icon-themable-tree');
        container.classList.add('show-file-icons');
        const onDidChangeFileIconTheme = (theme) => {
            container.classList.toggle('align-icons-and-twisties', theme.hasFileIcons && !theme.hasFolderIcons);
            container.classList.toggle('hide-arrows', theme.hidesExplorerArrows === true);
        };
        onDidChangeFileIconTheme(themeService.getFileIconTheme());
        return themeService.onDidFileIconThemeChange(onDidChangeFileIconTheme);
    }
    exports.createFileIconThemableTreeContainerScope = createFileIconThemableTreeContainerScope;
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.files.action.createFileFromExplorer',
                title: nls.localize('createNewFile', "New File..."),
                f1: false,
                icon: codicons_1.Codicon.newFile,
                precondition: files_1.ExplorerResourceNotReadonlyContext,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', files_1.VIEW_ID),
                    order: 10
                }
            });
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            commandService.executeCommand(fileActions_1.NEW_FILE_COMMAND_ID);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.files.action.createFolderFromExplorer',
                title: nls.localize('createNewFolder', "New Folder..."),
                f1: false,
                icon: codicons_1.Codicon.newFolder,
                precondition: files_1.ExplorerResourceNotReadonlyContext,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', files_1.VIEW_ID),
                    order: 20
                }
            });
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            commandService.executeCommand(fileActions_1.NEW_FOLDER_COMMAND_ID);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.files.action.refreshFilesExplorer',
                title: { value: nls.localize('refreshExplorer', "Refresh Explorer"), original: 'Refresh Explorer' },
                f1: true,
                icon: codicons_1.Codicon.refresh,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', files_1.VIEW_ID),
                    order: 30
                }
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const explorerService = accessor.get(files_3.IExplorerService);
            await viewsService.openView(files_1.VIEW_ID);
            await explorerService.refresh();
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.files.action.collapseExplorerFolders',
                title: { value: nls.localize('collapseExplorerFolders', "Collapse Folders in Explorer"), original: 'Collapse Folders in Explorer' },
                f1: true,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', files_1.VIEW_ID),
                    order: 40
                }
            });
        }
        run(accessor) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const view = viewsService.getViewWithId(files_1.VIEW_ID);
            if (view !== null) {
                const explorerView = view;
                explorerView.collapseAll();
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwbG9yZXJWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9icm93c2VyL3ZpZXdzL2V4cGxvcmVyVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeURoRyxTQUFTLG9CQUFvQixDQUFDLElBQWlHLEVBQUUsU0FBeUI7UUFDekosS0FBSyxNQUFNLE1BQU0sSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNoQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZELEtBQUssTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO29CQUNuRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDbEYsT0FBTyxJQUFJLENBQUM7b0JBQ2IsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsZUFBZSxDQUFDLElBQWlHLEVBQUUsU0FBeUI7UUFDcEosS0FBSyxNQUFNLE1BQU0sSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNoQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZELE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCxNQUFNLGdCQUFnQixHQUFHO1FBQ3hCLEtBQUssRUFBRSxDQUFDLElBQWtCLEVBQUUsRUFBRTtZQUM3QixJQUFJLElBQUksWUFBWSwrQkFBZSxFQUFFLENBQUM7Z0JBQ3JDLE9BQU8sT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUM5QixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUNELENBQUM7SUFFRixTQUFnQixVQUFVLENBQUMsS0FBcUIsRUFBRSxTQUF5QixFQUFFLHFCQUE4QixFQUMxRyxzQ0FBZ0o7UUFFaEosSUFBSSxXQUFxQyxDQUFDO1FBQzFDLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUVsRCxxSEFBcUg7UUFDckgsSUFBSSxxQkFBcUIsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ25ELFdBQVcsR0FBRyxTQUFTLENBQUM7UUFDekIsQ0FBQztRQUVELE1BQU0sK0JBQStCLEdBQUcsV0FBVyxJQUFJLHNDQUFzQyxDQUFDLGlDQUFpQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdJLE1BQU0sOEJBQThCLEdBQUcsK0JBQStCLElBQUksK0JBQStCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ2xLLFdBQVcsR0FBRyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7UUFFcEcsTUFBTSxhQUFhLEdBQW1CLEVBQUUsQ0FBQztRQUV6QyxLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQzlCLE1BQU0sV0FBVyxHQUFHLHNDQUFzQyxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25HLE1BQU0sVUFBVSxHQUFHLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNsRixJQUFJLFVBQVUsSUFBSSxXQUFXLElBQUksVUFBVSxLQUFLLDhCQUE4QixFQUFFLENBQUM7Z0JBQ2hGLElBQUksSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO29CQUMxQixhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxQixDQUFDO2dCQUNELDRGQUE0RjtnQkFDNUYsU0FBUztZQUNWLENBQUM7WUFFRCxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNoQixhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLENBQUM7UUFDRixDQUFDO1FBQ0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2xCLElBQUkscUJBQXFCLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxhQUFhLENBQUM7WUFDdEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztRQUNGLENBQUM7UUFFRCxJQUFJLHFCQUFxQixJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDdEUsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVELE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBL0NELGdDQStDQztJQVdNLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQWEsU0FBUSxtQkFBUTs7aUJBQ3pCLGdDQUEyQixHQUFXLGtDQUFrQyxBQUE3QyxDQUE4QztRQWdDekYsWUFDQyxPQUFpQyxFQUNaLGtCQUF1QyxFQUNwQyxxQkFBNkMsRUFDOUMsb0JBQTJDLEVBQ3hDLGNBQXlELEVBQ2pFLGVBQWtELEVBQ3BELGFBQThDLEVBQ3RDLHFCQUE4RCxFQUM3RCxhQUF1RCxFQUM1RCxpQkFBcUMsRUFDckMsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUM3QyxpQkFBdUQsRUFDN0QsWUFBNEMsRUFDNUMsWUFBb0MsRUFDaEMsZ0JBQW1DLEVBQ3BDLGVBQWtELEVBQ25ELGNBQWdELEVBQzlDLGdCQUEyQyxFQUNoRCxXQUEwQyxFQUNuQyxrQkFBd0QsRUFDNUQsY0FBZ0QsRUFDakQsYUFBNkI7WUFFN0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFwQmhKLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUNoRCxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDbkMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3JCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQXlCO1lBSTFDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBcUI7WUFDNUMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFHeEIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ2xDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQy9CLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2xCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDM0MsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBMUIxRCxnQkFBVyxHQUF3QyxLQUFLLENBQUM7WUErQmhFLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUNqQyxJQUFJLENBQUMsZUFBZSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxnQ0FBa0IsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxhQUFhLEdBQUcsNkJBQXFCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLGVBQWUsR0FBRyx1Q0FBK0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMseUJBQXlCLEdBQUcsaURBQXlDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDckcsSUFBSSxDQUFDLFdBQVcsR0FBRywyQkFBbUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsdUJBQXVCLEdBQUcsdUNBQStCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLHNCQUFzQixHQUFHLHNDQUE4QixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3ZGLElBQUksQ0FBQywyQkFBMkIsR0FBRywyQ0FBbUMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNqRyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsMENBQWtDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0YsSUFBSSxDQUFDLDhCQUE4QixHQUFHLDZDQUFxQyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3RHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUdqRixJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRUQsSUFBSSxVQUFVO1lBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxJQUFJLFVBQVUsQ0FBQyxVQUErQztZQUM3RCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ1AsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRUQsSUFBYSxLQUFLO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNsQixDQUFDO1FBRUQsSUFBYSxLQUFLLENBQUMsQ0FBUztZQUMzQixPQUFPO1FBQ1IsQ0FBQztRQUVRLFVBQVUsQ0FBQyxPQUFnQjtZQUNuQyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVRLElBQVksb0JBQW9CO1lBQ3hDLE9BQU8sK0JBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFUSxJQUFZLHFCQUFxQjtZQUN6QyxPQUFPLDJCQUFtQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQscUJBQXFCO1FBRUYsWUFBWSxDQUFDLFNBQXNCO1lBQ3JELEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFOUIsc0JBQXNCO1lBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSx3QkFBa0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRW5GLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFnQixDQUFDO1lBQ3RFLE1BQU0sU0FBUyxHQUFHLEdBQUcsRUFBRTtnQkFDdEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDckQsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xFLFlBQVksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDckMsWUFBWSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSx1QkFBdUIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNGLFlBQVksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvRCxDQUFDLENBQUM7WUFFRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNuRSxTQUFTLEVBQUUsQ0FBQztRQUNiLENBQUM7UUFFa0IsVUFBVSxDQUFDLE1BQWMsRUFBRSxLQUFhO1lBQzFELEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRWtCLFVBQVUsQ0FBQyxTQUFzQjtZQUNuRCxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTVCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNCLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7WUFFNUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRTtnQkFDM0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSix1QkFBdUI7WUFDdkIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXZDLDRFQUE0RTtZQUM1RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO2dCQUM5RCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosb0NBQW9DO1lBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4RyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7Z0JBQzdELElBQUksT0FBTyxFQUFFLENBQUM7b0JBQ2IsZ0dBQWdHO29CQUNoRyxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDMUIsNkNBQTZDO29CQUM3QyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztvQkFDakMseURBQXlEO29CQUN6RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdCLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosMkNBQTJDO1lBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtnQkFDMUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7b0JBQ3BELE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO29CQUN4QyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzdGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVRLEtBQUs7WUFDYixLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXJCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsa0NBQTBCLEVBQUUsQ0FBQztnQkFDMUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDbkMsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQsUUFBUTtZQUNQLE9BQU8sR0FBRyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsUUFBUTtZQUNQLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRUQsU0FBUztZQUNSLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUVELFNBQVM7WUFDUixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxVQUFVLENBQUMscUJBQThCO1lBQ3hDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLDBDQUFrQyxDQUFDLENBQUM7Z0JBQ2xGLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO2dCQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLHFCQUFxQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRyxDQUFDO1FBRUQsYUFBYSxDQUFDLElBQWtCO1lBQy9CLDJGQUEyRjtZQUMzRixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNsQixPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksaUNBQXlCLENBQUM7UUFDekQsQ0FBQztRQUVELGVBQWUsQ0FBQyxJQUFrQjtZQUNqQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLElBQWtCLEVBQUUsU0FBa0I7WUFDdkQsSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDZixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7Z0JBRWpFLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7b0JBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDekQsQ0FBQztnQkFFRCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFPLENBQUMsQ0FBQztZQUN0QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssU0FBUyxFQUFFLENBQUM7b0JBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztnQkFDNUUsQ0FBQztnQkFFRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEQsQ0FBQztZQUVELE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUU5QyxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUNmLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEIsQ0FBQztRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXO1lBQ3ZELElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN0QixNQUFNLFVBQVUsR0FBRywrQkFBc0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSx5QkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUU1SSxJQUFJLFVBQVUsRUFBRSxDQUFDO29CQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNuQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUMzQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO3dCQUN4TSxnRUFBZ0U7d0JBQ2hFLE9BQU87b0JBQ1IsQ0FBQztvQkFDRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDeEQsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRU8sVUFBVSxDQUFDLFNBQXNCO1lBQ3hDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw0QkFBVyxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVCQUFjLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDO1lBQzNJLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFL0IsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFrQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsOEJBQWEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2hILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTlCLElBQUksQ0FBQyxTQUFTLENBQUMsd0NBQXdDLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBRXZGLE1BQU0sb0JBQW9CLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBVSx5QkFBeUIsQ0FBQyxDQUFDO1lBRTFHLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxJQUFtQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFzQixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUV4SyxJQUFJLENBQUMsSUFBSSxHQUFnRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGdEQUFrQyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsSUFBSSxpQ0FBZ0IsRUFBRSxFQUFFLElBQUksNENBQTJCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFDMVIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtQ0FBa0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzNFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFO2dCQUMxQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDcEMsZ0JBQWdCO2dCQUNoQiwrQkFBK0IsRUFBRTtvQkFDaEMsMEJBQTBCLEVBQUUsQ0FBQyxJQUFrQixFQUFFLEVBQUU7d0JBQ2xELElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs0QkFDM0MsT0FBTyxTQUFTLENBQUM7d0JBQ2xCLENBQUM7d0JBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNsQixDQUFDO29CQUNELHdDQUF3QyxFQUFFLENBQUMsS0FBcUIsRUFBRSxFQUFFO3dCQUNuRSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7NEJBQy9ELE9BQU8sU0FBUyxDQUFDO3dCQUNsQixDQUFDO3dCQUVELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQy9DLENBQUM7aUJBQ0Q7Z0JBQ0Qsd0JBQXdCLEVBQUUsSUFBSTtnQkFDOUIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNuQixNQUFNLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQkFBVSxDQUFDO2dCQUM1RCxHQUFHLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxnQ0FBZSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwRyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUN4QixJQUFJLENBQUMsWUFBWSw0QkFBWSxFQUFFLENBQUM7d0JBQy9CLElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs0QkFDcEQsT0FBTyxLQUFLLENBQUM7d0JBQ2QsQ0FBQztvQkFDRixDQUFDO29CQUNELE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7Z0JBQ0Qsd0JBQXdCLEVBQUUsSUFBSTtnQkFDOUIsd0JBQXdCLEVBQUUsQ0FBQyxDQUFVLEVBQUUsRUFBRTtvQkFDeEMsSUFBSSxDQUFDLFlBQVksNEJBQVksRUFBRSxDQUFDO3dCQUMvQixJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDaEIsT0FBTyxJQUFJLENBQUM7d0JBQ2IsQ0FBQzs2QkFDSSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQWdDLDJCQUEyQixDQUFDLEtBQUssYUFBYSxFQUFFLENBQUM7NEJBQzNILE9BQU8sSUFBSSxDQUFDO3dCQUNiLENBQUM7b0JBQ0YsQ0FBQztvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZCxDQUFDO2dCQUNELGFBQWEsRUFBRSxpQ0FBZ0IsQ0FBQyxXQUFXO2dCQUMzQyxjQUFjLEVBQUU7b0JBQ2YsY0FBYyxFQUFFLDJCQUFtQjtpQkFDbkM7YUFDRCxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFcEYscUJBQXFCO1lBQ3JCLE1BQU0sbUNBQW1DLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBQ3JLLElBQUksQ0FBQyxTQUFTLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVsSSxvQkFBb0I7WUFDcEIsbUNBQTJCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoRSw4QkFBc0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRTNELG1EQUFtRDtZQUNuRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4QixtQ0FBbUM7WUFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7Z0JBQzVDLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDZCxPQUFPO2dCQUNSLENBQUM7Z0JBQ0QsZ0VBQWdFO2dCQUNoRSw2SEFBNkg7Z0JBQzdILE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO2dCQUNqRixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2hCLElBQUksT0FBTyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO3dCQUN2RSx3RkFBd0Y7d0JBQ3hGLDBDQUEwQzt3QkFDMUMsT0FBTztvQkFDUixDQUFDO29CQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQXNFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxFQUFFLDBCQUEwQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUN2TCxJQUFJLENBQUM7d0JBQ0osSUFBSSxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO3dCQUMvQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUseUJBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQywwQkFBVSxDQUFDLENBQUMsQ0FBQyw0QkFBWSxDQUFDLENBQUM7b0JBQ3pPLENBQUM7NEJBQVMsQ0FBQzt3QkFDVixJQUFJLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxDQUFDO29CQUNqQyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXBFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxFQUFFO2dCQUM5QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwRCxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO29CQUN4RixNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDekMsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JELE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztnQkFDeEMsSUFBSSxPQUFPLEVBQUUsQ0FBQztvQkFDYixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsaUNBQWlDLENBQUMsT0FBTyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDL0gscUJBQXFCLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVGLENBQUM7Z0JBQ0QsMENBQTBDO2dCQUMxQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFFakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDNUMsdUVBQXVFO2dCQUN2RSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFVLDZCQUE2QixDQUFDLENBQUM7Z0JBQ25HLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDNUMsbURBQW1EO29CQUNuRCxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxpQ0FBbUIsQ0FBQyxDQUFDO2dCQUN6RCxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLGtCQUFrQjtZQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRTtnQkFDdkQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxrQkFBa0I7UUFFVixzQkFBc0IsQ0FBQyxLQUE0QztZQUMxRSxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQXVCLENBQUM7Z0JBQ2hGLElBQUksQ0FBQyxXQUFXLEdBQUcsYUFBYSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUM7WUFDeEQsQ0FBQztZQUVELG1EQUFtRDtZQUNuRCxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDdkksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQixDQUFDO1FBQ0YsQ0FBQztRQUVPLGtCQUFrQjtZQUN6QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxjQUFZLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLGdFQUFnRCxDQUFDO1FBQzlKLENBQUM7UUFFTyxjQUFjLENBQUMsSUFBcUM7WUFDM0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDM0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDeEUsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFNUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDZCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQzNHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3pELENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDeEMsQ0FBQztRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQXNDO1lBQ2pFLElBQUksSUFBQSwyQkFBYyxFQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBcUIsQ0FBQyxFQUFFLENBQUM7Z0JBQzFELE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN2QixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBRXRCLDREQUE0RDtZQUM1RCxJQUFJLE1BQU0sWUFBWSxXQUFXLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDVixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUUxRSxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUMzQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUEsdUNBQXNCLEVBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDOzRCQUMxRixNQUFNLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3RELENBQUM7NkJBQU0sQ0FBQzs0QkFDUCxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQ3RELENBQUM7b0JBQ0YsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUVELDBCQUEwQjtZQUMxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUxQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRTNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsMklBQTJJO1lBQ3JMLElBQUksR0FBYSxDQUFDO1lBQ2xCLElBQUksSUFBSSxZQUFZLDRCQUFZLEVBQUUsQ0FBQztnQkFDbEMsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwRixHQUFHLEdBQUcscUJBQXFCLElBQUkscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3pILENBQUM7aUJBQU0sQ0FBQztnQkFDUCxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNuRCxDQUFDO1lBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztnQkFDdkMsTUFBTSxFQUFFLGdCQUFNLENBQUMsZUFBZTtnQkFDOUIsaUJBQWlCLEVBQUUsRUFBRSxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFO2dCQUNuRCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQjtnQkFDOUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU07Z0JBQ3ZCLE1BQU0sRUFBRSxDQUFDLFlBQXNCLEVBQUUsRUFBRTtvQkFDbEMsSUFBSSxZQUFZLEVBQUUsQ0FBQzt3QkFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDdEIsQ0FBQztnQkFDRixDQUFDO2dCQUNELGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUN6RSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQWdCLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUM7b0JBQ2xELENBQUMsQ0FBQyxJQUFJLFlBQVksNEJBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7YUFDdEQsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLGNBQWMsQ0FBQyxRQUFpQztZQUN2RCxNQUFNLElBQUksR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDbkUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUxQixJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNWLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQXVCLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztnQkFDaEcsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsa0RBQXVDLENBQUM7Z0JBQzFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLGFBQWEsQ0FBQyxDQUFDO1lBQ2hFLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDdEMsQ0FBQztZQUVELE1BQU0sK0JBQStCLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEcsSUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZDLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QywrQkFBK0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxrQkFBa0I7UUFFbEI7OztXQUdHO1FBQ0gsT0FBTyxDQUFDLFNBQWtCLEVBQUUsSUFBbUIsRUFBRSxnQkFBeUIsSUFBSTtZQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDL0UsdUVBQXVFO2dCQUN2RSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUVELElBQUksYUFBYSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEIsQ0FBQztZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQy9DLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVRLGVBQWU7WUFDdkIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM5QyxNQUFNLFVBQVUsR0FBSSxFQUFvQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtZQUV6SSxPQUFPLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELEtBQUssQ0FBQyxZQUFZO1lBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25DLENBQUM7WUFFRCwyREFBMkQ7WUFDM0QsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUM7WUFDaEMsQ0FBQztZQUVELE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hELElBQUksaUJBQWlCLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQztZQUN6QyxJQUFJLEtBQUssR0FBa0MsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BELElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxrQ0FBMEIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3pGLGlEQUFpRDtnQkFDakQsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNmLENBQUM7WUFFRCxJQUFJLFNBQThDLENBQUM7WUFDbkQsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztnQkFDdkMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGNBQVksQ0FBQywyQkFBMkIsaUNBQXlCLENBQUM7Z0JBQy9HLElBQUksWUFBWSxFQUFFLENBQUM7b0JBQ2xCLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO1lBQ0YsQ0FBQztZQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDM0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQy9GLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUMxQixJQUFJLENBQUMsU0FBUyxJQUFJLGFBQWEsWUFBWSw0QkFBWSxFQUFFLENBQUM7d0JBQ3pELGlIQUFpSDt3QkFDakgsd0dBQXdHO3dCQUN4RyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7NEJBQ3BELElBQUksQ0FBQztnQ0FDSixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNsQyxDQUFDOzRCQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUNoQixDQUFDO29CQUNGLENBQUM7b0JBQ0Qsb0dBQW9HO29CQUNwRyxJQUFJLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQXVCLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFLENBQUM7d0JBQzdJLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuRCxDQUFDO29CQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO3dCQUNsQyxNQUFNLGFBQWEsR0FBRyxJQUFJLGlCQUFXLEVBQVEsQ0FBQzt3QkFDOUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUV0Riw4Q0FBOEM7d0JBQzlDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsRUFBRTs0QkFDeEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0NBQ3ZDLElBQUksQ0FBQztvQ0FDSixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dDQUM5QixDQUFDO2dDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUNoQixDQUFDO3dCQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FBQztnQkFDRixDQUFDO2dCQUNELElBQUksaUJBQWlCLEVBQUUsQ0FBQztvQkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQztnQkFDakMsUUFBUSxtQ0FBMkI7Z0JBQ25DLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrREFBa0Q7YUFDdEcsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpCLE1BQU0sT0FBTyxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSx5REFBMkIsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDdEcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUM5RixDQUFDO1FBQ0YsQ0FBQztRQUVNLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBeUIsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLEdBQUcsQ0FBQztZQUMxRixzRkFBc0Y7WUFDdEYsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ2pCLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDO2dCQUN4QyxPQUFPO1lBQ1IsQ0FBQztZQUVELHlHQUF5RztZQUN6RyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUM5QixNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztZQUNoQyxDQUFDO1lBRUQsd0NBQXdDO1lBQ3hDLElBQUksSUFBSSxHQUF3QixJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUvRSxPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO2dCQUNqRSxJQUFJLENBQUM7b0JBQ0osTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsQ0FBQztnQkFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUNaLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekQsQ0FBQztnQkFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDekIsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDYixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7d0JBQzVDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDOzRCQUM5RSxJQUFJLEdBQUcsS0FBSyxDQUFDOzRCQUNiLE1BQU07d0JBQ1AsQ0FBQzt3QkFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDO29CQUNiLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNWLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMzQixPQUFPO2dCQUNSLENBQUM7Z0JBRUQsSUFBSSxDQUFDO29CQUNKLDhEQUE4RDtvQkFDOUQsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7d0JBQ3ZCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUMzQyxDQUFDO29CQUVELElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQzt3QkFDeEYsc0VBQXNFO3dCQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQzdCLENBQUM7b0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7Z0JBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDWixnRUFBZ0U7b0JBQ2hFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekQsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQsV0FBVyxDQUFDLEtBQXFCLEVBQUUsR0FBWSxFQUFFLFdBQXVDO1lBQ3ZGLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hELFdBQVcsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ1QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsQ0FBQztRQUNGLENBQUM7UUFFRCxTQUFTO1lBQ1IsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RCLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxXQUFXO1lBQ1YsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RCLENBQUM7WUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3ZDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUM5QixJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQztvQkFDaEQsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDMUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDL0YsQ0FBQyxDQUFDLENBQUM7b0JBRUgsT0FBTztnQkFDUixDQUFDO1lBQ0YsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVELHNCQUFzQjtZQUNyQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3JCLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSwrQkFBK0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDO1lBQ3JHLCtCQUErQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDcEQsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMscUNBQXFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsa0JBQWtCO1lBQ2pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDckIsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLCtCQUErQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsaUNBQWlDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUM7WUFDckcsK0JBQStCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNwRCxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxtQkFBbUI7WUFDbEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNyQixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sK0JBQStCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUNyRywrQkFBK0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3BELFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELGtCQUFrQjtZQUNqQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3JCLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSwrQkFBK0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDO1lBQ3JHLCtCQUErQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDcEQsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsQixJQUFJLENBQUMscUNBQXFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8scUNBQXFDLENBQUMsVUFBMkM7WUFDeEYsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTyx5QkFBeUI7WUFDaEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QyxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDN0IsT0FBTztZQUNSLENBQUM7WUFDRCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3RHLGlEQUFpRDtZQUNqRCxJQUFJLENBQUMsOEJBQThCLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDcEYsNkJBQTZCO1lBQzdCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUM1QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQzs7SUF6eUJXLG9DQUFZO0lBd0dmO1FBQVIsb0JBQU87NERBRVA7SUFFUTtRQUFSLG9CQUFPOzZEQUVQOzJCQTlHVyxZQUFZO1FBbUN0QixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsOEJBQXNCLENBQUE7UUFDdEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLG9DQUF3QixDQUFBO1FBQ3hCLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSw4Q0FBc0IsQ0FBQTtRQUN0QixXQUFBLHVDQUF1QixDQUFBO1FBQ3ZCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsWUFBQSwrQkFBa0IsQ0FBQTtRQUNsQixZQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFlBQUEsaUNBQW1CLENBQUE7UUFDbkIsWUFBQSxxQkFBYSxDQUFBO1FBQ2IsWUFBQSw0QkFBYSxDQUFBO1FBQ2IsWUFBQSw2QkFBaUIsQ0FBQTtRQUNqQixZQUFBLHdCQUFnQixDQUFBO1FBQ2hCLFlBQUEseUJBQWUsQ0FBQTtRQUNmLFlBQUEsb0NBQWlCLENBQUE7UUFDakIsWUFBQSxvQkFBWSxDQUFBO1FBQ1osWUFBQSxpQ0FBbUIsQ0FBQTtRQUNuQixZQUFBLDBCQUFlLENBQUE7UUFDZixZQUFBLHVCQUFjLENBQUE7T0F4REosWUFBWSxDQTB5QnhCO0lBRUQsU0FBZ0Isd0NBQXdDLENBQUMsU0FBc0IsRUFBRSxZQUEyQjtRQUMzRyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ25ELFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFM0MsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLEtBQXFCLEVBQUUsRUFBRTtZQUMxRCxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsRUFBRSxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BHLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsbUJBQW1CLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDO1FBRUYsd0JBQXdCLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUMxRCxPQUFPLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFYRCw0RkFXQztJQUVELElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87UUFDcEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLCtDQUErQztnQkFDbkQsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQztnQkFDbkQsRUFBRSxFQUFFLEtBQUs7Z0JBQ1QsSUFBSSxFQUFFLGtCQUFPLENBQUMsT0FBTztnQkFDckIsWUFBWSxFQUFFLDBDQUFrQztnQkFDaEQsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7b0JBQ3BCLEtBQUssRUFBRSxZQUFZO29CQUNuQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGVBQU8sQ0FBQztvQkFDNUMsS0FBSyxFQUFFLEVBQUU7aUJBQ1Q7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQWUsQ0FBQyxDQUFDO1lBQ3JELGNBQWMsQ0FBQyxjQUFjLENBQUMsaUNBQW1CLENBQUMsQ0FBQztRQUNwRCxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsaURBQWlEO2dCQUNyRCxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUM7Z0JBQ3ZELEVBQUUsRUFBRSxLQUFLO2dCQUNULElBQUksRUFBRSxrQkFBTyxDQUFDLFNBQVM7Z0JBQ3ZCLFlBQVksRUFBRSwwQ0FBa0M7Z0JBQ2hELElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO29CQUNwQixLQUFLLEVBQUUsWUFBWTtvQkFDbkIsSUFBSSxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxlQUFPLENBQUM7b0JBQzVDLEtBQUssRUFBRSxFQUFFO2lCQUNUO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQjtZQUM3QixNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFlLENBQUMsQ0FBQztZQUNyRCxjQUFjLENBQUMsY0FBYyxDQUFDLG1DQUFxQixDQUFDLENBQUM7UUFDdEQsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87UUFDcEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDZDQUE2QztnQkFDakQsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUU7Z0JBQ25HLEVBQUUsRUFBRSxJQUFJO2dCQUNSLElBQUksRUFBRSxrQkFBTyxDQUFDLE9BQU87Z0JBQ3JCLElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO29CQUNwQixLQUFLLEVBQUUsWUFBWTtvQkFDbkIsSUFBSSxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxlQUFPLENBQUM7b0JBQzVDLEtBQUssRUFBRSxFQUFFO2lCQUNUO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0QkFBYSxDQUFDLENBQUM7WUFDakQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBZ0IsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sWUFBWSxDQUFDLFFBQVEsQ0FBQyxlQUFPLENBQUMsQ0FBQztZQUNyQyxNQUFNLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQyxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsZ0RBQWdEO2dCQUNwRCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSw4QkFBOEIsQ0FBQyxFQUFFLFFBQVEsRUFBRSw4QkFBOEIsRUFBRTtnQkFDbkksRUFBRSxFQUFFLElBQUk7Z0JBQ1IsSUFBSSxFQUFFLGtCQUFPLENBQUMsV0FBVztnQkFDekIsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7b0JBQ3BCLEtBQUssRUFBRSxZQUFZO29CQUNuQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGVBQU8sQ0FBQztvQkFDNUMsS0FBSyxFQUFFLEVBQUU7aUJBQ1Q7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNEJBQWEsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsZUFBTyxDQUFDLENBQUM7WUFDakQsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sWUFBWSxHQUFHLElBQW9CLENBQUM7Z0JBQzFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM1QixDQUFDO1FBQ0YsQ0FBQztLQUNELENBQUMsQ0FBQyJ9