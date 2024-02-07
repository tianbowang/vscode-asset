/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/map", "vs/base/common/network", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation"], function (require, exports, buffer_1, map_1, network_1, extensions_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookDocumentWorkbenchService = exports.generate = exports.parse = exports.INotebookDocumentService = void 0;
    exports.INotebookDocumentService = (0, instantiation_1.createDecorator)('notebookDocumentService');
    const _lengths = ['W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f'];
    const _padRegexp = new RegExp(`^[${_lengths.join('')}]+`);
    const _radix = 7;
    function parse(cell) {
        if (cell.scheme !== network_1.Schemas.vscodeNotebookCell) {
            return undefined;
        }
        const idx = cell.fragment.indexOf('s');
        if (idx < 0) {
            return undefined;
        }
        const handle = parseInt(cell.fragment.substring(0, idx).replace(_padRegexp, ''), _radix);
        const _scheme = (0, buffer_1.decodeBase64)(cell.fragment.substring(idx + 1)).toString();
        if (isNaN(handle)) {
            return undefined;
        }
        return {
            handle,
            notebook: cell.with({ scheme: _scheme, fragment: null })
        };
    }
    exports.parse = parse;
    function generate(notebook, handle) {
        const s = handle.toString(_radix);
        const p = s.length < _lengths.length ? _lengths[s.length - 1] : 'z';
        const fragment = `${p}${s}s${(0, buffer_1.encodeBase64)(buffer_1.VSBuffer.fromString(notebook.scheme), true, true)}`;
        return notebook.with({ scheme: network_1.Schemas.vscodeNotebookCell, fragment });
    }
    exports.generate = generate;
    class NotebookDocumentWorkbenchService {
        constructor() {
            this._documents = new map_1.ResourceMap();
        }
        getNotebook(uri) {
            if (uri.scheme === network_1.Schemas.vscodeNotebookCell) {
                const cellUri = parse(uri);
                if (cellUri) {
                    const document = this._documents.get(cellUri.notebook);
                    if (document) {
                        return document;
                    }
                }
            }
            return this._documents.get(uri);
        }
        addNotebookDocument(document) {
            this._documents.set(document.uri, document);
        }
        removeNotebookDocument(document) {
            this._documents.delete(document.uri);
        }
    }
    exports.NotebookDocumentWorkbenchService = NotebookDocumentWorkbenchService;
    (0, extensions_1.registerSingleton)(exports.INotebookDocumentService, NotebookDocumentWorkbenchService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tEb2N1bWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9ub3RlYm9vay9jb21tb24vbm90ZWJvb2tEb2N1bWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU25GLFFBQUEsd0JBQXdCLEdBQUcsSUFBQSwrQkFBZSxFQUEyQix5QkFBeUIsQ0FBQyxDQUFDO0lBTzdHLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDcEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxRCxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDakIsU0FBZ0IsS0FBSyxDQUFDLElBQVM7UUFDOUIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUNoRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDYixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxFQUFF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