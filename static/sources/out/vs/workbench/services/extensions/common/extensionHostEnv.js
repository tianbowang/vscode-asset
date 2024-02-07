/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readExtHostConnection = exports.writeExtHostConnection = exports.MessagePortExtHostConnection = exports.SocketExtHostConnection = exports.IPCExtHostConnection = exports.ExtHostConnectionType = void 0;
    var ExtHostConnectionType;
    (function (ExtHostConnectionType) {
        ExtHostConnectionType[ExtHostConnectionType["IPC"] = 1] = "IPC";
        ExtHostConnectionType[ExtHostConnectionType["Socket"] = 2] = "Socket";
        ExtHostConnectionType[ExtHostConnectionType["MessagePort"] = 3] = "MessagePort";
    })(ExtHostConnectionType || (exports.ExtHostConnectionType = ExtHostConnectionType = {}));
    /**
     * The extension host will connect via named pipe / domain socket to its renderer.
     */
    class IPCExtHostConnection {
        static { this.ENV_KEY = 'VSCODE_EXTHOST_IPC_HOOK'; }
        constructor(pipeName) {
            this.pipeName = pipeName;
            this.type = 1 /* ExtHostConnectionType.IPC */;
        }
        serialize(env) {
            env[IPCExtHostConnection.ENV_KEY] = this.pipeName;
        }
    }
    exports.IPCExtHostConnection = IPCExtHostConnection;
    /**
     * The extension host will receive via nodejs IPC the socket to its renderer.
     */
    class SocketExtHostConnection {
        constructor() {
            this.type = 2 /* ExtHostConnectionType.Socket */;
        }
        static { this.ENV_KEY = 'VSCODE_EXTHOST_WILL_SEND_SOCKET'; }
        serialize(env) {
            env[SocketExtHostConnection.ENV_KEY] = '1';
        }
    }
    exports.SocketExtHostConnection = SocketExtHostConnection;
    /**
     * The extension host will receive via nodejs IPC the MessagePort to its renderer.
     */
    class MessagePortExtHostConnection {
        constructor() {
            this.type = 3 /* ExtHostConnectionType.MessagePort */;
        }
        static { this.ENV_KEY = 'VSCODE_WILL_SEND_MESSAGE_PORT'; }
        serialize(env) {
            env[MessagePortExtHostConnection.ENV_KEY] = '1';
        }
    }
    exports.MessagePortExtHostConnection = MessagePortExtHostConnection;
    function clean(env) {
        delete env[IPCExtHostConnection.ENV_KEY];
        delete env[SocketExtHostConnection.ENV_KEY];
        delete env[MessagePortExtHostConnection.ENV_KEY];
    }
    /**
     * Write `connection` into `env` and clean up `env`.
     */
    function writeExtHostConnection(connection, env) {
        // Avoid having two different keys that might introduce amiguity or problems.
        clean(env);
        connection.serialize(env);
    }
    exports.writeExtHostConnection = writeExtHostConnection;
    /**
     * Read `connection` from `env` and clean up `env`.
     */
    function readExtHostConnection(env) {
        if (env[IPCExtHostConnection.ENV_KEY]) {
            return cleanAndReturn(env, new IPCExtHostConnection(env[IPCExtHostConnection.ENV_KEY]));
        }
        if (env[SocketExtHostConnection.ENV_KEY]) {
            return cleanAndReturn(env, new SocketExtHostConnection());
        }
        if (env[MessagePortExtHostConnection.ENV_KEY]) {
            return cleanAndReturn(env, new MessagePortExtHostConnection());
        }
        throw new Error(`No connection information defined in environment!`);
    }
    exports.readExtHostConnection = readExtHostConnection;
    function cleanAndReturn(env, result) {
        clean(env);
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdEVudi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvY29tbW9uL2V4dGVuc2lvbkhvc3RFbnYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLElBQWtCLHFCQUlqQjtJQUpELFdBQWtCLHFCQUFxQjtRQUN0QywrREFBTyxDQUFBO1FBQ1AscUVBQVUsQ0FBQTtRQUNWLCtFQUFlLENBQUE7SUFDaEIsQ0FBQyxFQUppQixxQkFBcUIscUNBQXJCLHFCQUFxQixRQUl0QztJQUVEOztPQUVHO0lBQ0gsTUFBYSxvQkFBb0I7aUJBQ2xCLFlBQU8sR0FBRyx5QkFBeUIsQUFBNUIsQ0FBNkI7UUFJbEQsWUFDaUIsUUFBZ0I7WUFBaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUhqQixTQUFJLHFDQUE2QjtRQUk3QyxDQUFDO1FBRUUsU0FBUyxDQUFDLEdBQXdCO1lBQ3hDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ25ELENBQUM7O0lBWEYsb0RBWUM7SUFFRDs7T0FFRztJQUNILE1BQWEsdUJBQXVCO1FBQXBDO1lBR2lCLFNBQUksd0NBQWdDO1FBS3JELENBQUM7aUJBUGMsWUFBTyxHQUFHLGlDQUFpQyxBQUFwQyxDQUFxQztRQUluRCxTQUFTLENBQUMsR0FBd0I7WUFDeEMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUM1QyxDQUFDOztJQVBGLDBEQVFDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLDRCQUE0QjtRQUF6QztZQUdpQixTQUFJLDZDQUFxQztRQUsxRCxDQUFDO2lCQVBjLFlBQU8sR0FBRywrQkFBK0IsQUFBbEMsQ0FBbUM7UUFJakQsU0FBUyxDQUFDLEdBQXdCO1lBQ3hDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDakQsQ0FBQzs7SUFQRixvRUFRQztJQUlELFNBQVMsS0FBSyxDQUFDLEdBQXdCO1FBQ3RDLE9BQU8sR0FBRyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sR0FBRyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLE9BQU8sR0FBRyxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLHNCQUFzQixDQUFDLFVBQTZCLEVBQUUsR0FBd0I7UUFDN0YsNkVBQTZFO1FBQzdFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUpELHdEQUlDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixxQkFBcUIsQ0FBQyxHQUF3QjtRQUM3RCxJQUFJLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3ZDLE9BQU8sY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUNELElBQUksR0FBRyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDMUMsT0FBTyxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFDRCxJQUFJLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQy9DLE9BQU8sY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLDRCQUE0QixFQUFFLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFYRCxzREFXQztJQUVELFNBQVMsY0FBYyxDQUFDLEdBQXdCLEVBQUUsTUFBeUI7UUFDMUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDIn0=