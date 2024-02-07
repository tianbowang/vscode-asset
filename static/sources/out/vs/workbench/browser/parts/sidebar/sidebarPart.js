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
define(["require", "exports", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/common/contextkeys", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/extensions/common/extensions", "vs/base/common/types", "vs/workbench/common/views", "vs/workbench/browser/parts/paneCompositePart", "vs/workbench/browser/parts/activitybar/activitybarPart", "vs/platform/configuration/common/configuration", "vs/platform/actions/common/actions", "vs/base/common/actions", "vs/workbench/browser/actions/layoutActions", "vs/nls", "vs/css!./media/sidebarpart", "vs/workbench/browser/parts/sidebar/sidebarActions"], function (require, exports, layoutService_1, contextkeys_1, storage_1, contextView_1, keybinding_1, instantiation_1, themeService_1, colorRegistry_1, theme_1, notification_1, contextkey_1, extensions_1, types_1, views_1, paneCompositePart_1, activitybarPart_1, configuration_1, actions_1, actions_2, layoutActions_1, nls_1) {
    "use strict";
    var SidebarPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SidebarPart = void 0;
    let SidebarPart = class SidebarPart extends paneCompositePart_1.AbstractPaneCompositePart {
        static { SidebarPart_1 = this; }
        static { this.activeViewletSettingsKey = 'workbench.sidebar.activeviewletid'; }
        get preferredWidth() {
            const viewlet = this.getActivePaneComposite();
            if (!viewlet) {
                return;
            }
            const width = viewlet.getOptimalWidth();
            if (typeof width !== 'number') {
                return;
            }
            return Math.max(width, 300);
        }
        //#endregion
        constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, configurationService, menuService) {
            super("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, { hasTitle: true, borderWidth: () => (this.getColor(theme_1.SIDE_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder)) ? 1 : 0 }, SidebarPart_1.activeViewletSettingsKey, contextkeys_1.ActiveViewletContext.bindTo(contextKeyService), contextkeys_1.SidebarFocusContext.bindTo(contextKeyService), 'sideBar', 'viewlet', theme_1.SIDE_BAR_TITLE_FOREGROUND, notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService);
            this.configurationService = configurationService;
            //#region IView
            this.minimumWidth = 170;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = 0;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.priority = 1 /* LayoutPriority.Low */;
            this.acitivityBarPart = this._register(instantiationService.createInstance(activitybarPart_1.ActivitybarPart, this));
            this.rememberActivityBarVisiblePosition();
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */)) {
                    this.onDidChangeActivityBarLocation();
                }
            }));
            this.registerActions();
        }
        onDidChangeActivityBarLocation() {
            this.updateTitleArea();
            const id = this.getActiveComposite()?.getId();
            if (id) {
                this.onTitleAreaUpdate(id);
            }
            this.updateActivityBarVisiblity();
            this.rememberActivityBarVisiblePosition();
        }
        updateStyles() {
            super.updateStyles();
            // Part container
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            container.style.backgroundColor = this.getColor(theme_1.SIDE_BAR_BACKGROUND) || '';
            container.style.color = this.getColor(theme_1.SIDE_BAR_FOREGROUND) || '';
            const borderColor = this.getColor(theme_1.SIDE_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
            const isPositionLeft = this.layoutService.getSideBarPosition() === 0 /* SideBarPosition.LEFT */;
            container.style.borderRightWidth = borderColor && isPositionLeft ? '1px' : '';
            container.style.borderRightStyle = borderColor && isPositionLeft ? 'solid' : '';
            container.style.borderRightColor = isPositionLeft ? borderColor || '' : '';
            container.style.borderLeftWidth = borderColor && !isPositionLeft ? '1px' : '';
            container.style.borderLeftStyle = borderColor && !isPositionLeft ? 'solid' : '';
            container.style.borderLeftColor = !isPositionLeft ? borderColor || '' : '';
            container.style.outlineColor = this.getColor(theme_1.SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? '';
        }
        layout(width, height, top, left) {
            if (!this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                return;
            }
            super.layout(width, height, top, left);
        }
        getTitleAreaDropDownAnchorAlignment() {
            return this.layoutService.getSideBarPosition() === 0 /* SideBarPosition.LEFT */ ? 0 /* AnchorAlignment.LEFT */ : 1 /* AnchorAlignment.RIGHT */;
        }
        createCompisteBar() {
            return this.instantiationService.createInstance(activitybarPart_1.ActivityBarCompositeBar, this.getCompositeBarOptions(), this.partId, this, false);
        }
        getCompositeBarOptions() {
            return {
                partContainerClass: 'sidebar',
                pinnedViewContainersKey: activitybarPart_1.ActivitybarPart.pinnedViewContainersKey,
                placeholderViewContainersKey: activitybarPart_1.ActivitybarPart.placeholderViewContainersKey,
                viewContainersWorkspaceStateKey: activitybarPart_1.ActivitybarPart.viewContainersWorkspaceStateKey,
                icon: true,
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                recomputeSizes: true,
                activityHoverOptions: {
                    position: () => 2 /* HoverPosition.BELOW */,
                },
                fillExtraContextMenuActions: actions => {
                    const viewsSubmenuAction = this.getViewsSubmenuAction();
                    if (viewsSubmenuAction) {
                        actions.push(new actions_2.Separator());
                        actions.push(viewsSubmenuAction);
                    }
                },
                compositeSize: 0,
                iconSize: 16,
                overflowActionSize: 44,
                colors: theme => ({
                    activeBackgroundColor: theme.getColor(theme_1.SIDE_BAR_BACKGROUND),
                    inactiveBackgroundColor: theme.getColor(theme_1.SIDE_BAR_BACKGROUND),
                    activeBorderBottomColor: theme.getColor(theme_1.ACTIVITY_BAR_TOP_ACTIVE_BORDER),
                    activeForegroundColor: theme.getColor(theme_1.ACTIVITY_BAR_TOP_FOREGROUND),
                    inactiveForegroundColor: theme.getColor(theme_1.ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND),
                    badgeBackground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_BACKGROUND),
                    badgeForeground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_FOREGROUND),
                    dragAndDropBorder: theme.getColor(theme_1.ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER)
                }),
                compact: true
            };
        }
        shouldShowCompositeBar() {
            return this.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) === "top" /* ActivityBarPosition.TOP */;
        }
        shouldShowActivityBar() {
            if (this.shouldShowCompositeBar()) {
                return false;
            }
            return this.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) !== "hidden" /* ActivityBarPosition.HIDDEN */;
        }
        rememberActivityBarVisiblePosition() {
            const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */);
            if (activityBarPosition !== "hidden" /* ActivityBarPosition.HIDDEN */) {
                this.storageService.store("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */, activityBarPosition, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
        getRememberedActivityBarVisiblePosition() {
            const activityBarPosition = this.storageService.get("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */, 0 /* StorageScope.PROFILE */);
            switch (activityBarPosition) {
                case "side" /* ActivityBarPosition.SIDE */: return "side" /* ActivityBarPosition.SIDE */;
                default: return "top" /* ActivityBarPosition.TOP */;
            }
        }
        updateActivityBarVisiblity() {
            if (this.shouldShowActivityBar()) {
                this.acitivityBarPart.show();
            }
            else {
                this.acitivityBarPart.hide();
            }
        }
        getPinnedPaneCompositeIds() {
            return this.shouldShowCompositeBar() ? super.getPinnedPaneCompositeIds() : this.acitivityBarPart.getPinnedPaneCompositeIds();
        }
        getVisiblePaneCompositeIds() {
            return this.shouldShowCompositeBar() ? super.getVisiblePaneCompositeIds() : this.acitivityBarPart.getVisiblePaneCompositeIds();
        }
        async focusActivityBar() {
            if (this.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) === "hidden" /* ActivityBarPosition.HIDDEN */) {
                await this.configurationService.updateValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */, this.getRememberedActivityBarVisiblePosition());
                this.onDidChangeActivityBarLocation();
            }
            if (this.shouldShowCompositeBar()) {
                this.focusComositeBar();
            }
            else {
                if (!this.layoutService.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */)) {
                    this.layoutService.setPartHidden(false, "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
                }
                this.acitivityBarPart.show(true);
            }
        }
        registerActions() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: layoutActions_1.ToggleActivityBarVisibilityActionId,
                        title: {
                            value: (0, nls_1.localize)('toggleActivityBar', "Toggle Activity Bar Visibility"),
                            original: 'Toggle Activity Bar Visibility'
                        },
                    });
                }
                run() {
                    const value = that.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) === "hidden" /* ActivityBarPosition.HIDDEN */ ? that.getRememberedActivityBarVisiblePosition() : "hidden" /* ActivityBarPosition.HIDDEN */;
                    return that.configurationService.updateValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */, value);
                }
            }));
        }
        toJSON() {
            return {
                type: "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */
            };
        }
    };
    exports.SidebarPart = SidebarPart;
    exports.SidebarPart = SidebarPart = SidebarPart_1 = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, storage_1.IStorageService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, layoutService_1.IWorkbenchLayoutService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, themeService_1.IThemeService),
        __param(7, views_1.IViewDescriptorService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, extensions_1.IExtensionService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, actions_1.IMenuService)
    ], SidebarPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhclBhcnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3NpZGViYXIvc2lkZWJhclBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQStCekYsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLDZDQUF5Qjs7aUJBRXpDLDZCQUF3QixHQUFHLG1DQUFtQyxBQUF0QyxDQUF1QztRQVcvRSxJQUFJLGNBQWM7WUFDakIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFFOUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNkLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3hDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQy9CLE9BQU87WUFDUixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBSUQsWUFBWTtRQUVaLFlBQ3VCLG1CQUF5QyxFQUM5QyxjQUErQixFQUMzQixrQkFBdUMsRUFDbkMsYUFBc0MsRUFDM0MsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUNuRCxZQUEyQixFQUNsQixxQkFBNkMsRUFDakQsaUJBQXFDLEVBQ3RDLGdCQUFtQyxFQUMvQixvQkFBNEQsRUFDckUsV0FBeUI7WUFFdkMsS0FBSyxxREFFSixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBZSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyw4QkFBYyxDQUFDLENBQUMsQ0FBQyxD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