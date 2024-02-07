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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/characterClassifier", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/format/browser/format", "vs/editor/contrib/format/browser/formattingEdit", "vs/nls", "vs/platform/audioCues/browser/audioCueService", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress"], function (require, exports, arrays_1, cancellation_1, errors_1, keyCodes_1, lifecycle_1, editorExtensions_1, codeEditorService_1, characterClassifier_1, range_1, editorContextKeys_1, editorWorker_1, languageFeatures_1, format_1, formattingEdit_1, nls, audioCueService_1, commands_1, contextkey_1, instantiation_1, progress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormatOnType = void 0;
    let FormatOnType = class FormatOnType {
        static { this.ID = 'editor.contrib.autoFormat'; }
        constructor(_editor, _languageFeaturesService, _workerService, _audioCueService) {
            this._editor = _editor;
            this._languageFeaturesService = _languageFeaturesService;
            this._workerService = _workerService;
            this._audioCueService = _audioCueService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._sessionDisposables = new lifecycle_1.DisposableStore();
            this._disposables.add(_languageFeaturesService.onTypeFormattingEditProvider.onDidChange(this._update, this));
            this._disposables.add(_editor.onDidChangeModel(() => this._update()));
            this._disposables.add(_editor.onDidChangeModelLanguage(() => this._update()));
            this._disposables.add(_editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(56 /* EditorOption.formatOnType */)) {
                    this._update();
                }
            }));
            this._update();
        }
        dispose() {
            this._disposables.dispose();
            this._sessionDisposables.dispose();
        }
        _update() {
            // clean up
            this._sessionDisposables.clear();
            // we are disabled
            if (!this._editor.getOption(56 /* EditorOption.formatOnType */)) {
                return;
            }
            // no model
            if (!this._editor.hasModel()) {
                return;
            }
            const model = this._editor.getModel();
            // no support
            const [support] = this._languageFeaturesService.onTypeFormattingEditProvider.ordered(model);
            if (!support || !support.autoFormatTriggerCharacters) {
                return;
            }
            // register typing listeners that will trigger the format
            const triggerChars = new characterClassifier_1.CharacterSet();
            for (const ch of support.autoFormatTriggerCharacters) {
                triggerChars.add(ch.charCodeAt(0));
            }
            this._sessionDisposables.add(this._editor.onDidType((text) => {
                const lastCharCode = text.charCodeAt(text.length - 1);
                if (triggerChars.has(lastCharCode)) {
                    this._trigger(String.fromCharCode(lastCharCode));
                }
            }));
        }
        _trigger(ch) {
            if (!this._editor.hasModel()) {
                return;
            }
            if (this._editor.getSelections().length > 1 || !this._editor.getSelection().isEmpty()) {
                return;
            }
            const model = this._editor.getModel();
            const position = this._editor.getPosition();
            const cts = new cancellation_1.CancellationTokenSource();
            // install a listener that checks if edits happens before the
            // position on which we format right now. If so, we won't
            // apply the format edits
            const unbind = this._editor.onDidChangeModelContent((e) => {
                if (e.isFlush) {
                    // a model.setValue() was called
                    // cancel only once
                    cts.cancel();
                    unbind.dispose();
                    return;
                }
                for (let i = 0, len = e.changes.length; i < len; i++) {
                    const change = e.changes[i];
                    if (change.range.endLineNumber <= position.lineNumber) {
                        // cancel only once
                        cts.cancel();
                        unbind.dispose();
                        return;
                    }
                }
            });
            (0, format_1.getOnTypeFormattingEdits)(this._workerService, this._languageFeaturesService, model, position, ch, model.getFormattingOptions(), cts.token).then(edits => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                if ((0, arrays_1.isNonEmptyArray)(edits)) {
                    this._audioCueService.playAudioCue(audioCueService_1.AudioCue.format, { userGesture: false });
                    formattingEdit_1.FormattingEdit.execute(this._editor, edits, true);
                }
            }).finally(() => {
                unbind.dispose();
            });
        }
    };
    exports.FormatOnType = FormatOnType;
    exports.FormatOnType = FormatOnType = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, editorWorker_1.IEditorWorkerService),
        __param(3, audioCueService_1.IAudioCueService)
    ], FormatOnType);
    let FormatOnPaste = class FormatOnPaste {
        static { this.ID = 'editor.contrib.formatOnPaste'; }
        constructor(editor, _languageFeaturesService, _instantiationService) {
            this.editor = editor;
            this._languageFeaturesService = _languageFeaturesService;
            this._instantiationService = _instantiationService;
            this._callOnDispose = new lifecycle_1.DisposableStore();
            this._callOnModel = new lifecycle_1.DisposableStore();
            this._callOnDispose.add(editor.onDidChangeConfiguration(() => this._update()));
            this._callOnDispose.add(editor.onDidChangeModel(() => this._update()));
            this._callOnDispose.add(editor.onDidChangeModelLanguage(() => this._update()));
            this._callOnDispose.add(_languageFeaturesService.documentRangeFormattingEditProvider.onDidChange(this._update, this));
        }
        dispose() {
            this._callOnDispose.dispose();
            this._callOnModel.dispose();
        }
        _update() {
            // clean up
            this._callOnModel.clear();
            // we are disabled
            if (!this.editor.getOption(55 /* EditorOption.formatOnPaste */)) {
                return;
            }
            // no model
            if (!this.editor.hasModel()) {
                return;
            }
            // no formatter
            if (!this._languageFeaturesService.documentRangeFormattingEditProvider.has(this.editor.getModel())) {
                return;
            }
            this._callOnModel.add(this.editor.onDidPaste(({ range }) => this._trigger(range)));
        }
        _trigger(range) {
            if (!this.editor.hasModel()) {
                return;
            }
            if (this.editor.getSelections().length > 1) {
                return;
            }
            this._instantiationService.invokeFunction(format_1.formatDocumentRangesWithSelectedProvider, this.editor, range, 2 /* FormattingMode.Silent */, progress_1.Progress.None, cancellation_1.CancellationToken.None, false).catch(errors_1.onUnexpectedError);
        }
    };
    FormatOnPaste = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, instantiation_1.IInstantiationService)
    ], FormatOnPaste);
    class FormatDocumentAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.formatDocument',
                label: nls.localize('formatDocument.label', "Format Document"),
                alias: 'Format Document',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.notInCompositeEditor, editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasDocumentFormattingProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 39 /* KeyCode.KeyI */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.3
                }
            });
        }
        async run(accessor, editor) {
            if (editor.hasModel()) {
                const instaService = accessor.get(instantiation_1.IInstantiationService);
                const progressService = accessor.get(progress_1.IEditorProgressService);
                await progressService.showWhile(instaService.invokeFunction(format_1.formatDocumentWithSelectedProvider, editor, 1 /* FormattingMode.Explicit */, progress_1.Progress.None, cancellation_1.CancellationToken.None, true), 250);
            }
        }
    }
    class FormatSelectionAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.formatSelection',
                label: nls.localize('formatSelection.label', "Format Selection"),
                alias: 'Format Selection',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasDocumentSelectionFormattingProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    when: editorContextKeys_1.EditorContextKeys.hasNonEmptySelection,
                    group: '1_modification',
                    order: 1.31
                }
            });
        }
        async run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const model = editor.getModel();
            const ranges = editor.getSelections().map(range => {
                return range.isEmpty()
                    ? new range_1.Range(range.startLineNumber, 1, range.startLineNumber, model.getLineMaxColumn(range.startLineNumber))
                    : range;
            });
            const progressService = accessor.get(progress_1.IEditorProgressService);
            await progressService.showWhile(instaService.invokeFunction(format_1.formatDocumentRangesWithSelectedProvider, editor, ranges, 1 /* FormattingMode.Explicit */, progress_1.Progress.None, cancellation_1.CancellationToken.None, true), 250);
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(FormatOnType.ID, FormatOnType, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorContribution)(FormatOnPaste.ID, FormatOnPaste, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorAction)(FormatDocumentAction);
    (0, editorExtensions_1.registerEditorAction)(FormatSelectionAction);
    // this is the old format action that does both (format document OR format selection)
    // and we keep it here such that existing keybinding configurations etc will still work
    commands_1.CommandsRegistry.registerCommand('editor.action.format', async (accessor) => {
        const editor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
        if (!editor || !editor.hasModel()) {
            return;
        }
        const commandService = accessor.get(commands_1.ICommandService);
        if (editor.getSelection().isEmpty()) {
            await commandService.executeCommand('editor.action.formatDocument');
        }
        else {
            await commandService.executeCommand('editor.action.formatSelection');
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZm9ybWF0L2Jyb3dzZXIvZm9ybWF0QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEyQnpGLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQVk7aUJBRUQsT0FBRSxHQUFHLDJCQUEyQixBQUE5QixDQUErQjtRQU14RCxZQUNrQixPQUFvQixFQUNYLHdCQUFtRSxFQUN2RSxjQUFxRCxFQUN6RCxnQkFBbUQ7WUFIcEQsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNNLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDdEQsbUJBQWMsR0FBZCxjQUFjLENBQXNCO1lBQ3hDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFQckQsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNyQyx3QkFBbUIsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQVE1RCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlFLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyx3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