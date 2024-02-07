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
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/cancellation", "vs/base/common/process", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/extensions", "vs/platform/issue/common/issue", "vs/platform/product/common/productService", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/theme", "vs/workbench/services/assignment/common/assignmentService", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/abstractExtensionService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/integrity/common/integrity", "vs/platform/log/common/log", "vs/workbench/services/issue/common/issue", "vs/base/browser/window"], function (require, exports, browser_1, cancellation_1, process_1, globals_1, extensionManagement_1, extensions_1, extensions_2, issue_1, productService_1, colorRegistry_1, themeService_1, workspaceTrust_1, theme_1, assignmentService_1, authentication_1, environmentService_1, extensionManagement_2, abstractExtensionService_1, extensions_3, integrity_1, log_1, issue_2, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIssueReporterStyles = exports.NativeIssueService = void 0;
    let NativeIssueService = class NativeIssueService {
        constructor(issueMainService, themeService, extensionManagementService, extensionEnablementService, environmentService, workspaceTrustManagementService, productService, experimentService, authenticationService, integrityService, extensionService, logService) {
            this.issueMainService = issueMainService;
            this.themeService = themeService;
            this.extensionManagementService = extensionManagementService;
            this.extensionEnablementService = extensionEnablementService;
            this.environmentService = environmentService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.productService = productService;
            this.experimentService = experimentService;
            this.authenticationService = authenticationService;
            this.integrityService = integrityService;
            this.extensionService = extensionService;
            this.logService = logService;
            this._handlers = new Map();
            this._providers = new Map();
            this._activationEventReader = new abstractExtensionService_1.ImplicitActivationAwareReader();
            globals_1.ipcRenderer.on('vscode:triggerIssueUriRequestHandler', async (event, request) => {
                const result = await this.getIssueReporterUri(request.extensionId, cancellation_1.CancellationToken.None);
                globals_1.ipcRenderer.send(request.replyChannel, result.toString());
            });
            globals_1.ipcRenderer.on('vscode:triggerIssueDataProvider', async (event, request) => {
                const result = await this.getIssueData(request.extensionId, cancellation_1.CancellationToken.None);
                globals_1.ipcRenderer.send(request.replyChannel, result);
            });
            globals_1.ipcRenderer.on('vscode:triggerIssueDataTemplate', async (event, request) => {
                const result = await this.getIssueTemplate(request.extensionId, cancellation_1.CancellationToken.None);
                globals_1.ipcRenderer.send(request.replyChannel, result);
            });
            globals_1.ipcRenderer.on('vscode:triggerReporterStatus', async (event, arg) => {
                const extensionId = arg.extensionId;
                const extension = await this.extensionService.getExtension(extensionId);
                if (extension) {
                    const activationEvents = this._activationEventReader.readActivationEvents(extension);
                    for (const activationEvent of activationEvents) {
                        if (activationEvent === 'onIssueReporterOpened') {
                            const eventName = `onIssueReporterOpened:${extensions_1.ExtensionIdentifier.toKey(extension.identifier)}`;
                            try {
                                await this.extensionService.activateById(extension.identifier, { startup: false, extensionId: extension.identifier, activationEvent: eventName });
                            }
                            catch (e) {
                                this.logService.error(`Error activating extension ${extensionId}: ${e}`);
                            }
                            break;
                        }
                    }
                }
                const result = [this._providers.has(extensionId.toLowerCase()), this._handlers.has(extensionId.toLowerCase())];
                globals_1.ipcRenderer.send('vscode:triggerReporterStatusResponse', result);
            });
        }
        async openReporter(dataOverrides = {}) {
            const extensionData = [];
            try {
                const extensions = await this.extensionManagementService.getInstalled();
                const enabledExtensions = extensions.filter(extension => this.extensionEnablementService.isEnabled(extension) || (dataOverrides.extensionId && extension.identifier.id === dataOverrides.extensionId));
                extensionData.push(...enabledExtensions.map((extension) => {
                    const { manifest } = extension;
                    const manifestKeys = manifest.contributes ? Object.keys(manifest.contributes) : [];
                    const isTheme = !manifest.main && !manifest.browser && manifestKeys.length === 1 && manifestKeys[0] === 'themes';
                    const isBuiltin = extension.type === 0 /* ExtensionType.System */;
                    return {
                        name: manifest.name,
                        publisher: manifest.publisher,
                        version: manifest.version,
                        repositoryUrl: manifest.repository && manifest.repository.url,
                        bugsUrl: manifest.bugs && manifest.bugs.url,
                        hasIssueUriRequestHandler: this._handlers.has(extension.identifier.id.toLowerCase()),
                        hasIssueDataProviders: this._providers.has(extension.identifier.id.toLowerCase()),
                        displayName: manifest.displayName,
                        id: extension.identifier.id,
                        command: dataOverrides.command,
                        isTheme,
                        isBuiltin,
                        extensionData: 'Extensions data loading',
                    };
                }));
            }
            catch (e) {
                extensionData.push({
                    name: 'Workbench Issue Service',
                    publisher: 'Unknown',
                    version: '0.0.0',
                    repositoryUrl: undefined,
                    bugsUrl: undefined,
                    extensionData: 'Extensions data loading',
                    displayName: `Extensions not loaded: ${e}`,
                    id: 'workbench.issue',
                    isTheme: false,
                    isBuiltin: true
                });
            }
            const experiments = await this.experimentService.getCurrentExperiments();
            let githubAccessToken = '';
            try {
                const githubSessions = await this.authenticationService.getSessions('github');
                const potentialSessions = githubSessions.filter(session => session.scopes.includes('repo'));
                githubAccessToken = potentialSessions[0]?.accessToken;
            }
            catch (e) {
                // Ignore
            }
            // air on the side of caution and have false be the default
            let isUnsupported = false;
            try {
                isUnsupported = !(await this.integrityService.isPure()).isPure;
            }
            catch (e) {
                // Ignore
            }
            const theme = this.themeService.getColorTheme();
            const issueReporterData = Object.assign({
                styles: getIssueReporterStyles(theme),
                zoomLevel: (0, browser_1.getZoomLevel)(window_1.mainWindow),
                enabledExtensions: extensionData,
                experiments: experiments?.join('\n'),
                restrictedMode: !this.workspaceTrustManagementService.isWorkspaceTrusted(),
                isUnsupported,
                githubAccessToken
            }, dataOverrides);
            return this.issueMainService.openReporter(issueReporterData);
        }
        openProcessExplorer() {
            const theme = this.themeService.getColorTheme();
            const data = {
                pid: this.environmentService.mainPid,
                zoomLevel: (0, browser_1.getZoomLevel)(window_1.mainWindow),
                styles: {
                    backgroundColor: getColor(theme, colorRegistry_1.editorBackground),
                    color: getColor(theme, colorRegistry_1.editorForeground),
                    listHoverBackground: getColor(theme, colorRegistry_1.listHoverBackground),
                    listHoverForeground: getColor(theme, colorRegistry_1.listHoverForeground),
                    listFocusBackground: getColor(theme, colorRegistry_1.listFocusBackground),
                    listFocusForeground: getColor(theme, colorRegistry_1.listFocusForeground),
                    listFocusOutline: getColor(theme, colorRegistry_1.listFocusOutline),
                    listActiveSelectionBackground: getColor(theme, colorRegistry_1.listActiveSelectionBackground),
                    listActiveSelectionForeground: getColor(theme, colorRegistry_1.listActiveSelectionForeground),
                    listHoverOutline: getColor(theme, colorRegistry_1.activeContrastBorder),
                    scrollbarShadowColor: getColor(theme, colorRegistry_1.scrollbarShadow),
                    scrollbarSliderActiveBackgroundColor: getColor(theme, colorRegistry_1.scrollbarSliderActiveBackground),
                    scrollbarSliderBackgroundColor: getColor(theme, colorRegistry_1.scrollbarSliderBackground),
                    scrollbarSliderHoverBackgroundColor: getColor(theme, colorRegistry_1.scrollbarSliderHoverBackground),
                },
                platform: process_1.platform,
                applicationName: this.productService.applicationName
            };
            return this.issueMainService.openProcessExplorer(data);
        }
        registerIssueUriRequestHandler(extensionId, handler) {
            this._handlers.set(extensionId.toLowerCase(), handler);
            return {
                dispose: () => this._handlers.delete(extensionId)
            };
        }
        async getIssueReporterUri(extensionId, token) {
            const handler = this._handlers.get(extensionId);
            if (!handler) {
                throw new Error(`No issue uri request handler registered for extension '${extensionId}'`);
            }
            return handler.provideIssueUrl(token);
        }
        registerIssueDataProvider(extensionId, handler) {
            this._providers.set(extensionId.toLowerCase(), handler);
            return {
                dispose: () => this._providers.delete(extensionId)
            };
        }
        async getIssueData(extensionId, token) {
            const provider = this._providers.get(extensionId);
            if (!provider) {
                throw new Error(`No issue uri request provider registered for extension '${extensionId}'`);
            }
            return provider.provideIssueExtensionData(token);
        }
        async getIssueTemplate(extensionId, token) {
            const provider = this._providers.get(extensionId);
            if (!provider) {
                throw new Error(`No issue uri request provider registered for extension '${extensionId}'`);
            }
            return provider.provideIssueExtensionTemplate(token);
        }
    };
    exports.NativeIssueService = NativeIssueService;
    exports.NativeIssueService = NativeIssueService = __decorate([
        __param(0, issue_1.IIssueMainService),
        __param(1, themeService_1.IThemeService),
        __param(2, extensionManagement_1.IExtensionManagementService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(4, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(5, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(6, productService_1.IProductService),
        __param(7, assignmentService_1.IWorkbenchAssignmentService),
        __param(8, authentication_1.IAuthenticationService),
        __param(9, integrity_1.IIntegrityService),
        __param(10, extensions_3.IExtensionService),
        __param(11, log_1.ILogService)
    ], NativeIssueService);
    function getIssueReporterStyles(theme) {
        return {
            backgroundColor: getColor(theme, theme_1.SIDE_BAR_BACKGROUND),
            color: getColor(theme, colorRegistry_1.foreground),
            textLinkColor: getColor(theme, colorRegistry_1.textLinkForeground),
            textLinkActiveForeground: getColor(theme, colorRegistry_1.textLinkActiveForeground),
            inputBackground: getColor(theme, colorRegistry_1.inputBackground),
            inputForeground: getColor(theme, colorRegistry_1.inputForeground),
            inputBorder: getColor(theme, colorRegistry_1.inputBorder),
            inputActiveBorder: getColor(theme, colorRegistry_1.inputActiveOptionBorder),
            inputErrorBorder: getColor(theme, colorRegistry_1.inputValidationErrorBorder),
            inputErrorBackground: getColor(theme, colorRegistry_1.inputValidationErrorBackground),
            inputErrorForeground: getColor(theme, colorRegistry_1.inputValidationErrorForeground),
            buttonBackground: getColor(theme, colorRegistry_1.buttonBackground),
            buttonForeground: getColor(theme, colorRegistry_1.buttonForeground),
            buttonHoverBackground: getColor(theme, colorRegistry_1.buttonHoverBackground),
            sliderActiveColor: getColor(theme, colorRegistry_1.scrollbarSliderActiveBackground),
            sliderBackgroundColor: getColor(theme, colorRegistry_1.scrollbarSliderBackground),
            sliderHoverColor: getColor(theme, colorRegistry_1.scrollbarSliderHoverBackground),
        };
    }
    exports.getIssueReporterStyles = getIssueReporterStyles;
    function getColor(theme, key) {
        const color = theme.getColor(key);
        return color ? color.toString() : undefined;
    }
    (0, extensions_2.registerSingleton)(issue_2.IWorkbenchIssueService, NativeIssueService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvaXNzdWUvZWxlY3Ryb24tc2FuZGJveC9pc3N1ZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNEJ6RixJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFrQjtRQU85QixZQUNvQixnQkFBb0QsRUFDeEQsWUFBNEMsRUFDOUIsMEJBQXdFLEVBQy9ELDBCQUFpRixFQUNuRixrQkFBdUUsRUFDekUsK0JBQWtGLEVBQ25HLGNBQWdELEVBQ3BDLGlCQUErRCxFQUNwRSxxQkFBOEQsRUFDbkUsZ0JBQW9ELEVBQ3BELGdCQUFvRCxFQUMxRCxVQUF3QztZQVhqQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3ZDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ2IsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUM5QywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQXNDO1lBQ2xFLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0M7WUFDeEQsb0NBQStCLEdBQS9CLCtCQUErQixDQUFrQztZQUNsRixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUE2QjtZQUNuRCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQ2xELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDbkMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN6QyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBaEJyQyxjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQW1DLENBQUM7WUFDdkQsZUFBVSxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1lBQ25ELDJCQUFzQixHQUFHLElBQUksd0RBQTZCLEVBQUUsQ0FBQztZ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