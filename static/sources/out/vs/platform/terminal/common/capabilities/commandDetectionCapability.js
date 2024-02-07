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
define(["require", "exports", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/platform/terminal/common/capabilities/commandDetection/terminalCommand"], function (require, exports, async_1, decorators_1, event_1, lifecycle_1, log_1, terminalCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLinesForCommand = exports.CommandDetectionCapability = void 0;
    class CommandDetectionCapability extends lifecycle_1.Disposable {
        get commands() { return this._commands; }
        get executingCommand() { return this._currentCommand.command; }
        // TODO: as is unsafe here and it duplicates behavor of executingCommand
        get executingCommandObject() {
            if (this._currentCommand.commandStartMarker) {
                return { marker: this._currentCommand.commandStartMarker };
            }
            return undefined;
        }
        get currentCommand() {
            return this._currentCommand;
        }
        get cwd() { return this._cwd; }
        get _isInputting() {
            return !!(this._currentCommand.commandStartMarker && !this._currentCommand.commandExecutedMarker);
        }
        get hasInput() {
            if (!this._isInputting || !this._currentCommand?.commandStartMarker) {
                return undefined;
            }
            if (this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY === this._currentCommand.commandStartMarker?.line) {
                const line = this._terminal.buffer.active.getLine(this._terminal.buffer.active.cursorY)?.translateToString(true, this._currentCommand.commandStartX);
                if (line === undefined) {
                    return undefined;
                }
                return line.length > 0;
            }
            return true;
        }
        constructor(_terminal, _logService) {
            super();
            this._terminal = _terminal;
            this._logService = _logService;
            this.type = 2 /* TerminalCapability.CommandDetection */;
            this._commands = [];
            this._currentCommand = new terminalCommand_1.PartialTerminalCommand(this._terminal);
            this._commandMarkers = [];
            this.__isCommandStorageDisabled = false;
            this._onCommandStarted = this._register(new event_1.Emitter());
            this.onCommandStarted = this._onCommandStarted.event;
            this._onBeforeCommandFinished = this._register(new event_1.Emitter());
            this.onBeforeCommandFinished = this._onBeforeCommandFinished.event;
            this._onCommandFinished = this._register(new event_1.Emitter());
            this.onCommandFinished = this._onCommandFinished.event;
            this._onCommandExecuted = this._register(new event_1.Emitter());
            this.onCommandExecuted = this._onCommandExecuted.event;
            this._onCommandInvalidated = this._register(new event_1.Emitter());
            this.onCommandInvalidated = this._onCommandInvalidated.event;
            this._onCurrentCommandInvalidated = this._register(new event_1.Emitter());
            this.onCurrentCommandInvalidated = this._onCurrentCommandInvalidated.event;
            // Set up platform-specific behaviors
            const that = this;
            this._ptyHeuristicsHooks = new class {
                get onCurrentCommandInvalidatedEmitter() { return that._onCurrentCommandInvalidated; }
                get onCommandStartedEmitter() { return that._onCommandStarted; }
                get onCommandExecutedEmitter() { return that._onCommandExecuted; }
                get dimensions() { return that._dimensions; }
                get isCommandStorageDisabled() { return that.__isCommandStorageDisabled; }
                get commandMarkers() { return that._commandMarkers; }
                set commandMarkers(value) { that._commandMarkers = value; }
                get clearCommandsInViewport() { return that._clearCommandsInViewport.bind(that); }
                commitCommandFinished() {
                    that._commitCommandFinished?.flush();
                    that._commitCommandFinished = undefined;
                }
            };
            this._ptyHeuristics = this._register(new lifecycle_1.MandatoryMutableDisposable(new UnixPtyHeuristics(this._terminal, this, this._ptyHeuristicsHooks, this._logService)));
            this._dimensions = {
                cols: this._terminal.cols,
                rows: this._terminal.rows
            };
            this._register(this._terminal.onResize(e => this._handleResize(e)));
            this._register(this._terminal.onCursorMove(() => this._handleCursorMove()));
        }
        _handleResize(e) {
            this._ptyHeuristics.value.preHandleResize?.(e);
            this._dimensions.cols = e.cols;
            this._dimensions.rows = e.rows;
        }
        _handleCursorMove() {
            // Early versions of conpty do not have real support for an alt buffer, in addition certain
            // commands such as tsc watch will write to the top of the normal buffer. The following
            // checks when the cursor has moved while the normal buffer is empty and if it is above the
            // current command, all decorations within the viewport will be invalidated.
            //
            // This function is debounced so that the cursor is only checked when it is stable so
            // conpty's screen reprinting will not trigger decoration clearing.
            //
            // This is mostly a workaround for Windows but applies to all OS' because of the tsc watch
            // case.
            if (this._terminal.buffer.active === this._terminal.buffer.normal && this._currentCommand.commandStartMarker) {
                if (this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY < this._currentCommand.commandStartMarker.line) {
                    this._clearCommandsInViewport();
                    this._currentCommand.isInvalid = true;
                    this._onCurrentCommandInvalidated.fire({ reason: "windows" /* CommandInvalidationReason.Windows */ });
                }
            }
        }
        _clearCommandsInViewport() {
            // Find the number of commands on the tail end of the array that are within the viewport
            let count = 0;
            for (let i = this._commands.length - 1; i >= 0; i--) {
                const line = this._commands[i].marker?.line;
                if (line && line < this._terminal.buffer.active.baseY) {
                    break;
                }
                count++;
            }
            // Remove them
            if (count > 0) {
                this._onCommandInvalidated.fire(this._commands.splice(this._commands.length - count, count));
            }
        }
        setCwd(value) {
            this._cwd = value;
        }
        setIsWindowsPty(value) {
            if (value && !(this._ptyHeuristics.value instanceof WindowsPtyHeuristics)) {
                const that = this;
                this._ptyHeuristics.value = new WindowsPtyHeuristics(this._terminal, this, new class {
                    get onCurrentCommandInvalidatedEmitter() { return that._onCurrentCommandInvalidated; }
                    get onCommandStartedEmitter() { return that._onCommandStarted; }
                    get onCommandExecutedEmitter() { return that._onCommandExecuted; }
                    get dimensions() { return that._dimensions; }
                    get isCommandStorageDisabled() { return that.__isCommandStorageDisabled; }
                    get commandMarkers() { return that._commandMarkers; }
                    set commandMarkers(value) { that._commandMarkers = value; }
                    get clearCommandsInViewport() { return that._clearCommandsInViewport.bind(that); }
                    commitCommandFinished() {
                        that._commitCommandFinished?.flush();
                        that._commitCommandFinished = undefined;
                    }
                }, this._logService);
            }
            else if (!value && !(this._ptyHeuristics.value instanceof UnixPtyHeuristics)) {
                this._ptyHeuristics.value = new UnixPtyHeuristics(this._terminal, this, this._ptyHeuristicsHooks, this._logService);
            }
        }
        setIsCommandStorageDisabled() {
            this.__isCommandStorageDisabled = true;
        }
        getCommandForLine(line) {
            // Handle the current partial command first, anything below it's prompt is considered part
            // of the current command
            if (this._currentCommand.promptStartMarker && line >= this._currentCommand.promptStartMarker?.line) {
                return this._currentCommand;
            }
            // No commands
            if (this._commands.length === 0) {
                return undefined;
            }
            // Line is before any registered commands
            if ((this._commands[0].promptStartMarker ?? this._commands[0].marker).line > line) {
                return undefined;
            }
            // Iterate backwards through commands to find the right one
            for (let i = this.commands.length - 1; i >= 0; i--) {
                if ((this.commands[i].promptStartMarker ?? this.commands[i].marker).line <= line) {
                    return this.commands[i];
                }
            }
            return undefined;
        }
        getCwdForLine(line) {
            // Handle the current partial command first, anything below it's prompt is considered part
            // of the current command
            if (this._currentCommand.promptStartMarker && line >= this._currentCommand.promptStartMarker?.line) {
                return this._cwd;
            }
            const command = this.getCommandForLine(line);
            if (command && 'cwd' in command) {
                return command.cwd;
            }
            return undefined;
        }
        handlePromptStart(options) {
            // Adjust the last command's finished marker when needed. The standard position for the
            // finished marker `D` to appear is at the same position as the following prompt started
            // `A`.
            const lastCommand = this.commands.at(-1);
            if (lastCommand?.endMarker && lastCommand?.executedMarker && lastCommand.endMarker.line === lastCommand.executedMarker.line) {
                this._logService.debug('CommandDetectionCapability#handlePromptStart adjusted commandFinished', `${lastCommand.endMarker.line} -> ${lastCommand.executedMarker.line + 1}`);
                lastCommand.endMarker = cloneMarker(this._terminal, lastCommand.executedMarker, 1);
            }
            this._currentCommand.promptStartMarker = options?.marker || (lastCommand?.endMarker ? cloneMarker(this._terminal, lastCommand.endMarker) : this._terminal.registerMarker(0));
            this._logService.debug('CommandDetectionCapability#handlePromptStart', this._terminal.buffer.active.cursorX, this._currentCommand.promptStartMarker?.line);
        }
        handleContinuationStart() {
            this._currentCommand.currentContinuationMarker = this._terminal.registerMarker(0);
            this._logService.debug('CommandDetectionCapability#handleContinuationStart', this._currentCommand.currentContinuationMarker);
        }
        handleContinuationEnd() {
            if (!this._currentCommand.currentContinuationMarker) {
                this._logService.warn('CommandDetectionCapability#handleContinuationEnd Received continuation end without start');
                return;
            }
            if (!this._currentCommand.continuations) {
                this._currentCommand.continuations = [];
            }
            this._currentCommand.continuations.push({
                marker: this._currentCommand.currentContinuationMarker,
                end: this._terminal.buffer.active.cursorX
            });
            this._currentCommand.currentContinuationMarker = undefined;
            this._logService.debug('CommandDetectionCapability#handleContinuationEnd', this._currentCommand.continuations[this._currentCommand.continuations.length - 1]);
        }
        handleRightPromptStart() {
            this._currentCommand.commandRightPromptStartX = this._terminal.buffer.active.cursorX;
            this._logService.debug('CommandDetectionCapability#handleRightPromptStart', this._currentCommand.commandRightPromptStartX);
        }
        handleRightPromptEnd() {
            this._currentCommand.commandRightPromptEndX = this._terminal.buffer.active.cursorX;
            this._logService.debug('CommandDetectionCapability#handleRightPromptEnd', this._currentCommand.commandRightPromptEndX);
        }
        handleCommandStart(options) {
            this._handleCommandStartOptions = options;
            // Only update the column if the line has already been set
            this._currentCommand.commandStartMarker = options?.marker || this._currentCommand.commandStartMarker;
            if (this._currentCommand.commandStartMarker?.line === this._terminal.buffer.active.cursorY) {
                this._currentCommand.commandStartX = this._terminal.buffer.active.cursorX;
                this._logService.debug('CommandDetectionCapability#handleCommandStart', this._currentCommand.commandStartX, this._currentCommand.commandStartMarker?.line);
                return;
            }
            this._ptyHeuristics.value.handleCommandStart(options);
        }
        handleGenericCommand(options) {
            if (options?.markProperties?.disableCommandStorage) {
                this.setIsCommandStorageDisabled();
            }
            this.handlePromptStart(options);
            this.handleCommandStart(options);
            this.handleCommandExecuted(options);
            this.handleCommandFinished(undefined, options);
        }
        handleCommandExecuted(options) {
            this._ptyHeuristics.value.handleCommandExecuted(options);
        }
        handleCommandFinished(exitCode, options) {
            this._ptyHeuristics.value.preHandleCommandFinished?.();
            this._logService.debug('CommandDetectionCapability#handleCommandFinished', this._terminal.buffer.active.cursorX, options?.marker?.line, this._currentCommand.command, this._currentCommand);
            // HACK: Handle a special case on some versions of bash where identical commands get merged
            // in the output of `history`, this detects that case and sets the exit code to the the last
            // command's exit code. This covered the majority of cases but will fail if the same command
            // runs with a different exit code, that will need a more robust fix where we send the
            // command ID and exit code over to the capability to adjust there.
            if (exitCode === undefined) {
                const lastCommand = this.commands.length > 0 ? this.commands[this.commands.length - 1] : undefined;
                if (this._currentCommand.command && this._currentCommand.command.length > 0 && lastCommand?.command === this._currentCommand.command) {
                    exitCode = lastCommand.exitCode;
                }
            }
            if (this._currentCommand.commandStartMarker === undefined || !this._terminal.buffer.active) {
                return;
            }
            this._currentCommand.commandFinishedMarker = options?.marker || this._terminal.registerMarker(0);
            this._ptyHeuristics.value.postHandleCommandFinished?.();
            const newCommand = this._currentCommand.promoteToFullCommand(this._cwd, exitCode, this._handleCommandStartOptions?.ignoreCommandLine ?? false, options?.markProperties);
            if (newCommand) {
                this._commands.push(newCommand);
                this._commitCommandFinished = new async_1.RunOnceScheduler(() => {
                    this._onBeforeCommandFinished.fire(newCommand);
                    if (!this._currentCommand.isInvalid) {
                        this._logService.debug('CommandDetectionCapability#onCommandFinished', newCommand);
                        this._onCommandFinished.fire(newCommand);
                    }
                }, 50);
                this._commitCommandFinished.schedule();
            }
            this._currentCommand = new terminalCommand_1.PartialTerminalCommand(this._terminal);
            this._handleCommandStartOptions = undefined;
        }
        setCommandLine(commandLine, isTrusted) {
            this._logService.debug('CommandDetectionCapability#setCommandLine', commandLine, isTrusted);
            this._currentCommand.command = commandLine;
            this._currentCommand.isTrusted = isTrusted;
        }
        serialize() {
            const commands = this.commands.map(e => e.serialize(this.__isCommandStorageDisabled));
            const partialCommand = this._currentCommand.serialize(this._cwd);
            if (partialCommand) {
                commands.push(partialCommand);
            }
            return {
                isWindowsPty: this._ptyHeuristics.value instanceof WindowsPtyHeuristics,
                commands
            };
        }
        deserialize(serialized) {
            if (serialized.isWindowsPty) {
                this.setIsWindowsPty(serialized.isWindowsPty);
            }
            const buffer = this._terminal.buffer.normal;
            for (const e of serialized.commands) {
                // Partial command
                if (!e.endLine) {
                    // Check for invalid command
                    const marker = e.startLine !== undefined ? this._terminal.registerMarker(e.startLine - (buffer.baseY + buffer.cursorY)) : undefined;
                    if (!marker) {
                        continue;
                    }
                    this._currentCommand.commandStartMarker = e.startLine !== undefined ? this._terminal.registerMarker(e.startLine - (buffer.baseY + buffer.cursorY)) : undefined;
                    this._currentCommand.commandStartX = e.startX;
                    this._currentCommand.promptStartMarker = e.promptStartLine !== undefined ? this._terminal.registerMarker(e.promptStartLine - (buffer.baseY + buffer.cursorY)) : undefined;
                    this._cwd = e.cwd;
                    this._onCommandStarted.fire({ marker });
                    continue;
                }
                // Full command
                const newCommand = terminalCommand_1.TerminalCommand.deserialize(this._terminal, e, this.__isCommandStorageDisabled);
                if (!newCommand) {
                    continue;
                }
                this._commands.push(newCommand);
                this._logService.debug('CommandDetectionCapability#onCommandFinished', newCommand);
                this._onCommandFinished.fire(newCommand);
            }
        }
    }
    exports.CommandDetectionCapability = CommandDetectionCapability;
    __decorate([
        (0, decorators_1.debounce)(500)
    ], CommandDetectionCapability.prototype, "_handleCursorMove", null);
    /**
     * Non-Windows-specific behavior.
     */
    class UnixPtyHeuristics extends lifecycle_1.Disposable {
        constructor(_terminal, _capability, _hooks, _logService) {
            super();
            this._terminal = _terminal;
            this._capability = _capability;
            this._hooks = _hooks;
            this._logService = _logService;
            this._register(_terminal.parser.registerCsiHandler({ final: 'J' }, params => {
                if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
                    _hooks.clearCommandsInViewport();
                }
                // We don't want to override xterm.js' default behavior, just augment it
                return false;
            }));
        }
        async handleCommandStart(options) {
            this._hooks.commitCommandFinished();
            const currentCommand = this._capability.currentCommand;
            currentCommand.commandStartX = this._terminal.buffer.active.cursorX;
            currentCommand.commandStartMarker = options?.marker || this._terminal.registerMarker(0);
            // Clear executed as it must happen after command start
            currentCommand.commandExecutedMarker?.dispose();
            currentCommand.commandExecutedMarker = undefined;
            currentCommand.commandExecutedX = undefined;
            for (const m of this._hooks.commandMarkers) {
                m.dispose();
            }
            this._hooks.commandMarkers.length = 0;
            this._hooks.onCommandStartedEmitter.fire({ marker: options?.marker || currentCommand.commandStartMarker, markProperties: options?.markProperties });
            this._logService.debug('CommandDetectionCapability#handleCommandStart', currentCommand.commandStartX, currentCommand.commandStartMarker?.line);
        }
        handleCommandExecuted(options) {
            const currentCommand = this._capability.currentCommand;
            currentCommand.commandExecutedMarker = options?.marker || this._terminal.registerMarker(0);
            currentCommand.commandExecutedX = this._terminal.buffer.active.cursorX;
            this._logService.debug('CommandDetectionCapability#handleCommandExecuted', currentCommand.commandExecutedX, currentCommand.commandExecutedMarker?.line);
            // Sanity check optional props
            if (!currentCommand.commandStartMarker || !currentCommand.commandExecutedMarker || currentCommand.commandStartX === undefined) {
                return;
            }
            // Calculate the command
            currentCommand.command = this._hooks.isCommandStorageDisabled ? '' : this._terminal.buffer.active.getLine(currentCommand.commandStartMarker.line)?.translateToString(true, currentCommand.commandStartX, currentCommand.commandRightPromptStartX).trim();
            let y = currentCommand.commandStartMarker.line + 1;
            const commandExecutedLine = currentCommand.commandExecutedMarker.line;
            for (; y < commandExecutedLine; y++) {
                const line = this._terminal.buffer.active.getLine(y);
                if (line) {
                    const continuation = currentCommand.continuations?.find(e => e.marker.line === y);
                    if (continuation) {
                        currentCommand.command += '\n';
                    }
                    const startColumn = continuation?.end ?? 0;
                    currentCommand.command += line.translateToString(true, startColumn);
                }
            }
            if (y === commandExecutedLine) {
                currentCommand.command += this._terminal.buffer.active.getLine(commandExecutedLine)?.translateToString(true, undefined, currentCommand.commandExecutedX) || '';
            }
            this._hooks.onCommandExecutedEmitter.fire();
        }
    }
    var AdjustCommandStartMarkerConstants;
    (function (AdjustCommandStartMarkerConstants) {
        AdjustCommandStartMarkerConstants[AdjustCommandStartMarkerConstants["MaxCheckLineCount"] = 5] = "MaxCheckLineCount";
        AdjustCommandStartMarkerConstants[AdjustCommandStartMarkerConstants["Interval"] = 20] = "Interval";
        AdjustCommandStartMarkerConstants[AdjustCommandStartMarkerConstants["MaximumPollCount"] = 50] = "MaximumPollCount";
    })(AdjustCommandStartMarkerConstants || (AdjustCommandStartMarkerConstants = {}));
    /**
     * An object that integrated with and decorates the command detection capability to add heuristics
     * that adjust various markers to work better with Windows and ConPTY. This isn't depended upon the
     * frontend OS, or even the backend OS, but the `IsWindows` property which technically a non-Windows
     * client can emit (for example in tests).
     */
    let WindowsPtyHeuristics = class WindowsPtyHeuristics extends lifecycle_1.Disposable {
        constructor(_terminal, _capability, _hooks, _logService) {
            super();
            this._terminal = _terminal;
            this._capability = _capability;
            this._hooks = _hooks;
            this._logService = _logService;
            this._onCursorMoveListener = this._register(new lifecycle_1.MutableDisposable());
            this._recentlyPerformedCsiJ = false;
            this._tryAdjustCommandStartMarkerScannedLineCount = 0;
            this._tryAdjustCommandStartMarkerPollCount = 0;
            this._register(_terminal.parser.registerCsiHandler({ final: 'J' }, params => {
                if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
                    this._recentlyPerformedCsiJ = true;
                    this._hooks.clearCommandsInViewport();
                }
                // We don't want to override xterm.js' default behavior, just augment it
                return false;
            }));
            this._register(this._capability.onBeforeCommandFinished(command => {
                if (this._recentlyPerformedCsiJ) {
                    this._recentlyPerformedCsiJ = false;
                    return;
                }
                // For older Windows backends we cannot listen to CSI J, instead we assume running clear
                // or cls will clear all commands in the viewport. This is not perfect but it's right
                // most of the time.
                if (command.command.trim().toLowerCase() === 'clear' || command.command.trim().toLowerCase() === 'cls') {
                    this._tryAdjustCommandStartMarkerScheduler?.cancel();
                    this._tryAdjustCommandStartMarkerScheduler = undefined;
                    this._hooks.clearCommandsInViewport();
                    this._capability.currentCommand.isInvalid = true;
                    this._hooks.onCurrentCommandInvalidatedEmitter.fire({ reason: "windows" /* CommandInvalidationReason.Windows */ });
                }
            }));
        }
        preHandleResize(e) {
            // Resize behavior is different under conpty; instead of bringing parts of the scrollback
            // back into the viewport, new lines are inserted at the bottom (ie. the same behavior as if
            // there was no scrollback).
            //
            // On resize this workaround will wait for a conpty reprint to occur by waiting for the
            // cursor to move, it will then calculate the number of lines that the commands within the
            // viewport _may have_ shifted. After verifying the content of the current line is
            // incorrect, the line after shifting is checked and if that matches delete events are fired
            // on the xterm.js buffer to move the markers.
            //
            // While a bit hacky, this approach is quite safe and seems to work great at least for pwsh.
            const baseY = this._terminal.buffer.active.baseY;
            const rowsDifference = e.rows - this._hooks.dimensions.rows;
            // Only do when rows increase, do in the next frame as this needs to happen after
            // conpty reprints the screen
            if (rowsDifference > 0) {
                this._waitForCursorMove().then(() => {
                    // Calculate the number of lines the content may have shifted, this will max out at
                    // scrollback count since the standard behavior will be used then
                    const potentialShiftedLineCount = Math.min(rowsDifference, baseY);
                    // For each command within the viewport, assume commands are in the correct order
                    for (let i = this._capability.commands.length - 1; i >= 0; i--) {
                        const command = this._capability.commands[i];
                        if (!command.marker || command.marker.line < baseY || command.commandStartLineContent === undefined) {
                            break;
                        }
                        const line = this._terminal.buffer.active.getLine(command.marker.line);
                        if (!line || line.translateToString(true) === command.commandStartLineContent) {
                            continue;
                        }
                        const shiftedY = command.marker.line - potentialShiftedLineCount;
                        const shiftedLine = this._terminal.buffer.active.getLine(shiftedY);
                        if (shiftedLine?.translateToString(true) !== command.commandStartLineContent) {
                            continue;
                        }
                        // HACK: xterm.js doesn't expose this by design as it's an internal core
                        // function an embedder could easily do damage with. Additionally, this
                        // can't really be upstreamed since the event relies on shell integration to
                        // verify the shifting is necessary.
                        this._terminal._core._bufferService.buffer.lines.onDeleteEmitter.fire({
                            index: this._terminal.buffer.active.baseY,
                            amount: potentialShiftedLineCount
                        });
                    }
                });
            }
        }
        async handleCommandStart() {
            this._capability.currentCommand.commandStartX = this._terminal.buffer.active.cursorX;
            // On Windows track all cursor movements after the command start sequence
            this._hooks.commandMarkers.length = 0;
            const initialCommandStartMarker = this._capability.currentCommand.commandStartMarker = (this._capability.currentCommand.promptStartMarker
                ? cloneMarker(this._terminal, this._capability.currentCommand.promptStartMarker)
                : this._terminal.registerMarker(0));
            this._capability.currentCommand.commandStartX = 0;
            // DEBUG: Add a decoration for the original unadjusted command start position
            // if ('registerDecoration' in this._terminal) {
            // 	const d = (this._terminal as any).registerDecoration({
            // 		marker: this._capability.currentCommand.commandStartMarker,
            // 		x: this._capability.currentCommand.commandStartX
            // 	});
            // 	d?.onRender((e: HTMLElement) => {
            // 		e.textContent = 'b';
            // 		e.classList.add('xterm-sequence-decoration', 'top', 'right');
            // 		e.title = 'Initial command start position';
            // 	});
            // }
            // The command started sequence may be printed before the actual prompt is, for example a
            // multi-line prompt will typically look like this where D, A and B signify the command
            // finished, prompt started and command started sequences respectively:
            //
            //     D/my/cwdB
            //     > C
            //
            // Due to this, it's likely that this will be called before the line has been parsed.
            // Unfortunately, it is also the case that the actual command start data may not be parsed
            // by the end of the task either, so a microtask cannot be used.
            //
            // The strategy used is to begin polling and scanning downwards for up to the next 5 lines.
            // If it looks like a prompt is found, the command started location is adjusted. If the
            // command executed sequences comes in before polling is done, polling is canceled and the
            // final polling task is executed synchronously.
            this._tryAdjustCommandStartMarkerScannedLineCount = 0;
            this._tryAdjustCommandStartMarkerPollCount = 0;
            this._tryAdjustCommandStartMarkerScheduler = new async_1.RunOnceScheduler(() => this._tryAdjustCommandStartMarker(initialCommandStartMarker), 20 /* AdjustCommandStartMarkerConstants.Interval */);
            this._tryAdjustCommandStartMarkerScheduler.schedule();
            // TODO: Cache details about polling for the future - eg. if it always fails, stop bothering
        }
        _tryAdjustCommandStartMarker(start) {
            if (this._store.isDisposed) {
                return;
            }
            const buffer = this._terminal.buffer.active;
            let scannedLineCount = this._tryAdjustCommandStartMarkerScannedLineCount;
            while (scannedLineCount < 5 /* AdjustCommandStartMarkerConstants.MaxCheckLineCount */ && start.line + scannedLineCount < buffer.baseY + this._terminal.rows) {
                if (this._cursorOnNextLine()) {
                    const prompt = this._getWindowsPrompt(start.line + scannedLineCount);
                    if (prompt) {
                        const adjustedPrompt = typeof prompt === 'string' ? prompt : prompt.prompt;
                        this._capability.currentCommand.commandStartMarker = this._terminal.registerMarker(0);
                        if (typeof prompt === 'object' && prompt.likelySingleLine) {
                            this._logService.debug('CommandDetectionCapability#_tryAdjustCommandStartMarker adjusted promptStart', `${this._capability.currentCommand.promptStartMarker?.line} -> ${this._capability.currentCommand.commandStartMarker.line}`);
                            this._capability.currentCommand.promptStartMarker?.dispose();
                            this._capability.currentCommand.promptStartMarker = cloneMarker(this._terminal, this._capability.currentCommand.commandStartMarker);
                            // Adjust the last command if it's not in the same position as the following
                            // prompt start marker
                            const lastCommand = this._capability.commands.at(-1);
                            if (lastCommand && this._capability.currentCommand.commandStartMarker.line !== lastCommand.endMarker?.line) {
                                lastCommand.endMarker?.dispose();
                                lastCommand.endMarker = cloneMarker(this._terminal, this._capability.currentCommand.commandStartMarker);
                            }
                        }
                        // use the regex to set the position as it's possible input has occurred
                        this._capability.currentCommand.commandStartX = adjustedPrompt.length;
                        this._logService.debug('CommandDetectionCapability#_tryAdjustCommandStartMarker adjusted commandStart', `${start.line} -> ${this._capability.currentCommand.commandStartMarker.line}:${this._capability.currentCommand.commandStartX}`);
                        this._flushPendingHandleCommandStartTask();
                        return;
                    }
                }
                scannedLineCount++;
            }
            if (scannedLineCount < 5 /* AdjustCommandStartMarkerConstants.MaxCheckLineCount */) {
                this._tryAdjustCommandStartMarkerScannedLineCount = scannedLineCount;
                if (this._tryAdjustCommandStartMarkerPollCount < 50 /* AdjustCommandStartMarkerConstants.MaximumPollCount */) {
                    this._tryAdjustCommandStartMarkerScheduler?.schedule();
                }
                else {
                    this._flushPendingHandleCommandStartTask();
                }
            }
            else {
                this._flushPendingHandleCommandStartTask();
            }
        }
        _flushPendingHandleCommandStartTask() {
            // Perform final try adjust if necessary
            if (this._tryAdjustCommandStartMarkerScheduler) {
                // Max out poll count to ensure it's the last run
                this._tryAdjustCommandStartMarkerPollCount = 50 /* AdjustCommandStartMarkerConstants.MaximumPollCount */;
                this._tryAdjustCommandStartMarkerScheduler.flush();
                this._tryAdjustCommandStartMarkerScheduler = undefined;
            }
            this._hooks.commitCommandFinished();
            if (!this._capability.currentCommand.commandExecutedMarker) {
                this._onCursorMoveListener.value = this._terminal.onCursorMove(() => {
                    if (this._hooks.commandMarkers.length === 0 || this._hooks.commandMarkers[this._hooks.commandMarkers.length - 1].line !== this._terminal.buffer.active.cursorY) {
                        const marker = this._terminal.registerMarker(0);
                        if (marker) {
                            this._hooks.commandMarkers.push(marker);
                        }
                    }
                });
            }
            if (this._capability.currentCommand.commandStartMarker) {
                const line = this._terminal.buffer.active.getLine(this._capability.currentCommand.commandStartMarker.line);
                if (line) {
                    this._capability.currentCommand.commandStartLineContent = line.translateToString(true);
                }
            }
            this._hooks.onCommandStartedEmitter.fire({ marker: this._capability.currentCommand.commandStartMarker });
            this._logService.debug('CommandDetectionCapability#_handleCommandStartWindows', this._capability.currentCommand.commandStartX, this._capability.currentCommand.commandStartMarker?.line);
        }
        handleCommandExecuted(options) {
            if (this._tryAdjustCommandStartMarkerScheduler) {
                this._flushPendingHandleCommandStartTask();
            }
            // Use the gathered cursor move markers to correct the command start and executed markers
            this._onCursorMoveListener.clear();
            this._evaluateCommandMarkers();
            this._capability.currentCommand.commandExecutedX = this._terminal.buffer.active.cursorX;
            this._hooks.onCommandExecutedEmitter.fire();
            this._logService.debug('CommandDetectionCapability#handleCommandExecuted', this._capability.currentCommand.commandExecutedX, this._capability.currentCommand.commandExecutedMarker?.line);
        }
        preHandleCommandFinished() {
            if (this._capability.currentCommand.commandExecutedMarker) {
                return;
            }
            // This is done on command finished just in case command executed never happens (for example
            // PSReadLine tab completion)
            if (this._hooks.commandMarkers.length === 0) {
                // If the command start timeout doesn't happen before command finished, just use the
                // current marker.
                if (!this._capability.currentCommand.commandStartMarker) {
                    this._capability.currentCommand.commandStartMarker = this._terminal.registerMarker(0);
                }
                if (this._capability.currentCommand.commandStartMarker) {
                    this._hooks.commandMarkers.push(this._capability.currentCommand.commandStartMarker);
                }
            }
            this._evaluateCommandMarkers();
        }
        postHandleCommandFinished() {
            const currentCommand = this._capability.currentCommand;
            const commandText = currentCommand.command;
            const commandLine = currentCommand.commandStartMarker?.line;
            const executedLine = currentCommand.commandExecutedMarker?.line;
            if (!commandText || commandText.length === 0 ||
                commandLine === undefined || commandLine === -1 ||
                executedLine === undefined || executedLine === -1) {
                return;
            }
            // Scan downwards from the command start line and search for every character in the actual
            // command line. This may end up matching the wrong characters, but it shouldn't matter at
            // least in the typical case as the entire command will still get matched.
            let current = 0;
            let found = false;
            for (let i = commandLine; i <= executedLine; i++) {
                const line = this._terminal.buffer.active.getLine(i);
                if (!line) {
                    break;
                }
                const text = line.translateToString(true);
                for (let j = 0; j < text.length; j++) {
                    // Skip whitespace in case it was not actually rendered or could be trimmed from the
                    // end of the line
                    while (commandText.length < current && commandText[current] === ' ') {
                        current++;
                    }
                    // Character match
                    if (text[j] === commandText[current]) {
                        current++;
                    }
                    // Full command match
                    if (current === commandText.length) {
                        // It's ambiguous whether the command executed marker should ideally appear at
                        // the end of the line or at the beginning of the next line. Since it's more
                        // useful for extracting the command at the end of the current line we go with
                        // that.
                        const wrapsToNextLine = j >= this._terminal.cols - 1;
                        currentCommand.commandExecutedMarker = this._terminal.registerMarker(i - (this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY) + (wrapsToNextLine ? 1 : 0));
                        currentCommand.commandExecutedX = wrapsToNextLine ? 0 : j + 1;
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
        }
        _evaluateCommandMarkers() {
            // On Windows, use the gathered cursor move markers to correct the command start and
            // executed markers.
            if (this._hooks.commandMarkers.length === 0) {
                return;
            }
            this._hooks.commandMarkers = this._hooks.commandMarkers.sort((a, b) => a.line - b.line);
            this._capability.currentCommand.commandStartMarker = this._hooks.commandMarkers[0];
            if (this._capability.currentCommand.commandStartMarker) {
                const line = this._terminal.buffer.active.getLine(this._capability.currentCommand.commandStartMarker.line);
                if (line) {
                    this._capability.currentCommand.commandStartLineContent = line.translateToString(true);
                }
            }
            this._capability.currentCommand.commandExecutedMarker = this._hooks.commandMarkers[this._hooks.commandMarkers.length - 1];
            // Fire this now to prevent issues like #197409
            this._hooks.onCommandExecutedEmitter.fire();
        }
        _cursorOnNextLine() {
            const lastCommand = this._capability.commands.at(-1);
            // There is only a single command, so this check is unnecessary
            if (!lastCommand) {
                return true;
            }
            const cursorYAbsolute = this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY;
            // If the cursor position is within the last command, we should poll.
            const lastCommandYAbsolute = (lastCommand.endMarker ? lastCommand.endMarker.line : lastCommand.marker?.line) ?? -1;
            return cursorYAbsolute > lastCommandYAbsolute;
        }
        _waitForCursorMove() {
            const cursorX = this._terminal.buffer.active.cursorX;
            const cursorY = this._terminal.buffer.active.cursorY;
            let totalDelay = 0;
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    if (cursorX !== this._terminal.buffer.active.cursorX || cursorY !== this._terminal.buffer.active.cursorY) {
                        resolve();
                        clearInterval(interval);
                        return;
                    }
                    totalDelay += 10;
                    if (totalDelay > 1000) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 10);
            });
        }
        _getWindowsPrompt(y = this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY) {
            const line = this._terminal.buffer.active.getLine(y);
            if (!line) {
                return;
            }
            // TODO: fine tune prompt regex to accomodate for unique configurations.
            const lineText = line.translateToString(true);
            if (!lineText) {
                return;
            }
            // PowerShell
            const pwshPrompt = lineText.match(/(?<prompt>(\(.+\)\s)?(?:PS.+>\s?))/)?.groups?.prompt;
            if (pwshPrompt) {
                const adjustedPrompt = this._adjustPrompt(pwshPrompt, lineText, '>');
                if (adjustedPrompt) {
                    return {
                        prompt: adjustedPrompt,
                        likelySingleLine: true
                    };
                }
            }
            // Custom prompts like starship end in the common \u276f character
            const customPrompt = lineText.match(/.*\u276f(?=[^\u276f]*$)/g)?.[0];
            if (customPrompt) {
                const adjustedPrompt = this._adjustPrompt(customPrompt, lineText, '\u276f');
                if (adjustedPrompt) {
                    return adjustedPrompt;
                }
            }
            // Command Prompt
            const cmdMatch = lineText.match(/^(?<prompt>(\(.+\)\s)?(?:[A-Z]:\\.*>))/);
            return cmdMatch?.groups?.prompt ? {
                prompt: cmdMatch.groups.prompt,
                likelySingleLine: true
            } : undefined;
        }
        _adjustPrompt(prompt, lineText, char) {
            if (!prompt) {
                return;
            }
            // Conpty may not 'render' the space at the end of the prompt
            if (lineText === prompt && prompt.endsWith(char)) {
                prompt += ' ';
            }
            return prompt;
        }
    };
    WindowsPtyHeuristics = __decorate([
        __param(3, log_1.ILogService)
    ], WindowsPtyHeuristics);
    function getLinesForCommand(buffer, command, cols, outputMatcher) {
        if (!outputMatcher) {
            return undefined;
        }
        const executedMarker = command.executedMarker;
        const endMarker = command.endMarker;
        if (!executedMarker || !endMarker) {
            return undefined;
        }
        const startLine = executedMarker.line;
        const endLine = endMarker.line;
        const linesToCheck = outputMatcher.length;
        const lines = [];
        if (outputMatcher.anchor === 'bottom') {
            for (let i = endLine - (outputMatcher.offset || 0); i >= startLine; i--) {
                let wrappedLineStart = i;
                const wrappedLineEnd = i;
                while (wrappedLineStart >= startLine && buffer.getLine(wrappedLineStart)?.isWrapped) {
                    wrappedLineStart--;
                }
                i = wrappedLineStart;
                lines.unshift(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, cols));
                if (lines.length > linesToCheck) {
                    lines.pop();
                }
            }
        }
        else {
            for (let i = startLine + (outputMatcher.offset || 0); i < endLine; i++) {
                const wrappedLineStart = i;
                let wrappedLineEnd = i;
                while (wrappedLineEnd + 1 < endLine && buffer.getLine(wrappedLineEnd + 1)?.isWrapped) {
                    wrappedLineEnd++;
                }
                i = wrappedLineEnd;
                lines.push(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, cols));
                if (lines.length === linesToCheck) {
                    lines.shift();
                }
            }
        }
        return lines;
    }
    exports.getLinesForCommand = getLinesForCommand;
    function getXtermLineContent(buffer, lineStart, lineEnd, cols) {
        // Cap the maximum number of lines generated to prevent potential performance problems. This is
        // more of a sanity check as the wrapped line should already be trimmed down at this point.
        const maxLineLength = Math.max(2048 / cols * 2);
        lineEnd = Math.min(lineEnd, lineStart + maxLineLength);
        let content = '';
        for (let i = lineStart; i <= lineEnd; i++) {
            // Make sure only 0 to cols are considered as resizing when windows mode is enabled will
            // retain buffer data outside of the terminal width as reflow is disabled.
            const line = buffer.getLine(i);
            if (line) {
                content += line.translateToString(true, 0, cols);
            }
        }
        return content;
    }
    function cloneMarker(xterm, marker, offset = 0) {
        return xterm.registerMarker(marker.line - (xterm.buffer.active.baseY + xterm.buffer.active.cursorY) + offset);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZERldGVjdGlvbkNhcGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL2NvbW1vbi9jYXBhYmlsaXRpZXMvY29tbWFuZERldGVjdGlvbkNhcGFiaWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0JoRyxNQUFhLDBCQUEyQixTQUFRLHNCQUFVO1FBZ0J6RCxJQUFJLFFBQVEsS0FBaUMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNyRSxJQUFJLGdCQUFnQixLQUF5QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNuRix3RUFBd0U7UUFDeEUsSUFBSSxzQkFBc0I7WUFDekIsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQzdDLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsRUFBc0IsQ0FBQztZQUNoRixDQUFDO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUNELElBQUksY0FBYztZQUNqQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDN0IsQ0FBQztRQUNELElBQUksR0FBRyxLQUF5QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25ELElBQVksWUFBWTtZQUN2QixPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDbkcsQ0FBQztRQUVELElBQUksUUFBUTtZQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFB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