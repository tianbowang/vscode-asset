/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/performance", "vs/base/common/uri", "vs/workbench/api/node/uriTransformer", "vs/base/common/uriIpc", "vs/base/node/ps", "vs/platform/diagnostics/node/diagnosticsService", "vs/base/common/path", "vs/base/common/resources"], function (require, exports, platform, performance, uri_1, uriTransformer_1, uriIpc_1, ps_1, diagnosticsService_1, path_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteAgentEnvironmentChannel = void 0;
    class RemoteAgentEnvironmentChannel {
        static { this._namePool = 1; }
        constructor(_connectionToken, _environmentService, _userDataProfilesService, _extensionHostStatusService) {
            this._connectionToken = _connectionToken;
            this._environmentService = _environmentService;
            this._userDataProfilesService = _userDataProfilesService;
            this._extensionHostStatusService = _extensionHostStatusService;
        }
        async call(_, command, arg) {
            switch (command) {
                case 'getEnvironmentData': {
                    const args = arg;
                    const uriTransformer = (0, uriTransformer_1.createURITransformer)(args.remoteAuthority);
                    let environmentData = await this._getEnvironmentData(args.profile);
                    environmentData = (0, uriIpc_1.transformOutgoingURIs)(environmentData, uriTransformer);
                    return environmentData;
                }
                case 'getExtensionHostExitInfo': {
                    const args = arg;
                    return this._extensionHostStatusService.getExitInfo(args.reconnectionToken);
                }
                case 'getDiagnosticInfo': {
                    const options = arg;
                    const diagnosticInfo = {
                        machineInfo: (0, diagnosticsService_1.getMachineInfo)()
                    };
                    const processesPromise = options.includeProcesses ? (0, ps_1.listProcesses)(process.pid) : Promise.resolve();
                    let workspaceMetadataPromises = [];
                    const workspaceMetadata = {};
                    if (options.folders) {
                        // only incoming paths are transformed, so remote authority is unneeded.
                        const uriTransformer = (0, uriTransformer_1.createURITransformer)('');
                        const folderPaths = options.folders
                            .map(folder => uri_1.URI.revive(uriTransformer.transformIncoming(folder)))
                            .filter(uri => uri.scheme === 'file');
                        workspaceMetadataPromises = folderPaths.map(folder => {
                            return (0, diagnosticsService_1.collectWorkspaceStats)(folder.fsPath, ['node_modules', '.git'])
                                .then(stats => {
                                workspaceMetadata[(0, path_1.basename)(folder.fsPath)] = stats;
                            });
                        });
                    }
                    return Promise.all([processesPromise, ...workspaceMetadataPromises]).then(([processes, _]) => {
                        diagnosticInfo.processes = processes || undefined;
                        diagnosticInfo.workspaceMetadata = options.folders ? workspaceMetadata : undefined;
                        return diagnosticInfo;
                    });
                }
            }
            throw new Error(`IPC Command ${command} not found`);
        }
        listen(_, event, arg) {
            throw new Error('Not supported');
        }
        async _getEnvironmentData(profile) {
            if (profile && !this._userDataProfilesService.profiles.some(p => p.id === profile)) {
                await this._userDataProfilesService.createProfile(profile, profile);
            }
            return {
                pid: process.pid,
                connectionToken: (this._connectionToken.type !== 0 /* ServerConnectionTokenType.None */ ? this._connectionToken.value : ''),
                appRoot: uri_1.URI.file(this._environmentService.appRoot),
                settingsPath: this._environmentService.machineSettingsResource,
                logsPath: this._environmentService.logsHome,
                extensionHostLogsPath: (0, resources_1.joinPath)(this._environmentService.logsHome, `exthost${RemoteAgentEnvironmentChannel._namePool++}`),
                globalStorageHome: this._userDataProfilesService.defaultProfile.globalStorageHome,
                workspaceStorageHome: this._environmentService.workspaceStorageHome,
                localHistoryHome: this._environmentService.localHistoryHome,
                userHome: this._environmentService.userHome,
                os: platform.OS,
                arch: process.arch,
                marks: performance.getMarks(),
                useHostProxy: !!this._environmentService.args['use-host-proxy'],
                profiles: {
                    home: this._userDataProfilesService.profilesHome,
                    all: [...this._userDataProfilesService.profiles].map(profile => ({ ...profile }))
                }
            };
        }
    }
    exports.RemoteAgentEnvironmentChannel = RemoteAgentEnvironmentChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQWdlbnRFbnZpcm9ubWVudEltcGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3NlcnZlci9ub2RlL3JlbW90ZUFnZW50RW52aXJvbm1lbnRJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsTUFBYSw2QkFBNkI7aUJBRTFCLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFFN0IsWUFDa0IsZ0JBQXVDLEVBQ3ZDLG1CQUE4QyxFQUM5Qyx3QkFBa0QsRUFDbEQsMkJBQXdEO1lBSHhELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBdUI7WUFDdkMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUEyQjtZQUM5Qyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ2xELGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7UUFFMUUsQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBTSxFQUFFLE9BQWUsRUFBRSxHQUFTO1lBQzVDLFFBQVEsT0FBTyxFQUFFLENBQUM7Z0JBRWpCLEtBQUssb0JBQW9CLENBQUMsQ0FBQyxDQUFDO29CQUMzQixNQUFNLElBQUksR0FBaUMsR0FBRyxDQUFDO29CQUMvQyxNQUFNLGNBQWMsR0FBRyxJQUFBLHFDQUFvQixFQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFFbEUsSUFBSSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNuRSxlQUFlLEdBQUcsSUFBQSw4QkFBcUIsRUFBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBRXpFLE9BQU8sZUFBZSxDQUFDO2dCQUN4QixDQUFDO2dCQUVELEtBQUssMEJBQTBCLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxNQUFNLElBQUksR0FBdUMsR0FBRyxDQUFDO29CQUNyRCxP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