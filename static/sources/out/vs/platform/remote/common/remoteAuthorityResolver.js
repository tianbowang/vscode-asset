/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/instantiation/common/instantiation"], function (require, exports, errors_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRemoteAuthorityPrefix = exports.RemoteAuthorityResolverError = exports.RemoteAuthorityResolverErrorCode = exports.WebSocketRemoteConnection = exports.ManagedRemoteConnection = exports.RemoteConnectionType = exports.IRemoteAuthorityResolverService = void 0;
    exports.IRemoteAuthorityResolverService = (0, instantiation_1.createDecorator)('remoteAuthorityResolverService');
    var RemoteConnectionType;
    (function (RemoteConnectionType) {
        RemoteConnectionType[RemoteConnectionType["WebSocket"] = 0] = "WebSocket";
        RemoteConnectionType[RemoteConnectionType["Managed"] = 1] = "Managed";
    })(RemoteConnectionType || (exports.RemoteConnectionType = RemoteConnectionType = {}));
    class ManagedRemoteConnection {
        constructor(id) {
            this.id = id;
            this.type = 1 /* RemoteConnectionType.Managed */;
        }
        toString() {
            return `Managed(${this.id})`;
        }
    }
    exports.ManagedRemoteConnection = ManagedRemoteConnection;
    class WebSocketRemoteConnection {
        constructor(host, port) {
            this.host = host;
            this.port = port;
            this.type = 0 /* RemoteConnectionType.WebSocket */;
        }
        toString() {
            return `WebSocket(${this.host}:${this.port})`;
        }
    }
    exports.WebSocketRemoteConnection = WebSocketRemoteConnection;
    var RemoteAuthorityResolverErrorCode;
    (function (RemoteAuthorityResolverErrorCode) {
        RemoteAuthorityResolverErrorCode["Unknown"] = "Unknown";
        RemoteAuthorityResolverErrorCode["NotAvailable"] = "NotAvailable";
        RemoteAuthorityResolverErrorCode["TemporarilyNotAvailable"] = "TemporarilyNotAvailable";
        RemoteAuthorityResolverErrorCode["NoResolverFound"] = "NoResolverFound";
        RemoteAuthorityResolverErrorCode["InvalidAuthority"] = "InvalidAuthority";
    })(RemoteAuthorityResolverErrorCode || (exports.RemoteAuthorityResolverErrorCode = RemoteAuthorityResolverErrorCode = {}));
    class RemoteAuthorityResolverError extends errors_1.ErrorNoTelemetry {
        static isNotAvailable(err) {
            return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.NotAvailable;
        }
        static isTemporarilyNotAvailable(err) {
            return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable;
        }
        static isNoResolverFound(err) {
            return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.NoResolverFound;
        }
        static isInvalidAuthority(err) {
            return (err instanceof RemoteAuthorityResolverError) && err._code === RemoteAuthorityResolverErrorCode.InvalidAuthority;
        }
        static isHandled(err) {
            return (err instanceof RemoteAuthorityResolverError) && err.isHandled;
        }
        constructor(message, code = RemoteAuthorityResolverErrorCode.Unknown, detail) {
            super(message);
            this._message = message;
            this._code = code;
            this._detail = detail;
            this.isHandled = (code === RemoteAuthorityResolverErrorCode.NotAvailable) && detail === true;
            // workaround when extending builtin objects and when compiling to ES5, see:
            // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, RemoteAuthorityResolverError.prototype);
        }
    }
    exports.RemoteAuthorityResolverError = RemoteAuthorityResolverError;
    function getRemoteAuthorityPrefix(remoteAuthority) {
        const plusIndex = remoteAuthority.indexOf('+');
        if (plusIndex === -1) {
            return remoteAuthority;
        }
        return remoteAuthority.substring(0, plusIndex);
    }
    exports.getRemoteAuthorityPrefix = getRemoteAuthorityPrefix;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQXV0aG9yaXR5UmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlbW90ZS9jb21tb24vcmVtb3RlQXV0aG9yaXR5UmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT25GLFFBQUEsK0JBQStCLEdBQUcsSUFBQSwrQkFBZSxFQUFrQyxnQ0FBZ0MsQ0FBQyxDQUFDO0lBRWxJLElBQWtCLG9CQUdqQjtJQUhELFdBQWtCLG9CQUFvQjtRQUNyQyx5RUFBUyxDQUFBO1FBQ1QscUVBQU8sQ0FBQTtJQUNSLENBQUMsRUFIaUIsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFHckM7SUFFRCxNQUFhLHVCQUF1QjtRQUduQyxZQUNpQixFQUFVO1lBQVYsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQUhYLFNBQUksd0NBQWdDO1FBSWhELENBQUM7UUFFRSxRQUFRO1lBQ2QsT0FBTyxXQUFXLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQztRQUM5QixDQUFDO0tBQ0Q7SUFWRCwwREFVQztJQUVELE1BQWEseUJBQXlCO1FBR3JDLFlBQ2lCLElBQVksRUFDWixJQUFZO1lBRFosU0FBSSxHQUFKLElBQUksQ0FBUTtZQUNaLFNBQUksR0FBSixJQUFJLENBQVE7WUFKYixTQUFJLDBDQUFrQztRQUtsRCxDQUFDO1FBRUUsUUFBUTtZQUNkLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQztRQUMvQyxDQUFDO0tBQ0Q7SUFYRCw4REFXQztJQWtERCxJQUFZLGdDQU1YO0lBTkQsV0FBWSxnQ0FBZ0M7UUFDM0MsdURBQW1CLENBQUE7UUFDbkIsaUVBQTZCLENBQUE7UUFDN0IsdUZBQW1ELENBQUE7UUFDbkQsdUVBQW1DLENBQUE7UUFDbkMseUVBQXFDLENBQUE7SUFDdEMsQ0FBQyxFQU5XLGdDQUFnQyxnREFBaEMsZ0NBQWdDLFFBTTNDO0lBRUQsTUFBYSw0QkFBNkIsU0FBUSx5QkFBZ0I7UUFFMUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFRO1lBQ3BDLE9BQU8sQ0FBQyxHQUFHLFlBQVksNEJBQTRCLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLGdDQUFnQyxDQUFDLFlBQVksQ0FBQztRQUNySCxDQUFDO1FBRU0sTUFBTSxDQUFDLHlCQUF5QixDQUFDLEdBQVE7WUFDL0MsT0FBTyxDQUFDLEdBQUcsWUFBWSw0QkFBNEIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssZ0NBQWdDLENBQUMsdUJBQXVCLENBQUM7UUFDaEksQ0FBQztRQUVNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFRO1lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLFlBQVksNEJBQTRCLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLGdDQUFnQyxDQUFDLGVBQWUsQ0FBQztRQUN4SCxDQUFDO1FBRU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDLEdBQVE7WUFDeEMsT0FBTyxDQUFDLEdBQUcsWUFBWSw0QkFBNEIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssZ0NBQWdDLENBQUMsZ0JBQWdCLENBQUM7UUFDekgsQ0FBQztRQUVNLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBUTtZQUMvQixPQUFPLENBQUMsR0FBRyxZQUFZLDRCQUE0QixDQUFDLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUN2RSxDQUFDO1FBUUQsWUFBWSxPQUFnQixFQUFFLE9BQXlDLGdDQUFnQyxDQUFDLE9BQU8sRUFBRSxNQUFZO1lBQzVILEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVmLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBRXRCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLEtBQUssZ0NBQWdDLENBQUMsWUFBWSxDQUFDLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQztZQUU3Riw0RUFBNEU7WUFDNUUsK0lBQStJO1lBQy9JLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7S0FDRDtJQXpDRCxvRUF5Q0M7SUEwQkQsU0FBZ0Isd0JBQXdCLENBQUMsZUFBdUI7UUFDL0QsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQyxJQUFJLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7UUFDRCxPQUFPLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFORCw0REFNQyJ9