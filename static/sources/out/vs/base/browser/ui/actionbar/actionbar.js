/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/types", "vs/css!./actionbar"], function (require, exports, DOM, keyboardEvent_1, actionViewItems_1, actions_1, event_1, lifecycle_1, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prepareActions = exports.ActionBar = exports.ActionsOrientation = void 0;
    var ActionsOrientation;
    (function (ActionsOrientation) {
        ActionsOrientation[ActionsOrientation["HORIZONTAL"] = 0] = "HORIZONTAL";
        ActionsOrientation[ActionsOrientation["VERTICAL"] = 1] = "VERTICAL";
    })(ActionsOrientation || (exports.ActionsOrientation = ActionsOrientation = {}));
    class ActionBar extends lifecycle_1.Disposable {
        constructor(container, options = {}) {
            super();
            this._actionRunnerDisposables = this._register(new lifecycle_1.DisposableStore());
            this.viewItemDisposables = this._register(new lifecycle_1.DisposableMap());
            // Trigger Key Tracking
            this.triggerKeyDown = false;
            this.focusable = true;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onDidCancel = this._register(new event_1.Emitter({ onWillAddFirstListener: () => this.cancelHasListener = true }));
            this.onDidCancel = this._onDidCancel.event;
            this.cancelHasListener = false;
            this._onDidRun = this._register(new event_1.Emitter());
            this.onDidRun = this._onDidRun.event;
            this._onWillRun = this._register(new event_1.Emitter());
            this.onWillRun = this._onWillRun.event;
            this.options = options;
            this._context = options.context ?? null;
            this._orientation = this.options.orientation ?? 0 /* ActionsOrientation.HORIZONTAL */;
            this._triggerKeys = {
                keyDown: this.options.triggerKeys?.keyDown ?? false,
                keys: this.options.triggerKeys?.keys ?? [3 /* KeyCode.Enter */, 10 /* KeyCode.Space */]
            };
            if (this.options.actionRunner) {
                this._actionRunner = this.options.actionRunner;
            }
            else {
                this._actionRunner = new actions_1.ActionRunner();
                this._actionRunnerDisposables.add(this._actionRunner);
            }
            this._actionRunnerDisposables.add(this._actionRunner.onDidRun(e => this._onDidRun.fire(e)));
            this._actionRunnerDisposables.add(this._actionRunner.onWillRun(e => this._onWillRun.fire(e)));
            this.viewItems = [];
            this.focusedItem = undefined;
            this.domNode = document.createElement('div');
            this.domNode.className = 'monaco-action-bar';
            if (options.animated !== false) {
                this.domNode.classList.add('animated');
            }
            let previousKeys;
            let nextKeys;
            switch (this._orientation) {
                case 0 /* ActionsOrientation.HORIZONTAL */:
                    previousKeys = [15 /* KeyCode.LeftArrow */];
                    nextKeys = [17 /* KeyCode.RightArrow */];
                    break;
                case 1 /* ActionsOrientation.VERTICAL */:
                    previousKeys = [16 /* KeyCode.UpArrow */];
                    nextKeys = [18 /* KeyCode.DownArrow */];
                    this.domNode.className += ' vertical';
                    break;
            }
            this._register(DOM.addDisposableListener(this.domNode, DOM.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = true;
                const focusedItem = typeof this.focusedItem === 'number' ? this.viewItems[this.focusedItem] : undefined;
                if (previousKeys && (event.equals(previousKeys[0]) || event.equals(previousKeys[1]))) {
                    eventHandled = this.focusPrevious();
                }
                else if (nextKeys && (event.equals(nextKeys[0]) || event.equals(nextKeys[1]))) {
                    eventHandled = this.focusNext();
                }
                else if (event.equals(9 /* KeyCode.Escape */) && this.cancelHasListener) {
                    this._onDidCancel.fire();
                }
                else if (event.equals(14 /* KeyCode.Home */)) {
                    eventHandled = this.focusFirst();
                }
                else if (event.equals(13 /* KeyCode.End */)) {
                    eventHandled = this.focusLast();
                }
                else if (event.equals(2 /* KeyCode.Tab */) && focusedItem instanceof actionViewItems_1.BaseActionViewItem && focusedItem.trapsArrowNavigation) {
                    eventHandled = this.focusNext();
                }
                else if (this.isTriggerKeyEvent(event)) {
                    // Staying out of the else branch even if not triggered
                    if (this._triggerKeys.keyDown) {
                        this.doTrigger(event);
                    }
                    else {
                        this.triggerKeyDown = true;
                    }
                }
                else {
                    eventHandled = false;
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
            this._register(DOM.addDisposableListener(this.domNode, DOM.EventType.KEY_UP, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                // Run action on Enter/Space
                if (this.isTriggerKeyEvent(event)) {
                    if (!this._triggerKeys.keyDown && this.triggerKeyDown) {
                        this.triggerKeyDown = false;
                        this.doTrigger(event);
                    }
                    event.preventDefault();
                    event.stopPropagation();
                }
                // Recompute focused item
                else if (event.equals(2 /* KeyCode.Tab */) || event.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */) || event.equals(16 /* KeyCode.UpArrow */) || event.equals(18 /* KeyCode.DownArrow */) || event.equals(15 /* KeyCode.LeftArrow */) || event.equals(17 /* KeyCode.RightArrow */)) {
                    this.updateFocusedItem();
                }
            }));
            this.focusTracker = this._register(DOM.trackFocus(this.domNode));
            this._register(this.focusTracker.onDidBlur(() => {
                if (DOM.getActiveElement() === this.domNode || !DOM.isAncestor(DOM.getActiveElement(), this.domNode)) {
                    this._onDidBlur.fire();
                    this.previouslyFocusedItem = this.focusedItem;
                    this.focusedItem = undefined;
                    this.triggerKeyDown = false;
                }
            }));
            this._register(this.focusTracker.onDidFocus(() => this.updateFocusedItem()));
            this.actionsList = document.createElement('ul');
            this.actionsList.className = 'actions-container';
            if (this.options.highlightToggledItems) {
                this.actionsList.classList.add('highlight-toggled');
            }
            this.actionsList.setAttribute('role', this.options.ariaRole || 'toolbar');
            if (this.options.ariaLabel) {
                this.actionsList.setAttribute('aria-label', this.options.ariaLabel);
            }
            this.domNode.appendChild(this.actionsList);
            container.appendChild(this.domNode);
        }
        refreshRole() {
            if (this.length() >= 1) {
                this.actionsList.setAttribute('role', this.options.ariaRole || 'toolbar');
            }
            else {
                this.actionsList.setAttribute('role', 'presentation');
            }
        }
        setAriaLabel(label) {
            if (label) {
                this.actionsList.setAttribute('aria-label', label);
            }
            else {
                this.actionsList.removeAttribute('aria-label');
            }
        }
        // Some action bars should not be focusable at times
        // When an action bar is not focusable make sure to make all the elements inside it not focusable
        // When an action bar is focusable again, make sure the first item can be focused
        setFocusable(focusable) {
            this.focusable = focusable;
            if (this.focusable) {
                const firstEnabled = this.viewItems.find(vi => vi instanceof actionViewItems_1.BaseActionViewItem && vi.isEnabled());
                if (firstEnabled instanceof actionViewItems_1.BaseActionViewItem) {
                    firstEnabled.setFocusable(true);
                }
            }
            else {
                this.viewItems.forEach(vi => {
                    if (vi instanceof actionViewItems_1.BaseActionViewItem) {
                        vi.setFocusable(false);
                    }
                });
            }
        }
        isTriggerKeyEvent(event) {
            let ret = false;
            this._triggerKeys.keys.forEach(keyCode => {
                ret = ret || event.equals(keyCode);
            });
            return ret;
        }
        updateFocusedItem() {
            for (let i = 0; i < this.actionsList.children.length; i++) {
                const elem = this.actionsList.children[i];
                if (DOM.isAncestor(DOM.getActiveElement(), elem)) {
                    this.focusedItem = i;
                    this.viewItems[this.focusedItem]?.showHover?.();
                    break;
                }
            }
        }
        get context() {
            return this._context;
        }
        set context(context) {
            this._context = context;
            this.viewItems.forEach(i => i.setActionContext(context));
        }
        get actionRunner() {
            return this._actionRunner;
        }
        set actionRunner(actionRunner) {
            this._actionRunner = actionRunner;
            // when setting a new `IActionRunner` make sure to dispose old listeners and
            // start to forward events from the new listener
            this._actionRunnerDisposables.clear();
            this._actionRunnerDisposables.add(this._actionRunner.onDidRun(e => this._onDidRun.fire(e)));
            this._actionRunnerDisposables.add(this._actionRunner.onWillRun(e => this._onWillRun.fire(e)));
            this.viewItems.forEach(item => item.actionRunner = actionRunner);
        }
        getContainer() {
            return this.domNode;
        }
        hasAction(action) {
            return this.viewItems.findIndex(candidate => candidate.action.id === action.id) !== -1;
        }
        getAction(indexOrElement) {
            // by index
            if (typeof indexOrElement === 'number') {
                return this.viewItems[indexOrElement]?.action;
            }
            // by element
            if (indexOrElement instanceof HTMLElement) {
                while (indexOrElement.parentElement !== this.actionsList) {
                    if (!indexOrElement.parentElement) {
                        return undefined;
                    }
                    indexOrElement = indexOrElement.parentElement;
                }
                for (let i = 0; i < this.actionsList.childNodes.length; i++) {
                    if (this.actionsList.childNodes[i] === indexOrElement) {
                        return this.viewItems[i].action;
                    }
                }
            }
            return undefined;
        }
        push(arg, options = {}) {
            const actions = Array.isArray(arg) ? arg : [arg];
            let index = types.isNumber(options.index) ? options.index : null;
            actions.forEach((action) => {
                const actionViewItemElement = document.createElement('li');
                actionViewItemElement.className = 'action-item';
                actionViewItemElement.setAttribute('role', 'presentation');
                let item;
                const viewItemOptions = { hoverDelegate: this.options.hoverDelegate, ...options };
                if (this.options.actionViewItemProvider) {
                    item = this.options.actionViewItemProvider(action, viewItemOptions);
                }
                if (!item) {
                    item = new actionViewItems_1.ActionViewItem(this.context, action, viewItemOptions);
                }
                // Prevent native context menu on actions
                if (!this.options.allowContextMenu) {
                    this.viewItemDisposables.set(item, DOM.addDisposableListener(actionViewItemElement, DOM.EventType.CONTEXT_MENU, (e) => {
                        DOM.EventHelper.stop(e, true);
                    }));
                }
                item.actionRunner = this._actionRunner;
                item.setActionContext(this.context);
                item.render(actionViewItemElement);
                if (this.focusable && item instanceof actionViewItems_1.BaseActionViewItem && this.viewItems.length === 0) {
                    // We need to allow for the first enabled item to be focused on using tab navigation #106441
                    item.setFocusable(true);
                }
                if (index === null || index < 0 || index >= this.actionsList.children.length) {
                    this.actionsList.appendChild(actionViewItemElement);
                    this.viewItems.push(item);
                }
                else {
                    this.actionsList.insertBefore(actionViewItemElement, this.actionsList.children[index]);
                    this.viewItems.splice(index, 0, item);
                    index++;
                }
            });
            if (typeof this.focusedItem === 'number') {
                // After a clear actions might be re-added to simply toggle some actions. We should preserve focus #97128
                this.focus(this.focusedItem);
            }
            this.refreshRole();
        }
        getWidth(index) {
            if (index >= 0 && index < this.actionsList.children.length) {
                const item = this.actionsList.children.item(index);
                if (item) {
                    return item.clientWidth;
                }
            }
            return 0;
        }
        getHeight(index) {
            if (index >= 0 && index < this.actionsList.children.length) {
                const item = this.actionsList.children.item(index);
                if (item) {
                    return item.clientHeight;
                }
            }
            return 0;
        }
        pull(index) {
            if (index >= 0 && index < this.viewItems.length) {
                this.actionsList.removeChild(this.actionsList.childNodes[index]);
                this.viewItemDisposables.deleteAndDispose(this.viewItems[index]);
                (0, lifecycle_1.dispose)(this.viewItems.splice(index, 1));
                this.refreshRole();
            }
        }
        clear() {
            if (this.isEmpty()) {
                return;
            }
            this.viewItems = (0, lifecycle_1.dispose)(this.viewItems);
            this.viewItemDisposables.clearAndDisposeAll();
            DOM.clearNode(this.actionsList);
            this.refreshRole();
        }
        length() {
            return this.viewItems.length;
        }
        isEmpty() {
            return this.viewItems.length === 0;
        }
        focus(arg) {
            let selectFirst = false;
            let index = undefined;
            if (arg === undefined) {
                selectFirst = true;
            }
            else if (typeof arg === 'number') {
                index = arg;
            }
            else if (typeof arg === 'boolean') {
                selectFirst = arg;
            }
            if (selectFirst && typeof this.focusedItem === 'undefined') {
                const firstEnabled = this.viewItems.findIndex(item => item.isEnabled());
                // Focus the first enabled item
                this.focusedItem = firstEnabled === -1 ? undefined : firstEnabled;
                this.updateFocus(undefined, undefined, true);
            }
            else {
                if (index !== undefined) {
                    this.focusedItem = index;
                }
                this.updateFocus(undefined, undefined, true);
            }
        }
        focusFirst() {
            this.focusedItem = this.length() - 1;
            return this.focusNext(true);
        }
        focusLast() {
            this.focusedItem = 0;
            return this.focusPrevious(true);
        }
        focusNext(forceLoop) {
            if (typeof this.focusedItem === 'undefined') {
                this.focusedItem = this.viewItems.length - 1;
            }
            else if (this.viewItems.length <= 1) {
                return false;
            }
            const startIndex = this.focusedItem;
            let item;
            do {
                if (!forceLoop && this.options.preventLoopNavigation && this.focusedItem + 1 >= this.viewItems.length) {
                    this.focusedItem = startIndex;
                    return false;
                }
                this.focusedItem = (this.focusedItem + 1) % this.viewItems.length;
                item = this.viewItems[this.focusedItem];
            } while (this.focusedItem !== startIndex && ((this.options.focusOnlyEnabledItems && !item.isEnabled()) || item.action.id === actions_1.Separator.ID));
            this.updateFocus();
            return true;
        }
        focusPrevious(forceLoop) {
            if (typeof this.focusedItem === 'undefined') {
                this.focusedItem = 0;
            }
            else if (this.viewItems.length <= 1) {
                return false;
            }
            const startIndex = this.focusedItem;
            let item;
            do {
                this.focusedItem = this.focusedItem - 1;
                if (this.focusedItem < 0) {
                    if (!forceLoop && this.options.preventLoopNavigation) {
                        this.focusedItem = startIndex;
                        return false;
                    }
                    this.focusedItem = this.viewItems.length - 1;
                }
                item = this.viewItems[this.focusedItem];
            } while (this.focusedItem !== startIndex && ((this.options.focusOnlyEnabledItems && !item.isEnabled()) || item.action.id === actions_1.Separator.ID));
            this.updateFocus(true);
            return true;
        }
        updateFocus(fromRight, preventScroll, forceFocus = false) {
            if (typeof this.focusedItem === 'undefined') {
                this.actionsList.focus({ preventScroll });
            }
            if (this.previouslyFocusedItem !== undefined && this.previouslyFocusedItem !== this.focusedItem) {
                this.viewItems[this.previouslyFocusedItem]?.blur();
            }
            const actionViewItem = this.focusedItem !== undefined ? this.viewItems[this.focusedItem] : undefined;
            if (actionViewItem) {
                let focusItem = true;
                if (!types.isFunction(actionViewItem.focus)) {
                    focusItem = false;
                }
                if (this.options.focusOnlyEnabledItems && types.isFunction(actionViewItem.isEnabled) && !actionViewItem.isEnabled()) {
                    focusItem = false;
                }
                if (actionViewItem.action.id === actions_1.Separator.ID) {
                    focusItem = false;
                }
                if (!focusItem) {
                    this.actionsList.focus({ preventScroll });
                    this.previouslyFocusedItem = undefined;
                }
                else if (forceFocus || this.previouslyFocusedItem !== this.focusedItem) {
                    actionViewItem.focus(fromRight);
                    this.previouslyFocusedItem = this.focusedItem;
                }
                if (focusItem) {
                    actionViewItem.showHover?.();
                }
            }
        }
        doTrigger(event) {
            if (typeof this.focusedItem === 'undefined') {
                return; //nothing to focus
            }
            // trigger action
            const actionViewItem = this.viewItems[this.focusedItem];
            if (actionViewItem instanceof actionViewItems_1.BaseActionViewItem) {
                const context = (actionViewItem._context === null || actionViewItem._context === undefined) ? event : actionViewItem._context;
                this.run(actionViewItem._action, context);
            }
        }
        async run(action, context) {
            await this._actionRunner.run(action, context);
        }
        dispose() {
            this._context = undefined;
            this.viewItems = (0, lifecycle_1.dispose)(this.viewItems);
            this.getContainer().remove();
            super.dispose();
        }
    }
    exports.ActionBar = ActionBar;
    function prepareActions(actions) {
        if (!actions.length) {
            return actions;
        }
        // Clean up leading separators
        let firstIndexOfAction = -1;
        for (let i = 0; i < actions.length; i++) {
            if (actions[i].id === actions_1.Separator.ID) {
                continue;
            }
            firstIndexOfAction = i;
            break;
        }
        if (firstIndexOfAction === -1) {
            return [];
        }
        actions = actions.slice(firstIndexOfAction);
        // Clean up trailing separators
        for (let h = actions.length - 1; h >= 0; h--) {
            const isSeparator = actions[h].id === actions_1.Separator.ID;
            if (isSeparator) {
                actions.splice(h, 1);
            }
            else {
                break;
            }
        }
        // Clean up separator duplicates
        let foundAction = false;
        for (let k = actions.length - 1; k >= 0; k--) {
            const isSeparator = actions[k].id === actions_1.Separator.ID;
            if (isSeparator && !foundAction) {
                actions.splice(k, 1);
            }
            else if (!isSeparator) {
                foundAction = true;
            }
            else if (isSeparator) {
                foundAction = false;
            }
        }
        return actions;
    }
    exports.prepareActions = prepareActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvYWN0aW9uYmFyL2FjdGlvbmJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE0QmhHLElBQWtCLGtCQUdqQjtJQUhELFdBQWtCLGtCQUFrQjtRQUNuQyx1RUFBVSxDQUFBO1FBQ1YsbUVBQVEsQ0FBQTtJQUNULENBQUMsRUFIaUIsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFHbkM7SUFnQ0QsTUFBYSxTQUFVLFNBQVEsc0JBQVU7UUEwQ3hDLFlBQVksU0FBc0IsRUFBRSxVQUE2QixFQUFFO1lBQ2xFLEtBQUssRUFBRSxDQUFDO1lBdENRLDZCQUF3QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQVVqRSx3QkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBbUIsQ0FBQyxDQUFDO1lBSzVGLHVCQUF1QjtZQUNmLG1CQUFjLEdBQVksS0FBSyxDQUFDO1lBRWhDLGNBQVMsR0FBWSxJQUFJLENBQUM7WUFNakIsZUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3pELGNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUUxQixpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLENBQU8sRUFBRSxzQkFBc0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFILGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDdkMsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1lBRWpCLGNB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