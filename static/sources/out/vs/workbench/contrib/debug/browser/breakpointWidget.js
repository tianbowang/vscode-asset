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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/button/button", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/debug/common/debug", "vs/css!./media/breakpointWidget"], function (require, exports, dom, keyboardEvent_1, button_1, selectBox_1, errors_1, lifecycle, uri_1, editorExtensions_1, codeEditorService_1, codeEditorWidget_1, position_1, range_1, editorContextKeys_1, modesRegistry_1, languageFeatures_1, model_1, resolverService_1, suggest_1, zoneWidget_1, nls, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, keybinding_1, label_1, defaultStyles_1, colorRegistry_1, themeService_1, simpleEditorOptions_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreakpointWidget = void 0;
    const $ = dom.$;
    const IPrivateBreakpointWidgetService = (0, instantiation_1.createDecorator)('privateBreakpointWidgetService');
    const DECORATION_KEY = 'breakpointwidgetdecoration';
    function isPositionInCurlyBracketBlock(input) {
        const model = input.getModel();
        const bracketPairs = model.bracketPairs.getBracketPairsInRange(range_1.Range.fromPositions(input.getPosition()));
        return bracketPairs.some(p => p.openingBracketInfo.bracketText === '{');
    }
    function createDecorations(theme, placeHolder) {
        const transparentForeground = theme.getColor(colorRegistry_1.editorForeground)?.transparent(0.4);
        return [{
                range: {
                    startLineNumber: 0,
                    endLineNumber: 0,
                    startColumn: 0,
                    endColumn: 1
                },
                renderOptions: {
                    after: {
                        contentText: placeHolder,
                        color: transparentForeground ? transparentForeground.toString() : undefined
                    }
                }
            }];
    }
    let BreakpointWidget = class BreakpointWidget extends zoneWidget_1.ZoneWidget {
        constructor(editor, lineNumber, column, context, contextViewService, debugService, themeService, contextKeyService, instantiationService, modelService, codeEditorService, _configurationService, languageFeaturesService, keybindingService, labelService, textModelService) {
            super(editor, { showFrame: true, showArrow: false, frameWidth: 1, isAccessible: true });
            this.lineNumber = lineNumber;
            this.column = column;
            this.contextViewService = contextViewService;
            this.debugService = debugService;
            this.themeService = themeService;
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.codeEditorService = codeEditorService;
            this._configurationService = _configurationService;
            this.languageFeaturesService = languageFeaturesService;
            this.keybindingService = keybindingService;
            this.labelService = labelService;
            this.textModelService = textModelService;
            this.conditionInput = '';
            this.hitCountInput = '';
            this.logMessageInput = '';
            this.toDispose = [];
            const model = this.editor.getModel();
            if (model) {
                const uri = model.uri;
                const breakpoints = this.debugService.getModel().getBreakpoints({ lineNumber: this.lineNumber, column: this.column, uri });
                this.breakpoint = breakpoints.length ? breakpoints[0] : undefined;
            }
            if (context === undefined) {
                if (this.breakpoint && !this.breakpoint.condition && !this.breakpoint.hitCondition && this.breakpoint.logMessage) {
                    this.context = 2 /* Context.LOG_MESSAGE */;
                }
                else if (this.breakpoint && !this.breakpoint.condition && this.breakpoint.hitCondition) {
                    this.context = 1 /* Context.HIT_COUNT */;
                }
                else if (this.breakpoint && this.breakpoint.triggeredBy) {
                    this.context = 3 /* Context.TRIGGER_POINT */;
                }
                else {
                    this.context = 0 /* Context.CONDITION */;
                }
            }
            else {
                this.context = context;
            }
            this.toDispose.push(this.debugService.getModel().onDidChangeBreakpoints(e => {
                if (this.breakpoint && e && e.removed && e.removed.indexOf(this.breakpoint) >= 0) {
                    this.dispose();
                }
            }));
            this.codeEditorService.registerDecorationType('breakpoint-widget', DECORATION_KEY, {});
            this.create();
        }
        get placeholder() {
            const acceptString = this.keybindingService.lookupKeybinding(AcceptBreakpointWidgetInputAction.ID)?.getLabel() || 'Enter';
            const closeString = this.keybindingService.lookupKeybinding(CloseBreakpointWidgetCommand.ID)?.getLabel() || 'Escape';
            switch (this.context) {
                case 2 /* Context.LOG_MESSAGE */:
                    return nls.localize('breakpointWidgetLogMessagePlaceholder', "Message to log when breakpoint is hit. Expressions within {} are interpolated. '{0}' to accept, '{1}' to cancel.", acceptString, closeString);
                case 1 /* Context.HIT_COUNT */:
                    return nls.localize('breakpointWidgetHitCountPlaceholder', "Break when hit count condition is met. '{0}' to accept, '{1}' to cancel.", acceptString, closeString);
                default:
                    return nls.localize('breakpointWidgetExpressionPlaceholder', "Break when expression evaluates to true. '{0}' to accept, '{1}' to cancel.", acceptString, closeString);
            }
        }
        getInputValue(breakpoint) {
            switch (this.context) {
                case 2 /* Context.LOG_MESSAGE */:
                    return breakpoint && breakpoint.logMessage ? breakpoint.logMessage : this.logMessageInput;
                case 1 /* Context.HIT_COUNT */:
                    return breakpoint && breakpoint.hitCondition ? breakpoint.hitCondition : this.hitCountInput;
                default:
                    return breakpoint && breakpoint.condition ? breakpoint.condition : this.conditionInput;
            }
        }
        rememberInput() {
            if (this.context !== 3 /* Context.TRIGGER_POINT */) {
                const value = this.input.getModel().getValue();
                switch (this.context) {
                    case 2 /* Context.LOG_MESSAGE */:
                        this.logMessageInput = value;
                        break;
                    case 1 /* Context.HIT_COUNT */:
                        this.hitCountInput = value;
                        break;
                    default:
                        this.conditionInput = value;
                }
            }
        }
        setInputMode() {
            if (this.editor.hasModel()) {
                // Use plaintext language for log messages, otherwise respect underlying editor language #125619
                const languageId = this.context === 2 /* Context.LOG_MESSAGE */ ? modesRegistry_1.PLAINTEXT_LANGUAGE_ID : this.editor.getModel().getLanguageId();
                this.input.getModel().setLanguage(languageId);
            }
        }
        show(rangeOrPos) {
            const lineNum = this.input.getModel().getLineCount();
            super.show(rangeOrPos, lineNum + 1);
        }
        fitHeightToContent() {
            const lineNum = this.input.getModel().getLineCount();
            this._relayout(lineNum + 1);
        }
        _fillContainer(container) {
            this.setCssClass('breakpoint-widget');
            const selectBox = new selectBox_1.SelectBox([
                { text: nls.localize('expression', "Expression") },
                { text: nls.localize('hitCount', "Hit Count") },
                { text: nls.localize('logMessage', "Log Message") },
                { text: nls.localize('triggeredBy', "Wait for Breakpoint") },
            ], this.context, this.contextViewService, defaultStyles_1.defaultSelectBoxStyles, { ariaLabel: nls.localize('breakpointType', 'Breakpoint Type') });
            this.selectContainer = $('.breakpoint-select-container');
            selectBox.render(dom.append(container, this.selectContainer));
            selectBox.onDidSelect(e => {
                this.rememberInput();
                this.context = e.index;
                this.updateContextInput();
            });
            this.inputContainer = $('.inputContainer');
            this.createBreakpointInput(dom.append(container, this.inputContainer));
            this.input.getModel().setValue(this.getInputValue(this.breakpoint));
            this.toDispose.push(this.input.getModel().onDidChangeContent(() => {
                this.fitHeightToContent();
            }));
            this.input.setPosition({ lineNumber: 1, column: this.input.getModel().getLineMaxColumn(1) });
            this.createTriggerBreakpointInput(container);
            this.updateContextInput();
            // Due to an electron bug we have to do the timeout, otherwise we do not get focus
            setTimeout(() => this.focusInput(), 150);
        }
        createTriggerBreakpointInput(container) {
            const breakpoints = this.debugService.getModel().getBreakpoints().filter(bp => bp !== this.breakpoint);
            const index = breakpoints.findIndex((bp) => this.breakpoint?.triggeredBy === bp.getId());
            let select = 0;
            if (index > -1) {
                select = index + 1;
            }
            Promise.all(breakpoints.map(async (bp) => ({
                text: `${this.labelService.getUriLabel(bp.uri, { relative: true })}: ${bp.lineNumber}`,
                description: await this.textModelService.createModelReference(bp.uri).then(ref => {
                    try {
                        return ref.object.textEditorModel.getLineContent(bp.lineNumber).trim();
                    }
                    finally {
                        ref.dispose();
                    }
                }, () => undefined),
            }))).then(breakpoints => {
                selectBreakpointBox.setOptions([
                    { text: nls.localize('noTriggerByBreakpoint', 'None') },
                    ...breakpoints
                ], select);
            });
            const selectBreakpointBox = this.selectBreakpointBox = new selectBox_1.SelectBox([{ text: nls.localize('triggerByLoading', 'Loading...'), isDisabled: true }], 0, this.contextViewService, defaultStyles_1.defaultSelectBoxStyles, { ariaLabel: nls.localize('selectBreakpoint', 'Select breakpoint') });
            selectBreakpointBox.onDidSelect(e => {
                if (e.index === 0) {
                    this.triggeredByBreakpointInput = undefined;
                }
                else {
                    this.triggeredByBreakpointInput = breakpoints[e.index - 1];
                }
            });
            this.toDispose.push(selectBreakpointBox);
            this.selectBreakpointContainer = $('.select-breakpoint-container');
            this.toDispose.push(dom.addDisposableListener(this.selectBreakpointContainer, dom.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(9 /* KeyCode.Escape */)) {
                    this.close(false);
                }
            }));
            const selectionWrapper = $('.select-box-container');
            dom.append(this.selectBreakpointContainer, selectionWrapper);
            selectBreakpointBox.render(selectionWrapper);
            dom.append(container, this.selectBreakpointContainer);
            const closeButton = new button_1.Button(this.selectBreakpointContainer, defaultStyles_1.defaultButtonStyles);
            closeButton.label = nls.localize('ok', "Ok");
            this.toDispose.push(closeButton.onDidClick(() => this.close(true)));
            this.toDispose.push(closeButton);
        }
        updateContextInput() {
            if (this.context === 3 /* Context.TRIGGER_POINT */) {
                this.inputContainer.hidden = true;
                this.selectBreakpointContainer.hidden = false;
            }
            else {
                this.inputContainer.hidden = false;
                this.selectBreakpointContainer.hidden = true;
                this.setInputMode();
                const value = this.getInputValue(this.breakpoint);
                this.input.getModel().setValue(value);
                this.focusInput();
            }
        }
        _doLayout(heightInPixel, widthInPixel) {
            this.heightInPx = heightInPixel;
            this.input.layout({ height: heightInPixel, width: widthInPixel - 113 });
            this.centerInputVertically();
        }
        _onWidth(widthInPixel) {
            if (typeof this.heightInPx === 'number') {
                this._doLayout(this.heightInPx, widthInPixel);
            }
        }
        createBreakpointInput(container) {
            const scopedContextKeyService = this.contextKeyService.createScoped(container);
            this.toDispose.push(scopedContextKeyService);
            const scopedInstatiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, scopedContextKeyService], [IPrivateBreakpointWidgetService, this]));
            const options = this.createEditorOptions();
            const codeEditorWidgetOptions = (0, simpleEditorOptions_1.getSimpleCodeEditorWidgetOptions)();
            this.input = scopedInstatiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, container, options, codeEditorWidgetOptions);
            debug_1.CONTEXT_IN_BREAKPOINT_WIDGET.bindTo(scopedContextKeyService).set(true);
            const model = this.modelService.createModel('', null, uri_1.URI.parse(`${debug_1.DEBUG_SCHEME}:${this.editor.getId()}:breakpointinput`), true);
            if (this.editor.hasModel()) {
                model.setLanguage(this.editor.getModel().getLanguageId());
            }
            this.input.setModel(model);
            this.setInputMode();
            this.toDispose.push(model);
            const setDecorations = () => {
                const value = this.input.getModel().getValue();
                const decorations = !!value ? [] : createDecorations(this.themeService.getColorTheme(), this.placeholder);
                this.input.setDecorationsByType('breakpoint-widget', DECORATION_KEY, decorations);
            };
            this.input.getModel().onDidChangeContent(() => setDecorations());
            this.themeService.onDidColorThemeChange(() => setDecorations());
            this.toDispose.push(this.languageFeaturesService.completionProvider.register({ scheme: debug_1.DEBUG_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'breakpointWidget',
                provideCompletionItems: (model, position, _context, token) => {
                    let suggestionsPromise;
                    const underlyingModel = this.editor.getModel();
                    if (underlyingModel && (this.context === 0 /* Context.CONDITION */ || (this.context === 2 /* Context.LOG_MESSAGE */ && isPositionInCurlyBracketBlock(this.input)))) {
                        suggestionsPromise = (0, suggest_1.provideSuggestionItems)(this.languageFeaturesService.completionProvider, underlyingModel, new position_1.Position(this.lineNumber, 1), new suggest_1.CompletionOptions(undefined, new Set().add(27 /* CompletionItemKind.Snippet */)), _context, token).then(suggestions => {
                            let overwriteBefore = 0;
                            if (this.context === 0 /* Context.CONDITION */) {
                                overwriteBefore = position.column - 1;
                            }
                            else {
                                // Inside the currly brackets, need to count how many useful characters are behind the position so they would all be taken into account
                                const value = this.input.getModel().getValue();
                                while ((position.column - 2 - overwriteBefore >= 0) && value[position.column - 2 - overwriteBefore] !== '{' && value[position.column - 2 - overwriteBefore] !== ' ') {
                                    overwriteBefore++;
                                }
                            }
                            return {
                                suggestions: suggestions.items.map(s => {
                                    s.completion.range = range_1.Range.fromPositions(position.delta(0, -overwriteBefore), position);
                                    return s.completion;
                                })
                            };
                        });
                    }
                    else {
                        suggestionsPromise = Promise.resolve({ suggestions: [] });
                    }
                    return suggestionsPromise;
                }
            }));
            this.toDispose.push(this._configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('editor.fontSize') || e.affectsConfiguration('editor.lineHeight')) {
                    this.input.updateOptions(this.createEditorOptions());
                    this.centerInputVertically();
                }
            }));
        }
        createEditorOptions() {
            const editorConfig = this._configurationService.getValue('editor');
            const options = (0, simpleEditorOptions_1.getSimpleEditorOptions)(this._configurationService);
            options.fontSize = editorConfig.fontSize;
            options.fontFamily = editorConfig.fontFamily;
            options.lineHeight = editorConfig.lineHeight;
            options.fontLigatures = editorConfig.fontLigatures;
            options.ariaLabel = this.placeholder;
            return options;
        }
        centerInputVertically() {
            if (this.container && typeof this.heightInPx === 'number') {
                const lineHeight = this.input.getOption(66 /* EditorOption.lineHeight */);
                const lineNum = this.input.getModel().getLineCount();
                const newTopMargin = (this.heightInPx - lineNum * lineHeight) / 2;
                this.inputContainer.style.marginTop = newTopMargin + 'px';
            }
        }
        close(success) {
            if (success) {
                // if there is already a breakpoint on this location - remove it.
                let condition = this.breakpoint && this.breakpoint.condition;
                let hitCondition = this.breakpoint && this.breakpoint.hitCondition;
                let logMessage = this.breakpoint && this.breakpoint.logMessage;
                let triggeredBy = this.breakpoint && this.breakpoint.triggeredBy;
                this.rememberInput();
                if (this.conditionInput || this.context === 0 /* Context.CONDITION */) {
                    condition = this.conditionInput;
                }
                if (this.hitCountInput || this.context === 1 /* Context.HIT_COUNT */) {
                    hitCondition = this.hitCountInput;
                }
                if (this.logMessageInput || this.context === 2 /* Context.LOG_MESSAGE */) {
                    logMessage = this.logMessageInput;
                }
                if (this.context === 3 /* Context.TRIGGER_POINT */) {
                    // currently, trigger points don't support additional conditions:
                    condition = undefined;
                    hitCondition = undefined;
                    logMessage = undefined;
                    triggeredBy = this.triggeredByBreakpointInput?.getId();
                }
                if (this.breakpoint) {
                    const data = new Map();
                    data.set(this.breakpoint.getId(), {
                        condition,
                        hitCondition,
                        logMessage,
                        triggeredBy
                    });
                    this.debugService.updateBreakpoints(this.breakpoint.originalUri, data, false).then(undefined, errors_1.onUnexpectedError);
                }
                else {
                    const model = this.editor.getModel();
                    if (model) {
                        this.debugService.addBreakpoints(model.uri, [{
                                lineNumber: this.lineNumber,
                                column: this.column,
                                enabled: true,
                                condition,
                                hitCondition,
                                logMessage,
                                triggeredBy
                            }]);
                    }
                }
            }
            this.dispose();
        }
        focusInput() {
            if (this.context === 3 /* Context.TRIGGER_POINT */) {
                this.selectBreakpointBox.focus();
            }
            else {
                this.input.focus();
            }
        }
        dispose() {
            super.dispose();
            this.input.dispose();
            lifecycle.dispose(this.toDispose);
            setTimeout(() => this.editor.focus(), 0);
        }
    };
    exports.BreakpointWidget = BreakpointWidget;
    exports.BreakpointWidget = BreakpointWidget = __decorate([
        __param(4, contextView_1.IContextViewService),
        __param(5, debug_1.IDebugService),
        __param(6, themeService_1.IThemeService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, model_1.IModelService),
        __param(10, codeEditorService_1.ICodeEditorService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, languageFeatures_1.ILanguageFeaturesService),
        __param(13, keybinding_1.IKeybindingService),
        __param(14, label_1.ILabelService),
        __param(15, resolverService_1.ITextModelService)
    ], BreakpointWidget);
    class AcceptBreakpointWidgetInputAction extends editorExtensions_1.EditorCommand {
        static { this.ID = 'breakpointWidget.action.acceptInput'; }
        constructor() {
            super({
                id: AcceptBreakpointWidgetInputAction.ID,
                precondition: debug_1.CONTEXT_BREAKPOINT_WIDGET_VISIBLE,
                kbOpts: {
                    kbExpr: debug_1.CONTEXT_IN_BREAKPOINT_WIDGET,
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        runEditorCommand(accessor, editor) {
            accessor.get(IPrivateBreakpointWidgetService).close(true);
        }
    }
    class CloseBreakpointWidgetCommand extends editorExtensions_1.EditorCommand {
        static { this.ID = 'closeBreakpointWidget'; }
        constructor() {
            super({
                id: CloseBreakpointWidgetCommand.ID,
                precondition: debug_1.CONTEXT_BREAKPOINT_WIDGET_VISIBLE,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 9 /* KeyCode.Escape */,
                    secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        runEditorCommand(accessor, editor, args) {
            const debugContribution = editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID);
            if (debugContribution) {
                // if focus is in outer editor we need to use the debug contribution to close
                return debugContribution.closeBreakpointWidget();
            }
            accessor.get(IPrivateBreakpointWidgetService).close(false);
        }
    }
    (0, editorExtensions_1.registerEditorCommand)(new AcceptBreakpointWidgetInputAction());
    (0, editorExtensions_1.registerEditorCommand)(new CloseBreakpointWidgetCommand());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWtwb2ludFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9icmVha3BvaW50V2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTRDaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNoQixNQUFNLCtCQUErQixHQUFHLElBQUEsK0JBQWUsRUFBa0MsZ0NBQWdDLENBQUMsQ0FBQztJQUszSCxNQUFNLGNBQWMsR0FBRyw0QkFBNEIsQ0FBQztJQUVwRCxTQUFTLDZCQUE2QixDQUFDLEtBQXdCO1FBQzlELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMvQixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLHNCQUFzQixDQUFDLGFBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RyxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsV0FBVyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRCxTQUFTLGlCQUFpQixDQUFDLEtBQWtCLEVBQUUsV0FBbUI7UUFDakUsTUFBTSxxQkFBcUIsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLGdDQUFnQixDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pGLE9BQU8sQ0FBQztnQkFDUCxLQUFLLEVBQUU7b0JBQ04sZUFBZSxFQUFFLENBQUM7b0JBQ2xCLGFBQWEsRUFBRSxDQUFDO29CQUNoQixXQUFXLEVBQUUsQ0FBQztvQkFDZCxTQUFTLEVBQUUsQ0FBQztpQkFDWjtnQkFDRCxhQUFh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