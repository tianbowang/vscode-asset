/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/contextkeys", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, nls_1, actions_1, contextkey_1, viewPane_1, contextkeys_1, viewsService_1, chatActions_1, chat_1, chatEditorInput_1, chatContextKeys_1, chatContributionService_1, chatService_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerMoveActions = exports.getMoveToAction = exports.getMoveToNewWindowAction = exports.getMoveToEditorAction = void 0;
    var MoveToNewLocation;
    (function (MoveToNewLocation) {
        MoveToNewLocation["Editor"] = "Editor";
        MoveToNewLocation["Window"] = "Window";
    })(MoveToNewLocation || (MoveToNewLocation = {}));
    const getMoveToChatActionDescriptorForViewTitle = (viewId, providerId, moveTo) => ({
        id: `workbench.action.chat.${providerId}.openIn${moveTo}`,
        title: {
            value: moveTo === MoveToNewLocation.Editor ? (0, nls_1.localize)('chat.openInEditor.label', "Open Chat in Editor") : (0, nls_1.localize)('chat.openInNewWindow.label', "Open Chat in New Window"),
            original: moveTo === MoveToNewLocation.Editor ? 'Open Chat in Editor' : 'Open Chat in New Window',
        },
        category: chatActions_1.CHAT_CATEGORY,
        precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
        f1: false,
        viewId,
        menu: {
            id: actions_1.MenuId.ViewTitle,
            when: contextkey_1.ContextKeyExpr.equals('view', viewId),
            order: 0
        },
    });
    function getMoveToEditorAction(viewId, providerId) {
        return getMoveToAction(viewId, providerId, MoveToNewLocation.Editor);
    }
    exports.getMoveToEditorAction = getMoveToEditorAction;
    function getMoveToNewWindowAction(viewId, providerId) {
        return getMoveToAction(viewId, providerId, MoveToNewLocation.Window);
    }
    exports.getMoveToNewWindowAction = getMoveToNewWindowAction;
    function getMoveToAction(viewId, providerId, moveTo) {
        return class MoveToAction extends viewPane_1.ViewAction {
            constructor() {
                super(getMoveToChatActionDescriptorForViewTitle(viewId, providerId, moveTo));
            }
            async runInView(accessor, view) {
                const viewModel = view.widget.viewModel;
                if (!viewModel) {
                    return;
                }
                const editorService = accessor.get(editorService_1.IEditorService);
                const sessionId = viewModel.sessionId;
                view.clear();
                await editorService.openEditor({ resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { sessionId }, pinned: true } }, moveTo === MoveToNewLocation.Window ? editorService_1.AUX_WINDOW_GROUP : editorService_1.ACTIVE_GROUP);
            }
        };
    }
    exports.getMoveToAction = getMoveToAction;
    function registerMoveActions() {
        (0, actions_1.registerAction2)(class GlobalMoveToEditorAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: `workbench.action.chat.openInEditor`,
                    title: {
                        value: (0, nls_1.localize)('interactiveSession.openInEditor.label', "Open Chat in Editor"),
                        original: 'Open Chat in Editor'
                    },
                    category: chatActions_1.CHAT_CATEGORY,
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true
                });
            }
            async run(accessor, ...args) {
                executeMoveToAction(accessor, MoveToNewLocation.Editor);
            }
        });
        (0, actions_1.registerAction2)(class GlobalMoveToNewWindowAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: `workbench.action.chat.openInNewWindow`,
                    title: {
                        value: (0, nls_1.localize)('interactiveSession.openInNewWindow.label', "Open Chat in New Window"),
                        original: 'Open Chat In New Window'
                    },
                    category: chatActions_1.CHAT_CATEGORY,
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true
                });
            }
            async run(accessor, ...args) {
                executeMoveToAction(accessor, MoveToNewLocation.Window);
            }
        });
        (0, actions_1.registerAction2)(class GlobalMoveToSidebarAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: `workbench.action.chat.openInSidebar`,
                    title: {
                        value: (0, nls_1.localize)('interactiveSession.openInSidebar.label', "Open Chat in Side Bar"),
                        original: 'Open Chat in Side Bar'
                    },
                    category: chatActions_1.CHAT_CATEGORY,
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    menu: [{
                            id: actions_1.MenuId.EditorTitle,
                            order: 0,
                            when: contextkeys_1.ActiveEditorContext.isEqualTo(chatEditorInput_1.ChatEditorInput.EditorID),
                        }]
                });
            }
            async run(accessor, ...args) {
                return moveToSidebar(accessor);
            }
        });
    }
    exports.registerMoveActions = registerMoveActions;
    async function executeMoveToAction(accessor, moveTo) {
        const widgetService = accessor.get(chat_1.IChatWidgetService);
        const viewService = accessor.get(viewsService_1.IViewsService);
        const chatService = accessor.get(chatService_1.IChatService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const widget = widgetService.lastFocusedWidget;
        if (!widget || !('viewId' in widget.viewContext)) {
            const providerId = chatService.getProviderInfos()[0].id;
            await editorService.openEditor({ resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { providerId }, pinned: true } }, moveTo === MoveToNewLocation.Window ? editorService_1.AUX_WINDOW_GROUP : editorService_1.ACTIVE_GROUP);
            return;
        }
        const viewModel = widget.viewModel;
        if (!viewModel) {
            return;
        }
        const sessionId = viewModel.sessionId;
        const view = await viewService.openView(widget.viewContext.viewId);
        view.clear();
        await editorService.openEditor({ resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { sessionId }, pinned: true } }, moveTo === MoveToNewLocation.Window ? editorService_1.AUX_WINDOW_GROUP : editorService_1.ACTIVE_GROUP);
    }
    async function moveToSidebar(accessor) {
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const chatContribService = accessor.get(chatContributionService_1.IChatContributionService);
        const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const chatEditorInput = editorService.activeEditor;
        if (chatEditorInput instanceof chatEditorInput_1.ChatEditorInput && chatEditorInput.sessionId && chatEditorInput.providerId) {
            await editorService.closeEditor({ editor: chatEditorInput, groupId: editorGroupService.activeGroup.id });
            const viewId = chatContribService.getViewIdForProvider(chatEditorInput.providerId);
            const view = await viewsService.openView(viewId);
            view.loadSession(chatEditorInput.sessionId);
        }
        else {
            const chatService = accessor.get(chatService_1.IChatService);
            const providerId = chatService.getProviderInfos()[0].id;
            const viewId = chatContribService.getViewIdForProvider(providerId);
            await viewsService.openView(viewId);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdE1vdmVBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvYWN0aW9ucy9jaGF0TW92ZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JoRyxJQUFLLGlCQUdKO0lBSEQsV0FBSyxpQkFBaUI7UUFDckIsc0NBQWlCLENBQUE7UUFDakIsc0NBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQUhJLGlCQUFpQixLQUFqQixpQkFBaUIsUUFHckI7SUFFRCxNQUFNLHlDQUF5QyxHQUFHLENBQUMsTUFBYyxFQUFFLFVBQWtCLEVBQUUsTUFBeUIsRUFBa0QsRUFBRSxDQUFDLENBQUM7UUFDckssRUFBRSxFQUFFLHlCQUF5QixVQUFVLFVBQVUsTUFBTSxFQUFFO1FBQ3pELEtBQUssRUFBRTtZQUNOLEtBQUssRUFBRSxNQUFNLEtBQUssaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSx5QkFBeUIsQ0FBQztZQUMzSyxRQUFRLEVBQUUsTUFBTSxLQUFLLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtTQUNqRztRQUNELFFBQVEsRUFBRSwyQkFBYTtRQUN2QixZQUFZLEVBQUUseUNBQXVCO1FBQ3JDLEVBQUUsRUFBRSxLQUFLO1FBQ1QsTUFBTTtRQUNOLElBQUksRUFBRTtZQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7WUFDcEIsSUFBSSxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDM0MsS0FBSyxFQUFFLENB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