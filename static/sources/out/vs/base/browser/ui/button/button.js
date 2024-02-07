/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/dompurify/dompurify", "vs/base/browser/keyboardEvent", "vs/base/browser/markdownRenderer", "vs/base/browser/touch", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/color", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls", "vs/css!./button"], function (require, exports, dom_1, dompurify_1, keyboardEvent_1, markdownRenderer_1, touch_1, iconLabels_1, actions_1, codicons_1, color_1, event_1, htmlContent_1, lifecycle_1, themables_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ButtonBar = exports.ButtonWithDescription = exports.ButtonWithDropdown = exports.Button = exports.unthemedButtonStyles = void 0;
    exports.unthemedButtonStyles = {
        buttonBackground: '#0E639C',
        buttonHoverBackground: '#006BB3',
        buttonSeparator: color_1.Color.white.toString(),
        buttonForeground: color_1.Color.white.toString(),
        buttonBorder: undefined,
        buttonSecondaryBackground: undefined,
        buttonSecondaryForeground: undefined,
        buttonSecondaryHoverBackground: undefined
    };
    class Button extends lifecycle_1.Disposable {
        get onDidClick() { return this._onDidClick.event; }
        constructor(container, options) {
            super();
            this._label = '';
            this._onDidClick = this._register(new event_1.Emitter());
            this.options = options;
            this._element = document.createElement('a');
            this._element.classList.add('monaco-button');
            this._element.tabIndex = 0;
            this._element.setAttribute('role', 'button');
            this._element.classList.toggle('secondary', !!options.secondary);
            const background = options.secondary ? options.buttonSecondaryBackground : options.buttonBackground;
            const foreground = options.secondary ? options.buttonSecondaryForeground : options.buttonForeground;
            this._element.style.color = foreground || '';
            this._element.style.backgroundColor = background || '';
            if (options.supportShortLabel) {
                this._labelShortElement = document.createElement('div');
                this._labelShortElement.classList.add('monaco-button-label-short');
                this._element.appendChild(this._labelShortElement);
                this._labelElement = document.createElement('div');
                this._labelElement.classList.add('monaco-button-label');
                this._element.appendChild(this._labelElement);
                this._element.classList.add('monaco-text-button-with-short-label');
            }
            if (typeof options.ariaLabel === 'string') {
                this._element.setAttribute('aria-label', options.ariaLabel);
            }
            container.appendChild(this._element);
            this._register(touch_1.Gesture.addTarget(this._element));
            [dom_1.EventType.CLICK, touch_1.EventType.Tap].forEach(eventType => {
                this._register((0, dom_1.addDisposableListener)(this._element, eventType, e => {
                    if (!this.enabled) {
                        dom_1.EventHelper.stop(e);
                        return;
                    }
                    this._onDidClick.fire(e);
                }));
            });
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = false;
                if (this.enabled && (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */))) {
                    this._onDidClick.fire(e);
                    eventHandled = true;
                }
                else if (event.equals(9 /* KeyCode.Escape */)) {
                    this._element.blur();
                    eventHandled = true;
                }
                if (eventHandled) {
                    dom_1.EventHelper.stop(event, true);
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.MOUSE_OVER, e => {
                if (!this._element.classList.contains('disabled')) {
                    this.updateBackground(true);
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.MOUSE_OUT, e => {
                this.updateBackground(false); // restore standard styles
            }));
            // Also set hover background when button is focused for feedback
            this.focusTracker = this._register((0, dom_1.trackFocus)(this._element));
            this._register(this.focusTracker.onDidFocus(() => { if (this.enabled) {
                this.updateBackground(true);
            } }));
            this._register(this.focusTracker.onDidBlur(() => { if (this.enabled) {
                this.updateBackground(false);
            } }));
        }
        dispose() {
            super.dispose();
            this._element.remove();
        }
        getContentElements(content) {
            const elements = [];
            for (let segment of (0, iconLabels_1.renderLabelWithIcons)(content)) {
                if (typeof (segment) === 'string') {
                    segment = segment.trim();
                    // Ignore empty segment
                    if (segment === '') {
                        continue;
                    }
                    // Convert string segments to <span> nodes
                    const node = document.createElement('span');
                    node.textContent = segment;
                    elements.push(node);
                }
                else {
                    elements.push(segment);
                }
            }
            return elements;
        }
        updateBackground(hover) {
            let background;
            if (this.options.secondary) {
                background = hover ? this.options.buttonSecondaryHoverBackground : this.options.buttonSecondaryBackground;
            }
            else {
                background = hover ? this.options.buttonHoverBackground : this.options.buttonBackground;
            }
            if (background) {
                this._element.style.backgroundColor = background;
            }
        }
        get element() {
            return this._element;
        }
        set label(value) {
            if (this._label === value) {
                return;
            }
            if ((0, htmlContent_1.isMarkdownString)(this._label) && (0, htmlContent_1.isMarkdownString)(value) && (0, htmlContent_1.markdownStringEqual)(this._label, value)) {
                return;
            }
            this._element.classList.add('monaco-text-button');
            const labelElement = this.options.supportShortLabel ? this._labelElement : this._element;
            if ((0, htmlContent_1.isMarkdownString)(value)) {
                const rendered = (0, markdownRenderer_1.renderMarkdown)(value, { inline: true });
                rendered.dispose();
                // Don't include outer `<p>`
                const root = rendered.element.querySelector('p')?.innerHTML;
                if (root) {
                    // Only allow a very limited set of inline html tags
                    const sanitized = (0, dompurify_1.sanitize)(root, { ADD_TAGS: ['b', 'i', 'u', 'code', 'span'], ALLOWED_ATTR: ['class'], RETURN_TRUSTED_TYPE: true });
                    labelElement.innerHTML = sanitized;
                }
                else {
                    (0, dom_1.reset)(labelElement);
                }
            }
            else {
                if (this.options.supportIcons) {
                    (0, dom_1.reset)(labelElement, ...this.getContentElements(value));
                }
                else {
                    labelElement.textContent = value;
                }
            }
            if (typeof this.options.title === 'string') {
                this._element.title = this.options.title;
            }
            else if (this.options.title) {
                this._element.title = (0, markdownRenderer_1.renderStringAsPlaintext)(value);
            }
            if (typeof this.options.ariaLabel === 'string') {
                this._element.setAttribute('aria-label', this.options.ariaLabel);
            }
            else if (this.options.ariaLabel) {
                this._element.setAttribute('aria-label', this._element.title);
            }
            this._label = value;
        }
        get label() {
            return this._label;
        }
        set labelShort(value) {
            if (!this.options.supportShortLabel || !this._labelShortElement) {
                return;
            }
            if (this.options.supportIcons) {
                (0, dom_1.reset)(this._labelShortElement, ...this.getContentElements(value));
            }
            else {
                this._labelShortElement.textContent = value;
            }
        }
        set icon(icon) {
            this._element.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon));
        }
        set enabled(value) {
            if (value) {
                this._element.classList.remove('disabled');
                this._element.setAttribute('aria-disabled', String(false));
                this._element.tabIndex = 0;
            }
            else {
                this._element.classList.add('disabled');
                this._element.setAttribute('aria-disabled', String(true));
            }
        }
        get enabled() {
            return !this._element.classList.contains('disabled');
        }
        focus() {
            this._element.focus();
        }
        hasFocus() {
            return (0, dom_1.isActiveElement)(this._element);
        }
    }
    exports.Button = Button;
    class ButtonWithDropdown extends lifecycle_1.Disposable {
        constructor(container, options) {
            super();
            this._onDidClick = this._register(new event_1.Emitter());
            this.onDidClick = this._onDidClick.event;
            this.element = document.createElement('div');
            this.element.classList.add('monaco-button-dropdown');
            container.appendChild(this.element);
            this.button = this._register(new Button(this.element, options));
            this._register(this.button.onDidClick(e => this._onDidClick.fire(e)));
            this.action = this._register(new actions_1.Action('primaryAction', (0, markdownRenderer_1.renderStringAsPlaintext)(this.button.label), undefined, true, async () => this._onDidClick.fire(undefined)));
            this.separatorContainer = document.createElement('div');
            this.separatorContainer.classList.add('monaco-button-dropdown-separator');
            this.separator = document.createElement('div');
            this.separatorContainer.appendChild(this.separator);
            this.element.appendChild(this.separatorContainer);
            // Separator styles
            const border = options.buttonBorder;
            if (border) {
                this.separatorContainer.style.borderTop = '1px solid ' + border;
                this.separatorContainer.style.borderBottom = '1px solid ' + border;
            }
            const buttonBackground = options.secondary ? options.buttonSecondaryBackground : options.buttonBackground;
            this.separatorContainer.style.backgroundColor = buttonBackground ?? '';
            this.separator.style.backgroundColor = options.buttonSeparator ?? '';
            this.dropdownButton = this._register(new Button(this.element, { ...options, title: false, supportIcons: true }));
            this.dropdownButton.element.title = (0, nls_1.localize)("button dropdown more actions", 'More Actions...');
            this.dropdownButton.element.setAttribute('aria-haspopup', 'true');
            this.dropdownButton.element.setAttribute('aria-expanded', 'false');
            this.dropdownButton.element.classList.add('monaco-dropdown-button');
            this.dropdownButton.icon = codicons_1.Codicon.dropDownButton;
            this._register(this.dropdownButton.onDidClick(e => {
                options.contextMenuProvider.showContextMenu({
                    getAnchor: () => this.dropdownButton.element,
                    getActions: () => options.addPrimaryActionToDropdown === false ? [...options.actions] : [this.action, ...options.actions],
                    actionRunner: options.actionRunner,
                    onHide: () => this.dropdownButton.element.setAttribute('aria-expanded', 'false')
                });
                this.dropdownButton.element.setAttribute('aria-expanded', 'true');
            }));
        }
        dispose() {
            super.dispose();
            this.element.remove();
        }
        set label(value) {
            this.button.label = value;
            this.action.label = value;
        }
        set icon(icon) {
            this.button.icon = icon;
        }
        set enabled(enabled) {
            this.button.enabled = enabled;
            this.dropdownButton.enabled = enabled;
            this.element.classList.toggle('disabled', !enabled);
        }
        get enabled() {
            return this.button.enabled;
        }
        focus() {
            this.button.focus();
        }
        hasFocus() {
            return this.button.hasFocus() || this.dropdownButton.hasFocus();
        }
    }
    exports.ButtonWithDropdown = ButtonWithDropdown;
    class ButtonWithDescription {
        constructor(container, options) {
            this.options = options;
            this._element = document.createElement('div');
            this._element.classList.add('monaco-description-button');
            this._button = new Button(this._element, options);
            this._descriptionElement = document.createElement('div');
            this._descriptionElement.classList.add('monaco-button-description');
            this._element.appendChild(this._descriptionElement);
            container.appendChild(this._element);
        }
        get onDidClick() {
            return this._button.onDidClick;
        }
        get element() {
            return this._element;
        }
        set label(value) {
            this._button.label = value;
        }
        set icon(icon) {
            this._button.icon = icon;
        }
        get enabled() {
            return this._button.enabled;
        }
        set enabled(enabled) {
            this._button.enabled = enabled;
        }
        focus() {
            this._button.focus();
        }
        hasFocus() {
            return this._button.hasFocus();
        }
        dispose() {
            this._button.dispose();
        }
        set description(value) {
            if (this.options.supportIcons) {
                (0, dom_1.reset)(this._descriptionElement, ...(0, iconLabels_1.renderLabelWithIcons)(value));
            }
            else {
                this._descriptionElement.textContent = value;
            }
        }
    }
    exports.ButtonWithDescription = ButtonWithDescription;
    class ButtonBar {
        constructor(container) {
            this.container = container;
            this._buttons = [];
            this._buttonStore = new lifecycle_1.DisposableStore();
        }
        dispose() {
            this._buttonStore.dispose();
        }
        get buttons() {
            return this._buttons;
        }
        clear() {
            this._buttonStore.clear();
            this._buttons.length = 0;
        }
        addButton(options) {
            const button = this._buttonStore.add(new Button(this.container, options));
            this.pushButton(button);
            return button;
        }
        addButtonWithDescription(options) {
            const button = this._buttonStore.add(new ButtonWithDescription(this.container, options));
            this.pushButton(button);
            return button;
        }
        addButtonWithDropdown(options) {
            const button = this._buttonStore.add(new ButtonWithDropdown(this.container, options));
            this.pushButton(button);
            return button;
        }
        pushButton(button) {
            this._buttons.push(button);
            const index = this._buttons.length - 1;
            this._buttonStore.add((0, dom_1.addDisposableListener)(button.element, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = true;
                // Next / Previous Button
                let buttonIndexToFocus;
                if (event.equals(15 /* KeyCode.LeftArrow */)) {
                    buttonIndexToFocus = index > 0 ? index - 1 : this._buttons.length - 1;
                }
                else if (event.equals(17 /* KeyCode.RightArrow */)) {
                    buttonIndexToFocus = index === this._buttons.length - 1 ? 0 : index + 1;
                }
                else {
                    eventHandled = false;
                }
                if (eventHandled && typeof buttonIndexToFocus === 'number') {
                    this._buttons[buttonIndexToFocus].focus();
                    dom_1.EventHelper.stop(e, true);
                }
            }));
        }
    }
    exports.ButtonBar = ButtonBar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvYnV0dG9uL2J1dHRvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1Q25GLFFBQUEsb0JBQW9CLEdBQWtCO1FBQ2xELGdCQUFnQixFQUFFLFNBQVM7UUFDM0IscUJBQXFCLEVBQUUsU0FBUztRQUNoQyxlQUFlLEVBQUUsYUFBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7UUFDdkMsZ0JBQWdCLEVBQUUsYUFBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7UUFDeEMsWUFBWSxFQUFFLFNBQVM7UUFDdkIseUJBQXlCLEVBQUUsU0FBUztRQUNwQyx5QkFBeUIsRUFBRSxTQUFTO1FBQ3BDLDhCQUE4QixFQUFFLFNBQVM7S0FDekMsQ0FBQztJQWtCRixNQUFhLE1BQU8sU0FBUSxzQkFBVTtRQVNyQyxJQUFJLFVBQVUsS0FBdUIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFJckUsWUFBWSxTQUFzQixFQUFFLE9BQXVCO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBVkMsV0FBTSxHQUE2QixFQUFFLENBQUM7WUFJeEMsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFTLENBQUMsQ0FBQztZQVExRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUV2QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFN0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1lBQ3BHLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1lBRXBHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFVLElBQUksRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxVQUFVLElBQUksRUFBRSxDQUFDO1lBRXZELElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2dCQUNuRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFFbkQsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUU5QyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztZQUNwRSxDQUFDO1lBRUQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxTQUFTLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUNELFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUVqRCxDQUFDLGVBQVMsQ0FBQyxLQUFLLEVBQUUsaUJBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDbkIsaUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3BCLE9BQU87b0JBQ1IsQ0FBQztvQkFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsZUFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDM0UsTUFBTSxLQUFLLEdBQUcsSUFBSSxxQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUN6QixJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSx1QkFBZSxJQUFJLEtBQUssQ0FBQyxNQUFNLHdCQUFlLENBQUMsRUFBRSxDQUFDO29CQUNsRixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekIsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDckIsQ0FBQztxQkFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLHdCQUFnQixFQUFFLENBQUM7b0JBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3JCLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQ3JCLENBQUM7Z0JBRUQsSUFBSSxZQUFZLEVBQUUsQ0FBQztvQkFDbEIsaUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMvQixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGVBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztvQkFDbkQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3QixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGVBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQzVFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLDBCQUEwQjtZQUN6RCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosZ0VBQWdFO1lBQ2hFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLGdCQUFVLEVBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVHLENBQUM7UUFFZSxPQUFPO1lBQ3RCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxPQUFlO1lBQ3pDLE1BQU0sUUFBUSxHQUFzQixFQUFFLENBQUM7WUFDdkMsS0FBSyxJQUFJLE9BQU8sSUFBSSxJQUFBLGlDQUFvQixFQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ25ELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNuQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUV6Qix1QkFBdUI7b0JBQ3ZCLElBQUksT0FBTyxLQUFLLEVBQUUsRUFBRSxDQUFDO3dCQUNwQixTQUFTO29CQUNWLENBQUM7b0JBRUQsMENBQTBDO29CQUMxQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM1QyxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztvQkFDM0IsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckIsQ0FBQztxQkFBTSxDQUFDO29CQUNQLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hCLENBQUM7WUFDRixDQUFDO1lBRUQsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztRQUVPLGdCQUFnQixDQUFDLEtBQWM7WUFDdEMsSUFBSSxVQUFVLENBQUM7WUFDZixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzVCLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUM7WUFDM0csQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7WUFDekYsQ0FBQztZQUNELElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7WUFDbEQsQ0FBQztRQUNGLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVELElBQUksS0FBSyxDQUFDLEtBQStCO1lBQ3hDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDM0IsT0FBTztZQUNSLENBQUM7WUFFRCxJQUFJLElBQUEsOEJBQWdCLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUEsOEJBQWdCLEVBQUMsS0FBSyxDQUFDLElBQUksSUFBQSxpQ0FBbUIsRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3pHLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDbEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUUxRixJQUFJLElBQUEsOEJBQWdCLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDN0IsTUFBTSxRQUFRLEdBQUcsSUFBQSxpQ0FBYyxFQUFDLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RCxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRW5CLDRCQUE0QjtnQkFDNUIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDO2dCQUM1RCxJQUFJLElBQUksRUFBRSxDQUFDO29CQUNWLG9EQUFvRDtvQkFDcEQsTUFBTSxTQUFTLEdBQUcsSUFBQSxvQkFBUSxFQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUNwSSxZQUFZLENBQUMsU0FBUyxHQUFHLFNBQThCLENBQUM7Z0JBQ3pELENBQUM7cUJBQU0sQ0FBQztvQkFDUCxJQUFBLFdBQUssRUFBQyxZQUFZLENBQUMsQ0FBQztnQkFDckIsQ0FBQztZQUNGLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQy9CLElBQUEsV0FBSyxFQUFDLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsWUFBWSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQ2xDLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUMxQyxDQUFDO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBQSwwQ0FBdUIsRUFBQyxLQUFLLENBQUMsQ0FBQztZQUN0RCxDQUFDO1lBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUNoRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRSxDQUFDO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0QsQ0FBQztZQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxJQUFJLEtBQUs7WUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVELElBQUksVUFBVSxDQUFDLEtBQWE7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDakUsT0FBTztZQUNSLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQy9CLElBQUEsV0FBSyxFQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ25FLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUM3QyxDQUFDO1FBQ0YsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLElBQWU7WUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcscUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxLQUFjO1lBQ3pCLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ1gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUM1QixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0QsQ0FBQztRQUNGLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFFRCxLQUFLO1lBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRUQsUUFBUTtZQUNQLE9BQU8sSUFBQSxxQkFBZSxFQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2QyxDQUFDO0tBQ0Q7SUFsT0Qsd0JBa09DO0lBU0QsTUFBYSxrQkFBbUIsU0FBUSxzQkFBVTtRQVlqRCxZQUFZLFNBQXNCLEVBQUUsT0FBbUM7WUFDdEUsS0FBSyxFQUFFLENBQUM7WUFKUSxnQkFBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFCLENBQUMsQ0FBQztZQUN2RSxlQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFLNUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ3JELFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxnQkFBTSxDQUFDLGVBQWUsRUFBRSxJQUFBLDBDQUF1QixFQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVySyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1lBRTFFLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUVsRCxtQkFBbUI7WUFDbkIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUNwQyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNaLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFlBQVksR0FBRyxNQUFNLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLFlBQVksR0FBRyxNQUFNLENBQUM7WUFDcEUsQ0FBQztZQUVELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7WUFDMUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsZ0JBQWdCLElBQUksRUFBRSxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQztZQUVyRSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqSCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsOEJBQThCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLGtCQUFPLENBQUMsY0FBYyxDQUFDO1lBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pELE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUM7b0JBQzNDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU87b0JBQzVDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO29CQUN6SCxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7b0JBQ2xDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQztpQkFDaEYsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbkUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFUSxPQUFPO1lBQ2YsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUVELElBQUksS0FBSyxDQUFDLEtBQWE7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUMzQixDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsSUFBZTtZQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQztRQUVELElBQUksT0FBTyxDQUFDLE9BQWdCO1lBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUM5QixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFFdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQzVCLENBQUM7UUFFRCxLQUFLO1lBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBRUQsUUFBUTtZQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pFLENBQUM7S0FDRDtJQTFGRCxnREEwRkM7SUFFRCxNQUFhLHFCQUFxQjtRQUtqQyxZQUFZLFNBQXNCLEVBQW1CLE9BQXVCO1lBQXZCLFlBQU8sR0FBUCxPQUFPLENBQWdCO1lBQzNFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFbEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUVwRCxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBSSxVQUFVO1lBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUNoQyxDQUFDO1FBRUQsSUFBSSxPQUFPO1lBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFJLEtBQUssQ0FBQyxLQUFhO1lBQ3RCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUM1QixDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsSUFBZTtZQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQUksT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQUksT0FBTyxDQUFDLE9BQWdCO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUNoQyxDQUFDO1FBRUQsS0FBSztZQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQUNELFFBQVE7WUFDUCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEMsQ0FBQztRQUNELE9BQU87WUFDTixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxJQUFJLFdBQVcsQ0FBQyxLQUFhO1lBQzVCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDL0IsSUFBQSxXQUFLLEVBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsSUFBQSxpQ0FBb0IsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUM5QyxDQUFDO1FBQ0YsQ0FBQztLQUNEO0lBMURELHNEQTBEQztJQUVELE1BQWEsU0FBUztRQUtyQixZQUE2QixTQUFzQjtZQUF0QixjQUFTLEdBQVQsU0FBUyxDQUFhO1lBSGxDLGFBQVEsR0FBYyxFQUFFLENBQUM7WUFDekIsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUl0RCxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQUksT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBRUQsS0FBSztZQUNKLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFFRCxTQUFTLENBQUMsT0FBdUI7WUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsd0JBQXdCLENBQUMsT0FBdUI7WUFDL0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFRCxxQkFBcUIsQ0FBQyxPQUFtQztZQUN4RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0RixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVPLFVBQVUsQ0FBQyxNQUFlO1lBQ2pDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTNCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsZUFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDbkYsTUFBTSxLQUFLLEdBQUcsSUFBSSxxQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUV4Qix5QkFBeUI7Z0JBQ3pCLElBQUksa0JBQXNDLENBQUM7Z0JBQzNDLElBQUksS0FBSyxDQUFDLE1BQU0sNEJBQW1CLEVBQUUsQ0FBQztvQkFDckMsa0JBQWtCLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUN2RSxDQUFDO3FCQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sNkJBQW9CLEVBQUUsQ0FBQztvQkFDN0Msa0JBQWtCLEdBQUcsS0FBSyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUN6RSxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsWUFBWSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsQ0FBQztnQkFFRCxJQUFJLFlBQVksSUFBSSxPQUFPLGtCQUFrQixLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQzFDLGlCQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDM0IsQ0FBQztZQUVGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0Q7SUFqRUQsOEJBaUVDIn0=