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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/browser/services/bulkEditService", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/resolverService", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/editor/contrib/format/browser/format", "vs/editor/contrib/snippet/browser/snippetController2", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModel", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/workingCopy/common/workingCopyFileService"], function (require, exports, nls_1, lifecycle_1, resources_1, bulkEditService_1, trimTrailingWhitespaceCommand_1, position_1, range_1, editorWorker_1, languageFeatures_1, resolverService_1, codeAction_1, types_1, format_1, snippetController2_1, configuration_1, instantiation_1, log_1, platform_1, workspaceTrust_1, contributions_1, notebookBrowser_1, notebookCommon_1, notebookEditorModel_1, editorService_1, workingCopyFileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SaveParticipantsContribution = void 0;
    let FormatOnSaveParticipant = class FormatOnSaveParticipant {
        constructor(editorWorkerService, languageFeaturesService, textModelService, bulkEditService, configurationService) {
            this.editorWorkerService = editorWorkerService;
            this.languageFeaturesService = languageFeaturesService;
            this.textModelService = textModelService;
            this.bulkEditService = bulkEditService;
            this.configurationService = configurationService;
        }
        async participate(workingCopy, context, progress, token) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
                return;
            }
            if (context.reason === 2 /* SaveReason.AUTO */) {
                return undefined;
            }
            const enabled = this.configurationService.getValue(notebookCommon_1.NotebookSetting.formatOnSave);
            if (!enabled) {
                return undefined;
            }
            const notebook = workingCopy.model.notebookModel;
            progress.report({ message: (0, nls_1.localize)('notebookFormatSave.formatting', "Formatting") });
            const disposable = new lifecycle_1.DisposableStore();
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    const ref = await this.textModelService.createModelReference(cell.uri);
                    disposable.add(ref);
                    const model = ref.object.textEditorModel;
                    const formatEdits = await (0, format_1.getDocumentFormattingEditsUntilResult)(this.editorWorkerService, this.languageFeaturesService, model, model.getOptions(), token);
                    const edits = [];
                    if (formatEdits) {
                        edits.push(...formatEdits.map(edit => new bulkEditService_1.ResourceTextEdit(model.uri, edit, model.getVersionId())));
                        return edits;
                    }
                    return [];
                }));
                await this.bulkEditService.apply(/* edit */ allCellEdits.flat(), { label: (0, nls_1.localize)('formatNotebook', "Format Notebook"), code: 'undoredo.formatNotebook', });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    FormatOnSaveParticipant = __decorate([
        __param(0, editorWorker_1.IEditorWorkerService),
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, bulkEditService_1.IBulkEditService),
        __param(4, configuration_1.IConfigurationService)
    ], FormatOnSaveParticipant);
    let TrimWhitespaceParticipant = class TrimWhitespaceParticipant {
        constructor(configurationService, editorService, textModelService, bulkEditService) {
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.textModelService = textModelService;
            this.bulkEditService = bulkEditService;
        }
        async participate(workingCopy, context, progress, _token) {
            if (this.configurationService.getValue('files.trimTrailingWhitespace')) {
                await this.doTrimTrailingWhitespace(workingCopy, context.reason === 2 /* SaveReason.AUTO */, progress);
            }
        }
        async doTrimTrailingWhitespace(workingCopy, isAutoSaved, progress) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
                return;
            }
            const disposable = new lifecycle_1.DisposableStore();
            const notebook = workingCopy.model.notebookModel;
            const activeCellEditor = getActiveCellCodeEditor(this.editorService);
            let cursors = [];
            let prevSelection = [];
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    if (cell.cellKind !== notebookCommon_1.CellKind.Code) {
                        return [];
                    }
                    const ref = await this.textModelService.createModelReference(cell.uri);
                    disposable.add(ref);
                    const model = ref.object.textEditorModel;
                    const isActiveCell = (activeCellEditor && cell.uri.toString() === activeCellEditor.getModel()?.uri.toString());
                    if (isActiveCell) {
                        prevSelection = activeCellEditor.getSelections() ?? [];
                        if (isAutoSaved) {
                            cursors = prevSelection.map(s => s.getPosition()); // get initial cursor positions
                            const snippetsRange = snippetController2_1.SnippetController2.get(activeCellEditor)?.getSessionEnclosingRange();
                            if (snippetsRange) {
                                for (let lineNumber = snippetsRange.startLineNumber; lineNumber <= snippetsRange.endLineNumber; lineNumber++) {
                                    cursors.push(new position_1.Position(lineNumber, model.getLineMaxColumn(lineNumber)));
                                }
                            }
                        }
                    }
                    const ops = (0, trimTrailingWhitespaceCommand_1.trimTrailingWhitespace)(model, cursors);
                    if (!ops.length) {
                        return []; // Nothing to do
                    }
                    return ops.map(op => new bulkEditService_1.ResourceTextEdit(model.uri, { ...op, text: op.text || '' }, model.getVersionId()));
                }));
                const filteredEdits = allCellEdits.flat().filter(edit => edit !== undefined);
                await this.bulkEditService.apply(filteredEdits, { label: (0, nls_1.localize)('trimNotebookWhitespace', "Notebook Trim Trailing Whitespace"), code: 'undoredo.notebookTrimTrailingWhitespace' });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    TrimWhitespaceParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, editorService_1.IEditorService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, bulkEditService_1.IBulkEditService)
    ], TrimWhitespaceParticipant);
    let TrimFinalNewLinesParticipant = class TrimFinalNewLinesParticipant {
        constructor(configurationService, editorService, bulkEditService) {
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.bulkEditService = bulkEditService;
        }
        async participate(workingCopy, context, progress, _token) {
            if (this.configurationService.getValue('files.trimFinalNewlines')) {
                await this.doTrimFinalNewLines(workingCopy, context.reason === 2 /* SaveReason.AUTO */, progress);
            }
        }
        /**
         * returns 0 if the entire file is empty
         */
        findLastNonEmptyLine(textBuffer) {
            for (let lineNumber = textBuffer.getLineCount(); lineNumber >= 1; lineNumber--) {
                const lineLength = textBuffer.getLineLength(lineNumber);
                if (lineLength) {
                    // this line has content
                    return lineNumber;
                }
            }
            // no line has content
            return 0;
        }
        async doTrimFinalNewLines(workingCopy, isAutoSaved, progress) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
                return;
            }
            const disposable = new lifecycle_1.DisposableStore();
            const notebook = workingCopy.model.notebookModel;
            const activeCellEditor = getActiveCellCodeEditor(this.editorService);
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    if (cell.cellKind !== notebookCommon_1.CellKind.Code) {
                        return;
                    }
                    // autosave -- don't trim every trailing line, just up to the cursor line
                    let cannotTouchLineNumber = 0;
                    const isActiveCell = (activeCellEditor && cell.uri.toString() === activeCellEditor.getModel()?.uri.toString());
                    if (isAutoSaved && isActiveCell) {
                        const selections = activeCellEditor.getSelections() ?? [];
                        for (const sel of selections) {
                            cannotTouchLineNumber = Math.max(cannotTouchLineNumber, sel.selectionStartLineNumber);
                        }
                    }
                    const textBuffer = cell.textBuffer;
                    const lastNonEmptyLine = this.findLastNonEmptyLine(textBuffer);
                    const deleteFromLineNumber = Math.max(lastNonEmptyLine + 1, cannotTouchLineNumber + 1);
                    const deletionRange = new range_1.Range(deleteFromLineNumber, 1, textBuffer.getLineCount(), textBuffer.getLineLastNonWhitespaceColumn(textBuffer.getLineCount()));
                    if (deletionRange.isEmpty()) {
                        return;
                    }
                    // create the edit to delete all lines in deletionRange
                    return new bulkEditService_1.ResourceTextEdit(cell.uri, { range: deletionRange, text: '' }, cell.textModel?.getVersionId());
                }));
                const filteredEdits = allCellEdits.flat().filter(edit => edit !== undefined);
                await this.bulkEditService.apply(filteredEdits, { label: (0, nls_1.localize)('trimNotebookNewlines', "Trim Final New Lines"), code: 'undoredo.trimFinalNewLines' });
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    TrimFinalNewLinesParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, editorService_1.IEditorService),
        __param(2, bulkEditService_1.IBulkEditService)
    ], TrimFinalNewLinesParticipant);
    let FinalNewLineParticipant = class FinalNewLineParticipant {
        constructor(configurationService, bulkEditService, editorService) {
            this.configurationService = configurationService;
            this.bulkEditService = bulkEditService;
            this.editorService = editorService;
        }
        async participate(workingCopy, context, progress, _token) {
            // waiting on notebook-specific override before this feature can sync with 'files.insertFinalNewline'
            // if (this.configurationService.getValue('files.insertFinalNewline')) {
            if (this.configurationService.getValue(notebookCommon_1.NotebookSetting.insertFinalNewline)) {
                await this.doInsertFinalNewLine(workingCopy, context.reason === 2 /* SaveReason.AUTO */, progress);
            }
        }
        async doInsertFinalNewLine(workingCopy, isAutoSaved, progress) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
                return;
            }
            const disposable = new lifecycle_1.DisposableStore();
            const notebook = workingCopy.model.notebookModel;
            // get initial cursor positions
            const activeCellEditor = getActiveCellCodeEditor(this.editorService);
            let selections;
            if (activeCellEditor) {
                selections = activeCellEditor.getSelections() ?? [];
            }
            try {
                const allCellEdits = await Promise.all(notebook.cells.map(async (cell) => {
                    if (cell.cellKind !== notebookCommon_1.CellKind.Code) {
                        return;
                    }
                    const lineCount = cell.textBuffer.getLineCount();
                    const lastLineIsEmptyOrWhitespace = cell.textBuffer.getLineFirstNonWhitespaceColumn(lineCount) === 0;
                    if (!lineCount || lastLineIsEmptyOrWhitespace) {
                        return;
                    }
                    return new bulkEditService_1.ResourceTextEdit(cell.uri, { range: new range_1.Range(lineCount + 1, cell.textBuffer.getLineLength(lineCount), lineCount + 1, cell.textBuffer.getLineLength(lineCount)), text: cell.textBuffer.getEOL() }, cell.textModel?.getVersionId());
                }));
                const filteredEdits = allCellEdits.filter(edit => edit !== undefined);
                await this.bulkEditService.apply(filteredEdits, { label: (0, nls_1.localize)('insertFinalNewLine', "Insert Final New Line"), code: 'undoredo.insertFinalNewLine' });
                // set cursor back to initial position after inserting final new line
                if (activeCellEditor && selections) {
                    activeCellEditor.setSelections(selections);
                }
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
        }
    };
    FinalNewLineParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, bulkEditService_1.IBulkEditService),
        __param(2, editorService_1.IEditorService)
    ], FinalNewLineParticipant);
    let CodeActionOnSaveParticipant = class CodeActionOnSaveParticipant {
        constructor(configurationService, logService, workspaceTrustManagementService, languageFeaturesService, textModelService, instantiationService) {
            this.configurationService = configurationService;
            this.logService = logService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.languageFeaturesService = languageFeaturesService;
            this.textModelService = textModelService;
            this.instantiationService = instantiationService;
        }
        async participate(workingCopy, context, progress, token) {
            const nbDisposable = new lifecycle_1.DisposableStore();
            const isTrusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
            if (!isTrusted) {
                return;
            }
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
                return;
            }
            let saveTrigger = '';
            if (context.reason === 2 /* SaveReason.AUTO */) {
                // currently this won't happen, as vs/editor/contrib/codeAction/browser/codeAction.ts L#104 filters out codeactions on autosave. Just future-proofing
                // ? notebook CodeActions on autosave seems dangerous (perf-wise)
                // saveTrigger = 'always'; // TODO@Yoyokrazy, support during debt
                return undefined;
            }
            else if (context.reason === 1 /* SaveReason.EXPLICIT */) {
                saveTrigger = 'explicit';
            }
            else {
                // 	SaveReason.FOCUS_CHANGE, WINDOW_CHANGE need to be addressed when autosaves are enabled
                return undefined;
            }
            const notebookModel = workingCopy.model.notebookModel;
            const setting = this.configurationService.getValue(notebookCommon_1.NotebookSetting.codeActionsOnSave);
            if (!setting) {
                return undefined;
            }
            const settingItems = Array.isArray(setting)
                ? setting
                : Object.keys(setting).filter(x => setting[x]);
            if (!settingItems.length) {
                return undefined;
            }
            const allCodeActions = this.createCodeActionsOnSave(settingItems);
            const excludedActions = allCodeActions
                .filter(x => setting[x.value] === 'never' || setting[x.value] === false);
            const includedActions = allCodeActions
                .filter(x => setting[x.value] === saveTrigger || setting[x.value] === true);
            const editorCodeActionsOnSave = includedActions.filter(x => !types_1.CodeActionKind.Notebook.contains(x));
            const notebookCodeActionsOnSave = includedActions.filter(x => types_1.CodeActionKind.Notebook.contains(x));
            if (!editorCodeActionsOnSave.length && !notebookCodeActionsOnSave.length) {
                return undefined;
            }
            // prioritize `source.fixAll` code actions
            if (!Array.isArray(setting)) {
                editorCodeActionsOnSave.sort((a, b) => {
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
            // run notebook code actions
            progress.report({ message: (0, nls_1.localize)('notebookSaveParticipants.notebookCodeActions', "Running 'Notebook' code actions") });
            try {
                const cell = notebookModel.cells[0];
                const ref = await this.textModelService.createModelReference(cell.uri);
                nbDisposable.add(ref);
                const textEditorModel = ref.object.textEditorModel;
                await this.applyOnSaveActions(textEditorModel, notebookCodeActionsOnSave, excludedActions, progress, token);
            }
            catch {
                this.logService.error('Failed to apply notebook code action on save');
            }
            finally {
                progress.report({ increment: 100 });
                nbDisposable.dispose();
            }
            // run cell level code actions
            const disposable = new lifecycle_1.DisposableStore();
            progress.report({ message: (0, nls_1.localize)('notebookSaveParticipants.cellCodeActions', "Running 'Cell' code actions") });
            try {
                await Promise.all(notebookModel.cells.map(async (cell) => {
                    const ref = await this.textModelService.createModelReference(cell.uri);
                    disposable.add(ref);
                    const textEditorModel = ref.object.textEditorModel;
                    await this.applyOnSaveActions(textEditorModel, editorCodeActionsOnSave, excludedActions, progress, token);
                }));
            }
            catch {
                this.logService.error('Failed to apply code action on save');
            }
            finally {
                progress.report({ increment: 100 });
                disposable.dispose();
            }
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
                        const codeActionEdits = action.action.edit?.edits;
                        let breakFlag = false;
                        if (!action.action.kind?.startsWith('notebook')) {
                            for (const edit of codeActionEdits ?? []) {
                                const workspaceTextEdit = edit;
                                if (workspaceTextEdit.resource && (0, resources_1.isEqual)(workspaceTextEdit.resource, model.uri)) {
                                    continue;
                                }
                                else {
                                    // error -> applied to multiple resources
                                    breakFlag = true;
                                    break;
                                }
                            }
                        }
                        if (breakFlag) {
                            this.logService.warn('Failed to apply code action on save, applied to multiple resources.');
                            continue;
                        }
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
                type: 1 /* CodeActionTriggerType.Invoke */,
                triggerAction: types_1.CodeActionTriggerSource.OnSave,
                filter: { include: codeActionKind, excludes: excludes, includeSourceActions: true },
            }, progress, token);
        }
    };
    CodeActionOnSaveParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, log_1.ILogService),
        __param(2, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, instantiation_1.IInstantiationService)
    ], CodeActionOnSaveParticipant);
    function getActiveCellCodeEditor(editorService) {
        const activePane = editorService.activeEditorPane;
        const notebookEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(activePane);
        const activeCodeEditor = notebookEditor?.activeCodeEditor;
        return activeCodeEditor;
    }
    let SaveParticipantsContribution = class SaveParticipantsContribution extends lifecycle_1.Disposable {
        constructor(instantiationService, workingCopyFileService) {
            super();
            this.instantiationService = instantiationService;
            this.workingCopyFileService = workingCopyFileService;
            this.registerSaveParticipants();
        }
        registerSaveParticipants() {
            this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(TrimWhitespaceParticipant)));
            this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(CodeActionOnSaveParticipant)));
            this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(FormatOnSaveParticipant)));
            this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(FinalNewLineParticipant)));
            this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(TrimFinalNewLinesParticipant)));
        }
    };
    exports.SaveParticipantsContribution = SaveParticipantsContribution;
    exports.SaveParticipantsContribution = SaveParticipantsContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workingCopyFileService_1.IWorkingCopyFileService)
    ], SaveParticipantsContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(SaveParticipantsContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZVBhcnRpY2lwYW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL3NhdmVQYXJ0aWNpcGFudHMvc2F2ZVBhcnRpY2lwYW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQ2hHLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXVCO1FBQzVCLFlBQ3dDLG1CQUF5QyxFQUNyQyx1QkFBaUQsRUFDeEQsZ0JBQW1DLEVBQ3BDLGVBQWlDLEVBQzVCLG9CQUEyQztZQUo1Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQ3JDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDeEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNwQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDNUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtRQUNoRixDQUFDO1FBRUwsS0FBSyxDQUFDLFdBQVcsQ0FBQyxXQUFnRSxFQUFFLE9BQStCLEVBQUUsUUFBa0MsRUFBRSxLQUF3QjtZQUNoTCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssWUFBWSxrREFBNEIsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hGLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSw0QkFBb0IsRUFBRSxDQUFDO2dCQUN4QyxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBVSxnQ0FBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFGLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZCxPQUFPLFNBQVMsQ0FBQztZ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