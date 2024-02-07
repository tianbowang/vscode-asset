/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/editorContextKeys", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/services/codeEditorService", "vs/base/common/date", "./inlineChatSessionService", "vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp", "vs/platform/accessibility/common/accessibility", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/platform/theme/common/iconRegistry", "vs/workbench/services/preferences/common/preferences"], function (require, exports, codicons_1, editorExtensions_1, embeddedCodeEditorWidget_1, editorContextKeys_1, inlineChatController_1, inlineChat_1, nls_1, actions_1, clipboardService_1, contextkey_1, quickInput_1, editorService_1, codeEditorService_1, date_1, inlineChatSessionService_1, chatAccessibilityHelp_1, accessibility_1, lifecycle_1, commands_1, accessibleViewActions_1, iconRegistry_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineAccessibilityHelpContribution = exports.ContractMessageAction = exports.ExpandMessageAction = exports.ViewInChatAction = exports.CopyRecordings = exports.ConfigureInlineChatAction = exports.CloseAction = exports.CancelSessionAction = exports.AcceptChanges = exports.ReportIssueForBugCommand = exports.FeebackUnhelpfulCommand = exports.FeebackHelpfulCommand = exports.ToggleDiffForChange = exports.DiscardUndoToNewFileAction = exports.DiscardToClipboardAction = exports.DiscardAction = exports.DiscardHunkAction = exports.NextFromHistory = exports.PreviousFromHistory = exports.FocusInlineChat = exports.ArrowOutDownAction = exports.ArrowOutUpAction = exports.StopRequestAction = exports.ReRunRequestAction = exports.MakeRequestAction = exports.AbstractInlineChatAction = exports.UnstashSessionAction = exports.START_INLINE_CHAT = exports.LOCALIZED_START_INLINE_CHAT_STRING = void 0;
    commands_1.CommandsRegistry.registerCommandAlias('interactiveEditor.start', 'inlineChat.start');
    commands_1.CommandsRegistry.registerCommandAlias('interactive.acceptChanges', inlineChat_1.ACTION_ACCEPT_CHANGES);
    exports.LOCALIZED_START_INLINE_CHAT_STRING = (0, nls_1.localize)('run', 'Start Inline Chat');
    exports.START_INLINE_CHAT = (0, iconRegistry_1.registerIcon)('start-inline-chat', codicons_1.Codicon.sparkle, (0, nls_1.localize)('startInlineChat', 'Icon which spawns the inline chat from the editor toolbar.'));
    class UnstashSessionAction extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'inlineChat.unstash',
                title: { value: (0, nls_1.localize)('unstash', 'Resume Last Dismissed Inline Chat'), original: 'Resume Last Dismissed Inline Chat' },
                category: AbstractInlineChatAction.category,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_HAS_STASHED_SESSION, editorContextKeys_1.EditorContextKeys.writable),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */,
                }
            });
        }
        async runEditorCommand(_accessor, editor, ..._args) {
            const ctrl = inlineChatController_1.InlineChatController.get(editor);
            if (ctrl) {
                const session = ctrl.unstashLastSession();
                if (session) {
                    ctrl.run({
                        existingSession: session,
                        isUnstashed: true
                    });
                }
            }
        }
    }
    exports.UnstashSessionAction = UnstashSessionAction;
    class AbstractInlineChatAction extends editorExtensions_1.EditorAction2 {
        static { this.category = { value: (0, nls_1.localize)('cat', 'Inline Chat'), original: 'Inline Chat' }; }
        constructor(desc) {
            super({
                ...desc,
                category: AbstractInlineChatAction.category,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_HAS_PROVIDER, desc.precondition)
            });
        }
        runEditorCommand(accessor, editor, ..._args) {
            if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
                editor = editor.getParentEditor();
            }
            const ctrl = inlineChatController_1.InlineChatController.get(editor);
            if (!ctrl) {
                for (const diffEditor of accessor.get(codeEditorService_1.ICodeEditorService).listDiffEditors()) {
                    if (diffEditor.getOriginalEditor() === editor || diffEditor.getModifiedEditor() === editor) {
                        if (diffEditor instanceof embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget) {
                            this.runEditorCommand(accessor, diffEditor.getParentEditor(), ..._args);
                        }
                    }
                }
                return;
            }
            this.runInlineChatCommand(accessor, ctrl, editor, ..._args);
        }
    }
    exports.AbstractInlineChatAction = AbstractInlineChatAction;
    class MakeRequestAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.accept',
                title: (0, nls_1.localize)('accept', 'Make Request'),
                icon: codicons_1.Codicon.send,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_EMPTY.negate()),
                keybinding: {
                    when: inlineChat_1.CTX_INLINE_CHAT_FOCUSED,
                    weight: 0 /* KeybindingWeight.EditorCore */ + 7,
                    primary: 3 /* KeyCode.Enter */
                },
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_INPUT,
                    group: 'main',
                    order: 1,
                    when: inlineChat_1.CTX_INLINE_CHAT_HAS_ACTIVE_REQUEST.isEqualTo(false)
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.acceptInput();
        }
    }
    exports.MakeRequestAction = MakeRequestAction;
    class ReRunRequestAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: inlineChat_1.ACTION_REGENERATE_RESPONSE,
                title: (0, nls_1.localize)('rerun', 'Regenerate Response'),
                shortTitle: (0, nls_1.localize)('rerunShort', 'Regenerate'),
                icon: codicons_1.Codicon.refresh,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_EMPTY.negate(), inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("empty" /* InlineChatResponseTypes.Empty */)),
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS,
                    group: '2_feedback',
                    order: 3,
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl) {
            ctrl.regenerate();
        }
    }
    exports.ReRunRequestAction = ReRunRequestAction;
    class StopRequestAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.stop',
                title: (0, nls_1.localize)('stop', 'Stop Request'),
                icon: codicons_1.Codicon.debugStop,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_EMPTY.negate(), inlineChat_1.CTX_INLINE_CHAT_HAS_ACTIVE_REQUEST),
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_INPUT,
                    group: 'main',
                    order: 1,
                    when: inlineChat_1.CTX_INLINE_CHAT_HAS_ACTIVE_REQUEST
                },
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.cancelCurrentRequest();
        }
    }
    exports.StopRequestAction = StopRequestAction;
    class ArrowOutUpAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.arrowOutUp',
                title: (0, nls_1.localize)('arrowUp', 'Cursor Up'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_FIRST, editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate(), accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                keybinding: {
                    weight: 0 /* KeybindingWeight.EditorCore */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.arrowOut(true);
        }
    }
    exports.ArrowOutUpAction = ArrowOutUpAction;
    class ArrowOutDownAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.arrowOutDown',
                title: (0, nls_1.localize)('arrowDown', 'Cursor Down'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_LAST, editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate(), accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                keybinding: {
                    weight: 0 /* KeybindingWeight.EditorCore */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.arrowOut(false);
        }
    }
    exports.ArrowOutDownAction = ArrowOutDownAction;
    class FocusInlineChat extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'inlineChat.focus',
                title: { value: (0, nls_1.localize)('focus', 'Focus Input'), original: 'Focus Input' },
                f1: true,
                category: AbstractInlineChatAction.category,
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_FOCUSED.negate(), accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                keybinding: [{
                        weight: 0 /* KeybindingWeight.EditorCore */ + 10, // win against core_command
                        when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.isEqualTo('above'), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                    }, {
                        weight: 0 /* KeybindingWeight.EditorCore */ + 10, // win against core_command
                        when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.isEqualTo('below'), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                    }]
            });
        }
        runEditorCommand(_accessor, editor, ..._args) {
            inlineChatController_1.InlineChatController.get(editor)?.focus();
        }
    }
    exports.FocusInlineChat = FocusInlineChat;
    class PreviousFromHistory extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.previousFromHistory',
                title: (0, nls_1.localize)('previousFromHistory', 'Previous From History'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_START),
                keybinding: {
                    weight: 0 /* KeybindingWeight.EditorCore */ + 10, // win against core_command
                    primary: 16 /* KeyCode.UpArrow */,
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.populateHistory(true);
        }
    }
    exports.PreviousFromHistory = PreviousFromHistory;
    class NextFromHistory extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.nextFromHistory',
                title: (0, nls_1.localize)('nextFromHistory', 'Next From History'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_END),
                keybinding: {
                    weight: 0 /* KeybindingWeight.EditorCore */ + 10, // win against core_command
                    primary: 18 /* KeyCode.DownArrow */,
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.populateHistory(false);
        }
    }
    exports.NextFromHistory = NextFromHistory;
    class DiscardHunkAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.discardHunkChange',
                title: (0, nls_1.localize)('discard', 'Discard'),
                icon: codicons_1.Codicon.clearAll,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS,
                    when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("onlyMessages" /* InlineChatResponseTypes.OnlyMessages */), inlineChat_1.CTX_INLINE_CHAT_EDIT_MODE.isEqualTo("live" /* EditMode.Live */)),
                    group: '0_main',
                    order: 3
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            return ctrl.discardHunk();
        }
    }
    exports.DiscardHunkAction = DiscardHunkAction;
    actions_1.MenuRegistry.appendMenuItem(inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS, {
        submenu: inlineChat_1.MENU_INLINE_CHAT_WIDGET_DISCARD,
        title: (0, nls_1.localize)('discardMenu', "Discard..."),
        icon: codicons_1.Codicon.discard,
        group: '0_main',
        order: 2,
        when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_EDIT_MODE.notEqualsTo("preview" /* EditMode.Preview */), inlineChat_1.CTX_INLINE_CHAT_EDIT_MODE.notEqualsTo("live" /* EditMode.Live */), inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("onlyMessages" /* InlineChatResponseTypes.OnlyMessages */)),
        rememberDefaultAction: true
    });
    class DiscardAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.discard',
                title: (0, nls_1.localize)('discard', 'Discard'),
                icon: codicons_1.Codicon.discard,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */,
                    when: inlineChat_1.CTX_INLINE_CHAT_USER_DID_EDIT.negate()
                },
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_DISCARD,
                    group: '0_main',
                    order: 0
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            await ctrl.cancelSession();
        }
    }
    exports.DiscardAction = DiscardAction;
    class DiscardToClipboardAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.discardToClipboard',
                title: (0, nls_1.localize)('undo.clipboard', 'Discard to Clipboard'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_DID_EDIT),
                // keybinding: {
                // 	weight: KeybindingWeight.EditorContrib + 10,
                // 	primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyZ,
                // 	mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyZ },
                // },
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_DISCARD,
                    group: '0_main',
                    order: 1
                }
            });
        }
        async runInlineChatCommand(accessor, ctrl) {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const changedText = await ctrl.cancelSession();
            if (changedText !== undefined) {
                clipboardService.writeText(changedText);
            }
        }
    }
    exports.DiscardToClipboardAction = DiscardToClipboardAction;
    class DiscardUndoToNewFileAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.discardToFile',
                title: (0, nls_1.localize)('undo.newfile', 'Discard to New File'),
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_DID_EDIT),
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_DISCARD,
                    group: '0_main',
                    order: 2
                }
            });
        }
        async runInlineChatCommand(accessor, ctrl, editor, ..._args) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const changedText = await ctrl.cancelSession();
            if (changedText !== undefined) {
                const input = { forceUntitled: true, resource: undefined, contents: changedText, languageId: editor.getModel()?.getLanguageId() };
                editorService.openEditor(input, editorService_1.SIDE_GROUP);
            }
        }
    }
    exports.DiscardUndoToNewFileAction = DiscardUndoToNewFileAction;
    class ToggleDiffForChange extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.toggleDiff',
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_EDIT_MODE.isEqualTo("live" /* EditMode.Live */), inlineChat_1.CTX_INLINE_CHAT_CHANGE_HAS_DIFF),
                title: (0, nls_1.localize2)('showChanges', 'Show Changes'),
                icon: codicons_1.Codicon.diffSingle,
                toggled: {
                    condition: inlineChat_1.CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF,
                },
                menu: [
                    {
                        id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_FEEDBACK,
                        group: '1_main',
                        when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_EDIT_MODE.isEqualTo("live" /* EditMode.Live */), inlineChat_1.CTX_INLINE_CHAT_CHANGE_HAS_DIFF)
                    }
                ]
            });
        }
        runInlineChatCommand(accessor, ctrl) {
            ctrl.toggleDiff();
        }
    }
    exports.ToggleDiffForChange = ToggleDiffForChange;
    class FeebackHelpfulCommand extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.feedbackHelpful',
                title: (0, nls_1.localize)('feedback.helpful', 'Helpful'),
                icon: codicons_1.Codicon.thumbsup,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                toggled: inlineChat_1.CTX_INLINE_CHAT_LAST_FEEDBACK.isEqualTo('helpful'),
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_FEEDBACK,
                    when: inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("empty" /* InlineChatResponseTypes.Empty */),
                    group: '2_feedback',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl) {
            ctrl.feedbackLast(1 /* InlineChatResponseFeedbackKind.Helpful */);
        }
    }
    exports.FeebackHelpfulCommand = FeebackHelpfulCommand;
    class FeebackUnhelpfulCommand extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.feedbackunhelpful',
                title: (0, nls_1.localize)('feedback.unhelpful', 'Unhelpful'),
                icon: codicons_1.Codicon.thumbsdown,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                toggled: inlineChat_1.CTX_INLINE_CHAT_LAST_FEEDBACK.isEqualTo('unhelpful'),
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_FEEDBACK,
                    when: inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("empty" /* InlineChatResponseTypes.Empty */),
                    group: '2_feedback',
                    order: 2
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl) {
            ctrl.feedbackLast(0 /* InlineChatResponseFeedbackKind.Unhelpful */);
        }
    }
    exports.FeebackUnhelpfulCommand = FeebackUnhelpfulCommand;
    class ReportIssueForBugCommand extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.reportIssueForBug',
                title: (0, nls_1.localize)('feedback.reportIssueForBug', 'Report Issue'),
                icon: codicons_1.Codicon.report,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("empty" /* InlineChatResponseTypes.Empty */)),
                menu: [{
                        id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_FEEDBACK,
                        when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_SUPPORT_ISSUE_REPORTING, inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("empty" /* InlineChatResponseTypes.Empty */)),
                        group: '2_feedback',
                        order: 3
                    }, {
                        id: inlineChat_1.MENU_INLINE_CHAT_WIDGET,
                        group: 'config',
                        order: 3
                    }]
            });
        }
        runInlineChatCommand(_accessor, ctrl) {
            ctrl.feedbackLast(4 /* InlineChatResponseFeedbackKind.Bug */);
        }
    }
    exports.ReportIssueForBugCommand = ReportIssueForBugCommand;
    class AcceptChanges extends AbstractInlineChatAction {
        constructor() {
            super({
                id: inlineChat_1.ACTION_ACCEPT_CHANGES,
                title: { value: (0, nls_1.localize)('apply1', 'Accept Changes'), original: 'Accept Changes' },
                shortTitle: (0, nls_1.localize)('apply2', 'Accept'),
                icon: codicons_1.Codicon.check,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_VISIBLE, contextkey_1.ContextKeyExpr.or(inlineChat_1.CTX_INLINE_CHAT_DOCUMENT_CHANGED.toNegated(), inlineChat_1.CTX_INLINE_CHAT_EDIT_MODE.notEqualsTo("preview" /* EditMode.Preview */))),
                keybinding: [{
                        weight: 100 /* KeybindingWeight.EditorContrib */ + 10,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    }, {
                        primary: 9 /* KeyCode.Escape */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: inlineChat_1.CTX_INLINE_CHAT_USER_DID_EDIT
                    }],
                menu: {
                    when: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("onlyMessages" /* InlineChatResponseTypes.OnlyMessages */)),
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS,
                    group: '0_main',
                    order: 0
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl) {
            ctrl.acceptHunk();
        }
    }
    exports.AcceptChanges = AcceptChanges;
    class CancelSessionAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.cancel',
                title: (0, nls_1.localize)('cancel', 'Cancel'),
                icon: codicons_1.Codicon.clearAll,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 1,
                    primary: 9 /* KeyCode.Escape */
                },
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS,
                    when: inlineChat_1.CTX_INLINE_CHAT_EDIT_MODE.isEqualTo("preview" /* EditMode.Preview */),
                    group: '0_main',
                    order: 3
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.cancelSession();
        }
    }
    exports.CancelSessionAction = CancelSessionAction;
    class CloseAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.close',
                title: (0, nls_1.localize)('close', 'Close'),
                icon: codicons_1.Codicon.close,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 1,
                    primary: 9 /* KeyCode.Escape */
                },
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET,
                    group: 'main',
                    order: 0,
                }
            });
        }
        async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.finishExistingSession();
        }
    }
    exports.CloseAction = CloseAction;
    class ConfigureInlineChatAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.configure',
                title: (0, nls_1.localize)('configure', 'Configure '),
                icon: codicons_1.Codicon.settingsGear,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET,
                    group: 'config',
                    order: 1,
                }
            });
        }
        async runInlineChatCommand(accessor, ctrl, _editor, ..._args) {
            accessor.get(preferences_1.IPreferencesService).openSettings({ query: 'inlineChat' });
        }
    }
    exports.ConfigureInlineChatAction = ConfigureInlineChatAction;
    class CopyRecordings extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.copyRecordings',
                f1: true,
                title: {
                    value: (0, nls_1.localize)('copyRecordings', '(Developer) Write Exchange to Clipboard'),
                    original: '(Developer) Write Exchange to Clipboard'
                }
            });
        }
        async runInlineChatCommand(accessor) {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const quickPickService = accessor.get(quickInput_1.IQuickInputService);
            const ieSessionService = accessor.get(inlineChatSessionService_1.IInlineChatSessionService);
            const recordings = ieSessionService.recordings().filter(r => r.exchanges.length > 0);
            if (recordings.length === 0) {
                return;
            }
            const picks = recordings.map(rec => {
                return {
                    rec,
                    label: (0, nls_1.localize)('label', "'{0}' and {1} follow ups ({2})", rec.exchanges[0].prompt, rec.exchanges.length - 1, (0, date_1.fromNow)(rec.when, true)),
                    tooltip: rec.exchanges.map(ex => ex.prompt).join('\n'),
                };
            });
            const pick = await quickPickService.pick(picks, { canPickMany: false });
            if (pick) {
                clipboardService.writeText(JSON.stringify(pick.rec, undefined, 2));
            }
        }
    }
    exports.CopyRecordings = CopyRecordings;
    class ViewInChatAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: inlineChat_1.ACTION_VIEW_IN_CHAT,
                title: (0, nls_1.localize)('viewInChat', 'View in Chat'),
                icon: codicons_1.Codicon.commentDiscussion,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS,
                    when: inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.isEqualTo("onlyMessages" /* InlineChatResponseTypes.OnlyMessages */),
                    group: '0_main',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.viewInChat();
        }
    }
    exports.ViewInChatAction = ViewInChatAction;
    class ExpandMessageAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.expandMessageAction',
                title: (0, nls_1.localize)('expandMessage', 'Show More'),
                icon: codicons_1.Codicon.chevronDown,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_MARKDOWN_MESSAGE,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.isEqualTo("onlyMessages" /* InlineChatResponseTypes.OnlyMessages */), inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.isEqualTo("mixed" /* InlineChatResponseTypes.Mixed */)), inlineChat_1.CTX_INLINE_CHAT_MESSAGE_CROP_STATE.isEqualTo('cropped')),
                    group: '2_expandOrContract',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.updateExpansionState(true);
        }
    }
    exports.ExpandMessageAction = ExpandMessageAction;
    class ContractMessageAction extends AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.contractMessageAction',
                title: (0, nls_1.localize)('contractMessage', 'Show Less'),
                icon: codicons_1.Codicon.chevronUp,
                precondition: inlineChat_1.CTX_INLINE_CHAT_VISIBLE,
                menu: {
                    id: inlineChat_1.MENU_INLINE_CHAT_WIDGET_MARKDOWN_MESSAGE,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.isEqualTo("onlyMessages" /* InlineChatResponseTypes.OnlyMessages */), inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.isEqualTo("mixed" /* InlineChatResponseTypes.Mixed */)), inlineChat_1.CTX_INLINE_CHAT_MESSAGE_CROP_STATE.isEqualTo('expanded')),
                    group: '2_expandOrContract',
                    order: 1
                }
            });
        }
        runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
            ctrl.updateExpansionState(false);
        }
    }
    exports.ContractMessageAction = ContractMessageAction;
    class InlineAccessibilityHelpContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibilityHelpAction.addImplementation(106, 'inlineChat', async (accessor) => {
                const codeEditor = accessor.get(codeEditorService_1.ICodeEditorService).getActiveCodeEditor() || accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
                if (!codeEditor) {
                    return;
                }
                (0, chatAccessibilityHelp_1.runAccessibilityHelpAction)(accessor, codeEditor, 'inlineChat');
            }, contextkey_1.ContextKeyExpr.or(inlineChat_1.CTX_INLINE_CHAT_RESPONSE_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_FOCUSED)));
        }
    }
    exports.InlineAccessibilityHelpContribution = InlineAccessibilityHelpContribution;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2lubGluZUNoYXQvYnJvd3Nlci9pbmxpbmVDaGF0QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE4QmhHLDJCQUFnQixDQUFDLG9CQUFvQixDQUFDLHlCQUF5QixFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFDckYsMkJBQWdCLENBQUMsb0JBQW9CLENBQUMsMkJBQTJCLEVBQUUsa0NBQXFCLENBQUMsQ0FBQztJQUU3RSxRQUFBLGtDQUFrQyxHQUFHLElBQUEsY0FBUSxFQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQzFFLFFBQUEsaUJBQWlCLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG1CQUFtQixFQUFFLGtCQUFPLENBQUMsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLDREQUE0RCxDQUFDLENBQUMsQ0FBQztJQUUvSyxNQUFhLG9CQUFxQixTQUFRLGdDQUFhO1FBQ3REO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxvQkFBb0I7Z0JBQ3hCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsbUNBQW1DLENBQUMsRUFBRSxRQUFRLEVBQUUsbUNBQW1DLEVBQUU7Z0JBQ3pILFFBQVEsRUFBRSx3QkFBd0IsQ0FBQyxRQUFRO2dCQUMzQyxZQUFZLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsZ0RBQW1DLEVBQUUscUNBQWlCLENBQUMsUUFBUSxDQUFDO2dCQUNqRyxVQUFVLEVBQUU7b0JBQ1gsTUFBTSw2Q0FBbUM7b0JBQ3pDLE9BQU8sRUFBRSxpREFBNkI7aUJBQ3RDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEtBQUssQ0FB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