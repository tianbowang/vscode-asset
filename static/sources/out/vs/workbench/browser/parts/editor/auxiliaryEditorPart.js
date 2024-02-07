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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/platform/window/common/window", "vs/workbench/browser/parts/editor/editorPart", "vs/workbench/browser/parts/titlebar/windowTitle", "vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/host/browser/host", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/services/title/browser/titleService"], function (require, exports, browser_1, dom_1, event_1, lifecycle_1, platform_1, configuration_1, contextkey_1, instantiation_1, serviceCollection_1, storage_1, themeService_1, window_1, editorPart_1, windowTitle_1, auxiliaryWindowService_1, editorService_1, host_1, layoutService_1, lifecycle_2, statusbar_1, titleService_1) {
    "use strict";
    var AuxiliaryEditorPart_1, AuxiliaryEditorPartImpl_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuxiliaryEditorPart = void 0;
    let AuxiliaryEditorPart = class AuxiliaryEditorPart {
        static { AuxiliaryEditorPart_1 = this; }
        static { this.STATUS_BAR_VISIBILITY = 'workbench.statusBar.visible'; }
        constructor(editorPartsView, instantiationService, auxiliaryWindowService, lifecycleService, configurationService, statusbarService, titleService, editorService) {
            this.editorPartsView = editorPartsView;
            this.instantiationService = instantiationService;
            this.auxiliaryWindowService = auxiliaryWindowService;
            this.lifecycleService = lifecycleService;
            this.configurationService = configurationService;
            this.statusbarService = statusbarService;
            this.titleService = titleService;
            this.editorService = editorService;
        }
        async create(label, options) {
            function computeEditorPartHeightOffset() {
                let editorPartHeightOffset = 0;
                if (statusBarVisible) {
                    editorPartHeightOffset += statusbarPart.height;
                }
                if (titlebarPart && titlebarPartVisible) {
                    editorPartHeightOffset += titlebarPart.height;
                }
                return editorPartHeightOffset;
            }
            function updateStatusbarVisibility(fromEvent) {
                if (statusBarVisible) {
                    (0, dom_1.show)(statusbarPart.container);
                }
                else {
                    (0, dom_1.hide)(statusbarPart.container);
                }
                updateEditorPartHeight(fromEvent);
            }
            function updateEditorPartHeight(fromEvent) {
                editorPartContainer.style.height = `calc(100% - ${computeEditorPartHeightOffset()}px)`;
                if (fromEvent) {
                    auxiliaryWindow.layout();
                }
            }
            const disposables = new lifecycle_1.DisposableStore();
            // Auxiliary Window
            const auxiliaryWindow = disposables.add(await this.auxiliaryWindowService.open(options));
            // Editor Part
            const editorPartContainer = document.createElement('div');
            editorPartContainer.classList.add('part', 'editor');
            editorPartContainer.setAttribute('role', 'main');
            editorPartContainer.style.position = 'relative';
            auxiliaryWindow.container.appendChild(editorPartContainer);
            const editorPart = disposables.add(this.instantiationService.createInstance(AuxiliaryEditorPartImpl, auxiliaryWindow.window.vscodeWindowId, this.editorPartsView, options?.state, label));
            disposables.add(this.editorPartsView.registerPart(editorPart));
            editorPart.create(editorPartContainer);
            // Titlebar
            let titlebarPart = undefined;
            let titlebarPartVisible = false;
            const useCustomTitle = platform_1.isNative && !(0, window_1.hasNativeTitlebar)(this.configurationService); // custom title in aux windows only enabled in native
            if (useCustomTitle) {
                titlebarPart = disposables.add(this.titleService.createAuxiliaryTitlebarPart(auxiliaryWindow.container, editorPart));
                titlebarPartVisible = true;
                disposables.add(titlebarPart.onDidChange(() => updateEditorPartHeight(true)));
                disposables.add((0, browser_1.onDidChangeZoomLevel)(targetWindowId => {
                    if (auxiliaryWindow.window.vscodeWindowId === targetWindowId && titlebarPartVisible) {
                        // This is a workaround for https://github.com/microsoft/vscode/issues/202377
                        // The title bar part prevents zooming in certain cases and when doing so,
                        // adjusts its size accordingly. This is however not reported from the
                        // `onDidchange` event that we listen to above, so we manually update the
                        // editor part height here.
                        updateEditorPartHeight(true);
                    }
                }));
                disposables.add((0, browser_1.onDidChangeFullscreen)(windowId => {
                    if (windowId !== auxiliaryWindow.window.vscodeWindowId) {
                        return; // ignore all but our window
                    }
                    // Make sure to hide the custom title when we enter
                    // fullscren mode and show it when we lave it.
                    const fullscreen = (0, browser_1.isFullscreen)(auxiliaryWindow.window);
                    const oldTitlebarPartVisible = titlebarPartVisible;
                    titlebarPartVisible = !fullscreen;
                    if (titlebarPart && oldTitlebarPartVisible !== titlebarPartVisible) {
                        titlebarPart.container.style.display = titlebarPartVisible ? '' : 'none';
                        updateEditorPartHeight(true);
                    }
                }));
            }
            else {
                disposables.add(this.instantiationService.createInstance(windowTitle_1.WindowTitle, auxiliaryWindow.window, editorPart));
            }
            // Statusbar
            const statusbarPart = disposables.add(this.statusbarService.createAuxiliaryStatusbarPart(auxiliaryWindow.container));
            let statusBarVisible = this.configurationService.getValue(AuxiliaryEditorPart_1.STATUS_BAR_VISIBILITY) !== false;
            disposables.add(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(AuxiliaryEditorPart_1.STATUS_BAR_VISIBILITY)) {
                    statusBarVisible = this.configurationService.getValue(AuxiliaryEditorPart_1.STATUS_BAR_VISIBILITY) !== false;
                    updateStatusbarVisibility(true);
                }
            }));
            updateStatusbarVisibility(false);
            // Lifecycle
            const editorCloseListener = disposables.add(event_1.Event.once(editorPart.onWillClose)(() => auxiliaryWindow.window.close()));
            disposables.add(event_1.Event.once(auxiliaryWindow.onUnload)(() => {
                if (disposables.isDisposed) {
                    return; // the close happened as part of an earlier dispose call
                }
                editorCloseListener.dispose();
                editorPart.close();
                disposables.dispose();
            }));
            disposables.add(event_1.Event.once(this.lifecycleService.onDidShutdown)(() => disposables.dispose()));
            // Layout
            disposables.add(auxiliaryWindow.onDidLayout(dimension => {
                const titlebarPartHeight = titlebarPart?.height ?? 0;
                titlebarPart?.layout(dimension.width, titlebarPartHeight, 0, 0);
                const editorPartHeight = dimension.height - computeEditorPartHeightOffset();
                editorPart.layout(dimension.width, editorPartHeight, titlebarPartHeight, 0);
                statusbarPart.layout(dimension.width, statusbarPart.height, dimension.height - statusbarPart.height, 0);
            }));
            auxiliaryWindow.layout();
            // Have a InstantiationService that is scoped to the auxiliary window
            const instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([statusbar_1.IStatusbarService, this.statusbarService.createScoped(statusbarPart, disposables)], [editorService_1.IEditorService, this.editorService.createScoped(editorPart, disposables)]));
            return {
                part: editorPart,
                instantiationService,
                disposables
            };
        }
    };
    exports.AuxiliaryEditorPart = AuxiliaryEditorPart;
    exports.AuxiliaryEditorPart = AuxiliaryEditorPart = AuxiliaryEditorPart_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, auxiliaryWindowService_1.IAuxiliaryWindowService),
        __param(3, lifecycle_2.ILifecycleService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, statusbar_1.IStatusbarService),
        __param(6, titleService_1.ITitleService),
        __param(7, editorService_1.IEditorService)
    ], AuxiliaryEditorPart);
    let AuxiliaryEditorPartImpl = class AuxiliaryEditorPartImpl extends editorPart_1.EditorPart {
        static { AuxiliaryEditorPartImpl_1 = this; }
        static { this.COUNTER = 1; }
        constructor(windowId, editorPartsView, state, groupsLabel, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService) {
            const id = AuxiliaryEditorPartImpl_1.COUNTER++;
            super(editorPartsView, `workbench.parts.auxiliaryEditor.${id}`, groupsLabel, windowId, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService);
            this.state = state;
            this._onWillClose = this._register(new event_1.Emitter());
            this.onWillClose = this._onWillClose.event;
        }
        removeGroup(group, preserveFocus) {
            // Close aux window when last group removed
            const groupView = this.assertGroupView(group);
            if (this.count === 1 && this.activeGroup === groupView) {
                this.doRemoveLastGroup(preserveFocus);
            }
            // Otherwise delegate to parent implementation
            else {
                super.removeGroup(group, preserveFocus);
            }
        }
        doRemoveLastGroup(preserveFocus) {
            const restoreFocus = !preserveFocus && this.shouldRestoreFocus(this.container);
            // Activate next group
            const mostRecentlyActiveGroups = this.editorPartsView.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            const nextActiveGroup = mostRecentlyActiveGroups[1]; // [0] will be the current group we are about to dispose
            if (nextActiveGroup) {
                nextActiveGroup.groupsView.activateGroup(nextActiveGroup);
                if (restoreFocus) {
                    nextActiveGroup.focus();
                }
            }
            this.doClose(false /* do not merge any groups to main part */);
        }
        loadState() {
            return this.state;
        }
        saveState() {
            return; // disabled, auxiliary editor part state is tracked outside
        }
        close() {
            this.doClose(true /* merge all groups to main part */);
        }
        doClose(mergeGroupsToMainPart) {
            if (mergeGroupsToMainPart) {
                this.mergeGroupsToMainPart();
            }
            this._onWillClose.fire();
        }
        mergeGroupsToMainPart() {
            if (!this.groups.some(group => group.count > 0)) {
                return; // skip if we have no editors opened
            }
            // Find the most recent group that is not locked
            let targetGroup = undefined;
            for (const group of this.editorPartsView.mainPart.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (!group.isLocked) {
                    targetGroup = group;
                    break;
                }
            }
            if (!targetGroup) {
                targetGroup = this.editorPartsView.mainPart.addGroup(this.editorPartsView.mainPart.activeGroup, this.partOptions.openSideBySideDirection === 'right' ? 3 /* GroupDirection.RIGHT */ : 1 /* GroupDirection.DOWN */);
            }
            this.mergeAllGroups(targetGroup);
            targetGroup.focus();
        }
    };
    AuxiliaryEditorPartImpl = AuxiliaryEditorPartImpl_1 = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, themeService_1.IThemeService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, storage_1.IStorageService),
        __param(8, layoutService_1.IWorkbenchLayoutService),
        __param(9, host_1.IHostService),
        __param(10, contextkey_1.IContextKeyService)
    ], AuxiliaryEditorPartImpl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV4aWxpYXJ5RWRpdG9yUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL2F1eGlsaWFyeUVkaXRvclBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXFDekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBbUI7O2lCQUVoQiwwQkFBcUIsR0FBRyw2QkFBNkIsQUFBaEMsQ0FBaUM7UUFFckUsWUFDa0IsZUFBaUMsRUFDVixvQkFBMkMsRUFDekMsc0JBQStDLEVBQ3JELGdCQUFtQyxFQUMvQixvQkFBMkMsRUFDL0MsZ0JBQW1DLEVBQ3ZDLFlBQTJCLEVBQzFCLGFBQTZCO1lBUDdDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNWLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDekMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUNyRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN2QyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUMxQixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFFL0QsQ0FBQztRQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBYSxFQUFFLE9BQXlDO1lBRXBFLFNBQVMsNkJBQTZCO2dCQUNyQyxJQUFJLHNCQUFzQixHQUFHLENBQUMsQ0FBQztnQkFFL0IsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO29CQUN0QixzQkFBc0IsSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDO2dCQUNoRCxDQUFDO2dCQUVELElBQUksWUFBWSxJQUFJLG1CQUFtQixFQUFFLENBQUM7b0JBQ3pDLHNCQUFzQixJQUFJLFlBQVksQ0FBQyxN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