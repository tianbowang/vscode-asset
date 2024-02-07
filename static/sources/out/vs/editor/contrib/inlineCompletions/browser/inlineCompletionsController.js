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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/inlineCompletions/browser/commandIds", "vs/editor/contrib/inlineCompletions/browser/ghostTextWidget", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsModel", "vs/editor/contrib/inlineCompletions/browser/suggestWidgetInlineCompletionProvider", "vs/nls", "vs/platform/audioCues/browser/audioCueService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding"], function (require, exports, dom_1, aria_1, lifecycle_1, observable_1, coreCommands_1, position_1, languageFeatureDebounce_1, languageFeatures_1, commandIds_1, ghostTextWidget_1, inlineCompletionContextKeys_1, inlineCompletionsHintsWidget_1, inlineCompletionsModel_1, suggestWidgetInlineCompletionProvider_1, nls_1, audioCueService_1, commands_1, configuration_1, contextkey_1, instantiation_1, keybinding_1) {
    "use strict";
    var InlineCompletionsController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionsController = void 0;
    let InlineCompletionsController = class InlineCompletionsController extends lifecycle_1.Disposable {
        static { InlineCompletionsController_1 = this; }
        static { this.ID = 'editor.contrib.inlineCompletionsController'; }
        static get(editor) {
            return editor.getContribution(InlineCompletionsController_1.ID);
        }
        constructor(editor, _instantiationService, _contextKeyService, _configurationService, _commandService, _debounceService, _languageFeaturesService, _audioCueService, _keybindingService) {
            super();
            this.editor = editor;
            this._instantiationService = _instantiationService;
            this._contextKeyService = _contextKeyService;
            this._configurationService = _configurationService;
            this._commandService = _commandService;
            this._debounceService = _debounceService;
            this._languageFeaturesService = _languageFeaturesService;
            this._audioCueService = _audioCueService;
            this._keybindingService = _keybindingService;
            this.model = (0, observable_1.disposableObservableValue)('inlineCompletionModel', undefined);
            this._textModelVersionId = (0, observable_1.observableValue)(this, -1);
            this._cursorPosition = (0, observable_1.observableValue)(this, new position_1.Position(1, 1));
            this._suggestWidgetAdaptor = this._register(new suggestWidgetInlineCompletionProvider_1.SuggestWidgetAdaptor(this.editor, () => this.model.get()?.selectedInlineCompletion.get()?.toSingleTextEdit(undefined), (tx) => this.updateObservables(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other), (item) => {
                (0, observable_1.transaction)(tx => {
                    /** @description InlineCompletionsController.handleSuggestAccepted */
                    this.updateObservables(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                    this.model.get()?.handleSuggestAccepted(item);
                });
            }));
            this._enabled = (0, observable_1.observableFromEvent)(this.editor.onDidChangeConfiguration, () => this.editor.getOption(62 /* EditorOption.inlineSuggest */).enabled);
            this._fontFamily = (0, observable_1.observableFromEvent)(this.editor.onDidChangeConfiguration, () => this.editor.getOption(62 /* EditorOption.inlineSuggest */).fontFamily);
            this._ghostTextWidget = this._register(this._instantiationService.createInstance(ghostTextWidget_1.GhostTextWidget, this.editor, {
                ghostText: this.model.map((v, reader) => /** ghostText */ v?.ghostText.read(reader)),
                minReservedLineCount: (0, observable_1.constObservable)(0),
                targetTextModel: this.model.map(v => v?.textModel),
            }));
            this._debounceValue = this._debounceService.for(this._languageFeaturesService.inlineCompletionsProvider, 'InlineCompletionsDebounce', { min: 50, max: 50 });
            this._playAudioCueSignal = (0, observable_1.observableSignal)(this);
            this._isReadonly = (0, observable_1.observableFromEvent)(this.editor.onDidChangeConfiguration, () => this.editor.getOption(90 /* EditorOption.readOnly */));
            this._textModel = (0, observable_1.observableFromEvent)(this.editor.onDidChangeModel, () => this.editor.getModel());
            this._textModelIfWritable = (0, observable_1.derived)(reader => this._isReadonly.read(reader) ? undefined : this._textModel.read(reader));
            this._register(new inlineCompletionContextKeys_1.InlineCompletionContextKeys(this._contextKeyService, this.model));
            this._register((0, observable_1.autorun)(reader => {
                /** @description InlineCompletionsController.update model */
                const textModel = this._textModelIfWritable.read(reader);
                (0, observable_1.transaction)(tx => {
                    /** @description InlineCompletionsController.onDidChangeModel/readonly */
                    this.model.set(undefined, tx);
                    this.updateObservables(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                    if (textModel) {
                        const model = _instantiationService.createInstance(inlineCompletionsModel_1.InlineCompletionsModel, textModel, this._suggestWidgetAdaptor.selectedItem, this._cursorPosition, this._textModelVersionId, this._debounceValue, (0, observable_1.observableFromEvent)(editor.onDidChangeConfiguration, () => editor.getOption(117 /* EditorOption.suggest */).preview), (0, observable_1.observableFromEvent)(editor.onDidChangeConfiguration, () => editor.getOption(117 /* EditorOption.suggest */).previewMode), (0, observable_1.observableFromEvent)(editor.onDidChangeConfiguration, () => editor.getOption(62 /* EditorOption.inlineSuggest */).mode), this._enabled);
                        this.model.set(model, tx);
                    }
                });
            }));
            const styleElement = this._register((0, dom_1.createStyleSheet2)());
            this._register((0, observable_1.autorun)(reader => {
                const fontFamily = this._fontFamily.read(reader);
                styleElement.setStyle(fontFamily === '' || fontFamily === 'default' ? `` : `
.monaco-editor .ghost-text-decoration,
.monaco-editor .ghost-text-decoration-preview,
.monaco-editor .ghost-text {
	font-family: ${fontFamily};
}`);
            }));
            const getReason = (e) => {
                if (e.isUndoing) {
                    return inlineCompletionsModel_1.VersionIdChangeReason.Undo;
                }
                if (e.isRedoing) {
                    return inlineCompletionsModel_1.VersionIdChangeReason.Redo;
                }
                if (this.model.get()?.isAcceptingPartially) {
                    return inlineCompletionsModel_1.VersionIdChangeReason.AcceptWord;
                }
                return inlineCompletionsModel_1.VersionIdChangeReason.Other;
            };
            this._register(editor.onDidChangeModelContent((e) => (0, observable_1.transaction)(tx => 
            /** @description InlineCompletionsController.onDidChangeModelContent */
            this.updateObservables(tx, getReason(e)))));
            this._register(editor.onDidChangeCursorPosition(e => (0, observable_1.transaction)(tx => {
                /** @description InlineCompletionsController.onDidChangeCursorPosition */
                this.updateObservables(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                if (e.reason === 3 /* CursorChangeReason.Explicit */ || e.source === 'api') {
                    this.model.get()?.stop(tx);
                }
            })));
            this._register(editor.onDidType(() => (0, observable_1.transaction)(tx => {
                /** @description InlineCompletionsController.onDidType */
                this.updateObservables(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                if (this._enabled.get()) {
                    this.model.get()?.trigger(tx);
                }
            })));
            this._register(this._commandService.onDidExecuteCommand((e) => {
                // These commands don't trigger onDidType.
                const commands = new Set([
                    coreCommands_1.CoreEditingCommands.Tab.id,
                    coreCommands_1.CoreEditingCommands.DeleteLeft.id,
                    coreCommands_1.CoreEditingCommands.DeleteRight.id,
                    commandIds_1.inlineSuggestCommitId,
                    'acceptSelectedSuggestion',
                ]);
                if (commands.has(e.commandId) && editor.hasTextFocus() && this._enabled.get()) {
                    (0, observable_1.transaction)(tx => {
                        /** @description onDidExecuteCommand */
                        this.model.get()?.trigger(tx);
                    });
                }
            }));
            this._register(this.editor.onDidBlurEditorWidget(() => {
                // This is a hidden setting very useful for debugging
                if (this._contextKeyService.getContextKeyValue('accessibleViewIsShown') || this._configurationService.getValue('editor.inlineSuggest.keepOnBlur') ||
                    editor.getOption(62 /* EditorOption.inlineSuggest */).keepOnBlur) {
                    return;
                }
                if (inlineCompletionsHintsWidget_1.InlineSuggestionHintsContentWidget.dropDownVisible) {
                    return;
                }
                (0, observable_1.transaction)(tx => {
                    /** @description InlineCompletionsController.onDidBlurEditorWidget */
                    this.model.get()?.stop(tx);
                });
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description InlineCompletionsController.forceRenderingAbove */
                const state = this.model.read(reader)?.state.read(reader);
                if (state?.suggestItem) {
                    if (state.ghostText.lineCount >= 2) {
                        this._suggestWidgetAdaptor.forceRenderingAbove();
                    }
                }
                else {
                    this._suggestWidgetAdaptor.stopForceRenderingAbove();
                }
            }));
            this._register((0, lifecycle_1.toDisposable)(() => {
                this._suggestWidgetAdaptor.stopForceRenderingAbove();
            }));
            let lastInlineCompletionId = undefined;
            this._register((0, observable_1.autorunHandleChanges)({
                handleChange: (context, changeSummary) => {
                    if (context.didChange(this._playAudioCueSignal)) {
                        lastInlineCompletionId = undefined;
                    }
                    return true;
                },
            }, async (reader) => {
                /** @description InlineCompletionsController.playAudioCueAndReadSuggestion */
                this._playAudioCueSignal.read(reader);
                const model = this.model.read(reader);
                const state = model?.state.read(reader);
                if (!model || !state || !state.inlineCompletion) {
                    lastInlineCompletionId = undefined;
                    return;
                }
                if (state.inlineCompletion.semanticId !== lastInlineCompletionId) {
                    lastInlineCompletionId = state.inlineCompletion.semanticId;
                    const lineText = model.textModel.getLineContent(state.ghostText.lineNumber);
                    this._audioCueService.playAudioCue(audioCueService_1.AudioCue.inlineSuggestion).then(() => {
                        if (this.editor.getOption(8 /* EditorOption.screenReaderAnnounceInlineSuggestion */)) {
                            this.provideScreenReaderUpdate(state.ghostText.renderForScreenReader(lineText));
                        }
                    });
                }
            }));
            this._register(new inlineCompletionsHintsWidget_1.InlineCompletionsHintsWidget(this.editor, this.model, this._instantiationService));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('accessibility.verbosity.inlineCompletions')) {
                    this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this._configurationService.getValue('accessibility.verbosity.inlineCompletions') });
                }
            }));
            this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this._configurationService.getValue('accessibility.verbosity.inlineCompletions') });
        }
        playAudioCue(tx) {
            this._playAudioCueSignal.trigger(tx);
        }
        provideScreenReaderUpdate(content) {
            const accessibleViewShowing = this._contextKeyService.getContextKeyValue('accessibleViewIsShown');
            const accessibleViewKeybinding = this._keybindingService.lookupKeybinding('editor.action.accessibleView');
            let hint;
            if (!accessibleViewShowing && accessibleViewKeybinding && this.editor.getOption(147 /* EditorOption.inlineCompletionsAccessibilityVerbose */)) {
                hint = (0, nls_1.localize)('showAccessibleViewHint', "Inspect this in the accessible view ({0})", accessibleViewKeybinding.getAriaLabel());
            }
            hint ? (0, aria_1.alert)(content + ', ' + hint) : (0, aria_1.alert)(content);
        }
        /**
         * Copies over the relevant state from the text model to observables.
         * This solves all kind of eventing issues, as we make sure we always operate on the latest state,
         * regardless of who calls into us.
         */
        updateObservables(tx, changeReason) {
            const newModel = this.editor.getModel();
            this._textModelVersionId.set(newModel?.getVersionId() ?? -1, tx, changeReason);
            this._cursorPosition.set(this.editor.getPosition() ?? new position_1.Position(1, 1), tx);
        }
        shouldShowHoverAt(range) {
            const ghostText = this.model.get()?.ghostText.get();
            if (ghostText) {
                return ghostText.parts.some(p => range.containsPosition(new position_1.Position(ghostText.lineNumber, p.column)));
            }
            return false;
        }
        shouldShowHoverAtViewZone(viewZoneId) {
            return this._ghostTextWidget.ownsViewZone(viewZoneId);
        }
        hide() {
            (0, observable_1.transaction)(tx => {
                this.model.get()?.stop(tx);
            });
        }
    };
    exports.InlineCompletionsController = InlineCompletionsController;
    exports.InlineCompletionsController = InlineCompletionsController = InlineCompletionsController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, commands_1.ICommandService),
        __param(5, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(6, languageFeatures_1.ILanguageFeaturesService),
        __param(7, audioCueService_1.IAudioCueService),
        __param(8, keybinding_1.IKeybindingService)
    ], InlineCompletionsController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbnNDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy9icm93c2VyL2lubGluZUNvbXBsZXRpb25zQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNkJ6RixJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVOztpQkFDbkQsT0FBRSxHQUFHLDRDQUE0QyxBQUEvQyxDQUFnRDtRQUVsRCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQW1CO1lBQ3BDLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBOEIsNkJBQTJCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUYsQ0FBQztRQXNDRCxZQUNpQixNQUFtQixFQUNaLHFCQUE2RCxFQUNoRSxrQkFBdUQsRUFDcEQscUJBQTZELEVBQ25FLGVBQWlELEVBQ2pDLGdCQUFrRSxFQUN6RSx3QkFBbUUsRUFDM0UsZ0JBQW1ELEVBQ2pELGtCQUF1RDtZQUUzRSxLQUFLLEVBQUUsQ0FBQztZQVZRLFdBQU0sR0FBTixNQUFNLENBQWE7WUFDSywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQy9DLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDbkMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNsRCxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFpQztZQUN4RCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQzFELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDaEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQTdDNUQsVUFBSyxHQUFHLElBQUEsc0NBQXlCLEVBQXFDLHVCQUF1QixFQUFF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