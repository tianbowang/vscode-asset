define(["require", "exports", "vs/nls", "vs/base/common/filters", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/label/common/label"], function (require, exports, nls, filters_1, quickInput_1, debug_1, editorService_1, getIconClasses_1, model_1, language_1, lifecycle_1, resources_1, label_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showLoadedScriptMenu = void 0;
    /**
     * This function takes a regular quickpick and makes one for loaded scripts that has persistent headers
     * e.g. when some picks are filtered out, the ones that are visible still have its header.
     */
    async function showLoadedScriptMenu(accessor) {
        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
        const debugService = accessor.get(debug_1.IDebugService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const sessions = debugService.getModel().getSessions(false);
        const modelService = accessor.get(model_1.IModelService);
        const languageService = accessor.get(language_1.ILanguageService);
        const labelService = accessor.get(label_1.ILabelService);
        const localDisposableStore = new lifecycle_1.DisposableStore();
        const quickPick = quickInputService.createQuickPick();
        localDisposableStore.add(quickPick);
        quickPick.matchOnLabel = quickPick.matchOnDescription = quickPick.matchOnDetail = quickPick.sortByLabel = false;
        quickPick.placeholder = nls.localize('moveFocusedView.selectView', "Search loaded scripts by name");
        quickPick.items = await _getPicks(quickPick.value, sessions, editorService, modelService, languageService, labelService);
        localDisposableStore.add(quickPick.onDidChangeValue(async () => {
            quickPick.items = await _getPicks(quickPick.value, sessions, editorService, modelService, languageService, labelService);
        }));
        localDisposableStore.add(quickPick.onDidAccept(() => {
            const selectedItem = quickPick.selectedItems[0];
            selectedItem.accept();
            quickPick.hide();
            localDisposableStore.dispose();
        }));
        quickPick.show();
    }
    exports.showLoadedScriptMenu = showLoadedScriptMenu;
    async function _getPicksFromSession(session, filter, editorService, modelService, languageService, labelService) {
        const items = [];
        items.push({ type: 'separator', label: session.name });
        const sources = await session.getLoadedSources();
        sources.forEach((element) => {
            const pick = _createPick(element, filter, editorService, modelService, languageService, labelService);
            if (pick) {
                items.push(pick);
            }
        });
        return items;
    }
    async function _getPicks(filter, sessions, editorService, modelService, languageService, labelService) {
        const loadedScriptPicks = [];
        const picks = await Promise.all(sessions.map((session) => _getPicksFromSession(session, filter, editorService, modelService, languageService, labelService)));
        for (const row of picks) {
            for (const elem of row) {
                loadedScriptPicks.push(elem);
            }
        }
        return loadedScriptPicks;
    }
    function _createPick(source, filter, editorService, modelService, languageService, labelService) {
        const label = labelService.getUriBasenameLabel(source.uri);
        const desc = labelService.getUriLabel((0, resources_1.dirname)(source.uri));
        // manually filter so that headers don't get filtered out
        const labelHighlights = (0, filters_1.matchesFuzzy)(filter, label, true);
        const descHighlights = (0, filters_1.matchesFuzzy)(filter, desc, true);
        if (labelHighlights || descHighlights) {
            return {
                label,
                description: desc === '.' ? undefined : desc,
                highlights: { label: labelHighlights ?? undefined, description: descHighlights ?? undefined },
                iconClasses: (0, getIconClasses_1.getIconClasses)(modelService, languageService, source.uri),
                accept: () => {
                    if (source.available) {
                        source.openInEditor(editorService, { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 });
                    }
                }
            };
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVkU2NyaXB0c1BpY2tlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvY29tbW9uL2xvYWRlZFNjcmlwdHNQaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQXVCQTs7O09BR0c7SUFDSSxLQUFLLFVBQVUsb0JBQW9CLENBQUMsUUFBMEI7UUFDcEUsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7UUFDM0QsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFDakQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7UUFDbkQsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1RCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztRQUNqRCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7UUFDdkQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFFakQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUNuRCxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxlQUFlLEVBQW9CLENBQUM7UUFDeEUsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFD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