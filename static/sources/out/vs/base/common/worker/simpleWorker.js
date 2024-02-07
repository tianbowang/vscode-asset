/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/strings"], function (require, exports, errors_1, event_1, lifecycle_1, objects_1, platform_1, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = exports.SimpleWorkerServer = exports.SimpleWorkerClient = exports.logOnceWebWorkerWarning = void 0;
    const INITIALIZE = '$initialize';
    let webWorkerWarningLogged = false;
    function logOnceWebWorkerWarning(err) {
        if (!platform_1.isWeb) {
            // running tests
            return;
        }
        if (!webWorkerWarningLogged) {
            webWorkerWarningLogged = true;
            console.warn('Could not create web worker(s). Falling back to loading web worker code in main thread, which might cause UI freezes. Please see https://github.com/microsoft/monaco-editor#faq');
        }
        console.warn(err.message);
    }
    exports.logOnceWebWorkerWarning = logOnceWebWorkerWarning;
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["Request"] = 0] = "Request";
        MessageType[MessageType["Reply"] = 1] = "Reply";
        MessageType[MessageType["SubscribeEvent"] = 2] = "SubscribeEvent";
        MessageType[MessageType["Event"] = 3] = "Event";
        MessageType[MessageType["UnsubscribeEvent"] = 4] = "UnsubscribeEvent";
    })(MessageType || (MessageType = {}));
    class RequestMessage {
        constructor(vsWorker, req, method, args) {
            this.vsWorker = vsWorker;
            this.req = req;
            this.method = method;
            this.args = args;
            this.type = 0 /* MessageType.Request */;
        }
    }
    class ReplyMessage {
        constructor(vsWorker, seq, res, err) {
            this.vsWorker = vsWorker;
            this.seq = seq;
            this.res = res;
            this.err = err;
            this.type = 1 /* MessageType.Reply */;
        }
    }
    class SubscribeEventMessage {
        constructor(vsWorker, req, eventName, arg) {
            this.vsWorker = vsWorker;
            this.req = req;
            this.eventName = eventName;
            this.arg = arg;
            this.type = 2 /* MessageType.SubscribeEvent */;
        }
    }
    class EventMessage {
        constructor(vsWorker, req, event) {
            this.vsWorker = vsWorker;
            this.req = req;
            this.event = event;
            this.type = 3 /* MessageType.Event */;
        }
    }
    class UnsubscribeEventMessage {
        constructor(vsWorker, req) {
            this.vsWorker = vsWorker;
            this.req = req;
            this.type = 4 /* MessageType.UnsubscribeEvent */;
        }
    }
    class SimpleWorkerProtocol {
        constructor(handler) {
            this._workerId = -1;
            this._handler = handler;
            this._lastSentReq = 0;
            this._pendingReplies = Object.create(null);
            this._pendingEmitters = new Map();
            this._pendingEvents = new Map();
        }
        setWorkerId(workerId) {
            this._workerId = workerId;
        }
        sendMessage(method, args) {
            const req = String(++this._lastSentReq);
            return new Promise((resolve, reject) => {
                this._pendingReplies[req] = {
                    resolve: resolve,
                    reject: reject
                };
                this._send(new RequestMessage(this._workerId, req, method, args));
            });
        }
        listen(eventName, arg) {
            let req = null;
            const emitter = new event_1.Emitter({
                onWillAddFirstListener: () => {
                    req = String(++this._lastSentReq);
                    this._pendingEmitters.set(req, emitter);
                    this._send(new SubscribeEventMessage(this._workerId, req, eventName, arg));
                },
                onDidRemoveLastListener: () => {
                    this._pendingEmitters.delete(req);
                    this._send(new UnsubscribeEventMessage(this._workerId, req));
                    req = null;
                }
            });
            return emitter.event;
        }
        handleMessage(message) {
            if (!message || !message.vsWorker) {
                return;
            }
            if (this._workerId !== -1 && message.vsWorker !== this._workerId) {
                return;
            }
            this._handleMessage(message);
        }
        _handleMessage(msg) {
            switch (msg.type) {
                case 1 /* MessageType.Reply */:
                    return this._handleReplyMessage(msg);
                case 0 /* MessageType.Request */:
                    return this._handleRequestMessage(msg);
                case 2 /* MessageType.SubscribeEvent */:
                    return this._handleSubscribeEventMessage(msg);
                case 3 /* MessageType.Event */:
                    return this._handleEventMessage(msg);
                case 4 /* MessageType.UnsubscribeEvent */:
                    return this._handleUnsubscribeEventMessage(msg);
            }
        }
        _handleReplyMessage(replyMessage) {
            if (!this._pendingReplies[replyMessage.seq]) {
                console.warn('Got reply to unknown seq');
                return;
            }
            const reply = this._pendingReplies[replyMessage.seq];
            delete this._pendingReplies[replyMessage.seq];
            if (replyMessage.err) {
                let err = replyMessage.err;
                if (replyMessage.err.$isError) {
                    err = new Error();
                    err.name = replyMessage.err.name;
                    err.message = replyMessage.err.message;
                    err.stack = replyMessage.err.stack;
                }
                reply.reject(err);
                return;
            }
            reply.resolve(replyMessage.res);
        }
        _handleRequestMessage(requestMessage) {
            const req = requestMessage.req;
            const result = this._handler.handleMessage(requestMessage.method, requestMessage.args);
            result.then((r) => {
                this._send(new ReplyMessage(this._workerId, req, r, undefined));
            }, (e) => {
                if (e.detail instanceof Error) {
                    // Loading errors have a detail property that points to the actual error
                    e.detail = (0, errors_1.transformErrorForSerialization)(e.detail);
                }
                this._send(new ReplyMessage(this._workerId, req, undefined, (0, errors_1.transformErrorForSerialization)(e)));
            });
        }
        _handleSubscribeEventMessage(msg) {
            const req = msg.req;
            const disposable = this._handler.handleEvent(msg.eventName, msg.arg)((event) => {
                this._send(new EventMessage(this._workerId, req, event));
            });
            this._pendingEvents.set(req, disposable);
        }
        _handleEventMessage(msg) {
            if (!this._pendingEmitters.has(msg.req)) {
                console.warn('Got event for unknown req');
                return;
            }
            this._pendingEmitters.get(msg.req).fire(msg.event);
        }
        _handleUnsubscribeEventMessage(msg) {
            if (!this._pendingEvents.has(msg.req)) {
                console.warn('Got unsubscribe for unknown req');
                return;
            }
            this._pendingEvents.get(msg.req).dispose();
            this._pendingEvents.delete(msg.req);
        }
        _send(msg) {
            const transfer = [];
            if (msg.type === 0 /* MessageType.Request */) {
                for (let i = 0; i < msg.args.length; i++) {
                    if (msg.args[i] instanceof ArrayBuffer) {
                        transfer.push(msg.args[i]);
                    }
                }
            }
            else if (msg.type === 1 /* MessageType.Reply */) {
                if (msg.res instanceof ArrayBuffer) {
                    transfer.push(msg.res);
                }
            }
            this._handler.sendMessage(msg, transfer);
        }
    }
    /**
     * Main thread side
     */
    class SimpleWorkerClient extends lifecycle_1.Disposable {
        constructor(workerFactory, moduleId, host) {
            super();
            let lazyProxyReject = null;
            this._worker = this._register(workerFactory.create('vs/base/common/worker/simpleWorker', (msg) => {
                this._protocol.handleMessage(msg);
            }, (err) => {
                // in Firefox, web workers fail lazily :(
                // we will reject the proxy
                lazyProxyReject?.(err);
            }));
            this._protocol = new SimpleWorkerProtocol({
                sendMessage: (msg, transfer) => {
                    this._worker.postMessage(msg, transfer);
                },
                handleMessage: (method, args) => {
                    if (typeof host[method] !== 'function') {
                        return Promise.reject(new Error('Missing method ' + method + ' on main thread host.'));
                    }
                    try {
                        return Promise.resolve(host[method].apply(host, args));
                    }
                    catch (e) {
                        return Promise.reject(e);
                    }
                },
                handleEvent: (eventName, arg) => {
                    if (propertyIsDynamicEvent(eventName)) {
                        const event = host[eventName].call(host, arg);
                        if (typeof event !== 'function') {
                            throw new Error(`Missing dynamic event ${eventName} on main thread host.`);
                        }
                        return event;
                    }
                    if (propertyIsEvent(eventName)) {
                        const event = host[eventName];
                        if (typeof event !== 'function') {
                            throw new Error(`Missing event ${eventName} on main thread host.`);
                        }
                        return event;
                    }
                    throw new Error(`Malformed event name ${eventName}`);
                }
            });
            this._protocol.setWorkerId(this._worker.getId());
            // Gather loader configuration
            let loaderConfiguration = null;
            const globalRequire = globalThis.require;
            if (typeof globalRequire !== 'undefined' && typeof globalRequire.getConfig === 'function') {
                // Get the configuration from the Monaco AMD Loader
                loaderConfiguration = globalRequire.getConfig();
            }
            else if (typeof globalThis.requirejs !== 'undefined') {
                // Get the configuration from requirejs
                loaderConfiguration = globalThis.requirejs.s.contexts._.config;
            }
            const hostMethods = (0, objects_1.getAllMethodNames)(host);
            // Send initialize message
            this._onModuleLoaded = this._protocol.sendMessage(INITIALIZE, [
                this._worker.getId(),
                JSON.parse(JSON.stringify(loaderConfiguration)),
                moduleId,
                hostMethods,
            ]);
            // Create proxy to loaded code
            const proxyMethodRequest = (method, args) => {
                return this._request(method, args);
            };
            const proxyListen = (eventName, arg) => {
                return this._protocol.listen(eventName, arg);
            };
            this._lazyProxy = new Promise((resolve, reject) => {
                lazyProxyReject = reject;
                this._onModuleLoaded.then((availableMethods) => {
                    resolve(createProxyObject(availableMethods, proxyMethodRequest, proxyListen));
                }, (e) => {
                    reject(e);
                    this._onError('Worker failed to load ' + moduleId, e);
                });
            });
        }
        getProxyObject() {
            return this._lazyProxy;
        }
        _request(method, args) {
            return new Promise((resolve, reject) => {
                this._onModuleLoaded.then(() => {
                    this._protocol.sendMessage(method, args).then(resolve, reject);
                }, reject);
            });
        }
        _onError(message, error) {
            console.error(message);
            console.info(error);
        }
    }
    exports.SimpleWorkerClient = SimpleWorkerClient;
    function propertyIsEvent(name) {
        // Assume a property is an event if it has a form of "onSomething"
        return name[0] === 'o' && name[1] === 'n' && strings.isUpperAsciiLetter(name.charCodeAt(2));
    }
    function propertyIsDynamicEvent(name) {
        // Assume a property is a dynamic event (a method that returns an event) if it has a form of "onDynamicSomething"
        return /^onDynamic/.test(name) && strings.isUpperAsciiLetter(name.charCodeAt(9));
    }
    function createProxyObject(methodNames, invoke, proxyListen) {
        const createProxyMethod = (method) => {
            return function () {
                const args = Array.prototype.slice.call(arguments, 0);
                return invoke(method, args);
            };
        };
        const createProxyDynamicEvent = (eventName) => {
            return function (arg) {
                return proxyListen(eventName, arg);
            };
        };
        const result = {};
        for (const methodName of methodNames) {
            if (propertyIsDynamicEvent(methodName)) {
                result[methodName] = createProxyDynamicEvent(methodName);
                continue;
            }
            if (propertyIsEvent(methodName)) {
                result[methodName] = proxyListen(methodName, undefined);
                continue;
            }
            result[methodName] = createProxyMethod(methodName);
        }
        return result;
    }
    /**
     * Worker side
     */
    class SimpleWorkerServer {
        constructor(postMessage, requestHandlerFactory) {
            this._requestHandlerFactory = requestHandlerFactory;
            this._requestHandler = null;
            this._protocol = new SimpleWorkerProtocol({
                sendMessage: (msg, transfer) => {
                    postMessage(msg, transfer);
                },
                handleMessage: (method, args) => this._handleMessage(method, args),
                handleEvent: (eventName, arg) => this._handleEvent(eventName, arg)
            });
        }
        onmessage(msg) {
            this._protocol.handleMessage(msg);
        }
        _handleMessage(method, args) {
            if (method === INITIALIZE) {
                return this.initialize(args[0], args[1], args[2], args[3]);
            }
            if (!this._requestHandler || typeof this._requestHandler[method] !== 'function') {
                return Promise.reject(new Error('Missing requestHandler or method: ' + method));
            }
            try {
                return Promise.resolve(this._requestHandler[method].apply(this._requestHandler, args));
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        _handleEvent(eventName, arg) {
            if (!this._requestHandler) {
                throw new Error(`Missing requestHandler`);
            }
            if (propertyIsDynamicEvent(eventName)) {
                const event = this._requestHandler[eventName].call(this._requestHandler, arg);
                if (typeof event !== 'function') {
                    throw new Error(`Missing dynamic event ${eventName} on request handler.`);
                }
                return event;
            }
            if (propertyIsEvent(eventName)) {
                const event = this._requestHandler[eventName];
                if (typeof event !== 'function') {
                    throw new Error(`Missing event ${eventName} on request handler.`);
                }
                return event;
            }
            throw new Error(`Malformed event name ${eventName}`);
        }
        initialize(workerId, loaderConfig, moduleId, hostMethods) {
            this._protocol.setWorkerId(workerId);
            const proxyMethodRequest = (method, args) => {
                return this._protocol.sendMessage(method, args);
            };
            const proxyListen = (eventName, arg) => {
                return this._protocol.listen(eventName, arg);
            };
            const hostProxy = createProxyObject(hostMethods, proxyMethodRequest, proxyListen);
            if (this._requestHandlerFactory) {
                // static request handler
                this._requestHandler = this._requestHandlerFactory(hostProxy);
                return Promise.resolve((0, objects_1.getAllMethodNames)(this._requestHandler));
            }
            if (loaderConfig) {
                // Remove 'baseUrl', handling it is beyond scope for now
                if (typeof loaderConfig.baseUrl !== 'undefined') {
                    delete loaderConfig['baseUrl'];
                }
                if (typeof loaderConfig.paths !== 'undefined') {
                    if (typeof loaderConfig.paths.vs !== 'undefined') {
                        delete loaderConfig.paths['vs'];
                    }
                }
                if (typeof loaderConfig.trustedTypesPolicy !== 'undefined') {
                    // don't use, it has been destroyed during serialize
                    delete loaderConfig['trustedTypesPolicy'];
                }
                // Since this is in a web worker, enable catching errors
                loaderConfig.catchError = true;
                globalThis.require.config(loaderConfig);
            }
            return new Promise((resolve, reject) => {
                // Use the global require to be sure to get the global config
                // ESM-comment-begin
                const req = (globalThis.require || require);
                // ESM-comment-end
                // ESM-uncomment-begin
                // const req = globalThis.require;
                // ESM-uncomment-end
                req([moduleId], (module) => {
                    this._requestHandler = module.create(hostProxy);
                    if (!this._requestHandler) {
                        reject(new Error(`No RequestHandler!`));
                        return;
                    }
                    resolve((0, objects_1.getAllMethodNames)(this._requestHandler));
                }, reject);
            });
        }
    }
    exports.SimpleWorkerServer = SimpleWorkerServer;
    /**
     * Called on the worker side
     * @skipMangle
     */
    function create(postMessage) {
        return new SimpleWorkerServer(postMessage, null);
    }
    exports.create = create;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlV29ya2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi93b3JrZXIvc2ltcGxlV29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUM7SUFlakMsSUFBSSxzQkFBc0IsR0FBRyxLQUFLLENBQUM7SUFDbkMsU0FBZ0IsdUJBQXVCLENBQUMsR0FBUTtRQUMvQyxJQUFJLENBQUMsZ0JBQUssRUFBRSxDQUFDO1lBQ1osZ0JBQWdCO1lBQ2hCLE9BQU87UUFDUixDQUFDO1FBQ0QsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDN0Isc0JBQXNCLEdBQUcsSUFBSSxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUxBQWlMLENBQUMsQ0FBQztRQUNqTSxDQUFDO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQVZELDBEQVVDO0lBRUQsSUFBVyxXQU1WO0lBTkQsV0FBVyxXQUFXO1FBQ3JCLG1EQUFPLENBQUE7UUFDUCwrQ0FBSyxDQUFBO1FBQ0wsaUVBQWMsQ0FBQTtRQUNkLCtDQUFLLENBQUE7UUFDTCxxRUFBZ0IsQ0FBQTtJQUNqQixDQUFDLEVBTlUsV0FBVyxLQUFYLFdBQVcsUUFNckI7SUFDRCxNQUFNLGNBQWM7UUFFbkIsWUFDaUIsUUFBZ0IsRUFDaEIsR0FBVyxFQUNYLE1BQWMsRUFDZCxJQUFXO1lBSFgsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUNoQixRQUFHLEdBQUgsR0FBRyxDQUFRO1lBQ1gsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNkLFNBQUksR0FBSixJQUFJLENBQU87WUFMWixTQUFJLCtCQUF1QjtRQU12QyxDQUFDO0tBQ0w7SUFDRCxNQUFNLFlBQVk7UUFFakIs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