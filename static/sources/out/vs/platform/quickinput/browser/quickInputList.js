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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/comparers", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iconLabels", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls", "vs/platform/quickinput/browser/quickInputUtils", "vs/base/common/lazy", "vs/base/common/uri", "vs/platform/theme/common/theme", "vs/css!./media/quickInput"], function (require, exports, dom, keyboardEvent_1, actionbar_1, iconLabel_1, keybindingLabel_1, arrays_1, async_1, comparers_1, decorators_1, errors_1, event_1, iconLabels_1, lifecycle_1, platform, strings_1, nls_1, quickInputUtils_1, lazy_1, uri_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputList = exports.QuickInputListFocus = void 0;
    const $ = dom.$;
    class ListElement {
        constructor(mainItem, previous, index, hasCheckbox, fireButtonTriggered, fireSeparatorButtonTriggered, onCheckedEmitter) {
            // state will get updated later
            this._checked = false;
            this._hidden = false;
            this.hasCheckbox = hasCheckbox;
            this.index = index;
            this.fireButtonTriggered = fireButtonTriggered;
            this.fireSeparatorButtonTriggered = fireSeparatorButtonTriggered;
            this._onChecked = onCheckedEmitter;
            this.onChecked = hasCheckbox
                ? event_1.Event.map(event_1.Event.filter(this._onChecked.event, e => e.listElement === this), e => e.checked)
                : event_1.Event.None;
            if (mainItem.type === 'separator') {
                this._separator = mainItem;
            }
            else {
                this.item = mainItem;
                if (previous && previous.type === 'separator' && !previous.buttons) {
                    this._separator = previous;
                }
                this.saneDescription = this.item.description;
                this.saneDetail = this.item.detail;
                this._labelHighlights = this.item.highlights?.label;
                this._descriptionHighlights = this.item.highlights?.description;
                this._detailHighlights = this.item.highlights?.detail;
                this.saneTooltip = this.item.tooltip;
            }
            this._init = new lazy_1.Lazy(() => {
                const saneLabel = mainItem.label ?? '';
                const saneSortLabel = (0, iconLabels_1.parseLabelWithIcons)(saneLabel).text.trim();
                const saneAriaLabel = mainItem.ariaLabel || [saneLabel, this.saneDescription, this.saneDetail]
                    .map(s => (0, iconLabels_1.getCodiconAriaLabel)(s))
                    .filter(s => !!s)
                    .join(', ');
                return {
                    saneLabel,
                    saneSortLabel,
                    saneAriaLabel
                };
            });
        }
        // #region Lazy Getters
        get saneLabel() {
            return this._init.value.saneLabel;
        }
        get saneSortLabel() {
            return this._init.value.saneSortLabel;
        }
        get saneAriaLabel() {
            return this._init.value.saneAriaLabel;
        }
        // #endregion
        // #region Getters and Setters
        get element() {
            return this._element;
        }
        set element(value) {
            this._element = value;
        }
        get hidden() {
            return this._hidden;
        }
        set hidden(value) {
            this._hidden = value;
        }
        get checked() {
            return this._checked;
        }
        set checked(value) {
            if (value !== this._checked) {
                this._checked = value;
                this._onChecked.fire({ listElement: this, checked: value });
            }
        }
        get separator() {
            return this._separator;
        }
        set separator(value) {
            this._separator = value;
        }
        get labelHighlights() {
            return this._labelHighlights;
        }
        set labelHighlights(value) {
            this._labelHighlights = value;
        }
        get descriptionHighlights() {
            return this._descriptionHighlights;
        }
        set descriptionHighlights(value) {
            this._descriptionHighlights = value;
        }
        get detailHighlights() {
            return this._detailHighlights;
        }
        set detailHighlights(value) {
            this._detailHighlights = value;
        }
    }
    class ListElementRenderer {
        static { this.ID = 'listelement'; }
        constructor(themeService, hoverDelegate) {
            this.themeService = themeService;
            this.hoverDelegate = hoverDelegate;
        }
        get templateId() {
            return ListElementRenderer.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDisposeElement = [];
            data.toDisposeTemplate = [];
            data.entry = dom.append(container, $('.quick-input-list-entry'));
            // Checkbox
            const label = dom.append(data.entry, $('label.quick-input-list-label'));
            data.toDisposeTemplate.push(dom.addStandardDisposableListener(label, dom.EventType.CLICK, e => {
                if (!data.checkbox.offsetParent) { // If checkbox not visible:
                    e.preventDefault(); // Prevent toggle of checkbox when it is immediately shown afterwards. #91740
                }
            }));
            data.checkbox = dom.append(label, $('input.quick-input-list-checkbox'));
            data.checkbox.type = 'checkbox';
            data.toDisposeTemplate.push(dom.addStandardDisposableListener(data.checkbox, dom.EventType.CHANGE, e => {
                data.element.checked = data.checkbox.checked;
            }));
            // Rows
            const rows = dom.append(label, $('.quick-input-list-rows'));
            const row1 = dom.append(rows, $('.quick-input-list-row'));
            const row2 = dom.append(rows, $('.quick-input-list-row'));
            // Label
            data.label = new iconLabel_1.IconLabel(row1, { supportHighlights: true, supportDescriptionHighlights: true, supportIcons: true, hoverDelegate: this.hoverDelegate });
            data.toDisposeTemplate.push(data.label);
            data.icon = dom.prepend(data.label.element, $('.quick-input-list-icon'));
            // Keybinding
            const keybindingContainer = dom.append(row1, $('.quick-input-list-entry-keybinding'));
            data.keybinding = new keybindingLabel_1.KeybindingLabel(keybindingContainer, platform.OS);
            // Detail
            const detailContainer = dom.append(row2, $('.quick-input-list-label-meta'));
            data.detail = new iconLabel_1.IconLabel(detailContainer, { supportHighlights: true, supportIcons: true, hoverDelegate: this.hoverDelegate });
            data.toDisposeTemplate.push(data.detail);
            // Separator
            data.separator = dom.append(data.entry, $('.quick-input-list-separator'));
            // Actions
            data.actionBar = new actionbar_1.ActionBar(data.entry, this.hoverDelegate ? { hoverDelegate: this.hoverDelegate } : undefined);
            data.actionBar.domNode.classList.add('quick-input-list-entry-action-bar');
            data.toDisposeTemplate.push(data.actionBar);
            return data;
        }
        renderElement(element, index, data) {
            data.element = element;
            element.element = data.entry ?? undefined;
            const mainItem = element.item ? element.item : element.separator;
            data.checkbox.checked = element.checked;
            data.toDisposeElement.push(element.onChecked(checked => data.checkbox.checked = checked));
            const { labelHighlights, descriptionHighlights, detailHighlights } = element;
            if (element.item?.iconPath) {
                const icon = (0, theme_1.isDark)(this.themeService.getColorTheme().type) ? element.item.iconPath.dark : (element.item.iconPath.light ?? element.item.iconPath.dark);
                const iconUrl = uri_1.URI.revive(icon);
                data.icon.className = 'quick-input-list-icon';
                data.icon.style.backgroundImage = dom.asCSSUrl(iconUrl);
            }
            else {
                data.icon.style.backgroundImage = '';
                data.icon.className = element.item?.iconClass ? `quick-input-list-icon ${element.item.iconClass}` : '';
            }
            // Label
            const options = {
                matches: labelHighlights || [],
                // If we have a tooltip, we want that to be shown and not any other hover
                descriptionTitle: element.saneTooltip ? undefined : element.saneDescription,
                descriptionMatches: descriptionHighlights || [],
                labelEscapeNewLines: true
            };
            if (mainItem.type !== 'separator') {
                options.extraClasses = mainItem.iconClasses;
                options.italic = mainItem.italic;
                options.strikethrough = mainItem.strikethrough;
                data.entry.classList.remove('quick-input-list-separator-as-item');
            }
            else {
                data.entry.classList.add('quick-input-list-separator-as-item');
            }
            data.label.setLabel(element.saneLabel, element.saneDescription, options);
            // Keybinding
            data.keybinding.set(mainItem.type === 'separator' ? undefined : mainItem.keybinding);
            // Detail
            if (element.saneDetail) {
                data.detail.element.style.display = '';
                data.detail.setLabel(element.saneDetail, undefined, {
                    matches: detailHighlights,
                    // If we have a tooltip, we want that to be shown and not any other hover
                    title: element.saneTooltip ? undefined : element.saneDetail,
                    labelEscapeNewLines: true
                });
            }
            else {
                data.detail.element.style.display = 'none';
            }
            // Separator
            if (element.item && element.separator && element.separator.label) {
                data.separator.textContent = element.separator.label;
                data.separator.style.display = '';
            }
            else {
                data.separator.style.display = 'none';
            }
            data.entry.classList.toggle('quick-input-list-separator-border', !!element.separator);
            // Actions
            const buttons = mainItem.buttons;
            if (buttons && buttons.length) {
                data.actionBar.push(buttons.map((button, index) => (0, quickInputUtils_1.quickInputButtonToAction)(button, `id-${index}`, () => mainItem.type !== 'separator'
                    ? element.fireButtonTriggered({ button, item: mainItem })
                    : element.fireSeparatorButtonTriggered({ button, separator: mainItem }))), { icon: true, label: false });
                data.entry.classList.add('has-actions');
            }
            else {
                data.entry.classList.remove('has-actions');
            }
        }
        disposeElement(element, index, data) {
            data.toDisposeElement = (0, lifecycle_1.dispose)(data.toDisposeElement);
            data.actionBar.clear();
        }
        disposeTemplate(data) {
            data.toDisposeElement = (0, lifecycle_1.dispose)(data.toDisposeElement);
            data.toDisposeTemplate = (0, lifecycle_1.dispose)(data.toDisposeTemplate);
        }
    }
    class ListElementDelegate {
        getHeight(element) {
            if (!element.item) {
                // must be a separator
                return 24;
            }
            return element.saneDetail ? 44 : 22;
        }
        getTemplateId(element) {
            return ListElementRenderer.ID;
        }
    }
    var QuickInputListFocus;
    (function (QuickInputListFocus) {
        QuickInputListFocus[QuickInputListFocus["First"] = 1] = "First";
        QuickInputListFocus[QuickInputListFocus["Second"] = 2] = "Second";
        QuickInputListFocus[QuickInputListFocus["Last"] = 3] = "Last";
        QuickInputListFocus[QuickInputListFocus["Next"] = 4] = "Next";
        QuickInputListFocus[QuickInputListFocus["Previous"] = 5] = "Previous";
        QuickInputListFocus[QuickInputListFocus["NextPage"] = 6] = "NextPage";
        QuickInputListFocus[QuickInputListFocus["PreviousPage"] = 7] = "PreviousPage";
    })(QuickInputListFocus || (exports.QuickInputListFocus = QuickInputListFocus = {}));
    class QuickInputList {
        constructor(parent, id, options, themeService) {
            this.parent = parent;
            this.options = options;
            this.inputElements = [];
            this.elements = [];
            this.elementsToIndexes = new Map();
            this.matchOnDescription = false;
            this.matchOnDetail = false;
            this.matchOnLabel = true;
            this.matchOnLabelMode = 'fuzzy';
            this.matchOnMeta = true;
            this.sortByLabel = true;
            this._onChangedAllVisibleChecked = new event_1.Emitter();
            this.onChangedAllVisibleChecked = this._onChangedAllVisibleChecked.event;
            this._onChangedCheckedCount = new event_1.Emitter();
            this.onChangedCheckedCount = this._onChangedCheckedCount.event;
            this._onChangedVisibleCount = new event_1.Emitter();
            this.onChangedVisibleCount = this._onChangedVisibleCount.event;
            this._onChangedCheckedElements = new event_1.Emitter();
            this.onChangedCheckedElements = this._onChangedCheckedElements.event;
            this._onButtonTriggered = new event_1.Emitter();
            this.onButtonTriggered = this._onButtonTriggered.event;
            this._onSeparatorButtonTriggered = new event_1.Emitter();
            this.onSeparatorButtonTriggered = this._onSeparatorButtonTriggered.event;
            this._onKeyDown = new event_1.Emitter();
            this.onKeyDown = this._onKeyDown.event;
            this._onLeave = new event_1.Emitter();
            this.onLeave = this._onLeave.event;
            this._listElementChecked = new event_1.Emitter();
            this._fireCheckedEvents = true;
            this.elementDisposables = [];
            this.disposables = [];
            this.id = id;
            this.container = dom.append(this.parent, $('.quick-input-list'));
            const delegate = new ListElementDelegate();
            const accessibilityProvider = new QuickInputAccessibilityProvider();
            this.list = options.createList('QuickInput', this.container, delegate, [new ListElementRenderer(themeService, options.hoverDelegate)], {
                identityProvider: {
                    getId: element => {
                        // always prefer item over separator because if item is defined, it must be the main item type
                        // always prefer a defined id if one was specified and use label as a fallback
                        return element.item?.id
                            ?? element.item?.label
                            ?? element.separator?.id
                            ?? element.separator?.label
                            ?? '';
                    }
                },
                setRowLineHeight: false,
                multipleSelectionSupport: false,
                horizontalScrolling: false,
                accessibilityProvider
            });
            this.list.getHTMLElement().id = id;
            this.disposables.push(this.list);
            this.disposables.push(this.list.onKeyDown(e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                switch (event.keyCode) {
                    case 10 /* KeyCode.Space */:
                        this.toggleCheckbox();
                        break;
                    case 31 /* KeyCode.KeyA */:
                        if (platform.isMacintosh ? e.metaKey : e.ctrlKey) {
                            this.list.setFocus((0, arrays_1.range)(this.list.length));
                        }
                        break;
                    case 16 /* KeyCode.UpArrow */: {
                        const focus1 = this.list.getFocus();
                        if (focus1.length === 1 && focus1[0] === 0) {
                            this._onLeave.fire();
                        }
                        break;
                    }
                    case 18 /* KeyCode.DownArrow */: {
                        const focus2 = this.list.getFocus();
                        if (focus2.length === 1 && focus2[0] === this.list.length - 1) {
                            this._onLeave.fire();
                        }
                        break;
                    }
                }
                this._onKeyDown.fire(event);
            }));
            this.disposables.push(this.list.onMouseDown(e => {
                if (e.browserEvent.button !== 2) {
                    // Works around / fixes #64350.
                    e.browserEvent.preventDefault();
                }
            }));
            this.disposables.push(dom.addDisposableListener(this.container, dom.EventType.CLICK, e => {
                if (e.x || e.y) { // Avoid 'click' triggered by 'space' on checkbox.
                    this._onLeave.fire();
                }
            }));
            this.disposables.push(this.list.onMouseMiddleClick(e => {
                this._onLeave.fire();
            }));
            this.disposables.push(this.list.onContextMenu(e => {
                if (typeof e.index === 'number') {
                    e.browserEvent.preventDefault();
                    // we want to treat a context menu event as
                    // a gesture to open the item at the index
                    // since we do not have any context menu
                    // this enables for example macOS to Ctrl-
                    // click on an item to open it.
                    this.list.setSelection([e.index]);
                }
            }));
            const delayer = new async_1.ThrottledDelayer(options.hoverDelegate.delay);
            // onMouseOver triggers every time a new element has been moused over
            // even if it's on the same list item.
            this.disposables.push(this.list.onMouseOver(async (e) => {
                // If we hover over an anchor element, we don't want to show the hover because
                // the anchor may have a tooltip that we want to show instead.
                if (e.browserEvent.target instanceof HTMLAnchorElement) {
                    delayer.cancel();
                    return;
                }
                if (
                // anchors are an exception as called out above so we skip them here
                !(e.browserEvent.relatedTarget instanceof HTMLAnchorElement) &&
                    // check if the mouse is still over the same element
                    dom.isAncestor(e.browserEvent.relatedTarget, e.element?.element)) {
                    return;
                }
                try {
                    await delayer.trigger(async () => {
                        if (e.element) {
                            this.showHover(e.element);
                        }
                    });
                }
                catch (e) {
                    // Ignore cancellation errors due to mouse out
                    if (!(0, errors_1.isCancellationError)(e)) {
                        throw e;
                    }
                }
            }));
            this.disposables.push(this.list.onMouseOut(e => {
                // onMouseOut triggers every time a new element has been moused over
                // even if it's on the same list item. We only want one event, so we
                // check if the mouse is still over the same element.
                if (dom.isAncestor(e.browserEvent.relatedTarget, e.element?.element)) {
                    return;
                }
                delayer.cancel();
            }));
            this.disposables.push(delayer);
            this.disposables.push(this._listElementChecked.event(_ => this.fireCheckedEvents()));
            this.disposables.push(this._onChangedAllVisibleChecked, this._onChangedCheckedCount, this._onChangedVisibleCount, this._onChangedCheckedElements, this._onButtonTriggered, this._onSeparatorButtonTriggered, this._onLeave, this._onKeyDown);
        }
        get onDidChangeFocus() {
            return event_1.Event.map(this.list.onDidChangeFocus, e => e.elements.map(e => e.item));
        }
        get onDidChangeSelection() {
            return event_1.Event.map(this.list.onDidChangeSelection, e => ({ items: e.elements.map(e => e.item), event: e.browserEvent }));
        }
        get scrollTop() {
            return this.list.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.list.scrollTop = scrollTop;
        }
        get ariaLabel() {
            return this.list.getHTMLElement().ariaLabel;
        }
        set ariaLabel(label) {
            this.list.getHTMLElement().ariaLabel = label;
        }
        getAllVisibleChecked() {
            return this.allVisibleChecked(this.elements, false);
        }
        allVisibleChecked(elements, whenNoneVisible = true) {
            for (let i = 0, n = elements.length; i < n; i++) {
                const element = elements[i];
                if (!element.hidden) {
                    if (!element.checked) {
                        return false;
                    }
                    else {
                        whenNoneVisible = true;
                    }
                }
            }
            return whenNoneVisible;
        }
        getCheckedCount() {
            let count = 0;
            const elements = this.elements;
            for (let i = 0, n = elements.length; i < n; i++) {
                if (elements[i].checked) {
                    count++;
                }
            }
            return count;
        }
        getVisibleCount() {
            let count = 0;
            const elements = this.elements;
            for (let i = 0, n = elements.length; i < n; i++) {
                if (!elements[i].hidden) {
                    count++;
                }
            }
            return count;
        }
        setAllVisibleChecked(checked) {
            try {
                this._fireCheckedEvents = false;
                this.elements.forEach(element => {
                    if (!element.hidden) {
                        element.checked = checked;
                    }
                });
            }
            finally {
                this._fireCheckedEvents = true;
                this.fireCheckedEvents();
            }
        }
        setElements(inputElements) {
            this.elementDisposables = (0, lifecycle_1.dispose)(this.elementDisposables);
            const fireButtonTriggered = (event) => this.fireButtonTriggered(event);
            const fireSeparatorButtonTriggered = (event) => this.fireSeparatorButtonTriggered(event);
            this.inputElements = inputElements;
            const elementsToIndexes = new Map();
            const hasCheckbox = this.parent.classList.contains('show-checkboxes');
            this.elements = inputElements.reduce((result, item, index) => {
                const previous = index > 0 ? inputElements[index - 1] : undefined;
                if (item.type === 'separator') {
                    if (!item.buttons) {
                        // This separator will be rendered as a part of the list item
                        return result;
                    }
                }
                const element = new ListElement(item, previous, index, hasCheckbox, fireButtonTriggered, fireSeparatorButtonTriggered, this._listElementChecked);
                const resultIndex = result.length;
                result.push(element);
                elementsToIndexes.set(element.item ?? element.separator, resultIndex);
                return result;
            }, []);
            this.elementsToIndexes = elementsToIndexes;
            this.list.splice(0, this.list.length); // Clear focus and selection first, sending the events when the list is empty.
            this.list.splice(0, this.list.length, this.elements);
            this._onChangedVisibleCount.fire(this.elements.length);
        }
        getElementsCount() {
            return this.inputElements.length;
        }
        getFocusedElements() {
            return this.list.getFocusedElements()
                .map(e => e.item);
        }
        setFocusedElements(items) {
            this.list.setFocus(items
                .filter(item => this.elementsToIndexes.has(item))
                .map(item => this.elementsToIndexes.get(item)));
            if (items.length > 0) {
                const focused = this.list.getFocus()[0];
                if (typeof focused === 'number') {
                    this.list.reveal(focused);
                }
            }
        }
        getActiveDescendant() {
            return this.list.getHTMLElement().getAttribute('aria-activedescendant');
        }
        getSelectedElements() {
            return this.list.getSelectedElements()
                .map(e => e.item);
        }
        setSelectedElements(items) {
            this.list.setSelection(items
                .filter(item => this.elementsToIndexes.has(item))
                .map(item => this.elementsToIndexes.get(item)));
        }
        getCheckedElements() {
            return this.elements.filter(e => e.checked)
                .map(e => e.item)
                .filter(e => !!e);
        }
        setCheckedElements(items) {
            try {
                this._fireCheckedEvents = false;
                const checked = new Set();
                for (const item of items) {
                    checked.add(item);
                }
                for (const element of this.elements) {
                    element.checked = checked.has(element.item);
                }
            }
            finally {
                this._fireCheckedEvents = true;
                this.fireCheckedEvents();
            }
        }
        set enabled(value) {
            this.list.getHTMLElement().style.pointerEvents = value ? '' : 'none';
        }
        focus(what) {
            if (!this.list.length) {
                return;
            }
            if (what === QuickInputListFocus.Second && this.list.length < 2) {
                what = QuickInputListFocus.First;
            }
            switch (what) {
                case QuickInputListFocus.First:
                    this.list.scrollTop = 0;
                    this.list.focusFirst(undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.Second:
                    this.list.scrollTop = 0;
                    this.list.focusNth(1, undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.Last:
                    this.list.scrollTop = this.list.scrollHeight;
                    this.list.focusLast(undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.Next: {
                    this.list.focusNext(undefined, true, undefined, (e) => !!e.item);
                    const index = this.list.getFocus()[0];
                    if (index !== 0 && !this.elements[index - 1].item && this.list.firstVisibleIndex > index - 1) {
                        this.list.reveal(index - 1);
                    }
                    break;
                }
                case QuickInputListFocus.Previous: {
                    this.list.focusPrevious(undefined, true, undefined, (e) => !!e.item);
                    const index = this.list.getFocus()[0];
                    if (index !== 0 && !this.elements[index - 1].item && this.list.firstVisibleIndex > index - 1) {
                        this.list.reveal(index - 1);
                    }
                    break;
                }
                case QuickInputListFocus.NextPage:
                    this.list.focusNextPage(undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.PreviousPage:
                    this.list.focusPreviousPage(undefined, (e) => !!e.item);
                    break;
            }
            const focused = this.list.getFocus()[0];
            if (typeof focused === 'number') {
                this.list.reveal(focused);
            }
        }
        clearFocus() {
            this.list.setFocus([]);
        }
        domFocus() {
            this.list.domFocus();
        }
        /**
         * Disposes of the hover and shows a new one for the given index if it has a tooltip.
         * @param element The element to show the hover for
         */
        showHover(element) {
            if (this._lastHover && !this._lastHover.isDisposed) {
                this.options.hoverDelegate.onDidHideHover?.();
                this._lastHover?.dispose();
            }
            if (!element.element || !element.saneTooltip) {
                return;
            }
            this._lastHover = this.options.hoverDelegate.showHover({
                content: element.saneTooltip,
                target: element.element,
                linkHandler: (url) => {
                    this.options.linkOpenerDelegate(url);
                },
                appearance: {
                    showPointer: true,
                },
                container: this.container,
                position: {
                    hoverPosition: 1 /* HoverPosition.RIGHT */
                }
            }, false);
        }
        layout(maxHeight) {
            this.list.getHTMLElement().style.maxHeight = maxHeight ? `${
            // Make sure height aligns with list item heights
            Math.floor(maxHeight / 44) * 44
                // Add some extra height so that it's clear there's more to scroll
                + 6}px` : '';
            this.list.layout();
        }
        filter(query) {
            if (!(this.sortByLabel || this.matchOnLabel || this.matchOnDescription || this.matchOnDetail)) {
                this.list.layout();
                return false;
            }
            const queryWithWhitespace = query;
            query = query.trim();
            // Reset filtering
            if (!query || !(this.matchOnLabel || this.matchOnDescription || this.matchOnDetail)) {
                this.elements.forEach(element => {
                    element.labelHighlights = undefined;
                    element.descriptionHighlights = undefined;
                    element.detailHighlights = undefined;
                    element.hidden = false;
                    const previous = element.index && this.inputElements[element.index - 1];
                    if (element.item) {
                        element.separator = previous && previous.type === 'separator' && !previous.buttons ? previous : undefined;
                    }
                });
            }
            // Filter by value (since we support icons in labels, use $(..) aware fuzzy matching)
            else {
                let currentSeparator;
                this.elements.forEach(element => {
                    let labelHighlights;
                    if (this.matchOnLabelMode === 'fuzzy') {
                        labelHighlights = this.matchOnLabel ? (0, iconLabels_1.matchesFuzzyIconAware)(query, (0, iconLabels_1.parseLabelWithIcons)(element.saneLabel)) ?? undefined : undefined;
                    }
                    else {
                        labelHighlights = this.matchOnLabel ? matchesContiguousIconAware(queryWithWhitespace, (0, iconLabels_1.parseLabelWithIcons)(element.saneLabel)) ?? undefined : undefined;
                    }
                    const descriptionHighlights = this.matchOnDescription ? (0, iconLabels_1.matchesFuzzyIconAware)(query, (0, iconLabels_1.parseLabelWithIcons)(element.saneDescription || '')) ?? undefined : undefined;
                    const detailHighlights = this.matchOnDetail ? (0, iconLabels_1.matchesFuzzyIconAware)(query, (0, iconLabels_1.parseLabelWithIcons)(element.saneDetail || '')) ?? undefined : undefined;
                    if (labelHighlights || descriptionHighlights || detailHighlights) {
                        element.labelHighlights = labelHighlights;
                        element.descriptionHighlights = descriptionHighlights;
                        element.detailHighlights = detailHighlights;
                        element.hidden = false;
                    }
                    else {
                        element.labelHighlights = undefined;
                        element.descriptionHighlights = undefined;
                        element.detailHighlights = undefined;
                        element.hidden = element.item ? !element.item.alwaysShow : true;
                    }
                    // Ensure separators are filtered out first before deciding if we need to bring them back
                    if (element.item) {
                        element.separator = undefined;
                    }
                    else if (element.separator) {
                        element.hidden = true;
                    }
                    // we can show the separator unless the list gets sorted by match
                    if (!this.sortByLabel) {
                        const previous = element.index && this.inputElements[element.index - 1];
                        currentSeparator = previous && previous.type === 'separator' ? previous : currentSeparator;
                        if (currentSeparator && !element.hidden) {
                            element.separator = currentSeparator;
                            currentSeparator = undefined;
                        }
                    }
                });
            }
            const shownElements = this.elements.filter(element => !element.hidden);
            // Sort by value
            if (this.sortByLabel && query) {
                const normalizedSearchValue = query.toLowerCase();
                shownElements.sort((a, b) => {
                    return compareEntries(a, b, normalizedSearchValue);
                });
            }
            this.elementsToIndexes = shownElements.reduce((map, element, index) => {
                map.set(element.item ?? element.separator, index);
                return map;
            }, new Map());
            this.list.splice(0, this.list.length, shownElements);
            this.list.setFocus([]);
            this.list.layout();
            this._onChangedAllVisibleChecked.fire(this.getAllVisibleChecked());
            this._onChangedVisibleCount.fire(shownElements.length);
            return true;
        }
        toggleCheckbox() {
            try {
                this._fireCheckedEvents = false;
                const elements = this.list.getFocusedElements();
                const allChecked = this.allVisibleChecked(elements);
                for (const element of elements) {
                    element.checked = !allChecked;
                }
            }
            finally {
                this._fireCheckedEvents = true;
                this.fireCheckedEvents();
            }
        }
        display(display) {
            this.container.style.display = display ? '' : 'none';
        }
        isDisplayed() {
            return this.container.style.display !== 'none';
        }
        dispose() {
            this.elementDisposables = (0, lifecycle_1.dispose)(this.elementDisposables);
            this.disposables = (0, lifecycle_1.dispose)(this.disposables);
        }
        fireCheckedEvents() {
            if (this._fireCheckedEvents) {
                this._onChangedAllVisibleChecked.fire(this.getAllVisibleChecked());
                this._onChangedCheckedCount.fire(this.getCheckedCount());
                this._onChangedCheckedElements.fire(this.getCheckedElements());
            }
        }
        fireButtonTriggered(event) {
            this._onButtonTriggered.fire(event);
        }
        fireSeparatorButtonTriggered(event) {
            this._onSeparatorButtonTriggered.fire(event);
        }
        style(styles) {
            this.list.style(styles);
        }
        toggleHover() {
            const element = this.list.getFocusedElements()[0];
            if (!element?.saneTooltip) {
                return;
            }
            // if there's a hover already, hide it (toggle off)
            if (this._lastHover && !this._lastHover.isDisposed) {
                this._lastHover.dispose();
                return;
            }
            // If there is no hover, show it (toggle on)
            const focused = this.list.getFocusedElements()[0];
            if (!focused) {
                return;
            }
            this.showHover(focused);
            const store = new lifecycle_1.DisposableStore();
            store.add(this.list.onDidChangeFocus(e => {
                if (e.indexes.length) {
                    this.showHover(e.elements[0]);
                }
            }));
            if (this._lastHover) {
                store.add(this._lastHover);
            }
            this._toggleHover = store;
            this.elementDisposables.push(this._toggleHover);
        }
    }
    exports.QuickInputList = QuickInputList;
    __decorate([
        decorators_1.memoize
    ], QuickInputList.prototype, "onDidChangeFocus", null);
    __decorate([
        decorators_1.memoize
    ], QuickInputList.prototype, "onDidChangeSelection", null);
    function matchesContiguousIconAware(query, target) {
        const { text, iconOffsets } = target;
        // Return early if there are no icon markers in the word to match against
        if (!iconOffsets || iconOffsets.length === 0) {
            return matchesContiguous(query, text);
        }
        // Trim the word to match against because it could have leading
        // whitespace now if the word started with an icon
        const wordToMatchAgainstWithoutIconsTrimmed = (0, strings_1.ltrim)(text, ' ');
        const leadingWhitespaceOffset = text.length - wordToMatchAgainstWithoutIconsTrimmed.length;
        // match on value without icon
        const matches = matchesContiguous(query, wordToMatchAgainstWithoutIconsTrimmed);
        // Map matches back to offsets with icon and trimming
        if (matches) {
            for (const match of matches) {
                const iconOffset = iconOffsets[match.start + leadingWhitespaceOffset] /* icon offsets at index */ + leadingWhitespaceOffset /* overall leading whitespace offset */;
                match.start += iconOffset;
                match.end += iconOffset;
            }
        }
        return matches;
    }
    function matchesContiguous(word, wordToMatchAgainst) {
        const matchIndex = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
        if (matchIndex !== -1) {
            return [{ start: matchIndex, end: matchIndex + word.length }];
        }
        return null;
    }
    function compareEntries(elementA, elementB, lookFor) {
        const labelHighlightsA = elementA.labelHighlights || [];
        const labelHighlightsB = elementB.labelHighlights || [];
        if (labelHighlightsA.length && !labelHighlightsB.length) {
            return -1;
        }
        if (!labelHighlightsA.length && labelHighlightsB.length) {
            return 1;
        }
        if (labelHighlightsA.length === 0 && labelHighlightsB.length === 0) {
            return 0;
        }
        return (0, comparers_1.compareAnything)(elementA.saneSortLabel, elementB.saneSortLabel, lookFor);
    }
    class QuickInputAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('quickInput', "Quick Input");
        }
        getAriaLabel(element) {
            return element.separator?.label
                ? `${element.saneAriaLabel}, ${element.separator.label}`
                : element.saneAriaLabel;
        }
        getWidgetRole() {
            return 'listbox';
        }
        getRole(element) {
            return element.hasCheckbox ? 'checkbox' : 'option';
        }
        isChecked(element) {
            if (!element.hasCheckbox) {
                return undefined;
            }
            return {
                value: element.checked,
                onDidChange: element.onChecked
            };
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dExpc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3F1aWNraW5wdXQvYnJvd3Nlci9xdWlja0lucHV0TGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7SUFtQ2hHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUEyQmhCLE1BQU0sV0FBVztRQXdCaEIsWUFDQyxRQUF1QixFQUN2QixRQUFtQyxFQUNuQyxLQUFhLEVBQ2IsV0FBb0IsRUFDcEIsbUJBQStFLEVBQy9FLDRCQUE2RSxFQUM3RSxnQkFBMEU7WUFuQjNFLCtCQUErQjtZQUN2QixhQUFRLEdBQVksS0FBSyxDQUFDO1lBQzFCLFlBQU8sR0FBWSxLQUFLLENBQUM7WUFtQmhDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztZQUMvQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsNEJBQTRCLENBQUM7WUFDakUsSUFBSSxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQztZQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLFdBQVc7Z0JBQzNCLENBQUMsQ0FBQyxhQUFLLENBQUMsR0FBRyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQWtELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQzlJLENBQUMsQ0FBQyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBRWQsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztZQUM1QixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7Z0JBQ3JCLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNwRSxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztnQkFDNUIsQ0FBQztnQkFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNuQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDO2dCQUNwRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO2dCQUNoRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDO2dCQUN0RCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3RDLENBQUM7WUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksV0FBSSxDQUFDLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ3ZDLE1BQU0sYUFBYSxHQUFHLElBQUEsZ0NBQW1CLEVBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVqRSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsU0FBUyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQztxQkFDNUYsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSxnQ0FBbUIsRUFBQyxDQUFDLENBQUMsQ0FBQztxQkFDaEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUViLE9BQU87b0JBQ04sU0FBUztvQkFDVCxhQUFhO29CQUNiLGFBQWE7aUJBQ2IsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELHVCQUF1QjtRQUV2QixJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsSUFBSSxhQUFhO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxJQUFJLGFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFDdkMsQ0FBQztRQUVELGFBQWE7UUFFYiw4QkFBOEI7UUFFOUIsSUFBSSxPQUFPO1lBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxLQUE4QjtZQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN2QixDQUFDO1FBRUQsSUFBSSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxLQUFjO1lBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVELElBQUksT0FBTyxDQUFDLEtBQWM7WUFDekIsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzdELENBQUM7UUFDRixDQUFDO1FBRUQsSUFBSSxTQUFTO1lBQ1osT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxJQUFJLFNBQVMsQ0FBQyxLQUFzQztZQUNuRCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN6QixDQUFDO1FBRUQsSUFBSSxlQUFlO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQzlCLENBQUM7UUFFRCxJQUFJLGVBQWUsQ0FBQyxLQUEyQjtZQUM5QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFJLHFCQUFxQjtZQUN4QixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztRQUNwQyxDQUFDO1FBRUQsSUFBSSxxQkFBcUIsQ0FBQyxLQUEyQjtZQUNwRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxJQUFJLGdCQUFnQjtZQUNuQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxLQUEyQjtZQUMvQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQ2hDLENBQUM7S0FHRDtJQWdCRCxNQUFNLG1CQUFtQjtpQkFFUixPQUFFLEdBQUcsYUFBYSxDQUFDO1FBRW5DLFlBQ2tCLFlBQTJCLEVBQzNCLGFBQXlDO1lBRHpDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQzNCLGtCQUFhLEdBQWIsYUFBYSxDQUE0QjtRQUN2RCxDQUFDO1FBRUwsSUFBSSxVQUFVO1lBQ2IsT0FBTyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUVELGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxNQUFNLElBQUksR0FBNkIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7WUFFNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBRWpFLFdBQVc7WUFDWCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdGLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsMkJBQTJCO29CQUM3RCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyw2RUFBNkU7Z0JBQ2xHLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFFBQVEsR0FBcUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQztZQUMxRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7WUFDaEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDdEcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE9BQU87WUFDUCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1lBQzVELE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDMUQsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztZQUUxRCxRQUFRO1lBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHFCQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLDRCQUE0QixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUN6SixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsSUFBSSxHQUFxQixHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7WUFFM0YsYUFBYTtZQUNiLE1BQU0sbUJBQW1CLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztZQUN0RixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksaUNBQWUsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFeEUsU0FBUztZQUNULE1BQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHFCQUFTLENBQUMsZUFBZSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ2pJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXpDLFlBQVk7WUFDWixJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDO1lBRTFFLFVBQVU7WUFDVixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTVDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELGFBQWEsQ0FBQyxPQUFxQixFQUFFLEtBQWEsRUFBRSxJQUE4QjtZQUNqRixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDO1lBQzFDLE1BQU0sUUFBUSxHQUFrQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBVSxDQUFDO1lBRWpGLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDeEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUUxRixNQUFNLEVBQUUsZUFBZSxFQUFFLHFCQUFxQixFQUFFLGdCQUFnQixFQUFFLEdBQUcsT0FBTyxDQUFDO1lBRTdFLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLEdBQUcsSUFBQSxjQUFNLEVBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkosTUFBTSxPQUFPLEdBQUcsU0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pELENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMseUJBQXlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUN4RyxDQUFDO1lBRUQsUUFBUTtZQUNSLE1BQU0sT0FBTyxHQUEyQjtnQkFDdkMsT0FBTyxFQUFFLGVBQWUsSUFBSSxFQUFFO2dCQUM5Qix5RUFBeUU7Z0JBQ3pFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWU7Z0JBQzNFLGtCQUFrQixFQUFFLHFCQUFxQixJQUFJLEVBQUU7Z0JBQy9DLG1CQUFtQixFQUFFLElBQUk7YUFDekIsQ0FBQztZQUNGLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUUsQ0FBQztnQkFDbkMsT0FBTyxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDO2dCQUM1QyxPQUFPLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQ2pDLE9BQU8sQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLG9DQUFvQyxDQUFDLENBQUM7WUFDbkUsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1lBQ2hFLENBQUM7WUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFekUsYUFBYTtZQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVyRixTQUFTO1lBQ1QsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRTtvQkFDbkQsT0FBTyxFQUFFLGdCQUFnQjtvQkFDekIseUVBQXlFO29CQUN6RSxLQUFLLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVTtvQkFDM0QsbUJBQW1CLEVBQUUsSUFBSTtpQkFDekIsQ0FBQyxDQUFDO1lBQ0osQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQzVDLENBQUM7WUFFRCxZQUFZO1lBQ1osSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDbkMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdkMsQ0FBQztZQUNELElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXRGLFVBQVU7WUFDVixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQ2pDLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUEsMENBQXdCLEVBQzFFLE1BQU0sRUFDTixNQUFNLEtBQUssRUFBRSxFQUNiLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssV0FBVztvQkFDbEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUM7b0JBQ3pELENBQUMsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQ3hFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN6QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVDLENBQUM7UUFDRixDQUFDO1FBRUQsY0FBYyxDQUFDLE9BQXFCLEVBQUUsS0FBYSxFQUFFLElBQThCO1lBQ2xGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRUQsZUFBZSxDQUFDLElBQThCO1lBQzdDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMxRCxDQUFDOztJQUdGLE1BQU0sbUJBQW1CO1FBRXhCLFNBQVMsQ0FBQyxPQUFxQjtZQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNuQixzQkFBc0I7Z0JBQ3RCLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUNELE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVELGFBQWEsQ0FBQyxPQUFxQjtZQUNsQyxPQUFPLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0Q7SUFFRCxJQUFZLG1CQVFYO0lBUkQsV0FBWSxtQkFBbUI7UUFDOUIsK0RBQVMsQ0FBQTtRQUNULGlFQUFNLENBQUE7UUFDTiw2REFBSSxDQUFBO1FBQ0osNkRBQUksQ0FBQTtRQUNKLHFFQUFRLENBQUE7UUFDUixxRUFBUSxDQUFBO1FBQ1IsNkVBQVksQ0FBQTtJQUNiLENBQUMsRUFSVyxtQkFBbUIsbUNBQW5CLG1CQUFtQixRQVE5QjtJQUVELE1BQWEsY0FBYztRQXFDMUIsWUFDUyxNQUFtQixFQUMzQixFQUFVLEVBQ0YsT0FBMkIsRUFDbkMsWUFBMkI7WUFIbkIsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUVuQixZQUFPLEdBQVAsT0FBTyxDQUFvQjtZQW5DNUIsa0JBQWEsR0FBeUIsRUFBRSxDQUFDO1lBQ3pDLGFBQVEsR0FBbUIsRUFBRSxDQUFDO1lBQzlCLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1lBQzdELHVCQUFrQixHQUFHLEtBQUssQ0FBQztZQUMzQixrQkFBYSxHQUFHLEtBQUssQ0FBQztZQUN0QixpQkFBWSxHQUFHLElBQUksQ0FBQztZQUNwQixxQkFBZ0IsR0FBMkIsT0FBTyxDQUFDO1lBQ25ELGdCQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ25CLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ0YsZ0NBQTJCLEdBQUcsSUFBSSxlQUFPLEVBQVcsQ0FBQztZQUN0RSwrQkFBMEIsR0FBbUIsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQztZQUNuRSwyQkFBc0IsR0FBRyxJQUFJLGVBQU8sRUFBVSxDQUFDO1lBQ2hFLDBCQUFxQixHQUFrQixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBQ3hELDJCQUFzQixHQUFHLElBQUksZUFBTyxFQUFVLENBQUM7WUFDaEUsMEJBQXFCLEdBQWtCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFDeEQsOEJBQXlCLEdBQUcsSUFBSSxlQUFPLEVBQW9CLENBQUM7WUFDN0UsNkJBQXdCLEdBQTRCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUM7WUFDeEUsdUJBQWtCLEdBQUcsSUFBSSxlQUFPLEVBQTZDLENBQUM7WUFDL0Ysc0JBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztZQUNqQyxnQ0FBMkIsR0FBRyxJQUFJLGVBQU8sRUFBa0MsQ0FBQztZQUM3RiwrQkFBMEIsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDO1lBQ25ELGVBQVUsR0FBRyxJQUFJLGVBQU8sRUFBeUIsQ0FBQztZQUNuRSxjQUFTLEdBQWlDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQy9DLGFBQVEsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ2hELFlBQU8sR0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDMUIsd0JBQW1CLEdBQUcsSUFBSSxlQUFPLEVBQW1ELENBQUM7WUFDOUYsdUJBQWtCLEdBQUcsSUFBSSxDQUFDO1lBQzFCLHVCQUFrQixHQUFrQixFQUFFLENBQUM7WUFDdkMsZ0JBQVcsR0FBa0IsRUFBRSxDQUFDO1lBVXZDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUNqRSxNQUFNLFFBQVEsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7WUFDM0MsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLCtCQUErQixFQUFFLENBQUM7WUFDcEUsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLElBQUksbUJBQW1CLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFO2dCQUN0SSxnQkFBZ0IsRUFBRTtvQkFDakIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNoQiw4RkFBOEY7d0JBQzlGLDhFQUE4RTt3QkFDOUUsT0FBTyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUU7K0JBQ25CLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSzsrQkFDbkIsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFOytCQUNyQixPQUFPLENBQUMsU0FBUyxFQUFFLEtBQUs7K0JBQ3hCLEVBQUUsQ0FBQztvQkFDUixDQUFDO2lCQUNEO2dCQUNELGdCQUFnQixFQUFFLEtBQUs7Z0JBQ3ZCLHdCQUF3QixFQUFFLEtBQUs7Z0JBQy9CLG1CQUFtQixFQUFFLEtBQUs7Z0JBQzFCLHFCQUFxQjthQUNTLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFJLHFDQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxRQUFRLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDdkI7d0JBQ0MsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUN0QixNQUFNO29CQUNQO3dCQUNDLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDOzRCQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFBLGNBQUssRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQzdDLENBQUM7d0JBQ0QsTUFBTTtvQkFDUCw2QkFBb0IsQ0FBQyxDQUFDLENBQUM7d0JBQ3RCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ3BDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDOzRCQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUN0QixDQUFDO3dCQUNELE1BQU07b0JBQ1AsQ0FBQztvQkFDRCwrQkFBc0IsQ0FBQyxDQUFDLENBQUM7d0JBQ3hCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ3BDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDOzRCQUMvRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUN0QixDQUFDO3dCQUNELE1BQU07b0JBQ1AsQ0FBQztnQkFDRixDQUFDO2dCQUVELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDL0MsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDakMsK0JBQStCO29CQUMvQixDQUFDLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNqQyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUN4RixJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsa0RBQWtEO29CQUNuRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN0QixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNqRCxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFFaEMsMkNBQTJDO29CQUMzQywwQ0FBMEM7b0JBQzFDLHdDQUF3QztvQkFDeEMsMENBQTBDO29CQUMxQywrQkFBK0I7b0JBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxPQUFPLEdBQUcsSUFBSSx3QkFBZ0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xFLHFFQUFxRTtZQUNyRSxzQ0FBc0M7WUFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxFQUFFO2dCQUNyRCw4RUFBOEU7Z0JBQzlFLDhEQUE4RDtnQkFDOUQsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sWUFBWSxpQkFBaUIsRUFBRSxDQUFDO29CQUN4RCxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2pCLE9BQU87Z0JBQ1IsQ0FBQztnQkFDRDtnQkFDQyxvRUFBb0U7Z0JBQ3BFLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGFBQWEsWUFBWSxpQkFBaUIsQ0FBQztvQkFDNUQsb0RBQW9EO29CQUNwRCxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsYUFBcUIsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQWUsQ0FBQyxFQUMvRSxDQUFDO29CQUNGLE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxJQUFJLENBQUM7b0JBQ0osTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUNoQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs0QkFDZixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDM0IsQ0FBQztvQkFDRixDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDO2dCQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ1osOENBQThDO29CQUM5QyxJQUFJLENBQUMsSUFBQSw0QkFBbUIsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUM3QixNQUFNLENBQUMsQ0FBQztvQkFDVCxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzlDLG9FQUFvRTtnQkFDcEUsb0VBQW9FO2dCQUNwRSxxREFBcUQ7Z0JBQ3JELElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGFBQXFCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFlLENBQUMsRUFBRSxDQUFDO29CQUN0RixPQUFPO2dCQUNSLENBQUM7Z0JBQ0QsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JGLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUNwQixJQUFJLENBQUMsMkJBQTJCLEVBQ2hDLElBQUksQ0FBQyxzQkFBc0IsRUFDM0IsSUFBSSxDQUFDLHNCQUFzQixFQUMzQixJQUFJLENBQUMseUJBQXlCLEVBQzlCLElBQUksQ0FBQyxrQkFBa0IsRUFDdkIsSUFBSSxDQUFDLDJCQUEyQixFQUNoQyxJQUFJLENBQUMsUUFBUSxFQUNiLElBQUksQ0FBQyxVQUFVLENBQ2YsQ0FBQztRQUNILENBQUM7UUFHRCxJQUFJLGdCQUFnQjtZQUNuQixPQUFPLGFBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUdELElBQUksb0JBQW9CO1lBQ3ZCLE9BQU8sYUFBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4SCxDQUFDO1FBRUQsSUFBSSxTQUFTO1lBQ1osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM1QixDQUFDO1FBRUQsSUFBSSxTQUFTLENBQUMsU0FBaUI7WUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsU0FBUyxDQUFDO1FBQzdDLENBQUM7UUFFRCxJQUFJLFNBQVMsQ0FBQyxLQUFvQjtZQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDOUMsQ0FBQztRQUVELG9CQUFvQjtZQUNuQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFTyxpQkFBaUIsQ0FBQyxRQUF3QixFQUFFLGVBQWUsR0FBRyxJQUFJO1lBQ3pFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDakQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUN0QixPQUFPLEtBQUssQ0FBQztvQkFDZCxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsZUFBZSxHQUFHLElBQUksQ0FBQztvQkFDeEIsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUNELE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxlQUFlO1lBQ2QsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2pELElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN6QixLQUFLLEVBQUUsQ0FBQztnQkFDVCxDQUFDO1lBQ0YsQ0FBQztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELGVBQWU7WUFDZCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDekIsS0FBSyxFQUFFLENBQUM7Z0JBQ1QsQ0FBQztZQUNGLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUM7Z0JBQ0osSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztnQkFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ3JCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO29CQUMzQixDQUFDO2dCQUNGLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztvQkFBUyxDQUFDO2dCQUNWLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzFCLENBQUM7UUFDRixDQUFDO1FBRUQsV0FBVyxDQUFDLGFBQW1DO1lBQzlDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDM0QsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLEtBQWdELEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsSCxNQUFNLDRCQUE0QixHQUFHLENBQUMsS0FBcUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pILElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1lBQ25DLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7WUFDM0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDNUQsTUFBTSxRQUFRLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUNsRSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7b0JBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ25CLDZEQUE2RDt3QkFDN0QsT0FBTyxNQUFNLENBQUM7b0JBQ2YsQ0FBQztnQkFDRixDQUFDO2dCQUVELE1BQU0sT0FBTyxHQUFHLElBQUksV0FBVyxDQUM5QixJQUFJLEVBQ0osUUFBUSxFQUNSLEtBQUssRUFDTCxXQUFXLEVBQ1gsbUJBQW1CLEVBQ25CLDRCQUE0QixFQUM1QixJQUFJLENBQUMsbUJBQW1CLENBQ3hCLENBQUM7Z0JBRUYsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckIsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLFNBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDdkUsT0FBTyxNQUFNLENBQUM7WUFDZixDQUFDLEVBQUUsRUFBb0IsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztZQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDhFQUE4RTtZQUNySCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsZ0JBQWdCO1lBQ2YsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztRQUNsQyxDQUFDO1FBRUQsa0JBQWtCO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtpQkFDbkMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxLQUF1QjtZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLO2lCQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNoRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMzQixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFRCxtQkFBbUI7WUFDbEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFlBQVksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxtQkFBbUI7WUFDbEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2lCQUNwQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUVELG1CQUFtQixDQUFDLEtBQXVCO1lBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUs7aUJBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2hELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxrQkFBa0I7WUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7aUJBQ3pDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7aUJBQ2hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQXFCLENBQUM7UUFDeEMsQ0FBQztRQUVELGtCQUFrQixDQUFDLEtBQXVCO1lBQ3pDLElBQUksQ0FBQztnQkFDSixJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO2dCQUNoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUMxQixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuQixDQUFDO2dCQUNELEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNyQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3QyxDQUFDO1lBQ0YsQ0FBQztvQkFBUyxDQUFDO2dCQUNWLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzFCLENBQUM7UUFDRixDQUFDO1FBRUQsSUFBSSxPQUFPLENBQUMsS0FBYztZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUN0RSxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQXlCO1lBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN2QixPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUksSUFBSSxLQUFLLG1CQUFtQixDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDakUsSUFBSSxHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQUNsQyxDQUFDO1lBRUQsUUFBUSxJQUFJLEVBQUUsQ0FBQztnQkFDZCxLQUFLLG1CQUFtQixDQUFDLEtBQUs7b0JBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqRCxNQUFNO2dCQUNQLEtBQUssbUJBQW1CLENBQUMsTUFBTTtvQkFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO29CQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsRCxNQUFNO2dCQUNQLEtBQUssbUJBQW1CLENBQUMsSUFBSTtvQkFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7b0JBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDaEQsTUFBTTtnQkFDUCxLQUFLLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0QyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQzlGLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsQ0FBQztvQkFDRCxNQUFNO2dCQUNQLENBQUM7Z0JBQ0QsS0FBSyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDckUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUM5RixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLENBQUM7b0JBQ0QsTUFBTTtnQkFDUCxDQUFDO2dCQUNELEtBQUssbUJBQW1CLENBQUMsUUFBUTtvQkFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwRCxNQUFNO2dCQUNQLEtBQUssbUJBQW1CLENBQUMsWUFBWTtvQkFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3hELE1BQU07WUFDUixDQUFDO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzQixDQUFDO1FBQ0YsQ0FBQztRQUVELFVBQVU7WUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBRUQsUUFBUTtZQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQUVEOzs7V0FHRztRQUNLLFNBQVMsQ0FBQyxPQUFxQjtZQUN0QyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQzVCLENBQUM7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDOUMsT0FBTztZQUNSLENBQUM7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztnQkFDdEQsT0FBTyxFQUFFLE9BQU8sQ0FBQyxXQUFZO2dCQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLE9BQVE7Z0JBQ3hCLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO29CQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO2dCQUNELFVBQVUsRUFBRTtvQkFDWCxXQUFXLEVBQUUsSUFBSTtpQkFDakI7Z0JBQ0QsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6QixRQUFRLEVBQUU7b0JBQ1QsYUFBYSw2QkFBcUI7aUJBQ2xDO2FBQ0QsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNYLENBQUM7UUFFRCxNQUFNLENBQUMsU0FBa0I7WUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRztZQUMzRCxpREFBaUQ7WUFDakQsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRTtnQkFDL0Isa0VBQWtFO2tCQUNoRSxDQUNGLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQWE7WUFDbkIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztnQkFDL0YsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbkIsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBRUQsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUM7WUFDbEMsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVyQixrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JGLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUMvQixPQUFPLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztvQkFDcEMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLFNBQVMsQ0FBQztvQkFDMUMsT0FBTyxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztvQkFDckMsT0FBTyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7b0JBQ3ZCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN4RSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDbEIsT0FBTyxDQUFDLFNBQVMsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxXQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztvQkFDM0csQ0FBQztnQkFDRixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxxRkFBcUY7aUJBQ2hGLENBQUM7Z0JBQ0wsSUFBSSxnQkFBaUQsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQy9CLElBQUksZUFBcUMsQ0FBQztvQkFDMUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEtBQUssT0FBTyxFQUFFLENBQUM7d0JBQ3ZDLGVBQWUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFBLGtDQUFxQixFQUFDLEtBQUssRUFBRSxJQUFBLGdDQUFtQixFQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO29CQUNySSxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsZUFBZSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLG1CQUFtQixFQUFFLElBQUEsZ0NBQW1CLEVBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7b0JBQ3hKLENBQUM7b0JBQ0QsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLElBQUEsa0NBQXFCLEVBQUMsS0FBSyxFQUFFLElBQUEsZ0NBQW1CLEVBQUMsT0FBTyxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO29CQUNsSyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUEsa0NBQXFCLEVBQUMsS0FBSyxFQUFFLElBQUEsZ0NBQW1CLEVBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO29CQUVuSixJQUFJLGVBQWUsSUFBSSxxQkFBcUIsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO3dCQUNsRSxPQUFPLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQzt3QkFDMUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLHFCQUFxQixDQUFDO3dCQUN0RCxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7d0JBQzVDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO29CQUN4QixDQUFDO3lCQUFNLENBQUM7d0JBQ1AsT0FBTyxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7d0JBQ3BDLE9BQU8sQ0FBQyxxQkFBcUIsR0FBRyxTQUFTLENBQUM7d0JBQzFDLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7d0JBQ3JDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNqRSxDQUFDO29CQUVELHlGQUF5RjtvQkFDekYsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ2xCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO29CQUMvQixDQUFDO3lCQUFNLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUM5QixPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztvQkFDdkIsQ0FBQztvQkFFRCxpRUFBaUU7b0JBQ2pFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQ3ZCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUN4RSxnQkFBZ0IsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7d0JBQzNGLElBQUksZ0JBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7NEJBQ3pDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsZ0JBQWdCLENBQUM7NEJBQ3JDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQzt3QkFDOUIsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdkUsZ0JBQWdCO1lBQ2hCLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxxQkFBcUIsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ2xELGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzNCLE9BQU8sY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztnQkFDcEQsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNyRSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLFNBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDbkQsT0FBTyxHQUFHLENBQUM7WUFDWixDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQXlCLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVuQixJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdkQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsY0FBYztZQUNiLElBQUksQ0FBQztnQkFDSixJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO2dCQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQ2hELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDcEQsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDaEMsT0FBTyxDQUFDLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQztnQkFDL0IsQ0FBQztZQUNGLENBQUM7b0JBQVMsQ0FBQztnQkFDVixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO2dCQUMvQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMxQixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sQ0FBQyxPQUFnQjtZQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUN0RCxDQUFDO1FBRUQsV0FBVztZQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLE1BQU0sQ0FBQztRQUNoRCxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7WUFDaEUsQ0FBQztRQUNGLENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxLQUFnRDtZQUMzRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFTyw0QkFBNEIsQ0FBQyxLQUFxQztZQUN6RSxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxLQUFLLENBQUMsTUFBbUI7WUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVELFdBQVc7WUFDVixNQUFNLE9BQU8sR0FBNkIsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLENBQUM7Z0JBQzNCLE9BQU87WUFDUixDQUFDO1lBRUQsbURBQW1EO1lBQ25ELElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3BELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFCLE9BQU87WUFDUixDQUFDO1lBRUQsNENBQTRDO1lBQzVDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2QsT0FBTztZQUNSLENBQUM7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3BDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDckIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2pELENBQUM7S0FDRDtJQTltQkQsd0NBOG1CQztJQTdiQTtRQURDLG9CQUFPOzBEQUdQO0lBR0Q7UUFEQyxvQkFBTzs4REFHUDtJQXdiRixTQUFTLDBCQUEwQixDQUFDLEtBQWEsRUFBRSxNQUE2QjtRQUUvRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUVyQyx5RUFBeUU7UUFDekUsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzlDLE9BQU8saUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCwrREFBK0Q7UUFDL0Qsa0RBQWtEO1FBQ2xELE1BQU0scUNBQXFDLEdBQUcsSUFBQSxlQUFLLEVBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxxQ0FBcUMsQ0FBQyxNQUFNLENBQUM7UUFFM0YsOEJBQThCO1FBQzlCLE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO1FBRWhGLHFEQUFxRDtRQUNyRCxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ2IsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDN0IsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsdUJBQXVCLENBQUMsQ0FBQywyQkFBMkIsR0FBRyx1QkFBdUIsQ0FBQyx1Q0FBdUMsQ0FBQztnQkFDcEssS0FBSyxDQUFDLEtBQUssSUFBSSxVQUFVLENBQUM7Z0JBQzFCLEtBQUssQ0FBQyxHQUFHLElBQUksVUFBVSxDQUFDO1lBQ3pCLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsaUJBQWlCLENBQUMsSUFBWSxFQUFFLGtCQUEwQjtRQUNsRSxNQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDaEYsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUN2QixPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFNBQVMsY0FBYyxDQUFDLFFBQXNCLEVBQUUsUUFBc0IsRUFBRSxPQUFlO1FBRXRGLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUM7UUFDeEQsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQztRQUN4RCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3pELE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN6RCxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFFRCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3BFLE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUVELE9BQU8sSUFBQSwyQkFBZSxFQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsTUFBTSwrQkFBK0I7UUFFcEMsa0JBQWtCO1lBQ2pCLE9BQU8sSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxZQUFZLENBQUMsT0FBcUI7WUFDakMsT0FBTyxPQUFPLENBQUMsU0FBUyxFQUFFLEtBQUs7Z0JBQzlCLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxhQUFhLEtBQUssT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3hELENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBQzFCLENBQUM7UUFFRCxhQUFhO1lBQ1osT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELE9BQU8sQ0FBQyxPQUFxQjtZQUM1QixPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ3BELENBQUM7UUFFRCxTQUFTLENBQUMsT0FBcUI7WUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDMUIsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUVELE9BQU87Z0JBQ04sS0FBSyxFQUFFLE9BQU8sQ0FBQyxPQUFPO2dCQUN0QixXQUFXLEVBQUUsT0FBTyxDQUFDLFNBQVM7YUFDOUIsQ0FBQztRQUNILENBQUM7S0FDRCJ9