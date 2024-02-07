(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/uri", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/tokenizationRegistry", "vs/nls"], function (require, exports, codicons_1, uri_1, editOperation_1, range_1, tokenizationRegistry_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExternalUriOpenerPriority = exports.TokenizationRegistry = exports.LazyTokenizationSupport = exports.InlayHintKind = exports.CommentState = exports.CommentMode = exports.CommentThreadState = exports.CommentThreadCollapsibleState = exports.Command = exports.FoldingRangeKind = exports.TextEdit = exports.SymbolKinds = exports.SymbolTag = exports.getAriaLabelForSymbol = exports.symbolKindNames = exports.SymbolKind = exports.isLocationLink = exports.DocumentHighlightKind = exports.SignatureHelpTriggerKind = exports.CodeActionTriggerType = exports.SelectedSuggestionInfo = exports.InlineCompletionTriggerKind = exports.CompletionTriggerKind = exports.CompletionItemInsertTextRule = exports.CompletionItemTag = exports.CompletionItemKinds = exports.CompletionItemKind = exports.EncodedTokenizationResult = exports.TokenizationResult = exports.Token = void 0;
    class Token {
        constructor(offset, type, language) {
            this.offset = offset;
            this.type = type;
            this.language = language;
            this._tokenBrand = undefined;
        }
        toString() {
            return '(' + this.offset + ', ' + this.type + ')';
        }
    }
    exports.Token = Token;
    /**
     * @internal
     */
    class TokenizationResult {
        constructor(tokens, endState) {
            this.tokens = tokens;
            this.endState = endState;
            this._tokenizationResultBrand = undefined;
        }
    }
    exports.TokenizationResult = TokenizationResult;
    /**
     * @internal
     */
    class EncodedTokenizationResult {
        constructor(
        /**
         * The tokens in binary format. Each token occupies two array indices. For token i:
         *  - at offset 2*i => startIndex
         *  - at offset 2*i + 1 => metadata
         *
         */
        tokens, endState) {
            this.tokens = tokens;
            this.endState = endState;
            this._encodedTokenizationResultBrand = undefined;
        }
    }
    exports.EncodedTokenizationResult = EncodedTokenizationResult;
    var CompletionItemKind;
    (function (CompletionItemKind) {
        CompletionItemKind[CompletionItemKind["Method"] = 0] = "Method";
        CompletionItemKind[CompletionItemKind["Function"] = 1] = "Function";
        CompletionItemKind[CompletionItemKind["Constructor"] = 2] = "Constructor";
        CompletionItemKind[CompletionItemKind["Field"] = 3] = "Field";
        CompletionItemKind[CompletionItemKind["Variable"] = 4] = "Variable";
        CompletionItemKind[CompletionItemKind["Class"] = 5] = "Class";
        CompletionItemKind[CompletionItemKind["Struct"] = 6] = "Struct";
        CompletionItemKind[CompletionItemKind["Interface"] = 7] = "Interface";
        CompletionItemKind[CompletionItemKind["Module"] = 8] = "Module";
        CompletionItemKind[CompletionItemKind["Property"] = 9] = "Property";
        CompletionItemKind[CompletionItemKind["Event"] = 10] = "Event";
        CompletionItemKind[CompletionItemKind["Operator"] = 11] = "Operator";
        CompletionItemKind[CompletionItemKind["Unit"] = 12] = "Unit";
        CompletionItemKind[CompletionItemKind["Value"] = 13] = "Value";
        CompletionItemKind[CompletionItemKind["Constant"] = 14] = "Constant";
        CompletionItemKind[CompletionItemKind["Enum"] = 15] = "Enum";
        CompletionItemKind[CompletionItemKind["EnumMember"] = 16] = "EnumMember";
        CompletionItemKind[CompletionItemKind["Keyword"] = 17] = "Keyword";
        CompletionItemKind[CompletionItemKind["Text"] = 18] = "Text";
        CompletionItemKind[CompletionItemKind["Color"] = 19] = "Color";
        CompletionItemKind[CompletionItemKind["File"] = 20] = "File";
        CompletionItemKind[CompletionItemKind["Reference"] = 21] = "Reference";
        CompletionItemKind[CompletionItemKind["Customcolor"] = 22] = "Customcolor";
        CompletionItemKind[CompletionItemKind["Folder"] = 23] = "Folder";
        CompletionItemKind[CompletionItemKind["TypeParameter"] = 24] = "TypeParameter";
        CompletionItemKind[CompletionItemKind["User"] = 25] = "User";
        CompletionItemKind[CompletionItemKind["Issue"] = 26] = "Issue";
        CompletionItemKind[CompletionItemKind["Snippet"] = 27] = "Snippet";
    })(CompletionItemKind || (exports.CompletionItemKind = CompletionItemKind = {}));
    /**
     * @internal
     */
    var CompletionItemKinds;
    (function (CompletionItemKinds) {
        const byKind = new Map();
        byKind.set(0 /* CompletionItemKind.Method */, codicons_1.Codicon.symbolMethod);
        byKind.set(1 /* CompletionItemKind.Function */, codicons_1.Codicon.symbolFunction);
        byKind.set(2 /* CompletionItemKind.Constructor */, codicons_1.Codicon.symbolConstructor);
        byKind.set(3 /* CompletionItemKind.Field */, codicons_1.Codicon.symbolField);
        byKind.set(4 /* CompletionItemKind.Variable */, codicons_1.Codicon.symbolVariable);
        byKind.set(5 /* CompletionItemKind.Class */, codicons_1.Codicon.symbolClass);
        byKind.set(6 /* CompletionItemKind.Struct */, codicons_1.Codicon.symbolStruct);
        byKind.set(7 /* CompletionItemKind.Interface */, codicons_1.Codicon.symbolInterface);
        byKind.set(8 /* CompletionItemKind.Module */, codicons_1.Codicon.symbolModule);
        byKind.set(9 /* CompletionItemKind.Property */, codicons_1.Codicon.symbolProperty);
        byKind.set(10 /* CompletionItemKind.Event */, codicons_1.Codicon.symbolEvent);
        byKind.set(11 /* CompletionItemKind.Operator */, codicons_1.Codicon.symbolOperator);
        byKind.set(12 /* CompletionItemKind.Unit */, codicons_1.Codicon.symbolUnit);
        byKind.set(13 /* CompletionItemKind.Value */, codicons_1.Codicon.symbolValue);
        byKind.set(15 /* CompletionItemKind.Enum */, codicons_1.Codicon.symbolEnum);
        byKind.set(14 /* CompletionItemKind.Constant */, codicons_1.Codicon.symbolConstant);
        byKind.set(15 /* CompletionItemKind.Enum */, codicons_1.Codicon.symbolEnum);
        byKind.set(16 /* CompletionItemKind.EnumMember */, codicons_1.Codicon.symbolEnumMember);
        byKind.set(17 /* CompletionItemKind.Keyword */, codicons_1.Codicon.symbolKeyword);
        byKind.set(27 /* CompletionItemKind.Snippet */, codicons_1.Codicon.symbolSnippet);
        byKind.set(18 /* CompletionItemKind.Text */, codicons_1.Codicon.symbolText);
        byKind.set(19 /* CompletionItemKind.Color */, codicons_1.Codicon.symbolColor);
        byKind.set(20 /* CompletionItemKind.File */, codicons_1.Codicon.symbolFile);
        byKind.set(21 /* CompletionItemKind.Reference */, codicons_1.Codicon.symbolReference);
        byKind.set(22 /* CompletionItemKind.Customcolor */, codicons_1.Codicon.symbolCustomColor);
        byKind.set(23 /* CompletionItemKind.Folder */, codicons_1.Codicon.symbolFolder);
        byKind.set(24 /* CompletionItemKind.TypeParameter */, codicons_1.Codicon.symbolTypeParameter);
        byKind.set(25 /* CompletionItemKind.User */, codicons_1.Codicon.account);
        byKind.set(26 /* CompletionItemKind.Issue */, codicons_1.Codicon.issues);
        /**
         * @internal
         */
        function toIcon(kind) {
            let codicon = byKind.get(kind);
            if (!codicon) {
                console.info('No codicon found for CompletionItemKind ' + kind);
                codicon = codicons_1.Codicon.symbolProperty;
            }
            return codicon;
        }
        CompletionItemKinds.toIcon = toIcon;
        const data = new Map();
        data.set('method', 0 /* CompletionItemKind.Method */);
        data.set('function', 1 /* CompletionItemKind.Function */);
        data.set('constructor', 2 /* CompletionItemKind.Constructor */);
        data.set('field', 3 /* CompletionItemKind.Field */);
        data.set('variable', 4 /* CompletionItemKind.Variable */);
        data.set('class', 5 /* CompletionItemKind.Class */);
        data.set('struct', 6 /* CompletionItemKind.Struct */);
        data.set('interface', 7 /* CompletionItemKind.Interface */);
        data.set('module', 8 /* CompletionItemKind.Module */);
        data.set('property', 9 /* CompletionItemKind.Property */);
        data.set('event', 10 /* CompletionItemKind.Event */);
        data.set('operator', 11 /* CompletionItemKind.Operator */);
        data.set('unit', 12 /* CompletionItemKind.Unit */);
        data.set('value', 13 /* CompletionItemKind.Value */);
        data.set('constant', 14 /* CompletionItemKind.Constant */);
        data.set('enum', 15 /* CompletionItemKind.Enum */);
        data.set('enum-member', 16 /* CompletionItemKind.EnumMember */);
        data.set('enumMember', 16 /* CompletionItemKind.EnumMember */);
        data.set('keyword', 17 /* CompletionItemKind.Keyword */);
        data.set('snippet', 27 /* CompletionItemKind.Snippet */);
        data.set('text', 18 /* CompletionItemKind.Text */);
        data.set('color', 19 /* CompletionItemKind.Color */);
        data.set('file', 20 /* CompletionItemKind.File */);
        data.set('reference', 21 /* CompletionItemKind.Reference */);
        data.set('customcolor', 22 /* CompletionItemKind.Customcolor */);
        data.set('folder', 23 /* CompletionItemKind.Folder */);
        data.set('type-parameter', 24 /* CompletionItemKind.TypeParameter */);
        data.set('typeParameter', 24 /* CompletionItemKind.TypeParameter */);
        data.set('account', 25 /* CompletionItemKind.User */);
        data.set('issue', 26 /* CompletionItemKind.Issue */);
        /**
         * @internal
         */
        function fromString(value, strict) {
            let res = data.get(value);
            if (typeof res === 'undefined' && !strict) {
                res = 9 /* CompletionItemKind.Property */;
            }
            return res;
        }
        CompletionItemKinds.fromString = fromString;
    })(CompletionItemKinds || (exports.CompletionItemKinds = CompletionItemKinds = {}));
    var CompletionItemTag;
    (function (CompletionItemTag) {
        CompletionItemTag[CompletionItemTag["Deprecated"] = 1] = "Deprecated";
    })(CompletionItemTag || (exports.CompletionItemTag = CompletionItemTag = {}));
    var CompletionItemInsertTextRule;
    (function (CompletionItemInsertTextRule) {
        CompletionItemInsertTextRule[CompletionItemInsertTextRule["None"] = 0] = "None";
        /**
         * Adjust whitespace/indentation of multiline insert texts to
         * match the current line indentation.
         */
        CompletionItemInsertTextRule[CompletionItemInsertTextRule["KeepWhitespace"] = 1] = "KeepWhitespace";
        /**
         * `insertText` is a snippet.
         */
        CompletionItemInsertTextRule[CompletionItemInsertTextRule["InsertAsSnippet"] = 4] = "InsertAsSnippet";
    })(CompletionItemInsertTextRule || (exports.CompletionItemInsertTextRule = CompletionItemInsertTextRule = {}));
    /**
     * How a suggest provider was triggered.
     */
    var CompletionTriggerKind;
    (function (CompletionTriggerKind) {
        CompletionTriggerKind[CompletionTriggerKind["Invoke"] = 0] = "Invoke";
        CompletionTriggerKind[CompletionTriggerKind["TriggerCharacter"] = 1] = "TriggerCharacter";
        CompletionTriggerKind[CompletionTriggerKind["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
    })(CompletionTriggerKind || (exports.CompletionTriggerKind = CompletionTriggerKind = {}));
    /**
     * How an {@link InlineCompletionsProvider inline completion provider} was triggered.
     */
    var InlineCompletionTriggerKind;
    (function (InlineCompletionTriggerKind) {
        /**
         * Completion was triggered automatically while editing.
         * It is sufficient to return a single completion item in this case.
         */
        InlineCompletionTriggerKind[InlineCompletionTriggerKind["Automatic"] = 0] = "Automatic";
        /**
         * Completion was triggered explicitly by a user gesture.
         * Return multiple completion items to enable cycling through them.
         */
        InlineCompletionTriggerKind[InlineCompletionTriggerKind["Explicit"] = 1] = "Explicit";
    })(InlineCompletionTriggerKind || (exports.InlineCompletionTriggerKind = InlineCompletionTriggerKind = {}));
    class SelectedSuggestionInfo {
        constructor(range, text, completionKind, isSnippetText) {
            this.range = range;
            this.text = text;
            this.completionKind = completionKind;
            this.isSnippetText = isSnippetText;
        }
        equals(other) {
            return range_1.Range.lift(this.range).equalsRange(other.range)
                && this.text === other.text
                && this.completionKind === other.completionKind
                && this.isSnippetText === other.isSnippetText;
        }
    }
    exports.SelectedSuggestionInfo = SelectedSuggestionInfo;
    var CodeActionTriggerType;
    (function (CodeActionTriggerType) {
        CodeActionTriggerType[CodeActionTriggerType["Invoke"] = 1] = "Invoke";
        CodeActionTriggerType[CodeActionTriggerType["Auto"] = 2] = "Auto";
    })(CodeActionTriggerType || (exports.CodeActionTriggerType = CodeActionTriggerType = {}));
    var SignatureHelpTriggerKind;
    (function (SignatureHelpTriggerKind) {
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
    })(SignatureHelpTriggerKind || (exports.SignatureHelpTriggerKind = SignatureHelpTriggerKind = {}));
    /**
     * A document highlight kind.
     */
    var DocumentHighlightKind;
    (function (DocumentHighlightKind) {
        /**
         * A textual occurrence.
         */
        DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
        /**
         * Read-access of a symbol, like reading a variable.
         */
        DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
        /**
         * Write-access of a symbol, like writing to a variable.
         */
        DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
    })(DocumentHighlightKind || (exports.DocumentHighlightKind = DocumentHighlightKind = {}));
    /**
     * @internal
     */
    function isLocationLink(thing) {
        return thing
            && uri_1.URI.isUri(thing.uri)
            && range_1.Range.isIRange(thing.range)
            && (range_1.Range.isIRange(thing.originSelectionRange) || range_1.Range.isIRange(thing.targetSelectionRange));
    }
    exports.isLocationLink = isLocationLink;
    /**
     * A symbol kind.
     */
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
    /**
     * @internal
     */
    exports.symbolKindNames = {
        [17 /* SymbolKind.Array */]: (0, nls_1.localize)('Array', "array"),
        [16 /* SymbolKind.Boolean */]: (0, nls_1.localize)('Boolean', "boolean"),
        [4 /* SymbolKind.Class */]: (0, nls_1.localize)('Class', "class"),
        [13 /* SymbolKind.Constant */]: (0, nls_1.localize)('Constant', "constant"),
        [8 /* SymbolKind.Constructor */]: (0, nls_1.localize)('Constructor', "constructor"),
        [9 /* SymbolKind.Enum */]: (0, nls_1.localize)('Enum', "enumeration"),
        [21 /* SymbolKind.EnumMember */]: (0, nls_1.localize)('EnumMember', "enumeration member"),
        [23 /* SymbolKind.Event */]: (0, nls_1.localize)('Event', "event"),
        [7 /* SymbolKind.Field */]: (0, nls_1.localize)('Field', "field"),
        [0 /* SymbolKind.File */]: (0, nls_1.localize)('File', "file"),
        [11 /* SymbolKind.Function */]: (0, nls_1.localize)('Function', "function"),
        [10 /* SymbolKind.Interface */]: (0, nls_1.localize)('Interface', "interface"),
        [19 /* SymbolKind.Key */]: (0, nls_1.localize)('Key', "key"),
        [5 /* SymbolKind.Method */]: (0, nls_1.localize)('Method', "method"),
        [1 /* SymbolKind.Module */]: (0, nls_1.localize)('Module', "module"),
        [2 /* SymbolKind.Namespace */]: (0, nls_1.localize)('Namespace', "namespace"),
        [20 /* SymbolKind.Null */]: (0, nls_1.localize)('Null', "null"),
        [15 /* SymbolKind.Number */]: (0, nls_1.localize)('Number', "number"),
        [18 /* SymbolKind.Object */]: (0, nls_1.localize)('Object', "object"),
        [24 /* SymbolKind.Operator */]: (0, nls_1.localize)('Operator', "operator"),
        [3 /* SymbolKind.Package */]: (0, nls_1.localize)('Package', "package"),
        [6 /* SymbolKind.Property */]: (0, nls_1.localize)('Property', "property"),
        [14 /* SymbolKind.String */]: (0, nls_1.localize)('String', "string"),
        [22 /* SymbolKind.Struct */]: (0, nls_1.localize)('Struct', "struct"),
        [25 /* SymbolKind.TypeParameter */]: (0, nls_1.localize)('TypeParameter', "type parameter"),
        [12 /* SymbolKind.Variable */]: (0, nls_1.localize)('Variable', "variable"),
    };
    /**
     * @internal
     */
    function getAriaLabelForSymbol(symbolName, kind) {
        return (0, nls_1.localize)('symbolAriaLabel', '{0} ({1})', symbolName, exports.symbolKindNames[kind]);
    }
    exports.getAriaLabelForSymbol = getAriaLabelForSymbol;
    var SymbolTag;
    (function (SymbolTag) {
        SymbolTag[SymbolTag["Deprecated"] = 1] = "Deprecated";
    })(SymbolTag || (exports.SymbolTag = SymbolTag = {}));
    /**
     * @internal
     */
    var SymbolKinds;
    (function (SymbolKinds) {
        const byKind = new Map();
        byKind.set(0 /* SymbolKind.File */, codicons_1.Codicon.symbolFile);
        byKind.set(1 /* SymbolKind.Module */, codicons_1.Codicon.symbolModule);
        byKind.set(2 /* SymbolKind.Namespace */, codicons_1.Codicon.symbolNamespace);
        byKind.set(3 /* SymbolKind.Package */, codicons_1.Codicon.symbolPackage);
        byKind.set(4 /* SymbolKind.Class */, codicons_1.Codicon.symbolClass);
        byKind.set(5 /* SymbolKind.Method */, codicons_1.Codicon.symbolMethod);
        byKind.set(6 /* SymbolKind.Property */, codicons_1.Codicon.symbolProperty);
        byKind.set(7 /* SymbolKind.Field */, codicons_1.Codicon.symbolField);
        byKind.set(8 /* SymbolKind.Constructor */, codicons_1.Codicon.symbolConstructor);
        byKind.set(9 /* SymbolKind.Enum */, codicons_1.Codicon.symbolEnum);
        byKind.set(10 /* SymbolKind.Interface */, codicons_1.Codicon.symbolInterface);
        byKind.set(11 /* SymbolKind.Function */, codicons_1.Codicon.symbolFunction);
        byKind.set(12 /* SymbolKind.Variable */, codicons_1.Codicon.symbolVariable);
        byKind.set(13 /* SymbolKind.Constant */, codicons_1.Codicon.symbolConstant);
        byKind.set(14 /* SymbolKind.String */, codicons_1.Codicon.symbolString);
        byKind.set(15 /* SymbolKind.Number */, codicons_1.Codicon.symbolNumber);
        byKind.set(16 /* SymbolKind.Boolean */, codicons_1.Codicon.symbolBoolean);
        byKind.set(17 /* SymbolKind.Array */, codicons_1.Codicon.symbolArray);
        byKind.set(18 /* SymbolKind.Object */, codicons_1.Codicon.symbolObject);
        byKind.set(19 /* SymbolKind.Key */, codicons_1.Codicon.symbolKey);
        byKind.set(20 /* SymbolKind.Null */, codicons_1.Codicon.symbolNull);
        byKind.set(21 /* SymbolKind.EnumMember */, codicons_1.Codicon.symbolEnumMember);
        byKind.set(22 /* SymbolKind.Struct */, codicons_1.Codicon.symbolStruct);
        byKind.set(23 /* SymbolKind.Event */, codicons_1.Codicon.symbolEvent);
        byKind.set(24 /* SymbolKind.Operator */, codicons_1.Codicon.symbolOperator);
        byKind.set(25 /* SymbolKind.TypeParameter */, codicons_1.Codicon.symbolTypeParameter);
        /**
         * @internal
         */
        function toIcon(kind) {
            let icon = byKind.get(kind);
            if (!icon) {
                console.info('No codicon found for SymbolKind ' + kind);
                icon = codicons_1.Codicon.symbolProperty;
            }
            return icon;
        }
        SymbolKinds.toIcon = toIcon;
    })(SymbolKinds || (exports.SymbolKinds = SymbolKinds = {}));
    /** @internal */
    class TextEdit {
        static asEditOperation(edit) {
            return editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text);
        }
    }
    exports.TextEdit = TextEdit;
    class FoldingRangeKind {
        /**
         * Kind for folding range representing a comment. The value of the kind is 'comment'.
         */
        static { this.Comment = new FoldingRangeKind('comment'); }
        /**
         * Kind for folding range representing a import. The value of the kind is 'imports'.
         */
        static { this.Imports = new FoldingRangeKind('imports'); }
        /**
         * Kind for folding range representing regions (for example marked by `#region`, `#endregion`).
         * The value of the kind is 'region'.
         */
        static { this.Region = new FoldingRangeKind('region'); }
        /**
         * Returns a {@link FoldingRangeKind} for the given value.
         *
         * @param value of the kind.
         */
        static fromValue(value) {
            switch (value) {
                case 'comment': return FoldingRangeKind.Comment;
                case 'imports': return FoldingRangeKind.Imports;
                case 'region': return FoldingRangeKind.Region;
            }
            return new FoldingRangeKind(value);
        }
        /**
         * Creates a new {@link FoldingRangeKind}.
         *
         * @param value of the kind.
         */
        constructor(value) {
            this.value = value;
        }
    }
    exports.FoldingRangeKind = FoldingRangeKind;
    /**
     * @internal
     */
    var Command;
    (function (Command) {
        /**
         * @internal
         */
        function is(obj) {
            if (!obj || typeof obj !== 'object') {
                return false;
            }
            return typeof obj.id === 'string' &&
                typeof obj.title === 'string';
        }
        Command.is = is;
    })(Command || (exports.Command = Command = {}));
    /**
     * @internal
     */
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
    /**
     * @internal
     */
    var CommentThreadState;
    (function (CommentThreadState) {
        CommentThreadState[CommentThreadState["Unresolved"] = 0] = "Unresolved";
        CommentThreadState[CommentThreadState["Resolved"] = 1] = "Resolved";
    })(CommentThreadState || (exports.CommentThreadState = CommentThreadState = {}));
    /**
     * @internal
     */
    var CommentMode;
    (function (CommentMode) {
        CommentMode[CommentMode["Editing"] = 0] = "Editing";
        CommentMode[CommentMode["Preview"] = 1] = "Preview";
    })(CommentMode || (exports.CommentMode = CommentMode = {}));
    /**
     * @internal
     */
    var CommentState;
    (function (CommentState) {
        CommentState[CommentState["Published"] = 0] = "Published";
        CommentState[CommentState["Draft"] = 1] = "Draft";
    })(CommentState || (exports.CommentState = CommentState = {}));
    var InlayHintKind;
    (function (InlayHintKind) {
        InlayHintKind[InlayHintKind["Type"] = 1] = "Type";
        InlayHintKind[InlayHintKind["Parameter"] = 2] = "Parameter";
    })(InlayHintKind || (exports.InlayHintKind = InlayHintKind = {}));
    /**
     * @internal
     */
    class LazyTokenizationSupport {
        constructor(createSupport) {
            this.createSupport = createSupport;
            this._tokenizationSupport = null;
        }
        dispose() {
            if (this._tokenizationSupport) {
                this._tokenizationSupport.then((support) => {
                    if (support) {
                        support.dispose();
                    }
                });
            }
        }
        get tokenizationSupport() {
            if (!this._tokenizationSupport) {
                this._tokenizationSupport = this.createSupport();
            }
            return this._tokenizationSupport;
        }
    }
    exports.LazyTokenizationSupport = LazyTokenizationSupport;
    /**
     * @internal
     */
    exports.TokenizationRegistry = new tokenizationRegistry_1.TokenizationRegistry();
    /**
     * @internal
     */
    var ExternalUriOpenerPriority;
    (function (ExternalUriOpenerPriority) {
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["None"] = 0] = "None";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Option"] = 1] = "Option";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Default"] = 2] = "Default";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Preferred"] = 3] = "Preferred";
    })(ExternalUriOpenerPriority || (exports.ExternalUriOpenerPriority = ExternalUriOpenerPriority = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQ2hHLE1BQWEsS0FBSztRQUdqQixZQUNpQixNQUFjLEVBQ2QsSUFBWSxFQUNaLFFBQWdCO1lBRmhCLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDZCxTQUFJLEdBQUosSUFBSSxDQUFRO1lBQ1osYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUxqQyxnQkFBVyxHQUFTLFNBQVMsQ0FBQztRQU85QixDQUFDO1FBRU0sUUFBUTtZQUNkLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ25ELENBQUM7S0FDRDtJQWJELHNCQWFDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLGtCQUFrQjtRQUc5QixZQUNpQixNQUFlLEVBQ2YsUUFBZ0I7WUFEaEIsV0FBTSxHQUFOLE1BQU0sQ0FBUztZQUNmLGFBQVEsR0FBUixRQUFRLENBQVE7WUFKakMsNkJBQXdCLEdBQVMsU0FBUyxDQUFDO1FBTTNDLENBQUM7S0FDRDtJQVJELGdEQVFDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLHlCQUF5QjtRQUdyQztRQUNDOzs7OztXQUtHO1FBQ2EsTUFBbUIsRUFDbkIsUUFBZ0I7WUFEaEIsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUNuQixhQUFRLEdBQVIsUUFBUSxDQUFRO1lBVmpDLG9DQUErQixHQUFTLFNBQVMsQ0FBQztRQVlsRCxDQUFDO0tBQ0Q7SUFkRCw4REFjQztJQXlNRCxJQUFrQixrQkE2QmpCO0lBN0JELFdBQWtCLGtCQUFrQjtRQUNuQywrREFBTSxDQUFBO1FBQ04sbUVBQVEsQ0FBQTtRQUNSLHlFQUFXLENBQUE7UUFDWCw2REFB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
//# sourceURL=../../../vs/editor/common/languages.js
})