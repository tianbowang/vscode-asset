/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BugIndicatingError = exports.ErrorNoTelemetry = exports.ExpectedError = exports.NotSupportedError = exports.NotImplementedError = exports.getErrorMessage = exports.ReadonlyError = exports.illegalState = exports.illegalArgument = exports.canceled = exports.CancellationError = exports.isCancellationError = exports.transformErrorForSerialization = exports.onUnexpectedExternalError = exports.onUnexpectedError = exports.isSigPipeError = exports.setUnexpectedErrorHandler = exports.errorHandler = exports.ErrorHandler = void 0;
    // Avoid circular dependency on EventEmitter by implementing a subset of the interface.
    class ErrorHandler {
        constructor() {
            this.listeners = [];
            this.unexpectedErrorHandler = function (e) {
                setTimeout(() => {
                    if (e.stack) {
                        if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
                            throw new ErrorNoTelemetry(e.message + '\n\n' + e.stack);
                        }
                        throw new Error(e.message + '\n\n' + e.stack);
                    }
                    throw e;
                }, 0);
            };
        }
        addListener(listener) {
            this.listeners.push(listener);
            return () => {
                this._removeListener(listener);
            };
        }
        emit(e) {
            this.listeners.forEach((listener) => {
                listener(e);
            });
        }
        _removeListener(listener) {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        }
        setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
            this.unexpectedErrorHandler = newUnexpectedErrorHandler;
        }
        getUnexpectedErrorHandler() {
            return this.unexpectedErrorHandler;
        }
        onUnexpectedError(e) {
            this.unexpectedErrorHandler(e);
            this.emit(e);
        }
        // For external errors, we don't want the listeners to be called
        onUnexpectedExternalError(e) {
            this.unexpectedErrorHandler(e);
        }
    }
    exports.ErrorHandler = ErrorHandler;
    exports.errorHandler = new ErrorHandler();
    /** @skipMangle */
    function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        exports.errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
    }
    exports.setUnexpectedErrorHandler = setUnexpectedErrorHandler;
    /**
     * Returns if the error is a SIGPIPE error. SIGPIPE errors should generally be
     * logged at most once, to avoid a loop.
     *
     * @see https://github.com/microsoft/vscode-remote-release/issues/6481
     */
    function isSigPipeError(e) {
        if (!e || typeof e !== 'object') {
            return false;
        }
        const cast = e;
        return cast.code === 'EPIPE' && cast.syscall?.toUpperCase() === 'WRITE';
    }
    exports.isSigPipeError = isSigPipeError;
    function onUnexpectedError(e) {
        // ignore errors from cancelled promises
        if (!isCancellationError(e)) {
            exports.errorHandler.onUnexpectedError(e);
        }
        return undefined;
    }
    exports.onUnexpectedError = onUnexpectedError;
    function onUnexpectedExternalError(e) {
        // ignore errors from cancelled promises
        if (!isCancellationError(e)) {
            exports.errorHandler.onUnexpectedExternalError(e);
        }
        return undefined;
    }
    exports.onUnexpectedExternalError = onUnexpectedExternalError;
    function transformErrorForSerialization(error) {
        if (error instanceof Error) {
            const { name, message } = error;
            const stack = error.stacktrace || error.stack;
            return {
                $isError: true,
                name,
                message,
                stack,
                noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error)
            };
        }
        // return as is
        return error;
    }
    exports.transformErrorForSerialization = transformErrorForSerialization;
    const canceledName = 'Canceled';
    /**
     * Checks if the given error is a promise in canceled state
     */
    function isCancellationError(error) {
        if (error instanceof CancellationError) {
            return true;
        }
        return error instanceof Error && error.name === canceledName && error.message === canceledName;
    }
    exports.isCancellationError = isCancellationError;
    // !!!IMPORTANT!!!
    // Do NOT change this class because it is also used as an API-type.
    class CancellationError extends Error {
        constructor() {
            super(canceledName);
            this.name = this.message;
        }
    }
    exports.CancellationError = CancellationError;
    /**
     * @deprecated use {@link CancellationError `new CancellationError()`} instead
     */
    function canceled() {
        const error = new Error(canceledName);
        error.name = error.message;
        return error;
    }
    exports.canceled = canceled;
    function illegalArgument(name) {
        if (name) {
            return new Error(`Illegal argument: ${name}`);
        }
        else {
            return new Error('Illegal argument');
        }
    }
    exports.illegalArgument = illegalArgument;
    function illegalState(name) {
        if (name) {
            return new Error(`Illegal state: ${name}`);
        }
        else {
            return new Error('Illegal state');
        }
    }
    exports.illegalState = illegalState;
    class ReadonlyError extends TypeError {
        constructor(name) {
            super(name ? `${name} is read-only and cannot be changed` : 'Cannot change read-only property');
        }
    }
    exports.ReadonlyError = ReadonlyError;
    function getErrorMessage(err) {
        if (!err) {
            return 'Error';
        }
        if (err.message) {
            return err.message;
        }
        if (err.stack) {
            return err.stack.split('\n')[0];
        }
        return String(err);
    }
    exports.getErrorMessage = getErrorMessage;
    class NotImplementedError extends Error {
        constructor(message) {
            super('NotImplemented');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.NotImplementedError = NotImplementedError;
    class NotSupportedError extends Error {
        constructor(message) {
            super('NotSupported');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.NotSupportedError = NotSupportedError;
    class ExpectedError extends Error {
        constructor() {
            super(...arguments);
            this.isExpected = true;
        }
    }
    exports.ExpectedError = ExpectedError;
    /**
     * Error that when thrown won't be logged in telemetry as an unhandled error.
     */
    class ErrorNoTelemetry extends Error {
        constructor(msg) {
            super(msg);
            this.name = 'CodeExpectedError';
        }
        static fromError(err) {
            if (err instanceof ErrorNoTelemetry) {
                return err;
            }
            const result = new ErrorNoTelemetry();
            result.message = err.message;
            result.stack = err.stack;
            return result;
        }
        static isErrorNoTelemetry(err) {
            return err.name === 'CodeExpectedError';
        }
    }
    exports.ErrorNoTelemetry = ErrorNoTelemetry;
    /**
     * This error indicates a bug.
     * Do not throw this for invalid user input.
     * Only catch this error to recover gracefully from bugs.
     */
    class BugIndicatingError extends Error {
        constructor(message) {
            super(message || 'An unexpected bug occurred.');
            Object.setPrototypeOf(this, BugIndicatingError.prototype);
            // Because we know for sure only buggy code throws this,
            // we definitely want to break here and fix the bug.
            // eslint-disable-next-line no-debugger
            // debugger;
        }
    }
    exports.BugIndicatingError = BugIndicatingError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9lcnJvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLHVGQUF1RjtJQUN2RixNQUFhLFlBQVk7UUFJeEI7WUFFQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUVwQixJQUFJLENBQUMsc0JBQXNCLEdBQUcsVUFBVSxDQUFNO2dCQUM3QyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUNmLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNiLElBQUksZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs0QkFDNUMsTUFBTSxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDMUQsQ0FBQzt3QkFFRCxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDL0MsQ0FBQztvQkFFRCxNQUFNLENBQUMsQ0FBQztnQkFDVCxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUM7UUFDSCxDQUFDO1FBRUQsV0FBVyxDQUFDLFFBQStCO1lBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTlCLE9BQU8sR0FBRyxFQUFFO2dCQUNYLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQztRQUVPLElBQUksQ0FBQyxDQUFNO1lBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JB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