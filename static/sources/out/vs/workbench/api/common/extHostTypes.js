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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/map", "vs/base/common/mime", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, arrays_1, errors_1, htmlContent_1, map_1, mime_1, strings_1, types_1, uri_1, uuid_1, extensions_1, files_1, remoteAuthorityResolver_1, notebookCommon_1) {
    "use strict";
    var Disposable_1, Position_1, Range_1, Selection_1, TextEdit_1, NotebookEdit_1, SnippetString_1, Location_1, SymbolInformation_1, DocumentSymbol_1, CodeActionKind_1, MarkdownString_1, TaskGroup_1, Task_1, TreeItem_1, FileSystemError_1, TestMessage_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeywordRecognitionStatus = exports.SpeechToTextStatus = exports.RelatedInformationType = exports.ChatAgentResultFeedbackKind = exports.ChatMessage = exports.ChatMessageRole = exports.InteractiveEditorResponseFeedbackKind = exports.ChatAgentCompletionItem = exports.ChatVariableLevel = exports.ChatAgentCopyKind = exports.InteractiveSessionVoteDirection = exports.ChatEditorTabInput = exports.InteractiveWindowInput = exports.TerminalEditorTabInput = exports.NotebookDiffEditorTabInput = exports.NotebookEditorTabInput = exports.WebviewEditorTabInput = exports.CustomEditorTabInput = exports.TextMergeTabInput = exports.TextDiffTabInput = exports.TextTabInput = exports.TypeHierarchyItem = exports.PortAutoForwardAction = exports.WorkspaceTrustState = exports.ExternalUriOpenerPriority = exports.FunctionCoverage = exports.BranchCoverage = exports.StatementCoverage = exports.FileCoverage = exports.CoveredCount = exports.TestTag = exports.TestMessage = exports.TestRunRequest = exports.TestRunProfileKind = exports.TestResultState = exports.PortAttributes = exports.LinkedEditingRanges = exports.StandardTokenType = exports.ExtensionRuntime = exports.ExtensionMode = exports.TimelineItem = exports.NotebookVariablesRequestKind = exports.NotebookKernelSourceAction = exports.NotebookRendererScript = exports.NotebookControllerAffinity2 = exports.NotebookControllerAffinity = exports.NotebookCellStatusBarItem = exports.NotebookEditorRevealType = exports.NotebookCellStatusBarAlignment = exports.NotebookCellExecutionState = exports.NotebookCellKind = exports.NotebookCellOutput = exports.NotebookCellOutputItem = exports.NotebookData = exports.NotebookCellData = exports.NotebookRange = exports.ColorThemeKind = exports.ColorTheme = exports.FileDecoration = exports.ExtensionKind = exports.InputBoxValidationSeverity = exports.QuickPickItemKind = exports.QuickInputButtons = exports.DebugVisualization = exports.DebugConsoleMode = exports.SemanticTokensEdits = exports.SemanticTokensEdit = exports.SemanticTokens = exports.SemanticTokensBuilder = exports.SemanticTokensLegend = exports.CommentThreadState = exports.CommentState = exports.CommentMode = exports.CommentThreadCollapsibleState = exports.FoldingRangeKind = exports.FoldingRange = exports.FileSystemError = exports.FileChangeType = exports.InlineValueContext = exports.InlineValueEvaluatableExpression = exports.InlineValueVariableLookup = exports.InlineValueText = exports.InlineCompletionTriggerKind = exports.EvaluatableExpression = exports.ThreadFocus = exports.StackFrameFocus = exports.DebugAdapterInlineImplementation = exports.DebugAdapterNamedPipeServer = exports.DebugAdapterServer = exports.DebugAdapterExecutable = exports.DataBreakpoint = exports.FunctionBreakpoint = exports.SourceBreakpoint = exports.Breakpoint = exports.setBreakpointId = exports.RelativePattern = exports.ConfigurationTarget = exports.ThemeColor = exports.ThemeIcon = exports.DocumentPasteEdit = exports.DocumentDropEdit = exports.DataTransfer = exports.DataTransferFile = exports.InternalFileDataTransferItem = exports.InternalDataTransferItem = exports.DataTransferItem = exports.TreeItemCheckboxState = exports.TreeItemCollapsibleState = exports.TreeItem = exports.ViewBadge = exports.ProgressLocation = exports.Task = exports.CustomExecution = exports.TaskScope = exports.ShellQuoting = exports.ShellExecution = exports.ProcessExecution = exports.TaskGroup = exports.TaskPanelKind = exports.TaskRevealKind = exports.TerminalProfile = exports.TerminalLocation = exports.TerminalQuickFixCommand = exports.TerminalQuickFixOpener = exports.TerminalLink = exports.TerminalExitReason = exports.SourceControlInputBoxValidationType = exports.ColorFormat = exports.ColorPresentation = exports.ColorInformation = exports.Color = exports.DocumentLink = exports.SyntaxTokenType = exports.DecorationRangeBehavior = exports.TextDocumentChangeReason = exports.TextEditorSelectionChangeKind = exports.TextEditorRevealType = exports.TextDocumentSaveReason = exports.TextEditorLineNumbersStyle = exports.asStatusBarItemIdentifier = exports.StatusBarAlignment = exports.ViewColumn = exports.InlineSuggestionList = exports.InlineSuggestion = exports.CompletionList = exports.CompletionItem = exports.CompletionItemTag = exports.CompletionItemKind = exports.CompletionTriggerKind = exports.InlayHint = exports.InlayHintLabelPart = exports.InlayHintKind = exports.SignatureHelpTriggerKind = exports.SignatureHelp = exports.SignatureInformation = exports.ParameterInformation = exports.MarkdownString = exports.CodeLens = exports.LanguageStatusSeverity = exports.CallHierarchyOutgoingCall = exports.CallHierarchyIncomingCall = exports.CallHierarchyItem = exports.SelectionRange = exports.CodeActionKind = exports.CodeAction = exports.CodeActionTriggerKind = exports.DocumentSymbol = exports.SymbolInformation = exports.SymbolTag = exports.SymbolKind = exports.MultiDocumentHighlight = exports.DocumentHighlight = exports.DocumentHighlightKind = exports.Hover = exports.Diagnostic = exports.DiagnosticRelatedInformation = exports.Location = exports.DiagnosticSeverity = exports.DiagnosticTag = exports.SnippetString = exports.WorkspaceEdit = exports.FileEditType = exports.SnippetTextEdit = exports.NotebookEdit = exports.TextEdit = exports.EnvironmentVariableMutatorType = exports.EndOfLine = exports.RemoteAuthorityResolverError = exports.ManagedResolvedAuthority = exports.ResolvedAuthority = exports.Selection = exports.Range = exports.Position = exports.Disposable = exports.TerminalQuickFixType = exports.TerminalOutputAnchor = void 0;
    /**
     * @deprecated
     *
     * This utility ensures that old JS code that uses functions for classes still works. Existing usages cannot be removed
     * but new ones must not be added
     * */
    function es5ClassCompat(target) {
        const interceptFunctions = {
            apply: function (...args) {
                if (args.length === 0) {
                    return Reflect.construct(target, []);
                }
                else {
                    const argsList = args.length === 1 ? [] : args[1];
                    return Reflect.construct(target, argsList, args[0].constructor);
                }
            },
            call: function (...args) {
                if (args.length === 0) {
                    return Reflect.construct(target, []);
                }
                else {
                    const [thisArg, ...restArgs] = args;
                    return Reflect.construct(target, restArgs, thisArg.constructor);
                }
            }
        };
        return Object.assign(target, interceptFunctions);
    }
    var TerminalOutputAnchor;
    (function (TerminalOutputAnchor) {
        TerminalOutputAnchor[TerminalOutputAnchor["Top"] = 0] = "Top";
        TerminalOutputAnchor[TerminalOutputAnchor["Bottom"] = 1] = "Bottom";
    })(TerminalOutputAnchor || (exports.TerminalOutputAnchor = TerminalOutputAnchor = {}));
    var TerminalQuickFixType;
    (function (TerminalQuickFixType) {
        TerminalQuickFixType[TerminalQuickFixType["TerminalCommand"] = 0] = "TerminalCommand";
        TerminalQuickFixType[TerminalQuickFixType["Opener"] = 1] = "Opener";
        TerminalQuickFixType[TerminalQuickFixType["Command"] = 3] = "Command";
    })(TerminalQuickFixType || (exports.TerminalQuickFixType = TerminalQuickFixType = {}));
    let Disposable = Disposable_1 = class Disposable {
        static from(...inDisposables) {
            let disposables = inDisposables;
            return new Disposable_1(function () {
                if (disposables) {
                    for (const disposable of disposables) {
                        if (disposable && typeof disposable.dispose === 'function') {
                            disposable.dispose();
                        }
                    }
                    disposables = undefined;
                }
            });
        }
        #callOnDispose;
        constructor(callOnDispose) {
            this.#callOnDispose = callOnDispose;
        }
        dispose() {
            if (typeof this.#callOnDispose === 'function') {
                this.#callOnDispose();
                this.#callOnDispose = undefined;
            }
        }
    };
    exports.Disposable = Disposable;
    exports.Disposable = Disposable = Disposable_1 = __decorate([
        es5ClassCompat
    ], Disposable);
    let Position = Position_1 = class Position {
        static Min(...positions) {
            if (positions.length === 0) {
                throw new TypeError();
            }
            let result = positions[0];
            for (let i = 1; i < positions.length; i++) {
                const p = positions[i];
                if (p.isBefore(result)) {
                    result = p;
                }
            }
            return result;
        }
        static Max(...positions) {
            if (positions.length === 0) {
                throw new TypeError();
            }
            let result = positions[0];
            for (let i = 1; i < positions.length; i++) {
                const p = positions[i];
                if (p.isAfter(result)) {
                    result = p;
                }
            }
            return result;
        }
        static isPosition(other) {
            if (!other) {
                return false;
            }
            if (other instanceof Position_1) {
                return true;
            }
            const { line, character } = other;
            if (typeof line === 'number' && typeof character === 'number') {
                return true;
            }
            return false;
        }
        static of(obj) {
            if (obj instanceof Position_1) {
                return obj;
            }
            else if (this.isPosition(obj)) {
                return new Position_1(obj.line, obj.character);
            }
            throw new Error('Invalid argument, is NOT a position-like object');
        }
        get line() {
            return this._line;
        }
        get character() {
            return this._character;
        }
        constructor(line, character) {
            if (line < 0) {
                throw (0, errors_1.illegalArgument)('line must be non-negative');
            }
            if (character < 0) {
                throw (0, errors_1.illegalArgument)('character must be non-negative');
            }
            this._line = line;
            this._character = character;
        }
        isBefore(other) {
            if (this._line < other._line) {
                return true;
            }
            if (other._line < this._line) {
                return false;
            }
            return this._character < other._character;
        }
        isBeforeOrEqual(other) {
            if (this._line < other._line) {
                return true;
            }
            if (other._line < this._line) {
                return false;
            }
            return this._character <= other._character;
        }
        isAfter(other) {
            return !this.isBeforeOrEqual(other);
        }
        isAfterOrEqual(other) {
            return !this.isBefore(other);
        }
        isEqual(other) {
            return this._line === other._line && this._character === other._character;
        }
        compareTo(other) {
            if (this._line < other._line) {
                return -1;
            }
            else if (this._line > other.line) {
                return 1;
            }
            else {
                // equal line
                if (this._character < other._character) {
                    return -1;
                }
                else if (this._character > other._character) {
                    return 1;
                }
                else {
                    // equal line and character
                    return 0;
                }
            }
        }
        translate(lineDeltaOrChange, characterDelta = 0) {
            if (lineDeltaOrChange === null || characterDelta === null) {
                throw (0, errors_1.illegalArgument)();
            }
            let lineDelta;
            if (typeof lineDeltaOrChange === 'undefined') {
                lineDelta = 0;
            }
            else if (typeof lineDeltaOrChange === 'number') {
                lineDelta = lineDeltaOrChange;
            }
            else {
                lineDelta = typeof lineDeltaOrChange.lineDelta === 'number' ? lineDeltaOrChange.lineDelta : 0;
                characterDelta = typeof lineDeltaOrChange.characterDelta === 'number' ? lineDeltaOrChange.characterDelta : 0;
            }
            if (lineDelta === 0 && characterDelta === 0) {
                return this;
            }
            return new Position_1(this.line + lineDelta, this.character + characterDelta);
        }
        with(lineOrChange, character = this.character) {
            if (lineOrChange === null || character === null) {
                throw (0, errors_1.illegalArgument)();
            }
            let line;
            if (typeof lineOrChange === 'undefined') {
                line = this.line;
            }
            else if (typeof lineOrChange === 'number') {
                line = lineOrChange;
            }
            else {
                line = typeof lineOrChange.line === 'number' ? lineOrChange.line : this.line;
                character = typeof lineOrChange.character === 'number' ? lineOrChange.character : this.character;
            }
            if (line === this.line && character === this.character) {
                return this;
            }
            return new Position_1(line, character);
        }
        toJSON() {
            return { line: this.line, character: this.character };
        }
    };
    exports.Position = Position;
    exports.Position = Position = Position_1 = __decorate([
        es5ClassCompat
    ], Position);
    let Range = Range_1 = class Range {
        static isRange(thing) {
            if (thing instanceof Range_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return Position.isPosition(thing.start)
                && Position.isPosition(thing.end);
        }
        static of(obj) {
            if (obj instanceof Range_1) {
                return obj;
            }
            if (this.isRange(obj)) {
                return new Range_1(obj.start, obj.end);
            }
            throw new Error('Invalid argument, is NOT a range-like object');
        }
        get start() {
            return this._start;
        }
        get end() {
            return this._end;
        }
        constructor(startLineOrStart, startColumnOrEnd, endLine, endColumn) {
            let start;
            let end;
            if (typeof startLineOrStart === 'number' && typeof startColumnOrEnd === 'number' && typeof endLine === 'number' && typeof endColumn === 'number') {
                start = new Position(startLineOrStart, startColumnOrEnd);
                end = new Position(endLine, endColumn);
            }
            else if (Position.isPosition(startLineOrStart) && Position.isPosition(startColumnOrEnd)) {
                start = Position.of(startLineOrStart);
                end = Position.of(startColumnOrEnd);
            }
            if (!start || !end) {
                throw new Error('Invalid arguments');
            }
            if (start.isBefore(end)) {
                this._start = start;
                this._end = end;
            }
            else {
                this._start = end;
                this._end = start;
            }
        }
        contains(positionOrRange) {
            if (Range_1.isRange(positionOrRange)) {
                return this.contains(positionOrRange.start)
                    && this.contains(positionOrRange.end);
            }
            else if (Position.isPosition(positionOrRange)) {
                if (Position.of(positionOrRange).isBefore(this._start)) {
                    return false;
                }
                if (this._end.isBefore(positionOrRange)) {
                    return false;
                }
                return true;
            }
            return false;
        }
        isEqual(other) {
            return this._start.isEqual(other._start) && this._end.isEqual(other._end);
        }
        intersection(other) {
            const start = Position.Max(other.start, this._start);
            const end = Position.Min(other.end, this._end);
            if (start.isAfter(end)) {
                // this happens when there is no overlap:
                // |-----|
                //          |----|
                return undefined;
            }
            return new Range_1(start, end);
        }
        union(other) {
            if (this.contains(other)) {
                return this;
            }
            else if (other.contains(this)) {
                return other;
            }
            const start = Position.Min(other.start, this._start);
            const end = Position.Max(other.end, this.end);
            return new Range_1(start, end);
        }
        get isEmpty() {
            return this._start.isEqual(this._end);
        }
        get isSingleLine() {
            return this._start.line === this._end.line;
        }
        with(startOrChange, end = this.end) {
            if (startOrChange === null || end === null) {
                throw (0, errors_1.illegalArgument)();
            }
            let start;
            if (!startOrChange) {
                start = this.start;
            }
            else if (Position.isPosition(startOrChange)) {
                start = startOrChange;
            }
            else {
                start = startOrChange.start || this.start;
                end = startOrChange.end || this.end;
            }
            if (start.isEqual(this._start) && end.isEqual(this.end)) {
                return this;
            }
            return new Range_1(start, end);
        }
        toJSON() {
            return [this.start, this.end];
        }
    };
    exports.Range = Range;
    exports.Range = Range = Range_1 = __decorate([
        es5ClassCompat
    ], Range);
    let Selection = Selection_1 = class Selection extends Range {
        static isSelection(thing) {
            if (thing instanceof Selection_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return Range.isRange(thing)
                && Position.isPosition(thing.anchor)
                && Position.isPosition(thing.active)
                && typeof thing.isReversed === 'boolean';
        }
        get anchor() {
            return this._anchor;
        }
        get active() {
            return this._active;
        }
        constructor(anchorLineOrAnchor, anchorColumnOrActive, activeLine, activeColumn) {
            let anchor;
            let active;
            if (typeof anchorLineOrAnchor === 'number' && typeof anchorColumnOrActive === 'number' && typeof activeLine === 'number' && typeof activeColumn === 'number') {
                anchor = new Position(anchorLineOrAnchor, anchorColumnOrActive);
                active = new Position(activeLine, activeColumn);
            }
            else if (Position.isPosition(anchorLineOrAnchor) && Position.isPosition(anchorColumnOrActive)) {
                anchor = Position.of(anchorLineOrAnchor);
                active = Position.of(anchorColumnOrActive);
            }
            if (!anchor || !active) {
                throw new Error('Invalid arguments');
            }
            super(anchor, active);
            this._anchor = anchor;
            this._active = active;
        }
        get isReversed() {
            return this._anchor === this._end;
        }
        toJSON() {
            return {
                start: this.start,
                end: this.end,
                active: this.active,
                anchor: this.anchor
            };
        }
    };
    exports.Selection = Selection;
    exports.Selection = Selection = Selection_1 = __decorate([
        es5ClassCompat
    ], Selection);
    const validateConnectionToken = (connectionToken) => {
        if (typeof connectionToken !== 'string' || connectionToken.length === 0 || !/^[0-9A-Za-z_\-]+$/.test(connectionToken)) {
            throw (0, errors_1.illegalArgument)('connectionToken');
        }
    };
    class ResolvedAuthority {
        static isResolvedAuthority(resolvedAuthority) {
            return resolvedAuthority
                && typeof resolvedAuthority === 'object'
                && typeof resolvedAuthority.host === 'string'
                && typeof resolvedAuthority.port === 'number'
                && (resolvedAuthority.connectionToken === undefined || typeof resolvedAuthority.connectionToken === 'string');
        }
        constructor(host, port, connectionToken) {
            if (typeof host !== 'string' || host.length === 0) {
                throw (0, errors_1.illegalArgument)('host');
            }
            if (typeof port !== 'number' || port === 0 || Math.round(port) !== port) {
                throw (0, errors_1.illegalArgument)('port');
            }
            if (typeof connectionToken !== 'undefined') {
                validateConnectionToken(connectionToken);
            }
            this.host = host;
            this.port = Math.round(port);
            this.connectionToken = connectionToken;
        }
    }
    exports.ResolvedAuthority = ResolvedAuthority;
    class ManagedResolvedAuthority {
        static isManagedResolvedAuthority(resolvedAuthority) {
            return resolvedAuthority
                && typeof resolvedAuthority === 'object'
                && typeof resolvedAuthority.makeConnection === 'function'
                && (resolvedAuthority.connectionToken === undefined || typeof resolvedAuthority.connectionToken === 'string');
        }
        constructor(makeConnection, connectionToken) {
            this.makeConnection = makeConnection;
            this.connectionToken = connectionToken;
            if (typeof connectionToken !== 'undefined') {
                validateConnectionToken(connectionToken);
            }
        }
    }
    exports.ManagedResolvedAuthority = ManagedResolvedAuthority;
    class RemoteAuthorityResolverError extends Error {
        static NotAvailable(message, handled) {
            return new RemoteAuthorityResolverError(message, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.NotAvailable, handled);
        }
        static TemporarilyNotAvailable(message) {
            return new RemoteAuthorityResolverError(message, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable);
        }
        constructor(message, code = remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.Unknown, detail) {
            super(message);
            this._message = message;
            this._code = code;
            this._detail = detail;
            // workaround when extending builtin objects and when compiling to ES5, see:
            // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, RemoteAuthorityResolverError.prototype);
        }
    }
    exports.RemoteAuthorityResolverError = RemoteAuthorityResolverError;
    var EndOfLine;
    (function (EndOfLine) {
        EndOfLine[EndOfLine["LF"] = 1] = "LF";
        EndOfLine[EndOfLine["CRLF"] = 2] = "CRLF";
    })(EndOfLine || (exports.EndOfLine = EndOfLine = {}));
    var EnvironmentVariableMutatorType;
    (function (EnvironmentVariableMutatorType) {
        EnvironmentVariableMutatorType[EnvironmentVariableMutatorType["Replace"] = 1] = "Replace";
        EnvironmentVariableMutatorType[EnvironmentVariableMutatorType["Append"] = 2] = "Append";
        EnvironmentVariableMutatorType[EnvironmentVariableMutatorType["Prepend"] = 3] = "Prepend";
    })(EnvironmentVariableMutatorType || (exports.EnvironmentVariableMutatorType = EnvironmentVariableMutatorType = {}));
    let TextEdit = TextEdit_1 = class TextEdit {
        static isTextEdit(thing) {
            if (thing instanceof TextEdit_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return Range.isRange(thing)
                && typeof thing.newText === 'string';
        }
        static replace(range, newText) {
            return new TextEdit_1(range, newText);
        }
        static insert(position, newText) {
            return TextEdit_1.replace(new Range(position, position), newText);
        }
        static delete(range) {
            return TextEdit_1.replace(range, '');
        }
        static setEndOfLine(eol) {
            const ret = new TextEdit_1(new Range(new Position(0, 0), new Position(0, 0)), '');
            ret.newEol = eol;
            return ret;
        }
        get range() {
            return this._range;
        }
        set range(value) {
            if (value && !Range.isRange(value)) {
                throw (0, errors_1.illegalArgument)('range');
            }
            this._range = value;
        }
        get newText() {
            return this._newText || '';
        }
        set newText(value) {
            if (value && typeof value !== 'string') {
                throw (0, errors_1.illegalArgument)('newText');
            }
            this._newText = value;
        }
        get newEol() {
            return this._newEol;
        }
        set newEol(value) {
            if (value && typeof value !== 'number') {
                throw (0, errors_1.illegalArgument)('newEol');
            }
            this._newEol = value;
        }
        constructor(range, newText) {
            this._range = range;
            this._newText = newText;
        }
        toJSON() {
            return {
                range: this.range,
                newText: this.newText,
                newEol: this._newEol
            };
        }
    };
    exports.TextEdit = TextEdit;
    exports.TextEdit = TextEdit = TextEdit_1 = __decorate([
        es5ClassCompat
    ], TextEdit);
    let NotebookEdit = NotebookEdit_1 = class NotebookEdit {
        static isNotebookCellEdit(thing) {
            if (thing instanceof NotebookEdit_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return NotebookRange.isNotebookRange(thing)
                && Array.isArray(thing.newCells);
        }
        static replaceCells(range, newCells) {
            return new NotebookEdit_1(range, newCells);
        }
        static insertCells(index, newCells) {
            return new NotebookEdit_1(new NotebookRange(index, index), newCells);
        }
        static deleteCells(range) {
            return new NotebookEdit_1(range, []);
        }
        static updateCellMetadata(index, newMetadata) {
            const edit = new NotebookEdit_1(new NotebookRange(index, index), []);
            edit.newCellMetadata = newMetadata;
            return edit;
        }
        static updateNotebookMetadata(newMetadata) {
            const edit = new NotebookEdit_1(new NotebookRange(0, 0), []);
            edit.newNotebookMetadata = newMetadata;
            return edit;
        }
        constructor(range, newCells) {
            this.range = range;
            this.newCells = newCells;
        }
    };
    exports.NotebookEdit = NotebookEdit;
    exports.NotebookEdit = NotebookEdit = NotebookEdit_1 = __decorate([
        es5ClassCompat
    ], NotebookEdit);
    class SnippetTextEdit {
        static isSnippetTextEdit(thing) {
            if (thing instanceof SnippetTextEdit) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return Range.isRange(thing.range)
                && SnippetString.isSnippetString(thing.snippet);
        }
        static replace(range, snippet) {
            return new SnippetTextEdit(range, snippet);
        }
        static insert(position, snippet) {
            return SnippetTextEdit.replace(new Range(position, position), snippet);
        }
        constructor(range, snippet) {
            this.range = range;
            this.snippet = snippet;
        }
    }
    exports.SnippetTextEdit = SnippetTextEdit;
    var FileEditType;
    (function (FileEditType) {
        FileEditType[FileEditType["File"] = 1] = "File";
        FileEditType[FileEditType["Text"] = 2] = "Text";
        FileEditType[FileEditType["Cell"] = 3] = "Cell";
        FileEditType[FileEditType["CellReplace"] = 5] = "CellReplace";
        FileEditType[FileEditType["Snippet"] = 6] = "Snippet";
    })(FileEditType || (exports.FileEditType = FileEditType = {}));
    let WorkspaceEdit = class WorkspaceEdit {
        constructor() {
            this._edits = [];
        }
        _allEntries() {
            return this._edits;
        }
        // --- file
        renameFile(from, to, options, metadata) {
            this._edits.push({ _type: 1 /* FileEditType.File */, from, to, options, metadata });
        }
        createFile(uri, options, metadata) {
            this._edits.push({ _type: 1 /* FileEditType.File */, from: undefined, to: uri, options, metadata });
        }
        deleteFile(uri, options, metadata) {
            this._edits.push({ _type: 1 /* FileEditType.File */, from: uri, to: undefined, options, metadata });
        }
        // --- notebook
        replaceNotebookMetadata(uri, value, metadata) {
            this._edits.push({ _type: 3 /* FileEditType.Cell */, metadata, uri, edit: { editType: 5 /* CellEditType.DocumentMetadata */, metadata: value }, notebookMetadata: value });
        }
        replaceNotebookCells(uri, startOrRange, cellData, metadata) {
            const start = startOrRange.start;
            const end = startOrRange.end;
            if (start !== end || cellData.length > 0) {
                this._edits.push({ _type: 5 /* FileEditType.CellReplace */, uri, index: start, count: end - start, cells: cellData, metadata });
            }
        }
        replaceNotebookCellMetadata(uri, index, cellMetadata, metadata) {
            this._edits.push({ _type: 3 /* FileEditType.Cell */, metadata, uri, edit: { editType: 3 /* CellEditType.Metadata */, index, metadata: cellMetadata } });
        }
        // --- text
        replace(uri, range, newText, metadata) {
            this._edits.push({ _type: 2 /* FileEditType.Text */, uri, edit: new TextEdit(range, newText), metadata });
        }
        insert(resource, position, newText, metadata) {
            this.replace(resource, new Range(position, position), newText, metadata);
        }
        delete(resource, range, metadata) {
            this.replace(resource, range, '', metadata);
        }
        // --- text (Maplike)
        has(uri) {
            return this._edits.some(edit => edit._type === 2 /* FileEditType.Text */ && edit.uri.toString() === uri.toString());
        }
        set(uri, edits) {
            if (!edits) {
                // remove all text, snippet, or notebook edits for `uri`
                for (let i = 0; i < this._edits.length; i++) {
                    const element = this._edits[i];
                    switch (element._type) {
                        case 2 /* FileEditType.Text */:
                        case 6 /* FileEditType.Snippet */:
                        case 3 /* FileEditType.Cell */:
                        case 5 /* FileEditType.CellReplace */:
                            if (element.uri.toString() === uri.toString()) {
                                this._edits[i] = undefined; // will be coalesced down below
                            }
                            break;
                    }
                }
                (0, arrays_1.coalesceInPlace)(this._edits);
            }
            else {
                // append edit to the end
                for (const editOrTuple of edits) {
                    if (!editOrTuple) {
                        continue;
                    }
                    let edit;
                    let metadata;
                    if (Array.isArray(editOrTuple)) {
                        edit = editOrTuple[0];
                        metadata = editOrTuple[1];
                    }
                    else {
                        edit = editOrTuple;
                    }
                    if (NotebookEdit.isNotebookCellEdit(edit)) {
                        if (edit.newCellMetadata) {
                            this.replaceNotebookCellMetadata(uri, edit.range.start, edit.newCellMetadata, metadata);
                        }
                        else if (edit.newNotebookMetadata) {
                            this.replaceNotebookMetadata(uri, edit.newNotebookMetadata, metadata);
                        }
                        else {
                            this.replaceNotebookCells(uri, edit.range, edit.newCells, metadata);
                        }
                    }
                    else if (SnippetTextEdit.isSnippetTextEdit(edit)) {
                        this._edits.push({ _type: 6 /* FileEditType.Snippet */, uri, range: edit.range, edit: edit.snippet, metadata });
                    }
                    else {
                        this._edits.push({ _type: 2 /* FileEditType.Text */, uri, edit, metadata });
                    }
                }
            }
        }
        get(uri) {
            const res = [];
            for (const candidate of this._edits) {
                if (candidate._type === 2 /* FileEditType.Text */ && candidate.uri.toString() === uri.toString()) {
                    res.push(candidate.edit);
                }
            }
            return res;
        }
        entries() {
            const textEdits = new map_1.ResourceMap();
            for (const candidate of this._edits) {
                if (candidate._type === 2 /* FileEditType.Text */) {
                    let textEdit = textEdits.get(candidate.uri);
                    if (!textEdit) {
                        textEdit = [candidate.uri, []];
                        textEdits.set(candidate.uri, textEdit);
                    }
                    textEdit[1].push(candidate.edit);
                }
            }
            return [...textEdits.values()];
        }
        get size() {
            return this.entries().length;
        }
        toJSON() {
            return this.entries();
        }
    };
    exports.WorkspaceEdit = WorkspaceEdit;
    exports.WorkspaceEdit = WorkspaceEdit = __decorate([
        es5ClassCompat
    ], WorkspaceEdit);
    let SnippetString = SnippetString_1 = class SnippetString {
        static isSnippetString(thing) {
            if (thing instanceof SnippetString_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return typeof thing.value === 'string';
        }
        static _escape(value) {
            return value.replace(/\$|}|\\/g, '\\$&');
        }
        constructor(value) {
            this._tabstop = 1;
            this.value = value || '';
        }
        appendText(string) {
            this.value += SnippetString_1._escape(string);
            return this;
        }
        appendTabstop(number = this._tabstop++) {
            this.value += '$';
            this.value += number;
            return this;
        }
        appendPlaceholder(value, number = this._tabstop++) {
            if (typeof value === 'function') {
                const nested = new SnippetString_1();
                nested._tabstop = this._tabstop;
                value(nested);
                this._tabstop = nested._tabstop;
                value = nested.value;
            }
            else {
                value = SnippetString_1._escape(value);
            }
            this.value += '${';
            this.value += number;
            this.value += ':';
            this.value += value;
            this.value += '}';
            return this;
        }
        appendChoice(values, number = this._tabstop++) {
            const value = values.map(s => s.replaceAll(/[|\\,]/g, '\\$&')).join(',');
            this.value += '${';
            this.value += number;
            this.value += '|';
            this.value += value;
            this.value += '|}';
            return this;
        }
        appendVariable(name, defaultValue) {
            if (typeof defaultValue === 'function') {
                const nested = new SnippetString_1();
                nested._tabstop = this._tabstop;
                defaultValue(nested);
                this._tabstop = nested._tabstop;
                defaultValue = nested.value;
            }
            else if (typeof defaultValue === 'string') {
                defaultValue = defaultValue.replace(/\$|}/g, '\\$&'); // CodeQL [SM02383] I do not want to escape backslashes here
            }
            this.value += '${';
            this.value += name;
            if (defaultValue) {
                this.value += ':';
                this.value += defaultValue;
            }
            this.value += '}';
            return this;
        }
    };
    exports.SnippetString = SnippetString;
    exports.SnippetString = SnippetString = SnippetString_1 = __decorate([
        es5ClassCompat
    ], SnippetString);
    var DiagnosticTag;
    (function (DiagnosticTag) {
        DiagnosticTag[DiagnosticTag["Unnecessary"] = 1] = "Unnecessary";
        DiagnosticTag[DiagnosticTag["Deprecated"] = 2] = "Deprecated";
    })(DiagnosticTag || (exports.DiagnosticTag = DiagnosticTag = {}));
    var DiagnosticSeverity;
    (function (DiagnosticSeverity) {
        DiagnosticSeverity[DiagnosticSeverity["Hint"] = 3] = "Hint";
        DiagnosticSeverity[DiagnosticSeverity["Information"] = 2] = "Information";
        DiagnosticSeverity[DiagnosticSeverity["Warning"] = 1] = "Warning";
        DiagnosticSeverity[DiagnosticSeverity["Error"] = 0] = "Error";
    })(DiagnosticSeverity || (exports.DiagnosticSeverity = DiagnosticSeverity = {}));
    let Location = Location_1 = class Location {
        static isLocation(thing) {
            if (thing instanceof Location_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return Range.isRange(thing.range)
                && uri_1.URI.isUri(thing.uri);
        }
        constructor(uri, rangeOrPosition) {
            this.uri = uri;
            if (!rangeOrPosition) {
                //that's OK
            }
            else if (Range.isRange(rangeOrPosition)) {
                this.range = Range.of(rangeOrPosition);
            }
            else if (Position.isPosition(rangeOrPosition)) {
                this.range = new Range(rangeOrPosition, rangeOrPosition);
            }
            else {
                throw new Error('Illegal argument');
            }
        }
        toJSON() {
            return {
                uri: this.uri,
                range: this.range
            };
        }
    };
    exports.Location = Location;
    exports.Location = Location = Location_1 = __decorate([
        es5ClassCompat
    ], Location);
    let DiagnosticRelatedInformation = class DiagnosticRelatedInformation {
        static is(thing) {
            if (!thing) {
                return false;
            }
            return typeof thing.message === 'string'
                && thing.location
                && Range.isRange(thing.location.range)
                && uri_1.URI.isUri(thing.location.uri);
        }
        constructor(location, message) {
            this.location = location;
            this.message = message;
        }
        static isEqual(a, b) {
            if (a === b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.message === b.message
                && a.location.range.isEqual(b.location.range)
                && a.location.uri.toString() === b.location.uri.toString();
        }
    };
    exports.DiagnosticRelatedInformation = DiagnosticRelatedInformation;
    exports.DiagnosticRelatedInformation = DiagnosticRelatedInformation = __decorate([
        es5ClassCompat
    ], DiagnosticRelatedInformation);
    let Diagnostic = class Diagnostic {
        constructor(range, message, severity = DiagnosticSeverity.Error) {
            if (!Range.isRange(range)) {
                throw new TypeError('range must be set');
            }
            if (!message) {
                throw new TypeError('message must be set');
            }
            this.range = range;
            this.message = message;
            this.severity = severity;
        }
        toJSON() {
            return {
                severity: DiagnosticSeverity[this.severity],
                message: this.message,
                range: this.range,
                source: this.source,
                code: this.code,
            };
        }
        static isEqual(a, b) {
            if (a === b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.message === b.message
                && a.severity === b.severity
                && a.code === b.code
                && a.severity === b.severity
                && a.source === b.source
                && a.range.isEqual(b.range)
                && (0, arrays_1.equals)(a.tags, b.tags)
                && (0, arrays_1.equals)(a.relatedInformation, b.relatedInformation, DiagnosticRelatedInformation.isEqual);
        }
    };
    exports.Diagnostic = Diagnostic;
    exports.Diagnostic = Diagnostic = __decorate([
        es5ClassCompat
    ], Diagnostic);
    let Hover = class Hover {
        constructor(contents, range) {
            if (!contents) {
                throw new Error('Illegal argument, contents must be defined');
            }
            if (Array.isArray(contents)) {
                this.contents = contents;
            }
            else {
                this.contents = [contents];
            }
            this.range = range;
        }
    };
    exports.Hover = Hover;
    exports.Hover = Hover = __decorate([
        es5ClassCompat
    ], Hover);
    var DocumentHighlightKind;
    (function (DocumentHighlightKind) {
        DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
        DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
        DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
    })(DocumentHighlightKind || (exports.DocumentHighlightKind = DocumentHighlightKind = {}));
    let DocumentHighlight = class DocumentHighlight {
        constructor(range, kind = DocumentHighlightKind.Text) {
            this.range = range;
            this.kind = kind;
        }
        toJSON() {
            return {
                range: this.range,
                kind: DocumentHighlightKind[this.kind]
            };
        }
    };
    exports.DocumentHighlight = DocumentHighlight;
    exports.DocumentHighlight = DocumentHighlight = __decorate([
        es5ClassCompat
    ], DocumentHighlight);
    let MultiDocumentHighlight = class MultiDocumentHighlight {
        constructor(uri, highlights) {
            this.uri = uri;
            this.highlights = highlights;
        }
        toJSON() {
            return {
                uri: this.uri,
                highlights: this.highlights.map(h => h.toJSON())
            };
        }
    };
    exports.MultiDocumentHighlight = MultiDocumentHighlight;
    exports.MultiDocumentHighlight = MultiDocumentHighlight = __decorate([
        es5ClassCompat
    ], MultiDocumentHighlight);
    var SymbolKind;
    (function (SymbolKind) {
        SymbolKind[SymbolKind["File"] = 0] = "File";
        SymbolKind[SymbolKind["Module"] = 1] = "Module";
        SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
        SymbolKind[SymbolKind["Package"] = 3] = "Package";
        SymbolKind[SymbolKind["Class"] = 4] = "Class";
        SymbolKind[SymbolKind["Method"] = 5] = "Method";
        SymbolKind[SymbolKind["Property"] = 6] = "Property";
        SymbolKind[SymbolKind["Field"] = 7] = "Field";
        SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
        SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
        SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
        SymbolKind[SymbolKind["Function"] = 11] = "Function";
        SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
        SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
        SymbolKind[SymbolKind["String"] = 14] = "String";
        SymbolKind[SymbolKind["Number"] = 15] = "Number";
        SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
        SymbolKind[SymbolKind["Array"] = 17] = "Array";
        SymbolKind[SymbolKind["Object"] = 18] = "Object";
        SymbolKind[SymbolKind["Key"] = 19] = "Key";
        SymbolKind[SymbolKind["Null"] = 20] = "Null";
        SymbolKind[SymbolKind["EnumMember"] = 21] = "EnumMember";
        SymbolKind[SymbolKind["Struct"] = 22] = "Struct";
        SymbolKind[SymbolKind["Event"] = 23] = "Event";
        SymbolKind[SymbolKind["Operator"] = 24] = "Operator";
        SymbolKind[SymbolKind["TypeParameter"] = 25] = "TypeParameter";
    })(SymbolKind || (exports.SymbolKind = SymbolKind = {}));
    var SymbolTag;
    (function (SymbolTag) {
        SymbolTag[SymbolTag["Deprecated"] = 1] = "Deprecated";
    })(SymbolTag || (exports.SymbolTag = SymbolTag = {}));
    let SymbolInformation = SymbolInformation_1 = class SymbolInformation {
        static validate(candidate) {
            if (!candidate.name) {
                throw new Error('name must not be falsy');
            }
        }
        constructor(name, kind, rangeOrContainer, locationOrUri, containerName) {
            this.name = name;
            this.kind = kind;
            this.containerName = containerName;
            if (typeof rangeOrContainer === 'string') {
                this.containerName = rangeOrContainer;
            }
            if (locationOrUri instanceof Location) {
                this.location = locationOrUri;
            }
            else if (rangeOrContainer instanceof Range) {
                this.location = new Location(locationOrUri, rangeOrContainer);
            }
            SymbolInformation_1.validate(this);
        }
        toJSON() {
            return {
                name: this.name,
                kind: SymbolKind[this.kind],
                location: this.location,
                containerName: this.containerName
            };
        }
    };
    exports.SymbolInformation = SymbolInformation;
    exports.SymbolInformation = SymbolInformation = SymbolInformation_1 = __decorate([
        es5ClassCompat
    ], SymbolInformation);
    let DocumentSymbol = DocumentSymbol_1 = class DocumentSymbol {
        static validate(candidate) {
            if (!candidate.name) {
                throw new Error('name must not be falsy');
            }
            if (!candidate.range.contains(candidate.selectionRange)) {
                throw new Error('selectionRange must be contained in fullRange');
            }
            candidate.children?.forEach(DocumentSymbol_1.validate);
        }
        constructor(name, detail, kind, range, selectionRange) {
            this.name = name;
            this.detail = detail;
            this.kind = kind;
            this.range = range;
            this.selectionRange = selectionRange;
            this.children = [];
            DocumentSymbol_1.validate(this);
        }
    };
    exports.DocumentSymbol = DocumentSymbol;
    exports.DocumentSymbol = DocumentSymbol = DocumentSymbol_1 = __decorate([
        es5ClassCompat
    ], DocumentSymbol);
    var CodeActionTriggerKind;
    (function (CodeActionTriggerKind) {
        CodeActionTriggerKind[CodeActionTriggerKind["Invoke"] = 1] = "Invoke";
        CodeActionTriggerKind[CodeActionTriggerKind["Automatic"] = 2] = "Automatic";
    })(CodeActionTriggerKind || (exports.CodeActionTriggerKind = CodeActionTriggerKind = {}));
    let CodeAction = class CodeAction {
        constructor(title, kind) {
            this.title = title;
            this.kind = kind;
        }
    };
    exports.CodeAction = CodeAction;
    exports.CodeAction = CodeAction = __decorate([
        es5ClassCompat
    ], CodeAction);
    let CodeActionKind = class CodeActionKind {
        static { CodeActionKind_1 = this; }
        static { this.sep = '.'; }
        constructor(value) {
            this.value = value;
        }
        append(parts) {
            return new CodeActionKind_1(this.value ? this.value + CodeActionKind_1.sep + parts : parts);
        }
        intersects(other) {
            return this.contains(other) || other.contains(this);
        }
        contains(other) {
            return this.value === other.value || other.value.startsWith(this.value + CodeActionKind_1.sep);
        }
    };
    exports.CodeActionKind = CodeActionKind;
    exports.CodeActionKind = CodeActionKind = CodeActionKind_1 = __decorate([
        es5ClassCompat
    ], CodeActionKind);
    CodeActionKind.Empty = new CodeActionKind('');
    CodeActionKind.QuickFix = CodeActionKind.Empty.append('quickfix');
    CodeActionKind.Refactor = CodeActionKind.Empty.append('refactor');
    CodeActionKind.RefactorExtract = CodeActionKind.Refactor.append('extract');
    CodeActionKind.RefactorInline = CodeActionKind.Refactor.append('inline');
    CodeActionKind.RefactorMove = CodeActionKind.Refactor.append('move');
    CodeActionKind.RefactorRewrite = CodeActionKind.Refactor.append('rewrite');
    CodeActionKind.Source = CodeActionKind.Empty.append('source');
    CodeActionKind.SourceOrganizeImports = CodeActionKind.Source.append('organizeImports');
    CodeActionKind.SourceFixAll = CodeActionKind.Source.append('fixAll');
    CodeActionKind.Notebook = CodeActionKind.Empty.append('notebook');
    let SelectionRange = class SelectionRange {
        constructor(range, parent) {
            this.range = range;
            this.parent = parent;
            if (parent && !parent.range.contains(this.range)) {
                throw new Error('Invalid argument: parent must contain this range');
            }
        }
    };
    exports.SelectionRange = SelectionRange;
    exports.SelectionRange = SelectionRange = __decorate([
        es5ClassCompat
    ], SelectionRange);
    class CallHierarchyItem {
        constructor(kind, name, detail, uri, range, selectionRange) {
            this.kind = kind;
            this.name = name;
            this.detail = detail;
            this.uri = uri;
            this.range = range;
            this.selectionRange = selectionRange;
        }
    }
    exports.CallHierarchyItem = CallHierarchyItem;
    class CallHierarchyIncomingCall {
        constructor(item, fromRanges) {
            this.fromRanges = fromRanges;
            this.from = item;
        }
    }
    exports.CallHierarchyIncomingCall = CallHierarchyIncomingCall;
    class CallHierarchyOutgoingCall {
        constructor(item, fromRanges) {
            this.fromRanges = fromRanges;
            this.to = item;
        }
    }
    exports.CallHierarchyOutgoingCall = CallHierarchyOutgoingCall;
    var LanguageStatusSeverity;
    (function (LanguageStatusSeverity) {
        LanguageStatusSeverity[LanguageStatusSeverity["Information"] = 0] = "Information";
        LanguageStatusSeverity[LanguageStatusSeverity["Warning"] = 1] = "Warning";
        LanguageStatusSeverity[LanguageStatusSeverity["Error"] = 2] = "Error";
    })(LanguageStatusSeverity || (exports.LanguageStatusSeverity = LanguageStatusSeverity = {}));
    let CodeLens = class CodeLens {
        constructor(range, command) {
            this.range = range;
            this.command = command;
        }
        get isResolved() {
            return !!this.command;
        }
    };
    exports.CodeLens = CodeLens;
    exports.CodeLens = CodeLens = __decorate([
        es5ClassCompat
    ], CodeLens);
    let MarkdownString = MarkdownString_1 = class MarkdownString {
        #delegate;
        static isMarkdownString(thing) {
            if (thing instanceof MarkdownString_1) {
                return true;
            }
            return thing && thing.appendCodeblock && thing.appendMarkdown && thing.appendText && (thing.value !== undefined);
        }
        constructor(value, supportThemeIcons = false) {
            this.#delegate = new htmlContent_1.MarkdownString(value, { supportThemeIcons });
        }
        get value() {
            return this.#delegate.value;
        }
        set value(value) {
            this.#delegate.value = value;
        }
        get isTrusted() {
            return this.#delegate.isTrusted;
        }
        set isTrusted(value) {
            this.#delegate.isTrusted = value;
        }
        get supportThemeIcons() {
            return this.#delegate.supportThemeIcons;
        }
        set supportThemeIcons(value) {
            this.#delegate.supportThemeIcons = value;
        }
        get supportHtml() {
            return this.#delegate.supportHtml;
        }
        set supportHtml(value) {
            this.#delegate.supportHtml = value;
        }
        get baseUri() {
            return this.#delegate.baseUri;
        }
        set baseUri(value) {
            this.#delegate.baseUri = value;
        }
        appendText(value) {
            this.#delegate.appendText(value);
            return this;
        }
        appendMarkdown(value) {
            this.#delegate.appendMarkdown(value);
            return this;
        }
        appendCodeblock(value, language) {
            this.#delegate.appendCodeblock(language ?? '', value);
            return this;
        }
    };
    exports.MarkdownString = MarkdownString;
    exports.MarkdownString = MarkdownString = MarkdownString_1 = __decorate([
        es5ClassCompat
    ], MarkdownString);
    let ParameterInformation = class ParameterInformation {
        constructor(label, documentation) {
            this.label = label;
            this.documentation = documentation;
        }
    };
    exports.ParameterInformation = ParameterInformation;
    exports.ParameterInformation = ParameterInformation = __decorate([
        es5ClassCompat
    ], ParameterInformation);
    let SignatureInformation = class SignatureInformation {
        constructor(label, documentation) {
            this.label = label;
            this.documentation = documentation;
            this.parameters = [];
        }
    };
    exports.SignatureInformation = SignatureInformation;
    exports.SignatureInformation = SignatureInformation = __decorate([
        es5ClassCompat
    ], SignatureInformation);
    let SignatureHelp = class SignatureHelp {
        constructor() {
            this.activeSignature = 0;
            this.activeParameter = 0;
            this.signatures = [];
        }
    };
    exports.SignatureHelp = SignatureHelp;
    exports.SignatureHelp = SignatureHelp = __decorate([
        es5ClassCompat
    ], SignatureHelp);
    var SignatureHelpTriggerKind;
    (function (SignatureHelpTriggerKind) {
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
    })(SignatureHelpTriggerKind || (exports.SignatureHelpTriggerKind = SignatureHelpTriggerKind = {}));
    var InlayHintKind;
    (function (InlayHintKind) {
        InlayHintKind[InlayHintKind["Type"] = 1] = "Type";
        InlayHintKind[InlayHintKind["Parameter"] = 2] = "Parameter";
    })(InlayHintKind || (exports.InlayHintKind = InlayHintKind = {}));
    let InlayHintLabelPart = class InlayHintLabelPart {
        constructor(value) {
            this.value = value;
        }
    };
    exports.InlayHintLabelPart = InlayHintLabelPart;
    exports.InlayHintLabelPart = InlayHintLabelPart = __decorate([
        es5ClassCompat
    ], InlayHintLabelPart);
    let InlayHint = class InlayHint {
        constructor(position, label, kind) {
            this.position = position;
            this.label = label;
            this.kind = kind;
        }
    };
    exports.InlayHint = InlayHint;
    exports.InlayHint = InlayHint = __decorate([
        es5ClassCompat
    ], InlayHint);
    var CompletionTriggerKind;
    (function (CompletionTriggerKind) {
        CompletionTriggerKind[CompletionTriggerKind["Invoke"] = 0] = "Invoke";
        CompletionTriggerKind[CompletionTriggerKind["TriggerCharacter"] = 1] = "TriggerCharacter";
        CompletionTriggerKind[CompletionTriggerKind["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
    })(CompletionTriggerKind || (exports.CompletionTriggerKind = CompletionTriggerKind = {}));
    var CompletionItemKind;
    (function (CompletionItemKind) {
        CompletionItemKind[CompletionItemKind["Text"] = 0] = "Text";
        CompletionItemKind[CompletionItemKind["Method"] = 1] = "Method";
        CompletionItemKind[CompletionItemKind["Function"] = 2] = "Function";
        CompletionItemKind[CompletionItemKind["Constructor"] = 3] = "Constructor";
        CompletionItemKind[CompletionItemKind["Field"] = 4] = "Field";
        CompletionItemKind[CompletionItemKind["Variable"] = 5] = "Variable";
        CompletionItemKind[CompletionItemKind["Class"] = 6] = "Class";
        CompletionItemKind[CompletionItemKind["Interface"] = 7] = "Interface";
        CompletionItemKind[CompletionItemKind["Module"] = 8] = "Module";
        CompletionItemKind[CompletionItemKind["Property"] = 9] = "Property";
        CompletionItemKind[CompletionItemKind["Unit"] = 10] = "Unit";
        CompletionItemKind[CompletionItemKind["Value"] = 11] = "Value";
        CompletionItemKind[CompletionItemKind["Enum"] = 12] = "Enum";
        CompletionItemKind[CompletionItemKind["Keyword"] = 13] = "Keyword";
        CompletionItemKind[CompletionItemKind["Snippet"] = 14] = "Snippet";
        CompletionItemKind[CompletionItemKind["Color"] = 15] = "Color";
        CompletionItemKind[CompletionItemKind["File"] = 16] = "File";
        CompletionItemKind[CompletionItemKind["Reference"] = 17] = "Reference";
        CompletionItemKind[CompletionItemKind["Folder"] = 18] = "Folder";
        CompletionItemKind[CompletionItemKind["EnumMember"] = 19] = "EnumMember";
        CompletionItemKind[CompletionItemKind["Constant"] = 20] = "Constant";
        CompletionItemKind[CompletionItemKind["Struct"] = 21] = "Struct";
        CompletionItemKind[CompletionItemKind["Event"] = 22] = "Event";
        CompletionItemKind[CompletionItemKind["Operator"] = 23] = "Operator";
        CompletionItemKind[CompletionItemKind["TypeParameter"] = 24] = "TypeParameter";
        CompletionItemKind[CompletionItemKind["User"] = 25] = "User";
        CompletionItemKind[CompletionItemKind["Issue"] = 26] = "Issue";
    })(CompletionItemKind || (exports.CompletionItemKind = CompletionItemKind = {}));
    var CompletionItemTag;
    (function (CompletionItemTag) {
        CompletionItemTag[CompletionItemTag["Deprecated"] = 1] = "Deprecated";
    })(CompletionItemTag || (exports.CompletionItemTag = CompletionItemTag = {}));
    let CompletionItem = class CompletionItem {
        constructor(label, kind) {
            this.label = label;
            this.kind = kind;
        }
        toJSON() {
            return {
                label: this.label,
                kind: this.kind && CompletionItemKind[this.kind],
                detail: this.detail,
                documentation: this.documentation,
                sortText: this.sortText,
                filterText: this.filterText,
                preselect: this.preselect,
                insertText: this.insertText,
                textEdit: this.textEdit
            };
        }
    };
    exports.CompletionItem = CompletionItem;
    exports.CompletionItem = CompletionItem = __decorate([
        es5ClassCompat
    ], CompletionItem);
    let CompletionList = class CompletionList {
        constructor(items = [], isIncomplete = false) {
            this.items = items;
            this.isIncomplete = isIncomplete;
        }
    };
    exports.CompletionList = CompletionList;
    exports.CompletionList = CompletionList = __decorate([
        es5ClassCompat
    ], CompletionList);
    let InlineSuggestion = class InlineSuggestion {
        constructor(insertText, range, command) {
            this.insertText = insertText;
            this.range = range;
            this.command = command;
        }
    };
    exports.InlineSuggestion = InlineSuggestion;
    exports.InlineSuggestion = InlineSuggestion = __decorate([
        es5ClassCompat
    ], InlineSuggestion);
    let InlineSuggestionList = class InlineSuggestionList {
        constructor(items) {
            this.commands = undefined;
            this.suppressSuggestions = undefined;
            this.items = items;
        }
    };
    exports.InlineSuggestionList = InlineSuggestionList;
    exports.InlineSuggestionList = InlineSuggestionList = __decorate([
        es5ClassCompat
    ], InlineSuggestionList);
    var ViewColumn;
    (function (ViewColumn) {
        ViewColumn[ViewColumn["Active"] = -1] = "Active";
        ViewColumn[ViewColumn["Beside"] = -2] = "Beside";
        ViewColumn[ViewColumn["One"] = 1] = "One";
        ViewColumn[ViewColumn["Two"] = 2] = "Two";
        ViewColumn[ViewColumn["Three"] = 3] = "Three";
        ViewColumn[ViewColumn["Four"] = 4] = "Four";
        ViewColumn[ViewColumn["Five"] = 5] = "Five";
        ViewColumn[ViewColumn["Six"] = 6] = "Six";
        ViewColumn[ViewColumn["Seven"] = 7] = "Seven";
        ViewColumn[ViewColumn["Eight"] = 8] = "Eight";
        ViewColumn[ViewColumn["Nine"] = 9] = "Nine";
    })(ViewColumn || (exports.ViewColumn = ViewColumn = {}));
    var StatusBarAlignment;
    (function (StatusBarAlignment) {
        StatusBarAlignment[StatusBarAlignment["Left"] = 1] = "Left";
        StatusBarAlignment[StatusBarAlignment["Right"] = 2] = "Right";
    })(StatusBarAlignment || (exports.StatusBarAlignment = StatusBarAlignment = {}));
    function asStatusBarItemIdentifier(extension, id) {
        return `${extensions_1.ExtensionIdentifier.toKey(extension)}.${id}`;
    }
    exports.asStatusBarItemIdentifier = asStatusBarItemIdentifier;
    var TextEditorLineNumbersStyle;
    (function (TextEditorLineNumbersStyle) {
        TextEditorLineNumbersStyle[TextEditorLineNumbersStyle["Off"] = 0] = "Off";
        TextEditorLineNumbersStyle[TextEditorLineNumbersStyle["On"] = 1] = "On";
        TextEditorLineNumbersStyle[TextEditorLineNumbersStyle["Relative"] = 2] = "Relative";
    })(TextEditorLineNumbersStyle || (exports.TextEditorLineNumbersStyle = TextEditorLineNumbersStyle = {}));
    var TextDocumentSaveReason;
    (function (TextDocumentSaveReason) {
        TextDocumentSaveReason[TextDocumentSaveReason["Manual"] = 1] = "Manual";
        TextDocumentSaveReason[TextDocumentSaveReason["AfterDelay"] = 2] = "AfterDelay";
        TextDocumentSaveReason[TextDocumentSaveReason["FocusOut"] = 3] = "FocusOut";
    })(TextDocumentSaveReason || (exports.TextDocumentSaveReason = TextDocumentSaveReason = {}));
    var TextEditorRevealType;
    (function (TextEditorRevealType) {
        TextEditorRevealType[TextEditorRevealType["Default"] = 0] = "Default";
        TextEditorRevealType[TextEditorRevealType["InCenter"] = 1] = "InCenter";
        TextEditorRevealType[TextEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        TextEditorRevealType[TextEditorRevealType["AtTop"] = 3] = "AtTop";
    })(TextEditorRevealType || (exports.TextEditorRevealType = TextEditorRevealType = {}));
    var TextEditorSelectionChangeKind;
    (function (TextEditorSelectionChangeKind) {
        TextEditorSelectionChangeKind[TextEditorSelectionChangeKind["Keyboard"] = 1] = "Keyboard";
        TextEditorSelectionChangeKind[TextEditorSelectionChangeKind["Mouse"] = 2] = "Mouse";
        TextEditorSelectionChangeKind[TextEditorSelectionChangeKind["Command"] = 3] = "Command";
    })(TextEditorSelectionChangeKind || (exports.TextEditorSelectionChangeKind = TextEditorSelectionChangeKind = {}));
    var TextDocumentChangeReason;
    (function (TextDocumentChangeReason) {
        TextDocumentChangeReason[TextDocumentChangeReason["Undo"] = 1] = "Undo";
        TextDocumentChangeReason[TextDocumentChangeReason["Redo"] = 2] = "Redo";
    })(TextDocumentChangeReason || (exports.TextDocumentChangeReason = TextDocumentChangeReason = {}));
    /**
     * These values match very carefully the values of `TrackedRangeStickiness`
     */
    var DecorationRangeBehavior;
    (function (DecorationRangeBehavior) {
        /**
         * TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
         */
        DecorationRangeBehavior[DecorationRangeBehavior["OpenOpen"] = 0] = "OpenOpen";
        /**
         * TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
         */
        DecorationRangeBehavior[DecorationRangeBehavior["ClosedClosed"] = 1] = "ClosedClosed";
        /**
         * TrackedRangeStickiness.GrowsOnlyWhenTypingBefore
         */
        DecorationRangeBehavior[DecorationRangeBehavior["OpenClosed"] = 2] = "OpenClosed";
        /**
         * TrackedRangeStickiness.GrowsOnlyWhenTypingAfter
         */
        DecorationRangeBehavior[DecorationRangeBehavior["ClosedOpen"] = 3] = "ClosedOpen";
    })(DecorationRangeBehavior || (exports.DecorationRangeBehavior = DecorationRangeBehavior = {}));
    (function (TextEditorSelectionChangeKind) {
        function fromValue(s) {
            switch (s) {
                case 'keyboard': return TextEditorSelectionChangeKind.Keyboard;
                case 'mouse': return TextEditorSelectionChangeKind.Mouse;
                case 'api': return TextEditorSelectionChangeKind.Command;
            }
            return undefined;
        }
        TextEditorSelectionChangeKind.fromValue = fromValue;
    })(TextEditorSelectionChangeKind || (exports.TextEditorSelectionChangeKind = TextEditorSelectionChangeKind = {}));
    var SyntaxTokenType;
    (function (SyntaxTokenType) {
        SyntaxTokenType[SyntaxTokenType["Other"] = 0] = "Other";
        SyntaxTokenType[SyntaxTokenType["Comment"] = 1] = "Comment";
        SyntaxTokenType[SyntaxTokenType["String"] = 2] = "String";
        SyntaxTokenType[SyntaxTokenType["RegEx"] = 3] = "RegEx";
    })(SyntaxTokenType || (exports.SyntaxTokenType = SyntaxTokenType = {}));
    (function (SyntaxTokenType) {
        function toString(v) {
            switch (v) {
                case SyntaxTokenType.Other: return 'other';
                case SyntaxTokenType.Comment: return 'comment';
                case SyntaxTokenType.String: return 'string';
                case SyntaxTokenType.RegEx: return 'regex';
            }
            return 'other';
        }
        SyntaxTokenType.toString = toString;
    })(SyntaxTokenType || (exports.SyntaxTokenType = SyntaxTokenType = {}));
    let DocumentLink = class DocumentLink {
        constructor(range, target) {
            if (target && !(uri_1.URI.isUri(target))) {
                throw (0, errors_1.illegalArgument)('target');
            }
            if (!Range.isRange(range) || range.isEmpty) {
                throw (0, errors_1.illegalArgument)('range');
            }
            this.range = range;
            this.target = target;
        }
    };
    exports.DocumentLink = DocumentLink;
    exports.DocumentLink = DocumentLink = __decorate([
        es5ClassCompat
    ], DocumentLink);
    let Color = class Color {
        constructor(red, green, blue, alpha) {
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.alpha = alpha;
        }
    };
    exports.Color = Color;
    exports.Color = Color = __decorate([
        es5ClassCompat
    ], Color);
    let ColorInformation = class ColorInformation {
        constructor(range, color) {
            if (color && !(color instanceof Color)) {
                throw (0, errors_1.illegalArgument)('color');
            }
            if (!Range.isRange(range) || range.isEmpty) {
                throw (0, errors_1.illegalArgument)('range');
            }
            this.range = range;
            this.color = color;
        }
    };
    exports.ColorInformation = ColorInformation;
    exports.ColorInformation = ColorInformation = __decorate([
        es5ClassCompat
    ], ColorInformation);
    let ColorPresentation = class ColorPresentation {
        constructor(label) {
            if (!label || typeof label !== 'string') {
                throw (0, errors_1.illegalArgument)('label');
            }
            this.label = label;
        }
    };
    exports.ColorPresentation = ColorPresentation;
    exports.ColorPresentation = ColorPresentation = __decorate([
        es5ClassCompat
    ], ColorPresentation);
    var ColorFormat;
    (function (ColorFormat) {
        ColorFormat[ColorFormat["RGB"] = 0] = "RGB";
        ColorFormat[ColorFormat["HEX"] = 1] = "HEX";
        ColorFormat[ColorFormat["HSL"] = 2] = "HSL";
    })(ColorFormat || (exports.ColorFormat = ColorFormat = {}));
    var SourceControlInputBoxValidationType;
    (function (SourceControlInputBoxValidationType) {
        SourceControlInputBoxValidationType[SourceControlInputBoxValidationType["Error"] = 0] = "Error";
        SourceControlInputBoxValidationType[SourceControlInputBoxValidationType["Warning"] = 1] = "Warning";
        SourceControlInputBoxValidationType[SourceControlInputBoxValidationType["Information"] = 2] = "Information";
    })(SourceControlInputBoxValidationType || (exports.SourceControlInputBoxValidationType = SourceControlInputBoxValidationType = {}));
    var TerminalExitReason;
    (function (TerminalExitReason) {
        TerminalExitReason[TerminalExitReason["Unknown"] = 0] = "Unknown";
        TerminalExitReason[TerminalExitReason["Shutdown"] = 1] = "Shutdown";
        TerminalExitReason[TerminalExitReason["Process"] = 2] = "Process";
        TerminalExitReason[TerminalExitReason["User"] = 3] = "User";
        TerminalExitReason[TerminalExitReason["Extension"] = 4] = "Extension";
    })(TerminalExitReason || (exports.TerminalExitReason = TerminalExitReason = {}));
    class TerminalLink {
        constructor(startIndex, length, tooltip) {
            this.startIndex = startIndex;
            this.length = length;
            this.tooltip = tooltip;
            if (typeof startIndex !== 'number' || startIndex < 0) {
                throw (0, errors_1.illegalArgument)('startIndex');
            }
            if (typeof length !== 'number' || length < 1) {
                throw (0, errors_1.illegalArgument)('length');
            }
            if (tooltip !== undefined && typeof tooltip !== 'string') {
                throw (0, errors_1.illegalArgument)('tooltip');
            }
        }
    }
    exports.TerminalLink = TerminalLink;
    class TerminalQuickFixOpener {
        constructor(uri) {
            this.uri = uri;
        }
    }
    exports.TerminalQuickFixOpener = TerminalQuickFixOpener;
    class TerminalQuickFixCommand {
        constructor(terminalCommand) {
            this.terminalCommand = terminalCommand;
        }
    }
    exports.TerminalQuickFixCommand = TerminalQuickFixCommand;
    var TerminalLocation;
    (function (TerminalLocation) {
        TerminalLocation[TerminalLocation["Panel"] = 1] = "Panel";
        TerminalLocation[TerminalLocation["Editor"] = 2] = "Editor";
    })(TerminalLocation || (exports.TerminalLocation = TerminalLocation = {}));
    class TerminalProfile {
        constructor(options) {
            this.options = options;
            if (typeof options !== 'object') {
                throw (0, errors_1.illegalArgument)('options');
            }
        }
    }
    exports.TerminalProfile = TerminalProfile;
    var TaskRevealKind;
    (function (TaskRevealKind) {
        TaskRevealKind[TaskRevealKind["Always"] = 1] = "Always";
        TaskRevealKind[TaskRevealKind["Silent"] = 2] = "Silent";
        TaskRevealKind[TaskRevealKind["Never"] = 3] = "Never";
    })(TaskRevealKind || (exports.TaskRevealKind = TaskRevealKind = {}));
    var TaskPanelKind;
    (function (TaskPanelKind) {
        TaskPanelKind[TaskPanelKind["Shared"] = 1] = "Shared";
        TaskPanelKind[TaskPanelKind["Dedicated"] = 2] = "Dedicated";
        TaskPanelKind[TaskPanelKind["New"] = 3] = "New";
    })(TaskPanelKind || (exports.TaskPanelKind = TaskPanelKind = {}));
    let TaskGroup = class TaskGroup {
        static { TaskGroup_1 = this; }
        static { this.Clean = new TaskGroup_1('clean', 'Clean'); }
        static { this.Build = new TaskGroup_1('build', 'Build'); }
        static { this.Rebuild = new TaskGroup_1('rebuild', 'Rebuild'); }
        static { this.Test = new TaskGroup_1('test', 'Test'); }
        static from(value) {
            switch (value) {
                case 'clean':
                    return TaskGroup_1.Clean;
                case 'build':
                    return TaskGroup_1.Build;
                case 'rebuild':
                    return TaskGroup_1.Rebuild;
                case 'test':
                    return TaskGroup_1.Test;
                default:
                    return undefined;
            }
        }
        constructor(id, label) {
            this.label = label;
            if (typeof id !== 'string') {
                throw (0, errors_1.illegalArgument)('name');
            }
            if (typeof label !== 'string') {
                throw (0, errors_1.illegalArgument)('name');
            }
            this._id = id;
        }
        get id() {
            return this._id;
        }
    };
    exports.TaskGroup = TaskGroup;
    exports.TaskGroup = TaskGroup = TaskGroup_1 = __decorate([
        es5ClassCompat
    ], TaskGroup);
    function computeTaskExecutionId(values) {
        let id = '';
        for (let i = 0; i < values.length; i++) {
            id += values[i].replace(/,/g, ',,') + ',';
        }
        return id;
    }
    let ProcessExecution = class ProcessExecution {
        constructor(process, varg1, varg2) {
            if (typeof process !== 'string') {
                throw (0, errors_1.illegalArgument)('process');
            }
            this._args = [];
            this._process = process;
            if (varg1 !== undefined) {
                if (Array.isArray(varg1)) {
                    this._args = varg1;
                    this._options = varg2;
                }
                else {
                    this._options = varg1;
                }
            }
        }
        get process() {
            return this._process;
        }
        set process(value) {
            if (typeof value !== 'string') {
                throw (0, errors_1.illegalArgument)('process');
            }
            this._process = value;
        }
        get args() {
            return this._args;
        }
        set args(value) {
            if (!Array.isArray(value)) {
                value = [];
            }
            this._args = value;
        }
        get options() {
            return this._options;
        }
        set options(value) {
            this._options = value;
        }
        computeId() {
            const props = [];
            props.push('process');
            if (this._process !== undefined) {
                props.push(this._process);
            }
            if (this._args && this._args.length > 0) {
                for (const arg of this._args) {
                    props.push(arg);
                }
            }
            return computeTaskExecutionId(props);
        }
    };
    exports.ProcessExecution = ProcessExecution;
    exports.ProcessExecution = ProcessExecution = __decorate([
        es5ClassCompat
    ], ProcessExecution);
    let ShellExecution = class ShellExecution {
        constructor(arg0, arg1, arg2) {
            this._args = [];
            if (Array.isArray(arg1)) {
                if (!arg0) {
                    throw (0, errors_1.illegalArgument)('command can\'t be undefined or null');
                }
                if (typeof arg0 !== 'string' && typeof arg0.value !== 'string') {
                    throw (0, errors_1.illegalArgument)('command');
                }
                this._command = arg0;
                this._args = arg1;
                this._options = arg2;
            }
            else {
                if (typeof arg0 !== 'string') {
                    throw (0, errors_1.illegalArgument)('commandLine');
                }
                this._commandLine = arg0;
                this._options = arg1;
            }
        }
        get commandLine() {
            return this._commandLine;
        }
        set commandLine(value) {
            if (typeof value !== 'string') {
                throw (0, errors_1.illegalArgument)('commandLine');
            }
            this._commandLine = value;
        }
        get command() {
            return this._command ? this._command : '';
        }
        set command(value) {
            if (typeof value !== 'string' && typeof value.value !== 'string') {
                throw (0, errors_1.illegalArgument)('command');
            }
            this._command = value;
        }
        get args() {
            return this._args;
        }
        set args(value) {
            this._args = value || [];
        }
        get options() {
            return this._options;
        }
        set options(value) {
            this._options = value;
        }
        computeId() {
            const props = [];
            props.push('shell');
            if (this._commandLine !== undefined) {
                props.push(this._commandLine);
            }
            if (this._command !== undefined) {
                props.push(typeof this._command === 'string' ? this._command : this._command.value);
            }
            if (this._args && this._args.length > 0) {
                for (const arg of this._args) {
                    props.push(typeof arg === 'string' ? arg : arg.value);
                }
            }
            return computeTaskExecutionId(props);
        }
    };
    exports.ShellExecution = ShellExecution;
    exports.ShellExecution = ShellExecution = __decorate([
        es5ClassCompat
    ], ShellExecution);
    var ShellQuoting;
    (function (ShellQuoting) {
        ShellQuoting[ShellQuoting["Escape"] = 1] = "Escape";
        ShellQuoting[ShellQuoting["Strong"] = 2] = "Strong";
        ShellQuoting[ShellQuoting["Weak"] = 3] = "Weak";
    })(ShellQuoting || (exports.ShellQuoting = ShellQuoting = {}));
    var TaskScope;
    (function (TaskScope) {
        TaskScope[TaskScope["Global"] = 1] = "Global";
        TaskScope[TaskScope["Workspace"] = 2] = "Workspace";
    })(TaskScope || (exports.TaskScope = TaskScope = {}));
    class CustomExecution {
        constructor(callback) {
            this._callback = callback;
        }
        computeId() {
            return 'customExecution' + (0, uuid_1.generateUuid)();
        }
        set callback(value) {
            this._callback = value;
        }
        get callback() {
            return this._callback;
        }
    }
    exports.CustomExecution = CustomExecution;
    let Task = class Task {
        static { Task_1 = this; }
        static { this.ExtensionCallbackType = 'customExecution'; }
        static { this.ProcessType = 'process'; }
        static { this.ShellType = 'shell'; }
        static { this.EmptyType = '$empty'; }
        constructor(definition, arg2, arg3, arg4, arg5, arg6) {
            this.__deprecated = false;
            this._definition = this.definition = definition;
            let problemMatchers;
            if (typeof arg2 === 'string') {
                this._name = this.name = arg2;
                this._source = this.source = arg3;
                this.execution = arg4;
                problemMatchers = arg5;
                this.__deprecated = true;
            }
            else if (arg2 === TaskScope.Global || arg2 === TaskScope.Workspace) {
                this.target = arg2;
                this._name = this.name = arg3;
                this._source = this.source = arg4;
                this.execution = arg5;
                problemMatchers = arg6;
            }
            else {
                this.target = arg2;
                this._name = this.name = arg3;
                this._source = this.source = arg4;
                this.execution = arg5;
                problemMatchers = arg6;
            }
            if (typeof problemMatchers === 'string') {
                this._problemMatchers = [problemMatchers];
                this._hasDefinedMatchers = true;
            }
            else if (Array.isArray(problemMatchers)) {
                this._problemMatchers = problemMatchers;
                this._hasDefinedMatchers = true;
            }
            else {
                this._problemMatchers = [];
                this._hasDefinedMatchers = false;
            }
            this._isBackground = false;
            this._presentationOptions = Object.create(null);
            this._runOptions = Object.create(null);
        }
        get _id() {
            return this.__id;
        }
        set _id(value) {
            this.__id = value;
        }
        get _deprecated() {
            return this.__deprecated;
        }
        clear() {
            if (this.__id === undefined) {
                return;
            }
            this.__id = undefined;
            this._scope = undefined;
            this.computeDefinitionBasedOnExecution();
        }
        computeDefinitionBasedOnExecution() {
            if (this._execution instanceof ProcessExecution) {
                this._definition = {
                    type: Task_1.ProcessType,
                    id: this._execution.computeId()
                };
            }
            else if (this._execution instanceof ShellExecution) {
                this._definition = {
                    type: Task_1.ShellType,
                    id: this._execution.computeId()
                };
            }
            else if (this._execution instanceof CustomExecution) {
                this._definition = {
                    type: Task_1.ExtensionCallbackType,
                    id: this._execution.computeId()
                };
            }
            else {
                this._definition = {
                    type: Task_1.EmptyType,
                    id: (0, uuid_1.generateUuid)()
                };
            }
        }
        get definition() {
            return this._definition;
        }
        set definition(value) {
            if (value === undefined || value === null) {
                throw (0, errors_1.illegalArgument)('Kind can\'t be undefined or null');
            }
            this.clear();
            this._definition = value;
        }
        get scope() {
            return this._scope;
        }
        set target(value) {
            this.clear();
            this._scope = value;
        }
        get name() {
            return this._name;
        }
        set name(value) {
            if (typeof value !== 'string') {
                throw (0, errors_1.illegalArgument)('name');
            }
            this.clear();
            this._name = value;
        }
        get execution() {
            return this._execution;
        }
        set execution(value) {
            if (value === null) {
                value = undefined;
            }
            this.clear();
            this._execution = value;
            const type = this._definition.type;
            if (Task_1.EmptyType === type || Task_1.ProcessType === type || Task_1.ShellType === type || Task_1.ExtensionCallbackType === type) {
                this.computeDefinitionBasedOnExecution();
            }
        }
        get problemMatchers() {
            return this._problemMatchers;
        }
        set problemMatchers(value) {
            if (!Array.isArray(value)) {
                this.clear();
                this._problemMatchers = [];
                this._hasDefinedMatchers = false;
                return;
            }
            else {
                this.clear();
                this._problemMatchers = value;
                this._hasDefinedMatchers = true;
            }
        }
        get hasDefinedMatchers() {
            return this._hasDefinedMatchers;
        }
        get isBackground() {
            return this._isBackground;
        }
        set isBackground(value) {
            if (value !== true && value !== false) {
                value = false;
            }
            this.clear();
            this._isBackground = value;
        }
        get source() {
            return this._source;
        }
        set source(value) {
            if (typeof value !== 'string' || value.length === 0) {
                throw (0, errors_1.illegalArgument)('source must be a string of length > 0');
            }
            this.clear();
            this._source = value;
        }
        get group() {
            return this._group;
        }
        set group(value) {
            if (value === null) {
                value = undefined;
            }
            this.clear();
            this._group = value;
        }
        get detail() {
            return this._detail;
        }
        set detail(value) {
            if (value === null) {
                value = undefined;
            }
            this._detail = value;
        }
        get presentationOptions() {
            return this._presentationOptions;
        }
        set presentationOptions(value) {
            if (value === null || value === undefined) {
                value = Object.create(null);
            }
            this.clear();
            this._presentationOptions = value;
        }
        get runOptions() {
            return this._runOptions;
        }
        set runOptions(value) {
            if (value === null || value === undefined) {
                value = Object.create(null);
            }
            this.clear();
            this._runOptions = value;
        }
    };
    exports.Task = Task;
    exports.Task = Task = Task_1 = __decorate([
        es5ClassCompat
    ], Task);
    var ProgressLocation;
    (function (ProgressLocation) {
        ProgressLocation[ProgressLocation["SourceControl"] = 1] = "SourceControl";
        ProgressLocation[ProgressLocation["Window"] = 10] = "Window";
        ProgressLocation[ProgressLocation["Notification"] = 15] = "Notification";
    })(ProgressLocation || (exports.ProgressLocation = ProgressLocation = {}));
    var ViewBadge;
    (function (ViewBadge) {
        function isViewBadge(thing) {
            const viewBadgeThing = thing;
            if (!(0, types_1.isNumber)(viewBadgeThing.value)) {
                console.log('INVALID view badge, invalid value', viewBadgeThing.value);
                return false;
            }
            if (viewBadgeThing.tooltip && !(0, types_1.isString)(viewBadgeThing.tooltip)) {
                console.log('INVALID view badge, invalid tooltip', viewBadgeThing.tooltip);
                return false;
            }
            return true;
        }
        ViewBadge.isViewBadge = isViewBadge;
    })(ViewBadge || (exports.ViewBadge = ViewBadge = {}));
    let TreeItem = TreeItem_1 = class TreeItem {
        static isTreeItem(thing, extension) {
            const treeItemThing = thing;
            if (treeItemThing.checkboxState !== undefined) {
                const checkbox = (0, types_1.isNumber)(treeItemThing.checkboxState) ? treeItemThing.checkboxState :
                    (0, types_1.isObject)(treeItemThing.checkboxState) && (0, types_1.isNumber)(treeItemThing.checkboxState.state) ? treeItemThing.checkboxState.state : undefined;
                const tooltip = !(0, types_1.isNumber)(treeItemThing.checkboxState) && (0, types_1.isObject)(treeItemThing.checkboxState) ? treeItemThing.checkboxState.tooltip : undefined;
                if (checkbox === undefined || (checkbox !== TreeItemCheckboxState.Checked && checkbox !== TreeItemCheckboxState.Unchecked) || (tooltip !== undefined && !(0, types_1.isString)(tooltip))) {
                    console.log('INVALID tree item, invalid checkboxState', treeItemThing.checkboxState);
                    return false;
                }
            }
            if (thing instanceof TreeItem_1) {
                return true;
            }
            if (treeItemThing.label !== undefined && !(0, types_1.isString)(treeItemThing.label) && !(treeItemThing.label?.label)) {
                console.log('INVALID tree item, invalid label', treeItemThing.label);
                return false;
            }
            if ((treeItemThing.id !== undefined) && !(0, types_1.isString)(treeItemThing.id)) {
                console.log('INVALID tree item, invalid id', treeItemThing.id);
                return false;
            }
            if ((treeItemThing.iconPath !== undefined) && !(0, types_1.isString)(treeItemThing.iconPath) && !uri_1.URI.isUri(treeItemThing.iconPath) && (!treeItemThing.iconPath || !(0, types_1.isString)(treeItemThing.iconPath.id))) {
                const asLightAndDarkThing = treeItemThing.iconPath;
                if (!asLightAndDarkThing || (!(0, types_1.isString)(asLightAndDarkThing.light) && !uri_1.URI.isUri(asLightAndDarkThing.light) && !(0, types_1.isString)(asLightAndDarkThing.dark) && !uri_1.URI.isUri(asLightAndDarkThing.dark))) {
                    console.log('INVALID tree item, invalid iconPath', treeItemThing.iconPath);
                    return false;
                }
            }
            if ((treeItemThing.description !== undefined) && !(0, types_1.isString)(treeItemThing.description) && (typeof treeItemThing.description !== 'boolean')) {
                console.log('INVALID tree item, invalid description', treeItemThing.description);
                return false;
            }
            if ((treeItemThing.resourceUri !== undefined) && !uri_1.URI.isUri(treeItemThing.resourceUri)) {
                console.log('INVALID tree item, invalid resourceUri', treeItemThing.resourceUri);
                return false;
            }
            if ((treeItemThing.tooltip !== undefined) && !(0, types_1.isString)(treeItemThing.tooltip) && !(treeItemThing.tooltip instanceof MarkdownString)) {
                console.log('INVALID tree item, invalid tooltip', treeItemThing.tooltip);
                return false;
            }
            if ((treeItemThing.command !== undefined) && !treeItemThing.command.command) {
                console.log('INVALID tree item, invalid command', treeItemThing.command);
                return false;
            }
            if ((treeItemThing.collapsibleState !== undefined) && (treeItemThing.collapsibleState < TreeItemCollapsibleState.None) && (treeItemThing.collapsibleState > TreeItemCollapsibleState.Expanded)) {
                console.log('INVALID tree item, invalid collapsibleState', treeItemThing.collapsibleState);
                return false;
            }
            if ((treeItemThing.contextValue !== undefined) && !(0, types_1.isString)(treeItemThing.contextValue)) {
                console.log('INVALID tree item, invalid contextValue', treeItemThing.contextValue);
                return false;
            }
            if ((treeItemThing.accessibilityInformation !== undefined) && !treeItemThing.accessibilityInformation?.label) {
                console.log('INVALID tree item, invalid accessibilityInformation', treeItemThing.accessibilityInformation);
                return false;
            }
            return true;
        }
        constructor(arg1, collapsibleState = TreeItemCollapsibleState.None) {
            this.collapsibleState = collapsibleState;
            if (uri_1.URI.isUri(arg1)) {
                this.resourceUri = arg1;
            }
            else {
                this.label = arg1;
            }
        }
    };
    exports.TreeItem = TreeItem;
    exports.TreeItem = TreeItem = TreeItem_1 = __decorate([
        es5ClassCompat
    ], TreeItem);
    var TreeItemCollapsibleState;
    (function (TreeItemCollapsibleState) {
        TreeItemCollapsibleState[TreeItemCollapsibleState["None"] = 0] = "None";
        TreeItemCollapsibleState[TreeItemCollapsibleState["Collapsed"] = 1] = "Collapsed";
        TreeItemCollapsibleState[TreeItemCollapsibleState["Expanded"] = 2] = "Expanded";
    })(TreeItemCollapsibleState || (exports.TreeItemCollapsibleState = TreeItemCollapsibleState = {}));
    var TreeItemCheckboxState;
    (function (TreeItemCheckboxState) {
        TreeItemCheckboxState[TreeItemCheckboxState["Unchecked"] = 0] = "Unchecked";
        TreeItemCheckboxState[TreeItemCheckboxState["Checked"] = 1] = "Checked";
    })(TreeItemCheckboxState || (exports.TreeItemCheckboxState = TreeItemCheckboxState = {}));
    let DataTransferItem = class DataTransferItem {
        async asString() {
            return typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
        }
        asFile() {
            return undefined;
        }
        constructor(value) {
            this.value = value;
        }
    };
    exports.DataTransferItem = DataTransferItem;
    exports.DataTransferItem = DataTransferItem = __decorate([
        es5ClassCompat
    ], DataTransferItem);
    /**
     * A data transfer item that has been created by VS Code instead of by a extension.
     *
     * Intentionally not exported to extensions.
     */
    class InternalDataTransferItem extends DataTransferItem {
    }
    exports.InternalDataTransferItem = InternalDataTransferItem;
    /**
     * A data transfer item for a file.
     *
     * Intentionally not exported to extensions as only we can create these.
     */
    class InternalFileDataTransferItem extends InternalDataTransferItem {
        #file;
        constructor(file) {
            super('');
            this.#file = file;
        }
        asFile() {
            return this.#file;
        }
    }
    exports.InternalFileDataTransferItem = InternalFileDataTransferItem;
    /**
     * Intentionally not exported to extensions
     */
    class DataTransferFile {
        constructor(name, uri, itemId, getData) {
            this.name = name;
            this.uri = uri;
            this._itemId = itemId;
            this._getData = getData;
        }
        data() {
            return this._getData();
        }
    }
    exports.DataTransferFile = DataTransferFile;
    let DataTransfer = class DataTransfer {
        #items = new Map();
        constructor(init) {
            for (const [mime, item] of init ?? []) {
                const existing = this.#items.get(this.#normalizeMime(mime));
                if (existing) {
                    existing.push(item);
                }
                else {
                    this.#items.set(this.#normalizeMime(mime), [item]);
                }
            }
        }
        get(mimeType) {
            return this.#items.get(this.#normalizeMime(mimeType))?.[0];
        }
        set(mimeType, value) {
            // This intentionally overwrites all entries for a given mimetype.
            // This is similar to how the DOM DataTransfer type works
            this.#items.set(this.#normalizeMime(mimeType), [value]);
        }
        forEach(callbackfn, thisArg) {
            for (const [mime, items] of this.#items) {
                for (const item of items) {
                    callbackfn.call(thisArg, item, mime, this);
                }
            }
        }
        *[Symbol.iterator]() {
            for (const [mime, items] of this.#items) {
                for (const item of items) {
                    yield [mime, item];
                }
            }
        }
        #normalizeMime(mimeType) {
            return mimeType.toLowerCase();
        }
    };
    exports.DataTransfer = DataTransfer;
    exports.DataTransfer = DataTransfer = __decorate([
        es5ClassCompat
    ], DataTransfer);
    let DocumentDropEdit = class DocumentDropEdit {
        constructor(insertText) {
            this.insertText = insertText;
        }
    };
    exports.DocumentDropEdit = DocumentDropEdit;
    exports.DocumentDropEdit = DocumentDropEdit = __decorate([
        es5ClassCompat
    ], DocumentDropEdit);
    let DocumentPasteEdit = class DocumentPasteEdit {
        constructor(insertText, label) {
            this.label = label;
            this.insertText = insertText;
        }
    };
    exports.DocumentPasteEdit = DocumentPasteEdit;
    exports.DocumentPasteEdit = DocumentPasteEdit = __decorate([
        es5ClassCompat
    ], DocumentPasteEdit);
    let ThemeIcon = class ThemeIcon {
        constructor(id, color) {
            this.id = id;
            this.color = color;
        }
        static isThemeIcon(thing) {
            if (typeof thing.id !== 'string') {
                console.log('INVALID ThemeIcon, invalid id', thing.id);
                return false;
            }
            return true;
        }
    };
    exports.ThemeIcon = ThemeIcon;
    exports.ThemeIcon = ThemeIcon = __decorate([
        es5ClassCompat
    ], ThemeIcon);
    ThemeIcon.File = new ThemeIcon('file');
    ThemeIcon.Folder = new ThemeIcon('folder');
    let ThemeColor = class ThemeColor {
        constructor(id) {
            this.id = id;
        }
    };
    exports.ThemeColor = ThemeColor;
    exports.ThemeColor = ThemeColor = __decorate([
        es5ClassCompat
    ], ThemeColor);
    var ConfigurationTarget;
    (function (ConfigurationTarget) {
        ConfigurationTarget[ConfigurationTarget["Global"] = 1] = "Global";
        ConfigurationTarget[ConfigurationTarget["Workspace"] = 2] = "Workspace";
        ConfigurationTarget[ConfigurationTarget["WorkspaceFolder"] = 3] = "WorkspaceFolder";
    })(ConfigurationTarget || (exports.ConfigurationTarget = ConfigurationTarget = {}));
    let RelativePattern = class RelativePattern {
        get base() {
            return this._base;
        }
        set base(base) {
            this._base = base;
            this._baseUri = uri_1.URI.file(base);
        }
        get baseUri() {
            return this._baseUri;
        }
        set baseUri(baseUri) {
            this._baseUri = baseUri;
            this._base = baseUri.fsPath;
        }
        constructor(base, pattern) {
            if (typeof base !== 'string') {
                if (!base || !uri_1.URI.isUri(base) && !uri_1.URI.isUri(base.uri)) {
                    throw (0, errors_1.illegalArgument)('base');
                }
            }
            if (typeof pattern !== 'string') {
                throw (0, errors_1.illegalArgument)('pattern');
            }
            if (typeof base === 'string') {
                this.baseUri = uri_1.URI.file(base);
            }
            else if (uri_1.URI.isUri(base)) {
                this.baseUri = base;
            }
            else {
                this.baseUri = base.uri;
            }
            this.pattern = pattern;
        }
        toJSON() {
            return {
                pattern: this.pattern,
                base: this.base,
                baseUri: this.baseUri.toJSON()
            };
        }
    };
    exports.RelativePattern = RelativePattern;
    exports.RelativePattern = RelativePattern = __decorate([
        es5ClassCompat
    ], RelativePattern);
    const breakpointIds = new WeakMap();
    /**
     * We want to be able to construct Breakpoints internally that have a particular id, but we don't want extensions to be
     * able to do this with the exposed Breakpoint classes in extension API.
     * We also want "instanceof" to work with debug.breakpoints and the exposed breakpoint classes.
     * And private members will be renamed in the built js, so casting to any and setting a private member is not safe.
     * So, we store internal breakpoint IDs in a WeakMap. This function must be called after constructing a Breakpoint
     * with a known id.
     */
    function setBreakpointId(bp, id) {
        breakpointIds.set(bp, id);
    }
    exports.setBreakpointId = setBreakpointId;
    let Breakpoint = class Breakpoint {
        constructor(enabled, condition, hitCondition, logMessage) {
            this.enabled = typeof enabled === 'boolean' ? enabled : true;
            if (typeof condition === 'string') {
                this.condition = condition;
            }
            if (typeof hitCondition === 'string') {
                this.hitCondition = hitCondition;
            }
            if (typeof logMessage === 'string') {
                this.logMessage = logMessage;
            }
        }
        get id() {
            if (!this._id) {
                this._id = breakpointIds.get(this) ?? (0, uuid_1.generateUuid)();
            }
            return this._id;
        }
    };
    exports.Breakpoint = Breakpoint;
    exports.Breakpoint = Breakpoint = __decorate([
        es5ClassCompat
    ], Breakpoint);
    let SourceBreakpoint = class SourceBreakpoint extends Breakpoint {
        constructor(location, enabled, condition, hitCondition, logMessage) {
            super(enabled, condition, hitCondition, logMessage);
            if (location === null) {
                throw (0, errors_1.illegalArgument)('location');
            }
            this.location = location;
        }
    };
    exports.SourceBreakpoint = SourceBreakpoint;
    exports.SourceBreakpoint = SourceBreakpoint = __decorate([
        es5ClassCompat
    ], SourceBreakpoint);
    let FunctionBreakpoint = class FunctionBreakpoint extends Breakpoint {
        constructor(functionName, enabled, condition, hitCondition, logMessage) {
            super(enabled, condition, hitCondition, logMessage);
            this.functionName = functionName;
        }
    };
    exports.FunctionBreakpoint = FunctionBreakpoint;
    exports.FunctionBreakpoint = FunctionBreakpoint = __decorate([
        es5ClassCompat
    ], FunctionBreakpoint);
    let DataBreakpoint = class DataBreakpoint extends Breakpoint {
        constructor(label, dataId, canPersist, enabled, condition, hitCondition, logMessage) {
            super(enabled, condition, hitCondition, logMessage);
            if (!dataId) {
                throw (0, errors_1.illegalArgument)('dataId');
            }
            this.label = label;
            this.dataId = dataId;
            this.canPersist = canPersist;
        }
    };
    exports.DataBreakpoint = DataBreakpoint;
    exports.DataBreakpoint = DataBreakpoint = __decorate([
        es5ClassCompat
    ], DataBreakpoint);
    let DebugAdapterExecutable = class DebugAdapterExecutable {
        constructor(command, args, options) {
            this.command = command;
            this.args = args || [];
            this.options = options;
        }
    };
    exports.DebugAdapterExecutable = DebugAdapterExecutable;
    exports.DebugAdapterExecutable = DebugAdapterExecutable = __decorate([
        es5ClassCompat
    ], DebugAdapterExecutable);
    let DebugAdapterServer = class DebugAdapterServer {
        constructor(port, host) {
            this.port = port;
            this.host = host;
        }
    };
    exports.DebugAdapterServer = DebugAdapterServer;
    exports.DebugAdapterServer = DebugAdapterServer = __decorate([
        es5ClassCompat
    ], DebugAdapterServer);
    let DebugAdapterNamedPipeServer = class DebugAdapterNamedPipeServer {
        constructor(path) {
            this.path = path;
        }
    };
    exports.DebugAdapterNamedPipeServer = DebugAdapterNamedPipeServer;
    exports.DebugAdapterNamedPipeServer = DebugAdapterNamedPipeServer = __decorate([
        es5ClassCompat
    ], DebugAdapterNamedPipeServer);
    let DebugAdapterInlineImplementation = class DebugAdapterInlineImplementation {
        constructor(impl) {
            this.implementation = impl;
        }
    };
    exports.DebugAdapterInlineImplementation = DebugAdapterInlineImplementation;
    exports.DebugAdapterInlineImplementation = DebugAdapterInlineImplementation = __decorate([
        es5ClassCompat
    ], DebugAdapterInlineImplementation);
    let StackFrameFocus = class StackFrameFocus {
        constructor(session, threadId, frameId) {
            this.session = session;
            this.threadId = threadId;
            this.frameId = frameId;
        }
    };
    exports.StackFrameFocus = StackFrameFocus;
    exports.StackFrameFocus = StackFrameFocus = __decorate([
        es5ClassCompat
    ], StackFrameFocus);
    let ThreadFocus = class ThreadFocus {
        constructor(session, threadId) {
            this.session = session;
            this.threadId = threadId;
        }
    };
    exports.ThreadFocus = ThreadFocus;
    exports.ThreadFocus = ThreadFocus = __decorate([
        es5ClassCompat
    ], ThreadFocus);
    let EvaluatableExpression = class EvaluatableExpression {
        constructor(range, expression) {
            this.range = range;
            this.expression = expression;
        }
    };
    exports.EvaluatableExpression = EvaluatableExpression;
    exports.EvaluatableExpression = EvaluatableExpression = __decorate([
        es5ClassCompat
    ], EvaluatableExpression);
    var InlineCompletionTriggerKind;
    (function (InlineCompletionTriggerKind) {
        InlineCompletionTriggerKind[InlineCompletionTriggerKind["Invoke"] = 0] = "Invoke";
        InlineCompletionTriggerKind[InlineCompletionTriggerKind["Automatic"] = 1] = "Automatic";
    })(InlineCompletionTriggerKind || (exports.InlineCompletionTriggerKind = InlineCompletionTriggerKind = {}));
    let InlineValueText = class InlineValueText {
        constructor(range, text) {
            this.range = range;
            this.text = text;
        }
    };
    exports.InlineValueText = InlineValueText;
    exports.InlineValueText = InlineValueText = __decorate([
        es5ClassCompat
    ], InlineValueText);
    let InlineValueVariableLookup = class InlineValueVariableLookup {
        constructor(range, variableName, caseSensitiveLookup = true) {
            this.range = range;
            this.variableName = variableName;
            this.caseSensitiveLookup = caseSensitiveLookup;
        }
    };
    exports.InlineValueVariableLookup = InlineValueVariableLookup;
    exports.InlineValueVariableLookup = InlineValueVariableLookup = __decorate([
        es5ClassCompat
    ], InlineValueVariableLookup);
    let InlineValueEvaluatableExpression = class InlineValueEvaluatableExpression {
        constructor(range, expression) {
            this.range = range;
            this.expression = expression;
        }
    };
    exports.InlineValueEvaluatableExpression = InlineValueEvaluatableExpression;
    exports.InlineValueEvaluatableExpression = InlineValueEvaluatableExpression = __decorate([
        es5ClassCompat
    ], InlineValueEvaluatableExpression);
    let InlineValueContext = class InlineValueContext {
        constructor(frameId, range) {
            this.frameId = frameId;
            this.stoppedLocation = range;
        }
    };
    exports.InlineValueContext = InlineValueContext;
    exports.InlineValueContext = InlineValueContext = __decorate([
        es5ClassCompat
    ], InlineValueContext);
    //#region file api
    var FileChangeType;
    (function (FileChangeType) {
        FileChangeType[FileChangeType["Changed"] = 1] = "Changed";
        FileChangeType[FileChangeType["Created"] = 2] = "Created";
        FileChangeType[FileChangeType["Deleted"] = 3] = "Deleted";
    })(FileChangeType || (exports.FileChangeType = FileChangeType = {}));
    let FileSystemError = FileSystemError_1 = class FileSystemError extends Error {
        static FileExists(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileExists, FileSystemError_1.FileExists);
        }
        static FileNotFound(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileNotFound, FileSystemError_1.FileNotFound);
        }
        static FileNotADirectory(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileNotADirectory, FileSystemError_1.FileNotADirectory);
        }
        static FileIsADirectory(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileIsADirectory, FileSystemError_1.FileIsADirectory);
        }
        static NoPermissions(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.NoPermissions, FileSystemError_1.NoPermissions);
        }
        static Unavailable(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.Unavailable, FileSystemError_1.Unavailable);
        }
        constructor(uriOrMessage, code = files_1.FileSystemProviderErrorCode.Unknown, terminator) {
            super(uri_1.URI.isUri(uriOrMessage) ? uriOrMessage.toString(true) : uriOrMessage);
            this.code = terminator?.name ?? 'Unknown';
            // mark the error as file system provider error so that
            // we can extract the error code on the receiving side
            (0, files_1.markAsFileSystemProviderError)(this, code);
            // workaround when extending builtin objects and when compiling to ES5, see:
            // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, FileSystemError_1.prototype);
            if (typeof Error.captureStackTrace === 'function' && typeof terminator === 'function') {
                // nice stack traces
                Error.captureStackTrace(this, terminator);
            }
        }
    };
    exports.FileSystemError = FileSystemError;
    exports.FileSystemError = FileSystemError = FileSystemError_1 = __decorate([
        es5ClassCompat
    ], FileSystemError);
    //#endregion
    //#region folding api
    let FoldingRange = class FoldingRange {
        constructor(start, end, kind) {
            this.start = start;
            this.end = end;
            this.kind = kind;
        }
    };
    exports.FoldingRange = FoldingRange;
    exports.FoldingRange = FoldingRange = __decorate([
        es5ClassCompat
    ], FoldingRange);
    var FoldingRangeKind;
    (function (FoldingRangeKind) {
        FoldingRangeKind[FoldingRangeKind["Comment"] = 1] = "Comment";
        FoldingRangeKind[FoldingRangeKind["Imports"] = 2] = "Imports";
        FoldingRangeKind[FoldingRangeKind["Region"] = 3] = "Region";
    })(FoldingRangeKind || (exports.FoldingRangeKind = FoldingRangeKind = {}));
    //#endregion
    //#region Comment
    var CommentThreadCollapsibleState;
    (function (CommentThreadCollapsibleState) {
        /**
         * Determines an item is collapsed
         */
        CommentThreadCollapsibleState[CommentThreadCollapsibleState["Collapsed"] = 0] = "Collapsed";
        /**
         * Determines an item is expanded
         */
        CommentThreadCollapsibleState[CommentThreadCollapsibleState["Expanded"] = 1] = "Expanded";
    })(CommentThreadCollapsibleState || (exports.CommentThreadCollapsibleState = CommentThreadCollapsibleState = {}));
    var CommentMode;
    (function (CommentMode) {
        CommentMode[CommentMode["Editing"] = 0] = "Editing";
        CommentMode[CommentMode["Preview"] = 1] = "Preview";
    })(CommentMode || (exports.CommentMode = CommentMode = {}));
    var CommentState;
    (function (CommentState) {
        CommentState[CommentState["Published"] = 0] = "Published";
        CommentState[CommentState["Draft"] = 1] = "Draft";
    })(CommentState || (exports.CommentState = CommentState = {}));
    var CommentThreadState;
    (function (CommentThreadState) {
        CommentThreadState[CommentThreadState["Unresolved"] = 0] = "Unresolved";
        CommentThreadState[CommentThreadState["Resolved"] = 1] = "Resolved";
    })(CommentThreadState || (exports.CommentThreadState = CommentThreadState = {}));
    //#endregion
    //#region Semantic Coloring
    class SemanticTokensLegend {
        constructor(tokenTypes, tokenModifiers = []) {
            this.tokenTypes = tokenTypes;
            this.tokenModifiers = tokenModifiers;
        }
    }
    exports.SemanticTokensLegend = SemanticTokensLegend;
    function isStrArrayOrUndefined(arg) {
        return ((typeof arg === 'undefined') || (0, types_1.isStringArray)(arg));
    }
    class SemanticTokensBuilder {
        constructor(legend) {
            this._prevLine = 0;
            this._prevChar = 0;
            this._dataIsSortedAndDeltaEncoded = true;
            this._data = [];
            this._dataLen = 0;
            this._tokenTypeStrToInt = new Map();
            this._tokenModifierStrToInt = new Map();
            this._hasLegend = false;
            if (legend) {
                this._hasLegend = true;
                for (let i = 0, len = legend.tokenTypes.length; i < len; i++) {
                    this._tokenTypeStrToInt.set(legend.tokenTypes[i], i);
                }
                for (let i = 0, len = legend.tokenModifiers.length; i < len; i++) {
                    this._tokenModifierStrToInt.set(legend.tokenModifiers[i], i);
                }
            }
        }
        push(arg0, arg1, arg2, arg3, arg4) {
            if (typeof arg0 === 'number' && typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number' && (typeof arg4 === 'number' || typeof arg4 === 'undefined')) {
                if (typeof arg4 === 'undefined') {
                    arg4 = 0;
                }
                // 1st overload
                return this._pushEncoded(arg0, arg1, arg2, arg3, arg4);
            }
            if (Range.isRange(arg0) && typeof arg1 === 'string' && isStrArrayOrUndefined(arg2)) {
                // 2nd overload
                return this._push(arg0, arg1, arg2);
            }
            throw (0, errors_1.illegalArgument)();
        }
        _push(range, tokenType, tokenModifiers) {
            if (!this._hasLegend) {
                throw new Error('Legend must be provided in constructor');
            }
            if (range.start.line !== range.end.line) {
                throw new Error('`range` cannot span multiple lines');
            }
            if (!this._tokenTypeStrToInt.has(tokenType)) {
                throw new Error('`tokenType` is not in the provided legend');
            }
            const line = range.start.line;
            const char = range.start.character;
            const length = range.end.character - range.start.character;
            const nTokenType = this._tokenTypeStrToInt.get(tokenType);
            let nTokenModifiers = 0;
            if (tokenModifiers) {
                for (const tokenModifier of tokenModifiers) {
                    if (!this._tokenModifierStrToInt.has(tokenModifier)) {
                        throw new Error('`tokenModifier` is not in the provided legend');
                    }
                    const nTokenModifier = this._tokenModifierStrToInt.get(tokenModifier);
                    nTokenModifiers |= (1 << nTokenModifier) >>> 0;
                }
            }
            this._pushEncoded(line, char, length, nTokenType, nTokenModifiers);
        }
        _pushEncoded(line, char, length, tokenType, tokenModifiers) {
            if (this._dataIsSortedAndDeltaEncoded && (line < this._prevLine || (line === this._prevLine && char < this._prevChar))) {
                // push calls were ordered and are no longer ordered
                this._dataIsSortedAndDeltaEncoded = false;
                // Remove delta encoding from data
                const tokenCount = (this._data.length / 5) | 0;
                let prevLine = 0;
                let prevChar = 0;
                for (let i = 0; i < tokenCount; i++) {
                    let line = this._data[5 * i];
                    let char = this._data[5 * i + 1];
                    if (line === 0) {
                        // on the same line as previous token
                        line = prevLine;
                        char += prevChar;
                    }
                    else {
                        // on a different line than previous token
                        line += prevLine;
                    }
                    this._data[5 * i] = line;
                    this._data[5 * i + 1] = char;
                    prevLine = line;
                    prevChar = char;
                }
            }
            let pushLine = line;
            let pushChar = char;
            if (this._dataIsSortedAndDeltaEncoded && this._dataLen > 0) {
                pushLine -= this._prevLine;
                if (pushLine === 0) {
                    pushChar -= this._prevChar;
                }
            }
            this._data[this._dataLen++] = pushLine;
            this._data[this._dataLen++] = pushChar;
            this._data[this._dataLen++] = length;
            this._data[this._dataLen++] = tokenType;
            this._data[this._dataLen++] = tokenModifiers;
            this._prevLine = line;
            this._prevChar = char;
        }
        static _sortAndDeltaEncode(data) {
            const pos = [];
            const tokenCount = (data.length / 5) | 0;
            for (let i = 0; i < tokenCount; i++) {
                pos[i] = i;
            }
            pos.sort((a, b) => {
                const aLine = data[5 * a];
                const bLine = data[5 * b];
                if (aLine === bLine) {
                    const aChar = data[5 * a + 1];
                    const bChar = data[5 * b + 1];
                    return aChar - bChar;
                }
                return aLine - bLine;
            });
            const result = new Uint32Array(data.length);
            let prevLine = 0;
            let prevChar = 0;
            for (let i = 0; i < tokenCount; i++) {
                const srcOffset = 5 * pos[i];
                const line = data[srcOffset + 0];
                const char = data[srcOffset + 1];
                const length = data[srcOffset + 2];
                const tokenType = data[srcOffset + 3];
                const tokenModifiers = data[srcOffset + 4];
                const pushLine = line - prevLine;
                const pushChar = (pushLine === 0 ? char - prevChar : char);
                const dstOffset = 5 * i;
                result[dstOffset + 0] = pushLine;
                result[dstOffset + 1] = pushChar;
                result[dstOffset + 2] = length;
                result[dstOffset + 3] = tokenType;
                result[dstOffset + 4] = tokenModifiers;
                prevLine = line;
                prevChar = char;
            }
            return result;
        }
        build(resultId) {
            if (!this._dataIsSortedAndDeltaEncoded) {
                return new SemanticTokens(SemanticTokensBuilder._sortAndDeltaEncode(this._data), resultId);
            }
            return new SemanticTokens(new Uint32Array(this._data), resultId);
        }
    }
    exports.SemanticTokensBuilder = SemanticTokensBuilder;
    class SemanticTokens {
        constructor(data, resultId) {
            this.resultId = resultId;
            this.data = data;
        }
    }
    exports.SemanticTokens = SemanticTokens;
    class SemanticTokensEdit {
        constructor(start, deleteCount, data) {
            this.start = start;
            this.deleteCount = deleteCount;
            this.data = data;
        }
    }
    exports.SemanticTokensEdit = SemanticTokensEdit;
    class SemanticTokensEdits {
        constructor(edits, resultId) {
            this.resultId = resultId;
            this.edits = edits;
        }
    }
    exports.SemanticTokensEdits = SemanticTokensEdits;
    //#endregion
    //#region debug
    var DebugConsoleMode;
    (function (DebugConsoleMode) {
        /**
         * Debug session should have a separate debug console.
         */
        DebugConsoleMode[DebugConsoleMode["Separate"] = 0] = "Separate";
        /**
         * Debug session should share debug console with its parent session.
         * This value has no effect for sessions which do not have a parent session.
         */
        DebugConsoleMode[DebugConsoleMode["MergeWithParent"] = 1] = "MergeWithParent";
    })(DebugConsoleMode || (exports.DebugConsoleMode = DebugConsoleMode = {}));
    class DebugVisualization {
        constructor(name) {
            this.name = name;
        }
    }
    exports.DebugVisualization = DebugVisualization;
    //#endregion
    let QuickInputButtons = class QuickInputButtons {
        static { this.Back = { iconPath: new ThemeIcon('arrow-left') }; }
        constructor() { }
    };
    exports.QuickInputButtons = QuickInputButtons;
    exports.QuickInputButtons = QuickInputButtons = __decorate([
        es5ClassCompat
    ], QuickInputButtons);
    var QuickPickItemKind;
    (function (QuickPickItemKind) {
        QuickPickItemKind[QuickPickItemKind["Separator"] = -1] = "Separator";
        QuickPickItemKind[QuickPickItemKind["Default"] = 0] = "Default";
    })(QuickPickItemKind || (exports.QuickPickItemKind = QuickPickItemKind = {}));
    var InputBoxValidationSeverity;
    (function (InputBoxValidationSeverity) {
        InputBoxValidationSeverity[InputBoxValidationSeverity["Info"] = 1] = "Info";
        InputBoxValidationSeverity[InputBoxValidationSeverity["Warning"] = 2] = "Warning";
        InputBoxValidationSeverity[InputBoxValidationSeverity["Error"] = 3] = "Error";
    })(InputBoxValidationSeverity || (exports.InputBoxValidationSeverity = InputBoxValidationSeverity = {}));
    var ExtensionKind;
    (function (ExtensionKind) {
        ExtensionKind[ExtensionKind["UI"] = 1] = "UI";
        ExtensionKind[ExtensionKind["Workspace"] = 2] = "Workspace";
    })(ExtensionKind || (exports.ExtensionKind = ExtensionKind = {}));
    class FileDecoration {
        static validate(d) {
            if (typeof d.badge === 'string') {
                let len = (0, strings_1.nextCharLength)(d.badge, 0);
                if (len < d.badge.length) {
                    len += (0, strings_1.nextCharLength)(d.badge, len);
                }
                if (d.badge.length > len) {
                    throw new Error(`The 'badge'-property must be undefined or a short character`);
                }
            }
            else if (d.badge) {
                if (!ThemeIcon.isThemeIcon(d.badge)) {
                    throw new Error(`The 'badge'-property is not a valid ThemeIcon`);
                }
            }
            if (!d.color && !d.badge && !d.tooltip) {
                throw new Error(`The decoration is empty`);
            }
            return true;
        }
        constructor(badge, tooltip, color) {
            this.badge = badge;
            this.tooltip = tooltip;
            this.color = color;
        }
    }
    exports.FileDecoration = FileDecoration;
    //#region Theming
    let ColorTheme = class ColorTheme {
        constructor(kind) {
            this.kind = kind;
        }
    };
    exports.ColorTheme = ColorTheme;
    exports.ColorTheme = ColorTheme = __decorate([
        es5ClassCompat
    ], ColorTheme);
    var ColorThemeKind;
    (function (ColorThemeKind) {
        ColorThemeKind[ColorThemeKind["Light"] = 1] = "Light";
        ColorThemeKind[ColorThemeKind["Dark"] = 2] = "Dark";
        ColorThemeKind[ColorThemeKind["HighContrast"] = 3] = "HighContrast";
        ColorThemeKind[ColorThemeKind["HighContrastLight"] = 4] = "HighContrastLight";
    })(ColorThemeKind || (exports.ColorThemeKind = ColorThemeKind = {}));
    //#endregion Theming
    //#region Notebook
    class NotebookRange {
        static isNotebookRange(thing) {
            if (thing instanceof NotebookRange) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return typeof thing.start === 'number'
                && typeof thing.end === 'number';
        }
        get start() {
            return this._start;
        }
        get end() {
            return this._end;
        }
        get isEmpty() {
            return this._start === this._end;
        }
        constructor(start, end) {
            if (start < 0) {
                throw (0, errors_1.illegalArgument)('start must be positive');
            }
            if (end < 0) {
                throw (0, errors_1.illegalArgument)('end must be positive');
            }
            if (start <= end) {
                this._start = start;
                this._end = end;
            }
            else {
                this._start = end;
                this._end = start;
            }
        }
        with(change) {
            let start = this._start;
            let end = this._end;
            if (change.start !== undefined) {
                start = change.start;
            }
            if (change.end !== undefined) {
                end = change.end;
            }
            if (start === this._start && end === this._end) {
                return this;
            }
            return new NotebookRange(start, end);
        }
    }
    exports.NotebookRange = NotebookRange;
    class NotebookCellData {
        static validate(data) {
            if (typeof data.kind !== 'number') {
                throw new Error('NotebookCellData MUST have \'kind\' property');
            }
            if (typeof data.value !== 'string') {
                throw new Error('NotebookCellData MUST have \'value\' property');
            }
            if (typeof data.languageId !== 'string') {
                throw new Error('NotebookCellData MUST have \'languageId\' property');
            }
        }
        static isNotebookCellDataArray(value) {
            return Array.isArray(value) && value.every(elem => NotebookCellData.isNotebookCellData(elem));
        }
        static isNotebookCellData(value) {
            // return value instanceof NotebookCellData;
            return true;
        }
        constructor(kind, value, languageId, mime, outputs, metadata, executionSummary) {
            this.kind = kind;
            this.value = value;
            this.languageId = languageId;
            this.mime = mime;
            this.outputs = outputs ?? [];
            this.metadata = metadata;
            this.executionSummary = executionSummary;
            NotebookCellData.validate(this);
        }
    }
    exports.NotebookCellData = NotebookCellData;
    class NotebookData {
        constructor(cells) {
            this.cells = cells;
        }
    }
    exports.NotebookData = NotebookData;
    class NotebookCellOutputItem {
        static isNotebookCellOutputItem(obj) {
            if (obj instanceof NotebookCellOutputItem) {
                return true;
            }
            if (!obj) {
                return false;
            }
            return typeof obj.mime === 'string'
                && obj.data instanceof Uint8Array;
        }
        static error(err) {
            const obj = {
                name: err.name,
                message: err.message,
                stack: err.stack
            };
            return NotebookCellOutputItem.json(obj, 'application/vnd.code.notebook.error');
        }
        static stdout(value) {
            return NotebookCellOutputItem.text(value, 'application/vnd.code.notebook.stdout');
        }
        static stderr(value) {
            return NotebookCellOutputItem.text(value, 'application/vnd.code.notebook.stderr');
        }
        static bytes(value, mime = 'application/octet-stream') {
            return new NotebookCellOutputItem(value, mime);
        }
        static #encoder = new TextEncoder();
        static text(value, mime = mime_1.Mimes.text) {
            const bytes = NotebookCellOutputItem.#encoder.encode(String(value));
            return new NotebookCellOutputItem(bytes, mime);
        }
        static json(value, mime = 'text/x-json') {
            const rawStr = JSON.stringify(value, undefined, '\t');
            return NotebookCellOutputItem.text(rawStr, mime);
        }
        constructor(data, mime) {
            this.data = data;
            this.mime = mime;
            const mimeNormalized = (0, mime_1.normalizeMimeType)(mime, true);
            if (!mimeNormalized) {
                throw new Error(`INVALID mime type: ${mime}. Must be in the format "type/subtype[;optionalparameter]"`);
            }
            this.mime = mimeNormalized;
        }
    }
    exports.NotebookCellOutputItem = NotebookCellOutputItem;
    class NotebookCellOutput {
        static isNotebookCellOutput(candidate) {
            if (candidate instanceof NotebookCellOutput) {
                return true;
            }
            if (!candidate || typeof candidate !== 'object') {
                return false;
            }
            return typeof candidate.id === 'string' && Array.isArray(candidate.items);
        }
        static ensureUniqueMimeTypes(items, warn = false) {
            const seen = new Set();
            const removeIdx = new Set();
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const normalMime = (0, mime_1.normalizeMimeType)(item.mime);
                // We can have multiple text stream mime types in the same output.
                if (!seen.has(normalMime) || (0, notebookCommon_1.isTextStreamMime)(normalMime)) {
                    seen.add(normalMime);
                    continue;
                }
                // duplicated mime types... first has won
                removeIdx.add(i);
                if (warn) {
                    console.warn(`DUPLICATED mime type '${item.mime}' will be dropped`);
                }
            }
            if (removeIdx.size === 0) {
                return items;
            }
            return items.filter((_item, index) => !removeIdx.has(index));
        }
        constructor(items, idOrMetadata, metadata) {
            this.items = NotebookCellOutput.ensureUniqueMimeTypes(items, true);
            if (typeof idOrMetadata === 'string') {
                this.id = idOrMetadata;
                this.metadata = metadata;
            }
            else {
                this.id = (0, uuid_1.generateUuid)();
                this.metadata = idOrMetadata ?? metadata;
            }
        }
    }
    exports.NotebookCellOutput = NotebookCellOutput;
    var NotebookCellKind;
    (function (NotebookCellKind) {
        NotebookCellKind[NotebookCellKind["Markup"] = 1] = "Markup";
        NotebookCellKind[NotebookCellKind["Code"] = 2] = "Code";
    })(NotebookCellKind || (exports.NotebookCellKind = NotebookCellKind = {}));
    var NotebookCellExecutionState;
    (function (NotebookCellExecutionState) {
        NotebookCellExecutionState[NotebookCellExecutionState["Idle"] = 1] = "Idle";
        NotebookCellExecutionState[NotebookCellExecutionState["Pending"] = 2] = "Pending";
        NotebookCellExecutionState[NotebookCellExecutionState["Executing"] = 3] = "Executing";
    })(NotebookCellExecutionState || (exports.NotebookCellExecutionState = NotebookCellExecutionState = {}));
    var NotebookCellStatusBarAlignment;
    (function (NotebookCellStatusBarAlignment) {
        NotebookCellStatusBarAlignment[NotebookCellStatusBarAlignment["Left"] = 1] = "Left";
        NotebookCellStatusBarAlignment[NotebookCellStatusBarAlignment["Right"] = 2] = "Right";
    })(NotebookCellStatusBarAlignment || (exports.NotebookCellStatusBarAlignment = NotebookCellStatusBarAlignment = {}));
    var NotebookEditorRevealType;
    (function (NotebookEditorRevealType) {
        NotebookEditorRevealType[NotebookEditorRevealType["Default"] = 0] = "Default";
        NotebookEditorRevealType[NotebookEditorRevealType["InCenter"] = 1] = "InCenter";
        NotebookEditorRevealType[NotebookEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        NotebookEditorRevealType[NotebookEditorRevealType["AtTop"] = 3] = "AtTop";
    })(NotebookEditorRevealType || (exports.NotebookEditorRevealType = NotebookEditorRevealType = {}));
    class NotebookCellStatusBarItem {
        constructor(text, alignment) {
            this.text = text;
            this.alignment = alignment;
        }
    }
    exports.NotebookCellStatusBarItem = NotebookCellStatusBarItem;
    var NotebookControllerAffinity;
    (function (NotebookControllerAffinity) {
        NotebookControllerAffinity[NotebookControllerAffinity["Default"] = 1] = "Default";
        NotebookControllerAffinity[NotebookControllerAffinity["Preferred"] = 2] = "Preferred";
    })(NotebookControllerAffinity || (exports.NotebookControllerAffinity = NotebookControllerAffinity = {}));
    var NotebookControllerAffinity2;
    (function (NotebookControllerAffinity2) {
        NotebookControllerAffinity2[NotebookControllerAffinity2["Default"] = 1] = "Default";
        NotebookControllerAffinity2[NotebookControllerAffinity2["Preferred"] = 2] = "Preferred";
        NotebookControllerAffinity2[NotebookControllerAffinity2["Hidden"] = -1] = "Hidden";
    })(NotebookControllerAffinity2 || (exports.NotebookControllerAffinity2 = NotebookControllerAffinity2 = {}));
    class NotebookRendererScript {
        constructor(uri, provides = []) {
            this.uri = uri;
            this.provides = (0, arrays_1.asArray)(provides);
        }
    }
    exports.NotebookRendererScript = NotebookRendererScript;
    class NotebookKernelSourceAction {
        constructor(label) {
            this.label = label;
        }
    }
    exports.NotebookKernelSourceAction = NotebookKernelSourceAction;
    var NotebookVariablesRequestKind;
    (function (NotebookVariablesRequestKind) {
        NotebookVariablesRequestKind[NotebookVariablesRequestKind["Named"] = 1] = "Named";
        NotebookVariablesRequestKind[NotebookVariablesRequestKind["Indexed"] = 2] = "Indexed";
    })(NotebookVariablesRequestKind || (exports.NotebookVariablesRequestKind = NotebookVariablesRequestKind = {}));
    //#endregion
    //#region Timeline
    let TimelineItem = class TimelineItem {
        constructor(label, timestamp) {
            this.label = label;
            this.timestamp = timestamp;
        }
    };
    exports.TimelineItem = TimelineItem;
    exports.TimelineItem = TimelineItem = __decorate([
        es5ClassCompat
    ], TimelineItem);
    //#endregion Timeline
    //#region ExtensionContext
    var ExtensionMode;
    (function (ExtensionMode) {
        /**
         * The extension is installed normally (for example, from the marketplace
         * or VSIX) in VS Code.
         */
        ExtensionMode[ExtensionMode["Production"] = 1] = "Production";
        /**
         * The extension is running from an `--extensionDevelopmentPath` provided
         * when launching VS Code.
         */
        ExtensionMode[ExtensionMode["Development"] = 2] = "Development";
        /**
         * The extension is running from an `--extensionDevelopmentPath` and
         * the extension host is running unit tests.
         */
        ExtensionMode[ExtensionMode["Test"] = 3] = "Test";
    })(ExtensionMode || (exports.ExtensionMode = ExtensionMode = {}));
    var ExtensionRuntime;
    (function (ExtensionRuntime) {
        /**
         * The extension is running in a NodeJS extension host. Runtime access to NodeJS APIs is available.
         */
        ExtensionRuntime[ExtensionRuntime["Node"] = 1] = "Node";
        /**
         * The extension is running in a Webworker extension host. Runtime access is limited to Webworker APIs.
         */
        ExtensionRuntime[ExtensionRuntime["Webworker"] = 2] = "Webworker";
    })(ExtensionRuntime || (exports.ExtensionRuntime = ExtensionRuntime = {}));
    //#endregion ExtensionContext
    var StandardTokenType;
    (function (StandardTokenType) {
        StandardTokenType[StandardTokenType["Other"] = 0] = "Other";
        StandardTokenType[StandardTokenType["Comment"] = 1] = "Comment";
        StandardTokenType[StandardTokenType["String"] = 2] = "String";
        StandardTokenType[StandardTokenType["RegEx"] = 3] = "RegEx";
    })(StandardTokenType || (exports.StandardTokenType = StandardTokenType = {}));
    class LinkedEditingRanges {
        constructor(ranges, wordPattern) {
            this.ranges = ranges;
            this.wordPattern = wordPattern;
        }
    }
    exports.LinkedEditingRanges = LinkedEditingRanges;
    //#region ports
    class PortAttributes {
        constructor(autoForwardAction) {
            this._autoForwardAction = autoForwardAction;
        }
        get autoForwardAction() {
            return this._autoForwardAction;
        }
    }
    exports.PortAttributes = PortAttributes;
    //#endregion ports
    //#region Testing
    var TestResultState;
    (function (TestResultState) {
        TestResultState[TestResultState["Queued"] = 1] = "Queued";
        TestResultState[TestResultState["Running"] = 2] = "Running";
        TestResultState[TestResultState["Passed"] = 3] = "Passed";
        TestResultState[TestResultState["Failed"] = 4] = "Failed";
        TestResultState[TestResultState["Skipped"] = 5] = "Skipped";
        TestResultState[TestResultState["Errored"] = 6] = "Errored";
    })(TestResultState || (exports.TestResultState = TestResultState = {}));
    var TestRunProfileKind;
    (function (TestRunProfileKind) {
        TestRunProfileKind[TestRunProfileKind["Run"] = 1] = "Run";
        TestRunProfileKind[TestRunProfileKind["Debug"] = 2] = "Debug";
        TestRunProfileKind[TestRunProfileKind["Coverage"] = 3] = "Coverage";
    })(TestRunProfileKind || (exports.TestRunProfileKind = TestRunProfileKind = {}));
    let TestRunRequest = class TestRunRequest {
        constructor(include = undefined, exclude = undefined, profile = undefined, continuous = false) {
            this.include = include;
            this.exclude = exclude;
            this.profile = profile;
            this.continuous = continuous;
        }
    };
    exports.TestRunRequest = TestRunRequest;
    exports.TestRunRequest = TestRunRequest = __decorate([
        es5ClassCompat
    ], TestRunRequest);
    let TestMessage = TestMessage_1 = class TestMessage {
        static diff(message, expected, actual) {
            const msg = new TestMessage_1(message);
            msg.expectedOutput = expected;
            msg.actualOutput = actual;
            return msg;
        }
        constructor(message) {
            this.message = message;
        }
    };
    exports.TestMessage = TestMessage;
    exports.TestMessage = TestMessage = TestMessage_1 = __decorate([
        es5ClassCompat
    ], TestMessage);
    let TestTag = class TestTag {
        constructor(id) {
            this.id = id;
        }
    };
    exports.TestTag = TestTag;
    exports.TestTag = TestTag = __decorate([
        es5ClassCompat
    ], TestTag);
    //#endregion
    //#region Test Coverage
    class CoveredCount {
        constructor(covered, total) {
            this.covered = covered;
            this.total = total;
        }
    }
    exports.CoveredCount = CoveredCount;
    const validateCC = (cc) => {
        if (cc && cc.covered > cc.total) {
            throw new Error(`The total number of covered items (${cc.covered}) cannot be greater than the total (${cc.total})`);
        }
    };
    class FileCoverage {
        static fromDetails(uri, details) {
            const statements = new CoveredCount(0, 0);
            const branches = new CoveredCount(0, 0);
            const fn = new CoveredCount(0, 0);
            for (const detail of details) {
                if ('branches' in detail) {
                    statements.total += 1;
                    statements.covered += detail.executionCount > 0 ? 1 : 0;
                    for (const branch of detail.branches) {
                        branches.total += 1;
                        branches.covered += branch.executionCount > 0 ? 1 : 0;
                    }
                }
                else {
                    fn.total += 1;
                    fn.covered += detail.executionCount > 0 ? 1 : 0;
                }
            }
            const coverage = new FileCoverage(uri, statements, branches.total > 0 ? branches : undefined, fn.total > 0 ? fn : undefined);
            coverage.detailedCoverage = details;
            return coverage;
        }
        constructor(uri, statementCoverage, branchCoverage, functionCoverage) {
            this.uri = uri;
            this.statementCoverage = statementCoverage;
            this.branchCoverage = branchCoverage;
            this.functionCoverage = functionCoverage;
            validateCC(statementCoverage);
            validateCC(branchCoverage);
            validateCC(functionCoverage);
        }
    }
    exports.FileCoverage = FileCoverage;
    class StatementCoverage {
        constructor(executionCount, location, branches = []) {
            this.executionCount = executionCount;
            this.location = location;
            this.branches = branches;
        }
    }
    exports.StatementCoverage = StatementCoverage;
    class BranchCoverage {
        constructor(executionCount, location, label) {
            this.executionCount = executionCount;
            this.location = location;
            this.label = label;
        }
    }
    exports.BranchCoverage = BranchCoverage;
    class FunctionCoverage {
        constructor(name, executionCount, location) {
            this.name = name;
            this.executionCount = executionCount;
            this.location = location;
        }
    }
    exports.FunctionCoverage = FunctionCoverage;
    //#endregion
    var ExternalUriOpenerPriority;
    (function (ExternalUriOpenerPriority) {
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["None"] = 0] = "None";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Option"] = 1] = "Option";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Default"] = 2] = "Default";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Preferred"] = 3] = "Preferred";
    })(ExternalUriOpenerPriority || (exports.ExternalUriOpenerPriority = ExternalUriOpenerPriority = {}));
    var WorkspaceTrustState;
    (function (WorkspaceTrustState) {
        WorkspaceTrustState[WorkspaceTrustState["Untrusted"] = 0] = "Untrusted";
        WorkspaceTrustState[WorkspaceTrustState["Trusted"] = 1] = "Trusted";
        WorkspaceTrustState[WorkspaceTrustState["Unspecified"] = 2] = "Unspecified";
    })(WorkspaceTrustState || (exports.WorkspaceTrustState = WorkspaceTrustState = {}));
    var PortAutoForwardAction;
    (function (PortAutoForwardAction) {
        PortAutoForwardAction[PortAutoForwardAction["Notify"] = 1] = "Notify";
        PortAutoForwardAction[PortAutoForwardAction["OpenBrowser"] = 2] = "OpenBrowser";
        PortAutoForwardAction[PortAutoForwardAction["OpenPreview"] = 3] = "OpenPreview";
        PortAutoForwardAction[PortAutoForwardAction["Silent"] = 4] = "Silent";
        PortAutoForwardAction[PortAutoForwardAction["Ignore"] = 5] = "Ignore";
        PortAutoForwardAction[PortAutoForwardAction["OpenBrowserOnce"] = 6] = "OpenBrowserOnce";
    })(PortAutoForwardAction || (exports.PortAutoForwardAction = PortAutoForwardAction = {}));
    class TypeHierarchyItem {
        constructor(kind, name, detail, uri, range, selectionRange) {
            this.kind = kind;
            this.name = name;
            this.detail = detail;
            this.uri = uri;
            this.range = range;
            this.selectionRange = selectionRange;
        }
    }
    exports.TypeHierarchyItem = TypeHierarchyItem;
    //#region Tab Inputs
    class TextTabInput {
        constructor(uri) {
            this.uri = uri;
        }
    }
    exports.TextTabInput = TextTabInput;
    class TextDiffTabInput {
        constructor(original, modified) {
            this.original = original;
            this.modified = modified;
        }
    }
    exports.TextDiffTabInput = TextDiffTabInput;
    class TextMergeTabInput {
        constructor(base, input1, input2, result) {
            this.base = base;
            this.input1 = input1;
            this.input2 = input2;
            this.result = result;
        }
    }
    exports.TextMergeTabInput = TextMergeTabInput;
    class CustomEditorTabInput {
        constructor(uri, viewType) {
            this.uri = uri;
            this.viewType = viewType;
        }
    }
    exports.CustomEditorTabInput = CustomEditorTabInput;
    class WebviewEditorTabInput {
        constructor(viewType) {
            this.viewType = viewType;
        }
    }
    exports.WebviewEditorTabInput = WebviewEditorTabInput;
    class NotebookEditorTabInput {
        constructor(uri, notebookType) {
            this.uri = uri;
            this.notebookType = notebookType;
        }
    }
    exports.NotebookEditorTabInput = NotebookEditorTabInput;
    class NotebookDiffEditorTabInput {
        constructor(original, modified, notebookType) {
            this.original = original;
            this.modified = modified;
            this.notebookType = notebookType;
        }
    }
    exports.NotebookDiffEditorTabInput = NotebookDiffEditorTabInput;
    class TerminalEditorTabInput {
        constructor() { }
    }
    exports.TerminalEditorTabInput = TerminalEditorTabInput;
    class InteractiveWindowInput {
        constructor(uri, inputBoxUri) {
            this.uri = uri;
            this.inputBoxUri = inputBoxUri;
        }
    }
    exports.InteractiveWindowInput = InteractiveWindowInput;
    class ChatEditorTabInput {
        constructor(providerId) {
            this.providerId = providerId;
        }
    }
    exports.ChatEditorTabInput = ChatEditorTabInput;
    //#endregion
    //#region Chat
    var InteractiveSessionVoteDirection;
    (function (InteractiveSessionVoteDirection) {
        InteractiveSessionVoteDirection[InteractiveSessionVoteDirection["Down"] = 0] = "Down";
        InteractiveSessionVoteDirection[InteractiveSessionVoteDirection["Up"] = 1] = "Up";
    })(InteractiveSessionVoteDirection || (exports.InteractiveSessionVoteDirection = InteractiveSessionVoteDirection = {}));
    var ChatAgentCopyKind;
    (function (ChatAgentCopyKind) {
        ChatAgentCopyKind[ChatAgentCopyKind["Action"] = 1] = "Action";
        ChatAgentCopyKind[ChatAgentCopyKind["Toolbar"] = 2] = "Toolbar";
    })(ChatAgentCopyKind || (exports.ChatAgentCopyKind = ChatAgentCopyKind = {}));
    var ChatVariableLevel;
    (function (ChatVariableLevel) {
        ChatVariableLevel[ChatVariableLevel["Short"] = 1] = "Short";
        ChatVariableLevel[ChatVariableLevel["Medium"] = 2] = "Medium";
        ChatVariableLevel[ChatVariableLevel["Full"] = 3] = "Full";
    })(ChatVariableLevel || (exports.ChatVariableLevel = ChatVariableLevel = {}));
    class ChatAgentCompletionItem {
        constructor(label, values) {
            this.label = label;
            this.values = values;
        }
    }
    exports.ChatAgentCompletionItem = ChatAgentCompletionItem;
    //#endregion
    //#region Interactive Editor
    var InteractiveEditorResponseFeedbackKind;
    (function (InteractiveEditorResponseFeedbackKind) {
        InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Unhelpful"] = 0] = "Unhelpful";
        InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Helpful"] = 1] = "Helpful";
        InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Undone"] = 2] = "Undone";
        InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Accepted"] = 3] = "Accepted";
        InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Bug"] = 4] = "Bug";
    })(InteractiveEditorResponseFeedbackKind || (exports.InteractiveEditorResponseFeedbackKind = InteractiveEditorResponseFeedbackKind = {}));
    var ChatMessageRole;
    (function (ChatMessageRole) {
        ChatMessageRole[ChatMessageRole["System"] = 0] = "System";
        ChatMessageRole[ChatMessageRole["User"] = 1] = "User";
        ChatMessageRole[ChatMessageRole["Assistant"] = 2] = "Assistant";
        ChatMessageRole[ChatMessageRole["Function"] = 3] = "Function";
    })(ChatMessageRole || (exports.ChatMessageRole = ChatMessageRole = {}));
    class ChatMessage {
        constructor(role, content) {
            this.role = role;
            this.content = content;
        }
    }
    exports.ChatMessage = ChatMessage;
    var ChatAgentResultFeedbackKind;
    (function (ChatAgentResultFeedbackKind) {
        ChatAgentResultFeedbackKind[ChatAgentResultFeedbackKind["Unhelpful"] = 0] = "Unhelpful";
        ChatAgentResultFeedbackKind[ChatAgentResultFeedbackKind["Helpful"] = 1] = "Helpful";
    })(ChatAgentResultFeedbackKind || (exports.ChatAgentResultFeedbackKind = ChatAgentResultFeedbackKind = {}));
    //#endregion
    //#region ai
    var RelatedInformationType;
    (function (RelatedInformationType) {
        RelatedInformationType[RelatedInformationType["SymbolInformation"] = 1] = "SymbolInformation";
        RelatedInformationType[RelatedInformationType["CommandInformation"] = 2] = "CommandInformation";
        RelatedInformationType[RelatedInformationType["SearchInformation"] = 3] = "SearchInformation";
        RelatedInformationType[RelatedInformationType["SettingInformation"] = 4] = "SettingInformation";
    })(RelatedInformationType || (exports.RelatedInformationType = RelatedInformationType = {}));
    //#endregion
    //#region Speech
    var SpeechToTextStatus;
    (function (SpeechToTextStatus) {
        SpeechToTextStatus[SpeechToTextStatus["Started"] = 1] = "Started";
        SpeechToTextStatus[SpeechToTextStatus["Recognizing"] = 2] = "Recognizing";
        SpeechToTextStatus[SpeechToTextStatus["Recognized"] = 3] = "Recognized";
        SpeechToTextStatus[SpeechToTextStatus["Stopped"] = 4] = "Stopped";
    })(SpeechToTextStatus || (exports.SpeechToTextStatus = SpeechToTextStatus = {}));
    var KeywordRecognitionStatus;
    (function (KeywordRecognitionStatus) {
        KeywordRecognitionStatus[KeywordRecognitionStatus["Recognized"] = 1] = "Recognized";
        KeywordRecognitionStatus[KeywordRecognitionStatus["Stopped"] = 2] = "Stopped";
    })(KeywordRecognitionStatus || (exports.KeywordRecognitionStatus = KeywordRecognitionStatus = {}));
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFR5cGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0VHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7OztJQXFCaEc7Ozs7O1NBS0s7SUFDTCxTQUFTLGNBQWMsQ0FBQyxNQUFnQjtRQUN2QyxNQUFNLGtCQUFrQixHQUFHO1lBQzFCLEtBQUssRUFBRSxVQUFVLEdBQUcsSUFBVztnQkFDOUIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUN2QixPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsRCxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2pFLENBQUM7WUFDRixDQUFDO1lBQ0QsSUFBSSxFQUFFLFVBQVUsR0FBRyxJQUFXO2dCQUM3QixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ3ZCLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDO29CQUNwQyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEs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