/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/progressbar/progressbar", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/base/common/types", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/quickInputBox", "vs/platform/quickinput/browser/quickInputList", "vs/platform/quickinput/browser/quickInput", "vs/base/browser/window"], function (require, exports, dom, actionbar_1, button_1, countBadge_1, progressbar_1, cancellation_1, event_1, lifecycle_1, severity_1, types_1, nls_1, quickInput_1, quickInputBox_1, quickInputList_1, quickInput_2, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputController = void 0;
    const $ = dom.$;
    class QuickInputController extends lifecycle_1.Disposable {
        static { this.MAX_WIDTH = 600; } // Max total width of quick input widget
        constructor(options, themeService, layoutService) {
            super();
            this.options = options;
            this.themeService = themeService;
            this.layoutService = layoutService;
            this.enabled = true;
            this.onDidAcceptEmitter = this._register(new event_1.Emitter());
            this.onDidCustomEmitter = this._register(new event_1.Emitter());
            this.onDidTriggerButtonEmitter = this._register(new event_1.Emitter());
            this.keyMods = { ctrlCmd: false, alt: false };
            this.controller = null;
            this.onShowEmitter = this._register(new event_1.Emitter());
            this.onShow = this.onShowEmitter.event;
            this.onHideEmitter = this._register(new event_1.Emitter());
            this.onHide = this.onHideEmitter.event;
            this.backButton = quickInput_2.backButton;
            this.idPrefix = options.idPrefix;
            this.parentElement = options.container;
            this.styles = options.styles;
            this._register(event_1.Event.runAndSubscribe(dom.onDidRegisterWindow, ({ window, disposables }) => this.registerKeyModsListeners(window, disposables), { window: window_1.mainWindow, disposables: this._store }));
            this._register(dom.onWillUnregisterWindow(window => {
                if (this.ui && dom.getWindow(this.ui.container) === window) {
                    // The window this quick input is contained in is about to
                    // close, so we have to make sure to reparent it back to an
                    // existing parent to not loose functionality.
                    // (https://github.com/microsoft/vscode/issues/195870)
                    this.reparentUI(this.layoutService.mainContainer);
                }
            }));
        }
        registerKeyModsListeners(window, disposables) {
            const listener = (e) => {
                this.keyMods.ctrlCmd = e.ctrlKey || e.metaKey;
                this.keyMods.alt = e.altKey;
            };
            for (const event of [dom.EventType.KEY_DOWN, dom.EventType.KEY_UP, dom.EventType.MOUSE_DOWN]) {
                disposables.add(dom.addDisposableListener(window, event, listener, true));
            }
        }
        getUI(showInActiveContainer) {
            if (this.ui) {
                // In order to support aux windows, re-parent the controller
                // if the original event is from a different document
                if (showInActiveContainer) {
                    if (this.parentElement.ownerDocument !== this.layoutService.activeContainer.ownerDocument) {
                        this.reparentUI(this.layoutService.activeContainer);
                    }
                }
                return this.ui;
            }
            const container = dom.append(this.parentElement, $('.quick-input-widget.show-file-icons'));
            container.tabIndex = -1;
            container.style.display = 'none';
            const styleSheet = dom.createStyleSheet(container);
            const titleBar = dom.append(container, $('.quick-input-titlebar'));
            const leftActionBar = this._register(new actionbar_1.ActionBar(titleBar, { hoverDelegate: this.options.hoverDelegate }));
            leftActionBar.domNode.classList.add('quick-input-left-action-bar');
            const title = dom.append(titleBar, $('.quick-input-title'));
            const rightActionBar = this._register(new actionbar_1.ActionBar(titleBar, { hoverDelegate: this.options.hoverDelegate }));
            rightActionBar.domNode.classList.add('quick-input-right-action-bar');
            const headerContainer = dom.append(container, $('.quick-input-header'));
            const checkAll = dom.append(headerContainer, $('input.quick-input-check-all'));
            checkAll.type = 'checkbox';
            checkAll.setAttribute('aria-label', (0, nls_1.localize)('quickInput.checkAll', "Toggle all checkboxes"));
            this._register(dom.addStandardDisposableListener(checkAll, dom.EventType.CHANGE, e => {
                const checked = checkAll.checked;
                list.setAllVisibleChecked(checked);
            }));
            this._register(dom.addDisposableListener(checkAll, dom.EventType.CLICK, e => {
                if (e.x || e.y) { // Avoid 'click' triggered by 'space'...
                    inputBox.setFocus();
                }
            }));
            const description2 = dom.append(headerContainer, $('.quick-input-description'));
            const inputContainer = dom.append(headerContainer, $('.quick-input-and-message'));
            const filterContainer = dom.append(inputContainer, $('.quick-input-filter'));
            const inputBox = this._register(new quickInputBox_1.QuickInputBox(filterContainer, this.styles.inputBox, this.styles.toggle));
            inputBox.setAttribute('aria-describedby', `${this.idPrefix}message`);
            const visibleCountContainer = dom.append(filterContainer, $('.quick-input-visible-count'));
            visibleCountContainer.setAttribute('aria-live', 'polite');
            visibleCountContainer.setAttribute('aria-atomic', 'true');
            const visibleCount = new countBadge_1.CountBadge(visibleCountContainer, { countFormat: (0, nls_1.localize)({ key: 'quickInput.visibleCount', comment: ['This tells the user how many items are shown in a list of items to select from. The items can be anything. Currently not visible, but read by screen readers.'] }, "{0} Results") }, this.styles.countBadge);
            const countContainer = dom.append(filterContainer, $('.quick-input-count'));
            countContainer.setAttribute('aria-live', 'polite');
            const count = new countBadge_1.CountBadge(countContainer, { countFormat: (0, nls_1.localize)({ key: 'quickInput.countSelected', comment: ['This tells the user how many items are selected in a list of items to select from. The items can be anything.'] }, "{0} Selected") }, this.styles.countBadge);
            const okContainer = dom.append(headerContainer, $('.quick-input-action'));
            const ok = this._register(new button_1.Button(okContainer, this.styles.button));
            ok.label = (0, nls_1.localize)('ok', "OK");
            this._register(ok.onDidClick(e => {
                this.onDidAcceptEmitter.fire();
            }));
            const customButtonContainer = dom.append(headerContainer, $('.quick-input-action'));
            const customButton = this._register(new button_1.Button(customButtonContainer, { ...this.styles.button, supportIcons: true }));
            customButton.label = (0, nls_1.localize)('custom', "Custom");
            this._register(customButton.onDidClick(e => {
                this.onDidCustomEmitter.fire();
            }));
            const message = dom.append(inputContainer, $(`#${this.idPrefix}message.quick-input-message`));
            const progressBar = this._register(new progressbar_1.ProgressBar(container, this.styles.progressBar));
            progressBar.getContainer().classList.add('quick-input-progress');
            const widget = dom.append(container, $('.quick-input-html-widget'));
            widget.tabIndex = -1;
            const description1 = dom.append(container, $('.quick-input-description'));
            const listId = this.idPrefix + 'list';
            const list = this._register(new quickInputList_1.QuickInputList(container, listId, this.options, this.themeService));
            inputBox.setAttribute('aria-controls', listId);
            this._register(list.onDidChangeFocus(() => {
                inputBox.setAttribute('aria-activedescendant', list.getActiveDescendant() ?? '');
            }));
            this._register(list.onChangedAllVisibleChecked(checked => {
                checkAll.checked = checked;
            }));
            this._register(list.onChangedVisibleCount(c => {
                visibleCount.setCount(c);
            }));
            this._register(list.onChangedCheckedCount(c => {
                count.setCount(c);
            }));
            this._register(list.onLeave(() => {
                // Defer to avoid the input field reacting to the triggering key.
                setTimeout(() => {
                    inputBox.setFocus();
                    if (this.controller instanceof quickInput_2.QuickPick && this.controller.canSelectMany) {
                        list.clearFocus();
                    }
                }, 0);
            }));
            const focusTracker = dom.trackFocus(container);
            this._register(focusTracker);
            this._register(dom.addDisposableListener(container, dom.EventType.FOCUS, e => {
                // Ignore focus events within container
                if (dom.isAncestor(e.relatedTarget, container)) {
                    return;
                }
                this.previousFocusElement = e.relatedTarget instanceof HTMLElement ? e.relatedTarget : undefined;
            }, true));
            this._register(focusTracker.onDidBlur(() => {
                if (!this.getUI().ignoreFocusOut && !this.options.ignoreFocusOut()) {
                    this.hide(quickInput_1.QuickInputHideReason.Blur);
                }
                this.previousFocusElement = undefined;
            }));
            this._register(dom.addDisposableListener(container, dom.EventType.FOCUS, (e) => {
                inputBox.setFocus();
            }));
            // TODO: Turn into commands instead of handling KEY_DOWN
            this._register(dom.addStandardDisposableListener(container, dom.EventType.KEY_DOWN, (event) => {
                if (dom.isAncestor(event.target, widget)) {
                    return; // Ignore event if target is inside widget to allow the widget to handle the event.
                }
                switch (event.keyCode) {
                    case 3 /* KeyCode.Enter */:
                        dom.EventHelper.stop(event, true);
                        if (this.enabled) {
                            this.onDidAcceptEmitter.fire();
                        }
                        break;
                    case 9 /* KeyCode.Escape */:
                        dom.EventHelper.stop(event, true);
                        this.hide(quickInput_1.QuickInputHideReason.Gesture);
                        break;
                    case 2 /* KeyCode.Tab */:
                        if (!event.altKey && !event.ctrlKey && !event.metaKey) {
                            // detect only visible actions
                            const selectors = [
                                '.quick-input-list .monaco-action-bar .always-visible',
                                '.quick-input-list-entry:hover .monaco-action-bar',
                                '.monaco-list-row.focused .monaco-action-bar'
                            ];
                            if (container.classList.contains('show-checkboxes')) {
                                selectors.push('input');
                            }
                            else {
                                selectors.push('input[type=text]');
                            }
                            if (this.getUI().list.isDisplayed()) {
                                selectors.push('.monaco-list');
                            }
                            // focus links if there are any
                            if (this.getUI().message) {
                                selectors.push('.quick-input-message a');
                            }
                            if (this.getUI().widget) {
                                if (dom.isAncestor(event.target, this.getUI().widget)) {
                                    // let the widget control tab
                                    break;
                                }
                                selectors.push('.quick-input-html-widget');
                            }
                            const stops = container.querySelectorAll(selectors.join(', '));
                            if (event.shiftKey && event.target === stops[0]) {
                                // Clear the focus from the list in order to allow
                                // screen readers to read operations in the input box.
                                dom.EventHelper.stop(event, true);
                                list.clearFocus();
                            }
                            else if (!event.shiftKey && dom.isAncestor(event.target, stops[stops.length - 1])) {
                                dom.EventHelper.stop(event, true);
                                stops[0].focus();
                            }
                        }
                        break;
                    case 10 /* KeyCode.Space */:
                        if (event.ctrlKey) {
                            dom.EventHelper.stop(event, true);
                            this.getUI().list.toggleHover();
                        }
                        break;
                }
            }));
            this.ui = {
                container,
                styleSheet,
                leftActionBar,
                titleBar,
                title,
                description1,
                description2,
                widget,
                rightActionBar,
                checkAll,
                inputContainer,
                filterContainer,
                inputBox,
                visibleCountContainer,
                visibleCount,
                countContainer,
                count,
                okContainer,
                ok,
                message,
                customButtonContainer,
                customButton,
                list,
                progressBar,
                onDidAccept: this.onDidAcceptEmitter.event,
                onDidCustom: this.onDidCustomEmitter.event,
                onDidTriggerButton: this.onDidTriggerButtonEmitter.event,
                ignoreFocusOut: false,
                keyMods: this.keyMods,
                show: controller => this.show(controller),
                hide: () => this.hide(),
                setVisibilities: visibilities => this.setVisibilities(visibilities),
                setEnabled: enabled => this.setEnabled(enabled),
                setContextKey: contextKey => this.options.setContextKey(contextKey),
                linkOpenerDelegate: content => this.options.linkOpenerDelegate(content)
            };
            this.updateStyles();
            return this.ui;
        }
        reparentUI(container) {
            if (this.ui) {
                this.parentElement = container;
                dom.append(this.parentElement, this.ui.container);
            }
        }
        pick(picks, options = {}, token = cancellation_1.CancellationToken.None) {
            return new Promise((doResolve, reject) => {
                let resolve = (result) => {
                    resolve = doResolve;
                    options.onKeyMods?.(input.keyMods);
                    doResolve(result);
                };
                if (token.isCancellationRequested) {
                    resolve(undefined);
                    return;
                }
                const input = this.createQuickPick();
                let activeItem;
                const disposables = [
                    input,
                    input.onDidAccept(() => {
                        if (input.canSelectMany) {
                            resolve(input.selectedItems.slice());
                            input.hide();
                        }
                        else {
                            const result = input.activeItems[0];
                            if (result) {
                                resolve(result);
                                input.hide();
                            }
                        }
                    }),
                    input.onDidChangeActive(items => {
                        const focused = items[0];
                        if (focused && options.onDidFocus) {
                            options.onDidFocus(focused);
                        }
                    }),
                    input.onDidChangeSelection(items => {
                        if (!input.canSelectMany) {
                            const result = items[0];
                            if (result) {
                                resolve(result);
                                input.hide();
                            }
                        }
                    }),
                    input.onDidTriggerItemButton(event => options.onDidTriggerItemButton && options.onDidTriggerItemButton({
                        ...event,
                        removeItem: () => {
                            const index = input.items.indexOf(event.item);
                            if (index !== -1) {
                                const items = input.items.slice();
                                const removed = items.splice(index, 1);
                                const activeItems = input.activeItems.filter(activeItem => activeItem !== removed[0]);
                                const keepScrollPositionBefore = input.keepScrollPosition;
                                input.keepScrollPosition = true;
                                input.items = items;
                                if (activeItems) {
                                    input.activeItems = activeItems;
                                }
                                input.keepScrollPosition = keepScrollPositionBefore;
                            }
                        }
                    })),
                    input.onDidTriggerSeparatorButton(event => options.onDidTriggerSeparatorButton?.(event)),
                    input.onDidChangeValue(value => {
                        if (activeItem && !value && (input.activeItems.length !== 1 || input.activeItems[0] !== activeItem)) {
                            input.activeItems = [activeItem];
                        }
                    }),
                    token.onCancellationRequested(() => {
                        input.hide();
                    }),
                    input.onDidHide(() => {
                        (0, lifecycle_1.dispose)(disposables);
                        resolve(undefined);
                    }),
                ];
                input.title = options.title;
                input.canSelectMany = !!options.canPickMany;
                input.placeholder = options.placeHolder;
                input.ignoreFocusOut = !!options.ignoreFocusLost;
                input.matchOnDescription = !!options.matchOnDescription;
                input.matchOnDetail = !!options.matchOnDetail;
                input.matchOnLabel = (options.matchOnLabel === undefined) || options.matchOnLabel; // default to true
                input.quickNavigate = options.quickNavigate;
                input.hideInput = !!options.hideInput;
                input.contextKey = options.contextKey;
                input.busy = true;
                Promise.all([picks, options.activeItem])
                    .then(([items, _activeItem]) => {
                    activeItem = _activeItem;
                    input.busy = false;
                    input.items = items;
                    if (input.canSelectMany) {
                        input.selectedItems = items.filter(item => item.type !== 'separator' && item.picked);
                    }
                    if (activeItem) {
                        input.activeItems = [activeItem];
                    }
                });
                input.show();
                Promise.resolve(picks).then(undefined, err => {
                    reject(err);
                    input.hide();
                });
            });
        }
        setValidationOnInput(input, validationResult) {
            if (validationResult && (0, types_1.isString)(validationResult)) {
                input.severity = severity_1.default.Error;
                input.validationMessage = validationResult;
            }
            else if (validationResult && !(0, types_1.isString)(validationResult)) {
                input.severity = validationResult.severity;
                input.validationMessage = validationResult.content;
            }
            else {
                input.severity = severity_1.default.Ignore;
                input.validationMessage = undefined;
            }
        }
        input(options = {}, token = cancellation_1.CancellationToken.None) {
            return new Promise((resolve) => {
                if (token.isCancellationRequested) {
                    resolve(undefined);
                    return;
                }
                const input = this.createInputBox();
                const validateInput = options.validateInput || (() => Promise.resolve(undefined));
                const onDidValueChange = event_1.Event.debounce(input.onDidChangeValue, (last, cur) => cur, 100);
                let validationValue = options.value || '';
                let validation = Promise.resolve(validateInput(validationValue));
                const disposables = [
                    input,
                    onDidValueChange(value => {
                        if (value !== validationValue) {
                            validation = Promise.resolve(validateInput(value));
                            validationValue = value;
                        }
                        validation.then(result => {
                            if (value === validationValue) {
                                this.setValidationOnInput(input, result);
                            }
                        });
                    }),
                    input.onDidAccept(() => {
                        const value = input.value;
                        if (value !== validationValue) {
                            validation = Promise.resolve(validateInput(value));
                            validationValue = value;
                        }
                        validation.then(result => {
                            if (!result || (!(0, types_1.isString)(result) && result.severity !== severity_1.default.Error)) {
                                resolve(value);
                                input.hide();
                            }
                            else if (value === validationValue) {
                                this.setValidationOnInput(input, result);
                            }
                        });
                    }),
                    token.onCancellationRequested(() => {
                        input.hide();
                    }),
                    input.onDidHide(() => {
                        (0, lifecycle_1.dispose)(disposables);
                        resolve(undefined);
                    }),
                ];
                input.title = options.title;
                input.value = options.value || '';
                input.valueSelection = options.valueSelection;
                input.prompt = options.prompt;
                input.placeholder = options.placeHolder;
                input.password = !!options.password;
                input.ignoreFocusOut = !!options.ignoreFocusLost;
                input.show();
            });
        }
        createQuickPick() {
            const ui = this.getUI(true);
            return new quickInput_2.QuickPick(ui);
        }
        createInputBox() {
            const ui = this.getUI(true);
            return new quickInput_2.InputBox(ui);
        }
        createQuickWidget() {
            const ui = this.getUI(true);
            return new quickInput_2.QuickWidget(ui);
        }
        show(controller) {
            const ui = this.getUI(true);
            this.onShowEmitter.fire();
            const oldController = this.controller;
            this.controller = controller;
            oldController?.didHide();
            this.setEnabled(true);
            ui.leftActionBar.clear();
            ui.title.textContent = '';
            ui.description1.textContent = '';
            ui.description2.textContent = '';
            dom.reset(ui.widget);
            ui.rightActionBar.clear();
            ui.checkAll.checked = false;
            // ui.inputBox.value = ''; Avoid triggering an event.
            ui.inputBox.placeholder = '';
            ui.inputBox.password = false;
            ui.inputBox.showDecoration(severity_1.default.Ignore);
            ui.visibleCount.setCount(0);
            ui.count.setCount(0);
            dom.reset(ui.message);
            ui.progressBar.stop();
            ui.list.setElements([]);
            ui.list.matchOnDescription = false;
            ui.list.matchOnDetail = false;
            ui.list.matchOnLabel = true;
            ui.list.sortByLabel = true;
            ui.ignoreFocusOut = false;
            ui.inputBox.toggles = undefined;
            const backKeybindingLabel = this.options.backKeybindingLabel();
            quickInput_2.backButton.tooltip = backKeybindingLabel ? (0, nls_1.localize)('quickInput.backWithKeybinding', "Back ({0})", backKeybindingLabel) : (0, nls_1.localize)('quickInput.back', "Back");
            ui.container.style.display = '';
            this.updateLayout();
            ui.inputBox.setFocus();
        }
        isVisible() {
            return !!this.ui && this.ui.container.style.display !== 'none';
        }
        setVisibilities(visibilities) {
            const ui = this.getUI();
            ui.title.style.display = visibilities.title ? '' : 'none';
            ui.description1.style.display = visibilities.description && (visibilities.inputBox || visibilities.checkAll) ? '' : 'none';
            ui.description2.style.display = visibilities.description && !(visibilities.inputBox || visibilities.checkAll) ? '' : 'none';
            ui.checkAll.style.display = visibilities.checkAll ? '' : 'none';
            ui.inputContainer.style.display = visibilities.inputBox ? '' : 'none';
            ui.filterContainer.style.display = visibilities.inputBox ? '' : 'none';
            ui.visibleCountContainer.style.display = visibilities.visibleCount ? '' : 'none';
            ui.countContainer.style.display = visibilities.count ? '' : 'none';
            ui.okContainer.style.display = visibilities.ok ? '' : 'none';
            ui.customButtonContainer.style.display = visibilities.customButton ? '' : 'none';
            ui.message.style.display = visibilities.message ? '' : 'none';
            ui.progressBar.getContainer().style.display = visibilities.progressBar ? '' : 'none';
            ui.list.display(!!visibilities.list);
            ui.container.classList.toggle('show-checkboxes', !!visibilities.checkBox);
            ui.container.classList.toggle('hidden-input', !visibilities.inputBox && !visibilities.description);
            this.updateLayout(); // TODO
        }
        setEnabled(enabled) {
            if (enabled !== this.enabled) {
                this.enabled = enabled;
                for (const item of this.getUI().leftActionBar.viewItems) {
                    item.action.enabled = enabled;
                }
                for (const item of this.getUI().rightActionBar.viewItems) {
                    item.action.enabled = enabled;
                }
                this.getUI().checkAll.disabled = !enabled;
                this.getUI().inputBox.enabled = enabled;
                this.getUI().ok.enabled = enabled;
                this.getUI().list.enabled = enabled;
            }
        }
        hide(reason) {
            const controller = this.controller;
            if (!controller) {
                return;
            }
            const container = this.ui?.container;
            const focusChanged = container && !dom.isAncestorOfActiveElement(container);
            this.controller = null;
            this.onHideEmitter.fire();
            if (container) {
                container.style.display = 'none';
            }
            if (!focusChanged) {
                let currentElement = this.previousFocusElement;
                while (currentElement && !currentElement.offsetParent) {
                    currentElement = currentElement.parentElement ?? undefined;
                }
                if (currentElement?.offsetParent) {
                    currentElement.focus();
                    this.previousFocusElement = undefined;
                }
                else {
                    this.options.returnFocus();
                }
            }
            controller.didHide(reason);
        }
        focus() {
            if (this.isVisible()) {
                const ui = this.getUI();
                if (ui.inputBox.enabled) {
                    ui.inputBox.setFocus();
                }
                else {
                    ui.list.domFocus();
                }
            }
        }
        toggle() {
            if (this.isVisible() && this.controller instanceof quickInput_2.QuickPick && this.controller.canSelectMany) {
                this.getUI().list.toggleCheckbox();
            }
        }
        navigate(next, quickNavigate) {
            if (this.isVisible() && this.getUI().list.isDisplayed()) {
                this.getUI().list.focus(next ? quickInputList_1.QuickInputListFocus.Next : quickInputList_1.QuickInputListFocus.Previous);
                if (quickNavigate && this.controller instanceof quickInput_2.QuickPick) {
                    this.controller.quickNavigate = quickNavigate;
                }
            }
        }
        async accept(keyMods = { alt: false, ctrlCmd: false }) {
            // When accepting the item programmatically, it is important that
            // we update `keyMods` either from the provided set or unset it
            // because the accept did not happen from mouse or keyboard
            // interaction on the list itself
            this.keyMods.alt = keyMods.alt;
            this.keyMods.ctrlCmd = keyMods.ctrlCmd;
            this.onDidAcceptEmitter.fire();
        }
        async back() {
            this.onDidTriggerButtonEmitter.fire(this.backButton);
        }
        async cancel() {
            this.hide();
        }
        layout(dimension, titleBarOffset) {
            this.dimension = dimension;
            this.titleBarOffset = titleBarOffset;
            this.updateLayout();
        }
        updateLayout() {
            if (this.ui && this.isVisible()) {
                this.ui.container.style.top = `${this.titleBarOffset}px`;
                const style = this.ui.container.style;
                const width = Math.min(this.dimension.width * 0.62 /* golden cut */, QuickInputController.MAX_WIDTH);
                style.width = width + 'px';
                style.marginLeft = '-' + (width / 2) + 'px';
                this.ui.inputBox.layout();
                this.ui.list.layout(this.dimension && this.dimension.height * 0.4);
            }
        }
        applyStyles(styles) {
            this.styles = styles;
            this.updateStyles();
        }
        updateStyles() {
            if (this.ui) {
                const { quickInputTitleBackground, quickInputBackground, quickInputForeground, widgetBorder, widgetShadow, } = this.styles.widget;
                this.ui.titleBar.style.backgroundColor = quickInputTitleBackground ?? '';
                this.ui.container.style.backgroundColor = quickInputBackground ?? '';
                this.ui.container.style.color = quickInputForeground ?? '';
                this.ui.container.style.border = widgetBorder ? `1px solid ${widgetBorder}` : '';
                this.ui.container.style.boxShadow = widgetShadow ? `0 0 8px 2px ${widgetShadow}` : '';
                this.ui.list.style(this.styles.list);
                const content = [];
                if (this.styles.pickerGroup.pickerGroupBorder) {
                    content.push(`.quick-input-list .quick-input-list-entry { border-top-color:  ${this.styles.pickerGroup.pickerGroupBorder}; }`);
                }
                if (this.styles.pickerGroup.pickerGroupForeground) {
                    content.push(`.quick-input-list .quick-input-list-separator { color:  ${this.styles.pickerGroup.pickerGroupForeground}; }`);
                }
                if (this.styles.pickerGroup.pickerGroupForeground) {
                    content.push(`.quick-input-list .quick-input-list-separator-as-item { color: var(--vscode-descriptionForeground); }`);
                }
                if (this.styles.keybindingLabel.keybindingLabelBackground ||
                    this.styles.keybindingLabel.keybindingLabelBorder ||
                    this.styles.keybindingLabel.keybindingLabelBottomBorder ||
                    this.styles.keybindingLabel.keybindingLabelShadow ||
                    this.styles.keybindingLabel.keybindingLabelForeground) {
                    content.push('.quick-input-list .monaco-keybinding > .monaco-keybinding-key {');
                    if (this.styles.keybindingLabel.keybindingLabelBackground) {
                        content.push(`background-color: ${this.styles.keybindingLabel.keybindingLabelBackground};`);
                    }
                    if (this.styles.keybindingLabel.keybindingLabelBorder) {
                        // Order matters here. `border-color` must come before `border-bottom-color`.
                        content.push(`border-color: ${this.styles.keybindingLabel.keybindingLabelBorder};`);
                    }
                    if (this.styles.keybindingLabel.keybindingLabelBottomBorder) {
                        content.push(`border-bottom-color: ${this.styles.keybindingLabel.keybindingLabelBottomBorder};`);
                    }
                    if (this.styles.keybindingLabel.keybindingLabelShadow) {
                        content.push(`box-shadow: inset 0 -1px 0 ${this.styles.keybindingLabel.keybindingLabelShadow};`);
                    }
                    if (this.styles.keybindingLabel.keybindingLabelForeground) {
                        content.push(`color: ${this.styles.keybindingLabel.keybindingLabelForeground};`);
                    }
                    content.push('}');
                }
                const newStyles = content.join('\n');
                if (newStyles !== this.ui.styleSheet.textContent) {
                    this.ui.styleSheet.textContent = newStyles;
                }
            }
        }
    }
    exports.QuickInputController = QuickInputController;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3F1aWNraW5wdXQvYnJvd3Nlci9xdWlja0lucHV0Q29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsTUFBYSxvQkFBcUIsU0FBUSxzQkFBVTtpQkFDM0IsY0FBUyxHQUFHLEdBQUcsQUFBTixDQUFPLEdBQUMsd0NBQXdDO1FBeUJqRixZQUFvQixPQUEyQixFQUM3QixZQUEyQixFQUMzQixhQUE2QjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQUhXLFlBQU8sR0FBUCxPQUFPLENBQW9CO1lBQzdCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQzNCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQXJCdkMsWUFBTyxHQUFHLElBQUksQ0FBQztZQUNOLHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3pELHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3pELDhCQUF5QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFCLENBQUMsQ0FBQztZQUN0RixZQUFPLEdBQXdCLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFFOUQsZUFBVSxHQUF1QixJQUFJLENBQUM7WUFLdEMsa0JBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNuRCxXQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFFbkMsa0JB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