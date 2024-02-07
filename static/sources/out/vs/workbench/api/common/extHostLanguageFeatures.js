/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/objects", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/editor/common/languages", "./extHost.protocol", "vs/base/common/strings", "vs/editor/common/core/range", "vs/base/common/arrays", "vs/base/common/types", "vs/editor/common/core/selection", "vs/base/common/cancellation", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/editor/common/services/semanticTokensDto", "vs/base/common/idGenerator", "./cache", "vs/base/common/stopwatch", "vs/base/common/errors", "vs/base/common/async", "vs/workbench/services/extensions/common/extensions", "vs/nls"], function (require, exports, uri_1, objects_1, typeConvert, extHostTypes_1, languages, extHostProtocol, strings_1, range_1, arrays_1, types_1, selection_1, cancellation_1, extensions_1, lifecycle_1, semanticTokensDto_1, idGenerator_1, cache_1, stopwatch_1, errors_1, async_1, extensions_2, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostLanguageFeatures = void 0;
    // --- adapter
    class DocumentSymbolAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDocumentSymbols(resource, token) {
            const doc = this._documents.getDocument(resource);
            const value = await this._provider.provideDocumentSymbols(doc, token);
            if ((0, arrays_1.isFalsyOrEmpty)(value)) {
                return undefined;
            }
            else if (value[0] instanceof extHostTypes_1.DocumentSymbol) {
                return value.map(typeConvert.DocumentSymbol.from);
            }
            else {
                return DocumentSymbolAdapter._asDocumentSymbolTree(value);
            }
        }
        static _asDocumentSymbolTree(infos) {
            // first sort by start (and end) and then loop over all elements
            // and build a tree based on containment.
            infos = infos.slice(0).sort((a, b) => {
                let res = a.location.range.start.compareTo(b.location.range.start);
                if (res === 0) {
                    res = b.location.range.end.compareTo(a.location.range.end);
                }
                return res;
            });
            const res = [];
            const parentStack = [];
            for (const info of infos) {
                const element = {
                    name: info.name || '!!MISSING: name!!',
                    kind: typeConvert.SymbolKind.from(info.kind),
                    tags: info.tags?.map(typeConvert.SymbolTag.from) || [],
                    detail: '',
                    containerName: info.containerName,
                    range: typeConvert.Range.from(info.location.range),
                    selectionRange: typeConvert.Range.from(info.location.range),
                    children: []
                };
                while (true) {
                    if (parentStack.length === 0) {
                        parentStack.push(element);
                        res.push(element);
                        break;
                    }
                    const parent = parentStack[parentStack.length - 1];
                    if (range_1.Range.containsRange(parent.range, element.range) && !range_1.Range.equalsRange(parent.range, element.range)) {
                        parent.children?.push(element);
                        parentStack.push(element);
                        break;
                    }
                    parentStack.pop();
                }
            }
            return res;
        }
    }
    class CodeLensAdapter {
        constructor(_documents, _commands, _provider, _extension, _extTelemetry, _logService) {
            this._documents = _documents;
            this._commands = _commands;
            this._provider = _provider;
            this._extension = _extension;
            this._extTelemetry = _extTelemetry;
            this._logService = _logService;
            this._cache = new cache_1.Cache('CodeLens');
            this._disposables = new Map();
        }
        async provideCodeLenses(resource, token) {
            const doc = this._documents.getDocument(resource);
            const lenses = await this._provider.provideCodeLenses(doc, token);
            if (!lenses || token.isCancellationRequested) {
                return undefined;
            }
            const cacheId = this._cache.add(lenses);
            const disposables = new lifecycle_1.DisposableStore();
            this._disposables.set(cacheId, disposables);
            const result = {
                cacheId,
                lenses: [],
            };
            for (let i = 0; i < lenses.length; i++) {
                result.lenses.push({
                    cacheId: [cacheId, i],
                    range: typeConvert.Range.from(lenses[i].range),
                    command: this._commands.toInternal(lenses[i].command, disposables)
                });
            }
            return result;
        }
        async resolveCodeLens(symbol, token) {
            const lens = symbol.cacheId && this._cache.get(...symbol.cacheId);
            if (!lens) {
                return undefined;
            }
            let resolvedLens;
            if (typeof this._provider.resolveCodeLens !== 'function' || lens.isResolved) {
                resolvedLens = lens;
            }
            else {
                resolvedLens = await this._provider.resolveCodeLens(lens, token);
            }
            if (!resolvedLens) {
                resolvedLens = lens;
            }
            if (token.isCancellationRequested) {
                return undefined;
            }
            const disposables = symbol.cacheId && this._disposables.get(symbol.cacheId[0]);
            if (!disposables) {
                // disposed in the meantime
                return undefined;
            }
            if (!resolvedLens.command) {
                const error = new Error('INVALID code lens resolved, lacks command: ' + this._extension.identifier.value);
                this._extTelemetry.onExtensionError(this._extension.identifier, error);
                this._logService.error(error);
                return undefined;
            }
            symbol.command = this._commands.toInternal(resolvedLens.command, disposables);
            return symbol;
        }
        releaseCodeLenses(cachedId) {
            this._disposables.get(cachedId)?.dispose();
            this._disposables.delete(cachedId);
            this._cache.delete(cachedId);
        }
    }
    function convertToLocationLinks(value) {
        if (Array.isArray(value)) {
            return value.map(typeConvert.DefinitionLink.from);
        }
        else if (value) {
            return [typeConvert.DefinitionLink.from(value)];
        }
        return [];
    }
    class DefinitionAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDefinition(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideDefinition(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class DeclarationAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDeclaration(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideDeclaration(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class ImplementationAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideImplementation(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideImplementation(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class TypeDefinitionAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideTypeDefinition(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideTypeDefinition(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class HoverAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideHover(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideHover(doc, pos, token);
            if (!value || (0, arrays_1.isFalsyOrEmpty)(value.contents)) {
                return undefined;
            }
            if (!value.range) {
                value.range = doc.getWordRangeAtPosition(pos);
            }
            if (!value.range) {
                value.range = new extHostTypes_1.Range(pos, pos);
            }
            return typeConvert.Hover.from(value);
        }
    }
    class EvaluatableExpressionAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideEvaluatableExpression(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideEvaluatableExpression(doc, pos, token);
            if (value) {
                return typeConvert.EvaluatableExpression.from(value);
            }
            return undefined;
        }
    }
    class InlineValuesAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideInlineValues(resource, viewPort, context, token) {
            const doc = this._documents.getDocument(resource);
            const value = await this._provider.provideInlineValues(doc, typeConvert.Range.to(viewPort), typeConvert.InlineValueContext.to(context), token);
            if (Array.isArray(value)) {
                return value.map(iv => typeConvert.InlineValue.from(iv));
            }
            return undefined;
        }
    }
    class DocumentHighlightAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDocumentHighlights(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideDocumentHighlights(doc, pos, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.DocumentHighlight.from);
            }
            return undefined;
        }
    }
    class MultiDocumentHighlightAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideMultiDocumentHighlights(resource, position, otherResources, token) {
            const doc = this._documents.getDocument(resource);
            const otherDocuments = otherResources.map(r => this._documents.getDocument(r));
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideMultiDocumentHighlights(doc, pos, otherDocuments, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.MultiDocumentHighlight.from);
            }
            return undefined;
        }
    }
    class LinkedEditingRangeAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideLinkedEditingRanges(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideLinkedEditingRanges(doc, pos, token);
            if (value && Array.isArray(value.ranges)) {
                return {
                    ranges: (0, arrays_1.coalesce)(value.ranges.map(typeConvert.Range.from)),
                    wordPattern: value.wordPattern
                };
            }
            return undefined;
        }
    }
    class ReferenceAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideReferences(resource, position, context, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideReferences(doc, pos, context, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.location.from);
            }
            return undefined;
        }
    }
    class CodeActionAdapter {
        static { this._maxCodeActionsPerFile = 1000; }
        constructor(_documents, _commands, _diagnostics, _provider, _logService, _extension, _apiDeprecation) {
            this._documents = _documents;
            this._commands = _commands;
            this._diagnostics = _diagnostics;
            this._provider = _provider;
            this._logService = _logService;
            this._extension = _extension;
            this._apiDeprecation = _apiDeprecation;
            this._cache = new cache_1.Cache('CodeAction');
            this._disposables = new Map();
        }
        async provideCodeActions(resource, rangeOrSelection, context, token) {
            const doc = this._documents.getDocument(resource);
            const ran = selection_1.Selection.isISelection(rangeOrSelection)
                ? typeConvert.Selection.to(rangeOrSelection)
                : typeConvert.Range.to(rangeOrSelection);
            const allDiagnostics = [];
            for (const diagnostic of this._diagnostics.getDiagnostics(resource)) {
                if (ran.intersection(diagnostic.range)) {
                    const newLen = allDiagnostics.push(diagnostic);
                    if (newLen > CodeActionAdapter._maxCodeActionsPerFile) {
                        break;
                    }
                }
            }
            const codeActionContext = {
                diagnostics: allDiagnostics,
                only: context.only ? new extHostTypes_1.CodeActionKind(context.only) : undefined,
                triggerKind: typeConvert.CodeActionTriggerKind.to(context.trigger),
            };
            const commandsOrActions = await this._provider.provideCodeActions(doc, ran, codeActionContext, token);
            if (!(0, arrays_1.isNonEmptyArray)(commandsOrActions) || token.isCancellationRequested) {
                return undefined;
            }
            const cacheId = this._cache.add(commandsOrActions);
            const disposables = new lifecycle_1.DisposableStore();
            this._disposables.set(cacheId, disposables);
            const actions = [];
            for (let i = 0; i < commandsOrActions.length; i++) {
                const candidate = commandsOrActions[i];
                if (!candidate) {
                    continue;
                }
                if (CodeActionAdapter._isCommand(candidate)) {
                    // old school: synthetic code action
                    this._apiDeprecation.report('CodeActionProvider.provideCodeActions - return commands', this._extension, `Return 'CodeAction' instances instead.`);
                    actions.push({
                        _isSynthetic: true,
                        title: candidate.title,
                        command: this._commands.toInternal(candidate, disposables),
                    });
                }
                else {
                    if (codeActionContext.only) {
                        if (!candidate.kind) {
                            this._logService.warn(`${this._extension.identifier.value} - Code actions of kind '${codeActionContext.only.value} 'requested but returned code action does not have a 'kind'. Code action will be dropped. Please set 'CodeAction.kind'.`);
                        }
                        else if (!codeActionContext.only.contains(candidate.kind)) {
                            this._logService.warn(`${this._extension.identifier.value} - Code actions of kind '${codeActionContext.only.value} 'requested but returned code action is of kind '${candidate.kind.value}'. Code action will be dropped. Please check 'CodeActionContext.only' to only return requested code actions.`);
                        }
                    }
                    // Ensures that this is either a Range[] or an empty array so we don't get Array<Range | undefined>
                    const range = candidate.ranges ?? [];
                    // new school: convert code action
                    actions.push({
                        cacheId: [cacheId, i],
                        title: candidate.title,
                        command: candidate.command && this._commands.toInternal(candidate.command, disposables),
                        diagnostics: candidate.diagnostics && candidate.diagnostics.map(typeConvert.Diagnostic.from),
                        edit: candidate.edit && typeConvert.WorkspaceEdit.from(candidate.edit, undefined),
                        kind: candidate.kind && candidate.kind.value,
                        isPreferred: candidate.isPreferred,
                        isAI: (0, extensions_2.isProposedApiEnabled)(this._extension, 'codeActionAI') ? candidate.isAI : false,
                        ranges: (0, extensions_2.isProposedApiEnabled)(this._extension, 'codeActionRanges') ? (0, arrays_1.coalesce)(range.map(typeConvert.Range.from)) : undefined,
                        disabled: candidate.disabled?.reason
                    });
                }
            }
            return { cacheId, actions };
        }
        async resolveCodeAction(id, token) {
            const [sessionId, itemId] = id;
            const item = this._cache.get(sessionId, itemId);
            if (!item || CodeActionAdapter._isCommand(item)) {
                return {}; // code actions only!
            }
            if (!this._provider.resolveCodeAction) {
                return {}; // this should not happen...
            }
            const resolvedItem = (await this._provider.resolveCodeAction(item, token)) ?? item;
            let resolvedEdit;
            if (resolvedItem.edit) {
                resolvedEdit = typeConvert.WorkspaceEdit.from(resolvedItem.edit, undefined);
            }
            let resolvedCommand;
            if (resolvedItem.command) {
                const disposables = this._disposables.get(sessionId);
                if (disposables) {
                    resolvedCommand = this._commands.toInternal(resolvedItem.command, disposables);
                }
            }
            return { edit: resolvedEdit, command: resolvedCommand };
        }
        releaseCodeActions(cachedId) {
            this._disposables.get(cachedId)?.dispose();
            this._disposables.delete(cachedId);
            this._cache.delete(cachedId);
        }
        static _isCommand(thing) {
            return typeof thing.command === 'string' && typeof thing.title === 'string';
        }
    }
    class DocumentPasteEditProvider {
        static toInternalProviderId(extId, editId) {
            return extId + '.' + editId;
        }
        constructor(_proxy, _documents, _provider, _handle, _extension) {
            this._proxy = _proxy;
            this._documents = _documents;
            this._provider = _provider;
            this._handle = _handle;
            this._extension = _extension;
        }
        async prepareDocumentPaste(resource, ranges, dataTransferDto, token) {
            if (!this._provider.prepareDocumentPaste) {
                return;
            }
            const doc = this._documents.getDocument(resource);
            const vscodeRanges = ranges.map(range => typeConvert.Range.to(range));
            const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, () => {
                throw new errors_1.NotImplementedError();
            });
            await this._provider.prepareDocumentPaste(doc, vscodeRanges, dataTransfer, token);
            if (token.isCancellationRequested) {
                return;
            }
            // Only send back values that have been added to the data transfer
            const entries = Array.from(dataTransfer).filter(([, value]) => !(value instanceof extHostTypes_1.InternalDataTransferItem));
            return typeConvert.DataTransfer.from(entries);
        }
        async providePasteEdits(requestId, resource, ranges, dataTransferDto, token) {
            if (!this._provider.provideDocumentPasteEdits) {
                return;
            }
            const doc = this._documents.getDocument(resource);
            const vscodeRanges = ranges.map(range => typeConvert.Range.to(range));
            const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, async (id) => {
                return (await this._proxy.$resolvePasteFileData(this._handle, requestId, id)).buffer;
            });
            const edit = await this._provider.provideDocumentPasteEdits(doc, vscodeRanges, dataTransfer, token);
            if (!edit) {
                return;
            }
            return {
                label: edit.label ?? (0, nls_1.localize)('defaultPasteLabel', "Paste using '{0}' extension", this._extension.displayName || this._extension.name),
                detail: this._extension.displayName || this._extension.name,
                yieldTo: edit.yieldTo?.map(yTo => {
                    return 'mimeType' in yTo ? yTo : { providerId: DocumentPasteEditProvider.toInternalProviderId(yTo.extensionId, yTo.providerId) };
                }),
                insertText: typeof edit.insertText === 'string' ? edit.insertText : { snippet: edit.insertText.value },
                additionalEdit: edit.additionalEdit ? typeConvert.WorkspaceEdit.from(edit.additionalEdit, undefined) : undefined,
            };
        }
    }
    class DocumentFormattingAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDocumentFormattingEdits(resource, options, token) {
            const document = this._documents.getDocument(resource);
            const value = await this._provider.provideDocumentFormattingEdits(document, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
    }
    class RangeFormattingAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDocumentRangeFormattingEdits(resource, range, options, token) {
            const document = this._documents.getDocument(resource);
            const ran = typeConvert.Range.to(range);
            const value = await this._provider.provideDocumentRangeFormattingEdits(document, ran, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
        async provideDocumentRangesFormattingEdits(resource, ranges, options, token) {
            (0, types_1.assertType)(typeof this._provider.provideDocumentRangesFormattingEdits === 'function', 'INVALID invocation of `provideDocumentRangesFormattingEdits`');
            const document = this._documents.getDocument(resource);
            const _ranges = ranges.map(typeConvert.Range.to);
            const value = await this._provider.provideDocumentRangesFormattingEdits(document, _ranges, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
    }
    class OnTypeFormattingAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this.autoFormatTriggerCharacters = []; // not here
        }
        async provideOnTypeFormattingEdits(resource, position, ch, options, token) {
            const document = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideOnTypeFormattingEdits(document, pos, ch, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
    }
    class NavigateTypeAdapter {
        constructor(_provider, _logService) {
            this._provider = _provider;
            this._logService = _logService;
            this._cache = new cache_1.Cache('WorkspaceSymbols');
        }
        async provideWorkspaceSymbols(search, token) {
            const value = await this._provider.provideWorkspaceSymbols(search, token);
            if (!(0, arrays_1.isNonEmptyArray)(value)) {
                return { symbols: [] };
            }
            const sid = this._cache.add(value);
            const result = {
                cacheId: sid,
                symbols: []
            };
            for (let i = 0; i < value.length; i++) {
                const item = value[i];
                if (!item || !item.name) {
                    this._logService.warn('INVALID SymbolInformation', item);
                    continue;
                }
                result.symbols.push({
                    ...typeConvert.WorkspaceSymbol.from(item),
                    cacheId: [sid, i]
                });
            }
            return result;
        }
        async resolveWorkspaceSymbol(symbol, token) {
            if (typeof this._provider.resolveWorkspaceSymbol !== 'function') {
                return symbol;
            }
            if (!symbol.cacheId) {
                return symbol;
            }
            const item = this._cache.get(...symbol.cacheId);
            if (item) {
                const value = await this._provider.resolveWorkspaceSymbol(item, token);
                return value && (0, objects_1.mixin)(symbol, typeConvert.WorkspaceSymbol.from(value), true);
            }
            return undefined;
        }
        releaseWorkspaceSymbols(id) {
            this._cache.delete(id);
        }
    }
    class RenameAdapter {
        static supportsResolving(provider) {
            return typeof provider.prepareRename === 'function';
        }
        constructor(_documents, _provider, _logService) {
            this._documents = _documents;
            this._provider = _provider;
            this._logService = _logService;
        }
        async provideRenameEdits(resource, position, newName, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            try {
                const value = await this._provider.provideRenameEdits(doc, pos, newName, token);
                if (!value) {
                    return undefined;
                }
                return typeConvert.WorkspaceEdit.from(value);
            }
            catch (err) {
                const rejectReason = RenameAdapter._asMessage(err);
                if (rejectReason) {
                    return { rejectReason, edits: undefined };
                }
                else {
                    // generic error
                    return Promise.reject(err);
                }
            }
        }
        async resolveRenameLocation(resource, position, token) {
            if (typeof this._provider.prepareRename !== 'function') {
                return Promise.resolve(undefined);
            }
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            try {
                const rangeOrLocation = await this._provider.prepareRename(doc, pos, token);
                let range;
                let text;
                if (extHostTypes_1.Range.isRange(rangeOrLocation)) {
                    range = rangeOrLocation;
                    text = doc.getText(rangeOrLocation);
                }
                else if ((0, types_1.isObject)(rangeOrLocation)) {
                    range = rangeOrLocation.range;
                    text = rangeOrLocation.placeholder;
                }
                if (!range || !text) {
                    return undefined;
                }
                if (range.start.line > pos.line || range.end.line < pos.line) {
                    this._logService.warn('INVALID rename location: position line must be within range start/end lines');
                    return undefined;
                }
                return { range: typeConvert.Range.from(range), text };
            }
            catch (err) {
                const rejectReason = RenameAdapter._asMessage(err);
                if (rejectReason) {
                    return { rejectReason, range: undefined, text: undefined };
                }
                else {
                    return Promise.reject(err);
                }
            }
        }
        static _asMessage(err) {
            if (typeof err === 'string') {
                return err;
            }
            else if (err instanceof Error && typeof err.message === 'string') {
                return err.message;
            }
            else {
                return undefined;
            }
        }
    }
    class SemanticTokensPreviousResult {
        constructor(resultId, tokens) {
            this.resultId = resultId;
            this.tokens = tokens;
        }
    }
    class DocumentSemanticTokensAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this._nextResultId = 1;
            this._previousResults = new Map();
        }
        async provideDocumentSemanticTokens(resource, previousResultId, token) {
            const doc = this._documents.getDocument(resource);
            const previousResult = (previousResultId !== 0 ? this._previousResults.get(previousResultId) : null);
            let value = typeof previousResult?.resultId === 'string' && typeof this._provider.provideDocumentSemanticTokensEdits === 'function'
                ? await this._provider.provideDocumentSemanticTokensEdits(doc, previousResult.resultId, token)
                : await this._provider.provideDocumentSemanticTokens(doc, token);
            if (previousResult) {
                this._previousResults.delete(previousResultId);
            }
            if (!value) {
                return null;
            }
            value = DocumentSemanticTokensAdapter._fixProvidedSemanticTokens(value);
            return this._send(DocumentSemanticTokensAdapter._convertToEdits(previousResult, value), value);
        }
        async releaseDocumentSemanticColoring(semanticColoringResultId) {
            this._previousResults.delete(semanticColoringResultId);
        }
        static _fixProvidedSemanticTokens(v) {
            if (DocumentSemanticTokensAdapter._isSemanticTokens(v)) {
                if (DocumentSemanticTokensAdapter._isCorrectSemanticTokens(v)) {
                    return v;
                }
                return new extHostTypes_1.SemanticTokens(new Uint32Array(v.data), v.resultId);
            }
            else if (DocumentSemanticTokensAdapter._isSemanticTokensEdits(v)) {
                if (DocumentSemanticTokensAdapter._isCorrectSemanticTokensEdits(v)) {
                    return v;
                }
                return new extHostTypes_1.SemanticTokensEdits(v.edits.map(edit => new extHostTypes_1.SemanticTokensEdit(edit.start, edit.deleteCount, edit.data ? new Uint32Array(edit.data) : edit.data)), v.resultId);
            }
            return v;
        }
        static _isSemanticTokens(v) {
            return v && !!(v.data);
        }
        static _isCorrectSemanticTokens(v) {
            return (v.data instanceof Uint32Array);
        }
        static _isSemanticTokensEdits(v) {
            return v && Array.isArray(v.edits);
        }
        static _isCorrectSemanticTokensEdits(v) {
            for (const edit of v.edits) {
                if (!(edit.data instanceof Uint32Array)) {
                    return false;
                }
            }
            return true;
        }
        static _convertToEdits(previousResult, newResult) {
            if (!DocumentSemanticTokensAdapter._isSemanticTokens(newResult)) {
                return newResult;
            }
            if (!previousResult || !previousResult.tokens) {
                return newResult;
            }
            const oldData = previousResult.tokens;
            const oldLength = oldData.length;
            const newData = newResult.data;
            const newLength = newData.length;
            let commonPrefixLength = 0;
            const maxCommonPrefixLength = Math.min(oldLength, newLength);
            while (commonPrefixLength < maxCommonPrefixLength && oldData[commonPrefixLength] === newData[commonPrefixLength]) {
                commonPrefixLength++;
            }
            if (commonPrefixLength === oldLength && commonPrefixLength === newLength) {
                // complete overlap!
                return new extHostTypes_1.SemanticTokensEdits([], newResult.resultId);
            }
            let commonSuffixLength = 0;
            const maxCommonSuffixLength = maxCommonPrefixLength - commonPrefixLength;
            while (commonSuffixLength < maxCommonSuffixLength && oldData[oldLength - commonSuffixLength - 1] === newData[newLength - commonSuffixLength - 1]) {
                commonSuffixLength++;
            }
            return new extHostTypes_1.SemanticTokensEdits([{
                    start: commonPrefixLength,
                    deleteCount: (oldLength - commonPrefixLength - commonSuffixLength),
                    data: newData.subarray(commonPrefixLength, newLength - commonSuffixLength)
                }], newResult.resultId);
        }
        _send(value, original) {
            if (DocumentSemanticTokensAdapter._isSemanticTokens(value)) {
                const myId = this._nextResultId++;
                this._previousResults.set(myId, new SemanticTokensPreviousResult(value.resultId, value.data));
                return (0, semanticTokensDto_1.encodeSemanticTokensDto)({
                    id: myId,
                    type: 'full',
                    data: value.data
                });
            }
            if (DocumentSemanticTokensAdapter._isSemanticTokensEdits(value)) {
                const myId = this._nextResultId++;
                if (DocumentSemanticTokensAdapter._isSemanticTokens(original)) {
                    // store the original
                    this._previousResults.set(myId, new SemanticTokensPreviousResult(original.resultId, original.data));
                }
                else {
                    this._previousResults.set(myId, new SemanticTokensPreviousResult(value.resultId));
                }
                return (0, semanticTokensDto_1.encodeSemanticTokensDto)({
                    id: myId,
                    type: 'delta',
                    deltas: (value.edits || []).map(edit => ({ start: edit.start, deleteCount: edit.deleteCount, data: edit.data }))
                });
            }
            return null;
        }
    }
    class DocumentRangeSemanticTokensAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDocumentRangeSemanticTokens(resource, range, token) {
            const doc = this._documents.getDocument(resource);
            const value = await this._provider.provideDocumentRangeSemanticTokens(doc, typeConvert.Range.to(range), token);
            if (!value) {
                return null;
            }
            return this._send(value);
        }
        _send(value) {
            return (0, semanticTokensDto_1.encodeSemanticTokensDto)({
                id: 0,
                type: 'full',
                data: value.data
            });
        }
    }
    class CompletionsAdapter {
        static supportsResolving(provider) {
            return typeof provider.resolveCompletionItem === 'function';
        }
        constructor(_documents, _commands, _provider, _apiDeprecation, _extension) {
            this._documents = _documents;
            this._commands = _commands;
            this._provider = _provider;
            this._apiDeprecation = _apiDeprecation;
            this._extension = _extension;
            this._cache = new cache_1.Cache('CompletionItem');
            this._disposables = new Map();
        }
        async provideCompletionItems(resource, position, context, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            // The default insert/replace ranges. It's important to compute them
            // before asynchronously asking the provider for its results. See
            // https://github.com/microsoft/vscode/issues/83400#issuecomment-546851421
            const replaceRange = doc.getWordRangeAtPosition(pos) || new extHostTypes_1.Range(pos, pos);
            const insertRange = replaceRange.with({ end: pos });
            const sw = new stopwatch_1.StopWatch();
            const itemsOrList = await this._provider.provideCompletionItems(doc, pos, token, typeConvert.CompletionContext.to(context));
            if (!itemsOrList) {
                // undefined and null are valid results
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            const list = Array.isArray(itemsOrList) ? new extHostTypes_1.CompletionList(itemsOrList) : itemsOrList;
            // keep result for providers that support resolving
            const pid = CompletionsAdapter.supportsResolving(this._provider) ? this._cache.add(list.items) : this._cache.add([]);
            const disposables = new lifecycle_1.DisposableStore();
            this._disposables.set(pid, disposables);
            const completions = [];
            const result = {
                x: pid,
                ["b" /* extHostProtocol.ISuggestResultDtoField.completions */]: completions,
                ["a" /* extHostProtocol.ISuggestResultDtoField.defaultRanges */]: { replace: typeConvert.Range.from(replaceRange), insert: typeConvert.Range.from(insertRange) },
                ["c" /* extHostProtocol.ISuggestResultDtoField.isIncomplete */]: list.isIncomplete || undefined,
                ["d" /* extHostProtocol.ISuggestResultDtoField.duration */]: sw.elapsed()
            };
            for (let i = 0; i < list.items.length; i++) {
                const item = list.items[i];
                // check for bad completion item first
                const dto = this._convertCompletionItem(item, [pid, i], insertRange, replaceRange);
                completions.push(dto);
            }
            return result;
        }
        async resolveCompletionItem(id, token) {
            if (typeof this._provider.resolveCompletionItem !== 'function') {
                return undefined;
            }
            const item = this._cache.get(...id);
            if (!item) {
                return undefined;
            }
            const dto1 = this._convertCompletionItem(item, id);
            const resolvedItem = await this._provider.resolveCompletionItem(item, token);
            if (!resolvedItem) {
                return undefined;
            }
            const dto2 = this._convertCompletionItem(resolvedItem, id);
            if (dto1["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] !== dto2["h" /* extHostProtocol.ISuggestDataDtoField.insertText */]
                || dto1["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */] !== dto2["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */]) {
                this._apiDeprecation.report('CompletionItem.insertText', this._extension, 'extension MAY NOT change \'insertText\' of a CompletionItem during resolve');
            }
            if (dto1["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */] !== dto2["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */]
                || dto1["o" /* extHostProtocol.ISuggestDataDtoField.commandId */] !== dto2["o" /* extHostProtocol.ISuggestDataDtoField.commandId */]
                || !(0, objects_1.equals)(dto1["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */], dto2["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */])) {
                this._apiDeprecation.report('CompletionItem.command', this._extension, 'extension MAY NOT change \'command\' of a CompletionItem during resolve');
            }
            return {
                ...dto1,
                ["d" /* extHostProtocol.ISuggestDataDtoField.documentation */]: dto2["d" /* extHostProtocol.ISuggestDataDtoField.documentation */],
                ["c" /* extHostProtocol.ISuggestDataDtoField.detail */]: dto2["c" /* extHostProtocol.ISuggestDataDtoField.detail */],
                ["l" /* extHostProtocol.ISuggestDataDtoField.additionalTextEdits */]: dto2["l" /* extHostProtocol.ISuggestDataDtoField.additionalTextEdits */],
                // (fishy) async insertText
                ["h" /* extHostProtocol.ISuggestDataDtoField.insertText */]: dto2["h" /* extHostProtocol.ISuggestDataDtoField.insertText */],
                ["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */]: dto2["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */],
                // (fishy) async command
                ["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */]: dto2["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */],
                ["o" /* extHostProtocol.ISuggestDataDtoField.commandId */]: dto2["o" /* extHostProtocol.ISuggestDataDtoField.commandId */],
                ["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */]: dto2["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */],
            };
        }
        releaseCompletionItems(id) {
            this._disposables.get(id)?.dispose();
            this._disposables.delete(id);
            this._cache.delete(id);
        }
        _convertCompletionItem(item, id, defaultInsertRange, defaultReplaceRange) {
            const disposables = this._disposables.get(id[0]);
            if (!disposables) {
                throw Error('DisposableStore is missing...');
            }
            const command = this._commands.toInternal(item.command, disposables);
            const result = {
                //
                x: id,
                //
                ["a" /* extHostProtocol.ISuggestDataDtoField.label */]: item.label,
                ["b" /* extHostProtocol.ISuggestDataDtoField.kind */]: item.kind !== undefined ? typeConvert.CompletionItemKind.from(item.kind) : undefined,
                ["m" /* extHostProtocol.ISuggestDataDtoField.kindModifier */]: item.tags && item.tags.map(typeConvert.CompletionItemTag.from),
                ["c" /* extHostProtocol.ISuggestDataDtoField.detail */]: item.detail,
                ["d" /* extHostProtocol.ISuggestDataDtoField.documentation */]: typeof item.documentation === 'undefined' ? undefined : typeConvert.MarkdownString.fromStrict(item.documentation),
                ["e" /* extHostProtocol.ISuggestDataDtoField.sortText */]: item.sortText !== item.label ? item.sortText : undefined,
                ["f" /* extHostProtocol.ISuggestDataDtoField.filterText */]: item.filterText !== item.label ? item.filterText : undefined,
                ["g" /* extHostProtocol.ISuggestDataDtoField.preselect */]: item.preselect || undefined,
                ["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */]: item.keepWhitespace ? 1 /* languages.CompletionItemInsertTextRule.KeepWhitespace */ : 0 /* languages.CompletionItemInsertTextRule.None */,
                ["k" /* extHostProtocol.ISuggestDataDtoField.commitCharacters */]: item.commitCharacters?.join(''),
                ["l" /* extHostProtocol.ISuggestDataDtoField.additionalTextEdits */]: item.additionalTextEdits && item.additionalTextEdits.map(typeConvert.TextEdit.from),
                ["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */]: command?.$ident,
                ["o" /* extHostProtocol.ISuggestDataDtoField.commandId */]: command?.id,
                ["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */]: command?.$ident ? undefined : command?.arguments, // filled in on main side from $ident
            };
            // 'insertText'-logic
            if (item.textEdit) {
                this._apiDeprecation.report('CompletionItem.textEdit', this._extension, `Use 'CompletionItem.insertText' and 'CompletionItem.range' instead.`);
                result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.textEdit.newText;
            }
            else if (typeof item.insertText === 'string') {
                result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.insertText;
            }
            else if (item.insertText instanceof extHostTypes_1.SnippetString) {
                result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.insertText.value;
                result["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */] |= 4 /* languages.CompletionItemInsertTextRule.InsertAsSnippet */;
            }
            // 'overwrite[Before|After]'-logic
            let range;
            if (item.textEdit) {
                range = item.textEdit.range;
            }
            else if (item.range) {
                range = item.range;
            }
            if (extHostTypes_1.Range.isRange(range)) {
                // "old" range
                result["j" /* extHostProtocol.ISuggestDataDtoField.range */] = typeConvert.Range.from(range);
            }
            else if (range && (!defaultInsertRange?.isEqual(range.inserting) || !defaultReplaceRange?.isEqual(range.replacing))) {
                // ONLY send range when it's different from the default ranges (safe bandwidth)
                result["j" /* extHostProtocol.ISuggestDataDtoField.range */] = {
                    insert: typeConvert.Range.from(range.inserting),
                    replace: typeConvert.Range.from(range.replacing)
                };
            }
            return result;
        }
    }
    class InlineCompletionAdapterBase {
        async provideInlineCompletions(resource, position, context, token) {
            return undefined;
        }
        disposeCompletions(pid) { }
        handleDidShowCompletionItem(pid, idx, updatedInsertText) { }
        handlePartialAccept(pid, idx, acceptedCharacters) { }
    }
    class InlineCompletionAdapter extends InlineCompletionAdapterBase {
        constructor(_extension, _documents, _provider, _commands) {
            super();
            this._extension = _extension;
            this._documents = _documents;
            this._provider = _provider;
            this._commands = _commands;
            this._references = new ReferenceMap();
            this._isAdditionsProposedApiEnabled = (0, extensions_2.isProposedApiEnabled)(this._extension, 'inlineCompletionsAdditions');
            this.languageTriggerKindToVSCodeTriggerKind = {
                [languages.InlineCompletionTriggerKind.Automatic]: extHostTypes_1.InlineCompletionTriggerKind.Automatic,
                [languages.InlineCompletionTriggerKind.Explicit]: extHostTypes_1.InlineCompletionTriggerKind.Invoke,
            };
        }
        get supportsHandleEvents() {
            return (0, extensions_2.isProposedApiEnabled)(this._extension, 'inlineCompletionsAdditions')
                && (typeof this._provider.handleDidShowCompletionItem === 'function'
                    || typeof this._provider.handleDidPartiallyAcceptCompletionItem === 'function');
        }
        async provideInlineCompletions(resource, position, context, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const result = await this._provider.provideInlineCompletionItems(doc, pos, {
                selectedCompletionInfo: context.selectedSuggestionInfo
                    ? {
                        range: typeConvert.Range.to(context.selectedSuggestionInfo.range),
                        text: context.selectedSuggestionInfo.text
                    }
                    : undefined,
                triggerKind: this.languageTriggerKindToVSCodeTriggerKind[context.triggerKind]
            }, token);
            if (!result) {
                // undefined and null are valid results
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            const normalizedResult = Array.isArray(result) ? result : result.items;
            const commands = this._isAdditionsProposedApiEnabled ? Array.isArray(result) ? [] : result.commands || [] : [];
            const enableForwardStability = this._isAdditionsProposedApiEnabled && !Array.isArray(result) ? result.enableForwardStability : undefined;
            let disposableStore = undefined;
            const pid = this._references.createReferenceId({
                dispose() {
                    disposableStore?.dispose();
                },
                items: normalizedResult
            });
            return {
                pid,
                items: normalizedResult.map((item, idx) => {
                    let command = undefined;
                    if (item.command) {
                        if (!disposableStore) {
                            disposableStore = new lifecycle_1.DisposableStore();
                        }
                        command = this._commands.toInternal(item.command, disposableStore);
                    }
                    const insertText = item.insertText;
                    return ({
                        insertText: typeof insertText === 'string' ? insertText : { snippet: insertText.value },
                        filterText: item.filterText,
                        range: item.range ? typeConvert.Range.from(item.range) : undefined,
                        command,
                        idx: idx,
                        completeBracketPairs: this._isAdditionsProposedApiEnabled ? item.completeBracketPairs : false,
                    });
                }),
                commands: commands.map(c => {
                    if (!disposableStore) {
                        disposableStore = new lifecycle_1.DisposableStore();
                    }
                    return this._commands.toInternal(c, disposableStore);
                }),
                suppressSuggestions: false,
                enableForwardStability,
            };
        }
        disposeCompletions(pid) {
            const data = this._references.disposeReferenceId(pid);
            data?.dispose();
        }
        handleDidShowCompletionItem(pid, idx, updatedInsertText) {
            const completionItem = this._references.get(pid)?.items[idx];
            if (completionItem) {
                if (this._provider.handleDidShowCompletionItem && this._isAdditionsProposedApiEnabled) {
                    this._provider.handleDidShowCompletionItem(completionItem, updatedInsertText);
                }
            }
        }
        handlePartialAccept(pid, idx, acceptedCharacters) {
            const completionItem = this._references.get(pid)?.items[idx];
            if (completionItem) {
                if (this._provider.handleDidPartiallyAcceptCompletionItem && this._isAdditionsProposedApiEnabled) {
                    this._provider.handleDidPartiallyAcceptCompletionItem(completionItem, acceptedCharacters);
                }
            }
        }
    }
    class ReferenceMap {
        constructor() {
            this._references = new Map();
            this._idPool = 1;
        }
        createReferenceId(value) {
            const id = this._idPool++;
            this._references.set(id, value);
            return id;
        }
        disposeReferenceId(referenceId) {
            const value = this._references.get(referenceId);
            this._references.delete(referenceId);
            return value;
        }
        get(referenceId) {
            return this._references.get(referenceId);
        }
    }
    class SignatureHelpAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this._cache = new cache_1.Cache('SignatureHelp');
        }
        async provideSignatureHelp(resource, position, context, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const vscodeContext = this.reviveContext(context);
            const value = await this._provider.provideSignatureHelp(doc, pos, token, vscodeContext);
            if (value) {
                const id = this._cache.add([value]);
                return { ...typeConvert.SignatureHelp.from(value), id };
            }
            return undefined;
        }
        reviveContext(context) {
            let activeSignatureHelp = undefined;
            if (context.activeSignatureHelp) {
                const revivedSignatureHelp = typeConvert.SignatureHelp.to(context.activeSignatureHelp);
                const saved = this._cache.get(context.activeSignatureHelp.id, 0);
                if (saved) {
                    activeSignatureHelp = saved;
                    activeSignatureHelp.activeSignature = revivedSignatureHelp.activeSignature;
                    activeSignatureHelp.activeParameter = revivedSignatureHelp.activeParameter;
                }
                else {
                    activeSignatureHelp = revivedSignatureHelp;
                }
            }
            return { ...context, activeSignatureHelp };
        }
        releaseSignatureHelp(id) {
            this._cache.delete(id);
        }
    }
    class InlayHintsAdapter {
        constructor(_documents, _commands, _provider, _logService, _extension) {
            this._documents = _documents;
            this._commands = _commands;
            this._provider = _provider;
            this._logService = _logService;
            this._extension = _extension;
            this._cache = new cache_1.Cache('InlayHints');
            this._disposables = new Map();
        }
        async provideInlayHints(resource, ran, token) {
            const doc = this._documents.getDocument(resource);
            const range = typeConvert.Range.to(ran);
            const hints = await this._provider.provideInlayHints(doc, range, token);
            if (!Array.isArray(hints) || hints.length === 0) {
                // bad result
                this._logService.trace(`[InlayHints] NO inlay hints from '${this._extension.identifier.value}' for range ${JSON.stringify(ran)}`);
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            const pid = this._cache.add(hints);
            this._disposables.set(pid, new lifecycle_1.DisposableStore());
            const result = { hints: [], cacheId: pid };
            for (let i = 0; i < hints.length; i++) {
                if (this._isValidInlayHint(hints[i], range)) {
                    result.hints.push(this._convertInlayHint(hints[i], [pid, i]));
                }
            }
            this._logService.trace(`[InlayHints] ${result.hints.length} inlay hints from '${this._extension.identifier.value}' for range ${JSON.stringify(ran)}`);
            return result;
        }
        async resolveInlayHint(id, token) {
            if (typeof this._provider.resolveInlayHint !== 'function') {
                return undefined;
            }
            const item = this._cache.get(...id);
            if (!item) {
                return undefined;
            }
            const hint = await this._provider.resolveInlayHint(item, token);
            if (!hint) {
                return undefined;
            }
            if (!this._isValidInlayHint(hint)) {
                return undefined;
            }
            return this._convertInlayHint(hint, id);
        }
        releaseHints(id) {
            this._disposables.get(id)?.dispose();
            this._disposables.delete(id);
            this._cache.delete(id);
        }
        _isValidInlayHint(hint, range) {
            if (hint.label.length === 0 || Array.isArray(hint.label) && hint.label.every(part => part.value.length === 0)) {
                console.log('INVALID inlay hint, empty label', hint);
                return false;
            }
            if (range && !range.contains(hint.position)) {
                // console.log('INVALID inlay hint, position outside range', range, hint);
                return false;
            }
            return true;
        }
        _convertInlayHint(hint, id) {
            const disposables = this._disposables.get(id[0]);
            if (!disposables) {
                throw Error('DisposableStore is missing...');
            }
            const result = {
                label: '', // fill-in below
                cacheId: id,
                tooltip: typeConvert.MarkdownString.fromStrict(hint.tooltip),
                position: typeConvert.Position.from(hint.position),
                textEdits: hint.textEdits && hint.textEdits.map(typeConvert.TextEdit.from),
                kind: hint.kind && typeConvert.InlayHintKind.from(hint.kind),
                paddingLeft: hint.paddingLeft,
                paddingRight: hint.paddingRight,
            };
            if (typeof hint.label === 'string') {
                result.label = hint.label;
            }
            else {
                const parts = [];
                result.label = parts;
                for (const part of hint.label) {
                    if (!part.value) {
                        console.warn('INVALID inlay hint, empty label part', this._extension.identifier.value);
                        continue;
                    }
                    const part2 = {
                        label: part.value,
                        tooltip: typeConvert.MarkdownString.fromStrict(part.tooltip)
                    };
                    if (extHostTypes_1.Location.isLocation(part.location)) {
                        part2.location = typeConvert.location.from(part.location);
                    }
                    if (part.command) {
                        part2.command = this._commands.toInternal(part.command, disposables);
                    }
                    parts.push(part2);
                }
            }
            return result;
        }
    }
    class LinkProviderAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this._cache = new cache_1.Cache('DocumentLink');
        }
        async provideLinks(resource, token) {
            const doc = this._documents.getDocument(resource);
            const links = await this._provider.provideDocumentLinks(doc, token);
            if (!Array.isArray(links) || links.length === 0) {
                // bad result
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            if (typeof this._provider.resolveDocumentLink !== 'function') {
                // no resolve -> no caching
                return { links: links.filter(LinkProviderAdapter._validateLink).map(typeConvert.DocumentLink.from) };
            }
            else {
                // cache links for future resolving
                const pid = this._cache.add(links);
                const result = { links: [], cacheId: pid };
                for (let i = 0; i < links.length; i++) {
                    if (!LinkProviderAdapter._validateLink(links[i])) {
                        continue;
                    }
                    const dto = typeConvert.DocumentLink.from(links[i]);
                    dto.cacheId = [pid, i];
                    result.links.push(dto);
                }
                return result;
            }
        }
        static _validateLink(link) {
            if (link.target && link.target.path.length > 50000) {
                console.warn('DROPPING link because it is too long');
                return false;
            }
            return true;
        }
        async resolveLink(id, token) {
            if (typeof this._provider.resolveDocumentLink !== 'function') {
                return undefined;
            }
            const item = this._cache.get(...id);
            if (!item) {
                return undefined;
            }
            const link = await this._provider.resolveDocumentLink(item, token);
            if (!link || !LinkProviderAdapter._validateLink(link)) {
                return undefined;
            }
            return typeConvert.DocumentLink.from(link);
        }
        releaseLinks(id) {
            this._cache.delete(id);
        }
    }
    class ColorProviderAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideColors(resource, token) {
            const doc = this._documents.getDocument(resource);
            const colors = await this._provider.provideDocumentColors(doc, token);
            if (!Array.isArray(colors)) {
                return [];
            }
            const colorInfos = colors.map(ci => {
                return {
                    color: typeConvert.Color.from(ci.color),
                    range: typeConvert.Range.from(ci.range)
                };
            });
            return colorInfos;
        }
        async provideColorPresentations(resource, raw, token) {
            const document = this._documents.getDocument(resource);
            const range = typeConvert.Range.to(raw.range);
            const color = typeConvert.Color.to(raw.color);
            const value = await this._provider.provideColorPresentations(color, { document, range }, token);
            if (!Array.isArray(value)) {
                return undefined;
            }
            return value.map(typeConvert.ColorPresentation.from);
        }
    }
    class FoldingProviderAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideFoldingRanges(resource, context, token) {
            const doc = this._documents.getDocument(resource);
            const ranges = await this._provider.provideFoldingRanges(doc, context, token);
            if (!Array.isArray(ranges)) {
                return undefined;
            }
            return ranges.map(typeConvert.FoldingRange.from);
        }
    }
    class SelectionRangeAdapter {
        constructor(_documents, _provider, _logService) {
            this._documents = _documents;
            this._provider = _provider;
            this._logService = _logService;
        }
        async provideSelectionRanges(resource, pos, token) {
            const document = this._documents.getDocument(resource);
            const positions = pos.map(typeConvert.Position.to);
            const allProviderRanges = await this._provider.provideSelectionRanges(document, positions, token);
            if (!(0, arrays_1.isNonEmptyArray)(allProviderRanges)) {
                return [];
            }
            if (allProviderRanges.length !== positions.length) {
                this._logService.warn('BAD selection ranges, provider must return ranges for each position');
                return [];
            }
            const allResults = [];
            for (let i = 0; i < positions.length; i++) {
                const oneResult = [];
                allResults.push(oneResult);
                let last = positions[i];
                let selectionRange = allProviderRanges[i];
                while (true) {
                    if (!selectionRange.range.contains(last)) {
                        throw new Error('INVALID selection range, must contain the previous range');
                    }
                    oneResult.push(typeConvert.SelectionRange.from(selectionRange));
                    if (!selectionRange.parent) {
                        break;
                    }
                    last = selectionRange.range;
                    selectionRange = selectionRange.parent;
                }
            }
            return allResults;
        }
    }
    class CallHierarchyAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this._idPool = new idGenerator_1.IdGenerator('');
            this._cache = new Map();
        }
        async prepareSession(uri, position, token) {
            const doc = this._documents.getDocument(uri);
            const pos = typeConvert.Position.to(position);
            const items = await this._provider.prepareCallHierarchy(doc, pos, token);
            if (!items) {
                return undefined;
            }
            const sessionId = this._idPool.nextId();
            this._cache.set(sessionId, new Map());
            if (Array.isArray(items)) {
                return items.map(item => this._cacheAndConvertItem(sessionId, item));
            }
            else {
                return [this._cacheAndConvertItem(sessionId, items)];
            }
        }
        async provideCallsTo(sessionId, itemId, token) {
            const item = this._itemFromCache(sessionId, itemId);
            if (!item) {
                throw new Error('missing call hierarchy item');
            }
            const calls = await this._provider.provideCallHierarchyIncomingCalls(item, token);
            if (!calls) {
                return undefined;
            }
            return calls.map(call => {
                return {
                    from: this._cacheAndConvertItem(sessionId, call.from),
                    fromRanges: call.fromRanges.map(r => typeConvert.Range.from(r))
                };
            });
        }
        async provideCallsFrom(sessionId, itemId, token) {
            const item = this._itemFromCache(sessionId, itemId);
            if (!item) {
                throw new Error('missing call hierarchy item');
            }
            const calls = await this._provider.provideCallHierarchyOutgoingCalls(item, token);
            if (!calls) {
                return undefined;
            }
            return calls.map(call => {
                return {
                    to: this._cacheAndConvertItem(sessionId, call.to),
                    fromRanges: call.fromRanges.map(r => typeConvert.Range.from(r))
                };
            });
        }
        releaseSession(sessionId) {
            this._cache.delete(sessionId);
        }
        _cacheAndConvertItem(sessionId, item) {
            const map = this._cache.get(sessionId);
            const dto = typeConvert.CallHierarchyItem.from(item, sessionId, map.size.toString(36));
            map.set(dto._itemId, item);
            return dto;
        }
        _itemFromCache(sessionId, itemId) {
            const map = this._cache.get(sessionId);
            return map?.get(itemId);
        }
    }
    class TypeHierarchyAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this._idPool = new idGenerator_1.IdGenerator('');
            this._cache = new Map();
        }
        async prepareSession(uri, position, token) {
            const doc = this._documents.getDocument(uri);
            const pos = typeConvert.Position.to(position);
            const items = await this._provider.prepareTypeHierarchy(doc, pos, token);
            if (!items) {
                return undefined;
            }
            const sessionId = this._idPool.nextId();
            this._cache.set(sessionId, new Map());
            if (Array.isArray(items)) {
                return items.map(item => this._cacheAndConvertItem(sessionId, item));
            }
            else {
                return [this._cacheAndConvertItem(sessionId, items)];
            }
        }
        async provideSupertypes(sessionId, itemId, token) {
            const item = this._itemFromCache(sessionId, itemId);
            if (!item) {
                throw new Error('missing type hierarchy item');
            }
            const supertypes = await this._provider.provideTypeHierarchySupertypes(item, token);
            if (!supertypes) {
                return undefined;
            }
            return supertypes.map(supertype => {
                return this._cacheAndConvertItem(sessionId, supertype);
            });
        }
        async provideSubtypes(sessionId, itemId, token) {
            const item = this._itemFromCache(sessionId, itemId);
            if (!item) {
                throw new Error('missing type hierarchy item');
            }
            const subtypes = await this._provider.provideTypeHierarchySubtypes(item, token);
            if (!subtypes) {
                return undefined;
            }
            return subtypes.map(subtype => {
                return this._cacheAndConvertItem(sessionId, subtype);
            });
        }
        releaseSession(sessionId) {
            this._cache.delete(sessionId);
        }
        _cacheAndConvertItem(sessionId, item) {
            const map = this._cache.get(sessionId);
            const dto = typeConvert.TypeHierarchyItem.from(item, sessionId, map.size.toString(36));
            map.set(dto._itemId, item);
            return dto;
        }
        _itemFromCache(sessionId, itemId) {
            const map = this._cache.get(sessionId);
            return map?.get(itemId);
        }
    }
    class DocumentOnDropEditAdapter {
        static toInternalProviderId(extId, editId) {
            return extId + '.' + editId;
        }
        constructor(_proxy, _documents, _provider, _handle, _extension) {
            this._proxy = _proxy;
            this._documents = _documents;
            this._provider = _provider;
            this._handle = _handle;
            this._extension = _extension;
        }
        async provideDocumentOnDropEdits(requestId, uri, position, dataTransferDto, token) {
            const doc = this._documents.getDocument(uri);
            const pos = typeConvert.Position.to(position);
            const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, async (id) => {
                return (await this._proxy.$resolveDocumentOnDropFileData(this._handle, requestId, id)).buffer;
            });
            const edit = await this._provider.provideDocumentDropEdits(doc, pos, dataTransfer, token);
            if (!edit) {
                return undefined;
            }
            return {
                label: edit.label ?? (0, nls_1.localize)('defaultDropLabel', "Drop using '{0}' extension", this._extension.displayName || this._extension.name),
                yieldTo: edit.yieldTo?.map(yTo => {
                    return 'mimeType' in yTo ? yTo : { providerId: DocumentOnDropEditAdapter.toInternalProviderId(yTo.extensionId, yTo.providerId) };
                }),
                insertText: typeof edit.insertText === 'string' ? edit.insertText : { snippet: edit.insertText.value },
                additionalEdit: edit.additionalEdit ? typeConvert.WorkspaceEdit.from(edit.additionalEdit, undefined) : undefined,
            };
        }
    }
    class MappedEditsAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideMappedEdits(resource, codeBlocks, context, token) {
            const uri = uri_1.URI.revive(resource);
            const doc = this._documents.getDocument(uri);
            const usedContext = context.documents.map((docSubArray) => docSubArray.map((r) => {
                return {
                    uri: uri_1.URI.revive(r.uri),
                    version: r.version,
                    ranges: r.ranges.map((range) => typeConvert.Range.to(range)),
                };
            }));
            const ctx = {
                documents: usedContext,
                selections: usedContext[0]?.[0]?.ranges ?? [] // @ulugbekna: this is a hack for backward compatibility
            };
            const mappedEdits = await this._provider.provideMappedEdits(doc, codeBlocks, ctx, token);
            return mappedEdits ? typeConvert.WorkspaceEdit.from(mappedEdits) : null;
        }
    }
    class AdapterData {
        constructor(adapter, extension) {
            this.adapter = adapter;
            this.extension = extension;
        }
    }
    class ExtHostLanguageFeatures {
        static { this._handlePool = 0; }
        constructor(mainContext, _uriTransformer, _documents, _commands, _diagnostics, _logService, _apiDeprecation, _extensionTelemetry) {
            this._uriTransformer = _uriTransformer;
            this._documents = _documents;
            this._commands = _commands;
            this._diagnostics = _diagnostics;
            this._logService = _logService;
            this._apiDeprecation = _apiDeprecation;
            this._extensionTelemetry = _extensionTelemetry;
            this._adapter = new Map();
            this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadLanguageFeatures);
        }
        _transformDocumentSelector(selector, extension) {
            return typeConvert.DocumentSelector.from(selector, this._uriTransformer, extension);
        }
        _createDisposable(handle) {
            return new extHostTypes_1.Disposable(() => {
                this._adapter.delete(handle);
                this._proxy.$unregister(handle);
            });
        }
        _nextHandle() {
            return ExtHostLanguageFeatures._handlePool++;
        }
        async _withAdapter(handle, ctor, callback, fallbackValue, tokenToRaceAgainst, doNotLog = false) {
            const data = this._adapter.get(handle);
            if (!data || !(data.adapter instanceof ctor)) {
                return fallbackValue;
            }
            const t1 = Date.now();
            if (!doNotLog) {
                this._logService.trace(`[${data.extension.identifier.value}] INVOKE provider '${callback.toString().replace(/[\r\n]/g, '')}'`);
            }
            const result = callback(data.adapter, data.extension);
            // logging,tracing
            Promise.resolve(result).catch(err => {
                if (!(0, errors_1.isCancellationError)(err)) {
                    this._logService.error(`[${data.extension.identifier.value}] provider FAILED`);
                    this._logService.error(err);
                    this._extensionTelemetry.onExtensionError(data.extension.identifier, err);
                }
            }).finally(() => {
                if (!doNotLog) {
                    this._logService.trace(`[${data.extension.identifier.value}] provider DONE after ${Date.now() - t1}ms`);
                }
            });
            if (cancellation_1.CancellationToken.isCancellationToken(tokenToRaceAgainst)) {
                return (0, async_1.raceCancellationError)(result, tokenToRaceAgainst);
            }
            return result;
        }
        _addNewAdapter(adapter, extension) {
            const handle = this._nextHandle();
            this._adapter.set(handle, new AdapterData(adapter, extension));
            return handle;
        }
        static _extLabel(ext) {
            return ext.displayName || ext.name;
        }
        // --- outline
        registerDocumentSymbolProvider(extension, selector, provider, metadata) {
            const handle = this._addNewAdapter(new DocumentSymbolAdapter(this._documents, provider), extension);
            const displayName = (metadata && metadata.label) || ExtHostLanguageFeatures._extLabel(extension);
            this._proxy.$registerDocumentSymbolProvider(handle, this._transformDocumentSelector(selector, extension), displayName);
            return this._createDisposable(handle);
        }
        $provideDocumentSymbols(handle, resource, token) {
            return this._withAdapter(handle, DocumentSymbolAdapter, adapter => adapter.provideDocumentSymbols(uri_1.URI.revive(resource), token), undefined, token);
        }
        // --- code lens
        registerCodeLensProvider(extension, selector, provider) {
            const handle = this._nextHandle();
            const eventHandle = typeof provider.onDidChangeCodeLenses === 'function' ? this._nextHandle() : undefined;
            this._adapter.set(handle, new AdapterData(new CodeLensAdapter(this._documents, this._commands.converter, provider, extension, this._extensionTelemetry, this._logService), extension));
            this._proxy.$registerCodeLensSupport(handle, this._transformDocumentSelector(selector, extension), eventHandle);
            let result = this._createDisposable(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeCodeLenses(_ => this._proxy.$emitCodeLensEvent(eventHandle));
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        }
        $provideCodeLenses(handle, resource, token) {
            return this._withAdapter(handle, CodeLensAdapter, adapter => adapter.provideCodeLenses(uri_1.URI.revive(resource), token), undefined, token);
        }
        $resolveCodeLens(handle, symbol, token) {
            return this._withAdapter(handle, CodeLensAdapter, adapter => adapter.resolveCodeLens(symbol, token), undefined, undefined);
        }
        $releaseCodeLenses(handle, cacheId) {
            this._withAdapter(handle, CodeLensAdapter, adapter => Promise.resolve(adapter.releaseCodeLenses(cacheId)), undefined, undefined);
        }
        // --- declaration
        registerDefinitionProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new DefinitionAdapter(this._documents, provider), extension);
            this._proxy.$registerDefinitionSupport(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideDefinition(handle, resource, position, token) {
            return this._withAdapter(handle, DefinitionAdapter, adapter => adapter.provideDefinition(uri_1.URI.revive(resource), position, token), [], token);
        }
        registerDeclarationProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new DeclarationAdapter(this._documents, provider), extension);
            this._proxy.$registerDeclarationSupport(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideDeclaration(handle, resource, position, token) {
            return this._withAdapter(handle, DeclarationAdapter, adapter => adapter.provideDeclaration(uri_1.URI.revive(resource), position, token), [], token);
        }
        registerImplementationProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new ImplementationAdapter(this._documents, provider), extension);
            this._proxy.$registerImplementationSupport(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideImplementation(handle, resource, position, token) {
            return this._withAdapter(handle, ImplementationAdapter, adapter => adapter.provideImplementation(uri_1.URI.revive(resource), position, token), [], token);
        }
        registerTypeDefinitionProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new TypeDefinitionAdapter(this._documents, provider), extension);
            this._proxy.$registerTypeDefinitionSupport(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideTypeDefinition(handle, resource, position, token) {
            return this._withAdapter(handle, TypeDefinitionAdapter, adapter => adapter.provideTypeDefinition(uri_1.URI.revive(resource), position, token), [], token);
        }
        // --- extra info
        registerHoverProvider(extension, selector, provider, extensionId) {
            const handle = this._addNewAdapter(new HoverAdapter(this._documents, provider), extension);
            this._proxy.$registerHoverProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideHover(handle, resource, position, token) {
            return this._withAdapter(handle, HoverAdapter, adapter => adapter.provideHover(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        // --- debug hover
        registerEvaluatableExpressionProvider(extension, selector, provider, extensionId) {
            const handle = this._addNewAdapter(new EvaluatableExpressionAdapter(this._documents, provider), extension);
            this._proxy.$registerEvaluatableExpressionProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideEvaluatableExpression(handle, resource, position, token) {
            return this._withAdapter(handle, EvaluatableExpressionAdapter, adapter => adapter.provideEvaluatableExpression(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        // --- debug inline values
        registerInlineValuesProvider(extension, selector, provider, extensionId) {
            const eventHandle = typeof provider.onDidChangeInlineValues === 'function' ? this._nextHandle() : undefined;
            const handle = this._addNewAdapter(new InlineValuesAdapter(this._documents, provider), extension);
            this._proxy.$registerInlineValuesProvider(handle, this._transformDocumentSelector(selector, extension), eventHandle);
            let result = this._createDisposable(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeInlineValues(_ => this._proxy.$emitInlineValuesEvent(eventHandle));
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        }
        $provideInlineValues(handle, resource, range, context, token) {
            return this._withAdapter(handle, InlineValuesAdapter, adapter => adapter.provideInlineValues(uri_1.URI.revive(resource), range, context, token), undefined, token);
        }
        // --- occurrences
        registerDocumentHighlightProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new DocumentHighlightAdapter(this._documents, provider), extension);
            this._proxy.$registerDocumentHighlightProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        registerMultiDocumentHighlightProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new MultiDocumentHighlightAdapter(this._documents, provider), extension);
            this._proxy.$registerMultiDocumentHighlightProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideDocumentHighlights(handle, resource, position, token) {
            return this._withAdapter(handle, DocumentHighlightAdapter, adapter => adapter.provideDocumentHighlights(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        $provideMultiDocumentHighlights(handle, resource, position, otherModels, token) {
            return this._withAdapter(handle, MultiDocumentHighlightAdapter, adapter => adapter.provideMultiDocumentHighlights(uri_1.URI.revive(resource), position, otherModels.map(model => uri_1.URI.revive(model)), token), undefined, token);
        }
        // --- linked editing
        registerLinkedEditingRangeProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new LinkedEditingRangeAdapter(this._documents, provider), extension);
            this._proxy.$registerLinkedEditingRangeProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideLinkedEditingRanges(handle, resource, position, token) {
            return this._withAdapter(handle, LinkedEditingRangeAdapter, async (adapter) => {
                const res = await adapter.provideLinkedEditingRanges(uri_1.URI.revive(resource), position, token);
                if (res) {
                    return {
                        ranges: res.ranges,
                        wordPattern: res.wordPattern ? ExtHostLanguageFeatures._serializeRegExp(res.wordPattern) : undefined
                    };
                }
                return undefined;
            }, undefined, token);
        }
        // --- references
        registerReferenceProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new ReferenceAdapter(this._documents, provider), extension);
            this._proxy.$registerReferenceSupport(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideReferences(handle, resource, position, context, token) {
            return this._withAdapter(handle, ReferenceAdapter, adapter => adapter.provideReferences(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        // --- quick fix
        registerCodeActionProvider(extension, selector, provider, metadata) {
            const store = new lifecycle_1.DisposableStore();
            const handle = this._addNewAdapter(new CodeActionAdapter(this._documents, this._commands.converter, this._diagnostics, provider, this._logService, extension, this._apiDeprecation), extension);
            this._proxy.$registerQuickFixSupport(handle, this._transformDocumentSelector(selector, extension), {
                providedKinds: metadata?.providedCodeActionKinds?.map(kind => kind.value),
                documentation: metadata?.documentation?.map(x => ({
                    kind: x.kind.value,
                    command: this._commands.converter.toInternal(x.command, store),
                }))
            }, ExtHostLanguageFeatures._extLabel(extension), Boolean(provider.resolveCodeAction));
            store.add(this._createDisposable(handle));
            return store;
        }
        $provideCodeActions(handle, resource, rangeOrSelection, context, token) {
            return this._withAdapter(handle, CodeActionAdapter, adapter => adapter.provideCodeActions(uri_1.URI.revive(resource), rangeOrSelection, context, token), undefined, token);
        }
        $resolveCodeAction(handle, id, token) {
            return this._withAdapter(handle, CodeActionAdapter, adapter => adapter.resolveCodeAction(id, token), {}, undefined);
        }
        $releaseCodeActions(handle, cacheId) {
            this._withAdapter(handle, CodeActionAdapter, adapter => Promise.resolve(adapter.releaseCodeActions(cacheId)), undefined, undefined);
        }
        // --- formatting
        registerDocumentFormattingEditProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new DocumentFormattingAdapter(this._documents, provider), extension);
            this._proxy.$registerDocumentFormattingSupport(handle, this._transformDocumentSelector(selector, extension), extension.identifier, extension.displayName || extension.name);
            return this._createDisposable(handle);
        }
        $provideDocumentFormattingEdits(handle, resource, options, token) {
            return this._withAdapter(handle, DocumentFormattingAdapter, adapter => adapter.provideDocumentFormattingEdits(uri_1.URI.revive(resource), options, token), undefined, token);
        }
        registerDocumentRangeFormattingEditProvider(extension, selector, provider) {
            const canFormatMultipleRanges = typeof provider.provideDocumentRangesFormattingEdits === 'function';
            const handle = this._addNewAdapter(new RangeFormattingAdapter(this._documents, provider), extension);
            this._proxy.$registerRangeFormattingSupport(handle, this._transformDocumentSelector(selector, extension), extension.identifier, extension.displayName || extension.name, canFormatMultipleRanges);
            return this._createDisposable(handle);
        }
        $provideDocumentRangeFormattingEdits(handle, resource, range, options, token) {
            return this._withAdapter(handle, RangeFormattingAdapter, adapter => adapter.provideDocumentRangeFormattingEdits(uri_1.URI.revive(resource), range, options, token), undefined, token);
        }
        $provideDocumentRangesFormattingEdits(handle, resource, ranges, options, token) {
            return this._withAdapter(handle, RangeFormattingAdapter, adapter => adapter.provideDocumentRangesFormattingEdits(uri_1.URI.revive(resource), ranges, options, token), undefined, token);
        }
        registerOnTypeFormattingEditProvider(extension, selector, provider, triggerCharacters) {
            const handle = this._addNewAdapter(new OnTypeFormattingAdapter(this._documents, provider), extension);
            this._proxy.$registerOnTypeFormattingSupport(handle, this._transformDocumentSelector(selector, extension), triggerCharacters, extension.identifier);
            return this._createDisposable(handle);
        }
        $provideOnTypeFormattingEdits(handle, resource, position, ch, options, token) {
            return this._withAdapter(handle, OnTypeFormattingAdapter, adapter => adapter.provideOnTypeFormattingEdits(uri_1.URI.revive(resource), position, ch, options, token), undefined, token);
        }
        // --- navigate types
        registerWorkspaceSymbolProvider(extension, provider) {
            const handle = this._addNewAdapter(new NavigateTypeAdapter(provider, this._logService), extension);
            this._proxy.$registerNavigateTypeSupport(handle, typeof provider.resolveWorkspaceSymbol === 'function');
            return this._createDisposable(handle);
        }
        $provideWorkspaceSymbols(handle, search, token) {
            return this._withAdapter(handle, NavigateTypeAdapter, adapter => adapter.provideWorkspaceSymbols(search, token), { symbols: [] }, token);
        }
        $resolveWorkspaceSymbol(handle, symbol, token) {
            return this._withAdapter(handle, NavigateTypeAdapter, adapter => adapter.resolveWorkspaceSymbol(symbol, token), undefined, undefined);
        }
        $releaseWorkspaceSymbols(handle, id) {
            this._withAdapter(handle, NavigateTypeAdapter, adapter => adapter.releaseWorkspaceSymbols(id), undefined, undefined);
        }
        // --- rename
        registerRenameProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new RenameAdapter(this._documents, provider, this._logService), extension);
            this._proxy.$registerRenameSupport(handle, this._transformDocumentSelector(selector, extension), RenameAdapter.supportsResolving(provider));
            return this._createDisposable(handle);
        }
        $provideRenameEdits(handle, resource, position, newName, token) {
            return this._withAdapter(handle, RenameAdapter, adapter => adapter.provideRenameEdits(uri_1.URI.revive(resource), position, newName, token), undefined, token);
        }
        $resolveRenameLocation(handle, resource, position, token) {
            return this._withAdapter(handle, RenameAdapter, adapter => adapter.resolveRenameLocation(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        //#region semantic coloring
        registerDocumentSemanticTokensProvider(extension, selector, provider, legend) {
            const handle = this._addNewAdapter(new DocumentSemanticTokensAdapter(this._documents, provider), extension);
            const eventHandle = (typeof provider.onDidChangeSemanticTokens === 'function' ? this._nextHandle() : undefined);
            this._proxy.$registerDocumentSemanticTokensProvider(handle, this._transformDocumentSelector(selector, extension), legend, eventHandle);
            let result = this._createDisposable(handle);
            if (eventHandle) {
                const subscription = provider.onDidChangeSemanticTokens(_ => this._proxy.$emitDocumentSemanticTokensEvent(eventHandle));
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        }
        $provideDocumentSemanticTokens(handle, resource, previousResultId, token) {
            return this._withAdapter(handle, DocumentSemanticTokensAdapter, adapter => adapter.provideDocumentSemanticTokens(uri_1.URI.revive(resource), previousResultId, token), null, token);
        }
        $releaseDocumentSemanticTokens(handle, semanticColoringResultId) {
            this._withAdapter(handle, DocumentSemanticTokensAdapter, adapter => adapter.releaseDocumentSemanticColoring(semanticColoringResultId), undefined, undefined);
        }
        registerDocumentRangeSemanticTokensProvider(extension, selector, provider, legend) {
            const handle = this._addNewAdapter(new DocumentRangeSemanticTokensAdapter(this._documents, provider), extension);
            this._proxy.$registerDocumentRangeSemanticTokensProvider(handle, this._transformDocumentSelector(selector, extension), legend);
            return this._createDisposable(handle);
        }
        $provideDocumentRangeSemanticTokens(handle, resource, range, token) {
            return this._withAdapter(handle, DocumentRangeSemanticTokensAdapter, adapter => adapter.provideDocumentRangeSemanticTokens(uri_1.URI.revive(resource), range, token), null, token);
        }
        //#endregion
        // --- suggestion
        registerCompletionItemProvider(extension, selector, provider, triggerCharacters) {
            const handle = this._addNewAdapter(new CompletionsAdapter(this._documents, this._commands.converter, provider, this._apiDeprecation, extension), extension);
            this._proxy.$registerCompletionsProvider(handle, this._transformDocumentSelector(selector, extension), triggerCharacters, CompletionsAdapter.supportsResolving(provider), extension.identifier);
            return this._createDisposable(handle);
        }
        $provideCompletionItems(handle, resource, position, context, token) {
            return this._withAdapter(handle, CompletionsAdapter, adapter => adapter.provideCompletionItems(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        $resolveCompletionItem(handle, id, token) {
            return this._withAdapter(handle, CompletionsAdapter, adapter => adapter.resolveCompletionItem(id, token), undefined, token);
        }
        $releaseCompletionItems(handle, id) {
            this._withAdapter(handle, CompletionsAdapter, adapter => adapter.releaseCompletionItems(id), undefined, undefined);
        }
        // --- ghost test
        registerInlineCompletionsProvider(extension, selector, provider, metadata) {
            const adapter = new InlineCompletionAdapter(extension, this._documents, provider, this._commands.converter);
            const handle = this._addNewAdapter(adapter, extension);
            this._proxy.$registerInlineCompletionsSupport(handle, this._transformDocumentSelector(selector, extension), adapter.supportsHandleEvents, extensions_1.ExtensionIdentifier.toKey(extension.identifier.value), metadata?.yieldTo?.map(extId => extensions_1.ExtensionIdentifier.toKey(extId)) || []);
            return this._createDisposable(handle);
        }
        $provideInlineCompletions(handle, resource, position, context, token) {
            return this._withAdapter(handle, InlineCompletionAdapterBase, adapter => adapter.provideInlineCompletions(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        $handleInlineCompletionDidShow(handle, pid, idx, updatedInsertText) {
            this._withAdapter(handle, InlineCompletionAdapterBase, async (adapter) => {
                adapter.handleDidShowCompletionItem(pid, idx, updatedInsertText);
            }, undefined, undefined);
        }
        $handleInlineCompletionPartialAccept(handle, pid, idx, acceptedCharacters) {
            this._withAdapter(handle, InlineCompletionAdapterBase, async (adapter) => {
                adapter.handlePartialAccept(pid, idx, acceptedCharacters);
            }, undefined, undefined);
        }
        $freeInlineCompletionsList(handle, pid) {
            this._withAdapter(handle, InlineCompletionAdapterBase, async (adapter) => { adapter.disposeCompletions(pid); }, undefined, undefined);
        }
        // --- parameter hints
        registerSignatureHelpProvider(extension, selector, provider, metadataOrTriggerChars) {
            const metadata = Array.isArray(metadataOrTriggerChars)
                ? { triggerCharacters: metadataOrTriggerChars, retriggerCharacters: [] }
                : metadataOrTriggerChars;
            const handle = this._addNewAdapter(new SignatureHelpAdapter(this._documents, provider), extension);
            this._proxy.$registerSignatureHelpProvider(handle, this._transformDocumentSelector(selector, extension), metadata);
            return this._createDisposable(handle);
        }
        $provideSignatureHelp(handle, resource, position, context, token) {
            return this._withAdapter(handle, SignatureHelpAdapter, adapter => adapter.provideSignatureHelp(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        $releaseSignatureHelp(handle, id) {
            this._withAdapter(handle, SignatureHelpAdapter, adapter => adapter.releaseSignatureHelp(id), undefined, undefined);
        }
        // --- inline hints
        registerInlayHintsProvider(extension, selector, provider) {
            const eventHandle = typeof provider.onDidChangeInlayHints === 'function' ? this._nextHandle() : undefined;
            const handle = this._addNewAdapter(new InlayHintsAdapter(this._documents, this._commands.converter, provider, this._logService, extension), extension);
            this._proxy.$registerInlayHintsProvider(handle, this._transformDocumentSelector(selector, extension), typeof provider.resolveInlayHint === 'function', eventHandle, ExtHostLanguageFeatures._extLabel(extension));
            let result = this._createDisposable(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeInlayHints(uri => this._proxy.$emitInlayHintsEvent(eventHandle));
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        }
        $provideInlayHints(handle, resource, range, token) {
            return this._withAdapter(handle, InlayHintsAdapter, adapter => adapter.provideInlayHints(uri_1.URI.revive(resource), range, token), undefined, token);
        }
        $resolveInlayHint(handle, id, token) {
            return this._withAdapter(handle, InlayHintsAdapter, adapter => adapter.resolveInlayHint(id, token), undefined, token);
        }
        $releaseInlayHints(handle, id) {
            this._withAdapter(handle, InlayHintsAdapter, adapter => adapter.releaseHints(id), undefined, undefined);
        }
        // --- links
        registerDocumentLinkProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new LinkProviderAdapter(this._documents, provider), extension);
            this._proxy.$registerDocumentLinkProvider(handle, this._transformDocumentSelector(selector, extension), typeof provider.resolveDocumentLink === 'function');
            return this._createDisposable(handle);
        }
        $provideDocumentLinks(handle, resource, token) {
            return this._withAdapter(handle, LinkProviderAdapter, adapter => adapter.provideLinks(uri_1.URI.revive(resource), token), undefined, token, resource.scheme === 'output');
        }
        $resolveDocumentLink(handle, id, token) {
            return this._withAdapter(handle, LinkProviderAdapter, adapter => adapter.resolveLink(id, token), undefined, undefined, true);
        }
        $releaseDocumentLinks(handle, id) {
            this._withAdapter(handle, LinkProviderAdapter, adapter => adapter.releaseLinks(id), undefined, undefined, true);
        }
        registerColorProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new ColorProviderAdapter(this._documents, provider), extension);
            this._proxy.$registerDocumentColorProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideDocumentColors(handle, resource, token) {
            return this._withAdapter(handle, ColorProviderAdapter, adapter => adapter.provideColors(uri_1.URI.revive(resource), token), [], token);
        }
        $provideColorPresentations(handle, resource, colorInfo, token) {
            return this._withAdapter(handle, ColorProviderAdapter, adapter => adapter.provideColorPresentations(uri_1.URI.revive(resource), colorInfo, token), undefined, token);
        }
        registerFoldingRangeProvider(extension, selector, provider) {
            const handle = this._nextHandle();
            const eventHandle = typeof provider.onDidChangeFoldingRanges === 'function' ? this._nextHandle() : undefined;
            this._adapter.set(handle, new AdapterData(new FoldingProviderAdapter(this._documents, provider), extension));
            this._proxy.$registerFoldingRangeProvider(handle, this._transformDocumentSelector(selector, extension), extension.identifier, eventHandle);
            let result = this._createDisposable(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeFoldingRanges(() => this._proxy.$emitFoldingRangeEvent(eventHandle));
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        }
        $provideFoldingRanges(handle, resource, context, token) {
            return this._withAdapter(handle, FoldingProviderAdapter, (adapter) => adapter.provideFoldingRanges(uri_1.URI.revive(resource), context, token), undefined, token);
        }
        // --- smart select
        registerSelectionRangeProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new SelectionRangeAdapter(this._documents, provider, this._logService), extension);
            this._proxy.$registerSelectionRangeProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideSelectionRanges(handle, resource, positions, token) {
            return this._withAdapter(handle, SelectionRangeAdapter, adapter => adapter.provideSelectionRanges(uri_1.URI.revive(resource), positions, token), [], token);
        }
        // --- call hierarchy
        registerCallHierarchyProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new CallHierarchyAdapter(this._documents, provider), extension);
            this._proxy.$registerCallHierarchyProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $prepareCallHierarchy(handle, resource, position, token) {
            return this._withAdapter(handle, CallHierarchyAdapter, adapter => Promise.resolve(adapter.prepareSession(uri_1.URI.revive(resource), position, token)), undefined, token);
        }
        $provideCallHierarchyIncomingCalls(handle, sessionId, itemId, token) {
            return this._withAdapter(handle, CallHierarchyAdapter, adapter => adapter.provideCallsTo(sessionId, itemId, token), undefined, token);
        }
        $provideCallHierarchyOutgoingCalls(handle, sessionId, itemId, token) {
            return this._withAdapter(handle, CallHierarchyAdapter, adapter => adapter.provideCallsFrom(sessionId, itemId, token), undefined, token);
        }
        $releaseCallHierarchy(handle, sessionId) {
            this._withAdapter(handle, CallHierarchyAdapter, adapter => Promise.resolve(adapter.releaseSession(sessionId)), undefined, undefined);
        }
        // --- type hierarchy
        registerTypeHierarchyProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new TypeHierarchyAdapter(this._documents, provider), extension);
            this._proxy.$registerTypeHierarchyProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $prepareTypeHierarchy(handle, resource, position, token) {
            return this._withAdapter(handle, TypeHierarchyAdapter, adapter => Promise.resolve(adapter.prepareSession(uri_1.URI.revive(resource), position, token)), undefined, token);
        }
        $provideTypeHierarchySupertypes(handle, sessionId, itemId, token) {
            return this._withAdapter(handle, TypeHierarchyAdapter, adapter => adapter.provideSupertypes(sessionId, itemId, token), undefined, token);
        }
        $provideTypeHierarchySubtypes(handle, sessionId, itemId, token) {
            return this._withAdapter(handle, TypeHierarchyAdapter, adapter => adapter.provideSubtypes(sessionId, itemId, token), undefined, token);
        }
        $releaseTypeHierarchy(handle, sessionId) {
            this._withAdapter(handle, TypeHierarchyAdapter, adapter => Promise.resolve(adapter.releaseSession(sessionId)), undefined, undefined);
        }
        // --- Document on drop
        registerDocumentOnDropEditProvider(extension, selector, provider, metadata) {
            const handle = this._nextHandle();
            this._adapter.set(handle, new AdapterData(new DocumentOnDropEditAdapter(this._proxy, this._documents, provider, handle, extension), extension));
            const id = (0, extensions_2.isProposedApiEnabled)(extension, 'dropMetadata') && metadata ? DocumentOnDropEditAdapter.toInternalProviderId(extension.identifier.value, metadata.id) : undefined;
            this._proxy.$registerDocumentOnDropEditProvider(handle, this._transformDocumentSelector(selector, extension), id, (0, extensions_2.isProposedApiEnabled)(extension, 'dropMetadata') ? metadata : undefined);
            return this._createDisposable(handle);
        }
        $provideDocumentOnDropEdits(handle, requestId, resource, position, dataTransferDto, token) {
            return this._withAdapter(handle, DocumentOnDropEditAdapter, adapter => Promise.resolve(adapter.provideDocumentOnDropEdits(requestId, uri_1.URI.revive(resource), position, dataTransferDto, token)), undefined, undefined);
        }
        // --- mapped edits
        registerMappedEditsProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new MappedEditsAdapter(this._documents, provider), extension);
            this._proxy.$registerMappedEditsProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideMappedEdits(handle, document, codeBlocks, context, token) {
            return this._withAdapter(handle, MappedEditsAdapter, adapter => Promise.resolve(adapter.provideMappedEdits(document, codeBlocks, context, token)), null, token);
        }
        // --- copy/paste actions
        registerDocumentPasteEditProvider(extension, selector, provider, metadata) {
            const handle = this._nextHandle();
            this._adapter.set(handle, new AdapterData(new DocumentPasteEditProvider(this._proxy, this._documents, provider, handle, extension), extension));
            const internalId = DocumentPasteEditProvider.toInternalProviderId(extension.identifier.value, metadata.id);
            this._proxy.$registerPasteEditProvider(handle, this._transformDocumentSelector(selector, extension), internalId, {
                supportsCopy: !!provider.prepareDocumentPaste,
                supportsPaste: !!provider.provideDocumentPasteEdits,
                copyMimeTypes: metadata.copyMimeTypes,
                pasteMimeTypes: metadata.pasteMimeTypes,
            });
            return this._createDisposable(handle);
        }
        $prepareDocumentPaste(handle, resource, ranges, dataTransfer, token) {
            return this._withAdapter(handle, DocumentPasteEditProvider, adapter => adapter.prepareDocumentPaste(uri_1.URI.revive(resource), ranges, dataTransfer, token), undefined, token);
        }
        $providePasteEdits(handle, requestId, resource, ranges, dataTransferDto, token) {
            return this._withAdapter(handle, DocumentPasteEditProvider, adapter => adapter.providePasteEdits(requestId, uri_1.URI.revive(resource), ranges, dataTransferDto, token), undefined, token);
        }
        // --- configuration
        static _serializeRegExp(regExp) {
            return {
                pattern: regExp.source,
                flags: regExp.flags,
            };
        }
        static _serializeIndentationRule(indentationRule) {
            return {
                decreaseIndentPattern: ExtHostLanguageFeatures._serializeRegExp(indentationRule.decreaseIndentPattern),
                increaseIndentPattern: ExtHostLanguageFeatures._serializeRegExp(indentationRule.increaseIndentPattern),
                indentNextLinePattern: indentationRule.indentNextLinePattern ? ExtHostLanguageFeatures._serializeRegExp(indentationRule.indentNextLinePattern) : undefined,
                unIndentedLinePattern: indentationRule.unIndentedLinePattern ? ExtHostLanguageFeatures._serializeRegExp(indentationRule.unIndentedLinePattern) : undefined,
            };
        }
        static _serializeOnEnterRule(onEnterRule) {
            return {
                beforeText: ExtHostLanguageFeatures._serializeRegExp(onEnterRule.beforeText),
                afterText: onEnterRule.afterText ? ExtHostLanguageFeatures._serializeRegExp(onEnterRule.afterText) : undefined,
                previousLineText: onEnterRule.previousLineText ? ExtHostLanguageFeatures._serializeRegExp(onEnterRule.previousLineText) : undefined,
                action: onEnterRule.action
            };
        }
        static _serializeOnEnterRules(onEnterRules) {
            return onEnterRules.map(ExtHostLanguageFeatures._serializeOnEnterRule);
        }
        static _serializeAutoClosingPair(autoClosingPair) {
            return {
                open: autoClosingPair.open,
                close: autoClosingPair.close,
                notIn: autoClosingPair.notIn ? autoClosingPair.notIn.map(v => extHostTypes_1.SyntaxTokenType.toString(v)) : undefined,
            };
        }
        static _serializeAutoClosingPairs(autoClosingPairs) {
            return autoClosingPairs.map(ExtHostLanguageFeatures._serializeAutoClosingPair);
        }
        setLanguageConfiguration(extension, languageId, configuration) {
            const { wordPattern } = configuration;
            // check for a valid word pattern
            if (wordPattern && (0, strings_1.regExpLeadsToEndlessLoop)(wordPattern)) {
                throw new Error(`Invalid language configuration: wordPattern '${wordPattern}' is not allowed to match the empty string.`);
            }
            // word definition
            if (wordPattern) {
                this._documents.setWordDefinitionFor(languageId, wordPattern);
            }
            else {
                this._documents.setWordDefinitionFor(languageId, undefined);
            }
            if (configuration.__electricCharacterSupport) {
                this._apiDeprecation.report('LanguageConfiguration.__electricCharacterSupport', extension, `Do not use.`);
            }
            if (configuration.__characterPairSupport) {
                this._apiDeprecation.report('LanguageConfiguration.__characterPairSupport', extension, `Do not use.`);
            }
            const handle = this._nextHandle();
            const serializedConfiguration = {
                comments: configuration.comments,
                brackets: configuration.brackets,
                wordPattern: configuration.wordPattern ? ExtHostLanguageFeatures._serializeRegExp(configuration.wordPattern) : undefined,
                indentationRules: configuration.indentationRules ? ExtHostLanguageFeatures._serializeIndentationRule(configuration.indentationRules) : undefined,
                onEnterRules: configuration.onEnterRules ? ExtHostLanguageFeatures._serializeOnEnterRules(configuration.onEnterRules) : undefined,
                __electricCharacterSupport: configuration.__electricCharacterSupport,
                __characterPairSupport: configuration.__characterPairSupport,
                autoClosingPairs: configuration.autoClosingPairs ? ExtHostLanguageFeatures._serializeAutoClosingPairs(configuration.autoClosingPairs) : undefined,
            };
            this._proxy.$setLanguageConfiguration(handle, languageId, serializedConfiguration);
            return this._createDisposable(handle);
        }
        $setWordDefinitions(wordDefinitions) {
            for (const wordDefinition of wordDefinitions) {
                this._documents.setWordDefinitionFor(wordDefinition.languageId, new RegExp(wordDefinition.regexSource, wordDefinition.regexFlags));
            }
        }
    }
    exports.ExtHostLanguageFeatures = ExtHostLanguageFeatures;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdExhbmd1YWdlRmVhdHVyZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RMYW5ndWFnZUZlYXR1cmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFDaEcsY0FBYztJQUVkLE1BQU0scUJBQXFCO1FBRTFCLFlBQ2tCLFVBQTRCLEVBQzVCLFNBQXdDO1lBRHhDLGVBQVUsR0FBVixVQUFVLENBQWtCO1lBQzVCLGNBQVMsR0FBVCxTQUFTLENBQStCO1FBQ3RELENBQUM7UUFFTCxLQUFLLENBQUMsc0JBQXNCLENBQUMsUUFBYSxFQUFFLEtBQXdCO1lBQ25FLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEUsSUFBSSxJQUFBLHVCQUFjLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztpQkFBTSxJQUFJLEtBQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSw2QkFBYyxFQUFFLENBQUM7Z0JBQ2hELE9BQTBCLEtBQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2RSxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsT0FBTyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBc0IsS0FBSyxDQUFDLENBQUM7WUFDaEYsQ0FBQztRQUNGLENBQUM7UUFFTyxNQUFNLENBQUMscUJBQXFCLENBQUMsS0FBMEI7WUFDOUQsZ0VBQWdFO1lBQ2hFLHlDQUF5QztZQUN6QyxLQUFLLEdBQUcsS0FB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