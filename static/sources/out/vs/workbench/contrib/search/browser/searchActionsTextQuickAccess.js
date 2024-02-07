define(["require", "exports", "vs/nls", "vs/workbench/contrib/search/common/constants", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/search/browser/quickTextSearch/textSearchQuickAccess", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/search/browser/searchView"], function (require, exports, nls, Constants, actions_1, searchActionsBase_1, quickInput_1, textSearchQuickAccess_1, editorService_1, configuration_1, searchView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.registerAction2)(class TextSearchQuickAccessAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.QuickTextSearchActionId,
                title: {
                    value: nls.localize('quickTextSearch', "Quick Search (Experimental)"),
                    original: 'Quick Search (Experimental)'
                },
                category: searchActionsBase_1.category,
                f1: true
            });
        }
        async run(accessor, match) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const searchText = getSearchText(accessor) ?? '';
            quickInputService.quickAccess.show(textSearchQuickAccess_1.TEXT_SEARCH_QUICK_ACCESS_PREFIX + searchText, { preserveValue: !!searchText });
        }
    });
    function getSearchText(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const activeEditor = editorService.activeTextEditorControl;
        if (!activeEditor) {
            return null;
        }
        if (!activeEditor.hasTextFocus()) {
            return null;
        }
        // only happen if it would also happen for the search view
        const seedSearchStringFromSelection = configurationService.getValue('editor.find.seedSearchStringFromSelection');
        if (!seedSearchStringFromSelection) {
            return null;
        }
        return (0, searchView_1.getSelectionTextFromEditor)(false, activeEditor);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc1RleHRRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvc2VhcmNoQWN0aW9uc1RleHRRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFpQkEsSUFBQSx5QkFBZSxFQUFDLE1BQU0sMkJBQTRCLFNBQVEsaUJBQU87UUFFaEU7WUFFQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLFNBQVMsQ0FBQyx1QkFBdUI7Z0JBQ3JDLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSw2QkFBNkIsQ0FBQztvQkFDckUsUUFBUSxFQUFFLDZCQUE2QjtpQkFDdkM7Z0JBQ0QsUUFBUSxFQUFSLDRCQUFRO2dCQUNSLEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBRUosQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxLQUFrQztZQUNoRixNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMzRCxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pELGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsdURBQStCLEdBQUcsVUFBVSxFQUFFLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ25ILENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxTQUFTLGFBQWEsQ0FBQyxRQUEwQjtRQUNoRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztRQUNuRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztRQUVqRSxNQUFNLFlBQVksR0FBWSxhQUFhLENBQUMsdUJBQWtDLENBQUM7UUFDL0UsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNELElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztZQUNsQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCwwREFBMEQ7UUFDMUQsTUFBTSw2QkFBNkIsR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQVUsMkNBQTJDLENBQUMsQ0FBQztRQUMxSCxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztZQUNwQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxPQUFPLElBQUEsdUNBQTBCLEVBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3hELENBQUMifQ==