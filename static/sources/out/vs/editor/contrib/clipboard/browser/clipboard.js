/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/platform", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/editorContextKeys", "vs/editor/contrib/dropOrPasteInto/browser/copyPasteController", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey"], function (require, exports, browser, dom_1, platform, textAreaInput_1, editorExtensions_1, codeEditorService_1, editorContextKeys_1, copyPasteController_1, nls, actions_1, clipboardService_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PasteAction = exports.CopyAction = exports.CutAction = void 0;
    const CLIPBOARD_CONTEXT_MENU_GROUP = '9_cutcopypaste';
    const supportsCut = (platform.isNative || document.queryCommandSupported('cut'));
    const supportsCopy = (platform.isNative || document.queryCommandSupported('copy'));
    // Firefox only supports navigator.clipboard.readText() in browser extensions.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText#Browser_compatibility
    // When loading over http, navigator.clipboard can be undefined. See https://github.com/microsoft/monaco-editor/issues/2313
    const supportsPaste = (typeof navigator.clipboard === 'undefined' || browser.isFirefox) ? document.queryCommandSupported('paste') : true;
    function registerCommand(command) {
        command.register();
        return command;
    }
    exports.CutAction = supportsCut ? registerCommand(new editorExtensions_1.MultiCommand({
        id: 'editor.action.clipboardCutAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind cut keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.isNative ? {
            primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */, secondary: [1024 /* KeyMod.Shift */ | 20 /* KeyCode.Delete */] },
            weight: 100 /* KeybindingWeight.EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.MenuId.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize({ key: 'miCut', comment: ['&& denotes a mnemonic'] }, "Cu&&t"),
                order: 1
            }, {
                menuId: actions_1.MenuId.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.cutLabel', "Cut"),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 1,
            }, {
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: nls.localize('actions.clipboard.cutLabel', "Cut"),
                order: 1
            }, {
                menuId: actions_1.MenuId.SimpleEditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.cutLabel', "Cut"),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 1,
            }]
    })) : undefined;
    exports.CopyAction = supportsCopy ? registerCommand(new editorExtensions_1.MultiCommand({
        id: 'editor.action.clipboardCopyAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind copy keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.isNative ? {
            primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, secondary: [2048 /* KeyMod.CtrlCmd */ | 19 /* KeyCode.Insert */] },
            weight: 100 /* KeybindingWeight.EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.MenuId.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize({ key: 'miCopy', comment: ['&& denotes a mnemonic'] }, "&&Copy"),
                order: 2
            }, {
                menuId: actions_1.MenuId.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.copyLabel', "Copy"),
                order: 2,
            }, {
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: nls.localize('actions.clipboard.copyLabel', "Copy"),
                order: 1
            }, {
                menuId: actions_1.MenuId.SimpleEditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.copyLabel', "Copy"),
                order: 2,
            }]
    })) : undefined;
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarEditMenu, { submenu: actions_1.MenuId.MenubarCopy, title: { value: nls.localize('copy as', "Copy As"), original: 'Copy As', }, group: '2_ccp', order: 3 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, { submenu: actions_1.MenuId.EditorContextCopy, title: { value: nls.localize('copy as', "Copy As"), original: 'Copy As', }, group: CLIPBOARD_CONTEXT_MENU_GROUP, order: 3 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, { submenu: actions_1.MenuId.EditorContextShare, title: { value: nls.localize('share', "Share"), original: 'Share', }, group: '11_share', order: -1, when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals('resourceScheme', 'output'), editorContextKeys_1.EditorContextKeys.editorTextFocus) });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { submenu: actions_1.MenuId.EditorTitleContextShare, title: { value: nls.localize('share', "Share"), original: 'Share', }, group: '11_share', order: -1 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, { submenu: actions_1.MenuId.ExplorerContextShare, title: { value: nls.localize('share', "Share"), original: 'Share', }, group: '11_share', order: -1 });
    exports.PasteAction = supportsPaste ? registerCommand(new editorExtensions_1.MultiCommand({
        id: 'editor.action.clipboardPasteAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind paste keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.isNative ? {
            primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */,
            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */] },
            linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */] },
            weight: 100 /* KeybindingWeight.EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.MenuId.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize({ key: 'miPaste', comment: ['&& denotes a mnemonic'] }, "&&Paste"),
                order: 4
            }, {
                menuId: actions_1.MenuId.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.pasteLabel', "Paste"),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 4,
            }, {
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: nls.localize('actions.clipboard.pasteLabel', "Paste"),
                order: 1
            }, {
                menuId: actions_1.MenuId.SimpleEditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize('actions.clipboard.pasteLabel', "Paste"),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 4,
            }]
    })) : undefined;
    class ExecCommandCopyWithSyntaxHighlightingAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.clipboardCopyWithSyntaxHighlightingAction',
                label: nls.localize('actions.clipboard.copyWithSyntaxHighlightingLabel', "Copy With Syntax Highlighting"),
                alias: 'Copy With Syntax Highlighting',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const emptySelectionClipboard = editor.getOption(37 /* EditorOption.emptySelectionClipboard */);
            if (!emptySelectionClipboard && editor.getSelection().isEmpty()) {
                return;
            }
            textAreaInput_1.CopyOptions.forceCopyWithSyntaxHighlighting = true;
            editor.focus();
            editor.getContainerDomNode().ownerDocument.execCommand('copy');
            textAreaInput_1.CopyOptions.forceCopyWithSyntaxHighlighting = false;
        }
    }
    function registerExecCommandImpl(target, browserCommand) {
        if (!target) {
            return;
        }
        // 1. handle case when focus is in editor.
        target.addImplementation(10000, 'code-editor', (accessor, args) => {
            // Only if editor text focus (i.e. not if editor has widget focus).
            const focusedEditor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
            if (focusedEditor && focusedEditor.hasTextFocus()) {
                // Do not execute if there is no selection and empty selection clipboard is off
                const emptySelectionClipboard = focusedEditor.getOption(37 /* EditorOption.emptySelectionClipboard */);
                const selection = focusedEditor.getSelection();
                if (selection && selection.isEmpty() && !emptySelectionClipboard) {
                    return true;
                }
                focusedEditor.getContainerDomNode().ownerDocument.execCommand(browserCommand);
                return true;
            }
            return false;
        });
        // 2. (default) handle case when focus is somewhere else.
        target.addImplementation(0, 'generic-dom', (accessor, args) => {
            (0, dom_1.getActiveDocument)().execCommand(browserCommand);
            return true;
        });
    }
    registerExecCommandImpl(exports.CutAction, 'cut');
    registerExecCommandImpl(exports.CopyAction, 'copy');
    if (exports.PasteAction) {
        // 1. Paste: handle case when focus is in editor.
        exports.PasteAction.addImplementation(10000, 'code-editor', (accessor, args) => {
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            // Only if editor text focus (i.e. not if editor has widget focus).
            const focusedEditor = codeEditorService.getFocusedCodeEditor();
            if (focusedEditor && focusedEditor.hasTextFocus()) {
                const result = focusedEditor.getContainerDomNode().ownerDocument.execCommand('paste');
                if (result) {
                    return copyPasteController_1.CopyPasteController.get(focusedEditor)?.finishedPaste() ?? Promise.resolve();
                }
                else if (platform.isWeb) {
                    // Use the clipboard service if document.execCommand('paste') was not successful
                    return (async () => {
                        const clipboardText = await clipboardService.readText();
                        if (clipboardText !== '') {
                            const metadata = textAreaInput_1.InMemoryClipboardMetadataManager.INSTANCE.get(clipboardText);
                            let pasteOnNewLine = false;
                            let multicursorText = null;
                            let mode = null;
                            if (metadata) {
                                pasteOnNewLine = (focusedEditor.getOption(37 /* EditorOption.emptySelectionClipboard */) && !!metadata.isFromEmptySelection);
                                multicursorText = (typeof metadata.multicursorText !== 'undefined' ? metadata.multicursorText : null);
                                mode = metadata.mode;
                            }
                            focusedEditor.trigger('keyboard', "paste" /* Handler.Paste */, {
                                text: clipboardText,
                                pasteOnNewLine,
                                multicursorText,
                                mode
                            });
                        }
                    })();
                }
                return true;
            }
            return false;
        });
        // 2. Paste: (default) handle case when focus is somewhere else.
        exports.PasteAction.addImplementation(0, 'generic-dom', (accessor, args) => {
            (0, dom_1.getActiveDocument)().execCommand('paste');
            return true;
        });
    }
    if (supportsCopy) {
        (0, editorExtensions_1.registerEditorAction)(ExecCommandCopyWithSyntaxHighlightingAction);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcGJvYXJkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jbGlwYm9hcmQvYnJvd3Nlci9jbGlwYm9hcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxNQUFNLDRCQUE0QixHQUFHLGdCQUFnQixDQUFDO0lBRXRELE1BQU0sV0FBVyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNqRixNQUFNLFlBQVksR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDbkYsOEVBQThFO0lBQzlFLGdHQUFnRztJQUNoRywySEFBMkg7SUFDM0gsTUFBTSxhQUFhLEdBQUcsQ0FBQyxPQUFPLFNBQVMsQ0FBQyxTQUFTLEtBQUssV0FBVyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFFekksU0FBUyxlQUFlLENBQW9CLE9BQVU7UUFDckQsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFWSxRQUFBLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLCtCQUFZLENBQUM7UUFDdkUsRUFBRSxFQUFFLGtDQUFrQztRQUN0QyxZQUFZLEVBQUUsU0FBUztRQUN2QixNQUFNLEVBQUU7UUFDUCw4Q0FBOEM7UUFDOUMsK0RBQStEO1FBQy9ELFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sRUFBRSxpREFBNkI7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