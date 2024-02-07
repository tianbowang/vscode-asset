/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/list/splice", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/color", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/platform", "vs/base/common/types", "./list", "./listView", "vs/base/browser/mouseEvent", "vs/css!./list"], function (require, exports, dom_1, event_1, keyboardEvent_1, touch_1, aria_1, splice_1, arrays_1, async_1, color_1, decorators_1, event_2, filters_1, lifecycle_1, numbers_1, platform, types_1, list_1, listView_1, mouseEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.List = exports.unthemedListStyles = exports.DefaultStyleController = exports.MouseController = exports.isSelectionRangeChangeEvent = exports.isSelectionSingleChangeEvent = exports.DefaultKeyboardNavigationDelegate = exports.TypeNavigationMode = exports.isButton = exports.isStickyScrollContainer = exports.isStickyScrollElement = exports.isMonacoTwistie = exports.isActionItem = exports.isMonacoCustomToggle = exports.isMonacoEditor = exports.isInputElement = void 0;
    class TraitRenderer {
        constructor(trait) {
            this.trait = trait;
            this.renderedElements = [];
        }
        get templateId() {
            return `template:${this.trait.name}`;
        }
        renderTemplate(container) {
            return container;
        }
        renderElement(element, index, templateData) {
            const renderedElementIndex = this.renderedElements.findIndex(el => el.templateData === templateData);
            if (renderedElementIndex >= 0) {
                const rendered = this.renderedElements[renderedElementIndex];
                this.trait.unrender(templateData);
                rendered.index = index;
            }
            else {
                const rendered = { index, templateData };
                this.renderedElements.push(rendered);
            }
            this.trait.renderIndex(index, templateData);
        }
        splice(start, deleteCount, insertCount) {
            const rendered = [];
            for (const renderedElement of this.renderedElements) {
                if (renderedElement.index < start) {
                    rendered.push(renderedElement);
                }
                else if (renderedElement.index >= start + deleteCount) {
                    rendered.push({
                        index: renderedElement.index + insertCount - deleteCount,
                        templateData: renderedElement.templateData
                    });
                }
            }
            this.renderedElements = rendered;
        }
        renderIndexes(indexes) {
            for (const { index, templateData } of this.renderedElements) {
                if (indexes.indexOf(index) > -1) {
                    this.trait.renderIndex(index, templateData);
                }
            }
        }
        disposeTemplate(templateData) {
            const index = this.renderedElements.findIndex(el => el.templateData === templateData);
            if (index < 0) {
                return;
            }
            this.renderedElements.splice(index, 1);
        }
    }
    class Trait {
        get name() { return this._trait; }
        get renderer() {
            return new TraitRenderer(this);
        }
        constructor(_trait) {
            this._trait = _trait;
            this.indexes = [];
            this.sortedIndexes = [];
            this._onChange = new event_2.Emitter();
            this.onChange = this._onChange.event;
        }
        splice(start, deleteCount, elements) {
            const diff = elements.length - deleteCount;
            const end = start + deleteCount;
            const sortedIndexes = [];
            let i = 0;
            while (i < this.sortedIndexes.length && this.sortedIndexes[i] < start) {
                sortedIndexes.push(this.sortedIndexes[i++]);
            }
            for (let j = 0; j < elements.length; j++) {
                if (elements[j]) {
                    sortedIndexes.push(j + start);
                }
            }
            while (i < this.sortedIndexes.length && this.sortedIndexes[i] >= end) {
                sortedIndexes.push(this.sortedIndexes[i++] + diff);
            }
            this.renderer.splice(start, deleteCount, elements.length);
            this._set(sortedIndexes, sortedIndexes);
        }
        renderIndex(index, container) {
            container.classList.toggle(this._trait, this.contains(index));
        }
        unrender(container) {
            container.classList.remove(this._trait);
        }
        /**
         * Sets the indexes which should have this trait.
         *
         * @param indexes Indexes which should have this trait.
         * @return The old indexes which had this trait.
         */
        set(indexes, browserEvent) {
            return this._set(indexes, [...indexes].sort(numericSort), browserEvent);
        }
        _set(indexes, sortedIndexes, browserEvent) {
            const result = this.indexes;
            const sortedResult = this.sortedIndexes;
            this.indexes = indexes;
            this.sortedIndexes = sortedIndexes;
            const toRender = disjunction(sortedResult, indexes);
            this.renderer.renderIndexes(toRender);
            this._onChange.fire({ indexes, browserEvent });
            return result;
        }
        get() {
            return this.indexes;
        }
        contains(index) {
            return (0, arrays_1.binarySearch)(this.sortedIndexes, index, numericSort) >= 0;
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._onChange);
        }
    }
    __decorate([
        decorators_1.memoize
    ], Trait.prototype, "renderer", null);
    class SelectionTrait extends Trait {
        constructor(setAriaSelected) {
            super('selected');
            this.setAriaSelected = setAriaSelected;
        }
        renderIndex(index, container) {
            super.renderIndex(index, container);
            if (this.setAriaSelected) {
                if (this.contains(index)) {
                    container.setAttribute('aria-selected', 'true');
                }
                else {
                    container.setAttribute('aria-selected', 'false');
                }
            }
        }
    }
    /**
     * The TraitSpliceable is used as a util class to be able
     * to preserve traits across splice calls, given an identity
     * provider.
     */
    class TraitSpliceable {
        constructor(trait, view, identityProvider) {
            this.trait = trait;
            this.view = view;
            this.identityProvider = identityProvider;
        }
        splice(start, deleteCount, elements) {
            if (!this.identityProvider) {
                return this.trait.splice(start, deleteCount, new Array(elements.length).fill(false));
            }
            const pastElementsWithTrait = this.trait.get().map(i => this.identityProvider.getId(this.view.element(i)).toString());
            if (pastElementsWithTrait.length === 0) {
                return this.trait.splice(start, deleteCount, new Array(elements.length).fill(false));
            }
            const pastElementsWithTraitSet = new Set(pastElementsWithTrait);
            const elementsWithTrait = elements.map(e => pastElementsWithTraitSet.has(this.identityProvider.getId(e).toString()));
            this.trait.splice(start, deleteCount, elementsWithTrait);
        }
    }
    function isInputElement(e) {
        return e.tagName === 'INPUT' || e.tagName === 'TEXTAREA';
    }
    exports.isInputElement = isInputElement;
    function isListElementDescendantOfClass(e, className) {
        if (e.classList.contains(className)) {
            return true;
        }
        if (e.classList.contains('monaco-list')) {
            return false;
        }
        if (!e.parentElement) {
            return false;
        }
        return isListElementDescendantOfClass(e.parentElement, className);
    }
    function isMonacoEditor(e) {
        return isListElementDescendantOfClass(e, 'monaco-editor');
    }
    exports.isMonacoEditor = isMonacoEditor;
    function isMonacoCustomToggle(e) {
        return isListElementDescendantOfClass(e, 'monaco-custom-toggle');
    }
    exports.isMonacoCustomToggle = isMonacoCustomToggle;
    function isActionItem(e) {
        return isListElementDescendantOfClass(e, 'action-item');
    }
    exports.isActionItem = isActionItem;
    function isMonacoTwistie(e) {
        return isListElementDescendantOfClass(e, 'monaco-tl-twistie');
    }
    exports.isMonacoTwistie = isMonacoTwistie;
    function isStickyScrollElement(e) {
        return isListElementDescendantOfClass(e, 'monaco-tree-sticky-row');
    }
    exports.isStickyScrollElement = isStickyScrollElement;
    function isStickyScrollContainer(e) {
        return e.classList.contains('monaco-tree-sticky-container');
    }
    exports.isStickyScrollContainer = isStickyScrollContainer;
    function isButton(e) {
        if ((e.tagName === 'A' && e.classList.contains('monaco-button')) ||
            (e.tagName === 'DIV' && e.classList.contains('monaco-button-dropdown'))) {
            return true;
        }
        if (e.classList.contains('monaco-list')) {
            return false;
        }
        if (!e.parentElement) {
            return false;
        }
        return isButton(e.parentElement);
    }
    exports.isButton = isButton;
    class KeyboardController {
        get onKeyDown() {
            return event_2.Event.chain(this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keydown')).event, $ => $.filter(e => !isInputElement(e.target))
                .map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
        }
        constructor(list, view, options) {
            this.list = list;
            this.view = view;
            this.disposables = new lifecycle_1.DisposableStore();
            this.multipleSelectionDisposables = new lifecycle_1.DisposableStore();
            this.multipleSelectionSupport = options.multipleSelectionSupport;
            this.disposables.add(this.onKeyDown(e => {
                switch (e.keyCode) {
                    case 3 /* KeyCode.Enter */:
                        return this.onEnter(e);
                    case 16 /* KeyCode.UpArrow */:
                        return this.onUpArrow(e);
                    case 18 /* KeyCode.DownArrow */:
                        return this.onDownArrow(e);
                    case 11 /* KeyCode.PageUp */:
                        return this.onPageUpArrow(e);
                    case 12 /* KeyCode.PageDown */:
                        return this.onPageDownArrow(e);
                    case 9 /* KeyCode.Escape */:
                        return this.onEscape(e);
                    case 31 /* KeyCode.KeyA */:
                        if (this.multipleSelectionSupport && (platform.isMacintosh ? e.metaKey : e.ctrlKey)) {
                            this.onCtrlA(e);
                        }
                }
            }));
        }
        updateOptions(optionsUpdate) {
            if (optionsUpdate.multipleSelectionSupport !== undefined) {
                this.multipleSelectionSupport = optionsUpdate.multipleSelectionSupport;
            }
        }
        onEnter(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.setSelection(this.list.getFocus(), e.browserEvent);
        }
        onUpArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.focusPrevious(1, false, e.browserEvent);
            const el = this.list.getFocus()[0];
            this.list.setAnchor(el);
            this.list.reveal(el);
            this.view.domNode.focus();
        }
        onDownArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.focusNext(1, false, e.browserEvent);
            const el = this.list.getFocus()[0];
            this.list.setAnchor(el);
            this.list.reveal(el);
            this.view.domNode.focus();
        }
        onPageUpArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.focusPreviousPage(e.browserEvent);
            const el = this.list.getFocus()[0];
            this.list.setAnchor(el);
            this.list.reveal(el);
            this.view.domNode.focus();
        }
        onPageDownArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.focusNextPage(e.browserEvent);
            const el = this.list.getFocus()[0];
            this.list.setAnchor(el);
            this.list.reveal(el);
            this.view.domNode.focus();
        }
        onCtrlA(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.setSelection((0, arrays_1.range)(this.list.length), e.browserEvent);
            this.list.setAnchor(undefined);
            this.view.domNode.focus();
        }
        onEscape(e) {
            if (this.list.getSelection().length) {
                e.preventDefault();
                e.stopPropagation();
                this.list.setSelection([], e.browserEvent);
                this.list.setAnchor(undefined);
                this.view.domNode.focus();
            }
        }
        dispose() {
            this.disposables.dispose();
            this.multipleSelectionDisposables.dispose();
        }
    }
    __decorate([
        decorators_1.memoize
    ], KeyboardController.prototype, "onKeyDown", null);
    var TypeNavigationMode;
    (function (TypeNavigationMode) {
        TypeNavigationMode[TypeNavigationMode["Automatic"] = 0] = "Automatic";
        TypeNavigationMode[TypeNavigationMode["Trigger"] = 1] = "Trigger";
    })(TypeNavigationMode || (exports.TypeNavigationMode = TypeNavigationMode = {}));
    var TypeNavigationControllerState;
    (function (TypeNavigationControllerState) {
        TypeNavigationControllerState[TypeNavigationControllerState["Idle"] = 0] = "Idle";
        TypeNavigationControllerState[TypeNavigationControllerState["Typing"] = 1] = "Typing";
    })(TypeNavigationControllerState || (TypeNavigationControllerState = {}));
    exports.DefaultKeyboardNavigationDelegate = new class {
        mightProducePrintableCharacter(event) {
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return false;
            }
            return (event.keyCode >= 31 /* KeyCode.KeyA */ && event.keyCode <= 56 /* KeyCode.KeyZ */)
                || (event.keyCode >= 21 /* KeyCode.Digit0 */ && event.keyCode <= 30 /* KeyCode.Digit9 */)
                || (event.keyCode >= 98 /* KeyCode.Numpad0 */ && event.keyCode <= 107 /* KeyCode.Numpad9 */)
                || (event.keyCode >= 85 /* KeyCode.Semicolon */ && event.keyCode <= 95 /* KeyCode.Quote */);
        }
    };
    class TypeNavigationController {
        constructor(list, view, keyboardNavigationLabelProvider, keyboardNavigationEventFilter, delegate) {
            this.list = list;
            this.view = view;
            this.keyboardNavigationLabelProvider = keyboardNavigationLabelProvider;
            this.keyboardNavigationEventFilter = keyboardNavigationEventFilter;
            this.delegate = delegate;
            this.enabled = false;
            this.state = TypeNavigationControllerState.Idle;
            this.mode = TypeNavigationMode.Automatic;
            this.triggered = false;
            this.previouslyFocused = -1;
            this.enabledDisposables = new lifecycle_1.DisposableStore();
            this.disposables = new lifecycle_1.DisposableStore();
            this.updateOptions(list.options);
        }
        updateOptions(options) {
            if (options.typeNavigationEnabled ?? true) {
                this.enable();
            }
            else {
                this.disable();
            }
            this.mode = options.typeNavigationMode ?? TypeNavigationMode.Automatic;
        }
        trigger() {
            this.triggered = !this.triggered;
        }
        enable() {
            if (this.enabled) {
                return;
            }
            let typing = false;
            const onChar = event_2.Event.chain(this.enabledDisposables.add(new event_1.DomEmitter(this.view.domNode, 'keydown')).event, $ => $.filter(e => !isInputElement(e.target))
                .filter(() => this.mode === TypeNavigationMode.Automatic || this.triggered)
                .map(event => new keyboardEvent_1.StandardKeyboardEvent(event))
                .filter(e => typing || this.keyboardNavigationEventFilter(e))
                .filter(e => this.delegate.mightProducePrintableCharacter(e))
                .forEach(e => dom_1.EventHelper.stop(e, true))
                .map(event => event.browserEvent.key));
            const onClear = event_2.Event.debounce(onChar, () => null, 800, undefined, undefined, undefined, this.enabledDisposables);
            const onInput = event_2.Event.reduce(event_2.Event.any(onChar, onClear), (r, i) => i === null ? null : ((r || '') + i), undefined, this.enabledDisposables);
            onInput(this.onInput, this, this.enabledDisposables);
            onClear(this.onClear, this, this.enabledDisposables);
            onChar(() => typing = true, undefined, this.enabledDisposables);
            onClear(() => typing = false, undefined, this.enabledDisposables);
            this.enabled = true;
            this.triggered = false;
        }
        disable() {
            if (!this.enabled) {
                return;
            }
            this.enabledDisposables.clear();
            this.enabled = false;
            this.triggered = false;
        }
        onClear() {
            const focus = this.list.getFocus();
            if (focus.length > 0 && focus[0] === this.previouslyFocused) {
                // List: re-announce element on typing end since typed keys will interrupt aria label of focused element
                // Do not announce if there was a focus change at the end to prevent duplication https://github.com/microsoft/vscode/issues/95961
                const ariaLabel = this.list.options.accessibilityProvider?.getAriaLabel(this.list.element(focus[0]));
                if (ariaLabel) {
                    (0, aria_1.alert)(ariaLabel);
                }
            }
            this.previouslyFocused = -1;
        }
        onInput(word) {
            if (!word) {
                this.state = TypeNavigationControllerState.Idle;
                this.triggered = false;
                return;
            }
            const focus = this.list.getFocus();
            const start = focus.length > 0 ? focus[0] : 0;
            const delta = this.state === TypeNavigationControllerState.Idle ? 1 : 0;
            this.state = TypeNavigationControllerState.Typing;
            for (let i = 0; i < this.list.length; i++) {
                const index = (start + i + delta) % this.list.length;
                const label = this.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(this.view.element(index));
                const labelStr = label && label.toString();
                if (this.list.options.typeNavigationEnabled) {
                    if (typeof labelStr !== 'undefined') {
                        // If prefix is found, focus and return early
                        if ((0, filters_1.matchesPrefix)(word, labelStr)) {
                            this.previouslyFocused = start;
                            this.list.setFocus([index]);
                            this.list.reveal(index);
                            return;
                        }
                        const fuzzy = (0, filters_1.matchesFuzzy2)(word, labelStr);
                        if (fuzzy) {
                            const fuzzyScore = fuzzy[0].end - fuzzy[0].start;
                            // ensures that when fuzzy matching, doesn't clash with prefix matching (1 input vs 1+ should be prefix and fuzzy respecitvely). Also makes sure that exact matches are prioritized.
                            if (fuzzyScore > 1 && fuzzy.length === 1) {
                                this.previouslyFocused = start;
                                this.list.setFocus([index]);
                                this.list.reveal(index);
                                return;
                            }
                        }
                    }
                }
                else if (typeof labelStr === 'undefined' || (0, filters_1.matchesPrefix)(word, labelStr)) {
                    this.previouslyFocused = start;
                    this.list.setFocus([index]);
                    this.list.reveal(index);
                    return;
                }
            }
        }
        dispose() {
            this.disable();
            this.enabledDisposables.dispose();
            this.disposables.dispose();
        }
    }
    class DOMFocusController {
        constructor(list, view) {
            this.list = list;
            this.view = view;
            this.disposables = new lifecycle_1.DisposableStore();
            const onKeyDown = event_2.Event.chain(this.disposables.add(new event_1.DomEmitter(view.domNode, 'keydown')).event, $ => $
                .filter(e => !isInputElement(e.target))
                .map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
            const onTab = event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 2 /* KeyCode.Tab */ && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey));
            onTab(this.onTab, this, this.disposables);
        }
        onTab(e) {
            if (e.target !== this.view.domNode) {
                return;
            }
            const focus = this.list.getFocus();
            if (focus.length === 0) {
                return;
            }
            const focusedDomElement = this.view.domElement(focus[0]);
            if (!focusedDomElement) {
                return;
            }
            const tabIndexElement = focusedDomElement.querySelector('[tabIndex]');
            if (!tabIndexElement || !(tabIndexElement instanceof HTMLElement) || tabIndexElement.tabIndex === -1) {
                return;
            }
            const style = (0, dom_1.getWindow)(tabIndexElement).getComputedStyle(tabIndexElement);
            if (style.visibility === 'hidden' || style.display === 'none') {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            tabIndexElement.focus();
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    function isSelectionSingleChangeEvent(event) {
        return platform.isMacintosh ? event.browserEvent.metaKey : event.browserEvent.ctrlKey;
    }
    exports.isSelectionSingleChangeEvent = isSelectionSingleChangeEvent;
    function isSelectionRangeChangeEvent(event) {
        return event.browserEvent.shiftKey;
    }
    exports.isSelectionRangeChangeEvent = isSelectionRangeChangeEvent;
    function isMouseRightClick(event) {
        return (0, dom_1.isMouseEvent)(event) && event.button === 2;
    }
    const DefaultMultipleSelectionController = {
        isSelectionSingleChangeEvent,
        isSelectionRangeChangeEvent
    };
    class MouseController {
        constructor(list) {
            this.list = list;
            this.disposables = new lifecycle_1.DisposableStore();
            this._onPointer = new event_2.Emitter();
            this.onPointer = this._onPointer.event;
            if (list.options.multipleSelectionSupport !== false) {
                this.multipleSelectionController = this.list.options.multipleSelectionController || DefaultMultipleSelectionController;
            }
            this.mouseSupport = typeof list.options.mouseSupport === 'undefined' || !!list.options.mouseSupport;
            if (this.mouseSupport) {
                list.onMouseDown(this.onMouseDown, this, this.disposables);
                list.onContextMenu(this.onContextMenu, this, this.disposables);
                list.onMouseDblClick(this.onDoubleClick, this, this.disposables);
                list.onTouchStart(this.onMouseDown, this, this.disposables);
                this.disposables.add(touch_1.Gesture.addTarget(list.getHTMLElement()));
            }
            event_2.Event.any(list.onMouseClick, list.onMouseMiddleClick, list.onTap)(this.onViewPointer, this, this.disposables);
        }
        updateOptions(optionsUpdate) {
            if (optionsUpdate.multipleSelectionSupport !== undefined) {
                this.multipleSelectionController = undefined;
                if (optionsUpdate.multipleSelectionSupport) {
                    this.multipleSelectionController = this.list.options.multipleSelectionController || DefaultMultipleSelectionController;
                }
            }
        }
        isSelectionSingleChangeEvent(event) {
            if (!this.multipleSelectionController) {
                return false;
            }
            return this.multipleSelectionController.isSelectionSingleChangeEvent(event);
        }
        isSelectionRangeChangeEvent(event) {
            if (!this.multipleSelectionController) {
                return false;
            }
            return this.multipleSelectionController.isSelectionRangeChangeEvent(event);
        }
        isSelectionChangeEvent(event) {
            return this.isSelectionSingleChangeEvent(event) || this.isSelectionRangeChangeEvent(event);
        }
        onMouseDown(e) {
            if (isMonacoEditor(e.browserEvent.target)) {
                return;
            }
            if ((0, dom_1.getActiveElement)() !== e.browserEvent.target) {
                this.list.domFocus();
            }
        }
        onContextMenu(e) {
            if (isInputElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
                return;
            }
            const focus = typeof e.index === 'undefined' ? [] : [e.index];
            this.list.setFocus(focus, e.browserEvent);
        }
        onViewPointer(e) {
            if (!this.mouseSupport) {
                return;
            }
            if (isInputElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            e.browserEvent.isHandledByList = true;
            const focus = e.index;
            if (typeof focus === 'undefined') {
                this.list.setFocus([], e.browserEvent);
                this.list.setSelection([], e.browserEvent);
                this.list.setAnchor(undefined);
                return;
            }
            if (this.isSelectionChangeEvent(e)) {
                return this.changeSelection(e);
            }
            this.list.setFocus([focus], e.browserEvent);
            this.list.setAnchor(focus);
            if (!isMouseRightClick(e.browserEvent)) {
                this.list.setSelection([focus], e.browserEvent);
            }
            this._onPointer.fire(e);
        }
        onDoubleClick(e) {
            if (isInputElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
                return;
            }
            if (this.isSelectionChangeEvent(e)) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            e.browserEvent.isHandledByList = true;
            const focus = this.list.getFocus();
            this.list.setSelection(focus, e.browserEvent);
        }
        changeSelection(e) {
            const focus = e.index;
            let anchor = this.list.getAnchor();
            if (this.isSelectionRangeChangeEvent(e)) {
                if (typeof anchor === 'undefined') {
                    const currentFocus = this.list.getFocus()[0];
                    anchor = currentFocus ?? focus;
                    this.list.setAnchor(anchor);
                }
                const min = Math.min(anchor, focus);
                const max = Math.max(anchor, focus);
                const rangeSelection = (0, arrays_1.range)(min, max + 1);
                const selection = this.list.getSelection();
                const contiguousRange = getContiguousRangeContaining(disjunction(selection, [anchor]), anchor);
                if (contiguousRange.length === 0) {
                    return;
                }
                const newSelection = disjunction(rangeSelection, relativeComplement(selection, contiguousRange));
                this.list.setSelection(newSelection, e.browserEvent);
                this.list.setFocus([focus], e.browserEvent);
            }
            else if (this.isSelectionSingleChangeEvent(e)) {
                const selection = this.list.getSelection();
                const newSelection = selection.filter(i => i !== focus);
                this.list.setFocus([focus]);
                this.list.setAnchor(focus);
                if (selection.length === newSelection.length) {
                    this.list.setSelection([...newSelection, focus], e.browserEvent);
                }
                else {
                    this.list.setSelection(newSelection, e.browserEvent);
                }
            }
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    exports.MouseController = MouseController;
    class DefaultStyleController {
        constructor(styleElement, selectorSuffix) {
            this.styleElement = styleElement;
            this.selectorSuffix = selectorSuffix;
        }
        style(styles) {
            const suffix = this.selectorSuffix && `.${this.selectorSuffix}`;
            const content = [];
            if (styles.listBackground) {
                content.push(`.monaco-list${suffix} .monaco-list-rows { background: ${styles.listBackground}; }`);
            }
            if (styles.listFocusBackground) {
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listFocusForeground) {
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
            }
            if (styles.listActiveSelectionBackground) {
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listActiveSelectionForeground) {
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
            }
            if (styles.listActiveSelectionIconForeground) {
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.selected .codicon { color: ${styles.listActiveSelectionIconForeground}; }`);
            }
            if (styles.listFocusAndSelectionBackground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
            }
            if (styles.listFocusAndSelectionForeground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
            }
            if (styles.listInactiveFocusForeground) {
                content.push(`.monaco-list${suffix} .monaco-list-row.focused { color:  ${styles.listInactiveFocusForeground}; }`);
                content.push(`.monaco-list${suffix} .monaco-list-row.focused:hover { color:  ${styles.listInactiveFocusForeground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionIconForeground) {
                content.push(`.monaco-list${suffix} .monaco-list-row.focused .codicon { color:  ${styles.listInactiveSelectionIconForeground}; }`);
            }
            if (styles.listInactiveFocusBackground) {
                content.push(`.monaco-list${suffix} .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
                content.push(`.monaco-list${suffix} .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionBackground) {
                content.push(`.monaco-list${suffix} .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix} .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionForeground) {
                content.push(`.monaco-list${suffix} .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
            }
            if (styles.listHoverBackground) {
                content.push(`.monaco-list${suffix}:not(.drop-target):not(.dragging) .monaco-list-row:hover:not(.selected):not(.focused) { background-color: ${styles.listHoverBackground}; }`);
            }
            if (styles.listHoverForeground) {
                content.push(`.monaco-list${suffix}:not(.drop-target):not(.dragging) .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
            }
            /**
             * Outlines
             */
            const focusAndSelectionOutline = (0, dom_1.asCssValueWithDefault)(styles.listFocusAndSelectionOutline, (0, dom_1.asCssValueWithDefault)(styles.listSelectionOutline, styles.listFocusOutline ?? ''));
            if (focusAndSelectionOutline) { // default: listFocusOutline
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.focused.selected { outline: 1px solid ${focusAndSelectionOutline}; outline-offset: -1px;}`);
            }
            if (styles.listFocusOutline) { // default: set
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
				.monaco-workbench.context-menu-visible .monaco-list${suffix}.last-focused .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
            }
            const inactiveFocusAndSelectionOutline = (0, dom_1.asCssValueWithDefault)(styles.listSelectionOutline, styles.listInactiveFocusOutline ?? '');
            if (inactiveFocusAndSelectionOutline) {
                content.push(`.monaco-list${suffix} .monaco-list-row.focused.selected { outline: 1px dotted ${inactiveFocusAndSelectionOutline}; outline-offset: -1px; }`);
            }
            if (styles.listSelectionOutline) { // default: activeContrastBorder
                content.push(`.monaco-list${suffix} .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
            }
            if (styles.listInactiveFocusOutline) { // default: null
                content.push(`.monaco-list${suffix} .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
            }
            if (styles.listHoverOutline) { // default: activeContrastBorder
                content.push(`.monaco-list${suffix} .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
            }
            if (styles.listDropOverBackground) {
                content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} .monaco-list-rows.drop-target,
				.monaco-list${suffix} .monaco-list-row.drop-target { background-color: ${styles.listDropOverBackground} !important; color: inherit !important; }
			`);
            }
            if (styles.listDropBetweenBackground) {
                content.push(`
			.monaco-list${suffix} .monaco-list-rows.drop-target-before .monaco-list-row:first-child::before,
			.monaco-list${suffix} .monaco-list-row.drop-target-before::before {
				content: ""; position: absolute; top: 0px; left: 0px; width: 100%; height: 1px;
				background-color: ${styles.listDropBetweenBackground};
			}`);
                content.push(`
			.monaco-list${suffix} .monaco-list-rows.drop-target-after .monaco-list-row:last-child::after,
			.monaco-list${suffix} .monaco-list-row.drop-target-after::after {
				content: ""; position: absolute; bottom: 0px; left: 0px; width: 100%; height: 1px;
				background-color: ${styles.listDropBetweenBackground};
			}`);
            }
            if (styles.tableColumnsBorder) {
                content.push(`
				.monaco-table > .monaco-split-view2,
				.monaco-table > .monaco-split-view2 .monaco-sash.vertical::before,
				.monaco-workbench:not(.reduce-motion) .monaco-table:hover > .monaco-split-view2,
				.monaco-workbench:not(.reduce-motion) .monaco-table:hover > .monaco-split-view2 .monaco-sash.vertical::before {
					border-color: ${styles.tableColumnsBorder};
				}

				.monaco-workbench:not(.reduce-motion) .monaco-table > .monaco-split-view2,
				.monaco-workbench:not(.reduce-motion) .monaco-table > .monaco-split-view2 .monaco-sash.vertical::before {
					border-color: transparent;
				}
			`);
            }
            if (styles.tableOddRowsBackgroundColor) {
                content.push(`
				.monaco-table .monaco-list-row[data-parity=odd]:not(.focused):not(.selected):not(:hover) .monaco-table-tr,
				.monaco-table .monaco-list:not(:focus) .monaco-list-row[data-parity=odd].focused:not(.selected):not(:hover) .monaco-table-tr,
				.monaco-table .monaco-list:not(.focused) .monaco-list-row[data-parity=odd].focused:not(.selected):not(:hover) .monaco-table-tr {
					background-color: ${styles.tableOddRowsBackgroundColor};
				}
			`);
            }
            this.styleElement.textContent = content.join('\n');
        }
    }
    exports.DefaultStyleController = DefaultStyleController;
    exports.unthemedListStyles = {
        listFocusBackground: '#7FB0D0',
        listActiveSelectionBackground: '#0E639C',
        listActiveSelectionForeground: '#FFFFFF',
        listActiveSelectionIconForeground: '#FFFFFF',
        listFocusAndSelectionOutline: '#90C2F9',
        listFocusAndSelectionBackground: '#094771',
        listFocusAndSelectionForeground: '#FFFFFF',
        listInactiveSelectionBackground: '#3F3F46',
        listInactiveSelectionIconForeground: '#FFFFFF',
        listHoverBackground: '#2A2D2E',
        listDropOverBackground: '#383B3D',
        listDropBetweenBackground: '#EEEEEE',
        treeIndentGuidesStroke: '#a9a9a9',
        treeInactiveIndentGuidesStroke: color_1.Color.fromHex('#a9a9a9').transparent(0.4).toString(),
        tableColumnsBorder: color_1.Color.fromHex('#cccccc').transparent(0.2).toString(),
        tableOddRowsBackgroundColor: color_1.Color.fromHex('#cccccc').transparent(0.04).toString(),
        listBackground: undefined,
        listFocusForeground: undefined,
        listInactiveSelectionForeground: undefined,
        listInactiveFocusForeground: undefined,
        listInactiveFocusBackground: undefined,
        listHoverForeground: undefined,
        listFocusOutline: undefined,
        listInactiveFocusOutline: undefined,
        listSelectionOutline: undefined,
        listHoverOutline: undefined
    };
    const DefaultOptions = {
        keyboardSupport: true,
        mouseSupport: true,
        multipleSelectionSupport: true,
        dnd: {
            getDragURI() { return null; },
            onDragStart() { },
            onDragOver() { return false; },
            drop() { },
            dispose() { }
        }
    };
    // TODO@Joao: move these utils into a SortedArray class
    function getContiguousRangeContaining(range, value) {
        const index = range.indexOf(value);
        if (index === -1) {
            return [];
        }
        const result = [];
        let i = index - 1;
        while (i >= 0 && range[i] === value - (index - i)) {
            result.push(range[i--]);
        }
        result.reverse();
        i = index;
        while (i < range.length && range[i] === value + (i - index)) {
            result.push(range[i++]);
        }
        return result;
    }
    /**
     * Given two sorted collections of numbers, returns the intersection
     * between them (OR).
     */
    function disjunction(one, other) {
        const result = [];
        let i = 0, j = 0;
        while (i < one.length || j < other.length) {
            if (i >= one.length) {
                result.push(other[j++]);
            }
            else if (j >= other.length) {
                result.push(one[i++]);
            }
            else if (one[i] === other[j]) {
                result.push(one[i]);
                i++;
                j++;
                continue;
            }
            else if (one[i] < other[j]) {
                result.push(one[i++]);
            }
            else {
                result.push(other[j++]);
            }
        }
        return result;
    }
    /**
     * Given two sorted collections of numbers, returns the relative
     * complement between them (XOR).
     */
    function relativeComplement(one, other) {
        const result = [];
        let i = 0, j = 0;
        while (i < one.length || j < other.length) {
            if (i >= one.length) {
                result.push(other[j++]);
            }
            else if (j >= other.length) {
                result.push(one[i++]);
            }
            else if (one[i] === other[j]) {
                i++;
                j++;
                continue;
            }
            else if (one[i] < other[j]) {
                result.push(one[i++]);
            }
            else {
                j++;
            }
        }
        return result;
    }
    const numericSort = (a, b) => a - b;
    class PipelineRenderer {
        constructor(_templateId, renderers) {
            this._templateId = _templateId;
            this.renderers = renderers;
        }
        get templateId() {
            return this._templateId;
        }
        renderTemplate(container) {
            return this.renderers.map(r => r.renderTemplate(container));
        }
        renderElement(element, index, templateData, height) {
            let i = 0;
            for (const renderer of this.renderers) {
                renderer.renderElement(element, index, templateData[i++], height);
            }
        }
        disposeElement(element, index, templateData, height) {
            let i = 0;
            for (const renderer of this.renderers) {
                renderer.disposeElement?.(element, index, templateData[i], height);
                i += 1;
            }
        }
        disposeTemplate(templateData) {
            let i = 0;
            for (const renderer of this.renderers) {
                renderer.disposeTemplate(templateData[i++]);
            }
        }
    }
    class AccessibiltyRenderer {
        constructor(accessibilityProvider) {
            this.accessibilityProvider = accessibilityProvider;
            this.templateId = 'a18n';
        }
        renderTemplate(container) {
            return container;
        }
        renderElement(element, index, container) {
            const ariaLabel = this.accessibilityProvider.getAriaLabel(element);
            if (ariaLabel) {
                container.setAttribute('aria-label', ariaLabel);
            }
            else {
                container.removeAttribute('aria-label');
            }
            const ariaLevel = this.accessibilityProvider.getAriaLevel && this.accessibilityProvider.getAriaLevel(element);
            if (typeof ariaLevel === 'number') {
                container.setAttribute('aria-level', `${ariaLevel}`);
            }
            else {
                container.removeAttribute('aria-level');
            }
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class ListViewDragAndDrop {
        constructor(list, dnd) {
            this.list = list;
            this.dnd = dnd;
        }
        getDragElements(element) {
            const selection = this.list.getSelectedElements();
            const elements = selection.indexOf(element) > -1 ? selection : [element];
            return elements;
        }
        getDragURI(element) {
            return this.dnd.getDragURI(element);
        }
        getDragLabel(elements, originalEvent) {
            if (this.dnd.getDragLabel) {
                return this.dnd.getDragLabel(elements, originalEvent);
            }
            return undefined;
        }
        onDragStart(data, originalEvent) {
            this.dnd.onDragStart?.(data, originalEvent);
        }
        onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
            return this.dnd.onDragOver(data, targetElement, targetIndex, targetSector, originalEvent);
        }
        onDragLeave(data, targetElement, targetIndex, originalEvent) {
            this.dnd.onDragLeave?.(data, targetElement, targetIndex, originalEvent);
        }
        onDragEnd(originalEvent) {
            this.dnd.onDragEnd?.(originalEvent);
        }
        drop(data, targetElement, targetIndex, targetSector, originalEvent) {
            this.dnd.drop(data, targetElement, targetIndex, targetSector, originalEvent);
        }
        dispose() {
            this.dnd.dispose();
        }
    }
    /**
     * The {@link List} is a virtual scrolling widget, built on top of the {@link ListView}
     * widget.
     *
     * Features:
     * - Customizable keyboard and mouse support
     * - Element traits: focus, selection, achor
     * - Accessibility support
     * - Touch support
     * - Performant template-based rendering
     * - Horizontal scrolling
     * - Variable element height support
     * - Dynamic element height support
     * - Drag-and-drop support
     */
    class List {
        get onDidChangeFocus() {
            return event_2.Event.map(this.eventBufferer.wrapEvent(this.focus.onChange), e => this.toListEvent(e), this.disposables);
        }
        get onDidChangeSelection() {
            return event_2.Event.map(this.eventBufferer.wrapEvent(this.selection.onChange), e => this.toListEvent(e), this.disposables);
        }
        get domId() { return this.view.domId; }
        get onDidScroll() { return this.view.onDidScroll; }
        get onMouseClick() { return this.view.onMouseClick; }
        get onMouseDblClick() { return this.view.onMouseDblClick; }
        get onMouseMiddleClick() { return this.view.onMouseMiddleClick; }
        get onPointer() { return this.mouseController.onPointer; }
        get onMouseUp() { return this.view.onMouseUp; }
        get onMouseDown() { return this.view.onMouseDown; }
        get onMouseOver() { return this.view.onMouseOver; }
        get onMouseMove() { return this.view.onMouseMove; }
        get onMouseOut() { return this.view.onMouseOut; }
        get onTouchStart() { return this.view.onTouchStart; }
        get onTap() { return this.view.onTap; }
        /**
         * Possible context menu trigger events:
         * - ContextMenu key
         * - Shift F10
         * - Ctrl Option Shift M (macOS with VoiceOver)
         * - Mouse right click
         */
        get onContextMenu() {
            let didJustPressContextMenuKey = false;
            const fromKeyDown = event_2.Event.chain(this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keydown')).event, $ => $.map(e => new keyboardEvent_1.StandardKeyboardEvent(e))
                .filter(e => didJustPressContextMenuKey = e.keyCode === 58 /* KeyCode.ContextMenu */ || (e.shiftKey && e.keyCode === 68 /* KeyCode.F10 */))
                .map(e => dom_1.EventHelper.stop(e, true))
                .filter(() => false));
            const fromKeyUp = event_2.Event.chain(this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keyup')).event, $ => $.forEach(() => didJustPressContextMenuKey = false)
                .map(e => new keyboardEvent_1.StandardKeyboardEvent(e))
                .filter(e => e.keyCode === 58 /* KeyCode.ContextMenu */ || (e.shiftKey && e.keyCode === 68 /* KeyCode.F10 */))
                .map(e => dom_1.EventHelper.stop(e, true))
                .map(({ browserEvent }) => {
                const focus = this.getFocus();
                const index = focus.length ? focus[0] : undefined;
                const element = typeof index !== 'undefined' ? this.view.element(index) : undefined;
                const anchor = typeof index !== 'undefined' ? this.view.domElement(index) : this.view.domNode;
                return { index, element, anchor, browserEvent };
            }));
            const fromMouse = event_2.Event.chain(this.view.onContextMenu, $ => $.filter(_ => !didJustPressContextMenuKey)
                .map(({ element, index, browserEvent }) => ({ element, index, anchor: new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(this.view.domNode), browserEvent), browserEvent })));
            return event_2.Event.any(fromKeyDown, fromKeyUp, fromMouse);
        }
        get onKeyDown() { return this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keydown')).event; }
        get onKeyUp() { return this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keyup')).event; }
        get onKeyPress() { return this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keypress')).event; }
        get onDidFocus() { return event_2.Event.signal(this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'focus', true)).event); }
        get onDidBlur() { return event_2.Event.signal(this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'blur', true)).event); }
        constructor(user, container, virtualDelegate, renderers, _options = DefaultOptions) {
            this.user = user;
            this._options = _options;
            this.focus = new Trait('focused');
            this.anchor = new Trait('anchor');
            this.eventBufferer = new event_2.EventBufferer();
            this._ariaLabel = '';
            this.disposables = new lifecycle_1.DisposableStore();
            this._onDidDispose = new event_2.Emitter();
            this.onDidDispose = this._onDidDispose.event;
            const role = this._options.accessibilityProvider && this._options.accessibilityProvider.getWidgetRole ? this._options.accessibilityProvider?.getWidgetRole() : 'list';
            this.selection = new SelectionTrait(role !== 'listbox');
            const baseRenderers = [this.focus.renderer, this.selection.renderer];
            this.accessibilityProvider = _options.accessibilityProvider;
            if (this.accessibilityProvider) {
                baseRenderers.push(new AccessibiltyRenderer(this.accessibilityProvider));
                this.accessibilityProvider.onDidChangeActiveDescendant?.(this.onDidChangeActiveDescendant, this, this.disposables);
            }
            renderers = renderers.map(r => new PipelineRenderer(r.templateId, [...baseRenderers, r]));
            const viewOptions = {
                ..._options,
                dnd: _options.dnd && new ListViewDragAndDrop(this, _options.dnd)
            };
            this.view = this.createListView(container, virtualDelegate, renderers, viewOptions);
            this.view.domNode.setAttribute('role', role);
            if (_options.styleController) {
                this.styleController = _options.styleController(this.view.domId);
            }
            else {
                const styleElement = (0, dom_1.createStyleSheet)(this.view.domNode);
                this.styleController = new DefaultStyleController(styleElement, this.view.domId);
            }
            this.spliceable = new splice_1.CombinedSpliceable([
                new TraitSpliceable(this.focus, this.view, _options.identityProvider),
                new TraitSpliceable(this.selection, this.view, _options.identityProvider),
                new TraitSpliceable(this.anchor, this.view, _options.identityProvider),
                this.view
            ]);
            this.disposables.add(this.focus);
            this.disposables.add(this.selection);
            this.disposables.add(this.anchor);
            this.disposables.add(this.view);
            this.disposables.add(this._onDidDispose);
            this.disposables.add(new DOMFocusController(this, this.view));
            if (typeof _options.keyboardSupport !== 'boolean' || _options.keyboardSupport) {
                this.keyboardController = new KeyboardController(this, this.view, _options);
                this.disposables.add(this.keyboardController);
            }
            if (_options.keyboardNavigationLabelProvider) {
                const delegate = _options.keyboardNavigationDelegate || exports.DefaultKeyboardNavigationDelegate;
                this.typeNavigationController = new TypeNavigationController(this, this.view, _options.keyboardNavigationLabelProvider, _options.keyboardNavigationEventFilter ?? (() => true), delegate);
                this.disposables.add(this.typeNavigationController);
            }
            this.mouseController = this.createMouseController(_options);
            this.disposables.add(this.mouseController);
            this.onDidChangeFocus(this._onFocusChange, this, this.disposables);
            this.onDidChangeSelection(this._onSelectionChange, this, this.disposables);
            if (this.accessibilityProvider) {
                this.ariaLabel = this.accessibilityProvider.getWidgetAriaLabel();
            }
            if (this._options.multipleSelectionSupport !== false) {
                this.view.domNode.setAttribute('aria-multiselectable', 'true');
            }
        }
        createListView(container, virtualDelegate, renderers, viewOptions) {
            return new listView_1.ListView(container, virtualDelegate, renderers, viewOptions);
        }
        createMouseController(options) {
            return new MouseController(this);
        }
        updateOptions(optionsUpdate = {}) {
            this._options = { ...this._options, ...optionsUpdate };
            this.typeNavigationController?.updateOptions(this._options);
            if (this._options.multipleSelectionController !== undefined) {
                if (this._options.multipleSelectionSupport) {
                    this.view.domNode.setAttribute('aria-multiselectable', 'true');
                }
                else {
                    this.view.domNode.removeAttribute('aria-multiselectable');
                }
            }
            this.mouseController.updateOptions(optionsUpdate);
            this.keyboardController?.updateOptions(optionsUpdate);
            this.view.updateOptions(optionsUpdate);
        }
        get options() {
            return this._options;
        }
        splice(start, deleteCount, elements = []) {
            if (start < 0 || start > this.view.length) {
                throw new list_1.ListError(this.user, `Invalid start index: ${start}`);
            }
            if (deleteCount < 0) {
                throw new list_1.ListError(this.user, `Invalid delete count: ${deleteCount}`);
            }
            if (deleteCount === 0 && elements.length === 0) {
                return;
            }
            this.eventBufferer.bufferEvents(() => this.spliceable.splice(start, deleteCount, elements));
        }
        updateWidth(index) {
            this.view.updateWidth(index);
        }
        updateElementHeight(index, size) {
            this.view.updateElementHeight(index, size, null);
        }
        rerender() {
            this.view.rerender();
        }
        element(index) {
            return this.view.element(index);
        }
        indexOf(element) {
            return this.view.indexOf(element);
        }
        indexAt(position) {
            return this.view.indexAt(position);
        }
        get length() {
            return this.view.length;
        }
        get contentHeight() {
            return this.view.contentHeight;
        }
        get contentWidth() {
            return this.view.contentWidth;
        }
        get onDidChangeContentHeight() {
            return this.view.onDidChangeContentHeight;
        }
        get onDidChangeContentWidth() {
            return this.view.onDidChangeContentWidth;
        }
        get scrollTop() {
            return this.view.getScrollTop();
        }
        set scrollTop(scrollTop) {
            this.view.setScrollTop(scrollTop);
        }
        get scrollLeft() {
            return this.view.getScrollLeft();
        }
        set scrollLeft(scrollLeft) {
            this.view.setScrollLeft(scrollLeft);
        }
        get scrollHeight() {
            return this.view.scrollHeight;
        }
        get renderHeight() {
            return this.view.renderHeight;
        }
        get firstVisibleIndex() {
            return this.view.firstVisibleIndex;
        }
        get firstMostlyVisibleIndex() {
            return this.view.firstMostlyVisibleIndex;
        }
        get lastVisibleIndex() {
            return this.view.lastVisibleIndex;
        }
        get ariaLabel() {
            return this._ariaLabel;
        }
        set ariaLabel(value) {
            this._ariaLabel = value;
            this.view.domNode.setAttribute('aria-label', value);
        }
        domFocus() {
            this.view.domNode.focus({ preventScroll: true });
        }
        layout(height, width) {
            this.view.layout(height, width);
        }
        triggerTypeNavigation() {
            this.typeNavigationController?.trigger();
        }
        setSelection(indexes, browserEvent) {
            for (const index of indexes) {
                if (index < 0 || index >= this.length) {
                    throw new list_1.ListError(this.user, `Invalid index ${index}`);
                }
            }
            this.selection.set(indexes, browserEvent);
        }
        getSelection() {
            return this.selection.get();
        }
        getSelectedElements() {
            return this.getSelection().map(i => this.view.element(i));
        }
        setAnchor(index) {
            if (typeof index === 'undefined') {
                this.anchor.set([]);
                return;
            }
            if (index < 0 || index >= this.length) {
                throw new list_1.ListError(this.user, `Invalid index ${index}`);
            }
            this.anchor.set([index]);
        }
        getAnchor() {
            return (0, arrays_1.firstOrDefault)(this.anchor.get(), undefined);
        }
        getAnchorElement() {
            const anchor = this.getAnchor();
            return typeof anchor === 'undefined' ? undefined : this.element(anchor);
        }
        setFocus(indexes, browserEvent) {
            for (const index of indexes) {
                if (index < 0 || index >= this.length) {
                    throw new list_1.ListError(this.user, `Invalid index ${index}`);
                }
            }
            this.focus.set(indexes, browserEvent);
        }
        focusNext(n = 1, loop = false, browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const focus = this.focus.get();
            const index = this.findNextIndex(focus.length > 0 ? focus[0] + n : 0, loop, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        focusPrevious(n = 1, loop = false, browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const focus = this.focus.get();
            const index = this.findPreviousIndex(focus.length > 0 ? focus[0] - n : 0, loop, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        async focusNextPage(browserEvent, filter) {
            let lastPageIndex = this.view.indexAt(this.view.getScrollTop() + this.view.renderHeight);
            lastPageIndex = lastPageIndex === 0 ? 0 : lastPageIndex - 1;
            const currentlyFocusedElementIndex = this.getFocus()[0];
            if (currentlyFocusedElementIndex !== lastPageIndex && (currentlyFocusedElementIndex === undefined || lastPageIndex > currentlyFocusedElementIndex)) {
                const lastGoodPageIndex = this.findPreviousIndex(lastPageIndex, false, filter);
                if (lastGoodPageIndex > -1 && currentlyFocusedElementIndex !== lastGoodPageIndex) {
                    this.setFocus([lastGoodPageIndex], browserEvent);
                }
                else {
                    this.setFocus([lastPageIndex], browserEvent);
                }
            }
            else {
                const previousScrollTop = this.view.getScrollTop();
                let nextpageScrollTop = previousScrollTop + this.view.renderHeight;
                if (lastPageIndex > currentlyFocusedElementIndex) {
                    // scroll last page element to the top only if the last page element is below the focused element
                    nextpageScrollTop -= this.view.elementHeight(lastPageIndex);
                }
                this.view.setScrollTop(nextpageScrollTop);
                if (this.view.getScrollTop() !== previousScrollTop) {
                    this.setFocus([]);
                    // Let the scroll event listener run
                    await (0, async_1.timeout)(0);
                    await this.focusNextPage(browserEvent, filter);
                }
            }
        }
        async focusPreviousPage(browserEvent, filter, getPaddingTop = () => 0) {
            let firstPageIndex;
            const paddingTop = getPaddingTop();
            const scrollTop = this.view.getScrollTop() + paddingTop;
            if (scrollTop === 0) {
                firstPageIndex = this.view.indexAt(scrollTop);
            }
            else {
                firstPageIndex = this.view.indexAfter(scrollTop - 1);
            }
            const currentlyFocusedElementIndex = this.getFocus()[0];
            if (currentlyFocusedElementIndex !== firstPageIndex && (currentlyFocusedElementIndex === undefined || currentlyFocusedElementIndex >= firstPageIndex)) {
                const firstGoodPageIndex = this.findNextIndex(firstPageIndex, false, filter);
                if (firstGoodPageIndex > -1 && currentlyFocusedElementIndex !== firstGoodPageIndex) {
                    this.setFocus([firstGoodPageIndex], browserEvent);
                }
                else {
                    this.setFocus([firstPageIndex], browserEvent);
                }
            }
            else {
                const previousScrollTop = scrollTop;
                this.view.setScrollTop(scrollTop - this.view.renderHeight - paddingTop);
                if (this.view.getScrollTop() + getPaddingTop() !== previousScrollTop) {
                    this.setFocus([]);
                    // Let the scroll event listener run
                    await (0, async_1.timeout)(0);
                    await this.focusPreviousPage(browserEvent, filter, getPaddingTop);
                }
            }
        }
        focusLast(browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const index = this.findPreviousIndex(this.length - 1, false, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        focusFirst(browserEvent, filter) {
            this.focusNth(0, browserEvent, filter);
        }
        focusNth(n, browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const index = this.findNextIndex(n, false, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        findNextIndex(index, loop = false, filter) {
            for (let i = 0; i < this.length; i++) {
                if (index >= this.length && !loop) {
                    return -1;
                }
                index = index % this.length;
                if (!filter || filter(this.element(index))) {
                    return index;
                }
                index++;
            }
            return -1;
        }
        findPreviousIndex(index, loop = false, filter) {
            for (let i = 0; i < this.length; i++) {
                if (index < 0 && !loop) {
                    return -1;
                }
                index = (this.length + (index % this.length)) % this.length;
                if (!filter || filter(this.element(index))) {
                    return index;
                }
                index--;
            }
            return -1;
        }
        getFocus() {
            return this.focus.get();
        }
        getFocusedElements() {
            return this.getFocus().map(i => this.view.element(i));
        }
        reveal(index, relativeTop, paddingTop = 0) {
            if (index < 0 || index >= this.length) {
                throw new list_1.ListError(this.user, `Invalid index ${index}`);
            }
            const scrollTop = this.view.getScrollTop();
            const elementTop = this.view.elementTop(index);
            const elementHeight = this.view.elementHeight(index);
            if ((0, types_1.isNumber)(relativeTop)) {
                // y = mx + b
                const m = elementHeight - this.view.renderHeight + paddingTop;
                this.view.setScrollTop(m * (0, numbers_1.clamp)(relativeTop, 0, 1) + elementTop - paddingTop);
            }
            else {
                const viewItemBottom = elementTop + elementHeight;
                const scrollBottom = scrollTop + this.view.renderHeight;
                if (elementTop < scrollTop + paddingTop && viewItemBottom >= scrollBottom) {
                    // The element is already overflowing the viewport, no-op
                }
                else if (elementTop < scrollTop + paddingTop || (viewItemBottom >= scrollBottom && elementHeight >= this.view.renderHeight)) {
                    this.view.setScrollTop(elementTop - paddingTop);
                }
                else if (viewItemBottom >= scrollBottom) {
                    this.view.setScrollTop(viewItemBottom - this.view.renderHeight);
                }
            }
        }
        /**
         * Returns the relative position of an element rendered in the list.
         * Returns `null` if the element isn't *entirely* in the visible viewport.
         */
        getRelativeTop(index, paddingTop = 0) {
            if (index < 0 || index >= this.length) {
                throw new list_1.ListError(this.user, `Invalid index ${index}`);
            }
            const scrollTop = this.view.getScrollTop();
            const elementTop = this.view.elementTop(index);
            const elementHeight = this.view.elementHeight(index);
            if (elementTop < scrollTop + paddingTop || elementTop + elementHeight > scrollTop + this.view.renderHeight) {
                return null;
            }
            // y = mx + b
            const m = elementHeight - this.view.renderHeight + paddingTop;
            return Math.abs((scrollTop + paddingTop - elementTop) / m);
        }
        isDOMFocused() {
            return (0, dom_1.isActiveElement)(this.view.domNode);
        }
        getHTMLElement() {
            return this.view.domNode;
        }
        getScrollableElement() {
            return this.view.scrollableElementDomNode;
        }
        getElementID(index) {
            return this.view.getElementDomId(index);
        }
        getElementTop(index) {
            return this.view.elementTop(index);
        }
        style(styles) {
            this.styleController.style(styles);
        }
        toListEvent({ indexes, browserEvent }) {
            return { indexes, elements: indexes.map(i => this.view.element(i)), browserEvent };
        }
        _onFocusChange() {
            const focus = this.focus.get();
            this.view.domNode.classList.toggle('element-focused', focus.length > 0);
            this.onDidChangeActiveDescendant();
        }
        onDidChangeActiveDescendant() {
            const focus = this.focus.get();
            if (focus.length > 0) {
                let id;
                if (this.accessibilityProvider?.getActiveDescendantId) {
                    id = this.accessibilityProvider.getActiveDescendantId(this.view.element(focus[0]));
                }
                this.view.domNode.setAttribute('aria-activedescendant', id || this.view.getElementDomId(focus[0]));
            }
            else {
                this.view.domNode.removeAttribute('aria-activedescendant');
            }
        }
        _onSelectionChange() {
            const selection = this.selection.get();
            this.view.domNode.classList.toggle('selection-none', selection.length === 0);
            this.view.domNode.classList.toggle('selection-single', selection.length === 1);
            this.view.domNode.classList.toggle('selection-multiple', selection.length > 1);
        }
        dispose() {
            this._onDidDispose.fire();
            this.disposables.dispose();
            this._onDidDispose.dispose();
        }
    }
    exports.List = List;
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onDidChangeFocus", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onDidChangeSelection", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onContextMenu", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onKeyDown", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onKeyUp", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onKeyPress", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onDidFocus", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onDidBlur", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2xpc3QvbGlzdFdpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7SUF3Q2hHLE1BQU0sYUFBYTtRQUdsQixZQUFvQixLQUFlO1lBQWYsVUFBSyxHQUFMLEtBQUssQ0FBVTtZQUYzQixxQkFBZ0IsR0FBeUIsRUFBRSxDQUFDO1FBRWIsQ0FBQztRQUV4QyxJQUFJLFVBQVU7WUFDYixPQUFPLFlBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QyxDQUFDO1FBRUQsY0FBYyxDQUFDLFNBQXNCO1lBQ3BDLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxhQUFhLENBQUMsT0FBVSxFQUFFLEtBQWEsRUFBRSxZQUFnQztZQUN4RSxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxLQUFLLFlBQVksQ0FBQyxDQUFDO1lBRXJHLElBQUksb0JBQW9CLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDbEMsUUFBUSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDeEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE1BQU0sUUFBUSxHQUFHLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxDQUFDO2dCQUN6QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFF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