/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageCloseWithConflicts = exports.ctxMergeResultUri = exports.ctxMergeBaseUri = exports.ctxMergeEditorShowNonConflictingChanges = exports.ctxMergeEditorShowBaseAtTop = exports.ctxMergeEditorShowBase = exports.ctxMergeEditorLayout = exports.ctxIsMergeResultEditor = exports.ctxIsMergeEditor = void 0;
    exports.ctxIsMergeEditor = new contextkey_1.RawContextKey('isMergeEditor', false, { type: 'boolean', description: (0, nls_1.localize)('is', 'The editor is a merge editor') });
    exports.ctxIsMergeResultEditor = new contextkey_1.RawContextKey('isMergeResultEditor', false, { type: 'boolean', description: (0, nls_1.localize)('isr', 'The editor is a the result editor of a merge editor.') });
    exports.ctxMergeEditorLayout = new contextkey_1.RawContextKey('mergeEditorLayout', 'mixed', { type: 'string', description: (0, nls_1.localize)('editorLayout', 'The layout mode of a merge editor') });
    exports.ctxMergeEditorShowBase = new contextkey_1.RawContextKey('mergeEditorShowBase', false, { type: 'boolean', description: (0, nls_1.localize)('showBase', 'If the merge editor shows the base version') });
    exports.ctxMergeEditorShowBaseAtTop = new contextkey_1.RawContextKey('mergeEditorShowBaseAtTop', false, { type: 'boolean', description: (0, nls_1.localize)('showBaseAtTop', 'If base should be shown at the top') });
    exports.ctxMergeEditorShowNonConflictingChanges = new contextkey_1.RawContextKey('mergeEditorShowNonConflictingChanges', false, { type: 'boolean', description: (0, nls_1.localize)('showNonConflictingChanges', 'If the merge editor shows non-conflicting changes') });
    exports.ctxMergeBaseUri = new contextkey_1.RawContextKey('mergeEditorBaseUri', '', { type: 'string', description: (0, nls_1.localize)('baseUri', 'The uri of the baser of a merge editor') });
    exports.ctxMergeResultUri = new contextkey_1.RawContextKey('mergeEditorResultUri', '', { type: 'string', description: (0, nls_1.localize)('resultUri', 'The uri of the result of a merge editor') });
    exports.StorageCloseWithConflicts = 'mergeEditorCloseWithConflicts';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2NvbW1vbi9tZXJnZUVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPbkYsUUFBQSxnQkFBZ0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsZUFBZSxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLElBQUksRUFBRSw4QkFBOEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN4SixRQUFBLHNCQUFzQixHQUFHLElBQUksMEJBQWEsQ0FBVSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxLQUFLLEVBQUUsc0RBQXNELENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0wsUUFBQSxvQkFBb0IsR0FBRyxJQUFJLDBCQUFhLENBQXdCLG1CQUFtQixFQUFFLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxtQ0FBbUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5TCxRQUFBLHNCQUFzQixHQUFHLElBQUksMEJBQWEsQ0FBVSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsNENBQTRDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDeEwsUUFBQSwyQkFBMkIsR0FBRyxJQUFJLDBCQUFhLENBQVUsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFFLG9DQUFvQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9MLFFBQUEsdUNBQXVDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHNDQUFzQyxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLG1EQUFtRCxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWxQLFFBQUEsZUFBZSxHQUFHLElBQUksMEJBQWEsQ0FBUyxvQkFBb0IsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsd0NBQXdDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEssUUFBQSxpQkFBaUIsR0FBRyxJQUFJLDBCQUFhLENBQVMsc0JBQXNCLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLHlDQUF5QyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBVzdLLFFBQUEseUJBQXlCLEdBQUcsK0JBQStCLENBQUMifQ==