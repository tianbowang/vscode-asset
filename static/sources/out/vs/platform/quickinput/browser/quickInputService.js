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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/layout/browser/layoutService", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/quickinput/browser/quickAccess", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "./quickInput", "vs/platform/quickinput/browser/quickInputController", "vs/platform/configuration/common/configuration", "vs/platform/hover/browser/hover"], function (require, exports, cancellation_1, event_1, contextkey_1, instantiation_1, layoutService_1, listService_1, opener_1, quickAccess_1, defaultStyles_1, colorRegistry_1, themeService_1, quickInput_1, quickInputController_1, configuration_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputService = void 0;
    let QuickInputService = class QuickInputService extends themeService_1.Themable {
        get backButton() { return this.controller.backButton; }
        get controller() {
            if (!this._controller) {
                this._controller = this._register(this.createController());
            }
            return this._controller;
        }
        get hasController() { return !!this._controller; }
        get quickAccess() {
            if (!this._quickAccess) {
                this._quickAccess = this._register(this.instantiationService.createInstance(quickAccess_1.QuickAccessController));
            }
            return this._quickAccess;
        }
        constructor(instantiationService, contextKeyService, themeService, layoutService, configurationService, hoverService) {
            super(themeService);
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.layoutService = layoutService;
            this.configurationService = configurationService;
            this.hoverService = hoverService;
            this._onShow = this._register(new event_1.Emitter());
            this.onShow = this._onShow.event;
            this._onHide = this._register(new event_1.Emitter());
            this.onHide = this._onHide.event;
            this.contexts = new Map();
        }
        createController(host = this.layoutService, options) {
            const defaultOptions = {
                idPrefix: 'quickInput_',
                container: host.activeContainer,
                ignoreFocusOut: () => false,
                backKeybindingLabel: () => undefined,
                setContextKey: (id) => this.setContextKey(id),
                linkOpenerDelegate: (content) => {
                    // HACK: https://github.com/microsoft/vscode/issues/173691
                    this.instantiationService.invokeFunction(accessor => {
                        const openerService = accessor.get(opener_1.IOpenerService);
                        openerService.open(content, { allowCommands: true, fromUserGesture: true });
                    });
                },
                returnFocus: () => host.focus(),
                createList: (user, container, delegate, renderers, options) => this.instantiationService.createInstance(listService_1.WorkbenchList, user, container, delegate, renderers, options),
                styles: this.computeStyles(),
                hoverDelegate: new quickInput_1.QuickInputHoverDelegate(this.configurationService, this.hoverService)
            };
            const controller = this._register(new quickInputController_1.QuickInputController({
                ...defaultOptions,
                ...options
            }, this.themeService, this.layoutService));
            controller.layout(host.activeContainerDimension, host.activeContainerOffset.quickPickTop);
            // Layout changes
            this._register(host.onDidLayoutActiveContainer(dimension => controller.layout(dimension, host.activeContainerOffset.quickPickTop)));
            this._register(host.onDidChangeActiveContainer(() => {
                if (controller.isVisible()) {
                    return;
                }
                controller.layout(host.activeContainerDimension, host.activeContainerOffset.quickPickTop);
            }));
            // Context keys
            this._register(controller.onShow(() => {
                this.resetContextKeys();
                this._onShow.fire();
            }));
            this._register(controller.onHide(() => {
                this.resetContextKeys();
                this._onHide.fire();
            }));
            return controller;
        }
        setContextKey(id) {
            let key;
            if (id) {
                key = this.contexts.get(id);
                if (!key) {
                    key = new contextkey_1.RawContextKey(id, false)
                        .bindTo(this.contextKeyService);
                    this.contexts.set(id, key);
                }
            }
            if (key && key.get()) {
                return; // already active context
            }
            this.resetContextKeys();
            key?.set(true);
        }
        resetContextKeys() {
            this.contexts.forEach(context => {
                if (context.get()) {
                    context.reset();
                }
            });
        }
        pick(picks, options = {}, token = cancellation_1.CancellationToken.None) {
            return this.controller.pick(picks, options, token);
        }
        input(options = {}, token = cancellation_1.CancellationToken.None) {
            return this.controller.input(options, token);
        }
        createQuickPick() {
            return this.controller.createQuickPick();
        }
        createInputBox() {
            return this.controller.createInputBox();
        }
        createQuickWidget() {
            return this.controller.createQuickWidget();
        }
        focus() {
            this.controller.focus();
        }
        toggle() {
            this.controller.toggle();
        }
        navigate(next, quickNavigate) {
            this.controller.navigate(next, quickNavigate);
        }
        accept(keyMods) {
            return this.controller.accept(keyMods);
        }
        back() {
            return this.controller.back();
        }
        cancel() {
            return this.controller.cancel();
        }
        updateStyles() {
            if (this.hasController) {
                this.controller.applyStyles(this.computeStyles());
            }
        }
        computeStyles() {
            return {
                widget: {
                    quickInputBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.quickInputBackground),
                    quickInputForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.quickInputForeground),
                    quickInputTitleBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.quickInputTitleBackground),
                    widgetBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.widgetBorder),
                    widgetShadow: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.widgetShadow),
                },
                inputBox: defaultStyles_1.defaultInputBoxStyles,
                toggle: defaultStyles_1.defaultToggleStyles,
                countBadge: defaultStyles_1.defaultCountBadgeStyles,
                button: defaultStyles_1.defaultButtonStyles,
                progressBar: defaultStyles_1.defaultProgressBarStyles,
                keybindingLabel: defaultStyles_1.defaultKeybindingLabelStyles,
                list: (0, defaultStyles_1.getListStyles)({
                    listBackground: colorRegistry_1.quickInputBackground,
                    listFocusBackground: colorRegistry_1.quickInputListFocusBackground,
                    listFocusForeground: colorRegistry_1.quickInputListFocusForeground,
                    // Look like focused when inactive.
                    listInactiveFocusForeground: colorRegistry_1.quickInputListFocusForeground,
                    listInactiveSelectionIconForeground: colorRegistry_1.quickInputListFocusIconForeground,
                    listInactiveFocusBackground: colorRegistry_1.quickInputListFocusBackground,
                    listFocusOutline: colorRegistry_1.activeContrastBorder,
                    listInactiveFocusOutline: colorRegistry_1.activeContrastBorder,
                }),
                pickerGroup: {
                    pickerGroupBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.pickerGroupBorder),
                    pickerGroupForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.pickerGroupForeground),
                }
            };
        }
    };
    exports.QuickInputService = QuickInputService;
    exports.QuickInputService = QuickInputService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, themeService_1.IThemeService),
        __param(3, layoutService_1.ILayoutService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, hover_1.IHoverService)
    ], QuickInputService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3F1aWNraW5wdXQvYnJvd3Nlci9xdWlja0lucHV0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQnpGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsdUJBQVE7UUFJOUMsSUFBSSxVQUFVLEtBQXdCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBUzFFLElBQVksVUFBVTtZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxJQUFZLGFBQWEsS0FBSyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUcxRCxJQUFJLFdBQVc7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtQ0FBcUIsQ0FBQyxDQUFDLENBQUM7WUFDckcsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBSUQsWUFDd0Isb0JBQTRELEVBQy9ELGlCQUF3RCxFQUM3RCxZQUEyQixFQUMxQixhQUFnRCxFQUN6QyxvQkFBOEQsRUFDdEUsWUFBNEM7WUFFM0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxD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