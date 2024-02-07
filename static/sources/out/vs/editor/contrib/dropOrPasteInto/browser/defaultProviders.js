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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/dataTransfer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/services/languageFeatures", "vs/nls", "vs/platform/workspace/common/workspace"], function (require, exports, arrays_1, dataTransfer_1, lifecycle_1, mime_1, network_1, resources_1, uri_1, languageFeatures_1, nls_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultPasteProvidersFeature = exports.DefaultDropProvidersFeature = void 0;
    const builtInLabel = (0, nls_1.localize)('builtIn', 'Built-in');
    class SimplePasteAndDropProvider {
        async provideDocumentPasteEdits(_model, _ranges, dataTransfer, context, token) {
            const edit = await this.getEdit(dataTransfer, token);
            return edit ? { insertText: edit.insertText, label: edit.label, detail: edit.detail, handledMimeType: edit.handledMimeType, yieldTo: edit.yieldTo } : undefined;
        }
        async provideDocumentOnDropEdits(_model, _position, dataTransfer, token) {
            const edit = await this.getEdit(dataTransfer, token);
            return edit ? { insertText: edit.insertText, label: edit.label, handledMimeType: edit.handledMimeType, yieldTo: edit.yieldTo } : undefined;
        }
    }
    class DefaultTextProvider extends SimplePasteAndDropProvider {
        constructor() {
            super(...arguments);
            this.id = 'text';
            this.dropMimeTypes = [mime_1.Mimes.text];
            this.pasteMimeTypes = [mime_1.Mimes.text];
        }
        async getEdit(dataTransfer, _token) {
            const textEntry = dataTransfer.get(mime_1.Mimes.text);
            if (!textEntry) {
                return;
            }
            // Suppress if there's also a uriList entry.
            // Typically the uri-list contains the same text as the text entry so showing both is confusing.
            if (dataTransfer.has(mime_1.Mimes.uriList)) {
                return;
            }
            const insertText = await textEntry.asString();
            return {
                handledMimeType: mime_1.Mimes.text,
                label: (0, nls_1.localize)('text.label', "Insert Plain Text"),
                detail: builtInLabel,
                insertText
            };
        }
    }
    class PathProvider extends SimplePasteAndDropProvider {
        constructor() {
            super(...arguments);
            this.id = 'uri';
            this.dropMimeTypes = [mime_1.Mimes.uriList];
            this.pasteMimeTypes = [mime_1.Mimes.uriList];
        }
        async getEdit(dataTransfer, token) {
            const entries = await extractUriList(dataTransfer);
            if (!entries.length || token.isCancellationRequested) {
                return;
            }
            let uriCount = 0;
            const insertText = entries
                .map(({ uri, originalText }) => {
                if (uri.scheme === network_1.Schemas.file) {
                    return uri.fsPath;
                }
                else {
                    uriCount++;
                    return originalText;
                }
            })
                .join(' ');
            let label;
            if (uriCount > 0) {
                // Dropping at least one generic uri (such as https) so use most generic label
                label = entries.length > 1
                    ? (0, nls_1.localize)('defaultDropProvider.uriList.uris', "Insert Uris")
                    : (0, nls_1.localize)('defaultDropProvider.uriList.uri', "Insert Uri");
            }
            else {
                // All the paths are file paths
                label = entries.length > 1
                    ? (0, nls_1.localize)('defaultDropProvider.uriList.paths', "Insert Paths")
                    : (0, nls_1.localize)('defaultDropProvider.uriList.path', "Insert Path");
            }
            return {
                handledMimeType: mime_1.Mimes.uriList,
                insertText,
                label,
                detail: builtInLabel,
            };
        }
    }
    let RelativePathProvider = class RelativePathProvider extends SimplePasteAndDropProvider {
        constructor(_workspaceContextService) {
            super();
            this._workspaceContextService = _workspaceContextService;
            this.id = 'relativePath';
            this.dropMimeTypes = [mime_1.Mimes.uriList];
            this.pasteMimeTypes = [mime_1.Mimes.uriList];
        }
        async getEdit(dataTransfer, token) {
            const entries = await extractUriList(dataTransfer);
            if (!entries.length || token.isCancellationRequested) {
                return;
            }
            const relativeUris = (0, arrays_1.coalesce)(entries.map(({ uri }) => {
                const root = this._workspaceContextService.getWorkspaceFolder(uri);
                return root ? (0, resources_1.relativePath)(root.uri, uri) : undefined;
            }));
            if (!relativeUris.length) {
                return;
            }
            return {
                handledMimeType: mime_1.Mimes.uriList,
                insertText: relativeUris.join(' '),
                label: entries.length > 1
                    ? (0, nls_1.localize)('defaultDropProvider.uriList.relativePaths', "Insert Relative Paths")
                    : (0, nls_1.localize)('defaultDropProvider.uriList.relativePath', "Insert Relative Path"),
                detail: builtInLabel,
            };
        }
    };
    RelativePathProvider = __decorate([
        __param(0, workspace_1.IWorkspaceContextService)
    ], RelativePathProvider);
    class PasteHtmlProvider {
        constructor() {
            this.id = 'html';
            this.pasteMimeTypes = ['text/html'];
            this._yieldTo = [{ mimeType: mime_1.Mimes.text }];
        }
        async provideDocumentPasteEdits(_model, _ranges, dataTransfer, context, token) {
            if (context.trigger !== 'explicit' && context.only !== this.id) {
                return;
            }
            const entry = dataTransfer.get('text/html');
            const htmlText = await entry?.asString();
            if (!htmlText || token.isCancellationRequested) {
                return;
            }
            return {
                insertText: htmlText,
                yieldTo: this._yieldTo,
                label: (0, nls_1.localize)('pasteHtmlLabel', 'Insert HTML'),
                detail: builtInLabel,
            };
        }
    }
    async function extractUriList(dataTransfer) {
        const urlListEntry = dataTransfer.get(mime_1.Mimes.uriList);
        if (!urlListEntry) {
            return [];
        }
        const strUriList = await urlListEntry.asString();
        const entries = [];
        for (const entry of dataTransfer_1.UriList.parse(strUriList)) {
            try {
                entries.push({ uri: uri_1.URI.parse(entry), originalText: entry });
            }
            catch {
                // noop
            }
        }
        return entries;
    }
    let DefaultDropProvidersFeature = class DefaultDropProvidersFeature extends lifecycle_1.Disposable {
        constructor(languageFeaturesService, workspaceContextService) {
            super();
            this._register(languageFeaturesService.documentOnDropEditProvider.register('*', new DefaultTextProvider()));
            this._register(languageFeaturesService.documentOnDropEditProvider.register('*', new PathProvider()));
            this._register(languageFeaturesService.documentOnDropEditProvider.register('*', new RelativePathProvider(workspaceContextService)));
        }
    };
    exports.DefaultDropProvidersFeature = DefaultDropProvidersFeature;
    exports.DefaultDropProvidersFeature = DefaultDropProvidersFeature = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], DefaultDropProvidersFeature);
    let DefaultPasteProvidersFeature = class DefaultPasteProvidersFeature extends lifecycle_1.Disposable {
        constructor(languageFeaturesService, workspaceContextService) {
            super();
            this._register(languageFeaturesService.documentPasteEditProvider.register('*', new DefaultTextProvider()));
            this._register(languageFeaturesService.documentPasteEditProvider.register('*', new PathProvider()));
            this._register(languageFeaturesService.documentPasteEditProvider.register('*', new RelativePathProvider(workspaceContextService)));
            this._register(languageFeaturesService.documentPasteEditProvider.register('*', new PasteHtmlProvider()));
        }
    };
    exports.DefaultPasteProvidersFeature = DefaultPasteProvidersFeature;
    exports.DefaultPasteProvidersFeature = DefaultPasteProvidersFeature = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], DefaultPasteProvidersFeature);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdFByb3ZpZGVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZHJvcE9yUGFzdGVJbnRvL2Jyb3dzZXIvZGVmYXVsdFByb3ZpZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQmhHLE1BQU0sWUFBWSxHQUFHLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUVyRCxNQUFlLDBCQUEwQjtRQU14QyxLQUFLLENBQUMseUJBQXlCLENBQUMsTUFBa0IsRUFBRSxPQUEwQixFQUFFLFlBQXFDLEVBQUUsT0FBNkIsRUFBRSxLQUF3QjtZQUM3SyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JELE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNqSyxDQUFDO1FBRUQsS0FBSyxDQUFDLDBCQUEwQixDQUFDLE1BQWtCLEVBQUUsU0FBb0IsRUFBRSxZQUFxQyxFQUFFLEtBQXdCO1lBQ3pJLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckQsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzVJLENBQUM7S0FHRDtJQUVELE1BQU0sbUJBQW9CLFNBQVEsMEJBQTBCO1FBQTVEOztZQUVVLE9BQUUsR0FBRyxNQUFNLENBQUM7WUFDWixrQkFBYSxHQUFHLENBQUMsWUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLG1CQUFjLEdBQUcsQ0FBQyxZQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFzQnhDLENBQUM7UUFwQlUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFxQyxFQUFFLE1BQXlCO1lBQ3ZGLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsWUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDaEIsT0FBTztZQUNSLENBQUM7WUFFRCw0Q0FBNEM7WUFDNUMsZ0dBQWdHO1lBQ2hHLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxZQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDckMsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM5QyxPQUFPO2dCQUNOLGVBQWUsRUFBRSxZQUFLLENBQUMsSUFBSTtnQkFDM0IsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxtQkFBbUIsQ0FBQztnQkFDbEQsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVU7YUFDVixDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBRUQsTUFBTSxZQUFhLFNBQVEsMEJBQTBCO1FBQXJEOztZQUVVLE9BQUUsR0FBRyxLQUFLLENBQUM7WUFDWCxrQkFBYSxHQUFHLENBQUMsWUFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hDLG1CQUFjLEdBQUcsQ0FBQyxZQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUF3QzNDLENBQUM7UUF0Q1UsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFxQyxFQUFFLEtBQXdCO1lBQ3RGLE1BQU0sT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUN0RCxPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNqQixNQUFNLFVBQVUsR0FBRyxPQUFPO2lCQUN4QixHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFO2dCQUM5QixJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDakMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUNuQixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsUUFBUSxFQUFFLENBQUM7b0JBQ1gsT0FBTyxZQUFZLENBQUM7Z0JBQ3JCLENBQUM7WUFDRixDQUFDLENBQUM7aUJBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRVosSUFBSSxLQUFhLENBQUM7WUFDbEIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xCLDhFQUE4RTtnQkFDOUUsS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQztvQkFDekIsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGtDQUFrQyxFQUFFLGFBQWEsQ0FBQztvQkFDN0QsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGlDQUFpQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzlELENBQUM7aUJBQU0sQ0FBQztnQkFDUCwrQkFBK0I7Z0JBQy9CLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUM7b0JBQ3pCLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxtQ0FBbUMsRUFBRSxjQUFjLENBQUM7b0JBQy9ELENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxrQ0FBa0MsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNoRSxDQUFDO1lBRUQsT0FBTztnQkFDTixlQUFlLEVBQUUsWUFBSyxDQUFDLE9BQU87Z0JBQzlCLFVBQVU7Z0JBQ1YsS0FBSztnQkFDTCxNQUFNLEVBQUUsWUFBWTthQUNwQixDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBRUQsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSwwQkFBMEI7UUFNNUQsWUFDMkIsd0JBQW1FO1lBRTdGLEtBQUssRUFBRSxDQUFDO1lBRm1DLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFMckYsT0FBRSxHQUFHLGNBQWMsQ0FBQztZQUNwQixrQkFBYSxHQUFHLENBQUMsWUFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hDLG1CQUFjLEdBQUcsQ0FBQyxZQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFNMUMsQ0FBQztRQUVTLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBcUMsRUFBRSxLQUF3QjtZQUN0RixNQUFNLE9BQU8sR0FBRyxNQUFNLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztnQkFDdEQsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLFlBQVksR0FBRyxJQUFBLGlCQUFRLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRTtnQkFDckQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBQSx3QkFBWSxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUN2RCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDMUIsT0FBTztZQUNSLENBQUM7WUFFRCxPQUFPO2dCQUNOLGVBQWUsRUFBRSxZQUFLLENBQUMsT0FBTztnQkFDOUIsVUFBVSxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNsQyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDO29CQUN4QixDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsMkNBQTJDLEVBQUUsdUJBQXVCLENBQUM7b0JBQ2hGLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQywwQ0FBMEMsRUFBRSxzQkFBc0IsQ0FBQztnQkFDL0UsTUFBTSxFQUFFLFlBQVk7YUFDcEIsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBcENLLG9CQUFvQjtRQU92QixXQUFBLG9DQUF3QixDQUFBO09BUHJCLG9CQUFvQixDQW9DekI7SUFFRCxNQUFNLGlCQUFpQjtRQUF2QjtZQUVpQixPQUFFLEdBQUcsTUFBTSxDQUFDO1lBRVosbUJBQWMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTlCLGFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLFlBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBb0J4RCxDQUFDO1FBbEJBLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxNQUFrQixFQUFFLE9BQTBCLEVBQUUsWUFBcUMsRUFBRSxPQUE2QixFQUFFLEtBQXdCO1lBQzdLLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2hFLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM1QyxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUNoRCxPQUFPO1lBQ1IsQ0FBQztZQUVELE9BQU87Z0JBQ04sVUFBVSxFQUFFLFFBQVE7Z0JBQ3BCLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDdEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLGFBQWEsQ0FBQztnQkFDaEQsTUFBTSxFQUFFLFlBQVk7YUFDcEIsQ0FBQztRQUNILENBQUM7S0FDRDtJQUVELEtBQUssVUFBVSxjQUFjLENBQUMsWUFBcUM7UUFDbEUsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxZQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25CLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pELE1BQU0sT0FBTyxHQUEyRCxFQUFFLENBQUM7UUFDM0UsS0FBSyxNQUFNLEtBQUssSUFBSSxzQkFBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQy9DLElBQUksQ0FBQztnQkFDSixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDOUQsQ0FBQztZQUFDLE1BQU0sQ0FBQztnQkFDUixPQUFPO1lBQ1IsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBRU0sSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTtRQUMxRCxZQUMyQix1QkFBaUQsRUFDakQsdUJBQWlEO1lBRTNFLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JHLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsMEJBQTBCLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JJLENBQUM7S0FDRCxDQUFBO0lBWFksa0VBQTJCOzBDQUEzQiwyQkFBMkI7UUFFckMsV0FBQSwyQ0FBd0IsQ0FBQTtRQUN4QixXQUFBLG9DQUF3QixDQUFBO09BSGQsMkJBQTJCLENBV3ZDO0lBRU0sSUFBTSw0QkFBNEIsR0FBbEMsTUFBTSw0QkFBNkIsU0FBUSxzQkFBVTtRQUMzRCxZQUMyQix1QkFBaUQsRUFDakQsdUJBQWlEO1lBRTNFLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0csSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25JLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFHLENBQUM7S0FDRCxDQUFBO0lBWlksb0VBQTRCOzJDQUE1Qiw0QkFBNEI7UUFFdEMsV0FBQSwyQ0FBd0IsQ0FBQTtRQUN4QixXQUFBLG9DQUF3QixDQUFBO09BSGQsNEJBQTRCLENBWXhDIn0=