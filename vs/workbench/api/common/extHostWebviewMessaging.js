(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer"], function (require, exports, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deserializeWebviewMessage = exports.serializeWebviewMessage = void 0;
    class ArrayBufferSet {
        constructor() {
            this.buffers = [];
        }
        add(buffer) {
            let index = this.buffers.indexOf(buffer);
            if (index < 0) {
                index = this.buffers.length;
                this.buffers.push(buffer);
            }
            return index;
        }
    }
    function serializeWebviewMessage(message, options) {
        if (options.serializeBuffersForPostMessage) {
            // Extract all ArrayBuffers from the message and replace them with references.
            const arrayBuffers = new ArrayBufferSet();
            const replacer = (_key, value) => {
                if (value instanceof ArrayBuffer) {
                    const index = arrayBuffers.add(value);
                    return {
                        $$vscode_array_buffer_reference$$: true,
                        index,
                    };
                }
                else if (ArrayBuffer.isView(value)) {
                    const type = getTypedArrayType(value);
                    if (type) {
                        const index = arrayBuffers.add(value.buffer);
                        return {
                            $$vscode_array_buffer_reference$$: true,
                            index,
                            view: {
                                type: type,
                                byteLength: value.byteLength,
                                byteOffset: value.byteOffset,
                            }
                        };
                    }
                }
                return value;
            };
            const serializedMessage = JSON.stringify(message, replacer);
            const buffers = arrayBuffers.buffers.map(arrayBuffer => {
                const bytes = new Uint8Array(arrayBuffer);
                return buffer_1.VSBuffer.wrap(bytes);
            });
            return { message: serializedMessage, buffers };
        }
        else {
            return { message: JSON.stringify(message), buffers: [] };
        }
    }
    exports.serializeWebviewMessage = serializeWebviewMessage;
    function getTypedArrayType(value) {
        switch (value.constructor.name) {
            case 'Int8Array': return 1 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int8Array */;
            case 'Uint8Array': return 2 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint8Array */;
            case 'Uint8ClampedArray': return 3 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint8ClampedArray */;
            case 'Int16Array': return 4 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int16Array */;
            case 'Uint16Array': return 5 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint16Array */;
            case 'Int32Array': return 6 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int32Array */;
            case 'Uint32Array': return 7 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint32Array */;
            case 'Float32Array': return 8 /* extHostProtocol.WebviewMessageArrayBufferViewType.Float32Array */;
            case 'Float64Array': return 9 /* extHostProtocol.WebviewMessageArrayBufferViewType.Float64Array */;
            case 'BigInt64Array': return 10 /* extHostProtocol.WebviewMessageArrayBufferViewType.BigInt64Array */;
            case 'BigUint64Array': return 11 /* extHostProtocol.WebviewMessageArrayBufferViewType.BigUint64Array */;
        }
        return undefined;
    }
    function deserializeWebviewMessage(jsonMessage, buffers) {
        const arrayBuffers = buffers.map(buffer => {
            const arrayBuffer = new ArrayBuffer(buffer.byteLength);
            const uint8Array = new Uint8Array(arrayBuffer);
            uint8Array.set(buffer.buffer);
            return arrayBuffer;
        });
        const reviver = !buffers.length ? undefined : (_key, value) => {
            if (value && typeof value === 'object' && value.$$vscode_array_buffer_reference$$) {
                const ref = value;
                const { index } = ref;
                const arrayBuffer = arrayBuffers[index];
                if (ref.view) {
                    switch (ref.view.type) {
                        case 1 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int8Array */: return new Int8Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int8Array.BYTES_PER_ELEMENT);
                        case 2 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint8Array */: return new Uint8Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint8Array.BYTES_PER_ELEMENT);
                        case 3 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint8ClampedArray */: return new Uint8ClampedArray(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint8ClampedArray.BYTES_PER_ELEMENT);
                        case 4 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int16Array */: return new Int16Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int16Array.BYTES_PER_ELEMENT);
                        case 5 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint16Array */: return new Uint16Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint16Array.BYTES_PER_ELEMENT);
                        case 6 /* extHostProtocol.WebviewMessageArrayBufferViewType.Int32Array */: return new Int32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int32Array.BYTES_PER_ELEMENT);
                        case 7 /* extHostProtocol.WebviewMessageArrayBufferViewType.Uint32Array */: return new Uint32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint32Array.BYTES_PER_ELEMENT);
                        case 8 /* extHostProtocol.WebviewMessageArrayBufferViewType.Float32Array */: return new Float32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Float32Array.BYTES_PER_ELEMENT);
                        case 9 /* extHostProtocol.WebviewMessageArrayBufferViewType.Float64Array */: return new Float64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Float64Array.BYTES_PER_ELEMENT);
                        case 10 /* extHostProtocol.WebviewMessageArrayBufferViewType.BigInt64Array */: return new BigInt64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / BigInt64Array.BYTES_PER_ELEMENT);
                        case 11 /* extHostProtocol.WebviewMessageArrayBufferViewType.BigUint64Array */: return new BigUint64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / BigUint64Array.BYTES_PER_ELEMENT);
                        default: throw new Error('Unknown array buffer view type');
                    }
                }
                return arrayBuffer;
            }
            return value;
        };
        const message = JSON.parse(jsonMessage, reviver);
        return { message, arrayBuffers };
    }
    exports.deserializeWebviewMessage = deserializeWebviewMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdlYnZpZXdNZXNzYWdpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RXZWJ2aWV3TWVzc2FnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxNQUFNLGNBQWM7UUFBcEI7WUFDaUIsWUFBTyxHQUFrQixFQUFFLENBQUM7UUFVN0MsQ0FBQztRQVJPLEdBQUcsQ0FBQyxNQUFtQjtZQUM3QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDZixLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7S0FDRDtJQUVELFNBQWdCLHVCQUF1QixDQUN0QyxPQUFZLEVBQ1osT0FBcUQ7UUFFckQsSUFBSSxPQUFPLENBQUMsOEJBQThCLEVBQUUsQ0FBQztZQUM1Qyw4RUFBOEU7WUFDOUUsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUUxQyxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQVksRUFBRSxLQUFVLEVBQUUsRUFBRTtnQkFDN0MsSUFBSSxLQUFLLFlBQVksV0FBVyxFQUFFLENBQUM7b0JBQ2xDLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3RDLE9BQTJEO3dCQUMxRCxpQ0FBaUMsRUFBRSxJQUFJO3dCQUN2QyxLQUFLO3FCQUNMLENBQUM7Z0JBQ0gsQ0FBQztxQkFBTSxJQUFJLFdB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
//# sourceURL=../../../vs/workbench/api/common/extHostWebviewMessaging.js
})