define(["require", "exports", "vs/base/common/keyCodes", "vs/editor/browser/editorExtensions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/browser/inlineChatActions", "../browser/inlineChatActions", "vs/base/common/async", "vs/editor/common/editorContextKeys", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/chat/electron-sandbox/actions/voiceChatActions", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/speech/common/speechService", "vs/nls"], function (require, exports, keyCodes_1, editorExtensions_1, contextkey_1, inlineChatController_1, inlineChatActions_1, inlineChatActions_2, async_1, editorContextKeys_1, commands_1, keybinding_1, voiceChatActions_1, inlineChat_1, configuration_1, speechService_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HoldToSpeak = exports.StartSessionAction = void 0;
    class StartSessionAction extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'inlineChat.start',
                title: { value: inlineChatActions_2.LOCALIZED_START_INLINE_CHAT_STRING, original: 'Start Inline Chat' },
                category: inlineChatActions_1.AbstractInlineChatAction.category,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(inlineChat_1.CTX_INLINE_CHAT_HAS_PROVIDER, editorContextKeys_1.EditorContextKeys.writable),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.focus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */,
                    secondary: [(0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 39 /* KeyCode.KeyI */)],
                },
                icon: inlineChatActions_2.START_INLINE_CHAT
            });
        }
        runEditorCommand(accessor, editor, ..._args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            const speechService = accessor.get(speechService_1.ISpeechService);
            if (configService.getValue("inlineChat.holdToSpeech" /* InlineChatConfigKeys.HoldToSpeech */) // enabled
                && speechService.hasSpeechProvider // possible
            ) {
                holdForSpeech(accessor, inlineChatController_1.InlineChatController.get(editor), this.desc.id);
            }
            let options;
            const arg = _args[0];
            if (arg && inlineChatController_1.InlineChatRunOptions.isInteractiveEditorOptions(arg)) {
                options = arg;
            }
            inlineChatController_1.InlineChatController.get(editor)?.run({ ...options });
        }
    }
    exports.StartSessionAction = StartSessionAction;
    class HoldToSpeak extends inlineChatActions_1.AbstractInlineChatAction {
        constructor() {
            super({
                id: 'inlineChat.holdForSpeech',
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, inlineChat_1.CTX_INLINE_CHAT_VISIBLE),
                title: (0, nls_1.localize2)('holdForSpeech', "Hold for Speech"),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */,
                },
            });
        }
        runInlineChatCommand(accessor, ctrl, editor, ...args) {
            holdForSpeech(accessor, ctrl, this.desc.id);
        }
    }
    exports.HoldToSpeak = HoldToSpeak;
    function holdForSpeech(accessor, ctrl, commandId) {
        const keybindingService = accessor.get(keybinding_1.IKeybindingService);
        const commandService = accessor.get(commands_1.ICommandService);
        if (!ctrl) {
            return;
        }
        const holdMode = keybindingService.enableKeybindingHoldMode(commandId);
        if (!holdMode) {
            return;
        }
        let listening = false;
        const handle = (0, async_1.disposableTimeout)(() => {
            // start VOICE input
            commandService.executeCommand(voiceChatActions_1.StartVoiceChatAction.ID, { voice: { disableTimeout: true } });
            listening = true;
        }, 250);
        holdMode.finally(() => {
            if (listening) {
                commandService.executeCommand(voiceChatActions_1.StopListeningAction.ID).finally(() => {
                    ctrl.acceptInput();
                });
            }
            handle.dispose();
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2lubGluZUNoYXQvZWxlY3Ryb24tc2FuZGJveC9pbmxpbmVDaGF0QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBeUJBLE1BQWEsa0JBQW1CLFNBQVEsZ0NBQWE7UUFFcEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGtCQUFrQjtnQkFDdEIsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLHNEQUFrQyxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRTtnQkFDbkYsUUFBUSxFQUFFLDRDQUF3QixDQUFDLFFBQVE7Z0JBQzNDLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyx5Q0FBNEIsRUFBRSxxQ0FBaUIsQ0FBQyxRQUFRLENBQUM7Z0JBQzFGLFVBQVUsRUFBRTtvQkFDWCxJQUFJLEVBQUUscUNBQWlCLENBQUMsS0FBSztvQkFDN0IsTUFBTSw2Q0FBbUM7b0JBQ3pDLE9BQU8sRUFBRSxpREFBNkI7b0JBQ3RDLFNBQVMsRUFBRSxDQUFDLElBQUEsbUJBQVEsRUFBQyxpREFBNkIsd0JBQWUsQ0FBQztpQkFDbEU7Z0JBQ0QsSUFBSSxFQUFFLHFDQUFpQjthQUN2QixDQUFDLENBQUM7UUFDSixDQUFDO1FBR1EsZ0JBQWdCLENBQUMsUUFBMEIsRUFBRSxNQUFtQixFQUFFLEdBQUcsS0FBWTtZQUV6RixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7WUFDMUQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFFbkQsSUFBSSxhQUFhLENBQUMsUUFBUSxtRUFBNEMsQ0FBQyxVQUFVO21CQUM3RSxhQUFh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