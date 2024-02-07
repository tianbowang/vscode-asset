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
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService", "vs/workbench/contrib/scm/common/scm", "vs/workbench/services/editor/common/editorService"], function (require, exports, codicons_1, event_1, lifecycle_1, observable_1, uri_1, nls_1, actions_1, contextkey_1, instantiation_1, multiDiffSourceResolverService_1, scm_1, editorService_1) {
    "use strict";
    var ScmMultiDiffSourceResolver_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenScmGroupAction = exports.ScmMultiDiffSourceResolverContribution = exports.ScmMultiDiffSourceResolver = void 0;
    let ScmMultiDiffSourceResolver = class ScmMultiDiffSourceResolver {
        static { ScmMultiDiffSourceResolver_1 = this; }
        static { this._scheme = 'scm-multi-diff-source'; }
        static getMultiDiffSourceUri(repositoryUri, groupId) {
            return uri_1.URI.from({
                scheme: ScmMultiDiffSourceResolver_1._scheme,
                query: JSON.stringify({ repositoryUri, groupId }),
            });
        }
        static parseUri(uri) {
            if (uri.scheme !== ScmMultiDiffSourceResolver_1._scheme) {
                return undefined;
            }
            let query;
            try {
                query = JSON.parse(uri.query);
            }
            catch (e) {
                return undefined;
            }
            if (typeof query !== 'object' || query === null) {
                return undefined;
            }
            const { repositoryUri, groupId } = query;
            if (typeof repositoryUri !== 'string' || typeof groupId !== 'string') {
                return undefined;
            }
            return { repositoryUri: uri_1.URI.parse(repositoryUri), groupId };
        }
        constructor(_scmService) {
            this._scmService = _scmService;
        }
        canHandleUri(uri) {
            return ScmMultiDiffSourceResolver_1.parseUri(uri) !== undefined;
        }
        async resolveDiffSource(uri) {
            const { repositoryUri, groupId } = ScmMultiDiffSourceResolver_1.parseUri(uri);
            const repository = await promiseFromEventState(this._scmService.onDidAddRepository, () => {
                const repository = [...this._scmService.repositories].find(r => r.provider.rootUri?.toString() === repositoryUri.toString());
                return repository ?? false;
            });
            const group = await promiseFromEventState(repository.provider.onDidChangeResourceGroups, () => {
                const group = repository.provider.groups.find(g => g.id === groupId);
                return group ?? false;
            });
            const resources = (0, observable_1.observableFromEvent)(group.onDidChangeResources, () => group.resources.map(e => {
                return {
                    original: e.multiDiffEditorOriginalUri,
                    modified: e.multiDiffEditorModifiedUri
                };
            }));
            return new ScmResolvedMultiDiffSource(resources, {
                scmResourceGroup: groupId,
                scmProvider: repository.provider.contextValue,
            });
        }
    };
    exports.ScmMultiDiffSourceResolver = ScmMultiDiffSourceResolver;
    exports.ScmMultiDiffSourceResolver = ScmMultiDiffSourceResolver = ScmMultiDiffSourceResolver_1 = __decorate([
        __param(0, scm_1.ISCMService)
    ], ScmMultiDiffSourceResolver);
    class ScmResolvedMultiDiffSource {
        get resources() { return this._resources.get(); }
        constructor(_resources, contextKeys) {
            this._resources = _resources;
            this.contextKeys = contextKeys;
            this.onDidChange = event_1.Event.fromObservableLight(this._resources);
        }
    }
    function promiseFromEventState(event, checkState) {
        const state = checkState();
        if (state) {
            return Promise.resolve(state);
        }
        return new Promise(resolve => {
            const listener = event(() => {
                const state = checkState();
                if (state) {
                    listener.dispose();
                    resolve(state);
                }
            });
        });
    }
    let ScmMultiDiffSourceResolverContribution = class ScmMultiDiffSourceResolverContribution extends lifecycle_1.Disposable {
        constructor(instantiationService, multiDiffSourceResolverService) {
            super();
            this._register(multiDiffSourceResolverService.registerResolver(instantiationService.createInstance(ScmMultiDiffSourceResolver)));
        }
    };
    exports.ScmMultiDiffSourceResolverContribution = ScmMultiDiffSourceResolverContribution;
    exports.ScmMultiDiffSourceResolverContribution = ScmMultiDiffSourceResolverContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, multiDiffSourceResolverService_1.IMultiDiffSourceResolverService)
    ], ScmMultiDiffSourceResolverContribution);
    class OpenScmGroupAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'multiDiffEditor.openScmDiff',
                title: (0, nls_1.localize2)('viewChanges', 'View Changes'),
                icon: codicons_1.Codicon.diffMultiple,
                menu: {
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('config.multiDiffEditor.experimental.enabled'), contextkey_1.ContextKeyExpr.has('multiDiffEditorEnableViewChanges')),
                    id: actions_1.MenuId.SCMResourceGroupContext,
                    group: 'inline',
                },
                f1: false,
            });
        }
        async run(accessor, group) {
            const editorService = accessor.get(editorService_1.IEditorService);
            if (!group.provider.rootUri) {
                return;
            }
            const multiDiffSource = ScmMultiDiffSourceResolver.getMultiDiffSourceUri(group.provider.rootUri.toString(), group.id);
            const label = (0, nls_1.localize)('scmDiffLabel', '{0}: {1}', group.provider.label, group.label);
            await editorService.openEditor({ label, multiDiffSource });
        }
    }
    exports.OpenScmGroupAction = OpenScmGroupAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NtTXVsdGlEaWZmU291cmNlUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL211bHRpRGlmZkVkaXRvci9icm93c2VyL3NjbU11bHRpRGlmZlNvdXJjZVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFlekYsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMEI7O2lCQUNkLFlBQU8sR0FBRyx1QkFBdUIsQUFBMUIsQ0FBMkI7UUFFbkQsTUFBTSxDQUFDLHFCQUFxQixDQUFDLGFBQXFCLEVBQUUsT0FBZTtZQUN6RSxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ2YsTUFBTSxFQUFFLDRCQUEwQixDQUFDLE9BQU87Z0JBQzFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBc0IsQ0FBQzthQUNyRSxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFRO1lBQy9CLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyw0QkFBMEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdkQsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUVELElBQUksS0FBVSxDQUFDO1lBQ2YsSUFBSSxDQUFDO2dCQUNKLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQWMsQ0FBQztZQUM1QyxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDWixPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDO1lBRUQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUNqRCxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFD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