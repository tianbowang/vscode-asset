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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/shiftCommand", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/model", "vs/editor/contrib/indentation/browser/indentUtils", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/editor/common/core/indentation", "vs/editor/common/languages/autoIndent"], function (require, exports, lifecycle_1, strings, editorExtensions_1, shiftCommand_1, editOperation_1, range_1, selection_1, editorContextKeys_1, languageConfigurationRegistry_1, model_1, indentUtils, nls, quickInput_1, indentation_1, autoIndent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndentationToTabsCommand = exports.IndentationToSpacesCommand = exports.AutoIndentOnPaste = exports.AutoIndentOnPasteCommand = exports.ReindentSelectedLinesAction = exports.ReindentLinesAction = exports.DetectIndentation = exports.ChangeTabDisplaySize = exports.IndentUsingSpaces = exports.IndentUsingTabs = exports.ChangeIndentationSizeAction = exports.IndentationToTabsAction = exports.IndentationToSpacesAction = exports.getReindentEditOperations = void 0;
    function getReindentEditOperations(model, languageConfigurationService, startLineNumber, endLineNumber, inheritedIndent) {
        if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
            // Model is empty
            return [];
        }
        const indentationRules = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).indentationRules;
        if (!indentationRules) {
            return [];
        }
        endLineNumber = Math.min(endLineNumber, model.getLineCount());
        // Skip `unIndentedLinePattern` lines
        while (startLineNumber <= endLineNumber) {
            if (!indentationRules.unIndentedLinePattern) {
                break;
            }
            const text = model.getLineContent(startLineNumber);
            if (!indentationRules.unIndentedLinePattern.test(text)) {
                break;
            }
            startLineNumber++;
        }
        if (startLineNumber > endLineNumber - 1) {
            return [];
        }
        const { tabSize, indentSize, insertSpaces } = model.getOptions();
        const shiftIndent = (indentation, count) => {
            count = count || 1;
            return shiftCommand_1.ShiftCommand.shiftIndent(indentation, indentation.length + count, tabSize, indentSize, insertSpaces);
        };
        const unshiftIndent = (indentation, count) => {
            count = count || 1;
            return shiftCommand_1.ShiftCommand.unshiftIndent(indentation, indentation.length + count, tabSize, indentSize, insertSpaces);
        };
        const indentEdits = [];
        // indentation being passed to lines below
        let globalIndent;
        // Calculate indentation for the first line
        // If there is no passed-in indentation, we use the indentation of the first line as base.
        const currentLineText = model.getLineContent(startLineNumber);
        let adjustedLineContent = currentLineText;
        if (inheritedIndent !== undefined && inheritedIndent !== null) {
            globalIndent = inheritedIndent;
            const oldIndentation = strings.getLeadingWhitespace(currentLineText);
            adjustedLineContent = globalIndent + currentLineText.substring(oldIndentation.length);
            if (indentationRules.decreaseIndentPattern && indentationRules.decreaseIndentPattern.test(adjustedLineContent)) {
                globalIndent = unshiftIndent(globalIndent);
                adjustedLineContent = globalIndent + currentLineText.substring(oldIndentation.length);
            }
            if (currentLineText !== adjustedLineContent) {
                indentEdits.push(editOperation_1.EditOperation.replaceMove(new selection_1.Selection(startLineNumber, 1, startLineNumber, oldIndentation.length + 1), (0, indentation_1.normalizeIndentation)(globalIndent, indentSize, insertSpaces)));
            }
        }
        else {
            globalIndent = strings.getLeadingWhitespace(currentLineText);
        }
        // idealIndentForNextLine doesn't equal globalIndent when there is a line matching `indentNextLinePattern`.
        let idealIndentForNextLine = globalIndent;
        if (indentationRules.increaseIndentPattern && indentationRules.increaseIndentPattern.test(adjustedLineContent)) {
            idealIndentForNextLine = shiftIndent(idealIndentForNextLine);
            globalIndent = shiftIndent(globalIndent);
        }
        else if (indentationRules.indentNextLinePattern && indentationRules.indentNextLinePattern.test(adjustedLineContent)) {
            idealIndentForNextLine = shiftIndent(idealIndentForNextLine);
        }
        startLineNumber++;
        // Calculate indentation adjustment for all following lines
        for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
            const text = model.getLineContent(lineNumber);
            const oldIndentation = strings.getLeadingWhitespace(text);
            const adjustedLineContent = idealIndentForNextLine + text.substring(oldIndentation.length);
            if (indentationRules.decreaseIndentPattern && indentationRules.decreaseIndentPattern.test(adjustedLineContent)) {
                idealIndentForNextLine = unshiftIndent(idealIndentForNextLine);
                globalIndent = unshiftIndent(globalIndent);
            }
            if (oldIndentation !== idealIndentForNextLine) {
                indentEdits.push(editOperation_1.EditOperation.replaceMove(new selection_1.Selection(lineNumber, 1, lineNumber, oldIndentation.length + 1), (0, indentation_1.normalizeIndentation)(idealIndentForNextLine, indentSize, insertSpaces)));
            }
            // calculate idealIndentForNextLine
            if (indentationRules.unIndentedLinePattern && indentationRules.unIndentedLinePattern.test(text)) {
                // In reindent phase, if the line matches `unIndentedLinePattern` we inherit indentation from above lines
                // but don't change globalIndent and idealIndentForNextLine.
                continue;
            }
            else if (indentationRules.increaseIndentPattern && indentationRules.increaseIndentPattern.test(adjustedLineContent)) {
                globalIndent = shiftIndent(globalIndent);
                idealIndentForNextLine = globalIndent;
            }
            else if (indentationRules.indentNextLinePattern && indentationRules.indentNextLinePattern.test(adjustedLineContent)) {
                idealIndentForNextLine = shiftIndent(idealIndentForNextLine);
            }
            else {
                idealIndentForNextLine = globalIndent;
            }
        }
        return indentEdits;
    }
    exports.getReindentEditOperations = getReindentEditOperations;
    class IndentationToSpacesAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.indentationToSpaces'; }
        constructor() {
            super({
                id: IndentationToSpacesAction.ID,
                label: nls.localize('indentationToSpaces', "Convert Indentation to Spaces"),
                alias: 'Convert Indentation to Spaces',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(accessor, editor) {
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const modelOpts = model.getOptions();
            const selection = editor.getSelection();
            if (!selection) {
                return;
            }
            const command = new IndentationToSpacesCommand(selection, modelOpts.tabSize);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
            model.updateOptions({
                insertSpaces: true
            });
        }
    }
    exports.IndentationToSpacesAction = IndentationToSpacesAction;
    class IndentationToTabsAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.indentationToTabs'; }
        constructor() {
            super({
                id: IndentationToTabsAction.ID,
                label: nls.localize('indentationToTabs', "Convert Indentation to Tabs"),
                alias: 'Convert Indentation to Tabs',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(accessor, editor) {
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const modelOpts = model.getOptions();
            const selection = editor.getSelection();
            if (!selection) {
                return;
            }
            const command = new IndentationToTabsCommand(selection, modelOpts.tabSize);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
            model.updateOptions({
                insertSpaces: false
            });
        }
    }
    exports.IndentationToTabsAction = IndentationToTabsAction;
    class ChangeIndentationSizeAction extends editorExtensions_1.EditorAction {
        constructor(insertSpaces, displaySizeOnly, opts) {
            super(opts);
            this.insertSpaces = insertSpaces;
            this.displaySizeOnly = displaySizeOnly;
        }
        run(accessor, editor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const modelService = accessor.get(model_1.IModelService);
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const creationOpts = modelService.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
            const modelOpts = model.getOptions();
            const picks = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
                id: n.toString(),
                label: n.toString(),
                // add description for tabSize value set in the configuration
                description: (n === creationOpts.tabSize && n === modelOpts.tabSize
                    ? nls.localize('configuredTabSize', "Configured Tab Size")
                    : n === creationOpts.tabSize
                        ? nls.localize('defaultTabSize', "Default Tab Size")
                        : n === modelOpts.tabSize
                            ? nls.localize('currentTabSize', "Current Tab Size")
                            : undefined)
            }));
            // auto focus the tabSize set for the current editor
            const autoFocusIndex = Math.min(model.getOptions().tabSize - 1, 7);
            setTimeout(() => {
                quickInputService.pick(picks, { placeHolder: nls.localize({ key: 'selectTabWidth', comment: ['Tab corresponds to the tab key'] }, "Select Tab Size for Current File"), activeItem: picks[autoFocusIndex] }).then(pick => {
                    if (pick) {
                        if (model && !model.isDisposed()) {
                            const pickedVal = parseInt(pick.label, 10);
                            if (this.displaySizeOnly) {
                                model.updateOptions({
                                    tabSize: pickedVal
                                });
                            }
                            else {
                                model.updateOptions({
                                    tabSize: pickedVal,
                                    indentSize: pickedVal,
                                    insertSpaces: this.insertSpaces
                                });
                            }
                        }
                    }
                });
            }, 50 /* quick input is sensitive to being opened so soon after another */);
        }
    }
    exports.ChangeIndentationSizeAction = ChangeIndentationSizeAction;
    class IndentUsingTabs extends ChangeIndentationSizeAction {
        static { this.ID = 'editor.action.indentUsingTabs'; }
        constructor() {
            super(false, false, {
                id: IndentUsingTabs.ID,
                label: nls.localize('indentUsingTabs', "Indent Using Tabs"),
                alias: 'Indent Using Tabs',
                precondition: undefined
            });
        }
    }
    exports.IndentUsingTabs = IndentUsingTabs;
    class IndentUsingSpaces extends ChangeIndentationSizeAction {
        static { this.ID = 'editor.action.indentUsingSpaces'; }
        constructor() {
            super(true, false, {
                id: IndentUsingSpaces.ID,
                label: nls.localize('indentUsingSpaces', "Indent Using Spaces"),
                alias: 'Indent Using Spaces',
                precondition: undefined
            });
        }
    }
    exports.IndentUsingSpaces = IndentUsingSpaces;
    class ChangeTabDisplaySize extends ChangeIndentationSizeAction {
        static { this.ID = 'editor.action.changeTabDisplaySize'; }
        constructor() {
            super(true, true, {
                id: ChangeTabDisplaySize.ID,
                label: nls.localize('changeTabDisplaySize', "Change Tab Display Size"),
                alias: 'Change Tab Display Size',
                precondition: undefined
            });
        }
    }
    exports.ChangeTabDisplaySize = ChangeTabDisplaySize;
    class DetectIndentation extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.detectIndentation'; }
        constructor() {
            super({
                id: DetectIndentation.ID,
                label: nls.localize('detectIndentation', "Detect Indentation from Content"),
                alias: 'Detect Indentation from Content',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            const modelService = accessor.get(model_1.IModelService);
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const creationOpts = modelService.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
            model.detectIndentation(creationOpts.insertSpaces, creationOpts.tabSize);
        }
    }
    exports.DetectIndentation = DetectIndentation;
    class ReindentLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.reindentlines',
                label: nls.localize('editor.reindentlines', "Reindent Lines"),
                alias: 'Reindent Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const edits = getReindentEditOperations(model, languageConfigurationService, 1, model.getLineCount());
            if (edits.length > 0) {
                editor.pushUndoStop();
                editor.executeEdits(this.id, edits);
                editor.pushUndoStop();
            }
        }
    }
    exports.ReindentLinesAction = ReindentLinesAction;
    class ReindentSelectedLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.reindentselectedlines',
                label: nls.localize('editor.reindentselectedlines', "Reindent Selected Lines"),
                alias: 'Reindent Selected Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const selections = editor.getSelections();
            if (selections === null) {
                return;
            }
            const edits = [];
            for (const selection of selections) {
                let startLineNumber = selection.startLineNumber;
                let endLineNumber = selection.endLineNumber;
                if (startLineNumber !== endLineNumber && selection.endColumn === 1) {
                    endLineNumber--;
                }
                if (startLineNumber === 1) {
                    if (startLineNumber === endLineNumber) {
                        continue;
                    }
                }
                else {
                    startLineNumber--;
                }
                const editOperations = getReindentEditOperations(model, languageConfigurationService, startLineNumber, endLineNumber);
                edits.push(...editOperations);
            }
            if (edits.length > 0) {
                editor.pushUndoStop();
                editor.executeEdits(this.id, edits);
                editor.pushUndoStop();
            }
        }
    }
    exports.ReindentSelectedLinesAction = ReindentSelectedLinesAction;
    class AutoIndentOnPasteCommand {
        constructor(edits, initialSelection) {
            this._initialSelection = initialSelection;
            this._edits = [];
            this._selectionId = null;
            for (const edit of edits) {
                if (edit.range && typeof edit.text === 'string') {
                    this._edits.push(edit);
                }
            }
        }
        getEditOperations(model, builder) {
            for (const edit of this._edits) {
                builder.addEditOperation(range_1.Range.lift(edit.range), edit.text);
            }
            let selectionIsSet = false;
            if (Array.isArray(this._edits) && this._edits.length === 1 && this._initialSelection.isEmpty()) {
                if (this._edits[0].range.startColumn === this._initialSelection.endColumn &&
                    this._edits[0].range.startLineNumber === this._initialSelection.endLineNumber) {
                    selectionIsSet = true;
                    this._selectionId = builder.trackSelection(this._initialSelection, true);
                }
                else if (this._edits[0].range.endColumn === this._initialSelection.startColumn &&
                    this._edits[0].range.endLineNumber === this._initialSelection.startLineNumber) {
                    selectionIsSet = true;
                    this._selectionId = builder.trackSelection(this._initialSelection, false);
                }
            }
            if (!selectionIsSet) {
                this._selectionId = builder.trackSelection(this._initialSelection);
            }
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this._selectionId);
        }
    }
    exports.AutoIndentOnPasteCommand = AutoIndentOnPasteCommand;
    let AutoIndentOnPaste = class AutoIndentOnPaste {
        static { this.ID = 'editor.contrib.autoIndentOnPaste'; }
        constructor(editor, _languageConfigurationService) {
            this.editor = editor;
            this._languageConfigurationService = _languageConfigurationService;
            this.callOnDispose = new lifecycle_1.DisposableStore();
            this.callOnModel = new lifecycle_1.DisposableStore();
            this.callOnDispose.add(editor.onDidChangeConfiguration(() => this.update()));
            this.callOnDispose.add(editor.onDidChangeModel(() => this.update()));
            this.callOnDispose.add(editor.onDidChangeModelLanguage(() => this.update()));
        }
        update() {
            // clean up
            this.callOnModel.clear();
            // we are disabled
            if (this.editor.getOption(12 /* EditorOption.autoIndent */) < 4 /* EditorAutoIndentStrategy.Full */ || this.editor.getOption(55 /* EditorOption.formatOnPaste */)) {
                return;
            }
            // no model
            if (!this.editor.hasModel()) {
                return;
            }
            this.callOnModel.add(this.editor.onDidPaste(({ range }) => {
                this.trigger(range);
            }));
        }
        trigger(range) {
            const selections = this.editor.getSelections();
            if (selections === null || selections.length > 1) {
                return;
            }
            const model = this.editor.getModel();
            if (!model) {
                return;
            }
            if (!model.tokenization.isCheapToTokenize(range.getStartPosition().lineNumber)) {
                return;
            }
            const autoIndent = this.editor.getOption(12 /* EditorOption.autoIndent */);
            const { tabSize, indentSize, insertSpaces } = model.getOptions();
            const textEdits = [];
            const indentConverter = {
                shiftIndent: (indentation) => {
                    return shiftCommand_1.ShiftCommand.shiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
                },
                unshiftIndent: (indentation) => {
                    return shiftCommand_1.ShiftCommand.unshiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
                }
            };
            let startLineNumber = range.startLineNumber;
            while (startLineNumber <= range.endLineNumber) {
                if (this.shouldIgnoreLine(model, startLineNumber)) {
                    startLineNumber++;
                    continue;
                }
                break;
            }
            if (startLineNumber > range.endLineNumber) {
                return;
            }
            let firstLineText = model.getLineContent(startLineNumber);
            if (!/\S/.test(firstLineText.substring(0, range.startColumn - 1))) {
                const indentOfFirstLine = (0, autoIndent_1.getGoodIndentForLine)(autoIndent, model, model.getLanguageId(), startLineNumber, indentConverter, this._languageConfigurationService);
                if (indentOfFirstLine !== null) {
                    const oldIndentation = strings.getLeadingWhitespace(firstLineText);
                    const newSpaceCnt = indentUtils.getSpaceCnt(indentOfFirstLine, tabSize);
                    const oldSpaceCnt = indentUtils.getSpaceCnt(oldIndentation, tabSize);
                    if (newSpaceCnt !== oldSpaceCnt) {
                        const newIndent = indentUtils.generateIndent(newSpaceCnt, tabSize, insertSpaces);
                        textEdits.push({
                            range: new range_1.Range(startLineNumber, 1, startLineNumber, oldIndentation.length + 1),
                            text: newIndent
                        });
                        firstLineText = newIndent + firstLineText.substr(oldIndentation.length);
                    }
                    else {
                        const indentMetadata = (0, autoIndent_1.getIndentMetadata)(model, startLineNumber, this._languageConfigurationService);
                        if (indentMetadata === 0 || indentMetadata === 8 /* IndentConsts.UNINDENT_MASK */) {
                            // we paste content into a line where only contains whitespaces
                            // after pasting, the indentation of the first line is already correct
                            // the first line doesn't match any indentation rule
                            // then no-op.
                            return;
                        }
                    }
                }
            }
            const firstLineNumber = startLineNumber;
            // ignore empty or ignored lines
            while (startLineNumber < range.endLineNumber) {
                if (!/\S/.test(model.getLineContent(startLineNumber + 1))) {
                    startLineNumber++;
                    continue;
                }
                break;
            }
            if (startLineNumber !== range.endLineNumber) {
                const virtualModel = {
                    tokenization: {
                        getLineTokens: (lineNumber) => {
                            return model.tokenization.getLineTokens(lineNumber);
                        },
                        getLanguageId: () => {
                            return model.getLanguageId();
                        },
                        getLanguageIdAtPosition: (lineNumber, column) => {
                            return model.getLanguageIdAtPosition(lineNumber, column);
                        },
                    },
                    getLineContent: (lineNumber) => {
                        if (lineNumber === firstLineNumber) {
                            return firstLineText;
                        }
                        else {
                            return model.getLineContent(lineNumber);
                        }
                    }
                };
                const indentOfSecondLine = (0, autoIndent_1.getGoodIndentForLine)(autoIndent, virtualModel, model.getLanguageId(), startLineNumber + 1, indentConverter, this._languageConfigurationService);
                if (indentOfSecondLine !== null) {
                    const newSpaceCntOfSecondLine = indentUtils.getSpaceCnt(indentOfSecondLine, tabSize);
                    const oldSpaceCntOfSecondLine = indentUtils.getSpaceCnt(strings.getLeadingWhitespace(model.getLineContent(startLineNumber + 1)), tabSize);
                    if (newSpaceCntOfSecondLine !== oldSpaceCntOfSecondLine) {
                        const spaceCntOffset = newSpaceCntOfSecondLine - oldSpaceCntOfSecondLine;
                        for (let i = startLineNumber + 1; i <= range.endLineNumber; i++) {
                            const lineContent = model.getLineContent(i);
                            const originalIndent = strings.getLeadingWhitespace(lineContent);
                            const originalSpacesCnt = indentUtils.getSpaceCnt(originalIndent, tabSize);
                            const newSpacesCnt = originalSpacesCnt + spaceCntOffset;
                            const newIndent = indentUtils.generateIndent(newSpacesCnt, tabSize, insertSpaces);
                            if (newIndent !== originalIndent) {
                                textEdits.push({
                                    range: new range_1.Range(i, 1, i, originalIndent.length + 1),
                                    text: newIndent
                                });
                            }
                        }
                    }
                }
            }
            if (textEdits.length > 0) {
                this.editor.pushUndoStop();
                const cmd = new AutoIndentOnPasteCommand(textEdits, this.editor.getSelection());
                this.editor.executeCommand('autoIndentOnPaste', cmd);
                this.editor.pushUndoStop();
            }
        }
        shouldIgnoreLine(model, lineNumber) {
            model.tokenization.forceTokenization(lineNumber);
            const nonWhitespaceColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
            if (nonWhitespaceColumn === 0) {
                return true;
            }
            const tokens = model.tokenization.getLineTokens(lineNumber);
            if (tokens.getCount() > 0) {
                const firstNonWhitespaceTokenIndex = tokens.findTokenIndexAtOffset(nonWhitespaceColumn);
                if (firstNonWhitespaceTokenIndex >= 0 && tokens.getStandardTokenType(firstNonWhitespaceTokenIndex) === 1 /* StandardTokenType.Comment */) {
                    return true;
                }
            }
            return false;
        }
        dispose() {
            this.callOnDispose.dispose();
            this.callOnModel.dispose();
        }
    };
    exports.AutoIndentOnPaste = AutoIndentOnPaste;
    exports.AutoIndentOnPaste = AutoIndentOnPaste = __decorate([
        __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], AutoIndentOnPaste);
    function getIndentationEditOperations(model, builder, tabSize, tabsToSpaces) {
        if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
            // Model is empty
            return;
        }
        let spaces = '';
        for (let i = 0; i < tabSize; i++) {
            spaces += ' ';
        }
        const spacesRegExp = new RegExp(spaces, 'gi');
        for (let lineNumber = 1, lineCount = model.getLineCount(); lineNumber <= lineCount; lineNumber++) {
            let lastIndentationColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
            if (lastIndentationColumn === 0) {
                lastIndentationColumn = model.getLineMaxColumn(lineNumber);
            }
            if (lastIndentationColumn === 1) {
                continue;
            }
            const originalIndentationRange = new range_1.Range(lineNumber, 1, lineNumber, lastIndentationColumn);
            const originalIndentation = model.getValueInRange(originalIndentationRange);
            const newIndentation = (tabsToSpaces
                ? originalIndentation.replace(/\t/ig, spaces)
                : originalIndentation.replace(spacesRegExp, '\t'));
            builder.addEditOperation(originalIndentationRange, newIndentation);
        }
    }
    class IndentationToSpacesCommand {
        constructor(selection, tabSize) {
            this.selection = selection;
            this.tabSize = tabSize;
            this.selectionId = null;
        }
        getEditOperations(model, builder) {
            this.selectionId = builder.trackSelection(this.selection);
            getIndentationEditOperations(model, builder, this.tabSize, true);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.selectionId);
        }
    }
    exports.IndentationToSpacesCommand = IndentationToSpacesCommand;
    class IndentationToTabsCommand {
        constructor(selection, tabSize) {
            this.selection = selection;
            this.tabSize = tabSize;
            this.selectionId = null;
        }
        getEditOperations(model, builder) {
            this.selectionId = builder.trackSelection(this.selection);
            getIndentationEditOperations(model, builder, this.tabSize, false);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.selectionId);
        }
    }
    exports.IndentationToTabsCommand = IndentationToTabsCommand;
    (0, editorExtensions_1.registerEditorContribution)(AutoIndentOnPaste.ID, AutoIndentOnPaste, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorAction)(IndentationToSpacesAction);
    (0, editorExtensions_1.registerEditorAction)(IndentationToTabsAction);
    (0, editorExtensions_1.registerEditorAction)(IndentUsingTabs);
    (0, editorExtensions_1.registerEditorAction)(IndentUsingSpaces);
    (0, editorExtensions_1.registerEditorAction)(ChangeTabDisplaySize);
    (0, editorExtensions_1.registerEditorAction)(DetectIndentation);
    (0, editorExtensions_1.registerEditorAction)(ReindentLinesAction);
    (0, editorExtensions_1.registerEditorAction)(ReindentSelectedLinesAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50YXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2luZGVudGF0aW9uL2Jyb3dzZXIvaW5kZW50YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxTQUFnQix5QkFBeUIsQ0FBQyxLQUFpQixFQUFFLDRCQUEyRCxFQUFFLGVBQXVCLEVBQUUsYUFBcUIsRUFBRSxlQUF3QjtRQUNqTSxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ25FLGlCQUFpQjtZQUNqQixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFRCxNQUFNLGdCQUFnQixHQUFHLDRCQUE0QixDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO1FBQ3ZILElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3ZCLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVELGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUU5RCxxQ0FBcUM7UUFDckMsT0FBTyxlQUFlLElBQUksYUFBYSxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQzdDLE1BQU07WUFDUCxDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JB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