/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/marked/marked", "vs/editor/browser/services/bulkEditService", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/services/editor/common/editorService"], function (require, exports, codicons_1, marked_1, bulkEditService_1, nls_1, actions_1, contextkey_1, bulkCellEdits_1, chatActions_1, chat_1, chatContextKeys_1, chatService_1, chatViewModel_1, notebookCommon_1, notebookContextKeys_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatTitleActions = void 0;
    function registerChatTitleActions() {
        (0, actions_1.registerAction2)(class MarkHelpfulAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.markHelpful',
                    title: {
                        value: (0, nls_1.localize)('interactive.helpful.label', "Helpful"),
                        original: 'Helpful'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.thumbsup,
                    toggled: chatContextKeys_1.CONTEXT_RESPONSE_VOTE.isEqualTo('up'),
                    menu: {
                        id: actions_1.MenuId.ChatMessageTitle,
                        group: 'navigation',
                        order: 1,
                        when: chatContextKeys_1.CONTEXT_RESPONSE
                    }
                });
            }
            run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.isResponseVM)(item)) {
                    return;
                }
                const chatService = accessor.get(chatService_1.IChatService);
                chatService.notifyUserAction({
                    providerId: item.providerId,
                    agentId: item.agent?.id,
                    sessionId: item.sessionId,
                    requestId: item.requestId,
                    action: {
                        kind: 'vote',
                        direction: chatService_1.InteractiveSessionVoteDirection.Up,
                    }
                });
                item.setVote(chatService_1.InteractiveSessionVoteDirection.Up);
            }
        });
        (0, actions_1.registerAction2)(class MarkUnhelpfulAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.markUnhelpful',
                    title: {
                        value: (0, nls_1.localize)('interactive.unhelpful.label', "Unhelpful"),
                        original: 'Unhelpful'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.thumbsdown,
                    toggled: chatContextKeys_1.CONTEXT_RESPONSE_VOTE.isEqualTo('down'),
                    menu: {
                        id: actions_1.MenuId.ChatMessageTitle,
                        group: 'navigation',
                        order: 2,
                        when: chatContextKeys_1.CONTEXT_RESPONSE
                    }
                });
            }
            run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.isResponseVM)(item)) {
                    return;
                }
                const chatService = accessor.get(chatService_1.IChatService);
                chatService.notifyUserAction({
                    providerId: item.providerId,
                    agentId: item.agent?.id,
                    sessionId: item.sessionId,
                    requestId: item.requestId,
                    action: {
                        kind: 'vote',
                        direction: chatService_1.InteractiveSessionVoteDirection.Down,
                    }
                });
                item.setVote(chatService_1.InteractiveSessionVoteDirection.Down);
            }
        });
        (0, actions_1.registerAction2)(class ReportIssueForBugAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.reportIssueForBug',
                    title: {
                        value: (0, nls_1.localize)('interactive.reportIssueForBug.label', "Report Issue"),
                        original: 'Report Issue'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.report,
                    menu: {
                        id: actions_1.MenuId.ChatMessageTitle,
                        group: 'navigation',
                        order: 3,
                        when: contextkey_1.ContextKeyExpr.and(chatContextKeys_1.CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING, chatContextKeys_1.CONTEXT_RESPONSE)
                    }
                });
            }
            run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.isResponseVM)(item)) {
                    return;
                }
                const chatService = accessor.get(chatService_1.IChatService);
                chatService.notifyUserAction({
                    providerId: item.providerId,
                    agentId: item.agent?.id,
                    sessionId: item.sessionId,
                    requestId: item.requestId,
                    action: {
                        kind: 'bug'
                    }
                });
            }
        });
        (0, actions_1.registerAction2)(class InsertToNotebookAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.insertIntoNotebook',
                    title: {
                        value: (0, nls_1.localize)('interactive.insertIntoNotebook.label', "Insert into Notebook"),
                        original: 'Insert into Notebook'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.insert,
                    menu: {
                        id: actions_1.MenuId.ChatMessageTitle,
                        group: 'navigation',
                        isHiddenByDefault: true,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, chatContextKeys_1.CONTEXT_RESPONSE, chatContextKeys_1.CONTEXT_RESPONSE_FILTERED.negate())
                    }
                });
            }
            async run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.isResponseVM)(item)) {
                    return;
                }
                const editorService = accessor.get(editorService_1.IEditorService);
                if (editorService.activeEditorPane?.getId() === notebookCommon_1.NOTEBOOK_EDITOR_ID) {
                    const notebookEditor = editorService.activeEditorPane.getControl();
                    if (!notebookEditor.hasModel()) {
                        return;
                    }
                    if (notebookEditor.isReadOnly) {
                        return;
                    }
                    const value = item.response.asString();
                    const splitContents = splitMarkdownAndCodeBlocks(value);
                    const focusRange = notebookEditor.getFocus();
                    const index = Math.max(focusRange.end, 0);
                    const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
                    await bulkEditService.apply([
                        new bulkCellEdits_1.ResourceNotebookCellEdit(notebookEditor.textModel.uri, {
                            editType: 1 /* CellEditType.Replace */,
                            index: index,
                            count: 0,
                            cells: splitContents.map(content => {
                                const kind = content.type === 'markdown' ? notebookCommon_1.CellKind.Markup : notebookCommon_1.CellKind.Code;
                                const language = content.type === 'markdown' ? 'markdown' : content.language;
                                const mime = content.type === 'markdown' ? 'text/markdown' : `text/x-${content.language}`;
                                return {
                                    cellKind: kind,
                                    language,
                                    mime,
                                    source: content.content,
                                    outputs: [],
                                    metadata: {}
                                };
                            })
                        })
                    ], { quotableLabel: 'Insert into Notebook' });
                }
            }
        });
        (0, actions_1.registerAction2)(class RemoveAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.remove',
                    title: {
                        value: (0, nls_1.localize)('chat.remove.label', "Remove Request and Response"),
                        original: 'Remove Request and Response'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.x,
                    keybinding: {
                        primary: 20 /* KeyCode.Delete */,
                        mac: {
                            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                        },
                        when: contextkey_1.ContextKeyExpr.and(chatContextKeys_1.CONTEXT_IN_CHAT_SESSION, chatContextKeys_1.CONTEXT_IN_CHAT_INPUT.negate()),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    },
                    menu: {
                        id: actions_1.MenuId.ChatMessageTitle,
                        group: 'navigation',
                        order: 2,
                        when: chatContextKeys_1.CONTEXT_REQUEST
                    }
                });
            }
            run(accessor, ...args) {
                let item = args[0];
                if (!(0, chatViewModel_1.isRequestVM)(item)) {
                    const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
                    const widget = chatWidgetService.lastFocusedWidget;
                    item = widget?.getFocus();
                }
                const requestId = (0, chatViewModel_1.isRequestVM)(item) ? item.id :
                    (0, chatViewModel_1.isResponseVM)(item) ? item.requestId : undefined;
                if (requestId) {
                    const chatService = accessor.get(chatService_1.IChatService);
                    chatService.removeRequest(item.sessionId, requestId);
                }
            }
        });
    }
    exports.registerChatTitleActions = registerChatTitleActions;
    function splitMarkdownAndCodeBlocks(markdown) {
        const lexer = new marked_1.marked.Lexer();
        const tokens = lexer.lex(markdown);
        const splitContent = [];
        let markdownPart = '';
        tokens.forEach((token) => {
            if (token.type === 'code') {
                if (markdownPart.trim()) {
                    splitContent.push({ type: 'markdown', content: markdownPart });
                    markdownPart = '';
                }
                splitContent.push({
                    type: 'code',
                    language: token.lang || '',
                    content: token.text,
                });
            }
            else {
                markdownPart += token.raw;
            }
        });
        if (markdownPart.trim()) {
            splitContent.push({ type: 'markdown', content: markdownPart });
        }
        return splitContent;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFRpdGxlQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2FjdGlvbnMvY2hhdFRpdGxlQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFzQmhHLFNBQWdCLHdCQUF3QjtRQUN2QyxJQUFBLHlCQUFlLEVBQUMsTUFBTSxpQkFBa0IsU0FBUSxpQkFBTztZQUN0RDtnQkFDQyxLQUFLLENBQUM7b0JBQ0wsRUFBRSxFQUFFLG1DQUFtQztvQkFDdkMsS0FBSyxFQUFFO3dCQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSxTQUFTLENBQUM7d0JBQ3ZELFFBQVEsRUFBRSxTQUFTO3FCQUNuQjtvQkFDRCxFQUFFLEVBQUUsS0FBSztvQkFDVCxRQUFRLEVBQUUsMkJBQWE7b0JBQ3ZCLElBQUksRUFBRSxrQkFBTyxDQUFDLFFBQVE7b0JBQ3RCLE9BQU8sRUFBRSx1Q0FBcUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO29CQUM5QyxJQUFJLEVBQUU7d0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsZ0JBQWdCO3dCQUMzQixLQUFLLEVBQUUsWUFBWTt3QkFDbkIsS0FBSyxFQUFFLENBQUM7d0JBQ1IsSUFBSSxFQUFFLGtDQUFnQjtxQkFDdEI7aUJBQ0QsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDN0MsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsSUFBQSw0QkFBWSxFQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ3pCLE9BQU87Z0JBQ1IsQ0FBQztnQkFFRCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFD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