/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/formattedTextRenderer", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/base/common/history", "vs/base/common/objects", "vs/nls", "vs/css!./inputBox"], function (require, exports, dom, event_1, formattedTextRenderer_1, actionbar_1, aria, scrollableElement_1, widget_1, event_2, history_1, objects_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HistoryInputBox = exports.InputBox = exports.unthemedInboxStyles = exports.MessageType = void 0;
    const $ = dom.$;
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["INFO"] = 1] = "INFO";
        MessageType[MessageType["WARNING"] = 2] = "WARNING";
        MessageType[MessageType["ERROR"] = 3] = "ERROR";
    })(MessageType || (exports.MessageType = MessageType = {}));
    exports.unthemedInboxStyles = {
        inputBackground: '#3C3C3C',
        inputForeground: '#CCCCCC',
        inputValidationInfoBorder: '#55AAFF',
        inputValidationInfoBackground: '#063B49',
        inputValidationWarningBorder: '#B89500',
        inputValidationWarningBackground: '#352A05',
        inputValidationErrorBorder: '#BE1100',
        inputValidationErrorBackground: '#5A1D1D',
        inputBorder: undefined,
        inputValidationErrorForeground: undefined,
        inputValidationInfoForeground: undefined,
        inputValidationWarningForeground: undefined
    };
    class InputBox extends widget_1.Widget {
        constructor(container, contextViewProvider, options) {
            super();
            this.state = 'idle';
            this.maxHeight = Number.POSITIVE_INFINITY;
            this._onDidChange = this._register(new event_2.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onDidHeightChange = this._register(new event_2.Emitter());
            this.onDidHeightChange = this._onDidHeightChange.event;
            this.contextViewProvider = contextViewProvider;
            this.options = options;
            this.message = null;
            this.placeholder = this.options.placeholder || '';
            this.tooltip = this.options.tooltip ?? (this.placeholder || '');
            this.ariaLabel = this.options.ariaLabel || '';
            if (this.options.validationOptions) {
                this.validation = this.options.validationOptions.validation;
            }
            this.element = dom.append(container, $('.monaco-inputbox.idle'));
            const tagName = this.options.flexibleHeight ? 'textarea' : 'input';
            const wrapper = dom.append(this.element, $('.ibwrapper'));
            this.input = dom.append(wrapper, $(tagName + '.input.empty'));
            this.input.setAttribute('autocorrect', 'off');
            this.input.setAttribute('autocapitalize', 'off');
            this.input.setAttribute('spellcheck', 'false');
            this.onfocus(this.input, () => this.element.classList.add('synthetic-focus'));
            this.onblur(this.input, () => this.element.classList.remove('synthetic-focus'));
            if (this.options.flexibleHeight) {
                this.maxHeight = typeof this.options.flexibleMaxHeight === 'number' ? this.options.flexibleMaxHeight : Number.POSITIVE_INFINITY;
                this.mirror = dom.append(wrapper, $('div.mirror'));
                this.mirror.innerText = '\u00a0';
                this.scrollableElement = new scrollableElement_1.ScrollableElement(this.element, { vertical: 1 /* ScrollbarVisibility.Auto */ });
                if (this.options.flexibleWidth) {
                    this.input.setAttribute('wrap', 'off');
                    this.mirror.style.whiteSpace = 'pre';
                    this.mirror.style.wordWrap = 'initial';
                }
                dom.append(container, this.scrollableElement.getDomNode());
                this._register(this.scrollableElement);
                // from ScrollableElement to DOM
                this._register(this.scrollableElement.onScroll(e => this.input.scrollTop = e.scrollTop));
                const onSelectionChange = this._register(new event_1.DomEmitter(container.ownerDocument, 'selectionchange'));
                const onAnchoredSelectionChange = event_2.Event.filter(onSelectionChange.event, () => {
                    const selection = container.ownerDocument.getSelection();
                    return selection?.anchorNode === wrapper;
                });
                // from DOM to ScrollableElement
                this._register(onAnchoredSelectionChange(this.updateScrollDimensions, this));
                this._register(this.onDidHeightChange(this.updateScrollDimensions, this));
            }
            else {
                this.input.type = this.options.type || 'text';
                this.input.setAttribute('wrap', 'off');
            }
            if (this.ariaLabel) {
                this.input.setAttribute('aria-label', this.ariaLabel);
            }
            if (this.placeholder && !this.options.showPlaceholderOnFocus) {
                this.setPlaceHolder(this.placeholder);
            }
            if (this.tooltip) {
                this.setTooltip(this.tooltip);
            }
            this.oninput(this.input, () => this.onValueChange());
            this.onblur(this.input, () => this.onBlur());
            this.onfocus(this.input, () => this.onFocus());
            this._register(this.ignoreGesture(this.input));
            setTimeout(() => this.updateMirror(), 0);
            // Support actions
            if (this.options.actions) {
                this.actionbar = this._register(new actionbar_1.ActionBar(this.element));
                this.actionbar.push(this.options.actions, { icon: true, label: false });
            }
            this.applyStyles();
        }
        onBlur() {
            this._hideMessage();
            if (this.options.showPlaceholderOnFocus) {
                this.input.setAttribute('placeholder', '');
            }
        }
        onFocus() {
            this._showMessage();
            if (this.options.showPlaceholderOnFocus) {
                this.input.setAttribute('placeholder', this.placeholder || '');
            }
        }
        setPlaceHolder(placeHolder) {
            this.placeholder = placeHolder;
            this.input.setAttribute('placeholder', placeHolder);
        }
        setTooltip(tooltip) {
            this.tooltip = tooltip;
            this.input.title = tooltip;
        }
        setAriaLabel(label) {
            this.ariaLabel = label;
            if (label) {
                this.input.setAttribute('aria-label', this.ariaLabel);
            }
            else {
                this.input.removeAttribute('aria-label');
            }
        }
        getAriaLabel() {
            return this.ariaLabel;
        }
        get mirrorElement() {
            return this.mirror;
        }
        get inputElement() {
            return this.input;
        }
        get value() {
            return this.input.value;
        }
        set value(newValue) {
            if (this.input.value !== newValue) {
                this.input.value = newValue;
                this.onValueChange();
            }
        }
        get step() {
            return this.input.step;
        }
        set step(newValue) {
            this.input.step = newValue;
        }
        get height() {
            return typeof this.cachedHeight === 'number' ? this.cachedHeight : dom.getTotalHeight(this.element);
        }
        focus() {
            this.input.focus();
        }
        blur() {
            this.input.blur();
        }
        hasFocus() {
            return dom.isActiveElement(this.input);
        }
        select(range = null) {
            this.input.select();
            if (range) {
                this.input.setSelectionRange(range.start, range.end);
                if (range.end === this.input.value.length) {
                    this.input.scrollLeft = this.input.scrollWidth;
                }
            }
        }
        isSelectionAtEnd() {
            return this.input.selectionEnd === this.input.value.length && this.input.selectionStart === this.input.selectionEnd;
        }
        enable() {
            this.input.removeAttribute('disabled');
        }
        disable() {
            this.blur();
            this.input.disabled = true;
            this._hideMessage();
        }
        setEnabled(enabled) {
            if (enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        }
        get width() {
            return dom.getTotalWidth(this.input);
        }
        set width(width) {
            if (this.options.flexibleHeight && this.options.flexibleWidth) {
                // textarea with horizontal scrolling
                let horizontalPadding = 0;
                if (this.mirror) {
                    const paddingLeft = parseFloat(this.mirror.style.paddingLeft || '') || 0;
                    const paddingRight = parseFloat(this.mirror.style.paddingRight || '') || 0;
                    horizontalPadding = paddingLeft + paddingRight;
                }
                this.input.style.width = (width - horizontalPadding) + 'px';
            }
            else {
                this.input.style.width = width + 'px';
            }
            if (this.mirror) {
                this.mirror.style.width = width + 'px';
            }
        }
        set paddingRight(paddingRight) {
            // Set width to avoid hint text overlapping buttons
            this.input.style.width = `calc(100% - ${paddingRight}px)`;
            if (this.mirror) {
                this.mirror.style.paddingRight = paddingRight + 'px';
            }
        }
        updateScrollDimensions() {
            if (typeof this.cachedContentHeight !== 'number' || typeof this.cachedHeight !== 'number' || !this.scrollableElement) {
                return;
            }
            const scrollHeight = this.cachedContentHeight;
            const height = this.cachedHeight;
            const scrollTop = this.input.scrollTop;
            this.scrollableElement.setScrollDimensions({ scrollHeight, height });
            this.scrollableElement.setScrollPosition({ scrollTop });
        }
        showMessage(message, force) {
            if (this.state === 'open' && (0, objects_1.equals)(this.message, message)) {
                // Already showing
                return;
            }
            this.message = message;
            this.element.classList.remove('idle');
            this.element.classList.remove('info');
            this.element.classList.remove('warning');
            this.element.classList.remove('error');
            this.element.classList.add(this.classForType(message.type));
            const styles = this.stylesForType(this.message.type);
            this.element.style.border = `1px solid ${dom.asCssValueWithDefault(styles.border, 'transparent')}`;
            if (this.message.content && (this.hasFocus() || force)) {
                this._showMessage();
            }
        }
        hideMessage() {
            this.message = null;
            this.element.classList.remove('info');
            this.element.classList.remove('warning');
            this.element.classList.remove('error');
            this.element.classList.add('idle');
            this._hideMessage();
            this.applyStyles();
        }
        isInputValid() {
            return !!this.validation && !this.validation(this.value);
        }
        validate() {
            let errorMsg = null;
            if (this.validation) {
                errorMsg = this.validation(this.value);
                if (errorMsg) {
                    this.inputElement.setAttribute('aria-invalid', 'true');
                    this.showMessage(errorMsg);
                }
                else if (this.inputElement.hasAttribute('aria-invalid')) {
                    this.inputElement.removeAttribute('aria-invalid');
                    this.hideMessage();
                }
            }
            return errorMsg?.type;
        }
        stylesForType(type) {
            const styles = this.options.inputBoxStyles;
            switch (type) {
                case 1 /* MessageType.INFO */: return { border: styles.inputValidationInfoBorder, background: styles.inputValidationInfoBackground, foreground: styles.inputValidationInfoForeground };
                case 2 /* MessageType.WARNING */: return { border: styles.inputValidationWarningBorder, background: styles.inputValidationWarningBackground, foreground: styles.inputValidationWarningForeground };
                default: return { border: styles.inputValidationErrorBorder, background: styles.inputValidationErrorBackground, foreground: styles.inputValidationErrorForeground };
            }
        }
        classForType(type) {
            switch (type) {
                case 1 /* MessageType.INFO */: return 'info';
                case 2 /* MessageType.WARNING */: return 'warning';
                default: return 'error';
            }
        }
        _showMessage() {
            if (!this.contextViewProvider || !this.message) {
                return;
            }
            let div;
            const layout = () => div.style.width = dom.getTotalWidth(this.element) + 'px';
            this.contextViewProvider.showContextView({
                getAnchor: () => this.element,
                anchorAlignment: 1 /* AnchorAlignment.RIGHT */,
                render: (container) => {
                    if (!this.message) {
                        return null;
                    }
                    div = dom.append(container, $('.monaco-inputbox-container'));
                    layout();
                    const renderOptions = {
                        inline: true,
                        className: 'monaco-inputbox-message'
                    };
                    const spanElement = (this.message.formatContent
                        ? (0, formattedTextRenderer_1.renderFormattedText)(this.message.content, renderOptions)
                        : (0, formattedTextRenderer_1.renderText)(this.message.content, renderOptions));
                    spanElement.classList.add(this.classForType(this.message.type));
                    const styles = this.stylesForType(this.message.type);
                    spanElement.style.backgroundColor = styles.background ?? '';
                    spanElement.style.color = styles.foreground ?? '';
                    spanElement.style.border = styles.border ? `1px solid ${styles.border}` : '';
                    dom.append(div, spanElement);
                    return null;
                },
                onHide: () => {
                    this.state = 'closed';
                },
                layout: layout
            });
            // ARIA Support
            let alertText;
            if (this.message.type === 3 /* MessageType.ERROR */) {
                alertText = nls.localize('alertErrorMessage', "Error: {0}", this.message.content);
            }
            else if (this.message.type === 2 /* MessageType.WARNING */) {
                alertText = nls.localize('alertWarningMessage', "Warning: {0}", this.message.content);
            }
            else {
                alertText = nls.localize('alertInfoMessage', "Info: {0}", this.message.content);
            }
            aria.alert(alertText);
            this.state = 'open';
        }
        _hideMessage() {
            if (!this.contextViewProvider) {
                return;
            }
            if (this.state === 'open') {
                this.contextViewProvider.hideContextView();
            }
            this.state = 'idle';
        }
        onValueChange() {
            this._onDidChange.fire(this.value);
            this.validate();
            this.updateMirror();
            this.input.classList.toggle('empty', !this.value);
            if (this.state === 'open' && this.contextViewProvider) {
                this.contextViewProvider.layout();
            }
        }
        updateMirror() {
            if (!this.mirror) {
                return;
            }
            const value = this.value;
            const lastCharCode = value.charCodeAt(value.length - 1);
            const suffix = lastCharCode === 10 ? ' ' : '';
            const mirrorTextContent = (value + suffix)
                .replace(/\u000c/g, ''); // Don't measure with the form feed character, which messes up sizing
            if (mirrorTextContent) {
                this.mirror.textContent = value + suffix;
            }
            else {
                this.mirror.innerText = '\u00a0';
            }
            this.layout();
        }
        applyStyles() {
            const styles = this.options.inputBoxStyles;
            const background = styles.inputBackground ?? '';
            const foreground = styles.inputForeground ?? '';
            const border = styles.inputBorder ?? '';
            this.element.style.backgroundColor = background;
            this.element.style.color = foreground;
            this.input.style.backgroundColor = 'inherit';
            this.input.style.color = foreground;
            // there's always a border, even if the color is not set.
            this.element.style.border = `1px solid ${dom.asCssValueWithDefault(border, 'transparent')}`;
        }
        layout() {
            if (!this.mirror) {
                return;
            }
            const previousHeight = this.cachedContentHeight;
            this.cachedContentHeight = dom.getTotalHeight(this.mirror);
            if (previousHeight !== this.cachedContentHeight) {
                this.cachedHeight = Math.min(this.cachedContentHeight, this.maxHeight);
                this.input.style.height = this.cachedHeight + 'px';
                this._onDidHeightChange.fire(this.cachedContentHeight);
            }
        }
        insertAtCursor(text) {
            const inputElement = this.inputElement;
            const start = inputElement.selectionStart;
            const end = inputElement.selectionEnd;
            const content = inputElement.value;
            if (start !== null && end !== null) {
                this.value = content.substr(0, start) + text + content.substr(end);
                inputElement.setSelectionRange(start + 1, start + 1);
                this.layout();
            }
        }
        dispose() {
            this._hideMessage();
            this.message = null;
            this.actionbar?.dispose();
            super.dispose();
        }
    }
    exports.InputBox = InputBox;
    class HistoryInputBox extends InputBox {
        constructor(container, contextViewProvider, options) {
            const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS = nls.localize({
                key: 'history.inputbox.hint.suffix.noparens',
                comment: ['Text is the suffix of an input field placeholder coming after the action the input field performs, this will be used when the input field ends in a closing parenthesis ")", for example "Filter (e.g. text, !exclude)". The character inserted into the final string is \u21C5 to represent the up and down arrow keys.']
            }, ' or {0} for history', `\u21C5`);
            const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS = nls.localize({
                key: 'history.inputbox.hint.suffix.inparens',
                comment: ['Text is the suffix of an input field placeholder coming after the action the input field performs, this will be used when the input field does NOT end in a closing parenthesis (eg. "Find"). The character inserted into the final string is \u21C5 to represent the up and down arrow keys.']
            }, ' ({0} for history)', `\u21C5`);
            super(container, contextViewProvider, options);
            this._onDidFocus = this._register(new event_2.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_2.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this.history = new history_1.HistoryNavigator(options.history, 100);
            // Function to append the history suffix to the placeholder if necessary
            const addSuffix = () => {
                if (options.showHistoryHint && options.showHistoryHint() && !this.placeholder.endsWith(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS) && !this.placeholder.endsWith(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS) && this.history.getHistory().length) {
                    const suffix = this.placeholder.endsWith(')') ? NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS : NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS;
                    const suffixedPlaceholder = this.placeholder + suffix;
                    if (options.showPlaceholderOnFocus && !dom.isActiveElement(this.input)) {
                        this.placeholder = suffixedPlaceholder;
                    }
                    else {
                        this.setPlaceHolder(suffixedPlaceholder);
                    }
                }
            };
            // Spot the change to the textarea class attribute which occurs when it changes between non-empty and empty,
            // and add the history suffix to the placeholder if not yet present
            this.observer = new MutationObserver((mutationList, observer) => {
                mutationList.forEach((mutation) => {
                    if (!mutation.target.textContent) {
                        addSuffix();
                    }
                });
            });
            this.observer.observe(this.input, { attributeFilter: ['class'] });
            this.onfocus(this.input, () => addSuffix());
            this.onblur(this.input, () => {
                const resetPlaceholder = (historyHint) => {
                    if (!this.placeholder.endsWith(historyHint)) {
                        return false;
                    }
                    else {
                        const revertedPlaceholder = this.placeholder.slice(0, this.placeholder.length - historyHint.length);
                        if (options.showPlaceholderOnFocus) {
                            this.placeholder = revertedPlaceholder;
                        }
                        else {
                            this.setPlaceHolder(revertedPlaceholder);
                        }
                        return true;
                    }
                };
                if (!resetPlaceholder(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS)) {
                    resetPlaceholder(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS);
                }
            });
        }
        dispose() {
            super.dispose();
            if (this.observer) {
                this.observer.disconnect();
                this.observer = undefined;
            }
        }
        addToHistory(always) {
            if (this.value && (always || this.value !== this.getCurrentValue())) {
                this.history.add(this.value);
            }
        }
        prependHistory(restoredHistory) {
            const newHistory = this.getHistory();
            this.clearHistory();
            restoredHistory.forEach((item) => {
                this.history.add(item);
            });
            newHistory.forEach(item => {
                this.history.add(item);
            });
        }
        getHistory() {
            return this.history.getHistory();
        }
        isAtFirstInHistory() {
            return this.history.isFirst();
        }
        isAtLastInHistory() {
            return this.history.isLast();
        }
        isNowhereInHistory() {
            return this.history.isNowhere();
        }
        showNextValue() {
            if (!this.history.has(this.value)) {
                this.addToHistory();
            }
            let next = this.getNextValue();
            if (next) {
                next = next === this.value ? this.getNextValue() : next;
            }
            this.value = next ?? '';
            aria.status(this.value ? this.value : nls.localize('clearedInput', "Cleared Input"));
        }
        showPreviousValue() {
            if (!this.history.has(this.value)) {
                this.addToHistory();
            }
            let previous = this.getPreviousValue();
            if (previous) {
                previous = previous === this.value ? this.getPreviousValue() : previous;
            }
            if (previous) {
                this.value = previous;
                aria.status(this.value);
            }
        }
        clearHistory() {
            this.history.clear();
        }
        setPlaceHolder(placeHolder) {
            super.setPlaceHolder(placeHolder);
            this.setTooltip(placeHolder);
        }
        onBlur() {
            super.onBlur();
            this._onDidBlur.fire();
        }
        onFocus() {
            super.onFocus();
            this._onDidFocus.fire();
        }
        getCurrentValue() {
            let currentValue = this.history.current();
            if (!currentValue) {
                currentValue = this.history.last();
                this.history.next();
            }
            return currentValue;
        }
        getPreviousValue() {
            return this.history.previous() || this.history.first();
        }
        getNextValue() {
            return this.history.next();
        }
    }
    exports.HistoryInputBox = HistoryInputBox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRCb3guanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9pbnB1dGJveC9pbnB1dEJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUE2Q2hCLElBQWtCLFdBSWpCO0lBSkQsV0FBa0IsV0FBVztRQUM1Qiw2Q0FBUSxDQUFBO1FBQ1IsbURBQVcsQ0FBQTtRQUNYLCtDQUFTLENBQUE7SUFDVixDQUFDLEVBSmlCLFdBQVcsMkJBQVgsV0FBVyxRQUk1QjtJQU9ZLFFBQUEsbUJBQW1CLEdBQW9CO1FBQ25ELGVBQWUsRUFBRSxTQUFTO1FBQzFCLGVBQWUsRUFBRSxTQUFTO1FBQzFCLHlCQUF5QixFQUFFLFNBQVM7UUFDcEMsNkJBQTZCLEVBQUUsU0FBUztRQUN4Qyw0QkFBNEIsRUFBRSxTQUFTO1FBQ3ZDLGdDQUFnQyxFQUFFLFNBQVM7UUFDM0MsMEJBQTBCLEVBQUUsU0FBUztRQUNyQyw4QkFBOEIsRUFBRSxTQUFTO1FBQ3pDLFdBQVcsRUFBRSxTQUFTO1FBQ3RCLDhCQUE4QixFQUFFLFNBQVM7UUFDekMsNkJBQTZCLEVBQUUsU0FBUztRQUN4QyxnQ0FBZ0MsRUFBRSxTQUFTO0tBQzNDLENBQUM7SUFFRixNQUFhLFFBQVMsU0FBUSxlQUFNO1FBeUJuQyxZQUFZLFNBQXNCLEVBQUUsbUJBQXFELEVBQUUsT0FBc0I7WUFDaEgsS0FBSyxFQUFFLENBQUM7WUFmRCxVQUFLLEdBQStCLE1BQU0sQ0FBQztZQUszQyxjQUFTLEdBQVcsTUFBTSxDQUFDLGlCQUFpQixDQUFDO1lBRzdDLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVSxDQUFDLENBQUM7WUFDN0MsZ0JBQVcsR0FBa0IsSUFBSSxDQUFDLFlBQVks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