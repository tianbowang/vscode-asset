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
define(["require", "exports", "vs/base/common/actions", "vs/nls", "vs/workbench/services/layout/browser/layoutService", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/base/common/platform", "vs/platform/clipboard/common/clipboardService", "vs/base/browser/mouseEvent", "vs/base/common/event"], function (require, exports, actions_1, nls_1, layoutService_1, contextView_1, lifecycle_1, dom_1, contributions_1, platform_1, platform_2, clipboardService_1, mouseEvent_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextInputActionsProvider = void 0;
    let TextInputActionsProvider = class TextInputActionsProvider extends lifecycle_1.Disposable {
        constructor(layoutService, contextMenuService, clipboardService) {
            super();
            this.layoutService = layoutService;
            this.contextMenuService = contextMenuService;
            this.clipboardService = clipboardService;
            this.textInputActions = [];
            this.createActions();
            this.registerListeners();
        }
        createActions() {
            this.textInputActions.push(
            // Undo/Redo
            new actions_1.Action('undo', (0, nls_1.localize)('undo', "Undo"), undefined, true, async () => (0, dom_1.getActiveDocument)().execCommand('undo')), new actions_1.Action('redo', (0, nls_1.localize)('redo', "Redo"), undefined, true, async () => (0, dom_1.getActiveDocument)().execCommand('redo')), new actions_1.Separator(), 
            // Cut / Copy / Paste
            new actions_1.Action('editor.action.clipboardCutAction', (0, nls_1.localize)('cut', "Cut"), undefined, true, async () => (0, dom_1.getActiveDocument)().execCommand('cut')), new actions_1.Action('editor.action.clipboardCopyAction', (0, nls_1.localize)('copy', "Copy"), undefined, true, async () => (0, dom_1.getActiveDocument)().execCommand('copy')), new actions_1.Action('editor.action.clipboardPasteAction', (0, nls_1.localize)('paste', "Paste"), undefined, true, async (element) => {
                // Native: paste is supported
                if (platform_2.isNative) {
                    (0, dom_1.getActiveDocument)().execCommand('paste');
                }
                // Web: paste is not supported due to security reasons
                else {
                    const clipboardText = await this.clipboardService.readText();
                    if (element instanceof HTMLTextAreaElement ||
                        element instanceof HTMLInputElement) {
                        const selectionStart = element.selectionStart || 0;
                        const selectionEnd = element.selectionEnd || 0;
                        element.value = `${element.value.substring(0, selectionStart)}${clipboardText}${element.value.substring(selectionEnd, element.value.length)}`;
                        element.selectionStart = selectionStart + clipboardText.length;
                        element.selectionEnd = element.selectionStart;
                        element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                    }
                }
            }), new actions_1.Separator(), 
            // Select All
            new actions_1.Action('editor.action.selectAll', (0, nls_1.localize)('selectAll', "Select All"), undefined, true, async () => (0, dom_1.getActiveDocument)().execCommand('selectAll')));
        }
        registerListeners() {
            // Context menu support in input/textarea
            this._register(event_1.Event.runAndSubscribe(this.layoutService.onDidAddContainer, ({ container, disposables }) => {
                disposables.add((0, dom_1.addDisposableListener)(container, 'contextmenu', e => this.onContextMenu((0, dom_1.getWindow)(container), e)));
            }, { container: this.layoutService.mainContainer, disposables: this._store }));
        }
        onContextMenu(targetWindow, e) {
            if (e.defaultPrevented) {
                return; // make sure to not show these actions by accident if component indicated to prevent
            }
            const target = e.target;
            if (!(target instanceof HTMLElement) || (target.nodeName.toLowerCase() !== 'input' && target.nodeName.toLowerCase() !== 'textarea')) {
                return; // only for inputs or textareas
            }
            dom_1.EventHelper.stop(e, true);
            const event = new mouseEvent_1.StandardMouseEvent(targetWindow, e);
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                getActions: () => this.textInputActions,
                getActionsContext: () => target,
            });
        }
    };
    exports.TextInputActionsProvider = TextInputActionsProvider;
    exports.TextInputActionsProvider = TextInputActionsProvider = __decorate([
        __param(0, layoutService_1.IWorkbenchLayoutService),
        __param(1, contextView_1.IContextMenuService),
        __param(2, clipboardService_1.IClipboardService)
    ], TextInputActionsProvider);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(TextInputActionsProvider, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dElucHV0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvYWN0aW9ucy90ZXh0SW5wdXRBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCekYsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxzQkFBVTtRQUl2RCxZQUMwQixhQUF1RCxFQUMzRCxrQkFBd0QsRUFDMUQsZ0JBQW9EO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBSmtDLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUMxQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3pDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFMaEUscUJBQWdCLEdBQWMsRUFBRSxDQUFDO1lBU3hDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVyQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8sYUFBYTtZQUNwQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSTtZQUV6QixZQUFZO1lBQ1osSUFBSSxnQkFBTSxDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLElBQUEsdUJBQWlCLEdBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsRUFDbEgsSUFBSSxnQkFBTSxDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLElBQUEsdUJBQWlCLEdBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsRUFDbEgsSUFB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