/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/uri", "vs/platform/extensions/common/extensionValidator", "vs/workbench/api/common/extHostWebviewMessaging", "vs/workbench/contrib/webview/common/webview", "./extHost.protocol"], function (require, exports, event_1, lifecycle_1, network_1, objects, uri_1, extensionValidator_1, extHostWebviewMessaging_1, webview_1, extHostProtocol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.serializeWebviewOptions = exports.toExtensionData = exports.ExtHostWebviews = exports.shouldSerializeBuffersForPostMessage = exports.ExtHostWebview = void 0;
    class ExtHostWebview {
        #handle;
        #proxy;
        #deprecationService;
        #remoteInfo;
        #workspace;
        #extension;
        #html;
        #options;
        #isDisposed;
        #hasCalledAsWebviewUri;
        #serializeBuffersForPostMessage;
        #shouldRewriteOldResourceUris;
        constructor(handle, proxy, options, remoteInfo, workspace, extension, deprecationService) {
            this.#html = '';
            this.#isDisposed = false;
            this.#hasCalledAsWebviewUri = false;
            /* internal */ this._onMessageEmitter = new event_1.Emitter();
            this.onDidReceiveMessage = this._onMessageEmitter.event;
            this.#onDidDisposeEmitter = new event_1.Emitter();
            /* internal */ this._onDidDispose = this.#onDidDisposeEmitter.event;
            this.#handle = handle;
            this.#proxy = proxy;
            this.#options = options;
            this.#remoteInfo = remoteInfo;
            this.#workspace = workspace;
            this.#extension = extension;
            this.#serializeBuffersForPostMessage = shouldSerializeBuffersForPostMessage(extension);
            this.#shouldRewriteOldResourceUris = shouldTryRewritingOldResourceUris(extension);
            this.#deprecationService = deprecationService;
        }
        #onDidDisposeEmitter;
        dispose() {
            this.#isDisposed = true;
            this.#onDidDisposeEmitter.fire();
            this.#onDidDisposeEmitter.dispose();
            this._onMessageEmitter.dispose();
        }
        asWebviewUri(resource) {
            this.#hasCalledAsWebviewUri = true;
            return (0, webview_1.asWebviewUri)(resource, this.#remoteInfo);
        }
        get cspSource() {
            const extensionLocation = this.#extension.extensionLocation;
            if (extensionLocation.scheme === network_1.Schemas.https || extensionLocation.scheme === network_1.Schemas.http) {
                // The extension is being served up from a CDN.
                // Also include the CDN in the default csp.
                let extensionCspRule = extensionLocation.toString();
                if (!extensionCspRule.endsWith('/')) {
                    // Always treat the location as a directory so that we allow all content under it
                    extensionCspRule += '/';
                }
                return extensionCspRule + ' ' + webview_1.webviewGenericCspSource;
            }
            return webview_1.webviewGenericCspSource;
        }
        get html() {
            this.assertNotDisposed();
            return this.#html;
        }
        set html(value) {
            this.assertNotDisposed();
            if (this.#html !== value) {
                this.#html = value;
                if (this.#shouldRewriteOldResourceUris && !this.#hasCalledAsWebviewUri && /(["'])vscode-resource:([^\s'"]+?)(["'])/i.test(value)) {
                    this.#hasCalledAsWebviewUri = true;
                    this.#deprecationService.report('Webview vscode-resource: uris', this.#extension, `Please migrate to use the 'webview.asWebviewUri' api instead: https://aka.ms/vscode-webview-use-aswebviewuri`);
                }
                this.#proxy.$setHtml(this.#handle, this.rewriteOldResourceUrlsIfNeeded(value));
            }
        }
        get options() {
            this.assertNotDisposed();
            return this.#options;
        }
        set options(newOptions) {
            this.assertNotDisposed();
            if (!objects.equals(this.#options, newOptions)) {
                this.#proxy.$setOptions(this.#handle, serializeWebviewOptions(this.#extension, this.#workspace, newOptions));
            }
            this.#options = newOptions;
        }
        async postMessage(message) {
            if (this.#isDisposed) {
                return false;
            }
            const serialized = (0, extHostWebviewMessaging_1.serializeWebviewMessage)(message, { serializeBuffersForPostMessage: this.#serializeBuffersForPostMessage });
            return this.#proxy.$postMessage(this.#handle, serialized.message, ...serialized.buffers);
        }
        assertNotDisposed() {
            if (this.#isDisposed) {
                throw new Error('Webview is disposed');
            }
        }
        rewriteOldResourceUrlsIfNeeded(value) {
            if (!this.#shouldRewriteOldResourceUris) {
                return value;
            }
            const isRemote = this.#extension.extensionLocation?.scheme === network_1.Schemas.vscodeRemote;
            const remoteAuthority = this.#extension.extensionLocation.scheme === network_1.Schemas.vscodeRemote ? this.#extension.extensionLocation.authority : undefined;
            return value
                .replace(/(["'])(?:vscode-resource):(\/\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (_match, startQuote, _1, scheme, path, endQuote) => {
                const uri = uri_1.URI.from({
                    scheme: scheme || 'file',
                    path: decodeURIComponent(path),
                });
                const webviewUri = (0, webview_1.asWebviewUri)(uri, { isRemote, authority: remoteAuthority }).toString();
                return `${startQuote}${webviewUri}${endQuote}`;
            })
                .replace(/(["'])(?:vscode-webview-resource):(\/\/[^\s\/'"]+\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (_match, startQuote, _1, scheme, path, endQuote) => {
                const uri = uri_1.URI.from({
                    scheme: scheme || 'file',
                    path: decodeURIComponent(path),
                });
                const webviewUri = (0, webview_1.asWebviewUri)(uri, { isRemote, authority: remoteAuthority }).toString();
                return `${startQuote}${webviewUri}${endQuote}`;
            });
        }
    }
    exports.ExtHostWebview = ExtHostWebview;
    function shouldSerializeBuffersForPostMessage(extension) {
        try {
            const version = (0, extensionValidator_1.normalizeVersion)((0, extensionValidator_1.parseVersion)(extension.engines.vscode));
            return !!version && version.majorBase >= 1 && version.minorBase >= 57;
        }
        catch {
            return false;
        }
    }
    exports.shouldSerializeBuffersForPostMessage = shouldSerializeBuffersForPostMessage;
    function shouldTryRewritingOldResourceUris(extension) {
        try {
            const version = (0, extensionValidator_1.normalizeVersion)((0, extensionValidator_1.parseVersion)(extension.engines.vscode));
            if (!version) {
                return false;
            }
            return version.majorBase < 1 || (version.majorBase === 1 && version.minorBase < 60);
        }
        catch {
            return false;
        }
    }
    class ExtHostWebviews extends lifecycle_1.Disposable {
        constructor(mainContext, remoteInfo, workspace, _logService, _deprecationService) {
            super();
            this.remoteInfo = remoteInfo;
            this.workspace = workspace;
            this._logService = _logService;
            this._deprecationService = _deprecationService;
            this._webviews = new Map();
            this._webviewProxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadWebviews);
        }
        dispose() {
            super.dispose();
            for (const webview of this._webviews.values()) {
                webview.dispose();
            }
            this._webviews.clear();
        }
        $onMessage(handle, jsonMessage, buffers) {
            const webview = this.getWebview(handle);
            if (webview) {
                const { message } = (0, extHostWebviewMessaging_1.deserializeWebviewMessage)(jsonMessage, buffers.value);
                webview._onMessageEmitter.fire(message);
            }
        }
        $onMissingCsp(_handle, extensionId) {
            this._logService.warn(`${extensionId} created a webview without a content security policy: https://aka.ms/vscode-webview-missing-csp`);
        }
        createNewWebview(handle, options, extension) {
            const webview = new ExtHostWebview(handle, this._webviewProxy, reviveOptions(options), this.remoteInfo, this.workspace, extension, this._deprecationService);
            this._webviews.set(handle, webview);
            const sub = webview._onDidDispose(() => {
                sub.dispose();
                this.deleteWebview(handle);
            });
            return webview;
        }
        deleteWebview(handle) {
            this._webviews.delete(handle);
        }
        getWebview(handle) {
            return this._webviews.get(handle);
        }
    }
    exports.ExtHostWebviews = ExtHostWebviews;
    function toExtensionData(extension) {
        return { id: extension.identifier, location: extension.extensionLocation };
    }
    exports.toExtensionData = toExtensionData;
    function serializeWebviewOptions(extension, workspace, options) {
        return {
            enableCommandUris: options.enableCommandUris,
            enableScripts: options.enableScripts,
            enableForms: options.enableForms,
            portMapping: options.portMapping,
            localResourceRoots: options.localResourceRoots || getDefaultLocalResourceRoots(extension, workspace)
        };
    }
    exports.serializeWebviewOptions = serializeWebviewOptions;
    function reviveOptions(options) {
        return {
            enableCommandUris: options.enableCommandUris,
            enableScripts: options.enableScripts,
            enableForms: options.enableForms,
            portMapping: options.portMapping,
            localResourceRoots: options.localResourceRoots?.map(components => uri_1.URI.from(components)),
        };
    }
    function getDefaultLocalResourceRoots(extension, workspace) {
        return [
            ...(workspace?.getWorkspaceFolders() || []).map(x => x.uri),
            extension.extensionLocation,
        ];
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdlYnZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RXZWJ2aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsTUFBYSxjQUFjO1FBRWpCLE9BQU8sQ0FBZ0M7UUFDdkMsTUFBTSxDQUEwQztRQUNoRCxtQkFBbUIsQ0FBZ0M7UUFFbkQsV0FBVyxDQUFvQjtRQUMvQixVQUFVLENBQWdDO1FBQzFDLFVBQVUsQ0FBd0I7UUFFM0MsS0FBSyxDQUFjO1FBQ25CLFFBQVEsQ0FBd0I7UUFDaEMsV0FBVyxDQUFrQjtRQUM3QixzQkFBc0IsQ0FBUztRQUUvQiwrQkFBK0IsQ0FBVTtRQUN6Qyw2QkFBNkIsQ0FBVTtRQUV2QyxZQUNDLE1BQXFDLEVBQ3JDLEtBQThDLEVBQzlDLE9BQThCLEVBQzlCLFVBQTZCLEVBQzdCLFNBQXdDLEVBQ3hDLFNBQWdDLEVBQ2hDLGtCQUFpRDtZQWZsRCxVQUFLLEdBQVcsRUFBRSxDQUFDO1lBRW5CLGdCQUFXLEdBQVksS0FBSyxDQUFDO1lBQzdCLDJCQUFzQixHQUFHLEtBQUssQ0FBQztZQXlCL0IsY0FBYyxDQUFVLHNCQUFpQixHQUFHLElBQUksZUFBTyxFQUFPLENBQUM7WUFDL0Msd0JBQW1CLEdBQWUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztZQUV0RSx5QkFBb0IsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ3BELGNBQWMsQ0FBVSxrQkFBYSxHQUFnQixJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBZnBGLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBQzlCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQywrQkFBK0IsR0FBRyxvQ0FBb0MsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsNkJBQTZCLEdBQUcsaUNBQWlDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO1FBQy9DLENBQUM7UUFLUSxvQkFBb0IsQ0FBdUI7UUFHN0MsT0FBTztZQUNiLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBRXhCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVqQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFTSxZQUFZLENBQUMsUUFBb0I7WUFDdkMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztZQUNuQyxPQUFPLElBQUEsc0JBQVksRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCxJQUFXLFNBQVM7WUFDbkIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDO1lBQzVELElBQUksaUJBQWlCLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsS0FBSyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUM3RiwrQ0FBK0M7Z0JBQy9DLDJDQUEyQztnQkFDM0MsSUFBSSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNyQyxpRkFBaUY7b0JBQ2pGLGdCQUFnQixJQUFJLEdBQUcsQ0FBQztnQkFDekIsQ0FBQztnQkFDRCxPQUFPLGdCQUFnQixHQUFHLEdBQUcsR0FBRyxpQ0FBdUIsQ0FBQztZQUN6RCxDQUFDO1lBQ0QsT0FBTyxpQ0FBdUIsQ0FBQztRQUNoQyxDQUFDO1FBRUQsSUFBVyxJQUFJO1lBQ2QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFRCxJQUFXLElBQUksQ0FBQyxLQUFhO1lBQzVCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBQ25CLElBQUksSUFBSSxDQUFDLDZCQUE2QixJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixJQUFJLDBDQUEwQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNsSSxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO29CQUNuQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLCtCQUErQixFQUFFLElBQUksQ0FBQyxVQUFVLEVBQy9FLDhHQUE4RyxDQUFDLENBQUM7Z0JBQ2xILENBQUM7Z0JBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoRixDQUFDO1FBQ0YsQ0FBQztRQUVELElBQVcsT0FBTztZQUNqQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN6QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVELElBQVcsT0FBTyxDQUFDLFVBQWlDO1lBQ25ELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRXpCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM5RyxDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBWTtZQUNwQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEIsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsTUFBTSxVQUFVLEdBQUcsSUFBQSxpREFBdUIsRUFBQyxPQUFPLEVBQUUsRUFBRSw4QkFBOEIsRUFBRSxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQyxDQUFDO1lBQzlILE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUN4QyxDQUFDO1FBQ0YsQ0FBQztRQUVPLDhCQUE4QixDQUFDLEtBQWE7WUFDbkQsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO2dCQUN6QyxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFlBQVksQ0FBQztZQUNwRixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNwSixPQUFPLEtBQUs7aUJBQ1YsT0FBTyxDQUFDLHlFQUF5RSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRTtnQkFDdEksTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQztvQkFDcEIsTUFBTSxFQUFFLE1BQU0sSUFBSSxNQUFNO29CQUN4QixJQUFJLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDO2lCQUM5QixDQUFDLENBQUM7Z0JBQ0gsTUFBTSxVQUFVLEdBQUcsSUFBQSxzQkFBWSxFQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDMUYsT0FBTyxHQUFHLFVBQVUsR0FBRyxVQUFVLEdBQUcsUUFBUSxFQUFFLENBQUM7WUFDaEQsQ0FBQyxDQUFDO2lCQUNELE9BQU8sQ0FBQyw2RkFBNkYsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUU7Z0JBQzFKLE1BQU0sR0FBRyxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ3BCLE1BQU0sRUFBRSxNQUFNLElBQUksTUFBTTtvQkFDeEIsSUFBSSxFQUFFLGtCQUFrQixDQUFDLElBQUksQ0FBQztpQkFDOUIsQ0FBQyxDQUFDO2dCQUNILE1BQU0sVUFBVSxHQUFHLElBQUEsc0JBQVksRUFBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQzFGLE9BQU8sR0FBRyxVQUFVLEdBQUcsVUFBVSxHQUFHLFFBQVEsRUFBRSxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUNEO0lBakpELHdDQWlKQztJQUVELFNBQWdCLG9DQUFvQyxDQUFDLFNBQWdDO1FBQ3BGLElBQUksQ0FBQztZQUNKLE1BQU0sT0FBTyxHQUFHLElBQUEscUNBQWdCLEVBQUMsSUFBQSxpQ0FBWSxFQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6RSxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7UUFDdkUsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNSLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztJQUNGLENBQUM7SUFQRCxvRkFPQztJQUVELFNBQVMsaUNBQWlDLENBQUMsU0FBZ0M7UUFDMUUsSUFBSSxDQUFDO1lBQ0osTUFBTSxPQUFPLEdBQUcsSUFBQSxxQ0FBZ0IsRUFBQyxJQUFBLGlDQUFZLEVBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFFRCxPQUFPLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNyRixDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ1IsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO0lBQ0YsQ0FBQztJQUVELE1BQWEsZUFBZ0IsU0FBUSxzQkFBVTtRQU05QyxZQUNDLFdBQXlDLEVBQ3hCLFVBQTZCLEVBQzdCLFNBQXdDLEVBQ3hDLFdBQXdCLEVBQ3hCLG1CQUFrRDtZQUVuRSxLQUFLLEVBQUUsQ0FBQztZQUxTLGVBQVUsR0FBVixVQUFVLENBQW1CO1lBQzdCLGNBQVMsR0FBVCxTQUFTLENBQStCO1lBQ3hDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3hCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBK0I7WUFQbkQsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFpRCxDQUFDO1lBVXJGLElBQUksQ0FBQyxhQUFhLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUVlLE9BQU87WUFDdEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWhCLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUMvQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbkIsQ0FBQztZQUNELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVNLFVBQVUsQ0FDaEIsTUFBcUMsRUFDckMsV0FBbUIsRUFDbkIsT0FBa0Q7WUFFbEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QyxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNiLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFBLG1EQUF5QixFQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsQ0FBQztRQUNGLENBQUM7UUFFTSxhQUFhLENBQ25CLE9BQXNDLEVBQ3RDLFdBQW1CO1lBRW5CLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxpR0FBaUcsQ0FBQyxDQUFDO1FBQ3hJLENBQUM7UUFFTSxnQkFBZ0IsQ0FBQyxNQUFjLEVBQUUsT0FBK0MsRUFBRSxTQUFnQztZQUN4SCxNQUFNLE9BQU8sR0FBRyxJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUM3SixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFcEMsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3RDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVNLGFBQWEsQ0FBQyxNQUFjO1lBQ2xDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTyxVQUFVLENBQUMsTUFBcUM7WUFDdkQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxDQUFDO0tBQ0Q7SUFoRUQsMENBZ0VDO0lBRUQsU0FBZ0IsZUFBZSxDQUFDLFNBQWdDO1FBQy9ELE9BQU8sRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDNUUsQ0FBQztJQUZELDBDQUVDO0lBRUQsU0FBZ0IsdUJBQXVCLENBQ3RDLFNBQWdDLEVBQ2hDLFNBQXdDLEVBQ3hDLE9BQThCO1FBRTlCLE9BQU87WUFDTixpQkFBaUIsRUFBRSxPQUFPLENBQUMsaUJBQWlCO1lBQzVDLGFBQWEsRUFBRSxPQUFPLENBQUMsYUFBYTtZQUNwQyxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDaEMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO1lBQ2hDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxrQkFBa0IsSUFBSSw0QkFBNEIsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDO1NBQ3BHLENBQUM7SUFDSCxDQUFDO0lBWkQsMERBWUM7SUFFRCxTQUFTLGFBQWEsQ0FBQyxPQUErQztRQUNyRSxPQUFPO1lBQ04saUJBQWlCLEVBQUUsT0FBTyxDQUFDLGlCQUFpQjtZQUM1QyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWE7WUFDcEMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO1lBQ2hDLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztZQUNoQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN2RixDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVMsNEJBQTRCLENBQ3BDLFNBQWdDLEVBQ2hDLFNBQXdDO1FBRXhDLE9BQU87WUFDTixHQUFHLENBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUMzRCxTQUFTLENBQUMsaUJBQWlCO1NBQzNCLENBQUM7SUFDSCxDQUFDIn0=