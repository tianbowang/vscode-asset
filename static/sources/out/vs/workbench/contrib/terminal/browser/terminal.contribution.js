/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/registry/common/platform", "vs/workbench/browser/quickaccess", "vs/workbench/common/views", "vs/platform/dnd/browser/dnd", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalView", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/contrib/terminal/browser/terminalCommands", "vs/workbench/contrib/terminal/browser/terminalService", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/terminal/browser/terminal", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/terminal/browser/terminalQuickAccess", "vs/workbench/contrib/terminal/common/terminalConfiguration", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/platform/terminal/common/terminal", "vs/base/common/platform", "vs/workbench/contrib/terminal/browser/terminalMenus", "vs/workbench/contrib/terminal/browser/terminalInstanceService", "vs/platform/terminal/common/terminalPlatformConfiguration", "vs/workbench/common/editor", "vs/workbench/browser/editor", "vs/workbench/contrib/terminal/browser/terminalEditor", "vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/contrib/terminal/browser/terminalEditorService", "vs/workbench/contrib/terminal/browser/terminalEditorSerializer", "vs/workbench/contrib/terminal/browser/terminalGroupService", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/browser/terminalProfileService", "vs/workbench/common/contributions", "vs/workbench/contrib/terminal/browser/remoteTerminalBackend", "vs/workbench/contrib/terminal/browser/terminalMainContribution", "vs/base/common/network", "vs/platform/terminal/common/terminalLogService", "vs/css!./media/scrollbar", "vs/css!./media/widgets", "vs/css!./media/xterm", "vs/css!./media/terminal", "vs/css!./media/terminalVoice"], function (require, exports, nls, uri_1, commands_1, contextkey_1, keybindingsRegistry_1, platform_1, quickaccess_1, views_1, dnd_1, terminalActions_1, terminalView_1, terminal_1, terminalColorRegistry_1, terminalCommands_1, terminalService_1, extensions_1, terminal_2, descriptors_1, viewPaneContainer_1, quickAccess_1, terminalQuickAccess_1, terminalConfiguration_1, accessibility_1, terminalIcons_1, terminal_3, platform_2, terminalMenus_1, terminalInstanceService_1, terminalPlatformConfiguration_1, editor_1, editor_2, terminalEditor_1, terminalEditorInput_1, terminalStrings_1, terminalEditorService_1, terminalEditorSerializer_1, terminalGroupService_1, terminalContextKey_1, terminalProfileService_1, contributions_1, remoteTerminalBackend_1, terminalMainContribution_1, network_1, terminalLogService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register services
    (0, extensions_1.registerSingleton)(terminal_3.ITerminalLogService, terminalLogService_1.TerminalLogService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(terminal_2.ITerminalService, terminalService_1.TerminalService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(terminal_2.ITerminalEditorService, terminalEditorService_1.TerminalEditorService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(terminal_2.ITerminalGroupService, terminalGroupService_1.TerminalGroupService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(terminal_2.ITerminalInstanceService, terminalInstanceService_1.TerminalInstanceService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(terminal_1.ITerminalProfileService, terminalProfileService_1.TerminalProfileService, 1 /* InstantiationType.Delayed */);
    // Register quick accesses
    const quickAccessRegistry = (platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
    const inTerminalsPicker = 'inTerminalPicker';
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: terminalQuickAccess_1.TerminalQuickAccessProvider,
        prefix: terminalQuickAccess_1.TerminalQuickAccessProvider.PREFIX,
        contextKey: inTerminalsPicker,
        placeholder: nls.localize('tasksQuickAccessPlaceholder', "Type the name of a terminal to open."),
        helpEntries: [{ description: nls.localize('tasksQuickAccessHelp', "Show All Opened Terminals"), commandId: "workbench.action.quickOpenTerm" /* TerminalCommandId.QuickOpenTerm */ }]
    });
    const quickAccessNavigateNextInTerminalPickerId = 'workbench.action.quickOpenNavigateNextInTerminalPicker';
    commands_1.CommandsRegistry.registerCommand({ id: quickAccessNavigateNextInTerminalPickerId, handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigateNextInTerminalPickerId, true) });
    const quickAccessNavigatePreviousInTerminalPickerId = 'workbench.action.quickOpenNavigatePreviousInTerminalPicker';
    commands_1.CommandsRegistry.registerCommand({ id: quickAccessNavigatePreviousInTerminalPickerId, handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigatePreviousInTerminalPickerId, false) });
    // Register workbench contributions
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(terminalMainContribution_1.TerminalMainContribution, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(remoteTerminalBackend_1.RemoteTerminalBackendContribution, 3 /* LifecyclePhase.Restored */);
    // Register configurations
    (0, terminalPlatformConfiguration_1.registerTerminalPlatformConfiguration)();
    (0, terminalConfiguration_1.registerTerminalConfiguration)();
    // Register editor/dnd contributions
    platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).registerEditorSerializer(terminalEditorInput_1.TerminalEditorInput.ID, terminalEditorSerializer_1.TerminalInputSerializer);
    platform_1.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_2.EditorPaneDescriptor.create(terminalEditor_1.TerminalEditor, terminal_2.terminalEditorId, terminalStrings_1.terminalStrings.terminal), [
        new descriptors_1.SyncDescriptor(terminalEditorInput_1.TerminalEditorInput)
    ]);
    platform_1.Registry.as(dnd_1.Extensions.DragAndDropContribution).register({
        dataFormatKey: "Terminals" /* TerminalDataTransfers.Terminals */,
        getEditorInputs(data) {
            const editors = [];
            try {
                const terminalEditors = JSON.parse(data);
                for (const terminalEditor of terminalEditors) {
                    editors.push({ resource: uri_1.URI.parse(terminalEditor) });
                }
            }
            catch (error) {
                // Invalid transfer
            }
            return editors;
        },
        setData(resources, event) {
            const terminalResources = resources.filter(({ resource }) => resource.scheme === network_1.Schemas.vscodeTerminal);
            if (terminalResources.length) {
                event.dataTransfer?.setData("Terminals" /* TerminalDataTransfers.Terminals */, JSON.stringify(terminalResources.map(({ resource }) => resource.toString())));
            }
        }
    });
    // Register views
    const VIEW_CONTAINER = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: terminal_1.TERMINAL_VIEW_ID,
        title: nls.localize2('terminal', "Terminal"),
        icon: terminalIcons_1.terminalViewIcon,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [terminal_1.TERMINAL_VIEW_ID, { mergeViewWithContainerWhenSingleView: true }]),
        storageId: terminal_1.TERMINAL_VIEW_ID,
        hideIfEmpty: true,
        order: 3,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true, isDefault: true });
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: terminal_1.TERMINAL_VIEW_ID,
            name: nls.localize2('terminal', "Terminal"),
            containerIcon: terminalIcons_1.terminalViewIcon,
            canToggleVisibility: false,
            canMoveView: true,
            ctorDescriptor: new descriptors_1.SyncDescriptor(terminalView_1.TerminalViewPane),
            openCommandActionDescriptor: {
                id: "workbench.action.terminal.toggleTerminal" /* TerminalCommandId.Toggle */,
                mnemonicTitle: nls.localize({ key: 'miToggleIntegratedTerminal', comment: ['&& denotes a mnemonic'] }, "&&Terminal"),
                keybindings: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 91 /* KeyCode.Backquote */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 91 /* KeyCode.Backquote */ }
                },
                order: 3
            }
        }], VIEW_CONTAINER);
    // Register actions
    (0, terminalActions_1.registerTerminalActions)();
    function registerSendSequenceKeybinding(text, rule) {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: "workbench.action.terminal.sendSequence" /* TerminalCommandId.SendSequence */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: rule.when || terminalContextKey_1.TerminalContextKeys.focus,
            primary: rule.primary,
            mac: rule.mac,
            linux: rule.linux,
            win: rule.win,
            handler: terminalActions_1.terminalSendSequenceCommand,
            args: { text }
        });
    }
    var Constants;
    (function (Constants) {
        /** The text representation of `^<letter>` is `'A'.charCodeAt(0) + 1`. */
        Constants[Constants["CtrlLetterOffset"] = 64] = "CtrlLetterOffset";
    })(Constants || (Constants = {}));
    // An extra Windows-only ctrl+v keybinding is used for pwsh that sends ctrl+v directly to the
    // shell, this gets handled by PSReadLine which properly handles multi-line pastes. This is
    // disabled in accessibility mode as PowerShell does not run PSReadLine when it detects a screen
    // reader. This works even when clipboard.readText is not supported.
    if (platform_2.isWindows) {
        registerSendSequenceKeybinding(String.fromCharCode('V'.charCodeAt(0) - 64 /* Constants.CtrlLetterOffset */), {
            when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.ContextKeyExpr.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
            primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */
        });
    }
    // Map certain keybindings in pwsh to unused keys which get handled by PSReadLine handlers in the
    // shell integration script. This allows keystrokes that cannot be sent via VT sequences to work.
    // See https://github.com/microsoft/terminal/issues/879#issuecomment-497775007
    registerSendSequenceKeybinding('\x1b[24~a', {
        when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.ContextKeyExpr.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
        primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 10 /* KeyCode.Space */ }
    });
    registerSendSequenceKeybinding('\x1b[24~b', {
        when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.ContextKeyExpr.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
        primary: 512 /* KeyMod.Alt */ | 10 /* KeyCode.Space */
    });
    registerSendSequenceKeybinding('\x1b[24~c', {
        when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.ContextKeyExpr.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
        primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */
    });
    registerSendSequenceKeybinding('\x1b[24~d', {
        when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.ContextKeyExpr.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
        mac: { primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */ }
    });
    registerSendSequenceKeybinding('\x1b[24~e', {
        when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.ContextKeyExpr.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), contextkey_1.ContextKeyExpr.equals(`config.${"terminal.integrated.shellIntegration.suggestEnabled" /* TerminalSettingId.ShellIntegrationSuggestEnabled */}`, true)),
        primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 10 /* KeyCode.Space */ }
    });
    // Always on pwsh keybindings
    registerSendSequenceKeybinding('\x1b[1;2H', {
        when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.ContextKeyExpr.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */)),
        mac: { primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */ }
    });
    // Map ctrl+alt+r -> ctrl+r when in accessibility mode due to default run recent command keybinding
    registerSendSequenceKeybinding('\x12', {
        when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED),
        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */ }
    });
    // Map ctrl+alt+g -> ctrl+g due to default go to recent directory keybinding
    registerSendSequenceKeybinding('\x07', {
        when: terminalContextKey_1.TerminalContextKeys.focus,
        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 37 /* KeyCode.KeyG */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 37 /* KeyCode.KeyG */ }
    });
    // send ctrl+c to the iPad when the terminal is focused and ctrl+c is pressed to kill the process (work around for #114009)
    if (platform_2.isIOS) {
        registerSendSequenceKeybinding(String.fromCharCode('C'.charCodeAt(0) - 64 /* Constants.CtrlLetterOffset */), {
            when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus),
            primary: 256 /* KeyMod.WinCtrl */ | 33 /* KeyCode.KeyC */
        });
    }
    // Delete word left: ctrl+w
    registerSendSequenceKeybinding(String.fromCharCode('W'.charCodeAt(0) - 64 /* Constants.CtrlLetterOffset */), {
        primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
        mac: { primary: 512 /* KeyMod.Alt */ | 1 /* KeyCode.Backspace */ }
    });
    if (platform_2.isWindows) {
        // Delete word left: ctrl+h
        // Windows cmd.exe requires ^H to delete full word left
        registerSendSequenceKeybinding(String.fromCharCode('H'.charCodeAt(0) - 64 /* Constants.CtrlLetterOffset */), {
            when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.ContextKeyExpr.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "cmd" /* WindowsShellType.CommandPrompt */)),
            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
        });
    }
    // Delete word right: alt+d [27, 100]
    registerSendSequenceKeybinding('\u001bd', {
        primary: 2048 /* KeyMod.CtrlCmd */ | 20 /* KeyCode.Delete */,
        mac: { primary: 512 /* KeyMod.Alt */ | 20 /* KeyCode.Delete */ }
    });
    // Delete to line start: ctrl+u
    registerSendSequenceKeybinding('\u0015', {
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */ }
    });
    // Move to line start: ctrl+A
    registerSendSequenceKeybinding(String.fromCharCode('A'.charCodeAt(0) - 64), {
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */ }
    });
    // Move to line end: ctrl+E
    registerSendSequenceKeybinding(String.fromCharCode('E'.charCodeAt(0) - 64), {
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */ }
    });
    // NUL: ctrl+shift+2
    registerSendSequenceKeybinding('\u0000', {
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 23 /* KeyCode.Digit2 */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 23 /* KeyCode.Digit2 */ }
    });
    // RS: ctrl+shift+6
    registerSendSequenceKeybinding('\u001e', {
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 27 /* KeyCode.Digit6 */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 27 /* KeyCode.Digit6 */ }
    });
    // US (Undo): ctrl+/
    registerSendSequenceKeybinding('\u001f', {
        primary: 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 90 /* KeyCode.Slash */ }
    });
    (0, terminalCommands_1.setupTerminalCommands)();
    (0, terminalMenus_1.setupTerminalMenus)();
    (0, terminalColorRegistry_1.registerColors)();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXNEaEcsb0JBQW9CO0lBQ3BCLElBQUEsOEJBQWlCLEVBQUMsOEJBQW1CLEVBQUUsdUNBQWtCLG9DQUE0QixDQUFDO0lBQ3RGLElBQUEsOEJBQWlCLEVBQUMsMkJBQWdCLEVBQUUsaUNBQWUsb0NBQTRCLENBQUM7SUFDaEYsSUFBQSw4QkFBaUIsRUFBQyxpQ0FBc0IsRUFBRSw2Q0FBcUIsb0NBQTRCLENBQUM7SUFDNUYsSUFBQSw4QkFBaUIsRUFBQyxnQ0FBcUIsRUFBRSwyQ0FBb0Isb0NBQTRCLENBQUM7SUFDMUYsSUFBQSw4QkFBaUIsRUFBQyxtQ0FBd0IsRUFBRSxpREFBdUIsb0NBQTRCLENBQUM7SUFDaEcsSUFBQSw4QkFBaUIsRUFBQyxrQ0FBdUIsRUFBRSwrQ0FBc0Isb0NBQTRCLENBQUM7SUFFOUYsMEJBQTBCO0lBQzFCLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxtQkFBUSxDQUFDLEVBQUUsQ0FBdUIsd0JBQXFCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNuRyxNQUFNLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDO0lBQzdDLG1CQUFtQixDQUFDLDJCQUEyQixDQUFDO1FBQy9DLElBQUksRUFBRSxpREFBMkI7UUFDakMsTUFBTSxFQUFFLGlEQUEyQixDQUFDLE1BQU07UUFDMUMsVUFBVSxFQUFFLGlCQUFpQjtRQUM3QixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSxzQ0FBc0MsQ0FBQztRQUNoRyxXQUFXLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxHQUFHLENB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