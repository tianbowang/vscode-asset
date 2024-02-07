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
define(["require", "exports", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/editor/contrib/suggest/browser/suggestController", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/preferences/common/preferences"], function (require, exports, dropdownActionViewItem_1, suggestController_1, nls_1, contextView_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsSearchFilterDropdownMenuActionViewItem = void 0;
    let SettingsSearchFilterDropdownMenuActionViewItem = class SettingsSearchFilterDropdownMenuActionViewItem extends dropdownActionViewItem_1.DropdownMenuActionViewItem {
        constructor(action, actionRunner, searchWidget, contextMenuService) {
            super(action, { getActions: () => this.getActions() }, contextMenuService, {
                actionRunner,
                classNames: action.class,
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
                menuAsChild: true
            });
            this.searchWidget = searchWidget;
            this.suggestController = suggestController_1.SuggestController.get(this.searchWidget.inputWidget);
        }
        render(container) {
            super.render(container);
        }
        doSearchWidgetAction(queryToAppend, triggerSuggest) {
            this.searchWidget.setValue(this.searchWidget.getValue().trimEnd() + ' ' + queryToAppend);
            this.searchWidget.focus();
            if (triggerSuggest && this.suggestController) {
                this.suggestController.triggerSuggest();
            }
        }
        /**
         * The created action appends a query to the search widget search string. It optionally triggers suggestions.
         */
        createAction(id, label, tooltip, queryToAppend, triggerSuggest) {
            return {
                id,
                label,
                tooltip,
                class: undefined,
                enabled: true,
                checked: false,
                run: () => { this.doSearchWidgetAction(queryToAppend, triggerSuggest); }
            };
        }
        /**
         * The created action appends a query to the search widget search string, if the query does not exist.
         * Otherwise, it removes the query from the search widget search string.
         * The action does not trigger suggestions after adding or removing the query.
         */
        createToggleAction(id, label, tooltip, queryToAppend) {
            const splitCurrentQuery = this.searchWidget.getValue().split(' ');
            const queryContainsQueryToAppend = splitCurrentQuery.includes(queryToAppend);
            return {
                id,
                label,
                tooltip,
                class: undefined,
                enabled: true,
                checked: queryContainsQueryToAppend,
                run: () => {
                    if (!queryContainsQueryToAppend) {
                        const trimmedCurrentQuery = this.searchWidget.getValue().trimEnd();
                        const newQuery = trimmedCurrentQuery ? trimmedCurrentQuery + ' ' + queryToAppend : queryToAppend;
                        this.searchWidget.setValue(newQuery);
                    }
                    else {
                        const queryWithRemovedTags = this.searchWidget.getValue().split(' ')
                            .filter(word => word !== queryToAppend).join(' ');
                        this.searchWidget.setValue(queryWithRemovedTags);
                    }
                    this.searchWidget.focus();
                }
            };
        }
        getActions() {
            return [
                this.createToggleAction('modifiedSettingsSearch', (0, nls_1.localize)('modifiedSettingsSearch', "Modified"), (0, nls_1.localize)('modifiedSettingsSearchTooltip', "Add or remove modified settings filter"), `@${preferences_1.MODIFIED_SETTING_TAG}`),
                this.createAction('extSettingsSearch', (0, nls_1.localize)('extSettingsSearch', "Extension ID..."), (0, nls_1.localize)('extSettingsSearchTooltip', "Add extension ID filter"), `@${preferences_1.EXTENSION_SETTING_TAG}`, true),
                this.createAction('featuresSettingsSearch', (0, nls_1.localize)('featureSettingsSearch', "Feature..."), (0, nls_1.localize)('featureSettingsSearchTooltip', "Add feature filter"), `@${preferences_1.FEATURE_SETTING_TAG}`, true),
                this.createAction('tagSettingsSearch', (0, nls_1.localize)('tagSettingsSearch', "Tag..."), (0, nls_1.localize)('tagSettingsSearchTooltip', "Add tag filter"), `@${preferences_1.GENERAL_TAG_SETTING_TAG}`, true),
                this.createAction('langSettingsSearch', (0, nls_1.localize)('langSettingsSearch', "Language..."), (0, nls_1.localize)('langSettingsSearchTooltip', "Add language ID filter"), `@${preferences_1.LANGUAGE_SETTING_TAG}`, true),
                this.createToggleAction('onlineSettingsSearch', (0, nls_1.localize)('onlineSettingsSearch', "Online services"), (0, nls_1.localize)('onlineSettingsSearchTooltip', "Show settings for online services"), '@tag:usesOnlineServices'),
                this.createToggleAction('policySettingsSearch', (0, nls_1.localize)('policySettingsSearch', "Policy services"), (0, nls_1.localize)('policySettingsSearchTooltip', "Show settings for policy services"), `@${preferences_1.POLICY_SETTING_TAG}`)
            ];
        }
    };
    exports.SettingsSearchFilterDropdownMenuActionViewItem = SettingsSearchFilterDropdownMenuActionViewItem;
    exports.SettingsSearchFilterDropdownMenuActionViewItem = SettingsSearchFilterDropdownMenuActionViewItem = __decorate([
        __param(3, contextView_1.IContextMenuService)
    ], SettingsSearchFilterDropdownMenuActionViewItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NTZWFyY2hNZW51LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL3NldHRpbmdzU2VhcmNoTWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXekYsSUFBTSw4Q0FBOEMsR0FBcEQsTUFBTSw4Q0FBK0MsU0FBUSxtREFBMEI7UUFHN0YsWUFDQyxNQUFlLEVBQ2YsWUFBdUMsRUFDdEIsWUFBaUMsRUFDN0Isa0JBQXVDO1lBRTVELEtBQUssQ0FBQyxNQUFNLEVBQ1gsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQ3ZDLGtCQUFrQixFQUNsQjtnQkFDQyxZQUFZO2dCQUNaLFVBQVUsRUFBRSxNQUFNLENBQUMsS0FBSztnQkFDeEIsdUJBQXVCLEVBQUUsR0FBRyxFQUFFLDhCQUFzQjtnQkFDcEQsV0FBVyxFQUFFLElBQUk7YUFDakIsQ0FDRCxDQUFDO1lBWmUsaUJBQVksR0FBWixZQUFZLENBQXFCO1lBY2xELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxxQ0FBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRVEsTUFBTSxDQUFDLFNBQXNCO1lBQ3JDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVPLG9CQUFvQixDQUFDLGFBQXFCLEVBQUUsY0FBdUI7WUFDMUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLEdBQUcsYUFBYSxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQixJQUFJLGNBQWMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3pDLENBQUM7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSyxZQUFZLENBQUMsRUFBVSxFQUFFLEtBQWEsRUFBRSxPQUFlLEVBQUUsYUFBcUIsRUFBRSxjQUF1QjtZQUM5RyxPQUFPO2dCQUNOLEVBQUU7Z0JBQ0YsS0FBSztnQkFDTCxPQUFPO2dCQUNQLEtBQUssRUFBRSxTQUFTO2dCQUNoQixPQUFPLEVBQUUsSUFBSTtnQkFDYixPQUFPLEVBQUUsS0FBSztnQkFDZCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEUsQ0FBQztRQUNILENBQUM7UUFFRDs7OztXQUlHO1FBQ0ssa0JBQWtCLENBQUMsRUFBVSxFQUFFLEtBQWEsRUFBRSxPQUFlLEVBQUUsYUFBcUI7WUFDM0YsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsRSxNQUFNLDBCQUEwQixHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM3RSxPQUFPO2dCQUNOLEVBQUU7Z0JBQ0YsS0FBSztnQkFDTCxPQUFPO2dCQUNQLEtBQUssRUFBRSxTQUFTO2dCQUNoQixPQUFPLEVBQUUsSUFBSTtnQkFDYixPQUFPLEVBQUUsMEJBQTBCO2dCQUNuQyxHQUFHLEVBQUUsR0FBRyxFQUFFO29CQUNULElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO3dCQUNqQyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ25FLE1BQU0sUUFBUSxHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxtQkFBbUIsR0FBRyxHQUFHLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7d0JBQ2pHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN0QyxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7NkJBQ2xFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ25ELElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7b0JBQ2xELENBQUM7b0JBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDM0IsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO1FBRUQsVUFBVTtZQUNULE9BQU87Z0JBQ04sSUFBSSxDQUFDLGtCQUFrQixDQUN0Qix3QkFBd0IsRUFDeEIsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsVUFBVSxDQUFDLEVBQzlDLElBQUEsY0FBUSxFQUFDLCtCQUErQixFQUFFLHdDQUF3QyxDQUFDLEVBQ25GLElBQUksa0NBQW9CLEVBQUUsQ0FDMUI7Z0JBQ0QsSUFBSSxDQUFDLFlBQVksQ0FDaEIsbUJBQW1CLEVBQ25CLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLGlCQUFpQixDQUFDLEVBQ2hELElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLHlCQUF5QixDQUFDLEVBQy9ELElBQUksbUNBQXFCLEVBQUUsRUFDM0IsSUFBSSxDQUNKO2dCQUNELElBQUksQ0FBQyxZQUFZLENBQ2hCLHdCQUF3QixFQUN4QixJQUFBLGNBQVEsRUFBQyx1QkFBdUIsRUFBRSxZQUFZLENBQUMsRUFDL0MsSUFBQSxjQUFRLEVBQUMsOEJBQThCLEVBQUUsb0JBQW9CLENBQUMsRUFDOUQsSUFBSSxpQ0FBbUIsRUFBRSxFQUN6QixJQUFJLENBQ0o7Z0JBQ0QsSUFBSSxDQUFDLFlBQVksQ0FDaEIsbUJBQW1CLEVBQ25CLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxFQUN2QyxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSxnQkFBZ0IsQ0FBQyxFQUN0RCxJQUFJLHFDQUF1QixFQUFFLEVBQzdCLElBQUksQ0FDSjtnQkFDRCxJQUFJLENBQUMsWUFBWSxDQUNoQixvQkFBb0IsRUFDcEIsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsYUFBYSxDQUFDLEVBQzdDLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLHdCQUF3QixDQUFDLEVBQy9ELElBQUksa0NBQW9CLEVBQUUsRUFDMUIsSUFBSSxDQUNKO2dCQUNELElBQUksQ0FBQyxrQkFBa0IsQ0FDdEIsc0JBQXNCLEVBQ3RCLElBQUEsY0FBUSxFQUFDLHNCQUFzQixFQUFFLGlCQUFpQixDQUFDLEVBQ25ELElBQUEsY0FBUSxFQUFDLDZCQUE2QixFQUFFLG1DQUFtQyxDQUFDLEVBQzVFLHlCQUF5QixDQUN6QjtnQkFDRCxJQUFJLENBQUMsa0JBQWtCLENBQ3RCLHNCQUFzQixFQUN0QixJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxpQkFBaUIsQ0FBQyxFQUNuRCxJQUFBLGNBQVEsRUFBQyw2QkFBNkIsRUFBRSxtQ0FBbUMsQ0FBQyxFQUM1RSxJQUFJLGdDQUFrQixFQUFFLENBQ3hCO2FBQ0QsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBbElZLHdHQUE4Qzs2REFBOUMsOENBQThDO1FBT3hELFdBQUEsaUNBQW1CLENBQUE7T0FQVCw4Q0FBOEMsQ0FrSTFEIn0=