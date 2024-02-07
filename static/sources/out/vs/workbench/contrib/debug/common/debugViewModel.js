/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, event_1, debug_1, debugUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewModel = void 0;
    class ViewModel {
        constructor(contextKeyService) {
            this.contextKeyService = contextKeyService;
            this.firstSessionStart = true;
            this._onDidFocusSession = new event_1.Emitter();
            this._onDidFocusThread = new event_1.Emitter();
            this._onDidFocusStackFrame = new event_1.Emitter();
            this._onDidSelectExpression = new event_1.Emitter();
            this._onDidEvaluateLazyExpression = new event_1.Emitter();
            this._onWillUpdateViews = new event_1.Emitter();
            contextKeyService.bufferChangeEvents(() => {
                this.expressionSelectedContextKey = debug_1.CONTEXT_EXPRESSION_SELECTED.bindTo(contextKeyService);
                this.loadedScriptsSupportedContextKey = debug_1.CONTEXT_LOADED_SCRIPTS_SUPPORTED.bindTo(contextKeyService);
                this.stepBackSupportedContextKey = debug_1.CONTEXT_STEP_BACK_SUPPORTED.bindTo(contextKeyService);
                this.focusedSessionIsAttach = debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.bindTo(contextKeyService);
                this.focusedSessionIsNoDebug = debug_1.CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG.bindTo(contextKeyService);
                this.restartFrameSupportedContextKey = debug_1.CONTEXT_RESTART_FRAME_SUPPORTED.bindTo(contextKeyService);
                this.stepIntoTargetsSupported = debug_1.CONTEXT_STEP_INTO_TARGETS_SUPPORTED.bindTo(contextKeyService);
                this.jumpToCursorSupported = debug_1.CONTEXT_JUMP_TO_CURSOR_SUPPORTED.bindTo(contextKeyService);
                this.setVariableSupported = debug_1.CONTEXT_SET_VARIABLE_SUPPORTED.bindTo(contextKeyService);
                this.setExpressionSupported = debug_1.CONTEXT_SET_EXPRESSION_SUPPORTED.bindTo(contextKeyService);
                this.multiSessionDebug = debug_1.CONTEXT_MULTI_SESSION_DEBUG.bindTo(contextKeyService);
                this.terminateDebuggeeSupported = debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED.bindTo(contextKeyService);
                this.suspendDebuggeeSupported = debug_1.CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED.bindTo(contextKeyService);
                this.disassembleRequestSupported = debug_1.CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED.bindTo(contextKeyService);
                this.focusedStackFrameHasInstructionPointerReference = debug_1.CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE.bindTo(contextKeyService);
            });
        }
        getId() {
            return 'root';
        }
        get focusedSession() {
            return this._focusedSession;
        }
        get focusedThread() {
            return this._focusedThread;
        }
        get focusedStackFrame() {
            return this._focusedStackFrame;
        }
        setFocus(stackFrame, thread, session, explicit) {
            const shouldEmitForStackFrame = this._focusedStackFrame !== stackFrame;
            const shouldEmitForSession = this._focusedSession !== session;
            const shouldEmitForThread = this._focusedThread !== thread;
            this._focusedStackFrame = stackFrame;
            this._focusedThread = thread;
            this._focusedSession = session;
            this.contextKeyService.bufferChangeEvents(() => {
                this.loadedScriptsSupportedContextKey.set(session ? !!session.capabilities.supportsLoadedSourcesRequest : false);
                this.stepBackSupportedContextKey.set(session ? !!session.capabilities.supportsStepBack : false);
                this.restartFrameSupportedContextKey.set(session ? !!session.capabilities.supportsRestartFrame : false);
                this.stepIntoTargetsSupported.set(session ? !!session.capabilities.supportsStepInTargetsRequest : false);
                this.jumpToCursorSupported.set(session ? !!session.capabilities.supportsGotoTargetsRequest : false);
                this.setVariableSupported.set(session ? !!session.capabilities.supportsSetVariable : false);
                this.setExpressionSupported.set(session ? !!session.capabilities.supportsSetExpression : false);
                this.terminateDebuggeeSupported.set(session ? !!session.capabilities.supportTerminateDebuggee : false);
                this.suspendDebuggeeSupported.set(session ? !!session.capabilities.supportSuspendDebuggee : false);
                this.disassembleRequestSupported.set(!!session?.capabilities.supportsDisassembleRequest);
                this.focusedStackFrameHasInstructionPointerReference.set(!!stackFrame?.instructionPointerReference);
                const attach = !!session && (0, debugUtils_1.isSessionAttach)(session);
                this.focusedSessionIsAttach.set(attach);
                this.focusedSessionIsNoDebug.set(!!session && !!session.configuration.noDebug);
            });
            if (shouldEmitForSession) {
                this._onDidFocusSession.fire(session);
            }
            // should not call onDidFocusThread if onDidFocusStackFrame is called.
            if (shouldEmitForStackFrame) {
                this._onDidFocusStackFrame.fire({ stackFrame, explicit, session });
            }
            else if (shouldEmitForThread) {
                this._onDidFocusThread.fire({ thread, explicit, session });
            }
        }
        get onDidFocusSession() {
            return this._onDidFocusSession.event;
        }
        get onDidFocusThread() {
            return this._onDidFocusThread.event;
        }
        get onDidFocusStackFrame() {
            return this._onDidFocusStackFrame.event;
        }
        getSelectedExpression() {
            return this.selectedExpression;
        }
        setSelectedExpression(expression, settingWatch) {
            this.selectedExpression = expression ? { expression, settingWatch: settingWatch } : undefined;
            this.expressionSelectedContextKey.set(!!expression);
            this._onDidSelectExpression.fire(this.selectedExpression);
        }
        get onDidSelectExpression() {
            return this._onDidSelectExpression.event;
        }
        get onDidEvaluateLazyExpression() {
            return this._onDidEvaluateLazyExpression.event;
        }
        updateViews() {
            this._onWillUpdateViews.fire();
        }
        get onWillUpdateViews() {
            return this._onWillUpdateViews.event;
        }
        isMultiSessionView() {
            return !!this.multiSessionDebug.get();
        }
        setMultiSessionView(isMultiSessionView) {
            this.multiSessionDebug.set(isMultiSessionView);
        }
        async evaluateLazyExpression(expression) {
            await expression.evaluateLazy();
            this._onDidEvaluateLazyExpression.fire(expression);
        }
    }
    exports.ViewModel = ViewModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdWaWV3TW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2NvbW1vbi9kZWJ1Z1ZpZXdNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsTUFBYSxTQUFTO1FBOEJyQixZQUFvQixpQkFBcUM7WUFBckMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQTVCekQsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1lBTVIsdUJBQWtCLEdBQUcsSUFBSSxlQUFPLEVBQTZCLENBQUM7WUFDOUQsc0JBQWlCLEdBQUcsSUFBSSxlQUFPLEVBQTBGLENBQUM7WUFDMUgsMEJBQXFCLEdBQUcsSUFBSSxlQUFPLEVBQWtHLENBQUM7WUFDdEksMkJBQXNCLEdBQUcsSUFBSSxlQUFPLEVBQWtFLENBQUM7WUFDdkcsaUNBQTRCLEdBQUcsSUFBSSxlQUFPLEVBQXdCLENBQUM7WUFDbkUsdUJBQWtCLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQWtCekQsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsbUNBQTJCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQzFGLElBQUksQ0FBQyxnQ0FBZ0MsR0FBRyx3Q0FBZ0MsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDbkcsSUFBSSxDQUFDLDJCQUEyQixHQUFHLG1DQUEyQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUN6RixJQUFJLENBQUMsc0JBQXNCLEdBQUcseUNBQWlDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQzFGLElBQUksQ0FBQyx1QkFBdUIsR0FBRywyQ0FBbUMsQ0FBQyxNQUFNLENBQUMsaUJB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