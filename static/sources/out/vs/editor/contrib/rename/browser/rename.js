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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/bulkEditService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/services/textResourceConfiguration", "vs/editor/contrib/message/browser/messageController", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "./renameInputField", "vs/editor/common/services/languageFeatures"], function (require, exports, aria_1, async_1, cancellation_1, errors_1, lifecycle_1, types_1, uri_1, editorState_1, editorExtensions_1, bulkEditService_1, codeEditorService_1, position_1, range_1, editorContextKeys_1, textResourceConfiguration_1, messageController_1, nls, configurationRegistry_1, contextkey_1, instantiation_1, log_1, notification_1, progress_1, platform_1, renameInputField_1, languageFeatures_1) {
    "use strict";
    var RenameController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenameAction = exports.rename = void 0;
    class RenameSkeleton {
        constructor(model, position, registry) {
            this.model = model;
            this.position = position;
            this._providerRenameIdx = 0;
            this._providers = registry.ordered(model);
        }
        hasProvider() {
            return this._providers.length > 0;
        }
        async resolveRenameLocation(token) {
            const rejects = [];
            for (this._providerRenameIdx = 0; this._providerRenameIdx < this._providers.length; this._providerRenameIdx++) {
                const provider = this._providers[this._providerRenameIdx];
                if (!provider.resolveRenameLocation) {
                    break;
                }
                const res = await provider.resolveRenameLocation(this.model, this.position, token);
                if (!res) {
                    continue;
                }
                if (res.rejectReason) {
                    rejects.push(res.rejectReason);
                    continue;
                }
                return res;
            }
            // we are here when no provider prepared a location which means we can
            // just rely on the word under cursor and start with the first provider
            this._providerRenameIdx = 0;
            const word = this.model.getWordAtPosition(this.position);
            if (!word) {
                return {
                    range: range_1.Range.fromPositions(this.position),
                    text: '',
                    rejectReason: rejects.length > 0 ? rejects.join('\n') : undefined
                };
            }
            return {
                range: new range_1.Range(this.position.lineNumber, word.startColumn, this.position.lineNumber, word.endColumn),
                text: word.word,
                rejectReason: rejects.length > 0 ? rejects.join('\n') : undefined
            };
        }
        async provideRenameEdits(newName, token) {
            return this._provideRenameEdits(newName, this._providerRenameIdx, [], token);
        }
        async _provideRenameEdits(newName, i, rejects, token) {
            const provider = this._providers[i];
            if (!provider) {
                return {
                    edits: [],
                    rejectReason: rejects.join('\n')
                };
            }
            const result = await provider.provideRenameEdits(this.model, this.position, newName, token);
            if (!result) {
                return this._provideRenameEdits(newName, i + 1, rejects.concat(nls.localize('no result', "No result.")), token);
            }
            else if (result.rejectReason) {
                return this._provideRenameEdits(newName, i + 1, rejects.concat(result.rejectReason), token);
            }
            return result;
        }
    }
    async function rename(registry, model, position, newName) {
        const skeleton = new RenameSkeleton(model, position, registry);
        const loc = await skeleton.resolveRenameLocation(cancellation_1.CancellationToken.None);
        if (loc?.rejectReason) {
            return { edits: [], rejectReason: loc.rejectReason };
        }
        return skeleton.provideRenameEdits(newName, cancellation_1.CancellationToken.None);
    }
    exports.rename = rename;
    // ---  register actions and commands
    let RenameController = class RenameController {
        static { RenameController_1 = this; }
        static { this.ID = 'editor.contrib.renameController'; }
        static get(editor) {
            return editor.getContribution(RenameController_1.ID);
        }
        constructor(editor, _instaService, _notificationService, _bulkEditService, _progressService, _logService, _configService, _languageFeaturesService) {
            this.editor = editor;
            this._instaService = _instaService;
            this._notificationService = _notificationService;
            this._bulkEditService = _bulkEditService;
            this._progressService = _progressService;
            this._logService = _logService;
            this._configService = _configService;
            this._languageFeaturesService = _languageFeaturesService;
            this._disposableStore = new lifecycle_1.DisposableStore();
            this._cts = new cancellation_1.CancellationTokenSource();
            this._renameInputField = this._disposableStore.add(this._instaService.createInstance(renameInputField_1.RenameInputField, this.editor, ['acceptRenameInput', 'acceptRenameInputWithPreview']));
        }
        dispose() {
            this._disposableStore.dispose();
            this._cts.dispose(true);
        }
        async run() {
            // set up cancellation token to prevent reentrant rename, this
            // is the parent to the resolve- and rename-tokens
            this._cts.dispose(true);
            this._cts = new cancellation_1.CancellationTokenSource();
            if (!this.editor.hasModel()) {
                return undefined;
            }
            const position = this.editor.getPosition();
            const skeleton = new RenameSkeleton(this.editor.getModel(), position, this._languageFeaturesService.renameProvider);
            if (!skeleton.hasProvider()) {
                return undefined;
            }
            // part 1 - resolve rename location
            const cts1 = new editorState_1.EditorStateCancellationTokenSource(this.editor, 4 /* CodeEditorStateFlag.Position */ | 1 /* CodeEditorStateFlag.Value */, undefined, this._cts.token);
            let loc;
            try {
                const resolveLocationOperation = skeleton.resolveRenameLocation(cts1.token);
                this._progressService.showWhile(resolveLocationOperation, 250);
                loc = await resolveLocationOperation;
            }
            catch (e) {
                messageController_1.MessageController.get(this.editor)?.showMessage(e || nls.localize('resolveRenameLocationFailed', "An unknown error occurred while resolving rename location"), position);
                return undefined;
            }
            finally {
                cts1.dispose();
            }
            if (!loc) {
                return undefined;
            }
            if (loc.rejectReason) {
                messageController_1.MessageController.get(this.editor)?.showMessage(loc.rejectReason, position);
                return undefined;
            }
            if (cts1.token.isCancellationRequested) {
                return undefined;
            }
            // part 2 - do rename at location
            const cts2 = new editorState_1.EditorStateCancellationTokenSource(this.editor, 4 /* CodeEditorStateFlag.Position */ | 1 /* CodeEditorStateFlag.Value */, loc.range, this._cts.token);
            const selection = this.editor.getSelection();
            let selectionStart = 0;
            let selectionEnd = loc.text.length;
            if (!range_1.Range.isEmpty(selection) && !range_1.Range.spansMultipleLines(selection) && range_1.Range.containsRange(loc.range, selection)) {
                selectionStart = Math.max(0, selection.startColumn - loc.range.startColumn);
                selectionEnd = Math.min(loc.range.endColumn, selection.endColumn) - loc.range.startColumn;
            }
            const supportPreview = this._bulkEditService.hasPreviewHandler() && this._configService.getValue(this.editor.getModel().uri, 'editor.rename.enablePreview');
            const inputFieldResult = await this._renameInputField.getInput(loc.range, loc.text, selectionStart, selectionEnd, supportPreview, cts2.token);
            // no result, only hint to focus the editor or not
            if (typeof inputFieldResult === 'boolean') {
                if (inputFieldResult) {
                    this.editor.focus();
                }
                cts2.dispose();
                return undefined;
            }
            this.editor.focus();
            const renameOperation = (0, async_1.raceCancellation)(skeleton.provideRenameEdits(inputFieldResult.newName, cts2.token), cts2.token).then(async (renameResult) => {
                if (!renameResult || !this.editor.hasModel()) {
                    return;
                }
                if (renameResult.rejectReason) {
                    this._notificationService.info(renameResult.rejectReason);
                    return;
                }
                // collapse selection to active end
                this.editor.setSelection(range_1.Range.fromPositions(this.editor.getSelection().getPosition()));
                this._bulkEditService.apply(renameResult, {
                    editor: this.editor,
                    showPreview: inputFieldResult.wantsPreview,
                    label: nls.localize('label', "Renaming '{0}' to '{1}'", loc?.text, inputFieldResult.newName),
                    code: 'undoredo.rename',
                    quotableLabel: nls.localize('quotableLabel', "Renaming {0} to {1}", loc?.text, inputFieldResult.newName),
                    respectAutoSaveConfig: true
                }).then(result => {
                    if (result.ariaSummary) {
                        (0, aria_1.alert)(nls.localize('aria', "Successfully renamed '{0}' to '{1}'. Summary: {2}", loc.text, inputFieldResult.newName, result.ariaSummary));
                    }
                }).catch(err => {
                    this._notificationService.error(nls.localize('rename.failedApply', "Rename failed to apply edits"));
                    this._logService.error(err);
                });
            }, err => {
                this._notificationService.error(nls.localize('rename.failed', "Rename failed to compute edits"));
                this._logService.error(err);
            }).finally(() => {
                cts2.dispose();
            });
            this._progressService.showWhile(renameOperation, 250);
            return renameOperation;
        }
        acceptRenameInput(wantsPreview) {
            this._renameInputField.acceptInput(wantsPreview);
        }
        cancelRenameInput() {
            this._renameInputField.cancelInput(true);
        }
    };
    RenameController = RenameController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, notification_1.INotificationService),
        __param(3, bulkEditService_1.IBulkEditService),
        __param(4, progress_1.IEditorProgressService),
        __param(5, log_1.ILogService),
        __param(6, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(7, languageFeatures_1.ILanguageFeaturesService)
    ], RenameController);
    // ---- action implementation
    class RenameAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.rename',
                label: nls.localize('rename.label', "Rename Symbol"),
                alias: 'Rename Symbol',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasRenameProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 60 /* KeyCode.F2 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.1
                }
            });
        }
        runCommand(accessor, args) {
            const editorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const [uri, pos] = Array.isArray(args) && args || [undefined, undefined];
            if (uri_1.URI.isUri(uri) && position_1.Position.isIPosition(pos)) {
                return editorService.openCodeEditor({ resource: uri }, editorService.getActiveCodeEditor()).then(editor => {
                    if (!editor) {
                        return;
                    }
                    editor.setPosition(pos);
                    editor.invokeWithinContext(accessor => {
                        this.reportTelemetry(accessor, editor);
                        return this.run(accessor, editor);
                    });
                }, errors_1.onUnexpectedError);
            }
            return super.runCommand(accessor, args);
        }
        run(accessor, editor) {
            const controller = RenameController.get(editor);
            if (controller) {
                return controller.run();
            }
            return Promise.resolve();
        }
    }
    exports.RenameAction = RenameAction;
    (0, editorExtensions_1.registerEditorContribution)(RenameController.ID, RenameController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.registerEditorAction)(RenameAction);
    const RenameCommand = editorExtensions_1.EditorCommand.bindToContribution(RenameController.get);
    (0, editorExtensions_1.registerEditorCommand)(new RenameCommand({
        id: 'acceptRenameInput',
        precondition: renameInputField_1.CONTEXT_RENAME_INPUT_VISIBLE,
        handler: x => x.acceptRenameInput(false),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 99,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.ContextKeyExpr.not('isComposing')),
            primary: 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new RenameCommand({
        id: 'acceptRenameInputWithPreview',
        precondition: contextkey_1.ContextKeyExpr.and(renameInputField_1.CONTEXT_RENAME_INPUT_VISIBLE, contextkey_1.ContextKeyExpr.has('config.editor.rename.enablePreview')),
        handler: x => x.acceptRenameInput(true),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 99,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.ContextKeyExpr.not('isComposing')),
            primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new RenameCommand({
        id: 'cancelRenameInput',
        precondition: renameInputField_1.CONTEXT_RENAME_INPUT_VISIBLE,
        handler: x => x.cancelRenameInput(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 99,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    // ---- api bridge command
    (0, editorExtensions_1.registerModelAndPositionCommand)('_executeDocumentRenameProvider', function (accessor, model, position, ...args) {
        const [newName] = args;
        (0, types_1.assertType)(typeof newName === 'string');
        const { renameProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        return rename(renameProvider, model, position, newName);
    });
    (0, editorExtensions_1.registerModelAndPositionCommand)('_executePrepareRename', async function (accessor, model, position) {
        const { renameProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const skeleton = new RenameSkeleton(model, position, renameProvider);
        const loc = await skeleton.resolveRenameLocation(cancellation_1.CancellationToken.None);
        if (loc?.rejectReason) {
            throw new Error(loc.rejectReason);
        }
        return loc;
    });
    //todo@jrieken use editor options world
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'editor',
        properties: {
            'editor.rename.enablePreview': {
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                description: nls.localize('enablePreview', "Enable/disable the ability to preview changes before renaming"),
                default: true,
                type: 'boolean'
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuYW1lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9yZW5hbWUvYnJvd3Nlci9yZW5hbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9DaEcsTUFBTSxjQUFjO1FBS25CLFlBQ2tCLEtBQWlCLEVBQ2pCLFFBQWtCLEVBQ25DLFFBQWlEO1lBRmhDLFVBQUssR0FBTCxLQUFLLENBQVk7WUFDakIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUo1Qix1QkFBa0IsR0FBVyxDQUFDLENBQUM7WUFPdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxXQUFXO1lBQ1YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxLQUF3QjtZQUVuRCxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7WUFFN0IsS0FBSyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDO2dCQUMvRyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUM7b0JBQ3JDLE1BQU07Z0JBQ1AsQ0FBQztnQkFDRCxNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxD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