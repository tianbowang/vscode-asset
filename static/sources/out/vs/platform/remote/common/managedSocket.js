/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc.net"], function (require, exports, buffer_1, event_1, lifecycle_1, ipc_net_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ManagedSocket = exports.connectManagedSocket = exports.socketRawEndHeaderSequence = exports.makeRawSocketHeaders = void 0;
    const makeRawSocketHeaders = (path, query, deubgLabel) => {
        // https://tools.ietf.org/html/rfc6455#section-4
        const buffer = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
            buffer[i] = Math.round(Math.random() * 256);
        }
        const nonce = (0, buffer_1.encodeBase64)(buffer_1.VSBuffer.wrap(buffer));
        const headers = [
            `GET ws://localhost${path}?${query}&skipWebSocketFrames=true HTTP/1.1`,
            `Connection: Upgrade`,
            `Upgrade: websocket`,
            `Sec-WebSocket-Key: ${nonce}`
        ];
        return headers.join('\r\n') + '\r\n\r\n';
    };
    exports.makeRawSocketHeaders = makeRawSocketHeaders;
    exports.socketRawEndHeaderSequence = buffer_1.VSBuffer.fromString('\r\n\r\n');
    /** Should be called immediately after making a ManagedSocket to make it ready for data flow. */
    async function connectManagedSocket(socket, path, query, debugLabel, half) {
        socket.write(buffer_1.VSBuffer.fromString((0, exports.makeRawSocketHeaders)(path, query, debugLabel)));
        const d = new lifecycle_1.DisposableStore();
        try {
            return await new Promise((resolve, reject) => {
                let dataSoFar;
                d.add(socket.onData(d_1 => {
                    if (!dataSoFar) {
                        dataSoFar = d_1;
                    }
                    else {
                        dataSoFar = buffer_1.VSBuffer.concat([dataSoFar, d_1], dataSoFar.byteLength + d_1.byteLength);
                    }
                    const index = dataSoFar.indexOf(exports.socketRawEndHeaderSequence);
                    if (index === -1) {
                        return;
                    }
                    resolve(socket);
                    // pause data events until the socket consumer is hooked up. We may
                    // immediately emit remaining data, but if not there may still be
                    // microtasks queued which would fire data into the abyss.
                    socket.pauseData();
                    const rest = dataSoFar.slice(index + exports.socketRawEndHeaderSequence.byteLength);
                    if (rest.byteLength) {
                        half.onData.fire(rest);
                    }
                }));
                d.add(socket.onClose(err => reject(err ?? new Error('socket closed'))));
                d.add(socket.onEnd(() => reject(new Error('socket ended'))));
            });
        }
        catch (e) {
            socket.dispose();
            throw e;
        }
        finally {
            d.dispose();
        }
    }
    exports.connectManagedSocket = connectManagedSocket;
    class ManagedSocket extends lifecycle_1.Disposable {
        constructor(debugLabel, half) {
            super();
            this.debugLabel = debugLabel;
            this.pausableDataEmitter = this._register(new event_1.PauseableEmitter());
            this.onData = (...args) => {
                if (this.pausableDataEmitter.isPaused) {
                    queueMicrotask(() => this.pausableDataEmitter.resume());
                }
                return this.pausableDataEmitter.event(...args);
            };
            this.didDisposeEmitter = this._register(new event_1.Emitter());
            this.onDidDispose = this.didDisposeEmitter.event;
            this.ended = false;
            this._register(half.onData);
            this._register(half.onData.event(data => this.pausableDataEmitter.fire(data)));
            this.onClose = this._register(half.onClose).event;
            this.onEnd = this._register(half.onEnd).event;
        }
        /** Pauses data events until a new listener comes in onData() */
        pauseData() {
            this.pausableDataEmitter.pause();
        }
        /** Flushes data to the socket. */
        drain() {
            return Promise.resolve();
        }
        /** Ends the remote socket. */
        end() {
            this.ended = true;
            this.closeRemote();
        }
        traceSocketEvent(type, data) {
            ipc_net_1.SocketDiagnostics.traceSocketEvent(this, this.debugLabel, type, data);
        }
        dispose() {
            if (!this.ended) {
                this.closeRemote();
            }
            this.didDisposeEmitter.fire();
            super.dispose();
        }
    }
    exports.ManagedSocket = ManagedSocket;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuYWdlZFNvY2tldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcmVtb3RlL2NvbW1vbi9tYW5hZ2VkU29ja2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU96RixNQUFNLG9CQUFvQixHQUFHLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxVQUFrQixFQUFFLEVBQUU7UUFDdkYsZ0RBQWdEO1FBQ2hELE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM3QixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUNELE1BQU0sS0FBSyxHQUFHLElBQUEscUJBQVksRUFBQyxpQkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRWxELE1BQU0sT0FBTyxHQUFHO1lBQ2YscUJBQXFCLElBQUksSUFBSSxLQUFLLG9DQUFvQztZQUN0RSxxQkFBcUI7WUFDckIsb0JBQW9CO1lBQ3BCLHNCQUFzQixLQUFLLEVBQUU7U0FDN0IsQ0FBQztRQUVGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFVLENBQUM7SUFDMUMsQ0FBQyxDQUFDO0lBaEJXLFFBQUEsb0JBQW9CLHdCQWdCL0I7SUFFVyxRQUFBLDBCQUEwQixHQUFHLGlCQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBUTFFLGdHQUFnRztJQUN6RixLQUFLLFVBQVUsb0JBQW9CLENBQ3pDLE1BQVMsRUFDVCxJ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