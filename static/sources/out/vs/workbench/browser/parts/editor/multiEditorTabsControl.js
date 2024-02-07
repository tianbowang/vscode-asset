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
define(["require", "exports", "vs/base/common/platform", "vs/base/common/labels", "vs/workbench/common/editor", "vs/workbench/browser/editor", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/workbench/browser/labels", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/browser/parts/editor/editorTabsControl", "vs/platform/quickinput/common/quickInput", "vs/base/common/lifecycle", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/map", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/dnd", "vs/platform/notification/common/notification", "vs/base/browser/dom", "vs/nls", "vs/workbench/browser/parts/editor/editorActions", "vs/base/common/types", "vs/workbench/services/editor/common/editorService", "vs/base/common/resources", "vs/base/common/async", "vs/workbench/services/path/common/pathService", "vs/base/common/path", "vs/base/common/arrays", "vs/platform/theme/common/theme", "vs/base/browser/browser", "vs/base/common/objects", "vs/platform/editor/common/editor", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/browser/mouseEvent", "vs/editor/common/services/treeViewsDndService", "vs/editor/common/services/treeViewsDnd", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/common/editor/filteredEditorGroupModel", "vs/workbench/services/host/browser/host", "vs/css!./media/multieditortabscontrol"], function (require, exports, platform_1, labels_1, editor_1, editor_2, keyboardEvent_1, touch_1, labels_2, actionbar_1, contextView_1, instantiation_1, keybinding_1, contextkey_1, actions_1, editorTabsControl_1, quickInput_1, lifecycle_1, scrollableElement_1, map_1, themeService_1, theme_1, colorRegistry_1, dnd_1, notification_1, dom_1, nls_1, editorActions_1, types_1, editorService_1, resources_1, async_1, pathService_1, path_1, arrays_1, theme_2, browser_1, objects_1, editor_3, editorCommands_1, mouseEvent_1, treeViewsDndService_1, treeViewsDnd_1, editorResolverService_1, filteredEditorGroupModel_1, host_1) {
    "use strict";
    var MultiEditorTabsControl_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MultiEditorTabsControl = void 0;
    let MultiEditorTabsControl = class MultiEditorTabsControl extends editorTabsControl_1.EditorTabsControl {
        static { MultiEditorTabsControl_1 = this; }
        static { this.SCROLLBAR_SIZES = {
            default: 3,
            large: 10
        }; }
        static { this.TAB_WIDTH = {
            compact: 38,
            shrink: 80,
            fit: 120
        }; }
        static { this.DRAG_OVER_OPEN_TAB_THRESHOLD = 1500; }
        static { this.MOUSE_WHEEL_EVENT_THRESHOLD = 150; }
        static { this.MOUSE_WHEEL_DISTANCE_THRESHOLD = 1.5; }
        constructor(parent, editorPartsView, groupsView, groupView, tabsModel, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, quickInputService, themeService, editorService, pathService, treeViewsDragAndDropService, editorResolverService, hostService) {
            super(parent, editorPartsView, groupsView, groupView, tabsModel, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, quickInputService, themeService, editorResolverService, hostService);
            this.editorService = editorService;
            this.pathService = pathService;
            this.treeViewsDragAndDropService = treeViewsDragAndDropService;
            this.closeEditorAction = this._register(this.instantiationService.createInstance(editorActions_1.CloseOneEditorAction, editorActions_1.CloseOneEditorAction.ID, editorActions_1.CloseOneEditorAction.LABEL));
            this.unpinEditorAction = this._register(this.instantiationService.createInstance(editorActions_1.UnpinEditorAction, editorActions_1.UnpinEditorAction.ID, editorActions_1.UnpinEditorAction.LABEL));
            this.tabResourceLabels = this._register(this.instantiationService.createInstance(labels_2.ResourceLabels, labels_2.DEFAULT_LABELS_CONTAINER));
            this.tabLabels = [];
            this.tabActionBars = [];
            this.tabDisposables = [];
            this.dimensions = {
                container: dom_1.Dimension.None,
                available: dom_1.Dimension.None
            };
            this.layoutScheduler = this._register(new lifecycle_1.MutableDisposable());
            this.path = platform_1.isWindows ? path_1.win32 : path_1.posix;
            this.lastMouseWheelEventTime = 0;
            this.isMouseOverTabs = false;
            this.updateEditorLabelScheduler = this._register(new async_1.RunOnceScheduler(() => this.doUpdateEditorLabels(), 0));
            // Resolve the correct path library for the OS we are on
            // If we are connected to remote, this accounts for the
            // remote OS.
            (async () => this.path = await this.pathService.path)();
            // React to decorations changing for our resource labels
            this._register(this.tabResourceLabels.onDidChangeDecorations(() => this.doHandleDecorationsChange()));
        }
        create(parent) {
            super.create(parent);
            this.titleContainer = parent;
            // Tabs and Actions Container (are on a single row with flex side-by-side)
            this.tabsAndActionsContainer = document.createElement('div');
            this.tabsAndActionsContainer.classList.add('tabs-and-actions-container');
            this.titleContainer.appendChild(this.tabsAndActionsContainer);
            // Tabs Container
            this.tabsContainer = document.createElement('div');
            this.tabsContainer.setAttribute('role', 'tablist');
            this.tabsContainer.draggable = true;
            this.tabsContainer.classList.add('tabs-container');
            this._register(touch_1.Gesture.addTarget(this.tabsContainer));
            this.tabSizingFixedDisposables = this._register(new lifecycle_1.DisposableStore());
            this.updateTabSizing(false);
            // Tabs Scrollbar
            this.tabsScrollbar = this.createTabsScrollbar(this.tabsContainer);
            this.tabsAndActionsContainer.appendChild(this.tabsScrollbar.getDomNode());
            // Tabs Container listeners
            this.registerTabsContainerListeners(this.tabsContainer, this.tabsScrollbar);
            // Create Editor Toolbar
            this.createEditorActionsToolBar(this.tabsAndActionsContainer, ['editor-actions']);
            // Set tabs control visibility
            this.updateTabsControlVisibility();
        }
        createTabsScrollbar(scrollable) {
            const tabsScrollbar = this._register(new scrollableElement_1.ScrollableElement(scrollable, {
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                horizontalScrollbarSize: this.getTabsScrollbarSizing(),
                vertical: 2 /* ScrollbarVisibility.Hidden */,
                scrollYToX: true,
                useShadows: false
            }));
            this._register(tabsScrollbar.onScroll(e => {
                if (e.scrollLeftChanged) {
                    scrollable.scrollLeft = e.scrollLeft;
                }
            }));
            return tabsScrollbar;
        }
        updateTabsScrollbarSizing() {
            this.tabsScrollbar?.updateOptions({
                horizontalScrollbarSize: this.getTabsScrollbarSizing()
            });
        }
        updateTabSizing(fromEvent) {
            const [tabsContainer, tabSizingFixedDisposables] = (0, types_1.assertAllDefined)(this.tabsContainer, this.tabSizingFixedDisposables);
            tabSizingFixedDisposables.clear();
            const options = this.groupsView.partOptions;
            if (options.tabSizing === 'fixed') {
                tabsContainer.style.setProperty('--tab-sizing-fixed-min-width', `${options.tabSizingFixedMinWidth}px`);
                tabsContainer.style.setProperty('--tab-sizing-fixed-max-width', `${options.tabSizingFixedMaxWidth}px`);
                // For https://github.com/microsoft/vscode/issues/40290 we want to
                // preserve the current tab widths as long as the mouse is over the
                // tabs so that you can quickly close them via mouse click. For that
                // we track mouse movements over the tabs container.
                tabSizingFixedDisposables.add((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.MOUSE_ENTER, () => {
                    this.isMouseOverTabs = true;
                }));
                tabSizingFixedDisposables.add((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.MOUSE_LEAVE, () => {
                    this.isMouseOverTabs = false;
                    this.updateTabsFixedWidth(false);
                }));
            }
            else if (fromEvent) {
                tabsContainer.style.removeProperty('--tab-sizing-fixed-min-width');
                tabsContainer.style.removeProperty('--tab-sizing-fixed-max-width');
                this.updateTabsFixedWidth(false);
            }
        }
        updateTabsFixedWidth(fixed) {
            this.forEachTab((editor, tabIndex, tabContainer) => {
                if (fixed) {
                    const { width } = tabContainer.getBoundingClientRect();
                    tabContainer.style.setProperty('--tab-sizing-current-width', `${width}px`);
                }
                else {
                    tabContainer.style.removeProperty('--tab-sizing-current-width');
                }
            });
        }
        getTabsScrollbarSizing() {
            if (this.groupsView.partOptions.titleScrollbarSizing !== 'large') {
                return MultiEditorTabsControl_1.SCROLLBAR_SIZES.default;
            }
            return MultiEditorTabsControl_1.SCROLLBAR_SIZES.large;
        }
        registerTabsContainerListeners(tabsContainer, tabsScrollbar) {
            // Forward scrolling inside the container to our custom scrollbar
            this._register((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.SCROLL, () => {
                if (tabsContainer.classList.contains('scroll')) {
                    tabsScrollbar.setScrollPosition({
                        scrollLeft: tabsContainer.scrollLeft // during DND the container gets scrolled so we need to update the custom scrollbar
                    });
                }
            }));
            // New file when double-clicking on tabs container (but not tabs)
            for (const eventType of [touch_1.EventType.Tap, dom_1.EventType.DBLCLICK]) {
                this._register((0, dom_1.addDisposableListener)(tabsContainer, eventType, (e) => {
                    if (eventType === dom_1.EventType.DBLCLICK) {
                        if (e.target !== tabsContainer) {
                            return; // ignore if target is not tabs container
                        }
                    }
                    else {
                        if (e.tapCount !== 2) {
                            return; // ignore single taps
                        }
                        if (e.initialTarget !== tabsContainer) {
                            return; // ignore if target is not tabs container
                        }
                    }
                    dom_1.EventHelper.stop(e);
                    this.editorService.openEditor({
                        resource: undefined,
                        options: {
                            pinned: true,
                            index: this.groupView.count, // always at the end
                            override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id
                        }
                    }, this.groupView.id);
                }));
            }
            // Prevent auto-scrolling (https://github.com/microsoft/vscode/issues/16690)
            this._register((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.MOUSE_DOWN, e => {
                if (e.button === 1) {
                    e.preventDefault();
                }
            }));
            // Drag & Drop support
            let lastDragEvent = undefined;
            let isNewWindowOperation = false;
            this._register(new dom_1.DragAndDropObserver(tabsContainer, {
                onDragStart: e => {
                    isNewWindowOperation = this.onGroupDragStart(e, tabsContainer);
                },
                onDrag: e => {
                    lastDragEvent = e;
                },
                onDragEnter: e => {
                    // Always enable support to scroll while dragging
                    tabsContainer.classList.add('scroll');
                    // Return if the target is not on the tabs container
                    if (e.target !== tabsContainer) {
                        this.updateDropFeedback(tabsContainer, false); // fixes https://github.com/microsoft/vscode/issues/52093
                        return;
                    }
                    // Return if transfer is unsupported
                    if (!this.isSupportedDropTransfer(e)) {
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'none';
                        }
                        return;
                    }
                    // Return if dragged editor is last tab because then this is a no-op
                    let isLocalDragAndDrop = false;
                    if (this.editorTransfer.hasData(dnd_1.DraggedEditorIdentifier.prototype)) {
                        isLocalDragAndDrop = true;
                        const data = this.editorTransfer.getData(dnd_1.DraggedEditorIdentifier.prototype);
                        if (Array.isArray(data)) {
                            const localDraggedEditor = data[0].identifier;
                            if (this.groupView.id === localDraggedEditor.groupId && this.tabsModel.isLast(localDraggedEditor.editor)) {
                                if (e.dataTransfer) {
                                    e.dataTransfer.dropEffect = 'none';
                                }
                                return;
                            }
                        }
                    }
                    // Update the dropEffect to "copy" if there is no local data to be dragged because
                    // in that case we can only copy the data into and not move it from its source
                    if (!isLocalDragAndDrop) {
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'copy';
                        }
                    }
                    this.updateDropFeedback(tabsContainer, true);
                },
                onDragLeave: e => {
                    this.updateDropFeedback(tabsContainer, false);
                    tabsContainer.classList.remove('scroll');
                },
                onDragEnd: e => {
                    this.updateDropFeedback(tabsContainer, false);
                    tabsContainer.classList.remove('scroll');
                    this.onGroupDragEnd(e, lastDragEvent, tabsContainer, isNewWindowOperation);
                },
                onDrop: e => {
                    this.updateDropFeedback(tabsContainer, false);
                    tabsContainer.classList.remove('scroll');
                    if (e.target === tabsContainer) {
                        const isGroupTransfer = this.groupTransfer.hasData(dnd_1.DraggedEditorGroupIdentifier.prototype);
                        this.onDrop(e, isGroupTransfer ? this.groupView.count : this.tabsModel.count, tabsContainer);
                    }
                }
            }));
            // Mouse-wheel support to switch to tabs optionally
            this._register((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.MOUSE_WHEEL, (e) => {
                const activeEditor = this.groupView.activeEditor;
                if (!activeEditor || this.groupView.count < 2) {
                    return; // need at least 2 open editors
                }
                // Shift-key enables or disables this behaviour depending on the setting
                if (this.groupsView.partOptions.scrollToSwitchTabs === true) {
                    if (e.shiftKey) {
                        return; // 'on': only enable this when Shift-key is not pressed
                    }
                }
                else {
                    if (!e.shiftKey) {
                        return; // 'off': only enable this when Shift-key is pressed
                    }
                }
                // Ignore event if the last one happened too recently (https://github.com/microsoft/vscode/issues/96409)
                // The restriction is relaxed according to the absolute value of `deltaX` and `deltaY`
                // to support discrete (mouse wheel) and contiguous scrolling (touchpad) equally well
                const now = Date.now();
                if (now - this.lastMouseWheelEventTime < MultiEditorTabsControl_1.MOUSE_WHEEL_EVENT_THRESHOLD - 2 * (Math.abs(e.deltaX) + Math.abs(e.deltaY))) {
                    return;
                }
                this.lastMouseWheelEventTime = now;
                // Figure out scrolling direction but ignore it if too subtle
                let tabSwitchDirection;
                if (e.deltaX + e.deltaY < -MultiEditorTabsControl_1.MOUSE_WHEEL_DISTANCE_THRESHOLD) {
                    tabSwitchDirection = -1;
                }
                else if (e.deltaX + e.deltaY > MultiEditorTabsControl_1.MOUSE_WHEEL_DISTANCE_THRESHOLD) {
                    tabSwitchDirection = 1;
                }
                else {
                    return;
                }
                const nextEditor = this.groupView.getEditorByIndex(this.groupView.getIndexOfEditor(activeEditor) + tabSwitchDirection);
                if (!nextEditor) {
                    return;
                }
                // Open it
                this.groupView.openEditor(nextEditor);
                // Disable normal scrolling, opening the editor will already reveal it properly
                dom_1.EventHelper.stop(e, true);
            }));
            // Context menu
            const showContextMenu = (e) => {
                dom_1.EventHelper.stop(e);
                // Find target anchor
                let anchor = tabsContainer;
                if ((0, dom_1.isMouseEvent)(e)) {
                    anchor = new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(this.parent), e);
                }
                // Show it
                this.contextMenuService.showContextMenu({
                    getAnchor: () => anchor,
                    menuId: actions_1.MenuId.EditorTabsBarContext,
                    contextKeyService: this.contextKeyService,
                    menuActionOptions: { shouldForwardArgs: true },
                    getActionsContext: () => ({ groupId: this.groupView.id }),
                    getKeyBinding: action => this.getKeybinding(action),
                    onHide: () => this.groupView.focus()
                });
            };
            this._register((0, dom_1.addDisposableListener)(tabsContainer, touch_1.EventType.Contextmenu, e => showContextMenu(e)));
            this._register((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.CONTEXT_MENU, e => showContextMenu(e)));
        }
        doHandleDecorationsChange() {
            // A change to decorations potentially has an impact on the size of tabs
            // so we need to trigger a layout in that case to adjust things
            this.layout(this.dimensions);
        }
        updateEditorActionsToolbar() {
            super.updateEditorActionsToolbar();
            // Changing the actions in the toolbar can have an impact on the size of the
            // tab container, so we need to layout the tabs to make sure the active is visible
            this.layout(this.dimensions);
        }
        openEditor(editor, options) {
            const changed = this.handleOpenedEditors();
            // Respect option to focus tab control if provided
            if (options?.focusTabControl) {
                this.withTab(editor, (editor, tabIndex, tabContainer) => tabContainer.focus());
            }
            return changed;
        }
        openEditors(editors) {
            return this.handleOpenedEditors();
        }
        handleOpenedEditors() {
            // Set tabs control visibility
            this.updateTabsControlVisibility();
            // Create tabs as needed
            const [tabsContainer, tabsScrollbar] = (0, types_1.assertAllDefined)(this.tabsContainer, this.tabsScrollbar);
            for (let i = tabsContainer.children.length; i < this.tabsModel.count; i++) {
                tabsContainer.appendChild(this.createTab(i, tabsContainer, tabsScrollbar));
            }
            // Make sure to recompute tab labels and detect
            // if a label change occurred that requires a
            // redraw of tabs.
            const activeEditorChanged = this.didActiveEditorChange();
            const oldActiveTabLabel = this.activeTabLabel;
            const oldTabLabelsLength = this.tabLabels.length;
            this.computeTabLabels();
            // Redraw and update in these cases
            let didChange = false;
            if (activeEditorChanged || // active editor changed
                oldTabLabelsLength !== this.tabLabels.length || // number of tabs changed
                !this.equalsEditorInputLabel(oldActiveTabLabel, this.activeTabLabel) // active editor label changed
            ) {
                this.redraw({ forceRevealActiveTab: true });
                didChange = true;
            }
            // Otherwise only layout for revealing
            else {
                this.layout(this.dimensions, { forceRevealActiveTab: true });
            }
            return didChange;
        }
        didActiveEditorChange() {
            if (!this.activeTabLabel?.editor && this.tabsModel.activeEditor || // active editor changed from null => editor
                this.activeTabLabel?.editor && !this.tabsModel.activeEditor || // active editor changed from editor => null
                (!this.activeTabLabel?.editor || !this.tabsModel.isActive(this.activeTabLabel.editor)) // active editor changed from editorA => editorB
            ) {
                return true;
            }
            return false;
        }
        equalsEditorInputLabel(labelA, labelB) {
            if (labelA === labelB) {
                return true;
            }
            if (!labelA || !labelB) {
                return false;
            }
            return labelA.name === labelB.name &&
                labelA.description === labelB.description &&
                labelA.forceDescription === labelB.forceDescription &&
                labelA.title === labelB.title &&
                labelA.ariaLabel === labelB.ariaLabel;
        }
        beforeCloseEditor(editor) {
            // Fix tabs width if the mouse is over tabs and before closing
            // a tab (except the last tab) when tab sizing is 'fixed'.
            // This helps keeping the close button stable under
            // the mouse and allows for rapid closing of tabs.
            if (this.isMouseOverTabs && this.groupsView.partOptions.tabSizing === 'fixed') {
                const closingLastTab = this.tabsModel.isLast(editor);
                this.updateTabsFixedWidth(!closingLastTab);
            }
        }
        closeEditor(editor) {
            this.handleClosedEditors();
        }
        closeEditors(editors) {
            this.handleClosedEditors();
        }
        handleClosedEditors() {
            // There are tabs to show
            if (this.tabsModel.count) {
                // Remove tabs that got closed
                const tabsContainer = (0, types_1.assertIsDefined)(this.tabsContainer);
                while (tabsContainer.children.length > this.tabsModel.count) {
                    // Remove one tab from container (must be the last to keep indexes in order!)
                    tabsContainer.lastChild?.remove();
                    // Remove associated tab label and widget
                    (0, lifecycle_1.dispose)(this.tabDisposables.pop());
                }
                // A removal of a label requires to recompute all labels
                this.computeTabLabels();
                // Redraw all tabs
                this.redraw({ forceRevealActiveTab: true });
            }
            // No tabs to show
            else {
                if (this.tabsContainer) {
                    (0, dom_1.clearNode)(this.tabsContainer);
                }
                this.tabDisposables = (0, lifecycle_1.dispose)(this.tabDisposables);
                this.tabResourceLabels.clear();
                this.tabLabels = [];
                this.activeTabLabel = undefined;
                this.tabActionBars = [];
                this.clearEditorActionsToolbar();
                this.updateTabsControlVisibility();
            }
        }
        moveEditor(editor, fromTabIndex, targeTabIndex) {
            // Move the editor label
            const editorLabel = this.tabLabels[fromTabIndex];
            this.tabLabels.splice(fromTabIndex, 1);
            this.tabLabels.splice(targeTabIndex, 0, editorLabel);
            // Redraw tabs in the range of the move
            this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
                this.redrawTab(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar);
            }, Math.min(fromTabIndex, targeTabIndex), // from: smallest of fromTabIndex/targeTabIndex
            Math.max(fromTabIndex, targeTabIndex) //   to: largest of fromTabIndex/targeTabIndex
            );
            // Moving an editor requires a layout to keep the active editor visible
            this.layout(this.dimensions, { forceRevealActiveTab: true });
        }
        pinEditor(editor) {
            this.withTab(editor, (editor, tabIndex, tabContainer, tabLabelWidget, tabLabel) => this.redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel));
        }
        stickEditor(editor) {
            this.doHandleStickyEditorChange(editor);
        }
        unstickEditor(editor) {
            this.doHandleStickyEditorChange(editor);
        }
        doHandleStickyEditorChange(editor) {
            // Update tab
            this.withTab(editor, (editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.redrawTab(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar));
            // Sticky change has an impact on each tab's border because
            // it potentially moves the border to the last pinned tab
            this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel) => {
                this.redrawTabBorders(tabIndex, tabContainer);
            });
            // A change to the sticky state requires a layout to keep the active editor visible
            this.layout(this.dimensions, { forceRevealActiveTab: true });
        }
        setActive(isGroupActive) {
            // Activity has an impact on each tab's active indication
            this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
                this.redrawTabActiveAndDirty(isGroupActive, editor, tabContainer, tabActionBar);
            });
            // Activity has an impact on the toolbar, so we need to update and layout
            this.updateEditorActionsToolbar();
            this.layout(this.dimensions, { forceRevealActiveTab: true });
        }
        updateEditorLabel(editor) {
            // Update all labels to account for changes to tab labels
            // Since this method may be called a lot of times from
            // individual editors, we collect all those requests and
            // then run the update once because we have to update
            // all opened tabs in the group at once.
            this.updateEditorLabelScheduler.schedule();
        }
        doUpdateEditorLabels() {
            // A change to a label requires to recompute all labels
            this.computeTabLabels();
            // As such we need to redraw each label
            this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel) => {
                this.redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel);
            });
            // A change to a label requires a layout to keep the active editor visible
            this.layout(this.dimensions);
        }
        updateEditorDirty(editor) {
            this.withTab(editor, (editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.redrawTabActiveAndDirty(this.groupsView.activeGroup === this.groupView, editor, tabContainer, tabActionBar));
        }
        updateOptions(oldOptions, newOptions) {
            super.updateOptions(oldOptions, newOptions);
            // A change to a label format options requires to recompute all labels
            if (oldOptions.labelFormat !== newOptions.labelFormat) {
                this.computeTabLabels();
            }
            // Update tabs scrollbar sizing
            if (oldOptions.titleScrollbarSizing !== newOptions.titleScrollbarSizing) {
                this.updateTabsScrollbarSizing();
            }
            // Update tabs sizing
            if (oldOptions.tabSizingFixedMinWidth !== newOptions.tabSizingFixedMinWidth ||
                oldOptions.tabSizingFixedMaxWidth !== newOptions.tabSizingFixedMaxWidth ||
                oldOptions.tabSizing !== newOptions.tabSizing) {
                this.updateTabSizing(true);
            }
            // Redraw tabs when other options change
            if (oldOptions.labelFormat !== newOptions.labelFormat ||
                oldOptions.tabActionLocation !== newOptions.tabActionLocation ||
                oldOptions.tabActionCloseVisibility !== newOptions.tabActionCloseVisibility ||
                oldOptions.tabActionUnpinVisibility !== newOptions.tabActionUnpinVisibility ||
                oldOptions.tabSizing !== newOptions.tabSizing ||
                oldOptions.pinnedTabSizing !== newOptions.pinnedTabSizing ||
                oldOptions.showIcons !== newOptions.showIcons ||
                oldOptions.hasIcons !== newOptions.hasIcons ||
                oldOptions.highlightModifiedTabs !== newOptions.highlightModifiedTabs ||
                oldOptions.wrapTabs !== newOptions.wrapTabs ||
                !(0, objects_1.equals)(oldOptions.decorations, newOptions.decorations)) {
                this.redraw();
            }
        }
        updateStyles() {
            this.redraw();
        }
        forEachTab(fn, fromTabIndex, toTabIndex) {
            this.tabsModel.getEditors(1 /* EditorsOrder.SEQUENTIAL */).forEach((editor, tabIndex) => {
                if (typeof fromTabIndex === 'number' && fromTabIndex > tabIndex) {
                    return; // do nothing if we are not yet at `fromIndex`
                }
                if (typeof toTabIndex === 'number' && toTabIndex < tabIndex) {
                    return; // do nothing if we are beyond `toIndex`
                }
                this.doWithTab(tabIndex, editor, fn);
            });
        }
        withTab(editor, fn) {
            this.doWithTab(this.tabsModel.indexOf(editor), editor, fn);
        }
        doWithTab(tabIndex, editor, fn) {
            const tabsContainer = (0, types_1.assertIsDefined)(this.tabsContainer);
            const tabContainer = tabsContainer.children[tabIndex];
            const tabResourceLabel = this.tabResourceLabels.get(tabIndex);
            const tabLabel = this.tabLabels[tabIndex];
            const tabActionBar = this.tabActionBars[tabIndex];
            if (tabContainer && tabResourceLabel && tabLabel) {
                fn(editor, tabIndex, tabContainer, tabResourceLabel, tabLabel, tabActionBar);
            }
        }
        createTab(tabIndex, tabsContainer, tabsScrollbar) {
            // Tab Container
            const tabContainer = document.createElement('div');
            tabContainer.draggable = true;
            tabContainer.setAttribute('role', 'tab');
            tabContainer.classList.add('tab');
            // Gesture Support
            this._register(touch_1.Gesture.addTarget(tabContainer));
            // Tab Border Top
            const tabBorderTopContainer = document.createElement('div');
            tabBorderTopContainer.classList.add('tab-border-top-container');
            tabContainer.appendChild(tabBorderTopContainer);
            // Tab Editor Label
            const editorLabel = this.tabResourceLabels.create(tabContainer);
            // Tab Actions
            const tabActionsContainer = document.createElement('div');
            tabActionsContainer.classList.add('tab-actions');
            tabContainer.appendChild(tabActionsContainer);
            const that = this;
            const tabActionRunner = new editorTabsControl_1.EditorCommandsContextActionRunner({
                groupId: this.groupView.id,
                get editorIndex() { return that.toEditorIndex(tabIndex); }
            });
            const tabActionBar = new actionbar_1.ActionBar(tabActionsContainer, { ariaLabel: (0, nls_1.localize)('ariaLabelTabActions', "Tab actions"), actionRunner: tabActionRunner });
            const tabActionListener = tabActionBar.onWillRun(e => {
                if (e.action.id === this.closeEditorAction.id) {
                    this.blockRevealActiveTabOnce();
                }
            });
            const tabActionBarDisposable = (0, lifecycle_1.combinedDisposable)(tabActionBar, tabActionListener, (0, lifecycle_1.toDisposable)((0, arrays_1.insert)(this.tabActionBars, tabActionBar)));
            // Tab Border Bottom
            const tabBorderBottomContainer = document.createElement('div');
            tabBorderBottomContainer.classList.add('tab-border-bottom-container');
            tabContainer.appendChild(tabBorderBottomContainer);
            // Eventing
            const eventsDisposable = this.registerTabListeners(tabContainer, tabIndex, tabsContainer, tabsScrollbar);
            this.tabDisposables.push((0, lifecycle_1.combinedDisposable)(eventsDisposable, tabActionBarDisposable, tabActionRunner, editorLabel));
            return tabContainer;
        }
        toEditorIndex(tabIndex) {
            // Given a `tabIndex` that is relative to the tabs model
            // returns the `editorIndex` relative to the entire group
            const editor = (0, types_1.assertIsDefined)(this.tabsModel.getEditorByIndex(tabIndex));
            return this.groupView.getIndexOfEditor(editor);
        }
        registerTabListeners(tab, tabIndex, tabsContainer, tabsScrollbar) {
            const disposables = new lifecycle_1.DisposableStore();
            const handleClickOrTouch = (e, preserveFocus) => {
                tab.blur(); // prevent flicker of focus outline on tab until editor got focus
                if ((0, dom_1.isMouseEvent)(e) && (e.button !== 0 /* middle/right mouse button */ || (platform_1.isMacintosh && e.ctrlKey /* macOS context menu */))) {
                    if (e.button === 1) {
                        e.preventDefault(); // required to prevent auto-scrolling (https://github.com/microsoft/vscode/issues/16690)
                    }
                    return undefined;
                }
                if (this.originatesFromTabActionBar(e)) {
                    return; // not when clicking on actions
                }
                // Open tabs editor
                const editor = this.tabsModel.getEditorByIndex(tabIndex);
                if (editor) {
                    // Even if focus is preserved make sure to activate the group.
                    this.groupView.openEditor(editor, { preserveFocus, activation: editor_3.EditorActivation.ACTIVATE });
                }
                return undefined;
            };
            const showContextMenu = (e) => {
                dom_1.EventHelper.stop(e);
                const editor = this.tabsModel.getEditorByIndex(tabIndex);
                if (editor) {
                    this.onTabContextMenu(editor, e, tab);
                }
            };
            // Open on Click / Touch
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.MOUSE_DOWN, e => handleClickOrTouch(e, false)));
            disposables.add((0, dom_1.addDisposableListener)(tab, touch_1.EventType.Tap, (e) => handleClickOrTouch(e, true))); // Preserve focus on touch #125470
            // Touch Scroll Support
            disposables.add((0, dom_1.addDisposableListener)(tab, touch_1.EventType.Change, (e) => {
                tabsScrollbar.setScrollPosition({ scrollLeft: tabsScrollbar.getScrollPosition().scrollLeft - e.translationX });
            }));
            // Prevent flicker of focus outline on tab until editor got focus
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.MOUSE_UP, e => {
                dom_1.EventHelper.stop(e);
                tab.blur();
            }));
            // Close on mouse middle click
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.AUXCLICK, e => {
                if (e.button === 1 /* Middle Button*/) {
                    dom_1.EventHelper.stop(e, true /* for https://github.com/microsoft/vscode/issues/56715 */);
                    const editor = this.tabsModel.getEditorByIndex(tabIndex);
                    if (editor) {
                        if ((0, editor_1.preventEditorClose)(this.tabsModel, editor, editor_1.EditorCloseMethod.MOUSE, this.groupsView.partOptions)) {
                            return;
                        }
                        this.blockRevealActiveTabOnce();
                        this.closeEditorAction.run({ groupId: this.groupView.id, editorIndex: this.groupView.getIndexOfEditor(editor) });
                    }
                }
            }));
            // Context menu on Shift+F10
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.shiftKey && event.keyCode === 68 /* KeyCode.F10 */) {
                    showContextMenu(e);
                }
            }));
            // Context menu on touch context menu gesture
            disposables.add((0, dom_1.addDisposableListener)(tab, touch_1.EventType.Contextmenu, (e) => {
                showContextMenu(e);
            }));
            // Keyboard accessibility
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.KEY_UP, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let handled = false;
                // Run action on Enter/Space
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    handled = true;
                    const editor = this.tabsModel.getEditorByIndex(tabIndex);
                    if (editor) {
                        this.groupView.openEditor(editor);
                    }
                }
                // Navigate in editors
                else if ([15 /* KeyCode.LeftArrow */, 17 /* KeyCode.RightArrow */, 16 /* KeyCode.UpArrow */, 18 /* KeyCode.DownArrow */, 14 /* KeyCode.Home */, 13 /* KeyCode.End */].some(kb => event.equals(kb))) {
                    let editorIndex = this.toEditorIndex(tabIndex);
                    if (event.equals(15 /* KeyCode.LeftArrow */) || event.equals(16 /* KeyCode.UpArrow */)) {
                        editorIndex = editorIndex - 1;
                    }
                    else if (event.equals(17 /* KeyCode.RightArrow */) || event.equals(18 /* KeyCode.DownArrow */)) {
                        editorIndex = editorIndex + 1;
                    }
                    else if (event.equals(14 /* KeyCode.Home */)) {
                        editorIndex = 0;
                    }
                    else {
                        editorIndex = this.groupView.count - 1;
                    }
                    const target = this.groupView.getEditorByIndex(editorIndex);
                    if (target) {
                        handled = true;
                        this.groupView.openEditor(target, { preserveFocus: true }, { focusTabControl: true });
                    }
                }
                if (handled) {
                    dom_1.EventHelper.stop(e, true);
                }
                // moving in the tabs container can have an impact on scrolling position, so we need to update the custom scrollbar
                tabsScrollbar.setScrollPosition({
                    scrollLeft: tabsContainer.scrollLeft
                });
            }));
            // Double click: either pin or toggle maximized
            for (const eventType of [touch_1.EventType.Tap, dom_1.EventType.DBLCLICK]) {
                disposables.add((0, dom_1.addDisposableListener)(tab, eventType, (e) => {
                    if (eventType === dom_1.EventType.DBLCLICK) {
                        dom_1.EventHelper.stop(e);
                    }
                    else if (e.tapCount !== 2) {
                        return; // ignore single taps
                    }
                    const editor = this.tabsModel.getEditorByIndex(tabIndex);
                    if (editor && this.tabsModel.isPinned(editor)) {
                        switch (this.groupsView.partOptions.doubleClickTabToToggleEditorGroupSizes) {
                            case 'maximize':
                                this.groupsView.toggleMaximizeGroup(this.groupView);
                                break;
                            case 'expand':
                                this.groupsView.toggleExpandGroup(this.groupView);
                                break;
                            case 'off':
                                break;
                        }
                    }
                    else {
                        this.groupView.pinEditor(editor);
                    }
                }));
            }
            // Context menu
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.CONTEXT_MENU, e => {
                dom_1.EventHelper.stop(e, true);
                const editor = this.tabsModel.getEditorByIndex(tabIndex);
                if (editor) {
                    this.onTabContextMenu(editor, e, tab);
                }
            }, true /* use capture to fix https://github.com/microsoft/vscode/issues/19145 */));
            // Drag & Drop support
            let lastDragEvent = undefined;
            let isNewWindowOperation = false;
            disposables.add(new dom_1.DragAndDropObserver(tab, {
                onDragStart: e => {
                    const editor = this.tabsModel.getEditorByIndex(tabIndex);
                    if (!editor) {
                        return;
                    }
                    isNewWindowOperation = this.isNewWindowOperation(e);
                    this.editorTransfer.setData([new dnd_1.DraggedEditorIdentifier({ editor, groupId: this.groupView.id })], dnd_1.DraggedEditorIdentifier.prototype);
                    if (e.dataTransfer) {
                        e.dataTransfer.effectAllowed = 'copyMove';
                    }
                    // Apply some datatransfer types to allow for dragging the element outside of the application
                    this.doFillResourceDataTransfers([editor], e, isNewWindowOperation);
                    // Fixes https://github.com/microsoft/vscode/issues/18733
                    tab.classList.add('dragged');
                    (0, dom_1.scheduleAtNextAnimationFrame)((0, dom_1.getWindow)(this.parent), () => tab.classList.remove('dragged'));
                },
                onDrag: e => {
                    lastDragEvent = e;
                },
                onDragEnter: e => {
                    // Update class to signal drag operation
                    tab.classList.add('dragged-over');
                    // Return if transfer is unsupported
                    if (!this.isSupportedDropTransfer(e)) {
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'none';
                        }
                        return;
                    }
                    // Return if dragged editor is the current tab dragged over
                    let isLocalDragAndDrop = false;
                    if (this.editorTransfer.hasData(dnd_1.DraggedEditorIdentifier.prototype)) {
                        isLocalDragAndDrop = true;
                        const data = this.editorTransfer.getData(dnd_1.DraggedEditorIdentifier.prototype);
                        if (Array.isArray(data)) {
                            const localDraggedEditor = data[0].identifier;
                            if (localDraggedEditor.editor === this.tabsModel.getEditorByIndex(tabIndex) && localDraggedEditor.groupId === this.groupView.id) {
                                if (e.dataTransfer) {
                                    e.dataTransfer.dropEffect = 'none';
                                }
                                return;
                            }
                        }
                    }
                    // Update the dropEffect to "copy" if there is no local data to be dragged because
                    // in that case we can only copy the data into and not move it from its source
                    if (!isLocalDragAndDrop) {
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'copy';
                        }
                    }
                    this.updateDropFeedback(tab, true, tabIndex);
                },
                onDragOver: (_, dragDuration) => {
                    if (dragDuration >= MultiEditorTabsControl_1.DRAG_OVER_OPEN_TAB_THRESHOLD) {
                        const draggedOverTab = this.tabsModel.getEditorByIndex(tabIndex);
                        if (draggedOverTab && this.tabsModel.activeEditor !== draggedOverTab) {
                            this.groupView.openEditor(draggedOverTab, { preserveFocus: true });
                        }
                    }
                },
                onDragLeave: () => {
                    tab.classList.remove('dragged-over');
                    this.updateDropFeedback(tab, false, tabIndex);
                },
                onDragEnd: async (e) => {
                    tab.classList.remove('dragged-over');
                    this.updateDropFeedback(tab, false, tabIndex);
                    this.editorTransfer.clearData(dnd_1.DraggedEditorIdentifier.prototype);
                    const editor = this.tabsModel.getEditorByIndex(tabIndex);
                    if (!isNewWindowOperation ||
                        (0, dnd_1.isWindowDraggedOver)() ||
                        !editor) {
                        return; // drag to open in new window is disabled
                    }
                    const auxiliaryEditorPart = await this.maybeCreateAuxiliaryEditorPartAt(e, tab);
                    if (!auxiliaryEditorPart) {
                        return;
                    }
                    const targetGroup = auxiliaryEditorPart.activeGroup;
                    if (this.isMoveOperation(lastDragEvent ?? e, targetGroup.id, editor)) {
                        this.groupView.moveEditor(editor, targetGroup);
                    }
                    else {
                        this.groupView.copyEditor(editor, targetGroup);
                    }
                    targetGroup.focus();
                },
                onDrop: e => {
                    tab.classList.remove('dragged-over');
                    this.updateDropFeedback(tab, false, tabIndex);
                    this.onDrop(e, tabIndex, tabsContainer);
                }
            }));
            return disposables;
        }
        isSupportedDropTransfer(e) {
            if (this.groupTransfer.hasData(dnd_1.DraggedEditorGroupIdentifier.prototype)) {
                const data = this.groupTransfer.getData(dnd_1.DraggedEditorGroupIdentifier.prototype);
                if (Array.isArray(data)) {
                    const group = data[0];
                    if (group.identifier === this.groupView.id) {
                        return false; // groups cannot be dropped on group it originates from
                    }
                }
                return true;
            }
            if (this.editorTransfer.hasData(dnd_1.DraggedEditorIdentifier.prototype)) {
                return true; // (local) editors can always be dropped
            }
            if (e.dataTransfer && e.dataTransfer.types.length > 0) {
                return true; // optimistically allow external data (// see https://github.com/microsoft/vscode/issues/25789)
            }
            return false;
        }
        updateDropFeedback(element, isDND, tabIndex) {
            const isTab = (typeof tabIndex === 'number');
            const editor = typeof tabIndex === 'number' ? this.tabsModel.getEditorByIndex(tabIndex) : undefined;
            const isActiveTab = isTab && !!editor && this.tabsModel.isActive(editor);
            // Background
            const noDNDBackgroundColor = isTab ? this.getColor(isActiveTab ? theme_1.TAB_ACTIVE_BACKGROUND : theme_1.TAB_INACTIVE_BACKGROUND) : '';
            element.style.backgroundColor = (isDND ? this.getColor(theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND) : noDNDBackgroundColor) || '';
            // Outline
            const activeContrastBorderColor = this.getColor(colorRegistry_1.activeContrastBorder);
            if (activeContrastBorderColor && isDND) {
                element.style.outlineWidth = '2px';
                element.style.outlineStyle = 'dashed';
                element.style.outlineColor = activeContrastBorderColor;
                element.style.outlineOffset = isTab ? '-5px' : '-3px';
            }
            else {
                element.style.outlineWidth = '';
                element.style.outlineStyle = '';
                element.style.outlineColor = activeContrastBorderColor || '';
                element.style.outlineOffset = '';
            }
        }
        computeTabLabels() {
            const { labelFormat } = this.groupsView.partOptions;
            const { verbosity, shortenDuplicates } = this.getLabelConfigFlags(labelFormat);
            // Build labels and descriptions for each editor
            const labels = [];
            let activeEditorTabIndex = -1;
            this.tabsModel.getEditors(1 /* EditorsOrder.SEQUENTIAL */).forEach((editor, tabIndex) => {
                labels.push({
                    editor,
                    name: editor.getName(),
                    description: editor.getDescription(verbosity),
                    forceDescription: editor.hasCapability(64 /* EditorInputCapabilities.ForceDescription */),
                    title: editor.getTitle(2 /* Verbosity.LONG */),
                    ariaLabel: (0, editor_2.computeEditorAriaLabel)(editor, tabIndex, this.groupView, this.editorPartsView.count)
                });
                if (editor === this.tabsModel.activeEditor) {
                    activeEditorTabIndex = tabIndex;
                }
            });
            // Shorten labels as needed
            if (shortenDuplicates) {
                this.shortenTabLabels(labels);
            }
            // Remember for fast lookup
            this.tabLabels = labels;
            this.activeTabLabel = labels[activeEditorTabIndex];
        }
        shortenTabLabels(labels) {
            // Gather duplicate titles, while filtering out invalid descriptions
            const mapNameToDuplicates = new Map();
            for (const label of labels) {
                if (typeof label.description === 'string') {
                    (0, map_1.getOrSet)(mapNameToDuplicates, label.name, []).push(label);
                }
                else {
                    label.description = '';
                }
            }
            // Identify duplicate names and shorten descriptions
            for (const [, duplicateLabels] of mapNameToDuplicates) {
                // Remove description if the title isn't duplicated
                // and we have no indication to enforce description
                if (duplicateLabels.length === 1 && !duplicateLabels[0].forceDescription) {
                    duplicateLabels[0].description = '';
                    continue;
                }
                // Identify duplicate descriptions
                const mapDescriptionToDuplicates = new Map();
                for (const duplicateLabel of duplicateLabels) {
                    (0, map_1.getOrSet)(mapDescriptionToDuplicates, duplicateLabel.description, []).push(duplicateLabel);
                }
                // For editors with duplicate descriptions, check whether any long descriptions differ
                let useLongDescriptions = false;
                for (const [, duplicateLabels] of mapDescriptionToDuplicates) {
                    if (!useLongDescriptions && duplicateLabels.length > 1) {
                        const [first, ...rest] = duplicateLabels.map(({ editor }) => editor.getDescription(2 /* Verbosity.LONG */));
                        useLongDescriptions = rest.some(description => description !== first);
                    }
                }
                // If so, replace all descriptions with long descriptions
                if (useLongDescriptions) {
                    mapDescriptionToDuplicates.clear();
                    for (const duplicateLabel of duplicateLabels) {
                        duplicateLabel.description = duplicateLabel.editor.getDescription(2 /* Verbosity.LONG */);
                        (0, map_1.getOrSet)(mapDescriptionToDuplicates, duplicateLabel.description, []).push(duplicateLabel);
                    }
                }
                // Obtain final set of descriptions
                const descriptions = [];
                for (const [description] of mapDescriptionToDuplicates) {
                    descriptions.push(description);
                }
                // Remove description if all descriptions are identical unless forced
                if (descriptions.length === 1) {
                    for (const label of mapDescriptionToDuplicates.get(descriptions[0]) || []) {
                        if (!label.forceDescription) {
                            label.description = '';
                        }
                    }
                    continue;
                }
                // Shorten descriptions
                const shortenedDescriptions = (0, labels_1.shorten)(descriptions, this.path.sep);
                descriptions.forEach((description, tabIndex) => {
                    for (const label of mapDescriptionToDuplicates.get(description) || []) {
                        label.description = shortenedDescriptions[tabIndex];
                    }
                });
            }
        }
        getLabelConfigFlags(value) {
            switch (value) {
                case 'short':
                    return { verbosity: 0 /* Verbosity.SHORT */, shortenDuplicates: false };
                case 'medium':
                    return { verbosity: 1 /* Verbosity.MEDIUM */, shortenDuplicates: false };
                case 'long':
                    return { verbosity: 2 /* Verbosity.LONG */, shortenDuplicates: false };
                default:
                    return { verbosity: 1 /* Verbosity.MEDIUM */, shortenDuplicates: true };
            }
        }
        redraw(options) {
            // Border below tabs if any with explicit high contrast support
            if (this.tabsAndActionsContainer) {
                let tabsContainerBorderColor = this.getColor(theme_1.EDITOR_GROUP_HEADER_TABS_BORDER);
                if (!tabsContainerBorderColor && (0, theme_2.isHighContrast)(this.theme.type)) {
                    tabsContainerBorderColor = this.getColor(theme_1.TAB_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
                }
                if (tabsContainerBorderColor) {
                    this.tabsAndActionsContainer.classList.add('tabs-border-bottom');
                    this.tabsAndActionsContainer.style.setProperty('--tabs-border-bottom-color', tabsContainerBorderColor.toString());
                }
                else {
                    this.tabsAndActionsContainer.classList.remove('tabs-border-bottom');
                    this.tabsAndActionsContainer.style.removeProperty('--tabs-border-bottom-color');
                }
            }
            // For each tab
            this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
                this.redrawTab(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar);
            });
            // Update Editor Actions Toolbar
            this.updateEditorActionsToolbar();
            // Ensure the active tab is always revealed
            this.layout(this.dimensions, options);
        }
        redrawTab(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) {
            const isTabSticky = this.tabsModel.isSticky(tabIndex);
            const options = this.groupsView.partOptions;
            // Label
            this.redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel);
            // Action
            const hasUnpinAction = isTabSticky && options.tabActionUnpinVisibility;
            const hasCloseAction = !hasUnpinAction && options.tabActionCloseVisibility;
            const hasAction = hasUnpinAction || hasCloseAction;
            let tabAction;
            if (hasAction) {
                tabAction = hasUnpinAction ? this.unpinEditorAction : this.closeEditorAction;
            }
            else {
                // Even if the action is not visible, add it as it contains the dirty indicator
                tabAction = isTabSticky ? this.unpinEditorAction : this.closeEditorAction;
            }
            if (!tabActionBar.hasAction(tabAction)) {
                if (!tabActionBar.isEmpty()) {
                    tabActionBar.clear();
                }
                tabActionBar.push(tabAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(tabAction) });
            }
            tabContainer.classList.toggle(`pinned-action-off`, isTabSticky && !hasUnpinAction);
            tabContainer.classList.toggle(`close-action-off`, !hasUnpinAction && !hasCloseAction);
            for (const option of ['left', 'right']) {
                tabContainer.classList.toggle(`tab-actions-${option}`, hasAction && options.tabActionLocation === option);
            }
            const tabSizing = isTabSticky && options.pinnedTabSizing === 'shrink' ? 'shrink' /* treat sticky shrink tabs as tabSizing: 'shrink' */ : options.tabSizing;
            for (const option of ['fit', 'shrink', 'fixed']) {
                tabContainer.classList.toggle(`sizing-${option}`, tabSizing === option);
            }
            tabContainer.classList.toggle('has-icon', options.showIcons && options.hasIcons);
            tabContainer.classList.toggle('sticky', isTabSticky);
            for (const option of ['normal', 'compact', 'shrink']) {
                tabContainer.classList.toggle(`sticky-${option}`, isTabSticky && options.pinnedTabSizing === option);
            }
            // If not wrapping tabs, sticky compact/shrink tabs need a position to remain at their location
            // when scrolling to stay in view (requirement for position: sticky)
            if (!options.wrapTabs && isTabSticky && options.pinnedTabSizing !== 'normal') {
                let stickyTabWidth = 0;
                switch (options.pinnedTabSizing) {
                    case 'compact':
                        stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.compact;
                        break;
                    case 'shrink':
                        stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.shrink;
                        break;
                }
                tabContainer.style.left = `${tabIndex * stickyTabWidth}px`;
            }
            else {
                tabContainer.style.left = 'auto';
            }
            // Borders / outline
            this.redrawTabBorders(tabIndex, tabContainer);
            // Active / dirty state
            this.redrawTabActiveAndDirty(this.groupsView.activeGroup === this.groupView, editor, tabContainer, tabActionBar);
        }
        redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel) {
            const options = this.groupsView.partOptions;
            // Unless tabs are sticky compact, show the full label and description
            // Sticky compact tabs will only show an icon if icons are enabled
            // or their first character of the name otherwise
            let name;
            let forceLabel = false;
            let fileDecorationBadges = Boolean(options.decorations?.badges);
            const fileDecorationColors = Boolean(options.decorations?.colors);
            let description;
            if (options.pinnedTabSizing === 'compact' && this.tabsModel.isSticky(tabIndex)) {
                const isShowingIcons = options.showIcons && options.hasIcons;
                name = isShowingIcons ? '' : tabLabel.name?.charAt(0).toUpperCase();
                description = '';
                forceLabel = true;
                fileDecorationBadges = false; // not enough space when sticky tabs are compact
            }
            else {
                name = tabLabel.name;
                description = tabLabel.description || '';
            }
            if (tabLabel.ariaLabel) {
                tabContainer.setAttribute('aria-label', tabLabel.ariaLabel);
                // Set aria-description to empty string so that screen readers would not read the title as well
                // More details https://github.com/microsoft/vscode/issues/95378
                tabContainer.setAttribute('aria-description', '');
            }
            const title = tabLabel.title || '';
            tabContainer.title = title;
            // Label
            tabLabelWidget.setResource({ name, description, resource: editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH }) }, {
                title,
                extraClasses: (0, arrays_1.coalesce)(['tab-label', fileDecorationBadges ? 'tab-label-has-badge' : undefined].concat(editor.getLabelExtraClasses())),
                italic: !this.tabsModel.isPinned(editor),
                forceLabel,
                fileDecorations: {
                    colors: fileDecorationColors,
                    badges: fileDecorationBadges
                },
                icon: editor.getIcon(),
                hideIcon: options.showIcons === false,
            });
            // Tests helper
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (resource) {
                tabContainer.setAttribute('data-resource-name', (0, resources_1.basenameOrAuthority)(resource));
            }
            else {
                tabContainer.removeAttribute('data-resource-name');
            }
        }
        redrawTabActiveAndDirty(isGroupActive, editor, tabContainer, tabActionBar) {
            const isTabActive = this.tabsModel.isActive(editor);
            const hasModifiedBorderTop = this.doRedrawTabDirty(isGroupActive, isTabActive, editor, tabContainer);
            this.doRedrawTabActive(isGroupActive, !hasModifiedBorderTop, editor, tabContainer, tabActionBar);
        }
        doRedrawTabActive(isGroupActive, allowBorderTop, editor, tabContainer, tabActionBar) {
            // Tab is active
            if (this.tabsModel.isActive(editor)) {
                // Container
                tabContainer.classList.add('active');
                tabContainer.setAttribute('aria-selected', 'true');
                tabContainer.tabIndex = 0; // Only active tab can be focused into
                tabContainer.style.backgroundColor = this.getColor(isGroupActive ? theme_1.TAB_ACTIVE_BACKGROUND : theme_1.TAB_UNFOCUSED_ACTIVE_BACKGROUND) || '';
                const activeTabBorderColorBottom = this.getColor(isGroupActive ? theme_1.TAB_ACTIVE_BORDER : theme_1.TAB_UNFOCUSED_ACTIVE_BORDER);
                if (activeTabBorderColorBottom) {
                    tabContainer.classList.add('tab-border-bottom');
                    tabContainer.style.setProperty('--tab-border-bottom-color', activeTabBorderColorBottom.toString());
                }
                else {
                    tabContainer.classList.remove('tab-border-bottom');
                    tabContainer.style.removeProperty('--tab-border-bottom-color');
                }
                const activeTabBorderColorTop = allowBorderTop ? this.getColor(isGroupActive ? theme_1.TAB_ACTIVE_BORDER_TOP : theme_1.TAB_UNFOCUSED_ACTIVE_BORDER_TOP) : undefined;
                if (activeTabBorderColorTop) {
                    tabContainer.classList.add('tab-border-top');
                    tabContainer.style.setProperty('--tab-border-top-color', activeTabBorderColorTop.toString());
                }
                else {
                    tabContainer.classList.remove('tab-border-top');
                    tabContainer.style.removeProperty('--tab-border-top-color');
                }
                // Label
                tabContainer.style.color = this.getColor(isGroupActive ? theme_1.TAB_ACTIVE_FOREGROUND : theme_1.TAB_UNFOCUSED_ACTIVE_FOREGROUND) || '';
                // Actions
                tabActionBar.setFocusable(true);
            }
            // Tab is inactive
            else {
                // Container
                tabContainer.classList.remove('active');
                tabContainer.setAttribute('aria-selected', 'false');
                tabContainer.tabIndex = -1; // Only active tab can be focused into
                tabContainer.style.backgroundColor = this.getColor(isGroupActive ? theme_1.TAB_INACTIVE_BACKGROUND : theme_1.TAB_UNFOCUSED_INACTIVE_BACKGROUND) || '';
                tabContainer.style.boxShadow = '';
                // Label
                tabContainer.style.color = this.getColor(isGroupActive ? theme_1.TAB_INACTIVE_FOREGROUND : theme_1.TAB_UNFOCUSED_INACTIVE_FOREGROUND) || '';
                // Actions
                tabActionBar.setFocusable(false);
            }
        }
        doRedrawTabDirty(isGroupActive, isTabActive, editor, tabContainer) {
            let hasModifiedBorderColor = false;
            // Tab: dirty (unless saving)
            if (editor.isDirty() && !editor.isSaving()) {
                tabContainer.classList.add('dirty');
                // Highlight modified tabs with a border if configured
                if (this.groupsView.partOptions.highlightModifiedTabs) {
                    let modifiedBorderColor;
                    if (isGroupActive && isTabActive) {
                        modifiedBorderColor = this.getColor(theme_1.TAB_ACTIVE_MODIFIED_BORDER);
                    }
                    else if (isGroupActive && !isTabActive) {
                        modifiedBorderColor = this.getColor(theme_1.TAB_INACTIVE_MODIFIED_BORDER);
                    }
                    else if (!isGroupActive && isTabActive) {
                        modifiedBorderColor = this.getColor(theme_1.TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER);
                    }
                    else {
                        modifiedBorderColor = this.getColor(theme_1.TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER);
                    }
                    if (modifiedBorderColor) {
                        hasModifiedBorderColor = true;
                        tabContainer.classList.add('dirty-border-top');
                        tabContainer.style.setProperty('--tab-dirty-border-top-color', modifiedBorderColor);
                    }
                }
                else {
                    tabContainer.classList.remove('dirty-border-top');
                    tabContainer.style.removeProperty('--tab-dirty-border-top-color');
                }
            }
            // Tab: not dirty
            else {
                tabContainer.classList.remove('dirty', 'dirty-border-top');
                tabContainer.style.removeProperty('--tab-dirty-border-top-color');
            }
            return hasModifiedBorderColor;
        }
        redrawTabBorders(tabIndex, tabContainer) {
            const isTabSticky = this.tabsModel.isSticky(tabIndex);
            const isTabLastSticky = isTabSticky && this.tabsModel.stickyCount === tabIndex + 1;
            const showLastStickyTabBorderColor = this.tabsModel.stickyCount !== this.tabsModel.count;
            // Borders / Outline
            const borderRightColor = ((isTabLastSticky && showLastStickyTabBorderColor ? this.getColor(theme_1.TAB_LAST_PINNED_BORDER) : undefined) || this.getColor(theme_1.TAB_BORDER) || this.getColor(colorRegistry_1.contrastBorder));
            tabContainer.style.borderRight = borderRightColor ? `1px solid ${borderRightColor}` : '';
            tabContainer.style.outlineColor = this.getColor(colorRegistry_1.activeContrastBorder) || '';
        }
        prepareEditorActions(editorActions) {
            const isGroupActive = this.groupsView.activeGroup === this.groupView;
            // Active: allow all actions
            if (isGroupActive) {
                return editorActions;
            }
            // Inactive: only show "Unlock" and secondary actions
            else {
                return {
                    primary: editorActions.primary.filter(action => action.id === editorCommands_1.UNLOCK_GROUP_COMMAND_ID),
                    secondary: editorActions.secondary
                };
            }
        }
        getHeight() {
            // Return quickly if our used dimensions are known
            if (this.dimensions.used) {
                return this.dimensions.used.height;
            }
            // Otherwise compute via browser APIs
            else {
                return this.computeHeight();
            }
        }
        computeHeight() {
            let height;
            if (!this.visible) {
                height = 0;
            }
            else if (this.groupsView.partOptions.wrapTabs && this.tabsAndActionsContainer?.classList.contains('wrapping')) {
                // Wrap: we need to ask `offsetHeight` to get
                // the real height of the title area with wrapping.
                height = this.tabsAndActionsContainer.offsetHeight;
            }
            else {
                height = this.tabHeight;
            }
            return height;
        }
        layout(dimensions, options) {
            // Remember dimensions that we get
            Object.assign(this.dimensions, dimensions);
            if (this.visible) {
                if (!this.layoutScheduler.value) {
                    // The layout of tabs can be an expensive operation because we access DOM properties
                    // that can result in the browser doing a full page layout to validate them. To buffer
                    // this a little bit we try at least to schedule this work on the next animation frame
                    // when we have restored or when idle otherwise.
                    const disposable = (0, dom_1.scheduleAtNextAnimationFrame)((0, dom_1.getWindow)(this.parent), () => {
                        this.doLayout(this.dimensions, this.layoutScheduler.value?.options /* ensure to pick up latest options */);
                        this.layoutScheduler.clear();
                    });
                    this.layoutScheduler.value = { options, dispose: () => disposable.dispose() };
                }
                // Make sure to keep options updated
                if (options?.forceRevealActiveTab) {
                    this.layoutScheduler.value.options = {
                        ...this.layoutScheduler.value.options,
                        forceRevealActiveTab: true
                    };
                }
            }
            // First time layout: compute the dimensions and store it
            if (!this.dimensions.used) {
                this.dimensions.used = new dom_1.Dimension(dimensions.container.width, this.computeHeight());
            }
            return this.dimensions.used;
        }
        doLayout(dimensions, options) {
            // Layout tabs
            if (dimensions.container !== dom_1.Dimension.None && dimensions.available !== dom_1.Dimension.None) {
                this.doLayoutTabs(dimensions, options);
            }
            // Remember the dimensions used in the control so that we can
            // return it fast from the `layout` call without having to
            // compute it over and over again
            const oldDimension = this.dimensions.used;
            const newDimension = this.dimensions.used = new dom_1.Dimension(dimensions.container.width, this.computeHeight());
            // In case the height of the title control changed from before
            // (currently only possible if wrapping changed on/off), we need
            // to signal this to the outside via a `relayout` call so that
            // e.g. the editor control can be adjusted accordingly.
            if (oldDimension && oldDimension.height !== newDimension.height) {
                this.groupView.relayout();
            }
        }
        doLayoutTabs(dimensions, options) {
            // Always first layout tabs with wrapping support even if wrapping
            // is disabled. The result indicates if tabs wrap and if not, we
            // need to proceed with the layout without wrapping because even
            // if wrapping is enabled in settings, there are cases where
            // wrapping is disabled (e.g. due to space constraints)
            const tabsWrapMultiLine = this.doLayoutTabsWrapping(dimensions);
            if (!tabsWrapMultiLine) {
                this.doLayoutTabsNonWrapping(options);
            }
        }
        doLayoutTabsWrapping(dimensions) {
            const [tabsAndActionsContainer, tabsContainer, editorToolbarContainer, tabsScrollbar] = (0, types_1.assertAllDefined)(this.tabsAndActionsContainer, this.tabsContainer, this.editorActionsToolbarContainer, this.tabsScrollbar);
            // Handle wrapping tabs according to setting:
            // - enabled: only add class if tabs wrap and don't exceed available dimensions
            // - disabled: remove class and margin-right variable
            const didTabsWrapMultiLine = tabsAndActionsContainer.classList.contains('wrapping');
            let tabsWrapMultiLine = didTabsWrapMultiLine;
            function updateTabsWrapping(enabled) {
                tabsWrapMultiLine = enabled;
                // Toggle the `wrapped` class to enable wrapping
                tabsAndActionsContainer.classList.toggle('wrapping', tabsWrapMultiLine);
                // Update `last-tab-margin-right` CSS variable to account for the absolute
                // positioned editor actions container when tabs wrap. The margin needs to
                // be the width of the editor actions container to avoid screen cheese.
                tabsContainer.style.setProperty('--last-tab-margin-right', tabsWrapMultiLine ? `${editorToolbarContainer.offsetWidth}px` : '0');
            }
            // Setting enabled: selectively enable wrapping if possible
            if (this.groupsView.partOptions.wrapTabs) {
                const visibleTabsWidth = tabsContainer.offsetWidth;
                const allTabsWidth = tabsContainer.scrollWidth;
                const lastTabFitsWrapped = () => {
                    const lastTab = this.getLastTab();
                    if (!lastTab) {
                        return true; // no tab always fits
                    }
                    const lastTabOverlapWithToolbarWidth = lastTab.offsetWidth + editorToolbarContainer.offsetWidth - dimensions.available.width;
                    if (lastTabOverlapWithToolbarWidth > 1) {
                        // Allow for slight rounding errors related to zooming here
                        // https://github.com/microsoft/vscode/issues/116385
                        return false;
                    }
                    return true;
                };
                // If tabs wrap or should start to wrap (when width exceeds visible width)
                // we must trigger `updateWrapping` to set the `last-tab-margin-right`
                // accordingly based on the number of actions. The margin is important to
                // properly position the last tab apart from the actions
                //
                // We already check here if the last tab would fit when wrapped given the
                // editor toolbar will also show right next to it. This ensures we are not
                // enabling wrapping only to disable it again in the code below (this fixes
                // flickering issue https://github.com/microsoft/vscode/issues/115050)
                if (tabsWrapMultiLine || (allTabsWidth > visibleTabsWidth && lastTabFitsWrapped())) {
                    updateTabsWrapping(true);
                }
                // Tabs wrap multiline: remove wrapping under certain size constraint conditions
                if (tabsWrapMultiLine) {
                    if ((tabsContainer.offsetHeight > dimensions.available.height) || // if height exceeds available height
                        (allTabsWidth === visibleTabsWidth && tabsContainer.offsetHeight === this.tabHeight) || // if wrapping is not needed anymore
                        (!lastTabFitsWrapped()) // if last tab does not fit anymore
                    ) {
                        updateTabsWrapping(false);
                    }
                }
            }
            // Setting disabled: remove CSS traces only if tabs did wrap
            else if (didTabsWrapMultiLine) {
                updateTabsWrapping(false);
            }
            // If we transitioned from non-wrapping to wrapping, we need
            // to update the scrollbar to have an equal `width` and
            // `scrollWidth`. Otherwise a scrollbar would appear which is
            // never desired when wrapping.
            if (tabsWrapMultiLine && !didTabsWrapMultiLine) {
                const visibleTabsWidth = tabsContainer.offsetWidth;
                tabsScrollbar.setScrollDimensions({
                    width: visibleTabsWidth,
                    scrollWidth: visibleTabsWidth
                });
            }
            // Update the `last-in-row` class on tabs when wrapping
            // is enabled (it doesn't do any harm otherwise). This
            // class controls additional properties of tab when it is
            // the last tab in a row
            if (tabsWrapMultiLine) {
                // Using a map here to change classes after the for loop is
                // crucial for performance because changing the class on a
                // tab can result in layouts of the rendering engine.
                const tabs = new Map();
                let currentTabsPosY = undefined;
                let lastTab = undefined;
                for (const child of tabsContainer.children) {
                    const tab = child;
                    const tabPosY = tab.offsetTop;
                    // Marks a new or the first row of tabs
                    if (tabPosY !== currentTabsPosY) {
                        currentTabsPosY = tabPosY;
                        if (lastTab) {
                            tabs.set(lastTab, true); // previous tab must be last in row then
                        }
                    }
                    // Always remember last tab and ensure the
                    // last-in-row class is not present until
                    // we know the tab is last
                    lastTab = tab;
                    tabs.set(tab, false);
                }
                // Last tab overally is always last-in-row
                if (lastTab) {
                    tabs.set(lastTab, true);
                }
                for (const [tab, lastInRow] of tabs) {
                    tab.classList.toggle('last-in-row', lastInRow);
                }
            }
            return tabsWrapMultiLine;
        }
        doLayoutTabsNonWrapping(options) {
            const [tabsContainer, tabsScrollbar] = (0, types_1.assertAllDefined)(this.tabsContainer, this.tabsScrollbar);
            //
            // Synopsis
            // - allTabsWidth:   			sum of all tab widths
            // - stickyTabsWidth:			sum of all sticky tab widths (unless `pinnedTabSizing: normal`)
            // - visibleContainerWidth: 	size of tab container
            // - availableContainerWidth: 	size of tab container minus size of sticky tabs
            //
            // [------------------------------ All tabs width ---------------------------------------]
            // [------------------- Visible container width -------------------]
            //                         [------ Available container width ------]
            // [ Sticky A ][ Sticky B ][ Tab C ][ Tab D ][ Tab E ][ Tab F ][ Tab G ][ Tab H ][ Tab I ]
            //                 Active Tab Width [-------]
            // [------- Active Tab Pos X -------]
            // [-- Sticky Tabs Width --]
            //
            const visibleTabsWidth = tabsContainer.offsetWidth;
            const allTabsWidth = tabsContainer.scrollWidth;
            // Compute width of sticky tabs depending on pinned tab sizing
            // - compact: sticky-tabs * TAB_SIZES.compact
            // -  shrink: sticky-tabs * TAB_SIZES.shrink
            // -  normal: 0 (sticky tabs inherit look and feel from non-sticky tabs)
            let stickyTabsWidth = 0;
            if (this.tabsModel.stickyCount > 0) {
                let stickyTabWidth = 0;
                switch (this.groupsView.partOptions.pinnedTabSizing) {
                    case 'compact':
                        stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.compact;
                        break;
                    case 'shrink':
                        stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.shrink;
                        break;
                }
                stickyTabsWidth = this.tabsModel.stickyCount * stickyTabWidth;
            }
            const activeTabAndIndex = this.tabsModel.activeEditor ? this.getTabAndIndex(this.tabsModel.activeEditor) : undefined;
            const [activeTab, activeTabIndex] = activeTabAndIndex ?? [undefined, undefined];
            // Figure out if active tab is positioned static which has an
            // impact on whether to reveal the tab or not later
            let activeTabPositionStatic = this.groupsView.partOptions.pinnedTabSizing !== 'normal' && typeof activeTabIndex === 'number' && this.tabsModel.isSticky(activeTabIndex);
            // Special case: we have sticky tabs but the available space for showing tabs
            // is little enough that we need to disable sticky tabs sticky positioning
            // so that tabs can be scrolled at naturally.
            let availableTabsContainerWidth = visibleTabsWidth - stickyTabsWidth;
            if (this.tabsModel.stickyCount > 0 && availableTabsContainerWidth < MultiEditorTabsControl_1.TAB_WIDTH.fit) {
                tabsContainer.classList.add('disable-sticky-tabs');
                availableTabsContainerWidth = visibleTabsWidth;
                stickyTabsWidth = 0;
                activeTabPositionStatic = false;
            }
            else {
                tabsContainer.classList.remove('disable-sticky-tabs');
            }
            let activeTabPosX;
            let activeTabWidth;
            if (!this.blockRevealActiveTab && activeTab) {
                activeTabPosX = activeTab.offsetLeft;
                activeTabWidth = activeTab.offsetWidth;
            }
            // Update scrollbar
            const { width: oldVisibleTabsWidth, scrollWidth: oldAllTabsWidth } = tabsScrollbar.getScrollDimensions();
            tabsScrollbar.setScrollDimensions({
                width: visibleTabsWidth,
                scrollWidth: allTabsWidth
            });
            const dimensionsChanged = oldVisibleTabsWidth !== visibleTabsWidth || oldAllTabsWidth !== allTabsWidth;
            // Revealing the active tab is skipped under some conditions:
            if (this.blockRevealActiveTab || // explicitly disabled
                typeof activeTabPosX !== 'number' || // invalid dimension
                typeof activeTabWidth !== 'number' || // invalid dimension
                activeTabPositionStatic || // static tab (sticky)
                (!dimensionsChanged && !options?.forceRevealActiveTab) // dimensions did not change and we have low layout priority (https://github.com/microsoft/vscode/issues/133631)
            ) {
                this.blockRevealActiveTab = false;
                return;
            }
            // Reveal the active one
            const tabsContainerScrollPosX = tabsScrollbar.getScrollPosition().scrollLeft;
            const activeTabFits = activeTabWidth <= availableTabsContainerWidth;
            const adjustedActiveTabPosX = activeTabPosX - stickyTabsWidth;
            //
            // Synopsis
            // - adjustedActiveTabPosX: the adjusted tabPosX takes the width of sticky tabs into account
            //   conceptually the scrolling only begins after sticky tabs so in order to reveal a tab fully
            //   the actual position needs to be adjusted for sticky tabs.
            //
            // Tab is overflowing to the right: Scroll minimally until the element is fully visible to the right
            // Note: only try to do this if we actually have enough width to give to show the tab fully!
            //
            // Example: Tab G should be made active and needs to be fully revealed as such.
            //
            // [-------------------------------- All tabs width -----------------------------------------]
            // [-------------------- Visible container width --------------------]
            //                           [----- Available container width -------]
            //     [ Sticky A ][ Sticky B ][ Tab C ][ Tab D ][ Tab E ][ Tab F ][ Tab G ][ Tab H ][ Tab I ]
            //                     Active Tab Width [-------]
            //     [------- Active Tab Pos X -------]
            //                             [-------- Adjusted Tab Pos X -------]
            //     [-- Sticky Tabs Width --]
            //
            //
            if (activeTabFits && tabsContainerScrollPosX + availableTabsContainerWidth < adjustedActiveTabPosX + activeTabWidth) {
                tabsScrollbar.setScrollPosition({
                    scrollLeft: tabsContainerScrollPosX + ((adjustedActiveTabPosX + activeTabWidth) /* right corner of tab */ - (tabsContainerScrollPosX + availableTabsContainerWidth) /* right corner of view port */)
                });
            }
            //
            // Tab is overlflowing to the left or does not fit: Scroll it into view to the left
            //
            // Example: Tab C should be made active and needs to be fully revealed as such.
            //
            // [----------------------------- All tabs width ----------------------------------------]
            //     [------------------ Visible container width ------------------]
            //                           [----- Available container width -------]
            // [ Sticky A ][ Sticky B ][ Tab C ][ Tab D ][ Tab E ][ Tab F ][ Tab G ][ Tab H ][ Tab I ]
            //                 Active Tab Width [-------]
            // [------- Active Tab Pos X -------]
            //      Adjusted Tab Pos X []
            // [-- Sticky Tabs Width --]
            //
            //
            else if (tabsContainerScrollPosX > adjustedActiveTabPosX || !activeTabFits) {
                tabsScrollbar.setScrollPosition({
                    scrollLeft: adjustedActiveTabPosX
                });
            }
        }
        updateTabsControlVisibility() {
            const tabsAndActionsContainer = (0, types_1.assertIsDefined)(this.tabsAndActionsContainer);
            tabsAndActionsContainer.classList.toggle('empty', !this.visible);
            // Reset dimensions if hidden
            if (!this.visible && this.dimensions) {
                this.dimensions.used = undefined;
            }
        }
        get visible() {
            return this.tabsModel.count > 0;
        }
        getTabAndIndex(editor) {
            const tabIndex = this.tabsModel.indexOf(editor);
            const tab = this.getTabAtIndex(tabIndex);
            if (tab) {
                return [tab, tabIndex];
            }
            return undefined;
        }
        getTabAtIndex(tabIndex) {
            if (tabIndex >= 0) {
                const tabsContainer = (0, types_1.assertIsDefined)(this.tabsContainer);
                return tabsContainer.children[tabIndex];
            }
            return undefined;
        }
        getLastTab() {
            return this.getTabAtIndex(this.tabsModel.count - 1);
        }
        blockRevealActiveTabOnce() {
            // When closing tabs through the tab close button or gesture, the user
            // might want to rapidly close tabs in sequence and as such revealing
            // the active tab after each close would be annoying. As such we block
            // the automated revealing of the active tab once after the close is
            // triggered.
            this.blockRevealActiveTab = true;
        }
        originatesFromTabActionBar(e) {
            let element;
            if ((0, dom_1.isMouseEvent)(e)) {
                element = (e.target || e.srcElement);
            }
            else {
                element = e.initialTarget;
            }
            return !!(0, dom_1.findParentWithClass)(element, 'action-item', 'tab');
        }
        async onDrop(e, targetTabIndex, tabsContainer) {
            dom_1.EventHelper.stop(e, true);
            this.updateDropFeedback(tabsContainer, false);
            tabsContainer.classList.remove('scroll');
            const targetEditorIndex = this.tabsModel instanceof filteredEditorGroupModel_1.UnstickyEditorGroupModel ? targetTabIndex + this.groupView.stickyCount : targetTabIndex;
            const options = {
                sticky: this.tabsModel instanceof filteredEditorGroupModel_1.StickyEditorGroupModel && this.tabsModel.stickyCount === targetEditorIndex,
                index: targetEditorIndex
            };
            // Check for group transfer
            if (this.groupTransfer.hasData(dnd_1.DraggedEditorGroupIdentifier.prototype)) {
                const data = this.groupTransfer.getData(dnd_1.DraggedEditorGroupIdentifier.prototype);
                if (Array.isArray(data)) {
                    const sourceGroup = this.editorPartsView.getGroup(data[0].identifier);
                    if (sourceGroup) {
                        const mergeGroupOptions = { index: targetEditorIndex };
                        if (!this.isMoveOperation(e, sourceGroup.id)) {
                            mergeGroupOptions.mode = 0 /* MergeGroupMode.COPY_EDITORS */;
                        }
                        this.groupsView.mergeGroup(sourceGroup, this.groupView, mergeGroupOptions);
                    }
                    this.groupView.focus();
                    this.groupTransfer.clearData(dnd_1.DraggedEditorGroupIdentifier.prototype);
                }
            }
            // Check for editor transfer
            else if (this.editorTransfer.hasData(dnd_1.DraggedEditorIdentifier.prototype)) {
                const data = this.editorTransfer.getData(dnd_1.DraggedEditorIdentifier.prototype);
                if (Array.isArray(data)) {
                    const draggedEditor = data[0].identifier;
                    const sourceGroup = this.editorPartsView.getGroup(draggedEditor.groupId);
                    if (sourceGroup) {
                        // Move editor to target position and index
                        if (this.isMoveOperation(e, draggedEditor.groupId, draggedEditor.editor)) {
                            sourceGroup.moveEditor(draggedEditor.editor, this.groupView, options);
                        }
                        // Copy editor to target position and index
                        else {
                            sourceGroup.copyEditor(draggedEditor.editor, this.groupView, options);
                        }
                    }
                    this.groupView.focus();
                    this.editorTransfer.clearData(dnd_1.DraggedEditorIdentifier.prototype);
                }
            }
            // Check for tree items
            else if (this.treeItemsTransfer.hasData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype)) {
                const data = this.treeItemsTransfer.getData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype);
                if (Array.isArray(data)) {
                    const editors = [];
                    for (const id of data) {
                        const dataTransferItem = await this.treeViewsDragAndDropService.removeDragOperationTransfer(id.identifier);
                        if (dataTransferItem) {
                            const treeDropData = await (0, dnd_1.extractTreeDropData)(dataTransferItem);
                            editors.push(...treeDropData.map(editor => ({ ...editor, options: { ...editor.options, pinned: true, index: targetEditorIndex } })));
                        }
                    }
                    this.editorService.openEditors(editors, this.groupView, { validateTrust: true });
                }
                this.treeItemsTransfer.clearData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype);
            }
            // Check for URI transfer
            else {
                const dropHandler = this.instantiationService.createInstance(dnd_1.ResourcesDropHandler, { allowWorkspaceOpen: false });
                dropHandler.handleDrop(e, (0, dom_1.getWindow)(this.parent), () => this.groupView, () => this.groupView.focus(), options);
            }
        }
        dispose() {
            super.dispose();
            this.tabDisposables = (0, lifecycle_1.dispose)(this.tabDisposables);
        }
    };
    exports.MultiEditorTabsControl = MultiEditorTabsControl;
    exports.MultiEditorTabsControl = MultiEditorTabsControl = MultiEditorTabsControl_1 = __decorate([
        __param(5, contextView_1.IContextMenuService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, notification_1.INotificationService),
        __param(10, quickInput_1.IQuickInputService),
        __param(11, themeService_1.IThemeService),
        __param(12, editorService_1.IEditorService),
        __param(13, pathService_1.IPathService),
        __param(14, treeViewsDndService_1.ITreeViewsDnDService),
        __param(15, editorResolverService_1.IEditorResolverService),
        __param(16, host_1.IHostService)
    ], MultiEditorTabsControl);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        // Add bottom border to tabs when wrapping
        const borderColor = theme.getColor(theme_1.TAB_BORDER);
        if (borderColor) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title > .tabs-and-actions-container.wrapping .tabs-container > .tab {
				border-bottom: 1px solid ${borderColor};
			}
		`);
        }
        // Styling with Outline color (e.g. high contrast theme)
        const activeContrastBorderColor = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (activeContrastBorderColor) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active,
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active:hover  {
				outline: 1px solid;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active:focus {
				outline-style: dashed;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active {
				outline: 1px dotted;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover  {
				outline: 1px dashed;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active:hover > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.dirty > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.sticky > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover > .tab-actions .action-label {
				opacity: 1 !important;
			}
		`);
        }
        // High Contrast Border Color for Editor Actions
        const contrastBorderColor = theme.getColor(colorRegistry_1.contrastBorder);
        if (contrastBorderColor) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .editor-actions {
				outline: 1px solid ${contrastBorderColor}
			}
		`);
        }
        // Hover Background
        const tabHoverBackground = theme.getColor(theme_1.TAB_HOVER_BACKGROUND);
        if (tabHoverBackground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:hover  {
				background-color: ${tabHoverBackground} !important;
			}
		`);
        }
        const tabUnfocusedHoverBackground = theme.getColor(theme_1.TAB_UNFOCUSED_HOVER_BACKGROUND);
        if (tabUnfocusedHoverBackground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover  {
				background-color: ${tabUnfocusedHoverBackground} !important;
			}
		`);
        }
        // Hover Foreground
        const tabHoverForeground = theme.getColor(theme_1.TAB_HOVER_FOREGROUND);
        if (tabHoverForeground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:hover  {
				color: ${tabHoverForeground} !important;
			}
		`);
        }
        const tabUnfocusedHoverForeground = theme.getColor(theme_1.TAB_UNFOCUSED_HOVER_FOREGROUND);
        if (tabUnfocusedHoverForeground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover  {
				color: ${tabUnfocusedHoverForeground} !important;
			}
		`);
        }
        // Hover Border
        //
        // Unfortunately we need to copy a lot of CSS over from the
        // multiEditorTabsControl.css because we want to reuse the same
        // styles we already have for the normal bottom-border.
        const tabHoverBorder = theme.getColor(theme_1.TAB_HOVER_BORDER);
        if (tabHoverBorder) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:hover > .tab-border-bottom-container {
				display: block;
				position: absolute;
				left: 0;
				pointer-events: none;
				width: 100%;
				z-index: 10;
				bottom: 0;
				height: 1px;
				background-color: ${tabHoverBorder};
			}
		`);
        }
        const tabUnfocusedHoverBorder = theme.getColor(theme_1.TAB_UNFOCUSED_HOVER_BORDER);
        if (tabUnfocusedHoverBorder) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover > .tab-border-bottom-container  {
				display: block;
				position: absolute;
				left: 0;
				pointer-events: none;
				width: 100%;
				z-index: 10;
				bottom: 0;
				height: 1px;
				background-color: ${tabUnfocusedHoverBorder};
			}
		`);
        }
        // Fade out styles via linear gradient (when tabs are set to shrink or fixed)
        // But not when:
        // - in high contrast theme
        // - if we have a contrast border (which draws an outline - https://github.com/microsoft/vscode/issues/109117)
        // - on Safari (https://github.com/microsoft/vscode/issues/108996)
        if (!(0, theme_2.isHighContrast)(theme.type) && !browser_1.isSafari && !activeContrastBorderColor) {
            const workbenchBackground = (0, theme_1.WORKBENCH_BACKGROUND)(theme);
            const editorBackgroundColor = theme.getColor(colorRegistry_1.editorBackground);
            const editorGroupHeaderTabsBackground = theme.getColor(theme_1.EDITOR_GROUP_HEADER_TABS_BACKGROUND);
            const editorDragAndDropBackground = theme.getColor(theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND);
            let adjustedTabBackground;
            if (editorGroupHeaderTabsBackground && editorBackgroundColor) {
                adjustedTabBackground = editorGroupHeaderTabsBackground.flatten(editorBackgroundColor, editorBackgroundColor, workbenchBackground);
            }
            let adjustedTabDragBackground;
            if (editorGroupHeaderTabsBackground && editorBackgroundColor && editorDragAndDropBackground && editorBackgroundColor) {
                adjustedTabDragBackground = editorGroupHeaderTabsBackground.flatten(editorBackgroundColor, editorDragAndDropBackground, editorBackgroundColor, workbenchBackground);
            }
            // Adjust gradient for focused and unfocused hover background
            const makeTabHoverBackgroundRule = (color, colorDrag, hasFocus = false) => `
			.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-shrink:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after,
			.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-fixed:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after {
				background: linear-gradient(to left, ${color}, transparent) !important;
			}

			.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-shrink:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after,
			.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-fixed:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after {
				background: linear-gradient(to left, ${colorDrag}, transparent) !important;
			}
		`;
            // Adjust gradient for (focused) hover background
            if (tabHoverBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabHoverBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabHoverBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabHoverBackgroundRule(adjustedColor, adjustedColorDrag, true));
            }
            // Adjust gradient for unfocused hover background
            if (tabUnfocusedHoverBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabUnfocusedHoverBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabUnfocusedHoverBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabHoverBackgroundRule(adjustedColor, adjustedColorDrag));
            }
            // Adjust gradient for drag and drop background
            if (editorDragAndDropBackground && adjustedTabDragBackground) {
                const adjustedColorDrag = editorDragAndDropBackground.flatten(adjustedTabDragBackground);
                collector.addRule(`
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container.active > .title .tabs-container > .tab.sizing-shrink.dragged-over:not(.active):not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container:not(.active) > .title .tabs-container > .tab.sizing-shrink.dragged-over:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container.active > .title .tabs-container > .tab.sizing-fixed.dragged-over:not(.active):not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container:not(.active) > .title .tabs-container > .tab.sizing-fixed.dragged-over:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${adjustedColorDrag}, transparent) !important;
				}
		`);
            }
            const makeTabBackgroundRule = (color, colorDrag, focused, active) => `
				.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-shrink${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-fixed${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${color}, transparent);
				}

				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-shrink${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-fixed${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${colorDrag}, transparent);
				}
		`;
            // Adjust gradient for focused active tab background
            const tabActiveBackground = theme.getColor(theme_1.TAB_ACTIVE_BACKGROUND);
            if (tabActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabActiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabActiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, true, true));
            }
            // Adjust gradient for unfocused active tab background
            const tabUnfocusedActiveBackground = theme.getColor(theme_1.TAB_UNFOCUSED_ACTIVE_BACKGROUND);
            if (tabUnfocusedActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabUnfocusedActiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabUnfocusedActiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, false, true));
            }
            // Adjust gradient for focused inactive tab background
            const tabInactiveBackground = theme.getColor(theme_1.TAB_INACTIVE_BACKGROUND);
            if (tabInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabInactiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabInactiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, true, false));
            }
            // Adjust gradient for unfocused inactive tab background
            const tabUnfocusedInactiveBackground = theme.getColor(theme_1.TAB_UNFOCUSED_INACTIVE_BACKGROUND);
            if (tabUnfocusedInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabUnfocusedInactiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabUnfocusedInactiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, false, false));
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlFZGl0b3JUYWJzQ29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL211bHRpRWRpdG9yVGFic0NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9GekYsSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBdUIsU0FBUSxxQ0FBaUI7O2lCQUVwQyxvQkFBZSxHQUFHO1lBQ3pDLE9BQU8sRUFBRSxDQUFVO1lBQ25CLEtBQUssRUFBRSxFQUFXO1NBQ2xCLEFBSHNDLENBR3JDO2lCQUVzQixjQUFTLEdBQUc7WUFDbkMsT0FBTyxFQUFFLEVBQVc7WUFDcEIsTUFBTSxFQUFFLEVBQVc7WUFDbkIsR0FBRyxFQUFFLEdBQVk7U0FDakIsQUFKZ0MsQ0FJL0I7aUJBRXNCLGlDQUE0QixHQUFHLElBQUksQUFBUCxDQUFRO2lCQUVwQyxnQ0FBMkIsR0FBRyxHQUFHLEFBQU4sQ0FBTztpQkFDbEMsbUNBQThCLEdBQUcsR0FBRyxBQUFOLENBQU87UUErQjdELFlBQ0MsTUFBbUIsRUFDbkIsZUFBaUMsRUFDakMsVUFBNkIsRUFDN0IsU0FBMkIsRUFDM0IsU0FBb0MsRUFDZixrQkFBdUMsRUFDckMsb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUNyQyxpQkFBcUMsRUFDbkMsbUJBQXlDLEVBQzNDLGlCQUFxQyxFQUMxQyxZQUEyQixFQUMxQixhQUFpRCxFQUNuRCxXQUEwQyxFQUNsQywyQkFBa0UsRUFDaEUscUJBQTZDLEVBQ3ZELFdBQXlCO1lBRXZDLEtBQUssQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFF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