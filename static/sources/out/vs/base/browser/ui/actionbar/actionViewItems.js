/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/nls", "vs/css!./actionbar"], function (require, exports, browser_1, dnd_1, dom_1, touch_1, iconLabelHover_1, selectBox_1, actions_1, lifecycle_1, platform, types, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectActionViewItem = exports.ActionViewItem = exports.BaseActionViewItem = void 0;
    class BaseActionViewItem extends lifecycle_1.Disposable {
        get action() {
            return this._action;
        }
        constructor(context, action, options = {}) {
            super();
            this.options = options;
            this._context = context || this;
            this._action = action;
            if (action instanceof actions_1.Action) {
                this._register(action.onDidChange(event => {
                    if (!this.element) {
                        // we have not been rendered yet, so there
                        // is no point in updating the UI
                        return;
                    }
                    this.handleActionChangeEvent(event);
                }));
            }
        }
        handleActionChangeEvent(event) {
            if (event.enabled !== undefined) {
                this.updateEnabled();
            }
            if (event.checked !== undefined) {
                this.updateChecked();
            }
            if (event.class !== undefined) {
                this.updateClass();
            }
            if (event.label !== undefined) {
                this.updateLabel();
                this.updateTooltip();
            }
            if (event.tooltip !== undefined) {
                this.updateTooltip();
            }
        }
        get actionRunner() {
            if (!this._actionRunner) {
                this._actionRunner = this._register(new actions_1.ActionRunner());
            }
            return this._actionRunner;
        }
        set actionRunner(actionRunner) {
            this._actionRunner = actionRunner;
        }
        isEnabled() {
            return this._action.enabled;
        }
        setActionContext(newContext) {
            this._context = newContext;
        }
        render(container) {
            const element = this.element = container;
            this._register(touch_1.Gesture.addTarget(container));
            const enableDragging = this.options && this.options.draggable;
            if (enableDragging) {
                container.draggable = true;
                if (browser_1.isFirefox) {
                    // Firefox: requires to set a text data transfer to get going
                    this._register((0, dom_1.addDisposableListener)(container, dom_1.EventType.DRAG_START, e => e.dataTransfer?.setData(dnd_1.DataTransfers.TEXT, this._action.label)));
                }
            }
            this._register((0, dom_1.addDisposableListener)(element, touch_1.EventType.Tap, e => this.onClick(e, true))); // Preserve focus on tap #125470
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.MOUSE_DOWN, e => {
                if (!enableDragging) {
                    dom_1.EventHelper.stop(e, true); // do not run when dragging is on because that would disable it
                }
                if (this._action.enabled && e.button === 0) {
                    element.classList.add('active');
                }
            }));
            if (platform.isMacintosh) {
                // macOS: allow to trigger the button when holding Ctrl+key and pressing the
                // main mouse button. This is for scenarios where e.g. some interaction forces
                // the Ctrl+key to be pressed and hold but the user still wants to interact
                // with the actions (for example quick access in quick navigation mode).
                this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.CONTEXT_MENU, e => {
                    if (e.button === 0 && e.ctrlKey === true) {
                        this.onClick(e);
                    }
                }));
            }
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.CLICK, e => {
                dom_1.EventHelper.stop(e, true);
                // menus do not use the click event
                if (!(this.options && this.options.isMenu)) {
                    this.onClick(e);
                }
            }));
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.DBLCLICK, e => {
                dom_1.EventHelper.stop(e, true);
            }));
            [dom_1.EventType.MOUSE_UP, dom_1.EventType.MOUSE_OUT].forEach(event => {
                this._register((0, dom_1.addDisposableListener)(element, event, e => {
                    dom_1.EventHelper.stop(e);
                    element.classList.remove('active');
                }));
            });
        }
        onClick(event, preserveFocus = false) {
            dom_1.EventHelper.stop(event, true);
            const context = types.isUndefinedOrNull(this._context) ? this.options?.useEventAsContext ? event : { preserveFocus } : this._context;
            this.actionRunner.run(this._action, context);
        }
        // Only set the tabIndex on the element once it is about to get focused
        // That way this element wont be a tab stop when it is not needed #106441
        focus() {
            if (this.element) {
                this.element.tabIndex = 0;
                this.element.focus();
                this.element.classList.add('focused');
            }
        }
        isFocused() {
            return !!this.element?.classList.contains('focused');
        }
        blur() {
            if (this.element) {
                this.element.blur();
                this.element.tabIndex = -1;
                this.element.classList.remove('focused');
            }
        }
        setFocusable(focusable) {
            if (this.element) {
                this.element.tabIndex = focusable ? 0 : -1;
            }
        }
        get trapsArrowNavigation() {
            return false;
        }
        updateEnabled() {
            // implement in subclass
        }
        updateLabel() {
            // implement in subclass
        }
        getClass() {
            return this.action.class;
        }
        getTooltip() {
            return this.action.tooltip;
        }
        updateTooltip() {
            if (!this.element) {
                return;
            }
            const title = this.getTooltip() ?? '';
            this.updateAriaLabel();
            if (!this.options.hoverDelegate) {
                this.element.title = title;
            }
            else {
                this.element.title = '';
                if (!this.customHover) {
                    this.customHover = (0, iconLabelHover_1.setupCustomHover)(this.options.hoverDelegate, this.element, title);
                    this._store.add(this.customHover);
                }
                else {
                    this.customHover.update(title);
                }
            }
        }
        updateAriaLabel() {
            if (this.element) {
                const title = this.getTooltip() ?? '';
                this.element.setAttribute('aria-label', title);
            }
        }
        updateClass() {
            // implement in subclass
        }
        updateChecked() {
            // implement in subclass
        }
        dispose() {
            if (this.element) {
                this.element.remove();
                this.element = undefined;
            }
            this._context = undefined;
            super.dispose();
        }
    }
    exports.BaseActionViewItem = BaseActionViewItem;
    class ActionViewItem extends BaseActionViewItem {
        constructor(context, action, options) {
            super(context, action, options);
            this.options = options;
            this.options.icon = options.icon !== undefined ? options.icon : false;
            this.options.label = options.label !== undefined ? options.label : true;
            this.cssClass = '';
        }
        render(container) {
            super.render(container);
            types.assertType(this.element);
            const label = document.createElement('a');
            label.classList.add('action-label');
            label.setAttribute('role', this.getDefaultAriaRole());
            this.label = label;
            this.element.appendChild(label);
            if (this.options.label && this.options.keybinding) {
                const kbLabel = document.createElement('span');
                kbLabel.classList.add('keybinding');
                kbLabel.textContent = this.options.keybinding;
                this.element.appendChild(kbLabel);
            }
            this.updateClass();
            this.updateLabel();
            this.updateTooltip();
            this.updateEnabled();
            this.updateChecked();
        }
        getDefaultAriaRole() {
            if (this._action.id === actions_1.Separator.ID) {
                return 'presentation'; // A separator is a presentation item
            }
            else {
                if (this.options.isMenu) {
                    return 'menuitem';
                }
                else {
                    return 'button';
                }
            }
        }
        // Only set the tabIndex on the element once it is about to get focused
        // That way this element wont be a tab stop when it is not needed #106441
        focus() {
            if (this.label) {
                this.label.tabIndex = 0;
                this.label.focus();
            }
        }
        isFocused() {
            return !!this.label && this.label?.tabIndex === 0;
        }
        blur() {
            if (this.label) {
                this.label.tabIndex = -1;
            }
        }
        setFocusable(focusable) {
            if (this.label) {
                this.label.tabIndex = focusable ? 0 : -1;
            }
        }
        updateLabel() {
            if (this.options.label && this.label) {
                this.label.textContent = this.action.label;
            }
        }
        getTooltip() {
            let title = null;
            if (this.action.tooltip) {
                title = this.action.tooltip;
            }
            else if (!this.options.label && this.action.label && this.options.icon) {
                title = this.action.label;
                if (this.options.keybinding) {
                    title = nls.localize({ key: 'titleLabel', comment: ['action title', 'action keybinding'] }, "{0} ({1})", title, this.options.keybinding);
                }
            }
            return title ?? undefined;
        }
        updateClass() {
            if (this.cssClass && this.label) {
                this.label.classList.remove(...this.cssClass.split(' '));
            }
            if (this.options.icon) {
                this.cssClass = this.getClass();
                if (this.label) {
                    this.label.classList.add('codicon');
                    if (this.cssClass) {
                        this.label.classList.add(...this.cssClass.split(' '));
                    }
                }
                this.updateEnabled();
            }
            else {
                this.label?.classList.remove('codicon');
            }
        }
        updateEnabled() {
            if (this.action.enabled) {
                if (this.label) {
                    this.label.removeAttribute('aria-disabled');
                    this.label.classList.remove('disabled');
                }
                this.element?.classList.remove('disabled');
            }
            else {
                if (this.label) {
                    this.label.setAttribute('aria-disabled', 'true');
                    this.label.classList.add('disabled');
                }
                this.element?.classList.add('disabled');
            }
        }
        updateAriaLabel() {
            if (this.label) {
                const title = this.getTooltip() ?? '';
                this.label.setAttribute('aria-label', title);
            }
        }
        updateChecked() {
            if (this.label) {
                if (this.action.checked !== undefined) {
                    this.label.classList.toggle('checked', this.action.checked);
                    this.label.setAttribute('aria-checked', this.action.checked ? 'true' : 'false');
                    this.label.setAttribute('role', 'checkbox');
                }
                else {
                    this.label.classList.remove('checked');
                    this.label.removeAttribute('aria-checked');
                    this.label.setAttribute('role', this.getDefaultAriaRole());
                }
            }
        }
    }
    exports.ActionViewItem = ActionViewItem;
    class SelectActionViewItem extends BaseActionViewItem {
        constructor(ctx, action, options, selected, contextViewProvider, styles, selectBoxOptions) {
            super(ctx, action);
            this.selectBox = new selectBox_1.SelectBox(options, selected, contextViewProvider, styles, selectBoxOptions);
            this.selectBox.setFocusable(false);
            this._register(this.selectBox);
            this.registerListeners();
        }
        setOptions(options, selected) {
            this.selectBox.setOptions(options, selected);
        }
        select(index) {
            this.selectBox.select(index);
        }
        registerListeners() {
            this._register(this.selectBox.onDidSelect(e => this.runAction(e.selected, e.index)));
        }
        runAction(option, index) {
            this.actionRunner.run(this._action, this.getActionContext(option, index));
        }
        getActionContext(option, index) {
            return option;
        }
        setFocusable(focusable) {
            this.selectBox.setFocusable(focusable);
        }
        focus() {
            this.selectBox?.focus();
        }
        blur() {
            this.selectBox?.blur();
        }
        render(container) {
            this.selectBox.render(container);
        }
    }
    exports.SelectActionViewItem = SelectActionViewItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uVmlld0l0ZW1zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvYWN0aW9uYmFyL2FjdGlvblZpZXdJdGVtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEwQmhHLE1BQWEsa0JBQW1CLFNBQVEsc0JBQVU7UUFTakQsSUFBSSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7UUFJRCxZQUFZLE9BQWdCLEVBQUUsTUFBZSxFQUFZLFVBQXNDLEVBQUU7WUFDaEcsS0FBSyxFQUFFLENBQUM7WUFEZ0QsWUFBTyxHQUFQLE9BQU8sQ0FBaUM7WUFHaEcsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLElBQUksSUFBSSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBRXRCLElBQUksTUFBTSxZQUFZLGdCQUFNLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUNuQiwwQ0FBMEM7d0JBQzFDLGlDQUFpQzt3QkFDakMsT0FBTztvQkFDUixDQUFDO29CQUVELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDckMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7UUFDRixDQUFDO1FBRU8sdUJBQXVCLENBQUMsS0FBeUI7WUFDeEQsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdEIsQ0FBQztZQUVELElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztn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