/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/sandbox/node/electronTypes", "vs/base/common/buffer", "vs/base/parts/ipc/common/ipc", "vs/base/common/event", "vs/base/common/types", "vs/base/common/arrays"], function (require, exports, electronTypes_1, buffer_1, ipc_1, event_1, types_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.once = exports.Server = void 0;
    /**
     * The MessagePort `Protocol` leverages MessagePortMain style IPC communication
     * for the implementation of the `IMessagePassingProtocol`.
     */
    class Protocol {
        constructor(port) {
            this.port = port;
            this.onMessage = event_1.Event.fromNodeEventEmitter(this.port, 'message', (e) => {
                if (e.data) {
                    return buffer_1.VSBuffer.wrap(e.data);
                }
                return buffer_1.VSBuffer.alloc(0);
            });
            // we must call start() to ensure messages are flowing
            port.start();
        }
        send(message) {
            this.port.postMessage(message.buffer);
        }
        disconnect() {
            this.port.close();
        }
    }
    /**
     * An implementation of a `IPCServer` on top of MessagePort style IPC communication.
     * The clients register themselves via Electron Utility Process IPC transfer.
     */
    class Server extends ipc_1.IPCServer {
        static getOnDidClientConnect(filter) {
            (0, types_1.assertType)((0, electronTypes_1.isUtilityProcess)(process), 'Electron Utility Process');
            const onCreateMessageChannel = new event_1.Emitter();
            process.parentPort.on('message', (e) => {
                if (filter?.handledClientConnection(e)) {
                    return;
                }
                const port = (0, arrays_1.firstOrDefault)(e.ports);
                if (port) {
                    onCreateMessageChannel.fire(port);
                }
            });
            return event_1.Event.map(onCreateMessageChannel.event, port => {
                const protocol = new Protocol(port);
                const result = {
                    protocol,
                    // Not part of the standard spec, but in Electron we get a `close` event
                    // when the other side closes. We can use this to detect disconnects
                    // (https://github.com/electron/electron/blob/11-x-y/docs/api/message-port-main.md#event-close)
                    onDidClientDisconnect: event_1.Event.fromNodeEventEmitter(port, 'close')
                };
                return result;
            });
        }
        constructor(filter) {
            super(Server.getOnDidClientConnect(filter));
        }
    }
    exports.Server = Server;
    function once(port, message, callback) {
        const listener = (e) => {
            if (e.data === message) {
                port.removeListener('message', listener);
                callback();
            }
        };
        port.on('message', listener);
    }
    exports.once = once;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLm1wLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3BhcnRzL2lwYy9ub2RlL2lwYy5tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEc7OztPQUdHO0lBQ0gsTUFBTSxRQUFRO1FBU2IsWUFBb0IsSUFBcUI7WUFBckIsU0FBSSxHQUFKLElBQUksQ0FBaUI7WUFQaEMsY0FBUyxHQUFHLGFBQUssQ0FBQyxvQkFBb0IsQ0FBVyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQWUsRUFBRSxFQUFFO2dCQUNuRyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDWixPQUFPLGlCQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsQ0FBQztnQkFDRCxPQUFPLGlCQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1lBSUYsc0RBQXNEO1lBQ3RELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFJLENBQUMsT0FBaUI7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxVQUFVO1lBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQixDQUFDO0tBQ0Q7SUFlRDs7O09BR0c7SUFDSCxNQUFhLE1BQU8sU0FBUSxlQUFTO1FBRTVCLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxNQUFnQztZQUNwRSxJQUFBLGtCQUFVLEVBQUMsSUFBQSxnQ0FBZ0IsRUFBQyxPQUFPLENBQUMsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1lBRWxFLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxlQUFPLEVBQW1CLENBQUM7WUFFOUQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBZSxFQUFFLEVBQUU7Z0JBQ3BELElBQUksTUFBTSxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ3hDLE9BQU87Z0JBQ1IsQ0FBQztnQkFFRCxNQUFNLElBQUksR0FBRyxJQUFBLHVCQUFjLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUNWLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbkMsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxhQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDckQsTUFBTSxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXBDLE1BQU0sTUFBTSxHQUEwQjtvQkFDckMsUUFBUTtvQkFDUix3RUFBd0U7b0JBQ3hFLG9FQUFvRTtvQkFDcEUsK0ZBQStGO29CQUMvRixxQkFBcUIsRUFBRSxhQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztpQkFDaEUsQ0FBQztnQkFFRixPQUFPLE1BQU0sQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELFlBQVksTUFBZ0M7WUFDM0MsS0FBSyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzdDLENBQUM7S0FDRDtJQXBDRCx3QkFvQ0M7SUFPRCxTQUFnQixJQUFJLENBQUMsSUFBOEIsRUFBRSxPQUFnQixFQUFFLFFBQW9CO1FBQzFGLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBZSxFQUFFLEVBQUU7WUFDcEMsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDekMsUUFBUSxFQUFFLENBQUM7WUFDWixDQUFDO1FBQ0YsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQVRELG9CQVNDIn0=