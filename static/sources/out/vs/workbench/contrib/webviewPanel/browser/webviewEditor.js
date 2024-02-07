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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/window", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uuid", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/webview/browser/webviewWindowDragMonitor", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/host/browser/host", "vs/workbench/services/layout/browser/layoutService"], function (require, exports, DOM, window_1, event_1, lifecycle_1, platform_1, uuid_1, nls, contextkey_1, storage_1, telemetry_1, themeService_1, editorPane_1, webviewWindowDragMonitor_1, webviewEditorInput_1, editorGroupsService_1, editorService_1, host_1, layoutService_1) {
    "use strict";
    var WebviewEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewEditor = exports.CONTEXT_ACTIVE_WEBVIEW_PANEL_ID = void 0;
    /**
     * Tracks the id of the actively focused webview.
     */
    exports.CONTEXT_ACTIVE_WEBVIEW_PANEL_ID = new contextkey_1.RawContextKey('activeWebviewPanelId', '', {
        type: 'string',
        description: nls.localize('context.activeWebviewId', "The viewType of the currently active webview panel."),
    });
    let WebviewEditor = class WebviewEditor extends editorPane_1.EditorPane {
        static { WebviewEditor_1 = this; }
        static { this.ID = 'WebviewEditor'; }
        get onDidFocus() { return this._onDidFocusWebview.event; }
        constructor(telemetryService, themeService, storageService, _editorGroupsService, _editorService, _workbenchLayoutService, _hostService, _contextKeyService) {
            super(WebviewEditor_1.ID, telemetryService, themeService, storageService);
            this._editorGroupsService = _editorGroupsService;
            this._editorService = _editorService;
            this._workbenchLayoutService = _workbenchLayoutService;
            this._hostService = _hostService;
            this._contextKeyService = _contextKeyService;
            this._visible = false;
            this._isDisposed = false;
            this._webviewVisibleDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onFocusWindowHandler = this._register(new lifecycle_1.MutableDisposable());
            this._onDidFocusWebview = this._register(new event_1.Emitter());
            this._scopedContextKeyService = this._register(new lifecycle_1.MutableDisposable());
            this._register(event_1.Event.any(_editorGroupsService.activePart.onDidScroll, _editorGroupsService.activePart.onDidAddGroup, _editorGroupsService.activePart.onDidRemoveGroup, _editorGroupsService.activePart.onDidMoveGroup)(() => {
                if (this.webview && this._visible) {
                    this.synchronizeWebviewContainerDimensions(this.webview);
                }
            }));
        }
        get webview() {
            return this.input instanceof webviewEditorInput_1.WebviewInput ? this.input.webview : undefined;
        }
        get scopedContextKeyService() {
            return this._scopedContextKeyService.value;
        }
        createEditor(parent) {
            const element = document.createElement('div');
            this._element = element;
            this._element.id = `webview-editor-element-${(0, uuid_1.generateUuid)()}`;
            parent.appendChild(element);
            this._scopedContextKeyService.value = this._contextKeyService.createScoped(element);
        }
        dispose() {
            this._isDisposed = true;
            this._element?.remove();
            this._element = undefined;
            super.dispose();
        }
        layout(dimension) {
            this._dimension = dimension;
            if (this.webview && this._visible) {
                this.synchronizeWebviewContainerDimensions(this.webview, dimension);
            }
        }
        focus() {
            super.focus();
            if (!this._onFocusWindowHandler.value && !platform_1.isWeb) {
                // Make sure we restore focus when switching back to a VS Code window
                this._onFocusWindowHandler.value = this._hostService.onDidChangeFocus(focused => {
                    if (focused && this._editorService.activeEditorPane === this && this._workbenchLayoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
                        this.focus();
                    }
                });
            }
            this.webview?.focus();
        }
        setEditorVisible(visible, group) {
            this._visible = visible;
            if (this.input instanceof webviewEditorInput_1.WebviewInput && this.webview) {
                if (visible) {
                    this.claimWebview(this.input);
                }
                else {
                    this.webview.release(this);
                }
            }
            super.setEditorVisible(visible, group);
        }
        clearInput() {
            if (this.webview) {
                this.webview.release(this);
                this._webviewVisibleDisposables.clear();
            }
            super.clearInput();
        }
        async setInput(input, options, context, token) {
            if (this.input && input.matches(this.input)) {
                return;
            }
            const alreadyOwnsWebview = input instanceof webviewEditorInput_1.WebviewInput && input.webview === this.webview;
            if (this.webview && !alreadyOwnsWebview) {
                this.webview.release(this);
            }
            await super.setInput(input, options, context, token);
            await input.resolve(options);
            if (token.isCancellationRequested || this._isDisposed) {
                return;
            }
            if (input instanceof webviewEditorInput_1.WebviewInput) {
                if (this.group) {
                    input.updateGroup(this.group.id);
                }
                if (!alreadyOwnsWebview) {
                    this.claimWebview(input);
                }
                if (this._dimension) {
                    this.layout(this._dimension);
                }
            }
        }
        claimWebview(input) {
            input.webview.claim(this, this.scopedContextKeyService);
            if (this._element) {
                this._element.setAttribute('aria-flowto', input.webview.container.id);
                DOM.setParentFlowTo(input.webview.container, this._element);
            }
            this._webviewVisibleDisposables.clear();
            // Webviews are not part of the normal editor dom, so we have to register our own drag and drop handler on them.
            this._webviewVisibleDisposables.add(this._editorGroupsService.createEditorDropTarget(input.webview.container, {
                containsGroup: (group) => this.group?.id === group.id
            }));
            this._webviewVisibleDisposables.add(new webviewWindowDragMonitor_1.WebviewWindowDragMonitor(() => this.webview));
            this.synchronizeWebviewContainerDimensions(input.webview);
            this._webviewVisibleDisposables.add(this.trackFocus(input.webview));
        }
        synchronizeWebviewContainerDimensions(webview, dimension) {
            if (!this._element?.isConnected) {
                return;
            }
            const rootContainer = this._workbenchLayoutService.getContainer(window_1.$window, "workbench.parts.editor" /* Parts.EDITOR_PART */);
            webview.layoutWebviewOverElement(this._element.parentElement, dimension, rootContainer);
        }
        trackFocus(webview) {
            const store = new lifecycle_1.DisposableStore();
            // Track focus in webview content
            const webviewContentFocusTracker = DOM.trackFocus(webview.container);
            store.add(webviewContentFocusTracker);
            store.add(webviewContentFocusTracker.onDidFocus(() => this._onDidFocusWebview.fire()));
            // Track focus in webview element
            store.add(webview.onDidFocus(() => this._onDidFocusWebview.fire()));
            return store;
        }
    };
    exports.WebviewEditor = WebviewEditor;
    exports.WebviewEditor = WebviewEditor = WebviewEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, editorService_1.IEditorService),
        __param(5, layoutService_1.IWorkbenchLayoutService),
        __param(6, host_1.IHostService),
        __param(7, contextkey_1.IContextKeyService)
    ], WebviewEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0VkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2Vidmlld1BhbmVsL2Jyb3dzZXIvd2Vidmlld0VkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMEJoRzs7T0FFRztJQUNVLFFBQUEsK0JBQStCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLHNCQUFzQixFQUFFLEVBQUUsRUFBRTtRQUNwRyxJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLHFEQUFxRCxDQUFDO0tBQzNHLENBQUMsQ0FBQztJQUVJLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSx1QkFBVTs7aUJBRXJCLE9BQUUsR0FBRyxlQUFlLEFBQWxCLENBQW1CO1FBVzVDLElBQW9CLFVBQVUsS0FBaUIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUl0RixZQUNvQixnQkFBbUMsRUFDdkMsWUFBMkIsRUFDekIsY0FBK0IsRUFDMUIsb0JBQTJELEVBQ2pFLGNBQStDLEVBQ3RDLHVCQUFpRSxFQUM1RSxZQUEyQyxFQUNyQyxrQkFBdUQ7WUFFM0UsS0FBSyxDQUFDLGVBQWEsQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBTmpDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFDaEQsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ3JCLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7WUFDM0QsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDcEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQW5CcEUsYUFBUSxHQUFHLEtBQUssQ0FBQztZQUNqQixn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