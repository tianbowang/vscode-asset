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
define(["require", "exports", "vs/nls", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/dnd", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/base/common/types", "vs/base/browser/browser", "vs/base/common/errors", "vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/actions/browser/toolbar", "vs/platform/dnd/browser/dnd", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/platform", "vs/workbench/services/host/browser/host", "vs/platform/instantiation/common/serviceCollection", "vs/css!./media/editortabscontrol"], function (require, exports, nls_1, dnd_1, dom_1, mouseEvent_1, actionbar_1, actions_1, lifecycle_1, menuEntryActionViewItem_1, actions_2, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, quickInput_1, colorRegistry_1, themeService_1, dnd_2, editorPane_1, editor_1, contextkeys_1, types_1, browser_1, errors_1, sideBySideEditorInput_1, toolbar_1, dnd_3, editorResolverService_1, editorCommands_1, platform_1, host_1, serviceCollection_1) {
    "use strict";
    var EditorTabsControl_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorTabsControl = exports.EditorCommandsContextActionRunner = void 0;
    class EditorCommandsContextActionRunner extends actions_1.ActionRunner {
        constructor(context) {
            super();
            this.context = context;
        }
        run(action, context) {
            // Even though we have a fixed context for editor commands,
            // allow to preserve the context that is given to us in case
            // it applies.
            let mergedContext = this.context;
            if (context?.preserveFocus) {
                mergedContext = {
                    ...this.context,
                    preserveFocus: true
                };
            }
            return super.run(action, mergedContext);
        }
    }
    exports.EditorCommandsContextActionRunner = EditorCommandsContextActionRunner;
    let EditorTabsControl = class EditorTabsControl extends themeService_1.Themable {
        static { EditorTabsControl_1 = this; }
        static { this.EDITOR_TAB_HEIGHT = {
            normal: 35,
            compact: 22
        }; }
        constructor(parent, editorPartsView, groupsView, groupView, tabsModel, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, quickInputService, themeService, editorResolverService, hostService) {
            super(themeService);
            this.parent = parent;
            this.editorPartsView = editorPartsView;
            this.groupsView = groupsView;
            this.groupView = groupView;
            this.tabsModel = tabsModel;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.quickInputService = quickInputService;
            this.editorResolverService = editorResolverService;
            this.hostService = hostService;
            this.editorTransfer = dnd_3.LocalSelectionTransfer.getInstance();
            this.groupTransfer = dnd_3.LocalSelectionTransfer.getInstance();
            this.treeItemsTransfer = dnd_3.LocalSelectionTransfer.getInstance();
            this.editorActionsToolbarDisposables = this._register(new lifecycle_1.DisposableStore());
            this.editorActionsDisposables = this._register(new lifecycle_1.DisposableStore());
            this.contextMenuContextKeyService = this._register(this.contextKeyService.createScoped(parent));
            const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.contextMenuContextKeyService]));
            this.resourceContext = this._register(scopedInstantiationService.createInstance(contextkeys_1.ResourceContextKey));
            this.editorPinnedContext = contextkeys_1.ActiveEditorPinnedContext.bindTo(this.contextMenuContextKeyService);
            this.editorIsFirstContext = contextkeys_1.ActiveEditorFirstInGroupContext.bindTo(this.contextMenuContextKeyService);
            this.editorIsLastContext = contextkeys_1.ActiveEditorLastInGroupContext.bindTo(this.contextMenuContextKeyService);
            this.editorStickyContext = contextkeys_1.ActiveEditorStickyContext.bindTo(this.contextMenuContextKeyService);
            this.editorAvailableEditorIds = contextkeys_1.ActiveEditorAvailableEditorIdsContext.bindTo(this.contextMenuContextKeyService);
            this.editorCanSplitInGroupContext = contextkeys_1.ActiveEditorCanSplitInGroupContext.bindTo(this.contextMenuContextKeyService);
            this.sideBySideEditorContext = contextkeys_1.SideBySideEditorActiveContext.bindTo(this.contextMenuContextKeyService);
            this.groupLockedContext = contextkeys_1.ActiveEditorGroupLockedContext.bindTo(this.contextMenuContextKeyService);
            this.renderDropdownAsChildElement = false;
            this.create(parent);
        }
        create(parent) {
            this.updateTabHeight();
        }
        get editorActionsEnabled() {
            return this.groupsView.partOptions.editorActionsLocation === 'default' && this.groupsView.partOptions.showTabs !== 'none';
        }
        createEditorActionsToolBar(parent, classes) {
            this.editorActionsToolbarContainer = document.createElement('div');
            this.editorActionsToolbarContainer.classList.add(...classes);
            parent.appendChild(this.editorActionsToolbarContainer);
            this.handleEditorActionToolBarVisibility(this.editorActionsToolbarContainer);
        }
        handleEditorActionToolBarVisibility(container) {
            const editorActionsEnabled = this.editorActionsEnabled;
            const editorActionsVisible = !!this.editorActionsToolbar;
            // Create toolbar if it is enabled (and not yet created)
            if (editorActionsEnabled && !editorActionsVisible) {
                this.doCreateEditorActionsToolBar(container);
            }
            // Remove toolbar if it is not enabled (and is visible)
            else if (!editorActionsEnabled && editorActionsVisible) {
                this.editorActionsToolbar?.getElement().remove();
                this.editorActionsToolbar = undefined;
                this.editorActionsToolbarDisposables.clear();
                this.editorActionsDisposables.clear();
            }
            container.classList.toggle('hidden', !editorActionsEnabled);
        }
        doCreateEditorActionsToolBar(container) {
            const context = { groupId: this.groupView.id };
            // Toolbar Widget
            this.editorActionsToolbar = this.editorActionsToolbarDisposables.add(this.instantiationService.createInstance(toolbar_1.WorkbenchToolBar, container, {
                actionViewItemProvider: action => this.actionViewItemProvider(action),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                ariaLabel: (0, nls_1.localize)('ariaLabelEditorActions', "Editor actions"),
                getKeyBinding: action => this.getKeybinding(action),
                actionRunner: this.editorActionsToolbarDisposables.add(new EditorCommandsContextActionRunner(context)),
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
                renderDropdownAsChildElement: this.renderDropdownAsChildElement,
                telemetrySource: 'editorPart',
                resetMenu: actions_2.MenuId.EditorTitle,
                overflowBehavior: { maxItems: 9, exempted: editorCommands_1.EDITOR_CORE_NAVIGATION_COMMANDS },
                highlightToggledItems: true
            }));
            // Context
            this.editorActionsToolbar.context = context;
            // Action Run Handling
            this.editorActionsToolbarDisposables.add(this.editorActionsToolbar.actionRunner.onDidRun(e => {
                // Notify for Error
                if (e.error && !(0, errors_1.isCancellationError)(e.error)) {
                    this.notificationService.error(e.error);
                }
            }));
        }
        actionViewItemProvider(action) {
            const activeEditorPane = this.groupView.activeEditorPane;
            // Check Active Editor
            if (activeEditorPane instanceof editorPane_1.EditorPane) {
                const result = activeEditorPane.getActionViewItem(action);
                if (result) {
                    return result;
                }
            }
            // Check extensions
            return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action, { menuAsChild: this.renderDropdownAsChildElement });
        }
        updateEditorActionsToolbar() {
            if (!this.editorActionsEnabled) {
                return;
            }
            this.editorActionsDisposables.clear();
            const editorActions = this.groupView.createEditorActions(this.editorActionsDisposables);
            this.editorActionsDisposables.add(editorActions.onDidChange(() => this.updateEditorActionsToolbar()));
            const editorActionsToolbar = (0, types_1.assertIsDefined)(this.editorActionsToolbar);
            const { primary, secondary } = this.prepareEditorActions(editorActions.actions);
            editorActionsToolbar.setActions((0, actionbar_1.prepareActions)(primary), (0, actionbar_1.prepareActions)(secondary));
        }
        getEditorPaneAwareContextKeyService() {
            return this.groupView.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
        }
        clearEditorActionsToolbar() {
            if (!this.editorActionsEnabled) {
                return;
            }
            const editorActionsToolbar = (0, types_1.assertIsDefined)(this.editorActionsToolbar);
            editorActionsToolbar.setActions([], []);
        }
        onGroupDragStart(e, element) {
            if (e.target !== element) {
                return false; // only if originating from tabs container
            }
            const isNewWindowOperation = this.isNewWindowOperation(e);
            // Set editor group as transfer
            this.groupTransfer.setData([new dnd_2.DraggedEditorGroupIdentifier(this.groupView.id)], dnd_2.DraggedEditorGroupIdentifier.prototype);
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'copyMove';
            }
            // Drag all tabs of the group if tabs are enabled
            let hasDataTransfer = false;
            if (this.groupsView.partOptions.showTabs === 'multiple') {
                hasDataTransfer = this.doFillResourceDataTransfers(this.groupView.getEditors(1 /* EditorsOrder.SEQUENTIAL */), e, isNewWindowOperation);
            }
            // Otherwise only drag the active editor
            else {
                if (this.groupView.activeEditor) {
                    hasDataTransfer = this.doFillResourceDataTransfers([this.groupView.activeEditor], e, isNewWindowOperation);
                }
            }
            // Firefox: requires to set a text data transfer to get going
            if (!hasDataTransfer && browser_1.isFirefox) {
                e.dataTransfer?.setData(dnd_1.DataTransfers.TEXT, String(this.groupView.label));
            }
            // Drag Image
            if (this.groupView.activeEditor) {
                let label = this.groupView.activeEditor.getName();
                if (this.groupsView.partOptions.showTabs === 'multiple' && this.groupView.count > 1) {
                    label = (0, nls_1.localize)('draggedEditorGroup', "{0} (+{1})", label, this.groupView.count - 1);
                }
                (0, dnd_1.applyDragImage)(e, label, 'monaco-editor-group-drag-image', this.getColor(colorRegistry_1.listActiveSelectionBackground), this.getColor(colorRegistry_1.listActiveSelectionForeground));
            }
            return isNewWindowOperation;
        }
        async onGroupDragEnd(e, previousDragEvent, element, isNewWindowOperation) {
            this.groupTransfer.clearData(dnd_2.DraggedEditorGroupIdentifier.prototype);
            if (e.target !== element ||
                !isNewWindowOperation ||
                (0, dnd_2.isWindowDraggedOver)()) {
                return; // drag to open in new window is disabled
            }
            const auxiliaryEditorPart = await this.maybeCreateAuxiliaryEditorPartAt(e, element);
            if (!auxiliaryEditorPart) {
                return;
            }
            const targetGroup = auxiliaryEditorPart.activeGroup;
            this.groupsView.mergeGroup(this.groupView, targetGroup.id, {
                mode: this.isMoveOperation(previousDragEvent ?? e, targetGroup.id) ? 1 /* MergeGroupMode.MOVE_EDITORS */ : 0 /* MergeGroupMode.COPY_EDITORS */
            });
            targetGroup.focus();
        }
        async maybeCreateAuxiliaryEditorPartAt(e, offsetElement) {
            const { point, display } = await this.hostService.getCursorScreenPoint() ?? { point: { x: e.screenX, y: e.screenY } };
            const window = (0, dom_1.getActiveWindow)();
            if (window.document.visibilityState === 'visible' && window.document.hasFocus()) {
                if (point.x >= window.screenX && point.x <= window.screenX + window.outerWidth && point.y >= window.screenY && point.y <= window.screenY + window.outerHeight) {
                    return; // refuse to create as long as the mouse was released over active focused window to reduce chance of opening by accident
                }
            }
            const offsetX = offsetElement.offsetWidth / 2;
            const offsetY = 30 /* take title bar height into account (approximation) */ + offsetElement.offsetHeight / 2;
            const bounds = {
                x: point.x - offsetX,
                y: point.y - offsetY
            };
            if (display) {
                if (bounds.x < display.x) {
                    bounds.x = display.x; // prevent overflow to the left
                }
                if (bounds.y < display.y) {
                    bounds.y = display.y; // prevent overflow to the top
                }
            }
            return this.editorPartsView.createAuxiliaryEditorPart({ bounds });
        }
        isNewWindowOperation(e) {
            if (this.groupsView.partOptions.dragToOpenWindow) {
                return !e.altKey;
            }
            return e.altKey;
        }
        isMoveOperation(e, sourceGroup, sourceEditor) {
            if (sourceEditor?.hasCapability(8 /* EditorInputCapabilities.Singleton */)) {
                return true; // Singleton editors cannot be split
            }
            const isCopy = (e.ctrlKey && !platform_1.isMacintosh) || (e.altKey && platform_1.isMacintosh);
            return (!isCopy || sourceGroup === this.groupView.id);
        }
        doFillResourceDataTransfers(editors, e, disableStandardTransfer) {
            if (editors.length) {
                this.instantiationService.invokeFunction(dnd_2.fillEditorsDragData, editors.map(editor => ({ editor, groupId: this.groupView.id })), e, { disableStandardTransfer });
                return true;
            }
            return false;
        }
        onTabContextMenu(editor, e, node) {
            // Update contexts based on editor picked and remember previous to restore
            this.resourceContext.set(editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY } ?? null));
            this.editorPinnedContext.set(this.tabsModel.isPinned(editor));
            this.editorIsFirstContext.set(this.tabsModel.isFirst(editor));
            this.editorIsLastContext.set(this.tabsModel.isLast(editor));
            this.editorStickyContext.set(this.tabsModel.isSticky(editor));
            this.groupLockedContext.set(this.tabsModel.isLocked);
            this.editorCanSplitInGroupContext.set(editor.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */));
            this.sideBySideEditorContext.set(editor.typeId === sideBySideEditorInput_1.SideBySideEditorInput.ID);
            (0, contextkeys_1.applyAvailableEditorIds)(this.editorAvailableEditorIds, editor, this.editorResolverService);
            // Find target anchor
            let anchor = node;
            if ((0, dom_1.isMouseEvent)(e)) {
                anchor = new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(node), e);
            }
            // Show it
            this.contextMenuService.showContextMenu({
                getAnchor: () => anchor,
                menuId: actions_2.MenuId.EditorTitleContext,
                menuActionOptions: { shouldForwardArgs: true, arg: this.resourceContext.get() },
                contextKeyService: this.contextMenuContextKeyService,
                getActionsContext: () => ({ groupId: this.groupView.id, editorIndex: this.groupView.getIndexOfEditor(editor) }),
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id, this.contextMenuContextKeyService),
                onHide: () => this.groupsView.activeGroup.focus() // restore focus to active group
            });
        }
        getKeybinding(action) {
            return this.keybindingService.lookupKeybinding(action.id, this.getEditorPaneAwareContextKeyService());
        }
        getKeybindingLabel(action) {
            const keybinding = this.getKeybinding(action);
            return keybinding ? keybinding.getLabel() ?? undefined : undefined;
        }
        get tabHeight() {
            return this.groupsView.partOptions.tabHeight !== 'compact' ? EditorTabsControl_1.EDITOR_TAB_HEIGHT.normal : EditorTabsControl_1.EDITOR_TAB_HEIGHT.compact;
        }
        updateTabHeight() {
            this.parent.style.setProperty('--editor-group-tab-height', `${this.tabHeight}px`);
        }
        updateOptions(oldOptions, newOptions) {
            // Update tab height
            if (oldOptions.tabHeight !== newOptions.tabHeight) {
                this.updateTabHeight();
            }
            // Update Editor Actions Toolbar
            if (oldOptions.editorActionsLocation !== newOptions.editorActionsLocation ||
                oldOptions.showTabs !== newOptions.showTabs) {
                if (this.editorActionsToolbarContainer) {
                    this.handleEditorActionToolBarVisibility(this.editorActionsToolbarContainer);
                    this.updateEditorActionsToolbar();
                }
            }
        }
    };
    exports.EditorTabsControl = EditorTabsControl;
    exports.EditorTabsControl = EditorTabsControl = EditorTabsControl_1 = __decorate([
        __param(5, contextView_1.IContextMenuService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, notification_1.INotificationService),
        __param(10, quickInput_1.IQuickInputService),
        __param(11, themeService_1.IThemeService),
        __param(12, editorResolverService_1.IEditorResolverService),
        __param(13, host_1.IHostService)
    ], EditorTabsControl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yVGFic0NvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3JUYWJzQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNENoRyxNQUFhLGlDQUFrQyxTQUFRLHNCQUFZO1FBRWxFLFlBQ1MsT0FBK0I7WUFFdkMsS0FBSyxFQUFFLENBQUM7WUFGQSxZQUFPLEdBQVAsT0FBTyxDQUF3QjtRQUd4QyxDQUFDO1FBRVEsR0FBRyxDQUFDLE1BQWUsRUFBRSxPQUFxQztZQUVsRSwyREFBMkQ7WUFDM0QsNERBQTREO1lBQzVELGNBQWM7WUFFZCxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ2pDLElBQUksT0FBTyxFQUFFLGFBQWEsRUFBRSxDQUFDO2dCQUM1QixhQUFhLEdBQUc7b0JBQ2YsR0FBRyxJQUFJLENBQUMsT0FBTztvQkFDZixhQUFhLEVBQUUsSUFBSTtpQkFDbkIsQ0FBQztZQUNILENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7S0FDRDtJQXhCRCw4RUF3QkM7SUFvQk0sSUFBZSxpQkFBaUIsR0FBaEMsTUFBZSxpQkFBa0IsU0FBUSx1QkFBUTs7aUJBTS9CLHNCQUFpQixHQUFHO1lBQzNDLE1BQU0sRUFBRSxFQUFXO1lBQ25CLE9BQU8sRUFBRSxFQUFXO1NBQ3BCLEFBSHdDLENBR3ZDO1FBdUJGLFlBQ29CLE1BQW1CLEVBQ25CLGVBQWlDLEVBQ2pDLFVBQTZCLEVBQzdCLFNBQTJCLEVBQzNCLFNBQW9DLEVBQ2xDLGtCQUEwRCxFQUN4RCxvQkFBcUQsRUFDeEQsaUJBQXdELEVBQ3hELGlCQUFzRCxFQUNwRCxtQkFBMEQsRUFD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