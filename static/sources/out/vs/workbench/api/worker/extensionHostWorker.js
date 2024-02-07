/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/workbench/api/common/extensionHostMain", "vs/workbench/services/extensions/worker/polyfillNestedWorker", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/network", "vs/base/common/uri", "vs/workbench/api/common/extHost.common.services", "vs/workbench/api/worker/extHost.worker.services"], function (require, exports, buffer_1, event_1, extensionHostProtocol_1, extensionHostMain_1, polyfillNestedWorker_1, path, performance, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = void 0;
    const nativeClose = self.close.bind(self);
    self.close = () => console.trace(`'close' has been blocked`);
    const nativePostMessage = postMessage.bind(self);
    self.postMessage = () => console.trace(`'postMessage' has been blocked`);
    function shouldTransformUri(uri) {
        // In principle, we could convert any URI, but we have concerns
        // that parsing https URIs might end up decoding escape characters
        // and result in an unintended transformation
        return /^(file|vscode-remote):/i.test(uri);
    }
    const nativeFetch = fetch.bind(self);
    function patchFetching(asBrowserUri) {
        self.fetch = async function (input, init) {
            if (input instanceof Request) {
                // Request object - massage not supported
                return nativeFetch(input, init);
            }
            if (shouldTransformUri(String(input))) {
                input = (await asBrowserUri(uri_1.URI.parse(String(input)))).toString(true);
            }
            return nativeFetch(input, init);
        };
        self.XMLHttpRequest = class extends XMLHttpRequest {
            open(method, url, async, username, password) {
                (async () => {
                    if (shouldTransformUri(url.toString())) {
                        url = (await asBrowserUri(uri_1.URI.parse(url.toString()))).toString(true);
                    }
                    super.open(method, url, async ?? true, username, password);
                })();
            }
        };
    }
    self.importScripts = () => { throw new Error(`'importScripts' has been blocked`); };
    // const nativeAddEventListener = addEventListener.bind(self);
    self.addEventListener = () => console.trace(`'addEventListener' has been blocked`);
    self['AMDLoader'] = undefined;
    self['NLSLoaderPlugin'] = undefined;
    self['define'] = undefined;
    self['require'] = undefined;
    self['webkitRequestFileSystem'] = undefined;
    self['webkitRequestFileSystemSync'] = undefined;
    self['webkitResolveLocalFileSystemSyncURL'] = undefined;
    self['webkitResolveLocalFileSystemURL'] = undefined;
    if (self.Worker) {
        // make sure new Worker(...) always uses blob: (to maintain current origin)
        const _Worker = self.Worker;
        Worker = function (stringUrl, options) {
            if (/^file:/i.test(stringUrl.toString())) {
                stringUrl = network_1.FileAccess.uriToBrowserUri(uri_1.URI.parse(stringUrl.toString())).toString(true);
            }
            else if (/^vscode-remote:/i.test(stringUrl.toString())) {
                // Supporting transformation of vscode-remote URIs requires an async call to the main thread,
                // but we cannot do this call from within the embedded Worker, and the only way out would be
                // to use templating instead of a function in the web api (`resourceUriProvider`)
                throw new Error(`Creating workers from remote extensions is currently not supported.`);
            }
            // IMPORTANT: bootstrapFn is stringified and injected as worker blob-url. Because of that it CANNOT
            // have dependencies on other functions or variables. Only constant values are supported. Due to
            // that logic of FileAccess.asBrowserUri had to be copied, see `asWorkerBrowserUrl` (below).
            const bootstrapFnSource = (function bootstrapFn(workerUrl) {
                function asWorkerBrowserUrl(url) {
                    if (typeof url === 'string' || url instanceof URL) {
                        return String(url).replace(/^file:\/\//i, 'vscode-file://vscode-app');
                    }
                    return url;
                }
                const nativeFetch = fetch.bind(self);
                self.fetch = function (input, init) {
                    if (input instanceof Request) {
                        // Request object - massage not supported
                        return nativeFetch(input, init);
                    }
                    return nativeFetch(asWorkerBrowserUrl(input), init);
                };
                self.XMLHttpRequest = class extends XMLHttpRequest {
                    open(method, url, async, username, password) {
                        return super.open(method, asWorkerBrowserUrl(url), async ?? true, username, password);
                    }
                };
                const nativeImportScripts = importScripts.bind(self);
                self.importScripts = (...urls) => {
                    nativeImportScripts(...urls.map(asWorkerBrowserUrl));
                };
                nativeImportScripts(workerUrl);
            }).toString();
            const js = `(${bootstrapFnSource}('${stringUrl}'))`;
            options = options || {};
            options.name = options.name || path.basename(stringUrl.toString());
            const blob = new Blob([js], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            return new _Worker(blobUrl, options);
        };
    }
    else {
        self.Worker = class extends polyfillNestedWorker_1.NestedWorker {
            constructor(stringOrUrl, options) {
                super(nativePostMessage, stringOrUrl, { name: path.basename(stringOrUrl.toString()), ...options });
            }
        };
    }
    //#endregion ---
    const hostUtil = new class {
        constructor() {
            this.pid = undefined;
        }
        exit(_code) {
            nativeClose();
        }
    };
    class ExtensionWorker {
        constructor() {
            const channel = new MessageChannel();
            const emitter = new event_1.Emitter();
            let terminating = false;
            // send over port2, keep port1
            nativePostMessage(channel.port2, [channel.port2]);
            channel.port1.onmessage = event => {
                const { data } = event;
                if (!(data instanceof ArrayBuffer)) {
                    console.warn('UNKNOWN data received', data);
                    return;
                }
                const msg = buffer_1.VSBuffer.wrap(new Uint8Array(data, 0, data.byteLength));
                if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 2 /* MessageType.Terminate */)) {
                    // handle terminate-message right here
                    terminating = true;
                    onTerminate('received terminate message from renderer');
                    return;
                }
                // emit non-terminate messages to the outside
                emitter.fire(msg);
            };
            this.protocol = {
                onMessage: emitter.event,
                send: vsbuf => {
                    if (!terminating) {
                        const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                        channel.port1.postMessage(data, [data]);
                    }
                }
            };
        }
    }
    function connectToRenderer(protocol) {
        return new Promise(resolve => {
            const once = protocol.onMessage(raw => {
                once.dispose();
                const initData = JSON.parse(raw.toString());
                protocol.send((0, extensionHostProtocol_1.createMessageOfType)(0 /* MessageType.Initialized */));
                resolve({ protocol, initData });
            });
            protocol.send((0, extensionHostProtocol_1.createMessageOfType)(1 /* MessageType.Ready */));
        });
    }
    let onTerminate = (reason) => nativeClose();
    function isInitMessage(a) {
        return !!a && typeof a === 'object' && a.type === 'vscode.init' && a.data instanceof Map;
    }
    function create() {
        performance.mark(`code/extHost/willConnectToRenderer`);
        const res = new ExtensionWorker();
        return {
            onmessage(message) {
                if (!isInitMessage(message)) {
                    return; // silently ignore foreign messages
                }
                connectToRenderer(res.protocol).then(data => {
                    performance.mark(`code/extHost/didWaitForInitData`);
                    const extHostMain = new extensionHostMain_1.ExtensionHostMain(data.protocol, data.initData, hostUtil, null, message.data);
                    patchFetching(uri => extHostMain.asBrowserUri(uri));
                    onTerminate = (reason) => extHostMain.terminate(reason);
                });
            }
        };
    }
    exports.create = create;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdFdvcmtlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS93b3JrZXIvZXh0ZW5zaW9uSG9zdFdvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvQ2hHLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBRTdELE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRCxJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUV6RSxTQUFTLGtCQUFrQixDQUFDLEdBQVc7UUFDdEMsK0RBQStEO1FBQy9ELGtFQUFrRTtRQUNsRSw2Q0FBNkM7UUFDN0MsT0FBTyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsU0FBUyxhQUFhLENBQUMsWUFBd0M7UUFDOUQsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLFdBQVcsS0FBSyxFQUFFLElBQUk7WUFDdkMsSUFBSSxLQUFLLFlBQVksT0FBTyxFQUFFLENBQUM7Z0JBQzlCLHlDQUF5QztnQkFDekMsT0FBTyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxF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