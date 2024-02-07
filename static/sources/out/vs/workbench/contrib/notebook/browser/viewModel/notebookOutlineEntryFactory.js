/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/nls", "vs/workbench/contrib/notebook/browser/viewModel/foldingModel", "./OutlineEntry", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, markdownRenderer_1, nls_1, foldingModel_1, OutlineEntry_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookOutlineEntryFactory = void 0;
    class NotebookOutlineEntryFactory {
        constructor(executionStateService) {
            this.executionStateService = executionStateService;
            this.cellOutlineEntryCache = {};
        }
        getOutlineEntries(cell, index) {
            const entries = [];
            const isMarkdown = cell.cellKind === notebookCommon_1.CellKind.Markup;
            // cap the amount of characters that we look at and use the following logic
            // - for MD prefer headings (each header is an entry)
            // - otherwise use the first none-empty line of the cell (MD or code)
            let content = getCellFirstNonEmptyLine(cell);
            let hasHeader = false;
            if (isMarkdown) {
                const fullContent = cell.getText().substring(0, 10000);
                for (const { depth, text } of (0, foldingModel_1.getMarkdownHeadersInCell)(fullContent)) {
                    hasHeader = true;
                    entries.push(new OutlineEntry_1.OutlineEntry(index++, depth, cell, text, false, false));
                }
                if (!hasHeader) {
                    // no markdown syntax headers, try to find html tags
                    const match = fullContent.match(/<h([1-6]).*>(.*)<\/h\1>/i);
                    if (match) {
                        hasHeader = true;
                        const level = parseInt(match[1]);
                        const text = match[2].trim();
                        entries.push(new OutlineEntry_1.OutlineEntry(index++, level, cell, text, false, false));
                    }
                }
                if (!hasHeader) {
                    content = (0, markdownRenderer_1.renderMarkdownAsPlaintext)({ value: content });
                }
            }
            if (!hasHeader) {
                if (!isMarkdown && cell.model.textModel) {
                    const cachedEntries = this.cellOutlineEntryCache[cell.model.textModel.id];
                    // Gathering symbols from the model is an async operation, but this provider is syncronous.
                    // So symbols need to be precached before this function is called to get the full list.
                    if (cachedEntries) {
                        cachedEntries.forEach((cached) => {
                            entries.push(new OutlineEntry_1.OutlineEntry(index++, cached.level, cell, cached.name, false, false, cached.range, cached.kind));
                        });
                    }
                }
                const exeState = !isMarkdown && this.executionStateService.getCellExecution(cell.uri);
                if (entries.length === 0) {
                    let preview = content.trim();
                    if (preview.length === 0) {
                        // empty or just whitespace
                        preview = (0, nls_1.localize)('empty', "empty cell");
                    }
                    entries.push(new OutlineEntry_1.OutlineEntry(index++, 7, cell, preview, !!exeState, exeState ? exeState.isPaused : false));
                }
            }
            return entries;
        }
        async cacheSymbols(cell, outlineModelService, cancelToken) {
            const textModel = await cell.resolveTextModel();
            const outlineModel = await outlineModelService.getOrCreate(textModel, cancelToken);
            const entries = createOutlineEntries(outlineModel.getTopLevelSymbols(), 7);
            this.cellOutlineEntryCache[textModel.id] = entries;
        }
    }
    exports.NotebookOutlineEntryFactory = NotebookOutlineEntryFactory;
    function createOutlineEntries(symbols, level) {
        const entries = [];
        symbols.forEach(symbol => {
            entries.push({ name: symbol.name, range: symbol.range, level, kind: symbol.kind });
            if (symbol.children) {
                entries.push(...createOutlineEntries(symbol.children, level + 1));
            }
        });
        return entries;
    }
    function getCellFirstNonEmptyLine(cell) {
        const textBuffer = cell.textBuffer;
        for (let i = 0; i < textBuffer.getLineCount(); i++) {
            const firstNonWhitespace = textBuffer.getLineFirstNonWhitespaceColumn(i + 1);
            const lineLength = textBuffer.getLineLength(i + 1);
            if (firstNonWhitespace < lineLength) {
                return textBuffer.getLineContent(i + 1);
            }
        }
        return cell.getText().substring(0, 100);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPdXRsaW5lRW50cnlGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdNb2RlbC9ub3RlYm9va091dGxpbmVFbnRyeUZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxNQUFhLDJCQUEyQjtRQUl2QyxZQUNrQixxQkFBcUQ7WUFBckQsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUFnQztZQUgvRCwwQkFBcUIsR0FBZ0MsRUFBRSxDQUFDO1FBSTVELENBQUM7UUFFRSxpQkFBaUIsQ0FBQyxJQUFvQixFQUFFLEtBQWE7WUFDM0QsTUFBTSxPQUFPLEdBQW1CLEVBQUUsQ0FBQztZQUVuQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxLQUFLLHlCQUFRLENBQUMsTUFBTSxDQUFDO1lBRXJELDJFQUEyRTtZQUMzRSxxREFBcUQ7WUFDckQscUVBQXFFO1lBQ3JFLElBQUksT0FBTyxHQUFHLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztZQUV0QixJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNoQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkQsS0FBSyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUEsdUNBQXdCLEVBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztvQkFDckUsU0FBUyxHQUFHLElBQUksQ0FBQztvQkFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLDJCQUFZLENBQUMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzFFLENBQUM7Z0JBRUQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNoQixvREFBb0Q7b0JBQ3BELE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztvQkFDNUQsSUFBSSxLQUFLLEVBQUUsQ0FBQzt3QkFDWCxTQUFTLEdBQUcsSUFBSSxDQUFDO3dCQUNqQixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2pDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLDJCQUFZLENBQUMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQzFFLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2hCLE9BQU8sR0FBRyxJQUFBLDRDQUF5QixFQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3pELENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNoQixJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ3pDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFFMUUsMkZBQTJGO29CQUMzRix1RkFBdUY7b0JBQ3ZGLElBQUksYUFBYSxFQUFFLENBQUM7d0JBQ25CLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTs0QkFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLDJCQUFZLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ25ILENBQUMsQ0FBQyxDQUFDO29CQUNKLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxNQUFNLFFBQVEsR0FBRyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQzFCLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDN0IsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO3dCQUMxQiwyQkFBMkI7d0JBQzNCLE9BQU8sR0FBRyxJQUFBLGNBQVEsRUFBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQzNDLENBQUM7b0JBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLDJCQUFZLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzdHLENBQUM7WUFDRixDQUFDO1lBRUQsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBb0IsRUFBRSxtQkFBeUMsRUFBRSxXQUE4QjtZQUN4SCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2hELE1BQU0sWUFBWSxHQUFHLE1BQU0sbUJBQW1CLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNuRixNQUFNLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzRSxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUNwRCxDQUFDO0tBQ0Q7SUE1RUQsa0VBNEVDO0lBS0QsU0FBUyxvQkFBb0IsQ0FBQyxPQUF5QixFQUFFLEtBQWE7UUFDckUsTUFBTSxPQUFPLEdBQWdCLEVBQUUsQ0FBQztRQUNoQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ25GLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRSxDQUFDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBRUQsU0FBUyx3QkFBd0IsQ0FBQyxJQUFvQjtRQUNyRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNwRCxNQUFNLGtCQUFrQixHQUFHLFVBQVUsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDN0UsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsSUFBSSxrQkFBa0IsR0FBRyxVQUFVLEVBQUUsQ0FBQztnQkFDckMsT0FBTyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6QyxDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDekMsQ0FBQyJ9