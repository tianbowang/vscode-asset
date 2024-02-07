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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/ui/toolbar/toolbar", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView", "vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/assignment/common/assignmentService", "vs/base/common/async", "vs/platform/actions/browser/toolbar"], function (require, exports, DOM, scrollableElement_1, toolbar_1, actions_1, event_1, lifecycle_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextView_1, instantiation_1, keybinding_1, coreActions_1, notebookCommon_1, notebookKernelView_1, cellActionView_1, editorService_1, assignmentService_1, async_1, toolbar_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.workbenchDynamicCalculateActions = exports.workbenchCalculateActions = exports.NotebookEditorWorkbenchToolbar = exports.convertConfiguration = exports.RenderLabel = void 0;
    var RenderLabel;
    (function (RenderLabel) {
        RenderLabel[RenderLabel["Always"] = 0] = "Always";
        RenderLabel[RenderLabel["Never"] = 1] = "Never";
        RenderLabel[RenderLabel["Dynamic"] = 2] = "Dynamic";
    })(RenderLabel || (exports.RenderLabel = RenderLabel = {}));
    function convertConfiguration(value) {
        switch (value) {
            case true:
                return RenderLabel.Always;
            case false:
                return RenderLabel.Never;
            case 'always':
                return RenderLabel.Always;
            case 'never':
                return RenderLabel.Never;
            case 'dynamic':
                return RenderLabel.Dynamic;
        }
    }
    exports.convertConfiguration = convertConfiguration;
    const ICON_ONLY_ACTION_WIDTH = 21;
    const TOGGLE_MORE_ACTION_WIDTH = 21;
    const ACTION_PADDING = 8;
    class WorkbenchAlwaysLabelStrategy {
        constructor(notebookEditor, editorToolbar, instantiationService) {
            this.notebookEditor = notebookEditor;
            this.editorToolbar = editorToolbar;
            this.instantiationService = instantiationService;
        }
        actionProvider(action) {
            if (action.id === coreActions_1.SELECT_KERNEL_ID) {
                //	this is being disposed by the consumer
                return this.instantiationService.createInstance(notebookKernelView_1.NotebooKernelActionViewItem, action, this.notebookEditor);
            }
            return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(cellActionView_1.ActionViewWithLabel, action, undefined) : undefined;
        }
        calculateActions(leftToolbarContainerMaxWidth) {
            const initialPrimaryActions = this.editorToolbar.primaryActions;
            const initialSecondaryActions = this.editorToolbar.secondaryActions;
            const actionOutput = workbenchCalculateActions(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth);
            return {
                primaryActions: actionOutput.primaryActions.map(a => a.action),
                secondaryActions: actionOutput.secondaryActions
            };
        }
    }
    class WorkbenchNeverLabelStrategy {
        constructor(notebookEditor, editorToolbar, instantiationService) {
            this.notebookEditor = notebookEditor;
            this.editorToolbar = editorToolbar;
            this.instantiationService = instantiationService;
        }
        actionProvider(action) {
            if (action.id === coreActions_1.SELECT_KERNEL_ID) {
                //	this is being disposed by the consumer
                return this.instantiationService.createInstance(notebookKernelView_1.NotebooKernelActionViewItem, action, this.notebookEditor);
            }
            return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined) : undefined;
        }
        calculateActions(leftToolbarContainerMaxWidth) {
            const initialPrimaryActions = this.editorToolbar.primaryActions;
            const initialSecondaryActions = this.editorToolbar.secondaryActions;
            const actionOutput = workbenchCalculateActions(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth);
            return {
                primaryActions: actionOutput.primaryActions.map(a => a.action),
                secondaryActions: actionOutput.secondaryActions
            };
        }
    }
    class WorkbenchDynamicLabelStrategy {
        constructor(notebookEditor, editorToolbar, instantiationService) {
            this.notebookEditor = notebookEditor;
            this.editorToolbar = editorToolbar;
            this.instantiationService = instantiationService;
        }
        actionProvider(action) {
            if (action.id === coreActions_1.SELECT_KERNEL_ID) {
                //	this is being disposed by the consumer
                return this.instantiationService.createInstance(notebookKernelView_1.NotebooKernelActionViewItem, action, this.notebookEditor);
            }
            const a = this.editorToolbar.primaryActions.find(a => a.action.id === action.id);
            if (!a || a.renderLabel) {
                return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(cellActionView_1.ActionViewWithLabel, action, undefined) : undefined;
            }
            else {
                return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined) : undefined;
            }
        }
        calculateActions(leftToolbarContainerMaxWidth) {
            const initialPrimaryActions = this.editorToolbar.primaryActions;
            const initialSecondaryActions = this.editorToolbar.secondaryActions;
            const actionOutput = workbenchDynamicCalculateActions(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth);
            return {
                primaryActions: actionOutput.primaryActions.map(a => a.action),
                secondaryActions: actionOutput.secondaryActions
            };
        }
    }
    let NotebookEditorWorkbenchToolbar = class NotebookEditorWorkbenchToolbar extends lifecycle_1.Disposable {
        get primaryActions() {
            return this._primaryActions;
        }
        get secondaryActions() {
            return this._secondaryActions;
        }
        set visible(visible) {
            if (this._visible !== visible) {
                this._visible = visible;
                this._onDidChangeVisibility.fire(visible);
            }
        }
        get useGlobalToolbar() {
            return this._useGlobalToolbar;
        }
        constructor(notebookEditor, contextKeyService, notebookOptions, domNode, instantiationService, configurationService, contextMenuService, menuService, editorService, keybindingService, experimentService) {
            super();
            this.notebookEditor = notebookEditor;
            this.contextKeyService = contextKeyService;
            this.notebookOptions = notebookOptions;
            this.domNode = domNode;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.contextMenuService = contextMenuService;
            this.menuService = menuService;
            this.editorService = editorService;
            this.keybindingService = keybindingService;
            this.experimentService = experimentService;
            this._useGlobalToolbar = false;
            this._renderLabel = RenderLabel.Always;
            this._visible = false;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._dimension = null;
            this._primaryActions = [];
            this._secondaryActions = [];
            this._buildBody();
            this._register(event_1.Event.debounce(this.editorService.onDidActiveEditorChange, (last, _current) => last, 200)(this._updatePerEditorChange, this));
            this._registerNotebookActionsToolbar();
        }
        _buildBody() {
            this._notebookTopLeftToolbarContainer = document.createElement('div');
            this._notebookTopLeftToolbarContainer.classList.add('notebook-toolbar-left');
            this._leftToolbarScrollable = new scrollableElement_1.DomScrollableElement(this._notebookTopLeftToolbarContainer, {
                vertical: 2 /* ScrollbarVisibility.Hidden */,
                horizontal: 3 /* ScrollbarVisibility.Visible */,
                horizontalScrollbarSize: 3,
                useShadows: false,
                scrollYToX: true
            });
            this._register(this._leftToolbarScrollable);
            DOM.append(this.domNode, this._leftToolbarScrollable.getDomNode());
            this._notebookTopRightToolbarContainer = document.createElement('div');
            this._notebookTopRightToolbarContainer.classList.add('notebook-toolbar-right');
            DOM.append(this.domNode, this._notebookTopRightToolbarContainer);
        }
        _updatePerEditorChange() {
            if (this.editorService.activeEditorPane?.getId() === notebookCommon_1.NOTEBOOK_EDITOR_ID) {
                const notebookEditor = this.editorService.activeEditorPane.getControl();
                if (notebookEditor === this.notebookEditor) {
                    // this is the active editor
                    this._showNotebookActionsinEditorToolbar();
                    return;
                }
            }
        }
        _registerNotebookActionsToolbar() {
            this._notebookGlobalActionsMenu = this._register(this.menuService.createMenu(this.notebookEditor.creationOptions.menuIds.notebookToolbar, this.contextKeyService));
            this._register(this._notebookGlobalActionsMenu);
            this._useGlobalToolbar = this.notebookOptions.getDisplayOptions().globalToolbar;
            this._renderLabel = this._convertConfiguration(this.configurationService.getValue(notebookCommon_1.NotebookSetting.globalToolbarShowLabel));
            this._updateStrategy();
            const context = {
                ui: true,
                notebookEditor: this.notebookEditor
            };
            const actionProvider = (action) => {
                if (action.id === coreActions_1.SELECT_KERNEL_ID) {
                    // this is being disposed by the consumer
                    return this.instantiationService.createInstance(notebookKernelView_1.NotebooKernelActionViewItem, action, this.notebookEditor);
                }
                if (this._renderLabel !== RenderLabel.Never) {
                    const a = this._primaryActions.find(a => a.action.id === action.id);
                    if (a && a.renderLabel) {
                        return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(cellActionView_1.ActionViewWithLabel, action, undefined) : undefined;
                    }
                    else {
                        return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined) : undefined;
                    }
                }
                else {
                    return action instanceof actions_2.MenuItemAction ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined) : undefined;
                }
            };
            const leftToolbarOptions = {
                hiddenItemStrategy: 1 /* HiddenItemStrategy.RenderInSecondaryGroup */,
                resetMenu: actions_2.MenuId.NotebookToolbar,
                actionViewItemProvider: (action, options) => {
                    return this._strategy.actionProvider(action, options);
                },
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                renderDropdownAsChildElement: true,
            };
            this._notebookLeftToolbar = this.instantiationService.createInstance(toolbar_2.WorkbenchToolBar, this._notebookTopLeftToolbarContainer, leftToolbarOptions);
            this._register(this._notebookLeftToolbar);
            this._notebookLeftToolbar.context = context;
            this._notebookRightToolbar = new toolbar_1.ToolBar(this._notebookTopRightToolbarContainer, this.contextMenuService, {
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                actionViewItemProvider: actionProvider,
                renderDropdownAsChildElement: true
            });
            this._register(this._notebookRightToolbar);
            this._notebookRightToolbar.context = context;
            this._showNotebookActionsinEditorToolbar();
            let dropdownIsVisible = false;
            let deferredUpdate;
            this._register(this._notebookGlobalActionsMenu.onDidChange(() => {
                if (dropdownIsVisible) {
                    deferredUpdate = () => this._showNotebookActionsinEditorToolbar();
                    return;
                }
                if (this.notebookEditor.isVisible) {
                    this._showNotebookActionsinEditorToolbar();
                }
            }));
            this._register(this._notebookLeftToolbar.onDidChangeDropdownVisibility(visible => {
                dropdownIsVisible = visible;
                if (deferredUpdate && !visible) {
                    setTimeout(() => {
                        deferredUpdate?.();
                    }, 0);
                    deferredUpdate = undefined;
                }
            }));
            this._register(this.notebookOptions.onDidChangeOptions(e => {
                if (e.globalToolbar !== undefined) {
                    this._useGlobalToolbar = this.notebookOptions.getDisplayOptions().globalToolbar;
                    this._showNotebookActionsinEditorToolbar();
                }
            }));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(notebookCommon_1.NotebookSetting.globalToolbarShowLabel)) {
                    this._renderLabel = this._convertConfiguration(this.configurationService.getValue(notebookCommon_1.NotebookSetting.globalToolbarShowLabel));
                    this._updateStrategy();
                    const oldElement = this._notebookLeftToolbar.getElement();
                    oldElement.parentElement?.removeChild(oldElement);
                    this._notebookLeftToolbar.dispose();
                    this._notebookLeftToolbar = this.instantiationService.createInstance(toolbar_2.WorkbenchToolBar, this._notebookTopLeftToolbarContainer, leftToolbarOptions);
                    this._register(this._notebookLeftToolbar);
                    this._notebookLeftToolbar.context = context;
                    this._showNotebookActionsinEditorToolbar();
                    return;
                }
            }));
            if (this.experimentService) {
                this.experimentService.getTreatment('nbtoolbarineditor').then(treatment => {
                    if (treatment === undefined) {
                        return;
                    }
                    if (this._useGlobalToolbar !== treatment) {
                        this._useGlobalToolbar = treatment;
                        this._showNotebookActionsinEditorToolbar();
                    }
                });
            }
        }
        _updateStrategy() {
            switch (this._renderLabel) {
                case RenderLabel.Always:
                    this._strategy = new WorkbenchAlwaysLabelStrategy(this.notebookEditor, this, this.instantiationService);
                    break;
                case RenderLabel.Never:
                    this._strategy = new WorkbenchNeverLabelStrategy(this.notebookEditor, this, this.instantiationService);
                    break;
                case RenderLabel.Dynamic:
                    this._strategy = new WorkbenchDynamicLabelStrategy(this.notebookEditor, this, this.instantiationService);
                    break;
            }
        }
        _convertConfiguration(value) {
            switch (value) {
                case true:
                    return RenderLabel.Always;
                case false:
                    return RenderLabel.Never;
                case 'always':
                    return RenderLabel.Always;
                case 'never':
                    return RenderLabel.Never;
                case 'dynamic':
                    return RenderLabel.Dynamic;
            }
        }
        _showNotebookActionsinEditorToolbar() {
            // when there is no view model, just ignore.
            if (!this.notebookEditor.hasModel()) {
                this._deferredActionUpdate?.dispose();
                this._deferredActionUpdate = undefined;
                this.visible = false;
                return;
            }
            if (this._deferredActionUpdate) {
                return;
            }
            if (!this._useGlobalToolbar) {
                this.domNode.style.display = 'none';
                this._deferredActionUpdate = undefined;
                this.visible = false;
            }
            else {
                this._deferredActionUpdate = (0, async_1.disposableTimeout)(async () => {
                    await this._setNotebookActions();
                    this.visible = true;
                    this._deferredActionUpdate = undefined;
                }, 50);
            }
        }
        async _setNotebookActions() {
            const groups = this._notebookGlobalActionsMenu.getActions({ shouldForwardArgs: true, renderShortTitle: true });
            this.domNode.style.display = 'flex';
            const primaryLeftGroups = groups.filter(group => /^navigation/.test(group[0]));
            const primaryActions = [];
            primaryLeftGroups.sort((a, b) => {
                if (a[0] === 'navigation') {
                    return 1;
                }
                if (b[0] === 'navigation') {
                    return -1;
                }
                return 0;
            }).forEach((group, index) => {
                primaryActions.push(...group[1]);
                if (index < primaryLeftGroups.length - 1) {
                    primaryActions.push(new actions_1.Separator());
                }
            });
            const primaryRightGroup = groups.find(group => /^status/.test(group[0]));
            const primaryRightActions = primaryRightGroup ? primaryRightGroup[1] : [];
            const secondaryActions = groups.filter(group => !/^navigation/.test(group[0]) && !/^status/.test(group[0])).reduce((prev, curr) => { prev.push(...curr[1]); return prev; }, []);
            this._notebookLeftToolbar.setActions([], []);
            this._primaryActions = primaryActions.map(action => ({
                action: action,
                size: (action instanceof actions_1.Separator ? 1 : 0),
                renderLabel: true,
                visible: true
            }));
            this._notebookLeftToolbar.setActions(primaryActions, secondaryActions);
            this._secondaryActions = secondaryActions;
            this._notebookRightToolbar.setActions(primaryRightActions, []);
            this._secondaryActions = secondaryActions;
            if (this._dimension && this._dimension.width >= 0 && this._dimension.height >= 0) {
                this._cacheItemSizes(this._notebookLeftToolbar);
            }
            this._computeSizes();
        }
        _cacheItemSizes(toolbar) {
            for (let i = 0; i < toolbar.getItemsLength(); i++) {
                const action = toolbar.getItemAction(i);
                if (action && action.id !== 'toolbar.toggle.more') {
                    const existing = this._primaryActions.find(a => a.action.id === action.id);
                    if (existing) {
                        existing.size = toolbar.getItemWidth(i);
                    }
                }
            }
        }
        _computeSizes() {
            const toolbar = this._notebookLeftToolbar;
            const rightToolbar = this._notebookRightToolbar;
            if (toolbar && rightToolbar && this._dimension && this._dimension.height >= 0 && this._dimension.width >= 0) {
                // compute size only if it's visible
                if (this._primaryActions.length === 0 && toolbar.getItemsLength() !== this._primaryActions.length) {
                    this._cacheItemSizes(this._notebookLeftToolbar);
                }
                if (this._primaryActions.length === 0) {
                    return;
                }
                const kernelWidth = (rightToolbar.getItemsLength() ? rightToolbar.getItemWidth(0) : 0) + ACTION_PADDING;
                const leftToolbarContainerMaxWidth = this._dimension.width - kernelWidth - (ACTION_PADDING + TOGGLE_MORE_ACTION_WIDTH) - ( /** toolbar left margin */ACTION_PADDING) - ( /** toolbar right margin */ACTION_PADDING);
                const calculatedActions = this._strategy.calculateActions(leftToolbarContainerMaxWidth);
                this._notebookLeftToolbar.setActions(calculatedActions.primaryActions, calculatedActions.secondaryActions);
            }
        }
        layout(dimension) {
            this._dimension = dimension;
            if (!this._useGlobalToolbar) {
                this.domNode.style.display = 'none';
            }
            else {
                this.domNode.style.display = 'flex';
            }
            this._computeSizes();
        }
        dispose() {
            this._notebookLeftToolbar.context = undefined;
            this._notebookRightToolbar.context = undefined;
            this._notebookLeftToolbar.dispose();
            this._notebookRightToolbar.dispose();
            this._notebookLeftToolbar = null;
            this._notebookRightToolbar = null;
            this._deferredActionUpdate?.dispose();
            this._deferredActionUpdate = undefined;
            super.dispose();
        }
    };
    exports.NotebookEditorWorkbenchToolbar = NotebookEditorWorkbenchToolbar;
    exports.NotebookEditorWorkbenchToolbar = NotebookEditorWorkbenchToolbar = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, actions_2.IMenuService),
        __param(8, editorService_1.IEditorService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, assignmentService_1.IWorkbenchAssignmentService)
    ], NotebookEditorWorkbenchToolbar);
    function workbenchCalculateActions(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth) {
        return actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, false);
    }
    exports.workbenchCalculateActions = workbenchCalculateActions;
    function workbenchDynamicCalculateActions(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth) {
        if (initialPrimaryActions.length === 0) {
            return { primaryActions: [], secondaryActions: initialSecondaryActions };
        }
        // find true length of array, add 1 for each primary actions, ignoring an item when size = 0
        const visibleActionLength = initialPrimaryActions.filter(action => action.size !== 0).length;
        // step 1: try to fit all primary actions
        const totalWidthWithLabels = initialPrimaryActions.map(action => action.size).reduce((a, b) => a + b, 0) + (visibleActionLength - 1) * ACTION_PADDING;
        if (totalWidthWithLabels <= leftToolbarContainerMaxWidth) {
            initialPrimaryActions.forEach(action => {
                action.renderLabel = true;
            });
            return actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, false);
        }
        // step 2: check if they fit without labels
        if ((visibleActionLength * ICON_ONLY_ACTION_WIDTH + (visibleActionLength - 1) * ACTION_PADDING) > leftToolbarContainerMaxWidth) {
            initialPrimaryActions.forEach(action => { action.renderLabel = false; });
            return actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, true);
        }
        // step 3: render as many actions as possible with labels, rest without.
        let sum = 0;
        let lastActionWithLabel = -1;
        for (let i = 0; i < initialPrimaryActions.length; i++) {
            sum += initialPrimaryActions[i].size + ACTION_PADDING;
            if (initialPrimaryActions[i].action instanceof actions_1.Separator) {
                // find group separator
                const remainingItems = initialPrimaryActions.slice(i + 1).filter(action => action.size !== 0); // todo: need to exclude size 0 items from this
                const newTotalSum = sum + (remainingItems.length === 0 ? 0 : (remainingItems.length * ICON_ONLY_ACTION_WIDTH + (remainingItems.length - 1) * ACTION_PADDING));
                if (newTotalSum <= leftToolbarContainerMaxWidth) {
                    lastActionWithLabel = i;
                }
            }
            else {
                continue;
            }
        }
        // icons only don't fit either
        if (lastActionWithLabel < 0) {
            initialPrimaryActions.forEach(action => { action.renderLabel = false; });
            return actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, true);
        }
        // render labels for the actions that have space
        initialPrimaryActions.slice(0, lastActionWithLabel + 1).forEach(action => { action.renderLabel = true; });
        initialPrimaryActions.slice(lastActionWithLabel + 1).forEach(action => { action.renderLabel = false; });
        return {
            primaryActions: initialPrimaryActions,
            secondaryActions: initialSecondaryActions
        };
    }
    exports.workbenchDynamicCalculateActions = workbenchDynamicCalculateActions;
    function actionOverflowHelper(initialPrimaryActions, initialSecondaryActions, leftToolbarContainerMaxWidth, iconOnly) {
        const renderActions = [];
        const overflow = [];
        let currentSize = 0;
        let nonZeroAction = false;
        let containerFull = false;
        if (initialPrimaryActions.length === 0) {
            return { primaryActions: [], secondaryActions: initialSecondaryActions };
        }
        for (let i = 0; i < initialPrimaryActions.length; i++) {
            const actionModel = initialPrimaryActions[i];
            const itemSize = iconOnly ? (actionModel.size === 0 ? 0 : ICON_ONLY_ACTION_WIDTH) : actionModel.size;
            // if two separators in a row, ignore the second
            if (actionModel.action instanceof actions_1.Separator && renderActions.length > 0 && renderActions[renderActions.length - 1].action instanceof actions_1.Separator) {
                continue;
            }
            // if a separator is the first nonZero action, ignore it
            if (actionModel.action instanceof actions_1.Separator && !nonZeroAction) {
                continue;
            }
            if (currentSize + itemSize <= leftToolbarContainerMaxWidth && !containerFull) {
                currentSize += ACTION_PADDING + itemSize;
                renderActions.push(actionModel);
                if (itemSize !== 0) {
                    nonZeroAction = true;
                }
                if (actionModel.action instanceof actions_1.Separator) {
                    nonZeroAction = false;
                }
            }
            else {
                containerFull = true;
                if (itemSize === 0) { // size 0 implies a hidden item, keep in primary to allow for Workbench to handle visibility
                    renderActions.push(actionModel);
                }
                else {
                    if (actionModel.action instanceof actions_1.Separator) { // never push a separator to overflow
                        continue;
                    }
                    overflow.push(actionModel.action);
                }
            }
        }
        for (let i = (renderActions.length - 1); i > 0; i--) {
            const temp = renderActions[i];
            if (temp.size === 0) {
                continue;
            }
            if (temp.action instanceof actions_1.Separator) {
                renderActions.splice(i, 1);
            }
            break;
        }
        if (renderActions.length && renderActions[renderActions.length - 1].action instanceof actions_1.Separator) {
            renderActions.pop();
        }
        if (overflow.length !== 0) {
            overflow.push(new actions_1.Separator());
        }
        if (iconOnly) {
            // if icon only mode, don't render both (+ code) and (+ markdown) buttons. remove of markdown action
            const markdownIndex = renderActions.findIndex(a => a.action.id === 'notebook.cell.insertMarkdownCellBelow');
            if (markdownIndex !== -1) {
                renderActions.splice(markdownIndex, 1);
            }
        }
        return {
            primaryActions: renderActions,
            secondaryActions: [...overflow, ...initialSecondaryActions]
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JUb29sYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdQYXJ0cy9ub3RlYm9va0VkaXRvclRvb2xiYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0NoRyxJQUFZLFdBSVg7SUFKRCxXQUFZLFdBQVc7UUFDdEIsaURBQVUsQ0FBQTtRQUNWLCtDQUFTLENBQUE7UUFDVCxtREFBVyxDQUFBO0lBQ1osQ0FBQyxFQUpXLFdBQVcsMkJBQVgsV0FBVyxRQUl0QjtJQUlELFNBQWdCLG9CQUFvQixDQUFDLEtBQThCO1FBQ2xFLFFBQVEsS0FBSyxFQUFFLENBQUM7WUFDZixLQUFLLElBQUk7Z0JBQ1IsT0FBTyxXQUFXLENBQUMsTUFBTSxDQUFDO1lBQzNCLEtBQUssS0FBSztnQkFDVCxPQUFPLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDMUIsS0FBSyxRQUFRO2dCQUNaLE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQztZQUMzQixLQUFLLE9BQU87Z0JBQ1gsT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDO1lBQzFCLEtBQUssU0FBUztnQkFDYixPQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDN0IsQ0FBQztJQUNGLENBQUM7SUFiRCxvREFhQztJQUVELE1BQU0sc0JBQXNCLEdBQUcsRUFBRSxDQUFDO0lBQ2xDLE1BQU0sd0JBQXdCLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQztJQU96QixNQUFNLDRCQUE0QjtRQUNqQyxZQUNVLGNBQXVDLEVBQ3ZDLGFBQTZDLEVBQzdDLG9CQUEyQztZQUYzQyxtQkFBYyxHQUFkLGNBQWMsQ0FBeUI7WUFDdkMsa0JBQWEsR0FBYixhQUFhLENBQWdDO1lBQzdDLHlC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