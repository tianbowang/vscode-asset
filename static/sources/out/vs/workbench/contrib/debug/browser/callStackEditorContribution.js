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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/model", "vs/nls", "vs/platform/log/common/log", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/css!./media/callStackEditorContribution"], function (require, exports, arrays_1, event_1, lifecycle_1, range_1, model_1, nls_1, log_1, colorRegistry_1, themeService_1, themables_1, uriIdentity_1, debugIcons_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallStackEditorContribution = exports.createDecorationsForStackFrame = exports.focusedStackFrameColor = exports.topStackFrameColor = void 0;
    exports.topStackFrameColor = (0, colorRegistry_1.registerColor)('editor.stackFrameHighlightBackground', { dark: '#ffff0033', light: '#ffff6673', hcDark: '#ffff0033', hcLight: '#ffff6673' }, (0, nls_1.localize)('topStackFrameLineHighlight', 'Background color for the highlight of line at the top stack frame position.'));
    exports.focusedStackFrameColor = (0, colorRegistry_1.registerColor)('editor.focusedStackFrameHighlightBackground', { dark: '#7abd7a4d', light: '#cee7ce73', hcDark: '#7abd7a4d', hcLight: '#cee7ce73' }, (0, nls_1.localize)('focusedStackFrameLineHighlight', 'Background color for the highlight of line at focused stack frame position.'));
    const stickiness = 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */;
    // we need a separate decoration for glyph margin, since we do not want it on each line of a multi line statement.
    const TOP_STACK_FRAME_MARGIN = {
        description: 'top-stack-frame-margin',
        glyphMarginClassName: themables_1.ThemeIcon.asClassName(debugIcons_1.debugStackframe),
        glyphMargin: { position: model_1.GlyphMarginLane.Right },
        zIndex: 9999,
        stickiness,
        overviewRuler: {
            position: model_1.OverviewRulerLane.Full,
            color: (0, themeService_1.themeColorFromId)(exports.topStackFrameColor)
        }
    };
    const FOCUSED_STACK_FRAME_MARGIN = {
        description: 'focused-stack-frame-margin',
        glyphMarginClassName: themables_1.ThemeIcon.asClassName(debugIcons_1.debugStackframeFocused),
        glyphMargin: { position: model_1.GlyphMarginLane.Right },
        zIndex: 9999,
        stickiness,
        overviewRuler: {
            position: model_1.OverviewRulerLane.Full,
            color: (0, themeService_1.themeColorFromId)(exports.focusedStackFrameColor)
        }
    };
    const TOP_STACK_FRAME_DECORATION = {
        description: 'top-stack-frame-decoration',
        isWholeLine: true,
        className: 'debug-top-stack-frame-line',
        stickiness
    };
    const FOCUSED_STACK_FRAME_DECORATION = {
        description: 'focused-stack-frame-decoration',
        isWholeLine: true,
        className: 'debug-focused-stack-frame-line',
        stickiness
    };
    function createDecorationsForStackFrame(stackFrame, isFocusedSession, noCharactersBefore) {
        // only show decorations for the currently focused thread.
        const result = [];
        const columnUntilEOLRange = new range_1.Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        const range = new range_1.Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1);
        // compute how to decorate the editor. Different decorations are used if this is a top stack frame, focused stack frame,
        // an exception or a stack frame that did not change the line number (we only decorate the columns, not the whole line).
        const topStackFrame = stackFrame.thread.getTopStackFrame();
        if (stackFrame.getId() === topStackFrame?.getId()) {
            if (isFocusedSession) {
                result.push({
                    options: TOP_STACK_FRAME_MARGIN,
                    range
                });
            }
            result.push({
                options: TOP_STACK_FRAME_DECORATION,
                range: columnUntilEOLRange
            });
            if (stackFrame.range.startColumn > 1) {
                result.push({
                    options: {
                        description: 'top-stack-frame-inline-decoration',
                        before: {
                            content: '\uEB8B',
                            inlineClassName: noCharactersBefore ? 'debug-top-stack-frame-column start-of-line' : 'debug-top-stack-frame-column',
                            inlineClassNameAffectsLetterSpacing: true
                        },
                    },
                    range: columnUntilEOLRange
                });
            }
        }
        else {
            if (isFocusedSession) {
                result.push({
                    options: FOCUSED_STACK_FRAME_MARGIN,
                    range
                });
            }
            result.push({
                options: FOCUSED_STACK_FRAME_DECORATION,
                range: columnUntilEOLRange
            });
        }
        return result;
    }
    exports.createDecorationsForStackFrame = createDecorationsForStackFrame;
    let CallStackEditorContribution = class CallStackEditorContribution extends lifecycle_1.Disposable {
        constructor(editor, debugService, uriIdentityService, logService) {
            super();
            this.editor = editor;
            this.debugService = debugService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.decorations = this.editor.createDecorationsCollection();
            const setDecorations = () => this.decorations.set(this.createCallStackDecorations());
            this._register(event_1.Event.any(this.debugService.getViewModel().onDidFocusStackFrame, this.debugService.getModel().onDidChangeCallStack)(() => {
                setDecorations();
            }));
            this._register(this.editor.onDidChangeModel(e => {
                if (e.newModelUrl) {
                    setDecorations();
                }
            }));
            setDecorations();
        }
        createCallStackDecorations() {
            const editor = this.editor;
            if (!editor.hasModel()) {
                return [];
            }
            const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
            const decorations = [];
            this.debugService.getModel().getSessions().forEach(s => {
                const isSessionFocused = s === focusedStackFrame?.thread.session;
                s.getAllThreads().forEach(t => {
                    if (t.stopped) {
                        const callStack = t.getCallStack();
                        const stackFrames = [];
                        if (callStack.length > 0) {
                            // Always decorate top stack frame, and decorate focused stack frame if it is not the top stack frame
                            if (focusedStackFrame && !focusedStackFrame.equals(callStack[0])) {
                                stackFrames.push(focusedStackFrame);
                            }
                            stackFrames.push(callStack[0]);
                        }
                        stackFrames.forEach(candidateStackFrame => {
                            if (candidateStackFrame && this.uriIdentityService.extUri.isEqual(candidateStackFrame.source.uri, editor.getModel()?.uri)) {
                                if (candidateStackFrame.range.startLineNumber > editor.getModel()?.getLineCount() || candidateStackFrame.range.startLineNumber < 1) {
                                    this.logService.warn(`CallStackEditorContribution: invalid stack frame line number: ${candidateStackFrame.range.startLineNumber}`);
                                    return;
                                }
                                const noCharactersBefore = editor.getModel().getLineFirstNonWhitespaceColumn(candidateStackFrame.range.startLineNumber) >= candidateStackFrame.range.startColumn;
                                decorations.push(...createDecorationsForStackFrame(candidateStackFrame, isSessionFocused, noCharactersBefore));
                            }
                        });
                    }
                });
            });
            // Deduplicate same decorations so colors do not stack #109045
            return (0, arrays_1.distinct)(decorations, d => `${d.options.className} ${d.options.glyphMarginClassName} ${d.range.startLineNumber} ${d.range.startColumn}`);
        }
        dispose() {
            super.dispose();
            this.decorations.clear();
        }
    };
    exports.CallStackEditorContribution = CallStackEditorContribution;
    exports.CallStackEditorContribution = CallStackEditorContribution = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, log_1.ILogService)
    ], CallStackEditorContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbFN0YWNrRWRpdG9yQ29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2NhbGxTdGFja0VkaXRvckNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQm5GLFFBQUEsa0JBQWtCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLHNDQUFzQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFLElBQUEsY0FBUSxFQUFDLDRCQUE0QixFQUFFLDZFQUE2RSxDQUFDLENBQUMsQ0FBQztJQUN4UixRQUFBLHNCQUFzQixHQUFHLElBQUEsNkJBQWEsRUFBQyw2Q0FBNkMsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsRUFBRSxJQUFBLGNBQVEsRUFBQyxnQ0FBZ0MsRUFBRSw2RUFBNkUsQ0FBQyxDQUFDLENBQUM7SUFDcFQsTUFBTSxVQUFVLDZEQUFxRCxDQUFDO0lBRXRFLGtIQUFrSDtJQUNsSCxNQUFNLHNCQUFzQixHQUE0QjtRQUN2RCxXQUFXLEVBQUUsd0JBQXdCO1FBQ3JDLG9CQUFvQixFQUFFLHFCQUFTLENBQUMsV0FBVyxDQUFDLDRCQUFlLENBQUM7UUFDNUQsV0FBVyxFQUFFLEVBQUUsUUFBUSxFQUFFLHVCQUFlLENBQUMsS0FBSyxFQUFFO1FBQ2hELE1BQU0sRUFBRSxJQUFJO1FBQ1osVUFBVTtRQUNWLGFBQWEsRUFBRTtZQUNkLFFBQVEsRUFBRSx5QkFBaUIsQ0FBQyxJQUFJO1lBQ2hDLEtBQUss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