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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/base/common/iterator", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/base/common/themables", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testExplorerFilterState", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testTypes"], function (require, exports, dom, actionbar_1, actionViewItems_1, dropdownActionViewItem_1, actions_1, async_1, event_1, iterator_1, nls_1, contextView_1, instantiation_1, themables_1, suggestEnabledInput_1, icons_1, storedValue_1, testExplorerFilterState_1, testService_1, testTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingExplorerFilter = void 0;
    const testFilterDescriptions = {
        ["@failed" /* TestFilterTerm.Failed */]: (0, nls_1.localize)('testing.filters.showOnlyFailed', "Show Only Failed Tests"),
        ["@executed" /* TestFilterTerm.Executed */]: (0, nls_1.localize)('testing.filters.showOnlyExecuted', "Show Only Executed Tests"),
        ["@doc" /* TestFilterTerm.CurrentDoc */]: (0, nls_1.localize)('testing.filters.currentFile', "Show in Active File Only"),
        ["@hidden" /* TestFilterTerm.Hidden */]: (0, nls_1.localize)('testing.filters.showExcludedTests', "Show Hidden Tests"),
    };
    let TestingExplorerFilter = class TestingExplorerFilter extends actionViewItems_1.BaseActionViewItem {
        constructor(action, state, instantiationService, testService) {
            super(null, action);
            this.state = state;
            this.instantiationService = instantiationService;
            this.testService = testService;
            this.focusEmitter = this._register(new event_1.Emitter());
            this.onDidFocus = this.focusEmitter.event;
            this.history = this._register(this.instantiationService.createInstance(storedValue_1.StoredValue, {
                key: 'testing.filterHistory2',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */
            }));
            this.filtersAction = new actions_1.Action('markersFiltersAction', (0, nls_1.localize)('testing.filters.menu', "More Filters..."), 'testing-filter-button ' + themables_1.ThemeIcon.asClassName(icons_1.testingFilterIcon));
            this.updateFilterActiveState();
            this._register(testService.excluded.onTestExclusionsChanged(this.updateFilterActiveState, this));
        }
        /**
         * @override
         */
        render(container) {
            container.classList.add('testing-filter-action-item');
            const updateDelayer = this._register(new async_1.Delayer(400));
            const wrapper = this.wrapper = dom.$('.testing-filter-wrapper');
            container.appendChild(wrapper);
            let history = this.history.get({ lastValue: '', values: [] });
            if (history instanceof Array) {
                history = { lastValue: '', values: history };
            }
            if (history.lastValue) {
                this.state.setText(history.lastValue);
            }
            const input = this.input = this._register(this.instantiationService.createInstance(suggestEnabledInput_1.ContextScopedSuggestEnabledInputWithHistory, {
                id: 'testing.explorer.filter',
                ariaLabel: (0, nls_1.localize)('testExplorerFilterLabel', "Filter text for tests in the explorer"),
                parent: wrapper,
                suggestionProvider: {
                    triggerCharacters: ['@'],
                    provideResults: () => [
                        ...Object.entries(testFilterDescriptions).map(([label, detail]) => ({ label, detail })),
                        ...iterator_1.Iterable.map(this.testService.collection.tags.values(), tag => {
                            const { ctrlId, tagId } = (0, testTypes_1.denamespaceTestTag)(tag.id);
                            const insertText = `@${ctrlId}:${tagId}`;
                            return ({
                                label: `@${ctrlId}:${tagId}`,
                                detail: this.testService.collection.getNodeById(ctrlId)?.item.label,
                                insertText: tagId.includes(' ') ? `@${ctrlId}:"${tagId.replace(/(["\\])/g, '\\$1')}"` : insertText,
                            });
                        }),
                    ].filter(r => !this.state.text.value.includes(r.label)),
                },
                resourceHandle: 'testing:filter',
                suggestOptions: {
                    value: this.state.text.value,
                    placeholderText: (0, nls_1.localize)('testExplorerFilter', "Filter (e.g. text, !exclude, @tag)"),
                },
                history: history.values
            }));
            this._register(this.state.text.onDidChange(newValue => {
                if (input.getValue() !== newValue) {
                    input.setValue(newValue);
                }
            }));
            this._register(this.state.onDidRequestInputFocus(() => {
                input.focus();
            }));
            this._register(input.onDidFocus(() => {
                this.focusEmitter.fire();
            }));
            this._register(input.onInputDidChange(() => updateDelayer.trigger(() => {
                input.addToHistory();
                this.state.setText(input.getValue());
            })));
            const actionbar = this._register(new actionbar_1.ActionBar(container, {
                actionViewItemProvider: action => {
                    if (action.id === this.filtersAction.id) {
                        return this.instantiationService.createInstance(FiltersDropdownMenuActionViewItem, action, this.state, this.actionRunner);
                    }
                    return undefined;
                },
            }));
            actionbar.push(this.filtersAction, { icon: true, label: false });
            this.layout(this.wrapper.clientWidth);
        }
        layout(width) {
            this.input.layout(new dom.Dimension(width - /* horizontal padding */ 24 - /* editor padding */ 8 - /* filter button padding */ 22, 20));
        }
        /**
         * Focuses the filter input.
         */
        focus() {
            this.input.focus();
        }
        /**
         * Persists changes to the input history.
         */
        saveState() {
            this.history.store({ lastValue: this.input.getValue(), values: this.input.getHistory() });
        }
        /**
         * @override
         */
        dispose() {
            this.saveState();
            super.dispose();
        }
        /**
         * Updates the 'checked' state of the filter submenu.
         */
        updateFilterActiveState() {
            this.filtersAction.checked = this.testService.excluded.hasAny;
        }
    };
    exports.TestingExplorerFilter = TestingExplorerFilter;
    exports.TestingExplorerFilter = TestingExplorerFilter = __decorate([
        __param(1, testExplorerFilterState_1.ITestExplorerFilterState),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, testService_1.ITestService)
    ], TestingExplorerFilter);
    let FiltersDropdownMenuActionViewItem = class FiltersDropdownMenuActionViewItem extends dropdownActionViewItem_1.DropdownMenuActionViewItem {
        constructor(action, filters, actionRunner, contextMenuService, testService) {
            super(action, { getActions: () => this.getActions() }, contextMenuService, {
                actionRunner,
                classNames: action.class,
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
                menuAsChild: true
            });
            this.filters = filters;
            this.testService = testService;
        }
        render(container) {
            super.render(container);
            this.updateChecked();
        }
        getActions() {
            return [
                ...["@failed" /* TestFilterTerm.Failed */, "@executed" /* TestFilterTerm.Executed */, "@doc" /* TestFilterTerm.CurrentDoc */].map(term => ({
                    checked: this.filters.isFilteringFor(term),
                    class: undefined,
                    enabled: true,
                    id: term,
                    label: testFilterDescriptions[term],
                    run: () => this.filters.toggleFilteringFor(term),
                    tooltip: '',
                    dispose: () => null
                })),
                new actions_1.Separator(),
                {
                    checked: this.filters.fuzzy.value,
                    class: undefined,
                    enabled: true,
                    id: 'fuzzy',
                    label: (0, nls_1.localize)('testing.filters.fuzzyMatch', "Fuzzy Match"),
                    run: () => this.filters.fuzzy.value = !this.filters.fuzzy.value,
                    tooltip: ''
                },
                new actions_1.Separator(),
                {
                    checked: this.filters.isFilteringFor("@hidden" /* TestFilterTerm.Hidden */),
                    class: undefined,
                    enabled: this.testService.excluded.hasAny,
                    id: 'showExcluded',
                    label: (0, nls_1.localize)('testing.filters.showExcludedTests', "Show Hidden Tests"),
                    run: () => this.filters.toggleFilteringFor("@hidden" /* TestFilterTerm.Hidden */),
                    tooltip: ''
                },
                {
                    checked: false,
                    class: undefined,
                    enabled: this.testService.excluded.hasAny,
                    id: 'removeExcluded',
                    label: (0, nls_1.localize)('testing.filters.removeTestExclusions', "Unhide All Tests"),
                    run: async () => this.testService.excluded.clear(),
                    tooltip: ''
                }
            ];
        }
        updateChecked() {
            this.element.classList.toggle('checked', this._action.checked);
        }
    };
    FiltersDropdownMenuActionViewItem = __decorate([
        __param(3, contextView_1.IContextMenuService),
        __param(4, testService_1.ITestService)
    ], FiltersDropdownMenuActionViewItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0V4cGxvcmVyRmlsdGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2Jyb3dzZXIvdGVzdGluZ0V4cGxvcmVyRmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVCaEcsTUFBTSxzQkFBc0IsR0FBc0M7UUFDakUsdUNBQXVCLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0NBQWdDLEVBQUUsd0JBQXdCLENBQUM7UUFDN0YsMkNBQXlCLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0NBQWtDLEVBQUUsMEJBQTBCLENBQUM7UUFDbkcsd0NBQTJCLEVBQUUsSUFBQSxjQUFRLEVBQUMsNkJBQTZCLEVBQUUsMEJBQTBCLENBQUM7UUFDaEcsdUNBQXVCLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUNBQW1DLEVBQUUsbUJBQW1CLENBQUM7S0FDM0YsQ0FBQztJQUVLLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsb0NBQWtCO1FBYTVELFlBQ0MsTUFBZSxFQUNXLEtBQWdELEVBQ25ELG9CQUE0RCxFQUNyRSxXQUEwQztZQUV4RCxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBSnVCLFVBQUssR0FBTCxLQUFLLENBQTBCO1lBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDcEQsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFkeEMsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNwRCxlQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDcEMsWUFBTyxHQUFvRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUJB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