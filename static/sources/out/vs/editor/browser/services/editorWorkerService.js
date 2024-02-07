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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/worker/simpleWorker", "vs/base/browser/defaultWorkerFactory", "vs/editor/common/core/range", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/editorSimpleWorker", "vs/editor/common/services/model", "vs/editor/common/services/textResourceConfiguration", "vs/base/common/arrays", "vs/platform/log/common/log", "vs/base/common/stopwatch", "vs/base/common/errors", "vs/editor/common/services/languageFeatures", "vs/editor/common/diff/linesDiffComputer", "vs/editor/common/diff/rangeMapping", "vs/editor/common/core/lineRange", "vs/base/browser/window", "vs/base/browser/dom"], function (require, exports, async_1, lifecycle_1, simpleWorker_1, defaultWorkerFactory_1, range_1, languageConfigurationRegistry_1, editorSimpleWorker_1, model_1, textResourceConfiguration_1, arrays_1, log_1, stopwatch_1, errors_1, languageFeatures_1, linesDiffComputer_1, rangeMapping_1, lineRange_1, window_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorWorkerClient = exports.EditorWorkerHost = exports.EditorWorkerService = void 0;
    /**
     * Stop syncing a model to the worker if it was not needed for 1 min.
     */
    const STOP_SYNC_MODEL_DELTA_TIME_MS = 60 * 1000;
    /**
     * Stop the worker if it was not needed for 5 min.
     */
    const STOP_WORKER_DELTA_TIME_MS = 5 * 60 * 1000;
    function canSyncModel(modelService, resource) {
        const model = modelService.getModel(resource);
        if (!model) {
            return false;
        }
        if (model.isTooLargeForSyncing()) {
            return false;
        }
        return true;
    }
    let EditorWorkerService = class EditorWorkerService extends lifecycle_1.Disposable {
        constructor(modelService, configurationService, logService, languageConfigurationService, languageFeaturesService) {
            super();
            this._modelService = modelService;
            this._workerManager = this._register(new WorkerManager(this._modelService, languageConfigurationService));
            this._logService = logService;
            // register default link-provider and default completions-provider
            this._register(languageFeaturesService.linkProvider.register({ language: '*', hasAccessToAllModels: true }, {
                provideLinks: (model, token) => {
                    if (!canSyncModel(this._modelService, model.uri)) {
                        return Promise.resolve({ links: [] }); // File too large
                    }
                    return this._workerManager.withWorker().then(client => client.computeLinks(model.uri)).then(links => {
                        return links && { links };
                    });
                }
            }));
            this._register(languageFeaturesService.completionProvider.register('*', new WordBasedCompletionItemProvider(this._workerManager, configurationService, this._modelService, languageConfigurationService)));
        }
        dispose() {
            super.dispose();
        }
        canComputeUnicodeHighlights(uri) {
            return canSyncModel(this._modelService, uri);
        }
        computedUnicodeHighlights(uri, options, range) {
            return this._workerManager.withWorker().then(client => client.computedUnicodeHighlights(uri, options, range));
        }
        async computeDiff(original, modified, options, algorithm) {
            const result = await this._workerManager.withWorker().then(client => client.computeDiff(original, modified, options, algorithm));
            if (!result) {
                return null;
            }
            // Convert from space efficient JSON data to rich objects.
            const diff = {
                identical: result.identical,
                quitEarly: result.quitEarly,
                changes: toLineRangeMappings(result.changes),
                moves: result.moves.map(m => new linesDiffComputer_1.MovedText(new rangeMapping_1.LineRangeMapping(new lineRange_1.LineRange(m[0], m[1]), new lineRange_1.LineRange(m[2], m[3])), toLineRangeMappings(m[4])))
            };
            return diff;
            function toLineRangeMappings(changes) {
                return changes.map((c) => new rangeMapping_1.DetailedLineRangeMapping(new lineRange_1.LineRange(c[0], c[1]), new lineRange_1.LineRange(c[2], c[3]), c[4]?.map((c) => new rangeMapping_1.RangeMapping(new range_1.Range(c[0], c[1], c[2], c[3]), new range_1.Range(c[4], c[5], c[6], c[7])))));
            }
        }
        canComputeDirtyDiff(original, modified) {
            return (canSyncModel(this._modelService, original) && canSyncModel(this._modelService, modified));
        }
        computeDirtyDiff(original, modified, ignoreTrimWhitespace) {
            return this._workerManager.withWorker().then(client => client.computeDirtyDiff(original, modified, ignoreTrimWhitespace));
        }
        computeMoreMinimalEdits(resource, edits, pretty = false) {
            if ((0, arrays_1.isNonEmptyArray)(edits)) {
                if (!canSyncModel(this._modelService, resource)) {
                    return Promise.resolve(edits); // File too large
                }
                const sw = stopwatch_1.StopWatch.create();
                const result = this._workerManager.withWorker().then(client => client.computeMoreMinimalEdits(resource, edits, pretty));
                result.finally(() => this._logService.trace('FORMAT#computeMoreMinimalEdits', resource.toString(true), sw.elapsed()));
                return Promise.race([result, (0, async_1.timeout)(1000).then(() => edits)]);
            }
            else {
                return Promise.resolve(undefined);
            }
        }
        computeHumanReadableDiff(resource, edits) {
            if ((0, arrays_1.isNonEmptyArray)(edits)) {
                if (!canSyncModel(this._modelService, resource)) {
                    return Promise.resolve(edits); // File too large
                }
                const sw = stopwatch_1.StopWatch.create();
                const result = this._workerManager.withWorker().then(client => client.computeHumanReadableDiff(resource, edits, { ignoreTrimWhitespace: false, maxComputationTimeMs: 1000, computeMoves: false, })).catch((err) => {
                    (0, errors_1.onUnexpectedError)(err);
                    // In case of an exception, fall back to computeMoreMinimalEdits
                    return this.computeMoreMinimalEdits(resource, edits, true);
                });
                result.finally(() => this._logService.trace('FORMAT#computeHumanReadableDiff', resource.toString(true), sw.elapsed()));
                return result;
            }
            else {
                return Promise.resolve(undefined);
            }
        }
        canNavigateValueSet(resource) {
            return (canSyncModel(this._modelService, resource));
        }
        navigateValueSet(resource, range, up) {
            return this._workerManager.withWorker().then(client => client.navigateValueSet(resource, range, up));
        }
        canComputeWordRanges(resource) {
            return canSyncModel(this._modelService, resource);
        }
        computeWordRanges(resource, range) {
            return this._workerManager.withWorker().then(client => client.computeWordRanges(resource, range));
        }
    };
    exports.EditorWorkerService = EditorWorkerService;
    exports.EditorWorkerService = EditorWorkerService = __decorate([
        __param(0, model_1.IModelService),
        __param(1, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(2, log_1.ILogService),
        __param(3, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(4, languageFeatures_1.ILanguageFeaturesService)
    ], EditorWorkerService);
    class WordBasedCompletionItemProvider {
        constructor(workerManager, configurationService, modelService, languageConfigurationService) {
            this.languageConfigurationService = languageConfigurationService;
            this._debugDisplayName = 'wordbasedCompletions';
            this._workerManager = workerManager;
            this._configurationService = configurationService;
            this._modelService = modelService;
        }
        async provideCompletionItems(model, position) {
            const config = this._configurationService.getValue(model.uri, position, 'editor');
            if (config.wordBasedSuggestions === 'off') {
                return undefined;
            }
            const models = [];
            if (config.wordBasedSuggestions === 'currentDocument') {
                // only current file and only if not too large
                if (canSyncModel(this._modelService, model.uri)) {
                    models.push(model.uri);
                }
            }
            else {
                // either all files or files of same language
                for (const candidate of this._modelService.getModels()) {
                    if (!canSyncModel(this._modelService, candidate.uri)) {
                        continue;
                    }
                    if (candidate === model) {
                        models.unshift(candidate.uri);
                    }
                    else if (config.wordBasedSuggestions === 'allDocuments' || candidate.getLanguageId() === model.getLanguageId()) {
                        models.push(candidate.uri);
                    }
                }
            }
            if (models.length === 0) {
                return undefined; // File too large, no other files
            }
            const wordDefRegExp = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
            const word = model.getWordAtPosition(position);
            const replace = !word ? range_1.Range.fromPositions(position) : new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
            const insert = replace.setEndPosition(position.lineNumber, position.column);
            const client = await this._workerManager.withWorker();
            const data = await client.textualSuggest(models, word?.word, wordDefRegExp);
            if (!data) {
                return undefined;
            }
            return {
                duration: data.duration,
                suggestions: data.words.map((word) => {
                    return {
                        kind: 18 /* languages.CompletionItemKind.Text */,
                        label: word,
                        insertText: word,
                        range: { insert, replace }
                    };
                }),
            };
        }
    }
    class WorkerManager extends lifecycle_1.Disposable {
        constructor(modelService, languageConfigurationService) {
            super();
            this.languageConfigurationService = languageConfigurationService;
            this._modelService = modelService;
            this._editorWorkerClient = null;
            this._lastWorkerUsedTime = (new Date()).getTime();
            const stopWorkerInterval = this._register(new dom_1.WindowIntervalTimer());
            stopWorkerInterval.cancelAndSet(() => this._checkStopIdleWorker(), Math.round(STOP_WORKER_DELTA_TIME_MS / 2), window_1.$window);
            this._register(this._modelService.onModelRemoved(_ => this._checkStopEmptyWorker()));
        }
        dispose() {
            if (this._editorWorkerClient) {
                this._editorWorkerClient.dispose();
                this._editorWorkerClient = null;
            }
            super.dispose();
        }
        /**
         * Check if the model service has no more models and stop the worker if that is the case.
         */
        _checkStopEmptyWorker() {
            if (!this._editorWorkerClient) {
                return;
            }
            const models = this._modelService.getModels();
            if (models.length === 0) {
                // There are no more models => nothing possible for me to do
                this._editorWorkerClient.dispose();
                this._editorWorkerClient = null;
            }
        }
        /**
         * Check if the worker has been idle for a while and then stop it.
         */
        _checkStopIdleWorker() {
            if (!this._editorWorkerClient) {
                return;
            }
            const timeSinceLastWorkerUsedTime = (new Date()).getTime() - this._lastWorkerUsedTime;
            if (timeSinceLastWorkerUsedTime > STOP_WORKER_DELTA_TIME_MS) {
                this._editorWorkerClient.dispose();
                this._editorWorkerClient = null;
            }
        }
        withWorker() {
            this._lastWorkerUsedTime = (new Date()).getTime();
            if (!this._editorWorkerClient) {
                this._editorWorkerClient = new EditorWorkerClient(this._modelService, false, 'editorWorkerService', this.languageConfigurationService);
            }
            return Promise.resolve(this._editorWorkerClient);
        }
    }
    class EditorModelManager extends lifecycle_1.Disposable {
        constructor(proxy, modelService, keepIdleModels) {
            super();
            this._syncedModels = Object.create(null);
            this._syncedModelsLastUsedTime = Object.create(null);
            this._proxy = proxy;
            this._modelService = modelService;
            if (!keepIdleModels) {
                const timer = new async_1.IntervalTimer();
                timer.cancelAndSet(() => this._checkStopModelSync(), Math.round(STOP_SYNC_MODEL_DELTA_TIME_MS / 2));
                this._register(timer);
            }
        }
        dispose() {
            for (const modelUrl in this._syncedModels) {
                (0, lifecycle_1.dispose)(this._syncedModels[modelUrl]);
            }
            this._syncedModels = Object.create(null);
            this._syncedModelsLastUsedTime = Object.create(null);
            super.dispose();
        }
        ensureSyncedResources(resources, forceLargeModels) {
            for (const resource of resources) {
                const resourceStr = resource.toString();
                if (!this._syncedModels[resourceStr]) {
                    this._beginModelSync(resource, forceLargeModels);
                }
                if (this._syncedModels[resourceStr]) {
                    this._syncedModelsLastUsedTime[resourceStr] = (new Date()).getTime();
                }
            }
        }
        _checkStopModelSync() {
            const currentTime = (new Date()).getTime();
            const toRemove = [];
            for (const modelUrl in this._syncedModelsLastUsedTime) {
                const elapsedTime = currentTime - this._syncedModelsLastUsedTime[modelUrl];
                if (elapsedTime > STOP_SYNC_MODEL_DELTA_TIME_MS) {
                    toRemove.push(modelUrl);
                }
            }
            for (const e of toRemove) {
                this._stopModelSync(e);
            }
        }
        _beginModelSync(resource, forceLargeModels) {
            const model = this._modelService.getModel(resource);
            if (!model) {
                return;
            }
            if (!forceLargeModels && model.isTooLargeForSyncing()) {
                return;
            }
            const modelUrl = resource.toString();
            this._proxy.acceptNewModel({
                url: model.uri.toString(),
                lines: model.getLinesContent(),
                EOL: model.getEOL(),
                versionId: model.getVersionId()
            });
            const toDispose = new lifecycle_1.DisposableStore();
            toDispose.add(model.onDidChangeContent((e) => {
                this._proxy.acceptModelChanged(modelUrl.toString(), e);
            }));
            toDispose.add(model.onWillDispose(() => {
                this._stopModelSync(modelUrl);
            }));
            toDispose.add((0, lifecycle_1.toDisposable)(() => {
                this._proxy.acceptRemovedModel(modelUrl);
            }));
            this._syncedModels[modelUrl] = toDispose;
        }
        _stopModelSync(modelUrl) {
            const toDispose = this._syncedModels[modelUrl];
            delete this._syncedModels[modelUrl];
            delete this._syncedModelsLastUsedTime[modelUrl];
            (0, lifecycle_1.dispose)(toDispose);
        }
    }
    class SynchronousWorkerClient {
        constructor(instance) {
            this._instance = instance;
            this._proxyObj = Promise.resolve(this._instance);
        }
        dispose() {
            this._instance.dispose();
        }
        getProxyObject() {
            return this._proxyObj;
        }
    }
    class EditorWorkerHost {
        constructor(workerClient) {
            this._workerClient = workerClient;
        }
        // foreign host request
        fhr(method, args) {
            return this._workerClient.fhr(method, args);
        }
    }
    exports.EditorWorkerHost = EditorWorkerHost;
    class EditorWorkerClient extends lifecycle_1.Disposable {
        constructor(modelService, keepIdleModels, label, languageConfigurationService) {
            super();
            this.languageConfigurationService = languageConfigurationService;
            this._disposed = false;
            this._modelService = modelService;
            this._keepIdleModels = keepIdleModels;
            this._workerFactory = new defaultWorkerFactory_1.DefaultWorkerFactory(label);
            this._worker = null;
            this._modelManager = null;
        }
        // foreign host request
        fhr(method, args) {
            throw new Error(`Not implemented!`);
        }
        _getOrCreateWorker() {
            if (!this._worker) {
                try {
                    this._worker = this._register(new simpleWorker_1.SimpleWorkerClient(this._workerFactory, 'vs/editor/common/services/editorSimpleWorker', new EditorWorkerHost(this)));
                }
                catch (err) {
                    (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                    this._worker = new SynchronousWorkerClient(new editorSimpleWorker_1.EditorSimpleWorker(new EditorWorkerHost(this), null));
                }
            }
            return this._worker;
        }
        _getProxy() {
            return this._getOrCreateWorker().getProxyObject().then(undefined, (err) => {
                (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                this._worker = new SynchronousWorkerClient(new editorSimpleWorker_1.EditorSimpleWorker(new EditorWorkerHost(this), null));
                return this._getOrCreateWorker().getProxyObject();
            });
        }
        _getOrCreateModelManager(proxy) {
            if (!this._modelManager) {
                this._modelManager = this._register(new EditorModelManager(proxy, this._modelService, this._keepIdleModels));
            }
            return this._modelManager;
        }
        async _withSyncedResources(resources, forceLargeModels = false) {
            if (this._disposed) {
                return Promise.reject((0, errors_1.canceled)());
            }
            return this._getProxy().then((proxy) => {
                this._getOrCreateModelManager(proxy).ensureSyncedResources(resources, forceLargeModels);
                return proxy;
            });
        }
        computedUnicodeHighlights(uri, options, range) {
            return this._withSyncedResources([uri]).then(proxy => {
                return proxy.computeUnicodeHighlights(uri.toString(), options, range);
            });
        }
        computeDiff(original, modified, options, algorithm) {
            return this._withSyncedResources([original, modified], /* forceLargeModels */ true).then(proxy => {
                return proxy.computeDiff(original.toString(), modified.toString(), options, algorithm);
            });
        }
        computeDirtyDiff(original, modified, ignoreTrimWhitespace) {
            return this._withSyncedResources([original, modified]).then(proxy => {
                return proxy.computeDirtyDiff(original.toString(), modified.toString(), ignoreTrimWhitespace);
            });
        }
        computeMoreMinimalEdits(resource, edits, pretty) {
            return this._withSyncedResources([resource]).then(proxy => {
                return proxy.computeMoreMinimalEdits(resource.toString(), edits, pretty);
            });
        }
        computeHumanReadableDiff(resource, edits, options) {
            return this._withSyncedResources([resource]).then(proxy => {
                return proxy.computeHumanReadableDiff(resource.toString(), edits, options);
            });
        }
        computeLinks(resource) {
            return this._withSyncedResources([resource]).then(proxy => {
                return proxy.computeLinks(resource.toString());
            });
        }
        computeDefaultDocumentColors(resource) {
            return this._withSyncedResources([resource]).then(proxy => {
                return proxy.computeDefaultDocumentColors(resource.toString());
            });
        }
        async textualSuggest(resources, leadingWord, wordDefRegExp) {
            const proxy = await this._withSyncedResources(resources);
            const wordDef = wordDefRegExp.source;
            const wordDefFlags = wordDefRegExp.flags;
            return proxy.textualSuggest(resources.map(r => r.toString()), leadingWord, wordDef, wordDefFlags);
        }
        computeWordRanges(resource, range) {
            return this._withSyncedResources([resource]).then(proxy => {
                const model = this._modelService.getModel(resource);
                if (!model) {
                    return Promise.resolve(null);
                }
                const wordDefRegExp = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
                const wordDef = wordDefRegExp.source;
                const wordDefFlags = wordDefRegExp.flags;
                return proxy.computeWordRanges(resource.toString(), range, wordDef, wordDefFlags);
            });
        }
        navigateValueSet(resource, range, up) {
            return this._withSyncedResources([resource]).then(proxy => {
                const model = this._modelService.getModel(resource);
                if (!model) {
                    return null;
                }
                const wordDefRegExp = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
                const wordDef = wordDefRegExp.source;
                const wordDefFlags = wordDefRegExp.flags;
                return proxy.navigateValueSet(resource.toString(), range, up, wordDef, wordDefFlags);
            });
        }
        dispose() {
            super.dispose();
            this._disposed = true;
        }
    }
    exports.EditorWorkerClient = EditorWorkerClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yV29ya2VyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvc2VydmljZXMvZWRpdG9yV29ya2VyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUErQmhHOztPQUVHO0lBQ0gsTUFBTSw2QkFBNkIsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBRWhEOztPQUVHO0lBQ0gsTUFBTSx5QkFBeUIsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztJQUVoRCxTQUFTLFlBQVksQ0FBQyxZQUEyQixFQUFFLFFBQWE7UUFDL0QsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDWixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUM7WUFDbEMsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRU0sSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTtRQVFsRCxZQUNnQixZQUEyQixFQUNQLG9CQUF1RCxFQUM3RSxVQUF1QixFQUNMLDRCQUEyRCxFQUNoRSx1QkFBaUQ7WUFFM0UsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztZQUNsQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDMUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7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