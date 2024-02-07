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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/base/browser/dom"], function (require, exports, arrays_1, lifecycle_1, async_1, themeService_1, terminalColorRegistry_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.selectLines = exports.getLine = exports.MarkNavigationAddon = exports.ScrollPosition = void 0;
    var Boundary;
    (function (Boundary) {
        Boundary[Boundary["Top"] = 0] = "Top";
        Boundary[Boundary["Bottom"] = 1] = "Bottom";
    })(Boundary || (Boundary = {}));
    var ScrollPosition;
    (function (ScrollPosition) {
        ScrollPosition[ScrollPosition["Top"] = 0] = "Top";
        ScrollPosition[ScrollPosition["Middle"] = 1] = "Middle";
    })(ScrollPosition || (exports.ScrollPosition = ScrollPosition = {}));
    let MarkNavigationAddon = class MarkNavigationAddon extends lifecycle_1.Disposable {
        activate(terminal) {
            this._terminal = terminal;
            this._register(this._terminal.onData(() => {
                this._currentMarker = Boundary.Bottom;
            }));
        }
        constructor(_capabilities, _themeService) {
            super();
            this._capabilities = _capabilities;
            this._themeService = _themeService;
            this._currentMarker = Boundary.Bottom;
            this._selectionStart = null;
            this._isDisposable = false;
            this._commandGuideDecorations = this._register(new lifecycle_1.MutableDisposable());
        }
        _getMarkers(skipEmptyCommands) {
            const commandCapability = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
            const partialCommandCapability = this._capabilities.get(3 /* TerminalCapability.PartialCommandDetection */);
            const markCapability = this._capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
            let markers = [];
            if (commandCapability) {
                markers = (0, arrays_1.coalesce)(commandCapability.commands.filter(e => skipEmptyCommands ? e.exitCode !== undefined : true).map(e => e.promptStartMarker ?? e.marker));
                // Allow navigating to the current command iff it has been executed, this ignores the
                // skipEmptyCommands flag intenionally as chances are it's not going to be empty if an
                // executed marker exists when this is requested.
                if (commandCapability.currentCommand?.promptStartMarker && commandCapability.currentCommand.commandExecutedMarker) {
                    markers.push(commandCapability.currentCommand?.promptStartMarker);
                }
            }
            else if (partialCommandCapability) {
                markers.push(...partialCommandCapability.commands);
            }
            if (markCapability && !skipEmptyCommands) {
                let next = markCapability.markers().next()?.value;
                const arr = [];
                while (next) {
                    arr.push(next);
                    next = markCapability.markers().next()?.value;
                }
                markers = arr;
            }
            return markers;
        }
        _findCommand(marker) {
            const commandCapability = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
            if (commandCapability) {
                const command = commandCapability.commands.find(e => e.marker?.line === marker.line || e.promptStartMarker?.line === marker.line);
                if (command) {
                    return command;
                }
                if (commandCapability.currentCommand) {
                    return commandCapability.currentCommand;
                }
            }
            return undefined;
        }
        clearMarker() {
            // Clear the current marker so successive focus/selection actions are performed from the
            // bottom of the buffer
            this._currentMarker = Boundary.Bottom;
            this._resetNavigationDecorations();
            this._selectionStart = null;
        }
        _resetNavigationDecorations() {
            if (this._navigationDecorations) {
                (0, lifecycle_1.dispose)(this._navigationDecorations);
            }
            this._navigationDecorations = [];
        }
        _isEmptyCommand(marker) {
            if (marker === Boundary.Bottom) {
                return true;
            }
            if (marker === Boundary.Top) {
                return !this._getMarkers(true).map(e => e.line).includes(0);
            }
            return !this._getMarkers(true).includes(marker);
        }
        scrollToPreviousMark(scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false, skipEmptyCommands = true) {
            if (!this._terminal) {
                return;
            }
            if (!retainSelection) {
                this._selectionStart = null;
            }
            let markerIndex;
            const currentLineY = typeof this._currentMarker === 'object'
                ? this.getTargetScrollLine(this._currentMarker.line, scrollPosition)
                : Math.min(getLine(this._terminal, this._currentMarker), this._terminal.buffer.active.baseY);
            const viewportY = this._terminal.buffer.active.viewportY;
            if (typeof this._currentMarker === 'object' ? !this._isMarkerInViewport(this._terminal, this._currentMarker) : currentLineY !== viewportY) {
                // The user has scrolled, find the line based on the current scroll position. This only
                // works when not retaining selection
                const markersBelowViewport = this._getMarkers(skipEmptyCommands).filter(e => e.line >= viewportY).length;
                // -1 will scroll to the top
                markerIndex = this._getMarkers(skipEmptyCommands).length - markersBelowViewport - 1;
            }
            else if (this._currentMarker === Boundary.Bottom) {
                markerIndex = this._getMarkers(skipEmptyCommands).length - 1;
            }
            else if (this._currentMarker === Boundary.Top) {
                markerIndex = -1;
            }
            else if (this._isDisposable) {
                markerIndex = this._findPreviousMarker(skipEmptyCommands);
                this._currentMarker.dispose();
                this._isDisposable = false;
            }
            else {
                if (skipEmptyCommands && this._isEmptyCommand(this._currentMarker)) {
                    markerIndex = this._findPreviousMarker(true);
                }
                else {
                    markerIndex = this._getMarkers(skipEmptyCommands).indexOf(this._currentMarker) - 1;
                }
            }
            if (markerIndex < 0) {
                this._currentMarker = Boundary.Top;
                this._terminal.scrollToTop();
                this._resetNavigationDecorations();
                return;
            }
            this._currentMarker = this._getMarkers(skipEmptyCommands)[markerIndex];
            this._scrollToCommand(this._currentMarker, scrollPosition);
        }
        scrollToNextMark(scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false, skipEmptyCommands = true) {
            if (!this._terminal) {
                return;
            }
            if (!retainSelection) {
                this._selectionStart = null;
            }
            let markerIndex;
            const currentLineY = typeof this._currentMarker === 'object'
                ? this.getTargetScrollLine(this._currentMarker.line, scrollPosition)
                : Math.min(getLine(this._terminal, this._currentMarker), this._terminal.buffer.active.baseY);
            const viewportY = this._terminal.buffer.active.viewportY;
            if (typeof this._currentMarker === 'object' ? !this._isMarkerInViewport(this._terminal, this._currentMarker) : currentLineY !== viewportY) {
                // The user has scrolled, find the line based on the current scroll position. This only
                // works when not retaining selection
                const markersAboveViewport = this._getMarkers(skipEmptyCommands).filter(e => e.line <= viewportY).length;
                // markers.length will scroll to the bottom
                markerIndex = markersAboveViewport;
            }
            else if (this._currentMarker === Boundary.Bottom) {
                markerIndex = this._getMarkers(skipEmptyCommands).length;
            }
            else if (this._currentMarker === Boundary.Top) {
                markerIndex = 0;
            }
            else if (this._isDisposable) {
                markerIndex = this._findNextMarker(skipEmptyCommands);
                this._currentMarker.dispose();
                this._isDisposable = false;
            }
            else {
                if (skipEmptyCommands && this._isEmptyCommand(this._currentMarker)) {
                    markerIndex = this._findNextMarker(true);
                }
                else {
                    markerIndex = this._getMarkers(skipEmptyCommands).indexOf(this._currentMarker) + 1;
                }
            }
            if (markerIndex >= this._getMarkers(skipEmptyCommands).length) {
                this._currentMarker = Boundary.Bottom;
                this._terminal.scrollToBottom();
                this._resetNavigationDecorations();
                return;
            }
            this._currentMarker = this._getMarkers(skipEmptyCommands)[markerIndex];
            this._scrollToCommand(this._currentMarker, scrollPosition);
        }
        _scrollToCommand(marker, position) {
            const command = this._findCommand(marker);
            if (command) {
                this.revealCommand(command, position);
            }
            else {
                this._scrollToMarker(marker, position);
            }
        }
        _scrollToMarker(start, position, end, hideDecoration) {
            if (!this._terminal) {
                return;
            }
            if (!this._isMarkerInViewport(this._terminal, start)) {
                const line = this.getTargetScrollLine(toLineIndex(start), position);
                this._terminal.scrollToLine(line);
            }
            if (!hideDecoration) {
                this.registerTemporaryDecoration(start, end, true);
            }
        }
        _createMarkerForOffset(marker, offset) {
            if (offset === 0 && isMarker(marker)) {
                return marker;
            }
            else {
                const offsetMarker = this._terminal?.registerMarker(-this._terminal.buffer.active.cursorY + toLineIndex(marker) - this._terminal.buffer.active.baseY + offset);
                if (offsetMarker) {
                    return offsetMarker;
                }
                else {
                    throw new Error(`Could not register marker with offset ${toLineIndex(marker)}, ${offset}`);
                }
            }
        }
        revealCommand(command, position = 1 /* ScrollPosition.Middle */) {
            const marker = 'getOutput' in command ? command.marker : command.commandStartMarker;
            if (!this._terminal || !marker) {
                return;
            }
            const line = toLineIndex(marker);
            const promptRowCount = command.getPromptRowCount();
            const commandRowCount = command.getCommandRowCount();
            this._scrollToMarker(line - (promptRowCount - 1), position, line + (commandRowCount - 1));
        }
        showCommandGuide(command) {
            if (!this._terminal) {
                return;
            }
            if (!command) {
                this._commandGuideDecorations.clear();
                this._activeCommandGuide = undefined;
                return;
            }
            if (this._activeCommandGuide === command) {
                return;
            }
            if (command.marker) {
                this._activeCommandGuide = command;
                // Highlight output
                const store = this._commandGuideDecorations.value = new lifecycle_1.DisposableStore();
                if (!command.executedMarker || !command.endMarker) {
                    return;
                }
                const startLine = command.marker.line - (command.getPromptRowCount() - 1);
                const decorationCount = toLineIndex(command.endMarker) - startLine;
                // Abort if the command is too long, this limitation can be lifted when
                // xtermjs/xterm.js#4911 is handled.
                if (decorationCount > 200) {
                    return;
                }
                for (let i = 0; i < decorationCount; i++) {
                    const decoration = this._terminal.registerDecoration({
                        marker: this._createMarkerForOffset(startLine, i)
                    });
                    if (decoration) {
                        store.add(decoration);
                        let renderedElement;
                        store.add(decoration.onRender(element => {
                            if (!renderedElement) {
                                renderedElement = element;
                                element.classList.add('terminal-command-guide');
                                if (i === 0) {
                                    element.classList.add('top');
                                }
                                if (i === decorationCount - 1) {
                                    element.classList.add('bottom');
                                }
                            }
                            if (this._terminal?.element) {
                                element.style.marginLeft = `-${(0, dom_1.getWindow)(this._terminal.element).getComputedStyle(this._terminal.element).paddingLeft}`;
                            }
                        }));
                    }
                }
            }
        }
        registerTemporaryDecoration(marker, endMarker, showOutline) {
            if (!this._terminal) {
                return;
            }
            this._resetNavigationDecorations();
            const color = this._themeService.getColorTheme().getColor(terminalColorRegistry_1.TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR);
            const startLine = toLineIndex(marker);
            const decorationCount = endMarker ? toLineIndex(endMarker) - startLine + 1 : 1;
            for (let i = 0; i < decorationCount; i++) {
                const decoration = this._terminal.registerDecoration({
                    marker: this._createMarkerForOffset(marker, i),
                    width: this._terminal.cols,
                    overviewRulerOptions: i === 0 ? {
                        color: color?.toString() || '#a0a0a0cc'
                    } : undefined
                });
                if (decoration) {
                    this._navigationDecorations?.push(decoration);
                    let renderedElement;
                    decoration.onRender(element => {
                        if (!renderedElement) {
                            renderedElement = element;
                            element.classList.add('terminal-scroll-highlight');
                            if (showOutline) {
                                element.classList.add('terminal-scroll-highlight-outline');
                            }
                            if (i === 0) {
                                element.classList.add('top');
                            }
                            if (i === decorationCount - 1) {
                                element.classList.add('bottom');
                            }
                        }
                        else {
                            element.classList.add('terminal-scroll-highlight');
                        }
                        if (this._terminal?.element) {
                            element.style.marginLeft = `-${(0, dom_1.getWindow)(this._terminal.element).getComputedStyle(this._terminal.element).paddingLeft}`;
                        }
                    });
                    // TODO: This is not efficient for a large decorationCount
                    decoration.onDispose(() => { this._navigationDecorations = this._navigationDecorations?.filter(d => d !== decoration); });
                    // Number picked to align with symbol highlight in the editor
                    if (showOutline) {
                        (0, async_1.timeout)(350).then(() => {
                            if (renderedElement) {
                                renderedElement.classList.remove('terminal-scroll-highlight-outline');
                            }
                        });
                    }
                }
            }
        }
        scrollToLine(line, position) {
            this._terminal?.scrollToLine(this.getTargetScrollLine(line, position));
        }
        getTargetScrollLine(line, position) {
            // Middle is treated at 1/4 of the viewport's size because context below is almost always
            // more important than context above in the terminal.
            if (this._terminal && position === 1 /* ScrollPosition.Middle */) {
                return Math.max(line - Math.floor(this._terminal.rows / 4), 0);
            }
            return line;
        }
        _isMarkerInViewport(terminal, marker) {
            const viewportY = terminal.buffer.active.viewportY;
            const line = toLineIndex(marker);
            return line >= viewportY && line < viewportY + terminal.rows;
        }
        scrollToClosestMarker(startMarkerId, endMarkerId, highlight) {
            const detectionCapability = this._capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
            if (!detectionCapability) {
                return;
            }
            const startMarker = detectionCapability.getMark(startMarkerId);
            if (!startMarker) {
                return;
            }
            const endMarker = endMarkerId ? detectionCapability.getMark(endMarkerId) : startMarker;
            this._scrollToMarker(startMarker, 0 /* ScrollPosition.Top */, endMarker, !highlight);
        }
        selectToPreviousMark() {
            if (!this._terminal) {
                return;
            }
            if (this._selectionStart === null) {
                this._selectionStart = this._currentMarker;
            }
            if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                this.scrollToPreviousMark(1 /* ScrollPosition.Middle */, true, true);
            }
            else {
                this.scrollToPreviousMark(1 /* ScrollPosition.Middle */, true, false);
            }
            selectLines(this._terminal, this._currentMarker, this._selectionStart);
        }
        selectToNextMark() {
            if (!this._terminal) {
                return;
            }
            if (this._selectionStart === null) {
                this._selectionStart = this._currentMarker;
            }
            if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                this.scrollToNextMark(1 /* ScrollPosition.Middle */, true, true);
            }
            else {
                this.scrollToNextMark(1 /* ScrollPosition.Middle */, true, false);
            }
            selectLines(this._terminal, this._currentMarker, this._selectionStart);
        }
        selectToPreviousLine() {
            if (!this._terminal) {
                return;
            }
            if (this._selectionStart === null) {
                this._selectionStart = this._currentMarker;
            }
            this.scrollToPreviousLine(this._terminal, 1 /* ScrollPosition.Middle */, true);
            selectLines(this._terminal, this._currentMarker, this._selectionStart);
        }
        selectToNextLine() {
            if (!this._terminal) {
                return;
            }
            if (this._selectionStart === null) {
                this._selectionStart = this._currentMarker;
            }
            this.scrollToNextLine(this._terminal, 1 /* ScrollPosition.Middle */, true);
            selectLines(this._terminal, this._currentMarker, this._selectionStart);
        }
        scrollToPreviousLine(xterm, scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false) {
            if (!retainSelection) {
                this._selectionStart = null;
            }
            if (this._currentMarker === Boundary.Top) {
                xterm.scrollToTop();
                return;
            }
            if (this._currentMarker === Boundary.Bottom) {
                this._currentMarker = this._registerMarkerOrThrow(xterm, this._getOffset(xterm) - 1);
            }
            else {
                const offset = this._getOffset(xterm);
                if (this._isDisposable) {
                    this._currentMarker.dispose();
                }
                this._currentMarker = this._registerMarkerOrThrow(xterm, offset - 1);
            }
            this._isDisposable = true;
            this._scrollToMarker(this._currentMarker, scrollPosition);
        }
        scrollToNextLine(xterm, scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false) {
            if (!retainSelection) {
                this._selectionStart = null;
            }
            if (this._currentMarker === Boundary.Bottom) {
                xterm.scrollToBottom();
                return;
            }
            if (this._currentMarker === Boundary.Top) {
                this._currentMarker = this._registerMarkerOrThrow(xterm, this._getOffset(xterm) + 1);
            }
            else {
                const offset = this._getOffset(xterm);
                if (this._isDisposable) {
                    this._currentMarker.dispose();
                }
                this._currentMarker = this._registerMarkerOrThrow(xterm, offset + 1);
            }
            this._isDisposable = true;
            this._scrollToMarker(this._currentMarker, scrollPosition);
        }
        _registerMarkerOrThrow(xterm, cursorYOffset) {
            const marker = xterm.registerMarker(cursorYOffset);
            if (!marker) {
                throw new Error(`Could not create marker for ${cursorYOffset}`);
            }
            return marker;
        }
        _getOffset(xterm) {
            if (this._currentMarker === Boundary.Bottom) {
                return 0;
            }
            else if (this._currentMarker === Boundary.Top) {
                return 0 - (xterm.buffer.active.baseY + xterm.buffer.active.cursorY);
            }
            else {
                let offset = getLine(xterm, this._currentMarker);
                offset -= xterm.buffer.active.baseY + xterm.buffer.active.cursorY;
                return offset;
            }
        }
        _findPreviousMarker(skipEmptyCommands = false) {
            if (this._currentMarker === Boundary.Top) {
                return 0;
            }
            else if (this._currentMarker === Boundary.Bottom) {
                return this._getMarkers(skipEmptyCommands).length - 1;
            }
            let i;
            for (i = this._getMarkers(skipEmptyCommands).length - 1; i >= 0; i--) {
                if (this._getMarkers(skipEmptyCommands)[i].line < this._currentMarker.line) {
                    return i;
                }
            }
            return -1;
        }
        _findNextMarker(skipEmptyCommands = false) {
            if (this._currentMarker === Boundary.Top) {
                return 0;
            }
            else if (this._currentMarker === Boundary.Bottom) {
                return this._getMarkers(skipEmptyCommands).length - 1;
            }
            let i;
            for (i = 0; i < this._getMarkers(skipEmptyCommands).length; i++) {
                if (this._getMarkers(skipEmptyCommands)[i].line > this._currentMarker.line) {
                    return i;
                }
            }
            return this._getMarkers(skipEmptyCommands).length;
        }
    };
    exports.MarkNavigationAddon = MarkNavigationAddon;
    exports.MarkNavigationAddon = MarkNavigationAddon = __decorate([
        __param(1, themeService_1.IThemeService)
    ], MarkNavigationAddon);
    function getLine(xterm, marker) {
        // Use the _second last_ row as the last row is likely the prompt
        if (marker === Boundary.Bottom) {
            return xterm.buffer.active.baseY + xterm.rows - 1;
        }
        if (marker === Boundary.Top) {
            return 0;
        }
        return marker.line;
    }
    exports.getLine = getLine;
    function selectLines(xterm, start, end) {
        if (end === null) {
            end = Boundary.Bottom;
        }
        let startLine = getLine(xterm, start);
        let endLine = getLine(xterm, end);
        if (startLine > endLine) {
            const temp = startLine;
            startLine = endLine;
            endLine = temp;
        }
        // Subtract a line as the marker is on the line the command run, we do not want the next
        // command in the selection for the current command
        endLine -= 1;
        xterm.selectLines(startLine, endLine);
    }
    exports.selectLines = selectLines;
    function isMarker(value) {
        return typeof value !== 'number';
    }
    function toLineIndex(line) {
        return isMarker(line) ? line.line : line;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya05hdmlnYXRpb25BZGRvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci94dGVybS9tYXJrTmF2aWdhdGlvbkFkZG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWFoRyxJQUFLLFFBR0o7SUFIRCxXQUFLLFFBQVE7UUFDWixxQ0FBRyxDQUFBO1FBQ0gsMkNBQU0sQ0FBQTtJQUNQLENBQUMsRUFISSxRQUFRLEtBQVIsUUFBUSxRQUdaO0lBRUQsSUFBa0IsY0FHakI7SUFIRCxXQUFrQixjQUFjO1FBQy9CLGlEQUFHLENBQUE7UUFDSCx1REFBTSxDQUFBO0lBQ1AsQ0FBQyxFQUhpQixjQUFjLDhCQUFkLGNBQWMsUUFHL0I7SUFFTSxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBVWxELFFBQVEsQ0FBQyxRQUFrQjtZQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtnQkFDekMsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsWUFDa0IsYUFBdUMsRUFDekMsYUFBNkM7WUFFNUQsS0FBSyxFQUFFLENBQUM7WUFIUyxrQkFBYSxHQUFiLGFBQWEsQ0FBMEI7WUFDeEIsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFsQnJELG1CQUFjLEdBQXVCLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDckQsb0JBQWUsR0FBOEIsSUFBSSxDQUFDO1lBQ2xELGtCQUFhLEdBQVksS0FBSyxDQUFDO1lBSy9CLDZCQUF3QixH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