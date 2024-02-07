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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/codeEditorService", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/editor/contrib/format/browser/format", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/format/browser/formatModified", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, lifecycle_1, strings, editorBrowser_1, codeEditorService_1, trimTrailingWhitespaceCommand_1, editOperation_1, position_1, range_1, languageFeatures_1, codeAction_1, types_1, format_1, snippetController2_1, nls_1, configuration_1, instantiation_1, progress_1, platform_1, contributions_1, formatModified_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SaveParticipantsContribution = exports.TrimFinalNewLinesParticipant = exports.FinalNewLineParticipant = exports.TrimWhitespaceParticipant = void 0;
    let TrimWhitespaceParticipant = class TrimWhitespaceParticipant {
        constructor(configurationService, codeEditorService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            // Nothing
        }
        async participate(model, env) {
            if (!model.textEditorModel) {
                return;
            }
            if (this.configurationService.getValue('files.trimTrailingWhitespace', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
                this.doTrimTrailingWhitespace(model.textEditorModel, env.reason === 2 /* SaveReason.AUTO */);
            }
        }
        doTrimTrailingWhitespace(model, isAutoSaved) {
            let prevSelection = [];
            let cursors = [];
            const editor = findEditor(model, this.codeEditorService);
            if (editor) {
                // Find `prevSelection` in any case do ensure a good undo stack when pushing the edit
                // Collect active cursors in `cursors` only if `isAutoSaved` to avoid having the cursors jump
                prevSelection = editor.getSelections();
                if (isAutoSaved) {
                    cursors = prevSelection.map(s => s.getPosition());
                    const snippetsRange = snippetController2_1.SnippetController2.get(editor)?.getSessionEnclosingRange();
                    if (snippetsRange) {
                        for (let lineNumber = snippetsRange.startLineNumber; lineNumber <= snippetsRange.endLineNumber; lineNumber++) {
                            cursors.push(new position_1.Position(lineNumber, model.getLineMaxColumn(lineNumber)));
                        }
                    }
                }
            }
            const ops = (0, trimTrailingWhitespaceCommand_1.trimTrailingWhitespace)(model, cursors);
            if (!ops.length) {
                return; // Nothing to do
            }
            model.pushEditOperations(prevSelection, ops, (_edits) => prevSelection);
        }
    };
    exports.TrimWhitespaceParticipant = TrimWhitespaceParticipant;
    exports.TrimWhitespaceParticipant = TrimWhitespaceParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, codeEditorService_1.ICodeEditorService)
    ], TrimWhitespaceParticipant);
    function findEditor(model, codeEditorService) {
        let candidate = null;
        if (model.isAttachedToEditor()) {
            for (const editor of codeEditorService.listCodeEditors()) {
                if (editor.hasModel() && editor.getModel() === model) {
                    if (editor.hasTextFocus()) {
                        return editor; // favour focused editor if there are multiple
                    }
                    candidate = editor;
                }
            }
        }
        return candidate;
    }
    let FinalNewLineParticipant = class FinalNewLineParticipant {
        constructor(configurationService, codeEditorService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            // Nothing
        }
        async participate(model, _env) {
            if (!model.textEditorModel) {
                return;
            }
            if (this.configurationService.getValue('files.insertFinalNewline', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
                this.doInsertFinalNewLine(model.textEditorModel);
            }
        }
        doInsertFinalNewLine(model) {
            const lineCount = model.getLineCount();
            const lastLine = model.getLineContent(lineCount);
            const lastLineIsEmptyOrWhitespace = strings.lastNonWhitespaceIndex(lastLine) === -1;
            if (!lineCount || lastLineIsEmptyOrWhitespace) {
                return;
            }
            const edits = [editOperation_1.EditOperation.insert(new position_1.Position(lineCount, model.getLineMaxColumn(lineCount)), model.getEOL())];
            const editor = findEditor(model, this.codeEditorService);
            if (editor) {
                editor.executeEdits('insertFinalNewLine', edits, editor.getSelections());
            }
            else {
                model.pushEditOperations([], edits, () => null);
            }
        }
    };
    exports.FinalNewLineParticipant = FinalNewLineParticipant;
    exports.FinalNewLineParticipant = FinalNewLineParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, codeEditorService_1.ICodeEditorService)
    ], FinalNewLineParticipant);
    let TrimFinalNewLinesParticipant = class TrimFinalNewLinesParticipant {
        constructor(configurationService, codeEditorService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            // Nothing
        }
        async participate(model, env) {
            if (!model.textEditorModel) {
                return;
            }
            if (this.configurationService.getValue('files.trimFinalNewlines', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
                this.doTrimFinalNewLines(model.textEditorModel, env.reason === 2 /* SaveReason.AUTO */);
            }
        }
        /**
         * returns 0 if the entire file is empty
         */
        findLastNonEmptyLine(model) {
            for (let lineNumber = model.getLineCount(); lineNumber >= 1; lineNumber--) {
                const lineLength = model.getLineLength(lineNumber);
                if (lineLength > 0) {
                    // this line has content
                    return lineNumber;
                }
            }
            // no line has content
            return 0;
        }
        doTrimFinalNewLines(model, isAutoSaved) {
            const lineCount = model.getLineCount();
            // Do not insert new line if file does not end with new line
            if (lineCount === 1) {
                return;
            }
            let prevSelection = [];
            let cannotTouchLineNumber = 0;
            const editor = findEditor(model, this.codeEditorService);
            if (editor) {
                prevSelection = editor.getSelections();
                if (isAutoSaved) {
                    for (let i = 0, len = prevSelection.length; i < len; i++) {
                        const positionLineNumber = prevSelection[i].positionLineNumber;
                        if (positionLineNumber > cannotTouchLineNumber) {
                            cannotTouchLineNumber = positionLineNumber;
                        }
                    }
                }
            }
            const lastNonEmptyLine = this.findLastNonEmptyLine(model);
            const deleteFromLineNumber = Math.max(lastNonEmptyLine + 1, cannotTouchLineNumber + 1);
            const deletionRange = model.validateRange(new range_1.Range(deleteFromLineNumber, 1, lineCount, model.getLineMaxColumn(lineCount)));
            if (deletionRange.isEmpty()) {
                return;
            }
            model.pushEditOperations(prevSelection, [editOperation_1.EditOperation.delete(deletionRange)], _edits => prevSelection);
            editor?.setSelections(prevSelection);
        }
    };
    exports.TrimFinalNewLinesParticipant = TrimFinalNewLinesParticipant;
    exports.TrimFinalNewLinesParticipant = TrimFinalNewLinesParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, codeEditorService_1.ICodeEditorService)
    ], TrimFinalNewLinesParticipant);
    let FormatOnSaveParticipant = class FormatOnSaveParticipant {
        constructor(configurationService, codeEditorService, instantiationService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            this.instantiationService = instantiationService;
            // Nothing
        }
        async participate(model, env, progress, token) {
            if (!model.textEditorModel) {
                return;
            }
            if (env.reason === 2 /* SaveReason.AUTO */) {
                return undefined;
            }
            const textEditorModel = model.textEditorModel;
            const overrides = { overrideIdentifier: textEditorModel.getLanguageId(), resource: textEditorModel.uri };
            const nestedProgress = new progress_1.Progress(provider => {
                progress.report({
                    message: (0, nls_1.localize)({ key: 'formatting2', comment: ['[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}'] }, "Running '{0}' Formatter ([configure]({1})).", provider.displayName || provider.extensionId && provider.extensionId.value || '???', 'command:workbench.action.openSettings?%5B%22editor.formatOnSave%22%5D')
                });
            });
            const enabled = this.configurationService.getValue('editor.formatOnSave', overrides);
            if (!enabled) {
                return undefined;
            }
            const editorOrModel = findEditor(textEditorModel, this.codeEditorService) || textEditorModel;
            const mode = this.configurationService.getValue('editor.formatOnSaveMode', overrides);
            if (mode === 'file') {
                await this.instantiationService.invokeFunction(format_1.formatDocumentWithSelectedProvider, editorOrModel, 2 /* FormattingMode.Silent */, nestedProgress, token);
            }
            else {
                const ranges = await this.instantiationService.invokeFunction(formatModified_1.getModifiedRanges, (0, editorBrowser_1.isCodeEditor)(editorOrModel) ? editorOrModel.getModel() : editorOrModel);
                if (ranges === null && mode === 'modificationsIfAvailable') {
                    // no SCM, fallback to formatting the whole file iff wanted
                    await this.instantiationService.invokeFunction(format_1.formatDocumentWithSelectedProvider, editorOrModel, 2 /* FormattingMode.Silent */, nestedProgress, token);
                }
                else if (ranges) {
                    // formatted modified ranges
                    await this.instantiationService.invokeFunction(format_1.formatDocumentRangesWithSelectedProvider, editorOrModel, ranges, 2 /* FormattingMode.Silent */, nestedProgress, token, false);
                }
            }
        }
    };
    FormatOnSaveParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, instantiation_1.IInstantiationService)
    ], FormatOnSaveParticipant);
    let CodeActionOnSaveParticipant = class CodeActionOnSaveParticipant {
        constructor(configurationService, instantiationService, languageFeaturesService) {
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.languageFeaturesService = languageFeaturesService;
        }
        async participate(model, env, progress, token) {
            if (!model.textEditorModel) {
                return;
            }
            const textEditorModel = model.textEditorModel;
            const settingsOverrides = { overrideIdentifier: textEditorModel.getLanguageId(), resource: textEditorModel.uri };
            // Convert boolean values to strings
            const setting = this.configurationService.getValue('editor.codeActionsOnSave', settingsOverrides);
            if (!setting) {
                return undefined;
            }
            if (env.reason === 2 /* SaveReason.AUTO */) {
                return undefined;
            }
            if (env.reason !== 1 /* SaveReason.EXPLICIT */ && Array.isArray(setting)) {
                return undefined;
            }
            const settingItems = Array.isArray(setting)
                ? setting
                : Object.keys(setting).filter(x => setting[x] && setting[x] !== 'never');
            const codeActionsOnSave = this.createCodeActionsOnSave(settingItems);
            if (!Array.isArray(setting)) {
                codeActionsOnSave.sort((a, b) => {
                    if (types_1.CodeActionKind.SourceFixAll.contains(a)) {
                        if (types_1.CodeActionKind.SourceFixAll.contains(b)) {
                            return 0;
                        }
                        return -1;
                    }
                    if (types_1.CodeActionKind.SourceFixAll.contains(b)) {
                        return 1;
                    }
                    return 0;
                });
            }
            if (!codeActionsOnSave.length) {
                return undefined;
            }
            const excludedActions = Array.isArray(setting)
                ? []
                : Object.keys(setting)
                    .filter(x => setting[x] === 'never' || false)
                    .map(x => new types_1.CodeActionKind(x));
            progress.report({ message: (0, nls_1.localize)('codeaction', "Quick Fixes") });
            const filteredSaveList = Array.isArray(setting) ? codeActionsOnSave : codeActionsOnSave.filter(x => setting[x.value] === 'always' || ((setting[x.value] === 'explicit' || setting[x.value] === true) && env.reason === 1 /* SaveReason.EXPLICIT */));
            await this.applyOnSaveActions(textEditorModel, filteredSaveList, excludedActions, progress, token);
        }
        createCodeActionsOnSave(settingItems) {
            const kinds = settingItems.map(x => new types_1.CodeActionKind(x));
            // Remove subsets
            return kinds.filter(kind => {
                return kinds.every(otherKind => otherKind.equals(kind) || !otherKind.contains(kind));
            });
        }
        async applyOnSaveActions(model, codeActionsOnSave, excludes, progress, token) {
            const getActionProgress = new class {
                constructor() {
                    this._names = new Set();
                }
                _report() {
                    progress.report({
                        message: (0, nls_1.localize)({ key: 'codeaction.get2', comment: ['[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}'] }, "Getting code actions from '{0}' ([configure]({1})).", [...this._names].map(name => `'${name}'`).join(', '), 'command:workbench.action.openSettings?%5B%22editor.codeActionsOnSave%22%5D')
                    });
                }
                report(provider) {
                    if (provider.displayName && !this._names.has(provider.displayName)) {
                        this._names.add(provider.displayName);
                        this._report();
                    }
                }
            };
            for (const codeActionKind of codeActionsOnSave) {
                const actionsToRun = await this.getActionsToRun(model, codeActionKind, excludes, getActionProgress, token);
                if (token.isCancellationRequested) {
                    actionsToRun.dispose();
                    return;
                }
                try {
                    for (const action of actionsToRun.validActions) {
                        progress.report({ message: (0, nls_1.localize)('codeAction.apply', "Applying code action '{0}'.", action.action.title) });
                        await this.instantiationService.invokeFunction(codeAction_1.applyCodeAction, action, codeAction_1.ApplyCodeActionReason.OnSave, {}, token);
                        if (token.isCancellationRequested) {
                            return;
                        }
                    }
                }
                catch {
                    // Failure to apply a code action should not block other on save actions
                }
                finally {
                    actionsToRun.dispose();
                }
            }
        }
        getActionsToRun(model, codeActionKind, excludes, progress, token) {
            return (0, codeAction_1.getCodeActions)(this.languageFeaturesService.codeActionProvider, model, model.getFullModelRange(), {
                type: 2 /* CodeActionTriggerType.Auto */,
                triggerAction: types_1.CodeActionTriggerSource.OnSave,
                filter: { include: codeActionKind, excludes: excludes, includeSourceActions: true },
            }, progress, token);
        }
    };
    CodeActionOnSaveParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, languageFeatures_1.ILanguageFeaturesService)
    ], CodeActionOnSaveParticipant);
    let SaveParticipantsContribution = class SaveParticipantsContribution extends lifecycle_1.Disposable {
        constructor(instantiationService, textFileService) {
            super();
            this.instantiationService = instantiationService;
            this.textFileService = textFileService;
            this.registerSaveParticipants();
        }
        registerSaveParticipants() {
            this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(TrimWhitespaceParticipant)));
            this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(CodeActionOnSaveParticipant)));
            this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(FormatOnSaveParticipant)));
            this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(FinalNewLineParticipant)));
            this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(TrimFinalNewLinesParticipant)));
        }
    };
    exports.SaveParticipantsContribution = SaveParticipantsContribution;
    exports.SaveParticipantsContribution = SaveParticipantsContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, textfiles_1.ITextFileService)
    ], SaveParticipantsContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(SaveParticipantsContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZVBhcnRpY2lwYW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL3NhdmVQYXJ0aWNpcGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBK0J6RixJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUF5QjtRQUVyQyxZQUN5QyxvQkFBMkMsRUFDOUMsaUJBQXFDO1lBRGxDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUUxRSxVQUFVO1FBQ1gsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBMkIsRUFBRSxHQUEyQjtZQUN6RSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM1QixPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pLLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxNQUFNLDRCQUFvQixDQUFDLENBQUM7WUFDdEYsQ0FBQztRQUNGLENBQUM7UUFFTyx3QkFBd0IsQ0FBQyxLQUFpQixFQUFFLFdBQW9CO1lBQ3ZFLElBQUksYUFBYSxHQUFnQixFQUFFLENBQUM7WUFDcEMsSUFBSSxPQUFPLEdBQWUsRUFBRSxDQUFDO1lBRTdCLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7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