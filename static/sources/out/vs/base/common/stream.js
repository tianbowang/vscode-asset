/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle"], function (require, exports, errors_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prefixedStream = exports.prefixedReadable = exports.transform = exports.toReadable = exports.emptyStream = exports.toStream = exports.peekStream = exports.listenStream = exports.consumeStream = exports.peekReadable = exports.consumeReadable = exports.newWriteableStream = exports.isReadableBufferedStream = exports.isReadableStream = exports.isReadable = void 0;
    function isReadable(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return typeof candidate.read === 'function';
    }
    exports.isReadable = isReadable;
    function isReadableStream(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return [candidate.on, candidate.pause, candidate.resume, candidate.destroy].every(fn => typeof fn === 'function');
    }
    exports.isReadableStream = isReadableStream;
    function isReadableBufferedStream(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return isReadableStream(candidate.stream) && Array.isArray(candidate.buffer) && typeof candidate.ended === 'boolean';
    }
    exports.isReadableBufferedStream = isReadableBufferedStream;
    function newWriteableStream(reducer, options) {
        return new WriteableStreamImpl(reducer, options);
    }
    exports.newWriteableStream = newWriteableStream;
    class WriteableStreamImpl {
        constructor(reducer, options) {
            this.reducer = reducer;
            this.options = options;
            this.state = {
                flowing: false,
                ended: false,
                destroyed: false
            };
            this.buffer = {
                data: [],
                error: []
            };
            this.listeners = {
                data: [],
                error: [],
                end: []
            };
            this.pendingWritePromises = [];
        }
        pause() {
            if (this.state.destroyed) {
                return;
            }
            this.state.flowing = false;
        }
        resume() {
            if (this.state.destroyed) {
                return;
            }
            if (!this.state.flowing) {
                this.state.flowing = true;
                // emit buffered events
                this.flowData();
                this.flowErrors();
                this.flowEnd();
            }
        }
        write(data) {
            if (this.state.destroyed) {
                return;
            }
            // flowing: directly send the data to listeners
            if (this.state.flowing) {
                this.emitData(data);
            }
            // not yet flowing: buffer data until flowing
            else {
                this.buffer.data.push(data);
                // highWaterMark: if configured, signal back when buffer reached limits
                if (typeof this.options?.highWaterMark === 'number' && this.buffer.data.length > this.options.highWaterMark) {
                    return new Promise(resolve => this.pendingWritePromises.push(resolve));
                }
            }
        }
        error(error) {
            if (this.state.destroyed) {
                return;
            }
            // flowing: directly send the error to listeners
            if (this.state.flowing) {
                this.emitError(error);
            }
            // not yet flowing: buffer errors until flowing
            else {
                this.buffer.error.push(error);
            }
        }
        end(result) {
            if (this.state.destroyed) {
                return;
            }
            // end with data if provided
            if (typeof result !== 'undefined') {
                this.write(result);
            }
            // flowing: send end event to listeners
            if (this.state.flowing) {
                this.emitEnd();
                this.destroy();
            }
            // not yet flowing: remember state
            else {
                this.state.ended = true;
            }
        }
        emitData(data) {
            this.listeners.data.slice(0).forEach(listener => listener(data)); // slice to avoid listener mutation from delivering event
        }
        emitError(error) {
            if (this.listeners.error.length === 0) {
                (0, errors_1.onUnexpectedError)(error); // nobody listened to this error so we log it as unexpected
            }
            else {
                this.listeners.error.slice(0).forEach(listener => listener(error)); // slice to avoid listener mutation from delivering event
            }
        }
        emitEnd() {
            this.listeners.end.slice(0).forEach(listener => listener()); // slice to avoid listener mutation from delivering event
        }
        on(event, callback) {
            if (this.state.destroyed) {
                return;
            }
            switch (event) {
                case 'data':
                    this.listeners.data.push(callback);
                    // switch into flowing mode as soon as the first 'data'
                    // listener is added and we are not yet in flowing mode
                    this.resume();
                    break;
                case 'end':
                    this.listeners.end.push(callback);
                    // emit 'end' event directly if we are flowing
                    // and the end has already been reached
                    //
                    // finish() when it went through
                    if (this.state.flowing && this.flowEnd()) {
                        this.destroy();
                    }
                    break;
                case 'error':
                    this.listeners.error.push(callback);
                    // emit buffered 'error' events unless done already
                    // now that we know that we have at least one listener
                    if (this.state.flowing) {
                        this.flowErrors();
                    }
                    break;
            }
        }
        removeListener(event, callback) {
            if (this.state.destroyed) {
                return;
            }
            let listeners = undefined;
            switch (event) {
                case 'data':
                    listeners = this.listeners.data;
                    break;
                case 'end':
                    listeners = this.listeners.end;
                    break;
                case 'error':
                    listeners = this.listeners.error;
                    break;
            }
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
            }
        }
        flowData() {
            if (this.buffer.data.length > 0) {
                const fullDataBuffer = this.reducer(this.buffer.data);
                this.emitData(fullDataBuffer);
                this.buffer.data.length = 0;
                // When the buffer is empty, resolve all pending writers
                const pendingWritePromises = [...this.pendingWritePromises];
                this.pendingWritePromises.length = 0;
                pendingWritePromises.forEach(pendingWritePromise => pendingWritePromise());
            }
        }
        flowErrors() {
            if (this.listeners.error.length > 0) {
                for (const error of this.buffer.error) {
                    this.emitError(error);
                }
                this.buffer.error.length = 0;
            }
        }
        flowEnd() {
            if (this.state.ended) {
                this.emitEnd();
                return this.listeners.end.length > 0;
            }
            return false;
        }
        destroy() {
            if (!this.state.destroyed) {
                this.state.destroyed = true;
                this.state.ended = true;
                this.buffer.data.length = 0;
                this.buffer.error.length = 0;
                this.listeners.data.length = 0;
                this.listeners.error.length = 0;
                this.listeners.end.length = 0;
                this.pendingWritePromises.length = 0;
            }
        }
    }
    /**
     * Helper to fully read a T readable into a T.
     */
    function consumeReadable(readable, reducer) {
        const chunks = [];
        let chunk;
        while ((chunk = readable.read()) !== null) {
            chunks.push(chunk);
        }
        return reducer(chunks);
    }
    exports.consumeReadable = consumeReadable;
    /**
     * Helper to read a T readable up to a maximum of chunks. If the limit is
     * reached, will return a readable instead to ensure all data can still
     * be read.
     */
    function peekReadable(readable, reducer, maxChunks) {
        const chunks = [];
        let chunk = undefined;
        while ((chunk = readable.read()) !== null && chunks.length < maxChunks) {
            chunks.push(chunk);
        }
        // If the last chunk is null, it means we reached the end of
        // the readable and return all the data at once
        if (chunk === null && chunks.length > 0) {
            return reducer(chunks);
        }
        // Otherwise, we still have a chunk, it means we reached the maxChunks
        // value and as such we return a new Readable that first returns
        // the existing read chunks and then continues with reading from
        // the underlying readable.
        return {
            read: () => {
                // First consume chunks from our array
                if (chunks.length > 0) {
                    return chunks.shift();
                }
                // Then ensure to return our last read chunk
                if (typeof chunk !== 'undefined') {
                    const lastReadChunk = chunk;
                    // explicitly use undefined here to indicate that we consumed
                    // the chunk, which could have either been null or valued.
                    chunk = undefined;
                    return lastReadChunk;
                }
                // Finally delegate back to the Readable
                return readable.read();
            }
        };
    }
    exports.peekReadable = peekReadable;
    function consumeStream(stream, reducer) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            listenStream(stream, {
                onData: chunk => {
                    if (reducer) {
                        chunks.push(chunk);
                    }
                },
                onError: error => {
                    if (reducer) {
                        reject(error);
                    }
                    else {
                        resolve(undefined);
                    }
                },
                onEnd: () => {
                    if (reducer) {
                        resolve(reducer(chunks));
                    }
                    else {
                        resolve(undefined);
                    }
                }
            });
        });
    }
    exports.consumeStream = consumeStream;
    /**
     * Helper to listen to all events of a T stream in proper order.
     */
    function listenStream(stream, listener, token) {
        stream.on('error', error => {
            if (!token?.isCancellationRequested) {
                listener.onError(error);
            }
        });
        stream.on('end', () => {
            if (!token?.isCancellationRequested) {
                listener.onEnd();
            }
        });
        // Adding the `data` listener will turn the stream
        // into flowing mode. As such it is important to
        // add this listener last (DO NOT CHANGE!)
        stream.on('data', data => {
            if (!token?.isCancellationRequested) {
                listener.onData(data);
            }
        });
    }
    exports.listenStream = listenStream;
    /**
     * Helper to peek up to `maxChunks` into a stream. The return type signals if
     * the stream has ended or not. If not, caller needs to add a `data` listener
     * to continue reading.
     */
    function peekStream(stream, maxChunks) {
        return new Promise((resolve, reject) => {
            const streamListeners = new lifecycle_1.DisposableStore();
            const buffer = [];
            // Data Listener
            const dataListener = (chunk) => {
                // Add to buffer
                buffer.push(chunk);
                // We reached maxChunks and thus need to return
                if (buffer.length > maxChunks) {
                    // Dispose any listeners and ensure to pause the
                    // stream so that it can be consumed again by caller
                    streamListeners.dispose();
                    stream.pause();
                    return resolve({ stream, buffer, ended: false });
                }
            };
            // Error Listener
            const errorListener = (error) => {
                streamListeners.dispose();
                return reject(error);
            };
            // End Listener
            const endListener = () => {
                streamListeners.dispose();
                return resolve({ stream, buffer, ended: true });
            };
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('error', errorListener)));
            stream.on('error', errorListener);
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('end', endListener)));
            stream.on('end', endListener);
            // Important: leave the `data` listener last because
            // this can turn the stream into flowing mode and we
            // want `error` events to be received as well.
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('data', dataListener)));
            stream.on('data', dataListener);
        });
    }
    exports.peekStream = peekStream;
    /**
     * Helper to create a readable stream from an existing T.
     */
    function toStream(t, reducer) {
        const stream = newWriteableStream(reducer);
        stream.end(t);
        return stream;
    }
    exports.toStream = toStream;
    /**
     * Helper to create an empty stream
     */
    function emptyStream() {
        const stream = newWriteableStream(() => { throw new Error('not supported'); });
        stream.end();
        return stream;
    }
    exports.emptyStream = emptyStream;
    /**
     * Helper to convert a T into a Readable<T>.
     */
    function toReadable(t) {
        let consumed = false;
        return {
            read: () => {
                if (consumed) {
                    return null;
                }
                consumed = true;
                return t;
            }
        };
    }
    exports.toReadable = toReadable;
    /**
     * Helper to transform a readable stream into another stream.
     */
    function transform(stream, transformer, reducer) {
        const target = newWriteableStream(reducer);
        listenStream(stream, {
            onData: data => target.write(transformer.data(data)),
            onError: error => target.error(transformer.error ? transformer.error(error) : error),
            onEnd: () => target.end()
        });
        return target;
    }
    exports.transform = transform;
    /**
     * Helper to take an existing readable that will
     * have a prefix injected to the beginning.
     */
    function prefixedReadable(prefix, readable, reducer) {
        let prefixHandled = false;
        return {
            read: () => {
                const chunk = readable.read();
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    // If we have also a read-result, make
                    // sure to reduce it to a single result
                    if (chunk !== null) {
                        return reducer([prefix, chunk]);
                    }
                    // Otherwise, just return prefix directly
                    return prefix;
                }
                return chunk;
            }
        };
    }
    exports.prefixedReadable = prefixedReadable;
    /**
     * Helper to take an existing stream that will
     * have a prefix injected to the beginning.
     */
    function prefixedStream(prefix, stream, reducer) {
        let prefixHandled = false;
        const target = newWriteableStream(reducer);
        listenStream(stream, {
            onData: data => {
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    return target.write(reducer([prefix, data]));
                }
                return target.write(data);
            },
            onError: error => target.error(error),
            onEnd: () => {
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    target.write(prefix);
                }
                target.end();
            }
        });
        return target;
    }
    exports.prefixedStream = prefixedStream;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9zdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBK0VoRyxTQUFnQixVQUFVLENBQUksR0FBWTtRQUN6QyxNQUFNLFNBQVMsR0FBRyxHQUE4QixDQUFDO1FBQ2pELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNoQixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxPQUFPLE9BQU8sU0FBUyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUM7SUFDN0MsQ0FBQztJQVBELGdDQU9DO0lBZ0VELFNBQWdCLGdCQUFnQixDQUFJLEdBQVk7UUFDL0MsTUFBTSxTQUFTLEdBQUcsR0FBb0MsQ0FBQztRQUN2RCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDaEIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxVQUFVLENBQUMsQ0FBQztJQUNuSCxDQUFDO0lBUEQsNENBT0M7SUFFRCxTQUFnQix3QkFBd0IsQ0FBSSxHQUFZO1FBQ3ZELE1BQU0sU0FBUyxHQUFHLEdBQTRDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELE9BQU8sZ0JBQWdCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sU0FBUyxDQUFDLEtBQUssS0FB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