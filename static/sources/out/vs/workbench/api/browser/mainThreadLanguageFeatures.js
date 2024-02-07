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
define(["require", "exports", "vs/base/common/dataTransfer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/objects", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/semanticTokensDto", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/api/browser/mainThreadBulkEdits", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/shared/dataTransferCache", "vs/workbench/contrib/callHierarchy/common/callHierarchy", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/typeHierarchy/common/typeHierarchy", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/base/common/map", "vs/base/common/arrays"], function (require, exports, dataTransfer_1, errors_1, event_1, lifecycle_1, marshalling_1, objects_1, uri_1, language_1, languageConfigurationRegistry_1, languageFeatures_1, semanticTokensDto_1, uriIdentity_1, mainThreadBulkEdits_1, typeConvert, dataTransferCache_1, callh, search, typeh, extHostCustomers_1, extHost_protocol_1, map_1, arrays_1) {
    "use strict";
    var MainThreadLanguageFeatures_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadMappedEditsProvider = exports.MainThreadDocumentRangeSemanticTokensProvider = exports.MainThreadDocumentSemanticTokensProvider = exports.MainThreadLanguageFeatures = void 0;
    let MainThreadLanguageFeatures = MainThreadLanguageFeatures_1 = class MainThreadLanguageFeatures extends lifecycle_1.Disposable {
        constructor(extHostContext, _languageService, _languageConfigurationService, _languageFeaturesService, _uriIdentService) {
            super();
            this._languageService = _languageService;
            this._languageConfigurationService = _languageConfigurationService;
            this._languageFeaturesService = _languageFeaturesService;
            this._uriIdentService = _uriIdentService;
            this._registrations = this._register(new lifecycle_1.DisposableMap());
            // --- copy paste action provider
            this._pasteEditProviders = new Map();
            // --- document drop Edits
            this._documentOnDropEditProviders = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostLanguageFeatures);
            if (this._languageService) {
                const updateAllWordDefinitions = () => {
                    const wordDefinitionDtos = [];
                    for (const languageId of _languageService.getRegisteredLanguageIds()) {
                        const wordDefinition = this._languageConfigurationService.getLanguageConfiguration(languageId).getWordDefinition();
                        wordDefinitionDtos.push({
                            languageId: languageId,
                            regexSource: wordDefinition.source,
                            regexFlags: wordDefinition.flags
                        });
                    }
                    this._proxy.$setWordDefinitions(wordDefinitionDtos);
                };
                this._languageConfigurationService.onDidChange((e) => {
                    if (!e.languageId) {
                        updateAllWordDefinitions();
                    }
                    else {
                        const wordDefinition = this._languageConfigurationService.getLanguageConfiguration(e.languageId).getWordDefinition();
                        this._proxy.$setWordDefinitions([{
                                languageId: e.languageId,
                                regexSource: wordDefinition.source,
                                regexFlags: wordDefinition.flags
                            }]);
                    }
                });
                updateAllWordDefinitions();
            }
        }
        $unregister(handle) {
            this._registrations.deleteAndDispose(handle);
        }
        static _reviveLocationDto(data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach(l => MainThreadLanguageFeatures_1._reviveLocationDto(l));
                return data;
            }
            else {
                data.uri = uri_1.URI.revive(data.uri);
                return data;
            }
        }
        static _reviveLocationLinkDto(data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach(l => MainThreadLanguageFeatures_1._reviveLocationLinkDto(l));
                return data;
            }
            else {
                data.uri = uri_1.URI.revive(data.uri);
                return data;
            }
        }
        static _reviveWorkspaceSymbolDto(data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach(MainThreadLanguageFeatures_1._reviveWorkspaceSymbolDto);
                return data;
            }
            else {
                data.location = MainThreadLanguageFeatures_1._reviveLocationDto(data.location);
                return data;
            }
        }
        static _reviveCodeActionDto(data, uriIdentService) {
            data?.forEach(code => (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(code.edit, uriIdentService));
            return data;
        }
        static _reviveLinkDTO(data) {
            if (data.url && typeof data.url !== 'string') {
                data.url = uri_1.URI.revive(data.url);
            }
            return data;
        }
        static _reviveCallHierarchyItemDto(data) {
            if (data) {
                data.uri = uri_1.URI.revive(data.uri);
            }
            return data;
        }
        static _reviveTypeHierarchyItemDto(data) {
            if (data) {
                data.uri = uri_1.URI.revive(data.uri);
            }
            return data;
        }
        //#endregion
        // --- outline
        $registerDocumentSymbolProvider(handle, selector, displayName) {
            this._registrations.set(handle, this._languageFeaturesService.documentSymbolProvider.register(selector, {
                displayName,
                provideDocumentSymbols: (model, token) => {
                    return this._proxy.$provideDocumentSymbols(handle, model.uri, token);
                }
            }));
        }
        // --- code lens
        $registerCodeLensSupport(handle, selector, eventHandle) {
            const provider = {
                provideCodeLenses: async (model, token) => {
                    const listDto = await this._proxy.$provideCodeLenses(handle, model.uri, token);
                    if (!listDto) {
                        return undefined;
                    }
                    return {
                        lenses: listDto.lenses,
                        dispose: () => listDto.cacheId && this._proxy.$releaseCodeLenses(handle, listDto.cacheId)
                    };
                },
                resolveCodeLens: async (model, codeLens, token) => {
                    const result = await this._proxy.$resolveCodeLens(handle, codeLens, token);
                    if (!result) {
                        return undefined;
                    }
                    return {
                        ...result,
                        range: model.validateRange(result.range),
                    };
                }
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._registrations.set(eventHandle, emitter);
                provider.onDidChange = emitter.event;
            }
            this._registrations.set(handle, this._languageFeaturesService.codeLensProvider.register(selector, provider));
        }
        $emitCodeLensEvent(eventHandle, event) {
            const obj = this._registrations.get(eventHandle);
            if (obj instanceof event_1.Emitter) {
                obj.fire(event);
            }
        }
        // --- declaration
        $registerDefinitionSupport(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.definitionProvider.register(selector, {
                provideDefinition: (model, position, token) => {
                    return this._proxy.$provideDefinition(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
                }
            }));
        }
        $registerDeclarationSupport(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.declarationProvider.register(selector, {
                provideDeclaration: (model, position, token) => {
                    return this._proxy.$provideDeclaration(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
                }
            }));
        }
        $registerImplementationSupport(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.implementationProvider.register(selector, {
                provideImplementation: (model, position, token) => {
                    return this._proxy.$provideImplementation(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
                }
            }));
        }
        $registerTypeDefinitionSupport(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.typeDefinitionProvider.register(selector, {
                provideTypeDefinition: (model, position, token) => {
                    return this._proxy.$provideTypeDefinition(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
                }
            }));
        }
        // --- extra info
        $registerHoverProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.hoverProvider.register(selector, {
                provideHover: (model, position, token) => {
                    return this._proxy.$provideHover(handle, model.uri, position, token);
                }
            }));
        }
        // --- debug hover
        $registerEvaluatableExpressionProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.evaluatableExpressionProvider.register(selector, {
                provideEvaluatableExpression: (model, position, token) => {
                    return this._proxy.$provideEvaluatableExpression(handle, model.uri, position, token);
                }
            }));
        }
        // --- inline values
        $registerInlineValuesProvider(handle, selector, eventHandle) {
            const provider = {
                provideInlineValues: (model, viewPort, context, token) => {
                    return this._proxy.$provideInlineValues(handle, model.uri, viewPort, context, token);
                }
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._registrations.set(eventHandle, emitter);
                provider.onDidChangeInlineValues = emitter.event;
            }
            this._registrations.set(handle, this._languageFeaturesService.inlineValuesProvider.register(selector, provider));
        }
        $emitInlineValuesEvent(eventHandle, event) {
            const obj = this._registrations.get(eventHandle);
            if (obj instanceof event_1.Emitter) {
                obj.fire(event);
            }
        }
        // --- occurrences
        $registerDocumentHighlightProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.documentHighlightProvider.register(selector, {
                provideDocumentHighlights: (model, position, token) => {
                    return this._proxy.$provideDocumentHighlights(handle, model.uri, position, token);
                }
            }));
        }
        $registerMultiDocumentHighlightProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.multiDocumentHighlightProvider.register(selector, {
                selector: selector,
                provideMultiDocumentHighlights: (model, position, otherModels, token) => {
                    return this._proxy.$provideMultiDocumentHighlights(handle, model.uri, position, otherModels.map(model => model.uri), token).then(dto => {
                        if ((0, arrays_1.isFalsyOrEmpty)(dto)) {
                            return undefined;
                        }
                        const result = new map_1.ResourceMap();
                        dto?.forEach(value => {
                            // check if the URI exists already, if so, combine the highlights, otherwise create a new entry
                            const uri = uri_1.URI.revive(value.uri);
                            if (result.has(uri)) {
                                result.get(uri).push(...value.highlights);
                            }
                            else {
                                result.set(uri, value.highlights);
                            }
                        });
                        return result;
                    });
                }
            }));
        }
        // --- linked editing
        $registerLinkedEditingRangeProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.linkedEditingRangeProvider.register(selector, {
                provideLinkedEditingRanges: async (model, position, token) => {
                    const res = await this._proxy.$provideLinkedEditingRanges(handle, model.uri, position, token);
                    if (res) {
                        return {
                            ranges: res.ranges,
                            wordPattern: res.wordPattern ? MainThreadLanguageFeatures_1._reviveRegExp(res.wordPattern) : undefined
                        };
                    }
                    return undefined;
                }
            }));
        }
        // --- references
        $registerReferenceSupport(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.referenceProvider.register(selector, {
                provideReferences: (model, position, context, token) => {
                    return this._proxy.$provideReferences(handle, model.uri, position, context, token).then(MainThreadLanguageFeatures_1._reviveLocationDto);
                }
            }));
        }
        // --- quick fix
        $registerQuickFixSupport(handle, selector, metadata, displayName, supportsResolve) {
            const provider = {
                provideCodeActions: async (model, rangeOrSelection, context, token) => {
                    const listDto = await this._proxy.$provideCodeActions(handle, model.uri, rangeOrSelection, context, token);
                    if (!listDto) {
                        return undefined;
                    }
                    return {
                        actions: MainThreadLanguageFeatures_1._reviveCodeActionDto(listDto.actions, this._uriIdentService),
                        dispose: () => {
                            if (typeof listDto.cacheId === 'number') {
                                this._proxy.$releaseCodeActions(handle, listDto.cacheId);
                            }
                        }
                    };
                },
                providedCodeActionKinds: metadata.providedKinds,
                documentation: metadata.documentation,
                displayName
            };
            if (supportsResolve) {
                provider.resolveCodeAction = async (codeAction, token) => {
                    const resolved = await this._proxy.$resolveCodeAction(handle, codeAction.cacheId, token);
                    if (resolved.edit) {
                        codeAction.edit = (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(resolved.edit, this._uriIdentService);
                    }
                    if (resolved.command) {
                        codeAction.command = resolved.command;
                    }
                    return codeAction;
                };
            }
            this._registrations.set(handle, this._languageFeaturesService.codeActionProvider.register(selector, provider));
        }
        $registerPasteEditProvider(handle, selector, id, metadata) {
            const provider = new MainThreadPasteEditProvider(handle, this._proxy, id, metadata, this._uriIdentService);
            this._pasteEditProviders.set(handle, provider);
            this._registrations.set(handle, (0, lifecycle_1.combinedDisposable)(this._languageFeaturesService.documentPasteEditProvider.register(selector, provider), (0, lifecycle_1.toDisposable)(() => this._pasteEditProviders.delete(handle))));
        }
        $resolvePasteFileData(handle, requestId, dataId) {
            const provider = this._pasteEditProviders.get(handle);
            if (!provider) {
                throw new Error('Could not find provider');
            }
            return provider.resolveFileData(requestId, dataId);
        }
        // --- formatting
        $registerDocumentFormattingSupport(handle, selector, extensionId, displayName) {
            this._registrations.set(handle, this._languageFeaturesService.documentFormattingEditProvider.register(selector, {
                extensionId,
                displayName,
                provideDocumentFormattingEdits: (model, options, token) => {
                    return this._proxy.$provideDocumentFormattingEdits(handle, model.uri, options, token);
                }
            }));
        }
        $registerRangeFormattingSupport(handle, selector, extensionId, displayName, supportsRanges) {
            this._registrations.set(handle, this._languageFeaturesService.documentRangeFormattingEditProvider.register(selector, {
                extensionId,
                displayName,
                provideDocumentRangeFormattingEdits: (model, range, options, token) => {
                    return this._proxy.$provideDocumentRangeFormattingEdits(handle, model.uri, range, options, token);
                },
                provideDocumentRangesFormattingEdits: !supportsRanges
                    ? undefined
                    : (model, ranges, options, token) => {
                        return this._proxy.$provideDocumentRangesFormattingEdits(handle, model.uri, ranges, options, token);
                    },
            }));
        }
        $registerOnTypeFormattingSupport(handle, selector, autoFormatTriggerCharacters, extensionId) {
            this._registrations.set(handle, this._languageFeaturesService.onTypeFormattingEditProvider.register(selector, {
                extensionId,
                autoFormatTriggerCharacters,
                provideOnTypeFormattingEdits: (model, position, ch, options, token) => {
                    return this._proxy.$provideOnTypeFormattingEdits(handle, model.uri, position, ch, options, token);
                }
            }));
        }
        // --- navigate type
        $registerNavigateTypeSupport(handle, supportsResolve) {
            let lastResultId;
            const provider = {
                provideWorkspaceSymbols: async (search, token) => {
                    const result = await this._proxy.$provideWorkspaceSymbols(handle, search, token);
                    if (lastResultId !== undefined) {
                        this._proxy.$releaseWorkspaceSymbols(handle, lastResultId);
                    }
                    lastResultId = result.cacheId;
                    return MainThreadLanguageFeatures_1._reviveWorkspaceSymbolDto(result.symbols);
                }
            };
            if (supportsResolve) {
                provider.resolveWorkspaceSymbol = async (item, token) => {
                    const resolvedItem = await this._proxy.$resolveWorkspaceSymbol(handle, item, token);
                    return resolvedItem && MainThreadLanguageFeatures_1._reviveWorkspaceSymbolDto(resolvedItem);
                };
            }
            this._registrations.set(handle, search.WorkspaceSymbolProviderRegistry.register(provider));
        }
        // --- rename
        $registerRenameSupport(handle, selector, supportResolveLocation) {
            this._registrations.set(handle, this._languageFeaturesService.renameProvider.register(selector, {
                provideRenameEdits: (model, position, newName, token) => {
                    return this._proxy.$provideRenameEdits(handle, model.uri, position, newName, token).then(data => (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(data, this._uriIdentService));
                },
                resolveRenameLocation: supportResolveLocation
                    ? (model, position, token) => this._proxy.$resolveRenameLocation(handle, model.uri, position, token)
                    : undefined
            }));
        }
        // --- semantic tokens
        $registerDocumentSemanticTokensProvider(handle, selector, legend, eventHandle) {
            let event = undefined;
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._registrations.set(eventHandle, emitter);
                event = emitter.event;
            }
            this._registrations.set(handle, this._languageFeaturesService.documentSemanticTokensProvider.register(selector, new MainThreadDocumentSemanticTokensProvider(this._proxy, handle, legend, event)));
        }
        $emitDocumentSemanticTokensEvent(eventHandle) {
            const obj = this._registrations.get(eventHandle);
            if (obj instanceof event_1.Emitter) {
                obj.fire(undefined);
            }
        }
        $registerDocumentRangeSemanticTokensProvider(handle, selector, legend) {
            this._registrations.set(handle, this._languageFeaturesService.documentRangeSemanticTokensProvider.register(selector, new MainThreadDocumentRangeSemanticTokensProvider(this._proxy, handle, legend)));
        }
        // --- suggest
        static _inflateSuggestDto(defaultRange, data, extensionId) {
            const label = data["a" /* ISuggestDataDtoField.label */];
            const commandId = data["o" /* ISuggestDataDtoField.commandId */];
            const commandIdent = data["n" /* ISuggestDataDtoField.commandIdent */];
            const commitChars = data["k" /* ISuggestDataDtoField.commitCharacters */];
            return {
                label,
                extensionId,
                kind: data["b" /* ISuggestDataDtoField.kind */] ?? 9 /* languages.CompletionItemKind.Property */,
                tags: data["m" /* ISuggestDataDtoField.kindModifier */],
                detail: data["c" /* ISuggestDataDtoField.detail */],
                documentation: data["d" /* ISuggestDataDtoField.documentation */],
                sortText: data["e" /* ISuggestDataDtoField.sortText */],
                filterText: data["f" /* ISuggestDataDtoField.filterText */],
                preselect: data["g" /* ISuggestDataDtoField.preselect */],
                insertText: data["h" /* ISuggestDataDtoField.insertText */] ?? (typeof label === 'string' ? label : label.label),
                range: data["j" /* ISuggestDataDtoField.range */] ?? defaultRange,
                insertTextRules: data["i" /* ISuggestDataDtoField.insertTextRules */],
                commitCharacters: commitChars ? Array.from(commitChars) : undefined,
                additionalTextEdits: data["l" /* ISuggestDataDtoField.additionalTextEdits */],
                command: commandId ? {
                    $ident: commandIdent,
                    id: commandId,
                    title: '',
                    arguments: commandIdent ? [commandIdent] : data["p" /* ISuggestDataDtoField.commandArguments */], // Automatically fill in ident as first argument
                } : undefined,
                // not-standard
                _id: data.x,
            };
        }
        $registerCompletionsProvider(handle, selector, triggerCharacters, supportsResolveDetails, extensionId) {
            const provider = {
                triggerCharacters,
                _debugDisplayName: `${extensionId.value}(${triggerCharacters.join('')})`,
                provideCompletionItems: async (model, position, context, token) => {
                    const result = await this._proxy.$provideCompletionItems(handle, model.uri, position, context, token);
                    if (!result) {
                        return result;
                    }
                    return {
                        suggestions: result["b" /* ISuggestResultDtoField.completions */].map(d => MainThreadLanguageFeatures_1._inflateSuggestDto(result["a" /* ISuggestResultDtoField.defaultRanges */], d, extensionId)),
                        incomplete: result["c" /* ISuggestResultDtoField.isIncomplete */] || false,
                        duration: result["d" /* ISuggestResultDtoField.duration */],
                        dispose: () => {
                            if (typeof result.x === 'number') {
                                this._proxy.$releaseCompletionItems(handle, result.x);
                            }
                        }
                    };
                }
            };
            if (supportsResolveDetails) {
                provider.resolveCompletionItem = (suggestion, token) => {
                    return this._proxy.$resolveCompletionItem(handle, suggestion._id, token).then(result => {
                        if (!result) {
                            return suggestion;
                        }
                        const newSuggestion = MainThreadLanguageFeatures_1._inflateSuggestDto(suggestion.range, result, extensionId);
                        return (0, objects_1.mixin)(suggestion, newSuggestion, true);
                    });
                };
            }
            this._registrations.set(handle, this._languageFeaturesService.completionProvider.register(selector, provider));
        }
        $registerInlineCompletionsSupport(handle, selector, supportsHandleEvents, extensionId, yieldsToExtensionIds) {
            const provider = {
                provideInlineCompletions: async (model, position, context, token) => {
                    return this._proxy.$provideInlineCompletions(handle, model.uri, position, context, token);
                },
                handleItemDidShow: async (completions, item, updatedInsertText) => {
                    if (supportsHandleEvents) {
                        await this._proxy.$handleInlineCompletionDidShow(handle, completions.pid, item.idx, updatedInsertText);
                    }
                },
                handlePartialAccept: async (completions, item, acceptedCharacters) => {
                    if (supportsHandleEvents) {
                        await this._proxy.$handleInlineCompletionPartialAccept(handle, completions.pid, item.idx, acceptedCharacters);
                    }
                },
                freeInlineCompletions: (completions) => {
                    this._proxy.$freeInlineCompletionsList(handle, completions.pid);
                },
                groupId: extensionId,
                yieldsToGroupIds: yieldsToExtensionIds,
                toString() {
                    return `InlineCompletionsProvider(${extensionId})`;
                }
            };
            this._registrations.set(handle, this._languageFeaturesService.inlineCompletionsProvider.register(selector, provider));
        }
        // --- parameter hints
        $registerSignatureHelpProvider(handle, selector, metadata) {
            this._registrations.set(handle, this._languageFeaturesService.signatureHelpProvider.register(selector, {
                signatureHelpTriggerCharacters: metadata.triggerCharacters,
                signatureHelpRetriggerCharacters: metadata.retriggerCharacters,
                provideSignatureHelp: async (model, position, token, context) => {
                    const result = await this._proxy.$provideSignatureHelp(handle, model.uri, position, context, token);
                    if (!result) {
                        return undefined;
                    }
                    return {
                        value: result,
                        dispose: () => {
                            this._proxy.$releaseSignatureHelp(handle, result.id);
                        }
                    };
                }
            }));
        }
        // --- inline hints
        $registerInlayHintsProvider(handle, selector, supportsResolve, eventHandle, displayName) {
            const provider = {
                displayName,
                provideInlayHints: async (model, range, token) => {
                    const result = await this._proxy.$provideInlayHints(handle, model.uri, range, token);
                    if (!result) {
                        return;
                    }
                    return {
                        hints: (0, marshalling_1.revive)(result.hints),
                        dispose: () => {
                            if (result.cacheId) {
                                this._proxy.$releaseInlayHints(handle, result.cacheId);
                            }
                        }
                    };
                }
            };
            if (supportsResolve) {
                provider.resolveInlayHint = async (hint, token) => {
                    const dto = hint;
                    if (!dto.cacheId) {
                        return hint;
                    }
                    const result = await this._proxy.$resolveInlayHint(handle, dto.cacheId, token);
                    if (token.isCancellationRequested) {
                        throw new errors_1.CancellationError();
                    }
                    if (!result) {
                        return hint;
                    }
                    return {
                        ...hint,
                        tooltip: result.tooltip,
                        label: (0, marshalling_1.revive)(result.label),
                        textEdits: result.textEdits
                    };
                };
            }
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._registrations.set(eventHandle, emitter);
                provider.onDidChangeInlayHints = emitter.event;
            }
            this._registrations.set(handle, this._languageFeaturesService.inlayHintsProvider.register(selector, provider));
        }
        $emitInlayHintsEvent(eventHandle) {
            const obj = this._registrations.get(eventHandle);
            if (obj instanceof event_1.Emitter) {
                obj.fire(undefined);
            }
        }
        // --- links
        $registerDocumentLinkProvider(handle, selector, supportsResolve) {
            const provider = {
                provideLinks: (model, token) => {
                    return this._proxy.$provideDocumentLinks(handle, model.uri, token).then(dto => {
                        if (!dto) {
                            return undefined;
                        }
                        return {
                            links: dto.links.map(MainThreadLanguageFeatures_1._reviveLinkDTO),
                            dispose: () => {
                                if (typeof dto.cacheId === 'number') {
                                    this._proxy.$releaseDocumentLinks(handle, dto.cacheId);
                                }
                            }
                        };
                    });
                }
            };
            if (supportsResolve) {
                provider.resolveLink = (link, token) => {
                    const dto = link;
                    if (!dto.cacheId) {
                        return link;
                    }
                    return this._proxy.$resolveDocumentLink(handle, dto.cacheId, token).then(obj => {
                        return obj && MainThreadLanguageFeatures_1._reviveLinkDTO(obj);
                    });
                };
            }
            this._registrations.set(handle, this._languageFeaturesService.linkProvider.register(selector, provider));
        }
        // --- colors
        $registerDocumentColorProvider(handle, selector) {
            const proxy = this._proxy;
            this._registrations.set(handle, this._languageFeaturesService.colorProvider.register(selector, {
                provideDocumentColors: (model, token) => {
                    return proxy.$provideDocumentColors(handle, model.uri, token)
                        .then(documentColors => {
                        return documentColors.map(documentColor => {
                            const [red, green, blue, alpha] = documentColor.color;
                            const color = {
                                red: red,
                                green: green,
                                blue: blue,
                                alpha
                            };
                            return {
                                color,
                                range: documentColor.range
                            };
                        });
                    });
                },
                provideColorPresentations: (model, colorInfo, token) => {
                    return proxy.$provideColorPresentations(handle, model.uri, {
                        color: [colorInfo.color.red, colorInfo.color.green, colorInfo.color.blue, colorInfo.color.alpha],
                        range: colorInfo.range
                    }, token);
                }
            }));
        }
        // --- folding
        $registerFoldingRangeProvider(handle, selector, extensionId, eventHandle) {
            const provider = {
                id: extensionId.value,
                provideFoldingRanges: (model, context, token) => {
                    return this._proxy.$provideFoldingRanges(handle, model.uri, context, token);
                }
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._registrations.set(eventHandle, emitter);
                provider.onDidChange = emitter.event;
            }
            this._registrations.set(handle, this._languageFeaturesService.foldingRangeProvider.register(selector, provider));
        }
        $emitFoldingRangeEvent(eventHandle, event) {
            const obj = this._registrations.get(eventHandle);
            if (obj instanceof event_1.Emitter) {
                obj.fire(event);
            }
        }
        // -- smart select
        $registerSelectionRangeProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.selectionRangeProvider.register(selector, {
                provideSelectionRanges: (model, positions, token) => {
                    return this._proxy.$provideSelectionRanges(handle, model.uri, positions, token);
                }
            }));
        }
        // --- call hierarchy
        $registerCallHierarchyProvider(handle, selector) {
            this._registrations.set(handle, callh.CallHierarchyProviderRegistry.register(selector, {
                prepareCallHierarchy: async (document, position, token) => {
                    const items = await this._proxy.$prepareCallHierarchy(handle, document.uri, position, token);
                    if (!items || items.length === 0) {
                        return undefined;
                    }
                    return {
                        dispose: () => {
                            for (const item of items) {
                                this._proxy.$releaseCallHierarchy(handle, item._sessionId);
                            }
                        },
                        roots: items.map(MainThreadLanguageFeatures_1._reviveCallHierarchyItemDto)
                    };
                },
                provideOutgoingCalls: async (item, token) => {
                    const outgoing = await this._proxy.$provideCallHierarchyOutgoingCalls(handle, item._sessionId, item._itemId, token);
                    if (!outgoing) {
                        return outgoing;
                    }
                    outgoing.forEach(value => {
                        value.to = MainThreadLanguageFeatures_1._reviveCallHierarchyItemDto(value.to);
                    });
                    return outgoing;
                },
                provideIncomingCalls: async (item, token) => {
                    const incoming = await this._proxy.$provideCallHierarchyIncomingCalls(handle, item._sessionId, item._itemId, token);
                    if (!incoming) {
                        return incoming;
                    }
                    incoming.forEach(value => {
                        value.from = MainThreadLanguageFeatures_1._reviveCallHierarchyItemDto(value.from);
                    });
                    return incoming;
                }
            }));
        }
        // --- configuration
        static _reviveRegExp(regExp) {
            return new RegExp(regExp.pattern, regExp.flags);
        }
        static _reviveIndentationRule(indentationRule) {
            return {
                decreaseIndentPattern: MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.decreaseIndentPattern),
                increaseIndentPattern: MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.increaseIndentPattern),
                indentNextLinePattern: indentationRule.indentNextLinePattern ? MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.indentNextLinePattern) : undefined,
                unIndentedLinePattern: indentationRule.unIndentedLinePattern ? MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.unIndentedLinePattern) : undefined,
            };
        }
        static _reviveOnEnterRule(onEnterRule) {
            return {
                beforeText: MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.beforeText),
                afterText: onEnterRule.afterText ? MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.afterText) : undefined,
                previousLineText: onEnterRule.previousLineText ? MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.previousLineText) : undefined,
                action: onEnterRule.action
            };
        }
        static _reviveOnEnterRules(onEnterRules) {
            return onEnterRules.map(MainThreadLanguageFeatures_1._reviveOnEnterRule);
        }
        $setLanguageConfiguration(handle, languageId, _configuration) {
            const configuration = {
                comments: _configuration.comments,
                brackets: _configuration.brackets,
                wordPattern: _configuration.wordPattern ? MainThreadLanguageFeatures_1._reviveRegExp(_configuration.wordPattern) : undefined,
                indentationRules: _configuration.indentationRules ? MainThreadLanguageFeatures_1._reviveIndentationRule(_configuration.indentationRules) : undefined,
                onEnterRules: _configuration.onEnterRules ? MainThreadLanguageFeatures_1._reviveOnEnterRules(_configuration.onEnterRules) : undefined,
                autoClosingPairs: undefined,
                surroundingPairs: undefined,
                __electricCharacterSupport: undefined
            };
            if (_configuration.autoClosingPairs) {
                configuration.autoClosingPairs = _configuration.autoClosingPairs;
            }
            else if (_configuration.__characterPairSupport) {
                // backwards compatibility
                configuration.autoClosingPairs = _configuration.__characterPairSupport.autoClosingPairs;
            }
            if (_configuration.__electricCharacterSupport && _configuration.__electricCharacterSupport.docComment) {
                configuration.__electricCharacterSupport = {
                    docComment: {
                        open: _configuration.__electricCharacterSupport.docComment.open,
                        close: _configuration.__electricCharacterSupport.docComment.close
                    }
                };
            }
            if (this._languageService.isRegisteredLanguageId(languageId)) {
                this._registrations.set(handle, this._languageConfigurationService.register(languageId, configuration, 100));
            }
        }
        // --- type hierarchy
        $registerTypeHierarchyProvider(handle, selector) {
            this._registrations.set(handle, typeh.TypeHierarchyProviderRegistry.register(selector, {
                prepareTypeHierarchy: async (document, position, token) => {
                    const items = await this._proxy.$prepareTypeHierarchy(handle, document.uri, position, token);
                    if (!items) {
                        return undefined;
                    }
                    return {
                        dispose: () => {
                            for (const item of items) {
                                this._proxy.$releaseTypeHierarchy(handle, item._sessionId);
                            }
                        },
                        roots: items.map(MainThreadLanguageFeatures_1._reviveTypeHierarchyItemDto)
                    };
                },
                provideSupertypes: async (item, token) => {
                    const supertypes = await this._proxy.$provideTypeHierarchySupertypes(handle, item._sessionId, item._itemId, token);
                    if (!supertypes) {
                        return supertypes;
                    }
                    return supertypes.map(MainThreadLanguageFeatures_1._reviveTypeHierarchyItemDto);
                },
                provideSubtypes: async (item, token) => {
                    const subtypes = await this._proxy.$provideTypeHierarchySubtypes(handle, item._sessionId, item._itemId, token);
                    if (!subtypes) {
                        return subtypes;
                    }
                    return subtypes.map(MainThreadLanguageFeatures_1._reviveTypeHierarchyItemDto);
                }
            }));
        }
        $registerDocumentOnDropEditProvider(handle, selector, id, metadata) {
            const provider = new MainThreadDocumentOnDropEditProvider(handle, this._proxy, id, metadata, this._uriIdentService);
            this._documentOnDropEditProviders.set(handle, provider);
            this._registrations.set(handle, (0, lifecycle_1.combinedDisposable)(this._languageFeaturesService.documentOnDropEditProvider.register(selector, provider), (0, lifecycle_1.toDisposable)(() => this._documentOnDropEditProviders.delete(handle))));
        }
        async $resolveDocumentOnDropFileData(handle, requestId, dataId) {
            const provider = this._documentOnDropEditProviders.get(handle);
            if (!provider) {
                throw new Error('Could not find provider');
            }
            return provider.resolveDocumentOnDropFileData(requestId, dataId);
        }
        // --- mapped edits
        $registerMappedEditsProvider(handle, selector) {
            const provider = new MainThreadMappedEditsProvider(handle, this._proxy, this._uriIdentService);
            this._registrations.set(handle, this._languageFeaturesService.mappedEditsProvider.register(selector, provider));
        }
    };
    exports.MainThreadLanguageFeatures = MainThreadLanguageFeatures;
    exports.MainThreadLanguageFeatures = MainThreadLanguageFeatures = MainThreadLanguageFeatures_1 = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadLanguageFeatures),
        __param(1, language_1.ILanguageService),
        __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, uriIdentity_1.IUriIdentityService)
    ], MainThreadLanguageFeatures);
    let MainThreadPasteEditProvider = class MainThreadPasteEditProvider {
        constructor(_handle, _proxy, id, metadata, _uriIdentService) {
            this._handle = _handle;
            this._proxy = _proxy;
            this._uriIdentService = _uriIdentService;
            this.dataTransfers = new dataTransferCache_1.DataTransferFileCache();
            this.id = id;
            this.copyMimeTypes = metadata.copyMimeTypes;
            this.pasteMimeTypes = metadata.pasteMimeTypes;
            if (metadata.supportsCopy) {
                this.prepareDocumentPaste = async (model, selections, dataTransfer, token) => {
                    const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                    if (token.isCancellationRequested) {
                        return undefined;
                    }
                    const newDataTransfer = await this._proxy.$prepareDocumentPaste(_handle, model.uri, selections, dataTransferDto, token);
                    if (!newDataTransfer) {
                        return undefined;
                    }
                    const dataTransferOut = new dataTransfer_1.VSDataTransfer();
                    for (const [type, item] of newDataTransfer.items) {
                        dataTransferOut.replace(type, (0, dataTransfer_1.createStringDataTransferItem)(item.asString));
                    }
                    return dataTransferOut;
                };
            }
            if (metadata.supportsPaste) {
                this.provideDocumentPasteEdits = async (model, selections, dataTransfer, context, token) => {
                    const request = this.dataTransfers.add(dataTransfer);
                    try {
                        const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                        if (token.isCancellationRequested) {
                            return;
                        }
                        const result = await this._proxy.$providePasteEdits(this._handle, request.id, model.uri, selections, dataTransferDto, token);
                        if (!result) {
                            return;
                        }
                        return {
                            ...result,
                            additionalEdit: result.additionalEdit ? (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(result.additionalEdit, this._uriIdentService, dataId => this.resolveFileData(request.id, dataId)) : undefined,
                        };
                    }
                    finally {
                        request.dispose();
                    }
                };
            }
        }
        resolveFileData(requestId, dataId) {
            return this.dataTransfers.resolveFileData(requestId, dataId);
        }
    };
    MainThreadPasteEditProvider = __decorate([
        __param(4, uriIdentity_1.IUriIdentityService)
    ], MainThreadPasteEditProvider);
    let MainThreadDocumentOnDropEditProvider = class MainThreadDocumentOnDropEditProvider {
        constructor(_handle, _proxy, id, metadata, _uriIdentService) {
            this._handle = _handle;
            this._proxy = _proxy;
            this._uriIdentService = _uriIdentService;
            this.dataTransfers = new dataTransferCache_1.DataTransferFileCache();
            this.id = id;
            this.dropMimeTypes = metadata?.dropMimeTypes ?? ['*/*'];
        }
        async provideDocumentOnDropEdits(model, position, dataTransfer, token) {
            const request = this.dataTransfers.add(dataTransfer);
            try {
                const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                if (token.isCancellationRequested) {
                    return;
                }
                const edit = await this._proxy.$provideDocumentOnDropEdits(this._handle, request.id, model.uri, position, dataTransferDto, token);
                if (!edit) {
                    return;
                }
                return {
                    ...edit,
                    additionalEdit: (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(edit.additionalEdit, this._uriIdentService, dataId => this.resolveDocumentOnDropFileData(request.id, dataId)),
                };
            }
            finally {
                request.dispose();
            }
        }
        resolveDocumentOnDropFileData(requestId, dataId) {
            return this.dataTransfers.resolveFileData(requestId, dataId);
        }
    };
    MainThreadDocumentOnDropEditProvider = __decorate([
        __param(4, uriIdentity_1.IUriIdentityService)
    ], MainThreadDocumentOnDropEditProvider);
    class MainThreadDocumentSemanticTokensProvider {
        constructor(_proxy, _handle, _legend, onDidChange) {
            this._proxy = _proxy;
            this._handle = _handle;
            this._legend = _legend;
            this.onDidChange = onDidChange;
        }
        releaseDocumentSemanticTokens(resultId) {
            if (resultId) {
                this._proxy.$releaseDocumentSemanticTokens(this._handle, parseInt(resultId, 10));
            }
        }
        getLegend() {
            return this._legend;
        }
        async provideDocumentSemanticTokens(model, lastResultId, token) {
            const nLastResultId = lastResultId ? parseInt(lastResultId, 10) : 0;
            const encodedDto = await this._proxy.$provideDocumentSemanticTokens(this._handle, model.uri, nLastResultId, token);
            if (!encodedDto) {
                return null;
            }
            if (token.isCancellationRequested) {
                return null;
            }
            const dto = (0, semanticTokensDto_1.decodeSemanticTokensDto)(encodedDto);
            if (dto.type === 'full') {
                return {
                    resultId: String(dto.id),
                    data: dto.data
                };
            }
            return {
                resultId: String(dto.id),
                edits: dto.deltas
            };
        }
    }
    exports.MainThreadDocumentSemanticTokensProvider = MainThreadDocumentSemanticTokensProvider;
    class MainThreadDocumentRangeSemanticTokensProvider {
        constructor(_proxy, _handle, _legend) {
            this._proxy = _proxy;
            this._handle = _handle;
            this._legend = _legend;
        }
        getLegend() {
            return this._legend;
        }
        async provideDocumentRangeSemanticTokens(model, range, token) {
            const encodedDto = await this._proxy.$provideDocumentRangeSemanticTokens(this._handle, model.uri, range, token);
            if (!encodedDto) {
                return null;
            }
            if (token.isCancellationRequested) {
                return null;
            }
            const dto = (0, semanticTokensDto_1.decodeSemanticTokensDto)(encodedDto);
            if (dto.type === 'full') {
                return {
                    resultId: String(dto.id),
                    data: dto.data
                };
            }
            throw new Error(`Unexpected`);
        }
    }
    exports.MainThreadDocumentRangeSemanticTokensProvider = MainThreadDocumentRangeSemanticTokensProvider;
    class MainThreadMappedEditsProvider {
        constructor(_handle, _proxy, _uriService) {
            this._handle = _handle;
            this._proxy = _proxy;
            this._uriService = _uriService;
        }
        async provideMappedEdits(document, codeBlocks, context, token) {
            const res = await this._proxy.$provideMappedEdits(this._handle, document.uri, codeBlocks, context, token);
            return res ? (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(res, this._uriService) : null;
        }
    }
    exports.MainThreadMappedEditsProvider = MainThreadMappedEditsProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZExhbmd1YWdlRmVhdHVyZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkTGFuZ3VhZ2VGZWF0dXJlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBb0N6RixJQUFNLDBCQUEwQixrQ0FBaEMsTUFBTSwwQkFBMkIsU0FBUSxzQkFBVTtRQUt6RCxZQUNDLGNBQStCLEVBQ2IsZ0JBQW1ELEVBQ3RDLDZCQUE2RSxFQUNsRix3QkFBbUUsRUFDeEUsZ0JBQXNEO1lBRTNFLEtBQUssRUFBRSxDQUFDO1lBTDJCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDckIsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUErQjtZQUNqRSw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3ZELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBcUI7WUFQM0QsbUJBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBVSxDQUFDLENBQUM7WUFrVzlFLGlDQUFpQztZQUVoQix3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztZQThoQnRGLDBCQUEwQjtZQUVULGlDQUE0QixHQUFHLElBQUksR0FBRyxFQUFnRCxDQUFDO1lBejNCdkcsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUU5RSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUMzQixNQUFNLHdCQUF3QixHQUFHLEdBQUcsRUFBRTtvQkFDckMsTUFBTSxrQkFBa0IsR0FBaUMsRUFBRSxDQUFDO29CQUM1RCxLQUFLLE1BQU0sVUFBVSxJQUFJLGdCQUFnQixDQUFDLHdCQUF3QixFQUFFLEVB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