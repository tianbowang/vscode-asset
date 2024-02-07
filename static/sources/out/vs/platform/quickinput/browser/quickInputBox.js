/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/findinput/findInput", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/css!./media/quickInput"], function (require, exports, dom, findInput_1, lifecycle_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputBox = void 0;
    const $ = dom.$;
    class QuickInputBox extends lifecycle_1.Disposable {
        constructor(parent, inputBoxStyles, toggleStyles) {
            super();
            this.parent = parent;
            this.onKeyDown = (handler) => {
                return dom.addStandardDisposableListener(this.findInput.inputBox.inputElement, dom.EventType.KEY_DOWN, handler);
            };
            this.onMouseDown = (handler) => {
                return dom.addStandardDisposableListener(this.findInput.inputBox.inputElement, dom.EventType.MOUSE_DOWN, handler);
            };
            this.onDidChange = (handler) => {
                return this.findInput.onDidChange(handler);
            };
            this.container = dom.append(this.parent, $('.quick-input-box'));
            this.findInput = this._register(new findInput_1.FindInput(this.container, undefined, { label: '', inputBoxStyles, toggleStyles }));
            const input = this.findInput.inputBox.inputElement;
            input.role = 'combobox';
            input.ariaHasPopup = 'menu';
            input.ariaAutoComplete = 'list';
            input.ariaExpanded = 'true';
        }
        get value() {
            return this.findInput.getValue();
        }
        set value(value) {
            this.findInput.setValue(value);
        }
        select(range = null) {
            this.findInput.inputBox.select(range);
        }
        isSelectionAtEnd() {
            return this.findInput.inputBox.isSelectionAtEnd();
        }
        setPlaceholder(placeholder) {
            this.findInput.inputBox.setPlaceHolder(placeholder);
        }
        get placeholder() {
            return this.findInput.inputBox.inputElement.getAttribute('placeholder') || '';
        }
        set placeholder(placeholder) {
            this.findInput.inputBox.setPlaceHolder(placeholder);
        }
        get password() {
            return this.findInput.inputBox.inputElement.type === 'password';
        }
        set password(password) {
            this.findInput.inputBox.inputElement.type = password ? 'password' : 'text';
        }
        set enabled(enabled) {
            // We can't disable the input box because it is still used for
            // navigating the list. Instead, we disable the list and the OK
            // so that nothing can be selected.
            // TODO: should this be what we do for all find inputs? Or maybe some _other_ API
            // on findInput to change it to readonly?
            this.findInput.inputBox.inputElement.toggleAttribute('readonly', !enabled);
            // TODO: styles of the quick pick need to be moved to the CSS instead of being in line
            // so things like this can be done in CSS
            // this.findInput.inputBox.inputElement.classList.toggle('disabled', !enabled);
        }
        set toggles(toggles) {
            this.findInput.setAdditionalToggles(toggles);
        }
        hasFocus() {
            return this.findInput.inputBox.hasFocus();
        }
        setAttribute(name, value) {
            this.findInput.inputBox.inputElement.setAttribute(name, value);
        }
        removeAttribute(name) {
            this.findInput.inputBox.inputElement.removeAttribute(name);
        }
        showDecoration(decoration) {
            if (decoration === severity_1.default.Ignore) {
                this.findInput.clearMessage();
            }
            else {
                this.findInput.showMessage({ type: decoration === severity_1.default.Info ? 1 /* MessageType.INFO */ : decoration === severity_1.default.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */, content: '' });
            }
        }
        stylesForType(decoration) {
            return this.findInput.inputBox.stylesForType(decoration === severity_1.default.Info ? 1 /* MessageType.INFO */ : decoration === severity_1.default.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */);
        }
        setFocus() {
            this.findInput.focus();
        }
        layout() {
            this.findInput.inputBox.layout();
        }
    }
    exports.QuickInputBox = QuickInputBox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dEJveC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcXVpY2tpbnB1dC9icm93c2VyL3F1aWNrSW5wdXRCb3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsTUFBYSxhQUFjLFNBQVEsc0JBQVU7UUFLNUMsWUFDUyxNQUFtQixFQUMzQixjQUErQixFQUMvQixZQUEyQjtZQUUzQixLQUFLLEVBQUUsQ0FBQztZQUpBLFdBQU0sR0FBTixNQUFNLENBQWE7WUFjNUIsY0FBUyxHQUFHLENBQUMsT0FBK0MsRUFBZSxFQUFFO2dCQUM1RSxPQUFPLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDakgsQ0FBQyxDQUFDO1lBRUYsZ0JBQVcsR0FBRyxDQUFDLE9BQTRDLEVBQWUsRUFBRTtnQkFDM0UsT0FBTyxHQUFHLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ25ILENBQUMsQ0FBQztZQUVGLGdCQUFXLEdBQUcsQ0FBQyxPQUFnQyxFQUFlLEVBQUU7Z0JBQy9ELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUMsQ0FBQyxDQUFDO1lBbkJELElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFD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