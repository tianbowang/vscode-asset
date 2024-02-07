/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/editor/contrib/stickyScroll/browser/stickyScrollController"], function (require, exports, editorExtensions_1, nls_1, actionCommonCategories_1, actions_1, configuration_1, contextkey_1, editorContextKeys_1, stickyScrollController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectEditor = exports.GoToStickyScrollLine = exports.SelectPreviousStickyScrollLine = exports.SelectNextStickyScrollLine = exports.FocusStickyScroll = exports.ToggleStickyScroll = void 0;
    class ToggleStickyScroll extends actions_1.Action2 {
        constructor() {
            super({
                id: 'editor.action.toggleStickyScroll',
                title: {
                    value: (0, nls_1.localize)('toggleEditorStickyScroll', "Toggle Editor Sticky Scroll"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'mitoggleStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Toggle Editor Sticky Scroll"),
                    original: 'Toggle Editor Sticky Scroll',
                },
                category: actionCommonCategories_1.Categories.View,
                toggled: {
                    condition: contextkey_1.ContextKeyExpr.equals('config.editor.stickyScroll.enabled', true),
                    title: (0, nls_1.localize)('stickyScroll', "Sticky Scroll"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Sticky Scroll"),
                },
                menu: [
                    { id: actions_1.MenuId.CommandPalette },
                    { id: actions_1.MenuId.MenubarAppearanceMenu, group: '4_editor', order: 3 },
                    { id: actions_1.MenuId.StickyScrollContext }
                ]
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('editor.stickyScroll.enabled');
            return configurationService.updateValue('editor.stickyScroll.enabled', newValue);
        }
    }
    exports.ToggleStickyScroll = ToggleStickyScroll;
    const weight = 100 /* KeybindingWeight.EditorContrib */;
    class FocusStickyScroll extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.focusStickyScroll',
                title: {
                    value: (0, nls_1.localize)('focusStickyScroll', "Focus Sticky Scroll"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'mifocusStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Focus Sticky Scroll"),
                    original: 'Focus Sticky Scroll',
                },
                precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('config.editor.stickyScroll.enabled'), editorContextKeys_1.EditorContextKeys.stickyScrollVisible),
                menu: [
                    { id: actions_1.MenuId.CommandPalette },
                ]
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.StickyScrollController.get(editor)?.focus();
        }
    }
    exports.FocusStickyScroll = FocusStickyScroll;
    class SelectNextStickyScrollLine extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.selectNextStickyScrollLine',
                title: {
                    value: (0, nls_1.localize)('selectNextStickyScrollLine.title', "Select next sticky scroll line"),
                    original: 'Select next sticky scroll line'
                },
                precondition: editorContextKeys_1.EditorContextKeys.stickyScrollFocused.isEqualTo(true),
                keybinding: {
                    weight,
                    primary: 18 /* KeyCode.DownArrow */
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.StickyScrollController.get(editor)?.focusNext();
        }
    }
    exports.SelectNextStickyScrollLine = SelectNextStickyScrollLine;
    class SelectPreviousStickyScrollLine extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.selectPreviousStickyScrollLine',
                title: {
                    value: (0, nls_1.localize)('selectPreviousStickyScrollLine.title', "Select previous sticky scroll line"),
                    original: 'Select previous sticky scroll line'
                },
                precondition: editorContextKeys_1.EditorContextKeys.stickyScrollFocused.isEqualTo(true),
                keybinding: {
                    weight,
                    primary: 16 /* KeyCode.UpArrow */
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.StickyScrollController.get(editor)?.focusPrevious();
        }
    }
    exports.SelectPreviousStickyScrollLine = SelectPreviousStickyScrollLine;
    class GoToStickyScrollLine extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.goToFocusedStickyScrollLine',
                title: {
                    value: (0, nls_1.localize)('goToFocusedStickyScrollLine.title', "Go to focused sticky scroll line"),
                    original: 'Go to focused sticky scroll line'
                },
                precondition: editorContextKeys_1.EditorContextKeys.stickyScrollFocused.isEqualTo(true),
                keybinding: {
                    weight,
                    primary: 3 /* KeyCode.Enter */
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.StickyScrollController.get(editor)?.goToFocused();
        }
    }
    exports.GoToStickyScrollLine = GoToStickyScrollLine;
    class SelectEditor extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.selectEditor',
                title: {
                    value: (0, nls_1.localize)('selectEditor.title', "Select Editor"),
                    original: 'Select Editor'
                },
                precondition: editorContextKeys_1.EditorContextKeys.stickyScrollFocused.isEqualTo(true),
                keybinding: {
                    weight,
                    primary: 9 /* KeyCode.Escape */
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.StickyScrollController.get(editor)?.selectEditor();
        }
    }
    exports.SelectEditor = SelectEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3RpY2t5U2Nyb2xsL2Jyb3dzZXIvc3RpY2t5U2Nyb2xsQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBYSxrQkFBbUIsU0FBUSxpQkFBTztRQUU5QztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsa0NBQWtDO2dCQUN0QyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLDZCQUE2QixDQUFDO29CQUMxRSxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLCtCQUErQixDQUFDO29CQUM3SCxRQUFRLEVBQUUsNkJBQTZCO2lCQUN2QztnQkFDRCxRQUFRLEVBQUUsbUNBQVUsQ0FBQyxJQUFJO2dCQUN6QixPQUFPLEVBQUU7b0JBQ1IsU0FBUyxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQztvQkFDNUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxlQUFlLENBQUM7b0JBQ2hELGFBQWEsRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLENBQUM7aUJBQ3pHO2dCQUNELElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGNBQWMsRUFBRTtvQkFDN0IsRUFBRSxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFF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