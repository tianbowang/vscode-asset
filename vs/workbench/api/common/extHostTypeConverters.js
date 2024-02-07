(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/buffer", "vs/base/common/dataTransfer", "vs/base/common/functional", "vs/base/common/htmlContent", "vs/base/common/map", "vs/base/common/marked/marked", "vs/base/common/marshalling", "vs/base/common/mime", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/platform/markers/common/markers", "vs/workbench/api/common/extHostTestingPrivateApi", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "./extHostTypes"], function (require, exports, arrays_1, buffer_1, dataTransfer_1, functional_1, htmlContent, map_1, marked_1, marshalling_1, mime_1, objects_1, types_1, uri_1, editorRange, languages, markers_1, extHostTestingPrivateApi_1, editor_1, notebooks, testId_1, testTypes_1, editorService_1, extensions_1, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalQuickFix = exports.ChatAgentCompletionItem = exports.ChatAgentRequest = exports.ChatResponseProgress = exports.InteractiveEditorResponseFeedbackKind = exports.ChatVariableLevel = exports.ChatVariable = exports.ChatMessageRole = exports.ChatMessage = exports.ChatFollowup = exports.ChatReplyFollowup = exports.DataTransfer = exports.DataTransferItem = exports.ViewBadge = exports.TypeHierarchyItem = exports.CodeActionTriggerKind = exports.TestCoverage = exports.TestResults = exports.TestItem = exports.TestTag = exports.TestMessage = exports.NotebookRendererScript = exports.NotebookDocumentContentOptions = exports.NotebookKernelSourceAction = exports.NotebookStatusBarItem = exports.NotebookExclusiveDocumentPattern = exports.NotebookCellOutput = exports.NotebookCellOutputItem = exports.NotebookCellData = exports.NotebookData = exports.NotebookCellKind = exports.NotebookCellExecutionState = exports.NotebookCellExecutionSummary = exports.NotebookRange = exports.MappedEditsContext = exports.LanguageSelector = exports.GlobPattern = exports.TextEditorOpenOptions = exports.FoldingRangeKind = exports.FoldingRange = exports.ProgressLocation = exports.EndOfLine = exports.TextEditorLineNumbersStyle = exports.TextDocumentSaveReason = exports.SelectionRange = exports.Color = exports.ColorPresentation = exports.DocumentLink = exports.InlayHintKind = exports.InlayHintLabelPart = exports.InlayHint = exports.SignatureHelp = exports.SignatureInformation = exports.ParameterInformation = exports.CompletionItem = exports.CompletionItemKind = exports.CompletionItemTag = exports.CompletionContext = exports.CompletionTriggerKind = exports.MultiDocumentHighlight = exports.DocumentHighlight = exports.InlineValueContext = exports.InlineValue = exports.EvaluatableExpression = exports.Hover = exports.DefinitionLink = exports.location = exports.CallHierarchyOutgoingCall = exports.CallHierarchyIncomingCall = exports.CallHierarchyItem = exports.DocumentSymbol = exports.WorkspaceSymbol = exports.SymbolTag = exports.SymbolKind = exports.WorkspaceEdit = exports.TextEdit = exports.DecorationRenderOptions = exports.DecorationRangeBehavior = exports.ThemableDecorationRenderOptions = exports.ThemableDecorationAttachmentRenderOptions = exports.pathOrURIToURI = exports.fromRangeOrRangeWithMessage = exports.MarkdownString = exports.isDecorationOptionsArr = exports.ViewColumn = exports.DiagnosticSeverity = exports.DiagnosticRelatedInformation = exports.Diagnostic = exports.DiagnosticTag = exports.DocumentSelector = exports.Position = exports.TokenType = exports.Location = exports.Range = exports.Selection = void 0;
    var Selection;
    (function (Selection) {
        function to(selection) {
            const { selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn } = selection;
            const start = new types.Position(selectionStartLineNumber - 1, selectionStartColumn - 1);
            const end = new types.Position(positionLineNumber - 1, positionColumn - 1);
            return new types.Selection(start, end);
        }
        Selection.to = to;
        function from(selection) {
            const { anchor, active } = selection;
            return {
                selectionStartLineNumber: anchor.line + 1,
                selectionStartColumn: anchor.character + 1,
                positionLineNumber: active.line + 1,
                positionColumn: active.character + 1
            };
        }
        Selection.from = from;
    })(Selection || (exports.Selection = Selection = {}));
    var Range;
    (function (Range) {
        function from(range) {
            if (!range) {
                return undefined;
            }
            const { start, end } = range;
            return {
                startLineNumber: start.line + 1,
                startColumn: start.character + 1,
                endLineNumber: end.line + 1,
                endColumn: end.character + 1
            };
        }
        Range.from = from;
        function to(range) {
            if (!range) {
                return undefined;
            }
            const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
            return new types.Range(startLineNumber - 1, startColumn - 1, endLineNumber - 1, endColumn - 1);
        }
        Range.to = to;
    })(Range || (exports.Range = Range = {}));
    var Location;
    (function (Location) {
        function to(location) {
            return new types.Location(uri_1.URI.revive(location.uri), Range.to(location.range));
        }
        Location.to = to;
    })(Location || (exports.Location = Location = {}));
    var TokenType;
    (function (TokenType) {
        function to(type) {
            switch (type) {
                case 1 /* encodedTokenAttributes.StandardTokenType.Comment */: return types.StandardTokenType.Comment;
                case 0 /* encodedTokenAttributes.StandardTokenType.Other */: return types.StandardTokenType.Other;
                case 3 /* encodedTokenAttributes.StandardTokenType.RegEx */: return types.StandardTokenType.RegEx;
                case 2 /* encodedTokenAttributes.StandardTokenType.String */: return types.StandardTokenType.String;
            }
        }
        TokenType.to = to;
    })(TokenType || (exports.TokenType = TokenType = {}));
    var Position;
    (function (Position) {
        function to(position) {
            return new types.Position(position.lineNumber - 1, position.column - 1);
        }
        Position.to = to;
        function from(position) {
            return { lineNumber: position.line + 1, column: position.character + 1 };
        }
        Position.from = from;
    })(Position || (exports.Position = Position = {}));
    var DocumentSelector;
    (function (DocumentSelector) {
        function from(value, uriTransformer, extension) {
            return (0, arrays_1.coalesce)((0, arrays_1.asArray)(value).map(sel => _doTransformDocumentSelector(sel, uriTransformer, extension)));
        }
        DocumentSelector.from = from;
        function _doTransformDocumentSelector(selector, uriTransformer, extension) {
            if (typeof selector === 'string') {
                return {
                    $serialized: true,
                    language: selector,
                    isBuiltin: extension?.isBuiltin,
                };
            }
            if (selector) {
                return {
                    $serialized: true,
                    language: selector.language,
                    scheme: _transformScheme(selector.scheme, uriTransformer),
                    pattern: GlobPattern.from(selector.pattern) ?? undefined,
                    exclusive: selector.exclusive,
                    notebookType: selector.notebookType,
                    isBuiltin: extension?.isBuiltin
                };
            }
            return undefined;
        }
        function _transformScheme(scheme, uriTransformer) {
            if (uriTransformer && typeof scheme === 'string') {
                return uriTransformer.transformOutgoingScheme(scheme);
            }
            return scheme;
        }
    })(DocumentSelector || (exports.DocumentSelector = DocumentSelector = {}));
    var DiagnosticTag;
    (function (DiagnosticTag) {
        function from(value) {
            switch (value) {
                case types.DiagnosticTag.Unnecessary:
                    return 1 /* MarkerTag.Unnecessary */;
                case types.DiagnosticTag.Deprecated:
                    return 2 /* MarkerTag.Deprecated */;
            }
            return undefined;
        }
        DiagnosticTag.from = from;
        function to(value) {
            switch (value) {
                case 1 /* MarkerTag.Unnecessary */:
                    return types.DiagnosticTag.Unnecessary;
                case 2 /* MarkerTag.Deprecated */:
                    return types.DiagnosticTag.Deprecated;
                default:
                    return undefined;
            }
        }
        DiagnosticTag.to = to;
    })(DiagnosticTag || (exports.DiagnosticTag = DiagnosticTag = {}));
    var Diagnostic;
    (function (Diagnostic) {
        function from(value) {
            let code;
            if (value.code) {
                if ((0, types_1.isString)(value.code) || (0, types_1.isNumber)(value.code)) {
                    code = String(value.code);
                }
                else {
                    code = {
                        value: String(value.code.value),
                        target: value.code.target,
                    };
                }
            }
            return {
                ...Range.from(value.range),
                message: value.message,
                source: value.source,
                code,
                severity: DiagnosticSeverity.from(value.severity),
                relatedInformation: value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation.from),
                tags: Array.isArray(value.tags) ? (0, arrays_1.coalesce)(value.tags.map(DiagnosticTag.from)) : undefined,
            };
        }
        Diagnostic.from = from;
        function to(value) {
            const res = new types.Diagnostic(Range.to(value), value.message, DiagnosticSeverity.to(value.severity));
            res.source = value.source;
            res.code = (0, types_1.isString)(value.code) ? value.code : value.code?.value;
            res.relatedInformation = value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation.to);
            res.tags = value.tags && (0, arrays_1.coalesce)(value.tags.map(DiagnosticTag.to));
            return res;
        }
        Diagnostic.to = to;
    })(Diagnostic || (exports.Diagnostic = Diagnostic = {}));
    var DiagnosticRelatedInformation;
    (function (DiagnosticRelatedInformation) {
        function from(value) {
            return {
                ...Range.from(value.location.range),
                message: value.message,
                resource: value.location.uri
            };
        }
        DiagnosticRelatedInformation.from = from;
        function to(value) {
            return new types.DiagnosticRelatedInformation(new types.Location(value.resource, Range.to(value)), value.message);
        }
        DiagnosticRelatedInformation.to = to;
    })(DiagnosticRelatedInformation || (exports.DiagnosticRelatedInformation = DiagnosticRelatedInformation = {}));
    var DiagnosticSeverity;
    (function (DiagnosticSeverity) {
        function from(value) {
            switch (value) {
                case types.DiagnosticSeverity.Error:
                    return markers_1.MarkerSeverity.Error;
                case types.DiagnosticSeverity.Warning:
                    return markers_1.MarkerSeverity.Warning;
                case types.DiagnosticSeverity.Information:
                    return markers_1.MarkerSeverity.Info;
                case types.DiagnosticSeverity.Hint:
                    return markers_1.MarkerSeverity.Hint;
            }
            return markers_1.MarkerSeverity.Error;
        }
        DiagnosticSeverity.from = from;
        function to(value) {
            switch (value) {
                case markers_1.MarkerSeverity.Info:
                    return types.DiagnosticSeverity.Information;
                case markers_1.MarkerSeverity.Warning:
                    return types.DiagnosticSeverity.Warning;
                case markers_1.MarkerSeverity.Error:
                    return types.DiagnosticSeverity.Error;
                case markers_1.MarkerSeverity.Hint:
                    return types.DiagnosticSeverity.Hint;
                default:
                    return types.DiagnosticSeverity.Error;
            }
        }
        DiagnosticSeverity.to = to;
    })(DiagnosticSeverity || (exports.DiagnosticSeverity = DiagnosticSeverity = {}));
    var ViewColumn;
    (function (ViewColumn) {
        function from(column) {
            if (typeof column === 'number' && column >= types.ViewColumn.One) {
                return column - 1; // adjust zero index (ViewColumn.ONE => 0)
            }
            if (column === types.ViewColumn.Beside) {
                return editorService_1.SIDE_GROUP;
            }
            return editorService_1.ACTIVE_GROUP; // default is always the active group
        }
        ViewColumn.from = from;
        function to(position) {
            if (typeof position === 'number' && position >= 0) {
                return position + 1; // adjust to index (ViewColumn.ONE => 1)
            }
            throw new Error(`invalid 'EditorGroupColumn'`);
        }
        ViewColumn.to = to;
    })(ViewColumn || (exports.ViewColumn = ViewColumn = {}));
    function isDecorationOptions(something) {
        return (typeof something.range !== 'undefined');
    }
    function isDecorationOptionsArr(something) {
        if (something.length === 0) {
            return true;
        }
        return isDecorationOptions(something[0]) ? true : false;
    }
    exports.isDecorationOptionsArr = isDecorationOptionsArr;
    var MarkdownString;
    (function (MarkdownString) {
        function fromMany(markup) {
            return markup.map(MarkdownString.from);
        }
        MarkdownString.fromMany = fromMany;
        function isCodeblock(thing) {
            return thing && typeof thing === 'object'
                && typeof thing.language === 'string'
                && typeof thing.value === 'string';
        }
        function from(markup) {
            let res;
            if (isCodeblock(markup)) {
                const { language, value } = markup;
                res = { value: '```' + language + '\n' + value + '\n```\n' };
            }
            else if (types.MarkdownString.isMarkdownString(markup)) {
                res = { value: markup.value, isTrusted: markup.isTrusted, supportThemeIcons: markup.supportThemeIcons, supportHtml: markup.supportHtml, baseUri: markup.baseUri };
            }
            else if (typeof markup === 'string') {
                res = { value: markup };
            }
            else {
                res = { value: '' };
            }
            // extract uris into a separate object
            const resUris = Object.create(null);
            res.uris = resUris;
            const collectUri = (href) => {
                try {
                    let uri = uri_1.URI.parse(href, true);
                    uri = uri.with({ query: _uriMassage(uri.query, resUris) });
                    resUris[href] = uri;
                }
                catch (e) {
                    // ignore
                }
                return '';
            };
            const renderer = new marked_1.marked.Renderer();
            renderer.link = collectUri;
            renderer.image = href => typeof href === 'string' ? collectUri(htmlContent.parseHrefAndDimensions(href).href) : '';
            (0, marked_1.marked)(res.value, { renderer });
            return res;
        }
        MarkdownString.from = from;
        function _uriMassage(part, bucket) {
            if (!part) {
                return part;
            }
            let data;
            try {
                data = (0, marshalling_1.parse)(part);
            }
            catch (e) {
                // ignore
            }
            if (!data) {
                return part;
            }
            let changed = false;
            data = (0, objects_1.cloneAndChange)(data, value => {
                if (uri_1.URI.isUri(value)) {
                    const key = `__uri_${Math.random().toString(16).slice(2, 8)}`;
                    bucket[key] = value;
                    changed = true;
                    return key;
                }
                else {
                    return undefined;
                }
            });
            if (!changed) {
                return part;
            }
            return JSON.stringify(data);
        }
        function to(value) {
            const result = new types.MarkdownString(value.value, value.supportThemeIcons);
            result.isTrusted = value.isTrusted;
            result.supportHtml = value.supportHtml;
            result.baseUri = value.baseUri ? uri_1.URI.from(value.baseUri) : undefined;
            return result;
        }
        MarkdownString.to = to;
        function fromStrict(value) {
            if (!value) {
                return undefined;
            }
            return typeof value === 'string' ? value : MarkdownString.from(value);
        }
        MarkdownString.fromStrict = fromStrict;
    })(MarkdownString || (exports.MarkdownString = MarkdownString = {}));
    function fromRangeOrRangeWithMessage(ranges) {
        if (isDecorationOptionsArr(ranges)) {
            return ranges.map((r) => {
                return {
                    range: Range.from(r.range),
                    hoverMessage: Array.isArray(r.hoverMessage)
                        ? MarkdownString.fromMany(r.hoverMessage)
                        : (r.hoverMessage ? MarkdownString.from(r.hoverMessage) : undefined),
                    renderOptions: /* URI vs Uri */ r.renderOptions
                };
            });
        }
        else {
            return ranges.map((r) => {
                return {
                    range: Range.from(r)
                };
            });
        }
    }
    exports.fromRangeOrRangeWithMessage = fromRangeOrRangeWithMessage;
    function pathOrURIToURI(value) {
        if (typeof value === 'undefined') {
            return value;
        }
        if (typeof value === 'string') {
            return uri_1.URI.file(value);
        }
        else {
            return value;
        }
    }
    exports.pathOrURIToURI = pathOrURIToURI;
    var ThemableDecorationAttachmentRenderOptions;
    (function (ThemableDecorationAttachmentRenderOptions) {
        function from(options) {
            if (typeof options === 'undefined') {
                return options;
            }
            return {
                contentText: options.contentText,
                contentIconPath: options.contentIconPath ? pathOrURIToURI(options.contentIconPath) : undefined,
                border: options.border,
                borderColor: options.borderColor,
                fontStyle: options.fontStyle,
                fontWeight: options.fontWeight,
                textDecoration: options.textDecoration,
                color: options.color,
                backgroundColor: options.backgroundColor,
                margin: options.margin,
                width: options.width,
                height: options.height,
            };
        }
        ThemableDecorationAttachmentRenderOptions.from = from;
    })(ThemableDecorationAttachmentRenderOptions || (exports.ThemableDecorationAttachmentRenderOptions = ThemableDecorationAttachmentRenderOptions = {}));
    var ThemableDecorationRenderOptions;
    (function (ThemableDecorationRenderOptions) {
        function from(options) {
            if (typeof options === 'undefined') {
                return options;
            }
            return {
                backgroundColor: options.backgroundColor,
                outline: options.outline,
                outlineColor: options.outlineColor,
                outlineStyle: options.outlineStyle,
                outlineWidth: options.outlineWidth,
                border: options.border,
                borderColor: options.borderColor,
                borderRadius: options.borderRadius,
                borderSpacing: options.borderSpacing,
                borderStyle: options.borderStyle,
                borderWidth: options.borderWidth,
                fontStyle: options.fontStyle,
                fontWeight: options.fontWeight,
                textDecoration: options.textDecoration,
                cursor: options.cursor,
                color: options.color,
                opacity: options.opacity,
                letterSpacing: options.letterSpacing,
                gutterIconPath: options.gutterIconPath ? pathOrURIToURI(options.gutterIconPath) : undefined,
                gutterIconSize: options.gutterIconSize,
                overviewRulerColor: options.overviewRulerColor,
                before: options.before ? ThemableDecorationAttachmentRenderOptions.from(options.before) : undefined,
                after: options.after ? ThemableDecorationAttachmentRenderOptions.from(options.after) : undefined,
            };
        }
        ThemableDecorationRenderOptions.from = from;
    })(ThemableDecorationRenderOptions || (exports.ThemableDecorationRenderOptions = ThemableDecorationRenderOptions = {}));
    var DecorationRangeBehavior;
    (function (DecorationRangeBehavior) {
        function from(value) {
            if (typeof value === 'undefined') {
                return value;
            }
            switch (value) {
                case types.DecorationRangeBehavior.OpenOpen:
                    return 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */;
                case types.DecorationRangeBehavior.ClosedClosed:
                    return 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */;
                case types.DecorationRangeBehavior.OpenClosed:
                    return 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */;
                case types.DecorationRangeBehavior.ClosedOpen:
                    return 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */;
            }
        }
        DecorationRangeBehavior.from = from;
    })(DecorationRangeBehavior || (exports.DecorationRangeBehavior = DecorationRangeBehavior = {}));
    var DecorationRenderOptions;
    (function (DecorationRenderOptions) {
        function from(options) {
            return {
                isWholeLine: options.isWholeLine,
                rangeBehavior: options.rangeBehavior ? DecorationRangeBehavior.from(options.rangeBehavior) : undefined,
                overviewRulerLane: options.overviewRulerLane,
                light: options.light ? ThemableDecorationRenderOptions.from(options.light) : undefined,
                dark: options.dark ? ThemableDecorationRenderOptions.from(options.dark) : undefined,
                backgroundColor: options.backgroundColor,
                outline: options.outline,
                outlineColor: options.outlineColor,
                outlineStyle: options.outlineStyle,
                outlineWidth: options.outlineWidth,
                border: options.border,
                borderColor: options.borderColor,
                borderRadius: options.borderRadius,
                borderSpacing: options.borderSpacing,
                borderStyle: options.borderStyle,
                borderWidth: options.borderWidth,
                fontStyle: options.fontStyle,
                fontWeight: options.fontWeight,
                textDecoration: options.textDecoration,
                cursor: options.cursor,
                color: options.color,
                opacity: options.opacity,
                letterSpacing: options.letterSpacing,
                gutterIconPath: options.gutterIconPath ? pathOrURIToURI(options.gutterIconPath) : undefined,
                gutterIconSize: options.gutterIconSize,
                overviewRulerColor: options.overviewRulerColor,
                before: options.before ? ThemableDecorationAttachmentRenderOptions.from(options.before) : undefined,
                after: options.after ? ThemableDecorationAttachmentRenderOptions.from(options.after) : undefined,
            };
        }
        DecorationRenderOptions.from = from;
    })(DecorationRenderOptions || (exports.DecorationRenderOptions = DecorationRenderOptions = {}));
    var TextEdit;
    (function (TextEdit) {
        function from(edit) {
            return {
                text: edit.newText,
                eol: edit.newEol && EndOfLine.from(edit.newEol),
                range: Range.from(edit.range)
            };
        }
        TextEdit.from = from;
        function to(edit) {
            const result = new types.TextEdit(Range.to(edit.range), edit.text);
            result.newEol = (typeof edit.eol === 'undefined' ? undefined : EndOfLine.to(edit.eol));
            return result;
        }
        TextEdit.to = to;
    })(TextEdit || (exports.TextEdit = TextEdit = {}));
    var WorkspaceEdit;
    (function (WorkspaceEdit) {
        function from(value, versionInfo) {
            const result = {
                edits: []
            };
            if (value instanceof types.WorkspaceEdit) {
                // collect all files that are to be created so that their version
                // information (in case they exist as text model already) can be ignored
                const toCreate = new map_1.ResourceSet();
                for (const entry of value._allEntries()) {
                    if (entry._type === 1 /* types.FileEditType.File */ && uri_1.URI.isUri(entry.to) && entry.from === undefined) {
                        toCreate.add(entry.to);
                    }
                }
                for (const entry of value._allEntries()) {
                    if (entry._type === 1 /* types.FileEditType.File */) {
                        let contents;
                        if (entry.options?.contents) {
                            if (ArrayBuffer.isView(entry.options.contents)) {
                                contents = { type: 'base64', value: (0, buffer_1.encodeBase64)(buffer_1.VSBuffer.wrap(entry.options.contents)) };
                            }
                            else {
                                contents = { type: 'dataTransferItem', id: entry.options.contents._itemId };
                            }
                        }
                        // file operation
                        result.edits.push({
                            oldResource: entry.from,
                            newResource: entry.to,
                            options: { ...entry.options, contents },
                            metadata: entry.metadata
                        });
                    }
                    else if (entry._type === 2 /* types.FileEditType.Text */) {
                        // text edits
                        result.edits.push({
                            resource: entry.uri,
                            textEdit: TextEdit.from(entry.edit),
                            versionId: !toCreate.has(entry.uri) ? versionInfo?.getTextDocumentVersion(entry.uri) : undefined,
                            metadata: entry.metadata
                        });
                    }
                    else if (entry._type === 6 /* types.FileEditType.Snippet */) {
                        result.edits.push({
                            resource: entry.uri,
                            textEdit: {
                                range: Range.from(entry.range),
                                text: entry.edit.value,
                                insertAsSnippet: true
                            },
                            versionId: !toCreate.has(entry.uri) ? versionInfo?.getTextDocumentVersion(entry.uri) : undefined,
                            metadata: entry.metadata
                        });
                    }
                    else if (entry._type === 3 /* types.FileEditType.Cell */) {
                        // cell edit
                        result.edits.push({
                            metadata: entry.metadata,
                            resource: entry.uri,
                            cellEdit: entry.edit,
                            notebookMetadata: entry.notebookMetadata,
                            notebookVersionId: versionInfo?.getNotebookDocumentVersion(entry.uri)
                        });
                    }
                    else if (entry._type === 5 /* types.FileEditType.CellReplace */) {
                        // cell replace
                        result.edits.push({
                            metadata: entry.metadata,
                            resource: entry.uri,
                            notebookVersionId: versionInfo?.getNotebookDocumentVersion(entry.uri),
                            cellEdit: {
                                editType: 1 /* notebooks.CellEditType.Replace */,
                                index: entry.index,
                                count: entry.count,
                                cells: entry.cells.map(NotebookCellData.from)
                            }
                        });
                    }
                }
            }
            return result;
        }
        WorkspaceEdit.from = from;
        function to(value) {
            const result = new types.WorkspaceEdit();
            const edits = new map_1.ResourceMap();
            for (const edit of value.edits) {
                if (edit.textEdit) {
                    const item = edit;
                    const uri = uri_1.URI.revive(item.resource);
                    const range = Range.to(item.textEdit.range);
                    const text = item.textEdit.text;
                    const isSnippet = item.textEdit.insertAsSnippet;
                    let editOrSnippetTest;
                    if (isSnippet) {
                        editOrSnippetTest = types.SnippetTextEdit.replace(range, new types.SnippetString(text));
                    }
                    else {
                        editOrSnippetTest = types.TextEdit.replace(range, text);
                    }
                    const array = edits.get(uri);
                    if (!array) {
                        edits.set(uri, [editOrSnippetTest]);
                    }
                    else {
                        array.push(editOrSnippetTest);
                    }
                }
                else {
                    result.renameFile(uri_1.URI.revive(edit.oldResource), uri_1.URI.revive(edit.newResource), edit.options);
                }
            }
            for (const [uri, array] of edits) {
                result.set(uri, array);
            }
            return result;
        }
        WorkspaceEdit.to = to;
    })(WorkspaceEdit || (exports.WorkspaceEdit = WorkspaceEdit = {}));
    var SymbolKind;
    (function (SymbolKind) {
        const _fromMapping = Object.create(null);
        _fromMapping[types.SymbolKind.File] = 0 /* languages.SymbolKind.File */;
        _fromMapping[types.SymbolKind.Module] = 1 /* languages.SymbolKind.Module */;
        _fromMapping[types.SymbolKind.Namespace] = 2 /* languages.SymbolKind.Namespace */;
        _fromMapping[types.SymbolKind.Package] = 3 /* languages.SymbolKind.Package */;
        _fromMapping[types.SymbolKind.Class] = 4 /* languages.SymbolKind.Class */;
        _fromMapping[types.SymbolKind.Method] = 5 /* languages.SymbolKind.Method */;
        _fromMapping[types.SymbolKind.Property] = 6 /* languages.SymbolKind.Property */;
        _fromMapping[types.SymbolKind.Field] = 7 /* languages.SymbolKind.Field */;
        _fromMapping[types.SymbolKind.Constructor] = 8 /* languages.SymbolKind.Constructor */;
        _fromMapping[types.SymbolKind.Enum] = 9 /* languages.SymbolKind.Enum */;
        _fromMapping[types.SymbolKind.Interface] = 10 /* languages.SymbolKind.Interface */;
        _fromMapping[types.SymbolKind.Function] = 11 /* languages.SymbolKind.Function */;
        _fromMapping[types.SymbolKind.Variable] = 12 /* languages.SymbolKind.Variable */;
        _fromMapping[types.SymbolKind.Constant] = 13 /* languages.SymbolKind.Constant */;
        _fromMapping[types.SymbolKind.String] = 14 /* languages.SymbolKind.String */;
        _fromMapping[types.SymbolKind.Number] = 15 /* languages.SymbolKind.Number */;
        _fromMapping[types.SymbolKind.Boolean] = 16 /* languages.SymbolKind.Boolean */;
        _fromMapping[types.SymbolKind.Array] = 17 /* languages.SymbolKind.Array */;
        _fromMapping[types.SymbolKind.Object] = 18 /* languages.SymbolKind.Object */;
        _fromMapping[types.SymbolKind.Key] = 19 /* languages.SymbolKind.Key */;
        _fromMapping[types.SymbolKind.Null] = 20 /* languages.SymbolKind.Null */;
        _fromMapping[types.SymbolKind.EnumMember] = 21 /* languages.SymbolKind.EnumMember */;
        _fromMapping[types.SymbolKind.Struct] = 22 /* languages.SymbolKind.Struct */;
        _fromMapping[types.SymbolKind.Event] = 23 /* languages.SymbolKind.Event */;
        _fromMapping[types.SymbolKind.Operator] = 24 /* languages.SymbolKind.Operator */;
        _fromMapping[types.SymbolKind.TypeParameter] = 25 /* languages.SymbolKind.TypeParameter */;
        function from(kind) {
            return typeof _fromMapping[kind] === 'number' ? _fromMapping[kind] : 6 /* languages.SymbolKind.Property */;
        }
        SymbolKind.from = from;
        function to(kind) {
            for (const k in _fromMapping) {
                if (_fromMapping[k] === kind) {
                    return Number(k);
                }
            }
            return types.SymbolKind.Property;
        }
        SymbolKind.to = to;
    })(SymbolKind || (exports.SymbolKind = SymbolKind = {}));
    var SymbolTag;
    (function (SymbolTag) {
        function from(kind) {
            switch (kind) {
                case types.SymbolTag.Deprecated: return 1 /* languages.SymbolTag.Deprecated */;
            }
        }
        SymbolTag.from = from;
        function to(kind) {
            switch (kind) {
                case 1 /* languages.SymbolTag.Deprecated */: return types.SymbolTag.Deprecated;
            }
        }
        SymbolTag.to = to;
    })(SymbolTag || (exports.SymbolTag = SymbolTag = {}));
    var WorkspaceSymbol;
    (function (WorkspaceSymbol) {
        function from(info) {
            return {
                name: info.name,
                kind: SymbolKind.from(info.kind),
                tags: info.tags && info.tags.map(SymbolTag.from),
                containerName: info.containerName,
                location: location.from(info.location)
            };
        }
        WorkspaceSymbol.from = from;
        function to(info) {
            const result = new types.SymbolInformation(info.name, SymbolKind.to(info.kind), info.containerName, location.to(info.location));
            result.tags = info.tags && info.tags.map(SymbolTag.to);
            return result;
        }
        WorkspaceSymbol.to = to;
    })(WorkspaceSymbol || (exports.WorkspaceSymbol = WorkspaceSymbol = {}));
    var DocumentSymbol;
    (function (DocumentSymbol) {
        function from(info) {
            const result = {
                name: info.name || '!!MISSING: name!!',
                detail: info.detail,
                range: Range.from(info.range),
                selectionRange: Range.from(info.selectionRange),
                kind: SymbolKind.from(info.kind),
                tags: info.tags?.map(SymbolTag.from) ?? []
            };
            if (info.children) {
                result.children = info.children.map(from);
            }
            return result;
        }
        DocumentSymbol.from = from;
        function to(info) {
            const result = new types.DocumentSymbol(info.name, info.detail, SymbolKind.to(info.kind), Range.to(info.range), Range.to(info.selectionRange));
            if ((0, arrays_1.isNonEmptyArray)(info.tags)) {
                result.tags = info.tags.map(SymbolTag.to);
            }
            if (info.children) {
                result.children = info.children.map(to);
            }
            return result;
        }
        DocumentSymbol.to = to;
    })(DocumentSymbol || (exports.DocumentSymbol = DocumentSymbol = {}));
    var CallHierarchyItem;
    (function (CallHierarchyItem) {
        function to(item) {
            const result = new types.CallHierarchyItem(SymbolKind.to(item.kind), item.name, item.detail || '', uri_1.URI.revive(item.uri), Range.to(item.range), Range.to(item.selectionRange));
            result._sessionId = item._sessionId;
            result._itemId = item._itemId;
            return result;
        }
        CallHierarchyItem.to = to;
        function from(item, sessionId, itemId) {
            sessionId = sessionId ?? item._sessionId;
            itemId = itemId ?? item._itemId;
            if (sessionId === undefined || itemId === undefined) {
                throw new Error('invalid item');
            }
            return {
                _sessionId: sessionId,
                _itemId: itemId,
                name: item.name,
                detail: item.detail,
                kind: SymbolKind.from(item.kind),
                uri: item.uri,
                range: Range.from(item.range),
                selectionRange: Range.from(item.selectionRange),
                tags: item.tags?.map(SymbolTag.from)
            };
        }
        CallHierarchyItem.from = from;
    })(CallHierarchyItem || (exports.CallHierarchyItem = CallHierarchyItem = {}));
    var CallHierarchyIncomingCall;
    (function (CallHierarchyIncomingCall) {
        function to(item) {
            return new types.CallHierarchyIncomingCall(CallHierarchyItem.to(item.from), item.fromRanges.map(r => Range.to(r)));
        }
        CallHierarchyIncomingCall.to = to;
    })(CallHierarchyIncomingCall || (exports.CallHierarchyIncomingCall = CallHierarchyIncomingCall = {}));
    var CallHierarchyOutgoingCall;
    (function (CallHierarchyOutgoingCall) {
        function to(item) {
            return new types.CallHierarchyOutgoingCall(CallHierarchyItem.to(item.to), item.fromRanges.map(r => Range.to(r)));
        }
        CallHierarchyOutgoingCall.to = to;
    })(CallHierarchyOutgoingCall || (exports.CallHierarchyOutgoingCall = CallHierarchyOutgoingCall = {}));
    var location;
    (function (location) {
        function from(value) {
            return {
                range: value.range && Range.from(value.range),
                uri: value.uri
            };
        }
        location.from = from;
        function to(value) {
            return new types.Location(uri_1.URI.revive(value.uri), Range.to(value.range));
        }
        location.to = to;
    })(location || (exports.location = location = {}));
    var DefinitionLink;
    (function (DefinitionLink) {
        function from(value) {
            const definitionLink = value;
            const location = value;
            return {
                originSelectionRange: definitionLink.originSelectionRange
                    ? Range.from(definitionLink.originSelectionRange)
                    : undefined,
                uri: definitionLink.targetUri ? definitionLink.targetUri : location.uri,
                range: Range.from(definitionLink.targetRange ? definitionLink.targetRange : location.range),
                targetSelectionRange: definitionLink.targetSelectionRange
                    ? Range.from(definitionLink.targetSelectionRange)
                    : undefined,
            };
        }
        DefinitionLink.from = from;
        function to(value) {
            return {
                targetUri: uri_1.URI.revive(value.uri),
                targetRange: Range.to(value.range),
                targetSelectionRange: value.targetSelectionRange
                    ? Range.to(value.targetSelectionRange)
                    : undefined,
                originSelectionRange: value.originSelectionRange
                    ? Range.to(value.originSelectionRange)
                    : undefined
            };
        }
        DefinitionLink.to = to;
    })(DefinitionLink || (exports.DefinitionLink = DefinitionLink = {}));
    var Hover;
    (function (Hover) {
        function from(hover) {
            return {
                range: Range.from(hover.range),
                contents: MarkdownString.fromMany(hover.contents)
            };
        }
        Hover.from = from;
        function to(info) {
            return new types.Hover(info.contents.map(MarkdownString.to), Range.to(info.range));
        }
        Hover.to = to;
    })(Hover || (exports.Hover = Hover = {}));
    var EvaluatableExpression;
    (function (EvaluatableExpression) {
        function from(expression) {
            return {
                range: Range.from(expression.range),
                expression: expression.expression
            };
        }
        EvaluatableExpression.from = from;
        function to(info) {
            return new types.EvaluatableExpression(Range.to(info.range), info.expression);
        }
        EvaluatableExpression.to = to;
    })(EvaluatableExpression || (exports.EvaluatableExpression = EvaluatableExpression = {}));
    var InlineValue;
    (function (InlineValue) {
        function from(inlineValue) {
            if (inlineValue instanceof types.InlineValueText) {
                return {
                    type: 'text',
                    range: Range.from(inlineValue.range),
                    text: inlineValue.text
                };
            }
            else if (inlineValue instanceof types.InlineValueVariableLookup) {
                return {
                    type: 'variable',
                    range: Range.from(inlineValue.range),
                    variableName: inlineValue.variableName,
                    caseSensitiveLookup: inlineValue.caseSensitiveLookup
                };
            }
            else if (inlineValue instanceof types.InlineValueEvaluatableExpression) {
                return {
                    type: 'expression',
                    range: Range.from(inlineValue.range),
                    expression: inlineValue.expression
                };
            }
            else {
                throw new Error(`Unknown 'InlineValue' type`);
            }
        }
        InlineValue.from = from;
        function to(inlineValue) {
            switch (inlineValue.type) {
                case 'text':
                    return {
                        range: Range.to(inlineValue.range),
                        text: inlineValue.text
                    };
                case 'variable':
                    return {
                        range: Range.to(inlineValue.range),
                        variableName: inlineValue.variableName,
                        caseSensitiveLookup: inlineValue.caseSensitiveLookup
                    };
                case 'expression':
                    return {
                        range: Range.to(inlineValue.range),
                        expression: inlineValue.expression
                    };
            }
        }
        InlineValue.to = to;
    })(InlineValue || (exports.InlineValue = InlineValue = {}));
    var InlineValueContext;
    (function (InlineValueContext) {
        function from(inlineValueContext) {
            return {
                frameId: inlineValueContext.frameId,
                stoppedLocation: Range.from(inlineValueContext.stoppedLocation)
            };
        }
        InlineValueContext.from = from;
        function to(inlineValueContext) {
            return new types.InlineValueContext(inlineValueContext.frameId, Range.to(inlineValueContext.stoppedLocation));
        }
        InlineValueContext.to = to;
    })(InlineValueContext || (exports.InlineValueContext = InlineValueContext = {}));
    var DocumentHighlight;
    (function (DocumentHighlight) {
        function from(documentHighlight) {
            return {
                range: Range.from(documentHighlight.range),
                kind: documentHighlight.kind
            };
        }
        DocumentHighlight.from = from;
        function to(occurrence) {
            return new types.DocumentHighlight(Range.to(occurrence.range), occurrence.kind);
        }
        DocumentHighlight.to = to;
    })(DocumentHighlight || (exports.DocumentHighlight = DocumentHighlight = {}));
    var MultiDocumentHighlight;
    (function (MultiDocumentHighlight) {
        function from(multiDocumentHighlight) {
            return {
                uri: multiDocumentHighlight.uri,
                highlights: multiDocumentHighlight.highlights.map(DocumentHighlight.from)
            };
        }
        MultiDocumentHighlight.from = from;
        function to(multiDocumentHighlight) {
            return new types.MultiDocumentHighlight(uri_1.URI.revive(multiDocumentHighlight.uri), multiDocumentHighlight.highlights.map(DocumentHighlight.to));
        }
        MultiDocumentHighlight.to = to;
    })(MultiDocumentHighlight || (exports.MultiDocumentHighlight = MultiDocumentHighlight = {}));
    var CompletionTriggerKind;
    (function (CompletionTriggerKind) {
        function to(kind) {
            switch (kind) {
                case 1 /* languages.CompletionTriggerKind.TriggerCharacter */:
                    return types.CompletionTriggerKind.TriggerCharacter;
                case 2 /* languages.CompletionTriggerKind.TriggerForIncompleteCompletions */:
                    return types.CompletionTriggerKind.TriggerForIncompleteCompletions;
                case 0 /* languages.CompletionTriggerKind.Invoke */:
                default:
                    return types.CompletionTriggerKind.Invoke;
            }
        }
        CompletionTriggerKind.to = to;
    })(CompletionTriggerKind || (exports.CompletionTriggerKind = CompletionTriggerKind = {}));
    var CompletionContext;
    (function (CompletionContext) {
        function to(context) {
            return {
                triggerKind: CompletionTriggerKind.to(context.triggerKind),
                triggerCharacter: context.triggerCharacter
            };
        }
        CompletionContext.to = to;
    })(CompletionContext || (exports.CompletionContext = CompletionContext = {}));
    var CompletionItemTag;
    (function (CompletionItemTag) {
        function from(kind) {
            switch (kind) {
                case types.CompletionItemTag.Deprecated: return 1 /* languages.CompletionItemTag.Deprecated */;
            }
        }
        CompletionItemTag.from = from;
        function to(kind) {
            switch (kind) {
                case 1 /* languages.CompletionItemTag.Deprecated */: return types.CompletionItemTag.Deprecated;
            }
        }
        CompletionItemTag.to = to;
    })(CompletionItemTag || (exports.CompletionItemTag = CompletionItemTag = {}));
    var CompletionItemKind;
    (function (CompletionItemKind) {
        const _from = new Map([
            [types.CompletionItemKind.Method, 0 /* languages.CompletionItemKind.Method */],
            [types.CompletionItemKind.Function, 1 /* languages.CompletionItemKind.Function */],
            [types.CompletionItemKind.Constructor, 2 /* languages.CompletionItemKind.Constructor */],
            [types.CompletionItemKind.Field, 3 /* languages.CompletionItemKind.Field */],
            [types.CompletionItemKind.Variable, 4 /* languages.CompletionItemKind.Variable */],
            [types.CompletionItemKind.Class, 5 /* languages.CompletionItemKind.Class */],
            [types.CompletionItemKind.Interface, 7 /* languages.CompletionItemKind.Interface */],
            [types.CompletionItemKind.Struct, 6 /* languages.CompletionItemKind.Struct */],
            [types.CompletionItemKind.Module, 8 /* languages.CompletionItemKind.Module */],
            [types.CompletionItemKind.Property, 9 /* languages.CompletionItemKind.Property */],
            [types.CompletionItemKind.Unit, 12 /* languages.CompletionItemKind.Unit */],
            [types.CompletionItemKind.Value, 13 /* languages.CompletionItemKind.Value */],
            [types.CompletionItemKind.Constant, 14 /* languages.CompletionItemKind.Constant */],
            [types.CompletionItemKind.Enum, 15 /* languages.CompletionItemKind.Enum */],
            [types.CompletionItemKind.EnumMember, 16 /* languages.CompletionItemKind.EnumMember */],
            [types.CompletionItemKind.Keyword, 17 /* languages.CompletionItemKind.Keyword */],
            [types.CompletionItemKind.Snippet, 27 /* languages.CompletionItemKind.Snippet */],
            [types.CompletionItemKind.Text, 18 /* languages.CompletionItemKind.Text */],
            [types.CompletionItemKind.Color, 19 /* languages.CompletionItemKind.Color */],
            [types.CompletionItemKind.File, 20 /* languages.CompletionItemKind.File */],
            [types.CompletionItemKind.Reference, 21 /* languages.CompletionItemKind.Reference */],
            [types.CompletionItemKind.Folder, 23 /* languages.CompletionItemKind.Folder */],
            [types.CompletionItemKind.Event, 10 /* languages.CompletionItemKind.Event */],
            [types.CompletionItemKind.Operator, 11 /* languages.CompletionItemKind.Operator */],
            [types.CompletionItemKind.TypeParameter, 24 /* languages.CompletionItemKind.TypeParameter */],
            [types.CompletionItemKind.Issue, 26 /* languages.CompletionItemKind.Issue */],
            [types.CompletionItemKind.User, 25 /* languages.CompletionItemKind.User */],
        ]);
        function from(kind) {
            return _from.get(kind) ?? 9 /* languages.CompletionItemKind.Property */;
        }
        CompletionItemKind.from = from;
        const _to = new Map([
            [0 /* languages.CompletionItemKind.Method */, types.CompletionItemKind.Method],
            [1 /* languages.CompletionItemKind.Function */, types.CompletionItemKind.Function],
            [2 /* languages.CompletionItemKind.Constructor */, types.CompletionItemKind.Constructor],
            [3 /* languages.CompletionItemKind.Field */, types.CompletionItemKind.Field],
            [4 /* languages.CompletionItemKind.Variable */, types.CompletionItemKind.Variable],
            [5 /* languages.CompletionItemKind.Class */, types.CompletionItemKind.Class],
            [7 /* languages.CompletionItemKind.Interface */, types.CompletionItemKind.Interface],
            [6 /* languages.CompletionItemKind.Struct */, types.CompletionItemKind.Struct],
            [8 /* languages.CompletionItemKind.Module */, types.CompletionItemKind.Module],
            [9 /* languages.CompletionItemKind.Property */, types.CompletionItemKind.Property],
            [12 /* languages.CompletionItemKind.Unit */, types.CompletionItemKind.Unit],
            [13 /* languages.CompletionItemKind.Value */, types.CompletionItemKind.Value],
            [14 /* languages.CompletionItemKind.Constant */, types.CompletionItemKind.Constant],
            [15 /* languages.CompletionItemKind.Enum */, types.CompletionItemKind.Enum],
            [16 /* languages.CompletionItemKind.EnumMember */, types.CompletionItemKind.EnumMember],
            [17 /* languages.CompletionItemKind.Keyword */, types.CompletionItemKind.Keyword],
            [27 /* languages.CompletionItemKind.Snippet */, types.CompletionItemKind.Snippet],
            [18 /* languages.CompletionItemKind.Text */, types.CompletionItemKind.Text],
            [19 /* languages.CompletionItemKind.Color */, types.CompletionItemKind.Color],
            [20 /* languages.CompletionItemKind.File */, types.CompletionItemKind.File],
            [21 /* languages.CompletionItemKind.Reference */, types.CompletionItemKind.Reference],
            [23 /* languages.CompletionItemKind.Folder */, types.CompletionItemKind.Folder],
            [10 /* languages.CompletionItemKind.Event */, types.CompletionItemKind.Event],
            [11 /* languages.CompletionItemKind.Operator */, types.CompletionItemKind.Operator],
            [24 /* languages.CompletionItemKind.TypeParameter */, types.CompletionItemKind.TypeParameter],
            [25 /* languages.CompletionItemKind.User */, types.CompletionItemKind.User],
            [26 /* languages.CompletionItemKind.Issue */, types.CompletionItemKind.Issue],
        ]);
        function to(kind) {
            return _to.get(kind) ?? types.CompletionItemKind.Property;
        }
        CompletionItemKind.to = to;
    })(CompletionItemKind || (exports.CompletionItemKind = CompletionItemKind = {}));
    var CompletionItem;
    (function (CompletionItem) {
        function to(suggestion, converter) {
            const result = new types.CompletionItem(suggestion.label);
            result.insertText = suggestion.insertText;
            result.kind = CompletionItemKind.to(suggestion.kind);
            result.tags = suggestion.tags?.map(CompletionItemTag.to);
            result.detail = suggestion.detail;
            result.documentation = htmlContent.isMarkdownString(suggestion.documentation) ? MarkdownString.to(suggestion.documentation) : suggestion.documentation;
            result.sortText = suggestion.sortText;
            result.filterText = suggestion.filterText;
            result.preselect = suggestion.preselect;
            result.commitCharacters = suggestion.commitCharacters;
            // range
            if (editorRange.Range.isIRange(suggestion.range)) {
                result.range = Range.to(suggestion.range);
            }
            else if (typeof suggestion.range === 'object') {
                result.range = { inserting: Range.to(suggestion.range.insert), replacing: Range.to(suggestion.range.replace) };
            }
            result.keepWhitespace = typeof suggestion.insertTextRules === 'undefined' ? false : Boolean(suggestion.insertTextRules & 1 /* languages.CompletionItemInsertTextRule.KeepWhitespace */);
            // 'insertText'-logic
            if (typeof suggestion.insertTextRules !== 'undefined' && suggestion.insertTextRules & 4 /* languages.CompletionItemInsertTextRule.InsertAsSnippet */) {
                result.insertText = new types.SnippetString(suggestion.insertText);
            }
            else {
                result.insertText = suggestion.insertText;
                result.textEdit = result.range instanceof types.Range ? new types.TextEdit(result.range, result.insertText) : undefined;
            }
            if (suggestion.additionalTextEdits && suggestion.additionalTextEdits.length > 0) {
                result.additionalTextEdits = suggestion.additionalTextEdits.map(e => TextEdit.to(e));
            }
            result.command = converter && suggestion.command ? converter.fromInternal(suggestion.command) : undefined;
            return result;
        }
        CompletionItem.to = to;
    })(CompletionItem || (exports.CompletionItem = CompletionItem = {}));
    var ParameterInformation;
    (function (ParameterInformation) {
        function from(info) {
            if (typeof info.label !== 'string' && !Array.isArray(info.label)) {
                throw new TypeError('Invalid label');
            }
            return {
                label: info.label,
                documentation: MarkdownString.fromStrict(info.documentation)
            };
        }
        ParameterInformation.from = from;
        function to(info) {
            return {
                label: info.label,
                documentation: htmlContent.isMarkdownString(info.documentation) ? MarkdownString.to(info.documentation) : info.documentation
            };
        }
        ParameterInformation.to = to;
    })(ParameterInformation || (exports.ParameterInformation = ParameterInformation = {}));
    var SignatureInformation;
    (function (SignatureInformation) {
        function from(info) {
            return {
                label: info.label,
                documentation: MarkdownString.fromStrict(info.documentation),
                parameters: Array.isArray(info.parameters) ? info.parameters.map(ParameterInformation.from) : [],
                activeParameter: info.activeParameter,
            };
        }
        SignatureInformation.from = from;
        function to(info) {
            return {
                label: info.label,
                documentation: htmlContent.isMarkdownString(info.documentation) ? MarkdownString.to(info.documentation) : info.documentation,
                parameters: Array.isArray(info.parameters) ? info.parameters.map(ParameterInformation.to) : [],
                activeParameter: info.activeParameter,
            };
        }
        SignatureInformation.to = to;
    })(SignatureInformation || (exports.SignatureInformation = SignatureInformation = {}));
    var SignatureHelp;
    (function (SignatureHelp) {
        function from(help) {
            return {
                activeSignature: help.activeSignature,
                activeParameter: help.activeParameter,
                signatures: Array.isArray(help.signatures) ? help.signatures.map(SignatureInformation.from) : [],
            };
        }
        SignatureHelp.from = from;
        function to(help) {
            return {
                activeSignature: help.activeSignature,
                activeParameter: help.activeParameter,
                signatures: Array.isArray(help.signatures) ? help.signatures.map(SignatureInformation.to) : [],
            };
        }
        SignatureHelp.to = to;
    })(SignatureHelp || (exports.SignatureHelp = SignatureHelp = {}));
    var InlayHint;
    (function (InlayHint) {
        function to(converter, hint) {
            const res = new types.InlayHint(Position.to(hint.position), typeof hint.label === 'string' ? hint.label : hint.label.map(InlayHintLabelPart.to.bind(undefined, converter)), hint.kind && InlayHintKind.to(hint.kind));
            res.textEdits = hint.textEdits && hint.textEdits.map(TextEdit.to);
            res.tooltip = htmlContent.isMarkdownString(hint.tooltip) ? MarkdownString.to(hint.tooltip) : hint.tooltip;
            res.paddingLeft = hint.paddingLeft;
            res.paddingRight = hint.paddingRight;
            return res;
        }
        InlayHint.to = to;
    })(InlayHint || (exports.InlayHint = InlayHint = {}));
    var InlayHintLabelPart;
    (function (InlayHintLabelPart) {
        function to(converter, part) {
            const result = new types.InlayHintLabelPart(part.label);
            result.tooltip = htmlContent.isMarkdownString(part.tooltip)
                ? MarkdownString.to(part.tooltip)
                : part.tooltip;
            if (languages.Command.is(part.command)) {
                result.command = converter.fromInternal(part.command);
            }
            if (part.location) {
                result.location = location.to(part.location);
            }
            return result;
        }
        InlayHintLabelPart.to = to;
    })(InlayHintLabelPart || (exports.InlayHintLabelPart = InlayHintLabelPart = {}));
    var InlayHintKind;
    (function (InlayHintKind) {
        function from(kind) {
            return kind;
        }
        InlayHintKind.from = from;
        function to(kind) {
            return kind;
        }
        InlayHintKind.to = to;
    })(InlayHintKind || (exports.InlayHintKind = InlayHintKind = {}));
    var DocumentLink;
    (function (DocumentLink) {
        function from(link) {
            return {
                range: Range.from(link.range),
                url: link.target,
                tooltip: link.tooltip
            };
        }
        DocumentLink.from = from;
        function to(link) {
            let target = undefined;
            if (link.url) {
                try {
                    target = typeof link.url === 'string' ? uri_1.URI.parse(link.url, true) : uri_1.URI.revive(link.url);
                }
                catch (err) {
                    // ignore
                }
            }
            return new types.DocumentLink(Range.to(link.range), target);
        }
        DocumentLink.to = to;
    })(DocumentLink || (exports.DocumentLink = DocumentLink = {}));
    var ColorPresentation;
    (function (ColorPresentation) {
        function to(colorPresentation) {
            const cp = new types.ColorPresentation(colorPresentation.label);
            if (colorPresentation.textEdit) {
                cp.textEdit = TextEdit.to(colorPresentation.textEdit);
            }
            if (colorPresentation.additionalTextEdits) {
                cp.additionalTextEdits = colorPresentation.additionalTextEdits.map(value => TextEdit.to(value));
            }
            return cp;
        }
        ColorPresentation.to = to;
        function from(colorPresentation) {
            return {
                label: colorPresentation.label,
                textEdit: colorPresentation.textEdit ? TextEdit.from(colorPresentation.textEdit) : undefined,
                additionalTextEdits: colorPresentation.additionalTextEdits ? colorPresentation.additionalTextEdits.map(value => TextEdit.from(value)) : undefined
            };
        }
        ColorPresentation.from = from;
    })(ColorPresentation || (exports.ColorPresentation = ColorPresentation = {}));
    var Color;
    (function (Color) {
        function to(c) {
            return new types.Color(c[0], c[1], c[2], c[3]);
        }
        Color.to = to;
        function from(color) {
            return [color.red, color.green, color.blue, color.alpha];
        }
        Color.from = from;
    })(Color || (exports.Color = Color = {}));
    var SelectionRange;
    (function (SelectionRange) {
        function from(obj) {
            return { range: Range.from(obj.range) };
        }
        SelectionRange.from = from;
        function to(obj) {
            return new types.SelectionRange(Range.to(obj.range));
        }
        SelectionRange.to = to;
    })(SelectionRange || (exports.SelectionRange = SelectionRange = {}));
    var TextDocumentSaveReason;
    (function (TextDocumentSaveReason) {
        function to(reason) {
            switch (reason) {
                case 2 /* SaveReason.AUTO */:
                    return types.TextDocumentSaveReason.AfterDelay;
                case 1 /* SaveReason.EXPLICIT */:
                    return types.TextDocumentSaveReason.Manual;
                case 3 /* SaveReason.FOCUS_CHANGE */:
                case 4 /* SaveReason.WINDOW_CHANGE */:
                    return types.TextDocumentSaveReason.FocusOut;
            }
        }
        TextDocumentSaveReason.to = to;
    })(TextDocumentSaveReason || (exports.TextDocumentSaveReason = TextDocumentSaveReason = {}));
    var TextEditorLineNumbersStyle;
    (function (TextEditorLineNumbersStyle) {
        function from(style) {
            switch (style) {
                case types.TextEditorLineNumbersStyle.Off:
                    return 0 /* RenderLineNumbersType.Off */;
                case types.TextEditorLineNumbersStyle.Relative:
                    return 2 /* RenderLineNumbersType.Relative */;
                case types.TextEditorLineNumbersStyle.On:
                default:
                    return 1 /* RenderLineNumbersType.On */;
            }
        }
        TextEditorLineNumbersStyle.from = from;
        function to(style) {
            switch (style) {
                case 0 /* RenderLineNumbersType.Off */:
                    return types.TextEditorLineNumbersStyle.Off;
                case 2 /* RenderLineNumbersType.Relative */:
                    return types.TextEditorLineNumbersStyle.Relative;
                case 1 /* RenderLineNumbersType.On */:
                default:
                    return types.TextEditorLineNumbersStyle.On;
            }
        }
        TextEditorLineNumbersStyle.to = to;
    })(TextEditorLineNumbersStyle || (exports.TextEditorLineNumbersStyle = TextEditorLineNumbersStyle = {}));
    var EndOfLine;
    (function (EndOfLine) {
        function from(eol) {
            if (eol === types.EndOfLine.CRLF) {
                return 1 /* EndOfLineSequence.CRLF */;
            }
            else if (eol === types.EndOfLine.LF) {
                return 0 /* EndOfLineSequence.LF */;
            }
            return undefined;
        }
        EndOfLine.from = from;
        function to(eol) {
            if (eol === 1 /* EndOfLineSequence.CRLF */) {
                return types.EndOfLine.CRLF;
            }
            else if (eol === 0 /* EndOfLineSequence.LF */) {
                return types.EndOfLine.LF;
            }
            return undefined;
        }
        EndOfLine.to = to;
    })(EndOfLine || (exports.EndOfLine = EndOfLine = {}));
    var ProgressLocation;
    (function (ProgressLocation) {
        function from(loc) {
            if (typeof loc === 'object') {
                return loc.viewId;
            }
            switch (loc) {
                case types.ProgressLocation.SourceControl: return 3 /* MainProgressLocation.Scm */;
                case types.ProgressLocation.Window: return 10 /* MainProgressLocation.Window */;
                case types.ProgressLocation.Notification: return 15 /* MainProgressLocation.Notification */;
            }
            throw new Error(`Unknown 'ProgressLocation'`);
        }
        ProgressLocation.from = from;
    })(ProgressLocation || (exports.ProgressLocation = ProgressLocation = {}));
    var FoldingRange;
    (function (FoldingRange) {
        function from(r) {
            const range = { start: r.start + 1, end: r.end + 1 };
            if (r.kind) {
                range.kind = FoldingRangeKind.from(r.kind);
            }
            return range;
        }
        FoldingRange.from = from;
        function to(r) {
            const range = { start: r.start - 1, end: r.end - 1 };
            if (r.kind) {
                range.kind = FoldingRangeKind.to(r.kind);
            }
            return range;
        }
        FoldingRange.to = to;
    })(FoldingRange || (exports.FoldingRange = FoldingRange = {}));
    var FoldingRangeKind;
    (function (FoldingRangeKind) {
        function from(kind) {
            if (kind) {
                switch (kind) {
                    case types.FoldingRangeKind.Comment:
                        return languages.FoldingRangeKind.Comment;
                    case types.FoldingRangeKind.Imports:
                        return languages.FoldingRangeKind.Imports;
                    case types.FoldingRangeKind.Region:
                        return languages.FoldingRangeKind.Region;
                }
            }
            return undefined;
        }
        FoldingRangeKind.from = from;
        function to(kind) {
            if (kind) {
                switch (kind.value) {
                    case languages.FoldingRangeKind.Comment.value:
                        return types.FoldingRangeKind.Comment;
                    case languages.FoldingRangeKind.Imports.value:
                        return types.FoldingRangeKind.Imports;
                    case languages.FoldingRangeKind.Region.value:
                        return types.FoldingRangeKind.Region;
                }
            }
            return undefined;
        }
        FoldingRangeKind.to = to;
    })(FoldingRangeKind || (exports.FoldingRangeKind = FoldingRangeKind = {}));
    var TextEditorOpenOptions;
    (function (TextEditorOpenOptions) {
        function from(options) {
            if (options) {
                return {
                    pinned: typeof options.preview === 'boolean' ? !options.preview : undefined,
                    inactive: options.background,
                    preserveFocus: options.preserveFocus,
                    selection: typeof options.selection === 'object' ? Range.from(options.selection) : undefined,
                    override: typeof options.override === 'boolean' ? editor_1.DEFAULT_EDITOR_ASSOCIATION.id : undefined
                };
            }
            return undefined;
        }
        TextEditorOpenOptions.from = from;
    })(TextEditorOpenOptions || (exports.TextEditorOpenOptions = TextEditorOpenOptions = {}));
    var GlobPattern;
    (function (GlobPattern) {
        function from(pattern) {
            if (pattern instanceof types.RelativePattern) {
                return pattern.toJSON();
            }
            if (typeof pattern === 'string') {
                return pattern;
            }
            // This is slightly bogus because we declare this method to accept
            // `vscode.GlobPattern` which can be `vscode.RelativePattern` class,
            // but given we cannot enforce classes from our vscode.d.ts, we have
            // to probe for objects too
            // Refs: https://github.com/microsoft/vscode/issues/140771
            if (isRelativePatternShape(pattern) || isLegacyRelativePatternShape(pattern)) {
                return new types.RelativePattern(pattern.baseUri ?? pattern.base, pattern.pattern).toJSON();
            }
            return pattern; // preserve `undefined` and `null`
        }
        GlobPattern.from = from;
        function isRelativePatternShape(obj) {
            const rp = obj;
            if (!rp) {
                return false;
            }
            return uri_1.URI.isUri(rp.baseUri) && typeof rp.pattern === 'string';
        }
        function isLegacyRelativePatternShape(obj) {
            // Before 1.64.x, `RelativePattern` did not have any `baseUri: Uri`
            // property. To preserve backwards compatibility with older extensions
            // we allow this old format when creating the `vscode.RelativePattern`.
            const rp = obj;
            if (!rp) {
                return false;
            }
            return typeof rp.base === 'string' && typeof rp.pattern === 'string';
        }
        function to(pattern) {
            if (typeof pattern === 'string') {
                return pattern;
            }
            return new types.RelativePattern(uri_1.URI.revive(pattern.baseUri), pattern.pattern);
        }
        GlobPattern.to = to;
    })(GlobPattern || (exports.GlobPattern = GlobPattern = {}));
    var LanguageSelector;
    (function (LanguageSelector) {
        function from(selector) {
            if (!selector) {
                return undefined;
            }
            else if (Array.isArray(selector)) {
                return selector.map(from);
            }
            else if (typeof selector === 'string') {
                return selector;
            }
            else {
                const filter = selector; // TODO: microsoft/TypeScript#42768
                return {
                    language: filter.language,
                    scheme: filter.scheme,
                    pattern: GlobPattern.from(filter.pattern),
                    exclusive: filter.exclusive,
                    notebookType: filter.notebookType
                };
            }
        }
        LanguageSelector.from = from;
    })(LanguageSelector || (exports.LanguageSelector = LanguageSelector = {}));
    var MappedEditsContext;
    (function (MappedEditsContext) {
        function is(v) {
            return (!!v && typeof v === 'object' &&
                'documents' in v &&
                Array.isArray(v.documents) &&
                v.documents.every(subArr => Array.isArray(subArr) &&
                    subArr.every(docRef => docRef && typeof docRef === 'object' &&
                        'uri' in docRef && uri_1.URI.isUri(docRef.uri) &&
                        'version' in docRef && typeof docRef.version === 'number' &&
                        'ranges' in docRef && Array.isArray(docRef.ranges) && docRef.ranges.every((r) => r instanceof types.Range))));
        }
        MappedEditsContext.is = is;
        function from(extContext) {
            return {
                documents: extContext.documents.map((subArray) => subArray.map((r) => ({
                    uri: uri_1.URI.from(r.uri),
                    version: r.version,
                    ranges: r.ranges.map((r) => Range.from(r)),
                }))),
            };
        }
        MappedEditsContext.from = from;
    })(MappedEditsContext || (exports.MappedEditsContext = MappedEditsContext = {}));
    var NotebookRange;
    (function (NotebookRange) {
        function from(range) {
            return { start: range.start, end: range.end };
        }
        NotebookRange.from = from;
        function to(range) {
            return new types.NotebookRange(range.start, range.end);
        }
        NotebookRange.to = to;
    })(NotebookRange || (exports.NotebookRange = NotebookRange = {}));
    var NotebookCellExecutionSummary;
    (function (NotebookCellExecutionSummary) {
        function to(data) {
            return {
                timing: typeof data.runStartTime === 'number' && typeof data.runEndTime === 'number' ? { startTime: data.runStartTime, endTime: data.runEndTime } : undefined,
                executionOrder: data.executionOrder,
                success: data.lastRunSuccess
            };
        }
        NotebookCellExecutionSummary.to = to;
        function from(data) {
            return {
                lastRunSuccess: data.success,
                runStartTime: data.timing?.startTime,
                runEndTime: data.timing?.endTime,
                executionOrder: data.executionOrder
            };
        }
        NotebookCellExecutionSummary.from = from;
    })(NotebookCellExecutionSummary || (exports.NotebookCellExecutionSummary = NotebookCellExecutionSummary = {}));
    var NotebookCellExecutionState;
    (function (NotebookCellExecutionState) {
        function to(state) {
            if (state === notebooks.NotebookCellExecutionState.Unconfirmed) {
                return types.NotebookCellExecutionState.Pending;
            }
            else if (state === notebooks.NotebookCellExecutionState.Pending) {
                // Since the (proposed) extension API doesn't have the distinction between Unconfirmed and Pending, we don't want to fire an update for Pending twice
                return undefined;
            }
            else if (state === notebooks.NotebookCellExecutionState.Executing) {
                return types.NotebookCellExecutionState.Executing;
            }
            else {
                throw new Error(`Unknown state: ${state}`);
            }
        }
        NotebookCellExecutionState.to = to;
    })(NotebookCellExecutionState || (exports.NotebookCellExecutionState = NotebookCellExecutionState = {}));
    var NotebookCellKind;
    (function (NotebookCellKind) {
        function from(data) {
            switch (data) {
                case types.NotebookCellKind.Markup:
                    return notebooks.CellKind.Markup;
                case types.NotebookCellKind.Code:
                default:
                    return notebooks.CellKind.Code;
            }
        }
        NotebookCellKind.from = from;
        function to(data) {
            switch (data) {
                case notebooks.CellKind.Markup:
                    return types.NotebookCellKind.Markup;
                case notebooks.CellKind.Code:
                default:
                    return types.NotebookCellKind.Code;
            }
        }
        NotebookCellKind.to = to;
    })(NotebookCellKind || (exports.NotebookCellKind = NotebookCellKind = {}));
    var NotebookData;
    (function (NotebookData) {
        function from(data) {
            const res = {
                metadata: data.metadata ?? Object.create(null),
                cells: [],
            };
            for (const cell of data.cells) {
                types.NotebookCellData.validate(cell);
                res.cells.push(NotebookCellData.from(cell));
            }
            return res;
        }
        NotebookData.from = from;
        function to(data) {
            const res = new types.NotebookData(data.cells.map(NotebookCellData.to));
            if (!(0, types_1.isEmptyObject)(data.metadata)) {
                res.metadata = data.metadata;
            }
            return res;
        }
        NotebookData.to = to;
    })(NotebookData || (exports.NotebookData = NotebookData = {}));
    var NotebookCellData;
    (function (NotebookCellData) {
        function from(data) {
            return {
                cellKind: NotebookCellKind.from(data.kind),
                language: data.languageId,
                mime: data.mime,
                source: data.value,
                metadata: data.metadata,
                internalMetadata: NotebookCellExecutionSummary.from(data.executionSummary ?? {}),
                outputs: data.outputs ? data.outputs.map(NotebookCellOutput.from) : []
            };
        }
        NotebookCellData.from = from;
        function to(data) {
            return new types.NotebookCellData(NotebookCellKind.to(data.cellKind), data.source, data.language, data.mime, data.outputs ? data.outputs.map(NotebookCellOutput.to) : undefined, data.metadata, data.internalMetadata ? NotebookCellExecutionSummary.to(data.internalMetadata) : undefined);
        }
        NotebookCellData.to = to;
    })(NotebookCellData || (exports.NotebookCellData = NotebookCellData = {}));
    var NotebookCellOutputItem;
    (function (NotebookCellOutputItem) {
        function from(item) {
            return {
                mime: item.mime,
                valueBytes: buffer_1.VSBuffer.wrap(item.data),
            };
        }
        NotebookCellOutputItem.from = from;
        function to(item) {
            return new types.NotebookCellOutputItem(item.valueBytes.buffer, item.mime);
        }
        NotebookCellOutputItem.to = to;
    })(NotebookCellOutputItem || (exports.NotebookCellOutputItem = NotebookCellOutputItem = {}));
    var NotebookCellOutput;
    (function (NotebookCellOutput) {
        function from(output) {
            return {
                outputId: output.id,
                items: output.items.map(NotebookCellOutputItem.from),
                metadata: output.metadata
            };
        }
        NotebookCellOutput.from = from;
        function to(output) {
            const items = output.items.map(NotebookCellOutputItem.to);
            return new types.NotebookCellOutput(items, output.outputId, output.metadata);
        }
        NotebookCellOutput.to = to;
    })(NotebookCellOutput || (exports.NotebookCellOutput = NotebookCellOutput = {}));
    var NotebookExclusiveDocumentPattern;
    (function (NotebookExclusiveDocumentPattern) {
        function from(pattern) {
            if (isExclusivePattern(pattern)) {
                return {
                    include: GlobPattern.from(pattern.include) ?? undefined,
                    exclude: GlobPattern.from(pattern.exclude) ?? undefined,
                };
            }
            return GlobPattern.from(pattern) ?? undefined;
        }
        NotebookExclusiveDocumentPattern.from = from;
        function to(pattern) {
            if (isExclusivePattern(pattern)) {
                return {
                    include: GlobPattern.to(pattern.include),
                    exclude: GlobPattern.to(pattern.exclude)
                };
            }
            return GlobPattern.to(pattern);
        }
        NotebookExclusiveDocumentPattern.to = to;
        function isExclusivePattern(obj) {
            const ep = obj;
            if (!ep) {
                return false;
            }
            return !(0, types_1.isUndefinedOrNull)(ep.include) && !(0, types_1.isUndefinedOrNull)(ep.exclude);
        }
    })(NotebookExclusiveDocumentPattern || (exports.NotebookExclusiveDocumentPattern = NotebookExclusiveDocumentPattern = {}));
    var NotebookStatusBarItem;
    (function (NotebookStatusBarItem) {
        function from(item, commandsConverter, disposables) {
            const command = typeof item.command === 'string' ? { title: '', command: item.command } : item.command;
            return {
                alignment: item.alignment === types.NotebookCellStatusBarAlignment.Left ? 1 /* notebooks.CellStatusbarAlignment.Left */ : 2 /* notebooks.CellStatusbarAlignment.Right */,
                command: commandsConverter.toInternal(command, disposables), // TODO@roblou
                text: item.text,
                tooltip: item.tooltip,
                accessibilityInformation: item.accessibilityInformation,
                priority: item.priority
            };
        }
        NotebookStatusBarItem.from = from;
    })(NotebookStatusBarItem || (exports.NotebookStatusBarItem = NotebookStatusBarItem = {}));
    var NotebookKernelSourceAction;
    (function (NotebookKernelSourceAction) {
        function from(item, commandsConverter, disposables) {
            const command = typeof item.command === 'string' ? { title: '', command: item.command } : item.command;
            return {
                command: commandsConverter.toInternal(command, disposables),
                label: item.label,
                description: item.description,
                detail: item.detail,
                documentation: item.documentation
            };
        }
        NotebookKernelSourceAction.from = from;
    })(NotebookKernelSourceAction || (exports.NotebookKernelSourceAction = NotebookKernelSourceAction = {}));
    var NotebookDocumentContentOptions;
    (function (NotebookDocumentContentOptions) {
        function from(options) {
            return {
                transientOutputs: options?.transientOutputs ?? false,
                transientCellMetadata: options?.transientCellMetadata ?? {},
                transientDocumentMetadata: options?.transientDocumentMetadata ?? {},
                cellContentMetadata: options?.cellContentMetadata ?? {}
            };
        }
        NotebookDocumentContentOptions.from = from;
    })(NotebookDocumentContentOptions || (exports.NotebookDocumentContentOptions = NotebookDocumentContentOptions = {}));
    var NotebookRendererScript;
    (function (NotebookRendererScript) {
        function from(preload) {
            return {
                uri: preload.uri,
                provides: preload.provides
            };
        }
        NotebookRendererScript.from = from;
        function to(preload) {
            return new types.NotebookRendererScript(uri_1.URI.revive(preload.uri), preload.provides);
        }
        NotebookRendererScript.to = to;
    })(NotebookRendererScript || (exports.NotebookRendererScript = NotebookRendererScript = {}));
    var TestMessage;
    (function (TestMessage) {
        function from(message) {
            return {
                message: MarkdownString.fromStrict(message.message) || '',
                type: 0 /* TestMessageType.Error */,
                expected: message.expectedOutput,
                actual: message.actualOutput,
                contextValue: message.contextValue,
                location: message.location && ({ range: Range.from(message.location.range), uri: message.location.uri }),
            };
        }
        TestMessage.from = from;
        function to(item) {
            const message = new types.TestMessage(typeof item.message === 'string' ? item.message : MarkdownString.to(item.message));
            message.actualOutput = item.actual;
            message.expectedOutput = item.expected;
            message.contextValue = item.contextValue;
            message.location = item.location ? location.to(item.location) : undefined;
            return message;
        }
        TestMessage.to = to;
    })(TestMessage || (exports.TestMessage = TestMessage = {}));
    var TestTag;
    (function (TestTag) {
        TestTag.namespace = testTypes_1.namespaceTestTag;
        TestTag.denamespace = testTypes_1.denamespaceTestTag;
    })(TestTag || (exports.TestTag = TestTag = {}));
    var TestItem;
    (function (TestItem) {
        function from(item) {
            const ctrlId = (0, extHostTestingPrivateApi_1.getPrivateApiFor)(item).controllerId;
            return {
                extId: testId_1.TestId.fromExtHostTestItem(item, ctrlId).toString(),
                label: item.label,
                uri: uri_1.URI.revive(item.uri),
                busy: item.busy,
                tags: item.tags.map(t => TestTag.namespace(ctrlId, t.id)),
                range: editorRange.Range.lift(Range.from(item.range)),
                description: item.description || null,
                sortText: item.sortText || null,
                error: item.error ? (MarkdownString.fromStrict(item.error) || null) : null,
            };
        }
        TestItem.from = from;
        function toPlain(item) {
            return {
                parent: undefined,
                error: undefined,
                id: testId_1.TestId.fromString(item.extId).localId,
                label: item.label,
                uri: uri_1.URI.revive(item.uri),
                tags: (item.tags || []).map(t => {
                    const { tagId } = TestTag.denamespace(t);
                    return new types.TestTag(tagId);
                }),
                children: {
                    add: () => { },
                    delete: () => { },
                    forEach: () => { },
                    *[Symbol.iterator]() { },
                    get: () => undefined,
                    replace: () => { },
                    size: 0,
                },
                range: Range.to(item.range || undefined),
                canResolveChildren: false,
                busy: item.busy,
                description: item.description || undefined,
                sortText: item.sortText || undefined,
            };
        }
        TestItem.toPlain = toPlain;
    })(TestItem || (exports.TestItem = TestItem = {}));
    (function (TestTag) {
        function from(tag) {
            return { id: tag.id };
        }
        TestTag.from = from;
        function to(tag) {
            return new types.TestTag(tag.id);
        }
        TestTag.to = to;
    })(TestTag || (exports.TestTag = TestTag = {}));
    var TestResults;
    (function (TestResults) {
        const convertTestResultItem = (item, byInternalId) => {
            const children = [];
            for (const [id, item] of byInternalId) {
                if (testId_1.TestId.compare(item.item.extId, id) === 2 /* TestPosition.IsChild */) {
                    byInternalId.delete(id);
                    children.push(item);
                }
            }
            const snapshot = ({
                ...TestItem.toPlain(item.item),
                parent: undefined,
                taskStates: item.tasks.map(t => ({
                    state: t.state,
                    duration: t.duration,
                    messages: t.messages
                        .filter((m) => m.type === 0 /* TestMessageType.Error */)
                        .map(TestMessage.to),
                })),
                children: children.map(c => convertTestResultItem(c, byInternalId))
            });
            for (const child of snapshot.children) {
                child.parent = snapshot;
            }
            return snapshot;
        };
        function to(serialized) {
            const roots = [];
            const byInternalId = new Map();
            for (const item of serialized.items) {
                byInternalId.set(item.item.extId, item);
                const controllerId = testId_1.TestId.root(item.item.extId);
                if (serialized.request.targets.some(t => t.controllerId === controllerId && t.testIds.includes(item.item.extId))) {
                    roots.push(item);
                }
            }
            return {
                completedAt: serialized.completedAt,
                results: roots.map(r => convertTestResultItem(r, byInternalId)),
            };
        }
        TestResults.to = to;
    })(TestResults || (exports.TestResults = TestResults = {}));
    var TestCoverage;
    (function (TestCoverage) {
        function fromCoveredCount(count) {
            return { covered: count.covered, total: count.total };
        }
        function fromLocation(location) {
            return 'line' in location ? Position.from(location) : Range.from(location);
        }
        function fromDetailed(coverage) {
            if ('branches' in coverage) {
                return {
                    count: coverage.executionCount,
                    location: fromLocation(coverage.location),
                    type: 1 /* DetailType.Statement */,
                    branches: coverage.branches.length
                        ? coverage.branches.map(b => ({ count: b.executionCount, location: b.location && fromLocation(b.location), label: b.label }))
                        : undefined,
                };
            }
            else {
                return {
                    type: 0 /* DetailType.Function */,
                    name: coverage.name,
                    count: coverage.executionCount,
                    location: fromLocation(coverage.location),
                };
            }
        }
        TestCoverage.fromDetailed = fromDetailed;
        function fromFile(coverage) {
            return {
                uri: coverage.uri,
                statement: fromCoveredCount(coverage.statementCoverage),
                branch: coverage.branchCoverage && fromCoveredCount(coverage.branchCoverage),
                function: coverage.functionCoverage && fromCoveredCount(coverage.functionCoverage),
                details: coverage.detailedCoverage?.map(fromDetailed),
            };
        }
        TestCoverage.fromFile = fromFile;
    })(TestCoverage || (exports.TestCoverage = TestCoverage = {}));
    var CodeActionTriggerKind;
    (function (CodeActionTriggerKind) {
        function to(value) {
            switch (value) {
                case 1 /* languages.CodeActionTriggerType.Invoke */:
                    return types.CodeActionTriggerKind.Invoke;
                case 2 /* languages.CodeActionTriggerType.Auto */:
                    return types.CodeActionTriggerKind.Automatic;
            }
        }
        CodeActionTriggerKind.to = to;
    })(CodeActionTriggerKind || (exports.CodeActionTriggerKind = CodeActionTriggerKind = {}));
    var TypeHierarchyItem;
    (function (TypeHierarchyItem) {
        function to(item) {
            const result = new types.TypeHierarchyItem(SymbolKind.to(item.kind), item.name, item.detail || '', uri_1.URI.revive(item.uri), Range.to(item.range), Range.to(item.selectionRange));
            result._sessionId = item._sessionId;
            result._itemId = item._itemId;
            return result;
        }
        TypeHierarchyItem.to = to;
        function from(item, sessionId, itemId) {
            sessionId = sessionId ?? item._sessionId;
            itemId = itemId ?? item._itemId;
            if (sessionId === undefined || itemId === undefined) {
                throw new Error('invalid item');
            }
            return {
                _sessionId: sessionId,
                _itemId: itemId,
                kind: SymbolKind.from(item.kind),
                name: item.name,
                detail: item.detail ?? '',
                uri: item.uri,
                range: Range.from(item.range),
                selectionRange: Range.from(item.selectionRange),
                tags: item.tags?.map(SymbolTag.from)
            };
        }
        TypeHierarchyItem.from = from;
    })(TypeHierarchyItem || (exports.TypeHierarchyItem = TypeHierarchyItem = {}));
    var ViewBadge;
    (function (ViewBadge) {
        function from(badge) {
            if (!badge) {
                return undefined;
            }
            return {
                value: badge.value,
                tooltip: badge.tooltip
            };
        }
        ViewBadge.from = from;
    })(ViewBadge || (exports.ViewBadge = ViewBadge = {}));
    var DataTransferItem;
    (function (DataTransferItem) {
        function to(mime, item, resolveFileData) {
            const file = item.fileData;
            if (file) {
                return new types.InternalFileDataTransferItem(new types.DataTransferFile(file.name, uri_1.URI.revive(file.uri), file.id, (0, functional_1.createSingleCallFunction)(() => resolveFileData(file.id))));
            }
            if (mime === mime_1.Mimes.uriList && item.uriListData) {
                return new types.InternalDataTransferItem(reviveUriList(item.uriListData));
            }
            return new types.InternalDataTransferItem(item.asString);
        }
        DataTransferItem.to = to;
        async function from(mime, item) {
            const stringValue = await item.asString();
            if (mime === mime_1.Mimes.uriList) {
                return {
                    asString: stringValue,
                    fileData: undefined,
                    uriListData: serializeUriList(stringValue),
                };
            }
            const fileValue = item.asFile();
            return {
                asString: stringValue,
                fileData: fileValue ? {
                    name: fileValue.name,
                    uri: fileValue.uri,
                    id: fileValue._itemId ?? fileValue.id,
                } : undefined,
            };
        }
        DataTransferItem.from = from;
        function serializeUriList(stringValue) {
            return dataTransfer_1.UriList.split(stringValue).map(part => {
                if (part.startsWith('#')) {
                    return part;
                }
                try {
                    return uri_1.URI.parse(part);
                }
                catch {
                    // noop
                }
                return part;
            });
        }
        function reviveUriList(parts) {
            return dataTransfer_1.UriList.create(parts.map(part => {
                return typeof part === 'string' ? part : uri_1.URI.revive(part);
            }));
        }
    })(DataTransferItem || (exports.DataTransferItem = DataTransferItem = {}));
    var DataTransfer;
    (function (DataTransfer) {
        function toDataTransfer(value, resolveFileData) {
            const init = value.items.map(([type, item]) => {
                return [type, DataTransferItem.to(type, item, resolveFileData)];
            });
            return new types.DataTransfer(init);
        }
        DataTransfer.toDataTransfer = toDataTransfer;
        async function from(dataTransfer) {
            const newDTO = { items: [] };
            const promises = [];
            for (const [mime, value] of dataTransfer) {
                promises.push((async () => {
                    newDTO.items.push([mime, await DataTransferItem.from(mime, value)]);
                })());
            }
            await Promise.all(promises);
            return newDTO;
        }
        DataTransfer.from = from;
    })(DataTransfer || (exports.DataTransfer = DataTransfer = {}));
    var ChatReplyFollowup;
    (function (ChatReplyFollowup) {
        function from(followup) {
            return {
                kind: 'reply',
                message: followup.message,
                title: followup.title,
                tooltip: followup.tooltip,
            };
        }
        ChatReplyFollowup.from = from;
    })(ChatReplyFollowup || (exports.ChatReplyFollowup = ChatReplyFollowup = {}));
    var ChatFollowup;
    (function (ChatFollowup) {
        function from(followup) {
            if (typeof followup === 'string') {
                return { title: followup, message: followup, kind: 'reply' };
            }
            else if ('commandId' in followup) {
                return {
                    kind: 'command',
                    title: followup.title ?? '',
                    commandId: followup.commandId ?? '',
                    when: followup.when ?? '',
                    args: followup.args
                };
            }
            else {
                return ChatReplyFollowup.from(followup);
            }
        }
        ChatFollowup.from = from;
    })(ChatFollowup || (exports.ChatFollowup = ChatFollowup = {}));
    var ChatMessage;
    (function (ChatMessage) {
        function to(message) {
            const res = new types.ChatMessage(ChatMessageRole.to(message.role), message.content);
            res.name = message.name;
            return res;
        }
        ChatMessage.to = to;
        function from(message) {
            return {
                role: ChatMessageRole.from(message.role),
                content: message.content,
                name: message.name
            };
        }
        ChatMessage.from = from;
    })(ChatMessage || (exports.ChatMessage = ChatMessage = {}));
    var ChatMessageRole;
    (function (ChatMessageRole) {
        function to(role) {
            switch (role) {
                case 0 /* chatProvider.ChatMessageRole.System */: return types.ChatMessageRole.System;
                case 1 /* chatProvider.ChatMessageRole.User */: return types.ChatMessageRole.User;
                case 2 /* chatProvider.ChatMessageRole.Assistant */: return types.ChatMessageRole.Assistant;
                case 3 /* chatProvider.ChatMessageRole.Function */: return types.ChatMessageRole.Function;
            }
        }
        ChatMessageRole.to = to;
        function from(role) {
            switch (role) {
                case types.ChatMessageRole.System: return 0 /* chatProvider.ChatMessageRole.System */;
                case types.ChatMessageRole.Assistant: return 2 /* chatProvider.ChatMessageRole.Assistant */;
                case types.ChatMessageRole.Function: return 3 /* chatProvider.ChatMessageRole.Function */;
                case types.ChatMessageRole.User:
                default:
                    return 1 /* chatProvider.ChatMessageRole.User */;
            }
        }
        ChatMessageRole.from = from;
    })(ChatMessageRole || (exports.ChatMessageRole = ChatMessageRole = {}));
    var ChatVariable;
    (function (ChatVariable) {
        function objectTo(variableObject) {
            const result = {};
            for (const key of Object.keys(variableObject)) {
                result[key] = variableObject[key].map(ChatVariable.to);
            }
            return result;
        }
        ChatVariable.objectTo = objectTo;
        function to(variable) {
            return {
                level: ChatVariableLevel.to(variable.level),
                kind: variable.kind,
                value: (0, uri_1.isUriComponents)(variable.value) ? uri_1.URI.revive(variable.value) : variable.value,
                description: variable.description
            };
        }
        ChatVariable.to = to;
        function from(variable) {
            return {
                level: ChatVariableLevel.from(variable.level),
                kind: variable.kind,
                value: variable.value,
                description: variable.description
            };
        }
        ChatVariable.from = from;
    })(ChatVariable || (exports.ChatVariable = ChatVariable = {}));
    var ChatVariableLevel;
    (function (ChatVariableLevel) {
        function to(level) {
            switch (level) {
                case 'short': return types.ChatVariableLevel.Short;
                case 'medium': return types.ChatVariableLevel.Medium;
                case 'full':
                default:
                    return types.ChatVariableLevel.Full;
            }
        }
        ChatVariableLevel.to = to;
        function from(level) {
            switch (level) {
                case types.ChatVariableLevel.Short: return 'short';
                case types.ChatVariableLevel.Medium: return 'medium';
                case types.ChatVariableLevel.Full:
                default:
                    return 'full';
            }
        }
        ChatVariableLevel.from = from;
    })(ChatVariableLevel || (exports.ChatVariableLevel = ChatVariableLevel = {}));
    var InteractiveEditorResponseFeedbackKind;
    (function (InteractiveEditorResponseFeedbackKind) {
        function to(kind) {
            switch (kind) {
                case 1 /* InlineChatResponseFeedbackKind.Helpful */:
                    return types.InteractiveEditorResponseFeedbackKind.Helpful;
                case 0 /* InlineChatResponseFeedbackKind.Unhelpful */:
                    return types.InteractiveEditorResponseFeedbackKind.Unhelpful;
                case 2 /* InlineChatResponseFeedbackKind.Undone */:
                    return types.InteractiveEditorResponseFeedbackKind.Undone;
                case 3 /* InlineChatResponseFeedbackKind.Accepted */:
                    return types.InteractiveEditorResponseFeedbackKind.Accepted;
                case 4 /* InlineChatResponseFeedbackKind.Bug */:
                    return types.InteractiveEditorResponseFeedbackKind.Bug;
            }
        }
        InteractiveEditorResponseFeedbackKind.to = to;
    })(InteractiveEditorResponseFeedbackKind || (exports.InteractiveEditorResponseFeedbackKind = InteractiveEditorResponseFeedbackKind = {}));
    var ChatResponseProgress;
    (function (ChatResponseProgress) {
        function from(extension, progress) {
            if ('markdownContent' in progress) {
                (0, extensions_1.checkProposedApiEnabled)(extension, 'chatAgents2Additions');
                return { content: MarkdownString.from(progress.markdownContent), kind: 'markdownContent' };
            }
            else if ('content' in progress) {
                if ('vulnerabilities' in progress && progress.vulnerabilities) {
                    (0, extensions_1.checkProposedApiEnabled)(extension, 'chatAgents2Additions');
                    return { content: progress.content, vulnerabilities: progress.vulnerabilities, kind: 'vulnerability' };
                }
                if (typeof progress.content === 'string') {
                    return { content: progress.content, kind: 'content' };
                }
                (0, extensions_1.checkProposedApiEnabled)(extension, 'chatAgents2Additions');
                return { content: MarkdownString.from(progress.content), kind: 'markdownContent' };
            }
            else if ('documents' in progress) {
                return {
                    documents: progress.documents.map(d => ({
                        uri: d.uri,
                        version: d.version,
                        ranges: d.ranges.map(r => Range.from(r))
                    })),
                    kind: 'usedContext'
                };
            }
            else if ('reference' in progress) {
                return {
                    reference: 'uri' in progress.reference ?
                        {
                            uri: progress.reference.uri,
                            range: Range.from(progress.reference.range)
                        } : progress.reference,
                    kind: 'reference'
                };
            }
            else if ('inlineReference' in progress) {
                return {
                    inlineReference: 'uri' in progress.inlineReference ?
                        {
                            uri: progress.inlineReference.uri,
                            range: Range.from(progress.inlineReference.range)
                        } : progress.inlineReference,
                    name: progress.title,
                    kind: 'inlineReference'
                };
            }
            else if ('agentName' in progress) {
                (0, extensions_1.checkProposedApiEnabled)(extension, 'chatAgents2Additions');
                return { agentName: progress.agentName, command: progress.command, kind: 'agentDetection' };
            }
            else if ('treeData' in progress) {
                return { treeData: progress.treeData, kind: 'treeData' };
            }
            else if ('message' in progress) {
                return { content: MarkdownString.from(progress.message), kind: 'progressMessage' };
            }
            else {
                return undefined;
            }
        }
        ChatResponseProgress.from = from;
        function to(progress) {
            switch (progress.kind) {
                case 'markdownContent':
                case 'inlineReference':
                case 'treeData':
                    return ChatResponseProgress.to(progress);
                case 'content':
                    return { content: progress.content };
                case 'usedContext':
                    return { documents: progress.documents.map(d => ({ uri: uri_1.URI.revive(d.uri), version: d.version, ranges: d.ranges.map(r => Range.to(r)) })) };
                case 'reference':
                    return {
                        reference: (0, uri_1.isUriComponents)(progress.reference) ?
                            uri_1.URI.revive(progress.reference) :
                            Location.to(progress.reference)
                    };
                case 'agentDetection':
                    // For simplicity, don't sent back the 'extended' types
                    return undefined;
                case 'progressMessage':
                    return { message: progress.content.value };
                case 'vulnerability':
                    return { content: progress.content, vulnerabilities: progress.vulnerabilities };
                default:
                    // Unknown type, eg something in history that was removed? Ignore
                    return undefined;
            }
        }
        ChatResponseProgress.to = to;
        function toProgressContent(progress) {
            switch (progress.kind) {
                case 'markdownContent':
                    // For simplicity, don't sent back the 'extended' types, so downgrade markdown to just some text
                    return { content: progress.content.value };
                case 'inlineReference':
                    return {
                        inlineReference: (0, uri_1.isUriComponents)(progress.inlineReference) ?
                            uri_1.URI.revive(progress.inlineReference) :
                            Location.to(progress.inlineReference),
                        title: progress.name
                    };
                case 'treeData':
                    return { treeData: (0, marshalling_1.revive)(progress.treeData) };
                default:
                    // Unknown type, eg something in history that was removed? Ignore
                    return undefined;
            }
        }
        ChatResponseProgress.toProgressContent = toProgressContent;
    })(ChatResponseProgress || (exports.ChatResponseProgress = ChatResponseProgress = {}));
    var ChatAgentRequest;
    (function (ChatAgentRequest) {
        function to(request, slashCommand) {
            return {
                prompt: request.message,
                variables: ChatVariable.objectTo(request.variables),
                slashCommand,
                subCommand: request.command,
                agentId: request.agentId,
            };
        }
        ChatAgentRequest.to = to;
    })(ChatAgentRequest || (exports.ChatAgentRequest = ChatAgentRequest = {}));
    var ChatAgentCompletionItem;
    (function (ChatAgentCompletionItem) {
        function from(item) {
            return {
                label: item.label,
                values: item.values.map(ChatVariable.from),
                insertText: item.insertText,
                detail: item.detail,
                documentation: item.documentation,
            };
        }
        ChatAgentCompletionItem.from = from;
    })(ChatAgentCompletionItem || (exports.ChatAgentCompletionItem = ChatAgentCompletionItem = {}));
    var TerminalQuickFix;
    (function (TerminalQuickFix) {
        function from(quickFix, converter, disposables) {
            if ('terminalCommand' in quickFix) {
                return { terminalCommand: quickFix.terminalCommand, shouldExecute: quickFix.shouldExecute };
            }
            if ('uri' in quickFix) {
                return { uri: quickFix.uri };
            }
            return converter.toInternal(quickFix, disposables);
        }
        TerminalQuickFix.from = from;
    })(TerminalQuickFix || (exports.TerminalQuickFix = TerminalQuickFix = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFR5cGVDb252ZXJ0ZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0VHlwZUNvbnZlcnRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd0VoRyxJQUFpQixTQUFTLENBa0J6QjtJQWxCRCxXQUFpQixTQUFTO1FBRXpCLFNBQWdCLEVBQUUsQ0FBQyxTQUFxQjtZQUN2QyxNQUFNLEVBQUUsd0JBQXdCLEVBQUUsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLEdBQUcsU0FBUyxDQUFDO1lBQ3pHLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsR0FBRyxDQUFDLEVBQUUsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDekYsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLGtCQUFrQixHQUFHLENBQUMsRUFBRSxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0UsT0FBTyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFMZSxZQUFFLEtBS2pCLENBQUE7UUFFRCxTQUFnQixJQUFJLENBQUMsU0FBd0I7WUFDNUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUM7WUFDckMsT0FBTztnQkFDTix3QkFBd0IsRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUM7Z0JBQ3pDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQztnQkFDMUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDO2dCQUNuQyxjQUFjLEVBQUUsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDO2FB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aEYsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyw2Q0FBcUM7WUFDcEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxnREFBd0M7WUFDMUUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyw2Q0FBcUM7WUFDcEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBUyxpREFBeUM7WUFDNUUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSw4Q0FBc0M7WUFDdEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSw4Q0FBc0M7WUFDdEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxnREFBd0M7WUFDMUUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSw2Q0FBb0M7WUFDbEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyw4Q0FBcUM7WUFDcEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxpREFBd0M7WUFDMUUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSw2Q0FBb0M7WUFDbEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsVUFBVSxtREFBMEM7WUFDOUUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxnREFBdUM7WUFDeEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxnREFBdUM7WUFDeEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSw2Q0FBb0M7WUFDbEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyw4Q0FBcUM7WUFDcEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSw2Q0FBb0M7WUFDbEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBUyxrREFBeUM7WUFDNUUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSwrQ0FBc0M7WUFDdEUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyw4Q0FBcUM7WUFD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
//# sourceURL=../../../vs/workbench/api/common/extHostTypeConverters.js
})