/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/keyCodes", "vs/base/common/types", "vs/base/common/uri", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/contrib/gotoSymbol/browser/peek/referencesController", "vs/editor/contrib/gotoSymbol/browser/referencesModel", "vs/editor/contrib/gotoSymbol/browser/symbolNavigation", "vs/editor/contrib/message/browser/messageController", "vs/editor/contrib/peekView/browser/peekView", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "./goToSymbol", "vs/editor/common/services/languageFeatures", "vs/base/common/iterator", "vs/platform/contextkey/common/contextkeys"], function (require, exports, aria_1, async_1, keyCodes_1, types_1, uri_1, editorState_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, embeddedCodeEditorWidget_1, corePosition, range_1, editorContextKeys_1, languages_1, referencesController_1, referencesModel_1, symbolNavigation_1, messageController_1, peekView_1, nls, actions_1, commands_1, contextkey_1, instantiation_1, notification_1, progress_1, goToSymbol_1, languageFeatures_1, iterator_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefinitionAction = exports.SymbolNavigationAction = exports.SymbolNavigationAnchor = void 0;
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        submenu: actions_1.MenuId.EditorContextPeek,
        title: nls.localize('peek.submenu', "Peek"),
        group: 'navigation',
        order: 100
    });
    class SymbolNavigationAnchor {
        static is(thing) {
            if (!thing || typeof thing !== 'object') {
                return false;
            }
            if (thing instanceof SymbolNavigationAnchor) {
                return true;
            }
            if (corePosition.Position.isIPosition(thing.position) && thing.model) {
                return true;
            }
            return false;
        }
        constructor(model, position) {
            this.model = model;
            this.position = position;
        }
    }
    exports.SymbolNavigationAnchor = SymbolNavigationAnchor;
    class SymbolNavigationAction extends editorExtensions_1.EditorAction2 {
        static { this._allSymbolNavigationCommands = new Map(); }
        static { this._activeAlternativeCommands = new Set(); }
        static all() {
            return SymbolNavigationAction._allSymbolNavigationCommands.values();
        }
        static _patchConfig(opts) {
            const result = { ...opts, f1: true };
            // patch context menu when clause
            if (result.menu) {
                for (const item of iterator_1.Iterable.wrap(result.menu)) {
                    if (item.id === actions_1.MenuId.EditorContext || item.id === actions_1.MenuId.EditorContextPeek) {
                        item.when = contextkey_1.ContextKeyExpr.and(opts.precondition, item.when);
                    }
                }
            }
            return result;
        }
        constructor(configuration, opts) {
            super(SymbolNavigationAction._patchConfig(opts));
            this.configuration = configuration;
            SymbolNavigationAction._allSymbolNavigationCommands.set(opts.id, this);
        }
        runEditorCommand(accessor, editor, arg, range) {
            if (!editor.hasModel()) {
                return Promise.resolve(undefined);
            }
            const notificationService = accessor.get(notification_1.INotificationService);
            const editorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const progressService = accessor.get(progress_1.IEditorProgressService);
            const symbolNavService = accessor.get(symbolNavigation_1.ISymbolNavigationService);
            const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const model = editor.getModel();
            const position = editor.getPosition();
            const anchor = SymbolNavigationAnchor.is(arg) ? arg : new SymbolNavigationAnchor(model, position);
            const cts = new editorState_1.EditorStateCancellationTokenSource(editor, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */);
            const promise = (0, async_1.raceCancellation)(this._getLocationModel(languageFeaturesService, anchor.model, anchor.position, cts.token), cts.token).then(async (references) => {
                if (!references || cts.token.isCancellationRequested) {
                    return;
                }
                (0, aria_1.alert)(references.ariaMessage);
                let altAction;
                if (references.referenceAt(model.uri, position)) {
                    const altActionId = this._getAlternativeCommand(editor);
                    if (!SymbolNavigationAction._activeAlternativeCommands.has(altActionId) && SymbolNavigationAction._allSymbolNavigationCommands.has(altActionId)) {
                        altAction = SymbolNavigationAction._allSymbolNavigationCommands.get(altActionId);
                    }
                }
                const referenceCount = references.references.length;
                if (referenceCount === 0) {
                    // no result -> show message
                    if (!this.configuration.muteMessage) {
                        const info = model.getWordAtPosition(position);
                        messageController_1.MessageController.get(editor)?.showMessage(this._getNoResultFoundMessage(info), position);
                    }
                }
                else if (referenceCount === 1 && altAction) {
                    // already at the only result, run alternative
                    SymbolNavigationAction._activeAlternativeCommands.add(this.desc.id);
                    instaService.invokeFunction((accessor) => altAction.runEditorCommand(accessor, editor, arg, range).finally(() => {
                        SymbolNavigationAction._activeAlternativeCommands.delete(this.desc.id);
                    }));
                }
                else {
                    // normal results handling
                    return this._onResult(editorService, symbolNavService, editor, references, range);
                }
            }, (err) => {
                // report an error
                notificationService.error(err);
            }).finally(() => {
                cts.dispose();
            });
            progressService.showWhile(promise, 250);
            return promise;
        }
        async _onResult(editorService, symbolNavService, editor, model, range) {
            const gotoLocation = this._getGoToPreference(editor);
            if (!(editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) && (this.configuration.openInPeek || (gotoLocation === 'peek' && model.references.length > 1))) {
                this._openInPeek(editor, model, range);
            }
            else {
                const next = model.firstReference();
                const peek = model.references.length > 1 && gotoLocation === 'gotoAndPeek';
                const targetEditor = await this._openReference(editor, editorService, next, this.configuration.openToSide, !peek);
                if (peek && targetEditor) {
                    this._openInPeek(targetEditor, model, range);
                }
                else {
                    model.dispose();
                }
                // keep remaining locations around when using
                // 'goto'-mode
                if (gotoLocation === 'goto') {
                    symbolNavService.put(next);
                }
            }
        }
        async _openReference(editor, editorService, reference, sideBySide, highlight) {
            // range is the target-selection-range when we have one
            // and the fallback is the 'full' range
            let range = undefined;
            if ((0, languages_1.isLocationLink)(reference)) {
                range = reference.targetSelectionRange;
            }
            if (!range) {
                range = reference.range;
            }
            if (!range) {
                return undefined;
            }
            const targetEditor = await editorService.openCodeEditor({
                resource: reference.uri,
                options: {
                    selection: range_1.Range.collapseToStart(range),
                    selectionRevealType: 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */,
                    selectionSource: "code.jump" /* TextEditorSelectionSource.JUMP */
                }
            }, editor, sideBySide);
            if (!targetEditor) {
                return undefined;
            }
            if (highlight) {
                const modelNow = targetEditor.getModel();
                const decorations = targetEditor.createDecorationsCollection([{ range, options: { description: 'symbol-navigate-action-highlight', className: 'symbolHighlight' } }]);
                setTimeout(() => {
                    if (targetEditor.getModel() === modelNow) {
                        decorations.clear();
                    }
                }, 350);
            }
            return targetEditor;
        }
        _openInPeek(target, model, range) {
            const controller = referencesController_1.ReferencesController.get(target);
            if (controller && target.hasModel()) {
                controller.toggleWidget(range ?? target.getSelection(), (0, async_1.createCancelablePromise)(_ => Promise.resolve(model)), this.configuration.openInPeek);
            }
            else {
                model.dispose();
            }
        }
    }
    exports.SymbolNavigationAction = SymbolNavigationAction;
    //#region --- DEFINITION
    class DefinitionAction extends SymbolNavigationAction {
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getDefinitionsAtPosition)(languageFeaturesService.definitionProvider, model, position, token), nls.localize('def.title', 'Definitions'));
        }
        _getNoResultFoundMessage(info) {
            return info && info.word
                ? nls.localize('noResultWord', "No definition found for '{0}'", info.word)
                : nls.localize('generic.noResults', "No definition found");
        }
        _getAlternativeCommand(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeDefinitionCommand;
        }
        _getGoToPreference(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleDefinitions;
        }
    }
    exports.DefinitionAction = DefinitionAction;
    (0, actions_1.registerAction2)(class GoToDefinitionAction extends DefinitionAction {
        static { this.id = 'editor.action.revealDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToDefinitionAction.id,
                title: {
                    value: nls.localize('actions.goToDecl.label', "Go to Definition"),
                    original: 'Go to Definition',
                    mnemonicTitle: nls.localize({ key: 'miGotoDefinition', comment: ['&& denotes a mnemonic'] }, "Go to &&Definition")
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: [{
                        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                        primary: 70 /* KeyCode.F12 */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, contextkeys_1.IsWebContext),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 70 /* KeyCode.F12 */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }],
                menu: [{
                        id: actions_1.MenuId.EditorContext,
                        group: 'navigation',
                        order: 1.1
                    }, {
                        id: actions_1.MenuId.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 2,
                    }]
            });
            commands_1.CommandsRegistry.registerCommandAlias('editor.action.goToDeclaration', GoToDefinitionAction.id);
        }
    });
    (0, actions_1.registerAction2)(class OpenDefinitionToSideAction extends DefinitionAction {
        static { this.id = 'editor.action.revealDefinitionAside'; }
        constructor() {
            super({
                openToSide: true,
                openInPeek: false,
                muteMessage: false
            }, {
                id: OpenDefinitionToSideAction.id,
                title: {
                    value: nls.localize('actions.goToDeclToSide.label', "Open Definition to the Side"),
                    original: 'Open Definition to the Side'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: [{
                        when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 70 /* KeyCode.F12 */),
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, contextkeys_1.IsWebContext),
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 70 /* KeyCode.F12 */),
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }]
            });
            commands_1.CommandsRegistry.registerCommandAlias('editor.action.openDeclarationToTheSide', OpenDefinitionToSideAction.id);
        }
    });
    (0, actions_1.registerAction2)(class PeekDefinitionAction extends DefinitionAction {
        static { this.id = 'editor.action.peekDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: PeekDefinitionAction.id,
                title: {
                    value: nls.localize('actions.previewDecl.label', "Peek Definition"),
                    original: 'Peek Definition'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 70 /* KeyCode.F12 */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 68 /* KeyCode.F10 */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'peek',
                    order: 2
                }
            });
            commands_1.CommandsRegistry.registerCommandAlias('editor.action.previewDeclaration', PeekDefinitionAction.id);
        }
    });
    //#endregion
    //#region --- DECLARATION
    class DeclarationAction extends SymbolNavigationAction {
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getDeclarationsAtPosition)(languageFeaturesService.declarationProvider, model, position, token), nls.localize('decl.title', 'Declarations'));
        }
        _getNoResultFoundMessage(info) {
            return info && info.word
                ? nls.localize('decl.noResultWord', "No declaration found for '{0}'", info.word)
                : nls.localize('decl.generic.noResults', "No declaration found");
        }
        _getAlternativeCommand(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeDeclarationCommand;
        }
        _getGoToPreference(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleDeclarations;
        }
    }
    (0, actions_1.registerAction2)(class GoToDeclarationAction extends DeclarationAction {
        static { this.id = 'editor.action.revealDeclaration'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToDeclarationAction.id,
                title: {
                    value: nls.localize('actions.goToDeclaration.label', "Go to Declaration"),
                    original: 'Go to Declaration',
                    mnemonicTitle: nls.localize({ key: 'miGotoDeclaration', comment: ['&& denotes a mnemonic'] }, "Go to &&Declaration")
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDeclarationProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: [{
                        id: actions_1.MenuId.EditorContext,
                        group: 'navigation',
                        order: 1.3
                    }, {
                        id: actions_1.MenuId.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 3,
                    }],
            });
        }
        _getNoResultFoundMessage(info) {
            return info && info.word
                ? nls.localize('decl.noResultWord', "No declaration found for '{0}'", info.word)
                : nls.localize('decl.generic.noResults', "No declaration found");
        }
    });
    (0, actions_1.registerAction2)(class PeekDeclarationAction extends DeclarationAction {
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: 'editor.action.peekDeclaration',
                title: {
                    value: nls.localize('actions.peekDecl.label', "Peek Declaration"),
                    original: 'Peek Declaration'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDeclarationProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'peek',
                    order: 3
                }
            });
        }
    });
    //#endregion
    //#region --- TYPE DEFINITION
    class TypeDefinitionAction extends SymbolNavigationAction {
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getTypeDefinitionsAtPosition)(languageFeaturesService.typeDefinitionProvider, model, position, token), nls.localize('typedef.title', 'Type Definitions'));
        }
        _getNoResultFoundMessage(info) {
            return info && info.word
                ? nls.localize('goToTypeDefinition.noResultWord', "No type definition found for '{0}'", info.word)
                : nls.localize('goToTypeDefinition.generic.noResults', "No type definition found");
        }
        _getAlternativeCommand(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeTypeDefinitionCommand;
        }
        _getGoToPreference(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleTypeDefinitions;
        }
    }
    (0, actions_1.registerAction2)(class GoToTypeDefinitionAction extends TypeDefinitionAction {
        static { this.ID = 'editor.action.goToTypeDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToTypeDefinitionAction.ID,
                title: {
                    value: nls.localize('actions.goToTypeDefinition.label', "Go to Type Definition"),
                    original: 'Go to Type Definition',
                    mnemonicTitle: nls.localize({ key: 'miGotoTypeDefinition', comment: ['&& denotes a mnemonic'] }, "Go to &&Type Definition")
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 0,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: [{
                        id: actions_1.MenuId.EditorContext,
                        group: 'navigation',
                        order: 1.4
                    }, {
                        id: actions_1.MenuId.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 3,
                    }]
            });
        }
    });
    (0, actions_1.registerAction2)(class PeekTypeDefinitionAction extends TypeDefinitionAction {
        static { this.ID = 'editor.action.peekTypeDefinition'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: PeekTypeDefinitionAction.ID,
                title: {
                    value: nls.localize('actions.peekTypeDefinition.label', "Peek Type Definition"),
                    original: 'Peek Type Definition'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'peek',
                    order: 4
                }
            });
        }
    });
    //#endregion
    //#region --- IMPLEMENTATION
    class ImplementationAction extends SymbolNavigationAction {
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getImplementationsAtPosition)(languageFeaturesService.implementationProvider, model, position, token), nls.localize('impl.title', 'Implementations'));
        }
        _getNoResultFoundMessage(info) {
            return info && info.word
                ? nls.localize('goToImplementation.noResultWord', "No implementation found for '{0}'", info.word)
                : nls.localize('goToImplementation.generic.noResults', "No implementation found");
        }
        _getAlternativeCommand(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeImplementationCommand;
        }
        _getGoToPreference(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleImplementations;
        }
    }
    (0, actions_1.registerAction2)(class GoToImplementationAction extends ImplementationAction {
        static { this.ID = 'editor.action.goToImplementation'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: GoToImplementationAction.ID,
                title: {
                    value: nls.localize('actions.goToImplementation.label', "Go to Implementations"),
                    original: 'Go to Implementations',
                    mnemonicTitle: nls.localize({ key: 'miGotoImplementation', comment: ['&& denotes a mnemonic'] }, "Go to &&Implementations")
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasImplementationProvider, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 70 /* KeyCode.F12 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: [{
                        id: actions_1.MenuId.EditorContext,
                        group: 'navigation',
                        order: 1.45
                    }, {
                        id: actions_1.MenuId.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 4,
                    }]
            });
        }
    });
    (0, actions_1.registerAction2)(class PeekImplementationAction extends ImplementationAction {
        static { this.ID = 'editor.action.peekImplementation'; }
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: PeekImplementationAction.ID,
                title: {
                    value: nls.localize('actions.peekImplementation.label', "Peek Implementations"),
                    original: 'Peek Implementations'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasImplementationProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 70 /* KeyCode.F12 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'peek',
                    order: 5
                }
            });
        }
    });
    //#endregion
    //#region --- REFERENCES
    class ReferencesAction extends SymbolNavigationAction {
        _getNoResultFoundMessage(info) {
            return info
                ? nls.localize('references.no', "No references found for '{0}'", info.word)
                : nls.localize('references.noGeneric', "No references found");
        }
        _getAlternativeCommand(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).alternativeReferenceCommand;
        }
        _getGoToPreference(editor) {
            return editor.getOption(58 /* EditorOption.gotoLocation */).multipleReferences;
        }
    }
    (0, actions_1.registerAction2)(class GoToReferencesAction extends ReferencesAction {
        constructor() {
            super({
                openToSide: false,
                openInPeek: false,
                muteMessage: false
            }, {
                id: 'editor.action.goToReferences',
                title: {
                    value: nls.localize('goToReferences.label', "Go to References"),
                    original: 'Go to References',
                    mnemonicTitle: nls.localize({ key: 'miGotoReference', comment: ['&& denotes a mnemonic'] }, "Go to &&References")
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasReferenceProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 70 /* KeyCode.F12 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: [{
                        id: actions_1.MenuId.EditorContext,
                        group: 'navigation',
                        order: 1.45
                    }, {
                        id: actions_1.MenuId.MenubarGoMenu,
                        precondition: null,
                        group: '4_symbol_nav',
                        order: 5,
                    }]
            });
        }
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getReferencesAtPosition)(languageFeaturesService.referenceProvider, model, position, true, token), nls.localize('ref.title', 'References'));
        }
    });
    (0, actions_1.registerAction2)(class PeekReferencesAction extends ReferencesAction {
        constructor() {
            super({
                openToSide: false,
                openInPeek: true,
                muteMessage: false
            }, {
                id: 'editor.action.referenceSearch.trigger',
                title: {
                    value: nls.localize('references.action.label', "Peek References"),
                    original: 'Peek References'
                },
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasReferenceProvider, peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'peek',
                    order: 6
                }
            });
        }
        async _getLocationModel(languageFeaturesService, model, position, token) {
            return new referencesModel_1.ReferencesModel(await (0, goToSymbol_1.getReferencesAtPosition)(languageFeaturesService.referenceProvider, model, position, false, token), nls.localize('ref.title', 'References'));
        }
    });
    //#endregion
    //#region --- GENERIC goto symbols command
    class GenericGoToLocationAction extends SymbolNavigationAction {
        constructor(config, _references, _gotoMultipleBehaviour) {
            super(config, {
                id: 'editor.action.goToLocation',
                title: {
                    value: nls.localize('label.generic', "Go to Any Symbol"),
                    original: 'Go to Any Symbol'
                },
                precondition: contextkey_1.ContextKeyExpr.and(peekView_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInWalkThroughSnippet.toNegated()),
            });
            this._references = _references;
            this._gotoMultipleBehaviour = _gotoMultipleBehaviour;
        }
        async _getLocationModel(languageFeaturesService, _model, _position, _token) {
            return new referencesModel_1.ReferencesModel(this._references, nls.localize('generic.title', 'Locations'));
        }
        _getNoResultFoundMessage(info) {
            return info && nls.localize('generic.noResult', "No results for '{0}'", info.word) || '';
        }
        _getGoToPreference(editor) {
            return this._gotoMultipleBehaviour ?? editor.getOption(58 /* EditorOption.gotoLocation */).multipleReferences;
        }
        _getAlternativeCommand() { return ''; }
    }
    commands_1.CommandsRegistry.registerCommand({
        id: 'editor.action.goToLocations',
        metadata: {
            description: 'Go to locations from a position in a file',
            args: [
                { name: 'uri', description: 'The text document in which to start', constraint: uri_1.URI },
                { name: 'position', description: 'The position at which to start', constraint: corePosition.Position.isIPosition },
                { name: 'locations', description: 'An array of locations.', constraint: Array },
                { name: 'multiple', description: 'Define what to do when having multiple results, either `peek`, `gotoAndPeek`, or `goto`' },
                { name: 'noResultsMessage', description: 'Human readable message that shows when locations is empty.' },
            ]
        },
        handler: async (accessor, resource, position, references, multiple, noResultsMessage, openInPeek) => {
            (0, types_1.assertType)(uri_1.URI.isUri(resource));
            (0, types_1.assertType)(corePosition.Position.isIPosition(position));
            (0, types_1.assertType)(Array.isArray(references));
            (0, types_1.assertType)(typeof multiple === 'undefined' || typeof multiple === 'string');
            (0, types_1.assertType)(typeof openInPeek === 'undefined' || typeof openInPeek === 'boolean');
            const editorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const editor = await editorService.openCodeEditor({ resource }, editorService.getFocusedCodeEditor());
            if ((0, editorBrowser_1.isCodeEditor)(editor)) {
                editor.setPosition(position);
                editor.revealPositionInCenterIfOutsideViewport(position, 0 /* ScrollType.Smooth */);
                return editor.invokeWithinContext(accessor => {
                    const command = new class extends GenericGoToLocationAction {
                        _getNoResultFoundMessage(info) {
                            return noResultsMessage || super._getNoResultFoundMessage(info);
                        }
                    }({
                        muteMessage: !Boolean(noResultsMessage),
                        openInPeek: Boolean(openInPeek),
                        openToSide: false
                    }, references, multiple);
                    accessor.get(instantiation_1.IInstantiationService).invokeFunction(command.run.bind(command), editor);
                });
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'editor.action.peekLocations',
        metadata: {
            description: 'Peek locations from a position in a file',
            args: [
                { name: 'uri', description: 'The text document in which to start', constraint: uri_1.URI },
                { name: 'position', description: 'The position at which to start', constraint: corePosition.Position.isIPosition },
                { name: 'locations', description: 'An array of locations.', constraint: Array },
                { name: 'multiple', description: 'Define what to do when having multiple results, either `peek`, `gotoAndPeek`, or `goto`' },
            ]
        },
        handler: async (accessor, resource, position, references, multiple) => {
            accessor.get(commands_1.ICommandService).executeCommand('editor.action.goToLocations', resource, position, references, multiple, undefined, true);
        }
    });
    //#endregion
    //#region --- REFERENCE search special commands
    commands_1.CommandsRegistry.registerCommand({
        id: 'editor.action.findReferences',
        handler: (accessor, resource, position) => {
            (0, types_1.assertType)(uri_1.URI.isUri(resource));
            (0, types_1.assertType)(corePosition.Position.isIPosition(position));
            const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            return codeEditorService.openCodeEditor({ resource }, codeEditorService.getFocusedCodeEditor()).then(control => {
                if (!(0, editorBrowser_1.isCodeEditor)(control) || !control.hasModel()) {
                    return undefined;
                }
                const controller = referencesController_1.ReferencesController.get(control);
                if (!controller) {
                    return undefined;
                }
                const references = (0, async_1.createCancelablePromise)(token => (0, goToSymbol_1.getReferencesAtPosition)(languageFeaturesService.referenceProvider, control.getModel(), corePosition.Position.lift(position), false, token).then(references => new referencesModel_1.ReferencesModel(references, nls.localize('ref.title', 'References'))));
                const range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
                return Promise.resolve(controller.toggleWidget(range, references, false));
            });
        }
    });
    // use NEW command
    commands_1.CommandsRegistry.registerCommandAlias('editor.action.showReferences', 'editor.action.peekLocations');
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29Ub0NvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9nb3RvU3ltYm9sL2Jyb3dzZXIvZ29Ub0NvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXdDaEcsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxhQUFhLEVBQWdCO1FBQy9ELE9BQU8sRUFBRSxnQkFBTSxDQUFDLGlCQUFpQjtRQUNqQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO1FBQzNDLEtBQUssRUFBRSxZQUFZO1FBQ25CLEtBQUssRUFBRSxHQUFHO0tBQ1YsQ0FBQyxDQUFDO0lBUUgsTUFBYSxzQkFBc0I7UUFFbEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFVO1lBQ25CLElBQUksQ0FBQyxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ3pDLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELElBQUksS0FBSyxZQUFZLHNCQUFzQixFQUFFLENBQUM7Z0JBQzdDLE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztZQUNELElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQTBCLEtBQU0sQ0FBQyxRQUFRLENBQUMsSUFBNkIsS0FBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUMxSCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxZQUFxQixLQUFpQixFQUFXLFFBQStCO1lBQTNELFVBQUssR0FBTCxLQUFLLENBQVk7WUFBVyxhQUFRLEdBQVIsUUFBUSxDQUF1QjtRQUFJLENBQUM7S0FDckY7SUFoQkQsd0RBZ0JDO0lBRUQsTUFBc0Isc0JBQXVCLFNBQVEsZ0NBQWE7aUJB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