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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/strings", "vs/base/common/types"], function (require, exports, arrays_1, async_1, buffer_1, cancellation_1, decorators_1, errors_1, event_1, lifecycle_1, marshalling_1, strings, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IPCLogger = exports.ProxyChannel = exports.StaticRouter = exports.getNextTickChannel = exports.getDelayedChannel = exports.IPCClient = exports.IPCServer = exports.ChannelClient = exports.RequestInitiator = exports.ChannelServer = exports.deserialize = exports.serialize = exports.BufferWriter = exports.BufferReader = void 0;
    var RequestType;
    (function (RequestType) {
        RequestType[RequestType["Promise"] = 100] = "Promise";
        RequestType[RequestType["PromiseCancel"] = 101] = "PromiseCancel";
        RequestType[RequestType["EventListen"] = 102] = "EventListen";
        RequestType[RequestType["EventDispose"] = 103] = "EventDispose";
    })(RequestType || (RequestType = {}));
    function requestTypeToStr(type) {
        switch (type) {
            case 100 /* RequestType.Promise */:
                return 'req';
            case 101 /* RequestType.PromiseCancel */:
                return 'cancel';
            case 102 /* RequestType.EventListen */:
                return 'subscribe';
            case 103 /* RequestType.EventDispose */:
                return 'unsubscribe';
        }
    }
    var ResponseType;
    (function (ResponseType) {
        ResponseType[ResponseType["Initialize"] = 200] = "Initialize";
        ResponseType[ResponseType["PromiseSuccess"] = 201] = "PromiseSuccess";
        ResponseType[ResponseType["PromiseError"] = 202] = "PromiseError";
        ResponseType[ResponseType["PromiseErrorObj"] = 203] = "PromiseErrorObj";
        ResponseType[ResponseType["EventFire"] = 204] = "EventFire";
    })(ResponseType || (ResponseType = {}));
    function responseTypeToStr(type) {
        switch (type) {
            case 200 /* ResponseType.Initialize */:
                return `init`;
            case 201 /* ResponseType.PromiseSuccess */:
                return `reply:`;
            case 202 /* ResponseType.PromiseError */:
            case 203 /* ResponseType.PromiseErrorObj */:
                return `replyErr:`;
            case 204 /* ResponseType.EventFire */:
                return `event:`;
        }
    }
    var State;
    (function (State) {
        State[State["Uninitialized"] = 0] = "Uninitialized";
        State[State["Idle"] = 1] = "Idle";
    })(State || (State = {}));
    /**
     * @see https://en.wikipedia.org/wiki/Variable-length_quantity
     */
    function readIntVQL(reader) {
        let value = 0;
        for (let n = 0;; n += 7) {
            const next = reader.read(1);
            value |= (next.buffer[0] & 0b01111111) << n;
            if (!(next.buffer[0] & 0b10000000)) {
                return value;
            }
        }
    }
    const vqlZero = createOneByteBuffer(0);
    /**
     * @see https://en.wikipedia.org/wiki/Variable-length_quantity
     */
    function writeInt32VQL(writer, value) {
        if (value === 0) {
            writer.write(vqlZero);
            return;
        }
        let len = 0;
        for (let v2 = value; v2 !== 0; v2 = v2 >>> 7) {
            len++;
        }
        const scratch = buffer_1.VSBuffer.alloc(len);
        for (let i = 0; value !== 0; i++) {
            scratch.buffer[i] = value & 0b01111111;
            value = value >>> 7;
            if (value > 0) {
                scratch.buffer[i] |= 0b10000000;
            }
        }
        writer.write(scratch);
    }
    class BufferReader {
        constructor(buffer) {
            this.buffer = buffer;
            this.pos = 0;
        }
        read(bytes) {
            const result = this.buffer.slice(this.pos, this.pos + bytes);
            this.pos += result.byteLength;
            return result;
        }
    }
    exports.BufferReader = BufferReader;
    class BufferWriter {
        constructor() {
            this.buffers = [];
        }
        get buffer() {
            return buffer_1.VSBuffer.concat(this.buffers);
        }
        write(buffer) {
            this.buffers.push(buffer);
        }
    }
    exports.BufferWriter = BufferWriter;
    var DataType;
    (function (DataType) {
        DataType[DataType["Undefined"] = 0] = "Undefined";
        DataType[DataType["String"] = 1] = "String";
        DataType[DataType["Buffer"] = 2] = "Buffer";
        DataType[DataType["VSBuffer"] = 3] = "VSBuffer";
        DataType[DataType["Array"] = 4] = "Array";
        DataType[DataType["Object"] = 5] = "Object";
        DataType[DataType["Int"] = 6] = "Int";
    })(DataType || (DataType = {}));
    function createOneByteBuffer(value) {
        const result = buffer_1.VSBuffer.alloc(1);
        result.writeUInt8(value, 0);
        return result;
    }
    const BufferPresets = {
        Undefined: createOneByteBuffer(DataType.Undefined),
        String: createOneByteBuffer(DataType.String),
        Buffer: createOneByteBuffer(DataType.Buffer),
        VSBuffer: createOneByteBuffer(DataType.VSBuffer),
        Array: createOneByteBuffer(DataType.Array),
        Object: createOneByteBuffer(DataType.Object),
        Uint: createOneByteBuffer(DataType.Int),
    };
    const hasBuffer = (typeof Buffer !== 'undefined');
    function serialize(writer, data) {
        if (typeof data === 'undefined') {
            writer.write(BufferPresets.Undefined);
        }
        else if (typeof data === 'string') {
            const buffer = buffer_1.VSBuffer.fromString(data);
            writer.write(BufferPresets.String);
            writeInt32VQL(writer, buffer.byteLength);
            writer.write(buffer);
        }
        else if (hasBuffer && Buffer.isBuffer(data)) {
            const buffer = buffer_1.VSBuffer.wrap(data);
            writer.write(BufferPresets.Buffer);
            writeInt32VQL(writer, buffer.byteLength);
            writer.write(buffer);
        }
        else if (data instanceof buffer_1.VSBuffer) {
            writer.write(BufferPresets.VSBuffer);
            writeInt32VQL(writer, data.byteLength);
            writer.write(data);
        }
        else if (Array.isArray(data)) {
            writer.write(BufferPresets.Array);
            writeInt32VQL(writer, data.length);
            for (const el of data) {
                serialize(writer, el);
            }
        }
        else if (typeof data === 'number' && (data | 0) === data) {
            // write a vql if it's a number that we can do bitwise operations on
            writer.write(BufferPresets.Uint);
            writeInt32VQL(writer, data);
        }
        else {
            const buffer = buffer_1.VSBuffer.fromString(JSON.stringify(data));
            writer.write(BufferPresets.Object);
            writeInt32VQL(writer, buffer.byteLength);
            writer.write(buffer);
        }
    }
    exports.serialize = serialize;
    function deserialize(reader) {
        const type = reader.read(1).readUInt8(0);
        switch (type) {
            case DataType.Undefined: return undefined;
            case DataType.String: return reader.read(readIntVQL(reader)).toString();
            case DataType.Buffer: return reader.read(readIntVQL(reader)).buffer;
            case DataType.VSBuffer: return reader.read(readIntVQL(reader));
            case DataType.Array: {
                const length = readIntVQL(reader);
                const result = [];
                for (let i = 0; i < length; i++) {
                    result.push(deserialize(reader));
                }
                return result;
            }
            case DataType.Object: return JSON.parse(reader.read(readIntVQL(reader)).toString());
            case DataType.Int: return readIntVQL(reader);
        }
    }
    exports.deserialize = deserialize;
    class ChannelServer {
        constructor(protocol, ctx, logger = null, timeoutDelay = 1000) {
            this.protocol = protocol;
            this.ctx = ctx;
            this.logger = logger;
            this.timeoutDelay = timeoutDelay;
            this.channels = new Map();
            this.activeRequests = new Map();
            // Requests might come in for channels which are not yet registered.
            // They will timeout after `timeoutDelay`.
            this.pendingRequests = new Map();
            this.protocolListener = this.protocol.onMessage(msg => this.onRawMessage(msg));
            this.sendResponse({ type: 200 /* ResponseType.Initialize */ });
        }
        registerChannel(channelName, channel) {
            this.channels.set(channelName, channel);
            // https://github.com/microsoft/vscode/issues/72531
            setTimeout(() => this.flushPendingRequests(channelName), 0);
        }
        sendResponse(response) {
            switch (response.type) {
                case 200 /* ResponseType.Initialize */: {
                    const msgLength = this.send([response.type]);
                    this.logger?.logOutgoing(msgLength, 0, 1 /* RequestInitiator.OtherSide */, responseTypeToStr(response.type));
                    return;
                }
                case 201 /* ResponseType.PromiseSuccess */:
                case 202 /* ResponseType.PromiseError */:
                case 204 /* ResponseType.EventFire */:
                case 203 /* ResponseType.PromiseErrorObj */: {
                    const msgLength = this.send([response.type, response.id], response.data);
                    this.logger?.logOutgoing(msgLength, response.id, 1 /* RequestInitiator.OtherSide */, responseTypeToStr(response.type), response.data);
                    return;
                }
            }
        }
        send(header, body = undefined) {
            const writer = new BufferWriter();
            serialize(writer, header);
            serialize(writer, body);
            return this.sendBuffer(writer.buffer);
        }
        sendBuffer(message) {
            try {
                this.protocol.send(message);
                return message.byteLength;
            }
            catch (err) {
                // noop
                return 0;
            }
        }
        onRawMessage(message) {
            const reader = new BufferReader(message);
            const header = deserialize(reader);
            const body = deserialize(reader);
            const type = header[0];
            switch (type) {
                case 100 /* RequestType.Promise */:
                    this.logger?.logIncoming(message.byteLength, header[1], 1 /* RequestInitiator.OtherSide */, `${requestTypeToStr(type)}: ${header[2]}.${header[3]}`, body);
                    return this.onPromise({ type, id: header[1], channelName: header[2], name: header[3], arg: body });
                case 102 /* RequestType.EventListen */:
                    this.logger?.logIncoming(message.byteLength, header[1], 1 /* RequestInitiator.OtherSide */, `${requestTypeToStr(type)}: ${header[2]}.${header[3]}`, body);
                    return this.onEventListen({ type, id: header[1], channelName: header[2], name: header[3], arg: body });
                case 101 /* RequestType.PromiseCancel */:
                    this.logger?.logIncoming(message.byteLength, header[1], 1 /* RequestInitiator.OtherSide */, `${requestTypeToStr(type)}`);
                    return this.disposeActiveRequest({ type, id: header[1] });
                case 103 /* RequestType.EventDispose */:
                    this.logger?.logIncoming(message.byteLength, header[1], 1 /* RequestInitiator.OtherSide */, `${requestTypeToStr(type)}`);
                    return this.disposeActiveRequest({ type, id: header[1] });
            }
        }
        onPromise(request) {
            const channel = this.channels.get(request.channelName);
            if (!channel) {
                this.collectPendingRequest(request);
                return;
            }
            const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
            let promise;
            try {
                promise = channel.call(this.ctx, request.name, request.arg, cancellationTokenSource.token);
            }
            catch (err) {
                promise = Promise.reject(err);
            }
            const id = request.id;
            promise.then(data => {
                this.sendResponse({ id, data, type: 201 /* ResponseType.PromiseSuccess */ });
            }, err => {
                if (err instanceof Error) {
                    this.sendResponse({
                        id, data: {
                            message: err.message,
                            name: err.name,
                            stack: err.stack ? (err.stack.split ? err.stack.split('\n') : err.stack) : undefined
                        }, type: 202 /* ResponseType.PromiseError */
                    });
                }
                else {
                    this.sendResponse({ id, data: err, type: 203 /* ResponseType.PromiseErrorObj */ });
                }
            }).finally(() => {
                disposable.dispose();
                this.activeRequests.delete(request.id);
            });
            const disposable = (0, lifecycle_1.toDisposable)(() => cancellationTokenSource.cancel());
            this.activeRequests.set(request.id, disposable);
        }
        onEventListen(request) {
            const channel = this.channels.get(request.channelName);
            if (!channel) {
                this.collectPendingRequest(request);
                return;
            }
            const id = request.id;
            const event = channel.listen(this.ctx, request.name, request.arg);
            const disposable = event(data => this.sendResponse({ id, data, type: 204 /* ResponseType.EventFire */ }));
            this.activeRequests.set(request.id, disposable);
        }
        disposeActiveRequest(request) {
            const disposable = this.activeRequests.get(request.id);
            if (disposable) {
                disposable.dispose();
                this.activeRequests.delete(request.id);
            }
        }
        collectPendingRequest(request) {
            let pendingRequests = this.pendingRequests.get(request.channelName);
            if (!pendingRequests) {
                pendingRequests = [];
                this.pendingRequests.set(request.channelName, pendingRequests);
            }
            const timer = setTimeout(() => {
                console.error(`Unknown channel: ${request.channelName}`);
                if (request.type === 100 /* RequestType.Promise */) {
                    this.sendResponse({
                        id: request.id,
                        data: { name: 'Unknown channel', message: `Channel name '${request.channelName}' timed out after ${this.timeoutDelay}ms`, stack: undefined },
                        type: 202 /* ResponseType.PromiseError */
                    });
                }
            }, this.timeoutDelay);
            pendingRequests.push({ request, timeoutTimer: timer });
        }
        flushPendingRequests(channelName) {
            const requests = this.pendingRequests.get(channelName);
            if (requests) {
                for (const request of requests) {
                    clearTimeout(request.timeoutTimer);
                    switch (request.request.type) {
                        case 100 /* RequestType.Promise */:
                            this.onPromise(request.request);
                            break;
                        case 102 /* RequestType.EventListen */:
                            this.onEventListen(request.request);
                            break;
                    }
                }
                this.pendingRequests.delete(channelName);
            }
        }
        dispose() {
            if (this.protocolListener) {
                this.protocolListener.dispose();
                this.protocolListener = null;
            }
            (0, lifecycle_1.dispose)(this.activeRequests.values());
            this.activeRequests.clear();
        }
    }
    exports.ChannelServer = ChannelServer;
    var RequestInitiator;
    (function (RequestInitiator) {
        RequestInitiator[RequestInitiator["LocalSide"] = 0] = "LocalSide";
        RequestInitiator[RequestInitiator["OtherSide"] = 1] = "OtherSide";
    })(RequestInitiator || (exports.RequestInitiator = RequestInitiator = {}));
    class ChannelClient {
        constructor(protocol, logger = null) {
            this.protocol = protocol;
            this.isDisposed = false;
            this.state = State.Uninitialized;
            this.activeRequests = new Set();
            this.handlers = new Map();
            this.lastRequestId = 0;
            this._onDidInitialize = new event_1.Emitter();
            this.onDidInitialize = this._onDidInitialize.event;
            this.protocolListener = this.protocol.onMessage(msg => this.onBuffer(msg));
            this.logger = logger;
        }
        getChannel(channelName) {
            const that = this;
            return {
                call(command, arg, cancellationToken) {
                    if (that.isDisposed) {
                        return Promise.reject(new errors_1.CancellationError());
                    }
                    return that.requestPromise(channelName, command, arg, cancellationToken);
                },
                listen(event, arg) {
                    if (that.isDisposed) {
                        return event_1.Event.None;
                    }
                    return that.requestEvent(channelName, event, arg);
                }
            };
        }
        requestPromise(channelName, name, arg, cancellationToken = cancellation_1.CancellationToken.None) {
            const id = this.lastRequestId++;
            const type = 100 /* RequestType.Promise */;
            const request = { id, type, channelName, name, arg };
            if (cancellationToken.isCancellationRequested) {
                return Promise.reject(new errors_1.CancellationError());
            }
            let disposable;
            const result = new Promise((c, e) => {
                if (cancellationToken.isCancellationRequested) {
                    return e(new errors_1.CancellationError());
                }
                const doRequest = () => {
                    const handler = response => {
                        switch (response.type) {
                            case 201 /* ResponseType.PromiseSuccess */:
                                this.handlers.delete(id);
                                c(response.data);
                                break;
                            case 202 /* ResponseType.PromiseError */: {
                                this.handlers.delete(id);
                                const error = new Error(response.data.message);
                                error.stack = Array.isArray(response.data.stack) ? response.data.stack.join('\n') : response.data.stack;
                                error.name = response.data.name;
                                e(error);
                                break;
                            }
                            case 203 /* ResponseType.PromiseErrorObj */:
                                this.handlers.delete(id);
                                e(response.data);
                                break;
                        }
                    };
                    this.handlers.set(id, handler);
                    this.sendRequest(request);
                };
                let uninitializedPromise = null;
                if (this.state === State.Idle) {
                    doRequest();
                }
                else {
                    uninitializedPromise = (0, async_1.createCancelablePromise)(_ => this.whenInitialized());
                    uninitializedPromise.then(() => {
                        uninitializedPromise = null;
                        doRequest();
                    });
                }
                const cancel = () => {
                    if (uninitializedPromise) {
                        uninitializedPromise.cancel();
                        uninitializedPromise = null;
                    }
                    else {
                        this.sendRequest({ id, type: 101 /* RequestType.PromiseCancel */ });
                    }
                    e(new errors_1.CancellationError());
                };
                const cancellationTokenListener = cancellationToken.onCancellationRequested(cancel);
                disposable = (0, lifecycle_1.combinedDisposable)((0, lifecycle_1.toDisposable)(cancel), cancellationTokenListener);
                this.activeRequests.add(disposable);
            });
            return result.finally(() => {
                disposable.dispose();
                this.activeRequests.delete(disposable);
            });
        }
        requestEvent(channelName, name, arg) {
            const id = this.lastRequestId++;
            const type = 102 /* RequestType.EventListen */;
            const request = { id, type, channelName, name, arg };
            let uninitializedPromise = null;
            const emitter = new event_1.Emitter({
                onWillAddFirstListener: () => {
                    uninitializedPromise = (0, async_1.createCancelablePromise)(_ => this.whenInitialized());
                    uninitializedPromise.then(() => {
                        uninitializedPromise = null;
                        this.activeRequests.add(emitter);
                        this.sendRequest(request);
                    });
                },
                onDidRemoveLastListener: () => {
                    if (uninitializedPromise) {
                        uninitializedPromise.cancel();
                        uninitializedPromise = null;
                    }
                    else {
                        this.activeRequests.delete(emitter);
                        this.sendRequest({ id, type: 103 /* RequestType.EventDispose */ });
                    }
                }
            });
            const handler = (res) => emitter.fire(res.data);
            this.handlers.set(id, handler);
            return emitter.event;
        }
        sendRequest(request) {
            switch (request.type) {
                case 100 /* RequestType.Promise */:
                case 102 /* RequestType.EventListen */: {
                    const msgLength = this.send([request.type, request.id, request.channelName, request.name], request.arg);
                    this.logger?.logOutgoing(msgLength, request.id, 0 /* RequestInitiator.LocalSide */, `${requestTypeToStr(request.type)}: ${request.channelName}.${request.name}`, request.arg);
                    return;
                }
                case 101 /* RequestType.PromiseCancel */:
                case 103 /* RequestType.EventDispose */: {
                    const msgLength = this.send([request.type, request.id]);
                    this.logger?.logOutgoing(msgLength, request.id, 0 /* RequestInitiator.LocalSide */, requestTypeToStr(request.type));
                    return;
                }
            }
        }
        send(header, body = undefined) {
            const writer = new BufferWriter();
            serialize(writer, header);
            serialize(writer, body);
            return this.sendBuffer(writer.buffer);
        }
        sendBuffer(message) {
            try {
                this.protocol.send(message);
                return message.byteLength;
            }
            catch (err) {
                // noop
                return 0;
            }
        }
        onBuffer(message) {
            const reader = new BufferReader(message);
            const header = deserialize(reader);
            const body = deserialize(reader);
            const type = header[0];
            switch (type) {
                case 200 /* ResponseType.Initialize */:
                    this.logger?.logIncoming(message.byteLength, 0, 0 /* RequestInitiator.LocalSide */, responseTypeToStr(type));
                    return this.onResponse({ type: header[0] });
                case 201 /* ResponseType.PromiseSuccess */:
                case 202 /* ResponseType.PromiseError */:
                case 204 /* ResponseType.EventFire */:
                case 203 /* ResponseType.PromiseErrorObj */:
                    this.logger?.logIncoming(message.byteLength, header[1], 0 /* RequestInitiator.LocalSide */, responseTypeToStr(type), body);
                    return this.onResponse({ type: header[0], id: header[1], data: body });
            }
        }
        onResponse(response) {
            if (response.type === 200 /* ResponseType.Initialize */) {
                this.state = State.Idle;
                this._onDidInitialize.fire();
                return;
            }
            const handler = this.handlers.get(response.id);
            handler?.(response);
        }
        get onDidInitializePromise() {
            return event_1.Event.toPromise(this.onDidInitialize);
        }
        whenInitialized() {
            if (this.state === State.Idle) {
                return Promise.resolve();
            }
            else {
                return this.onDidInitializePromise;
            }
        }
        dispose() {
            this.isDisposed = true;
            if (this.protocolListener) {
                this.protocolListener.dispose();
                this.protocolListener = null;
            }
            (0, lifecycle_1.dispose)(this.activeRequests.values());
            this.activeRequests.clear();
        }
    }
    exports.ChannelClient = ChannelClient;
    __decorate([
        decorators_1.memoize
    ], ChannelClient.prototype, "onDidInitializePromise", null);
    /**
     * An `IPCServer` is both a channel server and a routing channel
     * client.
     *
     * As the owner of a protocol, you should extend both this
     * and the `IPCClient` classes to get IPC implementations
     * for your protocol.
     */
    class IPCServer {
        get connections() {
            const result = [];
            this._connections.forEach(ctx => result.push(ctx));
            return result;
        }
        constructor(onDidClientConnect) {
            this.channels = new Map();
            this._connections = new Set();
            this._onDidAddConnection = new event_1.Emitter();
            this.onDidAddConnection = this._onDidAddConnection.event;
            this._onDidRemoveConnection = new event_1.Emitter();
            this.onDidRemoveConnection = this._onDidRemoveConnection.event;
            this.disposables = new lifecycle_1.DisposableStore();
            this.disposables.add(onDidClientConnect(({ protocol, onDidClientDisconnect }) => {
                const onFirstMessage = event_1.Event.once(protocol.onMessage);
                this.disposables.add(onFirstMessage(msg => {
                    const reader = new BufferReader(msg);
                    const ctx = deserialize(reader);
                    const channelServer = new ChannelServer(protocol, ctx);
                    const channelClient = new ChannelClient(protocol);
                    this.channels.forEach((channel, name) => channelServer.registerChannel(name, channel));
                    const connection = { channelServer, channelClient, ctx };
                    this._connections.add(connection);
                    this._onDidAddConnection.fire(connection);
                    this.disposables.add(onDidClientDisconnect(() => {
                        channelServer.dispose();
                        channelClient.dispose();
                        this._connections.delete(connection);
                        this._onDidRemoveConnection.fire(connection);
                    }));
                }));
            }));
        }
        getChannel(channelName, routerOrClientFilter) {
            const that = this;
            return {
                call(command, arg, cancellationToken) {
                    let connectionPromise;
                    if ((0, types_1.isFunction)(routerOrClientFilter)) {
                        // when no router is provided, we go random client picking
                        const connection = (0, arrays_1.getRandomElement)(that.connections.filter(routerOrClientFilter));
                        connectionPromise = connection
                            // if we found a client, let's call on it
                            ? Promise.resolve(connection)
                            // else, let's wait for a client to come along
                            : event_1.Event.toPromise(event_1.Event.filter(that.onDidAddConnection, routerOrClientFilter));
                    }
                    else {
                        connectionPromise = routerOrClientFilter.routeCall(that, command, arg);
                    }
                    const channelPromise = connectionPromise
                        .then(connection => connection.channelClient.getChannel(channelName));
                    return getDelayedChannel(channelPromise)
                        .call(command, arg, cancellationToken);
                },
                listen(event, arg) {
                    if ((0, types_1.isFunction)(routerOrClientFilter)) {
                        return that.getMulticastEvent(channelName, routerOrClientFilter, event, arg);
                    }
                    const channelPromise = routerOrClientFilter.routeEvent(that, event, arg)
                        .then(connection => connection.channelClient.getChannel(channelName));
                    return getDelayedChannel(channelPromise)
                        .listen(event, arg);
                }
            };
        }
        getMulticastEvent(channelName, clientFilter, eventName, arg) {
            const that = this;
            let disposables;
            // Create an emitter which hooks up to all clients
            // as soon as first listener is added. It also
            // disconnects from all clients as soon as the last listener
            // is removed.
            const emitter = new event_1.Emitter({
                onWillAddFirstListener: () => {
                    disposables = new lifecycle_1.DisposableStore();
                    // The event multiplexer is useful since the active
                    // client list is dynamic. We need to hook up and disconnection
                    // to/from clients as they come and go.
                    const eventMultiplexer = new event_1.EventMultiplexer();
                    const map = new Map();
                    const onDidAddConnection = (connection) => {
                        const channel = connection.channelClient.getChannel(channelName);
                        const event = channel.listen(eventName, arg);
                        const disposable = eventMultiplexer.add(event);
                        map.set(connection, disposable);
                    };
                    const onDidRemoveConnection = (connection) => {
                        const disposable = map.get(connection);
                        if (!disposable) {
                            return;
                        }
                        disposable.dispose();
                        map.delete(connection);
                    };
                    that.connections.filter(clientFilter).forEach(onDidAddConnection);
                    event_1.Event.filter(that.onDidAddConnection, clientFilter)(onDidAddConnection, undefined, disposables);
                    that.onDidRemoveConnection(onDidRemoveConnection, undefined, disposables);
                    eventMultiplexer.event(emitter.fire, emitter, disposables);
                    disposables.add(eventMultiplexer);
                },
                onDidRemoveLastListener: () => {
                    disposables?.dispose();
                    disposables = undefined;
                }
            });
            return emitter.event;
        }
        registerChannel(channelName, channel) {
            this.channels.set(channelName, channel);
            for (const connection of this._connections) {
                connection.channelServer.registerChannel(channelName, channel);
            }
        }
        dispose() {
            this.disposables.dispose();
            for (const connection of this._connections) {
                connection.channelClient.dispose();
                connection.channelServer.dispose();
            }
            this._connections.clear();
            this.channels.clear();
            this._onDidAddConnection.dispose();
            this._onDidRemoveConnection.dispose();
        }
    }
    exports.IPCServer = IPCServer;
    /**
     * An `IPCClient` is both a channel client and a channel server.
     *
     * As the owner of a protocol, you should extend both this
     * and the `IPCServer` classes to get IPC implementations
     * for your protocol.
     */
    class IPCClient {
        constructor(protocol, ctx, ipcLogger = null) {
            const writer = new BufferWriter();
            serialize(writer, ctx);
            protocol.send(writer.buffer);
            this.channelClient = new ChannelClient(protocol, ipcLogger);
            this.channelServer = new ChannelServer(protocol, ctx, ipcLogger);
        }
        getChannel(channelName) {
            return this.channelClient.getChannel(channelName);
        }
        registerChannel(channelName, channel) {
            this.channelServer.registerChannel(channelName, channel);
        }
        dispose() {
            this.channelClient.dispose();
            this.channelServer.dispose();
        }
    }
    exports.IPCClient = IPCClient;
    function getDelayedChannel(promise) {
        return {
            call(command, arg, cancellationToken) {
                return promise.then(c => c.call(command, arg, cancellationToken));
            },
            listen(event, arg) {
                const relay = new event_1.Relay();
                promise.then(c => relay.input = c.listen(event, arg));
                return relay.event;
            }
        };
    }
    exports.getDelayedChannel = getDelayedChannel;
    function getNextTickChannel(channel) {
        let didTick = false;
        return {
            call(command, arg, cancellationToken) {
                if (didTick) {
                    return channel.call(command, arg, cancellationToken);
                }
                return (0, async_1.timeout)(0)
                    .then(() => didTick = true)
                    .then(() => channel.call(command, arg, cancellationToken));
            },
            listen(event, arg) {
                if (didTick) {
                    return channel.listen(event, arg);
                }
                const relay = new event_1.Relay();
                (0, async_1.timeout)(0)
                    .then(() => didTick = true)
                    .then(() => relay.input = channel.listen(event, arg));
                return relay.event;
            }
        };
    }
    exports.getNextTickChannel = getNextTickChannel;
    class StaticRouter {
        constructor(fn) {
            this.fn = fn;
        }
        routeCall(hub) {
            return this.route(hub);
        }
        routeEvent(hub) {
            return this.route(hub);
        }
        async route(hub) {
            for (const connection of hub.connections) {
                if (await Promise.resolve(this.fn(connection.ctx))) {
                    return Promise.resolve(connection);
                }
            }
            await event_1.Event.toPromise(hub.onDidAddConnection);
            return await this.route(hub);
        }
    }
    exports.StaticRouter = StaticRouter;
    /**
     * Use ProxyChannels to automatically wrapping and unwrapping
     * services to/from IPC channels, instead of manually wrapping
     * each service method and event.
     *
     * Restrictions:
     * - If marshalling is enabled, only `URI` and `RegExp` is converted
     *   automatically for you
     * - Events must follow the naming convention `onUpperCase`
     * - `CancellationToken` is currently not supported
     * - If a context is provided, you can use `AddFirstParameterToFunctions`
     *   utility to signal this in the receiving side type
     */
    var ProxyChannel;
    (function (ProxyChannel) {
        function fromService(service, disposables, options) {
            const handler = service;
            const disableMarshalling = options && options.disableMarshalling;
            // Buffer any event that should be supported by
            // iterating over all property keys and finding them
            const mapEventNameToEvent = new Map();
            for (const key in handler) {
                if (propertyIsEvent(key)) {
                    mapEventNameToEvent.set(key, event_1.Event.buffer(handler[key], true, undefined, disposables));
                }
            }
            return new class {
                listen(_, event, arg) {
                    const eventImpl = mapEventNameToEvent.get(event);
                    if (eventImpl) {
                        return eventImpl;
                    }
                    if (propertyIsDynamicEvent(event)) {
                        const target = handler[event];
                        if (typeof target === 'function') {
                            return target.call(handler, arg);
                        }
                    }
                    throw new errors_1.ErrorNoTelemetry(`Event not found: ${event}`);
                }
                call(_, command, args) {
                    const target = handler[command];
                    if (typeof target === 'function') {
                        // Revive unless marshalling disabled
                        if (!disableMarshalling && Array.isArray(args)) {
                            for (let i = 0; i < args.length; i++) {
                                args[i] = (0, marshalling_1.revive)(args[i]);
                            }
                        }
                        let res = target.apply(handler, args);
                        if (!(res instanceof Promise)) {
                            res = Promise.resolve(res);
                        }
                        return res;
                    }
                    throw new errors_1.ErrorNoTelemetry(`Method not found: ${command}`);
                }
            };
        }
        ProxyChannel.fromService = fromService;
        function toService(channel, options) {
            const disableMarshalling = options && options.disableMarshalling;
            return new Proxy({}, {
                get(_target, propKey) {
                    if (typeof propKey === 'string') {
                        // Check for predefined values
                        if (options?.properties?.has(propKey)) {
                            return options.properties.get(propKey);
                        }
                        // Dynamic Event
                        if (propertyIsDynamicEvent(propKey)) {
                            return function (arg) {
                                return channel.listen(propKey, arg);
                            };
                        }
                        // Event
                        if (propertyIsEvent(propKey)) {
                            return channel.listen(propKey);
                        }
                        // Function
                        return async function (...args) {
                            // Add context if any
                            let methodArgs;
                            if (options && !(0, types_1.isUndefinedOrNull)(options.context)) {
                                methodArgs = [options.context, ...args];
                            }
                            else {
                                methodArgs = args;
                            }
                            const result = await channel.call(propKey, methodArgs);
                            // Revive unless marshalling disabled
                            if (!disableMarshalling) {
                                return (0, marshalling_1.revive)(result);
                            }
                            return result;
                        };
                    }
                    throw new errors_1.ErrorNoTelemetry(`Property not found: ${String(propKey)}`);
                }
            });
        }
        ProxyChannel.toService = toService;
        function propertyIsEvent(name) {
            // Assume a property is an event if it has a form of "onSomething"
            return name[0] === 'o' && name[1] === 'n' && strings.isUpperAsciiLetter(name.charCodeAt(2));
        }
        function propertyIsDynamicEvent(name) {
            // Assume a property is a dynamic event (a method that returns an event) if it has a form of "onDynamicSomething"
            return /^onDynamic/.test(name) && strings.isUpperAsciiLetter(name.charCodeAt(9));
        }
    })(ProxyChannel || (exports.ProxyChannel = ProxyChannel = {}));
    const colorTables = [
        ['#2977B1', '#FC802D', '#34A13A', '#D3282F', '#9366BA'],
        ['#8B564C', '#E177C0', '#7F7F7F', '#BBBE3D', '#2EBECD']
    ];
    function prettyWithoutArrays(data) {
        if (Array.isArray(data)) {
            return data;
        }
        if (data && typeof data === 'object' && typeof data.toString === 'function') {
            const result = data.toString();
            if (result !== '[object Object]') {
                return result;
            }
        }
        return data;
    }
    function pretty(data) {
        if (Array.isArray(data)) {
            return data.map(prettyWithoutArrays);
        }
        return prettyWithoutArrays(data);
    }
    function logWithColors(direction, totalLength, msgLength, req, initiator, str, data) {
        data = pretty(data);
        const colorTable = colorTables[initiator];
        const color = colorTable[req % colorTable.length];
        let args = [`%c[${direction}]%c[${String(totalLength).padStart(7, ' ')}]%c[len: ${String(msgLength).padStart(5, ' ')}]%c${String(req).padStart(5, ' ')} - ${str}`, 'color: darkgreen', 'color: grey', 'color: grey', `color: ${color}`];
        if (/\($/.test(str)) {
            args = args.concat(data);
            args.push(')');
        }
        else {
            args.push(data);
        }
        console.log.apply(console, args);
    }
    class IPCLogger {
        constructor(_outgoingPrefix, _incomingPrefix) {
            this._outgoingPrefix = _outgoingPrefix;
            this._incomingPrefix = _incomingPrefix;
            this._totalIncoming = 0;
            this._totalOutgoing = 0;
        }
        logOutgoing(msgLength, requestId, initiator, str, data) {
            this._totalOutgoing += msgLength;
            logWithColors(this._outgoingPrefix, this._totalOutgoing, msgLength, requestId, initiator, str, data);
        }
        logIncoming(msgLength, requestId, initiator, str, data) {
            this._totalIncoming += msgLength;
            logWithColors(this._incomingPrefix, this._totalIncoming, msgLength, requestId, initiator, str, data);
        }
    }
    exports.IPCLogger = IPCLogger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3BhcnRzL2lwYy9jb21tb24vaXBjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7OztJQW1DaEcsSUFBVyxXQUtWO0lBTEQsV0FBVyxXQUFXO1FBQ3JCLHFEQUFhLENBQUE7UUFDYixpRUFBbUIsQ0FBQTtRQUNuQiw2REFBaUIsQ0FBQTtRQUNqQiwrREFBa0IsQ0FBQTtJQUNuQixDQUFDLEVBTFUsV0FBVyxLQUFYLFdBQVcsUUFLckI7SUFFRCxTQUFTLGdCQUFnQixDQUFDLElBQWlCO1FBQzFDLFFBQVEsSUFBSSxFQUFFLENBQUM7WUFDZDtnQkFDQyxPQUFPLEtBQUssQ0FBQztZQUNkO2dCQUNDLE9BQU8sUUFBUSxDQUFDO1lBQ2pCO2dCQUNDLE9BQU8sV0FBVyxDQUFDO1lBQ3BCO2dCQUNDLE9BQU8sYUFBYSxDQUFDO1FBQ3ZCLENBQUM7SUFDRixDQUFDO0lBUUQsSUFBVyxZQU1WO0lBTkQsV0FBVyxZQUFZO1FBQ3RCLDZEQUFnQixDQUFBO1FBQ2hCLHFFQUFvQixDQUFBO1FBQ3BCLGlFQUFrQixDQUFBO1FBQ2xCLHVFQUFxQixDQUFBO1FBQ3JCLDJEQUFlLENBQUE7SUFDaEIsQ0FBQyxFQU5VLFlBQVksS0FBWixZQUFZLFFBTXRCO0lBRUQsU0FBUyxpQkFBaUIsQ0FBQyxJQUFrQjtRQUM1QyxRQUFRLElBQUksRUFBRSxDQUFDO1lBQ2Q7Z0JBQ0MsT0FBTyxNQUFNLENBQUM7WUFDZjtnQkFDQyxPQUFPLFFBQVEsQ0FBQztZQUNqQix5Q0FBK0I7WUFDL0I7Z0JBQ0MsT0FBTyxXQUFXLENBQUM7WUFDcEI7Z0JBQ0MsT0FBTyxRQUFRLENBQUM7UUFDbEIsQ0FBQztJQUNGLENBQUM7SUFzQkQsSUFBSyxLQUdKO0lBSEQsV0FBSyxLQUFLO1FBQ1QsbURBQWEsQ0FBQTtRQUNi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