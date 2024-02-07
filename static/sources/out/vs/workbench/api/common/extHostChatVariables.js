/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/base/common/errors", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, lifecycle_1, extHost_protocol_1, errors_1, extHostTypeConverters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostChatVariables = void 0;
    class ExtHostChatVariables {
        static { this._idPool = 0; }
        constructor(mainContext) {
            this._resolver = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadChatVariables);
        }
        async $resolveVariable(handle, messageText, token) {
            const item = this._resolver.get(handle);
            if (!item) {
                return undefined;
            }
            try {
                const value = await item.resolver.resolve(item.data.name, { prompt: messageText }, token);
                if (value) {
                    return value.map(extHostTypeConverters_1.ChatVariable.from);
                }
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
            }
            return undefined;
        }
        registerVariableResolver(extension, name, description, resolver) {
            const handle = ExtHostChatVariables._idPool++;
            this._resolver.set(handle, { extension: extension.identifier, data: { name, description }, resolver: resolver });
            this._proxy.$registerVariable(handle, { name, description });
            return (0, lifecycle_1.toDisposable)(() => {
                this._resolver.delete(handle);
                this._proxy.$unregisterVariable(handle);
            });
        }
    }
    exports.ExtHostChatVariables = ExtHostChatVariables;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENoYXRWYXJpYWJsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RDaGF0VmFyaWFibGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFhLG9CQUFvQjtpQkFFakIsWUFBTyxHQUFHLENBQUMsQUFBSixDQUFLO1FBSzNCLFlBQVksV0FBeUI7WUFIcEIsY0FBUyxHQUFHLElBQUksR0FBRyxFQUE4RyxDQUFDO1lBSWxKLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDekUsQ0FBQztRQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFjLEVBQUUsV0FBbUIsRUFBRSxLQUF3QjtZQUNuRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1gsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUNELElBQUksQ0FBQztnQkFDSixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMxRixJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNYLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxvQ0FBWSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO1lBQ0YsQ0FBQztZQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ2QsSUFBQSxrQ0FBeUIsRUFBQyxHQUFHLENBQUMsQ0FBQztZQUNoQyxDQUFDO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELHdCQUF3QixDQUFDLFNBQWdDLEVBQUUsSUFBWSxFQUFFLFdBQW1CLEVBQUUsUUFBcUM7WUFDbEksTUFBTSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pILElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFFN0QsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7O0lBcENGLG9EQXFDQyJ9