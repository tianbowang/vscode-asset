/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/list/listWidget", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls", "vs/css!./selectBoxCustom"], function (require, exports, dom, event_1, keyboardEvent_1, markdownRenderer_1, listWidget_1, arrays, event_2, keyCodes_1, lifecycle_1, platform_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectBoxList = void 0;
    const $ = dom.$;
    const SELECT_OPTION_ENTRY_TEMPLATE_ID = 'selectOption.entry.template';
    class SelectListRenderer {
        get templateId() { return SELECT_OPTION_ENTRY_TEMPLATE_ID; }
        renderTemplate(container) {
            const data = Object.create(null);
            data.root = container;
            data.text = dom.append(container, $('.option-text'));
            data.detail = dom.append(container, $('.option-detail'));
            data.decoratorRight = dom.append(container, $('.option-decorator-right'));
            return data;
        }
        renderElement(element, index, templateData) {
            const data = templateData;
            const text = element.text;
            const detail = element.detail;
            const decoratorRight = element.decoratorRight;
            const isDisabled = element.isDisabled;
            data.text.textContent = text;
            data.detail.textContent = !!detail ? detail : '';
            data.decoratorRight.innerText = !!decoratorRight ? decoratorRight : '';
            // pseudo-select disabled option
            if (isDisabled) {
                data.root.classList.add('option-disabled');
            }
            else {
                // Make sure we do class removal from prior template rendering
                data.root.classList.remove('option-disabled');
            }
        }
        disposeTemplate(_templateData) {
            // noop
        }
    }
    class SelectBoxList extends lifecycle_1.Disposable {
        static { this.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN = 32; }
        static { this.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN = 2; }
        static { this.DEFAULT_MINIMUM_VISIBLE_OPTIONS = 3; }
        constructor(options, selected, contextViewProvider, styles, selectBoxOptions) {
            super();
            this.options = [];
            this._currentSelection = 0;
            this._hasDetails = false;
            this._skipLayout = false;
            this._sticky = false; // for dev purposes only
            this._isVisible = false;
            this.styles = styles;
            this.selectBoxOptions = selectBoxOptions || Object.create(null);
            if (typeof this.selectBoxOptions.minBottomMargin !== 'number') {
                this.selectBoxOptions.minBottomMargin = SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN;
            }
            else if (this.selectBoxOptions.minBottomMargin < 0) {
                this.selectBoxOptions.minBottomMargin = 0;
            }
            this.selectElement = document.createElement('select');
            // Use custom CSS vars for padding calculation
            this.selectElement.className = 'monaco-select-box monaco-select-box-dropdown-padding';
            if (typeof this.selectBoxOptions.ariaLabel === 'string') {
                this.selectElement.setAttribute('aria-label', this.selectBoxOptions.ariaLabel);
            }
            if (typeof this.selectBoxOptions.ariaDescription === 'string') {
                this.selectElement.setAttribute('aria-description', this.selectBoxOptions.ariaDescription);
            }
            this._onDidSelect = new event_2.Emitter();
            this._register(this._onDidSelect);
            this.registerListeners();
            this.constructSelectDropDown(contextViewProvider);
            this.selected = selected || 0;
            if (options) {
                this.setOptions(options, selected);
            }
            this.initStyleSheet();
        }
        // IDelegate - List renderer
        getHeight() {
            return 22;
        }
        getTemplateId() {
            return SELECT_OPTION_ENTRY_TEMPLATE_ID;
        }
        constructSelectDropDown(contextViewProvider) {
            // SetUp ContextView container to hold select Dropdown
            this.contextViewProvider = contextViewProvider;
            this.selectDropDownContainer = dom.$('.monaco-select-box-dropdown-container');
            // Use custom CSS vars for padding calculation (shared with parent select)
            this.selectDropDownContainer.classList.add('monaco-select-box-dropdown-padding');
            // Setup container for select option details
            this.selectionDetailsPane = dom.append(this.selectDropDownContainer, $('.select-box-details-pane'));
            // Create span flex box item/div we can measure and control
            const widthControlOuterDiv = dom.append(this.selectDropDownContainer, $('.select-box-dropdown-container-width-control'));
            const widthControlInnerDiv = dom.append(widthControlOuterDiv, $('.width-control-div'));
            this.widthControlElement = document.createElement('span');
            this.widthControlElement.className = 'option-text-width-control';
            dom.append(widthControlInnerDiv, this.widthControlElement);
            // Always default to below position
            this._dropDownPosition = 0 /* AnchorPosition.BELOW */;
            // Inline stylesheet for themes
            this.styleElement = dom.createStyleSheet(this.selectDropDownContainer);
            // Prevent dragging of dropdown #114329
            this.selectDropDownContainer.setAttribute('draggable', 'true');
            this._register(dom.addDisposableListener(this.selectDropDownContainer, dom.EventType.DRAG_START, (e) => {
                dom.EventHelper.stop(e, true);
            }));
        }
        registerListeners() {
            // Parent native select keyboard listeners
            this._register(dom.addStandardDisposableListener(this.selectElement, 'change', (e) => {
                this.selected = e.target.selectedIndex;
                this._onDidSelect.fire({
                    index: e.target.selectedIndex,
                    selected: e.target.value
                });
                if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                    this.selectElement.title = this.options[this.selected].text;
                }
            }));
            // Have to implement both keyboard and mouse controllers to handle disabled options
            // Intercept mouse events to override normal select actions on parents
            this._register(dom.addDisposableListener(this.selectElement, dom.EventType.CLICK, (e) => {
                dom.EventHelper.stop(e);
                if (this._isVisible) {
                    this.hideSelectDropDown(true);
                }
                else {
                    this.showSelectDropDown();
                }
            }));
            this._register(dom.addDisposableListener(this.selectElement, dom.EventType.MOUSE_DOWN, (e) => {
                dom.EventHelper.stop(e);
            }));
            // Intercept touch events
            // The following implementation is slightly different from the mouse event handlers above.
            // Use the following helper variable, otherwise the list flickers.
            let listIsVisibleOnTouchStart;
            this._register(dom.addDisposableListener(this.selectElement, 'touchstart', (e) => {
                listIsVisibleOnTouchStart = this._isVisible;
            }));
            this._register(dom.addDisposableListener(this.selectElement, 'touchend', (e) => {
                dom.EventHelper.stop(e);
                if (listIsVisibleOnTouchStart) {
                    this.hideSelectDropDown(true);
                }
                else {
                    this.showSelectDropDown();
                }
            }));
            // Intercept keyboard handling
            this._register(dom.addDisposableListener(this.selectElement, dom.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let showDropDown = false;
                // Create and drop down select list on keyboard select
                if (platform_1.isMacintosh) {
                    if (event.keyCode === 18 /* KeyCode.DownArrow */ || event.keyCode === 16 /* KeyCode.UpArrow */ || event.keyCode === 10 /* KeyCode.Space */ || event.keyCode === 3 /* KeyCode.Enter */) {
                        showDropDown = true;
                    }
                }
                else {
                    if (event.keyCode === 18 /* KeyCode.DownArrow */ && event.altKey || event.keyCode === 16 /* KeyCode.UpArrow */ && event.altKey || event.keyCode === 10 /* KeyCode.Space */ || event.keyCode === 3 /* KeyCode.Enter */) {
                        showDropDown = true;
                    }
                }
                if (showDropDown) {
                    this.showSelectDropDown();
                    dom.EventHelper.stop(e, true);
                }
            }));
        }
        get onDidSelect() {
            return this._onDidSelect.event;
        }
        setOptions(options, selected) {
            if (!arrays.equals(this.options, options)) {
                this.options = options;
                this.selectElement.options.length = 0;
                this._hasDetails = false;
                this._cachedMaxDetailsHeight = undefined;
                this.options.forEach((option, index) => {
                    this.selectElement.add(this.createOption(option.text, index, option.isDisabled));
                    if (typeof option.description === 'string') {
                        this._hasDetails = true;
                    }
                });
            }
            if (selected !== undefined) {
                this.select(selected);
                // Set current = selected since this is not necessarily a user exit
                this._currentSelection = this.selected;
            }
        }
        setOptionsList() {
            // Mirror options in drop-down
            // Populate select list for non-native select mode
            this.selectList?.splice(0, this.selectList.length, this.options);
        }
        select(index) {
            if (index >= 0 && index < this.options.length) {
                this.selected = index;
            }
            else if (index > this.options.length - 1) {
                // Adjust index to end of list
                // This could make client out of sync with the select
                this.select(this.options.length - 1);
            }
            else if (this.selected < 0) {
                this.selected = 0;
            }
            this.selectElement.selectedIndex = this.selected;
            if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                this.selectElement.title = this.options[this.selected].text;
            }
        }
        setAriaLabel(label) {
            this.selectBoxOptions.ariaLabel = label;
            this.selectElement.setAttribute('aria-label', this.selectBoxOptions.ariaLabel);
        }
        focus() {
            if (this.selectElement) {
                this.selectElement.tabIndex = 0;
                this.selectElement.focus();
            }
        }
        blur() {
            if (this.selectElement) {
                this.selectElement.tabIndex = -1;
                this.selectElement.blur();
            }
        }
        setFocusable(focusable) {
            this.selectElement.tabIndex = focusable ? 0 : -1;
        }
        render(container) {
            this.container = container;
            container.classList.add('select-container');
            container.appendChild(this.selectElement);
            this.styleSelectElement();
        }
        initStyleSheet() {
            const content = [];
            // Style non-native select mode
            if (this.styles.listFocusBackground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { background-color: ${this.styles.listFocusBackground} !important; }`);
            }
            if (this.styles.listFocusForeground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { color: ${this.styles.listFocusForeground} !important; }`);
            }
            if (this.styles.decoratorRightForeground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.focused) .option-decorator-right { color: ${this.styles.decoratorRightForeground}; }`);
            }
            if (this.styles.selectBackground && this.styles.selectBorder && this.styles.selectBorder !== this.styles.selectBackground) {
                content.push(`.monaco-select-box-dropdown-container { border: 1px solid ${this.styles.selectBorder} } `);
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectBorder} } `);
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectBorder} } `);
            }
            else if (this.styles.selectListBorder) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectListBorder} } `);
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectListBorder} } `);
            }
            // Hover foreground - ignore for disabled options
            if (this.styles.listHoverForeground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { color: ${this.styles.listHoverForeground} !important; }`);
            }
            // Hover background - ignore for disabled options
            if (this.styles.listHoverBackground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { background-color: ${this.styles.listHoverBackground} !important; }`);
            }
            // Match quick input outline styles - ignore for disabled options
            if (this.styles.listFocusOutline) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { outline: 1.6px dotted ${this.styles.listFocusOutline} !important; outline-offset: -1.6px !important; }`);
            }
            if (this.styles.listHoverOutline) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { outline: 1.6px dashed ${this.styles.listHoverOutline} !important; outline-offset: -1.6px !important; }`);
            }
            // Clear list styles on focus and on hover for disabled options
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled.focused { background-color: transparent !important; color: inherit !important; outline: none !important; }`);
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled:hover { background-color: transparent !important; color: inherit !important; outline: none !important; }`);
            this.styleElement.textContent = content.join('\n');
        }
        styleSelectElement() {
            const background = this.styles.selectBackground ?? '';
            const foreground = this.styles.selectForeground ?? '';
            const border = this.styles.selectBorder ?? '';
            this.selectElement.style.backgroundColor = background;
            this.selectElement.style.color = foreground;
            this.selectElement.style.borderColor = border;
        }
        styleList() {
            const background = this.styles.selectBackground ?? '';
            const listBackground = dom.asCssValueWithDefault(this.styles.selectListBackground, background);
            this.selectDropDownListContainer.style.backgroundColor = listBackground;
            this.selectionDetailsPane.style.backgroundColor = listBackground;
            const optionsBorder = this.styles.focusBorder ?? '';
            this.selectDropDownContainer.style.outlineColor = optionsBorder;
            this.selectDropDownContainer.style.outlineOffset = '-1px';
            this.selectList.style(this.styles);
        }
        createOption(value, index, disabled) {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            option.disabled = !!disabled;
            return option;
        }
        // ContextView dropdown methods
        showSelectDropDown() {
            this.selectionDetailsPane.innerText = '';
            if (!this.contextViewProvider || this._isVisible) {
                return;
            }
            // Lazily create and populate list only at open, moved from constructor
            this.createSelectList(this.selectDropDownContainer);
            this.setOptionsList();
            // This allows us to flip the position based on measurement
            // Set drop-down position above/below from required height and margins
            // If pre-layout cannot fit at least one option do not show drop-down
            this.contextViewProvider.showContextView({
                getAnchor: () => this.selectElement,
                render: (container) => this.renderSelectDropDown(container, true),
                layout: () => {
                    this.layoutSelectDropDown();
                },
                onHide: () => {
                    this.selectDropDownContainer.classList.remove('visible');
                    this.selectElement.classList.remove('synthetic-focus');
                },
                anchorPosition: this._dropDownPosition
            }, this.selectBoxOptions.optionsAsChildren ? this.container : undefined);
            // Hide so we can relay out
            this._isVisible = true;
            this.hideSelectDropDown(false);
            this.contextViewProvider.showContextView({
                getAnchor: () => this.selectElement,
                render: (container) => this.renderSelectDropDown(container),
                layout: () => this.layoutSelectDropDown(),
                onHide: () => {
                    this.selectDropDownContainer.classList.remove('visible');
                    this.selectElement.classList.remove('synthetic-focus');
                },
                anchorPosition: this._dropDownPosition
            }, this.selectBoxOptions.optionsAsChildren ? this.container : undefined);
            // Track initial selection the case user escape, blur
            this._currentSelection = this.selected;
            this._isVisible = true;
            this.selectElement.setAttribute('aria-expanded', 'true');
        }
        hideSelectDropDown(focusSelect) {
            if (!this.contextViewProvider || !this._isVisible) {
                return;
            }
            this._isVisible = false;
            this.selectElement.setAttribute('aria-expanded', 'false');
            if (focusSelect) {
                this.selectElement.focus();
            }
            this.contextViewProvider.hideContextView();
        }
        renderSelectDropDown(container, preLayoutPosition) {
            container.appendChild(this.selectDropDownContainer);
            // Pre-Layout allows us to change position
            this.layoutSelectDropDown(preLayoutPosition);
            return {
                dispose: () => {
                    // contextView will dispose itself if moving from one View to another
                    try {
                        container.removeChild(this.selectDropDownContainer); // remove to take out the CSS rules we add
                    }
                    catch (error) {
                        // Ignore, removed already by change of focus
                    }
                }
            };
        }
        // Iterate over detailed descriptions, find max height
        measureMaxDetailsHeight() {
            let maxDetailsPaneHeight = 0;
            this.options.forEach((_option, index) => {
                this.updateDetail(index);
                if (this.selectionDetailsPane.offsetHeight > maxDetailsPaneHeight) {
                    maxDetailsPaneHeight = this.selectionDetailsPane.offsetHeight;
                }
            });
            return maxDetailsPaneHeight;
        }
        layoutSelectDropDown(preLayoutPosition) {
            // Avoid recursion from layout called in onListFocus
            if (this._skipLayout) {
                return false;
            }
            // Layout ContextView drop down select list and container
            // Have to manage our vertical overflow, sizing, position below or above
            // Position has to be determined and set prior to contextView instantiation
            if (this.selectList) {
                // Make visible to enable measurements
                this.selectDropDownContainer.classList.add('visible');
                const window = dom.getWindow(this.selectElement);
                const selectPosition = dom.getDomNodePagePosition(this.selectElement);
                const styles = dom.getWindow(this.selectElement).getComputedStyle(this.selectElement);
                const verticalPadding = parseFloat(styles.getPropertyValue('--dropdown-padding-top')) + parseFloat(styles.getPropertyValue('--dropdown-padding-bottom'));
                const maxSelectDropDownHeightBelow = (window.innerHeight - selectPosition.top - selectPosition.height - (this.selectBoxOptions.minBottomMargin || 0));
                const maxSelectDropDownHeightAbove = (selectPosition.top - SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN);
                // Determine optimal width - min(longest option), opt(parent select, excluding margins), max(ContextView controlled)
                const selectWidth = this.selectElement.offsetWidth;
                const selectMinWidth = this.setWidthControlElement(this.widthControlElement);
                const selectOptimalWidth = Math.max(selectMinWidth, Math.round(selectWidth)).toString() + 'px';
                this.selectDropDownContainer.style.width = selectOptimalWidth;
                // Get initial list height and determine space above and below
                this.selectList.getHTMLElement().style.height = '';
                this.selectList.layout();
                let listHeight = this.selectList.contentHeight;
                if (this._hasDetails && this._cachedMaxDetailsHeight === undefined) {
                    this._cachedMaxDetailsHeight = this.measureMaxDetailsHeight();
                }
                const maxDetailsPaneHeight = this._hasDetails ? this._cachedMaxDetailsHeight : 0;
                const minRequiredDropDownHeight = listHeight + verticalPadding + maxDetailsPaneHeight;
                const maxVisibleOptionsBelow = ((Math.floor((maxSelectDropDownHeightBelow - verticalPadding - maxDetailsPaneHeight) / this.getHeight())));
                const maxVisibleOptionsAbove = ((Math.floor((maxSelectDropDownHeightAbove - verticalPadding - maxDetailsPaneHeight) / this.getHeight())));
                // If we are only doing pre-layout check/adjust position only
                // Calculate vertical space available, flip up if insufficient
                // Use reflected padding on parent select, ContextView style
                // properties not available before DOM attachment
                if (preLayoutPosition) {
                    // Check if select moved out of viewport , do not open
                    // If at least one option cannot be shown, don't open the drop-down or hide/remove if open
                    if ((selectPosition.top + selectPosition.height) > (window.innerHeight - 22)
                        || selectPosition.top < SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN
                        || ((maxVisibleOptionsBelow < 1) && (maxVisibleOptionsAbove < 1))) {
                        // Indicate we cannot open
                        return false;
                    }
                    // Determine if we have to flip up
                    // Always show complete list items - never more than Max available vertical height
                    if (maxVisibleOptionsBelow < SelectBoxList.DEFAULT_MINIMUM_VISIBLE_OPTIONS
                        && maxVisibleOptionsAbove > maxVisibleOptionsBelow
                        && this.options.length > maxVisibleOptionsBelow) {
                        this._dropDownPosition = 1 /* AnchorPosition.ABOVE */;
                        this.selectDropDownContainer.removeChild(this.selectDropDownListContainer);
                        this.selectDropDownContainer.removeChild(this.selectionDetailsPane);
                        this.selectDropDownContainer.appendChild(this.selectionDetailsPane);
                        this.selectDropDownContainer.appendChild(this.selectDropDownListContainer);
                        this.selectionDetailsPane.classList.remove('border-top');
                        this.selectionDetailsPane.classList.add('border-bottom');
                    }
                    else {
                        this._dropDownPosition = 0 /* AnchorPosition.BELOW */;
                        this.selectDropDownContainer.removeChild(this.selectDropDownListContainer);
                        this.selectDropDownContainer.removeChild(this.selectionDetailsPane);
                        this.selectDropDownContainer.appendChild(this.selectDropDownListContainer);
                        this.selectDropDownContainer.appendChild(this.selectionDetailsPane);
                        this.selectionDetailsPane.classList.remove('border-bottom');
                        this.selectionDetailsPane.classList.add('border-top');
                    }
                    // Do full layout on showSelectDropDown only
                    return true;
                }
                // Check if select out of viewport or cutting into status bar
                if ((selectPosition.top + selectPosition.height) > (window.innerHeight - 22)
                    || selectPosition.top < SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN
                    || (this._dropDownPosition === 0 /* AnchorPosition.BELOW */ && maxVisibleOptionsBelow < 1)
                    || (this._dropDownPosition === 1 /* AnchorPosition.ABOVE */ && maxVisibleOptionsAbove < 1)) {
                    // Cannot properly layout, close and hide
                    this.hideSelectDropDown(true);
                    return false;
                }
                // SetUp list dimensions and layout - account for container padding
                // Use position to check above or below available space
                if (this._dropDownPosition === 0 /* AnchorPosition.BELOW */) {
                    if (this._isVisible && maxVisibleOptionsBelow + maxVisibleOptionsAbove < 1) {
                        // If drop-down is visible, must be doing a DOM re-layout, hide since we don't fit
                        // Hide drop-down, hide contextview, focus on parent select
                        this.hideSelectDropDown(true);
                        return false;
                    }
                    // Adjust list height to max from select bottom to margin (default/minBottomMargin)
                    if (minRequiredDropDownHeight > maxSelectDropDownHeightBelow) {
                        listHeight = (maxVisibleOptionsBelow * this.getHeight());
                    }
                }
                else {
                    if (minRequiredDropDownHeight > maxSelectDropDownHeightAbove) {
                        listHeight = (maxVisibleOptionsAbove * this.getHeight());
                    }
                }
                // Set adjusted list height and relayout
                this.selectList.layout(listHeight);
                this.selectList.domFocus();
                // Finally set focus on selected item
                if (this.selectList.length > 0) {
                    this.selectList.setFocus([this.selected || 0]);
                    this.selectList.reveal(this.selectList.getFocus()[0] || 0);
                }
                if (this._hasDetails) {
                    // Leave the selectDropDownContainer to size itself according to children (list + details) - #57447
                    this.selectList.getHTMLElement().style.height = (listHeight + verticalPadding) + 'px';
                    this.selectDropDownContainer.style.height = '';
                }
                else {
                    this.selectDropDownContainer.style.height = (listHeight + verticalPadding) + 'px';
                }
                this.updateDetail(this.selected);
                this.selectDropDownContainer.style.width = selectOptimalWidth;
                // Maintain focus outline on parent select as well as list container - tabindex for focus
                this.selectDropDownListContainer.setAttribute('tabindex', '0');
                this.selectElement.classList.add('synthetic-focus');
                this.selectDropDownContainer.classList.add('synthetic-focus');
                return true;
            }
            else {
                return false;
            }
        }
        setWidthControlElement(container) {
            let elementWidth = 0;
            if (container) {
                let longest = 0;
                let longestLength = 0;
                this.options.forEach((option, index) => {
                    const detailLength = !!option.detail ? option.detail.length : 0;
                    const rightDecoratorLength = !!option.decoratorRight ? option.decoratorRight.length : 0;
                    const len = option.text.length + detailLength + rightDecoratorLength;
                    if (len > longestLength) {
                        longest = index;
                        longestLength = len;
                    }
                });
                container.textContent = this.options[longest].text + (!!this.options[longest].decoratorRight ? (this.options[longest].decoratorRight + ' ') : '');
                elementWidth = dom.getTotalWidth(container);
            }
            return elementWidth;
        }
        createSelectList(parent) {
            // If we have already constructive list on open, skip
            if (this.selectList) {
                return;
            }
            // SetUp container for list
            this.selectDropDownListContainer = dom.append(parent, $('.select-box-dropdown-list-container'));
            this.listRenderer = new SelectListRenderer();
            this.selectList = new listWidget_1.List('SelectBoxCustom', this.selectDropDownListContainer, this, [this.listRenderer], {
                useShadows: false,
                verticalScrollMode: 3 /* ScrollbarVisibility.Visible */,
                keyboardSupport: false,
                mouseSupport: false,
                accessibilityProvider: {
                    getAriaLabel: element => {
                        let label = element.text;
                        if (element.detail) {
                            label += `. ${element.detail}`;
                        }
                        if (element.decoratorRight) {
                            label += `. ${element.decoratorRight}`;
                        }
                        if (element.description) {
                            label += `. ${element.description}`;
                        }
                        return label;
                    },
                    getWidgetAriaLabel: () => (0, nls_1.localize)({ key: 'selectBox', comment: ['Behave like native select dropdown element.'] }, "Select Box"),
                    getRole: () => platform_1.isMacintosh ? '' : 'option',
                    getWidgetRole: () => 'listbox'
                }
            });
            if (this.selectBoxOptions.ariaLabel) {
                this.selectList.ariaLabel = this.selectBoxOptions.ariaLabel;
            }
            // SetUp list keyboard controller - control navigation, disabled items, focus
            const onKeyDown = this._register(new event_1.DomEmitter(this.selectDropDownListContainer, 'keydown'));
            const onSelectDropDownKeyDown = event_2.Event.chain(onKeyDown.event, $ => $.filter(() => this.selectList.length > 0)
                .map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 3 /* KeyCode.Enter */))(this.onEnter, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 2 /* KeyCode.Tab */))(this.onEnter, this)); // Tab should behave the same as enter, #79339
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 9 /* KeyCode.Escape */))(this.onEscape, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 16 /* KeyCode.UpArrow */))(this.onUpArrow, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 18 /* KeyCode.DownArrow */))(this.onDownArrow, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 12 /* KeyCode.PageDown */))(this.onPageDown, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 11 /* KeyCode.PageUp */))(this.onPageUp, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 14 /* KeyCode.Home */))(this.onHome, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 13 /* KeyCode.End */))(this.onEnd, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => (e.keyCode >= 21 /* KeyCode.Digit0 */ && e.keyCode <= 56 /* KeyCode.KeyZ */) || (e.keyCode >= 85 /* KeyCode.Semicolon */ && e.keyCode <= 113 /* KeyCode.NumpadDivide */)))(this.onCharacter, this));
            // SetUp list mouse controller - control navigation, disabled items, focus
            this._register(dom.addDisposableListener(this.selectList.getHTMLElement(), dom.EventType.POINTER_UP, e => this.onPointerUp(e)));
            this._register(this.selectList.onMouseOver(e => typeof e.index !== 'undefined' && this.selectList.setFocus([e.index])));
            this._register(this.selectList.onDidChangeFocus(e => this.onListFocus(e)));
            this._register(dom.addDisposableListener(this.selectDropDownContainer, dom.EventType.FOCUS_OUT, e => {
                if (!this._isVisible || dom.isAncestor(e.relatedTarget, this.selectDropDownContainer)) {
                    return;
                }
                this.onListBlur();
            }));
            this.selectList.getHTMLElement().setAttribute('aria-label', this.selectBoxOptions.ariaLabel || '');
            this.selectList.getHTMLElement().setAttribute('aria-expanded', 'true');
            this.styleList();
        }
        // List methods
        // List mouse controller - active exit, select option, fire onDidSelect if change, return focus to parent select
        // Also takes in touchend events
        onPointerUp(e) {
            if (!this.selectList.length) {
                return;
            }
            dom.EventHelper.stop(e);
            const target = e.target;
            if (!target) {
                return;
            }
            // Check our mouse event is on an option (not scrollbar)
            if (target.classList.contains('slider')) {
                return;
            }
            const listRowElement = target.closest('.monaco-list-row');
            if (!listRowElement) {
                return;
            }
            const index = Number(listRowElement.getAttribute('data-index'));
            const disabled = listRowElement.classList.contains('option-disabled');
            // Ignore mouse selection of disabled options
            if (index >= 0 && index < this.options.length && !disabled) {
                this.selected = index;
                this.select(this.selected);
                this.selectList.setFocus([this.selected]);
                this.selectList.reveal(this.selectList.getFocus()[0]);
                // Only fire if selection change
                if (this.selected !== this._currentSelection) {
                    // Set current = selected
                    this._currentSelection = this.selected;
                    this._onDidSelect.fire({
                        index: this.selectElement.selectedIndex,
                        selected: this.options[this.selected].text
                    });
                    if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                        this.selectElement.title = this.options[this.selected].text;
                    }
                }
                this.hideSelectDropDown(true);
            }
        }
        // List Exit - passive - implicit no selection change, hide drop-down
        onListBlur() {
            if (this._sticky) {
                return;
            }
            if (this.selected !== this._currentSelection) {
                // Reset selected to current if no change
                this.select(this._currentSelection);
            }
            this.hideSelectDropDown(false);
        }
        renderDescriptionMarkdown(text, actionHandler) {
            const cleanRenderedMarkdown = (element) => {
                for (let i = 0; i < element.childNodes.length; i++) {
                    const child = element.childNodes.item(i);
                    const tagName = child.tagName && child.tagName.toLowerCase();
                    if (tagName === 'img') {
                        element.removeChild(child);
                    }
                    else {
                        cleanRenderedMarkdown(child);
                    }
                }
            };
            const rendered = (0, markdownRenderer_1.renderMarkdown)({ value: text, supportThemeIcons: true }, { actionHandler });
            rendered.element.classList.add('select-box-description-markdown');
            cleanRenderedMarkdown(rendered.element);
            return rendered.element;
        }
        // List Focus Change - passive - update details pane with newly focused element's data
        onListFocus(e) {
            // Skip during initial layout
            if (!this._isVisible || !this._hasDetails) {
                return;
            }
            this.updateDetail(e.indexes[0]);
        }
        updateDetail(selectedIndex) {
            this.selectionDetailsPane.innerText = '';
            const option = this.options[selectedIndex];
            const description = option?.description ?? '';
            const descriptionIsMarkdown = option?.descriptionIsMarkdown ?? false;
            if (description) {
                if (descriptionIsMarkdown) {
                    const actionHandler = option.descriptionMarkdownActionHandler;
                    this.selectionDetailsPane.appendChild(this.renderDescriptionMarkdown(description, actionHandler));
                }
                else {
                    this.selectionDetailsPane.innerText = description;
                }
                this.selectionDetailsPane.style.display = 'block';
            }
            else {
                this.selectionDetailsPane.style.display = 'none';
            }
            // Avoid recursion
            this._skipLayout = true;
            this.contextViewProvider.layout();
            this._skipLayout = false;
        }
        // List keyboard controller
        // List exit - active - hide ContextView dropdown, reset selection, return focus to parent select
        onEscape(e) {
            dom.EventHelper.stop(e);
            // Reset selection to value when opened
            this.select(this._currentSelection);
            this.hideSelectDropDown(true);
        }
        // List exit - active - hide ContextView dropdown, return focus to parent select, fire onDidSelect if change
        onEnter(e) {
            dom.EventHelper.stop(e);
            // Only fire if selection change
            if (this.selected !== this._currentSelection) {
                this._currentSelection = this.selected;
                this._onDidSelect.fire({
                    index: this.selectElement.selectedIndex,
                    selected: this.options[this.selected].text
                });
                if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                    this.selectElement.title = this.options[this.selected].text;
                }
            }
            this.hideSelectDropDown(true);
        }
        // List navigation - have to handle a disabled option (jump over)
        onDownArrow(e) {
            if (this.selected < this.options.length - 1) {
                dom.EventHelper.stop(e, true);
                // Skip disabled options
                const nextOptionDisabled = this.options[this.selected + 1].isDisabled;
                if (nextOptionDisabled && this.options.length > this.selected + 2) {
                    this.selected += 2;
                }
                else if (nextOptionDisabled) {
                    return;
                }
                else {
                    this.selected++;
                }
                // Set focus/selection - only fire event when closing drop-down or on blur
                this.select(this.selected);
                this.selectList.setFocus([this.selected]);
                this.selectList.reveal(this.selectList.getFocus()[0]);
            }
        }
        onUpArrow(e) {
            if (this.selected > 0) {
                dom.EventHelper.stop(e, true);
                // Skip disabled options
                const previousOptionDisabled = this.options[this.selected - 1].isDisabled;
                if (previousOptionDisabled && this.selected > 1) {
                    this.selected -= 2;
                }
                else {
                    this.selected--;
                }
                // Set focus/selection - only fire event when closing drop-down or on blur
                this.select(this.selected);
                this.selectList.setFocus([this.selected]);
                this.selectList.reveal(this.selectList.getFocus()[0]);
            }
        }
        onPageUp(e) {
            dom.EventHelper.stop(e);
            this.selectList.focusPreviousPage();
            // Allow scrolling to settle
            setTimeout(() => {
                this.selected = this.selectList.getFocus()[0];
                // Shift selection down if we land on a disabled option
                if (this.options[this.selected].isDisabled && this.selected < this.options.length - 1) {
                    this.selected++;
                    this.selectList.setFocus([this.selected]);
                }
                this.selectList.reveal(this.selected);
                this.select(this.selected);
            }, 1);
        }
        onPageDown(e) {
            dom.EventHelper.stop(e);
            this.selectList.focusNextPage();
            // Allow scrolling to settle
            setTimeout(() => {
                this.selected = this.selectList.getFocus()[0];
                // Shift selection up if we land on a disabled option
                if (this.options[this.selected].isDisabled && this.selected > 0) {
                    this.selected--;
                    this.selectList.setFocus([this.selected]);
                }
                this.selectList.reveal(this.selected);
                this.select(this.selected);
            }, 1);
        }
        onHome(e) {
            dom.EventHelper.stop(e);
            if (this.options.length < 2) {
                return;
            }
            this.selected = 0;
            if (this.options[this.selected].isDisabled && this.selected > 1) {
                this.selected++;
            }
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selected);
            this.select(this.selected);
        }
        onEnd(e) {
            dom.EventHelper.stop(e);
            if (this.options.length < 2) {
                return;
            }
            this.selected = this.options.length - 1;
            if (this.options[this.selected].isDisabled && this.selected > 1) {
                this.selected--;
            }
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selected);
            this.select(this.selected);
        }
        // Mimic option first character navigation of native select
        onCharacter(e) {
            const ch = keyCodes_1.KeyCodeUtils.toString(e.keyCode);
            let optionIndex = -1;
            for (let i = 0; i < this.options.length - 1; i++) {
                optionIndex = (i + this.selected + 1) % this.options.length;
                if (this.options[optionIndex].text.charAt(0).toUpperCase() === ch && !this.options[optionIndex].isDisabled) {
                    this.select(optionIndex);
                    this.selectList.setFocus([optionIndex]);
                    this.selectList.reveal(this.selectList.getFocus()[0]);
                    dom.EventHelper.stop(e);
                    break;
                }
            }
        }
        dispose() {
            this.hideSelectDropDown(false);
            super.dispose();
        }
    }
    exports.SelectBoxList = SelectBoxList;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0Qm94Q3VzdG9tLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvc2VsZWN0Qm94L3NlbGVjdEJveEN1c3RvbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsTUFBTSwrQkFBK0IsR0FBRyw2QkFBNkIsQ0FBQztJQVN0RSxNQUFNLGtCQUFrQjtRQUV2QixJQUFJLFVBQVUsS0FBYSxPQUFPLCtCQUErQixDQUFDLENBQUMsQ0FBQztRQUVwRSxjQUFjLENBQUMsU0FBc0I7WUFDcEMsTUFBTSxJQUFJLEdBQTRCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBRTFFLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELGFBQWEsQ0FBQyxPQUEwQixFQUFFLEtBQWEsRUFBRSxZQUFxQztZQUM3RixNQUFNLElBQUksR0FBNEIsWUFBWSxDQUFDO1lBRW5ELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDMUIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1B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MkJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM1SCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sNkJBQW9CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5SCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sK0JBQXNCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sOEJBQXFCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sNEJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM1SCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sMEJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4SCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8seUJBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN0SCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTywyQkFBa0IsSUFBSSxDQUFDLENBQUMsT0FBTyx5QkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sOEJBQXFCLElBQUksQ0FBQyxDQUFDLE9BQU8sa0NBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXRPLDBFQUEwRTtZQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFaEksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxXQUFXLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFM0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUNuRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxhQUE0QixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLENBQUM7b0JBQ3RHLE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ25HLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV2RSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUVELGVBQWU7UUFFZixnSEFBZ0g7UUFDaEgsZ0NBQWdDO1FBQ3hCLFdBQVcsQ0FBQyxDQUFlO1lBRWxDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1IsQ0FBQztZQUVELEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhCLE1BQU0sTUFBTSxHQUFZLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNiLE9BQU87WUFDUixDQUFDO1lBRUQsd0RBQXdEO1lBQ3hELElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDekMsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFMUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNyQixPQUFPO1lBQ1IsQ0FBQztZQUNELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDaEUsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUV0RSw2Q0FBNkM7WUFDN0MsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUM1RCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTNCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEQsZ0NBQWdDO2dCQUNoQyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7b0JBQzlDLHlCQUF5QjtvQkFDekIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBRXZDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO3dCQUN0QixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhO3dCQUN2QyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSTtxQkFFMUMsQ0FBQyxDQUFDO29CQUNILElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDekUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUM3RCxDQUFDO2dCQUNGLENBQUM7Z0JBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9CLENBQUM7UUFDRixDQUFDO1FBRUQscUVBQXFFO1FBQzdELFVBQVU7WUFDakIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQUMsT0FBTztZQUFDLENBQUM7WUFDN0IsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUM5Qyx5Q0FBeUM7Z0JBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDckMsQ0FBQztZQUVELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBR08seUJBQXlCLENBQUMsSUFBWSxFQUFFLGFBQXFDO1lBQ3BGLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxPQUFhLEVBQUUsRUFBRTtnQkFDL0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3BELE1BQU0sS0FBSyxHQUFZLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVsRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQzdELElBQUksT0FBTyxLQUFLLEtBQUssRUFBRSxDQUFDO3dCQUN2QixPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM1QixDQUFDO3lCQUFNLENBQUM7d0JBQ1AscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzlCLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUMsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLElBQUEsaUNBQWMsRUFBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBRTdGLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1lBQ2xFLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV4QyxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDekIsQ0FBQztRQUVELHNGQUFzRjtRQUM5RSxXQUFXLENBQUMsQ0FBZ0M7WUFDbkQsNkJBQTZCO1lBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUMzQyxPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFTyxZQUFZLENBQUMsYUFBcUI7WUFDekMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMzQyxNQUFNLFdBQVcsR0FBRyxNQUFNLEVBQUUsV0FBVyxJQUFJLEVBQUUsQ0FBQztZQUM5QyxNQUFNLHFCQUFxQixHQUFHLE1BQU0sRUFBRSxxQkFBcUIsSUFBSSxLQUFLLENBQUM7WUFFckUsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO29CQUMzQixNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsZ0NBQWdDLENBQUM7b0JBQzlELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUNuRyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7Z0JBQ25ELENBQUM7Z0JBQ0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ25ELENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDbEQsQ0FBQztZQUVELGtCQUFrQjtZQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDMUIsQ0FBQztRQUVELDJCQUEyQjtRQUUzQixpR0FBaUc7UUFDekYsUUFBUSxDQUFDLENBQXdCO1lBQ3hDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhCLHVDQUF1QztZQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsNEdBQTRHO1FBQ3BHLE9BQU8sQ0FBQyxDQUF3QjtZQUN2QyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4QixnQ0FBZ0M7WUFDaEMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7b0JBQ3RCLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWE7b0JBQ3ZDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJO2lCQUMxQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN6RSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzdELENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxpRUFBaUU7UUFDekQsV0FBVyxDQUFDLENBQXdCO1lBQzNDLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDN0MsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUU5Qix3QkFBd0I7Z0JBQ3hCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztnQkFFdEUsSUFBSSxrQkFBa0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNuRSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztnQkFDcEIsQ0FBQztxQkFBTSxJQUFJLGtCQUFrQixFQUFFLENBQUM7b0JBQy9CLE9BQU87Z0JBQ1IsQ0FBQztxQkFBTSxDQUFDO29CQUNQLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDakIsQ0FBQztnQkFFRCwwRUFBMEU7Z0JBQzFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsQ0FBQztRQUNGLENBQUM7UUFFTyxTQUFTLENBQUMsQ0FBd0I7WUFDekMsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN2QixHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlCLHdCQUF3QjtnQkFDeEIsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUMxRSxJQUFJLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ2pELElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO2dCQUNwQixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNqQixDQUFDO2dCQUNELDBFQUEwRTtnQkFDMUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxDQUFDO1FBQ0YsQ0FBQztRQUVPLFFBQVEsQ0FBQyxDQUF3QjtZQUN4QyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4QixJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFcEMsNEJBQTRCO1lBQzVCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUU5Qyx1REFBdUQ7Z0JBQ3ZELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZGLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDM0MsQ0FBQztnQkFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTyxVQUFVLENBQUMsQ0FBd0I7WUFDMUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVoQyw0QkFBNEI7WUFDNUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDZixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTlDLHFEQUFxRDtnQkFDckQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDakUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNoQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxDQUFDO2dCQUNELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVPLE1BQU0sQ0FBQyxDQUF3QjtZQUN0QyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4QixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixDQUFDO1lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVPLEtBQUssQ0FBQyxDQUF3QjtZQUNyQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4QixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixDQUFDO1lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELDJEQUEyRDtRQUNuRCxXQUFXLENBQUMsQ0FBd0I7WUFDM0MsTUFBTSxFQUFFLEdBQUcsdUJBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXJCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDbEQsV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQzVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzVHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0RCxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEIsTUFBTTtnQkFDUCxDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFZSxPQUFPO1lBQ3RCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQzs7SUFyK0JGLHNDQXMrQkMifQ==