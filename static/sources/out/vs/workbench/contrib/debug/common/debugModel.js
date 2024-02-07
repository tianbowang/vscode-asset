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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/observable", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/nls", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, arrays_1, arraysFind_1, async_1, buffer_1, cancellation_1, event_1, hash_1, lifecycle_1, objects_1, observable_1, resources, types_1, uri_1, uuid_1, range_1, nls, log_1, uriIdentity_1, debug_1, debugSource_1, disassemblyViewInput_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugModel = exports.ThreadAndSessionIds = exports.InstructionBreakpoint = exports.ExceptionBreakpoint = exports.DataBreakpoint = exports.FunctionBreakpoint = exports.Breakpoint = exports.BaseBreakpoint = exports.Enablement = exports.MemoryRegion = exports.getUriForDebugMemory = exports.Thread = exports.StackFrame = exports.ErrorScope = exports.Scope = exports.Variable = exports.Expression = exports.ExpressionContainer = void 0;
    class ExpressionContainer {
        static { this.allValues = new Map(); }
        // Use chunks to support variable paging #9537
        static { this.BASE_CHUNK_SIZE = 100; }
        constructor(session, threadId, _reference, id, namedVariables = 0, indexedVariables = 0, memoryReference = undefined, startOfVariables = 0, presentationHint = undefined) {
            this.session = session;
            this.threadId = threadId;
            this._reference = _reference;
            this.id = id;
            this.namedVariables = namedVariables;
            this.indexedVariables = indexedVariables;
            this.memoryReference = memoryReference;
            this.startOfVariables = startOfVariables;
            this.presentationHint = presentationHint;
            this.valueChanged = false;
            this._value = '';
        }
        get reference() {
            return this._reference;
        }
        set reference(value) {
            this._reference = value;
            this.children = undefined; // invalidate children cache
        }
        async evaluateLazy() {
            if (typeof this.reference === 'undefined') {
                return;
            }
            const response = await this.session.variables(this.reference, this.threadId, undefined, undefined, undefined);
            if (!response || !response.body || !response.body.variables || response.body.variables.length !== 1) {
                return;
            }
            const dummyVar = response.body.variables[0];
            this.reference = dummyVar.variablesReference;
            this._value = dummyVar.value;
            this.namedVariables = dummyVar.namedVariables;
            this.indexedVariables = dummyVar.indexedVariables;
            this.memoryReference = dummyVar.memoryReference;
            this.presentationHint = dummyVar.presentationHint;
            // Also call overridden method to adopt subclass props
            this.adoptLazyResponse(dummyVar);
        }
        adoptLazyResponse(response) {
        }
        getChildren() {
            if (!this.children) {
                this.children = this.doGetChildren();
            }
            return this.children;
        }
        async doGetChildren() {
            if (!this.hasChildren) {
                return [];
            }
            if (!this.getChildrenInChunks) {
                return this.fetchVariables(undefined, undefined, undefined);
            }
            // Check if object has named variables, fetch them independent from indexed variables #9670
            const children = this.namedVariables ? await this.fetchVariables(undefined, undefined, 'named') : [];
            // Use a dynamic chunk size based on the number of elements #9774
            let chunkSize = ExpressionContainer.BASE_CHUNK_SIZE;
            while (!!this.indexedVariables && this.indexedVariables > chunkSize * ExpressionContainer.BASE_CHUNK_SIZE) {
                chunkSize *= ExpressionContainer.BASE_CHUNK_SIZE;
            }
            if (!!this.indexedVariables && this.indexedVariables > chunkSize) {
                // There are a lot of children, create fake intermediate values that represent chunks #9537
                const numberOfChunks = Math.ceil(this.indexedVariables / chunkSize);
                for (let i = 0; i < numberOfChunks; i++) {
                    const start = (this.startOfVariables || 0) + i * chunkSize;
                    const count = Math.min(chunkSize, this.indexedVariables - i * chunkSize);
                    children.push(new Variable(this.session, this.threadId, this, this.reference, `[${start}..${start + count - 1}]`, '', '', undefined, count, undefined, { kind: 'virtual' }, undefined, undefined, true, start));
                }
                return children;
            }
            const variables = await this.fetchVariables(this.startOfVariables, this.indexedVariables, 'indexed');
            return children.concat(variables);
        }
        getId() {
            return this.id;
        }
        getSession() {
            return this.session;
        }
        get value() {
            return this._value;
        }
        get hasChildren() {
            // only variables with reference > 0 have children.
            return !!this.reference && this.reference > 0 && !this.presentationHint?.lazy;
        }
        async fetchVariables(start, count, filter) {
            try {
                const response = await this.session.variables(this.reference || 0, this.threadId, filter, start, count);
                if (!response || !response.body || !response.body.variables) {
                    return [];
                }
                const nameCount = new Map();
                const vars = response.body.variables.filter(v => !!v).map((v) => {
                    if ((0, types_1.isString)(v.value) && (0, types_1.isString)(v.name) && typeof v.variablesReference === 'number') {
                        const count = nameCount.get(v.name) || 0;
                        const idDuplicationIndex = count > 0 ? count.toString() : '';
                        nameCount.set(v.name, count + 1);
                        return new Variable(this.session, this.threadId, this, v.variablesReference, v.name, v.evaluateName, v.value, v.namedVariables, v.indexedVariables, v.memoryReference, v.presentationHint, v.type, v.__vscodeVariableMenuContext, true, 0, idDuplicationIndex);
                    }
                    return new Variable(this.session, this.threadId, this, 0, '', undefined, nls.localize('invalidVariableAttributes', "Invalid variable attributes"), 0, 0, undefined, { kind: 'virtual' }, undefined, undefined, false);
                });
                if (this.session.autoExpandLazyVariables) {
                    await Promise.all(vars.map(v => v.presentationHint?.lazy && v.evaluateLazy()));
                }
                return vars;
            }
            catch (e) {
                return [new Variable(this.session, this.threadId, this, 0, '', undefined, e.message, 0, 0, undefined, { kind: 'virtual' }, undefined, undefined, false)];
            }
        }
        // The adapter explicitly sents the children count of an expression only if there are lots of children which should be chunked.
        get getChildrenInChunks() {
            return !!this.indexedVariables;
        }
        set value(value) {
            this._value = value;
            this.valueChanged = !!ExpressionContainer.allValues.get(this.getId()) &&
                ExpressionContainer.allValues.get(this.getId()) !== Expression.DEFAULT_VALUE && ExpressionContainer.allValues.get(this.getId()) !== value;
            ExpressionContainer.allValues.set(this.getId(), value);
        }
        toString() {
            return this.value;
        }
        async evaluateExpression(expression, session, stackFrame, context, keepLazyVars = false) {
            if (!session || (!stackFrame && context !== 'repl')) {
                this.value = context === 'repl' ? nls.localize('startDebugFirst', "Please start a debug session to evaluate expressions") : Expression.DEFAULT_VALUE;
                this.reference = 0;
                return false;
            }
            this.session = session;
            try {
                const response = await session.evaluate(expression, stackFrame ? stackFrame.frameId : undefined, context);
                if (response && response.body) {
                    this.value = response.body.result || '';
                    this.reference = response.body.variablesReference;
                    this.namedVariables = response.body.namedVariables;
                    this.indexedVariables = response.body.indexedVariables;
                    this.memoryReference = response.body.memoryReference;
                    this.type = response.body.type || this.type;
                    this.presentationHint = response.body.presentationHint;
                    if (!keepLazyVars && response.body.presentationHint?.lazy) {
                        await this.evaluateLazy();
                    }
                    return true;
                }
                return false;
            }
            catch (e) {
                this.value = e.message || '';
                this.reference = 0;
                return false;
            }
        }
    }
    exports.ExpressionContainer = ExpressionContainer;
    function handleSetResponse(expression, response) {
        if (response && response.body) {
            expression.value = response.body.value || '';
            expression.type = response.body.type || expression.type;
            expression.reference = response.body.variablesReference;
            expression.namedVariables = response.body.namedVariables;
            expression.indexedVariables = response.body.indexedVariables;
            // todo @weinand: the set responses contain most properties, but not memory references. Should they?
        }
    }
    class Expression extends ExpressionContainer {
        static { this.DEFAULT_VALUE = nls.localize('notAvailable', "not available"); }
        constructor(name, id = (0, uuid_1.generateUuid)()) {
            super(undefined, undefined, 0, id);
            this.name = name;
            this.available = false;
            // name is not set if the expression is just being added
            // in that case do not set default value to prevent flashing #14499
            if (name) {
                this.value = Expression.DEFAULT_VALUE;
            }
        }
        async evaluate(session, stackFrame, context, keepLazyVars) {
            this.available = await this.evaluateExpression(this.name, session, stackFrame, context, keepLazyVars);
        }
        toString() {
            return `${this.name}\n${this.value}`;
        }
        async setExpression(value, stackFrame) {
            if (!this.session) {
                return;
            }
            const response = await this.session.setExpression(stackFrame.frameId, this.name, value);
            handleSetResponse(this, response);
        }
    }
    exports.Expression = Expression;
    class Variable extends ExpressionContainer {
        constructor(session, threadId, parent, reference, name, evaluateName, value, namedVariables, indexedVariables, memoryReference, presentationHint, type = undefined, variableMenuContext = undefined, available = true, startOfVariables = 0, idDuplicationIndex = '') {
            super(session, threadId, reference, `variable:${parent.getId()}:${name}:${idDuplicationIndex}`, namedVariables, indexedVariables, memoryReference, startOfVariables, presentationHint);
            this.parent = parent;
            this.name = name;
            this.evaluateName = evaluateName;
            this.variableMenuContext = variableMenuContext;
            this.available = available;
            this.value = value || '';
            this.type = type;
        }
        getThreadId() {
            return this.threadId;
        }
        async setVariable(value, stackFrame) {
            if (!this.session) {
                return;
            }
            try {
                // Send out a setExpression for debug extensions that do not support set variables https://github.com/microsoft/vscode/issues/124679#issuecomment-869844437
                if (this.session.capabilities.supportsSetExpression && !this.session.capabilities.supportsSetVariable && this.evaluateName) {
                    return this.setExpression(value, stackFrame);
                }
                const response = await this.session.setVariable(this.parent.reference, this.name, value);
                handleSetResponse(this, response);
            }
            catch (err) {
                this.errorMessage = err.message;
            }
        }
        async setExpression(value, stackFrame) {
            if (!this.session || !this.evaluateName) {
                return;
            }
            const response = await this.session.setExpression(stackFrame.frameId, this.evaluateName, value);
            handleSetResponse(this, response);
        }
        toString() {
            return this.name ? `${this.name}: ${this.value}` : this.value;
        }
        adoptLazyResponse(response) {
            this.evaluateName = response.evaluateName;
        }
        toDebugProtocolObject() {
            return {
                name: this.name,
                variablesReference: this.reference || 0,
                memoryReference: this.memoryReference,
                value: this.value,
                evaluateName: this.evaluateName
            };
        }
    }
    exports.Variable = Variable;
    class Scope extends ExpressionContainer {
        constructor(stackFrame, id, name, reference, expensive, namedVariables, indexedVariables, range) {
            super(stackFrame.thread.session, stackFrame.thread.threadId, reference, `scope:${name}:${id}`, namedVariables, indexedVariables);
            this.stackFrame = stackFrame;
            this.name = name;
            this.expensive = expensive;
            this.range = range;
        }
        toString() {
            return this.name;
        }
        toDebugProtocolObject() {
            return {
                name: this.name,
                variablesReference: this.reference || 0,
                expensive: this.expensive
            };
        }
    }
    exports.Scope = Scope;
    class ErrorScope extends Scope {
        constructor(stackFrame, index, message) {
            super(stackFrame, index, message, 0, false);
        }
        toString() {
            return this.name;
        }
    }
    exports.ErrorScope = ErrorScope;
    class StackFrame {
        constructor(thread, frameId, source, name, presentationHint, range, index, canRestart, instructionPointerReference) {
            this.thread = thread;
            this.frameId = frameId;
            this.source = source;
            this.name = name;
            this.presentationHint = presentationHint;
            this.range = range;
            this.index = index;
            this.canRestart = canRestart;
            this.instructionPointerReference = instructionPointerReference;
        }
        getId() {
            return `stackframe:${this.thread.getId()}:${this.index}:${this.source.name}`;
        }
        getScopes() {
            if (!this.scopes) {
                this.scopes = this.thread.session.scopes(this.frameId, this.thread.threadId).then(response => {
                    if (!response || !response.body || !response.body.scopes) {
                        return [];
                    }
                    const usedIds = new Set();
                    return response.body.scopes.map(rs => {
                        // form the id based on the name and location so that it's the
                        // same across multiple pauses to retain expansion state
                        let id = 0;
                        do {
                            id = (0, hash_1.stringHash)(`${rs.name}:${rs.line}:${rs.column}`, id);
                        } while (usedIds.has(id));
                        usedIds.add(id);
                        return new Scope(this, id, rs.name, rs.variablesReference, rs.expensive, rs.namedVariables, rs.indexedVariables, rs.line && rs.column && rs.endLine && rs.endColumn ? new range_1.Range(rs.line, rs.column, rs.endLine, rs.endColumn) : undefined);
                    });
                }, err => [new ErrorScope(this, 0, err.message)]);
            }
            return this.scopes;
        }
        async getMostSpecificScopes(range) {
            const scopes = await this.getScopes();
            const nonExpensiveScopes = scopes.filter(s => !s.expensive);
            const haveRangeInfo = nonExpensiveScopes.some(s => !!s.range);
            if (!haveRangeInfo) {
                return nonExpensiveScopes;
            }
            const scopesContainingRange = nonExpensiveScopes.filter(scope => scope.range && range_1.Range.containsRange(scope.range, range))
                .sort((first, second) => (first.range.endLineNumber - first.range.startLineNumber) - (second.range.endLineNumber - second.range.startLineNumber));
            return scopesContainingRange.length ? scopesContainingRange : nonExpensiveScopes;
        }
        restart() {
            return this.thread.session.restartFrame(this.frameId, this.thread.threadId);
        }
        forgetScopes() {
            this.scopes = undefined;
        }
        toString() {
            const lineNumberToString = typeof this.range.startLineNumber === 'number' ? `:${this.range.startLineNumber}` : '';
            const sourceToString = `${this.source.inMemory ? this.source.name : this.source.uri.fsPath}${lineNumberToString}`;
            return sourceToString === debugSource_1.UNKNOWN_SOURCE_LABEL ? this.name : `${this.name} (${sourceToString})`;
        }
        async openInEditor(editorService, preserveFocus, sideBySide, pinned) {
            const threadStopReason = this.thread.stoppedDetails?.reason;
            if (this.instructionPointerReference &&
                (threadStopReason === 'instruction breakpoint' ||
                    (threadStopReason === 'step' && this.thread.lastSteppingGranularity === 'instruction') ||
                    editorService.activeEditor instanceof disassemblyViewInput_1.DisassemblyViewInput)) {
                return editorService.openEditor(disassemblyViewInput_1.DisassemblyViewInput.instance, { pinned: true, revealIfOpened: true });
            }
            if (this.source.available) {
                return this.source.openInEditor(editorService, this.range, preserveFocus, sideBySide, pinned);
            }
            return undefined;
        }
        equals(other) {
            return (this.name === other.name) && (other.thread === this.thread) && (this.frameId === other.frameId) && (other.source === this.source) && (range_1.Range.equalsRange(this.range, other.range));
        }
    }
    exports.StackFrame = StackFrame;
    class Thread {
        constructor(session, name, threadId) {
            this.session = session;
            this.name = name;
            this.threadId = threadId;
            this.callStackCancellationTokens = [];
            this.reachedEndOfCallStack = false;
            this.callStack = [];
            this.staleCallStack = [];
            this.stopped = false;
        }
        getId() {
            return `thread:${this.session.getId()}:${this.threadId}`;
        }
        clearCallStack() {
            if (this.callStack.length) {
                this.staleCallStack = this.callStack;
            }
            this.callStack = [];
            this.callStackCancellationTokens.forEach(c => c.dispose(true));
            this.callStackCancellationTokens = [];
        }
        getCallStack() {
            return this.callStack;
        }
        getStaleCallStack() {
            return this.staleCallStack;
        }
        getTopStackFrame() {
            const callStack = this.getCallStack();
            // Allow stack frame without source and with instructionReferencePointer as top stack frame when using disassembly view.
            const firstAvailableStackFrame = callStack.find(sf => !!(sf &&
                ((this.stoppedDetails?.reason === 'instruction breakpoint' || (this.stoppedDetails?.reason === 'step' && this.lastSteppingGranularity === 'instruction')) && sf.instructionPointerReference) ||
                (sf.source && sf.source.available && sf.source.presentationHint !== 'deemphasize')));
            return firstAvailableStackFrame;
        }
        get stateLabel() {
            if (this.stoppedDetails) {
                return this.stoppedDetails.description ||
                    (this.stoppedDetails.reason ? nls.localize({ key: 'pausedOn', comment: ['indicates reason for program being paused'] }, "Paused on {0}", this.stoppedDetails.reason) : nls.localize('paused', "Paused"));
            }
            return nls.localize({ key: 'running', comment: ['indicates state'] }, "Running");
        }
        /**
         * Queries the debug adapter for the callstack and returns a promise
         * which completes once the call stack has been retrieved.
         * If the thread is not stopped, it returns a promise to an empty array.
         * Only fetches the first stack frame for performance reasons. Calling this method consecutive times
         * gets the remainder of the call stack.
         */
        async fetchCallStack(levels = 20) {
            if (this.stopped) {
                const start = this.callStack.length;
                const callStack = await this.getCallStackImpl(start, levels);
                this.reachedEndOfCallStack = callStack.length < levels;
                if (start < this.callStack.length) {
                    // Set the stack frames for exact position we requested. To make sure no concurrent requests create duplicate stack frames #30660
                    this.callStack.splice(start, this.callStack.length - start);
                }
                this.callStack = this.callStack.concat(callStack || []);
                if (typeof this.stoppedDetails?.totalFrames === 'number' && this.stoppedDetails.totalFrames === this.callStack.length) {
                    this.reachedEndOfCallStack = true;
                }
            }
        }
        async getCallStackImpl(startFrame, levels) {
            try {
                const tokenSource = new cancellation_1.CancellationTokenSource();
                this.callStackCancellationTokens.push(tokenSource);
                const response = await this.session.stackTrace(this.threadId, startFrame, levels, tokenSource.token);
                if (!response || !response.body || tokenSource.token.isCancellationRequested) {
                    return [];
                }
                if (this.stoppedDetails) {
                    this.stoppedDetails.totalFrames = response.body.totalFrames;
                }
                return response.body.stackFrames.map((rsf, index) => {
                    const source = this.session.getSource(rsf.source);
                    return new StackFrame(this, rsf.id, source, rsf.name, rsf.presentationHint, new range_1.Range(rsf.line, rsf.column, rsf.endLine || rsf.line, rsf.endColumn || rsf.column), startFrame + index, typeof rsf.canRestart === 'boolean' ? rsf.canRestart : true, rsf.instructionPointerReference);
                });
            }
            catch (err) {
                if (this.stoppedDetails) {
                    this.stoppedDetails.framesErrorMessage = err.message;
                }
                return [];
            }
        }
        /**
         * Returns exception info promise if the exception was thrown, otherwise undefined
         */
        get exceptionInfo() {
            if (this.stoppedDetails && this.stoppedDetails.reason === 'exception') {
                if (this.session.capabilities.supportsExceptionInfoRequest) {
                    return this.session.exceptionInfo(this.threadId);
                }
                return Promise.resolve({
                    description: this.stoppedDetails.text,
                    breakMode: null
                });
            }
            return Promise.resolve(undefined);
        }
        next(granularity) {
            return this.session.next(this.threadId, granularity);
        }
        stepIn(granularity) {
            return this.session.stepIn(this.threadId, undefined, granularity);
        }
        stepOut(granularity) {
            return this.session.stepOut(this.threadId, granularity);
        }
        stepBack(granularity) {
            return this.session.stepBack(this.threadId, granularity);
        }
        continue() {
            return this.session.continue(this.threadId);
        }
        pause() {
            return this.session.pause(this.threadId);
        }
        terminate() {
            return this.session.terminateThreads([this.threadId]);
        }
        reverseContinue() {
            return this.session.reverseContinue(this.threadId);
        }
    }
    exports.Thread = Thread;
    /**
     * Gets a URI to a memory in the given session ID.
     */
    const getUriForDebugMemory = (sessionId, memoryReference, range, displayName = 'memory') => {
        return uri_1.URI.from({
            scheme: debug_1.DEBUG_MEMORY_SCHEME,
            authority: sessionId,
            path: '/' + encodeURIComponent(memoryReference) + `/${encodeURIComponent(displayName)}.bin`,
            query: range ? `?range=${range.fromOffset}:${range.toOffset}` : undefined,
        });
    };
    exports.getUriForDebugMemory = getUriForDebugMemory;
    class MemoryRegion extends lifecycle_1.Disposable {
        constructor(memoryReference, session) {
            super();
            this.memoryReference = memoryReference;
            this.session = session;
            this.invalidateEmitter = this._register(new event_1.Emitter());
            /** @inheritdoc */
            this.onDidInvalidate = this.invalidateEmitter.event;
            /** @inheritdoc */
            this.writable = !!this.session.capabilities.supportsWriteMemoryRequest;
            this._register(session.onDidInvalidateMemory(e => {
                if (e.body.memoryReference === memoryReference) {
                    this.invalidate(e.body.offset, e.body.count - e.body.offset);
                }
            }));
        }
        async read(fromOffset, toOffset) {
            const length = toOffset - fromOffset;
            const offset = fromOffset;
            const result = await this.session.readMemory(this.memoryReference, offset, length);
            if (result === undefined || !result.body?.data) {
                return [{ type: 1 /* MemoryRangeType.Unreadable */, offset, length }];
            }
            let data;
            try {
                data = (0, buffer_1.decodeBase64)(result.body.data);
            }
            catch {
                return [{ type: 2 /* MemoryRangeType.Error */, offset, length, error: 'Invalid base64 data from debug adapter' }];
            }
            const unreadable = result.body.unreadableBytes || 0;
            const dataLength = length - unreadable;
            if (data.byteLength < dataLength) {
                const pad = buffer_1.VSBuffer.alloc(dataLength - data.byteLength);
                pad.buffer.fill(0);
                data = buffer_1.VSBuffer.concat([data, pad], dataLength);
            }
            else if (data.byteLength > dataLength) {
                data = data.slice(0, dataLength);
            }
            if (!unreadable) {
                return [{ type: 0 /* MemoryRangeType.Valid */, offset, length, data }];
            }
            return [
                { type: 0 /* MemoryRangeType.Valid */, offset, length: dataLength, data },
                { type: 1 /* MemoryRangeType.Unreadable */, offset: offset + dataLength, length: unreadable },
            ];
        }
        async write(offset, data) {
            const result = await this.session.writeMemory(this.memoryReference, offset, (0, buffer_1.encodeBase64)(data), true);
            const written = result?.body?.bytesWritten ?? data.byteLength;
            this.invalidate(offset, offset + written);
            return written;
        }
        dispose() {
            super.dispose();
        }
        invalidate(fromOffset, toOffset) {
            this.invalidateEmitter.fire({ fromOffset, toOffset });
        }
    }
    exports.MemoryRegion = MemoryRegion;
    class Enablement {
        constructor(enabled, id) {
            this.enabled = enabled;
            this.id = id;
        }
        getId() {
            return this.id;
        }
    }
    exports.Enablement = Enablement;
    function toBreakpointSessionData(data, capabilities) {
        return (0, objects_1.mixin)({
            supportsConditionalBreakpoints: !!capabilities.supportsConditionalBreakpoints,
            supportsHitConditionalBreakpoints: !!capabilities.supportsHitConditionalBreakpoints,
            supportsLogPoints: !!capabilities.supportsLogPoints,
            supportsFunctionBreakpoints: !!capabilities.supportsFunctionBreakpoints,
            supportsDataBreakpoints: !!capabilities.supportsDataBreakpoints,
            supportsInstructionBreakpoints: !!capabilities.supportsInstructionBreakpoints
        }, data);
    }
    class BaseBreakpoint extends Enablement {
        constructor(enabled, hitCondition, condition, logMessage, id) {
            super(enabled, id);
            this.hitCondition = hitCondition;
            this.condition = condition;
            this.logMessage = logMessage;
            this.sessionData = new Map();
            if (enabled === undefined) {
                this.enabled = true;
            }
        }
        setSessionData(sessionId, data) {
            if (!data) {
                this.sessionData.delete(sessionId);
            }
            else {
                data.sessionId = sessionId;
                this.sessionData.set(sessionId, data);
            }
            const allData = Array.from(this.sessionData.values());
            const verifiedData = (0, arrays_1.distinct)(allData.filter(d => d.verified), d => `${d.line}:${d.column}`);
            if (verifiedData.length) {
                // In case multiple session verified the breakpoint and they provide different data show the intial data that the user set (corner case)
                this.data = verifiedData.length === 1 ? verifiedData[0] : undefined;
            }
            else {
                // No session verified the breakpoint
                this.data = allData.length ? allData[0] : undefined;
            }
        }
        get message() {
            if (!this.data) {
                return undefined;
            }
            return this.data.message;
        }
        get verified() {
            return this.data ? this.data.verified : true;
        }
        get sessionsThatVerified() {
            const sessionIds = [];
            for (const [sessionId, data] of this.sessionData) {
                if (data.verified) {
                    sessionIds.push(sessionId);
                }
            }
            return sessionIds;
        }
        getIdFromAdapter(sessionId) {
            const data = this.sessionData.get(sessionId);
            return data ? data.id : undefined;
        }
        getDebugProtocolBreakpoint(sessionId) {
            const data = this.sessionData.get(sessionId);
            if (data) {
                const bp = {
                    id: data.id,
                    verified: data.verified,
                    message: data.message,
                    source: data.source,
                    line: data.line,
                    column: data.column,
                    endLine: data.endLine,
                    endColumn: data.endColumn,
                    instructionReference: data.instructionReference,
                    offset: data.offset
                };
                return bp;
            }
            return undefined;
        }
        toJSON() {
            const result = Object.create(null);
            result.id = this.getId();
            result.enabled = this.enabled;
            result.condition = this.condition;
            result.hitCondition = this.hitCondition;
            result.logMessage = this.logMessage;
            return result;
        }
    }
    exports.BaseBreakpoint = BaseBreakpoint;
    class Breakpoint extends BaseBreakpoint {
        constructor(_uri, _lineNumber, _column, enabled, condition, hitCondition, logMessage, _adapterData, textFileService, uriIdentityService, logService, id = (0, uuid_1.generateUuid)(), triggeredBy = undefined) {
            super(enabled, hitCondition, condition, logMessage, id);
            this._uri = _uri;
            this._lineNumber = _lineNumber;
            this._column = _column;
            this._adapterData = _adapterData;
            this.textFileService = textFileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.triggeredBy = triggeredBy;
        }
        get originalUri() {
            return this._uri;
        }
        get lineNumber() {
            return this.verified && this.data && typeof this.data.line === 'number' ? this.data.line : this._lineNumber;
        }
        get verified() {
            if (this.data) {
                return this.data.verified && !this.textFileService.isDirty(this._uri);
            }
            return true;
        }
        get pending() {
            if (this.data) {
                return false;
            }
            return this.triggeredBy !== undefined;
        }
        get uri() {
            return this.verified && this.data && this.data.source ? (0, debugSource_1.getUriFromSource)(this.data.source, this.data.source.path, this.data.sessionId, this.uriIdentityService, this.logService) : this._uri;
        }
        get column() {
            return this.verified && this.data && typeof this.data.column === 'number' ? this.data.column : this._column;
        }
        get message() {
            if (this.textFileService.isDirty(this.uri)) {
                return nls.localize('breakpointDirtydHover', "Unverified breakpoint. File is modified, please restart debug session.");
            }
            return super.message;
        }
        get adapterData() {
            return this.data && this.data.source && this.data.source.adapterData ? this.data.source.adapterData : this._adapterData;
        }
        get endLineNumber() {
            return this.verified && this.data ? this.data.endLine : undefined;
        }
        get endColumn() {
            return this.verified && this.data ? this.data.endColumn : undefined;
        }
        get sessionAgnosticData() {
            return {
                lineNumber: this._lineNumber,
                column: this._column
            };
        }
        get supported() {
            if (!this.data) {
                return true;
            }
            if (this.logMessage && !this.data.supportsLogPoints) {
                return false;
            }
            if (this.condition && !this.data.supportsConditionalBreakpoints) {
                return false;
            }
            if (this.hitCondition && !this.data.supportsHitConditionalBreakpoints) {
                return false;
            }
            return true;
        }
        setSessionData(sessionId, data) {
            super.setSessionData(sessionId, data);
            if (!this._adapterData) {
                this._adapterData = this.adapterData;
            }
        }
        toJSON() {
            const result = super.toJSON();
            result.uri = this._uri;
            result.lineNumber = this._lineNumber;
            result.column = this._column;
            result.adapterData = this.adapterData;
            result.triggeredBy = this.triggeredBy;
            return result;
        }
        toString() {
            return `${resources.basenameOrAuthority(this.uri)} ${this.lineNumber}`;
        }
        setSessionDidTrigger(sessionId) {
            this.sessionsDidTrigger ??= new Set();
            this.sessionsDidTrigger.add(sessionId);
        }
        getSessionDidTrigger(sessionId) {
            return !!this.sessionsDidTrigger?.has(sessionId);
        }
        update(data) {
            if (data.hasOwnProperty('lineNumber') && !(0, types_1.isUndefinedOrNull)(data.lineNumber)) {
                this._lineNumber = data.lineNumber;
            }
            if (data.hasOwnProperty('column')) {
                this._column = data.column;
            }
            if (data.hasOwnProperty('condition')) {
                this.condition = data.condition;
            }
            if (data.hasOwnProperty('hitCondition')) {
                this.hitCondition = data.hitCondition;
            }
            if (data.hasOwnProperty('logMessage')) {
                this.logMessage = data.logMessage;
            }
            if (data.hasOwnProperty('triggeredBy')) {
                this.triggeredBy = data.triggeredBy;
                this.sessionsDidTrigger = undefined;
            }
        }
    }
    exports.Breakpoint = Breakpoint;
    class FunctionBreakpoint extends BaseBreakpoint {
        constructor(name, enabled, hitCondition, condition, logMessage, id = (0, uuid_1.generateUuid)()) {
            super(enabled, hitCondition, condition, logMessage, id);
            this.name = name;
        }
        toJSON() {
            const result = super.toJSON();
            result.name = this.name;
            return result;
        }
        get supported() {
            if (!this.data) {
                return true;
            }
            return this.data.supportsFunctionBreakpoints;
        }
        toString() {
            return this.name;
        }
    }
    exports.FunctionBreakpoint = FunctionBreakpoint;
    class DataBreakpoint extends BaseBreakpoint {
        constructor(description, dataId, canPersist, enabled, hitCondition, condition, logMessage, accessTypes, accessType, id = (0, uuid_1.generateUuid)()) {
            super(enabled, hitCondition, condition, logMessage, id);
            this.description = description;
            this.dataId = dataId;
            this.canPersist = canPersist;
            this.accessTypes = accessTypes;
            this.accessType = accessType;
        }
        toJSON() {
            const result = super.toJSON();
            result.description = this.description;
            result.dataId = this.dataId;
            result.accessTypes = this.accessTypes;
            result.accessType = this.accessType;
            return result;
        }
        get supported() {
            if (!this.data) {
                return true;
            }
            return this.data.supportsDataBreakpoints;
        }
        toString() {
            return this.description;
        }
    }
    exports.DataBreakpoint = DataBreakpoint;
    class ExceptionBreakpoint extends BaseBreakpoint {
        constructor(filter, label, enabled, supportsCondition, condition, description, conditionDescription, fallback = false) {
            super(enabled, undefined, condition, undefined, (0, uuid_1.generateUuid)());
            this.filter = filter;
            this.label = label;
            this.supportsCondition = supportsCondition;
            this.description = description;
            this.conditionDescription = conditionDescription;
            this.fallback = fallback;
            this.supportedSessions = new Set();
        }
        toJSON() {
            const result = Object.create(null);
            result.filter = this.filter;
            result.label = this.label;
            result.enabled = this.enabled;
            result.supportsCondition = this.supportsCondition;
            result.conditionDescription = this.conditionDescription;
            result.condition = this.condition;
            result.fallback = this.fallback;
            result.description = this.description;
            return result;
        }
        setSupportedSession(sessionId, supported) {
            if (supported) {
                this.supportedSessions.add(sessionId);
            }
            else {
                this.supportedSessions.delete(sessionId);
            }
        }
        /**
         * Used to specify which breakpoints to show when no session is specified.
         * Useful when no session is active and we want to show the exception breakpoints from the last session.
         */
        setFallback(isFallback) {
            this.fallback = isFallback;
        }
        get supported() {
            return true;
        }
        /**
         * Checks if the breakpoint is applicable for the specified session.
         * If sessionId is undefined, returns true if this breakpoint is a fallback breakpoint.
         */
        isSupportedSession(sessionId) {
            return sessionId ? this.supportedSessions.has(sessionId) : this.fallback;
        }
        matches(filter) {
            return this.filter === filter.filter && this.label === filter.label && this.supportsCondition === !!filter.supportsCondition && this.conditionDescription === filter.conditionDescription && this.description === filter.description;
        }
        toString() {
            return this.label;
        }
    }
    exports.ExceptionBreakpoint = ExceptionBreakpoint;
    class InstructionBreakpoint extends BaseBreakpoint {
        constructor(instructionReference, offset, canPersist, enabled, hitCondition, condition, logMessage, address, id = (0, uuid_1.generateUuid)()) {
            super(enabled, hitCondition, condition, logMessage, id);
            this.instructionReference = instructionReference;
            this.offset = offset;
            this.canPersist = canPersist;
            this.address = address;
        }
        toJSON() {
            const result = super.toJSON();
            result.instructionReference = this.instructionReference;
            result.offset = this.offset;
            return result;
        }
        get supported() {
            if (!this.data) {
                return true;
            }
            return this.data.supportsInstructionBreakpoints;
        }
        toString() {
            return this.instructionReference;
        }
    }
    exports.InstructionBreakpoint = InstructionBreakpoint;
    class ThreadAndSessionIds {
        constructor(sessionId, threadId) {
            this.sessionId = sessionId;
            this.threadId = threadId;
        }
        getId() {
            return `${this.sessionId}:${this.threadId}`;
        }
    }
    exports.ThreadAndSessionIds = ThreadAndSessionIds;
    let DebugModel = class DebugModel extends lifecycle_1.Disposable {
        constructor(debugStorage, textFileService, uriIdentityService, logService) {
            super();
            this.textFileService = textFileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.schedulers = new Map();
            this.breakpointsActivated = true;
            this._onDidChangeBreakpoints = this._register(new event_1.Emitter());
            this._onDidChangeCallStack = this._register(new event_1.Emitter());
            this._onDidChangeWatchExpressions = this._register(new event_1.Emitter());
            this._register((0, observable_1.autorun)(reader => {
                this.breakpoints = debugStorage.breakpoints.read(reader);
                this.functionBreakpoints = debugStorage.functionBreakpoints.read(reader);
                this.exceptionBreakpoints = debugStorage.exceptionBreakpoints.read(reader);
                this.dataBreakpoints = debugStorage.dataBreakpoints.read(reader);
                this._onDidChangeBreakpoints.fire(undefined);
            }));
            this._register((0, observable_1.autorun)(reader => {
                this.watchExpressions = debugStorage.watchExpressions.read(reader);
                this._onDidChangeWatchExpressions.fire(undefined);
            }));
            this.instructionBreakpoints = [];
            this.sessions = [];
        }
        getId() {
            return 'root';
        }
        getSession(sessionId, includeInactive = false) {
            if (sessionId) {
                return this.getSessions(includeInactive).find(s => s.getId() === sessionId);
            }
            return undefined;
        }
        getSessions(includeInactive = false) {
            // By default do not return inactive sessions.
            // However we are still holding onto inactive sessions due to repl and debug service session revival (eh scenario)
            return this.sessions.filter(s => includeInactive || s.state !== 0 /* State.Inactive */);
        }
        addSession(session) {
            this.sessions = this.sessions.filter(s => {
                if (s.getId() === session.getId()) {
                    // Make sure to de-dupe if a session is re-initialized. In case of EH debugging we are adding a session again after an attach.
                    return false;
                }
                if (s.state === 0 /* State.Inactive */ && s.configuration.name === session.configuration.name) {
                    // Make sure to remove all inactive sessions that are using the same configuration as the new session
                    return false;
                }
                return true;
            });
            let i = 1;
            while (this.sessions.some(s => s.getLabel() === session.getLabel())) {
                session.setName(`${session.configuration.name} ${++i}`);
            }
            let index = -1;
            if (session.parentSession) {
                // Make sure that child sessions are placed after the parent session
                index = (0, arraysFind_1.findLastIdx)(this.sessions, s => s.parentSession === session.parentSession || s === session.parentSession);
            }
            if (index >= 0) {
                this.sessions.splice(index + 1, 0, session);
            }
            else {
                this.sessions.push(session);
            }
            this._onDidChangeCallStack.fire(undefined);
        }
        get onDidChangeBreakpoints() {
            return this._onDidChangeBreakpoints.event;
        }
        get onDidChangeCallStack() {
            return this._onDidChangeCallStack.event;
        }
        get onDidChangeWatchExpressions() {
            return this._onDidChangeWatchExpressions.event;
        }
        rawUpdate(data) {
            const session = this.sessions.find(p => p.getId() === data.sessionId);
            if (session) {
                session.rawUpdate(data);
                this._onDidChangeCallStack.fire(undefined);
            }
        }
        clearThreads(id, removeThreads, reference = undefined) {
            const session = this.sessions.find(p => p.getId() === id);
            this.schedulers.forEach(entry => {
                entry.scheduler.dispose();
                entry.completeDeferred.complete();
            });
            this.schedulers.clear();
            if (session) {
                session.clearThreads(removeThreads, reference);
                this._onDidChangeCallStack.fire(undefined);
            }
        }
        /**
         * Update the call stack and notify the call stack view that changes have occurred.
         */
        async fetchCallstack(thread, levels) {
            if (thread.reachedEndOfCallStack) {
                return;
            }
            const totalFrames = thread.stoppedDetails?.totalFrames;
            const remainingFrames = (typeof totalFrames === 'number') ? (totalFrames - thread.getCallStack().length) : undefined;
            if (!levels || (remainingFrames && levels > remainingFrames)) {
                levels = remainingFrames;
            }
            if (levels && levels > 0) {
                await thread.fetchCallStack(levels);
                this._onDidChangeCallStack.fire();
            }
            return;
        }
        refreshTopOfCallstack(thread, fetchFullStack = true) {
            if (thread.session.capabilities.supportsDelayedStackTraceLoading) {
                // For improved performance load the first stack frame and then load the rest async.
                let topCallStack = Promise.resolve();
                const wholeCallStack = new Promise((c, e) => {
                    topCallStack = thread.fetchCallStack(1).then(() => {
                        if (!this.schedulers.has(thread.getId()) && fetchFullStack) {
                            const deferred = new async_1.DeferredPromise();
                            this.schedulers.set(thread.getId(), {
                                completeDeferred: deferred,
                                scheduler: new async_1.RunOnceScheduler(() => {
                                    thread.fetchCallStack(19).then(() => {
                                        const stale = thread.getStaleCallStack();
                                        const current = thread.getCallStack();
                                        let bottomOfCallStackChanged = stale.length !== current.length;
                                        for (let i = 1; i < stale.length && !bottomOfCallStackChanged; i++) {
                                            bottomOfCallStackChanged = !stale[i].equals(current[i]);
                                        }
                                        if (bottomOfCallStackChanged) {
                                            this._onDidChangeCallStack.fire();
                                        }
                                    }).finally(() => {
                                        deferred.complete();
                                        this.schedulers.delete(thread.getId());
                                    });
                                }, 420)
                            });
                        }
                        const entry = this.schedulers.get(thread.getId());
                        entry.scheduler.schedule();
                        entry.completeDeferred.p.then(c, e);
                        this._onDidChangeCallStack.fire();
                    });
                });
                return { topCallStack, wholeCallStack };
            }
            const wholeCallStack = thread.fetchCallStack();
            return { wholeCallStack, topCallStack: wholeCallStack };
        }
        getBreakpoints(filter) {
            if (filter) {
                const uriStr = filter.uri?.toString();
                const originalUriStr = filter.originalUri?.toString();
                return this.breakpoints.filter(bp => {
                    if (uriStr && bp.uri.toString() !== uriStr) {
                        return false;
                    }
                    if (originalUriStr && bp.originalUri.toString() !== originalUriStr) {
                        return false;
                    }
                    if (filter.lineNumber && bp.lineNumber !== filter.lineNumber) {
                        return false;
                    }
                    if (filter.column && bp.column !== filter.column) {
                        return false;
                    }
                    if (filter.enabledOnly && (!this.breakpointsActivated || !bp.enabled)) {
                        return false;
                    }
                    if (filter.triggeredOnly && bp.triggeredBy === undefined) {
                        return false;
                    }
                    return true;
                });
            }
            return this.breakpoints;
        }
        getFunctionBreakpoints() {
            return this.functionBreakpoints;
        }
        getDataBreakpoints() {
            return this.dataBreakpoints;
        }
        getExceptionBreakpoints() {
            return this.exceptionBreakpoints;
        }
        getExceptionBreakpointsForSession(sessionId) {
            return this.exceptionBreakpoints.filter(ebp => ebp.isSupportedSession(sessionId));
        }
        getInstructionBreakpoints() {
            return this.instructionBreakpoints;
        }
        setExceptionBreakpointsForSession(sessionId, data) {
            if (data) {
                let didChangeBreakpoints = false;
                data.forEach(d => {
                    let ebp = this.exceptionBreakpoints.filter((exbp) => exbp.matches(d)).pop();
                    if (!ebp) {
                        didChangeBreakpoints = true;
                        ebp = new ExceptionBreakpoint(d.filter, d.label, !!d.default, !!d.supportsCondition, undefined /* condition */, d.description, d.conditionDescription);
                        this.exceptionBreakpoints.push(ebp);
                    }
                    ebp.setSupportedSession(sessionId, true);
                });
                if (didChangeBreakpoints) {
                    this._onDidChangeBreakpoints.fire(undefined);
                }
            }
        }
        removeExceptionBreakpointsForSession(sessionId) {
            this.exceptionBreakpoints.forEach(ebp => ebp.setSupportedSession(sessionId, false));
        }
        // Set last focused session as fallback session.
        // This is done to keep track of the exception breakpoints to show when no session is active.
        setExceptionBreakpointFallbackSession(sessionId) {
            this.exceptionBreakpoints.forEach(ebp => ebp.setFallback(ebp.isSupportedSession(sessionId)));
        }
        setExceptionBreakpointCondition(exceptionBreakpoint, condition) {
            exceptionBreakpoint.condition = condition;
            this._onDidChangeBreakpoints.fire(undefined);
        }
        areBreakpointsActivated() {
            return this.breakpointsActivated;
        }
        setBreakpointsActivated(activated) {
            this.breakpointsActivated = activated;
            this._onDidChangeBreakpoints.fire(undefined);
        }
        addBreakpoints(uri, rawData, fireEvent = true) {
            const newBreakpoints = rawData.map(rawBp => {
                return new Breakpoint(uri, rawBp.lineNumber, rawBp.column, rawBp.enabled === false ? false : true, rawBp.condition, rawBp.hitCondition, rawBp.logMessage, undefined, this.textFileService, this.uriIdentityService, this.logService, rawBp.id, rawBp.triggeredBy);
            });
            this.breakpoints = this.breakpoints.concat(newBreakpoints);
            this.breakpointsActivated = true;
            this.sortAndDeDup();
            if (fireEvent) {
                this._onDidChangeBreakpoints.fire({ added: newBreakpoints, sessionOnly: false });
            }
            return newBreakpoints;
        }
        removeBreakpoints(toRemove) {
            this.breakpoints = this.breakpoints.filter(bp => !toRemove.some(toRemove => toRemove.getId() === bp.getId()));
            this._onDidChangeBreakpoints.fire({ removed: toRemove, sessionOnly: false });
        }
        updateBreakpoints(data) {
            const updated = [];
            this.breakpoints.forEach(bp => {
                const bpData = data.get(bp.getId());
                if (bpData) {
                    bp.update(bpData);
                    updated.push(bp);
                }
            });
            this.sortAndDeDup();
            this._onDidChangeBreakpoints.fire({ changed: updated, sessionOnly: false });
        }
        setBreakpointSessionData(sessionId, capabilites, data) {
            this.breakpoints.forEach(bp => {
                if (!data) {
                    bp.setSessionData(sessionId, undefined);
                }
                else {
                    const bpData = data.get(bp.getId());
                    if (bpData) {
                        bp.setSessionData(sessionId, toBreakpointSessionData(bpData, capabilites));
                    }
                }
            });
            this.functionBreakpoints.forEach(fbp => {
                if (!data) {
                    fbp.setSessionData(sessionId, undefined);
                }
                else {
                    const fbpData = data.get(fbp.getId());
                    if (fbpData) {
                        fbp.setSessionData(sessionId, toBreakpointSessionData(fbpData, capabilites));
                    }
                }
            });
            this.dataBreakpoints.forEach(dbp => {
                if (!data) {
                    dbp.setSessionData(sessionId, undefined);
                }
                else {
                    const dbpData = data.get(dbp.getId());
                    if (dbpData) {
                        dbp.setSessionData(sessionId, toBreakpointSessionData(dbpData, capabilites));
                    }
                }
            });
            this.exceptionBreakpoints.forEach(ebp => {
                if (!data) {
                    ebp.setSessionData(sessionId, undefined);
                }
                else {
                    const ebpData = data.get(ebp.getId());
                    if (ebpData) {
                        ebp.setSessionData(sessionId, toBreakpointSessionData(ebpData, capabilites));
                    }
                }
            });
            this.instructionBreakpoints.forEach(ibp => {
                if (!data) {
                    ibp.setSessionData(sessionId, undefined);
                }
                else {
                    const ibpData = data.get(ibp.getId());
                    if (ibpData) {
                        ibp.setSessionData(sessionId, toBreakpointSessionData(ibpData, capabilites));
                    }
                }
            });
            this._onDidChangeBreakpoints.fire({
                sessionOnly: true
            });
        }
        getDebugProtocolBreakpoint(breakpointId, sessionId) {
            const bp = this.breakpoints.find(bp => bp.getId() === breakpointId);
            if (bp) {
                return bp.getDebugProtocolBreakpoint(sessionId);
            }
            return undefined;
        }
        sortAndDeDup() {
            this.breakpoints = this.breakpoints.sort((first, second) => {
                if (first.uri.toString() !== second.uri.toString()) {
                    return resources.basenameOrAuthority(first.uri).localeCompare(resources.basenameOrAuthority(second.uri));
                }
                if (first.lineNumber === second.lineNumber) {
                    if (first.column && second.column) {
                        return first.column - second.column;
                    }
                    return 1;
                }
                return first.lineNumber - second.lineNumber;
            });
            this.breakpoints = (0, arrays_1.distinct)(this.breakpoints, bp => `${bp.uri.toString()}:${bp.lineNumber}:${bp.column}`);
        }
        setEnablement(element, enable) {
            if (element instanceof Breakpoint || element instanceof FunctionBreakpoint || element instanceof ExceptionBreakpoint || element instanceof DataBreakpoint || element instanceof InstructionBreakpoint) {
                const changed = [];
                if (element.enabled !== enable && (element instanceof Breakpoint || element instanceof FunctionBreakpoint || element instanceof DataBreakpoint || element instanceof InstructionBreakpoint)) {
                    changed.push(element);
                }
                element.enabled = enable;
                if (enable) {
                    this.breakpointsActivated = true;
                }
                this._onDidChangeBreakpoints.fire({ changed: changed, sessionOnly: false });
            }
        }
        enableOrDisableAllBreakpoints(enable) {
            const changed = [];
            this.breakpoints.forEach(bp => {
                if (bp.enabled !== enable) {
                    changed.push(bp);
                }
                bp.enabled = enable;
            });
            this.functionBreakpoints.forEach(fbp => {
                if (fbp.enabled !== enable) {
                    changed.push(fbp);
                }
                fbp.enabled = enable;
            });
            this.dataBreakpoints.forEach(dbp => {
                if (dbp.enabled !== enable) {
                    changed.push(dbp);
                }
                dbp.enabled = enable;
            });
            this.instructionBreakpoints.forEach(ibp => {
                if (ibp.enabled !== enable) {
                    changed.push(ibp);
                }
                ibp.enabled = enable;
            });
            if (enable) {
                this.breakpointsActivated = true;
            }
            this._onDidChangeBreakpoints.fire({ changed: changed, sessionOnly: false });
        }
        addFunctionBreakpoint(functionName, id) {
            const newFunctionBreakpoint = new FunctionBreakpoint(functionName, true, undefined, undefined, undefined, id);
            this.functionBreakpoints.push(newFunctionBreakpoint);
            this._onDidChangeBreakpoints.fire({ added: [newFunctionBreakpoint], sessionOnly: false });
            return newFunctionBreakpoint;
        }
        updateFunctionBreakpoint(id, update) {
            const functionBreakpoint = this.functionBreakpoints.find(fbp => fbp.getId() === id);
            if (functionBreakpoint) {
                if (typeof update.name === 'string') {
                    functionBreakpoint.name = update.name;
                }
                if (typeof update.condition === 'string') {
                    functionBreakpoint.condition = update.condition;
                }
                if (typeof update.hitCondition === 'string') {
                    functionBreakpoint.hitCondition = update.hitCondition;
                }
                this._onDidChangeBreakpoints.fire({ changed: [functionBreakpoint], sessionOnly: false });
            }
        }
        removeFunctionBreakpoints(id) {
            let removed;
            if (id) {
                removed = this.functionBreakpoints.filter(fbp => fbp.getId() === id);
                this.functionBreakpoints = this.functionBreakpoints.filter(fbp => fbp.getId() !== id);
            }
            else {
                removed = this.functionBreakpoints;
                this.functionBreakpoints = [];
            }
            this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
        }
        addDataBreakpoint(label, dataId, canPersist, accessTypes, accessType, id) {
            const newDataBreakpoint = new DataBreakpoint(label, dataId, canPersist, true, undefined, undefined, undefined, accessTypes, accessType, id);
            this.dataBreakpoints.push(newDataBreakpoint);
            this._onDidChangeBreakpoints.fire({ added: [newDataBreakpoint], sessionOnly: false });
        }
        updateDataBreakpoint(id, update) {
            const dataBreakpoint = this.dataBreakpoints.find(fbp => fbp.getId() === id);
            if (dataBreakpoint) {
                if (typeof update.condition === 'string') {
                    dataBreakpoint.condition = update.condition;
                }
                if (typeof update.hitCondition === 'string') {
                    dataBreakpoint.hitCondition = update.hitCondition;
                }
                this._onDidChangeBreakpoints.fire({ changed: [dataBreakpoint], sessionOnly: false });
            }
        }
        removeDataBreakpoints(id) {
            let removed;
            if (id) {
                removed = this.dataBreakpoints.filter(fbp => fbp.getId() === id);
                this.dataBreakpoints = this.dataBreakpoints.filter(fbp => fbp.getId() !== id);
            }
            else {
                removed = this.dataBreakpoints;
                this.dataBreakpoints = [];
            }
            this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
        }
        addInstructionBreakpoint(instructionReference, offset, address, condition, hitCondition) {
            const newInstructionBreakpoint = new InstructionBreakpoint(instructionReference, offset, false, true, hitCondition, condition, undefined, address);
            this.instructionBreakpoints.push(newInstructionBreakpoint);
            this._onDidChangeBreakpoints.fire({ added: [newInstructionBreakpoint], sessionOnly: true });
        }
        removeInstructionBreakpoints(instructionReference, offset) {
            let removed = [];
            if (instructionReference) {
                for (let i = 0; i < this.instructionBreakpoints.length; i++) {
                    const ibp = this.instructionBreakpoints[i];
                    if (ibp.instructionReference === instructionReference && (offset === undefined || ibp.offset === offset)) {
                        removed.push(ibp);
                        this.instructionBreakpoints.splice(i--, 1);
                    }
                }
            }
            else {
                removed = this.instructionBreakpoints;
                this.instructionBreakpoints = [];
            }
            this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
        }
        getWatchExpressions() {
            return this.watchExpressions;
        }
        addWatchExpression(name) {
            const we = new Expression(name || '');
            this.watchExpressions.push(we);
            this._onDidChangeWatchExpressions.fire(we);
            return we;
        }
        renameWatchExpression(id, newName) {
            const filtered = this.watchExpressions.filter(we => we.getId() === id);
            if (filtered.length === 1) {
                filtered[0].name = newName;
                this._onDidChangeWatchExpressions.fire(filtered[0]);
            }
        }
        removeWatchExpressions(id = null) {
            this.watchExpressions = id ? this.watchExpressions.filter(we => we.getId() !== id) : [];
            this._onDidChangeWatchExpressions.fire(undefined);
        }
        moveWatchExpression(id, position) {
            const we = this.watchExpressions.find(we => we.getId() === id);
            if (we) {
                this.watchExpressions = this.watchExpressions.filter(we => we.getId() !== id);
                this.watchExpressions = this.watchExpressions.slice(0, position).concat(we, this.watchExpressions.slice(position));
                this._onDidChangeWatchExpressions.fire(undefined);
            }
        }
        sourceIsNotAvailable(uri) {
            this.sessions.forEach(s => {
                const source = s.getSourceForUri(uri);
                if (source) {
                    source.available = false;
                }
            });
            this._onDidChangeCallStack.fire(undefined);
        }
    };
    exports.DebugModel = DebugModel;
    exports.DebugModel = DebugModel = __decorate([
        __param(1, textfiles_1.ITextFileService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, log_1.ILogService)
    ], DebugModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvY29tbW9uL2RlYnVnTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0NoRyxNQUFhLG1CQUFtQjtpQkFFUixjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWtCLEFBQTVCLENBQTZCO1FBQzdELDhDQUE4QztpQkFDdEIsb0JBQWUsR0FBRyxHQUFHLEFBQU4sQ0FBTztRQU85QyxZQUNXLE9BQWtDLEVBQ3pCLFFBQTRCLEVBQ3ZDLFVBQThCLEVBQ3JCLEVBQVUsRUFDcEIsaUJBQXFDLENBQUMsRUFDdEMsbUJBQXVDLENBQUMsRUFDeEMsa0JBQXNDLFNBQVMsRUFDOUMsbUJBQXVDLENBQUMsRUFDekMsbUJBQXVFLFNBQVM7WUFSN0UsWUFBTyxHQUFQLE9BQU8sQ0FBMkI7WUFDekIsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7WUFDdkMsZUFBVSxHQUFWLFVBQVUsQ0FBb0I7WUFDckIsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQUNwQixtQkFBYyxHQUFkLGNBQWMsQ0FBd0I7WUFDdEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUF3QjtZQUN4QyxvQkFBZSxHQUFmLGVBQWUsQ0FBZ0M7WUFDOUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUF3QjtZQUN6QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWdFO1lBYmpGLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFheEIsQ0FBQztRQUVMLElBQUksU0FBUztZQUNaLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN4QixDQUFDO1FBRUQsSUFBSSxTQUFTLENBQUMsS0FBeUI7WUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFD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