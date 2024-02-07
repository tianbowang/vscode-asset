/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/services/bulkEditService", "vs/editor/contrib/snippet/browser/snippetParser"], function (require, exports, bulkEditService_1, snippetParser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sortEditsByYieldTo = exports.createCombinedWorkspaceEdit = void 0;
    /**
     * Given a {@link DropOrPasteEdit} and set of ranges, creates a {@link WorkspaceEdit} that applies the insert text from
     * the {@link DropOrPasteEdit} at each range plus any additional edits.
     */
    function createCombinedWorkspaceEdit(uri, ranges, edit) {
        // If the edit insert text is empty, skip applying at each range
        if (typeof edit.insertText === 'string' ? edit.insertText === '' : edit.insertText.snippet === '') {
            return {
                edits: edit.additionalEdit?.edits ?? []
            };
        }
        return {
            edits: [
                ...ranges.map(range => new bulkEditService_1.ResourceTextEdit(uri, { range, text: typeof edit.insertText === 'string' ? snippetParser_1.SnippetParser.escape(edit.insertText) + '$0' : edit.insertText.snippet, insertAsSnippet: true })),
                ...(edit.additionalEdit?.edits ?? [])
            ]
        };
    }
    exports.createCombinedWorkspaceEdit = createCombinedWorkspaceEdit;
    function sortEditsByYieldTo(edits) {
        function yieldsTo(yTo, other) {
            return ('providerId' in yTo && yTo.providerId === other.providerId)
                || ('mimeType' in yTo && yTo.mimeType === other.handledMimeType);
        }
        // Build list of nodes each node yields to
        const yieldsToMap = new Map();
        for (const edit of edits) {
            for (const yTo of edit.yieldTo ?? []) {
                for (const other of edits) {
                    if (other === edit) {
                        continue;
                    }
                    if (yieldsTo(yTo, other)) {
                        let arr = yieldsToMap.get(edit);
                        if (!arr) {
                            arr = [];
                            yieldsToMap.set(edit, arr);
                        }
                        arr.push(other);
                    }
                }
            }
        }
        if (!yieldsToMap.size) {
            return Array.from(edits);
        }
        // Topological sort
        const visited = new Set();
        const tempStack = [];
        function visit(nodes) {
            if (!nodes.length) {
                return [];
            }
            const node = nodes[0];
            if (tempStack.includes(node)) {
                console.warn(`Yield to cycle detected for ${node.providerId}`);
                return nodes;
            }
            if (visited.has(node)) {
                return visit(nodes.slice(1));
            }
            let pre = [];
            const yTo = yieldsToMap.get(node);
            if (yTo) {
                tempStack.push(node);
                pre = visit(yTo);
                tempStack.pop();
            }
            visited.add(node);
            return [...pre, node, ...visit(nodes.slice(1))];
        }
        return visit(Array.from(edits));
    }
    exports.sortEditsByYieldTo = sortEditsByYieldTo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZHJvcE9yUGFzdGVJbnRvL2Jyb3dzZXIvZWRpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEc7OztPQUdHO0lBQ0gsU0FBZ0IsMkJBQTJCLENBQUMsR0FBUSxFQUFFLE1BQXdCLEVBQUUsSUFBcUI7UUFDcEcsZ0VBQWdFO1FBQ2hFLElBQUksT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQ25HLE9BQU87Z0JBQ04sS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsS0FBSyxJQUFJLEVBQUU7YUFDdkMsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPO1lBQ04sS0FBSyxFQUFFO2dCQUNOLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUNyQixJQUFJLGtDQUFnQixDQUFDLEdBQUcsRUFDdkIsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLDZCQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FDcEosQ0FBQztnQkFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDO2FBQ3JDO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFqQkQsa0VBaUJDO0lBRUQsU0FBZ0Is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