/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PartialTerminalCommand = exports.TerminalCommand = void 0;
    class TerminalCommand {
        get command() { return this._properties.command; }
        get isTrusted() { return this._properties.isTrusted; }
        get timestamp() { return this._properties.timestamp; }
        get promptStartMarker() { return this._properties.promptStartMarker; }
        get marker() { return this._properties.marker; }
        get endMarker() { return this._properties.endMarker; }
        set endMarker(value) { this._properties.endMarker = value; }
        get executedMarker() { return this._properties.executedMarker; }
        get aliases() { return this._properties.aliases; }
        get wasReplayed() { return this._properties.wasReplayed; }
        get cwd() { return this._properties.cwd; }
        get exitCode() { return this._properties.exitCode; }
        get commandStartLineContent() { return this._properties.commandStartLineContent; }
        get markProperties() { return this._properties.markProperties; }
        get executedX() { return this._properties.executedX; }
        get startX() { return this._properties.startX; }
        constructor(_xterm, _properties) {
            this._xterm = _xterm;
            this._properties = _properties;
        }
        static deserialize(xterm, serialized, isCommandStorageDisabled) {
            const buffer = xterm.buffer.normal;
            const marker = serialized.startLine !== undefined ? xterm.registerMarker(serialized.startLine - (buffer.baseY + buffer.cursorY)) : undefined;
            // Check for invalid command
            if (!marker) {
                return undefined;
            }
            const promptStartMarker = serialized.promptStartLine !== undefined ? xterm.registerMarker(serialized.promptStartLine - (buffer.baseY + buffer.cursorY)) : undefined;
            // Valid full command
            const endMarker = serialized.endLine !== undefined ? xterm.registerMarker(serialized.endLine - (buffer.baseY + buffer.cursorY)) : undefined;
            const executedMarker = serialized.executedLine !== undefined ? xterm.registerMarker(serialized.executedLine - (buffer.baseY + buffer.cursorY)) : undefined;
            const newCommand = new TerminalCommand(xterm, {
                command: isCommandStorageDisabled ? '' : serialized.command,
                isTrusted: serialized.isTrusted,
                promptStartMarker,
                marker,
                startX: serialized.startX,
                endMarker,
                executedMarker,
                executedX: serialized.executedX,
                timestamp: serialized.timestamp,
                cwd: serialized.cwd,
                commandStartLineContent: serialized.commandStartLineContent,
                exitCode: serialized.exitCode,
                markProperties: serialized.markProperties,
                aliases: undefined,
                wasReplayed: true
            });
            return newCommand;
        }
        serialize(isCommandStorageDisabled) {
            return {
                promptStartLine: this.promptStartMarker?.line,
                startLine: this.marker?.line,
                startX: undefined,
                endLine: this.endMarker?.line,
                executedLine: this.executedMarker?.line,
                executedX: this.executedX,
                command: isCommandStorageDisabled ? '' : this.command,
                isTrusted: this.isTrusted,
                cwd: this.cwd,
                exitCode: this.exitCode,
                commandStartLineContent: this.commandStartLineContent,
                timestamp: this.timestamp,
                markProperties: this.markProperties,
            };
        }
        getOutput() {
            if (!this.executedMarker || !this.endMarker) {
                return undefined;
            }
            const startLine = this.executedMarker.line;
            const endLine = this.endMarker.line;
            if (startLine === endLine) {
                return undefined;
            }
            let output = '';
            let line;
            for (let i = startLine; i < endLine; i++) {
                line = this._xterm.buffer.active.getLine(i);
                if (!line) {
                    continue;
                }
                output += line.translateToString(!line.isWrapped) + (line.isWrapped ? '' : '\n');
            }
            return output === '' ? undefined : output;
        }
        getOutputMatch(outputMatcher) {
            // TODO: Add back this check? this._ptyHeuristics.value instanceof WindowsPtyHeuristics && (executedMarker?.line === endMarker?.line) ? this._currentCommand.commandStartMarker : executedMarker
            if (!this.executedMarker || !this.endMarker) {
                return undefined;
            }
            const endLine = this.endMarker.line;
            if (endLine === -1) {
                return undefined;
            }
            const buffer = this._xterm.buffer.active;
            const startLine = Math.max(this.executedMarker.line, 0);
            const matcher = outputMatcher.lineMatcher;
            const linesToCheck = typeof matcher === 'string' ? 1 : outputMatcher.length || countNewLines(matcher);
            const lines = [];
            let match;
            if (outputMatcher.anchor === 'bottom') {
                for (let i = endLine - (outputMatcher.offset || 0); i >= startLine; i--) {
                    let wrappedLineStart = i;
                    const wrappedLineEnd = i;
                    while (wrappedLineStart >= startLine && buffer.getLine(wrappedLineStart)?.isWrapped) {
                        wrappedLineStart--;
                    }
                    i = wrappedLineStart;
                    lines.unshift(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, this._xterm.cols));
                    if (!match) {
                        match = lines[0].match(matcher);
                    }
                    if (lines.length >= linesToCheck) {
                        break;
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
                    lines.push(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, this._xterm.cols));
                    if (!match) {
                        match = lines[lines.length - 1].match(matcher);
                    }
                    if (lines.length >= linesToCheck) {
                        break;
                    }
                }
            }
            return match ? { regexMatch: match, outputLines: lines } : undefined;
        }
        hasOutput() {
            return (!this.executedMarker?.isDisposed &&
                !this.endMarker?.isDisposed &&
                !!(this.executedMarker &&
                    this.endMarker &&
                    this.executedMarker.line < this.endMarker.line));
        }
        getPromptRowCount() {
            return getPromptRowCount(this, this._xterm.buffer.active);
        }
        getCommandRowCount() {
            return getCommandRowCount(this);
        }
    }
    exports.TerminalCommand = TerminalCommand;
    class PartialTerminalCommand {
        constructor(_xterm) {
            this._xterm = _xterm;
        }
        serialize(cwd) {
            if (!this.commandStartMarker) {
                return undefined;
            }
            return {
                promptStartLine: this.promptStartMarker?.line,
                startLine: this.commandStartMarker.line,
                startX: this.commandStartX,
                endLine: undefined,
                executedLine: undefined,
                executedX: undefined,
                command: '',
                isTrusted: true,
                cwd,
                exitCode: undefined,
                commandStartLineContent: undefined,
                timestamp: 0,
                markProperties: undefined
            };
        }
        promoteToFullCommand(cwd, exitCode, ignoreCommandLine, markProperties) {
            // When the command finishes and executed never fires the placeholder selector should be used.
            if (exitCode === undefined && this.command === undefined) {
                this.command = '';
            }
            if ((this.command !== undefined && !this.command.startsWith('\\')) || ignoreCommandLine) {
                return new TerminalCommand(this._xterm, {
                    command: ignoreCommandLine ? '' : (this.command || ''),
                    isTrusted: !!this.isTrusted,
                    promptStartMarker: this.promptStartMarker,
                    marker: this.commandStartMarker,
                    startX: this.commandStartX,
                    endMarker: this.commandFinishedMarker,
                    executedMarker: this.commandExecutedMarker,
                    executedX: this.commandExecutedX,
                    timestamp: Date.now(),
                    cwd,
                    exitCode,
                    commandStartLineContent: this.commandStartLineContent,
                    markProperties
                });
            }
            return undefined;
        }
        getPromptRowCount() {
            return getPromptRowCount(this, this._xterm.buffer.active);
        }
        getCommandRowCount() {
            return getCommandRowCount(this);
        }
    }
    exports.PartialTerminalCommand = PartialTerminalCommand;
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
    function countNewLines(regex) {
        if (!regex.multiline) {
            return 1;
        }
        const source = regex.source;
        let count = 1;
        let i = source.indexOf('\\n');
        while (i !== -1) {
            count++;
            i = source.indexOf('\\n', i + 1);
        }
        return count;
    }
    function getPromptRowCount(command, buffer) {
        const marker = 'hasOutput' in command ? command.marker : command.commandStartMarker;
        if (!marker || !command.promptStartMarker) {
            return 1;
        }
        let promptRowCount = 1;
        let promptStartLine = command.promptStartMarker.line;
        // Trim any leading whitespace-only lines to retain vertical space
        while (promptStartLine < marker.line && (buffer.getLine(promptStartLine)?.translateToString(true) ?? '').length === 0) {
            promptStartLine++;
        }
        promptRowCount = marker.line - promptStartLine + 1;
        return promptRowCount;
    }
    function getCommandRowCount(command) {
        const marker = 'hasOutput' in command ? command.marker : command.commandStartMarker;
        const executedMarker = 'hasOutput' in command ? command.executedMarker : command.commandExecutedMarker;
        if (!marker || !executedMarker) {
            return 1;
        }
        const commandExecutedLine = Math.max(executedMarker.line, marker.line);
        let commandRowCount = commandExecutedLine - marker.line + 1;
        // Trim the last line if the cursor X is in the left-most cell
        const executedX = 'hasOutput' in command ? command.executedX : command.commandExecutedX;
        if (executedX === 0) {
            commandRowCount--;
        }
        return commandRowCount;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDb21tYW5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZXJtaW5hbC9jb21tb24vY2FwYWJpbGl0aWVzL2NvbW1hbmREZXRlY3Rpb24vdGVybWluYWxDb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTRCaEcsTUFBYSxlQUFlO1FBRTNCLElBQUksT0FBTyxLQUFLLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQUksU0FBUyxLQUFLLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksU0FBUyxLQUFLLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksaUJBQWlCLEtBQUssT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUN0RSxJQUFJLE1BQU0sS0FBSyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoRCxJQUFJLFNBQVMsS0FBSyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN0RCxJQUFJLFNBQVMsQ0FBQyxLQUErQixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEYsSUFBSSxjQUFjLEtBQUssT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDaEUsSUFBSSxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxXQUFXLEtBQUssT0FBTyxJQUFJLENBQUMsV0FB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