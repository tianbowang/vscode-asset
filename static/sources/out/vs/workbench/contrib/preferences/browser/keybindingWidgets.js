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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/browser/ui/widget", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/keyboardEvent", "vs/base/browser/fastDomNode", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/base/common/async", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/keybindings"], function (require, exports, nls, platform_1, lifecycle_1, event_1, keybindingLabel_1, widget_1, dom, aria, keyboardEvent_1, fastDomNode_1, keybinding_1, contextView_1, instantiation_1, colorRegistry_1, preferencesWidgets_1, async_1, contextkey_1, defaultStyles_1) {
    "use strict";
    var DefineKeybindingWidget_1, DefineKeybindingOverlayWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefineKeybindingOverlayWidget = exports.DefineKeybindingWidget = exports.KeybindingsSearchWidget = void 0;
    let KeybindingsSearchWidget = class KeybindingsSearchWidget extends preferencesWidgets_1.SearchWidget {
        constructor(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService) {
            super(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService);
            this.recordDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onKeybinding = this._register(new event_1.Emitter());
            this.onKeybinding = this._onKeybinding.event;
            this._onEnter = this._register(new event_1.Emitter());
            this.onEnter = this._onEnter.event;
            this._onEscape = this._register(new event_1.Emitter());
            this.onEscape = this._onEscape.event;
            this._onBlur = this._register(new event_1.Emitter());
            this.onBlur = this._onBlur.event;
            this._register((0, lifecycle_1.toDisposable)(() => this.stopRecordingKeys()));
            this._chords = null;
            this._inputValue = '';
        }
        clear() {
            this._chords = null;
            super.clear();
        }
        startRecordingKeys() {
            this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.KEY_DOWN, (e) => this._onKeyDown(new keyboardEvent_1.StandardKeyboardEvent(e))));
            this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.BLUR, () => this._onBlur.fire()));
            this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.INPUT, () => {
                // Prevent other characters from showing up
                this.setInputValue(this._inputValue);
            }));
        }
        stopRecordingKeys() {
            this._chords = null;
            this.recordDisposables.clear();
        }
        setInputValue(value) {
            this._inputValue = value;
            this.inputBox.value = this._inputValue;
        }
        _onKeyDown(keyboardEvent) {
            keyboardEvent.preventDefault();
            keyboardEvent.stopPropagation();
            const options = this.options;
            if (!options.recordEnter && keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                this._onEnter.fire();
                return;
            }
            if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
                this._onEscape.fire();
                return;
            }
            this.printKeybinding(keyboardEvent);
        }
        printKeybinding(keyboardEvent) {
            const keybinding = this.keybindingService.resolveKeyboardEvent(keyboardEvent);
            const info = `code: ${keyboardEvent.browserEvent.code}, keyCode: ${keyboardEvent.browserEvent.keyCode}, key: ${keyboardEvent.browserEvent.key} => UI: ${keybinding.getAriaLabel()}, user settings: ${keybinding.getUserSettingsLabel()}, dispatch: ${keybinding.getDispatchChords()[0]}`;
            const options = this.options;
            if (!this._chords) {
                this._chords = [];
            }
            // TODO: note that we allow a keybinding "shift shift", but this widget doesn't allow input "shift shift" because the first "shift" will be incomplete - this is _not_ a regression
            const hasIncompleteChord = this._chords.length > 0 && this._chords[this._chords.length - 1].getDispatchChords()[0] === null;
            if (hasIncompleteChord) {
                this._chords[this._chords.length - 1] = keybinding;
            }
            else {
                if (this._chords.length === 2) { // TODO: limit chords # to 2 for now
                    this._chords = [];
                }
                this._chords.push(keybinding);
            }
            const value = this._chords.map((keybinding) => keybinding.getUserSettingsLabel() || '').join(' ');
            this.setInputValue(options.quoteRecordedKeys ? `"${value}"` : value);
            this.inputBox.inputElement.title = info;
            this._onKeybinding.fire(this._chords);
        }
    };
    exports.KeybindingsSearchWidget = KeybindingsSearchWidget;
    exports.KeybindingsSearchWidget = KeybindingsSearchWidget = __decorate([
        __param(2, contextView_1.IContextViewService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, keybinding_1.IKeybindingService)
    ], KeybindingsSearchWidget);
    let DefineKeybindingWidget = class DefineKeybindingWidget extends widget_1.Widget {
        static { DefineKeybindingWidget_1 = this; }
        static { this.WIDTH = 400; }
        static { this.HEIGHT = 110; }
        constructor(parent, instantiationService) {
            super();
            this.instantiationService = instantiationService;
            this._chords = null;
            this._isVisible = false;
            this._onHide = this._register(new event_1.Emitter());
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onShowExistingKeybindings = this._register(new event_1.Emitter());
            this.onShowExistingKeybidings = this._onShowExistingKeybindings.event;
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._domNode.setDisplay('none');
            this._domNode.setClassName('defineKeybindingWidget');
            this._domNode.setWidth(DefineKeybindingWidget_1.WIDTH);
            this._domNode.setHeight(DefineKeybindingWidget_1.HEIGHT);
            const message = nls.localize('defineKeybinding.initial', "Press desired key combination and then press ENTER.");
            dom.append(this._domNode.domNode, dom.$('.message', undefined, message));
            this._domNode.domNode.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorWidgetBackground);
            this._domNode.domNode.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorWidgetForeground);
            this._domNode.domNode.style.boxShadow = `0 2px 8px ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.widgetShadow)}`;
            this._keybindingInputWidget = this._register(this.instantiationService.createInstance(KeybindingsSearchWidget, this._domNode.domNode, { ariaLabel: message, history: [], inputBoxStyles: defaultStyles_1.defaultInputBoxStyles }));
            this._keybindingInputWidget.startRecordingKeys();
            this._register(this._keybindingInputWidget.onKeybinding(keybinding => this.onKeybinding(keybinding)));
            this._register(this._keybindingInputWidget.onEnter(() => this.hide()));
            this._register(this._keybindingInputWidget.onEscape(() => this.clearOrHide()));
            this._register(this._keybindingInputWidget.onBlur(() => this.onCancel()));
            this._outputNode = dom.append(this._domNode.domNode, dom.$('.output'));
            this._showExistingKeybindingsNode = dom.append(this._domNode.domNode, dom.$('.existing'));
            if (parent) {
                dom.append(parent, this._domNode.domNode);
            }
        }
        get domNode() {
            return this._domNode.domNode;
        }
        define() {
            this._keybindingInputWidget.clear();
            return async_1.Promises.withAsyncBody(async (c) => {
                if (!this._isVisible) {
                    this._isVisible = true;
                    this._domNode.setDisplay('block');
                    this._chords = null;
                    this._keybindingInputWidget.setInputValue('');
                    dom.clearNode(this._outputNode);
                    dom.clearNode(this._showExistingKeybindingsNode);
                    // Input is not getting focus without timeout in safari
                    // https://github.com/microsoft/vscode/issues/108817
                    await (0, async_1.timeout)(0);
                    this._keybindingInputWidget.focus();
                }
                const disposable = this._onHide.event(() => {
                    c(this.getUserSettingsLabel());
                    disposable.dispose();
                });
            });
        }
        layout(layout) {
            const top = Math.round((layout.height - DefineKeybindingWidget_1.HEIGHT) / 2);
            this._domNode.setTop(top);
            const left = Math.round((layout.width - DefineKeybindingWidget_1.WIDTH) / 2);
            this._domNode.setLeft(left);
        }
        printExisting(numberOfExisting) {
            if (numberOfExisting > 0) {
                const existingElement = dom.$('span.existingText');
                const text = numberOfExisting === 1 ? nls.localize('defineKeybinding.oneExists', "1 existing command has this keybinding", numberOfExisting) : nls.localize('defineKeybinding.existing', "{0} existing commands have this keybinding", numberOfExisting);
                dom.append(existingElement, document.createTextNode(text));
                aria.alert(text);
                this._showExistingKeybindingsNode.appendChild(existingElement);
                existingElement.onmousedown = (e) => { e.preventDefault(); };
                existingElement.onmouseup = (e) => { e.preventDefault(); };
                existingElement.onclick = () => { this._onShowExistingKeybindings.fire(this.getUserSettingsLabel()); };
            }
        }
        onKeybinding(keybinding) {
            this._chords = keybinding;
            dom.clearNode(this._outputNode);
            dom.clearNode(this._showExistingKeybindingsNode);
            const firstLabel = new keybindingLabel_1.KeybindingLabel(this._outputNode, platform_1.OS, defaultStyles_1.defaultKeybindingLabelStyles);
            firstLabel.set(this._chords?.[0] ?? undefined);
            if (this._chords) {
                for (let i = 1; i < this._chords.length; i++) {
                    this._outputNode.appendChild(document.createTextNode(nls.localize('defineKeybinding.chordsTo', "chord to")));
                    const chordLabel = new keybindingLabel_1.KeybindingLabel(this._outputNode, platform_1.OS, defaultStyles_1.defaultKeybindingLabelStyles);
                    chordLabel.set(this._chords[i]);
                }
            }
            const label = this.getUserSettingsLabel();
            if (label) {
                this._onDidChange.fire(label);
            }
        }
        getUserSettingsLabel() {
            let label = null;
            if (this._chords) {
                label = this._chords.map(keybinding => keybinding.getUserSettingsLabel()).join(' ');
            }
            return label;
        }
        onCancel() {
            this._chords = null;
            this.hide();
        }
        clearOrHide() {
            if (this._chords === null) {
                this.hide();
            }
            else {
                this._chords = null;
                this._keybindingInputWidget.clear();
                dom.clearNode(this._outputNode);
                dom.clearNode(this._showExistingKeybindingsNode);
            }
        }
        hide() {
            this._domNode.setDisplay('none');
            this._isVisible = false;
            this._onHide.fire();
        }
    };
    exports.DefineKeybindingWidget = DefineKeybindingWidget;
    exports.DefineKeybindingWidget = DefineKeybindingWidget = DefineKeybindingWidget_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], DefineKeybindingWidget);
    let DefineKeybindingOverlayWidget = class DefineKeybindingOverlayWidget extends lifecycle_1.Disposable {
        static { DefineKeybindingOverlayWidget_1 = this; }
        static { this.ID = 'editor.contrib.defineKeybindingWidget'; }
        constructor(_editor, instantiationService) {
            super();
            this._editor = _editor;
            this._widget = this._register(instantiationService.createInstance(DefineKeybindingWidget, null));
            this._editor.addOverlayWidget(this);
        }
        getId() {
            return DefineKeybindingOverlayWidget_1.ID;
        }
        getDomNode() {
            return this._widget.domNode;
        }
        getPosition() {
            return {
                preference: null
            };
        }
        dispose() {
            this._editor.removeOverlayWidget(this);
            super.dispose();
        }
        start() {
            if (this._editor.hasModel()) {
                this._editor.revealPositionInCenterIfOutsideViewport(this._editor.getPosition(), 0 /* ScrollType.Smooth */);
            }
            const layoutInfo = this._editor.getLayoutInfo();
            this._widget.layout(new dom.Dimension(layoutInfo.width, layoutInfo.height));
            return this._widget.define();
        }
    };
    exports.DefineKeybindingOverlayWidget = DefineKeybindingOverlayWidget;
    exports.DefineKeybindingOverlayWidget = DefineKeybindingOverlayWidget = DefineKeybindingOverlayWidget_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], DefineKeybindingOverlayWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ1dpZGdldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3ByZWZlcmVuY2VzL2Jyb3dzZXIva2V5YmluZGluZ1dpZGdldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQStCekYsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSxpQ0FBWTtRQW1CeEQsWUFBWSxNQUFtQixFQUFFLE9BQWlDLEVBQzVDLGtCQUF1QyxFQUNyQyxvQkFBMkMsRUFDOUMsaUJBQXFDLEVBQ3JDLGlCQUFxQztZQUV6RCxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBcEJ2RixzQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFFbkUsa0JBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUErQixDQUFDLENBQUM7WUFDMUUsaUJBQVksR0FBdUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFFN0UsYUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzlDLFlBQU8sR0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFFNUMsY0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQy9DLGFBQVEsR0FBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFFOUMsWUFBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lB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