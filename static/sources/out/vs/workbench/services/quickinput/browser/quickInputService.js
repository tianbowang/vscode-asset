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
define(["require", "exports", "vs/platform/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/browser/quickInputService", "vs/platform/instantiation/common/extensions", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/quickaccess", "vs/platform/hover/browser/hover"], function (require, exports, layoutService_1, instantiation_1, themeService_1, configuration_1, contextkey_1, keybinding_1, quickInputService_1, extensions_1, quickInput_1, quickaccess_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputService = void 0;
    let QuickInputService = class QuickInputService extends quickInputService_1.QuickInputService {
        constructor(configurationService, instantiationService, keybindingService, contextKeyService, themeService, layoutService, hoverService) {
            super(instantiationService, contextKeyService, themeService, layoutService, configurationService, hoverService);
            this.keybindingService = keybindingService;
            this.inQuickInputContext = quickaccess_1.InQuickPickContextKey.bindTo(this.contextKeyService);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.onShow(() => this.inQuickInputContext.set(true)));
            this._register(this.onHide(() => this.inQuickInputContext.set(false)));
        }
        createController() {
            return super.createController(this.layoutService, {
                ignoreFocusOut: () => !this.configurationService.getValue('workbench.quickOpen.closeOnFocusLost'),
                backKeybindingLabel: () => this.keybindingService.lookupKeybinding('workbench.action.quickInputBack')?.getLabel() || undefined,
            });
        }
    };
    exports.QuickInputService = QuickInputService;
    exports.QuickInputService = QuickInputService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, themeService_1.IThemeService),
        __param(5, layoutService_1.ILayoutService),
        __param(6, hover_1.IHoverService)
    ], QuickInputService);
    (0, extensions_1.registerSingleton)(quickInput_1.IQuickInputService, QuickInputService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9xdWlja2lucHV0L2Jyb3dzZXIvcXVpY2tJbnB1dFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZXpGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEscUNBQXFCO1FBSTNELFlBQ3dCLG9CQUEyQyxFQUMzQyxvQkFBMkMsRUFDOUMsaUJBQXNELEVBQ3RELGlCQUFxQyxFQUMxQyxZQUEyQixFQUMxQixhQUE2QixFQUM5QixZQUEyQjtZQUUxQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxZQUFZLENBQUMsQ0FBQztZQU4zRSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBTDFELHdCQUFtQixHQUFHLG1DQUFxQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQWEzRixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVrQixnQkFBZ0I7WUFDbEMsT0FBTyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDakQsY0FBYyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQztnQkFDakcsbUJBQW1CLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLGlDQUFpQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksU0FBUzthQUM5SCxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0QsQ0FBQTtJQTdCWSw4Q0FBaUI7Z0NBQWpCLGlCQUFpQjtRQUszQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEscUJBQWEsQ0FBQTtPQVhILGlCQUFpQixDQTZCN0I7SUFFRCxJQUFBLDhCQUFpQixFQUFDLCtCQUFrQixFQUFFLGlCQUFpQixvQ0FBNEIsQ0FBQyJ9