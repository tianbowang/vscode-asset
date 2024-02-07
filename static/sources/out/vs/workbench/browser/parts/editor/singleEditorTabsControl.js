/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/editorTabsControl", "vs/workbench/browser/labels", "vs/workbench/common/theme", "vs/base/browser/touch", "vs/base/browser/dom", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/color", "vs/base/common/types", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/platform/theme/browser/defaultStyles", "vs/workbench/browser/parts/editor/breadcrumbsControl", "vs/css!./media/singleeditortabscontrol"], function (require, exports, editor_1, editorTabsControl_1, labels_1, theme_1, touch_1, dom_1, editorCommands_1, color_1, types_1, objects_1, lifecycle_1, defaultStyles_1, breadcrumbsControl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SingleEditorTabsControl = void 0;
    class SingleEditorTabsControl extends editorTabsControl_1.EditorTabsControl {
        constructor() {
            super(...arguments);
            this.activeLabel = Object.create(null);
        }
        get breadcrumbsControl() { return this.breadcrumbsControlFactory?.control; }
        create(parent) {
            super.create(parent);
            const titleContainer = this.titleContainer = parent;
            titleContainer.draggable = true;
            // Container listeners
            this.registerContainerListeners(titleContainer);
            // Gesture Support
            this._register(touch_1.Gesture.addTarget(titleContainer));
            const labelContainer = document.createElement('div');
            labelContainer.classList.add('label-container');
            titleContainer.appendChild(labelContainer);
            // Editor Label
            this.editorLabel = this._register(this.instantiationService.createInstance(labels_1.ResourceLabel, labelContainer, undefined)).element;
            this._register((0, dom_1.addDisposableListener)(this.editorLabel.element, dom_1.EventType.CLICK, e => this.onTitleLabelClick(e)));
            // Breadcrumbs
            this.breadcrumbsControlFactory = this._register(this.instantiationService.createInstance(breadcrumbsControl_1.BreadcrumbsControlFactory, labelContainer, this.groupView, {
                showFileIcons: false,
                showSymbolIcons: true,
                showDecorationColors: false,
                widgetStyles: { ...defaultStyles_1.defaultBreadcrumbsWidgetStyles, breadcrumbsBackground: color_1.Color.transparent.toString() },
                showPlaceholder: false
            }));
            this._register(this.breadcrumbsControlFactory.onDidEnablementChange(() => this.handleBreadcrumbsEnablementChange()));
            titleContainer.classList.toggle('breadcrumbs', Boolean(this.breadcrumbsControl));
            this._register((0, lifecycle_1.toDisposable)(() => titleContainer.classList.remove('breadcrumbs'))); // important to remove because the container is a shared dom node
            // Create editor actions toolbar
            this.createEditorActionsToolBar(titleContainer, ['title-actions']);
        }
        registerContainerListeners(titleContainer) {
            // Drag & Drop support
            let lastDragEvent = undefined;
            let isNewWindowOperation = false;
            this._register(new dom_1.DragAndDropObserver(titleContainer, {
                onDragStart: e => { isNewWindowOperation = this.onGroupDragStart(e, titleContainer); },
                onDrag: e => { lastDragEvent = e; },
                onDragEnd: e => { this.onGroupDragEnd(e, lastDragEvent, titleContainer, isNewWindowOperation); },
            }));
            // Pin on double click
            this._register((0, dom_1.addDisposableListener)(titleContainer, dom_1.EventType.DBLCLICK, e => this.onTitleDoubleClick(e)));
            // Detect mouse click
            this._register((0, dom_1.addDisposableListener)(titleContainer, dom_1.EventType.AUXCLICK, e => this.onTitleAuxClick(e)));
            // Detect touch
            this._register((0, dom_1.addDisposableListener)(titleContainer, touch_1.EventType.Tap, (e) => this.onTitleTap(e)));
            // Context Menu
            for (const event of [dom_1.EventType.CONTEXT_MENU, touch_1.EventType.Contextmenu]) {
                this._register((0, dom_1.addDisposableListener)(titleContainer, event, e => {
                    if (this.tabsModel.activeEditor) {
                        this.onTabContextMenu(this.tabsModel.activeEditor, e, titleContainer);
                    }
                }));
            }
        }
        onTitleLabelClick(e) {
            dom_1.EventHelper.stop(e, false);
            // delayed to let the onTitleClick() come first which can cause a focus change which can close quick access
            setTimeout(() => this.quickInputService.quickAccess.show());
        }
        onTitleDoubleClick(e) {
            dom_1.EventHelper.stop(e);
            this.groupView.pinEditor();
        }
        onTitleAuxClick(e) {
            if (e.button === 1 /* Middle Button */ && this.tabsModel.activeEditor) {
                dom_1.EventHelper.stop(e, true /* for https://github.com/microsoft/vscode/issues/56715 */);
                if (!(0, editor_1.preventEditorClose)(this.tabsModel, this.tabsModel.activeEditor, editor_1.EditorCloseMethod.MOUSE, this.groupsView.partOptions)) {
                    this.groupView.closeEditor(this.tabsModel.activeEditor);
                }
            }
        }
        onTitleTap(e) {
            // We only want to open the quick access picker when
            // the tap occurred over the editor label, so we need
            // to check on the target
            // (https://github.com/microsoft/vscode/issues/107543)
            const target = e.initialTarget;
            if (!(target instanceof HTMLElement) || !this.editorLabel || !(0, dom_1.isAncestor)(target, this.editorLabel.element)) {
                return;
            }
            // TODO@rebornix gesture tap should open the quick access
            // editorGroupView will focus on the editor again when there
            // are mouse/pointer/touch down events we need to wait a bit as
            // `GesureEvent.Tap` is generated from `touchstart` and then
            // `touchend` events, which are not an atom event.
            setTimeout(() => this.quickInputService.quickAccess.show(), 50);
        }
        openEditor(editor) {
            return this.doHandleOpenEditor();
        }
        openEditors(editors) {
            return this.doHandleOpenEditor();
        }
        doHandleOpenEditor() {
            const activeEditorChanged = this.ifActiveEditorChanged(() => this.redraw());
            if (!activeEditorChanged) {
                this.ifActiveEditorPropertiesChanged(() => this.redraw());
            }
            return activeEditorChanged;
        }
        beforeCloseEditor(editor) {
            // Nothing to do before closing an editor
        }
        closeEditor(editor) {
            this.ifActiveEditorChanged(() => this.redraw());
        }
        closeEditors(editors) {
            this.ifActiveEditorChanged(() => this.redraw());
        }
        moveEditor(editor, fromIndex, targetIndex) {
            this.ifActiveEditorChanged(() => this.redraw());
        }
        pinEditor(editor) {
            this.ifEditorIsActive(editor, () => this.redraw());
        }
        stickEditor(editor) {
            // Sticky editors are not presented any different with tabs disabled
        }
        unstickEditor(editor) {
            // Sticky editors are not presented any different with tabs disabled
        }
        setActive(isActive) {
            this.redraw();
        }
        updateEditorLabel(editor) {
            this.ifEditorIsActive(editor, () => this.redraw());
        }
        updateEditorDirty(editor) {
            this.ifEditorIsActive(editor, () => {
                const titleContainer = (0, types_1.assertIsDefined)(this.titleContainer);
                // Signal dirty (unless saving)
                if (editor.isDirty() && !editor.isSaving()) {
                    titleContainer.classList.add('dirty');
                }
                // Otherwise, clear dirty
                else {
                    titleContainer.classList.remove('dirty');
                }
            });
        }
        updateOptions(oldOptions, newOptions) {
            super.updateOptions(oldOptions, newOptions);
            if (oldOptions.labelFormat !== newOptions.labelFormat || !(0, objects_1.equals)(oldOptions.decorations, newOptions.decorations)) {
                this.redraw();
            }
        }
        updateStyles() {
            this.redraw();
        }
        handleBreadcrumbsEnablementChange() {
            const titleContainer = (0, types_1.assertIsDefined)(this.titleContainer);
            titleContainer.classList.toggle('breadcrumbs', Boolean(this.breadcrumbsControl));
            this.redraw();
        }
        ifActiveEditorChanged(fn) {
            if (!this.activeLabel.editor && this.tabsModel.activeEditor || // active editor changed from null => editor
                this.activeLabel.editor && !this.tabsModel.activeEditor || // active editor changed from editor => null
                (!this.activeLabel.editor || !this.tabsModel.isActive(this.activeLabel.editor)) // active editor changed from editorA => editorB
            ) {
                fn();
                return true;
            }
            return false;
        }
        ifActiveEditorPropertiesChanged(fn) {
            if (!this.activeLabel.editor || !this.tabsModel.activeEditor) {
                return; // need an active editor to check for properties changed
            }
            if (this.activeLabel.pinned !== this.tabsModel.isPinned(this.tabsModel.activeEditor)) {
                fn(); // only run if pinned state has changed
            }
        }
        ifEditorIsActive(editor, fn) {
            if (this.tabsModel.isActive(editor)) {
                fn(); // only run if editor is current active
            }
        }
        redraw() {
            const editor = this.tabsModel.activeEditor ?? undefined;
            const options = this.groupsView.partOptions;
            const isEditorPinned = editor ? this.tabsModel.isPinned(editor) : false;
            const isGroupActive = this.groupsView.activeGroup === this.groupView;
            this.activeLabel = { editor, pinned: isEditorPinned };
            // Update Breadcrumbs
            if (this.breadcrumbsControl) {
                if (isGroupActive) {
                    this.breadcrumbsControl.update();
                    this.breadcrumbsControl.domNode.classList.toggle('preview', !isEditorPinned);
                }
                else {
                    this.breadcrumbsControl.hide();
                }
            }
            // Clear if there is no editor
            const [titleContainer, editorLabel] = (0, types_1.assertAllDefined)(this.titleContainer, this.editorLabel);
            if (!editor) {
                titleContainer.classList.remove('dirty');
                editorLabel.clear();
                this.clearEditorActionsToolbar();
            }
            // Otherwise render it
            else {
                // Dirty state
                this.updateEditorDirty(editor);
                // Editor Label
                const { labelFormat } = this.groupsView.partOptions;
                let description;
                if (this.breadcrumbsControl && !this.breadcrumbsControl.isHidden()) {
                    description = ''; // hide description when showing breadcrumbs
                }
                else if (labelFormat === 'default' && !isGroupActive) {
                    description = ''; // hide description when group is not active and style is 'default'
                }
                else {
                    description = editor.getDescription(this.getVerbosity(labelFormat)) || '';
                }
                let title = editor.getTitle(2 /* Verbosity.LONG */);
                if (description === title) {
                    title = ''; // dont repeat what is already shown
                }
                editorLabel.setResource({
                    resource: editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH }),
                    name: editor.getName(),
                    description
                }, {
                    title,
                    italic: !isEditorPinned,
                    extraClasses: ['single-tab', 'title-label'].concat(editor.getLabelExtraClasses()),
                    fileDecorations: {
                        colors: Boolean(options.decorations?.colors),
                        badges: Boolean(options.decorations?.badges)
                    },
                    icon: editor.getIcon(),
                    hideIcon: options.showIcons === false,
                });
                if (isGroupActive) {
                    titleContainer.style.color = this.getColor(theme_1.TAB_ACTIVE_FOREGROUND) || '';
                }
                else {
                    titleContainer.style.color = this.getColor(theme_1.TAB_UNFOCUSED_ACTIVE_FOREGROUND) || '';
                }
                // Update Editor Actions Toolbar
                this.updateEditorActionsToolbar();
            }
        }
        getVerbosity(style) {
            switch (style) {
                case 'short': return 0 /* Verbosity.SHORT */;
                case 'long': return 2 /* Verbosity.LONG */;
                default: return 1 /* Verbosity.MEDIUM */;
            }
        }
        prepareEditorActions(editorActions) {
            const isGroupActive = this.groupsView.activeGroup === this.groupView;
            // Active: allow all actions
            if (isGroupActive) {
                return editorActions;
            }
            // Inactive: only show "Close, "Unlock" and secondary actions
            else {
                return {
                    primary: editorActions.primary.filter(action => action.id === editorCommands_1.CLOSE_EDITOR_COMMAND_ID || action.id === editorCommands_1.UNLOCK_GROUP_COMMAND_ID),
                    secondary: editorActions.secondary
                };
            }
        }
        getHeight() {
            return this.tabHeight;
        }
        layout(dimensions) {
            this.breadcrumbsControl?.layout(undefined);
            return new dom_1.Dimension(dimensions.container.width, this.getHeight());
        }
    }
    exports.SingleEditorTabsControl = SingleEditorTabsControl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlRWRpdG9yVGFic0NvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9zaW5nbGVFZGl0b3JUYWJzQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3QmhHLE1BQWEsdUJBQXdCLFNBQVEscUNBQWlCO1FBQTlEOztZQUlTLGdCQUFXLEdBQXlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUF3VmpFLENBQUM7UUFyVkEsSUFBWSxrQkFBa0IsS0FBSyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRWpFLE1BQU0sQ0FBQyxNQUFtQjtZQUM1QyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXJCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO1lBQ3BELGNBQWMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBRWhDLHNCQUFzQjtZQUN0QixJQUFJLENBQUMsMEJBQTBCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFaEQsa0JBQWtCO1lBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBRWxELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckQsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoRCxjQUFjLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRTNDLGVBQWU7WUFDZixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFv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