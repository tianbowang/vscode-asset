/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/browser/coreCommands", "vs/base/common/observable"], function (require, exports, async_1, lifecycle_1, coreCommands_1, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GhostTextContext = exports.MockInlineCompletionsProvider = void 0;
    class MockInlineCompletionsProvider {
        constructor() {
            this.returnValue = [];
            this.delayMs = 0;
            this.callHistory = new Array();
            this.calledTwiceIn50Ms = false;
            this.lastTimeMs = undefined;
        }
        setReturnValue(value, delayMs = 0) {
            this.returnValue = value ? [value] : [];
            this.delayMs = delayMs;
        }
        setReturnValues(values, delayMs = 0) {
            this.returnValue = values;
            this.delayMs = delayMs;
        }
        getAndClearCallHistory() {
            const history = [...this.callHistory];
            this.callHistory = [];
            return history;
        }
        assertNotCalledTwiceWithin50ms() {
            if (this.calledTwiceIn50Ms) {
                throw new Error('provideInlineCompletions has been called at least twice within 50ms. This should not happen.');
            }
        }
        async provideInlineCompletions(model, position, context, token) {
            const currentTimeMs = new Date().getTime();
            if (this.lastTimeMs && currentTimeMs - this.lastTimeMs < 50) {
                this.calledTwiceIn50Ms = true;
            }
            this.lastTimeMs = currentTimeMs;
            this.callHistory.push({
                position: position.toString(),
                triggerKind: context.triggerKind,
                text: model.getValue()
            });
            const result = new Array();
            result.push(...this.returnValue);
            if (this.delayMs > 0) {
                await (0, async_1.timeout)(this.delayMs);
            }
            return { items: result };
        }
        freeInlineCompletions() { }
        handleItemDidShow() { }
    }
    exports.MockInlineCompletionsProvider = MockInlineCompletionsProvider;
    class GhostTextContext extends lifecycle_1.Disposable {
        get currentPrettyViewState() {
            return this._currentPrettyViewState;
        }
        constructor(model, editor) {
            super();
            this.editor = editor;
            this.prettyViewStates = new Array();
            this._register((0, observable_1.autorun)(reader => {
                /** @description update */
                const ghostText = model.ghostText.read(reader);
                let view;
                if (ghostText) {
                    view = ghostText.render(this.editor.getValue(), true);
                }
                else {
                    view = this.editor.getValue();
                }
                if (this._currentPrettyViewState !== view) {
                    this.prettyViewStates.push(view);
                }
                this._currentPrettyViewState = view;
            }));
        }
        getAndClearViewStates() {
            const arr = [...this.prettyViewStates];
            this.prettyViewStates.length = 0;
            return arr;
        }
        keyboardType(text) {
            this.editor.trigger('keyboard', 'type', { text });
        }
        cursorUp() {
            coreCommands_1.CoreNavigationCommands.CursorUp.runEditorCommand(null, this.editor, null);
        }
        cursorRight() {
            coreCommands_1.CoreNavigationCommands.CursorRight.runEditorCommand(null, this.editor, null);
        }
        cursorLeft() {
            coreCommands_1.CoreNavigationCommands.CursorLeft.runEditorCommand(null, this.editor, null);
        }
        cursorDown() {
            coreCommands_1.CoreNavigationCommands.CursorDown.runEditorCommand(null, this.editor, null);
        }
        cursorLineEnd() {
            coreCommands_1.CoreNavigationCommands.CursorLineEnd.runEditorCommand(null, this.editor, null);
        }
        leftDelete() {
            coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, this.editor, null);
        }
    }
    exports.GhostTextContext = GhostTextContext;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGluZUNvbXBsZXRpb25zL3Rlc3QvYnJvd3Nlci91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBYSw2QkFBNkI7UUFBMUM7WUFDUyxnQkFBVyxHQUF1QixFQUFFLENBQUM7WUFDckMsWUFBTyxHQUFXLENBQUMsQ0FBQztZQUVwQixnQkFBVyxHQUFHLElBQUksS0FBSyxFQUFXLENBQUM7WUFDbkMsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1lBd0IxQixlQUFVLEdBQXVCLFNBQVMsQ0FBQztRQXlCcEQsQ0FBQztRQS9DTyxjQUFjLENBQUMsS0FBbUMsRUFBRSxVQUFrQixDQUFDO1lBQzdFLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUVNLGVBQWUsQ0FBQyxNQUEwQixFQUFFLFVBQWtCLENBQUM7WUFDckUsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUVNLHNCQUFzQjtZQUM1QixNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7UUFFTSw4QkFBOEI7WUFDcEMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4RkFBOEYsQ0FBQyxD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