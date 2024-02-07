/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/bulkEditService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/language", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/clipboard/browser/clipboard", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, cancellation_1, codicons_1, editorBrowser_1, bulkEditService_1, codeEditorService_1, range_1, editorContextKeys_1, language_1, languageFeatures_1, clipboard_1, nls_1, actions_1, clipboardService_1, contextkey_1, terminal_1, chatActions_1, chat_1, chatContextKeys_1, chatService_1, chatViewModel_1, inlineChat_1, cellOperations_1, notebookCommon_1, terminal_2, editorService_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatCodeBlockActions = exports.isCodeBlockActionContext = void 0;
    function isCodeBlockActionContext(thing) {
        return typeof thing === 'object' && thing !== null && 'code' in thing && 'element' in thing;
    }
    exports.isCodeBlockActionContext = isCodeBlockActionContext;
    function isResponseFiltered(context) {
        return (0, chatViewModel_1.isResponseVM)(context.element) && context.element.errorDetails?.responseIsFiltered;
    }
    function getUsedDocuments(context) {
        return (0, chatViewModel_1.isResponseVM)(context.element) ? context.element.usedContext?.documents : undefined;
    }
    class ChatCodeBlockAction extends actions_1.Action2 {
        run(accessor, ...args) {
            let context = args[0];
            if (!isCodeBlockActionContext(context)) {
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
                if (!editor) {
                    return;
                }
                context = getContextFromEditor(editor, accessor);
                if (!isCodeBlockActionContext(context)) {
                    return;
                }
            }
            return this.runWithContext(accessor, context);
        }
    }
    function registerChatCodeBlockActions() {
        (0, actions_1.registerAction2)(class CopyCodeBlockAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.copyCodeBlock',
                    title: {
                        value: (0, nls_1.localize)('interactive.copyCodeBlock.label', "Copy"),
                        original: 'Copy'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.copy,
                    menu: {
                        id: actions_1.MenuId.ChatCodeBlock,
                        group: 'navigation',
                    }
                });
            }
            run(accessor, ...args) {
                const context = args[0];
                if (!isCodeBlockActionContext(context) || isResponseFiltered(context)) {
                    return;
                }
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                clipboardService.writeText(context.code);
                if ((0, chatViewModel_1.isResponseVM)(context.element)) {
                    const chatService = accessor.get(chatService_1.IChatService);
                    chatService.notifyUserAction({
                        providerId: context.element.providerId,
                        agentId: context.element.agent?.id,
                        sessionId: context.element.sessionId,
                        requestId: context.element.requestId,
                        action: {
                            kind: 'copy',
                            codeBlockIndex: context.codeBlockIndex,
                            copyKind: chatService_1.ChatAgentCopyKind.Toolbar,
                            copiedCharacters: context.code.length,
                            totalCharacters: context.code.length,
                            copiedText: context.code,
                        }
                    });
                }
            }
        });
        clipboard_1.CopyAction?.addImplementation(50000, 'chat-codeblock', (accessor) => {
            // get active code editor
            const editor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
            if (!editor) {
                return false;
            }
            const editorModel = editor.getModel();
            if (!editorModel) {
                return false;
            }
            const context = getContextFromEditor(editor, accessor);
            if (!context) {
                return false;
            }
            const noSelection = editor.getSelections()?.length === 1 && editor.getSelection()?.isEmpty();
            const copiedText = noSelection ?
                editorModel.getValue() :
                editor.getSelections()?.reduce((acc, selection) => acc + editorModel.getValueInRange(selection), '') ?? '';
            const totalCharacters = editorModel.getValueLength();
            // Report copy to extensions
            const chatService = accessor.get(chatService_1.IChatService);
            chatService.notifyUserAction({
                providerId: context.element.providerId,
                agentId: context.element.agent?.id,
                sessionId: context.element.sessionId,
                requestId: context.element.requestId,
                action: {
                    kind: 'copy',
                    codeBlockIndex: context.codeBlockIndex,
                    copyKind: chatService_1.ChatAgentCopyKind.Action,
                    copiedText,
                    copiedCharacters: copiedText.length,
                    totalCharacters,
                }
            });
            // Copy full cell if no selection, otherwise fall back on normal editor implementation
            if (noSelection) {
                accessor.get(clipboardService_1.IClipboardService).writeText(context.code);
                return true;
            }
            return false;
        });
        (0, actions_1.registerAction2)(class InsertCodeBlockAction extends ChatCodeBlockAction {
            constructor() {
                super({
                    id: 'workbench.action.chat.insertCodeBlock',
                    title: {
                        value: (0, nls_1.localize)('interactive.insertCodeBlock.label', "Insert at Cursor"),
                        original: 'Insert at Cursor'
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.insert,
                    menu: {
                        id: actions_1.MenuId.ChatCodeBlock,
                        group: 'navigation',
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION,
                    },
                    keybinding: {
                        when: contextkey_1.ContextKeyExpr.and(chatContextKeys_1.CONTEXT_IN_CHAT_SESSION, chatContextKeys_1.CONTEXT_IN_CHAT_INPUT.negate()),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                        mac: { primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    },
                });
            }
            async runWithContext(accessor, context) {
                const editorService = accessor.get(editorService_1.IEditorService);
                const textFileService = accessor.get(textfiles_1.ITextFileService);
                if (isResponseFiltered(context)) {
                    // When run from command palette
                    return;
                }
                if (editorService.activeEditorPane?.getId() === notebookCommon_1.NOTEBOOK_EDITOR_ID) {
                    return this.handleNotebookEditor(accessor, editorService.activeEditorPane.getControl(), context);
                }
                let activeEditorControl = editorService.activeTextEditorControl;
                if ((0, editorBrowser_1.isDiffEditor)(activeEditorControl)) {
                    activeEditorControl = activeEditorControl.getOriginalEditor().hasTextFocus() ? activeEditorControl.getOriginalEditor() : activeEditorControl.getModifiedEditor();
                }
                if (!(0, editorBrowser_1.isCodeEditor)(activeEditorControl)) {
                    return;
                }
                const activeModel = activeEditorControl.getModel();
                if (!activeModel) {
                    return;
                }
                // Check if model is editable, currently only support untitled and text file
                const activeTextModel = textFileService.files.get(activeModel.uri) ?? textFileService.untitled.get(activeModel.uri);
                if (!activeTextModel || activeTextModel.isReadonly()) {
                    return;
                }
                await this.handleTextEditor(accessor, activeEditorControl, activeModel, context);
            }
            async handleNotebookEditor(accessor, notebookEditor, context) {
                if (!notebookEditor.hasModel()) {
                    return;
                }
                if (notebookEditor.isReadOnly) {
                    return;
                }
                if (notebookEditor.activeCodeEditor?.hasTextFocus()) {
                    const codeEditor = notebookEditor.activeCodeEditor;
                    const textModel = codeEditor.getModel();
                    if (textModel) {
                        return this.handleTextEditor(accessor, codeEditor, textModel, context);
                    }
                }
                const languageService = accessor.get(language_1.ILanguageService);
                const focusRange = notebookEditor.getFocus();
                const next = Math.max(focusRange.end - 1, 0);
                (0, cellOperations_1.insertCell)(languageService, notebookEditor, next, notebookCommon_1.CellKind.Code, 'below', context.code, true);
                this.notifyUserAction(accessor, context);
            }
            async handleTextEditor(accessor, codeEditor, activeModel, codeBlockActionContext) {
                this.notifyUserAction(accessor, codeBlockActionContext);
                const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const mappedEditsProviders = accessor.get(languageFeatures_1.ILanguageFeaturesService).mappedEditsProvider.ordered(activeModel);
                // try applying workspace edit that was returned by a MappedEditsProvider, else simply insert at selection
                let mappedEdits = null;
                if (mappedEditsProviders.length > 0) {
                    const mostRelevantProvider = mappedEditsProviders[0]; // TODO@ulugbekna: should we try all providers?
                    // 0th sub-array - editor selections array if there are any selections
                    // 1st sub-array - array with documents used to get the chat reply
                    const docRefs = [];
                    if (codeEditor.hasModel()) {
                        const model = codeEditor.getModel();
                        const currentDocUri = model.uri;
                        const currentDocVersion = model.getVersionId();
                        const selections = codeEditor.getSelections();
                        if (selections.length > 0) {
                            docRefs.push([
                                {
                                    uri: currentDocUri,
                                    version: currentDocVersion,
                                    ranges: selections,
                                }
                            ]);
                        }
                    }
                    const usedDocuments = getUsedDocuments(codeBlockActionContext);
                    if (usedDocuments) {
                        docRefs.push(usedDocuments);
                    }
                    const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
                    mappedEdits = await mostRelevantProvider.provideMappedEdits(activeModel, [codeBlockActionContext.code], { documents: docRefs }, cancellationTokenSource.token);
                }
                if (mappedEdits) {
                    await bulkEditService.apply(mappedEdits);
                }
                else {
                    const activeSelection = codeEditor.getSelection() ?? new range_1.Range(activeModel.getLineCount(), 1, activeModel.getLineCount(), 1);
                    await bulkEditService.apply([
                        new bulkEditService_1.ResourceTextEdit(activeModel.uri, {
                            range: activeSelection,
                            text: codeBlockActionContext.code,
                        }),
                    ]);
                }
                codeEditorService.listCodeEditors().find(editor => editor.getModel()?.uri.toString() === activeModel.uri.toString())?.focus();
            }
            notifyUserAction(accessor, context) {
                if ((0, chatViewModel_1.isResponseVM)(context.element)) {
                    const chatService = accessor.get(chatService_1.IChatService);
                    chatService.notifyUserAction({
                        providerId: context.element.providerId,
                        agentId: context.element.agent?.id,
                        sessionId: context.element.sessionId,
                        requestId: context.element.requestId,
                        action: {
                            kind: 'insert',
                            codeBlockIndex: context.codeBlockIndex,
                            totalCharacters: context.code.length,
                        }
                    });
                }
            }
        });
        (0, actions_1.registerAction2)(class InsertIntoNewFileAction extends ChatCodeBlockAction {
            constructor() {
                super({
                    id: 'workbench.action.chat.insertIntoNewFile',
                    title: {
                        value: (0, nls_1.localize)('interactive.insertIntoNewFile.label', "Insert into New File"),
                        original: 'Insert into New File'
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.newFile,
                    menu: {
                        id: actions_1.MenuId.ChatCodeBlock,
                        group: 'navigation',
                        isHiddenByDefault: true,
                    }
                });
            }
            async runWithContext(accessor, context) {
                if (isResponseFiltered(context)) {
                    // When run from command palette
                    return;
                }
                const editorService = accessor.get(editorService_1.IEditorService);
                const chatService = accessor.get(chatService_1.IChatService);
                editorService.openEditor({ contents: context.code, languageId: context.languageId, resource: undefined });
                if ((0, chatViewModel_1.isResponseVM)(context.element)) {
                    chatService.notifyUserAction({
                        providerId: context.element.providerId,
                        agentId: context.element.agent?.id,
                        sessionId: context.element.sessionId,
                        requestId: context.element.requestId,
                        action: {
                            kind: 'insert',
                            codeBlockIndex: context.codeBlockIndex,
                            totalCharacters: context.code.length,
                            newFile: true
                        }
                    });
                }
            }
        });
        const shellLangIds = [
            'powershell',
            'shellscript'
        ];
        (0, actions_1.registerAction2)(class RunInTerminalAction extends ChatCodeBlockAction {
            constructor() {
                super({
                    id: 'workbench.action.chat.runInTerminal',
                    title: {
                        value: (0, nls_1.localize)('interactive.runInTerminal.label', "Insert into Terminal"),
                        original: 'Insert into Terminal'
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.terminal,
                    menu: [{
                            id: actions_1.MenuId.ChatCodeBlock,
                            group: 'navigation',
                            when: contextkey_1.ContextKeyExpr.and(chatContextKeys_1.CONTEXT_IN_CHAT_SESSION, contextkey_1.ContextKeyExpr.or(...shellLangIds.map(e => contextkey_1.ContextKeyExpr.equals(editorContextKeys_1.EditorContextKeys.languageId.key, e)))),
                        },
                        {
                            id: actions_1.MenuId.ChatCodeBlock,
                            group: 'navigation',
                            isHiddenByDefault: true,
                            when: contextkey_1.ContextKeyExpr.and(chatContextKeys_1.CONTEXT_IN_CHAT_SESSION, ...shellLangIds.map(e => contextkey_1.ContextKeyExpr.notEquals(editorContextKeys_1.EditorContextKeys.languageId.key, e)))
                        },
                        {
                            id: actions_1.MenuId.ChatCodeBlock,
                            group: 'navigation',
                            when: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                        }],
                    keybinding: [{
                            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */,
                            mac: {
                                primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
                            },
                            weight: 100 /* KeybindingWeight.EditorContrib */,
                            when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION,
                        }]
                });
            }
            async runWithContext(accessor, context) {
                if (isResponseFiltered(context)) {
                    // When run from command palette
                    return;
                }
                const chatService = accessor.get(chatService_1.IChatService);
                const terminalService = accessor.get(terminal_2.ITerminalService);
                const editorService = accessor.get(editorService_1.IEditorService);
                const terminalEditorService = accessor.get(terminal_2.ITerminalEditorService);
                const terminalGroupService = accessor.get(terminal_2.ITerminalGroupService);
                let terminal = await terminalService.getActiveOrCreateInstance();
                // isFeatureTerminal = debug terminal or task terminal
                const unusableTerminal = terminal.xterm?.isStdinDisabled || terminal.shellLaunchConfig.isFeatureTerminal;
                terminal = unusableTerminal ? await terminalService.createTerminal() : terminal;
                terminalService.setActiveInstance(terminal);
                await terminal.focusWhenReady(true);
                if (terminal.target === terminal_1.TerminalLocation.Editor) {
                    const existingEditors = editorService.findEditors(terminal.resource);
                    terminalEditorService.openEditor(terminal, { viewColumn: existingEditors?.[0].groupId });
                }
                else {
                    terminalGroupService.showPanel(true);
                }
                terminal.runCommand(context.code, false);
                if ((0, chatViewModel_1.isResponseVM)(context.element)) {
                    chatService.notifyUserAction({
                        providerId: context.element.providerId,
                        agentId: context.element.agent?.id,
                        sessionId: context.element.sessionId,
                        requestId: context.element.requestId,
                        action: {
                            kind: 'runInTerminal',
                            codeBlockIndex: context.codeBlockIndex,
                            languageId: context.languageId,
                        }
                    });
                }
            }
        });
        function navigateCodeBlocks(accessor, reverse) {
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
            const widget = chatWidgetService.lastFocusedWidget;
            if (!widget) {
                return;
            }
            const editor = codeEditorService.getFocusedCodeEditor();
            const editorUri = editor?.getModel()?.uri;
            const curCodeBlockInfo = editorUri ? widget.getCodeBlockInfoForEditor(editorUri) : undefined;
            const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
            const focusedResponse = (0, chatViewModel_1.isResponseVM)(focused) ? focused : undefined;
            const currentResponse = curCodeBlockInfo ?
                curCodeBlockInfo.element :
                (focusedResponse ?? widget.viewModel?.getItems().reverse().find((item) => (0, chatViewModel_1.isResponseVM)(item)));
            if (!currentResponse) {
                return;
            }
            widget.reveal(currentResponse);
            const responseCodeblocks = widget.getCodeBlockInfosForResponse(currentResponse);
            const focusIdx = curCodeBlockInfo ?
                (curCodeBlockInfo.codeBlockIndex + (reverse ? -1 : 1) + responseCodeblocks.length) % responseCodeblocks.length :
                reverse ? responseCodeblocks.length - 1 : 0;
            responseCodeblocks[focusIdx]?.focus();
        }
        (0, actions_1.registerAction2)(class NextCodeBlockAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.nextCodeBlock',
                    title: {
                        value: (0, nls_1.localize)('interactive.nextCodeBlock.label', "Next Code Block"),
                        original: 'Next Code Block'
                    },
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 12 /* KeyCode.PageDown */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 12 /* KeyCode.PageDown */, },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION,
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                });
            }
            run(accessor, ...args) {
                navigateCodeBlocks(accessor);
            }
        });
        (0, actions_1.registerAction2)(class PreviousCodeBlockAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.previousCodeBlock',
                    title: {
                        value: (0, nls_1.localize)('interactive.previousCodeBlock.label', "Previous Code Block"),
                        original: 'Previous Code Block'
                    },
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 11 /* KeyCode.PageUp */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 11 /* KeyCode.PageUp */, },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION,
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                });
            }
            run(accessor, ...args) {
                navigateCodeBlocks(accessor, true);
            }
        });
    }
    exports.registerChatCodeBlockActions = registerChatCodeBlockActions;
    function getContextFromEditor(editor, accessor) {
        const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
        const model = editor.getModel();
        if (!model) {
            return;
        }
        const widget = chatWidgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        const codeBlockInfo = widget.getCodeBlockInfoForEditor(model.uri);
        if (!codeBlockInfo) {
            return;
        }
        return {
            element: codeBlockInfo.element,
            codeBlockIndex: codeBlockInfo.codeBlockIndex,
            code: editor.getValue(),
            languageId: editor.getModel().getLanguageId(),
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdENvZGVibG9ja0FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9hY3Rpb25zL2NoYXRDb2RlYmxvY2tBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXlDaEcsU0FBZ0Isd0JBQXdCLENBQUMsS0FBYztRQUN0RCxPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLE1BQU0sSUFBSSxLQUFLLElBQUksU0FBUyxJQUFJLEtBQUssQ0FBQztJQUM3RixDQUFDO0lBRkQsNERBRUM7SUFFRCxTQUFTLGtCQUFrQixDQUFDLE9BQWdDO1FBQzNELE9BQU8sSUFBQSw0QkFBWSxFQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxrQkFBa0IsQ0FBQztJQUMxRixDQUFDO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFnQztRQUN6RCxPQUFPLElBQUEsNEJBQVksRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQzNGLENBQUM7SUFFRCxNQUFlLG1CQUFvQixTQUFRLGlCQUFPO1FBQ2pELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztZQUM3QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQ0FBa0IsQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLE1B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