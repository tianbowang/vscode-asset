/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/keyCodes", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/editorContextKeys", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/message/browser/messageController", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/contextkeys", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/workbench/contrib/debug/browser/disassemblyView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom_1, actions_1, keyCodes_1, editorExtensions_1, codeEditorService_1, position_1, editorContextKeys_1, languageFeatures_1, messageController_1, nls, actions_2, configuration_1, contextkey_1, contextView_1, uriIdentity_1, contextkeys_1, viewsService_1, breakpointsView_1, disassemblyView_1, debug_1, debugUtils_1, disassemblyViewInput_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectionToWatchExpressionsAction = exports.SelectionToReplAction = exports.RunToCursorAction = void 0;
    class ToggleBreakpointAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.debug.action.toggleBreakpoint',
                title: {
                    value: nls.localize('toggleBreakpointAction', "Debug: Toggle Breakpoint"),
                    original: 'Debug: Toggle Breakpoint',
                    mnemonicTitle: nls.localize({ key: 'miToggleBreakpoint', comment: ['&& denotes a mnemonic'] }, "Toggle &&Breakpoint"),
                },
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.or(editorContextKeys_1.EditorContextKeys.editorTextFocus, debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS),
                    primary: 67 /* KeyCode.F9 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: {
                    id: actions_2.MenuId.MenubarDebugMenu,
                    when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                    group: '4_new_breakpoint',
                    order: 1
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const debugService = accessor.get(debug_1.IDebugService);
            const activePane = editorService.activeEditorPane;
            if (activePane instanceof disassemblyView_1.DisassemblyView) {
                const location = activePane.focusedAddressAndOffset;
                if (location) {
                    const bps = debugService.getModel().getInstructionBreakpoints();
                    const toRemove = bps.find(bp => bp.address === location.address);
                    if (toRemove) {
                        debugService.removeInstructionBreakpoints(toRemove.instructionReference, toRemove.offset);
                    }
                    else {
                        debugService.addInstructionBreakpoint(location.reference, location.offset, location.address);
                    }
                }
                return;
            }
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
            if (editor?.hasModel()) {
                const modelUri = editor.getModel().uri;
                const canSet = debugService.canSetBreakpointsIn(editor.getModel());
                // Does not account for multi line selections, Set to remove multiple cursor on the same line
                const lineNumbers = [...new Set(editor.getSelections().map(s => s.getPosition().lineNumber))];
                await Promise.all(lineNumbers.map(async (line) => {
                    const bps = debugService.getModel().getBreakpoints({ lineNumber: line, uri: modelUri });
                    if (bps.length) {
                        await Promise.all(bps.map(bp => debugService.removeBreakpoints(bp.getId())));
                    }
                    else if (canSet) {
                        await debugService.addBreakpoints(modelUri, [{ lineNumber: line }]);
                    }
                }));
            }
        }
    }
    class ConditionalBreakpointAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.conditionalBreakpoint',
                label: nls.localize('conditionalBreakpointEditorAction', "Debug: Add Conditional Breakpoint..."),
                alias: 'Debug: Add Conditional Breakpoint...',
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menuOpts: {
                    menuId: actions_2.MenuId.MenubarNewBreakpointMenu,
                    title: nls.localize({ key: 'miConditionalBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&Conditional Breakpoint..."),
                    group: '1_breakpoints',
                    order: 1,
                    when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const position = editor.getPosition();
            if (position && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
                editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(position.lineNumber, undefined, 0 /* BreakpointWidgetContext.CONDITION */);
            }
        }
    }
    class LogPointAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.addLogPoint',
                label: nls.localize('logPointEditorAction', "Debug: Add Logpoint..."),
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                alias: 'Debug: Add Logpoint...',
                menuOpts: [
                    {
                        menuId: actions_2.MenuId.MenubarNewBreakpointMenu,
                        title: nls.localize({ key: 'miLogPoint', comment: ['&& denotes a mnemonic'] }, "&&Logpoint..."),
                        group: '1_breakpoints',
                        order: 4,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                    }
                ]
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const position = editor.getPosition();
            if (position && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
                editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(position.lineNumber, position.column, 2 /* BreakpointWidgetContext.LOG_MESSAGE */);
            }
        }
    }
    class TriggerByBreakpointAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.triggerByBreakpoint',
                label: nls.localize('triggerByBreakpointEditorAction', "Debug: Add Triggered Breakpoint..."),
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                alias: 'Debug: Triggered Breakpoint...',
                menuOpts: [
                    {
                        menuId: actions_2.MenuId.MenubarNewBreakpointMenu,
                        title: nls.localize({ key: 'miTriggerByBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&Triggered Breakpoint..."),
                        group: '1_breakpoints',
                        order: 4,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                    }
                ]
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const position = editor.getPosition();
            if (position && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
                editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(position.lineNumber, position.column, 3 /* BreakpointWidgetContext.TRIGGER_POINT */);
            }
        }
    }
    class EditBreakpointAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.editBreakpoint',
                label: nls.localize('EditBreakpointEditorAction', "Debug: Edit Breakpoint"),
                alias: 'Debug: Edit Existing Breakpoint',
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menuOpts: {
                    menuId: actions_2.MenuId.MenubarNewBreakpointMenu,
                    title: nls.localize({ key: 'miEditBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&Edit Breakpoint"),
                    group: '1_breakpoints',
                    order: 1,
                    when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const position = editor.getPosition();
            const debugModel = debugService.getModel();
            if (!(editor.hasModel() && position)) {
                return;
            }
            const lineBreakpoints = debugModel.getBreakpoints({ lineNumber: position.lineNumber });
            if (lineBreakpoints.length === 0) {
                return;
            }
            const breakpointDistances = lineBreakpoints.map(b => {
                if (!b.column) {
                    return position.column;
                }
                return Math.abs(b.column - position.column);
            });
            const closestBreakpointIndex = breakpointDistances.indexOf(Math.min(...breakpointDistances));
            const closestBreakpoint = lineBreakpoints[closestBreakpointIndex];
            editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(closestBreakpoint.lineNumber, closestBreakpoint.column);
        }
    }
    class OpenDisassemblyViewAction extends actions_2.Action2 {
        static { this.ID = 'debug.action.openDisassemblyView'; }
        constructor() {
            super({
                id: OpenDisassemblyViewAction.ID,
                title: {
                    value: nls.localize('openDisassemblyView', "Open Disassembly View"),
                    original: 'Open Disassembly View',
                    mnemonicTitle: nls.localize({ key: 'miDisassemblyView', comment: ['&& denotes a mnemonic'] }, "&&DisassemblyView")
                },
                precondition: debug_1.CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE,
                menu: [
                    {
                        id: actions_2.MenuId.EditorContext,
                        group: 'debug',
                        order: 5,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, contextkeys_1.PanelFocusContext.toNegated(), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), editorContextKeys_1.EditorContextKeys.editorTextFocus, debug_1.CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED, debug_1.CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST)
                    },
                    {
                        id: actions_2.MenuId.DebugCallStackContext,
                        group: 'z_commands',
                        order: 50,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('stackFrame'), debug_1.CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED)
                    },
                    {
                        id: actions_2.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), debug_1.CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED)
                    }
                ]
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            editorService.openEditor(disassemblyViewInput_1.DisassemblyViewInput.instance, { pinned: true, revealIfOpened: true });
        }
    }
    class ToggleDisassemblyViewSourceCodeAction extends actions_2.Action2 {
        static { this.ID = 'debug.action.toggleDisassemblyViewSourceCode'; }
        static { this.configID = 'debug.disassemblyView.showSourceCode'; }
        constructor() {
            super({
                id: ToggleDisassemblyViewSourceCodeAction.ID,
                title: {
                    value: nls.localize('toggleDisassemblyViewSourceCode', "Toggle Source Code in Disassembly View"),
                    original: 'Toggle Source Code in Disassembly View',
                    mnemonicTitle: nls.localize({ key: 'mitogglesource', comment: ['&& denotes a mnemonic'] }, "&&ToggleSource")
                },
                f1: true,
            });
        }
        run(accessor, editor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            if (configService) {
                const value = configService.getValue('debug').disassemblyView.showSourceCode;
                configService.updateValue(ToggleDisassemblyViewSourceCodeAction.configID, !value);
            }
        }
    }
    class RunToCursorAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.debug.action.runToCursor'; }
        static { this.LABEL = nls.localize2('runToCursor', "Run to Cursor"); }
        constructor() {
            super({
                id: RunToCursorAction.ID,
                label: RunToCursorAction.LABEL.value,
                alias: 'Debug: Run to Cursor',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, contextkeys_1.PanelFocusContext.toNegated(), contextkey_1.ContextKeyExpr.or(editorContextKeys_1.EditorContextKeys.editorTextFocus, debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS)),
                contextMenuOpts: {
                    group: 'debug',
                    order: 2,
                    when: debug_1.CONTEXT_IN_DEBUG_MODE
                }
            });
        }
        async run(accessor, editor) {
            const position = editor.getPosition();
            if (!(editor.hasModel() && position)) {
                return;
            }
            const uri = editor.getModel().uri;
            const debugService = accessor.get(debug_1.IDebugService);
            const viewModel = debugService.getViewModel();
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            let column = undefined;
            const focusedStackFrame = viewModel.focusedStackFrame;
            if (focusedStackFrame && uriIdentityService.extUri.isEqual(focusedStackFrame.source.uri, uri) && focusedStackFrame.range.startLineNumber === position.lineNumber) {
                // If the cursor is on a line different than the one the debugger is currently paused on, then send the breakpoint on the line without a column
                // otherwise set it at the precise column #102199
                column = position.column;
            }
            await debugService.runTo(uri, position.lineNumber, column);
        }
    }
    exports.RunToCursorAction = RunToCursorAction;
    class SelectionToReplAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.debug.action.selectionToRepl'; }
        static { this.LABEL = nls.localize2('evaluateInDebugConsole', "Evaluate in Debug Console"); }
        constructor() {
            super({
                id: SelectionToReplAction.ID,
                label: SelectionToReplAction.LABEL.value,
                alias: 'Debug: Evaluate in Console',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 0
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const viewModel = debugService.getViewModel();
            const session = viewModel.focusedSession;
            if (!editor.hasModel() || !session) {
                return;
            }
            const selection = editor.getSelection();
            let text;
            if (selection.isEmpty()) {
                text = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
            }
            else {
                text = editor.getModel().getValueInRange(selection);
            }
            await session.addReplExpression(viewModel.focusedStackFrame, text);
            await viewsService.openView(debug_1.REPL_VIEW_ID, false);
        }
    }
    exports.SelectionToReplAction = SelectionToReplAction;
    class SelectionToWatchExpressionsAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.debug.action.selectionToWatch'; }
        static { this.LABEL = nls.localize2('addToWatch', "Add to Watch"); }
        constructor() {
            super({
                id: SelectionToWatchExpressionsAction.ID,
                label: SelectionToWatchExpressionsAction.LABEL.value,
                alias: 'Debug: Add to Watch',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 1
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
            if (!editor.hasModel()) {
                return;
            }
            let expression = undefined;
            const model = editor.getModel();
            const selection = editor.getSelection();
            if (!selection.isEmpty()) {
                expression = model.getValueInRange(selection);
            }
            else {
                const position = editor.getPosition();
                const evaluatableExpression = await (0, debugUtils_1.getEvaluatableExpressionAtPosition)(languageFeaturesService, model, position);
                if (!evaluatableExpression) {
                    return;
                }
                expression = evaluatableExpression.matchingExpression;
            }
            if (!expression) {
                return;
            }
            await viewsService.openView(debug_1.WATCH_VIEW_ID);
            debugService.addWatchExpression(expression);
        }
    }
    exports.SelectionToWatchExpressionsAction = SelectionToWatchExpressionsAction;
    class ShowDebugHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.showDebugHover',
                label: nls.localize('showDebugHover', "Debug: Show Hover"),
                alias: 'Debug: Show Hover',
                precondition: debug_1.CONTEXT_IN_DEBUG_MODE,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(accessor, editor) {
            const position = editor.getPosition();
            if (!position || !editor.hasModel()) {
                return;
            }
            return editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID)?.showHover(position, true);
        }
    }
    const NO_TARGETS_MESSAGE = nls.localize('editor.debug.action.stepIntoTargets.notAvailable', "Step targets are not available here");
    class StepIntoTargetsAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.debug.action.stepIntoTargets'; }
        static { this.LABEL = nls.localize({ key: 'stepIntoTargets', comment: ['Step Into Targets lets the user step into an exact function he or she is interested in.'] }, "Step Into Target"); }
        constructor() {
            super({
                id: StepIntoTargetsAction.ID,
                label: StepIntoTargetsAction.LABEL,
                alias: 'Debug: Step Into Target',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_STEP_INTO_TARGETS_SUPPORTED, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 1.5
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const contextMenuService = accessor.get(contextView_1.IContextMenuService);
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            const session = debugService.getViewModel().focusedSession;
            const frame = debugService.getViewModel().focusedStackFrame;
            const selection = editor.getSelection();
            const targetPosition = selection?.getPosition() || (frame && { lineNumber: frame.range.startLineNumber, column: frame.range.startColumn });
            if (!session || !frame || !editor.hasModel() || !uriIdentityService.extUri.isEqual(editor.getModel().uri, frame.source.uri)) {
                if (targetPosition) {
                    messageController_1.MessageController.get(editor)?.showMessage(NO_TARGETS_MESSAGE, targetPosition);
                }
                return;
            }
            const targets = await session.stepInTargets(frame.frameId);
            if (!targets?.length) {
                messageController_1.MessageController.get(editor)?.showMessage(NO_TARGETS_MESSAGE, targetPosition);
                return;
            }
            // If there is a selection, try to find the best target with a position to step into.
            if (selection) {
                const positionalTargets = [];
                for (const target of targets) {
                    if (target.line) {
                        positionalTargets.push({
                            start: new position_1.Position(target.line, target.column || 1),
                            end: target.endLine ? new position_1.Position(target.endLine, target.endColumn || 1) : undefined,
                            target
                        });
                    }
                }
                positionalTargets.sort((a, b) => b.start.lineNumber - a.start.lineNumber || b.start.column - a.start.column);
                const needle = selection.getPosition();
                // Try to find a target with a start and end that is around the cursor
                // position. Or, if none, whatever is before the cursor.
                const best = positionalTargets.find(t => t.end && needle.isBefore(t.end) && t.start.isBeforeOrEqual(needle)) || positionalTargets.find(t => t.end === undefined && t.start.isBeforeOrEqual(needle));
                if (best) {
                    session.stepIn(frame.thread.threadId, best.target.id);
                    return;
                }
            }
            // Otherwise, show a context menu and have the user pick a target
            editor.revealLineInCenterIfOutsideViewport(frame.range.startLineNumber);
            const cursorCoords = editor.getScrolledVisiblePosition(targetPosition);
            const editorCoords = (0, dom_1.getDomNodePagePosition)(editor.getDomNode());
            const x = editorCoords.left + cursorCoords.left;
            const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
            contextMenuService.showContextMenu({
                getAnchor: () => ({ x, y }),
                getActions: () => {
                    return targets.map(t => new actions_1.Action(`stepIntoTarget:${t.id}`, t.label, undefined, true, () => session.stepIn(frame.thread.threadId, t.id)));
                }
            });
        }
    }
    class GoToBreakpointAction extends editorExtensions_1.EditorAction {
        constructor(isNext, opts) {
            super(opts);
            this.isNext = isNext;
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            if (editor.hasModel()) {
                const currentUri = editor.getModel().uri;
                const currentLine = editor.getPosition().lineNumber;
                //Breakpoints returned from `getBreakpoints` are already sorted.
                const allEnabledBreakpoints = debugService.getModel().getBreakpoints({ enabledOnly: true });
                //Try to find breakpoint in current file
                let moveBreakpoint = this.isNext
                    ? allEnabledBreakpoints.filter(bp => uriIdentityService.extUri.isEqual(bp.uri, currentUri) && bp.lineNumber > currentLine).shift()
                    : allEnabledBreakpoints.filter(bp => uriIdentityService.extUri.isEqual(bp.uri, currentUri) && bp.lineNumber < currentLine).pop();
                //Try to find breakpoints in following files
                if (!moveBreakpoint) {
                    moveBreakpoint =
                        this.isNext
                            ? allEnabledBreakpoints.filter(bp => bp.uri.toString() > currentUri.toString()).shift()
                            : allEnabledBreakpoints.filter(bp => bp.uri.toString() < currentUri.toString()).pop();
                }
                //Move to first or last possible breakpoint
                if (!moveBreakpoint && allEnabledBreakpoints.length) {
                    moveBreakpoint = this.isNext ? allEnabledBreakpoints[0] : allEnabledBreakpoints[allEnabledBreakpoints.length - 1];
                }
                if (moveBreakpoint) {
                    return (0, breakpointsView_1.openBreakpointSource)(moveBreakpoint, false, true, false, debugService, editorService);
                }
            }
        }
    }
    class GoToNextBreakpointAction extends GoToBreakpointAction {
        constructor() {
            super(true, {
                id: 'editor.debug.action.goToNextBreakpoint',
                label: nls.localize('goToNextBreakpoint', "Debug: Go to Next Breakpoint"),
                alias: 'Debug: Go to Next Breakpoint',
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
            });
        }
    }
    class GoToPreviousBreakpointAction extends GoToBreakpointAction {
        constructor() {
            super(false, {
                id: 'editor.debug.action.goToPreviousBreakpoint',
                label: nls.localize('goToPreviousBreakpoint', "Debug: Go to Previous Breakpoint"),
                alias: 'Debug: Go to Previous Breakpoint',
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
            });
        }
    }
    class CloseExceptionWidgetAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.closeExceptionWidget',
                label: nls.localize('closeExceptionWidget', "Close Exception Widget"),
                alias: 'Close Exception Widget',
                precondition: debug_1.CONTEXT_EXCEPTION_WIDGET_VISIBLE,
                kbOpts: {
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(_accessor, editor) {
            const contribution = editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID);
            contribution?.closeExceptionWidget();
        }
    }
    (0, actions_2.registerAction2)(OpenDisassemblyViewAction);
    (0, actions_2.registerAction2)(ToggleDisassemblyViewSourceCodeAction);
    (0, actions_2.registerAction2)(ToggleBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(ConditionalBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(LogPointAction);
    (0, editorExtensions_1.registerEditorAction)(TriggerByBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(EditBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(RunToCursorAction);
    (0, editorExtensions_1.registerEditorAction)(StepIntoTargetsAction);
    (0, editorExtensions_1.registerEditorAction)(SelectionToReplAction);
    (0, editorExtensions_1.registerEditorAction)(SelectionToWatchExpressionsAction);
    (0, editorExtensions_1.registerEditorAction)(ShowDebugHoverAction);
    (0, editorExtensions_1.registerEditorAction)(GoToNextBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(GoToPreviousBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(CloseExceptionWidgetAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdFZGl0b3JBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnRWRpdG9yQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE4QmhHLE1BQU0sc0JBQXVCLFNBQVEsaUJBQU87UUFDM0M7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHNDQUFzQztnQkFDMUMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLDBCQUEwQixDQUFDO29CQUN6RSxRQUFRLEVBQUUsMEJBQTBCO29CQUNwQyxhQUFhLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxvQkFBb0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUscUJBQXFCLENBQUM7aUJBQ3JIO2dCQUNELFlBQVksRUFBRSxtQ0FBMkI7Z0JBQ3pDLFVBQVUsRUFBRTtvQkFDWCxJQUFJLEVBQUUsMkJBQWMsQ0FBQyxFQUFFLENBQUMscUNBQWlCLENBQUMsZUFBZSxFQUFFLHNDQUE4QixDQUFDO29CQUMxRixPQUFPLHFCQUFZO29CQUNuQixNQUFNLDBDQUFnQztpQkFDdEM7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGdCQUFnQjtvQkFDM0IsSUFBSSxFQUFFLG1DQUEyQjtvQkFDakMsS0FBSyxFQUFFLGtCQUFrQjtvQkFDekIsS0FBSyxFQUFFLENBQUM7aUJBQ1I7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FB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