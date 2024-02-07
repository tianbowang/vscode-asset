/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errors", "vs/nls", "vs/platform/files/common/files"], function (require, exports, buffer_1, errors_1, nls_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readFileIntoStream = void 0;
    /**
     * A helper to read a file from a provider with open/read/close capability into a stream.
     */
    async function readFileIntoStream(provider, resource, target, transformer, options, token) {
        let error = undefined;
        try {
            await doReadFileIntoStream(provider, resource, target, transformer, options, token);
        }
        catch (err) {
            error = err;
        }
        finally {
            if (error && options.errorTransformer) {
                error = options.errorTransformer(error);
            }
            if (typeof error !== 'undefined') {
                target.error(error);
            }
            target.end();
        }
    }
    exports.readFileIntoStream = readFileIntoStream;
    async function doReadFileIntoStream(provider, resource, target, transformer, options, token) {
        // Check for cancellation
        throwIfCancelled(token);
        // open handle through provider
        const handle = await provider.open(resource, { create: false });
        try {
            // Check for cancellation
            throwIfCancelled(token);
            let totalBytesRead = 0;
            let bytesRead = 0;
            let allowedRemainingBytes = (options && typeof options.length === 'number') ? options.length : undefined;
            let buffer = buffer_1.VSBuffer.alloc(Math.min(options.bufferSize, typeof allowedRemainingBytes === 'number' ? allowedRemainingBytes : options.bufferSize));
            let posInFile = options && typeof options.position === 'number' ? options.position : 0;
            let posInBuffer = 0;
            do {
                // read from source (handle) at current position (pos) into buffer (buffer) at
                // buffer position (posInBuffer) up to the size of the buffer (buffer.byteLength).
                bytesRead = await provider.read(handle, posInFile, buffer.buffer, posInBuffer, buffer.byteLength - posInBuffer);
                posInFile += bytesRead;
                posInBuffer += bytesRead;
                totalBytesRead += bytesRead;
                if (typeof allowedRemainingBytes === 'number') {
                    allowedRemainingBytes -= bytesRead;
                }
                // when buffer full, create a new one and emit it through stream
                if (posInBuffer === buffer.byteLength) {
                    await target.write(transformer(buffer));
                    buffer = buffer_1.VSBuffer.alloc(Math.min(options.bufferSize, typeof allowedRemainingBytes === 'number' ? allowedRemainingBytes : options.bufferSize));
                    posInBuffer = 0;
                }
            } while (bytesRead > 0 && (typeof allowedRemainingBytes !== 'number' || allowedRemainingBytes > 0) && throwIfCancelled(token) && throwIfTooLarge(totalBytesRead, options));
            // wrap up with last buffer (also respect maxBytes if provided)
            if (posInBuffer > 0) {
                let lastChunkLength = posInBuffer;
                if (typeof allowedRemainingBytes === 'number') {
                    lastChunkLength = Math.min(posInBuffer, allowedRemainingBytes);
                }
                target.write(transformer(buffer.slice(0, lastChunkLength)));
            }
        }
        catch (error) {
            throw (0, files_1.ensureFileSystemProviderError)(error);
        }
        finally {
            await provider.close(handle);
        }
    }
    function throwIfCancelled(token) {
        if (token.isCancellationRequested) {
            throw (0, errors_1.canceled)();
        }
        return true;
    }
    function throwIfTooLarge(totalBytesRead, options) {
        // Return early if file is too large to load and we have configured limits
        if (typeof options?.limits?.size === 'number' && totalBytesRead > options.limits.size) {
            throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileTooLargeError', "File is too large to open"), files_1.FileSystemProviderErrorCode.FileTooLarge);
        }
        return true;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW8uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL2NvbW1vbi9pby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHOztPQUVHO0lBQ0ksS0FBSyxVQUFVLGtCQUFrQixDQUN2QyxRQUE2RCxFQUM3RCxRQUFhLEVBQ2IsTUFBMEIsRUFDMUIsV0FBMEMsRUFDMUMsT0FBaUMsRUFDakMsS0FBd0I7UUFFeEIsSUFBSSxLQUFLLEdBQXNCLFNBQVMsQ0FBQztRQUV6QyxJQUFJLENBQUM7WUFDSixNQUFNLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDZCxLQUFLLEdBQUcsR0FBRyxDQUFDO1FBQ2IsQ0FBQztnQkFBUyxDQUFDO1lBQ1YsSUFBSSxLQUFLLElBQUksT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3ZDLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekMsQ0FBQztZQUVELElBQUksT0FBTyxLQUFLLEtBQUssV0FBVyxFQUFFLENBQUM7Z0JBQ2xDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckIsQ0FBQztZQUVELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNkLENBQUM7SUFDRixDQUFDO0lBekJELGdEQXlCQztJQUVELEtBQUssVUFBVSxvQkFBb0IsQ0FBSSxRQUE2RCxFQUFFLFFBQWEsRUFBRSxNQUEwQixFQUFFLFdBQTBDLEVBQUUsT0FBaUMsRUFBRSxLQUF3QjtRQUV2UCx5QkFBeUI7UUFDekIsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFeEIs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