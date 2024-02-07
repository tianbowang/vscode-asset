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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/list/listWidget", "vs/base/common/actions", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/themables", "vs/base/common/types", "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer", "vs/nls", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/views", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/browser/explorerProjections/listProjection", "vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay", "vs/workbench/contrib/testing/browser/explorerProjections/testingObjectTree", "vs/workbench/contrib/testing/browser/explorerProjections/treeProjection", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/testExplorerActions", "vs/workbench/contrib/testing/browser/testingExplorerFilter", "vs/workbench/contrib/testing/browser/testingProgressUiService", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/constants", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testExplorerFilterState", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingContinuousRunService", "vs/workbench/contrib/testing/common/testingPeekOpener", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/css!./media/testing"], function (require, exports, dom, actionbar_1, button_1, iconLabels_1, listWidget_1, actions_1, arraysFind_1, async_1, color_1, event_1, lifecycle_1, strings_1, themables_1, types_1, markdownRenderer_1, nls_1, dropdownWithPrimaryActionViewItem_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, opener_1, progress_1, storage_1, telemetry_1, defaultStyles_1, colorRegistry_1, iconRegistry_1, themeService_1, uriIdentity_1, widgetNavigationCommands_1, viewPane_1, diffEditorInput_1, views_1, index_1, listProjection_1, testItemContextOverlay_1, testingObjectTree_1, treeProjection_1, icons, testExplorerActions_1, testingExplorerFilter_1, testingProgressUiService_1, configuration_2, constants_1, storedValue_1, testExplorerFilterState_1, testId_1, testProfileService_1, testResult_1, testResultService_1, testService_1, testingContextKeys_1, testingContinuousRunService_1, testingPeekOpener_1, testingStates_1, activity_1, editorService_1) {
    "use strict";
    var ErrorRenderer_1, TestItemRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingExplorerView = void 0;
    var LastFocusState;
    (function (LastFocusState) {
        LastFocusState[LastFocusState["Input"] = 0] = "Input";
        LastFocusState[LastFocusState["Tree"] = 1] = "Tree";
    })(LastFocusState || (LastFocusState = {}));
    let TestingExplorerView = class TestingExplorerView extends viewPane_1.ViewPane {
        get focusedTreeElements() {
            return this.viewModel.tree.getFocus().filter(types_1.isDefined);
        }
        constructor(options, contextMenuService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, testService, telemetryService, testProfileService, commandService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.testService = testService;
            this.testProfileService = testProfileService;
            this.commandService = commandService;
            this.filterActionBar = this._register(new lifecycle_1.MutableDisposable());
            this.discoveryProgress = this._register(new lifecycle_1.MutableDisposable());
            this.filter = this._register(new lifecycle_1.MutableDisposable());
            this.filterFocusListener = this._register(new lifecycle_1.MutableDisposable());
            this.dimensions = { width: 0, height: 0 };
            this.lastFocusState = 0 /* LastFocusState.Input */;
            const relayout = this._register(new async_1.RunOnceScheduler(() => this.layoutBody(), 1));
            this._register(this.onDidChangeViewWelcomeState(() => {
                if (!this.shouldShowWelcome()) {
                    relayout.schedule();
                }
            }));
            this._register(testService.collection.onBusyProvidersChange(busy => {
                this.updateDiscoveryProgress(busy);
            }));
            this._register(testProfileService.onDidChange(() => this.updateActions()));
        }
        shouldShowWelcome() {
            return this.viewModel?.welcomeExperience === 1 /* WelcomeExperience.ForWorkspace */ ?? true;
        }
        focus() {
            super.focus();
            if (this.lastFocusState === 1 /* LastFocusState.Tree */) {
                this.viewModel.tree.domFocus();
            }
            else {
                this.filter.value?.focus();
            }
        }
        /**
         * Gets include/exclude items in the tree, based either on visible tests
         * or a use selection.
         */
        getTreeIncludeExclude(withinItems, profile, filterToType = 'visible') {
            const projection = this.viewModel.projection.value;
            if (!projection) {
                return { include: [], exclude: [] };
            }
            // To calculate includes and excludes, we include the first children that
            // have a majority of their items included too, and then apply exclusions.
            const include = new Set();
            const exclude = [];
            const attempt = (element, alreadyIncluded) => {
                // sanity check hasElement since updates are debounced and they may exist
                // but not be rendered yet
                if (!(element instanceof index_1.TestItemTreeElement) || !this.viewModel.tree.hasElement(element)) {
                    return;
                }
                // If the current node is not visible or runnable in the current profile, it's excluded
                const inTree = this.viewModel.tree.getNode(element);
                if (!inTree.visible) {
                    if (alreadyIncluded) {
                        exclude.push(element.test);
                    }
                    return;
                }
                // If it's not already included but most of its children are, then add it
                // if it can be run under the current profile (when specified)
                if (
                // If it's not already included...
                !alreadyIncluded
                    // And it can be run using the current profile (if any)
                    && (!profile || (0, testProfileService_1.canUseProfileWithTest)(profile, element.test))
                    // And either it's a leaf node or most children are included, the  include it.
                    && (inTree.children.length === 0 || inTree.visibleChildrenCount * 2 >= inTree.children.length)
                    // And not if we're only showing a single of its children, since it
                    // probably fans out later. (Worse case we'll directly include its single child)
                    && inTree.visibleChildrenCount !== 1) {
                    include.add(element.test);
                    alreadyIncluded = true;
                }
                // Recurse ✨
                for (const child of element.children) {
                    attempt(child, alreadyIncluded);
                }
            };
            if (filterToType === 'selected') {
                const sel = this.viewModel.tree.getSelection().filter(types_1.isDefined);
                if (sel.length) {
                    L: for (const node of sel) {
                        if (node instanceof index_1.TestItemTreeElement) {
                            // avoid adding an item if its parent is already included
                            for (let i = node; i; i = i.parent) {
                                if (include.has(i.test)) {
                                    continue L;
                                }
                            }
                            include.add(node.test);
                            node.children.forEach(c => attempt(c, true));
                        }
                    }
                    return { include: [...include], exclude };
                }
            }
            for (const root of withinItems || this.testService.collection.rootItems) {
                const element = projection.getElementByTestId(root.item.extId);
                if (!element) {
                    continue;
                }
                if (profile && !(0, testProfileService_1.canUseProfileWithTest)(profile, root)) {
                    continue;
                }
                // single controllers won't have visible root ID nodes, handle that  case specially
                if (!this.viewModel.tree.hasElement(element)) {
                    const visibleChildren = [...element.children].reduce((acc, c) => this.viewModel.tree.hasElement(c) && this.viewModel.tree.getNode(c).visible ? acc + 1 : acc, 0);
                    // note we intentionally check children > 0 here, unlike above, since
                    // we don't want to bother dispatching to controllers who have no discovered tests
                    if (element.children.size > 0 && visibleChildren * 2 >= element.children.size) {
                        include.add(element.test);
                        element.children.forEach(c => attempt(c, true));
                    }
                    else {
                        element.children.forEach(c => attempt(c, false));
                    }
                }
                else {
                    attempt(element, false);
                }
            }
            return { include: [...include], exclude };
        }
        render() {
            super.render();
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [this],
                focusNextWidget: () => {
                    if (!this.viewModel.tree.isDOMFocused()) {
                        this.viewModel.tree.domFocus();
                    }
                },
                focusPreviousWidget: () => {
                    if (this.viewModel.tree.isDOMFocused()) {
                        this.filter.value?.focus();
                    }
                }
            }));
        }
        /**
         * @override
         */
        renderBody(container) {
            super.renderBody(container);
            this.container = dom.append(container, dom.$('.test-explorer'));
            this.treeHeader = dom.append(this.container, dom.$('.test-explorer-header'));
            this.filterActionBar.value = this.createFilterActionBar();
            const messagesContainer = dom.append(this.treeHeader, dom.$('.result-summary-container'));
            this._register(this.instantiationService.createInstance(ResultSummaryView, messagesContainer));
            const listContainer = dom.append(this.container, dom.$('.test-explorer-tree'));
            this.viewModel = this.instantiationService.createInstance(TestingExplorerViewModel, listContainer, this.onDidChangeBodyVisibility);
            this._register(this.viewModel.tree.onDidFocus(() => this.lastFocusState = 1 /* LastFocusState.Tree */));
            this._register(this.viewModel.onChangeWelcomeVisibility(() => this._onDidChangeViewWelcomeState.fire()));
            this._register(this.viewModel);
            this._onDidChangeViewWelcomeState.fire();
        }
        /** @override  */
        getActionViewItem(action) {
            switch (action.id) {
                case "workbench.actions.treeView.testExplorer.filter" /* TestCommandId.FilterAction */:
                    this.filter.value = this.instantiationService.createInstance(testingExplorerFilter_1.TestingExplorerFilter, action);
                    this.filterFocusListener.value = this.filter.value.onDidFocus(() => this.lastFocusState = 0 /* LastFocusState.Input */);
                    return this.filter.value;
                case "testing.runSelected" /* TestCommandId.RunSelectedAction */:
                    return this.getRunGroupDropdown(2 /* TestRunProfileBitset.Run */, action);
                case "testing.debugSelected" /* TestCommandId.DebugSelectedAction */:
                    return this.getRunGroupDropdown(4 /* TestRunProfileBitset.Debug */, action);
                default:
                    return super.getActionViewItem(action);
            }
        }
        /** @inheritdoc */
        getTestConfigGroupActions(group) {
            const profileActions = [];
            let participatingGroups = 0;
            let hasConfigurable = false;
            const defaults = this.testProfileService.getGroupDefaultProfiles(group);
            for (const { profiles, controller } of this.testProfileService.all()) {
                let hasAdded = false;
                for (const profile of profiles) {
                    if (profile.group !== group) {
                        continue;
                    }
                    if (!hasAdded) {
                        hasAdded = true;
                        participatingGroups++;
                        profileActions.push(new actions_1.Action(`${controller.id}.$root`, controller.label.value, undefined, false));
                    }
                    hasConfigurable = hasConfigurable || profile.hasConfigurationHandler;
                    profileActions.push(new actions_1.Action(`${controller.id}.${profile.profileId}`, defaults.includes(profile) ? (0, nls_1.localize)('defaultTestProfile', '{0} (Default)', profile.label) : profile.label, undefined, undefined, () => {
                        const { include, exclude } = this.getTreeIncludeExclude(undefined, profile);
                        this.testService.runResolvedTests({
                            exclude: exclude.map(e => e.item.extId),
                            targets: [{
                                    profileGroup: profile.group,
                                    profileId: profile.profileId,
                                    controllerId: profile.controllerId,
                                    testIds: include.map(i => i.item.extId),
                                }]
                        });
                    }));
                }
            }
            // If there's only one group, don't add a heading for it in the dropdown.
            if (participatingGroups === 1) {
                profileActions.shift();
            }
            const postActions = [];
            if (profileActions.length > 1) {
                postActions.push(new actions_1.Action('selectDefaultTestConfigurations', (0, nls_1.localize)('selectDefaultConfigs', 'Select Default Profile'), undefined, undefined, () => this.commandService.executeCommand("testing.selectDefaultTestProfiles" /* TestCommandId.SelectDefaultTestProfiles */, group)));
            }
            if (hasConfigurable) {
                postActions.push(new actions_1.Action('configureTestProfiles', (0, nls_1.localize)('configureTestProfiles', 'Configure Test Profiles'), undefined, undefined, () => this.commandService.executeCommand("testing.configureProfile" /* TestCommandId.ConfigureTestProfilesAction */, group)));
            }
            return actions_1.Separator.join(profileActions, postActions);
        }
        /**
         * @override
         */
        saveState() {
            this.filter.value?.saveState();
            super.saveState();
        }
        getRunGroupDropdown(group, defaultAction) {
            const dropdownActions = this.getTestConfigGroupActions(group);
            if (dropdownActions.length < 2) {
                return super.getActionViewItem(defaultAction);
            }
            const primaryAction = this.instantiationService.createInstance(actions_2.MenuItemAction, {
                id: defaultAction.id,
                title: defaultAction.label,
                icon: group === 2 /* TestRunProfileBitset.Run */
                    ? icons.testingRunAllIcon
                    : icons.testingDebugAllIcon,
            }, undefined, undefined, undefined);
            const dropdownAction = new actions_1.Action('selectRunConfig', 'Select Configuration...', 'codicon-chevron-down', true);
            return this.instantiationService.createInstance(dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem, primaryAction, dropdownAction, dropdownActions, '', this.contextMenuService, {});
        }
        createFilterActionBar() {
            const bar = new actionbar_1.ActionBar(this.treeHeader, {
                actionViewItemProvider: action => this.getActionViewItem(action),
                triggerKeys: { keyDown: false, keys: [] },
            });
            bar.push(new actions_1.Action("workbench.actions.treeView.testExplorer.filter" /* TestCommandId.FilterAction */));
            bar.getContainer().classList.add('testing-filter-action-bar');
            return bar;
        }
        updateDiscoveryProgress(busy) {
            if (!busy && this.discoveryProgress) {
                this.discoveryProgress.clear();
            }
            else if (busy && !this.discoveryProgress.value) {
                this.discoveryProgress.value = this.instantiationService.createInstance(progress_1.UnmanagedProgress, { location: this.getProgressLocation() });
            }
        }
        /**
         * @override
         */
        layoutBody(height = this.dimensions.height, width = this.dimensions.width) {
            super.layoutBody(height, width);
            this.dimensions.height = height;
            this.dimensions.width = width;
            this.container.style.height = `${height}px`;
            this.viewModel?.layout(height - this.treeHeader.clientHeight, width);
            this.filter.value?.layout(width);
        }
    };
    exports.TestingExplorerView = TestingExplorerView;
    exports.TestingExplorerView = TestingExplorerView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, testService_1.ITestService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, testProfileService_1.ITestProfileService),
        __param(12, commands_1.ICommandService)
    ], TestingExplorerView);
    const SUMMARY_RENDER_INTERVAL = 200;
    let ResultSummaryView = class ResultSummaryView extends lifecycle_1.Disposable {
        constructor(container, resultService, activityService, crService, configurationService, instantiationService) {
            super();
            this.container = container;
            this.resultService = resultService;
            this.activityService = activityService;
            this.crService = crService;
            this.elementsWereAttached = false;
            this.badgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.renderLoop = this._register(new async_1.RunOnceScheduler(() => this.render(), SUMMARY_RENDER_INTERVAL));
            this.elements = dom.h('div.result-summary', [
                dom.h('div@status'),
                dom.h('div@count'),
                dom.h('div@count'),
                dom.h('span'),
                dom.h('duration@duration'),
                dom.h('a@rerun'),
            ]);
            this.badgeType = configurationService.getValue("testing.countBadge" /* TestingConfigKeys.CountBadge */);
            this._register(resultService.onResultsChanged(this.render, this));
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("testing.countBadge" /* TestingConfigKeys.CountBadge */)) {
                    this.badgeType = configurationService.getValue("testing.countBadge" /* TestingConfigKeys.CountBadge */);
                    this.render();
                }
            }));
            const ab = this._register(new actionbar_1.ActionBar(this.elements.rerun, {
                actionViewItemProvider: action => (0, menuEntryActionViewItem_1.createActionViewItem)(instantiationService, action),
            }));
            ab.push(instantiationService.createInstance(actions_2.MenuItemAction, { ...new testExplorerActions_1.ReRunLastRun().desc, icon: icons.testingRerunIcon }, { ...new testExplorerActions_1.DebugLastRun().desc, icon: icons.testingDebugIcon }, {}, undefined), { icon: true, label: false });
            this.render();
        }
        render() {
            const { results } = this.resultService;
            const { count, root, status, duration, rerun } = this.elements;
            if (!results.length) {
                if (this.elementsWereAttached) {
                    this.container.removeChild(root);
                    this.elementsWereAttached = false;
                }
                this.container.innerText = (0, nls_1.localize)('noResults', 'No test results yet.');
                this.badgeDisposable.clear();
                return;
            }
            const live = results.filter(r => !r.completedAt);
            let counts;
            if (live.length) {
                status.className = themables_1.ThemeIcon.asClassName(iconRegistry_1.spinningLoading);
                counts = (0, testingProgressUiService_1.collectTestStateCounts)(true, live);
                this.renderLoop.schedule();
                const last = live[live.length - 1];
                duration.textContent = formatDuration(Date.now() - last.startedAt);
                rerun.style.display = 'none';
            }
            else {
                const last = results[0];
                const dominantState = (0, arraysFind_1.mapFindFirst)(testingStates_1.statesInOrder, s => last.counts[s] > 0 ? s : undefined);
                status.className = themables_1.ThemeIcon.asClassName(icons.testingStatesToIcons.get(dominantState ?? 0 /* TestResultState.Unset */));
                counts = (0, testingProgressUiService_1.collectTestStateCounts)(false, [last]);
                duration.textContent = last instanceof testResult_1.LiveTestResult ? formatDuration(last.completedAt - last.startedAt) : '';
                rerun.style.display = 'block';
            }
            count.textContent = `${counts.passed}/${counts.totalWillBeRun}`;
            count.title = (0, testingProgressUiService_1.getTestProgressText)(counts);
            this.renderActivityBadge(counts);
            if (!this.elementsWereAttached) {
                dom.clearNode(this.container);
                this.container.appendChild(root);
                this.elementsWereAttached = true;
            }
        }
        renderActivityBadge(countSummary) {
            if (countSummary && this.badgeType !== "off" /* TestingCountBadge.Off */ && countSummary[this.badgeType] !== 0) {
                if (this.lastBadge instanceof activity_1.NumberBadge && this.lastBadge.number === countSummary[this.badgeType]) {
                    return;
                }
                this.lastBadge = new activity_1.NumberBadge(countSummary[this.badgeType], num => this.getLocalizedBadgeString(this.badgeType, num));
            }
            else if (this.crService.isEnabled()) {
                if (this.lastBadge instanceof activity_1.IconBadge && this.lastBadge.icon === icons.testingContinuousIsOn) {
                    return;
                }
                this.lastBadge = new activity_1.IconBadge(icons.testingContinuousIsOn, () => (0, nls_1.localize)('testingContinuousBadge', 'Tests are being watched for changes'));
            }
            else {
                if (!this.lastBadge) {
                    return;
                }
                this.lastBadge = undefined;
            }
            this.badgeDisposable.value = this.lastBadge && this.activityService.showViewActivity("workbench.view.testing" /* Testing.ExplorerViewId */, { badge: this.lastBadge });
        }
        getLocalizedBadgeString(countBadgeType, count) {
            switch (countBadgeType) {
                case "passed" /* TestingCountBadge.Passed */:
                    return (0, nls_1.localize)('testingCountBadgePassed', '{0} passed tests', count);
                case "skipped" /* TestingCountBadge.Skipped */:
                    return (0, nls_1.localize)('testingCountBadgeSkipped', '{0} skipped tests', count);
                default:
                    return (0, nls_1.localize)('testingCountBadgeFailed', '{0} failed tests', count);
            }
        }
    };
    ResultSummaryView = __decorate([
        __param(1, testResultService_1.ITestResultService),
        __param(2, activity_1.IActivityService),
        __param(3, testingContinuousRunService_1.ITestingContinuousRunService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService)
    ], ResultSummaryView);
    var WelcomeExperience;
    (function (WelcomeExperience) {
        WelcomeExperience[WelcomeExperience["None"] = 0] = "None";
        WelcomeExperience[WelcomeExperience["ForWorkspace"] = 1] = "ForWorkspace";
        WelcomeExperience[WelcomeExperience["ForDocument"] = 2] = "ForDocument";
    })(WelcomeExperience || (WelcomeExperience = {}));
    let TestingExplorerViewModel = class TestingExplorerViewModel extends lifecycle_1.Disposable {
        get viewMode() {
            return this._viewMode.get() ?? "true" /* TestExplorerViewMode.Tree */;
        }
        set viewMode(newMode) {
            if (newMode === this._viewMode.get()) {
                return;
            }
            this._viewMode.set(newMode);
            this.updatePreferredProjection();
            this.storageService.store('testing.viewMode', newMode, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        get viewSorting() {
            return this._viewSorting.get() ?? "status" /* TestExplorerViewSorting.ByStatus */;
        }
        set viewSorting(newSorting) {
            if (newSorting === this._viewSorting.get()) {
                return;
            }
            this._viewSorting.set(newSorting);
            this.tree.resort(null);
            this.storageService.store('testing.viewSorting', newSorting, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        constructor(listContainer, onDidChangeVisibility, configurationService, editorService, menuService, contextMenuService, testService, filterState, instantiationService, storageService, contextKeyService, testResults, peekOpener, testProfileService, crService, commandService) {
            super();
            this.menuService = menuService;
            this.contextMenuService = contextMenuService;
            this.testService = testService;
            this.filterState = filterState;
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.contextKeyService = contextKeyService;
            this.testResults = testResults;
            this.peekOpener = peekOpener;
            this.testProfileService = testProfileService;
            this.crService = crService;
            this.projection = this._register(new lifecycle_1.MutableDisposable());
            this.revealTimeout = new lifecycle_1.MutableDisposable();
            this._viewMode = testingContextKeys_1.TestingContextKeys.viewMode.bindTo(this.contextKeyService);
            this._viewSorting = testingContextKeys_1.TestingContextKeys.viewSorting.bindTo(this.contextKeyService);
            this.welcomeVisibilityEmitter = new event_1.Emitter();
            this.actionRunner = new TestExplorerActionRunner(() => this.tree.getSelection().filter(types_1.isDefined));
            this.lastViewState = this._register(new storedValue_1.StoredValue({
                key: 'testing.treeState',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */,
            }, this.storageService));
            /**
             * Whether there's a reveal request which has not yet been delivered. This
             * can happen if the user asks to reveal before the test tree is loaded.
             * We check to see if the reveal request is present on each tree update,
             * and do it then if so.
             */
            this.hasPendingReveal = false;
            /**
             * Fires when the visibility of the placeholder state changes.
             */
            this.onChangeWelcomeVisibility = this.welcomeVisibilityEmitter.event;
            /**
             * Gets whether the welcome should be visible.
             */
            this.welcomeExperience = 0 /* WelcomeExperience.None */;
            this.hasPendingReveal = !!filterState.reveal.value;
            this.noTestForDocumentWidget = this._register(instantiationService.createInstance(NoTestsForDocumentWidget, listContainer));
            this._viewMode.set(this.storageService.get('testing.viewMode', 1 /* StorageScope.WORKSPACE */, "true" /* TestExplorerViewMode.Tree */));
            this._viewSorting.set(this.storageService.get('testing.viewSorting', 1 /* StorageScope.WORKSPACE */, "location" /* TestExplorerViewSorting.ByLocation */));
            this.reevaluateWelcomeState();
            this.filter = this.instantiationService.createInstance(TestsFilter, testService.collection);
            this.tree = instantiationService.createInstance(testingObjectTree_1.TestingObjectTree, 'Test Explorer List', listContainer, new ListDelegate(), [
                instantiationService.createInstance(TestItemRenderer, this.actionRunner),
                instantiationService.createInstance(ErrorRenderer),
            ], {
                identityProvider: instantiationService.createInstance(IdentityProvider),
                hideTwistiesOfChildlessElements: false,
                sorter: instantiationService.createInstance(TreeSorter, this),
                keyboardNavigationLabelProvider: instantiationService.createInstance(TreeKeyboardNavigationLabelProvider),
                accessibilityProvider: instantiationService.createInstance(ListAccessibilityProvider),
                filter: this.filter,
                findWidgetEnabled: false,
                openOnSingleClick: false,
            });
            // saves the collapse state so that if items are removed or refreshed, they
            // retain the same state (#170169)
            const collapseStateSaver = this._register(new async_1.RunOnceScheduler(() => {
                // reuse the last view state to avoid making a bunch of object garbage:
                const state = this.tree.getOptimizedViewState(this.lastViewState.get({}));
                const projection = this.projection.value;
                if (projection) {
                    projection.lastState = state;
                }
            }, 3000));
            this._register(this.tree.onDidChangeCollapseState(evt => {
                if (evt.node.element instanceof index_1.TestItemTreeElement) {
                    if (!evt.node.collapsed) {
                        this.projection.value?.expandElement(evt.node.element, evt.deep ? Infinity : 0);
                    }
                    collapseStateSaver.schedule();
                }
            }));
            this._register(this.crService.onDidChange(testId => {
                if (testId) {
                    // a continuous run test will sort to the top:
                    const elem = this.projection.value?.getElementByTestId(testId);
                    this.tree.resort(elem?.parent && this.tree.hasElement(elem.parent) ? elem.parent : null, false);
                }
            }));
            this._register(onDidChangeVisibility(visible => {
                if (visible) {
                    this.ensureProjection();
                }
            }));
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            this._register(event_1.Event.any(filterState.text.onDidChange, filterState.fuzzy.onDidChange, testService.excluded.onTestExclusionsChanged)(this.tree.refilter, this.tree));
            this._register(this.tree.onDidOpen(e => {
                if (e.element instanceof index_1.TestItemTreeElement && !e.element.children.size && e.element.test.item.uri) {
                    commandService.executeCommand('vscode.revealTest', e.element.test.item.extId);
                }
            }));
            this._register(this.tree);
            this._register(this.onChangeWelcomeVisibility(e => {
                this.noTestForDocumentWidget.setVisible(e === 2 /* WelcomeExperience.ForDocument */);
            }));
            this._register(dom.addStandardDisposableListener(this.tree.getHTMLElement(), 'keydown', evt => {
                if (evt.equals(3 /* KeyCode.Enter */)) {
                    this.handleExecuteKeypress(evt);
                }
                else if (listWidget_1.DefaultKeyboardNavigationDelegate.mightProducePrintableCharacter(evt)) {
                    filterState.text.value = evt.browserEvent.key;
                    filterState.focusInput();
                }
            }));
            this._register(filterState.reveal.onDidChange(id => this.revealById(id, undefined, false)));
            this._register(onDidChangeVisibility(visible => {
                if (visible) {
                    filterState.focusInput();
                }
            }));
            this._register(this.tree.onDidChangeSelection(evt => {
                if (dom.isMouseEvent(evt.browserEvent) && (evt.browserEvent.altKey || evt.browserEvent.shiftKey)) {
                    return; // don't focus when alt-clicking to multi select
                }
                const selected = evt.elements[0];
                if (selected && evt.browserEvent && selected instanceof index_1.TestItemTreeElement
                    && selected.children.size === 0 && selected.test.expand === 0 /* TestItemExpandState.NotExpandable */) {
                    this.tryPeekError(selected);
                }
            }));
            let followRunningTests = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */);
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */)) {
                    followRunningTests = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */);
                }
            }));
            let alwaysRevealTestAfterStateChange = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */);
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */)) {
                    alwaysRevealTestAfterStateChange = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */);
                }
            }));
            this._register(testResults.onTestChanged(evt => {
                if (!followRunningTests) {
                    return;
                }
                if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */) {
                    return;
                }
                if (this.tree.selectionSize > 1) {
                    return; // don't change a multi-selection #180950
                }
                // follow running tests, or tests whose state changed. Tests that
                // complete very fast may not enter the running state at all.
                if (evt.item.ownComputedState !== 2 /* TestResultState.Running */ && !(evt.previousState === 1 /* TestResultState.Queued */ && (0, testingStates_1.isStateWithResult)(evt.item.ownComputedState))) {
                    return;
                }
                this.revealById(evt.item.item.extId, alwaysRevealTestAfterStateChange, false);
            }));
            this._register(testResults.onResultsChanged(() => {
                this.tree.resort(null);
            }));
            this._register(this.testProfileService.onDidChange(() => {
                this.tree.rerender();
            }));
            const onEditorChange = () => {
                if (editorService.activeEditor instanceof diffEditorInput_1.DiffEditorInput) {
                    this.filter.filterToDocumentUri(editorService.activeEditor.primary.resource);
                }
                else {
                    this.filter.filterToDocumentUri(editorService.activeEditor?.resource);
                }
                if (this.filterState.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */)) {
                    this.tree.refilter();
                }
            };
            this._register(editorService.onDidActiveEditorChange(onEditorChange));
            this._register(this.storageService.onWillSaveState(({ reason, }) => {
                if (reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.lastViewState.store(this.tree.getOptimizedViewState());
                }
            }));
            onEditorChange();
        }
        /**
         * Re-layout the tree.
         */
        layout(height, width) {
            this.tree.layout(height, width);
        }
        /**
         * Tries to reveal by extension ID. Queues the request if the extension
         * ID is not currently available.
         */
        revealById(id, expand = true, focus = true) {
            if (!id) {
                this.hasPendingReveal = false;
                return;
            }
            const projection = this.ensureProjection();
            // If the item itself is visible in the tree, show it. Otherwise, expand
            // its closest parent.
            let expandToLevel = 0;
            const idPath = [...testId_1.TestId.fromString(id).idsFromRoot()];
            for (let i = idPath.length - 1; i >= expandToLevel; i--) {
                const element = projection.getElementByTestId(idPath[i].toString());
                // Skip all elements that aren't in the tree.
                if (!element || !this.tree.hasElement(element)) {
                    continue;
                }
                // If this 'if' is true, we're at the closest-visible parent to the node
                // we want to expand. Expand that, and then start the loop again because
                // we might already have children for it.
                if (i < idPath.length - 1) {
                    if (expand) {
                        this.tree.expand(element);
                        expandToLevel = i + 1; // avoid an infinite loop if the test does not exist
                        i = idPath.length - 1; // restart the loop since new children may now be visible
                        continue;
                    }
                }
                // Otherwise, we've arrived!
                // If the node or any of its children are excluded, flip on the 'show
                // excluded tests' checkbox automatically. If we didn't expand, then set
                // target focus target to the first collapsed element.
                let focusTarget = element;
                for (let n = element; n instanceof index_1.TestItemTreeElement; n = n.parent) {
                    if (n.test && this.testService.excluded.contains(n.test)) {
                        this.filterState.toggleFilteringFor("@hidden" /* TestFilterTerm.Hidden */, true);
                        break;
                    }
                    if (!expand && (this.tree.hasElement(n) && this.tree.isCollapsed(n))) {
                        focusTarget = n;
                    }
                }
                this.filterState.reveal.value = undefined;
                this.hasPendingReveal = false;
                if (focus) {
                    this.tree.domFocus();
                }
                if (this.tree.getRelativeTop(focusTarget) === null) {
                    this.tree.reveal(focusTarget, 0.5);
                }
                this.revealTimeout.value = (0, async_1.disposableTimeout)(() => {
                    this.tree.setFocus([focusTarget]);
                    this.tree.setSelection([focusTarget]);
                }, 1);
                return;
            }
            // If here, we've expanded all parents we can. Waiting on data to come
            // in to possibly show the revealed test.
            this.hasPendingReveal = true;
        }
        /**
         * Collapse all items in the tree.
         */
        async collapseAll() {
            this.tree.collapseAll();
        }
        /**
         * Tries to peek the first test error, if the item is in a failed state.
         */
        tryPeekError(item) {
            const lookup = item.test && this.testResults.getStateById(item.test.item.extId);
            return lookup && lookup[1].tasks.some(s => (0, testingStates_1.isFailedState)(s.state))
                ? this.peekOpener.tryPeekFirstError(lookup[0], lookup[1], { preserveFocus: true })
                : false;
        }
        onContextMenu(evt) {
            const element = evt.element;
            if (!(element instanceof index_1.TestItemTreeElement)) {
                return;
            }
            const { actions } = getActionableElementActions(this.contextKeyService, this.menuService, this.testService, this.crService, this.testProfileService, element);
            this.contextMenuService.showContextMenu({
                getAnchor: () => evt.anchor,
                getActions: () => actions.secondary,
                getActionsContext: () => element,
                actionRunner: this.actionRunner,
            });
        }
        handleExecuteKeypress(evt) {
            const focused = this.tree.getFocus();
            const selected = this.tree.getSelection();
            let targeted;
            if (focused.length === 1 && selected.includes(focused[0])) {
                evt.browserEvent?.preventDefault();
                targeted = selected;
            }
            else {
                targeted = focused;
            }
            const toRun = targeted
                .filter((e) => e instanceof index_1.TestItemTreeElement);
            if (toRun.length) {
                this.testService.runTests({
                    group: 2 /* TestRunProfileBitset.Run */,
                    tests: toRun.map(t => t.test),
                });
            }
        }
        reevaluateWelcomeState() {
            const shouldShowWelcome = this.testService.collection.busyProviders === 0 && (0, testService_1.testCollectionIsEmpty)(this.testService.collection);
            const welcomeExperience = shouldShowWelcome
                ? (this.filterState.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */) ? 2 /* WelcomeExperience.ForDocument */ : 1 /* WelcomeExperience.ForWorkspace */)
                : 0 /* WelcomeExperience.None */;
            if (welcomeExperience !== this.welcomeExperience) {
                this.welcomeExperience = welcomeExperience;
                this.welcomeVisibilityEmitter.fire(welcomeExperience);
            }
        }
        ensureProjection() {
            return this.projection.value ?? this.updatePreferredProjection();
        }
        updatePreferredProjection() {
            this.projection.clear();
            const lastState = this.lastViewState.get({});
            if (this._viewMode.get() === "list" /* TestExplorerViewMode.List */) {
                this.projection.value = this.instantiationService.createInstance(listProjection_1.ListProjection, lastState);
            }
            else {
                this.projection.value = this.instantiationService.createInstance(treeProjection_1.TreeProjection, lastState);
            }
            const scheduler = this._register(new async_1.RunOnceScheduler(() => this.applyProjectionChanges(), 200));
            this.projection.value.onUpdate(() => {
                if (!scheduler.isScheduled()) {
                    scheduler.schedule();
                }
            });
            this.applyProjectionChanges();
            return this.projection.value;
        }
        applyProjectionChanges() {
            this.reevaluateWelcomeState();
            this.projection.value?.applyTo(this.tree);
            this.tree.refilter();
            if (this.hasPendingReveal) {
                this.revealById(this.filterState.reveal.value);
            }
        }
        /**
         * Gets the selected tests from the tree.
         */
        getSelectedTests() {
            return this.tree.getSelection();
        }
    };
    TestingExplorerViewModel = __decorate([
        __param(2, configuration_1.IConfigurationService),
        __param(3, editorService_1.IEditorService),
        __param(4, actions_2.IMenuService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, testService_1.ITestService),
        __param(7, testExplorerFilterState_1.ITestExplorerFilterState),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, storage_1.IStorageService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, testResultService_1.ITestResultService),
        __param(12, testingPeekOpener_1.ITestingPeekOpener),
        __param(13, testProfileService_1.ITestProfileService),
        __param(14, testingContinuousRunService_1.ITestingContinuousRunService),
        __param(15, commands_1.ICommandService)
    ], TestingExplorerViewModel);
    var FilterResult;
    (function (FilterResult) {
        FilterResult[FilterResult["Exclude"] = 0] = "Exclude";
        FilterResult[FilterResult["Inherit"] = 1] = "Inherit";
        FilterResult[FilterResult["Include"] = 2] = "Include";
    })(FilterResult || (FilterResult = {}));
    const hasNodeInOrParentOfUri = (collection, ident, testUri, fromNode) => {
        const queue = [fromNode ? [fromNode] : collection.rootIds];
        while (queue.length) {
            for (const id of queue.pop()) {
                const node = collection.getNodeById(id);
                if (!node) {
                    continue;
                }
                if (!node.item.uri || !ident.extUri.isEqualOrParent(testUri, node.item.uri)) {
                    continue;
                }
                // Only show nodes that can be expanded (and might have a child with
                // a range) or ones that have a physical location.
                if (node.item.range || node.expand === 1 /* TestItemExpandState.Expandable */) {
                    return true;
                }
                queue.push(node.children);
            }
        }
        return false;
    };
    let TestsFilter = class TestsFilter {
        constructor(collection, state, testService, uriIdentityService) {
            this.collection = collection;
            this.state = state;
            this.testService = testService;
            this.uriIdentityService = uriIdentityService;
        }
        /**
         * @inheritdoc
         */
        filter(element) {
            if (element instanceof index_1.TestTreeErrorMessage) {
                return 1 /* TreeVisibility.Visible */;
            }
            if (element.test
                && !this.state.isFilteringFor("@hidden" /* TestFilterTerm.Hidden */)
                && this.testService.excluded.contains(element.test)) {
                return 0 /* TreeVisibility.Hidden */;
            }
            switch (Math.min(this.testFilterText(element), this.testLocation(element), this.testState(element), this.testTags(element))) {
                case 0 /* FilterResult.Exclude */:
                    return 0 /* TreeVisibility.Hidden */;
                case 2 /* FilterResult.Include */:
                    return 1 /* TreeVisibility.Visible */;
                default:
                    return 2 /* TreeVisibility.Recurse */;
            }
        }
        filterToDocumentUri(uri) {
            this.documentUri = uri;
        }
        testTags(element) {
            if (!this.state.includeTags.size && !this.state.excludeTags.size) {
                return 2 /* FilterResult.Include */;
            }
            return (this.state.includeTags.size ?
                element.test.item.tags.some(t => this.state.includeTags.has(t)) :
                true) && element.test.item.tags.every(t => !this.state.excludeTags.has(t))
                ? 2 /* FilterResult.Include */
                : 1 /* FilterResult.Inherit */;
        }
        testState(element) {
            if (this.state.isFilteringFor("@failed" /* TestFilterTerm.Failed */)) {
                return (0, testingStates_1.isFailedState)(element.state) ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
            }
            if (this.state.isFilteringFor("@executed" /* TestFilterTerm.Executed */)) {
                return element.state !== 0 /* TestResultState.Unset */ ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
            }
            return 2 /* FilterResult.Include */;
        }
        testLocation(element) {
            if (!this.documentUri) {
                return 2 /* FilterResult.Include */;
            }
            if (!this.state.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */) || !(element instanceof index_1.TestItemTreeElement)) {
                return 2 /* FilterResult.Include */;
            }
            if (hasNodeInOrParentOfUri(this.collection, this.uriIdentityService, this.documentUri, element.test.item.extId)) {
                return 2 /* FilterResult.Include */;
            }
            return 1 /* FilterResult.Inherit */;
        }
        testFilterText(element) {
            if (this.state.globList.length === 0) {
                return 2 /* FilterResult.Include */;
            }
            const fuzzy = this.state.fuzzy.value;
            for (let e = element; e; e = e.parent) {
                // start as included if the first glob is a negation
                let included = this.state.globList[0].include === false ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
                const data = e.test.item.label.toLowerCase();
                for (const { include, text } of this.state.globList) {
                    if (fuzzy ? (0, strings_1.fuzzyContains)(data, text) : data.includes(text)) {
                        included = include ? 2 /* FilterResult.Include */ : 0 /* FilterResult.Exclude */;
                    }
                }
                if (included !== 1 /* FilterResult.Inherit */) {
                    return included;
                }
            }
            return 1 /* FilterResult.Inherit */;
        }
    };
    TestsFilter = __decorate([
        __param(1, testExplorerFilterState_1.ITestExplorerFilterState),
        __param(2, testService_1.ITestService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], TestsFilter);
    class TreeSorter {
        constructor(viewModel) {
            this.viewModel = viewModel;
        }
        compare(a, b) {
            if (a instanceof index_1.TestTreeErrorMessage || b instanceof index_1.TestTreeErrorMessage) {
                return (a instanceof index_1.TestTreeErrorMessage ? -1 : 0) + (b instanceof index_1.TestTreeErrorMessage ? 1 : 0);
            }
            const durationDelta = (b.duration || 0) - (a.duration || 0);
            if (this.viewModel.viewSorting === "duration" /* TestExplorerViewSorting.ByDuration */ && durationDelta !== 0) {
                return durationDelta;
            }
            const stateDelta = (0, testingStates_1.cmpPriority)(a.state, b.state);
            if (this.viewModel.viewSorting === "status" /* TestExplorerViewSorting.ByStatus */ && stateDelta !== 0) {
                return stateDelta;
            }
            let inSameLocation = false;
            if (a instanceof index_1.TestItemTreeElement && b instanceof index_1.TestItemTreeElement && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
                inSameLocation = true;
                const delta = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
                if (delta !== 0) {
                    return delta;
                }
            }
            const sa = a.test.item.sortText;
            const sb = b.test.item.sortText;
            // If tests are in the same location and there's no preferred sortText,
            // keep the extension's insertion order (#163449).
            return inSameLocation && !sa && !sb ? 0 : (sa || a.test.item.label).localeCompare(sb || b.test.item.label);
        }
    }
    let NoTestsForDocumentWidget = class NoTestsForDocumentWidget extends lifecycle_1.Disposable {
        constructor(container, filterState) {
            super();
            const el = this.el = dom.append(container, dom.$('.testing-no-test-placeholder'));
            const emptyParagraph = dom.append(el, dom.$('p'));
            emptyParagraph.innerText = (0, nls_1.localize)('testingNoTest', 'No tests were found in this file.');
            const buttonLabel = (0, nls_1.localize)('testingFindExtension', 'Show Workspace Tests');
            const button = this._register(new button_1.Button(el, { title: buttonLabel, ...defaultStyles_1.defaultButtonStyles }));
            button.label = buttonLabel;
            this._register(button.onDidClick(() => filterState.toggleFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */, false)));
        }
        setVisible(isVisible) {
            this.el.classList.toggle('visible', isVisible);
        }
    };
    NoTestsForDocumentWidget = __decorate([
        __param(1, testExplorerFilterState_1.ITestExplorerFilterState)
    ], NoTestsForDocumentWidget);
    class TestExplorerActionRunner extends actions_1.ActionRunner {
        constructor(getSelectedTests) {
            super();
            this.getSelectedTests = getSelectedTests;
        }
        async runAction(action, context) {
            if (!(action instanceof actions_2.MenuItemAction)) {
                return super.runAction(action, context);
            }
            const selection = this.getSelectedTests();
            const contextIsSelected = selection.some(s => s === context);
            const actualContext = contextIsSelected ? selection : [context];
            const actionable = actualContext.filter((t) => t instanceof index_1.TestItemTreeElement);
            await action.run(...actionable);
        }
    }
    const getLabelForTestTreeElement = (element) => {
        let label = (0, constants_1.labelForTestInState)(element.description || element.test.item.label, element.state);
        if (element instanceof index_1.TestItemTreeElement) {
            if (element.duration !== undefined) {
                label = (0, nls_1.localize)({
                    key: 'testing.treeElementLabelDuration',
                    comment: ['{0} is the original label in testing.treeElementLabel, {1} is a duration'],
                }, '{0}, in {1}', label, formatDuration(element.duration));
            }
            if (element.retired) {
                label = (0, nls_1.localize)({
                    key: 'testing.treeElementLabelOutdated',
                    comment: ['{0} is the original label in testing.treeElementLabel'],
                }, '{0}, outdated result', label);
            }
        }
        return label;
    };
    class ListAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('testExplorer', "Test Explorer");
        }
        getAriaLabel(element) {
            return element instanceof index_1.TestTreeErrorMessage
                ? element.description
                : getLabelForTestTreeElement(element);
        }
    }
    class TreeKeyboardNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element instanceof index_1.TestTreeErrorMessage ? element.message : element.test.item.label;
        }
    }
    class ListDelegate {
        getHeight(element) {
            return element instanceof index_1.TestTreeErrorMessage ? 17 + 10 : 22;
        }
        getTemplateId(element) {
            if (element instanceof index_1.TestTreeErrorMessage) {
                return ErrorRenderer.ID;
            }
            return TestItemRenderer.ID;
        }
    }
    class IdentityProvider {
        getId(element) {
            return element.treeId;
        }
    }
    let ErrorRenderer = class ErrorRenderer {
        static { ErrorRenderer_1 = this; }
        static { this.ID = 'error'; }
        constructor(instantionService) {
            this.renderer = instantionService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
        }
        get templateId() {
            return ErrorRenderer_1.ID;
        }
        renderTemplate(container) {
            const label = dom.append(container, dom.$('.error'));
            return { label };
        }
        renderElement({ element }, _, data) {
            dom.clearNode(data.label);
            if (typeof element.message === 'string') {
                data.label.innerText = element.message;
            }
            else {
                const result = this.renderer.render(element.message, { inline: true });
                data.label.appendChild(result.element);
            }
            data.label.title = element.description;
        }
        disposeTemplate() {
            // noop
        }
    };
    ErrorRenderer = ErrorRenderer_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], ErrorRenderer);
    let TestItemRenderer = class TestItemRenderer extends lifecycle_1.Disposable {
        static { TestItemRenderer_1 = this; }
        static { this.ID = 'testItem'; }
        constructor(actionRunner, menuService, testService, profiles, contextKeyService, instantiationService, crService) {
            super();
            this.actionRunner = actionRunner;
            this.menuService = menuService;
            this.testService = testService;
            this.profiles = profiles;
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this.crService = crService;
            /**
             * @inheritdoc
             */
            this.templateId = TestItemRenderer_1.ID;
        }
        /**
         * @inheritdoc
         */
        renderTemplate(container) {
            const wrapper = dom.append(container, dom.$('.test-item'));
            const icon = dom.append(wrapper, dom.$('.computed-state'));
            const label = dom.append(wrapper, dom.$('.label'));
            const disposable = new lifecycle_1.DisposableStore();
            dom.append(wrapper, dom.$(themables_1.ThemeIcon.asCSSSelector(icons.testingHiddenIcon)));
            const actionBar = disposable.add(new actionbar_1.ActionBar(wrapper, {
                actionRunner: this.actionRunner,
                actionViewItemProvider: action => action instanceof actions_2.MenuItemAction
                    ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined)
                    : undefined
            }));
            disposable.add(this.crService.onDidChange(changed => {
                const id = templateData.current?.test.item.extId;
                if (id && (!changed || changed === id || testId_1.TestId.isChild(id, changed))) {
                    this.fillActionBar(templateData.current, templateData);
                }
            }));
            const templateData = { wrapper, label, actionBar, icon, elementDisposable: new lifecycle_1.DisposableStore(), templateDisposable: disposable };
            return templateData;
        }
        /**
         * @inheritdoc
         */
        disposeTemplate(templateData) {
            templateData.templateDisposable.clear();
        }
        /**
         * @inheritdoc
         */
        disposeElement(_element, _, templateData) {
            templateData.elementDisposable.clear();
        }
        fillActionBar(element, data) {
            const { actions, contextOverlay } = getActionableElementActions(this.contextKeyService, this.menuService, this.testService, this.crService, this.profiles, element);
            const crSelf = !!contextOverlay.getContextKeyValue(testingContextKeys_1.TestingContextKeys.isContinuousModeOn.key);
            const crChild = !crSelf && this.crService.isEnabledForAChildOf(element.test.item.extId);
            data.actionBar.domNode.classList.toggle('testing-is-continuous-run', crSelf || crChild);
            data.actionBar.clear();
            data.actionBar.context = element;
            data.actionBar.push(actions.primary, { icon: true, label: false });
        }
        /**
         * @inheritdoc
         */
        renderElement(node, _depth, data) {
            data.elementDisposable.clear();
            data.current = node.element;
            this.fillActionBar(node.element, data);
            data.elementDisposable.add(node.element.onChange(() => this._renderElement(node, data)));
            this._renderElement(node, data);
        }
        _renderElement(node, data) {
            const testHidden = this.testService.excluded.contains(node.element.test);
            data.wrapper.classList.toggle('test-is-hidden', testHidden);
            const icon = icons.testingStatesToIcons.get(node.element.test.expand === 2 /* TestItemExpandState.BusyExpanding */ || node.element.test.item.busy
                ? 2 /* TestResultState.Running */
                : node.element.state);
            data.icon.className = 'computed-state ' + (icon ? themables_1.ThemeIcon.asClassName(icon) : '');
            if (node.element.retired) {
                data.icon.className += ' retired';
            }
            data.label.title = getLabelForTestTreeElement(node.element);
            if (node.element.test.item.label.trim()) {
                dom.reset(data.label, ...(0, iconLabels_1.renderLabelWithIcons)(node.element.test.item.label));
            }
            else {
                data.label.textContent = String.fromCharCode(0xA0); // &nbsp;
            }
            let description = node.element.description;
            if (node.element.duration !== undefined) {
                description = description
                    ? `${description}: ${formatDuration(node.element.duration)}`
                    : formatDuration(node.element.duration);
            }
            if (description) {
                dom.append(data.label, dom.$('span.test-label-description', {}, description));
            }
        }
    };
    TestItemRenderer = TestItemRenderer_1 = __decorate([
        __param(1, actions_2.IMenuService),
        __param(2, testService_1.ITestService),
        __param(3, testProfileService_1.ITestProfileService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, testingContinuousRunService_1.ITestingContinuousRunService)
    ], TestItemRenderer);
    const formatDuration = (ms) => {
        if (ms < 10) {
            return `${ms.toFixed(1)}ms`;
        }
        if (ms < 1000) {
            return `${ms.toFixed(0)}ms`;
        }
        return `${(ms / 1000).toFixed(1)}s`;
    };
    const getActionableElementActions = (contextKeyService, menuService, testService, crService, profiles, element) => {
        const test = element instanceof index_1.TestItemTreeElement ? element.test : undefined;
        const contextKeys = (0, testItemContextOverlay_1.getTestItemContextOverlay)(test, test ? profiles.capabilitiesForTest(test) : 0);
        contextKeys.push(['view', "workbench.view.testing" /* Testing.ExplorerViewId */]);
        if (test) {
            const ctrl = testService.getTestController(test.controllerId);
            const supportsCr = !!ctrl && profiles.getControllerProfiles(ctrl.id).some(p => p.supportsContinuousRun);
            contextKeys.push([
                testingContextKeys_1.TestingContextKeys.canRefreshTests.key,
                !!ctrl?.canRefresh.value && testId_1.TestId.isRoot(test.item.extId),
            ], [
                testingContextKeys_1.TestingContextKeys.testItemIsHidden.key,
                testService.excluded.contains(test)
            ], [
                testingContextKeys_1.TestingContextKeys.isContinuousModeOn.key,
                supportsCr && crService.isSpecificallyEnabledFor(test.item.extId)
            ], [
                testingContextKeys_1.TestingContextKeys.isParentRunningContinuously.key,
                supportsCr && crService.isEnabledForAParentOf(test.item.extId)
            ], [
                testingContextKeys_1.TestingContextKeys.supportsContinuousRun.key,
                supportsCr,
            ]);
        }
        const contextOverlay = contextKeyService.createOverlay(contextKeys);
        const menu = menuService.createMenu(actions_2.MenuId.TestItem, contextOverlay);
        try {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, {
                shouldForwardArgs: true,
            }, result, 'inline');
            return { actions: result, contextOverlay };
        }
        finally {
            menu.dispose();
        }
    };
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        if (theme.type === 'dark') {
            const foregroundColor = theme.getColor(colorRegistry_1.foreground);
            if (foregroundColor) {
                const fgWithOpacity = new color_1.Color(new color_1.RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.65));
                collector.addRule(`.test-explorer .test-explorer-messages { color: ${fgWithOpacity}; }`);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0V4cGxvcmVyVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9icm93c2VyL3Rlc3RpbmdFeHBsb3JlclZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTJFaEcsSUFBVyxjQUdWO0lBSEQsV0FBVyxjQUFjO1FBQ3hCLHFEQUFLLENBQUE7UUFDTCxtREFBSSxDQUFBO0lBQ0wsQ0FBQyxFQUhVLGNBQWMsS0FBZCxjQUFjLFFBR3hCO0lBRU0sSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxtQkFBUTtRQVdoRCxJQUFXLG1CQUFtQjtZQUM3QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxpQkFBUyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELFlBQ0MsT0FBNEIsRUFDUCxrQkFBdUMsRUFDeEMsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUMzQyxvQkFBMkMsRUFDMUMscUJBQTZDLEVBQ2pELGlCQUFxQyxFQUN6QyxhQUE2QixFQUM5QixZQUEyQixFQUM1QixXQUEwQyxFQUNyQyxnQkFBbUMsRUFDakMsa0JBQXdELEVBQzVELGNBQWdEO1lBRWpFLEtBQUssQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBTDVKLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBRWxCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDM0MsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBMUIxRCxvQkFBZSxHQUFHLElBQUksQ0FB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