var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/map", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/search/browser/notebookSearch/searchNotebookHelpers", "vs/workbench/services/search/common/search", "vs/base/common/arrays", "vs/base/common/types", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/contrib/notebook/browser/services/notebookEditorService"], function (require, exports, cancellation_1, map_1, configuration_1, log_1, uriIdentity_1, notebookService_1, searchNotebookHelpers_1, search_1, arrays, types_1, editorResolverService_1, notebookEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookSearchService = void 0;
    let NotebookSearchService = class NotebookSearchService {
        constructor(uriIdentityService, notebookEditorService, logService, notebookService, configurationService, editorResolverService) {
            this.uriIdentityService = uriIdentityService;
            this.notebookEditorService = notebookEditorService;
            this.logService = logService;
            this.notebookService = notebookService;
            this.configurationService = configurationService;
            this.editorResolverService = editorResolverService;
        }
        notebookSearch(query, token, searchInstanceID, onProgress) {
            if (query.type !== 2 /* QueryType.Text */) {
                return {
                    openFilesToScan: new map_1.ResourceSet(),
                    completeData: Promise.resolve({
                        messages: [],
                        limitHit: false,
                        results: [],
                    }),
                    allScannedFiles: Promise.resolve(new map_1.ResourceSet()),
                };
            }
            const localNotebookWidgets = this.getLocalNotebookWidgets();
            const localNotebookFiles = localNotebookWidgets.map(widget => widget.viewModel.uri);
            const getAllResults = () => {
                const searchStart = Date.now();
                const localResultPromise = this.getLocalNotebookResults(query, token ?? cancellation_1.CancellationToken.None, localNotebookWidgets, searchInstanceID);
                const searchLocalEnd = Date.now();
                const experimentalNotebooksEnabled = this.configurationService.getValue('search').experimental?.closedNotebookRichContentResults ?? false;
                let closedResultsPromise = Promise.resolve(undefined);
                if (experimentalNotebooksEnabled) {
                    closedResultsPromise = this.getClosedNotebookResults(query, new map_1.ResourceSet(localNotebookFiles, uri => this.uriIdentityService.extUri.getComparisonKey(uri)), token ?? cancellation_1.CancellationToken.None);
                }
                const promise = Promise.all([localResultPromise, closedResultsPromise]);
                return {
                    completeData: promise.then((resolvedPromise) => {
                        const openNotebookResult = resolvedPromise[0];
                        const closedNotebookResult = resolvedPromise[1];
                        const resolved = resolvedPromise.filter((e) => !!e);
                        const resultArray = [...openNotebookResult.results.values(), ...closedNotebookResult?.results.values() ?? []];
                        const results = arrays.coalesce(resultArray);
                        if (onProgress) {
                            results.forEach(onProgress);
                        }
                        this.logService.trace(`local notebook search time | ${searchLocalEnd - searchStart}ms`);
                        return {
                            messages: [],
                            limitHit: resolved.reduce((prev, cur) => prev || cur.limitHit, false),
                            results,
                        };
                    }),
                    allScannedFiles: promise.then(resolvedPromise => {
                        const openNotebookResults = resolvedPromise[0];
                        const closedNotebookResults = resolvedPromise[1];
                        const results = arrays.coalesce([...openNotebookResults.results.keys(), ...closedNotebookResults?.results.keys() ?? []]);
                        return new map_1.ResourceSet(results, uri => this.uriIdentityService.extUri.getComparisonKey(uri));
                    })
                };
            };
            const promiseResults = getAllResults();
            return {
                openFilesToScan: new map_1.ResourceSet(localNotebookFiles),
                completeData: promiseResults.completeData,
                allScannedFiles: promiseResults.allScannedFiles
            };
        }
        async getClosedNotebookResults(textQuery, scannedFiles, token) {
            const userAssociations = this.editorResolverService.getAllUserAssociations();
            const allPriorityInfo = new Map();
            const contributedNotebookTypes = this.notebookService.getContributedNotebookTypes();
            userAssociations.forEach(association => {
                if (!association.filenamePattern) {
                    return;
                }
                const info = {
                    isFromSettings: true,
                    filenamePatterns: [association.filenamePattern]
                };
                const existingEntry = allPriorityInfo.get(association.viewType);
                if (existingEntry) {
                    allPriorityInfo.set(association.viewType, existingEntry.concat(info));
                }
                else {
                    allPriorityInfo.set(association.viewType, [info]);
                }
            });
            const promises = [];
            contributedNotebookTypes.forEach((notebook) => {
                promises.push((async () => {
                    const canResolve = await this.notebookService.canResolve(notebook.id);
                    if (!canResolve) {
                        return undefined;
                    }
                    const serializer = (await this.notebookService.withNotebookDataProvider(notebook.id)).serializer;
                    return await serializer.searchInNotebooks(textQuery, token, allPriorityInfo);
                })());
            });
            const start = Date.now();
            const searchComplete = arrays.coalesce(await Promise.all(promises));
            const results = searchComplete.flatMap(e => e.results);
            let limitHit = searchComplete.some(e => e.limitHit);
            // results are already sorted with high priority first, filter out duplicates.
            const uniqueResults = new map_1.ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
            let numResults = 0;
            for (const result of results) {
                if (textQuery.maxResults && numResults >= textQuery.maxResults) {
                    limitHit = true;
                    break;
                }
                if (!scannedFiles.has(result.resource) && !uniqueResults.has(result.resource)) {
                    uniqueResults.set(result.resource, result.cellResults.length > 0 ? result : null);
                    numResults++;
                }
            }
            const end = Date.now();
            this.logService.trace(`query: ${textQuery.contentPattern.pattern}`);
            this.logService.trace(`closed notebook search time | ${end - start}ms`);
            return {
                results: uniqueResults,
                limitHit
            };
        }
        async getLocalNotebookResults(query, token, widgets, searchID) {
            const localResults = new map_1.ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
            let limitHit = false;
            for (const widget of widgets) {
                if (!widget.hasModel()) {
                    continue;
                }
                const askMax = (0, types_1.isNumber)(query.maxResults) ? query.maxResults + 1 : Number.MAX_SAFE_INTEGER;
                const uri = widget.viewModel.uri;
                if (!(0, search_1.pathIncludedInQuery)(query, uri.fsPath)) {
                    continue;
                }
                let matches = await widget
                    .find(query.contentPattern.pattern, {
                    regex: query.contentPattern.isRegExp,
                    wholeWord: query.contentPattern.isWordMatch,
                    caseSensitive: query.contentPattern.isCaseSensitive,
                    includeMarkupInput: query.contentPattern.notebookInfo?.isInNotebookMarkdownInput ?? true,
                    includeMarkupPreview: query.contentPattern.notebookInfo?.isInNotebookMarkdownPreview ?? true,
                    includeCodeInput: query.contentPattern.notebookInfo?.isInNotebookCellInput ?? true,
                    includeOutput: query.contentPattern.notebookInfo?.isInNotebookCellOutput ?? true,
                }, token, false, true, searchID);
                if (matches.length) {
                    if (askMax && matches.length >= askMax) {
                        limitHit = true;
                        matches = matches.slice(0, askMax - 1);
                    }
                    const cellResults = matches.map(match => {
                        const contentResults = (0, searchNotebookHelpers_1.contentMatchesToTextSearchMatches)(match.contentMatches, match.cell);
                        const webviewResults = (0, searchNotebookHelpers_1.webviewMatchesToTextSearchMatches)(match.webviewMatches);
                        return {
                            cell: match.cell,
                            index: match.index,
                            contentResults: contentResults,
                            webviewResults: webviewResults,
                        };
                    });
                    const fileMatch = {
                        resource: uri, cellResults: cellResults
                    };
                    localResults.set(uri, fileMatch);
                }
                else {
                    localResults.set(uri, null);
                }
            }
            return {
                results: localResults,
                limitHit
            };
        }
        getLocalNotebookWidgets() {
            const notebookWidgets = this.notebookEditorService.retrieveAllExistingWidgets();
            return notebookWidgets
                .map(widget => widget.value)
                .filter((val) => !!val && val.hasModel());
        }
    };
    exports.NotebookSearchService = NotebookSearchService;
    exports.NotebookSearchService = NotebookSearchService = __decorate([
        __param(0, uriIdentity_1.IUriIdentityService),
        __param(1, notebookEditorService_1.INotebookEditorService),
        __param(2, log_1.ILogService),
        __param(3, notebookService_1.INotebookService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, editorResolverService_1.IEditorResolverService)
    ], NotebookSearchService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tTZWFyY2hTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9ub3RlYm9va1NlYXJjaC9ub3RlYm9va1NlYXJjaFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQThCTyxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFxQjtRQUVqQyxZQUN1QyxrQkFBdUMsRUFDcEMscUJBQTZDLEVBQ3hELFVBQXVCLEVBQ2xCLGVBQWlDLEVBQzVCLG9CQUEyQyxFQUMxQyxxQkFBNkM7WUFMaEQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUNwQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQ3hELGVBQVUsR0FBVixVQUFVLENBQWE7WUFDbEIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQzVCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDMUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtRQUV2RixDQUFDO1FBR0QsY0FBYyxDQUFDLEtBQWlCLEVBQUUsS0FBb0MsRUFBRSxnQkFBd0IsRUFBRSxVQUFrRDtZQU1uSixJQUFJLEtBQUssQ0FBQyxJQUFJLDJCQUFtQixFQUFFLENBQUM7Z0JBQ25DLE9BQU87b0JBQ04sZUFBZSxFQUFFLElBQUksaUJBQVcsRUFBRTtvQkFDbEMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUM7d0JBQzdCLFFBQVEsRUFBRSxFQUFFO3dCQUNaLFFBQVEsRUFBRSxLQUFLO3dCQUNmLE9BQU8sRUFBRSxFQUFFO3FCQUNYLENBQUM7b0JBQ0YsZUFBZSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxpQkFBVyxFQUFFLENBQUM7aUJBQ25ELENBQUM7WUFDSCxDQUFDO1lBRUQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUM1RCxNQUFNLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckYsTUFBTSxhQUFhLEdBQUcsR0FBc0YsRUFBRTtnQkFDN0csTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUUvQixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxJQUFJLGdDQUFpQixDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUN4SSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBRWxDLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBaUMsUUFBUSxDQUFDLENBQUMsWUFBWSxFQUFFLGdDQUFnQyxJQUFJLEtBQUssQ0FBQztnQkFFMUssSUFBSSxvQkFBb0IsR0FBc0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDekcsSUFBSSw0QkFBNEIsRUFBRSxDQUFDO29CQUNsQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLElBQUksaUJBQVcsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUksZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2hNLENBQUM7Z0JBRUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDeEUsT0FBTztvQkFDTixZQUFZLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUFFO3dCQUM5QyxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDOUMsTUFBTSxvQkFBb0IsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRWhELE1BQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQWtFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3BILE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQzlHLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQzdDLElBQUksVUFBVSxFQUFFLENBQUM7NEJBQ2hCLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQzdCLENBQUM7d0JBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLGNBQWMsR0FBRyxXQUFXLElBQUksQ0FBQyxDQUFDO3dCQUN4RixPQUF3Qjs0QkFDdkIsUUFBUSxFQUFFLEVBQUU7NEJBQ1osUUFBUSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUM7NEJBQ3JFLE9BQU87eUJBQ1AsQ0FBQztvQkFDSCxDQUFDLENBQUM7b0JBQ0YsZUFBZSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUU7d0JBQy9DLE1BQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMvQyxNQUFNLHFCQUFxQixHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcscUJBQXFCLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQ3pILE9BQU8sSUFBSSxpQkFBVyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDOUYsQ0FBQyxDQUFDO2lCQUNGLENBQUM7WUFDSCxDQUFDLENBQUM7WUFDRixNQUFNLGNBQWMsR0FBRyxhQUFhLEVBQUUsQ0FBQztZQUN2QyxPQUFPO2dCQUNOLGVBQWUsRUFBRSxJQUFJLGlCQUFXLENBQUMsa0JBQWtCLENBQUM7Z0JBQ3BELFlBQVksRUFBRSxjQUFjLENBQUMsWUFBWTtnQkFDekMsZUFBZSxFQUFFLGNBQWMsQ0FBQyxlQUFlO2FBQy9DLENBQUM7UUFDSCxDQUFDO1FBRU8sS0FBSyxDQUFDLHdCQUF3QixDQUFDLFNBQXFCLEVBQUUsWUFBeUIsRUFBRSxLQUF3QjtZQUVoSCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzdFLE1BQU0sZUFBZSxHQUF3QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ3ZFLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBRXBGLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFFdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDbEMsT0FBTztnQkFDUixDQUFDO2dCQUVELE1BQU0sSUFBSSxHQUF5QjtvQkFDbEMsY0FBYyxFQUFFLElBQUk7b0JBQ3BCLGdCQUFnQixFQUFFLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQztpQkFDL0MsQ0FBQztnQkFFRixNQUFNLGFBQWEsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxhQUFhLEVBQUUsQ0FBQztvQkFDbkIsZUFBZSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdkUsQ0FBQztxQkFBTSxDQUFDO29CQUNQLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sUUFBUSxHQUdLLEVBQUUsQ0FBQztZQUV0Qix3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDN0MsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUN6QixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdEUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUNqQixPQUFPLFNBQVMsQ0FBQztvQkFDbEIsQ0FBQztvQkFDRCxNQUFNLFVBQVUsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7b0JBQ2pHLE9BQU8sTUFBTSxVQUFVLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDOUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDekIsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNwRSxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELElBQUksUUFBUSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFcEQsOEVBQThFO1lBQzlFLE1BQU0sYUFBYSxHQUFHLElBQUksaUJBQVcsQ0FBbUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFckksSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQzlCLElBQUksU0FBUyxDQUFDLFVBQVUsSUFBSSxVQUFVLElBQUksU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUNoRSxRQUFRLEdBQUcsSUFBSSxDQUFDO29CQUNoQixNQUFNO2dCQUNQLENBQUM7Z0JBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDL0UsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbEYsVUFBVSxFQUFFLENBQUM7Z0JBQ2QsQ0FBQztZQUNGLENBQUM7WUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsVUFBVSxTQUFTLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEdBQUcsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDO1lBRXhFLE9BQU87Z0JBQ04sT0FBTyxFQUFFLGFBQWE7Z0JBQ3RCLFFBQVE7YUFDUixDQUFDO1FBQ0gsQ0FBQztRQUVPLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxLQUFpQixFQUFFLEtBQXdCLEVBQUUsT0FBb0MsRUFBRSxRQUFnQjtZQUN4SSxNQUFNLFlBQVksR0FBRyxJQUFJLGlCQUFXLENBQXFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RJLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztZQUVyQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7b0JBQ3hCLFNBQVM7Z0JBQ1YsQ0FBQztnQkFDRCxNQUFNLE1BQU0sR0FBRyxJQUFBLGdCQUFRLEVBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO2dCQUMzRixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBVSxDQUFDLEdBQUcsQ0FBQztnQkFFbEMsSUFBSSxDQUFDLElBQUEsNEJBQW1CLEVBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO29CQUM3QyxTQUFTO2dCQUNWLENBQUM7Z0JBRUQsSUFBSSxPQUFPLEdBQUcsTUFBTSxNQUFNO3FCQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUU7b0JBQ25DLEtBQUssRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVE7b0JBQ3BDLFNBQVMsRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLFdBQVc7b0JBQzNDLGFBQWEsRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQWU7b0JBQ25ELGtCQUFrQixFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLHlCQUF5QixJQUFJLElBQUk7b0JBQ3hGLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLDJCQUEyQixJQUFJLElBQUk7b0JBQzVGLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLHFCQUFxQixJQUFJLElBQUk7b0JBQ2xGLGFBQWEsRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxzQkFBc0IsSUFBSSxJQUFJO2lCQUNoRixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUdsQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDcEIsSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxNQUFNLEVBQUUsQ0FBQzt3QkFDeEMsUUFBUSxHQUFHLElBQUksQ0FBQzt3QkFDaEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDeEMsQ0FBQztvQkFDRCxNQUFNLFdBQVcsR0FBa0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDdEUsTUFBTSxjQUFjLEdBQUcsSUFBQSx5REFBaUMsRUFBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDM0YsTUFBTSxjQUFjLEdBQUcsSUFBQSx5REFBaUMsRUFBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQy9FLE9BQU87NEJBQ04sSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJOzRCQUNoQixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7NEJBQ2xCLGNBQWMsRUFBRSxjQUFjOzRCQUM5QixjQUFjLEVBQUUsY0FBYzt5QkFDOUIsQ0FBQztvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFFSCxNQUFNLFNBQVMsR0FBZ0M7d0JBQzlDLFFBQVEsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFdBQVc7cUJBQ3ZDLENBQUM7b0JBQ0YsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ2xDLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDN0IsQ0FBQztZQUNGLENBQUM7WUFFRCxPQUFPO2dCQUNOLE9BQU8sRUFBRSxZQUFZO2dCQUNyQixRQUFRO2FBQ1IsQ0FBQztRQUNILENBQUM7UUFHTyx1QkFBdUI7WUFDOUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFDaEYsT0FBTyxlQUFlO2lCQUNwQixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2lCQUMzQixNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQStCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7S0FDRCxDQUFBO0lBMU5ZLHNEQUFxQjtvQ0FBckIscUJBQXFCO1FBRy9CLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSw4Q0FBc0IsQ0FBQTtRQUN0QixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLGtDQUFnQixDQUFBO1FBQ2hCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSw4Q0FBc0IsQ0FBQTtPQVJaLHFCQUFxQixDQTBOakMifQ==