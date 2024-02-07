/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/cancellation", "vs/base/common/errors", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/search/common/search", "vs/platform/workspace/common/workspace"], function (require, exports, resources, uri_1, cancellation_1, errors, instantiation_1, queryBuilder_1, search_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkGlobFileExists = exports.checkActivateWorkspaceContainsExtension = void 0;
    const WORKSPACE_CONTAINS_TIMEOUT = 7000;
    function checkActivateWorkspaceContainsExtension(host, desc) {
        const activationEvents = desc.activationEvents;
        if (!activationEvents) {
            return Promise.resolve(undefined);
        }
        const fileNames = [];
        const globPatterns = [];
        for (const activationEvent of activationEvents) {
            if (/^workspaceContains:/.test(activationEvent)) {
                const fileNameOrGlob = activationEvent.substr('workspaceContains:'.length);
                if (fileNameOrGlob.indexOf('*') >= 0 || fileNameOrGlob.indexOf('?') >= 0 || host.forceUsingSearch) {
                    globPatterns.push(fileNameOrGlob);
                }
                else {
                    fileNames.push(fileNameOrGlob);
                }
            }
        }
        if (fileNames.length === 0 && globPatterns.length === 0) {
            return Promise.resolve(undefined);
        }
        let resolveResult;
        const result = new Promise((resolve, reject) => { resolveResult = resolve; });
        const activate = (activationEvent) => resolveResult({ activationEvent });
        const fileNamePromise = Promise.all(fileNames.map((fileName) => _activateIfFileName(host, fileName, activate))).then(() => { });
        const globPatternPromise = _activateIfGlobPatterns(host, desc.identifier, globPatterns, activate);
        Promise.all([fileNamePromise, globPatternPromise]).then(() => {
            // when all are done, resolve with undefined (relevant only if it was not activated so far)
            resolveResult(undefined);
        });
        return result;
    }
    exports.checkActivateWorkspaceContainsExtension = checkActivateWorkspaceContainsExtension;
    async function _activateIfFileName(host, fileName, activate) {
        // find exact path
        for (const uri of host.folders) {
            if (await host.exists(resources.joinPath(uri_1.URI.revive(uri), fileName))) {
                // the file was found
                activate(`workspaceContains:${fileName}`);
                return;
            }
        }
    }
    async function _activateIfGlobPatterns(host, extensionId, globPatterns, activate) {
        if (globPatterns.length === 0) {
            return Promise.resolve(undefined);
        }
        const tokenSource = new cancellation_1.CancellationTokenSource();
        const searchP = host.checkExists(host.folders, globPatterns, tokenSource.token);
        const timer = setTimeout(async () => {
            tokenSource.cancel();
            host.logService.info(`Not activating extension '${extensionId.value}': Timed out while searching for 'workspaceContains' pattern ${globPatterns.join(',')}`);
        }, WORKSPACE_CONTAINS_TIMEOUT);
        let exists = false;
        try {
            exists = await searchP;
        }
        catch (err) {
            if (!errors.isCancellationError(err)) {
                errors.onUnexpectedError(err);
            }
        }
        tokenSource.dispose();
        clearTimeout(timer);
        if (exists) {
            // a file was found matching one of the glob patterns
            activate(`workspaceContains:${globPatterns.join(',')}`);
        }
    }
    function checkGlobFileExists(accessor, folders, includes, token) {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const searchService = accessor.get(search_1.ISearchService);
        const queryBuilder = instantiationService.createInstance(queryBuilder_1.QueryBuilder);
        const query = queryBuilder.file(folders.map(folder => (0, workspace_1.toWorkspaceFolder)(uri_1.URI.revive(folder))), {
            _reason: 'checkExists',
            includePattern: includes,
            exists: true
        });
        return searchService.fileSearch(query, token).then(result => {
            return !!result.limitHit;
        }, err => {
            if (!errors.isCancellationError(err)) {
                return Promise.reject(err);
            }
            return false;
        });
    }
    exports.checkGlobFileExists = checkGlobFileExists;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlQ29udGFpbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi93b3Jrc3BhY2VDb250YWlucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLENBQUM7SUFleEMsU0FBZ0IsdUNBQXVDLENBQUMsSUFBOEIsRUFBRSxJQUEyQjtRQUNsSCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUMvQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN2QixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFhLEVBQUUsQ0FBQztRQUMvQixNQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7UUFFbEMsS0FBSyxNQUFNLGVBQWUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2hELElBQUkscUJBQXFCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pELE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzNFLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBQ25HLFlBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ25DLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNoQyxDQUFDO1lB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