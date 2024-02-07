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
define(["require", "exports", "vs/workbench/common/editor/editorGroupModel", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dom", "vs/platform/instantiation/common/serviceCollection", "vs/platform/contextkey/common/contextkey", "vs/base/browser/ui/progressbar/progressbar", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/workbench/browser/parts/editor/editorPanes", "vs/platform/progress/common/progress", "vs/workbench/services/progress/browser/progressIndicator", "vs/nls", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/telemetry/common/telemetry", "vs/base/common/async", "vs/base/browser/touch", "vs/workbench/browser/parts/editor/editor", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/base/browser/mouseEvent", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextview/browser/contextView", "vs/workbench/services/editor/common/editorService", "vs/base/common/hash", "vs/editor/common/services/languagesAssociations", "vs/base/common/resources", "vs/base/common/network", "vs/platform/editor/common/editor", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/platform", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/theme/browser/defaultStyles", "vs/workbench/browser/parts/editor/editorGroupWatermark", "vs/workbench/browser/parts/editor/editorTitleControl", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/host/browser/host", "vs/css!./media/editorgroupview"], function (require, exports, editorGroupModel_1, editor_1, contextkeys_1, sideBySideEditorInput_1, event_1, instantiation_1, dom_1, serviceCollection_1, contextkey_1, progressbar_1, themeService_1, colorRegistry_1, theme_1, editorPanes_1, progress_1, progressIndicator_1, nls_1, arrays_1, lifecycle_1, telemetry_1, async_1, touch_1, editor_2, actionbar_1, keybinding_1, actions_1, mouseEvent_1, menuEntryActionViewItem_1, contextView_1, editorService_1, hash_1, languagesAssociations_1, resources_1, network_1, editor_3, dialogs_1, filesConfigurationService_1, uriIdentity_1, platform_1, log_1, telemetryUtils_1, defaultStyles_1, editorGroupWatermark_1, editorTitleControl_1, editorPane_1, editorResolverService_1, host_1) {
    "use strict";
    var EditorGroupView_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorGroupView = void 0;
    let EditorGroupView = EditorGroupView_1 = class EditorGroupView extends themeService_1.Themable {
        //#region factory
        static createNew(editorPartsView, groupsView, groupsLabel, groupIndex, instantiationService) {
            return instantiationService.createInstance(EditorGroupView_1, null, editorPartsView, groupsView, groupsLabel, groupIndex);
        }
        static createFromSerialized(serialized, editorPartsView, groupsView, groupsLabel, groupIndex, instantiationService) {
            return instantiationService.createInstance(EditorGroupView_1, serialized, editorPartsView, groupsView, groupsLabel, groupIndex);
        }
        static createCopy(copyFrom, editorPartsView, groupsView, groupsLabel, groupIndex, instantiationService) {
            return instantiationService.createInstance(EditorGroupView_1, copyFrom, editorPartsView, groupsView, groupsLabel, groupIndex);
        }
        constructor(from, editorPartsView, groupsView, groupsLabel, _index, instantiationService, contextKeyService, themeService, telemetryService, keybindingService, menuService, contextMenuService, fileDialogService, editorService, filesConfigurationService, uriIdentityService, logService, editorResolverService, hostService) {
            super(themeService);
            this.editorPartsView = editorPartsView;
            this.groupsView = groupsView;
            this.groupsLabel = groupsLabel;
            this._index = _index;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.telemetryService = telemetryService;
            this.keybindingService = keybindingService;
            this.menuService = menuService;
            this.contextMenuService = contextMenuService;
            this.fileDialogService = fileDialogService;
            this.editorService = editorService;
            this.filesConfigurationService = filesConfigurationService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.editorResolverService = editorResolverService;
            this.hostService = hostService;
            //#region events
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this._onDidModelChange = this._register(new event_1.Emitter());
            this.onDidModelChange = this._onDidModelChange.event;
            this._onDidActiveEditorChange = this._register(new event_1.Emitter());
            this.onDidActiveEditorChange = this._onDidActiveEditorChange.event;
            this._onDidOpenEditorFail = this._register(new event_1.Emitter());
            this.onDidOpenEditorFail = this._onDidOpenEditorFail.event;
            this._onWillCloseEditor = this._register(new event_1.Emitter());
            this.onWillCloseEditor = this._onWillCloseEditor.event;
            this._onDidCloseEditor = this._register(new event_1.Emitter());
            this.onDidCloseEditor = this._onDidCloseEditor.event;
            this._onWillMoveEditor = this._register(new event_1.Emitter());
            this.onWillMoveEditor = this._onWillMoveEditor.event;
            this._onWillOpenEditor = this._register(new event_1.Emitter());
            this.onWillOpenEditor = this._onWillOpenEditor.event;
            this.disposedEditorsWorker = this._register(new async_1.RunOnceWorker(editors => this.handleDisposedEditors(editors), 0));
            this.mapEditorToPendingConfirmation = new Map();
            this.containerToolBarMenuDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.whenRestoredPromise = new async_1.DeferredPromise();
            this.whenRestored = this.whenRestoredPromise.p;
            this._disposed = false;
            //#endregion
            //#region ISerializableView
            this.element = document.createElement('div');
            this._onDidChange = this._register(new event_1.Relay());
            this.onDidChange = this._onDidChange.event;
            if (from instanceof EditorGroupView_1) {
                this.model = this._register(from.model.clone());
            }
            else if ((0, editorGroupModel_1.isSerializedEditorGroupModel)(from)) {
                this.model = this._register(instantiationService.createInstance(editorGroupModel_1.EditorGroupModel, from));
            }
            else {
                this.model = this._register(instantiationService.createInstance(editorGroupModel_1.EditorGroupModel, undefined));
            }
            //#region create()
            {
                // Scoped context key service
                this.scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.element));
                // Container
                this.element.classList.add(...(0, arrays_1.coalesce)(['editor-group-container', this.model.isLocked ? 'locked' : undefined]));
                // Container listeners
                this.registerContainerListeners();
                // Container toolbar
                this.createContainerToolbar();
                // Container context menu
                this.createContainerContextMenu();
                // Watermark & shortcuts
                this._register(this.instantiationService.createInstance(editorGroupWatermark_1.EditorGroupWatermark, this.element));
                // Progress bar
                this.progressBar = this._register(new progressbar_1.ProgressBar(this.element, defaultStyles_1.defaultProgressBarStyles));
                this.progressBar.hide();
                // Scoped instantiation service
                this.scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService], [progress_1.IEditorProgressService, this._register(new progressIndicator_1.EditorProgressIndicator(this.progressBar, this))]));
                // Context keys
                this.resourceContext = this._register(this.scopedInstantiationService.createInstance(contextkeys_1.ResourceContextKey));
                this.handleGroupContextKeys();
                // Title container
                this.titleContainer = document.createElement('div');
                this.titleContainer.classList.add('title');
                this.element.appendChild(this.titleContainer);
                // Title control
                this.titleControl = this._register(this.scopedInstantiationService.createInstance(editorTitleControl_1.EditorTitleControl, this.titleContainer, this.editorPartsView, this.groupsView, this, this.model));
                // Editor container
                this.editorContainer = document.createElement('div');
                this.editorContainer.classList.add('editor-container');
                this.element.appendChild(this.editorContainer);
                // Editor pane
                this.editorPane = this._register(this.scopedInstantiationService.createInstance(editorPanes_1.EditorPanes, this.element, this.editorContainer, this));
                this._onDidChange.input = this.editorPane.onDidChangeSizeConstraints;
                // Track Focus
                this.doTrackFocus();
                // Update containers
                this.updateTitleContainer();
                this.updateContainer();
                // Update styles
                this.updateStyles();
            }
            //#endregion
            // Restore editors if provided
            const restoreEditorsPromise = this.restoreEditors(from) ?? Promise.resolve();
            // Signal restored once editors have restored
            restoreEditorsPromise.finally(() => {
                this.whenRestoredPromise.complete();
            });
            // Register Listeners
            this.registerListeners();
        }
        handleGroupContextKeys() {
            const groupActiveEditorDirtyContext = contextkeys_1.ActiveEditorDirtyContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorPinnedContext = contextkeys_1.ActiveEditorPinnedContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorFirstContext = contextkeys_1.ActiveEditorFirstInGroupContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorLastContext = contextkeys_1.ActiveEditorLastInGroupContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorStickyContext = contextkeys_1.ActiveEditorStickyContext.bindTo(this.scopedContextKeyService);
            const groupEditorsCountContext = contextkeys_1.EditorGroupEditorsCountContext.bindTo(this.scopedContextKeyService);
            const groupLockedContext = contextkeys_1.ActiveEditorGroupLockedContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorAvailableEditorIds = contextkeys_1.ActiveEditorAvailableEditorIdsContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorCanSplitInGroupContext = contextkeys_1.ActiveEditorCanSplitInGroupContext.bindTo(this.scopedContextKeyService);
            const sideBySideEditorContext = contextkeys_1.SideBySideEditorActiveContext.bindTo(this.scopedContextKeyService);
            const activeEditorListener = this._register(new lifecycle_1.MutableDisposable());
            const observeActiveEditor = () => {
                activeEditorListener.clear();
                this.scopedContextKeyService.bufferChangeEvents(() => {
                    const activeEditor = this.activeEditor;
                    this.resourceContext.set(editor_1.EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY } ?? null));
                    (0, contextkeys_1.applyAvailableEditorIds)(groupActiveEditorAvailableEditorIds, activeEditor, this.editorResolverService);
                    groupActiveEditorCanSplitInGroupContext.set(activeEditor ? activeEditor.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */) : false);
                    sideBySideEditorContext.set(activeEditor?.typeId === sideBySideEditorInput_1.SideBySideEditorInput.ID);
                    if (activeEditor) {
                        groupActiveEditorDirtyContext.set(activeEditor.isDirty() && !activeEditor.isSaving());
                        activeEditorListener.value = activeEditor.onDidChangeDirty(() => {
                            groupActiveEditorDirtyContext.set(activeEditor.isDirty() && !activeEditor.isSaving());
                        });
                    }
                    else {
                        groupActiveEditorDirtyContext.set(false);
                    }
                });
            };
            // Update group contexts based on group changes
            const updateGroupContextKeys = (e) => {
                switch (e.kind) {
                    case 3 /* GroupModelChangeKind.GROUP_LOCKED */:
                        groupLockedContext.set(this.isLocked);
                        break;
                    case 7 /* GroupModelChangeKind.EDITOR_ACTIVE */:
                        groupActiveEditorFirstContext.set(this.model.isFirst(this.model.activeEditor));
                        groupActiveEditorLastContext.set(this.model.isLast(this.model.activeEditor));
                        groupActiveEditorPinnedContext.set(this.model.activeEditor ? this.model.isPinned(this.model.activeEditor) : false);
                        groupActiveEditorStickyContext.set(this.model.activeEditor ? this.model.isSticky(this.model.activeEditor) : false);
                        break;
                    case 5 /* GroupModelChangeKind.EDITOR_CLOSE */:
                    case 4 /* GroupModelChangeKind.EDITOR_OPEN */:
                    case 6 /* GroupModelChangeKind.EDITOR_MOVE */:
                        groupActiveEditorFirstContext.set(this.model.isFirst(this.model.activeEditor));
                        groupActiveEditorLastContext.set(this.model.isLast(this.model.activeEditor));
                        break;
                    case 10 /* GroupModelChangeKind.EDITOR_PIN */:
                        if (e.editor && e.editor === this.model.activeEditor) {
                            groupActiveEditorPinnedContext.set(this.model.isPinned(this.model.activeEditor));
                        }
                        break;
                    case 11 /* GroupModelChangeKind.EDITOR_STICKY */:
                        if (e.editor && e.editor === this.model.activeEditor) {
                            groupActiveEditorStickyContext.set(this.model.isSticky(this.model.activeEditor));
                        }
                        break;
                }
                // Group editors count context
                groupEditorsCountContext.set(this.count);
            };
            this._register(this.onDidModelChange(e => updateGroupContextKeys(e)));
            // Track the active editor and update context key that reflects
            // the dirty state of this editor
            this._register(this.onDidActiveEditorChange(() => observeActiveEditor()));
            // Update context keys on startup
            observeActiveEditor();
            updateGroupContextKeys({ kind: 7 /* GroupModelChangeKind.EDITOR_ACTIVE */ });
            updateGroupContextKeys({ kind: 3 /* GroupModelChangeKind.GROUP_LOCKED */ });
        }
        registerContainerListeners() {
            // Open new file via doubleclick on empty container
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.DBLCLICK, e => {
                if (this.isEmpty) {
                    dom_1.EventHelper.stop(e);
                    this.editorService.openEditor({
                        resource: undefined,
                        options: {
                            pinned: true,
                            override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id
                        }
                    }, this.id);
                }
            }));
            // Close empty editor group via middle mouse click
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.AUXCLICK, e => {
                if (this.isEmpty && e.button === 1 /* Middle Button */) {
                    dom_1.EventHelper.stop(e, true);
                    this.groupsView.removeGroup(this);
                }
            }));
        }
        createContainerToolbar() {
            // Toolbar Container
            const toolbarContainer = document.createElement('div');
            toolbarContainer.classList.add('editor-group-container-toolbar');
            this.element.appendChild(toolbarContainer);
            // Toolbar
            const containerToolbar = this._register(new actionbar_1.ActionBar(toolbarContainer, {
                ariaLabel: (0, nls_1.localize)('ariaLabelGroupActions', "Empty editor group actions"),
                highlightToggledItems: true
            }));
            // Toolbar actions
            const containerToolbarMenu = this._register(this.menuService.createMenu(actions_1.MenuId.EmptyEditorGroup, this.scopedContextKeyService));
            const updateContainerToolbar = () => {
                const actions = { primary: [], secondary: [] };
                // Clear old actions
                this.containerToolBarMenuDisposable.value = (0, lifecycle_1.toDisposable)(() => containerToolbar.clear());
                // Create new actions
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(containerToolbarMenu, { arg: { groupId: this.id }, shouldForwardArgs: true }, actions, 'navigation');
                for (const action of [...actions.primary, ...actions.secondary]) {
                    const keybinding = this.keybindingService.lookupKeybinding(action.id);
                    containerToolbar.push(action, { icon: true, label: false, keybinding: keybinding?.getLabel() });
                }
            };
            updateContainerToolbar();
            this._register(containerToolbarMenu.onDidChange(updateContainerToolbar));
        }
        createContainerContextMenu() {
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.CONTEXT_MENU, e => this.onShowContainerContextMenu(e)));
            this._register((0, dom_1.addDisposableListener)(this.element, touch_1.EventType.Contextmenu, () => this.onShowContainerContextMenu()));
        }
        onShowContainerContextMenu(e) {
            if (!this.isEmpty) {
                return; // only for empty editor groups
            }
            // Find target anchor
            let anchor = this.element;
            if (e) {
                anchor = new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(this.element), e);
            }
            // Show it
            this.contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.EmptyEditorGroupContext,
                contextKeyService: this.contextKeyService,
                getAnchor: () => anchor,
                onHide: () => {
                    this.focus();
                }
            });
        }
        doTrackFocus() {
            // Container
            const containerFocusTracker = this._register((0, dom_1.trackFocus)(this.element));
            this._register(containerFocusTracker.onDidFocus(() => {
                if (this.isEmpty) {
                    this._onDidFocus.fire(); // only when empty to prevent duplicate events from `editorPane.onDidFocus`
                }
            }));
            // Title Container
            const handleTitleClickOrTouch = (e) => {
                let target;
                if ((0, dom_1.isMouseEvent)(e)) {
                    if (e.button !== 0 /* middle/right mouse button */ || (platform_1.isMacintosh && e.ctrlKey /* macOS context menu */)) {
                        return undefined;
                    }
                    target = e.target;
                }
                else {
                    target = e.initialTarget;
                }
                if ((0, dom_1.findParentWithClass)(target, 'monaco-action-bar', this.titleContainer) ||
                    (0, dom_1.findParentWithClass)(target, 'monaco-breadcrumb-item', this.titleContainer)) {
                    return; // not when clicking on actions or breadcrumbs
                }
                // timeout to keep focus in editor after mouse up
                setTimeout(() => {
                    this.focus();
                });
            };
            this._register((0, dom_1.addDisposableListener)(this.titleContainer, dom_1.EventType.MOUSE_DOWN, e => handleTitleClickOrTouch(e)));
            this._register((0, dom_1.addDisposableListener)(this.titleContainer, touch_1.EventType.Tap, e => handleTitleClickOrTouch(e)));
            // Editor pane
            this._register(this.editorPane.onDidFocus(() => {
                this._onDidFocus.fire();
            }));
        }
        updateContainer() {
            // Empty Container: add some empty container attributes
            if (this.isEmpty) {
                this.element.classList.add('empty');
                this.element.tabIndex = 0;
                this.element.setAttribute('aria-label', (0, nls_1.localize)('emptyEditorGroup', "{0} (empty)", this.ariaLabel));
            }
            // Non-Empty Container: revert empty container attributes
            else {
                this.element.classList.remove('empty');
                this.element.removeAttribute('tabIndex');
                this.element.removeAttribute('aria-label');
            }
            // Update styles
            this.updateStyles();
        }
        updateTitleContainer() {
            this.titleContainer.classList.toggle('tabs', this.groupsView.partOptions.showTabs === 'multiple');
            this.titleContainer.classList.toggle('show-file-icons', this.groupsView.partOptions.showIcons);
        }
        restoreEditors(from) {
            if (this.count === 0) {
                return; // nothing to show
            }
            // Determine editor options
            let options;
            if (from instanceof EditorGroupView_1) {
                options = (0, editor_2.fillActiveEditorViewState)(from); // if we copy from another group, ensure to copy its active editor viewstate
            }
            else {
                options = Object.create(null);
            }
            const activeEditor = this.model.activeEditor;
            if (!activeEditor) {
                return;
            }
            options.pinned = this.model.isPinned(activeEditor); // preserve pinned state
            options.sticky = this.model.isSticky(activeEditor); // preserve sticky state
            options.preserveFocus = true; // handle focus after editor is restored
            const internalOptions = {
                preserveWindowOrder: true // handle window order after editor is restored
            };
            const activeElement = (0, dom_1.getActiveElement)();
            // Show active editor (intentionally not using async to keep
            // `restoreEditors` from executing in same stack)
            return this.doShowEditor(activeEditor, { active: true, isNew: false /* restored */ }, options, internalOptions).then(() => {
                // Set focused now if this is the active group and focus has
                // not changed meanwhile. This prevents focus from being
                // stolen accidentally on startup when the user already
                // clicked somewhere.
                if (this.groupsView.activeGroup === this && activeElement && (0, dom_1.isActiveElement)(activeElement)) {
                    this.focus();
                }
            });
        }
        //#region event handling
        registerListeners() {
            // Model Events
            this._register(this.model.onDidModelChange(e => this.onDidGroupModelChange(e)));
            // Option Changes
            this._register(this.groupsView.onDidChangeEditorPartOptions(e => this.onDidChangeEditorPartOptions(e)));
            // Visibility
            this._register(this.groupsView.onDidVisibilityChange(e => this.onDidVisibilityChange(e)));
        }
        onDidGroupModelChange(e) {
            // Re-emit to outside
            this._onDidModelChange.fire(e);
            // Handle within
            if (e.kind === 3 /* GroupModelChangeKind.GROUP_LOCKED */) {
                this.element.classList.toggle('locked', this.isLocked);
            }
            if (!e.editor) {
                return;
            }
            switch (e.kind) {
                case 4 /* GroupModelChangeKind.EDITOR_OPEN */:
                    if ((0, editorGroupModel_1.isGroupEditorOpenEvent)(e)) {
                        this.onDidOpenEditor(e.editor, e.editorIndex);
                    }
                    break;
                case 5 /* GroupModelChangeKind.EDITOR_CLOSE */:
                    if ((0, editorGroupModel_1.isGroupEditorCloseEvent)(e)) {
                        this.handleOnDidCloseEditor(e.editor, e.editorIndex, e.context, e.sticky);
                    }
                    break;
                case 13 /* GroupModelChangeKind.EDITOR_WILL_DISPOSE */:
                    this.onWillDisposeEditor(e.editor);
                    break;
                case 12 /* GroupModelChangeKind.EDITOR_DIRTY */:
                    this.onDidChangeEditorDirty(e.editor);
                    break;
                case 8 /* GroupModelChangeKind.EDITOR_LABEL */:
                    this.onDidChangeEditorLabel(e.editor);
                    break;
            }
        }
        onDidOpenEditor(editor, editorIndex) {
            /* __GDPR__
                "editorOpened" : {
                    "owner": "bpasero",
                    "${include}": [
                        "${EditorTelemetryDescriptor}"
                    ]
                }
            */
            this.telemetryService.publicLog('editorOpened', this.toEditorTelemetryDescriptor(editor));
            // Update container
            this.updateContainer();
        }
        handleOnDidCloseEditor(editor, editorIndex, context, sticky) {
            // Before close
            this._onWillCloseEditor.fire({ groupId: this.id, editor, context, index: editorIndex, sticky });
            // Handle event
            const editorsToClose = [editor];
            // Include both sides of side by side editors when being closed
            if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
                editorsToClose.push(editor.primary, editor.secondary);
            }
            // For each editor to close, we call dispose() to free up any resources.
            // However, certain editors might be shared across multiple editor groups
            // (including being visible in side by side / diff editors) and as such we
            // only dispose when they are not opened elsewhere.
            for (const editor of editorsToClose) {
                if (this.canDispose(editor)) {
                    editor.dispose();
                }
            }
            /* __GDPR__
                "editorClosed" : {
                    "owner": "bpasero",
                    "${include}": [
                        "${EditorTelemetryDescriptor}"
                    ]
                }
            */
            this.telemetryService.publicLog('editorClosed', this.toEditorTelemetryDescriptor(editor));
            // Update container
            this.updateContainer();
            // Event
            this._onDidCloseEditor.fire({ groupId: this.id, editor, context, index: editorIndex, sticky });
        }
        canDispose(editor) {
            for (const groupView of this.editorPartsView.groups) {
                if (groupView instanceof EditorGroupView_1 && groupView.model.contains(editor, {
                    strictEquals: true, // only if this input is not shared across editor groups
                    supportSideBySide: editor_1.SideBySideEditor.ANY // include any side of an opened side by side editor
                })) {
                    return false;
                }
            }
            return true;
        }
        toEditorTelemetryDescriptor(editor) {
            const descriptor = editor.getTelemetryDescriptor();
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editor);
            const path = resource ? resource.scheme === network_1.Schemas.file ? resource.fsPath : resource.path : undefined;
            if (resource && path) {
                let resourceExt = (0, resources_1.extname)(resource);
                // Remove query parameters from the resource extension
                const queryStringLocation = resourceExt.indexOf('?');
                resourceExt = queryStringLocation !== -1 ? resourceExt.substr(0, queryStringLocation) : resourceExt;
                descriptor['resource'] = { mimeType: new telemetryUtils_1.TelemetryTrustedValue((0, languagesAssociations_1.getMimeTypes)(resource).join(', ')), scheme: resource.scheme, ext: resourceExt, path: (0, hash_1.hash)(path) };
                /* __GDPR__FRAGMENT__
                    "EditorTelemetryDescriptor" : {
                        "resource": { "${inline}": [ "${URIDescriptor}" ] }
                    }
                */
                return descriptor;
            }
            return descriptor;
        }
        onWillDisposeEditor(editor) {
            // To prevent race conditions, we handle disposed editors in our worker with a timeout
            // because it can happen that an input is being disposed with the intent to replace
            // it with some other input right after.
            this.disposedEditorsWorker.work(editor);
        }
        handleDisposedEditors(disposedEditors) {
            // Split between visible and hidden editors
            let activeEditor;
            const inactiveEditors = [];
            for (const disposedEditor of disposedEditors) {
                const editorFindResult = this.model.findEditor(disposedEditor);
                if (!editorFindResult) {
                    continue; // not part of the model anymore
                }
                const editor = editorFindResult[0];
                if (!editor.isDisposed()) {
                    continue; // editor got reopened meanwhile
                }
                if (this.model.isActive(editor)) {
                    activeEditor = editor;
                }
                else {
                    inactiveEditors.push(editor);
                }
            }
            // Close all inactive editors first to prevent UI flicker
            for (const inactiveEditor of inactiveEditors) {
                this.doCloseEditor(inactiveEditor, true);
            }
            // Close active one last
            if (activeEditor) {
                this.doCloseEditor(activeEditor);
            }
        }
        onDidChangeEditorPartOptions(event) {
            // Title container
            this.updateTitleContainer();
            // Title control
            this.titleControl.updateOptions(event.oldPartOptions, event.newPartOptions);
            // Title control switch between singleEditorTabs, multiEditorTabs and multiRowEditorTabs
            if (event.oldPartOptions.showTabs !== event.newPartOptions.showTabs ||
                event.oldPartOptions.tabHeight !== event.newPartOptions.tabHeight ||
                (event.oldPartOptions.showTabs === 'multiple' && event.oldPartOptions.pinnedTabsOnSeparateRow !== event.newPartOptions.pinnedTabsOnSeparateRow)) {
                // Re-layout
                this.relayout();
                // Ensure to show active editor if any
                if (this.model.activeEditor) {
                    this.titleControl.openEditor(this.model.activeEditor);
                }
            }
            // Styles
            this.updateStyles();
            // Pin preview editor once user disables preview
            if (event.oldPartOptions.enablePreview && !event.newPartOptions.enablePreview) {
                if (this.model.previewEditor) {
                    this.pinEditor(this.model.previewEditor);
                }
            }
        }
        onDidChangeEditorDirty(editor) {
            // Always show dirty editors pinned
            this.pinEditor(editor);
            // Forward to title control
            this.titleControl.updateEditorDirty(editor);
        }
        onDidChangeEditorLabel(editor) {
            // Forward to title control
            this.titleControl.updateEditorLabel(editor);
        }
        onDidVisibilityChange(visible) {
            // Forward to active editor pane
            this.editorPane.setVisible(visible);
        }
        //#endregion
        //#region IEditorGroupView
        get index() {
            return this._index;
        }
        get label() {
            if (this.groupsLabel) {
                return (0, nls_1.localize)('groupLabelLong', "{0}: Group {1}", this.groupsLabel, this._index + 1);
            }
            return (0, nls_1.localize)('groupLabel', "Group {0}", this._index + 1);
        }
        get ariaLabel() {
            if (this.groupsLabel) {
                return (0, nls_1.localize)('groupAriaLabelLong', "{0}: Editor Group {1}", this.groupsLabel, this._index + 1);
            }
            return (0, nls_1.localize)('groupAriaLabel', "Editor Group {0}", this._index + 1);
        }
        get disposed() {
            return this._disposed;
        }
        get isEmpty() {
            return this.count === 0;
        }
        get titleHeight() {
            return this.titleControl.getHeight();
        }
        notifyIndexChanged(newIndex) {
            if (this._index !== newIndex) {
                this._index = newIndex;
                this.model.setIndex(newIndex);
            }
        }
        notifyLabelChanged(newLabel) {
            if (this.groupsLabel !== newLabel) {
                this.groupsLabel = newLabel;
                this.model.setLabel(newLabel);
            }
        }
        setActive(isActive) {
            this.active = isActive;
            // Update container
            this.element.classList.toggle('active', isActive);
            this.element.classList.toggle('inactive', !isActive);
            // Update title control
            this.titleControl.setActive(isActive);
            // Update styles
            this.updateStyles();
            // Update model
            this.model.setActive(undefined /* entire group got active */);
        }
        //#endregion
        //#region basics()
        get id() {
            return this.model.id;
        }
        get windowId() {
            return this.groupsView.windowId;
        }
        get editors() {
            return this.model.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
        }
        get count() {
            return this.model.count;
        }
        get stickyCount() {
            return this.model.stickyCount;
        }
        get activeEditorPane() {
            return this.editorPane ? this.editorPane.activeEditorPane ?? undefined : undefined;
        }
        get activeEditor() {
            return this.model.activeEditor;
        }
        get previewEditor() {
            return this.model.previewEditor;
        }
        isPinned(editorOrIndex) {
            return this.model.isPinned(editorOrIndex);
        }
        isSticky(editorOrIndex) {
            return this.model.isSticky(editorOrIndex);
        }
        isActive(editor) {
            return this.model.isActive(editor);
        }
        contains(candidate, options) {
            return this.model.contains(candidate, options);
        }
        getEditors(order, options) {
            return this.model.getEditors(order, options);
        }
        findEditors(resource, options) {
            const canonicalResource = this.uriIdentityService.asCanonicalUri(resource);
            return this.getEditors(1 /* EditorsOrder.SEQUENTIAL */).filter(editor => {
                if (editor.resource && (0, resources_1.isEqual)(editor.resource, canonicalResource)) {
                    return true;
                }
                // Support side by side editor primary side if specified
                if (options?.supportSideBySide === editor_1.SideBySideEditor.PRIMARY || options?.supportSideBySide === editor_1.SideBySideEditor.ANY) {
                    const primaryResource = editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    if (primaryResource && (0, resources_1.isEqual)(primaryResource, canonicalResource)) {
                        return true;
                    }
                }
                // Support side by side editor secondary side if specified
                if (options?.supportSideBySide === editor_1.SideBySideEditor.SECONDARY || options?.supportSideBySide === editor_1.SideBySideEditor.ANY) {
                    const secondaryResource = editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
                    if (secondaryResource && (0, resources_1.isEqual)(secondaryResource, canonicalResource)) {
                        return true;
                    }
                }
                return false;
            });
        }
        getEditorByIndex(index) {
            return this.model.getEditorByIndex(index);
        }
        getIndexOfEditor(editor) {
            return this.model.indexOf(editor);
        }
        isFirst(editor) {
            return this.model.isFirst(editor);
        }
        isLast(editor) {
            return this.model.isLast(editor);
        }
        focus() {
            // Ensure window focus
            (0, dom_1.focusWindow)(this.element);
            // Pass focus to editor panes
            if (this.activeEditorPane) {
                this.activeEditorPane.focus();
            }
            else {
                this.element.focus();
            }
            // Event
            this._onDidFocus.fire();
        }
        pinEditor(candidate = this.activeEditor || undefined) {
            if (candidate && !this.model.isPinned(candidate)) {
                // Update model
                const editor = this.model.pin(candidate);
                // Forward to title control
                if (editor) {
                    this.titleControl.pinEditor(editor);
                }
            }
        }
        stickEditor(candidate = this.activeEditor || undefined) {
            this.doStickEditor(candidate, true);
        }
        unstickEditor(candidate = this.activeEditor || undefined) {
            this.doStickEditor(candidate, false);
        }
        doStickEditor(candidate, sticky) {
            if (candidate && this.model.isSticky(candidate) !== sticky) {
                const oldIndexOfEditor = this.getIndexOfEditor(candidate);
                // Update model
                const editor = sticky ? this.model.stick(candidate) : this.model.unstick(candidate);
                if (!editor) {
                    return;
                }
                // If the index of the editor changed, we need to forward this to
                // title control and also make sure to emit this as an event
                const newIndexOfEditor = this.getIndexOfEditor(editor);
                if (newIndexOfEditor !== oldIndexOfEditor) {
                    this.titleControl.moveEditor(editor, oldIndexOfEditor, newIndexOfEditor, true);
                }
                // Forward sticky state to title control
                if (sticky) {
                    this.titleControl.stickEditor(editor);
                }
                else {
                    this.titleControl.unstickEditor(editor);
                }
            }
        }
        //#endregion
        //#region openEditor()
        async openEditor(editor, options, internalOptions) {
            return this.doOpenEditor(editor, options, {
                // Appply given internal open options
                ...internalOptions,
                // Allow to match on a side-by-side editor when same
                // editor is opened on both sides. In that case we
                // do not want to open a new editor but reuse that one.
                supportSideBySide: editor_1.SideBySideEditor.BOTH
            });
        }
        async doOpenEditor(editor, options, internalOptions) {
            // Guard against invalid editors. Disposed editors
            // should never open because they emit no events
            // e.g. to indicate dirty changes.
            if (!editor || editor.isDisposed()) {
                return;
            }
            // Fire the event letting everyone know we are about to open an editor
            this._onWillOpenEditor.fire({ editor, groupId: this.id });
            // Determine options
            const pinned = options?.sticky
                || !this.groupsView.partOptions.enablePreview
                || editor.isDirty()
                || (options?.pinned ?? typeof options?.index === 'number' /* unless specified, prefer to pin when opening with index */)
                || (typeof options?.index === 'number' && this.model.isSticky(options.index))
                || editor.hasCapability(512 /* EditorInputCapabilities.Scratchpad */);
            const openEditorOptions = {
                index: options ? options.index : undefined,
                pinned,
                sticky: options?.sticky || (typeof options?.index === 'number' && this.model.isSticky(options.index)),
                active: this.count === 0 || !options || !options.inactive,
                supportSideBySide: internalOptions?.supportSideBySide
            };
            if (!openEditorOptions.active && !openEditorOptions.pinned && this.model.activeEditor && !this.model.isPinned(this.model.activeEditor)) {
                // Special case: we are to open an editor inactive and not pinned, but the current active
                // editor is also not pinned, which means it will get replaced with this one. As such,
                // the editor can only be active.
                openEditorOptions.active = true;
            }
            let activateGroup = false;
            let restoreGroup = false;
            if (options?.activation === editor_3.EditorActivation.ACTIVATE) {
                // Respect option to force activate an editor group.
                activateGroup = true;
            }
            else if (options?.activation === editor_3.EditorActivation.RESTORE) {
                // Respect option to force restore an editor group.
                restoreGroup = true;
            }
            else if (options?.activation === editor_3.EditorActivation.PRESERVE) {
                // Respect option to preserve active editor group.
                activateGroup = false;
                restoreGroup = false;
            }
            else if (openEditorOptions.active) {
                // Finally, we only activate/restore an editor which is
                // opening as active editor.
                // If preserveFocus is enabled, we only restore but never
                // activate the group.
                activateGroup = !options || !options.preserveFocus;
                restoreGroup = !activateGroup;
            }
            // Actually move the editor if a specific index is provided and we figure
            // out that the editor is already opened at a different index. This
            // ensures the right set of events are fired to the outside.
            if (typeof openEditorOptions.index === 'number') {
                const indexOfEditor = this.model.indexOf(editor);
                if (indexOfEditor !== -1 && indexOfEditor !== openEditorOptions.index) {
                    this.doMoveEditorInsideGroup(editor, openEditorOptions);
                }
            }
            // Update model and make sure to continue to use the editor we get from
            // the model. It is possible that the editor was already opened and we
            // want to ensure that we use the existing instance in that case.
            const { editor: openedEditor, isNew } = this.model.openEditor(editor, openEditorOptions);
            // Conditionally lock the group
            if (isNew && // only if this editor was new for the group
                this.count === 1 && // only when this editor was the first editor in the group
                this.editorPartsView.groups.length > 1 // only allow auto locking if more than 1 group is opened
            ) {
                // only when the editor identifier is configured as such
                if (openedEditor.editorId && this.groupsView.partOptions.autoLockGroups?.has(openedEditor.editorId)) {
                    this.lock(true);
                }
            }
            // Show editor
            const showEditorResult = this.doShowEditor(openedEditor, { active: !!openEditorOptions.active, isNew }, options, internalOptions);
            // Finally make sure the group is active or restored as instructed
            if (activateGroup) {
                this.groupsView.activateGroup(this);
            }
            else if (restoreGroup) {
                this.groupsView.restoreGroup(this);
            }
            return showEditorResult;
        }
        doShowEditor(editor, context, options, internalOptions) {
            // Show in editor control if the active editor changed
            let openEditorPromise;
            if (context.active) {
                openEditorPromise = (async () => {
                    const { pane, changed, cancelled, error } = await this.editorPane.openEditor(editor, options, internalOptions, { newInGroup: context.isNew });
                    // Return early if the operation was cancelled by another operation
                    if (cancelled) {
                        return undefined;
                    }
                    // Editor change event
                    if (changed) {
                        this._onDidActiveEditorChange.fire({ editor });
                    }
                    // Indicate error as an event but do not bubble them up
                    if (error) {
                        this._onDidOpenEditorFail.fire(editor);
                    }
                    // Without an editor pane, recover by closing the active editor
                    // (if the input is still the active one)
                    if (!pane && this.activeEditor === editor) {
                        this.doCloseEditor(editor, options?.preserveFocus, { fromError: true });
                    }
                    return pane;
                })();
            }
            else {
                openEditorPromise = Promise.resolve(undefined); // inactive: return undefined as result to signal this
            }
            // Show in title control after editor control because some actions depend on it
            // but respect the internal options in case title control updates should skip.
            if (!internalOptions?.skipTitleUpdate) {
                this.titleControl.openEditor(editor, internalOptions);
            }
            return openEditorPromise;
        }
        //#endregion
        //#region openEditors()
        async openEditors(editors) {
            // Guard against invalid editors. Disposed editors
            // should never open because they emit no events
            // e.g. to indicate dirty changes.
            const editorsToOpen = (0, arrays_1.coalesce)(editors).filter(({ editor }) => !editor.isDisposed());
            // Use the first editor as active editor
            const firstEditor = (0, arrays_1.firstOrDefault)(editorsToOpen);
            if (!firstEditor) {
                return;
            }
            const openEditorsOptions = {
                // Allow to match on a side-by-side editor when same
                // editor is opened on both sides. In that case we
                // do not want to open a new editor but reuse that one.
                supportSideBySide: editor_1.SideBySideEditor.BOTH
            };
            await this.doOpenEditor(firstEditor.editor, firstEditor.options, openEditorsOptions);
            // Open the other ones inactive
            const inactiveEditors = editorsToOpen.slice(1);
            const startingIndex = this.getIndexOfEditor(firstEditor.editor) + 1;
            await async_1.Promises.settled(inactiveEditors.map(({ editor, options }, index) => {
                return this.doOpenEditor(editor, {
                    ...options,
                    inactive: true,
                    pinned: true,
                    index: startingIndex + index
                }, {
                    ...openEditorsOptions,
                    // optimization: update the title control later
                    // https://github.com/microsoft/vscode/issues/130634
                    skipTitleUpdate: true
                });
            }));
            // Update the title control all at once with all editors
            this.titleControl.openEditors(inactiveEditors.map(({ editor }) => editor));
            // Opening many editors at once can put any editor to be
            // the active one depending on options. As such, we simply
            // return the active editor pane after this operation.
            return this.editorPane.activeEditorPane ?? undefined;
        }
        //#endregion
        //#region moveEditor()
        moveEditors(editors, target) {
            // Optimization: knowing that we move many editors, we
            // delay the title update to a later point for this group
            // through a method that allows for bulk updates but only
            // when moving to a different group where many editors
            // are more likely to occur.
            const internalOptions = {
                skipTitleUpdate: this !== target
            };
            for (const { editor, options } of editors) {
                this.moveEditor(editor, target, options, internalOptions);
            }
            // Update the title control all at once with all editors
            // in source and target if the title update was skipped
            if (internalOptions.skipTitleUpdate) {
                const movedEditors = editors.map(({ editor }) => editor);
                target.titleControl.openEditors(movedEditors);
                this.titleControl.closeEditors(movedEditors);
            }
        }
        moveEditor(editor, target, options, internalOptions) {
            // Move within same group
            if (this === target) {
                this.doMoveEditorInsideGroup(editor, options);
            }
            // Move across groups
            else {
                this.doMoveOrCopyEditorAcrossGroups(editor, target, options, { ...internalOptions, keepCopy: false });
            }
        }
        doMoveEditorInsideGroup(candidate, options) {
            const moveToIndex = options ? options.index : undefined;
            if (typeof moveToIndex !== 'number') {
                return; // do nothing if we move into same group without index
            }
            // Update model and make sure to continue to use the editor we get from
            // the model. It is possible that the editor was already opened and we
            // want to ensure that we use the existing instance in that case.
            const currentIndex = this.model.indexOf(candidate);
            const editor = this.model.getEditorByIndex(currentIndex);
            if (!editor) {
                return;
            }
            // Move when index has actually changed
            if (currentIndex !== moveToIndex) {
                const oldStickyCount = this.model.stickyCount;
                // Update model
                this.model.moveEditor(editor, moveToIndex);
                this.model.pin(editor);
                // Forward to title control
                this.titleControl.moveEditor(editor, currentIndex, moveToIndex, oldStickyCount !== this.model.stickyCount);
                this.titleControl.pinEditor(editor);
            }
            // Support the option to stick the editor even if it is moved.
            // It is important that we call this method after we have moved
            // the editor because the result of moving the editor could have
            // caused a change in sticky state.
            if (options?.sticky) {
                this.stickEditor(editor);
            }
        }
        doMoveOrCopyEditorAcrossGroups(editor, target, openOptions, internalOptions) {
            const keepCopy = internalOptions?.keepCopy;
            // When moving/copying an editor, try to preserve as much view state as possible
            // by checking for the editor to be a text editor and creating the options accordingly
            // if so
            const options = (0, editor_2.fillActiveEditorViewState)(this, editor, {
                ...openOptions,
                pinned: true, // always pin moved editor
                sticky: openOptions?.sticky ?? (!keepCopy && this.model.isSticky(editor)) // preserve sticky state only if editor is moved or eplicitly wanted (https://github.com/microsoft/vscode/issues/99035)
            });
            // Indicate will move event
            if (!keepCopy) {
                this._onWillMoveEditor.fire({
                    groupId: this.id,
                    editor,
                    target: target.id
                });
            }
            // A move to another group is an open first...
            target.doOpenEditor(keepCopy ? editor.copy() : editor, options, internalOptions);
            // ...and a close afterwards (unless we copy)
            if (!keepCopy) {
                this.doCloseEditor(editor, true /* do not focus next one behind if any */, { ...internalOptions, context: editor_1.EditorCloseContext.MOVE });
            }
        }
        //#endregion
        //#region copyEditor()
        copyEditors(editors, target) {
            // Optimization: knowing that we move many editors, we
            // delay the title update to a later point for this group
            // through a method that allows for bulk updates but only
            // when moving to a different group where many editors
            // are more likely to occur.
            const internalOptions = {
                skipTitleUpdate: this !== target
            };
            for (const { editor, options } of editors) {
                this.copyEditor(editor, target, options, internalOptions);
            }
            // Update the title control all at once with all editors
            // in target if the title update was skipped
            if (internalOptions.skipTitleUpdate) {
                const copiedEditors = editors.map(({ editor }) => editor);
                target.titleControl.openEditors(copiedEditors);
            }
        }
        copyEditor(editor, target, options, internalOptions) {
            // Move within same group because we do not support to show the same editor
            // multiple times in the same group
            if (this === target) {
                this.doMoveEditorInsideGroup(editor, options);
            }
            // Copy across groups
            else {
                this.doMoveOrCopyEditorAcrossGroups(editor, target, options, { ...internalOptions, keepCopy: true });
            }
        }
        //#endregion
        //#region closeEditor()
        async closeEditor(editor = this.activeEditor || undefined, options) {
            return this.doCloseEditorWithConfirmationHandling(editor, options);
        }
        async doCloseEditorWithConfirmationHandling(editor = this.activeEditor || undefined, options, internalOptions) {
            if (!editor) {
                return false;
            }
            // Check for confirmation and veto
            const veto = await this.handleCloseConfirmation([editor]);
            if (veto) {
                return false;
            }
            // Do close
            this.doCloseEditor(editor, options?.preserveFocus, internalOptions);
            return true;
        }
        doCloseEditor(editor, preserveFocus = (this.groupsView.activeGroup !== this), internalOptions) {
            // Forward to title control unless skipped via internal options
            if (!internalOptions?.skipTitleUpdate) {
                this.titleControl.beforeCloseEditor(editor);
            }
            // Closing the active editor of the group is a bit more work
            if (this.model.isActive(editor)) {
                this.doCloseActiveEditor(preserveFocus, internalOptions);
            }
            // Closing inactive editor is just a model update
            else {
                this.doCloseInactiveEditor(editor, internalOptions);
            }
            // Forward to title control unless skipped via internal options
            if (!internalOptions?.skipTitleUpdate) {
                this.titleControl.closeEditor(editor);
            }
        }
        doCloseActiveEditor(preserveFocus = (this.groupsView.activeGroup !== this), internalOptions) {
            const editorToClose = this.activeEditor;
            const restoreFocus = !preserveFocus && this.shouldRestoreFocus(this.element);
            // Optimization: if we are about to close the last editor in this group and settings
            // are configured to close the group since it will be empty, we first set the last
            // active group as empty before closing the editor. This reduces the amount of editor
            // change events that this operation emits and will reduce flicker. Without this
            // optimization, this group (if active) would first trigger a active editor change
            // event because it became empty, only to then trigger another one when the next
            // group gets active.
            const closeEmptyGroup = this.groupsView.partOptions.closeEmptyGroups;
            if (closeEmptyGroup && this.active && this.count === 1) {
                const mostRecentlyActiveGroups = this.groupsView.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
                const nextActiveGroup = mostRecentlyActiveGroups[1]; // [0] will be the current one, so take [1]
                if (nextActiveGroup) {
                    if (restoreFocus) {
                        nextActiveGroup.focus();
                    }
                    else {
                        this.groupsView.activateGroup(nextActiveGroup, true);
                    }
                }
            }
            // Update model
            if (editorToClose) {
                this.model.closeEditor(editorToClose, internalOptions?.context);
            }
            // Open next active if there are more to show
            const nextActiveEditor = this.model.activeEditor;
            if (nextActiveEditor) {
                let activation = undefined;
                if (preserveFocus && this.groupsView.activeGroup !== this) {
                    // If we are opening the next editor in an inactive group
                    // without focussing it, ensure we preserve the editor
                    // group sizes in case that group is minimized.
                    // https://github.com/microsoft/vscode/issues/117686
                    activation = editor_3.EditorActivation.PRESERVE;
                }
                const options = {
                    preserveFocus,
                    activation,
                    // When closing an editor due to an error we can end up in a loop where we continue closing
                    // editors that fail to open (e.g. when the file no longer exists). We do not want to show
                    // repeated errors in this case to the user. As such, if we open the next editor and we are
                    // in a scope of a previous editor failing, we silence the input errors until the editor is
                    // opened by setting ignoreError: true.
                    ignoreError: internalOptions?.fromError
                };
                const internalEditorOpenOptions = {
                    // When closing an editor, we reveal the next one in the group.
                    // However, this can be a result of moving an editor to another
                    // window so we explicitly disable window reordering in this case.
                    preserveWindowOrder: true
                };
                this.doOpenEditor(nextActiveEditor, options, internalEditorOpenOptions);
            }
            // Otherwise we are empty, so clear from editor control and send event
            else {
                // Forward to editor pane
                if (editorToClose) {
                    this.editorPane.closeEditor(editorToClose);
                }
                // Restore focus to group container as needed unless group gets closed
                if (restoreFocus && !closeEmptyGroup) {
                    this.focus();
                }
                // Events
                this._onDidActiveEditorChange.fire({ editor: undefined });
                // Remove empty group if we should
                if (closeEmptyGroup) {
                    this.groupsView.removeGroup(this, preserveFocus);
                }
            }
        }
        shouldRestoreFocus(target) {
            const activeElement = (0, dom_1.getActiveElement)();
            if (activeElement === target.ownerDocument.body) {
                return true; // always restore focus if nothing is focused currently
            }
            // otherwise check for the active element being an ancestor of the target
            return (0, dom_1.isAncestor)(activeElement, target);
        }
        doCloseInactiveEditor(editor, internalOptions) {
            // Update model
            this.model.closeEditor(editor, internalOptions?.context);
        }
        async handleCloseConfirmation(editors) {
            if (!editors.length) {
                return false; // no veto
            }
            const editor = editors.shift();
            // To prevent multiple confirmation dialogs from showing up one after the other
            // we check if a pending confirmation is currently showing and if so, join that
            let handleCloseConfirmationPromise = this.mapEditorToPendingConfirmation.get(editor);
            if (!handleCloseConfirmationPromise) {
                handleCloseConfirmationPromise = this.doHandleCloseConfirmation(editor);
                this.mapEditorToPendingConfirmation.set(editor, handleCloseConfirmationPromise);
            }
            let veto;
            try {
                veto = await handleCloseConfirmationPromise;
            }
            finally {
                this.mapEditorToPendingConfirmation.delete(editor);
            }
            // Return for the first veto we got
            if (veto) {
                return veto;
            }
            // Otherwise continue with the remainders
            return this.handleCloseConfirmation(editors);
        }
        async doHandleCloseConfirmation(editor, options) {
            if (!this.shouldConfirmClose(editor)) {
                return false; // no veto
            }
            if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput && this.model.contains(editor.primary)) {
                return false; // primary-side of editor is still opened somewhere else
            }
            // Note: we explicitly decide to ask for confirm if closing a normal editor even
            // if it is opened in a side-by-side editor in the group. This decision is made
            // because it may be less obvious that one side of a side by side editor is dirty
            // and can still be changed.
            // The only exception is when the same editor is opened on both sides of a side
            // by side editor (https://github.com/microsoft/vscode/issues/138442)
            if (this.editorPartsView.groups.some(groupView => {
                if (groupView === this) {
                    return false; // skip (we already handled our group above)
                }
                const otherGroup = groupView;
                if (otherGroup.contains(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH })) {
                    return true; // exact editor still opened (either single, or split-in-group)
                }
                if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput && otherGroup.contains(editor.primary)) {
                    return true; // primary side of side by side editor still opened
                }
                return false;
            })) {
                return false; // editor is still editable somewhere else
            }
            // In some cases trigger save before opening the dialog depending
            // on auto-save configuration.
            // However, make sure to respect `skipAutoSave` option in case the automated
            // save fails which would result in the editor never closing.
            // Also, we only do this if no custom confirmation handling is implemented.
            let confirmation = 2 /* ConfirmResult.CANCEL */;
            let saveReason = 1 /* SaveReason.EXPLICIT */;
            let autoSave = false;
            if (!editor.hasCapability(4 /* EditorInputCapabilities.Untitled */) && !options?.skipAutoSave && !editor.closeHandler) {
                // Auto-save on focus change: save, because a dialog would steal focus
                // (see https://github.com/microsoft/vscode/issues/108752)
                if (this.filesConfigurationService.getAutoSaveMode(editor).mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */) {
                    autoSave = true;
                    confirmation = 0 /* ConfirmResult.SAVE */;
                    saveReason = 3 /* SaveReason.FOCUS_CHANGE */;
                }
                // Auto-save on window change: save, because on Windows and Linux, a
                // native dialog triggers the window focus change
                // (see https://github.com/microsoft/vscode/issues/134250)
                else if ((platform_1.isNative && (platform_1.isWindows || platform_1.isLinux)) && this.filesConfigurationService.getAutoSaveMode(editor).mode === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */) {
                    autoSave = true;
                    confirmation = 0 /* ConfirmResult.SAVE */;
                    saveReason = 4 /* SaveReason.WINDOW_CHANGE */;
                }
            }
            // No auto-save on focus change or custom confirmation handler: ask user
            if (!autoSave) {
                // Switch to editor that we want to handle for confirmation unless showing already
                if (!this.activeEditor || !this.activeEditor.matches(editor)) {
                    await this.doOpenEditor(editor);
                }
                // Ensure our window has focus since we are about to show a dialog
                await this.hostService.focus((0, dom_1.getWindow)(this.element));
                // Let editor handle confirmation if implemented
                if (typeof editor.closeHandler?.confirm === 'function') {
                    confirmation = await editor.closeHandler.confirm([{ editor, groupId: this.id }]);
                }
                // Show a file specific confirmation
                else {
                    let name;
                    if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
                        name = editor.primary.getName(); // prefer shorter names by using primary's name in this case
                    }
                    else {
                        name = editor.getName();
                    }
                    confirmation = await this.fileDialogService.showSaveConfirm([name]);
                }
            }
            // It could be that the editor's choice of confirmation has changed
            // given the check for confirmation is long running, so we check
            // again to see if anything needs to happen before closing for good.
            // This can happen for example if `autoSave: onFocusChange` is configured
            // so that the save happens when the dialog opens.
            // However, we only do this unless a custom confirm handler is installed
            // that may not be fit to be asked a second time right after.
            if (!editor.closeHandler && !this.shouldConfirmClose(editor)) {
                return confirmation === 2 /* ConfirmResult.CANCEL */ ? true : false;
            }
            // Otherwise, handle accordingly
            switch (confirmation) {
                case 0 /* ConfirmResult.SAVE */: {
                    const result = await editor.save(this.id, { reason: saveReason });
                    if (!result && autoSave) {
                        // Save failed and we need to signal this back to the user, so
                        // we handle the dirty editor again but this time ensuring to
                        // show the confirm dialog
                        // (see https://github.com/microsoft/vscode/issues/108752)
                        return this.doHandleCloseConfirmation(editor, { skipAutoSave: true });
                    }
                    return editor.isDirty(); // veto if still dirty
                }
                case 1 /* ConfirmResult.DONT_SAVE */:
                    try {
                        // first try a normal revert where the contents of the editor are restored
                        await editor.revert(this.id);
                        return editor.isDirty(); // veto if still dirty
                    }
                    catch (error) {
                        this.logService.error(error);
                        // if that fails, since we are about to close the editor, we accept that
                        // the editor cannot be reverted and instead do a soft revert that just
                        // enables us to close the editor. With this, a user can always close a
                        // dirty editor even when reverting fails.
                        await editor.revert(this.id, { soft: true });
                        return editor.isDirty(); // veto if still dirty
                    }
                case 2 /* ConfirmResult.CANCEL */:
                    return true; // veto
            }
        }
        shouldConfirmClose(editor) {
            if (editor.closeHandler) {
                return editor.closeHandler.showConfirm(); // custom handling of confirmation on close
            }
            return editor.isDirty() && !editor.isSaving(); // editor must be dirty and not saving
        }
        //#endregion
        //#region closeEditors()
        async closeEditors(args, options) {
            if (this.isEmpty) {
                return true;
            }
            const editors = this.doGetEditorsToClose(args);
            // Check for confirmation and veto
            const veto = await this.handleCloseConfirmation(editors.slice(0));
            if (veto) {
                return false;
            }
            // Do close
            this.doCloseEditors(editors, options);
            return true;
        }
        doGetEditorsToClose(args) {
            if (Array.isArray(args)) {
                return args;
            }
            const filter = args;
            const hasDirection = typeof filter.direction === 'number';
            let editorsToClose = this.model.getEditors(hasDirection ? 1 /* EditorsOrder.SEQUENTIAL */ : 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, filter); // in MRU order only if direction is not specified
            // Filter: saved or saving only
            if (filter.savedOnly) {
                editorsToClose = editorsToClose.filter(editor => !editor.isDirty() || editor.isSaving());
            }
            // Filter: direction (left / right)
            else if (hasDirection && filter.except) {
                editorsToClose = (filter.direction === 0 /* CloseDirection.LEFT */) ?
                    editorsToClose.slice(0, this.model.indexOf(filter.except, editorsToClose)) :
                    editorsToClose.slice(this.model.indexOf(filter.except, editorsToClose) + 1);
            }
            // Filter: except
            else if (filter.except) {
                editorsToClose = editorsToClose.filter(editor => filter.except && !editor.matches(filter.except));
            }
            return editorsToClose;
        }
        doCloseEditors(editors, options) {
            // Close all inactive editors first
            let closeActiveEditor = false;
            for (const editor of editors) {
                if (!this.isActive(editor)) {
                    this.doCloseInactiveEditor(editor);
                }
                else {
                    closeActiveEditor = true;
                }
            }
            // Close active editor last if contained in editors list to close
            if (closeActiveEditor) {
                this.doCloseActiveEditor(options?.preserveFocus);
            }
            // Forward to title control
            if (editors.length) {
                this.titleControl.closeEditors(editors);
            }
        }
        //#endregion
        //#region closeAllEditors()
        async closeAllEditors(options) {
            if (this.isEmpty) {
                // If the group is empty and the request is to close all editors, we still close
                // the editor group is the related setting to close empty groups is enabled for
                // a convenient way of removing empty editor groups for the user.
                if (this.groupsView.partOptions.closeEmptyGroups) {
                    this.groupsView.removeGroup(this);
                }
                return true;
            }
            // Check for confirmation and veto
            const veto = await this.handleCloseConfirmation(this.model.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, options));
            if (veto) {
                return false;
            }
            // Do close
            this.doCloseAllEditors(options);
            return true;
        }
        doCloseAllEditors(options) {
            // Close all inactive editors first
            const editorsToClose = [];
            for (const editor of this.model.getEditors(1 /* EditorsOrder.SEQUENTIAL */, options)) {
                if (!this.isActive(editor)) {
                    this.doCloseInactiveEditor(editor);
                }
                editorsToClose.push(editor);
            }
            // Close active editor last (unless we skip it, e.g. because it is sticky)
            if (this.activeEditor && editorsToClose.includes(this.activeEditor)) {
                this.doCloseActiveEditor();
            }
            // Forward to title control
            if (editorsToClose.length) {
                this.titleControl.closeEditors(editorsToClose);
            }
        }
        //#endregion
        //#region replaceEditors()
        async replaceEditors(editors) {
            // Extract active vs. inactive replacements
            let activeReplacement;
            const inactiveReplacements = [];
            for (let { editor, replacement, forceReplaceDirty, options } of editors) {
                const index = this.getIndexOfEditor(editor);
                if (index >= 0) {
                    const isActiveEditor = this.isActive(editor);
                    // make sure we respect the index of the editor to replace
                    if (options) {
                        options.index = index;
                    }
                    else {
                        options = { index };
                    }
                    options.inactive = !isActiveEditor;
                    options.pinned = options.pinned ?? true; // unless specified, prefer to pin upon replace
                    const editorToReplace = { editor, replacement, forceReplaceDirty, options };
                    if (isActiveEditor) {
                        activeReplacement = editorToReplace;
                    }
                    else {
                        inactiveReplacements.push(editorToReplace);
                    }
                }
            }
            // Handle inactive first
            for (const { editor, replacement, forceReplaceDirty, options } of inactiveReplacements) {
                // Open inactive editor
                await this.doOpenEditor(replacement, options);
                // Close replaced inactive editor unless they match
                if (!editor.matches(replacement)) {
                    let closed = false;
                    if (forceReplaceDirty) {
                        this.doCloseEditor(editor, true, { context: editor_1.EditorCloseContext.REPLACE });
                        closed = true;
                    }
                    else {
                        closed = await this.doCloseEditorWithConfirmationHandling(editor, { preserveFocus: true }, { context: editor_1.EditorCloseContext.REPLACE });
                    }
                    if (!closed) {
                        return; // canceled
                    }
                }
            }
            // Handle active last
            if (activeReplacement) {
                // Open replacement as active editor
                const openEditorResult = this.doOpenEditor(activeReplacement.replacement, activeReplacement.options);
                // Close replaced active editor unless they match
                if (!activeReplacement.editor.matches(activeReplacement.replacement)) {
                    if (activeReplacement.forceReplaceDirty) {
                        this.doCloseEditor(activeReplacement.editor, true, { context: editor_1.EditorCloseContext.REPLACE });
                    }
                    else {
                        await this.doCloseEditorWithConfirmationHandling(activeReplacement.editor, { preserveFocus: true }, { context: editor_1.EditorCloseContext.REPLACE });
                    }
                }
                await openEditorResult;
            }
        }
        //#endregion
        //#region Locking
        get isLocked() {
            return this.model.isLocked;
        }
        lock(locked) {
            this.model.lock(locked);
        }
        //#endregion
        //#region Editor Actions
        createEditorActions(disposables) {
            const primary = [];
            const secondary = [];
            let onDidChange;
            // Editor actions require the editor control to be there, so we retrieve it via service
            const activeEditorPane = this.activeEditorPane;
            if (activeEditorPane instanceof editorPane_1.EditorPane) {
                const editorScopedContextKeyService = activeEditorPane.scopedContextKeyService ?? this.scopedContextKeyService;
                const editorTitleMenu = disposables.add(this.menuService.createMenu(actions_1.MenuId.EditorTitle, editorScopedContextKeyService, { emitEventsForSubmenuChanges: true, eventDebounceDelay: 0 }));
                onDidChange = editorTitleMenu.onDidChange;
                const shouldInlineGroup = (action, group) => group === 'navigation' && action.actions.length <= 1;
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(editorTitleMenu, { arg: this.resourceContext.get(), shouldForwardArgs: true }, { primary, secondary }, 'navigation', shouldInlineGroup);
            }
            else {
                // If there is no active pane in the group (it's the last group and it's empty)
                // Trigger the change event when the active editor changes
                const _onDidChange = disposables.add(new event_1.Emitter());
                onDidChange = _onDidChange.event;
                disposables.add(this.onDidActiveEditorChange(() => _onDidChange.fire()));
            }
            return { actions: { primary, secondary }, onDidChange };
        }
        //#endregion
        //#region Themable
        updateStyles() {
            const isEmpty = this.isEmpty;
            // Container
            if (isEmpty) {
                this.element.style.backgroundColor = this.getColor(theme_1.EDITOR_GROUP_EMPTY_BACKGROUND) || '';
            }
            else {
                this.element.style.backgroundColor = '';
            }
            // Title control
            const borderColor = this.getColor(theme_1.EDITOR_GROUP_HEADER_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
            if (!isEmpty && borderColor) {
                this.titleContainer.classList.add('title-border-bottom');
                this.titleContainer.style.setProperty('--title-border-bottom-color', borderColor);
            }
            else {
                this.titleContainer.classList.remove('title-border-bottom');
                this.titleContainer.style.removeProperty('--title-border-bottom-color');
            }
            const { showTabs } = this.groupsView.partOptions;
            this.titleContainer.style.backgroundColor = this.getColor(showTabs === 'multiple' ? theme_1.EDITOR_GROUP_HEADER_TABS_BACKGROUND : theme_1.EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND) || '';
            // Editor container
            this.editorContainer.style.backgroundColor = this.getColor(colorRegistry_1.editorBackground) || '';
        }
        get minimumWidth() { return this.editorPane.minimumWidth; }
        get minimumHeight() { return this.editorPane.minimumHeight; }
        get maximumWidth() { return this.editorPane.maximumWidth; }
        get maximumHeight() { return this.editorPane.maximumHeight; }
        get proportionalLayout() {
            if (!this.lastLayout) {
                return true;
            }
            return !(this.lastLayout.width === this.minimumWidth || this.lastLayout.height === this.minimumHeight);
        }
        layout(width, height, top, left) {
            this.lastLayout = { width, height, top, left };
            this.element.classList.toggle('max-height-478px', height <= 478);
            // Layout the title control first to receive the size it occupies
            const titleControlSize = this.titleControl.layout({
                container: new dom_1.Dimension(width, height),
                available: new dom_1.Dimension(width, height - this.editorPane.minimumHeight)
            });
            // Update progress bar location
            this.progressBar.getContainer().style.top = `${Math.max(this.titleHeight.offset - 2, 0)}px`;
            // Pass the container width and remaining height to the editor layout
            const editorHeight = Math.max(0, height - titleControlSize.height);
            this.editorContainer.style.height = `${editorHeight}px`;
            this.editorPane.layout({ width, height: editorHeight, top: top + titleControlSize.height, left });
        }
        relayout() {
            if (this.lastLayout) {
                const { width, height, top, left } = this.lastLayout;
                this.layout(width, height, top, left);
            }
        }
        setBoundarySashes(sashes) {
            this.editorPane.setBoundarySashes(sashes);
        }
        toJSON() {
            return this.model.serialize();
        }
        //#endregion
        dispose() {
            this._disposed = true;
            this._onWillDispose.fire();
            super.dispose();
        }
    };
    exports.EditorGroupView = EditorGroupView;
    exports.EditorGroupView = EditorGroupView = EditorGroupView_1 = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, themeService_1.IThemeService),
        __param(8, telemetry_1.ITelemetryService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, actions_1.IMenuService),
        __param(11, contextView_1.IContextMenuService),
        __param(12, dialogs_1.IFileDialogService),
        __param(13, editorService_1.IEditorService),
        __param(14, filesConfigurationService_1.IFilesConfigurationService),
        __param(15, uriIdentity_1.IUriIdentityService),
        __param(16, log_1.ILogService),
        __param(17, editorResolverService_1.IEditorResolverService),
        __param(18, host_1.IHostService)
    ], EditorGroupView);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3JvdXBWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvZWRpdG9yR3JvdXBWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF3RHpGLElBQU0sZUFBZSx1QkFBckIsTUFBTSxlQUFnQixTQUFRLHVCQUFRO1FBRTVDLGlCQUFpQjtRQUVqQixNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWlDLEVBQUUsVUFBNkIsRUFBRSxXQUFtQixFQUFFLFVBQWtCLEVBQUUsb0JBQTJDO1lBQ3RLLE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlCQUFlLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3pILENBQUM7UUFFRCxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBdUMsRUFBRSxlQUFpQyxFQUFFLFVBQTZCLEVBQUUsV0FBbUIsRUFBRSxVQUFrQixFQUFFLG9CQUEyQztZQUMxTixPQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxpQkFBZSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvSCxDQUFDO1FBRUQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUEwQixFQUFFLGVBQWlDLEVBQUUsVUFBNkIsRUFBRSxXQUFtQixFQUFFLFVBQWtCLEVBQUUsb0JBQTJDO1lBQ25NLE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlCQUFlLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzdILENBQUM7UUFrRUQsWUFDQyxJQUEyRCxFQUMxQyxlQUFpQyxFQUN6QyxVQUE2QixF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