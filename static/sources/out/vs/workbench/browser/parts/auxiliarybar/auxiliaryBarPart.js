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
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/common/contextkeys", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/actions", "vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions", "vs/base/common/types", "vs/workbench/browser/actions/layoutActions", "vs/platform/commands/common/commands", "vs/workbench/browser/parts/paneCompositePart", "vs/platform/actions/common/actions", "vs/css!./media/auxiliaryBarPart"], function (require, exports, nls_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, storage_1, colorRegistry_1, themeService_1, contextkeys_1, theme_1, views_1, extensions_1, layoutService_1, actions_1, auxiliaryBarActions_1, types_1, layoutActions_1, commands_1, paneCompositePart_1, actions_2) {
    "use strict";
    var AuxiliaryBarPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuxiliaryBarPart = void 0;
    let AuxiliaryBarPart = class AuxiliaryBarPart extends paneCompositePart_1.AbstractPaneCompositePart {
        static { AuxiliaryBarPart_1 = this; }
        static { this.activePanelSettingsKey = 'workbench.auxiliarybar.activepanelid'; }
        static { this.pinnedPanelsKey = 'workbench.auxiliarybar.pinnedPanels'; }
        static { this.placeholdeViewContainersKey = 'workbench.auxiliarybar.placeholderPanels'; }
        static { this.viewContainersWorkspaceStateKey = 'workbench.auxiliarybar.viewContainersWorkspaceState'; }
        get preferredHeight() {
            // Don't worry about titlebar or statusbar visibility
            // The difference is minimal and keeps this function clean
            return this.layoutService.mainContainerDimension.height * 0.4;
        }
        get preferredWidth() {
            const activeComposite = this.getActivePaneComposite();
            if (!activeComposite) {
                return;
            }
            const width = activeComposite.getOptimalWidth();
            if (typeof width !== 'number') {
                return;
            }
            return Math.max(width, 300);
        }
        constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, commandService, menuService) {
            super("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, {
                hasTitle: true,
                borderWidth: () => (this.getColor(theme_1.SIDE_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder)) ? 1 : 0,
            }, AuxiliaryBarPart_1.activePanelSettingsKey, contextkeys_1.ActiveAuxiliaryContext.bindTo(contextKeyService), contextkeys_1.AuxiliaryBarFocusContext.bindTo(contextKeyService), 'auxiliarybar', 'auxiliarybar', undefined, notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService);
            this.commandService = commandService;
            // Use the side bar dimensions
            this.minimumWidth = 170;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = 0;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.priority = 1 /* LayoutPriority.Low */;
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            container.style.backgroundColor = this.getColor(theme_1.SIDE_BAR_BACKGROUND) || '';
            const borderColor = this.getColor(theme_1.SIDE_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
            const isPositionLeft = this.layoutService.getSideBarPosition() === 1 /* Position.RIGHT */;
            container.style.color = this.getColor(theme_1.SIDE_BAR_FOREGROUND) || '';
            container.style.borderLeftColor = borderColor ?? '';
            container.style.borderRightColor = borderColor ?? '';
            container.style.borderLeftStyle = borderColor && !isPositionLeft ? 'solid' : 'none';
            container.style.borderRightStyle = borderColor && isPositionLeft ? 'solid' : 'none';
            container.style.borderLeftWidth = borderColor && !isPositionLeft ? '1px' : '0px';
            container.style.borderRightWidth = borderColor && isPositionLeft ? '1px' : '0px';
        }
        getCompositeBarOptions() {
            return {
                partContainerClass: 'auxiliarybar',
                pinnedViewContainersKey: AuxiliaryBarPart_1.pinnedPanelsKey,
                placeholderViewContainersKey: AuxiliaryBarPart_1.placeholdeViewContainersKey,
                viewContainersWorkspaceStateKey: AuxiliaryBarPart_1.viewContainersWorkspaceStateKey,
                icon: true,
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                recomputeSizes: true,
                activityHoverOptions: {
                    position: () => 2 /* HoverPosition.BELOW */,
                },
                fillExtraContextMenuActions: actions => this.fillExtraContextMenuActions(actions),
                compositeSize: 0,
                iconSize: 16,
                overflowActionSize: 44,
                colors: theme => ({
                    activeBackgroundColor: theme.getColor(theme_1.SIDE_BAR_BACKGROUND),
                    inactiveBackgroundColor: theme.getColor(theme_1.SIDE_BAR_BACKGROUND),
                    activeBorderBottomColor: theme.getColor(theme_1.PANEL_ACTIVE_TITLE_BORDER),
                    activeForegroundColor: theme.getColor(theme_1.PANEL_ACTIVE_TITLE_FOREGROUND),
                    inactiveForegroundColor: theme.getColor(theme_1.PANEL_INACTIVE_TITLE_FOREGROUND),
                    badgeBackground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_BACKGROUND),
                    badgeForeground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_FOREGROUND),
                    dragAndDropBorder: theme.getColor(theme_1.PANEL_DRAG_AND_DROP_BORDER)
                }),
                compact: true
            };
        }
        fillExtraContextMenuActions(actions) {
            const currentPositionRight = this.layoutService.getSideBarPosition() === 0 /* Position.LEFT */;
            const viewsSubmenuAction = this.getViewsSubmenuAction();
            if (viewsSubmenuAction) {
                actions.push(new actions_1.Separator());
                actions.push(viewsSubmenuAction);
            }
            actions.push(...[
                new actions_1.Separator(),
                (0, actions_1.toAction)({ id: layoutActions_1.ToggleSidebarPositionAction.ID, label: currentPositionRight ? (0, nls_1.localize)('move second side bar left', "Move Secondary Side Bar Left") : (0, nls_1.localize)('move second side bar right', "Move Secondary Side Bar Right"), run: () => this.commandService.executeCommand(layoutActions_1.ToggleSidebarPositionAction.ID) }),
                (0, actions_1.toAction)({ id: auxiliaryBarActions_1.ToggleAuxiliaryBarAction.ID, label: (0, nls_1.localize)('hide second side bar', "Hide Secondary Side Bar"), run: () => this.commandService.executeCommand(auxiliaryBarActions_1.ToggleAuxiliaryBarAction.ID) })
            ]);
        }
        shouldShowCompositeBar() {
            return true;
        }
        toJSON() {
            return {
                type: "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */
            };
        }
    };
    exports.AuxiliaryBarPart = AuxiliaryBarPart;
    exports.AuxiliaryBarPart = AuxiliaryBarPart = AuxiliaryBarPart_1 = __decorate([
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
        __param(10, commands_1.ICommandService),
        __param(11, actions_2.IMenuService)
    ], AuxiliaryBarPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV4aWxpYXJ5QmFyUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvYXV4aWxpYXJ5YmFyL2F1eGlsaWFyeUJhclBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTZCekYsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSw2Q0FBeUI7O2lCQUU5QywyQkFBc0IsR0FBRyxzQ0FBc0MsQUFBekMsQ0FBMEM7aUJBQ2hFLG9CQUFlLEdBQUcscUNBQXFDLEFBQXhDLENBQXlDO2lCQUN4RCxnQ0FBMkIsR0FBRywwQ0FBMEMsQUFBN0MsQ0FBOEM7aUJBQ3pFLG9DQUErQixHQUFHLHFEQUFxRCxBQUF4RCxDQUF5RDtRQVF4RyxJQUFJLGVBQWU7WUFDbEIscURBQXFEO1lBQ3JELDBEQUEwRDtZQUMxRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUMvRCxDQUFDO1FBRUQsSUFBSSxjQUFjO1lBQ2pCLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBRXRELElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDdEIsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDaEQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDL0IsT0FBTztZQUNSLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFJRCxZQUN1QixtQkFBeUMsRUFDOUMsY0FBK0IsRUFDM0Isa0JBQXVDLEVBQ25DLGFBQXNDLEVBQzNDLGlCQUFxQyxF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