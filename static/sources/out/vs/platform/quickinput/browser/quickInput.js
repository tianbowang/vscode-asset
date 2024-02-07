/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/toggle/toggle", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/themables", "vs/nls", "vs/platform/quickinput/common/quickInput", "./quickInputList", "./quickInputUtils", "vs/css!./media/quickInput"], function (require, exports, dom, keyboardEvent_1, toggle_1, arrays_1, async_1, codicons_1, event_1, lifecycle_1, platform_1, severity_1, themables_1, nls_1, quickInput_1, quickInputList_1, quickInputUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputHoverDelegate = exports.QuickWidget = exports.InputBox = exports.QuickPick = exports.backButton = void 0;
    exports.backButton = {
        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.quickInputBack),
        tooltip: (0, nls_1.localize)('quickInput.back', "Back"),
        handle: -1 // TODO
    };
    class QuickInput extends lifecycle_1.Disposable {
        static { this.noPromptMessage = (0, nls_1.localize)('inputModeEntry', "Press 'Enter' to confirm your input or 'Escape' to cancel"); }
        constructor(ui) {
            super();
            this.ui = ui;
            this._widgetUpdated = false;
            this.visible = false;
            this._enabled = true;
            this._busy = false;
            this._ignoreFocusOut = false;
            this._buttons = [];
            this.buttonsUpdated = false;
            this._toggles = [];
            this.togglesUpdated = false;
            this.noValidationMessage = QuickInput.noPromptMessage;
            this._severity = severity_1.default.Ignore;
            this.onDidTriggerButtonEmitter = this._register(new event_1.Emitter());
            this.onDidHideEmitter = this._register(new event_1.Emitter());
            this.onDisposeEmitter = this._register(new event_1.Emitter());
            this.visibleDisposables = this._register(new lifecycle_1.DisposableStore());
            this.onDidTriggerButton = this.onDidTriggerButtonEmitter.event;
            this.onDidHide = this.onDidHideEmitter.event;
            this.onDispose = this.onDisposeEmitter.event;
        }
        get title() {
            return this._title;
        }
        set title(title) {
            this._title = title;
            this.update();
        }
        get description() {
            return this._description;
        }
        set description(description) {
            this._description = description;
            this.update();
        }
        get widget() {
            return this._widget;
        }
        set widget(widget) {
            if (!(widget instanceof HTMLElement)) {
                return;
            }
            if (this._widget !== widget) {
                this._widget = widget;
                this._widgetUpdated = true;
                this.update();
            }
        }
        get step() {
            return this._steps;
        }
        set step(step) {
            this._steps = step;
            this.update();
        }
        get totalSteps() {
            return this._totalSteps;
        }
        set totalSteps(totalSteps) {
            this._totalSteps = totalSteps;
            this.update();
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(enabled) {
            this._enabled = enabled;
            this.update();
        }
        get contextKey() {
            return this._contextKey;
        }
        set contextKey(contextKey) {
            this._contextKey = contextKey;
            this.update();
        }
        get busy() {
            return this._busy;
        }
        set busy(busy) {
            this._busy = busy;
            this.update();
        }
        get ignoreFocusOut() {
            return this._ignoreFocusOut;
        }
        set ignoreFocusOut(ignoreFocusOut) {
            const shouldUpdate = this._ignoreFocusOut !== ignoreFocusOut && !platform_1.isIOS;
            this._ignoreFocusOut = ignoreFocusOut && !platform_1.isIOS;
            if (shouldUpdate) {
                this.update();
            }
        }
        get buttons() {
            return this._buttons;
        }
        set buttons(buttons) {
            this._buttons = buttons;
            this.buttonsUpdated = true;
            this.update();
        }
        get toggles() {
            return this._toggles;
        }
        set toggles(toggles) {
            this._toggles = toggles ?? [];
            this.togglesUpdated = true;
            this.update();
        }
        get validationMessage() {
            return this._validationMessage;
        }
        set validationMessage(validationMessage) {
            this._validationMessage = validationMessage;
            this.update();
        }
        get severity() {
            return this._severity;
        }
        set severity(severity) {
            this._severity = severity;
            this.update();
        }
        show() {
            if (this.visible) {
                return;
            }
            this.visibleDisposables.add(this.ui.onDidTriggerButton(button => {
                if (this.buttons.indexOf(button) !== -1) {
                    this.onDidTriggerButtonEmitter.fire(button);
                }
            }));
            this.ui.show(this);
            // update properties in the controller that get reset in the ui.show() call
            this.visible = true;
            // This ensures the message/prompt gets rendered
            this._lastValidationMessage = undefined;
            // This ensures the input box has the right severity applied
            this._lastSeverity = undefined;
            if (this.buttons.length) {
                // if there are buttons, the ui.show() clears them out of the UI so we should
                // rerender them.
                this.buttonsUpdated = true;
            }
            if (this.toggles.length) {
                // if there are toggles, the ui.show() clears them out of the UI so we should
                // rerender them.
                this.togglesUpdated = true;
            }
            this.update();
        }
        hide() {
            if (!this.visible) {
                return;
            }
            this.ui.hide();
        }
        didHide(reason = quickInput_1.QuickInputHideReason.Other) {
            this.visible = false;
            this.visibleDisposables.clear();
            this.onDidHideEmitter.fire({ reason });
        }
        update() {
            if (!this.visible) {
                return;
            }
            const title = this.getTitle();
            if (title && this.ui.title.textContent !== title) {
                this.ui.title.textContent = title;
            }
            else if (!title && this.ui.title.innerHTML !== '&nbsp;') {
                this.ui.title.innerText = '\u00a0';
            }
            const description = this.getDescription();
            if (this.ui.description1.textContent !== description) {
                this.ui.description1.textContent = description;
            }
            if (this.ui.description2.textContent !== description) {
                this.ui.description2.textContent = description;
            }
            if (this._widgetUpdated) {
                this._widgetUpdated = false;
                if (this._widget) {
                    dom.reset(this.ui.widget, this._widget);
                }
                else {
                    dom.reset(this.ui.widget);
                }
            }
            if (this.busy && !this.busyDelay) {
                this.busyDelay = new async_1.TimeoutTimer();
                this.busyDelay.setIfNotSet(() => {
                    if (this.visible) {
                        this.ui.progressBar.infinite();
                    }
                }, 800);
            }
            if (!this.busy && this.busyDelay) {
                this.ui.progressBar.stop();
                this.busyDelay.cancel();
                this.busyDelay = undefined;
            }
            if (this.buttonsUpdated) {
                this.buttonsUpdated = false;
                this.ui.leftActionBar.clear();
                const leftButtons = this.buttons
                    .filter(button => button === exports.backButton)
                    .map((button, index) => (0, quickInputUtils_1.quickInputButtonToAction)(button, `id-${index}`, async () => this.onDidTriggerButtonEmitter.fire(button)));
                this.ui.leftActionBar.push(leftButtons, { icon: true, label: false });
                this.ui.rightActionBar.clear();
                const rightButtons = this.buttons
                    .filter(button => button !== exports.backButton)
                    .map((button, index) => (0, quickInputUtils_1.quickInputButtonToAction)(button, `id-${index}`, async () => this.onDidTriggerButtonEmitter.fire(button)));
                this.ui.rightActionBar.push(rightButtons, { icon: true, label: false });
            }
            if (this.togglesUpdated) {
                this.togglesUpdated = false;
                // HACK: Filter out toggles here that are not concrete Toggle objects. This is to workaround
                // a layering issue as quick input's interface is in common but Toggle is in browser and
                // it requires a HTMLElement on its interface
                const concreteToggles = this.toggles?.filter(opts => opts instanceof toggle_1.Toggle) ?? [];
                this.ui.inputBox.toggles = concreteToggles;
            }
            this.ui.ignoreFocusOut = this.ignoreFocusOut;
            this.ui.setEnabled(this.enabled);
            this.ui.setContextKey(this.contextKey);
            const validationMessage = this.validationMessage || this.noValidationMessage;
            if (this._lastValidationMessage !== validationMessage) {
                this._lastValidationMessage = validationMessage;
                dom.reset(this.ui.message);
                (0, quickInputUtils_1.renderQuickInputDescription)(validationMessage, this.ui.message, {
                    callback: (content) => {
                        this.ui.linkOpenerDelegate(content);
                    },
                    disposables: this.visibleDisposables,
                });
            }
            if (this._lastSeverity !== this.severity) {
                this._lastSeverity = this.severity;
                this.showMessageDecoration(this.severity);
            }
        }
        getTitle() {
            if (this.title && this.step) {
                return `${this.title} (${this.getSteps()})`;
            }
            if (this.title) {
                return this.title;
            }
            if (this.step) {
                return this.getSteps();
            }
            return '';
        }
        getDescription() {
            return this.description || '';
        }
        getSteps() {
            if (this.step && this.totalSteps) {
                return (0, nls_1.localize)('quickInput.steps', "{0}/{1}", this.step, this.totalSteps);
            }
            if (this.step) {
                return String(this.step);
            }
            return '';
        }
        showMessageDecoration(severity) {
            this.ui.inputBox.showDecoration(severity);
            if (severity !== severity_1.default.Ignore) {
                const styles = this.ui.inputBox.stylesForType(severity);
                this.ui.message.style.color = styles.foreground ? `${styles.foreground}` : '';
                this.ui.message.style.backgroundColor = styles.background ? `${styles.background}` : '';
                this.ui.message.style.border = styles.border ? `1px solid ${styles.border}` : '';
                this.ui.message.style.marginBottom = '-2px';
            }
            else {
                this.ui.message.style.color = '';
                this.ui.message.style.backgroundColor = '';
                this.ui.message.style.border = '';
                this.ui.message.style.marginBottom = '';
            }
        }
        dispose() {
            this.hide();
            this.onDisposeEmitter.fire();
            super.dispose();
        }
    }
    class QuickPick extends QuickInput {
        constructor() {
            super(...arguments);
            this._value = '';
            this.onDidChangeValueEmitter = this._register(new event_1.Emitter());
            this.onWillAcceptEmitter = this._register(new event_1.Emitter());
            this.onDidAcceptEmitter = this._register(new event_1.Emitter());
            this.onDidCustomEmitter = this._register(new event_1.Emitter());
            this._items = [];
            this.itemsUpdated = false;
            this._canSelectMany = false;
            this._canAcceptInBackground = false;
            this._matchOnDescription = false;
            this._matchOnDetail = false;
            this._matchOnLabel = true;
            this._matchOnLabelMode = 'fuzzy';
            this._sortByLabel = true;
            this._keepScrollPosition = false;
            this._itemActivation = quickInput_1.ItemActivation.FIRST;
            this._activeItems = [];
            this.activeItemsUpdated = false;
            this.activeItemsToConfirm = [];
            this.onDidChangeActiveEmitter = this._register(new event_1.Emitter());
            this._selectedItems = [];
            this.selectedItemsUpdated = false;
            this.selectedItemsToConfirm = [];
            this.onDidChangeSelectionEmitter = this._register(new event_1.Emitter());
            this.onDidTriggerItemButtonEmitter = this._register(new event_1.Emitter());
            this.onDidTriggerSeparatorButtonEmitter = this._register(new event_1.Emitter());
            this.valueSelectionUpdated = true;
            this._ok = 'default';
            this._customButton = false;
            this.filterValue = (value) => value;
            this.onDidChangeValue = this.onDidChangeValueEmitter.event;
            this.onWillAccept = this.onWillAcceptEmitter.event;
            this.onDidAccept = this.onDidAcceptEmitter.event;
            this.onDidCustom = this.onDidCustomEmitter.event;
            this.onDidChangeActive = this.onDidChangeActiveEmitter.event;
            this.onDidChangeSelection = this.onDidChangeSelectionEmitter.event;
            this.onDidTriggerItemButton = this.onDidTriggerItemButtonEmitter.event;
            this.onDidTriggerSeparatorButton = this.onDidTriggerSeparatorButtonEmitter.event;
        }
        static { this.DEFAULT_ARIA_LABEL = (0, nls_1.localize)('quickInputBox.ariaLabel', "Type to narrow down results."); }
        get quickNavigate() {
            return this._quickNavigate;
        }
        set quickNavigate(quickNavigate) {
            this._quickNavigate = quickNavigate;
            this.update();
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this.doSetValue(value);
        }
        doSetValue(value, skipUpdate) {
            if (this._value !== value) {
                this._value = value;
                if (!skipUpdate) {
                    this.update();
                }
                if (this.visible) {
                    const didFilter = this.ui.list.filter(this.filterValue(this._value));
                    if (didFilter) {
                        this.trySelectFirst();
                    }
                }
                this.onDidChangeValueEmitter.fire(this._value);
            }
        }
        set ariaLabel(ariaLabel) {
            this._ariaLabel = ariaLabel;
            this.update();
        }
        get ariaLabel() {
            return this._ariaLabel;
        }
        get placeholder() {
            return this._placeholder;
        }
        set placeholder(placeholder) {
            this._placeholder = placeholder;
            this.update();
        }
        get items() {
            return this._items;
        }
        get scrollTop() {
            return this.ui.list.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.ui.list.scrollTop = scrollTop;
        }
        set items(items) {
            this._items = items;
            this.itemsUpdated = true;
            this.update();
        }
        get canSelectMany() {
            return this._canSelectMany;
        }
        set canSelectMany(canSelectMany) {
            this._canSelectMany = canSelectMany;
            this.update();
        }
        get canAcceptInBackground() {
            return this._canAcceptInBackground;
        }
        set canAcceptInBackground(canAcceptInBackground) {
            this._canAcceptInBackground = canAcceptInBackground;
        }
        get matchOnDescription() {
            return this._matchOnDescription;
        }
        set matchOnDescription(matchOnDescription) {
            this._matchOnDescription = matchOnDescription;
            this.update();
        }
        get matchOnDetail() {
            return this._matchOnDetail;
        }
        set matchOnDetail(matchOnDetail) {
            this._matchOnDetail = matchOnDetail;
            this.update();
        }
        get matchOnLabel() {
            return this._matchOnLabel;
        }
        set matchOnLabel(matchOnLabel) {
            this._matchOnLabel = matchOnLabel;
            this.update();
        }
        get matchOnLabelMode() {
            return this._matchOnLabelMode;
        }
        set matchOnLabelMode(matchOnLabelMode) {
            this._matchOnLabelMode = matchOnLabelMode;
            this.update();
        }
        get sortByLabel() {
            return this._sortByLabel;
        }
        set sortByLabel(sortByLabel) {
            this._sortByLabel = sortByLabel;
            this.update();
        }
        get keepScrollPosition() {
            return this._keepScrollPosition;
        }
        set keepScrollPosition(keepScrollPosition) {
            this._keepScrollPosition = keepScrollPosition;
        }
        get itemActivation() {
            return this._itemActivation;
        }
        set itemActivation(itemActivation) {
            this._itemActivation = itemActivation;
        }
        get activeItems() {
            return this._activeItems;
        }
        set activeItems(activeItems) {
            this._activeItems = activeItems;
            this.activeItemsUpdated = true;
            this.update();
        }
        get selectedItems() {
            return this._selectedItems;
        }
        set selectedItems(selectedItems) {
            this._selectedItems = selectedItems;
            this.selectedItemsUpdated = true;
            this.update();
        }
        get keyMods() {
            if (this._quickNavigate) {
                // Disable keyMods when quick navigate is enabled
                // because in this model the interaction is purely
                // keyboard driven and Ctrl/Alt are typically
                // pressed and hold during this interaction.
                return quickInput_1.NO_KEY_MODS;
            }
            return this.ui.keyMods;
        }
        set valueSelection(valueSelection) {
            this._valueSelection = valueSelection;
            this.valueSelectionUpdated = true;
            this.update();
        }
        get customButton() {
            return this._customButton;
        }
        set customButton(showCustomButton) {
            this._customButton = showCustomButton;
            this.update();
        }
        get customLabel() {
            return this._customButtonLabel;
        }
        set customLabel(label) {
            this._customButtonLabel = label;
            this.update();
        }
        get customHover() {
            return this._customButtonHover;
        }
        set customHover(hover) {
            this._customButtonHover = hover;
            this.update();
        }
        get ok() {
            return this._ok;
        }
        set ok(showOkButton) {
            this._ok = showOkButton;
            this.update();
        }
        inputHasFocus() {
            return this.visible ? this.ui.inputBox.hasFocus() : false;
        }
        focusOnInput() {
            this.ui.inputBox.setFocus();
        }
        get hideInput() {
            return !!this._hideInput;
        }
        set hideInput(hideInput) {
            this._hideInput = hideInput;
            this.update();
        }
        get hideCountBadge() {
            return !!this._hideCountBadge;
        }
        set hideCountBadge(hideCountBadge) {
            this._hideCountBadge = hideCountBadge;
            this.update();
        }
        get hideCheckAll() {
            return !!this._hideCheckAll;
        }
        set hideCheckAll(hideCheckAll) {
            this._hideCheckAll = hideCheckAll;
            this.update();
        }
        trySelectFirst() {
            if (!this.canSelectMany) {
                this.ui.list.focus(quickInputList_1.QuickInputListFocus.First);
            }
        }
        show() {
            if (!this.visible) {
                this.visibleDisposables.add(this.ui.inputBox.onDidChange(value => {
                    this.doSetValue(value, true /* skip update since this originates from the UI */);
                }));
                this.visibleDisposables.add((this._hideInput ? this.ui.list : this.ui.inputBox).onKeyDown((event) => {
                    switch (event.keyCode) {
                        case 18 /* KeyCode.DownArrow */:
                            this.ui.list.focus(quickInputList_1.QuickInputListFocus.Next);
                            if (this.canSelectMany) {
                                this.ui.list.domFocus();
                            }
                            dom.EventHelper.stop(event, true);
                            break;
                        case 16 /* KeyCode.UpArrow */:
                            if (this.ui.list.getFocusedElements().length) {
                                this.ui.list.focus(quickInputList_1.QuickInputListFocus.Previous);
                            }
                            else {
                                this.ui.list.focus(quickInputList_1.QuickInputListFocus.Last);
                            }
                            if (this.canSelectMany) {
                                this.ui.list.domFocus();
                            }
                            dom.EventHelper.stop(event, true);
                            break;
                        case 12 /* KeyCode.PageDown */:
                            this.ui.list.focus(quickInputList_1.QuickInputListFocus.NextPage);
                            if (this.canSelectMany) {
                                this.ui.list.domFocus();
                            }
                            dom.EventHelper.stop(event, true);
                            break;
                        case 11 /* KeyCode.PageUp */:
                            this.ui.list.focus(quickInputList_1.QuickInputListFocus.PreviousPage);
                            if (this.canSelectMany) {
                                this.ui.list.domFocus();
                            }
                            dom.EventHelper.stop(event, true);
                            break;
                        case 17 /* KeyCode.RightArrow */:
                            if (!this._canAcceptInBackground) {
                                return; // needs to be enabled
                            }
                            if (!this.ui.inputBox.isSelectionAtEnd()) {
                                return; // ensure input box selection at end
                            }
                            if (this.activeItems[0]) {
                                this._selectedItems = [this.activeItems[0]];
                                this.onDidChangeSelectionEmitter.fire(this.selectedItems);
                                this.handleAccept(true);
                            }
                            break;
                        case 14 /* KeyCode.Home */:
                            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
                                this.ui.list.focus(quickInputList_1.QuickInputListFocus.First);
                                dom.EventHelper.stop(event, true);
                            }
                            break;
                        case 13 /* KeyCode.End */:
                            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
                                this.ui.list.focus(quickInputList_1.QuickInputListFocus.Last);
                                dom.EventHelper.stop(event, true);
                            }
                            break;
                    }
                }));
                this.visibleDisposables.add(this.ui.onDidAccept(() => {
                    if (this.canSelectMany) {
                        // if there are no checked elements, it means that an onDidChangeSelection never fired to overwrite
                        // `_selectedItems`. In that case, we should emit one with an empty array to ensure that
                        // `.selectedItems` is up to date.
                        if (!this.ui.list.getCheckedElements().length) {
                            this._selectedItems = [];
                            this.onDidChangeSelectionEmitter.fire(this.selectedItems);
                        }
                    }
                    else if (this.activeItems[0]) {
                        // For single-select, we set `selectedItems` to the item that was accepted.
                        this._selectedItems = [this.activeItems[0]];
                        this.onDidChangeSelectionEmitter.fire(this.selectedItems);
                    }
                    this.handleAccept(false);
                }));
                this.visibleDisposables.add(this.ui.onDidCustom(() => {
                    this.onDidCustomEmitter.fire();
                }));
                this.visibleDisposables.add(this.ui.list.onDidChangeFocus(focusedItems => {
                    if (this.activeItemsUpdated) {
                        return; // Expect another event.
                    }
                    if (this.activeItemsToConfirm !== this._activeItems && (0, arrays_1.equals)(focusedItems, this._activeItems, (a, b) => a === b)) {
                        return;
                    }
                    this._activeItems = focusedItems;
                    this.onDidChangeActiveEmitter.fire(focusedItems);
                }));
                this.visibleDisposables.add(this.ui.list.onDidChangeSelection(({ items: selectedItems, event }) => {
                    if (this.canSelectMany) {
                        if (selectedItems.length) {
                            this.ui.list.setSelectedElements([]);
                        }
                        return;
                    }
                    if (this.selectedItemsToConfirm !== this._selectedItems && (0, arrays_1.equals)(selectedItems, this._selectedItems, (a, b) => a === b)) {
                        return;
                    }
                    this._selectedItems = selectedItems;
                    this.onDidChangeSelectionEmitter.fire(selectedItems);
                    if (selectedItems.length) {
                        this.handleAccept(dom.isMouseEvent(event) && event.button === 1 /* mouse middle click */);
                    }
                }));
                this.visibleDisposables.add(this.ui.list.onChangedCheckedElements(checkedItems => {
                    if (!this.canSelectMany) {
                        return;
                    }
                    if (this.selectedItemsToConfirm !== this._selectedItems && (0, arrays_1.equals)(checkedItems, this._selectedItems, (a, b) => a === b)) {
                        return;
                    }
                    this._selectedItems = checkedItems;
                    this.onDidChangeSelectionEmitter.fire(checkedItems);
                }));
                this.visibleDisposables.add(this.ui.list.onButtonTriggered(event => this.onDidTriggerItemButtonEmitter.fire(event)));
                this.visibleDisposables.add(this.ui.list.onSeparatorButtonTriggered(event => this.onDidTriggerSeparatorButtonEmitter.fire(event)));
                this.visibleDisposables.add(this.registerQuickNavigation());
                this.valueSelectionUpdated = true;
            }
            super.show(); // TODO: Why have show() bubble up while update() trickles down?
        }
        handleAccept(inBackground) {
            // Figure out veto via `onWillAccept` event
            let veto = false;
            this.onWillAcceptEmitter.fire({ veto: () => veto = true });
            // Continue with `onDidAccept` if no veto
            if (!veto) {
                this.onDidAcceptEmitter.fire({ inBackground });
            }
        }
        registerQuickNavigation() {
            return dom.addDisposableListener(this.ui.container, dom.EventType.KEY_UP, e => {
                if (this.canSelectMany || !this._quickNavigate) {
                    return;
                }
                const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                const keyCode = keyboardEvent.keyCode;
                // Select element when keys are pressed that signal it
                const quickNavKeys = this._quickNavigate.keybindings;
                const wasTriggerKeyPressed = quickNavKeys.some(k => {
                    const chords = k.getChords();
                    if (chords.length > 1) {
                        return false;
                    }
                    if (chords[0].shiftKey && keyCode === 4 /* KeyCode.Shift */) {
                        if (keyboardEvent.ctrlKey || keyboardEvent.altKey || keyboardEvent.metaKey) {
                            return false; // this is an optimistic check for the shift key being used to navigate back in quick input
                        }
                        return true;
                    }
                    if (chords[0].altKey && keyCode === 6 /* KeyCode.Alt */) {
                        return true;
                    }
                    if (chords[0].ctrlKey && keyCode === 5 /* KeyCode.Ctrl */) {
                        return true;
                    }
                    if (chords[0].metaKey && keyCode === 57 /* KeyCode.Meta */) {
                        return true;
                    }
                    return false;
                });
                if (wasTriggerKeyPressed) {
                    if (this.activeItems[0]) {
                        this._selectedItems = [this.activeItems[0]];
                        this.onDidChangeSelectionEmitter.fire(this.selectedItems);
                        this.handleAccept(false);
                    }
                    // Unset quick navigate after press. It is only valid once
                    // and should not result in any behaviour change afterwards
                    // if the picker remains open because there was no active item
                    this._quickNavigate = undefined;
                }
            });
        }
        update() {
            if (!this.visible) {
                return;
            }
            // store the scrollTop before it is reset
            const scrollTopBefore = this.keepScrollPosition ? this.scrollTop : 0;
            const hasDescription = !!this.description;
            const visibilities = {
                title: !!this.title || !!this.step || !!this.buttons.length,
                description: hasDescription,
                checkAll: this.canSelectMany && !this._hideCheckAll,
                checkBox: this.canSelectMany,
                inputBox: !this._hideInput,
                progressBar: !this._hideInput || hasDescription,
                visibleCount: true,
                count: this.canSelectMany && !this._hideCountBadge,
                ok: this.ok === 'default' ? this.canSelectMany : this.ok,
                list: true,
                message: !!this.validationMessage,
                customButton: this.customButton
            };
            this.ui.setVisibilities(visibilities);
            super.update();
            if (this.ui.inputBox.value !== this.value) {
                this.ui.inputBox.value = this.value;
            }
            if (this.valueSelectionUpdated) {
                this.valueSelectionUpdated = false;
                this.ui.inputBox.select(this._valueSelection && { start: this._valueSelection[0], end: this._valueSelection[1] });
            }
            if (this.ui.inputBox.placeholder !== (this.placeholder || '')) {
                this.ui.inputBox.placeholder = (this.placeholder || '');
            }
            let ariaLabel = this.ariaLabel;
            // Only set aria label to the input box placeholder if we actually have an input box.
            if (!ariaLabel && visibilities.inputBox) {
                ariaLabel = this.placeholder || QuickPick.DEFAULT_ARIA_LABEL;
                // If we have a title, include it in the aria label.
                if (this.title) {
                    ariaLabel += ` - ${this.title}`;
                }
            }
            if (this.ui.list.ariaLabel !== ariaLabel) {
                this.ui.list.ariaLabel = ariaLabel ?? null;
            }
            this.ui.list.matchOnDescription = this.matchOnDescription;
            this.ui.list.matchOnDetail = this.matchOnDetail;
            this.ui.list.matchOnLabel = this.matchOnLabel;
            this.ui.list.matchOnLabelMode = this.matchOnLabelMode;
            this.ui.list.sortByLabel = this.sortByLabel;
            if (this.itemsUpdated) {
                this.itemsUpdated = false;
                this.ui.list.setElements(this.items);
                this.ui.list.filter(this.filterValue(this.ui.inputBox.value));
                this.ui.checkAll.checked = this.ui.list.getAllVisibleChecked();
                this.ui.visibleCount.setCount(this.ui.list.getVisibleCount());
                this.ui.count.setCount(this.ui.list.getCheckedCount());
                switch (this._itemActivation) {
                    case quickInput_1.ItemActivation.NONE:
                        this._itemActivation = quickInput_1.ItemActivation.FIRST; // only valid once, then unset
                        break;
                    case quickInput_1.ItemActivation.SECOND:
                        this.ui.list.focus(quickInputList_1.QuickInputListFocus.Second);
                        this._itemActivation = quickInput_1.ItemActivation.FIRST; // only valid once, then unset
                        break;
                    case quickInput_1.ItemActivation.LAST:
                        this.ui.list.focus(quickInputList_1.QuickInputListFocus.Last);
                        this._itemActivation = quickInput_1.ItemActivation.FIRST; // only valid once, then unset
                        break;
                    default:
                        this.trySelectFirst();
                        break;
                }
            }
            if (this.ui.container.classList.contains('show-checkboxes') !== !!this.canSelectMany) {
                if (this.canSelectMany) {
                    this.ui.list.clearFocus();
                }
                else {
                    this.trySelectFirst();
                }
            }
            if (this.activeItemsUpdated) {
                this.activeItemsUpdated = false;
                this.activeItemsToConfirm = this._activeItems;
                this.ui.list.setFocusedElements(this.activeItems);
                if (this.activeItemsToConfirm === this._activeItems) {
                    this.activeItemsToConfirm = null;
                }
            }
            if (this.selectedItemsUpdated) {
                this.selectedItemsUpdated = false;
                this.selectedItemsToConfirm = this._selectedItems;
                if (this.canSelectMany) {
                    this.ui.list.setCheckedElements(this.selectedItems);
                }
                else {
                    this.ui.list.setSelectedElements(this.selectedItems);
                }
                if (this.selectedItemsToConfirm === this._selectedItems) {
                    this.selectedItemsToConfirm = null;
                }
            }
            this.ui.customButton.label = this.customLabel || '';
            this.ui.customButton.element.title = this.customHover || '';
            if (!visibilities.inputBox) {
                // we need to move focus into the tree to detect keybindings
                // properly when the input box is not visible (quick nav)
                this.ui.list.domFocus();
                // Focus the first element in the list if multiselect is enabled
                if (this.canSelectMany) {
                    this.ui.list.focus(quickInputList_1.QuickInputListFocus.First);
                }
            }
            // Set the scroll position to what it was before updating the items
            if (this.keepScrollPosition) {
                this.scrollTop = scrollTopBefore;
            }
        }
    }
    exports.QuickPick = QuickPick;
    class InputBox extends QuickInput {
        constructor() {
            super(...arguments);
            this._value = '';
            this.valueSelectionUpdated = true;
            this._password = false;
            this.onDidValueChangeEmitter = this._register(new event_1.Emitter());
            this.onDidAcceptEmitter = this._register(new event_1.Emitter());
            this.onDidChangeValue = this.onDidValueChangeEmitter.event;
            this.onDidAccept = this.onDidAcceptEmitter.event;
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value || '';
            this.update();
        }
        set valueSelection(valueSelection) {
            this._valueSelection = valueSelection;
            this.valueSelectionUpdated = true;
            this.update();
        }
        get placeholder() {
            return this._placeholder;
        }
        set placeholder(placeholder) {
            this._placeholder = placeholder;
            this.update();
        }
        get password() {
            return this._password;
        }
        set password(password) {
            this._password = password;
            this.update();
        }
        get prompt() {
            return this._prompt;
        }
        set prompt(prompt) {
            this._prompt = prompt;
            this.noValidationMessage = prompt
                ? (0, nls_1.localize)('inputModeEntryDescription', "{0} (Press 'Enter' to confirm or 'Escape' to cancel)", prompt)
                : QuickInput.noPromptMessage;
            this.update();
        }
        show() {
            if (!this.visible) {
                this.visibleDisposables.add(this.ui.inputBox.onDidChange(value => {
                    if (value === this.value) {
                        return;
                    }
                    this._value = value;
                    this.onDidValueChangeEmitter.fire(value);
                }));
                this.visibleDisposables.add(this.ui.onDidAccept(() => this.onDidAcceptEmitter.fire()));
                this.valueSelectionUpdated = true;
            }
            super.show();
        }
        update() {
            if (!this.visible) {
                return;
            }
            this.ui.container.classList.remove('hidden-input');
            const visibilities = {
                title: !!this.title || !!this.step || !!this.buttons.length,
                description: !!this.description || !!this.step,
                inputBox: true,
                message: true,
                progressBar: true
            };
            this.ui.setVisibilities(visibilities);
            super.update();
            if (this.ui.inputBox.value !== this.value) {
                this.ui.inputBox.value = this.value;
            }
            if (this.valueSelectionUpdated) {
                this.valueSelectionUpdated = false;
                this.ui.inputBox.select(this._valueSelection && { start: this._valueSelection[0], end: this._valueSelection[1] });
            }
            if (this.ui.inputBox.placeholder !== (this.placeholder || '')) {
                this.ui.inputBox.placeholder = (this.placeholder || '');
            }
            if (this.ui.inputBox.password !== this.password) {
                this.ui.inputBox.password = this.password;
            }
        }
    }
    exports.InputBox = InputBox;
    class QuickWidget extends QuickInput {
        update() {
            if (!this.visible) {
                return;
            }
            const visibilities = {
                title: !!this.title || !!this.step || !!this.buttons.length,
                description: !!this.description || !!this.step
            };
            this.ui.setVisibilities(visibilities);
            super.update();
        }
    }
    exports.QuickWidget = QuickWidget;
    class QuickInputHoverDelegate {
        get delay() {
            if (Date.now() - this.lastHoverHideTime < 200) {
                return 0; // show instantly when a hover was recently shown
            }
            return this.configurationService.getValue('workbench.hover.delay');
        }
        constructor(configurationService, hoverService) {
            this.configurationService = configurationService;
            this.hoverService = hoverService;
            this.lastHoverHideTime = 0;
            this.placement = 'element';
        }
        showHover(options, focus) {
            // Only show the hover hint if the content is of a decent size
            const showHoverHint = (options.content instanceof HTMLElement
                ? options.content.textContent ?? ''
                : typeof options.content === 'string'
                    ? options.content
                    : options.content.value).length > 20;
            return this.hoverService.showHover({
                ...options,
                persistence: {
                    hideOnKeyDown: false,
                },
                appearance: {
                    showHoverHint,
                    skipFadeInAnimation: true,
                },
            }, focus);
        }
        onDidHideHover() {
            this.lastHoverHideTime = Date.now();
        }
    }
    exports.QuickInputHoverDelegate = QuickInputHoverDelegate;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcXVpY2tpbnB1dC9icm93c2VyL3F1aWNrSW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNkVuRixRQUFBLFVBQVUsR0FBRztRQUN6QixTQUFTLEVBQUUscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxjQUFjLENBQUM7UUFDeEQsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQztRQUM1QyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTztLQUNsQixDQUFDO0lBdURGLE1BQU0sVUFBVyxTQUFRLHNCQUFVO2lCQUNSLG9CQUFlLEdBQUcsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsMkRBQTJELENBQUMsQUFBMUYsQ0FBMkY7UUE4QnBJLFlBQ1csRUFBZ0I7WUFFMUIsS0FBSyxFQUFFLENBQUM7WUFGRSxPQUFFLEdBQUYsRUFBRSxDQUFjO1lBMUJuQixtQkFBYyxHQUFHLEtBQUssQ0FBQztZQUdyQixZQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLGFBQVEsR0FBRyxJQUFJLENBQUM7WUFFaEIsVUFBSyxHQUFHLEtBQUssQ0FBQztZQUNkLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLGFBQVEsR0FBd0IsRUFBRSxDQUFDO1lBQ25DLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLGFBQVEsR0FBd0IsRUFBRSxDQUFDO1lBQ25DLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLHdCQUFtQixHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUM7WUFHbkQsY0FBUyxHQUFhLGtCQUFRLENBQUMsTUFBTSxDQUFDO1lBRTdCLDhCQUF5QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFC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