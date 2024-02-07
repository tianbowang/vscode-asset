/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/workspace/common/workspace", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/base/common/cancellation", "vs/platform/files/common/files", "vs/editor/common/core/range", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/base/common/strings", "vs/base/common/arrays"], function (require, exports, errors_1, workspace_1, editor_1, editorService_1, cancellation_1, files_1, range_1, types_1, contextkey_1, strings_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchStateKey = exports.SearchUIState = exports.extractRangeFromFilter = exports.getOutOfWorkspaceEditorResources = exports.getWorkspaceSymbols = exports.WorkspaceSymbolItem = exports.WorkspaceSymbolProviderRegistry = void 0;
    var WorkspaceSymbolProviderRegistry;
    (function (WorkspaceSymbolProviderRegistry) {
        const _supports = [];
        function register(provider) {
            let support = provider;
            if (support) {
                _supports.push(support);
            }
            return {
                dispose() {
                    if (support) {
                        const idx = _supports.indexOf(support);
                        if (idx >= 0) {
                            _supports.splice(idx, 1);
                            support = undefined;
                        }
                    }
                }
            };
        }
        WorkspaceSymbolProviderRegistry.register = register;
        function all() {
            return _supports.slice(0);
        }
        WorkspaceSymbolProviderRegistry.all = all;
    })(WorkspaceSymbolProviderRegistry || (exports.WorkspaceSymbolProviderRegistry = WorkspaceSymbolProviderRegistry = {}));
    class WorkspaceSymbolItem {
        constructor(symbol, provider) {
            this.symbol = symbol;
            this.provider = provider;
        }
    }
    exports.WorkspaceSymbolItem = WorkspaceSymbolItem;
    async function getWorkspaceSymbols(query, token = cancellation_1.CancellationToken.None) {
        const all = [];
        const promises = WorkspaceSymbolProviderRegistry.all().map(async (provider) => {
            try {
                const value = await provider.provideWorkspaceSymbols(query, token);
                if (!value) {
                    return;
                }
                for (const symbol of value) {
                    all.push(new WorkspaceSymbolItem(symbol, provider));
                }
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
            }
        });
        await Promise.all(promises);
        if (token.isCancellationRequested) {
            return [];
        }
        // de-duplicate entries
        function compareItems(a, b) {
            let res = (0, strings_1.compare)(a.symbol.name, b.symbol.name);
            if (res === 0) {
                res = a.symbol.kind - b.symbol.kind;
            }
            if (res === 0) {
                res = (0, strings_1.compare)(a.symbol.location.uri.toString(), b.symbol.location.uri.toString());
            }
            if (res === 0) {
                if (a.symbol.location.range && b.symbol.location.range) {
                    if (!range_1.Range.areIntersecting(a.symbol.location.range, b.symbol.location.range)) {
                        res = range_1.Range.compareRangesUsingStarts(a.symbol.location.range, b.symbol.location.range);
                    }
                }
                else if (a.provider.resolveWorkspaceSymbol && !b.provider.resolveWorkspaceSymbol) {
                    res = -1;
                }
                else if (!a.provider.resolveWorkspaceSymbol && b.provider.resolveWorkspaceSymbol) {
                    res = 1;
                }
            }
            if (res === 0) {
                res = (0, strings_1.compare)(a.symbol.containerName ?? '', b.symbol.containerName ?? '');
            }
            return res;
        }
        return (0, arrays_1.groupBy)(all, compareItems).map(group => group[0]).flat();
    }
    exports.getWorkspaceSymbols = getWorkspaceSymbols;
    /**
     * Helper to return all opened editors with resources not belonging to the currently opened workspace.
     */
    function getOutOfWorkspaceEditorResources(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const contextService = accessor.get(workspace_1.IWorkspaceContextService);
        const fileService = accessor.get(files_1.IFileService);
        const resources = editorService.editors
            .map(editor => editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }))
            .filter(resource => !!resource && !contextService.isInsideWorkspace(resource) && fileService.hasProvider(resource));
        return resources;
    }
    exports.getOutOfWorkspaceEditorResources = getOutOfWorkspaceEditorResources;
    // Supports patterns of <path><#|:|(><line><#|:|,><col?><:?>
    const LINE_COLON_PATTERN = /\s?[#:\(](?:line )?(\d*)(?:[#:,](\d*))?\)?:?\s*$/;
    function extractRangeFromFilter(filter, unless) {
        // Ignore when the unless character not the first character or is before the line colon pattern
        if (!filter || unless?.some(value => {
            const unlessCharPos = filter.indexOf(value);
            return unlessCharPos === 0 || unlessCharPos > 0 && !LINE_COLON_PATTERN.test(filter.substring(unlessCharPos + 1));
        })) {
            return undefined;
        }
        let range = undefined;
        // Find Line/Column number from search value using RegExp
        const patternMatch = LINE_COLON_PATTERN.exec(filter);
        if (patternMatch) {
            const startLineNumber = parseInt(patternMatch[1] ?? '', 10);
            // Line Number
            if ((0, types_1.isNumber)(startLineNumber)) {
                range = {
                    startLineNumber: startLineNumber,
                    startColumn: 1,
                    endLineNumber: startLineNumber,
                    endColumn: 1
                };
                // Column Number
                const startColumn = parseInt(patternMatch[2] ?? '', 10);
                if ((0, types_1.isNumber)(startColumn)) {
                    range = {
                        startLineNumber: range.startLineNumber,
                        startColumn: startColumn,
                        endLineNumber: range.endLineNumber,
                        endColumn: startColumn
                    };
                }
            }
            // User has typed "something:" or "something#" without a line number, in this case treat as start of file
            else if (patternMatch[1] === '') {
                range = {
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 1
                };
            }
        }
        if (patternMatch && range) {
            return {
                filter: filter.substr(0, patternMatch.index), // clear range suffix from search value
                range
            };
        }
        return undefined;
    }
    exports.extractRangeFromFilter = extractRangeFromFilter;
    var SearchUIState;
    (function (SearchUIState) {
        SearchUIState[SearchUIState["Idle"] = 0] = "Idle";
        SearchUIState[SearchUIState["Searching"] = 1] = "Searching";
        SearchUIState[SearchUIState["SlowSearch"] = 2] = "SlowSearch";
    })(SearchUIState || (exports.SearchUIState = SearchUIState = {}));
    exports.SearchStateKey = new contextkey_1.RawContextKey('searchState', SearchUIState.Idle);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvY29tbW9uL3NlYXJjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQ2hHLElBQWlCLCtCQUErQixDQTBCL0M7SUExQkQsV0FBaUIsK0JBQStCO1FBRS9DLE1BQU0sU0FBUyxHQUErQixFQUFFLENBQUM7UUFFakQsU0FBZ0IsUUFBUSxDQUFDLFFBQWtDO1lBQzFELElBQUksT0FBTyxHQUF5QyxRQUFRLENBQUM7WUFDN0QsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDYixTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pCLENBQUM7WUFFRCxPQUFPO2dCQUNOLE9BQU87b0JBQ04sSUFBSSxPQUFPLEVBQUUsQ0FBQzt3QkFDYixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN2QyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQzs0QkFDZCxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDekIsT0FBTyxHQUFHLFNBQVMsQ0FBQzt3QkFDckIsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQWpCZSx3Q0FBUSxXQWlCdkIsQ0FBQTtRQUVELFNBQWdCLEdBQUc7WUFDbEIsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFGZSxtQ0FBRyxNQUVsQixDQUFBO0lBQ0YsQ0FBQyxFQTFCZ0IsK0JBQStCLCtDQUEvQiwrQkFBK0IsUUEwQi9DO0lBRUQsTUFBYSxtQkFBbUI7UUFDL0IsWUFBcUIsTUFBd0IsRUFBVyxRQUFrQztZQUFyRSxXQUFNLEdB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