/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/workbench/services/extensions/common/proxyIdentifier", "vs/workbench/services/extensions/common/rpcProtocol"], function (require, exports, async_1, proxyIdentifier_1, rpcProtocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestRPCProtocol = exports.AnyCallRPCProtocol = exports.SingleProxyRPCProtocol = void 0;
    function SingleProxyRPCProtocol(thing) {
        return {
            _serviceBrand: undefined,
            remoteAuthority: null,
            getProxy() {
                return thing;
            },
            set(identifier, value) {
                return value;
            },
            dispose: undefined,
            assertRegistered: undefined,
            drain: undefined,
            extensionHostKind: 1 /* ExtensionHostKind.LocalProcess */
        };
    }
    exports.SingleProxyRPCProtocol = SingleProxyRPCProtocol;
    /** Makes a fake {@link SingleProxyRPCProtocol} on which any method can be called */
    function AnyCallRPCProtocol(useCalls) {
        return SingleProxyRPCProtocol(new Proxy({}, {
            get(_target, prop) {
                if (useCalls && prop in useCalls) {
                    return useCalls[prop];
                }
                return () => Promise.resolve(undefined);
            }
        }));
    }
    exports.AnyCallRPCProtocol = AnyCallRPCProtocol;
    class TestRPCProtocol {
        constructor() {
            this.remoteAuthority = null;
            this.extensionHostKind = 1 /* ExtensionHostKind.LocalProcess */;
            this._callCountValue = 0;
            this._locals = Object.create(null);
            this._proxies = Object.create(null);
        }
        drain() {
            return Promise.resolve();
        }
        get _callCount() {
            return this._callCountValue;
        }
        set _callCount(value) {
            this._callCountValue = value;
            if (this._callCountValue === 0) {
                this._completeIdle?.();
                this._idle = undefined;
            }
        }
        sync() {
            return new Promise((c) => {
                setTimeout(c, 0);
            }).then(() => {
                if (this._callCount === 0) {
                    return undefined;
                }
                if (!this._idle) {
                    this._idle = new Promise((c, e) => {
                        this._completeIdle = c;
                    });
                }
                return this._idle;
            });
        }
        getProxy(identifier) {
            if (!this._proxies[identifier.sid]) {
                this._proxies[identifier.sid] = this._createProxy(identifier.sid);
            }
            return this._proxies[identifier.sid];
        }
        _createProxy(proxyId) {
            const handler = {
                get: (target, name) => {
                    if (typeof name === 'string' && !target[name] && name.charCodeAt(0) === 36 /* CharCode.DollarSign */) {
                        target[name] = (...myArgs) => {
                            return this._remoteCall(proxyId, name, myArgs);
                        };
                    }
                    return target[name];
                }
            };
            return new Proxy(Object.create(null), handler);
        }
        set(identifier, value) {
            this._locals[identifier.sid] = value;
            return value;
        }
        _remoteCall(proxyId, path, args) {
            this._callCount++;
            return new Promise((c) => {
                setTimeout(c, 0);
            }).then(() => {
                const instance = this._locals[proxyId];
                // pretend the args went over the wire... (invoke .toJSON on objects...)
                const wireArgs = simulateWireTransfer(args);
                let p;
                try {
                    const result = instance[path].apply(instance, wireArgs);
                    p = (0, async_1.isThenable)(result) ? result : Promise.resolve(result);
                }
                catch (err) {
                    p = Promise.reject(err);
                }
                return p.then(result => {
                    this._callCount--;
                    // pretend the result went over the wire... (invoke .toJSON on objects...)
                    const wireResult = simulateWireTransfer(result);
                    return wireResult;
                }, err => {
                    this._callCount--;
                    return Promise.reject(err);
                });
            });
        }
        dispose() {
            throw new Error('Not implemented!');
        }
        assertRegistered(identifiers) {
            throw new Error('Not implemented!');
        }
    }
    exports.TestRPCProtocol = TestRPCProtocol;
    function simulateWireTransfer(obj) {
        if (!obj) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(simulateWireTransfer);
        }
        if (obj instanceof proxyIdentifier_1.SerializableObjectWithBuffers) {
            const { jsonString, referencedBuffers } = (0, rpcProtocol_1.stringifyJsonWithBufferRefs)(obj);
            return (0, rpcProtocol_1.parseJsonAndRestoreBufferRefs)(jsonString, referencedBuffers, null);
        }
        else {
            return JSON.parse(JSON.stringify(obj));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFJQQ1Byb3RvY29sLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvY29tbW9uL3Rlc3RSUENQcm90b2NvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsU0FBZ0Isc0JBQXNCLENBQUMsS0FBVTtRQUNoRCxPQUFPO1lBQ04sYUFBYSxFQUFFLFNBQVM7WUFDeEIsZUFBZSxFQUFFLElBQUs7WUFDdEIsUUFBUTtnQkFDUCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFDRCxHQUFHLENBQWlCLFVBQThCLEVBQUUsS0FBUTtnQkFDM0QsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsT0FBTyxFQUFFLFNBQVU7WUFDbkIsZ0JBQWdCLEVBQUUsU0FBVTtZQUM1QixLQUFLLEVBQUUsU0FBVTtZQUNqQixpQkFBaUIsd0NBQWdDO1NBQ2pELENBQUM7SUFDSCxDQUFDO0lBZkQsd0RBZUM7SUFFRCxvRkFBb0Y7SUFDcEYsU0FBZ0Isa0JBQWtCLENBQUksUUFBbUM7UUFDeEUsT0FBTyxzQkFBc0IsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7WUFDM0MsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFZO2dCQUN4QixJQUFJLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFLENBQUM7b0JBQ2xDLE9BQVEsUUFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEMsQ0FBQztnQkFDRCxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekMsQ0FBQztTQUNELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQVRELGdEQVNDO0lBRUQsTUFBYSxlQUFlO1FBYTNCO1lBVk8sb0JBQWUsR0FBRyxJQUFLLENBQUM7WUFDeEIsc0JBQWlCLDBDQUFr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