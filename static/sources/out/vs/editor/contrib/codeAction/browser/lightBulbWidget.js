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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/common/model/utils", "vs/editor/contrib/codeAction/browser/codeAction", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybinding", "vs/css!./lightBulbWidget"], function (require, exports, dom, touch_1, codicons_1, event_1, lifecycle_1, themables_1, utils_1, codeAction_1, nls, commands_1, keybinding_1) {
    "use strict";
    var LightBulbWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LightBulbWidget = void 0;
    var LightBulbState;
    (function (LightBulbState) {
        let Type;
        (function (Type) {
            Type[Type["Hidden"] = 0] = "Hidden";
            Type[Type["Showing"] = 1] = "Showing";
        })(Type = LightBulbState.Type || (LightBulbState.Type = {}));
        LightBulbState.Hidden = { type: 0 /* Type.Hidden */ };
        class Showing {
            constructor(actions, trigger, editorPosition, widgetPosition) {
                this.actions = actions;
                this.trigger = trigger;
                this.editorPosition = editorPosition;
                this.widgetPosition = widgetPosition;
                this.type = 1 /* Type.Showing */;
            }
        }
        LightBulbState.Showing = Showing;
    })(LightBulbState || (LightBulbState = {}));
    let LightBulbWidget = class LightBulbWidget extends lifecycle_1.Disposable {
        static { LightBulbWidget_1 = this; }
        static { this.ID = 'editor.contrib.lightbulbWidget'; }
        static { this._posPref = [0 /* ContentWidgetPositionPreference.EXACT */]; }
        constructor(_editor, _keybindingService, commandService) {
            super();
            this._editor = _editor;
            this._keybindingService = _keybindingService;
            this._onClick = this._register(new event_1.Emitter());
            this.onClick = this._onClick.event;
            this._state = LightBulbState.Hidden;
            this._iconClasses = [];
            this._domNode = dom.$('div.lightBulbWidget');
            this._register(touch_1.Gesture.ignoreTarget(this._domNode));
            this._editor.addContentWidget(this);
            this._register(this._editor.onDidChangeModelContent(_ => {
                // cancel when the line in question has been removed
                const editorModel = this._editor.getModel();
                if (this.state.type !== 1 /* LightBulbState.Type.Showing */ || !editorModel || this.state.editorPosition.lineNumber >= editorModel.getLineCount()) {
                    this.hide();
                }
            }));
            this._register(dom.addStandardDisposableGenericMouseDownListener(this._domNode, e => {
                if (this.state.type !== 1 /* LightBulbState.Type.Showing */) {
                    return;
                }
                if (this.state.actions.allAIFixes
                    && this.state.actions.validActions.length === 1) {
                    const action = this.state.actions.validActions[0].action;
                    const id = action.command?.id;
                    if (id) {
                        let args = action.command?.arguments;
                        if (id === 'inlineChat.start' && args && args.length === 1) {
                            args = [{ ...args[0], autoSend: false }];
                        }
                        commandService.executeCommand(id, ...(args || []));
                        e.preventDefault();
                        return;
                    }
                }
                // Make sure that focus / cursor location is not lost when clicking widget icon
                this._editor.focus();
                e.preventDefault();
                // a bit of extra work to make sure the menu
                // doesn't cover the line-text
                const { top, height } = dom.getDomNodePagePosition(this._domNode);
                const lineHeight = this._editor.getOption(66 /* EditorOption.lineHeight */);
                let pad = Math.floor(lineHeight / 3);
                if (this.state.widgetPosition.position !== null && this.state.widgetPosition.position.lineNumber < this.state.editorPosition.lineNumber) {
                    pad += lineHeight;
                }
                this._onClick.fire({
                    x: e.posx,
                    y: top + height + pad,
                    actions: this.state.actions,
                    trigger: this.state.trigger,
                });
            }));
            this._register(dom.addDisposableListener(this._domNode, 'mouseenter', (e) => {
                if ((e.buttons & 1) !== 1) {
                    return;
                }
                // mouse enters lightbulb while the primary/left button
                // is being pressed -> hide the lightbulb
                this.hide();
            }));
            this._register(event_1.Event.runAndSubscribe(this._keybindingService.onDidUpdateKeybindings, () => {
                this._preferredKbLabel = this._keybindingService.lookupKeybinding(codeAction_1.autoFixCommandId)?.getLabel() ?? undefined;
                this._quickFixKbLabel = this._keybindingService.lookupKeybinding(codeAction_1.quickFixCommandId)?.getLabel() ?? undefined;
                this._updateLightBulbTitleAndIcon();
            }));
        }
        dispose() {
            super.dispose();
            this._editor.removeContentWidget(this);
        }
        getId() {
            return 'LightBulbWidget';
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            return this._state.type === 1 /* LightBulbState.Type.Showing */ ? this._state.widgetPosition : null;
        }
        update(actions, trigger, atPosition) {
            if (actions.validActions.length <= 0) {
                return this.hide();
            }
            const options = this._editor.getOptions();
            if (!options.get(64 /* EditorOption.lightbulb */).enabled) {
                return this.hide();
            }
            const model = this._editor.getModel();
            if (!model) {
                return this.hide();
            }
            const { lineNumber, column } = model.validatePosition(atPosition);
            const tabSize = model.getOptions().tabSize;
            const fontInfo = this._editor.getOptions().get(50 /* EditorOption.fontInfo */);
            const lineContent = model.getLineContent(lineNumber);
            const indent = (0, utils_1.computeIndentLevel)(lineContent, tabSize);
            const lineHasSpace = fontInfo.spaceWidth * indent > 22;
            const isFolded = (lineNumber) => {
                return lineNumber > 2 && this._editor.getTopForLineNumber(lineNumber) === this._editor.getTopForLineNumber(lineNumber - 1);
            };
            let effectiveLineNumber = lineNumber;
            let effectiveColumnNumber = 1;
            if (!lineHasSpace) {
                if (lineNumber > 1 && !isFolded(lineNumber - 1)) {
                    effectiveLineNumber -= 1;
                }
                else if ((lineNumber < model.getLineCount()) && !isFolded(lineNumber + 1)) {
                    effectiveLineNumber += 1;
                }
                else if (column * fontInfo.spaceWidth < 22) {
                    // cannot show lightbulb above/below and showing
                    // it inline would overlay the cursor...
                    return this.hide();
                }
                effectiveColumnNumber = /^\S\s*$/.test(model.getLineContent(effectiveLineNumber)) ? 2 : 1;
            }
            this.state = new LightBulbState.Showing(actions, trigger, atPosition, {
                position: { lineNumber: effectiveLineNumber, column: effectiveColumnNumber },
                preference: LightBulbWidget_1._posPref
            });
            this._editor.layoutContentWidget(this);
        }
        hide() {
            if (this.state === LightBulbState.Hidden) {
                return;
            }
            this.state = LightBulbState.Hidden;
            this._editor.layoutContentWidget(this);
        }
        get state() { return this._state; }
        set state(value) {
            this._state = value;
            this._updateLightBulbTitleAndIcon();
        }
        _updateLightBulbTitleAndIcon() {
            this._domNode.classList.remove(...this._iconClasses);
            this._iconClasses = [];
            if (this.state.type !== 1 /* LightBulbState.Type.Showing */) {
                return;
            }
            let icon;
            let autoRun = false;
            if (this.state.actions.allAIFixes) {
                icon = codicons_1.Codicon.sparkleFilled;
                if (this.state.actions.validActions.length === 1) {
                    autoRun = true;
                }
            }
            else if (this.state.actions.hasAutoFix) {
                if (this.state.actions.hasAIFix) {
                    icon = codicons_1.Codicon.lightbulbSparkleAutofix;
                }
                else {
                    icon = codicons_1.Codicon.lightbulbAutofix;
                }
            }
            else if (this.state.actions.hasAIFix) {
                icon = codicons_1.Codicon.lightbulbSparkle;
            }
            else {
                icon = codicons_1.Codicon.lightBulb;
            }
            this._updateLightbulbTitle(this.state.actions.hasAutoFix, autoRun);
            this._iconClasses = themables_1.ThemeIcon.asClassNameArray(icon);
            this._domNode.classList.add(...this._iconClasses);
        }
        _updateLightbulbTitle(autoFix, autoRun) {
            if (this.state.type !== 1 /* LightBulbState.Type.Showing */) {
                return;
            }
            if (autoRun) {
                this.title = nls.localize('codeActionAutoRun', "Run: {0}", this.state.actions.validActions[0].action.title);
            }
            else if (autoFix && this._preferredKbLabel) {
                this.title = nls.localize('preferredcodeActionWithKb', "Show Code Actions. Preferred Quick Fix Available ({0})", this._preferredKbLabel);
            }
            else if (!autoFix && this._quickFixKbLabel) {
                this.title = nls.localize('codeActionWithKb', "Show Code Actions ({0})", this._quickFixKbLabel);
            }
            else if (!autoFix) {
                this.title = nls.localize('codeAction', "Show Code Actions");
            }
        }
        set title(value) {
            this._domNode.title = value;
        }
    };
    exports.LightBulbWidget = LightBulbWidget;
    exports.LightBulbWidget = LightBulbWidget = LightBulbWidget_1 = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, commands_1.ICommandService)
    ], LightBulbWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlnaHRCdWxiV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb2RlQWN0aW9uL2Jyb3dzZXIvbGlnaHRCdWxiV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQmhHLElBQVUsY0FBYyxDQXFCdkI7SUFyQkQsV0FBVSxjQUFjO1FBRXZCLElBQWtCLElBR2pCO1FBSEQsV0FBa0IsSUFBSTtZQUNyQixtQ0FBTSxDQUFBO1lBQ04scUNBQU8sQ0FBQTtRQUNSLENBQUMsRUFIaUIsSUFBSSxHQUFKLG1CQUFJLEtBQUosbUJBQUksUUFHckI7UUFFWSxxQkFBTSxHQUFHLEVBQUUsSUFBSSxxQkFBYSxFQUFXLENBQUM7UUFFckQsTUFBYSxPQUFPO1lBR25CLFlBQ2lCLE9BQXNCLEVBQ3RCLE9BQTBCLEVBQzFCLGNBQXlCLEVBQ3pCLGNBQXNDO2dCQUh0QyxZQUFPLEdBQVAsT0FBTyxDQUFlO2dCQUN0QixZQUFPLEdBQVAsT0FBTyxDQUFtQjtnQkFDMUIsbUJBQWMsR0FBZCxjQUFjLENBQVc7Z0JBQ3pCLG1CQUFjLEdBQWQsY0FBYyxDQUF3QjtnQkFOOUMsU0FBSSx3QkFBZ0I7WUFPekIsQ0FBQztTQUNMO1FBVFksc0JBQU8sVUFTbkIsQ0FBQTtJQUdGLENBQUMsRUFyQlMsY0FBYyxLQUFkLGNBQWMsUUFxQnZCO0lBRU0sSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZ0IsU0FBUSxzQkFBVTs7aUJBRXZCLE9BQUUsR0FBRyxnQ0FBZ0MsQUFBbkMsQ0FBb0M7aUJBRXJDLGFBQVEsR0FBRywrQ0FBdUMsQUFBMUMsQ0FBMkM7UUFhM0UsWUFDa0IsT0FBb0IsRUFDakIsa0JBQXVELEVBQzFELGNBQStCO1lBRWhELEtBQUssRUFBRSxDQUFDO1lBSlMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZ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