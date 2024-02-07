/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/findinput/findInputToggles", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/editor/contrib/find/browser/findModel", "vs/platform/theme/common/colorRegistry", "vs/css!./findOptionsWidget"], function (require, exports, dom, findInputToggles_1, widget_1, async_1, findModel_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FindOptionsWidget = void 0;
    class FindOptionsWidget extends widget_1.Widget {
        static { this.ID = 'editor.contrib.findOptionsWidget'; }
        constructor(editor, state, keybindingService) {
            super();
            this._hideSoon = this._register(new async_1.RunOnceScheduler(() => this._hide(), 2000));
            this._isVisible = false;
            this._editor = editor;
            this._state = state;
            this._keybindingService = keybindingService;
            this._domNode = document.createElement('div');
            this._domNode.className = 'findOptionsWidget';
            this._domNode.style.display = 'none';
            this._domNode.style.top = '10px';
            this._domNode.style.zIndex = '12';
            this._domNode.setAttribute('role', 'presentation');
            this._domNode.setAttribute('aria-hidden', 'true');
            const toggleStyles = {
                inputActiveOptionBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionBorder),
                inputActiveOptionForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionForeground),
                inputActiveOptionBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionBackground),
            };
            this.caseSensitive = this._register(new findInputToggles_1.CaseSensitiveToggle({
                appendTitle: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleCaseSensitiveCommand),
                isChecked: this._state.matchCase,
                ...toggleStyles
            }));
            this._domNode.appendChild(this.caseSensitive.domNode);
            this._register(this.caseSensitive.onChange(() => {
                this._state.change({
                    matchCase: this.caseSensitive.checked
                }, false);
            }));
            this.wholeWords = this._register(new findInputToggles_1.WholeWordsToggle({
                appendTitle: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleWholeWordCommand),
                isChecked: this._state.wholeWord,
                ...toggleStyles
            }));
            this._domNode.appendChild(this.wholeWords.domNode);
            this._register(this.wholeWords.onChange(() => {
                this._state.change({
                    wholeWord: this.wholeWords.checked
                }, false);
            }));
            this.regex = this._register(new findInputToggles_1.RegexToggle({
                appendTitle: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleRegexCommand),
                isChecked: this._state.isRegex,
                ...toggleStyles
            }));
            this._domNode.appendChild(this.regex.domNode);
            this._register(this.regex.onChange(() => {
                this._state.change({
                    isRegex: this.regex.checked
                }, false);
            }));
            this._editor.addOverlayWidget(this);
            this._register(this._state.onFindReplaceStateChange((e) => {
                let somethingChanged = false;
                if (e.isRegex) {
                    this.regex.checked = this._state.isRegex;
                    somethingChanged = true;
                }
                if (e.wholeWord) {
                    this.wholeWords.checked = this._state.wholeWord;
                    somethingChanged = true;
                }
                if (e.matchCase) {
                    this.caseSensitive.checked = this._state.matchCase;
                    somethingChanged = true;
                }
                if (!this._state.isRevealed && somethingChanged) {
                    this._revealTemporarily();
                }
            }));
            this._register(dom.addDisposableListener(this._domNode, dom.EventType.MOUSE_LEAVE, (e) => this._onMouseLeave()));
            this._register(dom.addDisposableListener(this._domNode, 'mouseover', (e) => this._onMouseOver()));
        }
        _keybindingLabelFor(actionId) {
            const kb = this._keybindingService.lookupKeybinding(actionId);
            if (!kb) {
                return '';
            }
            return ` (${kb.getLabel()})`;
        }
        dispose() {
            this._editor.removeOverlayWidget(this);
            super.dispose();
        }
        // ----- IOverlayWidget API
        getId() {
            return FindOptionsWidget.ID;
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            return {
                preference: 0 /* OverlayWidgetPositionPreference.TOP_RIGHT_CORNER */
            };
        }
        highlightFindOptions() {
            this._revealTemporarily();
        }
        _revealTemporarily() {
            this._show();
            this._hideSoon.schedule();
        }
        _onMouseLeave() {
            this._hideSoon.schedule();
        }
        _onMouseOver() {
            this._hideSoon.cancel();
        }
        _show() {
            if (this._isVisible) {
                return;
            }
            this._isVisible = true;
            this._domNode.style.display = 'block';
        }
        _hide() {
            if (!this._isVisible) {
                return;
            }
            this._isVisible = false;
            this._domNode.style.display = 'none';
        }
    }
    exports.FindOptionsWidget = FindOptionsWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZE9wdGlvbnNXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2ZpbmQvYnJvd3Nlci9maW5kT3B0aW9uc1dpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBYSxpQkFBa0IsU0FBUSxlQUFNO2lCQUVwQixPQUFFLEdBQUcsa0NBQWtDLEFBQXJDLENBQXNDO1FBV2hFLFlBQ0MsTUFBbUIsRUFDbkIsS0FBdUIsRUFDdkIsaUJBQXFDO1lBRXJDLEtBQUssRUFBRSxDQUFDO1lBa0hELGNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFlM0UsZUFBVSxHQUFZLEtBQUssQ0FBQztZQS9IbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1lBRTVDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQztZQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7WUFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxN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