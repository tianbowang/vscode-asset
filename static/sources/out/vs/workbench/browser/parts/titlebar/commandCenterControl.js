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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, dom_1, actionViewItems_1, iconLabelHover_1, iconLabels_1, actions_1, codicons_1, event_1, lifecycle_1, nls_1, menuEntryActionViewItem_1, toolbar_1, actions_2, instantiation_1, keybinding_1, quickInput_1, editorGroupsService_1) {
    "use strict";
    var CommandCenterCenterViewItem_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommandCenterControl = void 0;
    let CommandCenterControl = class CommandCenterControl {
        constructor(windowTitle, hoverDelegate, instantiationService, quickInputService) {
            this._disposables = new lifecycle_1.DisposableStore();
            this._onDidChangeVisibility = new event_1.Emitter();
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this.element = document.createElement('div');
            this.element.classList.add('command-center');
            const titleToolbar = instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this.element, actions_2.MenuId.CommandCenter, {
                contextMenu: actions_2.MenuId.TitleBarContext,
                hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
                toolbarOptions: {
                    primaryGroup: () => true,
                },
                telemetrySource: 'commandCenter',
                actionViewItemProvider: (action) => {
                    if (action instanceof actions_2.SubmenuItemAction && action.item.submenu === actions_2.MenuId.CommandCenterCenter) {
                        return instantiationService.createInstance(CommandCenterCenterViewItem, action, windowTitle, hoverDelegate, {});
                    }
                    else {
                        return (0, menuEntryActionViewItem_1.createActionViewItem)(instantiationService, action, { hoverDelegate });
                    }
                }
            });
            this._disposables.add(event_1.Event.filter(quickInputService.onShow, () => (0, dom_1.isActiveDocument)(this.element), this._disposables)(this._setVisibility.bind(this, false)));
            this._disposables.add(event_1.Event.filter(quickInputService.onHide, () => (0, dom_1.isActiveDocument)(this.element), this._disposables)(this._setVisibility.bind(this, true)));
            this._disposables.add(titleToolbar);
        }
        _setVisibility(show) {
            this.element.classList.toggle('hide', !show);
            this._onDidChangeVisibility.fire();
        }
        dispose() {
            this._disposables.dispose();
        }
    };
    exports.CommandCenterControl = CommandCenterControl;
    exports.CommandCenterControl = CommandCenterControl = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, quickInput_1.IQuickInputService)
    ], CommandCenterControl);
    let CommandCenterCenterViewItem = class CommandCenterCenterViewItem extends actionViewItems_1.BaseActionViewItem {
        static { CommandCenterCenterViewItem_1 = this; }
        static { this._quickOpenCommandId = 'workbench.action.quickOpenWithModes'; }
        constructor(_submenu, _windowTitle, _hoverDelegate, options, _keybindingService, _instaService, _editorGroupService) {
            super(undefined, _submenu.actions.find(action => action.id === 'workbench.action.quickOpenWithModes') ?? _submenu.actions[0], options);
            this._submenu = _submenu;
            this._windowTitle = _windowTitle;
            this._hoverDelegate = _hoverDelegate;
            this._keybindingService = _keybindingService;
            this._instaService = _instaService;
            this._editorGroupService = _editorGroupService;
        }
        render(container) {
            super.render(container);
            container.classList.add('command-center-center');
            container.classList.toggle('multiple', (this._submenu.actions.length > 1));
            const hover = this._store.add((0, iconLabelHover_1.setupCustomHover)(this._hoverDelegate, container, this.getTooltip()));
            // update label & tooltip when window title changes
            this._store.add(this._windowTitle.onDidChange(() => {
                hover.update(this.getTooltip());
            }));
            const groups = [];
            for (const action of this._submenu.actions) {
                if (action instanceof actions_1.SubmenuAction) {
                    groups.push(action.actions);
                }
                else {
                    groups.push([action]);
                }
            }
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                // nested toolbar
                const toolbar = this._instaService.createInstance(toolbar_1.WorkbenchToolBar, container, {
                    hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
                    telemetrySource: 'commandCenterCenter',
                    actionViewItemProvider: (action, options) => {
                        options = {
                            ...options,
                            hoverDelegate: this._hoverDelegate,
                        };
                        if (action.id !== CommandCenterCenterViewItem_1._quickOpenCommandId) {
                            return (0, menuEntryActionViewItem_1.createActionViewItem)(this._instaService, action, options);
                        }
                        const that = this;
                        return this._instaService.createInstance(class CommandCenterQuickPickItem extends actionViewItems_1.BaseActionViewItem {
                            constructor() {
                                super(undefined, action, options);
                            }
                            render(container) {
                                super.render(container);
                                container.classList.toggle('command-center-quick-pick');
                                const action = this.action;
                                // icon (search)
                                const searchIcon = document.createElement('span');
                                searchIcon.ariaHidden = 'true';
                                searchIcon.className = action.class ?? '';
                                searchIcon.classList.add('search-icon');
                                // label: just workspace name and optional decorations
                                const label = this._getLabel();
                                const labelElement = document.createElement('span');
                                labelElement.classList.add('search-label');
                                labelElement.innerText = label;
                                (0, dom_1.reset)(container, searchIcon, labelElement);
                                const hover = this._store.add((0, iconLabelHover_1.setupCustomHover)(that._hoverDelegate, container, this.getTooltip()));
                                // update label & tooltip when window title changes
                                this._store.add(that._windowTitle.onDidChange(() => {
                                    hover.update(this.getTooltip());
                                    labelElement.innerText = this._getLabel();
                                }));
                                // update label & tooltip when tabs visibility changes
                                this._store.add(that._editorGroupService.onDidChangeEditorPartOptions(({ newPartOptions, oldPartOptions }) => {
                                    if (newPartOptions.showTabs !== oldPartOptions.showTabs) {
                                        hover.update(this.getTooltip());
                                        labelElement.innerText = this._getLabel();
                                    }
                                }));
                            }
                            getTooltip() {
                                return that.getTooltip();
                            }
                            _getLabel() {
                                const { prefix, suffix } = that._windowTitle.getTitleDecorations();
                                let label = that._windowTitle.workspaceName;
                                if (that._windowTitle.isCustomTitleFormat()) {
                                    label = that._windowTitle.getWindowTitle();
                                }
                                else if (that._editorGroupService.partOptions.showTabs === 'none') {
                                    label = that._windowTitle.fileName ?? label;
                                }
                                if (!label) {
                                    label = (0, nls_1.localize)('label.dfl', "Search");
                                }
                                if (prefix) {
                                    label = (0, nls_1.localize)('label1', "{0} {1}", prefix, label);
                                }
                                if (suffix) {
                                    label = (0, nls_1.localize)('label2', "{0} {1}", label, suffix);
                                }
                                return label.replaceAll(/\r\n|\r|\n/g, '\u23CE');
                            }
                        });
                    }
                });
                toolbar.setActions(group);
                this._store.add(toolbar);
                // spacer
                if (i < groups.length - 1) {
                    const icon = (0, iconLabels_1.renderIcon)(codicons_1.Codicon.circleSmallFilled);
                    icon.style.padding = '0 12px';
                    icon.style.height = '100%';
                    icon.style.opacity = '0.5';
                    container.appendChild(icon);
                }
            }
        }
        getTooltip() {
            // tooltip: full windowTitle
            const kb = this._keybindingService.lookupKeybinding(this.action.id)?.getLabel();
            const title = kb
                ? (0, nls_1.localize)('title', "Search {0} ({1}) \u2014 {2}", this._windowTitle.workspaceName, kb, this._windowTitle.value)
                : (0, nls_1.localize)('title2', "Search {0} \u2014 {1}", this._windowTitle.workspaceName, this._windowTitle.value);
            return title;
        }
    };
    CommandCenterCenterViewItem = CommandCenterCenterViewItem_1 = __decorate([
        __param(4, keybinding_1.IKeybindingService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, editorGroupsService_1.IEditorGroupsService)
    ], CommandCenterCenterViewItem);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandCenter, {
        submenu: actions_2.MenuId.CommandCenterCenter,
        title: (0, nls_1.localize)('title3', "Command Center"),
        icon: codicons_1.Codicon.shield,
        order: 101,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZENlbnRlckNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3RpdGxlYmFyL2NvbW1hbmRDZW50ZXJDb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFxQnpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQW9CO1FBU2hDLFlBQ0MsV0FBd0IsRUFDeEIsYUFBNkIsRUFDTixvQkFBMkMsRUFDOUMsaUJBQXFDO1lBWHpDLGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFckMsMkJBQXNCLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUNyRCwwQkFBcUIsR0FBZ0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQUV2RSxZQUFPLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFRN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFN0MsTUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDhCQUFvQixFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhLEVBQUU7Z0JBQ2xILFdBQVcsRUFBRSxnQkFBTSxDQUFDLGVBQWU7Z0JBQ25DLGtCQUFrQixvQ0FBMkI7Z0JBQzdDLGNBQWMsRUFBRTtvQkFDZixZQUFZLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtpQkFDeEI7Z0JBQ0QsZUFBZSxFQUFFLGVBQWU7Z0JBQ2hDLHNCQUFzQixFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUU7b0JBQ2xDLElBQUksTUFBTSxZQUFZLDJCQUFpQixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLGdCQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzt3QkFDL0YsT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMkJBQTJCLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ2pILENBQUM7eUJBQU0sQ0FBQzt3QkFDUCxPQUFPLElBQUEsOENBQW9CLEVBQUMsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztvQkFDOUUsQ0FBQztnQkFDRixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBQSxzQkFBZ0IsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUosSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBQSxzQkFBZ0IsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0osSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVPLGNBQWMsQ0FBQyxJQUFhO1lBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdCLENBQUM7S0FDRCxDQUFBO0lBOUNZLG9EQUFvQjttQ0FBcEIsb0JBQW9CO1FBWTlCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSwrQkFBa0IsQ0FBQTtPQWJSLG9CQUFvQixDQThDaEM7SUFHRCxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLG9DQUFrQjs7aUJBRW5DLHdCQUFtQixHQUFHLHFDQUFxQyxBQUF4QyxDQUF5QztRQUVwRixZQUNrQixRQUEyQixFQUMzQixZQUF5QixFQUN6QixjQUE4QixFQUMvQyxPQUFtQyxFQUNQLGtCQUFzQyxFQUNuQyxhQUFvQyxFQUNyQyxtQkFBeUM7WUFFdkUsS0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUsscUNBQXFDLENBQUMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBUnRILGFBQVEsR0FBUixRQUFRLENBQW1CO1lBQzNCLGlCQUFZLEdBQVosWUFBWSxDQUFhO1lBQ3pCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUVuQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ25DLGtCQUFhLEdBQWIsYUFBYSxDQUF1QjtZQUNyQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1FBR3hFLENBQUM7UUFFUSxNQUFNLENBQUMsU0FBc0I7WUFDckMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ2pELFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTNFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUEsaUNBQWdCLEVBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVuRyxtREFBbUQ7WUFDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUNsRCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLE1BQU0sR0FBMkIsRUFBRSxDQUFDO1lBQzFDLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDNUMsSUFBSSxNQUFNLFlBQVksdUJBQWEsRUFBRSxDQUFDO29CQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDN0IsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixDQUFDO1lBQ0YsQ0FBQztZQUdELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFeEIsaUJBQWlCO2dCQUNqQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQywwQkFBZ0IsRUFBRSxTQUFTLEVBQUU7b0JBQzlFLGtCQUFrQixvQ0FBMkI7b0JBQzdDLGVBQWUsRUFBRSxxQkFBcUI7b0JBQ3RDLHNCQUFzQixFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFO3dCQUMzQyxPQUFPLEdBQUc7NEJBQ1QsR0FBRyxPQUFPOzRCQUNWLGFBQWEsRUFBRSxJQUFJLENBQUMsY0FBYzt5QkFDbEMsQ0FBQzt3QkFFRixJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssNkJBQTJCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs0QkFDbkUsT0FBTyxJQUFBLDhDQUFvQixFQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUNsRSxDQUFDO3dCQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQzt3QkFFbEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxNQUFNLDBCQUEyQixTQUFRLG9DQUFrQjs0QkFFbkc7Z0NBQ0MsS0FBSyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7NEJBQ25DLENBQUM7NEJBRVEsTUFBTSxDQUFDLFNBQXNCO2dDQUNyQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dDQUN4QixTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2dDQUV4RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO2dDQUUzQixnQkFBZ0I7Z0NBQ2hCLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQ2xELFVBQVUsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO2dDQUMvQixVQUFVLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO2dDQUMxQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQ0FFeEMsc0RBQXNEO2dDQUN0RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0NBQy9CLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQ3BELFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dDQUMzQyxZQUFZLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztnQ0FDL0IsSUFBQSxXQUFLLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztnQ0FFM0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBQSxpQ0FBZ0IsRUFBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dDQUVuRyxtREFBbUQ7Z0NBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtvQ0FDbEQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztvQ0FDaEMsWUFBWSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0NBQzNDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBRUosc0RBQXNEO2dDQUN0RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFO29DQUM1RyxJQUFJLGNBQWMsQ0FBQyxRQUFRLEtBQUssY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO3dDQUN6RCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO3dDQUNoQyxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQ0FDM0MsQ0FBQztnQ0FDRixDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNMLENBQUM7NEJBRWtCLFVBQVU7Z0NBQzVCLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDOzRCQUMxQixDQUFDOzRCQUVPLFNBQVM7Z0NBQ2hCLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dDQUNuRSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQztnQ0FDNUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQztvQ0FDN0MsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7Z0NBQzVDLENBQUM7cUNBQU0sSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLFFBQVEsS0FBSyxNQUFNLEVBQUUsQ0FBQztvQ0FDckUsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQztnQ0FDN0MsQ0FBQztnQ0FDRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7b0NBQ1osS0FBSyxHQUFHLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQ0FDekMsQ0FBQztnQ0FDRCxJQUFJLE1BQU0sRUFBRSxDQUFDO29DQUNaLEtBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztnQ0FDdEQsQ0FBQztnQ0FDRCxJQUFJLE1BQU0sRUFBRSxDQUFDO29DQUNaLEtBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQ0FDdEQsQ0FBQztnQ0FFRCxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUNsRCxDQUFDO3lCQUNELENBQUMsQ0FBQztvQkFDSixDQUFDO2lCQUNELENBQUMsQ0FBQztnQkFDSCxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFHekIsU0FBUztnQkFDVCxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUMzQixNQUFNLElBQUksR0FBRyxJQUFBLHVCQUFVLEVBQUMsa0JBQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO29CQUNuRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7b0JBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztvQkFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO29CQUMzQixTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3QixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFa0IsVUFBVTtZQUU1Qiw0QkFBNEI7WUFDNUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDaEYsTUFBTSxLQUFLLEdBQUcsRUFBRTtnQkFDZixDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLDZCQUE2QixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztnQkFDaEgsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLFFBQVEsRUFBRSx1QkFBdUIsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXpHLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQzs7SUF0SkksMkJBQTJCO1FBUzlCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLDBDQUFvQixDQUFBO09BWGpCLDJCQUEyQixDQXVKaEM7SUFFRCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGFBQWEsRUFBRTtRQUNqRCxPQUFPLEVBQUUsZ0JBQU0sQ0FBQyxtQkFBbUI7UUFDbkMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQztRQUMzQyxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxNQUFNO1FBQ3BCLEtBQUssRUFBRSxHQUFHO0tBQ1YsQ0FBQyxDQUFDIn0=