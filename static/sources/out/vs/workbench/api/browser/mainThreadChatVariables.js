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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, marshalling_1, extHost_protocol_1, chatVariables_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadChatVariables = void 0;
    let MainThreadChatVariables = class MainThreadChatVariables {
        constructor(extHostContext, _chatVariablesService) {
            this._chatVariablesService = _chatVariablesService;
            this._variables = new lifecycle_1.DisposableMap();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostChatVariables);
        }
        dispose() {
            this._variables.clearAndDisposeAll();
        }
        $registerVariable(handle, data) {
            const registration = this._chatVariablesService.registerVariable(data, async (messageText, _arg, _model, token) => {
                return (0, marshalling_1.revive)(await this._proxy.$resolveVariable(handle, messageText, token));
            });
            this._variables.set(handle, registration);
        }
        $unregisterVariable(handle) {
            this._variables.deleteAndDispose(handle);
        }
    };
    exports.MainThreadChatVariables = MainThreadChatVariables;
    exports.MainThreadChatVariables = MainThreadChatVariables = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadChatVariables),
        __param(1, chatVariables_1.IChatVariablesService)
    ], MainThreadChatVariables);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENoYXRWYXJpYWJsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkQ2hhdFZhcmlhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFTekYsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBdUI7UUFLbkMsWUFDQyxjQUErQixFQUNSLHFCQUE2RDtZQUE1QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBSnBFLGVBQVUsR0FBRyxJQUFJLHlCQUFhLEVBQVUsQ0FBQztZQU16RCxJQUFJLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFFRCxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsSUFBdUI7WUFDeEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ2pILE9BQU8sSUFBQSxvQkFBTSxFQUE4QixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzVHLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxNQUFjO1lBQ2pDLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUMsQ0FBQztLQUNELENBQUE7SUExQlksMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFEbkMsSUFBQSx1Q0FBb0IsRUFBQyw4QkFBVyxDQUFDLHVCQUF1QixDQUFDO1FBUXZELFdBQUEscUNBQXFCLENBQUE7T0FQWCx1QkFBdUIsQ0EwQm5DIn0=