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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalMenus", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/platform", "vs/base/browser/canIUse", "vs/platform/notification/common/notification", "vs/workbench/contrib/terminal/browser/terminalContextMenu", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/layout/browser/layoutService"], function (require, exports, dom, dropdownWithPrimaryActionViewItem_1, actions_1, contextkey_1, contextView_1, instantiation_1, storage_1, telemetry_1, themeService_1, editorPane_1, terminal_1, terminalMenus_1, terminal_2, platform_1, canIUse_1, notification_1, terminalContextMenu_1, editorService_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalEditor = void 0;
    let TerminalEditor = class TerminalEditor extends editorPane_1.EditorPane {
        constructor(telemetryService, themeService, storageService, _terminalEditorService, _terminalProfileResolverService, _terminalService, contextKeyService, menuService, _instantiationService, _contextMenuService, _notificationService, _terminalProfileService, _workbenchLayoutService) {
            super(terminal_1.terminalEditorId, telemetryService, themeService, storageService);
            this._terminalEditorService = _terminalEditorService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._terminalService = _terminalService;
            this._instantiationService = _instantiationService;
            this._contextMenuService = _contextMenuService;
            this._notificationService = _notificationService;
            this._terminalProfileService = _terminalProfileService;
            this._workbenchLayoutService = _workbenchLayoutService;
            this._editorInput = undefined;
            this._cancelContextMenu = false;
            this._dropdownMenu = this._register(menuService.createMenu(actions_1.MenuId.TerminalNewDropdownContext, contextKeyService));
            this._instanceMenu = this._register(menuService.createMenu(actions_1.MenuId.TerminalInstanceContext, contextKeyService));
        }
        async setInput(newInput, options, context, token) {
            this._editorInput?.terminalInstance?.detachFromElement();
            this._editorInput = newInput;
            await super.setInput(newInput, options, context, token);
            this._editorInput.terminalInstance?.attachToElement(this._overflowGuardElement);
            if (this._lastDimension) {
                this.layout(this._lastDimension);
            }
            this._editorInput.terminalInstance?.setVisible(this.isVisible() && this._workbenchLayoutService.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */, dom.getWindow(this._editorInstanceElement)));
            if (this._editorInput.terminalInstance) {
                // since the editor does not monitor focus changes, for ex. between the terminal
                // panel and the editors, this is needed so that the active instance gets set
                // when focus changes between them.
                this._register(this._editorInput.terminalInstance.onDidFocus(() => this._setActiveInstance()));
                this._editorInput.setCopyLaunchConfig(this._editorInput.terminalInstance.shellLaunchConfig);
            }
        }
        clearInput() {
            super.clearInput();
            if (this._overflowGuardElement && this._editorInput?.terminalInstance?.domElement.parentElement === this._overflowGuardElement) {
                this._editorInput.terminalInstance?.detachFromElement();
            }
            this._editorInput = undefined;
        }
        _setActiveInstance() {
            if (!this._editorInput?.terminalInstance) {
                return;
            }
            this._terminalEditorService.setActiveInstance(this._editorInput.terminalInstance);
        }
        focus() {
            super.focus();
            this._editorInput?.terminalInstance?.focus();
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        createEditor(parent) {
            this._editorInstanceElement = parent;
            this._overflowGuardElement = dom.$('.terminal-overflow-guard.terminal-editor');
            this._editorInstanceElement.appendChild(this._overflowGuardElement);
            this._registerListeners();
        }
        _registerListeners() {
            if (!this._editorInstanceElement) {
                return;
            }
            this._register(dom.addDisposableListener(this._editorInstanceElement, 'mousedown', async (event) => {
                if (this._terminalEditorService.instances.length === 0) {
                    return;
                }
                if (event.which === 2 && platform_1.isLinux) {
                    // Drop selection and focus terminal on Linux to enable middle button paste when click
                    // occurs on the selection itself.
                    const terminal = this._terminalEditorService.activeInstance;
                    terminal?.focus();
                }
                else if (event.which === 3) {
                    const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
                    if (rightClickBehavior === 'nothing') {
                        if (!event.shiftKey) {
                            this._cancelContextMenu = true;
                        }
                        return;
                    }
                    else if (rightClickBehavior === 'copyPaste' || rightClickBehavior === 'paste') {
                        const terminal = this._terminalEditorService.activeInstance;
                        if (!terminal) {
                            return;
                        }
                        // copyPaste: Shift+right click should open context menu
                        if (rightClickBehavior === 'copyPaste' && event.shiftKey) {
                            (0, terminalContextMenu_1.openContextMenu)(dom.getWindow(this._editorInstanceElement), event, this._editorInput?.terminalInstance, this._instanceMenu, this._contextMenuService);
                            return;
                        }
                        if (rightClickBehavior === 'copyPaste' && terminal.hasSelection()) {
                            await terminal.copySelection();
                            terminal.clearSelection();
                        }
                        else {
                            if (canIUse_1.BrowserFeatures.clipboard.readText) {
                                terminal.paste();
                            }
                            else {
                                this._notificationService.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${platform_1.isMacintosh ? '⌘' : 'Ctrl'}+V instead.`);
                            }
                        }
                        // Clear selection after all click event bubbling is finished on Mac to prevent
                        // right-click selecting a word which is seemed cannot be disabled. There is a
                        // flicker when pasting but this appears to give the best experience if the
                        // setting is enabled.
                        if (platform_1.isMacintosh) {
                            setTimeout(() => {
                                terminal.clearSelection();
                            }, 0);
                        }
                        this._cancelContextMenu = true;
                    }
                }
            }));
            this._register(dom.addDisposableListener(this._editorInstanceElement, 'contextmenu', (event) => {
                const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
                if (rightClickBehavior === 'nothing' && !event.shiftKey) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this._cancelContextMenu = false;
                    return;
                }
                else if (!this._cancelContextMenu && rightClickBehavior !== 'copyPaste' && rightClickBehavior !== 'paste') {
                    if (!this._cancelContextMenu) {
                        (0, terminalContextMenu_1.openContextMenu)(dom.getWindow(this._editorInstanceElement), event, this._editorInput?.terminalInstance, this._instanceMenu, this._contextMenuService);
                    }
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this._cancelContextMenu = false;
                }
            }));
        }
        layout(dimension) {
            const instance = this._editorInput?.terminalInstance;
            if (instance) {
                instance.attachToElement(this._overflowGuardElement);
                instance.layout(dimension);
            }
            this._lastDimension = dimension;
        }
        setVisible(visible, group) {
            super.setVisible(visible, group);
            this._editorInput?.terminalInstance?.setVisible(visible && this._workbenchLayoutService.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */, dom.getWindow(this._editorInstanceElement)));
        }
        getActionViewItem(action) {
            switch (action.id) {
                case "workbench.action.createTerminalEditor" /* TerminalCommandId.CreateTerminalEditor */: {
                    if (action instanceof actions_1.MenuItemAction) {
                        const location = { viewColumn: editorService_1.ACTIVE_GROUP };
                        const actions = (0, terminalMenus_1.getTerminalActionBarArgs)(location, this._terminalProfileService.availableProfiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
                        const button = this._instantiationService.createInstance(dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem, action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, this._contextMenuService, {});
                        return button;
                    }
                }
            }
            return super.getActionViewItem(action);
        }
        _getDefaultProfileName() {
            let defaultProfileName;
            try {
                defaultProfileName = this._terminalProfileService.getDefaultProfileName();
            }
            catch (e) {
                defaultProfileName = this._terminalProfileResolverService.defaultProfileName;
            }
            return defaultProfileName;
        }
    };
    exports.TerminalEditor = TerminalEditor;
    exports.TerminalEditor = TerminalEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, terminal_1.ITerminalEditorService),
        __param(4, terminal_2.ITerminalProfileResolverService),
        __param(5, terminal_1.ITerminalService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, actions_1.IMenuService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, contextView_1.IContextMenuService),
        __param(10, notification_1.INotificationService),
        __param(11, terminal_2.ITerminalProfileService),
        __param(12, layoutService_1.IWorkbenchLayoutService)
    ], TerminalEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNkJ6RixJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsdUJBQVU7UUFlN0MsWUFDb0IsZ0JBQW1DLEVBQ3ZDLFlBQTJCLEVBQ3pCLGNBQStCLEVBQ3hCLHNCQUErRCxFQUN0RCwrQkFBaUYsRUFDaEcsZ0JBQW1ELEVBQ2pELGlCQUFxQyxFQUMzQyxXQUF5QixFQUNoQixxQkFBNkQsRUFDL0QsbUJBQXlELEVBQ3hELG9CQUEyRCxFQUN4RCx1QkFBaUUsRUFDakUsdUJBQWlFO1lBRTFGLEtBQUssQ0FBQywyQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFYL0IsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtZQUNyQyxvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWlDO1lBQy9FLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFHN0IsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM5Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQ3ZDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFDdkMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtZQUNoRCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1lBdkJuRixpQkFBWSxHQUF5QixTQUFTLENBQUM7WUFRL0MsdUJBQWtCLEdBQVksS0FBSyxDQUFDO1lBa0IzQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxnQkFBTSxDQUFDLDBCQUEwQixFQUFF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