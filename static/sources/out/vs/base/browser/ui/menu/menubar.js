/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/touch", "vs/base/browser/ui/menu/menu", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls", "vs/base/browser/window", "vs/css!./menubar"], function (require, exports, browser, DOM, keyboardEvent_1, mouseEvent_1, touch_1, menu_1, actions_1, arrays_1, async_1, codicons_1, themables_1, event_1, keyCodes_1, lifecycle_1, platform_1, strings, nls, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuBar = void 0;
    const $ = DOM.$;
    var MenubarState;
    (function (MenubarState) {
        MenubarState[MenubarState["HIDDEN"] = 0] = "HIDDEN";
        MenubarState[MenubarState["VISIBLE"] = 1] = "VISIBLE";
        MenubarState[MenubarState["FOCUSED"] = 2] = "FOCUSED";
        MenubarState[MenubarState["OPEN"] = 3] = "OPEN";
    })(MenubarState || (MenubarState = {}));
    class MenuBar extends lifecycle_1.Disposable {
        static { this.OVERFLOW_INDEX = -1; }
        constructor(container, options, menuStyle) {
            super();
            this.container = container;
            this.options = options;
            this.menuStyle = menuStyle;
            // Input-related
            this._mnemonicsInUse = false;
            this.openedViaKeyboard = false;
            this.awaitingAltRelease = false;
            this.ignoreNextMouseUp = false;
            this.updatePending = false;
            this.numMenusShown = 0;
            this.overflowLayoutScheduled = undefined;
            this.menuDisposables = this._register(new lifecycle_1.DisposableStore());
            this.container.setAttribute('role', 'menubar');
            if (this.isCompact) {
                this.container.classList.add('compact');
            }
            this.menus = [];
            this.mnemonics = new Map();
            this._focusState = MenubarState.VISIBLE;
            this._onVisibilityChange = this._register(new event_1.Emitter());
            this._onFocusStateChange = this._register(new event_1.Emitter());
            this.createOverflowMenu();
            this.menuUpdater = this._register(new async_1.RunOnceScheduler(() => this.update(), 200));
            this.actionRunner = this.options.actionRunner ?? this._register(new actions_1.ActionRunner());
            this._register(this.actionRunner.onWillRun(() => {
                this.setUnfocusedState();
            }));
            this._register(DOM.ModifierKeyEmitter.getInstance().event(this.onModifierKeyToggled, this));
            this._register(DOM.addDisposableListener(this.container, DOM.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = true;
                const key = !!e.key ? e.key.toLocaleLowerCase() : '';
                const tabNav = platform_1.isMacintosh && !this.isCompact;
                if (event.equals(15 /* KeyCode.LeftArrow */) || (tabNav && event.equals(2 /* KeyCode.Tab */ | 1024 /* KeyMod.Shift */))) {
                    this.focusPrevious();
                }
                else if (event.equals(17 /* KeyCode.RightArrow */) || (tabNav && event.equals(2 /* KeyCode.Tab */))) {
                    this.focusNext();
                }
                else if (event.equals(9 /* KeyCode.Escape */) && this.isFocused && !this.isOpen) {
                    this.setUnfocusedState();
                }
                else if (!this.isOpen && !event.ctrlKey && this.options.enableMnemonics && this.mnemonicsInUse && this.mnemonics.has(key)) {
                    const menuIndex = this.mnemonics.get(key);
                    this.onMenuTriggered(menuIndex, false);
                }
                else {
                    eventHandled = false;
                }
                // Never allow default tab behavior when not compact
                if (!this.isCompact && (event.equals(2 /* KeyCode.Tab */ | 1024 /* KeyMod.Shift */) || event.equals(2 /* KeyCode.Tab */))) {
                    event.preventDefault();
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
            const window = DOM.getWindow(this.container);
            this._register(DOM.addDisposableListener(window, DOM.EventType.MOUSE_DOWN, () => {
                // This mouse event is outside the menubar so it counts as a focus out
                if (this.isFocused) {
                    this.setUnfocusedState();
                }
            }));
            this._register(DOM.addDisposableListener(this.container, DOM.EventType.FOCUS_IN, (e) => {
                const event = e;
                if (event.relatedTarget) {
                    if (!this.container.contains(event.relatedTarget)) {
                        this.focusToReturn = event.relatedTarget;
                    }
                }
            }));
            this._register(DOM.addDisposableListener(this.container, DOM.EventType.FOCUS_OUT, (e) => {
                const event = e;
                // We are losing focus and there is no related target, e.g. webview case
                if (!event.relatedTarget) {
                    this.setUnfocusedState();
                }
                // We are losing focus and there is a target, reset focusToReturn value as not to redirect
                else if (event.relatedTarget && !this.container.contains(event.relatedTarget)) {
                    this.focusToReturn = undefined;
                    this.setUnfocusedState();
                }
            }));
            this._register(DOM.addDisposableListener(window, DOM.EventType.KEY_DOWN, (e) => {
                if (!this.options.enableMnemonics || !e.altKey || e.ctrlKey || e.defaultPrevented) {
                    return;
                }
                const key = e.key.toLocaleLowerCase();
                if (!this.mnemonics.has(key)) {
                    return;
                }
                this.mnemonicsInUse = true;
                this.updateMnemonicVisibility(true);
                const menuIndex = this.mnemonics.get(key);
                this.onMenuTriggered(menuIndex, false);
            }));
            this.setUnfocusedState();
        }
        push(arg) {
            const menus = (0, arrays_1.asArray)(arg);
            menus.forEach((menuBarMenu) => {
                const menuIndex = this.menus.length;
                const cleanMenuLabel = (0, menu_1.cleanMnemonic)(menuBarMenu.label);
                const mnemonicMatches = menu_1.MENU_MNEMONIC_REGEX.exec(menuBarMenu.label);
                // Register mnemonics
                if (mnemonicMatches) {
                    const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
                    this.registerMnemonic(this.menus.length, mnemonic);
                }
                if (this.isCompact) {
                    this.menus.push(menuBarMenu);
                }
                else {
                    const buttonElement = $('div.menubar-menu-button', { 'role': 'menuitem', 'tabindex': -1, 'aria-label': cleanMenuLabel, 'aria-haspopup': true });
                    const titleElement = $('div.menubar-menu-title', { 'role': 'none', 'aria-hidden': true });
                    buttonElement.appendChild(titleElement);
                    this.container.insertBefore(buttonElement, this.overflowMenu.buttonElement);
                    this.updateLabels(titleElement, buttonElement, menuBarMenu.label);
                    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.KEY_UP, (e) => {
                        const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                        let eventHandled = true;
                        if ((event.equals(18 /* KeyCode.DownArrow */) || event.equals(3 /* KeyCode.Enter */)) && !this.isOpen) {
                            this.focusedMenu = { index: menuIndex };
                            this.openedViaKeyboard = true;
                            this.focusState = MenubarState.OPEN;
                        }
                        else {
                            eventHandled = false;
                        }
                        if (eventHandled) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }));
                    this._register(touch_1.Gesture.addTarget(buttonElement));
                    this._register(DOM.addDisposableListener(buttonElement, touch_1.EventType.Tap, (e) => {
                        // Ignore this touch if the menu is touched
                        if (this.isOpen && this.focusedMenu && this.focusedMenu.holder && DOM.isAncestor(e.initialTarget, this.focusedMenu.holder)) {
                            return;
                        }
                        this.ignoreNextMouseUp = false;
                        this.onMenuTriggered(menuIndex, true);
                        e.preventDefault();
                        e.stopPropagation();
                    }));
                    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_DOWN, (e) => {
                        // Ignore non-left-click
                        const mouseEvent = new mouseEvent_1.StandardMouseEvent(DOM.getWindow(buttonElement), e);
                        if (!mouseEvent.leftButton) {
                            e.preventDefault();
                            return;
                        }
                        if (!this.isOpen) {
                            // Open the menu with mouse down and ignore the following mouse up event
                            this.ignoreNextMouseUp = true;
                            this.onMenuTriggered(menuIndex, true);
                        }
                        else {
                            this.ignoreNextMouseUp = false;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    }));
                    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_UP, (e) => {
                        if (e.defaultPrevented) {
                            return;
                        }
                        if (!this.ignoreNextMouseUp) {
                            if (this.isFocused) {
                                this.onMenuTriggered(menuIndex, true);
                            }
                        }
                        else {
                            this.ignoreNextMouseUp = false;
                        }
                    }));
                    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_ENTER, () => {
                        if (this.isOpen && !this.isCurrentMenu(menuIndex)) {
                            buttonElement.focus();
                            this.cleanupCustomMenu();
                            this.showCustomMenu(menuIndex, false);
                        }
                        else if (this.isFocused && !this.isOpen) {
                            this.focusedMenu = { index: menuIndex };
                            buttonElement.focus();
                        }
                    }));
                    this.menus.push({
                        label: menuBarMenu.label,
                        actions: menuBarMenu.actions,
                        buttonElement: buttonElement,
                        titleElement: titleElement
                    });
                }
            });
        }
        createOverflowMenu() {
            const label = this.isCompact ? nls.localize('mAppMenu', 'Application Menu') : nls.localize('mMore', 'More');
            const buttonElement = $('div.menubar-menu-button', { 'role': 'menuitem', 'tabindex': this.isCompact ? 0 : -1, 'aria-label': label, 'aria-haspopup': true });
            const titleElement = $('div.menubar-menu-title.toolbar-toggle-more' + themables_1.ThemeIcon.asCSSSelector(codicons_1.Codicon.menuBarMore), { 'role': 'none', 'aria-hidden': true });
            buttonElement.appendChild(titleElement);
            this.container.appendChild(buttonElement);
            buttonElement.style.visibility = 'hidden';
            this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.KEY_UP, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = true;
                const triggerKeys = [3 /* KeyCode.Enter */];
                if (!this.isCompact) {
                    triggerKeys.push(18 /* KeyCode.DownArrow */);
                }
                else {
                    triggerKeys.push(10 /* KeyCode.Space */);
                    if (this.options.compactMode === menu_1.Direction.Right) {
                        triggerKeys.push(17 /* KeyCode.RightArrow */);
                    }
                    else if (this.options.compactMode === menu_1.Direction.Left) {
                        triggerKeys.push(15 /* KeyCode.LeftArrow */);
                    }
                }
                if ((triggerKeys.some(k => event.equals(k)) && !this.isOpen)) {
                    this.focusedMenu = { index: MenuBar.OVERFLOW_INDEX };
                    this.openedViaKeyboard = true;
                    this.focusState = MenubarState.OPEN;
                }
                else {
                    eventHandled = false;
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
            this._register(touch_1.Gesture.addTarget(buttonElement));
            this._register(DOM.addDisposableListener(buttonElement, touch_1.EventType.Tap, (e) => {
                // Ignore this touch if the menu is touched
                if (this.isOpen && this.focusedMenu && this.focusedMenu.holder && DOM.isAncestor(e.initialTarget, this.focusedMenu.holder)) {
                    return;
                }
                this.ignoreNextMouseUp = false;
                this.onMenuTriggered(MenuBar.OVERFLOW_INDEX, true);
                e.preventDefault();
                e.stopPropagation();
            }));
            this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_DOWN, (e) => {
                // Ignore non-left-click
                const mouseEvent = new mouseEvent_1.StandardMouseEvent(DOM.getWindow(buttonElement), e);
                if (!mouseEvent.leftButton) {
                    e.preventDefault();
                    return;
                }
                if (!this.isOpen) {
                    // Open the menu with mouse down and ignore the following mouse up event
                    this.ignoreNextMouseUp = true;
                    this.onMenuTriggered(MenuBar.OVERFLOW_INDEX, true);
                }
                else {
                    this.ignoreNextMouseUp = false;
                }
                e.preventDefault();
                e.stopPropagation();
            }));
            this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_UP, (e) => {
                if (e.defaultPrevented) {
                    return;
                }
                if (!this.ignoreNextMouseUp) {
                    if (this.isFocused) {
                        this.onMenuTriggered(MenuBar.OVERFLOW_INDEX, true);
                    }
                }
                else {
                    this.ignoreNextMouseUp = false;
                }
            }));
            this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_ENTER, () => {
                if (this.isOpen && !this.isCurrentMenu(MenuBar.OVERFLOW_INDEX)) {
                    this.overflowMenu.buttonElement.focus();
                    this.cleanupCustomMenu();
                    this.showCustomMenu(MenuBar.OVERFLOW_INDEX, false);
                }
                else if (this.isFocused && !this.isOpen) {
                    this.focusedMenu = { index: MenuBar.OVERFLOW_INDEX };
                    buttonElement.focus();
                }
            }));
            this.overflowMenu = {
                buttonElement: buttonElement,
                titleElement: titleElement,
                label: 'More',
                actions: []
            };
        }
        updateMenu(menu) {
            const menuToUpdate = this.menus.filter(menuBarMenu => menuBarMenu.label === menu.label);
            if (menuToUpdate && menuToUpdate.length) {
                menuToUpdate[0].actions = menu.actions;
            }
        }
        dispose() {
            super.dispose();
            this.menus.forEach(menuBarMenu => {
                menuBarMenu.titleElement?.remove();
                menuBarMenu.buttonElement?.remove();
            });
            this.overflowMenu.titleElement.remove();
            this.overflowMenu.buttonElement.remove();
            (0, lifecycle_1.dispose)(this.overflowLayoutScheduled);
            this.overflowLayoutScheduled = undefined;
        }
        blur() {
            this.setUnfocusedState();
        }
        getWidth() {
            if (!this.isCompact && this.menus) {
                const left = this.menus[0].buttonElement.getBoundingClientRect().left;
                const right = this.hasOverflow ? this.overflowMenu.buttonElement.getBoundingClientRect().right : this.menus[this.menus.length - 1].buttonElement.getBoundingClientRect().right;
                return right - left;
            }
            return 0;
        }
        getHeight() {
            return this.container.clientHeight;
        }
        toggleFocus() {
            if (!this.isFocused && this.options.visibility !== 'hidden') {
                this.mnemonicsInUse = true;
                this.focusedMenu = { index: this.numMenusShown > 0 ? 0 : MenuBar.OVERFLOW_INDEX };
                this.focusState = MenubarState.FOCUSED;
            }
            else if (!this.isOpen) {
                this.setUnfocusedState();
            }
        }
        updateOverflowAction() {
            if (!this.menus || !this.menus.length) {
                return;
            }
            const overflowMenuOnlyClass = 'overflow-menu-only';
            // Remove overflow only restriction to allow the most space
            this.container.classList.toggle(overflowMenuOnlyClass, false);
            const sizeAvailable = this.container.offsetWidth;
            let currentSize = 0;
            let full = this.isCompact;
            const prevNumMenusShown = this.numMenusShown;
            this.numMenusShown = 0;
            const showableMenus = this.menus.filter(menu => menu.buttonElement !== undefined && menu.titleElement !== undefined);
            for (const menuBarMenu of showableMenus) {
                if (!full) {
                    const size = menuBarMenu.buttonElement.offsetWidth;
                    if (currentSize + size > sizeAvailable) {
                        full = true;
                    }
                    else {
                        currentSize += size;
                        this.numMenusShown++;
                        if (this.numMenusShown > prevNumMenusShown) {
                            menuBarMenu.buttonElement.style.visibility = 'visible';
                        }
                    }
                }
                if (full) {
                    menuBarMenu.buttonElement.style.visibility = 'hidden';
                }
            }
            // If below minimium menu threshold, show the overflow menu only as hamburger menu
            if (this.numMenusShown - 1 <= showableMenus.length / 4) {
                for (const menuBarMenu of showableMenus) {
                    menuBarMenu.buttonElement.style.visibility = 'hidden';
                }
                full = true;
                this.numMenusShown = 0;
                currentSize = 0;
            }
            // Overflow
            if (this.isCompact) {
                this.overflowMenu.actions = [];
                for (let idx = this.numMenusShown; idx < this.menus.length; idx++) {
                    this.overflowMenu.actions.push(new actions_1.SubmenuAction(`menubar.submenu.${this.menus[idx].label}`, this.menus[idx].label, this.menus[idx].actions || []));
                }
                const compactMenuActions = this.options.getCompactMenuActions?.();
                if (compactMenuActions && compactMenuActions.length) {
                    this.overflowMenu.actions.push(new actions_1.Separator());
                    this.overflowMenu.actions.push(...compactMenuActions);
                }
                this.overflowMenu.buttonElement.style.visibility = 'visible';
            }
            else if (full) {
                // Can't fit the more button, need to remove more menus
                while (currentSize + this.overflowMenu.buttonElement.offsetWidth > sizeAvailable && this.numMenusShown > 0) {
                    this.numMenusShown--;
                    const size = showableMenus[this.numMenusShown].buttonElement.offsetWidth;
                    showableMenus[this.numMenusShown].buttonElement.style.visibility = 'hidden';
                    currentSize -= size;
                }
                this.overflowMenu.actions = [];
                for (let idx = this.numMenusShown; idx < showableMenus.length; idx++) {
                    this.overflowMenu.actions.push(new actions_1.SubmenuAction(`menubar.submenu.${showableMenus[idx].label}`, showableMenus[idx].label, showableMenus[idx].actions || []));
                }
                if (this.overflowMenu.buttonElement.nextElementSibling !== showableMenus[this.numMenusShown].buttonElement) {
                    this.overflowMenu.buttonElement.remove();
                    this.container.insertBefore(this.overflowMenu.buttonElement, showableMenus[this.numMenusShown].buttonElement);
                }
                this.overflowMenu.buttonElement.style.visibility = 'visible';
            }
            else {
                this.overflowMenu.buttonElement.remove();
                this.container.appendChild(this.overflowMenu.buttonElement);
                this.overflowMenu.buttonElement.style.visibility = 'hidden';
            }
            // If we are only showing the overflow, add this class to avoid taking up space
            this.container.classList.toggle(overflowMenuOnlyClass, this.numMenusShown === 0);
        }
        updateLabels(titleElement, buttonElement, label) {
            const cleanMenuLabel = (0, menu_1.cleanMnemonic)(label);
            // Update the button label to reflect mnemonics
            if (this.options.enableMnemonics) {
                const cleanLabel = strings.escape(label);
                // This is global so reset it
                menu_1.MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;
                let escMatch = menu_1.MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
                // We can't use negative lookbehind so we match our negative and skip
                while (escMatch && escMatch[1]) {
                    escMatch = menu_1.MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
                }
                const replaceDoubleEscapes = (str) => str.replace(/&amp;&amp;/g, '&amp;');
                if (escMatch) {
                    titleElement.innerText = '';
                    titleElement.append(strings.ltrim(replaceDoubleEscapes(cleanLabel.substr(0, escMatch.index)), ' '), $('mnemonic', { 'aria-hidden': 'true' }, escMatch[3]), strings.rtrim(replaceDoubleEscapes(cleanLabel.substr(escMatch.index + escMatch[0].length)), ' '));
                }
                else {
                    titleElement.innerText = replaceDoubleEscapes(cleanLabel).trim();
                }
            }
            else {
                titleElement.innerText = cleanMenuLabel.replace(/&&/g, '&');
            }
            const mnemonicMatches = menu_1.MENU_MNEMONIC_REGEX.exec(label);
            // Register mnemonics
            if (mnemonicMatches) {
                const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
                if (this.options.enableMnemonics) {
                    buttonElement.setAttribute('aria-keyshortcuts', 'Alt+' + mnemonic.toLocaleLowerCase());
                }
                else {
                    buttonElement.removeAttribute('aria-keyshortcuts');
                }
            }
        }
        update(options) {
            if (options) {
                this.options = options;
            }
            // Don't update while using the menu
            if (this.isFocused) {
                this.updatePending = true;
                return;
            }
            this.menus.forEach(menuBarMenu => {
                if (!menuBarMenu.buttonElement || !menuBarMenu.titleElement) {
                    return;
                }
                this.updateLabels(menuBarMenu.titleElement, menuBarMenu.buttonElement, menuBarMenu.label);
            });
            if (!this.overflowLayoutScheduled) {
                this.overflowLayoutScheduled = DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this.container), () => {
                    this.updateOverflowAction();
                    this.overflowLayoutScheduled = undefined;
                });
            }
            this.setUnfocusedState();
        }
        registerMnemonic(menuIndex, mnemonic) {
            this.mnemonics.set(mnemonic.toLocaleLowerCase(), menuIndex);
        }
        hideMenubar() {
            if (this.container.style.display !== 'none') {
                this.container.style.display = 'none';
                this._onVisibilityChange.fire(false);
            }
        }
        showMenubar() {
            if (this.container.style.display !== 'flex') {
                this.container.style.display = 'flex';
                this._onVisibilityChange.fire(true);
                this.updateOverflowAction();
            }
        }
        get focusState() {
            return this._focusState;
        }
        set focusState(value) {
            if (this._focusState >= MenubarState.FOCUSED && value < MenubarState.FOCUSED) {
                // Losing focus, update the menu if needed
                if (this.updatePending) {
                    this.menuUpdater.schedule();
                    this.updatePending = false;
                }
            }
            if (value === this._focusState) {
                return;
            }
            const isVisible = this.isVisible;
            const isOpen = this.isOpen;
            const isFocused = this.isFocused;
            this._focusState = value;
            switch (value) {
                case MenubarState.HIDDEN:
                    if (isVisible) {
                        this.hideMenubar();
                    }
                    if (isOpen) {
                        this.cleanupCustomMenu();
                    }
                    if (isFocused) {
                        this.focusedMenu = undefined;
                        if (this.focusToReturn) {
                            this.focusToReturn.focus();
                            this.focusToReturn = undefined;
                        }
                    }
                    break;
                case MenubarState.VISIBLE:
                    if (!isVisible) {
                        this.showMenubar();
                    }
                    if (isOpen) {
                        this.cleanupCustomMenu();
                    }
                    if (isFocused) {
                        if (this.focusedMenu) {
                            if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
                                this.overflowMenu.buttonElement.blur();
                            }
                            else {
                                this.menus[this.focusedMenu.index].buttonElement?.blur();
                            }
                        }
                        this.focusedMenu = undefined;
                        if (this.focusToReturn) {
                            this.focusToReturn.focus();
                            this.focusToReturn = undefined;
                        }
                    }
                    break;
                case MenubarState.FOCUSED:
                    if (!isVisible) {
                        this.showMenubar();
                    }
                    if (isOpen) {
                        this.cleanupCustomMenu();
                    }
                    if (this.focusedMenu) {
                        if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
                            this.overflowMenu.buttonElement.focus();
                        }
                        else {
                            this.menus[this.focusedMenu.index].buttonElement?.focus();
                        }
                    }
                    break;
                case MenubarState.OPEN:
                    if (!isVisible) {
                        this.showMenubar();
                    }
                    if (this.focusedMenu) {
                        this.cleanupCustomMenu();
                        this.showCustomMenu(this.focusedMenu.index, this.openedViaKeyboard);
                    }
                    break;
            }
            this._focusState = value;
            this._onFocusStateChange.fire(this.focusState >= MenubarState.FOCUSED);
        }
        get isVisible() {
            return this.focusState >= MenubarState.VISIBLE;
        }
        get isFocused() {
            return this.focusState >= MenubarState.FOCUSED;
        }
        get isOpen() {
            return this.focusState >= MenubarState.OPEN;
        }
        get hasOverflow() {
            return this.isCompact || this.numMenusShown < this.menus.length;
        }
        get isCompact() {
            return this.options.compactMode !== undefined;
        }
        setUnfocusedState() {
            if (this.options.visibility === 'toggle' || this.options.visibility === 'hidden') {
                this.focusState = MenubarState.HIDDEN;
            }
            else if (this.options.visibility === 'classic' && browser.isFullscreen(window_1.mainWindow)) {
                this.focusState = MenubarState.HIDDEN;
            }
            else {
                this.focusState = MenubarState.VISIBLE;
            }
            this.ignoreNextMouseUp = false;
            this.mnemonicsInUse = false;
            this.updateMnemonicVisibility(false);
        }
        focusPrevious() {
            if (!this.focusedMenu || this.numMenusShown === 0) {
                return;
            }
            let newFocusedIndex = (this.focusedMenu.index - 1 + this.numMenusShown) % this.numMenusShown;
            if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
                newFocusedIndex = this.numMenusShown - 1;
            }
            else if (this.focusedMenu.index === 0 && this.hasOverflow) {
                newFocusedIndex = MenuBar.OVERFLOW_INDEX;
            }
            if (newFocusedIndex === this.focusedMenu.index) {
                return;
            }
            if (this.isOpen) {
                this.cleanupCustomMenu();
                this.showCustomMenu(newFocusedIndex);
            }
            else if (this.isFocused) {
                this.focusedMenu.index = newFocusedIndex;
                if (newFocusedIndex === MenuBar.OVERFLOW_INDEX) {
                    this.overflowMenu.buttonElement.focus();
                }
                else {
                    this.menus[newFocusedIndex].buttonElement?.focus();
                }
            }
        }
        focusNext() {
            if (!this.focusedMenu || this.numMenusShown === 0) {
                return;
            }
            let newFocusedIndex = (this.focusedMenu.index + 1) % this.numMenusShown;
            if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
                newFocusedIndex = 0;
            }
            else if (this.focusedMenu.index === this.numMenusShown - 1) {
                newFocusedIndex = MenuBar.OVERFLOW_INDEX;
            }
            if (newFocusedIndex === this.focusedMenu.index) {
                return;
            }
            if (this.isOpen) {
                this.cleanupCustomMenu();
                this.showCustomMenu(newFocusedIndex);
            }
            else if (this.isFocused) {
                this.focusedMenu.index = newFocusedIndex;
                if (newFocusedIndex === MenuBar.OVERFLOW_INDEX) {
                    this.overflowMenu.buttonElement.focus();
                }
                else {
                    this.menus[newFocusedIndex].buttonElement?.focus();
                }
            }
        }
        updateMnemonicVisibility(visible) {
            if (this.menus) {
                this.menus.forEach(menuBarMenu => {
                    if (menuBarMenu.titleElement && menuBarMenu.titleElement.children.length) {
                        const child = menuBarMenu.titleElement.children.item(0);
                        if (child) {
                            child.style.textDecoration = (this.options.alwaysOnMnemonics || visible) ? 'underline' : '';
                        }
                    }
                });
            }
        }
        get mnemonicsInUse() {
            return this._mnemonicsInUse;
        }
        set mnemonicsInUse(value) {
            this._mnemonicsInUse = value;
        }
        get shouldAltKeyFocus() {
            if (platform_1.isMacintosh) {
                return false;
            }
            if (!this.options.disableAltFocus) {
                return true;
            }
            if (this.options.visibility === 'toggle') {
                return true;
            }
            return false;
        }
        get onVisibilityChange() {
            return this._onVisibilityChange.event;
        }
        get onFocusStateChange() {
            return this._onFocusStateChange.event;
        }
        onMenuTriggered(menuIndex, clicked) {
            if (this.isOpen) {
                if (this.isCurrentMenu(menuIndex)) {
                    this.setUnfocusedState();
                }
                else {
                    this.cleanupCustomMenu();
                    this.showCustomMenu(menuIndex, this.openedViaKeyboard);
                }
            }
            else {
                this.focusedMenu = { index: menuIndex };
                this.openedViaKeyboard = !clicked;
                this.focusState = MenubarState.OPEN;
            }
        }
        onModifierKeyToggled(modifierKeyStatus) {
            const allModifiersReleased = !modifierKeyStatus.altKey && !modifierKeyStatus.ctrlKey && !modifierKeyStatus.shiftKey && !modifierKeyStatus.metaKey;
            if (this.options.visibility === 'hidden') {
                return;
            }
            // Prevent alt-key default if the menu is not hidden and we use alt to focus
            if (modifierKeyStatus.event && this.shouldAltKeyFocus) {
                if (keyCodes_1.ScanCodeUtils.toEnum(modifierKeyStatus.event.code) === 159 /* ScanCode.AltLeft */) {
                    modifierKeyStatus.event.preventDefault();
                }
            }
            // Alt key pressed while menu is focused. This should return focus away from the menubar
            if (this.isFocused && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.altKey) {
                this.setUnfocusedState();
                this.mnemonicsInUse = false;
                this.awaitingAltRelease = true;
            }
            // Clean alt key press and release
            if (allModifiersReleased && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.lastKeyReleased === 'alt') {
                if (!this.awaitingAltRelease) {
                    if (!this.isFocused && this.shouldAltKeyFocus) {
                        this.mnemonicsInUse = true;
                        this.focusedMenu = { index: this.numMenusShown > 0 ? 0 : MenuBar.OVERFLOW_INDEX };
                        this.focusState = MenubarState.FOCUSED;
                    }
                    else if (!this.isOpen) {
                        this.setUnfocusedState();
                    }
                }
            }
            // Alt key released
            if (!modifierKeyStatus.altKey && modifierKeyStatus.lastKeyReleased === 'alt') {
                this.awaitingAltRelease = false;
            }
            if (this.options.enableMnemonics && this.menus && !this.isOpen) {
                this.updateMnemonicVisibility((!this.awaitingAltRelease && modifierKeyStatus.altKey) || this.mnemonicsInUse);
            }
        }
        isCurrentMenu(menuIndex) {
            if (!this.focusedMenu) {
                return false;
            }
            return this.focusedMenu.index === menuIndex;
        }
        cleanupCustomMenu() {
            if (this.focusedMenu) {
                // Remove focus from the menus first
                if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
                    this.overflowMenu.buttonElement.focus();
                }
                else {
                    this.menus[this.focusedMenu.index].buttonElement?.focus();
                }
                if (this.focusedMenu.holder) {
                    this.focusedMenu.holder.parentElement?.classList.remove('open');
                    this.focusedMenu.holder.remove();
                }
                this.focusedMenu.widget?.dispose();
                this.focusedMenu = { index: this.focusedMenu.index };
            }
            this.menuDisposables.clear();
        }
        showCustomMenu(menuIndex, selectFirst = true) {
            const actualMenuIndex = menuIndex >= this.numMenusShown ? MenuBar.OVERFLOW_INDEX : menuIndex;
            const customMenu = actualMenuIndex === MenuBar.OVERFLOW_INDEX ? this.overflowMenu : this.menus[actualMenuIndex];
            if (!customMenu.actions || !customMenu.buttonElement || !customMenu.titleElement) {
                return;
            }
            const menuHolder = $('div.menubar-menu-items-holder', { 'title': '' });
            customMenu.buttonElement.classList.add('open');
            const titleBoundingRect = customMenu.titleElement.getBoundingClientRect();
            const titleBoundingRectZoom = DOM.getDomNodeZoomLevel(customMenu.titleElement);
            if (this.options.compactMode === menu_1.Direction.Right) {
                menuHolder.style.top = `${titleBoundingRect.top}px`;
                menuHolder.style.left = `${titleBoundingRect.left + this.container.clientWidth}px`;
            }
            else if (this.options.compactMode === menu_1.Direction.Left) {
                menuHolder.style.top = `${titleBoundingRect.top}px`;
                menuHolder.style.right = `${this.container.clientWidth}px`;
                menuHolder.style.left = 'auto';
            }
            else {
                menuHolder.style.top = `${titleBoundingRect.bottom * titleBoundingRectZoom}px`;
                menuHolder.style.left = `${titleBoundingRect.left * titleBoundingRectZoom}px`;
            }
            customMenu.buttonElement.appendChild(menuHolder);
            const menuOptions = {
                getKeyBinding: this.options.getKeybinding,
                actionRunner: this.actionRunner,
                enableMnemonics: this.options.alwaysOnMnemonics || (this.mnemonicsInUse && this.options.enableMnemonics),
                ariaLabel: customMenu.buttonElement.getAttribute('aria-label') ?? undefined,
                expandDirection: this.isCompact ? this.options.compactMode : menu_1.Direction.Right,
                useEventAsContext: true
            };
            const menuWidget = this.menuDisposables.add(new menu_1.Menu(menuHolder, customMenu.actions, menuOptions, this.menuStyle));
            this.menuDisposables.add(menuWidget.onDidCancel(() => {
                this.focusState = MenubarState.FOCUSED;
            }));
            if (actualMenuIndex !== menuIndex) {
                menuWidget.trigger(menuIndex - this.numMenusShown);
            }
            else {
                menuWidget.focus(selectFirst);
            }
            this.focusedMenu = {
                index: actualMenuIndex,
                holder: menuHolder,
                widget: menuWidget
            };
        }
    }
    exports.MenuBar = MenuBar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL21lbnUvbWVudWJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUF1QmhCLElBQUssWUFLSjtJQUxELFdBQUssWUFBWTtRQUNoQixtREFBTSxDQUFBO1FBQ04scURBQU8sQ0FBQTtRQUNQLHFEQUFPLENBQUE7UUFDUCwrQ0FBSSxDQUFBO0lBQ0wsQ0FBQyxFQUxJLFlBQVksS0FBWixZQUFZLFFBS2hCO0lBRUQsTUFBYSxPQUFRLFNBQVEsc0JBQVU7aUJBRXRCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDLEFBQWIsQ0FBYztRQWtDNUMsWUFBb0IsU0FBc0IsRUFBVSxPQUF3QixFQUFVLFNBQXNCO1lBQzNHLEtBQUssRUFBRSxDQUFDO1lBRFcsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUFVLFlBQU8sR0FBUCxPQUFPLENBQWlCO1lBQVUsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQW5CNUcsZ0JBQWdCO1lBQ1Isb0JBQWUsR0FBWSxLQUFLLENBQUM7WUFDakMsc0JBQWlCLEdBQVksS0FBSyxDQUFDO1lBQ25DLHVCQUFrQixHQUFZLEtBQUssQ0FBQztZQUNwQyxzQkFBaUIsR0FBWSxLQUFLLENBQUM7WUFHbkMsa0JBQWEsR0FBWSxLQUFLLENBQUM7WUFPL0Isa0JBQWEsR0FBVyxDQUFDLENBQUM7WUFDMUIsNEJBQXVCLEdBQTRCLFNBQVMsQ0FBQztZQUVwRCxvQkFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUt4RSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDL0MsSUFBSSxJ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