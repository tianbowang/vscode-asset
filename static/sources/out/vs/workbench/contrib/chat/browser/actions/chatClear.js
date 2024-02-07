/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, chatEditorInput_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clearChatEditor = void 0;
    async function clearChatEditor(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const chatEditorInput = editorService.activeEditor;
        if (chatEditorInput instanceof chatEditorInput_1.ChatEditorInput && chatEditorInput.providerId) {
            await editorService.replaceEditors([{
                    editor: chatEditorInput,
                    replacement: { resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { providerId: chatEditorInput.providerId, pinned: true } } }
                }], editorGroupsService.activeGroup);
        }
    }
    exports.clearChatEditor = clearChatEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdENsZWFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvYWN0aW9ucy9jaGF0Q2xlYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUXpGLEtBQUssVUFBVSxlQUFlLENBQUMsUUFBMEI7UUFDL0QsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7UUFDbkQsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBDQUFvQixDQUFDLENBQUM7UUFFL0QsTUFBTSxlQUFlLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQztRQUNuRCxJQUFJLGVBQWUsWUFBWSxpQ0FBZSxJQUFJLGVBQWUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM5RSxNQUFNLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDbkMsTUFBTSxFQUFFLGVBQWU7b0JBQ3ZCLFdBQVcsRUFBRSxFQUFFLFFBQVEsRUFBRSxpQ0FBZSxDQUFDLGVBQWUsRUFBRSxFQUFFLE9BQU8sRUFBc0IsRUFBRSxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtpQkFDL0osQ0FBQyxFQUFFLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7SUFDRixDQUFDO0lBWEQsMENBV0MifQ==