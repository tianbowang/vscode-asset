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
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/host/browser/host", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/search/common/search", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkParsing", "vs/platform/terminal/common/terminal"], function (require, exports, network_1, uri_1, commands_1, files_1, instantiation_1, opener_1, quickInput_1, workspace_1, terminalLinkHelpers_1, editorService_1, environmentService_1, host_1, queryBuilder_1, search_1, configuration_1, terminalLinkParsing_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalUrlLinkOpener = exports.TerminalSearchLinkOpener = exports.TerminalLocalFolderOutsideWorkspaceLinkOpener = exports.TerminalLocalFolderInWorkspaceLinkOpener = exports.TerminalLocalFileLinkOpener = void 0;
    let TerminalLocalFileLinkOpener = class TerminalLocalFileLinkOpener {
        constructor(_editorService) {
            this._editorService = _editorService;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open file link without a resolved URI');
            }
            const linkSuffix = link.parsedLink ? link.parsedLink.suffix : (0, terminalLinkParsing_1.getLinkSuffix)(link.text);
            let selection = link.selection;
            if (!selection) {
                selection = linkSuffix?.row === undefined ? undefined : {
                    startLineNumber: linkSuffix.row ?? 1,
                    startColumn: linkSuffix.col ?? 1,
                    endLineNumber: linkSuffix.rowEnd,
                    endColumn: linkSuffix.colEnd
                };
            }
            await this._editorService.openEditor({
                resource: link.uri,
                options: { pinned: true, selection, revealIfOpened: true }
            });
        }
    };
    exports.TerminalLocalFileLinkOpener = TerminalLocalFileLinkOpener;
    exports.TerminalLocalFileLinkOpener = TerminalLocalFileLinkOpener = __decorate([
        __param(0, editorService_1.IEditorService)
    ], TerminalLocalFileLinkOpener);
    let TerminalLocalFolderInWorkspaceLinkOpener = class TerminalLocalFolderInWorkspaceLinkOpener {
        constructor(_commandService) {
            this._commandService = _commandService;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open folder in workspace link without a resolved URI');
            }
            await this._commandService.executeCommand('revealInExplorer', link.uri);
        }
    };
    exports.TerminalLocalFolderInWorkspaceLinkOpener = TerminalLocalFolderInWorkspaceLinkOpener;
    exports.TerminalLocalFolderInWorkspaceLinkOpener = TerminalLocalFolderInWorkspaceLinkOpener = __decorate([
        __param(0, commands_1.ICommandService)
    ], TerminalLocalFolderInWorkspaceLinkOpener);
    let TerminalLocalFolderOutsideWorkspaceLinkOpener = class TerminalLocalFolderOutsideWorkspaceLinkOpener {
        constructor(_hostService) {
            this._hostService = _hostService;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open folder in workspace link without a resolved URI');
            }
            this._hostService.openWindow([{ folderUri: link.uri }], { forceNewWindow: true });
        }
    };
    exports.TerminalLocalFolderOutsideWorkspaceLinkOpener = TerminalLocalFolderOutsideWorkspaceLinkOpener;
    exports.TerminalLocalFolderOutsideWorkspaceLinkOpener = TerminalLocalFolderOutsideWorkspaceLinkOpener = __decorate([
        __param(0, host_1.IHostService)
    ], TerminalLocalFolderOutsideWorkspaceLinkOpener);
    let TerminalSearchLinkOpener = class TerminalSearchLinkOpener {
        constructor(_capabilities, _initialCwd, _localFileOpener, _localFolderInWorkspaceOpener, _getOS, _fileService, _instantiationService, _logService, _quickInputService, _searchService, _workspaceContextService, _workbenchEnvironmentService) {
            this._capabilities = _capabilities;
            this._initialCwd = _initialCwd;
            this._localFileOpener = _localFileOpener;
            this._localFolderInWorkspaceOpener = _localFolderInWorkspaceOpener;
            this._getOS = _getOS;
            this._fileService = _fileService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._quickInputService = _quickInputService;
            this._searchService = _searchService;
            this._workspaceContextService = _workspaceContextService;
            this._workbenchEnvironmentService = _workbenchEnvironmentService;
            this._fileQueryBuilder = this._instantiationService.createInstance(queryBuilder_1.QueryBuilder);
        }
        async open(link) {
            const osPath = (0, terminalLinkHelpers_1.osPathModule)(this._getOS());
            const pathSeparator = osPath.sep;
            // Remove file:/// and any leading ./ or ../ since quick access doesn't understand that format
            let text = link.text.replace(/^file:\/\/\/?/, '');
            text = osPath.normalize(text).replace(/^(\.+[\\/])+/, '');
            // Remove `:<one or more non number characters>` from the end of the link.
            // Examples:
            // - Ruby stack traces: <link>:in ...
            // - Grep output: <link>:<result line>
            // This only happens when the colon is _not_ followed by a forward- or back-slash as that
            // would break absolute Windows paths (eg. `C:/Users/...`).
            text = text.replace(/:[^\\/\d][^\d]*$/, '');
            // Remove any trailing periods after the line/column numbers, to prevent breaking the search feature, #200257
            // Examples:
            // "Check your code Test.tsx:12:45." -> Test.tsx:12:45
            // "Check your code Test.tsx:12." -> Test.tsx:12
            text = text.replace(/\.$/, '');
            // If any of the names of the folders in the workspace matches
            // a prefix of the link, remove that prefix and continue
            this._workspaceContextService.getWorkspace().folders.forEach((folder) => {
                if (text.substring(0, folder.name.length + 1) === folder.name + pathSeparator) {
                    text = text.substring(folder.name.length + 1);
                    return;
                }
            });
            let cwdResolvedText = text;
            if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                cwdResolvedText = (0, terminalLinkHelpers_1.updateLinkWithRelativeCwd)(this._capabilities, link.bufferRange.start.y, text, osPath, this._logService)?.[0] || text;
            }
            // Try open the cwd resolved link first
            if (await this._tryOpenExactLink(cwdResolvedText, link)) {
                return;
            }
            // If the cwd resolved text didn't match, try find the link without the cwd resolved, for
            // example when a command prints paths in a sub-directory of the current cwd
            if (text !== cwdResolvedText) {
                if (await this._tryOpenExactLink(text, link)) {
                    return;
                }
            }
            // Fallback to searching quick access
            return this._quickInputService.quickAccess.show(text);
        }
        async _getExactMatch(sanitizedLink) {
            // Make the link relative to the cwd if it isn't absolute
            const os = this._getOS();
            const pathModule = (0, terminalLinkHelpers_1.osPathModule)(os);
            const isAbsolute = pathModule.isAbsolute(sanitizedLink);
            let absolutePath = isAbsolute ? sanitizedLink : undefined;
            if (!isAbsolute && this._initialCwd.length > 0) {
                absolutePath = pathModule.join(this._initialCwd, sanitizedLink);
            }
            // Try open as an absolute link
            let resourceMatch;
            if (absolutePath) {
                let normalizedAbsolutePath = absolutePath;
                if (os === 1 /* OperatingSystem.Windows */) {
                    normalizedAbsolutePath = absolutePath.replace(/\\/g, '/');
                    if (normalizedAbsolutePath.match(/[a-z]:/i)) {
                        normalizedAbsolutePath = `/${normalizedAbsolutePath}`;
                    }
                }
                let uri;
                if (this._workbenchEnvironmentService.remoteAuthority) {
                    uri = uri_1.URI.from({
                        scheme: network_1.Schemas.vscodeRemote,
                        authority: this._workbenchEnvironmentService.remoteAuthority,
                        path: normalizedAbsolutePath
                    });
                }
                else {
                    uri = uri_1.URI.file(normalizedAbsolutePath);
                }
                try {
                    const fileStat = await this._fileService.stat(uri);
                    resourceMatch = { uri, isDirectory: fileStat.isDirectory };
                }
                catch {
                    // File or dir doesn't exist, continue on
                }
            }
            // Search the workspace if an exact match based on the absolute path was not found
            if (!resourceMatch) {
                const results = await this._searchService.fileSearch(this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders, {
                    filePattern: sanitizedLink,
                    maxResults: 2
                }));
                if (results.results.length > 0) {
                    if (results.results.length === 1) {
                        // If there's exactly 1 search result, return it regardless of whether it's
                        // exact or partial.
                        resourceMatch = { uri: results.results[0].resource };
                    }
                    else if (!isAbsolute) {
                        // For non-absolute links, exact link matching is allowed only if there is a single an exact
                        // file match. For example searching for `foo.txt` when there is no cwd information
                        // available (ie. only the initial cwd) should open the file directly only if there is a
                        // single file names `foo.txt` anywhere within the folder. These same rules apply to
                        // relative paths with folders such as `src/foo.txt`.
                        const results = await this._searchService.fileSearch(this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders, {
                            filePattern: `**/${sanitizedLink}`
                        }));
                        // Find an exact match if it exists
                        const exactMatches = results.results.filter(e => e.resource.toString().endsWith(sanitizedLink));
                        if (exactMatches.length === 1) {
                            resourceMatch = { uri: exactMatches[0].resource };
                        }
                    }
                }
            }
            return resourceMatch;
        }
        async _tryOpenExactLink(text, link) {
            const sanitizedLink = text.replace(/:\d+(:\d+)?$/, '');
            try {
                const result = await this._getExactMatch(sanitizedLink);
                if (result) {
                    const { uri, isDirectory } = result;
                    const linkToOpen = {
                        // Use the absolute URI's path here so the optional line/col get detected
                        text: result.uri.path + (text.match(/:\d+(:\d+)?$/)?.[0] || ''),
                        uri,
                        bufferRange: link.bufferRange,
                        type: link.type
                    };
                    if (uri) {
                        await (isDirectory ? this._localFolderInWorkspaceOpener.open(linkToOpen) : this._localFileOpener.open(linkToOpen));
                        return true;
                    }
                }
            }
            catch {
                return false;
            }
            return false;
        }
    };
    exports.TerminalSearchLinkOpener = TerminalSearchLinkOpener;
    exports.TerminalSearchLinkOpener = TerminalSearchLinkOpener = __decorate([
        __param(5, files_1.IFileService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, terminal_1.ITerminalLogService),
        __param(8, quickInput_1.IQuickInputService),
        __param(9, search_1.ISearchService),
        __param(10, workspace_1.IWorkspaceContextService),
        __param(11, environmentService_1.IWorkbenchEnvironmentService)
    ], TerminalSearchLinkOpener);
    let TerminalUrlLinkOpener = class TerminalUrlLinkOpener {
        constructor(_isRemote, _openerService, _configurationService) {
            this._isRemote = _isRemote;
            this._openerService = _openerService;
            this._configurationService = _configurationService;
        }
        async open(link) {
            if (!link.uri) {
                throw new Error('Tried to open a url without a resolved URI');
            }
            // It's important to use the raw string value here to avoid converting pre-encoded values
            // from the URL like `%2B` -> `+`.
            this._openerService.open(link.text, {
                allowTunneling: this._isRemote && this._configurationService.getValue('remote.forwardOnOpen'),
                allowContributedOpeners: true,
                openExternal: true
            });
        }
    };
    exports.TerminalUrlLinkOpener = TerminalUrlLinkOpener;
    exports.TerminalUrlLinkOpener = TerminalUrlLinkOpener = __decorate([
        __param(1, opener_1.IOpenerService),
        __param(2, configuration_1.IConfigurationService)
    ], TerminalUrlLinkOpener);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rT3BlbmVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL2Jyb3dzZXIvdGVybWluYWxMaW5rT3BlbmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3QnpGLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTJCO1FBQ3ZDLFlBQ2tDLGNBQThCO1lBQTlCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUVoRSxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUF5QjtZQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztZQUNuRSxDQUFDO1lBQ0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUEsbUNBQWEsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkYsSUFBSSxTQUFTLEdBQXFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDakUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNoQixTQUFTLEdBQUcsVUFBVSxFQUFFLEdBQUcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZELGVBQWUsRUFBRSxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQ3BDLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQ2hDLGFBQWEsRUFBRSxVQUFVLENBQUMsTUFBTTtvQkFDaEMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxNQUFNO2lCQUM1QixDQUFD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