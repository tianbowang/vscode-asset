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
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/contrib/find/browser/findModel", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/searchEditor/browser/searchEditor", "vs/workbench/contrib/searchEditor/browser/searchEditorActions", "vs/workbench/contrib/searchEditor/browser/searchEditorInput", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/search/common/search", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/base/common/lifecycle", "vs/base/browser/dom"], function (require, exports, resources_1, uri_1, findModel_1, nls_1, actions_1, commands_1, contextkey_1, descriptors_1, instantiation_1, platform_1, editor_1, contributions_1, editor_2, contextkeys_1, viewsService_1, searchActionsBase_1, searchIcons_1, SearchConstants, SearchEditorConstants, searchEditor_1, searchEditorActions_1, searchEditorInput_1, editorService_1, search_1, editorResolverService_1, workingCopyEditorService_1, lifecycle_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const OpenInEditorCommandId = 'search.action.openInEditor';
    const OpenNewEditorToSideCommandId = 'search.action.openNewEditorToSide';
    const FocusQueryEditorWidgetCommandId = 'search.action.focusQueryEditorWidget';
    const FocusQueryEditorFilesToIncludeCommandId = 'search.action.focusFilesToInclude';
    const FocusQueryEditorFilesToExcludeCommandId = 'search.action.focusFilesToExclude';
    const ToggleSearchEditorCaseSensitiveCommandId = 'toggleSearchEditorCaseSensitive';
    const ToggleSearchEditorWholeWordCommandId = 'toggleSearchEditorWholeWord';
    const ToggleSearchEditorRegexCommandId = 'toggleSearchEditorRegex';
    const IncreaseSearchEditorContextLinesCommandId = 'increaseSearchEditorContextLines';
    const DecreaseSearchEditorContextLinesCommandId = 'decreaseSearchEditorContextLines';
    const RerunSearchEditorSearchCommandId = 'rerunSearchEditorSearch';
    const CleanSearchEditorStateCommandId = 'cleanSearchEditorState';
    const SelectAllSearchEditorMatchesCommandId = 'selectAllSearchEditorMatches';
    //#region Editor Descriptior
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(searchEditor_1.SearchEditor, searchEditor_1.SearchEditor.ID, (0, nls_1.localize)('searchEditor', "Search Editor")), [
        new descriptors_1.SyncDescriptor(searchEditorInput_1.SearchEditorInput)
    ]);
    //#endregion
    //#region Startup Contribution
    let SearchEditorContribution = class SearchEditorContribution {
        constructor(editorResolverService, instantiationService) {
            editorResolverService.registerEditor('*' + searchEditorInput_1.SEARCH_EDITOR_EXT, {
                id: searchEditorInput_1.SearchEditorInput.ID,
                label: (0, nls_1.localize)('promptOpenWith.searchEditor.displayName', "Search Editor"),
                detail: editor_2.DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
                priority: editorResolverService_1.RegisteredEditorPriority.default,
            }, {
                singlePerResource: true,
                canSupportResource: resource => ((0, resources_1.extname)(resource) === searchEditorInput_1.SEARCH_EDITOR_EXT)
            }, {
                createEditorInput: ({ resource }) => {
                    return { editor: instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'existingFile', fileUri: resource }) };
                }
            });
        }
    };
    SearchEditorContribution = __decorate([
        __param(0, editorResolverService_1.IEditorResolverService),
        __param(1, instantiation_1.IInstantiationService)
    ], SearchEditorContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(SearchEditorContribution, 1 /* LifecyclePhase.Starting */);
    class SearchEditorInputSerializer {
        canSerialize(input) {
            return !!input.tryReadConfigSync();
        }
        serialize(input) {
            if (input.isDisposed()) {
                return JSON.stringify({ modelUri: undefined, dirty: false, config: input.tryReadConfigSync(), name: input.getName(), matchRanges: [], backingUri: input.backingUri?.toString() });
            }
            let modelUri = undefined;
            if (input.modelUri.path || input.modelUri.fragment && input.isDirty()) {
                modelUri = input.modelUri.toString();
            }
            const config = input.tryReadConfigSync();
            const dirty = input.isDirty();
            const matchRanges = dirty ? input.getMatchRanges() : [];
            const backingUri = input.backingUri;
            return JSON.stringify({ modelUri, dirty, config, name: input.getName(), matchRanges, backingUri: backingUri?.toString() });
        }
        deserialize(instantiationService, serializedEditorInput) {
            const { modelUri, dirty, config, matchRanges, backingUri } = JSON.parse(serializedEditorInput);
            if (config && (config.query !== undefined)) {
                if (modelUri) {
                    const input = instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'model', modelUri: uri_1.URI.parse(modelUri), config, backupOf: backingUri ? uri_1.URI.parse(backingUri) : undefined });
                    input.setDirty(dirty);
                    input.setMatchRanges(matchRanges);
                    return input;
                }
                else {
                    if (backingUri) {
                        return instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'existingFile', fileUri: uri_1.URI.parse(backingUri) });
                    }
                    else {
                        return instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'rawData', resultsContents: '', config });
                    }
                }
            }
            return undefined;
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(searchEditorInput_1.SearchEditorInput.ID, SearchEditorInputSerializer);
    //#endregion
    //#region Commands
    commands_1.CommandsRegistry.registerCommand(CleanSearchEditorStateCommandId, (accessor) => {
        const activeEditorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
        if (activeEditorPane instanceof searchEditor_1.SearchEditor) {
            activeEditorPane.cleanState();
        }
    });
    //#endregion
    //#region Actions
    const category = (0, nls_1.localize2)('search', 'Search Editor');
    const translateLegacyConfig = (legacyConfig = {}) => {
        const config = {};
        const overrides = {
            includes: 'filesToInclude',
            excludes: 'filesToExclude',
            wholeWord: 'matchWholeWord',
            caseSensitive: 'isCaseSensitive',
            regexp: 'isRegexp',
            useIgnores: 'useExcludeSettingsAndIgnoreFiles',
        };
        Object.entries(legacyConfig).forEach(([key, value]) => {
            config[overrides[key] ?? key] = value;
        });
        return config;
    };
    const openArgMetadata = {
        description: 'Open a new search editor. Arguments passed can include variables like ${relativeFileDirname}.',
        args: [{
                name: 'Open new Search Editor args',
                schema: {
                    properties: {
                        query: { type: 'string' },
                        filesToInclude: { type: 'string' },
                        filesToExclude: { type: 'string' },
                        contextLines: { type: 'number' },
                        matchWholeWord: { type: 'boolean' },
                        isCaseSensitive: { type: 'boolean' },
                        isRegexp: { type: 'boolean' },
                        useExcludeSettingsAndIgnoreFiles: { type: 'boolean' },
                        showIncludesExcludes: { type: 'boolean' },
                        triggerSearch: { type: 'boolean' },
                        focusResults: { type: 'boolean' },
                        onlyOpenEditors: { type: 'boolean' },
                    }
                }
            }]
    };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'search.searchEditor.action.deleteFileResults',
                title: (0, nls_1.localize2)('searchEditor.deleteResultBlock', 'Delete File Results'),
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 1 /* KeyCode.Backspace */,
                },
                precondition: SearchEditorConstants.InSearchEditor,
                category,
                f1: true,
            });
        }
        async run(accessor) {
            const contextService = accessor.get(contextkey_1.IContextKeyService).getContext((0, dom_1.getActiveElement)());
            if (contextService.getValue(SearchEditorConstants.InSearchEditor.serialize())) {
                accessor.get(editorService_1.IEditorService).activeEditorPane.deleteResultBlock();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SearchEditorConstants.OpenNewEditorCommandId,
                title: (0, nls_1.localize2)('search.openNewSearchEditor', 'New Search Editor'),
                category,
                f1: true,
                metadata: openArgMetadata
            });
        }
        async run(accessor, args) {
            await accessor.get(instantiation_1.IInstantiationService).invokeFunction(searchEditorActions_1.openNewSearchEditor, translateLegacyConfig({ location: 'new', ...args }));
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SearchEditorConstants.OpenEditorCommandId,
                title: (0, nls_1.localize2)('search.openSearchEditor', 'Open Search Editor'),
                category,
                f1: true,
                metadata: openArgMetadata
            });
        }
        async run(accessor, args) {
            await accessor.get(instantiation_1.IInstantiationService).invokeFunction(searchEditorActions_1.openNewSearchEditor, translateLegacyConfig({ location: 'reuse', ...args }));
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenNewEditorToSideCommandId,
                title: (0, nls_1.localize2)('search.openNewEditorToSide', 'Open New Search Editor to the Side'),
                category,
                f1: true,
                metadata: openArgMetadata
            });
        }
        async run(accessor, args) {
            await accessor.get(instantiation_1.IInstantiationService).invokeFunction(searchEditorActions_1.openNewSearchEditor, translateLegacyConfig(args), true);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenInEditorCommandId,
                title: (0, nls_1.localize2)('search.openResultsInEditor', 'Open Results in Editor'),
                category,
                f1: true,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */,
                    when: contextkey_1.ContextKeyExpr.and(SearchConstants.HasSearchResults, SearchConstants.SearchViewFocusedKey),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */
                    }
                },
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
            if (searchView) {
                await instantiationService.invokeFunction(searchEditorActions_1.createEditorFromSearchResult, searchView.searchResult, searchView.searchIncludePattern.getValue(), searchView.searchExcludePattern.getValue(), searchView.searchIncludePattern.onlySearchInOpenEditors());
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: RerunSearchEditorSearchCommandId,
                title: (0, nls_1.localize2)('search.rerunSearchInEditor', 'Search Again'),
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */,
                    when: SearchEditorConstants.InSearchEditor,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                icon: searchIcons_1.searchRefreshIcon,
                menu: [{
                        id: actions_1.MenuId.EditorTitle,
                        group: 'navigation',
                        when: contextkeys_1.ActiveEditorContext.isEqualTo(SearchEditorConstants.SearchEditorID)
                    },
                    {
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkeys_1.ActiveEditorContext.isEqualTo(SearchEditorConstants.SearchEditorID)
                    }]
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                editorService.activeEditorPane.triggerSearch({ resetCursor: false });
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: FocusQueryEditorWidgetCommandId,
                title: (0, nls_1.localize2)('search.action.focusQueryEditorWidget', 'Focus Search Editor Input'),
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: {
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                editorService.activeEditorPane.focusSearchInput();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: FocusQueryEditorFilesToIncludeCommandId,
                title: (0, nls_1.localize2)('search.action.focusFilesToInclude', 'Focus Search Editor Files to Include'),
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                editorService.activeEditorPane.focusFilesToIncludeInput();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: FocusQueryEditorFilesToExcludeCommandId,
                title: (0, nls_1.localize2)('search.action.focusFilesToExclude', 'Focus Search Editor Files to Exclude'),
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const input = editorService.activeEditor;
            if (input instanceof searchEditorInput_1.SearchEditorInput) {
                editorService.activeEditorPane.focusFilesToExcludeInput();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: ToggleSearchEditorCaseSensitiveCommandId,
                title: (0, nls_1.localize2)('searchEditor.action.toggleSearchEditorCaseSensitive', 'Toggle Match Case'),
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: SearchConstants.SearchInputBoxFocusedKey,
                }, findModel_1.ToggleCaseSensitiveKeybinding)
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.toggleSearchEditorCaseSensitiveCommand)(accessor);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: ToggleSearchEditorWholeWordCommandId,
                title: (0, nls_1.localize2)('searchEditor.action.toggleSearchEditorWholeWord', 'Toggle Match Whole Word'),
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: SearchConstants.SearchInputBoxFocusedKey,
                }, findModel_1.ToggleWholeWordKeybinding)
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.toggleSearchEditorWholeWordCommand)(accessor);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: ToggleSearchEditorRegexCommandId,
                title: { value: (0, nls_1.localize)('searchEditor.action.toggleSearchEditorRegex', "Toggle Use Regular Expression"), original: 'Toggle Use Regular Expression"' },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: Object.assign({
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: SearchConstants.SearchInputBoxFocusedKey,
                }, findModel_1.ToggleRegexKeybinding)
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.toggleSearchEditorRegexCommand)(accessor);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SearchEditorConstants.ToggleSearchEditorContextLinesCommandId,
                title: { value: (0, nls_1.localize)('searchEditor.action.toggleSearchEditorContextLines', "Toggle Context Lines"), original: 'Toggle Context Lines"' },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 42 /* KeyCode.KeyL */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 42 /* KeyCode.KeyL */ }
                }
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.toggleSearchEditorContextLinesCommand)(accessor);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: IncreaseSearchEditorContextLinesCommandId,
                title: { original: 'Increase Context Lines', value: (0, nls_1.localize)('searchEditor.action.increaseSearchEditorContextLines', "Increase Context Lines") },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 86 /* KeyCode.Equal */
                }
            });
        }
        run(accessor) { (0, searchEditorActions_1.modifySearchEditorContextLinesCommand)(accessor, true); }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: DecreaseSearchEditorContextLinesCommandId,
                title: { original: 'Decrease Context Lines', value: (0, nls_1.localize)('searchEditor.action.decreaseSearchEditorContextLines', "Decrease Context Lines") },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 512 /* KeyMod.Alt */ | 88 /* KeyCode.Minus */
                }
            });
        }
        run(accessor) { (0, searchEditorActions_1.modifySearchEditorContextLinesCommand)(accessor, false); }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: SelectAllSearchEditorMatchesCommandId,
                title: { original: 'Select All Matches', value: (0, nls_1.localize)('searchEditor.action.selectAllSearchEditorMatches', "Select All Matches") },
                category,
                f1: true,
                precondition: SearchEditorConstants.InSearchEditor,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 42 /* KeyCode.KeyL */,
                }
            });
        }
        run(accessor) {
            (0, searchEditorActions_1.selectAllSearchEditorMatchesCommand)(accessor);
        }
    });
    (0, actions_1.registerAction2)(class OpenSearchEditorAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'search.action.openNewEditorFromView',
                title: (0, nls_1.localize)('search.openNewEditor', "Open New Search Editor"),
                category,
                icon: searchIcons_1.searchNewEditorIcon,
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 2,
                        when: contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID),
                    }]
            });
        }
        run(accessor, ...args) {
            return (0, searchEditorActions_1.openSearchEditor)(accessor);
        }
    });
    //#endregion
    //#region Search Editor Working Copy Editor Handler
    let SearchEditorWorkingCopyEditorHandler = class SearchEditorWorkingCopyEditorHandler extends lifecycle_1.Disposable {
        constructor(instantiationService, workingCopyEditorService) {
            super();
            this.instantiationService = instantiationService;
            this._register(workingCopyEditorService.registerHandler(this));
        }
        handles(workingCopy) {
            return workingCopy.resource.scheme === SearchEditorConstants.SearchEditorScheme;
        }
        isOpen(workingCopy, editor) {
            if (!this.handles(workingCopy)) {
                return false;
            }
            return editor instanceof searchEditorInput_1.SearchEditorInput && (0, resources_1.isEqual)(workingCopy.resource, editor.modelUri);
        }
        createEditor(workingCopy) {
            const input = this.instantiationService.invokeFunction(searchEditorInput_1.getOrMakeSearchEditorInput, { from: 'model', modelUri: workingCopy.resource });
            input.setDirty(true);
            return input;
        }
    };
    SearchEditorWorkingCopyEditorHandler = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workingCopyEditorService_1.IWorkingCopyEditorService)
    ], SearchEditorWorkingCopyEditorHandler);
    workbenchContributionsRegistry.registerWorkbenchContribution(SearchEditorWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRWRpdG9yLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoRWRpdG9yL2Jyb3dzZXIvc2VhcmNoRWRpdG9yLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQXVDaEcsTUFBTSxxQkFBcUIsR0FBRyw0QkFBNEIsQ0FBQztJQUMzRCxNQUFNLDRCQUE0QixHQUFHLG1DQUFtQyxDQUFDO0lBQ3pFLE1BQU0sK0JBQStCLEdBQUcsc0NBQXNDLENBQUM7SUFDL0UsTUFBTSx1Q0FBdUMsR0FBRyxtQ0FBbUMsQ0FBQztJQUNwRixNQUFNLHVDQUF1QyxHQUFHLG1DQUFtQyxDQUFDO0lBRXBGLE1BQU0sd0NBQXdDLEdBQUcsaUNBQWlDLENBQUM7SUFDbkYsTUFBTSxvQ0FBb0MsR0FBRyw2QkFBNkIsQ0FBQztJQUMzRSxNQUFNLGdDQUFnQyxHQUFHLHlCQUF5QixDQUFDO0lBQ25FLE1BQU0seUNBQXlDLEdBQUcsa0NBQWtDLENBQUM7SUFDckYsTUFBTSx5Q0FBeUMsR0FBRyxrQ0FBa0MsQ0FBQztJQUVyRixNQUFNLGdDQUFnQyxHQUFHLHlCQUF5QixDQUFDO0lBQ25FLE1BQU0sK0JBQStCLEdBQUcsd0JBQXdCLENBQUM7SUFDakUsTUFBTSxxQ0FBcUMsR0FBRyw4QkFBOEIsQ0FBQztJQUk3RSw0QkFBNEI7SUFDNUIsbUJBQVEsQ0FBQyxFQUFFLENBQXNCLHlCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGtCQUFrQixDQUMvRSw2QkFBb0IsQ0FBQyxNQUFNLENBQzFCLDJCQUFZLEVBQ1osMkJBQVksQ0FBQyxFQUFFLEVBQ2YsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUN6QyxFQUNEO1FBQ0MsSUFBSSw0QkFBYyxDQUFD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