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
define(["require", "exports", "crypto", "fs", "net", "perf_hooks", "url", "vs/base/common/amd", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/extpath", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/node/osReleaseInfo", "vs/base/node/ports", "vs/base/node/unc", "vs/base/parts/ipc/common/ipc.net", "vs/base/parts/ipc/node/ipc.net", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteHosts", "vs/platform/telemetry/common/telemetry", "vs/server/node/extensionHostConnection", "vs/server/node/remoteExtensionManagement", "vs/server/node/serverConnectionToken", "vs/server/node/serverEnvironmentService", "vs/server/node/serverServices", "vs/server/node/webClientServer"], function (require, exports, crypto, fs, net, perf_hooks_1, url, amd_1, buffer_1, errors_1, extpath_1, lifecycle_1, network_1, path_1, perf, platform, strings_1, uri_1, uuid_1, osReleaseInfo_1, ports_1, unc_1, ipc_net_1, ipc_net_2, configuration_1, instantiation_1, log_1, productService_1, remoteHosts_1, telemetry_1, extensionHostConnection_1, remoteExtensionManagement_1, serverConnectionToken_1, serverEnvironmentService_1, serverServices_1, webClientServer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createServer = void 0;
    const SHUTDOWN_TIMEOUT = 5 * 60 * 1000;
    let RemoteExtensionHostAgentServer = class RemoteExtensionHostAgentServer extends lifecycle_1.Disposable {
        constructor(_socketServer, _connectionToken, _vsdaMod, hasWebClient, _environmentService, _productService, _logService, _instantiationService) {
            super();
            this._socketServer = _socketServer;
            this._connectionToken = _connectionToken;
            this._vsdaMod = _vsdaMod;
            this._environmentService = _environmentService;
            this._productService = _productService;
            this._logService = _logService;
            this._instantiationService = _instantiationService;
            this._webEndpointOriginChecker = WebEndpointOriginChecker.create(this._productService);
            this._serverRootPath = (0, remoteHosts_1.getRemoteServerRootPath)(_productService);
            this._extHostConnections = Object.create(null);
            this._managementConnections = Object.create(null);
            this._allReconnectionTokens = new Set();
            this._webClientServer = (hasWebClient
                ? this._instantiationService.createInstance(webClientServer_1.WebClientServer, this._connectionToken)
                : null);
            this._logService.info(`Extension host agent started.`);
            this._waitThenShutdown(true);
        }
        async handleRequest(req, res) {
            // Only serve GET requests
            if (req.method !== 'GET') {
                return (0, webClientServer_1.serveError)(req, res, 405, `Unsupported method ${req.method}`);
            }
            if (!req.url) {
                return (0, webClientServer_1.serveError)(req, res, 400, `Bad request.`);
            }
            const parsedUrl = url.parse(req.url, true);
            let pathname = parsedUrl.pathname;
            if (!pathname) {
                return (0, webClientServer_1.serveError)(req, res, 400, `Bad request.`);
            }
            // for now accept all paths, with or without server root path
            if (pathname.startsWith(this._serverRootPath) && pathname.charCodeAt(this._serverRootPath.length) === 47 /* CharCode.Slash */) {
                pathname = pathname.substring(this._serverRootPath.length);
            }
            // Version
            if (pathname === '/version') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                return void res.end(this._productService.commit || '');
            }
            // Delay shutdown
            if (pathname === '/delay-shutdown') {
                this._delayShutdown();
                res.writeHead(200);
                return void res.end('OK');
            }
            if (!(0, serverConnectionToken_1.requestHasValidConnectionToken)(this._connectionToken, req, parsedUrl)) {
                // invalid connection token
                return (0, webClientServer_1.serveError)(req, res, 403, `Forbidden.`);
            }
            if (pathname === '/vscode-remote-resource') {
                // Handle HTTP requests for resources rendered in the rich client (images, fonts, etc.)
                // These resources could be files shipped with extensions or even workspace files.
                const desiredPath = parsedUrl.query['path'];
                if (typeof desiredPath !== 'string') {
                    return (0, webClientServer_1.serveError)(req, res, 400, `Bad request.`);
                }
                let filePath;
                try {
                    filePath = uri_1.URI.from({ scheme: network_1.Schemas.file, path: desiredPath }).fsPath;
                }
                catch (err) {
                    return (0, webClientServer_1.serveError)(req, res, 400, `Bad request.`);
                }
                const responseHeaders = Object.create(null);
                if (this._environmentService.isBuilt) {
                    if ((0, extpath_1.isEqualOrParent)(filePath, this._environmentService.builtinExtensionsPath, !platform.isLinux)
                        || (0, extpath_1.isEqualOrParent)(filePath, this._environmentService.extensionsPath, !platform.isLinux)) {
                        responseHeaders['Cache-Control'] = 'public, max-age=31536000';
                    }
                }
                // Allow cross origin requests from the web worker extension host
                responseHeaders['Vary'] = 'Origin';
                const requestOrigin = req.headers['origin'];
                if (requestOrigin && this._webEndpointOriginChecker.matches(requestOrigin)) {
                    responseHeaders['Access-Control-Allow-Origin'] = requestOrigin;
                }
                return (0, webClientServer_1.serveFile)(filePath, 1 /* CacheControl.ETAG */, this._logService, req, res, responseHeaders);
            }
            // workbench web UI
            if (this._webClientServer) {
                this._webClientServer.handle(req, res, parsedUrl);
                return;
            }
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return void res.end('Not found');
        }
        handleUpgrade(req, socket) {
            let reconnectionToken = (0, uuid_1.generateUuid)();
            let isReconnection = false;
            let skipWebSocketFrames = false;
            if (req.url) {
                const query = url.parse(req.url, true).query;
                if (typeof query.reconnectionToken === 'string') {
                    reconnectionToken = query.reconnectionToken;
                }
                if (query.reconnection === 'true') {
                    isReconnection = true;
                }
                if (query.skipWebSocketFrames === 'true') {
                    skipWebSocketFrames = true;
                }
            }
            if (req.headers['upgrade'] === undefined || req.headers['upgrade'].toLowerCase() !== 'websocket') {
                socket.end('HTTP/1.1 400 Bad Request');
                return;
            }
            // https://tools.ietf.org/html/rfc6455#section-4
            const requestNonce = req.headers['sec-websocket-key'];
            const hash = crypto.createHash('sha1'); // CodeQL [SM04514] SHA1 must be used here to respect the WebSocket protocol specification
            hash.update(requestNonce + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
            const responseNonce = hash.digest('base64');
            const responseHeaders = [
                `HTTP/1.1 101 Switching Protocols`,
                `Upgrade: websocket`,
                `Connection: Upgrade`,
                `Sec-WebSocket-Accept: ${responseNonce}`
            ];
            // See https://tools.ietf.org/html/rfc7692#page-12
            let permessageDeflate = false;
            if (!skipWebSocketFrames && !this._environmentService.args['disable-websocket-compression'] && req.headers['sec-websocket-extensions']) {
                const websocketExtensionOptions = Array.isArray(req.headers['sec-websocket-extensions']) ? req.headers['sec-websocket-extensions'] : [req.headers['sec-websocket-extensions']];
                for (const websocketExtensionOption of websocketExtensionOptions) {
                    if (/\b((server_max_window_bits)|(server_no_context_takeover)|(client_no_context_takeover))\b/.test(websocketExtensionOption)) {
                        // sorry, the server does not support zlib parameter tweaks
                        continue;
                    }
                    if (/\b(permessage-deflate)\b/.test(websocketExtensionOption)) {
                        permessageDeflate = true;
                        responseHeaders.push(`Sec-WebSocket-Extensions: permessage-deflate`);
                        break;
                    }
                    if (/\b(x-webkit-deflate-frame)\b/.test(websocketExtensionOption)) {
                        permessageDeflate = true;
                        responseHeaders.push(`Sec-WebSocket-Extensions: x-webkit-deflate-frame`);
                        break;
                    }
                }
            }
            socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');
            // Never timeout this socket due to inactivity!
            socket.setTimeout(0);
            // Disable Nagle's algorithm
            socket.setNoDelay(true);
            // Finally!
            if (skipWebSocketFrames) {
                this._handleWebSocketConnection(new ipc_net_2.NodeSocket(socket, `server-connection-${reconnectionToken}`), isReconnection, reconnectionToken);
            }
            else {
                this._handleWebSocketConnection(new ipc_net_2.WebSocketNodeSocket(new ipc_net_2.NodeSocket(socket, `server-connection-${reconnectionToken}`), permessageDeflate, null, true), isReconnection, reconnectionToken);
            }
        }
        handleServerError(err) {
            this._logService.error(`Error occurred in server`);
            this._logService.error(err);
        }
        // Eventually cleanup
        _getRemoteAddress(socket) {
            let _socket;
            if (socket instanceof ipc_net_2.NodeSocket) {
                _socket = socket.socket;
            }
            else {
                _socket = socket.socket.socket;
            }
            return _socket.remoteAddress || `<unknown>`;
        }
        async _rejectWebSocketConnection(logPrefix, protocol, reason) {
            const socket = protocol.getSocket();
            this._logService.error(`${logPrefix} ${reason}.`);
            const errMessage = {
                type: 'error',
                reason: reason
            };
            protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(errMessage)));
            protocol.dispose();
            await socket.drain();
            socket.dispose();
        }
        /**
         * NOTE: Avoid using await in this method!
         * The problem is that await introduces a process.nextTick due to the implicit Promise.then
         * This can lead to some bytes being received and interpreted and a control message being emitted before the next listener has a chance to be registered.
         */
        _handleWebSocketConnection(socket, isReconnection, reconnectionToken) {
            const remoteAddress = this._getRemoteAddress(socket);
            const logPrefix = `[${remoteAddress}][${reconnectionToken.substr(0, 8)}]`;
            const protocol = new ipc_net_1.PersistentProtocol({ socket });
            const validator = this._vsdaMod ? new this._vsdaMod.validator() : null;
            const signer = this._vsdaMod ? new this._vsdaMod.signer() : null;
            let State;
            (function (State) {
                State[State["WaitingForAuth"] = 0] = "WaitingForAuth";
                State[State["WaitingForConnectionType"] = 1] = "WaitingForConnectionType";
                State[State["Done"] = 2] = "Done";
                State[State["Error"] = 3] = "Error";
            })(State || (State = {}));
            let state = 0 /* State.WaitingForAuth */;
            const rejectWebSocketConnection = (msg) => {
                state = 3 /* State.Error */;
                listener.dispose();
                this._rejectWebSocketConnection(logPrefix, protocol, msg);
            };
            const listener = protocol.onControlMessage((raw) => {
                if (state === 0 /* State.WaitingForAuth */) {
                    let msg1;
                    try {
                        msg1 = JSON.parse(raw.toString());
                    }
                    catch (err) {
                        return rejectWebSocketConnection(`Malformed first message`);
                    }
                    if (msg1.type !== 'auth') {
                        return rejectWebSocketConnection(`Invalid first message`);
                    }
                    if (this._connectionToken.type === 2 /* ServerConnectionTokenType.Mandatory */ && !this._connectionToken.validate(msg1.auth)) {
                        return rejectWebSocketConnection(`Unauthorized client refused: auth mismatch`);
                    }
                    // Send `sign` request
                    let signedData = (0, uuid_1.generateUuid)();
                    if (signer) {
                        try {
                            signedData = signer.sign(msg1.data);
                        }
                        catch (e) {
                        }
                    }
                    let someText = (0, uuid_1.generateUuid)();
                    if (validator) {
                        try {
                            someText = validator.createNewMessage(someText);
                        }
                        catch (e) {
                        }
                    }
                    const signRequest = {
                        type: 'sign',
                        data: someText,
                        signedData: signedData
                    };
                    protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(signRequest)));
                    state = 1 /* State.WaitingForConnectionType */;
                }
                else if (state === 1 /* State.WaitingForConnectionType */) {
                    let msg2;
                    try {
                        msg2 = JSON.parse(raw.toString());
                    }
                    catch (err) {
                        return rejectWebSocketConnection(`Malformed second message`);
                    }
                    if (msg2.type !== 'connectionType') {
                        return rejectWebSocketConnection(`Invalid second message`);
                    }
                    if (typeof msg2.signedData !== 'string') {
                        return rejectWebSocketConnection(`Invalid second message field type`);
                    }
                    const rendererCommit = msg2.commit;
                    const myCommit = this._productService.commit;
                    if (rendererCommit && myCommit) {
                        // Running in the built version where commits are defined
                        if (rendererCommit !== myCommit) {
                            return rejectWebSocketConnection(`Client refused: version mismatch`);
                        }
                    }
                    let valid = false;
                    if (!validator) {
                        valid = true;
                    }
                    else if (this._connectionToken.validate(msg2.signedData)) {
                        // web client
                        valid = true;
                    }
                    else {
                        try {
                            valid = validator.validate(msg2.signedData) === 'ok';
                        }
                        catch (e) {
                        }
                    }
                    if (!valid) {
                        if (this._environmentService.isBuilt) {
                            return rejectWebSocketConnection(`Unauthorized client refused`);
                        }
                        else {
                            this._logService.error(`${logPrefix} Unauthorized client handshake failed but we proceed because of dev mode.`);
                        }
                    }
                    // We have received a new connection.
                    // This indicates that the server owner has connectivity.
                    // Therefore we will shorten the reconnection grace period for disconnected connections!
                    for (const key in this._managementConnections) {
                        const managementConnection = this._managementConnections[key];
                        managementConnection.shortenReconnectionGraceTimeIfNecessary();
                    }
                    for (const key in this._extHostConnections) {
                        const extHostConnection = this._extHostConnections[key];
                        extHostConnection.shortenReconnectionGraceTimeIfNecessary();
                    }
                    state = 2 /* State.Done */;
                    listener.dispose();
                    this._handleConnectionType(remoteAddress, logPrefix, protocol, socket, isReconnection, reconnectionToken, msg2);
                }
            });
        }
        async _handleConnectionType(remoteAddress, _logPrefix, protocol, socket, isReconnection, reconnectionToken, msg) {
            const logPrefix = (msg.desiredConnectionType === 1 /* ConnectionType.Management */
                ? `${_logPrefix}[ManagementConnection]`
                : msg.desiredConnectionType === 2 /* ConnectionType.ExtensionHost */
                    ? `${_logPrefix}[ExtensionHostConnection]`
                    : _logPrefix);
            if (msg.desiredConnectionType === 1 /* ConnectionType.Management */) {
                // This should become a management connection
                if (isReconnection) {
                    // This is a reconnection
                    if (!this._managementConnections[reconnectionToken]) {
                        if (!this._allReconnectionTokens.has(reconnectionToken)) {
                            // This is an unknown reconnection token
                            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (never seen)`);
                        }
                        else {
                            // This is a connection that was seen in the past, but is no longer valid
                            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (seen before)`);
                        }
                    }
                    protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify({ type: 'ok' })));
                    const dataChunk = protocol.readEntireBuffer();
                    protocol.dispose();
                    this._managementConnections[reconnectionToken].acceptReconnection(remoteAddress, socket, dataChunk);
                }
                else {
                    // This is a fresh connection
                    if (this._managementConnections[reconnectionToken]) {
                        // Cannot have two concurrent connections using the same reconnection token
                        return this._rejectWebSocketConnection(logPrefix, protocol, `Duplicate reconnection token`);
                    }
                    protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify({ type: 'ok' })));
                    const con = new remoteExtensionManagement_1.ManagementConnection(this._logService, reconnectionToken, remoteAddress, protocol);
                    this._socketServer.acceptConnection(con.protocol, con.onClose);
                    this._managementConnections[reconnectionToken] = con;
                    this._allReconnectionTokens.add(reconnectionToken);
                    con.onClose(() => {
                        delete this._managementConnections[reconnectionToken];
                    });
                }
            }
            else if (msg.desiredConnectionType === 2 /* ConnectionType.ExtensionHost */) {
                // This should become an extension host connection
                const startParams0 = msg.args || { language: 'en' };
                const startParams = await this._updateWithFreeDebugPort(startParams0);
                if (startParams.port) {
                    this._logService.trace(`${logPrefix} - startParams debug port ${startParams.port}`);
                }
                this._logService.trace(`${logPrefix} - startParams language: ${startParams.language}`);
                this._logService.trace(`${logPrefix} - startParams env: ${JSON.stringify(startParams.env)}`);
                if (isReconnection) {
                    // This is a reconnection
                    if (!this._extHostConnections[reconnectionToken]) {
                        if (!this._allReconnectionTokens.has(reconnectionToken)) {
                            // This is an unknown reconnection token
                            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (never seen)`);
                        }
                        else {
                            // This is a connection that was seen in the past, but is no longer valid
                            return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown reconnection token (seen before)`);
                        }
                    }
                    protocol.sendPause();
                    protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(startParams.port ? { debugPort: startParams.port } : {})));
                    const dataChunk = protocol.readEntireBuffer();
                    protocol.dispose();
                    this._extHostConnections[reconnectionToken].acceptReconnection(remoteAddress, socket, dataChunk);
                }
                else {
                    // This is a fresh connection
                    if (this._extHostConnections[reconnectionToken]) {
                        // Cannot have two concurrent connections using the same reconnection token
                        return this._rejectWebSocketConnection(logPrefix, protocol, `Duplicate reconnection token`);
                    }
                    protocol.sendPause();
                    protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(startParams.port ? { debugPort: startParams.port } : {})));
                    const dataChunk = protocol.readEntireBuffer();
                    protocol.dispose();
                    const con = this._instantiationService.createInstance(extensionHostConnection_1.ExtensionHostConnection, reconnectionToken, remoteAddress, socket, dataChunk);
                    this._extHostConnections[reconnectionToken] = con;
                    this._allReconnectionTokens.add(reconnectionToken);
                    con.onClose(() => {
                        delete this._extHostConnections[reconnectionToken];
                        this._onDidCloseExtHostConnection();
                    });
                    con.start(startParams);
                }
            }
            else if (msg.desiredConnectionType === 3 /* ConnectionType.Tunnel */) {
                const tunnelStartParams = msg.args;
                this._createTunnel(protocol, tunnelStartParams);
            }
            else {
                return this._rejectWebSocketConnection(logPrefix, protocol, `Unknown initial data received`);
            }
        }
        async _createTunnel(protocol, tunnelStartParams) {
            const remoteSocket = protocol.getSocket().socket;
            const dataChunk = protocol.readEntireBuffer();
            protocol.dispose();
            remoteSocket.pause();
            const localSocket = await this._connectTunnelSocket(tunnelStartParams.host, tunnelStartParams.port);
            if (dataChunk.byteLength > 0) {
                localSocket.write(dataChunk.buffer);
            }
            localSocket.on('end', () => remoteSocket.end());
            localSocket.on('close', () => remoteSocket.end());
            localSocket.on('error', () => remoteSocket.destroy());
            remoteSocket.on('end', () => localSocket.end());
            remoteSocket.on('close', () => localSocket.end());
            remoteSocket.on('error', () => localSocket.destroy());
            localSocket.pipe(remoteSocket);
            remoteSocket.pipe(localSocket);
        }
        _connectTunnelSocket(host, port) {
            return new Promise((c, e) => {
                const socket = net.createConnection({
                    host: host,
                    port: port,
                    autoSelectFamily: true
                }, () => {
                    socket.removeListener('error', e);
                    socket.pause();
                    c(socket);
                });
                socket.once('error', e);
            });
        }
        _updateWithFreeDebugPort(startParams) {
            if (typeof startParams.port === 'number') {
                return (0, ports_1.findFreePort)(startParams.port, 10 /* try 10 ports */, 5000 /* try up to 5 seconds */).then(freePort => {
                    startParams.port = freePort;
                    return startParams;
                });
            }
            // No port clear debug configuration.
            startParams.debugId = undefined;
            startParams.port = undefined;
            startParams.break = undefined;
            return Promise.resolve(startParams);
        }
        async _onDidCloseExtHostConnection() {
            if (!this._environmentService.args['enable-remote-auto-shutdown']) {
                return;
            }
            this._cancelShutdown();
            const hasActiveExtHosts = !!Object.keys(this._extHostConnections).length;
            if (!hasActiveExtHosts) {
                console.log('Last EH closed, waiting before shutting down');
                this._logService.info('Last EH closed, waiting before shutting down');
                this._waitThenShutdown();
            }
        }
        _waitThenShutdown(initial = false) {
            if (!this._environmentService.args['enable-remote-auto-shutdown']) {
                return;
            }
            if (this._environmentService.args['remote-auto-shutdown-without-delay'] && !initial) {
                this._shutdown();
            }
            else {
                this.shutdownTimer = setTimeout(() => {
                    this.shutdownTimer = undefined;
                    this._shutdown();
                }, SHUTDOWN_TIMEOUT);
            }
        }
        _shutdown() {
            const hasActiveExtHosts = !!Object.keys(this._extHostConnections).length;
            if (hasActiveExtHosts) {
                console.log('New EH opened, aborting shutdown');
                this._logService.info('New EH opened, aborting shutdown');
                return;
            }
            else {
                console.log('Last EH closed, shutting down');
                this._logService.info('Last EH closed, shutting down');
                this.dispose();
                process.exit(0);
            }
        }
        /**
         * If the server is in a shutdown timeout, cancel it and start over
         */
        _delayShutdown() {
            if (this.shutdownTimer) {
                console.log('Got delay-shutdown request while in shutdown timeout, delaying');
                this._logService.info('Got delay-shutdown request while in shutdown timeout, delaying');
                this._cancelShutdown();
                this._waitThenShutdown();
            }
        }
        _cancelShutdown() {
            if (this.shutdownTimer) {
                console.log('Cancelling previous shutdown timeout');
                this._logService.info('Cancelling previous shutdown timeout');
                clearTimeout(this.shutdownTimer);
                this.shutdownTimer = undefined;
            }
        }
    };
    RemoteExtensionHostAgentServer = __decorate([
        __param(4, serverEnvironmentService_1.IServerEnvironmentService),
        __param(5, productService_1.IProductService),
        __param(6, log_1.ILogService),
        __param(7, instantiation_1.IInstantiationService)
    ], RemoteExtensionHostAgentServer);
    async function createServer(address, args, REMOTE_DATA_FOLDER) {
        const connectionToken = await (0, serverConnectionToken_1.determineServerConnectionToken)(args);
        if (connectionToken instanceof serverConnectionToken_1.ServerConnectionTokenParseError) {
            console.warn(connectionToken.message);
            process.exit(1);
        }
        // setting up error handlers, first with console.error, then, once available, using the log service
        function initUnexpectedErrorHandler(handler) {
            (0, errors_1.setUnexpectedErrorHandler)(err => {
                // See https://github.com/microsoft/vscode-remote-release/issues/6481
                // In some circumstances, console.error will throw an asynchronous error. This asynchronous error
                // will end up here, and then it will be logged again, thus creating an endless asynchronous loop.
                // Here we try to break the loop by ignoring EPIPE errors that include our own unexpected error handler in the stack.
                if ((0, errors_1.isSigPipeError)(err) && err.stack && /unexpectedErrorHandler/.test(err.stack)) {
                    return;
                }
                handler(err);
            });
        }
        const unloggedErrors = [];
        initUnexpectedErrorHandler((error) => {
            unloggedErrors.push(error);
            console.error(error);
        });
        let didLogAboutSIGPIPE = false;
        process.on('SIGPIPE', () => {
            // See https://github.com/microsoft/vscode-remote-release/issues/6543
            // We would normally install a SIGPIPE listener in bootstrap.js
            // But in certain situations, the console itself can be in a broken pipe state
            // so logging SIGPIPE to the console will cause an infinite async loop
            if (!didLogAboutSIGPIPE) {
                didLogAboutSIGPIPE = true;
                (0, errors_1.onUnexpectedError)(new Error(`Unexpected SIGPIPE`));
            }
        });
        const disposables = new lifecycle_1.DisposableStore();
        const { socketServer, instantiationService } = await (0, serverServices_1.setupServerServices)(connectionToken, args, REMOTE_DATA_FOLDER, disposables);
        // Set the unexpected error handler after the services have been initialized, to avoid having
        // the telemetry service overwrite our handler
        instantiationService.invokeFunction((accessor) => {
            const logService = accessor.get(log_1.ILogService);
            unloggedErrors.forEach(error => logService.error(error));
            unloggedErrors.length = 0;
            initUnexpectedErrorHandler((error) => logService.error(error));
        });
        // On Windows, configure the UNC allow list based on settings
        instantiationService.invokeFunction((accessor) => {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            if (platform.isWindows) {
                if (configurationService.getValue('security.restrictUNCAccess') === false) {
                    (0, unc_1.disableUNCAccessRestrictions)();
                }
                else {
                    (0, unc_1.addUNCHostToAllowlist)(configurationService.getValue('security.allowedUNCHosts'));
                }
            }
        });
        //
        // On Windows, exit early with warning message to users about potential security issue
        // if there is node_modules folder under home drive or Users folder.
        //
        instantiationService.invokeFunction((accessor) => {
            const logService = accessor.get(log_1.ILogService);
            if (platform.isWindows && process.env.HOMEDRIVE && process.env.HOMEPATH) {
                const homeDirModulesPath = (0, path_1.join)(process.env.HOMEDRIVE, 'node_modules');
                const userDir = (0, path_1.dirname)((0, path_1.join)(process.env.HOMEDRIVE, process.env.HOMEPATH));
                const userDirModulesPath = (0, path_1.join)(userDir, 'node_modules');
                if (fs.existsSync(homeDirModulesPath) || fs.existsSync(userDirModulesPath)) {
                    const message = `

*
* !!!! Server terminated due to presence of CVE-2020-1416 !!!!
*
* Please remove the following directories and re-try
* ${homeDirModulesPath}
* ${userDirModulesPath}
*
* For more information on the vulnerability https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-1416
*

`;
                    logService.warn(message);
                    console.warn(message);
                    process.exit(0);
                }
            }
        });
        const vsdaMod = instantiationService.invokeFunction((accessor) => {
            const logService = accessor.get(log_1.ILogService);
            const hasVSDA = fs.existsSync((0, path_1.join)(network_1.FileAccess.asFileUri('').fsPath, '../node_modules/vsda'));
            if (hasVSDA) {
                try {
                    return globalThis._VSCODE_NODE_MODULES['vsda'];
                }
                catch (err) {
                    logService.error(err);
                }
            }
            return null;
        });
        const hasWebClient = fs.existsSync(network_1.FileAccess.asFileUri('vs/code/browser/workbench/workbench.html').fsPath);
        if (hasWebClient && address && typeof address !== 'string') {
            // ships the web ui!
            const queryPart = (connectionToken.type !== 0 /* ServerConnectionTokenType.None */ ? `?${network_1.connectionTokenQueryName}=${connectionToken.value}` : '');
            console.log(`Web UI available at http://localhost${address.port === 80 ? '' : `:${address.port}`}/${queryPart}`);
        }
        const remoteExtensionHostAgentServer = instantiationService.createInstance(RemoteExtensionHostAgentServer, socketServer, connectionToken, vsdaMod, hasWebClient);
        perf.mark('code/server/ready');
        const currentTime = perf_hooks_1.performance.now();
        const vscodeServerStartTime = global.vscodeServerStartTime;
        const vscodeServerListenTime = global.vscodeServerListenTime;
        const vscodeServerCodeLoadedTime = global.vscodeServerCodeLoadedTime;
        instantiationService.invokeFunction(async (accessor) => {
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            telemetryService.publicLog2('serverStart', {
                startTime: vscodeServerStartTime,
                startedTime: vscodeServerListenTime,
                codeLoadedTime: vscodeServerCodeLoadedTime,
                readyTime: currentTime
            });
            if (platform.isLinux) {
                const logService = accessor.get(log_1.ILogService);
                const releaseInfo = await (0, osReleaseInfo_1.getOSReleaseInfo)(logService.error.bind(logService));
                if (releaseInfo) {
                    telemetryService.publicLog2('serverPlatformInfo', {
                        platformId: releaseInfo.id,
                        platformVersionId: releaseInfo.version_id,
                        platformIdLike: releaseInfo.id_like
                    });
                }
            }
        });
        if (args['print-startup-performance']) {
            const stats = amd_1.LoaderStats.get();
            let output = '';
            output += '\n\n### Load AMD-module\n';
            output += amd_1.LoaderStats.toMarkdownTable(['Module', 'Duration'], stats.amdLoad);
            output += '\n\n### Load commonjs-module\n';
            output += amd_1.LoaderStats.toMarkdownTable(['Module', 'Duration'], stats.nodeRequire);
            output += '\n\n### Invoke AMD-module factory\n';
            output += amd_1.LoaderStats.toMarkdownTable(['Module', 'Duration'], stats.amdInvoke);
            output += '\n\n### Invoke commonjs-module\n';
            output += amd_1.LoaderStats.toMarkdownTable(['Module', 'Duration'], stats.nodeEval);
            output += `Start-up time: ${vscodeServerListenTime - vscodeServerStartTime}\n`;
            output += `Code loading time: ${vscodeServerCodeLoadedTime - vscodeServerStartTime}\n`;
            output += `Initialized time: ${currentTime - vscodeServerStartTime}\n`;
            output += `\n`;
            console.log(output);
        }
        return remoteExtensionHostAgentServer;
    }
    exports.createServer = createServer;
    class WebEndpointOriginChecker {
        static create(productService) {
            const webEndpointUrlTemplate = productService.webEndpointUrlTemplate;
            const commit = productService.commit;
            const quality = productService.quality;
            if (!webEndpointUrlTemplate || !commit || !quality) {
                return new WebEndpointOriginChecker(null);
            }
            const uuid = (0, uuid_1.generateUuid)();
            const exampleUrl = new URL(webEndpointUrlTemplate
                .replace('{{uuid}}', uuid)
                .replace('{{commit}}', commit)
                .replace('{{quality}}', quality));
            const exampleOrigin = exampleUrl.origin;
            const originRegExpSource = ((0, strings_1.escapeRegExpCharacters)(exampleOrigin)
                .replace(uuid, '[a-zA-Z0-9\\-]+'));
            try {
                const originRegExp = (0, strings_1.createRegExp)(`^${originRegExpSource}$`, true, { matchCase: false });
                return new WebEndpointOriginChecker(originRegExp);
            }
            catch (err) {
                return new WebEndpointOriginChecker(null);
            }
        }
        constructor(_originRegExp) {
            this._originRegExp = _originRegExp;
        }
        matches(origin) {
            if (!this._originRegExp) {
                return false;
            }
            return this._originRegExp.test(origin);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXh0ZW5zaW9uSG9zdEFnZW50U2VydmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9zZXJ2ZXIvbm9kZS9yZW1vdGVFeHRlbnNpb25Ib3N0QWdlbnRTZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUNoRyxNQUFNLGdCQUFnQixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBZ0J2QyxJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUErQixTQUFRLHNCQUFVO1FBWXRELFlBQ2tCLGFBQXlELEVBQ3pELGdCQUF1QyxFQUN2QyxRQUE0QixFQUM3QyxZQUFxQixFQUNNLG1CQUErRCxFQUN6RSxlQUFpRCxFQUNyRCxXQUF5QyxFQUMvQixxQkFBNkQ7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFUUyxrQkFBYSxHQUFiLGFBQWEsQ0FBNEM7WUFDekQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUF1QjtZQUN2QyxhQUFRLEdBQVIsUUFBUSxDQUFvQjtZQUVELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBMkI7WUFDeEQsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ3BDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ2QsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQWRwRSw4QkFBeUIsR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBa0JsRyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUEscUNBQXVCLEVBQUMsZUFBZSxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFD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