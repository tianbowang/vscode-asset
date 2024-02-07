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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/platform/terminal/common/terminal", "vs/base/browser/browser", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/notification/common/notification", "vs/workbench/contrib/terminal/browser/xterm/markNavigationAddon", "vs/nls", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/platform/terminal/common/xterm/shellIntegrationAddon", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/xterm/decorationAddon", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/amdX", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/clipboard/common/clipboardService", "vs/base/common/decorators", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/mouseEvent", "vs/platform/layout/browser/layoutService", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, dom, configuration_1, lifecycle_1, terminal_1, browser_1, log_1, storage_1, notification_1, markNavigationAddon_1, nls_1, themeService_1, theme_1, terminalColorRegistry_1, shellIntegrationAddon_1, instantiation_1, decorationAddon_1, event_1, telemetry_1, amdX_1, contextkey_1, terminalContextKey_1, clipboardService_1, decorators_1, scrollableElement_1, mouseEvent_1, layoutService_1, audioCueService_1) {
    "use strict";
    var XtermTerminal_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getXtermScaledDimensions = exports.XtermTerminal = void 0;
    var RenderConstants;
    (function (RenderConstants) {
        /**
         * How long in milliseconds should an average frame take to render for a notification to appear
         * which suggests the fallback DOM-based renderer.
         */
        RenderConstants[RenderConstants["SlowCanvasRenderThreshold"] = 50] = "SlowCanvasRenderThreshold";
        RenderConstants[RenderConstants["NumberOfFramestoMeasure"] = 20] = "NumberOfFramestoMeasure";
        RenderConstants[RenderConstants["SmoothScrollDuration"] = 125] = "SmoothScrollDuration";
    })(RenderConstants || (RenderConstants = {}));
    let CanvasAddon;
    let ImageAddon;
    let SearchAddon;
    let SerializeAddon;
    let Unicode11Addon;
    let WebglAddon;
    function getFullBufferLineAsString(lineIndex, buffer) {
        let line = buffer.getLine(lineIndex);
        if (!line) {
            return { lineData: undefined, lineIndex };
        }
        let lineData = line.translateToString(true);
        while (lineIndex > 0 && line.isWrapped) {
            line = buffer.getLine(--lineIndex);
            if (!line) {
                break;
            }
            lineData = line.translateToString(false) + lineData;
        }
        return { lineData, lineIndex };
    }
    // DEBUG: This helper can be used to draw image data to the console, it's commented out as we don't
    //        want to ship it, but this is very useful for investigating texture atlas issues.
    // (console as any).image = (source: ImageData | HTMLCanvasElement, scale: number = 1) => {
    // 	function getBox(width: number, height: number) {
    // 		return {
    // 			string: '+',
    // 			style: 'font-size: 1px; padding: ' + Math.floor(height/2) + 'px ' + Math.floor(width/2) + 'px; line-height: ' + height + 'px;'
    // 		};
    // 	}
    // 	if (source instanceof HTMLCanvasElement) {
    // 		source = source.getContext('2d')?.getImageData(0, 0, source.width, source.height)!;
    // 	}
    // 	const canvas = document.createElement('canvas');
    // 	canvas.width = source.width;
    // 	canvas.height = source.height;
    // 	const ctx = canvas.getContext('2d')!;
    // 	ctx.putImageData(source, 0, 0);
    // 	const sw = source.width * scale;
    // 	const sh = source.height * scale;
    // 	const dim = getBox(sw, sh);
    // 	console.log(
    // 		`Image: ${source.width} x ${source.height}\n%c${dim.string}`,
    // 		`${dim.style}background: url(${canvas.toDataURL()}); background-size: ${sw}px ${sh}px; background-repeat: no-repeat; color: transparent;`
    // 	);
    // 	console.groupCollapsed('Zoomed');
    // 	console.log(
    // 		`%c${dim.string}`,
    // 		`${getBox(sw * 10, sh * 10).style}background: url(${canvas.toDataURL()}); background-size: ${sw * 10}px ${sh * 10}px; background-repeat: no-repeat; color: transparent; image-rendering: pixelated;-ms-interpolation-mode: nearest-neighbor;`
    // 	);
    // 	console.groupEnd();
    // };
    /**
     * Wraps the xterm object with additional functionality. Interaction with the backing process is out
     * of the scope of this class.
     */
    let XtermTerminal = class XtermTerminal extends lifecycle_1.Disposable {
        static { XtermTerminal_1 = this; }
        static { this._suggestedRendererType = undefined; }
        static { this._checkedWebglCompatible = false; }
        get findResult() { return this._lastFindResult; }
        get isStdinDisabled() { return !!this.raw.options.disableStdin; }
        get isGpuAccelerated() { return !!(this._canvasAddon || this._webglAddon); }
        get markTracker() { return this._markNavigationAddon; }
        get shellIntegration() { return this._shellIntegrationAddon; }
        get textureAtlas() {
            const canvas = this._webglAddon?.textureAtlas || this._canvasAddon?.textureAtlas;
            if (!canvas) {
                return undefined;
            }
            return createImageBitmap(canvas);
        }
        get isFocused() {
            if (!this.raw.element) {
                return false;
            }
            return dom.isAncestorOfActiveElement(this.raw.element);
        }
        /**
         * @param xtermCtor The xterm.js constructor, this is passed in so it can be fetched lazily
         * outside of this class such that {@link raw} is not nullable.
         */
        constructor(xtermCtor, _configHelper, cols, rows, _xtermColorProvider, _capabilities, shellIntegrationNonce, disableShellIntegrationReporting, _configurationService, _instantiationService, _logService, _notificationService, _storageService, _themeService, _telemetryService, _clipboardService, contextKeyService, _audioCueService, layoutService) {
            super();
            this._configHelper = _configHelper;
            this._xtermColorProvider = _xtermColorProvider;
            this._capabilities = _capabilities;
            this._configurationService = _configurationService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._notificationService = _notificationService;
            this._storageService = _storageService;
            this._themeService = _themeService;
            this._telemetryService = _telemetryService;
            this._clipboardService = _clipboardService;
            this._audioCueService = _audioCueService;
            this._isPhysicalMouseWheel = scrollableElement_1.MouseWheelClassifier.INSTANCE.isPhysicalMouseWheel();
            this._attachedDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onDidRequestRunCommand = this._register(new event_1.Emitter());
            this.onDidRequestRunCommand = this._onDidRequestRunCommand.event;
            this._onDidRequestFocus = this._register(new event_1.Emitter());
            this.onDidRequestFocus = this._onDidRequestFocus.event;
            this._onDidRequestSendText = this._register(new event_1.Emitter());
            this.onDidRequestSendText = this._onDidRequestSendText.event;
            this._onDidRequestFreePort = this._register(new event_1.Emitter());
            this.onDidRequestFreePort = this._onDidRequestFreePort.event;
            this._onDidChangeFindResults = this._register(new event_1.Emitter());
            this.onDidChangeFindResults = this._onDidChangeFindResults.event;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._onDidChangeFocus = this._register(new event_1.Emitter());
            this.onDidChangeFocus = this._onDidChangeFocus.event;
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            const font = this._configHelper.getFont(dom.getActiveWindow(), undefined, true);
            const config = this._configHelper.config;
            const editorOptions = this._configurationService.getValue('editor');
            this.raw = this._register(new xtermCtor({
                allowProposedApi: true,
                cols,
                rows,
                documentOverride: layoutService.mainContainer.ownerDocument,
                altClickMovesCursor: config.altClickMovesCursor && editorOptions.multiCursorModifier === 'alt',
                scrollback: config.scrollback,
                theme: this.getXtermTheme(),
                drawBoldTextInBrightColors: config.drawBoldTextInBrightColors,
                fontFamily: font.fontFamily,
                fontWeight: config.fontWeight,
                fontWeightBold: config.fontWeightBold,
                fontSize: font.fontSize,
                letterSpacing: font.letterSpacing,
                lineHeight: font.lineHeight,
                logLevel: vscodeToXtermLogLevel(this._logService.getLevel()),
                logger: this._logService,
                minimumContrastRatio: config.minimumContrastRatio,
                tabStopWidth: config.tabStopWidth,
                cursorBlink: config.cursorBlinking,
                cursorStyle: vscodeToXtermCursorStyle(config.cursorStyle),
                cursorInactiveStyle: vscodeToXtermCursorStyle(config.cursorStyleInactive),
                cursorWidth: config.cursorWidth,
                macOptionIsMeta: config.macOptionIsMeta,
                macOptionClickForcesSelection: config.macOptionClickForcesSelection,
                rightClickSelectsWord: config.rightClickBehavior === 'selectWord',
                fastScrollModifier: 'alt',
                fastScrollSensitivity: config.fastScrollSensitivity,
                scrollSensitivity: config.mouseWheelScrollSensitivity,
                wordSeparator: config.wordSeparators,
                overviewRulerWidth: 10,
                ignoreBracketedPasteMode: config.ignoreBracketedPasteMode
            }));
            this._updateSmoothScrolling();
            this._core = this.raw._core;
            this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */)) {
                    XtermTerminal_1._suggestedRendererType = undefined;
                }
                if (e.affectsConfiguration('terminal.integrated') || e.affectsConfiguration('editor.fastScrollSensitivity') || e.affectsConfiguration('editor.mouseWheelScrollSensitivity') || e.affectsConfiguration('editor.multiCursorModifier')) {
                    this.updateConfig();
                }
                if (e.affectsConfiguration("terminal.integrated.unicodeVersion" /* TerminalSettingId.UnicodeVersion */)) {
                    this._updateUnicodeVersion();
                }
            }));
            this._register(this._themeService.onDidColorThemeChange(theme => this._updateTheme(theme)));
            this._register(this._logService.onDidChangeLogLevel(e => this.raw.options.logLevel = vscodeToXtermLogLevel(e)));
            // Refire events
            this._register(this.raw.onSelectionChange(() => {
                this._onDidChangeSelection.fire();
                if (this.isFocused) {
                    this._anyFocusedTerminalHasSelection.set(this.raw.hasSelection());
                }
            }));
            // Load addons
            this._updateUnicodeVersion();
            this._markNavigationAddon = this._instantiationService.createInstance(markNavigationAddon_1.MarkNavigationAddon, _capabilities);
            this.raw.loadAddon(this._markNavigationAddon);
            this._decorationAddon = this._instantiationService.createInstance(decorationAddon_1.DecorationAddon, this._capabilities);
            this._register(this._decorationAddon.onDidRequestRunCommand(e => this._onDidRequestRunCommand.fire(e)));
            this.raw.loadAddon(this._decorationAddon);
            this._shellIntegrationAddon = new shellIntegrationAddon_1.ShellIntegrationAddon(shellIntegrationNonce, disableShellIntegrationReporting, this._telemetryService, this._logService);
            this.raw.loadAddon(this._shellIntegrationAddon);
            this._anyTerminalFocusContextKey = terminalContextKey_1.TerminalContextKeys.focusInAny.bindTo(contextKeyService);
            this._anyFocusedTerminalHasSelection = terminalContextKey_1.TerminalContextKeys.textSelectedInFocused.bindTo(contextKeyService);
        }
        *getBufferReverseIterator() {
            for (let i = this.raw.buffer.active.length; i >= 0; i--) {
                const { lineData, lineIndex } = getFullBufferLineAsString(i, this.raw.buffer.active);
                if (lineData) {
                    i = lineIndex;
                    yield lineData;
                }
            }
        }
        async getContentsAsHtml() {
            if (!this._serializeAddon) {
                const Addon = await this._getSerializeAddonConstructor();
                this._serializeAddon = new Addon();
                this.raw.loadAddon(this._serializeAddon);
            }
            return this._serializeAddon.serializeAsHTML();
        }
        async getSelectionAsHtml(command) {
            if (!this._serializeAddon) {
                const Addon = await this._getSerializeAddonConstructor();
                this._serializeAddon = new Addon();
                this.raw.loadAddon(this._serializeAddon);
            }
            if (command) {
                const length = command.getOutput()?.length;
                const row = command.marker?.line;
                if (!length || !row) {
                    throw new Error(`No row ${row} or output length ${length} for command ${command}`);
                }
                this.raw.select(0, row + 1, length - Math.floor(length / this.raw.cols));
            }
            const result = this._serializeAddon.serializeAsHTML({ onlySelection: true });
            if (command) {
                this.raw.clearSelection();
            }
            return result;
        }
        attachToElement(container, partialOptions) {
            const options = { enableGpu: true, ...partialOptions };
            if (!this._attached) {
                this.raw.open(container);
            }
            // TODO: Move before open to the DOM renderer doesn't initialize
            if (options.enableGpu) {
                if (this._shouldLoadWebgl()) {
                    this._enableWebglRenderer();
                }
                else if (this._shouldLoadCanvas()) {
                    this._enableCanvasRenderer();
                }
            }
            if (!this.raw.element || !this.raw.textarea) {
                throw new Error('xterm elements not set after open');
            }
            const ad = this._attachedDisposables;
            ad.clear();
            ad.add(dom.addDisposableListener(this.raw.textarea, 'focus', () => this._setFocused(true)));
            ad.add(dom.addDisposableListener(this.raw.textarea, 'blur', () => this._setFocused(false)));
            ad.add(dom.addDisposableListener(this.raw.textarea, 'focusout', () => this._setFocused(false)));
            // Track wheel events in mouse wheel classifier and update smoothScrolling when it changes
            // as it must be disabled when a trackpad is used
            ad.add(dom.addDisposableListener(this.raw.element, dom.EventType.MOUSE_WHEEL, (e) => {
                const classifier = scrollableElement_1.MouseWheelClassifier.INSTANCE;
                classifier.acceptStandardWheelEvent(new mouseEvent_1.StandardWheelEvent(e));
                const value = classifier.isPhysicalMouseWheel();
                if (value !== this._isPhysicalMouseWheel) {
                    this._isPhysicalMouseWheel = value;
                    this._updateSmoothScrolling();
                }
            }, { passive: true }));
            this._attached = { container, options };
            // Screen must be created at this point as xterm.open is called
            return this._attached?.container.querySelector('.xterm-screen');
        }
        _setFocused(isFocused) {
            this._onDidChangeFocus.fire(isFocused);
            this._anyTerminalFocusContextKey.set(isFocused);
            this._anyFocusedTerminalHasSelection.set(isFocused && this.raw.hasSelection());
        }
        write(data, callback) {
            this.raw.write(data, callback);
        }
        resize(columns, rows) {
            this.raw.resize(columns, rows);
        }
        updateConfig() {
            const config = this._configHelper.config;
            this.raw.options.altClickMovesCursor = config.altClickMovesCursor;
            this._setCursorBlink(config.cursorBlinking);
            this._setCursorStyle(config.cursorStyle);
            this._setCursorStyleInactive(config.cursorStyleInactive);
            this._setCursorWidth(config.cursorWidth);
            this.raw.options.scrollback = config.scrollback;
            this.raw.options.drawBoldTextInBrightColors = config.drawBoldTextInBrightColors;
            this.raw.options.minimumContrastRatio = config.minimumContrastRatio;
            this.raw.options.tabStopWidth = config.tabStopWidth;
            this.raw.options.fastScrollSensitivity = config.fastScrollSensitivity;
            this.raw.options.scrollSensitivity = config.mouseWheelScrollSensitivity;
            this.raw.options.macOptionIsMeta = config.macOptionIsMeta;
            const editorOptions = this._configurationService.getValue('editor');
            this.raw.options.altClickMovesCursor = config.altClickMovesCursor && editorOptions.multiCursorModifier === 'alt';
            this.raw.options.macOptionClickForcesSelection = config.macOptionClickForcesSelection;
            this.raw.options.rightClickSelectsWord = config.rightClickBehavior === 'selectWord';
            this.raw.options.wordSeparator = config.wordSeparators;
            this.raw.options.customGlyphs = config.customGlyphs;
            this.raw.options.ignoreBracketedPasteMode = config.ignoreBracketedPasteMode;
            this._updateSmoothScrolling();
            if (this._attached?.options.enableGpu) {
                if (this._shouldLoadWebgl()) {
                    this._enableWebglRenderer();
                }
                else {
                    this._disposeOfWebglRenderer();
                    if (this._shouldLoadCanvas()) {
                        this._enableCanvasRenderer();
                    }
                    else {
                        this._disposeOfCanvasRenderer();
                    }
                }
            }
        }
        _updateSmoothScrolling() {
            this.raw.options.smoothScrollDuration = this._configHelper.config.smoothScrolling && this._isPhysicalMouseWheel ? 125 /* RenderConstants.SmoothScrollDuration */ : 0;
        }
        _shouldLoadWebgl() {
            return !browser_1.isSafari && (this._configHelper.config.gpuAcceleration === 'auto' && XtermTerminal_1._suggestedRendererType === undefined) || this._configHelper.config.gpuAcceleration === 'on';
        }
        _shouldLoadCanvas() {
            return (this._configHelper.config.gpuAcceleration === 'auto' && (XtermTerminal_1._suggestedRendererType === undefined || XtermTerminal_1._suggestedRendererType === 'canvas')) || this._configHelper.config.gpuAcceleration === 'canvas';
        }
        forceRedraw() {
            this.raw.clearTextureAtlas();
        }
        clearDecorations() {
            this._decorationAddon?.clearDecorations();
        }
        forceRefresh() {
            this._core.viewport?._innerRefresh();
        }
        forceUnpause() {
            // HACK: Force the renderer to unpause by simulating an IntersectionObserver event.
            // This is to fix an issue where dragging the windpow to the top of the screen to
            // maximize on Windows/Linux would fire an event saying that the terminal was not
            // visible.
            if (!!this._canvasAddon) {
                this._core._renderService?._handleIntersectionChange({ intersectionRatio: 1 });
                // HACK: Force a refresh of the screen to ensure links are refresh corrected.
                // This can probably be removed when the above hack is fixed in Chromium.
                this.raw.refresh(0, this.raw.rows - 1);
            }
        }
        async findNext(term, searchOptions) {
            this._updateFindColors(searchOptions);
            return (await this._getSearchAddon()).findNext(term, searchOptions);
        }
        async findPrevious(term, searchOptions) {
            this._updateFindColors(searchOptions);
            return (await this._getSearchAddon()).findPrevious(term, searchOptions);
        }
        _updateFindColors(searchOptions) {
            const theme = this._themeService.getColorTheme();
            // Theme color names align with monaco/vscode whereas xterm.js has some different naming.
            // The mapping is as follows:
            // - findMatch -> activeMatch
            // - findMatchHighlight -> match
            const terminalBackground = theme.getColor(terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR) || theme.getColor(theme_1.PANEL_BACKGROUND);
            const findMatchBackground = theme.getColor(terminalColorRegistry_1.TERMINAL_FIND_MATCH_BACKGROUND_COLOR);
            const findMatchBorder = theme.getColor(terminalColorRegistry_1.TERMINAL_FIND_MATCH_BORDER_COLOR);
            const findMatchOverviewRuler = theme.getColor(terminalColorRegistry_1.TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR);
            const findMatchHighlightBackground = theme.getColor(terminalColorRegistry_1.TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR);
            const findMatchHighlightBorder = theme.getColor(terminalColorRegistry_1.TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR);
            const findMatchHighlightOverviewRuler = theme.getColor(terminalColorRegistry_1.TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR);
            searchOptions.decorations = {
                activeMatchBackground: findMatchBackground?.toString(),
                activeMatchBorder: findMatchBorder?.toString() || 'transparent',
                activeMatchColorOverviewRuler: findMatchOverviewRuler?.toString() || 'transparent',
                // decoration bgs don't support the alpha channel so blend it with the regular bg
                matchBackground: terminalBackground ? findMatchHighlightBackground?.blend(terminalBackground).toString() : undefined,
                matchBorder: findMatchHighlightBorder?.toString() || 'transparent',
                matchOverviewRuler: findMatchHighlightOverviewRuler?.toString() || 'transparent'
            };
        }
        _getSearchAddon() {
            if (!this._searchAddonPromise) {
                this._searchAddonPromise = this._getSearchAddonConstructor().then((AddonCtor) => {
                    this._searchAddon = new AddonCtor({ highlightLimit: 1000 /* XtermTerminalConstants.SearchHighlightLimit */ });
                    this.raw.loadAddon(this._searchAddon);
                    this._searchAddon.onDidChangeResults((results) => {
                        this._lastFindResult = results;
                        this._onDidChangeFindResults.fire(results);
                    });
                    return this._searchAddon;
                });
            }
            return this._searchAddonPromise;
        }
        clearSearchDecorations() {
            this._searchAddon?.clearDecorations();
        }
        clearActiveSearchDecoration() {
            this._searchAddon?.clearActiveDecoration();
        }
        getFont() {
            return this._configHelper.getFont(dom.getWindow(this.raw.element), this._core);
        }
        getLongestViewportWrappedLineLength() {
            let maxLineLength = 0;
            for (let i = this.raw.buffer.active.length - 1; i >= this.raw.buffer.active.viewportY; i--) {
                const lineInfo = this._getWrappedLineCount(i, this.raw.buffer.active);
                maxLineLength = Math.max(maxLineLength, ((lineInfo.lineCount * this.raw.cols) - lineInfo.endSpaces) || 0);
                i = lineInfo.currentIndex;
            }
            return maxLineLength;
        }
        _getWrappedLineCount(index, buffer) {
            let line = buffer.getLine(index);
            if (!line) {
                throw new Error('Could not get line');
            }
            let currentIndex = index;
            let endSpaces = 0;
            // line.length may exceed cols as it doesn't necessarily trim the backing array on resize
            for (let i = Math.min(line.length, this.raw.cols) - 1; i >= 0; i--) {
                if (!line?.getCell(i)?.getChars()) {
                    endSpaces++;
                }
                else {
                    break;
                }
            }
            while (line?.isWrapped && currentIndex > 0) {
                currentIndex--;
                line = buffer.getLine(currentIndex);
            }
            return { lineCount: index - currentIndex + 1, currentIndex, endSpaces };
        }
        scrollDownLine() {
            this.raw.scrollLines(1);
        }
        scrollDownPage() {
            this.raw.scrollPages(1);
        }
        scrollToBottom() {
            this.raw.scrollToBottom();
        }
        scrollUpLine() {
            this.raw.scrollLines(-1);
        }
        scrollUpPage() {
            this.raw.scrollPages(-1);
        }
        scrollToTop() {
            this.raw.scrollToTop();
        }
        scrollToLine(line, position = 0 /* ScrollPosition.Top */) {
            this.markTracker.scrollToLine(line, position);
        }
        clearBuffer() {
            this.raw.clear();
            // xterm.js does not clear the first prompt, so trigger these to simulate
            // the prompt being written
            this._capabilities.get(2 /* TerminalCapability.CommandDetection */)?.handlePromptStart();
            this._capabilities.get(2 /* TerminalCapability.CommandDetection */)?.handleCommandStart();
            this._audioCueService.playAudioCue(audioCueService_1.AudioCue.clear);
        }
        hasSelection() {
            return this.raw.hasSelection();
        }
        clearSelection() {
            this.raw.clearSelection();
        }
        selectMarkedRange(fromMarkerId, toMarkerId, scrollIntoView = false) {
            const detectionCapability = this.shellIntegration.capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
            if (!detectionCapability) {
                return;
            }
            const start = detectionCapability.getMark(fromMarkerId);
            const end = detectionCapability.getMark(toMarkerId);
            if (start === undefined || end === undefined) {
                return;
            }
            this.raw.selectLines(start.line, end.line);
            if (scrollIntoView) {
                this.raw.scrollToLine(start.line);
            }
        }
        selectAll() {
            this.raw.focus();
            this.raw.selectAll();
        }
        focus() {
            this.raw.focus();
        }
        async copySelection(asHtml, command) {
            if (this.hasSelection() || (asHtml && command)) {
                if (asHtml) {
                    const textAsHtml = await this.getSelectionAsHtml(command);
                    function listener(e) {
                        if (!e.clipboardData.types.includes('text/plain')) {
                            e.clipboardData.setData('text/plain', command?.getOutput() ?? '');
                        }
                        e.clipboardData.setData('text/html', textAsHtml);
                        e.preventDefault();
                    }
                    const doc = dom.getDocument(this.raw.element);
                    doc.addEventListener('copy', listener);
                    doc.execCommand('copy');
                    doc.removeEventListener('copy', listener);
                }
                else {
                    await this._clipboardService.writeText(this.raw.getSelection());
                }
            }
            else {
                this._notificationService.warn((0, nls_1.localize)('terminal.integrated.copySelection.noSelection', 'The terminal has no selection to copy'));
            }
        }
        _setCursorBlink(blink) {
            if (this.raw.options.cursorBlink !== blink) {
                this.raw.options.cursorBlink = blink;
                this.raw.refresh(0, this.raw.rows - 1);
            }
        }
        _setCursorStyle(style) {
            const mapped = vscodeToXtermCursorStyle(style);
            if (this.raw.options.cursorStyle !== mapped) {
                this.raw.options.cursorStyle = mapped;
            }
        }
        _setCursorStyleInactive(style) {
            const mapped = vscodeToXtermCursorStyle(style);
            if (this.raw.options.cursorInactiveStyle !== mapped) {
                this.raw.options.cursorInactiveStyle = mapped;
            }
        }
        _setCursorWidth(width) {
            if (this.raw.options.cursorWidth !== width) {
                this.raw.options.cursorWidth = width;
            }
        }
        async _enableWebglRenderer() {
            if (!this.raw.element || this._webglAddon) {
                return;
            }
            // Check if the the WebGL renderer is compatible with xterm.js:
            // - https://github.com/microsoft/vscode/issues/190195
            // - https://github.com/xtermjs/xterm.js/issues/4665
            // - https://bugs.chromium.org/p/chromium/issues/detail?id=1476475
            if (!XtermTerminal_1._checkedWebglCompatible) {
                XtermTerminal_1._checkedWebglCompatible = true;
                const checkCanvas = document.createElement('canvas');
                const checkGl = checkCanvas.getContext('webgl2');
                const debugInfo = checkGl?.getExtension('WEBGL_debug_renderer_info');
                if (checkGl && debugInfo) {
                    const renderer = checkGl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    if (renderer.startsWith('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)')) {
                        this._disableWebglForThisSession();
                        return;
                    }
                }
            }
            const Addon = await this._getWebglAddonConstructor();
            this._webglAddon = new Addon();
            this._disposeOfCanvasRenderer();
            try {
                this.raw.loadAddon(this._webglAddon);
                this._logService.trace('Webgl was loaded');
                this._webglAddon.onContextLoss(() => {
                    this._logService.info(`Webgl lost context, disposing of webgl renderer`);
                    this._disposeOfWebglRenderer();
                });
                this._refreshImageAddon();
                // Uncomment to add the texture atlas to the DOM
                // setTimeout(() => {
                // 	if (this._webglAddon?.textureAtlas) {
                // 		document.body.appendChild(this._webglAddon?.textureAtlas);
                // 	}
                // }, 5000);
            }
            catch (e) {
                this._logService.warn(`Webgl could not be loaded. Falling back to the canvas renderer type.`, e);
                const neverMeasureRenderTime = this._storageService.getBoolean("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, -1 /* StorageScope.APPLICATION */, false);
                // if it's already set to dom, no need to measure render time
                if (!neverMeasureRenderTime && this._configHelper.config.gpuAcceleration !== 'off') {
                    this._measureRenderTime();
                }
                this._disableWebglForThisSession();
            }
        }
        _disableWebglForThisSession() {
            XtermTerminal_1._suggestedRendererType = 'canvas';
            this._disposeOfWebglRenderer();
            this._enableCanvasRenderer();
        }
        async _enableCanvasRenderer() {
            if (!this.raw.element || this._canvasAddon) {
                return;
            }
            const Addon = await this._getCanvasAddonConstructor();
            this._canvasAddon = new Addon();
            this._disposeOfWebglRenderer();
            try {
                this.raw.loadAddon(this._canvasAddon);
                this._logService.trace('Canvas renderer was loaded');
            }
            catch (e) {
                this._logService.warn(`Canvas renderer could not be loaded, falling back to dom renderer`, e);
                const neverMeasureRenderTime = this._storageService.getBoolean("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, -1 /* StorageScope.APPLICATION */, false);
                // if it's already set to dom, no need to measure render time
                if (!neverMeasureRenderTime && this._configHelper.config.gpuAcceleration !== 'off') {
                    this._measureRenderTime();
                }
                XtermTerminal_1._suggestedRendererType = 'dom';
                this._disposeOfCanvasRenderer();
            }
            this._refreshImageAddon();
        }
        async _getCanvasAddonConstructor() {
            if (!CanvasAddon) {
                CanvasAddon = (await (0, amdX_1.importAMDNodeModule)('@xterm/addon-canvas', 'lib/xterm-addon-canvas.js')).CanvasAddon;
            }
            return CanvasAddon;
        }
        async _refreshImageAddon() {
            // Only allow the image addon when a canvas is being used to avoid possible GPU issues
            if (this._configHelper.config.enableImages && (this._canvasAddon || this._webglAddon)) {
                if (!this._imageAddon) {
                    const AddonCtor = await this._getImageAddonConstructor();
                    this._imageAddon = new AddonCtor();
                    this.raw.loadAddon(this._imageAddon);
                }
            }
            else {
                try {
                    this._imageAddon?.dispose();
                }
                catch {
                    // ignore
                }
                this._imageAddon = undefined;
            }
        }
        async _getImageAddonConstructor() {
            if (!ImageAddon) {
                ImageAddon = (await (0, amdX_1.importAMDNodeModule)('@xterm/addon-image', 'lib/addon-image.js')).ImageAddon;
            }
            return ImageAddon;
        }
        async _getSearchAddonConstructor() {
            if (!SearchAddon) {
                SearchAddon = (await (0, amdX_1.importAMDNodeModule)('@xterm/addon-search', 'lib/addon-search.js')).SearchAddon;
            }
            return SearchAddon;
        }
        async _getUnicode11Constructor() {
            if (!Unicode11Addon) {
                Unicode11Addon = (await (0, amdX_1.importAMDNodeModule)('@xterm/addon-unicode11', 'lib/addon-unicode11.js')).Unicode11Addon;
            }
            return Unicode11Addon;
        }
        async _getWebglAddonConstructor() {
            if (!WebglAddon) {
                WebglAddon = (await (0, amdX_1.importAMDNodeModule)('@xterm/addon-webgl', 'lib/addon-webgl.js')).WebglAddon;
            }
            return WebglAddon;
        }
        async _getSerializeAddonConstructor() {
            if (!SerializeAddon) {
                SerializeAddon = (await (0, amdX_1.importAMDNodeModule)('@xterm/addon-serialize', 'lib/addon-serialize.js')).SerializeAddon;
            }
            return SerializeAddon;
        }
        _disposeOfCanvasRenderer() {
            try {
                this._canvasAddon?.dispose();
            }
            catch {
                // ignore
            }
            this._canvasAddon = undefined;
            this._refreshImageAddon();
        }
        _disposeOfWebglRenderer() {
            try {
                this._webglAddon?.dispose();
            }
            catch {
                // ignore
            }
            this._webglAddon = undefined;
            this._refreshImageAddon();
        }
        async _measureRenderTime() {
            const frameTimes = [];
            if (!this._core._renderService?._renderer.value?._renderLayers) {
                return;
            }
            const textRenderLayer = this._core._renderService._renderer.value._renderLayers[0];
            const originalOnGridChanged = textRenderLayer?.onGridChanged;
            const evaluateCanvasRenderer = () => {
                // Discard first frame time as it's normal to take longer
                frameTimes.shift();
                const medianTime = frameTimes.sort((a, b) => a - b)[Math.floor(frameTimes.length / 2)];
                if (medianTime > 50 /* RenderConstants.SlowCanvasRenderThreshold */) {
                    if (this._configHelper.config.gpuAcceleration === 'auto') {
                        XtermTerminal_1._suggestedRendererType = 'dom';
                        this.updateConfig();
                    }
                    else {
                        const promptChoices = [
                            {
                                label: (0, nls_1.localize)('yes', "Yes"),
                                run: () => this._configurationService.updateValue("terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */, 'off', 2 /* ConfigurationTarget.USER */)
                            },
                            {
                                label: (0, nls_1.localize)('no', "No"),
                                run: () => { }
                            },
                            {
                                label: (0, nls_1.localize)('dontShowAgain', "Don't Show Again"),
                                isSecondary: true,
                                run: () => this._storageService.store("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */)
                            }
                        ];
                        this._notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('terminal.slowRendering', 'Terminal GPU acceleration appears to be slow on your computer. Would you like to switch to disable it which may improve performance? [Read more about terminal settings](https://code.visualstudio.com/docs/editor/integrated-terminal#_changing-how-the-terminal-is-rendered).'), promptChoices);
                    }
                }
            };
            textRenderLayer.onGridChanged = (terminal, firstRow, lastRow) => {
                const startTime = performance.now();
                originalOnGridChanged.call(textRenderLayer, terminal, firstRow, lastRow);
                frameTimes.push(performance.now() - startTime);
                if (frameTimes.length === 20 /* RenderConstants.NumberOfFramestoMeasure */) {
                    evaluateCanvasRenderer();
                    // Restore original function
                    textRenderLayer.onGridChanged = originalOnGridChanged;
                }
            };
        }
        getXtermTheme(theme) {
            if (!theme) {
                theme = this._themeService.getColorTheme();
            }
            const foregroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_FOREGROUND_COLOR);
            const backgroundColor = this._xtermColorProvider.getBackgroundColor(theme);
            const cursorColor = theme.getColor(terminalColorRegistry_1.TERMINAL_CURSOR_FOREGROUND_COLOR) || foregroundColor;
            const cursorAccentColor = theme.getColor(terminalColorRegistry_1.TERMINAL_CURSOR_BACKGROUND_COLOR) || backgroundColor;
            const selectionBackgroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_SELECTION_BACKGROUND_COLOR);
            const selectionInactiveBackgroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR);
            const selectionForegroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_SELECTION_FOREGROUND_COLOR) || undefined;
            return {
                background: backgroundColor?.toString(),
                foreground: foregroundColor?.toString(),
                cursor: cursorColor?.toString(),
                cursorAccent: cursorAccentColor?.toString(),
                selectionBackground: selectionBackgroundColor?.toString(),
                selectionInactiveBackground: selectionInactiveBackgroundColor?.toString(),
                selectionForeground: selectionForegroundColor?.toString(),
                black: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[0])?.toString(),
                red: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[1])?.toString(),
                green: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[2])?.toString(),
                yellow: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[3])?.toString(),
                blue: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[4])?.toString(),
                magenta: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[5])?.toString(),
                cyan: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[6])?.toString(),
                white: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[7])?.toString(),
                brightBlack: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[8])?.toString(),
                brightRed: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[9])?.toString(),
                brightGreen: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[10])?.toString(),
                brightYellow: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[11])?.toString(),
                brightBlue: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[12])?.toString(),
                brightMagenta: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[13])?.toString(),
                brightCyan: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[14])?.toString(),
                brightWhite: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[15])?.toString()
            };
        }
        _updateTheme(theme) {
            this.raw.options.theme = this.getXtermTheme(theme);
        }
        refresh() {
            this._updateTheme();
            this._decorationAddon.refreshLayouts();
        }
        async _updateUnicodeVersion() {
            if (!this._unicode11Addon && this._configHelper.config.unicodeVersion === '11') {
                const Addon = await this._getUnicode11Constructor();
                this._unicode11Addon = new Addon();
                this.raw.loadAddon(this._unicode11Addon);
            }
            if (this.raw.unicode.activeVersion !== this._configHelper.config.unicodeVersion) {
                this.raw.unicode.activeVersion = this._configHelper.config.unicodeVersion;
            }
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _writeText(data) {
            this.raw.write(data);
        }
        dispose() {
            this._anyTerminalFocusContextKey.reset();
            this._anyFocusedTerminalHasSelection.reset();
            this._onDidDispose.fire();
            super.dispose();
        }
    };
    exports.XtermTerminal = XtermTerminal;
    __decorate([
        (0, decorators_1.debounce)(100)
    ], XtermTerminal.prototype, "_refreshImageAddon", null);
    exports.XtermTerminal = XtermTerminal = XtermTerminal_1 = __decorate([
        __param(8, configuration_1.IConfigurationService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, terminal_1.ITerminalLogService),
        __param(11, notification_1.INotificationService),
        __param(12, storage_1.IStorageService),
        __param(13, themeService_1.IThemeService),
        __param(14, telemetry_1.ITelemetryService),
        __param(15, clipboardService_1.IClipboardService),
        __param(16, contextkey_1.IContextKeyService),
        __param(17, audioCueService_1.IAudioCueService),
        __param(18, layoutService_1.ILayoutService)
    ], XtermTerminal);
    function getXtermScaledDimensions(w, font, width, height) {
        if (!font.charWidth || !font.charHeight) {
            return null;
        }
        // Because xterm.js converts from CSS pixels to actual pixels through
        // the use of canvas, window.devicePixelRatio needs to be used here in
        // order to be precise. font.charWidth/charHeight alone as insufficient
        // when window.devicePixelRatio changes.
        const scaledWidthAvailable = width * w.devicePixelRatio;
        const scaledCharWidth = font.charWidth * w.devicePixelRatio + font.letterSpacing;
        const cols = Math.max(Math.floor(scaledWidthAvailable / scaledCharWidth), 1);
        const scaledHeightAvailable = height * w.devicePixelRatio;
        const scaledCharHeight = Math.ceil(font.charHeight * w.devicePixelRatio);
        const scaledLineHeight = Math.floor(scaledCharHeight * font.lineHeight);
        const rows = Math.max(Math.floor(scaledHeightAvailable / scaledLineHeight), 1);
        return { rows, cols };
    }
    exports.getXtermScaledDimensions = getXtermScaledDimensions;
    function vscodeToXtermLogLevel(logLevel) {
        switch (logLevel) {
            case log_1.LogLevel.Trace: return 'trace';
            case log_1.LogLevel.Debug: return 'debug';
            case log_1.LogLevel.Info: return 'info';
            case log_1.LogLevel.Warning: return 'warn';
            case log_1.LogLevel.Error: return 'error';
            default: return 'off';
        }
    }
    function vscodeToXtermCursorStyle(style) {
        // 'line' is used instead of bar in VS Code to be consistent with editor.cursorStyle
        if (style === 'line') {
            return 'bar';
        }
        return style;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHRlcm1UZXJtaW5hbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci94dGVybS94dGVybVRlcm1pbmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE0Q2hHLElBQVcsZUFRVjtJQVJELFdBQVcsZUFBZTtRQUN6Qjs7O1dBR0c7UUFDSCxnR0FBOEIsQ0FBQTtRQUM5Qiw0RkFBNEIsQ0FBQTtRQUM1Qix1RkFBMEIsQ0FBQTtJQUMzQixDQUFDLEVBUlUsZUFBZSxLQUFmLGVBQWUsUUFRekI7SUFFRCxJQUFJLFdBQW1DLENBQUM7SUFDeEMsSUFBSSxVQUFpQyxDQUFDO0lBQ3RDLElBQUksV0FBbUMsQ0FBQztJQUN4QyxJQUFJLGNBQXlDLENBQUM7SUFDOUMsSUFBSSxjQUF5QyxDQUFDO0lBQzlDLElBQUksVUFBaUMsQ0FBQztJQUV0QyxTQUFTLHlCQUF5QixDQUFDLFNBQWlCLEVBQUUsTUFBZTtRQUNwRSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNYLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFDRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsT0FBTyxTQUFTLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN4QyxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxNQUFNO1lBQ1AsQ0FBQztZQUNE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