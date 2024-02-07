/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/widget", "vs/base/common/codicons", "vs/base/common/event", "vs/nls", "vs/css!./findInput"], function (require, exports, dom, toggle_1, inputBox_1, widget_1, codicons_1, event_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplaceInput = void 0;
    const NLS_DEFAULT_LABEL = nls.localize('defaultLabel', "input");
    const NLS_PRESERVE_CASE_LABEL = nls.localize('label.preserveCaseToggle', "Preserve Case");
    class PreserveCaseToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                // TODO: does this need its own icon?
                icon: codicons_1.Codicon.preserveCase,
                title: NLS_PRESERVE_CASE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    class ReplaceInput extends widget_1.Widget {
        static { this.OPTION_CHANGE = 'optionChange'; }
        constructor(parent, contextViewProvider, _showOptionButtons, options) {
            super();
            this._showOptionButtons = _showOptionButtons;
            this.fixFocusOnOptionClickEnabled = true;
            this.cachedOptionsWidth = 0;
            this._onDidOptionChange = this._register(new event_1.Emitter());
            this.onDidOptionChange = this._onDidOptionChange.event;
            this._onKeyDown = this._register(new event_1.Emitter());
            this.onKeyDown = this._onKeyDown.event;
            this._onMouseDown = this._register(new event_1.Emitter());
            this.onMouseDown = this._onMouseDown.event;
            this._onInput = this._register(new event_1.Emitter());
            this.onInput = this._onInput.event;
            this._onKeyUp = this._register(new event_1.Emitter());
            this.onKeyUp = this._onKeyUp.event;
            this._onPreserveCaseKeyDown = this._register(new event_1.Emitter());
            this.onPreserveCaseKeyDown = this._onPreserveCaseKeyDown.event;
            this._lastHighlightFindOptions = 0;
            this.contextViewProvider = contextViewProvider;
            this.placeholder = options.placeholder || '';
            this.validation = options.validation;
            this.label = options.label || NLS_DEFAULT_LABEL;
            const appendPreserveCaseLabel = options.appendPreserveCaseLabel || '';
            const history = options.history || [];
            const flexibleHeight = !!options.flexibleHeight;
            const flexibleWidth = !!options.flexibleWidth;
            const flexibleMaxHeight = options.flexibleMaxHeight;
            this.domNode = document.createElement('div');
            this.domNode.classList.add('monaco-findInput');
            this.inputBox = this._register(new inputBox_1.HistoryInputBox(this.domNode, this.contextViewProvider, {
                ariaLabel: this.label || '',
                placeholder: this.placeholder || '',
                validationOptions: {
                    validation: this.validation
                },
                history,
                showHistoryHint: options.showHistoryHint,
                flexibleHeight,
                flexibleWidth,
                flexibleMaxHeight,
                inputBoxStyles: options.inputBoxStyles
            }));
            this.preserveCase = this._register(new PreserveCaseToggle({
                appendTitle: appendPreserveCaseLabel,
                isChecked: false,
                ...options.toggleStyles
            }));
            this._register(this.preserveCase.onChange(viaKeyboard => {
                this._onDidOptionChange.fire(viaKeyboard);
                if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
                    this.inputBox.focus();
                }
                this.validate();
            }));
            this._register(this.preserveCase.onKeyDown(e => {
                this._onPreserveCaseKeyDown.fire(e);
            }));
            if (this._showOptionButtons) {
                this.cachedOptionsWidth = this.preserveCase.width();
            }
            else {
                this.cachedOptionsWidth = 0;
            }
            // Arrow-Key support to navigate between options
            const indexes = [this.preserveCase.domNode];
            this.onkeydown(this.domNode, (event) => {
                if (event.equals(15 /* KeyCode.LeftArrow */) || event.equals(17 /* KeyCode.RightArrow */) || event.equals(9 /* KeyCode.Escape */)) {
                    const index = indexes.indexOf(this.domNode.ownerDocument.activeElement);
                    if (index >= 0) {
                        let newIndex = -1;
                        if (event.equals(17 /* KeyCode.RightArrow */)) {
                            newIndex = (index + 1) % indexes.length;
                        }
                        else if (event.equals(15 /* KeyCode.LeftArrow */)) {
                            if (index === 0) {
                                newIndex = indexes.length - 1;
                            }
                            else {
                                newIndex = index - 1;
                            }
                        }
                        if (event.equals(9 /* KeyCode.Escape */)) {
                            indexes[index].blur();
                            this.inputBox.focus();
                        }
                        else if (newIndex >= 0) {
                            indexes[newIndex].focus();
                        }
                        dom.EventHelper.stop(event, true);
                    }
                }
            });
            const controls = document.createElement('div');
            controls.className = 'controls';
            controls.style.display = this._showOptionButtons ? 'block' : 'none';
            controls.appendChild(this.preserveCase.domNode);
            this.domNode.appendChild(controls);
            parent?.appendChild(this.domNode);
            this.onkeydown(this.inputBox.inputElement, (e) => this._onKeyDown.fire(e));
            this.onkeyup(this.inputBox.inputElement, (e) => this._onKeyUp.fire(e));
            this.oninput(this.inputBox.inputElement, (e) => this._onInput.fire());
            this.onmousedown(this.inputBox.inputElement, (e) => this._onMouseDown.fire(e));
        }
        enable() {
            this.domNode.classList.remove('disabled');
            this.inputBox.enable();
            this.preserveCase.enable();
        }
        disable() {
            this.domNode.classList.add('disabled');
            this.inputBox.disable();
            this.preserveCase.disable();
        }
        setFocusInputOnOptionClick(value) {
            this.fixFocusOnOptionClickEnabled = value;
        }
        setEnabled(enabled) {
            if (enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        }
        clear() {
            this.clearValidation();
            this.setValue('');
            this.focus();
        }
        getValue() {
            return this.inputBox.value;
        }
        setValue(value) {
            if (this.inputBox.value !== value) {
                this.inputBox.value = value;
            }
        }
        onSearchSubmit() {
            this.inputBox.addToHistory();
        }
        applyStyles() {
        }
        select() {
            this.inputBox.select();
        }
        focus() {
            this.inputBox.focus();
        }
        getPreserveCase() {
            return this.preserveCase.checked;
        }
        setPreserveCase(value) {
            this.preserveCase.checked = value;
        }
        focusOnPreserve() {
            this.preserveCase.focus();
        }
        highlightFindOptions() {
            this.domNode.classList.remove('highlight-' + (this._lastHighlightFindOptions));
            this._lastHighlightFindOptions = 1 - this._lastHighlightFindOptions;
            this.domNode.classList.add('highlight-' + (this._lastHighlightFindOptions));
        }
        validate() {
            this.inputBox?.validate();
        }
        showMessage(message) {
            this.inputBox?.showMessage(message);
        }
        clearMessage() {
            this.inputBox?.hideMessage();
        }
        clearValidation() {
            this.inputBox?.hideMessage();
        }
        set width(newWidth) {
            this.inputBox.paddingRight = this.cachedOptionsWidth;
            this.domNode.style.width = newWidth + 'px';
        }
        dispose() {
            super.dispose();
        }
    }
    exports.ReplaceInput = ReplaceInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZUlucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvZmluZGlucHV0L3JlcGxhY2VJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQ2hHLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEUsTUFBTSx1QkFBdUIsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBRTFGLE1BQU0sa0JBQW1CLFNBQVEsZUFBTTtRQUN0QyxZQUFZLElBQTBCO1lBQ3JDLEtBQUssQ0FBQztnQkFDTCxxQ0FBcUM7Z0JBQ3JDLElBQUksRUFBRSxrQkFBTyxDQUFDLFlBQVk7Z0JBQzFCLEtBQUssRUFBRSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsV0FBVztnQkFDakQsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6Qix1QkFBdUIsRUFBRSxJQUFJLENBQUMsdUJBQXVCO2dCQUNyRCwyQkFBMkIsRUFBRSxJQUFJLENBQUMsMkJBQTJCO2dCQUM3RCwyQkFBMkIsRUFBRSxJQUFJLENBQUMsMkJBQTJCO2FBQzdELENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQUVELE1BQWEsWUFBYSxTQUFRLGVBQU07aUJBRXZCLGtCQUFhLEdBQVcsY0FBYyxBQUF6QixDQUEwQjtRQStCdkQsWUFBWSxNQUEwQixFQUFFLG1CQUFxRCxFQUFtQixrQkFBMkIsRUFBRSxPQUE2QjtZQUN6SyxLQUFLLEVBQUUsQ0FBQztZQUR1Ryx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVM7WUF6Qm5JLGlDQUE0QixHQUFHLElBQUksQ0FBQztZQUdwQyx1QkFBa0IsR0FBVyxDQUFDLENBQUM7WUFJdEIsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVyxDQUFDLENBQUM7WUFDN0Qsc0JBQWlCLEdBQXNDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7WUFFcEYsZUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWtCLENBQUMsQ0FBQztZQUM1RCxjQUFTLEdBQTBCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBRXhELGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7WUFDM0QsZ0JBQVcsR0FBdUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFFekQsYUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2hELFlBQU8sR0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFFMUMsYUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWtCLENBQUMsQ0FBQztZQUMxRCxZQUFPLEdBQTBCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBRTdELDJCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWtCLENBQUMsQ0FBQztZQUMvRCwwQkFBcUIsR0FBMEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQXNLekYsOEJBQXlCLEdBQVcsQ0FBQyxDQUFDO1lBbEs3QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7WUFDL0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDckMsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLGlCQUFpQixDQUFDO1lBRWhELE1BQU0sdUJBQXVCLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQztZQUN0RSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztZQUN0QyxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztZQUNoRCxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztZQUM5QyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztZQUVwRCxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMEJBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFDMUYsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDM0IsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLElBQUksRUFBRTtnQkFDbkMsaUJBQWlCLEVBQUU7b0JBQ2xCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtpQkFDM0I7Z0JBQ0QsT0FBTztnQkFDUCxlQUFlLEVBQUUsT0FBTyxDQUFDLGVBQWU7Z0JBQ3hDLGNBQWM7Z0JBQ2QsYUFBYTtnQkFDYixpQkFBaUI7Z0JBQ2pCLGNBQWMsRUFBRSxPQUFPLENBQUMsY0FBYzthQUN0QyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGtCQUFrQixDQUFDO2dCQUN6RCxXQUFXLEVBQUUsdUJBQXVCO2dCQUNwQyxTQUFTLEVBQUUsS0FBSztnQkFDaEIsR0FBRyxPQUFPLENBQUMsWUFBWTthQUN2QixDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3ZELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7b0JBQ3ZELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM5QyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNyRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBRUQsZ0RBQWdEO1lBQ2hELE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFxQixFQUFFLEVBQUU7Z0JBQ3RELElBQUksS0FBSyxDQUFDLE1BQU0sNEJBQW1CLElBQUksS0FBSyxDQUFDLE1BQU0sNkJBQW9CLElBQUksS0FBSyxDQUFDLE1BQU0sd0JBQWdCLEVBQUUsQ0FBQztvQkFDekcsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBYyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDckYsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUM7d0JBQ2hCLElBQUksUUFBUSxHQUFXLENBQUMsQ0FBQyxDQUFDO3dCQUMxQixJQUFJLEtBQUssQ0FBQyxNQUFNLDZCQUFvQixFQUFFLENBQUM7NEJBQ3RDLFFBQVEsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUN6QyxDQUFDOzZCQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sNEJBQW1CLEVBQUUsQ0FBQzs0QkFDNUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0NBQ2pCLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs0QkFDL0IsQ0FBQztpQ0FBTSxDQUFDO2dDQUNQLFFBQVEsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDOzRCQUN0QixDQUFDO3dCQUNGLENBQUM7d0JBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSx3QkFBZ0IsRUFBRSxDQUFDOzRCQUNsQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQ3ZCLENBQUM7NkJBQU0sSUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUM7NEJBQzFCLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDM0IsQ0FBQzt3QkFFRCxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ25DLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1lBR0gsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxRQUFRLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztZQUNoQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3BFLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVoRCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVuQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVsQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUVNLE1BQU07WUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTSxPQUFPO1lBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU0sMEJBQTBCLENBQUMsS0FBYztZQUMvQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsS0FBSyxDQUFDO1FBQzNDLENBQUM7UUFFTSxVQUFVLENBQUMsT0FBZ0I7WUFDakMsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDYixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLENBQUM7UUFDRixDQUFDO1FBRU0sS0FBSztZQUNYLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFTSxRQUFRO1lBQ2QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM1QixDQUFDO1FBRU0sUUFBUSxDQUFDLEtBQWE7WUFDNUIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQzdCLENBQUM7UUFDRixDQUFDO1FBRU0sY0FBYztZQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFUyxXQUFXO1FBQ3JCLENBQUM7UUFFTSxNQUFNO1lBQ1osSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRU0sS0FBSztZQUNYLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUVNLGVBQWU7WUFDckIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQztRQUNsQyxDQUFDO1FBRU0sZUFBZSxDQUFDLEtBQWM7WUFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ25DLENBQUM7UUFFTSxlQUFlO1lBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUdNLG9CQUFvQjtZQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMseUJBQXlCLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQztZQUNwRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBRU0sUUFBUTtZQUNkLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVNLFdBQVcsQ0FBQyxPQUF3QjtZQUMxQyxJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRU0sWUFBWTtZQUNsQixJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFTyxlQUFlO1lBQ3RCLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVELElBQVcsS0FBSyxDQUFDLFFBQWdCO1lBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztZQUNyRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQztRQUM1QyxDQUFDO1FBRWUsT0FBTztZQUN0QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQzs7SUFuT0Ysb0NBb09DIn0=