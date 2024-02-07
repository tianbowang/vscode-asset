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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/workbench/common/editor", "vs/workbench/contrib/files/browser/fileActions", "vs/workbench/contrib/files/common/files", "vs/workbench/browser/parts/editor/editorActions", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/platform/list/browser/listService", "vs/workbench/browser/labels", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/telemetry/common/telemetry", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/workbench/contrib/files/browser/fileConstants", "vs/workbench/common/contextkeys", "vs/platform/dnd/browser/dnd", "vs/workbench/browser/dnd", "vs/workbench/browser/parts/views/viewPane", "vs/base/browser/dnd", "vs/base/common/decorators", "vs/base/browser/ui/list/listView", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/base/common/comparers", "vs/base/common/codicons", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/base/common/resources", "vs/base/browser/window", "vs/workbench/browser/parts/editor/editorGroupView", "vs/css!./media/openeditors"], function (require, exports, nls, async_1, actions_1, dom, contextView_1, instantiation_1, editorGroupsService_1, configuration_1, keybinding_1, editor_1, fileActions_1, files_1, editorActions_1, contextkey_1, themeService_1, colorRegistry_1, listService_1, labels_1, actionbar_1, telemetry_1, lifecycle_1, actions_2, fileConstants_1, contextkeys_1, dnd_1, dnd_2, viewPane_1, dnd_3, decorators_1, listView_1, workingCopyService_1, filesConfigurationService_1, views_1, opener_1, comparers_1, codicons_1, commands_1, network_1, resources_1, window_1, editorGroupView_1) {
    "use strict";
    var OpenEditorsView_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenEditorsView = void 0;
    const $ = dom.$;
    let OpenEditorsView = class OpenEditorsView extends viewPane_1.ViewPane {
        static { OpenEditorsView_1 = this; }
        static { this.DEFAULT_VISIBLE_OPEN_EDITORS = 9; }
        static { this.DEFAULT_MIN_VISIBLE_OPEN_EDITORS = 0; }
        static { this.ID = 'workbench.explorer.openEditorsView'; }
        static { this.NAME = nls.localize2({ key: 'openEditors', comment: ['Open is an adjective'] }, "Open Editors"); }
        constructor(options, instantiationService, viewDescriptorService, contextMenuService, editorGroupService, configurationService, keybindingService, contextKeyService, themeService, telemetryService, workingCopyService, filesConfigurationService, openerService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.editorGroupService = editorGroupService;
            this.workingCopyService = workingCopyService;
            this.filesConfigurationService = filesConfigurationService;
            this.needsRefresh = false;
            this.elements = [];
            this.blockFocusActiveEditorTracking = false;
            this.structuralRefreshDelay = 0;
            this.sortOrder = configurationService.getValue('explorer.openEditors.sortOrder');
            this.registerUpdateEvents();
            // Also handle configuration updates
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChange(e)));
            // Handle dirty counter
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.updateDirtyIndicator(workingCopy)));
        }
        registerUpdateEvents() {
            const updateWholeList = () => {
                if (!this.isBodyVisible() || !this.list) {
                    this.needsRefresh = true;
                    return;
                }
                this.listRefreshScheduler?.schedule(this.structuralRefreshDelay);
            };
            const groupDisposables = new Map();
            const addGroupListener = (group) => {
                const groupModelChangeListener = group.onDidModelChange(e => {
                    if (this.listRefreshScheduler?.isScheduled()) {
                        return;
                    }
                    if (!this.isBodyVisible() || !this.list) {
                        this.needsRefresh = true;
                        return;
                    }
                    const index = this.getIndex(group, e.editor);
                    switch (e.kind) {
                        case 7 /* GroupModelChangeKind.EDITOR_ACTIVE */:
                            this.focusActiveEditor();
                            break;
                        case 1 /* GroupModelChangeKind.GROUP_INDEX */:
                        case 2 /* GroupModelChangeKind.GROUP_LABEL */:
                            if (index >= 0) {
                                this.list.splice(index, 1, [group]);
                            }
                            break;
                        case 12 /* GroupModelChangeKind.EDITOR_DIRTY */:
                        case 11 /* GroupModelChangeKind.EDITOR_STICKY */:
                        case 9 /* GroupModelChangeKind.EDITOR_CAPABILITIES */:
                        case 10 /* GroupModelChangeKind.EDITOR_PIN */:
                        case 8 /* GroupModelChangeKind.EDITOR_LABEL */:
                            this.list.splice(index, 1, [new files_1.OpenEditor(e.editor, group)]);
                            this.focusActiveEditor();
                            break;
                        case 4 /* GroupModelChangeKind.EDITOR_OPEN */:
                        case 6 /* GroupModelChangeKind.EDITOR_MOVE */:
                        case 5 /* GroupModelChangeKind.EDITOR_CLOSE */:
                            updateWholeList();
                            break;
                    }
                });
                groupDisposables.set(group.id, groupModelChangeListener);
                this._register(groupDisposables.get(group.id));
            };
            this.editorGroupService.groups.forEach(g => addGroupListener(g));
            this._register(this.editorGroupService.onDidAddGroup(group => {
                addGroupListener(group);
                updateWholeList();
            }));
            this._register(this.editorGroupService.onDidMoveGroup(() => updateWholeList()));
            this._register(this.editorGroupService.onDidChangeActiveGroup(() => this.focusActiveEditor()));
            this._register(this.editorGroupService.onDidRemoveGroup(group => {
                (0, lifecycle_1.dispose)(groupDisposables.get(group.id));
                updateWholeList();
            }));
        }
        renderHeaderTitle(container) {
            super.renderHeaderTitle(container, this.title);
            const count = dom.append(container, $('.open-editors-dirty-count-container'));
            this.dirtyCountElement = dom.append(count, $('.dirty-count.monaco-count-badge.long'));
            this.dirtyCountElement.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeBackground);
            this.dirtyCountElement.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeForeground);
            this.dirtyCountElement.style.border = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.contrastBorder)}`;
            this.updateDirtyIndicator();
        }
        renderBody(container) {
            super.renderBody(container);
            container.classList.add('open-editors');
            container.classList.add('show-file-icons');
            const delegate = new OpenEditorsDelegate();
            if (this.list) {
                this.list.dispose();
            }
            if (this.listLabels) {
                this.listLabels.clear();
            }
            this.listLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchList, 'OpenEditors', container, delegate, [
                new EditorGroupRenderer(this.keybindingService, this.instantiationService),
                new OpenEditorRenderer(this.listLabels, this.instantiationService, this.keybindingService, this.configurationService)
            ], {
                identityProvider: { getId: (element) => element instanceof files_1.OpenEditor ? element.getId() : element.id.toString() },
                dnd: new OpenEditorsDragAndDrop(this.instantiationService, this.editorGroupService),
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                },
                accessibilityProvider: new OpenEditorsAccessibilityProvider()
            });
            this._register(this.list);
            this._register(this.listLabels);
            // Register the refresh scheduler
            let labelChangeListeners = [];
            this.listRefreshScheduler = this._register(new async_1.RunOnceScheduler(() => {
                // No need to refresh the list if it's not rendered
                if (!this.list) {
                    return;
                }
                labelChangeListeners = (0, lifecycle_1.dispose)(labelChangeListeners);
                const previousLength = this.list.length;
                const elements = this.getElements();
                this.list.splice(0, this.list.length, elements);
                this.focusActiveEditor();
                if (previousLength !== this.list.length) {
                    this.updateSize();
                }
                this.needsRefresh = false;
                if (this.sortOrder === 'alphabetical' || this.sortOrder === 'fullPath') {
                    // We need to resort the list if the editor label changed
                    elements.forEach(e => {
                        if (e instanceof files_1.OpenEditor) {
                            labelChangeListeners.push(e.editor.onDidChangeLabel(() => this.listRefreshScheduler?.schedule()));
                        }
                    });
                }
            }, this.structuralRefreshDelay));
            this.updateSize();
            // Bind context keys
            files_1.OpenEditorsFocusedContext.bindTo(this.list.contextKeyService);
            files_1.ExplorerFocusedContext.bindTo(this.list.contextKeyService);
            this.resourceContext = this.instantiationService.createInstance(contextkeys_1.ResourceContextKey);
            this._register(this.resourceContext);
            this.groupFocusedContext = fileConstants_1.OpenEditorsGroupContext.bindTo(this.contextKeyService);
            this.dirtyEditorFocusedContext = fileConstants_1.OpenEditorsDirtyEditorContext.bindTo(this.contextKeyService);
            this.readonlyEditorFocusedContext = fileConstants_1.OpenEditorsReadonlyEditorContext.bindTo(this.contextKeyService);
            this._register(this.list.onContextMenu(e => this.onListContextMenu(e)));
            this.list.onDidChangeFocus(e => {
                this.resourceContext.reset();
                this.groupFocusedContext.reset();
                this.dirtyEditorFocusedContext.reset();
                this.readonlyEditorFocusedContext.reset();
                const element = e.elements.length ? e.elements[0] : undefined;
                if (element instanceof files_1.OpenEditor) {
                    const resource = element.getResource();
                    this.dirtyEditorFocusedContext.set(element.editor.isDirty() && !element.editor.isSaving());
                    this.readonlyEditorFocusedContext.set(!!element.editor.isReadonly());
                    this.resourceContext.set(resource ?? null);
                }
                else if (!!element) {
                    this.groupFocusedContext.set(true);
                }
            });
            // Open when selecting via keyboard
            this._register(this.list.onMouseMiddleClick(e => {
                if (e && e.element instanceof files_1.OpenEditor) {
                    if ((0, editor_1.preventEditorClose)(e.element.group, e.element.editor, editor_1.EditorCloseMethod.MOUSE, this.editorGroupService.partOptions)) {
                        return;
                    }
                    e.element.group.closeEditor(e.element.editor, { preserveFocus: true });
                }
            }));
            this._register(this.list.onDidOpen(e => {
                const element = e.element;
                if (!element) {
                    return;
                }
                else if (element instanceof files_1.OpenEditor) {
                    if (dom.isMouseEvent(e.browserEvent) && e.browserEvent.button === 1) {
                        return; // middle click already handled above: closes the editor
                    }
                    this.withActiveEditorFocusTrackingDisabled(() => {
                        this.openEditor(element, { preserveFocus: e.editorOptions.preserveFocus, pinned: e.editorOptions.pinned, sideBySide: e.sideBySide });
                    });
                }
                else {
                    this.withActiveEditorFocusTrackingDisabled(() => {
                        this.editorGroupService.activateGroup(element);
                        if (!e.editorOptions.preserveFocus) {
                            element.focus();
                        }
                    });
                }
            }));
            this.listRefreshScheduler.schedule(0);
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.needsRefresh) {
                    this.listRefreshScheduler?.schedule(0);
                }
            }));
            const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
            this._register(containerModel.onDidChangeAllViewDescriptors(() => {
                this.updateSize();
            }));
        }
        focus() {
            super.focus();
            this.list?.domFocus();
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.list?.layout(height, width);
        }
        get showGroups() {
            return this.editorGroupService.groups.length > 1;
        }
        getElements() {
            this.elements = [];
            this.editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).forEach(g => {
                if (this.showGroups) {
                    this.elements.push(g);
                }
                let editors = g.editors.map(ei => new files_1.OpenEditor(ei, g));
                if (this.sortOrder === 'alphabetical') {
                    editors = editors.sort((first, second) => (0, comparers_1.compareFileNamesDefault)(first.editor.getName(), second.editor.getName()));
                }
                else if (this.sortOrder === 'fullPath') {
                    editors = editors.sort((first, second) => {
                        const firstResource = first.editor.resource;
                        const secondResource = second.editor.resource;
                        //put 'system' editors before everything
                        if (firstResource === undefined && secondResource === undefined) {
                            return (0, comparers_1.compareFileNamesDefault)(first.editor.getName(), second.editor.getName());
                        }
                        else if (firstResource === undefined) {
                            return -1;
                        }
                        else if (secondResource === undefined) {
                            return 1;
                        }
                        else {
                            const firstScheme = firstResource.scheme;
                            const secondScheme = secondResource.scheme;
                            //put non-file editors before files
                            if (firstScheme !== network_1.Schemas.file && secondScheme !== network_1.Schemas.file) {
                                return resources_1.extUriIgnorePathCase.compare(firstResource, secondResource);
                            }
                            else if (firstScheme !== network_1.Schemas.file) {
                                return -1;
                            }
                            else if (secondScheme !== network_1.Schemas.file) {
                                return 1;
                            }
                            else {
                                return resources_1.extUriIgnorePathCase.compare(firstResource, secondResource);
                            }
                        }
                    });
                }
                this.elements.push(...editors);
            });
            return this.elements;
        }
        getIndex(group, editor) {
            if (!editor) {
                return this.elements.findIndex(e => !(e instanceof files_1.OpenEditor) && e.id === group.id);
            }
            return this.elements.findIndex(e => e instanceof files_1.OpenEditor && e.editor === editor && e.group.id === group.id);
        }
        openEditor(element, options) {
            if (element) {
                this.telemetryService.publicLog2('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'openEditors' });
                const preserveActivateGroup = options.sideBySide && options.preserveFocus; // needed for https://github.com/microsoft/vscode/issues/42399
                if (!preserveActivateGroup) {
                    this.editorGroupService.activateGroup(element.group); // needed for https://github.com/microsoft/vscode/issues/6672
                }
                const targetGroup = options.sideBySide ? this.editorGroupService.sideGroup : element.group;
                targetGroup.openEditor(element.editor, options);
            }
        }
        onListContextMenu(e) {
            if (!e.element) {
                return;
            }
            const element = e.element;
            this.contextMenuService.showContextMenu({
                menuId: actions_2.MenuId.OpenEditorsContext,
                menuActionOptions: { shouldForwardArgs: true, arg: element instanceof files_1.OpenEditor ? editor_1.EditorResourceAccessor.getOriginalUri(element.editor) : {} },
                contextKeyService: this.list?.contextKeyService,
                getAnchor: () => e.anchor,
                getActionsContext: () => element instanceof files_1.OpenEditor ? { groupId: element.groupId, editorIndex: element.group.getIndexOfEditor(element.editor) } : { groupId: element.id }
            });
        }
        withActiveEditorFocusTrackingDisabled(fn) {
            this.blockFocusActiveEditorTracking = true;
            try {
                fn();
            }
            finally {
                this.blockFocusActiveEditorTracking = false;
            }
        }
        focusActiveEditor() {
            if (!this.list || this.blockFocusActiveEditorTracking) {
                return;
            }
            if (this.list.length && this.editorGroupService.activeGroup) {
                const index = this.getIndex(this.editorGroupService.activeGroup, this.editorGroupService.activeGroup.activeEditor);
                if (index >= 0) {
                    try {
                        this.list.setFocus([index]);
                        this.list.setSelection([index]);
                        this.list.reveal(index);
                    }
                    catch (e) {
                        // noop list updated in the meantime
                    }
                    return;
                }
            }
            this.list.setFocus([]);
            this.list.setSelection([]);
        }
        onConfigurationChange(event) {
            if (event.affectsConfiguration('explorer.openEditors')) {
                this.updateSize();
            }
            // Trigger a 'repaint' when decoration settings change or the sort order changed
            if (event.affectsConfiguration('explorer.decorations') || event.affectsConfiguration('explorer.openEditors.sortOrder')) {
                this.sortOrder = this.configurationService.getValue('explorer.openEditors.sortOrder');
                this.listRefreshScheduler?.schedule();
            }
        }
        updateSize() {
            // Adjust expanded body size
            this.minimumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ ? this.getMinExpandedBodySize() : 170;
            this.maximumBodySize = this.orientation === 0 /* Orientation.VERTICAL */ ? this.getMaxExpandedBodySize() : Number.POSITIVE_INFINITY;
        }
        updateDirtyIndicator(workingCopy) {
            if (workingCopy) {
                const gotDirty = workingCopy.isDirty();
                if (gotDirty && !(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.filesConfigurationService.hasShortAutoSaveDelay(workingCopy.resource)) {
                    return; // do not indicate dirty of working copies that are auto saved after short delay
                }
            }
            const dirty = this.workingCopyService.dirtyCount;
            if (dirty === 0) {
                this.dirtyCountElement.classList.add('hidden');
            }
            else {
                this.dirtyCountElement.textContent = nls.localize('dirtyCounter', "{0} unsaved", dirty);
                this.dirtyCountElement.classList.remove('hidden');
            }
        }
        get elementCount() {
            return this.editorGroupService.groups.map(g => g.count)
                .reduce((first, second) => first + second, this.showGroups ? this.editorGroupService.groups.length : 0);
        }
        getMaxExpandedBodySize() {
            let minVisibleOpenEditors = this.configurationService.getValue('explorer.openEditors.minVisible');
            // If it's not a number setting it to 0 will result in dynamic resizing.
            if (typeof minVisibleOpenEditors !== 'number') {
                minVisibleOpenEditors = OpenEditorsView_1.DEFAULT_MIN_VISIBLE_OPEN_EDITORS;
            }
            const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
            if (containerModel.visibleViewDescriptors.length <= 1) {
                return Number.POSITIVE_INFINITY;
            }
            return (Math.max(this.elementCount, minVisibleOpenEditors)) * OpenEditorsDelegate.ITEM_HEIGHT;
        }
        getMinExpandedBodySize() {
            let visibleOpenEditors = this.configurationService.getValue('explorer.openEditors.visible');
            if (typeof visibleOpenEditors !== 'number') {
                visibleOpenEditors = OpenEditorsView_1.DEFAULT_VISIBLE_OPEN_EDITORS;
            }
            return this.computeMinExpandedBodySize(visibleOpenEditors);
        }
        computeMinExpandedBodySize(visibleOpenEditors = OpenEditorsView_1.DEFAULT_VISIBLE_OPEN_EDITORS) {
            const itemsToShow = Math.min(Math.max(visibleOpenEditors, 1), this.elementCount);
            return itemsToShow * OpenEditorsDelegate.ITEM_HEIGHT;
        }
        setStructuralRefreshDelay(delay) {
            this.structuralRefreshDelay = delay;
        }
        getOptimalWidth() {
            if (!this.list) {
                return super.getOptimalWidth();
            }
            const parentNode = this.list.getHTMLElement();
            const childNodes = [].slice.call(parentNode.querySelectorAll('.open-editor > a'));
            return dom.getLargestChildWidth(parentNode, childNodes);
        }
    };
    exports.OpenEditorsView = OpenEditorsView;
    exports.OpenEditorsView = OpenEditorsView = OpenEditorsView_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, views_1.IViewDescriptorService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, editorGroupsService_1.IEditorGroupsService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, workingCopyService_1.IWorkingCopyService),
        __param(11, filesConfigurationService_1.IFilesConfigurationService),
        __param(12, opener_1.IOpenerService)
    ], OpenEditorsView);
    class OpenEditorActionRunner extends actions_1.ActionRunner {
        async run(action) {
            if (!this.editor) {
                return;
            }
            return super.run(action, { groupId: this.editor.groupId, editorIndex: this.editor.group.getIndexOfEditor(this.editor.editor) });
        }
    }
    class OpenEditorsDelegate {
        static { this.ITEM_HEIGHT = 22; }
        getHeight(_element) {
            return OpenEditorsDelegate.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            if (element instanceof files_1.OpenEditor) {
                return OpenEditorRenderer.ID;
            }
            return EditorGroupRenderer.ID;
        }
    }
    class EditorGroupRenderer {
        static { this.ID = 'editorgroup'; }
        constructor(keybindingService, instantiationService) {
            this.keybindingService = keybindingService;
            this.instantiationService = instantiationService;
            // noop
        }
        get templateId() {
            return EditorGroupRenderer.ID;
        }
        renderTemplate(container) {
            const editorGroupTemplate = Object.create(null);
            editorGroupTemplate.root = dom.append(container, $('.editor-group'));
            editorGroupTemplate.name = dom.append(editorGroupTemplate.root, $('span.name'));
            editorGroupTemplate.actionBar = new actionbar_1.ActionBar(container);
            const saveAllInGroupAction = this.instantiationService.createInstance(fileActions_1.SaveAllInGroupAction, fileActions_1.SaveAllInGroupAction.ID, fileActions_1.SaveAllInGroupAction.LABEL);
            const saveAllInGroupKey = this.keybindingService.lookupKeybinding(saveAllInGroupAction.id);
            editorGroupTemplate.actionBar.push(saveAllInGroupAction, { icon: true, label: false, keybinding: saveAllInGroupKey ? saveAllInGroupKey.getLabel() : undefined });
            const closeGroupAction = this.instantiationService.createInstance(fileActions_1.CloseGroupAction, fileActions_1.CloseGroupAction.ID, fileActions_1.CloseGroupAction.LABEL);
            const closeGroupActionKey = this.keybindingService.lookupKeybinding(closeGroupAction.id);
            editorGroupTemplate.actionBar.push(closeGroupAction, { icon: true, label: false, keybinding: closeGroupActionKey ? closeGroupActionKey.getLabel() : undefined });
            return editorGroupTemplate;
        }
        renderElement(editorGroup, _index, templateData) {
            templateData.editorGroup = editorGroup;
            templateData.name.textContent = editorGroup.label;
            templateData.actionBar.context = { groupId: editorGroup.id };
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
        }
    }
    class OpenEditorRenderer {
        static { this.ID = 'openeditor'; }
        constructor(labels, instantiationService, keybindingService, configurationService) {
            this.labels = labels;
            this.instantiationService = instantiationService;
            this.keybindingService = keybindingService;
            this.configurationService = configurationService;
            this.closeEditorAction = this.instantiationService.createInstance(editorActions_1.CloseEditorAction, editorActions_1.CloseEditorAction.ID, editorActions_1.CloseEditorAction.LABEL);
            this.unpinEditorAction = this.instantiationService.createInstance(editorActions_1.UnpinEditorAction, editorActions_1.UnpinEditorAction.ID, editorActions_1.UnpinEditorAction.LABEL);
            // noop
        }
        get templateId() {
            return OpenEditorRenderer.ID;
        }
        renderTemplate(container) {
            const editorTemplate = Object.create(null);
            editorTemplate.container = container;
            editorTemplate.actionRunner = new OpenEditorActionRunner();
            editorTemplate.actionBar = new actionbar_1.ActionBar(container, { actionRunner: editorTemplate.actionRunner });
            editorTemplate.root = this.labels.create(container);
            return editorTemplate;
        }
        renderElement(openedEditor, _index, templateData) {
            const editor = openedEditor.editor;
            templateData.actionRunner.editor = openedEditor;
            templateData.container.classList.toggle('dirty', editor.isDirty() && !editor.isSaving());
            templateData.container.classList.toggle('sticky', openedEditor.isSticky());
            templateData.root.setResource({
                resource: editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH }),
                name: editor.getName(),
                description: editor.getDescription(1 /* Verbosity.MEDIUM */)
            }, {
                italic: openedEditor.isPreview(),
                extraClasses: ['open-editor'].concat(openedEditor.editor.getLabelExtraClasses()),
                fileDecorations: this.configurationService.getValue().explorer.decorations,
                title: editor.getTitle(2 /* Verbosity.LONG */),
                icon: editor.getIcon()
            });
            const editorAction = openedEditor.isSticky() ? this.unpinEditorAction : this.closeEditorAction;
            if (!templateData.actionBar.hasAction(editorAction)) {
                if (!templateData.actionBar.isEmpty()) {
                    templateData.actionBar.clear();
                }
                templateData.actionBar.push(editorAction, { icon: true, label: false, keybinding: this.keybindingService.lookupKeybinding(editorAction.id)?.getLabel() });
            }
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
            templateData.root.dispose();
            templateData.actionRunner.dispose();
        }
    }
    class OpenEditorsDragAndDrop {
        constructor(instantiationService, editorGroupService) {
            this.instantiationService = instantiationService;
            this.editorGroupService = editorGroupService;
        }
        get dropHandler() {
            return this.instantiationService.createInstance(dnd_2.ResourcesDropHandler, { allowWorkspaceOpen: false });
        }
        getDragURI(element) {
            if (element instanceof files_1.OpenEditor) {
                const resource = element.getResource();
                if (resource) {
                    return resource.toString();
                }
            }
            return null;
        }
        getDragLabel(elements) {
            if (elements.length > 1) {
                return String(elements.length);
            }
            const element = elements[0];
            return element instanceof files_1.OpenEditor ? element.editor.getName() : element.label;
        }
        onDragStart(data, originalEvent) {
            const items = data.elements;
            const editors = [];
            if (items) {
                for (const item of items) {
                    if (item instanceof files_1.OpenEditor) {
                        editors.push(item);
                    }
                }
            }
            if (editors.length) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.instantiationService.invokeFunction(dnd_2.fillEditorsDragData, editors, originalEvent);
            }
        }
        onDragOver(data, _targetElement, _targetIndex, targetSector, originalEvent) {
            if (data instanceof listView_1.NativeDragAndDropData) {
                if (!(0, dnd_1.containsDragType)(originalEvent, dnd_3.DataTransfers.FILES, dnd_1.CodeDataTransfers.FILES)) {
                    return false;
                }
            }
            let dropEffectPosition = undefined;
            switch (targetSector) {
                case 0 /* ListViewTargetSector.TOP */:
                case 1 /* ListViewTargetSector.CENTER_TOP */:
                    dropEffectPosition = (_targetIndex === 0 && _targetElement instanceof editorGroupView_1.EditorGroupView) ? "drop-target-after" /* ListDragOverEffectPosition.After */ : "drop-target-before" /* ListDragOverEffectPosition.Before */;
                    break;
                case 2 /* ListViewTargetSector.CENTER_BOTTOM */:
                case 3 /* ListViewTargetSector.BOTTOM */:
                    dropEffectPosition = "drop-target-after" /* ListDragOverEffectPosition.After */;
                    break;
            }
            return { accept: true, effect: { type: 1 /* ListDragOverEffectType.Move */, position: dropEffectPosition }, feedback: [_targetIndex] };
        }
        drop(data, targetElement, _targetIndex, targetSector, originalEvent) {
            let group = targetElement instanceof files_1.OpenEditor ? targetElement.group : targetElement || this.editorGroupService.groups[this.editorGroupService.count - 1];
            let targetEditorIndex = targetElement instanceof files_1.OpenEditor ? targetElement.group.getIndexOfEditor(targetElement.editor) : 0;
            switch (targetSector) {
                case 0 /* ListViewTargetSector.TOP */:
                case 1 /* ListViewTargetSector.CENTER_TOP */:
                    if (targetElement instanceof editorGroupView_1.EditorGroupView && group.index !== 0) {
                        group = this.editorGroupService.groups[group.index - 1];
                        targetEditorIndex = group.count;
                    }
                    break;
                case 3 /* ListViewTargetSector.BOTTOM */:
                case 2 /* ListViewTargetSector.CENTER_BOTTOM */:
                    if (targetElement instanceof files_1.OpenEditor) {
                        targetEditorIndex++;
                    }
                    break;
            }
            if (data instanceof listView_1.ElementsDragAndDropData) {
                for (const oe of data.elements) {
                    const sourceEditorIndex = oe.group.getIndexOfEditor(oe.editor);
                    if (oe.group === group && sourceEditorIndex < targetEditorIndex) {
                        targetEditorIndex--;
                    }
                    oe.group.moveEditor(oe.editor, group, { index: targetEditorIndex, preserveFocus: true });
                    targetEditorIndex++;
                }
                this.editorGroupService.activateGroup(group);
            }
            else {
                this.dropHandler.handleDrop(originalEvent, window_1.mainWindow, () => group, () => group.focus(), { index: targetEditorIndex });
            }
        }
        dispose() { }
    }
    __decorate([
        decorators_1.memoize
    ], OpenEditorsDragAndDrop.prototype, "dropHandler", null);
    class OpenEditorsAccessibilityProvider {
        getWidgetAriaLabel() {
            return nls.localize('openEditors', "Open Editors");
        }
        getAriaLabel(element) {
            if (element instanceof files_1.OpenEditor) {
                return `${element.editor.getName()}, ${element.editor.getDescription()}`;
            }
            return element.ariaLabel;
        }
    }
    const toggleEditorGroupLayoutId = 'workbench.action.toggleEditorGroupLayout';
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleEditorGroupLayout',
                title: { value: nls.localize('flipLayout', "Toggle Vertical/Horizontal Editor Layout"), original: 'Toggle Vertical/Horizontal Editor Layout' },
                f1: true,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 21 /* KeyCode.Digit0 */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 21 /* KeyCode.Digit0 */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                icon: codicons_1.Codicon.editorLayout,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', OpenEditorsView.ID), contextkeys_1.MultipleEditorGroupsContext),
                    order: 10
                }
            });
        }
        async run(accessor) {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const newOrientation = (editorGroupService.orientation === 1 /* GroupOrientation.VERTICAL */) ? 0 /* GroupOrientation.HORIZONTAL */ : 1 /* GroupOrientation.VERTICAL */;
            editorGroupService.setGroupOrientation(newOrientation);
        }
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '5_flip',
        command: {
            id: toggleEditorGroupLayoutId,
            title: {
                original: 'Flip Layout',
                value: nls.localize('miToggleEditorLayoutWithoutMnemonic', "Flip Layout"),
                mnemonicTitle: nls.localize({ key: 'miToggleEditorLayout', comment: ['&& denotes a mnemonic'] }, "Flip &&Layout")
            }
        },
        order: 1
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.files.saveAll',
                title: { value: fileConstants_1.SAVE_ALL_LABEL, original: 'Save All' },
                f1: true,
                icon: codicons_1.Codicon.saveAll,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', OpenEditorsView.ID),
                    order: 20
                }
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            await commandService.executeCommand(fileConstants_1.SAVE_ALL_COMMAND_ID);
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'openEditors.closeAll',
                title: editorActions_1.CloseAllEditorsAction.LABEL,
                f1: false,
                icon: codicons_1.Codicon.closeAll,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', OpenEditorsView.ID),
                    order: 30
                }
            });
        }
        async run(accessor) {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const closeAll = new editorActions_1.CloseAllEditorsAction();
            await instantiationService.invokeFunction(accessor => closeAll.run(accessor));
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'openEditors.newUntitledFile',
                title: { value: nls.localize('newUntitledFile', "New Untitled Text File"), original: 'New Untitled Text File' },
                f1: false,
                icon: codicons_1.Codicon.newFile,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.equals('view', OpenEditorsView.ID),
                    order: 5
                }
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            await commandService.executeCommand(fileConstants_1.NEW_UNTITLED_FILE_COMMAND_ID);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbkVkaXRvcnNWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9icm93c2VyL3ZpZXdzL29wZW5FZGl0b3JzVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBc0RoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRVQsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZ0IsU0FBUSxtQkFBUTs7aUJBRXBCLGlDQUE0QixHQUFHLENBQUMsQUFBSixDQUFLO2lCQUNqQyxxQ0FBZ0MsR0FBRyxDQUFDLEFBQUosQ0FBSztpQkFDN0MsT0FBRSxHQUFHLG9DQUFvQyxBQUF2QyxDQUF3QztpQkFDMUMsU0FBSSxHQUFxQixHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLEFBQTdHLENBQThHO1FBZ0JsSSxZQUNDLE9BQTRCLEVBQ0wsb0JBQTJDLEVBQzFDLHFCQUE2QyxFQUNoRCxrQkFBdUMsRUFDdEMsa0JBQXlELEVBQ3hELG9CQUEyQyxFQUM5QyxpQkFBcUMsRUFDckMsaUJBQXFDLEVBQzFDLFlBQTJCLEVBQ3ZCLGdCQUFtQyxFQUNqQyxrQkFBd0QsRUFDakQseUJBQXNFLEVBQ2xGLGFBQTZCO1lBRTdDLEtBQUssQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBVnBKLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBc0I7WUFNekMsdUJBQWtCLEdBQWxCLGtCQUFrQixD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