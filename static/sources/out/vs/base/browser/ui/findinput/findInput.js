/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/findinput/findInputToggles", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/nls", "vs/base/common/lifecycle", "vs/css!./findInput"], function (require, exports, dom, findInputToggles_1, inputBox_1, widget_1, event_1, nls, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FindInput = void 0;
    const NLS_DEFAULT_LABEL = nls.localize('defaultLabel', "input");
    class FindInput extends widget_1.Widget {
        static { this.OPTION_CHANGE = 'optionChange'; }
        constructor(parent, contextViewProvider, options) {
            super();
            this.fixFocusOnOptionClickEnabled = true;
            this.imeSessionInProgress = false;
            this.additionalTogglesDisposables = this._register(new lifecycle_1.MutableDisposable());
            this.additionalToggles = [];
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
            this._onCaseSensitiveKeyDown = this._register(new event_1.Emitter());
            this.onCaseSensitiveKeyDown = this._onCaseSensitiveKeyDown.event;
            this._onRegexKeyDown = this._register(new event_1.Emitter());
            this.onRegexKeyDown = this._onRegexKeyDown.event;
            this._lastHighlightFindOptions = 0;
            this.placeholder = options.placeholder || '';
            this.validation = options.validation;
            this.label = options.label || NLS_DEFAULT_LABEL;
            this.showCommonFindToggles = !!options.showCommonFindToggles;
            const appendCaseSensitiveLabel = options.appendCaseSensitiveLabel || '';
            const appendWholeWordsLabel = options.appendWholeWordsLabel || '';
            const appendRegexLabel = options.appendRegexLabel || '';
            const history = options.history || [];
            const flexibleHeight = !!options.flexibleHeight;
            const flexibleWidth = !!options.flexibleWidth;
            const flexibleMaxHeight = options.flexibleMaxHeight;
            this.domNode = document.createElement('div');
            this.domNode.classList.add('monaco-findInput');
            this.inputBox = this._register(new inputBox_1.HistoryInputBox(this.domNode, contextViewProvider, {
                placeholder: this.placeholder || '',
                ariaLabel: this.label || '',
                validationOptions: {
                    validation: this.validation
                },
                history,
                showHistoryHint: options.showHistoryHint,
                flexibleHeight,
                flexibleWidth,
                flexibleMaxHeight,
                inputBoxStyles: options.inputBoxStyles,
            }));
            if (this.showCommonFindToggles) {
                this.regex = this._register(new findInputToggles_1.RegexToggle({
                    appendTitle: appendRegexLabel,
                    isChecked: false,
                    ...options.toggleStyles
                }));
                this._register(this.regex.onChange(viaKeyboard => {
                    this._onDidOptionChange.fire(viaKeyboard);
                    if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
                        this.inputBox.focus();
                    }
                    this.validate();
                }));
                this._register(this.regex.onKeyDown(e => {
                    this._onRegexKeyDown.fire(e);
                }));
                this.wholeWords = this._register(new findInputToggles_1.WholeWordsToggle({
                    appendTitle: appendWholeWordsLabel,
                    isChecked: false,
                    ...options.toggleStyles
                }));
                this._register(this.wholeWords.onChange(viaKeyboard => {
                    this._onDidOptionChange.fire(viaKeyboard);
                    if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
                        this.inputBox.focus();
                    }
                    this.validate();
                }));
                this.caseSensitive = this._register(new findInputToggles_1.CaseSensitiveToggle({
                    appendTitle: appendCaseSensitiveLabel,
                    isChecked: false,
                    ...options.toggleStyles
                }));
                this._register(this.caseSensitive.onChange(viaKeyboard => {
                    this._onDidOptionChange.fire(viaKeyboard);
                    if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
                        this.inputBox.focus();
                    }
                    this.validate();
                }));
                this._register(this.caseSensitive.onKeyDown(e => {
                    this._onCaseSensitiveKeyDown.fire(e);
                }));
                // Arrow-Key support to navigate between options
                const indexes = [this.caseSensitive.domNode, this.wholeWords.domNode, this.regex.domNode];
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
            }
            this.controls = document.createElement('div');
            this.controls.className = 'controls';
            this.controls.style.display = this.showCommonFindToggles ? '' : 'none';
            if (this.caseSensitive) {
                this.controls.append(this.caseSensitive.domNode);
            }
            if (this.wholeWords) {
                this.controls.appendChild(this.wholeWords.domNode);
            }
            if (this.regex) {
                this.controls.appendChild(this.regex.domNode);
            }
            this.setAdditionalToggles(options?.additionalToggles);
            if (this.controls) {
                this.domNode.appendChild(this.controls);
            }
            parent?.appendChild(this.domNode);
            this._register(dom.addDisposableListener(this.inputBox.inputElement, 'compositionstart', (e) => {
                this.imeSessionInProgress = true;
            }));
            this._register(dom.addDisposableListener(this.inputBox.inputElement, 'compositionend', (e) => {
                this.imeSessionInProgress = false;
                this._onInput.fire();
            }));
            this.onkeydown(this.inputBox.inputElement, (e) => this._onKeyDown.fire(e));
            this.onkeyup(this.inputBox.inputElement, (e) => this._onKeyUp.fire(e));
            this.oninput(this.inputBox.inputElement, (e) => this._onInput.fire());
            this.onmousedown(this.inputBox.inputElement, (e) => this._onMouseDown.fire(e));
        }
        get isImeSessionInProgress() {
            return this.imeSessionInProgress;
        }
        get onDidChange() {
            return this.inputBox.onDidChange;
        }
        layout(style) {
            this.inputBox.layout();
            this.updateInputBoxPadding(style.collapsedFindWidget);
        }
        enable() {
            this.domNode.classList.remove('disabled');
            this.inputBox.enable();
            this.regex?.enable();
            this.wholeWords?.enable();
            this.caseSensitive?.enable();
            for (const toggle of this.additionalToggles) {
                toggle.enable();
            }
        }
        disable() {
            this.domNode.classList.add('disabled');
            this.inputBox.disable();
            this.regex?.disable();
            this.wholeWords?.disable();
            this.caseSensitive?.disable();
            for (const toggle of this.additionalToggles) {
                toggle.disable();
            }
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
        setAdditionalToggles(toggles) {
            for (const currentToggle of this.additionalToggles) {
                currentToggle.domNode.remove();
            }
            this.additionalToggles = [];
            this.additionalTogglesDisposables.value = new lifecycle_1.DisposableStore();
            for (const toggle of toggles ?? []) {
                this.additionalTogglesDisposables.value.add(toggle);
                this.controls.appendChild(toggle.domNode);
                this.additionalTogglesDisposables.value.add(toggle.onChange(viaKeyboard => {
                    this._onDidOptionChange.fire(viaKeyboard);
                    if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
                        this.inputBox.focus();
                    }
                }));
                this.additionalToggles.push(toggle);
            }
            if (this.additionalToggles.length > 0) {
                this.controls.style.display = '';
            }
            this.updateInputBoxPadding();
        }
        updateInputBoxPadding(controlsHidden = false) {
            if (controlsHidden) {
                this.inputBox.paddingRight = 0;
            }
            else {
                this.inputBox.paddingRight =
                    ((this.caseSensitive?.width() ?? 0) + (this.wholeWords?.width() ?? 0) + (this.regex?.width() ?? 0))
                        + this.additionalToggles.reduce((r, t) => r + t.width(), 0);
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
        select() {
            this.inputBox.select();
        }
        focus() {
            this.inputBox.focus();
        }
        getCaseSensitive() {
            return this.caseSensitive?.checked ?? false;
        }
        setCaseSensitive(value) {
            if (this.caseSensitive) {
                this.caseSensitive.checked = value;
            }
        }
        getWholeWords() {
            return this.wholeWords?.checked ?? false;
        }
        setWholeWords(value) {
            if (this.wholeWords) {
                this.wholeWords.checked = value;
            }
        }
        getRegex() {
            return this.regex?.checked ?? false;
        }
        setRegex(value) {
            if (this.regex) {
                this.regex.checked = value;
                this.validate();
            }
        }
        focusOnCaseSensitive() {
            this.caseSensitive?.focus();
        }
        focusOnRegex() {
            this.regex?.focus();
        }
        highlightFindOptions() {
            this.domNode.classList.remove('highlight-' + (this._lastHighlightFindOptions));
            this._lastHighlightFindOptions = 1 - this._lastHighlightFindOptions;
            this.domNode.classList.add('highlight-' + (this._lastHighlightFindOptions));
        }
        validate() {
            this.inputBox.validate();
        }
        showMessage(message) {
            this.inputBox.showMessage(message);
        }
        clearMessage() {
            this.inputBox.hideMessage();
        }
        clearValidation() {
            this.inputBox.hideMessage();
        }
    }
    exports.FindInput = FindInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZElucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvZmluZGlucHV0L2ZpbmRJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQ2hHLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFaEUsTUFBYSxTQUFVLFNBQVEsZUFBTTtpQkFFcEIsa0JBQWEsR0FBVyxjQUFjLEFBQXpCLENBQTBCO1FBdUN2RCxZQUFZLE1BQTBCLEVBQUUsbUJBQXFELEVBQUUsT0FBMEI7WUFDeEgsS0FBSyxFQUFFLENBQUM7WUFsQ0QsaUNBQTRCLEdBQUcsSUFBSSxDQUFDO1lBQ3BDLHlCQUFvQixHQUFHLEtBQUssQ0FBQztZQUM3QixpQ0FBNEIsR0FBdUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFFLENBQUMsQ0FBQztZQU16RyxzQkFBaUIsR0FBYSxFQUFFLENBQUM7WUFJMUIsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVyxDQUFDLENBQUM7WUFDN0Qsc0JBQWlCLEdBQXNDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7WUFFcEYsZUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWtCLENBQUMsQ0FBQztZQUM1RCxjQUFTLEdBQTBCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBRXhELGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7WUFDM0QsZ0JBQVcsR0FBdUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFFekQsYUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMs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