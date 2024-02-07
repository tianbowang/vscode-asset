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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/languages/language", "vs/editor/contrib/suggest/browser/suggest", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/language/common/languageService", "./snippetCompletionProvider", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/base/common/map", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/languages/languageConfigurationRegistry", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/arrays"], function (require, exports, lifecycle_1, resources, strings_1, language_1, suggest_1, nls_1, environment_1, files_1, lifecycle_2, log_1, workspace_1, snippetsFile_1, extensionsRegistry_1, languageService_1, snippetCompletionProvider_1, extensionResourceLoader_1, map_1, storage_1, types_1, instantiation_1, textfiles_1, languageConfigurationRegistry_1, userDataProfile_1, arrays_1) {
    "use strict";
    var SnippetEnablement_1, SnippetUsageTimestamps_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNonWhitespacePrefix = exports.SnippetsService = void 0;
    var snippetExt;
    (function (snippetExt) {
        function toValidSnippet(extension, snippet, languageService) {
            if ((0, strings_1.isFalsyOrWhitespace)(snippet.path)) {
                extension.collector.error((0, nls_1.localize)('invalid.path.0', "Expected string in `contributes.{0}.path`. Provided value: {1}", extension.description.name, String(snippet.path)));
                return null;
            }
            if ((0, strings_1.isFalsyOrWhitespace)(snippet.language) && !snippet.path.endsWith('.code-snippets')) {
                extension.collector.error((0, nls_1.localize)('invalid.language.0', "When omitting the language, the value of `contributes.{0}.path` must be a `.code-snippets`-file. Provided value: {1}", extension.description.name, String(snippet.path)));
                return null;
            }
            if (!(0, strings_1.isFalsyOrWhitespace)(snippet.language) && !languageService.isRegisteredLanguageId(snippet.language)) {
                extension.collector.error((0, nls_1.localize)('invalid.language', "Unknown language in `contributes.{0}.language`. Provided value: {1}", extension.description.name, String(snippet.language)));
                return null;
            }
            const extensionLocation = extension.description.extensionLocation;
            const snippetLocation = resources.joinPath(extensionLocation, snippet.path);
            if (!resources.isEqualOrParent(snippetLocation, extensionLocation)) {
                extension.collector.error((0, nls_1.localize)('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", extension.description.name, snippetLocation.path, extensionLocation.path));
                return null;
            }
            return {
                language: snippet.language,
                location: snippetLocation
            };
        }
        snippetExt.toValidSnippet = toValidSnippet;
        snippetExt.snippetsContribution = {
            description: (0, nls_1.localize)('vscode.extension.contributes.snippets', 'Contributes snippets.'),
            type: 'array',
            defaultSnippets: [{ body: [{ language: '', path: '' }] }],
            items: {
                type: 'object',
                defaultSnippets: [{ body: { language: '${1:id}', path: './snippets/${2:id}.json.' } }],
                properties: {
                    language: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.snippets-language', 'Language identifier for which this snippet is contributed to.'),
                        type: 'string'
                    },
                    path: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.snippets-path', 'Path of the snippets file. The path is relative to the extension folder and typically starts with \'./snippets/\'.'),
                        type: 'string'
                    }
                }
            }
        };
        snippetExt.point = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'snippets',
            deps: [languageService_1.languagesExtPoint],
            jsonSchema: snippetExt.snippetsContribution
        });
    })(snippetExt || (snippetExt = {}));
    function watch(service, resource, callback) {
        return (0, lifecycle_1.combinedDisposable)(service.watch(resource), service.onDidFilesChange(e => {
            if (e.affects(resource)) {
                callback();
            }
        }));
    }
    let SnippetEnablement = class SnippetEnablement {
        static { SnippetEnablement_1 = this; }
        static { this._key = 'snippets.ignoredSnippets'; }
        constructor(_storageService) {
            this._storageService = _storageService;
            const raw = _storageService.get(SnippetEnablement_1._key, 0 /* StorageScope.PROFILE */, '');
            let data;
            try {
                data = JSON.parse(raw);
            }
            catch { }
            this._ignored = (0, types_1.isStringArray)(data) ? new Set(data) : new Set();
        }
        isIgnored(id) {
            return this._ignored.has(id);
        }
        updateIgnored(id, value) {
            let changed = false;
            if (this._ignored.has(id) && !value) {
                this._ignored.delete(id);
                changed = true;
            }
            else if (!this._ignored.has(id) && value) {
                this._ignored.add(id);
                changed = true;
            }
            if (changed) {
                this._storageService.store(SnippetEnablement_1._key, JSON.stringify(Array.from(this._ignored)), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
    };
    SnippetEnablement = SnippetEnablement_1 = __decorate([
        __param(0, storage_1.IStorageService)
    ], SnippetEnablement);
    let SnippetUsageTimestamps = class SnippetUsageTimestamps {
        static { SnippetUsageTimestamps_1 = this; }
        static { this._key = 'snippets.usageTimestamps'; }
        constructor(_storageService) {
            this._storageService = _storageService;
            const raw = _storageService.get(SnippetUsageTimestamps_1._key, 0 /* StorageScope.PROFILE */, '');
            let data;
            try {
                data = JSON.parse(raw);
            }
            catch {
                data = [];
            }
            this._usages = Array.isArray(data) ? new Map(data) : new Map();
        }
        getUsageTimestamp(id) {
            return this._usages.get(id);
        }
        updateUsageTimestamp(id) {
            // map uses insertion order, we want most recent at the end
            this._usages.delete(id);
            this._usages.set(id, Date.now());
            // persist last 100 item
            const all = [...this._usages].slice(-100);
            this._storageService.store(SnippetUsageTimestamps_1._key, JSON.stringify(all), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    SnippetUsageTimestamps = SnippetUsageTimestamps_1 = __decorate([
        __param(0, storage_1.IStorageService)
    ], SnippetUsageTimestamps);
    let SnippetsService = class SnippetsService {
        constructor(_environmentService, _userDataProfileService, _contextService, _languageService, _logService, _fileService, _textfileService, _extensionResourceLoaderService, lifecycleService, instantiationService, languageConfigurationService) {
            this._environmentService = _environmentService;
            this._userDataProfileService = _userDataProfileService;
            this._contextService = _contextService;
            this._languageService = _languageService;
            this._logService = _logService;
            this._fileService = _fileService;
            this._textfileService = _textfileService;
            this._extensionResourceLoaderService = _extensionResourceLoaderService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._pendingWork = [];
            this._files = new map_1.ResourceMap();
            this._pendingWork.push(Promise.resolve(lifecycleService.when(3 /* LifecyclePhase.Restored */).then(() => {
                this._initExtensionSnippets();
                this._initUserSnippets();
                this._initWorkspaceSnippets();
            })));
            (0, suggest_1.setSnippetSuggestSupport)(new snippetCompletionProvider_1.SnippetCompletionProvider(this._languageService, this, languageConfigurationService));
            this._enablement = instantiationService.createInstance(SnippetEnablement);
            this._usageTimestamps = instantiationService.createInstance(SnippetUsageTimestamps);
        }
        dispose() {
            this._disposables.dispose();
        }
        isEnabled(snippet) {
            return !this._enablement.isIgnored(snippet.snippetIdentifier);
        }
        updateEnablement(snippet, enabled) {
            this._enablement.updateIgnored(snippet.snippetIdentifier, !enabled);
        }
        updateUsageTimestamp(snippet) {
            this._usageTimestamps.updateUsageTimestamp(snippet.snippetIdentifier);
        }
        _joinSnippets() {
            const promises = this._pendingWork.slice(0);
            this._pendingWork.length = 0;
            return Promise.all(promises);
        }
        async getSnippetFiles() {
            await this._joinSnippets();
            return this._files.values();
        }
        async getSnippets(languageId, opts) {
            await this._joinSnippets();
            const result = [];
            const promises = [];
            if (languageId) {
                if (this._languageService.isRegisteredLanguageId(languageId)) {
                    for (const file of this._files.values()) {
                        promises.push(file.load()
                            .then(file => file.select(languageId, result))
                            .catch(err => this._logService.error(err, file.location.toString())));
                    }
                }
            }
            else {
                for (const file of this._files.values()) {
                    promises.push(file.load()
                        .then(file => (0, arrays_1.insertInto)(result, result.length, file.data))
                        .catch(err => this._logService.error(err, file.location.toString())));
                }
            }
            await Promise.all(promises);
            return this._filterAndSortSnippets(result, opts);
        }
        getSnippetsSync(languageId, opts) {
            const result = [];
            if (this._languageService.isRegisteredLanguageId(languageId)) {
                for (const file of this._files.values()) {
                    // kick off loading (which is a noop in case it's already loaded)
                    // and optimistically collect snippets
                    file.load().catch(_err => { });
                    file.select(languageId, result);
                }
            }
            return this._filterAndSortSnippets(result, opts);
        }
        _filterAndSortSnippets(snippets, opts) {
            const result = [];
            for (const snippet of snippets) {
                if (!snippet.prefix && !opts?.includeNoPrefixSnippets) {
                    // prefix or no-prefix wanted
                    continue;
                }
                if (!this.isEnabled(snippet) && !opts?.includeDisabledSnippets) {
                    // enabled or disabled wanted
                    continue;
                }
                if (typeof opts?.fileTemplateSnippets === 'boolean' && opts.fileTemplateSnippets !== snippet.isFileTemplate) {
                    // isTopLevel requested but mismatching
                    continue;
                }
                result.push(snippet);
            }
            return result.sort((a, b) => {
                let result = 0;
                if (!opts?.noRecencySort) {
                    const val1 = this._usageTimestamps.getUsageTimestamp(a.snippetIdentifier) ?? -1;
                    const val2 = this._usageTimestamps.getUsageTimestamp(b.snippetIdentifier) ?? -1;
                    result = val2 - val1;
                }
                if (result === 0) {
                    result = this._compareSnippet(a, b);
                }
                return result;
            });
        }
        _compareSnippet(a, b) {
            if (a.snippetSource < b.snippetSource) {
                return -1;
            }
            else if (a.snippetSource > b.snippetSource) {
                return 1;
            }
            else if (a.source < b.source) {
                return -1;
            }
            else if (a.source > b.source) {
                return 1;
            }
            else if (a.name > b.name) {
                return 1;
            }
            else if (a.name < b.name) {
                return -1;
            }
            else {
                return 0;
            }
        }
        // --- loading, watching
        _initExtensionSnippets() {
            snippetExt.point.setHandler(extensions => {
                for (const [key, value] of this._files) {
                    if (value.source === 3 /* SnippetSource.Extension */) {
                        this._files.delete(key);
                    }
                }
                for (const extension of extensions) {
                    for (const contribution of extension.value) {
                        const validContribution = snippetExt.toValidSnippet(extension, contribution, this._languageService);
                        if (!validContribution) {
                            continue;
                        }
                        const file = this._files.get(validContribution.location);
                        if (file) {
                            if (file.defaultScopes) {
                                file.defaultScopes.push(validContribution.language);
                            }
                            else {
                                file.defaultScopes = [];
                            }
                        }
                        else {
                            const file = new snippetsFile_1.SnippetFile(3 /* SnippetSource.Extension */, validContribution.location, validContribution.language ? [validContribution.language] : undefined, extension.description, this._fileService, this._extensionResourceLoaderService);
                            this._files.set(file.location, file);
                            if (this._environmentService.isExtensionDevelopment) {
                                file.load().then(file => {
                                    // warn about bad tabstop/variable usage
                                    if (file.data.some(snippet => snippet.isBogous)) {
                                        extension.collector.warn((0, nls_1.localize)('badVariableUse', "One or more snippets from the extension '{0}' very likely confuse snippet-variables and snippet-placeholders (see https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax for more details)", extension.description.name));
                                    }
                                }, err => {
                                    // generic error
                                    extension.collector.warn((0, nls_1.localize)('badFile', "The snippet file \"{0}\" could not be read.", file.location.toString()));
                                });
                            }
                        }
                    }
                }
            });
        }
        _initWorkspaceSnippets() {
            // workspace stuff
            const disposables = new lifecycle_1.DisposableStore();
            const updateWorkspaceSnippets = () => {
                disposables.clear();
                this._pendingWork.push(this._initWorkspaceFolderSnippets(this._contextService.getWorkspace(), disposables));
            };
            this._disposables.add(disposables);
            this._disposables.add(this._contextService.onDidChangeWorkspaceFolders(updateWorkspaceSnippets));
            this._disposables.add(this._contextService.onDidChangeWorkbenchState(updateWorkspaceSnippets));
            updateWorkspaceSnippets();
        }
        async _initWorkspaceFolderSnippets(workspace, bucket) {
            const promises = workspace.folders.map(async (folder) => {
                const snippetFolder = folder.toResource('.vscode');
                const value = await this._fileService.exists(snippetFolder);
                if (value) {
                    this._initFolderSnippets(2 /* SnippetSource.Workspace */, snippetFolder, bucket);
                }
                else {
                    // watch
                    bucket.add(this._fileService.onDidFilesChange(e => {
                        if (e.contains(snippetFolder, 1 /* FileChangeType.ADDED */)) {
                            this._initFolderSnippets(2 /* SnippetSource.Workspace */, snippetFolder, bucket);
                        }
                    }));
                }
            });
            await Promise.all(promises);
        }
        async _initUserSnippets() {
            const disposables = new lifecycle_1.DisposableStore();
            const updateUserSnippets = async () => {
                disposables.clear();
                const userSnippetsFolder = this._userDataProfileService.currentProfile.snippetsHome;
                await this._fileService.createFolder(userSnippetsFolder);
                await this._initFolderSnippets(1 /* SnippetSource.User */, userSnippetsFolder, disposables);
            };
            this._disposables.add(disposables);
            this._disposables.add(this._userDataProfileService.onDidChangeCurrentProfile(e => e.join((async () => {
                this._pendingWork.push(updateUserSnippets());
            })())));
            await updateUserSnippets();
        }
        _initFolderSnippets(source, folder, bucket) {
            const disposables = new lifecycle_1.DisposableStore();
            const addFolderSnippets = async () => {
                disposables.clear();
                if (!await this._fileService.exists(folder)) {
                    return;
                }
                try {
                    const stat = await this._fileService.resolve(folder);
                    for (const entry of stat.children || []) {
                        disposables.add(this._addSnippetFile(entry.resource, source));
                    }
                }
                catch (err) {
                    this._logService.error(`Failed snippets from folder '${folder.toString()}'`, err);
                }
            };
            bucket.add(this._textfileService.files.onDidSave(e => {
                if (resources.isEqualOrParent(e.model.resource, folder)) {
                    addFolderSnippets();
                }
            }));
            bucket.add(watch(this._fileService, folder, addFolderSnippets));
            bucket.add(disposables);
            return addFolderSnippets();
        }
        _addSnippetFile(uri, source) {
            const ext = resources.extname(uri);
            if (source === 1 /* SnippetSource.User */ && ext === '.json') {
                const langName = resources.basename(uri).replace(/\.json/, '');
                this._files.set(uri, new snippetsFile_1.SnippetFile(source, uri, [langName], undefined, this._fileService, this._extensionResourceLoaderService));
            }
            else if (ext === '.code-snippets') {
                this._files.set(uri, new snippetsFile_1.SnippetFile(source, uri, undefined, undefined, this._fileService, this._extensionResourceLoaderService));
            }
            return {
                dispose: () => this._files.delete(uri)
            };
        }
    };
    exports.SnippetsService = SnippetsService;
    exports.SnippetsService = SnippetsService = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, userDataProfile_1.IUserDataProfileService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, language_1.ILanguageService),
        __param(4, log_1.ILogService),
        __param(5, files_1.IFileService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(8, lifecycle_2.ILifecycleService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], SnippetsService);
    function getNonWhitespacePrefix(model, position) {
        /**
         * Do not analyze more characters
         */
        const MAX_PREFIX_LENGTH = 100;
        const line = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
        const minChIndex = Math.max(0, line.length - MAX_PREFIX_LENGTH);
        for (let chIndex = line.length - 1; chIndex >= minChIndex; chIndex--) {
            const ch = line.charAt(chIndex);
            if (/\s/.test(ch)) {
                return line.substr(chIndex + 1);
            }
        }
        if (minChIndex === 0) {
            return line;
        }
        return '';
    }
    exports.getNonWhitespacePrefix = getNonWhitespacePrefix;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHNTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zbmlwcGV0cy9icm93c2VyL3NuaXBwZXRzU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBK0JoRyxJQUFVLFVBQVUsQ0FvRm5CO0lBcEZELFdBQVUsVUFBVTtRQVluQixTQUFnQixjQUFjLENBQUMsU0FBeUQsRUFBRSxPQUFnQyxFQUFFLGVBQWlDO1lBRTVKLElBQUksSUFBQSw2QkFBbUIsRUFBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDdkMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBQSxjQUFRLEVBQ2pDLGdCQUFnQixFQUNoQixnRUFBZ0UsRUFDaEUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FDaEQsQ0FBQyxDQUFDO2dCQUNILE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztZQUVELElBQUksSUFBQSw2QkFBbUIsRUFBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZGLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUEsY0FBUSxFQUNqQyxvQkFBb0IsRUFDcEIsc0hBQXNILEVBQ3RILFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQ2hELENBQUMsQ0FBQztnQkFDSCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBQSw2QkFBbUIsRUFBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pHLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUEsY0FBUSxFQUNqQyxrQkFBa0IsRUFDbEIscUVBQXFFLEVBQ3JFLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQ3BELENBQUMsQ0FBQztnQkFDSCxPQUFPLElBQUksQ0FBQztZQUViLENBQUM7WUFFRCxNQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUM7WUFDbEUsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztnQkFDcEUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBQSxjQUFRLEVBQ2pDLGdCQUFnQixFQUNoQixtSUFBbUksRUFDbkksU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQ3hFLENBQUMsQ0FBQztnQkFDSCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCxPQUFPO2dCQUNOLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtnQkFDMUIsUUFBUSxFQUFFLGVBQWU7YUFDekIsQ0FBQztRQUNILENBQUM7UUE3Q2UseUJBQWMsaUJBNkM3QixDQUFBO1FBRVksK0JBQW9CLEdBQWdCO1lBQ2hELFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyx1Q0FBdUMsRUFBRSx1QkFBdUIsQ0FBQztZQUN2RixJQUFJLEVBQUUsT0FBTztZQUNiLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDekQsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2dCQUNkLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUUsRUFBRSxDQUFDO2dCQUN0RixVQUFVLEVBQUU7b0JBQ1gsUUFBUSxFQUFFO3dCQUNULFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxnREFBZ0QsRUFBRSwrREFBK0QsQ0FBQzt3QkFDeEksSUFBSSxFQUFFLFFBQVE7cUJBQ2Q7b0JBQ0QsSUFBSSxFQUFFO3dCQUNMLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyw0Q0FBNEMsRUFBRSxvSEFBb0gsQ0FBQzt3QkFDekwsSUFBSSxFQUFFLFFBQVE7cUJBQ2Q7aUJBQ0Q7YUFDRDtTQUNELENBQUM7UUFFVyxnQkFBSyxHQUFHLHVDQUFrQixDQUFDLHNCQUFzQixDQUF1QztZQUNwRyxjQUFjLEVBQUUsVUFBVTtZQUMxQixJQUFJLEVBQUUsQ0FBQyxtQ0FBaUIsQ0FBQztZQUN6QixVQUFVLEVBQUUsVUFBVSxDQUFDLG9CQUFvQjtTQUMzQyxDQUFDLENBQUM7SUFDSixDQUFDLEVBcEZTLFVBQVUsS0FBVixVQUFVLFFBb0ZuQjtJQUVELFNBQVMsS0FBSyxDQUFDLE9BQXFCLEVBQUUsUUFBYSxFQUFFLFFBQW1CO1FBQ3ZFLE9BQU8sSUFBQSw4QkFBa0IsRUFDeEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFDdkIsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUN6QixRQUFRLEVBQUUsQ0FBQztZQUNaLENBQUM7UUFDRixDQUFDLENBQUMsQ0FDRixDQUFDO0lBQ0gsQ0FBQztJQUVELElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWlCOztpQkFFUCxTQUFJLEdBQUcsMEJBQTBCLEFBQTdCLENBQThCO1FBSWpELFlBQ21DLGVBQWdDO1lBQWhDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUdsRSxNQUFNLEdBQUcsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLG1CQUFpQixDQUFDLElBQUksZ0NBQXdCLEVBQUUsQ0FBQyxDQUFDO1lBQ2xGLElBQUksSUFBMEIsQ0FBQztZQUMvQixJQUFJLENBQUM7Z0JBQ0osSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFWCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUEscUJBQWEsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDakUsQ0FBQztRQUVELFNBQVMsQ0FBQyxFQUFVO1lBQ25CLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVELGFBQWEsQ0FBQyxFQUFVLEVBQUUsS0FBYztZQUN2QyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDekIsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNoQixDQUFDO2lCQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RCLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUNELElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsbUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsMkRBQTJDLENBQUM7WUFDekksQ0FBQztRQUNGLENBQUM7O0lBbkNJLGlCQUFpQjtRQU9wQixXQUFBLHlCQUFlLENBQUE7T0FQWixpQkFBaUIsQ0FvQ3RCO0lBRUQsSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBc0I7O2lCQUVaLFNBQUksR0FBRywwQkFBMEIsQUFBN0IsQ0FBOEI7UUFJakQsWUFDbUMsZUFBZ0M7WUFBaEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBR2xFLE1BQU0sR0FBRyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsd0JBQXNCLENBQUMsSUFBSSxnQ0FBd0IsRUFBRSxDQUFDLENBQUM7WUFDdkYsSUFBSSxJQUFvQyxDQUFDO1lBQ3pDLElBQUksQ0FBQztnQkFDSixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QixDQUFDO1lBQUMsTUFBTSxDQUFDO2dCQUNSLElBQUksR0FBRyxFQUFFLENBQUM7WUFDWCxDQUFDO1lBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNoRSxDQUFDO1FBRUQsaUJBQWlCLENBQUMsRUFBVTtZQUMzQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxFQUFVO1lBQzlCLDJEQUEyRDtZQUMzRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFakMsd0JBQXdCO1lBQ3hCLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsd0JBQXNCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDJEQUEyQyxDQUFDO1FBQ3hILENBQUM7O0lBakNJLHNCQUFzQjtRQU96QixXQUFBLHlCQUFlLENBQUE7T0FQWixzQkFBc0IsQ0FrQzNCO0lBRU0sSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZTtRQVUzQixZQUNzQixtQkFBeUQsRUFDckQsdUJBQWlFLEVBQ2hFLGVBQTBELEVBQ2xFLGdCQUFtRCxFQUN4RCxXQUF5QyxFQUN4QyxZQUEyQyxFQUN2QyxnQkFBbUQsRUFDcEMsK0JBQWlGLEVBQy9GLGdCQUFtQyxFQUMvQixvQkFBMkMsRUFDbkMsNEJBQTJEO1lBVnBELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDcEMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtZQUMvQyxvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7WUFDakQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUN2QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUN2QixpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUN0QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ25CLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBaUM7WUFkbEcsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNyQyxpQkFBWSxHQUFtQixFQUFFLENBQUM7WUFDbEMsV0FBTSxHQUFHLElBQUksaUJBQVcsRUFBZSxDQUFDO1lBaUJ4RCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksaUNBQXlCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDL0YsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN6QixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFTCxJQUFBLGtDQUF3QixFQUFDLElBQUkscURBQXlCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFFbkgsSUFBSSxDQUFDLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFRCxTQUFTLENBQUMsT0FBZ0I7WUFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxPQUFnQixFQUFFLE9BQWdCO1lBQ2xELElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVPLGFBQWE7WUFDcEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsS0FBSyxDQUFDLGVBQWU7WUFDcEIsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDM0IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQThCLEVBQUUsSUFBeUI7WUFDMUUsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFM0IsTUFBTSxNQUFNLEdBQWMsRUFBRSxDQUFDO1lBQzdCLE1BQU0sUUFBUSxHQUFtQixFQUFFLENBQUM7WUFFcEMsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztvQkFDOUQsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7d0JBQ3pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTs2QkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7NkJBQzdDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FDcEUsQ0FBQztvQkFDSCxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7b0JBQ3pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTt5QkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBQSxtQkFBVSxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFDMUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUNwRSxDQUFDO2dCQUNILENBQUM7WUFDRixDQUFDO1lBQ0QsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsZUFBZSxDQUFDLFVBQWtCLEVBQUUsSUFBeUI7WUFDNUQsTUFBTSxNQUFNLEdBQWMsRUFBRSxDQUFDO1lBQzdCLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQzlELEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO29CQUN6QyxpRUFBaUU7b0JBQ2pFLHNDQUFzQztvQkFDdEMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFjLENBQUMsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakMsQ0FBQztZQUNGLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVPLHNCQUFzQixDQUFDLFFBQW1CLEVBQUUsSUFBeUI7WUFFNUUsTUFBTSxNQUFNLEdBQWMsRUFBRSxDQUFDO1lBRTdCLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLENBQUM7b0JBQ3ZELDZCQUE2QjtvQkFDN0IsU0FBUztnQkFDVixDQUFDO2dCQUNELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLENBQUM7b0JBQ2hFLDZCQUE2QjtvQkFDN0IsU0FBUztnQkFDVixDQUFDO2dCQUNELElBQUksT0FBTyxJQUFJLEVBQUUsb0JBQW9CLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsS0FBSyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQzdHLHVDQUF1QztvQkFDdkMsU0FBUztnQkFDVixDQUFDO2dCQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEIsQ0FBQztZQUdELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNmLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLENBQUM7b0JBQzFCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDaEYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNoRixNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDdEIsQ0FBQztnQkFDRCxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDbEIsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO2dCQUNELE9BQU8sTUFBTSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sZUFBZSxDQUFDLENBQVUsRUFBRSxDQUFVO1lBQzdDLElBQUksQ0FBQyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3ZDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDWCxDQUFDO2lCQUFNLElBQUksQ0FBQyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQzlDLE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztpQkFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNoQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1gsQ0FBQztpQkFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNoQyxPQUFPLENBQUMsQ0FBQztZQUNWLENBQUM7aUJBQU0sSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDO2lCQUFNLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzVCLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDWCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDO1FBQ0YsQ0FBQztRQUVELHdCQUF3QjtRQUVoQixzQkFBc0I7WUFDN0IsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBRXhDLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3hDLElBQUksS0FBSyxDQUFDLE1BQU0sb0NBQTRCLEVBQUUsQ0FBQzt3QkFDOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3pCLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRSxDQUFDO29CQUNwQyxLQUFLLE1BQU0sWUFBWSxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDNUMsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQ3BHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDOzRCQUN4QixTQUFTO3dCQUNWLENBQUM7d0JBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3pELElBQUksSUFBSSxFQUFFLENBQUM7NEJBQ1YsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0NBQ3hCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUNyRCxDQUFDO2lDQUFNLENBQUM7Z0NBQ1AsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7NEJBQ3pCLENBQUM7d0JBQ0YsQ0FBQzs2QkFBTSxDQUFDOzRCQUNQLE1BQU0sSUFBSSxHQUFHLElBQUksMEJBQVcsa0NBQTBCLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7NEJBQ3pPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7NEJBRXJDLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0NBQ3JELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7b0NBQ3ZCLHdDQUF3QztvQ0FDeEMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO3dDQUNqRCxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFBLGNBQVEsRUFDaEMsZ0JBQWdCLEVBQ2hCLG1OQUFtTixFQUNuTixTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FDMUIsQ0FBQyxDQUFDO29DQUNKLENBQUM7Z0NBQ0YsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO29DQUNSLGdCQUFnQjtvQ0FDaEIsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBQSxjQUFRLEVBQ2hDLFNBQVMsRUFDVCw2Q0FBNkMsRUFDN0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FDeEIsQ0FBQyxDQUFDO2dDQUNKLENBQUMsQ0FBQyxDQUFDOzRCQUNKLENBQUM7d0JBRUYsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxzQkFBc0I7WUFDN0Isa0JBQWtCO1lBQ2xCLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzFDLE1BQU0sdUJBQXVCLEdBQUcsR0FBRyxFQUFFO2dCQUNwQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDN0csQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQywyQkFBMkIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDakcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyx5QkFBeUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDL0YsdUJBQXVCLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRU8sS0FBSyxDQUFDLDRCQUE0QixDQUFDLFNBQXFCLEVBQUUsTUFBdUI7WUFDeEYsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLE1BQU0sRUFBQyxFQUFFO2dCQUNyRCxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNYLElBQUksQ0FBQyxtQkFBbUIsa0NBQTBCLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMUUsQ0FBQztxQkFBTSxDQUFDO29CQUNQLFFBQVE7b0JBQ1IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUNqRCxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSwrQkFBdUIsRUFBRSxDQUFDOzRCQUNyRCxJQUFJLENBQUMsbUJBQW1CLGtDQUEwQixhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQzFFLENBQUM7b0JBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVPLEtBQUssQ0FBQyxpQkFBaUI7WUFDOUIsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDMUMsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLElBQUksRUFBRTtnQkFDckMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNwQixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDO2dCQUNwRixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3pELE1BQU0sSUFBSSxDQUFDLG1CQUFtQiw2QkFBcUIsa0JBQWtCLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDckYsQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNwRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNSLE1BQU0sa0JBQWtCLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU8sbUJBQW1CLENBQUMsTUFBcUIsRUFBRSxNQUFXLEVBQUUsTUFBdUI7WUFDdEYsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDMUMsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLElBQUksRUFBRTtnQkFDcEMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNwQixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO29CQUM3QyxPQUFPO2dCQUNSLENBQUM7Z0JBQ0QsSUFBSSxDQUFDO29CQUNKLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3JELEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUUsQ0FBQzt3QkFDekMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDL0QsQ0FBQztnQkFDRixDQUFDO2dCQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7b0JBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNuRixDQUFDO1lBQ0YsQ0FBQyxDQUFDO1lBRUYsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ3pELGlCQUFpQixFQUFFLENBQUM7Z0JBQ3JCLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEIsT0FBTyxpQkFBaUIsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTyxlQUFlLENBQUMsR0FBUSxFQUFFLE1BQXFCO1lBQ3RELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkMsSUFBSSxNQUFNLCtCQUF1QixJQUFJLEdBQUcsS0FBSyxPQUFPLEVBQUUsQ0FBQztnQkFDdEQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSwwQkFBVyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1lBQ3BJLENBQUM7aUJBQU0sSUFBSSxHQUFHLEtBQUssZ0JBQWdCLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksMEJBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1lBQ25JLENBQUM7WUFDRCxPQUFPO2dCQUNOLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7YUFDdEMsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBdlNZLDBDQUFlOzhCQUFmLGVBQWU7UUFXekIsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLHlDQUF1QixDQUFBO1FBQ3ZCLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLDRCQUFnQixDQUFBO1FBQ2hCLFdBQUEseURBQStCLENBQUE7UUFDL0IsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFlBQUEsNkRBQTZCLENBQUE7T0FyQm5CLGVBQWUsQ0F1UzNCO0lBT0QsU0FBZ0Isc0JBQXNCLENBQUMsS0FBbUIsRUFBRSxRQUFrQjtRQUM3RTs7V0FFRztRQUNILE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO1FBRTlCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUV0RixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLGlCQUFpQixDQUFDLENBQUM7UUFDaEUsS0FBSyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxPQUFPLElBQUksVUFBVSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7WUFDdEUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVoQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDbkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqQyxDQUFDO1FBQ0YsQ0FBQztRQUVELElBQUksVUFBVSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELE9BQU8sRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQXRCRCx3REFzQkMifQ==