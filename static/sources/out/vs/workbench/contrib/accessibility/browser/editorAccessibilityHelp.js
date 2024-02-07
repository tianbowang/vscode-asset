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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/editorContextKeys", "vs/editor/common/standaloneStrings", "vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/accessibility/browser/accessibilityContributions", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/comments/browser/commentsAccessibility", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/workbench/contrib/files/browser/fileConstants"], function (require, exports, lifecycle_1, codeEditorService_1, editorContextKeys_1, standaloneStrings_1, toggleTabFocusMode_1, commands_1, contextkey_1, instantiation_1, keybinding_1, accessibilityContributions_1, accessibleView_1, accessibleViewActions_1, chatContextKeys_1, commentsAccessibility_1, commentContextKeys_1, fileConstants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getChatCommandInfo = exports.getCommentCommandInfo = exports.EditorAccessibilityHelpContribution = void 0;
    class EditorAccessibilityHelpContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibilityHelpAction.addImplementation(95, 'editor', async (accessor) => {
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                const commandService = accessor.get(commands_1.ICommandService);
                let codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
                if (!codeEditor) {
                    await commandService.executeCommand(fileConstants_1.NEW_UNTITLED_FILE_COMMAND_ID);
                    codeEditor = codeEditorService.getActiveCodeEditor();
                }
                accessibleViewService.show(instantiationService.createInstance(EditorAccessibilityHelpProvider, codeEditor));
            }, editorContextKeys_1.EditorContextKeys.focus));
        }
    }
    exports.EditorAccessibilityHelpContribution = EditorAccessibilityHelpContribution;
    let EditorAccessibilityHelpProvider = class EditorAccessibilityHelpProvider {
        onClose() {
            this._editor.focus();
        }
        constructor(_editor, _keybindingService, _contextKeyService) {
            this._editor = _editor;
            this._keybindingService = _keybindingService;
            this._contextKeyService = _contextKeyService;
            this.id = "editor" /* AccessibleViewProviderId.Editor */;
            this.options = { type: "help" /* AccessibleViewType.Help */, readMoreUrl: 'https://go.microsoft.com/fwlink/?linkid=851010' };
            this.verbositySettingKey = "accessibility.verbosity.editor" /* AccessibilityVerbositySettingId.Editor */;
        }
        provideContent() {
            const options = this._editor.getOptions();
            const content = [];
            if (options.get(61 /* EditorOption.inDiffEditor */)) {
                if (options.get(90 /* EditorOption.readOnly */)) {
                    content.push(standaloneStrings_1.AccessibilityHelpNLS.readonlyDiffEditor);
                }
                else {
                    content.push(standaloneStrings_1.AccessibilityHelpNLS.editableDiffEditor);
                }
            }
            else {
                if (options.get(90 /* EditorOption.readOnly */)) {
                    content.push(standaloneStrings_1.AccessibilityHelpNLS.readonlyEditor);
                }
                else {
                    content.push(standaloneStrings_1.AccessibilityHelpNLS.editableEditor);
                }
            }
            content.push(standaloneStrings_1.AccessibilityHelpNLS.listAudioCues);
            content.push(standaloneStrings_1.AccessibilityHelpNLS.listAlerts);
            const chatCommandInfo = getChatCommandInfo(this._keybindingService, this._contextKeyService);
            if (chatCommandInfo) {
                content.push(chatCommandInfo);
            }
            const commentCommandInfo = getCommentCommandInfo(this._keybindingService, this._contextKeyService, this._editor);
            if (commentCommandInfo) {
                content.push(commentCommandInfo);
            }
            if (options.get(114 /* EditorOption.stickyScroll */).enabled) {
                content.push((0, accessibilityContributions_1.descriptionForCommand)('editor.action.focusStickyScroll', standaloneStrings_1.AccessibilityHelpNLS.stickScrollKb, standaloneStrings_1.AccessibilityHelpNLS.stickScrollNoKb, this._keybindingService));
            }
            if (options.get(142 /* EditorOption.tabFocusMode */)) {
                content.push((0, accessibilityContributions_1.descriptionForCommand)(toggleTabFocusMode_1.ToggleTabFocusModeAction.ID, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOnMsg, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOnMsgNoKb, this._keybindingService));
            }
            else {
                content.push((0, accessibilityContributions_1.descriptionForCommand)(toggleTabFocusMode_1.ToggleTabFocusModeAction.ID, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOffMsg, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOffMsgNoKb, this._keybindingService));
            }
            return content.join('\n\n');
        }
    };
    EditorAccessibilityHelpProvider = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextkey_1.IContextKeyService)
    ], EditorAccessibilityHelpProvider);
    function getCommentCommandInfo(keybindingService, contextKeyService, editor) {
        const editorContext = contextKeyService.getContext(editor.getDomNode());
        if (editorContext.getValue(commentContextKeys_1.CommentContextKeys.activeEditorHasCommentingRange.key)) {
            const commentCommandInfo = [];
            commentCommandInfo.push(commentsAccessibility_1.CommentAccessibilityHelpNLS.intro);
            commentCommandInfo.push((0, accessibilityContributions_1.descriptionForCommand)("workbench.action.addComment" /* CommentCommandId.Add */, commentsAccessibility_1.CommentAccessibilityHelpNLS.addComment, commentsAccessibility_1.CommentAccessibilityHelpNLS.addCommentNoKb, keybindingService));
            commentCommandInfo.push((0, accessibilityContributions_1.descriptionForCommand)("editor.action.nextCommentThreadAction" /* CommentCommandId.NextThread */, commentsAccessibility_1.CommentAccessibilityHelpNLS.nextCommentThreadKb, commentsAccessibility_1.CommentAccessibilityHelpNLS.nextCommentThreadNoKb, keybindingService));
            commentCommandInfo.push((0, accessibilityContributions_1.descriptionForCommand)("editor.action.previousCommentThreadAction" /* CommentCommandId.PreviousThread */, commentsAccessibility_1.CommentAccessibilityHelpNLS.previousCommentThreadKb, commentsAccessibility_1.CommentAccessibilityHelpNLS.previousCommentThreadNoKb, keybindingService));
            commentCommandInfo.push((0, accessibilityContributions_1.descriptionForCommand)("editor.action.nextCommentingRange" /* CommentCommandId.NextRange */, commentsAccessibility_1.CommentAccessibilityHelpNLS.nextRange, commentsAccessibility_1.CommentAccessibilityHelpNLS.nextRangeNoKb, keybindingService));
            commentCommandInfo.push((0, accessibilityContributions_1.descriptionForCommand)("editor.action.previousCommentingRange" /* CommentCommandId.PreviousRange */, commentsAccessibility_1.CommentAccessibilityHelpNLS.previousRange, commentsAccessibility_1.CommentAccessibilityHelpNLS.previousRangeNoKb, keybindingService));
            return commentCommandInfo.join('\n');
        }
        return;
    }
    exports.getCommentCommandInfo = getCommentCommandInfo;
    function getChatCommandInfo(keybindingService, contextKeyService) {
        if (chatContextKeys_1.CONTEXT_PROVIDER_EXISTS.getValue(contextKeyService)) {
            const commentCommandInfo = [];
            commentCommandInfo.push((0, accessibilityContributions_1.descriptionForCommand)('workbench.action.quickchat.toggle', standaloneStrings_1.AccessibilityHelpNLS.quickChat, standaloneStrings_1.AccessibilityHelpNLS.quickChatNoKb, keybindingService));
            commentCommandInfo.push((0, accessibilityContributions_1.descriptionForCommand)('inlineChat.start', standaloneStrings_1.AccessibilityHelpNLS.startInlineChat, standaloneStrings_1.AccessibilityHelpNLS.startInlineChatNoKb, keybindingService));
            return commentCommandInfo.join('\n');
        }
        return;
    }
    exports.getChatCommandInfo = getChatCommandInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQWNjZXNzaWJpbGl0eUhlbHAuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2FjY2Vzc2liaWxpdHkvYnJvd3Nlci9lZGl0b3JBY2Nlc3NpYmlsaXR5SGVscC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1QmhHLE1BQWEsbUNBQW9DLFNBQVEsc0JBQVU7UUFFbEU7WUFDQyxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxTQUFTLENBQUMsK0NBQXVCLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUMsUUFBUSxFQUFDLEVBQUU7Z0JBQ3ZGLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQ0FBa0IsQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUNBQXNCLENBQUMsQ0FBQztnQkFDbkUsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7Z0JBQ2pFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQWUsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLGlCQUFpQixDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQ3JHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDakIsTUFBTSxjQUFjLENBQUMsY0FBYyxDQUFDLDRDQUE0QixDQUFDLENBQUM7b0JBQ2xFLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRyxDQUFDO2dCQUN2RCxDQUFDO2dCQUNELHFCQUFxQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMs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