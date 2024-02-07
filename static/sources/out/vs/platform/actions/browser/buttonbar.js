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
define(["require", "exports", "vs/base/browser/ui/button/button", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry"], function (require, exports, button_1, actions_1, event_1, lifecycle_1, themables_1, nls_1, actions_2, contextkey_1, contextView_1, keybinding_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuWorkbenchButtonBar = exports.WorkbenchButtonBar = void 0;
    let WorkbenchButtonBar = class WorkbenchButtonBar extends button_1.ButtonBar {
        constructor(container, _options, _contextMenuService, _keybindingService, telemetryService) {
            super(container);
            this._options = _options;
            this._contextMenuService = _contextMenuService;
            this._keybindingService = _keybindingService;
            this._store = new lifecycle_1.DisposableStore();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._actionRunner = this._store.add(new actions_1.ActionRunner());
            if (_options?.telemetrySource) {
                this._actionRunner.onDidRun(e => {
                    telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: _options.telemetrySource });
                }, undefined, this._store);
            }
        }
        dispose() {
            this._onDidChange.dispose();
            this._store.dispose();
            super.dispose();
        }
        update(actions) {
            const conifgProvider = this._options?.buttonConfigProvider ?? (() => ({ showLabel: true }));
            this.clear();
            for (let i = 0; i < actions.length; i++) {
                const secondary = i > 0;
                const actionOrSubmenu = actions[i];
                let action;
                let btn;
                if (actionOrSubmenu instanceof actions_1.SubmenuAction && actionOrSubmenu.actions.length > 0) {
                    const [first, ...rest] = actionOrSubmenu.actions;
                    action = first;
                    btn = this.addButtonWithDropdown({
                        secondary: conifgProvider(action)?.isSecondary ?? secondary,
                        actionRunner: this._actionRunner,
                        actions: rest,
                        contextMenuProvider: this._contextMenuService,
                        ariaLabel: action.label
                    });
                }
                else {
                    action = actionOrSubmenu;
                    btn = this.addButton({
                        secondary: conifgProvider(action)?.isSecondary ?? secondary,
                        ariaLabel: action.label
                    });
                }
                btn.enabled = action.enabled;
                btn.element.classList.add('default-colors');
                if (conifgProvider(action)?.showLabel ?? true) {
                    btn.label = action.label;
                }
                else {
                    btn.element.classList.add('monaco-text-button');
                }
                if (conifgProvider(action)?.showIcon) {
                    if (action instanceof actions_2.MenuItemAction && themables_1.ThemeIcon.isThemeIcon(action.item.icon)) {
                        btn.icon = action.item.icon;
                    }
                    else if (action.class) {
                        btn.element.classList.add(...action.class.split(' '));
                    }
                }
                const kb = this._keybindingService.lookupKeybinding(action.id);
                if (kb) {
                    btn.element.title = (0, nls_1.localize)('labelWithKeybinding', "{0} ({1})", action.label, kb.getLabel());
                }
                else {
                    btn.element.title = action.label;
                }
                btn.onDidClick(async () => {
                    this._actionRunner.run(action);
                });
            }
            this._onDidChange.fire(this);
        }
    };
    exports.WorkbenchButtonBar = WorkbenchButtonBar;
    exports.WorkbenchButtonBar = WorkbenchButtonBar = __decorate([
        __param(2, contextView_1.IContextMenuService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, telemetry_1.ITelemetryService)
    ], WorkbenchButtonBar);
    let MenuWorkbenchButtonBar = class MenuWorkbenchButtonBar extends WorkbenchButtonBar {
        constructor(container, menuId, options, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService) {
            super(container, options, contextMenuService, keybindingService, telemetryService);
            const menu = menuService.createMenu(menuId, contextKeyService);
            this._store.add(menu);
            const update = () => {
                this.clear();
                const actions = menu
                    .getActions({ renderShortTitle: true })
                    .flatMap(entry => entry[1]);
                super.update(actions);
            };
            this._store.add(menu.onDidChange(update));
            update();
        }
        dispose() {
            super.dispose();
        }
        update(_actions) {
            throw new Error('Use Menu or WorkbenchButtonBar');
        }
    };
    exports.MenuWorkbenchButtonBar = MenuWorkbenchButtonBar;
    exports.MenuWorkbenchButtonBar = MenuWorkbenchButtonBar = __decorate([
        __param(3, actions_2.IMenuService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, telemetry_1.ITelemetryService)
    ], MenuWorkbenchButtonBar);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hY3Rpb25zL2Jyb3dzZXIvYnV0dG9uYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxrQkFBUztRQVNoRCxZQUNDLFNBQXNCLEVBQ0wsUUFBZ0QsRUFDNUMsbUJBQXlELEVBQzFELGtCQUF1RCxFQUN4RCxnQkFBbUM7WUFFdEQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBTEEsYUFBUSxHQUFSLFFBQVEsQ0FBd0M7WUFDM0Isd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUN6Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBWHpELFdBQU0sR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUdqQyxpQkFBWSxHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDM0MsZ0JBQVcsR0FBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFZM0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLHNCQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELElBQUksUUFBUSxFQUFFLGVBQWUsRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDL0IsZ0JBQWdCLENBQUMsVUFBVSxDQUMxQix5QkFBeUIsRUFDekIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxlQUFnQixFQUFFLENBQ3BELENBQUM7Z0JBQ0gsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFD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