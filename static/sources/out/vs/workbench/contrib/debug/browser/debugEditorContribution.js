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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/coreCommands", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/wordHelper", "vs/editor/common/model", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/model", "vs/editor/contrib/hover/browser/hover", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/debug/browser/debugHover", "vs/workbench/contrib/debug/browser/exceptionWidget", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/services/host/browser/host"], function (require, exports, dom_1, event_1, keyboardEvent_1, arrays_1, async_1, cancellation_1, decorators_1, errors_1, event_2, json_1, jsonEdit_1, lifecycle_1, numbers_1, path_1, env, strings, types_1, uri_1, coreCommands_1, editOperation_1, position_1, range_1, wordHelper_1, model_1, languageFeatureDebounce_1, languageFeatures_1, model_2, hover_1, nls, commands_1, configuration_1, contextkey_1, instantiation_1, colorRegistry_1, uriIdentity_1, debugHover_1, exceptionWidget_1, debug_1, debugModel_1, host_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugEditorContribution = exports.debugInlineBackground = exports.debugInlineForeground = void 0;
    const MAX_NUM_INLINE_VALUES = 100; // JS Global scope can have 700+ entries. We want to limit ourselves for perf reasons
    const MAX_INLINE_DECORATOR_LENGTH = 150; // Max string length of each inline decorator when debugging. If exceeded ... is added
    const MAX_TOKENIZATION_LINE_LEN = 500; // If line is too long, then inline values for the line are skipped
    const DEAFULT_INLINE_DEBOUNCE_DELAY = 200;
    exports.debugInlineForeground = (0, colorRegistry_1.registerColor)('editor.inlineValuesForeground', {
        dark: '#ffffff80',
        light: '#00000080',
        hcDark: '#ffffff80',
        hcLight: '#00000080'
    }, nls.localize('editor.inlineValuesForeground', "Color for the debug inline value text."));
    exports.debugInlineBackground = (0, colorRegistry_1.registerColor)('editor.inlineValuesBackground', {
        dark: '#ffc80033',
        light: '#ffc80033',
        hcDark: '#ffc80033',
        hcLight: '#ffc80033'
    }, nls.localize('editor.inlineValuesBackground', "Color for the debug inline value background."));
    class InlineSegment {
        constructor(column, text) {
            this.column = column;
            this.text = text;
        }
    }
    function createInlineValueDecoration(lineNumber, contentText, column = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */) {
        // If decoratorText is too long, trim and add ellipses. This could happen for minified files with everything on a single line
        if (contentText.length > MAX_INLINE_DECORATOR_LENGTH) {
            contentText = contentText.substring(0, MAX_INLINE_DECORATOR_LENGTH) + '...';
        }
        return [
            {
                range: {
                    startLineNumber: lineNumber,
                    endLineNumber: lineNumber,
                    startColumn: column,
                    endColumn: column
                },
                options: {
                    description: 'debug-inline-value-decoration-spacer',
                    after: {
                        content: strings.noBreakWhitespace,
                        cursorStops: model_1.InjectedTextCursorStops.None
                    },
                    showIfCollapsed: true,
                }
            },
            {
                range: {
                    startLineNumber: lineNumber,
                    endLineNumber: lineNumber,
                    startColumn: column,
                    endColumn: column
                },
                options: {
                    description: 'debug-inline-value-decoration',
                    after: {
                        content: replaceWsWithNoBreakWs(contentText),
                        inlineClassName: 'debug-inline-value',
                        inlineClassNameAffectsLetterSpacing: true,
                        cursorStops: model_1.InjectedTextCursorStops.None
                    },
                    showIfCollapsed: true,
                }
            },
        ];
    }
    function replaceWsWithNoBreakWs(str) {
        return str.replace(/[ \t]/g, strings.noBreakWhitespace);
    }
    function createInlineValueDecorationsInsideRange(expressions, ranges, model, wordToLineNumbersMap) {
        const nameValueMap = new Map();
        for (const expr of expressions) {
            nameValueMap.set(expr.name, expr.value);
            // Limit the size of map. Too large can have a perf impact
            if (nameValueMap.size >= MAX_NUM_INLINE_VALUES) {
                break;
            }
        }
        const lineToNamesMap = new Map();
        // Compute unique set of names on each line
        nameValueMap.forEach((_value, name) => {
            const lineNumbers = wordToLineNumbersMap.get(name);
            if (lineNumbers) {
                for (const lineNumber of lineNumbers) {
                    if (ranges.some(r => lineNumber >= r.startLineNumber && lineNumber <= r.endLineNumber)) {
                        if (!lineToNamesMap.has(lineNumber)) {
                            lineToNamesMap.set(lineNumber, []);
                        }
                        if (lineToNamesMap.get(lineNumber).indexOf(name) === -1) {
                            lineToNamesMap.get(lineNumber).push(name);
                        }
                    }
                }
            }
        });
        const decorations = [];
        // Compute decorators for each line
        lineToNamesMap.forEach((names, line) => {
            const contentText = names.sort((first, second) => {
                const content = model.getLineContent(line);
                return content.indexOf(first) - content.indexOf(second);
            }).map(name => `${name} = ${nameValueMap.get(name)}`).join(', ');
            decorations.push(...createInlineValueDecoration(line, contentText));
        });
        return decorations;
    }
    function getWordToLineNumbersMap(model, lineNumber, result) {
        const lineLength = model.getLineLength(lineNumber);
        // If line is too long then skip the line
        if (lineLength > MAX_TOKENIZATION_LINE_LEN) {
            return;
        }
        const lineContent = model.getLineContent(lineNumber);
        model.tokenization.forceTokenization(lineNumber);
        const lineTokens = model.tokenization.getLineTokens(lineNumber);
        for (let tokenIndex = 0, tokenCount = lineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
            const tokenType = lineTokens.getStandardTokenType(tokenIndex);
            // Token is a word and not a comment
            if (tokenType === 0 /* StandardTokenType.Other */) {
                wordHelper_1.DEFAULT_WORD_REGEXP.lastIndex = 0; // We assume tokens will usually map 1:1 to words if they match
                const tokenStartOffset = lineTokens.getStartOffset(tokenIndex);
                const tokenEndOffset = lineTokens.getEndOffset(tokenIndex);
                const tokenStr = lineContent.substring(tokenStartOffset, tokenEndOffset);
                const wordMatch = wordHelper_1.DEFAULT_WORD_REGEXP.exec(tokenStr);
                if (wordMatch) {
                    const word = wordMatch[0];
                    if (!result.has(word)) {
                        result.set(word, []);
                    }
                    result.get(word).push(lineNumber);
                }
            }
        }
    }
    let DebugEditorContribution = class DebugEditorContribution {
        constructor(editor, debugService, instantiationService, commandService, configurationService, hostService, uriIdentityService, contextKeyService, languageFeaturesService, featureDebounceService) {
            this.editor = editor;
            this.debugService = debugService;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.hostService = hostService;
            this.uriIdentityService = uriIdentityService;
            this.languageFeaturesService = languageFeaturesService;
            this.hoverPosition = null;
            this.mouseDown = false;
            this.gutterIsHovered = false;
            this.altListener = new lifecycle_1.MutableDisposable();
            this.altPressed = false;
            this.oldDecorations = this.editor.createDecorationsCollection();
            // Holds a Disposable that prevents the default editor hover behavior while it exists.
            this.defaultHoverLockout = new lifecycle_1.MutableDisposable();
            this.debounceInfo = featureDebounceService.for(languageFeaturesService.inlineValuesProvider, 'InlineValues', { min: DEAFULT_INLINE_DEBOUNCE_DELAY });
            this.hoverWidget = this.instantiationService.createInstance(debugHover_1.DebugHoverWidget, this.editor);
            this.toDispose = [this.defaultHoverLockout, this.altListener];
            this.registerListeners();
            this.exceptionWidgetVisible = debug_1.CONTEXT_EXCEPTION_WIDGET_VISIBLE.bindTo(contextKeyService);
            this.toggleExceptionWidget();
        }
        registerListeners() {
            this.toDispose.push(this.debugService.getViewModel().onDidFocusStackFrame(e => this.onFocusStackFrame(e.stackFrame)));
            // hover listeners & hover widget
            this.toDispose.push(this.editor.onMouseDown((e) => this.onEditorMouseDown(e)));
            this.toDispose.push(this.editor.onMouseUp(() => this.mouseDown = false));
            this.toDispose.push(this.editor.onMouseMove((e) => this.onEditorMouseMove(e)));
            this.toDispose.push(this.editor.onMouseLeave((e) => {
                const hoverDomNode = this.hoverWidget.getDomNode();
                if (!hoverDomNode) {
                    return;
                }
                const rect = hoverDomNode.getBoundingClientRect();
                // Only hide the hover widget if the editor mouse leave event is outside the hover widget #3528
                if (e.event.posx < rect.left || e.event.posx > rect.right || e.event.posy < rect.top || e.event.posy > rect.bottom) {
                    this.hideHoverWidget();
                }
            }));
            this.toDispose.push(this.editor.onKeyDown((e) => this.onKeyDown(e)));
            this.toDispose.push(this.editor.onDidChangeModelContent(() => {
                this._wordToLineNumbersMap = undefined;
                this.updateInlineValuesScheduler.schedule();
            }));
            this.toDispose.push(this.debugService.getViewModel().onWillUpdateViews(() => this.updateInlineValuesScheduler.schedule()));
            this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(() => this.updateInlineValuesScheduler.schedule()));
            this.toDispose.push(this.editor.onDidChangeModel(async () => {
                this.addDocumentListeners();
                this.toggleExceptionWidget();
                this.hideHoverWidget();
                this._wordToLineNumbersMap = undefined;
                const stackFrame = this.debugService.getViewModel().focusedStackFrame;
                await this.updateInlineValueDecorations(stackFrame);
            }));
            this.toDispose.push(this.editor.onDidScrollChange(() => {
                this.hideHoverWidget();
                // Inline value provider should get called on view port change
                const model = this.editor.getModel();
                if (model && this.languageFeaturesService.inlineValuesProvider.has(model)) {
                    this.updateInlineValuesScheduler.schedule();
                }
            }));
            this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('editor.hover')) {
                    this.updateHoverConfiguration();
                }
            }));
            this.toDispose.push(this.debugService.onDidChangeState((state) => {
                if (state !== 2 /* State.Stopped */) {
                    this.toggleExceptionWidget();
                }
            }));
            this.updateHoverConfiguration();
        }
        updateHoverConfiguration() {
            const model = this.editor.getModel();
            if (model) {
                this.editorHoverOptions = this.configurationService.getValue('editor.hover', {
                    resource: model.uri,
                    overrideIdentifier: model.getLanguageId()
                });
            }
        }
        addDocumentListeners() {
            const stackFrame = this.debugService.getViewModel().focusedStackFrame;
            const model = this.editor.getModel();
            if (model) {
                this.applyDocumentListeners(model, stackFrame);
            }
        }
        applyDocumentListeners(model, stackFrame) {
            if (!stackFrame || !this.uriIdentityService.extUri.isEqual(model.uri, stackFrame.source.uri)) {
                this.altListener.clear();
                return;
            }
            const ownerDocument = this.editor.getContainerDomNode().ownerDocument;
            // When the alt key is pressed show regular editor hover and hide the debug hover #84561
            this.altListener.value = (0, dom_1.addDisposableListener)(ownerDocument, 'keydown', keydownEvent => {
                const standardKeyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(keydownEvent);
                if (standardKeyboardEvent.keyCode === 6 /* KeyCode.Alt */) {
                    this.altPressed = true;
                    const debugHoverWasVisible = this.hoverWidget.isVisible();
                    this.hoverWidget.hide();
                    this.defaultHoverLockout.clear();
                    if (debugHoverWasVisible && this.hoverPosition) {
                        // If the debug hover was visible immediately show the editor hover for the alt transition to be smooth
                        this.showEditorHover(this.hoverPosition, false);
                    }
                    const onKeyUp = new event_1.DomEmitter(ownerDocument, 'keyup');
                    const listener = event_2.Event.any(this.hostService.onDidChangeFocus, onKeyUp.event)(keyupEvent => {
                        let standardKeyboardEvent = undefined;
                        if ((0, dom_1.isKeyboardEvent)(keyupEvent)) {
                            standardKeyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(keyupEvent);
                        }
                        if (!standardKeyboardEvent || standardKeyboardEvent.keyCode === 6 /* KeyCode.Alt */) {
                            this.altPressed = false;
                            this.preventDefaultEditorHover();
                            listener.dispose();
                            onKeyUp.dispose();
                        }
                    });
                }
            });
        }
        async showHover(position, focus) {
            // normally will already be set in `showHoverScheduler`, but public callers may hit this directly:
            this.preventDefaultEditorHover();
            const sf = this.debugService.getViewModel().focusedStackFrame;
            const model = this.editor.getModel();
            if (sf && model && this.uriIdentityService.extUri.isEqual(sf.source.uri, model.uri)) {
                const result = await this.hoverWidget.showAt(position, focus);
                if (result === 1 /* ShowDebugHoverResult.NOT_AVAILABLE */) {
                    // When no expression available fallback to editor hover
                    this.showEditorHover(position, focus);
                }
            }
            else {
                this.showEditorHover(position, focus);
            }
        }
        preventDefaultEditorHover() {
            if (this.defaultHoverLockout.value || this.editorHoverOptions?.enabled === false) {
                return;
            }
            const hoverController = this.editor.getContribution(hover_1.HoverController.ID);
            hoverController?.hideContentHover();
            this.editor.updateOptions({ hover: { enabled: false } });
            this.defaultHoverLockout.value = {
                dispose: () => {
                    this.editor.updateOptions({
                        hover: { enabled: this.editorHoverOptions?.enabled ?? true }
                    });
                }
            };
        }
        showEditorHover(position, focus) {
            const hoverController = this.editor.getContribution(hover_1.HoverController.ID);
            const range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            // enable the editor hover, otherwise the content controller will see it
            // as disabled and hide it on the first mouse move (#193149)
            this.defaultHoverLockout.clear();
            hoverController?.showContentHover(range, 1 /* HoverStartMode.Immediate */, 0 /* HoverStartSource.Mouse */, focus);
        }
        async onFocusStackFrame(sf) {
            const model = this.editor.getModel();
            if (model) {
                this.applyDocumentListeners(model, sf);
                if (sf && this.uriIdentityService.extUri.isEqual(sf.source.uri, model.uri)) {
                    await this.toggleExceptionWidget();
                }
                else {
                    this.hideHoverWidget();
                }
            }
            await this.updateInlineValueDecorations(sf);
        }
        get hoverDelay() {
            const baseDelay = this.editorHoverOptions?.delay || 0;
            // heuristic to get a 'good' but configurable delay for evaluation. The
            // debug hover can be very large, so we tend to be more conservative about
            // when to show it (#180621). With this equation:
            // - default 300ms hover => * 2   = 600ms
            // - short   100ms hover => * 2   = 200ms
            // - longer  600ms hover => * 1.5 = 900ms
            // - long   1000ms hover => * 1.0 = 1000ms
            const delayFactor = (0, numbers_1.clamp)(2 - (baseDelay - 300) / 600, 1, 2);
            return baseDelay * delayFactor;
        }
        get showHoverScheduler() {
            const scheduler = new async_1.RunOnceScheduler(() => {
                if (this.hoverPosition && !this.altPressed) {
                    this.showHover(this.hoverPosition, false);
                }
            }, this.hoverDelay);
            this.toDispose.push(scheduler);
            return scheduler;
        }
        hideHoverWidget() {
            if (this.hoverWidget.willBeVisible()) {
                this.hoverWidget.hide();
            }
            this.showHoverScheduler.cancel();
            this.defaultHoverLockout.clear();
        }
        // hover business
        onEditorMouseDown(mouseEvent) {
            this.mouseDown = true;
            if (mouseEvent.target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && mouseEvent.target.detail === debugHover_1.DebugHoverWidget.ID) {
                return;
            }
            this.hideHoverWidget();
        }
        onEditorMouseMove(mouseEvent) {
            if (this.debugService.state !== 2 /* State.Stopped */) {
                return;
            }
            const target = mouseEvent.target;
            const stopKey = env.isMacintosh ? 'metaKey' : 'ctrlKey';
            if (!this.altPressed) {
                if (target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */) {
                    this.defaultHoverLockout.clear();
                    this.gutterIsHovered = true;
                }
                else if (this.gutterIsHovered) {
                    this.gutterIsHovered = false;
                    this.updateHoverConfiguration();
                }
            }
            if (target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && target.detail === debugHover_1.DebugHoverWidget.ID && !mouseEvent.event[stopKey]) {
                // mouse moved on top of debug hover widget
                const sticky = this.editorHoverOptions?.sticky ?? true;
                if (sticky || this.hoverWidget.isShowingComplexValue) {
                    return;
                }
            }
            if (target.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
                if (target.position && !position_1.Position.equals(target.position, this.hoverPosition)) {
                    this.hoverPosition = target.position;
                    // Disable the editor hover during the request to avoid flickering
                    this.preventDefaultEditorHover();
                    this.showHoverScheduler.schedule(this.hoverDelay);
                }
            }
            else if (!this.mouseDown) {
                // Do not hide debug hover when the mouse is pressed because it usually leads to accidental closing #64620
                this.hideHoverWidget();
            }
        }
        onKeyDown(e) {
            const stopKey = env.isMacintosh ? 57 /* KeyCode.Meta */ : 5 /* KeyCode.Ctrl */;
            if (e.keyCode !== stopKey && e.keyCode !== 6 /* KeyCode.Alt */) {
                // do not hide hover when Ctrl/Meta is pressed, and alt is handled separately
                this.hideHoverWidget();
            }
        }
        // end hover business
        // exception widget
        async toggleExceptionWidget() {
            // Toggles exception widget based on the state of the current editor model and debug stack frame
            const model = this.editor.getModel();
            const focusedSf = this.debugService.getViewModel().focusedStackFrame;
            const callStack = focusedSf ? focusedSf.thread.getCallStack() : null;
            if (!model || !focusedSf || !callStack || callStack.length === 0) {
                this.closeExceptionWidget();
                return;
            }
            // First call stack frame that is available is the frame where exception has been thrown
            const exceptionSf = callStack.find(sf => !!(sf && sf.source && sf.source.available && sf.source.presentationHint !== 'deemphasize'));
            if (!exceptionSf || exceptionSf !== focusedSf) {
                this.closeExceptionWidget();
                return;
            }
            const sameUri = this.uriIdentityService.extUri.isEqual(exceptionSf.source.uri, model.uri);
            if (this.exceptionWidget && !sameUri) {
                this.closeExceptionWidget();
            }
            else if (sameUri) {
                const exceptionInfo = await focusedSf.thread.exceptionInfo;
                if (exceptionInfo) {
                    this.showExceptionWidget(exceptionInfo, this.debugService.getViewModel().focusedSession, exceptionSf.range.startLineNumber, exceptionSf.range.startColumn);
                }
            }
        }
        showExceptionWidget(exceptionInfo, debugSession, lineNumber, column) {
            if (this.exceptionWidget) {
                this.exceptionWidget.dispose();
            }
            this.exceptionWidget = this.instantiationService.createInstance(exceptionWidget_1.ExceptionWidget, this.editor, exceptionInfo, debugSession);
            this.exceptionWidget.show({ lineNumber, column }, 0);
            this.exceptionWidget.focus();
            this.editor.revealRangeInCenter({
                startLineNumber: lineNumber,
                startColumn: column,
                endLineNumber: lineNumber,
                endColumn: column,
            });
            this.exceptionWidgetVisible.set(true);
        }
        closeExceptionWidget() {
            if (this.exceptionWidget) {
                const shouldFocusEditor = this.exceptionWidget.hasFocus();
                this.exceptionWidget.dispose();
                this.exceptionWidget = undefined;
                this.exceptionWidgetVisible.set(false);
                if (shouldFocusEditor) {
                    this.editor.focus();
                }
            }
        }
        async addLaunchConfiguration() {
            const model = this.editor.getModel();
            if (!model) {
                return;
            }
            let configurationsArrayPosition;
            let lastProperty;
            const getConfigurationPosition = () => {
                let depthInArray = 0;
                (0, json_1.visit)(model.getValue(), {
                    onObjectProperty: (property) => {
                        lastProperty = property;
                    },
                    onArrayBegin: (offset) => {
                        if (lastProperty === 'configurations' && depthInArray === 0) {
                            configurationsArrayPosition = model.getPositionAt(offset + 1);
                        }
                        depthInArray++;
                    },
                    onArrayEnd: () => {
                        depthInArray--;
                    }
                });
            };
            getConfigurationPosition();
            if (!configurationsArrayPosition) {
                // "configurations" array doesn't exist. Add it here.
                const { tabSize, insertSpaces } = model.getOptions();
                const eol = model.getEOL();
                const edit = ((0, path_1.basename)(model.uri.fsPath) === 'launch.json') ?
                    (0, jsonEdit_1.setProperty)(model.getValue(), ['configurations'], [], { tabSize, insertSpaces, eol })[0] :
                    (0, jsonEdit_1.setProperty)(model.getValue(), ['launch'], { 'configurations': [] }, { tabSize, insertSpaces, eol })[0];
                const startPosition = model.getPositionAt(edit.offset);
                const lineNumber = startPosition.lineNumber;
                const range = new range_1.Range(lineNumber, startPosition.column, lineNumber, model.getLineMaxColumn(lineNumber));
                model.pushEditOperations(null, [editOperation_1.EditOperation.replace(range, edit.content)], () => null);
                // Go through the file again since we've edited it
                getConfigurationPosition();
            }
            if (!configurationsArrayPosition) {
                return;
            }
            this.editor.focus();
            const insertLine = (position) => {
                // Check if there are more characters on a line after a "configurations": [, if yes enter a newline
                if (model.getLineLastNonWhitespaceColumn(position.lineNumber) > position.column) {
                    this.editor.setPosition(position);
                    coreCommands_1.CoreEditingCommands.LineBreakInsert.runEditorCommand(null, this.editor, null);
                }
                this.editor.setPosition(position);
                return this.commandService.executeCommand('editor.action.insertLineAfter');
            };
            await insertLine(configurationsArrayPosition);
            await this.commandService.executeCommand('editor.action.triggerSuggest');
        }
        // Inline Decorations
        get removeInlineValuesScheduler() {
            return new async_1.RunOnceScheduler(() => {
                this.oldDecorations.clear();
            }, 100);
        }
        get updateInlineValuesScheduler() {
            const model = this.editor.getModel();
            return new async_1.RunOnceScheduler(async () => await this.updateInlineValueDecorations(this.debugService.getViewModel().focusedStackFrame), model ? this.debounceInfo.get(model) : DEAFULT_INLINE_DEBOUNCE_DELAY);
        }
        async updateInlineValueDecorations(stackFrame) {
            const var_value_format = '{0} = {1}';
            const separator = ', ';
            const model = this.editor.getModel();
            const inlineValuesSetting = this.configurationService.getValue('debug').inlineValues;
            const inlineValuesTurnedOn = inlineValuesSetting === true || inlineValuesSetting === 'on' || (inlineValuesSetting === 'auto' && model && this.languageFeaturesService.inlineValuesProvider.has(model));
            if (!inlineValuesTurnedOn || !model || !stackFrame || model.uri.toString() !== stackFrame.source.uri.toString()) {
                if (!this.removeInlineValuesScheduler.isScheduled()) {
                    this.removeInlineValuesScheduler.schedule();
                }
                return;
            }
            this.removeInlineValuesScheduler.cancel();
            const viewRanges = this.editor.getVisibleRangesPlusViewportAboveBelow();
            let allDecorations;
            if (this.languageFeaturesService.inlineValuesProvider.has(model)) {
                const findVariable = async (_key, caseSensitiveLookup) => {
                    const scopes = await stackFrame.getMostSpecificScopes(stackFrame.range);
                    const key = caseSensitiveLookup ? _key : _key.toLowerCase();
                    for (const scope of scopes) {
                        const variables = await scope.getChildren();
                        const found = variables.find(v => caseSensitiveLookup ? (v.name === key) : (v.name.toLowerCase() === key));
                        if (found) {
                            return found.value;
                        }
                    }
                    return undefined;
                };
                const ctx = {
                    frameId: stackFrame.frameId,
                    stoppedLocation: new range_1.Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1, stackFrame.range.endLineNumber, stackFrame.range.endColumn + 1)
                };
                const token = new cancellation_1.CancellationTokenSource().token;
                const providers = this.languageFeaturesService.inlineValuesProvider.ordered(model).reverse();
                allDecorations = [];
                const lineDecorations = new Map();
                const promises = (0, arrays_1.flatten)(providers.map(provider => viewRanges.map(range => Promise.resolve(provider.provideInlineValues(model, range, ctx, token)).then(async (result) => {
                    if (result) {
                        for (const iv of result) {
                            let text = undefined;
                            switch (iv.type) {
                                case 'text':
                                    text = iv.text;
                                    break;
                                case 'variable': {
                                    let va = iv.variableName;
                                    if (!va) {
                                        const lineContent = model.getLineContent(iv.range.startLineNumber);
                                        va = lineContent.substring(iv.range.startColumn - 1, iv.range.endColumn - 1);
                                    }
                                    const value = await findVariable(va, iv.caseSensitiveLookup);
                                    if (value) {
                                        text = strings.format(var_value_format, va, value);
                                    }
                                    break;
                                }
                                case 'expression': {
                                    let expr = iv.expression;
                                    if (!expr) {
                                        const lineContent = model.getLineContent(iv.range.startLineNumber);
                                        expr = lineContent.substring(iv.range.startColumn - 1, iv.range.endColumn - 1);
                                    }
                                    if (expr) {
                                        const expression = new debugModel_1.Expression(expr);
                                        await expression.evaluate(stackFrame.thread.session, stackFrame, 'watch', true);
                                        if (expression.available) {
                                            text = strings.format(var_value_format, expr, expression.value);
                                        }
                                    }
                                    break;
                                }
                            }
                            if (text) {
                                const line = iv.range.startLineNumber;
                                let lineSegments = lineDecorations.get(line);
                                if (!lineSegments) {
                                    lineSegments = [];
                                    lineDecorations.set(line, lineSegments);
                                }
                                if (!lineSegments.some(iv => iv.text === text)) { // de-dupe
                                    lineSegments.push(new InlineSegment(iv.range.startColumn, text));
                                }
                            }
                        }
                    }
                }, err => {
                    (0, errors_1.onUnexpectedExternalError)(err);
                }))));
                const startTime = Date.now();
                await Promise.all(promises);
                // update debounce info
                this.updateInlineValuesScheduler.delay = this.debounceInfo.update(model, Date.now() - startTime);
                // sort line segments and concatenate them into a decoration
                lineDecorations.forEach((segments, line) => {
                    if (segments.length > 0) {
                        segments = segments.sort((a, b) => a.column - b.column);
                        const text = segments.map(s => s.text).join(separator);
                        allDecorations.push(...createInlineValueDecoration(line, text));
                    }
                });
            }
            else {
                // old "one-size-fits-all" strategy
                const scopes = await stackFrame.getMostSpecificScopes(stackFrame.range);
                // Get all top level variables in the scope chain
                const decorationsPerScope = await Promise.all(scopes.map(async (scope) => {
                    const variables = await scope.getChildren();
                    let scopeRange = new range_1.Range(0, 0, stackFrame.range.startLineNumber, stackFrame.range.startColumn);
                    if (scope.range) {
                        scopeRange = scopeRange.setStartPosition(scope.range.startLineNumber, scope.range.startColumn);
                    }
                    const ownRanges = viewRanges.map(r => r.intersectRanges(scopeRange)).filter(types_1.isDefined);
                    this._wordToLineNumbersMap ??= new WordsToLineNumbersCache(model);
                    for (const range of ownRanges) {
                        this._wordToLineNumbersMap.ensureRangePopulated(range);
                    }
                    return createInlineValueDecorationsInsideRange(variables, ownRanges, model, this._wordToLineNumbersMap.value);
                }));
                allDecorations = (0, arrays_1.distinct)(decorationsPerScope.reduce((previous, current) => previous.concat(current), []), 
                // Deduplicate decorations since same variable can appear in multiple scopes, leading to duplicated decorations #129770
                decoration => `${decoration.range.startLineNumber}:${decoration?.options.after?.content}`);
            }
            this.oldDecorations.set(allDecorations);
        }
        dispose() {
            if (this.hoverWidget) {
                this.hoverWidget.dispose();
            }
            if (this.configurationWidget) {
                this.configurationWidget.dispose();
            }
            this.toDispose = (0, lifecycle_1.dispose)(this.toDispose);
            this.oldDecorations.clear();
        }
    };
    exports.DebugEditorContribution = DebugEditorContribution;
    __decorate([
        decorators_1.memoize
    ], DebugEditorContribution.prototype, "showHoverScheduler", null);
    __decorate([
        decorators_1.memoize
    ], DebugEditorContribution.prototype, "removeInlineValuesScheduler", null);
    __decorate([
        decorators_1.memoize
    ], DebugEditorContribution.prototype, "updateInlineValuesScheduler", null);
    exports.DebugEditorContribution = DebugEditorContribution = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, commands_1.ICommandService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, host_1.IHostService),
        __param(6, uriIdentity_1.IUriIdentityService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, languageFeatures_1.ILanguageFeaturesService),
        __param(9, languageFeatureDebounce_1.ILanguageFeatureDebounceService)
    ], DebugEditorContribution);
    class WordsToLineNumbersCache {
        constructor(model) {
            this.model = model;
            this.value = new Map();
            this.intervals = new Uint8Array(Math.ceil(model.getLineCount() / 8));
        }
        /** Ensures that variables names in the given range have been identified. */
        ensureRangePopulated(range) {
            for (let lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
                const bin = lineNumber >> 3; /* Math.floor(i / 8) */
                const bit = 1 << (lineNumber & 0b111); /* 1 << (i % 8) */
                if (!(this.intervals[bin] & bit)) {
                    getWordToLineNumbersMap(this.model, lineNumber, this.value);
                    this.intervals[bin] |= bit;
                }
            }
        }
    }
    commands_1.CommandsRegistry.registerCommand('_executeInlineValueProvider', async (accessor, uri, iRange, context) => {
        (0, types_1.assertType)(uri_1.URI.isUri(uri));
        (0, types_1.assertType)(range_1.Range.isIRange(iRange));
        if (!context || typeof context.frameId !== 'number' || !range_1.Range.isIRange(context.stoppedLocation)) {
            throw (0, errors_1.illegalArgument)('context');
        }
        const model = accessor.get(model_2.IModelService).getModel(uri);
        if (!model) {
            throw (0, errors_1.illegalArgument)('uri');
        }
        const range = range_1.Range.lift(iRange);
        const { inlineValuesProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const providers = inlineValuesProvider.ordered(model);
        const providerResults = await Promise.all(providers.map(provider => provider.provideInlineValues(model, range, context, cancellation_1.CancellationToken.None)));
        return providerResults.flat().filter(types_1.isDefined);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdFZGl0b3JDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvZGVidWdFZGl0b3JDb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbURoRyxNQUFNLHFCQUFxQixHQUFHLEdBQUcsQ0FBQyxDQUFDLHFGQUFxRjtJQUN4SCxNQUFNLDJCQUEyQixHQUFHLEdBQUcsQ0FBQyxDQUFDLHNGQUFzRjtJQUMvSCxNQUFNLHlCQUF5QixHQUFHLEdBQUcsQ0FBQyxDQUFDLG1FQUFtRTtJQUUxRyxNQUFNLDZCQUE2QixHQUFHLEdBQUcsQ0FBQztJQUU3QixRQUFBLHFCQUFxQixHQUFHLElBQUEsNkJBQWEsRUFBQywrQkFBK0IsRUFBRTtRQUNuRixJQUFJLEVBQUUsV0FBVztRQUNqQixLQUFLLEVBQUUsV0FBVztRQUNsQixNQUFNLEVBQUUsV0FBVztRQUNuQixPQUFPLEVBQUUsV0FBVztLQUNwQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUsd0NBQXdDLENBQUMsQ0FBQyxDQUFDO0lBRS9FLFFBQUEscUJBQXFCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLCtCQUErQixFQUFFO1FBQ25GLElBQUksRUFBRSxXQUFXO1FBQ2pCLEtBQUssRUFBRSxXQUFXO1FBQ2xCLE1BQU0sRUFBRSxXQUFXO1FBQ25CLE9BQU8sRUFBRSxXQUFXO0tBQ3BCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7SUFFbEcsTUFBTSxhQUFhO1FBQ2xCLFlBQW1CLE1BQWMsRUFBUyxJQUFZO1lBQW5DLFdBQU0sR0FBTixNQUFNLENBQVE7WUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ3RE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