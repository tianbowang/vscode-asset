/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/common/event", "vs/base/common/uuid", "vs/base/parts/ipc/common/ipc.mp"], function (require, exports, ipcMain_1, event_1, uuid_1, ipc_mp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.connect = exports.Client = void 0;
    /**
     * An implementation of a `IPCClient` on top of Electron `MessagePortMain`.
     */
    class Client extends ipc_mp_1.Client {
        /**
         * @param clientId a way to uniquely identify this client among
         * other clients. this is important for routing because every
         * client can also be a server
         */
        constructor(port, clientId) {
            super({
                addEventListener: (type, listener) => port.addListener(type, listener),
                removeEventListener: (type, listener) => port.removeListener(type, listener),
                postMessage: message => port.postMessage(message),
                start: () => port.start(),
                close: () => port.close()
            }, clientId);
        }
    }
    exports.Client = Client;
    /**
     * This method opens a message channel connection
     * in the target window. The target window needs
     * to use the `Server` from `electron-sandbox/ipc.mp`.
     */
    async function connect(window) {
        // Assert healthy window to talk to
        if (window.isDestroyed() || window.webContents.isDestroyed()) {
            throw new Error('ipc.mp#connect: Cannot talk to window because it is closed or destroyed');
        }
        // Ask to create message channel inside the window
        // and send over a UUID to correlate the response
        const nonce = (0, uuid_1.generateUuid)();
        window.webContents.send('vscode:createMessageChannel', nonce);
        // Wait until the window has returned the `MessagePort`
        // We need to filter by the `nonce` to ensure we listen
        // to the right response.
        const onMessageChannelResult = event_1.Event.fromNodeEventEmitter(ipcMain_1.validatedIpcMain, 'vscode:createMessageChannelResult', (e, nonce) => ({ nonce, port: e.ports[0] }));
        const { port } = await event_1.Event.toPromise(event_1.Event.once(event_1.Event.filter(onMessageChannelResult, e => e.nonce === nonce)));
        return port;
    }
    exports.connect = connect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLm1wLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3BhcnRzL2lwYy9lbGVjdHJvbi1tYWluL2lwYy5tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEc7O09BRUc7SUFDSCxNQUFhLE1BQU8sU0FBUSxlQUFpQjtRQUU1Qzs7OztXQUlHO1FBQ0gsWUFBWSxJQUFxQixFQUFFLFFBQWdCO1lBQ2xELEtBQUssQ0FBQztnQkFDTCxnQkFBZ0IsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztnQkFDdEUsbUJBQW1CLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUM7Z0JBQzVFLFdBQVcsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO2dCQUNqRCxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDekIsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7YUFDekIsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNkLENBQUM7S0FDRDtJQWhCRCx3QkFnQkM7SUFFRDs7OztPQUlHO0lBQ0ksS0FBSyxVQUFVLE9BQU8sQ0FBQyxNQUFxQjtRQUVsRCxtQ0FBbUM7UUFDbkMsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO1lBQzlELE1BQU0sSUFBSSxLQUFLLENBQUMseUVBQXlFLENBQUMsQ0FBQztRQUM1RixDQUFDO1FBRUQsa0RBQWtEO1FBQ2xELGlEQUFpRDtRQUNqRCxNQUFNLEtBQUssR0FBRyxJQUFBLG1CQUFZLEdBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU5RCx1REFBdUQ7UUFDdkQsdURBQXVEO1FBQ3ZELHlCQUF5QjtRQUN6QixNQUFNLHNCQUFzQixHQUFHLGFBQUssQ0FBQyxvQkFBb0IsQ0FBMkMsMEJBQWdCLEVBQUUsbUNBQW1DLEVBQUUsQ0FBQyxDQUFlLEVBQUUsS0FBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlOLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLGFBQUssQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLElBQUksQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFakgsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBbkJELDBCQW1CQyJ9