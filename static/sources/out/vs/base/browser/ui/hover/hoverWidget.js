/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/lifecycle", "vs/nls", "vs/css!./hover"], function (require, exports, dom, keyboardEvent_1, scrollableElement_1, lifecycle_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getHoverAccessibleViewHint = exports.HoverAction = exports.HoverWidget = exports.HoverPosition = void 0;
    const $ = dom.$;
    var HoverPosition;
    (function (HoverPosition) {
        HoverPosition[HoverPosition["LEFT"] = 0] = "LEFT";
        HoverPosition[HoverPosition["RIGHT"] = 1] = "RIGHT";
        HoverPosition[HoverPosition["BELOW"] = 2] = "BELOW";
        HoverPosition[HoverPosition["ABOVE"] = 3] = "ABOVE";
    })(HoverPosition || (exports.HoverPosition = HoverPosition = {}));
    class HoverWidget extends lifecycle_1.Disposable {
        constructor() {
            super();
            this.containerDomNode = document.createElement('div');
            this.containerDomNode.className = 'monaco-hover';
            this.containerDomNode.tabIndex = 0;
            this.containerDomNode.setAttribute('role', 'tooltip');
            this.contentsDomNode = document.createElement('div');
            this.contentsDomNode.className = 'monaco-hover-content';
            this.scrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.contentsDomNode, {
                consumeMouseWheelIfScrollbarIsNeeded: true
            }));
            this.containerDomNode.appendChild(this.scrollbar.getDomNode());
        }
        onContentsChanged() {
            this.scrollbar.scanDomNode();
        }
    }
    exports.HoverWidget = HoverWidget;
    class HoverAction extends lifecycle_1.Disposable {
        static render(parent, actionOptions, keybindingLabel) {
            return new HoverAction(parent, actionOptions, keybindingLabel);
        }
        constructor(parent, actionOptions, keybindingLabel) {
            super();
            this.actionContainer = dom.append(parent, $('div.action-container'));
            this.actionContainer.setAttribute('tabindex', '0');
            this.action = dom.append(this.actionContainer, $('a.action'));
            this.action.setAttribute('role', 'button');
            if (actionOptions.iconClass) {
                dom.append(this.action, $(`span.icon.${actionOptions.iconClass}`));
            }
            const label = dom.append(this.action, $('span'));
            label.textContent = keybindingLabel ? `${actionOptions.label} (${keybindingLabel})` : actionOptions.label;
            this._register(dom.addDisposableListener(this.actionContainer, dom.EventType.CLICK, e => {
                e.stopPropagation();
                e.preventDefault();
                actionOptions.run(this.actionContainer);
            }));
            this._register(dom.addDisposableListener(this.actionContainer, dom.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    e.stopPropagation();
                    e.preventDefault();
                    actionOptions.run(this.actionContainer);
                }
            }));
            this.setEnabled(true);
        }
        setEnabled(enabled) {
            if (enabled) {
                this.actionContainer.classList.remove('disabled');
                this.actionContainer.removeAttribute('aria-disabled');
            }
            else {
                this.actionContainer.classList.add('disabled');
                this.actionContainer.setAttribute('aria-disabled', 'true');
            }
        }
    }
    exports.HoverAction = HoverAction;
    function getHoverAccessibleViewHint(shouldHaveHint, keybinding) {
        return shouldHaveHint && keybinding ? (0, nls_1.localize)('acessibleViewHint', "Inspect this in the accessible view with {0}.", keybinding) : shouldHaveHint ? (0, nls_1.localize)('acessibleViewHintNoKbOpen', "Inspect this in the accessible view via the command Open Accessible View which is currently not triggerable via keybinding.") : '';
    }
    exports.getHoverAccessibleViewHint = getHoverAccessibleViewHint;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXJXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9ob3Zlci9ob3ZlcldpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVoQixJQUFrQixhQUVqQjtJQUZELFdBQWtCLGFBQWE7UUFDOUIsaURBQUksQ0FBQTtRQUFFLG1EQUFLLENBQUE7UUFBRSxtREFBSyxDQUFBO1FBQUUsbURBQUssQ0FBQTtJQUMxQixDQUFDLEVBRmlCLGFBQWEsNkJBQWIsYUFBYSxRQUU5QjtJQUVELE1BQWEsV0FBWSxTQUFRLHNCQUFVO1FBTTFDO1lBQ0MsS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQztZQUNqRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsc0JBQXNCLENBQUM7WUFFeEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksd0NBQW9CLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDOUUsb0NBQW9DLEVBQUUsSUFBSTthQUMxQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxnQkFBZ0Is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