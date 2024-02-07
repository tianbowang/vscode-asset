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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/registry/common/platform", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/base/browser/ui/splitview/paneview", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/linkedText", "vs/platform/opener/common/opener", "vs/base/browser/ui/button/button", "vs/platform/opener/browser/link", "vs/base/browser/ui/progressbar/progressbar", "vs/workbench/services/progress/browser/progressIndicator", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/uri", "vs/platform/theme/common/iconRegistry", "vs/base/common/codicons", "vs/workbench/browser/actions", "vs/platform/actions/browser/toolbar", "vs/workbench/browser/parts/views/viewFilter", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/instantiation/common/serviceCollection", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/paneviewlet"], function (require, exports, nls, event_1, colorRegistry_1, theme_1, dom_1, lifecycle_1, actions_1, actionbar_1, platform_1, keybinding_1, contextView_1, telemetry_1, themeService_1, themables_1, paneview_1, configuration_1, views_1, viewsService_1, contextkey_1, types_1, instantiation_1, actions_2, menuEntryActionViewItem_1, linkedText_1, opener_1, button_1, link_1, progressbar_1, progressIndicator_1, scrollableElement_1, uri_1, iconRegistry_1, codicons_1, actions_3, toolbar_1, viewFilter_1, actionViewItems_1, serviceCollection_1, defaultStyles_1) {
    "use strict";
    var ViewPane_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewAction = exports.FilterViewPane = exports.ViewPane = exports.VIEWPANE_FILTER_ACTION = exports.ViewPaneShowActions = void 0;
    var ViewPaneShowActions;
    (function (ViewPaneShowActions) {
        /** Show the actions when the view is hovered. This is the default behavior. */
        ViewPaneShowActions[ViewPaneShowActions["Default"] = 0] = "Default";
        /** Always shows the actions when the view is expanded */
        ViewPaneShowActions[ViewPaneShowActions["WhenExpanded"] = 1] = "WhenExpanded";
        /** Always shows the actions */
        ViewPaneShowActions[ViewPaneShowActions["Always"] = 2] = "Always";
    })(ViewPaneShowActions || (exports.ViewPaneShowActions = ViewPaneShowActions = {}));
    exports.VIEWPANE_FILTER_ACTION = new actions_1.Action('viewpane.action.filter');
    const viewPaneContainerExpandedIcon = (0, iconRegistry_1.registerIcon)('view-pane-container-expanded', codicons_1.Codicon.chevronDown, nls.localize('viewPaneContainerExpandedIcon', 'Icon for an expanded view pane container.'));
    const viewPaneContainerCollapsedIcon = (0, iconRegistry_1.registerIcon)('view-pane-container-collapsed', codicons_1.Codicon.chevronRight, nls.localize('viewPaneContainerCollapsedIcon', 'Icon for a collapsed view pane container.'));
    const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    let ViewWelcomeController = class ViewWelcomeController {
        get enabled() { return this._enabled; }
        constructor(container, delegate, instantiationService, openerService, telemetryService, contextKeyService) {
            this.container = container;
            this.delegate = delegate;
            this.instantiationService = instantiationService;
            this.openerService = openerService;
            this.telemetryService = telemetryService;
            this.contextKeyService = contextKeyService;
            this.items = [];
            this._enabled = false;
            this.disposables = new lifecycle_1.DisposableStore();
            this.enabledDisposables = this.disposables.add(new lifecycle_1.DisposableStore());
            this.renderDisposables = this.disposables.add(new lifecycle_1.DisposableStore());
            this.delegate.onDidChangeViewWelcomeState(this.onDidChangeViewWelcomeState, this, this.disposables);
            this.onDidChangeViewWelcomeState();
        }
        layout(height, width) {
            if (!this._enabled) {
                return;
            }
            this.element.style.height = `${height}px`;
            this.element.style.width = `${width}px`;
            this.element.classList.toggle('wide', width > 640);
            this.scrollableElement.scanDomNode();
        }
        focus() {
            if (!this._enabled) {
                return;
            }
            this.element.focus();
        }
        onDidChangeViewWelcomeState() {
            const enabled = this.delegate.shouldShowWelcome();
            if (this._enabled === enabled) {
                return;
            }
            this._enabled = enabled;
            if (!enabled) {
                this.enabledDisposables.clear();
                return;
            }
            this.container.classList.add('welcome');
            const viewWelcomeContainer = (0, dom_1.append)(this.container, (0, dom_1.$)('.welcome-view'));
            this.element = (0, dom_1.$)('.welcome-view-content', { tabIndex: 0 });
            this.scrollableElement = new scrollableElement_1.DomScrollableElement(this.element, { alwaysConsumeMouseWheel: true, horizontal: 2 /* ScrollbarVisibility.Hidden */, vertical: 3 /* ScrollbarVisibility.Visible */, });
            (0, dom_1.append)(viewWelcomeContainer, this.scrollableElement.getDomNode());
            this.enabledDisposables.add((0, lifecycle_1.toDisposable)(() => {
                this.container.classList.remove('welcome');
                this.scrollableElement.dispose();
                viewWelcomeContainer.remove();
                this.scrollableElement = undefined;
                this.element = undefined;
            }));
            this.contextKeyService.onDidChangeContext(this.onDidChangeContext, this, this.enabledDisposables);
            event_1.Event.chain(viewsRegistry.onDidChangeViewWelcomeContent, $ => $.filter(id => id === this.delegate.id))(this.onDidChangeViewWelcomeContent, this, this.enabledDisposables);
            this.onDidChangeViewWelcomeContent();
        }
        onDidChangeViewWelcomeContent() {
            const descriptors = viewsRegistry.getViewWelcomeContent(this.delegate.id);
            this.items = [];
            for (const descriptor of descriptors) {
                if (descriptor.when === 'default') {
                    this.defaultItem = { descriptor, visible: true };
                }
                else {
                    const visible = descriptor.when ? this.contextKeyService.contextMatchesRules(descriptor.when) : true;
                    this.items.push({ descriptor, visible });
                }
            }
            this.render();
        }
        onDidChangeContext() {
            let didChange = false;
            for (const item of this.items) {
                if (!item.descriptor.when || item.descriptor.when === 'default') {
                    continue;
                }
                const visible = this.contextKeyService.contextMatchesRules(item.descriptor.when);
                if (item.visible === visible) {
                    continue;
                }
                item.visible = visible;
                didChange = true;
            }
            if (didChange) {
                this.render();
            }
        }
        render() {
            this.renderDisposables.clear();
            this.element.innerText = '';
            const contents = this.getContentDescriptors();
            if (contents.length === 0) {
                this.container.classList.remove('welcome');
                this.scrollableElement.scanDomNode();
                return;
            }
            for (const { content, precondition } of contents) {
                const lines = content.split('\n');
                for (let line of lines) {
                    line = line.trim();
                    if (!line) {
                        continue;
                    }
                    const linkedText = (0, linkedText_1.parseLinkedText)(line);
                    if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== 'string') {
                        const node = linkedText.nodes[0];
                        const buttonContainer = (0, dom_1.append)(this.element, (0, dom_1.$)('.button-container'));
                        const button = new button_1.Button(buttonContainer, { title: node.title, supportIcons: true, ...defaultStyles_1.defaultButtonStyles });
                        button.label = node.label;
                        button.onDidClick(_ => {
                            this.telemetryService.publicLog2('views.welcomeAction', { viewId: this.delegate.id, uri: node.href });
                            this.openerService.open(node.href, { allowCommands: true });
                        }, null, this.renderDisposables);
                        this.renderDisposables.add(button);
                        if (precondition) {
                            const updateEnablement = () => button.enabled = this.contextKeyService.contextMatchesRules(precondition);
                            updateEnablement();
                            const keys = new Set(precondition.keys());
                            const onDidChangeContext = event_1.Event.filter(this.contextKeyService.onDidChangeContext, e => e.affectsSome(keys));
                            onDidChangeContext(updateEnablement, null, this.renderDisposables);
                        }
                    }
                    else {
                        const p = (0, dom_1.append)(this.element, (0, dom_1.$)('p'));
                        for (const node of linkedText.nodes) {
                            if (typeof node === 'string') {
                                (0, dom_1.append)(p, document.createTextNode(node));
                            }
                            else {
                                const link = this.renderDisposables.add(this.instantiationService.createInstance(link_1.Link, p, node, {}));
                                if (precondition && node.href.startsWith('command:')) {
                                    const updateEnablement = () => link.enabled = this.contextKeyService.contextMatchesRules(precondition);
                                    updateEnablement();
                                    const keys = new Set(precondition.keys());
                                    const onDidChangeContext = event_1.Event.filter(this.contextKeyService.onDidChangeContext, e => e.affectsSome(keys));
                                    onDidChangeContext(updateEnablement, null, this.renderDisposables);
                                }
                            }
                        }
                    }
                }
            }
            this.container.classList.add('welcome');
            this.scrollableElement.scanDomNode();
        }
        getContentDescriptors() {
            const visibleItems = this.items.filter(v => v.visible);
            if (visibleItems.length === 0 && this.defaultItem) {
                return [this.defaultItem.descriptor];
            }
            return visibleItems.map(v => v.descriptor);
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    ViewWelcomeController = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, opener_1.IOpenerService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, contextkey_1.IContextKeyService)
    ], ViewWelcomeController);
    let ViewPane = class ViewPane extends paneview_1.Pane {
        static { ViewPane_1 = this; }
        static { this.AlwaysShowActionsConfig = 'workbench.view.alwaysShowHeaderActions'; }
        get title() {
            return this._title;
        }
        get titleDescription() {
            return this._titleDescription;
        }
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService) {
            super({ ...options, ...{ orientation: viewDescriptorService.getViewLocationById(options.id) === 1 /* ViewContainerLocation.Panel */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */ } });
            this.keybindingService = keybindingService;
            this.contextMenuService = contextMenuService;
            this.configurationService = configurationService;
            this.contextKeyService = contextKeyService;
            this.viewDescriptorService = viewDescriptorService;
            this.instantiationService = instantiationService;
            this.openerService = openerService;
            this.themeService = themeService;
            this.telemetryService = telemetryService;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onDidChangeBodyVisibility = this._register(new event_1.Emitter());
            this.onDidChangeBodyVisibility = this._onDidChangeBodyVisibility.event;
            this._onDidChangeTitleArea = this._register(new event_1.Emitter());
            this.onDidChangeTitleArea = this._onDidChangeTitleArea.event;
            this._onDidChangeViewWelcomeState = this._register(new event_1.Emitter());
            this.onDidChangeViewWelcomeState = this._onDidChangeViewWelcomeState.event;
            this._isVisible = false;
            this.id = options.id;
            this._title = options.title;
            this._titleDescription = options.titleDescription;
            this.showActions = options.showActions ?? ViewPaneShowActions.Default;
            this.scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
            this.scopedContextKeyService.createKey('view', this.id);
            const viewLocationKey = this.scopedContextKeyService.createKey('viewLocation', (0, views_1.ViewContainerLocationToString)(viewDescriptorService.getViewLocationById(this.id)));
            this._register(event_1.Event.filter(viewDescriptorService.onDidChangeLocation, e => e.views.some(view => view.id === this.id))(() => viewLocationKey.set((0, views_1.ViewContainerLocationToString)(viewDescriptorService.getViewLocationById(this.id)))));
            this.menuActions = this._register(this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService])).createInstance(actions_3.CompositeMenuActions, options.titleMenuId ?? actions_2.MenuId.ViewTitle, actions_2.MenuId.ViewTitleContext, { shouldForwardArgs: !options.donotForwardArgs, renderShortTitle: true }));
            this._register(this.menuActions.onDidChange(() => this.updateActions()));
        }
        get headerVisible() {
            return super.headerVisible;
        }
        set headerVisible(visible) {
            super.headerVisible = visible;
            this.element.classList.toggle('merged-header', !visible);
        }
        setVisible(visible) {
            if (this._isVisible !== visible) {
                this._isVisible = visible;
                if (this.isExpanded()) {
                    this._onDidChangeBodyVisibility.fire(visible);
                }
            }
        }
        isVisible() {
            return this._isVisible;
        }
        isBodyVisible() {
            return this._isVisible && this.isExpanded();
        }
        setExpanded(expanded) {
            const changed = super.setExpanded(expanded);
            if (changed) {
                this._onDidChangeBodyVisibility.fire(expanded);
            }
            this.updateTwistyIcon();
            return changed;
        }
        render() {
            super.render();
            const focusTracker = (0, dom_1.trackFocus)(this.element);
            this._register(focusTracker);
            this._register(focusTracker.onDidFocus(() => this._onDidFocus.fire()));
            this._register(focusTracker.onDidBlur(() => this._onDidBlur.fire()));
        }
        renderHeader(container) {
            this.headerContainer = container;
            this.twistiesContainer = (0, dom_1.append)(container, (0, dom_1.$)(`.twisty-container${themables_1.ThemeIcon.asCSSSelector(this.getTwistyIcon(this.isExpanded()))}`));
            this.renderHeaderTitle(container, this.title);
            const actions = (0, dom_1.append)(container, (0, dom_1.$)('.actions'));
            actions.classList.toggle('show-always', this.showActions === ViewPaneShowActions.Always);
            actions.classList.toggle('show-expanded', this.showActions === ViewPaneShowActions.WhenExpanded);
            this.toolbar = this.instantiationService.createInstance(toolbar_1.WorkbenchToolBar, actions, {
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                actionViewItemProvider: action => this.getActionViewItem(action),
                ariaLabel: nls.localize('viewToolbarAriaLabel', "{0} actions", this.title),
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                renderDropdownAsChildElement: true,
                actionRunner: this.getActionRunner(),
                resetMenu: this.menuActions.menuId
            });
            this._register(this.toolbar);
            this.setActions();
            this._register((0, dom_1.addDisposableListener)(actions, dom_1.EventType.CLICK, e => e.preventDefault()));
            const viewContainerModel = this.viewDescriptorService.getViewContainerByViewId(this.id);
            if (viewContainerModel) {
                this._register(this.viewDescriptorService.getViewContainerModel(viewContainerModel).onDidChangeContainerInfo(({ title }) => this.updateTitle(this.title)));
            }
            else {
                console.error(`View container model not found for view ${this.id}`);
            }
            const onDidRelevantConfigurationChange = event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration(ViewPane_1.AlwaysShowActionsConfig));
            this._register(onDidRelevantConfigurationChange(this.updateActionsVisibility, this));
            this.updateActionsVisibility();
        }
        updateHeader() {
            super.updateHeader();
            this.updateTwistyIcon();
        }
        updateTwistyIcon() {
            if (this.twistiesContainer) {
                this.twistiesContainer.classList.remove(...themables_1.ThemeIcon.asClassNameArray(this.getTwistyIcon(!this._expanded)));
                this.twistiesContainer.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.getTwistyIcon(this._expanded)));
            }
        }
        getTwistyIcon(expanded) {
            return expanded ? viewPaneContainerExpandedIcon : viewPaneContainerCollapsedIcon;
        }
        style(styles) {
            super.style(styles);
            const icon = this.getIcon();
            if (this.iconContainer) {
                const fgColor = (0, dom_1.asCssValueWithDefault)(styles.headerForeground, (0, colorRegistry_1.asCssVariable)(colorRegistry_1.foreground));
                if (uri_1.URI.isUri(icon)) {
                    // Apply background color to activity bar item provided with iconUrls
                    this.iconContainer.style.backgroundColor = fgColor;
                    this.iconContainer.style.color = '';
                }
                else {
                    // Apply foreground color to activity bar items provided with codicons
                    this.iconContainer.style.color = fgColor;
                    this.iconContainer.style.backgroundColor = '';
                }
            }
        }
        getIcon() {
            return this.viewDescriptorService.getViewDescriptorById(this.id)?.containerIcon || views_1.defaultViewIcon;
        }
        renderHeaderTitle(container, title) {
            this.iconContainer = (0, dom_1.append)(container, (0, dom_1.$)('.icon', undefined));
            const icon = this.getIcon();
            let cssClass = undefined;
            if (uri_1.URI.isUri(icon)) {
                cssClass = `view-${this.id.replace(/[\.\:]/g, '-')}`;
                const iconClass = `.pane-header .icon.${cssClass}`;
                (0, dom_1.createCSSRule)(iconClass, `
				mask: ${(0, dom_1.asCSSUrl)(icon)} no-repeat 50% 50%;
				mask-size: 24px;
				-webkit-mask: ${(0, dom_1.asCSSUrl)(icon)} no-repeat 50% 50%;
				-webkit-mask-size: 16px;
			`);
            }
            else if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                cssClass = themables_1.ThemeIcon.asClassName(icon);
            }
            if (cssClass) {
                this.iconContainer.classList.add(...cssClass.split(' '));
            }
            const calculatedTitle = this.calculateTitle(title);
            this.titleContainer = (0, dom_1.append)(container, (0, dom_1.$)('h3.title', { title: calculatedTitle }, calculatedTitle));
            if (this._titleDescription) {
                this.setTitleDescription(this._titleDescription);
            }
            this.iconContainer.title = calculatedTitle;
            this.iconContainer.setAttribute('aria-label', calculatedTitle);
        }
        updateTitle(title) {
            const calculatedTitle = this.calculateTitle(title);
            if (this.titleContainer) {
                this.titleContainer.textContent = calculatedTitle;
                this.titleContainer.setAttribute('title', calculatedTitle);
            }
            if (this.iconContainer) {
                this.iconContainer.title = calculatedTitle;
                this.iconContainer.setAttribute('aria-label', calculatedTitle);
            }
            this._title = title;
            this._onDidChangeTitleArea.fire();
        }
        setTitleDescription(description) {
            if (this.titleDescriptionContainer) {
                this.titleDescriptionContainer.textContent = description ?? '';
                this.titleDescriptionContainer.setAttribute('title', description ?? '');
            }
            else if (description && this.titleContainer) {
                this.titleDescriptionContainer = (0, dom_1.after)(this.titleContainer, (0, dom_1.$)('span.description', { title: description }, description));
            }
        }
        updateTitleDescription(description) {
            this.setTitleDescription(description);
            this._titleDescription = description;
            this._onDidChangeTitleArea.fire();
        }
        calculateTitle(title) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(this.id);
            const model = this.viewDescriptorService.getViewContainerModel(viewContainer);
            const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(this.id);
            const isDefault = this.viewDescriptorService.getDefaultContainerById(this.id) === viewContainer;
            if (!isDefault && viewDescriptor?.containerTitle && model.title !== viewDescriptor.containerTitle) {
                return `${viewDescriptor.containerTitle}: ${title}`;
            }
            return title;
        }
        renderBody(container) {
            this.viewWelcomeController = this._register(new ViewWelcomeController(container, this, this.instantiationService, this.openerService, this.telemetryService, this.contextKeyService));
        }
        layoutBody(height, width) {
            this.viewWelcomeController.layout(height, width);
        }
        onDidScrollRoot() {
            // noop
        }
        getProgressIndicator() {
            if (this.progressBar === undefined) {
                // Progress bar
                this.progressBar = this._register(new progressbar_1.ProgressBar(this.element, defaultStyles_1.defaultProgressBarStyles));
                this.progressBar.hide();
            }
            if (this.progressIndicator === undefined) {
                const that = this;
                this.progressIndicator = new progressIndicator_1.ScopedProgressIndicator((0, types_1.assertIsDefined)(this.progressBar), new class extends progressIndicator_1.AbstractProgressScope {
                    constructor() {
                        super(that.id, that.isBodyVisible());
                        this._register(that.onDidChangeBodyVisibility(isVisible => isVisible ? this.onScopeOpened(that.id) : this.onScopeClosed(that.id)));
                    }
                }());
            }
            return this.progressIndicator;
        }
        getProgressLocation() {
            return this.viewDescriptorService.getViewContainerByViewId(this.id).id;
        }
        getBackgroundColor() {
            switch (this.viewDescriptorService.getViewLocationById(this.id)) {
                case 1 /* ViewContainerLocation.Panel */:
                    return theme_1.PANEL_BACKGROUND;
                case 0 /* ViewContainerLocation.Sidebar */:
                case 2 /* ViewContainerLocation.AuxiliaryBar */:
                    return theme_1.SIDE_BAR_BACKGROUND;
            }
            return theme_1.SIDE_BAR_BACKGROUND;
        }
        focus() {
            (0, dom_1.focusWindow)(this.element);
            if (this.viewWelcomeController.enabled) {
                this.viewWelcomeController.focus();
            }
            else if (this.element) {
                this.element.focus();
                this._onDidFocus.fire();
            }
        }
        setActions() {
            if (this.toolbar) {
                const primaryActions = [...this.menuActions.getPrimaryActions()];
                if (this.shouldShowFilterInHeader()) {
                    primaryActions.unshift(exports.VIEWPANE_FILTER_ACTION);
                }
                this.toolbar.setActions((0, actionbar_1.prepareActions)(primaryActions), (0, actionbar_1.prepareActions)(this.menuActions.getSecondaryActions()));
                this.toolbar.context = this.getActionsContext();
            }
        }
        updateActionsVisibility() {
            if (!this.headerContainer) {
                return;
            }
            const shouldAlwaysShowActions = this.configurationService.getValue('workbench.view.alwaysShowHeaderActions');
            this.headerContainer.classList.toggle('actions-always-visible', shouldAlwaysShowActions);
        }
        updateActions() {
            this.setActions();
            this._onDidChangeTitleArea.fire();
        }
        getActionViewItem(action, options) {
            if (action.id === exports.VIEWPANE_FILTER_ACTION.id) {
                const that = this;
                return new class extends actionViewItems_1.BaseActionViewItem {
                    constructor() { super(null, action); }
                    setFocusable() { }
                    get trapsArrowNavigation() { return true; }
                    render(container) {
                        container.classList.add('viewpane-filter-container');
                        (0, dom_1.append)(container, that.getFilterWidget().element);
                    }
                };
            }
            return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action, { ...options, ...{ menuAsChild: action instanceof actions_2.SubmenuItemAction } });
        }
        getActionsContext() {
            return undefined;
        }
        getActionRunner() {
            return undefined;
        }
        getOptimalWidth() {
            return 0;
        }
        saveState() {
            // Subclasses to implement for saving state
        }
        shouldShowWelcome() {
            return false;
        }
        getFilterWidget() {
            return undefined;
        }
        shouldShowFilterInHeader() {
            return false;
        }
    };
    exports.ViewPane = ViewPane;
    exports.ViewPane = ViewPane = ViewPane_1 = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService)
    ], ViewPane);
    let FilterViewPane = class FilterViewPane extends ViewPane {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.filterWidget = this._register(instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService])).createInstance(viewFilter_1.FilterWidget, options.filterOptions));
        }
        getFilterWidget() {
            return this.filterWidget;
        }
        renderBody(container) {
            super.renderBody(container);
            this.filterContainer = (0, dom_1.append)(container, (0, dom_1.$)('.viewpane-filter-container'));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.dimension = new dom_1.Dimension(width, height);
            const wasFilterShownInHeader = !this.filterContainer?.hasChildNodes();
            const shouldShowFilterInHeader = this.shouldShowFilterInHeader();
            if (wasFilterShownInHeader !== shouldShowFilterInHeader) {
                if (shouldShowFilterInHeader) {
                    (0, dom_1.reset)(this.filterContainer);
                }
                this.updateActions();
                if (!shouldShowFilterInHeader) {
                    (0, dom_1.append)(this.filterContainer, this.filterWidget.element);
                }
            }
            if (!shouldShowFilterInHeader) {
                height = height - 44;
            }
            this.filterWidget.layout(width);
            this.layoutBodyContent(height, width);
        }
        shouldShowFilterInHeader() {
            return !(this.dimension && this.dimension.width < 600 && this.dimension.height > 100);
        }
    };
    exports.FilterViewPane = FilterViewPane;
    exports.FilterViewPane = FilterViewPane = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService)
    ], FilterViewPane);
    class ViewAction extends actions_2.Action2 {
        constructor(desc) {
            super(desc);
            this.desc = desc;
        }
        run(accessor, ...args) {
            const view = accessor.get(viewsService_1.IViewsService).getActiveViewWithId(this.desc.viewId);
            if (view) {
                return this.runInView(accessor, view, ...args);
            }
        }
    }
    exports.ViewAction = ViewAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld1BhbmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3ZpZXdzL3ZpZXdQYW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErQ2hHLElBQVksbUJBU1g7SUFURCxXQUFZLG1CQUFtQjtRQUM5QiwrRUFBK0U7UUFDL0UsbUVBQU8sQ0FBQTtRQUVQLHlEQUF5RDtRQUN6RCw2RUFBWSxDQUFBO1FBRVosK0JBQStCO1FBQy9CLGlFQUFNLENBQUE7SUFDUCxDQUFDLEVBVFcsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFTOUI7SUFhWSxRQUFBLHNCQUFzQixHQUFHLElBQUksZ0JBQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBUzNFLE1BQU0sNkJBQTZCLEdBQUcsSUFBQSwyQkFBWSxFQUFDLDhCQUE4QixFQUFFLGtCQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUsMkNBQTJDLENBQUMsQ0FBQyxDQUFDO0lBQ3BNLE1BQU0sOEJBQThCLEdBQUcsSUFBQSwyQkFBWSxFQUFDLCtCQUErQixFQUFFLGtCQUFPLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLEVBQUUsMkNBQTJDLENBQUMsQ0FBQyxDQUFDO0lBRXhNLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQWF6RixJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFxQjtRQUsxQixJQUFJLE9BQU8sS0FBYyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBU2hELFlBQ2tCLFNBQXNCLEVBQ3RCLFFBQThCLEVBQ3hCLG9CQUFtRCxFQUMxRCxhQUF1QyxFQUNwQyxnQkFB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