/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/base/common/lifecycle", "vs/nls", "vs/base/browser/ui/aria/aria", "vs/css!./chatSlashCommandContentWidget"], function (require, exports, range_1, lifecycle_1, nls_1, aria) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlashCommandContentWidget = void 0;
    class SlashCommandContentWidget extends lifecycle_1.Disposable {
        constructor(_editor) {
            super();
            this._editor = _editor;
            this._domNode = document.createElement('div');
            this._isVisible = false;
            this._domNode.toggleAttribute('hidden', true);
            this._domNode.classList.add('chat-slash-command-content-widget');
            // If backspace at a slash command boundary, remove the slash command
            this._register(this._editor.onKeyDown((e) => this._handleKeyDown(e)));
        }
        dispose() {
            this.hide();
            super.dispose();
        }
        show() {
            if (!this._isVisible) {
                this._isVisible = true;
                this._domNode.toggleAttribute('hidden', false);
                this._editor.addContentWidget(this);
            }
        }
        hide() {
            if (this._isVisible) {
                this._isVisible = false;
                this._domNode.toggleAttribute('hidden', true);
                this._editor.removeContentWidget(this);
            }
        }
        setCommandText(slashCommand) {
            this._domNode.innerText = `/${slashCommand} `;
            this._lastSlashCommandText = slashCommand;
        }
        getId() {
            return 'chat-slash-command-content-widget';
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            return { position: { lineNumber: 1, column: 1 }, preference: [0 /* ContentWidgetPositionPreference.EXACT */] };
        }
        beforeRender() {
            const lineHeight = this._editor.getOption(66 /* EditorOption.lineHeight */);
            this._domNode.style.lineHeight = `${lineHeight - 2 /*padding*/}px`;
            return null;
        }
        _handleKeyDown(e) {
            if (e.keyCode !== 1 /* KeyCode.Backspace */) {
                return;
            }
            const firstLine = this._editor.getModel()?.getLineContent(1);
            const selection = this._editor.getSelection();
            const withSlash = `/${this._lastSlashCommandText} `;
            if (!firstLine?.startsWith(withSlash) || !selection?.isEmpty() || selection?.startLineNumber !== 1 || selection?.startColumn !== withSlash.length + 1) {
                return;
            }
            // Allow to undo the backspace
            this._editor.executeEdits('chat-slash-command', [{
                    range: new range_1.Range(1, 1, 1, selection.startColumn),
                    text: null
                }]);
            // Announce the deletion
            aria.alert((0, nls_1.localize)('exited slash command mode', 'Exited {0} mode', this._lastSlashCommandText));
        }
    }
    exports.SlashCommandContentWidget = SlashCommandContentWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFNsYXNoQ29tbWFuZENvbnRlbnRXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9jaGF0U2xhc2hDb21tYW5kQ29udGVudFdpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBYSx5QkFBMEIsU0FBUSxzQkFBVTtRQUt4RCxZQUFvQixPQUFvQjtZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQURXLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFKaEMsYUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFekMsZUFBVSxHQUFHLEtBQUssQ0FBQztZQUsxQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7WUFFakUscUVBQXFFO1lBQ3JFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxLQUFLLENB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