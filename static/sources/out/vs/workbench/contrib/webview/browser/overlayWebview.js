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
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/platform/contextkey/common/contextkey", "vs/platform/layout/browser/layoutService", "vs/workbench/contrib/webview/browser/webview"], function (require, exports, fastDomNode_1, event_1, lifecycle_1, uuid_1, contextkey_1, layoutService_1, webview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OverlayWebview = void 0;
    /**
     * Webview that is absolutely positioned over another element and that can creates and destroys an underlying webview as needed.
     */
    let OverlayWebview = class OverlayWebview extends lifecycle_1.Disposable {
        constructor(initInfo, _layoutService, _webviewService, _baseContextKeyService) {
            super();
            this._layoutService = _layoutService;
            this._webviewService = _webviewService;
            this._baseContextKeyService = _baseContextKeyService;
            this._isFirstLoad = true;
            this._firstLoadPendingMessages = new Set();
            this._webview = this._register(new lifecycle_1.MutableDisposable());
            this._webviewEvents = this._register(new lifecycle_1.DisposableStore());
            this._html = '';
            this._initialScrollProgress = 0;
            this._state = undefined;
            this._owner = undefined;
            this._scopedContextKeyService = this._register(new lifecycle_1.MutableDisposable());
            this._shouldShowFindWidgetOnRestore = false;
            this._isDisposed = false;
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onDidClickLink = this._register(new event_1.Emitter());
            this.onDidClickLink = this._onDidClickLink.event;
            this._onDidReload = this._register(new event_1.Emitter());
            this.onDidReload = this._onDidReload.event;
            this._onDidScroll = this._register(new event_1.Emitter());
            this.onDidScroll = this._onDidScroll.event;
            this._onDidUpdateState = this._register(new event_1.Emitter());
            this.onDidUpdateState = this._onDidUpdateState.event;
            this._onMessage = this._register(new event_1.Emitter());
            this.onMessage = this._onMessage.event;
            this._onMissingCsp = this._register(new event_1.Emitter());
            this.onMissingCsp = this._onMissingCsp.event;
            this._onDidWheel = this._register(new event_1.Emitter());
            this.onDidWheel = this._onDidWheel.event;
            this._onFatalError = this._register(new event_1.Emitter());
            this.onFatalError = this._onFatalError.event;
            this.providedViewType = initInfo.providedViewType;
            this.origin = initInfo.origin ?? (0, uuid_1.generateUuid)();
            this._title = initInfo.title;
            this._extension = initInfo.extension;
            this._options = initInfo.options;
            this._contentOptions = initInfo.contentOptions;
        }
        get isFocused() {
            return !!this._webview.value?.isFocused;
        }
        dispose() {
            this._isDisposed = true;
            this._container?.domNode.remove();
            this._container = undefined;
            for (const msg of this._firstLoadPendingMessages) {
                msg.resolve(false);
            }
            this._firstLoadPendingMessages.clear();
            this._onDidDispose.fire();
            super.dispose();
        }
        get container() {
            if (this._isDisposed) {
                throw new Error(`OverlayWebview has been disposed`);
            }
            if (!this._container) {
                const node = document.createElement('div');
                node.style.position = 'absolute';
                node.style.overflow = 'hidden';
                this._container = new fastDomNode_1.FastDomNode(node);
                this._container.setVisibility('hidden');
                // Webviews cannot be reparented in the dom as it will destroy their contents.
                // Mount them to a high level node to avoid this.
                this._layoutService.mainContainer.appendChild(node);
            }
            return this._container.domNode;
        }
        claim(owner, scopedContextKeyService) {
            if (this._isDisposed) {
                return;
            }
            const oldOwner = this._owner;
            this._owner = owner;
            this._show();
            if (oldOwner !== owner) {
                const contextKeyService = (scopedContextKeyService || this._baseContextKeyService);
                // Explicitly clear before creating the new context.
                // Otherwise we create the new context while the old one is still around
                this._scopedContextKeyService.clear();
                this._scopedContextKeyService.value = contextKeyService.createScoped(this.container);
                const wasFindVisible = this._findWidgetVisible?.get();
                this._findWidgetVisible?.reset();
                this._findWidgetVisible = webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE.bindTo(contextKeyService);
                this._findWidgetVisible.set(!!wasFindVisible);
                this._findWidgetEnabled?.reset();
                this._findWidgetEnabled = webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED.bindTo(contextKeyService);
                this._findWidgetEnabled.set(!!this.options.enableFindWidget);
                this._webview.value?.setContextKeyService(this._scopedContextKeyService.value);
            }
        }
        release(owner) {
            if (this._owner !== owner) {
                return;
            }
            this._scopedContextKeyService.clear();
            this._owner = undefined;
            if (this._container) {
                this._container.setVisibility('hidden');
            }
            if (this._options.retainContextWhenHidden) {
                // https://github.com/microsoft/vscode/issues/157424
                // We need to record the current state when retaining context so we can try to showFind() when showing webview again
                this._shouldShowFindWidgetOnRestore = !!this._findWidgetVisible?.get();
                this.hideFind(false);
            }
            else {
                this._webview.clear();
                this._webviewEvents.clear();
            }
        }
        layoutWebviewOverElement(element, dimension, clippingContainer) {
            if (!this._container || !this._container.domNode.parentElement) {
                return;
            }
            const frameRect = element.getBoundingClientRect();
            const containerRect = this._container.domNode.parentElement.getBoundingClientRect();
            const parentBorderTop = (containerRect.height - this._container.domNode.parentElement.clientHeight) / 2.0;
            const parentBorderLeft = (containerRect.width - this._container.domNode.parentElement.clientWidth) / 2.0;
            this._container.setTop(frameRect.top - containerRect.top - parentBorderTop);
            this._container.setLeft(frameRect.left - containerRect.left - parentBorderLeft);
            this._container.setWidth(dimension ? dimension.width : frameRect.width);
            this._container.setHeight(dimension ? dimension.height : frameRect.height);
            if (clippingContainer) {
                const { top, left, right, bottom } = computeClippingRect(frameRect, clippingContainer);
                this._container.domNode.style.clipPath = `polygon(${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px)`;
            }
        }
        _show() {
            if (this._isDisposed) {
                throw new Error('OverlayWebview is disposed');
            }
            if (!this._webview.value) {
                const webview = this._webviewService.createWebviewElement({
                    providedViewType: this.providedViewType,
                    origin: this.origin,
                    title: this._title,
                    options: this._options,
                    contentOptions: this._contentOptions,
                    extension: this.extension,
                });
                this._webview.value = webview;
                webview.state = this._state;
                if (this._scopedContextKeyService.value) {
                    this._webview.value.setContextKeyService(this._scopedContextKeyService.value);
                }
                if (this._html) {
                    webview.setHtml(this._html);
                }
                if (this._options.tryRestoreScrollPosition) {
                    webview.initialScrollProgress = this._initialScrollProgress;
                }
                this._findWidgetEnabled?.set(!!this.options.enableFindWidget);
                webview.mountTo(this.container);
                // Forward events from inner webview to outer listeners
                this._webviewEvents.clear();
                this._webviewEvents.add(webview.onDidFocus(() => { this._onDidFocus.fire(); }));
                this._webviewEvents.add(webview.onDidBlur(() => { this._onDidBlur.fire(); }));
                this._webviewEvents.add(webview.onDidClickLink(x => { this._onDidClickLink.fire(x); }));
                this._webviewEvents.add(webview.onMessage(x => { this._onMessage.fire(x); }));
                this._webviewEvents.add(webview.onMissingCsp(x => { this._onMissingCsp.fire(x); }));
                this._webviewEvents.add(webview.onDidWheel(x => { this._onDidWheel.fire(x); }));
                this._webviewEvents.add(webview.onDidReload(() => { this._onDidReload.fire(); }));
                this._webviewEvents.add(webview.onFatalError(x => { this._onFatalError.fire(x); }));
                this._webviewEvents.add(webview.onDidScroll(x => {
                    this._initialScrollProgress = x.scrollYPercentage;
                    this._onDidScroll.fire(x);
                }));
                this._webviewEvents.add(webview.onDidUpdateState(state => {
                    this._state = state;
                    this._onDidUpdateState.fire(state);
                }));
                if (this._isFirstLoad) {
                    this._firstLoadPendingMessages.forEach(async (msg) => {
                        msg.resolve(await webview.postMessage(msg.message, msg.transfer));
                    });
                }
                this._isFirstLoad = false;
                this._firstLoadPendingMessages.clear();
            }
            // https://github.com/microsoft/vscode/issues/157424
            if (this.options.retainContextWhenHidden && this._shouldShowFindWidgetOnRestore) {
                this.showFind(false);
                // Reset
                this._shouldShowFindWidgetOnRestore = false;
            }
            this._container?.setVisibility('visible');
        }
        setHtml(html) {
            this._html = html;
            this._withWebview(webview => webview.setHtml(html));
        }
        setTitle(title) {
            this._title = title;
            this._withWebview(webview => webview.setTitle(title));
        }
        get initialScrollProgress() { return this._initialScrollProgress; }
        set initialScrollProgress(value) {
            this._initialScrollProgress = value;
            this._withWebview(webview => webview.initialScrollProgress = value);
        }
        get state() { return this._state; }
        set state(value) {
            this._state = value;
            this._withWebview(webview => webview.state = value);
        }
        get extension() { return this._extension; }
        set extension(value) {
            this._extension = value;
            this._withWebview(webview => webview.extension = value);
        }
        get options() { return this._options; }
        set options(value) { this._options = { customClasses: this._options.customClasses, ...value }; }
        get contentOptions() { return this._contentOptions; }
        set contentOptions(value) {
            this._contentOptions = value;
            this._withWebview(webview => webview.contentOptions = value);
        }
        set localResourcesRoot(resources) {
            this._withWebview(webview => webview.localResourcesRoot = resources);
        }
        async postMessage(message, transfer) {
            if (this._webview.value) {
                return this._webview.value.postMessage(message, transfer);
            }
            if (this._isFirstLoad) {
                let resolve;
                const p = new Promise(r => resolve = r);
                this._firstLoadPendingMessages.add({ message, transfer, resolve: resolve });
                return p;
            }
            return false;
        }
        focus() { this._webview.value?.focus(); }
        reload() { this._webview.value?.reload(); }
        selectAll() { this._webview.value?.selectAll(); }
        copy() { this._webview.value?.copy(); }
        paste() { this._webview.value?.paste(); }
        cut() { this._webview.value?.cut(); }
        undo() { this._webview.value?.undo(); }
        redo() { this._webview.value?.redo(); }
        showFind(animated = true) {
            if (this._webview.value) {
                this._webview.value.showFind(animated);
                this._findWidgetVisible?.set(true);
            }
        }
        hideFind(animated = true) {
            this._findWidgetVisible?.reset();
            this._webview.value?.hideFind(animated);
        }
        runFindAction(previous) { this._webview.value?.runFindAction(previous); }
        _withWebview(f) {
            if (this._webview.value) {
                f(this._webview.value);
            }
        }
        windowDidDragStart() {
            this._webview.value?.windowDidDragStart();
        }
        windowDidDragEnd() {
            this._webview.value?.windowDidDragEnd();
        }
        setContextKeyService(contextKeyService) {
            this._webview.value?.setContextKeyService(contextKeyService);
        }
    };
    exports.OverlayWebview = OverlayWebview;
    exports.OverlayWebview = OverlayWebview = __decorate([
        __param(1, layoutService_1.ILayoutService),
        __param(2, webview_1.IWebviewService),
        __param(3, contextkey_1.IContextKeyService)
    ], OverlayWebview);
    function computeClippingRect(frameRect, clipper) {
        const rootRect = clipper.getBoundingClientRect();
        const top = Math.max(rootRect.top - frameRect.top, 0);
        const right = Math.max(frameRect.width - (frameRect.right - rootRect.right), 0);
        const bottom = Math.max(frameRect.height - (frameRect.bottom - rootRect.bottom), 0);
        const left = Math.max(rootRect.left - frameRect.left, 0);
        return { top, right, bottom, left };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheVdlYnZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlYnZpZXcvYnJvd3Nlci9vdmVybGF5V2Vidmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjaEc7O09BRUc7SUFDSSxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsc0JBQVU7UUE2QjdDLFlBQ0MsUUFBeUIsRUFDVCxjQUErQyxFQUM5QyxlQUFpRCxFQUM5QyxzQkFBMkQ7WUFFL0UsS0FBSyxFQUFFLENBQUM7WUFKeUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzdCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUM3QiwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQW9CO1lBL0J4RSxpQkFBWSxHQUFHLElBQUksQ0FBQztZQUNYLDhCQUF5QixHQUFHLElBQUksR0FBRyxFQUFxSCxDQUFDO1lBQ3pKLGFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQW1CLENBQUMsQ0FBQztZQUNwRSxtQkFBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUVoRSxVQUFLLEdBQUcsRUFBRSxDQUFDO1lBRVgsMkJBQXNCLEdBQVcsQ0FBQyxDQUFDO1lBQ25DLFdBQU0sR0FBdUIsU0FBUyxDQUFDO1lBTXZDLFdBQU0sR0FBUSxTQUFTLENBQUM7WUFFZiw2QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQTRCLENBQUMsQ0FBQztZQUd0RyxtQ0FBOEIsR0FBRyxLQUFLLENBQUM7WUE2QnZDLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1lBRVgsa0JBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxF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QyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hGLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlFLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hGLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlFLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BGLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hGLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xGLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXBGLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQy9DLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQUMsaUJBQWlCLENBQUM7b0JBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDeEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRUosSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFDLEdBQUcsRUFBQyxFQUFFO3dCQUNsRCxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNuRSxDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDO2dCQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUMxQixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDeEMsQ0FBQztZQUVELG9EQUFvRDtZQUNwRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLElBQUksSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7Z0JBQ2pGLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JCLFFBQVE7Z0JBQ1IsSUFBSSxDQUFDLDhCQUE4QixHQUFHLEtBQUssQ0FBQztZQUM3QyxDQUFDO1lBRUQsSUFBSSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVNLE9BQU8sQ0FBQyxJQUFZO1lBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLFFBQVEsQ0FBQyxLQUFhO1lBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELElBQVcscUJBQXFCLEtBQWEsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBQ2xGLElBQVcscUJBQXFCLENBQUMsS0FBYTtZQUM3QyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUVELElBQVcsS0FBSyxLQUF5QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzlELElBQVcsS0FBSyxDQUFDLEtBQXlCO1lBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRCxJQUFXLFNBQVMsS0FBOEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMzRixJQUFXLFNBQVMsQ0FBQyxLQUE4QztZQUNsRSxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsSUFBVyxPQUFPLEtBQXFCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUQsSUFBVyxPQUFPLENBQUMsS0FBcUIsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXZILElBQVcsY0FBYyxLQUE0QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ25GLElBQVcsY0FBYyxDQUFDLEtBQTRCO1lBQ3JELElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzdCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxJQUFXLGtCQUFrQixDQUFDLFNBQWdCO1lBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQWdDTSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQVksRUFBRSxRQUFpQztZQUN2RSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMzRCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksT0FBNkIsQ0FBQztnQkFDbEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUM3RSxPQUFPLENBQUMsQ0FBQztZQUNWLENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxLQUFLLEtBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sS0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakQsU0FBUyxLQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RCxJQUFJLEtBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdDLEtBQUssS0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0MsR0FBRyxLQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFJLEtBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFN0MsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJO1lBQ3ZCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLENBQUM7UUFDRixDQUFDO1FBRUQsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJO1lBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELGFBQWEsQ0FBQyxRQUFpQixJQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEYsWUFBWSxDQUFDLENBQThCO1lBQ2xELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsQ0FBQztRQUNGLENBQUM7UUFFRCxrQkFBa0I7WUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRUQsZ0JBQWdCO1lBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztRQUN6QyxDQUFDO1FBRUQsb0JBQW9CLENBQUMsaUJBQXFDO1lBQ3pELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDOUQsQ0FBQztLQUNELENBQUE7SUE3V1ksd0NBQWM7NkJBQWQsY0FBYztRQStCeEIsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSwrQkFBa0IsQ0FBQTtPQWpDUixjQUFjLENBNlcxQjtJQUVELFNBQVMsbUJBQW1CLENBQUMsU0FBMEIsRUFBRSxPQUFvQjtRQUM1RSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUVqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV6RCxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDckMsQ0FBQyJ9