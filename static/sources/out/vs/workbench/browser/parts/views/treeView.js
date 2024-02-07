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
define(["require", "exports", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/tree/treeDefaults", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/common/dataTransfer", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/theme", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/dnd", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/services/activity/common/activity", "vs/workbench/services/extensions/common/extensions", "vs/platform/hover/browser/hover", "vs/workbench/services/views/browser/treeViewsService", "vs/platform/dnd/browser/dnd", "vs/editor/browser/dnd", "vs/workbench/browser/parts/views/checkbox", "vs/base/common/platform", "vs/platform/telemetry/common/telemetryUtils", "vs/editor/common/services/treeViewsDndService", "vs/editor/common/services/treeViewsDnd", "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer", "vs/css!./media/views"], function (require, exports, dnd_1, DOM, markdownRenderer_1, actionbar_1, actionViewItems_1, treeDefaults_1, actions_1, async_1, cancellation_1, codicons_1, errors_1, event_1, filters_1, htmlContent_1, lifecycle_1, mime_1, network_1, resources_1, strings_1, types_1, uri_1, uuid_1, dataTransfer_1, nls_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, files_1, instantiation_1, keybinding_1, label_1, listService_1, log_1, notification_1, opener_1, progress_1, platform_1, telemetry_1, theme_1, themeService_1, themables_1, dnd_2, labels_1, editorCommands_1, viewPane_1, theme_2, views_1, activity_1, extensions_1, hover_1, treeViewsService_1, dnd_3, dnd_4, checkbox_1, platform_2, telemetryUtils_1, treeViewsDndService_1, treeViewsDnd_1, markdownRenderer_2) {
    "use strict";
    var TreeRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomTreeViewDragAndDrop = exports.TreeView = exports.CustomTreeView = exports.RawCustomTreeViewContextKey = exports.TreeViewPane = void 0;
    let TreeViewPane = class TreeViewPane extends viewPane_1.ViewPane {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService) {
            super({ ...options, titleMenuId: actions_2.MenuId.ViewTitle, donotForwardArgs: false }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            const { treeView } = platform_1.Registry.as(views_1.Extensions.ViewsRegistry).getView(options.id);
            this.treeView = treeView;
            this._register(this.treeView.onDidChangeActions(() => this.updateActions(), this));
            this._register(this.treeView.onDidChangeTitle((newTitle) => this.updateTitle(newTitle)));
            this._register(this.treeView.onDidChangeDescription((newDescription) => this.updateTitleDescription(newDescription)));
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (this._container && this.treeView.container && (this._container === this.treeView.container)) {
                    this.treeView.setVisibility(false);
                }
            }));
            this._register(this.onDidChangeBodyVisibility(() => this.updateTreeVisibility()));
            this._register(this.treeView.onDidChangeWelcomeState(() => this._onDidChangeViewWelcomeState.fire()));
            if (options.title !== this.treeView.title) {
                this.updateTitle(this.treeView.title);
            }
            if (options.titleDescription !== this.treeView.description) {
                this.updateTitleDescription(this.treeView.description);
            }
            this._actionRunner = new MultipleSelectionActionRunner(notificationService, () => this.treeView.getSelection());
            this.updateTreeVisibility();
        }
        focus() {
            super.focus();
            this.treeView.focus();
        }
        renderBody(container) {
            this._container = container;
            super.renderBody(container);
            this.renderTreeView(container);
        }
        shouldShowWelcome() {
            return ((this.treeView.dataProvider === undefined) || !!this.treeView.dataProvider.isTreeEmpty) && ((this.treeView.message === undefined) || (this.treeView.message === ''));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.layoutTreeView(height, width);
        }
        getOptimalWidth() {
            return this.treeView.getOptimalWidth();
        }
        renderTreeView(container) {
            this.treeView.show(container);
        }
        layoutTreeView(height, width) {
            this.treeView.layout(height, width);
        }
        updateTreeVisibility() {
            this.treeView.setVisibility(this.isBodyVisible());
        }
        getActionRunner() {
            return this._actionRunner;
        }
        getActionsContext() {
            return { $treeViewId: this.id, $focusedTreeItem: true, $selectedTreeItems: true };
        }
    };
    exports.TreeViewPane = TreeViewPane;
    exports.TreeViewPane = TreeViewPane = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, notification_1.INotificationService)
    ], TreeViewPane);
    class Root {
        constructor() {
            this.label = { label: 'root' };
            this.handle = '0';
            this.parentHandle = undefined;
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
            this.children = undefined;
        }
    }
    function isTreeCommandEnabled(treeCommand, contextKeyService) {
        const command = commands_1.CommandsRegistry.getCommand(treeCommand.originalId ? treeCommand.originalId : treeCommand.id);
        if (command) {
            const commandAction = actions_2.MenuRegistry.getCommand(command.id);
            const precondition = commandAction && commandAction.precondition;
            if (precondition) {
                return contextKeyService.contextMatchesRules(precondition);
            }
        }
        return true;
    }
    function isRenderedMessageValue(messageValue) {
        return !!messageValue && typeof messageValue !== 'string' && 'element' in messageValue && 'dispose' in messageValue;
    }
    const noDataProviderMessage = (0, nls_1.localize)('no-dataprovider', "There is no data provider registered that can provide view data.");
    exports.RawCustomTreeViewContextKey = new contextkey_1.RawContextKey('customTreeView', false);
    class Tree extends listService_1.WorkbenchAsyncDataTree {
    }
    let AbstractTreeView = class AbstractTreeView extends lifecycle_1.Disposable {
        constructor(id, _title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService) {
            super();
            this.id = id;
            this._title = _title;
            this.themeService = themeService;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.progressService = progressService;
            this.contextMenuService = contextMenuService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.viewDescriptorService = viewDescriptorService;
            this.hoverService = hoverService;
            this.contextKeyService = contextKeyService;
            this.activityService = activityService;
            this.logService = logService;
            this.isVisible = false;
            this._hasIconForParentNode = false;
            this._hasIconForLeafNode = false;
            this.focused = false;
            this._canSelectMany = false;
            this._manuallyManageCheckboxes = false;
            this.elementsToRefresh = [];
            this.lastSelection = [];
            this._onDidExpandItem = this._register(new event_1.Emitter());
            this.onDidExpandItem = this._onDidExpandItem.event;
            this._onDidCollapseItem = this._register(new event_1.Emitter());
            this.onDidCollapseItem = this._onDidCollapseItem.event;
            this._onDidChangeSelectionAndFocus = this._register(new event_1.Emitter());
            this.onDidChangeSelectionAndFocus = this._onDidChangeSelectionAndFocus.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._onDidChangeActions = this._register(new event_1.Emitter());
            this.onDidChangeActions = this._onDidChangeActions.event;
            this._onDidChangeWelcomeState = this._register(new event_1.Emitter());
            this.onDidChangeWelcomeState = this._onDidChangeWelcomeState.event;
            this._onDidChangeTitle = this._register(new event_1.Emitter());
            this.onDidChangeTitle = this._onDidChangeTitle.event;
            this._onDidChangeDescription = this._register(new event_1.Emitter());
            this.onDidChangeDescription = this._onDidChangeDescription.event;
            this._onDidChangeCheckboxState = this._register(new event_1.Emitter());
            this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
            this._onDidCompleteRefresh = this._register(new event_1.Emitter());
            this._isInitialized = false;
            this._height = 0;
            this._width = 0;
            this.refreshing = false;
            this.root = new Root();
            this.lastActive = this.root;
            // Try not to add anything that could be costly to this constructor. It gets called once per tree view
            // during startup, and anything added here can affect performance.
        }
        initialize() {
            if (this._isInitialized) {
                return;
            }
            this._isInitialized = true;
            // Remember when adding to this method that it isn't called until the the view is visible, meaning that
            // properties could be set and events could be fired before we're initialized and that this needs to be handled.
            this.contextKeyService.bufferChangeEvents(() => {
                this.initializeShowCollapseAllAction();
                this.initializeCollapseAllToggle();
                this.initializeShowRefreshAction();
            });
            this.treeViewDnd = this.instantiationService.createInstance(CustomTreeViewDragAndDrop, this.id);
            if (this._dragAndDropController) {
                this.treeViewDnd.controller = this._dragAndDropController;
            }
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('explorer.decorations')) {
                    this.doRefresh([this.root]); /** soft refresh **/
                }
            }));
            this._register(this.viewDescriptorService.onDidChangeLocation(({ views, from, to }) => {
                if (views.some(v => v.id === this.id)) {
                    this.tree?.updateOptions({ overrideStyles: { listBackground: this.viewLocation === 1 /* ViewContainerLocation.Panel */ ? theme_2.PANEL_BACKGROUND : theme_2.SIDE_BAR_BACKGROUND } });
                }
            }));
            this.registerActions();
            this.create();
        }
        get viewContainer() {
            return this.viewDescriptorService.getViewContainerByViewId(this.id);
        }
        get viewLocation() {
            return this.viewDescriptorService.getViewLocationById(this.id);
        }
        get dragAndDropController() {
            return this._dragAndDropController;
        }
        set dragAndDropController(dnd) {
            this._dragAndDropController = dnd;
            if (this.treeViewDnd) {
                this.treeViewDnd.controller = dnd;
            }
        }
        get dataProvider() {
            return this._dataProvider;
        }
        set dataProvider(dataProvider) {
            if (dataProvider) {
                const self = this;
                this._dataProvider = new class {
                    constructor() {
                        this._isEmpty = true;
                        this._onDidChangeEmpty = new event_1.Emitter();
                        this.onDidChangeEmpty = this._onDidChangeEmpty.event;
                    }
                    get isTreeEmpty() {
                        return this._isEmpty;
                    }
                    async getChildren(node) {
                        let children;
                        const checkboxesUpdated = [];
                        if (node && node.children) {
                            children = node.children;
                        }
                        else {
                            node = node ?? self.root;
                            node.children = await (node instanceof Root ? dataProvider.getChildren() : dataProvider.getChildren(node));
                            children = node.children ?? [];
                            children.forEach(child => {
                                child.parent = node;
                                if (!self.manuallyManageCheckboxes && (node?.checkbox?.isChecked === true) && (child.checkbox?.isChecked === false)) {
                                    child.checkbox.isChecked = true;
                                    checkboxesUpdated.push(child);
                                }
                            });
                        }
                        if (node instanceof Root) {
                            const oldEmpty = this._isEmpty;
                            this._isEmpty = children.length === 0;
                            if (oldEmpty !== this._isEmpty) {
                                this._onDidChangeEmpty.fire();
                            }
                        }
                        if (checkboxesUpdated.length > 0) {
                            self._onDidChangeCheckboxState.fire(checkboxesUpdated);
                        }
                        return children;
                    }
                };
                if (this._dataProvider.onDidChangeEmpty) {
                    this._register(this._dataProvider.onDidChangeEmpty(() => {
                        this.updateCollapseAllToggle();
                        this._onDidChangeWelcomeState.fire();
                    }));
                }
                this.updateMessage();
                this.refresh();
            }
            else {
                this._dataProvider = undefined;
                this.updateMessage();
            }
            this._onDidChangeWelcomeState.fire();
        }
        get message() {
            return this._message;
        }
        set message(message) {
            this._message = message;
            this.updateMessage();
            this._onDidChangeWelcomeState.fire();
        }
        get title() {
            return this._title;
        }
        set title(name) {
            this._title = name;
            this._onDidChangeTitle.fire(this._title);
        }
        get description() {
            return this._description;
        }
        set description(description) {
            this._description = description;
            this._onDidChangeDescription.fire(this._description);
        }
        get badge() {
            return this._badge;
        }
        set badge(badge) {
            if (this._badge?.value === badge?.value &&
                this._badge?.tooltip === badge?.tooltip) {
                return;
            }
            if (this._badgeActivity) {
                this._badgeActivity.dispose();
                this._badgeActivity = undefined;
            }
            this._badge = badge;
            if (badge) {
                const activity = {
                    badge: new activity_1.NumberBadge(badge.value, () => badge.tooltip),
                    priority: 50
                };
                this._badgeActivity = this.activityService.showViewActivity(this.id, activity);
            }
        }
        get canSelectMany() {
            return this._canSelectMany;
        }
        set canSelectMany(canSelectMany) {
            const oldCanSelectMany = this._canSelectMany;
            this._canSelectMany = canSelectMany;
            if (this._canSelectMany !== oldCanSelectMany) {
                this.tree?.updateOptions({ multipleSelectionSupport: this.canSelectMany });
            }
        }
        get manuallyManageCheckboxes() {
            return this._manuallyManageCheckboxes;
        }
        set manuallyManageCheckboxes(manuallyManageCheckboxes) {
            this._manuallyManageCheckboxes = manuallyManageCheckboxes;
        }
        get hasIconForParentNode() {
            return this._hasIconForParentNode;
        }
        get hasIconForLeafNode() {
            return this._hasIconForLeafNode;
        }
        get visible() {
            return this.isVisible;
        }
        initializeShowCollapseAllAction(startingValue = false) {
            if (!this.collapseAllContext) {
                this.collapseAllContextKey = new contextkey_1.RawContextKey(`treeView.${this.id}.enableCollapseAll`, startingValue, (0, nls_1.localize)('treeView.enableCollapseAll', "Whether the the tree view with id {0} enables collapse all.", this.id));
                this.collapseAllContext = this.collapseAllContextKey.bindTo(this.contextKeyService);
            }
            return true;
        }
        get showCollapseAllAction() {
            this.initializeShowCollapseAllAction();
            return !!this.collapseAllContext?.get();
        }
        set showCollapseAllAction(showCollapseAllAction) {
            this.initializeShowCollapseAllAction(showCollapseAllAction);
            this.collapseAllContext?.set(showCollapseAllAction);
        }
        initializeShowRefreshAction(startingValue = false) {
            if (!this.refreshContext) {
                this.refreshContextKey = new contextkey_1.RawContextKey(`treeView.${this.id}.enableRefresh`, startingValue, (0, nls_1.localize)('treeView.enableRefresh', "Whether the tree view with id {0} enables refresh.", this.id));
                this.refreshContext = this.refreshContextKey.bindTo(this.contextKeyService);
            }
        }
        get showRefreshAction() {
            this.initializeShowRefreshAction();
            return !!this.refreshContext?.get();
        }
        set showRefreshAction(showRefreshAction) {
            this.initializeShowRefreshAction(showRefreshAction);
            this.refreshContext?.set(showRefreshAction);
        }
        registerActions() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.treeView.${that.id}.refresh`,
                        title: (0, nls_1.localize)('refresh', "Refresh"),
                        menu: {
                            id: actions_2.MenuId.ViewTitle,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', that.id), that.refreshContextKey),
                            group: 'navigation',
                            order: Number.MAX_SAFE_INTEGER - 1,
                        },
                        icon: codicons_1.Codicon.refresh
                    });
                }
                async run() {
                    return that.refresh();
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.treeView.${that.id}.collapseAll`,
                        title: (0, nls_1.localize)('collapseAll', "Collapse All"),
                        menu: {
                            id: actions_2.MenuId.ViewTitle,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', that.id), that.collapseAllContextKey),
                            group: 'navigation',
                            order: Number.MAX_SAFE_INTEGER,
                        },
                        precondition: that.collapseAllToggleContextKey,
                        icon: codicons_1.Codicon.collapseAll
                    });
                }
                async run() {
                    if (that.tree) {
                        return new treeDefaults_1.CollapseAllAction(that.tree, true).run();
                    }
                }
            }));
        }
        setVisibility(isVisible) {
            // Throughout setVisibility we need to check if the tree view's data provider still exists.
            // This can happen because the `getChildren` call to the extension can return
            // after the tree has been disposed.
            this.initialize();
            isVisible = !!isVisible;
            if (this.isVisible === isVisible) {
                return;
            }
            this.isVisible = isVisible;
            if (this.tree) {
                if (this.isVisible) {
                    DOM.show(this.tree.getHTMLElement());
                }
                else {
                    DOM.hide(this.tree.getHTMLElement()); // make sure the tree goes out of the tabindex world by hiding it
                }
                if (this.isVisible && this.elementsToRefresh.length && this.dataProvider) {
                    this.doRefresh(this.elementsToRefresh);
                    this.elementsToRefresh = [];
                }
            }
            (0, platform_2.setTimeout0)(() => {
                if (this.dataProvider) {
                    this._onDidChangeVisibility.fire(this.isVisible);
                }
            });
            if (this.visible) {
                this.activate();
            }
        }
        focus(reveal = true, revealItem) {
            if (this.tree && this.root.children && this.root.children.length > 0) {
                // Make sure the current selected element is revealed
                const element = revealItem ?? this.tree.getSelection()[0];
                if (element && reveal) {
                    this.tree.reveal(element, 0.5);
                }
                // Pass Focus to Viewer
                this.tree.domFocus();
            }
            else if (this.tree && this.treeContainer && !this.treeContainer.classList.contains('hide')) {
                this.tree.domFocus();
            }
            else {
                this.domNode.focus();
            }
        }
        show(container) {
            this._container = container;
            DOM.append(container, this.domNode);
        }
        create() {
            this.domNode = DOM.$('.tree-explorer-viewlet-tree-view');
            this.messageElement = DOM.append(this.domNode, DOM.$('.message'));
            this.updateMessage();
            this.treeContainer = DOM.append(this.domNode, DOM.$('.customview-tree'));
            this.treeContainer.classList.add('file-icon-themable-tree', 'show-file-icons');
            const focusTracker = this._register(DOM.trackFocus(this.domNode));
            this._register(focusTracker.onDidFocus(() => this.focused = true));
            this._register(focusTracker.onDidBlur(() => this.focused = false));
        }
        createTree() {
            const actionViewItemProvider = menuEntryActionViewItem_1.createActionViewItem.bind(undefined, this.instantiationService);
            const treeMenus = this._register(this.instantiationService.createInstance(TreeMenus, this.id));
            this.treeLabels = this._register(this.instantiationService.createInstance(labels_1.ResourceLabels, this));
            const dataSource = this.instantiationService.createInstance(TreeDataSource, this, (task) => this.progressService.withProgress({ location: this.id }, () => task));
            const aligner = new Aligner(this.themeService);
            const checkboxStateHandler = this._register(new checkbox_1.CheckboxStateHandler());
            const renderer = this.instantiationService.createInstance(TreeRenderer, this.id, treeMenus, this.treeLabels, actionViewItemProvider, aligner, checkboxStateHandler, () => this.manuallyManageCheckboxes);
            this._register(renderer.onDidChangeCheckboxState(e => this._onDidChangeCheckboxState.fire(e)));
            const widgetAriaLabel = this._title;
            this.tree = this._register(this.instantiationService.createInstance(Tree, this.id, this.treeContainer, new TreeViewDelegate(), [renderer], dataSource, {
                identityProvider: new TreeViewIdentityProvider(),
                accessibilityProvider: {
                    getAriaLabel(element) {
                        if (element.accessibilityInformation) {
                            return element.accessibilityInformation.label;
                        }
                        if ((0, types_1.isString)(element.tooltip)) {
                            return element.tooltip;
                        }
                        else {
                            if (element.resourceUri && !element.label) {
                                // The custom tree has no good information on what should be used for the aria label.
                                // Allow the tree widget's default aria label to be used.
                                return null;
                            }
                            let buildAriaLabel = '';
                            if (element.label) {
                                buildAriaLabel += element.label.label + ' ';
                            }
                            if (element.description) {
                                buildAriaLabel += element.description;
                            }
                            return buildAriaLabel;
                        }
                    },
                    getRole(element) {
                        return element.accessibilityInformation?.role ?? 'treeitem';
                    },
                    getWidgetAriaLabel() {
                        return widgetAriaLabel;
                    }
                },
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (item) => {
                        return item.label ? item.label.label : (item.resourceUri ? (0, resources_1.basename)(uri_1.URI.revive(item.resourceUri)) : undefined);
                    }
                },
                expandOnlyOnTwistieClick: (e) => {
                    return !!e.command || !!e.checkbox || this.configurationService.getValue('workbench.tree.expandMode') === 'doubleClick';
                },
                collapseByDefault: (e) => {
                    return e.collapsibleState !== views_1.TreeItemCollapsibleState.Expanded;
                },
                multipleSelectionSupport: this.canSelectMany,
                dnd: this.treeViewDnd,
                overrideStyles: {
                    listBackground: this.viewLocation === 1 /* ViewContainerLocation.Panel */ ? theme_2.PANEL_BACKGROUND : theme_2.SIDE_BAR_BACKGROUND
                }
            }));
            treeMenus.setContextKeyService(this.tree.contextKeyService);
            aligner.tree = this.tree;
            const actionRunner = new MultipleSelectionActionRunner(this.notificationService, () => this.tree.getSelection());
            renderer.actionRunner = actionRunner;
            this.tree.contextKeyService.createKey(this.id, true);
            const customTreeKey = exports.RawCustomTreeViewContextKey.bindTo(this.tree.contextKeyService);
            customTreeKey.set(true);
            this._register(this.tree.onContextMenu(e => this.onContextMenu(treeMenus, e, actionRunner)));
            this._register(this.tree.onDidChangeSelection(e => {
                this.lastSelection = e.elements;
                this.lastActive = this.tree?.getFocus()[0] ?? this.lastActive;
                this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
            }));
            this._register(this.tree.onDidChangeFocus(e => {
                if (e.elements.length && (e.elements[0] !== this.lastActive)) {
                    this.lastActive = e.elements[0];
                    this.lastSelection = this.tree?.getSelection() ?? this.lastSelection;
                    this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
                }
            }));
            this._register(this.tree.onDidChangeCollapseState(e => {
                if (!e.node.element) {
                    return;
                }
                const element = Array.isArray(e.node.element.element) ? e.node.element.element[0] : e.node.element.element;
                if (e.node.collapsed) {
                    this._onDidCollapseItem.fire(element);
                }
                else {
                    this._onDidExpandItem.fire(element);
                }
            }));
            this.tree.setInput(this.root).then(() => this.updateContentAreas());
            this._register(this.tree.onDidOpen(async (e) => {
                if (!e.browserEvent) {
                    return;
                }
                if (e.browserEvent.target && e.browserEvent.target.classList.contains(checkbox_1.TreeItemCheckbox.checkboxClass)) {
                    return;
                }
                const selection = this.tree.getSelection();
                const command = await this.resolveCommand(selection.length === 1 ? selection[0] : undefined);
                if (command && isTreeCommandEnabled(command, this.contextKeyService)) {
                    let args = command.arguments || [];
                    if (command.id === editorCommands_1.API_OPEN_EDITOR_COMMAND_ID || command.id === editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID) {
                        // Some commands owned by us should receive the
                        // `IOpenEvent` as context to open properly
                        args = [...args, e];
                    }
                    try {
                        await this.commandService.executeCommand(command.id, ...args);
                    }
                    catch (err) {
                        this.notificationService.error(err);
                    }
                }
            }));
            this._register(treeMenus.onDidChange((changed) => {
                if (this.tree?.hasNode(changed)) {
                    this.tree?.rerender(changed);
                }
            }));
        }
        async resolveCommand(element) {
            let command = element?.command;
            if (element && !command) {
                if ((element instanceof views_1.ResolvableTreeItem) && element.hasResolve) {
                    await element.resolve(new cancellation_1.CancellationTokenSource().token);
                    command = element.command;
                }
            }
            return command;
        }
        onContextMenu(treeMenus, treeEvent, actionRunner) {
            this.hoverService.hideHover();
            const node = treeEvent.element;
            if (node === null) {
                return;
            }
            const event = treeEvent.browserEvent;
            event.preventDefault();
            event.stopPropagation();
            this.tree.setFocus([node]);
            const actions = treeMenus.getResourceContextActions(node);
            if (!actions.length) {
                return;
            }
            this.contextMenuService.showContextMenu({
                getAnchor: () => treeEvent.anchor,
                getActions: () => actions,
                getActionViewItem: (action) => {
                    const keybinding = this.keybindingService.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.tree.domFocus();
                    }
                },
                getActionsContext: () => ({ $treeViewId: this.id, $treeItemHandle: node.handle }),
                actionRunner
            });
        }
        updateMessage() {
            if (this._message) {
                this.showMessage(this._message);
            }
            else if (!this.dataProvider) {
                this.showMessage(noDataProviderMessage);
            }
            else {
                this.hideMessage();
            }
            this.updateContentAreas();
        }
        showMessage(message) {
            if (isRenderedMessageValue(this._messageValue)) {
                this._messageValue.dispose();
            }
            if ((0, htmlContent_1.isMarkdownString)(message) && !this.markdownRenderer) {
                this.markdownRenderer = this.instantiationService.createInstance(markdownRenderer_2.MarkdownRenderer, {});
            }
            this._messageValue = (0, htmlContent_1.isMarkdownString)(message) ? this.markdownRenderer.render(message) : message;
            if (!this.messageElement) {
                return;
            }
            this.messageElement.classList.remove('hide');
            this.resetMessageElement();
            if (typeof this._messageValue === 'string' && !(0, strings_1.isFalsyOrWhitespace)(this._messageValue)) {
                this.messageElement.textContent = this._messageValue;
            }
            else if (isRenderedMessageValue(this._messageValue)) {
                this.messageElement.appendChild(this._messageValue.element);
            }
            this.layout(this._height, this._width);
        }
        hideMessage() {
            this.resetMessageElement();
            this.messageElement?.classList.add('hide');
            this.layout(this._height, this._width);
        }
        resetMessageElement() {
            if (this.messageElement) {
                DOM.clearNode(this.messageElement);
            }
        }
        layout(height, width) {
            if (height && width && this.messageElement && this.treeContainer) {
                this._height = height;
                this._width = width;
                const treeHeight = height - DOM.getTotalHeight(this.messageElement);
                this.treeContainer.style.height = treeHeight + 'px';
                this.tree?.layout(treeHeight, width);
            }
        }
        getOptimalWidth() {
            if (this.tree) {
                const parentNode = this.tree.getHTMLElement();
                const childNodes = [].slice.call(parentNode.querySelectorAll('.outline-item-label > a'));
                return DOM.getLargestChildWidth(parentNode, childNodes);
            }
            return 0;
        }
        async refresh(elements) {
            if (this.dataProvider && this.tree) {
                if (this.refreshing) {
                    await event_1.Event.toPromise(this._onDidCompleteRefresh.event);
                }
                if (!elements) {
                    elements = [this.root];
                    // remove all waiting elements to refresh if root is asked to refresh
                    this.elementsToRefresh = [];
                }
                for (const element of elements) {
                    element.children = undefined; // reset children
                }
                if (this.isVisible) {
                    return this.doRefresh(elements);
                }
                else {
                    if (this.elementsToRefresh.length) {
                        const seen = new Set();
                        this.elementsToRefresh.forEach(element => seen.add(element.handle));
                        for (const element of elements) {
                            if (!seen.has(element.handle)) {
                                this.elementsToRefresh.push(element);
                            }
                        }
                    }
                    else {
                        this.elementsToRefresh.push(...elements);
                    }
                }
            }
            return undefined;
        }
        async expand(itemOrItems) {
            const tree = this.tree;
            if (!tree) {
                return;
            }
            try {
                itemOrItems = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
                for (const element of itemOrItems) {
                    await tree.expand(element, false);
                }
            }
            catch (e) {
                // The extension could have changed the tree during the reveal.
                // Because of that, we ignore errors.
            }
        }
        isCollapsed(item) {
            return !!this.tree?.isCollapsed(item);
        }
        setSelection(items) {
            this.tree?.setSelection(items);
        }
        getSelection() {
            return this.tree?.getSelection() ?? [];
        }
        setFocus(item) {
            if (this.tree) {
                if (item) {
                    this.focus(true, item);
                    this.tree.setFocus([item]);
                }
                else if (this.tree.getFocus().length === 0) {
                    this.tree.setFocus([]);
                }
            }
        }
        async reveal(item) {
            if (this.tree) {
                return this.tree.reveal(item);
            }
        }
        async doRefresh(elements) {
            const tree = this.tree;
            if (tree && this.visible) {
                this.refreshing = true;
                const oldSelection = tree.getSelection();
                try {
                    await Promise.all(elements.map(element => tree.updateChildren(element, true, true)));
                }
                catch (e) {
                    // When multiple calls are made to refresh the tree in quick succession,
                    // we can get a "Tree element not found" error. This is expected.
                    // Ideally this is fixable, so log instead of ignoring so the error is preserved.
                    this.logService.error(e);
                }
                const newSelection = tree.getSelection();
                if (oldSelection.length !== newSelection.length || oldSelection.some((value, index) => value.handle !== newSelection[index].handle)) {
                    this.lastSelection = newSelection;
                    this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
                }
                this.refreshing = false;
                this._onDidCompleteRefresh.fire();
                this.updateContentAreas();
                if (this.focused) {
                    this.focus(false);
                }
                this.updateCollapseAllToggle();
            }
        }
        initializeCollapseAllToggle() {
            if (!this.collapseAllToggleContext) {
                this.collapseAllToggleContextKey = new contextkey_1.RawContextKey(`treeView.${this.id}.toggleCollapseAll`, false, (0, nls_1.localize)('treeView.toggleCollapseAll', "Whether collapse all is toggled for the tree view with id {0}.", this.id));
                this.collapseAllToggleContext = this.collapseAllToggleContextKey.bindTo(this.contextKeyService);
            }
        }
        updateCollapseAllToggle() {
            if (this.showCollapseAllAction) {
                this.initializeCollapseAllToggle();
                this.collapseAllToggleContext?.set(!!this.root.children && (this.root.children.length > 0) &&
                    this.root.children.some(value => value.collapsibleState !== views_1.TreeItemCollapsibleState.None));
            }
        }
        updateContentAreas() {
            const isTreeEmpty = !this.root.children || this.root.children.length === 0;
            // Hide tree container only when there is a message and tree is empty and not refreshing
            if (this._messageValue && isTreeEmpty && !this.refreshing && this.treeContainer) {
                // If there's a dnd controller then hiding the tree prevents it from being dragged into.
                if (!this.dragAndDropController) {
                    this.treeContainer.classList.add('hide');
                }
                this.domNode.setAttribute('tabindex', '0');
            }
            else if (this.treeContainer) {
                this.treeContainer.classList.remove('hide');
                if (this.domNode === DOM.getActiveElement()) {
                    this.focus();
                }
                this.domNode.removeAttribute('tabindex');
            }
        }
        get container() {
            return this._container;
        }
    };
    AbstractTreeView = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, commands_1.ICommandService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, progress_1.IProgressService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, notification_1.INotificationService),
        __param(10, views_1.IViewDescriptorService),
        __param(11, hover_1.IHoverService),
        __param(12, contextkey_1.IContextKeyService),
        __param(13, activity_1.IActivityService),
        __param(14, log_1.ILogService)
    ], AbstractTreeView);
    class TreeViewIdentityProvider {
        getId(element) {
            return element.handle;
        }
    }
    class TreeViewDelegate {
        getHeight(element) {
            return TreeRenderer.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            return TreeRenderer.TREE_TEMPLATE_ID;
        }
    }
    class TreeDataSource {
        constructor(treeView, withProgress) {
            this.treeView = treeView;
            this.withProgress = withProgress;
        }
        hasChildren(element) {
            return !!this.treeView.dataProvider && (element.collapsibleState !== views_1.TreeItemCollapsibleState.None);
        }
        async getChildren(element) {
            let result = [];
            if (this.treeView.dataProvider) {
                try {
                    result = (await this.withProgress(this.treeView.dataProvider.getChildren(element))) ?? [];
                }
                catch (e) {
                    if (!e.message.startsWith('Bad progress location:')) {
                        throw e;
                    }
                }
            }
            return result;
        }
    }
    let TreeRenderer = class TreeRenderer extends lifecycle_1.Disposable {
        static { TreeRenderer_1 = this; }
        static { this.ITEM_HEIGHT = 22; }
        static { this.TREE_TEMPLATE_ID = 'treeExplorer'; }
        constructor(treeViewId, menus, labels, actionViewItemProvider, aligner, checkboxStateHandler, manuallyManageCheckboxes, themeService, configurationService, labelService, hoverService, treeViewsService, contextKeyService) {
            super();
            this.treeViewId = treeViewId;
            this.menus = menus;
            this.labels = labels;
            this.actionViewItemProvider = actionViewItemProvider;
            this.aligner = aligner;
            this.checkboxStateHandler = checkboxStateHandler;
            this.manuallyManageCheckboxes = manuallyManageCheckboxes;
            this.themeService = themeService;
            this.configurationService = configurationService;
            this.labelService = labelService;
            this.hoverService = hoverService;
            this.treeViewsService = treeViewsService;
            this.contextKeyService = contextKeyService;
            this._onDidChangeCheckboxState = this._register(new event_1.Emitter());
            this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
            this._hasCheckbox = false;
            this._renderedElements = new Map(); // tree item handle to template data
            this._hoverDelegate = {
                showHover: (options) => this.hoverService.showHover(options),
                delay: this.configurationService.getValue('workbench.hover.delay')
            };
            this._register(this.themeService.onDidFileIconThemeChange(() => this.rerender()));
            this._register(this.themeService.onDidColorThemeChange(() => this.rerender()));
            this._register(checkboxStateHandler.onDidChangeCheckboxState(items => {
                this.updateCheckboxes(items);
            }));
        }
        get templateId() {
            return TreeRenderer_1.TREE_TEMPLATE_ID;
        }
        set actionRunner(actionRunner) {
            this._actionRunner = actionRunner;
        }
        renderTemplate(container) {
            container.classList.add('custom-view-tree-node-item');
            const checkboxContainer = DOM.append(container, DOM.$(''));
            const resourceLabel = this.labels.create(container, { supportHighlights: true, hoverDelegate: this._hoverDelegate });
            const icon = DOM.prepend(resourceLabel.element, DOM.$('.custom-view-tree-node-item-icon'));
            const actionsContainer = DOM.append(resourceLabel.element, DOM.$('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionViewItemProvider: this.actionViewItemProvider
            });
            return { resourceLabel, icon, checkboxContainer, actionBar, container, elementDisposable: new lifecycle_1.DisposableStore() };
        }
        getHover(label, resource, node) {
            if (!(node instanceof views_1.ResolvableTreeItem) || !node.hasResolve) {
                if (resource && !node.tooltip) {
                    return undefined;
                }
                else if (node.tooltip === undefined) {
                    return label;
                }
                else if (!(0, types_1.isString)(node.tooltip)) {
                    return { markdown: node.tooltip, markdownNotSupportedFallback: resource ? undefined : (0, markdownRenderer_1.renderMarkdownAsPlaintext)(node.tooltip) }; // Passing undefined as the fallback for a resource falls back to the old native hover
                }
                else if (node.tooltip !== '') {
                    return node.tooltip;
                }
                else {
                    return undefined;
                }
            }
            return {
                markdown: typeof node.tooltip === 'string' ? node.tooltip :
                    (token) => {
                        return new Promise((resolve) => {
                            node.resolve(token).then(() => resolve(node.tooltip));
                        });
                    },
                markdownNotSupportedFallback: resource ? undefined : (label ?? '') // Passing undefined as the fallback for a resource falls back to the old native hover
            };
        }
        renderElement(element, index, templateData) {
            const node = element.element;
            const resource = node.resourceUri ? uri_1.URI.revive(node.resourceUri) : null;
            const treeItemLabel = node.label ? node.label : (resource ? { label: (0, resources_1.basename)(resource) } : undefined);
            const description = (0, types_1.isString)(node.description) ? node.description : resource && node.description === true ? this.labelService.getUriLabel((0, resources_1.dirname)(resource), { relative: true }) : undefined;
            const label = treeItemLabel ? treeItemLabel.label : undefined;
            const matches = (treeItemLabel && treeItemLabel.highlights && label) ? treeItemLabel.highlights.map(([start, end]) => {
                if (start < 0) {
                    start = label.length + start;
                }
                if (end < 0) {
                    end = label.length + end;
                }
                if ((start >= label.length) || (end > label.length)) {
                    return ({ start: 0, end: 0 });
                }
                if (start > end) {
                    const swap = start;
                    start = end;
                    end = swap;
                }
                return ({ start, end });
            }) : undefined;
            const icon = this.themeService.getColorTheme().type === theme_1.ColorScheme.LIGHT ? node.icon : node.iconDark;
            const iconUrl = icon ? uri_1.URI.revive(icon) : undefined;
            const title = this.getHover(label, resource, node);
            // reset
            templateData.actionBar.clear();
            templateData.icon.style.color = '';
            let commandEnabled = true;
            if (node.command) {
                commandEnabled = isTreeCommandEnabled(node.command, this.contextKeyService);
            }
            this.renderCheckbox(node, templateData);
            if (resource) {
                const fileDecorations = this.configurationService.getValue('explorer.decorations');
                const labelResource = resource ? resource : uri_1.URI.parse('missing:_icon_resource');
                templateData.resourceLabel.setResource({ name: label, description, resource: labelResource }, {
                    fileKind: this.getFileKind(node),
                    title,
                    hideIcon: this.shouldHideResourceLabelIcon(iconUrl, node.themeIcon),
                    fileDecorations,
                    extraClasses: ['custom-view-tree-node-item-resourceLabel'],
                    matches: matches ? matches : (0, filters_1.createMatches)(element.filterData),
                    strikethrough: treeItemLabel?.strikethrough,
                    disabledCommand: !commandEnabled,
                    labelEscapeNewLines: true,
                    forceLabel: !!node.label
                });
            }
            else {
                templateData.resourceLabel.setResource({ name: label, description }, {
                    title,
                    hideIcon: true,
                    extraClasses: ['custom-view-tree-node-item-resourceLabel'],
                    matches: matches ? matches : (0, filters_1.createMatches)(element.filterData),
                    strikethrough: treeItemLabel?.strikethrough,
                    disabledCommand: !commandEnabled,
                    labelEscapeNewLines: true
                });
            }
            if (iconUrl) {
                templateData.icon.className = 'custom-view-tree-node-item-icon';
                templateData.icon.style.backgroundImage = DOM.asCSSUrl(iconUrl);
            }
            else {
                let iconClass;
                if (this.shouldShowThemeIcon(!!resource, node.themeIcon)) {
                    iconClass = themables_1.ThemeIcon.asClassName(node.themeIcon);
                    if (node.themeIcon.color) {
                        templateData.icon.style.color = this.themeService.getColorTheme().getColor(node.themeIcon.color.id)?.toString() ?? '';
                    }
                }
                templateData.icon.className = iconClass ? `custom-view-tree-node-item-icon ${iconClass}` : '';
                templateData.icon.style.backgroundImage = '';
            }
            if (!commandEnabled) {
                templateData.icon.className = templateData.icon.className + ' disabled';
                if (templateData.container.parentElement) {
                    templateData.container.parentElement.className = templateData.container.parentElement.className + ' disabled';
                }
            }
            templateData.actionBar.context = { $treeViewId: this.treeViewId, $treeItemHandle: node.handle };
            const menuActions = this.menus.getResourceActions(node, templateData.elementDisposable);
            templateData.actionBar.push(menuActions.actions, { icon: true, label: false });
            if (this._actionRunner) {
                templateData.actionBar.actionRunner = this._actionRunner;
            }
            this.setAlignment(templateData.container, node);
            this.treeViewsService.addRenderedTreeItemElement(node.handle, templateData.container);
            // remember rendered element, an element can be rendered multiple times
            const renderedItems = this._renderedElements.get(element.element.handle) ?? [];
            this._renderedElements.set(element.element.handle, [...renderedItems, { original: element, rendered: templateData }]);
        }
        rerender() {
            // As we add items to the map during this call we can't directly use the map in the for loop
            // but have to create a copy of the keys first
            const keys = new Set(this._renderedElements.keys());
            for (const key of keys) {
                const values = this._renderedElements.get(key) ?? [];
                for (const value of values) {
                    this.disposeElement(value.original, 0, value.rendered);
                    this.renderElement(value.original, 0, value.rendered);
                }
            }
        }
        renderCheckbox(node, templateData) {
            if (node.checkbox) {
                // The first time we find a checkbox we want to rerender the visible tree to adapt the alignment
                if (!this._hasCheckbox) {
                    this._hasCheckbox = true;
                    this.rerender();
                }
                if (!templateData.checkbox) {
                    const checkbox = new checkbox_1.TreeItemCheckbox(templateData.checkboxContainer, this.checkboxStateHandler, this._hoverDelegate);
                    templateData.checkbox = checkbox;
                }
                templateData.checkbox.render(node);
            }
            else if (templateData.checkbox) {
                templateData.checkbox.dispose();
                templateData.checkbox = undefined;
            }
        }
        setAlignment(container, treeItem) {
            container.parentElement.classList.toggle('align-icon-with-twisty', !this._hasCheckbox && this.aligner.alignIconWithTwisty(treeItem));
        }
        shouldHideResourceLabelIcon(iconUrl, icon) {
            // We always hide the resource label in favor of the iconUrl when it's provided.
            // When `ThemeIcon` is provided, we hide the resource label icon in favor of it only if it's a not a file icon.
            return (!!iconUrl || (!!icon && !this.isFileKindThemeIcon(icon)));
        }
        shouldShowThemeIcon(hasResource, icon) {
            if (!icon) {
                return false;
            }
            // If there's a resource and the icon is a file icon, then the icon (or lack thereof) will already be coming from the
            // icon theme and should use whatever the icon theme has provided.
            return !(hasResource && this.isFileKindThemeIcon(icon));
        }
        isFolderThemeIcon(icon) {
            return icon?.id === themeService_1.FolderThemeIcon.id;
        }
        isFileKindThemeIcon(icon) {
            if (icon) {
                return icon.id === themeService_1.FileThemeIcon.id || this.isFolderThemeIcon(icon);
            }
            else {
                return false;
            }
        }
        getFileKind(node) {
            if (node.themeIcon) {
                switch (node.themeIcon.id) {
                    case themeService_1.FileThemeIcon.id:
                        return files_1.FileKind.FILE;
                    case themeService_1.FolderThemeIcon.id:
                        return files_1.FileKind.FOLDER;
                }
            }
            return node.collapsibleState === views_1.TreeItemCollapsibleState.Collapsed || node.collapsibleState === views_1.TreeItemCollapsibleState.Expanded ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
        }
        updateCheckboxes(items) {
            const additionalItems = [];
            if (!this.manuallyManageCheckboxes()) {
                for (const item of items) {
                    if (item.checkbox !== undefined) {
                        function checkChildren(currentItem) {
                            for (const child of (currentItem.children ?? [])) {
                                if ((child.checkbox !== undefined) && (currentItem.checkbox !== undefined) && (child.checkbox.isChecked !== currentItem.checkbox.isChecked)) {
                                    child.checkbox.isChecked = currentItem.checkbox.isChecked;
                                    additionalItems.push(child);
                                    checkChildren(child);
                                }
                            }
                        }
                        checkChildren(item);
                        const visitedParents = new Set();
                        function checkParents(currentItem) {
                            if (currentItem.parent && (currentItem.parent.checkbox !== undefined) && currentItem.parent.children) {
                                if (visitedParents.has(currentItem.parent)) {
                                    return;
                                }
                                else {
                                    visitedParents.add(currentItem.parent);
                                }
                                let someUnchecked = false;
                                let someChecked = false;
                                for (const child of currentItem.parent.children) {
                                    if (someUnchecked && someChecked) {
                                        break;
                                    }
                                    if (child.checkbox !== undefined) {
                                        if (child.checkbox.isChecked) {
                                            someChecked = true;
                                        }
                                        else {
                                            someUnchecked = true;
                                        }
                                    }
                                }
                                if (someChecked && !someUnchecked && (currentItem.parent.checkbox.isChecked !== true)) {
                                    currentItem.parent.checkbox.isChecked = true;
                                    additionalItems.push(currentItem.parent);
                                    checkParents(currentItem.parent);
                                }
                                else if (someUnchecked && (currentItem.parent.checkbox.isChecked !== false)) {
                                    currentItem.parent.checkbox.isChecked = false;
                                    additionalItems.push(currentItem.parent);
                                    checkParents(currentItem.parent);
                                }
                            }
                        }
                        checkParents(item);
                    }
                }
            }
            items = items.concat(additionalItems);
            items.forEach(item => {
                const renderedItems = this._renderedElements.get(item.handle);
                if (renderedItems) {
                    renderedItems.forEach(renderedItems => renderedItems.rendered.checkbox?.render(item));
                }
            });
            this._onDidChangeCheckboxState.fire(items);
        }
        disposeElement(resource, index, templateData) {
            templateData.elementDisposable.clear();
            const itemRenders = this._renderedElements.get(resource.element.handle) ?? [];
            const renderedIndex = itemRenders.findIndex(renderedItem => templateData === renderedItem.rendered);
            if (itemRenders.length === 1) {
                this._renderedElements.delete(resource.element.handle);
            }
            else if (itemRenders.length > 0) {
                itemRenders.splice(renderedIndex, 1);
            }
            this.treeViewsService.removeRenderedTreeItemElement(resource.element.handle);
            templateData.checkbox?.dispose();
            templateData.checkbox = undefined;
        }
        disposeTemplate(templateData) {
            templateData.resourceLabel.dispose();
            templateData.actionBar.dispose();
            templateData.elementDisposable.dispose();
        }
    };
    TreeRenderer = TreeRenderer_1 = __decorate([
        __param(7, themeService_1.IThemeService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, label_1.ILabelService),
        __param(10, hover_1.IHoverService),
        __param(11, treeViewsService_1.ITreeViewsService),
        __param(12, contextkey_1.IContextKeyService)
    ], TreeRenderer);
    class Aligner extends lifecycle_1.Disposable {
        constructor(themeService) {
            super();
            this.themeService = themeService;
        }
        set tree(tree) {
            this._tree = tree;
        }
        alignIconWithTwisty(treeItem) {
            if (treeItem.collapsibleState !== views_1.TreeItemCollapsibleState.None) {
                return false;
            }
            if (!this.hasIcon(treeItem)) {
                return false;
            }
            if (this._tree) {
                const parent = this._tree.getParentElement(treeItem) || this._tree.getInput();
                if (this.hasIcon(parent)) {
                    return !!parent.children && parent.children.some(c => c.collapsibleState !== views_1.TreeItemCollapsibleState.None && !this.hasIcon(c));
                }
                return !!parent.children && parent.children.every(c => c.collapsibleState === views_1.TreeItemCollapsibleState.None || !this.hasIcon(c));
            }
            else {
                return false;
            }
        }
        hasIcon(node) {
            const icon = this.themeService.getColorTheme().type === theme_1.ColorScheme.LIGHT ? node.icon : node.iconDark;
            if (icon) {
                return true;
            }
            if (node.resourceUri || node.themeIcon) {
                const fileIconTheme = this.themeService.getFileIconTheme();
                const isFolder = node.themeIcon ? node.themeIcon.id === themeService_1.FolderThemeIcon.id : node.collapsibleState !== views_1.TreeItemCollapsibleState.None;
                if (isFolder) {
                    return fileIconTheme.hasFileIcons && fileIconTheme.hasFolderIcons;
                }
                return fileIconTheme.hasFileIcons;
            }
            return false;
        }
    }
    class MultipleSelectionActionRunner extends actions_1.ActionRunner {
        constructor(notificationService, getSelectedResources) {
            super();
            this.getSelectedResources = getSelectedResources;
            this._register(this.onDidRun(e => {
                if (e.error && !(0, errors_1.isCancellationError)(e.error)) {
                    notificationService.error((0, nls_1.localize)('command-error', 'Error running command {1}: {0}. This is likely caused by the extension that contributes {1}.', e.error.message, e.action.id));
                }
            }));
        }
        async runAction(action, context) {
            const selection = this.getSelectedResources();
            let selectionHandleArgs = undefined;
            let actionInSelected = false;
            if (selection.length > 1) {
                selectionHandleArgs = selection.map(selected => {
                    if ((selected.handle === context.$treeItemHandle) || context.$selectedTreeItems) {
                        actionInSelected = true;
                    }
                    return { $treeViewId: context.$treeViewId, $treeItemHandle: selected.handle };
                });
            }
            if (!actionInSelected) {
                selectionHandleArgs = undefined;
            }
            await action.run(context, selectionHandleArgs);
        }
    }
    let TreeMenus = class TreeMenus {
        constructor(id, menuService) {
            this.id = id;
            this.menuService = menuService;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
        }
        getResourceActions(element, disposableStore) {
            const actions = this.getActions(actions_2.MenuId.ViewItemContext, element, disposableStore);
            return { menu: actions.menu, actions: actions.primary };
        }
        getResourceContextActions(element) {
            return this.getActions(actions_2.MenuId.ViewItemContext, element).secondary;
        }
        setContextKeyService(service) {
            this.contextKeyService = service;
        }
        getActions(menuId, element, listen) {
            if (!this.contextKeyService) {
                return { primary: [], secondary: [] };
            }
            const contextKeyService = this.contextKeyService.createOverlay([
                ['view', this.id],
                ['viewItem', element.contextValue]
            ]);
            const menu = this.menuService.createMenu(menuId, contextKeyService);
            const primary = [];
            const secondary = [];
            const result = { primary, secondary, menu };
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, result, 'inline');
            if (listen) {
                listen.add(menu.onDidChange(() => this._onDidChange.fire(element)));
                listen.add(menu);
            }
            else {
                menu.dispose();
            }
            return result;
        }
        dispose() {
            this.contextKeyService = undefined;
        }
    };
    TreeMenus = __decorate([
        __param(1, actions_2.IMenuService)
    ], TreeMenus);
    let CustomTreeView = class CustomTreeView extends AbstractTreeView {
        constructor(id, title, extensionId, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, contextKeyService, hoverService, extensionService, activityService, telemetryService, logService) {
            super(id, title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService);
            this.extensionId = extensionId;
            this.extensionService = extensionService;
            this.telemetryService = telemetryService;
            this.activated = false;
        }
        activate() {
            if (!this.activated) {
                this.telemetryService.publicLog2('Extension:ViewActivate', {
                    extensionId: new telemetryUtils_1.TelemetryTrustedValue(this.extensionId),
                    id: this.id,
                });
                this.createTree();
                this.progressService.withProgress({ location: this.id }, () => this.extensionService.activateByEvent(`onView:${this.id}`))
                    .then(() => (0, async_1.timeout)(2000))
                    .then(() => {
                    this.updateMessage();
                });
                this.activated = true;
            }
        }
    };
    exports.CustomTreeView = CustomTreeView;
    exports.CustomTreeView = CustomTreeView = __decorate([
        __param(3, themeService_1.IThemeService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, commands_1.ICommandService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, progress_1.IProgressService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, notification_1.INotificationService),
        __param(11, views_1.IViewDescriptorService),
        __param(12, contextkey_1.IContextKeyService),
        __param(13, hover_1.IHoverService),
        __param(14, extensions_1.IExtensionService),
        __param(15, activity_1.IActivityService),
        __param(16, telemetry_1.ITelemetryService),
        __param(17, log_1.ILogService)
    ], CustomTreeView);
    class TreeView extends AbstractTreeView {
        constructor() {
            super(...arguments);
            this.activated = false;
        }
        activate() {
            if (!this.activated) {
                this.createTree();
                this.activated = true;
            }
        }
    }
    exports.TreeView = TreeView;
    let CustomTreeViewDragAndDrop = class CustomTreeViewDragAndDrop {
        constructor(treeId, labelService, instantiationService, treeViewsDragAndDropService, logService) {
            this.treeId = treeId;
            this.labelService = labelService;
            this.instantiationService = instantiationService;
            this.treeViewsDragAndDropService = treeViewsDragAndDropService;
            this.logService = logService;
            this.treeItemsTransfer = dnd_3.LocalSelectionTransfer.getInstance();
            this.treeMimeType = `application/vnd.code.tree.${treeId.toLowerCase()}`;
        }
        set controller(controller) {
            this.dndController = controller;
        }
        handleDragAndLog(dndController, itemHandles, uuid, dragCancellationToken) {
            return dndController.handleDrag(itemHandles, uuid, dragCancellationToken).then(additionalDataTransfer => {
                if (additionalDataTransfer) {
                    const unlistedTypes = [];
                    for (const item of additionalDataTransfer) {
                        if ((item[0] !== this.treeMimeType) && (dndController.dragMimeTypes.findIndex(value => value === item[0]) < 0)) {
                            unlistedTypes.push(item[0]);
                        }
                    }
                    if (unlistedTypes.length) {
                        this.logService.warn(`Drag and drop controller for tree ${this.treeId} adds the following data transfer types but does not declare them in dragMimeTypes: ${unlistedTypes.join(', ')}`);
                    }
                }
                return additionalDataTransfer;
            });
        }
        addExtensionProvidedTransferTypes(originalEvent, itemHandles) {
            if (!originalEvent.dataTransfer || !this.dndController) {
                return;
            }
            const uuid = (0, uuid_1.generateUuid)();
            this.dragCancellationToken = new cancellation_1.CancellationTokenSource();
            this.treeViewsDragAndDropService.addDragOperationTransfer(uuid, this.handleDragAndLog(this.dndController, itemHandles, uuid, this.dragCancellationToken.token));
            this.treeItemsTransfer.setData([new treeViewsDnd_1.DraggedTreeItemsIdentifier(uuid)], treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype);
            originalEvent.dataTransfer.clearData(mime_1.Mimes.text);
            if (this.dndController.dragMimeTypes.find((element) => element === mime_1.Mimes.uriList)) {
                // Add the type that the editor knows
                originalEvent.dataTransfer?.setData(dnd_1.DataTransfers.RESOURCES, '');
            }
            this.dndController.dragMimeTypes.forEach(supportedType => {
                originalEvent.dataTransfer?.setData(supportedType, '');
            });
        }
        addResourceInfoToTransfer(originalEvent, resources) {
            if (resources.length && originalEvent.dataTransfer) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.instantiationService.invokeFunction(accessor => (0, dnd_2.fillEditorsDragData)(accessor, resources, originalEvent));
                // The only custom data transfer we set from the explorer is a file transfer
                // to be able to DND between multiple code file explorers across windows
                const fileResources = resources.filter(s => s.scheme === network_1.Schemas.file).map(r => r.fsPath);
                if (fileResources.length) {
                    originalEvent.dataTransfer.setData(dnd_3.CodeDataTransfers.FILES, JSON.stringify(fileResources));
                }
            }
        }
        onDragStart(data, originalEvent) {
            if (originalEvent.dataTransfer) {
                const treeItemsData = data.getData();
                const resources = [];
                const sourceInfo = {
                    id: this.treeId,
                    itemHandles: []
                };
                treeItemsData.forEach(item => {
                    sourceInfo.itemHandles.push(item.handle);
                    if (item.resourceUri) {
                        resources.push(uri_1.URI.revive(item.resourceUri));
                    }
                });
                this.addResourceInfoToTransfer(originalEvent, resources);
                this.addExtensionProvidedTransferTypes(originalEvent, sourceInfo.itemHandles);
                originalEvent.dataTransfer.setData(this.treeMimeType, JSON.stringify(sourceInfo));
            }
        }
        debugLog(types) {
            if (types.size) {
                this.logService.debug(`TreeView dragged mime types: ${Array.from(types).join(', ')}`);
            }
            else {
                this.logService.debug(`TreeView dragged with no supported mime types.`);
            }
        }
        onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
            const dataTransfer = (0, dnd_4.toExternalVSDataTransfer)(originalEvent.dataTransfer);
            const types = new Set(Array.from(dataTransfer, x => x[0]));
            if (originalEvent.dataTransfer) {
                // Also add uri-list if we have any files. At this stage we can't actually access the file itself though.
                for (const item of originalEvent.dataTransfer.items) {
                    if (item.kind === 'file' || item.type === dnd_1.DataTransfers.RESOURCES.toLowerCase()) {
                        types.add(mime_1.Mimes.uriList);
                        break;
                    }
                }
            }
            this.debugLog(types);
            const dndController = this.dndController;
            if (!dndController || !originalEvent.dataTransfer || (dndController.dropMimeTypes.length === 0)) {
                return false;
            }
            const dragContainersSupportedType = Array.from(types).some((value, index) => {
                if (value === this.treeMimeType) {
                    return true;
                }
                else {
                    return dndController.dropMimeTypes.indexOf(value) >= 0;
                }
            });
            if (dragContainersSupportedType) {
                return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, autoExpand: true };
            }
            return false;
        }
        getDragURI(element) {
            if (!this.dndController) {
                return null;
            }
            return element.resourceUri ? uri_1.URI.revive(element.resourceUri).toString() : element.handle;
        }
        getDragLabel(elements) {
            if (!this.dndController) {
                return undefined;
            }
            if (elements.length > 1) {
                return String(elements.length);
            }
            const element = elements[0];
            return element.label ? element.label.label : (element.resourceUri ? this.labelService.getUriLabel(uri_1.URI.revive(element.resourceUri)) : undefined);
        }
        async drop(data, targetNode, targetIndex, targetSector, originalEvent) {
            const dndController = this.dndController;
            if (!originalEvent.dataTransfer || !dndController) {
                return;
            }
            let treeSourceInfo;
            let willDropUuid;
            if (this.treeItemsTransfer.hasData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype)) {
                willDropUuid = this.treeItemsTransfer.getData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype)[0].identifier;
            }
            const originalDataTransfer = (0, dnd_4.toExternalVSDataTransfer)(originalEvent.dataTransfer, true);
            const outDataTransfer = new dataTransfer_1.VSDataTransfer();
            for (const [type, item] of originalDataTransfer) {
                if (type === this.treeMimeType || dndController.dropMimeTypes.includes(type) || (item.asFile() && dndController.dropMimeTypes.includes(dnd_1.DataTransfers.FILES.toLowerCase()))) {
                    outDataTransfer.append(type, item);
                    if (type === this.treeMimeType) {
                        try {
                            treeSourceInfo = JSON.parse(await item.asString());
                        }
                        catch {
                            // noop
                        }
                    }
                }
            }
            const additionalDataTransfer = await this.treeViewsDragAndDropService.removeDragOperationTransfer(willDropUuid);
            if (additionalDataTransfer) {
                for (const [type, item] of additionalDataTransfer) {
                    outDataTransfer.append(type, item);
                }
            }
            return dndController.handleDrop(outDataTransfer, targetNode, cancellation_1.CancellationToken.None, willDropUuid, treeSourceInfo?.id, treeSourceInfo?.itemHandles);
        }
        onDragEnd(originalEvent) {
            // Check if the drag was cancelled.
            if (originalEvent.dataTransfer?.dropEffect === 'none') {
                this.dragCancellationToken?.cancel();
            }
        }
        dispose() { }
    };
    exports.CustomTreeViewDragAndDrop = CustomTreeViewDragAndDrop;
    exports.CustomTreeViewDragAndDrop = CustomTreeViewDragAndDrop = __decorate([
        __param(1, label_1.ILabelService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, treeViewsDndService_1.ITreeViewsDnDService),
        __param(4, log_1.ILogService)
    ], CustomTreeViewDragAndDrop);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZVZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3ZpZXdzL3RyZWVWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF5RXpGLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQWEsU0FBUSxtQkFBUTtRQU16QyxZQUNDLE9BQTRCLEVBQ1IsaUJBQXFDLEVBQ3BDLGtCQUF1QyxFQUNyQyxvQkFBMkMsRUFDOUMsaUJBQXFDLEVBQ2pDLHFCQUE2QyxFQUM5QyxvQkFBMkMsRUFDbEQsYUFBNkIsRUFDOUIsWUFBMkIsRUFDdkIsZ0JBQW1DLEVBQ2hDLG1CQUF5QztZQUUvRCxLQUFLLENBQUMsRUFBRSxHQUFJLE9BQTRCLEVBQUUsV0FBVyxFQUFFLGdCQUFNLENBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUNoUixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQXlCLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFFLENBQUM7WUFDdEgsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFB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