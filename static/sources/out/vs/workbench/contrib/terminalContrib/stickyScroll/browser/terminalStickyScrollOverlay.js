var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/amdX", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/browser/terminalContextMenu", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminalStickyScrollColorRegistry", "vs/css!./media/stickyScroll"], function (require, exports, amdX_1, dom_1, async_1, decorators_1, event_1, lifecycle_1, strings_1, nls_1, actions_1, configuration_1, contextkey_1, contextView_1, keybinding_1, themeService_1, terminalContextMenu_1, terminal_1, terminalStrings_1, terminalStickyScrollColorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalStickyScrollOverlay = void 0;
    var OverlayState;
    (function (OverlayState) {
        /** Initial state/disabled by the alt buffer. */
        OverlayState[OverlayState["Off"] = 0] = "Off";
        OverlayState[OverlayState["On"] = 1] = "On";
    })(OverlayState || (OverlayState = {}));
    var CssClasses;
    (function (CssClasses) {
        CssClasses["Visible"] = "visible";
    })(CssClasses || (CssClasses = {}));
    var Constants;
    (function (Constants) {
        Constants[Constants["StickyScrollPercentageCap"] = 0.4] = "StickyScrollPercentageCap";
    })(Constants || (Constants = {}));
    let TerminalStickyScrollOverlay = class TerminalStickyScrollOverlay extends lifecycle_1.Disposable {
        constructor(_instance, _xterm, _xtermColorProvider, _commandDetection, xtermCtor, configurationService, contextKeyService, _contextMenuService, _keybindingService, menuService, _themeService) {
            super();
            this._instance = _instance;
            this._xterm = _xterm;
            this._xtermColorProvider = _xtermColorProvider;
            this._commandDetection = _commandDetection;
            this._contextMenuService = _contextMenuService;
            this._keybindingService = _keybindingService;
            this._themeService = _themeService;
            this._canvasAddon = this._register(new lifecycle_1.MutableDisposable());
            this._refreshListeners = this._register(new lifecycle_1.MutableDisposable());
            this._state = 0 /* OverlayState.Off */;
            this._rawMaxLineCount = 5;
            this._contextMenu = this._register(menuService.createMenu(actions_1.MenuId.TerminalStickyScrollContext, contextKeyService));
            // Only show sticky scroll in the normal buffer
            this._register(event_1.Event.runAndSubscribe(this._xterm.raw.buffer.onBufferChange, buffer => {
                this._setState((buffer ?? this._xterm.raw.buffer.active).type === 'normal' ? 1 /* OverlayState.On */ : 0 /* OverlayState.Off */);
            }));
            // React to configuration changes
            this._register(event_1.Event.runAndSubscribe(configurationService.onDidChangeConfiguration, e => {
                if (!e || e.affectsConfiguration("terminal.integrated.stickyScroll.maxLineCount" /* TerminalSettingId.StickyScrollMaxLineCount */)) {
                    this._rawMaxLineCount = configurationService.getValue("terminal.integrated.stickyScroll.maxLineCount" /* TerminalSettingId.StickyScrollMaxLineCount */);
                }
            }));
            // React to terminal location changes
            this._register(this._instance.onDidChangeTarget(() => this._syncOptions()));
            // Eagerly create the overlay
            xtermCtor.then(ctor => {
                this._stickyScrollOverlay = this._register(new ctor({
                    rows: 1,
                    cols: this._xterm.raw.cols,
                    allowProposedApi: true,
                    ...this._getOptions()
                }));
                this._register(configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(terminal_1.TERMINAL_CONFIG_SECTION)) {
                        this._syncOptions();
                    }
                }));
                this._register(this._themeService.onDidColorThemeChange(() => {
                    this._syncOptions();
                }));
                this._getSerializeAddonConstructor().then(SerializeAddon => {
                    this._serializeAddon = this._register(new SerializeAddon());
                    this._xterm.raw.loadAddon(this._serializeAddon);
                    // Trigger a render as the serialize addon is required to render
                    this._refresh();
                });
                this._syncGpuAccelerationState();
            });
        }
        _setState(state) {
            if (this._state === state) {
                return;
            }
            switch (state) {
                case 0 /* OverlayState.Off */: {
                    this._setVisible(false);
                    this._uninstallRefreshListeners();
                    break;
                }
                case 1 /* OverlayState.On */: {
                    this._refresh();
                    this._installRefreshListeners();
                    break;
                }
            }
        }
        _installRefreshListeners() {
            if (!this._refreshListeners.value) {
                this._refreshListeners.value = (0, lifecycle_1.combinedDisposable)(event_1.Event.any(this._xterm.raw.onScroll, this._xterm.raw.onLineFeed, 
                // Rarely an update may be required after just a cursor move, like when
                // scrolling horizontally in a pager
                this._xterm.raw.onCursorMove)(() => this._refresh()), (0, dom_1.addStandardDisposableListener)(this._xterm.raw.element.querySelector('.xterm-viewport'), 'scroll', () => this._refresh()));
            }
        }
        _uninstallRefreshListeners() {
            this._refreshListeners.clear();
        }
        _setVisible(isVisible) {
            if (isVisible) {
                this._ensureElement();
                // The GPU acceleration state may be changes at any time and there is no event to listen
                // to currently.
                this._syncGpuAccelerationState();
            }
            this._element?.classList.toggle("visible" /* CssClasses.Visible */, isVisible);
        }
        /**
         * The entry point to refresh sticky scroll. This is synchronous and will call into the method
         * that actually refreshes using either debouncing or throttling depending on the situation.
         *
         * The goal is that if the command has changed to update immediately (with throttling) and if
         * the command is the same then update with debouncing as it's less likely updates will show up.
         * This approach also helps with:
         *
         * - Cursor move only updates such as moving horizontally in pagers which without this may show
         *   the sticky scroll before hiding it again almost immediately due to everything not being
         *   parsed yet.
         * - Improving performance due to deferring less important updates via debouncing.
         * - Less flickering when scrolling, while still updating immediately when the command changes.
         */
        _refresh() {
            if (!this._xterm.raw.element?.parentElement || !this._stickyScrollOverlay || !this._serializeAddon) {
                return;
            }
            const command = this._commandDetection.getCommandForLine(this._xterm.raw.buffer.active.viewportY);
            if (command && this._currentStickyCommand !== command) {
                this._throttledRefresh();
            }
            else {
                this._debouncedRefresh();
            }
        }
        _debouncedRefresh() {
            this._throttledRefresh();
        }
        _throttledRefresh() {
            const command = this._commandDetection.getCommandForLine(this._xterm.raw.buffer.active.viewportY);
            // The command from viewportY + 1 is used because this one will not be obscured by sticky
            // scroll.
            this._currentStickyCommand = undefined;
            // No command
            if (!command) {
                this._setVisible(false);
                return;
            }
            // Partial command
            if (!('marker' in command)) {
                const partialCommand = this._commandDetection.currentCommand;
                if (partialCommand?.commandStartMarker && partialCommand.commandExecutedMarker) {
                    this._updateContent(partialCommand, partialCommand.commandStartMarker);
                    return;
                }
                this._setVisible(false);
                return;
            }
            // If the marker doesn't exist or it was trimmed from scrollback
            const marker = command.marker;
            if (!marker || marker.line === -1) {
                // TODO: It would be nice if we kept the cached command around even if it was trimmed
                // from scrollback
                this._setVisible(false);
                return;
            }
            this._updateContent(command, marker);
        }
        _updateContent(command, startMarker) {
            const xterm = this._xterm.raw;
            if (!xterm.element?.parentElement || !this._stickyScrollOverlay || !this._serializeAddon) {
                return;
            }
            // Determine sticky scroll line count
            const buffer = xterm.buffer.active;
            const promptRowCount = command.getPromptRowCount();
            const commandRowCount = command.getCommandRowCount();
            const stickyScrollLineStart = startMarker.line - (promptRowCount - 1);
            // Calculate the row offset, this is the number of rows that will be clipped from the top
            // of the sticky overlay because we do not want to show any content above the bounds of the
            // original terminal. This is done because it seems like scrolling flickers more when a
            // partial line can be drawn on the top.
            const isPartialCommand = !('getOutput' in command);
            const rowOffset = !isPartialCommand && command.endMarker ? Math.max(buffer.viewportY - command.endMarker.line + 1, 0) : 0;
            const maxLineCount = Math.min(this._rawMaxLineCount, Math.floor(xterm.rows * 0.4 /* Constants.StickyScrollPercentageCap */));
            const stickyScrollLineCount = Math.min(promptRowCount + commandRowCount - 1, maxLineCount) - rowOffset;
            // Hide sticky scroll if it's currently on a line that contains it
            if (buffer.viewportY <= stickyScrollLineStart) {
                this._setVisible(false);
                return;
            }
            // Hide sticky scroll for the partial command if it looks like there is a pager like `less`
            // or `git log` active. This is done by checking if the bottom left cell contains the :
            // character and the cursor is immediately to its right. This improves the behavior of a
            // common case where the top of the text being viewport would otherwise be obscured.
            if (isPartialCommand && buffer.viewportY === buffer.baseY && buffer.cursorY === xterm.rows - 1) {
                const line = buffer.getLine(buffer.baseY + xterm.rows - 1);
                if ((buffer.cursorX === 1 && lineStartsWith(line, ':')) ||
                    (buffer.cursorX === 5 && lineStartsWith(line, '(END)'))) {
                    this._setVisible(false);
                    return;
                }
            }
            // Clear attrs, reset cursor position, clear right
            const content = this._serializeAddon.serialize({
                range: {
                    start: stickyScrollLineStart + rowOffset,
                    end: stickyScrollLineStart + rowOffset + Math.max(stickyScrollLineCount - 1, 0)
                }
            });
            // If a partial command's sticky scroll would show nothing, just hide it. This is another
            // edge case when using a pager or interactive editor.
            if (isPartialCommand && (0, strings_1.removeAnsiEscapeCodes)(content).length === 0) {
                this._setVisible(false);
                return;
            }
            // Write content if it differs
            if (content && this._currentContent !== content) {
                this._stickyScrollOverlay.resize(this._stickyScrollOverlay.cols, stickyScrollLineCount);
                this._stickyScrollOverlay.write('\x1b[0m\x1b[H\x1b[2J');
                this._stickyScrollOverlay.write(content);
                this._currentContent = content;
                // DEBUG: Log to show the command line we know
                // this._stickyScrollOverlay.write(` [${command?.command}]`);
            }
            if (content) {
                this._currentStickyCommand = command;
                this._setVisible(true);
                // Position the sticky scroll such that it never overlaps the prompt/output of the
                // following command. This must happen after setVisible to ensure the element is
                // initialized.
                if (this._element) {
                    const termBox = xterm.element.getBoundingClientRect();
                    const rowHeight = termBox.height / xterm.rows;
                    const overlayHeight = stickyScrollLineCount * rowHeight;
                    this._element.style.bottom = `${termBox.height - overlayHeight + 1}px`;
                }
            }
            else {
                this._setVisible(false);
            }
        }
        _ensureElement() {
            if (
            // The element is already created
            this._element ||
                // If the overlay is yet to be created, the terminal cannot be opened so defer to next call
                !this._stickyScrollOverlay ||
                // The xterm.js instance isn't opened yet
                !this._xterm?.raw.element?.parentElement) {
                return;
            }
            const overlay = this._stickyScrollOverlay;
            const hoverOverlay = (0, dom_1.$)('.hover-overlay');
            this._element = (0, dom_1.$)('.terminal-sticky-scroll', undefined, hoverOverlay);
            this._xterm.raw.element.parentElement.append(this._element);
            this._register((0, lifecycle_1.toDisposable)(() => this._element?.remove()));
            // Fill tooltip
            let hoverTitle = (0, nls_1.localize)('stickyScrollHoverTitle', 'Navigate to Command');
            const scrollToPreviousCommandKeybinding = this._keybindingService.lookupKeybinding("workbench.action.terminal.scrollToPreviousCommand" /* TerminalCommandId.ScrollToPreviousCommand */);
            if (scrollToPreviousCommandKeybinding) {
                const label = scrollToPreviousCommandKeybinding.getLabel();
                if (label) {
                    hoverTitle += '\n' + (0, nls_1.localize)('labelWithKeybinding', "{0} ({1})", terminalStrings_1.terminalStrings.scrollToPreviousCommand.value, label);
                }
            }
            const scrollToNextCommandKeybinding = this._keybindingService.lookupKeybinding("workbench.action.terminal.scrollToNextCommand" /* TerminalCommandId.ScrollToNextCommand */);
            if (scrollToNextCommandKeybinding) {
                const label = scrollToNextCommandKeybinding.getLabel();
                if (label) {
                    hoverTitle += '\n' + (0, nls_1.localize)('labelWithKeybinding', "{0} ({1})", terminalStrings_1.terminalStrings.scrollToNextCommand.value, label);
                }
            }
            hoverOverlay.title = hoverTitle;
            const scrollBarWidth = this._xterm.raw._core.viewport?.scrollBarWidth;
            if (scrollBarWidth !== undefined) {
                this._element.style.right = `${scrollBarWidth}px`;
            }
            this._stickyScrollOverlay.open(this._element);
            // Scroll to the command on click
            this._register((0, dom_1.addStandardDisposableListener)(hoverOverlay, 'click', () => {
                if (this._xterm && this._currentStickyCommand && 'getOutput' in this._currentStickyCommand) {
                    this._xterm.markTracker.revealCommand(this._currentStickyCommand);
                    this._instance.focus();
                }
            }));
            // Context menu - stop propagation on mousedown because rightClickBehavior listens on
            // mousedown, not contextmenu
            this._register((0, dom_1.addDisposableListener)(hoverOverlay, 'mousedown', e => {
                e.stopImmediatePropagation();
                e.preventDefault();
            }));
            this._register((0, dom_1.addDisposableListener)(hoverOverlay, 'contextmenu', e => {
                e.stopImmediatePropagation();
                e.preventDefault();
                (0, terminalContextMenu_1.openContextMenu)((0, dom_1.getWindow)(hoverOverlay), e, this._instance, this._contextMenu, this._contextMenuService);
            }));
            // Instead of juggling decorations for hover styles, swap out the theme to indicate the
            // hover state. This comes with the benefit over other methods of working well with special
            // decorative characters like powerline symbols.
            this._register((0, dom_1.addStandardDisposableListener)(hoverOverlay, 'mouseover', () => overlay.options.theme = this._getTheme(true)));
            this._register((0, dom_1.addStandardDisposableListener)(hoverOverlay, 'mouseleave', () => overlay.options.theme = this._getTheme(false)));
        }
        _syncOptions() {
            if (!this._stickyScrollOverlay) {
                return;
            }
            this._stickyScrollOverlay.resize(this._xterm.raw.cols, this._stickyScrollOverlay.rows);
            this._stickyScrollOverlay.options = this._getOptions();
            this._syncGpuAccelerationState();
        }
        _syncGpuAccelerationState() {
            if (!this._stickyScrollOverlay) {
                return;
            }
            const overlay = this._stickyScrollOverlay;
            // The Webgl renderer isn't used here as there are a limited number of webgl contexts
            // available within a given page. This is a single row that isn't rendered to often so the
            // performance isn't as important
            if (this._xterm.isGpuAccelerated) {
                if (!this._canvasAddon.value && !this._pendingCanvasAddon) {
                    this._pendingCanvasAddon = (0, async_1.createCancelablePromise)(async (token) => {
                        const CanvasAddon = await this._getCanvasAddonConstructor();
                        if (!token.isCancellationRequested) {
                            this._canvasAddon.value = new CanvasAddon();
                            overlay.loadAddon(this._canvasAddon.value);
                        }
                        this._pendingCanvasAddon = undefined;
                    });
                }
            }
            else {
                this._canvasAddon.clear();
                this._pendingCanvasAddon?.cancel();
                this._pendingCanvasAddon = undefined;
            }
        }
        _getOptions() {
            const o = this._xterm.raw.options;
            return {
                cursorInactiveStyle: 'none',
                scrollback: 0,
                logLevel: 'off',
                theme: this._getTheme(false),
                documentOverride: o.documentOverride,
                fontFamily: o.fontFamily,
                fontWeight: o.fontWeight,
                fontWeightBold: o.fontWeightBold,
                fontSize: o.fontSize,
                letterSpacing: o.letterSpacing,
                lineHeight: o.lineHeight,
                drawBoldTextInBrightColors: o.drawBoldTextInBrightColors,
                minimumContrastRatio: o.minimumContrastRatio,
                tabStopWidth: o.tabStopWidth,
                overviewRulerWidth: o.overviewRulerWidth,
            };
        }
        _getTheme(isHovering) {
            const theme = this._themeService.getColorTheme();
            return {
                ...this._xterm.getXtermTheme(),
                background: isHovering
                    ? theme.getColor(terminalStickyScrollColorRegistry_1.terminalStickyScrollHoverBackground)?.toString() ?? this._xtermColorProvider.getBackgroundColor(theme)?.toString()
                    : theme.getColor(terminalStickyScrollColorRegistry_1.terminalStickyScrollBackground)?.toString() ?? this._xtermColorProvider.getBackgroundColor(theme)?.toString(),
                selectionBackground: undefined,
                selectionInactiveBackground: undefined
            };
        }
        async _getCanvasAddonConstructor() {
            const m = await (0, amdX_1.importAMDNodeModule)('@xterm/addon-canvas', 'lib/xterm-addon-canvas.js');
            return m.CanvasAddon;
        }
        async _getSerializeAddonConstructor() {
            const m = await (0, amdX_1.importAMDNodeModule)('@xterm/addon-serialize', 'lib/addon-serialize.js');
            return m.SerializeAddon;
        }
    };
    exports.TerminalStickyScrollOverlay = TerminalStickyScrollOverlay;
    __decorate([
        (0, decorators_1.debounce)(20)
    ], TerminalStickyScrollOverlay.prototype, "_debouncedRefresh", null);
    __decorate([
        (0, decorators_1.throttle)(0)
    ], TerminalStickyScrollOverlay.prototype, "_throttledRefresh", null);
    __decorate([
        (0, decorators_1.throttle)(0)
    ], TerminalStickyScrollOverlay.prototype, "_syncOptions", null);
    __decorate([
        decorators_1.memoize
    ], TerminalStickyScrollOverlay.prototype, "_getCanvasAddonConstructor", null);
    __decorate([
        decorators_1.memoize
    ], TerminalStickyScrollOverlay.prototype, "_getSerializeAddonConstructor", null);
    exports.TerminalStickyScrollOverlay = TerminalStickyScrollOverlay = __decorate([
        __param(5, configuration_1.IConfigurationService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, actions_1.IMenuService),
        __param(10, themeService_1.IThemeService)
    ], TerminalStickyScrollOverlay);
    function lineStartsWith(line, text) {
        if (!line) {
            return false;
        }
        for (let i = 0; i < text.length; i++) {
            if (line.getCell(i)?.getChars() !== text[i]) {
                return false;
            }
        }
        return true;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxTdGlja3lTY3JvbGxPdmVybGF5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvc3RpY2t5U2Nyb2xsL2Jyb3dzZXIvdGVybWluYWxTdGlja3lTY3JvbGxPdmVybGF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFnQ0EsSUFBVyxZQUlWO0lBSkQsV0FBVyxZQUFZO1FBQ3RCLGdEQUFnRDtRQUNoRCw2Q0FBTyxDQUFBO1FBQ1AsMkNBQU0sQ0FBQTtJQUNQLENBQUMsRUFKVSxZQUFZLEtBQVosWUFBWSxRQUl0QjtJQUVELElBQVcsVUFFVjtJQUZELFdBQVcsVUFBVTtRQUNwQixpQ0FBbUIsQ0FBQTtJQUNwQixDQUFDLEVBRlUsVUFBVSxLQUFWLFVBQVUsUUFFcEI7SUFFRCxJQUFXLFNBRVY7SUFGRCxXQUFXLFNBQVM7UUFDbkIscUZBQStCLENBQUE7SUFDaEMsQ0FBQyxFQUZVLFNBQVMsS0FBVCxTQUFTLFFBRW5CO0lBRU0sSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTtRQWlCMUQsWUFDa0IsU0FBNEIsRUFDNUIsTUFBa0QsRUFDbEQsbUJBQXdDLEVBQ3hDLGlCQUE4QyxFQUMvRCxTQUF3QyxFQUNqQixvQkFBMkMsRUFDOUMsaUJBQXFDLEVBQ3BDLG1CQUF5RCxFQUMxRCxrQkFBdUQsRUFDN0QsV0FBeUIsRUFDeEIsYUFBNkM7WUFFNUQsS0FBSyxFQUFFLENBQUM7WUFaUyxjQUFTLEdBQVQsU0FBUyxDQUFtQjtZQUM1QixXQUFNLEdBQU4sTUFBTSxDQUE0QztZQUNsRCx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQ3hDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBNkI7WUFJekIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUN6Qyx1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