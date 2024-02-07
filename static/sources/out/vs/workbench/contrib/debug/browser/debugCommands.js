/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/browser/ui/list/listWidget", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/extensions/common/extensions", "vs/editor/browser/editorBrowser", "vs/platform/actions/common/actions", "vs/workbench/services/editor/common/editorService", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkeys", "vs/workbench/common/contextkeys", "vs/platform/commands/common/commands", "vs/editor/common/services/textResourceConfiguration", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/views/common/viewsService", "vs/base/common/objects", "vs/base/common/platform", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/debug/common/loadedScriptsPicker", "vs/workbench/contrib/debug/browser/debugSessionPicker", "vs/workbench/contrib/files/common/files"], function (require, exports, nls, listWidget_1, keybindingsRegistry_1, listService_1, debug_1, debugModel_1, extensions_1, editorBrowser_1, actions_1, editorService_1, editorContextKeys_1, contextkey_1, breakpointsView_1, notification_1, contextkeys_1, contextkeys_2, commands_1, textResourceConfiguration_1, clipboardService_1, configuration_1, quickInput_1, viewsService_1, objects_1, platform_1, debugUtils_1, panecomposite_1, loadedScriptsPicker_1, debugSessionPicker_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEBUG_CONSOLE_QUICK_ACCESS_PREFIX = exports.DEBUG_QUICK_ACCESS_PREFIX = exports.SELECT_DEBUG_SESSION_LABEL = exports.SELECT_DEBUG_CONSOLE_LABEL = exports.CALLSTACK_DOWN_LABEL = exports.CALLSTACK_UP_LABEL = exports.CALLSTACK_BOTTOM_LABEL = exports.CALLSTACK_TOP_LABEL = exports.OPEN_LOADED_SCRIPTS_LABEL = exports.PREV_DEBUG_CONSOLE_LABEL = exports.NEXT_DEBUG_CONSOLE_LABEL = exports.DEBUG_RUN_LABEL = exports.DEBUG_START_LABEL = exports.DEBUG_CONFIGURE_LABEL = exports.SELECT_AND_START_LABEL = exports.FOCUS_SESSION_LABEL = exports.CONTINUE_LABEL = exports.STOP_LABEL = exports.DISCONNECT_AND_SUSPEND_LABEL = exports.DISCONNECT_LABEL = exports.PAUSE_LABEL = exports.STEP_OUT_LABEL = exports.STEP_INTO_TARGET_LABEL = exports.STEP_INTO_LABEL = exports.STEP_OVER_LABEL = exports.RESTART_LABEL = exports.DEBUG_COMMAND_CATEGORY = exports.CALLSTACK_DOWN_ID = exports.CALLSTACK_UP_ID = exports.CALLSTACK_BOTTOM_ID = exports.CALLSTACK_TOP_ID = exports.SHOW_LOADED_SCRIPTS_ID = exports.PREV_DEBUG_CONSOLE_ID = exports.NEXT_DEBUG_CONSOLE_ID = exports.REMOVE_EXPRESSION_COMMAND_ID = exports.SET_EXPRESSION_COMMAND_ID = exports.EDIT_EXPRESSION_COMMAND_ID = exports.DEBUG_RUN_COMMAND_ID = exports.DEBUG_START_COMMAND_ID = exports.DEBUG_CONFIGURE_COMMAND_ID = exports.SELECT_DEBUG_SESSION_ID = exports.SELECT_DEBUG_CONSOLE_ID = exports.SELECT_AND_START_ID = exports.FOCUS_SESSION_ID = exports.JUMP_TO_CURSOR_ID = exports.FOCUS_REPL_ID = exports.CONTINUE_ID = exports.RESTART_FRAME_ID = exports.STOP_ID = exports.DISCONNECT_AND_SUSPEND_ID = exports.DISCONNECT_ID = exports.PAUSE_ID = exports.STEP_OUT_ID = exports.STEP_INTO_TARGET_ID = exports.STEP_INTO_ID = exports.STEP_OVER_ID = exports.TERMINATE_THREAD_ID = exports.RESTART_SESSION_ID = exports.STEP_BACK_ID = exports.REVERSE_CONTINUE_ID = exports.COPY_STACK_TRACE_ID = exports.TOGGLE_INLINE_BREAKPOINT_ID = exports.ADD_CONFIGURATION_ID = void 0;
    exports.ADD_CONFIGURATION_ID = 'debug.addConfiguration';
    exports.TOGGLE_INLINE_BREAKPOINT_ID = 'editor.debug.action.toggleInlineBreakpoint';
    exports.COPY_STACK_TRACE_ID = 'debug.copyStackTrace';
    exports.REVERSE_CONTINUE_ID = 'workbench.action.debug.reverseContinue';
    exports.STEP_BACK_ID = 'workbench.action.debug.stepBack';
    exports.RESTART_SESSION_ID = 'workbench.action.debug.restart';
    exports.TERMINATE_THREAD_ID = 'workbench.action.debug.terminateThread';
    exports.STEP_OVER_ID = 'workbench.action.debug.stepOver';
    exports.STEP_INTO_ID = 'workbench.action.debug.stepInto';
    exports.STEP_INTO_TARGET_ID = 'workbench.action.debug.stepIntoTarget';
    exports.STEP_OUT_ID = 'workbench.action.debug.stepOut';
    exports.PAUSE_ID = 'workbench.action.debug.pause';
    exports.DISCONNECT_ID = 'workbench.action.debug.disconnect';
    exports.DISCONNECT_AND_SUSPEND_ID = 'workbench.action.debug.disconnectAndSuspend';
    exports.STOP_ID = 'workbench.action.debug.stop';
    exports.RESTART_FRAME_ID = 'workbench.action.debug.restartFrame';
    exports.CONTINUE_ID = 'workbench.action.debug.continue';
    exports.FOCUS_REPL_ID = 'workbench.debug.action.focusRepl';
    exports.JUMP_TO_CURSOR_ID = 'debug.jumpToCursor';
    exports.FOCUS_SESSION_ID = 'workbench.action.debug.focusProcess';
    exports.SELECT_AND_START_ID = 'workbench.action.debug.selectandstart';
    exports.SELECT_DEBUG_CONSOLE_ID = 'workbench.action.debug.selectDebugConsole';
    exports.SELECT_DEBUG_SESSION_ID = 'workbench.action.debug.selectDebugSession';
    exports.DEBUG_CONFIGURE_COMMAND_ID = 'workbench.action.debug.configure';
    exports.DEBUG_START_COMMAND_ID = 'workbench.action.debug.start';
    exports.DEBUG_RUN_COMMAND_ID = 'workbench.action.debug.run';
    exports.EDIT_EXPRESSION_COMMAND_ID = 'debug.renameWatchExpression';
    exports.SET_EXPRESSION_COMMAND_ID = 'debug.setWatchExpression';
    exports.REMOVE_EXPRESSION_COMMAND_ID = 'debug.removeWatchExpression';
    exports.NEXT_DEBUG_CONSOLE_ID = 'workbench.action.debug.nextConsole';
    exports.PREV_DEBUG_CONSOLE_ID = 'workbench.action.debug.prevConsole';
    exports.SHOW_LOADED_SCRIPTS_ID = 'workbench.action.debug.showLoadedScripts';
    exports.CALLSTACK_TOP_ID = 'workbench.action.debug.callStackTop';
    exports.CALLSTACK_BOTTOM_ID = 'workbench.action.debug.callStackBottom';
    exports.CALLSTACK_UP_ID = 'workbench.action.debug.callStackUp';
    exports.CALLSTACK_DOWN_ID = 'workbench.action.debug.callStackDown';
    exports.DEBUG_COMMAND_CATEGORY = { original: 'Debug', value: nls.localize('debug', 'Debug') };
    exports.RESTART_LABEL = { value: nls.localize('restartDebug', "Restart"), original: 'Restart' };
    exports.STEP_OVER_LABEL = { value: nls.localize('stepOverDebug', "Step Over"), original: 'Step Over' };
    exports.STEP_INTO_LABEL = { value: nls.localize('stepIntoDebug', "Step Into"), original: 'Step Into' };
    exports.STEP_INTO_TARGET_LABEL = { value: nls.localize('stepIntoTargetDebug', "Step Into Target"), original: 'Step Into Target' };
    exports.STEP_OUT_LABEL = { value: nls.localize('stepOutDebug', "Step Out"), original: 'Step Out' };
    exports.PAUSE_LABEL = { value: nls.localize('pauseDebug', "Pause"), original: 'Pause' };
    exports.DISCONNECT_LABEL = { value: nls.localize('disconnect', "Disconnect"), original: 'Disconnect' };
    exports.DISCONNECT_AND_SUSPEND_LABEL = { value: nls.localize('disconnectSuspend', "Disconnect and Suspend"), original: 'Disconnect and Suspend' };
    exports.STOP_LABEL = { value: nls.localize('stop', "Stop"), original: 'Stop' };
    exports.CONTINUE_LABEL = { value: nls.localize('continueDebug', "Continue"), original: 'Continue' };
    exports.FOCUS_SESSION_LABEL = { value: nls.localize('focusSession', "Focus Session"), original: 'Focus Session' };
    exports.SELECT_AND_START_LABEL = { value: nls.localize('selectAndStartDebugging', "Select and Start Debugging"), original: 'Select and Start Debugging' };
    exports.DEBUG_CONFIGURE_LABEL = nls.localize('openLaunchJson', "Open '{0}'", 'launch.json');
    exports.DEBUG_START_LABEL = { value: nls.localize('startDebug', "Start Debugging"), original: 'Start Debugging' };
    exports.DEBUG_RUN_LABEL = { value: nls.localize('startWithoutDebugging', "Start Without Debugging"), original: 'Start Without Debugging' };
    exports.NEXT_DEBUG_CONSOLE_LABEL = { value: nls.localize('nextDebugConsole', "Focus Next Debug Console"), original: 'Focus Next Debug Console' };
    exports.PREV_DEBUG_CONSOLE_LABEL = { value: nls.localize('prevDebugConsole', "Focus Previous Debug Console"), original: 'Focus Previous Debug Console' };
    exports.OPEN_LOADED_SCRIPTS_LABEL = { value: nls.localize('openLoadedScript', "Open Loaded Script..."), original: 'Open Loaded Script...' };
    exports.CALLSTACK_TOP_LABEL = { value: nls.localize('callStackTop', "Navigate to Top of Call Stack"), original: 'Navigate to Top of Call Stack' };
    exports.CALLSTACK_BOTTOM_LABEL = { value: nls.localize('callStackBottom', "Navigate to Bottom of Call Stack"), original: 'Navigate to Bottom of Call Stack' };
    exports.CALLSTACK_UP_LABEL = { value: nls.localize('callStackUp', "Navigate Up Call Stack"), original: 'Navigate Up Call Stack' };
    exports.CALLSTACK_DOWN_LABEL = { value: nls.localize('callStackDown', "Navigate Down Call Stack"), original: 'Navigate Down Call Stack' };
    exports.SELECT_DEBUG_CONSOLE_LABEL = { value: nls.localize('selectDebugConsole', "Select Debug Console"), original: 'Select Debug Console' };
    exports.SELECT_DEBUG_SESSION_LABEL = { value: nls.localize('selectDebugSession', "Select Debug Session"), original: 'Select Debug Session' };
    exports.DEBUG_QUICK_ACCESS_PREFIX = 'debug ';
    exports.DEBUG_CONSOLE_QUICK_ACCESS_PREFIX = 'debug consoles ';
    function isThreadContext(obj) {
        return obj && typeof obj.sessionId === 'string' && typeof obj.threadId === 'string';
    }
    async function getThreadAndRun(accessor, sessionAndThreadId, run) {
        const debugService = accessor.get(debug_1.IDebugService);
        let thread;
        if (isThreadContext(sessionAndThreadId)) {
            const session = debugService.getModel().getSession(sessionAndThreadId.sessionId);
            if (session) {
                thread = session.getAllThreads().find(t => t.getId() === sessionAndThreadId.threadId);
            }
        }
        else if (isSessionContext(sessionAndThreadId)) {
            const session = debugService.getModel().getSession(sessionAndThreadId.sessionId);
            if (session) {
                const threads = session.getAllThreads();
                thread = threads.length > 0 ? threads[0] : undefined;
            }
        }
        if (!thread) {
            thread = debugService.getViewModel().focusedThread;
            if (!thread) {
                const focusedSession = debugService.getViewModel().focusedSession;
                const threads = focusedSession ? focusedSession.getAllThreads() : undefined;
                thread = threads && threads.length ? threads[0] : undefined;
            }
        }
        if (thread) {
            await run(thread);
        }
    }
    function isStackFrameContext(obj) {
        return obj && typeof obj.sessionId === 'string' && typeof obj.threadId === 'string' && typeof obj.frameId === 'string';
    }
    function getFrame(debugService, context) {
        if (isStackFrameContext(context)) {
            const session = debugService.getModel().getSession(context.sessionId);
            if (session) {
                const thread = session.getAllThreads().find(t => t.getId() === context.threadId);
                if (thread) {
                    return thread.getCallStack().find(sf => sf.getId() === context.frameId);
                }
            }
        }
        else {
            return debugService.getViewModel().focusedStackFrame;
        }
        return undefined;
    }
    function isSessionContext(obj) {
        return obj && typeof obj.sessionId === 'string';
    }
    async function changeDebugConsoleFocus(accessor, next) {
        const debugService = accessor.get(debug_1.IDebugService);
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const sessions = debugService.getModel().getSessions(true).filter(s => s.hasSeparateRepl());
        let currSession = debugService.getViewModel().focusedSession;
        let nextIndex = 0;
        if (sessions.length > 0 && currSession) {
            while (currSession && !currSession.hasSeparateRepl()) {
                currSession = currSession.parentSession;
            }
            if (currSession) {
                const currIndex = sessions.indexOf(currSession);
                if (next) {
                    nextIndex = (currIndex === (sessions.length - 1) ? 0 : (currIndex + 1));
                }
                else {
                    nextIndex = (currIndex === 0 ? (sessions.length - 1) : (currIndex - 1));
                }
            }
        }
        await debugService.focusStackFrame(undefined, undefined, sessions[nextIndex], { explicit: true });
        if (!viewsService.isViewVisible(debug_1.REPL_VIEW_ID)) {
            await viewsService.openView(debug_1.REPL_VIEW_ID, true);
        }
    }
    async function navigateCallStack(debugService, down) {
        const frame = debugService.getViewModel().focusedStackFrame;
        if (frame) {
            let callStack = frame.thread.getCallStack();
            let index = callStack.findIndex(elem => elem.frameId === frame.frameId);
            let nextVisibleFrame;
            if (down) {
                if (index >= callStack.length - 1) {
                    if (frame.thread.reachedEndOfCallStack) {
                        goToTopOfCallStack(debugService);
                        return;
                    }
                    else {
                        await debugService.getModel().fetchCallstack(frame.thread, 20);
                        callStack = frame.thread.getCallStack();
                        index = callStack.findIndex(elem => elem.frameId === frame.frameId);
                    }
                }
                nextVisibleFrame = findNextVisibleFrame(true, callStack, index);
            }
            else {
                if (index <= 0) {
                    goToBottomOfCallStack(debugService);
                    return;
                }
                nextVisibleFrame = findNextVisibleFrame(false, callStack, index);
            }
            if (nextVisibleFrame) {
                debugService.focusStackFrame(nextVisibleFrame);
            }
        }
    }
    async function goToBottomOfCallStack(debugService) {
        const thread = debugService.getViewModel().focusedThread;
        if (thread) {
            await debugService.getModel().fetchCallstack(thread);
            const callStack = thread.getCallStack();
            if (callStack.length > 0) {
                const nextVisibleFrame = findNextVisibleFrame(false, callStack, 0); // must consider the next frame up first, which will be the last frame
                if (nextVisibleFrame) {
                    debugService.focusStackFrame(nextVisibleFrame);
                }
            }
        }
    }
    function goToTopOfCallStack(debugService) {
        const thread = debugService.getViewModel().focusedThread;
        if (thread) {
            debugService.focusStackFrame(thread.getTopStackFrame());
        }
    }
    /**
     * Finds next frame that is not skipped by SkipFiles. Skips frame at index and starts searching at next.
     * Must satisfy `0 <= startIndex <= callStack - 1`
     * @param down specifies whether to search downwards if the current file is skipped.
     * @param callStack the call stack to search
     * @param startIndex the index to start the search at
     */
    function findNextVisibleFrame(down, callStack, startIndex) {
        if (startIndex >= callStack.length) {
            startIndex = callStack.length - 1;
        }
        else if (startIndex < 0) {
            startIndex = 0;
        }
        let index = startIndex;
        let currFrame;
        do {
            if (down) {
                if (index === callStack.length - 1) {
                    index = 0;
                }
                else {
                    index++;
                }
            }
            else {
                if (index === 0) {
                    index = callStack.length - 1;
                }
                else {
                    index--;
                }
            }
            currFrame = callStack[index];
            if (!(currFrame.source.presentationHint === 'deemphasize' || currFrame.presentationHint === 'deemphasize')) {
                return currFrame;
            }
        } while (index !== startIndex); // end loop when we've just checked the start index, since that should be the last one checked
        return undefined;
    }
    // These commands are used in call stack context menu, call stack inline actions, command palette, debug toolbar, mac native touch bar
    // When the command is exectued in the context of a thread(context menu on a thread, inline call stack action) we pass the thread id
    // Otherwise when it is executed "globaly"(using the touch bar, debug toolbar, command palette) we do not pass any id and just take whatever is the focussed thread
    // Same for stackFrame commands and session commands.
    commands_1.CommandsRegistry.registerCommand({
        id: exports.COPY_STACK_TRACE_ID,
        handler: async (accessor, _, context) => {
            const textResourcePropertiesService = accessor.get(textResourceConfiguration_1.ITextResourcePropertiesService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const debugService = accessor.get(debug_1.IDebugService);
            const frame = getFrame(debugService, context);
            if (frame) {
                const eol = textResourcePropertiesService.getEOL(frame.source.uri);
                await clipboardService.writeText(frame.thread.getCallStack().map(sf => sf.toString()).join(eol));
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.REVERSE_CONTINUE_ID,
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.reverseContinue());
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.STEP_BACK_ID,
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            if (debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.stepBack('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.stepBack());
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.TERMINATE_THREAD_ID,
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.terminate());
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.JUMP_TO_CURSOR_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const stackFrame = debugService.getViewModel().focusedStackFrame;
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditorControl = editorService.activeTextEditorControl;
            const notificationService = accessor.get(notification_1.INotificationService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            if (stackFrame && (0, editorBrowser_1.isCodeEditor)(activeEditorControl) && activeEditorControl.hasModel()) {
                const position = activeEditorControl.getPosition();
                const resource = activeEditorControl.getModel().uri;
                const source = stackFrame.thread.session.getSourceForUri(resource);
                if (source) {
                    const response = await stackFrame.thread.session.gotoTargets(source.raw, position.lineNumber, position.column);
                    const targets = response?.body.targets;
                    if (targets && targets.length) {
                        let id = targets[0].id;
                        if (targets.length > 1) {
                            const picks = targets.map(t => ({ label: t.label, _id: t.id }));
                            const pick = await quickInputService.pick(picks, { placeHolder: nls.localize('chooseLocation', "Choose the specific location") });
                            if (!pick) {
                                return;
                            }
                            id = pick._id;
                        }
                        return await stackFrame.thread.session.goto(stackFrame.thread.threadId, id).catch(e => notificationService.warn(e));
                    }
                }
            }
            return notificationService.warn(nls.localize('noExecutableCode', "No executable code is associated at the current cursor position."));
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.CALLSTACK_TOP_ID,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            goToTopOfCallStack(debugService);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.CALLSTACK_BOTTOM_ID,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            await goToBottomOfCallStack(debugService);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.CALLSTACK_UP_ID,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            navigateCallStack(debugService, false);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.CALLSTACK_DOWN_ID,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            navigateCallStack(debugService, true);
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        command: {
            id: exports.JUMP_TO_CURSOR_ID,
            title: nls.localize('jumpToCursor', "Jump to Cursor"),
            category: exports.DEBUG_COMMAND_CATEGORY
        },
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_JUMP_TO_CURSOR_SUPPORTED, editorContextKeys_1.EditorContextKeys.editorTextFocus),
        group: 'debug',
        order: 3
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.NEXT_DEBUG_CONSOLE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        when: debug_1.CONTEXT_IN_DEBUG_REPL,
        primary: 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */,
        mac: { primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */ },
        handler: async (accessor, _, context) => {
            changeDebugConsoleFocus(accessor, true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.PREV_DEBUG_CONSOLE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        when: debug_1.CONTEXT_IN_DEBUG_REPL,
        primary: 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */,
        mac: { primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 92 /* KeyCode.BracketLeft */ },
        handler: async (accessor, _, context) => {
            changeDebugConsoleFocus(accessor, false);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.RESTART_SESSION_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 63 /* KeyCode.F5 */,
        when: debug_1.CONTEXT_IN_DEBUG_MODE,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            let session;
            if (isSessionContext(context)) {
                session = debugService.getModel().getSession(context.sessionId);
            }
            else {
                session = debugService.getViewModel().focusedSession;
            }
            if (!session) {
                const { launch, name } = debugService.getConfigurationManager().selectedConfiguration;
                await debugService.startDebugging(launch, name, { noDebug: false, startedByUser: true });
            }
            else {
                const showSubSessions = configurationService.getValue('debug').showSubSessionsInToolBar;
                // Stop should be sent to the root parent session
                while (!showSubSessions && session.lifecycleManagedByParent && session.parentSession) {
                    session = session.parentSession;
                }
                session.removeReplExpressions();
                await debugService.restartSession(session);
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.STEP_OVER_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 68 /* KeyCode.F10 */,
        when: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'),
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            if (debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.next('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.next());
            }
        }
    });
    // Windows browsers use F11 for full screen, thus use alt+F11 as the default shortcut
    const STEP_INTO_KEYBINDING = (platform_1.isWeb && platform_1.isWindows) ? (512 /* KeyMod.Alt */ | 69 /* KeyCode.F11 */) : 69 /* KeyCode.F11 */;
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.STEP_INTO_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10, // Have a stronger weight to have priority over full screen when debugging
        primary: STEP_INTO_KEYBINDING,
        // Use a more flexible when clause to not allow full screen command to take over when F11 pressed a lot of times
        when: debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('inactive'),
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            if (debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.stepIn('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.stepIn());
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.STEP_OUT_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 69 /* KeyCode.F11 */,
        when: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'),
        handler: async (accessor, _, context) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            if (debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
                await getThreadAndRun(accessor, context, (thread) => thread.stepOut('instruction'));
            }
            else {
                await getThreadAndRun(accessor, context, (thread) => thread.stepOut());
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.PAUSE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 2, // take priority over focus next part while we are debugging
        primary: 64 /* KeyCode.F6 */,
        when: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('running'),
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.pause());
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.STEP_INTO_TARGET_ID,
        primary: STEP_INTO_KEYBINDING | 2048 /* KeyMod.CtrlCmd */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_STEP_INTO_TARGETS_SUPPORTED, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')),
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        handler: async (accessor, _, context) => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const debugService = accessor.get(debug_1.IDebugService);
            const session = debugService.getViewModel().focusedSession;
            const frame = debugService.getViewModel().focusedStackFrame;
            if (!frame || !session) {
                return;
            }
            const editor = await accessor.get(editorService_1.IEditorService).openEditor({
                resource: frame.source.uri,
                options: { revealIfOpened: true }
            });
            let codeEditor;
            if (editor) {
                const ctrl = editor?.getControl();
                if ((0, editorBrowser_1.isCodeEditor)(ctrl)) {
                    codeEditor = ctrl;
                }
            }
            const qp = quickInputService.createQuickPick();
            qp.busy = true;
            qp.show();
            qp.onDidChangeActive(([item]) => {
                if (codeEditor && item && item.target.line !== undefined) {
                    codeEditor.revealLineInCenterIfOutsideViewport(item.target.line);
                    codeEditor.setSelection({
                        startLineNumber: item.target.line,
                        startColumn: item.target.column || 1,
                        endLineNumber: item.target.endLine || item.target.line,
                        endColumn: item.target.endColumn || item.target.column || 1,
                    });
                }
            });
            qp.onDidAccept(() => {
                if (qp.activeItems.length) {
                    session.stepIn(frame.thread.threadId, qp.activeItems[0].target.id);
                }
            });
            qp.onDidHide(() => qp.dispose());
            session.stepInTargets(frame.frameId).then(targets => {
                qp.busy = false;
                if (targets?.length) {
                    qp.items = targets?.map(target => ({ target, label: target.label }));
                }
                else {
                    qp.placeholder = nls.localize('editor.debug.action.stepIntoTargets.none', "No step targets available");
                }
            });
        }
    });
    async function stopHandler(accessor, _, context, disconnect, suspend) {
        const debugService = accessor.get(debug_1.IDebugService);
        let session;
        if (isSessionContext(context)) {
            session = debugService.getModel().getSession(context.sessionId);
        }
        else {
            session = debugService.getViewModel().focusedSession;
        }
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const showSubSessions = configurationService.getValue('debug').showSubSessionsInToolBar;
        // Stop should be sent to the root parent session
        while (!showSubSessions && session && session.lifecycleManagedByParent && session.parentSession) {
            session = session.parentSession;
        }
        await debugService.stopSession(session, disconnect, suspend);
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.DISCONNECT_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 63 /* KeyCode.F5 */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, debug_1.CONTEXT_IN_DEBUG_MODE),
        handler: (accessor, _, context) => stopHandler(accessor, _, context, true)
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.DISCONNECT_AND_SUSPEND_ID,
        handler: (accessor, _, context) => stopHandler(accessor, _, context, true, true)
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.STOP_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 63 /* KeyCode.F5 */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_IN_DEBUG_MODE),
        handler: (accessor, _, context) => stopHandler(accessor, _, context, false)
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.RESTART_FRAME_ID,
        handler: async (accessor, _, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const notificationService = accessor.get(notification_1.INotificationService);
            const frame = getFrame(debugService, context);
            if (frame) {
                try {
                    await frame.restart();
                }
                catch (e) {
                    notificationService.error(e);
                }
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.CONTINUE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10, // Use a stronger weight to get priority over start debugging F5 shortcut
        primary: 63 /* KeyCode.F5 */,
        when: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'),
        handler: async (accessor, _, context) => {
            await getThreadAndRun(accessor, context, thread => thread.continue());
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SHOW_LOADED_SCRIPTS_ID,
        handler: async (accessor) => {
            await (0, loadedScriptsPicker_1.showLoadedScriptMenu)(accessor);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.FOCUS_REPL_ID,
        handler: async (accessor) => {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            await viewsService.openView(debug_1.REPL_VIEW_ID, true);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'debug.startFromConfig',
        handler: async (accessor, config) => {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.startDebugging(undefined, config);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.FOCUS_SESSION_ID,
        handler: async (accessor, session) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const stoppedChildSession = debugService.getModel().getSessions().find(s => s.parentSession === session && s.state === 2 /* State.Stopped */);
            if (stoppedChildSession && session.state !== 2 /* State.Stopped */) {
                session = stoppedChildSession;
            }
            await debugService.focusStackFrame(undefined, undefined, session, { explicit: true });
            const stackFrame = debugService.getViewModel().focusedStackFrame;
            if (stackFrame) {
                await stackFrame.openInEditor(editorService, true);
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SELECT_AND_START_ID,
        handler: async (accessor, debugType) => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const debugService = accessor.get(debug_1.IDebugService);
            if (debugType) {
                const configManager = debugService.getConfigurationManager();
                const dynamicProviders = await configManager.getDynamicProviders();
                for (const provider of dynamicProviders) {
                    if (provider.type === debugType) {
                        const pick = await provider.pick();
                        if (pick) {
                            await configManager.selectConfiguration(pick.launch, pick.config.name, pick.config, { type: provider.type });
                            debugService.startDebugging(pick.launch, pick.config, { startedByUser: true });
                            return;
                        }
                    }
                }
            }
            quickInputService.quickAccess.show(exports.DEBUG_QUICK_ACCESS_PREFIX);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SELECT_DEBUG_CONSOLE_ID,
        handler: async (accessor) => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            quickInputService.quickAccess.show(exports.DEBUG_CONSOLE_QUICK_ACCESS_PREFIX);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SELECT_DEBUG_SESSION_ID,
        handler: async (accessor) => {
            (0, debugSessionPicker_1.showDebugSessionMenu)(accessor, exports.SELECT_AND_START_ID);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.DEBUG_START_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 63 /* KeyCode.F5 */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('inactive')),
        handler: async (accessor, debugStartOptions) => {
            const debugService = accessor.get(debug_1.IDebugService);
            await (0, debugUtils_1.saveAllBeforeDebugStart)(accessor.get(configuration_1.IConfigurationService), accessor.get(editorService_1.IEditorService));
            const { launch, name, getConfig } = debugService.getConfigurationManager().selectedConfiguration;
            const config = await getConfig();
            const configOrName = config ? Object.assign((0, objects_1.deepClone)(config), debugStartOptions?.config) : name;
            await debugService.startDebugging(launch, configOrName, { noDebug: debugStartOptions?.noDebug, startedByUser: true }, false);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.DEBUG_RUN_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 63 /* KeyCode.F5 */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 63 /* KeyCode.F5 */ },
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, debug_1.CONTEXT_DEBUG_STATE.notEqualsTo((0, debug_1.getStateLabel)(1 /* State.Initializing */))),
        handler: async (accessor) => {
            const commandService = accessor.get(commands_1.ICommandService);
            await commandService.executeCommand(exports.DEBUG_START_COMMAND_ID, { noDebug: true });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.toggleBreakpoint',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
        primary: 10 /* KeyCode.Space */,
        handler: (accessor) => {
            const listService = accessor.get(listService_1.IListService);
            const debugService = accessor.get(debug_1.IDebugService);
            const list = listService.lastFocusedList;
            if (list instanceof listWidget_1.List) {
                const focused = list.getFocusedElements();
                if (focused && focused.length) {
                    debugService.enableOrDisableBreakpoints(!focused[0].enabled, focused[0]);
                }
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.enableOrDisableBreakpoint',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: undefined,
        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
        handler: (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const control = editorService.activeTextEditorControl;
            if ((0, editorBrowser_1.isCodeEditor)(control)) {
                const model = control.getModel();
                if (model) {
                    const position = control.getPosition();
                    if (position) {
                        const bps = debugService.getModel().getBreakpoints({ uri: model.uri, lineNumber: position.lineNumber });
                        if (bps.length) {
                            debugService.enableOrDisableBreakpoints(!bps[0].enabled, bps[0]);
                        }
                    }
                }
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.EDIT_EXPRESSION_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5,
        when: debug_1.CONTEXT_WATCH_EXPRESSIONS_FOCUSED,
        primary: 60 /* KeyCode.F2 */,
        mac: { primary: 3 /* KeyCode.Enter */ },
        handler: (accessor, expression) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (!(expression instanceof debugModel_1.Expression)) {
                const listService = accessor.get(listService_1.IListService);
                const focused = listService.lastFocusedList;
                if (focused) {
                    const elements = focused.getFocus();
                    if (Array.isArray(elements) && elements[0] instanceof debugModel_1.Expression) {
                        expression = elements[0];
                    }
                }
            }
            if (expression instanceof debugModel_1.Expression) {
                debugService.getViewModel().setSelectedExpression(expression, false);
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SET_EXPRESSION_COMMAND_ID,
        handler: async (accessor, expression) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (expression instanceof debugModel_1.Expression || expression instanceof debugModel_1.Variable) {
                debugService.getViewModel().setSelectedExpression(expression, true);
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.setVariable',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 5,
        when: debug_1.CONTEXT_VARIABLES_FOCUSED,
        primary: 60 /* KeyCode.F2 */,
        mac: { primary: 3 /* KeyCode.Enter */ },
        handler: (accessor) => {
            const listService = accessor.get(listService_1.IListService);
            const debugService = accessor.get(debug_1.IDebugService);
            const focused = listService.lastFocusedList;
            if (focused) {
                const elements = focused.getFocus();
                if (Array.isArray(elements) && elements[0] instanceof debugModel_1.Variable) {
                    debugService.getViewModel().setSelectedExpression(elements[0], false);
                }
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.REMOVE_EXPRESSION_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_WATCH_EXPRESSIONS_FOCUSED, debug_1.CONTEXT_EXPRESSION_SELECTED.toNegated()),
        primary: 20 /* KeyCode.Delete */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */ },
        handler: (accessor, expression) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (expression instanceof debugModel_1.Expression) {
                debugService.removeWatchExpressions(expression.getId());
                return;
            }
            const listService = accessor.get(listService_1.IListService);
            const focused = listService.lastFocusedList;
            if (focused) {
                let elements = focused.getFocus();
                if (Array.isArray(elements) && elements[0] instanceof debugModel_1.Expression) {
                    const selection = focused.getSelection();
                    if (selection && selection.indexOf(elements[0]) >= 0) {
                        elements = selection;
                    }
                    elements.forEach((e) => debugService.removeWatchExpressions(e.getId()));
                }
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.removeBreakpoint',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_FOCUSED, debug_1.CONTEXT_BREAKPOINT_INPUT_FOCUSED.toNegated()),
        primary: 20 /* KeyCode.Delete */,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */ },
        handler: (accessor) => {
            const listService = accessor.get(listService_1.IListService);
            const debugService = accessor.get(debug_1.IDebugService);
            const list = listService.lastFocusedList;
            if (list instanceof listWidget_1.List) {
                const focused = list.getFocusedElements();
                const element = focused.length ? focused[0] : undefined;
                if (element instanceof debugModel_1.Breakpoint) {
                    debugService.removeBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.FunctionBreakpoint) {
                    debugService.removeFunctionBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.DataBreakpoint) {
                    debugService.removeDataBreakpoints(element.getId());
                }
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.installAdditionalDebuggers',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: async (accessor, query) => {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const viewlet = (await paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true))?.getViewPaneContainer();
            let searchFor = `@category:debuggers`;
            if (typeof query === 'string') {
                searchFor += ` ${query}`;
            }
            viewlet.search(searchFor);
            viewlet.focus();
        }
    });
    (0, actions_1.registerAction2)(class AddConfigurationAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.ADD_CONFIGURATION_ID,
                title: { value: nls.localize('addConfiguration', "Add Configuration..."), original: 'Add Configuration...' },
                category: exports.DEBUG_COMMAND_CATEGORY,
                f1: true,
                menu: {
                    id: actions_1.MenuId.EditorContent,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.regex(contextkeys_2.ResourceContextKey.Path.key, /\.vscode[/\\]launch\.json$/), contextkeys_2.ActiveEditorContext.isEqualTo(files_1.TEXT_FILE_EDITOR_ID))
                }
            });
        }
        async run(accessor, launchUri) {
            const manager = accessor.get(debug_1.IDebugService).getConfigurationManager();
            const launch = manager.getLaunches().find(l => l.uri.toString() === launchUri) || manager.selectedConfiguration.launch;
            if (launch) {
                const { editor, created } = await launch.openConfigFile({ preserveFocus: false });
                if (editor && !created) {
                    const codeEditor = editor.getControl();
                    if (codeEditor) {
                        await codeEditor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID)?.addLaunchConfiguration();
                    }
                }
            }
        }
    });
    const inlineBreakpointHandler = (accessor) => {
        const debugService = accessor.get(debug_1.IDebugService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const control = editorService.activeTextEditorControl;
        if ((0, editorBrowser_1.isCodeEditor)(control)) {
            const position = control.getPosition();
            if (position && control.hasModel() && debugService.canSetBreakpointsIn(control.getModel())) {
                const modelUri = control.getModel().uri;
                const breakpointAlreadySet = debugService.getModel().getBreakpoints({ lineNumber: position.lineNumber, uri: modelUri })
                    .some(bp => (bp.sessionAgnosticData.column === position.column || (!bp.column && position.column <= 1)));
                if (!breakpointAlreadySet) {
                    debugService.addBreakpoints(modelUri, [{ lineNumber: position.lineNumber, column: position.column > 1 ? position.column : undefined }]);
                }
            }
        }
    };
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
        id: exports.TOGGLE_INLINE_BREAKPOINT_ID,
        handler: inlineBreakpointHandler
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        command: {
            id: exports.TOGGLE_INLINE_BREAKPOINT_ID,
            title: nls.localize('addInlineBreakpoint', "Add Inline Breakpoint"),
            category: exports.DEBUG_COMMAND_CATEGORY
        },
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, contextkeys_2.PanelFocusContext.toNegated(), editorContextKeys_1.EditorContextKeys.editorTextFocus),
        group: 'debug',
        order: 1
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.openBreakpointToSide',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: debug_1.CONTEXT_BREAKPOINTS_FOCUSED,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        secondary: [512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */],
        handler: (accessor) => {
            const listService = accessor.get(listService_1.IListService);
            const list = listService.lastFocusedList;
            if (list instanceof listWidget_1.List) {
                const focus = list.getFocusedElements();
                if (focus.length && focus[0] instanceof debugModel_1.Breakpoint) {
                    return (0, breakpointsView_1.openBreakpointSource)(focus[0], true, false, true, accessor.get(debug_1.IDebugService), accessor.get(editorService_1.IEditorService));
                }
            }
            return undefined;
        }
    });
    // When there are no debug extensions, open the debug viewlet when F5 is pressed so the user can read the limitations
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'debug.openView',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE.toNegated(),
        primary: 63 /* KeyCode.F5 */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 63 /* KeyCode.F5 */],
        handler: async (accessor) => {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            await paneCompositeService.openPaneComposite(debug_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdDb21tYW5kcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kZWJ1Z0NvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9DbkYsUUFBQSxvQkFBb0IsR0FBRyx3QkFBd0IsQ0FBQztJQUNoRCxRQUFBLDJCQUEyQixHQUFHLDRDQUE0QyxDQUFDO0lBQzNFLFFBQUEsbUJBQW1CLEdBQUcsc0JBQXNCLENBQUM7SUFDN0MsUUFBQSxtQkFBbUIsR0FBRyx3Q0FBd0MsQ0FBQztJQUMvRCxRQUFBLFlBQVksR0FBRyxpQ0FBaUMsQ0FBQztJQUNqRCxRQUFBLGtCQUFrQixHQUFHLGdDQUFnQyxDQUFDO0lBQ3RELFFBQUEsbUJBQW1CLEdBQUcsd0NBQXdDLENBQUM7SUFDL0QsUUFBQSxZQUFZLEdBQUcsaUNBQWlDLENBQUM7SUFDakQsUUFBQSxZQUFZLEdBQUcsaUNBQWlDLENBQUM7SUFDakQsUUFBQSxtQkFBbUIsR0FBRyx1Q0FBdUMsQ0FBQztJQUM5RCxRQUFBLFdBQVcsR0FBRyxnQ0FBZ0MsQ0FBQztJQUMvQyxRQUFBLFFBQVEsR0FBRyw4QkFBOEIsQ0FBQztJQUMxQyxRQUFBLGFBQWEsR0FBRyxtQ0FBbUMsQ0FBQztJQUNwRCxRQUFBLHlCQUF5QixHQUFHLDZDQUE2QyxDQUFDO0lBQzFFLFFBQUEsT0FBTyxHQUFHLDZCQUE2QixDQUFDO0lBQ3hDLFFBQUEsZ0JBQWdCLEdBQUcscUNBQXFDLENBQUM7SUFDekQsUUFBQSxXQUFXLEdBQUcsaUNBQWlDLENBQUM7SUFDaEQsUUFBQSxhQUFhLEdBQUcsa0NBQWtDLENBQUM7SUFDbkQsUUFBQSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQztJQUN6QyxRQUFBLGdCQUFnQixHQUFHLHFDQUFxQyxDQUFDO0lBQ3pELFFBQUEsbUJB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