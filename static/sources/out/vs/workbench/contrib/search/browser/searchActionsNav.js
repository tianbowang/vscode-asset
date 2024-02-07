/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/nls", "vs/platform/configuration/common/configuration", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/searchEditor/browser/searchEditorInput", "vs/workbench/services/editor/common/editorService", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/platform/actions/common/actions", "vs/editor/contrib/find/browser/findModel", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/platform/accessibility/common/accessibility", "vs/base/browser/dom"], function (require, exports, platform_1, nls, configuration_1, viewsService_1, Constants, SearchEditorConstants, searchModel_1, searchEditorInput_1, editorService_1, contextkey_1, types_1, actions_1, findModel_1, searchActionsBase_1, accessibility_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Actions: Changing Search Input Options
    (0, actions_1.registerAction2)(class ToggleQueryDetailsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ToggleQueryDetailsActionId,
                title: {
                    value: nls.localize('ToggleQueryDetailsAction.label', "Toggle Query Details"),
                    original: 'Toggle Query Details'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.or(Constants.SearchViewFocusedKey, SearchEditorConstants.InSearchEditor),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 40 /* KeyCode.KeyJ */,
                },
            });
        }
        run(accessor, ...args) {
            const contextService = accessor.get(contextkey_1.IContextKeyService).getContext((0, dom_1.getActiveElement)());
            if (contextService.getValue(SearchEditorConstants.InSearchEditor.serialize())) {
                accessor.get(editorService_1.IEditorService).activeEditorPane.toggleQueryDetails(args[0]?.show);
            }
            else if (contextService.getValue(Constants.SearchViewFocusedKey.serialize())) {
                const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
                (0, types_1.assertIsDefined)(searchView).toggleQueryDetails(undefined, args[0]?.show);
            }
        }
    });
    (0, actions_1.registerAction2)(class CloseReplaceAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CloseReplaceWidgetActionId,
                title: {
                    value: nls.localize('CloseReplaceWidget.label', "Close Replace Widget"),
                    original: 'Close Replace Widget'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceInputBoxFocusedKey),
                    primary: 9 /* KeyCode.Escape */,
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
            if (searchView) {
                searchView.searchAndReplaceWidget.toggleReplace(false);
                searchView.searchAndReplaceWidget.focus();
            }
            return Promise.resolve(null);
        }
    });
    (0, actions_1.registerAction2)(class ToggleCaseSensitiveCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ToggleCaseSensitiveCommandId,
                title: {
                    value: nls.localize('ToggleCaseSensitiveCommandId.label', "Toggle Case Sensitive"),
                    original: 'Toggle Case Sensitive'
                },
                category: searchActionsBase_1.category,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: platform_1.isMacintosh ? contextkey_1.ContextKeyExpr.and(Constants.SearchViewFocusedKey, Constants.FileMatchOrFolderMatchFocusKey.toNegated()) : Constants.SearchViewFocusedKey,
                }, findModel_1.ToggleCaseSensitiveKeybinding)
            });
        }
        async run(accessor) {
            toggleCaseSensitiveCommand(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ToggleWholeWordCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ToggleWholeWordCommandId,
                title: {
                    value: nls.localize('ToggleWholeWordCommandId.label', 'Toggle Whole Word'),
                    original: 'Toggle Whole Word'
                },
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.SearchViewFocusedKey,
                }, findModel_1.ToggleWholeWordKeybinding),
                category: searchActionsBase_1.category,
            });
        }
        async run(accessor) {
            return toggleWholeWordCommand(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ToggleRegexCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ToggleRegexCommandId,
                title: {
                    value: nls.localize('ToggleRegexCommandId.label', 'Toggle Regex'),
                    original: 'Toggle Regex'
                },
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.SearchViewFocusedKey,
                }, findModel_1.ToggleRegexKeybinding),
                category: searchActionsBase_1.category,
            });
        }
        async run(accessor) {
            return toggleRegexCommand(accessor);
        }
    });
    (0, actions_1.registerAction2)(class TogglePreserveCaseAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.TogglePreserveCaseId,
                title: {
                    value: nls.localize('TogglePreserveCaseId.label', 'Toggle Preserve Case'),
                    original: 'Toggle Preserve Case'
                },
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.SearchViewFocusedKey,
                }, findModel_1.TogglePreserveCaseKeybinding),
                category: searchActionsBase_1.category,
            });
        }
        async run(accessor) {
            return togglePreserveCaseCommand(accessor);
        }
    });
    //#endregion
    //#region Actions: Opening Matches
    (0, actions_1.registerAction2)(class OpenMatchAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.OpenMatch,
                title: {
                    value: nls.localize('OpenMatch.label', "Open Match"),
                    original: 'Open Match'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
                    primary: 3 /* KeyCode.Enter */,
                    mac: {
                        primary: 3 /* KeyCode.Enter */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
                    },
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                const viewer = searchView.getControl();
                const focus = tree.getFocus()[0];
                if (focus instanceof searchModel_1.FolderMatch) {
                    viewer.toggleCollapsed(focus);
                }
                else {
                    searchView.open(tree.getFocus()[0], false, false, true);
                }
            }
        }
    });
    (0, actions_1.registerAction2)(class OpenMatchToSideAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.OpenMatchToSide,
                title: {
                    value: nls.localize('OpenMatchToSide.label', "Open Match To Side"),
                    original: 'Open Match To Side'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
                    },
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                searchView.open(tree.getFocus()[0], false, true, true);
            }
        }
    });
    (0, actions_1.registerAction2)(class AddCursorsAtSearchResultsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.AddCursorsAtSearchResults,
                title: {
                    value: nls.localize('AddCursorsAtSearchResults.label', 'Add Cursors at Search Results'),
                    original: 'Add Cursors at Search Results'
                },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 42 /* KeyCode.KeyL */,
                },
                category: searchActionsBase_1.category,
            });
        }
        async run(accessor) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                searchView.openEditorWithMultiCursor(tree.getFocus()[0]);
            }
        }
    });
    //#endregion
    //#region Actions: Toggling Focus
    (0, actions_1.registerAction2)(class FocusNextInputAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusNextInputActionId,
                title: {
                    value: nls.localize('FocusNextInputAction.label', "Focus Next Input"),
                    original: 'Focus Next Input'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(SearchEditorConstants.InSearchEditor, Constants.InputBoxFocusedKey), contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.InputBoxFocusedKey)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                },
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
                editorService.activeEditorPane.focusNextInput();
            }
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
            searchView?.focusNextInputBox();
        }
    });
    (0, actions_1.registerAction2)(class FocusPreviousInputAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusPreviousInputActionId,
                title: {
                    value: nls.localize('FocusPreviousInputAction.label', "Focus Previous Input"),
                    original: 'Focus Previous Input'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(SearchEditorConstants.InSearchEditor, Constants.InputBoxFocusedKey), contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.InputBoxFocusedKey, Constants.SearchInputBoxFocusedKey.toNegated())),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                },
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
                editorService.activeEditorPane.focusPrevInput();
            }
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
            searchView?.focusPreviousInputBox();
        }
    });
    (0, actions_1.registerAction2)(class FocusSearchFromResultsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusSearchFromResults,
                title: {
                    value: nls.localize('FocusSearchFromResults.label', "Focus Search From Results"),
                    original: 'Focus Search From Results'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, contextkey_1.ContextKeyExpr.or(Constants.FirstMatchFocusKey, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                },
            });
        }
        run(accessor) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
            searchView?.focusPreviousInputBox();
        }
    });
    (0, actions_1.registerAction2)(class ToggleSearchOnTypeAction extends actions_1.Action2 {
        static { this.searchOnTypeKey = 'search.searchOnType'; }
        constructor() {
            super({
                id: Constants.ToggleSearchOnTypeActionId,
                title: {
                    value: nls.localize('toggleTabs', 'Toggle Search on Type'),
                    original: 'Toggle Search on Type'
                },
                category: searchActionsBase_1.category,
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const searchOnType = configurationService.getValue(ToggleSearchOnTypeAction.searchOnTypeKey);
            return configurationService.updateValue(ToggleSearchOnTypeAction.searchOnTypeKey, !searchOnType);
        }
    });
    (0, actions_1.registerAction2)(class FocusSearchListCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusSearchListCommandID,
                title: {
                    value: nls.localize('focusSearchListCommandLabel', "Focus List"),
                    original: 'Focus List'
                },
                category: searchActionsBase_1.category,
                f1: true
            });
        }
        async run(accessor) {
            focusSearchListCommand(accessor);
        }
    });
    (0, actions_1.registerAction2)(class FocusNextSearchResultAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusNextSearchResultActionId,
                title: {
                    value: nls.localize('FocusNextSearchResult.label', 'Focus Next Search Result'),
                    original: 'Focus Next Search Result'
                },
                keybinding: [{
                        primary: 62 /* KeyCode.F4 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }],
                category: searchActionsBase_1.category,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults, SearchEditorConstants.InSearchEditor),
            });
        }
        async run(accessor) {
            return await focusNextSearchResult(accessor);
        }
    });
    (0, actions_1.registerAction2)(class FocusPreviousSearchResultAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.FocusPreviousSearchResultActionId,
                title: {
                    value: nls.localize('FocusPreviousSearchResult.label', 'Focus Previous Search Result'),
                    original: 'Focus Previous Search Result'
                },
                keybinding: [{
                        primary: 1024 /* KeyMod.Shift */ | 62 /* KeyCode.F4 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }],
                category: searchActionsBase_1.category,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults, SearchEditorConstants.InSearchEditor),
            });
        }
        async run(accessor) {
            return await focusPreviousSearchResult(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ReplaceInFilesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ReplaceInFilesActionId,
                title: {
                    value: nls.localize('replaceInFiles', 'Replace in Files'),
                    original: 'Replace in Files'
                },
                keybinding: [{
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 38 /* KeyCode.KeyH */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }],
                category: searchActionsBase_1.category,
                f1: true,
                menu: [{
                        id: actions_1.MenuId.MenubarEditMenu,
                        group: '4_find_global',
                        order: 2
                    }],
            });
        }
        async run(accessor) {
            return await findOrReplaceInFiles(accessor, true);
        }
    });
    //#endregion
    //#region Helpers
    function toggleCaseSensitiveCommand(accessor) {
        const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
        searchView?.toggleCaseSensitive();
    }
    function toggleWholeWordCommand(accessor) {
        const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
        searchView?.toggleWholeWords();
    }
    function toggleRegexCommand(accessor) {
        const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
        searchView?.toggleRegex();
    }
    function togglePreserveCaseCommand(accessor) {
        const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
        searchView?.togglePreserveCase();
    }
    const focusSearchListCommand = accessor => {
        const viewsService = accessor.get(viewsService_1.IViewsService);
        (0, searchActionsBase_1.openSearchView)(viewsService).then(searchView => {
            searchView?.moveFocusToResults();
        });
    };
    async function focusNextSearchResult(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.SearchEditorInput) {
            // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
            return editorService.activeEditorPane.focusNextResult();
        }
        return (0, searchActionsBase_1.openSearchView)(accessor.get(viewsService_1.IViewsService)).then(searchView => {
            searchView?.selectNextMatch();
        });
    }
    async function focusPreviousSearchResult(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const input = editorService.activeEditor;
        if (input instanceof searchEditorInput_1.SearchEditorInput) {
            // cast as we cannot import SearchEditor as a value b/c cyclic dependency.
            return editorService.activeEditorPane.focusPreviousResult();
        }
        return (0, searchActionsBase_1.openSearchView)(accessor.get(viewsService_1.IViewsService)).then(searchView => {
            searchView?.selectPreviousMatch();
        });
    }
    async function findOrReplaceInFiles(accessor, expandSearchReplaceWidget) {
        return (0, searchActionsBase_1.openSearchView)(accessor.get(viewsService_1.IViewsService), false).then(openedView => {
            if (openedView) {
                const searchAndReplaceWidget = openedView.searchAndReplaceWidget;
                searchAndReplaceWidget.toggleReplace(expandSearchReplaceWidget);
                const updatedText = openedView.updateTextFromFindWidgetOrSelection({ allowUnselectedWord: !expandSearchReplaceWidget });
                openedView.searchAndReplaceWidget.focus(undefined, updatedText, updatedText);
            }
        });
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc05hdi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvc2VhcmNoQWN0aW9uc05hdi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXlCaEcsZ0RBQWdEO0lBQ2hELElBQUEseUJBQWUsRUFBQyxNQUFNLHdCQUF5QixTQUFRLGlCQUFPO1FBQzdEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsMEJBQTBCO2dCQUN4QyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLEVBQUUsc0JBQXNCLENBQUM7b0JBQzdFLFFBQVEsRUFBRSxzQkFBc0I7aUJBQ2hDO2dCQUNELFFBQVEsRUFBUiw0QkFBUTtnQkFDUixVQUFVLEVBQUU7b0JBQ1gsTUFBTSw2Q0FBbUM7b0JBQ3pDLElBQUksRUFBRSwyQkFBYyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEVBQUUscUJBQXFCLENBQUMsY0FBYyxDQUFDO29CQUM3RixPQUFPLEVBQUUsbURBQTZCLHdCQUFlO2lCQUNyRDthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7WUFDN0MsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFBLHNCQUFnQixHQUFFLENBQUMsQ0FBQztZQUN2RixJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDOUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUMsZ0JBQWlDLENBQUMsa0JBQWtC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