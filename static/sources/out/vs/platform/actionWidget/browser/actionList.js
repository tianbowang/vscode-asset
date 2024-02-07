var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/browser/ui/list/listWidget", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/themables", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/css!./actionWidget"], function (require, exports, dom, keybindingLabel_1, listWidget_1, cancellation_1, codicons_1, lifecycle_1, platform_1, themables_1, nls_1, contextView_1, keybinding_1, defaultStyles_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionList = exports.ActionListItemKind = exports.previewSelectedActionCommand = exports.acceptSelectedActionCommand = void 0;
    exports.acceptSelectedActionCommand = 'acceptSelectedCodeAction';
    exports.previewSelectedActionCommand = 'previewSelectedCodeAction';
    var ActionListItemKind;
    (function (ActionListItemKind) {
        ActionListItemKind["Action"] = "action";
        ActionListItemKind["Header"] = "header";
    })(ActionListItemKind || (exports.ActionListItemKind = ActionListItemKind = {}));
    class HeaderRenderer {
        get templateId() { return "header" /* ActionListItemKind.Header */; }
        renderTemplate(container) {
            container.classList.add('group-header');
            const text = document.createElement('span');
            container.append(text);
            return { container, text };
        }
        renderElement(element, _index, templateData) {
            templateData.text.textContent = element.group?.title ?? '';
        }
        disposeTemplate(_templateData) {
            // noop
        }
    }
    let ActionItemRenderer = class ActionItemRenderer {
        get templateId() { return "action" /* ActionListItemKind.Action */; }
        constructor(_supportsPreview, _keybindingService) {
            this._supportsPreview = _supportsPreview;
            this._keybindingService = _keybindingService;
        }
        renderTemplate(container) {
            container.classList.add(this.templateId);
            const icon = document.createElement('div');
            icon.className = 'icon';
            container.append(icon);
            const text = document.createElement('span');
            text.className = 'title';
            container.append(text);
            const keybinding = new keybindingLabel_1.KeybindingLabel(container, platform_1.OS);
            return { container, icon, text, keybinding };
        }
        renderElement(element, _index, data) {
            if (element.group?.icon) {
                data.icon.className = themables_1.ThemeIcon.asClassName(element.group.icon);
                if (element.group.icon.color) {
                    data.icon.style.color = (0, colorRegistry_1.asCssVariable)(element.group.icon.color.id);
                }
            }
            else {
                data.icon.className = themables_1.ThemeIcon.asClassName(codicons_1.Codicon.lightBulb);
                data.icon.style.color = 'var(--vscode-editorLightBulb-foreground)';
            }
            if (!element.item || !element.label) {
                return;
            }
            data.text.textContent = stripNewlines(element.label);
            data.keybinding.set(element.keybinding);
            dom.setVisibility(!!element.keybinding, data.keybinding.element);
            const actionTitle = this._keybindingService.lookupKeybinding(exports.acceptSelectedActionCommand)?.getLabel();
            const previewTitle = this._keybindingService.lookupKeybinding(exports.previewSelectedActionCommand)?.getLabel();
            data.container.classList.toggle('option-disabled', element.disabled);
            if (element.disabled) {
                data.container.title = element.label;
            }
            else if (actionTitle && previewTitle) {
                if (this._supportsPreview && element.canPreview) {
                    data.container.title = (0, nls_1.localize)({ key: 'label-preview', comment: ['placeholders are keybindings, e.g "F2 to apply, Shift+F2 to preview"'] }, "{0} to apply, {1} to preview", actionTitle, previewTitle);
                }
                else {
                    data.container.title = (0, nls_1.localize)({ key: 'label', comment: ['placeholder is a keybinding, e.g "F2 to apply"'] }, "{0} to apply", actionTitle);
                }
            }
            else {
                data.container.title = '';
            }
        }
        disposeTemplate(_templateData) {
            // noop
        }
    };
    ActionItemRenderer = __decorate([
        __param(1, keybinding_1.IKeybindingService)
    ], ActionItemRenderer);
    class AcceptSelectedEvent extends UIEvent {
        constructor() { super('acceptSelectedAction'); }
    }
    class PreviewSelectedEvent extends UIEvent {
        constructor() { super('previewSelectedAction'); }
    }
    function getKeyboardNavigationLabel(item) {
        // Filter out header vs. action
        if (item.kind === 'action') {
            return item.label;
        }
        return undefined;
    }
    let ActionList = class ActionList extends lifecycle_1.Disposable {
        constructor(user, preview, items, _delegate, _contextViewService, _keybindingService) {
            super();
            this._delegate = _delegate;
            this._contextViewService = _contextViewService;
            this._keybindingService = _keybindingService;
            this._actionLineHeight = 24;
            this._headerLineHeight = 26;
            this.cts = this._register(new cancellation_1.CancellationTokenSource());
            this.domNode = document.createElement('div');
            this.domNode.classList.add('actionList');
            const virtualDelegate = {
                getHeight: element => element.kind === "header" /* ActionListItemKind.Header */ ? this._headerLineHeight : this._actionLineHeight,
                getTemplateId: element => element.kind
            };
            this._list = this._register(new listWidget_1.List(user, this.domNode, virtualDelegate, [
                new ActionItemRenderer(preview, this._keybindingService),
                new HeaderRenderer(),
            ], {
                keyboardSupport: false,
                typeNavigationEnabled: true,
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel },
                accessibilityProvider: {
                    getAriaLabel: element => {
                        if (element.kind === "action" /* ActionListItemKind.Action */) {
                            let label = element.label ? stripNewlines(element?.label) : '';
                            if (element.disabled) {
                                label = (0, nls_1.localize)({ key: 'customQuickFixWidget.labels', comment: [`Action widget labels for accessibility.`] }, "{0}, Disabled Reason: {1}", label, element.disabled);
                            }
                            return label;
                        }
                        return null;
                    },
                    getWidgetAriaLabel: () => (0, nls_1.localize)({ key: 'customQuickFixWidget', comment: [`An action widget option`] }, "Action Widget"),
                    getRole: (e) => e.kind === "action" /* ActionListItemKind.Action */ ? 'option' : 'separator',
                    getWidgetRole: () => 'listbox',
                },
            }));
            this._list.style(defaultStyles_1.defaultListStyles);
            this._register(this._list.onMouseClick(e => this.onListClick(e)));
            this._register(this._list.onMouseOver(e => this.onListHover(e)));
            this._register(this._list.onDidChangeFocus(() => this.onFocus()));
            this._register(this._list.onDidChangeSelection(e => this.onListSelection(e)));
            this._allMenuItems = items;
            this._list.splice(0, this._list.length, this._allMenuItems);
            if (this._list.length) {
                this.focusNext();
            }
        }
        focusCondition(element) {
            return !element.disabled && element.kind === "action" /* ActionListItemKind.Action */;
        }
        hide(didCancel) {
            this._delegate.onHide(didCancel);
            this.cts.cancel();
            this._contextViewService.hideContextView();
        }
        layout(minWidth) {
            // Updating list height, depending on how many separators and headers there are.
            const numHeaders = this._allMenuItems.filter(item => item.kind === 'header').length;
            const itemsHeight = this._allMenuItems.length * this._actionLineHeight;
            const heightWithHeaders = itemsHeight + numHeaders * this._headerLineHeight - numHeaders * this._actionLineHeight;
            this._list.layout(heightWithHeaders);
            let maxWidth = minWidth;
            if (this._allMenuItems.length >= 50) {
                maxWidth = 380;
            }
            else {
                // For finding width dynamically (not using resize observer)
                const itemWidths = this._allMenuItems.map((_, index) => {
                    const element = this.domNode.ownerDocument.getElementById(this._list.getElementID(index));
                    if (element) {
                        element.style.width = 'auto';
                        const width = element.getBoundingClientRect().width;
                        element.style.width = '';
                        return width;
                    }
                    return 0;
                });
                // resize observer - can be used in the future since list widget supports dynamic height but not width
                maxWidth = Math.max(...itemWidths, minWidth);
            }
            const maxVhPrecentage = 0.7;
            const height = Math.min(heightWithHeaders, this.domNode.ownerDocument.body.clientHeight * maxVhPrecentage);
            this._list.layout(height, maxWidth);
            this.domNode.style.height = `${height}px`;
            this._list.domFocus();
            return maxWidth;
        }
        focusPrevious() {
            this._list.focusPrevious(1, true, undefined, this.focusCondition);
        }
        focusNext() {
            this._list.focusNext(1, true, undefined, this.focusCondition);
        }
        acceptSelected(preview) {
            const focused = this._list.getFocus();
            if (focused.length === 0) {
                return;
            }
            const focusIndex = focused[0];
            const element = this._list.element(focusIndex);
            if (!this.focusCondition(element)) {
                return;
            }
            const event = preview ? new PreviewSelectedEvent() : new AcceptSelectedEvent();
            this._list.setSelection([focusIndex], event);
        }
        onListSelection(e) {
            if (!e.elements.length) {
                return;
            }
            const element = e.elements[0];
            if (element.item && this.focusCondition(element)) {
                this._delegate.onSelect(element.item, e.browserEvent instanceof PreviewSelectedEvent);
            }
            else {
                this._list.setSelection([]);
            }
        }
        onFocus() {
            const focused = this._list.getFocus();
            if (focused.length === 0) {
                return;
            }
            const focusIndex = focused[0];
            const element = this._list.element(focusIndex);
            this._delegate.onFocus?.(element.item);
        }
        async onListHover(e) {
            const element = e.element;
            if (element && element.item && this.focusCondition(element)) {
                if (this._delegate.onHover && !element.disabled && element.kind === "action" /* ActionListItemKind.Action */) {
                    const result = await this._delegate.onHover(element.item, this.cts.token);
                    element.canPreview = result ? result.canPreview : undefined;
                }
                if (e.index) {
                    this._list.splice(e.index, 1, [element]);
                }
            }
            this._list.setFocus(typeof e.index === 'number' ? [e.index] : []);
        }
        onListClick(e) {
            if (e.element && this.focusCondition(e.element)) {
                this._list.setFocus([]);
            }
        }
    };
    exports.ActionList = ActionList;
    exports.ActionList = ActionList = __decorate([
        __param(4, contextView_1.IContextViewService),
        __param(5, keybinding_1.IKeybindingService)
    ], ActionList);
    function stripNewlines(str) {
        return str.replace(/\r\n|\r|\n/g, ' ');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uTGlzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYWN0aW9uV2lkZ2V0L2Jyb3dzZXIvYWN0aW9uTGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBcUJhLFFBQUEsMkJBQTJCLEdBQUcsMEJBQTBCLENBQUM7SUFDekQsUUFBQSw0QkFBNEIsR0FBRywyQkFBMkIsQ0FBQztJQTBCeEUsSUFBa0Isa0JBR2pCO0lBSEQsV0FBa0Isa0JBQWtCO1FBQ25DLHVDQUFpQixDQUFBO1FBQ2pCLHVDQUFpQixDQUFBO0lBQ2xCLENBQUMsRUFIaUIsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFHbkM7SUFPRCxNQUFNLGNBQWM7UUFFbkIsSUFBSSxVQUFVLEtBQWEsZ0RBQWlDLENBQUMsQ0FBQztRQUU5RCxjQUFjLENBQUMsU0FBc0I7WUFDcEMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFeEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1QyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVELGFBQWEsQ0FBQyxPQUEyQixFQUFFLE1BQWMsRUFBRSxZQUFpQztZQUMzRixZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDNUQsQ0FBQztRQUVELGVBQWUsQ0FBQyxhQUFrQztZQUNqRCxPQUFPO1FBQ1IsQ0FBQztLQUNEO0lBRUQsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBa0I7UUFFdkIsSUFBSSxVQUFVLEtBQWEsZ0RBQWlDLENBQUMsQ0FB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