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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/platform/accessibility/common/accessibility"], function (require, exports, DOM, keyboardEvent_1, actionViewItems_1, dropdownActionViewItem_1, menuEntryActionViewItem_1, contextkey_1, keybinding_1, notification_1, themeService_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DropdownWithPrimaryActionViewItem = void 0;
    let DropdownWithPrimaryActionViewItem = class DropdownWithPrimaryActionViewItem extends actionViewItems_1.BaseActionViewItem {
        get onDidChangeDropdownVisibility() {
            return this._dropdown.onDidChangeVisibility;
        }
        constructor(primaryAction, dropdownAction, dropdownMenuActions, className, _contextMenuProvider, _options, _keybindingService, _notificationService, _contextKeyService, _themeService, _accessibilityService) {
            super(null, primaryAction);
            this._contextMenuProvider = _contextMenuProvider;
            this._options = _options;
            this._container = null;
            this._dropdownContainer = null;
            this._primaryAction = new menuEntryActionViewItem_1.MenuEntryActionViewItem(primaryAction, undefined, _keybindingService, _notificationService, _contextKeyService, _themeService, _contextMenuProvider, _accessibilityService);
            if (_options?.actionRunner) {
                this._primaryAction.actionRunner = _options.actionRunner;
            }
            this._dropdown = new dropdownActionViewItem_1.DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
                menuAsChild: true,
                classNames: className ? ['codicon', 'codicon-chevron-down', className] : ['codicon', 'codicon-chevron-down'],
                actionRunner: this._options?.actionRunner,
                keybindingProvider: this._options?.getKeyBinding
            });
        }
        setActionContext(newContext) {
            super.setActionContext(newContext);
            this._primaryAction.setActionContext(newContext);
            this._dropdown.setActionContext(newContext);
        }
        render(container) {
            this._container = container;
            super.render(this._container);
            this._container.classList.add('monaco-dropdown-with-primary');
            const primaryContainer = DOM.$('.action-container');
            this._primaryAction.render(DOM.append(this._container, primaryContainer));
            this._dropdownContainer = DOM.$('.dropdown-action-container');
            this._dropdown.render(DOM.append(this._container, this._dropdownContainer));
            this._register(DOM.addDisposableListener(primaryContainer, DOM.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(17 /* KeyCode.RightArrow */)) {
                    this._primaryAction.element.tabIndex = -1;
                    this._dropdown.focus();
                    event.stopPropagation();
                }
            }));
            this._register(DOM.addDisposableListener(this._dropdownContainer, DOM.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(15 /* KeyCode.LeftArrow */)) {
                    this._primaryAction.element.tabIndex = 0;
                    this._dropdown.setFocusable(false);
                    this._primaryAction.element?.focus();
                    event.stopPropagation();
                }
            }));
            this.updateEnabled();
        }
        focus(fromRight) {
            if (fromRight) {
                this._dropdown.focus();
            }
            else {
                this._primaryAction.element.tabIndex = 0;
                this._primaryAction.element.focus();
            }
        }
        blur() {
            this._primaryAction.element.tabIndex = -1;
            this._dropdown.blur();
            this._container.blur();
        }
        setFocusable(focusable) {
            if (focusable) {
                this._primaryAction.element.tabIndex = 0;
            }
            else {
                this._primaryAction.element.tabIndex = -1;
                this._dropdown.setFocusable(false);
            }
        }
        updateEnabled() {
            const disabled = !this.action.enabled;
            this.element?.classList.toggle('disabled', disabled);
        }
        update(dropdownAction, dropdownMenuActions, dropdownIcon) {
            this._dropdown.dispose();
            this._dropdown = new dropdownActionViewItem_1.DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
                menuAsChild: true,
                classNames: ['codicon', dropdownIcon || 'codicon-chevron-down']
            });
            if (this._dropdownContainer) {
                this._dropdown.render(this._dropdownContainer);
            }
        }
        dispose() {
            this._primaryAction.dispose();
            this._dropdown.dispose();
            super.dispose();
        }
    };
    exports.DropdownWithPrimaryActionViewItem = DropdownWithPrimaryActionViewItem;
    exports.DropdownWithPrimaryActionViewItem = DropdownWithPrimaryActionViewItem = __decorate([
        __param(6, keybinding_1.IKeybindingService),
        __param(7, notification_1.INotificationService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, themeService_1.IThemeService),
        __param(10, accessibility_1.IAccessibilityService)
    ], DropdownWithPrimaryActionViewItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcGRvd25XaXRoUHJpbWFyeUFjdGlvblZpZXdJdGVtLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hY3Rpb25zL2Jyb3dzZXIvZHJvcGRvd25XaXRoUHJpbWFyeUFjdGlvblZpZXdJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdCekYsSUFBTSxpQ0FBaUMsR0FBdkMsTUFBTSxpQ0FBa0MsU0FBUSxvQ0FBa0I7UUFNeEUsSUFBSSw2QkFBNkI7WUFDaEMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO1FBQzdDLENBQUM7UUFFRCxZQUNDLGFBQTZCLEVBQzdCLGNBQXVCLEVBQ3ZCLG1CQUE4QixFQUM5QixTQUFpQixFQUNBLG9CQUF5QyxFQUN6QyxRQUErRCxFQUM1RCxrQkFBc0MsRUFDcEMsb0JBQTBDLEVBQzVDLGtCQUFzQyxFQUMzQyxhQUE0QixFQUNwQixxQkFBNEM7WUFFbkUsS0FBSyxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztZQVJWLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBcUI7WUFDekMsYUFBUSxHQUFSLFFBQVEsQ0FBdUQ7WUFiekUsZUFBVSxHQUF1QixJQUFJLENBQUM7WUFDdEMsdUJBQWtCLEdBQXVCLElBQUksQ0FBQztZQW9CckQsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGlEQUF1QixDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDdE0sSUFBSSxRQUFRLEVBQUUsWUFBWSxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUM7WUFDMUQs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