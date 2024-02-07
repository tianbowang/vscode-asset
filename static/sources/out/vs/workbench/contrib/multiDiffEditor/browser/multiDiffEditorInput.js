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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/observable", "vs/base/common/observableInternal/utils", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/widget/multiDiffEditorWidget/model", "vs/editor/browser/widget/multiDiffEditorWidget/multiDiffEditorViewModel", "vs/editor/common/services/resolverService", "vs/editor/common/services/textResourceConfiguration", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor", "vs/workbench/common/editor/editorInput", "vs/workbench/contrib/multiDiffEditor/browser/icons.contribution", "vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService", "vs/workbench/contrib/multiDiffEditor/browser/utils", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, async_1, errors_1, event_1, lifecycle_1, marshalling_1, network_1, objects_1, observable_1, utils_1, types_1, uri_1, model_1, multiDiffEditorViewModel_1, resolverService_1, textResourceConfiguration_1, nls_1, instantiation_1, editor_1, editorInput_1, icons_contribution_1, multiDiffSourceResolverService_1, utils_2, editorResolverService_1, textfiles_1) {
    "use strict";
    var MultiDiffEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MultiDiffEditorSerializer = exports.MultiDiffEditorResolverContribution = exports.MultiDiffEditorInput = void 0;
    /* hot-reload:patch-prototype-methods */
    let MultiDiffEditorInput = class MultiDiffEditorInput extends editorInput_1.EditorInput {
        static { MultiDiffEditorInput_1 = this; }
        static fromResourceMultiDiffEditorInput(input, instantiationService) {
            if (!input.multiDiffSource && !input.resources) {
                throw new errors_1.BugIndicatingError('MultiDiffEditorInput requires either multiDiffSource or resources');
            }
            const multiDiffSource = input.multiDiffSource ?? uri_1.URI.parse(`multi-diff-editor:${new Date().getMilliseconds().toString() + Math.random().toString()}`);
            return instantiationService.createInstance(MultiDiffEditorInput_1, multiDiffSource, input.label, input.resources?.map(resource => {
                return new multiDiffSourceResolverService_1.MultiDiffEditorItem(resource.original.resource, resource.modified.resource);
            }));
        }
        static fromSerialized(data, instantiationService) {
            return instantiationService.createInstance(MultiDiffEditorInput_1, uri_1.URI.parse(data.multiDiffSourceUri), data.label, data.resources?.map(resource => new multiDiffSourceResolverService_1.MultiDiffEditorItem(resource.originalUri ? uri_1.URI.parse(resource.originalUri) : undefined, resource.modifiedUri ? uri_1.URI.parse(resource.modifiedUri) : undefined)));
        }
        static { this.ID = 'workbench.input.multiDiffEditor'; }
        get resource() { return this.multiDiffSource; }
        get capabilities() { return 2 /* EditorInputCapabilities.Readonly */; }
        get typeId() { return MultiDiffEditorInput_1.ID; }
        getName() { return this._name; }
        get editorId() { return editor_1.DEFAULT_EDITOR_ASSOCIATION.id; }
        getIcon() { return icons_contribution_1.MultiDiffEditorIcon; }
        constructor(multiDiffSource, label, initialResources, _textModelService, _textResourceConfigurationService, _instantiationService, _multiDiffSourceResolverService, _textFileService) {
            super();
            this.multiDiffSource = multiDiffSource;
            this.label = label;
            this.initialResources = initialResources;
            this._textModelService = _textModelService;
            this._textResourceConfigurationService = _textResourceConfigurationService;
            this._instantiationService = _instantiationService;
            this._multiDiffSourceResolverService = _multiDiffSourceResolverService;
            this._textFileService = _textFileService;
            this._name = '';
            this._viewModel = new async_1.LazyStatefulPromise(async () => {
                const model = await this._createModel();
                this._register(model);
                const vm = new multiDiffEditorViewModel_1.MultiDiffEditorViewModel(model, this._instantiationService);
                this._register(vm);
                await (0, async_1.raceTimeout)(vm.waitForDiffs(), 1000);
                return vm;
            });
            this._resolvedSource = new utils_2.ObservableLazyStatefulPromise(async () => {
                const source = this.initialResources
                    ? new multiDiffSourceResolverService_1.ConstResolvedMultiDiffSource(this.initialResources)
                    : await this._multiDiffSourceResolverService.resolve(this.multiDiffSource);
                return {
                    source,
                    resources: source ? (0, observable_1.observableFromEvent)(source.onDidChange, () => source.resources) : (0, utils_1.constObservable)([]),
                };
            });
            this._resources = (0, observable_1.derived)(this, reader => this._resolvedSource.cachedValue.read(reader)?.value?.resources.read(reader));
            this._isDirtyObservables = (0, utils_1.mapObservableArrayCached)(this, this._resources.map(r => r || []), res => {
                const isModifiedDirty = res.modified ? isUriDirty(this._textFileService, res.modified) : (0, utils_1.constObservable)(false);
                const isOriginalDirty = res.original ? isUriDirty(this._textFileService, res.original) : (0, utils_1.constObservable)(false);
                return (0, observable_1.derived)(reader => /** @description modifiedDirty||originalDirty */ isModifiedDirty.read(reader) || isOriginalDirty.read(reader));
            }, i => JSON.stringify([i.modified?.toString(), i.original?.toString()]));
            this._isDirtyObservable = (0, observable_1.derived)(this, reader => this._isDirtyObservables.read(reader).some(isDirty => isDirty.read(reader)))
                .keepObserved(this._store);
            this.onDidChangeDirty = event_1.Event.fromObservableLight(this._isDirtyObservable);
            this.closeHandler = {
                // TODO@bpasero TODO@hediet this is a workaround for
                // not having a better way to figure out if the
                // editors this input wraps around are opened or not
                async confirm() {
                    return 1 /* ConfirmResult.DONT_SAVE */;
                },
                showConfirm() {
                    return false;
                }
            };
            this._register((0, observable_1.autorun)((reader) => {
                /** @description Updates name */
                const resources = this._resources.read(reader) ?? [];
                const label = this.label ?? (0, nls_1.localize)('name', "Multi Diff Editor");
                this._name = label + (0, nls_1.localize)('files', " ({0} files)", resources?.length ?? 0);
                this._onDidChangeLabel.fire();
            }));
        }
        serialize() {
            return {
                label: this.label,
                multiDiffSourceUri: this.multiDiffSource.toString(),
                resources: this.initialResources?.map(resource => ({
                    originalUri: resource.original?.toString(),
                    modifiedUri: resource.modified?.toString(),
                })),
            };
        }
        setLanguageId(languageId, source) {
            const activeDiffItem = this._viewModel.requireValue().activeDiffItem.get();
            const value = activeDiffItem?.entry?.value;
            if (!value) {
                return;
            }
            const target = value.modified ?? value.original;
            if (!target) {
                return;
            }
            target.setLanguage(languageId, source);
        }
        async getViewModel() {
            return this._viewModel.getPromise();
        }
        async _createModel() {
            const source = await this._resolvedSource.getValue();
            const textResourceConfigurationService = this._textResourceConfigurationService;
            // Enables delayed disposing
            const garbage = new lifecycle_1.DisposableStore();
            const documentsWithPromises = (0, utils_1.mapObservableArrayCached)(undefined, source.resources, async (r, store) => {
                /** @description documentsWithPromises */
                let original;
                let modified;
                const store2 = new lifecycle_1.DisposableStore();
                store.add((0, lifecycle_1.toDisposable)(() => {
                    // Mark the text model references as garbage when they get stale (don't dispose them yet)
                    garbage.add(store2);
                }));
                try {
                    [original, modified] = await Promise.all([
                        r.original ? this._textModelService.createModelReference(r.original) : undefined,
                        r.modified ? this._textModelService.createModelReference(r.modified) : undefined,
                    ]);
                    if (original) {
                        store.add(original);
                    }
                    if (modified) {
                        store.add(modified);
                    }
                }
                catch (e) {
                    // e.g. "File seems to be binary and cannot be opened as text"
                    console.error(e);
                    (0, errors_1.onUnexpectedError)(e);
                    return undefined;
                }
                const uri = (r.modified ?? r.original);
                return new model_1.ConstLazyPromise({
                    original: original?.object.textEditorModel,
                    modified: modified?.object.textEditorModel,
                    get options() {
                        return {
                            ...getReadonlyConfiguration(modified?.object.isReadonly() ?? true),
                            ...computeOptions(textResourceConfigurationService.getValue(uri)),
                        };
                    },
                    onOptionsDidChange: h => this._textResourceConfigurationService.onDidChangeConfiguration(e => {
                        if (e.affectsConfiguration(uri, 'editor') || e.affectsConfiguration(uri, 'diffEditor')) {
                            h();
                        }
                    }),
                });
            }, i => JSON.stringify([i.modified?.toString(), i.original?.toString()]));
            let documents = [];
            const documentChangeEmitter = new event_1.Emitter();
            const p = event_1.Event.toPromise(documentChangeEmitter.event);
            const a = (0, observable_1.autorun)(async (reader) => {
                /** @description Update documents */
                const docsPromises = documentsWithPromises.read(reader);
                const docs = await Promise.all(docsPromises);
                documents = docs.filter(types_1.isDefined);
                documentChangeEmitter.fire();
                garbage.clear(); // Only dispose text models after the documents have been updated
            });
            await p;
            return {
                dispose: () => {
                    a.dispose();
                    garbage.dispose();
                },
                onDidChange: documentChangeEmitter.event,
                get documents() { return documents; },
                contextKeys: source.source?.contextKeys,
            };
        }
        matches(otherInput) {
            if (super.matches(otherInput)) {
                return true;
            }
            if (otherInput instanceof MultiDiffEditorInput_1) {
                return this.multiDiffSource.toString() === otherInput.multiDiffSource.toString();
            }
            return false;
        }
        isDirty() { return this._isDirtyObservable.get(); }
        async save(group, options) {
            await this.doSaveOrRevert('save', group, options);
            return this;
        }
        revert(group, options) {
            return this.doSaveOrRevert('revert', group, options);
        }
        async doSaveOrRevert(mode, group, options) {
            const items = this._viewModel.currentValue?.items.get();
            if (items) {
                await Promise.all(items.map(async (item) => {
                    const model = item.diffEditorViewModel.model;
                    const handleOriginal = model.original.uri.scheme !== network_1.Schemas.untitled && this._textFileService.isDirty(model.original.uri); // match diff editor behaviour
                    await Promise.all([
                        handleOriginal ? mode === 'save' ? this._textFileService.save(model.original.uri, options) : this._textFileService.revert(model.original.uri, options) : Promise.resolve(),
                        mode === 'save' ? this._textFileService.save(model.modified.uri, options) : this._textFileService.revert(model.modified.uri, options),
                    ]);
                }));
            }
            return undefined;
        }
    };
    exports.MultiDiffEditorInput = MultiDiffEditorInput;
    exports.MultiDiffEditorInput = MultiDiffEditorInput = MultiDiffEditorInput_1 = __decorate([
        __param(3, resolverService_1.ITextModelService),
        __param(4, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, multiDiffSourceResolverService_1.IMultiDiffSourceResolverService),
        __param(7, textfiles_1.ITextFileService)
    ], MultiDiffEditorInput);
    function isUriDirty(textFileService, uri) {
        return (0, observable_1.observableFromEvent)(event_1.Event.filter(textFileService.files.onDidChangeDirty, e => e.resource.toString() === uri.toString()), () => textFileService.isDirty(uri));
    }
    function getReadonlyConfiguration(isReadonly) {
        return {
            readOnly: !!isReadonly,
            readOnlyMessage: typeof isReadonly !== 'boolean' ? isReadonly : undefined
        };
    }
    function computeOptions(configuration) {
        const editorConfiguration = (0, objects_1.deepClone)(configuration.editor);
        // Handle diff editor specially by merging in diffEditor configuration
        if ((0, types_1.isObject)(configuration.diffEditor)) {
            const diffEditorConfiguration = (0, objects_1.deepClone)(configuration.diffEditor);
            // User settings defines `diffEditor.codeLens`, but here we rename that to `diffEditor.diffCodeLens` to avoid collisions with `editor.codeLens`.
            diffEditorConfiguration.diffCodeLens = diffEditorConfiguration.codeLens;
            delete diffEditorConfiguration.codeLens;
            // User settings defines `diffEditor.wordWrap`, but here we rename that to `diffEditor.diffWordWrap` to avoid collisions with `editor.wordWrap`.
            diffEditorConfiguration.diffWordWrap = diffEditorConfiguration.wordWrap;
            delete diffEditorConfiguration.wordWrap;
            Object.assign(editorConfiguration, diffEditorConfiguration);
        }
        return editorConfiguration;
    }
    let MultiDiffEditorResolverContribution = class MultiDiffEditorResolverContribution extends lifecycle_1.Disposable {
        constructor(editorResolverService, instantiationService) {
            super();
            this._register(editorResolverService.registerEditor(`*`, {
                id: editor_1.DEFAULT_EDITOR_ASSOCIATION.id,
                label: editor_1.DEFAULT_EDITOR_ASSOCIATION.displayName,
                detail: editor_1.DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }, {}, {
                createMultiDiffEditorInput: (diffListEditor) => {
                    return {
                        editor: MultiDiffEditorInput.fromResourceMultiDiffEditorInput(diffListEditor, instantiationService),
                    };
                },
            }));
        }
    };
    exports.MultiDiffEditorResolverContribution = MultiDiffEditorResolverContribution;
    exports.MultiDiffEditorResolverContribution = MultiDiffEditorResolverContribution = __decorate([
        __param(0, editorResolverService_1.IEditorResolverService),
        __param(1, instantiation_1.IInstantiationService)
    ], MultiDiffEditorResolverContribution);
    class MultiDiffEditorSerializer {
        canSerialize(editor) {
            return editor instanceof MultiDiffEditorInput;
        }
        serialize(editor) {
            return JSON.stringify(editor.serialize());
        }
        deserialize(instantiationService, serializedEditor) {
            try {
                const data = (0, marshalling_1.parse)(serializedEditor);
                return MultiDiffEditorInput.fromSerialized(data, instantiationService);
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
                return undefined;
            }
        }
    }
    exports.MultiDiffEditorSerializer = MultiDiffEditorSerializer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlEaWZmRWRpdG9ySW5wdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL211bHRpRGlmZkVkaXRvci9icm93c2VyL211bHRpRGlmZkVkaXRvcklucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFnQ2hHLHdDQUF3QztJQUNqQyxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLHlCQUFXOztRQUM3QyxNQUFNLENBQUMsZ0NBQWdDLENBQUMsS0FBb0MsRUFBRSxvQkFBMkM7WUFDL0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2hELE1BQU0sSUFBSSwyQkFBa0IsQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO1lBQ25HLENBQUM7WUFDRCxNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsZUFBZSxJQUFJLFNBQUcsQ0FBQyxLQUFLLENBQUMscUJBQXFCLElBQUksSUFBSSxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN0SixPQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FDekMsc0JBQW9CLEVBQ3BCLGVBQWUsRUFDZixLQUFLLENBQUMsS0FBSyxFQUNYLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMvQixPQUFPLElBQUksb0RBQW1CLENBQzdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUMxQixRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FDMUIsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUNGLENBQUM7UUFDSCxDQUFDO1FBRU0sTUFBTSxD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