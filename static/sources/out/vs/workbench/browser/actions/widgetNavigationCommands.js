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
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, contextkey_1, keybindingsRegistry_1, listService_1, lifecycle_1, platform_1, contributions_1) {
    "use strict";
    var NavigableContainerManager_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerNavigableContainer = void 0;
    function handleFocusEventsGroup(group, handler) {
        const focusedIndices = new Set();
        return (0, lifecycle_1.combinedDisposable)(...group.map((events, index) => (0, lifecycle_1.combinedDisposable)(events.onDidFocus(() => {
            if (!focusedIndices.size) {
                handler(true);
            }
            focusedIndices.add(index);
        }), events.onDidBlur(() => {
            focusedIndices.delete(index);
            if (!focusedIndices.size) {
                handler(false);
            }
        }))));
    }
    const NavigableContainerFocusedContextKey = new contextkey_1.RawContextKey('navigableContainerFocused', false);
    let NavigableContainerManager = class NavigableContainerManager {
        static { NavigableContainerManager_1 = this; }
        constructor(contextKeyService) {
            this.containers = new Set();
            this.focused = NavigableContainerFocusedContextKey.bindTo(contextKeyService);
            NavigableContainerManager_1.INSTANCE = this;
        }
        dispose() {
            this.containers.clear();
            this.focused.reset();
            NavigableContainerManager_1.INSTANCE = undefined;
        }
        static register(container) {
            const instance = this.INSTANCE;
            if (!instance) {
                return lifecycle_1.Disposable.None;
            }
            instance.containers.add(container);
            return (0, lifecycle_1.combinedDisposable)(handleFocusEventsGroup(container.focusNotifiers, (isFocus) => {
                if (isFocus) {
                    instance.focused.set(true);
                    instance.lastContainer = container;
                }
                else if (instance.lastContainer === container) {
                    instance.focused.set(false);
                    instance.lastContainer = undefined;
                }
            }), (0, lifecycle_1.toDisposable)(() => {
                instance.containers.delete(container);
                if (instance.lastContainer === container) {
                    instance.focused.set(false);
                    instance.lastContainer = undefined;
                }
            }));
        }
        static getActive() {
            return this.INSTANCE?.lastContainer;
        }
    };
    NavigableContainerManager = NavigableContainerManager_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService)
    ], NavigableContainerManager);
    function registerNavigableContainer(container) {
        return NavigableContainerManager.register(container);
    }
    exports.registerNavigableContainer = registerNavigableContainer;
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(NavigableContainerManager, 1 /* LifecyclePhase.Starting */);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'widgetNavigation.focusPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(NavigableContainerFocusedContextKey, contextkey_1.ContextKeyExpr.or(listService_1.WorkbenchListFocusContextKey?.negate(), listService_1.WorkbenchListScrollAtTopContextKey)),
        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
        handler: () => {
            const activeContainer = NavigableContainerManager.getActive();
            activeContainer?.focusPreviousWidget();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'widgetNavigation.focusNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(NavigableContainerFocusedContextKey, contextkey_1.ContextKeyExpr.or(listService_1.WorkbenchListFocusContextKey?.negate(), listService_1.WorkbenchListScrollAtBottomContextKey)),
        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
        handler: () => {
            const activeContainer = NavigableContainerManager.getActive();
            activeContainer?.focusNextWidget();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0TmF2aWdhdGlvbkNvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9hY3Rpb25zL3dpZGdldE5hdmlnYXRpb25Db21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUNoRyxTQUFTLHNCQUFzQixDQUFDLEtBQWdDLEVBQUUsT0FBbUM7UUFDcEcsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUN6QyxPQUFPLElBQUEsOEJBQWtCLEVBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBQSw4QkFBa0IsRUFDM0UsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQztZQUNELGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLEVBQ0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDckIsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEIsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU0sbUNBQW1DLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDJCQUEyQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTNHLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQXlCOztRQVE5QixZ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