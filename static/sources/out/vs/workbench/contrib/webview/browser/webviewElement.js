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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/telemetry/common/telemetry", "vs/platform/tunnel/common/tunnel", "vs/platform/webview/common/webviewPortMapping", "vs/base/browser/iframe", "vs/workbench/contrib/webview/browser/resourceLoading", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/browser/webviewFindWidget", "vs/workbench/contrib/webview/common/webview", "vs/workbench/services/environment/common/environmentService", "vs/base/browser/window"], function (require, exports, browser_1, dom_1, async_1, buffer_1, cancellation_1, event_1, lifecycle_1, network_1, uri_1, uuid_1, nls_1, accessibility_1, actions_1, configuration_1, contextView_1, files_1, instantiation_1, log_1, notification_1, remoteAuthorityResolver_1, telemetry_1, tunnel_1, webviewPortMapping_1, iframe_1, resourceLoading_1, webview_1, webviewFindWidget_1, webview_2, environmentService_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewElement = void 0;
    var WebviewState;
    (function (WebviewState) {
        let Type;
        (function (Type) {
            Type[Type["Initializing"] = 0] = "Initializing";
            Type[Type["Ready"] = 1] = "Ready";
        })(Type = WebviewState.Type || (WebviewState.Type = {}));
        class Initializing {
            constructor(pendingMessages) {
                this.pendingMessages = pendingMessages;
                this.type = 0 /* Type.Initializing */;
            }
        }
        WebviewState.Initializing = Initializing;
        WebviewState.Ready = { type: 1 /* Type.Ready */ };
    })(WebviewState || (WebviewState = {}));
    const webviewIdContext = 'webviewId';
    let WebviewElement = class WebviewElement extends lifecycle_1.Disposable {
        get platform() { return 'browser'; }
        get element() { return this._element; }
        get isFocused() {
            if (!this._focused) {
                return false;
            }
            if (window_1.$window.document.activeElement && window_1.$window.document.activeElement !== this.element) {
                // looks like https://github.com/microsoft/vscode/issues/132641
                // where the focus is actually not in the `<iframe>`
                return false;
            }
            return true;
        }
        constructor(initInfo, webviewThemeDataProvider, configurationService, contextMenuService, notificationService, _environmentService, _fileService, _logService, _remoteAuthorityResolverService, _telemetryService, _tunnelService, instantiationService, _accessibilityService) {
            super();
            this.webviewThemeDataProvider = webviewThemeDataProvider;
            this._environmentService = _environmentService;
            this._fileService = _fileService;
            this._logService = _logService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._telemetryService = _telemetryService;
            this._tunnelService = _tunnelService;
            this._accessibilityService = _accessibilityService;
            this.id = (0, uuid_1.generateUuid)();
            this._expectedServiceWorkerVersion = 4; // Keep this in sync with the version in service-worker.js
            this._state = new WebviewState.Initializing([]);
            this._resourceLoadingCts = this._register(new cancellation_1.CancellationTokenSource());
            this._focusDelayer = this._register(new async_1.ThrottledDelayer(50));
            this._onDidHtmlChange = this._register(new event_1.Emitter());
            this.onDidHtmlChange = this._onDidHtmlChange.event;
            this._messageHandlers = new Map();
            this.checkImeCompletionState = true;
            this._disposed = false;
            this._onMissingCsp = this._register(new event_1.Emitter());
            this.onMissingCsp = this._onMissingCsp.event;
            this._onDidClickLink = this._register(new event_1.Emitter());
            this.onDidClickLink = this._onDidClickLink.event;
            this._onDidReload = this._register(new event_1.Emitter());
            this.onDidReload = this._onDidReload.event;
            this._onMessage = this._register(new event_1.Emitter());
            this.onMessage = this._onMessage.event;
            this._onDidScroll = this._register(new event_1.Emitter());
            this.onDidScroll = this._onDidScroll.event;
            this._onDidWheel = this._register(new event_1.Emitter());
            this.onDidWheel = this._onDidWheel.event;
            this._onDidUpdateState = this._register(new event_1.Emitter());
            this.onDidUpdateState = this._onDidUpdateState.event;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onFatalError = this._register(new event_1.Emitter());
            this.onFatalError = this._onFatalError.event;
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            this._hasAlertedAboutMissingCsp = false;
            this._hasFindResult = this._register(new event_1.Emitter());
            this.hasFindResult = this._hasFindResult.event;
            this._onDidStopFind = this._register(new event_1.Emitter());
            this.onDidStopFind = this._onDidStopFind.event;
            this.providedViewType = initInfo.providedViewType;
            this.origin = initInfo.origin ?? this.id;
            this._encodedWebviewOriginPromise = (0, iframe_1.parentOriginHash)(window_1.$window.origin, this.origin).then(id => this._encodedWebviewOrigin = id);
            this._options = initInfo.options;
            this.extension = initInfo.extension;
            this._content = {
                html: '',
                title: initInfo.title,
                options: initInfo.contentOptions,
                state: undefined
            };
            this._portMappingManager = this._register(new webviewPortMapping_1.WebviewPortMappingManager(() => this.extension?.location, () => this._content.options.portMapping || [], this._tunnelService));
            this._element = this._createElement(initInfo.options, initInfo.contentOptions);
            const subscription = this._register((0, dom_1.addDisposableListener)(initInfo.codeWindow ?? (0, dom_1.getActiveWindow)(), 'message', (e) => {
                if (!this._encodedWebviewOrigin || e?.data?.target !== this.id) {
                    return;
                }
                if (e.origin !== this._webviewContentOrigin(this._encodedWebviewOrigin)) {
                    console.log(`Skipped renderer receiving message due to mismatched origins: ${e.origin} ${this._webviewContentOrigin}`);
                    return;
                }
                if (e.data.channel === 'webview-ready') {
                    if (this._messagePort) {
                        return;
                    }
                    this._logService.debug(`Webview(${this.id}): webview ready`);
                    this._messagePort = e.ports[0];
                    this._messagePort.onmessage = (e) => {
                        const handlers = this._messageHandlers.get(e.data.channel);
                        if (!handlers) {
                            console.log(`No handlers found for '${e.data.channel}'`);
                            return;
                        }
                        handlers?.forEach(handler => handler(e.data.data, e));
                    };
                    this.element?.classList.add('ready');
                    if (this._state.type === 0 /* WebviewState.Type.Initializing */) {
                        this._state.pendingMessages.forEach(({ channel, data }) => this.doPostMessage(channel, data));
                    }
                    this._state = WebviewState.Ready;
                    subscription.dispose();
                }
            }));
            this._register(this.on('no-csp-found', () => {
                this.handleNoCspFound();
            }));
            this._register(this.on('did-click-link', ({ uri }) => {
                this._onDidClickLink.fire(uri);
            }));
            this._register(this.on('onmessage', ({ message, transfer }) => {
                this._onMessage.fire({ message, transfer });
            }));
            this._register(this.on('did-scroll', ({ scrollYPercentage }) => {
                this._onDidScroll.fire({ scrollYPercentage });
            }));
            this._register(this.on('do-reload', () => {
                this.reload();
            }));
            this._register(this.on('do-update-state', (state) => {
                this.state = state;
                this._onDidUpdateState.fire(state);
            }));
            this._register(this.on('did-focus', () => {
                this.handleFocusChange(true);
            }));
            this._register(this.on('did-blur', () => {
                this.handleFocusChange(false);
            }));
            this._register(this.on('did-scroll-wheel', (event) => {
                this._onDidWheel.fire(event);
            }));
            this._register(this.on('did-find', ({ didFind }) => {
                this._hasFindResult.fire(didFind);
            }));
            this._register(this.on('fatal-error', (e) => {
                notificationService.error((0, nls_1.localize)('fatalErrorMessage', "Error loading webview: {0}", e.message));
                this._onFatalError.fire({ message: e.message });
            }));
            this._register(this.on('did-keydown', (data) => {
                // Electron: workaround for https://github.com/electron/electron/issues/14258
                // We have to detect keyboard events in the <webview> and dispatch them to our
                // keybinding service because these events do not bubble to the parent window anymore.
                this.handleKeyEvent('keydown', data);
            }));
            this._register(this.on('did-keyup', (data) => {
                this.handleKeyEvent('keyup', data);
            }));
            this._register(this.on('did-context-menu', (data) => {
                if (!this.element) {
                    return;
                }
                if (!this._contextKeyService) {
                    return;
                }
                const elementBox = this.element.getBoundingClientRect();
                const contextKeyService = this._contextKeyService.createOverlay([
                    ...Object.entries(data.context),
                    [webviewIdContext, this.providedViewType],
                ]);
                contextMenuService.showContextMenu({
                    menuId: actions_1.MenuId.WebviewContext,
                    menuActionOptions: { shouldForwardArgs: true },
                    contextKeyService,
                    getActionsContext: () => ({ ...data.context, webview: this.providedViewType }),
                    getAnchor: () => ({
                        x: elementBox.x + data.clientX,
                        y: elementBox.y + data.clientY
                    })
                });
            }));
            this._register(this.on('load-resource', async (entry) => {
                try {
                    // Restore the authority we previously encoded
                    const authority = (0, webview_2.decodeAuthority)(entry.authority);
                    const uri = uri_1.URI.from({
                        scheme: entry.scheme,
                        authority: authority,
                        path: decodeURIComponent(entry.path), // This gets re-encoded
                        query: entry.query ? decodeURIComponent(entry.query) : entry.query,
                    });
                    this.loadResource(entry.id, uri, entry.ifNoneMatch);
                }
                catch (e) {
                    this._send('did-load-resource', {
                        id: entry.id,
                        status: 404,
                        path: entry.path,
                    });
                }
            }));
            this._register(this.on('load-localhost', (entry) => {
                this.localLocalhost(entry.id, entry.origin);
            }));
            this._register(event_1.Event.runAndSubscribe(webviewThemeDataProvider.onThemeDataChanged, () => this.style()));
            this._register(_accessibilityService.onDidChangeReducedMotion(() => this.style()));
            this._register(_accessibilityService.onDidChangeScreenReaderOptimized(() => this.style()));
            this._register(contextMenuService.onDidShowContextMenu(() => this._send('set-context-menu-visible', { visible: true })));
            this._register(contextMenuService.onDidHideContextMenu(() => this._send('set-context-menu-visible', { visible: false })));
            this._confirmBeforeClose = configurationService.getValue('window.confirmBeforeClose');
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.confirmBeforeClose')) {
                    this._confirmBeforeClose = configurationService.getValue('window.confirmBeforeClose');
                    this._send('set-confirm-before-close', this._confirmBeforeClose);
                }
            }));
            this._register(this.on('drag-start', () => {
                this._startBlockingIframeDragEvents();
            }));
            if (initInfo.options.enableFindWidget) {
                this._webviewFindWidget = this._register(instantiationService.createInstance(webviewFindWidget_1.WebviewFindWidget, this));
            }
            this._encodedWebviewOriginPromise.then(encodedWebviewOrigin => {
                if (!this._disposed) {
                    this._initElement(encodedWebviewOrigin, this.extension, this._options);
                }
            });
        }
        dispose() {
            this._disposed = true;
            this.element?.remove();
            this._element = undefined;
            this._messagePort = undefined;
            if (this._state.type === 0 /* WebviewState.Type.Initializing */) {
                for (const message of this._state.pendingMessages) {
                    message.resolve(false);
                }
                this._state.pendingMessages = [];
            }
            this._onDidDispose.fire();
            this._resourceLoadingCts.dispose(true);
            super.dispose();
        }
        setContextKeyService(contextKeyService) {
            this._contextKeyService = contextKeyService;
        }
        postMessage(message, transfer) {
            return this._send('message', { message, transfer });
        }
        async _send(channel, data, _createElement = []) {
            if (this._state.type === 0 /* WebviewState.Type.Initializing */) {
                let resolve;
                const promise = new Promise(r => resolve = r);
                this._state.pendingMessages.push({ channel, data, transferable: _createElement, resolve: resolve });
                return promise;
            }
            else {
                return this.doPostMessage(channel, data, _createElement);
            }
        }
        _createElement(options, _contentOptions) {
            // Do not start loading the webview yet.
            // Wait the end of the ctor when all listeners have been hooked up.
            const element = document.createElement('iframe');
            element.name = this.id;
            element.className = `webview ${options.customClasses || ''}`;
            element.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms', 'allow-pointer-lock', 'allow-downloads');
            const allowRules = ['cross-origin-isolated', 'autoplay'];
            if (!browser_1.isFirefox) {
                allowRules.push('clipboard-read', 'clipboard-write');
            }
            element.setAttribute('allow', allowRules.join('; '));
            element.style.border = 'none';
            element.style.width = '100%';
            element.style.height = '100%';
            element.focus = () => {
                this._doFocus();
            };
            return element;
        }
        _initElement(encodedWebviewOrigin, extension, options) {
            // The extensionId and purpose in the URL are used for filtering in js-debug:
            const params = {
                id: this.id,
                origin: this.origin,
                swVersion: String(this._expectedServiceWorkerVersion),
                extensionId: extension?.id.value ?? '',
                platform: this.platform,
                'vscode-resource-base-authority': webview_2.webviewRootResourceAuthority,
                parentOrigin: window_1.$window.origin,
            };
            if (this._options.disableServiceWorker) {
                params.disableServiceWorker = 'true';
            }
            if (this._environmentService.remoteAuthority) {
                params.remoteAuthority = this._environmentService.remoteAuthority;
            }
            if (options.purpose) {
                params.purpose = options.purpose;
            }
            network_1.COI.addSearchParam(params, true, true);
            const queryString = new URLSearchParams(params).toString();
            // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1754872
            const fileName = browser_1.isFirefox ? 'index-no-csp.html' : 'index.html';
            this.element.setAttribute('src', `${this.webviewContentEndpoint(encodedWebviewOrigin)}/${fileName}?${queryString}`);
        }
        mountTo(element) {
            if (!this.element) {
                return;
            }
            if (this._webviewFindWidget) {
                element.appendChild(this._webviewFindWidget.getDomNode());
            }
            for (const eventName of [dom_1.EventType.MOUSE_DOWN, dom_1.EventType.MOUSE_MOVE, dom_1.EventType.DROP]) {
                this._register((0, dom_1.addDisposableListener)(element, eventName, () => {
                    this._stopBlockingIframeDragEvents();
                }));
            }
            for (const node of [element, window_1.$window]) {
                this._register((0, dom_1.addDisposableListener)(node, dom_1.EventType.DRAG_END, () => {
                    this._stopBlockingIframeDragEvents();
                }));
            }
            element.id = this.id; // This is used by aria-flow for accessibility order
            element.appendChild(this.element);
        }
        _startBlockingIframeDragEvents() {
            if (this.element) {
                this.element.style.pointerEvents = 'none';
            }
        }
        _stopBlockingIframeDragEvents() {
            if (this.element) {
                this.element.style.pointerEvents = 'auto';
            }
        }
        webviewContentEndpoint(encodedWebviewOrigin) {
            const webviewExternalEndpoint = this._environmentService.webviewExternalEndpoint;
            if (!webviewExternalEndpoint) {
                throw new Error(`'webviewExternalEndpoint' has not been configured. Webviews will not work!`);
            }
            const endpoint = webviewExternalEndpoint.replace('{{uuid}}', encodedWebviewOrigin);
            if (endpoint[endpoint.length - 1] === '/') {
                return endpoint.slice(0, endpoint.length - 1);
            }
            return endpoint;
        }
        _webviewContentOrigin(encodedWebviewOrigin) {
            const uri = uri_1.URI.parse(this.webviewContentEndpoint(encodedWebviewOrigin));
            return uri.scheme + '://' + uri.authority.toLowerCase();
        }
        doPostMessage(channel, data, transferable = []) {
            if (this.element && this._messagePort) {
                this._messagePort.postMessage({ channel, args: data }, transferable);
                return true;
            }
            return false;
        }
        on(channel, handler) {
            let handlers = this._messageHandlers.get(channel);
            if (!handlers) {
                handlers = new Set();
                this._messageHandlers.set(channel, handlers);
            }
            handlers.add(handler);
            return (0, lifecycle_1.toDisposable)(() => {
                this._messageHandlers.get(channel)?.delete(handler);
            });
        }
        handleNoCspFound() {
            if (this._hasAlertedAboutMissingCsp) {
                return;
            }
            this._hasAlertedAboutMissingCsp = true;
            if (this.extension?.id) {
                if (this._environmentService.isExtensionDevelopment) {
                    this._onMissingCsp.fire(this.extension.id);
                }
                const payload = {
                    extension: this.extension.id.value
                };
                this._telemetryService.publicLog2('webviewMissingCsp', payload);
            }
        }
        reload() {
            this.doUpdateContent(this._content);
            const subscription = this._register(this.on('did-load', () => {
                this._onDidReload.fire();
                subscription.dispose();
            }));
        }
        setHtml(html) {
            this.doUpdateContent({ ...this._content, html });
            this._onDidHtmlChange.fire(html);
        }
        setTitle(title) {
            this._content = { ...this._content, title };
            this._send('set-title', title);
        }
        set contentOptions(options) {
            this._logService.debug(`Webview(${this.id}): will update content options`);
            if ((0, webview_1.areWebviewContentOptionsEqual)(options, this._content.options)) {
                this._logService.debug(`Webview(${this.id}): skipping content options update`);
                return;
            }
            this.doUpdateContent({ ...this._content, options });
        }
        set localResourcesRoot(resources) {
            this._content = {
                ...this._content,
                options: { ...this._content.options, localResourceRoots: resources }
            };
        }
        set state(state) {
            this._content = { ...this._content, state };
        }
        set initialScrollProgress(value) {
            this._send('initial-scroll-position', value);
        }
        doUpdateContent(newContent) {
            this._logService.debug(`Webview(${this.id}): will update content`);
            this._content = newContent;
            const allowScripts = !!this._content.options.allowScripts;
            this._send('content', {
                contents: this._content.html,
                title: this._content.title,
                options: {
                    allowMultipleAPIAcquire: !!this._content.options.allowMultipleAPIAcquire,
                    allowScripts: allowScripts,
                    allowForms: this._content.options.allowForms ?? allowScripts, // For back compat, we allow forms by default when scripts are enabled
                },
                state: this._content.state,
                cspSource: webview_2.webviewGenericCspSource,
                confirmBeforeClose: this._confirmBeforeClose,
            });
        }
        style() {
            let { styles, activeTheme, themeLabel, themeId } = this.webviewThemeDataProvider.getWebviewThemeData();
            if (this._options.transformCssVariables) {
                styles = this._options.transformCssVariables(styles);
            }
            const reduceMotion = this._accessibilityService.isMotionReduced();
            const screenReader = this._accessibilityService.isScreenReaderOptimized();
            this._send('styles', { styles, activeTheme, themeId, themeLabel, reduceMotion, screenReader });
        }
        handleFocusChange(isFocused) {
            this._focused = isFocused;
            if (isFocused) {
                this._onDidFocus.fire();
            }
            else {
                this._onDidBlur.fire();
            }
        }
        handleKeyEvent(type, event) {
            // Create a fake KeyboardEvent from the data provided
            const emulatedKeyboardEvent = new KeyboardEvent(type, event);
            // Force override the target
            Object.defineProperty(emulatedKeyboardEvent, 'target', {
                get: () => this.element,
            });
            // And re-dispatch
            window_1.$window.dispatchEvent(emulatedKeyboardEvent);
        }
        windowDidDragStart() {
            // Webview break drag and dropping around the main window (no events are generated when you are over them)
            // Work around this by disabling pointer events during the drag.
            // https://github.com/electron/electron/issues/18226
            this._startBlockingIframeDragEvents();
        }
        windowDidDragEnd() {
            this._stopBlockingIframeDragEvents();
        }
        selectAll() {
            this.execCommand('selectAll');
        }
        copy() {
            this.execCommand('copy');
        }
        paste() {
            this.execCommand('paste');
        }
        cut() {
            this.execCommand('cut');
        }
        undo() {
            this.execCommand('undo');
        }
        redo() {
            this.execCommand('redo');
        }
        execCommand(command) {
            if (this.element) {
                this._send('execCommand', command);
            }
        }
        async loadResource(id, uri, ifNoneMatch) {
            try {
                const result = await (0, resourceLoading_1.loadLocalResource)(uri, {
                    ifNoneMatch,
                    roots: this._content.options.localResourceRoots || [],
                }, this._fileService, this._logService, this._resourceLoadingCts.token);
                switch (result.type) {
                    case resourceLoading_1.WebviewResourceResponse.Type.Success: {
                        const buffer = await this.streamToBuffer(result.stream);
                        return this._send('did-load-resource', {
                            id,
                            status: 200,
                            path: uri.path,
                            mime: result.mimeType,
                            data: buffer,
                            etag: result.etag,
                            mtime: result.mtime
                        }, [buffer]);
                    }
                    case resourceLoading_1.WebviewResourceResponse.Type.NotModified: {
                        return this._send('did-load-resource', {
                            id,
                            status: 304, // not modified
                            path: uri.path,
                            mime: result.mimeType,
                            mtime: result.mtime
                        });
                    }
                    case resourceLoading_1.WebviewResourceResponse.Type.AccessDenied: {
                        return this._send('did-load-resource', {
                            id,
                            status: 401, // unauthorized
                            path: uri.path,
                        });
                    }
                }
            }
            catch {
                // noop
            }
            return this._send('did-load-resource', {
                id,
                status: 404,
                path: uri.path,
            });
        }
        async streamToBuffer(stream) {
            const vsBuffer = await (0, buffer_1.streamToBuffer)(stream);
            return vsBuffer.buffer.buffer;
        }
        async localLocalhost(id, origin) {
            const authority = this._environmentService.remoteAuthority;
            const resolveAuthority = authority ? await this._remoteAuthorityResolverService.resolveAuthority(authority) : undefined;
            const redirect = resolveAuthority ? await this._portMappingManager.getRedirect(resolveAuthority.authority, origin) : undefined;
            return this._send('did-load-localhost', {
                id,
                origin,
                location: redirect
            });
        }
        focus() {
            this._doFocus();
            // Handle focus change programmatically (do not rely on event from <webview>)
            this.handleFocusChange(true);
        }
        _doFocus() {
            if (!this.element) {
                return;
            }
            try {
                this.element.contentWindow?.focus();
            }
            catch {
                // noop
            }
            // Workaround for https://github.com/microsoft/vscode/issues/75209
            // Focusing the inner webview is async so for a sequence of actions such as:
            //
            // 1. Open webview
            // 1. Show quick pick from command palette
            //
            // We end up focusing the webview after showing the quick pick, which causes
            // the quick pick to instantly dismiss.
            //
            // Workaround this by debouncing the focus and making sure we are not focused on an input
            // when we try to re-focus.
            this._focusDelayer.trigger(async () => {
                if (!this.isFocused || !this.element) {
                    return;
                }
                if (window_1.$window.document.activeElement && window_1.$window.document.activeElement !== this.element && window_1.$window.document.activeElement?.tagName !== 'BODY') {
                    return;
                }
                this._send('focus', undefined);
            });
        }
        /**
         * Webviews expose a stateful find API.
         * Successive calls to find will move forward or backward through onFindResults
         * depending on the supplied options.
         *
         * @param value The string to search for. Empty strings are ignored.
         */
        find(value, previous) {
            if (!this.element) {
                return;
            }
            this._send('find', { value, previous });
        }
        updateFind(value) {
            if (!value || !this.element) {
                return;
            }
            this._send('find', { value });
        }
        stopFind(keepSelection) {
            if (!this.element) {
                return;
            }
            this._send('find-stop', { clearSelection: !keepSelection });
            this._onDidStopFind.fire();
        }
        showFind(animated = true) {
            this._webviewFindWidget?.reveal(undefined, animated);
        }
        hideFind(animated = true) {
            this._webviewFindWidget?.hide(animated);
        }
        runFindAction(previous) {
            this._webviewFindWidget?.find(previous);
        }
    };
    exports.WebviewElement = WebviewElement;
    exports.WebviewElement = WebviewElement = __decorate([
        __param(2, configuration_1.IConfigurationService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, notification_1.INotificationService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, files_1.IFileService),
        __param(7, log_1.ILogService),
        __param(8, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, tunnel_1.ITunnelService),
        __param(11, instantiation_1.IInstantiationService),
        __param(12, accessibility_1.IAccessibilityService)
    ], WebviewElement);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0VsZW1lbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlYnZpZXcvYnJvd3Nlci93ZWJ2aWV3RWxlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE2Q2hHLElBQVUsWUFBWSxDQW1CckI7SUFuQkQsV0FBVSxZQUFZO1FBQ3JCLElBQWtCLElBQTRCO1FBQTlDLFdBQWtCLElBQUk7WUFBRywrQ0FBWSxDQUFBO1lBQUUsaUNBQUssQ0FBQTtRQUFDLENBQUMsRUFBNUIsSUFBSSxHQUFKLGlCQUFJLEtBQUosaUJBQUksUUFBd0I7UUFFOUMsTUFBYSxZQUFZO1lBR3hCLFlBQ1EsZUFLTDtnQkFMSyxvQkFBZSxHQUFmLGVBQWUsQ0FLcEI7Z0JBUk0sU0FBSSw2QkFBcUI7WUFTOUIsQ0FBQztTQUNMO1FBWFkseUJBQVksZUFXeEIsQ0FBQTtRQUVZLGtCQUFLLEdBQUcsRUFBRSxJQUFJLG9CQUFZLEVBQVcsQ0FBQztJQUdwRCxDQUFDLEVBbkJTLFlBQVksS0FBWixZQUFZLFFBbUJyQjtJQU9ELE1BQU0sZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO0lBRTlCLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBVTtRQWlCN0MsSUFBYyxRQUFRLEtBQWEsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBS3RELElBQWMsT0FBTyxLQUFvQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBR2hGLElBQVcsU0FBUztZQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNwQixPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFDRCxJQUFJLGdCQUFPLENBQUMsUUFBUSxDQUFDLGFBQWEsSUFBSSxnQkFBTyxDQUFDLFFBQVEsQ0FBQyxh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