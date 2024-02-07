(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer"], function (require, exports, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeLogMarkers = exports.isMessageOfType = exports.createMessageOfType = exports.MessageType = exports.ExtensionHostExitCode = exports.UIKind = void 0;
    var UIKind;
    (function (UIKind) {
        UIKind[UIKind["Desktop"] = 1] = "Desktop";
        UIKind[UIKind["Web"] = 2] = "Web";
    })(UIKind || (exports.UIKind = UIKind = {}));
    var ExtensionHostExitCode;
    (function (ExtensionHostExitCode) {
        // nodejs uses codes 1-13 and exit codes >128 are signal exits
        ExtensionHostExitCode[ExtensionHostExitCode["VersionMismatch"] = 55] = "VersionMismatch";
        ExtensionHostExitCode[ExtensionHostExitCode["UnexpectedError"] = 81] = "UnexpectedError";
    })(ExtensionHostExitCode || (exports.ExtensionHostExitCode = ExtensionHostExitCode = {}));
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["Initialized"] = 0] = "Initialized";
        MessageType[MessageType["Ready"] = 1] = "Ready";
        MessageType[MessageType["Terminate"] = 2] = "Terminate";
    })(MessageType || (exports.MessageType = MessageType = {}));
    function createMessageOfType(type) {
        const result = buffer_1.VSBuffer.alloc(1);
        switch (type) {
            case 0 /* MessageType.Initialized */:
                result.writeUInt8(1, 0);
                break;
            case 1 /* MessageType.Ready */:
                result.writeUInt8(2, 0);
                break;
            case 2 /* MessageType.Terminate */:
                result.writeUInt8(3, 0);
                break;
        }
        return result;
    }
    exports.createMessageOfType = createMessageOfType;
    function isMessageOfType(message, type) {
        if (message.byteLength !== 1) {
            return false;
        }
        switch (message.readUInt8(0)) {
            case 1: return type === 0 /* MessageType.Initialized */;
            case 2: return type === 1 /* MessageType.Ready */;
            case 3: return type === 2 /* MessageType.Terminate */;
            default: return false;
        }
    }
    exports.isMessageOfType = isMessageOfType;
    var NativeLogMarkers;
    (function (NativeLogMarkers) {
        NativeLogMarkers["Start"] = "START_NATIVE_LOG";
        NativeLogMarkers["End"] = "END_NATIVE_LOG";
    })(NativeLogMarkers || (exports.NativeLogMarkers = NativeLogMarkers = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdFByb3RvY29sLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9ucy9jb21tb24vZXh0ZW5zaW9uSG9zdFByb3RvY29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNGaEcsSUFBWSxNQUdYO0lBSEQsV0FBWSxNQUFNO1FBQ2pCLHlDQUFXLENBQUE7UUFDWCxpQ0FBTyxDQUFBO0lBQ1IsQ0FBQyxFQUhXLE1BQU0sc0JBQU4sTUFBTSxRQUdqQjtJQUVELElBQWtCLHFCQUlqQjtJQUpELFdBQWtCLHFCQUFxQjtRQUN0Qyw4REFBOEQ7UUFDOUQsd0ZBQW9CLENBQUE7UUFDcEIsd0ZBQW9CLENBQUE7SUFDckIsQ0FBQyxFQUppQixxQkFBcUIscUNBQXJCLHFCQUFxQixRQUl0QztJQWtCRCxJQUFrQixXQUlqQjtJQUpELFdBQWtCLFdBQVc7UUFDNUIsMkRBQVcsQ0FBQTtRQUNYLCtDQUFLLENBQUE7UUFDTCx1REFBUyxDQUFBO0lBQ1YsQ0FBQyxFQUppQixXQUFXLDJCQUFYLFdBQVcsUUFJNUI7SUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxJQUFpQjtRQUNwRCxNQUFNLE1BQU0sR0FBRyxpQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVqQyxRQUFRLElBQUksRUFBRSxDQUFDO1lBQ2Q7Z0JBQThCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE1BQU07WUFDN0Q7Z0JBQXdCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE1BQU07WUFDdkQ7Z0JBQTRCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE1BQU07UUFDNUQsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQVZELGtEQVVDO0lBRUQsU0FBZ0IsZUFBZSxDQUFDLE9BQWlCLEVBQUUsSUFBaUI7UUFDbkUsSUFBSSxPQUFPLENBQUMsVUFBVSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzlCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELFFBQVEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzlCLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLG9DQUE0QixDQUFDO1lBQ2hELEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLDhCQUFzQixDQUFDO1lBQzFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLGtDQUEwQixDQUFDO1lBQzlDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDO1FBQ3ZCLENBQUM7SUFDRixDQUFDO0lBWEQsMENBV0M7SUFFRCxJQUFrQixnQkFHakI7SUFIRCxXQUFrQixnQkFBZ0I7UUFDakMsOENBQTBCLENBQUE7UUFDMUIsMENBQXNCLENBQUE7SUFDdkIsQ0FBQyxFQUhpQixnQkFBZ0IsZ0NBQWhCLGdCQUFnQixRQUdqQyJ9
//# sourceURL=../../../vs/workbench/services/extensions/common/extensionHostProtocol.js
})