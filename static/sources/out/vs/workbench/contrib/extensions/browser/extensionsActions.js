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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/json", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensionsFileTemplate", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensions/common/extensions", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/configuration/common/jsonEditing", "vs/editor/common/services/resolverService", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/browser/actions/workspaceCommands", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/workbench/services/editor/common/editorService", "vs/platform/quickinput/common/quickInput", "vs/base/common/cancellation", "vs/base/browser/ui/aria/aria", "vs/workbench/services/themes/common/workbenchThemeService", "vs/platform/label/common/label", "vs/workbench/services/textfile/common/textfiles", "vs/platform/product/common/productService", "vs/platform/dialogs/common/dialogs", "vs/platform/progress/common/progress", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig", "vs/base/common/errors", "vs/platform/userDataSync/common/userDataSync", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/platform/log/common/log", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/base/common/platform", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/workspace/common/workspaceTrust", "vs/platform/workspace/common/virtualWorkspace", "vs/base/common/htmlContent", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/arrays", "vs/base/common/date", "vs/workbench/services/preferences/common/preferences", "vs/platform/languagePacks/common/languagePacks", "vs/workbench/services/localization/common/locale", "vs/base/common/types", "vs/workbench/services/log/common/logConstants", "vs/platform/telemetry/common/telemetry", "vs/css!./media/extensionActions"], function (require, exports, nls_1, actions_1, async_1, DOM, event_1, json, contextView_1, lifecycle_1, extensions_1, extensionsFileTemplate_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, extensionManagementUtil_1, extensions_2, instantiation_1, files_1, workspace_1, host_1, extensions_3, uri_1, commands_1, configuration_1, themeService_1, themables_1, colorRegistry_1, jsonEditing_1, resolverService_1, contextkey_1, actions_2, workspaceCommands_1, notification_1, opener_1, editorService_1, quickInput_1, cancellation_1, aria_1, workbenchThemeService_1, label_1, textfiles_1, productService_1, dialogs_1, progress_1, actionViewItems_1, workspaceExtensionsConfig_1, errors_1, userDataSync_1, dropdownActionViewItem_1, log_1, extensionsIcons_1, platform_1, extensionManifestPropertiesService_1, workspaceTrust_1, virtualWorkspace_1, htmlContent_1, panecomposite_1, arrays_1, date_1, preferences_1, languagePacks_1, locale_1, types_1, logConstants_1, telemetry_1) {
    "use strict";
    var InstallAction_1, InstallInOtherServerAction_1, UninstallAction_1, ToggleAutoUpdateForExtensionAction_1, ToggleAutoUpdatesForPublisherAction_1, MigrateDeprecatedExtensionAction_1, ManageExtensionAction_1, TogglePreReleaseExtensionAction_1, InstallAnotherVersionAction_1, EnableForWorkspaceAction_1, EnableGloballyAction_1, DisableForWorkspaceAction_1, DisableGloballyAction_1, ReloadAction_1, SetColorThemeAction_1, SetFileIconThemeAction_1, SetProductIconThemeAction_1, SetLanguageAction_1, ClearLanguageAction_1, ShowRecommendedExtensionAction_1, InstallRecommendedExtensionAction_1, IgnoreExtensionRecommendationAction_1, UndoIgnoreExtensionRecommendationAction_1, ExtensionStatusLabelAction_1, ToggleSyncExtensionAction_1, ExtensionStatusAction_1, ReinstallAction_1, InstallSpecificVersionOfExtensionAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extensionButtonProminentBackground = exports.InstallRemoteExtensionsInLocalAction = exports.InstallLocalExtensionsInRemoteAction = exports.AbstractInstallExtensionsInServerAction = exports.InstallSpecificVersionOfExtensionAction = exports.ReinstallAction = exports.ExtensionStatusAction = exports.ToggleSyncExtensionAction = exports.ExtensionStatusLabelAction = exports.ConfigureWorkspaceFolderRecommendedExtensionsAction = exports.ConfigureWorkspaceRecommendedExtensionsAction = exports.AbstractConfigureRecommendedExtensionsAction = exports.SearchExtensionsAction = exports.UndoIgnoreExtensionRecommendationAction = exports.IgnoreExtensionRecommendationAction = exports.InstallRecommendedExtensionAction = exports.ShowRecommendedExtensionAction = exports.ClearLanguageAction = exports.SetLanguageAction = exports.SetProductIconThemeAction = exports.SetFileIconThemeAction = exports.SetColorThemeAction = exports.ReloadAction = exports.DisableDropDownAction = exports.EnableDropDownAction = exports.DisableGloballyAction = exports.DisableForWorkspaceAction = exports.EnableGloballyAction = exports.EnableForWorkspaceAction = exports.InstallAnotherVersionAction = exports.TogglePreReleaseExtensionAction = exports.MenuItemExtensionAction = exports.ExtensionEditorManageExtensionAction = exports.ManageExtensionAction = exports.getContextMenuActions = exports.DropDownMenuActionViewItem = exports.ExtensionDropDownAction = exports.ExtensionActionWithDropdownActionViewItem = exports.MigrateDeprecatedExtensionAction = exports.ToggleAutoUpdatesForPublisherAction = exports.ToggleAutoUpdateForExtensionAction = exports.UpdateAction = exports.UninstallAction = exports.WebInstallAction = exports.LocalInstallAction = exports.RemoteInstallAction = exports.InstallInOtherServerAction = exports.InstallingLabelAction = exports.InstallDropdownAction = exports.InstallAction = exports.ActionWithDropDownAction = exports.ExtensionAction = exports.PromptExtensionInstallFailureAction = void 0;
    let PromptExtensionInstallFailureAction = class PromptExtensionInstallFailureAction extends actions_1.Action {
        constructor(extension, version, installOperation, error, productService, openerService, notificationService, dialogService, commandService, logService, extensionManagementServerService, instantiationService, galleryService, extensionManifestPropertiesService) {
            super('extension.promptExtensionInstallFailure');
            this.extension = extension;
            this.version = version;
            this.installOperation = installOperation;
            this.error = error;
            this.productService = productService;
            this.openerService = openerService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.commandService = commandService;
            this.logService = logService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.instantiationService = instantiationService;
            this.galleryService = galleryService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        }
        async run() {
            if ((0, errors_1.isCancellationError)(this.error)) {
                return;
            }
            this.logService.error(this.error);
            if (this.error.name === extensionManagement_1.ExtensionManagementErrorCode.Unsupported) {
                const productName = platform_1.isWeb ? (0, nls_1.localize)('VS Code for Web', "{0} for the Web", this.productService.nameLong) : this.productService.nameLong;
                const message = (0, nls_1.localize)('cannot be installed', "The '{0}' extension is not available in {1}. Click 'More Information' to learn more.", this.extension.displayName || this.extension.identifier.id, productName);
                const { confirmed } = await this.dialogService.confirm({
                    type: notification_1.Severity.Info,
                    message,
                    primaryButton: (0, nls_1.localize)({ key: 'more information', comment: ['&& denotes a mnemonic'] }, "&&More Information"),
                    cancelButton: (0, nls_1.localize)('close', "Close")
                });
                if (confirmed) {
                    this.openerService.open(platform_1.isWeb ? uri_1.URI.parse('https://aka.ms/vscode-web-extensions-guide') : uri_1.URI.parse('https://aka.ms/vscode-remote'));
                }
                return;
            }
            if (extensionManagement_1.ExtensionManagementErrorCode.ReleaseVersionNotFound === this.error.name) {
                await this.dialogService.prompt({
                    type: 'error',
                    message: (0, errors_1.getErrorMessage)(this.error),
                    buttons: [{
                            label: (0, nls_1.localize)('install prerelease', "Install Pre-Release"),
                            run: () => {
                                const installAction = this.instantiationService.createInstance(InstallAction, { installPreReleaseVersion: true });
                                installAction.extension = this.extension;
                                return installAction.run();
                            }
                        }],
                    cancelButton: (0, nls_1.localize)('cancel', "Cancel")
                });
                return;
            }
            if ([extensionManagement_1.ExtensionManagementErrorCode.Incompatible, extensionManagement_1.ExtensionManagementErrorCode.IncompatibleTargetPlatform, extensionManagement_1.ExtensionManagementErrorCode.Malicious, extensionManagement_1.ExtensionManagementErrorCode.Deprecated].includes(this.error.name)) {
                await this.dialogService.info((0, errors_1.getErrorMessage)(this.error));
                return;
            }
            if (extensionManagement_1.ExtensionManagementErrorCode.Signature === this.error.name) {
                await this.dialogService.prompt({
                    type: 'error',
                    message: (0, nls_1.localize)('signature verification failed', "{0} cannot verify the '{1}' extension. Are you sure you want to install it?", this.productService.nameLong, this.extension.displayName || this.extension.identifier.id),
                    buttons: [{
                            label: (0, nls_1.localize)('install anyway', "Install Anyway"),
                            run: () => {
                                const installAction = this.instantiationService.createInstance(InstallAction, { donotVerifySignature: true });
                                installAction.extension = this.extension;
                                return installAction.run();
                            }
                        }],
                    cancelButton: (0, nls_1.localize)('cancel', "Cancel")
                });
                return;
            }
            const operationMessage = this.installOperation === 3 /* InstallOperation.Update */ ? (0, nls_1.localize)('update operation', "Error while updating '{0}' extension.", this.extension.displayName || this.extension.identifier.id)
                : (0, nls_1.localize)('install operation', "Error while installing '{0}' extension.", this.extension.displayName || this.extension.identifier.id);
            let additionalMessage;
            const promptChoices = [];
            const downloadUrl = await this.getDownloadUrl();
            if (downloadUrl) {
                additionalMessage = (0, nls_1.localize)('check logs', "Please check the [log]({0}) for more details.", `command:${logConstants_1.showWindowLogActionId}`);
                promptChoices.push({
                    label: (0, nls_1.localize)('download', "Try Downloading Manually..."),
                    run: () => this.openerService.open(downloadUrl).then(() => {
                        this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('install vsix', 'Once downloaded, please manually install the downloaded VSIX of \'{0}\'.', this.extension.identifier.id), [{
                                label: (0, nls_1.localize)('installVSIX', "Install from VSIX..."),
                                run: () => this.commandService.executeCommand(extensions_1.SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID)
                            }]);
                    })
                });
            }
            const message = `${operationMessage}${additionalMessage ? ` ${additionalMessage}` : ''}`;
            this.notificationService.prompt(notification_1.Severity.Error, message, promptChoices);
        }
        async getDownloadUrl() {
            if (platform_1.isIOS) {
                return undefined;
            }
            if (!this.extension.gallery) {
                return undefined;
            }
            if (!this.productService.extensionsGallery) {
                return undefined;
            }
            if (!this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer) {
                return undefined;
            }
            let targetPlatform = this.extension.gallery.properties.targetPlatform;
            if (targetPlatform !== "universal" /* TargetPlatform.UNIVERSAL */ && targetPlatform !== "undefined" /* TargetPlatform.UNDEFINED */ && this.extensionManagementServerService.remoteExtensionManagementServer) {
                try {
                    const manifest = await this.galleryService.getManifest(this.extension.gallery, cancellation_1.CancellationToken.None);
                    if (manifest && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(manifest)) {
                        targetPlatform = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform();
                    }
                }
                catch (error) {
                    this.logService.error(error);
                    return undefined;
                }
            }
            if (targetPlatform === "unknown" /* TargetPlatform.UNKNOWN */) {
                return undefined;
            }
            return uri_1.URI.parse(`${this.productService.extensionsGallery.serviceUrl}/publishers/${this.extension.publisher}/vsextensions/${this.extension.name}/${this.version}/vspackage${targetPlatform !== "undefined" /* TargetPlatform.UNDEFINED */ ? `?targetPlatform=${targetPlatform}` : ''}`);
        }
    };
    exports.PromptExtensionInstallFailureAction = PromptExtensionInstallFailureAction;
    exports.PromptExtensionInstallFailureAction = PromptExtensionInstallFailureAction = __decorate([
        __param(4, productService_1.IProductService),
        __param(5, opener_1.IOpenerService),
        __param(6, notification_1.INotificationService),
        __param(7, dialogs_1.IDialogService),
        __param(8, commands_1.ICommandService),
        __param(9, log_1.ILogService),
        __param(10, extensionManagement_2.IExtensionManagementServerService),
        __param(11, instantiation_1.IInstantiationService),
        __param(12, extensionManagement_1.IExtensionGalleryService),
        __param(13, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], PromptExtensionInstallFailureAction);
    class ExtensionAction extends actions_1.Action {
        constructor() {
            super(...arguments);
            this._extension = null;
        }
        static { this.EXTENSION_ACTION_CLASS = 'extension-action'; }
        static { this.TEXT_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} text`; }
        static { this.LABEL_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} label`; }
        static { this.ICON_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} icon`; }
        get extension() { return this._extension; }
        set extension(extension) { this._extension = extension; this.update(); }
    }
    exports.ExtensionAction = ExtensionAction;
    class ActionWithDropDownAction extends ExtensionAction {
        get menuActions() { return [...this._menuActions]; }
        get extension() {
            return super.extension;
        }
        set extension(extension) {
            this.extensionActions.forEach(a => a.extension = extension);
            super.extension = extension;
        }
        constructor(id, label, actionsGroups) {
            super(id, label);
            this.actionsGroups = actionsGroups;
            this._menuActions = [];
            this.extensionActions = (0, arrays_1.flatten)(actionsGroups);
            this.update();
            this._register(event_1.Event.any(...this.extensionActions.map(a => a.onDidChange))(() => this.update(true)));
            this.extensionActions.forEach(a => this._register(a));
        }
        update(donotUpdateActions) {
            if (!donotUpdateActions) {
                this.extensionActions.forEach(a => a.update());
            }
            const enabledActionsGroups = this.actionsGroups.map(actionsGroup => actionsGroup.filter(a => a.enabled));
            let actions = [];
            for (const enabledActions of enabledActionsGroups) {
                if (enabledActions.length) {
                    actions = [...actions, ...enabledActions, new actions_1.Separator()];
                }
            }
            actions = actions.length ? actions.slice(0, actions.length - 1) : actions;
            this.action = actions[0];
            this._menuActions = actions.length > 1 ? actions : [];
            this.enabled = !!this.action;
            if (this.action) {
                this.label = this.getLabel(this.action);
                this.tooltip = this.action.tooltip;
            }
            let clazz = (this.action || this.extensionActions[0])?.class || '';
            clazz = clazz ? `${clazz} action-dropdown` : 'action-dropdown';
            if (this._menuActions.length === 0) {
                clazz += ' action-dropdown';
            }
            this.class = clazz;
        }
        run() {
            const enabledActions = this.extensionActions.filter(a => a.enabled);
            return enabledActions[0].run();
        }
        getLabel(action) {
            return action.label;
        }
    }
    exports.ActionWithDropDownAction = ActionWithDropDownAction;
    let InstallAction = class InstallAction extends ExtensionAction {
        static { InstallAction_1 = this; }
        static { this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} prominent install`; }
        set manifest(manifest) {
            this._manifest = manifest;
            this.updateLabel();
        }
        constructor(options, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService, dialogService, preferencesService, telemetryService) {
            super('extensions.install', (0, nls_1.localize)('install', "Install"), InstallAction_1.Class, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.instantiationService = instantiationService;
            this.runtimeExtensionService = runtimeExtensionService;
            this.workbenchThemeService = workbenchThemeService;
            this.labelService = labelService;
            this.dialogService = dialogService;
            this.preferencesService = preferencesService;
            this.telemetryService = telemetryService;
            this._manifest = null;
            this.updateThrottler = new async_1.Throttler();
            this.options = { ...options, isMachineScoped: false };
            this.update();
            this._register(this.labelService.onDidChangeFormatters(() => this.updateLabel(), this));
        }
        update() {
            this.updateThrottler.queue(() => this.computeAndUpdateEnablement());
        }
        async computeAndUpdateEnablement() {
            this.enabled = false;
            if (!this.extension) {
                return;
            }
            if (this.extension.isBuiltin) {
                return;
            }
            if (this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.state === 3 /* ExtensionState.Uninstalled */ && await this.extensionsWorkbenchService.canInstall(this.extension)) {
                this.enabled = this.options.installPreReleaseVersion ? this.extension.hasPreReleaseVersion : this.extension.hasReleaseVersion;
                this.updateLabel();
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            if (this.extension.deprecationInfo) {
                let detail = (0, nls_1.localize)('deprecated message', "This extension is deprecated as it is no longer being maintained.");
                let DeprecationChoice;
                (function (DeprecationChoice) {
                    DeprecationChoice[DeprecationChoice["InstallAnyway"] = 0] = "InstallAnyway";
                    DeprecationChoice[DeprecationChoice["ShowAlternateExtension"] = 1] = "ShowAlternateExtension";
                    DeprecationChoice[DeprecationChoice["ConfigureSettings"] = 2] = "ConfigureSettings";
                    DeprecationChoice[DeprecationChoice["Cancel"] = 3] = "Cancel";
                })(DeprecationChoice || (DeprecationChoice = {}));
                const buttons = [
                    {
                        label: (0, nls_1.localize)('install anyway', "Install Anyway"),
                        run: () => DeprecationChoice.InstallAnyway
                    }
                ];
                if (this.extension.deprecationInfo.extension) {
                    detail = (0, nls_1.localize)('deprecated with alternate extension message', "This extension is deprecated. Use the {0} extension instead.", this.extension.deprecationInfo.extension.displayName);
                    const alternateExtension = this.extension.deprecationInfo.extension;
                    buttons.push({
                        label: (0, nls_1.localize)({ key: 'Show alternate extension', comment: ['&& denotes a mnemonic'] }, "&&Open {0}", this.extension.deprecationInfo.extension.displayName),
                        run: async () => {
                            const [extension] = await this.extensionsWorkbenchService.getExtensions([{ id: alternateExtension.id, preRelease: alternateExtension.preRelease }], cancellation_1.CancellationToken.None);
                            await this.extensionsWorkbenchService.open(extension);
                            return DeprecationChoice.ShowAlternateExtension;
                        }
                    });
                }
                else if (this.extension.deprecationInfo.settings) {
                    detail = (0, nls_1.localize)('deprecated with alternate settings message', "This extension is deprecated as this functionality is now built-in to VS Code.");
                    const settings = this.extension.deprecationInfo.settings;
                    buttons.push({
                        label: (0, nls_1.localize)({ key: 'configure in settings', comment: ['&& denotes a mnemonic'] }, "&&Configure Settings"),
                        run: async () => {
                            await this.preferencesService.openSettings({ query: settings.map(setting => `@id:${setting}`).join(' ') });
                            return DeprecationChoice.ConfigureSettings;
                        }
                    });
                }
                else if (this.extension.deprecationInfo.additionalInfo) {
                    detail = new htmlContent_1.MarkdownString(`${detail} ${this.extension.deprecationInfo.additionalInfo}`);
                }
                const { result } = await this.dialogService.prompt({
                    type: notification_1.Severity.Warning,
                    message: (0, nls_1.localize)('install confirmation', "Are you sure you want to install '{0}'?", this.extension.displayName),
                    detail: (0, types_1.isString)(detail) ? detail : undefined,
                    custom: (0, types_1.isString)(detail) ? undefined : {
                        markdownDetails: [{
                                markdown: detail
                            }]
                    },
                    buttons,
                    cancelButton: {
                        run: () => DeprecationChoice.Cancel
                    }
                });
                if (result !== DeprecationChoice.InstallAnyway) {
                    return;
                }
            }
            this.extensionsWorkbenchService.open(this.extension, { showPreReleaseVersion: this.options.installPreReleaseVersion });
            (0, aria_1.alert)((0, nls_1.localize)('installExtensionStart', "Installing extension {0} started. An editor is now open with more details on this extension", this.extension.displayName));
            /* __GDPR__
                "extensions:action:install" : {
                    "owner": "sandy081",
                    "actionId" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            this.telemetryService.publicLog('extensions:action:install', { ...this.extension.telemetryData, actionId: this.id });
            const extension = await this.install(this.extension);
            if (extension?.local) {
                (0, aria_1.alert)((0, nls_1.localize)('installExtensionComplete', "Installing extension {0} is completed.", this.extension.displayName));
                const runningExtension = await this.getRunningExtension(extension.local);
                if (runningExtension && !(runningExtension.activationEvents && runningExtension.activationEvents.some(activationEent => activationEent.startsWith('onLanguage')))) {
                    const action = await this.getThemeAction(extension);
                    if (action) {
                        action.extension = extension;
                        try {
                            return action.run({ showCurrentTheme: true, ignoreFocusLost: true });
                        }
                        finally {
                            action.dispose();
                        }
                    }
                }
            }
        }
        async getThemeAction(extension) {
            const colorThemes = await this.workbenchThemeService.getColorThemes();
            if (colorThemes.some(theme => isThemeFromExtension(theme, extension))) {
                return this.instantiationService.createInstance(SetColorThemeAction);
            }
            const fileIconThemes = await this.workbenchThemeService.getFileIconThemes();
            if (fileIconThemes.some(theme => isThemeFromExtension(theme, extension))) {
                return this.instantiationService.createInstance(SetFileIconThemeAction);
            }
            const productIconThemes = await this.workbenchThemeService.getProductIconThemes();
            if (productIconThemes.some(theme => isThemeFromExtension(theme, extension))) {
                return this.instantiationService.createInstance(SetProductIconThemeAction);
            }
            return undefined;
        }
        async install(extension) {
            try {
                return await this.extensionsWorkbenchService.install(extension, this.options);
            }
            catch (error) {
                await this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 2 /* InstallOperation.Install */, error).run();
                return undefined;
            }
        }
        async getRunningExtension(extension) {
            const runningExtension = await this.runtimeExtensionService.getExtension(extension.identifier.id);
            if (runningExtension) {
                return runningExtension;
            }
            if (this.runtimeExtensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension))) {
                return new Promise((c, e) => {
                    const disposable = this.runtimeExtensionService.onDidChangeExtensions(async () => {
                        const runningExtension = await this.runtimeExtensionService.getExtension(extension.identifier.id);
                        if (runningExtension) {
                            disposable.dispose();
                            c(runningExtension);
                        }
                    });
                });
            }
            return null;
        }
        updateLabel() {
            this.label = this.getLabel();
        }
        getLabel(primary) {
            /* install pre-release version */
            if (this.options.installPreReleaseVersion && this.extension?.hasPreReleaseVersion) {
                return primary ? (0, nls_1.localize)('install pre-release', "Install Pre-Release") : (0, nls_1.localize)('install pre-release version', "Install Pre-Release Version");
            }
            /* install released version that has a pre release version */
            if (this.extension?.hasPreReleaseVersion) {
                return primary ? (0, nls_1.localize)('install', "Install") : (0, nls_1.localize)('install release version', "Install Release Version");
            }
            return (0, nls_1.localize)('install', "Install");
        }
    };
    exports.InstallAction = InstallAction;
    exports.InstallAction = InstallAction = InstallAction_1 = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, extensions_3.IExtensionService),
        __param(4, workbenchThemeService_1.IWorkbenchThemeService),
        __param(5, label_1.ILabelService),
        __param(6, dialogs_1.IDialogService),
        __param(7, preferences_1.IPreferencesService),
        __param(8, telemetry_1.ITelemetryService)
    ], InstallAction);
    let InstallDropdownAction = class InstallDropdownAction extends ActionWithDropDownAction {
        set manifest(manifest) {
            this.extensionActions.forEach(a => a.manifest = manifest);
            this.update();
        }
        constructor(instantiationService, extensionsWorkbenchService) {
            super(`extensions.installActions`, '', [
                [
                    instantiationService.createInstance(InstallAction, { installPreReleaseVersion: extensionsWorkbenchService.preferPreReleases }),
                    instantiationService.createInstance(InstallAction, { installPreReleaseVersion: !extensionsWorkbenchService.preferPreReleases }),
                ]
            ]);
        }
        getLabel(action) {
            return action.getLabel(true);
        }
    };
    exports.InstallDropdownAction = InstallDropdownAction;
    exports.InstallDropdownAction = InstallDropdownAction = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, extensions_1.IExtensionsWorkbenchService)
    ], InstallDropdownAction);
    class InstallingLabelAction extends ExtensionAction {
        static { this.LABEL = (0, nls_1.localize)('installing', "Installing"); }
        static { this.CLASS = `${ExtensionAction.LABEL_ACTION_CLASS} install installing`; }
        constructor() {
            super('extension.installing', InstallingLabelAction.LABEL, InstallingLabelAction.CLASS, false);
        }
        update() {
            this.class = `${InstallingLabelAction.CLASS}${this.extension && this.extension.state === 0 /* ExtensionState.Installing */ ? '' : ' hide'}`;
        }
    }
    exports.InstallingLabelAction = InstallingLabelAction;
    let InstallInOtherServerAction = class InstallInOtherServerAction extends ExtensionAction {
        static { InstallInOtherServerAction_1 = this; }
        static { this.INSTALL_LABEL = (0, nls_1.localize)('install', "Install"); }
        static { this.INSTALLING_LABEL = (0, nls_1.localize)('installing', "Installing"); }
        static { this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} prominent install`; }
        static { this.InstallingClass = `${ExtensionAction.LABEL_ACTION_CLASS} install installing`; }
        constructor(id, server, canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(id, InstallInOtherServerAction_1.INSTALL_LABEL, InstallInOtherServerAction_1.Class, false);
            this.server = server;
            this.canInstallAnyWhere = canInstallAnyWhere;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.updateWhenCounterExtensionChanges = true;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = InstallInOtherServerAction_1.Class;
            if (this.canInstall()) {
                const extensionInOtherServer = this.extensionsWorkbenchService.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server === this.server)[0];
                if (extensionInOtherServer) {
                    // Getting installed in other server
                    if (extensionInOtherServer.state === 0 /* ExtensionState.Installing */ && !extensionInOtherServer.local) {
                        this.enabled = true;
                        this.label = InstallInOtherServerAction_1.INSTALLING_LABEL;
                        this.class = InstallInOtherServerAction_1.InstallingClass;
                    }
                }
                else {
                    // Not installed in other server
                    this.enabled = true;
                    this.label = this.getInstallLabel();
                }
            }
        }
        canInstall() {
            // Disable if extension is not installed or not an user extension
            if (!this.extension
                || !this.server
                || !this.extension.local
                || this.extension.state !== 1 /* ExtensionState.Installed */
                || this.extension.type !== 1 /* ExtensionType.User */
                || this.extension.enablementState === 2 /* EnablementState.DisabledByEnvironment */ || this.extension.enablementState === 0 /* EnablementState.DisabledByTrustRequirement */ || this.extension.enablementState === 4 /* EnablementState.DisabledByVirtualWorkspace */) {
                return false;
            }
            if ((0, extensions_2.isLanguagePackExtension)(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on UI
            if (this.server === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on Workspace
            if (this.server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on Web
            if (this.server === this.extensionManagementServerService.webExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWeb(this.extension.local.manifest)) {
                return true;
            }
            if (this.canInstallAnyWhere) {
                // Can run on UI
                if (this.server === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnUI(this.extension.local.manifest)) {
                    return true;
                }
                // Can run on Workspace
                if (this.server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnWorkspace(this.extension.local.manifest)) {
                    return true;
                }
            }
            return false;
        }
        async run() {
            if (!this.extension?.local) {
                return;
            }
            if (!this.extension?.server) {
                return;
            }
            if (!this.server) {
                return;
            }
            this.extensionsWorkbenchService.open(this.extension);
            (0, aria_1.alert)((0, nls_1.localize)('installExtensionStart', "Installing extension {0} started. An editor is now open with more details on this extension", this.extension.displayName));
            return this.extensionsWorkbenchService.installInServer(this.extension, this.server);
        }
    };
    exports.InstallInOtherServerAction = InstallInOtherServerAction;
    exports.InstallInOtherServerAction = InstallInOtherServerAction = InstallInOtherServerAction_1 = __decorate([
        __param(3, extensions_1.IExtensionsWorkbenchService),
        __param(4, extensionManagement_2.IExtensionManagementServerService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], InstallInOtherServerAction);
    let RemoteInstallAction = class RemoteInstallAction extends InstallInOtherServerAction {
        constructor(canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(`extensions.remoteinstall`, extensionManagementServerService.remoteExtensionManagementServer, canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
        }
        getInstallLabel() {
            return this.extensionManagementServerService.remoteExtensionManagementServer
                ? (0, nls_1.localize)({ key: 'install in remote', comment: ['This is the name of the action to install an extension in remote server. Placeholder is for the name of remote server.'] }, "Install in {0}", this.extensionManagementServerService.remoteExtensionManagementServer.label)
                : InstallInOtherServerAction.INSTALL_LABEL;
        }
    };
    exports.RemoteInstallAction = RemoteInstallAction;
    exports.RemoteInstallAction = RemoteInstallAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, extensionManagement_2.IExtensionManagementServerService),
        __param(3, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], RemoteInstallAction);
    let LocalInstallAction = class LocalInstallAction extends InstallInOtherServerAction {
        constructor(extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(`extensions.localinstall`, extensionManagementServerService.localExtensionManagementServer, false, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
        }
        getInstallLabel() {
            return (0, nls_1.localize)('install locally', "Install Locally");
        }
    };
    exports.LocalInstallAction = LocalInstallAction;
    exports.LocalInstallAction = LocalInstallAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], LocalInstallAction);
    let WebInstallAction = class WebInstallAction extends InstallInOtherServerAction {
        constructor(extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(`extensions.webInstall`, extensionManagementServerService.webExtensionManagementServer, false, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
        }
        getInstallLabel() {
            return (0, nls_1.localize)('install browser', "Install in Browser");
        }
    };
    exports.WebInstallAction = WebInstallAction;
    exports.WebInstallAction = WebInstallAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], WebInstallAction);
    let UninstallAction = class UninstallAction extends ExtensionAction {
        static { UninstallAction_1 = this; }
        static { this.UninstallLabel = (0, nls_1.localize)('uninstallAction', "Uninstall"); }
        static { this.UninstallingLabel = (0, nls_1.localize)('Uninstalling', "Uninstalling"); }
        static { this.UninstallClass = `${ExtensionAction.LABEL_ACTION_CLASS} uninstall`; }
        static { this.UnInstallingClass = `${ExtensionAction.LABEL_ACTION_CLASS} uninstall uninstalling`; }
        constructor(extensionsWorkbenchService, dialogService) {
            super('extensions.uninstall', UninstallAction_1.UninstallLabel, UninstallAction_1.UninstallClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.dialogService = dialogService;
            this.update();
        }
        update() {
            if (!this.extension) {
                this.enabled = false;
                return;
            }
            const state = this.extension.state;
            if (state === 2 /* ExtensionState.Uninstalling */) {
                this.label = UninstallAction_1.UninstallingLabel;
                this.class = UninstallAction_1.UnInstallingClass;
                this.enabled = false;
                return;
            }
            this.label = UninstallAction_1.UninstallLabel;
            this.class = UninstallAction_1.UninstallClass;
            this.tooltip = UninstallAction_1.UninstallLabel;
            if (state !== 1 /* ExtensionState.Installed */) {
                this.enabled = false;
                return;
            }
            if (this.extension.isBuiltin) {
                this.enabled = false;
                return;
            }
            this.enabled = true;
        }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.alert)((0, nls_1.localize)('uninstallExtensionStart', "Uninstalling extension {0} started.", this.extension.displayName));
            try {
                await this.extensionsWorkbenchService.uninstall(this.extension);
                (0, aria_1.alert)((0, nls_1.localize)('uninstallExtensionComplete', "Please reload Visual Studio Code to complete the uninstallation of the extension {0}.", this.extension.displayName));
            }
            catch (error) {
                this.dialogService.error((0, errors_1.getErrorMessage)(error));
            }
        }
    };
    exports.UninstallAction = UninstallAction;
    exports.UninstallAction = UninstallAction = UninstallAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, dialogs_1.IDialogService)
    ], UninstallAction);
    class AbstractUpdateAction extends ExtensionAction {
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} prominent update`; }
        static { this.DisabledClass = `${AbstractUpdateAction.EnabledClass} disabled`; }
        constructor(id, label, extensionsWorkbenchService) {
            super(id, label, AbstractUpdateAction.DisabledClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.updateThrottler = new async_1.Throttler();
            this.update();
        }
        update() {
            this.updateThrottler.queue(() => this.computeAndUpdateEnablement());
        }
        async computeAndUpdateEnablement() {
            this.enabled = false;
            this.class = UpdateAction.DisabledClass;
            if (!this.extension) {
                return;
            }
            if (this.extension.deprecationInfo) {
                return;
            }
            const canInstall = await this.extensionsWorkbenchService.canInstall(this.extension);
            const isInstalled = this.extension.state === 1 /* ExtensionState.Installed */;
            this.enabled = canInstall && isInstalled && this.extension.outdated;
            this.class = this.enabled ? AbstractUpdateAction.EnabledClass : AbstractUpdateAction.DisabledClass;
        }
    }
    let UpdateAction = class UpdateAction extends AbstractUpdateAction {
        constructor(verbose, extensionsWorkbenchService, instantiationService) {
            super(`extensions.update`, (0, nls_1.localize)('update', "Update"), extensionsWorkbenchService);
            this.verbose = verbose;
            this.instantiationService = instantiationService;
        }
        update() {
            super.update();
            if (this.extension) {
                this.label = this.verbose ? (0, nls_1.localize)('update to', "Update to v{0}", this.extension.latestVersion) : (0, nls_1.localize)('update', "Update");
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.alert)((0, nls_1.localize)('updateExtensionStart', "Updating extension {0} to version {1} started.", this.extension.displayName, this.extension.latestVersion));
            return this.install(this.extension);
        }
        async install(extension) {
            try {
                await this.extensionsWorkbenchService.install(extension, extension.local?.preRelease ? { installPreReleaseVersion: true } : undefined);
                (0, aria_1.alert)((0, nls_1.localize)('updateExtensionComplete', "Updating extension {0} to version {1} completed.", extension.displayName, extension.latestVersion));
            }
            catch (err) {
                this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 3 /* InstallOperation.Update */, err).run();
            }
        }
    };
    exports.UpdateAction = UpdateAction;
    exports.UpdateAction = UpdateAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, instantiation_1.IInstantiationService)
    ], UpdateAction);
    let ToggleAutoUpdateForExtensionAction = class ToggleAutoUpdateForExtensionAction extends ExtensionAction {
        static { ToggleAutoUpdateForExtensionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.toggleAutoUpdateForExtension'; }
        static { this.LABEL = (0, nls_1.localize)('enableAutoUpdateLabel', "Auto Update"); }
        static { this.EnabledClass = `${ExtensionAction.EXTENSION_ACTION_CLASS} auto-update`; }
        static { this.DisabledClass = `${ToggleAutoUpdateForExtensionAction_1.EnabledClass} hide`; }
        constructor(enableWhenOutdated, enableWhenAutoUpdateValue, extensionsWorkbenchService, configurationService) {
            super(ToggleAutoUpdateForExtensionAction_1.ID, ToggleAutoUpdateForExtensionAction_1.LABEL, ToggleAutoUpdateForExtensionAction_1.DisabledClass);
            this.enableWhenOutdated = enableWhenOutdated;
            this.enableWhenAutoUpdateValue = enableWhenAutoUpdateValue;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(extensions_1.AutoUpdateConfigurationKey)) {
                    this.update();
                }
            }));
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = ToggleAutoUpdateForExtensionAction_1.DisabledClass;
            if (!this.extension) {
                return;
            }
            if (this.extension.isBuiltin) {
                return;
            }
            if (this.enableWhenOutdated && (this.extension.state !== 1 /* ExtensionState.Installed */ || !this.extension.outdated)) {
                return;
            }
            if (!this.enableWhenAutoUpdateValue.includes(this.extensionsWorkbenchService.getAutoUpdateValue())) {
                return;
            }
            this.enabled = true;
            this.class = ToggleAutoUpdateForExtensionAction_1.EnabledClass;
            this.checked = this.extensionsWorkbenchService.isAutoUpdateEnabledFor(this.extension);
        }
        async run() {
            if (!this.extension) {
                return;
            }
            const enableAutoUpdate = !this.extensionsWorkbenchService.isAutoUpdateEnabledFor(this.extension);
            await this.extensionsWorkbenchService.updateAutoUpdateEnablementFor(this.extension, enableAutoUpdate);
            if (enableAutoUpdate) {
                (0, aria_1.alert)((0, nls_1.localize)('enableAutoUpdate', "Enabled auto updates for", this.extension.displayName));
            }
            else {
                (0, aria_1.alert)((0, nls_1.localize)('disableAutoUpdate', "Disabled auto updates for", this.extension.displayName));
            }
        }
    };
    exports.ToggleAutoUpdateForExtensionAction = ToggleAutoUpdateForExtensionAction;
    exports.ToggleAutoUpdateForExtensionAction = ToggleAutoUpdateForExtensionAction = ToggleAutoUpdateForExtensionAction_1 = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, configuration_1.IConfigurationService)
    ], ToggleAutoUpdateForExtensionAction);
    let ToggleAutoUpdatesForPublisherAction = class ToggleAutoUpdatesForPublisherAction extends ExtensionAction {
        static { ToggleAutoUpdatesForPublisherAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.toggleAutoUpdatesForPublisher'; }
        static { this.LABEL = (0, nls_1.localize)('toggleAutoUpdatesForPublisherLabel', "Auto Update All (From Publisher)"); }
        constructor(extensionsWorkbenchService) {
            super(ToggleAutoUpdatesForPublisherAction_1.ID, ToggleAutoUpdatesForPublisherAction_1.LABEL);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
        }
        update() { }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.alert)((0, nls_1.localize)('ignoreExtensionUpdatePublisher', "Ignoring updates published by {0}.", this.extension.publisherDisplayName));
            const enableAutoUpdate = !this.extensionsWorkbenchService.isAutoUpdateEnabledFor(this.extension.publisher);
            await this.extensionsWorkbenchService.updateAutoUpdateEnablementFor(this.extension.publisher, enableAutoUpdate);
            if (enableAutoUpdate) {
                (0, aria_1.alert)((0, nls_1.localize)('enableAutoUpdate', "Enabled auto updates for", this.extension.displayName));
            }
            else {
                (0, aria_1.alert)((0, nls_1.localize)('disableAutoUpdate', "Disabled auto updates for", this.extension.displayName));
            }
        }
    };
    exports.ToggleAutoUpdatesForPublisherAction = ToggleAutoUpdatesForPublisherAction;
    exports.ToggleAutoUpdatesForPublisherAction = ToggleAutoUpdatesForPublisherAction = ToggleAutoUpdatesForPublisherAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], ToggleAutoUpdatesForPublisherAction);
    let MigrateDeprecatedExtensionAction = class MigrateDeprecatedExtensionAction extends ExtensionAction {
        static { MigrateDeprecatedExtensionAction_1 = this; }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} migrate`; }
        static { this.DisabledClass = `${MigrateDeprecatedExtensionAction_1.EnabledClass} disabled`; }
        constructor(small, extensionsWorkbenchService) {
            super('extensionsAction.migrateDeprecatedExtension', (0, nls_1.localize)('migrateExtension', "Migrate"), MigrateDeprecatedExtensionAction_1.DisabledClass, false);
            this.small = small;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = MigrateDeprecatedExtensionAction_1.DisabledClass;
            if (!this.extension?.local) {
                return;
            }
            if (this.extension.state !== 1 /* ExtensionState.Installed */) {
                return;
            }
            if (!this.extension.deprecationInfo?.extension) {
                return;
            }
            const id = this.extension.deprecationInfo.extension.id;
            if (this.extensionsWorkbenchService.local.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }))) {
                return;
            }
            this.enabled = true;
            this.class = MigrateDeprecatedExtensionAction_1.EnabledClass;
            this.tooltip = (0, nls_1.localize)('migrate to', "Migrate to {0}", this.extension.deprecationInfo.extension.displayName);
            this.label = this.small ? (0, nls_1.localize)('migrate', "Migrate") : this.tooltip;
        }
        async run() {
            if (!this.extension?.deprecationInfo?.extension) {
                return;
            }
            const local = this.extension.local;
            await this.extensionsWorkbenchService.uninstall(this.extension);
            const [extension] = await this.extensionsWorkbenchService.getExtensions([{ id: this.extension.deprecationInfo.extension.id, preRelease: this.extension.deprecationInfo?.extension?.preRelease }], cancellation_1.CancellationToken.None);
            await this.extensionsWorkbenchService.install(extension, { isMachineScoped: local?.isMachineScoped });
        }
    };
    exports.MigrateDeprecatedExtensionAction = MigrateDeprecatedExtensionAction;
    exports.MigrateDeprecatedExtensionAction = MigrateDeprecatedExtensionAction = MigrateDeprecatedExtensionAction_1 = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService)
    ], MigrateDeprecatedExtensionAction);
    class ExtensionActionWithDropdownActionViewItem extends dropdownActionViewItem_1.ActionWithDropdownActionViewItem {
        constructor(action, options, contextMenuProvider) {
            super(null, action, options, contextMenuProvider);
        }
        render(container) {
            super.render(container);
            this.updateClass();
        }
        updateClass() {
            super.updateClass();
            if (this.element && this.dropdownMenuActionViewItem && this.dropdownMenuActionViewItem.element) {
                this.element.classList.toggle('empty', this._action.menuActions.length === 0);
                this.dropdownMenuActionViewItem.element.classList.toggle('hide', this._action.menuActions.length === 0);
            }
        }
    }
    exports.ExtensionActionWithDropdownActionViewItem = ExtensionActionWithDropdownActionViewItem;
    let ExtensionDropDownAction = class ExtensionDropDownAction extends ExtensionAction {
        constructor(id, label, cssClass, enabled, instantiationService) {
            super(id, label, cssClass, enabled);
            this.instantiationService = instantiationService;
            this._actionViewItem = null;
        }
        createActionViewItem() {
            this._actionViewItem = this.instantiationService.createInstance(DropDownMenuActionViewItem, this);
            return this._actionViewItem;
        }
        run({ actionGroups, disposeActionsOnHide }) {
            this._actionViewItem?.showMenu(actionGroups, disposeActionsOnHide);
            return Promise.resolve();
        }
    };
    exports.ExtensionDropDownAction = ExtensionDropDownAction;
    exports.ExtensionDropDownAction = ExtensionDropDownAction = __decorate([
        __param(4, instantiation_1.IInstantiationService)
    ], ExtensionDropDownAction);
    let DropDownMenuActionViewItem = class DropDownMenuActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(action, contextMenuService) {
            super(null, action, { icon: true, label: true });
            this.contextMenuService = contextMenuService;
        }
        showMenu(menuActionGroups, disposeActionsOnHide) {
            if (this.element) {
                const actions = this.getActions(menuActionGroups);
                const elementPosition = DOM.getDomNodePagePosition(this.element);
                const anchor = { x: elementPosition.left, y: elementPosition.top + elementPosition.height + 10 };
                this.contextMenuService.showContextMenu({
                    getAnchor: () => anchor,
                    getActions: () => actions,
                    actionRunner: this.actionRunner,
                    onHide: () => { if (disposeActionsOnHide) {
                        (0, lifecycle_1.disposeIfDisposable)(actions);
                    } }
                });
            }
        }
        getActions(menuActionGroups) {
            let actions = [];
            for (const menuActions of menuActionGroups) {
                actions = [...actions, ...menuActions, new actions_1.Separator()];
            }
            return actions.length ? actions.slice(0, actions.length - 1) : actions;
        }
    };
    exports.DropDownMenuActionViewItem = DropDownMenuActionViewItem;
    exports.DropDownMenuActionViewItem = DropDownMenuActionViewItem = __decorate([
        __param(1, contextView_1.IContextMenuService)
    ], DropDownMenuActionViewItem);
    async function getContextMenuActionsGroups(extension, contextKeyService, instantiationService) {
        return instantiationService.invokeFunction(async (accessor) => {
            const extensionsWorkbenchService = accessor.get(extensions_1.IExtensionsWorkbenchService);
            const menuService = accessor.get(actions_2.IMenuService);
            const extensionRecommendationsService = accessor.get(extensionRecommendations_1.IExtensionRecommendationsService);
            const extensionIgnoredRecommendationsService = accessor.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService);
            const workbenchThemeService = accessor.get(workbenchThemeService_1.IWorkbenchThemeService);
            const cksOverlay = [];
            if (extension) {
                cksOverlay.push(['extension', extension.identifier.id]);
                cksOverlay.push(['isBuiltinExtension', extension.isBuiltin]);
                cksOverlay.push(['isDefaultApplicationScopedExtension', extension.local && (0, extensions_2.isApplicationScopedExtension)(extension.local.manifest)]);
                cksOverlay.push(['isApplicationScopedExtension', extension.local && extension.local.isApplicationScoped]);
                cksOverlay.push(['extensionHasConfiguration', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes.configuration]);
                cksOverlay.push(['extensionHasKeybindings', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes.keybindings]);
                cksOverlay.push(['extensionHasCommands', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes?.commands]);
                cksOverlay.push(['isExtensionRecommended', !!extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]]);
                cksOverlay.push(['isExtensionWorkspaceRecommended', extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]?.reasonId === 0 /* ExtensionRecommendationReason.Workspace */]);
                cksOverlay.push(['isUserIgnoredRecommendation', extensionIgnoredRecommendationsService.globalIgnoredRecommendations.some(e => e === extension.identifier.id.toLowerCase())]);
                if (extension.state === 1 /* ExtensionState.Installed */) {
                    cksOverlay.push(['extensionStatus', 'installed']);
                }
                cksOverlay.push(['installedExtensionIsPreReleaseVersion', !!extension.local?.isPreReleaseVersion]);
                cksOverlay.push(['installedExtensionIsOptedToPreRelease', !!extension.local?.preRelease]);
                cksOverlay.push(['galleryExtensionIsPreReleaseVersion', !!extension.gallery?.properties.isPreReleaseVersion]);
                cksOverlay.push(['galleryExtensionHasPreReleaseVersion', extension.gallery?.hasPreReleaseVersion]);
                cksOverlay.push(['extensionHasReleaseVersion', extension.hasReleaseVersion]);
                const [colorThemes, fileIconThemes, productIconThemes] = await Promise.all([workbenchThemeService.getColorThemes(), workbenchThemeService.getFileIconThemes(), workbenchThemeService.getProductIconThemes()]);
                cksOverlay.push(['extensionHasColorThemes', colorThemes.some(theme => isThemeFromExtension(theme, extension))]);
                cksOverlay.push(['extensionHasFileIconThemes', fileIconThemes.some(theme => isThemeFromExtension(theme, extension))]);
                cksOverlay.push(['extensionHasProductIconThemes', productIconThemes.some(theme => isThemeFromExtension(theme, extension))]);
                cksOverlay.push(['canSetLanguage', extensionsWorkbenchService.canSetLanguage(extension)]);
                cksOverlay.push(['isActiveLanguagePackExtension', extension.gallery && platform_1.language === (0, languagePacks_1.getLocale)(extension.gallery)]);
            }
            const menu = menuService.createMenu(actions_2.MenuId.ExtensionContext, contextKeyService.createOverlay(cksOverlay));
            const actionsGroups = menu.getActions({ shouldForwardArgs: true });
            menu.dispose();
            return actionsGroups;
        });
    }
    function toActions(actionsGroups, instantiationService) {
        const result = [];
        for (const [, actions] of actionsGroups) {
            result.push(actions.map(action => {
                if (action instanceof actions_1.SubmenuAction) {
                    return action;
                }
                return instantiationService.createInstance(MenuItemExtensionAction, action);
            }));
        }
        return result;
    }
    async function getContextMenuActions(extension, contextKeyService, instantiationService) {
        const actionsGroups = await getContextMenuActionsGroups(extension, contextKeyService, instantiationService);
        return toActions(actionsGroups, instantiationService);
    }
    exports.getContextMenuActions = getContextMenuActions;
    let ManageExtensionAction = class ManageExtensionAction extends ExtensionDropDownAction {
        static { ManageExtensionAction_1 = this; }
        static { this.ID = 'extensions.manage'; }
        static { this.Class = `${ExtensionAction.ICON_ACTION_CLASS} manage ` + themables_1.ThemeIcon.asClassName(extensionsIcons_1.manageExtensionIcon); }
        static { this.HideManageExtensionClass = `${ManageExtensionAction_1.Class} hide`; }
        constructor(instantiationService, extensionService, contextKeyService) {
            super(ManageExtensionAction_1.ID, '', '', true, instantiationService);
            this.extensionService = extensionService;
            this.contextKeyService = contextKeyService;
            this.tooltip = (0, nls_1.localize)('manage', "Manage");
            this.update();
        }
        async getActionGroups() {
            const groups = [];
            const contextMenuActionsGroups = await getContextMenuActionsGroups(this.extension, this.contextKeyService, this.instantiationService);
            const themeActions = [], installActions = [], updateActions = [], otherActionGroups = [];
            for (const [group, actions] of contextMenuActionsGroups) {
                if (group === extensions_1.INSTALL_ACTIONS_GROUP) {
                    installActions.push(...toActions([[group, actions]], this.instantiationService)[0]);
                }
                else if (group === extensions_1.UPDATE_ACTIONS_GROUP) {
                    updateActions.push(...toActions([[group, actions]], this.instantiationService)[0]);
                }
                else if (group === extensions_1.THEME_ACTIONS_GROUP) {
                    themeActions.push(...toActions([[group, actions]], this.instantiationService)[0]);
                }
                else {
                    otherActionGroups.push(...toActions([[group, actions]], this.instantiationService));
                }
            }
            if (themeActions.length) {
                groups.push(themeActions);
            }
            groups.push([
                this.instantiationService.createInstance(EnableGloballyAction),
                this.instantiationService.createInstance(EnableForWorkspaceAction)
            ]);
            groups.push([
                this.instantiationService.createInstance(DisableGloballyAction),
                this.instantiationService.createInstance(DisableForWorkspaceAction)
            ]);
            if (updateActions.length) {
                groups.push(updateActions);
            }
            groups.push([
                ...(installActions.length ? installActions : []),
                this.instantiationService.createInstance(InstallAnotherVersionAction),
                this.instantiationService.createInstance(UninstallAction),
            ]);
            otherActionGroups.forEach(actions => groups.push(actions));
            groups.forEach(group => group.forEach(extensionAction => {
                if (extensionAction instanceof ExtensionAction) {
                    extensionAction.extension = this.extension;
                }
            }));
            return groups;
        }
        async run() {
            await this.extensionService.whenInstalledExtensionsRegistered();
            return super.run({ actionGroups: await this.getActionGroups(), disposeActionsOnHide: true });
        }
        update() {
            this.class = ManageExtensionAction_1.HideManageExtensionClass;
            this.enabled = false;
            if (this.extension) {
                const state = this.extension.state;
                this.enabled = state === 1 /* ExtensionState.Installed */;
                this.class = this.enabled || state === 2 /* ExtensionState.Uninstalling */ ? ManageExtensionAction_1.Class : ManageExtensionAction_1.HideManageExtensionClass;
            }
        }
    };
    exports.ManageExtensionAction = ManageExtensionAction;
    exports.ManageExtensionAction = ManageExtensionAction = ManageExtensionAction_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, extensions_3.IExtensionService),
        __param(2, contextkey_1.IContextKeyService)
    ], ManageExtensionAction);
    class ExtensionEditorManageExtensionAction extends ExtensionDropDownAction {
        constructor(contextKeyService, instantiationService) {
            super('extensionEditor.manageExtension', '', `${ExtensionAction.ICON_ACTION_CLASS} manage ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.manageExtensionIcon)}`, true, instantiationService);
            this.contextKeyService = contextKeyService;
            this.tooltip = (0, nls_1.localize)('manage', "Manage");
        }
        update() { }
        async run() {
            const actionGroups = [];
            (await getContextMenuActions(this.extension, this.contextKeyService, this.instantiationService)).forEach(actions => actionGroups.push(actions));
            actionGroups.forEach(group => group.forEach(extensionAction => {
                if (extensionAction instanceof ExtensionAction) {
                    extensionAction.extension = this.extension;
                }
            }));
            return super.run({ actionGroups, disposeActionsOnHide: true });
        }
    }
    exports.ExtensionEditorManageExtensionAction = ExtensionEditorManageExtensionAction;
    let MenuItemExtensionAction = class MenuItemExtensionAction extends ExtensionAction {
        constructor(action, extensionsWorkbenchService) {
            super(action.id, action.label);
            this.action = action;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
        }
        update() {
            if (!this.extension) {
                return;
            }
            if (this.action.id === extensions_1.TOGGLE_IGNORE_EXTENSION_ACTION_ID) {
                this.checked = !this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension);
            }
            else if (this.action.id === ToggleAutoUpdateForExtensionAction.ID) {
                this.checked = this.extensionsWorkbenchService.isAutoUpdateEnabledFor(this.extension);
            }
            else if (this.action.id === ToggleAutoUpdatesForPublisherAction.ID) {
                this.checked = this.extensionsWorkbenchService.isAutoUpdateEnabledFor(this.extension.publisher);
            }
            else {
                this.checked = this.action.checked;
            }
        }
        async run() {
            if (this.extension) {
                await this.action.run(this.extension.local ? (0, extensionManagementUtil_1.getExtensionId)(this.extension.local.manifest.publisher, this.extension.local.manifest.name)
                    : this.extension.gallery ? (0, extensionManagementUtil_1.getExtensionId)(this.extension.gallery.publisher, this.extension.gallery.name)
                        : this.extension.identifier.id);
            }
        }
    };
    exports.MenuItemExtensionAction = MenuItemExtensionAction;
    exports.MenuItemExtensionAction = MenuItemExtensionAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService)
    ], MenuItemExtensionAction);
    let TogglePreReleaseExtensionAction = class TogglePreReleaseExtensionAction extends ExtensionAction {
        static { TogglePreReleaseExtensionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.togglePreRlease'; }
        static { this.LABEL = (0, nls_1.localize)('togglePreRleaseLabel', "Pre-Release"); }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} pre-release`; }
        static { this.DisabledClass = `${TogglePreReleaseExtensionAction_1.EnabledClass} hide`; }
        constructor(extensionsWorkbenchService) {
            super(TogglePreReleaseExtensionAction_1.ID, TogglePreReleaseExtensionAction_1.LABEL, TogglePreReleaseExtensionAction_1.DisabledClass);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = TogglePreReleaseExtensionAction_1.DisabledClass;
            if (!this.extension) {
                return;
            }
            if (this.extension.isBuiltin) {
                return;
            }
            if (this.extension.state !== 1 /* ExtensionState.Installed */) {
                return;
            }
            if (!this.extension.hasPreReleaseVersion) {
                return;
            }
            if (!this.extension.gallery) {
                return;
            }
            if (this.extension.preRelease && !this.extension.isPreReleaseVersion) {
                return;
            }
            if (!this.extension.preRelease && !this.extension.gallery.hasPreReleaseVersion) {
                return;
            }
            this.enabled = true;
            this.class = TogglePreReleaseExtensionAction_1.EnabledClass;
            if (this.extension.preRelease) {
                this.label = (0, nls_1.localize)('togglePreRleaseDisableLabel', "Switch to Release Version");
                this.tooltip = (0, nls_1.localize)('togglePreRleaseDisableTooltip', "This will switch and enable updates to release versions");
            }
            else {
                this.label = (0, nls_1.localize)('switchToPreReleaseLabel', "Switch to Pre-Release Version");
                this.tooltip = (0, nls_1.localize)('switchToPreReleaseTooltip', "This will switch to pre-release version and enable updates to latest version always");
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            this.extensionsWorkbenchService.open(this.extension, { showPreReleaseVersion: !this.extension.preRelease });
            await this.extensionsWorkbenchService.togglePreRelease(this.extension);
        }
    };
    exports.TogglePreReleaseExtensionAction = TogglePreReleaseExtensionAction;
    exports.TogglePreReleaseExtensionAction = TogglePreReleaseExtensionAction = TogglePreReleaseExtensionAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], TogglePreReleaseExtensionAction);
    let InstallAnotherVersionAction = class InstallAnotherVersionAction extends ExtensionAction {
        static { InstallAnotherVersionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.install.anotherVersion'; }
        static { this.LABEL = (0, nls_1.localize)('install another version', "Install Another Version..."); }
        constructor(extensionsWorkbenchService, extensionGalleryService, quickInputService, instantiationService, dialogService) {
            super(InstallAnotherVersionAction_1.ID, InstallAnotherVersionAction_1.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionGalleryService = extensionGalleryService;
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.dialogService = dialogService;
            this.update();
        }
        update() {
            this.enabled = !!this.extension && !this.extension.isBuiltin && !!this.extension.gallery && !!this.extension.local && !!this.extension.server && this.extension.state === 1 /* ExtensionState.Installed */ && !this.extension.deprecationInfo;
        }
        async run() {
            if (!this.enabled) {
                return;
            }
            const targetPlatform = await this.extension.server.extensionManagementService.getTargetPlatform();
            const allVersions = await this.extensionGalleryService.getAllCompatibleVersions(this.extension.gallery, this.extension.local.preRelease, targetPlatform);
            if (!allVersions.length) {
                await this.dialogService.info((0, nls_1.localize)('no versions', "This extension has no other versions."));
                return;
            }
            const picks = allVersions.map((v, i) => {
                return {
                    id: v.version,
                    label: v.version,
                    description: `${(0, date_1.fromNow)(new Date(Date.parse(v.date)), true)}${v.isPreReleaseVersion ? ` (${(0, nls_1.localize)('pre-release', "pre-release")})` : ''}${v.version === this.extension.version ? ` (${(0, nls_1.localize)('current', "current")})` : ''}`,
                    latest: i === 0,
                    ariaLabel: `${v.isPreReleaseVersion ? 'Pre-Release version' : 'Release version'} ${v.version}`,
                    isPreReleaseVersion: v.isPreReleaseVersion
                };
            });
            const pick = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)('selectVersion', "Select Version to Install"),
                matchOnDetail: true
            });
            if (pick) {
                if (this.extension.version === pick.id) {
                    return;
                }
                try {
                    if (pick.latest) {
                        const [extension] = pick.id !== this.extension?.version ? await this.extensionsWorkbenchService.getExtensions([{ id: this.extension.identifier.id, preRelease: pick.isPreReleaseVersion }], cancellation_1.CancellationToken.None) : [this.extension];
                        await this.extensionsWorkbenchService.install(extension ?? this.extension, { installPreReleaseVersion: pick.isPreReleaseVersion });
                    }
                    else {
                        await this.extensionsWorkbenchService.installVersion(this.extension, pick.id, { installPreReleaseVersion: pick.isPreReleaseVersion });
                    }
                }
                catch (error) {
                    this.instantiationService.createInstance(PromptExtensionInstallFailureAction, this.extension, pick.latest ? this.extension.latestVersion : pick.id, 2 /* InstallOperation.Install */, error).run();
                }
            }
            return null;
        }
    };
    exports.InstallAnotherVersionAction = InstallAnotherVersionAction;
    exports.InstallAnotherVersionAction = InstallAnotherVersionAction = InstallAnotherVersionAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, dialogs_1.IDialogService)
    ], InstallAnotherVersionAction);
    let EnableForWorkspaceAction = class EnableForWorkspaceAction extends ExtensionAction {
        static { EnableForWorkspaceAction_1 = this; }
        static { this.ID = 'extensions.enableForWorkspace'; }
        static { this.LABEL = (0, nls_1.localize)('enableForWorkspaceAction', "Enable (Workspace)"); }
        constructor(extensionsWorkbenchService, extensionEnablementService) {
            super(EnableForWorkspaceAction_1.ID, EnableForWorkspaceAction_1.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.tooltip = (0, nls_1.localize)('enableForWorkspaceActionToolTip', "Enable this extension only in this workspace");
            this.update();
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && !this.extensionEnablementService.isEnabled(this.extension.local)
                    && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 9 /* EnablementState.EnabledWorkspace */);
        }
    };
    exports.EnableForWorkspaceAction = EnableForWorkspaceAction;
    exports.EnableForWorkspaceAction = EnableForWorkspaceAction = EnableForWorkspaceAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], EnableForWorkspaceAction);
    let EnableGloballyAction = class EnableGloballyAction extends ExtensionAction {
        static { EnableGloballyAction_1 = this; }
        static { this.ID = 'extensions.enableGlobally'; }
        static { this.LABEL = (0, nls_1.localize)('enableGloballyAction', "Enable"); }
        constructor(extensionsWorkbenchService, extensionEnablementService) {
            super(EnableGloballyAction_1.ID, EnableGloballyAction_1.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.tooltip = (0, nls_1.localize)('enableGloballyActionToolTip', "Enable this extension");
            this.update();
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && this.extensionEnablementService.isDisabledGlobally(this.extension.local)
                    && this.extensionEnablementService.canChangeEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 8 /* EnablementState.EnabledGlobally */);
        }
    };
    exports.EnableGloballyAction = EnableGloballyAction;
    exports.EnableGloballyAction = EnableGloballyAction = EnableGloballyAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], EnableGloballyAction);
    let DisableForWorkspaceAction = class DisableForWorkspaceAction extends ExtensionAction {
        static { DisableForWorkspaceAction_1 = this; }
        static { this.ID = 'extensions.disableForWorkspace'; }
        static { this.LABEL = (0, nls_1.localize)('disableForWorkspaceAction', "Disable (Workspace)"); }
        constructor(workspaceContextService, extensionsWorkbenchService, extensionEnablementService, extensionService) {
            super(DisableForWorkspaceAction_1.ID, DisableForWorkspaceAction_1.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.workspaceContextService = workspaceContextService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.extensionService = extensionService;
            this.tooltip = (0, nls_1.localize)('disableForWorkspaceActionToolTip', "Disable this extension only in this workspace");
            this.update();
            this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local && this.extensionService.extensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier) && this.workspaceContextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */)) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */ || this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */)
                    && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 7 /* EnablementState.DisabledWorkspace */);
        }
    };
    exports.DisableForWorkspaceAction = DisableForWorkspaceAction;
    exports.DisableForWorkspaceAction = DisableForWorkspaceAction = DisableForWorkspaceAction_1 = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(3, extensions_3.IExtensionService)
    ], DisableForWorkspaceAction);
    let DisableGloballyAction = class DisableGloballyAction extends ExtensionAction {
        static { DisableGloballyAction_1 = this; }
        static { this.ID = 'extensions.disableGlobally'; }
        static { this.LABEL = (0, nls_1.localize)('disableGloballyAction', "Disable"); }
        constructor(extensionsWorkbenchService, extensionEnablementService, extensionService) {
            super(DisableGloballyAction_1.ID, DisableGloballyAction_1.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.extensionService = extensionService;
            this.tooltip = (0, nls_1.localize)('disableGloballyActionToolTip', "Disable this extension");
            this.update();
            this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local && this.extensionService.extensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */ || this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */)
                    && this.extensionEnablementService.canChangeEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 6 /* EnablementState.DisabledGlobally */);
        }
    };
    exports.DisableGloballyAction = DisableGloballyAction;
    exports.DisableGloballyAction = DisableGloballyAction = DisableGloballyAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(2, extensions_3.IExtensionService)
    ], DisableGloballyAction);
    let EnableDropDownAction = class EnableDropDownAction extends ActionWithDropDownAction {
        constructor(instantiationService) {
            super('extensions.enable', (0, nls_1.localize)('enableAction', "Enable"), [
                [
                    instantiationService.createInstance(EnableGloballyAction),
                    instantiationService.createInstance(EnableForWorkspaceAction)
                ]
            ]);
        }
    };
    exports.EnableDropDownAction = EnableDropDownAction;
    exports.EnableDropDownAction = EnableDropDownAction = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], EnableDropDownAction);
    let DisableDropDownAction = class DisableDropDownAction extends ActionWithDropDownAction {
        constructor(instantiationService) {
            super('extensions.disable', (0, nls_1.localize)('disableAction', "Disable"), [[
                    instantiationService.createInstance(DisableGloballyAction),
                    instantiationService.createInstance(DisableForWorkspaceAction)
                ]]);
        }
    };
    exports.DisableDropDownAction = DisableDropDownAction;
    exports.DisableDropDownAction = DisableDropDownAction = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], DisableDropDownAction);
    let ReloadAction = class ReloadAction extends ExtensionAction {
        static { ReloadAction_1 = this; }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} reload`; }
        static { this.DisabledClass = `${ReloadAction_1.EnabledClass} disabled`; }
        constructor(hostService, extensionService) {
            super('extensions.reload', (0, nls_1.localize)('reloadAction', "Reload"), ReloadAction_1.DisabledClass, false);
            this.hostService = hostService;
            this.extensionService = extensionService;
            this.updateWhenCounterExtensionChanges = true;
            this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
            this.update();
        }
        update() {
            this.enabled = false;
            this.tooltip = '';
            if (!this.extension) {
                return;
            }
            const state = this.extension.state;
            if (state === 0 /* ExtensionState.Installing */ || state === 2 /* ExtensionState.Uninstalling */) {
                return;
            }
            if (this.extension.local && this.extension.local.manifest && this.extension.local.manifest.contributes && this.extension.local.manifest.contributes.localizations && this.extension.local.manifest.contributes.localizations.length > 0) {
                return;
            }
            const reloadTooltip = this.extension.reloadRequiredStatus;
            this.enabled = reloadTooltip !== undefined;
            this.label = reloadTooltip !== undefined ? (0, nls_1.localize)('reload required', 'Reload Required') : '';
            this.tooltip = reloadTooltip !== undefined ? reloadTooltip : '';
            this.class = this.enabled ? ReloadAction_1.EnabledClass : ReloadAction_1.DisabledClass;
        }
        run() {
            return Promise.resolve(this.hostService.reload());
        }
    };
    exports.ReloadAction = ReloadAction;
    exports.ReloadAction = ReloadAction = ReloadAction_1 = __decorate([
        __param(0, host_1.IHostService),
        __param(1, extensions_3.IExtensionService)
    ], ReloadAction);
    function isThemeFromExtension(theme, extension) {
        return !!(extension && theme.extensionData && extensions_2.ExtensionIdentifier.equals(theme.extensionData.extensionId, extension.identifier.id));
    }
    function getQuickPickEntries(themes, currentTheme, extension, showCurrentTheme) {
        const picks = [];
        for (const theme of themes) {
            if (isThemeFromExtension(theme, extension) && !(showCurrentTheme && theme === currentTheme)) {
                picks.push({ label: theme.label, id: theme.id });
            }
        }
        if (showCurrentTheme) {
            picks.push({ type: 'separator', label: (0, nls_1.localize)('current', "current") });
            picks.push({ label: currentTheme.label, id: currentTheme.id });
        }
        return picks;
    }
    let SetColorThemeAction = class SetColorThemeAction extends ExtensionAction {
        static { SetColorThemeAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.setColorTheme'; }
        static { this.TITLE = (0, nls_1.localize2)('workbench.extensions.action.setColorTheme', 'Set Color Theme'); }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`; }
        static { this.DisabledClass = `${SetColorThemeAction_1.EnabledClass} disabled`; }
        constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
            super(SetColorThemeAction_1.ID, SetColorThemeAction_1.TITLE.value, SetColorThemeAction_1.DisabledClass, false);
            this.workbenchThemeService = workbenchThemeService;
            this.quickInputService = quickInputService;
            this.extensionEnablementService = extensionEnablementService;
            this._register(event_1.Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidColorThemeChange)(() => this.update(), this));
            this.update();
        }
        update() {
            this.workbenchThemeService.getColorThemes().then(colorThemes => {
                this.enabled = this.computeEnablement(colorThemes);
                this.class = this.enabled ? SetColorThemeAction_1.EnabledClass : SetColorThemeAction_1.DisabledClass;
            });
        }
        computeEnablement(colorThemes) {
            return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && colorThemes.some(th => isThemeFromExtension(th, this.extension));
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            const colorThemes = await this.workbenchThemeService.getColorThemes();
            if (!this.computeEnablement(colorThemes)) {
                return;
            }
            const currentTheme = this.workbenchThemeService.getColorTheme();
            const delayer = new async_1.Delayer(100);
            const picks = getQuickPickEntries(colorThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)('select color theme', "Select Color Theme"),
                onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setColorTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.workbenchThemeService.setColorTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    exports.SetColorThemeAction = SetColorThemeAction;
    exports.SetColorThemeAction = SetColorThemeAction = SetColorThemeAction_1 = __decorate([
        __param(0, extensions_3.IExtensionService),
        __param(1, workbenchThemeService_1.IWorkbenchThemeService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], SetColorThemeAction);
    let SetFileIconThemeAction = class SetFileIconThemeAction extends ExtensionAction {
        static { SetFileIconThemeAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.setFileIconTheme'; }
        static { this.TITLE = (0, nls_1.localize2)('workbench.extensions.action.setFileIconTheme', 'Set File Icon Theme'); }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`; }
        static { this.DisabledClass = `${SetFileIconThemeAction_1.EnabledClass} disabled`; }
        constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
            super(SetFileIconThemeAction_1.ID, SetFileIconThemeAction_1.TITLE.value, SetFileIconThemeAction_1.DisabledClass, false);
            this.workbenchThemeService = workbenchThemeService;
            this.quickInputService = quickInputService;
            this.extensionEnablementService = extensionEnablementService;
            this._register(event_1.Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidFileIconThemeChange)(() => this.update(), this));
            this.update();
        }
        update() {
            this.workbenchThemeService.getFileIconThemes().then(fileIconThemes => {
                this.enabled = this.computeEnablement(fileIconThemes);
                this.class = this.enabled ? SetFileIconThemeAction_1.EnabledClass : SetFileIconThemeAction_1.DisabledClass;
            });
        }
        computeEnablement(colorThemfileIconThemess) {
            return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && colorThemfileIconThemess.some(th => isThemeFromExtension(th, this.extension));
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            const fileIconThemes = await this.workbenchThemeService.getFileIconThemes();
            if (!this.computeEnablement(fileIconThemes)) {
                return;
            }
            const currentTheme = this.workbenchThemeService.getFileIconTheme();
            const delayer = new async_1.Delayer(100);
            const picks = getQuickPickEntries(fileIconThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)('select file icon theme', "Select File Icon Theme"),
                onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setFileIconTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.workbenchThemeService.setFileIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    exports.SetFileIconThemeAction = SetFileIconThemeAction;
    exports.SetFileIconThemeAction = SetFileIconThemeAction = SetFileIconThemeAction_1 = __decorate([
        __param(0, extensions_3.IExtensionService),
        __param(1, workbenchThemeService_1.IWorkbenchThemeService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], SetFileIconThemeAction);
    let SetProductIconThemeAction = class SetProductIconThemeAction extends ExtensionAction {
        static { SetProductIconThemeAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.setProductIconTheme'; }
        static { this.TITLE = (0, nls_1.localize2)('workbench.extensions.action.setProductIconTheme', 'Set Product Icon Theme'); }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`; }
        static { this.DisabledClass = `${SetProductIconThemeAction_1.EnabledClass} disabled`; }
        constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
            super(SetProductIconThemeAction_1.ID, SetProductIconThemeAction_1.TITLE.value, SetProductIconThemeAction_1.DisabledClass, false);
            this.workbenchThemeService = workbenchThemeService;
            this.quickInputService = quickInputService;
            this.extensionEnablementService = extensionEnablementService;
            this._register(event_1.Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidProductIconThemeChange)(() => this.update(), this));
            this.update();
        }
        update() {
            this.workbenchThemeService.getProductIconThemes().then(productIconThemes => {
                this.enabled = this.computeEnablement(productIconThemes);
                this.class = this.enabled ? SetProductIconThemeAction_1.EnabledClass : SetProductIconThemeAction_1.DisabledClass;
            });
        }
        computeEnablement(productIconThemes) {
            return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && productIconThemes.some(th => isThemeFromExtension(th, this.extension));
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            const productIconThemes = await this.workbenchThemeService.getProductIconThemes();
            if (!this.computeEnablement(productIconThemes)) {
                return;
            }
            const currentTheme = this.workbenchThemeService.getProductIconTheme();
            const delayer = new async_1.Delayer(100);
            const picks = getQuickPickEntries(productIconThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)('select product icon theme', "Select Product Icon Theme"),
                onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setProductIconTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.workbenchThemeService.setProductIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    exports.SetProductIconThemeAction = SetProductIconThemeAction;
    exports.SetProductIconThemeAction = SetProductIconThemeAction = SetProductIconThemeAction_1 = __decorate([
        __param(0, extensions_3.IExtensionService),
        __param(1, workbenchThemeService_1.IWorkbenchThemeService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], SetProductIconThemeAction);
    let SetLanguageAction = class SetLanguageAction extends ExtensionAction {
        static { SetLanguageAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.setDisplayLanguage'; }
        static { this.TITLE = (0, nls_1.localize2)('workbench.extensions.action.setDisplayLanguage', 'Set Display Language'); }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} language`; }
        static { this.DisabledClass = `${SetLanguageAction_1.EnabledClass} disabled`; }
        constructor(extensionsWorkbenchService) {
            super(SetLanguageAction_1.ID, SetLanguageAction_1.TITLE.value, SetLanguageAction_1.DisabledClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = SetLanguageAction_1.DisabledClass;
            if (!this.extension) {
                return;
            }
            if (!this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.gallery && platform_1.language === (0, languagePacks_1.getLocale)(this.extension.gallery)) {
                return;
            }
            this.enabled = true;
            this.class = SetLanguageAction_1.EnabledClass;
        }
        async run() {
            return this.extension && this.extensionsWorkbenchService.setLanguage(this.extension);
        }
    };
    exports.SetLanguageAction = SetLanguageAction;
    exports.SetLanguageAction = SetLanguageAction = SetLanguageAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], SetLanguageAction);
    let ClearLanguageAction = class ClearLanguageAction extends ExtensionAction {
        static { ClearLanguageAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.clearLanguage'; }
        static { this.TITLE = (0, nls_1.localize2)('workbench.extensions.action.clearLanguage', 'Clear Display Language'); }
        static { this.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} language`; }
        static { this.DisabledClass = `${ClearLanguageAction_1.EnabledClass} disabled`; }
        constructor(extensionsWorkbenchService, localeService) {
            super(ClearLanguageAction_1.ID, ClearLanguageAction_1.TITLE.value, ClearLanguageAction_1.DisabledClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.localeService = localeService;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = ClearLanguageAction_1.DisabledClass;
            if (!this.extension) {
                return;
            }
            if (!this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.gallery && platform_1.language !== (0, languagePacks_1.getLocale)(this.extension.gallery)) {
                return;
            }
            this.enabled = true;
            this.class = ClearLanguageAction_1.EnabledClass;
        }
        async run() {
            return this.extension && this.localeService.clearLocalePreference();
        }
    };
    exports.ClearLanguageAction = ClearLanguageAction;
    exports.ClearLanguageAction = ClearLanguageAction = ClearLanguageAction_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, locale_1.ILocaleService)
    ], ClearLanguageAction);
    let ShowRecommendedExtensionAction = class ShowRecommendedExtensionAction extends actions_1.Action {
        static { ShowRecommendedExtensionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.showRecommendedExtension'; }
        static { this.LABEL = (0, nls_1.localize)('showRecommendedExtension', "Show Recommended Extension"); }
        constructor(extensionId, paneCompositeService, extensionWorkbenchService) {
            super(ShowRecommendedExtensionAction_1.ID, ShowRecommendedExtensionAction_1.LABEL, undefined, false);
            this.paneCompositeService = paneCompositeService;
            this.extensionWorkbenchService = extensionWorkbenchService;
            this.extensionId = extensionId;
        }
        async run() {
            const paneComposite = await this.paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
            const paneContainer = paneComposite?.getViewPaneContainer();
            paneContainer.search(`@id:${this.extensionId}`);
            paneContainer.focus();
            const [extension] = await this.extensionWorkbenchService.getExtensions([{ id: this.extensionId }], { source: 'install-recommendation' }, cancellation_1.CancellationToken.None);
            if (extension) {
                return this.extensionWorkbenchService.open(extension);
            }
            return null;
        }
    };
    exports.ShowRecommendedExtensionAction = ShowRecommendedExtensionAction;
    exports.ShowRecommendedExtensionAction = ShowRecommendedExtensionAction = ShowRecommendedExtensionAction_1 = __decorate([
        __param(1, panecomposite_1.IPaneCompositePartService),
        __param(2, extensions_1.IExtensionsWorkbenchService)
    ], ShowRecommendedExtensionAction);
    let InstallRecommendedExtensionAction = class InstallRecommendedExtensionAction extends actions_1.Action {
        static { InstallRecommendedExtensionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.installRecommendedExtension'; }
        static { this.LABEL = (0, nls_1.localize)('installRecommendedExtension', "Install Recommended Extension"); }
        constructor(extensionId, paneCompositeService, instantiationService, extensionWorkbenchService) {
            super(InstallRecommendedExtensionAction_1.ID, InstallRecommendedExtensionAction_1.LABEL, undefined, false);
            this.paneCompositeService = paneCompositeService;
            this.instantiationService = instantiationService;
            this.extensionWorkbenchService = extensionWorkbenchService;
            this.extensionId = extensionId;
        }
        async run() {
            const viewlet = await this.paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
            const viewPaneContainer = viewlet?.getViewPaneContainer();
            viewPaneContainer.search(`@id:${this.extensionId}`);
            viewPaneContainer.focus();
            const [extension] = await this.extensionWorkbenchService.getExtensions([{ id: this.extensionId }], { source: 'install-recommendation' }, cancellation_1.CancellationToken.None);
            if (extension) {
                await this.extensionWorkbenchService.open(extension);
                try {
                    await this.extensionWorkbenchService.install(extension);
                }
                catch (err) {
                    this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 2 /* InstallOperation.Install */, err).run();
                }
            }
        }
    };
    exports.InstallRecommendedExtensionAction = InstallRecommendedExtensionAction;
    exports.InstallRecommendedExtensionAction = InstallRecommendedExtensionAction = InstallRecommendedExtensionAction_1 = __decorate([
        __param(1, panecomposite_1.IPaneCompositePartService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, extensions_1.IExtensionsWorkbenchService)
    ], InstallRecommendedExtensionAction);
    let IgnoreExtensionRecommendationAction = class IgnoreExtensionRecommendationAction extends actions_1.Action {
        static { IgnoreExtensionRecommendationAction_1 = this; }
        static { this.ID = 'extensions.ignore'; }
        static { this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} ignore`; }
        constructor(extension, extensionRecommendationsManagementService) {
            super(IgnoreExtensionRecommendationAction_1.ID, 'Ignore Recommendation');
            this.extension = extension;
            this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
            this.class = IgnoreExtensionRecommendationAction_1.Class;
            this.tooltip = (0, nls_1.localize)('ignoreExtensionRecommendation', "Do not recommend this extension again");
            this.enabled = true;
        }
        run() {
            this.extensionRecommendationsManagementService.toggleGlobalIgnoredRecommendation(this.extension.identifier.id, true);
            return Promise.resolve();
        }
    };
    exports.IgnoreExtensionRecommendationAction = IgnoreExtensionRecommendationAction;
    exports.IgnoreExtensionRecommendationAction = IgnoreExtensionRecommendationAction = IgnoreExtensionRecommendationAction_1 = __decorate([
        __param(1, extensionRecommendations_1.IExtensionIgnoredRecommendationsService)
    ], IgnoreExtensionRecommendationAction);
    let UndoIgnoreExtensionRecommendationAction = class UndoIgnoreExtensionRecommendationAction extends actions_1.Action {
        static { UndoIgnoreExtensionRecommendationAction_1 = this; }
        static { this.ID = 'extensions.ignore'; }
        static { this.Class = `${ExtensionAction.LABEL_ACTION_CLASS} undo-ignore`; }
        constructor(extension, extensionRecommendationsManagementService) {
            super(UndoIgnoreExtensionRecommendationAction_1.ID, 'Undo');
            this.extension = extension;
            this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
            this.class = UndoIgnoreExtensionRecommendationAction_1.Class;
            this.tooltip = (0, nls_1.localize)('undo', "Undo");
            this.enabled = true;
        }
        run() {
            this.extensionRecommendationsManagementService.toggleGlobalIgnoredRecommendation(this.extension.identifier.id, false);
            return Promise.resolve();
        }
    };
    exports.UndoIgnoreExtensionRecommendationAction = UndoIgnoreExtensionRecommendationAction;
    exports.UndoIgnoreExtensionRecommendationAction = UndoIgnoreExtensionRecommendationAction = UndoIgnoreExtensionRecommendationAction_1 = __decorate([
        __param(1, extensionRecommendations_1.IExtensionIgnoredRecommendationsService)
    ], UndoIgnoreExtensionRecommendationAction);
    let SearchExtensionsAction = class SearchExtensionsAction extends actions_1.Action {
        constructor(searchValue, paneCompositeService) {
            super('extensions.searchExtensions', (0, nls_1.localize)('search recommendations', "Search Extensions"), undefined, true);
            this.searchValue = searchValue;
            this.paneCompositeService = paneCompositeService;
        }
        async run() {
            const viewPaneContainer = (await this.paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true))?.getViewPaneContainer();
            viewPaneContainer.search(this.searchValue);
            viewPaneContainer.focus();
        }
    };
    exports.SearchExtensionsAction = SearchExtensionsAction;
    exports.SearchExtensionsAction = SearchExtensionsAction = __decorate([
        __param(1, panecomposite_1.IPaneCompositePartService)
    ], SearchExtensionsAction);
    let AbstractConfigureRecommendedExtensionsAction = class AbstractConfigureRecommendedExtensionsAction extends actions_1.Action {
        constructor(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService) {
            super(id, label);
            this.contextService = contextService;
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.editorService = editorService;
            this.jsonEditingService = jsonEditingService;
            this.textModelResolverService = textModelResolverService;
        }
        openExtensionsFile(extensionsFileResource) {
            return this.getOrCreateExtensionsFile(extensionsFileResource)
                .then(({ created, content }) => this.getSelectionPosition(content, extensionsFileResource, ['recommendations'])
                .then(selection => this.editorService.openEditor({
                resource: extensionsFileResource,
                options: {
                    pinned: created,
                    selection
                }
            })), error => Promise.reject(new Error((0, nls_1.localize)('OpenExtensionsFile.failed', "Unable to create 'extensions.json' file inside the '.vscode' folder ({0}).", error))));
        }
        openWorkspaceConfigurationFile(workspaceConfigurationFile) {
            return this.getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile)
                .then(content => this.getSelectionPosition(content.value.toString(), content.resource, ['extensions', 'recommendations']))
                .then(selection => this.editorService.openEditor({
                resource: workspaceConfigurationFile,
                options: {
                    selection,
                    forceReload: true // because content has changed
                }
            }));
        }
        getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile) {
            return Promise.resolve(this.fileService.readFile(workspaceConfigurationFile))
                .then(content => {
                const workspaceRecommendations = json.parse(content.value.toString())['extensions'];
                if (!workspaceRecommendations || !workspaceRecommendations.recommendations) {
                    return this.jsonEditingService.write(workspaceConfigurationFile, [{ path: ['extensions'], value: { recommendations: [] } }], true)
                        .then(() => this.fileService.readFile(workspaceConfigurationFile));
                }
                return content;
            });
        }
        getSelectionPosition(content, resource, path) {
            const tree = json.parseTree(content);
            const node = json.findNodeAtLocation(tree, path);
            if (node && node.parent && node.parent.children) {
                const recommendationsValueNode = node.parent.children[1];
                const lastExtensionNode = recommendationsValueNode.children && recommendationsValueNode.children.length ? recommendationsValueNode.children[recommendationsValueNode.children.length - 1] : null;
                const offset = lastExtensionNode ? lastExtensionNode.offset + lastExtensionNode.length : recommendationsValueNode.offset + 1;
                return Promise.resolve(this.textModelResolverService.createModelReference(resource))
                    .then(reference => {
                    const position = reference.object.textEditorModel.getPositionAt(offset);
                    reference.dispose();
                    return {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    };
                });
            }
            return Promise.resolve(undefined);
        }
        getOrCreateExtensionsFile(extensionsFileResource) {
            return Promise.resolve(this.fileService.readFile(extensionsFileResource)).then(content => {
                return { created: false, extensionsFileResource, content: content.value.toString() };
            }, err => {
                return this.textFileService.write(extensionsFileResource, extensionsFileTemplate_1.ExtensionsConfigurationInitialContent).then(() => {
                    return { created: true, extensionsFileResource, content: extensionsFileTemplate_1.ExtensionsConfigurationInitialContent };
                });
            });
        }
    };
    exports.AbstractConfigureRecommendedExtensionsAction = AbstractConfigureRecommendedExtensionsAction;
    exports.AbstractConfigureRecommendedExtensionsAction = AbstractConfigureRecommendedExtensionsAction = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, files_1.IFileService),
        __param(4, textfiles_1.ITextFileService),
        __param(5, editorService_1.IEditorService),
        __param(6, jsonEditing_1.IJSONEditingService),
        __param(7, resolverService_1.ITextModelService)
    ], AbstractConfigureRecommendedExtensionsAction);
    let ConfigureWorkspaceRecommendedExtensionsAction = class ConfigureWorkspaceRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
        static { this.ID = 'workbench.extensions.action.configureWorkspaceRecommendedExtensions'; }
        static { this.LABEL = (0, nls_1.localize)('configureWorkspaceRecommendedExtensions', "Configure Recommended Extensions (Workspace)"); }
        constructor(id, label, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService) {
            super(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.update(), this));
            this.update();
        }
        update() {
            this.enabled = this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
        }
        run() {
            switch (this.contextService.getWorkbenchState()) {
                case 2 /* WorkbenchState.FOLDER */:
                    return this.openExtensionsFile(this.contextService.getWorkspace().folders[0].toResource(workspaceExtensionsConfig_1.EXTENSIONS_CONFIG));
                case 3 /* WorkbenchState.WORKSPACE */:
                    return this.openWorkspaceConfigurationFile(this.contextService.getWorkspace().configuration);
            }
            return Promise.resolve();
        }
    };
    exports.ConfigureWorkspaceRecommendedExtensionsAction = ConfigureWorkspaceRecommendedExtensionsAction;
    exports.ConfigureWorkspaceRecommendedExtensionsAction = ConfigureWorkspaceRecommendedExtensionsAction = __decorate([
        __param(2, files_1.IFileService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, editorService_1.IEditorService),
        __param(6, jsonEditing_1.IJSONEditingService),
        __param(7, resolverService_1.ITextModelService)
    ], ConfigureWorkspaceRecommendedExtensionsAction);
    let ConfigureWorkspaceFolderRecommendedExtensionsAction = class ConfigureWorkspaceFolderRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
        static { this.ID = 'workbench.extensions.action.configureWorkspaceFolderRecommendedExtensions'; }
        static { this.LABEL = (0, nls_1.localize)('configureWorkspaceFolderRecommendedExtensions', "Configure Recommended Extensions (Workspace Folder)"); }
        constructor(id, label, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService, commandService) {
            super(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
            this.commandService = commandService;
        }
        run() {
            const folderCount = this.contextService.getWorkspace().folders.length;
            const pickFolderPromise = folderCount === 1 ? Promise.resolve(this.contextService.getWorkspace().folders[0]) : this.commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
            return Promise.resolve(pickFolderPromise)
                .then(workspaceFolder => {
                if (workspaceFolder) {
                    return this.openExtensionsFile(workspaceFolder.toResource(workspaceExtensionsConfig_1.EXTENSIONS_CONFIG));
                }
                return null;
            });
        }
    };
    exports.ConfigureWorkspaceFolderRecommendedExtensionsAction = ConfigureWorkspaceFolderRecommendedExtensionsAction;
    exports.ConfigureWorkspaceFolderRecommendedExtensionsAction = ConfigureWorkspaceFolderRecommendedExtensionsAction = __decorate([
        __param(2, files_1.IFileService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, editorService_1.IEditorService),
        __param(6, jsonEditing_1.IJSONEditingService),
        __param(7, resolverService_1.ITextModelService),
        __param(8, commands_1.ICommandService)
    ], ConfigureWorkspaceFolderRecommendedExtensionsAction);
    let ExtensionStatusLabelAction = class ExtensionStatusLabelAction extends actions_1.Action {
        static { ExtensionStatusLabelAction_1 = this; }
        static { this.ENABLED_CLASS = `${ExtensionAction.TEXT_ACTION_CLASS} extension-status-label`; }
        static { this.DISABLED_CLASS = `${ExtensionStatusLabelAction_1.ENABLED_CLASS} hide`; }
        get extension() { return this._extension; }
        set extension(extension) {
            if (!(this._extension && extension && (0, extensionManagementUtil_1.areSameExtensions)(this._extension.identifier, extension.identifier))) {
                // Different extension. Reset
                this.initialStatus = null;
                this.status = null;
                this.enablementState = null;
            }
            this._extension = extension;
            this.update();
        }
        constructor(extensionService, extensionManagementServerService, extensionEnablementService) {
            super('extensions.action.statusLabel', '', ExtensionStatusLabelAction_1.DISABLED_CLASS, false);
            this.extensionService = extensionService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionEnablementService = extensionEnablementService;
            this.initialStatus = null;
            this.status = null;
            this.version = null;
            this.enablementState = null;
            this._extension = null;
        }
        update() {
            const label = this.computeLabel();
            this.label = label || '';
            this.class = label ? ExtensionStatusLabelAction_1.ENABLED_CLASS : ExtensionStatusLabelAction_1.DISABLED_CLASS;
        }
        computeLabel() {
            if (!this.extension) {
                return null;
            }
            const currentStatus = this.status;
            const currentVersion = this.version;
            const currentEnablementState = this.enablementState;
            this.status = this.extension.state;
            this.version = this.extension.version;
            if (this.initialStatus === null) {
                this.initialStatus = this.status;
            }
            this.enablementState = this.extension.enablementState;
            const canAddExtension = () => {
                const runningExtension = this.extensionService.extensions.filter(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))[0];
                if (this.extension.local) {
                    if (runningExtension && this.extension.version === runningExtension.version) {
                        return true;
                    }
                    return this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(this.extension.local));
                }
                return false;
            };
            const canRemoveExtension = () => {
                if (this.extension.local) {
                    if (this.extensionService.extensions.every(e => !((0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier) && this.extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(e))))) {
                        return true;
                    }
                    return this.extensionService.canRemoveExtension((0, extensions_3.toExtensionDescription)(this.extension.local));
                }
                return false;
            };
            if (currentStatus !== null) {
                if (currentStatus === 0 /* ExtensionState.Installing */ && this.status === 1 /* ExtensionState.Installed */) {
                    return canAddExtension() ? this.initialStatus === 1 /* ExtensionState.Installed */ && this.version !== currentVersion ? (0, nls_1.localize)('updated', "Updated") : (0, nls_1.localize)('installed', "Installed") : null;
                }
                if (currentStatus === 2 /* ExtensionState.Uninstalling */ && this.status === 3 /* ExtensionState.Uninstalled */) {
                    this.initialStatus = this.status;
                    return canRemoveExtension() ? (0, nls_1.localize)('uninstalled', "Uninstalled") : null;
                }
            }
            if (currentEnablementState !== null) {
                const currentlyEnabled = this.extensionEnablementService.isEnabledEnablementState(currentEnablementState);
                const enabled = this.extensionEnablementService.isEnabledEnablementState(this.enablementState);
                if (!currentlyEnabled && enabled) {
                    return canAddExtension() ? (0, nls_1.localize)('enabled', "Enabled") : null;
                }
                if (currentlyEnabled && !enabled) {
                    return canRemoveExtension() ? (0, nls_1.localize)('disabled', "Disabled") : null;
                }
            }
            return null;
        }
        run() {
            return Promise.resolve();
        }
    };
    exports.ExtensionStatusLabelAction = ExtensionStatusLabelAction;
    exports.ExtensionStatusLabelAction = ExtensionStatusLabelAction = ExtensionStatusLabelAction_1 = __decorate([
        __param(0, extensions_3.IExtensionService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], ExtensionStatusLabelAction);
    let ToggleSyncExtensionAction = class ToggleSyncExtensionAction extends ExtensionDropDownAction {
        static { ToggleSyncExtensionAction_1 = this; }
        static { this.IGNORED_SYNC_CLASS = `${ExtensionAction.ICON_ACTION_CLASS} extension-sync ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.syncIgnoredIcon)}`; }
        static { this.SYNC_CLASS = `${ToggleSyncExtensionAction_1.ICON_ACTION_CLASS} extension-sync ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.syncEnabledIcon)}`; }
        constructor(configurationService, extensionsWorkbenchService, userDataSyncEnablementService, instantiationService) {
            super('extensions.sync', '', ToggleSyncExtensionAction_1.SYNC_CLASS, false, instantiationService);
            this.configurationService = configurationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredExtensions'))(() => this.update()));
            this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.update()));
            this.update();
        }
        update() {
            this.enabled = !!this.extension && this.userDataSyncEnablementService.isEnabled() && this.extension.state === 1 /* ExtensionState.Installed */;
            if (this.extension) {
                const isIgnored = this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension);
                this.class = isIgnored ? ToggleSyncExtensionAction_1.IGNORED_SYNC_CLASS : ToggleSyncExtensionAction_1.SYNC_CLASS;
                this.tooltip = isIgnored ? (0, nls_1.localize)('ignored', "This extension is ignored during sync") : (0, nls_1.localize)('synced', "This extension is synced");
            }
        }
        async run() {
            return super.run({
                actionGroups: [
                    [
                        new actions_1.Action('extensions.syncignore', this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension) ? (0, nls_1.localize)('sync', "Sync this extension") : (0, nls_1.localize)('do not sync', "Do not sync this extension"), undefined, true, () => this.extensionsWorkbenchService.toggleExtensionIgnoredToSync(this.extension))
                    ]
                ], disposeActionsOnHide: true
            });
        }
    };
    exports.ToggleSyncExtensionAction = ToggleSyncExtensionAction;
    exports.ToggleSyncExtensionAction = ToggleSyncExtensionAction = ToggleSyncExtensionAction_1 = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, userDataSync_1.IUserDataSyncEnablementService),
        __param(3, instantiation_1.IInstantiationService)
    ], ToggleSyncExtensionAction);
    let ExtensionStatusAction = class ExtensionStatusAction extends ExtensionAction {
        static { ExtensionStatusAction_1 = this; }
        static { this.CLASS = `${ExtensionAction.ICON_ACTION_CLASS} extension-status`; }
        get status() { return this._status; }
        constructor(extensionManagementServerService, labelService, commandService, workspaceTrustEnablementService, workspaceTrustService, extensionsWorkbenchService, extensionService, extensionManifestPropertiesService, contextService, productService, workbenchExtensionEnablementService) {
            super('extensions.status', '', `${ExtensionStatusAction_1.CLASS} hide`, false);
            this.extensionManagementServerService = extensionManagementServerService;
            this.labelService = labelService;
            this.commandService = commandService;
            this.workspaceTrustEnablementService = workspaceTrustEnablementService;
            this.workspaceTrustService = workspaceTrustService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionService = extensionService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.contextService = contextService;
            this.productService = productService;
            this.workbenchExtensionEnablementService = workbenchExtensionEnablementService;
            this.updateWhenCounterExtensionChanges = true;
            this._onDidChangeStatus = this._register(new event_1.Emitter());
            this.onDidChangeStatus = this._onDidChangeStatus.event;
            this.updateThrottler = new async_1.Throttler();
            this._register(this.labelService.onDidChangeFormatters(() => this.update(), this));
            this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
            this.update();
        }
        update() {
            this.updateThrottler.queue(() => this.computeAndUpdateStatus());
        }
        async computeAndUpdateStatus() {
            this.updateStatus(undefined, true);
            this.enabled = false;
            if (!this.extension) {
                return;
            }
            if (this.extension.isMalicious) {
                this.updateStatus({ icon: extensionsIcons_1.warningIcon, message: new htmlContent_1.MarkdownString((0, nls_1.localize)('malicious tooltip', "This extension was reported to be problematic.")) }, true);
                return;
            }
            if (this.extension.deprecationInfo) {
                if (this.extension.deprecationInfo.extension) {
                    const link = `[${this.extension.deprecationInfo.extension.displayName}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.deprecationInfo.extension.id]))}`)})`;
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message: new htmlContent_1.MarkdownString((0, nls_1.localize)('deprecated with alternate extension tooltip', "This extension is deprecated. Use the {0} extension instead.", link)) }, true);
                }
                else if (this.extension.deprecationInfo.settings) {
                    const link = `[${(0, nls_1.localize)('settings', "settings")}](${uri_1.URI.parse(`command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify([this.extension.deprecationInfo.settings.map(setting => `@id:${setting}`).join(' ')]))}`)})`;
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message: new htmlContent_1.MarkdownString((0, nls_1.localize)('deprecated with alternate settings tooltip', "This extension is deprecated as this functionality is now built-in to VS Code. Configure these {0} to use this functionality.", link)) }, true);
                }
                else {
                    const message = new htmlContent_1.MarkdownString((0, nls_1.localize)('deprecated tooltip', "This extension is deprecated as it is no longer being maintained."));
                    if (this.extension.deprecationInfo.additionalInfo) {
                        message.appendMarkdown(` ${this.extension.deprecationInfo.additionalInfo}`);
                    }
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message }, true);
                }
                return;
            }
            if (this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.gallery && this.extension.state === 3 /* ExtensionState.Uninstalled */ && !await this.extensionsWorkbenchService.canInstall(this.extension)) {
                if (this.extensionManagementServerService.localExtensionManagementServer || this.extensionManagementServerService.remoteExtensionManagementServer) {
                    const targetPlatform = await (this.extensionManagementServerService.localExtensionManagementServer ? this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getTargetPlatform() : this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform());
                    const message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('incompatible platform', "The '{0}' extension is not available in {1} for {2}.", this.extension.displayName || this.extension.identifier.id, this.productService.nameLong, (0, extensionManagement_1.TargetPlatformToString)(targetPlatform))} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-platform-specific-extensions)`);
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message }, true);
                    return;
                }
                if (this.extensionManagementServerService.webExtensionManagementServer) {
                    const productName = (0, nls_1.localize)('VS Code for Web', "{0} for the Web", this.productService.nameLong);
                    const message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('not web tooltip', "The '{0}' extension is not available in {1}.", this.extension.displayName || this.extension.identifier.id, productName)} [${(0, nls_1.localize)('learn why', "Learn Why")}](https://aka.ms/vscode-web-extensions-guide)`);
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message }, true);
                    return;
                }
            }
            if (!this.extension.local ||
                !this.extension.server ||
                this.extension.state !== 1 /* ExtensionState.Installed */) {
                return;
            }
            // Extension is disabled by environment
            if (this.extension.enablementState === 2 /* EnablementState.DisabledByEnvironment */) {
                this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('disabled by environment', "This extension is disabled by the environment.")) }, true);
                return;
            }
            // Extension is enabled by environment
            if (this.extension.enablementState === 3 /* EnablementState.EnabledByEnvironment */) {
                this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('enabled by environment', "This extension is enabled because it is required in the current environment.")) }, true);
                return;
            }
            // Extension is disabled by virtual workspace
            if (this.extension.enablementState === 4 /* EnablementState.DisabledByVirtualWorkspace */) {
                const details = (0, extensions_2.getWorkspaceSupportTypeMessage)(this.extension.local.manifest.capabilities?.virtualWorkspaces);
                this.updateStatus({ icon: extensionsIcons_1.infoIcon, message: new htmlContent_1.MarkdownString(details ? (0, htmlContent_1.escapeMarkdownSyntaxTokens)(details) : (0, nls_1.localize)('disabled because of virtual workspace', "This extension has been disabled because it does not support virtual workspaces.")) }, true);
                return;
            }
            // Limited support in Virtual Workspace
            if ((0, virtualWorkspace_1.isVirtualWorkspace)(this.contextService.getWorkspace())) {
                const virtualSupportType = this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(this.extension.local.manifest);
                const details = (0, extensions_2.getWorkspaceSupportTypeMessage)(this.extension.local.manifest.capabilities?.virtualWorkspaces);
                if (virtualSupportType === 'limited' || details) {
                    this.updateStatus({ icon: extensionsIcons_1.warningIcon, message: new htmlContent_1.MarkdownString(details ? (0, htmlContent_1.escapeMarkdownSyntaxTokens)(details) : (0, nls_1.localize)('extension limited because of virtual workspace', "This extension has limited features because the current workspace is virtual.")) }, true);
                    return;
                }
            }
            // Extension is disabled by untrusted workspace
            if (this.extension.enablementState === 0 /* EnablementState.DisabledByTrustRequirement */ ||
                // All disabled dependencies of the extension are disabled by untrusted workspace
                (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.workbenchExtensionEnablementService.getDependenciesEnablementStates(this.extension.local).every(([, enablementState]) => this.workbenchExtensionEnablementService.isEnabledEnablementState(enablementState) || enablementState === 0 /* EnablementState.DisabledByTrustRequirement */))) {
                this.enabled = true;
                const untrustedDetails = (0, extensions_2.getWorkspaceSupportTypeMessage)(this.extension.local.manifest.capabilities?.untrustedWorkspaces);
                this.updateStatus({ icon: extensionsIcons_1.trustIcon, message: new htmlContent_1.MarkdownString(untrustedDetails ? (0, htmlContent_1.escapeMarkdownSyntaxTokens)(untrustedDetails) : (0, nls_1.localize)('extension disabled because of trust requirement', "This extension has been disabled because the current workspace is not trusted.")) }, true);
                return;
            }
            // Limited support in Untrusted Workspace
            if (this.workspaceTrustEnablementService.isWorkspaceTrustEnabled() && !this.workspaceTrustService.isWorkspaceTrusted()) {
                const untrustedSupportType = this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(this.extension.local.manifest);
                const untrustedDetails = (0, extensions_2.getWorkspaceSupportTypeMessage)(this.extension.local.manifest.capabilities?.untrustedWorkspaces);
                if (untrustedSupportType === 'limited' || untrustedDetails) {
                    this.enabled = true;
                    this.updateStatus({ icon: extensionsIcons_1.trustIcon, message: new htmlContent_1.MarkdownString(untrustedDetails ? (0, htmlContent_1.escapeMarkdownSyntaxTokens)(untrustedDetails) : (0, nls_1.localize)('extension limited because of trust requirement', "This extension has limited features because the current workspace is not trusted.")) }, true);
                    return;
                }
            }
            // Extension is disabled by extension kind
            if (this.extension.enablementState === 1 /* EnablementState.DisabledByExtensionKind */) {
                if (!this.extensionsWorkbenchService.installed.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server !== this.extension.server)) {
                    let message;
                    // Extension on Local Server
                    if (this.extensionManagementServerService.localExtensionManagementServer === this.extension.server) {
                        if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                                message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('Install in remote server to enable', "This extension is disabled in this workspace because it is defined to run in the Remote Extension Host. Please install the extension in '{0}' to enable.", this.extensionManagementServerService.remoteExtensionManagementServer.label)} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                            }
                        }
                    }
                    // Extension on Remote Server
                    else if (this.extensionManagementServerService.remoteExtensionManagementServer === this.extension.server) {
                        if (this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                            if (this.extensionManagementServerService.localExtensionManagementServer) {
                                message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('Install in local server to enable', "This extension is disabled in this workspace because it is defined to run in the Local Extension Host. Please install the extension locally to enable.", this.extensionManagementServerService.remoteExtensionManagementServer.label)} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                            }
                            else if (platform_1.isWeb) {
                                message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('Defined to run in desktop', "This extension is disabled because it is defined to run only in {0} for the Desktop.", this.productService.nameLong)} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                            }
                        }
                    }
                    // Extension on Web Server
                    else if (this.extensionManagementServerService.webExtensionManagementServer === this.extension.server) {
                        message = new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('Cannot be enabled', "This extension is disabled because it is not supported in {0} for the Web.", this.productService.nameLong)} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                    }
                    if (message) {
                        this.updateStatus({ icon: extensionsIcons_1.warningIcon, message }, true);
                    }
                    return;
                }
            }
            // Remote Workspace
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                if ((0, extensions_2.isLanguagePackExtension)(this.extension.local.manifest)) {
                    if (!this.extensionsWorkbenchService.installed.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server !== this.extension.server)) {
                        const message = this.extension.server === this.extensionManagementServerService.localExtensionManagementServer
                            ? new htmlContent_1.MarkdownString((0, nls_1.localize)('Install language pack also in remote server', "Install the language pack extension on '{0}' to enable it there also.", this.extensionManagementServerService.remoteExtensionManagementServer.label))
                            : new htmlContent_1.MarkdownString((0, nls_1.localize)('Install language pack also locally', "Install the language pack extension locally to enable it there also."));
                        this.updateStatus({ icon: extensionsIcons_1.infoIcon, message }, true);
                    }
                    return;
                }
                const runningExtension = this.extensionService.extensions.filter(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))[0];
                const runningExtensionServer = runningExtension ? this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension)) : null;
                if (this.extension.server === this.extensionManagementServerService.localExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer) {
                    if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                        this.updateStatus({ icon: extensionsIcons_1.infoIcon, message: new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('enabled remotely', "This extension is enabled in the Remote Extension Host because it prefers to run there.")} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                    }
                    return;
                }
                if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer) {
                    if (this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                        this.updateStatus({ icon: extensionsIcons_1.infoIcon, message: new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('enabled locally', "This extension is enabled in the Local Extension Host because it prefers to run there.")} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                    }
                    return;
                }
                if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.webExtensionManagementServer) {
                    if (this.extensionManifestPropertiesService.canExecuteOnWeb(this.extension.local.manifest)) {
                        this.updateStatus({ icon: extensionsIcons_1.infoIcon, message: new htmlContent_1.MarkdownString(`${(0, nls_1.localize)('enabled in web worker', "This extension is enabled in the Web Worker Extension Host because it prefers to run there.")} [${(0, nls_1.localize)('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                    }
                    return;
                }
            }
            // Extension is disabled by its dependency
            if (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */) {
                this.updateStatus({ icon: extensionsIcons_1.warningIcon, message: new htmlContent_1.MarkdownString((0, nls_1.localize)('extension disabled because of dependency', "This extension has been disabled because it depends on an extension that is disabled.")) }, true);
                return;
            }
            const isEnabled = this.workbenchExtensionEnablementService.isEnabled(this.extension.local);
            const isRunning = this.extensionService.extensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier));
            if (isEnabled && isRunning) {
                if (this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */) {
                    this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('workspace enabled', "This extension is enabled for this workspace by the user.")) }, true);
                    return;
                }
                if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                    if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                        this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('extension enabled on remote', "Extension is enabled on '{0}'", this.extension.server.label)) }, true);
                        return;
                    }
                }
                if (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */) {
                    this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('globally enabled', "This extension is enabled globally.")) }, true);
                    return;
                }
            }
            if (!isEnabled && !isRunning) {
                if (this.extension.enablementState === 6 /* EnablementState.DisabledGlobally */) {
                    this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('globally disabled', "This extension is disabled globally by the user.")) }, true);
                    return;
                }
                if (this.extension.enablementState === 7 /* EnablementState.DisabledWorkspace */) {
                    this.updateStatus({ message: new htmlContent_1.MarkdownString((0, nls_1.localize)('workspace disabled', "This extension is disabled for this workspace by the user.")) }, true);
                    return;
                }
            }
            if (isEnabled && !isRunning && !this.extension.local.isValid) {
                const errors = this.extension.local.validations.filter(([severity]) => severity === notification_1.Severity.Error).map(([, message]) => message);
                this.updateStatus({ icon: extensionsIcons_1.errorIcon, message: new htmlContent_1.MarkdownString(errors.join(' ').trim()) }, true);
            }
        }
        updateStatus(status, updateClass) {
            if (this._status === status) {
                return;
            }
            if (this._status && status && this._status.message === status.message && this._status.icon?.id === status.icon?.id) {
                return;
            }
            this._status = status;
            if (updateClass) {
                if (this._status?.icon === extensionsIcons_1.errorIcon) {
                    this.class = `${ExtensionStatusAction_1.CLASS} extension-status-error ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.errorIcon)}`;
                }
                else if (this._status?.icon === extensionsIcons_1.warningIcon) {
                    this.class = `${ExtensionStatusAction_1.CLASS} extension-status-warning ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.warningIcon)}`;
                }
                else if (this._status?.icon === extensionsIcons_1.infoIcon) {
                    this.class = `${ExtensionStatusAction_1.CLASS} extension-status-info ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.infoIcon)}`;
                }
                else if (this._status?.icon === extensionsIcons_1.trustIcon) {
                    this.class = `${ExtensionStatusAction_1.CLASS} ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.trustIcon)}`;
                }
                else {
                    this.class = `${ExtensionStatusAction_1.CLASS} hide`;
                }
            }
            this._onDidChangeStatus.fire();
        }
        async run() {
            if (this._status?.icon === extensionsIcons_1.trustIcon) {
                return this.commandService.executeCommand('workbench.trust.manage');
            }
        }
    };
    exports.ExtensionStatusAction = ExtensionStatusAction;
    exports.ExtensionStatusAction = ExtensionStatusAction = ExtensionStatusAction_1 = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, label_1.ILabelService),
        __param(2, commands_1.ICommandService),
        __param(3, workspaceTrust_1.IWorkspaceTrustEnablementService),
        __param(4, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(5, extensions_1.IExtensionsWorkbenchService),
        __param(6, extensions_3.IExtensionService),
        __param(7, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, productService_1.IProductService),
        __param(10, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], ExtensionStatusAction);
    let ReinstallAction = class ReinstallAction extends actions_1.Action {
        static { ReinstallAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.reinstall'; }
        static { this.LABEL = (0, nls_1.localize)('reinstall', "Reinstall Extension..."); }
        constructor(id = ReinstallAction_1.ID, label = ReinstallAction_1.LABEL, extensionsWorkbenchService, extensionManagementServerService, quickInputService, notificationService, hostService, instantiationService, extensionService) {
            super(id, label);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.hostService = hostService;
            this.instantiationService = instantiationService;
            this.extensionService = extensionService;
        }
        get enabled() {
            return this.extensionsWorkbenchService.local.filter(l => !l.isBuiltin && l.local).length > 0;
        }
        run() {
            return this.quickInputService.pick(this.getEntries(), { placeHolder: (0, nls_1.localize)('selectExtensionToReinstall', "Select Extension to Reinstall") })
                .then(pick => pick && this.reinstallExtension(pick.extension));
        }
        getEntries() {
            return this.extensionsWorkbenchService.queryLocal()
                .then(local => {
                const entries = local
                    .filter(extension => !extension.isBuiltin && extension.server !== this.extensionManagementServerService.webExtensionManagementServer)
                    .map(extension => {
                    return {
                        id: extension.identifier.id,
                        label: extension.displayName,
                        description: extension.identifier.id,
                        extension,
                    };
                });
                return entries;
            });
        }
        reinstallExtension(extension) {
            return this.instantiationService.createInstance(SearchExtensionsAction, '@installed ').run()
                .then(() => {
                return this.extensionsWorkbenchService.reinstall(extension)
                    .then(extension => {
                    const requireReload = !(extension.local && this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local)));
                    const message = requireReload ? (0, nls_1.localize)('ReinstallAction.successReload', "Please reload Visual Studio Code to complete reinstalling the extension {0}.", extension.identifier.id)
                        : (0, nls_1.localize)('ReinstallAction.success', "Reinstalling the extension {0} is completed.", extension.identifier.id);
                    const actions = requireReload ? [{
                            label: (0, nls_1.localize)('InstallVSIXAction.reloadNow', "Reload Now"),
                            run: () => this.hostService.reload()
                        }] : [];
                    this.notificationService.prompt(notification_1.Severity.Info, message, actions, { sticky: true });
                }, error => this.notificationService.error(error));
            });
        }
    };
    exports.ReinstallAction = ReinstallAction;
    exports.ReinstallAction = ReinstallAction = ReinstallAction_1 = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, extensionManagement_2.IExtensionManagementServerService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, notification_1.INotificationService),
        __param(6, host_1.IHostService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, extensions_3.IExtensionService)
    ], ReinstallAction);
    let InstallSpecificVersionOfExtensionAction = class InstallSpecificVersionOfExtensionAction extends actions_1.Action {
        static { InstallSpecificVersionOfExtensionAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.install.specificVersion'; }
        static { this.LABEL = (0, nls_1.localize)('install previous version', "Install Specific Version of Extension..."); }
        constructor(id = InstallSpecificVersionOfExtensionAction_1.ID, label = InstallSpecificVersionOfExtensionAction_1.LABEL, extensionsWorkbenchService, quickInputService, instantiationService, extensionEnablementService) {
            super(id, label);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.extensionEnablementService = extensionEnablementService;
        }
        get enabled() {
            return this.extensionsWorkbenchService.local.some(l => this.isEnabled(l));
        }
        async run() {
            const extensionPick = await this.quickInputService.pick(this.getExtensionEntries(), { placeHolder: (0, nls_1.localize)('selectExtension', "Select Extension"), matchOnDetail: true });
            if (extensionPick && extensionPick.extension) {
                const action = this.instantiationService.createInstance(InstallAnotherVersionAction);
                action.extension = extensionPick.extension;
                await action.run();
                await this.instantiationService.createInstance(SearchExtensionsAction, extensionPick.extension.identifier.id).run();
            }
        }
        isEnabled(extension) {
            const action = this.instantiationService.createInstance(InstallAnotherVersionAction);
            action.extension = extension;
            return action.enabled && !!extension.local && this.extensionEnablementService.isEnabled(extension.local);
        }
        async getExtensionEntries() {
            const installed = await this.extensionsWorkbenchService.queryLocal();
            const entries = [];
            for (const extension of installed) {
                if (this.isEnabled(extension)) {
                    entries.push({
                        id: extension.identifier.id,
                        label: extension.displayName || extension.identifier.id,
                        description: extension.identifier.id,
                        extension,
                    });
                }
            }
            return entries.sort((e1, e2) => e1.extension.displayName.localeCompare(e2.extension.displayName));
        }
    };
    exports.InstallSpecificVersionOfExtensionAction = InstallSpecificVersionOfExtensionAction;
    exports.InstallSpecificVersionOfExtensionAction = InstallSpecificVersionOfExtensionAction = InstallSpecificVersionOfExtensionAction_1 = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], InstallSpecificVersionOfExtensionAction);
    let AbstractInstallExtensionsInServerAction = class AbstractInstallExtensionsInServerAction extends actions_1.Action {
        constructor(id, extensionsWorkbenchService, quickInputService, notificationService, progressService) {
            super(id);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.progressService = progressService;
            this.extensions = undefined;
            this.update();
            this.extensionsWorkbenchService.queryLocal().then(() => this.updateExtensions());
            this._register(this.extensionsWorkbenchService.onChange(() => {
                if (this.extensions) {
                    this.updateExtensions();
                }
            }));
        }
        updateExtensions() {
            this.extensions = this.extensionsWorkbenchService.local;
            this.update();
        }
        update() {
            this.enabled = !!this.extensions && this.getExtensionsToInstall(this.extensions).length > 0;
            this.tooltip = this.label;
        }
        async run() {
            return this.selectAndInstallExtensions();
        }
        async queryExtensionsToInstall() {
            const local = await this.extensionsWorkbenchService.queryLocal();
            return this.getExtensionsToInstall(local);
        }
        async selectAndInstallExtensions() {
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.busy = true;
            const disposable = quickPick.onDidAccept(() => {
                disposable.dispose();
                quickPick.hide();
                quickPick.dispose();
                this.onDidAccept(quickPick.selectedItems);
            });
            quickPick.show();
            const localExtensionsToInstall = await this.queryExtensionsToInstall();
            quickPick.busy = false;
            if (localExtensionsToInstall.length) {
                quickPick.title = this.getQuickPickTitle();
                quickPick.placeholder = (0, nls_1.localize)('select extensions to install', "Select extensions to install");
                quickPick.canSelectMany = true;
                localExtensionsToInstall.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
                quickPick.items = localExtensionsToInstall.map(extension => ({ extension, label: extension.displayName, description: extension.version }));
            }
            else {
                quickPick.hide();
                quickPick.dispose();
                this.notificationService.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)('no local extensions', "There are no extensions to install.")
                });
            }
        }
        async onDidAccept(selectedItems) {
            if (selectedItems.length) {
                const localExtensionsToInstall = selectedItems.filter(r => !!r.extension).map(r => r.extension);
                if (localExtensionsToInstall.length) {
                    await this.progressService.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: (0, nls_1.localize)('installing extensions', "Installing Extensions...")
                    }, () => this.installExtensions(localExtensionsToInstall));
                    this.notificationService.info((0, nls_1.localize)('finished installing', "Successfully installed extensions."));
                }
            }
        }
    };
    exports.AbstractInstallExtensionsInServerAction = AbstractInstallExtensionsInServerAction;
    exports.AbstractInstallExtensionsInServerAction = AbstractInstallExtensionsInServerAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, notification_1.INotificationService),
        __param(4, progress_1.IProgressService)
    ], AbstractInstallExtensionsInServerAction);
    let InstallLocalExtensionsInRemoteAction = class InstallLocalExtensionsInRemoteAction extends AbstractInstallExtensionsInServerAction {
        constructor(extensionsWorkbenchService, quickInputService, progressService, notificationService, extensionManagementServerService, extensionGalleryService, instantiationService, fileService, logService) {
            super('workbench.extensions.actions.installLocalExtensionsInRemote', extensionsWorkbenchService, quickInputService, notificationService, progressService);
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionGalleryService = extensionGalleryService;
            this.instantiationService = instantiationService;
            this.fileService = fileService;
            this.logService = logService;
        }
        get label() {
            if (this.extensionManagementServerService && this.extensionManagementServerService.remoteExtensionManagementServer) {
                return (0, nls_1.localize)('select and install local extensions', "Install Local Extensions in '{0}'...", this.extensionManagementServerService.remoteExtensionManagementServer.label);
            }
            return '';
        }
        getQuickPickTitle() {
            return (0, nls_1.localize)('install local extensions title', "Install Local Extensions in '{0}'", this.extensionManagementServerService.remoteExtensionManagementServer.label);
        }
        getExtensionsToInstall(local) {
            return local.filter(extension => {
                const action = this.instantiationService.createInstance(RemoteInstallAction, true);
                action.extension = extension;
                return action.enabled;
            });
        }
        async installExtensions(localExtensionsToInstall) {
            const galleryExtensions = [];
            const vsixs = [];
            const targetPlatform = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform();
            await async_1.Promises.settled(localExtensionsToInstall.map(async (extension) => {
                if (this.extensionGalleryService.isEnabled()) {
                    const gallery = (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease: !!extension.local?.preRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0];
                    if (gallery) {
                        galleryExtensions.push(gallery);
                        return;
                    }
                }
                const vsix = await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.zip(extension.local);
                vsixs.push(vsix);
            }));
            await async_1.Promises.settled(galleryExtensions.map(gallery => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
            try {
                await async_1.Promises.settled(vsixs.map(vsix => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.install(vsix)));
            }
            finally {
                try {
                    await Promise.allSettled(vsixs.map(vsix => this.fileService.del(vsix)));
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
    };
    exports.InstallLocalExtensionsInRemoteAction = InstallLocalExtensionsInRemoteAction;
    exports.InstallLocalExtensionsInRemoteAction = InstallLocalExtensionsInRemoteAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, quickInput_1.IQuickInputService),
        __param(2, progress_1.IProgressService),
        __param(3, notification_1.INotificationService),
        __param(4, extensionManagement_2.IExtensionManagementServerService),
        __param(5, extensionManagement_1.IExtensionGalleryService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, files_1.IFileService),
        __param(8, log_1.ILogService)
    ], InstallLocalExtensionsInRemoteAction);
    let InstallRemoteExtensionsInLocalAction = class InstallRemoteExtensionsInLocalAction extends AbstractInstallExtensionsInServerAction {
        constructor(id, extensionsWorkbenchService, quickInputService, progressService, notificationService, extensionManagementServerService, extensionGalleryService, fileService, logService) {
            super(id, extensionsWorkbenchService, quickInputService, notificationService, progressService);
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionGalleryService = extensionGalleryService;
            this.fileService = fileService;
            this.logService = logService;
        }
        get label() {
            return (0, nls_1.localize)('select and install remote extensions', "Install Remote Extensions Locally...");
        }
        getQuickPickTitle() {
            return (0, nls_1.localize)('install remote extensions', "Install Remote Extensions Locally");
        }
        getExtensionsToInstall(local) {
            return local.filter(extension => extension.type === 1 /* ExtensionType.User */ && extension.server !== this.extensionManagementServerService.localExtensionManagementServer
                && !this.extensionsWorkbenchService.installed.some(e => e.server === this.extensionManagementServerService.localExtensionManagementServer && (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier)));
        }
        async installExtensions(extensions) {
            const galleryExtensions = [];
            const vsixs = [];
            const targetPlatform = await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getTargetPlatform();
            await async_1.Promises.settled(extensions.map(async (extension) => {
                if (this.extensionGalleryService.isEnabled()) {
                    const gallery = (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease: !!extension.local?.preRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0];
                    if (gallery) {
                        galleryExtensions.push(gallery);
                        return;
                    }
                }
                const vsix = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.zip(extension.local);
                vsixs.push(vsix);
            }));
            await async_1.Promises.settled(galleryExtensions.map(gallery => this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
            try {
                await async_1.Promises.settled(vsixs.map(vsix => this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.install(vsix)));
            }
            finally {
                try {
                    await Promise.allSettled(vsixs.map(vsix => this.fileService.del(vsix)));
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
    };
    exports.InstallRemoteExtensionsInLocalAction = InstallRemoteExtensionsInLocalAction;
    exports.InstallRemoteExtensionsInLocalAction = InstallRemoteExtensionsInLocalAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, progress_1.IProgressService),
        __param(4, notification_1.INotificationService),
        __param(5, extensionManagement_2.IExtensionManagementServerService),
        __param(6, extensionManagement_1.IExtensionGalleryService),
        __param(7, files_1.IFileService),
        __param(8, log_1.ILogService)
    ], InstallRemoteExtensionsInLocalAction);
    commands_1.CommandsRegistry.registerCommand('workbench.extensions.action.showExtensionsForLanguage', function (accessor, fileExtension) {
        const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
        return paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
            .then(viewlet => viewlet?.getViewPaneContainer())
            .then(viewlet => {
            viewlet.search(`ext:${fileExtension.replace(/^\./, '')}`);
            viewlet.focus();
        });
    });
    commands_1.CommandsRegistry.registerCommand('workbench.extensions.action.showExtensionsWithIds', function (accessor, extensionIds) {
        const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
        return paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
            .then(viewlet => viewlet?.getViewPaneContainer())
            .then(viewlet => {
            const query = extensionIds
                .map(id => `@id:${id}`)
                .join(' ');
            viewlet.search(query);
            viewlet.focus();
        });
    });
    (0, colorRegistry_1.registerColor)('extensionButton.background', {
        dark: colorRegistry_1.buttonBackground,
        light: colorRegistry_1.buttonBackground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonBackground', "Button background color for extension actions."));
    (0, colorRegistry_1.registerColor)('extensionButton.foreground', {
        dark: colorRegistry_1.buttonForeground,
        light: colorRegistry_1.buttonForeground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonForeground', "Button foreground color for extension actions."));
    (0, colorRegistry_1.registerColor)('extensionButton.hoverBackground', {
        dark: colorRegistry_1.buttonHoverBackground,
        light: colorRegistry_1.buttonHoverBackground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonHoverBackground', "Button background hover color for extension actions."));
    (0, colorRegistry_1.registerColor)('extensionButton.separator', {
        dark: colorRegistry_1.buttonSeparator,
        light: colorRegistry_1.buttonSeparator,
        hcDark: colorRegistry_1.buttonSeparator,
        hcLight: colorRegistry_1.buttonSeparator
    }, (0, nls_1.localize)('extensionButtonSeparator', "Button separator color for extension actions"));
    exports.extensionButtonProminentBackground = (0, colorRegistry_1.registerColor)('extensionButton.prominentBackground', {
        dark: colorRegistry_1.buttonBackground,
        light: colorRegistry_1.buttonBackground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonProminentBackground', "Button background color for extension actions that stand out (e.g. install button)."));
    (0, colorRegistry_1.registerColor)('extensionButton.prominentForeground', {
        dark: colorRegistry_1.buttonForeground,
        light: colorRegistry_1.buttonForeground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonProminentForeground', "Button foreground color for extension actions that stand out (e.g. install button)."));
    (0, colorRegistry_1.registerColor)('extensionButton.prominentHoverBackground', {
        dark: colorRegistry_1.buttonHoverBackground,
        light: colorRegistry_1.buttonHoverBackground,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('extensionButtonProminentHoverBackground', "Button background hover color for extension actions that stand out (e.g. install button)."));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const errorColor = theme.getColor(colorRegistry_1.editorErrorForeground);
        if (errorColor) {
            collector.addRule(`.extension-editor .header .actions-status-container > .status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.errorIcon)} { color: ${errorColor}; }`);
            collector.addRule(`.extension-editor .body .subcontent .runtime-status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.errorIcon)} { color: ${errorColor}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.errorIcon)} { color: ${errorColor}; }`);
        }
        const warningColor = theme.getColor(colorRegistry_1.editorWarningForeground);
        if (warningColor) {
            collector.addRule(`.extension-editor .header .actions-status-container > .status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.warningIcon)} { color: ${warningColor}; }`);
            collector.addRule(`.extension-editor .body .subcontent .runtime-status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.warningIcon)} { color: ${warningColor}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.warningIcon)} { color: ${warningColor}; }`);
        }
        const infoColor = theme.getColor(colorRegistry_1.editorInfoForeground);
        if (infoColor) {
            collector.addRule(`.extension-editor .header .actions-status-container > .status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.infoIcon)} { color: ${infoColor}; }`);
            collector.addRule(`.extension-editor .body .subcontent .runtime-status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.infoIcon)} { color: ${infoColor}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.infoIcon)} { color: ${infoColor}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvYnJvd3Nlci9leHRlbnNpb25zQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdUV6RixJQUFNLG1DQUFtQyxHQUF6QyxNQUFNLG1DQUFvQyxTQUFRLGdCQUFNO1FBRTlELFlBQ2tCLFNBQXFCLEVBQ3JCLE9BQWUsRUFDZixnQkFBa0MsRUFDbEMsS0FBWSxFQUNLLGNBQStCLEVBQ2hDLGFBQTZCLEVBQ3ZCLG1CQUF5QyxFQUMvQyxhQUE2QixFQUM1QixjQUErQixFQUNuQyxVQUF1QixFQUNELGdDQUFtRSxFQUMvRSxvQkFBMkMsRUFDeEMsY0FBd0MsRUFDN0Isa0NBQXVFO1lBRTdILEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1lBZmhDLGNBQVMsR0FBVCxTQUFTLENBQVk7WUFDckIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDbEMsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUNLLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNoQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdkIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUMvQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDNUIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ25DLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDRCxxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQW1DO1lBQy9FLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDeEMsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQzdCLHVDQUFrQyxHQUFsQyxrQ0FBa0MsQ0FBcUM7UUFHOUgsQ0FBQztRQUVRLEtB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